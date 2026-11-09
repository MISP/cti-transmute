"""Bound malicious output fan-out before serialization or persistence."""

import json

import pytest

from cti_transmute import transmute
from cti_transmute.converters import misp_to_ocsf as misp
from cti_transmute.converters import ocsf_limits as limits
from cti_transmute.exceptions import InvalidPayload


def attribute(value="example.org"):
    return {"type": "domain", "value": value}


@pytest.mark.parametrize("source_data", ["preserve", "omit"])
@pytest.mark.parametrize("scope", ["event", "object", "attribute"])
def test_tag_cardinality_is_checked_before_mapping(monkeypatch, source_data, scope):
    monkeypatch.setattr(misp, "MAX_MISP_TAGS_PER_SCOPE", 3)
    tags = [{"name": f"tag-{i}"} for i in range(4)]
    payload = {"info": "test", "Attribute": [attribute()]}
    if scope == "event":
        payload["Tag"] = tags
    elif scope == "object":
        payload["Object"] = [{"name": "domain-ip", "Attribute": [attribute()], "Tag": tags}]
    else:
        payload["Attribute"][0]["Tag"] = tags

    def unexpected(*args):
        pytest.fail("Attribute mapping started before the cardinality check")

    monkeypatch.setattr(misp, "_attribute", unexpected)
    with pytest.raises(InvalidPayload, match="tags per scope"):
        transmute.convert("misp", "ocsf", payload, {"source_data": source_data})


@pytest.mark.parametrize("payload", [
    {"Attribute": [attribute()] * 4},
    {"Object": [{"name": "test", "Attribute": [attribute()] * 4}]},
    [{"Attribute": [attribute()] * 2}, {"Attribute": [attribute()] * 2}],
    {"Object": [{"name": "empty"}] * 4},
])
def test_attribute_and_object_cardinality_is_cumulative(monkeypatch, payload):
    monkeypatch.setattr(misp, "MAX_MISP_ATTRIBUTES", 3)
    with pytest.raises(InvalidPayload, match="attributes/objects limit"):
        transmute.convert("misp", "ocsf", payload)


def test_record_limit_is_checked_before_mapping(monkeypatch):
    monkeypatch.setattr(misp, "MAX_MISP_RECORDS", 2)
    with pytest.raises(InvalidPayload, match="records limit"):
        transmute.convert("misp", "ocsf", [attribute()] * 3)


@pytest.mark.parametrize("scope", ["event", "object"])
def test_inherited_tag_size_is_predicted_before_mapping(monkeypatch, scope):
    # Each cardinality is allowed, but their product is not. Use escaped
    # characters to ensure the preflight counts serialized bytes.
    monkeypatch.setattr(limits, "MAX_MISP_OUTPUT_BYTES", 4096)
    tags = [{"name": f"tag-{i}-" + "\x00" * 40} for i in range(10)]
    record = {"Tag": tags, "Attribute": [attribute()] * 10}
    payload = record if scope == "event" else {"Object": [{"name": "test", **record}]}

    def unexpected(*args):
        pytest.fail("Expanded output was built before its inherited tag size was checked")

    monkeypatch.setattr(misp, "_attribute", unexpected)
    with pytest.raises(InvalidPayload, match="size limit"):
        transmute.convert("misp", "ocsf", payload, {"source_data": "omit"})


def test_actual_output_budget_stops_mapping_mid_record(monkeypatch):
    monkeypatch.setattr(limits, "MAX_MISP_OUTPUT_BYTES", 4096)
    original = misp._attribute
    calls = 0

    def tracked(*args):
        nonlocal calls
        calls += 1
        return original(*args)

    monkeypatch.setattr(misp, "_attribute", tracked)
    with pytest.raises(InvalidPayload, match="size limit"):
        transmute.convert("misp", "ocsf", {"Attribute": [attribute("x" * 100)] * 100},
                          {"source_data": "omit"})
    assert 0 < calls < 100


def test_repeated_file_context_is_included_in_actual_size(monkeypatch):
    monkeypatch.setattr(limits, "MAX_MISP_OUTPUT_BYTES", 32 * 1024)
    attrs = [{"type": "filename", "object_relation": "filename", "value": "sample.exe"}]
    hashes = [("md5", 32), ("sha1", 40), ("sha256", 64), ("sha512", 128), ("sha224", 56), ("sha384", 96)]
    attrs += [{"type": hashes[i % len(hashes)][0], "object_relation": f"hash-{i}",
               "value": format(i, "x").zfill(hashes[i % len(hashes)][1])} for i in range(50)]
    with pytest.raises(InvalidPayload, match="size limit"):
        transmute.convert("misp", "ocsf", {"name": "file", "Attribute": attrs}, {"source_data": "omit"})


@pytest.mark.parametrize("source_data", ["preserve", "omit"])
def test_actual_budget_includes_event_metadata_and_source(monkeypatch, source_data):
    monkeypatch.setattr(limits, "MAX_MISP_OUTPUT_BYTES", 100)
    with pytest.raises(InvalidPayload, match="size limit"):
        transmute.convert("misp", "ocsf", attribute(), {"source_data": source_data})


@pytest.mark.parametrize("payload", [None, True, 123, 1.25, "quote\" slash\\ \x00 é 😀",
    {"unicode-é": [False, None, {"value": "é" * 20000}], "empty": {}}, []])
def test_size_accounting_includes_json_escaping(payload):
    size = len(json.dumps(payload).encode("utf-8"))
    assert limits.json_size(payload, limit=size) == size
    with pytest.raises(InvalidPayload, match="size limit"):
        limits.json_size(payload, limit=size - 1)


def test_large_strings_are_measured_in_bounded_chunks(monkeypatch):
    original = json.dumps
    chunks = []

    def tracked(item, *args, **kwargs):
        if isinstance(item, str):
            chunks.append(len(item))
        return original(item, *args, **kwargs)

    monkeypatch.setattr(limits.json, "dumps", tracked)
    limits.json_size("é" * 100000)
    assert max(chunks) <= 16384


def test_large_tag_and_attribute_reproducer_is_rejected():
    payload = {"info": "fanout", "timestamp": "1704067200",
               "Tag": [{"name": f"tag-{i:04d}"} for i in range(1000)],
               "Attribute": [attribute()] * 4000}
    with pytest.raises(InvalidPayload, match="size limit"):
        transmute.convert("misp", "ocsf", payload, {"source_data": "omit"})
