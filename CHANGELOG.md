# Changelog

## 0.9.1 — 2026-10-04

- **工坊安装位置可以更改 / choose where workshop packs are installed**: the 创意工坊 page now shows the install folder with **打开文件夹**, **更改…** and **恢复默认**. Type any full path, including other drives (`F:\MV\workshop`, `D:\dsh-mv`) or a UNC share; the Host normalises it (forward slashes, quotes and a bare `F:` are fine), refuses relative paths, `..`, reserved names (CON, NUL…) and invalid characters, creates the folder and writes a test file before switching, with a readable reason when it cannot (no such drive, no write permission, read-only disk, a file in the way). After a change you choose **移动到新位置** (each pack is copied, every file checked against the sha256 recorded at install, then the old copy is deleted; progress per pack, failures listed and their originals kept) or **留在原处** (old packs stay in the library and keep working; the page offers to move them later). Library entries and the open pack follow moved packs. The choice is stored by the Host in `%LOCALAPPDATA%\dsh-mv\settings.json` (not in the browser), so it survives panel reloads, skins and devices sharing the Host; the new plugin config field **`workshopDir`** sets the default folder (the panel setting wins). New Host calls `workshopDirInfo`, `workshopDirSet`, `workshopDirMove`, `workshopDirOpen` (31 in total); 打开文件夹 runs `explorer.exe <folder>` without a shell.
  创意工坊页底部新增「安装位置」：显示当前文件夹，可打开、更改（支持其他磁盘如 F:\，先检查能否写入）或恢复默认；更改后可选择把已安装的包移动过去（复制并校验 sha256 后再删除旧文件，显示进度和失败原因）或留在原处（曲库照常能找到）。设置保存在插件后台的 `%LOCALAPPDATA%\dsh-mv\settings.json`，插件配置里也可用 `workshopDir` 设定默认位置。
- **Pixel scene scripts / 像素场景脚本** (`canvas.output: "pixels"`, `canvas.size: [w, h]`, 160×90 – 1920×1080, default 1280×720): a script may define `paint(g, t, w, h, ctx)` and draw on a 2D `OffscreenCanvas` inside the same sandboxed Web Worker (no network, DOM, storage, fonts or WebGL — `getContext` gives only `'2d'`); frames are sent back as ImageBitmaps and letterboxed on the stage. Budget 100 ms per frame. The agent tool `mv_pack_preview_frame` and the workshop CI check pixel scenes against a recording stand-in canvas (an empty frame is reported).
- **Scene assets / 场景资源**: script scenes now receive `canvas.assets` in `setup(info)` as `info.assets` (JSON parsed, shards merged; PNG / WebP as ImageBitmap).
- **`requires`**: packs that need a newer plugin carry `x-dsh-mv-workshop.requires` (pixel scenes and asset-reading scripts → `0.9.1`, computed automatically), also in `index.json`; the workshop shows **需要插件 vX+** and disables install / update on older clients.
- **Two new workshop packs / 两个新的工坊包** (ported from MIT-licensed projects, both need 0.9.1, no audio and no lyric text):
  - [`world-execute-me-wallpaper`](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me-wallpaper) — the world.execute(me) wallpaper MV by [seasnakes/world.execute-me-wallpaper](https://github.com/seasnakes/world.execute-me-wallpaper) (MIT), its canvas scenes running as a pixel scene at 1920×1080, synced by the original BPM grid and sections; the lyric card shows *your* lyrics. Bring your own copy of Mili's song.
  - [`polytech-tree`](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/polytech-tree) — the tour of [secwind7/polytech-tree](https://github.com/secwind7/polytech-tree) (code MIT, data CC BY 4.0; only the structured fields are used, not the CC BY-SA descriptions): 3862 technologies in 11 eras, revealed year by year as the camera rises. Not a song — play silently or with any music.
- Tests: pixel worker and host checks, `canvas.output` / `size` validation, `requires` / too-old detection, scene asset merging, both ports build and pass the workshop rules and the sandbox, install-folder validation (drive letters, UNC, errors), change / keep / move / reset / uninstall across folders, settings persistence and library relocation.

## 0.9.0 — 2026-10-04

**Breaking: the plugin no longer bundles any MV. 插件不再内置任何 MV。**

- **Presets moved to 创意工坊 / 预设移到创意工坊**: the two built-in world.execute(me) presets are now workshop packs in [Alice-Marx/dsh-mv-workshop](https://github.com/Alice-Marx/dsh-mv-workshop), each under its own licence and each linking its original work:
  - [`world-execute-me`](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me) — the ASCII scenes, original [yym8224961/world.execute-me-ascii](https://github.com/yym8224961/world.execute-me-ascii) (used with the author's permission, not open source). The port now runs as a sandboxed scene script (`renderer: "script"`, `scenes.js` bundled by `presets/build-workshop-packs.mjs`; frames identical to the former built-in), with the 5 chapters as sections (keys 1–5).
  - [`world-execute-me-dsh-pv`](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me-dsh-pv) — the dsh PV, original [MisakaZentai/world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv): recorded data (MIT, sharded into ≤ 512 KB files) and whale-girl art (CC BY-NC-SA 4.0) → pack licence `CC-BY-NC-SA-4.0`. The dsh-pv renderer itself (MIT) stays in the plugin.
  Neither pack contains audio or lyric text; both ask you to bring your own audio (lyrics optional).
  以前内置的 world.execute(me) ASCII 场景和 dsh PV 改为创意工坊包，各自标明原作仓库和许可，都不含音频和歌词。
- **Empty library → 创意工坊**: with no packs the library shows an 打开创意工坊 call-to-action and one-click 一键安装 for both packs (download, sha256 check, open). The workshop shows each pack's original-work link (**原作**, from the new `x-dsh-mv-workshop.source` field, also in `index.json`) on the card and in the details, in all skins; the About popover links both originals.
  曲库为空时显示「打开创意工坊」和两个包的一键安装；工坊卡片和详情里显示「原作」链接。
- **Migration from 0.8.x / 迁移**: if a former preset (`builtin:world-execute-me`, `builtin:dsh-pv`) was selected, the panel shows "已移到创意工坊" with an install button; once installed, the audio, lyrics and spectrum you picked for the built-in preset are reused automatically. Other packs and settings are unchanged.
  如果之前选的是内置预设，面板提示它已移到创意工坊并给出安装按钮；安装后自动沿用之前选过的音频和歌词。
- **MV packs: `canvas.assets`** — renderer data files declared in `mv.json` (name → relative `.json` / `.webp` / `.png` path, or a list of JSON shards merged in order; up to 32 assets, 16 parts, 8 MB each), read through `packRead` with the new role `asset` (only files the manifest names). Used by `renderer: "dsh-pv"`. The `renderer: "world-execute-me"` value still parses but is no longer built in: such packs fall back to the generic renderer with a warning, and the workshop rejects it.
- **Workshop limits**: a pack may now be up to 8 MB (was 4 MB; single files stay ≤ 512 KB). Clients older than 0.9.0 cannot install the dsh PV pack (too large for them) — they still have the built-in preset.
- **Licence / 许可**: the npm package is now **MIT** only (was `(MIT AND CC-BY-NC-SA-4.0)`): no artwork, no recorded PV data and no ported world.execute-me-ascii code are in it. Those sources live in the repository under `presets/` (excluded from the MIT licence, see LICENSE and NOTICE.md) and are published only through the workshop packs.
  npm 包现在是纯 MIT：不含立绘、PV 数据和 world.execute-me-ascii 的移植代码。
- **Removed**: the `dshpvAsset` Host call (27 Host calls now), `.dsh-plugin/assets/`, the built-in Film / Canvas port and the template's preset examples (`examples/world-execute-me.mv.json`, `examples/dsh-pv.mv.json`). The generic and script renderers draw on a new MIT grid (`client/mv/grid.mjs`); the generic ready screen uses a letter-spaced title. `client.js` 625 KB.
- Tests: the bundled `scenes.js` passes the workshop safety checks and the host sandbox and draws exactly what the original Film draws; `canvas.assets` parsing and `packRead` asset reads through the gateway (sharded, chunked); JSON sharding round-trips the dsh PV data; the build output passes workshop validation with the source links; preset migration helpers; the npm `files` list contains no assets.

## 0.8.3 — 2026-10-04

- **曲库可收起 / collapsible library**: a chevron on the 曲库 header collapses the library to the header, the song count and the current song's row (playing indicator, play / pause, remove), in list and grid view and in every skin. The state is stored locally (`dsh-mv.library.collapsed.v1`); the sidebar / tab 曲库 entry expands it again.
  曲库标题左侧新增折叠箭头：收起后只显示标题、数量和正在播放的那一首；状态保存在本机，三套外观、列表和网格都适用。

## 0.8.2 — 2026-10-04

- **曲库列表视图 / library list view** (new default): compact rows with a small cover, title, artist, type badge (内置预设 / 画布预设 / MV 包 / 创意工坊), duration when known, a playing indicator, and row actions (play / pause the current song, switch to another, remove from the library). The 创意工坊 / 用 AI 制作新 MV / 导入 / 新建（模板） tiles become a compact toolbar. A 列表 / 网格 toggle next to the 曲库 header switches back to cover cards; the choice is stored locally (`dsh-mv.library.view.v1`). Styled per skin: Harness cards, a music-app track list (A), an `ls -l`-style monospace table (B); works in light / dark and with see-through wallpaper themes, and collapses columns in narrow panes. The library now keeps up to 50 packs (was 8); pack durations are remembered for the list.
  曲库默认改为紧凑列表（小封面、标题、歌手、类型、时长、正在播放标记、行内播放和移除），工坊 / AI / 导入 / 模板变成一排小按钮；「列表 / 网格」可切换并保存在本机。曲库最多保留 50 首。

## 0.8.1 — 2026-10-04

- **Fix: the panel could not scroll in Harness** (content below the MV canvas unreachable, and the header with the 外观 button could disappear). Harness hosts plugin panels in a centre column that is `display:flex; flex-direction:column; overflow:hidden`; the panel root grew to the column height with its content overflowing, so the wheel did nothing, and `focus()` / `scrollIntoView()` (stage focus, calibration line follow) scrolled the hidden column instead, pushing the header out of view with no way back. The panel root is now its own scroll container (`flex: 1 1 auto; min-height: 0; height: 100%; overflow-y: auto`), is pinned to the clipping ancestor if a host wraps it in an unsized block, and resets programmatic scrolls of that ancestor. Sticky sidebar / player bar / tmux bar / status line now stick inside the panel in all skins. Wheel over the MV canvas scrolls the panel.
  修复：在 Harness 里面板无法滚动、画面下方内容够不到、顶部「外观」按钮消失。面板现在自己滚动，三套外观都适用。
- Preview: `?host=1|wrap|art` mirrors the Harness frame; `tools/ui-preview/scroll-check.mjs` checks wheel / bottom / back-to-top in every skin.

## 0.8.0 — 2026-10-04

- **Skins / 外观**: three user-selectable panel skins, picked from **外观** in the panel header (top right, next to ⓘ) and stored locally (`dsh-mv.skin.v1`). Each skin changes structure as well as style; every feature works the same in all three, and switching skins never interrupts playback.
  - **Harness 原生** (default): Fluent cards with soft shadows, blue accent, workshop details drawer; follows the Harness light/dark theme and its design tokens.
  - **现代音乐应用**: left sidebar navigation (曲库 / 正在播放 / 创意工坊 / AI 制作 / 歌词校准) with a recent list, cover grid library, blurred-cover now-playing hero, and a page-wide bottom player bar (cover thumb, title, −5 s / play / +5 s, progress, fullscreen). Dark by default; collapses to an icon rail in narrow panes.
  - **终端 / 黑客**: tmux-style window list on top and a status line at the bottom (play state, title, ASCII progress, time, clock), monospace, neon green + amber, CRT scanlines over the UI (never over the MV canvas). Dark by default; light = paper terminal.
  Each skin remembers its own mode (跟随 Harness / 系统 · 浅色 · 深色).
- **Fixes**: workshop file list no longer overflows (path ellipsis, size and sha256 columns stay readable); the terminal skin keeps the calibration view compact; the calibration waveform redraws immediately when the skin or theme changes.
- 新增三套可切换外观：Harness 原生（默认，跟随 Harness 明暗）、现代音乐应用（侧边栏导航、封面网格、模糊封面、底部播放条）和终端（tmux 标签栏和状态栏、CRT 扫描线不再盖住画面）。在面板右上角「外观」里选择，各自记住浅色或深色，只保存在本机；切换外观不会打断播放。

## 0.7.0 — 2026-10-04

- **Template upgrade / 模板升级**: the template and every AI pack now include prompt templates in Chinese and English (`prompts/{zh,en}/01-creative-brief`, `02-storyboard`, `03-scene-script-guide`, `04-qa-checklist`, `05-iteration`), wired into `AGENT.md` and the 在新会话中交给 AI prompt; seven commented example scene modules adapted from world-execute-me-dsh-pv (MIT, © 2026 MisakaZentai: chat window, heartbeat, ops ticker, stdout token bar, EXECUTION split, whale-fall, post effects; no artwork) and a full multi-section `examples/rich-pack` with placeholder lyrics and no audio. New scene context: `ctx.section` / `ctx.sections`, `ctx.beat` (`canvas.bpm`, `canvas.beatOffset`), `ctx.lyric.words` / `word` / `progress` (enhanced LRC word stamps). The template is generated into `mv-template-assets.gen.mjs` (`scripts/gen-template.mjs`).
  模板新增中英文提示词（创意、分镜、脚本指南、自查清单、迭代）、七个示例场景模块和完整示例包；场景 ctx 新增段落、节拍和逐词信息。
- **创意工坊 / MV workshop**: a GitHub-based community gallery ([Alice-Marx/dsh-mv-workshop](https://github.com/Alice-Marx/dsh-mv-workshop), CI-validated packs and generated `index.json`). In the library: browse / search / filter, covers, details, one-click install into `%LOCALAPPDATA%\dsh-mv\workshop` (download at the index commit, sha256 check, re-validation, atomic install), update detection, uninstall, trust note. Installed packs play with your own audio and lyrics (remembered per pack), with a duration + coarse energy fingerprint check and a mismatch warning; `lyrics.timing.json` retimes your lyrics by line hash. **发布到工坊…** validates, strips audio / spectrum / lyric text, writes cover, README and timing, packages the folder and, after you confirm, opens GitHub's upload page (fork & PR) in the browser; nothing is submitted automatically. Device-flow sign-in was not added (needs an OAuth app client id).
  新增创意工坊：浏览、安装、更新、卸载社区 MV 包，用自己的音频播放并检查是否匹配；发布时去掉音频和歌词文本，确认后在浏览器里提交 PR。
- New Host calls (28 in total): `workshopIndex`, `workshopCover`, `workshopInstall`, `workshopUninstall`, `workshopInstalled`, `workshopPublish`. New pack file role `timing`. Shared rules in `.dsh-plugin/shared/mv-workshop.mjs` are vendored by the workshop CI.
- Tests: new `template.test.mjs` (every example runs in the sandbox and is deterministic, generator up to date, rich pack valid, ctx words / section / beat, prompt wiring) and `workshop.test.mjs` (validation rules, script safety, timing without text, index parsing, fingerprints, install with sha256 mismatch / path traversal, publish stripping); gateway / loader tests updated.

## 0.6.0 — 2026-10-04

- **New built-in canvas preset "world.execute(me); dsh PV" / 新的内置画布预设**: a real-time JavaScript port of [MisakaZentai/world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv) (commit a4dd0f7, MIT). 97 shots / 10 chapters replayed from keyframes of upstream's recorded draw calls (`.dsh-plugin/assets/dsh-pv/`: `timeline.json`, `chat.json`, `band.json`), with decode-typing, the natively redrawn DeepSeek chat window, a heartbeat driven by the live audio, the ops ticker, the stdout token band, the EXECUTION split screen and the whale-fall finale, plus trails / bloom / scanlines / vignette. Synced to your own audio; your own LRC is matched line by line by sha256 for the PV's per-word timing (fallback: your file's line times). New library card, chapter chip and 1–5 keys; `canvas.renderer: "dsh-pv"` for packs; new Host call `dshpvAsset` (named files only, 1 MiB chunks).
  曲库新增「world.execute(me); dsh PV」卡片：按你的音频实时渲染 PV，用你的 LRC 按 sha256 匹配逐词时间（匹配不到则按行显示）。
- **Licensing / 许可**: the package now includes upstream's whale-girl art (`.dsh-plugin/assets/dsh-pv-art/`, 9 WebP images downscaled to 200×360) under **CC BY-NC-SA 4.0**, with the full licence text, the attribution chain (溟月 © 上善无形 → ZipZipPipe, AI-generated → Small-tailqwq/dsh-deep-whale → dsh-whale-galgame → MisakaZentai) and the changes. `package.json` licence is now `(MIT AND CC-BY-NC-SA-4.0)`: the package is not purely MIT; deleting that folder gives an MIT-only build (placeholder silhouette). No song, lyric text, fonts or DeepSeek frontend files are included; the data stores lyrics only as sha256 hashes and times.
  包内附带 CC BY-NC-SA 4.0 的鲸鱼娘立绘，整个包不再是纯 MIT；不含歌曲、歌词文字、字体和 DeepSeek 前端文件。
- **Removed 面板终端 and 独立窗口 / 删除面板终端与独立窗口**: the panel terminal (node-pty / xterm.js), the separate console window, the tui_live.py integration, the automatic WAV conversion for MCI, their Host calls (`terminal*`, `console*`, `audioProbe`, `wav*`) and their settings UI. The play button is just **▶ 播放**. A `terminal` section in `mv.json` is now ignored with a warning instead of being validated or run. ffmpeg stays only as the confirmed decode fallback for the canvas. No native dependencies remain; `client.js` shrinks from 1.2 MB to 0.56 MB; Host calls 34 → 22.
- Tests: new `dshpv.test.mjs` (asset whitelist and chunking, licence files, no lyric text in the data, band matching / typing / tokens, timeline, chat, a full-film smoke render); terminal / console / pty tests removed; gateway / pack / loader tests updated.

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
