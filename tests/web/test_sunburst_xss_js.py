"""Client-side XSS checks for the Sunburst view (static/js/graph/).

Runs sunburst_xss_check.mjs under node: ECharts parses a function formatter's
return value as HTML and the slice names come from the converted bundle, so
the tooltip formatters must HTML-escape every interpolated value. Skips when
node is not installed.

Prior art: ``test_graph_xss_js.py``.
"""

import pathlib
import shutil
import subprocess

import pytest


def test_sunburst_tooltips_neutralize_untrusted_content():
    node = shutil.which("node")
    if node is None:
        pytest.skip("node not installed")
    script = pathlib.Path(__file__).parent / "sunburst_xss_check.mjs"
    result = subprocess.run(
        [node, str(script)], capture_output=True, text=True, timeout=30,
        env={"PATH": "/usr/bin:/bin:/usr/local/bin"}
    )
    assert result.returncode == 0, f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    assert "FAIL" not in result.stdout
