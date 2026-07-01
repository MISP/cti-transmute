"""Persistence for the Conversion aggregate (Conversion + ConversionHistory).

This is the single place that reads and writes ``Conversion`` and
``ConversionHistory`` rows. The conversion use-cases in
``website/lib/conversions.py`` and the web views in
``website/web/convert/`` route their Conversion persistence through here.

Transaction seam: every write takes ``commit: bool = True``. Web-CRUD callers
keep the default (each call is its own transaction). The spine use-cases pass
``commit=False`` so the row and its ``SystemLog`` audit entry commit together in
one all-or-nothing transaction owned by the use-case.
"""

import uuid as uuid_lib
from datetime import datetime, timezone

from website.db_class.db import Conversion, ConversionHistory
from website.web import db
from website.web.utils import generate_api_key

# --- Conversion: writes ------------------------------------------------------

def create(
    *, user_id: int | None, name: str, source_format: str | None,
    target_format: str | None, input_text: str, output_text: str,
    params: dict | None, description: str | None = None, public: bool = True,
    created_at: datetime | None = None, updated_at: datetime | None = None,
    commit: bool = True) -> Conversion:
    """Build and persist a ``Conversion`` row, minting its uuid and share key.

    ``add`` + ``flush`` always run (so ``conversion.id`` is assigned); the
    commit is gated on ``commit`` so a caller can bundle this row with other
    writes (e.g. an audit log) in one transaction.
    """
    now = created_at or datetime.now(timezone.utc)
    conversion = Conversion(
        user_id=user_id,
        name=name,
        source_format=source_format,
        target_format=target_format,
        input_text=input_text,
        output_text=output_text,
        params=params,
        description=description,
        created_at=now,
        updated_at=updated_at or now,
        public=public,
        uuid=str(uuid_lib.uuid4()),
        share_key=generate_api_key(36)
    )
    db.session.add(conversion)
    db.session.flush()  # assign conversion.id within the transaction
    if commit:
        db.session.commit()
    return conversion


def create_history(
    *, conversion: Conversion, new_output_text: str, params: dict | None,
    status: str = "pending", created_at: datetime | None = None,
    commit: bool = True) -> ConversionHistory:
    """Persist a ``ConversionHistory`` row for ``conversion``'s next version.

    Ownership, visibility, and the input/old-output snapshots are copied from
    the parent Conversion; the version is the next in sequence and the uuid is
    minted here. ``commit`` gates the transaction as for :func:`create`.
    """
    history = ConversionHistory(
        user_id=conversion.user_id,  # refresh doesn't change ownership
        conversion_id=conversion.id,
        version=next_history_version(conversion.id),
        uuid=str(uuid_lib.uuid4()),
        status=status,
        public=conversion.public,
        input_text=conversion.input_text,
        old_output_text=conversion.output_text,
        new_output_text=new_output_text,
        params=params,
        created_at=created_at or datetime.now(timezone.utc)
    )
    db.session.add(history)
    db.session.flush()  # assign history.id within the transaction
    if commit:
        db.session.commit()
    return history


def set_history_status(history: ConversionHistory, status: str, *,
                       commit: bool = True) -> ConversionHistory:
    """Set a history row's workflow ``status`` ('accepted' / 'rejected' / …)."""
    history.status = status
    if commit:
        db.session.commit()
    return history


def soft_delete(conversion_id: int, *, commit: bool = True) -> bool:
    """Soft-delete a Conversion (is_active=False, stamp deleted_at). False if missing."""
    conversion = Conversion.query.get(conversion_id)
    if not conversion:
        return False
    conversion.is_active = False
    conversion.deleted_at = datetime.now(timezone.utc)
    if commit:
        db.session.commit()
    return True


def restore(conversion_id: int, *, commit: bool = True) -> bool:
    """Restore a soft-deleted Conversion. False if missing or already active."""
    conversion = Conversion.query.get(conversion_id)
    if not conversion or conversion.is_active:
        return False
    conversion.is_active = True
    conversion.deleted_at = None
    if commit:
        db.session.commit()
    return True


def hard_delete(conversion_id: int, *, commit: bool = True) -> bool:
    """Permanently remove a Conversion row. False if missing."""
    conversion = Conversion.query.get(conversion_id)
    if not conversion:
        return False
    db.session.delete(conversion)
    if commit:
        db.session.commit()
    return True


def toggle_visibility(conversion_id: int, *, commit: bool = True) -> tuple[bool, bool]:
    """Flip a Conversion's public flag. Returns (found, new_public_value)."""
    conversion = get(conversion_id)
    if not conversion:
        return False, False
    conversion.public = not conversion.public
    new_value = conversion.public
    if commit:
        db.session.commit()
    return True, new_value


def edit(conversion_id: int, data: dict, *, commit: bool = True) -> tuple[bool, str]:
    """Update a Conversion's name and/or description.

    Rejects a name that collides with an existing Conversion. Returns
    (ok, message) — matching the web layer's existing contract.
    """
    conversion = get(conversion_id)
    if not conversion:
        return False, "no convert with this id"

    if conversion.name != data.get("name", conversion.name):
        existing = Conversion.query.filter_by(
            name=data.get("name", conversion.name)).first()
        if existing:
            return False, "Name already existe"

    conversion.name = data.get("name", conversion.name)
    conversion.description = data.get("description", conversion.description)
    if commit:
        db.session.commit()
    return True, ""


def regenerate_share_key(
        conversion_id: int, *, commit: bool = True) -> tuple[bool, str | None]:
    """Mint a fresh share key for a Conversion. Returns (found, new_key)."""
    conversion = get(conversion_id)
    if not conversion:
        return False, None
    conversion.share_key = generate_api_key(36)
    if commit:
        db.session.commit()
    return True, conversion.share_key


def next_history_version(conversion_id: int) -> int:
    """Next history version number; the base Conversion is treated as version 1."""
    last = (
        ConversionHistory.query
        .filter_by(conversion_id=conversion_id)
        .order_by(ConversionHistory.version.desc())
        .first()
    )
    return 2 if last is None else last.version + 1


# --- Conversion: single-row reads --------------------------------------------

def get(conversion_id: int, include_deleted: bool = False) -> Conversion | None:
    """Fetch a Conversion by id; soft-deleted rows are hidden unless requested."""
    conversion = Conversion.query.get(conversion_id)
    if conversion and not include_deleted and not conversion.is_active:
        return None
    return conversion


def get_by_uuid(uuid: str) -> Conversion | None:
    """Fetch a Conversion by its uuid."""
    return Conversion.query.filter_by(uuid=uuid).first()


# --- ConversionHistory: reads ------------------------------------------------

def get_history(history_id: int) -> ConversionHistory | None:
    """Fetch a single ConversionHistory row by its id."""
    return ConversionHistory.query.filter_by(id=history_id).first()


def latest_history(conversion_id: int) -> ConversionHistory | None:
    """The highest-version history row for a conversion."""
    return (
        ConversionHistory.query
        .filter_by(conversion_id=conversion_id)
        .order_by(ConversionHistory.version.desc())
        .first()
    )


def latest_history_list(conversion_id: int) -> list[ConversionHistory]:
    """All history rows for a conversion, newest version first."""
    return (
        ConversionHistory.query
        .filter_by(conversion_id=conversion_id)
        .order_by(ConversionHistory.version.desc())
        .all()
    )


def accepted_history_list(conversion_id: int) -> list[ConversionHistory]:
    """Accepted history rows for a conversion, oldest version first."""
    return (
        ConversionHistory.query
        .filter_by(conversion_id=conversion_id, status="accepted")
        .order_by(ConversionHistory.version.asc())
        .all()
    )
