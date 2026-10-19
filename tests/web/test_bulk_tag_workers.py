"""The bulk conversion-tag workers, over durable job state.

The launchers in ``website/web/tags/bulk_jobs.py`` create a ``bulk_tag_job``
row and hand the work to a thread; everything the admin panel later reads comes
back out of ``website/repos/bulk_tag_jobs.py``. These tests run the worker in
the calling thread (the thread itself is not what is under test) and then read
the job the way the panel does.
"""

import json as _json
import uuid as _uuid
from datetime import datetime, timezone

import pytest


# --- fixtures -----------------------------------------------------------------

@pytest.fixture
def inline_jobs(monkeypatch):
    """Run each launcher's worker in the calling thread.

    The worker body is the behaviour under test; a daemon thread would only
    make the assertions race it.
    """
    from website.web.tags import bulk_jobs

    class _SameThread:
        def __init__(self, target, args=(), daemon=False):
            self._target, self._args = target, args

        def start(self):
            self._target(*self._args)

    monkeypatch.setattr(bulk_jobs.threading, "Thread", _SameThread)
    return bulk_jobs


def _user():
    from website.db_class.db import User
    from website.web import db

    user = User(first_name="Bulk", last_name="Admin",
                email=f"{_uuid.uuid4().hex[:8]}@test.test",
                password_hash="x", api_key=_uuid.uuid4().hex, admin=True)
    db.session.add(user)
    db.session.commit()
    return user


def _tag(user_id, name="bulk-tag"):
    from website.db_class.db import Tag
    from website.web import db

    tag = Tag(uuid=str(_uuid.uuid4()), name=name, visibility="public",
              created_by=user_id, is_active=True, is_approved_by_admin=True)
    db.session.add(tag)
    db.session.commit()
    return tag


def _record_job_writes(monkeypatch):
    """Every job-row write the worker issues, in order, by repo function name.

    The write bound is about all of them, not one kind, so this wraps the repo
    rather than a single call.
    """
    from website.repos import bulk_tag_jobs as jobs_repo

    writes = []
    for name in ("touch", "finish", "append_errors"):
        original = getattr(jobs_repo, name)

        def recorded(*, _name=name, _original=original, **fields):
            writes.append(_name)
            return _original(**fields)

        monkeypatch.setattr(jobs_repo, name, recorded)
    return writes


def _conversions(user_id, count, *, tag_id=None, misp=None):
    """``count`` MISP→STIX conversions, carrying ``tag_id`` when given.

    ``misp`` is the MISP JSON they converted from, which is what the scan
    worker reads tag names out of.
    """
    from website.db_class.db import Conversion, ConversionTagAssociation
    from website.web import db

    now = datetime.now(timezone.utc)
    ids = []
    for i in range(count):
        conv = Conversion(
            user_id=user_id, name=f"conv-{i}", source_format="misp",
            target_format="stix", input_text=_json.dumps(misp or {}),
            output_text="x",
            created_at=now, updated_at=now, public=True,
            uuid=str(_uuid.uuid4()))
        db.session.add(conv)
        db.session.commit()
        ids.append(conv.id)
        if tag_id is not None:
            db.session.add(ConversionTagAssociation(
                uuid=str(_uuid.uuid4()), conversion_id=conv.id, tag_id=tag_id,
                user_id=user_id, added_at=now, source_type="user"))
            db.session.commit()
    return ids


# --- the counts land in `affected` --------------------------------------------

def test_remove_reports_how_many_tags_it_took_off(app_db, inline_jobs):
    """Removal counts used to be written into the field named ``added``."""
    from website.repos import bulk_tag_jobs as jobs_repo

    user = _user()
    tag = _tag(user.id)
    conversion_ids = _conversions(user.id, 3, tag_id=tag.id)

    from website.web import application
    token = inline_jobs.start_remove(
        application, conversion_ids, [tag.id], user.id)

    payload = jobs_repo.get(token)
    assert payload["status"] == "done"
    assert payload["progress"] == 3
    assert payload["affected"] == 3


def test_clear_reports_how_many_tags_it_took_off(app_db, inline_jobs):
    from website.repos import bulk_tag_jobs as jobs_repo
    from website.web import application

    user = _user()
    tag = _tag(user.id)
    conversion_ids = _conversions(user.id, 2, tag_id=tag.id)

    token = inline_jobs.start_clear(application, conversion_ids, user.id)

    payload = jobs_repo.get(token)
    assert payload["status"] == "done"
    assert payload["affected"] == 2


def test_scan_counts_what_it_tagged_and_what_it_had_nothing_to_tag(
        app_db, inline_jobs):
    """Scan is the one worker with a skip: a conversion whose MISP JSON names
    no tag this user may apply is not an error and not an addition."""
    from website.repos import bulk_tag_jobs as jobs_repo
    from website.web import application

    from website.db_class.db import ConversionTagAssociation

    user = _user()
    _tag(user.id, name="tlp:white")
    tagged = _conversions(user.id, 1,
                          misp={"Event": {"Tag": [{"name": "tlp:white"}]}})
    untagged = _conversions(user.id, 1)

    token = inline_jobs.start_scan(application, tagged + untagged, user.id)

    payload = jobs_repo.get(token)
    assert payload["status"] == "done"
    assert payload["affected"] == 1
    assert payload["skipped"] == 1
    assert ConversionTagAssociation.query.filter_by(
        conversion_id=tagged[0], source_type="json").count() == 1


def test_a_failing_item_is_recorded_and_the_rest_of_the_run_continues(
        app_db, inline_jobs, monkeypatch):
    """Per-item failures used to be appended to a dict under a module lock."""
    from website.repos import bulk_tag_jobs as jobs_repo
    from website.web import application
    from website.web.tags import tags_core

    def refuse(*args, **kwargs):
        raise RuntimeError("tag write refused")

    monkeypatch.setattr(tags_core, "merge_conversion_tags", refuse)

    user = _user()
    tag = _tag(user.id)

    token = inline_jobs.start_assign(application, [11, 22], [tag.id], user.id)

    payload = jobs_repo.get(token)
    assert payload["status"] == "done"
    assert payload["progress"] == 2
    assert payload["affected"] == 0
    assert payload["error_count"] == 2
    assert payload["errors"][0].startswith("#11: ")


def test_an_item_that_dies_mid_write_does_not_take_the_run_with_it(
        app_db, inline_jobs, monkeypatch):
    """A failure can leave the session holding what the item half-wrote.

    The next progress write commits that session, so without a rollback the
    broken item would either be committed or raise out of the loop and strand
    the job at ``running`` forever.
    """
    from website.db_class.db import ConversionTagAssociation
    from website.repos import bulk_tag_jobs as jobs_repo
    from website.web import application, db
    from website.web.tags import tags_core

    def half_write(conversion_id, *args, **kwargs):
        db.session.add(ConversionTagAssociation(
            uuid=str(_uuid.uuid4()), conversion_id=None, tag_id=None))
        raise RuntimeError("died holding a write")

    monkeypatch.setattr(tags_core, "merge_conversion_tags", half_write)

    user = _user()
    tag = _tag(user.id)

    token = inline_jobs.start_assign(application, [31, 32], [tag.id], user.id)

    payload = jobs_repo.get(token)
    assert payload["status"] == "done"
    assert payload["error_count"] == 2
    assert ConversionTagAssociation.query.count() == 0


def test_a_long_run_does_not_write_the_job_row_per_item(
        app_db, inline_jobs, monkeypatch):
    """900 items meant 900 UPDATEs on top of the tag writes themselves.

    The panel polls every 1.5 seconds, so per-item granularity was never
    visible to anybody. The run still reports, and still lands on 900.
    """
    from website.repos import bulk_tag_jobs as jobs_repo
    from website.web import application

    writes = _record_job_writes(monkeypatch)

    user = _user()
    tag = _tag(user.id)
    missing_ids = list(range(1, 901))   # no rows: the walk is what is counted

    token = inline_jobs.start_assign(
        application, missing_ids, [tag.id], user.id)

    assert jobs_repo.get(token)["progress"] == 900
    assert 0 < len(writes) < 60


def test_a_run_that_fails_every_item_stays_inside_that_bound(
        app_db, inline_jobs, monkeypatch):
    """A failure used to be its own write, so 900 failures were 900 writes.

    The first one still goes straight out - it is what makes the panel show
    something the moment a run starts going wrong - and the rest ride the next
    progress write, which is throttled.
    """
    from website.repos import bulk_tag_jobs as jobs_repo
    from website.web import application
    from website.web.tags import tags_core

    def refuse(*args, **kwargs):
        raise RuntimeError("tag write refused")

    monkeypatch.setattr(tags_core, "merge_conversion_tags", refuse)
    writes = _record_job_writes(monkeypatch)

    user = _user()
    tag = _tag(user.id)

    token = inline_jobs.start_assign(
        application, list(range(1, 901)), [tag.id], user.id)

    assert writes[0] == "append_errors"     # the first failure does not wait
    assert writes.count("append_errors") == 1   # the rest ride the progress
    assert len(writes) < 60
    payload = jobs_repo.get(token)
    assert payload["error_count"] == 900
    assert len(payload["errors"]) == jobs_repo.ERROR_CAP


def test_assign_reports_the_associations_it_added(app_db, inline_jobs):
    from website.repos import bulk_tag_jobs as jobs_repo
    from website.web import application

    user = _user()
    tag = _tag(user.id)
    conversion_ids = _conversions(user.id, 2)

    token = inline_jobs.start_assign(
        application, conversion_ids, [tag.id], user.id)

    payload = jobs_repo.get(token)
    assert payload["status"] == "done"
    assert payload["affected"] == 2
