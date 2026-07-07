"""URL contracts of the renamed admin pages.

The two bookmarkable admin page URLs move off the retired noun
(``deleted_converts`` -> ``deleted_conversions``, ``bulk_converts`` ->
``bulk_conversions``) with a query-string-preserving 301 shim each.
The ``bulk_conversions/*`` fetch sub-routes move *without* shims: they are
called only from our own templates, which change in the same slice - the old
sub-paths are expected to 404.
"""

import pytest


@pytest.fixture
def admin_client(app_db):
    """Client with the account + tags blueprints, as the app factory mounts them."""
    from website.web import application
    from website.web.account.account import account_blueprint
    from website.web.tags.tags import tags_blueprint

    application.config["TESTING"] = True
    if account_blueprint.name not in application.blueprints:
        application.register_blueprint(account_blueprint, url_prefix="/account")
    if tags_blueprint.name not in application.blueprints:
        application.register_blueprint(tags_blueprint, url_prefix="/tags")
    return application.test_client()


def test_legacy_deleted_page_redirects_permanently(admin_client):
    resp = admin_client.get("/account/admin/deleted_converts")
    assert resp.status_code == 301
    assert resp.headers["Location"].endswith("/account/admin/deleted_conversions")


def test_legacy_deleted_page_preserves_query_string(admin_client):
    """Highlight deep links from admin comments / account index must survive."""
    resp = admin_client.get("/account/admin/deleted_converts?highlight=7")
    assert resp.status_code == 301
    assert resp.headers["Location"].endswith(
        "/account/admin/deleted_conversions?highlight=7"
    )


def test_deleted_conversions_page_is_registered(admin_client):
    # Unauthenticated hit: anything but 404 proves the route exists.
    resp = admin_client.get("/account/admin/deleted_conversions")
    assert resp.status_code != 404


def test_legacy_bulk_page_redirects_permanently(admin_client):
    resp = admin_client.get("/tags/admin/bulk_converts")
    assert resp.status_code == 301
    assert resp.headers["Location"].endswith("/tags/admin/bulk_conversions")


def test_bulk_conversions_page_is_registered(admin_client):
    resp = admin_client.get("/tags/admin/bulk_conversions")
    assert resp.status_code != 404


def test_bulk_fetch_subroutes_moved_without_shims(admin_client):
    """The fetch() endpoints are web-internal: caller and route move in the
    same slice, so the old sub-paths get no shim and simply 404."""
    assert admin_client.get("/tags/admin/bulk_conversions/list").status_code != 404
    assert admin_client.get("/tags/admin/bulk_converts/list").status_code == 404


def _make_admin(email="admin@test.test"):
    from website.db_class.db import User
    from website.web import db

    user = User(first_name="admin", last_name="x", email=email,
                admin=True, api_key=email)
    db.session.add(user)
    db.session.commit()
    return user


def _login(client, user):
    with client.session_transaction() as sess:
        sess["_user_id"] = str(user.id)
        sess["_fresh"] = True


def test_bulk_endpoints_no_longer_read_the_convert_ids_key(admin_client):
    """The JSON request key is ``conversion_ids`` now; a payload still using
    the retired ``convert_ids`` selects nothing and is rejected."""
    from website.web import application

    application.config["WTF_CSRF_ENABLED"] = False
    admin = _make_admin()
    _login(admin_client, admin)

    resp = admin_client.post(
        "/tags/admin/bulk_conversions/remove_tags",
        json={"convert_ids": [1], "tag_ids": [1]},
    )
    assert resp.status_code == 400


def test_legacy_bulk_page_preserves_query_string(admin_client):
    resp = admin_client.get("/tags/admin/bulk_converts?foo=1")
    assert resp.status_code == 301
    assert resp.headers["Location"].endswith("/tags/admin/bulk_conversions?foo=1")


def test_bulk_scan_accepts_the_conversion_ids_key(admin_client, monkeypatch):
    """Positive side of the key rename: ``conversion_ids`` selects rows and
    the scan starts (job spawn stubbed out — only the contract is pinned)."""
    from website.web.tags import bulk_jobs

    monkeypatch.setattr(bulk_jobs, "start_scan", lambda app, ids, uid: "jid-1")
    admin = _make_admin(email="admin2@test.test")
    _login(admin_client, admin)

    resp = admin_client.post(
        "/tags/admin/bulk_conversions/scan", json={"conversion_ids": [1]}
    )
    assert resp.status_code == 200
    assert resp.get_json()["job_id"] == "jid-1"


def test_my_comments_emits_conversion_name_and_active_keys(admin_client):
    """The comment listings' JSON contract: per-item ``conversion_name`` /
    ``conversion_active``; the retired ``convert_*`` spellings are gone."""
    import json as _json
    import uuid as _uuid
    from datetime import datetime, timezone

    from website.db_class.db import Comment, Conversion
    from website.web import db

    user = _make_admin(email="commenter@test.test")
    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=user.id, name="c", source_format="misp", target_format="stix",
        input_text=_json.dumps({}), output_text="x", params=None,
        created_at=now, updated_at=now, public=True, uuid=str(_uuid.uuid4()),
    )
    db.session.add(conv)
    db.session.commit()
    # is_deleted=True because get_user_comments filters `Comment.is_deleted`
    # truthy — despite its docstring saying deleted comments are excluded
    # (pre-existing behavior, not this slice's to change).
    db.session.add(Comment(conversion_id=conv.id, user_id=user.id,
                           content="hi", created_at=now, is_deleted=True))
    db.session.commit()
    _login(admin_client, user)

    resp = admin_client.get("/account/my_comments")

    assert resp.status_code == 200
    items = resp.get_json()["list"] if "list" in (resp.get_json() or {}) else resp.get_json().get("items", [])
    assert items, f"expected at least one comment, got: {resp.get_json()}"
    assert "conversion_name" in items[0]
    assert "conversion_active" in items[0]
    assert "convert_name" not in items[0]
    assert "convert_active" not in items[0]
