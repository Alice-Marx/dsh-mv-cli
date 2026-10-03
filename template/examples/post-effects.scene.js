// post-effects.scene.js — trails, bloom, scanlines, vignette and beat glitch as passes over a grid.
//
// Technique (from the dsh PV preset's post-processing): draw the scene into a grid, then run small
// passes over it. Styles are brightness levels here (0 dim < 1 normal < 2 bright < 3 white), so
// "darkening" a cell means lowering its digit. Trails are made by drawing the same scene at a few
// earlier times first, dimmer: the frame stays a pure function of t (no state between frames).
// Each pass is cheap (one loop over the cells); keep the total under the frame budget.

/*@grid*/

var DOWN = { '3': '2', '2': '1', '1': '0', '0': '0' }  // one step darker (colours 4–6 are kept)
function darker(s) { return DOWN[s] || s }

// The base scene: a ring of spectrum spokes around the centre (the lyric is added after bloom).
function base(g, t, ctx, style) {
  var cx = g.cols / 2, cy = g.rows / 2, spokes = 48
  for (var i = 0; i < spokes; i++) {
    var a = i / spokes * Math.PI * 2 + t * 0.4
    var len = 3 + bandOf(ctx, i, t) * Math.min(cx * 0.45, cy * 0.9)
    for (var r = 3; r < len; r += 0.7) setCell(g, Math.round(cx + Math.cos(a) * r * 2), Math.round(cy + Math.sin(a) * r), r > len - 1.4 ? '●' : '·', style)
  }
}

// Pass 1 — trails: earlier copies, each one step dimmer, drawn underneath.
function withTrails(cols, rows, t, ctx) {
  var g = makeGrid(cols, rows)
  var steps = [[0.24, '0'], [0.12, '1']]
  for (var i = 0; i < steps.length; i++) base(g, t - steps[i][0], ctx, steps[i][1])
  base(g, t, ctx, '3')
  return g
}
// Pass 2 — bloom: empty cells next to white cells get a faint glow.
function bloom(g) {
  var hot = []
  for (var y = 0; y < g.rows; y++) for (var x = 0; x < g.cols; x++) if (g.st[y][x] === '3') hot.push(x, y)
  for (var k = 0; k < hot.length; k += 2) for (var dy = -1; dy <= 1; dy++) for (var dx = -2; dx <= 2; dx++) {
    var X = hot[k] + dx, Y = hot[k + 1] + dy
    if (Y >= 0 && Y < g.rows && X >= 0 && X < g.cols && g.ch[Y][X] === ' ') { g.ch[Y][X] = '.'; g.st[Y][X] = '0' }
  }
}
// Pass 3 — scanlines: every other row one step darker; the bright line drifts down slowly.
function scanlines(g, t) {
  var sweep = Math.floor(t * 8) % g.rows
  for (var y = 0; y < g.rows; y++) {
    if (y === sweep) { for (var x = 0; x < g.cols; x++) if (g.ch[y][x] !== ' ' && g.st[y][x] === '1') g.st[y][x] = '2'; continue }
    if (y % 2) for (var x2 = 0; x2 < g.cols; x2++) g.st[y][x2] = darker(g.st[y][x2])
  }
}
// Pass 4 — vignette: cells far from the centre lose one or two steps.
function vignette(g) {
  for (var y = 0; y < g.rows; y++) for (var x = 0; x < g.cols; x++) {
    var dx = (x / g.cols - 0.5) * 2, dy = (y / g.rows - 0.5) * 2, d = dx * dx + dy * dy
    if (d > 0.55) g.st[y][x] = darker(g.st[y][x])
    if (d > 1.1) g.st[y][x] = darker(g.st[y][x])
  }
}
// Pass 5 — glitch: on a strong beat, slice a few rows sideways (rows with wide chars are skipped).
function glitch(g, ctx, t) {
  var pulse = ctx.beat ? ctx.beat.pulse : (energyOf(ctx, t) > 0.6 ? 1 : 0)
  if (pulse < 0.7) return
  var seed = ctx.beat ? ctx.beat.index : Math.floor(t * 4)
  for (var y = 0; y < g.rows; y++) {
    if (hash(y, seed) > 0.12 || g.ch[y].indexOf('') >= 0) continue
    var shift = Math.round((hash(y, seed + 9) - 0.5) * 10)
    g.ch[y] = g.ch[y].slice(-shift).concat(g.ch[y].slice(0, -shift)).slice(0, g.cols)
    g.st[y] = g.st[y].slice(-shift).concat(g.st[y].slice(0, -shift)).slice(0, g.cols)
    while (g.ch[y].length < g.cols) { g.ch[y].push(' '); g.st[y].push('0') }
  }
}

function render(t, cols, rows, ctx) {
  var g = withTrails(cols, rows, t, ctx)
  bloom(g)
  if (ctx.lyric) {   // text goes on top of a cleared band, after bloom, so it stays crisp
    var w = textWidth(ctx.lyric.text), y = Math.round(rows / 2)
    fill(g, Math.floor((cols - w) / 2) - 2, y, w + 4, 1, ' ', 0)
    center(g, y, ctx.lyric.text, '3')
  }
  scanlines(g, t)
  vignette(g)
  glitch(g, ctx, t)
  return frameOf(g)
}
