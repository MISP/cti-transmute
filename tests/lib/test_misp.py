"""The remote-MISP transport helper.

``_misp_request`` owns the shared transport cascade - headers, TLS verify,
redirect policy, connection/timeout/SSL/HTTP-error handling, 401/403 mapping -
raises the typed exceptions, and returns raw parsed JSON. Callers keep their
own response normalization, so these tests mock at the HTTP layer with
``responses`` and never look at UI shapes.

The URL/key come from ``misp_config.json`` next to this file. The mocked
checks run either way (``responses`` intercepts before any network I/O); the
live section at the bottom additionally round-trips against the configured
instance for real, and skips when the config holds the fake generic values or
the instance isn't usable.
"""

import json
from pathlib import Path
from urllib.parse import urlparse

import pytest
import requests
import responses

from website.lib.misp import (
    MispAuthFailed, MispError, MispHttpError, MispUnreachable, _misp_request)

CONFIG_PATH = Path(__file__).parent / "misp_config.json"
PLACEHOLDER_URL = "https://misp.example.org"
PLACEHOLDER_KEY = "test-api-key"


def _configured_instance() -> tuple[str, str]:
    """URL/key from ``misp_config.json``, or the placeholders without it.

    A missing or malformed config must never take the hermetic checks down
    with it, so any parse trouble falls back to the placeholders too.
    """
    if CONFIG_PATH.exists():
        try:
            raw = json.loads(CONFIG_PATH.read_text())
            url = (raw.get("url") or "").strip().rstrip("/")
            key = (raw.get("auth") or "").strip()
        except (ValueError, AttributeError, OSError):
            return PLACEHOLDER_URL, PLACEHOLDER_KEY
        if url and key:
            return url, key
    return PLACEHOLDER_URL, PLACEHOLDER_KEY


_EXAMPLE_DOMAINS = ("example.com", "example.org", "example.net")


def _is_placeholder(url: str, key: str) -> bool:
    """True when the values are fake generic ones, not a real instance."""
    host = urlparse(url).hostname or ""
    return (host in _EXAMPLE_DOMAINS
            or host.endswith(tuple("." + domain for domain in _EXAMPLE_DOMAINS))
            or key == PLACEHOLDER_KEY)


MISP_URL, KEY = _configured_instance()


@responses.activate
def test_success_returns_raw_parsed_json_and_sends_the_shared_headers():
    responses.add(
        responses.POST, f"{MISP_URL}/events/restSearch",
        json={"response": [{"Event": {"id": "1"}}]}, status=200)

    result = _misp_request(
        "POST", "/events/restSearch",
        url=MISP_URL, key=KEY, body={"returnFormat": "json"}, timeout=30)

    assert result == {"response": [{"Event": {"id": "1"}}]}
    sent = responses.calls[0].request
    assert sent.headers["Authorization"] == KEY
    assert sent.headers["Accept"] == "application/json"
    assert json.loads(sent.body) == {"returnFormat": "json"}


@responses.activate
def test_get_without_body_sends_no_body():
    responses.add(responses.GET, f"{MISP_URL}/tags/index", json=[], status=200)

    assert _misp_request("GET", "/tags/index", url=MISP_URL, key=KEY, timeout=10) == []
    assert responses.calls[0].request.body is None


@pytest.mark.parametrize("status", [401, 403])
@responses.activate
def test_401_and_403_raise_auth_failed(status):
    responses.add(responses.GET, f"{MISP_URL}/tags/index", json={}, status=status)

    with pytest.raises(MispAuthFailed):
        _misp_request("GET", "/tags/index", url=MISP_URL, key=KEY, timeout=10)


@responses.activate
def test_connection_error_raises_unreachable():
    responses.add(
        responses.GET, f"{MISP_URL}/tags/index",
        body=requests.exceptions.ConnectionError())

    with pytest.raises(MispUnreachable) as exc_info:
        _misp_request("GET", "/tags/index", url=MISP_URL, key=KEY, timeout=10)
    assert exc_info.value.reason == "connection"


@responses.activate
def test_timeout_raises_unreachable_with_the_timeout_in_the_message():
    responses.add(
        responses.GET, f"{MISP_URL}/tags/index",
        body=requests.exceptions.ReadTimeout())

    with pytest.raises(MispUnreachable) as exc_info:
        _misp_request("GET", "/tags/index", url=MISP_URL, key=KEY, timeout=10)
    assert exc_info.value.reason == "timeout"
    assert "10 s" in str(exc_info.value)


@responses.activate
def test_ssl_error_raises_unreachable_with_the_ssl_reason():
    responses.add(
        responses.GET, f"{MISP_URL}/tags/index",
        body=requests.exceptions.SSLError())

    with pytest.raises(MispUnreachable) as exc_info:
        _misp_request("GET", "/tags/index", url=MISP_URL, key=KEY, timeout=10)
    assert exc_info.value.reason == "ssl"


@responses.activate
def test_other_non_2xx_raises_http_error_with_the_status():
    responses.add(responses.GET, f"{MISP_URL}/tags/index", json={}, status=500)

    with pytest.raises(MispHttpError) as exc_info:
        _misp_request("GET", "/tags/index", url=MISP_URL, key=KEY, timeout=10)
    assert exc_info.value.status == 500
    assert "500" in str(exc_info.value)


@responses.activate
def test_redirects_are_not_followed_and_surface_as_http_errors():
    responses.add(
        responses.GET, f"{MISP_URL}/tags/index",
        status=302, headers={"Location": "https://elsewhere.example.com/"})

    with pytest.raises(MispHttpError) as exc_info:
        _misp_request("GET", "/tags/index", url=MISP_URL, key=KEY, timeout=10)
    assert exc_info.value.status == 302


@responses.activate
def test_non_json_2xx_body_raises_http_error():
    responses.add(
        responses.GET, f"{MISP_URL}/tags/index",
        body="<html>login page</html>", status=200)

    with pytest.raises(MispHttpError) as exc_info:
        _misp_request("GET", "/tags/index", url=MISP_URL, key=KEY, timeout=10)
    assert "non-JSON" in str(exc_info.value)


def test_typed_exceptions_share_the_misp_error_base():
    # Transports catch the base to map anything the helper raises to HTTP/JSON.
    for exc_type in (MispUnreachable, MispAuthFailed, MispHttpError):
        assert issubclass(exc_type, MispError)


# --- live round-trips (real MISP instance from misp_config.json) ------------

@pytest.mark.parametrize("url,key,fake", [
    (PLACEHOLDER_URL, PLACEHOLDER_KEY, True),
    ("https://misp.example.org", "aRealLookingKey123", True),
    ("https://misp.circl.lu", PLACEHOLDER_KEY, True),
    ("https://misp.goodexample.org", "aRealLookingKey123", False),
    ("https://misp.circl.lu", "aRealLookingKey123", False),
])
def test_placeholder_detection_gates_the_live_round_trips(url, key, fake):
    assert _is_placeholder(url, key) is fake


@pytest.fixture(scope="module")
def live_misp():
    """Skip unless ``misp_config.json`` points at a usable real instance."""
    if _is_placeholder(MISP_URL, KEY):
        pytest.skip("misp_config.json holds the fake generic values; "
                    "live round-trips need a real instance")
    try:
        _misp_request("GET", "/servers/getVersion", url=MISP_URL, key=KEY, timeout=10)
    except MispAuthFailed:
        pytest.skip("configured MISP instance rejected the key in misp_config.json")
    except MispError as exc:
        pytest.skip(f"configured MISP instance is not usable: {exc}")
    return MISP_URL, KEY


def test_live_get_round_trip_returns_the_instance_version(live_misp):
    url, key = live_misp

    result = _misp_request("GET", "/servers/getVersion", url=url, key=key, timeout=15)

    assert "version" in result


def test_live_post_round_trip_searches_events(live_misp):
    url, key = live_misp

    result = _misp_request(
        "POST", "/events/restSearch",
        url=url, key=key, body={"returnFormat": "json", "limit": 1}, timeout=30)

    assert isinstance(result.get("response"), list)


def test_live_rejected_key_raises_auth_failed(live_misp):
    url, _ = live_misp

    with pytest.raises(MispAuthFailed):
        _misp_request(
            "GET", "/servers/getVersion", url=url, key="not-the-right-key", timeout=15)
