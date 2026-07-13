# cti-transmute

Flask + PostgreSQL service that converts CTI between **MISP and STIX**, with a
catalogue on top (history, sharing, comments, evaluation, tags). Vue 3, no build
step.

Two halves:
- **`cti_transmute/`** — the Flask-free conversion engine (wraps
  `misp-stix-converter`; a registry of Converters). Importable on its own (ADR-0001).
- **`website/`** — the Flask app. The web UI and the `/api` blueprint are one
  app on **port 6868** (`config/generic.json`).

Run with `uv run start_website`.

A feature lives in `website/web/<feature>/` as a trio: `<feature>.py` (routes),
`<feature>_core.py` (DB + logic, imported as `FeatureModel`), and an optional
`<feature>_form.py` (WTForms). All models are in `website/db_class/db.py`.
Features: `conversions`, `evaluate`, `tags`, `account`.

`website/lib/` is the other shelf inside `website/`: cross-cutting **service**
logic that bridges Flask and the engine but isn't a UI feature — the conversion
use-cases (`conversions.py` → `submit_conversion`), the service-layer exceptions
(`exceptions.py` → `PersistenceFailed`, `InvalidApiKey`), API auth (`auth.py`
→ `resolve_api_actor` / `@api_actor`), authorization rules (`access.py`), the
remote-MISP request helper (`misp.py`), and param plumbing (`params.py`). It may
import Flask (`db`, `g`) but holds no routes or templates. New cross-cutting
*service/use-case* logic belongs here; *aggregate persistence* (DB reads/writes)
belongs in the sibling `website/repos/` shelf (e.g. `conversions.py`) — neither
goes in a feature trio or the Flask-free `cti_transmute/`.

## Vocabulary

**`CONTEXT.md`** is the domain glossary — canonical terms. The short version:
**Conversion** is the saved record (the catalogue entry); **Converter** is the
engine that performs one direction (MISP→STIX, STIX→MISP). "convert" survives
only as the verb and in the public URLs (`/api/convert/...`, the legacy
`/convert` blueprint).

## Maintainer-local docs

The maintainer's checkout carries design docs that are deliberately **not
committed**: `docs/adr/` (settled decisions — don't re-litigate them),
`docs/architecture-roadmap.md`, `docs/handoff/`, `docs/architecture-review/`,
`docs/agents/` (agent-skill config), and `.scratch/<feature>/` (plans + issue
tickets). ADR references in this file and in tickets point there, and the
*Agent skills* section below assumes them. If those files are absent from your
checkout, the code, `CONTEXT.md`, and this file stand alone.

---

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/<feature>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the default five canonical label strings (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Architecture reviews

Past `/improve-codebase-architecture` reports are kept in `docs/architecture-review/`, named `YYYY-MM-DD-<description>.html`. Read the existing ones before a new review for continuity (don't re-litigate candidates an earlier snapshot already mapped).

### Handoffs

`/handoff` documents are kept in `docs/handoff/`, named `YYYY-MM-DD-<description>.md` (the same date-prefixed convention as the architecture reviews) — **not** in `/tmp`. This overrides the handoff skill's default OS-temp-dir location, so handoffs survive reboots and context clears. Read the latest one before resuming work.
