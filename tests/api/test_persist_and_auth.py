"""HTTP tests: ``X-API-KEY`` auth + ``?persist=true`` envelope.

Covers API-key auth, anonymous still allowed and opt-in persistence with a
distinct envelope response). The stateless path is unchanged.
"""


def _make_user(api_key):
    from website.db_class.db import User
    from website.web import db

    user = User(
        first_name="api", last_name="user",
        email=f"{api_key}@test.test", api_key=api_key,
    )
    db.session.add(user)
    db.session.commit()
    return user


def _count_conversions():
    from website.db_class.db import Conversion

    return Conversion.query.count()


# --- stateless path is unchanged -----------------------------------------

def test_stateless_no_key_no_flag_returns_payload_and_writes_no_row(api_db_client, misp_event):
    resp = api_db_client.post("/api/convert/misp_to_stix", json=misp_event)

    assert resp.status_code == 200
    assert resp.get_json()["type"] == "bundle"   # raw payload, not an envelope
    assert _count_conversions() == 0


def test_valid_key_without_persist_is_stateless_and_writes_no_row(api_db_client, misp_event):
    _make_user("valid-key-xyz")

    resp = api_db_client.post(
        "/api/convert/misp_to_stix",
        json=misp_event, headers={"X-API-KEY": "valid-key-xyz"},
    )

    assert resp.status_code == 200
    body = resp.get_json()
    assert body["type"] == "bundle"      # stateless body, no envelope
    assert "conversion" not in body
    assert _count_conversions() == 0


# --- persist path ---------------------------------------------------------

def test_anonymous_persist_returns_envelope_and_writes_row_with_null_user(api_db_client, misp_event):
    resp = api_db_client.post("/api/convert/misp_to_stix?persist=true", json=misp_event)

    assert resp.status_code == 200
    body = resp.get_json()
    assert set(body) >= {"conversion", "id", "uuid", "url"}
    assert body["conversion"]["type"] == "bundle"
    assert body["url"] == f"/conversions/{body['id']}"

    from website.db_class.db import Conversion

    assert _count_conversions() == 1
    row = Conversion.query.first()
    assert row.id == body["id"]
    assert row.uuid == body["uuid"]
    assert row.user_id is None


def test_authenticated_persist_records_owner(api_db_client, misp_event):
    user = _make_user("valid-key-123")

    resp = api_db_client.post(
        "/api/convert/misp_to_stix?persist=true",
        json=misp_event, headers={"X-API-KEY": "valid-key-123"},
    )

    assert resp.status_code == 200
    from website.db_class.db import Conversion

    row = Conversion.query.first()
    assert row.id == resp.get_json()["id"]
    assert row.user_id == user.id


# --- auth failures: a wrong key 403s, runs before anything else ----------

def test_invalid_key_returns_403_and_writes_no_row_with_persist(api_db_client, misp_event):
    resp = api_db_client.post(
        "/api/convert/misp_to_stix?persist=true",
        json=misp_event, headers={"X-API-KEY": "nope-not-a-key"},
    )

    assert resp.status_code == 403
    assert _count_conversions() == 0


def test_invalid_key_returns_403_without_persist_too(api_db_client, misp_event):
    resp = api_db_client.post(
        "/api/convert/misp_to_stix",
        json=misp_event, headers={"X-API-KEY": "nope-not-a-key"},
    )

    assert resp.status_code == 403
    assert _count_conversions() == 0


# --- exception -> HTTP mapping --------------------------------------------

def test_unknown_converter_url_returns_404(api_db_client, misp_event):
    resp = api_db_client.post("/api/convert/misp_to_taxii", json=misp_event)

    assert resp.status_code == 404


def test_converter_failure_returns_422(api_db_client, misp_event, monkeypatch):
    from cti_transmute import transmute
    from cti_transmute.exceptions import ConverterFailed

    def boom(*a, **k):
        raise ConverterFailed("kaboom")

    monkeypatch.setattr(transmute, "convert", boom)

    resp = api_db_client.post("/api/convert/misp_to_stix", json=misp_event)

    assert resp.status_code == 422


def test_persistence_failure_returns_500(api_db_client, misp_event, monkeypatch):
    from website.lib.exceptions import PersistenceFailed

    def boom(*a, **k):
        raise PersistenceFailed("db down")

    monkeypatch.setattr("website.api.convert.submit_conversion", boom)

    resp = api_db_client.post("/api/convert/misp_to_stix?persist=true", json=misp_event)

    assert resp.status_code == 500
