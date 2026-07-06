"""Feature-level persistence for the conversions blueprint's non-Conversion concerns.

Conversion and ConversionHistory rows — including their listing, access-scoped
search, and Trash queries — now live in ``website/repos/conversions.py``. This
module (imported as ``ConversionModel``) keeps the comment, report, reaction,
favorite, and graph-config helpers used by the conversion views.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import or_

from website.db_class.db import (
    Comment, CommentReaction, ConversionFavorite,
    ConversionReport, GraphConfig)
from website.repos import conversions as conv_repo
from website.web import db

###################################
#   Comment service functions     #
###################################

def _can_see_comment(comment, convert_is_public, current_user_id, is_admin, convert_owner_id):
    """Determine if a user can see a specific comment."""
    if is_admin:
        return True
    if not convert_is_public:
        # Private conversion: only its owner can see
        return current_user_id is not None and current_user_id == convert_owner_id
    if not comment.is_private:
        return True
    # Private comment on public conversion: owner or comment author only
    if current_user_id is None:
        return False
    return current_user_id == convert_owner_id or current_user_id == comment.user_id


def create_comment(conversion_id, user_id, content, is_private=False, parent_id=None, is_evaluation=False):
    """Create a new comment or reply on a conversion."""
    try:
        now = datetime.now(timezone.utc)
        comment = Comment(
            conversion_id=conversion_id,
            user_id=user_id,
            content=content.strip(),
            is_private=is_private,
            parent_id=parent_id,
            created_at=now,
            is_deleted=False,
            is_evaluation=bool(is_evaluation) if not parent_id else False,
        )
        db.session.add(comment)
        db.session.commit()
        return comment
    except Exception as e:
        db.session.rollback()
        print("create_comment error:", e)
        return None


def get_comments(conversion_id, current_user_id=None, is_admin=False, convert_owner_id=None):
    """Return visible top-level comments and their visible replies for a conversion."""
    convert = conv_repo.get(conversion_id)
    if not convert:
        return []

    convert_is_public = convert.public

    top_level = (
        Comment.query
        .filter_by(conversion_id=conversion_id, parent_id=None)
        .filter_by(is_deleted=False)
        .order_by(Comment.created_at.asc())
        .all()
    )

    result = []
    for c in top_level:
        if not _can_see_comment(c, convert_is_public, current_user_id, is_admin, convert_owner_id):
            continue
        comment_data = c.to_json(current_user_id=current_user_id, is_admin=is_admin, convert_owner_id=convert_owner_id)
        replies = (
            Comment.query
            .filter_by(conversion_id=conversion_id, parent_id=c.id)
            .filter_by(is_deleted=False)
            .order_by(Comment.created_at.asc())
            .all()
        )
        comment_data["replies"] = [
            r.to_json(current_user_id=current_user_id, is_admin=is_admin, convert_owner_id=convert_owner_id)
            for r in replies
            if _can_see_comment(r, convert_is_public, current_user_id, is_admin, convert_owner_id)
        ]
        result.append(comment_data)
    return result


def delete_comment(comment_id, requesting_user_id, is_admin=False):
    """Soft-delete a comment. Only author, conversion owner, or admin can delete."""
    comment = Comment.query.get(comment_id)
    if not comment:
        return False, "Comment not found"
    convert = conv_repo.get(comment.conversion_id)
    if not convert:
        return False, "Conversion not found"
    allowed = (
        is_admin or
        requesting_user_id == comment.user_id or
        requesting_user_id == convert.user_id
    )
    if not allowed:
        return False, "Permission denied"
    comment.is_deleted = True
    comment.content = "[deleted]"
    db.session.commit()
    return True, "Comment deleted"


def toggle_comment_private(comment_id, requesting_user_id, is_admin=False):
    """Toggle the private/public flag of a comment. Only author or admin."""
    comment = Comment.query.get(comment_id)
    if not comment:
        return False, "Comment not found", None
    if not is_admin and requesting_user_id != comment.user_id:
        return False, "Permission denied", None
    comment.is_private = not comment.is_private
    db.session.commit()
    return True, "Visibility updated", comment.is_private


def react_to_comment(comment_id, user_id, emoji):
    """Toggle an emoji reaction on a comment. Returns (added: bool)."""
    try:
        existing = CommentReaction.query.filter_by(
            comment_id=comment_id, user_id=user_id, emoji=emoji
        ).first()
        if existing:
            db.session.delete(existing)
            db.session.commit()
            return True, False  # success, added=False (removed)
        reaction = CommentReaction(
            comment_id=comment_id,
            user_id=user_id,
            emoji=emoji,
            created_at=datetime.now(timezone.utc)
        )
        db.session.add(reaction)
        db.session.commit()
        return True, True  # success, added=True
    except Exception as e:
        db.session.rollback()
        print("react_to_comment error:", e)
        return False, False


def edit_comment(comment_id, requesting_user_id, content):
    """Edit a comment's content. Only the original author can edit."""
    comment = Comment.query.get(comment_id)
    if not comment:
        return False, "Comment not found"
    if comment.is_deleted:
        return False, "Cannot edit a deleted comment"
    if comment.user_id != requesting_user_id:
        return False, "Permission denied"
    content = content.strip()
    if not content:
        return False, "Content cannot be empty"
    comment.content = content
    db.session.commit()
    return True, "Comment updated"


def get_comment(comment_id):
    return Comment.query.get(comment_id)


def get_all_comments_admin(page=1, search=None):
    """Admin: paginated list of all non-deleted comments across all conversions."""
    query = Comment.query.filter_by(is_deleted=False)
    if search:
        query = query.filter(Comment.content.ilike(f"%{search}%"))
    return query.order_by(Comment.created_at.desc()).paginate(page=page, per_page=20)


###################################
#   Report service functions      #
###################################

REPORT_REASONS = ["spam", "inappropriate", "inaccurate", "other"]


def create_report(conversion_id, user_id, reason, description=None):
    """Submit a report on a conversion."""
    try:
        report = ConversionReport(
            conversion_id=conversion_id,
            user_id=user_id,
            reason=reason,
            description=description,
            status="pending",
            created_at=datetime.now(timezone.utc)
        )
        db.session.add(report)
        db.session.commit()
        return report
    except Exception as e:
        db.session.rollback()
        print("create_report error:", e)
        return None


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


def review_report(report_id, new_status, reviewed_by_id):
    """Admin: update report status (reviewed / dismissed)."""
    report = ConversionReport.query.get(report_id)
    if not report:
        return False
    report.status = new_status
    report.reviewed_at = datetime.now(timezone.utc)
    report.reviewed_by = reviewed_by_id
    db.session.commit()
    return True


def get_report(report_id):
    return ConversionReport.query.get(report_id)


def delete_report(report_id):
    report = ConversionReport.query.get(report_id)
    if report:
        db.session.delete(report)
        db.session.commit()

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
