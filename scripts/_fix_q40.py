"""Set Q40's options to the truth tables (matrix notation) and copy the
user's clean option images into the images folder.

Confirmed against the paper scan (Code S1) - option order:
  1: 000/011/101/110  (C = A xor B)
  2: 001/010/100/111  (C = A and B)
  3: 001/010/101/110  (C = B-bar)  <- answer 3
  4: 000/011/100/111  (C = B)
"""
import json
import os
import shutil

DIR = "neet-out/2022"
SRC = os.path.join("neet", "neet 2022 question 40")

TABLES = {
    "1": ["000", "011", "101", "110"],
    "2": ["001", "010", "100", "111"],
    "3": ["001", "010", "101", "110"],
    "4": ["000", "011", "100", "111"],
}

USER_FILES = {
    "1": "option a.png",
    "2": "option b.png",
    "3": "option c.png",
    "4": "option d.png",
}


def matrix_text(rows):
    """[[A, B, C], [r1], [r2], [r3], [r4]] using the app's matrix notation."""
    header = "[[A, B, C]"
    body = ", ".join(f"[{', '.join(r)}]" for r in rows)
    return header + ", " + body + "]"


with open(os.path.join(DIR, "questions.json"), encoding="utf-8") as f:
    data = json.load(f)

for q in data["questions"]:
    if q.get("number") == 40 and q.get("section") == "PHYSICS":
        for opt in q["options"]:
            label = opt["label"]
            opt["text"] = matrix_text(TABLES[label])
        print("Q40 updated, answers:", q["answers"])

# copy clean images over the faint scan crops
for label, fname in USER_FILES.items():
    dst = os.path.join(DIR, "images", f"Q40_opt{label}.png")
    shutil.copyfile(os.path.join(SRC, fname), dst)
    print("copied", fname, "->", dst)

with open(os.path.join(DIR, "questions.json"), "w", encoding="utf-8") as f:
    json.dump(data, f, indent=1, ensure_ascii=False)
print("saved questions.json")
