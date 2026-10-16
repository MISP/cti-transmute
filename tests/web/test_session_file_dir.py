"""The session store resolves to the same directory wherever the process starts.

flask-session's own fallback is ``<cwd>/flask_session``, so until the default
was pinned the store followed the working directory: a launcher that sets its
own WorkingDirectory would read an empty directory and sign out every logged-in
user, with no error anywhere to explain it. Each case imports the application in
a subprocess whose working directory is not the checkout, which is the only way
to observe what a differently-launched process resolves.
"""

import os
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

PRINT_SESSION_FILE_DIR = "import website.web as web; print(web.application.config['SESSION_FILE_DIR'])"


def session_file_dir(cwd, override=None):
    """The directory an application imported from ``cwd`` would store sessions in."""
    env = {**os.environ, "PYTHONPATH": str(REPO_ROOT)}
    env.pop("SESSION_FILE_DIR", None)
    if override is not None:
        env["SESSION_FILE_DIR"] = str(override)

    result = subprocess.run([sys.executable, "-c", PRINT_SESSION_FILE_DIR],
                            cwd=cwd, env=env, capture_output=True, text=True)

    assert result.returncode == 0, result.stderr
    return Path(result.stdout.strip())


def test_default_does_not_follow_the_working_directory(tmp_path):
    assert session_file_dir(tmp_path) == REPO_ROOT / "flask_session"


def test_environment_overrides_the_default_and_creates_the_directory(tmp_path):
    store = tmp_path / "state" / "flask-session"

    assert session_file_dir(tmp_path, override=store) == store
    assert store.is_dir()
