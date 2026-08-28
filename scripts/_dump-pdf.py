import fitz, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
doc = fitz.open('neet/2025 Neet.pdf')
for i in range(1, 7):
    print(f"\n{'='*30} PAGE {i} {'='*30}")
    print(doc[i].get_text())
