// execution-split.scene.js — the red EXECUTION split screen with a diagonal warning tape.
//
// Technique (from the dsh PV preset's EXECUTION chapter): everything turns red (style 4); the left
// half shows a figure as a coarse mosaic, the right half a huge word in a block font; a diagonal
// tape with repeating text slides across; on every beat the picture "glitches" (rows shift
// sideways, a few cells flip to noise). The preset uses the CC BY-NC-SA whale-girl art for the
// figure; this example draws a PLACEHOLDER silhouette from code instead, so it carries no artwork.
// Swap in your own ASCII art (and its licence) if you want a character there.

/*@grid*/

// 5×5 block font for the letters we need (add more as you like).
var FONT = {
  E: ['#####', '#    ', '#### ', '#    ', '#####'], X: ['#   #', ' # # ', '  #  ', ' # # ', '#   #'],
  C: [' ####', '#    ', '#    ', '#    ', ' ####'], U: ['#   #', '#   #', '#   #', '#   #', ' ### '],
  T: ['#####', '  #  ', '  #  ', '  #  ', '  #  '], I: ['#####', '  #  ', '  #  ', '  #  ', '#####'],
  O: [' ### ', '#   #', '#   #', '#   #', ' ### '], N: ['#   #', '##  #', '# # #', '#  ##', '#   #'],
  ' ': ['     ', '     ', '     ', '     ', '     '],
}
function bigText(g, x, y, text, scale, style, ch) {
  for (var i = 0; i < text.length; i++) {
    var glyph = FONT[text[i]] || FONT[' ']
    for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) if (glyph[r][c] === '#') fill(g, x + (i * 6 + c) * scale, y + r * scale, scale, scale, ch, style)
  }
}

// Placeholder figure: a hooded silhouette described by an ellipse body and a round head.
function silhouette(x, y, w, h) {
  var nx = x / w - 0.5, ny = y / h
  var head = (nx * nx) / 0.02 + Math.pow(ny - 0.22, 2) / 0.018 < 1
  var body = ny > 0.33 && (nx * nx) / (0.03 + 0.12 * (ny - 0.33)) + Math.pow(ny - 0.8, 2) / 0.3 < 1
  return head || body
}

function render(t, cols, rows, ctx) {
  var g = makeGrid(cols, rows)
  var beat = ctx.beat ? ctx.beat.pulse : Math.max(0, Math.sin(t * Math.PI * 2 * 2)) // 2 Hz fallback
  var half = Math.floor(cols * 0.42)
  // left: mosaic silhouette, cells of 2×1, shaded by a slow vertical scan
  for (var y = 1; y < rows - 1; y++) for (var x = 0; x < half; x += 2) {
    if (!silhouette(x, y, half, rows)) { if (hash(x * 131 + y, 7) < 0.03) put(g, x, y, '·', 0); continue }
    var scan = 0.5 + 0.5 * Math.sin(y * 0.6 - t * 6)
    put(g, x, y, scan > 0.7 ? '██' : scan > 0.35 ? '▓▓' : '▒▒', 4)
  }
  // right: the big word, scaled to fit
  var word = 'EXECUTION', scale = Math.max(1, Math.floor((cols - half - 4) / (word.length * 6)))
  var wy = Math.floor(rows / 2 - 2.5 * scale)
  bigText(g, half + 2, wy, word, scale, 4, '█')
  // diagonal tape: cells on the band |x*0.35 - y + offset| < 1.5 carry the scrolling text
  var tape = ' EXECUTION  EXECUTION  ', off = Math.floor(t * 18)
  for (var x2 = 0; x2 < cols; x2++) {
    var yc = Math.round(rows * 0.75 - x2 * 0.35 + rows * 0.3)
    for (var d = -1; d <= 1; d++) {
      var yy = yc + d
      if (yy < 0 || yy >= rows) continue
      if (d === 0) setCell(g, x2, yy, tape[(x2 + off) % tape.length], 3)
      else setCell(g, x2, yy, '█', 4)
    }
  }
  // status line
  put(g, 1, rows - 1, 'runExecution()  #' + String(1 + Math.floor(t / 4) % 12).padStart(2, '0') + '  target: ' + (ctx.lyric ? ctx.lyric.text.split(' ').pop() : 'world'), 4)
  // glitch on the beat: shift some rows and sprinkle noise (deterministic per beat index)
  if (beat > 0.6) {
    var seed = ctx.beat ? ctx.beat.index : Math.floor(t * 2)
    for (var r = 0; r < rows; r++) {
      if (hash(r, seed) < 0.18) {
        var shift = Math.floor((hash(r, seed + 1) - 0.5) * 12)
        var row = g.ch[r].slice(), sty = g.st[r].slice()
        if (row.indexOf('') >= 0) continue // rows with wide characters are left alone
        for (var c = 0; c < cols; c++) { var from = (c - shift + cols) % cols; g.ch[r][c] = row[from]; g.st[r][c] = sty[from] }
      }
    }
  }
  return frameOf(g)
}
