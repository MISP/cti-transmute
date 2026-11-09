"""Concrete Converters self-register into the Transmute hub on import."""

from cti_transmute.transmute import transmute

from .misp_to_stix import MispToStix
from .misp_to_ocsf import MispToOcsf
from .stix_to_misp import StixToMisp
from .stix_to_ocsf import StixToOcsf

transmute.register(MispToStix())
transmute.register(StixToMisp())
transmute.register(MispToOcsf())
transmute.register(StixToOcsf())
