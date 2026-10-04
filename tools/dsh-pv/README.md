# tools/dsh-pv — rebuilding the dsh PV preset data (not shipped)

These scripts regenerate `presets/dsh-pv/data/{timeline,chat,band}.json` from a local checkout of
[MisakaZentai/world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv) (MIT; built from
commit `a4dd0f7`). They run only on a developer machine and are not in the npm package (`files` in package.json
does not list `tools/`). They were written for one build and still contain absolute paths from that machine
(`/workspace/v060/...`); adjust them before running.

You need the upstream checkout with its Python environment (Pillow, numpy …) and, for the lyric check, your own
copy of the song's lyrics. Nothing here downloads audio or lyrics.

1. **`rec3.py`**: run inside the upstream `film/` directory with the upstream Python. It monkeypatches
   `PIL.ImageDraw` to record the draw calls (text, rectangles, lines, polygons, colours, fonts, positions) of the
   upstream composite renderer (`dsh_her.install()` / `finish(v2.frame(n))`) on its 1280×720 frames, at 2–6
   keyframes per shot (about one per 0.5 s) for all 97 shots of `shots.json` (the upstream shot table with
   start / end / chapter / layout). It also records the whale pane rects, the layer `levels` and the GONE
   interval. Output: `rec3.json` (`OUT=` to change).
2. **`chat.py` + `chat_build.py`**: parse the upstream page frames (`film/pv_dsh_frontend_*/*_frames.json`, the
   HTML of the DeepSeek-style window per frame) into a block table (head, user, reply, tool, error, retry,
   compaction, panel, attachment, footer, bar …) and time segments, with typing stored as character counts.
   Output: `chat.json`. The panel redraws the window natively; no frontend CSS, icons or fonts are kept.
3. **`build.py`**:

   ```sh
   python3 tools/dsh-pv/build.py --rec rec3.json --chat chat.json --shots shots.json \
     --upstream <upstream checkout> --out presets/dsh-pv/data [--lyrics <your lyrics.lrc>]
   ```

   It drops what the canvas draws live (header, lyric band, footer, ticker column, scanlines) and grey mask
   draws, palettes the colours, extracts the ticker op lists, turns the sung words of the `satisfaction` shot into
   placeholders filled at run time from the user's LRC, and writes `band.json` from upstream's text-free word
   timeline: per line only a sha256 of the text, times and word spans (plus a word-order patch for one line and
   a typo fix).

**Lyric guard.** No lyric text may ship. With `--lyrics`, `build.py` reports every output string containing a
full lyric line or any run of 4 lyric words; `tests/dshpv.test.mjs` also checks that no string in the data hashes
to a lyric line. The LRC is read only for that check and never copied.

The art in `presets/dsh-pv/art/` is not produced here: it is upstream's CC BY-NC-SA 4.0 artwork,
downscaled to 200×360 and re-encoded as WebP q80; keep its `LICENSE` and `NOTICE.md` with it.
