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
    'single_event', action='store_true', location='args',
    help='Convert STIX data to a single MISP event in case there are multiple reports/groupings.'
)
stix_to_misp_parser.add_argument(
    'producer', type=str, help='Producer of the STIX data', location='args'
)
stix_to_misp_parser.add_argument(
    'title', type=str, location='args',
    help='Title used to set the MISP Event `info` field.'
)


@convert_ns.route('/stix_to_misp')
@convert_ns.doc(description='Convert STIX data collection to MISP format.')
class STIXtoMISP(MispStixConverter):
    @convert_ns.expect(stix_to_misp_parser)
    def post(self):
        args = stix_to_misp_parser.parse_args()
        try:
            stix_content = self._load_input_from_request()
        except ValueError as e:
            return (
                {
                    'message': 'Input validation failed',
                    'errors': {'input': str(e)}
                },
                400
            )
        return transmute.stix_to_misp(stix_content, args)
