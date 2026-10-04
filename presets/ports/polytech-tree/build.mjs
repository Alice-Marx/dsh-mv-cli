#!/usr/bin/env node
// Builds the workshop pack "polytech-tree" from a checkout of https://github.com/secwind7/polytech-tree
// (code MIT; data/ structured fields CC BY 4.0, Chinese `desc` summaries CC BY-SA 4.0 — NOT used here).
//   node presets/ports/polytech-tree/build.mjs <checkout> <out-dir> [--cover file.png]
// The tower layout (src/layout.ts) and the tour schedule (src/tour.ts) are ported to JS below and run
// once at build time; the pack carries the result (positions, reveal times, edges) as canvas.assets and
// a pixel scene script (scenes.js) that draws the top-down tour the original renders with Three.js.
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const [src, out] = process.argv.slice(2)
const coverAt = process.argv.indexOf('--cover')
const cover = coverAt > 0 ? process.argv[coverAt + 1] : null
if (!src || !out) { console.error('usage: build.mjs <checkout> <out-dir> [--cover png]'); process.exit(2) }
const json = f => JSON.parse(readFileSync(join(src, f), 'utf8'))
const ID = 'polytech-tree', REPO = 'https://github.com/secwind7/polytech-tree', COMMIT = process.env.SRC_COMMIT || ''

// ---- data.ts (only structured fields: CC BY 4.0) -------------------------------------------
const eras = [...json('data/eras.json')].sort((a, b) => a.order - b.order)
const categories = json('data/categories.json')
const eraIndex = new Map(eras.map((e, i) => [e.id, i])), catIndex = new Map(categories.map((c, i) => [c.id, i]))
const techs = json('data/techs.json').map(t => ({ id: t.id, name: t.name || t.nameEn, nameEn: t.nameEn, year: t.year, era: eraIndex.get(t.era) ?? 0, category: catIndex.get(t.category) ?? 0, importance: t.importance, prereqs: t.prereqs ?? [] }))
const ERA_COUNT = eras.length, CATEGORY_COUNT = categories.length

// ---- layout.ts (port) ------------------------------------------------------------------------
const BASE_RADIUS = 42, RADIUS_EXPONENT = 0.65, INNER_RATIO = 0.28, SECTOR_FILL = 0.84, SECTOR_FILL_TARGET = 0.42
const SECTOR_UNIT_AREA = Math.PI * (1 - INNER_RATIO ** 2)
const importanceScale = imp => 1.9 - (imp - 1) * 0.35
const geomRadius = imp => (Math.round(imp) <= 1 ? 1.5 * 1.4 : 1.5)
function mulberry32(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
function layoutTower(nodes) {
  const rand = mulberry32(9917)
  const counts = new Array(ERA_COUNT).fill(0); nodes.forEach(n => counts[n.era]++)
  const avgCount = nodes.length / ERA_COUNT
  const buckets = new Map()
  nodes.forEach(n => { const k = `${n.era}:${n.category}`; const a = buckets.get(k); if (a) a.push(n); else buckets.set(k, [n]) })
  const slices = []
  for (let era = 0; era < ERA_COUNT; era++) { const s = new Array(CATEGORY_COUNT).fill(0); for (let c = 0; c < CATEGORY_COUNT; c++) s[c] = counts[era] ? (buckets.get(`${era}:${c}`)?.length ?? 0) / counts[era] : 0; slices.push(s) }
  const eraRadii = counts.map((c, era) => {
    let peak = 0
    for (let cat = 0; cat < CATEGORY_COUNT; cat++) {
      const slice = slices[era][cat]; if (slice <= 0) continue
      let demand = 0
      for (const n of buckets.get(`${era}:${cat}`) ?? []) { const r = geomRadius(n.importance) * importanceScale(n.importance); demand += Math.PI * (r * 1.15) ** 2 }
      peak = Math.max(peak, demand / (slice * SECTOR_FILL))
    }
    return Math.max(BASE_RADIUS * Math.pow(c / avgCount, RADIUS_EXPONENT), Math.sqrt(peak / (SECTOR_UNIT_AREA * SECTOR_FILL_TARGET)))
  })
  const eraGaps = counts.map(c => Math.min(42, 22 + c * 0.08))
  const eraY = []; let acc = 0
  for (let e = 0; e < ERA_COUNT; e++) { eraY.push(acc); acc += eraGaps[e] }
  const placed = [], layer = Array.from({ length: ERA_COUNT }, () => [])
  for (let era = 0; era < ERA_COUNT; era++) {
    const outerR = eraRadii[era], innerR = Math.max(outerR * INNER_RATIO, 5), y = eraY[era]
    let cum = 0
    for (let cat = 0; cat < CATEGORY_COUNT; cat++) {
      const list = buckets.get(`${era}:${cat}`) ?? []
      const slice = slices[era][cat] * Math.PI * 2, start = cum + slice * 0.08, width = slice * SECTOR_FILL
      cum += slice
      for (const n of list) {
        const r = innerR + (outerR - innerR) * Math.sqrt(rand()), theta = start + width * rand()
        const scale = importanceScale(n.importance)
        const ax = [rand() - 0.5, rand() - 0.5, rand() - 0.5]
        const p = { node: n, x: Math.cos(theta) * r, y, z: Math.sin(theta) * r, scale, spin: 0.08 + rand() * 0.22, phase: rand() * Math.PI * 2, axis: ax }
        placed.push(p); layer[era].push(p)
      }
    }
  }
  for (let era = 0; era < ERA_COUNT; era++) {
    const arr = layer[era], spread = 1 + counts[era] / 500
    for (let iter = 0; iter < 16; iter++) for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
      const a = arr[i], b = arr[j], dx = b.x - a.x, dz = b.z - a.z, dist = Math.hypot(dx, dz)
      const min = ((geomRadius(a.node.importance) * a.scale + geomRadius(b.node.importance) * b.scale) * 1.15 + 0.4) * spread
      if (dist < min && dist > 1e-4) { const push = (min - dist) / 2, nx = dx / dist, nz = dz / dist; a.x -= nx * push; a.z -= nz * push; b.x += nx * push; b.z += nz * push }
      else if (dist <= 1e-4) { a.x += (rand() - 0.5) * 0.5; a.z += (rand() - 0.5) * 0.5 }
    }
  }
  return { placed, eraRadii, eraY }
}

// ---- tour.ts (port: schedule) ----------------------------------------------------------------
const BLEND = 2, OUTRO = 5, MIN_DUR = 10, MAX_DUR = 30
function tourPlan(placed) {
  const counts = new Array(ERA_COUNT).fill(0); placed.forEach(p => counts[p.node.era]++)
  const present = counts.filter(c => c > 0), nMin = Math.min(...present), nMax = Math.max(...present)
  const windows = []; let cursor = BLEND
  for (let e = 0; e < ERA_COUNT; e++) {
    const n = counts[e], dur = n === 0 ? 0 : nMax === nMin ? MIN_DUR : MIN_DUR + (MAX_DUR - MIN_DUR) * (n - nMin) / (nMax - nMin)
    windows.push({ start: cursor, dur, count: n }); cursor += dur
  }
  const revealAt = new Array(placed.length).fill(Infinity)
  const byEra = Array.from({ length: ERA_COUNT }, () => [])
  placed.forEach((p, i) => byEra[p.node.era].push(i))
  byEra.forEach(list => list.sort((a, b) => placed[a].node.year - placed[b].node.year || a - b))
  byEra.forEach((list, e) => { const { start, dur } = windows[e]; list.forEach((idx, k) => { revealAt[idx] = start + dur * (k + 0.5) / list.length }) })
  return { windows, revealAt, total: cursor + OUTRO }
}

const { placed, eraRadii, eraY } = layoutTower(techs)
const plan = tourPlan(placed)
// edges.ts: prereq → node, arrival = target reveal, crawl compressed to ≤ 1.6 s
const idx = new Map(placed.map((p, i) => [p.node.id, i]))
const edges = []
placed.forEach((p, to) => { for (const id of p.node.prereqs) { const from = idx.get(id); if (from === undefined) continue; const arrive = plan.revealAt[to]; const span = Math.max(0, Math.min(arrive - plan.revealAt[from], 1.6)); edges.push([from, to, r3(arrive - span), r3(span)]) } })
function r3(v) { return Math.round(v * 1000) / 1000 }
const r2 = v => Math.round(v * 100) / 100

rmSync(out, { recursive: true, force: true })
mkdirSync(join(out, 'data'), { recursive: true })
const nodesOut = placed.map(p => [r2(p.x), r2(p.y), r2(p.z), p.node.category, p.node.importance, 0, r2(p.spin), r2(p.phase)])
// faster revealAt lookup
placed.forEach((p, i) => { nodesOut[i][5] = r3(plan.revealAt[i]) })
const half = Math.ceil(placed.length / 2)
writeFileSync(join(out, 'data', 'nodes-1.json'), JSON.stringify({ nodes: nodesOut.slice(0, half), names: placed.slice(0, half).map(p => p.node.name) }))
writeFileSync(join(out, 'data', 'nodes-2.json'), JSON.stringify({ nodes: nodesOut.slice(half), names: placed.slice(half).map(p => p.node.name) }))
writeFileSync(join(out, 'data', 'edges.json'), JSON.stringify({ edges }))
writeFileSync(join(out, 'data', 'tower.json'), JSON.stringify({
  eras: eras.map((e, i) => ({ name: e.name, nameEn: e.nameEn, y: r2(eraY[i]), r: r2(eraRadii[i]), start: r3(plan.windows[i].start), dur: r3(plan.windows[i].dur), count: plan.windows[i].count })),
  categories: categories.map(c => ({ name: c.name, nameEn: c.nameEn, color: c.color })), total: r3(plan.total),
}))
writeFileSync(join(out, 'data', 'NOTICE.md'), `# data/

Derived from \`data/techs.json\`, \`data/eras.json\` and \`data/categories.json\` of
[Polytech Tree](${REPO})${COMMIT ? ` (commit \`${COMMIT.slice(0, 12)}\`)` : ''} — structured fields (name, nameEn, year, era,
category, importance, prereqs, colours), licensed **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/).
Attribution: *Polytech Tree (github.com/secwind7/polytech-tree), CC BY 4.0.*

**Changes:** the fields above were reduced to what the tour draws; node positions, reveal times and edge
timings were computed from them with the original layout / tour algorithms (MIT) and stored here
(\`nodes-*.json\`: [x, y, z, category, importance, revealAt, spin, phase] + names; \`edges.json\`: [from, to, start, duration];
\`tower.json\`: eras and categories). The Chinese \`desc\` summaries (CC BY-SA 4.0) are **not** included.
`)
const script = readFileSync(join(here, 'scene.js'), 'utf8').replace('/*COMMIT*/', COMMIT ? ` (commit ${COMMIT.slice(0, 12)})` : '')
writeFileSync(join(out, 'scenes.js'), script)
const duration = r3(plan.total)
const sections = eras.map((e, i) => ({ kind: 'era', label: e.name, start: r3(Math.max(0, plan.windows[i].start)), end: r3(plan.windows[i].start + plan.windows[i].dur) })).filter(s => s.end > s.start)
const manifest = {
  $schema: './mv.schema.json', format: 'dsh-mv-pack', version: 1,
  title: 'Polytech Tree · 人类科技树漫游', artist: 'secwind7',
  credits: ['Polytech Tree — secwind (secwind7), code MIT, data CC BY 4.0: https://github.com/secwind7/polytech-tree', 'dsh-mv adaptation (tour as a pixel scene): Alice-Marx'],
  notice: 'No music: play it silently or with any song you like (about 3 minutes). The tour follows the original\'s schedule; music only adds a little glow.',
  duration,
  canvas: { renderer: 'script', script: 'scenes.js', output: 'pixels', size: [1280, 720], assets: { tower: 'data/tower.json', nodes: ['data/nodes-1.json', 'data/nodes-2.json'], edges: 'data/edges.json' } },
  'x-dsh-mv-ai': { sections },
  'x-dsh-mv-workshop': {
    id: ID, version: '1.0.0', license: 'MIT AND CC-BY-4.0', author: 'Alice-Marx',
    description: `Polytech Tree 的「漫游动画」：${placed.length} 项人类科技按时代分层、按领域着色，镜头沿塔轴俯视上升，科技按年代逐个显现、前置连线爬向它。原作是 Three.js 3D，这里移植为像素场景。没有配乐，可以静音播放或配任意音乐。需要插件 0.9.1+。`,
    tags: ['tech-tree', 'visualization', 'history', 'pixels'],
    source: REPO, homepage: `https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/${ID}`, requires: '0.9.1',
  },
}
writeFileSync(join(out, 'mv.json'), `${JSON.stringify(manifest, null, 2)}\n`)
const lic = readFileSync(join(src, 'LICENSE'), 'utf8')
writeFileSync(join(out, 'LICENSE.txt'), `${lic.split('\n---')[0].trim()}\n`)
writeFileSync(join(out, 'NOTICE.md'), `# NOTICE — Polytech Tree · 人类科技树漫游

- **Original / 原作:** [secwind7/polytech-tree](${REPO})${COMMIT ? ` (commit \`${COMMIT.slice(0, 12)}\`)` : ''} — 人类科技树 3D 可视化, by secwind.
- **Code** (scenes.js, the ported layout / tour algorithms): MIT, © 2026 secwind (polytech-tree) — see [LICENSE.txt](LICENSE.txt).
  Adapted by Alice-Marx (2026-10): the Three.js tour re-drawn with a 2D canvas (top-down perspective projection,
  polygons for the polyhedra), layout and schedule precomputed at build time.
- **Data** (data/): *Polytech Tree (github.com/secwind7/polytech-tree), CC BY 4.0* — https://creativecommons.org/licenses/by/4.0/ .
  Changed: reduced to structured fields and precomputed positions / timings (see data/NOTICE.md). The \`desc\`
  summaries (CC BY-SA 4.0, partly derived from English Wikipedia) are not included.
- No music or lyrics are included or needed.
`)
writeFileSync(join(out, 'README.md'), `# Polytech Tree · 人类科技树漫游

**Original / 原作:** [secwind7/polytech-tree](${REPO}) · code MIT · data CC BY 4.0

把 Polytech Tree 的「▶ 漫游动画」做成 dsh-mv 的像素场景（\`canvas.output: "pixels"\`，需要 dsh-mv-cli **0.9.1** 或更新）：
${placed.length} 项科技、${edges.length} 条前置关系、${ERA_COUNT} 个时代；镜头沿塔轴俯视上升，每个时代按科技数分配 10–30 秒，
科技按年份逐个弹出闪亮，名字停留 2 秒，前置连线在目标显现前 1.6 秒内爬到。全片约 ${Math.round(duration)} 秒。

- 没有配乐：可以不选音频直接播放（静音时钟），也可以配任何你喜欢的歌；有音乐时画面会随响度微微发光。
- 与原作的差别：原作用 Three.js（WebGL）实时渲染 3D 多面体；这里在 2D 画布上做同样的俯视透视投影，多面体画成对应面数的多边形；
  收尾的斜向全景改为拉远俯视；没有悬停、筛选等交互。

See [NOTICE.md](NOTICE.md) for attribution, licences and changes.
`)
if (cover) copyFileSync(cover, join(out, 'cover.png'))
console.log(`wrote ${out}: ${placed.length} nodes, ${edges.length} edges, ${ERA_COUNT} eras, duration ${duration}s`)
