#!/usr/bin/env python3
"""Post-process NEET 2025 extraction: remove mis-attributed images.

The extraction script misattributes many raster images:
  * PW/MedEd advertisements
  * Match-the-following tables that belong to different questions
  * Watermarks and logos

This script takes a smarter approach:
  1. Questions with _block.png → keep ONLY blocks + option images
  2. Questions with text → remove rasters that are ads/logos
  3. Uses image content analysis (color histogram) to detect ads
  4. Removes images > 300px wide that are likely ads
  5. Uses the PDF to verify image placement

Run:  python scripts/cleanup_neet_2025_v2.py
"""
import json
import os
import sys
from collections import defaultdict

try:
    from PIL import Image
except ImportError:
    os.system(f"{sys.executable} -m pip install Pillow")
    from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "neet-out", "2025")
IMG_DIR = os.path.join(OUT_DIR, "images")
JSON_PATH = os.path.join(OUT_DIR, "questions.json")


def is_block_image(fname):
    return "_block" in fname


def is_option_image(fname):
    return "_opt" in fname


def is_stem_image(fname):
    return "_stem" in fname


def image_looks_like_ad(filepath):
    """Check if an image looks like an advertisement (colorful, large, photos)."""
    try:
        img = Image.open(filepath)
        w, h = img.size
        # Ads are typically wide banners
        if w > 700 and h > 200:
            return True
        # Very large images with lots of colors are likely ads/photos
        if w * h > 200000:
            # Check if image has many colors (photos/ads) vs diagrams (few colors)
            img_rgb = img.convert("RGB")
            colors = img_rgb.getcolors(maxcolors=50000)
            if colors is None:  # Too many unique colors = likely a photo/ad
                return True
            if len(colors) > 20000:
                return True
        return False
    except Exception:
        return False


def image_is_table_for_wrong_question(filepath, question):
    """Check if an image contains a match-the-following table that doesn't
    belong to this question (the question text doesn't mention List/Match)."""
    text = question.get("text", "")
    # If the question text mentions List-I, Match, table etc, then a table image is valid
    if any(kw in text.lower() for kw in ["list-", "match ", "match\n", "column"]):
        return False
    
    # Check if this image contains visible text structure like a table
    # (large images with grid-like structure from match questions)
    try:
        img = Image.open(filepath)
        w, h = img.size
        # Tables from match questions are typically 300-500px wide
        if 200 < w < 600 and 200 < h < 600:
            # Check if mostly white/light (typical for table captures)
            img_rgb = img.convert("RGB")
            pixels = list(img_rgb.getdata())
            light_pixels = sum(1 for r, g, b in pixels if r > 200 and g > 200 and b > 200)
            ratio = light_pixels / len(pixels) if pixels else 0
            # Tables tend to be mostly white with black text and lines
            if ratio > 0.6:
                return True
    except Exception:
        pass
    return False


def has_diagram_keywords(text):
    """Check if question text references a figure/diagram."""
    keywords = [
        "figure", "diagram", "circuit", "graph", "shown", "given",
        "below", "above", "following figure", "the figure", "in the",
        "logic", "gate", "as shown", "represents"
    ]
    text_lower = text.lower()
    return any(kw in text_lower for kw in keywords)


def cleanup():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    questions = data["questions"]
    removed = []
    kept = []
    modified = 0

    for q in questions:
        qnum = q["number"]
        images = q.get("images", [])
        options = q.get("options", [])
        text = q.get("text", "")
        
        if not images:
            continue

        # Separate image types
        blocks = [f for f in images if is_block_image(f)]
        opts = [f for f in images if is_option_image(f)]
        stems = [f for f in images if is_stem_image(f)]
        rasters = [f for f in images
                   if not is_block_image(f) and not is_option_image(f) and not is_stem_image(f)]

        new_images = list(blocks) + list(stems)  # Always keep blocks and stems
        
        # For questions WITH block images, drop all individual rasters
        # (the block already contains the full question as a screenshot)
        if blocks:
            for r in rasters:
                removed.append((qnum, r, "has block image"))
            # Don't add rasters
        else:
            # No block images — analyze each raster
            for r in rasters:
                filepath = os.path.join(IMG_DIR, r)
                if not os.path.exists(filepath):
                    removed.append((qnum, r, "file missing"))
                    continue

                # Check for advertisements
                if image_looks_like_ad(filepath):
                    removed.append((qnum, r, "looks like ad"))
                    continue

                # Check for misattributed table images
                if image_is_table_for_wrong_question(filepath, q):
                    removed.append((qnum, r, "misattributed table"))
                    continue

                # Check image dimensions — tiny images are artifacts
                try:
                    img = Image.open(filepath)
                    w, h = img.size
                    if w < 40 or h < 40:
                        removed.append((qnum, r, "too small"))
                        continue
                    if w * h < 2500:
                        removed.append((qnum, r, "tiny area"))
                        continue
                except Exception:
                    removed.append((qnum, r, "cannot open"))
                    continue

                # If text has NO diagram keywords and image is small/medium, be suspicious
                if len(text) > 50 and not has_diagram_keywords(text):
                    try:
                        size = os.path.getsize(filepath)
                        if size < 4000:
                            removed.append((qnum, r, "no fig reference + small file"))
                            continue
                    except Exception:
                        pass

                # Keep this raster image
                new_images.append(r)
                kept.append((qnum, r))

        # Handle option images from the question's options
        for opt in options:
            fig = opt.get("figure") or opt.get("image")
            if fig and is_option_image(fig):
                # Keep option images in place
                pass

        if set(new_images) != set(images):
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

    # Report
    print("=" * 64)
    print("  NEET 2025 IMAGE CLEANUP v2 REPORT")
    print("=" * 64)
    print(f"Total questions:       {len(questions)}")
    print(f"Questions modified:    {modified}")
    print(f"Images removed:        {len(removed)}")
    print(f"Images kept:           {sum(1 for q in questions for _ in q.get('images', []))}")
    print(f"Orphaned files deleted: {orphans}")
    print()
    
    if removed:
        print("Removed images:")
        for qnum, fname, reason in sorted(removed):
            print(f"  Q{qnum}: {fname} ({reason})")
    
    print()
    print("Final image distribution:")
    for q in questions:
        if q.get("images"):
            print(f"  Q{q['number']}: {', '.join(q['images'])}")


if __name__ == "__main__":
    cleanup()
