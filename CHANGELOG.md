# Changelog

## 0.1.0 — 2026-10-03

- First version (local archive, not published to npm).
- Canvas MV: JS port of world.execute-me-ascii `Film.render` / `scenes.py` (with the author's permission), canvas grid renderer with the original 256-colour palette, `<audio>` master clock, AnalyserNode or `spectrum.json` bands, LRC / SRT / `lyrics.json` loaders, per-sha256 audio and subtitle offsets with a measured table of known encodes, IndexedDB memory of the last files, keyboard controls, help overlay, fullscreen, silent mode.
- MV terminal: fixed-launch PTY sessions for world_execute_me `tui_live.py` or a user-supplied world-execute-me-ascii-rust binary; path checks, confirmation card with the exact command, xterm.js with WebGL/DOM, long-poll transport, resize, stop, orphan cleanup.
- Host/client version banner; tests for protocol, gateway boundary, Cordis inject, client loader and frame parity with the original renderer.
