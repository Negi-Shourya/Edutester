#!/usr/bin/env python3
"""Char-level dump of the NEET 2020 Aakash PDF (geometry + fonts + drawings).

Usage:
  python scripts/_dump2020.py <page> [ymin ymax] [--col L|R] [--draw]
"""
import sys
import fitz

PDF = "neet/Ques&Ans_NEET2020.pdf"
GUTTER = 306.0


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a for a in sys.argv[1:] if a.startswith("--")}
    page = int(args[0])
    ymin = float(args[1]) if len(args) > 1 else 0.0
    ymax = float(args[2]) if len(args) > 2 else 1e9
    col = None
    for f in flags:
        if f.startswith("--col"):
            col = f.split("=")[1] if "=" in f else None

    d = fitz.open(PDF)
    p = d[page]

    for b in p.get_text("rawdict")["blocks"]:
        if b["type"] != 0:
            continue
        for line in b["lines"]:
            for s in line["spans"]:
                for c in s["chars"]:
                    x, y = c["origin"]
                    if not (ymin <= y <= ymax):
                        continue
                    if col == "L" and x >= GUTTER:
                        continue
                    if col == "R" and x < GUTTER:
                        continue
                    bb = c["bbox"]
                    print(
                        "x=%7.2f y=%7.2f sz=%5.2f h=%5.2f %-14s %r  bb=(%.1f,%.1f,%.1f,%.1f)"
                        % (x, y, s["size"], bb[3] - bb[1], s["font"], c["c"], *bb)
                    )

    if "--draw" in flags:
        print("\n--- drawings ---")
        for dr in p.get_drawings():
            r = dr["rect"]
            if not (ymin <= r.y0 <= ymax or ymin <= r.y1 <= ymax):
                continue
            if col == "L" and r.x0 >= GUTTER:
                continue
            if col == "R" and r.x1 < GUTTER:
                continue
            print(
                "%s fill=%s color=%s w=%s rect=(%.1f,%.1f,%.1f,%.1f) items=%d"
                % (
                    dr["type"],
                    dr.get("fill"),
                    dr.get("color"),
                    dr.get("width"),
                    r.x0,
                    r.y0,
                    r.x1,
                    r.y1,
                    len(dr["items"]),
                )
            )


if __name__ == "__main__":
    main()
