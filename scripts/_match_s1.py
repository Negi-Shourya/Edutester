#!/usr/bin/env python3
"""Match our 2022 questions to the Aakash Code-S1 clean reference by stem
similarity, then dump a repair table (correct stem + option set per question).
"""
import json
import re
import sys
from difflib import SequenceMatcher


def norm(t):
    t = t.lower()
    t = re.sub(r"[^a-z0-9]+", " ", t)
    return t


def tokens(t):
    return set(norm(t).split())


def read_s1():
    qs = {}
    cur = None
    for line in open('neet-out/2022/s1_questions.txt', encoding='utf-8'):
        line = line.rstrip('\n')
        m = re.match(r'^### S1 Q(\d+) ans=(\S*)', line)
        if m:
            if cur is not None:
                qs[cur['n']] = cur
            cur = {'n': int(m.group(1)), 'ans': m.group(2), 'text': '', 'opts': []}
            continue
        if cur is None:
            continue
        if line.startswith('    (') and ') ' in line[:10]:
            cur['opts'].append(line.strip())
        elif line.startswith('    '):
            t = line.strip()
            if re.match(r'^\(\d\)', t):
                cur['opts'].append(t)
            else:
                cur['text'] += ' ' + t
    if cur is not None:
        qs[cur['n']] = cur
    return qs


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    s1 = read_s1()
    data = json.load(open('neet-out/2022/questions_raw.json', encoding='utf-8'))
    ours = data['questions']
    s1_list = list(s1.values())
    s1_toks = [tokens(q['text']) for q in s1_list]

    report = []
    unmatched = []
    for q in ours:
        toks = tokens(q['text'])
        best = None
        best_score = 0.0
        for i, sq in enumerate(s1_list):
            st = s1_toks[i]
            if not toks or not st:
                continue
            inter = len(toks & st)
            score = inter / max(1, min(len(toks), len(st)))
            if score > best_score:
                best_score = score
                best = sq
        if best and best_score >= 0.3:
            report.append((q['number'], q['text'], best_score, best))
        else:
            unmatched.append((q['number'], q['text'], best_score, best))

    # print matches with low-ish scores to eyeball, and unmatched
    print("=== LOW SCORE / UNMATCHED ===")
    for qno, text, score, best in sorted(unmatched + [r for r in report if r[2] < 0.5], key=lambda r: r[2]):
        print(f"Q{qno} score={score:.2f} ours: {text[:90]}")
        if best:
            print(f"     s1 Q{best['n']}: {best['text'][:90]}")

    # dump repair table: our qno -> s1 text
    with open('neet-out/2022/_stem_fixes.json', 'w', encoding='utf-8') as f:
        json.dump({qno: {'s1_q': b['n'], 's1_text': b['text'].strip(),
                          's1_opts': b['opts'], 's1_ans': b['ans'],
                          'score': score}
                   for qno, text, score, b in report}, f, indent=1, ensure_ascii=False)
    print(f"\nmatched: {len(report)} / {len(ours)}  -> _stem_fixes.json")


if __name__ == "__main__":
    main()
