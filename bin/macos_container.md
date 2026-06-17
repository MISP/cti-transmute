# Running CTI-Transmute with Apple `container` on macOS

This is a personal operations runbook for running one or more persistent
CTI-Transmute development containers on macOS with Apple `container` 1.0.0.

The container uses Ubuntu 24.04 LTS. The macOS worktree is bind-mounted into the
container, so code edits on the host are immediately visible inside Linux.

## Model

- Host: macOS with Apple `container` installed.
- Guest: one persistent Ubuntu 24.04 container per feature branch or worktree.
- App port inside the container: `6868`.
- Host port: configurable per container. Use `6868` for the first one, then
  `6869`, `6870`, etc. for additional containers.
- Runtime data inside the container: PostgreSQL data, virtualenv, uv cache,
  Flask session files, and backups.
- Source code: mounted from macOS at `/workspace/cti-transmute`.
- App process: started manually in the foreground from a shell.

The repository's own management command remains the main control surface:

```bash
uv run manage init
uv run manage start
uv run manage update
uv run manage db
uv run manage psql
uv run manage create_admin
```

## Defaults

Run these commands from the macOS worktree you want to mount:

```bash
cd /Users/chrisr3d/git/MISP/cti-transmute

export NAME=cti-transmute-dev
export HOST_PORT=6868
export WORKTREE="$PWD"
export MOUNT=/workspace/cti-transmute
```

For a second feature container, use a different name and host port:

```bash
export NAME=cti-transmute-tags
export HOST_PORT=6869
export WORKTREE="$PWD"
export MOUNT=/workspace/cti-transmute
```

CTI-Transmute still listens on `6868` inside every container. Only the macOS
host port changes.

## Start Apple `container`

```bash
container system start
container system status
```

If `container system status` says the API server is not running, start it again
with `container system start`.

## Automated Install

The repository includes a script that runs the create, start, and first-install
commands from the detailed sections below:

```bash
bin/macos_container.sh --name cti-transmute-dev --host-port 6868
```

For a second feature container, use a different name and host port. A different
worktree is usually useful too:

```bash
bin/macos_container.sh \
  --name cti-transmute-tags \
  --host-port 6869 \
  --worktree /Users/chrisr3d/git/MISP/cti-transmute-tags
```

The script:

- Starts the Apple `container` system if needed.
- Fails if the container name already exists.
- Fails if the requested host port is already listening on macOS.
- Creates and starts the persistent Ubuntu container.
- Installs the system packages and `uv` inside the container.
- Creates `/root/cti-transmute.env` and runtime directories under `/opt/cti`.
- Starts PostgreSQL and creates the `cti_user` role and `cti_db` database.
- Syncs dependencies, creates the current schema from the models, and stamps the
  Alembic migration head.

It does not start the web application or create an admin user. After the script
finishes, use the normal manual operations:

```bash
container exec -it cti-transmute-dev bash

source /root/cti-transmute.env
service postgresql start
cd /workspace/cti-transmute
uv run manage start
```

Create an admin user only if you need one:

```bash
uv run manage create_admin
```

The following sections show the manual container setup. The script follows the
same system package, runtime directory, environment, and PostgreSQL setup, but
uses a current-schema bootstrap instead of `uv run manage init` because this
branch's Alembic chain is not fresh-install safe.

## Create A Persistent Container

Create the container once:

```bash
container create \
  --name "$NAME" \
  --publish "127.0.0.1:${HOST_PORT}:6868" \
  --mount "type=bind,source=${WORKTREE},target=${MOUNT}" \
  ubuntu:24.04 \
  sleep infinity
```

Start it:

```bash
container start "$NAME"
```

Open a shell:

```bash
container exec -it "$NAME" bash
```

All commands in the next sections run inside that container shell.

## First Install Inside The Container

Install system packages:

```bash
apt-get update
apt-get install -y --no-install-recommends \
  build-essential ca-certificates curl fonts-dejavu-core git iproute2 \
  libcairo2 libffi-dev libgdk-pixbuf-2.0-0 libharfbuzz0b libjpeg-turbo8 \
  libopenjp2-7 libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 \
  libpq-dev pkg-config postgresql postgresql-client python3 python3-dev \
  python3-venv shared-mime-info
```

Install `uv`:

```bash
curl -LsSf https://astral.sh/uv/install.sh \
  | env UV_INSTALL_DIR=/usr/local/bin UV_NO_MODIFY_PATH=1 sh
```

Create runtime directories outside the mounted worktree:

```bash
mkdir -p /opt/cti/venv /opt/cti/uv-cache /opt/cti/flask-session /opt/cti/backups
```

Set the development environment for this shell:

```bash
export TRANSMUTE_HOME=/workspace/cti-transmute
export FLASK_APP=website.web
export SECRET_KEY=cti-transmute-development-only
export SESSION_FILE_DIR=/opt/cti/flask-session
export BACKUP_DIR=/opt/cti/backups
export UV_PROJECT_ENVIRONMENT=/opt/cti/venv
export UV_CACHE_DIR=/opt/cti/uv-cache
export PYTHONUNBUFFERED=1
```

Optional but recommended: save the environment for future shells.

```bash
cat >/root/cti-transmute.env <<'EOF'
export TRANSMUTE_HOME=/workspace/cti-transmute
export FLASK_APP=website.web
export SECRET_KEY=cti-transmute-development-only
export SESSION_FILE_DIR=/opt/cti/flask-session
export BACKUP_DIR=/opt/cti/backups
export UV_PROJECT_ENVIRONMENT=/opt/cti/venv
export UV_CACHE_DIR=/opt/cti/uv-cache
export PYTHONUNBUFFERED=1
EOF

echo 'source /root/cti-transmute.env' >> /root/.bashrc
source /root/cti-transmute.env
```

Start PostgreSQL:

```bash
service postgresql start
```

Create the PostgreSQL role and database expected by CTI-Transmute:

```bash
runuser -u postgres -- psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='cti_user'" | grep -qx 1 \
  || runuser -u postgres -- psql -c "CREATE ROLE cti_user LOGIN PASSWORD 'cti_pass'"

runuser -u postgres -- psql -tAc "SELECT 1 FROM pg_database WHERE datname='cti_db'" | grep -qx 1 \
  || runuser -u postgres -- createdb --owner cti_user cti_db
```

Initialize the project schema:

```bash
cd /workspace/cti-transmute
git -c safe.directory=/workspace/cti-transmute submodule update --init --recursive
uv sync --locked

uv run python - <<'PY'
import website.db_class.db  # noqa: F401
from website.web import application, db

with application.app_context():
    db.create_all()
PY

uv run flask --app website.web db stamp head
```

The schema is created from the current models and then marked as being at the
current Alembic head. This avoids replaying the current migration chain on a
fresh database, because that chain still contains historical `convert` table
migrations that predate the current `conversion` table name.

If schema bootstrap fails because the role or database is missing, create them
manually, then rerun the commands in "Initialize the project schema":

```bash
service postgresql start

runuser -u postgres -- psql -c "CREATE ROLE cti_user LOGIN PASSWORD 'cti_pass'"
runuser -u postgres -- createdb --owner cti_user cti_db
```

Create an admin user if you need one:

```bash
uv run manage create_admin
```

The command prints a generated password once. Save it somewhere appropriate.

## Run The Web Interface

Inside the container:

```bash
cd /workspace/cti-transmute
source /root/cti-transmute.env
service postgresql start
uv run manage start
```

On macOS, open:

```text
http://127.0.0.1:6868
```

If this container used another host port, replace `6868` with `HOST_PORT`.
Example:

```text
http://127.0.0.1:6869
```

Leave this terminal open while testing. Stop the app with `Ctrl-C`.

## Daily Operations

List containers:

```bash
container list --all
```

Start an existing container:

```bash
container start "$NAME"
```

Open a shell:

```bash
container exec -it "$NAME" bash
```

Start the app from inside the container:

```bash
source /root/cti-transmute.env
service postgresql start
cd /workspace/cti-transmute
uv run manage start
```

Stop the app:

```text
Ctrl-C
```

Stop the container from macOS:

```bash
container stop "$NAME"
```

Delete a container from macOS:

```bash
container delete "$NAME"
```

Force-delete a running container:

```bash
container delete --force "$NAME"
```

## Update A Container After Code Changes

If you edited normal Python, HTML, CSS, or JavaScript files on macOS, restart
the foreground app process:

```text
Ctrl-C
uv run manage start
```

If dependencies, migrations, or submodules changed:

```bash
source /root/cti-transmute.env
service postgresql start
cd /workspace/cti-transmute
uv run manage update
uv run manage start
```

If you only need database migrations:

```bash
source /root/cti-transmute.env
service postgresql start
cd /workspace/cti-transmute
uv run manage db
```

## Database Operations

Open psql:

```bash
source /root/cti-transmute.env
service postgresql start
cd /workspace/cti-transmute
uv run manage psql
```

Create an emergency admin:

```bash
source /root/cti-transmute.env
service postgresql start
cd /workspace/cti-transmute
uv run manage create_admin
```

Back up the database:

```bash
source /root/cti-transmute.env
service postgresql start
cd /workspace/cti-transmute
uv run manage backup
```

Backups are written inside the container at:

```text
/opt/cti/backups
```

## Logs And Inspection

Show stdout/stderr from the container init process:

```bash
container logs "$NAME"
```

Follow container logs:

```bash
container logs --follow "$NAME"
```

Inspect container metadata:

```bash
container inspect "$NAME"
```

For CTI-Transmute itself, the app runs in your shell, so the useful logs are
usually the foreground output from `uv run manage start`.

For PostgreSQL service status inside the container:

```bash
service postgresql status
```

## Reset Options

Reset the app process only:

```text
Ctrl-C
uv run manage start
```

Reset Python dependencies:

```bash
source /root/cti-transmute.env
cd /workspace/cti-transmute
uv sync --locked
```

Reset the database inside the same container:

```bash
service postgresql start
runuser -u postgres -- dropdb --if-exists cti_db
runuser -u postgres -- createdb --owner cti_user cti_db

cd /workspace/cti-transmute
source /root/cti-transmute.env
uv run manage db
uv run manage create_admin
```

Fully reset a feature container from macOS:

```bash
container delete --force "$NAME"
```

Then repeat the create and first-install sections with the same `NAME` and
`HOST_PORT`.

## Multiple Feature Containers

Each feature container needs:

- A unique container name.
- A unique host port.
- Usually a different macOS worktree.

Example:

```bash
cd /Users/chrisr3d/git/MISP/cti-transmute-tags

export NAME=cti-transmute-tags
export HOST_PORT=6869
export WORKTREE="$PWD"
export MOUNT=/workspace/cti-transmute

container create \
  --name "$NAME" \
  --publish "127.0.0.1:${HOST_PORT}:6868" \
  --mount "type=bind,source=${WORKTREE},target=${MOUNT}" \
  ubuntu:24.04 \
  sleep infinity

container start "$NAME"
container exec -it "$NAME" bash
```

Inside that shell, follow the first-install section.

## Troubleshooting

If `container` says the API server is not running:

```bash
container system start
container system status
```

If the web page does not load, check:

```bash
container list --all
container inspect "$NAME"
```

Inside the container:

```bash
source /root/cti-transmute.env
service postgresql status
cd /workspace/cti-transmute
uv run manage db
uv run manage start
```

If `TRANSMUTE_HOME` is missing, source the saved environment:

```bash
source /root/cti-transmute.env
```

If port `6868` is already in use on macOS, stop the other container or create
this one with another host port:

```bash
export HOST_PORT=6869
```

The container-side port remains `6868`.
