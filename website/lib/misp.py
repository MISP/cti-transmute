"""The remote-MISP instance service pieces: transport helper + push payload.

``_misp_request`` is the one thin transport helper owning the shared
``requests`` cascade, typed exceptions out, raw parsed JSON back. Each caller
keeps its own response normalization - the endpoints' shapes share nothing, so
there is deliberately no ``MispGateway`` class unifying them beyond transport.

``build_misp_push_payload`` is the pure MISP-push payload builder: it turns a
Conversion's stored MISP event plus the community-evaluation data into exactly
what a push sends. No Flask, no DB, no HTTP - the ``push_to_misp`` use-case
and the payload download route both consume it; its preview-modal presentation
lives web-side in the conversions feature.
"""

import json
import re
import uuid
from datetime import datetime, timezone

import requests
from pymisp import MISPEvent, MISPObject

from website.lib.exceptions import ValidationFailed


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
    """The MISP instance answered, but unusably: a non-2xx status, a non-JSON
    body, or a 2xx body carrying MISP-side ``errors``.

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


_SCORE_MAP = {"very-low": 0, "low": 25, "moderate": 50, "high": 75, "very-high": 100}

# Human-readable labels for the machine format names on a Conversion.
_FORMAT_LABELS = {"misp": "MISP", "stix": "STIX 2.1"}

# Keys that identify a bare (un-enveloped) MISP event dict.
_MISP_EVENT_KEYS = {'info', 'uuid', 'Attribute', 'Object', 'Tag', 'Galaxy'}


def parse_eval_tag(name: str | None) -> tuple[str | None, str | None, str | None]:
    """Parse ``'ns:category="value"'`` → ``(ns, category, value)``, or Nones."""
    m = re.match(r'^([\w-]+):([\w.-]+)="([\w.-]+)"$', name or '')
    return (m.group(1), m.group(2), m.group(3)) if m else (None, None, None)


def overall_level(push_tags) -> str | None:
    """The overall-score level carried in the push tags, or ``None``."""
    return next((value for _, category, value in map(parse_eval_tag, push_tags)
                 if category == "overall-score"), None)


def _extract_event_data(conversion) -> dict:
    """The raw MISP event dict stored on the Conversion, whatever its envelope.

    Accepts the shapes MISP JSON travels in - ``{"Event": …}``, a
    ``{"response": [{"Event": …}]}`` wrapper, a list of either, or a bare event
    dict - and raises ``ValidationFailed`` when the stored text is not JSON or
    holds no event.
    """
    # The MISP JSON sits on whichever side of the Conversion is MISP-formatted.
    misp_text = (conversion.input_text
                 if conversion.source_format == "misp"
                 else conversion.output_text)
    try:
        misp_data = json.loads(misp_text)
    except (json.JSONDecodeError, TypeError):
        raise ValidationFailed("Invalid JSON in conversion data") from None

    if isinstance(misp_data, list):
        first      = misp_data[0] if misp_data else {}
        event_data = first.get("Event") or (first if isinstance(first, dict) and _MISP_EVENT_KEYS & first.keys() else None)
    elif isinstance(misp_data, dict):
        event_data = (
            misp_data.get("Event")
            or (misp_data.get("response") or [{}])[0].get("Event")
            or (misp_data if _MISP_EVENT_KEYS & misp_data.keys() else None)
        )
    else:
        event_data = None

    if not event_data:
        raise ValidationFailed("No MISP Event found in conversion data")
    return event_data


def build_misp_push_payload(conversion, push_tags, consensus_tags,
                            summary) -> tuple[dict, dict | None]:
    """Build the MISP event a push sends, via PyMISP.

    Loads the Conversion's stored MISP event (``ValidationFailed`` when the
    stored text holds none), strips the server-assigned fields that would
    conflict on a fresh import, applies the evaluation ``push_tags`` on the
    event, and injects the cti-evaluation object populated from the community
    votes (``consensus_tags`` rows and the ``summary`` approval score).

    Returns ``(event_dict, cti_object_dict)``: the full event as PyMISP
    serialized it, and just its cti-evaluation object for isolated display.
    """
    event_data = _extract_event_data(conversion)

    # Remove server-assigned fields that would conflict on a fresh MISP import
    for field in ("id", "timestamp", "publish_timestamp", "published"):
        event_data.pop(field, None)

    ev = MISPEvent()
    ev.from_json(json.dumps(event_data))

    # Add the evaluation tags onto the event
    existing_tag_names = {t.name for t in ev.tags}
    for tag_name in push_tags:
        if tag_name not in existing_tag_names:
            ev.add_tag(tag_name)

    # Build the cti-evaluation MISPObject
    source_fmt = _FORMAT_LABELS.get(conversion.source_format, conversion.source_format)
    target_fmt = _FORMAT_LABELS.get(conversion.target_format, conversion.target_format)
    level      = overall_level(push_tags)
    now_iso    = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    obj = MISPObject("cti-evaluation", standalone=False)

    # Fixed identity attributes
    obj.add_attribute("evaluation-id",               str(uuid.uuid4()),                                        type="text")
    obj.add_attribute("evaluation-name",             f"CTI-Transmute evaluation of {conversion.name}",         type="text")
    obj.add_attribute("evaluated-artifact",          conversion.name,                                          type="text")
    obj.add_attribute("evaluation-date",             now_iso,                                                  type="datetime")
    obj.add_attribute("evaluator",                   "CTI-Transmute platform (community)",                     type="text")
    obj.add_attribute("cti-transmute-conversion-id", conversion.uuid,                                          type="text")
    obj.add_attribute("cti-transmute-link",          f"https://cti-transmute.org/conversions/{conversion.id}", type="link")
    obj.add_attribute("source-format",               source_fmt,                                               type="text")
    obj.add_attribute("target-format",               target_fmt,                                               type="text")
    obj.add_attribute("calculation-formula", "Mean of community votes mapped to 0-100 (very-low=0, low=25, moderate=50, high=75, very-high=100)", type="text")

    # Scores
    if level:
        obj.add_attribute("overall-score",       level,                            type="text")
    if summary.get("approval_score") is not None:
        obj.add_attribute("overall-score-value", float(summary["approval_score"]), type="float")

    # Dimension scores from community consensus
    for tag in consensus_tags:
        cat, cat_level = tag["category"], tag["level"]
        obj.add_attribute(cat,            cat_level,                           type="text")
        obj.add_attribute(f"{cat}-score", float(_SCORE_MAP.get(cat_level, 0)), type="float")

    # One taxonomy-tag attribute per vote tag
    for tag_name in sorted(push_tags):
        obj.add_attribute("taxonomy-tag", value=tag_name, type="text")

    obj.add_attribute("taxonomy-reference", type='link',
                      value="https://github.com/MISP/misp-taxonomies/blob/main/cti-evaluation/machinetag.json")

    ev.add_object(obj)

    # Serialize the full event via PyMISP
    event_dict   = json.loads(ev.to_json())
    cti_obj_dict = next((o for o in event_dict.get("Object", []) if o["name"] == "cti-evaluation"), None)
    return event_dict, cti_obj_dict
