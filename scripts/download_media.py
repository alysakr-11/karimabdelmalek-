#!/usr/bin/env python3
"""Download every image listed in data/media-manifest.csv at original resolution.

Usage:  python3 scripts/download_media.py            # downloads into ./media
        python3 scripts/download_media.py --dry-run  # just lists what it would fetch
No dependencies beyond the Python standard library. Safe to re-run (skips existing files).
"""
import csv, os, sys, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "data", "media-manifest.csv")
dry = "--dry-run" in sys.argv
ok = skip = fail = 0
with open(MANIFEST, newline="") as f:
    rows = list(csv.DictReader(f))
for i, r in enumerate(rows, 1):
    dest = os.path.join(ROOT, r["local_path"])
    if os.path.exists(dest):
        skip += 1; continue
    print(f"[{i}/{len(rows)}] {r['local_path']}")
    if dry: continue
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    try:
        req = urllib.request.Request(r["original_url"], headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as resp, open(dest, "wb") as out:
            out.write(resp.read())
        ok += 1; time.sleep(0.2)
    except Exception as e:
        print(f"   FAILED: {e}"); fail += 1
print(f"\nDone. downloaded={ok} skipped={skip} failed={fail}")
