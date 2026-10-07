# FrostNova offline workshop adapter

This AGPL-3.0-or-later adapter preserves the pinned original WebGL2/Three.js
main edit rather than converting it to a video. Upstream commit:
`29aefca50e40c14498420e1c6e1f3a1037727e17`.

Copyright (C) 2026 FrostNova; Visuals — Claude Opus 5.5 Max. Worker adaptation
and build tooling Copyright (C) 2026 Alice-Marx, modified 2026-10-07. These
files are excluded from the plugin's MIT license and npm package. Fonts have
separate OFL notices; Mili song text/official translation and Anthropic
trademarks are not licensed by AGPL. No recording is provided or fetched.

## Rebuild

Node 20+ and a Chromium-capable machine are required. Install the pinned
public tools, then bake the OFL inputs and build into new directories:

```sh
npm ci --prefix presets/ports/frostnova-web
npm exec --prefix presets/ports/frostnova-web -- playwright install chromium
node presets/ports/frostnova-web/fonts/build-fonts.mjs --upstream UPSTREAM --extra-fonts presets/ports/frostnova-web/fonts/extra-fonts.json --out NEW_FONTS
node presets/ports/frostnova-web/build.mjs UPSTREAM NEW_PACK NEW_FONTS
```

Use a checkout at the exact commit above. The complete Corresponding Source
archive also supports its included `upstream/` snapshot without Git: the
builder checks every file against `UPSTREAM-FILES.json`. No player/vault
module, audio key, encrypted song part, network font loader or page bootstrap
enters the rendering bundle. The original source quotations remain unchanged
because they form actual code-shaped graphics.

The pack contains all 129 original line indices, word timing, official Chinese
schedule/rules/style, 60-Hz 25-channel analysis, and offline OFL glyph masks.
Only music is supplied by the user. See [fonts/README.md](fonts/README.md)
for documented font compatibility differences and source inputs.

## Verification and source offer

Requires plugin 0.9.7: setup is bounded at 5 seconds, synchronous-generator
preparation at 10 seconds per step, 300 seconds total and 512 steps, and final
output-size synchronous warmup at 20 seconds. Music waits until all stages
finish; pause, changing packs and closing cancel them. Frames requested within
10 seconds after ready have an 8-second deadline; subsequent requests keep the
1.5-second deadline. The deadline and slow-frame classification follow the
request through completion. Async warmup and invalid stage ids are rejected.
The original 2048-square galaxy map and particle counts are unchanged. Cat
surface/light generation yields every 4096 accepted points without changing
typed arrays or the random stream.

`tests/frostnova-builder.test.mjs`, `tests/frostnova-cpu-prewarm.test.mjs` and
`tests/frostnova-fonts.test.mjs` cover quotations, safe formatting, exact CPU
arrays/RNG order, masks, aliases and canvas text behavior.
`tools/frostnova-smoke.mjs PACK UPSTREAM NEW_QA` exercises the production Host
readers, ScriptFilm, Worker watchdog and GPU, including all chapters and seeks.
The plugin's network/font/storage restrictions remain in force.

Use `DSH_MV_GPU_MODE=native` for full hardware-GPU QA. Software rendering may
exceed the unchanged deadlines. The Node recording-only WebGL checker cannot
generate the real glyph pixels used by this film's geometry: it explicitly
returns `requiresBrowserValidation`, never fabricated pixel evidence. The
workshop's maintainer attestation binds every pack byte to the real-browser
report in the complete-source archive. See that archive's README for results.

The free fixed complete-source download is supplied alongside workshop 1.0.1:
https://github.com/Alice-Marx/dsh-mv-workshop/releases/download/world-execute-me-frostnova-1.0.1/20261007_frostnova-corresponding-source-1.0.1.zip

Contains rapid flashing and high-contrast cuts. Do not play if photosensitive.
The song clock begins at zero; the original negative-time warning is retained
in the source but is not inserted into the user's music.
