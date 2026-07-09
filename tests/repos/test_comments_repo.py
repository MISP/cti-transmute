"""Integration tests for the comments repository.

``website/repos/comments.py`` is the single persistence home for the Comment
aggregate (Comment + CommentReaction). Its writes take ``commit: bool = True``
so the ``add_comment`` use-case can pass ``commit=False`` and bundle the row
with its Activity log entry in one transaction.

These tests exercise the repo's public surface directly against the in-memory
SQLite ``app_db`` fixture (real ORM/session/transaction), pinning the same
contract as ``test_conversions_repo.py`` does for the Conversion aggregate.
"""

from datetime import datetime, timezone


def _make_conversion():
    import json
    import uuid as uuid_lib

    from website.db_class.db import Conversion
    from website.web import db

    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=None, name="c", source_format="misp", target_format="stix",
        input_text=json.dumps({}), output_text="x", params=None,
        created_at=now, updated_at=now, public=True, uuid=str(uuid_lib.uuid4()),
    )
    db.session.add(conv)
    db.session.commit()
    return conv


def _make_comment(conversion_id, user_id=1, content="hi", **kwargs):
    from website.repos import comments as comments_repo

    return comments_repo.create(
        conversion_id=conversion_id, user_id=user_id, content=content, **kwargs,
    )


# --- create -------------------------------------------------------------------

def test_create_persists_a_comment_and_assigns_identity(app_db):
    from website.db_class.db import Comment
    from website.repos import comments as comments_repo

    conv = _make_conversion()
    comment = comments_repo.create(
        conversion_id=conv.id, user_id=7, content="  a comment  ",
    )

    assert comment.id is not None
    row = Comment.query.get(comment.id)
    assert row is not None
    assert row.content == "a comment"        # stored stripped
    assert row.user_id == 7
    assert row.parent_id is None
    assert row.is_private is False
    assert row.is_deleted is False
    assert row.is_evaluation is False
    assert row.created_at is not None


def test_create_with_commit_false_stages_without_committing(app_db):
    """The Pattern-A seam: commit=False flushes (id assigned) but the caller
    owns the commit, so a rollback discards the row."""
    from website.db_class.db import Comment
    from website.repos import comments as comments_repo
    from website.web import db

    conv = _make_conversion()
    comment = comments_repo.create(
        conversion_id=conv.id, user_id=1, content="staged", commit=False,
    )

    assert comment.id is not None         # flushed → id assigned within the tx
    db.session.rollback()                 # caller decided not to keep it
    assert Comment.query.count() == 0     # nothing persisted


def test_create_a_reply_records_its_parent(app_db):
    conv = _make_conversion()
    parent = _make_comment(conv.id)
    reply = _make_comment(conv.id, content="re", parent_id=parent.id)

    assert reply.parent_id == parent.id


# --- get ----------------------------------------------------------------------

def test_get_returns_the_row_or_none(app_db):
    from website.repos import comments as comments_repo

    conv = _make_conversion()
    comment = _make_comment(conv.id)

    assert comments_repo.get(comment.id) is comment
    assert comments_repo.get(comment.id + 999) is None


# --- soft delete ----------------------------------------------------------------

def test_soft_delete_marks_deleted_and_blanks_the_content(app_db):
    from website.repos import comments as comments_repo

    conv = _make_conversion()
    comment = _make_comment(conv.id, content="rude")

    comments_repo.soft_delete(comment)

    assert comment.is_deleted is True
    assert comment.content == "[deleted]"


# --- edit -----------------------------------------------------------------------

def test_set_content_updates_the_text(app_db):
    from website.db_class.db import Comment
    from website.repos import comments as comments_repo

    conv = _make_conversion()
    comment = _make_comment(conv.id, content="v1")

    comments_repo.set_content(comment, "v2")

    assert Comment.query.get(comment.id).content == "v2"


# --- privacy toggle ---------------------------------------------------------------

def test_toggle_private_flips_and_returns_the_new_value(app_db):
    from website.repos import comments as comments_repo

    conv = _make_conversion()
    comment = _make_comment(conv.id)

    assert comments_repo.toggle_private(comment) is True
    assert comment.is_private is True
    assert comments_repo.toggle_private(comment) is False
    assert comment.is_private is False


# --- reactions --------------------------------------------------------------------

def test_toggle_reaction_adds_then_removes(app_db):
    from website.db_class.db import CommentReaction
    from website.repos import comments as comments_repo

    conv = _make_conversion()
    comment = _make_comment(conv.id)

    assert comments_repo.toggle_reaction(comment.id, 7, "+1") is True   # added
    assert CommentReaction.query.count() == 1
    assert comments_repo.toggle_reaction(comment.id, 7, "+1") is False  # removed
    assert CommentReaction.query.count() == 0
