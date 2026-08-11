import fitz

doc = fitz.open('neet/2024 Neet.pdf')
t = doc[1].get_text('text', flags=0)
with open(r'C:\Users\SHOURY~1\AppData\Local\Temp\opencode\page1_full.txt', 'w', encoding='utf-8') as f:
    f.write(t)
print(len(t))
