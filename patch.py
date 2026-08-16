import re
import os

with open('scripts/extract_neet_2024.py', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('PDF_PATH = os.path.join("neet", "2024 Neet.pdf")', 'PDF_PATH = os.path.join("neet", "neet 2021 question paper.pdf")')
code = code.replace('OUT_DIR = os.path.join("neet-out", "2024")', 'OUT_DIR = os.path.join("neet-out", "2021")')

key_func = '''
def get_answer_key():
    import fitz
    ans_key = {}
    doc = fitz.open(os.path.join("neet", "neet 2021 answer key.pdf"))
    lines = []
    for page in doc:
        text = page.get_text("text")
        lines.extend([l.strip() for l in text.split("\\n") if l.strip()])
    
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.isdigit():
            qnum = int(line)
            if i + 1 < len(lines) and lines[i+1].isdigit():
                ans = lines[i+1]
                ans_key[qnum] = ans
                i += 2
                continue
        i += 1
    return ans_key

'''
code = code.replace('def main():', key_func + 'def main():')

code = code.replace('"answers": [],', '"answers": [ans_key.get(n)] if ans_key.get(n) else [],')
code = code.replace('"solution": [],', '"solution": "",')

code = code.replace('sys.stdout.reconfigure(encoding="utf-8")', 'sys.stdout.reconfigure(encoding="utf-8")\n    global ans_key\n    ans_key = get_answer_key()')

code = code.replace('if is_answer_key_page(doc[pno]):\n            break', '')

skip_patch = '''
    if t.startswith("Test Booklet") or "AGAJHA" in t or "M4" in t:
        return True
    if t.isdigit() and len(t) < 3: # page numbers
        return True
'''
code = code.replace('if t.startswith("Test Booklet"):\n        return True', skip_patch.strip())

code = code.replace('"key": "neet-2024"', '"key": "neet-2021"')
code = code.replace('"title": "NEET (UG) 2024"', '"title": "NEET (UG) 2021"')
code = code.replace('"fullTitle": "NEET (UG) 2024 - National Eligibility cum Entrance Test"', '"fullTitle": "NEET (UG) 2021 - National Eligibility cum Entrance Test"')
code = code.replace('"examDate": "2024-05-05"', '"examDate": "2021-09-12"')
code = code.replace('"durationMinutes": 200', '"durationMinutes": 180')
code = code.replace('Paper: neet-2024', 'Paper: neet-2021')

sol_loop = '''
        for sol in q.get("solution", []):
            if isinstance(sol, dict):
                sol["text"] = polish_math(sol.get("text", ""))
            else:
                q["solution"] = [polish_math(s) for s in q["solution"]]
'''
code = code.replace(sol_loop, '        q["solution"] = polish_math(q.get("solution", ""))')

with open('scripts/extract_neet_2021.py', 'w', encoding='utf-8') as f:
    f.write(code)
