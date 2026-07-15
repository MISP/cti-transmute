"""Concrete Converters self-register into the Transmute hub on import."""

from cti_transmute.transmute import transmute

from .misp_to_stix import MispToStix
from .stix_to_misp import StixToMisp

transmute.register(MispToStix())
transmute.register(StixToMisp())
