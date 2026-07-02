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

# The MISP distribution levels, labelled once here on the Converter so
# every param surface renders the same choices from the schema rather than
# hardcoding them. Published as JSON-Schema ``oneOf: [{const, title}]``; the
# ``ge=0, le=4`` constraint below stays the validator, so the endpoint and the
# published schema agree on which values are accepted (round-trip parity).
_DISTRIBUTION_ONEOF = [
    {"const": 0, "title": "0 – Your organisation only"},
    {"const": 1, "title": "1 – This community only"},
    {"const": 2, "title": "2 – Connected communities"},
    {"const": 3, "title": "3 – All communities"},
    {"const": 4, "title": "4 – Sharing group"},
]


class StixToMispParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    distribution: int = Field(
        default=0, ge=0, le=4, title="Distribution Level",
        description="Distribution level for the imported MISP content.",
        json_schema_extra={"oneOf": _DISTRIBUTION_ONEOF},
    )
    # ``enabledWhen`` is a UI-only affordance (presentation hint): the
    # param surface greys this field out unless distribution == 4. It is NOT
    # validation — the server stays shape-only and the target tool owns the
    # "required when distribution == 4" semantics.
    sharing_group_id: Optional[int] = Field(
        default=None, title="Sharing Group ID",
        description="Sharing group ID; required by MISP when distribution is 4.",
        json_schema_extra={
            "enabledWhen": {"field": "distribution", "equals": 4},
            "placeholder": "Only if distribution = 4",
        },
    )
    cluster_distribution: int = Field(
        default=0, ge=0, le=4, title="Cluster Distribution Level",
        description=(
            "Galaxy clusters distribution level for external STIX 2 content."
        ),
        json_schema_extra={"oneOf": _DISTRIBUTION_ONEOF},
    )
    cluster_sharing_group_id: Optional[int] = Field(
        default=None, title="Cluster Sharing Group ID",
        description=(
            "Galaxy clusters sharing group ID; required by MISP when "
            "cluster_distribution is 4."
        ),
        json_schema_extra={
            "enabledWhen": {"field": "cluster_distribution", "equals": 4},
            "placeholder": "Only if cluster distribution = 4",
        },
    )
    organisation_uuid: Optional[str] = Field(
        default=None, title="Organisation UUID",
        description="Organisation UUID to use when creating custom Galaxy clusters.",
        json_schema_extra={"placeholder": "Organisation UUID (optional)"},
    )
    producer: Optional[str] = Field(
        default=None, title="Producer", description="Producer of the STIX data.",
        json_schema_extra={"placeholder": "Producer of the STIX data"},
    )
    # ``fullWidth`` (presentation hint): render on its own full-width row.
    title: Optional[str] = Field(
        default=None, title="Title",
        description="Title used to set the MISP Event `info` field.",
        json_schema_extra={
            "fullWidth": True,
            "placeholder": "Optional title for the resulting MISP Event",
        },
    )
    # Boolean switches declared last so the schema-driven surface groups them
    # together at the bottom (render order = field declaration order).
    galaxies_as_tags: bool = Field(
        default=False, title="Galaxies as Tags",
        description=(
            "Import MISP Galaxies as tag names instead of the standard "
            "Galaxy format."
        ),
    )
    no_force_contextual_data: bool = Field(
        default=False, title="No Force Contextual Data",
        description=(
            "Do not force the creation of custom Galaxy clusters when ambiguous."
        ),
    )
    single_event: bool = Field(
        default=False, title="Single Event",
        description=(
            "Convert STIX data to a single MISP event if multiple "
            "reports/groupings exist."
        ),
    )


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
