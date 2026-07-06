"""The /list page is a generated consumer of the Converter registry.

It renders its endpoint cards and testers client-side from
``GET /api/convert/list`` (each entry's ``params_schema``), mounting the same
``paramSurface.js`` renderer as the conversion pages — so the old server-side
``/get_features`` loopback proxy (an HTTP call from the app to its own port)
is gone.
"""

import pytest


@pytest.fixture
def full_web_client():
    """Flask test client with every web blueprint + the API mounted,
    mirroring ``bin/start_website.py`` (base.html url_for's across features,
    so rendering any page needs them all registered)."""
    from website.api import api_blueprint
    from website.web import application
    from website.web.account.account import account_blueprint
    from website.web.convert.convert import (
        convert_blueprint,
        legacy_convert_blueprint,
    )
    from website.web.evaluate.evaluate import evaluate_blueprint
    from website.web.home import home_blueprint
    from website.web.tags.tags import tags_blueprint

    application.config["TESTING"] = True
    # Other fixtures may have served a request already; clear Flask's
    # setup-after-first-request guard so late registration stays legal
    # (same trick as conftest.app_db).
    application._got_first_request = False
    for bp, prefix in [
        (home_blueprint, "/"),
        (convert_blueprint, "/conversions"),
        (legacy_convert_blueprint, "/convert"),
        (account_blueprint, "/account"),
        (tags_blueprint, "/tags"),
        (evaluate_blueprint, "/evaluate"),
    ]:
        if bp.name not in application.blueprints:
            application.register_blueprint(bp, url_prefix=prefix)
    if "transmute_api" not in application.blueprints:
        application.register_blueprint(api_blueprint)
    return application.test_client()


def test_list_page_renders_from_the_registry(full_web_client):
    resp = full_web_client.get("/list")
    assert resp.status_code == 200
    html = resp.get_data(as_text=True)
    # The page fetches the registry-driven API listing directly...
    assert "fetch('/api/convert/list')" in html
    # ...and mounts the shared schema-driven param renderer.
    assert "js/convert/paramSurface.js" in html
    # The pre-params_schema shape is fully gone from the page.
    assert "feature.parameters" not in html
    assert "/get_features" not in html


def test_list_page_dependencies_are_servable(full_web_client):
    """What the page fetches at runtime must exist on the same app: the
    registry listing it renders from, and the ES module it imports
    (asset_url would happily emit a URL for a deleted file)."""
    listing = full_web_client.get("/api/convert/list")
    assert listing.status_code == 200
    assert "available" in listing.get_json()
    asset = full_web_client.get("/static/js/convert/paramSurface.js")
    assert asset.status_code == 200


def test_get_features_loopback_is_gone(full_web_client):
    assert full_web_client.get("/get_features").status_code == 404
