"""The tags admin submodule endpoints, pinned at the web seam.

We renamed the ``vendor/`` shelf to ``submodules/`` which sweeps the
word out of the runtime vocabulary: the status route moves to
``/tags/admin/submodule_status`` (no shim - its only caller is our own
admin page, which changes in the same slice), and the pull job's
activity-log event becomes ``tags_submodule_pull_started`` (historical
rows migrated in place).

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


def test_pull_and_import_logs_submodule_event(web_client, app_db, monkeypatch):
    from website.db_class.db import SystemLog
    from website.web.tags import bulk_jobs

    # Stub the worker: it would run `git submodule update --remote` on the
    # real checkout. The route's audit write is what this test pins.
    monkeypatch.setattr(
        bulk_jobs, "start_pull_and_import", lambda app, user_id: "stub1234"
    )
    admin = _make_admin()
    _login(web_client, admin)

    resp = web_client.post("/tags/admin/pull_and_import")

    assert resp.status_code == 200
    assert resp.get_json()["job_id"] == "stub1234"
    events = [row.event_type for row in SystemLog.query.filter_by(target_type="tag")]
    assert events == ["tags_submodule_pull_started"]


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
