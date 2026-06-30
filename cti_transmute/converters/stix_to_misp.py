import json
from typing import Any, Optional

from misp_stix_converter.tools import (
    get_stix2_parser,
    is_stix2_from_misp,
    load_stix2_content,
)
from pydantic import BaseModel, ConfigDict, Field

from cti_transmute.converter import Converter
from cti_transmute.exceptions import ConverterFailed, InvalidPayload


class StixToMispParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    distribution: int = Field(default=0, ge=0, le=4)
    # the "required when distribution == 4" relationship is carried as a
    # description only — semantic/cross-field validity is the target tool's job.
    sharing_group_id: Optional[int] = Field(
        default=None,
        description="Sharing group ID; required by MISP when distribution is 4.",
    )
    galaxies_as_tags: bool = False
    no_force_contextual_data: bool = False
    cluster_distribution: int = Field(default=0, ge=0, le=4)
    cluster_sharing_group_id: Optional[int] = Field(
        default=None,
        description=(
            "Galaxy clusters sharing group ID; required by MISP when "
            "cluster_distribution is 4."
        ),
    )
    organisation_uuid: Optional[str] = None
    single_event: bool = False
    producer: Optional[str] = None
    title: Optional[str] = None


class StixToMisp(Converter):
    source_format = "stix"
    target_format = "misp"
    output_format = "application/json"
    description = "Convert a STIX data collection to MISP format."
    params_class = StixToMispParams

    def process(self, payload: Any, params: BaseModel) -> dict | list:
        invalid_objects: dict = {}
        try:
            bundle = load_stix2_content(payload, invalid_objects)
        except Exception as exc:  # noqa: BLE001
            raise InvalidPayload(
                f"Input could not be parsed as STIX: {exc}"
            ) from exc

        try:
            parser_cls, arguments = get_stix2_parser(
                is_stix2_from_misp(bundle.objects),
                params.distribution,
                params.sharing_group_id,
                params.title,
                params.producer,
                not params.no_force_contextual_data,
                params.galaxies_as_tags,
                params.single_event,
                params.organisation_uuid,
                params.cluster_distribution,
                params.cluster_sharing_group_id,
            )
            stix_parser = parser_cls()
            stix_parser.load_stix_bundle(bundle, invalid_objects=invalid_objects)
            stix_parser.parse_stix_bundle(**arguments)
        except Exception as exc:  # noqa: BLE001
            raise ConverterFailed(
                f"misp-stix-converter failed: {exc}"
            ) from exc

        if params.single_event:
            return json.loads(stix_parser.misp_event.to_json())
        if isinstance(stix_parser.misp_events, list):
            return [
                json.loads(event.to_json())
                for event in stix_parser.misp_events
            ]
        return json.loads(stix_parser.misp_event.to_json())
