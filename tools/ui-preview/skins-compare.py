#!/usr/bin/env python3
"""Side-by-side compare per page for the 0.8.0 skins: row 1 = default modes (A dark | B dark | C light),
row 2 = alternate modes (A light | B light | C dark). Usage: skins-compare.py <shots/skins>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
root = sys.argv[1] if len(sys.argv) > 1 else '/workspace/dsh-mv-cli-ui-shots/skins'
out = os.path.join(root, 'compare'); os.makedirs(out, exist_ok=True)
W, H, PAD, LBL = 640, 1000, 16, 34
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
except Exception: font = ImageFont.load_default()
rows = [[('A', 'dark'), ('B', 'dark'), ('C', 'light')], [('A', 'light'), ('B', 'light'), ('C', 'dark')]]
pages = sorted({f.rsplit('-', 1)[0] for f in os.listdir(os.path.join(root, 'C')) if f.endswith('.png')})
for page in pages:
    grid = [[(s, m, os.path.join(root, s, f'{page}-{m}.png')) for s, m in r] for r in rows]
    grid = [[c for c in r if os.path.exists(c[2])] for r in grid]; grid = [r for r in grid if r]
    cols = max(len(r) for r in grid)
    img = Image.new('RGB', (PAD + cols * (W + PAD), PAD + len(grid) * (H + LBL + PAD)), (40, 40, 46))
    d = ImageDraw.Draw(img)
    for y, r in enumerate(grid):
        for x, (s, m, p) in enumerate(r):
            im = Image.open(p).convert('RGB'); im = im.resize((W, round(im.height * W / im.width)))
            im = im.crop((0, 0, W, min(H, im.height)))
            ox, oy = PAD + x * (W + PAD), PAD + y * (H + LBL + PAD)
            d.text((ox, oy + 6), f'{s} {"Harness" if s == "C" else "Music" if s == "A" else "Terminal"} · {m}', fill=(240, 240, 240), font=font)
            img.paste(im, (ox, oy + LBL))
    img.save(os.path.join(out, f'{page}.png')); print(os.path.join(out, f'{page}.png'))
