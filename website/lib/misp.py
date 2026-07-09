"""Thin transport helper for talking to a remote MISP instance.

One helper owning the shared ``requests`` cascade, typed exceptions out, raw
parsed JSON back. Each caller keeps its own response normalization - the
endpoints' shapes share nothing, so there is deliberately no ``MispGateway``
class unifying them beyond transport.
"""

import requests


class MispError(Exception):
    """Base for remote-MISP transport failures; ``str(exc)`` is user-facing."""


class MispUnreachable(MispError):
    """The MISP instance could not be reached (DNS, connection, SSL, timeout).

    ``reason`` is one of ``"ssl"``, ``"connection"``, ``"timeout"``,
    ``"error"`` - transports use it to pick a status (408 for timeouts).
    """

    def __init__(self, message: str, *, reason: str):
        super().__init__(message)
        self.reason = reason


class MispAuthFailed(MispError):
    """The MISP instance rejected the API key (401/403)."""

    def __init__(self):
        super().__init__("Authentication failed — check your API key")


class MispHttpError(MispError):
    """The MISP instance answered, but not with a JSON 2xx.

    ``status`` is the upstream HTTP status code.
    """

    def __init__(self, status: int, message: str | None = None):
        super().__init__(message or f"MISP returned HTTP {status}")
        self.status = status


def _misp_request(method: str, path: str, *, url: str, key: str,
                  body: dict | None = None, timeout: int, verify: bool = True):
    """Call ``path`` on the MISP instance at ``url`` and return parsed JSON.

    Owns the shared transport cascade: headers, TLS verify (default on —
    self-signed remote MISP is a deferred product question, ADR-0018),
    redirects refused, the connection/timeout/SSL/HTTP-error handling, and the
    401/403 → auth mapping. Anything it raises is a ``MispError``.
    """
    try:
        resp = requests.request(
            method,
            f"{url}{path}",
            headers={"Authorization": key, "Accept": "application/json"},
            json=body,
            timeout=timeout,
            verify=verify,
            allow_redirects=False
        )
    except requests.exceptions.SSLError:
        raise MispUnreachable(
            "SSL certificate verification failed for that MISP instance",
            reason="ssl") from None
    except requests.exceptions.ConnectionError:
        raise MispUnreachable(
            "Cannot reach the MISP instance — check the URL",
            reason="connection") from None
    except requests.exceptions.Timeout:
        raise MispUnreachable(
            f"MISP instance did not respond in time (timeout {timeout} s)",
            reason="timeout") from None
    except requests.exceptions.RequestException as exc:
        raise MispUnreachable(f"Request failed: {exc}", reason="error") from exc

    if resp.status_code in (401, 403):
        raise MispAuthFailed()
    if not 200 <= resp.status_code < 300:
        raise MispHttpError(resp.status_code)
    try:
        return resp.json()
    except ValueError:
        raise MispHttpError(
            resp.status_code, "MISP returned a non-JSON response") from None
