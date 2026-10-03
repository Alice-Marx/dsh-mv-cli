"""Dev tool: render reference frames with the ORIGINAL world.execute-me-ascii
player.Film (from a local copy given by REF_ASCII_DIR) and store only SHA-256
digests of each frame (characters + styles) in tests/fixtures/film-goldens.json.

No lyric text or spectrum data from the original is used: lyrics are synthetic
placeholders and the spectrum is a deterministic integer pattern, so the
fixture contains no copyrighted material.
"""
import hashlib, json, os, sys
ref = os.environ.get('REF_ASCII_DIR') or sys.exit('set REF_ASCII_DIR to a local world.execute-me-ascii checkout')
sys.path.insert(0, ref)
import player  # noqa: E402

def synthetic_lyrics():
    out, t, i = [], 0.6, 0
    while t < 209:
        out.append({'time': round(t, 3), 'end': round(t + 4.2, 3), 'en': f'PLACEHOLDER LINE {i:03d} OF THE TEST CUE', 'zh': f'测试字幕第{i}句'})
        t += 6.35; i += 1
    return out

def band(t, i):
    return ((i * 7 + int(t * 30) * 13) % 17) / 16

film = player.Film()
film.lyrics = synthetic_lyrics()
film.times = [x['time'] for x in film.lyrics]
film.energy = lambda t: [band(t, i) for i in range(48)]

def digest(c):
    rows = [''.join(ch for ch, _ in r) + '\t' + ''.join(str(s) for _, s in r) for r in c.cells]
    return hashlib.sha256('\n'.join(rows).encode('utf-8')).hexdigest()[:20]

cases = []
for (w, h) in [(120, 40), (64, 24), (100, 30), (160, 50)]:
    for k in range(0, 292):
        t = round(k * 0.73, 3)
        for paused, help_on, ready in ((True, False, False),) + (((False, True, False), (True, False, True)) if k % 37 == 0 else ()):
            cases.append({'w': w, 'h': h, 't': t, 'paused': paused, 'help': help_on, 'ready': ready,
                          'sha': digest(film.render(t, w, h, paused, 0.3 if help_on else 0, help_on, ready))})
json.dump({'generator': 'tools/make-goldens.py', 'source': 'yym8224961/world.execute-me-ascii player.py + scenes.py', 'cases': cases},
          open(os.path.join(os.path.dirname(__file__), '..', 'tests', 'fixtures', 'film-goldens.json'), 'w'), indent=0)
print(len(cases))
