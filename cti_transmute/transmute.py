#!/usr/bin/env python3

import logging
from io import BytesIO

from misp_stix_converter import MISPtoSTIX20Parser, MISPtoSTIX21Parser

from .default import get_config

class Transmute:
    def __init__(self) -> None:
        self.logger = logging.getLogger(f'{self.__class__.__name__}')
        self.logger.setLevel(get_config('generic', 'loglevel'))

    def misp_to_stix(self, version: str,
                     misp_content: BytesIO | dict | list | str) -> dict:
        parser = (
            MISPtoSTIX20Parser() if version == '2.0' else MISPtoSTIX21Parser()
        )
        if isinstance(misp_content, BytesIO):
            misp_content = misp_content.getvalue().decode('utf-8')
        parser.parse_json_content(misp_content)
        return json.loads(parser.bundle.serialize())
