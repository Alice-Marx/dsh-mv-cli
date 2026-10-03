// token-bar.scene.js — the "stdout · tokens" band: lyrics streamed as tokens.
//
// Technique (from the dsh PV preset's bottom band): the current lyric is split into tokens the way
// a tokenizer might (words and punctuation; long words break into two pieces). Each token appears
// when its word is sung (ctx.lyric.words), drawn in an inverted cell box with a pseudo token id
// underneath (crc32 of the token, mod 100000, so ids are stable). The newest token blinks a caret.

/*@grid*/

var CRC = (function () { var table = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table.push(c >>> 0) } return table })()
function crc32(s) { var c = 0xffffffff; for (var i = 0; i < s.length; i++) { var code = s.charCodeAt(i) & 0xff; c = CRC[(c ^ code) & 0xff] ^ (c >>> 8) } return (c ^ 0xffffffff) >>> 0 }
function tokenId(tok) { return crc32(tok.toLowerCase()) % 100000 }

// Words and punctuation; words longer than 7 letters split in two (like sub-word tokens).
function tokenize(word) {
  var out = [], parts = String(word).match(/[A-Za-z']+|[^\sA-Za-z']/g) || []
  for (var i = 0; i < parts.length; i++) {
    var w = parts[i]
    if (w.length > 7) { var k = Math.floor(w.length / 2) + 1; out.push(w.slice(0, k), w.slice(k)) } else out.push(w)
  }
  return out
}

function render(t, cols, rows, ctx) {
  var g = makeGrid(cols, rows)
  var top = rows - 7
  box(g, 1, top, cols - 2, 6, 1, 'stdout · tokens')
  put(g, 3, top + 2, '>', 2)
  if (!ctx.lyric) {
    put(g, 5, top + 2, Math.floor(t * 2) % 2 ? '▌' : ' ', 2)
    center(g, Math.floor(top / 2), '[ instrumental ]', 0)
    return frameOf(g)
  }
  var words = ctx.lyric.words || []
  var x = 5
  for (var w = 0; w <= ctx.lyric.word && w < words.length; w++) {
    var toks = tokenize(words[w].text)
    var age = t - words[w].start
    for (var k = 0; k < toks.length; k++) {
      var tok = toks[k], width = textWidth(tok)
      if (x + width + 2 >= cols - 3) break
      var fresh = w === ctx.lyric.word && age < 0.3
      // inverted token box: █ background with the token drawn dim on top
      fill(g, x, top + 2, width, 1, '█', fresh ? 3 : 1)
      put(g, x, top + 2, tok, 0)
      put(g, x, top + 3, String(tokenId(tok)).slice(0, Math.max(width, 5)), 0)
      x += Math.max(width, 5) + 1
    }
  }
  if (x < cols - 4 && Math.floor(t * 4) % 2) setCell(g, x, top + 2, '▌', 3)
  // above the band: the line itself, large and centred, with the sung part bright
  var line = ctx.lyric.text
  var sung = 0
  for (var i = 0; i <= ctx.lyric.word && i < words.length; i++) { var at = line.indexOf(words[i].text, sung); if (at >= 0) sung = at + words[i].text.length }
  var x0 = Math.floor((cols - textWidth(line)) / 2), yLine = Math.floor(top / 2)
  put(g, x0, yLine, line.slice(0, sung), 3)
  put(g, x0 + textWidth(line.slice(0, sung)), yLine, line.slice(sung), 0)
  if (ctx.next) center(g, yLine + 2, ctx.next.text, 0)
  return frameOf(g)
}
