"""Contract tests for Transmute — the conversion hub (registry + convert API)."""

import pytest

from cti_transmute import transmute
from cti_transmute.converters.misp_to_stix import MispToStix, MispToStixParams
from cti_transmute.converters.stix_to_misp import StixToMisp, StixToMispParams
from cti_transmute.exceptions import (
    InvalidParameters,
    InvalidPayload,
    UnknownConverter,
)

# --- registry: resolving a (source, target) family to its Converter ---------

def test_resolves_misp_to_stix():
    assert isinstance(transmute.lookup("misp", "stix"), MispToStix)


def test_resolves_stix_to_misp():
    assert isinstance(transmute.lookup("stix", "misp"), StixToMisp)


def test_lookup_unknown_pair_raises_unknown_converter():
    with pytest.raises(UnknownConverter):
        transmute.lookup("misp", "nope")


# --- convert: the one-call entry point --------------------------------------

def test_convert_misp_to_stix_with_default_params(misp_event):
    result = transmute.convert("misp", "stix", misp_event)

    assert isinstance(result, dict)
    assert result["type"] == "bundle"


def test_convert_accepts_params_as_a_plain_dict(misp_event):
    result = transmute.convert("misp", "stix", misp_event, {"version": "2.0"})

    assert result.get("spec_version") == "2.0"


def test_convert_accepts_a_prebuilt_params_model(stix_bundle):
    result = transmute.convert(
        "stix", "misp", stix_bundle, StixToMispParams(distribution=3)
    )

    assert result["distribution"] == "3"


def test_convert_unknown_pair_raises_unknown_converter(misp_event):
    with pytest.raises(UnknownConverter):
        transmute.convert("misp", "nope", misp_event)


def test_convert_invalid_params_dict_raises_invalid_parameters(misp_event):
    with pytest.raises(InvalidParameters):
        transmute.convert("misp", "stix", misp_event, {"version": "3.0"})


def test_convert_propagates_invalid_payload():
    with pytest.raises(InvalidPayload):
        transmute.convert("stix", "misp", {"not": "stix"})


def test_convert_rejects_mismatched_params_model(misp_event, stix_bundle):
    # A params model built for the wrong converter must surface as a typed
    # InvalidParameters at the hub, not a leaked AttributeError / mislabeled
    # ConverterFailed.
    with pytest.raises(InvalidParameters):
        transmute.convert("misp", "stix", misp_event, StixToMispParams())
    with pytest.raises(InvalidParameters):
        transmute.convert("stix", "misp", stix_bundle, MispToStixParams())
