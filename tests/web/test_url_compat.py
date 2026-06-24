"""Backward-compat for the Convert -> Conversion URL rename (spine 04).

The web blueprint moves from ``/convert`` to ``/conversions``. Every old
``/convert/*`` URL must keep working via a permanent (301) redirect to its
``/conversions/*`` equivalent, so existing links/bookmarks survive at least one
release. These tests drive that redirect shim; the rename itself is mechanical
and guarded by the rest of the suite staying green.
"""

import pytest


@pytest.fixture
def web_client():
    """Flask test client with the conversions web blueprint + the legacy
    ``/convert`` redirect shim mounted, mirroring ``bin/start_website.py``.
    """
    from website.web import application
    from website.web.convert.convert import (
        convert_blueprint,
        legacy_convert_blueprint,
    )

    application.config["TESTING"] = True
    if convert_blueprint.name not in application.blueprints:
        application.register_blueprint(convert_blueprint, url_prefix="/conversions")
    if legacy_convert_blueprint.name not in application.blueprints:
        application.register_blueprint(legacy_convert_blueprint, url_prefix="/convert")
    return application.test_client()


def test_legacy_history_url_redirects_permanently(web_client):
    resp = web_client.get("/convert/history")
    assert resp.status_code == 301
    assert resp.headers["Location"].endswith("/conversions/history")


def test_legacy_detail_url_preserves_path(web_client):
    resp = web_client.get("/convert/detail/5")
    assert resp.status_code == 301
    assert resp.headers["Location"].endswith("/conversions/detail/5")


def test_legacy_share_url_preserves_query_string(web_client):
    resp = web_client.get("/convert/share?uuid=abc-123")
    assert resp.status_code == 301
    assert resp.headers["Location"].endswith("/conversions/share?uuid=abc-123")
