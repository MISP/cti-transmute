"""Client-side XSS checks for the conversion graph (static/js/graph/).

Runs graph_xss_check.mjs under node: the "Open raw JSON" popup must be built
with DOM textContent (never document.write of interpolated markup), and Pivotick
node/edge labels must be HTML-escaped before the library renders them through
innerHTML. Skips when node is not installed.

Prior art: ``test_conversion_table_js.py``.
"""

import pathlib
import shutil
import subprocess

import pytest


def test_graph_neutralizes_untrusted_content():
    node = shutil.which("node")
    if node is None:
        pytest.skip("node not installed")
    script = pathlib.Path(__file__).parent / "graph_xss_check.mjs"
    result = subprocess.run(
        [node, str(script)], capture_output=True, text=True, timeout=30,
        env={"PATH": "/usr/bin:/bin:/usr/local/bin"}
    )
    assert result.returncode == 0, f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    assert "FAIL" not in result.stdout
