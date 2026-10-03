# dsh-mv-cli · world.execute(me); screening room

English · [简体中文](README.zh.md)

A DeepSeek Harness Desktop plugin (`@ljwei-stak/dsh-mv-cli`, profile entry id `dsh-mv`) that plays a **terminal-style music video** for Mili's "world.execute(me);" in the workbench. Two modes:

| Mode | What it does | You supply |
| --- | --- | --- |
| **Canvas MV** | Renders the ASCII MV frame by frame on a `<canvas>` (five chapters, fullscreen, terminal palette). `<audio>.currentTime` is the master clock; the spectrum comes from a Web Audio AnalyserNode. | An audio file; optional lyrics (LRC / SRT, or the `lyrics.json` of your local world.execute-me-ascii copy) and `spectrum.json` |
| **MV terminal** | Runs a terminal player you already have in a pseudo terminal (ConPTY / node-pty), shown with xterm.js (WebGL with DOM fallback). | A world_execute_me folder and its `python.exe`, or a world-execute-me-ascii-rust executable you downloaded yourself |

> **Unofficial fan work.** The plugin ships **no** audio, video, lyric text, spectrum data or artwork. The song and lyrics belong to Mili. The scenes and timing are ported from [yym8224961/world.execute-me-ascii](https://github.com/yym8224961/world.execute-me-ascii) (Bilibili: 野生大K) **with the author's permission**. See [NOTICE.md](NOTICE.md).

## Install (local archive; not on npm yet)

1. Verify `ljwei-stak-dsh-mv-cli-0.1.0.tgz` with `Get-FileHash -Algorithm SHA256 -LiteralPath <path>`.
2. **DeepSeek Harness Desktop → Plugins → Add plugin**, enter the absolute path of the `.tgz`, install and enable.
3. **Fully quit Harness (including the tray icon) and start it again.** The Host only loads new plugin code after a full restart. If the panel shows a version-mismatch banner, the restart was incomplete.
4. The sidebar shows **MV 放映室**. The plugin details page has an open button.

The MV terminal uses the optional dependency `@lydell/node-pty` (prebuilt for Windows). Without it the panel reports pipe mode, and tui_live.py cannot display. The canvas MV is unaffected.

## Canvas MV

- **Audio**: pick your own audio file (mp3/m4a/aac/mp4, decoded by Chromium).
  - Its sha256 is computed locally, and the file is remembered in IndexedDB. It is never uploaded.
- **Lyrics**:
  - LRC: two lines per timestamp (English and Chinese), or `English / 中文` on one line.
  - SRT/VTT: two text lines per block.
  - Or your local ascii `lyrics.json`.
- **Spectrum**: optional `spectrum.json`, for frame-identical bars with the original player. Otherwise a live analyser is used.
- **Keys**:
  - Space/Enter: play/pause
  - ←/→: ±5 s
  - R: restart
  - 1–5: jump to a chapter
  - `[`/`]`: subtitles earlier/later by 0.1 s
  - Alt+`[`/Alt+`]`: audio sync offset ∓0.1 s
  - `,`/`.`: previous/next line
  - +/−: volume
  - M: mute
  - F or double-click: fullscreen
  - H: help
- **Sync**: film time = `audio.currentTime + audio offset`. Known encodes are recognised by sha256. Offsets were measured on 2026-10-03 by onset-envelope cross-correlation:
  - `40e902…` (ascii copy, the timing reference): 0
  - `8b7a41…` (dsh-pv AAC): +0.12 s
  - `79c4e5…` (reference MP3): +0.12 s, inferred
  - `f98eaa…` (world_execute_me copy, 224.5 s): −4.83 s
- **Saved offsets**: tuned offsets are stored per sha256.
- **No audio**: the film runs on an internal clock.

## MV terminal

- **Player**:
  - **world_execute_me**: give the player folder and its `python\python.exe`. Audio is optional, or tick "no audio".
  - **world-execute-me-ascii-rust**: give the `world-execute-me-rust.exe` you downloaded from [its releases](https://github.com/bilixxb/world-execute-me-ascii-rust/releases). It decodes MP3 only and plays its embedded track when no audio is given.
- **Check paths**: the Host verifies every path on disk.
- **Start…**: shows the exact command and working directory, and runs only after you confirm. The panel cannot pass arbitrary commands or arguments.
- **Latency**: output is relayed by long polling and adds about 30–150 ms.

## Development

`pnpm install`, `pnpm test`, `npm run build:client`, `npm run check:client`, `npm run pack:local`.

- `tools/py2js.py` transpiles a local `scenes.py`.
- `tools/make-goldens.py` renders reference frames with the **original** `player.Film` and stores only frame digests. It uses placeholder lyrics and a synthetic spectrum.
- Set `REF_ASCII_DIR` to run an extra test against your local copy.

## Known limitations

- About 2% of the 1232 reference frames differ from the Python renderer. All of them are in the 75–81 s legacy-mesh section, caused by float-ulp / z-buffer ties.
- The MV terminal has long-poll latency. tui_live.py needs ConPTY on Windows and plays audio via MCI.
- The `79c4e5…` offset is inferred.
- Not published to npm yet.

## License

The plugin's own code is MIT. The scene files ported from world.execute-me-ascii are **not** covered by MIT. They are used with the original author's permission. That repository has no LICENSE file; keep the permission in writing and ask the author to add one. See [NOTICE.md](NOTICE.md).
