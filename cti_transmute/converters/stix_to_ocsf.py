"""STIX 2.0/2.1 intelligence and cyber observables to OCSF 1.9.0.

Every source object, including SROs, markings and custom objects, gets an
inventory record. References enrich the mapped fields without dropping the
original graph or interpreting indicator patterns as observations.
"""

from typing import Any

from stix2patterns.validator import run_validator as validate_pattern

from cti_transmute.converter import Converter
from cti_transmute.exceptions import InvalidPayload

from .ocsf import (
    OcsfParams, Report, add_times, apply_tlp, attack, certificate_info, event, file_info,
    fingerprint, indicator, malware, read_json,
)

_SCO_TYPES = {
    "artifact", "autonomous-system", "directory", "domain-name", "email-addr",
    "email-message", "file", "ipv4-addr", "ipv6-addr", "mac-addr", "mutex",
    "network-traffic", "process", "software", "url", "user-account",
    "windows-registry-key", "x509-certificate",
}
_SDO_TYPES = {
    "attack-pattern", "campaign", "course-of-action", "grouping", "identity",
    "incident", "indicator", "infrastructure", "intrusion-set", "location",
    "malware", "malware-analysis", "note", "observed-data", "opinion",
    "report", "threat-actor", "tool", "vulnerability", "language-content",
    "marking-definition", "extension-definition", "relationship", "sighting",
}


def _references(record: dict) -> list[str]:
    return [ref["url"] for ref in record.get("external_references", [])
            if isinstance(ref, dict) and isinstance(ref.get("url"), str)]


def _context(target: dict, record: dict, index: dict[str, dict], report: Report, path: str):
    if record.get("id"):
        target["uid"] = record["id"]
    if record.get("description"):
        target["desc"] = record["description"]
    if record.get("labels"):
        target["labels"] = record["labels"]
    refs = _references(record)
    if refs:
        target["references"] = refs
        target["src_url"] = refs[0]
    creator_ref = record.get("created_by_ref")
    creator = index.get(creator_ref, {})
    if creator_ref:
        target["creator"] = {"uid": creator_ref}
        if creator.get("name"):
            target["creator"]["name"] = creator["name"]
    add_times(target, record, {"created": "created_time", "modified": "modified_time",
                               "valid_until": "expiration_time"})
    if "confidence" in record:
        score = record["confidence"]
        if isinstance(score, int) and not isinstance(score, bool) and 0 <= score <= 100:
            # OCSF OSINT has confidence_id, but no confidence_score. The exact
            # STIX score is kept in the source rather than an invented field.
            target["confidence_id"] = 1 if score < 30 else 2 if score < 70 else 3
        else:
            raise InvalidPayload(f"{path}: STIX confidence must be an integer from 0 to 100.")
    labels = list(record.get("labels", []))
    for ref in record.get("object_marking_refs", []):
        marking = index.get(ref)
        if marking is None:
            report.warn(path, f"Unresolved marking reference {ref}; no sharing permission inferred.")
        elif marking.get("definition_type") == "tlp":
            labels.append("tlp:" + str(marking.get("definition", {}).get("tlp", "")))
        elif marking.get("name", "").upper().startswith("TLP:"):
            labels.append(marking["name"])
    apply_tlp(target, labels)
    # Only Lockheed Martin phases are OCSF kill_chain phases. ATT&CK phases
    # must not be mislabelled with the same numeric identifiers.
    phases = []
    phase_ids = {"reconnaissance": 1, "weaponization": 2, "delivery": 3,
                 "exploitation": 4, "installation": 5, "command-and-control": 6,
                 "actions-on-objectives": 7}
    for phase in record.get("kill_chain_phases", []):
        name = phase.get("phase_name", "")
        phase_id = phase_ids.get(name, 99) if phase.get("kill_chain_name") == "lockheed-martin-cyber-kill-chain" else 99
        phases.append({"phase_id": phase_id, "phase": name})
    if phases:
        target["kill_chain"] = phases


def _entity_context(target: dict, record: dict):
    kind = record["type"]
    name = str(record.get("name") or record.get("id") or kind)
    if kind == "attack-pattern":
        target.setdefault("attacks", []).append(attack(name, record.get("external_references", [])))
    elif kind == "malware":
        target.setdefault("malware", []).append(malware(record))
    elif kind == "threat-actor":
        target["threat_actor"] = {"name": name}
    elif kind == "campaign":
        target["campaign"] = {"name": name}
    elif kind == "intrusion-set":
        target.setdefault("intrusion_sets", []).append(name)
    elif kind == "vulnerability":
        refs = record.get("external_references", [])
        cves = [r["external_id"] for r in refs
                if isinstance(r, dict) and str(r.get("external_id", "")).upper().startswith("CVE-")]
        if name.upper().startswith("CVE-"):
            cves.append(name)
        target["vulnerabilities"] = [
            {"cve": {"uid": uid}, "title": name} for uid in dict.fromkeys(cves)
        ] or [{"title": name}]
    elif kind == "location":
        mapping = {"latitude": "lat", "longitude": "long", "country": "country",
                   "city": "city", "region": "region", "postal_code": "postal_code"}
        location = {dest: record[src] for src, dest in mapping.items() if src in record}
        if location:
            target["location"] = location


def _sco(record: dict, index: dict[str, dict], report: Report, path: str) -> list[dict]:
    kind = record["type"]
    value = record.get("value")
    types = {"ipv4-addr": 1, "ipv6-addr": 1, "domain-name": 2, "url": 5,
             "email-addr": 9, "windows-registry-key": 12, "x509-certificate": 7}
    if kind in types:
        if kind == "windows-registry-key":
            value = record.get("key")
        elif kind == "x509-certificate":
            value = record.get("serial_number") or record.get("subject")
        result = indicator(value if value is not None else record.get("id", kind), types[kind])
        if kind == "x509-certificate" and (cert := certificate_info(record)):
            result["signatures"] = [{"algorithm_id": 0, "certificate": cert}]
        if kind in ("ipv4-addr", "ipv6-addr") and "/" in result["value"]:
            result["subnet"] = result["value"]
        return [result]
    if kind in ("file", "artifact"):
        info = file_info(record, index.get(record.get("parent_directory_ref")))
        results = []
        if record.get("name"):
            results.append(indicator(record["name"], 11))
        for algorithm, value in record.get("hashes", {}).items():
            result = indicator(value, 4)
            result["signatures"] = [{"algorithm_id": 0, "digest": fingerprint(algorithm, value)}]
            results.append(result)
        if not results:
            results.append(indicator(record.get("url") or record.get("id") or kind,
                                     5 if record.get("url") else 99, kind))
            report.warn(path, f"{kind} has no filename or hash; source retained without fabricating one.")
        if info:
            for result in results:
                result["file"] = info
        return results
    if kind == "email-message":
        email = {dest: record[src] for src, dest in {
            "subject": "subject", "message_id": "message_uid", "received_lines": "raw_header"
        }.items() if src in record and src != "received_lines"}
        if record.get("received_lines"):
            email["raw_header"] = "\r\n".join(record["received_lines"])
        for src, dest in (("from_ref", "from"), ("sender_ref", "sender")):
            if ref := index.get(record.get(src), {}).get("value"):
                email[dest] = ref
        for src, dest in (("to_refs", "to"), ("cc_refs", "cc"), ("bcc_refs", "bcc")):
            values = [index[ref]["value"] for ref in record.get(src, [])
                      if ref in index and "value" in index[ref]]
            if values:
                email[dest] = values
        return [{**indicator(record.get("subject") or record.get("message_id") or record.get("id") or kind, 8),
                 "email": email}]
    if kind == "autonomous-system":
        info = {k: record[k] for k in ("number", "name") if k in record}
        return [{**indicator(f"AS{record.get('number', '')}", source_type=kind),
                 "autonomous_system": info}]
    if kind == "process" and record.get("command_line"):
        return [indicator(record["command_line"], 14)]
    if kind == "network-traffic":
        # These describe observable endpoint addresses, not evidence of a live
        # network connection; protocol/port/counters remain in the raw object.
        results = []
        for key in ("src_ref", "dst_ref"):
            ref = index.get(record.get(key), {})
            if ref.get("type") in ("ipv4-addr", "ipv6-addr", "domain-name"):
                results.extend(_sco(ref, index, report, path))
        if results:
            return results
    report.warn(path, f"STIX {kind!r} retained as OSINT Other; no native indicator mapping.")
    return [indicator(record.get("value") or record.get("name") or record.get("id") or kind,
                      source_type=kind)]


def _indicators(record: dict, index: dict[str, dict], report: Report, path: str) -> list[dict]:
    kind = record["type"]
    if kind in _SCO_TYPES:
        return _sco(record, index, report, path)
    if kind == "indicator":
        pattern = record.get("pattern")
        if not isinstance(pattern, str) or not pattern.strip():
            raise InvalidPayload(f"{path}: STIX indicator requires a nonempty pattern.")
        pattern_type = record.get("pattern_type", "stix")
        if pattern_type == "stix":
            problems = validate_pattern(pattern, stix_version=record.get("spec_version", "2.1"))
            if problems:
                raise InvalidPayload(f"{path}: invalid STIX pattern: {'; '.join(problems)}")
        return [{**indicator(pattern, source_type="Detection Pattern"),
                 "detection_pattern": pattern,
                 "detection_pattern_type_id": {"stix": 1, "pcre": 2, "sigma": 3,
                                               "snort": 4, "suricata": 5, "yara": 6}.get(pattern_type, 99),
                 "detection_pattern_type": pattern_type}]
    if kind == "observed-data":
        embedded = record.get("objects", {})
        if not isinstance(embedded, dict) or not all(isinstance(v, dict) for v in embedded.values()):
            raise InvalidPayload(f"{path}: observed-data.objects must be an object of SCOs.")
        local = {**index, **embedded}
        results = []
        for key, obj in embedded.items():
            _validate_record(obj, f"{path}.objects[{key}]")
            if obj.get("type") not in _SCO_TYPES and not obj.get("type", "").startswith("x-"):
                raise InvalidPayload(f"{path}.objects[{key}]: invalid STIX cyber observable type.")
            results.extend(_sco(obj, local, report, f"{path}.objects[{key}]"))
        for ref in record.get("object_refs", []):
            obj = index.get(ref)
            if obj and obj.get("type") in _SCO_TYPES:
                results.extend(_sco(obj, index, report, path))
            elif obj is None:
                report.warn(path, f"Unresolved observable reference {ref}.")
        if results:
            return results
    if kind not in _SDO_TYPES:
        report.warn(path, f"Custom STIX type {kind!r} retained as OSINT Other.")
    else:
        report.warn(path, f"STIX {kind!r} is context rather than an indicator; retained as OSINT Other.")
    return [indicator(record.get("name") or record.get("id") or kind, source_type=kind)]


def _validate_record(record: dict, path: str):
    if not isinstance(record, dict) or not isinstance(record.get("type"), str):
        raise InvalidPayload(f"{path}: STIX objects require a string type.")
    kind = record["type"]
    if kind not in _SCO_TYPES | _SDO_TYPES and not kind.startswith("x-"):
        raise InvalidPayload(f"{path}: unrecognized STIX type {kind!r}.")
    if record.get("spec_version", "2.1") not in ("2.0", "2.1"):
        raise InvalidPayload(f"{path}: only STIX 2.0 and 2.1 are supported.")
    for field in ("labels", "object_refs", "object_marking_refs"):
        if field in record and (not isinstance(record[field], list)
                                or not all(isinstance(v, str) for v in record[field])):
            raise InvalidPayload(f"{path}: {field} must be an array of strings.")
    for field in ("external_references", "kill_chain_phases", "granular_markings"):
        if field in record and (not isinstance(record[field], list)
                                or not all(isinstance(v, dict) for v in record[field])):
            raise InvalidPayload(f"{path}: {field} must be an array of objects.")
    if "hashes" in record and not isinstance(record["hashes"], dict):
        raise InvalidPayload(f"{path}: hashes must be an object.")
    for key, value in record.items():
        if key.endswith("_ref") and not isinstance(value, str):
            raise InvalidPayload(f"{path}: {key} must be a string reference.")
        if key.endswith("_refs") and (not isinstance(value, list) or not all(isinstance(v, str) for v in value)):
            raise InvalidPayload(f"{path}: {key} must be an array of string references.")
    for field in ("name", "description", "value", "pattern", "pattern_type", "key", "serial_number",
                  "subject", "command_line", "mime_type", "message_id"):
        if not kind.startswith("x-") and field in record and not isinstance(record[field], str):
            raise InvalidPayload(f"{path}: {field} must be a string.")
    for field in ("malware_types", "received_lines"):
        if field in record and (not isinstance(record[field], list) or not all(isinstance(v, str) for v in record[field])):
            raise InvalidPayload(f"{path}: {field} must be an array of strings.")
    if "definition" in record and not isinstance(record["definition"], dict):
        raise InvalidPayload(f"{path}: definition must be an object.")
    for field in ("latitude", "longitude"):
        if field in record and (not isinstance(record[field], (int, float)) or isinstance(record[field], bool)):
            raise InvalidPayload(f"{path}: {field} must be a number.")
    for field in ("number", "size"):
        if field in record and (not isinstance(record[field], int) or isinstance(record[field], bool)):
            raise InvalidPayload(f"{path}: {field} must be an integer.")
    for phase in record.get("kill_chain_phases", []):
        if not all(isinstance(phase.get(field), str) for field in ("kill_chain_name", "phase_name")):
            raise InvalidPayload(f"{path}: kill chain phases require string names.")


class StixToOcsf(Converter):
    source_format = "stix"
    target_format = "ocsf"
    output_format = "application/json"
    description = "Convert STIX 2.0/2.1 intelligence and observables to OCSF 1.9.0 OSINT Inventory Info."
    params_class = OcsfParams

    def process(self, payload: Any, params: OcsfParams):
        payload = read_json(payload)
        context = None
        if isinstance(payload, dict) and payload.get("type") == "bundle":
            if payload.get("spec_version", "2.1") not in ("2.0", "2.1"):
                raise InvalidPayload("Only STIX 2.0/2.1 bundles are supported.")
            records = payload.get("objects")
            context = {k: v for k, v in payload.items() if k != "objects"}
        else:
            records = payload if isinstance(payload, list) else [payload]
        if not isinstance(records, list):
            raise InvalidPayload("STIX bundle.objects must be an array.")
        report = Report()
        index = {}
        for i, record in enumerate(records):
            _validate_record(record, f"stix[{i}]")
            uid = record.get("id")
            if uid is not None:
                if not isinstance(uid, str):
                    raise InvalidPayload(f"stix[{i}]: id must be a string.")
                if uid in index:
                    report.warn(uid, "Duplicate STIX id; all source records retained, references resolve to the last occurrence.")
                index[uid] = record
        related: dict[str, list[dict]] = {}
        for record in records:
            if record["type"] == "relationship" and record.get("relationship_type") in {
                "indicates", "uses", "attributed-to", "targets", "exploits", "related-to",
            } and not record.get("revoked"):
                # Only attach explicitly related threat context. The complete
                # SRO, its relationship_type and direction remain in source.
                for src, dst in (("source_ref", "target_ref"), ("target_ref", "source_ref")):
                    other = index.get(record.get(dst))
                    if other and record.get(src):
                        related.setdefault(record[src], []).append(other)
        events = []
        for i, record in enumerate(records):
            path = f"stix[{i}]"
            indicators = _indicators(record, index, report, path)
            for result in indicators:
                _context(result, record, index, report, path)
                _entity_context(result, record)
                for obj in related.get(record.get("id"), []):
                    _entity_context(result, obj)
                    related_tlp = {}
                    _context(related_tlp, obj, index, report, path)
                    if related_tlp.get("tlp"):
                        apply_tlp(result, ["tlp:" + related_tlp["tlp"]])
                if record.get("granular_markings"):
                    report.warn(path, "Granular markings retained in source; selectors are not flattened into event-wide permissions.")
            if record.get("revoked"):
                report.warn(path, "Source is revoked; revocation is preserved in unmapped.stix, not an active indicator status.")
            events.append(event("stix", record, path, indicators,
                                [record.get("modified"), record.get("created"),
                                 record.get("last_observed"), record.get("first_observed"),
                                 record.get("valid_from"), record.get("published")],
                                params, report, context))
        return report.result(events)
