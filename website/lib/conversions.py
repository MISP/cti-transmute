"""The conversion use-case: convert-and-save.

`submit_conversion` runs a conversion through the Flask-free engine
(`transmute.convert`) and persists the result.
The converter runs *outside* the DB transaction, and the persistence is
one all-or-nothing transaction.
"""

import json
from datetime import datetime, timezone
from typing import Any

from cti_transmute import transmute
from website.db_class.db import Conversion, ConversionHistory, SystemLog
from website.lib.access import assert_can_moderate, assert_can_refresh
from website.lib.exceptions import PersistenceFailed
from website.repos import conversions as conv_repo
from website.web import db
from website.web.account import account_core as AccountModel


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
    """Accept a pending refresh: adopt its output onto the Conversion.

    Owner-or-admin only (``assert_can_moderate``). Marks the history row
    ``accepted`` and copies its ``new_output_text`` onto the parent Conversion
    (the established 'accept the refresh' meaning), atomically with the audit log.
    """
    conversion = history.conversion
    assert_can_moderate(user, conversion)

    now = datetime.now(timezone.utc)
    conv_repo.set_history_status(history, "accepted", commit=False)
    conversion.output_text = history.new_output_text
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
