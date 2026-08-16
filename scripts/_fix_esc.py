import io

BS = chr(92)  # single backslash
p = "scripts/extract_neet_2022.py"
src = io.open(p, encoding="utf-8").read()
double = BS + BS
n = src.count(double)
fixed = src.replace(double, BS)
io.open(p, "w", encoding="utf-8").write(fixed)
print("collapsed", n, "doubled-backslash pairs")
