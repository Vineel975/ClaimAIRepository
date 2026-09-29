"""Clean up scanned pages for display.

Usage: rasterise the source PDFs first (poppler-utils), then run from the repo root:
    mkdir -p scripts/work/raw scripts/work/enh
    pdftoppm -r 170 -png <claim-bundle>.pdf scripts/work/raw/b
    pdftoppm -r 170 -png <tariff>.pdf       scripts/work/raw/t
    python3 scripts/enhance.py && python3 scripts/redact.py

Steps: flat-field correction (divides out the paper tint and uneven lighting),
a tone curve that deepens faint ink, removal of faint vertical scanner streaks on
the form pages, and a light unsharp mask. Width is normalised to 1400px
(1600px for landscape pages).
"""
import cv2, numpy as np, glob, os
GAMMA = {'b-6': 2.0, 'b-8': 1.9, 'b-9': 2.1, 'b-7': 1.6}
def destreak(n):
    # remove faint scanner streaks: long vertical structures that are light
    g = cv2.cvtColor(n, cv2.COLOR_BGR2GRAY)
    dark = (255 - g).astype(np.uint8)
    k = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 241))
    vert = cv2.morphologyEx(dark, cv2.MORPH_OPEN, k)
    vert = vert.astype(np.float32)
    W_ = vert.shape[1]; vert[:, :int(W_*0.13)] = 0; vert[:, int(W_*0.87):] = 0
    vert = cv2.GaussianBlur(vert, (3, 1), 0)
    out = n.astype(np.float32) + vert[..., None] * 1.05
    return np.clip(out, 0, 255).astype(np.uint8)
def enhance(path, out, name, rotate=None):
    im = cv2.imread(path)
    if rotate is not None: im = cv2.rotate(im, rotate)
    h, w = im.shape[:2]
    W = 1400 if w <= h else 1600
    im = cv2.resize(im, (W, round(h * W / w)), interpolation=cv2.INTER_AREA)
    f = im.astype(np.float32)
    k = cv2.getStructuringElement(cv2.MORPH_RECT, (31, 31))
    bg = cv2.morphologyEx(im, cv2.MORPH_CLOSE, k)
    bg = cv2.GaussianBlur(bg, (0, 0), 12).astype(np.float32)
    n = np.clip(f / np.maximum(bg, 1) * 255, 0, 255)
    n = 255 * np.power(n / 255, GAMMA.get(name, 1.35))
    n = np.where(n > 238, 255, n).astype(np.uint8)
    if name in ('b-1','b-2','b-3','b-4','b-5','b-7'): n = destreak(n)
    blur = cv2.GaussianBlur(n, (0, 0), 1.0)
    n = cv2.addWeighted(n, 1.35, blur, -0.35, 0)
    cv2.imwrite(out, n)
for p in sorted(glob.glob('scripts/work/raw/*.png')):
    name = os.path.basename(p)[:-4]
    enhance(p, f'scripts/work/enh/{name}.png', name, cv2.ROTATE_90_CLOCKWISE if name == 'b-9' else None)
