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

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]

PRINT_SESSION_FILE_DIR = "import website.web as web; print(web.application.config['SESSION_FILE_DIR'])"

skip_if_root = pytest.mark.skipif(
    os.geteuid() == 0,
    reason="root writes through the mode bits these cases rely on")


def run_application_import(cwd, override=None):
    """Import the application from ``cwd``, with ``SESSION_FILE_DIR`` as given."""
    env = {**os.environ, "PYTHONPATH": str(REPO_ROOT)}
    env.pop("SESSION_FILE_DIR", None)
    if override is not None:
        env["SESSION_FILE_DIR"] = str(override)

    return subprocess.run([sys.executable, "-c", PRINT_SESSION_FILE_DIR],
                          cwd=cwd, env=env, capture_output=True, text=True)


def session_file_dir(cwd, override=None):
    """The directory an application imported from ``cwd`` would store sessions in."""
    result = run_application_import(cwd, override)

    assert result.returncode == 0, result.stderr
    return Path(result.stdout.strip())


def test_default_does_not_follow_the_working_directory(tmp_path):
    assert session_file_dir(tmp_path) == REPO_ROOT / "flask_session"


def test_environment_overrides_the_default_and_creates_the_directory(tmp_path):
    store = tmp_path / "state" / "flask-session"

    assert session_file_dir(tmp_path, override=store) == store
    assert store.is_dir()


@skip_if_root
def test_a_directory_that_cannot_be_created_names_the_store_and_the_override(tmp_path):
    read_only = tmp_path / "read-only"
    read_only.mkdir(mode=0o555)
    store = read_only / "flask_session"

    result = run_application_import(tmp_path, override=store)

    assert result.returncode != 0
    assert str(store) in result.stderr
    assert "session store" in result.stderr
    assert "SESSION_FILE_DIR" in result.stderr


@skip_if_root
def test_an_existing_directory_that_cannot_be_written_fails_the_same_way(tmp_path):
    """The shape ``mkdir(exist_ok=True)`` cannot see: a store left by another user.

    A deploy run as root creates the directory; the service then runs as its
    own user and can read it but not write it. Creating it succeeds, so the
    failure would otherwise land on the first request that touches a session,
    one opaque PermissionError per request with the service apparently up.
    """
    store = tmp_path / "flask_session"
    store.mkdir(mode=0o555)

    result = run_application_import(tmp_path, override=store)

    assert result.returncode != 0
    assert str(store) in result.stderr
    assert "session store" in result.stderr
    assert "SESSION_FILE_DIR" in result.stderr
