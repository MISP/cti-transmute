"""HTTP-method contract of the admin user-delete route.

``/account/delete/<id>`` used to mutate on an HTTP **GET** (the route declared
``methods=['GET', 'POST']`` and deleted regardless of method), so the
deletion was reachable from a cross-site ``<img>``/link against a logged-in
admin - a CSRF sink, since Flask-WTF's CSRF protection does not cover GET. The
route is now POST-only: GET must reject with **405**, and the POST path keeps
its admin gate.

Prior art: ``test_http_verb_flips.py`` (the same method-flip contract on the
conversions blueprint). CSRF is disabled here so the POST exercises routing +
handler behavior directly; the token-required half is a Flask-WTF guarantee,
walked in the browser.
"""

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


def _user_exists(user_id):
    from website.db_class.db import User

    return User.query.get(user_id) is not None


# --- GET is rejected -------------------------------------------------------
# 405 is raised at URL-map dispatch, before the view (and its @login_required)
# runs, so an unauthenticated GET is enough to prove the method is gone.

def test_get_delete_user_is_rejected_with_405(web_client):
    assert web_client.get("/account/delete/1").status_code == 405


# --- POST keeps the admin-gated behavior -----------------------------------

def test_post_delete_user_by_admin_deletes(web_client):
    admin = _make_user("admin_del@t.t", admin=True)
    target = _make_user("target_del@t.t")
    _login(web_client, admin)

    resp = web_client.post(f"/account/delete/{target.id}")

    assert resp.status_code == 302
    assert resp.headers["Location"].endswith("/account/manage_user")
    assert not _user_exists(target.id)


def test_post_delete_user_by_non_admin_is_forbidden(web_client):
    stranger = _make_user("stranger_del@t.t")
    target = _make_user("target_keep@t.t")
    _login(web_client, stranger)

    resp = web_client.post(f"/account/delete/{target.id}")

    assert resp.status_code == 403
    assert _user_exists(target.id)
