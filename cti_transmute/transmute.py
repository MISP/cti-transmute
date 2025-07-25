#!/usr/bin/env python3

import logging
from io import BytesIO

from misp_stix_converter import MISPtoSTIX20Parser, MISPtoSTIX21Parser

from .default import get_config

class Transmute:
    def __init__(self) -> None:
        self.logger = logging.getLogger(f'{self.__class__.__name__}')
        self.logger.setLevel(get_config('generic', 'loglevel'))

    def misp_to_stix(self, version: str, misp_content: BytesIO) -> dict:
        parser = MISPtoSTIX20Parser() if version == '2.0' else MISPtoSTIX21Parser()
        parser.parse_json_content(misp_content.getvalue().decode())
        return parser.bundle.serialize()
