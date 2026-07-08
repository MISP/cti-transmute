"""HTTP-method contracts of the state-changing conversion routes.

Six operations used to mutate on an HTTP **GET** — a CSRF/correctness smell, a
state change reachable from a cross-site ``<img>``/link or a crawler: visibility
toggle, share-key regeneration, comment delete, comment-privacy toggle, report
review, and report delete. We flips them to POST/DELETE, and the soft-delete
route (``/delete_item``) drops GET. Each must now reject GET with **405** and
succeed under its new verb.

Prior art for HTTP-method/URL assertions via the Flask test client:
``test_admin_route_renames.py`` and ``test_url_compat.py``. CSRF is disabled here
so the new-verb calls exercise routing + handler behavior directly; the
token-required half of the contract is a Flask-WTF guarantee, walked in the
browser.
"""

import json
import uuid as _uuid
from datetime import datetime, timezone

import pytest


@pytest.fixture
def web_client(app_db):
    """Conversions blueprint mounted on the SQLite-backed app, mirroring
    ``bin/start_website.py``. ``app_db`` supplies the schema + live app context."""
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


def _make_conversion(user_id, public=True):
    from website.db_class.db import Conversion
    from website.web import db

    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=user_id, name="c", source_format="misp", target_format="stix",
        input_text=json.dumps({}), output_text="x", params=None,
        created_at=now, updated_at=now, public=public, uuid=str(_uuid.uuid4()),
    )
    db.session.add(conv)
    db.session.commit()
    return conv


def _make_comment(conversion_id, user_id):
    from website.db_class.db import Comment
    from website.web import db

    comment = Comment(conversion_id=conversion_id, user_id=user_id, content="hi",
                      created_at=datetime.now(timezone.utc), is_deleted=False)
    db.session.add(comment)
    db.session.commit()
    return comment


def _make_report(conversion_id, user_id):
    from website.db_class.db import ConversionReport
    from website.web import db

    report = ConversionReport(conversion_id=conversion_id, user_id=user_id,
                              reason="spam", status="pending",
                              created_at=datetime.now(timezone.utc))
    db.session.add(report)
    db.session.commit()
    return report


# --- GET is rejected on every flipped route ---------------------------------
# 405 is raised at URL-map dispatch, before the view (and its @login_required)
# runs, so an unauthenticated GET is enough to prove the verb is gone.

@pytest.mark.parametrize("path", [
    "/conversions/edit_public",
    "/conversions/regenerate_share_key",
    "/conversions/delete_comment",
    "/conversions/toggle_comment_private",
    "/conversions/admin/review_report",
    "/conversions/admin/delete_report",
    "/conversions/delete_item",
])
def test_get_is_rejected_with_405(web_client, path):
    assert web_client.get(path).status_code == 405


# --- Each operation succeeds under its new verb -----------------------------

def test_edit_public_succeeds_via_post(web_client):
    owner = _make_user("owner_pub@t.t")
    conv = _make_conversion(owner.id)
    _login(web_client, owner)
    resp = web_client.post(f"/conversions/edit_public?id={conv.id}")
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True


def test_regenerate_share_key_succeeds_via_post(web_client):
    owner = _make_user("owner_key@t.t")
    conv = _make_conversion(owner.id)
    _login(web_client, owner)
    resp = web_client.post(f"/conversions/regenerate_share_key?id={conv.id}")
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True


def test_delete_comment_succeeds_via_delete(web_client):
    owner = _make_user("owner_delc@t.t")
    conv = _make_conversion(owner.id)
    comment = _make_comment(conv.id, owner.id)
    _login(web_client, owner)
    resp = web_client.delete(f"/conversions/delete_comment?comment_id={comment.id}")
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True


def test_toggle_comment_private_succeeds_via_post(web_client):
    owner = _make_user("owner_togc@t.t")
    conv = _make_conversion(owner.id)
    comment = _make_comment(conv.id, owner.id)
    _login(web_client, owner)
    resp = web_client.post(f"/conversions/toggle_comment_private?comment_id={comment.id}")
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True


def test_admin_review_report_succeeds_via_post(web_client):
    admin = _make_user("admin_rev@t.t", admin=True)
    conv = _make_conversion(admin.id)
    report = _make_report(conv.id, admin.id)
    _login(web_client, admin)
    resp = web_client.post(
        f"/conversions/admin/review_report?report_id={report.id}&status=reviewed"
    )
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True


def test_admin_delete_report_succeeds_via_delete(web_client):
    admin = _make_user("admin_delr@t.t", admin=True)
    conv = _make_conversion(admin.id)
    report = _make_report(conv.id, admin.id)
    _login(web_client, admin)
    resp = web_client.delete(f"/conversions/admin/delete_report?report_id={report.id}")
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True


def test_delete_item_succeeds_via_post(web_client):
    owner = _make_user("owner_delp@t.t")
    conv = _make_conversion(owner.id)
    _login(web_client, owner)
    resp = web_client.post("/conversions/delete_item", json={"id": conv.id})
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True


def test_delete_item_succeeds_via_delete(web_client):
    owner = _make_user("owner_deld@t.t")
    conv = _make_conversion(owner.id)
    _login(web_client, owner)
    resp = web_client.delete("/conversions/delete_item", json={"id": conv.id})
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True
