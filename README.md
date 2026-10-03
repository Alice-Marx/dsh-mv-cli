# dsh-mv-cli · world.execute(me); screening room

English · [简体中文](README.zh.md)

A DeepSeek Harness Desktop plugin (`@ljwei-stak/dsh-mv-cli`, profile entry id `dsh-mv`) that plays **terminal-style music videos** in the workbench. Built in: Mili's "world.execute(me);" scenes. Any other song: an [MV pack](#mv-packs-play-any-song) (`mv.json`), drawn by the generic spectrum + lyrics renderer, by a sandboxed scene script, or by an external TUI program, and a Harness agent can [make the pack for you](#make-a-new-mv-with-ai). Two modes:

| Mode | What it does | You supply |
| --- | --- | --- |
| **Canvas MV** | Renders the ASCII MV frame by frame on a `<canvas>` (five chapters, fullscreen, terminal palette). `<audio>.currentTime` is the master clock; the spectrum comes from a Web Audio AnalyserNode. | An audio or video file in any format Chromium decodes; optional lyrics (LRC / SRT, or the `lyrics.json` of your local world.execute-me-ascii copy) and `spectrum.json` |
| **MV terminal** | Runs a terminal player you already have in a pseudo terminal (ConPTY / node-pty), shown with xterm.js (WebGL with DOM fallback). | A world_execute_me folder and its `python.exe` (any audio format; converted to WAV automatically), or an MV pack with a `terminal` program |

> **Unofficial fan work.** The plugin ships **no** audio, video, lyric text, spectrum data or artwork. The song and lyrics belong to Mili. The scenes and timing are ported from [yym8224961/world.execute-me-ascii](https://github.com/yym8224961/world.execute-me-ascii) (Bilibili: 野生大K) **with the author's permission**. See [NOTICE.md](NOTICE.md).

## The panel at a glance

The panel reads top to bottom like a music player:

1. **曲库 (library)**: cards for the built-in world.execute(me) preset and recently imported MV packs, plus **用 AI 制作新 MV** (make a new MV with AI), **导入 MV 包** (import) and **新建（模板）** (new from template).
2. **正在播放 (now playing)**: the title and artist. On the right you choose **where to play** (画布 canvas / 面板终端 panel terminal / 独立窗口 separate window), then press the big **▶ 播放** button.
3. **Stage**: in canvas mode, the canvas plus a player bar (play/pause, seek, time, chapter, volume, audio sync, keyboard shortcuts, fullscreen). In terminal modes, the player status (paths are checked automatically, and problems appear inline with one-click fixes), the confirmation card and the terminal.
4. **设置 / 高级 (settings)**, collapsed by default: paths, start second, latency, no-audio, font size.
5. **ⓘ** at the top right: about, credits and legal notice. A compact "请完全重启 Harness" pill appears only when the Host runs older plugin code.

The panel has an opaque background and follows the Harness light/dark theme.

## Install

**From npm (recommended):** in **DeepSeek Harness Desktop → Plugins → Add plugin**, enter `@ljwei-stak/dsh-mv-cli@0.4.0` (or just `@ljwei-stak/dsh-mv-cli` for the latest), then install and enable it.

**From a local archive:** download `ljwei-stak-dsh-mv-cli-0.4.0.tgz` and its `.sha256` from the GitHub Release. Check it with `Get-FileHash -Algorithm SHA256 -LiteralPath <path>`, then enter the archive's absolute path in **Plugins → Add plugin**.

After installing either way:

1. **Fully quit Harness (including the tray icon) and start it again.** The Host only loads new plugin code after a full restart. If the panel shows a version-mismatch banner, the restart was incomplete.
2. The left sidebar shows **MV 放映室** below the built-in entries (插件 / 自动化任务 / …). Click it to open the panel in the main area. The plugin details page (Plugins → dsh-mv-cli) also has an **打开 MV 放映室** button.

> Upgrading: after installing a new version, fully quit Harness once (including the tray icon). Otherwise the panel shows a "后台版本与界面不一致" banner. 0.1.1 never showed the sidebar entry; use 0.1.2 or later.

The MV terminal uses the optional dependency `@lydell/node-pty` (prebuilt for Windows). Without it the panel reports pipe mode, and tui_live.py cannot display. The canvas MV is unaffected.

## MV packs: play any song

An **MV pack** is a folder with an `mv.json` manifest. It names your audio, lyrics and optional spectrum files (paths relative to the folder), and says how to draw the song:
- with the built-in **generic** canvas renderer (spectrum bars, title, current and next lyric, progress), which works for any song;
- with the built-in **world-execute-me** scenes;
- with a **scene script** (`canvas.renderer: "script"`, `canvas.script: "scenes.js"`): your own `render(t, cols, rows, ctx)` in plain JavaScript, run sandboxed in a Web Worker with a time limit per frame (falls back to generic on errors). The template README documents the API;
- and/or with an **external TUI program** (an executable or interpreter, a script, and an argument template).

The built-in world.execute(me) preset is still the default entry in the pack list.

In the panel's **曲库** (library):

1. **新建（模板）**: choose a folder. The plugin creates `dsh-mv-pack-template` there and never overwrites existing files. The folder contains `mv.json`, `mv.schema.json` (completion and validation in VS Code), README.md / README.zh.md, a placeholder `lyrics.example.lrc`, and `examples/` (a python player, world.execute(me) written as a pack, and `scenes.example.js`). **下载模板 zip** in the import dialog gives the same files as a zip.
2. Put your own audio (any [supported format](#audio-formats)) and lyrics in the folder, and edit `mv.json`.
3. **导入 MV 包** → **选择文件夹…**, or paste the path of the folder or of `mv.json`. Importing only reads the manifest.
   - Recently used packs (up to 8) are remembered on this computer and appear as cards in the library (× on a card removes it).
   - The last active pack is reopened next time.
4. **画布** plays the pack: the audio is streamed from the Host in chunks, and lyrics/spectrum are loaded with it. When the pack has a `terminal` section, the terminal modes offer the player **MV 包渲染程序**.

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
- `format`, `version`, `title` are required. Optional fields: `artist`, `album`, `credits[]`, `notice`, `duration`, `audio {file, offset}`, `lyrics {file, offset}` (LRC/SRT/VTT/lyrics.json), `spectrum {file}`, `canvas {renderer: generic | world-execute-me | script, script, fontSize}` and `terminal`.
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

## Make a new MV with AI

**曲库 → 用 AI 制作新 MV** turns any song you have into an MV pack, with a Harness agent writing the lyric timing, `mv.json` and an ASCII scene script.

1. Click the **用 AI 制作新 MV** card. In the dialog:
   - **选择音频…**: any audio or video file Chromium can decode (see [Audio formats](#audio-formats)). The detected format is shown next to it.
   - **歌名** (pre-filled from the file name) and optionally **歌手**.
   - **歌词** (optional): paste them or **从文件读取…**. Timed LRC is best; plain text works too (the agent estimates the timing).
   - **风格说明** (optional): what you would like to see, e.g. "rainy cyberpunk night, code rain in the chorus".
   - **保存位置**: defaults to `%LOCALAPPDATA%\dsh-mv\packs`; a new sub-folder named after the song is created there and nothing is overwritten.
2. **创建 MV 包**: the panel decodes the audio locally, computes `spectrum.json` (48 bands, 20 fps), and the Host creates the folder: a copy of your audio as `audio.<ext>`, `spectrum.json`, your lyrics (`lyrics.lrc` / `lyrics.txt`), a working `mv.json` (generic renderer), `scenes.js` (an example scene), `mv.schema.json`, README and `AGENT.md` (the task description and the scene API for the agent). The pack immediately appears in the library and already plays with the generic renderer. Your original file is never modified and nothing is uploaded.
3. **在新会话中交给 AI**: the plugin adds the folder as a Harness workspace, opens a new agent session there titled `MV：<song>` and queues the task (you can edit the prompt first). The agent reads `AGENT.md`, aligns the lyrics, writes `scenes.js` and the final `mv.json`, and checks its work with the plugin's agent tools **`mv_pack_validate`** (schema, files, lyric timing, scene script run in a sandbox) and **`mv_pack_preview_frame`** (renders one frame as text). Harness may ask you to approve file writes; the session uses your model quota.
   - If your Harness build does not expose the session API to plugins, the dialog shows **复制提示词** instead (and **打开新会话** when a blank session can be opened): create a session on the pack folder yourself and paste the prompt.
4. When the agent is done, click the pack's card in the library to reload it and press **▶ 播放**. If the scene script fails in the panel (error, too slow, hangs), the panel says so and falls back to the generic renderer.

Safety: the plugin never runs external programs for this flow, scene scripts run sandboxed (Web Worker in the panel; `node:vm` with time limits and no `require`/`process` for the agent tools), and the agent tools are read-only. The tools can be turned off with the `agentTools` setting.

## Audio formats

The format is always detected from the file's **content**, not its extension (a DASH MP4 renamed `.mp3` is recognised as MP4).

| Where | Supported |
| --- | --- |
| Canvas MV, MV packs, 用 AI 制作新 MV | Everything the panel's Chromium decodes: MP3, M4A/AAC (incl. ADTS and DASH/fragmented MP4), the audio track of MP4 / MOV / WebM / MKV video files, Ogg Vorbis, Ogg/WebM Opus, FLAC, WAV (PCM, float, A-law, μ-law). |
| MV terminal (tui_live.py, Windows MCI) | Plays MP3 and PCM WAV directly. **Every other format above is converted automatically** when you press ▶ 播放: the panel decodes it and the Host stores a 16-bit PCM WAV in `%LOCALAPPDATA%\dsh-mv\audio-cache\` named by the source's sha256, so the next play starts instantly (newest 8 kept). Progress is shown in the 播放器 card; your file is never modified. |
| Formats Chromium cannot decode (WMA/ASF, AIFF, AMR, AC-3, APE, WavPack, CAF, MPEG-TS, FLV, RF64 …) | If **ffmpeg** is installed (on `PATH`, at `D:\Program Files\FFmpeg\bin\ffmpeg.exe`, or the `ffmpegPath` setting), the panel offers **用 ffmpeg 转换…**: it shows the exact command and runs it only after you confirm (fixed arguments, no shell, 10-minute limit) into the same WAV cache. Without ffmpeg, convert the file yourself or play without sound. |

## Canvas MV

- **Audio**: choose **画布**, then **选择…** in the audio tile to pick your own audio or video file (any [format Chromium decodes](#audio-formats); the detected format is shown). When a pack's audio cannot be decoded and ffmpeg is available, the panel offers **用 ffmpeg 转换…**.
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

- **Where**: choose **面板终端** or **独立窗口** next to the Play button, then pick the player in the 播放器 card:
  - **world_execute_me**: give the player folder and its `python\python.exe`. Audio is optional (any format), or tick "no audio".
  - **MV 包渲染程序**: the `terminal` program of the active MV pack.
- **Automatic checks**: after each change the Host verifies every path on disk and sniffs the audio file's **real format** from its first bytes (the extension does not count).

  > **Any audio format works.** tui_live.py plays audio through Windows MCI, which opens only real MP3 / PCM WAV (anything else, e.g. a DASH MP4 renamed `.mp3`, fails with MCI error 277 and plays silently). So when the file is anything else, **▶ 播放** first converts it transparently to a cached WAV (progress in the 播放器 card, cached by sha256, about 10 MB per minute) and starts tui_live.py with `--audio-file <cached wav>`. The confirmation card says so. Formats Chromium cannot decode use ffmpeg when available (see [Audio formats](#audio-formats)), or **不播放声音**.
- **▶ 在面板终端播放**: shows the exact command and working directory, and runs only after you confirm. The panel cannot pass arbitrary commands or arguments.
- **Latency**: output is relayed by long polling and adds about 30–150 ms.

### Play in a separate window (Windows only)

**独立窗口** + **▶ 在独立窗口播放** runs the same fixed player and arguments in a **real Windows console window** (Windows Terminal when that is the default terminal), with no relay latency. The confirmation card shows the exact command, `cmd.exe /d /v:off /s /c "start "world.execute(me)" /D "<dir>" "<player>" <fixed args>"`. Every path is quoted; paths containing `%` are refused because cmd expands `%VAR%` even inside quotes. The Host finds the player's pid; **结束** runs `taskkill /PID <pid> /T /F` after checking the pid still belongs to that executable. Windows opened by the plugin are also closed on plugin unload / Harness exit. The button is disabled with an explanation on macOS / Linux.

## Development

`pnpm install`, `pnpm test`, `npm run build:client`, `npm run check:client`, `npm run pack:local`.

- `tools/py2js.py` transpiles a local `scenes.py`.
- `tools/make-goldens.py` renders reference frames with the **original** `player.Film` and stores only frame digests. It uses placeholder lyrics and a synthetic spectrum.
- Set `REF_ASCII_DIR` to run an extra test against your local copy.

## Known limitations

- About 2% of the 1232 reference frames differ from the Python renderer. All of them are in the 75–81 s legacy-mesh section, caused by float-ulp / z-buffer ties.
- The MV terminal has long-poll latency. tui_live.py needs ConPTY on Windows. Non-MP3/WAV audio is converted to a WAV first (the first play of a long song takes a few seconds; the cache lives in `%LOCALAPPDATA%\dsh-mv\audio-cache`).
- 用 AI 制作新 MV needs the agent session API of the Harness client (otherwise copy & paste the prompt). Scene scripts run in a Blob Web Worker; if a Harness build forbids blob workers, script packs play with the generic renderer. The agent tools need the Host `tools` service; without it the agent checks its work by reading AGENT.md.
- Audio files over 1 GB are refused; the WAV cache is limited to 1.5 GB per file (about 2.5 hours).
- The `79c4e5…` offset is inferred.

## License

The plugin's own code is MIT. The scene files ported from world.execute-me-ascii are **not** covered by MIT. They are used with the original author's permission. That repository has no LICENSE file; keep the permission in writing and ask the author to add one. See [NOTICE.md](NOTICE.md).
