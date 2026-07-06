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
        conversions.AccountModel, "notify_followers_new_conversion",
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


# --- Refresh + history use-cases --------------------------------------------
#
# refresh_conversion / accept_history / reject_history bring the re-conversion
# workflow under the same spine as submit_conversion, with an inline ownership
# check (owner-or-admin). The converter runs outside the DB transaction and the
# history row commits atomically with its audit log.

import json  # noqa: E402
import uuid as _uuid  # noqa: E402
from datetime import datetime, timezone  # noqa: E402


def _make_user(*, admin=False, email="someone@test.test"):
    from website.db_class.db import User
    from website.web import db

    user = User(first_name=email.split("@")[0], last_name="x",
                email=email, admin=admin, api_key=email)
    db.session.add(user)
    db.session.commit()
    return user


def _make_conversion(misp_event, owner_id=None, *, output="OLD-OUTPUT", public=True):
    from website.db_class.db import Conversion
    from website.web import db

    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=owner_id, name="c", source_format="misp", target_format="stix",
        input_text=json.dumps(misp_event), output_text=output, params=None,
        created_at=now, updated_at=now, public=public, uuid=str(_uuid.uuid4()),
    )
    db.session.add(conv)
    db.session.commit()
    return conv


def test_owner_refresh_writes_a_pending_history_row_with_params(app_db, misp_event):
    from website.db_class.db import ConversionHistory, SystemLog
    from website.lib.conversions import refresh_conversion

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(misp_event, owner_id=owner.id)

    params = MispToStixParams()
    history = refresh_conversion(owner, conv, params)

    assert isinstance(history, ConversionHistory)
    assert history.conversion_id == conv.id
    assert history.status == "pending"
    assert history.user_id == owner.id  # refresh keeps the conversion's owner
    assert history.params == params.model_dump(mode="json", exclude_none=True)
    assert history.new_output_text  # the freshly converted bundle
    assert history.old_output_text == "OLD-OUTPUT"
    assert SystemLog.query.filter_by(event_type="convert_refreshed").count() == 1


def test_stranger_refresh_is_denied_and_writes_nothing(app_db, misp_event):
    from website.db_class.db import ConversionHistory, SystemLog
    from website.lib.conversions import refresh_conversion
    from website.lib.exceptions import PermissionDenied

    owner = _make_user(email="owner@test.test")
    stranger = _make_user(email="stranger@test.test")
    conv = _make_conversion(misp_event, owner_id=owner.id)

    with pytest.raises(PermissionDenied):
        refresh_conversion(stranger, conv, MispToStixParams())

    assert ConversionHistory.query.count() == 0
    assert SystemLog.query.count() == 0


def test_anonymous_refresh_is_denied_and_writes_nothing(app_db, misp_event):
    from website.db_class.db import ConversionHistory, SystemLog
    from website.lib.conversions import refresh_conversion
    from website.lib.exceptions import PermissionDenied

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(misp_event, owner_id=owner.id)

    with pytest.raises(PermissionDenied):
        refresh_conversion(None, conv, MispToStixParams())

    assert ConversionHistory.query.count() == 0
    assert SystemLog.query.count() == 0


def test_admin_refresh_records_admin_as_actor_but_keeps_owner(app_db, misp_event):
    from website.db_class.db import SystemLog
    from website.lib.conversions import refresh_conversion

    owner = _make_user(email="owner@test.test")
    admin = _make_user(email="admin@test.test", admin=True)
    conv = _make_conversion(misp_event, owner_id=owner.id)

    history = refresh_conversion(admin, conv, MispToStixParams())

    assert history.user_id == owner.id  # ownership unchanged by the admin's refresh
    log = SystemLog.query.filter_by(event_type="convert_refreshed").one()
    assert log.actor_id == admin.id  # but the audit records who acted


def test_refresh_commit_failure_writes_nothing(app_db, misp_event, monkeypatch):
    from website.db_class.db import ConversionHistory, SystemLog
    from website.lib import conversions
    from website.lib.exceptions import PersistenceFailed
    from website.web import db

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(misp_event, owner_id=owner.id)

    def boom():
        raise RuntimeError("database is down")

    monkeypatch.setattr(db.session, "commit", boom)
    with pytest.raises(PersistenceFailed):
        conversions.refresh_conversion(owner, conv, MispToStixParams())

    assert ConversionHistory.query.count() == 0
    assert SystemLog.query.filter_by(event_type="convert_refreshed").count() == 0


def _make_history(conv, *, new_output="NEW-OUTPUT", status="pending"):
    from website.db_class.db import ConversionHistory
    from website.web import db

    now = datetime.now(timezone.utc)
    history = ConversionHistory(
        user_id=conv.user_id, conversion_id=conv.id, version=2,
        uuid=str(_uuid.uuid4()), status=status, public=conv.public,
        input_text=conv.input_text, old_output_text=conv.output_text,
        new_output_text=new_output, params=None, created_at=now,
    )
    db.session.add(history)
    db.session.commit()
    return history


def test_owner_accept_adopts_new_output_and_records_event(app_db, misp_event):
    from website.db_class.db import SystemLog
    from website.lib.conversions import accept_history

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(misp_event, owner_id=owner.id, output="OLD-OUTPUT")
    history = _make_history(conv, new_output="NEW-OUTPUT")

    result = accept_history(owner, history)

    assert result.status == "accepted"
    assert conv.output_text == "NEW-OUTPUT"  # accept = adopt the refreshed result
    assert SystemLog.query.filter_by(event_type="convert_history_accepted").count() == 1


def test_stranger_accept_is_denied_and_changes_nothing(app_db, misp_event):
    from website.db_class.db import SystemLog
    from website.lib.conversions import accept_history
    from website.lib.exceptions import PermissionDenied

    owner = _make_user(email="owner@test.test")
    stranger = _make_user(email="stranger@test.test")
    conv = _make_conversion(misp_event, owner_id=owner.id, output="OLD-OUTPUT")
    history = _make_history(conv, new_output="NEW-OUTPUT")

    with pytest.raises(PermissionDenied):
        accept_history(stranger, history)

    assert history.status == "pending"        # status untouched
    assert conv.output_text == "OLD-OUTPUT"   # output not adopted
    assert SystemLog.query.count() == 0


def test_owner_reject_flips_status_without_touching_output(app_db, misp_event):
    from website.db_class.db import SystemLog
    from website.lib.conversions import reject_history

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(misp_event, owner_id=owner.id, output="OLD-OUTPUT")
    history = _make_history(conv, new_output="NEW-OUTPUT")

    result = reject_history(owner, history)

    assert result.status == "rejected"
    assert conv.output_text == "OLD-OUTPUT"  # reject never adopts the new output
    assert SystemLog.query.filter_by(event_type="convert_history_rejected").count() == 1


def test_stranger_reject_is_denied_and_changes_nothing(app_db, misp_event):
    from website.db_class.db import SystemLog
    from website.lib.conversions import reject_history
    from website.lib.exceptions import PermissionDenied

    owner = _make_user(email="owner@test.test")
    stranger = _make_user(email="stranger@test.test")
    conv = _make_conversion(misp_event, owner_id=owner.id, output="OLD-OUTPUT")
    history = _make_history(conv, new_output="NEW-OUTPUT")

    with pytest.raises(PermissionDenied):
        reject_history(stranger, history)

    assert history.status == "pending"
    assert SystemLog.query.count() == 0
