"""The Graph tab's model layer (static/js/graph/model/), run under node.

graph_model_check.mjs feeds small MISP and STIX documents to the parsers and
checks the nodes and edges they produce. Skips when node is not installed.
"""

import pathlib
import shutil
import subprocess

import pytest


def test_graph_model_checks():
    node = shutil.which("node")
    if node is None:
        pytest.skip("node not installed")
    script = pathlib.Path(__file__).parent / "graph_model_check.mjs"
    result = subprocess.run(
        [node, "--no-warnings", str(script)], capture_output=True, text=True, timeout=60,
    )
    assert result.returncode == 0, f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    assert "FAIL" not in result.stdout
