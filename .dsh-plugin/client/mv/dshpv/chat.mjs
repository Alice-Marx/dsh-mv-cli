/**
 * The dsh web window of the dsh-pv preset, redrawn natively on canvas from the chat states in chat.json.
 *
 * Layout and states follow MisakaZentai/world-execute-me-dsh-pv (pv_dsh_frontend_20260927: build_frame.py,
 * batch_*.py), Copyright (c) 2026 MisakaZentai, MIT License. No DeepSeek frontend code, CSS or icons are used:
 * the page is approximated with plain canvas drawing at the upstream page size (354 x 537 CSS px).
 */
export const PAGE_W = 354
export const PAGE_H = 537
const SANS = '"Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", "Segoe UI", sans-serif'
const C = { bg: '#05080f', bubble: '#18233d', input: '#0d1528', border: '#1b2540', border2: '#223052', primary: '#e6e8ee', secondary: '#a8b0c2', tertiary: '#6f7890', blue: '#4d6bfe', red: '#f85149' }

/** frame row entry -> [blockId, chars (-1 full), opacity] */
const entry = e => (Array.isArray(e) ? [e[0], e[1] ?? -1, e[2] ?? 1] : [e, -1, 1])

export function chatAt(chat, t) {
  const frames = chat.frames
  let lo = 0, hi = frames.length - 1
  if (!frames.length || t < frames[0][0]) return null
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (frames[mid][0] <= t) lo = mid; else hi = mid - 1 }
  return frames[lo]
}

/** The block's parts, cut to `chars` characters of its joined text (the typing state). */
export function blockParts(block, chars) {
  if (chars < 0) return block.p
  const out = []
  let left = chars
  for (const [k, v] of block.p) {
    const head = k.length + 1
    if (left <= head) break
    left -= head
    out.push([k, v.slice(0, left)])
    left -= v.length
    if (left <= 0) break
    left -= 1
  }
  return out
}

const part = (parts, ...names) => { for (const n of names) { const p = parts.find(x => x[0] === n); if (p) return p[1] } return '' }
const allText = parts => parts.map(p => p[1]).join(' ')

function wrap(ctx, text, width) {
  const out = []
  for (const para of String(text).split('\n')) {
    let line = ''
    for (const ch of para) {
      if (ctx.measureText(line + ch).width > width && line) { out.push(line); line = ch.trimStart() } else line += ch
    }
    out.push(line)
  }
  return out
}

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath()
}

const ICONS = ['⧉', '👍', '👎', '⤨']

/** Measures (and, when draw is set, draws) one block at y; returns its height. */
function block(ctx, b, parts, y, draw, op, env) {
  const W = PAGE_W - 28, X = 14
  ctx.globalAlpha = op
  switch (b.k) {
    case 'u': {
      ctx.font = `16px ${SANS}`
      const lines = wrap(ctx, part(parts, 'bubble') || allText(parts), W * 0.78 - 32)
      const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 32
      const h = lines.length * 24 + 18
      if (draw) {
        ctx.fillStyle = env.bubble; rounded(ctx, X + W - w, y, w, h, 18); ctx.fill()
        ctx.fillStyle = C.primary; lines.forEach((l, i) => ctx.fillText(l, X + W - w + 16, y + 9 + i * 24))
      }
      return h
    }
    case 'h': {
      ctx.font = `16px ${SANS}`
      const lines = wrap(ctx, part(parts, 'body') || allText(parts), W)
      if (draw) { ctx.fillStyle = b.stopped ? C.tertiary : C.primary; lines.forEach((l, i) => ctx.fillText(l, X, y + i * 26)) }
      return lines.length * 26
    }
    case 'a': {
      if (draw) {
        ctx.font = `15px ${SANS}`; ctx.fillStyle = C.secondary
        ICONS.forEach((ic, i) => ctx.fillText(ic, X + 2 + i * 38, y + 2))
        ctx.font = `14px ${SANS}`
        ctx.fillText(`◷  ${part(parts, 'timeEnd')}`, X + 2 + 4 * 38, y + 3)
      }
      return 22
    }
    case 'tool': {
      ctx.font = `14px ${SANS}`
      const title = part(parts, 'title') || (parts[0]?.[1] ?? '')
      const rest = parts.filter(p => p[0] !== 'title').map(p => p[1]).join(' · ')
      const lines = wrap(ctx, `${title}${rest ? ' · ' + rest : ''}`, W - 22)
      if (draw) {
        ctx.fillStyle = b.error ? C.red : C.tertiary; ctx.fillText(title === '思考' ? '✲' : '⚙', X, y)
        lines.forEach((l, i) => {
          if (i === 0 && rest) {
            ctx.fillStyle = C.secondary; ctx.fillText(title, X + 22, y)
            const tw = ctx.measureText(title).width
            ctx.fillStyle = b.error ? C.red : C.tertiary; ctx.fillText(l.slice(title.length), X + 22 + tw, y)
          } else { ctx.fillStyle = b.error ? C.red : C.tertiary; ctx.fillText(l, X + 22, y + i * 20) }
        })
      }
      return lines.length * 20
    }
    case 'err': {
      ctx.font = `14px ${SANS}`
      const lines = wrap(ctx, allText(parts), W - 18)
      if (draw) {
        ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(X + 4, y + 9, 3.5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = C.secondary; lines.forEach((l, i) => ctx.fillText(l, X + 16, y + i * 20))
      }
      return lines.length * 20
    }
    default: {
      ctx.font = `${b.k === 'n' ? 13 : 14}px ${SANS}`
      const suffix = b.k === 'retry' || b.k === 'cmp' ? '  ›' : ''
      const lines = wrap(ctx, allText(parts) + suffix, W)
      if (draw) { ctx.fillStyle = b.error ? C.red : C.tertiary; lines.forEach((l, i) => ctx.fillText(l, X, y + i * 19)) }
      return lines.length * 19
    }
  }
}

/**
 * Draws the window page (PAGE_W x PAGE_H) at the context's origin.
 * env: { avatar(ctx, x, y, size, img, t), t, red (0..1 sandbox tint) }
 */
export function drawPage(ctx, chat, row, env) {
  ctx.save()
  ctx.textBaseline = 'top'
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, PAGE_W, PAGE_H)
  const code = row?.[1]
  const entries = (row?.[2] ?? []).map(entry)
  const blocks = entries.map(([id, n, op]) => ({ b: chat.blocks[id], parts: blockParts(chat.blocks[id], n), op }))
  env = { bubble: C.bubble, ...env }
  if (code) { drawCode(ctx, env); ctx.restore(); return }
  const head = blocks.find(x => x.b.k === 'head')
  const comp = blocks.find(x => x.b.k === 'comp')
  const foot = blocks.find(x => x.b.k === 'foot')
  const body = blocks.filter(x => !['head', 'comp', 'foot'].includes(x.b.k))
  let top = 0
  if (head) {
    ctx.globalAlpha = head.op
    ctx.save(); rounded(ctx, 12, 10, 60, 60, 14); ctx.clip(); ctx.fillStyle = '#070b18'; ctx.fillRect(12, 10, 60, 60)
    env.avatar?.(ctx, 12, 10, 60, head.b.img, env.t); ctx.restore()
    ctx.strokeStyle = C.border2; ctx.lineWidth = 0.5; rounded(ctx, 12, 10, 60, 60, 14); ctx.stroke()
    ctx.font = `500 14px ${SANS}`; ctx.fillStyle = C.primary; ctx.fillText(part(head.parts, 'name'), 82, 22)
    ctx.font = `12px ${SANS}`; ctx.fillStyle = head.b.dot ?? '#3fb950'; ctx.beginPath(); ctx.arc(85.5, 49, 3.5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = C.tertiary; ctx.fillText(part(head.parts, 'state'), 95, 42)
    const extra = head.parts.find(p => p[0] === '')
    if (extra) { ctx.font = `bold 11px ${SANS}`; ctx.fillStyle = C.red; ctx.fillText(extra[1], PAGE_W - 12 - ctx.measureText(extra[1]).width, 44) }
    ctx.globalAlpha = 1; ctx.fillStyle = C.border; ctx.fillRect(0, 78, PAGE_W, 0.5)
    top = 79
  }
  const footH = foot ? 26 : 0
  const compH = comp ? 106 : 0
  const bottom = PAGE_H - footH - compH - 6
  // the timeline sticks to the bottom (justify-content: flex-end), older rows scroll out at the top
  const heights = body.map(x => block(ctx, x.b, x.parts, 0, false, x.op, env))
  let y = bottom - heights.reduce((a, h) => a + h + 10, 0) + 10
  ctx.save(); ctx.beginPath(); ctx.rect(0, top, PAGE_W, bottom - top + 4); ctx.clip()
  body.forEach((x, i) => { if (y + heights[i] > top) block(ctx, x.b, x.parts, y, true, x.op, env); y += heights[i] + 10 })
  ctx.restore()
  ctx.globalAlpha = 1
  if (comp) {
    const cy = PAGE_H - footH - compH + 2
    ctx.globalAlpha = comp.op
    ctx.fillStyle = C.input; rounded(ctx, 10, cy, PAGE_W - 20, compH - 8, 16); ctx.fill()
    ctx.strokeStyle = C.border2; ctx.lineWidth = 1; ctx.stroke()
    const input = part(comp.parts, 'input'), ph = part(comp.parts, 'placeholder')
    ctx.font = `16px ${SANS}`; ctx.fillStyle = input ? C.primary : C.tertiary
    const text = input || ph
    let shown = text
    while (shown && ctx.measureText(shown).width > PAGE_W - 52) shown = shown.slice(0, -1)
    ctx.fillText(shown + (shown !== text ? '…' : ''), 26, cy + 14)
    ctx.strokeStyle = C.secondary; ctx.lineWidth = 1.2
    for (const cx of [32, 72]) { ctx.beginPath(); ctx.arc(cx, cy + 74, 13, 0, Math.PI * 2); ctx.stroke() }
    ctx.fillStyle = C.secondary; ctx.font = `16px ${SANS}`; ctx.fillText('+', 27, cy + 64); ctx.fillText('⌀', 67, cy + 64)
    const model = comp.parts.filter(p => p[0] === '').map(p => p[1]).join(' ')
    ctx.font = `13px ${SANS}`; ctx.fillStyle = C.secondary
    const mw = ctx.measureText(model).width
    ctx.fillText(model, Math.max(96, PAGE_W - 64 - mw), cy + 66)
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(PAGE_W - 36, cy + 74, 15, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = `bold 15px ${SANS}`; ctx.fillText('↑', PAGE_W - 41, cy + 65)
  }
  if (foot) {
    ctx.globalAlpha = foot.op
    ctx.font = `13px ${SANS}`; ctx.fillStyle = C.secondary
    const label = allText(foot.parts).replace(/步(\d)/, '步  $1').replace('tok·', 'tok  ·  ')
    ctx.fillText(label, (PAGE_W - ctx.measureText(label).width) / 2, PAGE_H - 22)
  }
  ctx.restore()
}

/** seg_page "s-code": the page taken apart down to its source; drawn as scrolling markup that empties. */
function drawCode(ctx, env) {
  const t = env.t ?? 0
  const left = Math.max(0, 1 - (t - 113.75) / 2.2)
  ctx.font = '11px "DejaVu Sans Mono", Consolas, monospace'
  const rows = ['<div id="app">', ' <div class="pv-head">…</div>', ' <div id="timeline">', '  <div class="userRow">…</div>', '  <div class="reply">…</div>',
    '  <div class="actions">…</div>', ' </div>', ' <div id="composer">…</div>', ' <div class="stats">…</div>', '</div>']
  ctx.fillStyle = '#8b949e'
  rows.forEach((r, i) => { const n = Math.floor(r.length * left); if (n > 0) ctx.fillText(r.slice(0, n), 12, 18 + i * 16) })
}
