// Bilingual lyric card, drawn on the canvas from YOUR lyrics file (ctx.lyric).
// Port of lyrics.js / lyrics.css of seasnakes/world.execute-me-wallpaper (MIT); the pack ships no lyric text.
function __roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r[0], y); g.lineTo(x + w - r[1], y); g.quadraticCurveTo(x + w, y, x + w, y + r[1]);
  g.lineTo(x + w, y + h - r[2]); g.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h); g.lineTo(x + r[3], y + h);
  g.quadraticCurveTo(x, y + h, x, y + h - r[3]); g.lineTo(x, y + r[0]); g.quadraticCurveTo(x, y, x + r[0], y); g.closePath();
}
function __fit(g, text, max) {
  if (g.measureText(text).width <= max) return text;
  let s = text;
  while (s.length > 1 && g.measureText(s + '…').width > max) s = s.slice(0, -1);
  return s + '…';
}
var __lyricCount = { key: '', n: 0, seen: [] };
function __lyricNumber(lyric) {
  // Line number: count distinct cue start times seen so far (the card shows 001, 002, …).
  const key = lyric.start.toFixed(2);
  let i = __lyricCount.seen.indexOf(key);
  if (i < 0) { __lyricCount.seen.push(key); __lyricCount.seen.sort((a, b) => Number(a) - Number(b)); i = __lyricCount.seen.indexOf(key); }
  return String(i + 1).padStart(3, '0');
}
function drawLyricCard(g, lyric, W, H) {
  if (!lyric || !(lyric.en || lyric.zh || lyric.text)) return;
  const S = W / 1280;
  const sm = v => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
  const elapsed = lyric.progress * (lyric.end - lyric.start), remaining = lyric.end - lyric.start - elapsed;
  const opacity = Math.min(sm(elapsed / 0.16), sm(remaining / 0.17));
  if (opacity <= 0.01) return;
  const en = lyric.en || (lyric.zh ? '' : lyric.text), zh = lyric.zh && lyric.en ? lyric.zh : (lyric.en ? '' : lyric.zh);
  const enFont = `600 ${22 * S}px "Segoe UI", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`;
  const zhFont = `500 ${21 * S}px "Segoe UI", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`;
  g.save();
  g.font = enFont; const enText = en ? __fit(g, en, 485 * S) : ''; const enW = enText ? g.measureText(enText).width : 0;
  g.font = zhFont; const zhText = zh ? __fit(g, zh, 275 * S) : ''; const zhW = zhText ? g.measureText(zhText).width : 0;
  const gap = 22 * S, numW = 49 * S;
  let w = numW + gap + Math.max(enW, 60 * S) + 25 * S;
  if (zhText) w += gap + 1 * S + gap + Math.max(zhW, 40 * S);
  w = Math.min(w, W - 90 * S);
  const h = 87 * S, x = (W - w) / 2, y = H - 30 * S - h + (1 - opacity) * 6 * S;
  g.globalAlpha = opacity;
  g.shadowColor = 'rgba(0,0,0,0.42)'; g.shadowBlur = 36 * S; g.shadowOffsetY = 14 * S;
  const bg = g.createLinearGradient(x, y, x + w, y + h); bg.addColorStop(0, 'rgba(4,15,27,0.96)'); bg.addColorStop(1, 'rgba(7,16,30,0.91)');
  __roundRect(g, x, y, w, h, [5 * S, 11 * S, 11 * S, 5 * S]); g.fillStyle = bg; g.fill();
  g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0;
  g.strokeStyle = 'rgba(118,202,218,0.35)'; g.lineWidth = 1 * S; g.stroke();
  g.save(); __roundRect(g, x, y, w, h, [5 * S, 11 * S, 11 * S, 5 * S]); g.clip();
  const bar = g.createLinearGradient(0, y, 0, y + h); bar.addColorStop(0, '#6ce4ec'); bar.addColorStop(0.72, '#b56fec'); bar.addColorStop(1, '#ed77ac');
  g.fillStyle = bar; g.fillRect(x, y, 3 * S, h);
  // number column
  g.fillStyle = 'rgba(108,206,222,0.15)'; g.fillRect(x + numW, y, 1 * S, h);
  g.fillStyle = '#73b9c9'; g.font = `500 ${13 * S}px ui-monospace, Consolas, monospace`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(__lyricNumber(lyric), x + 3 * S + numW / 2, y + h / 2);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  let cx = x + numW + gap;
  const label = (text, color, at) => { g.fillStyle = color; g.font = `600 ${10 * S}px ui-monospace, Consolas, monospace`; g.letterSpacing = `${1.6 * S}px`; g.fillText(text, at, y + h / 2 - 10 * S); g.letterSpacing = '0px'; };
  if (enText) {
    label('ENGLISH', '#6c9dae', cx);
    g.font = enFont;
    let px = cx;
    for (const part of enText.split(/(\b[A-Z]{2,}\b)/g).filter(Boolean)) {
      const key = /^[A-Z]{2,}$/.test(part);
      g.fillStyle = key ? '#f29abb' : '#f2f9fb';
      if (key) { g.shadowColor = 'rgba(249,105,173,0.22)'; g.shadowBlur = 13 * S } else { g.shadowColor = 'transparent'; g.shadowBlur = 0 }
      g.fillText(part, px, y + h / 2 + 18 * S); px += g.measureText(part).width;
    }
    g.shadowColor = 'transparent'; g.shadowBlur = 0;
    cx += Math.max(enW, 60 * S) + gap;
  }
  if (zhText) {
    if (enText) {
      const d = g.createLinearGradient(0, y + h / 2 - 19 * S, 0, y + h / 2 + 19 * S); d.addColorStop(0, 'rgba(117,192,210,0)'); d.addColorStop(0.5, 'rgba(117,192,210,0.39)'); d.addColorStop(1, 'rgba(117,192,210,0)');
      g.fillStyle = d; g.fillRect(cx, y + h / 2 - 19 * S, 1 * S, 38 * S); cx += 1 * S + gap;
    }
    label('中文', '#b588aa', cx);
    g.font = zhFont; g.fillStyle = '#d4edef'; g.fillText(zhText, cx, y + h / 2 + 18 * S);
  }
  // progress track
  g.fillStyle = 'rgba(103,184,197,0.14)'; g.fillRect(x + 3 * S, y + h - 2 * S, w - 3 * S, 2 * S);
  const pg = g.createLinearGradient(x, 0, x + w, 0); pg.addColorStop(0, '#62d4e1'); pg.addColorStop(1, '#ed78ab');
  g.fillStyle = pg; g.shadowColor = 'rgba(106,230,239,0.6)'; g.shadowBlur = 9 * S;
  g.fillRect(x + 3 * S, y + h - 2 * S, (w - 3 * S) * Math.max(0, Math.min(1, lyric.progress)), 2 * S);
  g.restore();
  g.restore();
}
