#!/usr/bin/env python3
"""
manage.py — CTI-Transmute management script

Usage:
    uv run manage <command>

Commands:
    start     Start the website
    update    Pull latest code + rebuild assets if needed
    backup    Backup the PostgreSQL database
    deploy    Full deployment: backup + update + start
    help      Show this help message
"""

import datetime
import os
import subprocess
import sys
from pathlib import Path

ROOT    = Path(__file__).resolve().parent.parent
VENV_UV = ["uv", "run"]

# ── Database config ───────────────────────────────────────────────────────────
DB_USER     = "cti_user"
DB_PASSWORD = "cti_pass"
DB_HOST     = "localhost"
DB_PORT     = "5432"
DB_NAME     = "cti_db"


# ── Helpers ───────────────────────────────────────────────────────────────────

def header(text: str) -> None:
    print(f"\n\033[1;34m{'─' * 50}\033[0m")
    print(f"\033[1;34m  {text}\033[0m")
    print(f"\033[1;34m{'─' * 50}\033[0m")


def ok(text: str) -> None:
    print(f"\033[1;32m  ✓ {text}\033[0m")


def info(text: str) -> None:
    print(f"\033[0;37m  · {text}\033[0m")


def error(text: str) -> None:
    print(f"\033[1;31m  ✗ {text}\033[0m", file=sys.stderr)


def run(cmd: list[str], cwd: Path = ROOT, check: bool = True) -> subprocess.CompletedProcess:
    info(f"$ {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd)
    if check and result.returncode != 0:
        error(f"Command failed: {' '.join(cmd)}")
        sys.exit(result.returncode)
    return result


def run_capture(cmd: list[str], cwd: Path = ROOT) -> str:
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    return result.stdout.strip()


# ── Commands ──────────────────────────────────────────────────────────────────

def cmd_help() -> None:
    W  = "\033[1;37m"   # white bold
    B  = "\033[1;34m"   # blue bold
    G  = "\033[1;32m"   # green bold
    Y  = "\033[1;33m"   # yellow bold
    D  = "\033[0;37m"   # dim
    R  = "\033[0m"      # reset

    print(f"""
{B}╔══════════════════════════════════════════════════╗
║          CTI-Transmute — manage.py               ║
╚══════════════════════════════════════════════════╝{R}

{W}Usage:{R}
    {G}uv run manage{R} {Y}<command>{R}

{W}Commands:{R}

  {G}start{R}     {D}Start the website{R}
              {D}→ Use this every time you want to run the app{R}

  {G}update{R}    {D}Pull latest code from git + sync dependencies{R}
              {D}→ Use this after someone pushed new code{R}

  {G}backup{R}    {D}Backup the PostgreSQL database to backups/{R}
              {D}→ Use this before any risky operation{R}

  {G}deploy{R}    {D}Full deployment in one command:{R}
              {D}  backup → update → start{R}
              {D}→ Use this on your production server{R}

  {G}db{R}        {D}Run Flask-Migrate commands (defaults to 'upgrade'){R}
              {D}→ uv run manage db          # same as flask db upgrade{R}
              {D}→ uv run manage db migrate  # generate a new migration{R}
              {D}→ uv run manage db downgrade{R}

  {G}help{R}      {D}Show this message{R}

{W}Examples:{R}

  {D}# Daily use — just start the app{R}
  {G}uv run manage start{R}

  {D}# After a git push from your dev machine{R}
  {G}uv run manage update{R}
  {G}uv run manage start{R}

  {D}# Full production deployment{R}
  {G}uv run manage deploy{R}

{W}Project root:{R} {D}{ROOT}{R}
""")


def cmd_start() -> None:
    header("Starting CTI-Transmute")
    try:
        run([*VENV_UV, "start_website"])
    except KeyboardInterrupt:
        print("\n\033[0;37m  · Server stopped.\033[0m")


def cmd_backup() -> None:
    header("Backing up database")

    backup_dir = ROOT / "website" / "db_class" / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)

    timestamp   = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_file = backup_dir / f"{DB_NAME}_backup_{timestamp}.sql.gz"

    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASSWORD

    pg_cmd = [
        "pg_dump",
        "-h", DB_HOST, "-p", DB_PORT,
        "-U", DB_USER, "-F", "p",
        DB_NAME
    ]

    info(f"Writing to {backup_file.relative_to(ROOT)}")
    try:
        with open(backup_file, "wb") as f_out:
            dump = subprocess.Popen(pg_cmd, stdout=subprocess.PIPE, env=env)
            gzip = subprocess.Popen(["gzip"], stdin=dump.stdout, stdout=f_out)
            dump.stdout.close()
            gzip.communicate()
            if dump.wait() != 0:
                raise RuntimeError("pg_dump failed")
        ok(f"Backup saved: {backup_file.name}")
    except Exception as e:
        error(f"Backup failed: {e}")
        sys.exit(1)


def cmd_update() -> None:
    header("Updating CTI-Transmute")

    info("Pulling latest code…")
    run(["git", "pull"])
    ok("Code updated")

    info("Updating submodules…")
    run(["git", "submodule", "update", "--init", "--recursive"])
    ok("Submodules updated")

    info("Syncing Python dependencies…")
    run(["uv", "sync"])
    ok("Dependencies up to date")


def cmd_deploy() -> None:
    cmd_backup()
    cmd_update()
    cmd_start()


def cmd_db() -> None:
    """Run flask db commands with the correct app context.
    Usage: uv run manage db [upgrade|downgrade|migrate|...]
    Defaults to 'upgrade' if no sub-command is given.
    """
    sub = sys.argv[2:] if len(sys.argv) > 2 else ["upgrade"]
    env = os.environ.copy()
    env["TRANSMUTE_HOME"] = str(ROOT)
    env["FLASK_APP"] = "website.web"
    cmd = ["uv", "run", "flask", "--app", "website.web", "db"] + sub
    info(f"$ {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=ROOT, env=env)
    if result.returncode != 0:
        error(f"flask db {' '.join(sub)} failed")
        sys.exit(result.returncode)
    ok(f"flask db {' '.join(sub)} done")


# ── Entry point ───────────────────────────────────────────────────────────────

COMMANDS = {
    "start":  cmd_start,
    "backup": cmd_backup,
    "update": cmd_update,
    "deploy": cmd_deploy,
    "db":     cmd_db,
    "help":   cmd_help,
}


def main() -> None:
    # Auto-set TRANSMUTE_HOME so no .env file is needed
    if not os.environ.get("TRANSMUTE_HOME"):
        os.environ["TRANSMUTE_HOME"] = str(ROOT)
        info(f"TRANSMUTE_HOME set to {ROOT}")

    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        cmd_help()
        sys.exit(0)

    COMMANDS[sys.argv[1]]()


if __name__ == "__main__":
    main()