#!/usr/bin/env python3
"""Probe the scanned NEET 2022 PDF: libraries, page layout, answer-key pages."""
import importlib
import sys

print("== libraries ==")
for m in ["PIL", "numpy", "cv2", "pytesseract", "rapidocr_onnxruntime", "onnxruntime"]:
    try:
        mod = importlib.import_module(m)
        print(m, "OK", getattr(mod, "__version__", ""))
    except Exception as e:
        print(m, "MISSING:", type(e).__name__)

print("\n== pdf ==")
import fitz

doc = fitz.open("neet/Neet_2022.pdf")
print("pages:", doc.page_count)
for i in range(doc.page_count):
    page = doc[i]
    imgs = page.get_images(full=True)
    big = [im for im in imgs if im[2] * im[3] > 400 * 500]
    print(f"p{i+1:>2}: size={page.rect.width:.0f}x{page.rect.height:.0f} imgs={len(imgs)} big_imgs={len(big)}")
doc.close()

print("\n== rendered ink density (rows of dark pixels) for a few pages ==")
sys.stdout.flush()
