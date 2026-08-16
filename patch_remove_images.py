import re

with open('scripts/extract_neet_2021.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove raster images section
code = re.sub(r'# ---- raster images ----.*?# ---- vector-drawn figure clusters ----', '# ---- vector-drawn figure clusters ----', code, flags=re.DOTALL)
# Remove vector-drawn figure clusters section
code = re.sub(r'# ---- vector-drawn figure clusters ----.*?# ---- option cells without text layer / garbled formulas ----', '# ---- option cells without text layer / garbled formulas ----', code, flags=re.DOTALL)
# Remove option cells section
code = re.sub(r'# ---- option cells without text layer / garbled formulas ----.*?doc\.close\(\)', 'doc.close()', code, flags=re.DOTALL)

# Let's also remove `render_clip` and `render_question_block` imports or usage if needed, but they are just functions, keeping them defined is fine as long as they are not called.

# Let's also make sure to empty images arrays
code = code.replace('target["images"].append(fname)', 'pass')
code = code.replace('q["options"][oi - 1]["figure"] = fname', 'pass')

with open('scripts/extract_neet_2021.py', 'w', encoding='utf-8') as f:
    f.write(code)
