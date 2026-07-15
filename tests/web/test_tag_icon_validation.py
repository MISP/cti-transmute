"""Server-side validation of the tag ``icon`` field.

The icon slug reaches the browser inside a FontAwesome class name, so the
write paths only accept slugs from the bundled FA solid catalogue (the same
set the icon picker offers via ``/tags/fa-icons``). A markup payload stored
in ``icon`` must be rejected at the write path - the admin triage queue
renders every pending tag, so a stored payload would fire in an admin
session.

Fixture/helper prior art: ``test_submodule_admin_routes.py``.
"""

import pytest

HOSTILE_ICON = '"><svg onload=alert(1)>'


@pytest.fixture
def web_client(app_db):
    from website.web import application
    from website.web.tags.tags import tags_blueprint

    application.config["TESTING"] = True
    application.config["WTF_CSRF_ENABLED"] = False
    if tags_blueprint.name not in application.blueprints:
        application.register_blueprint(tags_blueprint, url_prefix="/tags")
    return application.test_client()


def _make_user(email="user@test.test", admin=False):
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


def _make_tag(created_by, icon="tag"):
    from website.web.tags import tags_core

    return tags_core.create_tag(
        name="seed-tag", description=None, color=None, icon=icon,
        source="Manual", created_by=created_by
    )


def test_create_rejects_markup_icon(web_client, app_db):
    from website.db_class.db import Tag

    user = _make_user()
    _login(web_client, user)

    resp = web_client.post("/tags/create", json={"name": "evil", "icon": HOSTILE_ICON})

    assert resp.status_code == 400
    assert resp.get_json()["success"] is False
    assert Tag.query.filter_by(name="evil").count() == 0


def test_create_rejects_unknown_slug(web_client, app_db):
    from website.db_class.db import Tag

    user = _make_user()
    _login(web_client, user)

    resp = web_client.post("/tags/create", json={"name": "evil", "icon": "no-such-fa-slug"})

    assert resp.status_code == 400
    assert Tag.query.filter_by(name="evil").count() == 0


def test_create_accepts_catalogue_icon(web_client, app_db):
    from website.db_class.db import Tag

    user = _make_user()
    _login(web_client, user)

    resp = web_client.post("/tags/create", json={"name": "ok", "icon": "shield-halved"})

    assert resp.status_code == 201
    assert Tag.query.filter_by(name="ok").one().icon == "shield-halved"


def test_create_accepts_missing_icon(web_client, app_db):
    from website.db_class.db import Tag

    user = _make_user()
    _login(web_client, user)

    resp = web_client.post("/tags/create", json={"name": "bare"})

    assert resp.status_code == 201
    assert Tag.query.filter_by(name="bare").one().icon is None


def test_admin_edit_rejects_markup_icon(web_client, app_db):
    from website.db_class.db import Tag

    admin = _make_user(email="admin@test.test", admin=True)
    tag = _make_tag(created_by=admin.id)
    _login(web_client, admin)

    resp = web_client.post(f"/tags/admin/edit/{tag.id}", json={"icon": HOSTILE_ICON})

    assert resp.status_code == 400
    assert Tag.query.get(tag.id).icon == "tag"


def test_admin_edit_accepts_catalogue_icon(web_client, app_db):
    from website.db_class.db import Tag

    admin = _make_user(email="admin@test.test", admin=True)
    tag = _make_tag(created_by=admin.id)
    _login(web_client, admin)

    resp = web_client.post(f"/tags/admin/edit/{tag.id}", json={"icon": "shield-halved"})

    assert resp.status_code == 200
    assert Tag.query.get(tag.id).icon == "shield-halved"
