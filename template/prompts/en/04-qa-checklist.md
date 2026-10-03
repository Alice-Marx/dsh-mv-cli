# 04 QA checklist (go through every item before you finish)

## Must pass

- [ ] `mv_pack_validate` (path = pack folder) reports no errors; mv.json is valid JSON, `canvas.renderer` is
      `"script"` and `canvas.script` points at `scenes.js`.
- [ ] Lyrics come from the user's file: nothing invented, rewritten or completed; times increase and stay within the duration.
- [ ] The audio was not modified, converted or deleted; nothing was downloaded; only files in the pack folder changed.
- [ ] scenes.js has no import / require / eval / new Function / fetch, no Math.random, no state carried between frames.
- [ ] Previewed with `mv_pack_preview_frame` at least: 0 s, the middle of every section, 0.3 s before and after every
      section change, the last 2 s.
- [ ] No blank frames, no errors; each frame < 10 ms (hard limit 40 ms).

## Picture quality

- [ ] Every section is recognisable at a glance; the second chorus is stronger or adds something.
- [ ] The current lyric is always readable (cleared band behind it, style 3 or 2); the word highlight matches the sung word.
- [ ] The picture reacts clearly to beats / bass without flickering every frame (at most one flash per beat).
- [ ] CJK wide characters align, frames are not pushed out of shape; long lines are truncated, not wrapped badly.
- [ ] Small (about 60×18) and large (about 160×48) windows both work: nothing out of bounds, the subject stays centred.
- [ ] Intro, instrumentals and outro have a full picture; the ending resolves (fade, freeze or a closing caption).
- [ ] credits / notice are complete: song rights belong to their owners, sources and licences of any material.

## When something is wrong

Write it to `notes/qa.md` (time, what you saw, cause, fix), re-preview the same time after the fix, then continue.
