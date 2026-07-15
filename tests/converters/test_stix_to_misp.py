"""Contract tests for the STIX -> MISP Converter (cti_transmute, Flask-free)."""

import pytest
from pydantic import ValidationError

from cti_transmute.converters.stix_to_misp import StixToMisp, StixToMispParams
from cti_transmute.exceptions import InvalidPayload


def test_stix_bundle_converts_to_misp_event(stix_bundle):
    result = StixToMisp().process(stix_bundle, StixToMispParams())

    assert isinstance(result, dict)
    assert result["info"] == "TDD fixture event"


def test_non_stix_input_raises_invalid_payload():
    with pytest.raises(InvalidPayload):
        StixToMisp().process({"not": "stix"}, StixToMispParams())


def test_distribution_param_flows_into_the_misp_event(stix_bundle):
    result = StixToMisp().process(
        stix_bundle, StixToMispParams(distribution=3)
    )

    assert result["distribution"] == "3"


def test_converter_declares_json_output_format():
    assert StixToMisp().output_format == "application/json"


def test_params_defaults_mirror_the_library():
    params = StixToMispParams()

    assert params.distribution == 0
    assert params.cluster_distribution == 0
    assert params.sharing_group_id is None
    assert params.galaxies_as_tags is False
    assert params.no_force_contextual_data is False
    assert params.single_event is False


def test_params_reject_out_of_range_distribution():
    with pytest.raises(ValidationError):
        StixToMispParams(distribution=5)


def test_params_reject_unknown_field():
    with pytest.raises(ValidationError):
        StixToMispParams(bogus=True)


def test_params_accept_sharing_group_distribution_without_sharing_group():
    # Shape-only validation. The "sharing_group_id required when
    # distribution == 4" rule is the target tool's job, NOT ours — this must
    # construct cleanly.
    params = StixToMispParams(distribution=4)

    assert params.distribution == 4
    assert params.sharing_group_id is None
