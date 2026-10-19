"""Persistence for the BulkTagJob aggregate.

This is the single place that reads and writes ``bulk_tag_job`` rows — the
durable home for the state a bulk conversion-tag run reports: progress, counts
and per-item errors.

Transaction seam: every write takes ``commit: bool = True``, as in
``website/repos/conversions.py``. A worker keeps the default so each progress
write is its own short transaction: one held open across a whole run would pin
a pool connection.
"""

import uuid as uuid_lib
from datetime import datetime, timedelta, timezone

from website.db_class.db import BulkTagJob
from website.web import db

# Stored error strings per job. Past this the list stops growing and
# error_count carries the truth: an unbounded list is rewritten whole on every
# flush, and a 900-item run that fails every item would rewrite 900 strings.
ERROR_CAP = 50

# Jobs kept, newest first. The dict this replaced held the same number.
HISTORY_LIMIT = 30

# How old a heartbeat may get before a running job reads as interrupted.
# Workers flush at least once a second, so this is wide headroom over the worst
# realistic single-item stall.
STALE_AFTER = timedelta(seconds=60)

# What touch() and finish() accept. Anything else is a typo that would
# otherwise set an attribute nobody reads.
_WRITABLE_FIELDS = ("progress", "affected", "skipped", "total")


# --- writes -------------------------------------------------------------------

def create(*, job_type: str, total: int, user_id: int | None,
           commit: bool = True) -> BulkTagJob:
    """Start a job: mint its token, stamp its clocks, trim the history.

    ``add`` + ``flush`` always run (so the row exists for the trim below); the
    commit is gated on ``commit``.
    """
    now = _now()
    job = BulkTagJob(
        token=uuid_lib.uuid4().hex[:8],
        job_type=job_type,
        status="running",
        total=total,
        progress=0,
        affected=0,
        skipped=0,
        errors=[],
        error_count=0,
        user_id=user_id,
        created_at=now,
        heartbeat_at=now
    )
    db.session.add(job)
    db.session.flush()
    _trim()
    if commit:
        db.session.commit()
    return job


def touch(*, token: str, errors: list[str] | None = None,
          commit: bool = True, **fields) -> BulkTagJob | None:
    """Record progress and refresh the heartbeat. ``None`` if the job is gone.

    The heartbeat rides along with every progress write: that is what keeps a
    live job from reading as interrupted. So do the failures a worker has
    collected since its last write - one row write carries both, which is what
    keeps a run that fails every item from writing the row per item.
    """
    job = _row(token)
    if job is None:
        return None
    _record(job, fields, errors)
    if commit:
        db.session.commit()
    return job


def finish(*, token: str, errors: list[str] | None = None,
           commit: bool = True, **fields) -> BulkTagJob | None:
    """Mark a job done, with its final counts. ``None`` if the job is gone.

    Takes the last failures the same way ``touch`` does: a run whose final
    items failed has nothing after this write to carry them.
    """
    job = _row(token)
    if job is None:
        return None
    _record(job, fields, errors)
    job.status = "done"
    db.session.flush()
    if commit:
        db.session.commit()
    return job


def append_errors(*, token: str, messages: list[str],
                  commit: bool = True) -> BulkTagJob | None:
    """Record failures on their own, outside a progress write.

    ``None`` if the job is gone. This is the write a worker pays so its first
    failure reaches the panel without waiting for a flush; everything after it
    travels on ``touch``.
    """
    job = _row(token)
    if job is None:
        return None
    _store_errors(job, messages)
    if commit:
        db.session.commit()
    return job


def remove(token: str, *, commit: bool = True) -> bool:
    """Delete a job row — the admin dismissing it. False if it is already gone."""
    job = _row(token)
    if job is None:
        return False
    db.session.delete(job)
    if commit:
        db.session.commit()
    return True


def remove_finished(*, commit: bool = True) -> int:
    """Dismiss every job that is no longer live. Returns how many went.

    Terminal means what a reader sees, not what the column says: a job stalled
    long enough to read as interrupted is finished as far as the panel is
    concerned, so a status-only delete would leave exactly the rows an admin
    most wants cleared. A live job is spared here - the only place anything is
    spared, since ``remove`` takes whatever token it is given and the panel is
    what keeps a running row's own dismiss button disabled.

    Row-by-row rather than a bulk delete: the verdict is Python, and the table
    is bounded to HISTORY_LIMIT.
    """
    now = _now()
    doomed = [job for job in _newest_first().all() if not _is_live(job, now)]
    for job in doomed:
        db.session.delete(job)
    if commit:
        db.session.commit()
    return len(doomed)


# --- reads --------------------------------------------------------------------

def get(token: str) -> dict | None:
    """One job in full — the only read that carries the stored error messages.

    The capped list travels here, once, when something asks for a single job;
    the polled list below leaves it behind.
    """
    job = _row(token)
    return _payload(job, _now(), include_errors=True) if job else None


def list_recent(limit: int = HISTORY_LIMIT) -> list[dict]:
    """The newest jobs, newest first, each with its interrupted verdict.

    No error messages: this is the polled read, and ``error_count`` already
    says how much went wrong. ``get()`` is where the messages themselves live.
    """
    jobs = _newest_first().limit(limit).all()
    now = _now()
    return [_payload(job, now) for job in jobs]


# --- internals ----------------------------------------------------------------

def _now() -> datetime:
    """The clock these rows keep: UTC, carried naive.

    ``created_at`` and ``heartbeat_at`` are ``timestamp without time zone``,
    so an aware datetime would reach Postgres as a ``timestamptz`` literal and
    be converted through the server's session clock before the offset is
    dropped: on an install whose Postgres is not on UTC the column would hold
    local wall time, and the staleness arithmetic below would be off by that
    offset. Stripping here is what lets the stored value and this clock be
    compared at all.
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _row(token: str) -> BulkTagJob | None:
    return BulkTagJob.query.filter_by(token=token).first()


def _apply(job: BulkTagJob, fields: dict) -> None:
    for name, value in fields.items():
        if name not in _WRITABLE_FIELDS:
            raise ValueError(f"not a writable bulk tag job field: {name}")
        setattr(job, name, value)


def _record(job: BulkTagJob, fields: dict,
            messages: list[str] | None) -> None:
    """What a progress write carries: the counters, the failures, the clock."""
    _apply(job, fields)
    _store_errors(job, messages)
    job.heartbeat_at = _now()


def _store_errors(job: BulkTagJob, messages: list[str] | None) -> None:
    """Count a batch of failures; store what still fits under ``ERROR_CAP``."""
    if not messages:
        return
    errors = list(job.errors or [])
    room = ERROR_CAP - len(errors)
    if room > 0:
        errors.extend(messages[:room])
        job.errors = errors          # JSON columns are not mutation-tracked
    job.error_count += len(messages)


def _payload(job: BulkTagJob, now: datetime, *,
             include_errors: bool = False) -> dict:
    """``job.to_json()`` with the interrupted verdict overlaid.

    The verdict is derived on every read and never written back: a GET that
    mutates is a surprise, and nothing queries on the stored status, so leaving
    it at ``running`` forever costs nothing.

    ``include_errors`` is off by default: the messages are a single-job read,
    and a failure storm would otherwise put 50 of them per job into the polled
    list.
    """
    payload = job.to_json()
    if not include_errors:
        payload.pop("errors", None)
    if _is_interrupted(job, now):
        payload["status"] = "interrupted"
    return payload


def _is_live(job: BulkTagJob, now: datetime) -> bool:
    """A job a worker is still reporting on - the state a bulk dismiss skips."""
    return job.status == "running" and not _is_interrupted(job, now)


def _is_interrupted(job: BulkTagJob, now: datetime) -> bool:
    """A job still claiming to run whose worker stopped reporting."""
    if job.status != "running":
        return False
    return now - job.heartbeat_at > STALE_AFTER


def _newest_first():
    """Every job, newest first; the id breaks ties inside one timestamp."""
    return BulkTagJob.query.order_by(
        BulkTagJob.created_at.desc(), BulkTagJob.id.desc())


def _trim() -> None:
    """Drop everything past the HISTORY_LIMIT newest jobs."""
    for job in _newest_first().offset(HISTORY_LIMIT).all():
        db.session.delete(job)
