"""The pure MISP-push payload builder (``website/lib/misp.py``).

``build_misp_push_payload`` turns a Conversion's stored MISP event plus the
community-evaluation data into exactly what a push sends: the event with
server-assigned fields stripped, the evaluation tags applied, and the
cti-evaluation object injected. Pure - no Flask, no DB, no HTTP - so these
tests feed a lightweight Conversion stand-in (it only reads ``source_format``/
``target_format``/``input_text``/``output_text``/``name``/``uuid``/``id``)
and assert on the returned structure. The known MISP event comes from the
``misp_event`` fixture.
"""

import json
from types import SimpleNamespace

import pytest

from website.lib.exceptions import ValidationFailed
from website.lib.misp import build_misp_push_payload, overall_level

SCORE_MAP = {"very-low": 0, "low": 25, "moderate": 50, "high": 75, "very-high": 100}


def _conversion(misp_text, *, source_format="misp", name="DEMO",
                uuid="11111111-2222-3333-4444-555555555555", id=7):
    """Conversion stand-in. The side the builder must *not* read holds
    undecodable text, so reading the wrong side fails loudly."""
    misp_side_is_input = source_format == "misp"
    return SimpleNamespace(
        id=id, uuid=uuid, name=name,
        source_format=source_format,
        target_format="stix" if misp_side_is_input else "misp",
        input_text=misp_text if misp_side_is_input else "not json",
        output_text="not json" if misp_side_is_input else misp_text
    )


def _relations(cti_obj) -> dict[str, list[str]]:
    """object_relation → list of values (taxonomy-tag repeats)."""
    rels: dict[str, list[str]] = {}
    for attr in cti_obj["Attribute"]:
        rels.setdefault(attr["object_relation"], []).append(attr["value"])
    return rels


def test_builds_the_event_with_eval_tags_and_the_cti_evaluation_object(misp_event):
    conversion = _conversion(json.dumps(misp_event))
    push_tags = ['cti-evaluation:overall-score="high"',
                 'cti-evaluation:accuracy="high"']
    consensus_tags = [{"category": "accuracy", "level": "high", "votes": 3}]
    summary = {"approval_score": 75.0}

    event_dict, cti_obj = build_misp_push_payload(
        conversion, push_tags, consensus_tags, summary)

    # The original event survives, with the eval tags applied on it
    assert event_dict["info"] == "TDD fixture event"
    assert {a["value"] for a in event_dict["Attribute"]} == {"evil.example.com"}
    assert {t["name"] for t in event_dict["Tag"]} >= set(push_tags)

    # The cti-evaluation object is injected into the event and returned isolated
    assert cti_obj["name"] == "cti-evaluation"
    assert cti_obj in event_dict["Object"]
    rels = _relations(cti_obj)
    assert rels["evaluated-artifact"] == ["DEMO"]
    assert rels["evaluation-name"] == ["CTI-Transmute evaluation of DEMO"]
    assert rels["cti-transmute-conversion-id"] == [conversion.uuid]
    assert rels["cti-transmute-link"] == ["https://cti-transmute.org/conversions/7"]
    assert rels["source-format"] == ["MISP"]
    assert rels["target-format"] == ["STIX 2.1"]
    assert rels["overall-score"] == ["high"]
    assert [float(v) for v in rels["overall-score-value"]] == [75.0]
    # Consensus dimensions land as a level + a mapped numeric score
    assert rels["accuracy"] == ["high"]
    assert [float(v) for v in rels["accuracy-score"]] == [float(SCORE_MAP["high"])]
    # One taxonomy-tag per vote tag, sorted
    assert rels["taxonomy-tag"] == sorted(push_tags)


def test_strips_server_assigned_fields_and_never_duplicates_an_existing_tag(misp_event):
    already_tagged = 'cti-evaluation:accuracy="high"'
    misp_event["Event"].update({
        "id": "42", "publish_timestamp": "1704067300",
        "Tag": [{"name": already_tagged}],
    })
    conversion = _conversion(json.dumps(misp_event))

    event_dict, _ = build_misp_push_payload(
        conversion, [already_tagged], [], {})

    assert "id" not in event_dict
    assert "publish_timestamp" not in event_dict
    tag_names = [t["name"] for t in event_dict["Tag"]]
    assert tag_names.count(already_tagged) == 1


@pytest.mark.parametrize("envelope", [
    lambda event: {"Event": event},                    # the canonical wrapper
    lambda event: {"response": [{"Event": event}]},    # restSearch wrapper
    lambda event: [{"Event": event}],                  # list of wrapped events
    lambda event: event,                               # bare event dict
])
def test_accepts_every_misp_envelope_shape(misp_event, envelope):
    conversion = _conversion(json.dumps(envelope(misp_event["Event"])))

    event_dict, cti_obj = build_misp_push_payload(conversion, [], [], {})

    assert event_dict["info"] == "TDD fixture event"
    assert cti_obj["name"] == "cti-evaluation"


def test_a_stix_to_misp_conversion_reads_the_misp_side_output_text(misp_event):
    conversion = _conversion(json.dumps(misp_event), source_format="stix")

    event_dict, cti_obj = build_misp_push_payload(conversion, [], [], {})

    assert event_dict["info"] == "TDD fixture event"
    rels = _relations(cti_obj)
    assert rels["source-format"] == ["STIX 2.1"]
    assert rels["target-format"] == ["MISP"]


def test_without_evaluations_the_object_still_carries_its_identity(misp_event):
    conversion = _conversion(json.dumps(misp_event))

    event_dict, cti_obj = build_misp_push_payload(conversion, [], [], {})

    rels = _relations(cti_obj)
    assert rels["evaluated-artifact"] == ["DEMO"]
    assert "overall-score" not in rels
    assert "overall-score-value" not in rels
    assert "taxonomy-tag" not in rels
    assert rels["taxonomy-reference"] == [
        "https://github.com/MISP/misp-taxonomies/blob/main/cti-evaluation/machinetag.json"]


def test_undecodable_conversion_data_raises_validation_failed():
    with pytest.raises(ValidationFailed, match="Invalid JSON"):
        build_misp_push_payload(_conversion("not json"), [], [], {})


@pytest.mark.parametrize("payload", ["{}", "[]", '{"response": []}', '"just a string"'])
def test_json_without_a_misp_event_raises_validation_failed(payload):
    with pytest.raises(ValidationFailed, match="No MISP Event"):
        build_misp_push_payload(_conversion(payload), [], [], {})


# --- the one parse_tag/overall_level home ------------------------------------

def test_overall_level_extracts_the_overall_score_tag_value():
    tags = ['cti-evaluation:accuracy="high"',
            'cti-evaluation:overall-score="moderate"']
    assert overall_level(tags) == "moderate"


def test_overall_level_is_none_without_an_overall_score_tag():
    assert overall_level(['cti-evaluation:accuracy="high"', 'not a tag']) is None
