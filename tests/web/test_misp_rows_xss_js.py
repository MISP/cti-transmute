"""Client-side XSS checks for the "FROM MISP INSTANCE" event browser.

Runs misp_rows_xss_check.mjs under node: every field of a listed event is
authored on the remote MISP instance the operator queries, so the row builder
(static/js/misp/mispEventRows.js) must DOM-build rows, badges and tooltips
instead of interpolating remote values into innerHTML. Skips when node is not
installed.

Prior art: ``test_graph_xss_js.py``.
"""

import pathlib
import shutil
import subprocess

import pytest


def test_misp_instance_rows_neutralize_remote_content():
    node = shutil.which("node")
    if node is None:
        pytest.skip("node not installed")
    script = pathlib.Path(__file__).parent / "misp_rows_xss_check.mjs"
    result = subprocess.run(
        [node, str(script)], capture_output=True, text=True, timeout=30,
        env={"PATH": "/usr/bin:/bin:/usr/local/bin"}
    )
    assert result.returncode == 0, f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    assert "FAIL" not in result.stdout
