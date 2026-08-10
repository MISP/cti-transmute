#!/usr/bin/env python3
"""
build_assets.py
Copies the pre-built Pivotick dist/ into website/web/static/pivotick/.

The compiled files are committed directly to the repository, so this script
is NOT needed for normal use. Run it only if you have manually rebuilt
submodules/pivotick/dist/ from source (npm run build inside submodules/pivotick/).

    python bin/build_assets.py
"""

import shutil
import sys
from pathlib import Path

ROOT            = Path(__file__).resolve().parent.parent
PIVOTICK        = ROOT / "submodules" / "pivotick"
PIVOTICK_DIST   = PIVOTICK / "dist"
PIVOTICK_STATIC = ROOT / "website" / "web" / "static" / "pivotick"

# The page loads the IIFE build (`pivotick.iife.js` + `pivotick.css`, see
# templates/conversions/detail.html), so the ES build is dropped rather than
# served: `pivotick.es.js` is only an entry point re-exporting a hashed
# `index-*.js` chunk for bundler consumers, and shipping it meant either
# committing ~680 KB nothing loads or leaving the entry pointing at a file
# absent from the repository (which is what it did until 1.5.0).
ES_BUILD_GLOBS = ("pivotick.es.js", "index-*.js", "SimulationWorker-*.js")


def main() -> None:
    if not PIVOTICK_DIST.exists():
        print("ERROR: submodules/pivotick/dist not found.")
        print("Run:  git submodule update --init  then  npm run build inside submodules/pivotick/")
        sys.exit(1)

    print("→ Copying dist/ → static/pivotick/…")
    if PIVOTICK_STATIC.exists():
        shutil.rmtree(PIVOTICK_STATIC)
    shutil.copytree(PIVOTICK_DIST, PIVOTICK_STATIC)

    print("→ Dropping the ES build (the page loads the IIFE)…")
    for pattern in ES_BUILD_GLOBS:
        for f in sorted(PIVOTICK_STATIC.glob(pattern)):
            f.unlink()
            print(f"  Removed {f.name}")

    print("\n✓ Done. Remember to commit the updated static/pivotick/ files.")


if __name__ == "__main__":
    main()
