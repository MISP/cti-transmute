"""Unit tests for the shared parameter-surface helpers.

`build_params` turns a submitted params *mapping* (the JSON-body surfaces: the
web convert page and, later, the MISP view) into a Converter's Pydantic model,
and `param_error` renders a Pydantic `ValidationError` as the one `{error,
fields}` 400 every surface returns. The query-string variant with its
bool-coercion lives on the API resource; this is the typed-JSON sibling.
"""

import pytest
from pydantic import ValidationError

from cti_transmute.converters.stix_to_misp import StixToMispParams
from website.lib.params import build_params, param_error


def test_build_params_from_a_populated_mapping():
    params = build_params(StixToMispParams, {
        "distribution": 4,
        "sharing_group_id": 7,
        "galaxies_as_tags": True,
        "cluster_distribution": 2,
        "organisation_uuid": "org-uuid",
        "single_event": True,
        "producer": "ACME",
        "title": "My Event",
    })

    assert params.distribution == 4
    assert params.sharing_group_id == 7
    assert params.galaxies_as_tags is True
    assert params.cluster_distribution == 2
    assert params.organisation_uuid == "org-uuid"
    assert params.single_event is True
    assert params.producer == "ACME"
    assert params.title == "My Event"


def test_build_params_drops_blank_strings_to_defaults():
    params = build_params(StixToMispParams, {
        "organisation_uuid": "   ",   # whitespace only -> dropped
        "producer": "",               # empty -> dropped
        "title": "  Padded  ",        # stripped, kept
    })

    assert params.organisation_uuid is None
    assert params.producer is None
    assert params.title == "Padded"


def test_build_params_applies_defaults_when_absent():
    params = build_params(StixToMispParams, {})

    assert params.distribution == 0
    assert params.cluster_distribution == 0
    assert params.galaxies_as_tags is False


def test_build_params_coerces_stringified_numbers():
    # A number widget may hand back its value as a string; Pydantic coerces it.
    assert build_params(StixToMispParams, {"distribution": "3"}).distribution == 3


def test_build_params_drops_none_to_default():
    assert build_params(StixToMispParams, {"distribution": None}).distribution == 0


def test_build_params_raises_on_out_of_range_value():
    with pytest.raises(ValidationError):
        build_params(StixToMispParams, {"distribution": 99})


def test_build_params_rejects_unknown_key():
    # `extra="forbid"` is the sole authority — mirrors additionalProperties:false.
    with pytest.raises(ValidationError):
        build_params(StixToMispParams, {"sharing_group": 5})


def test_param_error_names_the_offending_field():
    try:
        StixToMispParams(distribution=99)
    except ValidationError as exc:
        body, status = param_error(exc)

    assert status == 400
    assert isinstance(body["error"], str) and body["error"]
    assert "distribution" in body["fields"]
    assert isinstance(body["fields"]["distribution"], str) and body["fields"]["distribution"]


def test_param_error_names_an_unknown_key():
    try:
        StixToMispParams(sharing_group=5)
    except ValidationError as exc:
        body, _ = param_error(exc)

    assert "sharing_group" in body["fields"]
