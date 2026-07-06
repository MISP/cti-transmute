"""Web-layer tests: refresh + history accept/reject route matrix.

These pin the *authorisation gating* and *route wiring* the slice introduces —
anonymous is bounced to login, a stranger gets 403, the owner is allowed, and
the moderation endpoints are POST verbs that call the use-cases. The conversion
logic itself is covered at the use-case layer (``tests/lib/test_conversions.py``).
"""

import json
import uuid as _uuid
from datetime import datetime, timezone

import pytest


@pytest.fixture
def web_client(app_db):
    """DB-backed Flask test client with the conversions + account blueprints.

    Mirrors ``bin/start_website.py`` (account is needed so ``@login_required``
    can build the ``account.login`` redirect). CSRF is disabled so the POST
    moderation routes can be driven without a token.
    """
    from website.web import application
    from website.web.account.account import account_blueprint
    from website.web.convert.convert import (
        conversions_blueprint,
        legacy_convert_blueprint,
    )

    application.config["TESTING"] = True
    application.config["WTF_CSRF_ENABLED"] = False
    for bp, prefix in (
        (conversions_blueprint, "/conversions"),
        (legacy_convert_blueprint, "/convert"),
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


def _make_conversion(misp_event, owner_id, *, output="OLD-OUTPUT"):
    from website.db_class.db import Conversion
    from website.web import db

    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=owner_id, name="c", source_format="misp", target_format="stix",
        input_text=json.dumps(misp_event), output_text=output, params=None,
        created_at=now, updated_at=now, public=True, uuid=str(_uuid.uuid4()),
    )
    db.session.add(conv)
    db.session.commit()
    return conv


# --- refresh authorisation gating ----------------------------------------

def test_anonymous_refresh_redirects_to_login_and_writes_nothing(web_client, misp_event):
    from website.db_class.db import ConversionHistory

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(misp_event, owner.id)

    resp = web_client.get(f"/conversions/refresh/{conv.uuid}")

    assert resp.status_code == 302
    assert "/account/login" in resp.headers["Location"]
    assert ConversionHistory.query.count() == 0


def test_stranger_refresh_is_forbidden(web_client, misp_event):
    from website.db_class.db import ConversionHistory

    owner = _make_user(email="owner@test.test")
    stranger = _make_user(email="stranger@test.test")
    conv = _make_conversion(misp_event, owner.id)
    _login(web_client, stranger)

    resp = web_client.get(f"/conversions/refresh/{conv.uuid}")

    assert resp.status_code == 403
    assert ConversionHistory.query.count() == 0


def test_owner_can_open_the_refresh_form(web_client, misp_event):
    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(misp_event, owner.id)
    _login(web_client, owner)

    resp = web_client.get(f"/conversions/refresh/{conv.uuid}")

    assert resp.status_code == 200


def test_owner_post_refresh_writes_a_pending_history_row(web_client, misp_event):
    from website.db_class.db import ConversionHistory

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(misp_event, owner.id)
    _login(web_client, owner)

    # A novel name dodges the form's own validate_name uniqueness check.
    resp = web_client.post(
        f"/conversions/refresh/{conv.uuid}",
        data={"version": "2.1", "name": "fresh-run-1"},
    )

    assert resp.status_code == 200
    rows = ConversionHistory.query.filter_by(conversion_id=conv.id).all()
    assert len(rows) == 1
    assert rows[0].status == "pending"


def _make_history(conv, *, new_output="NEW-OUTPUT"):
    from website.db_class.db import ConversionHistory
    from website.web import db

    now = datetime.now(timezone.utc)
    history = ConversionHistory(
        user_id=conv.user_id, conversion_id=conv.id, version=2,
        uuid=str(_uuid.uuid4()), status="pending", public=conv.public,
        input_text=conv.input_text, old_output_text=conv.output_text,
        new_output_text=new_output, params=None, created_at=now,
    )
    db.session.add(history)
    db.session.commit()
    return history


# --- history moderation: POST accept / reject ----------------------------

def test_owner_accept_endpoint_transitions_status(web_client, misp_event):
    from website.db_class.db import ConversionHistory

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(misp_event, owner.id)
    history = _make_history(conv)
    _login(web_client, owner)

    resp = web_client.post(f"/conversions/history/{history.id}/accept")

    assert resp.status_code == 200
    assert resp.get_json()["success"] is True
    assert ConversionHistory.query.get(history.id).status == "accepted"


def test_owner_reject_endpoint_transitions_status(web_client, misp_event):
    from website.db_class.db import ConversionHistory

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(misp_event, owner.id)
    history = _make_history(conv)
    _login(web_client, owner)

    resp = web_client.post(f"/conversions/history/{history.id}/reject")

    assert resp.status_code == 200
    assert ConversionHistory.query.get(history.id).status == "rejected"


def test_stranger_accept_endpoint_is_forbidden(web_client, misp_event):
    from website.db_class.db import ConversionHistory

    owner = _make_user(email="owner@test.test")
    stranger = _make_user(email="stranger@test.test")
    conv = _make_conversion(misp_event, owner.id)
    history = _make_history(conv)
    _login(web_client, stranger)

    resp = web_client.post(f"/conversions/history/{history.id}/accept")

    assert resp.status_code == 403
    assert ConversionHistory.query.get(history.id).status == "pending"


def test_anonymous_accept_endpoint_redirects_to_login(web_client, misp_event):
    from website.db_class.db import ConversionHistory

    owner = _make_user(email="owner@test.test")
    conv = _make_conversion(misp_event, owner.id)
    history = _make_history(conv)

    resp = web_client.post(f"/conversions/history/{history.id}/accept")

    assert resp.status_code == 302
    assert "/account/login" in resp.headers["Location"]
    assert ConversionHistory.query.get(history.id).status == "pending"


def test_legacy_history_action_is_gone(web_client):
    resp = web_client.get("/conversions/history_action?history_id=1&action=accept")
    assert resp.status_code == 410


def test_dead_success_line_is_removed_from_the_codebase():
    """AC: the `success = True  # Replace with actual database call` line — which
    masked accept/reject's real return — must no longer exist anywhere."""
    import pathlib

    root = pathlib.Path(__file__).resolve().parents[1].parent / "website"
    needle = "Replace with actual database call"
    offenders = [
        p for p in root.rglob("*.py") if needle in p.read_text(encoding="utf-8")
    ]
    assert offenders == []
