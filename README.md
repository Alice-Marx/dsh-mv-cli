# dsh-mv-cli · world.execute(me); screening room

English · [简体中文](README.zh.md)

A DeepSeek Harness Desktop plugin (`@ljwei-stak/dsh-mv-cli`, profile entry id `dsh-mv`) that plays **terminal-style music videos** in the workbench. Built in: Mili's "world.execute(me);" scenes. Any other song: an [MV pack](#mv-packs-play-any-song) (`mv.json`), drawn by the generic spectrum + lyrics renderer or by an external TUI program. Two modes:

| Mode | What it does | You supply |
| --- | --- | --- |
| **Canvas MV** | Renders the ASCII MV frame by frame on a `<canvas>` (five chapters, fullscreen, terminal palette). `<audio>.currentTime` is the master clock; the spectrum comes from a Web Audio AnalyserNode. | An audio file; optional lyrics (LRC / SRT, or the `lyrics.json` of your local world.execute-me-ascii copy) and `spectrum.json` |
| **MV terminal** | Runs a terminal player you already have in a pseudo terminal (ConPTY / node-pty), shown with xterm.js (WebGL with DOM fallback). | A world_execute_me folder and its `python.exe`, or a world-execute-me-ascii-rust executable you downloaded yourself |

> **Unofficial fan work.** The plugin ships **no** audio, video, lyric text, spectrum data or artwork. The song and lyrics belong to Mili. The scenes and timing are ported from [yym8224961/world.execute-me-ascii](https://github.com/yym8224961/world.execute-me-ascii) (Bilibili: 野生大K) **with the author's permission**. See [NOTICE.md](NOTICE.md).

## Install

**From npm (recommended):** in **DeepSeek Harness Desktop → Plugins → Add plugin**, enter `@ljwei-stak/dsh-mv-cli@0.2.1` (or just `@ljwei-stak/dsh-mv-cli` for the latest), then install and enable it.

**From a local archive:** download `ljwei-stak-dsh-mv-cli-0.2.1.tgz` and its `.sha256` from the GitHub Release. Check it with `Get-FileHash -Algorithm SHA256 -LiteralPath <path>`, then enter the archive's absolute path in **Plugins → Add plugin**.

After installing either way:

1. **Fully quit Harness (including the tray icon) and start it again.** The Host only loads new plugin code after a full restart. If the panel shows a version-mismatch banner, the restart was incomplete.
2. The left sidebar shows **MV 放映室** below the built-in entries (插件 / 自动化任务 / …). Click it to open the panel in the main area. The plugin details page (Plugins → dsh-mv-cli) also has an **打开 MV 放映室** button.

> Upgrading: after installing a new version, fully quit Harness once (including the tray icon). Otherwise the panel shows a "后台版本与界面不一致" banner. 0.1.1 never showed the sidebar entry; use 0.1.2 or later.

The MV terminal uses the optional dependency `@lydell/node-pty` (prebuilt for Windows). Without it the panel reports pipe mode, and tui_live.py cannot display. The canvas MV is unaffected.

## MV packs: play any song

An **MV pack** is a folder with an `mv.json` manifest. It names your audio, lyrics and optional spectrum files (paths relative to the folder), and says how to draw the song:
- with the built-in **generic** canvas renderer (spectrum bars, title, current and next lyric, progress), which works for any song;
- with the built-in **world-execute-me** scenes;
- and/or with an **external TUI program** (an executable or interpreter, a script, and an argument template).

The built-in world.execute(me) preset is still the default entry in the pack list.

In the panel's **MV 包** bar:

1. **下载模板…**: choose a folder. The plugin creates `dsh-mv-pack-template` there and never overwrites existing files. The folder contains `mv.json`, `mv.schema.json` (completion and validation in VS Code), README.md / README.zh.md, a placeholder `lyrics.example.lrc`, and `examples/` (a python player, and world.execute(me) written as a pack). **或下载 zip** gives the same files as a zip.
2. Put your own `song.mp3` and lyrics in the folder, and edit `mv.json`.
3. **导入 MV 包…** → **选择文件夹…**, or paste the path of the folder or of `mv.json`. Importing only reads the manifest.
   - Recently used packs (up to 8) are remembered on this computer and appear in the drop-down.
   - The last active pack is reopened next time.
4. **画布 MV** plays the pack: the audio is streamed from the Host in chunks, and lyrics/spectrum are loaded with it. **MV 终端** gets a player option **MV 包：…** when the pack has a `terminal` section.

Minimal `mv.json`:

```json
{
  "$schema": "./mv.schema.json",
  "format": "dsh-mv-pack",
  "version": 1,
  "title": "My Song",
  "artist": "Someone",
  "audio": { "file": "song.mp3", "offset": 0 },
  "lyrics": { "file": "lyrics.lrc" },
  "canvas": { "renderer": "generic" },
  "terminal": {
    "program": "python/python.exe",
    "script": "player.py",
    "args": ["{script}", { "when": "audio", "args": ["--audio", "{audio}"] }, { "when": "start", "args": ["--start", "{start}"] }],
    "cwd": "pack"
  }
}
```

Fields:
- `format`, `version`, `title` are required. Optional fields: `artist`, `album`, `credits[]`, `notice`, `duration`, `audio {file, offset}`, `lyrics {file, offset}` (LRC/SRT/VTT/lyrics.json), `spectrum {file}`, `canvas {renderer: generic | world-execute-me, fontSize}` and `terminal`.
- Unknown fields are errors; use `x-…` for your own data.
- Relative paths must not contain `..`.

`terminal.args` placeholders:
- `{audio}`, `{lyrics}`, `{spectrum}`, `{script}`, `{packDir}` are absolute paths.
- `{start}` and `{offset}` are numbers (`{offset}` is the panel value plus `audio.offset`).
- `{{`/`}}` are literal braces.
- `{ "when": "audio|lyrics|spectrum|start|offset", "args": [...] }` adds arguments only when the condition holds.
- Each array item is one argv element, and no shell parses it.

**Safety of external renderers.** A pack's program is arbitrary code by nature, so:
- Nothing runs on import.
- **检查** re-reads `mv.json` on the Host and verifies the program, script and media files.
- The confirmation card shows the exact resolved command, every argument and the working directory, and the start runs only after you confirm.
- If `mv.json` changes after you confirmed, the Host refuses to start.
- `.bat`/`.cmd`/`.ps1`/`.vbs`/`.js`/`.lnk` and similar files are refused as programs. On Windows the program must be an `.exe`.
- In the separate-window (cmd.exe) mode, any path or argument containing `% ! " ^ & | < >` or a line break is refused. Parentheses are allowed, because every token is quoted.

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
- **Check paths**: the Host verifies every path on disk and sniffs the audio file's **real format** from its first bytes (the extension does not count).

  > **No sound?** tui_live.py plays audio through Windows MCI, which opens only real **MP3 / WAV** files. An MP4/AAC download (often a DASH-fragmented MP4) renamed to `.mp3` fails with "初始化 MCI 时发生问题" (MCI error 277). The player prints `no music: …` just before the full-screen picture hides it, then plays silently, both in the panel and in the separate window.
  > Since 0.2.1 the panel shows a red warning under the audio field and offers **转换为 WAV…**: pick the same file, the panel decodes it with Chromium into a 16-bit PCM WAV (about 10 MB per minute), stores it in the plugin's own cache `%LOCALAPPDATA%\dsh-mv\audio-cache\` (newest 6 kept) and switches the audio field to it. Your file and the player folder are never modified. Or convert yourself: `ffmpeg -i song.mp3 -vn -c:a libmp3lame -q:a 2 song-real.mp3`.
- **Start…**: shows the exact command and working directory, and runs only after you confirm. The panel cannot pass arbitrary commands or arguments.
- **Latency**: output is relayed by long polling and adds about 30–150 ms.

### Play in a separate window (Windows only)

**在独立窗口播放…** runs the same fixed player and arguments in a **real Windows console window** (Windows Terminal when that is the default terminal), with no relay latency. The confirmation card shows the exact command, `cmd.exe /d /v:off /s /c "start "world.execute(me)" /D "<dir>" "<player>" <fixed args>"`. Every path is quoted; paths containing `%` are refused because cmd expands `%VAR%` even inside quotes. The Host finds the player's pid; **结束** runs `taskkill /PID <pid> /T /F` after checking the pid still belongs to that executable. Windows opened by the plugin are also closed on plugin unload / Harness exit. The button is disabled with an explanation on macOS / Linux.

## Development

`pnpm install`, `pnpm test`, `npm run build:client`, `npm run check:client`, `npm run pack:local`.

- `tools/py2js.py` transpiles a local `scenes.py`.
- `tools/make-goldens.py` renders reference frames with the **original** `player.Film` and stores only frame digests. It uses placeholder lyrics and a synthetic spectrum.
- Set `REF_ASCII_DIR` to run an extra test against your local copy.

## Known limitations

- About 2% of the 1232 reference frames differ from the Python renderer. All of them are in the 75–81 s legacy-mesh section, caused by float-ulp / z-buffer ties.
- The MV terminal has long-poll latency. tui_live.py needs ConPTY on Windows and plays audio via MCI, which only opens real MP3 / WAV (convert MP4/AAC with 转换为 WAV…).
- The `79c4e5…` offset is inferred.

## License

The plugin's own code is MIT. The scene files ported from world.execute-me-ascii are **not** covered by MIT. They are used with the original author's permission. That repository has no LICENSE file; keep the permission in writing and ask the author to add one. See [NOTICE.md](NOTICE.md).
