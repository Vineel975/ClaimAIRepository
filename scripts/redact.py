"""Bake PHI redactions into the enhanced page images and export WebP pages + thumbnails."""
import json, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FONT = os.path.join(os.path.dirname(__file__), 'Inter-SemiBold.ttf')
# normalized [x0, y0, x1, y1]; optional label
R = {
 'b-1': [[0.37,0.322,0.69,0.353],[0.275,0.40,0.44,0.43],[0.47,0.425,0.78,0.453],[0.46,0.462,0.74,0.492]],
 'b-3': [[0.53,0.745,0.84,0.80]],
 'b-4': [[0.40,0.352,0.70,0.39]],
 'b-5': [[0.43,0.232,0.685,0.256],[0.19,0.692,0.50,0.727]],
 'b-6': [[0.12,0.055,0.34,0.082],[0.41,0.128,0.67,0.172],[0.13,0.255,0.54,0.337],[0.54,0.255,0.93,0.342],[0.655,0.525,0.795,0.66],[0.14,0.772,0.37,0.818]],
 'b-7': [[0.33,0.325,0.76,0.54,'ID proof redacted']],
 'b-8': [[0.05,0.338,0.30,0.372],[0.72,0.40,0.87,0.427],[0.63,0.592,0.76,0.617]],
 'b-9': [[0.06,0.06,0.21,0.105],[0.59,0.095,0.73,0.145],[0.08,0.775,0.30,0.845]],
 't-6': [[0.08,0.41,0.93,0.65,'Contact details redacted']],
}
# Third-party branding painted out to plain paper (no label): the TPA logo on the claim form pages.
WHITEOUT = {
 'b-1': [[0.7564, 0.0395, 0.89, 0.0951]],
 'b-2': [[0.7679, 0.0385, 0.9014, 0.0939]],
 'b-3': [[0.7493, 0.0399, 0.8807, 0.095]],
 'b-4': [[0.7714, 0.0383, 0.9036, 0.0932]],
}
BILL_LABELS = ['Claim form','Claim form','Claim form','Declarations','PPN declaration','Policy schedule','KYC','Prescription','IOL biometry']
OUT = 'public/docs'
os.makedirs(OUT, exist_ok=True)
manifest = {'bill': [], 'tariff': []}
for doc, pref, n in [('bill','b',9),('tariff','t',6)]:
    for i in range(1, n+1):
        key = f'{pref}-{i}'
        im = Image.open(f'scripts/work/enh/{key}.png').convert('RGB')
        W, H = im.size
        d = ImageDraw.Draw(im)
        for r in WHITEOUT.get(key, []):
            d.rectangle((int(r[0]*W), int(r[1]*H), int(r[2]*W), int(r[3]*H)), fill=(255, 255, 255))
        for r in R.get(key, []):
            x0, y0, x1, y1 = [int(r[0]*W), int(r[1]*H), int(r[2]*W), int(r[3]*H)]
            # blur first so nothing survives anti-aliasing, then solid fill
            region = im.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(20))
            im.paste(region, (x0, y0))
            d.rounded_rectangle((x0, y0, x1, y1), radius=6, fill=(30, 41, 59))
            label = r[4] if len(r) > 4 else 'REDACTED'
            fs = max(11, min(20, int((y1-y0)*0.42)))
            if len(r) > 4: fs = 26
            f = ImageFont.truetype(FONT, fs)
            tw = d.textlength(label, font=f)
            if tw < (x1-x0) - 8:
                d.text(((x0+x1)/2 - tw/2, (y0+y1)/2 - fs*0.62), label, font=f, fill=(203, 213, 225))
        im.save(f'{OUT}/{key}.webp', quality=82, method=6)
        th = im.copy(); th.thumbnail((180, 260)); th.save(f'{OUT}/{key}-thumb.webp', quality=70)
        entry = {'src': f'docs/{key}.webp', 'thumb': f'docs/{key}-thumb.webp', 'width': W, 'height': H}
        if doc == 'bill': entry['label'] = BILL_LABELS[i-1]
        manifest[doc].append(entry)
json.dump(manifest, open('scripts/work/manifest.json','w'), indent=1)
tot = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
print('total KB', tot//1024)
