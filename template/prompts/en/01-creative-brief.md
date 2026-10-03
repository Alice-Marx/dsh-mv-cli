# 01 Creative brief (think first, then build)

**Input**: `brief.json` (title, artist, style request), the lyrics file, `sections.json` or `x-dsh-mv-ai.sections`
in mv.json, the duration, `spectrum.json` (if present). **Output**: `notes/brief.md` in the pack folder (one page at
most); every later step follows it.

Use this structure:

1. **One-line concept**: what is the MV about? One visual metaphor ("an old terminal chats with someone late at
   night, then sinks to the sea floor").
2. **Emotion curve**: intensity 0–10 per section (intro 2 → verse 4 → chorus 8 → bridge 3 → last chorus 10 →
   outro 1). Estimate energy from the per-section average of `spectrum.json`; choruses are usually the brightest
   and fastest, bridges the emptiest.
3. **Visual motifs (3–5)**: elements that come back and evolve (windows, heartbeat line, particles, text rain,
   silhouettes…). For each: where it first appears, how it changes at the climax, how it ends.
4. **Palette and character set**: only style digits 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.
   Give each a job (e.g. 3 only for the current lyric, 4 only at the climax). List the main characters (`█▓▒░`
   ramps, `·•●` particles, `─│┌┐└┘` frames, `/\_` lines).
5. **Lyrics presentation**: verses (typing, word highlight, token band), choruses (big text, karaoke), what to draw
   where there are no lyrics. **Never invent or rewrite lyrics**; only use the user's lyrics file.
6. **Beat sync**: if you can estimate the BPM, set `canvas.bpm` (and `canvas.beatOffset`) and accent on
   `ctx.beat.pulse`; otherwise use jumps in `ctx.bass` / `ctx.energy`.
7. **Risks**: frames that could be slow (per-cell work over large areas), CJK wide-character misalignment, long lines
   that do not fit; plan around them.

Proven patterns: `examples/` (chat-window, heartbeat, ops-ticker, token-bar, execution-split, whale-fall,
post-effects) and the complete `examples/rich-pack/scenes.js`.
