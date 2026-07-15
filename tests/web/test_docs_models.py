"""Docs-page accuracy guards: what the docs page displays must match the code.

Model names: every ``Convert*``/``Conversion*`` model name the docs page
displays must be a class that actually exists in ``db_class/db.py`` — the
rename retired the ``Convert*`` names; the docs page kept showing them. JS
component names are exempt: they are Vue components the docs page documents,
not model claims.

API facts: the page must document the current auth and persistence mechanics,
not the pre-spine ones it once described.
"""

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DOCS_PAGE = REPO_ROOT / "website" / "web" / "templates" / "docs" / "index.html"

# Vue/JS components the docs page documents — real names, but not models.
JS_COMPONENT_KEEPS = {
    "ConversionSunburst",
    "ConversionTable",
    "ConversionGraph",
    "PushConversionToMISP",
}


def test_docs_page_names_only_live_models():
    import website.db_class.db as models

    # Class-style names built on the retired noun or its replacement:
    # "Convert"/"Conversion" + CamelCase tail ("ConvertHistory",
    # "ConversionHistory", "PushConversionToMISP"). Deliberately blind to the
    # verb ("Convert a MISP event"), to "Converter", and to file names
    # ("pushConvertToMISP.js" starts lowercase, so no word boundary matches).
    displayed = set(
        re.findall(
            r"\b(?:[A-Z]\w*)?Conver(?:t|sion)[A-Z]\w*\b", DOCS_PAGE.read_text()
        )
    )
    dead = {
        name
        for name in displayed - JS_COMPONENT_KEEPS
        if not hasattr(models, name)
    }
    assert not dead, (
        "docs page displays model names that no longer exist in "
        f"db_class/db.py (retired by the Conversion rename): {sorted(dead)}"
    )


def test_docs_page_model_fields_are_real_columns():
    """Every field row in a model card must be a column of that model.

    The model-name guard above can't see field-level drift (``role`` vs
    ``admin``, ``colour`` vs ``color``); this walks each ``dc-model-name``
    card and checks its ``dc-field-name`` entries against the model's actual
    table. The combined overview card (slash-separated model names) lists
    models, not fields, and is skipped.
    """
    import website.db_class.db as models

    cards = re.split(r'<span class="dc-model-name">', DOCS_PAGE.read_text())[1:]
    problems = []
    for card in cards:
        name = card.split("<", 1)[0].strip()
        if "/" in name:
            continue
        cls = getattr(models, name, None)
        assert cls is not None and hasattr(cls, "__table__"), (
            f"docs page documents a model that does not exist: {name}"
        )
        columns = {column.name for column in cls.__table__.columns}
        body = card.split("</table>", 1)[0]
        for field in re.findall(r'dc-field-name">([^<]+)</span>', body):
            for part in re.split(r"\s*/\s*", field.strip()):
                if part and part not in columns:
                    problems.append(f"{name}.{part}")
    assert not problems, (
        f"docs page documents fields that are not columns: {problems}"
    )


def test_docs_page_states_current_api_facts():
    """The API section documents the optional ``X-API-KEY`` header and opt-in
    persistence; the pre-spine Bearer-token wording must not resurface."""
    text = DOCS_PAGE.read_text()
    assert "X-API-KEY" in text, "docs page must document the X-API-KEY header"
    assert "persist=true" in text, "docs page must document opt-in persistence"
    assert "Bearer" not in text, "the retired Bearer-token wording resurfaced"
