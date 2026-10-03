# Changelog

## 0.5.0 — 2026-10-03

- **自动制作**: in the 用 AI 制作新 MV dialog you only pick the audio. A stepper runs: pack → tags (ID3 / MP4 / FLAC / Vorbis) → **LRCLIB** lookup (optional, setting `lrclib`; sends only title, artist, album, duration; shown in the dialog) → local **lyrics engine** (Demucs htdemucs vocals + faster-whisper large-v3 / medium / small with word timestamps and VAD) when there is no timing, or to cross-check LRCLIB on a GPU → word/character alignment with **per-line confidence** → **section detection** (verse / chorus / bridge / instrumental, from repetition, pauses and spectrum energy) → saves `lyrics.lrc`, `timing.json`, `sections.json` and updates `mv.json` (`x-dsh-mv-ai.timing/sections`). Each step can be stopped; a failed LRCLIB lookup is skipped. The AI hand-off prompt tells the agent to keep the timing and use the sections.
- **Lyrics engine** under `%LOCALAPPDATA%\dsh-mv\engine`: one-click install with uv (Python 3.12 venv, `torch==2.8.0` CUDA 12.6 or CPU, pinned faster-whisper 1.2.1 / ctranslate2 4.8.2 / demucs 4.1.0 / julius 0.2.8 plus a full constraints file), confirm card with the download size first, progress, stop (kills the process tree), probe (Python, packages, CUDA, GPU, models) and model downloads (resumable, stall detection, `hfEndpoint` mirror). Or point `enginePython` at your own env. The Host runs only fixed argument lists (`dsh_mv_engine.py probe|prefetch|transcribe <args.json>`), streaming JSON-line progress.
- **歌词校准 editor** under the canvas player: waveform (vocal stem when available) with draggable lyric blocks, global offset, tap-to-sync, ±50 / ±500 ms nudges, split / merge / edit / delete, undo / redo, yellow low-confidence lines with 下一个不确定, click-to-play from 2 s before, live preview on the MV canvas; save writes `lyrics.lrc` + `timing.json` + `mv.json` with backups in `.dsh-mv-backup\` (10 kept).
- New Host calls (34 in total): `lyricsLookup`, `engineInfo`, `engineProbe`, `engineInstall`, `engineModel`, `engineTranscribe`, `jobRead`, `jobCancel`, `packWriteText` (fixed file names only, `mv.json` validated, atomic write + backup), `analysisRead` (fixed analysis files only). New settings: `lrclib`, `enginePython`, `uvPath`, `hfEndpoint`.
- Verified on Windows 11 (RTX 4070 Laptop, 8 GB) with world.execute(me) (212 s) against the 129-line reference timing:
  - Engine install through the Host (uv 0.12, CPython 3.12.14, torch 2.8.0+cu126): ~12 min, 6.4 GB venv; large-v3 download 2.9 GB in ~5 min.
  - Recognition incl. Demucs: GPU large-v3 58 s (separate 6.6 s, whisper 47 s), GPU small 42 s, CPU small 294 s.
  - Reference lyrics aligned by the engine (large-v3): median start error 0.17 s, 89 % within 0.5 s; lines with confidence ≥ 0.5: median 0.13 s, 98 % within 0.5 s. small (GPU): median 0.20 s, 81 % within 0.5 s.
  - LRCLIB synced lyrics alone: median 0.30 s, 92 % within 0.5 s; merged with large-v3: median 0.14 s, 96.5 % within 0.5 s, 8 of 98 lines flagged.

## 0.4.0 — 2026-10-03

- **用 AI 制作新 MV**: a new library card opens a dialog (audio, optional lyrics, title/artist, style notes, save location, default `%LOCALAPPDATA%\dsh-mv\packs`). The panel decodes the audio locally and computes `spectrum.json` (48 bands, 20 fps); the Host creates a new pack folder (never overwriting) with a copy of the audio, the lyrics, a playable `mv.json`, `scenes.js`, `mv.schema.json`, README and `AGENT.md`. Then **在新会话中交给 AI** adds the folder as a Harness workspace, opens a new agent session `MV：<title>` and queues an editable prompt; when the Harness client exposes no session API the dialog offers **复制提示词** / **打开新会话** instead. The pack plays with the generic renderer right away.
- **Agent tools** `mv_pack_validate` and `mv_pack_preview_frame` (registered through the Host `tools` service, read-only): validate a pack (manifest, files, lyric timing, scene script at sample times) and render one frame as text. Setting `agentTools` (default on).
- **Scene scripts**: new canvas renderer `script` (`canvas.script: "scenes.js"`, ≤ 256 KB, no imports). In the panel it runs in a Blob Web Worker with network/storage/worker globals removed, a 40 ms frame budget, a 1.5 s hang timeout and a fallback to the generic renderer with a notice. The Host preview uses `node:vm` (no code generation from strings, no wasm, compile/frame time limits). The template gains `examples/scenes.example.js` and documents the API.
- **Relaxed audio formats**: formats are detected by content (MP4/M4A/MOV/DASH, WebM/MKV incl. video, Ogg Opus/Vorbis/FLAC, FLAC, MP3/MP2, ADTS AAC, WAV codecs, RF64, AIFF, ASF/WMA, CAF, AMR, AC-3, APE, WavPack, AU, MPEG-TS/PS, FLV). Canvas and AI packs accept everything Chromium decodes, including the audio track of video files. **MV terminal converts automatically**: ▶ 播放 transparently turns non-MP3/PCM-WAV audio into a WAV cached by sha256 (progress in the 播放器 card; the manual 转换为 WAV button is gone). Optional **ffmpeg** (setting `ffmpegPath`, `PATH`, or `D:\Program Files\FFmpeg\bin\ffmpeg.exe`) converts formats Chromium cannot decode, only after a confirmation card showing the fixed command (no shell, 10-minute limit).
- **Removed the Rust player** (world-execute-me-ascii-rust): UI, protocol, Host launch code, docs and tests. Saved forms that used it fall back to tui_live.py. NOTICE lists it as related work only.
- New Host calls: `audioRead`, `ffmpegInfo`, `audioConvert`, `aiPackCreate`, `packUploadBegin/Write/Finish` (strict codecs; uploads only into folders created by this Host process, under fixed names).

## 0.3.0 — 2026-10-03

- **Redesigned MV 放映室 panel** as a music-player flow:
  - Library cards: the built-in preset, recent packs (× removes one), 导入 MV 包 and 新建（模板）. This replaces the drop-down and buttons bar.
  - A **正在播放** card with title/artist, a **画布 / 面板终端 / 独立窗口** segmented control (it replaces the two tabs) and one big ▶ Play button.
  - Canvas: media tiles (音频 / 歌词 / 频谱), a player bar (round play/pause, seek with times, chapter, volume + mute, audio sync −/+, keyboard-shortcut popover, fullscreen) and a collapsed 设置 section (font size, subtitle offset, reset offsets).
  - Terminal modes: a 播放器 card with a player switch and automatic, debounced path checks (the 检查路径 button is gone; 重新检查 lives in settings). Problems appear inline with fixes (使用建议的 python.exe, 打开设置, 转换为 WAV…, 不播放声音). First-run guidance asks for the world_execute_me folder (folder picker when available) and fills python.exe. Paths, start, latency, no-audio and font size are in a collapsed 设置 / 高级 section.
  - Credits and the legal notice moved to an ⓘ popover. The version banner became a compact "请完全重启 Harness" pill shown only on a mismatch.
  - Opaque background using Harness design tokens (`--dsw-alias-*`), with light/dark fallbacks (`body[data-ds-dark-theme]`, `prefers-color-scheme`). Consistent spacing, Chinese labels and empty states.
- Unchanged safety: every start still goes through the confirmation card with the exact command (and per-argument list for packs). Pack launches are still bound to the confirmed command, and the Host re-validates everything.
- `tools/ui-preview/`: a mock-Host preview bundle used to render screenshots (not shipped).

## 0.2.1 — 2026-10-03

- Fix (diagnosis): **MV 终端 / 独立窗口 had no sound** with world_execute_me `tui_live.py`. The cause was not ConPTY or Electron; the command line did carry `--audio-file`. The file `song.mp3` is really a DASH-fragmented MP4 with AAC (`ftyp iso5 … dash`, "Packed by Bilibili XCoder"). tui_live.py plays sound through Windows MCI (`open … type mpegvideo`), and MCI cannot open that container (error 277, "初始化 MCI 时发生问题") on any extension. The player printed `no music: …` right before its full-screen picture covered it. Verified under the Harness exe's ConPTY and outside it: a real WAV plays in both, the MP4 fails in both.
- The Host now sniffs the real audio format (first 64 bytes: ID3 / MPEG frame sync / RIFF-WAVE / ftyp / ADTS / Ogg / FLAC) at **检查路径** and on a new `audioProbe` call. The form and both confirmation cards show a red warning when the player cannot play the file (tui_live.py: anything but MP3/WAV; Rust player: anything but MP3). An empty audio field checks the player's default `input\song.mp3`.
- New **转换为 WAV…** button: you pick the same file, the panel decodes it with WebAudio (Chromium decodes AAC/MP4), encodes 16-bit PCM WAV at 44.1 kHz and uploads it in 384 KB chunks (`wavBegin` / `wavWrite` / `wavFinish`) to the plugin-owned cache `%LOCALAPPDATA%\dsh-mv\audio-cache\<source sha256>.wav` (XDG cache elsewhere; newest 6 kept; header and sizes validated; one upload at a time). The audio field is then set to that WAV. This works for the panel and the separate window, and tui_live.py keeps its own audio clock. The user's files and folders are never written.
- README: "No sound?" section and ffmpeg alternative.

## 0.2.0 — 2026-10-03

- **MV packs (`mv.json`, format `dsh-mv-pack` v1)** let you play any song. A pack names your own audio (with an offset), lyrics (LRC/SRT/VTT/lyrics.json, with an offset) and optional spectrum, all as paths relative to the manifest folder (no `..`) or absolute paths. It also chooses a canvas renderer (`generic` or `world-execute-me`) and can declare an external TUI renderer (`terminal`: program + script + argument template). The template documents every field. Validation is strict and reports every problem at once (unknown fields are errors; `x-…` fields are allowed).
  - Argument template placeholders: `{audio}` `{lyrics}` `{spectrum}` `{script}` `{packDir}` `{start}` `{offset}`. `{{`/`}}` are literal braces.
  - Conditional groups: `{ "when": …, "args": [...] }`.
  - One array item becomes one argv element; no shell is involved.
- New **MV 包** bar in the panel:
  - Pack selector: the built-in world.execute(me) preset plus up to 8 recent packs, remembered locally. The last pack reopens.
  - **导入 MV 包…**: native folder chooser, or a pasted path to the folder or to `mv.json`. Importing only reads the manifest.
  - **下载模板…**: writes `dsh-mv-pack-template/` into a folder you choose, never overwriting. It contains `mv.json`, `mv.schema.json`, README en/zh, `lyrics.example.lrc` and `examples/`. A zip download is also offered.
  - Credits, notice and missing-file warnings are shown.
- **Generic canvas renderer**: title card, mirrored 48-band spectrum, current and next lyric (English and Chinese), progress bar, help overlay. Keys 1–5 jump to fifths of the song. Duration comes from `duration` or the audio file.
- Canvas MV plays the active pack. Audio, lyrics and spectrum are read from the Host in 512 KB chunks, only for files the manifest names. The built-in preset keeps its IndexedDB memory; packs never overwrite it. The pack's `audio.offset` applies until you calibrate that file yourself.
- **MV terminal / separate window: new player "MV 包：…"** for packs with a `terminal` section.
  - The Host re-reads `mv.json` at every check and start, and verifies that the program, script and media exist.
  - `.bat`/`.cmd`/`.ps1`/`.vbs`/`.js`/`.lnk` and similar files are refused as programs; on Windows the program must be `.exe`.
  - The confirmation card shows the exact resolved command, each argument and the working directory.
  - Starting requires that confirmed command (`expectDisplay`). If the manifest changed in between, the Host refuses.
  - In cmd.exe (separate window) mode, `% ! " ^ & | < >` and line breaks are refused in any path or argument.
  - Nothing runs on import.
- Fix: the panel's remote API now also exposes `consoleInfo` / `consoleStart` / `consoleStop`. In 0.1.1–0.1.2 the client did not forward them, so the separate-window button could not reach the Host.
- New remote methods `packLoad`, `packRead`, `packTemplate`. New tests for manifest parsing/validation, placeholder expansion, Host loading/chunked reads, launch binding, cmd.exe safety, template writing, zip and the generic renderer. The JSON Schema was also checked against the examples with ajv.

## 0.1.2 — 2026-10-03

- Fix: the **MV 放映室** sidebar entry, main panel and the "打开 MV 放映室" button on the plugin details page never appeared. The client registered them inside `configForms.whileServed(['dsh-mv'])`, but Harness's settings `describe` only lists entries whose Config has `.volatile()` fields. dsh-mv's Config (`canvasFontSize`) has none, so the gate never opened. The registrations are now tied to the client's own lifetime, and the client no longer injects `configForms` / `@deepseek-ai/dsh-client-ui-settings`.
- README: install from npm (`@ljwei-stak/dsh-mv-cli@0.1.2`). Removed the "not published to npm" notes.

## 0.1.1 — 2026-10-03

- MV 终端: new **在独立窗口播放…** button (Windows only) that opens the fixed player (tui_live.py, or the user's world-execute-me-rust.exe) in a real console window via `cmd.exe /d /v:off /s /c "start ..."` with every path quoted (`%` refused). Paths are verified first and a confirmation card shows the exact command. The Host tracks the player's pid; Stop runs `taskkill /T /F` after a pid-reuse check; windows are closed on plugin unload / Harness exit. Disabled with an explanation on other systems.
- New remote methods `consoleInfo` / `consoleStart` / `consoleStop`; tests for quoting, tracking, stop, non-Windows refusal and the gateway boundary.

## 0.1.0 — 2026-10-03

- First version (local archive only).
- Canvas MV: JS port of world.execute-me-ascii `Film.render` / `scenes.py` (with the author's permission), canvas grid renderer with the original 256-colour palette, `<audio>` master clock, AnalyserNode or `spectrum.json` bands, LRC / SRT / `lyrics.json` loaders, per-sha256 audio and subtitle offsets with a measured table of known encodes, IndexedDB memory of the last files, keyboard controls, help overlay, fullscreen, silent mode.
- MV terminal: fixed-launch PTY sessions for world_execute_me `tui_live.py` or a user-supplied world-execute-me-ascii-rust binary; path checks, confirmation card with the exact command, xterm.js with WebGL/DOM, long-poll transport, resize, stop, orphan cleanup.
- Host/client version banner; tests for protocol, gateway boundary, Cordis inject, client loader and frame parity with the original renderer.
