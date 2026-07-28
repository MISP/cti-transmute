"""Visibility gate on GET /conversions/difference/<id>, pinned at the web seam.

The compare-versions page must follow the shared ``can_see`` rule like every
other read route: a public Conversion's diff renders for everyone (anonymous
included); a private Conversion's diff renders only for its owner or an admin
(anonymous gets a login redirect, stranger a history redirect). The route used
to gate this backwards (public demanded owner-or-admin, private rendered
unconditionally), leaking both output versions of private Conversions.

Fixture/helper prior art: ``test_comment_gates.py``.
"""

import json
import uuid as _uuid
from datetime import datetime, timezone

import pytest


@pytest.fixture
def web_client(app_db):
    from website.web import application
    from website.web.account.account import account_blueprint
    from website.web.conversions.conversions import conversions_blueprint

    application.config["TESTING"] = True
    application.config["WTF_CSRF_ENABLED"] = False
    if conversions_blueprint.name not in application.blueprints:
        application.register_blueprint(conversions_blueprint, url_prefix="/conversions")
    # The anonymous → login redirect builds url_for("account.login")
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
    # One auth state per test: flask-login caches the loaded user in ``g``,
    # and the app context `app_db` holds open spans every request in a test —
    # so the first request's identity sticks. Log in before the first request
    # and don't switch users mid-test (the norm across tests/web/).
    with client.session_transaction() as sess:
        sess["_user_id"] = str(user.id)
        sess["_fresh"] = True


def _make_history(user_id, public):
    """A Conversion owned by ``user_id`` with one history row; returns the row."""
    from website.db_class.db import Conversion, ConversionHistory
    from website.web import db

    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=user_id, name="c", source_format="misp", target_format="stix",
        input_text=json.dumps({}), output_text="old-output", params=None,
        created_at=now, updated_at=now, public=public, uuid=str(_uuid.uuid4())
    )
    db.session.add(conv)
    db.session.commit()
    history = ConversionHistory(
        user_id=conv.user_id, conversion_id=conv.id, version=2,
        uuid=str(_uuid.uuid4()), status="accepted", public=conv.public,
        input_text=conv.input_text, old_output_text=conv.output_text,
        new_output_text="new-output-secret", params=None, created_at=now
    )
    db.session.add(history)
    db.session.commit()
    return history


def _get_difference(client, history_id):
    return client.get(f"/conversions/difference/{history_id}")


# --- private Conversion: owner-or-admin only -----------------------------------

def test_private_diff_redirects_anonymous_to_login(web_client):
    owner = _make_user("owner_danon@t.t")
    history = _make_history(owner.id, public=False)
    resp = _get_difference(web_client, history.id)
    assert resp.status_code == 302
    assert "/login" in resp.headers["Location"]


def test_private_diff_is_denied_to_strangers(web_client):
    owner = _make_user("owner_dstr@t.t")
    stranger = _make_user("stranger_dstr@t.t")
    history = _make_history(owner.id, public=False)
    _login(web_client, stranger)
    resp = _get_difference(web_client, history.id)
    assert resp.status_code == 302
    assert "/conversions/history" in resp.headers["Location"]


def test_private_diff_renders_for_the_owner(web_client):
    owner = _make_user("owner_down@t.t")
    history = _make_history(owner.id, public=False)
    _login(web_client, owner)
    resp = _get_difference(web_client, history.id)
    assert resp.status_code == 200
    assert b"new-output-secret" in resp.data


def test_private_diff_renders_for_an_admin(web_client):
    owner = _make_user("owner_dadm@t.t")
    admin = _make_user("admin_dadm@t.t", admin=True)
    history = _make_history(owner.id, public=False)
    _login(web_client, admin)
    resp = _get_difference(web_client, history.id)
    assert resp.status_code == 200
    assert b"new-output-secret" in resp.data


# --- public Conversion: visible to everyone --------------------------------------

def test_public_diff_renders_for_anonymous(web_client):
    owner = _make_user("owner_panon@t.t")
    history = _make_history(owner.id, public=True)
    resp = _get_difference(web_client, history.id)
    assert resp.status_code == 200
    assert b"new-output-secret" in resp.data


def test_public_diff_renders_for_a_stranger(web_client):
    owner = _make_user("owner_pstr@t.t")
    stranger = _make_user("stranger_pstr@t.t")
    history = _make_history(owner.id, public=True)
    _login(web_client, stranger)
    resp = _get_difference(web_client, history.id)
    assert resp.status_code == 200
    assert b"new-output-secret" in resp.data
