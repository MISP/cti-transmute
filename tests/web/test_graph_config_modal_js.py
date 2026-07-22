"""Client-side XSS checks for the graph-config modal (static/js/graph/).

Runs graph_config_modal_check.mjs under node: the saved-list error paths must
build DOM nodes and set the message as textContent, never assign innerHTML from
an interpolated template literal. Skips when node is not installed.

Prior art: ``test_graph_xss_js.py``.
"""

import pathlib
import shutil
import subprocess

import pytest


def test_graph_config_modal_error_paths_are_text_only():
    node = shutil.which("node")
    if node is None:
        pytest.skip("node not installed")
    script = pathlib.Path(__file__).parent / "graph_config_modal_check.mjs"
    result = subprocess.run(
        [node, str(script)], capture_output=True, text=True, timeout=30,
        env={"PATH": "/usr/bin:/bin:/usr/local/bin"}
    )
    assert result.returncode == 0, f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    assert "FAIL" not in result.stdout
