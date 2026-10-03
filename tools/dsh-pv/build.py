"""Builds .dsh-plugin/assets/dsh-pv/*.json from a local checkout of MisakaZentai/world-execute-me-dsh-pv.

Not shipped. Inputs (all produced locally from the upstream project, see tools/dsh-pv/README.md):
  rec3.json   draw calls recorded from the upstream renderer (rec3.py), keyframes per shot
  chat.json   the dsh web window's states parsed from the upstream page frames (chat_build.py)
  shots.json  the upstream shot table
  upstream data/timing/word_timeline_notext.json (text-free word timing, MIT)
  optional:   a local LRC (--lyrics) used ONLY to verify no lyric text ends up in the output

Copyright (c) 2026 MisakaZentai (upstream code and data, MIT). Port: dsh-mv-cli contributors (MIT).
"""
import argparse, collections, hashlib, json, math, re, sys
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument('--rec', required=True); ap.add_argument('--chat', required=True); ap.add_argument('--shots', required=True)
ap.add_argument('--upstream', required=True); ap.add_argument('--out', required=True); ap.add_argument('--lyrics')
a = ap.parse_args()
OUT = Path(a.out); OUT.mkdir(parents=True, exist_ok=True)
rec = json.load(open(a.rec)); shots = json.load(open(a.shots))

SHELL = {'shot_protection': './protect', 'shot_parameters': 'neofetch', 'shot_limit': 'ulimit -a', 'shot_god': 'ps -ef --forest', 'shot_answer_all': 'dsh chat --model me'}
FONTS = {'DejaVuSansMono.ttf': 0, 'DejaVuSansMono-Bold.ttf': 1, 'SpaceMono-Bold.ttf': 2, 'Anton-Regular.ttf': 3}
PAL = {}
def ci(c):
    if not isinstance(c, list) or len(c) < 3: return -1
    # ImageDraw on L / 1 masks records plain grey levels (r == g == b); those never reach the picture
    if c[0] == c[1] == c[2]: return -1
    c = (c + [255])[:4]
    k = '%02x%02x%02x%02x' % tuple(max(0, min(255, int(v))) for v in c)
    if k not in PAL: PAL[k] = len(PAL)
    return PAL[k]
def fidx(name):
    if name in FONTS: return FONTS[name]
    if 'CJK' in name or 'Noto' in name or 'msyh' in name: return 4
    if 'DejaVuSans' in name or 'segui' in name: return 5
    return 0

def conv(op, out, dots, ticker):
    xy = op['xy']; xs = xy[0::2]; ys = xy[1::2]; k = op['k']
    if not xs: return
    if k == 'text':
        s = op['s']
        if not s.strip(): return
        x, y = xs[0], ys[0]
        if y < 41 or y >= 612: return                        # header / lyric band / footer: drawn by the port
        if 1180 <= x <= 1256 and 56 <= y <= 604 and abs(x - 1188) < 2:
            ticker.append((y, s)); return                    # the ops ticker scrolls at runtime
        if ci(op['fill']) < 0: return
        e = ['t', round(x), round(y), op.get('size') or 12, ci(op['fill']), fidx(op.get('font', '')), s]
        if op.get('anchor'): e.append(op['anchor'])
        out.append(e); return
    if max(ys) < 41 or min(ys) >= 612: return
    if min(xs) >= 1176 and min(ys) >= 50: return              # the ticker column
    if k == 'line' and min(xs) <= 1 and max(xs) >= 1278: return   # scanlines
    if k == 'arc': return
    q = [round(v) for v in xy]
    if k == 'point':
        c = ci(op['fill'])
        if c < 0: return
        for j in range(0, len(q) - 1, 2): dots[(c, 1, 1)].extend(q[j:j + 2])
        return
    fill = ci(op.get('fill')); ol = ci(op.get('outline')); w = op.get('width') or 1
    if fill < 0 and ol < 0: return
    if not isinstance(w, (int, float)): w = 1
    if k == 'rectangle':
        if len(q) != 4: return
        if q[2] < q[0]: q[0], q[2] = q[2], q[0]
        if q[3] < q[1]: q[1], q[3] = q[3], q[1]
        rw, rh = q[2] - q[0] + 1, q[3] - q[1] + 1
        if ol < 0 and fill >= 0 and rw <= 8 and rh <= 8:
            dots[(fill, rw, rh)].extend(q[:2]); return
        out.append(['r', fill, ol, w] + q); return
    if k == 'line':
        if len(q) > 160:
            pts = [q[j:j + 2] for j in range(0, len(q) - 1, 2)]; step = len(pts) / 80
            pts = [pts[int(j * step)] for j in range(80)] + [pts[-1]]; q = [v for p in pts for v in p]
        out.append(['l', fill, w] + q); return
    tag = {'ellipse': 'e', 'polygon': 'g', 'rounded_rectangle': 'R'}.get(k)
    if tag: out.append([tag, fill, ol, w] + q)

# shot 29 draws the sung line as attention tokens: keep the layout, the runtime fills in the user's own words
def placeholders(shot, ops):
    if shot['fn'] != 'shot_satisfaction': return
    for e in ops:
        if e[0] != 't': continue
        x, y = e[1], e[2]
        if x == 420 and 110 <= y <= 400 and (y - 120) % 36 == 0: e[6] = '\u0001%d' % ((y - 120) // 36)
        elif y == 88 and 474 <= x <= 760 and (x - 474) % 36 == 0: e[6] = '\u0002%d' % ((x - 474) // 36)

by_i = {s['i']: s for s in rec['shots']}
res = []
for sh in shots:
    r = by_i[sh['i']]
    tick = []
    kfs = []
    for kf in r['kf']:
        out = []; dots = collections.defaultdict(list)
        for op in kf['ops']: conv(op, out, dots, tick)
        for (c, w, h), pts in dots.items(): out.append(['d', c, w, h] + pts)
        placeholders(sh, out)
        win = 0
        if not kf.get('gone'):
            ins = [h for h in kf['her'] if h.get('inside')]
            if ins: win = [round(v) for v in ins[0]['rect']]
        kfs.append({'t': round(kf['t'], 4), 'w': win, 'lv': [round(v, 3) for v in kf['levels']], 'o': out})
    seen = []
    for y, s in sorted(tick):
        if s not in seen: seen.append(s)
    res.append({'i': sh['i'], 's': sh['start'], 'e': sh['end'], 'fn': sh['fn'][5:], 'ch': sh['ch'], 'al': sh['alert'],
                'lay': sh['lay'], 'sh': SHELL.get(sh['fn'], ''), 'ops': seen or ['IDLE'], 'kf': kfs})
pal = [None] * len(PAL)
for k, v in PAL.items(): pal[v] = k

timeline = {
    'about': 'world.execute(me); dsh PV timeline, ported from MisakaZentai/world-execute-me-dsh-pv (MIT). No lyric text.',
    'size': [1280, 720], 'fps': 24, 'bpm': 130, 'firstBeat': 0.1587, 'duration': 211.913, 'hardCut': 4970 / 24,
    'cover': rec['cover'], 'lead': rec['lead'],
    'uiGain': [[0, 1], [110.4, 1], [116.5, 0.42], [176.9, 0.42], [179.5, 0.85], [193, 0.75], [206, 0.45]],
    'fonts': ['mono', 'monoBold', 'head', 'banner', 'cjk', 'sym'],
    'pal': pal, 'shots': res,
}
# chat (dsh web window)
chat = json.load(open(a.chat))

# text-free lyric band timing
up = Path(a.upstream)
wt = json.load(open(up / 'data/timing/word_timeline_notext.json', encoding='utf-8'))
sk = wt['skeleton']
words = collections.defaultdict(list)
for w in sk['words']: words[w['line_id']].append(w)
patches = {p['line_id']: p['ops'] for p in wt.get('patches', [])}
band = []
for meta, ln in zip(wt['lines'], sk['lines']):
    assert meta['id'] == ln['id']
    ws = sorted(words[ln['id']], key=lambda w: w['word_index'])
    spans = []
    for (c0, c1), w in zip(meta['spans'], ws):
        spans.append([c0, c1, round(w['start'], 3), round(max(0.0, w['end'] - w['start']), 3)])
    e = {'sha256': meta['sha256'], 'start': ln['start'], 'end': ln['end'], 'displayEnd': ln['display_end'], 'words': spans}
    if ln['id'] in patches: e['patch'] = patches[ln['id']]
    band.append(e)
bandj = {'about': 'Word timing of the song without its text (upstream data/timing, MIT). Lines are matched to the user\'s own LRC by the sha256 of the line text.',
         'source': 'https://lrclib.net/api/get/36914646', 'fixes': {'Trios': 'Trois'}, 'lines': band}

def dump(name, obj):
    s = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
    (OUT / name).write_text(s, encoding='utf-8'); print(name, len(s))
    return s
blob = dump('timeline.json', timeline) + dump('chat.json', chat) + dump('band.json', bandj)

# guard: no lyric text in what ships
if a.lyrics:
    raw = Path(a.lyrics).read_text(encoding='utf-8')
    lines = [re.sub(r'\[[^\]]*\]|<[^>]*>', '', l).strip() for l in raw.splitlines()]
    lines = [l for l in lines if len(l.split()) >= 3]
    W = lambda s: re.findall(r"[a-z0-9']+", s.lower())
    grams = set()
    for l in lines:
        w = W(l)
        for i in range(len(w) - 3): grams.add(tuple(w[i:i + 4]))
    strings = re.findall(r'"((?:[^"\\]|\\.)*)"', blob)
    bad = set()
    for s in strings:
        w = W(s)
        for i in range(len(w) - 3):
            if tuple(w[i:i + 4]) in grams: bad.add(s[:80])
        for l in lines:
            if len(l) > 12 and l.lower() in s.lower(): bad.add(s[:80])
    if bad:
        print('LYRIC TEXT FOUND:', sorted(bad)[:20]); sys.exit(1)
    print('lyric check: clean (%d strings, %d 4-grams)' % (len(strings), len(grams)))
