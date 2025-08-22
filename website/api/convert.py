#!/usr/bin/env python3

import json
import logging
from flask import request
from flask_restx import Namespace, Resource, reqparse
from io import BytesIO
from werkzeug.datastructures import FileStorage

from website.web import transmute

logger = logging.getLogger(__name__)

convert_ns = Namespace('convert', description='Conversion operations.')


@convert_ns.route('/list')
class ConvertersList(Resource):
    @convert_ns.doc(description='List available converters.')
    def get(self):
        available_converters = [
            'MISP to STIX 2.0 & 2.1',
            'STIX 2.0 & 2.1 to MISP'
        ]
        return {'available': available_converters}, 200


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


misp_to_stix_parser = reqparse.RequestParser()
misp_to_stix_parser.add_argument(
    'version', type=str, help='STIX version', location='args',
    choices=('2.0', '2.1'), default='2.1'
)


@convert_ns.route('/misp_to_stix')
# @convert_ns.route('/misp_to_stix/<string:version>')
@convert_ns.doc(description='Convert MISP data collection to STIX format.')
class MISPtoSTIX(MispStixConverter):
    @convert_ns.expect(misp_to_stix_parser)
    def post(self):
        args = misp_to_stix_parser.parse_args()
        try:
            misp_content = self._load_input_from_request()
        except ValueError as e:
            return (
                {
                    'message': 'Input validation failed',
                    'errors': {'input': str(e)}
                },
                400
            )
        version = args.get('version', '2.1')
        return transmute.misp_to_stix(version, misp_content)
