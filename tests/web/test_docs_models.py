"""Docs-page accuracy guard: every ``Convert*``/``Conversion*`` model name the
docs page displays must be a class that actually exists in ``db_class/db.py``.

The rename retired the ``Convert*`` model names; the docs page kept showing
them. JS component names (``ConvertSunburst`` & co.) are exempt until the
file-rename slice (issue 14) moves the components themselves — renaming the
docs rows first would make them lie in the other direction.
"""

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DOCS_PAGE = REPO_ROOT / "website" / "web" / "templates" / "docs" / "index.html"

# JS components still carrying the retired prefix — accurate until issue 14
# renames the files; then this allowlist empties out.
JS_COMPONENT_KEEPS = {
    "ConvertSunburst",
    "ConvertTable",
    "ConvertGraph",
    "PushConvertToMISP",
}


def test_docs_page_names_only_live_models():
    import website.db_class.db as models

    # Class-style names built on the retired noun or its replacement:
    # "Convert"/"Conversion" + CamelCase tail ("ConvertHistory",
    # "ConversionHistory", "PushConvertToMISP"). Deliberately blind to the
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
