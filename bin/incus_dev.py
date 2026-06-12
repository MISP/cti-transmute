#!/usr/bin/env python3
"""Create persistent CTI-Transmute development containers with Incus."""

from __future__ import annotations

import argparse
import datetime as dt
import grp
import json
import os
import pwd
import re
import shlex
import shutil
import subprocess
import sys
import textwrap
import time
from pathlib import Path


BASE_ALIAS = "cti-transmute-base"
BUILD_NAME = "cti-transmute-base-building"
SOURCE_IMAGE = "images:ubuntu/24.04"
WORKSPACE = "/workspace/cti-transmute"
RUNTIME_ROOT = "/var/lib/cti-transmute"
DEVELOPER = "developer"
DEV_UID = 1000
DEV_GID = 1000
INCUS_GROUP = "incus-admin"
INCUS_SOCKET = Path("/var/lib/incus/unix.socket")
INCUS_INSTALL_URL = "https://linuxcontainers.org/incus/docs/main/installing/"
METADATA_PREFIX = "user.cti_transmute"
ADMIN_EMAIL = "admin@admin.admin"
ADMIN_PASSWORD = "admin"

PROVISION_ENV = {
    "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
    "DEBIAN_FRONTEND": "noninteractive",
}

BASE_PACKAGES = [
    "build-essential",
    "ca-certificates",
    "curl",
    "fonts-dejavu-core",
    "git",
    "iproute2",
    "libcairo2",
    "libffi-dev",
    "libgdk-pixbuf-2.0-0",
    "libharfbuzz0b",
    "libjpeg-turbo8",
    "libopenjp2-7",
    "libpango-1.0-0",
    "libpangocairo-1.0-0",
    "libpangoft2-1.0-0",
    "libpq-dev",
    "pkg-config",
    "postgresql",
    "postgresql-client",
    "python3",
    "python3-dev",
    "python3-venv",
    "rsync",
    "shared-mime-info",
]


class DevError(RuntimeError):
    pass


def info(message: str) -> None:
    print(f"[incus-dev] {message}")


def command_text(command: list[str]) -> str:
    return shlex.join(str(part) for part in command)


def run(
    command: list[str],
    *,
    check: bool = True,
    capture: bool = False,
    input_text: str | None = None,
    quiet: bool = False,
) -> subprocess.CompletedProcess[str]:
    command = [str(part) for part in command]
    if not quiet:
        info(f"$ {command_text(command)}")
    try:
        result = subprocess.run(
            command,
            check=False,
            text=True,
            input=input_text,
            capture_output=capture,
        )
    except FileNotFoundError as exc:
        raise DevError(f"Command not found: {command[0]}") from exc
    if check and result.returncode != 0:
        detail = ""
        if capture:
            detail = (result.stderr or result.stdout).strip()
        suffix = f": {detail}" if detail else ""
        raise DevError(f"Command failed ({result.returncode}): {command_text(command)}{suffix}")
    return result


def probe(command: list[str]) -> subprocess.CompletedProcess[str]:
    return run(command, check=False, capture=True, quiet=True)


def incus(*args: str) -> list[str]:
    return ["incus", *args]


def current_identity() -> tuple[str, int, int]:
    entry = pwd.getpwuid(os.getuid())
    return entry.pw_name, entry.pw_uid, entry.pw_gid


# ── Host readiness ────────────────────────────────────────────────────────────

def incus_available() -> bool:
    return shutil.which("incus") is not None


def in_incus_group() -> bool:
    try:
        target_gid = grp.getgrnam(INCUS_GROUP).gr_gid
    except KeyError:
        return False
    return target_gid == os.getgid() or target_gid in os.getgroups()


def daemon_reachable() -> bool:
    return incus_available() and probe(incus("info")).returncode == 0


def incus_initialized() -> bool:
    storage = probe(incus("storage", "list", "--format", "csv"))
    network = probe(incus("network", "list", "--format", "csv"))
    return (
        storage.returncode == 0 and bool(storage.stdout.strip())
        and network.returncode == 0 and bool(network.stdout.strip())
    )


def host_issues() -> list[str]:
    if not incus_available():
        return ["Incus client is not installed (no `incus` on PATH)"]

    issues: list[str] = []
    if not INCUS_SOCKET.exists():
        issues.append(f"Incus daemon is not installed or not running ({INCUS_SOCKET} missing)")
    if not in_incus_group():
        username, _, _ = current_identity()
        issues.append(f"{username} is not in the '{INCUS_GROUP}' group")
    if not daemon_reachable():
        # A missing socket or group membership above is the cause; only report a
        # separate connectivity issue when neither of those explains it.
        if INCUS_SOCKET.exists() and in_incus_group():
            issues.append(f"Cannot reach the Incus daemon at {INCUS_SOCKET}")
        return issues
    if not incus_initialized():
        issues.append("Incus is not initialized (run: incus admin init --minimal)")
    return issues


def require_host() -> None:
    issues = host_issues()
    if issues:
        raise DevError("Host is not ready:\n  - " + "\n  - ".join(issues))


def cmd_host_check(_: argparse.Namespace) -> int:
    issues = host_issues()
    if not issues:
        info("Host is ready for CTI-Transmute Incus containers")
        return 0
    print("Host setup is incomplete:")
    for issue in issues:
        print(f"  - {issue}")
    print("\nRun: ./bin/incus_dev.py host setup")
    return 1


def cmd_host_setup(_: argparse.Namespace) -> int:
    username, _, _ = current_identity()

    if not incus_available() or not INCUS_SOCKET.exists():
        raise DevError(
            "Incus is not installed or its daemon is not running. This tool "
            "configures Incus for development but does not install it — the "
            "package source and version are your choice. Install Incus "
            f"({INCUS_INSTALL_URL}), start the service, then re-run host setup."
        )

    if not in_incus_group():
        run(["sudo", "usermod", "-aG", INCUS_GROUP, username])
        info(
            f"Added {username} to '{INCUS_GROUP}'. Log out and back in "
            f"(or run: newgrp {INCUS_GROUP}), then re-run: ./bin/incus_dev.py host setup"
        )
        return 0

    if not daemon_reachable():
        raise DevError(
            f"Cannot reach the Incus daemon at {INCUS_SOCKET} even though {username} "
            f"is in '{INCUS_GROUP}'. Is the service running? Try: "
            "sudo systemctl enable --now incus"
        )

    if not incus_initialized():
        run(incus("admin", "init", "--minimal"))

    issues = host_issues()
    if issues:
        raise DevError("Host setup remains incomplete:\n  - " + "\n  - ".join(issues))
    info("Host setup complete")
    return 0


# ── Instance helpers ──────────────────────────────────────────────────────────

def instance_exists(name: str) -> bool:
    return probe(incus("info", name)).returncode == 0


def require_container(name: str) -> None:
    if not instance_exists(name):
        raise DevError(f"Container does not exist: {name}")


def _list_entry(name: str) -> dict | None:
    result = probe(incus("list", name, "--format", "json"))
    if result.returncode != 0:
        return None
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError:
        return None
    for entry in data:
        if entry.get("name") == name:
            return entry
    return None


def instance_state(name: str) -> str:
    entry = _list_entry(name)
    if entry is None:
        return "MISSING"
    return entry.get("status", "UNKNOWN").upper()


def instance_running(name: str) -> bool:
    return instance_state(name) == "RUNNING"


def instance_ip(name: str) -> str | None:
    entry = _list_entry(name)
    if entry is None:
        return None
    network = ((entry.get("state") or {}).get("network")) or {}
    for iface, details in network.items():
        if iface == "lo":
            continue
        for address in details.get("addresses", []):
            if address.get("family") == "inet" and address.get("scope") == "global":
                return address.get("address")
    return None


def instance_config(name: str, key: str) -> str:
    result = probe(incus("config", "get", name, key))
    return result.stdout.strip() if result.returncode == 0 else ""


def selected_worktree(name: str) -> str:
    return instance_config(name, f"{METADATA_PREFIX}.worktree")


def image_exists(alias: str) -> bool:
    return probe(incus("image", "info", alias)).returncode == 0


def wait_for_exec(name: str, timeout: int = 60) -> None:
    deadline = time.monotonic() + timeout
    command = incus("exec", name, "--", "true")
    while time.monotonic() < deadline:
        if probe(command).returncode == 0:
            return
        time.sleep(1)
    raise DevError(f"Container started but is not ready for exec: {name}")


def wait_for_network(name: str, timeout: int = 60) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if instance_ip(name):
            return
        time.sleep(1)
    raise DevError(f"Container did not obtain an IPv4 address: {name}")


def start_container(name: str) -> None:
    require_container(name)
    if instance_running(name):
        return
    run(incus("start", name))
    wait_for_exec(name)


def stop_container(name: str) -> None:
    require_container(name)
    if instance_running(name):
        run(incus("stop", name))


def destroy_container(name: str) -> None:
    require_container(name)
    run(incus("delete", "--force", name))


def exec_script(name: str, script: str, env: dict[str, str] | None = None) -> None:
    command = incus("exec", name)
    for key, value in (env or {}).items():
        command += ["--env", f"{key}={value}"]
    command += ["--", "bash", "-se"]
    run(command, input_text=script)


# ── Runtime Base image ────────────────────────────────────────────────────────

def provision_base_script() -> str:
    packages = " ".join(shlex.quote(package) for package in BASE_PACKAGES)
    return textwrap.dedent(
        f"""\
        export DEBIAN_FRONTEND=noninteractive
        apt-get update
        apt-get install -y --no-install-recommends {packages}

        if ! command -v uv >/dev/null 2>&1; then
            curl -LsSf https://astral.sh/uv/install.sh -o /tmp/install-uv.sh
            UV_INSTALL_DIR=/usr/local/bin UV_NO_MODIFY_PATH=1 sh /tmp/install-uv.sh
            rm -f /tmp/install-uv.sh
        fi

        if ! getent group {DEV_GID} >/dev/null; then
            groupadd --gid {DEV_GID} {DEVELOPER}
        fi
        if ! getent passwd {DEV_UID} >/dev/null; then
            useradd --create-home --uid {DEV_UID} --gid {DEV_GID} --shell /bin/bash {DEVELOPER}
        fi

        install -d -o {DEV_UID} -g {DEV_GID} \
            {RUNTIME_ROOT}/venv \
            {RUNTIME_ROOT}/uv-cache \
            {RUNTIME_ROOT}/flask-session \
            {RUNTIME_ROOT}/backups
        systemctl enable postgresql.service

        command -v git
        command -v psql
        command -v python3
        command -v uv
        test "$(id -u {DEVELOPER})" = "{DEV_UID}"
        test "$(id -g {DEVELOPER})" = "{DEV_GID}"

        truncate --size 0 /etc/machine-id
        rm -f /var/lib/dbus/machine-id
        apt-get clean
        rm -rf /var/lib/apt/lists/*
        """
    )


def cmd_base_rebuild(_: argparse.Namespace) -> int:
    require_host()

    if instance_exists(BUILD_NAME):
        info(f"Removing stale build container: {BUILD_NAME}")
        destroy_container(BUILD_NAME)

    run(incus("launch", SOURCE_IMAGE, BUILD_NAME))
    try:
        wait_for_exec(BUILD_NAME)
        wait_for_network(BUILD_NAME)
        exec_script(BUILD_NAME, provision_base_script(), PROVISION_ENV)
    except Exception:
        info(f"Runtime Base build failed; preserved for inspection as {BUILD_NAME}")
        raise

    stop_container(BUILD_NAME)
    run(incus("publish", BUILD_NAME, "--alias", BASE_ALIAS, "--reuse"))
    destroy_container(BUILD_NAME)
    info(f"Runtime Base image rebuilt: {BASE_ALIAS}")
    return 0


def cmd_base_status(_: argparse.Namespace) -> int:
    if not image_exists(BASE_ALIAS):
        print("Runtime Base image: missing")
        return 1
    print(f"Runtime Base image: {BASE_ALIAS} (present)")
    return 0


# ── Test Containers ───────────────────────────────────────────────────────────

def validate_name(name: str) -> str:
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,62}", name):
        raise DevError(
            "Container names must be 1-63 lowercase letters, numbers, or hyphens"
        )
    if name.isdigit():
        raise DevError("Container names cannot be entirely numeric")
    if name in {BASE_ALIAS, BUILD_NAME}:
        raise DevError(f"Container name is reserved: {name}")
    return name


def validate_worktree(path: Path) -> Path:
    path = path.expanduser().resolve()
    for required in ["pyproject.toml", "uv.lock", ".git"]:
        if not (path / required).exists():
            raise DevError(f"Selected Worktree is missing {required}: {path}")

    result = run(
        ["git", "-C", str(path), "submodule", "status", "--recursive"],
        capture=True,
    )
    missing = [
        line for line in result.stdout.splitlines()
        if line.startswith("-") or line.startswith("U")
    ]
    if missing:
        raise DevError(
            "Selected Worktree has unavailable or conflicted submodules; "
            "the helper will not change Git state:\n  " + "\n  ".join(missing)
        )
    return path


def configure_instance(name: str, worktree: Path) -> None:
    _, uid, gid = current_identity()
    # Map the host identity onto the container's `developer` user so the
    # bind-mounted worktree is owned and writable by both sides.
    run(incus("config", "set", name, "raw.idmap", f"uid {uid} {DEV_UID}\ngid {gid} {DEV_GID}"))
    run(
        incus(
            "config", "device", "add", name, "worktree", "disk",
            f"source={worktree}", f"path={WORKSPACE}",
        )
    )
    run(
        incus(
            "config", "set", name,
            f"{METADATA_PREFIX}.managed=true",
            f"{METADATA_PREFIX}.worktree={worktree}",
            f"{METADATA_PREFIX}.created_at={dt.datetime.now(dt.timezone.utc).isoformat()}",
        )
    )


def runtime_setup_script(*, reset_database: bool) -> str:
    reset = "true" if reset_database else "false"
    return textwrap.dedent(
        f"""\
        export DEBIAN_FRONTEND=noninteractive
        cd {WORKSPACE}
        systemctl stop cti-transmute.service 2>/dev/null || true
        install -d -o {DEVELOPER} -g {DEVELOPER} \
            {RUNTIME_ROOT}/venv \
            {RUNTIME_ROOT}/uv-cache \
            {RUNTIME_ROOT}/flask-session \
            {RUNTIME_ROOT}/backups
        systemctl start postgresql.service

        if ! runuser -u postgres -- psql -tAc \
            "SELECT 1 FROM pg_roles WHERE rolname='cti_user'" | grep -qx 1; then
            runuser -u postgres -- psql --set=ON_ERROR_STOP=1 \
                -c "CREATE ROLE cti_user LOGIN PASSWORD 'cti_pass'"
        fi

        if {reset}; then
            runuser -u postgres -- dropdb --if-exists cti_db
            runuser -u postgres -- createdb --owner cti_user cti_db
        elif ! runuser -u postgres -- psql -tAc \
            "SELECT 1 FROM pg_database WHERE datname='cti_db'" | grep -qx 1; then
            runuser -u postgres -- createdb --owner cti_user cti_db
        fi

        runuser -u {DEVELOPER} -- env \
            HOME=/home/{DEVELOPER} \
            UV_PROJECT_ENVIRONMENT={RUNTIME_ROOT}/venv \
            UV_CACHE_DIR={RUNTIME_ROOT}/uv-cache \
            uv sync --locked --project {WORKSPACE}

        runuser -u {DEVELOPER} -- env \
            HOME=/home/{DEVELOPER} \
            TRANSMUTE_HOME={WORKSPACE} \
            FLASK_APP=website.web \
            SECRET_KEY=cti-transmute-development-only \
            SESSION_FILE_DIR={RUNTIME_ROOT}/flask-session \
            BACKUP_DIR={RUNTIME_ROOT}/backups \
            {RUNTIME_ROOT}/venv/bin/flask --app website.web db upgrade

        runuser -u {DEVELOPER} -- env \
            HOME=/home/{DEVELOPER} \
            TRANSMUTE_HOME={WORKSPACE} \
            SECRET_KEY=cti-transmute-development-only \
            SESSION_FILE_DIR={RUNTIME_ROOT}/flask-session \
            BACKUP_DIR={RUNTIME_ROOT}/backups \
            {RUNTIME_ROOT}/venv/bin/python - <<'PY'
        from website.db_class.db import User
        from website.web import application, db

        with application.app_context():
            user = User.query.filter_by(email={ADMIN_EMAIL!r}).first()
            if user is None:
                user = User(
                    first_name="Development",
                    last_name="Admin",
                    email={ADMIN_EMAIL!r},
                    api_key="development-admin-api-key",
                    admin=True,
                    is_connected=False,
                )
                db.session.add(user)
            user.admin = True
            user.password = {ADMIN_PASSWORD!r}
            db.session.commit()
        PY

        cat >/etc/systemd/system/cti-transmute.service <<'UNIT'
        [Unit]
        Description=CTI-Transmute development service
        After=network-online.target postgresql.service
        Requires=postgresql.service

        [Service]
        Type=simple
        User={DEVELOPER}
        Group={DEVELOPER}
        WorkingDirectory={WORKSPACE}
        Environment=HOME=/home/{DEVELOPER}
        Environment=TRANSMUTE_HOME={WORKSPACE}
        Environment=FLASK_APP=website.web
        Environment=FLASK_DEBUG=true
        Environment=SECRET_KEY=cti-transmute-development-only
        Environment=SESSION_FILE_DIR={RUNTIME_ROOT}/flask-session
        Environment=BACKUP_DIR={RUNTIME_ROOT}/backups
        Environment=UV_PROJECT_ENVIRONMENT={RUNTIME_ROOT}/venv
        Environment=UV_CACHE_DIR={RUNTIME_ROOT}/uv-cache
        Environment=PYTHONUNBUFFERED=1
        ExecStart={RUNTIME_ROOT}/venv/bin/start_website
        Restart=on-failure
        RestartSec=2

        [Install]
        WantedBy=multi-user.target
        UNIT

        systemctl daemon-reload
        systemctl enable --now cti-transmute.service

        for attempt in $(seq 1 30); do
            if curl --fail --silent --show-error http://127.0.0.1:6868/ >/dev/null; then
                exit 0
            fi
            sleep 1
        done
        systemctl status --no-pager cti-transmute.service || true
        journalctl --no-pager -u cti-transmute.service -n 100 || true
        exit 1
        """
    )


def print_container_ready(name: str) -> None:
    ip = instance_ip(name)
    print(f"Container: {name}")
    print(f"State:     {instance_state(name)}")
    if ip:
        print(f"URL:       http://{ip}:6868")
    print(f"Admin:     {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    worktree = selected_worktree(name)
    if worktree:
        print(f"Worktree:  {worktree}")


def cmd_create(args: argparse.Namespace) -> int:
    name = validate_name(args.name)
    if instance_exists(name):
        raise DevError(f"Container already exists: {name}")
    if not image_exists(BASE_ALIAS):
        raise DevError("Runtime Base image is missing; run: ./bin/incus_dev.py base rebuild")
    require_host()

    worktree = validate_worktree(Path(args.worktree))
    run(incus("init", BASE_ALIAS, name))
    configure_instance(name, worktree)
    try:
        start_container(name)
        wait_for_network(name)
        exec_script(name, runtime_setup_script(reset_database=True), PROVISION_ENV)
    except Exception:
        info(f"Creation failed; preserved for inspection as {name}")
        raise
    print_container_ready(name)
    return 0


def cmd_refresh(args: argparse.Namespace) -> int:
    name = validate_name(args.name)
    require_container(name)
    start_container(name)
    wait_for_network(name)
    exec_script(name, runtime_setup_script(reset_database=False), PROVISION_ENV)
    print_container_ready(name)
    return 0


def cmd_start(args: argparse.Namespace) -> int:
    name = validate_name(args.name)
    start_container(name)
    print_container_ready(name)
    return 0


def cmd_stop(args: argparse.Namespace) -> int:
    name = validate_name(args.name)
    stop_container(name)
    info(f"Stopped: {name}")
    return 0


def cmd_restart(args: argparse.Namespace) -> int:
    name = validate_name(args.name)
    stop_container(name)
    start_container(name)
    print_container_ready(name)
    return 0


def cmd_destroy(args: argparse.Namespace) -> int:
    name = validate_name(args.name)
    destroy_container(name)
    info(f"Destroyed: {name}")
    return 0


def cmd_status(args: argparse.Namespace) -> int:
    name = validate_name(args.name)
    require_container(name)
    print_container_ready(name)
    return 0


def cmd_shell(args: argparse.Namespace) -> int:
    name = validate_name(args.name)
    start_container(name)
    command = incus(
        "exec", name, "-t",
        "--cwd", WORKSPACE,
        "--user", str(DEV_UID),
        "--group", str(DEV_GID),
        "--env", f"HOME=/home/{DEVELOPER}",
        "--env", f"USER={DEVELOPER}",
        "--env", f"TRANSMUTE_HOME={WORKSPACE}",
        "--env", f"UV_PROJECT_ENVIRONMENT={RUNTIME_ROOT}/venv",
        "--env", f"UV_CACHE_DIR={RUNTIME_ROOT}/uv-cache",
        "--", "bash", "-l",
    )
    return run(command, check=False).returncode


def cmd_logs(args: argparse.Namespace) -> int:
    name = validate_name(args.name)
    start_container(name)
    journal = ["journalctl", "-u", "cti-transmute.service", "-n", str(args.lines)]
    command = incus("exec", name)
    if args.follow:
        command += ["-t"]
        journal.append("-f")
    else:
        journal.append("--no-pager")
    command += ["--", *journal]
    return run(command, check=False).returncode


def cmd_list(_: argparse.Namespace) -> int:
    result = probe(incus("list", "--format", "json"))
    if result.returncode != 0:
        require_host()
        raise DevError("Failed to list containers")
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError:
        data = []
    managed = [
        entry for entry in data
        if (entry.get("config") or {}).get(f"{METADATA_PREFIX}.managed") == "true"
    ]
    if not managed:
        print("No CTI-Transmute containers")
        return 0
    print(f"{'NAME':38} {'STATE':10} {'IP':15} WORKTREE")
    for entry in sorted(managed, key=lambda e: e.get("name", "")):
        name = entry.get("name", "")
        state = entry.get("status", "UNKNOWN").upper()
        ip = instance_ip(name) or "-"
        worktree = (entry.get("config") or {}).get(f"{METADATA_PREFIX}.worktree", "")
        print(f"{name:38} {state:10} {ip:15} {worktree}")
    return 0


# ── Entry point ───────────────────────────────────────────────────────────────

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Manage CTI-Transmute development containers with Incus"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    host = subparsers.add_parser("host", help="Check or configure the Incus host")
    host_sub = host.add_subparsers(dest="host_command", required=True)
    host_sub.add_parser("check").set_defaults(func=cmd_host_check)
    host_sub.add_parser("setup").set_defaults(func=cmd_host_setup)

    base = subparsers.add_parser("base", help="Manage the reusable Runtime Base image")
    base_sub = base.add_subparsers(dest="base_command", required=True)
    base_sub.add_parser("rebuild").set_defaults(func=cmd_base_rebuild)
    base_sub.add_parser("status").set_defaults(func=cmd_base_status)

    create = subparsers.add_parser("create", help="Create a ready Test Container")
    create.add_argument("name")
    create.add_argument("worktree", nargs="?", default=str(Path.cwd()))
    create.set_defaults(func=cmd_create)

    for command, function in [
        ("refresh", cmd_refresh),
        ("start", cmd_start),
        ("stop", cmd_stop),
        ("restart", cmd_restart),
        ("destroy", cmd_destroy),
        ("status", cmd_status),
        ("shell", cmd_shell),
    ]:
        command_parser = subparsers.add_parser(command)
        command_parser.add_argument("name")
        command_parser.set_defaults(func=function)

    logs = subparsers.add_parser("logs")
    logs.add_argument("name")
    logs.add_argument("-f", "--follow", action="store_true")
    logs.add_argument("-n", "--lines", type=int, default=200)
    logs.set_defaults(func=cmd_logs)

    subparsers.add_parser("list").set_defaults(func=cmd_list)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return int(args.func(args))
    except DevError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\nInterrupted", file=sys.stderr)
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
