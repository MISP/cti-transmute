import json
from io import BytesIO
from typing import Any, Literal

from misp_stix_converter import InvalidMISPInputError, MISPtoSTIX20Parser, MISPtoSTIX21Parser
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
    description = "Convert a MISP data collection to STIX format."
    params_class = MispToStixParams

    def process(self, payload: Any, params: BaseModel) -> dict:
        content = _coerce_to_str(payload)
        try:
            json.loads(content)  # JSON-validity gate; MISP-validity is misp-stix's call
        except json.JSONDecodeError as exc:
            raise InvalidPayload(f"Payload is not valid JSON: {exc}") from exc

        parser_cls = (
            MISPtoSTIX20Parser if params.version == "2.0" else MISPtoSTIX21Parser
        )
        parser = parser_cls()
        try:
            parser.parse_json_content(content)
        except InvalidMISPInputError as exc:
            # misp-stix is the authority on what counts as MISP input: it raises
            # this only when the payload matches no supported MISP shape (see
            # misp-stix). Structural "not MISP" -> InvalidPayload (400);
            # a valid-but-empty payload yields 0 objects without raising.
            raise InvalidPayload(str(exc)) from exc
        except Exception as exc:  # noqa: BLE001
            raise ConverterFailed(f"misp-stix-converter failed: {exc}") from exc

        return json.loads(parser.bundle.serialize())
