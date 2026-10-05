# Original Three.js MV adapter

This port uses the original wiers-jack rendering modules, not replacement cubes.
All 12 scenes, 213-second timeline, camera blending and bloom/final shader passes
are retained. Audio, DOM controls and embedded lyric text are stripped; the panel
supplies time and optional user audio/lyrics.

Normal build (install the upstream lockfile dependencies in its checkout first):

```sh
node presets/ports/wiers-jack-three/build.mjs <upstream-checkout> <new-output-dir>
```

Offline build using the original committed app.js dependency blocks and this
repository's esbuild installation (no network or additional dependencies):

```sh
node presets/ports/wiers-jack-three/build.mjs <upstream-checkout> <new-output-dir> --offline-app
```

The builder validates the 12-section registry, Three revision and bundle seams,
refuses an existing output directory and records source/app.js hashes in
source-provenance.json. It produces readable scenes.js under the 2 MiB limit.

Import the resulting mv.json in plugin 0.9.2+. For actual GPU validation:

```sh
node tools/webgl-smoke.mjs <output-dir> --out dist/webgl-smoke
```

Requires Playwright (or DSH_MV_PLAYWRIGHT pointing to its installed directory)
and Chromium/Chrome/Edge. This uses real browser WebGL2, not the Node recording
stand-in. No local server or external network is needed.

For the public workshop pack, the maintainer confirmed direct author contact
and MIT permission on 2026-10-05. Record this grant explicitly:

```sh
node presets/ports/wiers-jack-three/build.mjs <upstream-checkout> <new-output-dir> --offline-app --author-mit-permission --cover <rendered-screenshot.png>
```

The opt-in flag writes the complete MIT grant with copyright wiers-jack,
the adapter MIT grant with copyright Alice-Marx, and the separate Three.js MIT
notice. It records the authorization basis and date in source-provenance.json.
This is a maintainer-confirmed direct author grant, not an upstream LICENSE at
the checked source revision (whose historical package declaration is retained
in provenance). Without the flag, the builder preserves the checkout's original
license status; it never silently relabels upstream code. Do not reuse this
authorization for unrelated source revisions or assets. No music or lyric file
is included; the author grant concerns visual code only.
