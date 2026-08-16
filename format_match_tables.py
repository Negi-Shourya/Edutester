import json
import re
import os

OUT_PATH = os.path.join("neet-out", "2021", "questions.json")

def format_as_table(text):
    if "List" not in text and "Column" not in text and "Match" not in text:
        return text
    
    # Text contains " | " because of the vertical line drawn in PDF.
    # The format is typically: (A) Text (P) Text | next line | ...
    # We want to replace " | " with "\n" ONLY if it is followed by (B), (C), (D) or next line text.
    # ACTUALLY: Let's split by " | " and reconstruct it.
    
    # Or just write a regex that formats it nicely:
    
    # Let's insert \n before (A), (B), (C), (D) and (a), (b), (c), (d)
    text = re.sub(r'(?<!\n)(\([A-Da-d]\))', r'\n\1', text)
    
    # Let's insert | before (P), (Q), (R), (S) and (i), (ii) etc
    text = re.sub(r'(?<!\n)(\([P-Sp-s]\)|\(i{1,3}v?\)|\(iv\))', r' | \1 ', text)
    
    # Let's insert \n before (1), (2), (3), (4)
    text = re.sub(r'(?<!\n)(\([1-4]\)\s*\([A-Da-d]\))', r'\n\1', text)
    
    # Replace headers
    text = re.sub(r'Column\s*-\s*I\s*Column\s*-\s*II', '\n| Column-I | Column-II |\n|---|---|', text, flags=re.IGNORECASE)
    text = re.sub(r'List\s*-\s*I\s*List\s*-\s*II', '\n| List-I | List-II |\n|---|---|', text, flags=re.IGNORECASE)
    
    # The pipes " | " from the PDF text might break the markdown table, let's remove them if they aren't part of our inserted column separators
    # We only want one " | " per line if it's a table row.
    # To simplify, let's just strip out the original " | " or "|"
    # Wait, if we strip out original " | ", then our injected " | \1" will remain.
    # But wait! We need to strip out original " | " BEFORE we inject ours!
    
    return text.strip()

def main():
    with open(OUT_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for q in data['questions']:
        if "Match" in q["text"] or "List" in q["text"] or "Column" in q["text"]:
            
            # Clean up the original pipes first!
            t = q["text"].replace(" | ", " ").replace("|", " ")
            
            # Replace headers if they exist consecutively
            t = re.sub(r'Column\s*-\s*I\s+Column\s*-\s*II', '\n| Column-I | Column-II |\n|---|---|\n', t, flags=re.IGNORECASE)
            t = re.sub(r'List\s*-\s*I\s+List\s*-\s*II', '\n| List-I | List-II |\n|---|---|\n', t, flags=re.IGNORECASE)
            
            # Add newlines before (A), (B), (C), (D), (a), (b), (c), (d)
            t = re.sub(r'(?<!\n)\s*(\([A-Da-d]\))', r'\n\1', t)
            
            # Add pipe before (P), (Q), (R), (S) and (i), (ii) etc
            t = re.sub(r'(?<!\n)\s*(\([P-Sp-s]\)|\(i{1,3}v?\)|\(iv\))', r' | \1 ', t)
            
            # Add newlines before (1), (2), (3), (4) if they are in the text
            t = re.sub(r'(?<!\n)\s*(\([1-4]\)\s*\([A-Da-d]\))', r'\n\1', t)
            
            # Now, any line starting with (A), (B) etc. should have a leading | to make it a valid markdown row
            t = re.sub(r'^\s*(\([A-Da-d]\).*?\|\s*(?:\([P-Sp-s]\)|\(i{1,3}v?\)|\(iv\)).*?)$', r'| \1 |', t, flags=re.MULTILINE)
            
            # If we successfully created table rows but NO header was injected, inject a default header
            if re.search(r'^\|\s*\([A-Da-d]\)', t, flags=re.MULTILINE) and "|---|---|" not in t:
                # Find the first table row
                first_row_match = re.search(r'^\|\s*\([A-Da-d]\)', t, flags=re.MULTILINE)
                if first_row_match:
                    idx = first_row_match.start()
                    header = "| Column-I | Column-II |\n|---|---|\n"
                    t = t[:idx] + header + t[idx:]
            
            q["text"] = t.strip()
            
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=1, ensure_ascii=False)

if __name__ == "__main__":
    main()
