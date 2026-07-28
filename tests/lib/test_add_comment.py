"""Integration tests for the add_comment use-case:
validate → authz → atomic mutate+activity → post-commit notification

Prior art: ``tests/lib/test_conversions.py`` - same ``app_db`` fixture, same
outcome-based assertions (rows persisted, exceptions raised), no collaborator
spying. Notifications are asserted on the ``Notification`` rows they create.
"""

import json
import uuid as _uuid
from datetime import datetime, timezone

import pytest


def _make_user(*, admin=False, email="someone@test.test"):
    from website.db_class.db import User
    from website.web import db

    user = User(first_name=email.split("@")[0], last_name="x",
                email=email, admin=admin, api_key=email)
    db.session.add(user)
    db.session.commit()
    return user


def _make_conversion(owner_id=None, *, public=True):
    from website.db_class.db import Conversion
    from website.web import db

    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=owner_id, name="c", source_format="misp", target_format="stix",
        input_text=json.dumps({}), output_text="x", params=None,
        created_at=now, updated_at=now, public=public, uuid=str(_uuid.uuid4()),
    )
    db.session.add(conv)
    db.session.commit()
    return conv


# --- happy path: atomic comment + Activity log --------------------------------

def test_comment_creates_the_row_and_its_activity_log(app_db):
    from website.db_class.db import Comment, SystemLog
    from website.lib.conversions import add_comment

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(owner.id)

    comment = add_comment(owner, conv, "  a note  ")

    row = Comment.query.get(comment.id)
    assert row is not None
    assert row.content == "a note"           # stripped
    assert row.user_id == owner.id
    assert row.conversion_id == conv.id
    log = SystemLog.query.filter_by(event_type="comment_created").one()
    assert log.actor_id == owner.id
    assert log.target_type == "comment"
    assert log.target_id == comment.id


def test_commit_failure_rolls_back_comment_and_activity(app_db, monkeypatch):
    from website.db_class.db import Comment, Notification, SystemLog
    from website.lib.conversions import add_comment
    from website.lib.exceptions import PersistenceFailed
    from website.web import db

    commenter = _make_user(email="commenter@test.test")
    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(owner.id)

    def boom():
        raise RuntimeError("database is down")

    monkeypatch.setattr(db.session, "commit", boom)
    with pytest.raises(PersistenceFailed):
        add_comment(commenter, conv, "doomed")

    assert Comment.query.count() == 0        # comment rolled back
    assert SystemLog.query.count() == 0      # activity entry rolled back with it
    assert Notification.query.count() == 0   # and no notification fired


# --- authorization --------------------------------------------------------------

def test_anonymous_commenter_is_denied_and_writes_nothing(app_db):
    from website.db_class.db import Comment, SystemLog
    from website.lib.conversions import add_comment
    from website.lib.exceptions import PermissionDenied

    conv = _make_conversion()

    with pytest.raises(PermissionDenied):
        add_comment(None, conv, "drive-by")

    assert Comment.query.count() == 0
    assert SystemLog.query.count() == 0


def test_stranger_cannot_comment_on_a_private_conversion(app_db):
    from website.db_class.db import Comment
    from website.lib.conversions import add_comment
    from website.lib.exceptions import PermissionDenied

    owner = _make_user(email="owner@test.test")
    stranger = _make_user(email="stranger@test.test")
    conv = _make_conversion(owner.id, public=False)

    with pytest.raises(PermissionDenied):
        add_comment(stranger, conv, "psst")

    assert Comment.query.count() == 0


def test_owner_can_comment_on_their_private_conversion(app_db):
    from website.db_class.db import Comment
    from website.lib.conversions import add_comment

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(owner.id, public=False)

    add_comment(owner, conv, "note to self")

    assert Comment.query.count() == 1


# --- validation ------------------------------------------------------------------

def test_overlong_comment_is_rejected_and_writes_nothing(app_db):
    from website.db_class.db import Comment
    from website.lib.conversions import add_comment
    from website.lib.exceptions import ValidationFailed

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(owner.id)

    with pytest.raises(ValidationFailed):
        add_comment(owner, conv, "x" * 2001)

    assert Comment.query.count() == 0


def test_blank_comment_is_rejected(app_db):
    from website.lib.conversions import add_comment
    from website.lib.exceptions import ValidationFailed

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(owner.id)

    with pytest.raises(ValidationFailed):
        add_comment(owner, conv, "   ")


def test_reply_to_a_missing_parent_is_rejected(app_db):
    from website.db_class.db import Comment
    from website.lib.conversions import add_comment
    from website.lib.exceptions import ValidationFailed

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(owner.id)

    with pytest.raises(ValidationFailed):
        add_comment(owner, conv, "re", parent_id=12345)

    assert Comment.query.count() == 0


def test_reply_to_a_parent_on_another_conversion_is_rejected(app_db):
    from website.db_class.db import Comment
    from website.lib.conversions import add_comment
    from website.lib.exceptions import ValidationFailed

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(owner.id)
    other = _make_conversion(owner.id)
    parent = add_comment(owner, other, "elsewhere")

    with pytest.raises(ValidationFailed):
        add_comment(owner, conv, "re", parent_id=parent.id)

    assert Comment.query.count() == 1  # only the parent


# --- notification branches ---------------------------------------------------------

def test_top_level_comment_notifies_the_conversion_owner(app_db):
    from website.db_class.db import Notification
    from website.lib.conversions import add_comment

    owner = _make_user(email="owner@test.test")
    commenter = _make_user(email="commenter@test.test")
    conv = _make_conversion(owner.id)

    comment = add_comment(commenter, conv, "nice conversion")

    notif = Notification.query.filter_by(type="new_comment").one()
    assert notif.user_id == owner.id          # the Conversion's owner is notified
    assert notif.actor_id == commenter.id
    assert notif.related_id == comment.id


def test_comment_on_your_own_conversion_notifies_nobody(app_db):
    from website.db_class.db import Notification
    from website.lib.conversions import add_comment

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(owner.id)

    add_comment(owner, conv, "talking to myself")

    assert Notification.query.count() == 0


def test_reply_notifies_the_parent_commenter_not_the_owner(app_db):
    from website.db_class.db import Notification
    from website.lib.conversions import add_comment

    owner = _make_user(email="owner@test.test")
    commenter = _make_user(email="commenter@test.test")
    conv = _make_conversion(owner.id)
    parent = add_comment(commenter, conv, "first!")

    reply = add_comment(owner, conv, "thanks", parent_id=parent.id)

    notif = Notification.query.filter_by(type="comment_reply").one()
    assert notif.user_id == commenter.id      # the parent's author is notified
    assert notif.actor_id == owner.id
    assert notif.related_id == reply.id
    # the reply branch fires instead of, not on top of, the top-level branch
    assert Notification.query.filter_by(type="new_comment").count() == 1  # from the parent only


# --- domain rules -------------------------------------------------------------------

def test_a_reply_never_carries_the_evaluation_flag(app_db):
    from website.lib.conversions import add_comment

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(owner.id)
    parent = add_comment(owner, conv, "an evaluation", is_evaluation=True)

    reply = add_comment(owner, conv, "re", parent_id=parent.id, is_evaluation=True)

    assert parent.is_evaluation is True
    assert reply.is_evaluation is False       # the flag lives on the parent only
