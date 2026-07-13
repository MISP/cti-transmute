# cti-transmute — Domain glossary

This file is a glossary, not a spec. Each term has one canonical meaning across
code, docs, URLs, and conversation. When the term you need isn't here, add it.

---

## Converter

The engine that performs **one direction** of format transformation —
e.g. MISP → STIX 2.1, STIX → MISP, Sigma → STIX. Each Converter declares
its source format, target format, and the parameters it accepts.

Converters are **registered**; the set of Converters available at runtime
is the canonical answer to "what can this service do?" Listing endpoints
read from the registry rather than from hand-maintained tables.

A Converter knows nothing about users, persistence, or notifications. It
takes a payload and parameters in, returns a transformed payload out.

## Parameter schema

The canonical, machine-readable description of the parameters one **Converter**
accepts: each parameter's type, allowed values, default, and human-readable
label. It expresses **shape** only — cross-field and semantic validity belong
to the target tool, not to cti-transmute. One schema per Converter is the single
source the API validation, the web form, and the MISP view all render from.
_Avoid_: form definition, reqparse model, param spec.

## Conversion

The **persisted record** of a single submission: who submitted it, with
which Converter, what input, what output, what visibility, what comments,
what history of re-runs. The model class is `Conversion`; the DB table is
`conversion`; URLs live under `/conversions/…`.

> Renamed from `Convert` (the original model name). "Convert" is a verb; the
> persisted thing is a Conversion. Distinct from **Converter** (the engine).

Not every call to a Converter produces a Conversion. The web view always
persists. The API persists only when the client opts in via
`?persist=true` — without the flag, the Converter runs, the result is
returned, and no Conversion row is created.

## Source

The input artifact one or more **Conversions** derive from — e.g. a MISP event
or a STIX bundle. One Source can feed several Conversions: the MISP view
generates many documents (a STIX bundle, a Yara rule, …) from one MISP event,
each its own Conversion, all sharing the Source. A MISP event is one *kind* of
Source, not a special case.
_Avoid_: MISP event (as a stored entity — it is one kind of Source), original input.

## MISP instance

A **remote MISP server** that Conversions are pushed to and that events are
fetched from — addressed by a URL + API key the caller supplies **per request**
(never a stored credential). Distinct from a **Source** (the stored input a
Conversion derives from) and from a MISP event (one kind of Source).
_Avoid_: MISP server (in prose — "instance" is the canonical noun); MISP gateway
(that is the code seam, `website/lib/misp`, not the domain concept).

## Submitter

The actor who initiates a Conversion. A Submitter arrives through one of
three channels but the use-case sees a single value of type `User | None`:

- **Web session** — a logged-in browser visitor; resolved from Flask-Login's
  `current_user`.
- **API key** — an HTTP client presenting a valid `X-API-KEY` header;
  resolved against `User.api_key`.
- **Anonymous** — a browser visitor not logged in, or an API call with no
  header. The Submitter is `None`.

An anonymous Submitter still produces a Conversion row (with `user_id = None`)
but no follower fan-out occurs and audit log records "Anonymous" as the
actor name. The web view and the API resource resolve their Submitter
differently, but the use-case downstream treats all three uniformly.

## ConversionHistory

A re-run of an existing Conversion with potentially different parameters,
producing a side-by-side old/new output that the owner can **accept** or
**reject**. Accepting adopts the re-run onto the Conversion — its output
and the parameters that produced it, as one unit; rejecting leaves the
Conversion untouched. A ConversionHistory belongs to one Conversion.
Refreshing a Conversion does not create a new Conversion; it appends a
ConversionHistory entry.

## Activity log

The admin-facing feed of recent platform events: who did what, when, to
which entity — one entry per mutation (a Conversion created, a tag edited,
a user login). The model class is `SystemLog`; the admin page is
"Activity Logs". A curated public subset also feeds the homepage.

An entry is operational display data, **not** tamper-evident audit
evidence: admins may prune entries, and renames may rewrite stored
entries wholesale.
_Avoid_: audit log (implies an immutability this feed does not promise),
system log (in prose — it is the class name only).

---

## (anti-glossary — terms to avoid)

- **Convert** (as a noun). Use **Conversion** for the record, **Converter**
  for the engine, or *to convert* as a verb. Never as a noun for an entity.
- **conversion_type** as a free-form string ("MISP_TO_STIX"). The pair
  `(source_format, target_format)` lives on the Converter; the Conversion
  records which Converter produced it.
