"""The remote-MISP transport helper.

``_misp_request`` owns the shared transport cascade - headers, TLS verify,
redirect policy, connection/timeout/SSL/HTTP-error handling, 401/403 mapping -
raises the typed exceptions, and returns raw parsed JSON. Callers keep their
own response normalization, so these tests mock at the HTTP layer with
``responses`` and never look at UI shapes.
"""

import json

import pytest
import requests
import responses

from website.lib.misp import (
    MispAuthFailed, MispError, MispHttpError, MispUnreachable, _misp_request)

MISP_URL = "https://misp.example.com"
KEY = "test-api-key"


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
