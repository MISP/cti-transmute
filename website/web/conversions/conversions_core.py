"""Feature-level persistence for the conversions blueprint's non-Conversion concerns.

Conversion and ConversionHistory rows — including their listing, access-scoped
search, and Trash queries - live in ``website/repos/conversions.py``; Comment
and CommentReaction writes live in ``website/repos/comments.py`` (this module
keeps only the comment read/query helpers; the comment visibility rule is
``website.lib.access.can_see_comment``). This module (imported as
``ConversionModel``) also keeps the report, favorite, and graph-config helpers
used by the conversion views.
"""
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
