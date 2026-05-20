"""
Small in-memory background job system for bulk convert-tag operations.
Jobs are stored in a module-level dict (resets on server restart).
Workers run in daemon threads and push their own Flask app context.
"""
import datetime
import threading
import uuid as _uuid

_jobs: dict = {}
_lock = threading.Lock()


# ── Public helpers ────────────────────────────────────────────────

def create(job_type: str, total: int) -> str:
    jid = _uuid.uuid4().hex[:8]
    with _lock:
        _jobs[jid] = {
            'id':         jid,
            'type':       job_type,   # 'scan' | 'assign'
            'status':     'running',
            'progress':   0,
            'total':      total,
            'added':      0,
            'skipped':    0,
            'errors':     [],
            'created_at': datetime.datetime.utcnow().isoformat(timespec='seconds'),
        }
        _trim()
    return jid


def update(jid: str, **kw) -> None:
    with _lock:
        if jid in _jobs:
            _jobs[jid].update(kw)


def get(jid: str) -> dict:
    with _lock:
        return dict(_jobs.get(jid, {}))


def list_recent() -> list:
    with _lock:
        jobs = sorted(_jobs.values(), key=lambda j: j['created_at'], reverse=True)
        return [dict(j) for j in jobs[:30]]


def remove(jid: str) -> bool:
    with _lock:
        if jid in _jobs:
            del _jobs[jid]
            return True
        return False


# ── Worker launchers ──────────────────────────────────────────────

def start_scan(app, convert_ids: list, user_id: int) -> str:
    """Auto-scan each convert's input JSON and merge matching tags."""
    jid = create('scan', len(convert_ids))
    t = threading.Thread(target=_scan_worker, args=(app, jid, convert_ids, user_id), daemon=True)
    t.start()
    return jid


def start_assign(app, convert_ids: list, tag_ids: list, user_id: int) -> str:
    """Merge specific tags into every selected convert."""
    jid = create('assign', len(convert_ids))
    t = threading.Thread(target=_assign_worker, args=(app, jid, convert_ids, tag_ids, user_id), daemon=True)
    t.start()
    return jid


def start_remove(app, convert_ids: list, tag_ids: list, user_id: int) -> str:
    """Remove specific tags from every selected convert."""
    jid = create('remove', len(convert_ids))
    t = threading.Thread(target=_remove_worker, args=(app, jid, convert_ids, tag_ids, user_id), daemon=True)
    t.start()
    return jid


def start_clear(app, convert_ids: list, user_id: int) -> str:
    """Remove ALL tags from every selected convert."""
    jid = create('clear', len(convert_ids))
    t = threading.Thread(target=_clear_worker, args=(app, jid, convert_ids, user_id), daemon=True)
    t.start()
    return jid


# ── Private ───────────────────────────────────────────────────────

def _trim() -> None:
    """Keep at most 30 jobs (called inside _lock)."""
    if len(_jobs) > 30:
        oldest = sorted(_jobs, key=lambda jid: _jobs[jid]['created_at'])
        for jid in oldest[:-30]:
            del _jobs[jid]


def _scan_worker(app, jid: str, convert_ids: list, user_id: int) -> None:
    with app.app_context():
        from website.db_class.db import Convert
        from website.web.tags.tags_core import find_tags_by_names, merge_convert_tags
        from website.web.utils import extract_tag_names_from_misp_json

        added_total = 0
        skipped = 0

        for i, cid in enumerate(convert_ids):
            try:
                conv = Convert.query.get(cid)
                if not conv or not conv.input_text:
                    skipped += 1
                    update(jid, progress=i + 1, skipped=skipped)
                    continue
                names = extract_tag_names_from_misp_json(conv.input_text)
                if not names:
                    skipped += 1
                    update(jid, progress=i + 1, skipped=skipped)
                    continue
                tags = find_tags_by_names(user_id, names)
                if tags:
                    n = merge_convert_tags(cid, [t.id for t in tags], user_id)
                    added_total += n
                else:
                    skipped += 1
            except Exception as exc:
                with _lock:
                    _jobs[jid]['errors'].append(f'#{ cid }: {str(exc)[:100]}')
            update(jid, progress=i + 1, added=added_total, skipped=skipped)

        update(jid, status='done', progress=len(convert_ids), added=added_total, skipped=skipped)


def _assign_worker(app, jid: str, convert_ids: list, tag_ids: list, user_id: int) -> None:
    with app.app_context():
        from website.web.tags.tags_core import merge_convert_tags

        added_total = 0

        for i, cid in enumerate(convert_ids):
            try:
                n = merge_convert_tags(cid, tag_ids, user_id)
                added_total += n
            except Exception as exc:
                with _lock:
                    _jobs[jid]['errors'].append(f'#{ cid }: {str(exc)[:100]}')
            update(jid, progress=i + 1, added=added_total)

        update(jid, status='done', progress=len(convert_ids), added=added_total)


def _remove_worker(app, jid: str, convert_ids: list, tag_ids: list, user_id: int) -> None:
    with app.app_context():
        from website.web.tags.tags_core import remove_convert_tags

        removed_total = 0

        for i, cid in enumerate(convert_ids):
            try:
                n = remove_convert_tags(cid, tag_ids)
                removed_total += n
            except Exception as exc:
                with _lock:
                    _jobs[jid]['errors'].append(f'#{cid}: {str(exc)[:100]}')
            update(jid, progress=i + 1, added=removed_total)

        update(jid, status='done', progress=len(convert_ids), added=removed_total)


def _clear_worker(app, jid: str, convert_ids: list, user_id: int) -> None:
    with app.app_context():
        from website.web.tags.tags_core import clear_convert_tags

        removed_total = 0

        for i, cid in enumerate(convert_ids):
            try:
                n = clear_convert_tags(cid)
                removed_total += n
            except Exception as exc:
                with _lock:
                    _jobs[jid]['errors'].append(f'#{cid}: {str(exc)[:100]}')
            update(jid, progress=i + 1, added=removed_total)

        update(jid, status='done', progress=len(convert_ids), added=removed_total)
