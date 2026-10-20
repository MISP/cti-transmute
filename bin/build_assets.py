#!/usr/bin/env python3
"""
build_assets.py
Copies the pre-built Pivotick dist/ into website/web/static/pivotick/.

The compiled files are committed directly to the repository, so this script
is NOT needed for normal use. Run it only if you have manually rebuilt
submodules/pivotick/dist/ from source (npm run build inside submodules/pivotick/).

    python bin/build_assets.py
"""

import hashlib
import json
import shutil
import sys
from pathlib import Path

ROOT            = Path(__file__).resolve().parent.parent
PIVOTICK        = ROOT / "submodules" / "pivotick"
PIVOTICK_DIST   = PIVOTICK / "dist"
PIVOTICK_STATIC = ROOT / "website" / "web" / "static" / "pivotick"

# The browser loads the copy under static/, and the bundle carries no version
# of its own, so the copy is recorded here: which Pivotick it came from, and
# the digest of each file served. The graph XSS check reads this rather than
# the submodule, because label safety is the library's guarantee from 1.5.0 on
# and a static/ copy left behind by a submodule bump would otherwise pass a
# check that read the submodule's own version.
BUNDLE_RECORD = "BUNDLE.json"
RECORDED_FILES = ("pivotick.iife.js", "pivotick.umd.js")

# The page loads the IIFE build (`pivotick.iife.js` + `pivotick.css`, see
# templates/conversions/detail.html), so the ES build is dropped rather than
# served: `pivotick.es.js` is only an entry point re-exporting the `chunks/`
# bundles for bundler consumers, and shipping it meant either committing a
# megabyte nothing loads or leaving the entry pointing at a file absent from
# the repository (which is what it did until 1.5.0).
ES_BUILD_GLOBS = ("pivotick.es.js",)

# `chunks/` holds what the ES entry re-exports; `types/` is the `.d.ts` bundle
# the package ships for TypeScript consumers. Neither is reachable from a
# <script> tag, and together they are ~2 MB of the build.
DROPPED_DIRS = ("chunks", "types")


def main() -> None:
    if not PIVOTICK_DIST.exists():
        print("ERROR: submodules/pivotick/dist not found.")
        print("Run:  git submodule update --init  then  npm run build inside submodules/pivotick/")
        sys.exit(1)

    print("→ Copying dist/ → static/pivotick/…")
    if PIVOTICK_STATIC.exists():
        shutil.rmtree(PIVOTICK_STATIC)
    shutil.copytree(PIVOTICK_DIST, PIVOTICK_STATIC)

    print("→ Dropping the ES build and the type declarations (the page loads the IIFE)…")
    for pattern in ES_BUILD_GLOBS:
        for f in sorted(PIVOTICK_STATIC.glob(pattern)):
            f.unlink()
            print(f"  Removed {f.name}")
    for name in DROPPED_DIRS:
        directory = PIVOTICK_STATIC / name
        if directory.is_dir():
            shutil.rmtree(directory)
            print(f"  Removed {name}/")

    print("→ Recording the version and digests of what is now served…")
    write_bundle_record()

    print("\n✓ Done. Remember to commit the updated static/pivotick/ files.")


def write_bundle_record() -> None:
    """Write static/pivotick/BUNDLE.json for the files just copied."""
    package = json.loads((PIVOTICK / "package.json").read_text())
    digests = {}
    for name in RECORDED_FILES:
        served = PIVOTICK_STATIC / name
        if served.exists():
            digests[name] = hashlib.sha256(served.read_bytes()).hexdigest()
    record = {"version": package["version"], "sha256": digests}
    path = PIVOTICK_STATIC / BUNDLE_RECORD
    path.write_text(json.dumps(record, indent=2) + "\n")
    print(f"  Wrote {BUNDLE_RECORD} for Pivotick {record['version']}")


if __name__ == "__main__":
    main()
