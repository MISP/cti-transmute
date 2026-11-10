"""The tags admin submodule endpoints, pinned at the web seam.

We renamed the ``vendor/`` shelf to ``submodules/`` which sweeps the
word out of the runtime vocabulary: the status route lives at
``/tags/admin/submodule_status`` (no shim - its only caller is our own
admin page, which changed in the same slice).

``submodule_status`` is read-only and is now the only submodule route:
refreshing the datasets left the HTTP server for ``manage
update-datasets``, so the page it feeds is where an admin reads which
revision is loaded.

Fixture/helper prior art: ``test_trash_routes.py``.
"""

import json

import pytest


@pytest.fixture
def web_client(app_db):
    from website.web import application
    from website.web.tags.tags import tags_blueprint

    application.config["TESTING"] = True
    application.config["WTF_CSRF_ENABLED"] = False
    if tags_blueprint.name not in application.blueprints:
        application.register_blueprint(tags_blueprint, url_prefix="/tags")
    return application.test_client()


def _make_admin(email="admin@test.test"):
    from website.db_class.db import User
    from website.web import db

    user = User(first_name="u", last_name="x", email=email, admin=True, api_key=email)
    db.session.add(user)
    db.session.commit()
    return user


def _login(client, user):
    with client.session_transaction() as sess:
        sess["_user_id"] = str(user.id)
        sess["_fresh"] = True


def test_submodule_status_reports_both_dataset_submodules(web_client, app_db):
    admin = _make_admin()
    _login(web_client, admin)

    resp = web_client.get("/tags/admin/submodule_status")

    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    # '?' is _git_info's failure sentinel - a real sha proves the path
    # constants resolve to actual git checkouts under submodules/.
    assert data["taxonomies"]["sha"] != "?"
    assert data["galaxies"]["sha"] != "?"


def test_tag_management_sends_the_admin_to_the_management_command(full_web_client, app_db):
    """The page kept the revision chips and the two import buttons; the refresh
    itself is an operator command now, and the page says which one."""
    _login(full_web_client, _make_admin(email="page@test.test"))

    resp = full_web_client.get("/tags/admin/")

    assert resp.status_code == 200
    html = resp.get_data(as_text=True)
    assert "manage update-datasets" in html
    assert "misp-taxonomies" in html and "misp-galaxy" in html
    assert 'title="Import MISP Taxonomies"' in html
    assert 'title="Import MISP Galaxies"' in html
    assert "pull_and_import" not in html
    assert "Pull &amp; Import" not in html


def test_import_taxonomies_accepts_explicit_path(app_db, tmp_path):
    from website.db_class.db import Tag
    from website.web.tags import tags_core

    taxo = tmp_path / "demo"
    taxo.mkdir()
    (taxo / "machinetag.json").write_text(
        json.dumps({"namespace": "demo", "predicates": [{"value": "alpha"}]})
    )
    admin = _make_admin(email="importer@test.test")

    imported, skipped, errors = tags_core.import_taxonomies(admin.id, path=tmp_path)

    assert errors == []
    assert (imported, skipped) == (1, 0)
    assert Tag.query.filter_by(name="demo:alpha").count() == 1
