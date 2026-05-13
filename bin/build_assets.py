#!/usr/bin/env python3
"""
build_assets.py
Copies the pre-built Pivotick dist/ into website/web/static/pivotick/.

The compiled files are committed directly to the repository, so this script
is NOT needed for normal use. Run it only if you have manually rebuilt
vendor/pivotick/dist/ from source (npm run build inside vendor/pivotick/).

    python bin/build_assets.py
"""

import re
import shutil
import sys
from pathlib import Path

ROOT            = Path(__file__).resolve().parent.parent
PIVOTICK        = ROOT / "vendor" / "pivotick"
PIVOTICK_DIST   = PIVOTICK / "dist"
PIVOTICK_STATIC = ROOT / "website" / "web" / "static" / "pivotick"


def main() -> None:
    if not PIVOTICK_DIST.exists():
        print("ERROR: vendor/pivotick/dist not found.")
        print("Run:  git submodule update --init  then  npm run build inside vendor/pivotick/")
        sys.exit(1)

    print("→ Copying dist/ → static/pivotick/…")
    if PIVOTICK_STATIC.exists():
        shutil.rmtree(PIVOTICK_STATIC)
    shutil.copytree(PIVOTICK_DIST, PIVOTICK_STATIC)

    print("→ Patching worker path in index-*.js…")
    for f in PIVOTICK_STATIC.glob("index-*.js"):
        text = f.read_text(encoding="utf-8")
        patched = re.sub(
            r'"/assets/(SimulationWorker-[^"]+\.js)"',
            r'"/static/pivotick/assets/\1"',
            text
        )
        if patched != text:
            f.write_text(patched, encoding="utf-8")
            print(f"  Patched {f.name}")

    print("\n✓ Done. Remember to commit the updated static/pivotick/ files.")


if __name__ == "__main__":
    main()
