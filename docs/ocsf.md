# OCSF output

CTI-Transmute exports MISP and STIX 2.0/2.1 to **OCSF 1.9.0**, the latest
stable upstream release at implementation time. Output is always a JSON array
of [OSINT Inventory Info](https://github.com/ocsf/ocsf-schema/blob/1.9.0/events/discovery/osint_inventory_info.json)
events (`class_uid=5021`, `activity_id=1`, `type_uid=502101`). This class describes
threat intelligence inventory; an indicator does not establish that an attack
or network connection occurred.

## Usage

```python
from cti_transmute import transmute

result = transmute.convert("misp", "ocsf", misp_event)
result = transmute.convert("stix", "ocsf", stix_bundle)
events = result.document
diagnostics = result.diagnostics
```

```bash
curl -H 'Content-Type: application/json' --data-binary @misp.json \
  'http://127.0.0.1:6868/api/convert/misp_to_ocsf?diagnostics=true'
curl -F 'file=@bundle.json' \
  'http://127.0.0.1:6868/api/convert/stix_to_ocsf?persist=true'
```

Both endpoints support the existing `persist` and `diagnostics` transport flags,
API authentication, count headers, and file uploads. Parameters are published
by `/api/convert/list`. The **Convert** menu also has MISP → OCSF and STIX → OCSF
forms; saved conversions support history, refresh, JSON viewing, and downloads.
The OCSF forms convert without saving by default and offer a JSON download.
Saving is explicit; private saved conversions require signing in.
The existing MISP/STIX graph, sunburst and table views do not render OCSF, so
those tabs are hidden on OCSF conversions.

| Parameter | Default | Meaning |
| --- | --- | --- |
| `source_data` | `preserve` | Preserve original records in `unmapped`; `omit` explicitly permits loss of fields that cannot be normalized. |
| `fallback_time` | `0` | Milliseconds since the epoch used when the source has no usable event timestamp; a warning identifies each use. |

MISP exports are limited to 1,000 records, 10,000 attributes/objects in total,
and 1,024 tags per event, object or attribute scope. The converted document and
diagnostics must fit within 16 MiB of ASCII-escaped JSON. Inherited label fan-out
is checked before mapping, and actual output size is checked incrementally,
including repeated object enrichments and preserved source data. Exceeding a
limit returns a payload error (HTTP 400) without saving a partial conversion;
split large collections into smaller requests. Limits also apply when
`source_data=omit`.

## Coverage and preservation

One event is emitted per MISP event, standalone MISP object/attribute collection,
or STIX object. Its `osint` array can contain several indicators. Empty input
collections return an empty array. Inputs may be parsed JSON, UTF-8 text/bytes,
or `BytesIO`. MISP accepts wrapped/bare events, event lists, restSearch responses,
standalone attributes and objects, and attribute search results. STIX accepts
bundles, object lists and individual objects, including custom `x-` objects.

| Source data | Native OCSF mapping |
| --- | --- |
| MISP IPs, domains, hostnames, URLs, user agents and email addresses | OSINT types 1–6 and 9; CIDR values also populate `subnet`. Domain/IP composites produce both indicators. |
| MISP hashes, files, attachments, malware samples | Hash/file OSINT, fingerprint algorithm identifiers, available filename/hash/size/MIME/timestamp metadata. File objects combine their filename and hashes. Binary attachment content remains in the original record. |
| MISP email, registry, CVE, certificate fingerprints, command lines and detection rules | Email/registry/vulnerability/certificate/command-line OSINT; supported email fields, CVE objects, and STIX/Sigma/Snort/Suricata/YARA detection patterns. |
| MISP tags, organizations and galaxies | Labels, TLP, creator organization, ATT&CK techniques/subtechniques, malware, threat actors, campaigns, intrusion sets and references. |
| MISP structured email, WHOIS, script and X.509 objects | Email recipients/headers, WHOIS domain/registrar/nameservers, script content/language, and available certificate issuer/serial/validity/fingerprints. Threat levels map to OCSF severity. |
| STIX address/domain/URL/email/file/artifact/registry/certificate/process/network/AS observables | Native OSINT value types, file fingerprints and metadata, referenced email addresses, command lines, network endpoint indicators and autonomous systems. |
| STIX indicators | Complete detection pattern, pattern language, validity expiration and normalized confidence. STIX patterns are syntax checked; compound expressions and qualifiers are preserved without inventing observations. |
| STIX observed-data | Resolves embedded STIX 2.0 SCOs and STIX 2.1 `object_refs`, including local network/email/file references. |
| STIX attack-pattern/malware/threat-actor/campaign/intrusion-set/location/vulnerability | Native ATT&CK, malware classification, actor/campaign/intrusion-set, geography and vulnerability context. Explicit relationships can enrich related indicators. |
| STIX reports, groupings, identities, relationships, sightings, notes, opinions, infrastructure, tools, courses of action, marking/extension definitions and custom objects | Context records represented as OSINT `Other`, with diagnostics and the original object preserved. No source objects are silently discarded. |

Original MISP records are in `unmapped.misp`; wrapper and response metadata are
in `unmapped.context`. Original STIX objects are in `unmapped.stix`; bundle
metadata is in `unmapped.context`. This retains fields with no exact OCSF
equivalent: MISP object templates/relations, sightings, proposals, reports,
distribution and sharing groups, attachments, STIX graph edges, extensions,
revocation, granular marking selectors, exact confidence scores and custom data.
Unknown MISP attribute types and custom STIX types produce `Other` indicators
with diagnostics. This is broad source preservation, not a claim that every
source field has a native OCSF equivalent.

Source timestamps are normalized to UTC epoch milliseconds. Missing timestamps
are never replaced silently with conversion time. Event identifiers are
deterministic for identical source content and position; source identifiers are
also retained in metadata. Duplicate STIX IDs retain every object and warn that
reference resolution uses the last occurrence.

TLP uses the most restrictive recognized event/object/attribute marking. STIX
object markings resolve through bundle marking definitions. Unresolved references
and granular markings generate warnings. MISP distribution/sharing groups,
non-TLP markings and granular selectors remain in the source; consumers must
enforce those policies themselves. Neither TLP nor source permissions change
the catalogue's separate public/private setting. Revoked STIX records remain
available as inventory with a diagnostic; do not treat every exported record as
an active detection indicator.

## Validation

The tests use an offline type, required-field and enum contract derived from
the pinned [OCSF 1.9.0 release](https://github.com/ocsf/ocsf-schema/tree/1.9.0).
The fixture includes its exporter, upstream license and notice. It excludes
profiles, extensions and semantic constraints, and does not constitute full
OCSF certification. Production conversion makes no schema-server requests.

```bash
uv run --locked pytest tests/converters/test_ocsf.py tests/api/test_ocsf_api.py tests/web/test_ocsf_routes.py
```
