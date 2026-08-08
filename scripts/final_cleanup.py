#!/usr/bin/env python3
"""Final cleanup of NEET 2025 images — remove ALL misattributed raster images.

The extraction script's raster image attribution is systematically wrong:
 * Images from the Hindi translation column get mapped to English questions
 * PW ads, match tables from other questions, and chemistry structures
   get wrongly assigned to physics/biology questions
 * Only _block.png and _opt*.png images have reliable placement

This script:
 1. Removes ALL individual raster images (Q{n}.png, Q{n}_2.png, etc.)
 2. Keeps _block.png, _block2.png images (full question screenshots)
 3. Keeps _opt{n}.png images (option cell screenshots)
 4. Deletes orphaned image files
 5. Writes the cleaned questions.json

Run:  python scripts/final_cleanup.py
"""
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "neet-out", "2025")
IMG_DIR = os.path.join(OUT_DIR, "images")
JSON_PATH = os.path.join(OUT_DIR, "questions.json")


def cleanup():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    questions = data["questions"]
    removed_total = 0
    kept_total = 0
    modified = 0

    for q in questions:
        images = q.get("images", [])
        if not images:
            continue

        new_images = []
        for fname in images:
            # Keep block screenshots (these are reliable)
            if "_block" in fname:
                new_images.append(fname)
                kept_total += 1
                continue
            # Keep option cell screenshots (these are reliable)
            if "_opt" in fname:
                new_images.append(fname)
                kept_total += 1
                continue
            # Keep stem screenshots
            if "_stem" in fname:
                new_images.append(fname)
                kept_total += 1
                continue
            # Remove all other raster images (misattributed)
            removed_total += 1

        if len(new_images) != len(images):
            modified += 1
            q["images"] = new_images

    # Write back
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)

    # Collect all referenced files
    all_refs = set()
    for q in questions:
        for f in q.get("images", []):
            all_refs.add(f)
        for opt in q.get("options", []):
            fig = opt.get("figure") or opt.get("image")
            if fig:
                all_refs.add(fig)

    # Delete orphaned files
    orphans = 0
    if os.path.isdir(IMG_DIR):
        for f in os.listdir(IMG_DIR):
            if f not in all_refs:
                os.remove(os.path.join(IMG_DIR, f))
                orphans += 1

    print("=" * 60)
    print("  NEET 2025 FINAL IMAGE CLEANUP")
    print("=" * 60)
    print(f"Questions modified: {modified}")
    print(f"Raster images removed: {removed_total}")
    print(f"Images kept: {kept_total}")
    print(f"Orphaned files deleted: {orphans}")
    print()
    print("Remaining images:")
    for q in questions:
        if q.get("images"):
            imgs_str = ", ".join(q["images"])
            print(f"  Q{q['number']}: {imgs_str}")
    
    # Also list option images
    opt_imgs = []
    for q in questions:
        for opt in q.get("options", []):
            fig = opt.get("figure") or opt.get("image")
            if fig:
                opt_imgs.append(f"Q{q['number']} opt{opt.get('label', '?')}: {fig}")
    if opt_imgs:
        print()
        print("Option images:")
        for oi in opt_imgs:
            print(f"  {oi}")


if __name__ == "__main__":
    cleanup()
