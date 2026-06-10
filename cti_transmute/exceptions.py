"""Typed exception hierarchy for the conversion pipeline.

These exceptions are raised by Converters, the registry, and (in later slices)
the use-case layer. The API and Web layers map them to HTTP status / flash
messages without sniffing string error fields.
"""


class ConversionError(Exception):
    """Base for all conversion-related failures."""


class InvalidPayload(ConversionError):
    """The input cannot be parsed as the declared source format."""


class UnknownConverter(ConversionError):
    """No Converter is registered for the requested (source, target) pair."""


class InvalidParameters(ConversionError):
    """The supplied parameters failed validation."""


class ConverterFailed(ConversionError):
    """The underlying conversion library raised an unexpected error."""
