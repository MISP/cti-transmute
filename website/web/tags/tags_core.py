import datetime
import json
import uuid
from pathlib import Path

from sqlalchemy import or_

from website.db_class.db import Tag
from website.web import db

VENDOR_PATH = Path(__file__).resolve().parent.parent.parent.parent / "vendor" / "misp-taxonomies"


def get_tags_page(page, source=None, visibility_filter=None, search=None,
                  current_user_id=None, is_admin=False, per_page=20):
    query = Tag.query

    if not is_admin:
        if current_user_id:
            query = query.filter(
                or_(Tag.visibility == "public", Tag.created_by == current_user_id)
            )
        else:
            query = query.filter(Tag.visibility == "public")

    if source:
        query = query.filter(Tag.source == source)
    if visibility_filter:
        query = query.filter(Tag.visibility == visibility_filter)
    if search:
        query = query.filter(Tag.name.ilike(f"%{search}%"))

    return query.order_by(Tag.name).paginate(page=page, per_page=per_page, error_out=False)


def create_tag(name, description, color, icon, source, created_by, visibility="private"):
    try:
        now = datetime.datetime.utcnow()
        tag = Tag(
            uuid=str(uuid.uuid4()),
            name=name.strip(),
            description=description,
            color=color,
            icon=icon,
            source=source or "Manual",
            created_by=created_by,
            visibility=visibility,
            is_active=False,
            is_approved_by_admin=False,
            created_at=now,
            updated_at=now,
        )
        db.session.add(tag)
        db.session.commit()
        return tag
    except Exception:
        db.session.rollback()
        return None


def get_tag(tag_id):
    return Tag.query.get(tag_id)


def edit_tag(tag_id, current_user_id, is_admin, **kwargs):
    tag = Tag.query.get(tag_id)
    if not tag:
        return None, "Tag not found"
    if not is_admin and tag.created_by != current_user_id:
        return None, "Forbidden"
    if not is_admin and tag.source == "Taxonomy":
        return None, "Cannot edit taxonomy tags"

    editable = ["description", "color", "icon"]
    if is_admin:
        editable += ["name", "visibility", "is_active", "is_approved_by_admin", "source"]

    for field in editable:
        if field in kwargs and kwargs[field] is not None:
            setattr(tag, field, kwargs[field])

    tag.updated_at = datetime.datetime.utcnow()
    try:
        db.session.commit()
        return tag, None
    except Exception:
        db.session.rollback()
        return None, "Database error"


def delete_tag(tag_id, current_user_id, is_admin):
    tag = Tag.query.get(tag_id)
    if not tag:
        return False, "Tag not found"
    if not is_admin and tag.created_by != current_user_id:
        return False, "Forbidden"
    try:
        db.session.delete(tag)
        db.session.commit()
        return True, None
    except Exception:
        db.session.rollback()
        return False, "Database error"


def admin_approve_tag(tag_id, approve=True):
    tag = Tag.query.get(tag_id)
    if not tag:
        return False, "Not found"
    tag.is_approved_by_admin = approve
    if approve:
        tag.is_active = True
        tag.visibility = "public"
    tag.updated_at = datetime.datetime.utcnow()
    try:
        db.session.commit()
        return True, None
    except Exception:
        db.session.rollback()
        return False, "Database error"


def admin_toggle_active(tag_id):
    tag = Tag.query.get(tag_id)
    if not tag:
        return False, None
    tag.is_active = not tag.is_active
    tag.updated_at = datetime.datetime.utcnow()
    try:
        db.session.commit()
        return True, tag.is_active
    except Exception:
        db.session.rollback()
        return False, None


def bulk_action(tag_ids, action):
    """
    Apply action to multiple tags by ID.
    action: 'activate' | 'deactivate' | 'approve' | 'disapprove' | 'delete'
    Returns (count, error).
    """
    tags = Tag.query.filter(Tag.id.in_(tag_ids)).all()
    now = datetime.datetime.utcnow()
    count = len(tags)
    for tag in tags:
        if action == "delete":
            db.session.delete(tag)
            continue
        if action == "activate":
            tag.is_active = True
        elif action == "deactivate":
            tag.is_active = False
        elif action == "approve":
            tag.is_approved_by_admin = True
            tag.is_active = True
            tag.visibility = "public"
        elif action == "disapprove":
            tag.is_approved_by_admin = False
        elif action == "make_public":
            tag.visibility = "public"
        elif action == "make_private":
            tag.visibility = "private"
        tag.updated_at = now
    try:
        db.session.commit()
        return count, None
    except Exception as e:
        db.session.rollback()
        return 0, str(e)


def import_taxonomies(admin_user_id, vendor_path=None):
    """
    Walk vendor/misp-taxonomies and upsert tags into the DB.
    Returns (imported_count, skipped_count, errors_list).
    """
    path = Path(vendor_path) if vendor_path else VENDOR_PATH

    if not path.exists():
        return 0, 0, [f"Taxonomy directory not found: {path}"]

    imported = 0
    skipped = 0
    errors = []
    now = datetime.datetime.utcnow()

    for taxonomy_dir in sorted(path.iterdir()):
        machinetag = taxonomy_dir / "machinetag.json"
        if not taxonomy_dir.is_dir() or not machinetag.exists():
            continue

        try:
            with open(machinetag, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            errors.append(f"{taxonomy_dir.name}: {e}")
            continue

        namespace = data.get("namespace", taxonomy_dir.name)
        predicates = data.get("predicates", [])
        values_groups = data.get("values", [])

        values_lookup: dict[str, list] = {}
        for vg in values_groups:
            values_lookup[vg.get("predicate", "")] = vg.get("entry", [])

        for pred in predicates:
            pred_val = pred.get("value", "")
            pred_colour = pred.get("colour") or pred.get("color")
            pred_desc = pred.get("description") or pred.get("expanded") or pred_val
            entries = values_lookup.get(pred_val, [])

            if entries:
                for entry in entries:
                    e_val = entry.get("value", "")
                    e_colour = entry.get("colour") or entry.get("color") or pred_colour
                    e_desc = entry.get("description") or entry.get("expanded") or e_val
                    tag_name = f'{namespace}:{pred_val}="{e_val}"'

                    if Tag.query.filter_by(name=tag_name).first():
                        skipped += 1
                        continue

                    db.session.add(Tag(
                        uuid=str(uuid.uuid4()),
                        name=tag_name,
                        description=e_desc,
                        color=e_colour,
                        source="Taxonomy",
                        created_by=admin_user_id,
                        visibility="public",
                        is_active=True,
                        is_approved_by_admin=True,
                        external_id=f"{namespace}:{pred_val}",
                        created_at=now,
                        updated_at=now,
                    ))
                    imported += 1
            else:
                tag_name = f"{namespace}:{pred_val}"

                if Tag.query.filter_by(name=tag_name).first():
                    skipped += 1
                    continue

                db.session.add(Tag(
                    uuid=str(uuid.uuid4()),
                    name=tag_name,
                    description=pred_desc,
                    color=pred_colour,
                    source="Taxonomy",
                    created_by=admin_user_id,
                    visibility="public",
                    is_active=True,
                    is_approved_by_admin=True,
                    external_id=namespace,
                    created_at=now,
                    updated_at=now,
                ))
                imported += 1

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return 0, 0, [str(e)]

    return imported, skipped, errors
