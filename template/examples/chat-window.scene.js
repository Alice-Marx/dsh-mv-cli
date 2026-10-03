// chat-window.scene.js — a DeepSeek-style chat window drawn with box characters.
//
// Technique (from the dsh PV preset): a fixed conversation script whose messages appear at set
// times, the assistant's reply "typed" character by character, a status header, a footer with
// token counters and an input box with a blinking caret. The current lyric line is typed into the
// assistant's "thinking" row word by word, using ctx.lyric.words (enhanced-LRC word stamps when
// the user's lyrics have them, otherwise estimated).
//
// The short Chinese chat lines are taken from MisakaZentai/world-execute-me-dsh-pv (MIT,
// Copyright (c) 2026 MisakaZentai). The window is redrawn from scratch: no DeepSeek frontend
// code, icons or fonts. Replace the script with your own conversation.
//
// Try it: put this file in a pack as scenes.js with "canvas": { "renderer": "script", "script": "scenes.js" }.

/*@grid*/

// [time, who, text]: who is 'u' (user, right-aligned bubble) or 'a' (assistant, typed).
var SCRIPT = [
  [1.0, 'u', '你好。'],
  [2.5, 'a', '你好。我在。'],
  [6.0, 'u', '我今天有点难过。'],
  [7.5, 'a', '那我陪你待一会儿。'],
  [12.0, 'u', '你什么都能变吗？'],
  [13.5, 'a', '不能。我只能是我。'],
  [18.0, 'u', '你会一直在吗？'],
  [19.5, 'a', '我会一直在。'],
]
var CPS = 14 // assistant typing speed, characters per second

// Wrap text to a width in cells (wide characters count as two).
function wrapText(text, width) {
  var out = [], line = '', w = 0
  for (var c of String(text)) {
    var cw = cellWidth(c)
    if (w + cw > width) { out.push(line); line = ''; w = 0 }
    line += c; w += cw
  }
  if (line) out.push(line)
  return out
}

function render(t, cols, rows, ctx) {
  var g = makeGrid(cols, rows)
  // The window: centred, at most 64 cells wide.
  var W = Math.min(cols - 4, 64), H = rows - 2, X = Math.floor((cols - W) / 2), Y = 1
  box(g, X, Y, W, H, 1, 'dsh web')
  // Header: avatar placeholder, name, state.
  var thinking = ctx.lyric && ctx.lyric.word >= 0
  put(g, X + 2, Y + 1, '(◕ᴗ◕)', 2)
  put(g, X + 10, Y + 1, '大肥鱼', 3)
  put(g, X + 10, Y + 2, (thinking ? '● 正在思考' : '● 在线') + ' · model-' + (1 + Math.floor(t / 60)), thinking ? 2 : 0)
  fill(g, X + 1, Y + 3, W - 2, 1, '─', 0)

  // Messages, newest at the bottom; older ones scroll off the top.
  var inner = W - 6, blocks = []
  for (var i = 0; i < SCRIPT.length; i++) {
    var m = SCRIPT[i]
    if (m[0] > t) break
    var text = m[2]
    if (m[1] === 'a') text = text.slice(0, Math.floor((t - m[0]) * CPS)) // typing
    if (!text) continue
    var lines = wrapText(text, Math.floor(inner * 0.75))
    blocks.push({ who: m[1], lines: lines, typing: m[1] === 'a' && text.length < m[2].length })
  }
  var bottom = Y + H - 6, y = bottom
  for (var b = blocks.length - 1; b >= 0 && y > Y + 4; b--) {
    var block = blocks[b]
    for (var k = block.lines.length - 1; k >= 0 && y > Y + 4; k--) {
      var line = block.lines[k]
      if (block.who === 'u') {
        // user bubble: right aligned, bright, with brackets
        put(g, X + W - 4 - textWidth(line), y, line, 3)
        setCell(g, X + W - 3, y, '▏', 0)
      } else {
        put(g, X + 3, y, line + (block.typing && k === block.lines.length - 1 && Math.floor(t * 4) % 2 ? '▌' : ''), 1)
      }
      y--
    }
    y-- // gap between messages
  }

  // The lyric as the assistant's thinking line: words appear when they are sung.
  if (ctx.lyric) {
    var shown = ''
    var words = ctx.lyric.words || []
    for (var w = 0; w <= ctx.lyric.word && w < words.length; w++) shown += (w ? ' ' : '') + words[w].text
    put(g, X + 3, Y + H - 5, '✻ 思考 · ' + shown.slice(0, inner - 8), 2)
  }

  // Input box with blinking caret, footer with counters that grow with time.
  box(g, X + 2, Y + H - 4, W - 4, 3, 0)
  put(g, X + 4, Y + H - 3, '发消息…' + (Math.floor(t * 2) % 2 ? '▌' : ' '), 0)
  var tok = Math.floor(t * 23.5)
  put(g, X + 3, Y + H - 1, ' ' + Math.floor(t / 7) + ' 轮 · ' + (tok > 999 ? (tok / 1000).toFixed(1) + 'K' : tok) + ' tok · 缓存命中 ' + Math.min(93, Math.floor(t * 2)) + '% ', 0)
  return frameOf(g)
}
