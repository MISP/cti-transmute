"""The front-end framework's delimiters never reach a browser live.

Vue compiles the DOM it mounts over, so a server-rendered value carrying its
``[[ ... ]]`` delimiters is an expression Vue evaluates, not text - and the nonce
CSP cannot stop it, because Vue's runtime compiler runs on the ``'unsafe-eval'``
the policy has to keep. The neutralisation splits the delimiters in every value
the server writes into a page, registered once on the Jinja environment so no
template has to remember.

Two levels, both asserting on what a browser receives and never on how a
template is written: the neutralisation function's contract, then the rendered
pages through the Flask test client. Whether the browser's Vue actually declines
to evaluate the split delimiters is confirmed by hand against a running
instance - mounting the real framework over a real DOM would be this repo's
first JavaScript dependency, for one assertion.
"""

import json
import re
import uuid as _uuid
from datetime import datetime, timezone

import pytest
from jinja2 import Environment
from markupsafe import escape

from website.web.templating import (
    VUE_DELIMITERS,
    WORD_JOINER,
    neutralise_delimiters,
    neutralise_delimiters_in_output
)

# `[].constructor.constructor` is `Function`, so this is arbitrary JavaScript
# the moment Vue compiles it.
PAYLOAD = "[[[].constructor.constructor('alert(document.domain)')()]]"

# The two-stage variant: the name field is length-capped, so the first stage
# only fetches the Conversion and evals the second stage out of its (uncapped)
# description.
FIRST_STAGE = (
    "Event related to super interesting stuff, attack on CIRCL. "
    "[[[].constructor.constructor(\"fetch('/conversions/get_conversion?id='"
    "+location.pathname.split('/').pop()).then(function(r){return r.json()})"
    ".then(function(j){eval(j.conversion.description)})\")()]]"
)
SECOND_STAGE = "[[[].constructor.constructor('alert(1);document.title=2')()]]"


def assert_inert(body: str, payload: str) -> None:
    """No form of `payload` that Vue would compile survives in `body`.

    An unprotected template emits exactly ``escape(payload)``; a template that
    skipped escaping entirely would emit the payload verbatim. Both carry the
    delimiter pair unbroken, so both are live.
    """
    assert payload not in body
    assert str(escape(payload)) not in body


def assert_displayed_neutralised(body: str, payload: str) -> None:
    """`payload` is shown, in the form the server neutralised it to."""
    assert str(escape(neutralise_delimiters(payload))) in body


# --- The neutralisation function ------------------------------------------

@pytest.mark.parametrize("delimiter", VUE_DELIMITERS)
def test_every_configured_delimiter_is_split(delimiter):
    # Parametrised over the constant itself: the neutralisation covers whatever
    # pair the front end is configured with, not a second hard-coded copy.
    assert delimiter not in neutralise_delimiters(f"before {delimiter} after")


def test_a_run_of_brackets_is_split_at_every_position():
    # The payload opens on "[[[", where a left-to-right replace consumes the
    # first pair and steps over the second, leaving a live delimiter behind.
    assert "[[" not in neutralise_delimiters("[[[[[")
    assert "]]" not in neutralise_delimiters("]]]]]")
    assert "[[" not in neutralise_delimiters(PAYLOAD)
    assert "]]" not in neutralise_delimiters(PAYLOAD)


def test_ordinary_text_passes_through_untouched():
    # Single brackets are ordinary punctuation in a Conversion name and must
    # not acquire invisible characters.
    for text in ("MISP event [2026-08-04] filed", "a[b]c", "", "no brackets"):
        assert neutralise_delimiters(text) == text


def test_the_submitter_s_characters_survive():
    # Nothing is deleted and no escape artefact is added: dropping the
    # zero-width joiners gives back exactly what was typed.
    assert neutralise_delimiters(PAYLOAD).replace(WORD_JOINER, "") == PAYLOAD


def test_it_composes_with_html_escaping_in_either_order():
    # The hook runs before Jinja's escaping, but the two are independent: the
    # joiner is not an HTML metacharacter and escaping produces no new
    # delimiters. Either order gives the same safe output.
    payload = "<b>[[x]]</b> & 'quoted'"
    assert escape(neutralise_delimiters(payload)) == neutralise_delimiters(str(escape(payload)))
    assert "[[" not in str(escape(neutralise_delimiters(payload)))


# --- The hook, as Jinja runs it --------------------------------------------

def _env(autoescape=True):
    env = Environment(autoescape=autoescape)
    env.finalize = neutralise_delimiters_in_output
    return env


def test_the_hook_neutralises_rendered_values():
    rendered = _env().from_string("Share {{ name }}").render(name=PAYLOAD)
    assert_inert(rendered, PAYLOAD)
    assert_displayed_neutralised(rendered, PAYLOAD)


def test_adjacent_expressions_cannot_reassemble_a_delimiter():
    # The hook sees one value at a time, and neither of these carries a
    # delimiter on its own - the profile page's avatar initials are rendered
    # exactly this way, from two names the same attacker registered.
    rendered = _env().from_string("{{ a }}{{ b }}").render(a="ends[", b="[starts")
    assert "[[" not in rendered


def test_a_value_that_is_not_a_string_is_still_neutralised():
    # A rendered list is a delimiter pair Python's own repr handed over.
    rendered = _env().from_string("{{ data }}").render(data=[[1, 2]])
    assert "[[" not in rendered
    assert "]]" not in rendered


def test_the_hook_leaves_json_data_islands_intact():
    # `]]` ends every nested array, so splitting delimiters inside |tojson
    # would corrupt the state the front end reads - which is the very delivery
    # mechanism the per-page migrations move to.
    rendered = _env().from_string("{{ data | tojson }}").render(data={"a": [[1, 2]]})
    assert json.loads(rendered.replace("\\u003c", "<")) == {"a": [[1, 2]]}
    assert WORD_JOINER not in rendered


def test_the_hook_leaves_non_html_output_alone():
    # Only HTML output feeds a template compiler; a text render (no autoescape)
    # gets the value byte for byte.
    assert _env(autoescape=False).from_string("{{ name }}").render(name=PAYLOAD) == PAYLOAD


# --- The rendered pages -----------------------------------------------------

@pytest.fixture
def web_client(app_db, full_web_client):
    """Every web blueprint, over the in-memory DB.

    ``app_db`` is requested first so the SQLite re-init lands before the
    blueprints register; the shared layout ``url_for``s across every feature,
    so rendering any page needs them all.
    """
    return full_web_client


def _make_user(email, first_name="u", last_name="x"):
    from website.db_class.db import User
    from website.web import db

    user = User(
        first_name=first_name, last_name=last_name, email=email,
        admin=False, api_key=email
    )
    db.session.add(user)
    db.session.commit()
    return user


def _make_conversion(name, description="d", user_id=None, public=True):
    from website.db_class.db import Conversion
    from website.web import db

    now = datetime.now(timezone.utc)
    conversion = Conversion(
        user_id=user_id, name=name, description=description,
        source_format="misp", target_format="stix",
        input_text=json.dumps({}), output_text="{}", params=None,
        created_at=now, updated_at=now, public=public, uuid=str(_uuid.uuid4())
    )
    db.session.add(conversion)
    db.session.commit()
    return conversion


def _login(client, user):
    with client.session_transaction() as sess:
        sess["_user_id"] = str(user.id)
        sess["_fresh"] = True


def _body_of(response) -> str:
    """A redirect or an error page would make every absence assertion vacuous."""
    assert response.status_code == 200
    return response.get_data(as_text=True)


def test_the_public_detail_page_shows_the_payload_as_text(web_client):
    conversion = _make_conversion(PAYLOAD)
    body = _body_of(web_client.get(f"/conversions/detail/{conversion.id}"))
    assert_inert(body, PAYLOAD)
    assert_displayed_neutralised(body, PAYLOAD)


def test_neither_stage_of_the_two_stage_payload_survives(web_client):
    conversion = _make_conversion(FIRST_STAGE, description=SECOND_STAGE)
    body = _body_of(web_client.get(f"/conversions/detail/{conversion.id}"))
    assert_inert(body, FIRST_STAGE)
    assert_inert(body, SECOND_STAGE)
    assert_displayed_neutralised(body, FIRST_STAGE)


def test_the_home_page_carries_no_live_payload(web_client):
    # The home page draws its Conversions from fetched JSON and renders them
    # through Vue data binding, so the payload should not be in the served
    # HTML at all - this pins that it stays that way.
    _make_conversion(PAYLOAD)
    body = _body_of(web_client.get("/"))
    assert_inert(body, PAYLOAD)


def test_a_flashed_message_shows_the_payload_as_text(web_client):
    # The flash region is the layout's, so it renders inside the mounted region
    # of every page that mounts one - `/list` is one, and needs no fixture.
    # Flashes live in the session, so seeding one there reaches the region
    # without going through a route that happens to flash.
    with web_client.session_transaction() as session:
        session["_flashes"] = [("danger", PAYLOAD)]
    body = _body_of(web_client.get("/list"))
    assert_inert(body, PAYLOAD)
    assert_displayed_neutralised(body, PAYLOAD)


def test_the_public_profile_page_shows_the_display_name_as_text(web_client):
    user = _make_user("poisoned@t.t", first_name=PAYLOAD, last_name=PAYLOAD)
    body = _body_of(web_client.get(f"/account/public/{user.id}"))
    assert_inert(body, PAYLOAD)
    assert_displayed_neutralised(body, PAYLOAD)
    # The avatar is two separate expressions, one per name, and both names are
    # the same attacker's: their initials must not meet as a live delimiter.
    initials = re.search(r'profile-hero-avatar">([^<]*)<', body).group(1)
    assert "[[" not in initials


def test_the_refresh_page_shows_the_conversion_name_as_text(web_client):
    owner = _make_user("owner_refresh@t.t")
    conversion = _make_conversion(PAYLOAD, user_id=owner.id, public=False)
    _login(web_client, owner)
    body = _body_of(web_client.get(f"/conversions/refresh/{conversion.uuid}"))
    assert_inert(body, PAYLOAD)
    assert_displayed_neutralised(body, PAYLOAD)


def test_the_comparison_header_shows_the_conversion_name_as_text(web_client):
    from website.db_class.db import ConversionHistory
    from website.web import db

    owner = _make_user("owner_diff@t.t")
    conversion = _make_conversion(PAYLOAD, user_id=owner.id, public=False)
    history = ConversionHistory(
        user_id=owner.id, conversion_id=conversion.id, version=2,
        uuid=str(_uuid.uuid4()), status="accepted", public=conversion.public,
        input_text=conversion.input_text, old_output_text="{}",
        new_output_text="{}", params=None,
        created_at=datetime.now(timezone.utc)
    )
    db.session.add(history)
    db.session.commit()
    _login(web_client, owner)
    body = _body_of(web_client.get(f"/conversions/difference/{history.id}"))
    assert_inert(body, PAYLOAD)
    assert_displayed_neutralised(body, PAYLOAD)
