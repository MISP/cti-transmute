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


def test_docs_page_states_current_api_facts():
    """The API section documents the optional ``X-API-KEY`` header and opt-in
    persistence; the pre-spine Bearer-token wording must not resurface."""
    text = DOCS_PAGE.read_text()
    assert "X-API-KEY" in text, "docs page must document the X-API-KEY header"
    assert "persist=true" in text, "docs page must document opt-in persistence"
    assert "Bearer" not in text, "the retired Bearer-token wording resurfaced"
