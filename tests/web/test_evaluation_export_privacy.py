"""Privacy filtering on the evaluation report exports, pinned at the web seam.

The markdown/PDF exports render ``build_evaluation_report``, which used to copy
every non-deleted evaluation comment regardless of privacy — leaking private
comments (and their author's first name) to anyone who could see the
conversion. These tests pin the fix: the exports apply the same visibility rule
as the interactive comments endpoint (``website.lib.access.can_see_comment`` —
a private comment is visible only to the conversion owner, the comment author,
or an admin).

Fixture/helper prior art: ``test_comment_gates.py``. The evaluate blueprint
imports WeasyPrint at module level, so these skip where its native libraries
are absent (same guard as ``test_evaluation_pdf_render.py``).
"""

import json
import uuid as _uuid
from datetime import datetime, timezone

import pytest

try:
    from website.web.evaluate import evaluate_core
    _WEASYPRINT_OK = True
except OSError:
    _WEASYPRINT_OK = False

pytestmark = pytest.mark.skipif(
    not _WEASYPRINT_OK, reason="WeasyPrint native libraries not installed"
)


@pytest.fixture
def web_client(app_db):
    from website.web import application
    from website.web.evaluate.evaluate import evaluate_blueprint

    application.config["TESTING"] = True
    application.config["WTF_CSRF_ENABLED"] = False
    if evaluate_blueprint.name not in application.blueprints:
        application.register_blueprint(evaluate_blueprint, url_prefix="/evaluate")
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
    # and the app context `app_db` holds open spans every request in a test,
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


def _make_eval_comment(conversion_id, user_id, content, is_private=False):
    from website.db_class.db import Comment
    from website.web import db

    comment = Comment(conversion_id=conversion_id, user_id=user_id, content=content,
                      created_at=datetime.now(timezone.utc), is_deleted=False,
                      is_private=is_private, is_evaluation=True)
    db.session.add(comment)
    db.session.commit()
    return comment


def _export_scenario(suffix):
    """A public Conversion with a public and a private eval comment by one author."""
    owner = _make_user(f"owner_{suffix}@t.t")
    author = _make_user(f"author_{suffix}@t.t")
    conv = _make_conversion(owner.id)
    _make_eval_comment(conv.id, author.id, content="public-note")
    _make_eval_comment(conv.id, author.id, content="private-whisper", is_private=True)
    return owner, author, conv


def _markdown_export(client, conversion_id):
    resp = client.get(f"/evaluate/export/{conversion_id}/markdown")
    assert resp.status_code == 200
    return resp.get_data(as_text=True)


# --- private comments are filtered out for outsiders ------------------------------

def test_private_eval_comment_hidden_from_stranger_in_markdown_export(web_client):
    _, _, conv = _export_scenario("md_stranger")
    stranger = _make_user("stranger_md@t.t")
    _login(web_client, stranger)
    md = _markdown_export(web_client, conv.id)
    assert "public-note" in md
    assert "private-whisper" not in md


def test_private_eval_comment_hidden_from_anonymous_in_markdown_export(web_client):
    _, _, conv = _export_scenario("md_anon")
    md = _markdown_export(web_client, conv.id)
    assert "public-note" in md
    assert "private-whisper" not in md


def test_private_eval_comment_hidden_from_stranger_in_pdf_export(web_client, monkeypatch):
    """The PDF route must thread the actor too. The leak vector is the report
    dict handed to the renderer, so capture it there instead of parsing
    compressed PDF streams (the render itself is pinned by
    ``test_evaluation_pdf_render.py``)."""
    _, _, conv = _export_scenario("pdf_stranger")
    stranger = _make_user("stranger_pdf@t.t")
    _login(web_client, stranger)

    captured = {}

    def fake_render(report):
        captured["report"] = report
        return b"%PDF-fake"

    monkeypatch.setattr(evaluate_core, "render_evaluation_pdf", fake_render)
    resp = web_client.get(f"/evaluate/export/{conv.id}/pdf")
    assert resp.status_code == 200
    contents = [c["content"] for c in captured["report"]["eval_comments"]]
    assert contents == ["public-note"]


# --- owner / author / admin still see the private comment -------------------------

def test_owner_sees_private_eval_comment_in_pdf_export(web_client, monkeypatch):
    owner, _, conv = _export_scenario("pdf_owner")
    _login(web_client, owner)

    captured = {}

    def fake_render(report):
        captured["report"] = report
        return b"%PDF-fake"

    monkeypatch.setattr(evaluate_core, "render_evaluation_pdf", fake_render)
    resp = web_client.get(f"/evaluate/export/{conv.id}/pdf")
    assert resp.status_code == 200
    contents = [c["content"] for c in captured["report"]["eval_comments"]]
    assert contents == ["public-note", "private-whisper"]


def test_owner_sees_private_eval_comment_in_markdown_export(web_client):
    owner, _, conv = _export_scenario("md_owner")
    _login(web_client, owner)
    md = _markdown_export(web_client, conv.id)
    assert "public-note" in md
    assert "private-whisper" in md


def test_comment_author_sees_private_eval_comment_in_markdown_export(web_client):
    _, author, conv = _export_scenario("md_author")
    _login(web_client, author)
    md = _markdown_export(web_client, conv.id)
    assert "public-note" in md
    assert "private-whisper" in md


def test_admin_sees_private_eval_comment_in_markdown_export(web_client):
    _, _, conv = _export_scenario("md_admin")
    admin = _make_user("admin_md@t.t", admin=True)
    _login(web_client, admin)
    md = _markdown_export(web_client, conv.id)
    assert "public-note" in md
    assert "private-whisper" in md
