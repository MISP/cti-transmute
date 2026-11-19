#!/usr/bin/env python3
"""
vendor_vitrine.py
Copy into website/web/static/vitrine/ only the Vitrine components the site
uses, and exactly the shared chunks they import.

Vitrine (https://github.com/ecrou-exact/vitrine) ships ~40 web components,
183 highlight.js languages, syntax themes and two vendored libraries. The
site needs a handful of components, so it ships those and nothing else.

    # in a Vitrine checkout: npm ci && node scripts/build.js
    uv run python bin/vendor_vitrine.py /path/to/vitrine

Edit COMPONENTS when a page starts (or stops) using a component. The script
follows every static and dynamic import from those entry modules, so the
chunk list is always complete, and writes what it kept to VERSION.json.
"""

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "website" / "web" / "static" / "vitrine"

# The components the site imports (static/js/vitrine.js, graph/render/vitrine.js).
COMPONENTS = (
    "json",      # Conversion input/output, drill-downs, raw documents, API tester
    "markdown",  # event reports, STIX descriptions; used by openapi
    "code",      # STIX patterns, YARA / Sigma / Snort values
    "table",     # history table
    "chart",     # evaluation charts (loads vendor/echarts.js)
    "openapi",   # API reference on /list
    "http",      # example requests inside openapi
    "timeline",  # home activity
    "field",     # history filters
)

# Libraries loaded on demand from vendor/: only those a kept component uses.
VENDOR = ("echarts.js",)   # vt-chart; yaml.js is only for YAML OpenAPI files

IMPORT_RE = re.compile(r'''(?:import|from)\s*\(?\s*["'](\./[^"']+\.js)["']''')


def closure(esm: Path, entries: list[Path]) -> set[Path]:
    """Every module reachable from the entry modules by relative imports."""
    seen, todo = set(), list(entries)
    while todo:
        mod = todo.pop()
        if mod in seen:
            continue
        seen.add(mod)
        for rel in IMPORT_RE.findall(mod.read_text(encoding="utf-8")):
            dep = (mod.parent / rel).resolve()
            if dep.exists() and dep not in seen:
                todo.append(dep)
    return seen


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1]).resolve()
    dist = src / "dist"
    esm = dist / "esm"
    if not esm.is_dir():
        sys.exit(f"ERROR: {esm} not found; build Vitrine first (npm ci && node scripts/build.js).")

    entries = [esm / f"vt-{name}.js" for name in COMPONENTS]
    missing = [e.name for e in entries if not e.exists()]
    if missing:
        sys.exit(f"ERROR: not in this Vitrine build: {', '.join(missing)}")
    keep = closure(esm, entries)

    if TARGET.exists():
        shutil.rmtree(TARGET)
    (TARGET / "esm" / "chunks").mkdir(parents=True)
    for mod in sorted(keep):
        shutil.copy2(mod, TARGET / mod.relative_to(dist))
    (TARGET / "vendor").mkdir()
    for lib in VENDOR:
        shutil.copy2(dist / "vendor" / lib, TARGET / "vendor" / lib)
    for doc in ("LICENSE", "THIRD_PARTY_NOTICES.md"):
        shutil.copy2(src / doc, TARGET / doc)

    commit = subprocess.run(["git", "-C", str(src), "rev-parse", "HEAD"],
                            capture_output=True, text=True).stdout.strip() or "unknown"
    record = {
        "source": "https://github.com/ecrou-exact/vitrine",
        "commit": commit,
        "components": [f"vt-{c}" for c in COMPONENTS],
        "chunks": len([m for m in keep if m.parent.name == "chunks"]),
        "vendor": list(VENDOR),
        "rebuild": "uv run python bin/vendor_vitrine.py /path/to/vitrine",
    }
    (TARGET / "VERSION.json").write_text(json.dumps(record, indent=2) + "\n")
    size = sum(f.stat().st_size for f in TARGET.rglob("*") if f.is_file())
    print(f"Kept {len(COMPONENTS)} components, {record['chunks']} chunks, "
          f"{len(VENDOR)} vendor file(s): {size / 1024:.0f} KiB in {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
