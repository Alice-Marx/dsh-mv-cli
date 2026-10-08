# Nyankomint offline worker adapter

Pinned original: [Nyankomintsu/world-execute-me-lyric-mv](https://github.com/Nyankomintsu/world-execute-me-lyric-mv/tree/2073b0c88c6fc837482478402a44f101b3b57d6f), commit `2073b0c88c6fc837482478402a44f101b3b57d6f`, original version 4.

This adapter preserves all 87 shots, complete layered Canvas2D/WebGL2 post rendering, eight unmodified original PNG silhouettes, 129 fixed caption lines, beat/onset/spectrum values and the silent 5-second warning before song time zero. It uses no audio/download/DOM/font APIs from inside the scene. The plugin supervisor loads manifest-bound images, data and OFL font binaries before the scene starts.

## Rebuild

Use Node 20+. Install these separate build dependencies with scripts disabled:

```text
npm ci --ignore-scripts --prefix presets/ports/nyankomintsu
node presets/ports/nyankomintsu/build.mjs <pinned-upstream-checkout> <new-pack-directory> <existing-authorised-local-caption-json>
node tools/nyankomintsu-smoke.mjs <pack-directory> <pinned-upstream-checkout> <new-qa-directory>
```

The builder rejects mismatched commits, changed source seams, nonexact lyric alignment and existing output directories. It does not download music or lyrics, run upstream install scripts, copy `.git`/`.claude`, or follow instructions in upstream prompt documents. It copies the exact Fontsource 5.3.0 files and OFL notices (15 Latin faces and CSS slices needed for configured CJK glyphs), and keeps checksums/source provenance. Package prompts are teaching references, not sandbox code.

## Changes and boundaries

- Static section registry instead of browser dynamic imports/fallback sections.
- Manifest data and ImageBitmap inputs instead of fetch/Image/CSS loaders.
- OffscreenCanvas factories; original ImageBitmap dimensions adapted from `naturalWidth/Height` to `width/height`.
- Source silhouette separation/tracing and original per-shot caches prewarmed cooperatively; original drawing/post/math/cues preserved.
- Render exceptions are reported to the supervisor rather than silently replaced by an in-frame error card.
- Output at up to 1920×1080, preserving source virtual 1920×1080 composition; negative preroll time does not shift audio/cues.
- Ordinary JSON numeric shards reconstruct the source analysis exactly.

Code / source project documents: MIT, Copyright (c) 2026 Nyankomint. Adapter: MIT, Copyright 2026 Alice-Marx. Original AI-assisted character art, cover and pictures containing the art: CC BY-NC-SA 4.0. Fonts: OFL 1.1, each copyright/notice retained. Music/lyrics: Mili and respective rights holders, not licensed by MIT/CC/OFL; captions retain their independently declared noncommercial fan-work basis. Claude is an Anthropic trademark. Neither Mili, Anthropic nor the upstream author endorses this adaptation.

The warning is not medical/PSE certification. Upstream approximate flash measurements concern upstream exports; the adapted output requires separate dense flash/frame checks.

Verified 2026-10-08 on native RTX 4070 Laptop / Chrome 154: 395 shot/transition/pause/seek comparisons and 2760 strong-light frames at 60Hz. `DSH_MV_GPU_MODE=native DSH_MV_QA_CONTROL=paired` runs both the unmodified original and a control with **only** DOM canvas factories replaced by OffscreenCanvas; worker/control agree at the strict 2/255 raster bound. Unmodified DOM rendering has separately reported sparse edge/antialias differences (maximum mean 0.01225/255 in the sampled full-size frames), not a pixel-identical claim. PNG decode pixels are identical, and general/red flash statistics agree. No missing shots, external requests or scene fallback; cleanup confirmed.

The static registry defers history.js's seeded roof initializer until after cfg.seed, matching original dynamic-import order. WebGL creation flags are manifest-bound to the original Post flags. Host/CI cannot rasterize real character pixels/fonts: it reports browser validation required, and workshop maintainer evidence binds all 82 pack files to the actual GPU report.
