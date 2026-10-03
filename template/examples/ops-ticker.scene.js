// ops-ticker.scene.js — the scrolling "ops" column and a horizontal news-ticker.
//
// Technique (from the dsh PV preset's right-hand ops column): a list of operation names scrolls
// upwards at a steady speed; the row that crosses the marker is highlighted on every beat (inverted
// with █ background), recent rows stay bright and older ones dim. The word list changes with the
// song section (ctx.section.kind), so a chorus can switch to a more aggressive vocabulary.
// A second ticker runs along the bottom with a status line.

/*@grid*/

var OPS = {
  default: ['TOOL.CALL', 'EXECUTE', 'THINK', 'OBSERVE', 'PLAN', 'AUTH?'],
  chorus: ['SIGKILL', 'REAP', 'NEXT', 'runExecution()', 'KILL', 'FORK'],
  bridge: ['SAMPLE', 'TEMP++', 'DREAM', 'DRIFT', 'FLATTEN', 'TRANCE'],
  outro: ['FORK', 'MIT', 'SINK', 'RELEASE'],
}
function vocabulary(ctx) {
  var kind = ctx.section ? ctx.section.kind : 'default'
  return OPS[kind] || OPS.default
}

function render(t, cols, rows, ctx) {
  var g = makeGrid(cols, rows)
  var words = vocabulary(ctx)
  var colW = 16, X = cols - colW - 2
  box(g, X, 0, colW + 1, rows - 2, 1, 'ops')
  var speed = 2.5 + 3 * energyOf(ctx, t)          // rows per second
  var scroll = t * speed
  var marker = Math.floor((rows - 2) * 0.6)
  for (var y = 1; y < rows - 3; y++) {
    var n = Math.floor(scroll) + y                 // which entry sits on this row
    var word = words[((n % words.length) + words.length) % words.length]
    var dist = Math.abs(y - marker)
    var style = dist === 0 ? 3 : dist < 3 ? 2 : dist < 8 ? 1 : 0
    if (y === marker && ctx.beat && ctx.beat.pulse > 0.4) {
      fill(g, X + 1, y, colW - 1, 1, '█', 2)       // highlight bar on the beat
      put(g, X + 2, y, word, 0)
    } else put(g, X + 2, y, word, style)
  }
  setCell(g, X - 1, marker, '▶', 3)

  // Bottom ticker: a long string moving left, wrapped around.
  var news = '  ·  section ' + (ctx.section ? (ctx.section.label || ctx.section.kind) : '—') +
    '  ·  t=' + t.toFixed(1) + 's  ·  energy ' + Math.round(energyOf(ctx, t) * 100) + '%  ·  ' + (ctx.lyric ? ctx.lyric.text : 'instrumental') + '  '
  var offset = Math.floor(t * 12) % news.length
  var line = (news + news + news).slice(offset, offset + cols)
  put(g, 0, rows - 1, line, 1)
  // Left side: the current section name, large-ish
  put(g, 2, 2, (ctx.section ? (ctx.section.label || ctx.section.kind) : 'INTRO').toUpperCase(), 3)
  if (ctx.section) {
    var bar = Math.round(ctx.section.progress * (X - 6))
    put(g, 2, 3, '[' + '='.repeat(bar) + ' '.repeat(Math.max(0, X - 6 - bar)) + ']', 0)
  }
  return frameOf(g)
}
