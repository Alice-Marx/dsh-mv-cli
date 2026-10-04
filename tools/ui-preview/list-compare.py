#!/usr/bin/env python3
"""0.8.2 list-view compare sheets (not shipped): row 1 = list in A dark | B dark | C light,
row 2 = list in A light | B light | C dark, row 3 = C grid vs C list vs C wallpaper (follow).
Usage: list-compare.py [/workspace/dsh-mv-cli-ui-shots/list-view]"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
root = sys.argv[1] if len(sys.argv) > 1 else '/workspace/dsh-mv-cli-ui-shots/list-view'
W, H, PAD, LBL = 640, 500, 16, 34
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
except Exception: font = ImageFont.load_default()
def sheet(rows, out):
    img = Image.new('RGB', (PAD + 3 * (W + PAD), PAD + len(rows) * (H + LBL + PAD)), (40, 40, 46)); d = ImageDraw.Draw(img)
    for y, row in enumerate(rows):
        for x, (label, name) in enumerate(row):
            im = Image.open(os.path.join(root, name + '.png')).convert('RGB'); im = im.resize((W, round(im.height * W / im.width))).crop((0, 0, W, H))
            ox, oy = PAD + x * (W + PAD), PAD + y * (H + LBL + PAD)
            d.text((ox, oy + 6), label, fill=(240, 240, 240), font=font); img.paste(im, (ox, oy + LBL))
    img.save(os.path.join(root, out)); print(os.path.join(root, out))
sheet([[('A Music · list · dark', 'A-list-dark'), ('B Terminal · list · dark', 'B-list-dark'), ('C Harness · list · light', 'C-list-light')],
       [('A Music · list · light', 'A-list-light'), ('B Terminal · list · light', 'B-list-light'), ('C Harness · list · dark', 'C-list-dark')]], 'compare-list-skins.png')
sheet([[('C · grid (0.8.1 layout)', 'C-grid-light'), ('C · list (new default)', 'C-list-light'), ('C · list · wallpaper, follow', 'C-list-wallpaper-follow')],
       [('A · grid', 'A-grid-dark'), ('A · list', 'A-list-dark'), ('B · grid', 'B-grid-dark')]], 'compare-grid-vs-list.png')
if os.path.exists(os.path.join(root, 'collapsed-C-list-light.png')):
    sheet([[('C · expanded list', 'C-list-light'), ('C · collapsed (list)', 'collapsed-C-list-light'), ('C · collapsed (grid) · dark', 'collapsed-C-grid-dark')],
           [('A · collapsed · playing', 'collapsed-A-list-dark'), ('B · collapsed · playing', 'collapsed-B-list-dark'), ('C · collapsed · wallpaper', 'collapsed-C-wallpaper-follow')]], 'compare-collapsed.png')
