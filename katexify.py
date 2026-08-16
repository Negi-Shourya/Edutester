import json
import re
import os

OUT_PATH = os.path.join("neet-out", "2021", "questions.json")

def katexify(text):
    if not text:
        return text
    
    # \epsilon0 -> \epsilon_{0}
    # \epsilon0E -> \epsilon_{0}E
    # 105 m/s -> 10^{5} m/s
    
    # General subscript for variable followed by digit(s)
    # Examples: ε0 -> ε_{0}, C1 -> C_{1}, v2 -> v_{2}
    # Be careful not to match words like "10" or "H2O" if they shouldn't be math, but in physics context it's mostly fine.
    
    text = re.sub(r'([A-Za-zα-ωΑ-Ω])(\d)', r'\1_{\2}', text)
    
    # General exponent for 10
    text = re.sub(r'10(\d{1,2})\b', r'10^{\1}', text)
    text = re.sub(r'10-(\d{1,2})\b', r'10^{-\1}', text)
    text = re.sub(r'10\+(\d{1,2})\b', r'10^{\+\1}', text)

    # Specific common replacements
    text = text.replace("ε_{0}", "\\varepsilon_{0}")
    
    # 2 ε0E -> maybe \frac{1}{2} \varepsilon_0 E^2 ?
    # But since they are completely broken strings like "2 ε_{0}E Ad E Ad"
    # let's just do our best with general symbols so KaTeX kicks in.
    
    # Wrap standalone greek letters or simple math in some formatting if needed, but VectorText already matches \epsilon{} etc.
    return text

def main():
    with open(OUT_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for q in data['questions']:
        q['text'] = katexify(q['text'])
        for o in q['options']:
            o['text'] = katexify(o['text'])
        if q.get('solution'):
            q['solution'] = katexify(q['solution'])
            
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=1, ensure_ascii=False)

if __name__ == "__main__":
    main()
