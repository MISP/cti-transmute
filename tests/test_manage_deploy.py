"""What `manage deploy` does once systemd owns the service.

Deploy used to end in the foreground `start` command. Against a unit that
already holds the port that is a failed deploy every time, so what is pinned
here is that deploy hands the restart to the supervisor - and that where there
is no supervisor it says so out loud rather than leaving the old code serving
without a word.
"""

import pytest

from bin import manage


class _completed:
    """Stand in for the CompletedProcess `run` returns."""

    def __init__(self, returncode):
        self.returncode = returncode


class _Steps(list):
    """The commands deploy ran, plus the code the restart comes back with."""

    returncode = 0


@pytest.fixture
def deploy_steps(monkeypatch):
    """Record the commands deploy runs, with backup and update stubbed out."""
    commands = _Steps()
    monkeypatch.setattr(manage, "cmd_backup", lambda: commands.append(["backup"]))
    monkeypatch.setattr(manage, "cmd_update", lambda: commands.append(["update"]))
    monkeypatch.setattr(manage, "_restart_command", lambda: ["systemctl", "restart", "cti-transmute.service"])

    def record(cmd, cwd=None, check=True):
        commands.append(cmd)
        return _completed(commands.returncode)

    monkeypatch.setattr(manage, "run", record)
    return commands


def test_deploy_restarts_the_unit_rather_than_spawning_a_server(monkeypatch, deploy_steps):
    monkeypatch.setattr(manage, "_service_is_supervised", lambda: True)

    manage.cmd_deploy()

    assert deploy_steps == [
        ["backup"],
        ["update"],
        ["systemctl", "restart", "cti-transmute.service"]
    ]


def test_deploy_without_systemd_prints_the_restart_command(monkeypatch, deploy_steps, capsys):
    """The macOS container and Docker have no systemd; deploy still completes."""
    monkeypatch.setattr(manage, "_service_is_supervised", lambda: False)

    manage.cmd_deploy()

    assert deploy_steps == [["backup"], ["update"]]
    assert "sudo systemctl restart cti-transmute.service" in capsys.readouterr().out


def test_deploy_fails_loudly_when_the_restart_fails(monkeypatch, deploy_steps, capsys):
    """A deploy that quietly leaves the old code serving is the worse outcome."""
    monkeypatch.setattr(manage, "_service_is_supervised", lambda: True)
    deploy_steps.returncode = 1

    with pytest.raises(SystemExit) as failure:
        manage.cmd_deploy()

    assert failure.value.code != 0
    assert "sudo systemctl restart cti-transmute.service" in capsys.readouterr().out


def test_the_restart_is_elevated_when_deploy_is_not_root(monkeypatch):
    """Deploy runs as the checkout's owner; polkit refuses it an unelevated restart."""
    monkeypatch.setattr(manage.os, "geteuid", lambda: 1000)
    monkeypatch.setattr(manage.shutil, "which", lambda name: f"/usr/bin/{name}")

    assert manage._restart_command()[0] == "sudo"


def test_root_restarts_without_sudo(monkeypatch):
    monkeypatch.setattr(manage.os, "geteuid", lambda: 0)

    assert manage._restart_command() == ["systemctl", "restart", "cti-transmute.service"]


def test_a_host_without_systemd_is_not_supervised(monkeypatch, tmp_path):
    """No systemctl at all - the macOS container, and the Mac itself."""
    monkeypatch.setattr(manage.shutil, "which", lambda name: None)
    monkeypatch.setattr(manage, "SYSTEMD_MARKER", tmp_path)

    assert manage._service_is_supervised() is False


def test_systemctl_without_systemd_as_pid_1_is_not_supervised(monkeypatch, tmp_path):
    """A Docker image can ship the binary with nothing running behind it."""
    monkeypatch.setattr(manage.shutil, "which", lambda name: "/usr/bin/systemctl")
    monkeypatch.setattr(manage, "SYSTEMD_MARKER", tmp_path / "absent")

    assert manage._service_is_supervised() is False


@pytest.mark.parametrize(
    "probe_returncode, supervised",
    [(0, True), (1, False)]
)
def test_systemd_supervises_only_a_unit_it_knows(monkeypatch, tmp_path, probe_returncode, supervised):
    """A host can run systemd and still never have been given the unit."""
    monkeypatch.setattr(manage.shutil, "which", lambda name: "/usr/bin/systemctl")
    monkeypatch.setattr(manage, "SYSTEMD_MARKER", tmp_path)
    monkeypatch.setattr(manage.subprocess, "run", lambda cmd, **kwargs: _completed(probe_returncode))

    assert manage._service_is_supervised() is supervised
