# 05 Iteration prompts (copy one to the AI when you want a change)

Change one thing at a time; afterwards preview the affected times with `mv_pack_preview_frame` and run the 04 checklist.

- **More spectacle**: "Strengthen the choruses: on strong beats (ctx.beat.pulse > 0.7) flash the screen white for one
  frame and zoom 10 %, add the scanlines and vignette from post-effects; leave the other sections alone."
- **Closer to the lyrics**: "Make the verses type word by word: show only the words in ctx.lyric.words already sung,
  the current word in style 3, and the next line in style 0 below."
- **Off-beat**: "Set canvas.bpm to <BPM> and canvas.beatOffset to <seconds> so the first beat lands at <time> s; check
  the preview 2 s around <time>."
- **Wrong sections**: "Rewrite x-dsh-mv-ai.sections with these times: <kind start–end list>, and adjust the scenes."
- **Too slow**: "Find the slowest section, scale particle counts with the area (cols*rows/50), remove loops inside the
  per-cell loop; target < 8 ms per frame."
- **New style**: "Keep the structure and lyric sync, change the look to <style>: only styles <list>, characters <set>."
- **Add a scene**: "Use the effect from examples/<name>.scene.js in the bridge with words and rhythm that fit this song,
  joined to its neighbours with 0.8 s fades."
- **Small windows look bad**: "When cols < 70 or rows < 20 use a simple layout: hide decorative frames, keep the
  subject and the lyric."
- **Getting ready for the workshop**: "Check that credits / notice / x-dsh-mv-workshop.license are complete and that the
  pack holds nothing it should not (publishing strips the audio and lyric text automatically and keeps the timings)."
