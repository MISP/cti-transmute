"""Service-layer exceptions.

Per ADR-0010, persistence knowledge stays out of the Flask-free engine:
`PersistenceFailed` lives here in `website/`, but subclasses the engine's
`ConversionError` base so callers can catch the whole conversion hierarchy.
"""

from cti_transmute.exceptions import ConversionError


class PersistenceFailed(ConversionError):
    """A conversion's persistence (DB write) failed; nothing was written."""
