"""Serializing an ownerless conversion must not touch a NULL primary key.

``Conversion.user_id`` is nullable (anonymous / API-key conversions have no
owner). ``to_json`` resolves the author via ``get_user_name_by_id``; if that
loads ``User`` by a NULL id, SQLAlchemy warns ("fully NULL primary key
identity cannot load any object") and threatens to raise on a future release.
The public detail/history/API paths serialize ownerless rows routinely, so
this pins that path clean.
"""

import uuid as _uuid
import warnings
from datetime import datetime, timezone

from sqlalchemy.exc import SAWarning


def _ownerless_conversion():
    from website.db_class.db import Conversion

    now = datetime.now(timezone.utc)
    return Conversion(
        user_id=None, name="anon", source_format="misp", target_format="stix",
        input_text="{}", output_text="{}", params=None,
        created_at=now, updated_at=now, public=True, uuid=str(_uuid.uuid4()),
    )


def test_to_json_on_ownerless_conversion_emits_no_null_pk_warning(app_db):
    conv = _ownerless_conversion()
    with warnings.catch_warnings():
        warnings.simplefilter("error", SAWarning)
        result = conv.to_json()
    assert result["author"] is None
    assert result["user_id"] is None
