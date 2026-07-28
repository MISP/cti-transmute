"""Round-trip test of the shared client date helper (static/js/datetime.js).

Runs datetime_check.mjs under node in a fixed non-UTC zone (the reporter's,
CEST), so the original symptom — a just-created conversion showing "2h ago" —
would fail the "just now" check. Skips when node is not installed.
"""

import pathlib
import shutil
import subprocess

import pytest


def test_client_helper_round_trip_under_cest():
    node = shutil.which("node")
    if node is None:
        pytest.skip("node not installed")
    script = pathlib.Path(__file__).parent / "datetime_check.mjs"
    result = subprocess.run(
        [node, str(script)], capture_output=True, text=True, timeout=30,
        env={"PATH": "/usr/bin:/bin:/usr/local/bin", "TZ": "Europe/Luxembourg"}
    )
    assert result.returncode == 0, f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    assert "FAIL" not in result.stdout