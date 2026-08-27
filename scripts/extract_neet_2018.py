#!/usr/bin/env python3
"""
Extract NEET 2018 from neet/Neet 2018.pdf.
Output: neet-out/2018/questions.json and neet-out/2018/images/*.png
"""
import fitz
import json
import os
import re
import sys

PDF_PATH = os.path.join("neet", "Neet 2018.pdf")
OUT_DIR = os.path.join("neet-out", "2018")
IMG_DIR = os.path.join(OUT_DIR, "images")

os.makedirs(IMG_DIR, exist_ok=True)

doc = fitz.open(PDF_PATH)

# Official Answer Key from Pages 25 and 26
ANSWERS = {
    1: "3", 2: "2", 3: "3", 4: "3", 5: "3", 6: "2", 7: "3", 8: "1", 9: "4", 10: "4",
    11: "3", 12: "2", 13: "2", 14: "4", 15: "2", 16: "4", 17: "4", 18: "2", 19: "2", 20: "2",
    21: "1", 22: "2", 23: "2", 24: "3", 25: "3", 26: "2", 27: "2", 28: "4", 29: "4", 30: "2",
    31: "4", 32: "4", 33: "4", 34: "4", 35: "3", 36: "2", 37: "4", 38: "3", 39: "2", 40: "1",
    41: "1", 42: "3", 43: "3", 44: "2", 45: "3", 46: "2", 47: "3", 48: "1", 49: "4", 50: "4",
    51: "4", 52: "4", 53: "3", 54: "3", 55: "1", 56: "2", 57: "4", 58: "2", 59: "3", 60: "4",
    61: "3", 62: "3", 63: "2", 64: "3", 65: "2", 66: "1", 67: "4", 68: "1", 69: "1", 70: "2",
    71: "3", 72: "1", 73: "4", 74: "2", 75: "3", 76: "1", 77: "4", 78: "4", 79: "1", 80: "3",
    81: "2", 82: "2", 83: "4", 84: "3", 85: "4", 86: "1", 87: "3", 88: "3", 89: "4", 90: "4",
    91: "3", 92: "2", 93: "1", 94: "2", 95: "4", 96: "4", 97: "2", 98: "3", 99: "2", 100: "3",
    101: "1", 102: "4", 103: "1", 104: "2", 105: "4", 106: "3", 107: "1", 108: "3", 109: "4", 110: "2",
    111: "2", 112: "2", 113: "2", 114: "4", 115: "4", 116: "2", 117: "3", 118: "3", 119: "4", 120: "1",
    121: "3", 122: "4", 123: "2", 124: "3", 125: "2", 126: "3", 127: "1", 128: "4", 129: "3", 130: "4",
    131: "3", 132: "4", 133: "3", 134: "4", 135: "2", 136: "3", 137: "1", 138: "2", 139: "3", 140: "1",
    141: "3", 142: "1", 143: "2", 144: "4", 145: "3", 146: "4", 147: "1", 148: "3", 149: "1", 150: "2",
    151: "4", 152: "2", 153: "1", 154: "3", 155: "2", 156: "1", 157: "3", 158: "3", 159: "4", 160: "3",
    161: "3", 162: "2", 163: "2", 164: "4", 165: "2", 166: "3", 167: "4", 168: "4", 169: "4", 170: "3",
    171: "2", 172: "4", 173: "4", 174: "4", 175: "2", 176: "2", 177: "1", 178: "4", 179: "2", 180: "3",
}

SYMBOL_MAP = {
    0xf0b0: "°",
    0xf0b4: r"\times ",
    0xf06c: r"\lambda ",
    0xf062: r"\beta ",
    0xf061: r"\alpha ",
    0xf057: r"\Omega ",
    0xf06d: r"\mu ",
    0xf071: r"\theta ",
    0xf070: r"\pi ",
    0xf077: r"\omega ",
    0xf044: r"\Delta ",
    0xf0ae: r"\rightarrow ",
    0xf02b: "+",
    0xf0ba: r"\div ",
    0xf0be: r"\approx ",
    0xf0b1: r"\pm ",
    0xf0e6: "(",
    0xf0e7: "",
    0xf0e8: ")",
    0xf0f6: "[",
    0xf0f7: "",
    0xf0f8: "]",
}

def clean_text(t):
    if not t:
        return ""
    out = []
    for ch in t:
        code = ord(ch)
        if code in SYMBOL_MAP:
            out.append(SYMBOL_MAP[code])
        elif code >= 0xE000:
            out.append(" ")
        else:
            out.append(ch)
    text = "".join(out)
    text = text.replace("\u00a0", " ").replace("\u2013", "-").replace("\u2212", "-")
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def clip_figure(pno, rect, fname):
    page = doc[pno - 1]
    pm = page.get_pixmap(matrix=fitz.Matrix(3.0, 3.0), clip=fitz.Rect(rect))
    out_path = os.path.join(IMG_DIR, fname)
    pm.save(out_path)
    print(f"Clipped {fname}: {pm.width}x{pm.height}")
    return fname

# Clip figures
print("Clipping figures...")
# Q1: V-T graph
clip_figure(2, (45, 80, 200, 168), "Q1.png")

# Q7 options: I vs t/R graphs
clip_figure(2, (340, 395, 430, 445), "Q7_opt_1.png")
clip_figure(2, (340, 465, 430, 515), "Q7_opt_2.png")
clip_figure(2, (340, 535, 430, 585), "Q7_opt_3.png")
clip_figure(2, (340, 605, 430, 655), "Q7_opt_4.png")

# Q15: Transistor circuit
clip_figure(4, (45, 80, 250, 185), "Q15.png")

# Q17: Logic circuit / truth table
clip_figure(4, (330, 75, 540, 195), "Q17.png")

# Q31: Vertical circle
clip_figure(6, (65, 75, 175, 135), "Q31.png")

# Q34: Block on wedge
clip_figure(6, (340, 280, 450, 345), "Q34.png")

# Q40: Planetary orbit around Sun S
clip_figure(7, (70, 240, 210, 305), "Q40.png")

def extract_all_questions():
    questions = []
    
    # Track page text blocks
    for pno in range(2, 22):
        page = doc[pno - 1]
        d = page.get_text("dict")
        
        left_blocks = []
        right_blocks = []
        for b in d["blocks"]:
            if b["type"] == 0:
                bbox = b["bbox"]
                if bbox[1] < 15 or bbox[3] > 665:
                    continue
                if bbox[0] < 278:
                    left_blocks.append(b)
                else:
                    right_blocks.append(b)
        
        # Sort blocks top-to-bottom
        left_blocks.sort(key=lambda b: b["bbox"][1])
        right_blocks.sort(key=lambda b: b["bbox"][1])
        
        for col_blocks in [left_blocks, right_blocks]:
            # Accumulate lines
            col_text = []
            for b in col_blocks:
                for l in b["lines"]:
                    line_str = "".join(clean_text(s["text"]) for s in l["spans"]).strip()
                    if line_str:
                        col_text.append(line_str)
            
            full_col_str = "\n".join(col_text)
            
            # Split by question numbers "1. ", "2. ", etc.
            splits = re.split(r'\n(?=\d+\.\s)', "\n" + full_col_str)
            for sp in splits:
                sp = sp.strip()
                if not sp: continue
                m = re.match(r'^(\d+)\.\s*([\s\S]*)', sp)
                if m:
                    qnum = int(m.group(1))
                    rest = m.group(2).strip()
                    
                    # Section assignment
                    if 1 <= qnum <= 45:
                        sec = "Physics"
                    elif 46 <= qnum <= 90:
                        sec = "Chemistry"
                    else:
                        sec = "Biology"
                    
                    # Split options: (1) ... (2) ... (3) ... (4) ...
                    opt_splits = re.split(r'\((1|2|3|4)\)\s*', rest)
                    if len(opt_splits) >= 9:
                        stem = opt_splits[0].strip()
                        opts = [
                            {"label": "1", "text": opt_splits[2].strip()},
                            {"label": "2", "text": opt_splits[4].strip()},
                            {"label": "3", "text": opt_splits[6].strip()},
                            {"label": "4", "text": opt_splits[8].strip()},
                        ]
                    else:
                        # Fallback parsing
                        stem = rest
                        opts = [
                            {"label": "1", "text": ""},
                            {"label": "2", "text": ""},
                            {"label": "3", "text": ""},
                            {"label": "4", "text": ""},
                        ]
                    
                    # Attach figures
                    q_images = []
                    if qnum == 1:
                        q_images = ["Q1.png"]
                    elif qnum == 15:
                        q_images = ["Q15.png"]
                    elif qnum == 17:
                        q_images = ["Q17.png"]
                    elif qnum == 31:
                        q_images = ["Q31.png"]
                    elif qnum == 34:
                        q_images = ["Q34.png"]
                    elif qnum == 40:
                        q_images = ["Q40.png"]
                    
                    if qnum == 7:
                        opts[0]["figure"] = "Q7_opt_1.png"
                        opts[1]["figure"] = "Q7_opt_2.png"
                        opts[2]["figure"] = "Q7_opt_3.png"
                        opts[3]["figure"] = "Q7_opt_4.png"
                    
                    ans = ANSWERS.get(qnum, "")
                    
                    questions.append({
                        "number": qnum,
                        "section": sec,
                        "text": stem,
                        "options": opts,
                        "images": q_images,
                        "answers": [ans] if ans else [],
                        "solution": None,
                    })

    # Sort questions by number and deduplicate
    questions.sort(key=lambda q: q["number"])
    deduped = []
    seen = set()
    for q in questions:
        if q["number"] not in seen:
            seen.add(q["number"])
            deduped.append(q)
    
    print(f"Extracted {len(deduped)} distinct questions.")
    return deduped

def main():
    questions = extract_all_questions()
    
    paper_data = {
        "key": "neet-2018",
        "title": "NEET 2018",
        "fullTitle": "National Eligibility cum Entrance Test (UG) 2018",
        "examDate": "2018-05-06",
        "session": None,
        "durationMinutes": 180,
        "questionCount": len(questions),
        "examType": "neet",
        "questions": questions
    }
    
    out_file = os.path.join(OUT_DIR, "questions.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(paper_data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(questions)} questions to {out_file}")

if __name__ == "__main__":
    main()
