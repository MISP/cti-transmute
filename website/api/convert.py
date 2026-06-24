#!/usr/bin/env python3

import json
import logging
from io import BytesIO

from flask import g, request
from flask_restx import Namespace, Resource, reqparse
from pydantic import ValidationError

from cti_transmute import transmute
from cti_transmute.converters.misp_to_stix import MispToStixParams
from cti_transmute.converters.stix_to_misp import StixToMispParams
from cti_transmute.exceptions import (
    ConverterFailed, InvalidParameters, InvalidPayload, UnknownConverter)
from website.lib.auth import api_actor
from website.lib.conversions import submit_conversion
from website.lib.exceptions import PersistenceFailed

logger = logging.getLogger(__name__)

convert_ns = Namespace('convert', description='Conversion operations.')


def _wants_persist() -> bool:
    """Whether the caller opted into persistence via ``?persist=true``."""
    return request.args.get('persist', '').lower() == 'true'


def _as_payload(text):
    """Parse a persisted ``output_text`` back to its JSON value for the envelope.

    Falls back to the raw string for the (converter-dependent) case where the
    output is not JSON.
    """
    try:
        return json.loads(text)
    except (TypeError, json.JSONDecodeError):
        return text


def _get_api_from_namespace():
    for api in convert_ns.apis:
        if api.blueprint and api.blueprint.name == 'transmute_api':
            return api
    raise RuntimeError('No matching Api found for namespace')


def _extract_converters_from_schema(schema: dict) -> dict:
    converters = {}
    for path, methods in schema.get('paths', {}).items():
        for method, meta in methods.items():
            if '/convert/' in path:
                converters[f'/api{path}'] = {
                    'description': meta.get('description'),
                    'method': method.upper(),
                    'parameters': meta.get('parameters', [])
                }
    return {'available': {k: converters[k] for k in sorted(converters)}}


@convert_ns.route('/list')
class ConvertersList(Resource):
    @convert_ns.doc(description='List available converters.')
    def get(self):
        api = _get_api_from_namespace()
        schema = api.__schema__
        return _extract_converters_from_schema(schema), 200


class MispStixConverter(Resource):
    def _load_input_from_request(self) -> BytesIO | dict | list | str:
        input_file = request.files.get('file')
        if input_file and input_file.filename:
            return BytesIO(input_file.read())
        if request.is_json:
            body = request.get_json(silent=True)
            if body is None:
                raise ValueError("Invalid JSON body.")
            if isinstance(body, (dict, list, str)):
                return body
        if request.data:
            try:
                return json.loads(request.data)
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON data.")
        raise ValueError(
            "Unsupported input type; expected Bytes object, array, or string."
        )

    @staticmethod
    def _build_params(params_class, args: dict):
        """Build a Converter's params model from parsed reqparse args.

        reqparse leaves unset args as ``None`` (dropped here, so the model uses
        its own defaults), and yields the *raw query value* for ``store_true``
        flags rather than a bool — so a present boolean flag (the web UI sends it
        as an empty string) is coerced to ``True``. Raises ``ValidationError`` on
        a value the model rejects; the caller maps that to 400.
        """
        bool_fields = {
            name for name, field in params_class.model_fields.items()
            if field.annotation is bool
        }
        supplied = {}
        for key, value in args.items():
            if value is None:
                continue
            supplied[key] = True if key in bool_fields else value
        return params_class(**supplied)

    def _run(self, source: str, target: str, params_class, args: dict):
        """Load the payload, build + validate params, then run or persist.

        Stateless by default (`transmute.convert`); with ``?persist=true`` it
        runs `submit_conversion` and returns an envelope.
        Maps the typed errors to HTTP status codes: a bad payload or
        invalid parameters is 400; an unknown converter 404; a library failure
        (`ConverterFailed`) 422; a persistence failure 500.
        """
        try:
            payload = self._load_input_from_request()
        except ValueError as e:
            return (
                {'message': 'Input validation failed', 'errors': {'input': str(e)}},
                400
            )
        try:
            params = self._build_params(params_class, args)
            if _wants_persist():
                return self._persist(source, target, payload, params)
            return transmute.convert(source, target, payload, params)
        except ValidationError as e:
            return (
                {'message': 'Input validation failed', 'errors': e.errors()},
                400
            )
        except InvalidParameters as e:
            return (
                {'message': 'Input validation failed', 'errors': {'params': str(e)}},
                400
            )
        except InvalidPayload as e:
            return (
                {'message': 'Input validation failed', 'errors': {'input': str(e)}},
                400
            )
        except UnknownConverter as e:
            return (
                {'message': 'Unknown converter', 'errors': {'converter': str(e)}},
                404
            )
        except ConverterFailed as e:
            return (
                {'message': 'Conversion failed', 'errors': {'converter': str(e)}},
                422
            )
        except PersistenceFailed as e:
            return (
                {'message': 'Persistence failed', 'errors': {'persistence': str(e)}},
                500
            )

    def _persist(self, source: str, target: str, payload, params):
        """Convert-and-save via the use-case, returning the ADR-0004 envelope.

        ``g.api_user`` is whatever `@api_actor` resolved from ``X-API-KEY`` — a
        ``User`` or ``None`` (anonymous persistence is allowed; the row gets
        ``user_id IS NULL``).
        """
        conversion = submit_conversion(
            getattr(g, 'api_user', None), source, target, payload, params
        )
        return {
            'conversion': _as_payload(conversion.output_text),
            'id': conversion.id,
            'uuid': conversion.uuid,
            'url': f'/conversions/{conversion.id}',
        }


misp_to_stix_parser = reqparse.RequestParser()
misp_to_stix_parser.add_argument(
    'version', type=str, help='STIX version', location='args',
    choices=('2.0', '2.1'), default='2.1'
)


@convert_ns.route('/misp_to_stix')
@convert_ns.doc(description='Conversion MISP data collection to STIX format.')
class MISPtoSTIX(MispStixConverter):
    @convert_ns.expect(misp_to_stix_parser)
    @api_actor
    def post(self):
        return self._run(
            'misp', 'stix', MispToStixParams, misp_to_stix_parser.parse_args()
        )


stix_to_misp_parser = reqparse.RequestParser()
stix_to_misp_parser.add_argument(
    'distribution', type=int, choices=(0, 1, 2, 3, 4), default=0,
    location='args', help='''
        Distribution level for the imported MISP content (default is 0)
            - 0: Your organisation only
            - 1: This community only
            - 2: Connected communities
            - 3: All communities
            - 4: Sharing Group
        '''
)
stix_to_misp_parser.add_argument(
    'sharing_group_id', type=int, location='args',
    help='Sharing group ID when distribution is 4.'
)
stix_to_misp_parser.add_argument(
    'galaxies_as_tags', action='store_true', location='args',
    help='Import MISP Galaxies as tag names instead of the standard Galaxy format.'
)
stix_to_misp_parser.add_argument(
    'no_force_contextual_data', action='store_true', location='args',
    help=(
        'Do not force the creation of custom Galaxy clusters in some '
        'specific cases when STIX objects could be converted either as '
        'clusters or MISP objects for instance.'
    )
)
stix_to_misp_parser.add_argument(
    'cluster_distribution', type=int, choices=(0, 1, 2, 3, 4), default=0,
    location='args', help='''
            Galaxy Clusters distribution level
            in case of External STIX 2 content (default id 0)
              - 0: Your organisation only
              - 1: This community only
              - 2: Connected communities
              - 3: All communities
              - 4: Sharing Group
        '''
)
stix_to_misp_parser.add_argument(
    'cluster_sharing_group_id', type=int, location='args',
    help='Galaxy Clusters sharing group ID when clusters distribution is 4.'
)
stix_to_misp_parser.add_argument(
    'organisation_uuid', type=str, location='args',
    help='Organisation UUID to use when creating custom Galaxy Clusters.'
)
stix_to_misp_parser.add_argument(
    'single_event', action='store_true', location='args',
    help='Conversion STIX data to a single MISP event in case there are multiple reports/groupings.'
)
stix_to_misp_parser.add_argument(
    'producer', type=str, help='Producer of the STIX data', location='args'
)
stix_to_misp_parser.add_argument(
    'title', type=str, location='args',
    help='Title used to set the MISP Event `info` field.'
)


@convert_ns.route('/stix_to_misp')
@convert_ns.doc(description='Conversion STIX data collection to MISP format.')
class STIXtoMISP(MispStixConverter):
    @convert_ns.expect(stix_to_misp_parser)
    @api_actor
    def post(self):
        return self._run(
            'stix', 'misp', StixToMispParams, stix_to_misp_parser.parse_args()
        )
