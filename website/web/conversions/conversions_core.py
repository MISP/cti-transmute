"""Feature-level persistence for the conversions blueprint's non-Conversion concerns.

Conversion and ConversionHistory rows — including their listing, access-scoped
search, and Trash queries - live in ``website/repos/conversions.py``; Comment
and CommentReaction writes live in ``website/repos/comments.py`` (this module
keeps only the comment read/query helpers; the comment visibility rule is
``website.lib.access.can_see_comment``). This module (imported as
``ConversionModel``) also keeps the report, favorite, and graph-config helpers
used by the conversion views.
"""
import json
import re
import uuid
from datetime import datetime, timezone

from sqlalchemy import or_

from website.db_class.db import (
    Comment, ConversionFavorite, ConversionReport, GraphConfig)
from website.lib import access
from website.repos import conversions as conv_repo
from website.web import db

###################################
#   Comment read/query helpers    #
###################################

def get_comments(conversion_id, user=None):
    """Return the top-level comments and replies the Submitter may see."""
    conversion = conv_repo.get(conversion_id)
    if not conversion:
        return []

    # `to_json` renders viewer-dependent fields (can_edit/can_delete/…) from
    # primitives; derive them from the Submitter once.
    current_user_id = getattr(user, "id", None)
    is_admin = access.is_admin(user)

    top_level = (
        Comment.query
        .filter_by(conversion_id=conversion_id, parent_id=None)
        .filter_by(is_deleted=False)
        .order_by(Comment.created_at.asc())
        .all()
    )

    result = []
    for c in top_level:
        if not access.can_see_comment(user, c, conversion):
            continue
        comment_data = c.to_json(current_user_id=current_user_id, is_admin=is_admin, conversion_owner_id=conversion.user_id)
        replies = (
            Comment.query
            .filter_by(conversion_id=conversion_id, parent_id=c.id)
            .filter_by(is_deleted=False)
            .order_by(Comment.created_at.asc())
            .all()
        )
        comment_data["replies"] = [
            r.to_json(current_user_id=current_user_id, is_admin=is_admin, conversion_owner_id=conversion.user_id)
            for r in replies
            if access.can_see_comment(user, r, conversion)
        ]
        result.append(comment_data)
    return result


def get_all_comments_admin(page=1, search=None):
    """Admin: paginated list of all non-deleted comments across all conversions."""
    query = Comment.query.filter_by(is_deleted=False)
    if search:
        query = query.filter(Comment.content.ilike(f"%{search}%"))
    return query.order_by(Comment.created_at.desc()).paginate(page=page, per_page=20)


###################################
#   Report read/query helpers     #
###################################
# Report writes (create / set_status / delete) live in
# ``website/repos/reports.py`` - the single persistence home for the
# ConversionReport aggregate. This module keeps only the admin read/query
# helpers below.


def get_reports(page=1, status=None, search=None):
    """Admin: paginated list of reports."""
    query = ConversionReport.query
    if status:
        query = query.filter_by(status=status)
    if search:
        query = query.filter(
            ConversionReport.reason.ilike(f"%{search}%") |
            ConversionReport.description.ilike(f"%{search}%")
        )
    return query.order_by(ConversionReport.created_at.desc()).paginate(page=page, per_page=20)


def get_report(report_id):
    return ConversionReport.query.get(report_id)

###################################
#   Graph configs                 #
###################################

# A saved graph config is user input replayed into other users' browsers
# (admins see every config), and Pivotick HTML-parses some style fields, so
# the stored JSON is held to a strict schema: known keys only, typed and
# bounded values. Style entries accept exactly shape/color/size - svgIcon
# (parsed as HTML by Pivotick) and iconClass (written to className) are
# deliberately not accepted. Bounds mirror the config modal's form inputs.
# Mirrored client-side by sanitizeConfigPatch in
# website/web/static/js/graph/graphSafety.js - keep the two in sync.

_CONFIG_SHAPES = {"circle", "square", "hexagon", "triangle"}
_CONFIG_LAYOUTS = {"force", "tree", "radial", "grid"}
_CONFIG_UI_MODES = {"full", "minimal"}
_CONFIG_SIDES = {"input", "output"}
# Style-map keys and MISP attribute types are plain identifiers
# ('threat-actor', 'ipv4-addr', 'filename|md5', '_default'). Matched with
# fullmatch so a trailing newline fails, exactly like the JS mirror.
_CONFIG_IDENT_RE = re.compile(r"[A-Za-z0-9_.|-]{1,100}")
# Hex, a bare colour name, or an rgb()/hsl() function with a plain numeric
# body - notably NOT url(...), which can beacon from an SVG fill.
_CONFIG_COLOR_RE = re.compile(
    r"#[0-9A-Fa-f]{3,8}|[A-Za-z]{1,30}|(rgba?|hsla?)\([0-9,.%/\s]{1,50}\)")


def _config_num(value, lo, hi):
    return (isinstance(value, (int, float)) and not isinstance(value, bool)
            and lo <= value <= hi)


def _validate_style_map(name, styles, problems):
    clean = {}
    if not isinstance(styles, dict):
        problems.append(f"{name} must be an object")
        return clean
    for key, style in styles.items():
        if not isinstance(key, str) or not _CONFIG_IDENT_RE.fullmatch(key):
            problems.append(f"{name}: invalid type name {key!r}")
            continue
        if not isinstance(style, dict):
            problems.append(f"{name}.{key} must be an object")
            continue
        entry = {}
        for prop, value in style.items():
            if prop == "shape" and value in _CONFIG_SHAPES:
                entry["shape"] = value
            elif prop == "color" and isinstance(value, str) and _CONFIG_COLOR_RE.fullmatch(value):
                entry["color"] = value
            elif prop == "size" and _config_num(value, 6, 50):
                entry["size"] = value
            else:
                problems.append(f"{name}.{key}: unsupported property or value {prop!r}")
        if entry:
            clean[key] = entry
    return clean


def _validate_type_list(name, values, problems):
    clean = []
    if not isinstance(values, list):
        problems.append(f"{name} must be a list")
        return clean
    for value in values:
        if isinstance(value, str) and _CONFIG_IDENT_RE.fullmatch(value):
            clean.append(value)
        else:
            problems.append(f"{name}: invalid entry {value!r}")
    return clean


def validate_graph_config(config):
    """Validate a parsed graph-config dict against the known schema.

    Returns ``(clean, problems)``: ``clean`` holds only the accepted keys and
    values, ``problems`` a human-readable string per dropped item (empty when
    the config conforms).
    """
    clean = {}
    problems = []
    if not isinstance(config, dict):
        return clean, ["config must be a JSON object"]
    for key, value in config.items():
        if key == "maxNodes":
            if _config_num(value, 10, 50000):
                clean["maxNodes"] = value
            else:
                problems.append("maxNodes must be a number between 10 and 50000")
        elif key == "defaultSide":
            if value in _CONFIG_SIDES:
                clean["defaultSide"] = value
            else:
                problems.append("defaultSide must be 'input' or 'output'")
        elif key == "groupingThreshold":
            if _config_num(value, 2, 50):
                clean["groupingThreshold"] = value
            else:
                problems.append("groupingThreshold must be a number between 2 and 50")
        elif key == "layout":
            if isinstance(value, dict) and set(value) == {"type"} and value["type"] in _CONFIG_LAYOUTS:
                clean["layout"] = {"type": value["type"]}
            else:
                problems.append("layout must be {'type': force|tree|radial|grid}")
        elif key == "pivotickUI":
            ui = {}
            if isinstance(value, dict) and set(value) <= {"mode", "sidebar"}:
                if "mode" in value:
                    if value["mode"] in _CONFIG_UI_MODES:
                        ui["mode"] = value["mode"]
                    else:
                        problems.append("pivotickUI.mode must be 'full' or 'minimal'")
                if "sidebar" in value:
                    sidebar = value["sidebar"]
                    if (isinstance(sidebar, dict) and set(sidebar) == {"collapsed"}
                            and (sidebar["collapsed"] == "auto" or isinstance(sidebar["collapsed"], bool))):
                        ui["sidebar"] = {"collapsed": sidebar["collapsed"]}
                    else:
                        problems.append("pivotickUI.sidebar must be {'collapsed': auto|true|false}")
            else:
                problems.append("pivotickUI accepts only 'mode' and 'sidebar'")
            if ui:
                clean["pivotickUI"] = ui
        elif key in ("stixStyles", "mispStyles"):
            styles = _validate_style_map(key, value, problems)
            if styles:
                clean[key] = styles
        elif key in ("mispNetworkTypes", "mispPayloadTypes"):
            types = _validate_type_list(key, value, problems)
            # An empty list is a legitimate value (it clears the type set),
            # unlike an empty style map, which is dropped above.
            if isinstance(value, list):
                clean[key] = types
        else:
            problems.append(f"unknown key {key!r}")
    return clean, problems


def sanitize_stored_graph_config(config_json):
    """Re-filter a stored config's JSON through the schema on the way out.

    Rows saved before the schema landed (or written around the route) may
    carry fields Pivotick would HTML-parse; anything outside the schema is
    silently dropped so it can never reach a browser.
    """
    try:
        parsed = json.loads(config_json)
    except Exception:
        return "{}"
    clean, _ = validate_graph_config(parsed)
    return json.dumps(clean)


def get_graph_configs(user_id=None, is_admin=False):
    query = GraphConfig.query.filter(GraphConfig.is_active)
    if not is_admin:
        if user_id:
            query = query.filter(
                or_(GraphConfig.is_default, GraphConfig.created_by == user_id)
            )
        else:
            query = query.filter(GraphConfig.is_default)
    return query.order_by(GraphConfig.is_default.desc(), GraphConfig.created_at.desc()).all()


def save_graph_config(name, config_json, created_by):
    try:
        now = datetime.now(timezone.utc)
        cfg = GraphConfig(
            uuid=str(uuid.uuid4()),
            name=name.strip()[:100],
            config_json=config_json,
            created_by=created_by,
            is_active=True,
            is_default=False,
            created_at=now,
            updated_at=now,
        )
        db.session.add(cfg)
        db.session.commit()
        return cfg, None
    except Exception as e:
        db.session.rollback()
        return None, str(e)


def delete_graph_config(config_id, user_id, is_admin):
    cfg = GraphConfig.query.get(config_id)
    if not cfg:
        return False, "Not found"
    if cfg.is_default:
        return False, "Cannot delete system defaults"
    if not is_admin and cfg.created_by != user_id:
        return False, "Forbidden"
    try:
        if is_admin:
            db.session.delete(cfg)
        else:
            cfg.is_active = False
            cfg.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return True, None
    except Exception as e:
        db.session.rollback()
        return False, str(e)


###################################
#   Favorites                     #
###################################

def toggle_favorite(user_id: int, conversion_id: int) -> bool:
    """Toggle favorite for a user on a conversion. Returns True if now favorited, False if removed."""
    existing = ConversionFavorite.query.filter_by(user_id=user_id, conversion_id=conversion_id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return False
    db.session.add(
        ConversionFavorite(
            user_id=user_id,
            conversion_id=conversion_id,
            created_at=datetime.now(timezone.utc)
        )
    )
    db.session.commit()
    return True


def get_favorite_ids(user_id: int) -> set:
    """Return the set of conversion IDs favorited by this user."""
    rows = ConversionFavorite.query.filter_by(user_id=user_id).with_entities(ConversionFavorite.conversion_id).all()
    return {r.conversion_id for r in rows}


def is_favorite(user_id: int, conversion_id: int) -> bool:
    return ConversionFavorite.query.filter_by(user_id=user_id, conversion_id=conversion_id).first() is not None
