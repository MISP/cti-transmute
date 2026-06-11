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


def test_params_default_version_is_2_1():
    assert MispToStixParams().version == "2.1"


def test_params_reject_unknown_version():
    with pytest.raises(ValidationError):
        MispToStixParams(version="3.0")


def test_params_reject_unknown_field():
    with pytest.raises(ValidationError):
        MispToStixParams(bogus=True)
