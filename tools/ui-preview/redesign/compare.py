#!/usr/bin/env python3
"""Side-by-side comparison images of the three redesign directions (needs Pillow).
usage: python3 compare.py [/workspace/dsh-mv-cli-ui-shots/redesign]"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
ROOT = sys.argv[1] if len(sys.argv) > 1 else '/workspace/dsh-mv-cli-ui-shots/redesign'
BEST = {'A': 'dark', 'B': 'dark', 'C': 'light'}
NAMES = {'A': 'A · 现代音乐应用', 'B': 'B · 终端 / 黑客', 'C': 'C · Fluent / Harness 原生'}
SCREENS = ['01-library', '02-now-playing', '03-ai-make', '04-calibration', '05-workshop', '06-workshop-details']
def font(size, bold=False):
    for f in ['/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc' if bold else '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        if os.path.exists(f): return ImageFont.truetype(f, size)
    return ImageFont.load_default()
W, H, PAD, HEAD = 760, 1100, 24, 64  # each column shows the top 1520 px of a 1280-wide shot at 0.594 scale
os.makedirs(f'{ROOT}/compare', exist_ok=True)
for s in SCREENS:
    out = Image.new('RGB', (PAD + 3 * (W + PAD), HEAD + H + PAD), '#1b1b1f')
    d = ImageDraw.Draw(out)
    for i, k in enumerate('ABC'):
        src = Image.open(f'{ROOT}/{k}/{s}-{BEST[k]}.png').convert('RGB')
        sc = W / src.width
        crop = src.crop((0, 0, src.width, min(src.height, int(H / sc))))
        img = crop.resize((W, int(crop.height * sc)), Image.LANCZOS)
        x = PAD + i * (W + PAD)
        out.paste(img, (x, HEAD))
        d.rectangle([x - 1, HEAD - 1, x + W, HEAD + img.height], outline='#3a3a42')
        d.text((x, 18), NAMES[k], fill='#f5f5f7', font=font(24, True))
        d.text((x + W, 24), f'{s} · {BEST[k]}', fill='#9a9aa5', font=font(16), anchor='ra')
    out.save(f'{ROOT}/compare/{s}.png', optimize=True)
    print(f'{ROOT}/compare/{s}.png', out.size)
