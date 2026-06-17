#!/usr/bin/env bash
#
# Create and provision a persistent CTI-Transmute development container with
# Apple's `container` runtime on macOS. The app process remains manual; this
# script only automates the install path from docs/macos-container.md.

set -euo pipefail

NAME="cti-transmute-dev"
HOST_PORT="6868"
WORKTREE="$PWD"
MOUNT="/workspace/cti-transmute"
IMAGE="ubuntu:24.04"
APP_PORT="6868"
START_APP=0
APP_READY=0

usage() {
    cat <<EOF
Usage: bin/macos_container.sh [options]

Create, start, and first-provision a CTI-Transmute macOS dev container.

Options:
  --name NAME          Container name (default: $NAME)
  --host-port PORT    Host port bound to 127.0.0.1 (default: $HOST_PORT)
  --worktree PATH     macOS worktree to mount (default: current directory)
  --mount PATH        Container mount path (default: $MOUNT)
  --image IMAGE       Container image (default: $IMAGE)
  --start             After provisioning, also start PostgreSQL and launch
                      cti-transmute (detached) so it is reachable immediately
  -h, --help          Show this help

Example:
  bin/macos_container.sh --name cti-transmute-tags --host-port 6869 \\
    --worktree /Users/chrisr3d/git/MISP/cti-transmute-tags

  bin/macos_container.sh --start          # provision and run in one go
EOF
}

die() {
    echo "error: $*" >&2
    exit 1
}

info() {
    echo "[macos-container] $*"
}

while [ "$#" -gt 0 ]; do
    case "$1" in
        --name)
            [ "$#" -ge 2 ] || die "--name requires a value"
            NAME="$2"
            shift 2
            ;;
        --host-port)
            [ "$#" -ge 2 ] || die "--host-port requires a value"
            HOST_PORT="$2"
            shift 2
            ;;
        --worktree)
            [ "$#" -ge 2 ] || die "--worktree requires a value"
            WORKTREE="$2"
            shift 2
            ;;
        --mount)
            [ "$#" -ge 2 ] || die "--mount requires a value"
            MOUNT="$2"
            shift 2
            ;;
        --image)
            [ "$#" -ge 2 ] || die "--image requires a value"
            IMAGE="$2"
            shift 2
            ;;
        --start)
            START_APP=1
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            die "unknown option: $1"
            ;;
    esac
done

case "$NAME" in
    *[!a-z0-9-]*|""|-*)
        die "container names must use lowercase letters, numbers, and hyphens"
        ;;
esac

case "$HOST_PORT" in
    *[!0-9]*|"")
        die "--host-port must be a number"
        ;;
esac
if [ "$HOST_PORT" -lt 1 ] || [ "$HOST_PORT" -gt 65535 ]; then
    die "--host-port must be between 1 and 65535"
fi

command -v container >/dev/null 2>&1 \
    || die "Apple container is not installed or not on PATH"

WORKTREE="$(cd "$WORKTREE" && pwd)"
[ -e "$WORKTREE/pyproject.toml" ] && [ -e "$WORKTREE/uv.lock" ] \
    || die "$WORKTREE is not a cti-transmute worktree"

if ! container system status >/dev/null 2>&1; then
    info "starting Apple container system"
    container system start
    container system status >/dev/null
fi

if container inspect "$NAME" >/dev/null 2>&1; then
    cat >&2 <<EOF
error: container '$NAME' already exists
hint: use a different --name / --host-port, or delete it manually:
      container delete --force $NAME
EOF
    exit 1
fi

if command -v lsof >/dev/null 2>&1; then
    if lsof -nP -iTCP:"$HOST_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
        cat >&2 <<EOF
error: host port $HOST_PORT is already in use on 127.0.0.1
hint: choose another port, for example:
      bin/macos_container.sh --name cti-transmute-tags --host-port 6869
EOF
        exit 1
    fi
fi

info "creating container '$NAME'"
container create \
    --name "$NAME" \
    --publish "127.0.0.1:${HOST_PORT}:${APP_PORT}" \
    --mount "type=bind,source=${WORKTREE},target=${MOUNT}" \
    "$IMAGE" \
    sleep infinity

info "starting container '$NAME'"
container start "$NAME"

if ! container exec -i "$NAME" bash -se <<PROVISION
export DEBIAN_FRONTEND=noninteractive
export MOUNT="$MOUNT"
export RUNTIME="/opt/cti"

apt-get update
apt-get install -y --no-install-recommends \\
  build-essential ca-certificates curl fonts-dejavu-core git iproute2 \\
  libcairo2 libffi-dev libgdk-pixbuf-2.0-0 libharfbuzz0b libjpeg-turbo8 \\
  libopenjp2-7 libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 \\
  libpq-dev pkg-config postgresql postgresql-client python3 python3-dev \\
  python3-venv shared-mime-info

if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh \\
    | env UV_INSTALL_DIR=/usr/local/bin UV_NO_MODIFY_PATH=1 sh
fi

mkdir -p "\$RUNTIME"/venv "\$RUNTIME"/uv-cache "\$RUNTIME"/flask-session "\$RUNTIME"/backups

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

grep -qxF 'source /root/cti-transmute.env' /root/.bashrc \\
  || echo 'source /root/cti-transmute.env' >> /root/.bashrc
source /root/cti-transmute.env

service postgresql start
for _ in \$(seq 1 30); do
  runuser -u postgres -- pg_isready -q && break
  sleep 1
done

runuser -u postgres -- psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='cti_user'" | grep -qx 1 \\
  || runuser -u postgres -- psql -c "CREATE ROLE cti_user LOGIN PASSWORD 'cti_pass'"

runuser -u postgres -- psql -tAc "SELECT 1 FROM pg_database WHERE datname='cti_db'" | grep -qx 1 \\
  || runuser -u postgres -- createdb --owner cti_user cti_db

cd "\$MOUNT"
git -c safe.directory="\$MOUNT" submodule update --init --recursive
uv sync --locked

uv run python - <<'PY'
import website.db_class.db  # noqa: F401
from website.web import application, db

with application.app_context():
    db.create_all()
PY

uv run flask --app website.web db stamp head
PROVISION
then
    cat >&2 <<EOF
error: provisioning failed
container kept for inspection: $NAME

Inspect:
  container logs $NAME
  container exec -it $NAME bash

Reset manually:
  container delete --force $NAME
EOF
    exit 1
fi

# Start PostgreSQL and launch the web app detached, so this script can return
# while the (foreground, blocking) server keeps running inside the container.
start_app() {
    info "starting postgresql + cti-transmute in '$NAME'"
    container exec -i "$NAME" bash -se <<'START'
set -e
source /root/cti-transmute.env
service postgresql start
for _ in $(seq 1 30); do
  runuser -u postgres -- pg_isready -q && break
  sleep 1
done

cat >/usr/local/bin/cti-transmute-run <<'RUN'
#!/usr/bin/env bash
set -e
source /root/cti-transmute.env
cd "$TRANSMUTE_HOME"
exec uv run start_website
RUN
chmod +x /usr/local/bin/cti-transmute-run

if command -v pgrep >/dev/null 2>&1 && pgrep -f 'start_website' >/dev/null 2>&1; then
  echo "[start] cti-transmute already running"
else
  setsid nohup /usr/local/bin/cti-transmute-run >/opt/cti/start_website.log 2>&1 </dev/null &
  echo "[start] cti-transmute launched (logs: /opt/cti/start_website.log)"
fi
START

    command -v curl >/dev/null 2>&1 || return 0
    info "waiting for cti-transmute on 127.0.0.1:${HOST_PORT}…"
    for _ in $(seq 1 30); do
        if curl -sS -o /dev/null "http://127.0.0.1:${HOST_PORT}/" 2>/dev/null; then
            APP_READY=1
            return 0
        fi
        sleep 1
    done
    return 0
}

if [ "$START_APP" -eq 1 ]; then
    start_app
    if [ "$APP_READY" -eq 1 ]; then
        cat <<EOF

[macos-container] Ready — cti-transmute is running.

URL:
  http://127.0.0.1:$HOST_PORT

Logs (inside the container):
  container exec $NAME tail -f /opt/cti/start_website.log

Stop the server:
  container exec $NAME pkill -f start_website

Open a shell:
  container exec -it $NAME bash

Optional admin user:
  container exec -it $NAME bash -lc 'cd $MOUNT && uv run manage create_admin'
EOF
    else
        cat <<EOF

[macos-container] Provisioned and launched, but the server did not answer on
127.0.0.1:$HOST_PORT yet. It may still be starting — check the logs:
  container exec $NAME tail -f /opt/cti/start_website.log

URL (once up):
  http://127.0.0.1:$HOST_PORT
EOF
    fi
else
    cat <<EOF

[macos-container] Ready.

Open a shell:
  container exec -it $NAME bash

Run the web interface manually inside the container:
  source /root/cti-transmute.env
  service postgresql start
  cd $MOUNT
  uv run manage start

Optional admin user:
  uv run manage create_admin

URL:
  http://127.0.0.1:$HOST_PORT

Tip: re-run with --start to provision and launch in one step.
EOF
fi
