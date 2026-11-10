"""The two launchers: production execs gunicorn, development keeps the debugger.

Production used to be Werkzeug's own server with ``debug`` read from
``FLASK_DEBUG``. The split is what takes the interactive debugger out of
production, so what is pinned here is what makes the split true: the worker
count the launcher hard-codes, the worker class that keeps today's concurrency,
the environment the production launcher refuses to pass on, and the development
guard that refuses to put the debugger on a reachable interface.
"""

import os
import sys
from unittest import mock

import pytest
from dotenv import load_dotenv
from flask import Flask

from bin import dev_server, start_website


@pytest.fixture
def generic_config(monkeypatch):
    """Stand in for ``config/generic.json`` with a writable copy."""
    config = {"website_listen_ip": "0.0.0.0", "website_listen_port": 6868}

    def get_config(config_type, entry=None, quiet=False):
        assert config_type == "generic"
        return config if entry is None else config[entry]

    monkeypatch.setattr(start_website, "get_config", get_config)
    return config


def test_runs_the_gunicorn_of_the_running_interpreter(generic_config):
    """systemd's PATH has no venv, so a bare "gunicorn" would not be found."""
    command = start_website.gunicorn_command()

    assert command[:3] == [sys.executable, "-m", "gunicorn"]


def test_single_worker_and_threaded_class(generic_config):
    """The launcher hard-codes one worker, and gthread rather than sync.

    Neither is a configuration key, so this is the only place a change to
    either shows up. One worker is a capacity default and nothing depends on
    it for correctness; raising it would be a measured decision, not a fix.
    """
    command = start_website.gunicorn_command()

    assert command[command.index("-w") + 1] == "1"
    assert command[command.index("--worker-class") + 1] == "gthread"
    assert command[-1] == "website.app:application"


def test_binds_the_configured_address(generic_config):
    generic_config["website_listen_ip"] = "127.0.0.1"
    generic_config["website_listen_port"] = 7000

    command = start_website.gunicorn_command()

    assert command[command.index("-b") + 1] == "127.0.0.1:7000"


def test_thread_count_comes_from_the_configuration(generic_config):
    generic_config["website_threads"] = 2

    command = start_website.gunicorn_command()

    assert command[command.index("--threads") + 1] == "2"


def test_thread_count_falls_back_when_the_key_predates_it(generic_config):
    """An operator upgrading keeps their own config/generic.json."""
    assert "website_threads" not in generic_config

    command = start_website.gunicorn_command()

    assert command[command.index("--threads") + 1] == str(start_website.DEFAULT_THREADS)


@pytest.fixture
def exec_call(monkeypatch):
    """Record the exec rather than replacing the test process with gunicorn.

    Both spellings are stubbed: the environment is what matters, not which
    call carries it, and an unstubbed one would serve a real port from here.
    """
    recorded = {}
    monkeypatch.setattr(
        os, "execvp",
        lambda file, args: recorded.update(args=args, environment=dict(os.environ))
    )
    monkeypatch.setattr(
        os, "execvpe",
        lambda file, args, environment: recorded.update(args=args, environment=environment)
    )
    return recorded


def test_the_exec_hands_over_an_environment_debug_is_off_in(generic_config, exec_call,
                                                            monkeypatch):
    """The split removes the console; the rest of debug mode rides the environment.

    DEBUG propagates exceptions past the error handlers and reloads templates,
    and Flask reads the flag when the application object is built - which under
    gunicorn happens after the exec, from whatever it inherited.
    """
    monkeypatch.setenv("FLASK_DEBUG", "true")

    start_website.main()
    environment = exec_call["environment"]

    assert environment["PATH"] == os.environ["PATH"]
    with mock.patch.dict(os.environ, environment, clear=True):
        assert Flask(__name__).debug is False


def test_a_dotenv_cannot_switch_debug_back_on(monkeypatch, tmp_path):
    """website/web/__init__.py reads .env inside the served process, after the exec."""
    dotenv = tmp_path / ".env"
    dotenv.write_text("FLASK_DEBUG=true\n")
    monkeypatch.delenv("FLASK_DEBUG", raising=False)

    with mock.patch.dict(os.environ, start_website.gunicorn_environment(), clear=True):
        load_dotenv(dotenv)

        assert Flask(__name__).debug is False


@pytest.mark.parametrize("host", ["127.0.0.1", "::1", "localhost"])
def test_debug_is_allowed_on_a_loopback_bind(host):
    assert dev_server.resolve_debug(host, {"FLASK_DEBUG": "true"}) is True


@pytest.mark.parametrize("host", ["0.0.0.0", "10.0.0.5", "example.org"])
def test_debug_is_refused_on_a_reachable_bind(host):
    """The debugger is an interactive console; refuse rather than downgrade."""
    with pytest.raises(SystemExit) as refusal:
        dev_server.resolve_debug(host, {"FLASK_DEBUG": "true"})

    assert host in str(refusal.value)
    assert "FLASK_DEBUG" in str(refusal.value)


def test_a_reachable_bind_without_debug_still_serves():
    assert dev_server.resolve_debug("0.0.0.0", {}) is False


def test_requests_are_still_logged(generic_config):
    """Werkzeug logged every request; gunicorn logs none unless asked."""
    command = start_website.gunicorn_command()

    assert command[command.index("--access-logfile") + 1] == "-"
