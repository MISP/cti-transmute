"""Contract tests for the MISP -> STIX Converter (cti_transmute, Flask-free)."""

import pytest
from pydantic import ValidationError

from cti_transmute.converters.misp_to_stix import MispToStix, MispToStixParams
from cti_transmute.exceptions import InvalidPayload


def test_misp_event_converts_to_stix_bundle(misp_event):
    result = MispToStix().process(misp_event, MispToStixParams())

    assert isinstance(result, dict)
    assert result["type"] == "bundle"


def test_version_2_0_produces_a_stix_2_0_bundle(misp_event):
    result = MispToStix().process(misp_event, MispToStixParams(version="2.0"))

    # A STIX 2.0 bundle carries spec_version at the bundle level; 2.1 does not.
    assert result["type"] == "bundle"
    assert result.get("spec_version") == "2.0"


def test_converter_declares_json_output_format():
    assert MispToStix().output_format == "application/json"


def test_non_misp_input_raises_invalid_payload():
    with pytest.raises(InvalidPayload):
        MispToStix().process({"not": "a misp event"}, MispToStixParams())


def test_bare_event_without_wrapper_converts(misp_event):
    """A bare MISP event (top-level event fields, no {'Event': ...} wrapper) is
    valid MISP input and must convert. Derived from the wrapped fixture so the
    two share a single source of truth."""
    bare = misp_event["Event"]

    result = MispToStix().process(bare, MispToStixParams())

    assert result["type"] == "bundle"


def test_restsearch_response_collection_converts(misp_event):
    """restSearch output wraps events in {'response': [...]}; it must convert."""
    payload = {"response": [misp_event]}

    result = MispToStix().process(payload, MispToStixParams())

    assert result["type"] == "bundle"


def test_top_level_event_list_converts(misp_event):
    """A top-level list of events used to crash inside misp-stix; it now routes
    cleanly and converts (misp-stix ADR-0008)."""
    payload = [misp_event]

    result = MispToStix().process(payload, MispToStixParams())

    assert result["type"] == "bundle"


def test_empty_object_raises_invalid_payload():
    """An empty object matches no MISP shape -> InvalidPayload (not a silent
    empty bundle, the pre-ADR-0008 behaviour)."""
    with pytest.raises(InvalidPayload):
        MispToStix().process({}, MispToStixParams())


def test_params_default_version_is_2_1():
    assert MispToStixParams().version == "2.1"


def test_params_reject_unknown_version():
    with pytest.raises(ValidationError):
        MispToStixParams(version="3.0")


def test_params_reject_unknown_field():
    with pytest.raises(ValidationError):
        MispToStixParams(bogus=True)
