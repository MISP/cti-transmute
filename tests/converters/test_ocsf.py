"""OCSF output contracts, graph fidelity, and normalized intelligence semantics."""

import copy
import json
from io import BytesIO
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator

from cti_transmute import transmute
from cti_transmute.converters.ocsf import OcsfParams
from cti_transmute.exceptions import InvalidParameters, InvalidPayload

CONTRACT = json.loads((Path(__file__).parents[1] / "fixtures/ocsf/contract-1.9.0.json").read_text())
VALIDATOR = Draft202012Validator(CONTRACT)


def convert(source, payload, params=None):
    result = transmute.convert(source, "ocsf", payload, params)
    for event in result.document:
        VALIDATOR.validate(event)
    return result


@pytest.mark.parametrize("kind,value,type_id", [
    ("ip-src", "192.0.2.1", 1), ("ip-dst|port", "2001:db8::1|443", 1),
    ("domain", "example.org", 2), ("hostname", "host.example.org", 3),
    ("url", "https://example.org/a", 5), ("email-src", "a@example.org", 9),
    ("email-subject", "Subject", 8), ("user-agent", "Mozilla", 6),
    ("sha256", "a" * 64, 4), ("filename|sha256", "sample.exe|" + "a" * 64, 11),
    ("malware-sample", "sample.exe|" + "a" * 32, 11),
    ("regkey|value", "HKLM\\Test|data", 12), ("vulnerability", "CVE-2025-1234", 10),
    ("x509-fingerprint-sha256", "a" * 64, 7), ("AS", "AS12345", 99),
    ("command-line", "cmd.exe /c whoami", 14), ("yara", "rule sample {condition: true}", 99),
    ("future-custom", "custom intelligence", 99),
])
def test_misp_native_mapping(kind, value, type_id):
    payload = {"Event": {"info": "Test intelligence", "timestamp": "1704067200",
                         "Attribute": [{"type": kind, "value": value, "to_ids": False}]}}
    result = convert("misp", payload)
    event = result.document[0]
    assert event["osint"][0]["type_id"] == type_id
    assert event["time"] == 1704067200000
    assert event["unmapped"]["misp"] == payload["Event"]
    assert event["class_uid"] == 5021
    assert "is_alert" not in event


def test_misp_object_context_galaxies_and_restrictive_tlp():
    payload = {"Event": {
        "info": "File intelligence", "timestamp": "1704067200", "distribution": "0",
        "Tag": [{"name": "tlp:green"}],
        "Galaxy": [{"type": "mitre-attack-pattern", "GalaxyCluster": [
            {"value": "Spearphishing", "meta": {"external_id": ["T1566.001"]}}]}],
        "Object": [{"name": "file", "Tag": [{"name": "tlp:amber+strict"}], "Attribute": [
            {"type": "filename", "object_relation": "filename", "value": "sample.exe"},
            {"type": "sha256", "object_relation": "sha256", "value": "a" * 64},
        ], "ObjectReference": [{"referenced_uuid": "other", "relationship_type": "drops"}]}],
        "EventReport": [{"name": "Analysis", "content": "Custom report"}],
    }}
    event = convert("misp", payload).document[0]
    assert event["osint"][0]["file"]["hashes"][0]["algorithm_id"] == 3
    assert event["osint"][0]["attacks"][0]["technique"]["uid"] == "T1566"
    assert event["osint"][0]["attacks"][0]["sub_technique"]["uid"] == "T1566.001"
    assert event["osint"][0]["tlp"] == "AMBER STRICT"
    assert event["unmapped"]["misp"] == payload["Event"]


def test_misp_domain_ip_composite_keeps_both_indicators():
    event = convert("misp", {"type": "domain|ip", "value": "example.org|192.0.2.1"}).document[0]
    assert [(o["type_id"], o["value"]) for o in event["osint"]] == [(2, "example.org"), (1, "192.0.2.1")]


@pytest.mark.parametrize("name,relations,native", [
    ("script", [("script", "text", "print('test')"), ("language", "text", "Python")], "script"),
    ("email", [("from", "email-src", "a@example.org"), ("to", "email-dst", "b@example.org"),
               ("to", "email-dst", "c@example.org"), ("subject", "email-subject", "Hello")], "email"),
    ("whois", [("domain", "domain", "example.org"), ("registrar", "whois-registrar", "Registrar"),
               ("nameserver", "hostname", "ns.example.org")], "whois"),
    ("x509", [("issuer", "text", "CN=issuer"), ("serial-number", "text", "123"),
              ("x509-fingerprint-sha256", "x509-fingerprint-sha256", "a" * 64)], "signatures"),
])
def test_misp_structured_object_enrichment(name, relations, native):
    payload = {"name": name, "Attribute": [{"object_relation": rel, "type": kind, "value": value}
                                           for rel, kind, value in relations]}
    event = convert("misp", payload).document[0]
    assert native in event["osint"][0]
    if name == "email":
        assert len(event["osint"][0]["email"]["to"]) == 2


def test_misp_collection_context_and_threat_level_preserved():
    payload = {"response": [{"Event": {"info": "test", "threat_level_id": "1"}, "custom": "wrapper"}],
               "pagination": {"total": 1}}
    result = convert("misp", payload).document[0]
    assert result["unmapped"]["context"] == {"event_wrapper": {"custom": "wrapper"},
                                             "response_context": {"pagination": {"total": 1}}}
    assert result["severity_id"] == result["osint"][0]["severity_id"] == 4


@pytest.mark.parametrize("wrap", [lambda e: e, lambda e: [e],
    lambda e: {"response": [e]}, lambda e: {"response": {"Attribute": e["Event"]["Attribute"]}}])
def test_misp_input_collections(wrap, misp_event):
    assert convert("misp", wrap(misp_event)).document


@pytest.mark.parametrize("record", [
    {"type": "ipv4-addr", "value": "192.0.2.1"},
    {"type": "ipv6-addr", "value": "2001:db8::1"},
    {"type": "domain-name", "value": "example.org"},
    {"type": "url", "value": "https://example.org/a"},
    {"type": "email-addr", "value": "a@example.org"},
    {"type": "email-message", "subject": "Subject"},
    {"type": "file", "name": "sample.exe", "size": 100, "hashes": {"SHA-256": "a" * 64}},
    {"type": "file", "hashes": {"SHA3-256": "a" * 64}},
    {"type": "artifact", "payload_bin": "SGVsbG8="},
    {"type": "autonomous-system", "number": 12345},
    {"type": "windows-registry-key", "key": "HKLM\\Test"},
    {"type": "x509-certificate", "serial_number": "1234"},
    {"type": "x509-certificate", "serial_number": "1234", "issuer": "CN=issuer", "subject": "CN=subject",
     "hashes": {"SHA-256": "a" * 64}, "validity_not_after": "2030-01-01T00:00:00Z"},
    {"type": "process", "command_line": "python sample.py"},
    {"type": "attack-pattern", "name": "Spearphishing", "external_references": [
        {"source_name": "mitre-attack", "external_id": "T1566.001"}]},
    {"type": "vulnerability", "name": "CVE-2025-1234"},
    {"type": "malware", "name": "Ransomware", "malware_types": ["ransomware"]},
    {"type": "malware", "name": "New malware", "malware_types": ["future-type"]},
    {"type": "threat-actor", "name": "Actor"},
    {"type": "intrusion-set", "name": "Group"},
    {"type": "campaign", "name": "Campaign"},
    {"type": "location", "name": "Place", "country": "FR", "latitude": 48.8},
    {"type": "course-of-action", "name": "Patch"},
    {"type": "infrastructure", "name": "Server"},
    {"type": "identity", "name": "Organization"},
    {"type": "report", "name": "Report", "object_refs": []},
    {"type": "note", "content": "Note"},
    {"type": "opinion", "opinion": "agree"},
    {"type": "sighting", "count": 2},
    {"type": "relationship", "relationship_type": "related-to"},
    {"type": "x-custom", "x_custom_data": {"nested": [1, 2, 3]}},
])
def test_stix_object_types_preserved_and_schema_valid(record):
    before = copy.deepcopy(record)
    event = convert("stix", record).document[0]
    assert event["unmapped"]["stix"] == record == before


def test_stix_indicator_pattern_is_preserved_not_asserted_as_observed_ip():
    pattern = "[ipv4-addr:value = '192.0.2.1' OR domain-name:value = 'example.org'] REPEATS 2 TIMES"
    record = {"type": "indicator", "spec_version": "2.1", "pattern_type": "stix",
              "pattern": pattern, "valid_from": "2024-01-01T01:00:00+01:00",
              "valid_until": "2025-01-01T00:00:00Z", "confidence": 90}
    event = convert("stix", record).document[0]
    osint = event["osint"][0]
    assert osint["value"] == osint["detection_pattern"] == pattern
    assert osint["type_id"] == 99
    assert osint["detection_pattern_type_id"] == 1
    assert osint["confidence_id"] == 3
    assert event["time"] == 1704067200000
    assert osint["expiration_time"] == 1735689600000


@pytest.mark.parametrize("version", ["2.0", "2.1"])
def test_stix_observed_data_resolves_local_and_bundle_references(version):
    address = {"type": "ipv4-addr", "value": "192.0.2.1", "id": "ipv4-addr--address"}
    network = {"type": "network-traffic", "src_ref": address["id"], "id": "network-traffic--network"}
    observed = {"type": "observed-data", "id": "observed-data--observation",
                "first_observed": "2024-01-01T00:00:00Z", "last_observed": "2024-01-02T00:00:00Z",
                "spec_version": version, "number_observed": 2}
    if version == "2.0":
        observed["objects"] = {"0": {"type": "ipv4-addr", "value": "192.0.2.1"},
                               "1": {"type": "network-traffic", "src_ref": "0"}}
        records = [observed]
    else:
        observed["object_refs"] = [network["id"]]
        records = [observed, network, address]
    result = convert("stix", {"type": "bundle", "objects": records})
    assert result.document[0]["osint"][0]["value"] == "192.0.2.1"
    assert result.document[0]["time"] == 1704153600000
    assert len(result.document) == len(records)


def test_stix_graph_enrichment_and_markings():
    records = [
        {"type": "indicator", "id": "indicator--one", "pattern": "[file:name = 'a']",
         "created_by_ref": "identity--org", "object_marking_refs": ["marking-definition--tlp"]},
        {"type": "identity", "id": "identity--org", "name": "Organization"},
        {"type": "marking-definition", "id": "marking-definition--tlp",
         "definition_type": "tlp", "definition": {"tlp": "red"}},
        {"type": "malware", "id": "malware--one", "name": "Example", "malware_types": ["ransomware"]},
        {"type": "relationship", "id": "relationship--one", "relationship_type": "indicates",
         "source_ref": "indicator--one", "target_ref": "malware--one"},
    ]
    payload = {"type": "bundle", "id": "bundle--one", "objects": records, "x_custom": "context"}
    result = convert("stix", payload)
    first = result.document[0]["osint"][0]
    assert first["creator"]["name"] == "Organization"
    assert first["tlp"] == "RED"
    assert first["malware"][0]["classification_ids"] == [10]
    assert [e["unmapped"]["stix"] for e in result.document] == records
    assert result.document[0]["unmapped"]["context"]["x_custom"] == "context"


def test_stix_duplicate_ids_do_not_drop_source_records():
    a = {"type": "identity", "id": "identity--one", "name": "First"}
    b = {**a, "name": "Second"}
    result = convert("stix", [a, b])
    assert len(result.document) == 2
    assert "Duplicate STIX id" in result.diagnostics["warnings"][a["id"]][0]
    assert result.document[0]["metadata"]["uid"] != result.document[1]["metadata"]["uid"]


def test_stix_extension_definition_preserves_the_extended_object_and_bundle(extension_definition):
    file = {"type": "file", "spec_version": "2.1", "name": "sample.exe",
            "id": "file--c6d774d2-dcd6-4ed8-9117-82abfe1146f3",
            "extensions": {extension_definition["id"]: {
                "extension_type": "property-extension", "example_score": 10}}}
    payload = {"type": "bundle", "objects": [file, extension_definition]}
    result = convert("stix", payload)
    assert len(result.document) == 2
    assert result.document[0]["unmapped"]["stix"] == file
    assert result.document[1]["unmapped"]["stix"] == extension_definition
    assert result.document[1]["osint"][0]["type"] == "extension-definition"
    assert convert("stix", extension_definition).document[0]["unmapped"]["stix"] == extension_definition


@pytest.mark.parametrize("source,fixture", [("misp", "misp_event"), ("stix", "stix_bundle")])
def test_serialized_inputs_are_equivalent_and_source_not_mutated(source, fixture, request):
    payload = request.getfixturevalue(fixture)
    before = copy.deepcopy(payload)
    expected = convert(source, payload).document
    data = json.dumps(payload)
    for representation in (data, data.encode(), bytearray(data.encode()), BytesIO(data.encode())):
        assert convert(source, representation).document == expected
    assert payload == before
    assert all("unmapped" not in e for e in convert(source, payload, {"source_data": "omit"}).document)


@pytest.mark.parametrize("source,payload", [
    ("misp", {}), ("misp", {"Event": []}), ("misp", {"Attribute": "bad"}),
    ("misp", {"Attribute": [{"type": "domain"}]}), ("misp", [1]),
    ("stix", {}), ("stix", {"type": "bundle", "objects": {}}),
    ("stix", {"type": "indicator"}), ("stix", {"type": "indicator", "pattern": 1}),
    ("stix", {"type": "identity", "spec_version": "1.2"}),
    ("stix", {"type": "identity", "confidence": 101}),
    ("stix", {"type": "identity", "labels": "bad"}),
    ("stix", {"type": "observed-data", "objects": []}),
    ("stix", {"type": "not-stix"}), ("stix", b'\xff'), ("misp", "not json"),
])
def test_invalid_inputs_raise_typed_payload_errors(source, payload):
    with pytest.raises(InvalidPayload):
        transmute.convert(source, "ocsf", payload)


def test_empty_collections_and_unknown_timestamp():
    assert convert("stix", {"type": "bundle", "objects": []}).document == []
    assert convert("misp", {"response": []}).document == []
    result = convert("misp", {"type": "domain", "value": "example.org"}, {"fallback_time": 123})
    assert result.document[0]["time"] == 123
    assert result.diagnostics["counts"]["warnings"] == 1


def test_parameters_forbid_unimplemented_versions_and_unknown_fields():
    with pytest.raises(InvalidParameters):
        transmute.convert("misp", "ocsf", {}, {"version": "1.10.0"})
    assert OcsfParams().source_data == "preserve"
