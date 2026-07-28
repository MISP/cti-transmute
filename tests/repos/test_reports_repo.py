"""Integration tests for the reports repository.

``website/repos/reports.py`` is the single persistence home for the
ConversionReport aggregate. Its ``create`` takes ``commit: bool = True`` so the
``report_conversion`` use-case can pass ``commit=False`` and bundle the report
row with its Activity log entry in one transaction; ``set_status`` and
``delete`` are the admin write ops relocated here from ``conversions_core``.

These tests exercise the repo's public surface directly against the in-memory
SQLite ``app_db`` fixture (real ORM/session/transaction), pinning the same
contract as ``test_comments_repo.py`` does for the Comment aggregate.
"""

import json
import uuid as uuid_lib
from datetime import datetime, timezone


def _make_conversion():
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


def _make_report(conversion_id, *, reason="spam", user_id=7, **kwargs):
    from website.repos import reports as reports_repo

    return reports_repo.create(
        conversion_id=conversion_id, user_id=user_id, reason=reason, **kwargs,
    )


# --- create -------------------------------------------------------------------

def test_create_persists_a_report_and_assigns_identity(app_db):
    from website.db_class.db import ConversionReport
    from website.repos import reports as reports_repo

    conv = _make_conversion()
    report = reports_repo.create(
        conversion_id=conv.id, user_id=7, reason="spam", description="  bad  ",
    )

    assert report.id is not None
    row = ConversionReport.query.get(report.id)
    assert row is not None
    assert row.conversion_id == conv.id
    assert row.user_id == 7
    assert row.reason == "spam"
    assert row.description == "  bad  "     # stored verbatim (use-case trims)
    assert row.status == "pending"
    assert row.created_at is not None


def test_create_accepts_an_anonymous_reporter(app_db):
    from website.db_class.db import ConversionReport

    conv = _make_conversion()
    report = _make_report(conv.id, user_id=None)

    assert ConversionReport.query.get(report.id).user_id is None


def test_create_with_commit_false_stages_without_committing(app_db):
    """The Pattern-A seam: commit=False flushes (id assigned) but the caller
    owns the commit, so a rollback discards the row."""
    from website.db_class.db import ConversionReport
    from website.repos import reports as reports_repo
    from website.web import db

    conv = _make_conversion()
    report = reports_repo.create(
        conversion_id=conv.id, user_id=1, reason="spam", commit=False,
    )

    assert report.id is not None         # flushed → id assigned within the tx
    db.session.rollback()                # caller decided not to keep it
    assert ConversionReport.query.count() == 0   # nothing persisted


# --- set_status (admin review) -----------------------------------------------

def test_set_status_updates_status_reviewer_and_timestamp(app_db):
    from website.repos import reports as reports_repo

    conv = _make_conversion()
    report = _make_report(conv.id)

    assert reports_repo.set_status(report.id, "reviewed", reviewed_by_id=3) is True
    assert report.status == "reviewed"
    assert report.reviewed_by == 3
    assert report.reviewed_at is not None


def test_set_status_on_a_missing_report_returns_false(app_db):
    from website.repos import reports as reports_repo

    assert reports_repo.set_status(999, "reviewed", reviewed_by_id=3) is False


# --- delete ------------------------------------------------------------------

def test_delete_removes_the_row(app_db):
    from website.db_class.db import ConversionReport
    from website.repos import reports as reports_repo

    conv = _make_conversion()
    report = _make_report(conv.id)

    reports_repo.delete(report.id)

    assert ConversionReport.query.count() == 0


def test_delete_of_a_missing_report_is_a_noop(app_db):
    from website.repos import reports as reports_repo

    # No row, no conversion: must not raise.
    reports_repo.delete(999)
