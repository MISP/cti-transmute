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
Features: `convert`, `evaluate`, `tags`, `account`.

## Source of truth

The architecture is mid-refactor, so trust the docs over the current code, and
dig layer/feature specifics out of the code when you get there rather than from here:
- **`CONTEXT.md`** — domain glossary; canonical terms. (The code's `Convert` /
  `convert` is becoming **Conversion** = the record and **Converter** = the engine.)
- **`docs/adr/`** — decisions already made; don't re-litigate them.
- **`.scratch/<feature>/`** — in-flight plans (PRD + issues), e.g.
  `conversion-use-case-refactor/`.

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
