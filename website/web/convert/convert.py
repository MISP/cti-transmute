# website/web/convert/views.py
import io
import ipaddress
import json
from urllib.parse import urlparse
from flask import Blueprint, jsonify, redirect, render_template, request, flash, url_for
from flask_login import current_user, login_required
from website.web.convert.convert_form import  editConvertForm, mispToStixParamForm, stixToMispParamForm
from website.web.utils import extract_name_from_misp_json, form_to_dict, parse_stix_reports, sanitazed_params
import requests
from ..convert import convert_core as ConvertModel
from ..account import account_core as AccountModel


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

convert_blueprint = Blueprint(
    "convert",
    __name__,
    template_folder="templates",
    static_folder="static"
)

@convert_blueprint.route("/misp_to_stix", methods=['GET', 'POST'])
def misp_to_stix():
    form = mispToStixParamForm()
    result = None
    error = None

    if form.validate_on_submit():
        input_mode = request.form.get('input_mode', 'paste')
        file_content = None
        files = None

        # ── Récupération de l'input selon le mode ──────────────────
        if input_mode == 'file':
            file_data = request.files.get('file')
            if not file_data or not file_data.filename:
                error = "Please upload a MISP file"
                flash(error, "danger")
            else:
                file_content = file_data.read().decode('utf-8')
                file_data.seek(0)
                files = {'file': (file_data.filename, file_data.stream, file_data.mimetype)}
        else:  # mode paste
            raw = request.form.get('misp_content', '') or ''
            if not raw.strip():
                error = "Please paste your MISP JSON content"
                flash(error, "danger")
            else:
                file_content = raw
                files = {'file': ('misp.json', raw.encode('utf-8'), 'application/json')}

        # ── Conversion ─────────────────────────────────────────────
        if file_content and files:
            params = {'version': form.version.data}
            try:
                response = requests.post(
                    "http://127.0.0.1:6868/api/convert/misp_to_stix",
                    files=files,
                    params=params
                )
                try:
                    data = response.json()
                except Exception:
                    data = None

                if response.status_code == 200 and data and not data.get("error"):
                    result = data
                    flash("Converted to STIX successfully!", "success")

                    # ── Auto-remplissage name / description ─────────
                    auto_name = extract_name_from_misp_json(file_content)
                    if not form.name.data and auto_name:
                        form.name.data = auto_name
                    if not form.description.data and auto_name:
                        form.description.data = (
                            f"MISP to STIX conversion, version {form.version.data} - {auto_name}"
                        )

                    # ── Sauvegarde en base ──────────────────────────
                    output_text = json.dumps(data, indent=2)
                    _user_id = None if current_user.is_anonymous() else current_user.id

                    saved = ConvertModel.create_convert(
                        user_id=_user_id,
                        input_text=file_content,
                        output_text=output_text,
                        convert_choice="MISP_TO_STIX",
                        name=form.name.data,
                        description=form.description.data or f"MISP to STIX conversion, version {form.version.data}",
                        public=form.public.data
                    )
                    if saved:
                        flash("Convert registered successfully!", "success")
                        _actor_name = current_user.first_name if not current_user.is_anonymous() else "Anonymous"
                        AccountModel.create_system_log("convert_created", actor_id=None if current_user.is_anonymous() else current_user.id, actor_name=_actor_name, target_type="convert", target_id=saved.id, target_name=saved.name, details=f"Type: MISP→STIX, Public: {saved.public}")
                        if saved.public and not current_user.is_anonymous():
                            AccountModel.notify_followers_new_convert(saved, current_user.id)
                        return redirect(url_for("convert.detail", id=saved.id))
                    else:
                        flash("Error during registering the convert!", "danger")

                else:
                    error_msg = data.get("error") if data else f"Conversion failed with status {response.status_code}"
                    error = error_msg
                    flash(error_msg, "danger")

            except requests.RequestException as e:
                error = f"Conversion failed: {e}"
                flash(error, "danger")

    return render_template("convert/misp_to_stix.html", form=form, result=result, error=error)


@convert_blueprint.route("/fetch_misp_event", methods=['POST'])
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


@convert_blueprint.route("/misp_search_events", methods=['POST'])
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
    if data.get("search"):    search_body["searchinfo"]     = data["search"].strip()
    if data.get("tag"):       search_body["searchtag"]      = data["tag"].strip()
    if data.get("date_from"): search_body["searchdatefrom"] = data["date_from"].strip()
    if data.get("date_to"):   search_body["searchdateto"]   = data["date_to"].strip()

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


@convert_blueprint.route("/stix_to_misp", methods=['GET', 'POST'])
def stix_to_misp():
    form = stixToMispParamForm()
    result = None
    error = None

    if form.validate_on_submit():
        # Le JS transforme le mode 'paste' en 'file' juste avant le submit
        input_mode = request.form.get('input_mode', 'paste')
        file_content = None
        files = None

        # ── 1. Récupération de l'input (Fichier ou Paste converti) ──
        file_data = request.files.get('file')
        
        if file_data and file_data.filename != '':
            # Cas normal : Fichier uploadé OU Paste converti en fichier par JS
            file_content = file_data.read().decode('utf-8')
            file_data.seek(0) # Reset du curseur pour requests.post
            files = {'file': (file_data.filename, file_data.stream, file_data.mimetype)}
        
        elif input_mode == 'paste':
            # Fallback : Si le JS n'a pas fonctionné, on récupère le texte brut
            raw = form.stix_content.data or ''
            if not raw.strip():
                error = "Please paste your STIX JSON content"
                flash(error, "danger")
            else:
                file_content = raw
                files = {'file': ('stix.json', raw.encode('utf-8'), 'application/json')}
        
        if not file_content:
            if not error: # Évite d'écraser une erreur déjà flashée
                error = "No STIX content provided"
                flash(error, "danger")

        # ── 2. Conversion via l'API ─────────────────────────────────
        if file_content and files:
            # Préparation des paramètres de conversion
            raw_params = form_to_dict(form)
            params = {
                key: value
                for key, value in raw_params.items()
                if value not in [None, "", False, "False"]
                and key not in ['stix_content', 'name', 'description', 'csrf_token']
            }
            
            # Flags booléens spécifiques
            if form.galaxies_as_tags.data: params["galaxies_as_tags"] = ""
            if form.no_force_contextual_data.data: params["no_force_contextual_data"] = ""
            if form.single_event.data: params["single_event"] = ""

            try:
                response = requests.post(
                    "http://127.0.0.1:6868/api/convert/stix_to_misp",
                    files=files,
                    params=params
                )
                
                try:
                    data = response.json()
                except Exception:
                    data = None

                if response.status_code == 200 and data and not data.get("error"):
                    result = data
                    flash("Converted to MISP successfully!", "success")

                    # ── 3. Extraction métadonnées & Sauvegarde ──────
                    parsed_reports = parse_stix_reports(file_content)
                    parsed_name = None
                    parsed_description = None
                    if parsed_reports:
                        parsed_name, parsed_description = parsed_reports[0]

                    name_to_use = (
                        form.name.data.strip() 
                        or (parsed_name.strip() if parsed_name else None) 
                        or "STIX Conversion"
                    )
                    description_to_use = (
                        form.description.data.strip() 
                        or (parsed_description.strip() if parsed_description else None) 
                        or "STIX to MISP conversion"
                    )

                    output_text = json.dumps(data, indent=2)
                    _user_id = None if current_user.is_anonymous() else current_user.id

                    saved = ConvertModel.create_convert(
                        user_id=_user_id,
                        input_text=file_content,
                        output_text=output_text,
                        convert_choice="STIX_TO_MISP",
                        name=name_to_use,
                        description=description_to_use,
                        public=form.public.data
                    )

                    if saved:
                        flash("Convert registered successfully!", "success")
                        _actor_name = current_user.first_name if not current_user.is_anonymous() else "Anonymous"
                        AccountModel.create_system_log("convert_created", actor_id=None if current_user.is_anonymous() else current_user.id, actor_name=_actor_name, target_type="convert", target_id=saved.id, target_name=saved.name, details=f"Type: STIX→MISP, Public: {saved.public}")
                        if saved.public and not current_user.is_anonymous():
                            AccountModel.notify_followers_new_convert(saved, current_user.id)
                        return redirect(url_for("convert.detail", id=saved.id))
                    else:
                        flash("Error during registering in database", "danger")

                else:
                    error = data.get("error") if data else f"Conversion failed (HTTP {response.status_code})"
                    flash(error, "danger")

            except requests.RequestException as e:
                error = f"API Connection error: {e}"
                flash(error, "danger")

    return render_template("convert/stix_to_misp.html", form=form, result=result, error=error)


@convert_blueprint.route("/history", methods=['GET'])
def history():
    """History page of the last convert"""
    return render_template("convert/history.html")

@convert_blueprint.route("/get_convert_page_history", methods=['GET'])
def get_page_history():
    """History of the last convert, with optional filter and sort"""
    page        = request.args.get('page', 1, type=int)
    filter_type = request.args.get('filter_type', type=str)
    sort_order  = request.args.get('sort_order', type=str)
    only_mine   = request.args.get('only_mine', 'false', type=str)
    searchQuery = request.args.get('searchQuery', type=str)
    search_scope = request.args.get('search_scope', 'all', type=str)
    date_from   = request.args.get('date_from', type=str)
    date_to     = request.args.get('date_to', type=str)

    exact_match  = request.args.get('exact_match', 'false', type=str) == 'true'

    pagination = ConvertModel.get_convert_page(
        page,
        filter_type=filter_type,
        sort_order=sort_order,
        only_mine=only_mine,
        searchQuery=searchQuery,
        search_scope=search_scope,
        date_from=date_from,
        date_to=date_to,
        exact_match=exact_match,
    )
    convert_list = [item.to_json_list() for item in pagination.items]

    return {
        "list": convert_list,
        "total_page": pagination.pages,
    }, 200


@convert_blueprint.route("/search_in_content", methods=['GET'])
def search_in_content():
    """Return highlighted snippets for a query inside a single convert"""
    convert_id = request.args.get('convert_id', type=int)
    query_str  = request.args.get('q', type=str)
    scope      = request.args.get('scope', 'all', type=str)

    if not convert_id or not query_str:
        return {"success": False, "message": "Missing convert_id or q"}, 400

    convert = ConvertModel.get_convert(convert_id)
    if not convert:
        return {"success": False, "message": "Convert not found"}, 404

    # Visibility check
    if not convert.public:
        if not current_user.is_authenticated:
            return {"success": False, "message": "Unauthorized"}, 403
        if current_user.id != convert.user_id and not current_user.is_admin():
            return {"success": False, "message": "Forbidden"}, 403

    results = ConvertModel.search_in_content(query_str, convert_id, scope=scope)
    return {"success": True, "results": results}, 200

@convert_blueprint.route("/delete_item", methods=['POST', 'DELETE', 'GET'])
@login_required
def delete_rule() -> jsonify:
    """Delete an item"""
    item_id = request.get_json(silent=True, force=True) or {}
    item_id = item_id.get("id") or request.args.get("id")
    convert = ConvertModel.get_convert(item_id)
    if convert:
        if current_user.id == convert.user_id or current_user.is_admin():
            _convert_name = convert.name
            success = ConvertModel.delete_convert(item_id)
            if success:
                AccountModel.create_system_log("convert_deleted", actor_id=current_user.id, actor_name=current_user.first_name, target_type="convert", target_id=int(item_id), target_name=_convert_name)
                return {"success": True, "message": "Conversion history deleted!", "toast_class": "success"}, 200
            else:
                return {"success": False, "message": "Error during deleting the item!", "toast_class": "danger"}, 500
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    else:
        return {"success": False, "message": "No item found!", "toast_class": "danger"}, 404


def _render_detail(convert):
    """Shared visibility logic for the detail page."""
    if not convert:
        flash("The convert id is unknown", "danger")
        return redirect(url_for("convert.history"))

    if convert.public:
        return render_template("convert/detail.html", convert=convert)

    if not current_user.is_authenticated:
        flash("You must be logged in to view this convert.", "warning")
        return redirect(url_for("account.login"))

    if current_user.id == convert.user_id or current_user.is_admin():
        return render_template("convert/detail.html", convert=convert)

    flash("You do not have permission to view this convert.", "danger")
    return redirect(url_for("convert.history"))


@convert_blueprint.route("/detail/<id>", methods=['GET'])
def detail(id):
    """Detail page — accepts numeric ID or UUID string."""
    try:
        convert = ConvertModel.get_convert(int(id))
    except (ValueError, TypeError):
        convert = ConvertModel.get_convert_by_uuid(id)
    return _render_detail(convert)

@convert_blueprint.route("/edit/<int:id>", methods=['GET', 'POST'])
@login_required
def edit(id):
    """Detail page of the convert"""

    form = editConvertForm()  
    convert = ConvertModel.get_convert(id)
    if convert.user_id == current_user.id or current_user.is_admin():
        if form.validate_on_submit():
            form_dict = form_to_dict(form)
            
            success, message = ConvertModel.edit_convert(id, form_dict)
            if success:
                AccountModel.create_system_log("convert_edited", actor_id=current_user.id, actor_name=current_user.first_name, target_type="convert", target_id=int(id), target_name=form_dict.get("name", convert.name))
                flash(f"{convert.name} edit successfully","success")
                return redirect(f"/convert/detail/{id}")
            else:
                flash(f"Error : {message}", "danger")
                return render_template("convert/edit.html", form=form, convert_id=id )
            
        else:
            form.name.data = convert.name
            form.description.data = convert.description

            return render_template("convert/edit.html", form=form, convert_id=id )
    else:
            return render_template("access_denied.html")
        
        

#############################
#   Feature on the convert  #
#############################

@convert_blueprint.route("/get_convert", methods=['GET'])
def get_convert():
    """Get the convert thanks to the id to the interface (vue-js)"""
    id = request.args.get('id', 1, type=int)
    if id:
        convert = ConvertModel.get_convert(id)
        if convert:
            # Visibility check: private converts only visible to owner and admins
            if not convert.public:
                if not current_user.is_authenticated:
                    return {"success": False, "message": "Unauthorized", "toast_class": "danger"}, 403
                if current_user.id != convert.user_id and not current_user.is_admin():
                    return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
            return {
                "success": True,
                "convert": convert.to_json(),
                "message": "Convert found",
                "toast_class" : "success"
                }, 200
        return {
            "success": False,
            "message": "No convert history for this id",
            "toast_class" : "danger"
            }, 404
    return {
        "success": False,
        "message": "No id provided",
        "toast_class" : "danger"
        }, 400

@convert_blueprint.route("/edit_public", methods=['GET'])
@login_required
def edit_public():
    """Change the public/private section"""
    id = request.args.get('id', 1, type=int)
    if id:
        convert = ConvertModel.get_convert(id)
        if convert:
            if convert.user_id == current_user.id or current_user.is_admin():
                comment_count = len([c for c in convert.comments if not c.is_deleted])
                success , _bool = ConvertModel.edit_public(id)
                if success:
                    if _bool == True:
                        message="This convert is now public"
                    else:
                        message="This convert is now private"
                    AccountModel.create_system_log("convert_visibility_changed", actor_id=current_user.id, actor_name=current_user.first_name, target_type="convert", target_id=id, target_name=convert.name, details="public" if _bool else "private")
                    return {
                        "success": True,
                        "convert_public": _bool,
                        "message": message,
                        "comment_count": comment_count,
                        "toast_class" : "success"
                        }, 200
                return {
                    "success": False, 
                    "message": "Error during the edit of the public/private section", 
                    "toast_class" : "danger"
                }, 500
            return redirect(url_for("access_denied"))
        return {
            "success": False, 
            "message": "No convert history for this id", 
            "toast_class" : "danger"
            }, 500
    return {
        "success": False, 
        "message": "No id provided", 
        "toast_class" : "danger"
        }, 404

#########################
#   Share the convert   #
#########################

@convert_blueprint.route("/get_share_key", methods=['GET'])
@login_required
def get_share_key():
    """Get the share key of a convert"""
    id = request.args.get('id', 1, type=int)
    if id:
        convert = ConvertModel.get_convert(id)
        if convert:
            if convert.user_id == current_user.id or current_user.is_admin():
                return {
                    "success": True, 
                    "share_key": convert.share_key,
                    "message": "Share key found", 
                    "toast_class" : "success"
                    }, 200
            return redirect(url_for("access_denied"))
        return {
            "success": False, 
            "message": "No convert history for this id", 
            "toast_class" : "danger"
            }, 500
    return {
        "success": False, 
        "message": "No id provided", 
        "toast_class" : "danger"
        }, 500


@convert_blueprint.route("/regenerate_share_key", methods=['GET'])
@login_required
def regenerate_share_key():
    """Regenerate the share key of a convert"""
    id = request.args.get('id', 1, type=int)
    if id:
        convert = ConvertModel.get_convert(id)
        if convert:
            if convert.user_id == current_user.id or current_user.is_admin():
                success , new_share_key = ConvertModel.regenerate_share_key_convert(id)
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
            return redirect(url_for("access_denied"))
        return {
            "success": False, 
            "message": "No convert history for this id", 
            "toast_class" : "danger"
            }, 500
    return {
        "success": False, 
        "message": "No id provided", 
        "toast_class" : "danger"
        }, 500
    
# https://cti-transmute.org/convert/share?uuid=${convert?.uuid || ''}&share_key=${share_key}`
@convert_blueprint.route("/share", methods=['GET'])
def share_convert():
    """Share a convert using uuid and share_key"""
    uuid = request.args.get('uuid', type=str)
    share_key = request.args.get('share_key', type=str)

    if not uuid or not share_key:
        flash("Please provide a valid UUID and Share Key", "danger")
        return redirect(url_for("convert.history"))
    print(f"UUID: {uuid}, Share Key: {share_key}")
    convert = ConvertModel.get_convert_by_uuid(uuid)
    if not convert:
        flash("No convert found for the provided UUID", "danger")
        return redirect(url_for("convert.history"))

    if convert.share_key != share_key:
        flash("The provided Share Key is invalid", "danger")
        return redirect(url_for("convert.history"))

    return render_template("convert/detail.html", convert=convert)



###########################
#   Refresh a conversion  #
###########################

@convert_blueprint.route("/refresh/<string:uuid>", methods=['GET', 'POST'])
def refresh(uuid):

    convert_obj = ConvertModel.get_convert_by_uuid(uuid)

    if not convert_obj:
        flash("Conversion not found.", "danger")
        return redirect(url_for("convert.history"))

    # Choose which WTForm to use
    if convert_obj.conversion_type == "MISP_TO_STIX":
        print("Using MISP to STIX form")
        form = mispToStixParamForm()
    elif convert_obj.conversion_type == "STIX_TO_MISP":
        print("Using STIX to MISP form")
        form = stixToMispParamForm()
    else:
        flash("Unsupported conversion type.", "danger")
        return redirect(url_for("convert.history"))

    # Prefill form (GET)
    if request.method == "GET":
        form.name.data = convert_obj.name
        form.description.data = convert_obj.description
        form.public.data = convert_obj.public

    result = None
    diff = None
    error = None

    if form.validate_on_submit():

        # Call the generic dispatcher
        new_output, is_identical, error_msg = ConvertModel.reconvert_conversion(convert_obj, form)

        if error_msg:
            error = error_msg
            flash(error_msg, "danger")
        else:
            if not is_identical:
                flash("Conversion re-executed successfully! Changes detected.", "success")
                result = new_output
                diff = "The new conversion result is DIFFERENT from the previous one."
            else:
                flash("Conversion re-executed successfully! No changes detected.", "success")
                result = new_output
                diff = "The new conversion result is IDENTICAL to the previous one."

    return render_template(
        "convert/refresh.html",
        form=form,
        convert_obj=convert_obj,
        result=result,
        diff=diff,
        error=error,
        filename=f"{convert_obj.name}_refresh.json"
    )


# get_history

@convert_blueprint.route("/get_history", methods=['GET'])
@login_required
def get_history():
    id = request.args.get('id', 1, type=int)
    if id:
        convert_obj = ConvertModel.get_convert(id)
        if convert_obj:
            if not convert_obj.public and current_user.id != convert_obj.user_id and not current_user.is_admin():
                return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
            latest_history = ConvertModel.get_history_list(convert_obj.id)
            if latest_history:
                return {
                    "success": True,
                    "history_convert": [h.to_json() for h in latest_history],
                    "message": "New convert found",
                    "toast_class" : "success"
                    }, 200
            return {
                "success": True,
                "message": "No conversion history found for this convert",
                "toast_class" : "danger"
                }, 200
        return {
            "success": False,
            "message": "No convert found for this id",
            "toast_class" : "danger"
            }, 404
    return {
        "success": False,
        "message": "No id provided",
        "toast_class" : "danger"
        }, 400




@convert_blueprint.route("/get_new_convert", methods=['GET'])
@login_required
def get_new_convert():
    """Get the new convert after a refresh to show the difference"""
    id = request.args.get('id', 1, type=int)
    if id:
        convert_obj = ConvertModel.get_convert(id)
        if convert_obj:
            if not convert_obj.public and current_user.id != convert_obj.user_id and not current_user.is_admin():
                return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
            latest_history = ConvertModel.get_latest_history_list(convert_obj.id)
            if latest_history:
                return {
                    "success": True,
                    "history_convert": [h.to_json() for h in latest_history],
                    "message": "New convert found",
                    "toast_class" : "success"
                    }, 200
            return {
                "success": True,
                "message": "No conversion history found for this convert",
                "toast_class" : "danger"
                }, 200
        return {
            "success": False,
            "message": "No convert found for this id",
            "toast_class" : "danger"
            }, 404
    return {
        "success": False,
        "message": "No id provided",
        "toast_class" : "danger"
        }, 400


@convert_blueprint.route("/history_action", methods=['GET'])
@login_required
def history_action():
    """Handle actions related to conversion history"""
    action = request.args.get('action')
    history_id = request.args.get('history_id', type=int)
    convert_id = request.args.get('convert_id', type=int)

    if current_user.is_anonymous():
        return {
            "success": False,
            "message": "You must be logged in to perform this action.",
            "toast_class": "danger"
        }, 401
    if not current_user.is_admin() and current_user.id != ConvertModel.get_convert(convert_id).user_id:
        return {
            "success": False,
            "message": "You do not have permission to perform this action.",
            "toast_class": "danger"
        }, 403
    else:
        # --- Handle Conversion History Actions (Accept/Reject) ---
        if history_id and action in ["accept", "reject"]:
            
            if action == "accept":
                success = ConvertModel.accept_history(history_id)
            elif action == "reject":
                success = ConvertModel.reject_history(history_id)
            success = True # Replace with actual database call
            
            if success:
                flash("Convert history updated", "success")
                return {
                    "success": True,
                    "message": f"History entry {history_id} {action}ed successfully.",
                    "toast_class": "success"
                }, 200
            return {
                "success": False,
                "message": f"Failed to {action} history entry {history_id}.",
                "toast_class": "danger"
            }, 500

    # --- Default Error ---
    return {
        "success": False,
        "message": "Invalid action or missing parameters (history_id or convert_id).",
        "toast_class": "danger"
    }, 400


@convert_blueprint.route("/difference/<int:id>", methods=['GET'])
def difference(id):
    """Show the difference between two convert versions"""
    convert_obj_history = ConvertModel.get_convert_history_by_id(id)
    if not convert_obj_history:
        flash("Conversion not found.", "danger")
        return redirect(url_for("convert.history"))

    convert_obj = ConvertModel.get_convert(convert_obj_history.convert_id)
    if not convert_obj:
        flash("Conversion not found.", "danger")
        return redirect(url_for("convert.history"))
    
    if convert_obj.public == False:
        if current_user.is_anonymous():
            flash("You must be logged in to view this convert if you are the owner of this convert.", "warning")
            return redirect(url_for("account.login"))  

        if current_user.id != convert_obj.user_id and not current_user.is_admin():
            flash("You do not have permission to view this convert.", "danger")
            return redirect(url_for("convert.history"))
        
        return render_template(
            "convert/compare_version/difference.html",
            old_result=convert_obj_history.old_output_text,
            new_result=convert_obj_history.new_output_text,
            convert_obj=convert_obj,
            history_id=convert_obj_history.id
        )
    else:
        return render_template(
            "convert/compare_version/difference.html",
            old_result=convert_obj_history.old_output_text,
            new_result=convert_obj_history.new_output_text,
            convert_obj=convert_obj,
            history_id=convert_obj_history.id
        )

# get_history_details
@convert_blueprint.route("/get_history_details", methods=['GET'])
@login_required
def get_history_details():
    """Get the details of a convert history entry"""
    history_id = request.args.get('history_id', type=int)
    if history_id:
        convert_history = ConvertModel.get_convert_history_by_id(history_id)
        if convert_history:
            convert_obj = ConvertModel.get_convert(convert_history.convert_id)
            if convert_obj and not convert_obj.public:
                if current_user.id != convert_obj.user_id and not current_user.is_admin():
                    return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
            return {
                "success": True,
                "history": convert_history.to_json(),
                "message": "Convert history found",
                "toast_class" : "success"
                }, 200
        return {
            "success": False,
            "message": "No convert history found for this id",
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

@convert_blueprint.route("/get_comments", methods=['GET'])
def get_comments():
    """Return visible comments for a convert."""
    convert_id = request.args.get('convert_id', type=int)
    if not convert_id:
        return {"success": False, "message": "Missing convert_id", "toast_class": "danger"}, 400

    convert = ConvertModel.get_convert(convert_id)
    if not convert:
        return {"success": False, "message": "Convert not found", "toast_class": "danger"}, 404

    uid = current_user.id if current_user.is_authenticated else None
    is_admin = current_user.is_admin() if current_user.is_authenticated else False

    comments = ConvertModel.get_comments(
        convert_id=convert_id,
        current_user_id=uid,
        is_admin=is_admin,
        convert_owner_id=convert.user_id
    )
    return {"success": True, "comments": comments}, 200


@convert_blueprint.route("/comment", methods=['POST'])
@login_required
def add_comment():
    """Create a comment or reply on a convert."""
    data = request.get_json(silent=True) or {}
    convert_id = data.get('convert_id')
    content = (data.get('content') or '').strip()
    is_private = bool(data.get('is_private', False))
    parent_id = data.get('parent_id')

    if not convert_id or not content:
        return {"success": False, "message": "Missing content or convert_id", "toast_class": "danger"}, 400
    if len(content) > 2000:
        return {"success": False, "message": "Comment is too long (max 2000 characters)", "toast_class": "danger"}, 400

    convert = ConvertModel.get_convert(convert_id)
    if not convert:
        return {"success": False, "message": "Convert not found", "toast_class": "danger"}, 404

    if not convert.public and not current_user.is_admin() and current_user.id != convert.user_id:
        return {"success": False, "message": "You cannot comment on a private convert", "toast_class": "danger"}, 403

    comment = ConvertModel.create_comment(
        convert_id=convert_id,
        user_id=current_user.id,
        content=content,
        is_private=is_private,
        parent_id=parent_id if parent_id else None
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
        target_name=f"On convert: {convert.name}",
        details=f"{action.capitalize()} — {content[:120]}{'…' if len(content) > 120 else ''}"
    )

    if parent_id:
        parent = ConvertModel.get_comment(parent_id)
        if parent:
            AccountModel.notify_comment_reply(parent, comment, current_user.id)

    return {
        "success": True,
        "message": "Comment posted",
        "toast_class": "success",
        "comment": comment.to_json(
            current_user_id=current_user.id,
            is_admin=current_user.is_admin(),
            convert_owner_id=convert.user_id
        )
    }, 201


@convert_blueprint.route("/delete_comment", methods=['GET'])
@login_required
def delete_comment():
    """Soft-delete a comment."""
    comment_id = request.args.get('comment_id', type=int)
    if not comment_id:
        return {"success": False, "message": "Missing comment_id", "toast_class": "danger"}, 400

    comment = ConvertModel.get_comment(comment_id)
    success, message = ConvertModel.delete_comment(
        comment_id=comment_id,
        requesting_user_id=current_user.id,
        is_admin=current_user.is_admin()
    )
    if success and comment:
        AccountModel.create_system_log("comment_deleted", actor_id=current_user.id, actor_name=current_user.first_name, target_type="comment", target_id=comment_id, target_name=f"On convert #{comment.convert_id}", details=comment.content[:120] if comment.content else None)
    return {
        "success": success,
        "message": message,
        "toast_class": "success" if success else "danger"
    }, 200 if success else 403


@convert_blueprint.route("/toggle_comment_private", methods=['GET'])
@login_required
def toggle_comment_private():
    """Toggle the private/public visibility of a comment."""
    comment_id = request.args.get('comment_id', type=int)
    if not comment_id:
        return {"success": False, "message": "Missing comment_id", "toast_class": "danger"}, 400

    success, message, new_private = ConvertModel.toggle_comment_private(
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


@convert_blueprint.route("/react", methods=['POST'])
@login_required
def react():
    """Toggle an emoji reaction on a comment."""
    data = request.get_json(silent=True) or {}
    comment_id = data.get('comment_id')
    emoji = data.get('emoji', '').strip()

    allowed_emojis = ['👍', '😊', '❤️', '🎯', '⚠️']
    if not comment_id or emoji not in allowed_emojis:
        return {"success": False, "message": "Invalid request", "toast_class": "danger"}, 400

    success, added = ConvertModel.react_to_comment(comment_id, current_user.id, emoji)
    if not success:
        return {"success": False, "message": "Failed to update reaction", "toast_class": "danger"}, 500

    return {
        "success": True,
        "added": added,
        "message": "Reaction added" if added else "Reaction removed",
        "toast_class": "success"
    }, 200


###########################
#   Report a Convert      #
###########################

@convert_blueprint.route("/report", methods=['POST'])
@login_required
def report_convert():
    """Submit a report on a convert."""
    data = request.get_json(silent=True) or {}
    convert_id = data.get('convert_id')
    reason = data.get('reason', '').strip()
    description = (data.get('description') or '').strip() or None

    if not convert_id or reason not in ConvertModel.REPORT_REASONS:
        return {"success": False, "message": "Invalid request", "toast_class": "danger"}, 400
    if description and len(description) > 1000:
        return {"success": False, "message": "Description is too long (max 1000 characters)", "toast_class": "danger"}, 400

    convert = ConvertModel.get_convert(convert_id)
    if not convert:
        return {"success": False, "message": "Convert not found", "toast_class": "danger"}, 404

    report = ConvertModel.create_report(
        convert_id=convert_id,
        user_id=current_user.id,
        reason=reason,
        description=description
    )
    if not report:
        return {"success": False, "message": "Failed to submit report", "toast_class": "danger"}, 500

    AccountModel.notify_admins_new_report(convert, current_user.id)
    return {"success": True, "message": "Report submitted. Thank you.", "toast_class": "success"}, 201


@convert_blueprint.route("/admin/get_reports", methods=['GET'])
@login_required
def admin_get_reports():
    """Admin: get paginated reports."""
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status', type=str)
    search = request.args.get('search', '', type=str) or None
    pagination = ConvertModel.get_reports(page=page, status=status, search=search)
    return {
        "success": True,
        "list": [r.to_json() for r in pagination.items],
        "total_page": pagination.pages
    }, 200


@convert_blueprint.route("/admin/review_report", methods=['GET'])
@login_required
def admin_review_report():
    """Admin: mark a report as reviewed or dismissed."""
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    report_id = request.args.get('report_id', type=int)
    new_status = request.args.get('status', type=str)
    if not report_id or new_status not in ('reviewed', 'dismissed'):
        return {"success": False, "message": "Invalid params", "toast_class": "danger"}, 400
    success = ConvertModel.review_report(report_id, new_status, current_user.id)
    return {
        "success": success,
        "message": f"Report marked as {new_status}" if success else "Failed",
        "toast_class": "success" if success else "danger"
    }, 200 if success else 500


@convert_blueprint.route("/admin/delete_report", methods=['GET'])
@login_required
def admin_delete_report():
    """Admin: permanently delete a report."""
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    report_id = request.args.get('report_id', type=int)
    if not report_id:
        return {"success": False, "message": "Invalid params", "toast_class": "danger"}, 400
    report = ConvertModel.get_report(report_id)
    if not report:
        return {"success": False, "message": "Report not found", "toast_class": "danger"}, 404
    ConvertModel.delete_report(report_id)
    return {"success": True, "message": "Report deleted", "toast_class": "success"}, 200


##################################
#   Trash (soft-delete) routes   #
##################################

@convert_blueprint.route("/trash", methods=['GET'])
@login_required
def trash():
    if not current_user.is_admin():
        return redirect(url_for("convert.history"))
    return render_template("convert/trash.html")


@convert_blueprint.route("/get_trash", methods=['GET'])
@login_required
def get_trash():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str) or None
    pagination = ConvertModel.get_deleted_converts(page, search=search)
    return {
        "success": True,
        "list": [c.to_json_list() for c in pagination.items],
        "total_page": pagination.pages,
        "total_count": pagination.total,
        "page": page,
    }, 200


@convert_blueprint.route("/restore", methods=['POST'])
@login_required
def restore():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    data = request.get_json(silent=True) or {}
    convert_id = data.get('id') or request.args.get('id', type=int)
    if convert_id:
        convert_id = int(convert_id)
    convert = ConvertModel.get_convert(convert_id, include_deleted=True)
    if not convert:
        return {"success": False, "message": "Convert not found", "toast_class": "danger"}, 404
    if ConvertModel.restore_convert(convert_id):
        AccountModel.create_system_log("convert_restored", actor_id=current_user.id, actor_name=current_user.first_name, target_type="convert", target_id=convert_id, target_name=convert.name)
        return {"success": True, "message": f"'{convert.name}' restored successfully", "toast_class": "success"}, 200
    return {"success": False, "message": "Error restoring convert", "toast_class": "danger"}, 500


@convert_blueprint.route("/hard_delete", methods=['POST'])
@login_required
def hard_delete():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    data = request.get_json(silent=True) or {}
    convert_id = data.get('id') or request.args.get('id', type=int)
    if convert_id:
        convert_id = int(convert_id)
    convert = ConvertModel.get_convert(convert_id, include_deleted=True)
    if not convert:
        return {"success": False, "message": "Convert not found", "toast_class": "danger"}, 404
    _name = convert.name
    if ConvertModel.hard_delete_convert(convert_id):
        AccountModel.create_system_log("convert_hard_deleted", actor_id=current_user.id, actor_name=current_user.first_name, target_type="convert", target_id=convert_id, target_name=_name)
        return {"success": True, "message": f"'{_name}' permanently deleted", "toast_class": "success"}, 200
    return {"success": False, "message": "Error deleting convert", "toast_class": "danger"}, 500


@convert_blueprint.route("/bulk_action", methods=['POST'])
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
    for convert_id in ids:
        convert = ConvertModel.get_convert(convert_id, include_deleted=True)
        if not convert:
            continue
        if action == 'restore':
            if ConvertModel.restore_convert(convert_id):
                AccountModel.create_system_log("convert_restored", actor_id=current_user.id, actor_name=current_user.first_name, target_type="convert", target_id=convert_id, target_name=convert.name)
                done += 1
        else:
            _name = convert.name
            if ConvertModel.hard_delete_convert(convert_id):
                AccountModel.create_system_log("convert_hard_deleted", actor_id=current_user.id, actor_name=current_user.first_name, target_type="convert", target_id=convert_id, target_name=_name)
                done += 1
    label = "convert" if done == 1 else "converts"
    if action == 'restore':
        msg = f"{done} {label} restored"
    else:
        msg = f"{done} {label} permanently deleted"
    return {"success": True, "message": msg, "toast_class": "success" if done > 0 else "warning", "done": done}, 200


@convert_blueprint.route("/admin/get_all_comments", methods=['GET'])
@login_required
def admin_get_comments():
    """Admin: get all comments across all converts."""
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str) or None
    pagination = ConvertModel.get_all_comments_admin(page=page, search=search)
    items = []
    from website.db_class.db import Comment as CommentModel
    for c in pagination.items:
        d = c.to_json(current_user_id=current_user.id, is_admin=True)
        convert = ConvertModel.get_convert(c.convert_id, include_deleted=True)
        d["convert_name"] = convert.name if convert else "Unknown"
        d["convert_active"] = bool(convert and convert.is_active)
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