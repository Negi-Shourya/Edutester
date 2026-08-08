import json, re

d = json.load(open("neet-out/2025/questions.json", encoding="utf-8"))
qs = d["questions"]
out = []

def t(q):
    return q["text"] + " " + " ".join(o["text"] for o in q["options"])

out.append("total questions: %d" % len(qs))

mojibake = {}
for q in qs:
    txt = t(q)
    for m in re.finditer(r"[^\x00-\x7F\u2192\u00B0\u0394\u2212\u00D7\u221D\u03B1-\u03C9\u00B2\u00B3\u00B9\u2070\u2071\u2074-\u207F\u2080-\u209C\u2113\u2260\u2264\u2265\u00B1\u2248\u221E\u2022]", txt):
        c = m.group(0)
        mojibake[c] = mojibake.get(c, 0) + 1
out.append("non-ascii / non-math chars found: %s" % str(sorted(mojibake.items(), key=lambda x: -x[1])))

out.append("")
out.append("degree sign as FFFD? %d" % sum(1 for q in qs if "\uFFFD" in t(q)))
out.append("questions w/ U+FFFD: %s" % [q["number"] for q in qs if "\uFFFD" in t(q)][:20])

fracs = [q["number"] for q in qs if "\\frac" in t(q)]
sups = [q["number"] for q in qs if "^{" in t(q)]
subs = [q["number"] for q in qs if "_{" in t(q)]
out.append("")
out.append("questions with \\frac: %d" % len(fracs))
out.append("questions with ^{}: %d" % len(sups))
out.append("questions with _{}: %d" % len(subs))

bare = []
for q in qs:
    txt = t(q)
    for m in re.finditer(r"\d\s*[xX]\s*10\^?[-\u2212]?\d", txt):
        bare.append((q["number"], m.group(0)[:20]))
out.append("")
out.append("suspicious x10 patterns: %d" % len(bare))
for n, s in bare[:15]:
    out.append("  Q%d: %s" % (n, s))

out.append("")
no_text = [q["number"] for q in qs if not q["text"]]
out.append("questions with no text: %s" % no_text)
no_opts = [q["number"] for q in qs if len(q["options"]) != 4]
out.append("questions not having 4 options: %s" % no_opts)

out.append("")
imgs = [(q["number"], q["images"]) for q in qs if q.get("images")]
out.append("questions with images: %d" % len(imgs))
for n, im in imgs[:40]:
    out.append("  Q%d: %s" % (n, im))

open("audit.txt", "w", encoding="utf-8").write("\n".join(out))
print("ok")
