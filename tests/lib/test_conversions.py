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
    from website.db_class.db import Convert
    from website.lib.conversions import submit_conversion

    with pytest.raises(UnknownConverter):
        submit_conversion(
            user=None, source="misp", target="nope",
            payload=misp_event, params=MispToStixParams(),
        )

    assert Convert.query.count() == 0


def test_converter_failure_writes_no_row(app_db, misp_event, monkeypatch):
    from website.db_class.db import Convert
    from website.lib import conversions

    def boom(*a, **k):
        raise ConverterFailed("library blew up")

    monkeypatch.setattr(conversions.transmute, "convert", boom)
    with pytest.raises(ConverterFailed):
        conversions.submit_conversion(
            user=None, source="misp", target="stix",
            payload=misp_event, params=MispToStixParams(),
        )

    assert Convert.query.count() == 0


def test_commit_failure_raises_persistence_failed_and_writes_nothing(
    app_db, misp_event, monkeypatch
):
    from website.db_class.db import Convert
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

    assert Convert.query.count() == 0  # rolled back — nothing persisted


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
