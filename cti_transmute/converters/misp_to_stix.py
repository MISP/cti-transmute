import json
from io import BytesIO
from typing import Any, Literal

from misp_stix_converter import MISPtoSTIX20Parser, MISPtoSTIX21Parser
from pydantic import BaseModel, ConfigDict

from cti_transmute.converter import Converter
from cti_transmute.exceptions import ConverterFailed, InvalidPayload


class MispToStixParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: Literal["2.0", "2.1"] = "2.1"


def _coerce_to_str(payload: Any) -> str:
    if isinstance(payload, BytesIO):
        return payload.getvalue().decode("utf-8")
    if isinstance(payload, (bytes, bytearray)):
        return bytes(payload).decode("utf-8")
    if isinstance(payload, (dict, list)):
        return json.dumps(payload)
    if isinstance(payload, str):
        return payload
    raise InvalidPayload(f"Unsupported payload type: {type(payload).__name__}")


class MispToStix(Converter):
    source_format = "misp"
    target_format = "stix"
    output_format = "application/json"
    params_class = MispToStixParams

    def execute(self, payload: Any, params: BaseModel) -> dict:
        content = _coerce_to_str(payload)
        try:
            decoded = json.loads(content)
        except json.JSONDecodeError as exc:
            raise InvalidPayload(f"Payload is not valid JSON: {exc}") from exc

        _assert_looks_like_misp(decoded)

        parser_cls = (
            MISPtoSTIX20Parser if params.version == "2.0" else MISPtoSTIX21Parser
        )
        parser = parser_cls()
        try:
            parser.parse_json_content(content)
        except Exception as exc:  # noqa: BLE001
            raise ConverterFailed(f"misp-stix-converter failed: {exc}") from exc

        return json.loads(parser.bundle.serialize())


def _assert_looks_like_misp(decoded: Any) -> None:
    """Reject input that has no chance of being a MISP event.

    misp-stix-converter logs warnings on bad input but produces a near-empty
    bundle rather than raising — leaving the caller unable to tell success
    from a silent failure. We pre-check the obvious shape signals.
    """
    if isinstance(decoded, dict):
        if "Event" in decoded or "response" in decoded:
            return
    if isinstance(decoded, list):
        return
    raise InvalidPayload(
        "Input does not look like a MISP event "
        "(expected an object with an 'Event' or 'response' key, or a list)."
    )
