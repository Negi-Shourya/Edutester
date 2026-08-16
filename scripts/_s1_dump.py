#!/usr/bin/env python3
"""Dump Aakash Code-S1 questions (clean text) for cross-reference."""
import re
import sys

import fitz

doc = fitz.open('scripts/_aakash_s1.pdf')
full = []
for pno in range(len(doc)):
    full.append(doc[pno].get_text())

# find the physics/chemistry/biology section starts by looking for "SECTION"
# Simpler: walk all text and extract numbered questions with options.
def parse_questions(texts):
    questions = {}
    cur = None
    buf = []
    for pno, t in enumerate(texts):
        for line in t.split('\n'):
            line = line.strip()
            if not line:
                continue
            m = re.match(r'^(\d{1,3})\.\s*$', line)
            m2 = re.match(r'^(\d{1,3})\.\s+(.+)$', line) if not m else None
            if m or m2:
                n = int((m or m2).group(1))
                if 1 <= n <= 200:
                    if cur is not None:
                        questions[cur['n']] = cur
                    cur = {'n': n, 'text': (m2.group(2) if m2 else ''), 'opts': [], 'ans': None}
                    continue
            if cur is not None:
                am = re.match(r'^Answer\s*\(([^)]*)\)\s*$', line)
                if am:
                    cur['ans'] = am.group(1)
                elif re.match(r'^\(\d\)\s*', line):
                    cur['opts'].append(line)
                elif cur['opts']:
                    cur['opts'][-1] += ' ' + line
                else:
                    cur['text'] += ' ' + line
    if cur is not None:
        questions[cur['n']] = cur
    return questions

qs = parse_questions(full)
for n in sorted(qs):
    q = qs[n]
    print(f"### S1 Q{n} ans={q['ans']}")
    print('  ', q['text'][:220])
    for o in q['opts']:
        print('   ', o[:180])
    print()

doc.close()
