"""Integration tests for the bulk_action use-case: per-item best-effort trash
management (restore / permanent delete over a set of Conversion ids).

Prior art: ``tests/lib/test_report_conversion.py`` - same ``app_db`` fixture,
same outcome-based assertions (rows persisted or gone, activity rows written,
the aggregated count returned), no collaborator spying.

The access rule under test: **owner-or-admin per item** - a missing item, an
item the Submitter may not act on, or an item whose own transaction fails is
*skipped*, never fatal to the batch. Anonymous (``None``) owns nothing, so an
anonymous batch acts on nothing.
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


def _make_conversion(owner_id=None, *, trashed=True, name="c"):
    from website.db_class.db import Conversion
    from website.web import db

    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=owner_id, name=name, source_format="misp", target_format="stix",
        input_text=json.dumps({}), output_text="x", params=None,
        created_at=now, updated_at=now, public=True, uuid=str(_uuid.uuid4()),
        is_active=not trashed, deleted_at=now if trashed else None,
    )
    db.session.add(conv)
    db.session.commit()
    return conv


# --- happy path: per-item atomic mutation + Activity log -----------------------

def test_restore_batch_restores_every_item_and_logs_each(app_db):
    from website.db_class.db import Conversion, SystemLog
    from website.lib.conversions import bulk_action

    owner = _make_user(email="owner@test.test")
    conv_a = _make_conversion(owner.id, name="a")
    conv_b = _make_conversion(owner.id, name="b")

    done = bulk_action(owner, "restore", [conv_a.id, conv_b.id])

    assert done == 2
    assert Conversion.query.get(conv_a.id).is_active is True
    assert Conversion.query.get(conv_a.id).deleted_at is None
    assert Conversion.query.get(conv_b.id).is_active is True
    logs = SystemLog.query.filter_by(event_type="conversion_restored").all()
    assert {log.target_id for log in logs} == {conv_a.id, conv_b.id}
    for log in logs:
        assert log.actor_id == owner.id
        assert log.target_type == "conversion"


def test_hard_delete_batch_removes_every_item_and_logs_each(app_db):
    from website.db_class.db import Conversion, SystemLog
    from website.lib.conversions import bulk_action

    owner = _make_user(email="owner@test.test")
    conv_a = _make_conversion(owner.id, name="a")
    conv_b = _make_conversion(owner.id, name="b")
    ids = [conv_a.id, conv_b.id]

    done = bulk_action(owner, "hard_delete", ids)

    assert done == 2
    assert Conversion.query.count() == 0
    logs = SystemLog.query.filter_by(event_type="conversion_hard_deleted").all()
    assert {log.target_id for log in logs} == set(ids)
    assert {log.target_name for log in logs} == {"a", "b"}


# --- per-item best-effort: missing ids ------------------------------------------

def test_missing_ids_are_skipped_not_fatal(app_db):
    from website.db_class.db import Conversion, SystemLog
    from website.lib.conversions import bulk_action

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(owner.id)

    done = bulk_action(owner, "restore", [conv.id + 999, conv.id, conv.id + 1000])

    assert done == 1
    assert Conversion.query.get(conv.id).is_active is True
    assert SystemLog.query.count() == 1


def test_restoring_an_already_active_conversion_is_not_counted(app_db):
    from website.db_class.db import SystemLog
    from website.lib.conversions import bulk_action

    owner = _make_user(email="owner@test.test")
    active = _make_conversion(owner.id, trashed=False)
    trashed = _make_conversion(owner.id)

    done = bulk_action(owner, "restore", [active.id, trashed.id])

    assert done == 1
    assert SystemLog.query.one().target_id == trashed.id


# --- the access rule: owner-or-admin per item ------------------------------------

def test_items_the_submitter_does_not_own_are_skipped(app_db):
    from website.db_class.db import Conversion, SystemLog
    from website.lib.conversions import bulk_action

    owner = _make_user(email="owner@test.test")
    stranger = _make_user(email="stranger@test.test")
    mine = _make_conversion(owner.id, name="mine")
    theirs = _make_conversion(stranger.id, name="theirs")

    done = bulk_action(owner, "hard_delete", [mine.id, theirs.id])

    assert done == 1
    assert Conversion.query.get(mine.id) is None          # acted on
    assert Conversion.query.get(theirs.id) is not None    # skipped, untouched
    assert SystemLog.query.one().target_id == mine.id     # no log for the denial


def test_an_admin_may_act_on_anyone_s_items(app_db):
    from website.db_class.db import Conversion
    from website.lib.conversions import bulk_action

    admin = _make_user(admin=True, email="admin@test.test")
    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(owner.id)

    assert bulk_action(admin, "restore", [conv.id]) == 1
    assert Conversion.query.get(conv.id).is_active is True


def test_an_anonymous_submitter_acts_on_nothing(app_db):
    from website.db_class.db import Conversion, SystemLog
    from website.lib.conversions import bulk_action

    # Anonymous never owns anything — not even anonymously created rows.
    anonymous_conv = _make_conversion(None)

    done = bulk_action(None, "hard_delete", [anonymous_conv.id])

    assert done == 0
    assert Conversion.query.get(anonymous_conv.id) is not None
    assert SystemLog.query.count() == 0


# --- validation ------------------------------------------------------------------

def test_an_unknown_action_is_rejected_and_writes_nothing(app_db):
    from website.db_class.db import Conversion, SystemLog
    from website.lib.conversions import bulk_action
    from website.lib.exceptions import ValidationFailed

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(owner.id)

    with pytest.raises(ValidationFailed):
        bulk_action(owner, "soft_delete", [conv.id])

    assert Conversion.query.get(conv.id).is_active is False
    assert SystemLog.query.count() == 0


# --- per-item atomicity: a failed item rolls back alone ---------------------------

def test_a_failed_item_rolls_back_atomically_and_the_batch_continues(app_db, monkeypatch):
    from website.db_class.db import Conversion, SystemLog
    from website.lib.conversions import bulk_action
    from website.web import db

    owner = _make_user(email="owner@test.test")
    conv_a = _make_conversion(owner.id, name="a")
    conv_b = _make_conversion(owner.id, name="b")
    id_a, id_b = conv_a.id, conv_b.id

    real_commit = db.session.commit
    calls = {"n": 0}

    def commit_failing_once():
        calls["n"] += 1
        if calls["n"] == 1:
            raise RuntimeError("database hiccup")
        real_commit()

    monkeypatch.setattr(db.session, "commit", commit_failing_once)
    done = bulk_action(owner, "restore", [id_a, id_b])

    assert done == 1
    # Item a's mutation AND its activity entry rolled back together...
    row_a = Conversion.query.get(id_a)
    assert row_a.is_active is False
    assert SystemLog.query.filter_by(target_id=id_a).count() == 0
    # ...while item b went through untouched by a's failure.
    assert Conversion.query.get(id_b).is_active is True
    assert SystemLog.query.filter_by(target_id=id_b).count() == 1
