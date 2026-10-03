# Changelog

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
