"""Authorization gates on the comment operations, pinned at the web seam.

Repoints the ``conversions_core`` comment gates to the shared
``website/lib/access.py`` predicates (and changes their signatures from
``(requesting_user_id, is_admin)`` primitives to the Submitter object). These
tests pin the externally observable rules — who may delete/edit/toggle a
comment, who sees which comments — so the repoint stays behavior-preserving:

- delete: comment author, the Conversion's owner, or an admin
- edit: the comment's author only (not even an admin)
- privacy toggle: the comment's author or an admin
- visibility: a private Conversion's comments are owner/admin-only; a private
  comment on a public Conversion is visible only to the Conversion owner, the
  comment author, or an admin
- react: only on comments the Submitter can see (same visibility rule)

Fixture/helper prior art: ``test_http_verb_flips.py``.
"""

import json
import uuid as _uuid
from datetime import datetime, timezone

import pytest


@pytest.fixture
def web_client(app_db):
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
    # One auth state per test: flask-login caches the loaded user in ``g``,
    # and the app context `app_db` holds open spans every request in a test —
    # so the first request's identity sticks. Log in before the first request
    # and don't switch users mid-test (the norm across tests/web/).
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


def _make_comment(conversion_id, user_id, content="hi", is_private=False):
    from website.db_class.db import Comment
    from website.web import db

    comment = Comment(conversion_id=conversion_id, user_id=user_id, content=content,
                      created_at=datetime.now(timezone.utc), is_deleted=False,
                      is_private=is_private)
    db.session.add(comment)
    db.session.commit()
    return comment


def _comment_contents(client, conversion_id):
    resp = client.get(f"/conversions/get_comments?conversion_id={conversion_id}")
    assert resp.status_code == 200
    return [c["content"] for c in resp.get_json()["comments"]]


# --- delete: author, conversion owner, or admin -------------------------------

def test_stranger_cannot_delete_someone_elses_comment(web_client):
    owner = _make_user("owner_sdel@t.t")
    stranger = _make_user("stranger_sdel@t.t")
    conv = _make_conversion(owner.id)
    comment = _make_comment(conv.id, owner.id)
    _login(web_client, stranger)
    resp = web_client.delete(f"/conversions/delete_comment?comment_id={comment.id}")
    assert resp.status_code == 403
    assert resp.get_json()["success"] is False


def test_conversion_owner_can_delete_a_strangers_comment(web_client):
    owner = _make_user("owner_odel@t.t")
    commenter = _make_user("commenter_odel@t.t")
    conv = _make_conversion(owner.id)
    comment = _make_comment(conv.id, commenter.id)
    _login(web_client, owner)
    resp = web_client.delete(f"/conversions/delete_comment?comment_id={comment.id}")
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True


def test_admin_can_delete_any_comment(web_client):
    owner = _make_user("owner_adel@t.t")
    admin = _make_user("admin_adel@t.t", admin=True)
    conv = _make_conversion(owner.id)
    comment = _make_comment(conv.id, owner.id)
    _login(web_client, admin)
    resp = web_client.delete(f"/conversions/delete_comment?comment_id={comment.id}")
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True


# --- edit: the author only ------------------------------------------------------

def test_author_can_edit_their_comment(web_client):
    author = _make_user("author_edit@t.t")
    conv = _make_conversion(author.id)
    comment = _make_comment(conv.id, author.id)
    _login(web_client, author)
    resp = web_client.post("/conversions/edit_comment",
                           json={"comment_id": comment.id, "content": "edited"})
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True


def test_even_an_admin_cannot_edit_someone_elses_comment(web_client):
    author = _make_user("author_aedit@t.t")
    admin = _make_user("admin_aedit@t.t", admin=True)
    conv = _make_conversion(author.id)
    comment = _make_comment(conv.id, author.id)
    _login(web_client, admin)
    resp = web_client.post("/conversions/edit_comment",
                           json={"comment_id": comment.id, "content": "hijacked"})
    assert resp.status_code == 403
    assert resp.get_json()["success"] is False


# --- privacy toggle: author or admin --------------------------------------------

def test_stranger_cannot_toggle_comment_privacy(web_client):
    author = _make_user("author_stog@t.t")
    stranger = _make_user("stranger_stog@t.t")
    conv = _make_conversion(author.id)
    comment = _make_comment(conv.id, author.id)
    _login(web_client, stranger)
    resp = web_client.post(f"/conversions/toggle_comment_private?comment_id={comment.id}")
    assert resp.status_code == 403
    assert resp.get_json()["success"] is False


def test_admin_can_toggle_someone_elses_comment_privacy(web_client):
    author = _make_user("author_atog@t.t")
    admin = _make_user("admin_atog@t.t", admin=True)
    conv = _make_conversion(author.id)
    comment = _make_comment(conv.id, author.id)
    _login(web_client, admin)
    resp = web_client.post(f"/conversions/toggle_comment_private?comment_id={comment.id}")
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True


# --- visibility: get_comments filters by conversion + comment privacy ------------

def _private_conversation(viewer_email=None, admin=False):
    """A private Conversion, its owner's comment, and an optional extra user."""
    owner = _make_user("owner_vis@t.t")
    conv = _make_conversion(owner.id, public=False)
    _make_comment(conv.id, owner.id, content="secret")
    extra = _make_user(viewer_email, admin=admin) if viewer_email else None
    return owner, conv, extra


def test_private_conversions_comments_are_hidden_from_anonymous(web_client):
    _, conv, _ = _private_conversation()
    assert _comment_contents(web_client, conv.id) == []


def test_private_conversions_comments_are_hidden_from_strangers(web_client):
    _, conv, stranger = _private_conversation("stranger_vis@t.t")
    _login(web_client, stranger)
    assert _comment_contents(web_client, conv.id) == []


def test_private_conversions_comments_are_visible_to_the_owner(web_client):
    owner, conv, _ = _private_conversation()
    _login(web_client, owner)
    assert _comment_contents(web_client, conv.id) == ["secret"]


def test_private_conversions_comments_are_visible_to_an_admin(web_client):
    _, conv, admin = _private_conversation("admin_vis@t.t", admin=True)
    _login(web_client, admin)
    assert _comment_contents(web_client, conv.id) == ["secret"]


def _public_conversation_with_private_comment():
    """A public Conversion owned by one user, a private comment by another."""
    owner = _make_user("owner_pcom@t.t")
    author = _make_user("author_pcom@t.t")
    conv = _make_conversion(owner.id, public=True)
    _make_comment(conv.id, author.id, content="whisper", is_private=True)
    return owner, author, conv


def test_private_comment_on_public_conversion_is_hidden_from_anonymous(web_client):
    _, _, conv = _public_conversation_with_private_comment()
    assert _comment_contents(web_client, conv.id) == []


def test_private_comment_on_public_conversion_is_hidden_from_strangers(web_client):
    _, _, conv = _public_conversation_with_private_comment()
    stranger = _make_user("stranger_pcom@t.t")
    _login(web_client, stranger)
    assert _comment_contents(web_client, conv.id) == []


def test_private_comment_on_public_conversion_is_visible_to_its_author(web_client):
    _, author, conv = _public_conversation_with_private_comment()
    _login(web_client, author)
    assert _comment_contents(web_client, conv.id) == ["whisper"]


def test_private_comment_on_public_conversion_is_visible_to_the_conversion_owner(web_client):
    owner, _, conv = _public_conversation_with_private_comment()
    _login(web_client, owner)
    assert _comment_contents(web_client, conv.id) == ["whisper"]


def test_private_comment_on_public_conversion_is_visible_to_an_admin(web_client):
    _, _, conv = _public_conversation_with_private_comment()
    admin = _make_user("admin_pcom@t.t", admin=True)
    _login(web_client, admin)
    assert _comment_contents(web_client, conv.id) == ["whisper"]


# --- react: only comments the user can see ---------------------------------------

def _react(client, comment_id, emoji="👍"):
    return client.post("/conversions/react",
                       json={"comment_id": comment_id, "emoji": emoji})


def _reaction_count():
    from website.db_class.db import CommentReaction

    return CommentReaction.query.count()


def test_stranger_cannot_react_to_a_private_comment(web_client):
    owner = _make_user("owner_ract@t.t")
    author = _make_user("author_ract@t.t")
    conv = _make_conversion(owner.id, public=True)
    comment = _make_comment(conv.id, author.id, is_private=True)
    stranger = _make_user("stranger_ract@t.t")
    _login(web_client, stranger)
    resp = _react(web_client, comment.id)
    assert resp.status_code == 403
    assert _reaction_count() == 0


def test_reacting_on_a_private_conversion_is_forbidden_for_strangers(web_client):
    owner = _make_user("owner_rpriv@t.t")
    conv = _make_conversion(owner.id, public=False)
    comment = _make_comment(conv.id, owner.id)
    stranger = _make_user("stranger_rpriv@t.t")
    _login(web_client, stranger)
    resp = _react(web_client, comment.id)
    assert resp.status_code == 403
    assert _reaction_count() == 0


def test_reacting_to_a_soft_deleted_comment_is_404(web_client):
    from website.web import db

    owner = _make_user("owner_rdel@t.t")
    conv = _make_conversion(owner.id, public=True)
    comment = _make_comment(conv.id, owner.id)
    comment.is_deleted = True
    db.session.commit()
    _login(web_client, owner)
    resp = _react(web_client, comment.id)
    assert resp.status_code == 404
    assert _reaction_count() == 0


def test_reacting_on_a_soft_deleted_conversion_is_forbidden(web_client):
    from website.web import db

    owner = _make_user("owner_rconv@t.t")
    conv = _make_conversion(owner.id, public=True)
    comment = _make_comment(conv.id, owner.id)
    conv.is_active = False
    db.session.commit()
    _login(web_client, owner)
    resp = _react(web_client, comment.id)
    assert resp.status_code == 403
    assert _reaction_count() == 0


def test_a_visible_comment_can_be_reacted_to(web_client):
    owner = _make_user("owner_rok@t.t")
    reactor = _make_user("reactor_rok@t.t")
    conv = _make_conversion(owner.id, public=True)
    comment = _make_comment(conv.id, owner.id)
    _login(web_client, reactor)
    resp = _react(web_client, comment.id)
    assert resp.status_code == 200
    assert resp.get_json()["added"] is True
    assert _reaction_count() == 1


# --- /comment: the thin adapter maps the use-case's typed exceptions to HTTP ------

def test_posting_a_comment_returns_201_with_the_comment(web_client):
    author = _make_user("author_post@t.t")
    conv = _make_conversion(author.id)
    _login(web_client, author)
    resp = web_client.post("/conversions/comment",
                           json={"conversion_id": conv.id, "content": "hello"})
    assert resp.status_code == 201
    assert resp.get_json()["comment"]["content"] == "hello"


def test_commenting_on_a_private_conversion_is_403_for_strangers(web_client):
    owner = _make_user("owner_c403@t.t")
    stranger = _make_user("stranger_c403@t.t")
    conv = _make_conversion(owner.id, public=False)
    _login(web_client, stranger)
    resp = web_client.post("/conversions/comment",
                           json={"conversion_id": conv.id, "content": "psst"})
    assert resp.status_code == 403
    assert resp.get_json()["success"] is False


def test_an_overlong_comment_is_400(web_client):
    author = _make_user("author_c400@t.t")
    conv = _make_conversion(author.id)
    _login(web_client, author)
    resp = web_client.post("/conversions/comment",
                           json={"conversion_id": conv.id, "content": "x" * 2001})
    assert resp.status_code == 400
    assert "too long" in resp.get_json()["message"]


def test_a_reply_to_a_missing_parent_is_400(web_client):
    author = _make_user("author_c404p@t.t")
    conv = _make_conversion(author.id)
    _login(web_client, author)
    resp = web_client.post(
        "/conversions/comment",
        json={"conversion_id": conv.id, "content": "re", "parent_id": 4242})
    assert resp.status_code == 400
    assert resp.get_json()["success"] is False
