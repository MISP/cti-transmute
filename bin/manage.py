#!/usr/bin/env python3
"""
manage.py — CTI-Transmute management script

Usage:
    uv run manage <command>

Commands:
    init             First-time setup on a new machine (submodules + deps + DB)
    start            Run the website in the foreground (development)
    update           Pull latest code + sync deps + run DB migrations
    update-datasets  Refresh the MISP taxonomy/galaxy submodules to upstream HEAD
    backup           Backup the PostgreSQL database
    deploy           Full deployment: backup + update + restart the service
    db               Run Flask-Migrate commands (upgrade by default)
    help             Show this help message
"""

import datetime
import os
import secrets
import shutil
import string
import subprocess
import sys
from pathlib import Path

ROOT    = Path(__file__).resolve().parent.parent
VENV_UV = ["uv", "run"]

# The unit documented in README.md, and the one both dev-container
# provisioners generate.
SERVICE_NAME = "cti-transmute.service"
# The submodules `update-datasets` refreshes to upstream HEAD. pivotick is
# left out on purpose: it is a pinned library, not a MISP dataset.
DATASET_SUBMODULES = ["submodules/misp-taxonomies", "submodules/misp-galaxy"]
# Present only where systemd is PID 1: a container image can ship systemctl
# without ever running systemd.
SYSTEMD_MARKER = Path("/run/systemd/system")

# ── Database config ───────────────────────────────────────────────────────────
DB_USER     = "cti_user"
DB_PASSWORD = "cti_pass"
DB_HOST     = "localhost"
DB_PORT     = "5432"
DB_NAME     = "cti_db"

# Revision embodied by a schema built with db.create_all() while the Alembic
# chain was mid-refactor (the bin/dev_container.sh bootstrap): everything up
# to this revision is already in the models, so an unstamped database only
# needs the migrations that come after it (data migrations).
CREATE_ALL_SCHEMA_REV = "a7b9c1d3e5f7"


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

  {G}start{R}     {D}Run the website in the foreground (applies pending DB migrations first){R}
              {D}→ Development command: it dies with your shell and nothing{R}
              {D}  restarts it. In production the systemd unit owns the service{R}
              {D}  — see the deployment section of README.md{R}

  {G}update{R}    {D}Pull latest code from git + sync deps + run DB migrations{R}
              {D}→ Use this after someone pushed new code{R}

  {G}update-datasets{R}  {D}Refresh misp-taxonomies + misp-galaxy to upstream HEAD{R}
              {D}→ Deliberately separate from 'update', which checks out the{R}
              {D}  pinned pointers so deploys stay reproducible{R}
              {D}→ Then import the new tags from the Tag Management admin page{R}
              {D}→ Commit the moved pointers, or the next 'update' reverts them{R}

  {G}backup{R}    {D}Backup the PostgreSQL database to backups/{R}
              {D}→ Use this before any risky operation{R}

  {G}deploy{R}    {D}Full deployment in one command:{R}
              {D}  backup → update → systemctl restart {SERVICE_NAME}{R}
              {D}→ Use this on your production server{R}
              {D}→ Without systemd it prints the restart command instead{R}

  {G}db{R}        {D}Run Flask-Migrate commands (defaults to 'upgrade'){R}
              {D}→ uv run manage db          # same as flask db upgrade{R}
              {D}→ uv run manage db migrate  # generate a new migration{R}
              {D}→ uv run manage db downgrade{R}

  {G}psql{R}      {D}Open an interactive psql session on the project database{R}
              {D}→ Connects as {DB_USER} to {DB_NAME} — no password needed{R}

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

  {D}# Daily development — run the app in this terminal{R}
  {G}uv run manage start{R}

  {D}# After a git push from your dev machine{R}
  {G}uv run manage update{R}
  {G}uv run manage start{R}

  {D}# Full production deployment{R}
  {G}uv run manage deploy{R}

{W}Project root:{R} {D}{ROOT}{R}
""")


def _flask_db(*sub: str) -> None:
    """Run a flask db sub-command in the correct environment."""
    env = os.environ.copy()
    env["TRANSMUTE_HOME"] = str(ROOT)
    env["FLASK_APP"] = "website.web"
    cmd = ["uv", "run", "flask", "--app", "website.web", "db", *sub]
    info(f"$ {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=ROOT, env=env)
    if result.returncode != 0:
        error(f"flask db {' '.join(sub)} failed")
        sys.exit(result.returncode)


def _db_state() -> str:
    """How the database was bootstrapped: 'versioned', 'unstamped' or 'fresh'."""
    try:
        import psycopg2
    except ImportError:
        error("psycopg2 is not installed. Run 'uv sync' first.")
        sys.exit(1)
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=int(DB_PORT),
            user=DB_USER, password=DB_PASSWORD,
            dbname=DB_NAME, connect_timeout=5,
        )
    except Exception as e:
        error(f"Could not connect to the database: {e}")
        info("Is PostgreSQL running? (macOS container: `service postgresql start` inside it)")
        sys.exit(1)
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT to_regclass('public.alembic_version') IS NOT NULL,"
            "       to_regclass('public.conversion') IS NOT NULL"
        )
        has_alembic, has_schema = cur.fetchone()
    finally:
        conn.close()
    if has_alembic:
        return "versioned"
    return "unstamped" if has_schema else "fresh"


_DRIFT_PROBE = (
    "from alembic.autogenerate import compare_metadata; "
    "from alembic.migration import MigrationContext; "
    "from website.web import application, db; "
    "import website.db_class.db; "
    "ctx = application.app_context(); ctx.push(); "
    "conn = db.engine.connect(); "
    "diff = compare_metadata(MigrationContext.configure(conn), db.metadata); "
    "conn.close(); "
    "print('no-drift' if not diff else 'drift')"
)


def unstamped_target(schema_matches_models: bool) -> str:
    """Which revision to stamp an unstamped database at.

    An unstamped database was built by ``db.create_all()``, so it embodies the
    models of whatever checkout bootstrapped it - and that is not necessarily
    ``CREATE_ALL_SCHEMA_REV``. When the schema still matches today's models
    there is nothing for the migrations to do, and stamping anything older
    would replay revisions against tables that already exist: the newest one
    creates ``bulk_tag_job``, so the upgrade would die on a table it finds in
    place. Only a schema that has drifted behind the models needs the old
    stamp-then-upgrade path.
    """
    return "head" if schema_matches_models else CREATE_ALL_SCHEMA_REV


def _schema_matches_models() -> bool:
    """True when the live schema already embodies every model."""
    return run_capture([*VENV_UV, "python", "-c", _DRIFT_PROBE]).endswith("no-drift")


def _run_db_upgrade() -> None:
    """Bring the database to the latest migration, whatever its bootstrap.

    - fresh (no tables): build the schema from the models and stamp head —
      the early migration chain is not replayable on an empty database;
    - unstamped (tables from a db.create_all() bootstrap, no alembic_version):
      stamp what the schema actually embodies, then upgrade so any migrations
      that follow it run;
    - versioned: plain upgrade.
    """
    state = _db_state()
    if state == "fresh":
        info("Empty database — building the schema from the models…")
        run([*VENV_UV, "python", "-c",
             "from website.web import application, db; "
             "import website.db_class.db; "
             "ctx = application.app_context(); ctx.push(); db.create_all()"])
        _flask_db("stamp", "head")
    elif state == "unstamped":
        target = unstamped_target(_schema_matches_models())
        if target == "head":
            info("Schema present but unversioned, and already matching the "
                 "models — stamping head…")
            _flask_db("stamp", "head")
        else:
            info(f"Schema present but unversioned — stamping {target} first…")
            _flask_db("stamp", target)
            _flask_db("upgrade")
    else:
        _flask_db("upgrade")
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
        info("Create the role and database manually before continuing:")
        print(f"\n    psql -U postgres -c \"CREATE ROLE {DB_USER} WITH LOGIN PASSWORD '{DB_PASSWORD}';\"")
        print(f"    psql -U postgres -c \"CREATE DATABASE {DB_NAME} OWNER {DB_USER};\"\n")

    info("Running database migrations…")
    _run_db_upgrade()

    header("Init complete")
    ok("Everything is ready. Run:  uv run manage start")


def cmd_start() -> None:
    header("Starting CTI-Transmute (foreground — development)")
    info("Nothing restarts this process; production runs it under systemd.")
    info("Making sure the database is on the latest migration…")
    _run_db_upgrade()
    try:
        run([*VENV_UV, "start_website"])
    except KeyboardInterrupt:
        print("\n\033[0;37m  · Server stopped.\033[0m")


def cmd_backup() -> None:
    header("Backing up database")

    backup_dir = Path(
        os.environ.get("BACKUP_DIR", ROOT / "website" / "db_class" / "backups")
    ).expanduser()
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

    try:
        display_path = backup_file.relative_to(ROOT)
    except ValueError:
        display_path = backup_file
    info(f"Writing to {display_path}")
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


def _submodule_sha(path: str) -> str:
    """The revision checked out in one submodule, or '?' when there is none.

    An uninitialised submodule is an empty directory, where `git rev-parse`
    walks up and answers with the *superproject's* revision - so the checkout
    is tested first rather than taking git's answer at face value.
    """
    if not (ROOT / path / ".git").exists():
        return "?"
    return run_capture(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT / path) or "?"


def cmd_update_datasets() -> None:
    """Refresh the MISP dataset submodules to upstream HEAD.

    Deliberately not part of `update`, which checks out the pinned pointers:
    advancing misp-taxonomies and misp-galaxy on every update would make
    deploys irreproducible and hand two operators updating a week apart two
    different tag sets. Moving the pointers stays an explicit operator act.
    """
    header("Refreshing the MISP dataset submodules")

    before = {path: _submodule_sha(path) for path in DATASET_SUBMODULES}
    run(["git", "submodule", "update", "--remote", *DATASET_SUBMODULES])

    moved, uninitialised = [], []
    for path in DATASET_SUBMODULES:
        after = _submodule_sha(path)
        if after == "?":
            uninitialised.append(path)
            error(f"{path} is not initialised — nothing was refreshed")
        elif after == before[path]:
            ok(f"{path} already current ({after})")
        else:
            moved.append(path)
            ok(f"{path} {before[path]} → {after}")

    if moved:
        info("Load the new data from the Tag Management admin page, with the")
        info("Taxonomies and Galaxies import buttons.")
        info("The new submodule pointers are uncommitted; the next `manage update`")
        info("checks the old ones back out until you commit them:")
        print(f"\n    git add {' '.join(moved)}")
        print("    git commit -m 'chg: [submodules] Refresh the MISP datasets'\n")
    elif not uninitialised:
        info("Nothing moved — the working tree is unchanged.")

    if uninitialised:
        # `git submodule update --remote` says "not initialized" and still
        # exits 0, so the refresh has to fail here or it reads as a success.
        info("A clone made without --recurse-submodules has no dataset to")
        info("refresh. Check the submodules out first:")
        print("\n    uv run manage init\n")
        sys.exit(1)


def _service_is_supervised() -> bool:
    """Whether systemd runs here and knows the unit.

    Both halves matter: a Docker image can carry systemctl without systemd as
    PID 1, and a host running systemd may never have been given the unit.
    """
    if not shutil.which("systemctl") or not SYSTEMD_MARKER.is_dir():
        return False
    probe = subprocess.run(
        ["systemctl", "cat", SERVICE_NAME],
        capture_output=True, text=True
    )
    return probe.returncode == 0


def _restart_command() -> list[str]:
    """The restart, elevated unless this process is already root.

    A deploy runs as whoever owns the checkout - under root, git pull and
    uv sync leave root-owned files behind - so the restart is the one step
    that needs elevating, and polkit refuses it unelevated.
    """
    command = ["systemctl", "restart", SERVICE_NAME]
    if os.geteuid() == 0 or not shutil.which("sudo"):
        return command
    return ["sudo", *command]


def _restart_service() -> None:
    """Hand the new code to the supervisor, or say that nobody took it.

    Never silently skipped: a deploy that leaves the old code serving without a
    word is worse than one that names what it did not do.
    """
    header("Restarting the service")
    command = _restart_command()
    printable = " ".join(command if command[0] == "sudo" else ["sudo", *command])

    if not _service_is_supervised():
        info(f"No systemd unit named {SERVICE_NAME} on this host.")
        info("The new code is in place but nothing was restarted — restart")
        info("the service yourself (see the deployment section of README.md):")
        print(f"\n    {printable}\n")
        return

    result = run(command, check=False)
    if result.returncode != 0:
        error("Restart failed — the old code is still serving.")
        info("Run it yourself, as root:")
        print(f"\n    {printable}\n")
        sys.exit(result.returncode)
    ok(f"{SERVICE_NAME} restarted")


def cmd_deploy() -> None:
    cmd_backup()
    cmd_update()
    _restart_service()


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


def cmd_psql() -> None:
    """Open an interactive psql session on the project database."""
    header("Connecting to database")
    info(f"Host: {DB_HOST}:{DB_PORT}  DB: {DB_NAME}  User: {DB_USER}")

    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASSWORD

    result = subprocess.run(
        ["psql", "-h", DB_HOST, "-p", DB_PORT, "-U", DB_USER, DB_NAME],
        env=env,
    )
    if result.returncode not in (0, 1):
        error("psql exited with an error.")
        sys.exit(result.returncode)


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
    "init":            cmd_init,
    "start":           cmd_start,
    "backup":          cmd_backup,
    "update":          cmd_update,
    "update-datasets": cmd_update_datasets,
    "deploy":          cmd_deploy,
    "db":              cmd_db,
    "psql":            cmd_psql,
    "create_admin":    cmd_create_admin,
    "help":            cmd_help
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