"""Integration tests for the submit_conversion use-case (convert + persist)."""

from types import SimpleNamespace

import pytest

from cti_transmute.converters.misp_to_stix import MispToStixParams
from cti_transmute.exceptions import ConverterFailed, UnknownConverter


def test_anonymous_submission_creates_a_convert_row(app_db, misp_event):
    from website.lib.conversions import submit_conversion

    convert = submit_conversion(
        user=None,
        source="misp",
        target="stix",
        payload=misp_event,
        params=MispToStixParams(),
    )

    assert convert.id is not None
    assert convert.user_id is None
    assert convert.output_text  # the STIX bundle, persisted as text


def test_submission_persists_the_params_used(app_db, misp_event):
    from website.lib.conversions import submit_conversion

    params = MispToStixParams()
    convert = submit_conversion(
        user=None, source="misp", target="stix",
        payload=misp_event, params=params,
    )

    # the exact dict persisted, and it re-validates against the params class
    assert convert.params == params.model_dump(mode="json", exclude_none=True)
    assert MispToStixParams(**convert.params) == params


def test_submission_records_source_and_target_formats(app_db, misp_event):
    from website.lib.conversions import submit_conversion

    convert = submit_conversion(
        user=None, source="misp", target="stix",
        payload=misp_event, params=MispToStixParams(),
    )

    assert convert.source_format == "misp"
    assert convert.target_format == "stix"


def test_serialized_conversion_exposes_formats_and_params(app_db, misp_event):
    from website.lib.conversions import submit_conversion

    convert = submit_conversion(
        user=None, source="misp", target="stix",
        payload=misp_event, params=MispToStixParams(),
    )
    data = convert.to_json()

    assert data["source_format"] == "misp"
    assert data["target_format"] == "stix"
    assert data["params"] == MispToStixParams().model_dump(mode="json", exclude_none=True)
    # conversion_type is still emitted, now DERIVED from the formats (no stored column)
    assert data["conversion_type"] == "MISP_TO_STIX"


def test_conversion_type_is_derived_and_queryable(app_db, misp_event):
    """The dropped free-form column survives as a queryable hybrid discriminator."""
    from website.db_class.db import Conversion
    from website.lib.conversions import submit_conversion

    submit_conversion(
        user=None, source="misp", target="stix",
        payload=misp_event, params=MispToStixParams(),
    )

    # instance-level derivation
    row = Conversion.query.first()
    assert row.conversion_type == "MISP_TO_STIX"
    # class-level expression: usable in a SQL WHERE clause
    assert Conversion.query.filter(
        Conversion.conversion_type == "MISP_TO_STIX").count() == 1
    assert Conversion.query.filter(
        Conversion.conversion_type == "STIX_TO_MISP").count() == 0


def test_conversion_history_stores_and_serializes_params(app_db, misp_event):
    import uuid as uuid_lib

    from website.db_class.db import ConversionHistory
    from website.lib.conversions import submit_conversion
    from website.web import db

    conv = submit_conversion(
        user=None, source="misp", target="stix",
        payload=misp_event, params=MispToStixParams(),
    )
    params_dict = MispToStixParams().model_dump(mode="json", exclude_none=True)
    history = ConversionHistory(
        conversion_id=conv.id, version=1, uuid=str(uuid_lib.uuid4()),
        status="pending", params=params_dict,
    )
    db.session.add(history)
    db.session.commit()

    assert ConversionHistory.query.first().params == params_dict
    assert history.to_json()["params"] == params_dict


def test_legacy_conversion_with_no_params_serializes_cleanly(app_db):
    """Pre-migration rows have params IS NULL and must not crash the read-side."""
    import uuid as uuid_lib
    from datetime import datetime, timezone

    from website.db_class.db import Conversion
    from website.web import db

    now = datetime.now(timezone.utc)
    legacy = Conversion(
        name="legacy", source_format="misp", target_format="stix",
        input_text="x", output_text="y", params=None,
        created_at=now, updated_at=now, uuid=str(uuid_lib.uuid4()),
    )
    db.session.add(legacy)
    db.session.commit()

    data = legacy.to_json()
    assert data["params"] is None
    assert data["conversion_type"] == "MISP_TO_STIX"  # still derives from formats


def test_authenticated_submission_records_user_id(app_db, misp_event):
    from website.lib.conversions import submit_conversion

    convert = submit_conversion(
        user=SimpleNamespace(id=42),
        source="misp",
        target="stix",
        payload=misp_event,
        params=MispToStixParams(),
    )

    assert convert.user_id == 42


def test_unknown_converter_writes_no_row(app_db, misp_event):
    from website.db_class.db import Conversion
    from website.lib.conversions import submit_conversion

    with pytest.raises(UnknownConverter):
        submit_conversion(
            user=None, source="misp", target="nope",
            payload=misp_event, params=MispToStixParams(),
        )

    assert Conversion.query.count() == 0


def test_converter_failure_writes_no_row(app_db, misp_event, monkeypatch):
    from website.db_class.db import Conversion
    from website.lib import conversions

    def boom(*a, **k):
        raise ConverterFailed("library blew up")

    monkeypatch.setattr(conversions.transmute, "convert", boom)
    with pytest.raises(ConverterFailed):
        conversions.submit_conversion(
            user=None, source="misp", target="stix",
            payload=misp_event, params=MispToStixParams(),
        )

    assert Conversion.query.count() == 0


def test_commit_failure_raises_persistence_failed_and_writes_nothing(
    app_db, misp_event, monkeypatch
):
    from website.db_class.db import Conversion
    from website.lib import conversions
    from website.lib.exceptions import PersistenceFailed
    from website.web import db

    def boom():
        raise RuntimeError("database is down")

    monkeypatch.setattr(db.session, "commit", boom)
    with pytest.raises(PersistenceFailed):
        conversions.submit_conversion(
            user=None, source="misp", target="stix",
            payload=misp_event, params=MispToStixParams(),
        )

    assert Conversion.query.count() == 0  # rolled back — nothing persisted


def test_successful_submission_writes_one_audit_log(app_db, misp_event):
    from website.db_class.db import SystemLog
    from website.lib.conversions import submit_conversion

    submit_conversion(
        user=None, source="misp", target="stix",
        payload=misp_event, params=MispToStixParams(),
    )

    assert SystemLog.query.filter_by(event_type="convert_created").count() == 1


def test_anonymous_submission_does_not_notify_followers(
    app_db, misp_event, monkeypatch
):
    from website.lib import conversions

    called = []
    monkeypatch.setattr(
        conversions.AccountModel, "notify_followers_new_convert",
        lambda *a, **k: called.append(1),
    )
    conversions.submit_conversion(
        user=None, source="misp", target="stix",
        payload=misp_event, params=MispToStixParams(),
    )

    assert called == []


def test_audit_log_is_atomic_with_the_conversion(app_db, misp_event, monkeypatch):
    from website.db_class.db import SystemLog
    from website.lib import conversions
    from website.lib.exceptions import PersistenceFailed
    from website.web import db

    def boom():
        raise RuntimeError("database is down")

    monkeypatch.setattr(db.session, "commit", boom)
    with pytest.raises(PersistenceFailed):
        conversions.submit_conversion(
            user=None, source="misp", target="stix",
            payload=misp_event, params=MispToStixParams(),
        )

    assert SystemLog.query.count() == 0  # audit rolled back with the conversion
