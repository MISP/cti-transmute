"""The conversion-domain use-cases.

`submit_conversion` runs a conversion through the Flask-free engine
(`transmute.convert`) and persists the result.
The converter runs *outside* the DB transaction, and the persistence is
one all-or-nothing transaction.

`add_comment` is the first catalogue mutation on the same seam:
validate → authz → one atomic mutate+activity transaction → post-commit notification.
Every use-case takes the acting Submitter (``User | None``) explicitly - no
``current_user`` in here — and raises the typed exceptions from
``website/lib/exceptions.py``.
"""

import json
from datetime import datetime, timezone
from typing import Any

from cti_transmute import transmute
from website.db_class.db import (
    Comment, Conversion, ConversionHistory, ConversionReport, SystemLog)
from website.lib.access import (
    assert_can_comment, assert_can_moderate, assert_can_push,
    assert_can_refresh, is_owner_or_admin)
from website.lib.exceptions import PersistenceFailed, ValidationFailed
from website.lib.misp import MispHttpError, _misp_request, build_misp_push_payload
from website.repos import comments as comments_repo
from website.repos import conversions as conv_repo
from website.repos import reports as reports_repo
from website.web import db
from website.web.account import account_core as AccountModel
from website.web.evaluate import evaluate_core as EvalModel

COMMENT_MAX_LENGTH = 2000
REPORT_REASONS = ("spam", "inappropriate", "inaccurate", "other")
REPORT_DESCRIPTION_MAX_LENGTH = 1000
BULK_ACTIONS = ("restore", "hard_delete")


def _to_text(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, (bytes, bytearray)):
        return bytes(value).decode("utf-8")
    return json.dumps(value)


def submit_conversion(
    user, source: str, target: str, payload: Any, params, *,
    name: str | None = None, description: str | None = None,
    public: bool = True) -> Conversion:
    """Conversion ``payload`` and persist the result as a ``Conversion`` row."""
    # The converter runs outside the DB transaction.
    result = transmute.convert(source, target, payload, params)

    now = datetime.now(timezone.utc)
    # One all-or-nothing transaction — the Conversion row and its audit log
    # commit together, or not at all. The repo stages the row (add + flush,
    # assigning conversion.id and minting its uuid/share_key); this use-case owns
    # the commit so the audit entry lands in the same transaction.
    conversion = conv_repo.create(
        user_id=None if user is None else user.id,
        name=name or f"{source}_to_{target}_{now.strftime('%Y%m%d%H%M%S')}".upper(),
        source_format=source,
        target_format=target,
        input_text=_to_text(payload),
        output_text=_to_text(result),
        params=params.model_dump(mode="json", exclude_none=True),
        description=description,
        created_at=now,
        updated_at=now,
        public=public,
        commit=False
    )
    _record_creation(conversion, user, now)
    try:
        db.session.commit()
    except Exception as exc:  # noqa: BLE001
        db.session.rollback()
        raise PersistenceFailed("Failed to persist the conversion") from exc

    # External side effects fire only after commit. Notify followers for an
    # authenticated, public submission.
    if user is not None and public:
        AccountModel.notify_followers_new_conversion(conversion, user.id)
    return conversion


def _record_creation(conversion: Conversion, user, now: datetime) -> None:
    """Add the `conversion_created` activity-log entry inside the conversion's transaction."""
    _record_activity(
        "conversion_created", user, "conversion", conversion.id, conversion.name, now,
        details=f"Type: {conversion.conversion_type}, Public: {conversion.public}",
    )


def _record_activity(event_type: str, actor, target_type: str, target_id: int,
                     target_name: str, now: datetime, details: str | None = None) -> None:
    """Add an Activity-log (``SystemLog``) row to the current transaction.

    Staged, not committed: the caller owns the commit, so the entry lands
    atomically with the mutation it describes — the clean commit boundary is
    the point, not durability (the Activity log is disposable display data,
    ADR-0016). ``actor`` is the *acting* user (e.g. an admin refreshing
    someone else's Conversion), which can differ from the row's owner.
    """
    db.session.add(
        SystemLog(
            event_type=event_type,
            actor_id=None if actor is None else actor.id,
            actor_name="Anonymous" if actor is None
            else getattr(actor, "first_name", None),
            target_type=target_type,
            target_id=target_id,
            target_name=target_name,
            details=details,
            created_at=now
        )
    )


def add_comment(
    user, conversion: Conversion, content: str, *,
    is_private: bool = False, parent_id: int | None = None,
    is_evaluation: bool = False) -> Comment:
    """Comment on a Conversion (or reply to one of its comments) and record it.

    Validate → authz → atomic mutate+activity → post-commit notification: the
    content is length-checked, the Submitter must be authenticated and able to
    see the Conversion (``assert_can_comment``), and the comment row commits
    atomically with its Activity log entry - a failure rolls back both and
    raises ``PersistenceFailed``. Only after the commit does the notification
    fire: a reply notifies the parent comment's author, a top-level comment
    notifies the Conversion's owner.
    """
    content = content.strip()
    if not content:
        raise ValidationFailed("Missing content")
    if len(content) > COMMENT_MAX_LENGTH:
        raise ValidationFailed(
            f"Comment is too long (max {COMMENT_MAX_LENGTH} characters)")
    assert_can_comment(user, conversion)

    parent = comments_repo.get(parent_id) if parent_id else None
    if parent_id and (parent is None or parent.conversion_id != conversion.id):
        raise ValidationFailed("Parent comment not found")

    now = datetime.now(timezone.utc)
    # The repo stages the comment row (add + flush); this use-case owns the
    # commit so the activity entry lands in the same transaction.
    comment = comments_repo.create(
        conversion_id=conversion.id,
        user_id=user.id,
        content=content,
        is_private=is_private,
        parent_id=parent.id if parent else None,
        # A reply never carries the flag: evaluation context lives on the parent.
        is_evaluation=bool(is_evaluation) if not parent else False,
        created_at=now,
        commit=False
    )
    action = "reply" if parent else "comment"
    _record_activity(
        "comment_created", user, "comment", comment.id,
        f"On conversion: {conversion.name}", now,
        details=f"{action.capitalize()} — {content[:120]}{'…' if len(content) > 120 else ''}"
    )
    try:
        db.session.commit()
    except Exception as exc:  # noqa: BLE001
        db.session.rollback()
        raise PersistenceFailed("Failed to save comment") from exc

    # External side effects fire only after commit.
    if parent is not None:
        AccountModel.notify_comment_reply(parent, comment, user.id)
    else:
        AccountModel.notify_new_comment(conversion, comment, user.id)
    return comment


def report_conversion(
    user, conversion: Conversion, reason: str, *,
    description: str | None = None) -> ConversionReport:
    """Report a Conversion for abuse and notify admins.

    Validate → atomic report+activity → post-commit admin notification: the
    reason is checked against the allowed set (and the description length-capped)
    *before* any write, the report row commits atomically with its Activity log
    entry - a failure rolls back both and raises ``PersistenceFailed`` - and the
    admin notification fires only after the commit lands. Reporting carries no
    ownership rule, so there is no authz gate here; the Submitter
    (``User | None``) only stamps the report's ``user_id``.
    """
    reason = (reason or "").strip()
    if reason not in REPORT_REASONS:
        raise ValidationFailed("Invalid report reason")
    description = (description or "").strip() or None
    if description and len(description) > REPORT_DESCRIPTION_MAX_LENGTH:
        raise ValidationFailed(
            f"Description is too long (max {REPORT_DESCRIPTION_MAX_LENGTH} characters)")

    now = datetime.now(timezone.utc)
    # The repo stages the report row (add + flush); this use-case owns the
    # commit so the activity entry lands in the same transaction.
    report = reports_repo.create(
        conversion_id=conversion.id,
        user_id=None if user is None else user.id,
        reason=reason,
        description=description,
        created_at=now,
        commit=False
    )
    _record_activity(
        "conversion_reported", user, "conversion", conversion.id, conversion.name, now,
        details=f"Reason: {reason}"
    )
    try:
        db.session.commit()
    except Exception as exc:  # noqa: BLE001
        db.session.rollback()
        raise PersistenceFailed("Failed to submit report") from exc

    # External side effects fire only after commit.
    AccountModel.notify_admins_new_report(
        conversion, None if user is None else user.id)
    return report


def bulk_action(user, action: str, conversion_ids: list[int]) -> int:
    """Restore or permanently delete a batch of trashed Conversions.

    Per-item best-effort - deliberately *not* all-or-nothing: each id is
    resolved (missing → skipped), gated on the owner-or-admin rule (denied →
    skipped, so an anonymous Submitter acts on nothing), and mutated atomically
    with its own Activity log entry - a failed item rolls back alone and the
    batch carries on. Restoring a Conversion that is not in the trash is a
    skip, not an error. Returns the number of items actually acted on; only
    ``action`` itself is validated up front (``ValidationFailed``).
    """
    if action not in BULK_ACTIONS:
        raise ValidationFailed("Invalid bulk action")
    done = 0
    for conversion_id in conversion_ids:
        conversion = conv_repo.get(conversion_id, include_deleted=True)
        if conversion is None or not is_owner_or_admin(user, conversion):
            continue
        # Captured before the mutation: a hard-deleted row can't be read back.
        target_id, target_name = conversion.id, conversion.name
        now = datetime.now(timezone.utc)
        # The whole mutate+activity+commit unit is the item's transaction: a
        # failure anywhere in it (staging included) skips this item alone.
        try:
            if action == "restore":
                applied = conv_repo.restore(target_id, commit=False)
                event_type = "conversion_restored"
            else:
                applied = conv_repo.hard_delete(target_id, commit=False)
                event_type = "conversion_hard_deleted"
            if not applied:
                continue
            _record_activity(
                event_type, user, "conversion", target_id, target_name, now
            )
            db.session.commit()
        except Exception:  # noqa: BLE001
            db.session.rollback()
            continue
        done += 1
    return done


def push_to_misp(user, conversion: Conversion, *, misp_url: str, api_key: str,
                 extra_tags: list[str] | None = None) -> str | None:
    """Push a Conversion's MISP event to a remote MISP instance and record it.

    Authorize → build → POST → record: visibility-gated (``assert_can_push``),
    the payload comes from the pure builder plus any ``extra_tags`` the
    Submitter picked (``ValidationFailed`` when the stored data holds no MISP
    event), and the POST goes through the thin transport helper - anything the
    instance does wrong surfaces as a typed ``MispError``, including the MISP
    quirk of reporting ``errors`` inside a 2xx body (``MispHttpError``). Only
    a push that landed records the ``misp_push`` Activity entry, and that
    entry is best-effort: the event already exists remotely, so a failed log
    write rolls back and is swallowed rather than misreporting the push (the
    Activity log is disposable display data). Returns the new MISP event id
    when the instance reports one.
    """
    assert_can_push(user, conversion)

    summary        = EvalModel.get_summary(conversion.id)
    consensus_tags = EvalModel.get_consensus_tags(conversion.id, threshold=2)
    push_tags      = EvalModel.get_misp_push_tags(conversion.id)
    event_dict, _  = build_misp_push_payload(
        conversion, push_tags, consensus_tags, summary
    )

    # Merge the Submitter's extra tags that are not already on the event
    existing_names = {t.get("name", "") for t in (event_dict.get("Tag") or [])}
    for tag_name in extra_tags or []:
        if tag_name and tag_name not in existing_names:
            event_dict.setdefault("Tag", []).append(
                {"name": tag_name, "exportable": True}
            )

    result = _misp_request("POST", "/events", url=misp_url, key=api_key,
                           body={"Event": event_dict}, timeout=30)
    result = result if isinstance(result, dict) else {}
    if result.get("errors"):
        raise MispHttpError(200, str(result["errors"]))
    new_event_id = (result.get("Event") or {}).get("id")

    now = datetime.now(timezone.utc)
    _record_activity(
        "misp_push", user, "conversion", conversion.id, conversion.name, now,
        details=f"Pushed to {misp_url} - new event ID: {new_event_id}"
    )
    try:
        db.session.commit()
    except Exception:  # noqa: BLE001
        # The push already landed remotely - swallowing the lost entry beats
        # misreporting a successful push (the log is disposable).
        db.session.rollback()
    return new_event_id


def refresh_conversion(user, conversion: Conversion, params) -> ConversionHistory:
    """Re-run a Conversion's Converter on its stored input and record the result.

    Owner-or-admin only (``assert_can_refresh``); anonymous/strangers raise
    ``PermissionDenied`` before anything is converted or written. Re-runs the
    engine on ``conversion.input_text`` (outside the transaction), then writes
    a ``ConversionHistory`` row with ``status="pending"`` and the ``params``
    used - owned by the Conversion's owner, not the refresher - and its audit
    log, atomically.
    """
    assert_can_refresh(user, conversion)

    # The converter runs outside the DB transaction.
    result = transmute.convert(
        conversion.source_format, conversion.target_format,
        conversion.input_text, params,
    )

    now = datetime.now(timezone.utc)
    # The repo stages the pending history row (add + flush); this use-case owns
    # the commit so the audit entry is atomic with it.
    history = conv_repo.create_history(
        conversion=conversion,
        new_output_text=_to_text(result),
        params=params.model_dump(mode="json", exclude_none=True),
        created_at=now,
        commit=False
    )
    _record_activity(
        "conversion_refreshed", user, "conversion", conversion.id, conversion.name, now,
    )
    try:
        db.session.commit()
    except Exception as exc:  # noqa: BLE001
        db.session.rollback()
        raise PersistenceFailed("Failed to persist the refreshed conversion") from exc
    return history


def accept_history(user, history: ConversionHistory) -> ConversionHistory:
    """Accept a pending refresh: adopt its output and params onto the Conversion.

    Owner-or-admin only (``assert_can_moderate``). Marks the history row
    ``accepted`` and copies its ``new_output_text`` and ``params`` onto the
    parent Conversion (``Conversion.params`` stays "the params the conversion
    ran with"), atomically with the audit log.
    """
    conversion = history.conversion
    assert_can_moderate(user, conversion)

    now = datetime.now(timezone.utc)
    conv_repo.set_history_status(history, "accepted", commit=False)
    conversion.output_text = history.new_output_text
    conversion.params = history.params
    conversion.updated_at = now
    _record_activity(
        "conversion_history_accepted", user, "conversion_history", history.id,
        conversion.name, now,
    )
    try:
        db.session.commit()
    except Exception as exc:  # noqa: BLE001
        db.session.rollback()
        raise PersistenceFailed("Failed to accept the history entry") from exc
    return history


def reject_history(user, history: ConversionHistory) -> ConversionHistory:
    """Reject a pending refresh: mark it ``rejected``, leaving the Conversion as-is.

    Owner-or-admin only (``assert_can_moderate``). The mirror of
    `accept_history` — but a rejection never adopts the new output onto the
    parent Conversion.
    """
    conversion = history.conversion
    assert_can_moderate(user, conversion)

    now = datetime.now(timezone.utc)
    conv_repo.set_history_status(history, "rejected", commit=False)
    _record_activity(
        "conversion_history_rejected", user, "conversion_history", history.id,
        conversion.name, now,
    )
    try:
        db.session.commit()
    except Exception as exc:  # noqa: BLE001
        db.session.rollback()
        raise PersistenceFailed("Failed to reject the history entry") from exc
    return history
