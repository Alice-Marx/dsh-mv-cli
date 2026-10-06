/**
 * dsh-pv canvas preset: "world.execute(me); dsh PV" played live on a canvas, in time with the user's own audio.
 *
 * Port of MisakaZentai/world-execute-me-dsh-pv (an offline mp4 renderer in Python/PIL), Copyright (c) 2026
 * MisakaZentai, MIT License. The upstream renderer's per-shot draw calls were recorded at 2-6 keyframes per
 * shot (assets/dsh-pv/timeline.json); this module replays them at 1280x720 with the upstream chrome (header,
 * ops ticker, stdout token band), the dsh web window (chat.mjs), the whale-girl art (assets/dsh-pv-art, CC
 * BY-NC-SA 4.0) and a light CRT pass, all driven by the audio clock.
 */
import { chatAt, drawPage, PAGE_W, PAGE_H } from './chat.mjs'
import { attentionTokens, KEYWORDS, lineAt, tokenId, tokenize, typed } from './band.mjs'
import { drawRasterLayer, rasterFrameAt } from './raster.mjs'

export const W = 1280, H = 720
export const DSHPV_DURATION = 211.913
export const DSHPV_CHAPTERS = [
  [0, '00', 'BOOT'], [16.082, '01', 'PRETRAIN'], [44.0, '02', 'SFT'], [58.5, '03', 'RLHF'], [73.5, '04', 'DEPLOY'],
  [103.0, '05', 'USER_LEFT'], [117.85, '06', 'REWARD_HACK'], [147.6, '07', 'EXECUTION'], [176.9, '08', 'EVAL: LOVE'], [193.5, '09', 'WHALE_FALL'],
]
const BG = [4, 7, 15], UI = [200, 214, 234], ERR = [255, 59, 48], ANOM = [255, 204, 0], ME = [120, 148, 255]
const BEAT = 60 / 130, FIRST_BEAT = 0.1587
const SCR = '!<>-_\\/[]{}=+*^?#%$&@01|~:;'
const LEFT = [24, 56, 384, 604], INNER = [3, 9, 3, 3], RIGHT = [392, 44, 1268, 608]
const FONT = [
  'Consolas, "DejaVu Sans Mono", "Cascadia Mono", Menlo, monospace',
  'bold Consolas, "DejaVu Sans Mono", "Cascadia Mono", Menlo, monospace',
  'bold "DshMvPvSpaceMono", "Space Mono", Consolas, "DejaVu Sans Mono", monospace',
  '"DshMvPvAnton", "Anton", Impact, "Arial Narrow Bold", "Arial Black", sans-serif',
  '"Microsoft YaHei", "Noto Sans CJK SC", "PingFang SC", sans-serif',
  '"Segoe UI Symbol", "DejaVu Sans", "Segoe UI", sans-serif',
]
const fontOf = (k, size) => { const f = FONT[k] ?? FONT[0]; return f.startsWith('bold ') ? `bold ${size}px ${f.slice(5)}` : `${size}px ${f}` }
const mix = (c, level, base = BG) => { const l = Math.max(0, Math.min(1, level)); return `rgb(${c.map((v, i) => Math.round(base[i] + (v - base[i]) * l)).join(',')})` }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

export function beatT(i) { return FIRST_BEAT + i * BEAT }
export function pulse(t) {
  const i = Math.floor((t - FIRST_BEAT) / BEAT)
  return t < FIRST_BEAT ? 0 : Math.exp(-(t - beatT(i)) / 0.14)
}
function keyframes(pts, t) {
  if (t <= pts[0][0]) return pts[0][1]
  for (let i = 1; i < pts.length; i++) if (t < pts[i][0]) { const [a, va] = pts[i - 1], [b, vb] = pts[i]; return va + (vb - va) * (t - a) / (b - a) }
  return pts[pts.length - 1][1]
}
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296 } }
export function decode(s, age, r, rate = 45, settle = 0.12) {
  const n = age === null ? s.length : Math.min(s.length, Math.max(0, Math.floor(age * rate)))
  let out = ''
  for (let i = 0; i < n; i++) {
    const ch = s[i]
    out += ch !== ' ' && age !== null && age - i / rate < settle ? SCR[Math.floor(r() * SCR.length)] : ch
  }
  return out
}

function css(hex) {
  const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16), a = parseInt(hex.slice(6, 8), 16) / 255
  return a >= 0.999 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a.toFixed(3)})`
}

/** Prepares timeline.json for drawing: CSS colours, per keyframe the set of texts that are new in it. */
export function prepareTimeline(timeline) {
  const pal = timeline.pal.map(css)
  for (const shot of timeline.shots) {
    let prev = new Set()
    const n = shot.kf.length
    shot.kf.forEach((kf, j) => {
      kf.from = shot.s + (shot.e - shot.s) * j / n
      const keys = new Set()
      kf.fresh = []
      for (const op of kf.o) {
        if (op[0] !== 't') continue
        const key = `${op[1]},${op[2]},${op[6]}`
        keys.add(key)
        kf.fresh.push(!prev.has(key))
      }
      prev = keys
    })
  }
  return { ...timeline, css: pal }
}

export function shotAt(timeline, t) {
  const shots = timeline.shots
  let lo = 0, hi = shots.length - 1
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (shots[mid].s <= t) lo = mid; else hi = mid - 1 }
  return shots[lo]
}
export function keyframeAt(shot, t) {
  const n = shot.kf.length
  const j = clamp(Math.floor((t - shot.s) / Math.max(1e-6, shot.e - shot.s) * n), 0, n - 1)
  return shot.kf[j]
}
export function chapterAt(t) { return DSHPV_CHAPTERS.reduce((cur, c) => (c[0] <= t ? c : cur), DSHPV_CHAPTERS[0]) }

const AVATAR_EXPR = { 'g/shy': 'shy', 'g/starry': 'starry', editing: 'serious', forged: 'exasperated', 'f/red': 'angry', 'f/red_frightened': 'frightened', left: 'confused', lost: 'frightened' }
/** Avatar spec for an upstream avatar file name: { expr, cells (mosaic, 0 = sharp), tint, noise }. */
export function avatarSpec(img, t) {
  const name = String(img ?? '')
  if (name.startsWith('a1_noise')) return { noise: Number(name.slice(8)) || 0 }
  if (name.startsWith('a1_params')) return { expr: 'cheerful', cells: 3 + Math.round(Number(name.slice(9)) / 3), gray: true }
  if (name === 'a1_seed' || name.startsWith('g/seed')) return { seed: true }
  if (name === 'a2/N') return { expr: 'cheerful', cells: 3 + Math.round(7 * (1 - Math.exp(-Math.max(0, t - 16) / 5))), gray: true }
  if (name === 'a3/N') return { expr: 'cheerful', cells: 10 + Math.round(10 * clamp((t - 29.3) / 14.7, 0, 1)) }
  if (name === 'b/N') return { expr: t > 58.5 ? 'starry' : 'cheerful', cells: 20 }
  const m = /(?:^|\/)(?:wide_)?m(\d+)$/.exec(name)
  if (m) return { expr: 'cheerful', cells: Number(m[1]) }
  if (name.includes('draft')) return { expr: 'cheerful', cells: 8, gray: true }
  if (name.startsWith('c/')) return { expr: 'cheerful', prop: name.slice(2) }
  if (name.startsWith('f/')) return { expr: AVATAR_EXPR[name] ?? 'angry', tint: 'red' }
  return { expr: AVATAR_EXPR[name] ?? 'cheerful' }
}

const PROPS = { cat: '🐱', your_cat: '🐈', eggplant: '🍆', tomato: '🍅' }

export class DshPvFilm {
  constructor({ energy = () => 0 } = {}) {
    this.energy = energy
    this.timeline = null; this.chat = null; this.band = null; this.art = {}; this.raster = null
    this.lines = []; this.tokens = null
    this.duration = DSHPV_DURATION
    this.buffer = null; this.page = null; this.trail = null
    this.times = []
    this.status = 'loading'
  }

  setData({ timeline, chat, band, art = {}, raster = null }) {
    this.timeline = prepareTimeline(timeline); this.chat = chat; this.band = band; this.art = art; this.raster = raster
    this.status = 'ready'
  }

  /** lines: the matched band lines (band.mjs matchBand) */
  setLines(lines) {
    this.lines = lines ?? []
    this.tokens = attentionTokens(this.lines)
    this.times = this.lines.map(ln => ln.start)
  }

  ensure(doc = globalThis.document) {
    const make = (w, h) => { if (typeof OffscreenCanvas === 'function') return new OffscreenCanvas(w, h); const c = doc.createElement('canvas'); c.width = w; c.height = h; return c }
    if (!this.buffer) { this.buffer = make(W, H); this.trail = make(W, H); this.page = make(PAGE_W, PAGE_H); this.cell = make(96, 96) }
  }

  /** Draws the frame at t into ctx (a 2D context of any size: the 16:9 picture is letterboxed). */
  draw(target, t, { paused = false, offset = 0 } = {}) {
    this.ensure()
    const ctx = this.buffer.getContext('2d')
    this.frame(ctx, t, offset)
    const tw = target.canvas.width, th = target.canvas.height
    const s = Math.min(tw / W, th / H)
    const dw = Math.round(W * s), dh = Math.round(H * s)
    target.save()
    target.fillStyle = '#000'; target.fillRect(0, 0, tw, th)
    target.imageSmoothingEnabled = true
    target.drawImage(this.buffer, Math.round((tw - dw) / 2), Math.round((th - dh) / 2), dw, dh)
    if (paused) {
      target.fillStyle = 'rgba(4,7,15,0.55)'; target.fillRect((tw - dw) / 2 + dw - 120 * s, (th - dh) / 2 + 8 * s, 108 * s, 26 * s)
      target.fillStyle = mix(UI, 0.85); target.font = fontOf(0, Math.max(9, Math.round(13 * s))); target.textBaseline = 'top'
      target.fillText('❚❚ PAUSED', (tw - dw) / 2 + dw - 112 * s, (th - dh) / 2 + 13 * s)
    }
    target.restore()
  }

  frame(ctx, t, offset = 0) {
    const tl = this.timeline
    ctx.save()
    ctx.textBaseline = 'top'
    ctx.fillStyle = mix(BG, 1); ctx.fillRect(0, 0, W, H)
    if (!tl) {
      ctx.fillStyle = mix(UI, 0.7); ctx.font = fontOf(0, 18)
      ctx.fillText(this.status === 'error' ? 'dsh-pv: 资源加载失败' : 'dsh-pv: 正在加载资源…', 40, 40)
      ctx.restore(); return
    }
    const tc = clamp(t, 0, this.duration - 1e-3)
    const shot = shotAt(tl, tc)
    const kf = keyframeAt(shot, tc)
    const gain = keyframes(tl.uiGain, tc)
    const r = rng(Math.floor(tc * 24) * 7919 + 1)
    const lay = shot.lay?.[0] ?? 'split'
    if (tc >= tl.hardCut) { this.post(ctx, tc, 0.25); ctx.restore(); return }

    drawRasterLayer(ctx, this.raster, tc, 'under')
    this.ops(ctx, kf, tc, r)
    drawRasterLayer(ctx, this.raster, tc, 'over')
    // her art in the shots whose upstream raster layers carried it
    this.art_(ctx, shot, kf, tc, r)
    const chrome = !['fullbleed', 'cinema', 'raw'].includes(lay)
    if (chrome && lay !== 'shell') this.ticker(ctx, shot, tc, gain)
    const lv = kf.lv ?? [1, 1]
    if (lv[1] < 0.999) { ctx.fillStyle = `rgba(4,7,15,${(1 - lv[1]).toFixed(3)})`; ctx.fillRect(RIGHT[0], RIGHT[1], RIGHT[2] - RIGHT[0], RIGHT[3] - RIGHT[1]) }
    if (kf.w) this.window(ctx, kf.w, lv[0], tc, shot)
    this.header(ctx, shot, tc, gain, lay, r)
    this.band_(ctx, tc - offset, gain, chrome, r)
    if (chrome) this.footer(ctx, tc, gain)
    this.post(ctx, tc, 1)
    ctx.restore()
  }

  ops(ctx, kf, t, r) {
    const pal = this.timeline.css
    const age = t - kf.from
    let ti = 0
    for (const op of kf.o) {
      switch (op[0]) {
        case 't': {
          const fresh = kf.fresh[ti++]
          let s = op[6]
          if (s.charCodeAt(0) < 3) s = this.token(s)
          if (fresh) s = decode(s, age, r)
          if (!s) break
          ctx.font = fontOf(op[5], op[3])
          ctx.fillStyle = pal[op[4]] ?? '#fff'
          const anchor = op[7]
          if (anchor) {
            ctx.textAlign = anchor[0] === 'm' ? 'center' : anchor[0] === 'r' ? 'right' : 'left'
            ctx.textBaseline = { m: 'middle', s: 'alphabetic', b: 'bottom', d: 'bottom' }[anchor[1]] ?? 'top'
            ctx.fillText(s, op[1], op[2])
            ctx.textAlign = 'left'; ctx.textBaseline = 'top'
          } else ctx.fillText(s, op[1], op[2])
          break
        }
        case 'r': {
          const [, fill, outline, w, x0, y0, x1, y1] = op
          if (fill >= 0) { ctx.fillStyle = pal[fill]; ctx.fillRect(x0, y0, x1 - x0 + 1, y1 - y0 + 1) }
          if (outline >= 0) { ctx.strokeStyle = pal[outline]; ctx.lineWidth = w; ctx.strokeRect(x0 + w / 2, y0 + w / 2, x1 - x0 + 1 - w, y1 - y0 + 1 - w) }
          break
        }
        case 'l': {
          const [, fill, w] = op
          if (fill < 0 || op.length < 7) break
          ctx.strokeStyle = pal[fill]; ctx.lineWidth = w
          ctx.beginPath()
          const off = w % 2 ? 0.5 : 0
          ctx.moveTo(op[3] + off, op[4] + off)
          for (let i = 5; i + 1 < op.length; i += 2) ctx.lineTo(op[i] + off, op[i + 1] + off)
          if (op.length === 7 && op[3] === op[5] && op[4] === op[6]) { ctx.fillStyle = pal[fill]; ctx.fillRect(op[3], op[4], w, w) } else ctx.stroke()
          break
        }
        case 'd': {
          const [, fill, w, h] = op
          ctx.fillStyle = pal[fill]
          for (let i = 4; i + 1 < op.length; i += 2) ctx.fillRect(op[i], op[i + 1], w, h)
          break
        }
        case 'e': case 'g': case 'R': {
          const [kind, fill, outline, w, ...q] = op
          ctx.beginPath()
          if (kind === 'g') { ctx.moveTo(q[0], q[1]); for (let i = 2; i + 1 < q.length; i += 2) ctx.lineTo(q[i], q[i + 1]); ctx.closePath() } else if (kind === 'e') {
            ctx.ellipse((q[0] + q[2]) / 2, (q[1] + q[3]) / 2, Math.abs(q[2] - q[0]) / 2, Math.abs(q[3] - q[1]) / 2, 0, 0, Math.PI * 2)
          } else ctx.rect(q[0], q[1], q[2] - q[0], q[3] - q[1])
          if (fill >= 0) { ctx.fillStyle = pal[fill]; ctx.fill() }
          if (outline >= 0) { ctx.strokeStyle = pal[outline]; ctx.lineWidth = w; ctx.stroke() }
          break
        }
        default: break
      }
    }
  }

  /** satisfaction: the attention tokens are the user's own sung words */
  token(s) {
    const i = Number(s.slice(1))
    const tok = this.tokens?.[i]
    if (!tok) return '····'
    return s.charCodeAt(0) === 2 ? tok.slice(0, 4) : tok
  }

  image(expr) { return this.art[`whale-${expr}`] ?? this.art['whale-cheerful'] ?? null }

  /** Draws an art image as a tinted mosaic (the upstream halfblock look) into a rect. */
  mosaic(ctx, img, rect, { cell = 4, tint = 'blue', alpha = 1, crop = null, glitch = 0, r = Math.random } = {}) {
    const [x0, y0, x1, y1] = rect
    const w = x1 - x0, h = y1 - y0
    if (w < 4 || h < 4) return
    const cols = Math.max(2, Math.floor(w / cell)), rows = Math.max(2, Math.floor(h / cell))
    const c = this.cell
    if (c.width !== cols || c.height !== rows) { c.width = cols; c.height = rows }
    const g = c.getContext('2d')
    g.clearRect(0, 0, cols, rows)
    if (img) {
      const [sx, sy, sw, sh] = crop ?? [0, 0, img.width, img.height]
      const s = Math.min(cols / sw, rows / sh)
      const dw = sw * s, dh = sh * s
      g.imageSmoothingEnabled = true
      g.drawImage(img, sx, sy, sw, sh, (cols - dw) / 2, (rows - dh) / 2, dw, dh)
    } else {
      g.fillStyle = '#6f86ff'; g.beginPath(); g.ellipse(cols / 2, rows * 0.32, cols * 0.16, rows * 0.13, 0, 0, Math.PI * 2); g.fill()
      g.fillRect(cols * 0.3, rows * 0.45, cols * 0.4, rows * 0.5)
    }
    g.globalCompositeOperation = 'source-atop'
    g.fillStyle = tint === 'red' ? 'rgba(255,59,48,0.62)' : tint === 'gray' ? 'rgba(160,168,184,0.7)' : tint === 'none' ? 'rgba(0,0,0,0)' : 'rgba(77,107,254,0.38)'
    g.fillRect(0, 0, cols, rows)
    g.globalCompositeOperation = 'source-over'
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.imageSmoothingEnabled = false
    if (glitch > 0) {
      for (let y = 0; y < rows; y += 2) {
        const dx = r() < glitch ? Math.round((r() - 0.5) * 6) : 0
        ctx.drawImage(c, 0, y, cols, 2, x0 + dx * cell, y0 + y * cell, cols * cell, 2 * cell)
      }
    } else ctx.drawImage(c, 0, 0, cols, rows, x0, y0, cols * cell, rows * cell)
    ctx.fillStyle = 'rgba(4,7,15,0.35)'
    for (let y = y0; y < y0 + rows * cell; y += cell) ctx.fillRect(x0, y + cell - 1, cols * cell, 1)
    ctx.restore()
  }

  art_(ctx, shot, kf, t, r) {
    const fn = shot.fn
    // Real compositor surfaces replace these old approximations. Keep the
    // live lyric banners below: their text still comes from the user's cues.
    if (rasterFrameAt(this.raster, t)?.ops.length && (
      fn === 'exec_hit' && shot.lay[0] === 'split' || fn === 'whale_fall' || fn === 'last_execution'
    )) return
    if (fn === 'exec_hit' && shot.lay[0] === 'split') {
      // the split cuts: her, red, behind the EXECUTION tape
      const img = this.image(t > 156 ? 'frightened' : 'angry')
      this.mosaic(ctx, img, [24, 56, 560, 600], { cell: 4, tint: 'red', crop: img ? [0, 0, img.width, img.height * 0.55] : null, glitch: 0.15, r })
      ctx.save(); ctx.translate(292, 330); ctx.rotate(-0.2)
      ctx.fillStyle = mix(ERR, 0.95); ctx.fillRect(-320, -26, 640, 52)
      ctx.fillStyle = mix(BG, 1); ctx.font = fontOf(2, 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('EXECUTION   EXECUTION', 0, 2); ctx.restore()
      ctx.textBaseline = 'top'
    } else if (fn === 'exec_hit' || fn === 'collapse_banner') {
      if (!kf.o.some(op => op[0] === 'd' && op.length > 400)) this.banner(ctx, 'EXECUTION', t - kf.from)
    } else if (fn === 'red_if_i_can' || fn === 'if_i_can') {
      // the banner was stored as blank bars: write the user's own words over it
      const cur = lineAt(this.lines, t)
      const words = (cur?.[0].text ?? '').toUpperCase().split(/\s+/).slice(0, 3).join(' ')
      if (words) this.banner(ctx, words, t - shot.s, fn === 'if_i_can' ? ME : ERR, 0.55)
    } else if (fn === 'whale_fall' || fn === 'last_execution') {
      const img = this.art['maid-left'] ?? this.image('shy')
      const u = clamp((t - shot.s) / (shot.e - shot.s), 0, 1)
      this.mosaic(ctx, img, [880, 70 + Math.round(u * 260), 1150, 600], { cell: 5, tint: 'blue', alpha: 0.35 * (1 - u * 0.7), r })
    }
  }

  banner(ctx, text, age, color = ERR, alpha = 1) {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.font = fontOf(3, 150); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const n = Math.min(text.length, Math.max(1, Math.floor(age * 40)))
    ctx.fillStyle = mix(color, 0.9)
    ctx.fillText(text.slice(0, n), 640, 300)
    ctx.fillStyle = 'rgba(4,7,15,0.45)'
    for (let y = 200; y < 400; y += 4) ctx.fillRect(40, y, 1200, 1)
    ctx.restore()
  }

  window(ctx, rect, alpha, t, shot) {
    const [x0, y0, x1, y1] = rect
    const wx = x0 + INNER[0], wy = y0 + INNER[1], ww = x1 - x0 - INNER[0] - INNER[2], wh = y1 - y0 - INNER[1] - INNER[3]
    if (ww < 20 || wh < 20) return
    const row = chatAt(this.chat, t)
    if (!row) return
    const page = this.page.getContext('2d')
    drawPage(page, this.chat, row, { t, avatar: (g, x, y, size, img) => this.avatar(g, x, y, size, img, t) })
    const s = Math.min(ww / PAGE_W, wh / PAGE_H)
    ctx.save()
    ctx.fillStyle = mix(BG, 1); ctx.fillRect(wx, wy, ww, wh)
    ctx.globalAlpha = alpha
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(this.page, wx + (ww - PAGE_W * s) / 2, wy, PAGE_W * s, PAGE_H * s)
    if (shot.al === 'err' && t >= 147.5 && t < 177) { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,90,80,0.9)'; ctx.fillRect(wx, wy, ww, wh) }
    ctx.restore()
  }

  avatar(g, x, y, size, img, t) {
    const spec = avatarSpec(img, t)
    const r = rng(Math.floor(t * 8) + 3)
    if (spec.noise !== undefined || spec.seed) {
      const n = spec.seed ? 1 : 6 + spec.noise
      const cell = size / Math.max(1, Math.min(24, n))
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        if (spec.seed && (i || j)) continue
        const v = spec.seed ? 0.9 : r()
        g.fillStyle = `rgba(${Math.round(60 + 140 * v)},${Math.round(80 + 120 * v)},255,${(0.3 + 0.7 * v).toFixed(2)})`
        g.fillRect(spec.seed ? x + size / 2 - 3 : x + i * cell, spec.seed ? y + size / 2 - 3 : y + j * cell, spec.seed ? 6 : cell + 0.5, spec.seed ? 6 : cell + 0.5)
      }
      return
    }
    const im = this.image(spec.expr)
    if (!im) return
    const crop = [im.width * 0.267, im.height * 0.024, im.width * 0.47, im.width * 0.47]
    if (spec.cells) {
      const c = this.cell, n = Math.max(2, spec.cells)
      c.width = n; c.height = n
      const cg = c.getContext('2d'); cg.imageSmoothingEnabled = true; cg.clearRect(0, 0, n, n)
      cg.drawImage(im, ...crop, 0, 0, n, n)
      if (spec.gray) { cg.globalCompositeOperation = 'saturation'; cg.fillStyle = '#888'; cg.fillRect(0, 0, n, n); cg.globalCompositeOperation = 'source-over' }
      g.imageSmoothingEnabled = false
      g.drawImage(c, 0, 0, n, n, x, y, size, size)
    } else {
      g.imageSmoothingEnabled = true
      g.drawImage(im, ...crop, x, y, size, size)
    }
    if (spec.tint === 'red') { g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgb(255,80,70)'; g.fillRect(x, y, size, size); g.globalCompositeOperation = 'source-over' }
    if (spec.prop && PROPS[spec.prop]) { g.font = `${Math.round(size * 0.36)}px "Segoe UI Emoji", "Noto Color Emoji", sans-serif`; g.fillText(PROPS[spec.prop], x + size * 0.58, y + size * 0.58) }
  }

  header(ctx, shot, t, gain, lay, r) {
    const al = shot.al
    const col = al === 'err' ? ERR : al === 'anom' ? ANOM : UI
    const lvl = l => (col === UI ? l * gain : l)
    const mm = Math.floor(t / 60), ss = (t % 60).toFixed(1).padStart(4, '0')
    const clock = `${String(mm).padStart(2, '0')}:${ss} / 03:32`
    const state = { err: 'ERROR', anom: 'WARN' }[al] ?? 'RUNNING'
    if (lay === 'fullbleed' || lay === 'cinema' || lay === 'raw') {
      ctx.font = fontOf(2, 11); ctx.fillStyle = mix(col, lvl(0.4))
      ctx.fillText(shot.ch, 16, 10)
      ctx.textAlign = 'right'; ctx.fillText(clock, W - 16, 10); ctx.textAlign = 'left'
      return
    }
    if (lay === 'shell') {
      const age = (t - shot.s - 0.25) * 1.2
      const txt = age > 0 ? decode(`me@deepsea:~$ ${shot.sh}`, age, r, 30, 0.1) : 'me@deepsea:~$'
      ctx.font = fontOf(1, 18); ctx.fillStyle = mix(ME, 0.95); ctx.fillText(txt, 24, 12)
      ctx.font = fontOf(0, 14); ctx.fillStyle = mix(UI, 0.5 * gain); ctx.fillText(clock, W - 190, 14)
      return
    }
    ctx.font = fontOf(2, 13)
    ctx.fillStyle = mix(col, lvl(0.95)); ctx.fillText('WORLD.EXECUTE(ME);   whale@deepsea:~$', 24, 14)
    // the heartbeat: one spike per drum beat, lifted by the live loudness of the user's audio
    const x0 = 362, w = 600, y0 = 25
    const e = clamp(this.energy(t) ?? 0, 0, 1)
    ctx.strokeStyle = mix(col, lvl(0.9)); ctx.lineWidth = 1
    ctx.beginPath()
    for (let px = 0; px < w; px += 2) {
      const tau = t - (w - px) / w * 4.2
      const bt = beatT(Math.round((tau - FIRST_BEAT) / BEAT))
      const dt = tau - bt
      const v = (-11 * Math.exp(-((dt / 0.016) ** 2)) + 4 * Math.exp(-(((dt - 0.05) / 0.025) ** 2))) * (0.7 + 0.6 * e) + Math.sin(px * 0.9 + t * 30) * 1.2 * e
      if (px === 0) ctx.moveTo(x0 + px, y0 + v); else ctx.lineTo(x0 + px, y0 + v)
    }
    ctx.stroke()
    ctx.fillStyle = mix(col, lvl(0.9)); ctx.fillRect(x0 + w + 4, y0 - 2, 4, 4)
    const right = `${shot.ch}   ${clock}   ${state}`
    ctx.fillStyle = mix(col, lvl(0.85)); ctx.textAlign = 'right'; ctx.fillText(right, W - 24, 14); ctx.textAlign = 'left'
    ctx.fillStyle = mix(col, lvl(0.35)); ctx.fillRect(24, 38, W - 48, 1)
  }

  ticker(ctx, shot, t, gain) {
    const [x0, y0, x1, y1] = [1180, 56, 1256, 604]
    const color = shot.al === 'err' ? ERR : UI
    box(ctx, x0, y0, x1, y1, 'ops', 0.45, color, gain)
    const ops = shot.ops?.length ? shot.ops : ['IDLE']
    const rh = 17, scroll = t * (rh / (BEAT / 2)), cursorRow = 15
    const base = Math.floor(scroll / rh), off = scroll % rh
    ctx.font = fontOf(0, 12)
    for (let i = -1; i < 32; i++) {
      const y = y0 + 10 + i * rh - off
      if (y < y0 + 4 || y > y1 - 16) continue
      const op = ops[(((base + i) % ops.length) + ops.length) % ops.length].slice(0, 10)
      if (i === cursorRow) {
        ctx.fillStyle = shot.al === 'err' ? mix(ERR, 0.95) : mix(UI, 0.95 * gain); ctx.fillRect(x0 + 4, y - 1, x1 - x0 - 8, 16)
        ctx.fillStyle = mix(BG, 1); ctx.fillText(op, x0 + 8, y)
      } else { ctx.fillStyle = mix(UI, Math.max(0.18, 0.6 - Math.abs(i - cursorRow) * 0.04) * gain); ctx.fillText(op, x0 + 8, y) }
    }
  }

  band_(ctx, t, gain, framed, r) {
    if (framed) box(ctx, 24, 616, 1256, 680, 'stdout · tokens', 0.45 + 0.3 * pulse(t), UI, gain)
    const amb = l => mix(UI, l * gain)
    let x = 48
    const y = 626
    ctx.font = fontOf(2, 21); ctx.fillStyle = amb(0.6); ctx.fillText('>', x, y)
    x += 26
    const cur = lineAt(this.lines, t)
    if (!cur) { if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = amb(0.9); ctx.fillRect(x, y + 4, 12, 25) } return }
    const [ln, alpha] = cur
    const s = ln.text
    const [nOut, when] = typed(ln, t)
    ctx.save(); ctx.globalAlpha = Math.max(0, alpha)
    let pos = 0
    tokenize(s).forEach((tok, k) => {
      const start = s.indexOf(tok, pos)
      if (start < 0 || start >= nOut) { if (start >= 0) pos = start + tok.length; return }
      const gap = start > pos
      pos = start + tok.length
      if (gap) x += 8
      if (x > 1230) return
      const shown = tok.slice(0, nOut - start)
      let txt = ''
      for (let j = 0; j < shown.length; j++) txt += t - when[start + j] >= 0.08 || shown[j] === ' ' ? shown[j] : SCR[Math.floor(r() * SCR.length)]
      ctx.font = fontOf(2, 21)
      const tw = ctx.measureText(tok).width
      const ws = s.lastIndexOf(' ', start - 1) + 1
      let we = s.indexOf(' ', start); if (we < 0) we = s.length
      const key = s.slice(ws, we).toLowerCase().replace(/[^a-z-]/g, '')
      if (KEYWORDS.has(key) && nOut >= we) {
        ctx.fillStyle = key.includes('exec') || key === 'illegal' || key === 'arguments' ? mix(ERR, 0.95) : key === 'love' || key === 'lo-o-ove' ? mix(ME, 0.95) : amb(0.95)
        ctx.fillRect(x - 3, y + 2, tw + 6, 29)
        ctx.fillStyle = mix(BG, 1); ctx.fillText(txt, x, y)
      } else {
        ctx.fillStyle = amb(k % 2 === 0 ? 0.13 : 0.22); ctx.fillRect(x - 3, y + 2, tw + 6, 29)
        ctx.fillStyle = amb(0.95); ctx.fillText(txt, x, y)
      }
      if (nOut >= pos) {
        const tid = String(tokenId(tok))
        ctx.font = fontOf(0, 11); ctx.fillStyle = amb(0.45)
        ctx.fillText(tid, x + (tw - ctx.measureText(tid).width) / 2, y + 33)
      }
      x += tw + 6
    })
    ctx.restore()
    if (alpha >= 0.999 && (nOut < s.length || Math.floor(t * 3) % 2 === 0)) { ctx.fillStyle = amb(0.9); ctx.fillRect(Math.min(x + 2, 1240), y + 4, 12, 25) }
  }

  footer(ctx, t, gain) {
    const n = 60, k = Math.floor(n * clamp(t / this.duration, 0, 1))
    ctx.font = fontOf(0, 12); ctx.fillStyle = mix(UI, 0.4 * gain)
    ctx.fillText(`[${'|'.repeat(k)}${':'.repeat(n - k)}]`, 24, 690)
    ctx.font = fontOf(4, 11); ctx.fillStyle = mix(UI, 0.38 * gain)
    ctx.fillText('角色 溟月 © 上善无形 / 女仆版 ZipZipPipe / 立绘·表情 dsh-deep-whale, dsh-whale-galgame (CC BY-NC-SA 4.0)  ·  Music: Mili - world.execute(me);  ·  非官方同人', 500, 689)
  }

  post(ctx, t, strength) {
    // trail (lighter blend of the previous frame), soft bloom, scanlines every 3 px, vignette
    const prev = this.trail
    if (prev && strength > 0) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      // Accumulate only forward-moving frames. Re-rendering a paused frame or
      // seeking backwards must not brighten it based on RAF count/history.
      if (this.lastT !== undefined && t > this.lastT && t - this.lastT < 0.2) { ctx.globalAlpha = 0.1 * strength; ctx.drawImage(prev, 0, 0) }
      if ('filter' in ctx && this.bloom !== false) {
        ctx.filter = 'blur(4px)'; ctx.globalAlpha = 0.3 * strength
        ctx.drawImage(this.buffer, 0, 0)
        ctx.filter = 'none'
      }
      ctx.restore()
    }
    ctx.fillStyle = 'rgba(0,0,0,0.22)'
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1)
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95)
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    this.lastT = t
    if (prev) { const p = prev.getContext('2d'); p.globalCompositeOperation = 'copy'; p.drawImage(this.buffer, 0, 0); p.globalCompositeOperation = 'source-over' }
  }
}

function box(ctx, x0, y0, x1, y1, title, level, color, gain = 1) {
  const g = color === UI ? gain : 1
  ctx.strokeStyle = mix(color, level * g); ctx.lineWidth = 1
  ctx.strokeRect(x0 + 0.5, y0 + 0.5, x1 - x0, y1 - y0)
  ctx.strokeStyle = mix(color, Math.min(1, level + 0.4) * g); ctx.lineWidth = 2
  const L = 7
  for (const [px, py, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + sx * L, py); ctx.moveTo(px, py); ctx.lineTo(px, py + sy * L); ctx.stroke()
  }
  if (title) {
    ctx.font = fontOf(2, 13)
    const tw = ctx.measureText(` ${title} `).width
    ctx.fillStyle = mix(BG, 1); ctx.fillRect(x0 + 12, y0 - 9, tw, 18)
    ctx.fillStyle = mix(color, Math.min(1, level + 0.35) * g); ctx.fillText(` ${title} `, x0 + 12, y0 - 10)
  }
}
