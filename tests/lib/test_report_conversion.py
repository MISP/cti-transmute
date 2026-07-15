"""Integration tests for the report_conversion use-case:
validate → atomic report+activity → post-commit admin notification.

Prior art: ``tests/lib/test_add_comment.py`` - same ``app_db`` fixture, same
outcome-based assertions (rows persisted, exceptions raised), no collaborator
spying. The admin notification is asserted on the ``Notification`` rows it
creates.

Reporting carries no ownership dimension - any (logged-in, at the web edge)
Submitter may report any Conversion - so there is no authz branch to cover; the
use-case takes ``User | None`` and stamps the report's ``user_id`` accordingly.
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


# --- happy path: atomic report + Activity log ---------------------------------

def test_report_creates_the_row_and_its_activity_log(app_db):
    from website.db_class.db import ConversionReport, SystemLog
    from website.lib.conversions import report_conversion

    reporter = _make_user(email="reporter@test.test")
    conv = _make_conversion()

    report = report_conversion(reporter, conv, "spam", description="  junk  ")

    row = ConversionReport.query.get(report.id)
    assert row is not None
    assert row.reason == "spam"
    assert row.description == "junk"          # trimmed by the use-case
    assert row.user_id == reporter.id
    assert row.conversion_id == conv.id
    assert row.status == "pending"
    log = SystemLog.query.filter_by(event_type="conversion_reported").one()
    assert log.actor_id == reporter.id
    assert log.target_type == "conversion"
    assert log.target_id == conv.id


def test_a_blank_description_is_stored_as_null(app_db):
    from website.db_class.db import ConversionReport
    from website.lib.conversions import report_conversion

    reporter = _make_user(email="reporter@test.test")
    conv = _make_conversion()

    report = report_conversion(reporter, conv, "other", description="   ")

    assert ConversionReport.query.get(report.id).description is None


# --- validation (before any write) --------------------------------------------

def test_an_invalid_reason_is_rejected_and_writes_nothing(app_db):
    from website.db_class.db import ConversionReport, SystemLog
    from website.lib.conversions import report_conversion
    from website.lib.exceptions import ValidationFailed

    reporter = _make_user(email="reporter@test.test")
    conv = _make_conversion()

    with pytest.raises(ValidationFailed):
        report_conversion(reporter, conv, "bogus")

    assert ConversionReport.query.count() == 0
    assert SystemLog.query.count() == 0


def test_an_overlong_description_is_rejected_and_writes_nothing(app_db):
    from website.db_class.db import ConversionReport
    from website.lib.conversions import report_conversion
    from website.lib.exceptions import ValidationFailed

    reporter = _make_user(email="reporter@test.test")
    conv = _make_conversion()

    with pytest.raises(ValidationFailed):
        report_conversion(reporter, conv, "spam", description="x" * 1001)

    assert ConversionReport.query.count() == 0


# --- rollback -----------------------------------------------------------------

def test_commit_failure_rolls_back_report_and_activity(app_db, monkeypatch):
    from website.db_class.db import ConversionReport, Notification, SystemLog
    from website.lib.conversions import report_conversion
    from website.lib.exceptions import PersistenceFailed
    from website.web import db

    reporter = _make_user(email="reporter@test.test")
    _make_user(admin=True, email="admin@test.test")
    conv = _make_conversion()

    def boom():
        raise RuntimeError("database is down")

    monkeypatch.setattr(db.session, "commit", boom)
    with pytest.raises(PersistenceFailed):
        report_conversion(reporter, conv, "spam")

    assert ConversionReport.query.count() == 0   # report rolled back
    assert SystemLog.query.count() == 0          # activity entry rolled back with it
    assert Notification.query.count() == 0       # and no admin notification fired


# --- admin notification (after commit) ----------------------------------------

def test_a_successful_report_notifies_every_admin(app_db):
    from website.db_class.db import Notification
    from website.lib.conversions import report_conversion

    admin_a = _make_user(admin=True, email="admin_a@test.test")
    admin_b = _make_user(admin=True, email="admin_b@test.test")
    reporter = _make_user(email="reporter@test.test")
    conv = _make_conversion()

    report_conversion(reporter, conv, "inappropriate")

    notes = Notification.query.filter_by(type="report_submitted").all()
    assert {n.user_id for n in notes} == {admin_a.id, admin_b.id}
    for n in notes:
        assert n.actor_id == reporter.id
        assert n.related_id == conv.id
        assert n.related_type == "conversion"
