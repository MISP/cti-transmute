"""What ``POST /tags/save_for_conversion/<id>`` says when the write fails.

``save_conversion_tags`` replaces a conversion's user tags in one transaction.
It used to answer a failed commit by rolling back and returning normally, so
the route replied ``{"success": True, "message": "Tags saved"}`` to a user
whose tags had not been saved - and the page they reloaded showed the old tags,
which reads as a stale UI rather than a failure.

These tests drive the route, not the function: the lie was in what crossed the
HTTP boundary.
"""

import uuid as _uuid
from datetime import datetime, timezone

import pytest


@pytest.fixture
def tags_client(app_db):
    """Signed-in-capable client on the SQLite-backed app.

    The account blueprint rides along because ``login_required`` redirects to
    ``account.login``, which has to resolve.
    """
    from website.web import application
    from website.web.account.account import account_blueprint
    from website.web.tags.tags import tags_blueprint

    application.config["TESTING"] = True
    previous = {key: application.config.get(key)
                for key in ("WTF_CSRF_ENABLED", "SESSION_COOKIE_SECURE")}
    application.config["WTF_CSRF_ENABLED"] = False
    application.config["SESSION_COOKIE_SECURE"] = False
    for blueprint, prefix in ((account_blueprint, "/account"),
                              (tags_blueprint, "/tags")):
        if blueprint.name not in application.blueprints:
            application.register_blueprint(blueprint, url_prefix=prefix)
    try:
        yield application.test_client()
    finally:
        application.config.update(previous)


def _user():
    from website.db_class.db import User
    from website.web import db

    user = User(first_name="Tag", last_name="Owner",
                email=f"{_uuid.uuid4().hex[:8]}@test.test",
                password_hash="x", api_key=_uuid.uuid4().hex)
    db.session.add(user)
    db.session.commit()
    return user


def _tag(user_id, name):
    from website.db_class.db import Tag
    from website.web import db

    tag = Tag(uuid=str(_uuid.uuid4()), name=name, visibility="public",
              created_by=user_id, is_active=True, is_approved_by_admin=True)
    db.session.add(tag)
    db.session.commit()
    return tag


def _conversion(user_id, tag_id):
    """One conversion already carrying ``tag_id`` as a user tag."""
    from website.db_class.db import Conversion, ConversionTagAssociation
    from website.web import db

    now = datetime.now(timezone.utc)
    conversion = Conversion(
        user_id=user_id, name="conv", source_format="misp",
        target_format="stix", input_text="{}", output_text="x",
        created_at=now, updated_at=now, public=True, uuid=str(_uuid.uuid4()))
    db.session.add(conversion)
    db.session.commit()
    db.session.add(ConversionTagAssociation(
        uuid=str(_uuid.uuid4()), conversion_id=conversion.id, tag_id=tag_id,
        user_id=user_id, added_at=now, source_type="user"))
    db.session.commit()
    return conversion


def _login(client, user):
    with client.session_transaction() as session:
        session["_user_id"] = str(user.id)
        session["_fresh"] = True


def test_a_save_that_fails_is_not_reported_as_saved(tags_client, monkeypatch):
    """The route answered 200 "Tags saved" whatever the commit did."""
    from website.db_class.db import ConversionTagAssociation
    from website.web.tags import tags_core

    user = _user()
    old_tag = _tag(user.id, "already-there")
    new_tag = _tag(user.id, "wanted")
    conversion = _conversion(user.id, old_tag.id)
    _login(tags_client, user)

    def refuse():
        raise RuntimeError("tag write refused")

    monkeypatch.setattr(tags_core.db.session, "commit", refuse)

    response = tags_client.post(
        f"/tags/save_for_conversion/{conversion.id}",
        json={"tag_ids": [new_tag.id]})

    assert response.status_code == 500
    assert response.get_json()["success"] is False
    monkeypatch.undo()
    # the rollback left the conversion with what it had, which is what the
    # user will see on the next load - so the answer has to be a failure
    kept = ConversionTagAssociation.query.filter_by(
        conversion_id=conversion.id, source_type="user").all()
    assert [a.tag_id for a in kept] == [old_tag.id]


def test_a_save_that_works_still_reports_saved(tags_client):
    from website.db_class.db import ConversionTagAssociation

    user = _user()
    old_tag = _tag(user.id, "already-there")
    new_tag = _tag(user.id, "wanted")
    conversion = _conversion(user.id, old_tag.id)
    _login(tags_client, user)

    response = tags_client.post(
        f"/tags/save_for_conversion/{conversion.id}",
        json={"tag_ids": [new_tag.id]})

    assert response.status_code == 200
    assert response.get_json()["success"] is True
    kept = ConversionTagAssociation.query.filter_by(
        conversion_id=conversion.id, source_type="user").all()
    assert [a.tag_id for a in kept] == [new_tag.id]
