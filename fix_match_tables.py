import json
import re

def fix_match_table(text):
    # If the text has a match table encoded in this garbled way, let's try to extract the components.
    # A typical garbled string: "... Column-IColumn-II | (A)Rootmeansquare(P)1nmv_{2} | speedofgasmolecules | 3RT | (B)Pressure... | ... | (1)(A)-(R)..."
    
    # We want to find where (A), (B), (C), (D) and (P), (Q), (R), (S) start, or (a), (b), (c), (d) and (i), (ii), (iii), (iv).
    
    # Actually, the user just wants the match tables to be rendered as a table.
    # If I just insert newlines before (A), (B), (C), (D) and (P), (Q), (R), (S) and format it as a markdown table.
    
    if "List - I" not in text and "Column - I" not in text and "Column-I" not in text and "List-I" not in text:
        return text

    # It's extremely hard to untangle " (A)Rootmeansquare(P)1nmv_{2} " into a table programmatically without the original PDF spacing.
    # But wait! I can just find all pairs of (A) and (P), (B) and (Q), etc.
    
    # Let's try to replace " | " with "\n" as a start?
    # If I replace " | " with "\n", it becomes readable.
    text = text.replace(" | ", "\n")
    text = text.replace("|", "\n")
    
    # Let's add newlines before (A), (B), (C), (D), (a), (b), (c), (d) if they don't have them
    text = re.sub(r'(?<!\n)(\([A-Da-d]\))', r'\n\1', text)
    # Let's add some spaces around (P), (Q), (R), (S), (i), (ii), (iii), (iv) to make them columns
    text = re.sub(r'(\([P-Sp-s]\)|\(i{1,3}v?\)|\(iv\))', r' | \1 ', text)
    
    # Let's put options on new lines
    text = re.sub(r'(?<!\n)(\([1-4]\)\s*\([A-Da-d]\))', r'\n\1', text)

    # Let's try to make it an actual markdown table if we can find the start
    # Just replacing with newlines and a pipe is usually enough to make it a readable table-like structure.
    
    return text

def main():
    with open("neet-out/2021/questions.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data["questions"]:
        if "Match" in q["text"] or "List" in q["text"] or "Column" in q["text"]:
            q["text"] = fix_match_table(q["text"])
            
    with open("neet-out/2021/questions.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)

if __name__ == "__main__":
    main()
