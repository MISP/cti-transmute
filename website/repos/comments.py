"""Persistence for the Comment aggregate (Comment + CommentReaction).

This is the single place that writes ``Comment`` and ``CommentReaction`` rows.
The ``add_comment`` use-case in ``website/lib/conversions.py`` and the thin
comment ops in ``website/web/conversions/`` route their writes through here;
``conversions_core`` keeps only the read/query helpers; the comment visibility
rule is ``website.lib.access.can_see_comment``.

Transaction seam: every write takes ``commit: bool = True``. The thin web ops
keep the default (each call is its own transaction). ``add_comment`` passes
``commit=False`` so the comment row and its Activity log entry commit together
in one all-or-nothing transaction owned by the use-case.
"""

from datetime import datetime, timezone

from website.db_class.db import Comment, CommentReaction
from website.web import db


def create(
    *, conversion_id: int, user_id: int | None, content: str,
    is_private: bool = False, parent_id: int | None = None,
    is_evaluation: bool = False, created_at: datetime | None = None,
    commit: bool = True) -> Comment:
    """Build and persist a ``Comment`` row (content stored stripped).

    ``add`` + ``flush`` always run (so ``comment.id`` is assigned); the commit
    is gated on ``commit`` so a caller can bundle this row with other writes
    (e.g. an Activity log entry) in one transaction.
    """
    comment = Comment(
        conversion_id=conversion_id,
        user_id=user_id,
        content=content.strip(),
        is_private=is_private,
        parent_id=parent_id,
        created_at=created_at or datetime.now(timezone.utc),
        is_deleted=False,
        is_evaluation=is_evaluation
    )
    db.session.add(comment)
    db.session.flush()  # assign comment.id within the transaction
    if commit:
        db.session.commit()
    return comment


def get(comment_id: int) -> Comment | None:
    """Fetch a Comment by id."""
    return Comment.query.get(comment_id)


def soft_delete(comment: Comment, *, commit: bool = True) -> Comment:
    """Soft-delete a comment, redacting its content."""
    comment.is_deleted = True
    comment.content = "[deleted]"
    if commit:
        db.session.commit()
    return comment


def set_content(comment: Comment, content: str, *, commit: bool = True) -> Comment:
    """Replace a comment's content (the edit write)."""
    comment.content = content
    if commit:
        db.session.commit()
    return comment


def toggle_private(comment: Comment, *, commit: bool = True) -> bool:
    """Flip a comment's private flag. Returns the new value."""
    comment.is_private = not comment.is_private
    if commit:
        db.session.commit()
    return comment.is_private


def toggle_reaction(comment_id: int, user_id: int, emoji: str, *,
                    commit: bool = True) -> bool:
    """Toggle a user's emoji reaction on a comment.

    Returns True if the reaction was added, False if an existing one was
    removed. Emoji validation is the caller's concern (the route keeps its
    allow-list); this only owns the row.
    """
    existing = CommentReaction.query.filter_by(
        comment_id=comment_id, user_id=user_id, emoji=emoji
    ).first()
    if existing:
        db.session.delete(existing)
        if commit:
            db.session.commit()
        return False
    db.session.add(
        CommentReaction(
            comment_id=comment_id,
            user_id=user_id,
            emoji=emoji,
            created_at=datetime.now(timezone.utc)
        )
    )
    if commit:
        db.session.commit()
    return True
