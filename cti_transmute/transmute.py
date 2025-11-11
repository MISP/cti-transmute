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
from stix2.v20.bundle import Bundle as Bundle_v20
from stix2.v21.bundle import Bundle as Bundle_v21
from typing import Union

from .default import get_config

_BUNDLE_TYPING = Union[Bundle_v20, Bundle_v21]

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
            bundle = self._load_stix_content(
                stix_content, invalid_objects := {}
            )
        except Exception as e:
            return {'error': f'Error loading STIX content: {str(e)}'}
        parser, arguments = _get_stix2_parser(
            _is_stix2_from_misp(bundle.objects), args.distribution,
            args.sharing_group_id, args.title, args.producer,
            (not args.no_force_contextual_data), args.galaxies_as_tags,
            args.single_event, args.organisation_uuid,
            args.cluster_distribution, args.cluster_sharing_group_id
        )
        stix_parser = parser()
        stix_parser.load_stix_bundle(bundle, invalid_objects=invalid_objects)
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
    def _get_stix2_content_version(stix2_content: dict) -> str:
        for stix_object in stix2_content['objects']:
            if stix_object.get('spec_version'):
                return '2.1'
        return '2.0'

    @staticmethod
    def _handle_invalid_stix2_content(invalid_objects, *stix_objects):
        for stix_object in stix_objects:
            try:
                valid_object = stix2_parser(
                    stix_object, allow_custom=True, interoperability=True
                )
            except Exception:
                invalid_objects[stix_object['id']] = stix_object
                continue
            yield valid_object

    def _handle_stix2_loading_error(self, stix_content: dict,
                                    invalid_objects: dict) -> _BUNDLE_TYPING:
        version = self._get_stix2_content_version(stix_content)
        try:
            if version == '2.1' and stix_content.get('spec_version') == '2.0':
                del stix_content['spec_version']
                return dict_to_stix2(
                    stix_content, allow_custom=True, interoperability=True
                )
            elif version == '2.0' and stix_content.get('spec_version') == '2.1':
                stix_content['spec_version'] = '2.0'
                return dict_to_stix2(
                    stix_content, allow_custom=True, interoperability=True
                )
        except Exception:
            pass
        bundle_id = stix_content.get('id')
        bundle = Bundle_v21 if version == '2.1' else Bundle_v20
        if 'objects' in stix_content:
            stix_content = stix_content['objects']
        return bundle(
            *self._handle_invalid_stix2_content(invalid_objects, *stix_content),
            id=bundle_id, allow_custom=True, interoperability=True
        )

    def _load_stix_content(self, stix_content: BytesIO | dict | list | str,
                           invalid_objects: dict) -> _BUNDLE_TYPING:
        if isinstance(stix_content, dict):
            try:
                return dict_to_stix2(
                    stix_content, allow_custom=True, interoperability=True
                )
            except (InvalidValueError, ParseError):
                return self._handle_stix2_loading_error(
                    stix_content, invalid_objects
                )
        if isinstance(stix_content, BytesIO):
            stix_content = stix_content.getvalue().decode('utf-8')
        try:
            return stix2_parser(
                stix_content, allow_custom=True, interoperability=True
            )
        except (InvalidValueError, ParseError):
            return self._handle_stix2_loading_error(
                json.loads(stix_content), invalid_objects
            )
