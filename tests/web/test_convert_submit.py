"""Web-layer tests: the conversion page's fetch/JSON submission.

The conversion page no longer POSTs a classic form; it submits the payload,
envelope, and schema-driven params as JSON. Params are validated by Pydantic and
a shape violation comes back as the same ``{error, fields}`` 400 the API returns,
so the client can highlight the offending control. The fixed envelope
(name/description/public/tags) and payload intake are preserved.
"""

import json
import uuid as _uuid

import pytest


@pytest.fixture
def web_client(app_db):
    """DB-backed client with the conversions + account blueprints, CSRF off."""
    from website.web import application
    from website.web.account.account import account_blueprint
    from website.web.conversions.conversions import (
        conversions_blueprint, legacy_convert_blueprint)

    application.config["TESTING"] = True
    application.config["WTF_CSRF_ENABLED"] = False
    for bp, prefix in (
        (conversions_blueprint, "/conversions"),
        (legacy_convert_blueprint, "/convert"),
        (account_blueprint, "/account"),
    ):
        if bp.name not in application.blueprints:
            application.register_blueprint(bp, url_prefix=prefix)
    return application.test_client()


def _make_user(email="u@test.test"):
    from website.db_class.db import User
    from website.web import db

    user = User(first_name="u", last_name="x", email=email, admin=False,
                api_key=email)
    db.session.add(user)
    db.session.commit()
    return user


def _login(client, user):
    with client.session_transaction() as sess:
        sess["_user_id"] = str(user.id)
        sess["_fresh"] = True


# --- GET: the page renders (params come from the client component) ---------

def test_get_stix_to_misp_page_renders(web_client):
    assert web_client.get("/conversions/stix_to_misp").status_code == 200


def test_get_misp_to_stix_page_renders(web_client):
    assert web_client.get("/conversions/misp_to_stix").status_code == 200


# --- POST: anonymous submit persists and returns a navigation envelope -----

def test_stix_to_misp_json_submit_persists_and_returns_url(web_client, stix_bundle):
    from website.db_class.db import Conversion

    resp = web_client.post("/conversions/stix_to_misp", json={
        "payload": json.dumps(stix_bundle),
        "params": {"distribution": 2},
    })

    assert resp.status_code == 200
    body = resp.get_json()
    assert body["url"].startswith("/conversions/")
    assert "id" in body and "uuid" in body

    row = Conversion.query.get(body["id"])
    assert row is not None
    assert (row.source_format, row.target_format) == ("stix", "misp")
    assert row.user_id is None                     # anonymous
    assert row.params.get("distribution") == 2


def test_misp_to_stix_json_submit_persists(web_client, misp_event):
    from website.db_class.db import Conversion

    resp = web_client.post("/conversions/misp_to_stix", json={
        "payload": json.dumps(misp_event),
        "params": {"version": "2.0"},
    })

    assert resp.status_code == 200
    row = Conversion.query.get(resp.get_json()["id"])
    assert (row.source_format, row.target_format) == ("misp", "stix")
    assert row.params.get("version") == "2.0"


# --- POST: param shape errors surface as {error, fields} -------------------

def test_stix_to_misp_bad_param_returns_error_fields(web_client, stix_bundle):
    from website.db_class.db import Conversion

    resp = web_client.post("/conversions/stix_to_misp", json={
        "payload": json.dumps(stix_bundle),
        "params": {"distribution": 99},
    })

    assert resp.status_code == 400
    body = resp.get_json()
    assert isinstance(body["error"], str) and body["error"]
    assert "distribution" in body["fields"]
    assert Conversion.query.count() == 0           # nothing persisted


def test_stix_to_misp_unknown_param_is_rejected(web_client, stix_bundle):
    resp = web_client.post("/conversions/stix_to_misp", json={
        "payload": json.dumps(stix_bundle),
        "params": {"sharing_group": 5},
    })

    assert resp.status_code == 400
    assert "sharing_group" in resp.get_json()["fields"]


def test_missing_payload_returns_an_error(web_client):
    resp = web_client.post("/conversions/stix_to_misp", json={"params": {}})

    assert resp.status_code == 400
    assert resp.get_json()["error"]


def test_non_json_payload_returns_an_error(web_client):
    resp = web_client.post("/conversions/stix_to_misp", json={
        "payload": "this is not json", "params": {},
    })

    assert resp.status_code == 400
    assert resp.get_json()["error"]


def test_valid_json_but_non_dict_payload_is_a_clean_error_not_500(web_client):
    """A valid-JSON but non-MISP payload (an array/scalar) must yield a clean
    client/unprocessable error, not a 500 — auto-naming must not crash on it."""
    for payload in ("[1, 2, 3]", "42", "null", '"just a string"'):
        resp = web_client.post("/conversions/misp_to_stix", json={
            "payload": payload, "params": {"version": "2.1"},
        })
        assert resp.status_code in (400, 422), f"{payload!r} -> {resp.status_code}"
        body = resp.get_json()
        assert body.get("error") or body.get("message")


# --- POST: authenticated submit owns the row and saves tags ----------------

def test_authenticated_submit_owns_the_row_and_saves_tags(web_client, stix_bundle):
    from website.db_class.db import Conversion, ConversionTagAssociation, Tag
    from website.web import db

    user = _make_user()
    tag = Tag(uuid=str(_uuid.uuid4()), name="my-tag", visibility="public",
              created_by=user.id, is_active=True)
    db.session.add(tag)
    db.session.commit()
    _login(web_client, user)

    resp = web_client.post("/conversions/stix_to_misp", json={
        "payload": json.dumps(stix_bundle),
        "params": {"distribution": 0},
        "name": "auth-run", "description": "mine", "public": True,
        "tag_ids": [tag.id],
    })

    assert resp.status_code == 200
    row = Conversion.query.get(resp.get_json()["id"])
    assert row.user_id == user.id
    assert row.name == "auth-run"
    assert ConversionTagAssociation.query.filter_by(
        conversion_id=row.id, source_type="user").count() == 1
