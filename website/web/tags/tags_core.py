import datetime
import hashlib
import json
import uuid
from pathlib import Path

from sqlalchemy import or_, case, func

from website.db_class.db import Convert, ConvertTagAssociation, Tag
from website.web import db

VENDOR_PATH = Path(__file__).resolve().parent.parent.parent.parent / "vendor" / "misp-taxonomies"
GALAXY_PATH = Path(__file__).resolve().parent.parent.parent.parent / "vendor" / "misp-galaxy"


def _galaxy_color(cluster_type: str) -> str:
    """Generate a stable, visually distinct color from the cluster type name."""
    h = int(hashlib.md5(cluster_type.encode()).hexdigest()[:6], 16)
    hue = h % 360
    return f"hsl({hue},55%,45%)"


def get_tags_page(page, source=None, visibility_filter=None, search=None,
                  current_user_id=None, is_admin=False, per_page=20, pending_first=False):
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

    if search:
        rel = case(
            (Tag.name.ilike(search), 0),
            (Tag.name.ilike(f"{search}:%"), 1),
            (Tag.name.ilike(f"{search}%"), 2),
            else_=3,
        )
        order = ([Tag.is_approved_by_admin.asc()] if pending_first else []) + [rel, Tag.name.asc()]
    else:
        order = [Tag.is_approved_by_admin.asc(), Tag.name.asc()] if pending_first else [Tag.name.asc()]
    return query.order_by(*order).paginate(page=page, per_page=per_page, error_out=False)


def create_tag(name, description, color, icon, source, created_by,
               visibility="private", is_approved_by_admin=False, is_active=False):
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
            is_active=is_active,
            is_approved_by_admin=is_approved_by_admin,
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
    if not is_admin and tag.source in ("Taxonomy", "Galaxy"):
        return None, "Cannot edit taxonomy/galaxy tags"

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


def import_galaxies(admin_user_id, vendor_path=None, batch_size=500):
    """
    Walk vendor/misp-galaxy/clusters and upsert galaxy tags into the DB.
    Tag name format: misp-galaxy:<cluster-type>="<entry-value>"
    Returns (imported_count, skipped_count, errors_list).
    """
    path = Path(vendor_path) if vendor_path else GALAXY_PATH
    clusters_dir = path / "clusters"
    galaxies_dir = path / "galaxies"

    if not clusters_dir.exists():
        return 0, 0, [f"Galaxy clusters directory not found: {clusters_dir}"]

    # Build a colour lookup from galaxies/<name>.json (icon field only, no colour)
    galaxy_meta_map: dict[str, dict] = {}
    if galaxies_dir.exists():
        for gf in galaxies_dir.glob("*.json"):
            try:
                gd = json.loads(gf.read_text(encoding="utf-8"))
                galaxy_meta_map[gd.get("type", "")] = {
                    "icon": gd.get("icon"),
                    "description": gd.get("description"),
                }
            except Exception:
                pass

    imported = 0
    skipped = 0
    errors = []
    now = datetime.datetime.utcnow()
    batch_count = 0

    # Pre-load existing galaxy tag names in a set for fast duplicate check
    existing_names: set[str] = {
        r[0] for r in db.session.query(Tag.name).filter(Tag.source == "Galaxy").all()
    }

    for cluster_file in sorted(clusters_dir.glob("*.json")):
        try:
            data = json.loads(cluster_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as e:
            errors.append(f"{cluster_file.stem}: {e}")
            continue

        cluster_type = data.get("type", cluster_file.stem)
        gmeta = galaxy_meta_map.get(cluster_type, {})
        color = _galaxy_color(cluster_type)
        icon = gmeta.get("icon")

        for entry in data.get("values", []):
            entry_value = entry.get("value", "").strip()
            if not entry_value:
                continue

            tag_name = f'misp-galaxy:{cluster_type}="{entry_value}"'

            if tag_name in existing_names:
                skipped += 1
                continue

            existing_names.add(tag_name)
            description = entry.get("description") or gmeta.get("description") or ""
            meta = entry.get("meta") or {}

            db.session.add(Tag(
                uuid=str(uuid.uuid4()),
                name=tag_name,
                description=description[:2000] if description else None,
                color=color,
                icon=icon,
                source="Galaxy",
                created_by=admin_user_id,
                visibility="public",
                is_active=True,
                is_approved_by_admin=True,
                external_id=cluster_type,
                galaxy_meta=meta if meta else None,
                created_at=now,
                updated_at=now,
            ))
            imported += 1
            batch_count += 1

            if batch_count >= batch_size:
                try:
                    db.session.commit()
                    batch_count = 0
                except Exception as e:
                    db.session.rollback()
                    return imported - batch_size, skipped, [str(e)]

    # Final flush
    if batch_count > 0:
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return imported - batch_count, skipped, [str(e)]

    return imported, skipped, errors


###################################
#   Convert tag associations      #
###################################

_SOURCE_MAP = {
    'custom':        'Manual',
    'taxonomy':      'Taxonomy',
    'vulnerability': 'Vulnerability',
}

def get_available_tags(user_id, search=None, source=None, limit=60):
    """Tags available to attach to a convert:
    - public + active + admin-approved
    - OR private + active + owned by user (no admin approval required)
    Filtered by `search` (SQL ilike) and `source` ('custom'|'taxonomy'|'vulnerability').
    When `search` is provided, prefix matches are returned first.
    """
    query = Tag.query.filter(
        Tag.is_active == True,
        or_(
            db.and_(Tag.visibility == 'public', Tag.is_approved_by_admin == True),
            db.and_(Tag.visibility == 'private', Tag.created_by == user_id),
        ),
    )
    if search:
        query = query.filter(Tag.name.ilike(f'%{search}%'))
        # Prefix matches rank higher
        order = [
            case((Tag.name.ilike(f'{search}%'), 0), else_=1),
            Tag.name.asc(),
        ]
    else:
        order = [Tag.name.asc()]

    if source and source in _SOURCE_MAP:
        query = query.filter(Tag.source == _SOURCE_MAP[source])

    return query.order_by(*order).limit(limit).all()


def get_convert_tags(convert_id):
    """Return all tag associations for a single convert."""
    return ConvertTagAssociation.query.filter_by(convert_id=convert_id).all()


def get_convert_tags_batch(convert_ids):
    """Return {convert_id: [assoc, ...]} for a list of convert IDs."""
    if not convert_ids:
        return {}
    assocs = ConvertTagAssociation.query.filter(
        ConvertTagAssociation.convert_id.in_(convert_ids)
    ).all()
    result = {cid: [] for cid in convert_ids}
    for a in assocs:
        result[a.convert_id].append(a)
    return result


def get_convert_ids(search=None, conv_type=None):
    query = Convert.query.with_entities(Convert.id)
    if conv_type and conv_type != "ALL":
        query = query.filter(Convert.conversion_type == conv_type)
    if search:
        query = query.filter(Convert.name.ilike(f"%{search}%"))
    return [row.id for row in query.all()]


def get_converts_page(page, per_page=50, search=None, conv_type=None):
    query = Convert.query
    if conv_type and conv_type != "ALL":
        query = query.filter(Convert.conversion_type == conv_type)
    if search:
        query = query.filter(Convert.name.ilike(f"%{search}%"))
    return query.order_by(Convert.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)


def find_tags_by_names(user_id, names: list[str]) -> list:
    """Return available tag objects whose name matches any of the given names (case-insensitive).
    Includes public+approved tags AND private tags owned by the user."""
    if not names:
        return []
    lower_names = [n.lower() for n in names]
    return (
        Tag.query
        .filter(
            Tag.is_active == True,
            or_(
                db.and_(Tag.visibility == 'public', Tag.is_approved_by_admin == True),
                db.and_(Tag.visibility == 'private', Tag.created_by == user_id),
            ),
            func.lower(Tag.name).in_(lower_names),
        )
        .order_by(Tag.name.asc())
        .all()
    )


def resolve_tag_ids_from_names(tag_names: list[str]) -> list[int]:
    """Return IDs of active+approved public tags whose name matches any of the given names (case-insensitive)."""
    if not tag_names:
        return []
    lower_names = {n.lower() for n in tag_names}
    tags = Tag.query.filter(
        Tag.is_active == True,
        Tag.is_approved_by_admin == True,
        Tag.visibility == 'public',
    ).all()
    return [t.id for t in tags if t.name.lower() in lower_names]


def merge_convert_tags(convert_id: int, tag_ids: list, user_id: int) -> int:
    """Add tags to a convert without removing existing ones. Returns count of newly added tags."""
    existing = {a.tag_id for a in ConvertTagAssociation.query.filter_by(convert_id=convert_id).all()}
    now = datetime.datetime.utcnow()
    count = 0
    seen = set()
    for tid in tag_ids:
        if tid in seen or tid in existing:
            continue
        seen.add(tid)
        tag = Tag.query.get(tid)
        if not tag or not tag.is_active:
            continue
        db.session.add(ConvertTagAssociation(
            uuid=str(uuid.uuid4()),
            convert_id=convert_id,
            tag_id=tid,
            user_id=user_id,
            added_at=now,
        ))
        count += 1
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        count = 0
    return count


def remove_convert_tags(convert_id: int, tag_ids: list) -> int:
    """Remove specific tags from a convert. Returns count removed."""
    q = ConvertTagAssociation.query.filter(
        ConvertTagAssociation.convert_id == convert_id,
        ConvertTagAssociation.tag_id.in_(tag_ids),
    )
    count = q.count()
    q.delete(synchronize_session=False)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        count = 0
    return count


def clear_convert_tags(convert_id: int) -> int:
    """Remove ALL tags from a convert. Returns count removed."""
    q = ConvertTagAssociation.query.filter_by(convert_id=convert_id)
    count = q.count()
    q.delete(synchronize_session=False)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        count = 0
    return count


def get_all_tags_usage():
    """Return only tags actually used in at least one convert, with their usage counts."""
    from sqlalchemy import func

    rows = (
        db.session.query(ConvertTagAssociation.tag_id, func.count(ConvertTagAssociation.id))
        .group_by(ConvertTagAssociation.tag_id)
        .having(func.count(ConvertTagAssociation.id) > 0)
        .all()
    )
    if not rows:
        return []

    counts = {row[0]: row[1] for row in rows}
    tags = (
        Tag.query
        .filter(
            Tag.id.in_(counts.keys()),
            Tag.is_active == True,
            Tag.visibility == 'public',
            Tag.is_approved_by_admin == True,
        )
        .order_by(Tag.name.asc())
        .all()
    )

    return [
        {
            "name": t.name,
            "color": t.color,
            "icon": t.icon,
            "source": t.source,
            "usage_count": counts.get(t.id, 0),
        }
        for t in tags
    ]


def save_convert_tags(convert_id, tag_ids, user_id):
    """Replace all tag associations for a convert (idempotent)."""
    ConvertTagAssociation.query.filter_by(convert_id=convert_id).delete(synchronize_session=False)
    now = datetime.datetime.utcnow()
    seen = set()
    for tid in tag_ids:
        if tid in seen:
            continue
        seen.add(tid)
        tag = Tag.query.get(tid)
        if not tag or not tag.is_active:
            continue
        if tag.visibility != 'public' and tag.created_by != user_id:
            continue
        db.session.add(ConvertTagAssociation(
            uuid=str(uuid.uuid4()),
            convert_id=convert_id,
            tag_id=tid,
            user_id=user_id,
            added_at=now,
        ))
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
