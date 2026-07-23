"""HTTP-method contracts of the follow/notification account routes.

Four account routes used to mutate on an HTTP **GET** - the same CSRF-on-GET
class as the admin user-delete (``test_account_delete_method.py``): follow
toggle, notification delete, mark-one-read, mark-all-read. Each state change
was reachable from a cross-site ``<img>``/link against a logged-in user, since
Flask-WTF's CSRF protection does not cover GET. The routes are now POST-only
(DELETE for the notification delete, matching the conversions convention in
``test_http_verb_flips.py``): GET must reject with **405**, and each operation
must still succeed under its new method.

CSRF is disabled here so the new-method calls exercise routing + handler
behavior directly; the token-required half is a Flask-WTF guarantee, walked in
the browser.
"""

from datetime import datetime, timezone

import pytest


@pytest.fixture
def web_client(app_db):
    """Account blueprint mounted on the SQLite-backed app, mirroring
    ``bin/start_website.py`` (url_prefix ``/account``)."""
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

    user = User(first_name="u", last_name="x", email=email, api_key=email)
    db.session.add(user)
    db.session.commit()
    return user


def _login(client, user):
    with client.session_transaction() as sess:
        sess["_user_id"] = str(user.id)
        sess["_fresh"] = True


def _make_notification(user_id, is_read=False):
    from website.db_class.db import Notification
    from website.web import db

    notif = Notification(user_id=user_id, type="comment_reply", is_read=is_read,
                         message="hi", created_at=datetime.now(timezone.utc))
    db.session.add(notif)
    db.session.commit()
    return notif


def _get_notification(notification_id):
    from website.db_class.db import Notification

    return Notification.query.get(notification_id)


def _follow_row_exists(follower_id, followed_id):
    from website.db_class.db import UserFollow

    return UserFollow.query.filter_by(
        follower_id=follower_id, followed_id=followed_id
    ).first() is not None


# --- GET is rejected on every flipped route ---------------------------------
# 405 is raised at URL-map dispatch, before the view (and its @login_required)
# runs, so an unauthenticated GET is enough to prove the method is gone.

@pytest.mark.parametrize("path", [
    "/account/follow",
    "/account/delete_notification",
    "/account/mark_notification_read",
    "/account/mark_all_read",
])
def test_get_is_rejected_with_405(web_client, path):
    assert web_client.get(path).status_code == 405


# --- Each operation succeeds under its new method ---------------------------

def test_follow_toggles_via_post(web_client):
    follower = _make_user("follower_f@t.t")
    target = _make_user("target_f@t.t")
    _login(web_client, follower)

    resp = web_client.post(f"/account/follow?user_id={target.id}")
    assert resp.status_code == 200
    assert resp.get_json()["following"] is True
    assert _follow_row_exists(follower.id, target.id)

    resp = web_client.post(f"/account/follow?user_id={target.id}")
    assert resp.status_code == 200
    assert resp.get_json()["following"] is False
    assert not _follow_row_exists(follower.id, target.id)


def test_delete_notification_succeeds_via_delete(web_client):
    user = _make_user("owner_notif_del@t.t")
    notif = _make_notification(user.id)
    _login(web_client, user)

    resp = web_client.delete(f"/account/delete_notification?notification_id={notif.id}")

    assert resp.status_code == 200
    assert resp.get_json()["success"] is True
    assert _get_notification(notif.id) is None


def test_mark_notification_read_succeeds_via_post(web_client):
    user = _make_user("owner_notif_read@t.t")
    notif = _make_notification(user.id)
    _login(web_client, user)

    resp = web_client.post(f"/account/mark_notification_read?notification_id={notif.id}")

    assert resp.status_code == 200
    assert resp.get_json()["success"] is True
    assert _get_notification(notif.id).is_read is True


def test_mark_all_read_succeeds_via_post(web_client):
    user = _make_user("owner_notif_all@t.t")
    first = _make_notification(user.id)
    second = _make_notification(user.id)
    _login(web_client, user)

    resp = web_client.post("/account/mark_all_read")

    assert resp.status_code == 200
    assert resp.get_json()["success"] is True
    assert _get_notification(first.id).is_read is True
    assert _get_notification(second.id).is_read is True
