import functools
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from flask import (
    Blueprint, abort, current_app, redirect, render_template, request, url_for)
from flask_login import current_user, login_required

from website.db_class.db import Conversion, Tag
from website.web import csrf, db
from website.web.tags import bulk_jobs
from website.web.utils import extract_tag_names_from_misp_json

from ..account import account_core as AccountModel
from . import tags_core as TagsModel


@functools.lru_cache(maxsize=1)
def _fa_solid_icons():
    svg_dir = Path(__file__).resolve().parent.parent / "static" / "fontawesome-6.3.0" / "svgs" / "solid"
    if not svg_dir.exists():
        return []
    return sorted(f.stem for f in svg_dir.glob("*.svg"))


tags_blueprint = Blueprint(
    "tags",
    __name__,
    template_folder="templates",
    static_folder="static",
)


# ── Icon catalog ─────────────────────────────────────────────────────────────

@tags_blueprint.route("/fa-icons", methods=["GET"])
@login_required
def fa_icons_list():
    return {"icons": _fa_solid_icons()}, 200


# ── Admin pages ──────────────────────────────────────────────────────────────

@tags_blueprint.route("/admin/")
@login_required
def admin_tags():
    if not current_user.is_admin():
        return abort(403)
    return render_template("admin/admin_tags.html")


@tags_blueprint.route("/admin/list", methods=["GET"])
@login_required
def admin_list():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403

    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 10000)
    search = request.args.get("search", "", type=str) or None
    source = request.args.get("source", "", type=str) or None
    visibility = request.args.get("visibility", "", type=str) or None
    approved = request.args.get("approved", "all", type=str)

    pagination = TagsModel.get_tags_page(
        page, source=source, visibility_filter=visibility,
        search=search, is_admin=True, per_page=per_page,
        pending_first=(approved == "all"),
    )

    items = pagination.items
    if approved == "approved":
        items = [t for t in items if t.is_approved_by_admin]
    elif approved == "pending":
        items = [t for t in items if not t.is_approved_by_admin]

    return {
        "success": True,
        "list": [t.to_json() for t in items],
        "total_page": pagination.pages,
    }, 200


@tags_blueprint.route("/admin/approve/<int:tag_id>", methods=["POST"])
@login_required
def admin_approve(tag_id):
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    approve = (request.get_json(silent=True) or {}).get("approve", True)
    tag = TagsModel.get_tag(tag_id)
    tag_name = tag.name if tag else f"#{tag_id}"
    success, err = TagsModel.admin_approve_tag(tag_id, approve=approve)
    if success:
        msg = "Tag approved and made public" if approve else "Approval revoked"
        AccountModel.create_system_log(
            "tag_approved" if approve else "tag_approval_revoked",
            actor_id=current_user.id, actor_name=current_user.first_name,
            target_type="tag", target_id=tag_id, target_name=tag_name,
            details="approved → public + active" if approve else "approval revoked",
        )
        return {"success": True, "message": msg, "toast_class": "success"}, 200
    return {"success": False, "message": err or "Error", "toast_class": "danger"}, 404


@tags_blueprint.route("/admin/toggle_active/<int:tag_id>", methods=["POST"])
@login_required
def admin_toggle_active(tag_id):
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    tag = TagsModel.get_tag(tag_id)
    tag_name = tag.name if tag else f"#{tag_id}"
    success, new_state = TagsModel.admin_toggle_active(tag_id)
    if success:
        label = "activated" if new_state else "deactivated"
        AccountModel.create_system_log(
            "tag_activated" if new_state else "tag_deactivated",
            actor_id=current_user.id, actor_name=current_user.first_name,
            target_type="tag", target_id=tag_id, target_name=tag_name,
        )
        return {"success": True, "is_active": new_state, "message": f"Tag {label}", "toast_class": "success"}, 200
    return {"success": False, "message": "Error", "toast_class": "danger"}, 404


@tags_blueprint.route("/admin/delete/<int:tag_id>", methods=["POST"])
@login_required
def admin_delete(tag_id):
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    tag = TagsModel.get_tag(tag_id)
    tag_name = tag.name if tag else f"#{tag_id}"
    success, err = TagsModel.delete_tag(tag_id, current_user.id, is_admin=True)
    if success:
        AccountModel.create_system_log(
            "tag_deleted",
            actor_id=current_user.id, actor_name=current_user.first_name,
            target_type="tag", target_id=tag_id, target_name=tag_name,
            details="deleted by admin",
        )
        return {"success": True, "message": "Tag deleted", "toast_class": "success"}, 200
    return {"success": False, "message": err or "Error", "toast_class": "danger"}, 404


@tags_blueprint.route("/admin/import_galaxies", methods=["POST"])
@login_required
def admin_import_galaxies():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    imported, skipped, errors = TagsModel.import_galaxies(admin_user_id=current_user.id)
    if imported or skipped:
        AccountModel.create_system_log(
            "tags_galaxy_imported",
            actor_id=current_user.id, actor_name=current_user.first_name,
            target_type="tag",
            details=f"imported {imported}, skipped {skipped}" + (f", {len(errors)} error(s)" if errors else ""),
        )
    return {
        "success": True,
        "imported": imported,
        "skipped": skipped,
        "errors": errors[:10],
        "message": f"Imported {imported} new galaxy tags, skipped {skipped} existing",
        "toast_class": "success" if not errors else "warning",
    }, 200


@tags_blueprint.route("/admin/vendor_status", methods=["GET"])
@login_required
def admin_vendor_status():
    """Return commit SHA + date for each MISP vendor submodule."""
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403

    def _git_info(path):
        try:
            sha = subprocess.run(
                ['git', 'rev-parse', '--short', 'HEAD'],
                cwd=str(path), capture_output=True, text=True, timeout=8,
            ).stdout.strip() or '?'
            date = subprocess.run(
                ['git', 'log', '-1', '--format=%ci'],
                cwd=str(path), capture_output=True, text=True, timeout=8,
            ).stdout.strip()[:10] or ''
        except Exception:
            sha, date = '?', ''
        return {'sha': sha, 'date': date}

    return {
        "success":    True,
        "taxonomies": _git_info(TagsModel.VENDOR_PATH),
        "galaxies":   _git_info(TagsModel.GALAXY_PATH),
    }, 200


@tags_blueprint.route("/admin/pull_and_import", methods=["POST"])
@login_required
def admin_pull_and_import():
    """Pull latest MISP vendor submodules then import new tags as a background job."""
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403

    jid = bulk_jobs.start_pull_and_import(current_app._get_current_object(), current_user.id)
    AccountModel.create_system_log(
        "tags_vendor_pull_started",
        actor_id=current_user.id, actor_name=current_user.first_name,
        target_type="tag", details=f"job {jid}",
    )
    return {"success": True, "job_id": jid}, 200


@tags_blueprint.route("/admin/import_taxonomies", methods=["POST"])
@login_required
def admin_import_taxonomies():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    imported, skipped, errors = TagsModel.import_taxonomies(admin_user_id=current_user.id)
    if imported or skipped:
        AccountModel.create_system_log(
            "tags_taxonomy_imported",
            actor_id=current_user.id, actor_name=current_user.first_name,
            target_type="tag",
            details=f"imported {imported}, skipped {skipped}" + (f", {len(errors)} error(s)" if errors else ""),
        )
    return {
        "success": True,
        "imported": imported,
        "skipped": skipped,
        "errors": errors[:10],
        "message": f"Imported {imported} new tags, skipped {skipped} existing",
        "toast_class": "success" if not errors else "warning",
    }, 200


@tags_blueprint.route("/admin/bulk", methods=["POST"])
@login_required
def admin_bulk():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    data = request.get_json(silent=True) or {}
    ids = data.get("ids", [])
    action = data.get("action", "")
    ALLOWED = ("activate", "deactivate", "approve", "disapprove", "delete",
               "make_public", "make_private", "enable_evaluation", "disable_evaluation")
    if not ids or action not in ALLOWED:
        return {"success": False, "message": "Invalid request", "toast_class": "danger"}, 400
    count, err = TagsModel.bulk_action(ids, action)
    if err:
        return {"success": False, "message": err, "toast_class": "danger"}, 500
    label = {
        "activate": "activated", "deactivate": "deactivated",
        "approve": "approved", "disapprove": "approval revoked",
        "delete": "deleted", "make_public": "made public", "make_private": "made private",
        "enable_evaluation": "enabled for evaluation", "disable_evaluation": "disabled for evaluation",
    }[action]
    AccountModel.create_system_log(
        "tag_bulk_action",
        actor_id=current_user.id, actor_name=current_user.first_name,
        target_type="tag",
        details=f"bulk {action}: {count} tag(s) {label}",
    )
    return {"success": True, "message": f"{count} tag(s) {label}", "toast_class": "success", "count": count}, 200


@tags_blueprint.route("/admin/toggle_visibility/<int:tag_id>", methods=["POST"])
@login_required
def admin_toggle_visibility(tag_id):
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    tag = TagsModel.get_tag(tag_id)
    if not tag:
        return {"success": False, "message": "Not found", "toast_class": "danger"}, 404
    tag.visibility = "private" if tag.visibility == "public" else "public"
    tag.updated_at = datetime.now(timezone.utc)
    try:
        db.session.commit()
        label = "public" if tag.visibility == "public" else "private"
        AccountModel.create_system_log(
            "tag_visibility_changed",
            actor_id=current_user.id, actor_name=current_user.first_name,
            target_type="tag", target_id=tag_id, target_name=tag.name,
            details=f"changed to {tag.visibility}",
        )
        return {"success": True, "visibility": tag.visibility, "message": f"Tag is now {label}", "toast_class": "success"}, 200
    except Exception:
        db.session.rollback()
        return {"success": False, "message": "Database error", "toast_class": "danger"}, 500


@tags_blueprint.route("/admin/edit/<int:tag_id>", methods=["POST"])
@login_required
def admin_edit(tag_id):
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden", "toast_class": "danger"}, 403
    data = request.get_json(silent=True) or {}
    tag, err = TagsModel.edit_tag(tag_id, current_user.id, is_admin=True, **data)
    if tag:
        changed = [k for k in ("name", "description", "color", "icon", "source", "visibility", "is_active", "is_approved_by_admin", "is_evaluation_tag") if k in data and data[k] is not None]
        AccountModel.create_system_log(
            "tag_edited",
            actor_id=current_user.id, actor_name=current_user.first_name,
            target_type="tag", target_id=tag_id, target_name=tag.name,
            details=f"updated: {', '.join(changed)}" if changed else "no fields changed",
        )
        return {"success": True, "message": "Tag updated", "tag": tag.to_json(), "toast_class": "success"}, 200
    return {"success": False, "message": err or "Error", "toast_class": "danger"}, 404


# ── User-facing routes ───────────────────────────────────────────────────────

@tags_blueprint.route("/create", methods=["POST"])
@login_required
def create_tag():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return {"success": False, "message": "Tag name is required", "toast_class": "danger"}, 400

    source = data.get("source", "Manual")
    if source not in ("Manual", "Vulnerability"):
        source = "Manual"

    if Tag.query.filter_by(name=name).first():
        return {"success": False, "message": "A tag with this name already exists", "toast_class": "warning"}, 409

    # Admin creating a Vulnerability tag → auto-approve, public, active
    # Custom tags are always private regardless of role
    # Regular users' Vulnerability tags also need approval
    auto_approve = current_user.is_admin() and source == "Vulnerability"

    tag = TagsModel.create_tag(
        name=name,
        description=data.get("description"),
        color=data.get("color"),
        icon=data.get("icon"),
        source=source,
        created_by=current_user.id,
        visibility="public" if auto_approve else "private",
        is_approved_by_admin=auto_approve,
        is_active=auto_approve,
    )
    if tag:
        msg = "Vulnerability tag created and published" if auto_approve else "Tag created — pending admin approval"
        AccountModel.create_system_log(
            "tag_created",
            actor_id=current_user.id, actor_name=current_user.first_name,
            target_type="tag", target_id=tag.id, target_name=tag.name,
            details=f"source={source}, visibility={tag.visibility}" + (", auto-approved" if auto_approve else ""),
        )
        return {"success": True, "message": msg, "tag": tag.to_json(), "toast_class": "success"}, 201
    return {"success": False, "message": "Failed to create tag", "toast_class": "danger"}, 500


@tags_blueprint.route("/list", methods=["GET"])
@login_required
def list_tags():
    page = request.args.get("page", 1, type=int)
    search = request.args.get("search", "", type=str) or None
    source = request.args.get("source", "", type=str) or None
    pagination = TagsModel.get_tags_page(
        page, source=source, search=search,
        current_user_id=current_user.id, is_admin=current_user.is_admin(),
    )
    return {
        "success": True,
        "list": [t.to_json() for t in pagination.items],
        "total_page": pagination.pages,
    }, 200


###################################
#   Conversion tag association    #
###################################

@tags_blueprint.route("/available", methods=["GET"])
@login_required
def available_tags():
    """Tags available to the current user for attaching to a conversion."""
    search = request.args.get("search", "", type=str).strip() or None
    source = request.args.get("source", "", type=str).strip() or None
    is_evaluation = request.args.get("is_evaluation", "false", type=str).lower() == "true"
    tags = TagsModel.get_available_tags(current_user.id, search=search, source=source, is_evaluation=is_evaluation)
    return {"success": True, "list": [t.to_json() for t in tags]}, 200


@tags_blueprint.route("/for_conversion/<int:conversion_id>", methods=["GET"])
def for_conversion(conversion_id):
    """Get tags attached to a conversion.
    Optional ?source_type=user|json to filter by origin."""
    conversion = Conversion.query.get(conversion_id)
    if not conversion:
        return {"success": False, "message": "Not found"}, 404
    if not conversion.public:
        if not current_user.is_authenticated:
            return {"success": False, "message": "Unauthorized"}, 403
        if current_user.id != conversion.user_id and not current_user.is_admin():
            return {"success": False, "message": "Forbidden"}, 403
    source_type = request.args.get("source_type") or None
    assocs = TagsModel.get_conversion_tags(conversion_id, source_type=source_type)
    return {"success": True, "list": [a.to_json() for a in assocs]}, 200


@tags_blueprint.route("/save_for_conversion/<int:conversion_id>", methods=["POST"])
@login_required
@csrf.exempt
def save_for_conversion(conversion_id):
    """Replace all tags for a conversion. Owner or admin only."""
    conversion = Conversion.query.get(conversion_id)
    if not conversion:
        return {"success": False, "message": "Conversion not found"}, 404
    if conversion.user_id != current_user.id and not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    data = request.get_json(silent=True) or {}
    tag_ids = [int(i) for i in data.get("tag_ids", []) if str(i).isdigit()]
    TagsModel.save_conversion_tags(conversion_id, tag_ids, current_user.id)
    return {"success": True, "message": "Tags saved"}, 200


@tags_blueprint.route("/delete/<int:tag_id>", methods=["POST"])
@login_required
def delete_tag(tag_id):
    tag = TagsModel.get_tag(tag_id)
    tag_name = tag.name if tag else f"#{tag_id}"
    is_admin = current_user.is_admin()
    success, err = TagsModel.delete_tag(tag_id, current_user.id, is_admin=is_admin)
    if success:
        AccountModel.create_system_log(
            "tag_deleted",
            actor_id=current_user.id, actor_name=current_user.first_name,
            target_type="tag", target_id=tag_id, target_name=tag_name,
            details="deleted by admin" if is_admin else "deleted by owner",
        )
        return {"success": True, "message": "Tag deleted", "toast_class": "success"}, 200
    return {"success": False, "message": err or "Error", "toast_class": "danger"}, 403


@tags_blueprint.route("/admin/bulk_conversions")
@login_required
def admin_bulk_conversions():
    if not current_user.is_admin():
        return abort(403)
    return render_template("admin/admin_bulk_tags.html")


@tags_blueprint.route("/admin/bulk_converts")
def legacy_admin_bulk_converts():
    """301 shim for the pre-rename page URL. Only the bookmarkable page gets
    one; the fetch sub-routes move shim-less with their callers."""
    dest = url_for(".admin_bulk_conversions")
    query = request.query_string.decode()
    if query:
        dest += "?" + query
    return redirect(dest, code=301)


@tags_blueprint.route("/admin/bulk_conversions/list", methods=["GET"])
@login_required
def admin_bulk_conversions_list():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 50, type=int), 200)
    search = request.args.get("search", "", type=str).strip() or None
    conv_type = request.args.get("type", "ALL", type=str).strip() or "ALL"

    pagination = TagsModel.get_conversions_page(page, per_page=per_page, search=search, conv_type=conv_type)
    tag_map = TagsModel.get_conversion_tags_batch([c.id for c in pagination.items])

    items = [
        {"id": c.id, "name": c.name, "conversion_type": c.conversion_type,
         "created_at": c.created_at.strftime('%Y-%m-%d %H:%M') if c.created_at else "",
         "tag_count": len(tag_map.get(c.id, []))}
        for c in pagination.items
    ]
    return {"success": True, "list": items, "total_page": pagination.pages, "total": pagination.total}, 200


@tags_blueprint.route("/admin/bulk_conversions/all_ids", methods=["GET"])
@login_required
def admin_bulk_conversions_all_ids():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    search = request.args.get("search", "", type=str).strip() or None
    conv_type = request.args.get("type", "ALL", type=str).strip() or "ALL"
    ids = TagsModel.get_conversion_ids(search=search, conv_type=conv_type)
    return {"success": True, "ids": ids}, 200


@tags_blueprint.route("/admin/bulk_conversions/scan", methods=["POST"])
@login_required
@csrf.exempt
def admin_bulk_scan():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    data = request.get_json(silent=True) or {}
    conversion_ids = [int(i) for i in data.get("conversion_ids", []) if str(i).isdigit()]
    if not conversion_ids:
        return {"success": False, "message": "No conversions selected"}, 400
    jid = bulk_jobs.start_scan(current_app._get_current_object(), conversion_ids, current_user.id)
    AccountModel.create_system_log(
        "bulk_tag_scan",
        actor_id=current_user.id, actor_name=current_user.first_name,
        target_type="conversion",
        details=f"auto-scan tags on {len(conversion_ids)} conversion(s), job={jid}"
    )
    return {"success": True, "job_id": jid}, 200


@tags_blueprint.route("/admin/bulk_conversions/assign", methods=["POST"])
@login_required
@csrf.exempt
def admin_bulk_assign():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    data = request.get_json(silent=True) or {}
    conversion_ids = [int(i) for i in data.get("conversion_ids", []) if str(i).isdigit()]
    tag_ids = [int(i) for i in data.get("tag_ids", []) if str(i).isdigit()]
    if not conversion_ids or not tag_ids:
        return {"success": False, "message": "No conversions or tags selected"}, 400
    jid = bulk_jobs.start_assign(current_app._get_current_object(), conversion_ids, tag_ids, current_user.id)
    AccountModel.create_system_log(
        "bulk_tag_assign",
        actor_id=current_user.id, actor_name=current_user.first_name,
        target_type="conversion",
        details=f"assign {len(tag_ids)} tag(s) to {len(conversion_ids)} conversion(s), job={jid}"
    )
    return {"success": True, "job_id": jid}, 200


@tags_blueprint.route("/admin/bulk_conversions/job/<job_id>", methods=["GET"])
@login_required
def admin_bulk_job_status(job_id):
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    job = bulk_jobs.get(job_id)
    if not job:
        return {"success": False, "message": "Job not found"}, 404
    return {"success": True, "job": job}, 200


@tags_blueprint.route("/admin/bulk_conversions/jobs", methods=["GET"])
@login_required
def admin_bulk_jobs_list():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    return {"success": True, "jobs": bulk_jobs.list_recent()}, 200


@tags_blueprint.route("/admin/bulk_conversions/job/<job_id>", methods=["DELETE"])
@login_required
@csrf.exempt
def admin_bulk_job_delete(job_id):
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    removed = bulk_jobs.remove(job_id)
    if removed:
        return {"success": True}, 200
    return {"success": False, "message": "Job not found"}, 404


@tags_blueprint.route("/admin/bulk_conversions/remove_tags", methods=["POST"])
@login_required
@csrf.exempt
def admin_bulk_remove_tags():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    data = request.get_json(silent=True) or {}
    conversion_ids = [int(i) for i in data.get("conversion_ids", []) if str(i).isdigit()]
    tag_ids = [int(i) for i in data.get("tag_ids", []) if str(i).isdigit()]
    if not conversion_ids or not tag_ids:
        return {"success": False, "message": "No conversions or tags selected"}, 400
    jid = bulk_jobs.start_remove(current_app._get_current_object(), conversion_ids, tag_ids, current_user.id)
    AccountModel.create_system_log(
        "bulk_tag_remove",
        actor_id=current_user.id, actor_name=current_user.first_name,
        target_type="conversion",
        details=f"remove {len(tag_ids)} tag(s) from {len(conversion_ids)} conversion(s), job={jid}"
    )
    return {"success": True, "job_id": jid}, 200


@tags_blueprint.route("/admin/bulk_conversions/clear_tags", methods=["POST"])
@login_required
@csrf.exempt
def admin_bulk_clear_tags():
    if not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    data = request.get_json(silent=True) or {}
    conversion_ids = [int(i) for i in data.get("conversion_ids", []) if str(i).isdigit()]
    if not conversion_ids:
        return {"success": False, "message": "No conversions selected"}, 400
    jid = bulk_jobs.start_clear(current_app._get_current_object(), conversion_ids, current_user.id)
    AccountModel.create_system_log(
        "bulk_tag_clear",
        actor_id=current_user.id, actor_name=current_user.first_name,
        target_type="conversion",
        details=f"clear all tags from {len(conversion_ids)} conversion(s), job={jid}"
    )
    return {"success": True, "job_id": jid}, 200


@tags_blueprint.route("/get_all_tags_usage", methods=["GET"])
def get_all_tags_usage():
    result = TagsModel.get_all_tags_usage()
    return {"tags": result}, 200


@tags_blueprint.route("/extract_from_json", methods=["POST"])
@login_required
@csrf.exempt
def extract_from_json():
    """Extract tags from a raw JSON string and return available matching tags."""
    data = request.get_json(silent=True) or {}
    content = data.get("content", "").strip()
    if not content:
        return {"success": False, "message": "No content provided"}, 400
    names = extract_tag_names_from_misp_json(content)
    tags = TagsModel.find_tags_by_names(current_user.id, names)
    return {"success": True, "list": [t.to_json() for t in tags], "found_names": len(names)}, 200


@tags_blueprint.route("/extract_from_conversion/<int:conversion_id>", methods=["GET"])
@login_required
def extract_from_conversion(conversion_id):
    """Extract tags from a stored conversion's MISP JSON and return available matching tags."""
    conversion = Conversion.query.get(conversion_id)
    if not conversion:
        return {"success": False, "message": "Conversion not found"}, 404
    if conversion.user_id != current_user.id and not current_user.is_admin():
        return {"success": False, "message": "Forbidden"}, 403
    # STIX→MISP: MISP JSON is in output_text; MISP→STIX: MISP JSON is in input_text
    misp_text = conversion.output_text if conversion.conversion_type == "STIX_TO_MISP" else conversion.input_text
    names = extract_tag_names_from_misp_json(misp_text or '')
    tags = TagsModel.find_tags_by_names(current_user.id, names)
    return {"success": True, "list": [t.to_json() for t in tags], "found_names": len(names)}, 200
