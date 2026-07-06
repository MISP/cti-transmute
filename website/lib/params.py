"""Shared server-side helpers for the generated parameter surface.

One Parameter schema per Converter feeds the API validator, the web conversion
page, and (later) the MISP view. These helpers turn a submitted params mapping
into the Converter's Pydantic model and render a Pydantic ``ValidationError`` as
the one stable ``{error, fields}`` 400 every surface returns, so a client can
highlight the offending control regardless of which surface it submitted to.

The API resource keeps its own query-string builder (values arrive as strings,
bare boolean flags coerce to ``True``, the ``persist`` transport flag is
stripped); this is the typed-JSON sibling for the fetch/JSON surfaces.
"""

from typing import Any, Mapping

from pydantic import BaseModel, ValidationError


def build_params(
        params_class: type[BaseModel], data: Mapping[str, Any]) -> BaseModel:
    """Build a Converter's params model from a submitted JSON params mapping.

    Values arrive already typed. Strings are stripped; blanks (``""`` /
    whitespace) and ``None`` are dropped so the model applies each field's
    default. Everything else is handed to the model, whose ``extra="forbid"``
    rejects unknown keys — mirroring the published schema's
    ``additionalProperties: false``. Raises ``ValidationError`` on a rejected
    value or unknown key; the caller maps it to the ``{error, fields}`` 400 via
    `param_error`.
    """
    supplied: dict[str, Any] = {}
    for key, value in (data or {}).items():
        if isinstance(value, str):
            value = value.strip()
            if not value:
                continue
        if value is None:
            continue
        supplied[key] = value
    return params_class(**supplied)


def param_error(exc: ValidationError) -> tuple[dict, int]:
    """Render a Pydantic ``ValidationError`` as the stable ``{error, fields}`` 400.

    ``fields`` maps each offending param name to its message; ``error`` is a
    short human-readable summary.
    """
    fields: dict[str, str] = {}
    for err in exc.errors():
        loc = err.get("loc") or ("params",)
        fields[str(loc[0])] = err["msg"]
    return {"error": "Invalid conversion parameters", "fields": fields}, 400
