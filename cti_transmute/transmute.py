"""Transmute — the conversion engine's hub and public library API.

`cti_transmute` is importable on its own (ADR-0001); `Transmute` is its front
door. It is the runtime source of truth for the supported directions: concrete
Converters self-register into it, it resolves a ``(source, target)`` family to
its Converter, and ``convert`` runs one in a single call — accepting parameters
as a plain dict (validated through the Converter's own schema), an already-built
params model, or nothing (defaults).

Use the module-level ``transmute`` singleton, into which the concrete Converters
register themselves on import.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ValidationError

from .converter import Converter
from .exceptions import InvalidParameters, UnknownConverter


class Transmute:
    def __init__(self) -> None:
        self._converters: dict[tuple[str, str], Converter] = {}

    def register(self, converter: Converter) -> None:
        key = (converter.source_format, converter.target_format)
        if key in self._converters:
            raise ValueError(f"Converter already registered for {key}")
        self._converters[key] = converter

    def lookup(self, source_format: str, target_format: str) -> Converter:
        try:
            return self._converters[(source_format, target_format)]
        except KeyError:
            raise UnknownConverter(
                f"No converter registered for {source_format} -> {target_format}"
            ) from None

    def list(self) -> list[Converter]:
        return list(self._converters.values())

    def convert(
        self,
        source_format: str,
        target_format: str,
        payload: Any,
        params: BaseModel | dict | None = None,
    ) -> dict | list:
        """Run the ``source_format`` -> ``target_format`` conversion on ``payload``.

        Raises ``UnknownConverter`` for an unsupported pair, ``InvalidParameters``
        for a params dict that fails the Converter's schema, and propagates the
        Converter's own ``InvalidPayload`` / ``ConverterFailed``.
        """
        converter = self.lookup(source_format, target_format)
        return converter.process(payload, self._coerce_params(converter, params))

    @staticmethod
    def _coerce_params(
        converter: Converter, params: BaseModel | dict | None
    ) -> BaseModel:
        if isinstance(params, BaseModel):
            if not isinstance(params, converter.params_class):
                raise InvalidParameters(
                    f"{type(params).__name__} is not the params model for "
                    f"{converter.source_format} -> {converter.target_format}"
                )
            return params
        try:
            return converter.params_class(**(params or {}))
        except ValidationError as exc:
            raise InvalidParameters(str(exc)) from exc


transmute = Transmute()

# Side-effect import: registers concrete Converters into the singleton.
from . import converters  # noqa: E402,F401
