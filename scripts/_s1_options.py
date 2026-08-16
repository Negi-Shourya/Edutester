#!/usr/bin/env python3
"""Use the clean S1 text to classify which NEET 2022 questions have
image-only options (options with empty text = drawn graphs/structures)."""
import sys
import re
import json

sys.stdout.reconfigure(encoding="utf-8")
import fitz

doc = fitz.open("scripts/_aakash_s1.pdf")
pages = [p.get_text() for p in doc]
# questions start on the page containing 'Match List-I'
start = next(i for i, t in enumerate(pages) if "Match List-I" in t)
txt = "\n".join(pages[start:])

# parse S1 questions: "N. <stem...>" then "(1) ..." options then "Answer (n)"
qs = {}
lines = txt.splitlines()
i = 0
cur = None
while i < len(lines):
    t = lines[i].strip()
    m = re.match(r"^(\d{1,3})\.\s*(.*)$", t)
    if m and 1 <= int(m.group(1)) <= 200:
        n = int(m.group(1))
        cur = {"text": m.group(2), "opts": {}}
        qs[n] = cur
        i += 1
        while i < len(lines):
            t2 = lines[i].strip()
            om = re.match(r"^\(([1-4])\)\s*(.*)$", t2)
            if om:
                cur["opts"][int(om.group(1))] = om.group(2).strip()
                i += 1
                continue
            am = re.match(r"^Answer\s*\((\d)\*?\)$", t2)
            if am:
                cur["ans"] = int(am.group(1))
                i += 1
                break
            # skip continuation lines of stem
            if re.match(r"^\([ivx]+\)|^List-|^Statement|^[A-Za-z]", t2) or not t2:
                i += 1
                continue
            # unknown - stop option parsing
            break
        continue
    i += 1

print(f"parsed {len(qs)} S1 questions")
img = []
txtq = []
for n in sorted(qs):
    q = qs[n]
    empt = [k for k in sorted(q["opts"]) if not q["opts"][k]]
    nonempty = [k for k in sorted(q["opts"]) if q["opts"][k]]
    if empt and not nonempty:
        img.append(n)
    elif nonempty and len(nonempty) < 4:
        img.append(n)
    elif not q["opts"]:
        img.append(n)
print("S1 image-option questions:", img)
doc.close()
