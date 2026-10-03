# Visual redesign — step 1: three directions (mockups, not shipped)

Working mockups of 曲库, 正在播放 (live ASCII stage running the template's example scenes, transport, sections, lyrics),
用 AI 制作新 MV (form + stepper), 歌词校准 (waveform, draggable lyric blocks, line list) and 创意工坊 (browse, filters, details).
Each direction supports light and dark.

| | Direction | Best theme |
|---|---|---|
| **A** | Modern music app (Spotify / Apple Music-like): sidebar, big cover grid, blurred-cover hero, Apple-style big lyrics, bottom player bar | dark |
| **B** | Terminal / hacker matching world.execute(me): one monospace family, neon green + amber + red, border-labelled panels, tmux-style tabs and status line, CRT scanlines | dark (light = "paper terminal") |
| **C** | Fluent / Harness-native: DeepSeek Harness `--dsw-*` tokens (with the same values as fallbacks), pivot tabs, soft-shadow cards, InfoBars, side drawer | light |

Packs without a cover get a generated one (gradient + title in A, neon ASCII in B, pastel monogram in C).
Icons: inline SVG subset of [Lucide](https://lucide.dev) (ISC licence), see `icons.jsx`.
Spacing scale 4/8/12/16/24/32/48/64 px (`--s1`…`--s8`, `base.css`); each CSS file states its type scale.

```sh
node tools/ui-preview/make-covers.mjs              # optional: workshop cover PNGs into /tmp/mv-ui-preview/covers
node tools/ui-preview/redesign/build.mjs           # → /tmp/mv-redesign (open index.html?dir=A&screen=now)
node tools/ui-preview/redesign/shoot.mjs [out] [filter]   # needs puppeteer-core + Chrome
python3 tools/ui-preview/redesign/compare.py [out]        # side-by-side images (Pillow)
```

URL parameters: `dir=A|B|C`, `screen=library|now|ai|calib|workshop|wsdetail`, `theme=light|dark`, `t=<seconds>`,
`play=1`, `shot=1` (hides the review switcher in the bottom-right corner).
