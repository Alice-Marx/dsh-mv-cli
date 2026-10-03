# 03 Scene-script guide (scenes.js)

## API

```js
function setup(info) { }                 // optional; info = { title, artist, duration, sections, bpm, beatOffset }
function render(t, cols, rows, ctx) {    // called every frame, about 30–60 times per second
  return { lines: [...], styles: [...] } // or an array of strings / one string with \n
}
```

- `lines[y]` is row y; `styles[y]` has one digit per character: 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.
- `ctx`:
  - `duration`, `progress` (0..1), `title`, `artist`, `ready`, `paused`
  - `lyric`: `{ text, en, zh, start, end, progress, words: [{text,start,end}], word }` or null. `words` come from
    enhanced-LRC `<mm:ss.xx>` word stamps, otherwise they are spread over the first 70 % of the line (CJK per
    character); `word` is the index of the word being sung (-1 before the first).
  - `next`: the next line `{ text, en, zh, start, end, progress }` (no words)
  - `bands`: 48 values 0..1 (low → high); `energy`, `bass`, `mid`, `treble`: 0..1
  - `section`: `{ kind, label, start, end, index, progress }` or null; `sections`: all of them
  - `beat`: `{ bpm, index, bar, phase, pulse }` when mv.json sets `canvas.bpm` (pulse is 1 on the beat and decays
    fast), otherwise null

## Sandbox limits (breaking them stops the script; the panel falls back to the generic picture)

- No import / require; no DOM, network (fetch…), storage, timers, Workers, WebAssembly; no eval / new Function.
- 40 ms per frame (aim for < 10 ms); too many slow frames, a 1.5 s hang or an exception stops the script. 256 KB max.
- A frame must be a **pure function** of `t` and `ctx`: no state from earlier frames, no Math.random (seeking and the
  preview tool must give the same picture). Use the deterministic `hash(i, seed)` from the example helpers. For
  "history" effects (trails, ECG traces) recompute earlier times `t - dt`.

## Performance budget

- A 100×32 grid has 3200 cells: a few passes per frame are fine; avoid loops inside the per-cell loop
  (O(cells × objects)).
- Scale particle counts with the area (e.g. `cols*rows/40`), never thousands fixed.
- Build a 2-D array `ch[y][x]` and `join('')` once at the end.
- `mv_pack_preview_frame` reports the time per frame; simplify above 10 ms.

## ASCII / canvas techniques

- **Wide characters**: CJK and full-width symbols take two cells. Use the examples' `setCell/put` (the second cell
  holds ''), otherwise alignment and styles break.
- **Shading**: ` .:-=+*#%@` or `░▒▓█`; styles 0–3 as a second brightness layer.
- **Shapes**: circles / rings in polar coordinates with x × 2 for the cell aspect ratio; block letters from a 5×3
  dot font scaled up (examples/execution-split).
- **Frames and windows**: `┌─┐│└┘` (examples/chat-window).
- **Particles**: position = start hash + speed × t, wrapped with modulo (examples/whale-fall).
- **Post effects** on style digits: scanlines (every other row one step darker), vignette (darker far from the
  centre), bloom (`.` around bright cells), glitch (shift whole rows on the beat, skipping rows with wide
  characters) (examples/post-effects).
- **Transitions**: lower brightness step by step in the 0.5–1 s at section edges (fade), or wipe columns by progress.

## Syncing to the music

- **Lyrics**: current line `ctx.lyric.text`; word highlight with `ctx.lyric.words` + `ctx.lyric.word`
  (examples/token-bar, the karaoke in rich-pack); typing with `lyric.progress` or word times. Preview the next line
  with `ctx.next` (dim).
- **Spectrum**: `bands[i]` drives bar height / radius / particle speed; `bass` suits global scale and flashes,
  `treble` fine particles.
- **Beat**: `ctx.beat.pulse` for accents (flash, zoom, glitch), `ctx.beat.bar` to change composition per bar;
  without bpm, use `bass` crossing a threshold.
- **Sections**: `ctx.section.kind` picks the scene function, `ctx.section.progress` drives motion inside it.
- **Silent packs**: without audio all bands are 0; the examples' `energyOf/bandOf` fake motion so previews are alive.

## Suggested structure

```js
/* helpers (copy the grid helpers from examples) */
function intro(g, t, ctx, p) { ... }
function verse(g, t, ctx, p) { ... }
function chorus(g, t, ctx, p) { ... }
function render(t, cols, rows, ctx) {
  var g = makeGrid(cols, rows), s = ctx.section
  var kind = s ? s.kind : 'verse'
  ;({ intro: intro, verse: verse, chorus: chorus }[kind] || verse)(g, t, ctx, s ? s.progress : ctx.progress)
  /* transitions + post effects */
  return frameOf(g)
}
```

Every window size must work (cols 40–240, rows 12–85): place things proportionally and truncate text that does not fit.
