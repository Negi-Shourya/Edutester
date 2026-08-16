import sys, os, re, json
sys.path.insert(0, os.path.dirname(__file__))
import fitz
from rapidocr_onnxruntime import RapidOCR

OCR = RapidOCR()
PDF = fitz.open('neet/neet 2022.pdf')
OCR_SCALE = 2

def load_page_dets(pno):
    p = f'neet-out/2022/ocr/page_{pno:02d}.json'
    if not os.path.exists(p):
        return []
    d = json.load(open(p, encoding='utf-8'))
    if isinstance(d, dict):
        return d.get('texts') or d.get('detections') or []
    return d

def render(pno, scale=OCR_SCALE):
    page = PDF[pno]
    pm = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
    import numpy as np
    arr = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width, pm.n)
    return arr

def ocred(arr, scale=1.0):
    import cv2
    img = arr
    if scale != 1.0:
        img = cv2.resize(arr, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    res = OCR(img)
    if not res:
        return []
    return [r[1] for r in res]

def page_dets(pno):
    return load_page_dets(pno)

# marker regex: (1) (2) (3) (4) possibly with trailing text
def probe(qno):
    q = None
    for d in DETS:
        if d['page'] is None: continue
        for t in d.get('texts', []):
            pass
    return

# For a given q, find its option markers in detections, then OCR band right of marker
def find_markers(qno):
    # load question page from json
    data = json.load(open('neet-out/2022/questions_raw.json', encoding='utf-8'))
    q = [x for x in data['questions'] if x['number'] == qno][0]
    pno = q['page'] - 1
    dets = page_dets(pno)
    markers = []
    for t in dets:
        m = re.match(r'^\(([1-4])\)\s*(.*)$', t['text'].strip())
        if m:
            markers.append((int(m.group(1)), t, m.group(2)))
    return pno, sorted(markers, key=lambda m: m[0])

for qno in [2, 3, 6, 8, 13, 51, 53, 65, 69, 94, 100, 124, 187, 196]:
    pno, markers = find_markers(qno)
    if not markers:
        print(f'Q{qno}: no markers found (p{pno+1})')
        continue
    arr = render(pno, OCR_SCALE)
    H, W = arr.shape[:2]
    print(f'Q{qno} (p{pno+1}): {len(markers)} markers')
    for num, t, rest in markers:
        x0, y0 = int(t['x0'] * OCR_SCALE), int(t['y0'] * OCR_SCALE)
        x1, y1 = int(t['x1'] * OCR_SCALE), int(t['y1'] * OCR_SCALE)
        mh = y1 - y0
        # band: right of marker, same line height
        bx0 = min(x1 + 4, W)
        by0 = max(0, y0 - 3)
        bx1 = min(bx0 + int(180 * OCR_SCALE), W)
        by1 = min(y1 + 3, H)
        if bx1 - bx0 < 20 or by1 - by0 < 10:
            print(f'  ({num}) band too small: {bx0},{by0},{bx1},{by1}')
            continue
        txts = ocred(arr[by0:by1, bx0:bx1], 3.0)
        label = ' | '.join(txts) if txts else '(empty)'
        print(f'  ({num}) y={y0}-{y1} x={x0}-{x1} -> {label[:60]}')
