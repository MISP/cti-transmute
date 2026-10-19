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


def touch(*, token: str, commit: bool = True, **fields) -> BulkTagJob | None:
    """Record progress and refresh the heartbeat. ``None`` if the job is gone.

    The heartbeat rides along with every progress write: that is what keeps a
    live job from reading as interrupted.
    """
    job = _row(token)
    if job is None:
        return None
    _apply(job, fields)
    job.heartbeat_at = _now()
    if commit:
        db.session.commit()
    return job


def finish(*, token: str, commit: bool = True, **fields) -> BulkTagJob | None:
    """Mark a job done, with its final counts. ``None`` if the job is gone."""
    job = _row(token)
    if job is None:
        return None
    _apply(job, fields)
    job.status = "done"
    job.heartbeat_at = _now()
    db.session.flush()
    if commit:
        db.session.commit()
    return job


def append_error(*, token: str, message: str,
                 commit: bool = True) -> BulkTagJob | None:
    """Record one per-item failure. ``None`` if the job is gone.

    ``error_count`` always increments; the stored list stops at ``ERROR_CAP``.
    """
    job = _row(token)
    if job is None:
        return None
    errors = list(job.errors or [])
    if len(errors) < ERROR_CAP:
        errors.append(message)
        job.errors = errors          # JSON columns are not mutation-tracked
    job.error_count += 1
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
    return datetime.now(timezone.utc)


def _row(token: str) -> BulkTagJob | None:
    return BulkTagJob.query.filter_by(token=token).first()


def _apply(job: BulkTagJob, fields: dict) -> None:
    for name, value in fields.items():
        if name not in _WRITABLE_FIELDS:
            raise ValueError(f"not a writable bulk tag job field: {name}")
        setattr(job, name, value)


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


def _is_interrupted(job: BulkTagJob, now: datetime) -> bool:
    """A job still claiming to run whose worker stopped reporting."""
    if job.status != "running":
        return False
    heartbeat = job.heartbeat_at
    if heartbeat.tzinfo is None:     # stored naive, as UTC wall clock
        heartbeat = heartbeat.replace(tzinfo=timezone.utc)
    return now - heartbeat > STALE_AFTER


def _newest_first():
    """Every job, newest first; the id breaks ties inside one timestamp."""
    return BulkTagJob.query.order_by(
        BulkTagJob.created_at.desc(), BulkTagJob.id.desc())


def _trim() -> None:
    """Drop everything past the HISTORY_LIMIT newest jobs."""
    for job in _newest_first().offset(HISTORY_LIMIT).all():
        db.session.delete(job)
