"""Contract tests for the STIX -> MISP Converter (cti_transmute, Flask-free)."""

import copy

import pytest
from misp_stix_converter.stix2misp.external_stix2_to_misp import ExternalSTIX2toMISPParser
from misp_stix_converter.stix2misp.internal_stix2_to_misp import InternalSTIX2toMISPParser
from pydantic import ValidationError

import cti_transmute.converters.stix_to_misp as stix_to_misp_module
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


# --- classification: which STIX 2 parser handles the bundle ------------------

@pytest.fixture
def unlabelled_bundle(stix_bundle):
    """The fixture bundle with the ``misp:tool`` label removed from its report or
    grouping, so content detection no longer recognises it as a MISP export."""
    bundle = copy.deepcopy(stix_bundle)
    for obj in bundle["objects"]:
        if obj["type"] in ("report", "grouping"):
            obj["labels"] = [
                label for label in obj["labels"] if not label.startswith("misp:tool")
            ]
    return bundle


@pytest.fixture
def chosen_parser(monkeypatch):
    """Records the parser class the Converter routed to. The real
    ``get_stix2_parser`` still runs, so the conversion itself is unchanged."""
    chosen = {}
    real = stix_to_misp_module.get_stix2_parser

    def spy(*args):
        parser_cls, arguments = real(*args)
        chosen["cls"] = parser_cls
        return parser_cls, arguments

    monkeypatch.setattr(stix_to_misp_module, "get_stix2_parser", spy)
    return chosen


def test_classification_internal_forces_the_internal_parser(
    unlabelled_bundle, chosen_parser
):
    StixToMisp().process(
        unlabelled_bundle, StixToMispParams(classification="internal")
    )

    assert chosen_parser["cls"] is InternalSTIX2toMISPParser


def test_classification_external_ignores_the_document_label(
    stix_bundle, chosen_parser
):
    StixToMisp().process(
        stix_bundle, StixToMispParams(classification="external")
    )

    assert chosen_parser["cls"] is ExternalSTIX2toMISPParser


def test_omitting_classification_is_a_no_op(stix_bundle, unlabelled_bundle):
    # The default must reproduce what detection alone produced: a labelled
    # bundle converts as if "internal" were asked for, an unlabelled one as
    # if "external" were.
    assert StixToMisp().process(
        copy.deepcopy(stix_bundle), StixToMispParams()
    ) == StixToMisp().process(
        copy.deepcopy(stix_bundle), StixToMispParams(classification="internal")
    )
    assert StixToMisp().process(
        copy.deepcopy(unlabelled_bundle), StixToMispParams()
    ) == StixToMisp().process(
        copy.deepcopy(unlabelled_bundle),
        StixToMispParams(classification="external")
    )
