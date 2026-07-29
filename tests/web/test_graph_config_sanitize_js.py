"""Client-side schema checks for graph-config patches (static/js/graph/).

Runs graph_config_sanitize_check.mjs under node: a stored graph config is
user input replayed into other users' browsers and Pivotick HTML-parses a
style's ``svgIcon``, so ``applyConfig`` must schema-filter every patch via
``sanitizeConfigPatch`` before merging. Skips when node is not installed.

Prior art: ``test_graph_xss_js.py``.
"""

import pathlib
import shutil
import subprocess

import pytest


def test_graph_config_patches_are_schema_filtered():
    node = shutil.which("node")
    if node is None:
        pytest.skip("node not installed")
    script = pathlib.Path(__file__).parent / "graph_config_sanitize_check.mjs"
    result = subprocess.run(
        [node, str(script)], capture_output=True, text=True, timeout=30,
        env={"PATH": "/usr/bin:/bin:/usr/local/bin"}
    )
    assert result.returncode == 0, f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    assert "FAIL" not in result.stdout
