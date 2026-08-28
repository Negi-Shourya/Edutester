import fitz
import sys

doc = fitz.open('neet/Neet 2016.pdf')

def inspect_box(pno, y0, y1):
    p = doc[pno - 1]
    print(f"=== PAGE {pno} (y: {y0} to {y1}) ===")
    drawings = [d['rect'] for d in p.get_drawings() if y0 <= d['rect'].y0 <= y1 or y0 <= d['rect'].y1 <= y1]
    texts = [(b[:4], repr(b[4])) for b in p.get_text('blocks') if y0 <= b[1] <= y1 or y0 <= b[3] <= y1]
    print("Drawings bounding rect:", fitz.Rect([min(r.x0 for r in drawings), min(r.y0 for r in drawings), max(r.x1 for r in drawings), max(r.y1 for r in drawings)]) if drawings else "None")
    print("Text blocks:")
    for t in texts:
        print("  ", t[0], t[1][:50])

print("Q1:")
inspect_box(37, 75, 200)

print("\nQ2:")
inspect_box(37, 440, 530)

print("\nQ20:")
inspect_box(47, 570, 680)

print("\nQ24:")
inspect_box(49, 460, 530)

print("\nQ50:")
inspect_box(2, 400, 580)

print("\nQ52:")
inspect_box(3, 380, 450)

print("\nQ87 (biphenyls):")
inspect_box(17, 260, 420)
