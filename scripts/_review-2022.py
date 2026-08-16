#!/usr/bin/env python3
"""Quality review of the assembled NEET 2022 questions.json."""
import json
import os
import re
import sys
from collections import Counter

sys.stdout.reconfigure(encoding="utf-8")
out = json.load(open("neet-out/2022/questions.json", encoding="utf-8"))["questions"]
print("total:", len(out))

ans = Counter()
for q in out:
    if not q["answers"]:
        ans["NA"] += 1
    else:
        ans[q["answers"][0]] += 1
print("answers:", dict(ans))

sec = Counter(q["section"] for q in out)
print("sections:", dict(sec))

imgdir = "neet-out/2022/images"
missing = []
for q in out:
    for f in q.get("images", []):
        if not os.path.exists(os.path.join(imgdir, f)):
            missing.append((q["number"], f))
    for o in q["options"]:
        if o.get("figure") and not os.path.exists(os.path.join(imgdir, o["figure"])):
            missing.append((q["number"], o["figure"]))
print("missing image files:", missing[:10] if missing else "NONE")

matches = [q for q in out if "List-I" in q["text"] or "List-II" in q["text"]]
print("match questions:", len(matches), [q["number"] for q in matches])

print()
for q in out[::20]:
    print(f"--- Q{q['number']} [{q['section']}] ans={q['answers']}")
    print("  text:", q["text"][:150].replace("\n", " | "))
    for o in q["options"][:2]:
        tag = ("fig:" + o["figure"]) if o.get("figure") else ""
        print("   ", o["label"], repr(o["text"][:70]), tag)
