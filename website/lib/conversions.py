"""The conversion use-case: convert-and-save.

`submit_conversion` runs a conversion through the Flask-free engine
(`transmute.convert`, ADR-0010's pure path) and persists the result. Per
ADR-0009 the converter runs *outside* the DB transaction, and the persistence is
one all-or-nothing transaction.
"""

import json
import uuid as uuid_lib
from datetime import datetime, timezone
from typing import Any

from cti_transmute import transmute
from website.db_class.db import Convert, SystemLog
from website.lib.exceptions import PersistenceFailed
from website.web import db
from website.web.account import account_core as AccountModel
from website.web.utils import generate_api_key


def _to_text(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, (bytes, bytearray)):
        return bytes(value).decode("utf-8")
    return json.dumps(value)


def submit_conversion(
    user, source: str, target: str, payload: Any, params, *,
    name: str | None = None, description: str | None = None,
    public: bool = True) -> Convert:
    """Convert ``payload`` and persist the result as a ``Convert`` row."""
    # ADR-0009: the converter runs outside the DB transaction.
    result = transmute.convert(source, target, payload, params)

    now = datetime.now(timezone.utc)
    convert = Convert(
        user_id=None if user is None else user.id,
        name=name or f"{source}_to_{target}_{now.strftime('%Y%m%d%H%M%S')}".upper(),
        conversion_type=f"{source}_to_{target}".upper(),
        input_text=_to_text(payload),
        output_text=_to_text(result),
        description=description,
        created_at=now,
        updated_at=now,
        public=public,
        uuid=str(uuid_lib.uuid4()),
        share_key=generate_api_key(36),
    )
    # ADR-0009: one all-or-nothing transaction — the Conversion row and its
    # audit log commit together, or not at all.
    db.session.add(convert)
    db.session.flush()  # assign convert.id within the transaction
    _record_creation(convert, user, now)
    try:
        db.session.commit()
    except Exception as exc:  # noqa: BLE001
        db.session.rollback()
        raise PersistenceFailed("Failed to persist the conversion") from exc

    # ADR-0009: external side effects fire only after commit. Notify followers
    # for an authenticated, public submission.
    if user is not None and public:
        AccountModel.notify_followers_new_convert(convert, user.id)
    return convert


def _record_creation(convert: Convert, user, now: datetime.datetime) -> None:
    """Add the `convert_created` audit log inside the conversion's transaction."""
    db.session.add(
        SystemLog(
            event_type="convert_created",
            actor_id=None if user is None else user.id,
            actor_name="Anonymous" if user is None
            else getattr(user, "first_name", None),
            target_type="convert",
            target_id=convert.id,
            target_name=convert.name,
            details=f"Type: {convert.conversion_type}, Public: {convert.public}",
            created_at=now,
        )
    )
