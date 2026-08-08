#!/usr/bin/env python3
"""Post-process NEET 2025 extraction: remove spurious raster images.

Problems addressed:
  - PDF watermarks, logos, and decorative elements get false-matched to
    questions as Q{n}.png, Q{n}_2.png, etc.
  - Block screenshots (_block.png) and option screenshots (_opt{n}.png) are
    correct and should be kept.
  - Questions that already have _block.png don't need individual raster images
    since the block already contains the full question rendering.

Strategy:
  1. If a question has _block.png, keep ONLY block + option images, drop
     individual raster images.
  2. For remaining individual images, open with Pillow and check dimensions.
     Images smaller than 40×40 px or with area < 2500 px² are artifacts.
  3. Additionally check: if a question has substantial text (>30 chars) and
     the text does NOT reference a figure/diagram/circuit/graph, then small
     raster images (< 5000 bytes) are likely artifacts too.
  4. _opt{n}.png images are always kept.
  5. Orphaned image files are deleted from disk.
"""

import json
import os
import re
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow not found. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "neet-out" / "2025"
JSON_PATH = OUT_DIR / "questions.json"
IMAGES_DIR = OUT_DIR / "images"

# ---------------------------------------------------------------------------
# Classification helpers
# ---------------------------------------------------------------------------

# Patterns for image filename classification
RE_BLOCK   = re.compile(r"^Q\d+_block\d*\.png$")
RE_OPT     = re.compile(r"^Q\d+_opt\d+\.png$")
RE_RASTER  = re.compile(r"^Q\d+(?:_\d+)?\.png$")   # Q2.png, Q2_2.png, etc.

# Words/phrases that suggest the question genuinely needs a figure
FIGURE_KEYWORDS = re.compile(
    r"\b(figure|diagram|circuit|graph|table|image|picture|shown|given below|"
    r"see figure|as shown|shown in|given figure|shown below|above figure|"
    r"following figure|following diagram|given circuit|the circuit|"
    r"the figure|the diagram|the graph|logic gate|logic implementation)\b",
    re.IGNORECASE,
)

# Pixel-area threshold below which an image is considered an artifact
MIN_WIDTH  = 40
MIN_HEIGHT = 40
MIN_AREA   = 2500   # px²

# Byte-size threshold for "suspiciously small" files when question has text
SMALL_FILE_BYTES = 5000


def classify_image(filename: str):
    """Return 'block', 'opt', or 'raster'."""
    if RE_BLOCK.match(filename):
        return "block"
    if RE_OPT.match(filename):
        return "opt"
    if RE_RASTER.match(filename):
        return "raster"
    return "unknown"


def is_artifact_by_dimensions(filepath: Path) -> bool:
    """Check if an image is too small to be a real diagram."""
    try:
        with Image.open(filepath) as img:
            w, h = img.size
            if w < MIN_WIDTH or h < MIN_HEIGHT:
                return True
            if w * h < MIN_AREA:
                return True
    except Exception:
        return False
    return False


def question_has_figure_reference(text: str) -> bool:
    """Check if the question text references a figure/diagram."""
    return bool(FIGURE_KEYWORDS.search(text))


# ---------------------------------------------------------------------------
# Main cleanup
# ---------------------------------------------------------------------------

def cleanup():
    print(f"Loading {JSON_PATH} ...")
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    questions = data["questions"]
    total_q = len(questions)

    # Stats
    removed_images = []      # (qnum, filename, reason)
    kept_images = []         # (qnum, filename)
    questions_modified = 0

    for q in questions:
        qnum = q["number"]
        images = q.get("images", [])
        if not images:
            continue

        text = q.get("text", "")
        original_count = len(images)

        # Classify images for this question
        blocks  = [f for f in images if classify_image(f) == "block"]
        opts    = [f for f in images if classify_image(f) == "opt"]
        rasters = [f for f in images if classify_image(f) == "raster"]

        # Also classify option-level images
        opt_option_imgs = set()
        for opt in q.get("options", []):
            if opt.get("image"):
                opt_option_imgs.add(opt["image"])

        new_images = list(blocks)  # Always keep blocks

        # ── RULE 1: If question has block images, drop all rasters ────────
        if blocks:
            for r in rasters:
                removed_images.append((qnum, r, "has _block.png"))
        else:
            # ── RULE 2: Filter rasters by dimensions / size ───────────────
            for r in rasters:
                filepath = IMAGES_DIR / r
                if not filepath.exists():
                    removed_images.append((qnum, r, "file missing"))
                    continue

                file_size = filepath.stat().st_size

                # Check pixel dimensions
                if is_artifact_by_dimensions(filepath):
                    removed_images.append((qnum, r, f"tiny image (dims)"))
                    continue

                # If question has substantial text and does NOT reference a
                # figure, then small files are likely artifacts
                if (len(text) > 30
                        and not question_has_figure_reference(text)
                        and file_size < SMALL_FILE_BYTES):
                    removed_images.append(
                        (qnum, r, f"text-only Q, small file ({file_size}B)")
                    )
                    continue

                # Passed all checks — keep it
                new_images.append(r)

        # Always keep option images at question level too
        new_images.extend(opts)

        # Deduplicate while preserving order
        seen = set()
        deduped = []
        for img in new_images:
            if img not in seen:
                seen.add(img)
                deduped.append(img)
        new_images = deduped

        if len(new_images) != original_count:
            questions_modified += 1

        for img in new_images:
            kept_images.append((qnum, img))

        q["images"] = new_images

    # ------------------------------------------------------------------
    # Write cleaned JSON
    # ------------------------------------------------------------------
    print(f"\nWriting cleaned JSON to {JSON_PATH} ...")
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)

    # ------------------------------------------------------------------
    # Build set of referenced images (question-level + option-level)
    # ------------------------------------------------------------------
    referenced = set()
    for q in questions:
        for img in q.get("images", []):
            referenced.add(img)
        for opt in q.get("options", []):
            if opt.get("image"):
                referenced.add(opt["image"])

    # Delete orphaned files
    orphaned = []
    if IMAGES_DIR.exists():
        for fpath in sorted(IMAGES_DIR.iterdir()):
            if fpath.name not in referenced:
                orphaned.append(fpath.name)
                fpath.unlink()

    # ------------------------------------------------------------------
    # Report
    # ------------------------------------------------------------------
    print("\n" + "=" * 64)
    print("  NEET 2025 IMAGE CLEANUP REPORT")
    print("=" * 64)

    print(f"\nTotal questions:      {total_q}")
    print(f"Questions modified:   {questions_modified}")
    print(f"Images removed:       {len(removed_images)}")
    print(f"Images kept:          {len(kept_images)}")
    print(f"Orphaned files deleted: {len(orphaned)}")

    if removed_images:
        print("\n── Removed images ──────────────────────────────────────────")
        for qnum, fname, reason in sorted(removed_images):
            print(f"  Q{qnum:>3}  {fname:<25s}  ({reason})")

    if orphaned:
        print("\n── Orphaned files deleted ──────────────────────────────────")
        for name in orphaned:
            print(f"  {name}")

    print("\n── Per-question image summary (questions with images) ───────")
    q_imgs = {}
    for qnum, fname in kept_images:
        q_imgs.setdefault(qnum, []).append(fname)
    for qnum in sorted(q_imgs):
        imgs = q_imgs[qnum]
        print(f"  Q{qnum:>3}: {', '.join(imgs)}")

    print(f"\nDone. Cleaned JSON written to {JSON_PATH}")


if __name__ == "__main__":
    cleanup()
