import functools
from pathlib import Path

from flask import Blueprint, render_template, request
from flask_login import current_user, login_required

from website.db_class.db import Tag
from . import tags_core as TagsModel
from ..account import account_core as AccountModel


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
        return render_template("access_denied.html")
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
    if not ids or action not in ("activate", "deactivate", "approve", "disapprove", "delete", "make_public", "make_private"):
        return {"success": False, "message": "Invalid request", "toast_class": "danger"}, 400
    count, err = TagsModel.bulk_action(ids, action)
    if err:
        return {"success": False, "message": err, "toast_class": "danger"}, 500
    label = {
        "activate": "activated", "deactivate": "deactivated",
        "approve": "approved", "disapprove": "approval revoked",
        "delete": "deleted", "make_public": "made public", "make_private": "made private",
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
    import datetime
    tag.visibility = "private" if tag.visibility == "public" else "public"
    tag.updated_at = datetime.datetime.utcnow()
    from website.web import db
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
        changed = [k for k in ("name", "description", "color", "icon", "source", "visibility", "is_active", "is_approved_by_admin") if k in data and data[k] is not None]
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
