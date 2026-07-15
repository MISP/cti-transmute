"""Client-side sink checks for the tag icon (static/js/tags/).

Runs tag_icon_sink_check.mjs under node: the icon must be rendered as a
bound class (``fas fa-<slug>``), never through ``v-html``, so a stored
markup payload stays inert. Skips when node is not installed.

Prior art: ``test_datetime_js.py``.
"""

import pathlib
import shutil
import subprocess

import pytest


def test_icon_never_reaches_an_html_sink():
    node = shutil.which("node")
    if node is None:
        pytest.skip("node not installed")
    script = pathlib.Path(__file__).parent / "tag_icon_sink_check.mjs"
    result = subprocess.run(
        [node, str(script)], capture_output=True, text=True, timeout=30,
        env={"PATH": "/usr/bin:/bin:/usr/local/bin"}
    )
    assert result.returncode == 0, f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    assert "FAIL" not in result.stdout
