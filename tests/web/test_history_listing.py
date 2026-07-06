"""Web-layer test: the history-listing route's access scoping.

Moved ``get_convert_page`` into ``conv_repo.list_for_user`` and lifted the
actor out of ``flask_login.current_user`` into an explicit ``user`` param.
The view is now responsible for resolving that actor
(``current_user._get_current_object()`` when authenticated, else ``None``).

These pin that route→repo wiring end-to-end: an anonymous request sees public
rows only, an authenticated one sees public rows plus its own private rows. The
scope logic itself is unit-tested in ``tests/repos/test_conversions_repo.py``.
"""

import uuid as _uuid
from datetime import datetime, timezone

import pytest


@pytest.fixture
def web_client(app_db):
    """DB-backed Flask test client with the conversions + account blueprints."""
    from website.web import application
    from website.web.account.account import account_blueprint
    from website.web.convert.convert import convert_blueprint

    application.config["TESTING"] = True
    application.config["WTF_CSRF_ENABLED"] = False
    for bp, prefix in (
        (convert_blueprint, "/conversions"),
        (account_blueprint, "/account"),
    ):
        if bp.name not in application.blueprints:
            application.register_blueprint(bp, url_prefix=prefix)
    return application.test_client()


def _make_user(*, admin=False, email="someone@test.test"):
    from website.db_class.db import User
    from website.web import db

    user = User(first_name=email.split("@")[0], last_name="x",
                email=email, admin=admin, api_key=email)
    db.session.add(user)
    db.session.commit()
    return user


def _login(client, user):
    with client.session_transaction() as sess:
        sess["_user_id"] = str(user.id)
        sess["_fresh"] = True


def _make_conversion(*, owner_id, public, name):
    from website.db_class.db import Conversion
    from website.web import db

    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=owner_id, name=name, source_format="misp", target_format="stix",
        input_text="IN", output_text="OUT", params=None,
        created_at=now, updated_at=now, public=public, uuid=str(_uuid.uuid4()),
    )
    db.session.add(conv)
    db.session.commit()
    return conv


def test_history_listing_anonymous_sees_public_only(web_client):
    alice = _make_user(email="alice@test.test")
    _make_conversion(owner_id=alice.id, public=True,  name="a-pub")
    _make_conversion(owner_id=alice.id, public=False, name="a-priv")

    resp = web_client.get("/conversions/get_convert_page_history")

    assert resp.status_code == 200
    names = {row["name"] for row in resp.get_json()["list"]}
    assert names == {"a-pub"}   # the private row is invisible to an anon actor


def test_history_listing_authenticated_sees_public_plus_own(web_client):
    alice = _make_user(email="alice@test.test")
    bob   = _make_user(email="bob@test.test")
    _make_conversion(owner_id=alice.id, public=True,  name="a-pub")
    _make_conversion(owner_id=alice.id, public=False, name="a-priv")
    _make_conversion(owner_id=bob.id,   public=True,  name="b-pub")
    _make_conversion(owner_id=bob.id,   public=False, name="b-priv")

    _login(web_client, alice)
    resp = web_client.get("/conversions/get_convert_page_history")

    assert resp.status_code == 200
    names = {row["name"] for row in resp.get_json()["list"]}
    assert names == {"a-pub", "a-priv", "b-pub"}   # not bob's private row
