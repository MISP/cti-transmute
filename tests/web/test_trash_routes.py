"""The /bulk_action trash route, pinned at the web seam.

The route became a thin adapter over the ``bulk_action`` use-case (per-item
best-effort loop, atomic mutate+activity per item - covered in
``tests/lib/test_bulk_action.py``). These tests pin the route's unchanged HTTP
contract: the admin gate, the 400 on an empty batch or unknown action, and the
aggregated-count JSON response.

Fixture/helper prior art: ``test_comment_gates.py``.
"""

import json
import uuid as _uuid
from datetime import datetime, timezone

import pytest


@pytest.fixture
def web_client(app_db):
    from website.web import application
    from website.web.conversions.conversions import conversions_blueprint

    application.config["TESTING"] = True
    application.config["WTF_CSRF_ENABLED"] = False
    if conversions_blueprint.name not in application.blueprints:
        application.register_blueprint(conversions_blueprint, url_prefix="/conversions")
    return application.test_client()


def _make_user(email, admin=False):
    from website.db_class.db import User
    from website.web import db

    user = User(first_name="u", last_name="x", email=email, admin=admin, api_key=email)
    db.session.add(user)
    db.session.commit()
    return user


def _login(client, user):
    with client.session_transaction() as sess:
        sess["_user_id"] = str(user.id)
        sess["_fresh"] = True


def _make_trashed_conversion(user_id, name="c"):
    from website.db_class.db import Conversion
    from website.web import db

    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=user_id, name=name, source_format="misp", target_format="stix",
        input_text=json.dumps({}), output_text="x", params=None,
        created_at=now, updated_at=now, public=True, uuid=str(_uuid.uuid4()),
        is_active=False, deleted_at=now,
    )
    db.session.add(conv)
    db.session.commit()
    return conv


def test_bulk_action_is_admin_only(web_client, app_db):
    user = _make_user("user@test.test")
    conv = _make_trashed_conversion(user.id)
    _login(web_client, user)

    resp = web_client.post("/conversions/bulk_action",
                           json={"action": "restore", "ids": [conv.id]})

    assert resp.status_code == 403


def test_bulk_action_rejects_an_empty_batch_and_an_unknown_action(web_client, app_db):
    admin = _make_user("admin@test.test", admin=True)
    conv = _make_trashed_conversion(admin.id)
    _login(web_client, admin)

    empty = web_client.post("/conversions/bulk_action",
                            json={"action": "restore", "ids": []})
    unknown = web_client.post("/conversions/bulk_action",
                              json={"action": "soft_delete", "ids": [conv.id]})

    assert empty.status_code == 400
    assert unknown.status_code == 400
    assert unknown.get_json()["message"] == "Invalid request"


def test_bulk_restore_reports_the_aggregated_count(web_client, app_db):
    from website.db_class.db import Conversion

    admin = _make_user("admin@test.test", admin=True)
    conv_a = _make_trashed_conversion(admin.id, name="a")
    conv_b = _make_trashed_conversion(admin.id, name="b")
    _login(web_client, admin)

    resp = web_client.post(
        "/conversions/bulk_action",
        json={"action": "restore", "ids": [conv_a.id, conv_b.id, conv_b.id + 999]})

    assert resp.status_code == 200
    body = resp.get_json()
    assert body["done"] == 2
    assert body["message"] == "2 conversions restored"
    assert body["toast_class"] == "success"
    assert Conversion.query.get(conv_a.id).is_active is True
    assert Conversion.query.get(conv_b.id).is_active is True


def test_bulk_hard_delete_of_a_single_item(web_client, app_db):
    from website.db_class.db import Conversion

    admin = _make_user("admin@test.test", admin=True)
    conv = _make_trashed_conversion(admin.id)
    _login(web_client, admin)

    resp = web_client.post("/conversions/bulk_action",
                           json={"action": "hard_delete", "ids": [conv.id]})

    assert resp.status_code == 200
    body = resp.get_json()
    assert body["done"] == 1
    assert body["message"] == "1 conversion permanently deleted"
    assert Conversion.query.get(conv.id) is None


def test_a_batch_where_nothing_was_acted_on_warns(web_client, app_db):
    admin = _make_user("admin@test.test", admin=True)
    _login(web_client, admin)

    resp = web_client.post("/conversions/bulk_action",
                           json={"action": "restore", "ids": [12345]})

    assert resp.status_code == 200
    body = resp.get_json()
    assert body["done"] == 0
    assert body["toast_class"] == "warning"
