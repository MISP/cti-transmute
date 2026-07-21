"""Security response headers and cookie hardening, pinned at the web seam.

The header hook is registered on the application itself, so any URL — even a
404 — must carry the headers; that app-wideness is the property under test,
which is why these tests hit made-up routes on the plain ``client`` fixture.
HSTS is conditional: only on responses that arrived over TLS
(``X-Forwarded-Proto`` via ProxyFix), so a plain-HTTP dev setup never pins
browsers to HTTPS.

The cookie Secure flag is env-derived (a plain-HTTP dev container opts out via
``SESSION_COOKIE_SECURE=false`` in ``.env``), so these tests never assert the
ambient value: the derivation is pinned under a controlled environment, the
wiring is pinned as config-matches-derivation, and the wire test forces the
config so it passes on any checkout.
"""


def test_every_response_carries_the_security_headers(client):
    resp = client.get("/definitely-not-a-route")
    assert resp.status_code == 404
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert resp.headers["X-Frame-Options"] == "DENY"
    assert resp.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    assert "camera=()" in resp.headers["Permissions-Policy"]
    assert "Content-Security-Policy" in resp.headers


def test_csp_pins_the_load_bearing_directives(client):
    csp = client.get("/x").headers["Content-Security-Policy"]
    directives = {
        d.split(" ", 1)[0]: d.split(" ", 1)[1] if " " in d else ""
        for d in (part.strip() for part in csp.split(";")) if d
    }
    assert directives["default-src"] == "'self'"
    # Vue's runtime compiler (in-DOM templates, no build step) forces
    # 'unsafe-eval'; the inline Jinja scripts and on*= handlers force
    # 'unsafe-inline'. Pinning the full directive makes loosening it, or
    # dropping the rest of the policy, a conscious act.
    assert directives["script-src"] == (
        "'self' 'unsafe-inline' 'unsafe-eval' "
        "https://cdnjs.cloudflare.com https://cdn.jsdelivr.net"
    )
    assert directives["style-src"] == (
        "'self' 'unsafe-inline' https://cdnjs.cloudflare.com "
        "https://fonts.googleapis.com"
    )
    assert directives["font-src"] == "'self' https://fonts.gstatic.com"
    assert directives["img-src"] == "'self' data: https://img.youtube.com"
    assert directives["connect-src"] == "'self'"
    assert directives["worker-src"] == "'self' blob:"
    assert directives["frame-ancestors"] == "'none'"
    assert directives["frame-src"] == "'none'"
    assert directives["object-src"] == "'none'"
    assert directives["base-uri"] == "'self'"
    assert directives["form-action"] == "'self'"


def test_hsts_only_on_tls_terminated_requests(client):
    plain = client.get("/x")
    assert "Strict-Transport-Security" not in plain.headers

    # ProxyFix trusts X-Forwarded-Proto, which is how TLS termination
    # reaches the app in production.
    tls = client.get("/x", headers={"X-Forwarded-Proto": "https"})
    assert tls.headers["Strict-Transport-Security"] == "max-age=31536000; includeSubDomains"


def test_session_cookie_attributes_reach_the_wire(client, monkeypatch):
    from website.web import application

    # Force Secure on so this passes on a checkout whose .env opted out;
    # the env contract itself is pinned separately below.
    monkeypatch.setitem(application.config, "SESSION_COOKIE_SECURE", True)
    # flask-session sessions are permanent, so once a session exists every
    # response re-issues the cookie; no login route is needed to see the
    # attributes on the wire.
    with client.session_transaction() as sess:
        sess["probe"] = "x"
    resp = client.get("/x")
    set_cookie = next(
        (h for h in resp.headers.getlist("Set-Cookie") if h.startswith("session=")),
        None,
    )
    assert set_cookie is not None, "no session Set-Cookie on the response"
    assert "Secure" in set_cookie
    assert "HttpOnly" in set_cookie
    assert "SameSite=Lax" in set_cookie


def test_cookie_secure_env_flag_defaults_on_and_honors_the_opt_out(monkeypatch):
    from website.web import _cookie_secure_from_env

    monkeypatch.delenv("SESSION_COOKIE_SECURE", raising=False)
    assert _cookie_secure_from_env() is True
    monkeypatch.setenv("SESSION_COOKIE_SECURE", "false")
    assert _cookie_secure_from_env() is False
    monkeypatch.setenv("SESSION_COOKIE_SECURE", "0")
    assert _cookie_secure_from_env() is False


def test_cookie_config_is_wired_from_the_env_flag():
    # Comparing config to the derivation (instead of to True) keeps this
    # green on an opted-out dev checkout while still pinning the wiring.
    from website.web import _cookie_secure_from_env, application

    assert application.config["SESSION_COOKIE_SECURE"] == _cookie_secure_from_env()
    assert application.config["SESSION_COOKIE_SAMESITE"] == "Lax"
    assert application.config["REMEMBER_COOKIE_SECURE"] == _cookie_secure_from_env()
    assert application.config["REMEMBER_COOKIE_SAMESITE"] == "Lax"
