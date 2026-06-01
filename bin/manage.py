#!/usr/bin/env python3
"""
manage.py — CTI-Transmute management script

Usage:
    uv run manage <command>

Commands:
    init      First-time setup on a new machine (submodules + deps + DB)
    start     Start the website
    update    Pull latest code + sync deps + run DB migrations
    backup    Backup the PostgreSQL database
    deploy    Full deployment: backup + update + start
    db        Run Flask-Migrate commands (upgrade by default)
    help      Show this help message
"""

import datetime
import os
import secrets
import string
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

  {G}init{R}      {D}First-time setup on a new machine:{R}
              {D}  init submodules → sync deps → create DB → run migrations{R}
              {D}→ Run once right after cloning the repo{R}

  {G}start{R}     {D}Start the website{R}
              {D}→ Use this every time you want to run the app{R}

  {G}update{R}    {D}Pull latest code from git + sync deps + run DB migrations{R}
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

  {G}create_admin{R}  {D}Create an emergency admin account (first name, last name, email){R}
              {D}Generates a random password and shows it once.{R}
              {D}→ Use this if all admin accounts have been deleted{R}

  {G}help{R}      {D}Show this message{R}

{W}Examples:{R}

  {D}# Fresh install on a new machine{R}
  {G}git clone --recurse-submodules https://github.com/MISP/cti-transmute.git{R}
  {G}cd cti-transmute{R}
  {G}uv run manage init{R}
  {G}uv run manage start{R}

  {D}# Daily use — just start the app{R}
  {G}uv run manage start{R}

  {D}# After a git push from your dev machine{R}
  {G}uv run manage update{R}
  {G}uv run manage start{R}

  {D}# Full production deployment{R}
  {G}uv run manage deploy{R}

{W}Project root:{R} {D}{ROOT}{R}
""")


def _run_db_upgrade() -> None:
    """Run flask db upgrade in the correct environment."""
    env = os.environ.copy()
    env["TRANSMUTE_HOME"] = str(ROOT)
    env["FLASK_APP"] = "website.web"
    cmd = ["uv", "run", "flask", "--app", "website.web", "db", "upgrade"]
    info(f"$ {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=ROOT, env=env)
    if result.returncode != 0:
        error("flask db upgrade failed")
        sys.exit(result.returncode)
    ok("Database schema up to date")


def cmd_init() -> None:
    """First-time setup on a new machine."""
    header("Initialising CTI-Transmute (first-time setup)")

    info("Initialising git submodules…")
    run(["git", "submodule", "update", "--init", "--recursive"])
    ok("Submodules ready")

    info("Syncing Python dependencies…")
    run(["uv", "sync"])
    ok("Dependencies installed")

    # Try to create the PostgreSQL user and database if they don't exist yet.
    # Best-effort — may fail if the OS user has no PostgreSQL superuser rights.
    header("Setting up PostgreSQL database")
    info(f"Attempting to create role '{DB_USER}' and database '{DB_NAME}'…")
    create_role_sql  = f"DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='{DB_USER}') THEN CREATE ROLE {DB_USER} WITH LOGIN PASSWORD '{DB_PASSWORD}'; END IF; END $$;"
    create_db_sql    = f"SELECT 'ok' FROM pg_database WHERE datname='{DB_NAME}'"

    r1 = subprocess.run(
        ["psql", "-h", DB_HOST, "-p", DB_PORT, "-U", "postgres", "-c", create_role_sql],
        cwd=ROOT, capture_output=True, text=True,
    )
    if r1.returncode == 0:
        ok(f"Role '{DB_USER}' ensured")
        # Check if database exists, create if not
        r2 = subprocess.run(
            ["psql", "-h", DB_HOST, "-p", DB_PORT, "-U", "postgres", "-tAc", create_db_sql],
            cwd=ROOT, capture_output=True, text=True,
        )
        if r2.stdout.strip() != "ok":
            subprocess.run(
                ["psql", "-h", DB_HOST, "-p", DB_PORT, "-U", "postgres", "-c",
                 f"CREATE DATABASE {DB_NAME} OWNER {DB_USER};"],
                cwd=ROOT, check=True,
            )
            ok(f"Database '{DB_NAME}' created")
        else:
            ok(f"Database '{DB_NAME}' already exists")
    else:
        info("Could not connect as postgres superuser — skipping automatic DB creation.")
        info(f"Create the role and database manually before continuing:")
        print(f"\n    psql -U postgres -c \"CREATE ROLE {DB_USER} WITH LOGIN PASSWORD '{DB_PASSWORD}';\"")
        print(f"    psql -U postgres -c \"CREATE DATABASE {DB_NAME} OWNER {DB_USER};\"\n")

    info("Running database migrations…")
    _run_db_upgrade()

    header("Init complete")
    ok("Everything is ready. Run:  uv run manage start")


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

    info("Running database migrations…")
    _run_db_upgrade()


def cmd_deploy() -> None:
    cmd_backup()
    cmd_update()
    cmd_start()


def cmd_create_admin() -> None:
    """Create an emergency admin account when all admins have been deleted."""
    W = "\033[1;37m"
    G = "\033[1;32m"
    Y = "\033[1;33m"
    R = "\033[0m"

    header("Create Emergency Admin Account")
    print(f"  {W}This command creates a new admin user directly in the database.{R}")
    print(f"  {Y}Use this only if all admin accounts have been deleted.{R}\n")

    # ── Collect inputs ────────────────────────────────────────────────────────
    first_name = input("  First name : ").strip()
    if not first_name:
        error("First name is required.")
        sys.exit(1)

    last_name = input("  Last name  : ").strip()

    email = input("  Email      : ").strip()
    if not email or "@" not in email or "." not in email.split("@")[-1]:
        error("Invalid email address.")
        sys.exit(1)

    # ── Generate password & API key ───────────────────────────────────────────
    alphabet = string.ascii_letters + string.digits + "!@#$%&*"
    password = "".join(secrets.choice(alphabet) for _ in range(20))
    api_key  = secrets.token_hex(30)

    # Hash the password with werkzeug (same as the app)
    try:
        from werkzeug.security import generate_password_hash
    except ImportError:
        error("werkzeug is not installed. Run 'uv sync' first.")
        sys.exit(1)
    password_hash = generate_password_hash(password)

    # ── Connect to PostgreSQL and insert ──────────────────────────────────────
    try:
        import psycopg2
    except ImportError:
        error("psycopg2 is not installed. Run 'uv sync' first.")
        sys.exit(1)

    info("Connecting to the database…")
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=int(DB_PORT),
            user=DB_USER, password=DB_PASSWORD,
            dbname=DB_NAME,
        )
    except Exception as e:
        error(f"Could not connect to the database: {e}")
        sys.exit(1)

    try:
        cur = conn.cursor()

        # Check if email already exists
        cur.execute('SELECT id, admin FROM "user" WHERE email = %s', (email,))
        existing = cur.fetchone()
        if existing:
            user_id, is_admin = existing
            if is_admin:
                error(f"An admin account with email '{email}' already exists (id={user_id}).")
            else:
                error(f"A non-admin account with email '{email}' already exists (id={user_id}).")
                info("To promote it to admin, run:")
                print(f'\n    UPDATE "user" SET admin = true WHERE email = \'{email}\';\n')
            conn.close()
            sys.exit(1)

        cur.execute(
            """
            INSERT INTO "user"
                (first_name, last_name, email, admin, password_hash, api_key, is_connected)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (first_name, last_name, email, True, password_hash, api_key, False),
        )
        new_id = cur.fetchone()[0]
        conn.commit()
    except Exception as e:
        conn.rollback()
        error(f"Database error: {e}")
        sys.exit(1)
    finally:
        conn.close()

    # ── Display result ────────────────────────────────────────────────────────
    border = "─" * 52
    print(f"""
\033[1;32m  {border}
  ✓  Admin account created successfully
  {border}\033[0m

  {W}ID         :{R}  {new_id}
  {W}Name       :{R}  {first_name} {last_name}
  {W}Email      :{R}  {email}
  {W}Password   :{R}  {G}{password}{R}
  {W}Admin      :{R}  {G}yes{R}

  {Y}⚠  Save this password now — it will not be shown again.{R}
""")
    ok("You can now log in at /account/login with the credentials above.")


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
    "init":         cmd_init,
    "start":        cmd_start,
    "backup":       cmd_backup,
    "update":       cmd_update,
    "deploy":       cmd_deploy,
    "db":           cmd_db,
    "create_admin": cmd_create_admin,
    "help":         cmd_help,
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