"""The three remote-MISP read routes, pinned at the web seam.

The transport moved into ``website/lib/misp.py``'s ``_misp_request``
(covered in ``tests/lib/test_misp.py``); the routes keep their own response
normalization and map the typed exceptions to HTTP/JSON. These tests pin that
contract - the success shapes the UI reads and the status codes per failure
class - with the remote MISP instance mocked at the HTTP layer.

Fixture/helper prior art: ``test_trash_routes.py``.
"""

import json

import pytest
import requests
import responses

MISP_URL = "https://misp.example.com"


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


def _make_user(email="user@test.test"):
    from website.db_class.db import User
    from website.web import db

    user = User(first_name="u", last_name="x", email=email, api_key=email)
    db.session.add(user)
    db.session.commit()
    return user


def _login(client, user):
    with client.session_transaction() as sess:
        sess["_user_id"] = str(user.id)
        sess["_fresh"] = True


def _fetch(client, **extra):
    payload = {"misp_url": MISP_URL, "api_key": "k", "event_id": "5"}
    payload.update(extra)
    return client.post("/conversions/fetch_misp_event", json=payload)


def _search(client, **extra):
    payload = {"misp_url": MISP_URL, "api_key": "k"}
    payload.update(extra)
    return client.post("/conversions/misp_search_events", json=payload)


def _test_connection(client, **extra):
    payload = {"misp_url": MISP_URL, "api_key": "k"}
    payload.update(extra)
    return client.post("/conversions/misp_test_connection", json=payload)


# --- fetch_misp_event -------------------------------------------------------

@responses.activate
def test_fetch_returns_the_normalized_event_list_shape(web_client):
    responses.add(
        responses.POST, f"{MISP_URL}/events/restSearch",
        json={"response": [{"Event": {"id": "5", "info": "demo"}}]}, status=200)

    resp = _fetch(web_client)

    assert resp.status_code == 200
    body = resp.get_json()
    assert body["count"] == 1
    assert body["event_ids"] == ["5"]
    assert json.loads(body["content"]) == {
        "response": [{"Event": {"id": "5", "info": "demo"}}]}


@responses.activate
def test_fetch_normalizes_a_bare_event_response(web_client):
    responses.add(
        responses.POST, f"{MISP_URL}/events/restSearch",
        json={"Event": {"id": "5"}}, status=200)

    resp = _fetch(web_client)

    assert resp.status_code == 200
    assert json.loads(resp.get_json()["content"]) == {
        "response": [{"Event": {"id": "5"}}]}


@responses.activate
def test_fetch_forwards_multiple_ids_and_optional_restsearch_params(web_client):
    responses.add(
        responses.POST, f"{MISP_URL}/events/restSearch",
        json={"response": []}, status=200)

    resp = _fetch(web_client, event_id=None, event_ids=["1", "2"],
                  tags=["tlp:red"], limit=10, org="")

    assert resp.status_code == 200
    sent = json.loads(responses.calls[0].request.body)
    assert sent["eventid"] == ["1", "2"]
    assert sent["tags"] == ["tlp:red"]
    assert sent["limit"] == 10
    assert "org" not in sent  # empty optional params are dropped


@responses.activate
def test_fetch_rejects_a_bad_event_id_and_a_non_https_url_without_calling_misp(web_client):
    bad_id = _fetch(web_client, event_id="5; DROP TABLE")
    bad_url = _fetch(web_client, misp_url="http://misp.example.com")

    assert bad_id.status_code == 400
    assert bad_url.status_code == 400
    assert len(responses.calls) == 0


@responses.activate
def test_fetch_maps_a_rejected_key_to_403(web_client):
    responses.add(
        responses.POST, f"{MISP_URL}/events/restSearch", json={}, status=401)

    resp = _fetch(web_client)

    assert resp.status_code == 403
    assert "API key" in resp.get_json()["error"]


@responses.activate
def test_fetch_maps_an_unreachable_instance_to_400(web_client):
    responses.add(
        responses.POST, f"{MISP_URL}/events/restSearch",
        body=requests.exceptions.ConnectionError())

    resp = _fetch(web_client)

    assert resp.status_code == 400
    assert "error" in resp.get_json()


@responses.activate
def test_fetch_maps_a_timeout_to_408(web_client):
    responses.add(
        responses.POST, f"{MISP_URL}/events/restSearch",
        body=requests.exceptions.ReadTimeout())

    resp = _fetch(web_client)

    assert resp.status_code == 408


@pytest.mark.parametrize("misp_status,expected", [(404, 404), (429, 429)])
@responses.activate
def test_fetch_keeps_its_distinct_404_and_429_mappings(web_client, misp_status, expected):
    responses.add(
        responses.POST, f"{MISP_URL}/events/restSearch", json={}, status=misp_status)

    resp = _fetch(web_client)

    assert resp.status_code == expected
    assert "error" in resp.get_json()


# --- misp_search_events -----------------------------------------------------

@responses.activate
def test_search_maps_events_to_the_table_shape(web_client):
    responses.add(
        responses.POST, f"{MISP_URL}/events/index",
        json=[{
            "id": "9", "info": "campaign", "date": "2026-07-01",
            "attribute_count": 3, "Orgc": {"name": "CIRCL"},
            "threat_level_id": "1", "published": True, "distribution": "1",
            "EventTag": [
                {"Tag": {"name": "tlp:green", "colour": "#33FF00"}},
                {"Tag": {"name": "secret", "hide_tag": True}},
            ],
        }],
        status=200)

    resp = _search(web_client, search="campaign")

    assert resp.status_code == 200
    body = resp.get_json()
    assert body["count"] == 1
    event = body["events"][0]
    assert event["org"] == "CIRCL"
    assert event["threat_level"] == "High"
    assert event["tags"] == [{"name": "tlp:green", "colour": "#33FF00"}]
    sent = json.loads(responses.calls[0].request.body)
    assert sent["searchinfo"] == "campaign"


@responses.activate
def test_search_maps_a_rejected_key_to_403(web_client):
    responses.add(
        responses.POST, f"{MISP_URL}/events/index", json={}, status=403)

    resp = _search(web_client)

    assert resp.status_code == 403


@responses.activate
def test_search_maps_an_upstream_error_to_400(web_client):
    responses.add(
        responses.POST, f"{MISP_URL}/events/index", json={}, status=500)

    resp = _search(web_client)

    assert resp.status_code == 400
    assert "error" in resp.get_json()


def test_search_requires_an_api_key(web_client):
    resp = _search(web_client, api_key="")

    assert resp.status_code == 400


# --- misp_test_connection ---------------------------------------------------

def test_test_connection_requires_login(web_client):
    resp = _test_connection(web_client)

    assert resp.status_code == 302


@responses.activate
def test_test_connection_returns_the_visible_tags(web_client, app_db):
    responses.add(
        responses.GET, f"{MISP_URL}/tags/index",
        json={"Tag": [
            {"name": "tlp:red", "colour": "#ff0000"},
            {"name": "secret", "hide_tag": True},
        ]},
        status=200)
    _login(web_client, _make_user())

    resp = _test_connection(web_client)

    assert resp.status_code == 200
    body = resp.get_json()
    assert body["success"] is True
    assert body["count"] == 1
    assert body["tags"] == [{"name": "tlp:red", "colour": "#ff0000"}]


@responses.activate
def test_test_connection_maps_a_rejected_key_to_403(web_client, app_db):
    responses.add(
        responses.GET, f"{MISP_URL}/tags/index", json={}, status=403)
    _login(web_client, _make_user())

    resp = _test_connection(web_client)

    assert resp.status_code == 403
    assert resp.get_json()["success"] is False


@responses.activate
def test_test_connection_maps_an_unreachable_instance_to_400(web_client, app_db):
    responses.add(
        responses.GET, f"{MISP_URL}/tags/index",
        body=requests.exceptions.ConnectionError())
    _login(web_client, _make_user())

    resp = _test_connection(web_client)

    assert resp.status_code == 400
    assert resp.get_json()["success"] is False
