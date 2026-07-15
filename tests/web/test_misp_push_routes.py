"""The MISP push, push-preview, and push-payload-download routes, pinned at
the web seam.

Written against the pre-refactor inline implementation and kept green through
it: the push logic moved into the ``push_to_misp`` use-case
(``tests/lib/test_push_to_misp.py``), the payload builder into
``website/lib/misp.py`` (``tests/lib/test_misp_payload.py``), and the
attributes-meta table became preview-modal presentation - these tests pin the
HTTP contract the Vue push modal reads (``pushConversionToMISP.js``): the
success shapes, the status per failure class, and identical payloads across
push, preview, and download.

Fixture/helper prior art: ``test_misp_read_routes.py``.
"""

import ipaddress
import json
import uuid as _uuid
from datetime import datetime, timezone

import pytest
import requests
import responses

MISP_URL = "https://misp.example.org"


@pytest.fixture(autouse=True)
def _public_dns(monkeypatch):
    """Pin DNS so the URL guard sees ``misp.example.org`` as a public host
    (the guard judges hosts by their resolved addresses, and example.org
    subdomains do not actually resolve)."""
    from website.web.conversions import conversions

    monkeypatch.setattr(
        conversions, "_resolved_ips",
        lambda hostname: [ipaddress.ip_address("8.8.8.8")])


@pytest.fixture
def web_client(app_db):
    """DB-backed test client with the conversions + account blueprints
    (account so ``@login_required`` can build the ``account.login`` redirect).
    """
    from website.web import application
    from website.web.account.account import account_blueprint
    from website.web.conversions.conversions import conversions_blueprint

    application.config["TESTING"] = True
    application.config["WTF_CSRF_ENABLED"] = False
    for bp, prefix in (
        (conversions_blueprint, "/conversions"),
        (account_blueprint, "/account")
    ):
        if bp.name not in application.blueprints:
            application.register_blueprint(bp, url_prefix=prefix)
    return application.test_client()


def _make_user(*, admin=False, email="user@test.test"):
    from website.db_class.db import User
    from website.web import db

    user = User(first_name="u", last_name="x", email=email,
                admin=admin, api_key=email)
    db.session.add(user)
    db.session.commit()
    return user


def _make_conversion(owner_id, misp_text, *, public=True, name="DEMO"):
    from website.db_class.db import Conversion
    from website.web import db

    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=owner_id, name=name, source_format="misp", target_format="stix",
        input_text=misp_text, output_text="{}", params=None,
        created_at=now, updated_at=now, public=public, uuid=str(_uuid.uuid4())
    )
    db.session.add(conv)
    db.session.commit()
    return conv


def _add_evaluation(conversion, user, reaction_key):
    from website.db_class.db import ConversionEvaluation, Tag
    from website.web import db

    # The vote-count summary only counts votes whose tag is a seeded, active
    # cti-evaluation Tag row (as the taxonomy import provides in production).
    if not Tag.query.filter_by(name=reaction_key).first():
        db.session.add(Tag(uuid=str(_uuid.uuid4()), name=reaction_key,
                           is_active=True, is_evaluation_tag=True,
                           created_by=user.id))
    db.session.add(ConversionEvaluation(
        conversion_id=conversion.id, user_id=user.id, eval_type="reaction",
        reaction_key=reaction_key, created_at=datetime.now(timezone.utc)))
    db.session.commit()


def _login(client, user):
    with client.session_transaction() as sess:
        sess["_user_id"] = str(user.id)
        sess["_fresh"] = True


def _push(client, conversion_id, **extra):
    payload = {"conversion_id": conversion_id,
               "misp_url": MISP_URL, "api_key": "the-key"}
    payload.update(extra)
    return client.post("/conversions/push_to_misp", json=payload)


def _mock_push_ok(new_event_id="123"):
    responses.add(responses.POST, f"{MISP_URL}/events",
                  json={"Event": {"id": new_event_id}}, status=200)


# --- push_to_misp ------------------------------------------------------------

def test_push_requires_login(web_client):
    assert _push(web_client, 1).status_code == 302


@responses.activate
def test_push_succeeds_and_reports_the_new_event_id(web_client, misp_event):
    from website.db_class.db import SystemLog

    _mock_push_ok("123")
    owner = _make_user()
    conversion = _make_conversion(owner.id, json.dumps(misp_event))
    _login(web_client, owner)

    resp = _push(web_client, conversion.id, tags=["extra:tag"])

    assert resp.status_code == 200
    body = resp.get_json()
    assert body["success"] is True
    assert "pushed to MISP successfully" in body["message"]
    assert "(event #123)" in body["message"]
    assert body["event_id"] == "123"
    # The POSTed payload is the built event, extra tag included
    sent = json.loads(responses.calls[0].request.body)["Event"]
    assert sent["info"] == "TDD fixture event"
    assert "extra:tag" in {t["name"] for t in sent["Tag"]}
    assert SystemLog.query.filter_by(event_type="misp_push").count() == 1


@responses.activate
def test_push_rejects_missing_fields_without_calling_misp(web_client, misp_event):
    owner = _make_user()
    conversion = _make_conversion(owner.id, json.dumps(misp_event))
    _login(web_client, owner)

    no_url = _push(web_client, conversion.id, misp_url="")
    no_key = _push(web_client, conversion.id, api_key="")
    no_id = _push(web_client, None)

    for resp in (no_url, no_key, no_id):
        assert resp.status_code == 400
        assert resp.get_json()["success"] is False
    assert len(responses.calls) == 0


@responses.activate
def test_push_rejects_a_non_https_url_without_calling_misp(web_client, misp_event):
    owner = _make_user()
    conversion = _make_conversion(owner.id, json.dumps(misp_event))
    _login(web_client, owner)

    resp = _push(web_client, conversion.id, misp_url="http://misp.example.org")

    assert resp.status_code == 400
    assert len(responses.calls) == 0


def test_push_returns_404_for_an_unknown_conversion(web_client):
    _login(web_client, _make_user())

    assert _push(web_client, 424242).status_code == 404


def test_push_returns_403_on_someone_elses_private_conversion(web_client, misp_event):
    owner = _make_user()
    stranger = _make_user(email="stranger@test.test")
    conversion = _make_conversion(owner.id, json.dumps(misp_event), public=False)
    _login(web_client, stranger)

    resp = _push(web_client, conversion.id)

    assert resp.status_code == 403
    assert resp.get_json()["error"] == "Forbidden"


@responses.activate
def test_push_maps_undecodable_conversion_data_to_400(web_client):
    owner = _make_user()
    conversion = _make_conversion(owner.id, "not json")
    _login(web_client, owner)

    resp = _push(web_client, conversion.id)

    assert resp.status_code == 400
    assert "Invalid JSON" in resp.get_json()["error"]


@responses.activate
def test_push_maps_a_rejected_key_to_403(web_client, misp_event):
    responses.add(responses.POST, f"{MISP_URL}/events", json={}, status=401)
    owner = _make_user()
    conversion = _make_conversion(owner.id, json.dumps(misp_event))
    _login(web_client, owner)

    resp = _push(web_client, conversion.id)

    assert resp.status_code == 403
    assert "API key" in resp.get_json()["error"]


@responses.activate
def test_push_maps_an_unreachable_instance_to_400(web_client, misp_event):
    responses.add(responses.POST, f"{MISP_URL}/events",
                  body=requests.exceptions.ConnectionError())
    owner = _make_user()
    conversion = _make_conversion(owner.id, json.dumps(misp_event))
    _login(web_client, owner)

    resp = _push(web_client, conversion.id)

    assert resp.status_code == 400
    assert resp.get_json()["success"] is False


@responses.activate
def test_push_maps_a_timeout_to_408(web_client, misp_event):
    responses.add(responses.POST, f"{MISP_URL}/events",
                  body=requests.exceptions.ReadTimeout())
    owner = _make_user()
    conversion = _make_conversion(owner.id, json.dumps(misp_event))
    _login(web_client, owner)

    assert _push(web_client, conversion.id).status_code == 408


@responses.activate
def test_push_surfaces_misp_errors_from_a_2xx_body_as_400(web_client, misp_event):
    from website.db_class.db import SystemLog

    responses.add(responses.POST, f"{MISP_URL}/events",
                  json={"errors": "Event blocked by blocklist"}, status=200)
    owner = _make_user()
    conversion = _make_conversion(owner.id, json.dumps(misp_event))
    _login(web_client, owner)

    resp = _push(web_client, conversion.id)

    assert resp.status_code == 400
    assert "blocklist" in resp.get_json()["error"]
    assert SystemLog.query.filter_by(event_type="misp_push").count() == 0


# --- misp_push_preview -------------------------------------------------------

def test_preview_requires_login(web_client):
    assert web_client.get("/conversions/misp_push_preview/1").status_code == 302


def test_preview_returns_404_unknown_and_403_forbidden(web_client, misp_event):
    owner = _make_user()
    stranger = _make_user(email="stranger@test.test")
    private = _make_conversion(owner.id, json.dumps(misp_event), public=False)
    _login(web_client, stranger)

    assert web_client.get("/conversions/misp_push_preview/424242").status_code == 404
    assert web_client.get(
        f"/conversions/misp_push_preview/{private.id}").status_code == 403


def test_preview_returns_the_full_modal_shape(web_client, misp_event):
    owner = _make_user()
    voter = _make_user(email="voter@test.test")
    conversion = _make_conversion(owner.id, json.dumps(misp_event))
    for user in (owner, voter):
        _add_evaluation(conversion, user, 'cti-evaluation:accuracy="high"')
    _login(web_client, owner)

    resp = web_client.get(f"/conversions/misp_push_preview/{conversion.id}")

    assert resp.status_code == 200
    body = resp.get_json()
    assert body["success"] is True
    assert body["has_evaluations"] is True
    assert body["overall_level"] == "high"
    assert body["vote_count"] == 2
    assert 'cti-evaluation:accuracy="high"' in body["eval_tags"]
    assert body["event_dict"]["info"] == "TDD fixture event"
    assert body["cti_object"]["name"] == "cti-evaluation"
    assert body["event_stats"]["attribute_count"] == 1
    assert body["event_stats"]["object_count"] == len(body["event_dict"]["Object"])

    # The human-readable table mirrors the cti-evaluation attributes and adds
    # the plain-English description column the modal renders
    attributes = {row["object_relation"]: row for row in body["attributes"]}
    assert len(body["attributes"]) == len(body["cti_object"]["Attribute"])
    assert attributes["evaluated-artifact"]["value"] == "DEMO"
    assert attributes["evaluated-artifact"]["description"]
    assert attributes["accuracy"]["description"] == \
        "Community consensus level for 'accuracy' (2 vote(s))"
    assert attributes["accuracy-score"]["type"] == "float"


def test_preview_without_evaluations_says_so(web_client, misp_event):
    owner = _make_user()
    conversion = _make_conversion(owner.id, json.dumps(misp_event))
    _login(web_client, owner)

    resp = web_client.get(f"/conversions/misp_push_preview/{conversion.id}")

    assert resp.status_code == 200
    body = resp.get_json()
    assert body["has_evaluations"] is False
    assert body["overall_level"] is None


def test_preview_maps_undecodable_conversion_data_to_400(web_client):
    owner = _make_user()
    conversion = _make_conversion(owner.id, "not json")
    _login(web_client, owner)

    resp = web_client.get(f"/conversions/misp_push_preview/{conversion.id}")

    assert resp.status_code == 400
    assert "Invalid JSON" in resp.get_json()["error"]


# --- download …/misp-push ----------------------------------------------------

def test_download_serves_the_push_payload_to_anonymous_on_public(web_client, misp_event):
    owner = _make_user()
    conversion = _make_conversion(owner.id, json.dumps(misp_event))

    resp = web_client.get(f"/conversions/download/{conversion.id}/misp-push")

    assert resp.status_code == 200
    assert "attachment" in resp.headers["Content-Disposition"]
    body = json.loads(resp.get_data(as_text=True))
    assert body["Event"]["info"] == "TDD fixture event"
    assert any(o["name"] == "cti-evaluation"
               for o in body["Event"]["Object"])


def test_download_hides_a_private_conversion_from_strangers(web_client, misp_event):
    owner = _make_user()
    private = _make_conversion(owner.id, json.dumps(misp_event), public=False)

    resp = web_client.get(f"/conversions/download/{private.id}/misp-push")

    assert resp.status_code == 403


def test_download_maps_undecodable_conversion_data_to_400(web_client):
    owner = _make_user()
    conversion = _make_conversion(owner.id, "not json")

    resp = web_client.get(f"/conversions/download/{conversion.id}/misp-push")

    assert resp.status_code == 400
