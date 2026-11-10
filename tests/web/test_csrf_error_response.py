"""Web-layer test: a CSRF failure reaches a fetch/JSON caller as JSON.

The conversion pages submit by fetch and read the response with
``res.json().catch(() => ({}))``. Flask-WTF's default CSRF answer is an HTML
page, so the parse fails, the envelope comes back empty, and the page shows a
bare "Conversion failed (HTTP 400)" that names neither CSRF nor the remedy -
the symptom looks like a conversion failure when the conversion never ran.

The API blueprint is CSRF-exempt, so this only ever concerns the web routes.
"""

import pytest


@pytest.fixture
def csrf_client(app_db):
    """DB-backed client with the conversions blueprint and CSRF *on*.

    The rest of the web suite runs with ``WTF_CSRF_ENABLED = False`` on the same
    module-level app, so both flags are restored on the way out rather than left
    flipped for whatever runs next. ``SESSION_COOKIE_SECURE`` is pinned because
    it comes from the environment: an operator who follows the README and sets
    it to false in their own ``.env`` would otherwise see these tests fail.
    """
    from website.web import application
    from website.web.account.account import account_blueprint
    from website.web.conversions.conversions import conversions_blueprint

    application.config["TESTING"] = True
    previous = {
        key: application.config.get(key)
        for key in ("WTF_CSRF_ENABLED", "SESSION_COOKIE_SECURE")
    }
    application.config["WTF_CSRF_ENABLED"] = True
    application.config["SESSION_COOKIE_SECURE"] = True
    for blueprint, prefix in (
        (conversions_blueprint, "/conversions"),
        (account_blueprint, "/account")
    ):
        if blueprint.name not in application.blueprints:
            application.register_blueprint(blueprint, url_prefix=prefix)
    try:
        yield application.test_client()
    finally:
        application.config.update(previous)


def test_csrf_failure_on_a_json_submission_answers_json(csrf_client):
    """A tokenless JSON POST is refused with the ``{error}`` envelope.

    The page reads ``data.error``; anything that is not JSON collapses into its
    generic fallback, so the response being JSON is the behaviour under test.
    The client carries a session cookie here, so this is the ordinary failure -
    a stale or expired token - for which reloading is the real remedy.
    """
    with csrf_client.session_transaction() as session:
        session["seeded"] = True

    response = csrf_client.post("/conversions/stix_to_misp", json={"payload": "{}"})

    assert response.status_code == 400
    assert response.is_json
    error = response.get_json()["error"]
    assert "CSRF" in error
    assert "Reload" in error


def test_a_dropped_secure_cookie_says_so_instead_of_asking_for_a_reload(csrf_client):
    """The plain-HTTP install's failure names its own cause.

    An instance served over plain HTTP at an IP or hostname marks its session
    cookie ``Secure``, which the browser then refuses to keep, so no session
    ever forms and reloading cannot help. Telling that operator to reload sends
    them round a loop the page cannot break out of.
    """
    response = csrf_client.post(
        "/conversions/stix_to_misp",
        json={"payload": "{}"},
        base_url="http://10.0.0.5:6868"
    )

    error = response.get_json()["error"]
    assert "SESSION_COOKIE_SECURE" in error
    assert "HTTPS" in error
    assert "Reload" not in error


def test_the_login_form_gets_the_explanation_too(csrf_client):
    """The login page is where a plain-HTTP operator meets this first.

    It is a classic ``<form method="post">``, not a fetch, so it never sees the
    JSON envelope. Leaving it on Flask-WTF's default page would hide the cause
    at the one screen a new installation cannot get past.
    """
    response = csrf_client.post(
        "/account/login",
        data={"email": "u@test.test", "password": "x"},
        base_url="http://10.0.0.5:6868"
    )

    assert response.status_code == 400
    assert not response.is_json
    assert "SESSION_COOKIE_SECURE" in response.get_data(as_text=True)


def test_a_tls_terminating_proxy_never_sees_the_cookie_explanation(csrf_client):
    """The usual production shape stays on the ordinary message.

    nginx or Apache terminating TLS forwards plain HTTP with
    ``X-Forwarded-Proto``, which `ProxyFix` applies before the request is
    routed. The cookie is kept in that deployment, so blaming it would send
    the operator chasing a setting that is already correct.
    """
    response = csrf_client.post(
        "/conversions/stix_to_misp",
        json={"payload": "{}"},
        base_url="http://10.0.0.5:6868",
        headers={"X-Forwarded-Proto": "https"}
    )

    error = response.get_json()["error"]
    assert "Reload" in error
    assert "SESSION_COOKIE_SECURE" not in error


def test_a_loopback_host_is_never_blamed_on_its_cookie(csrf_client):
    """Browsers keep a Secure cookie on loopback, so it is never the cause.

    `localhost`, `127.0.0.0/8` and `::1` are trustworthy origins, exempt from
    the HTTPS requirement. A missing cookie there means something else - it was
    cleared, or blocked, or the caller is not a browser - and telling that
    operator to turn off SESSION_COOKIE_SECURE sends them after a setting that
    was never at fault.
    """
    for base_url in ("http://localhost:6868", "http://127.0.0.1:6868"):
        response = csrf_client.post(
            "/conversions/stix_to_misp",
            json={"payload": "{}"},
            base_url=base_url
        )

        error = response.get_json()["error"]
        assert "SESSION_COOKIE_SECURE" not in error, base_url
        assert "Reload" in error, base_url
