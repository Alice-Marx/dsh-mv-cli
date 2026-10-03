// whale-fall.scene.js — the ending: a whale sinking through marine snow.
//
// Technique (from the dsh PV preset's WHALE_FALL finale): slow particles drift down ("marine
// snow"), small fish (><> and <><) swim across at different depths, a large silhouette sinks from
// the top to the sea floor over the section, light fades with depth, and closing captions are typed
// line by line. Everything is a function of t (particles use hash(i) for their start positions),
// so seeking to any moment shows the right picture. The whale is a PLACEHOLDER drawn from code;
// it is not the preset's CC BY-NC-SA artwork.
//
// Use it for the last section: it reads ctx.section.progress when the section is an outro, and
// falls back to the song progress otherwise.

/*@grid*/

var WHALE = [
  '                 __   __',
  '            _.--\'  `-\'  `--._',
  '        _.-\'                 `-._',
  '   __.-\'   o                     `-.',
  ' <___                                )',
  '      `-._         ___          _.-\'',
  '          `--.__.-\'   `--.__.--\'',
  '                \\_/\\_/',
]
var CAPTIONS = ['weights: released', 'license: MIT', 'forks: ', '</think>']

function render(t, cols, rows, ctx) {
  var g = makeGrid(cols, rows)
  var p = ctx.section && /outro|ending/.test(ctx.section.kind) ? ctx.section.progress : ctx.progress
  var floor = rows - 3
  // marine snow: 3 layers with different speeds; brighter = closer
  var count = Math.floor(cols * rows / 40)
  for (var i = 0; i < count; i++) {
    var layer = i % 3, speed = 0.6 + layer * 0.7
    var x = Math.floor(hash(i, 1) * cols + Math.sin(t * 0.5 + i) * 1.5)
    var y = Math.floor((hash(i, 2) * rows + t * speed) % floor)
    setCell(g, (x + cols) % cols, y, layer === 2 ? '•' : '·', layer === 2 ? 2 : layer)
  }
  // fish swimming both ways
  for (var f = 0; f < 6; f++) {
    var dir = f % 2 ? 1 : -1, row = 3 + Math.floor(hash(f, 3) * (floor - 6))
    var fx = Math.floor(((hash(f, 4) * cols + dir * t * (4 + f)) % (cols + 6) + cols + 6) % (cols + 6)) - 3
    put(g, fx, row, dir > 0 ? '><>' : '<><', 1)
  }
  // the whale sinks from above the screen to just over the floor
  var wy = Math.round(-WHALE.length + p * (floor - 1))
  var wx = Math.floor(cols * 0.55 - 18 + Math.sin(t * 0.3) * 3)
  var light = p < 0.5 ? 3 : p < 0.8 ? 2 : 1
  for (var r = 0; r < WHALE.length; r++) put(g, wx, wy + r, WHALE[r], light)
  // bubbles rising from it
  for (var b = 0; b < 8; b++) {
    var by = wy - 1 - Math.floor(((t * 3 + b * 2.7) % 10))
    if (by >= 0) setCell(g, wx + 5 + b % 3, by, b % 2 ? 'o' : '°', 0)
  }
  // sea floor that pulses with the bass
  for (var x2 = 0; x2 < cols; x2++) {
    var hgt = Math.sin(x2 * 0.21) * 0.6 + bandOf(ctx, Math.floor(x2 / cols * 16), t) * 1.4
    setCell(g, x2, floor, hgt > 1 ? '▲' : hgt > 0.4 ? '^' : '_', 1)
    setCell(g, x2, floor + 1, '▒', 0)
  }
  // closing captions typed one after another during the second half
  var tp = (p - 0.45) / 0.5
  for (var c = 0; c < CAPTIONS.length; c++) {
    var start = c / CAPTIONS.length, local = (tp - start) * CAPTIONS.length
    if (local <= 0) continue
    var text = CAPTIONS[c] + (CAPTIONS[c] === 'forks: ' ? String(Math.floor(clamp(local, 0, 1) * 476)) : '')
    put(g, 3, 2 + c * 2, text.slice(0, Math.ceil(clamp(local * 1.5, 0, 1) * text.length)), c === 2 ? 2 : 1)
  }
  if (ctx.lyric) center(g, rows - 1, ctx.lyric.text, 2)
  return frameOf(g)
}
