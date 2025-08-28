#!/usr/bin/env python3

import json
import logging
from flask_restx import reqparse
from io import BytesIO

from misp_stix_converter import (
    _get_stix2_parser, _is_stix2_from_misp,
    MISPtoSTIX20Parser, MISPtoSTIX21Parser)
from stix2.exceptions import InvalidValueError
from stix2.parsing import dict_to_stix2, parse as stix2_parser, ParseError

from .default import get_config

class Transmute:
    def __init__(self) -> None:
        self.logger = logging.getLogger(f'{self.__class__.__name__}')
        self.logger.setLevel(get_config('generic', 'loglevel'))

    @property
    def stix_version(self) -> str:
        return self.__stix_version

    def misp_to_stix(self, version: str,
                     misp_content: BytesIO | dict | list | str) -> dict:
        parser = (
            MISPtoSTIX20Parser() if version == '2.0' else MISPtoSTIX21Parser()
        )
        if isinstance(misp_content, BytesIO):
            misp_content = misp_content.getvalue().decode('utf-8')
        parser.parse_json_content(misp_content)
        return json.loads(parser.bundle.serialize())

    def stix_to_misp(self, stix_content: BytesIO | dict | list | str,
                     args: reqparse.RequestParser):
        try:
            bundle = self._load_stix_content(stix_content)
        except (InvalidValueError, ParseError) as e:
            return {
                'error': f'Error loading STIX content: {str(e)}'
            }
        parser, arguments = _get_stix2_parser(
            _is_stix2_from_misp(bundle.objects), args.distribution,
            args.sharing_group_id, args.title, args.producer,
            not args.no_force_contextual_data, args.galaxies_as_tags,
            args.single_event, args.organisation_uuid,
            args.cluster_distribution, args.cluster_sharing_group_id
        )
        stix_parser = parser()
        stix_parser.load_stix_bundle(bundle)
        stix_parser.parse_stix_bundle(**arguments)
        if args.single_event:
            return json.loads(stix_parser.misp_event.to_json())
        if isinstance(stix_parser.misp_events, list):
            return [
                json.loads(event.to_json())
                for event in stix_parser.misp_events
            ]
        return json.loads(stix_parser.misp_event.to_json())

    @staticmethod
    def _load_stix_content(stix_content: BytesIO | dict | list | str):
        if isinstance(stix_content, BytesIO):
            return stix2_parser(
                stix_content.getvalue().decode('utf-8'),
                allow_custom=True, interoperability=True
            )
        if isinstance(stix_content, dict):
            return dict_to_stix2(
                stix_content, allow_custom=True, interoperability=True
            )
        ## if isinstance(stix_content, list) -> TODO
        return stix2_parser(
            stix_content, allow_custom=True, interoperability=True
        )