"""Stored-value guard: retired 'convert' machine values are never written again.

Renamed the activity-log and notification stored values (``conversion_*``
event types, ``target_type``/``related_type`` of
``conversion``/``conversion_history``, notification type
``new_follow_conversion``) and migrated historical rows in place
(ADR-0016). This test keeps a future call site — or a well-meaning
revert — from reintroducing the retired values into code, which would
silently re-mix the stored data (exactly how the ticket-14 drive-by
slipped through unnoticed).

Scope: stored-value literals only. The verb surfaces ruled permanent
(``/api/convert/`` routes, the ``convert`` namespace, submit buttons named
``convert``) are out of scope by pattern design, and ``website/migrations/``
is excluded — migration files legitimately spell the old values.
"""

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

VENDORED_JS = re.compile(
    r"static/(pivotick/|js/(jquery|vue\.global|select2|zxcvbn|popper|"
    r"pivotick|SimulationWorker|jquery-ui))"
)

_EVENT_STEMS = (
    "created|refreshed|deleted|edited|visibility_changed|favorited"
    "|unfavorited|restored|hard_deleted|history_accepted|history_rejected"
)

RETIRED_VALUE_PATTERNS = [
    # Python kwargs: target_type="convert", related_type='convert_history'
    re.compile(r"(target_type|related_type)\s*=\s*[\"']convert(_history)?[\"']"),
    # JS comparisons: l.target_type === 'convert'
    re.compile(r"(target_type|related_type)\s*===?\s*[\"']convert(_history)?[\"']"),
    # The retired event-type strings, quoted anywhere
    re.compile(rf"[\"']convert_(?:{_EVENT_STEMS})[\"']"),
    # …or as unquoted JS object keys (EVENT_META-style styling maps)
    re.compile(rf"\bconvert_(?:{_EVENT_STEMS})\s*:"),
    # The retired notification type, quoted or bare
    re.compile(r"\bnew_follow_convert\b"),
]

# Positional writes slip past the kwarg pattern; catch 'convert' literals on
# the activity-log/notification call-site line itself.
_CALL_SITES = re.compile(r"create_system_log|create_notification|_record_activity")
_BARE_VALUE = re.compile(r"[\"']convert(_history)?[\"']")


def _surface_files():
    yield from (REPO_ROOT / "website" / "web" / "templates").rglob("*.html")
    for js in (REPO_ROOT / "website" / "web" / "static").rglob("*.js"):
        if not VENDORED_JS.search(js.as_posix()):
            yield js
    for py in (REPO_ROOT / "website").rglob("*.py"):
        if "migrations" not in py.parts:
            yield py


def test_no_retired_stored_values_in_code():
    offenders = []
    for path in _surface_files():
        text = path.read_text(encoding="utf-8", errors="replace")
        for lineno, line in enumerate(text.splitlines(), start=1):
            hit = any(p.search(line) for p in RETIRED_VALUE_PATTERNS) or (
                _CALL_SITES.search(line) and _BARE_VALUE.search(line)
            )
            if hit:
                rel = path.relative_to(REPO_ROOT)
                offenders.append(f"{rel}:{lineno}: {line.strip()[:120]}")
    assert not offenders, (
        "retired 'convert' stored values written by code (ticket 15 renamed "
        "them and migrated the rows — see ADR-0016):\n" + "\n".join(offenders)
    )
