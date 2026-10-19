"""Launchers and worker bodies for the bulk conversion-tag operations.

A launcher opens a job, hands the work to a daemon thread and returns the job's
token; the worker walks the selection and reports what it did. Nothing is kept
in this process: the state lives in ``bulk_tag_job`` rows, written through
``website/repos/bulk_tag_jobs.py``. The thread still dies with the process, but
the job it was running no longer disappears with it - it keeps its last
recorded progress and reads as interrupted from then on.
"""
import threading
import time
from contextlib import contextmanager

from website.db_class.db import Conversion
from website.repos import bulk_tag_jobs as jobs_repo
from website.web import db
from website.web.utils import extract_tag_names_from_misp_json

from . import tags_core

# How often a running job writes its progress. Against the dict this replaced,
# a write per item was free; against Postgres it is one UPDATE per item on top
# of the tag writes themselves. The admin panel polls every 1.5 seconds, so
# finer granularity than this is invisible to anybody.
FLUSH_EVERY_ITEMS = 25
FLUSH_EVERY_SECONDS = 1.0


# ── Worker launchers ──────────────────────────────────────────────

def start_scan(app, conversion_ids: list, user_id: int) -> str:
    """Auto-scan each conversion's input JSON and merge matching tags."""
    token = _open_job("scan", conversion_ids, user_id)
    _spawn(_scan_worker, app, token, conversion_ids, user_id)
    return token


def start_assign(app, conversion_ids: list, tag_ids: list, user_id: int) -> str:
    """Merge specific tags into every selected conversion."""
    token = _open_job("assign", conversion_ids, user_id)
    _spawn(_assign_worker, app, token, conversion_ids, tag_ids, user_id)
    return token


def start_remove(app, conversion_ids: list, tag_ids: list, user_id: int) -> str:
    """Remove specific tags from every selected conversion."""
    token = _open_job("remove", conversion_ids, user_id)
    _spawn(_remove_worker, app, token, conversion_ids, tag_ids)
    return token


def start_clear(app, conversion_ids: list, user_id: int) -> str:
    """Remove ALL tags from every selected conversion."""
    token = _open_job("clear", conversion_ids, user_id)
    _spawn(_clear_worker, app, token, conversion_ids)
    return token


# ── Private ───────────────────────────────────────────────────────

def _open_job(job_type: str, conversion_ids: list, user_id: int) -> str:
    """Create the job row, in the caller's request, and return its token."""
    job = jobs_repo.create(
        job_type=job_type, total=len(conversion_ids), user_id=user_id)
    return job.token


def _spawn(worker, *args) -> None:
    """Hand a worker body to a daemon thread."""
    threading.Thread(target=worker, args=args, daemon=True).start()


@contextmanager
def _worker_context(app):
    """The app context a worker runs in, with its session released after.

    A worker thread has no request to inherit a context from, so it pushes its
    own - and that context gets its own scoped session holding its own pooled
    connection. Releasing it explicitly keeps the connection from outliving the
    run whatever shape the worker body takes.
    """
    with app.app_context():
        try:
            yield
        finally:
            db.session.remove()


class _Progress:
    """One job's counters, written back to its row as the worker advances.

    A worker calls ``record()`` with each conversion's outcome, ``advance()``
    once that conversion is behind it, and ``finish()`` at the end. The
    counters ride along with every write, as does the heartbeat that keeps the
    job from reading as interrupted. Writes while the job runs are throttled,
    so what reaches the row is the counts as of the last one; two go through
    unthrottled, the terminal write and the first error.

    Each write is its own short transaction - one held open across a whole job
    would pin a pool connection and block vacuum on the tables being written.
    """

    def __init__(self, token: str):
        self.token = token
        self._handled = 0
        self._affected = 0
        self._skipped = 0
        self._unwritten = 0
        self._pending_errors = []
        self._reported_an_error = False
        self._last_write = time.monotonic()

    def record(self, affected: int | None) -> None:
        """One conversion's outcome: how many tag associations it affected, or
        ``None`` when there was nothing to do, which counts as skipped."""
        if affected is None:
            self._skipped += 1
        else:
            self._affected += affected

    def advance(self) -> None:
        """One more conversion behind us; write if the throttle allows."""
        self._handled += 1
        self._unwritten += 1
        if (self._unwritten >= FLUSH_EVERY_ITEMS
                or time.monotonic() - self._last_write >= FLUSH_EVERY_SECONDS):
            self._write(jobs_repo.touch)

    def finish(self) -> None:
        """The terminal write: the status and the final counts."""
        self._write(jobs_repo.finish)

    def failed(self, conversion_id: int, exc: Exception) -> None:
        """Record one per-item failure; the cap and the count live in the repo.

        What the item left pending goes back first. The next progress write
        commits this session, so a half-finished tag write would otherwise ride
        along with it - or fail it, and strand the job at ``running``.

        The first failure is written as it happens: it is what makes the panel
        show something the moment a run starts going wrong. The rest ride the
        next progress write, so a run that fails every item costs the same
        bounded number of writes as one that fails none. A crash loses the
        failures since the last write - the same window the counters already
        lose, and the failure the admin needs to see is already out.
        """
        db.session.rollback()
        self._pending_errors.append(f"#{conversion_id}: {str(exc)[:100]}")
        if not self._reported_an_error:
            jobs_repo.append_errors(
                token=self.token, messages=self._pending_errors)
            self._pending_errors = []
            self._reported_an_error = True

    def _write(self, write) -> None:
        write(token=self.token, progress=self._handled,
              affected=self._affected, skipped=self._skipped,
              errors=self._pending_errors)
        # cleared only once the write is back: a write that raised has not
        # carried these anywhere, and the next one should still try
        self._pending_errors = []
        self._unwritten = 0
        self._last_write = time.monotonic()


def _run_job(app, token: str, conversion_ids: list, handle) -> None:
    """Walk the selection, calling ``handle(conversion_id)`` on each.

    ``handle`` returns how many tag associations it affected, or ``None`` when
    there was nothing to do for that conversion - which counts as skipped.
    Whether the count means added or removed is the job type's business, and
    the sign is the template's.
    """
    with _worker_context(app):
        progress = _Progress(token)
        for conversion_id in conversion_ids:
            try:
                progress.record(handle(conversion_id))
            except Exception as exc:
                progress.failed(conversion_id, exc)
            progress.advance()
        progress.finish()


def _scan_worker(app, token: str, conversion_ids: list, user_id: int) -> None:
    _run_job(app, token, conversion_ids,
             lambda cid: _scan_conversion(cid, user_id))


def _assign_worker(app, token: str, conversion_ids: list, tag_ids: list,
                   user_id: int) -> None:
    _run_job(app, token, conversion_ids,
             lambda cid: tags_core.merge_conversion_tags(cid, tag_ids, user_id))


def _remove_worker(app, token: str, conversion_ids: list,
                   tag_ids: list) -> None:
    _run_job(app, token, conversion_ids,
             lambda cid: tags_core.remove_conversion_tags(cid, tag_ids))


def _clear_worker(app, token: str, conversion_ids: list) -> None:
    _run_job(app, token, conversion_ids,
             lambda cid: tags_core.clear_conversion_tags(cid))


def _scan_conversion(conversion_id: int, user_id: int) -> int | None:
    """Merge the tags named in one conversion's own MISP JSON.

    ``None`` when there is nothing to scan: no such conversion, no MISP text,
    no tag names in it, or none of those names naming a tag this user may use.
    """
    conv = Conversion.query.get(conversion_id)
    if not conv:
        return None
    # STIX→MISP: MISP JSON is in output_text; MISP→STIX: MISP JSON is in input_text
    misp_text = conv.output_text if conv.conversion_type == "STIX_TO_MISP" else conv.input_text
    if not misp_text:
        return None
    names = extract_tag_names_from_misp_json(misp_text)
    if not names:
        return None
    tags = tags_core.find_tags_by_names(user_id, names)
    if not tags:
        return None
    return tags_core.merge_conversion_tags(
        conversion_id, [t.id for t in tags], user_id, source_type="json")
