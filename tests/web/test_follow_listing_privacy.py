"""The follow listings serve display data, never the followed user's email.

``get_following`` used to copy ``user.email`` into every entry, so any
authenticated user could harvest addresses by following people and reading
the list — inconsistent with ``search_users`` and ``get_followers``, which
already omit it. The UI needs name + since (+ user_id to key unfollows).

Fixture/helper prior art: ``test_my_comments_filter.py``.
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


def _make_user(email):
    from website.db_class.db import User
    from website.web import db

    user = User(first_name="u", last_name="x", email=email, admin=False, api_key=email)
    db.session.add(user)
    db.session.commit()
    return user


def _login(client, user):
    with client.session_transaction() as sess:
        sess["_user_id"] = str(user.id)
        sess["_fresh"] = True


def test_following_list_serves_name_and_since_but_no_email(web_client):
    from datetime import datetime, timezone

    from website.db_class.db import UserFollow
    from website.web import db

    follower = _make_user("follower@t.t")
    followed = _make_user("followed-secret@t.t")
    db.session.add(UserFollow(follower_id=follower.id, followed_id=followed.id,
                              created_at=datetime.now(timezone.utc)))
    db.session.commit()
    _login(web_client, follower)

    resp = web_client.get("/account/get_following")

    assert resp.status_code == 200
    entries = resp.get_json()["list"]
    assert len(entries) == 1
    assert entries[0]["user_id"] == followed.id
    assert entries[0]["name"] == "u x"
    assert entries[0]["since"] is not None
    assert "email" not in entries[0]
    assert b"followed-secret@t.t" not in resp.data
