"""Version single-source guard.

The footer version once lived in three places that drifted apart: a dead
``website/version`` file, ``pyproject.toml``, and a hardcoded literal in
``base.html``. Now ``pyproject.toml``'s ``[project] version`` is the only
source: the app exposes it as the ``app_version`` Jinja global (from the
installed package metadata) and the footer renders ``v{{ app_version }}``.

This test fails if the displayed version drifts from ``pyproject.toml``
(e.g. a stale install) or if a hardcoded version literal creeps back into
the footer.
"""

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def _pyproject_version():
    text = (REPO_ROOT / "pyproject.toml").read_text(encoding="utf-8")
    # The only top-level `version = "..."` is [project].version (build-system
    # pins requirements, ruff uses `target-version`).
    match = re.search(r'(?m)^version\s*=\s*"([^"]+)"', text)
    assert match, "no [project] version found in pyproject.toml"
    return match.group(1)


def test_app_version_global_matches_pyproject():
    from website.web import application

    assert application.jinja_env.globals.get("app_version") == _pyproject_version()


def test_footer_renders_the_version_global_not_a_literal():
    base = (REPO_ROOT / "website" / "web" / "templates" / "base.html").read_text(
        encoding="utf-8"
    )
    assert "v{{ app_version }}" in base, "footer must render the app_version global"
    # No hardcoded version literal (e.g. `v1.3`) anywhere in the layout.
    literal = re.search(r"\bv\d+\.\d+\b", base)
    assert literal is None, f"hardcoded version literal in base.html: {literal.group(0)}"
