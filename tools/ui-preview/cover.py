import json, sys
from PIL import Image, ImageDraw, ImageFont
f = json.load(open(sys.argv[1])); out = sys.argv[2]; title = sys.argv[3] if len(sys.argv) > 3 else ''
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 14)
try: cjk = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 14)
except Exception: cjk = font
cw, ch = 8.4, 17
lines, styles = f['lines'], f['styles']
cols = max(len(l) for l in lines)
W, H = int(cols * cw) + 40, int(len(lines) * ch) + 40
img = Image.new('RGB', (W, H), (10, 12, 16)); d = ImageDraw.Draw(img)
pal = {'0': (70, 84, 96), '1': (150, 170, 180), '2': (120, 220, 200), '3': (240, 248, 255), '4': (240, 80, 80), '5': (180, 130, 80), '6': (150, 160, 80)}
for y, line in enumerate(lines):
    st = styles[y] if y < len(styles) else ''
    x = 0
    for i, c in enumerate(line):
        s = st[i] if i < len(st) else '1'
        wide = ord(c) > 0x2e80
        if c != ' ': d.text((20 + x * cw, 20 + y * ch), c, font=cjk if wide else font, fill=pal.get(s, pal['1']))
        x += 2 if wide else 1
img = img.resize((640, int(640 * H / W)), Image.LANCZOS)
img.save(out, optimize=True)
print(out, img.size)
