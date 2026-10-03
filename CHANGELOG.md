# Changelog

## 0.1.1 — 2026-10-03

- MV 终端: new **在独立窗口播放…** button (Windows only) that opens the fixed player (tui_live.py, or the user's world-execute-me-rust.exe) in a real console window via `cmd.exe /d /v:off /s /c "start ..."` with every path quoted (`%` refused). Paths are verified first and a confirmation card shows the exact command. The Host tracks the player's pid; Stop runs `taskkill /T /F` after a pid-reuse check; windows are closed on plugin unload / Harness exit. Disabled with an explanation on other systems.
- New remote methods `consoleInfo` / `consoleStart` / `consoleStop`; tests for quoting, tracking, stop, non-Windows refusal and the gateway boundary.

## 0.1.0 — 2026-10-03

- First version (local archive, not published to npm).
- Canvas MV: JS port of world.execute-me-ascii `Film.render` / `scenes.py` (with the author's permission), canvas grid renderer with the original 256-colour palette, `<audio>` master clock, AnalyserNode or `spectrum.json` bands, LRC / SRT / `lyrics.json` loaders, per-sha256 audio and subtitle offsets with a measured table of known encodes, IndexedDB memory of the last files, keyboard controls, help overlay, fullscreen, silent mode.
- MV terminal: fixed-launch PTY sessions for world_execute_me `tui_live.py` or a user-supplied world-execute-me-ascii-rust binary; path checks, confirmation card with the exact command, xterm.js with WebGL/DOM, long-poll transport, resize, stop, orphan cleanup.
- Host/client version banner; tests for protocol, gateway boundary, Cordis inject, client loader and frame parity with the original renderer.
