# 02 Per-section storyboard

**Input**: `notes/brief.md`, the section list (`x-dsh-mv-ai.sections`), the lyric timings.
**Output**: `notes/storyboard.md` with one card per section; then write `scenes.js` from it.

One card per section, in this format:

```
## <section kind> <start>–<end>s  (emotion x/10)
Picture: main subject, where on screen, how big (as a share of cols×rows, e.g. "centred, 60 % wide")
Motifs: which motifs appear / change here
Lyrics: how and where they show; how the current word is emphasised (ctx.lyric.word / ctx.lyric.words)
Music: what follows bands / bass / beat (e.g. flash on every beat, bass pushes the radius)
Motion: change over section.progress (start → end); the same t always gives the same frame
Transition: how the section starts and ends (fade, wipe, glitch, cut to black), about 0.5–1 s
Performance: the heaviest work in this section, roughly how many cells per frame
```

Rules:

- Neighbouring sections must differ clearly (composition or main colour); repeated sections (two choruses) must
  build: the second is stronger or adds something new.
- Intros, instrumentals and outros without lyrics still get a full picture, never an empty screen.
- If there is no section list, split the song yourself from duration and energy and write it into mv.json
  `x-dsh-mv-ai.sections` (`[{kind,label,start,end}]`); the script reads it as `ctx.section`.
- Every card maps to one function in `scenes.js` (e.g. `intro(g, t, ctx)`, `chorus(g, t, ctx)`).
