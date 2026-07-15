"""Glossary guard: 'convert' is not a noun in user-facing copy.

CONTEXT.md retired "Convert" as a noun — the persisted record is a
*Conversion*, the engine is a *Converter*, and *to convert* stays a verb.
Issue 12 swept the display copy, docstrings and comments; this test keeps
the retired noun from creeping back into user-facing surfaces (templates,
non-vendored static JS, and Python under ``website/``).

The patterns match noun *contexts* rather than the bare word, so verb
usage ("Convert to STIX", "Converts the Markdown…") and identifiers
(``/api/convert/``, ``target_type="convert"``, ``convert_id``) never trip
it. If a legitimate new hit ever appears, prefer rewording the copy over
allowlisting here.
"""

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

# Directories/files whose content we don't own.
VENDORED_JS = re.compile(
    r"static/(pivotick/|js/(jquery|vue\.global|select2|zxcvbn|popper|"
    r"pivotick|SimulationWorker|jquery-ui))"
)

RETIRED_NOUN_PATTERNS = [
    # article/quantifier + noun: "this convert", "no converts selected", …
    re.compile(
        r"\b(this|a|the|each|every|any|no|all|public|private|selected"
        r"|deleted|last|one|per|other|stored|new)\s+converts?\b",
        re.IGNORECASE,
    ),
    # capitalised plural is the noun — unless a determiner follows, which
    # marks the sentence-initial verb ("Converts an icon name to …")
    re.compile(r"\bConverts\b(?!\s+(?:an?|the)\b)"),
    # possessive: "the convert's input JSON"
    re.compile(r"\bconverts?['’]s\b", re.IGNORECASE),
    # tag-delimited plural: <th>Converts</th>. Singular ">Convert<" stays
    # legal — it is the verb on action buttons ("click <strong>Convert</strong>").
    re.compile(r">Converts<"),
]


def _surface_files():
    yield from (REPO_ROOT / "website" / "web" / "templates").rglob("*.html")
    for js in (REPO_ROOT / "website" / "web" / "static").rglob("*.js"):
        if not VENDORED_JS.search(js.as_posix()):
            yield js
    for py in (REPO_ROOT / "website").rglob("*.py"):
        if "migrations" not in py.parts:
            yield py


def test_no_convert_noun_in_user_facing_copy():
    offenders = []
    for path in _surface_files():
        text = path.read_text(encoding="utf-8", errors="replace")
        for lineno, line in enumerate(text.splitlines(), start=1):
            for pattern in RETIRED_NOUN_PATTERNS:
                match = pattern.search(line)
                if match:
                    rel = path.relative_to(REPO_ROOT)
                    offenders.append(f"{rel}:{lineno}: {line.strip()[:120]}")
                    break
    assert not offenders, (
        "'convert' used as a noun in user-facing copy (see CONTEXT.md "
        "glossary — the record is a 'conversion'):\n" + "\n".join(offenders)
    )
