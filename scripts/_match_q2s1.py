#!/usr/bin/env python3
"""Robustly match the 200 NEET-2022 (collegedunia scan) questions to the 200
Aakash Code-S1 clean questions, using option-content overlap (order
independent) plus a stem bonus, within each section.

The old stem-only fuzzy matcher (_match_s1.py) mis-mapped questions whose
OCR stems were short or generic (e.g. "Choose the correct statement:").
Options are more distinctive, so matching on them is reliable.

Writes neet-out/2022/_q2s1_map.json: { qno: { s1_q, score, match: "opts"|"stem"|"mixed" } }
"""
import json
import re
import sys


def norm(t):
    return set(re.sub(r"[^a-z0-9]+", " ", t.lower()).split())


def jaccard(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    raw = json.load(open("neet-out/2022/questions_raw.json", encoding="utf-8"))["questions"]
    s1 = json.load(open("neet-out/2022/s1_full.json", encoding="utf-8"))["questions"]

    s1_by_section = {}
    for q in s1:
        s1_by_section.setdefault(q["section"], []).append(q)

    SECTION_MAP = {"PHYSICS": "PHYSICS", "CHEMISTRY": "CHEMISTRY",
                   "BOTANY": "BOTANY", "ZOOLOGY": "ZOOLOGY"}

    def pair_score(q, sq):
        """Order-independent option overlap + stem bonus."""
        q_opts = [norm(o.get("text") or "") for o in q.get("options") or []]
        s_opts = [norm(o["text"]) for o in sq["options"]]
        if not q_opts or not s_opts:
            return 0.0
        # match each of our options to its best s1 option
        used = set()
        total = 0.0
        for qo in q_opts:
            best = 0.0
            best_i = -1
            for i, so in enumerate(s_opts):
                if i in used:
                    continue
                s = jaccard(qo, so)
                if s > best:
                    best, best_i = s, i
            if best_i >= 0:
                used.add(best_i)
            total += best
        opt_score = total / max(1, len(q_opts))
        stem_score = jaccard(norm(q.get("text") or ""), norm(sq["text"]))
        return opt_score + 0.35 * stem_score

    pairs = []
    for q in raw:
        sec = SECTION_MAP[q["section"]]
        for sq in s1_by_section[sec]:
            pairs.append((pair_score(q, sq), q["number"], sq["number"]))

    pairs.sort(key=lambda p: -p[0])
    used_s1 = set()
    used_q = set()
    mapping = {}
    for score, qno, s1no in pairs:
        if qno in used_q or s1no in used_s1:
            continue
        used_q.add(qno)
        used_s1.add(s1no)
        mapping[qno] = {"s1_q": s1no, "score": round(score, 3)}
    # any leftover
    for q in raw:
        if q["number"] not in used_q:
            mapping[q["number"]] = {"s1_q": None, "score": 0}

    json.dump(mapping, open("neet-out/2022/_q2s1_map.json", "w", encoding="utf-8"),
              indent=1, ensure_ascii=False)

    unmatched_s1 = [q["number"] for q in s1 if q["number"] not in used_s1]
    low = sorted(((qno, v["score"]) for qno, v in mapping.items() if v["score"] < 0.55),
                 key=lambda t: t[1])
    print(f"mapped {len(used_q)}/200  unmatched S1: {unmatched_s1}")
    print(f"low-score (<0.55): {[qno for qno, s in low]}")


if __name__ == "__main__":
    main()
