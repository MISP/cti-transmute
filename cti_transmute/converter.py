"""The Converter abstract base — one direction of CTI format transformation."""

from abc import ABC, abstractmethod
from typing import Any, ClassVar

from pydantic import BaseModel


class Converter(ABC):
    """A registered transformer for one (source_format, target_format) pair.

    Subclasses declare the formats they bridge, the Pydantic model that
    describes their parameters, and implement ``execute`` to perform the
    transformation. Converters know nothing about users, persistence, or
    HTTP — they take a payload and parameters in, return transformed
    output.
    """

    source_format: ClassVar[str]
    target_format: ClassVar[str]
    output_format: ClassVar[str]
    params_class: ClassVar[type[BaseModel]]

    @abstractmethod
    def execute(self, payload: Any, params: BaseModel) -> dict:
        """Run the conversion. Raises ``ConverterFailed`` on library errors."""
