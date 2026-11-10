"""The account page's 'Regenerate' API key route.

``POST /account/api_key/regenerate`` replaces the signed-in user's key with a
new random one and returns it once. It must: refuse GET (a mutation is never
reachable from a link), require a session, touch only the caller's own key
(there is no user id to pass), and make the old key stop identifying anyone.
CSRF is disabled here so the POST exercises the handler; the token half is a
Flask-WTF guarantee, as in test_account_delete_method.py.
"""

import pytest


@pytest.fixture
def web_client(app_db):
    from website.web import application
    from website.web.account.account import account_blueprint

    application.config["TESTING"] = True
    application.config["WTF_CSRF_ENABLED"] = False
    if account_blueprint.name not in application.blueprints:
        application.register_blueprint(account_blueprint, url_prefix="/account")
    return application.test_client()


def _make_user(email, admin=False):
    from website.db_class.db import User
    from website.web import db

    user = User(first_name="u", last_name="x", email=email, admin=admin, api_key=f"old-{email}")
    db.session.add(user)
    db.session.commit()
    return user


def _login(client, user):
    with client.session_transaction() as sess:
        sess["_user_id"] = str(user.id)
        sess["_fresh"] = True


def test_get_is_rejected(web_client):
    assert web_client.get("/account/api_key/regenerate").status_code == 405


def test_anonymous_cannot_regenerate(web_client):
    resp = web_client.post("/account/api_key/regenerate")
    assert resp.status_code in (302, 401)


def test_regenerate_replaces_only_the_callers_key(web_client):
    from website.db_class.db import User

    alice = _make_user("alice@test.test")
    bob = _make_user("bob@test.test")
    _login(web_client, alice)

    resp = web_client.post("/account/api_key/regenerate")
    assert resp.status_code == 200
    new_key = resp.get_json()["api_key"]

    assert new_key != "old-alice@test.test" and len(new_key) == 60 and new_key.isalnum()
    assert User.query.get(alice.id).api_key == new_key
    assert User.query.get(bob.id).api_key == "old-bob@test.test"
    assert User.query.filter_by(api_key="old-alice@test.test").first() is None


# --- admin: any user's key ------------------------------------------------

def test_admin_route_refuses_get(web_client):
    assert web_client.get("/account/api_key/regenerate/1").status_code == 405


def test_non_admin_cannot_regenerate_someone_elses_key(web_client):
    from website.db_class.db import User

    alice = _make_user("alice2@test.test")
    bob = _make_user("bob2@test.test")
    _login(web_client, alice)
    assert web_client.post(f"/account/api_key/regenerate/{bob.id}").status_code == 403
    assert User.query.get(bob.id).api_key == "old-bob2@test.test"


def test_admin_regenerates_any_key_without_seeing_it(web_client):
    from website.db_class.db import User

    admin = _make_user("root@test.test", admin=True)
    bob = _make_user("bob3@test.test")
    _login(web_client, admin)
    resp = web_client.post(f"/account/api_key/regenerate/{bob.id}")
    assert resp.status_code == 200
    assert "api_key" not in resp.get_json()           # the admin revokes, never reads
    assert User.query.get(bob.id).api_key not in ("old-bob3@test.test", None)
    assert User.query.get(admin.id).api_key == "old-root@test.test"
    assert web_client.post("/account/api_key/regenerate/999999").status_code == 404
