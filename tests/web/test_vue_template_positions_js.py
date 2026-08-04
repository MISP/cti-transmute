"""The positions the template lint skips are positions Vue really skips.

Runs vue_template_positions_check.mjs under node against the vendored
`vue.global.js`: text nodes, textareas and `<pre>` bodies interpolate, while
`<script>`/`<style>` content and `v-pre` subtrees do not. `mount_root_lint`
leans on the second half - a data island and a `v-pre` region are the two
patterns the per-page conversions move to, and a Vue upgrade that started
compiling either would otherwise open a hole in silence. Skips when node is not
installed, so the lint itself keeps needing no JavaScript.

The delimiter pair is passed in from `VUE_DELIMITERS` rather than repeated in
the script, so the probe cannot drift from what the server neutralises.

Prior art: ``test_graph_xss_js.py``.
"""

import pathlib
import shutil
import subprocess

import pytest

from website.web.templating import VUE_DELIMITERS


def test_vue_interpolates_only_where_the_lint_expects():
    node = shutil.which("node")
    if node is None:
        pytest.skip("node not installed")
    script = pathlib.Path(__file__).parent / "vue_template_positions_check.mjs"
    result = subprocess.run(
        [node, str(script), *VUE_DELIMITERS], capture_output=True, text=True, timeout=60,
        env={"PATH": "/usr/bin:/bin:/usr/local/bin"}
    )
    assert result.returncode == 0, f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    assert "FAIL" not in result.stdout + result.stderr
