#!/usr/bin/env python3
"""
build_assets.py
Builds Pivotick from the vendor/pivotick submodule and copies
the compiled dist/ folder into website/web/static/pivotick/.

Run once after cloning, and again after updating the submodule:
    uv run build_assets
    # or
    python bin/build_assets.py
"""

import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT            = Path(__file__).resolve().parent.parent
PIVOTICK        = ROOT / "vendor" / "pivotick"
PIVOTICK_STATIC = ROOT / "website" / "web" / "static" / "pivotick"


def run(cmd: list[str], cwd: Path) -> None:
    print(f"  $ {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr, file=sys.stderr)
        sys.exit(1)


def main() -> None:
    # ── Sanity checks ────────────────────────────────────────────────────────
    if not PIVOTICK.exists():
        print("ERROR: vendor/pivotick not found.")
        print("Run:  git submodule update --init")
        sys.exit(1)

    if not shutil.which("npm"):
        print("ERROR: npm not found. Install Node.js first.")
        sys.exit(1)

    # ── Build Pivotick ───────────────────────────────────────────────────────
    print("→ Installing Pivotick dependencies…")
    run(["npm", "install", "--silent"], cwd=PIVOTICK)

    print("→ Building Pivotick…")
    run(["npm", "run", "build"], cwd=PIVOTICK)

    dist = PIVOTICK / "dist"
    if not dist.exists():
        print("ERROR: dist/ not found after build.")
        sys.exit(1)

    # ── Copy entire dist/ into static/pivotick/ ──────────────────────────────
    print("→ Copying dist/ → static/pivotick/…")
    if PIVOTICK_STATIC.exists():
        shutil.rmtree(PIVOTICK_STATIC)
    shutil.copytree(dist, PIVOTICK_STATIC)

    # ── Patch hardcoded worker path in index-*.js ─────────────────────────────
    # The build hardcodes "/assets/SimulationWorker-<hash>.js" (absolute path)
    # which resolves to the site root, not /static/pivotick/assets/.
    # We replace it with the correct Flask static path.
    print("→ Patching worker path in index-*.js…")
    index_files = list(PIVOTICK_STATIC.glob("index-*.js"))
    if not index_files:
        print("  WARNING: no index-*.js found, skipping patch.")
    for f in index_files:
        text = f.read_text(encoding="utf-8")
        patched = re.sub(
            r'"/assets/(SimulationWorker-[^"]+\.js)"',
            r'"/static/pivotick/assets/\1"',
            text
        )
        if patched != text:
            f.write_text(patched, encoding="utf-8")
            print(f"  Patched {f.name}")
        else:
            print(f"  (nothing to patch in {f.name})")

    print("\n✓ Done.")
    print(f"  {PIVOTICK_STATIC.relative_to(ROOT)}/")
    print(f"    pivotick.js       (ES module entry)")
    print(f"    pivotick.css      (styles)")
    print(f"    assets/           (SimulationWorker — path patched)")


if __name__ == "__main__":
    main()