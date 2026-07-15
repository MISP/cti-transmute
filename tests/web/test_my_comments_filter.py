"""The "My comments" listing shows live comments and hides soft-deleted ones.

``get_user_comments`` used to filter ``Comment.is_deleted`` truthy in both of
its branches, so the account page listed only the user's soft-deleted comments:
deleting one from the list made it reappear on the next refresh, forever. These
tests pin the corrected filter on both branches (admin and non-admin).

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
    if account_blueprint.name not in application.blueprints:
        application.register_blueprint(account_blueprint, url_prefix="/account")
    # The end-to-end test drives DELETE /conversions/delete_comment
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


def _seed_live_and_deleted_comments(user):
    """A public Conversion owned by ``user`` with one live and one soft-deleted
    comment of theirs on it; returns the live comment."""
    from website.db_class.db import Comment, Conversion
    from website.web import db

    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=user.id, name="c", source_format="misp", target_format="stix",
        input_text=json.dumps({}), output_text="x", params=None,
        created_at=now, updated_at=now, public=True, uuid=str(_uuid.uuid4())
    )
    db.session.add(conv)
    db.session.commit()
    live = Comment(conversion_id=conv.id, user_id=user.id,
                   content="live", created_at=now, is_deleted=False)
    db.session.add(live)
    db.session.add(Comment(conversion_id=conv.id, user_id=user.id,
                           content="gone", created_at=now, is_deleted=True))
    db.session.commit()
    return live


def _my_comment_contents(client):
    resp = client.get("/account/my_comments")
    assert resp.status_code == 200
    return [c["content"] for c in resp.get_json()["list"]]


def test_my_comments_lists_live_and_hides_deleted_for_a_regular_user(web_client):
    user = _make_user("regular_myc@t.t")
    _seed_live_and_deleted_comments(user)
    _login(web_client, user)
    assert _my_comment_contents(web_client) == ["live"]


def test_my_comments_lists_live_and_hides_deleted_for_an_admin(web_client):
    admin = _make_user("admin_myc@t.t", admin=True)
    _seed_live_and_deleted_comments(admin)
    _login(web_client, admin)
    assert _my_comment_contents(web_client) == ["live"]


def test_soft_deleting_a_comment_removes_it_from_my_comments_for_good(web_client):
    user = _make_user("deleter_myc@t.t")
    live = _seed_live_and_deleted_comments(user)
    _login(web_client, user)
    assert _my_comment_contents(web_client) == ["live"]
    resp = web_client.delete(f"/conversions/delete_comment?comment_id={live.id}")
    assert resp.status_code == 200
    assert _my_comment_contents(web_client) == []
