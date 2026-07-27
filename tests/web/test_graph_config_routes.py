"""The graph-config save/list routes, pinned at the schema boundary.

A saved graph config is user input replayed into other users' browsers
(admins see every config), and Pivotick HTML-parses a style's ``svgIcon``,
so ``/graph_config/save`` rejects anything outside the known schema and
``/graph_config/list`` re-filters stored rows on the way out - a payload
saved before the schema landed (or written around the route) never reaches
a browser.

Fixture/helper prior art: ``test_misp_read_routes.py``.
"""

import json
import uuid
from datetime import datetime, timezone

import pytest


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


@pytest.fixture
def auth_client(web_client):
    with web_client.session_transaction() as sess:
        user = _make_user()
        sess["_user_id"] = str(user.id)
        sess["_fresh"] = True
    return web_client


def _save(client, config, name="cfg"):
    return client.post(
        "/conversions/graph_config/save",
        json={"name": name, "config_json": json.dumps(config)})


def _stored_configs():
    from website.db_class.db import GraphConfig
    return GraphConfig.query.all()


LEGIT_CONFIG = {
    "maxNodes": 3000,
    "defaultSide": "input",
    "groupingThreshold": 3,
    "layout": {"type": "force"},
    "pivotickUI": {"mode": "full", "sidebar": {"collapsed": "auto"}},
    "stixStyles": {
        "threat-actor": {"shape": "square", "color": "#f97316", "size": 22},
        "_default": {"shape": "circle", "color": "rgb(100, 116, 139)", "size": 13}
    },
    "mispStyles": {"Event": {"shape": "square", "color": "#2563eb", "size": 26}},
    "mispNetworkTypes": ["ip-src", "ip-dst", "filename|md5"],
    "mispPayloadTypes": ["md5", "sha256"]
}


def test_save_rejects_svg_icon_and_stores_nothing(auth_client):
    hostile = {
        "mispStyles": {
            "Event": {
                "shape": "square", "color": "#111827", "size": 26,
                "svgIcon": "<image href=x onerror=alert(document.domain)>"
            }
        }
    }
    resp = _save(auth_client, hostile)
    assert resp.status_code == 400
    assert "svgIcon" in resp.get_json()["message"]
    assert _stored_configs() == []


def test_save_rejects_icon_class_and_unknown_top_level_keys(auth_client):
    resp = _save(auth_client, {
        "stixStyles": {"indicator": {"iconClass": "fas fa-bomb"}},
        "onload": "alert(1)"
    })
    assert resp.status_code == 400
    message = resp.get_json()["message"]
    assert "iconClass" in message and "onload" in message
    assert _stored_configs() == []


def test_save_rejects_hostile_values_in_accepted_keys(auth_client):
    resp = _save(auth_client, {
        "maxNodes": 999999999,
        "layout": {"type": "evil"},
        "stixStyles": {"indicator": {"color": "url(https://evil.example/beacon)"}}
    })
    assert resp.status_code == 400
    assert _stored_configs() == []


def test_save_rejects_a_non_object_config(auth_client):
    resp = auth_client.post(
        "/conversions/graph_config/save",
        json={"name": "cfg", "config_json": json.dumps(["not", "an", "object"])})
    assert resp.status_code == 400


def test_legit_config_round_trips_through_save_and_list(auth_client):
    resp = _save(auth_client, LEGIT_CONFIG, name="Dark theme")
    assert resp.status_code == 201

    listed = auth_client.get("/conversions/graph_config/list").get_json()["list"]
    assert [c["name"] for c in listed] == ["Dark theme"]
    assert json.loads(listed[0]["config_json"]) == LEGIT_CONFIG


def test_list_strips_hostile_fields_from_already_stored_rows(auth_client):
    """A row written before the schema landed keeps its valid fields but its
    HTML-parsed ones never leave the server."""
    from website.db_class.db import GraphConfig
    from website.web import db

    now = datetime.now(timezone.utc)
    db.session.add(GraphConfig(
        uuid=str(uuid.uuid4()), name="poisoned",
        config_json=json.dumps({
            "maxNodes": 500,
            "mispStyles": {"Event": {
                "shape": "square", "color": "#111827", "size": 26,
                "svgIcon": "<image href=x onerror=alert(document.domain)>",
                "iconClass": "fas fa-bomb"
            }},
            "onload": "alert(1)"
        }),
        created_by=1, is_active=True, is_default=False,
        created_at=now, updated_at=now))
    db.session.commit()

    listed = auth_client.get("/conversions/graph_config/list").get_json()["list"]
    assert len(listed) == 1
    cfg = json.loads(listed[0]["config_json"])
    assert cfg == {
        "maxNodes": 500,
        "mispStyles": {"Event": {"shape": "square", "color": "#111827", "size": 26}}
    }


def test_list_returns_empty_object_for_unparseable_stored_json(auth_client):
    from website.db_class.db import GraphConfig
    from website.web import db

    now = datetime.now(timezone.utc)
    db.session.add(GraphConfig(
        uuid=str(uuid.uuid4()), name="broken", config_json="not json{",
        created_by=1, is_active=True, is_default=False,
        created_at=now, updated_at=now))
    db.session.commit()

    listed = auth_client.get("/conversions/graph_config/list").get_json()["list"]
    assert json.loads(listed[0]["config_json"]) == {}
