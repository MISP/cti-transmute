"""Integration tests for the bulk tag job repository.

``website/repos/bulk_tag_jobs.py`` is the single persistence home for the
``BulkTagJob`` aggregate - the durable home for the state bulk conversion-tag
runs report, which a module-level dict used to hold.

These tests exercise the repo's public surface directly against the in-memory
SQLite ``app_db`` fixture (real ORM/session/transaction), pinning the four
properties the table exists for: the interrupted verdict is derived and never
stored, the error list is capped while the count stays truthful, the messages
ride on the single-job read rather than the polled list, and the history stays
bounded to the 30 newest jobs.
"""

from datetime import datetime, timedelta, timezone


# --- create / get -------------------------------------------------------------

def test_create_mints_a_token_and_reads_back_as_a_running_job(app_db):
    from website.repos import bulk_tag_jobs as jobs_repo

    job = jobs_repo.create(job_type="scan", total=9, user_id=3)
    payload = jobs_repo.get(job.token)

    assert payload["id"] == job.token      # the token is the public id
    assert payload["type"] == "scan"
    assert payload["status"] == "running"
    assert payload["total"] == 9
    assert payload["progress"] == 0
    assert payload["affected"] == 0
    assert payload["skipped"] == 0
    assert payload["errors"] == []
    assert payload["error_count"] == 0


def test_get_an_unknown_token_is_none(app_db):
    from website.repos import bulk_tag_jobs as jobs_repo

    assert jobs_repo.get("nosuchtoken") is None


# --- the interrupted verdict --------------------------------------------------

def _stall(token, seconds=120):
    """Age a job's heartbeat, as a worker that stopped reporting would."""
    from website.db_class.db import BulkTagJob
    from website.web import db

    row = BulkTagJob.query.filter_by(token=token).first()
    row.heartbeat_at = datetime.now(timezone.utc) - timedelta(seconds=seconds)
    db.session.commit()


def test_a_stale_running_job_reads_interrupted_without_being_written(app_db):
    from website.db_class.db import BulkTagJob
    from website.repos import bulk_tag_jobs as jobs_repo

    job = jobs_repo.create(job_type="assign", total=900, user_id=1)
    jobs_repo.touch(token=job.token, progress=47)
    _stall(job.token)

    assert jobs_repo.get(job.token)["status"] == "interrupted"
    assert jobs_repo.list_recent()[0]["status"] == "interrupted"
    # the verdict is derived on read; the column keeps saying running
    assert BulkTagJob.query.filter_by(token=job.token).first().status == "running"


def test_touching_a_stalled_job_brings_it_back_to_running(app_db):
    from website.repos import bulk_tag_jobs as jobs_repo

    job = jobs_repo.create(job_type="scan", total=5, user_id=1)
    _stall(job.token)
    jobs_repo.touch(token=job.token, progress=2)

    assert jobs_repo.get(job.token)["status"] == "running"


def test_a_finished_job_with_an_old_heartbeat_still_reads_done(app_db):
    from website.repos import bulk_tag_jobs as jobs_repo

    job = jobs_repo.create(job_type="clear", total=3, user_id=1)
    jobs_repo.finish(token=job.token, progress=3, affected=7)
    _stall(job.token)

    payload = jobs_repo.get(job.token)
    assert payload["status"] == "done"
    assert payload["affected"] == 7


def test_the_write_path_stamps_the_clocks_naive_on_utc(app_db):
    """What the writes stamp has to be what the staleness read assumes.

    ``created_at`` and ``heartbeat_at`` are ``timestamp without time zone``.
    An aware datetime reaches Postgres as a ``timestamptz`` literal, which the
    server converts through its session clock before dropping the offset, so
    on an install whose Postgres is not on UTC the column would hold local
    wall time while the reader treats it as UTC - and the staleness
    arithmetic would be off by that offset, in whichever direction it runs.

    SQLite hands back whatever wall clock it was given, so it cannot show
    that; the invariant is pinned here instead, where the clocks are stamped.
    ``commit=False`` keeps the session from expiring the attributes, so these
    are the values the writes produced rather than the ones a round trip
    returned.
    """
    from website.repos import bulk_tag_jobs as jobs_repo

    before = datetime.now(timezone.utc).replace(tzinfo=None)
    job = jobs_repo.create(job_type="scan", total=1, user_id=1, commit=False)
    touched = jobs_repo.touch(token=job.token, progress=1, commit=False)
    after = datetime.now(timezone.utc).replace(tzinfo=None)

    stamps = (job.created_at, job.heartbeat_at, touched.heartbeat_at)
    assert all(stamp.tzinfo is None for stamp in stamps)
    # naive is not enough: a local-clock stamp would fall outside this bracket
    assert all(before <= stamp <= after for stamp in stamps)


def test_writing_an_unknown_field_is_refused(app_db):
    import pytest

    from website.repos import bulk_tag_jobs as jobs_repo

    job = jobs_repo.create(job_type="scan", total=1, user_id=1)

    with pytest.raises(ValueError):
        jobs_repo.touch(token=job.token, added=3)   # the field is "affected"


# --- the error cap ------------------------------------------------------------

def test_errors_past_the_cap_are_counted_but_not_stored(app_db):
    from website.repos import bulk_tag_jobs as jobs_repo

    job = jobs_repo.create(job_type="scan", total=60, user_id=1)
    jobs_repo.append_errors(token=job.token, messages=["#0: boom"])
    # the second batch straddles the cap: part of it is stored, all of it counts
    jobs_repo.touch(token=job.token,
                    errors=[f"#{i}: boom" for i in range(1, 60)])

    payload = jobs_repo.get(job.token)
    assert len(payload["errors"]) == jobs_repo.ERROR_CAP
    assert payload["errors"][0] == "#0: boom"          # the first ones are kept
    assert payload["error_count"] == 60                # the count is truthful


# --- which read carries the messages ------------------------------------------

def test_the_messages_ride_on_the_single_job_read_not_the_polled_list(app_db):
    """The polled list counts failures; only the single-job read spells them out.

    A job that failed every item has to cost the same per poll as one that
    failed none, so the row gets ``error_count`` and nothing more.
    """
    from website.repos import bulk_tag_jobs as jobs_repo

    noisy = jobs_repo.create(job_type="assign", total=50, user_id=1)
    jobs_repo.append_errors(
        token=noisy.token, messages=[f"#{i}: boom" for i in range(50)])
    quiet = jobs_repo.create(job_type="assign", total=50, user_id=1)

    by_token = {row["id"]: row for row in jobs_repo.list_recent()}

    assert "errors" not in by_token[noisy.token]
    assert by_token[noisy.token]["error_count"] == 50
    assert by_token[noisy.token].keys() == by_token[quiet.token].keys()
    assert jobs_repo.get(noisy.token)["errors"][0] == "#0: boom"


# --- the history bound --------------------------------------------------------

def test_creating_past_the_limit_keeps_the_newest_jobs(app_db):
    from website.db_class.db import BulkTagJob
    from website.repos import bulk_tag_jobs as jobs_repo

    tokens = [
        jobs_repo.create(job_type="scan", total=1, user_id=1).token
        for _ in range(jobs_repo.HISTORY_LIMIT + 1)
    ]

    assert BulkTagJob.query.count() == jobs_repo.HISTORY_LIMIT
    assert jobs_repo.get(tokens[0]) is None       # the oldest was dropped
    assert jobs_repo.get(tokens[-1]) is not None  # the newest is still there


def test_remove_deletes_the_job_once(app_db):
    from website.repos import bulk_tag_jobs as jobs_repo

    job = jobs_repo.create(job_type="scan", total=1, user_id=1)

    assert jobs_repo.remove(job.token) is True
    assert jobs_repo.remove(job.token) is False
    assert jobs_repo.get(job.token) is None


def test_remove_finished_dismisses_the_terminal_jobs_and_spares_the_live_one(app_db):
    """Terminal means what the panel renders, which includes interrupted.

    The stalled job still says ``running`` in its column - only its heartbeat
    age says otherwise - so a status-only delete would leave it behind.
    """
    from website.repos import bulk_tag_jobs as jobs_repo

    done = jobs_repo.create(job_type="scan", total=1, user_id=1)
    jobs_repo.finish(token=done.token, progress=1)
    stalled = jobs_repo.create(job_type="remove", total=500, user_id=1)
    jobs_repo.touch(token=stalled.token, progress=213)
    _stall(stalled.token)
    live = jobs_repo.create(job_type="assign", total=9, user_id=1)

    assert jobs_repo.remove_finished() == 2
    assert jobs_repo.get(done.token) is None
    assert jobs_repo.get(stalled.token) is None
    assert jobs_repo.get(live.token)["status"] == "running"
    assert jobs_repo.remove_finished() == 0
