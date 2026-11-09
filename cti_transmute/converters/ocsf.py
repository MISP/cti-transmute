"""Shared OCSF 1.9.0 OSINT Inventory Info (5021) building blocks.

Threat intelligence is inventory, not evidence that an attack occurred. Never
turn an indicator pattern into observed traffic or a detection finding.
"""

import hashlib
import json
import math
from datetime import datetime, timezone
from io import BytesIO
from typing import Any, Literal
from uuid import NAMESPACE_URL, uuid5

from pydantic import BaseModel, ConfigDict, Field

from cti_transmute.converter import ConversionResult
from cti_transmute.exceptions import InvalidPayload

OCSF_VERSION = "1.9.0"


class OcsfParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source_data: Literal["preserve", "omit"] = Field(
        default="preserve", title="Original source data",
        description=(
            "Preserve original records and context in unmapped for fields without "
            "an OCSF equivalent. Omit produces smaller, potentially lossy output."
        ),
    )
    fallback_time: int = Field(
        default=0, ge=0, title="Fallback timestamp (milliseconds)",
        description=(
            "OCSF requires an event time. Used, with a diagnostic, only when "
            "the source contains no usable timestamp. Zero means unknown."
        ),
    )


class Report:
    def __init__(self):
        self.warnings: dict[str, list[str]] = {}
        self.count = 0

    def warn(self, identifier: str, message: str):
        self.count += 1
        if self.count <= 100:
            self.warnings.setdefault(str(identifier), []).append(message)

    def result(self, events: list[dict]) -> ConversionResult:
        diagnostics = {}
        if self.count:
            diagnostics = {
                "warnings": self.warnings, "errors": {},
                "counts": {"warnings": self.count, "errors": 0},
            }
        return ConversionResult(events, diagnostics)


def read_json(payload: Any) -> dict | list:
    try:
        if isinstance(payload, BytesIO):
            payload = payload.getvalue()
        if isinstance(payload, (bytes, bytearray)):
            payload = bytes(payload).decode("utf-8-sig")
        if isinstance(payload, str):
            payload = json.loads(payload)
        # Detach from caller-owned structures; also reject non-JSON Python data.
        payload = json.loads(json.dumps(payload, allow_nan=False))
    except (ValueError, TypeError, UnicodeError, OverflowError) as exc:
        raise InvalidPayload(f"Input must be valid UTF-8 JSON: {exc}") from exc
    if not isinstance(payload, (dict, list)):
        raise InvalidPayload("Expected a JSON object or array.")
    return payload


def text(value: Any) -> str:
    return value if isinstance(value, str) else json.dumps(value, ensure_ascii=False)


def timestamp(value: Any) -> int | None:
    """MISP epoch seconds or STIX RFC 3339, normalized to UTC milliseconds."""
    if value is None or isinstance(value, bool) or value == "":
        return None
    try:
        if isinstance(value, (int, float)) or str(value).replace(".", "", 1).isdigit():
            seconds = float(value)
        else:
            parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            seconds = parsed.replace(tzinfo=parsed.tzinfo or timezone.utc).timestamp()
        if not math.isfinite(seconds):
            return None
        return int(seconds * 1000)
    except (ValueError, TypeError, OverflowError, OSError):
        return None


def event(source: str, record: dict, path: str, indicators: list[dict],
          times: list[Any], params: OcsfParams, report: Report,
          context: dict | None = None) -> dict:
    canonical = json.dumps(record, sort_keys=True, ensure_ascii=True)
    digest = hashlib.sha256(canonical.encode()).hexdigest()
    uid = str(uuid5(NAMESPACE_URL, f"cti-transmute:{source}:{path}:{digest}"))
    when = next((t for v in times if (t := timestamp(v)) is not None), None)
    if when is None:
        when = params.fallback_time
        report.warn(path, "No usable source timestamp; fallback_time used for event time.")
    metadata = {
        "version": OCSF_VERSION,
        "product": {"name": "CTI-Transmute", "vendor_name": "MISP", "version": "1.6"},
        "uid": uid, "log_format": source.upper(),
    }
    original_uid = record.get("uuid") or record.get("id")
    if original_uid is not None:
        metadata["original_event_uid"] = str(original_uid)
    result = {
        "category_uid": 5, "category_name": "Discovery",
        "class_uid": 5021, "class_name": "OSINT Inventory Info",
        "activity_id": 1, "activity_name": "Log",
        "type_uid": 502101, "type_name": "OSINT Inventory Info: Log",
        "severity_id": 0, "severity": "Unknown", "time": when,
        "metadata": metadata, "osint": indicators,
    }
    if source == "misp":
        severity = {"1": (4, "High"), "2": (3, "Medium"), "3": (2, "Low")}.get(str(record.get("threat_level_id")))
        if severity:
            result["severity_id"], result["severity"] = severity
            for item in indicators:
                item["severity_id"], item["severity"] = severity
    if params.source_data == "preserve":
        result["unmapped"] = {source: record}
        if context:
            result["unmapped"]["context"] = context
    else:
        report.warn(path, "Original source omitted; fields without native OCSF mappings are not retained.")
    return result


OSINT_TYPES = {
    0: "Unknown", 1: "IP Address", 2: "Domain", 3: "Hostname", 4: "Hash",
    5: "URL", 6: "User Agent", 7: "Digital Certificate", 8: "Email",
    9: "Email Address", 10: "Vulnerability", 11: "File", 12: "Registry Key",
    13: "Registry Value", 14: "Command Line", 99: "Other",
}

# OCSF fingerprint.algorithm_id, not observable.type_id or OSINT.type_id.
HASH_ALGORITHMS = {
    "md5": 1, "sha1": 2, "sha256": 3, "sha512": 4, "ssdeep": 5,
    "tlsh": 6, "quickxorhash": 7, "sha224": 8, "sha384": 9,
    "sha512/224": 10, "sha512/256": 11, "sha3224": 12, "sha3256": 13,
    "sha3384": 14, "sha3512": 15, "imphash": 18, "hasshmd5": 20,
}


def hash_key(algorithm: str) -> str:
    return algorithm.lower().replace("-", "").replace("_", "")


def fingerprint(algorithm: str, value: Any) -> dict:
    return {"algorithm_id": HASH_ALGORITHMS.get(hash_key(algorithm), 99),
            "algorithm": algorithm, "value": text(value)}


def certificate_info(record: dict) -> dict | None:
    if not record.get("issuer") or not record.get("serial_number"):
        return None
    result = {"issuer": str(record["issuer"]), "serial_number": str(record["serial_number"])}
    for key in ("subject", "version"):
        if record.get(key) is not None:
            result[key] = str(record[key])
    if record.get("hashes"):
        result["fingerprints"] = [fingerprint(k, v) for k, v in record["hashes"].items()]
    add_times(result, record, {"validity_not_before": "created_time", "validity_not_after": "expiration_time"})
    return result


def indicator(value: Any, type_id: int = 99, source_type: str = "Other") -> dict:
    return {"value": text(value), "type_id": type_id,
            "type": source_type if type_id == 99 else OSINT_TYPES[type_id]}


def add_times(target: dict, record: dict, mapping: dict[str, str]):
    for source, dest in mapping.items():
        parsed = timestamp(record.get(source))
        if parsed is not None:
            target[dest] = parsed


TLP_RANK = {"CLEAR": 0, "WHITE": 0, "GREEN": 1, "AMBER": 2,
            "AMBER STRICT": 3, "RED": 4}


def apply_tlp(target: dict, labels: list[str]):
    values = []
    for label in labels:
        normalized = label.upper().replace('"', "").replace("+", " ")
        if normalized.startswith("TLP:") and normalized[4:] in TLP_RANK:
            values.append(normalized[4:])
    if target.get("tlp"):
        values.append(target["tlp"])
    if values:
        target["tlp"] = max(values, key=TLP_RANK.__getitem__)


def attack(name: str, references: list[dict]) -> dict:
    for ref in references:
        uid = ref.get("external_id", "")
        source = ref.get("source_name", "")
        if isinstance(uid, str) and isinstance(source, str) and source.lower().startswith("mitre"):
            part = "tactic" if uid.startswith("TA") else "technique"
            if uid.startswith("T"):
                if "." in uid and part == "technique":
                    return {"technique": {"uid": uid.split(".", 1)[0]},
                            "sub_technique": {"uid": uid, "name": name}}
                return {part: {"uid": uid, "name": name}}
    return {"technique": {"name": name}}


MALWARE_TYPES = {
    "adware": 1, "backdoor": 2, "bot": 3, "bootkit": 4, "ddos": 5,
    "downloader": 6, "dropper": 7, "exploit-kit": 8, "keylogger": 9,
    "ransomware": 10, "remote-access-trojan": 11, "resource-exploitation": 13,
    "rogue-security-software": 14, "rootkit": 15, "screen-capture": 16,
    "spyware": 17, "trojan": 18, "virus": 19, "webshell": 20,
    "wiper": 21, "worm": 22,
}


def malware(record: dict) -> dict:
    classes = record.get("malware_types") or []
    return {"name": str(record.get("name") or record.get("value") or "Malware"),
            "classification_ids": [MALWARE_TYPES.get(v, 99) for v in classes] or [0],
            **({"classifications": classes} if classes else {})}


def file_info(record: dict, parent: dict | None = None) -> dict | None:
    name = record.get("name")
    if not name:
        return None  # OCSF file.name is required; do not invent a filename.
    result = {"name": str(name), "type_id": 1}
    if record.get("hashes"):
        result["hashes"] = [fingerprint(k, v) for k, v in record["hashes"].items()]
    if isinstance(record.get("size"), int) and record["size"] >= 0:
        result["size"] = record["size"]
    if record.get("mime_type"):
        result["mime_type"] = record["mime_type"]
    if parent and parent.get("path"):
        result["parent_folder"] = parent["path"]
    add_times(result, record, {"ctime": "created_time", "mtime": "modified_time",
                               "atime": "accessed_time"})
    return result
