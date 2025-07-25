#!/usr/bin/env python3

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


misp_to_stix_parser = reqparse.RequestParser()
misp_to_stix_parser.add_argument(
    'version', type=str, help='STIX version', location='args'
)
misp_to_stix_parser.add_argument(
    'file', type=FileStorage, location='files',
    required=True, help='MISP data file to convert'
)

@convert_ns.route('/misp_to_stix')
# @convert_ns.route('/misp_to_stix/<string:version>')
@convert_ns.doc(description='Convert MISP data collection to STIX format.')
class MISPtoSTIX(Resource):
    @convert_ns.expect(misp_to_stix_parser)
    def post(self):
        args = misp_to_stix_parser.parse_args()
        misp_file = args['file']
        misp_content = BytesIO(misp_file.read())
        version = args.get('version', '2.1')
        bundle = transmute.misp_to_stix(version, misp_content)
        return bundle
