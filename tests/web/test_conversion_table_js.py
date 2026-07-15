"""Client-side escaping checks for the conversion-table highlight (static/js/graph/).

Runs conversion_table_highlight_check.mjs under node: cell values must be
HTML-escaped before search matches are wrapped in ``<mark>``, so a stored
markup payload stays inert in the ``v-html`` sink. Skips when node is not
installed.

Prior art: ``test_tag_icon_js.py``.
"""

import pathlib
import shutil
import subprocess

import pytest


def test_highlight_escapes_before_marking():
    node = shutil.which("node")
    if node is None:
        pytest.skip("node not installed")
    script = pathlib.Path(__file__).parent / "conversion_table_highlight_check.mjs"
    result = subprocess.run(
        [node, str(script)], capture_output=True, text=True, timeout=30,
        env={"PATH": "/usr/bin:/bin:/usr/local/bin"}
    )
    assert result.returncode == 0, f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    assert "FAIL" not in result.stdout
