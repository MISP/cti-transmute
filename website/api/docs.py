#!/usr/bin/env python3

"""OpenAPI documentation helpers for the API routes.

Documentation only: nothing here changes what a route accepts or returns. It
describes it, so ``/api/swagger.json`` (read by Swagger UI at ``/api`` and by
the Vitrine reference on ``/list``) shows the request body, the query
parameters, the authentication header and the error answers.

Converter query parameters are generated from the Converter's own Pydantic
params model, so the documentation can never drift from what is validated.
"""

import types
import typing
from typing import Literal, get_args, get_origin

from pydantic import BaseModel

#: Swagger 2.0 security definition for the optional ``X-API-KEY`` header.
AUTHORIZATIONS = {
    'apikey': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'X-API-KEY',
        'description': (
            'Optional. Without it the API acts anonymously (public Conversions '
            'only); with a valid key it acts as that user. A wrong key is 403.'
        ),
    }
}

_SCALAR = {str: 'string', int: 'integer', bool: 'boolean', float: 'number'}


def _swagger_type(annotation):
    """Swagger type (and enum) for a params field annotation."""
    if get_origin(annotation) in (typing.Union, types.UnionType):
        non_none = [a for a in get_args(annotation) if a is not type(None)]
        annotation = non_none[0] if non_none else str
    if get_origin(annotation) is Literal:
        values = list(get_args(annotation))
        return _SCALAR.get(type(values[0]), 'string'), values
    return _SCALAR.get(annotation, 'string'), None


def converter_query_params(params_class: type[BaseModel]) -> dict:
    """``@ns.doc(params=...)`` entries for a Converter's query parameters."""
    out = {}
    for name, field in params_class.model_fields.items():
        kind, enum = _swagger_type(field.annotation)
        entry = {'in': 'query', 'type': kind, 'description': field.description or ''}
        if enum:
            entry['enum'] = enum
        if field.default is not None and not callable(field.default):
            entry['default'] = field.default
        out[name] = entry
    out['persist'] = {
        'in': 'query', 'type': 'boolean', 'default': False,
        'description': 'Save the result as a Conversion and return an envelope '
                       '{conversion, diagnostics, id, uuid, url}.',
    }
    out['diagnostics'] = {
        'in': 'query', 'type': 'boolean', 'default': False,
        'description': 'Return {conversion, diagnostics} instead of the bare converted document.',
    }
    return out


#: JSON Schema of the documents a conversion accepts (as request bodies).
MISP_EVENT_SCHEMA = {
    'type': 'object',
    'description': 'A MISP event, as exported by MISP (`{"Event": {...}}`). '
                   'Can also be sent as a `file` field (multipart/form-data).',
    'required': ['Event'],
    'properties': {
        'Event': {
            'type': 'object',
            'required': ['info'],
            'properties': {
                'uuid': {'type': 'string', 'format': 'uuid'},
                'info': {'type': 'string', 'description': 'Event title.'},
                'date': {'type': 'string', 'format': 'date'},
                'Attribute': {'type': 'array', 'items': {'type': 'object', 'properties': {
                    'type': {'type': 'string'}, 'category': {'type': 'string'},
                    'value': {'type': 'string'}, 'to_ids': {'type': 'boolean'}}}},
                'Object': {'type': 'array', 'items': {'type': 'object'}},
                'Tag': {'type': 'array', 'items': {'type': 'object', 'properties': {'name': {'type': 'string'}}}},
            },
        }
    },
    'example': {
        'Event': {
            'info': 'Phishing campaign', 'date': '2026-01-01',
            'Attribute': [{'type': 'domain', 'category': 'Network activity',
                           'value': 'evil.example.com', 'to_ids': True}],
        }
    },
}

STIX_BUNDLE_SCHEMA = {
    'type': 'object',
    'description': 'A STIX 2.0 or 2.1 bundle. Can also be sent as a `file` '
                   'field (multipart/form-data).',
    'required': ['type', 'objects'],
    'properties': {
        'type': {'type': 'string', 'enum': ['bundle']},
        'id': {'type': 'string', 'description': 'bundle--<uuid>'},
        'objects': {'type': 'array', 'items': {'type': 'object', 'properties': {
            'type': {'type': 'string'}, 'id': {'type': 'string'}, 'spec_version': {'type': 'string'}}}},
    },
    'example': {
        'type': 'bundle', 'id': 'bundle--00000000-0000-4000-8000-000000000001',
        'objects': [{
            'type': 'indicator', 'spec_version': '2.1',
            'id': 'indicator--00000000-0000-4000-8000-000000000002',
            'created': '2026-01-01T00:00:00Z', 'modified': '2026-01-01T00:00:00Z',
            'pattern': "[domain-name:value = 'evil.example.com']",
            'pattern_type': 'stix', 'valid_from': '2026-01-01T00:00:00Z',
        }],
    },
}

#: Error answers shared by the conversion routes.
CONVERT_RESPONSES = {
    200: 'The converted document (or the envelope with ?persist / ?diagnostics). '
         'X-Transmute-Warnings / X-Transmute-Errors headers when the converter reported anything.',
    400: 'Invalid input document or parameters: {message, errors} or {error, fields}.',
    403: 'Invalid X-API-KEY.',
    404: 'Unknown converter.',
    422: 'The converter could not convert this document.',
    500: 'The conversion succeeded but could not be saved (?persist=true).',
}

#: Query parameters of the Conversion list.
CONVERSION_LIST_PARAMS = {
    'page': {'in': 'query', 'type': 'integer', 'default': 1, 'description': 'Page number.'},
    'q': {'in': 'query', 'type': 'string', 'description': 'Search text.'},
    'search_scope': {'in': 'query', 'type': 'string', 'enum': ['all', 'name', 'description', 'content'],
                     'default': 'all', 'description': 'Where to search.'},
    'exact_match': {'in': 'query', 'type': 'boolean', 'description': 'Match the exact phrase.'},
    'tags': {'in': 'query', 'type': 'string', 'description': 'Comma-separated tag names; a Conversion must carry all of them.'},
    'date_from': {'in': 'query', 'type': 'string', 'format': 'date', 'description': 'Created on or after (yyyy-mm-dd).'},
    'date_to': {'in': 'query', 'type': 'string', 'format': 'date', 'description': 'Created on or before (yyyy-mm-dd).'},
    'sort': {'in': 'query', 'type': 'string', 'enum': ['desc', 'asc'], 'default': 'desc', 'description': 'By creation date.'},
    'visibility': {'in': 'query', 'type': 'string', 'enum': ['public', 'private'],
                   'description': 'Private needs a key: only your own (or all, as an admin).'},
    'mine': {'in': 'query', 'type': 'boolean', 'description': "Only the API user's Conversions."},
    'type': {'in': 'query', 'type': 'string', 'enum': ['MISP_TO_STIX', 'STIX_TO_MISP'], 'description': 'Direction.'},
}
