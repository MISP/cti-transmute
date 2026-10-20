"""The Converter abstract base - one direction of CTI format transformation."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, ClassVar

from pydantic import BaseModel


@dataclass(frozen=True)
class ConversionResult:
    """What one conversion produced: the document, and what the engine reported.

    ``document`` is the converted content in its native shape - a dict, or a
    list when one input yields several documents. ``diagnostics`` is the
    underlying library's own report, passed through verbatim:
    ``{"warnings": {identifier: [message, ...]}, "errors": {...},
    "counts": {"warnings": int, "errors": int}}``. An empty dict means the
    conversion had nothing to report; Diagnostics never mean it failed.
    """

    document: dict | list
    diagnostics: dict = field(default_factory=dict)


class Converter(ABC):
    """A registered transformer for one (source_format, target_format) pair.

    Subclasses declare the formats they bridge, the Pydantic model that
    describes their parameters, and implement ``process`` to perform the
    transformation. Converters know nothing about users, persistence, or
    HTTP - they take a payload and parameters in, return transformed
    output.
    """

    source_format: ClassVar[str]
    target_format: ClassVar[str]
    output_format: ClassVar[str]
    description: ClassVar[str]
    params_class: ClassVar[type[BaseModel]]

    @abstractmethod
    def process(self, payload: Any, params: BaseModel) -> ConversionResult:
        """Run the conversion. Returns the converted document paired with the
        Diagnostics the conversion reported. Raises ``ConverterFailed`` on
        library errors."""
