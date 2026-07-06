"""URL contracts of the conversions web surface.

Two concerns share this file:
- Backward-compat for the Convert -> Conversion URL rename: the web blueprint
  moves from ``/convert`` to ``/conversions``, and every old ``/convert/*``
  URL must keep working via a permanent (301) redirect to its
  ``/conversions/*`` equivalent, so existing links/bookmarks survive at least
  one release.
- The forward contract of ADR-0004: the API persist envelope advertises
  ``url: /conversions/<id>``, so that address must resolve.
"""

import pytest


@pytest.fixture
def web_client():
    """Flask test client with the conversions web blueprint + the legacy
    ``/convert`` redirect shim mounted, mirroring ``bin/start_website.py``.
    """
    from website.web import application
    from website.web.convert.convert import (
        conversions_blueprint,
        legacy_convert_blueprint,
    )

    application.config["TESTING"] = True
    if conversions_blueprint.name not in application.blueprints:
        application.register_blueprint(conversions_blueprint, url_prefix="/conversions")
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


def test_envelope_url_resolves_to_detail_page(web_client):
    """The API persist envelope advertises ``url: /conversions/<id>``;
    that URL must resolve — it redirects to the detail page."""
    resp = web_client.get("/conversions/42")
    assert resp.status_code == 302
    assert resp.headers["Location"].endswith("/conversions/detail/42")


def test_conversion_short_url_only_matches_ids(web_client):
    """Static sibling routes (``/conversions/history``…) must not be shadowed
    by the ``<int:id>`` rule, and non-numeric junk is not claimed by it."""
    resp = web_client.get("/conversions/history")
    assert resp.status_code == 200
    resp = web_client.get("/conversions/not-a-number")
    assert resp.status_code == 404


def test_record_urls_use_canonical_conversions_prefix(app_db, misp_event):
    """``to_share()`` advertises share/detail URLs to payload consumers; they
    must point at the canonical ``/conversions/…`` prefix, not the retired
    ``/convert/…`` one that survives only through the one-release 301 shim."""
    from cti_transmute.converters.misp_to_stix import MispToStixParams
    from website.lib.conversions import submit_conversion

    conversion = submit_conversion(
        user=None, source="misp", target="stix",
        payload=misp_event, params=MispToStixParams(),
    )
    payload = conversion.to_share()

    assert payload["share_url"].endswith(f"/conversions/share/{conversion.uuid}")
    assert payload["detail_url"].endswith(f"/conversions/detail/{conversion.id}")
