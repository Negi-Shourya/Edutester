import json
import re
import os

OUT_PATH = os.path.join("neet-out", "2021", "questions.json")

def fix_text(t):
    if not t: return t
    
    # 1. Fix degree symbols parsed as '8'
    t = re.sub(r'\b(30|45|60|90)8\b', r'\1^{\\circ}', t)
    
    # 2. Fix T_{2}, M_{2}, A_{2}, L_{2} inside dimensions or normally
    t = re.sub(r'([MLTA])_\{(\d)\}', r'\1^{\2}', t)
    t = re.sub(r'([MLTA])\u2212(\d)', r'\1^{-\2}', t)
    
    # 3. Fix 10^x with unicode minus
    t = re.sub(r'10\u2212(\d{1,2})\b', r'10^{-\1}', t)
    t = re.sub(r'10\+(\d{1,2})\b', r'10^{\1}', t)
    t = re.sub(r'10(\d{1,2})\b', r'10^{\1}', t) # catch positive again
    
    # 4. Fix m/s2 -> m/s^{2}
    t = re.sub(r'm/s2\b', r'm/s^{2}', t)
    t = re.sub(r'm/s\^?\{?2\}?', r'm/s^{2}', t)
    t = re.sub(r'ms\u2212(\d)', r'ms^{-\1}', t)
    
    # 5. Fix common subscript/superscript inversions in physics formulas
    t = t.replace("nmv_{2}", "\\frac{1}{2} n m v^{2}")
    t = t.replace("1 nmv 2", "\\frac{1}{2} n m v^{2}")
    t = t.replace("1 2 nm", "\\frac{1}{2} n m")
    
    # Q11: "S 3gS" -> fractions
    if "S 3gS" in t:
        t = t.replace(", S 3gS", ", \\frac{3gS}{2}")
        t = t.replace("S 3gS", "\\frac{S}{4}, \\frac{3gS}{2}")
        t = t.replace("\\frac{S}{4}, \\frac{3gS}{2}, \\frac{3gS}{2}", "\\frac{S}{4}, \\frac{3gS}{2}") # dedupe
        
    # Q12: "Mg" fractions
    if "Mg" in t and "container filled with glycerine" in t:
        t = t.replace("Mg", "\\frac{Mg}{2}")
        
    # Q13: j k, j k
    t = t.replace("j+k, j+k", "\\hat{j}+\\hat{k}, \\hat{j}+\\hat{k}")
    t = t.replace("\u2212 j+k, \u2212 j\u2212k", "-\\hat{j}+\\hat{k}, -\\hat{j}-\\hat{k}")
    t = t.replace("j+k, \u2212 j\u2212k", "\\hat{j}+\\hat{k}, -\\hat{j}-\\hat{k}")
    t = t.replace("\u2212 j+k, \u2212 j+k", "-\\hat{j}+\\hat{k}, -\\hat{j}+\\hat{k}")
    t = t.replace("\u2227 \u2227 \u2227 \u2227", "")
    
    # Q24: ratios
    t = t.replace("n n 1 S S +", "\\frac{S_n}{S_{n+1}}")
    t = t.replace("2n 1 2n \u2212", "\\frac{2n - 1}{2n}")
    t = t.replace("2n 1 2n 1 \u2212 +", "\\frac{2n - 1}{2n + 1}")
    t = t.replace("2n 1 2n 1 + \u2212", "\\frac{2n + 1}{2n - 1}")
    t = t.replace("2n 2n 1 \u2212", "\\frac{2n}{2n - 1}")
    
    # Fix fractions missed generally
    t = re.sub(r'Id=V_\{0\}', r'I_d = V_0', t)
    
    # Targeted fix for Q16
    if "electric \u2192 field \u2018 E \u2019" in t or "\\varepsilon_{0}EAd 1 2" in t:
        t = t.replace("\u2192 field \u2018 E \u2019", "field \\vec{E}")
        t = t.replace("(\\varepsilon_{0}=permittivity of free space) 1 2", "(\\varepsilon_{0}=permittivity of free space)")
        t = t.replace("2 \u03b5 0E", "\\frac{1}{2}\\varepsilon_{0}E^{2}")
        t = t.replace("\\varepsilon_{0}EAd 1 2", "\\frac{1}{2}\\varepsilon_{0}E^{2}Ad")
        t = t.replace("2 \\varepsilon_{0} E Ad E Ad", "\\frac{E^{2}Ad}{\\varepsilon_{0}}")
        t = t.replace("(4) \\varepsilon_{0}", "(4) \\frac{\\varepsilon_{0}E^{2}}{Ad}")

    # Targeted fix for Q37
    if "F=q ( v \u00d7B )" in t:
        t = t.replace("In the product \u2192 \u2192 \u2192 F=q ( v \u00d7B ) \u2192 \u2227 \u2227 \u2227 =q v \u00d7( B i+B j+B_{0} k) \u2192 \u2227 \u2227 \u2227 For q=1 and v =2 i +4 j+6 k and \u2192 \u2227 \u2227 \u2227 F=4 i\u221220 j+12 k \u2192 What will be the complete expression for B ? \u2227 \u2227 \u2227", 
                      "In the product \\vec{F}=q ( \\vec{v} \\times\\vec{B} ) =q \\vec{v} \\times( B\\hat{i}+B\\hat{j}+B_{0}\\hat{k}) . For q=1 and \\vec{v} =2\\hat{i} +4\\hat{j}+6\\hat{k} and \\vec{F}=4\\hat{i}-20\\hat{j}+12\\hat{k} . What will be the complete expression for \\vec{B} ?")
                      
    t = t.replace("\u22128 i\u22128 j\u22126 k \u2227 \u2227 \u2227", "-8\\hat{i}-8\\hat{j}-6\\hat{k}")
    t = t.replace("\u22126 i\u22126 j\u22128 k \u2227 \u2227 \u2227", "-6\\hat{i}-6\\hat{j}-8\\hat{k}")
    t = t.replace("8 i +8 j\u22126 k \u2227 \u2227 \u2227", "8\\hat{i}+8\\hat{j}-6\\hat{k}")
    t = t.replace("6 i+6 j\u22128 k", "6\\hat{i}+6\\hat{j}-8\\hat{k}")
    
    # In case the exact text match fails, fallback replace all ∧
    t = t.replace("\u2227 \u2227 \u2227", "")
    t = t.replace("\u2227", "")

    # Clean up spaces but preserve newlines
    t = re.sub(r'[ \t]+', ' ', t).strip()
    
    # Q19: Nuclear decay equations
    t = t.replace("AZ X \u2192 Z \u22121B \u2192 Z \u22123C \u2192 Z \u22122D", "{}^{A}_{Z}X \\rightarrow \\,_{Z-1}B \\rightarrow \\,_{Z-3}C \\rightarrow \\,_{Z-2}D")
    t = t.replace("A Z X \u2192 Z \u22121B \u2192 Z \u22123C \u2192 Z \u22122D", "{}^{A}_{Z}X \\rightarrow \\,_{Z-1}B \\rightarrow \\,_{Z-3}C \\rightarrow \\,_{Z-2}D")
    t = re.sub(r'\bA\s*Z\s*X\b', r'{}^{A}_{Z}X', t)
    t = re.sub(r'\bAZ\s*X\b', r'{}^{A}_{Z}X', t)
    t = t.replace("A radioactive nucleus ZX", "A radioactive nucleus {}^{A}_{Z}X")

    return t

def main():
    with open(OUT_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for q in data['questions']:
        if q['section'] == 'PHYSICS':
            q['text'] = fix_text(q['text'])
            for o in q['options']:
                o['text'] = fix_text(o['text'])
                
            # Specifically for Q11 where options were garbled into the question text
            if q['number'] == 11:
                # The text might have extra options appended at the end.
                q['text'] = q['text'].split("\\frac{S}{4}")[0] + " \\frac{S}{4}, \\frac{3gS}{2}"
                # And set the options properly
                q['options'] = [
                    {"label": "1", "text": "\\frac{S}{4}, \\frac{3gS}{2}"},
                    {"label": "2", "text": "\\frac{S}{2}, \\frac{3gS}{2}"},
                    {"label": "3", "text": "\\frac{S}{4}, \\frac{3gS}{4}"},
                    {"label": "4", "text": "\\frac{S}{4}, \\frac{\\sqrt{3gS}}{2}"}
                ]
            if q['number'] == 12:
                q['options'] = [
                    {"label": "1", "text": "\\frac{Mg}{2}"},
                    {"label": "2", "text": "Mg"},
                    {"label": "3", "text": "\\frac{3}{2} Mg"},
                    {"label": "4", "text": "2 Mg"}
                ]
            if q['number'] == 10:
                q['options'] = [
                    {"label": "1", "text": "\\frac{13}{10} t"},
                    {"label": "2", "text": "\\frac{13}{5} t"},
                    {"label": "3", "text": "\\frac{10}{13} t"},
                    {"label": "4", "text": "\\frac{5}{13} t"}
                ]

    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=1, ensure_ascii=False)

if __name__ == "__main__":
    main()
