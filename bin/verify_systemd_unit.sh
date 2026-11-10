#!/usr/bin/env bash
#
# Exercise the systemd unit of an installed CTI-Transmute service.
#
# This checks the unit you installed from README.md - it never writes one.
# A unit shipped in the repository would own paths, user and WorkingDirectory
# that differ on every install, and would drift against the documented one.
#
# Run it on the Linux host that serves the instance, as root:
#
#     sudo bin/verify_systemd_unit.sh
#     # then, once it tells you to:
#     sudo reboot
#     sudo bin/verify_systemd_unit.sh --post-reboot
#
# Options:
#     --service NAME    unit to exercise (default: cti-transmute.service)
#     --url URL         what to request (default: read from config/generic.json)
#     --post-reboot     run only the boot-survival check
#
# Exits non-zero if any criterion fails.

set -uo pipefail

SERVICE="cti-transmute.service"
URL=""
POST_REBOOT=0

while [ $# -gt 0 ]; do
    case "$1" in
        --service)     SERVICE="$2"; shift 2 ;;
        --url)         URL="$2"; shift 2 ;;
        --post-reboot) POST_REBOOT=1; shift ;;
        -h|--help)     sed -n '3,22p' "$0"; exit 0 ;;
        *)             echo "Unknown option: $1" >&2; exit 2 ;;
    esac
done

# ── Reporting ─────────────────────────────────────────────────────────────────

RESULTS=()
FAILURES=0

pass() { RESULTS+=("PASS  $1"); printf '\033[1;32m  ✓ %s\033[0m\n' "$1"; }
fail() { RESULTS+=("FAIL  $1"); FAILURES=$((FAILURES + 1)); printf '\033[1;31m  ✗ %s\033[0m\n' "$1"; }
skip() { RESULTS+=("SKIP  $1"); printf '\033[0;37m  - %s\033[0m\n' "$1"; }
info() { printf '\033[0;37m    %s\033[0m\n' "$1"; }
step() { printf '\n\033[1;34m%s\033[0m\n' "$1"; }

die() { printf '\033[1;31m  ✗ %s\033[0m\n' "$1" >&2; exit 2; }

# ── Preconditions ─────────────────────────────────────────────────────────────

[ -d /run/systemd/system ] || die "systemd is not PID 1 here - this check needs a Linux host running systemd."
command -v systemctl >/dev/null || die "systemctl not found."
command -v curl >/dev/null || die "curl not found - install it, the checks request the service."
[ "$(id -u)" -eq 0 ] || die "Run as root: the checks kill the worker and the arbiter."

systemctl cat "$SERVICE" >/dev/null 2>&1 || die "No unit named $SERVICE. Install it first - the deployment section of README.md has it."

show() { systemctl show -p "$1" --value "$SERVICE" 2>/dev/null; }

WORKDIR="$(show WorkingDirectory)"

if [ -z "$URL" ]; then
    CONFIG="$WORKDIR/config/generic.json"
    if [ -r "$CONFIG" ]; then
        # 0.0.0.0 is a bind, not an address to request: ask loopback instead.
        # -I because this runs as root and the script arrives on stdin, which
        # puts the invoking directory on sys.path: a file named json.py sitting
        # there would otherwise be imported with root privileges.
        URL="$(python3 -I - "$CONFIG" <<'PY'
import json, sys
config = json.load(open(sys.argv[1]))
ip = config.get("website_listen_ip", "127.0.0.1")
port = config.get("website_listen_port", 6868)
if ip in ("0.0.0.0", "::", ""):
    ip = "127.0.0.1"
print(f"http://{ip}:{port}/api/convert/list")
PY
)"
    else
        URL="http://127.0.0.1:6868/api/convert/list"
    fi
fi

# ── Helpers ───────────────────────────────────────────────────────────────────

# Request the service until it answers 200, up to N seconds.
serving() {
    local deadline=$(( SECONDS + ${1:-45} )) code
    while [ $SECONDS -lt $deadline ]; do
        code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$URL" 2>/dev/null)"
        [ "$code" = "200" ] && return 0
        sleep 1
    done
    return 1
}

main_pid()   { show MainPID; }
# gunicorn's workers are children of the arbiter.
worker_pids() { pgrep -P "$(main_pid)" 2>/dev/null | tr '\n' ' '; }

wait_for_new() {  # wait_for_new <getter> <old value> <seconds>
    local deadline=$(( SECONDS + $3 )) now
    while [ $SECONDS -lt $deadline ]; do
        now="$($1)"
        if [ -n "$now" ] && [ "$now" != "$2" ] && [ "$now" != "0" ]; then
            echo "$now"
            return 0
        fi
        sleep 1
    done
    return 1
}

summary() {
    step "Summary"
    printf '%s\n' "${RESULTS[@]}"
    echo
    if [ "$FAILURES" -gt 0 ]; then
        printf '\033[1;31m%s criterion/criteria failed.\033[0m\n' "$FAILURES"
        exit 1
    fi
    printf '\033[1;32mAll checked criteria passed.\033[0m\n'
}

# ── The boot-survival half ────────────────────────────────────────────────────

if [ "$POST_REBOOT" -eq 1 ]; then
    step "After the reboot ($SERVICE)"
    info "Host has been up for $(cut -d. -f1 /proc/uptime)s."
    if [ "$(show ActiveState)" = "active" ]; then
        pass "The service is active without anyone having started it."
    else
        fail "The service is $(show ActiveState) after boot - is it enabled? (systemctl is-enabled $SERVICE)"
    fi
    if serving 60; then
        pass "It answers 200 at $URL after boot."
    else
        fail "No 200 at $URL within 60s of the check - see journalctl -u $SERVICE."
    fi
    summary
fi

# ── 1. The unit says what the README asks it to ───────────────────────────────

step "1. Unit properties ($SERVICE)"

[ "$(show Restart)" = "always" ] \
    && pass "Restart=always - a dead arbiter is replaced." \
    || fail "Restart=$(show Restart) - the README unit asks for always."

EXEC="$(show ExecStart)"
case "$EXEC" in
    *start_website*) pass "ExecStart runs start_website (the gunicorn launcher)." ;;
    *dev_server*)    fail "ExecStart runs dev_server - that is the development launcher, not production." ;;
    *)               fail "ExecStart does not run start_website: $EXEC" ;;
esac

[ -n "$WORKDIR" ] && [ "$WORKDIR" != "/" ] \
    && pass "WorkingDirectory=$WORKDIR" \
    || fail "WorkingDirectory is unset - the README unit sets it to the checkout."

USERNAME="$(show User)"
[ -n "$USERNAME" ] \
    && pass "Runs as $USERNAME." \
    || info "User is unset, so the service runs as root. The README unit names a service account."

# ── 2. It starts ──────────────────────────────────────────────────────────────

step "2. systemctl enable --now"

systemctl enable "$SERVICE" >/dev/null 2>&1 \
    && pass "Enabled - it will be started at boot." \
    || fail "systemctl enable failed - it will not come back after a reboot."

systemctl start "$SERVICE" >/dev/null 2>&1
if serving 60; then
    pass "Serving 200 at $URL."
else
    fail "No 200 at $URL within 60s. Stopping here - see journalctl -u $SERVICE."
    summary
fi

ARBITER="$(main_pid)"
WORKERS="$(worker_pids)"
info "arbiter $ARBITER, worker(s) ${WORKERS:-none found}"

# ── 3. kill -9 the worker: gunicorn's arbiter replaces it ─────────────────────

step "3. kill -9 the worker"

if [ -z "$WORKERS" ]; then
    skip "No worker process found as a child of the arbiter - nothing to kill."
else
    VICTIM="${WORKERS%% *}"
    kill -9 "$VICTIM" 2>/dev/null
    info "killed worker $VICTIM"
    if NEW_WORKERS="$(wait_for_new worker_pids "$WORKERS" 30)"; then
        pass "The arbiter booted a replacement worker ($NEW_WORKERS)."
    else
        fail "No replacement worker within 30s."
    fi
    if [ "$(main_pid)" = "$ARBITER" ]; then
        pass "The arbiter kept the same PID - systemd never had to step in."
    else
        fail "The arbiter PID changed: gunicorn did not absorb the worker's death."
    fi
    serving 30 && pass "Still serving 200 after the worker was killed." \
               || fail "Not serving after the worker was killed."
fi

# ── 4. kill -9 the arbiter: systemd restarts the unit ─────────────────────────

step "4. kill -9 the arbiter"

kill -9 "$ARBITER" 2>/dev/null
info "killed arbiter $ARBITER"
if NEW_ARBITER="$(wait_for_new main_pid "$ARBITER" 45)"; then
    pass "systemd restarted the service (new arbiter $NEW_ARBITER)."
else
    fail "systemd did not restart the service within 45s - check Restart= and RestartSec=."
fi
serving 60 && pass "Serving 200 again after the restart." \
           || fail "Not serving after systemd's restart."

# ── 5. The boot-survival half, which needs you ────────────────────────────────

step "5. Survives a reboot"

skip "Needs a reboot, which this script will not do for you."
echo
info "sudo reboot"
info "sudo $0 --post-reboot"

summary
