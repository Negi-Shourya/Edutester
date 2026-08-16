#!/usr/bin/env python3
"""Extract the full Aakash Code-S1 NEET 2022 paper (text) into JSON.

The earlier dump (s1_questions.txt) truncated each stem to 220 chars; this
writes the full text so it can be used as the clean source for the 2022
question bank. Section boundaries: 1-50 Physics, 51-100 Chemistry, 101-150
Botany, 151-200 Zoology.
"""
import json
import re
import sys

import fitz

PDF = "scripts/_aakash_s1.pdf"
OUT = "neet-out/2022/s1_full.json"


def parse_questions(texts):
    questions = {}
    cur = None
    for t in texts:
        for line in t.split("\n"):
            line = line.strip()
            if not line:
                continue
            m = re.match(r"^(\d{1,3})\.\s*$", line)
            m2 = re.match(r"^(\d{1,3})\.\s+(.+)$", line) if not m else None
            if m or m2:
                n = int((m or m2).group(1))
                if 1 <= n <= 200:
                    if cur is not None:
                        questions[cur["n"]] = cur
                    cur = {
                        "n": n,
                        "text": (m2.group(2) if m2 else ""),
                        "opts": [],
                        "ans": None,
                    }
                    continue
            if cur is not None:
                am = re.match(r"^Answer\s*\(([^)]*)\)\s*$", line)
                if am:
                    cur["ans"] = am.group(1)
                elif re.match(r"^\(\d\)\s*", line):
                    cur["opts"].append(line)
                elif cur["opts"]:
                    cur["opts"][-1] += " " + line
                else:
                    cur["text"] += " " + line
    if cur is not None:
        questions[cur["n"]] = cur
    return questions


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    doc = fitz.open(PDF)
    qs = parse_questions([doc[p].get_text() for p in range(len(doc))])
    doc.close()

    def section(n):
        if n <= 50:
            return "PHYSICS"
        if n <= 100:
            return "CHEMISTRY"
        if n <= 150:
            return "BOTANY"
        return "ZOOLOGY"

    out = []
    for n in range(1, 201):
        q = qs.get(n)
        if q is None:
            print(f"WARN: S1 Q{n} missing", file=sys.stderr)
            continue
        opts = []
        for i, o in enumerate(q["opts"], 1):
            o = re.sub(r"^\(\d\)\s*", "", o).strip()
            opts.append({"label": str(i), "text": o})
        out.append(
            {
                "number": n,
                "section": section(n),
                "text": q["text"].strip(),
                "options": opts,
                "answers": q["ans"],
            }
        )
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump({"key": "neet-2022-s1", "questions": out}, f, indent=1, ensure_ascii=False)
    print(f"wrote {len(out)} questions -> {OUT}")


if __name__ == "__main__":
    main()
