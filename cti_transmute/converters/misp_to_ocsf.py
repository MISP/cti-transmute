"""MISP events, attribute searches and objects to OCSF threat intelligence."""

from typing import Any

from cti_transmute.converter import Converter
from cti_transmute.exceptions import InvalidPayload

from .ocsf import (
    HASH_ALGORITHMS, OcsfParams, Report, add_times, apply_tlp, attack, event,
    certificate_info, file_info, fingerprint, hash_key, indicator, malware, read_json, text,
)


def _tags(record: dict) -> list[str]:
    tags = record.get("Tag", [])
    if not isinstance(tags, list):
        raise InvalidPayload("MISP Tag must be an array.")
    if not all(isinstance(tag, dict) and isinstance(tag.get("name"), str) for tag in tags):
        raise InvalidPayload("MISP tags require a string name.")
    return [tag["name"] for tag in tags]


def _galaxies(target: dict, record: dict):
    galaxies = record.get("Galaxy", [])
    if not isinstance(galaxies, list) or not all(isinstance(g, dict) for g in galaxies):
        raise InvalidPayload("MISP Galaxy must be an array of objects.")
    for galaxy in galaxies:
        clusters = galaxy.get("GalaxyCluster", [])
        if not isinstance(clusters, list) or not all(isinstance(c, dict) for c in clusters):
            raise InvalidPayload("MISP GalaxyCluster must be an array of objects.")
        for cluster in clusters:
            kind = str(galaxy.get("type", "")).lower()
            value = str(cluster.get("value", ""))
            meta = cluster.get("meta") or {}
            if not isinstance(meta, dict):
                raise InvalidPayload("MISP galaxy cluster meta must be an object.")
            refs = meta.get("refs") or []
            if not isinstance(refs, list) or not all(isinstance(r, str) for r in refs):
                raise InvalidPayload("MISP galaxy refs must be an array of strings.")
            if refs:
                target.setdefault("references", []).extend(refs)
            if "attack-pattern" in kind or "mitre-tactic" in kind:
                ids = meta.get("external_id") or []
                if isinstance(ids, str):
                    ids = [ids]
                target.setdefault("attacks", []).append(attack(value, [
                    {"source_name": "mitre-attack", "external_id": uid} for uid in ids
                ]))
            elif "malware" in kind or "ransomware" in kind:
                target.setdefault("malware", []).append(malware(cluster))
            elif "threat-actor" in kind:
                target["threat_actor"] = {"name": value}
            elif "intrusion-set" in kind:
                target.setdefault("intrusion_sets", []).append(value)
            elif "campaign" in kind:
                target["campaign"] = {"name": value}


def _attribute(attr: dict, context: dict, report: Report, path: str) -> list[dict]:
    kind = attr.get("type")
    if not isinstance(kind, str) or "value" not in attr or attr["value"] is None:
        raise InvalidPayload(f"{path}: MISP attributes require type and value.")
    value = text(attr["value"])
    result = indicator(value, source_type=kind)
    known = True
    if kind in ("ip-src", "ip-dst", "ip", "ip-src|port", "ip-dst|port"):
        result = indicator(value.rsplit("|", 1)[0], 1)
        if "/" in result["value"]:
            result["subnet"] = result["value"]
    elif kind in ("domain", "hostname", "domain|ip", "hostname|port"):
        result = indicator(value.split("|", 1)[0], 3 if kind.startswith("hostname") else 2)
    elif kind in ("url", "uri", "link"):
        result = indicator(value, 5)
    elif kind == "user-agent":
        result = indicator(value, 6)
    elif kind in ("email", "email-src", "email-dst", "whois-registrant-email"):
        result = indicator(value, 9)
    elif kind.startswith("email-"):
        result = indicator(value, 8)
        field = {"email-subject": "subject", "email-header": "raw_header",
                 "email-message-id": "message_uid", "email-reply-to": "reply_to"}.get(kind)
        if field:
            result["email"] = {field: value}
    elif kind in ("filename", "attachment", "malware-sample") or kind.startswith("filename|"):
        name = value.split("|", 1)[0]
        result = indicator(name, 11)
        data = {"name": name}
        if "|" in value:
            algorithm = "md5" if kind == "malware-sample" else kind.split("|", 1)[1]
            data["hashes"] = {algorithm: value.split("|", 1)[1]}
        if info := file_info(data):
            result["file"] = info
    elif hash_key(kind) in HASH_ALGORITHMS or kind in ("authentihash", "pehash", "telfhash", "vhash"):
        result = indicator(value, 4)
        result["signatures"] = [{"algorithm_id": 0, "digest": fingerprint(kind, value)}]
    elif kind.startswith("x509-fingerprint"):
        result = indicator(value, 7)
    elif kind in ("regkey", "regkey|value"):
        result = indicator(value.split("|", 1)[0], 12)
    elif kind == "vulnerability":
        result = indicator(value, 10)
        if value.upper().startswith("CVE-"):
            result["vulnerabilities"] = [{"cve": {"uid": value}}]
    elif kind == "AS":
        number = value.upper().removeprefix("AS")
        if number.isdigit():
            result["autonomous_system"] = {"number": int(number)}
    elif kind in ("command-line", "shell-command"):
        result = indicator(value, 14)
    elif kind in ("yara", "sigma", "snort", "suricata", "stix2-pattern"):
        result.update({"detection_pattern": value,
                       "detection_pattern_type_id": {"stix2-pattern": 1, "sigma": 3,
                                                     "snort": 4, "suricata": 5, "yara": 6}[kind]})
    else:
        known = False
    if not known:
        report.warn(path, f"MISP type {kind!r} retained as OSINT Other; no native mapping.")
    if attr.get("uuid"):
        result["uid"] = str(attr["uuid"])
    if attr.get("comment"):
        result["comment"] = str(attr["comment"])
    if attr.get("category"):
        result["category"] = str(attr["category"])
    labels = list(dict.fromkeys(_tags(context) + _tags(attr)))
    if labels:
        result["labels"] = labels
    apply_tlp(result, labels)
    add_times(result, attr, {"timestamp": "modified_time", "first_seen": "created_time"})
    org = context.get("Orgc") or context.get("Org") or {}
    if not isinstance(org, dict):
        raise InvalidPayload("MISP organization must be an object.")
    if org.get("name"):
        result["creator"] = {"org": {"name": str(org["name"])}}
    if context.get("info"):
        result["desc"] = str(context["info"])
    _galaxies(result, context)
    _galaxies(result, attr)
    results = [result]
    # Composite values carry two different indicators. Preserve both, and the
    # original composite (including ports/semantics) in the source record.
    if kind == "domain|ip" and "|" in value:
        results.append({**result, **indicator(value.split("|", 1)[1], 1)})
    if kind == "regkey|value" and "|" in value:
        results.append({**result, **indicator(value.split("|", 1)[1], 13)})
    return results


def _object(obj: dict, context: dict, report: Report, path: str) -> list[dict]:
    attributes = obj.get("Attribute", [])
    if not isinstance(attributes, list) or not all(isinstance(a, dict) for a in attributes):
        raise InvalidPayload(f"{path}: Object.Attribute must be an array of objects.")
    if any("object_relation" in a and not isinstance(a["object_relation"], str) for a in attributes):
        raise InvalidPayload(f"{path}: object_relation must be a string.")
    results = [value for i, attr in enumerate(attributes)
               for value in _attribute(attr, context, report, f"{path}.Attribute[{i}]")]
    relations = {a.get("object_relation"): a.get("value") for a in attributes}
    if obj.get("name") in ("file", "pe", "elf", "macho"):
        hashes = {a["type"]: a["value"] for a in attributes if hash_key(a.get("type", "")) in HASH_ALGORITHMS}
        data = {"name": relations.get("filename"), "hashes": hashes,
                "mime_type": relations.get("mimetype"),
                "ctime": relations.get("creation-time"), "mtime": relations.get("modification-time"),
                "atime": relations.get("access-time")}
        if str(relations.get("size-in-bytes", "")).isdigit():
            data["size"] = int(relations["size-in-bytes"])
        info = file_info(data)
        if info:
            if relations.get("fullpath") or relations.get("path"):
                info["path"] = str(relations.get("fullpath") or relations["path"])
            for result in results:
                result["file"] = info
    if obj.get("name") == "email":
        email = {dest: str(relations[src]) for src, dest in {
            "from": "from", "subject": "subject", "message-id": "message_uid",
            "header": "raw_header", "reply-to": "reply_to", "return-path": "return_path",
        }.items() if src in relations}
        for relation in ("to", "cc", "bcc"):
            addresses = [text(a["value"]) for a in attributes if a.get("object_relation") == relation]
            if addresses:
                email[relation] = addresses
        for result in results:
            result["email"] = email
    if obj.get("name") == "whois":
        whois = {dest: str(relations[src]) for src, dest in {
            "domain": "domain", "registrar": "registrar", "registrant-email": "email_addr",
            "registrant-phone": "phone_number",
        }.items() if src in relations}
        servers = [text(a["value"]) for a in attributes if a.get("object_relation") == "nameserver"]
        if servers:
            whois["name_servers"] = servers
        add_times(whois, relations, {"creation-date": "created_time", "modification-date": "last_seen_time"})
        for result in results:
            result["whois"] = whois
    if obj.get("name") == "script" and relations.get("script"):
        language = str(relations.get("language", "Unknown"))
        script = {"script_content": {"value": text(relations["script"])}, "type": language,
                  "type_id": {"powershell": 2, "python": 3, "javascript": 4,
                              "vbscript": 5, "bash": 6, "shell": 6, "vba": 7}.get(language.lower(), 99)}
        if relations.get("filename"):
            script["name"] = str(relations["filename"])
        for result in results:
            result["script"] = script
    if obj.get("name") == "x509":
        cert = certificate_info({"issuer": relations.get("issuer"), "serial_number": relations.get("serial-number"),
                                 "subject": relations.get("subject"), "version": relations.get("version"),
                                 "validity_not_before": relations.get("validity-not-before"),
                                 "validity_not_after": relations.get("validity-not-after"),
                                 "hashes": {a["type"].removeprefix("x509-fingerprint-"): a["value"]
                                            for a in attributes if a["type"].startswith("x509-fingerprint-")}})
        if cert:
            for result in results:
                result["signatures"] = [{"algorithm_id": 0, "certificate": cert}]
    if not results:
        result = indicator(obj.get("name") or obj.get("uuid") or "MISP object", source_type="MISP object")
        if obj.get("uuid"):
            result["uid"] = str(obj["uuid"])
        results.append(result)
        report.warn(path, "Object has no attributes; retained as OSINT Other.")
    for result in results:
        _galaxies(result, obj)
        labels = list(dict.fromkeys(result.get("labels", []) + _tags(obj)))
        if labels:
            result["labels"] = labels
        apply_tlp(result, labels)
    return results


def _records(payload: dict | list) -> list[tuple[dict, dict]]:
    if isinstance(payload, dict) and "response" in payload:
        extra = {k: v for k, v in payload.items() if k != "response"}
        return [(record, {**context, **({"response_context": extra} if extra else {})})
                for record, context in _records(payload["response"])]
    if isinstance(payload, list):
        return [record for item in payload for record in _records(item)]
    if not isinstance(payload, dict):
        raise InvalidPayload("MISP input must contain objects.")
    if "Event" in payload:
        if not isinstance(payload["Event"], dict):
            raise InvalidPayload("MISP Event must be an object.")
        extra = {k: v for k, v in payload.items() if k != "Event"}
        return [(payload["Event"], {"event_wrapper": extra} if extra else {})]
    if "info" in payload or ("type" in payload and "value" in payload) or "Attribute" in payload or "Object" in payload:
        return [(payload, {})]
    raise InvalidPayload("Expected MISP Event, attribute, object, or restSearch collection.")


class MispToOcsf(Converter):
    source_format = "misp"
    target_format = "ocsf"
    output_format = "application/json"
    description = "Convert MISP events, attributes and objects to OCSF 1.9.0 OSINT Inventory Info."
    params_class = OcsfParams

    def process(self, payload: Any, params: OcsfParams):
        payload = read_json(payload)
        report = Report()
        events = []
        for i, (record, context) in enumerate(_records(payload)):
            path = f"misp[{i}]"
            attrs, objects = record.get("Attribute", []), record.get("Object", [])
            if not isinstance(attrs, list) or not isinstance(objects, list):
                raise InvalidPayload(f"{path}: Attribute and Object must be arrays.")
            if not all(isinstance(a, dict) for a in attrs + objects):
                raise InvalidPayload(f"{path}: Attribute and Object entries must be objects.")
            if "type" in record and "value" in record:
                indicators = _attribute(record, {}, report, path)
            elif "name" in record and "info" not in record and "Attribute" in record:
                indicators = _object(record, {}, report, path)
            else:
                indicators = [value for j, a in enumerate(attrs)
                              for value in _attribute(a, record, report, f"{path}.Attribute[{j}]")]
                indicators.extend(value for j, obj in enumerate(objects)
                                  for value in _object(obj, record, report, f"{path}.Object[{j}]"))
            if not indicators:
                info = indicator(record.get("info") or record.get("uuid") or "MISP event", source_type="MISP event")
                _galaxies(info, record)
                info["labels"] = _tags(record)
                apply_tlp(info, info["labels"])
                indicators = [info]
                report.warn(path, "No indicator attributes; event context retained as OSINT Other.")
            events.append(event("misp", record, path, indicators,
                                [record.get("timestamp"), record.get("date"),
                                 record.get("publish_timestamp"), *[a.get("timestamp") for a in attrs]],
                                params, report, context))
        return report.result(events)
