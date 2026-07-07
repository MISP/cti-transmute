# website/web/conversions/conversions.py
import ipaddress
import json
import re
import uuid as uuid_mod
from datetime import datetime, timezone
from urllib.parse import urlparse

import requests
from flask import Blueprint, abort, flash, jsonify, redirect, render_template, request, url_for
from flask_login import current_user, login_required
from pydantic import ValidationError
from pymisp import MISPEvent, MISPObject
from sqlalchemy import func

from cti_transmute.converters.misp_to_stix import MispToStixParams
from cti_transmute.converters.stix_to_misp import StixToMispParams
from cti_transmute.exceptions import ConversionError, InvalidParameters, InvalidPayload, UnknownConverter
from website.db_class.db import Comment as CommentModel
from website.db_class.db import Conversion, ConversionFavorite, db
from website.db_class.db import Tag as TagModel
from website.lib.conversions import (
    accept_history, assert_can_refresh, refresh_conversion, reject_history,
    submit_conversion)
from website.lib.exceptions import PermissionDenied, PersistenceFailed
from website.lib.params import build_params, param_error
from website.repos import conversions as conv_repo
from website.web.conversions.conversions_form import editConversionForm, mispToStixParamForm, stixToMispParamForm
from website.web.utils import (
    extract_name_from_misp_json, extract_tag_names_from_misp_json,
    form_to_dict, parse_stix_reports)

from ..account import account_core as AccountModel
from ..conversions import conversions_core as ConversionModel
from ..evaluate import evaluate_core as EvalModel
from ..tags import tags_core as TagsModel


def _validate_misp_url(misp_url: str) -> str | None:
    """Return an error string if the URL is invalid/unsafe, None if OK."""
    try:
        parsed = urlparse(misp_url)
    except Exception:
        return "Invalid URL"
    if parsed.scheme != "https":
        return "MISP URL must use HTTPS"
    hostname = parsed.hostname
    if not hostname:
        return "Invalid MISP URL (missing host)"
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
            return "Private/loopback/reserved IP addresses are not allowed"
    except ValueError:
        pass  # it's a domain name — OK
    return None


def _conversion_error_message(exc) -> str:
    """Map a ConversionError to a human-readable flash message."""
    if isinstance(exc, InvalidPayload):
        return f"Invalid input: {exc}"
    if isinstance(exc, InvalidParameters):
        return f"Invalid parameters: {exc}"
    if isinstance(exc, UnknownConverter):
        return f"Unsupported conversion: {exc}"
    if isinstance(exc, PersistenceFailed):
        return "The conversion succeeded but could not be saved. Please try again."
    return f"Conversion failed: {exc}"


def _status_for_conversion_error(exc: ConversionError) -> int:
    """Map a ConversionError to an HTTP status for the fetch/JSON response.

    Mirrors the API resource's mapping: a bad payload is 400, an unknown
    converter 404, a persistence failure 500, and a library failure 422.
    """
    if isinstance(exc, (InvalidPayload, InvalidParameters)):
        return 400
    if isinstance(exc, UnknownConverter):
        return 404
    if isinstance(exc, PersistenceFailed):
        return 500
    return 422


def _manual_tag_ids(raw) -> list[int]:
    """Normalise submitted tag ids to a list of ints.

    Accepts a JSON list or the old comma-separated hidden-input string, keeping
    only the digit entries — the same lenient parse the classic form used.
    """
    if raw is None:
        return []
    if isinstance(raw, str):
        raw = raw.split(",")
    return [int(str(i).strip()) for i in raw if str(i).strip().isdigit()]


def _stix_auto_meta(payload: str, body: dict, params) -> tuple[str, str]:
    """Derive the STIX→MISP Conversion name/description from the body or payload."""
    parsed = parse_stix_reports(payload)
    parsed_name, parsed_description = parsed[0] if parsed else (None, None)
    name = (
        (body.get("name") or "").strip()
        or (parsed_name.strip() if parsed_name else None)
        or "STIX Conversion"
    )
    description = (
        (body.get("description") or "").strip()
        or (parsed_description.strip() if parsed_description else None)
        or "STIX to MISP conversion"
    )
    return name, description


def _misp_auto_meta(payload: str, body: dict, params) -> tuple[str | None, str]:
    """Derive the MISP→STIX Conversion name/description from the body or payload.

    A ``None`` name lets `submit_conversion` apply its timestamp default.
    """
    auto_name = extract_name_from_misp_json(payload)
    name = (body.get("name") or "").strip() or auto_name or None
    version = getattr(params, "version", "2.1")
    if (body.get("description") or "").strip():
        description = body["description"].strip()
    elif auto_name:
        description = f"MISP to STIX conversion, version {version} - {auto_name}"
    else:
        description = f"MISP to STIX conversion, version {version}"
    return name, description


def _submit_via_json(source: str, target: str, params_class, auto_meta):
    """Handle a fetch/JSON conversion submission.

    Reads the payload and the fixed envelope (name/description/public/tags) from
    the JSON body, validates the schema-driven params with Pydantic - a shape
    violation returns the shared ``{error, fields}`` 400 the API also returns
    then runs and persists via `submit_conversion`. On success it flashes and
    returns a small navigation envelope the client redirects to.
    """
    body = request.get_json(silent=True) or {}
    payload = body.get("payload")
    if not payload or not str(payload).strip():
        return jsonify({"error": "No content provided"}), 400
    try:
        json.loads(payload)
    except (TypeError, json.JSONDecodeError):
        return jsonify({"error": "Content is not valid JSON"}), 400

    try:
        params = build_params(params_class, body.get("params") or {})
    except ValidationError as exc:
        error_body, status = param_error(exc)
        return jsonify(error_body), status

    name, description = auto_meta(payload, body, params)
    public = bool(body.get("public", True))
    user = None if current_user.is_anonymous() else current_user
    try:
        conversion = submit_conversion(
            user, source, target, payload=payload, params=params,
            name=name, description=description, public=public,
        )
    except ConversionError as exc:
        return (
            jsonify({"error": _conversion_error_message(exc)}),
            _status_for_conversion_error(exc),
        )

    if not current_user.is_anonymous():
        tag_ids = _manual_tag_ids(body.get("tag_ids"))
        if tag_ids:
            TagsModel.save_conversion_tags(conversion.id, tag_ids, current_user.id)

    flash(f"Converted to {target.upper()} successfully!", "success")
    return jsonify({
        "url": url_for("conversions.detail", id=conversion.id),
        "id": conversion.id,
        "uuid": conversion.uuid,
    }), 200


conversions_blueprint = Blueprint(
    "conversions",
    __name__,
    template_folder="templates",
    static_folder="static"
)

# This shim is mounted at /convert and 301s every old URL to its new equivalent,
# preserving the sub-path and query string, so existing links survive a release.
legacy_convert_blueprint = Blueprint("legacy_convert", __name__)


@legacy_convert_blueprint.route("/", defaults={"rest": ""})
@legacy_convert_blueprint.route("/<path:rest>")
def redirect_to_conversions(rest):
    dest = "/conversions/" + rest if rest else "/conversions"
    query = request.query_string.decode()
    if query:
        dest += "?" + query
    return redirect(dest, code=301)


@conversions_blueprint.route("/misp_to_stix", methods=['GET', 'POST'])
def misp_to_stix():
    """MISP → STIX conversion page.

    GET renders the page; its param controls are drawn client-side from the
    Converter's Parameter schema. POST is a fetch/JSON submission handled by
    `_submit_via_json`.
    """
    if request.method == 'POST':
        return _submit_via_json("misp", "stix", MispToStixParams, _misp_auto_meta)
    return render_template("conversions/misp_to_stix.html")


@conversions_blueprint.route("/fetch_misp_event", methods=['POST'])
def fetch_misp_event():
    """Fetch one or more MISP events via restSearch.
    Accepts event_ids (list) or event_id (string). Supports optional restSearch params.
    Returns {"content": json_string, "count": N, "event_ids": [...]}
    """
    data = request.get_json(silent=True) or {}
    misp_url = data.get("misp_url", "").strip().rstrip("/")
    api_key  = data.get("api_key",  "").strip()

    # Accept event_ids (list) OR event_id (single string) for backward compat
    event_ids = data.get("event_ids")
    if event_ids is None:
        single = str(data.get("event_id", "")).strip()
        if not single.isdigit():
            return jsonify({"error": "Event ID must be a positive integer"}), 400
        event_ids = [single]
    else:
        if not isinstance(event_ids, list) or not event_ids:
            return jsonify({"error": "event_ids must be a non-empty list"}), 400
        for eid in event_ids:
            if not str(eid).strip().isdigit():
                return jsonify({"error": f"Invalid event ID: {eid}"}), 400
        event_ids = [str(e).strip() for e in event_ids]

    if not api_key:
        return jsonify({"error": "API key is required"}), 400

    url_error = _validate_misp_url(misp_url)
    if url_error:
        return jsonify({"error": url_error}), 400

    OPTIONAL_PARAMS = [
        "page", "limit", "value", "type", "category", "org", "tags", "date",
        "last", "withAttachments", "uuid", "publish_timestamp", "timestamp",
        "attribute_timestamp", "enforceWarninglist", "to_ids", "deleted",
        "includeEventUuid", "includeEventTags", "event_timestamp",
        "threat_level_id", "eventinfo", "sharinggroup", "includeProposals",
        "includeDecayScore", "includeFullModel", "decayingModel",
        "excludeDecayed", "score", "first_seen", "last_seen",
    ]
    body: dict = {
        "returnFormat": "json",
        "eventid": event_ids if len(event_ids) > 1 else event_ids[0],
    }
    for param in OPTIONAL_PARAMS:
        if param in data and data[param] not in (None, "", []):
            body[param] = data[param]

    fetch_url = f"{misp_url}/events/restSearch"
    try:
        resp = requests.post(
            fetch_url,
            headers={
                "Authorization": api_key,
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            json=body,
            timeout=30,
            verify=True,
            allow_redirects=False,
        )
    except requests.exceptions.SSLError:
        return jsonify({"error": "SSL certificate verification failed for that MISP instance"}), 400
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Could not reach the MISP instance — check the URL"}), 400
    except requests.exceptions.Timeout:
        return jsonify({"error": "MISP instance did not respond in time (timeout 30 s)"}), 408
    except requests.exceptions.RequestException as exc:
        return jsonify({"error": f"Request failed: {exc}"}), 400

    if resp.status_code in (401, 403):
        return jsonify({"error": "Authentication failed — check your API key"}), 403
    if resp.status_code == 404:
        return jsonify({"error": "Event(s) not found on that instance"}), 404
    if resp.status_code == 429:
        return jsonify({"error": "MISP rate limit exceeded"}), 429

    try:
        result = resp.json()
    except Exception:
        return jsonify({"error": "MISP returned a non-JSON response"}), 400

    # Normalize to {"response": [{"Event": {...}}, ...]}
    response_list = result.get("response")
    if isinstance(response_list, list):
        normalized = {"response": response_list}
    elif isinstance(response_list, dict) and "Event" in response_list:
        normalized = {"response": [{"Event": response_list["Event"]}]}
    elif "Event" in result:
        normalized = {"response": [{"Event": result["Event"]}]}
    else:
        normalized = result

    count = len(normalized["response"]) if isinstance(normalized.get("response"), list) else 1
    return jsonify({"content": json.dumps(normalized, ensure_ascii=False), "count": count, "event_ids": event_ids}), 200


@conversions_blueprint.route("/misp_search_events", methods=['POST'])
def misp_search_events():
    """Search events on an external MISP instance using /events/index."""
    data = request.get_json(silent=True) or {}
    misp_url = data.get("misp_url", "").strip().rstrip("/")
    api_key  = data.get("api_key",  "").strip()

    if not api_key:
        return jsonify({"error": "API key required"}), 400
    url_error = _validate_misp_url(misp_url)
    if url_error:
        return jsonify({"error": url_error}), 400

    try:
        limit = min(int(data.get("limit", 25)), 100)
        page  = max(int(data.get("page",  1)),  1)
    except (TypeError, ValueError):
        return jsonify({"error": "limit and page must be integers"}), 400

    search_body = {"limit": limit, "page": page}
    if data.get("search"):
        search_body["searchinfo"] = data["search"].strip()
    if data.get("tag"):
        search_body["searchtag"] = data["tag"].strip()
    if data.get("date_from"):
        search_body["searchdatefrom"] = data["date_from"].strip()
    if data.get("date_to"):
        search_body["searchdateto"] = data["date_to"].strip()

    try:
        resp = requests.post(
            f"{misp_url}/events/index",
            headers={"Authorization": api_key, "Accept": "application/json",
                     "Content-Type": "application/json"},
            json=search_body,
            timeout=15,
            verify=True,
            allow_redirects=False,
        )
    except requests.exceptions.SSLError:
        return jsonify({"error": "SSL certificate verification failed"}), 400
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Cannot reach the MISP instance — check the URL"}), 400
    except requests.exceptions.Timeout:
        return jsonify({"error": "MISP instance timed out (15 s)"}), 408
    except requests.exceptions.RequestException as exc:
        return jsonify({"error": f"Request failed: {exc}"}), 400

    if resp.status_code in (401, 403):
        return jsonify({"error": "Authentication failed — check your API key"}), 403
    if resp.status_code != 200:
        return jsonify({"error": f"MISP returned HTTP {resp.status_code}"}), 400

    try:
        raw = resp.json()
    except Exception:
        return jsonify({"error": "MISP returned a non-JSON response"}), 400

    # Normalise the various response shapes MISP can return
    if isinstance(raw, dict):
        raw = raw.get("response", [])
    if not isinstance(raw, list):
        raw = []

    THREAT = {"1": "High", "2": "Medium", "3": "Low", "4": "Undefined"}

    events = []
    for ev in raw:
        raw_tags = ev.get("Tag") or []
        if not raw_tags:
            raw_tags = [et.get("Tag", {}) for et in ev.get("EventTag", []) if et.get("Tag")]
        visible_tags = [
            {"name": t.get("name", ""), "colour": t.get("colour", "#888888")}
            for t in raw_tags
            if not t.get("hide_tag", False)
        ]
        events.append({
            "id":              ev.get("id"),
            "info":            ev.get("info", ""),
            "date":            ev.get("date", ""),
            "attribute_count": ev.get("attribute_count", 0),
            "org":             (ev.get("Orgc") or {}).get("name") or str(ev.get("org_id", "")),
            "threat_level":    THREAT.get(str(ev.get("threat_level_id", "")), ""),
            "published":       ev.get("published", False),
            "distribution":    str(ev.get("distribution", "3")),
            "sharing_group":   (ev.get("SharingGroup") or {}).get("name", ""),
            "tags":            visible_tags,
        })

    return jsonify({"events": events, "count": len(events), "page": page, "limit": limit}), 200


@conversions_blueprint.route("/stix_to_misp", methods=['GET', 'POST'])
def stix_to_misp():
    """STIX → MISP conversion page.

    GET renders the page; its param controls are drawn client-side from the
    Converter's Parameter schema. POST is a fetch/JSON submission handled by
    `_submit_via_json`.
    """
    if request.method == 'POST':
        return _submit_via_json("stix", "misp", StixToMispParams, _stix_auto_meta)
    return render_template("conversions/stix_to_misp.html")


@conversions_blueprint.route("/history", methods=['GET'])
def history():
    """History page of the last conversion"""
    return render_template("conversions/history.html")

@conversions_blueprint.route("/get_conversion_page_history", methods=['GET'])
def get_page_history():
    """History of the last conversion, with optional filter and sort"""
    page        = request.args.get('page', 1, type=int)
    filter_type = request.args.get('filter_type', type=str)
    sort_order  = request.args.get('sort_order', type=str)
    only_mine   = request.args.get('only_mine', 'false', type=str)
    searchQuery = request.args.get('searchQuery', type=str)
    search_scope = request.args.get('search_scope', 'all', type=str)
    date_from   = request.args.get('date_from', type=str)
    date_to     = request.args.get('date_to', type=str)

    exact_match  = request.args.get('exact_match', 'false', type=str) == 'true'
    tag_names_raw = request.args.get('tag_names', '', type=str)
    tag_names = [t.strip() for t in tag_names_raw.split(',') if t.strip()] if tag_names_raw else None
    vis_filter      = request.args.get('vis_filter', '', type=str) or None
    favorites_only  = request.args.get('favorites_only', 'false', type=str) == 'true'
    favorites_user_id = current_user.id if (favorites_only and current_user.is_authenticated) else None

    actor = current_user._get_current_object() if current_user.is_authenticated else None
    pagination = conv_repo.list_for_user(
        actor,
        page,
        filter_type=filter_type,
        sort_order=sort_order,
        only_mine=only_mine,
        searchQuery=searchQuery,
        search_scope=search_scope,
        date_from=date_from,
        date_to=date_to,
        exact_match=exact_match,
        tag_names=tag_names,
        vis_filter=vis_filter,
        favorites_only=favorites_only,
        favorites_user_id=favorites_user_id,
    )
    items = pagination.items
    conversion_list = [item.to_json_list() for item in items]

    # Batch load tags for all returned conversions
    ids = [item.id for item in items]
    tags_by_conversion = TagsModel.get_conversion_tags_batch(ids)

    # Batch load favorites for current user
    fav_ids = ConversionModel.get_favorite_ids(current_user.id) if current_user.is_authenticated else set()

    for entry in conversion_list:
        entry['tags']        = [a.to_json() for a in tags_by_conversion.get(entry['id'], [])]
        entry['is_favorite'] = entry['id'] in fav_ids

    return {
        "list": conversion_list,
        "total_page": pagination.pages,
    }, 200


@conversions_blueprint.route("/favorite/toggle", methods=['POST'])
@login_required
def toggle_favorite():
    data       = request.get_json(silent=True) or {}
    conversion_id = data.get("conversion_id")
    if not conversion_id:
        return {"success": False, "error": "Missing conversion_id"}, 400
    conversion = conv_repo.get(conversion_id)
    if not conversion:
        return {"success": False, "error": "Not found"}, 404
    if not conversion.public and current_user.id != conversion.user_id and not current_user.is_admin():
        return {"success": False, "error": "Forbidden"}, 403
    is_fav = ConversionModel.toggle_favorite(current_user.id, conversion_id)
    AccountModel.create_system_log(
        "convert_favorited" if is_fav else "convert_unfavorited",
        actor_id=current_user.id,
        actor_name=current_user.first_name,
        target_type="convert",
        target_id=conversion_id,
        target_name=conversion.name,
        details=f"{'Added to' if is_fav else 'Removed from'} favorites by {current_user.first_name}",
    )
    return {"success": True, "is_favorite": is_fav}, 200


@conversions_blueprint.route("/favorite/status/<int:conversion_id>", methods=['GET'])
@login_required
def favorite_status(conversion_id):
    is_fav = ConversionModel.is_favorite(current_user.id, conversion_id)
    return {"success": True, "is_favorite": is_fav}, 200


@conversions_blueprint.route("/most_favorited", methods=['GET'])
def most_favorited():
    """Return the most favorited public conversions, ordered by favorite count desc."""
    limit = request.args.get('limit', 10, type=int)

    # Subquery: count favorites per conversion (public only)
    fav_counts = (
        db.session.query(
            ConversionFavorite.conversion_id,
            func.count(ConversionFavorite.id).label("fav_count"),
        )
        .group_by(ConversionFavorite.conversion_id)
        .subquery()
    )

    results = (
        db.session.query(Conversion, fav_counts.c.fav_count)
        .join(fav_counts, Conversion.id == fav_counts.c.conversion_id)
        .filter(Conversion.is_active, Conversion.public)
        .order_by(fav_counts.c.fav_count.desc())
        .limit(limit)
        .all()
    )

    items = []
    for conversion, fav_count in results:
        entry = conversion.to_json_list()
        entry["fav_count"] = fav_count
        items.append(entry)

    return {"success": True, "list": items}, 200


@conversions_blueprint.route("/search_in_content", methods=['GET'])
def search_in_content():
    """Return highlighted snippets for a query inside a single conversion"""
    conversion_id = request.args.get('conversion_id', type=int)
    query_str  = request.args.get('q', type=str)
    scope      = request.args.get('scope', 'all', type=str)

    if not conversion_id or not query_str:
        return {"success": False, "message": "Missing conversion_id or q"}, 400

    conversion = conv_repo.get(conversion_id)
    if not conversion:
        return {"success": False, "message": "Conversion not found"}, 404

    # Visibility check
    if not conversion.public:
        if not current_user.is_authenticated:
            return {"success": False, "message": "Unauthorized"}, 403
        if current_user.id != conversion.user_id and not current_user.is_admin():
            return {"success": False, "message": "Forbidden"}, 403

    results = conv_repo.search_in_content(query_str, conversion_id, scope=scope)
    return {"success": True, "results": results}, 200

@conversions_blueprint.route("/delete_item", methods=['POST', 'DELETE', 'GET'])
@login_required
def delete_rule() -> jsonify:
    """Delete an item"""
    item_id = request.get_json(silent=True, force=True) or {}
    item_id = item_id.get("id") or request.args.get("id")
    conversion = conv_repo.get(item_id)
    if conversion:
        if current_user.id == conversion.user_id or current_user.is_admin():
            _conversion_name = conversion.name
            success = conv_repo.soft_delete(item_id)
            if success:
                AccountModel.create_system_log("convert_deleted", actor_id=current_user.id, actor_name=current_user.first_name, target_type="convert", target_id=int(item_id), target_name=_conversion_name)
                return {"success": True, "message": "Conversion history deleted!", "toast_class": "success"}, 200
            else:
                return {"success": False, "message": "Error during deleting the item!", "toast_class": "danger"}, 500
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    else:
        return {"success": False, "message": "No item found!", "toast_class": "danger"}, 404


def _render_detail(conversion):
    """Shared visibility logic for the detail page."""
    if not conversion:
        flash("The conversion id is unknown", "danger")
        return redirect(url_for("conversions.history"))

    if conversion.public:
        return render_template("conversions/detail.html", conversion=conversion)

    if not current_user.is_authenticated:
        flash("You must be logged in to view this conversion.", "warning")
        return redirect(url_for("account.login"))

    if current_user.id == conversion.user_id or current_user.is_admin():
        return render_template("conversions/detail.html", conversion=conversion)

    flash("You do not have permission to view this conversion.", "danger")
    return redirect(url_for("conversions.history"))


@conversions_blueprint.route("/<int:id>", methods=['GET'])
def conversion_by_id(id):
    """Canonical short URL of a Conversion - the address the API persist
    envelope advertises as ``url``. A 302 (not the legacy shim's 301) to the
    detail page, so the short URL stays canonical if the detail location
    ever moves."""
    return redirect(url_for("conversions.detail", id=id))


@conversions_blueprint.route("/detail/<id>", methods=['GET'])
def detail(id):
    """Detail page — accepts numeric ID or UUID string."""
    try:
        conversion = conv_repo.get(int(id))
    except (ValueError, TypeError):
        conversion = conv_repo.get_by_uuid(id)
    return _render_detail(conversion)

@conversions_blueprint.route("/edit/<int:id>", methods=['GET', 'POST'])
@login_required
def edit(id):
    """Detail page of the conversion"""

    form = editConversionForm()
    conversion = conv_repo.get(id)
    if conversion.user_id == current_user.id or current_user.is_admin():
        if form.validate_on_submit():
            form_dict = form_to_dict(form)
            
            success, message = conv_repo.edit(id, form_dict)
            if success:
                AccountModel.create_system_log("convert_edited", actor_id=current_user.id, actor_name=current_user.first_name, target_type="convert", target_id=int(id), target_name=form_dict.get("name", conversion.name))
                flash(f"{conversion.name} edit successfully","success")
                return redirect(f"/conversions/detail/{id}")
            else:
                flash(f"Error : {message}", "danger")
                return render_template("conversions/edit.html", form=form, conversion_id=id )
            
        else:
            form.name.data = conversion.name
            form.description.data = conversion.description

            return render_template("conversions/edit.html", form=form, conversion_id=id )
    else:
            return abort(403)
        
        

################################
#   Feature on the conversion  #
################################

@conversions_blueprint.route("/get_conversion", methods=['GET'])
def get_conversion():
    """Get the conversion thanks to the id to the interface (vue-js)"""
    id = request.args.get('id', 1, type=int)
    if id:
        conversion = conv_repo.get(id)
        if conversion:
            # Visibility check: private conversions only visible to owner and admins
            if not conversion.public:
                if not current_user.is_authenticated:
                    return {"success": False, "message": "Unauthorized", "toast_class": "danger"}, 403
                if current_user.id != conversion.user_id and not current_user.is_admin():
                    return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
            return {
                "success": True,
                "conversion": conversion.to_json(),
                "message": "Conversion found",
                "toast_class" : "success"
                }, 200
        return {
            "success": False,
            "message": "No conversion history for this id",
            "toast_class" : "danger"
            }, 404
    return {
        "success": False,
        "message": "No id provided",
        "toast_class" : "danger"
        }, 400

@conversions_blueprint.route("/edit_public", methods=['GET'])
@login_required
def edit_public():
    """Change the public/private section"""
    id = request.args.get('id', 1, type=int)
    if id:
        conversion = conv_repo.get(id)
        if conversion:
            if conversion.user_id == current_user.id or current_user.is_admin():
                comment_count = len([c for c in conversion.comments if not c.is_deleted])
                success , _bool = conv_repo.toggle_visibility(id)
                if success:
                    message = f"This conversion is now {'public' if _bool else 'private'}"
                    AccountModel.create_system_log(
                        'convert_visibility_changed', actor_id=current_user.id, actor_name=current_user.first_name,
                        target_type="convert", target_id=id, target_name=conversion.name, details="public" if _bool else "private"
                    )
                    return {
                        "success": True,
                        "conversion_public": _bool,
                        "message": message,
                        "comment_count": comment_count,
                        "toast_class" : "success"
                        }, 200
                return {
                    "success": False, 
                    "message": "Error during the edit of the public/private section", 
                    "toast_class" : "danger"
                }, 500
            return abort(403)
        return {
            "success": False, 
            "message": "No conversion history for this id",
            "toast_class" : "danger"
            }, 500
    return {
        "success": False, 
        "message": "No id provided", 
        "toast_class" : "danger"
        }, 404

############################
#   Share the conversion   #
############################

@conversions_blueprint.route("/get_share_key", methods=['GET'])
@login_required
def get_share_key():
    """Get the share key of a conversion"""
    id = request.args.get('id', 1, type=int)
    if id:
        conversion = conv_repo.get(id)
        if conversion:
            if conversion.user_id == current_user.id or current_user.is_admin():
                return {
                    "success": True, 
                    "share_key": conversion.share_key,
                    "message": "Share key found", 
                    "toast_class" : "success"
                    }, 200
            return abort(403)
        return {
            "success": False, 
            "message": "No conversion history for this id",
            "toast_class" : "danger"
            }, 500
    return {
        "success": False, 
        "message": "No id provided", 
        "toast_class" : "danger"
        }, 500


@conversions_blueprint.route("/regenerate_share_key", methods=['GET'])
@login_required
def regenerate_share_key():
    """Regenerate the share key of a conversion"""
    id = request.args.get('id', 1, type=int)
    if id:
        conversion = conv_repo.get(id)
        if conversion:
            if conversion.user_id == current_user.id or current_user.is_admin():
                success , new_share_key = conv_repo.regenerate_share_key(id)
                if success:
                    return {
                        "success": True, 
                        "share_key": new_share_key,
                        "message": "Share key regenerated", 
                        "toast_class" : "success"
                        }, 200
                return {
                    "success": False, 
                    "message": "Error during the regeneration of the share key", 
                    "toast_class" : "danger"
                }, 500
            return abort(403)
        return {
            "success": False, 
            "message": "No conversion history for this id",
            "toast_class" : "danger"
            }, 500
    return {
        "success": False, 
        "message": "No id provided", 
        "toast_class" : "danger"
        }, 500
    
# https://cti-transmute.org/conversions/share?uuid=${conversion?.uuid || ''}&share_key=${share_key}`
@conversions_blueprint.route("/share", methods=['GET'])
def share_conversion():
    """Share a conversion using uuid and share_key"""
    uuid = request.args.get('uuid', type=str)
    share_key = request.args.get('share_key', type=str)

    if not uuid or not share_key:
        flash("Please provide a valid UUID and Share Key", "danger")
        return redirect(url_for("conversions.history"))
    print(f"UUID: {uuid}, Share Key: {share_key}")
    conversion = conv_repo.get_by_uuid(uuid)
    if not conversion:
        flash("No conversion found for the provided UUID", "danger")
        return redirect(url_for("conversions.history"))

    if conversion.share_key != share_key:
        flash("The provided Share Key is invalid", "danger")
        return redirect(url_for("conversions.history"))

    return render_template("conversions/detail.html", conversion=conversion)



###########################
#   Refresh a conversion  #
###########################

def _build_misp_to_stix_params(form) -> MispToStixParams:
    """Build MISP → STIX params from the refresh page's WTForm cleaned data.

    The conversion page is schema-driven and submits params as JSON; the refresh
    page still uses a classic WTForm POST, so it keeps this builder.
    """
    return MispToStixParams(version=form.version.data)


def _build_stix_to_misp_params(form) -> StixToMispParams:
    """Build STIX → MISP params from the refresh page's WTForm cleaned data.

    Strips strings and drops blanks/``None`` to defaults. Kept for the refresh
    page's classic WTForm POST (the conversion page submits params as JSON via
    `website.lib.params.build_params`).
    """
    raw = {
        "distribution": form.distribution.data,
        "sharing_group_id": form.sharing_group_id.data,
        "galaxies_as_tags": form.galaxies_as_tags.data,
        "no_force_contextual_data": form.no_force_contextual_data.data,
        "cluster_distribution": form.cluster_distribution.data,
        "cluster_sharing_group_id": form.cluster_sharing_group_id.data,
        "organisation_uuid": form.organisation_uuid.data,
        "single_event": form.single_event.data,
        "producer": form.producer.data,
        "title": form.title.data
    }
    return build_params(StixToMispParams, raw)


@conversions_blueprint.route("/refresh/<string:uuid>", methods=['GET', 'POST'])
@login_required
def refresh(uuid):
    conversion_obj = conv_repo.get_by_uuid(uuid)

    if not conversion_obj:
        flash("Conversion not found.", "danger")
        return redirect(url_for("conversions.history"))

    # Owner-or-admin only — gate both the form (GET) and the re-run (POST).
    # Anonymous callers were already bounced to login by @login_required.
    user = current_user._get_current_object()
    try:
        assert_can_refresh(user, conversion_obj)
    except PermissionDenied:
        abort(403)

    # Choose the WTForm + params builder for this conversion's direction.
    if conversion_obj.conversion_type == "MISP_TO_STIX":
        form = mispToStixParamForm()
        build_params = _build_misp_to_stix_params
    elif conversion_obj.conversion_type == "STIX_TO_MISP":
        form = stixToMispParamForm()
        build_params = _build_stix_to_misp_params
    else:
        flash("Unsupported conversion type.", "danger")
        return redirect(url_for("conversions.history"))

    # Prefill form (GET)
    if request.method == "GET":
        form.name.data = conversion_obj.name
        form.description.data = conversion_obj.description
        form.public.data = conversion_obj.public

    result = None
    diff = None
    error = None

    if form.validate_on_submit():
        try:
            history = refresh_conversion(user, conversion_obj, build_params(form))
        except PermissionDenied:
            abort(403)
        except ConversionError as exc:
            error = _conversion_error_message(exc)
            flash(error, "danger")
        else:
            result = history.new_output_text
            is_identical = (
                (conversion_obj.output_text or "").strip()
                == (history.new_output_text or "").strip()
            )
            if is_identical:
                flash("Conversion re-executed successfully! No changes detected.", "success")
                diff = "The new conversion result is IDENTICAL to the previous one."
            else:
                flash("Conversion re-executed successfully! Changes detected.", "success")
                diff = "The new conversion result is DIFFERENT from the previous one."

    return render_template(
        "conversions/refresh.html",
        form=form,
        conversion_obj=conversion_obj,
        result=result,
        diff=diff,
        error=error,
        filename=f"{conversion_obj.name}_refresh.json"
    )


# get_history

@conversions_blueprint.route("/get_history", methods=['GET'])
@login_required
def get_history():
    id = request.args.get('id', 1, type=int)
    if id:
        conversion_obj = conv_repo.get(id)
        if conversion_obj:
            if not conversion_obj.public and current_user.id != conversion_obj.user_id and not current_user.is_admin():
                return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
            latest_history = conv_repo.accepted_history_list(conversion_obj.id)
            if latest_history:
                return {
                    "success": True,
                    "conversion_history": [h.to_json() for h in latest_history],
                    "message": "New conversion found",
                    "toast_class" : "success"
                    }, 200
            return {
                "success": True,
                "message": "No conversion history found for this conversion",
                "toast_class" : "danger"
                }, 200
        return {
            "success": False,
            "message": "No conversion found for this id",
            "toast_class" : "danger"
            }, 404
    return {
        "success": False,
        "message": "No id provided",
        "toast_class" : "danger"
        }, 400




@conversions_blueprint.route("/get_new_conversion", methods=['GET'])
@login_required
def get_new_conversion():
    """Get the new conversion after a refresh to show the difference"""
    id = request.args.get('id', 1, type=int)
    if id:
        conversion_obj = conv_repo.get(id)
        if conversion_obj:
            if not conversion_obj.public and current_user.id != conversion_obj.user_id and not current_user.is_admin():
                return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
            latest_history = conv_repo.latest_history_list(conversion_obj.id)
            if latest_history:
                return {
                    "success": True,
                    "conversion_history": [h.to_json() for h in latest_history],
                    "message": "New conversion found",
                    "toast_class" : "success"
                    }, 200
            return {
                "success": True,
                "message": "No conversion history found for this conversion",
                "toast_class" : "danger"
                }, 200
        return {
            "success": False,
            "message": "No conversion found for this id",
            "toast_class" : "danger"
            }, 404
    return {
        "success": False,
        "message": "No id provided",
        "toast_class" : "danger"
        }, 400


def _moderate_history(history_id, use_case, past_tense):
    """Shared body for the accept/reject endpoints.

    Resolves the history row, hands it to the use-case (which enforces the
    owner-or-admin rule), and maps the typed failures to JSON + status: an
    unauthorised actor is 403, a persistence failure 500.
    """
    history = conv_repo.get_history(history_id)
    if not history:
        return {"success": False, "message": "History entry not found",
                "toast_class": "danger"}, 404
    user = current_user._get_current_object()
    try:
        use_case(user, history)
    except PermissionDenied:
        return {"success": False,
                "message": "You do not have permission to perform this action.",
                "toast_class": "danger"}, 403
    except ConversionError:
        return {"success": False,
                "message": f"Failed to {past_tense} the history entry.",
                "toast_class": "danger"}, 500
    return {"success": True,
            "message": f"History entry {history_id} {past_tense}.",
            "toast_class": "success"}, 200


@conversions_blueprint.route("/history/<int:history_id>/accept", methods=['POST'])
@login_required
def history_accept(history_id):
    """Accept a pending refresh (owner-or-admin) — adopts its output."""
    return _moderate_history(history_id, accept_history, "accepted")


@conversions_blueprint.route("/history/<int:history_id>/reject", methods=['POST'])
@login_required
def history_reject(history_id):
    """Reject a pending refresh (owner-or-admin) — leaves the Conversion as-is."""
    return _moderate_history(history_id, reject_history, "rejected")


@conversions_blueprint.route("/history_action", methods=['GET', 'POST'])
def history_action_gone():
    """Removed: the GET-mutator split into POST accept/reject endpoints."""
    return {
        "success": False,
        "message": ("This endpoint has moved. Use "
                    "POST /conversions/history/<id>/accept or "
                    "POST /conversions/history/<id>/reject."),
        "toast_class": "danger",
    }, 410


@conversions_blueprint.route("/difference/<int:id>", methods=['GET'])
def difference(id):
    """Show the difference between two conversion versions"""
    conversion_obj_history = conv_repo.get_history(id)
    if not conversion_obj_history:
        flash("Conversion not found.", "danger")
        return redirect(url_for("conversions.history"))

    conversion_obj = conv_repo.get(conversion_obj_history.conversion_id)
    if not conversion_obj:
        flash("Conversion not found.", "danger")
        return redirect(url_for("conversions.history"))
    
    if conversion_obj.public:
        if current_user.is_anonymous():
            flash("You must be logged in to view this conversion if you are the owner of this conversion.", "warning")
            return redirect(url_for("account.login"))  

        if current_user.id != conversion_obj.user_id and not current_user.is_admin():
            flash("You do not have permission to view this conversion.", "danger")
            return redirect(url_for("conversions.history"))
        
        return render_template(
            "conversions/compare_version/difference.html",
            old_result=conversion_obj_history.old_output_text,
            new_result=conversion_obj_history.new_output_text,
            conversion_obj=conversion_obj,
            history_id=conversion_obj_history.id
        )
    else:
        return render_template(
            "conversions/compare_version/difference.html",
            old_result=conversion_obj_history.old_output_text,
            new_result=conversion_obj_history.new_output_text,
            conversion_obj=conversion_obj,
            history_id=conversion_obj_history.id
        )

# get_history_details
@conversions_blueprint.route("/get_history_details", methods=['GET'])
@login_required
def get_history_details():
    """Get the details of a conversion history entry"""
    history_id = request.args.get('history_id', type=int)
    if history_id:
        conversion_history = conv_repo.get_history(history_id)
        if conversion_history:
            conversion_obj = conv_repo.get(conversion_history.conversion_id)
            if conversion_obj and not conversion_obj.public:
                if current_user.id != conversion_obj.user_id and not current_user.is_admin():
                    return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
            return {
                "success": True,
                "history": conversion_history.to_json(),
                "message": "Conversion history found",
                "toast_class" : "success"
                }, 200
        return {
            "success": False,
            "message": "No conversion history found for this id",
            "toast_class" : "danger"
            }, 404
    return {
        "success": False,
        "message": "No history_id provided",
        "toast_class" : "danger"
        }, 400


###########################
#   Comments & Reactions  #
###########################

@conversions_blueprint.route("/get_comments", methods=['GET'])
def get_comments():
    """Return visible comments for a conversion."""
    conversion_id = request.args.get('conversion_id', type=int)
    if not conversion_id:
        return {"success": False, "message": "Missing conversion_id", "toast_class": "danger"}, 400

    conversion = conv_repo.get(conversion_id)
    if not conversion:
        return {"success": False, "message": "Conversion not found", "toast_class": "danger"}, 404

    uid = current_user.id if current_user.is_authenticated else None
    is_admin = current_user.is_admin() if current_user.is_authenticated else False

    comments = ConversionModel.get_comments(
        conversion_id=conversion_id,
        current_user_id=uid,
        is_admin=is_admin,
        conversion_owner_id=conversion.user_id
    )
    return {"success": True, "comments": comments}, 200


@conversions_blueprint.route("/comment", methods=['POST'])
@login_required
def add_comment():
    """Create a comment or reply on a conversion."""
    data = request.get_json(silent=True) or {}
    conversion_id    = data.get('conversion_id')
    content       = (data.get('content') or '').strip()
    is_private    = bool(data.get('is_private', False))
    is_evaluation = bool(data.get('is_evaluation', False))
    parent_id     = data.get('parent_id')

    if not conversion_id or not content:
        return {"success": False, "message": "Missing content or conversion_id", "toast_class": "danger"}, 400
    if len(content) > 2000:
        return {"success": False, "message": "Comment is too long (max 2000 characters)", "toast_class": "danger"}, 400

    conversion = conv_repo.get(conversion_id)
    if not conversion:
        return {"success": False, "message": "Conversion not found", "toast_class": "danger"}, 404

    if not conversion.public and not current_user.is_admin() and current_user.id != conversion.user_id:
        return {"success": False, "message": "You cannot comment on a private conversion", "toast_class": "danger"}, 403

    comment = ConversionModel.create_comment(
        conversion_id=conversion_id,
        user_id=current_user.id,
        content=content,
        is_private=is_private,
        parent_id=parent_id if parent_id else None,
        is_evaluation=is_evaluation,
    )
    if not comment:
        return {"success": False, "message": "Failed to save comment", "toast_class": "danger"}, 500

    action = "reply" if parent_id else "comment"
    AccountModel.create_system_log(
        "comment_created",
        actor_id=current_user.id,
        actor_name=current_user.first_name,
        target_type="comment",
        target_id=comment.id,
        target_name=f"On conversion: {conversion.name}",
        details=f"{action.capitalize()} — {content[:120]}{'…' if len(content) > 120 else ''}"
    )

    if parent_id:
        parent = ConversionModel.get_comment(parent_id)
        if parent:
            AccountModel.notify_comment_reply(parent, comment, current_user.id)
    else:
        AccountModel.notify_new_comment(conversion, comment, current_user.id)

    return {
        "success": True,
        "message": "Comment posted",
        "toast_class": "success",
        "comment": comment.to_json(
            current_user_id=current_user.id,
            is_admin=current_user.is_admin(),
            conversion_owner_id=conversion.user_id
        )
    }, 201


@conversions_blueprint.route("/get_comment_info", methods=['GET'])
def get_comment_info():
    """Return conversion_id and is_evaluation for a comment — used for notification deep-linking."""
    comment_id = request.args.get('comment_id', type=int)
    if not comment_id:
        return {"success": False}, 400
    comment = ConversionModel.get_comment(comment_id)
    if not comment:
        return {"success": False}, 404
    # For replies, the evaluation flag lives on the parent comment
    is_eval = comment.is_evaluation
    if comment.parent_id:
        parent = ConversionModel.get_comment(comment.parent_id)
        if parent:
            is_eval = parent.is_evaluation
    return {"success": True, "conversion_id": comment.conversion_id, "is_evaluation": is_eval}, 200


@conversions_blueprint.route("/edit_comment", methods=['POST'])
@login_required
def edit_comment():
    """Edit the content of a comment (author only)."""
    data = request.get_json(silent=True) or {}
    comment_id = data.get('comment_id')
    content    = data.get('content', '')
    if not comment_id:
        return {"success": False, "message": "Missing comment_id", "toast_class": "danger"}, 400
    comment = ConversionModel.get_comment(comment_id)
    success, message = ConversionModel.edit_comment(
        comment_id=comment_id,
        requesting_user_id=current_user.id,
        content=content,
    )
    if success and comment:
        AccountModel.create_system_log(
            "comment_edited",
            actor_id=current_user.id,
            actor_name=current_user.first_name,
            target_type="comment",
            target_id=comment_id,
            target_name=f"On conversion #{comment.conversion_id}",
            details=content[:120] + ('…' if len(content) > 120 else ''),
        )
    return {
        "success": success,
        "message": message,
        "toast_class": "success" if success else "danger",
    }, 200 if success else 403


@conversions_blueprint.route("/delete_comment", methods=['GET'])
@login_required
def delete_comment():
    """Soft-delete a comment."""
    comment_id = request.args.get('comment_id', type=int)
    if not comment_id:
        return {"success": False, "message": "Missing comment_id", "toast_class": "danger"}, 400

    comment = ConversionModel.get_comment(comment_id)
    success, message = ConversionModel.delete_comment(
        comment_id=comment_id,
        requesting_user_id=current_user.id,
        is_admin=current_user.is_admin()
    )
    if success and comment:
        AccountModel.create_system_log(
            'comment_deleted', actor_id=current_user.id, actor_name=current_user.first_name,
            target_type='comment', target_id=comment_id, target_name=f'On conversion #{comment.conversion_id}',
            details=comment.content[:120] if comment.content else None
        )
    return {
        "success": success,
        "message": message,
        "toast_class": "success" if success else "danger"
    }, 200 if success else 403


@conversions_blueprint.route("/toggle_comment_private", methods=['GET'])
@login_required
def toggle_comment_private():
    """Toggle the private/public visibility of a comment."""
    comment_id = request.args.get('comment_id', type=int)
    if not comment_id:
        return {"success": False, "message": "Missing comment_id", "toast_class": "danger"}, 400

    success, message, new_private = ConversionModel.toggle_comment_private(
        comment_id=comment_id,
        requesting_user_id=current_user.id,
        is_admin=current_user.is_admin()
    )
    return {
        "success": success,
        "message": message,
        "is_private": new_private,
        "toast_class": "success" if success else "danger"
    }, 200 if success else 403


@conversions_blueprint.route("/react", methods=['POST'])
@login_required
def react():
    """Toggle an emoji reaction on a comment."""
    data = request.get_json(silent=True) or {}
    comment_id = data.get('comment_id')
    emoji = data.get('emoji', '').strip()

    allowed_emojis = ['👍', '😊', '❤️', '🎯', '⚠️']
    if not comment_id or emoji not in allowed_emojis:
        return {"success": False, "message": "Invalid request", "toast_class": "danger"}, 400

    success, added = ConversionModel.react_to_comment(comment_id, current_user.id, emoji)
    if not success:
        return {"success": False, "message": "Failed to update reaction", "toast_class": "danger"}, 500

    return {
        "success": True,
        "added": added,
        "message": "Reaction added" if added else "Reaction removed",
        "toast_class": "success"
    }, 200


###########################
#   Report a Conversion   #
###########################

@conversions_blueprint.route("/report", methods=['POST'])
@login_required
def report_conversion():
    """Submit a report on a conversion."""
    data = request.get_json(silent=True) or {}
    conversion_id = data.get('conversion_id')
    reason = data.get('reason', '').strip()
    description = (data.get('description') or '').strip() or None

    if not conversion_id or reason not in ConversionModel.REPORT_REASONS:
        return {"success": False, "message": "Invalid request", "toast_class": "danger"}, 400
    if description and len(description) > 1000:
        return {"success": False, "message": "Description is too long (max 1000 characters)", "toast_class": "danger"}, 400

    conversion = conv_repo.get(conversion_id)
    if not conversion:
        return {"success": False, "message": "Conversion not found", "toast_class": "danger"}, 404

    report = ConversionModel.create_report(
        conversion_id=conversion_id,
        user_id=current_user.id,
        reason=reason,
        description=description
    )
    if not report:
        return {"success": False, "message": "Failed to submit report", "toast_class": "danger"}, 500

    AccountModel.notify_admins_new_report(conversion, current_user.id)
    return {"success": True, "message": "Report submitted. Thank you.", "toast_class": "success"}, 201


@conversions_blueprint.route("/admin/get_reports", methods=['GET'])
@login_required
def admin_get_reports():
    """Admin: get paginated reports."""
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status', type=str)
    search = request.args.get('search', '', type=str) or None
    pagination = ConversionModel.get_reports(page=page, status=status, search=search)
    return {
        "success": True,
        "list": [r.to_json() for r in pagination.items],
        "total_page": pagination.pages
    }, 200


@conversions_blueprint.route("/admin/review_report", methods=['GET'])
@login_required
def admin_review_report():
    """Admin: mark a report as reviewed or dismissed."""
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    report_id = request.args.get('report_id', type=int)
    new_status = request.args.get('status', type=str)
    if not report_id or new_status not in ('reviewed', 'dismissed'):
        return {"success": False, "message": "Invalid params", "toast_class": "danger"}, 400
    success = ConversionModel.review_report(report_id, new_status, current_user.id)
    return {
        "success": success,
        "message": f"Report marked as {new_status}" if success else "Failed",
        "toast_class": "success" if success else "danger"
    }, 200 if success else 500


@conversions_blueprint.route("/admin/delete_report", methods=['GET'])
@login_required
def admin_delete_report():
    """Admin: permanently delete a report."""
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    report_id = request.args.get('report_id', type=int)
    if not report_id:
        return {"success": False, "message": "Invalid params", "toast_class": "danger"}, 400
    report = ConversionModel.get_report(report_id)
    if not report:
        return {"success": False, "message": "Report not found", "toast_class": "danger"}, 404
    ConversionModel.delete_report(report_id)
    return {"success": True, "message": "Report deleted", "toast_class": "success"}, 200


##################################
#   Trash (soft-delete) routes   #
##################################

@conversions_blueprint.route("/trash", methods=['GET'])
@login_required
def trash():
    if not current_user.is_admin():
        return redirect(url_for("conversions.history"))
    return render_template("conversions/trash.html")


@conversions_blueprint.route("/get_trash", methods=['GET'])
@login_required
def get_trash():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str) or None
    pagination = conv_repo.list_deleted(page, search=search)
    return {
        "success": True,
        "list": [c.to_json_list() for c in pagination.items],
        "total_page": pagination.pages,
        "total_count": pagination.total,
        "page": page,
    }, 200


@conversions_blueprint.route("/restore", methods=['POST'])
@login_required
def restore():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    data = request.get_json(silent=True) or {}
    conversion_id = data.get('id') or request.args.get('id', type=int)
    if conversion_id:
        conversion_id = int(conversion_id)
    conversion = conv_repo.get(conversion_id, include_deleted=True)
    if not conversion:
        return {"success": False, "message": "Conversion not found", "toast_class": "danger"}, 404
    if conv_repo.restore(conversion_id):
        AccountModel.create_system_log(
            'convert_restored', actor_id=current_user.id, actor_name=current_user.first_name,
            target_type='conversion', target_id=conversion_id, target_name=conversion.name
        )
        return {"success": True, "message": f"'{conversion.name}' restored successfully", "toast_class": "success"}, 200
    return {"success": False, "message": "Error restoring conversion", "toast_class": "danger"}, 500


@conversions_blueprint.route("/hard_delete", methods=['POST'])
@login_required
def hard_delete():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    data = request.get_json(silent=True) or {}
    conversion_id = data.get('id') or request.args.get('id', type=int)
    if conversion_id:
        conversion_id = int(conversion_id)
    conversion = conv_repo.get(conversion_id, include_deleted=True)
    if not conversion:
        return {"success": False, "message": "Conversion not found", "toast_class": "danger"}, 404
    _name = conversion.name
    if conv_repo.hard_delete(conversion_id):
        AccountModel.create_system_log(
            'convert_hard_deleted', actor_id=current_user.id, actor_name=current_user.first_name,
            target_type='conversion', target_id=conversion_id, target_name=_name
        )
        return {"success": True, "message": f"'{_name}' permanently deleted", "toast_class": "success"}, 200
    return {"success": False, "message": "Error deleting conversion", "toast_class": "danger"}, 500


@conversions_blueprint.route("/bulk_action", methods=['POST'])
@login_required
def bulk_action():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    data = request.get_json(silent=True) or {}
    action = data.get('action')
    ids = data.get('ids', [])
    if not ids or action not in ('restore', 'hard_delete'):
        return {"success": False, "message": "Invalid request", "toast_class": "danger"}, 400
    done = 0
    for conversion_id in ids:
        conversion = conv_repo.get(conversion_id, include_deleted=True)
        if not conversion:
            continue
        if action == 'restore':
            if conv_repo.restore(conversion_id):
                AccountModel.create_system_log(
                    'convert_restored', actor_id=current_user.id, actor_name=current_user.first_name,
                    target_type='conversion', target_id=conversion_id, target_name=conversion.name
                )
                done += 1
        else:
            _name = conversion.name
            if conv_repo.hard_delete(conversion_id):
                AccountModel.create_system_log(
                    'convert_hard_deleted', actor_id=current_user.id, actor_name=current_user.first_name,
                    target_type='conversion', target_id=conversion_id, target_name=_name
                )
                done += 1
    label = "conversion" if done == 1 else "conversions"
    if action == 'restore':
        msg = f"{done} {label} restored"
    else:
        msg = f"{done} {label} permanently deleted"
    return {"success": True, "message": msg, "toast_class": "success" if done > 0 else "warning", "done": done}, 200


@conversions_blueprint.route("/misp_test_connection", methods=['POST'])
@login_required
def misp_test_connection():
    """Test connectivity to a MISP instance and return its tag list."""
    data = request.get_json(silent=True) or {}
    misp_url = data.get("misp_url", "").strip().rstrip("/")
    api_key  = data.get("api_key",  "").strip()

    if not api_key:
        return {"success": False, "error": "API key required"}, 400
    url_error = _validate_misp_url(misp_url)
    if url_error:
        return {"success": False, "error": url_error}, 400

    try:
        resp = requests.get(
            f"{misp_url}/tags/index",
            headers={"Authorization": api_key, "Accept": "application/json"},
            timeout=10,
            verify=True,
            allow_redirects=False,
        )
    except requests.exceptions.SSLError:
        return {"success": False, "error": "SSL certificate verification failed for that MISP instance"}, 400
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Cannot reach the MISP instance — check the URL"}, 400
    except requests.exceptions.Timeout:
        return {"success": False, "error": "MISP instance timed out (10 s)"}, 408
    except requests.exceptions.RequestException as exc:
        return {"success": False, "error": f"Request failed: {exc}"}, 400

    if resp.status_code in (401, 403):
        return {"success": False, "error": "Authentication failed — check your API key"}, 403
    if resp.status_code != 200:
        return {"success": False, "error": f"MISP returned HTTP {resp.status_code}"}, 400

    try:
        result = resp.json()
    except Exception:
        return {"success": False, "error": "MISP returned a non-JSON response"}, 400

    raw_tags = result if isinstance(result, list) else result.get("Tag", [])
    tags = [
        {"name": t["name"], "colour": t.get("colour", "#888888")}
        for t in raw_tags
        if isinstance(t, dict) and t.get("name") and not t.get("hide_tag", False)
    ]
    return {"success": True, "tags": tags, "count": len(tags)}, 200


def _can_download(conversion) -> bool:
    """Return True if the current user is allowed to download this conversion's data."""
    if conversion.public:
        return True
    return current_user.is_authenticated and (current_user.id == conversion.user_id or current_user.is_admin())


@conversions_blueprint.route("/download/<int:conversion_id>/input")
def download_input(conversion_id):
    """Download the input file (MISP JSON for MISP→STIX, STIX JSON for STIX→MISP)."""
    conversion = conv_repo.get(conversion_id)
    if not conversion:
        return {"success": False, "error": "Not found"}, 404
    if not _can_download(conversion):
        return {"success": False, "error": "Forbidden"}, 403

    label    = "misp" if conversion.conversion_type == "MISP_TO_STIX" else "stix"
    filename = f"{label}-input-{conversion_id}.json"
    return json.dumps(json.loads(conversion.input_text), indent=2), 200, {
        "Content-Type": "application/json",
        "Content-Disposition": f'attachment; filename="{filename}"',
    }


@conversions_blueprint.route("/download/<int:conversion_id>/output")
def download_output(conversion_id):
    """Download the output file (STIX JSON for MISP→STIX, MISP JSON for STIX→MISP)."""
    conversion = conv_repo.get(conversion_id)
    if not conversion:
        return {"success": False, "error": "Not found"}, 404
    if not _can_download(conversion):
        return {"success": False, "error": "Forbidden"}, 403
    if not conversion.output_text:
        return {"success": False, "error": "No output data"}, 404

    label    = "stix" if conversion.conversion_type == "MISP_TO_STIX" else "misp"
    filename = f"{label}-output-{conversion_id}.json"
    return json.dumps(json.loads(conversion.output_text), indent=2), 200, {
        "Content-Type": "application/json",
        "Content-Disposition": f'attachment; filename="{filename}"',
    }


@conversions_blueprint.route("/download/<int:conversion_id>/misp-push")
def download_misp_push(conversion_id):
    """
    Download the full PyMISP-built event payload — identical to what
    would be sent to a MISP instance during a push (includes the
    cti-evaluation object and all community evaluation tags).
    """
    conversion = conv_repo.get(conversion_id)
    if not conversion:
        return {"success": False, "error": "Not found"}, 404
    if not _can_download(conversion):
        return {"success": False, "error": "Forbidden"}, 403

    summary        = EvalModel.get_summary(conversion_id)
    consensus_tags = EvalModel.get_consensus_tags(conversion_id, threshold=2)
    push_tags      = EvalModel.get_misp_push_tags(conversion_id)

    event_dict, _, _, error = _build_misp_payload(conversion, push_tags, consensus_tags, summary)
    if error:
        return {"success": False, "error": error}, 400

    filename = f"misp-push-payload-{conversion_id}.json"
    return json.dumps({"Event": event_dict}, indent=2), 200, {
        "Content-Type": "application/json",
        "Content-Disposition": f'attachment; filename="{filename}"',
    }


@conversions_blueprint.route("/push_to_misp", methods=['POST'])
@login_required
def push_to_misp():
    """Push the MISP event to an external MISP instance via PyMISP-built payload."""
    data = request.get_json(silent=True) or {}
    conversion_id = data.get("conversion_id")
    misp_url      = data.get("misp_url", "").strip().rstrip("/")
    api_key       = data.get("api_key",  "").strip()
    extra_tags    = data.get("tags", [])

    if not conversion_id or not misp_url or not api_key:
        return {"success": False, "error": "Missing required fields (conversion_id, misp_url, api_key)"}, 400

    url_error = _validate_misp_url(misp_url)
    if url_error:
        return {"success": False, "error": url_error}, 400

    conversion = conv_repo.get(conversion_id)
    if not conversion:
        return {"success": False, "error": "Conversion not found"}, 404
    if not conversion.public and current_user.id != conversion.user_id and not current_user.is_admin():
        return {"success": False, "error": "Forbidden"}, 403

    # Build the full PyMISP payload (event + cti-evaluation object + eval tags)
    summary        = EvalModel.get_summary(conversion_id)
    consensus_tags = EvalModel.get_consensus_tags(conversion_id, threshold=2)
    push_tags      = EvalModel.get_misp_push_tags(conversion_id)

    event_dict, _, _, build_error = _build_misp_payload(conversion, push_tags, consensus_tags, summary)
    if build_error:
        return {"success": False, "error": build_error}, 400

    # Merge any extra user-selected tags that are not already on the event
    if extra_tags:
        existing_names = {t.get("name", "") for t in (event_dict.get("Tag") or [])}
        for tag_name in extra_tags:
            if tag_name and tag_name not in existing_names:
                event_dict.setdefault("Tag", []).append({"name": tag_name, "exportable": True})

    try:
        resp = requests.post(
            f"{misp_url}/events",
            headers={
                "Authorization": api_key,
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            json={"Event": event_dict},
            timeout=30,
            verify=True,
            allow_redirects=False,
        )
    except requests.exceptions.SSLError:
        return {"success": False, "error": "SSL certificate verification failed"}, 400
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Cannot reach the MISP instance"}, 400
    except requests.exceptions.Timeout:
        return {"success": False, "error": "MISP instance timed out (30 s)"}, 408
    except requests.exceptions.RequestException as exc:
        return {"success": False, "error": f"Request failed: {exc}"}, 400

    if resp.status_code in (401, 403):
        return {"success": False, "error": "Authentication failed — check your API key"}, 403

    try:
        result = resp.json()
    except Exception:
        result = {}

    if resp.status_code not in (200, 201) or result.get("errors"):
        err = result.get("errors") or result.get("message") or f"MISP returned HTTP {resp.status_code}"
        return {"success": False, "error": str(err)}, 400

    new_event_id = (result.get("Event") or {}).get("id")
    AccountModel.create_system_log(
        "misp_push",
        actor_id=current_user.id,
        actor_name=current_user.first_name,
        target_type="convert",
        target_id=conversion_id,
        target_name=conversion.name,
        details=f"Pushed to {misp_url} — new event ID: {new_event_id}"
    )
    return {
        "success": True,
        "message": f"Event pushed to MISP successfully!{' (event #' + str(new_event_id) + ')' if new_event_id else ''}",
        "event_id": new_event_id,
    }, 200


def _build_misp_payload(conversion, push_tags, consensus_tags, summary):
    """
    Build the final MISP event payload using PyMISP.

    Loads the existing MISP event from the conversion, injects the cti-evaluation
    object (populated from community votes) and the evaluation tags, then
    returns a dict with:
      - event_dict     : the full MISPEvent as a dict (what is sent to MISP)
      - cti_object     : just the cti-evaluation MISPObject dict
      - attributes_meta: list of {object_relation, type, value, description}
                         for the detail table in the modal
      - error          : None or an error string
    """

    SCORE_MAP = {"very-low": 0, "low": 25, "moderate": 50, "high": 75, "very-high": 100}

    def parse_tag(name):
        m = re.match(r'^([\w-]+):([\w.-]+)="([\w.-]+)"$', name or '')
        return (m.group(1), m.group(2), m.group(3)) if m else (None, None, None)

    # ── 1. Extract the raw MISP event dict from the conversion ──────────────
    misp_text = conversion.input_text if conversion.conversion_type == "MISP_TO_STIX" else conversion.output_text
    try:
        misp_data = json.loads(misp_text)
    except (json.JSONDecodeError, TypeError):
        return None, None, None, "Invalid JSON in conversion data"

    _MISP_EVENT_KEYS = {'info', 'uuid', 'Attribute', 'Object', 'Tag', 'Galaxy'}
    if isinstance(misp_data, list):
        first      = misp_data[0] if misp_data else {}
        event_data = first.get("Event") or (first if isinstance(first, dict) and _MISP_EVENT_KEYS & first.keys() else None)
    elif isinstance(misp_data, dict):
        event_data = (
            misp_data.get("Event")
            or (misp_data.get("response") or [{}])[0].get("Event")
            or (misp_data if _MISP_EVENT_KEYS & misp_data.keys() else None)
        )
    else:
        event_data = None

    if not event_data:
        return None, None, None, "No MISP Event found in conversion data"

    # Remove server-assigned fields that would conflict on a fresh MISP import
    for field in ("id", "timestamp", "publish_timestamp", "published"):
        event_data.pop(field, None)

    # ── 2. Load into a PyMISP MISPEvent ──────────────────────────────────
    ev = MISPEvent()
    ev.from_json(json.dumps(event_data))

    # ── 3. Add the evaluation tags onto the event ─────────────────────────
    existing_tag_names = {t.name for t in ev.tags}
    for tag_name in push_tags:
        if tag_name not in existing_tag_names:
            ev.add_tag(tag_name)

    # ── 4. Build the cti-evaluation MISPObject ───────────────────────────
    source_fmt    = "MISP"     if conversion.conversion_type == "MISP_TO_STIX" else "STIX 2.1"
    target_fmt    = "STIX 2.1" if conversion.conversion_type == "MISP_TO_STIX" else "MISP"
    overall_level = next((parse_tag(t)[2] for t in push_tags if parse_tag(t)[1] == "overall-score"), None)
    now_iso       = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    obj = MISPObject("cti-evaluation", standalone=False)

    # Fixed identity attributes
    obj.add_attribute("evaluation-id",               str(uuid_mod.uuid4()),                                    type="text")
    obj.add_attribute("evaluation-name",             f"CTI-Transmute evaluation of {conversion.name}",         type="text")
    obj.add_attribute("evaluated-artifact",          conversion.name,                                          type="text")
    obj.add_attribute("evaluation-date",             now_iso,                                                  type="datetime")
    obj.add_attribute("evaluator",                   "CTI-Transmute platform (community)",                     type="text")
    obj.add_attribute("cti-transmute-conversion-id", conversion.uuid,                                          type="text")
    obj.add_attribute("cti-transmute-link",          f"https://cti-transmute.org/conversions/{conversion.id}", type="link")
    obj.add_attribute("source-format",               source_fmt,                                               type="text")
    obj.add_attribute("target-format",               target_fmt,                                               type="text")
    obj.add_attribute("calculation-formula", "Mean of community votes mapped to 0-100 (very-low=0, low=25, moderate=50, high=75, very-high=100)", type="text")

    # Scores
    if overall_level:
        obj.add_attribute("overall-score",       overall_level,                    type="text")
    if summary.get("approval_score") is not None:
        obj.add_attribute("overall-score-value", float(summary["approval_score"]), type="float")

    # Dimension scores from community consensus (threshold=2)
    for tag in consensus_tags:
        cat, level = tag["category"], tag["level"]
        obj.add_attribute(cat,            level,                          type="text")
        obj.add_attribute(f"{cat}-score", float(SCORE_MAP.get(level, 0)), type="float")

    # One taxonomy-tag attribute per vote tag
    for tag_name in sorted(push_tags):
        obj.add_attribute("taxonomy-tag", value=tag_name, type="text")

    obj.add_attribute("taxonomy-reference", type='link',
                      value="https://github.com/MISP/misp-taxonomies/blob/main/cti-evaluation/machinetag.json")

    ev.add_object(obj)

    # ── 5. Serialize the full event via PyMISP ───────────────────────────
    event_dict  = json.loads(ev.to_json())
    cti_obj_dict = next((o for o in event_dict.get("Object", []) if o["name"] == "cti-evaluation"), None)

    # ── 6. Build the human-readable attribute table ───────────────────────
    # This mirrors the object attributes but adds a plain-English description
    # so the modal can show a "Field / Type / Value / What it means" table.
    attr_descriptions = {
        "evaluation-id":               "Unique UUID generated at push time for this evaluation record",
        "evaluation-name":             "Human-readable title — identifies the evaluation in MISP",
        "evaluated-artifact":          "Name of the conversion that was evaluated",
        "evaluation-date":             "UTC timestamp when the evaluation was recorded (= push time)",
        "evaluator":                   "Who produced the evaluation — the CTI-Transmute platform and its community",
        "cti-transmute-conversion-id": "Internal UUID of the source conversion on CTI-Transmute",
        "cti-transmute-link":          "Direct URL to this conversion page on CTI-Transmute",
        "source-format":               "Input CTI format of the conversion (e.g. MISP, STIX 2.1)",
        "target-format":               "Output CTI format of the conversion (e.g. MISP, STIX 2.1)",
        "calculation-formula":         "How the numeric overall-score-value was computed from votes",
        "overall-score":               "Dominant quality level across all community votes",
        "overall-score-value":         "Numeric overall quality score 0–100 (mean of all votes)",
        "taxonomy-tag":                "cti-evaluation machine tag applied on the MISP event",
        "taxonomy-reference":          "Link to the official MISP cti-evaluation taxonomy",
    }
    for tag in consensus_tags:
        cat = tag["category"]
        attr_descriptions[cat]            = f"Community consensus level for '{cat}' ({tag['votes']} vote(s))"
        attr_descriptions[f"{cat}-score"] = f"Numeric score for '{cat}' mapped from its consensus level"

    attributes_meta = []
    if cti_obj_dict:
        for a in cti_obj_dict["Attribute"]:
            rel = a.get("object_relation", "")
            attributes_meta.append({
                "object_relation": rel,
                "type":            a.get("type", ""),
                "value":           a.get("value", ""),
                "uuid":            a.get("uuid", ""),
                "description":     attr_descriptions.get(rel, ""),
            })

    return event_dict, cti_obj_dict, attributes_meta, None


@conversions_blueprint.route("/misp_push_preview/<int:conversion_id>", methods=["GET"])
@login_required
def misp_push_preview(conversion_id):
    """
    JSON endpoint — builds the real PyMISP event payload and returns it for
    preview in the push modal. Includes the full event JSON, the isolated
    cti-evaluation object, and a human-readable attribute table.
    """
    conversion = conv_repo.get(conversion_id)
    if not conversion:
        return {"success": False, "error": "Conversion not found"}, 404
    if not conversion.public and current_user.id != conversion.user_id and not current_user.is_admin():
        return {"success": False, "error": "Forbidden"}, 403

    summary        = EvalModel.get_summary(conversion_id)
    consensus_tags = EvalModel.get_consensus_tags(conversion_id, threshold=2)
    push_tags      = EvalModel.get_misp_push_tags(conversion_id)

    event_dict, cti_obj_dict, attributes_meta, error = _build_misp_payload(
        conversion, push_tags, consensus_tags, summary
    )

    if error:
        return {"success": False, "error": error}, 400

    import re
    def parse_tag(name):
        m = re.match(r'^([\w-]+):([\w.-]+)="([\w.-]+)"$', name or '')
        return (m.group(1), m.group(2), m.group(3)) if m else (None, None, None)

    overall_level = next((parse_tag(t)[2] for t in push_tags if parse_tag(t)[1] == "overall-score"), None)

    return {
        "success":         True,
        "has_evaluations": bool(push_tags),
        # Full event as PyMISP built it — what would be sent to MISP
        "event_dict":      event_dict,
        # Just the cti-evaluation object, isolated for easy reading
        "cti_object":      cti_obj_dict,
        # Human-readable attribute table for the modal detail rows
        "attributes":      attributes_meta,
        # Summary stats
        "eval_tags":       sorted(push_tags),
        "approval_score":  summary.get("approval_score"),
        "overall_level":   overall_level,
        "vote_count":      sum(d["total"] for d in summary.get("cti_categories", {}).values()),
        "event_stats": {
            "attribute_count": len(event_dict.get("Attribute", [])),
            "object_count":    len(event_dict.get("Object", [])),
            "tag_count":       len(event_dict.get("Tag", [])),
        },
    }, 200



@conversions_blueprint.route("/admin/get_all_comments", methods=['GET'])
@login_required
def admin_get_comments():
    """Admin: get all comments across all conversions."""
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str) or None
    pagination = ConversionModel.get_all_comments_admin(page=page, search=search)
    items = []
    for c in pagination.items:
        d = c.to_json(current_user_id=current_user.id, is_admin=True)
        conversion = conv_repo.get(c.conversion_id, include_deleted=True)
        d["conversion_name"] = conversion.name if conversion else "Unknown"
        d["conversion_active"] = bool(conversion and conversion.is_active)
        d["is_reply"] = bool(c.parent_id)
        if c.parent_id:
            parent = CommentModel.query.get(c.parent_id)
            if parent:
                d["parent_author"] = parent.get_author_name()
                d["parent_preview"] = (parent.content[:120] + "…" if len(parent.content) > 120 else parent.content) if not parent.is_deleted else "[deleted]"
            else:
                d["parent_author"] = "Unknown"
                d["parent_preview"] = "[deleted]"
        items.append(d)
    return {
        "success": True,
        "list": items,
        "total_page": pagination.pages
    }, 200

###################################
#   Graph configs                 #
###################################

@conversions_blueprint.route("/graph_config/list", methods=["GET"])
@login_required
def graph_config_list():
    configs = ConversionModel.get_graph_configs(user_id=current_user.id, is_admin=current_user.is_admin())
    is_admin = current_user.is_admin()
    return {"success": True, "list": [c.to_json(current_user_id=current_user.id, is_admin=is_admin) for c in configs]}, 200


@conversions_blueprint.route("/graph_config/save", methods=["POST"])
@login_required
def graph_config_save():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    config_json = data.get('config_json') or '{}'
    if not name:
        return {"success": False, "message": "Name required", "toast_class": "danger"}, 400
    try:
        json.loads(config_json)
    except Exception:
        return {"success": False, "message": "Invalid JSON", "toast_class": "danger"}, 400
    cfg, err = ConversionModel.save_graph_config(name, config_json, current_user.id)
    if err:
        return {"success": False, "message": err, "toast_class": "danger"}, 500
    AccountModel.create_system_log("graph_config_saved", actor_id=current_user.id, actor_name=current_user.first_name, target_type="graph_config", target_id=cfg.id, target_name=cfg.name)
    return {"success": True, "message": "Config saved", "toast_class": "success", "config": cfg.to_json(current_user_id=current_user.id, is_admin=current_user.is_admin())}, 201


@conversions_blueprint.route("/graph_config/delete", methods=["POST"])
@login_required
def graph_config_delete():
    data = request.get_json(silent=True) or {}
    config_id = data.get('id')
    if not config_id:
        return {"success": False, "message": "ID required", "toast_class": "danger"}, 400
    ok, err = ConversionModel.delete_graph_config(config_id, current_user.id, current_user.is_admin())
    if not ok:
        code = 403 if err == "Forbidden" else 404
        return {"success": False, "message": err, "toast_class": "danger"}, code
    AccountModel.create_system_log("graph_config_deleted", actor_id=current_user.id, actor_name=current_user.first_name, target_type="graph_config", target_id=config_id, target_name="")
    return {"success": True, "message": "Config deleted", "toast_class": "success"}, 200


@conversions_blueprint.route("/json_tags/<int:conversion_id>", methods=["GET"])
def get_json_tags(conversion_id):
    """Return tag objects for all tags embedded in the stored MISP/STIX JSON.
    JSON is never modified. Tags are matched against the DB for color/icon;
    unmatched names get a minimal object with nameToColor fallback on the frontend."""
    conversion = conv_repo.get(conversion_id)
    if not conversion:
        return {"success": False, "message": "Not found"}, 404
    if not conversion.public:
        if not current_user.is_authenticated:
            return {"success": False, "message": "Unauthorized"}, 403
        if not current_user.is_admin() and current_user.id != conversion.user_id:
            return {"success": False, "message": "Forbidden"}, 403
    # STIX→MISP: MISP JSON is in output_text; MISP→STIX: MISP JSON is in input_text
    misp_text = conversion.output_text if conversion.conversion_type == "STIX_TO_MISP" else conversion.input_text
    names = extract_tag_names_from_misp_json(misp_text or '')
    if not names:
        return {"success": True, "tags": []}, 200
    # Look up DB tags for color/icon enrichment
    db_tags = {t.name: t for t in TagModel.query.filter(TagModel.name.in_(names)).all()}
    tags = []
    for name in sorted(names):
        t = db_tags.get(name)
        tags.append({
            "id":          t.id if t else None,
            "name":        name,
            "color":       t.color if t else None,
            "icon":        t.icon if t else None,
            "description": t.description if t else None,
            "visibility":  t.visibility if t else "public",
            "source_type": "json",
        })
    return {"success": True, "tags": tags}, 200
