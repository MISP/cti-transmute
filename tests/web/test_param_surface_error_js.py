"""The param-surface load failure is reported as text, on all three pages.

Runs param_surface_error_check.mjs under node: the notice must be DOM-built
with the message as textContent, and each converter page must route its failure
through the shared helper instead of assigning the mount's innerHTML. Skips
when node is not installed.

Prior art: ``test_graph_config_modal_js.py``.
"""

import pathlib
import shutil
import subprocess

import pytest


def test_param_surface_error_is_text_only():
    node = shutil.which("node")
    if node is None:
        pytest.skip("node not installed")
    script = pathlib.Path(__file__).parent / "param_surface_error_check.mjs"
    result = subprocess.run(
        [node, str(script)], capture_output=True, text=True, timeout=30,
        env={"PATH": "/usr/bin:/bin:/usr/local/bin"}
    )
    assert result.returncode == 0, f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    assert "FAIL" not in result.stdout
