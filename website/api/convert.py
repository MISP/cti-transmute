#!/usr/bin/env python3

import json
import logging
from io import BytesIO

from flask import g, request
from flask_restx import Namespace, Resource
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

_TRANSPORT_ARGS = frozenset({'persist'})


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


@convert_ns.route('/list')
class ConvertersList(Resource):
    @convert_ns.doc(description='List available converters.')
    def get(self):
        available = {
            f'/api/convert/{c.source_format}_to_{c.target_format}': {
                'source': c.source_format,
                'target': c.target_format,
                'method': 'POST',
                'description': c.description,
                'params_schema': c.params_class.model_json_schema(),
            }
            for c in transmute.list()
        }
        return {'available': available}, 200


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
    def _build_params(params_class, query_args):
        """Build a Converter's params model from the request query string.

        Params travel in the query string, so values arrive as strings and
        Pydantic coerces them (``"3"`` -> ``3``). A bare boolean flag
        (``?galaxies_as_tags``, or the web UI's empty-string form) carries no
        parseable value, so a *present* boolean field is coerced to ``True``.
        Transport flags (``persist``) are not Converter params and are dropped;
        any other unknown key is left for the model's ``extra="forbid"``
        contract to reject — mirroring the published params_schema's
        ``additionalProperties: false``. Raises ``ValidationError`` on a
        rejected value or unknown key; the caller maps it to the
        ``{error, fields}`` 400.
        """
        bool_fields = {
            name for name, field in params_class.model_fields.items()
            if field.annotation is bool
        }
        supplied = {}
        for key in query_args:
            if key in _TRANSPORT_ARGS:
                continue
            supplied[key] = True if key in bool_fields else query_args[key]
        return params_class(**supplied)

    @staticmethod
    def _param_error(exc: ValidationError):
        """Render a Pydantic ``ValidationError`` as the stable ``{error, fields}``
        400: ``fields`` maps each offending param name to its message, ``error``
        is a short human-readable summary."""
        fields = {}
        for err in exc.errors():
            loc = err.get('loc') or ('params',)
            fields[str(loc[0])] = err['msg']
        return {'error': 'Invalid conversion parameters', 'fields': fields}, 400

    def _run(self, source: str, target: str, params_class):
        """Load the payload, build + validate params, then run or persist.

        Params are read from the query string and validated by constructing the
        Converter's ``params_class``; Pydantic is the sole validator.
        Stateless by default (`transmute.convert`); with ``?persist=true`` it
        runs `submit_conversion` and returns an envelope.
        Maps the typed errors to HTTP status codes: bad params or a bad payload
        is 400; an unknown converter 404; a library failure (`ConverterFailed`)
        422; a persistence failure 500.
        """
        try:
            payload = self._load_input_from_request()
        except ValueError as e:
            return (
                {'message': 'Input validation failed', 'errors': {'input': str(e)}},
                400
            )
        try:
            params = self._build_params(params_class, request.args)
        except ValidationError as e:
            return self._param_error(e)
        try:
            if _wants_persist():
                return self._persist(source, target, payload, params)
            return transmute.convert(source, target, payload, params)
        except InvalidParameters as e:
            return ({'error': str(e), 'fields': {}}, 400)
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
        """Convert-and-save via the use-case, returning the persisted-response
        envelope: the converted payload plus the new Conversion's id, uuid, and URL.

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


@convert_ns.route('/misp_to_stix')
@convert_ns.doc(description='Conversion MISP data collection to STIX format.')
class MISPtoSTIX(MispStixConverter):
    @api_actor
    def post(self):
        return self._run('misp', 'stix', MispToStixParams)


@convert_ns.route('/stix_to_misp')
@convert_ns.doc(description='Conversion STIX data collection to MISP format.')
class STIXtoMISP(MispStixConverter):
    @api_actor
    def post(self):
        return self._run('stix', 'misp', StixToMispParams)
