window.__ModuleLoader__.load({
  id: "@ljwei-stak/dsh-mv-cli",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// .dsh-plugin/client/index.jsx
var index_exports = {};
__export(index_exports, {
  PANEL: () => PANEL,
  PLUGIN_NAME: () => PLUGIN_NAME,
  apply: () => apply,
  harnessServices: () => harnessServices,
  inject: () => inject,
  panelApi: () => panelApi,
  registerUi: () => registerUi
});
module.exports = __toCommonJS(index_exports);
var import_react11 = __toESM(require("react"), 1);

// .dsh-plugin/client/mv-panel.jsx
var import_react10 = __toESM(require("react"), 1);

// .dsh-plugin/client/canvas-mv.jsx
var import_react3 = __toESM(require("react"), 1);

// .dsh-plugin/client/mv/renderer.mjs
var PALETTE = Object.freeze([
  "#af875f",
  // 0 DIM     38;5;137
  "#ffaf5f",
  // 1 NORMAL  38;5;215
  "#ffd75f",
  // 2 BRIGHT  38;5;221 bold
  "#ffffd7",
  // 3 WHITE   38;5;230 bold
  "#ff5f5f",
  // 4 RED     38;5;203 bold
  "#875f00",
  // 5         38;5;94
  "#5f5f00"
  // 6         38;5;58
]);
var BOLD = Object.freeze([false, false, true, true, true, false, false]);
var BACKGROUND = "#000000";
var MAX_COLS = 240;
var MAX_ROWS = 85;
var FONT_FAMILY = '"Cascadia Mono", Consolas, "Sarasa Mono SC", "Noto Sans Mono CJK SC", "Microsoft YaHei Mono", Menlo, monospace';
function gridSize(cssWidth, cssHeight, cell) {
  return {
    cols: Math.max(1, Math.min(MAX_COLS, Math.floor(cssWidth / cell.width))),
    rows: Math.max(1, Math.min(MAX_ROWS, Math.floor(cssHeight / cell.height)))
  };
}
function measureCell(ctx2d, fontSize) {
  ctx2d.font = `${fontSize}px ${FONT_FAMILY}`;
  const width2 = ctx2d.measureText("MMMMMMMMMM").width / 10 || fontSize * 0.6;
  return { width: width2, height: Math.ceil(fontSize * 1.18), fontSize };
}
var isAsciiPrintable = (ch) => ch.length === 1 && ch.charCodeAt(0) >= 33 && ch.charCodeAt(0) <= 126;
function rowRuns(row) {
  const runs = [];
  let run = null;
  for (let x = 0; x < row.length; x++) {
    const [ch, style] = row[x];
    if (ch === "" || ch === " ") {
      run = null;
      continue;
    }
    if (isAsciiPrintable(ch)) {
      if (run && run.style === style && run.x + run.text.length === x) run.text += ch;
      else {
        run = { x, style, text: ch, wide: false };
        runs.push(run);
      }
      continue;
    }
    run = null;
    runs.push({ x, style, text: ch, wide: row[x + 1]?.[0] === "" });
  }
  return runs;
}
var GridRenderer = class {
  constructor(canvas, { fontSize = 14, devicePixelRatio = globalThis.devicePixelRatio || 1 } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.dpr = devicePixelRatio;
    this.setFontSize(fontSize);
  }
  setFontSize(fontSize) {
    this.fontSize = fontSize;
    this.cell = measureCell(this.ctx, fontSize);
  }
  /** Resize the backing store to a css box; returns the grid that fits. */
  fit(cssWidth, cssHeight) {
    const grid = gridSize(cssWidth, cssHeight, this.cell);
    const w = Math.ceil(grid.cols * this.cell.width), h = grid.rows * this.cell.height;
    const pw = Math.round(w * this.dpr), ph = Math.round(h * this.dpr);
    if (this.canvas.width !== pw || this.canvas.height !== ph) {
      this.canvas.width = pw;
      this.canvas.height = ph;
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
    }
    this.grid = grid;
    return grid;
  }
  draw(film) {
    const { ctx, cell } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.textBaseline = "middle";
    const fonts = [`${cell.fontSize}px ${FONT_FAMILY}`, `bold ${cell.fontSize}px ${FONT_FAMILY}`];
    let currentFont = -1, currentColor = "";
    for (let y = 0; y < film.h; y++) {
      const cy = y * cell.height + cell.height / 2;
      for (const run of rowRuns(film.cells[y])) {
        const f = BOLD[run.style] ? 1 : 0;
        if (f !== currentFont) {
          ctx.font = fonts[f];
          currentFont = f;
        }
        const color = PALETTE[run.style] ?? PALETTE[1];
        if (color !== currentColor) {
          ctx.fillStyle = color;
          currentColor = color;
        }
        if (run.text.length === 1 && !isAsciiPrintable(run.text)) {
          const span = run.wide ? 2 : 1;
          ctx.textAlign = "center";
          ctx.fillText(run.text, (run.x + span / 2) * cell.width, cy, span * cell.width);
          ctx.textAlign = "left";
        } else {
          ctx.textAlign = "left";
          ctx.fillText(run.text, run.x * cell.width, cy);
        }
      }
    }
  }
};

// .dsh-plugin/shared/mv-lyrics.mjs
var CJK = /[\u3000-\u303f\u3400-\u9fff\uf900-\ufaff\uff00-\uffef]/;
function splitBilingual(lines) {
  const en = [], zh = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/\s+[/|｜]\s+/);
    if (parts.length === 2 && !CJK.test(parts[0]) && CJK.test(parts[1])) {
      en.push(parts[0]);
      zh.push(parts[1]);
      continue;
    }
    ;
    (CJK.test(line) ? zh : en).push(line);
  }
  return { en: en.join(" "), zh: zh.join(" ") };
}
function finish(cues, duration) {
  const sorted = cues.filter((c) => Number.isFinite(c.time) && (c.en || c.zh)).sort((a, b) => a.time - b.time);
  for (let i = 0; i < sorted.length; i++) {
    const next = sorted[i + 1];
    if (!Number.isFinite(sorted[i].end) || sorted[i].end <= sorted[i].time) {
      sorted[i].end = next ? next.time : Math.min(duration, sorted[i].time + 5);
    }
  }
  return sorted.map(({ time, end, en, zh, words }) => ({ time: round3(time), end: round3(end), en: en ?? "", zh: zh ?? "", ...words?.length ? { words } : {} }));
}
var round3 = (v) => Math.round(v * 1e3) / 1e3;
var WORD_STAMP = /<(\d{1,3}):(\d{1,2}(?:[.:]\d{1,3})?)>/g;
function splitWordStamps(line, shift = 0) {
  if (!/<\d{1,3}:\d{1,2}/.test(line)) return { text: line, words: null };
  const words = [];
  let text4 = "", at = null, m, last = 0;
  WORD_STAMP.lastIndex = 0;
  const push = (chunk) => {
    text4 += chunk;
    if (at !== null && chunk.trim()) words.push({ text: chunk.trim(), time: round3(at + shift) });
  };
  while (m = WORD_STAMP.exec(line)) {
    push(line.slice(last, m.index));
    at = Number(m[1]) * 60 + Number(m[2].replace(":", "."));
    last = m.index + m[0].length;
  }
  push(line.slice(last));
  return { text: text4.replace(/\s+/g, " ").trim(), words: words.length ? words : null };
}
function parseLrc(text4, { duration = 1e9 } = {}) {
  const byTime = /* @__PURE__ */ new Map();
  let offsetMs = 0;
  const order = [];
  for (const raw of String(text4).replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const tag = /^\s*\[offset:\s*([+-]?\d+)\s*\]/i.exec(raw);
    if (tag) {
      offsetMs = Number(tag[1]);
      continue;
    }
    const stamps = [];
    let rest = raw;
    let m;
    while (m = /^\s*\[(\d{1,3}):(\d{1,2}(?:[.:]\d{1,3})?)\]/.exec(rest)) {
      stamps.push(Number(m[1]) * 60 + Number(m[2].replace(":", ".")));
      rest = rest.slice(m[0].length);
    }
    if (!stamps.length) continue;
    for (const t of stamps) {
      const key = round3(t);
      if (!byTime.has(key)) {
        byTime.set(key, []);
        order.push(key);
      }
      byTime.get(key).push(rest);
    }
  }
  const shift = -offsetMs / 1e3;
  const cues = [];
  for (const t of order) {
    const lines = byTime.get(t);
    if (lines.every((line) => !line.trim())) {
      cues.push({ time: t + shift, blank: true });
      continue;
    }
    let words = null;
    const plain2 = lines.map((line) => {
      const split = splitWordStamps(line, shift);
      if (split.words && !words) words = split.words;
      return split.text;
    });
    cues.push({ time: t + shift, ...splitBilingual(plain2), ...words ? { words } : {} });
  }
  cues.sort((a, b) => a.time - b.time);
  const out = [];
  for (const cue of cues) {
    if (cue.blank) {
      const prev = out.at(-1);
      if (prev && !Number.isFinite(prev.end)) prev.end = cue.time;
      continue;
    }
    out.push(cue);
  }
  return finish(out, duration);
}
var SRT_TIME = /(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})/;
var srtSeconds = (m) => Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4].padEnd(3, "0")) / 1e3;
function parseSrt(text4, { duration = 1e9 } = {}) {
  const blocks = String(text4).replace(/^\uFEFF/, "").replace(/\r/g, "").split(/\n\s*\n/);
  const cues = [];
  for (const block2 of blocks) {
    const lines = block2.split("\n");
    const at = lines.findIndex((line) => line.includes("-->"));
    if (at < 0) continue;
    const [a, b] = lines[at].split("-->");
    const ma = SRT_TIME.exec(a), mb = SRT_TIME.exec(b);
    if (!ma) continue;
    const body = lines.slice(at + 1).map((line) => line.replace(/<[^>]+>/g, ""));
    cues.push({ time: srtSeconds(ma), end: mb ? srtSeconds(mb) : NaN, ...splitBilingual(body) });
  }
  return finish(cues, duration);
}
function parseLyricsJson(text4, { duration = 1e9 } = {}) {
  const data = typeof text4 === "string" ? JSON.parse(text4.replace(/^\uFEFF/, "")) : text4;
  const list = Array.isArray(data) ? data : Array.isArray(data?.lyrics) ? data.lyrics : null;
  if (!list) throw new Error("\u6B4C\u8BCD JSON \u5E94\u4E3A [{ time, end, en, zh }] \u6570\u7EC4\u3002");
  return finish(list.map((item) => ({
    time: Number(item?.time ?? item?.t),
    end: Number(item?.end),
    en: typeof item?.en === "string" ? item.en : "",
    zh: typeof item?.zh === "string" ? item.zh : typeof item?.cn === "string" ? item.cn : "",
    words: jsonWords(item?.words)
  })), duration);
}
function jsonWords(value) {
  if (value === void 0 || value === null) return void 0;
  if (!Array.isArray(value) || value.length > 400 || value.some((w) => !w || typeof w.text !== "string" || !Number.isFinite(w.time))) throw new Error("\u6B4C\u8BCD words \u5E94\u4E3A\u6700\u591A 400 \u4E2A { text, time }\uFF0C\u4E0D\u80FD\u622A\u65AD\u6216\u4E22\u5F03\u9010\u8BCD\u65F6\u95F4\u3002");
  return value.map((w) => ({ text: w.text, time: w.time }));
}
var JS_GAP = String.raw`(?:\s|\/\*[\s\S]*?\*\/|\/\/[^\r\n]*(?:\r\n?|\n|$))*`;
var JS_LYRICS_DECL = new RegExp(`\\b(?:const|let|var)\\b${JS_GAP}LYRICS\\b${JS_GAP}=`, "i");
var looksLikeLyricsJs = (text4) => {
  const body = String(text4);
  return !/^\s*[\[{]/.test(body) && JS_LYRICS_DECL.test(body);
};
function lyricModuleReader(text4) {
  const source = String(text4).replace(/^\uFEFF/, "");
  if (source.length > 2 * 1024 * 1024) throw new Error("\u6B4C\u8BCD JS \u8D85\u8FC7 2 Mi \u5B57\u7B26\u9650\u5236\u3002");
  let at = 0, cached = null, items = 0, literalMode = false, regexAllowed = true;
  const numberPattern = /[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/iy;
  const fail5 = (message) => {
    throw new Error(`\u6B4C\u8BCD JS\uFF1A${message}\uFF08\u4F4D\u7F6E ${at}\uFF09\u3002\u53EA\u8BFB\u53D6 LYRICS \u9759\u6001\u6570\u7EC4\uFF0C\u4E0D\u6267\u884C\u4EE3\u7801\u3002`);
  };
  const token = () => {
    while (at < source.length) {
      if (/\s/.test(source[at])) {
        at++;
        continue;
      }
      if (source.startsWith("//", at)) {
        while (at < source.length && !/[\r\n]/.test(source[at])) at++;
        continue;
      }
      if (source.startsWith("/*", at)) {
        const end = source.indexOf("*/", at + 2);
        if (end < 0) fail5("\u6CE8\u91CA\u672A\u95ED\u5408");
        at = end + 2;
        continue;
      }
      break;
    }
    if (at >= source.length) return { kind: "eof", value: "" };
    const c = source[at++];
    if (!literalMode && c === "/" && regexAllowed) {
      let inClass = false, closed = false;
      while (at < source.length) {
        const ch = source[at++];
        if (/[\r\n]/.test(ch)) fail5("\u524D\u7F6E\u6B63\u5219\u5B57\u9762\u91CF\u672A\u95ED\u5408");
        if (ch === "\\") {
          at++;
          continue;
        }
        if (ch === "[") inClass = true;
        if (ch === "]") inClass = false;
        if (ch === "/" && !inClass) {
          closed = true;
          break;
        }
      }
      if (!closed) fail5("\u524D\u7F6E\u6B63\u5219\u5B57\u9762\u91CF\u672A\u95ED\u5408");
      while (at < source.length && /[a-z]/i.test(source[at])) at++;
      return { kind: "opaque", value: "" };
    }
    if (c === '"' || c === "'" || c === "`") {
      let value = "", closed = false;
      while (at < source.length) {
        const ch = source[at++];
        if (ch === c) {
          closed = true;
          break;
        }
        if (c === "`" && ch === "$" && source[at] === "{") fail5("\u4E0D\u652F\u6301\u6A21\u677F\u63D2\u503C");
        if (c !== "`" && /[\r\n]/.test(ch)) fail5("\u5B57\u7B26\u4E32\u672A\u95ED\u5408");
        if (ch !== "\\") {
          value += ch;
          continue;
        }
        if (at >= source.length) fail5("\u5B57\u7B26\u4E32\u8F6C\u4E49\u672A\u95ED\u5408");
        const esc = source[at++];
        if (esc === "\n") continue;
        if (esc === "\r") {
          if (source[at] === "\n") at++;
          continue;
        }
        const simple = { n: "\n", r: "\r", t: "	", b: "\b", f: "\f", v: "\v", "0": "\0", "\\": "\\", '"': '"', "'": "'", "`": "`", "/": "/", "$": "$" };
        if (Object.hasOwn(simple, esc)) {
          if (esc === "0" && /\d/.test(source[at] ?? "")) fail5("\u4E0D\u652F\u6301\u516B\u8FDB\u5236\u8F6C\u4E49");
          value += simple[esc];
          continue;
        }
        if (esc === "x" || esc === "u") {
          let hex;
          if (esc === "u" && source[at] === "{") {
            const end = source.indexOf("}", ++at);
            if (end < 0) fail5("Unicode \u8F6C\u4E49\u672A\u95ED\u5408");
            hex = source.slice(at, end);
            if (!/^[\da-f]{1,6}$/i.test(hex) || parseInt(hex, 16) > 1114111) fail5("Unicode \u8F6C\u4E49\u65E0\u6548");
            at = end + 1;
          } else {
            const size = esc === "x" ? 2 : 4;
            hex = source.slice(at, at + size);
            if (!(size === 2 ? /^[\da-f]{2}$/i : /^[\da-f]{4}$/i).test(hex)) fail5("\u5B57\u7B26\u4E32\u8F6C\u4E49\u65E0\u6548");
            at += size;
          }
          value += String.fromCodePoint(parseInt(hex, 16));
          continue;
        }
        fail5("\u4E0D\u652F\u6301\u7684\u5B57\u7B26\u4E32\u8F6C\u4E49");
      }
      if (!closed) fail5("\u5B57\u7B26\u4E32\u672A\u95ED\u5408");
      return { kind: "string", value };
    }
    if (/[A-Za-z_$]/.test(c)) {
      const start = at - 1;
      while (at < source.length && /[\w$]/.test(source[at])) at++;
      return { kind: "id", value: source.slice(start, at) };
    }
    if (/[\d.+-]/.test(c)) {
      numberPattern.lastIndex = at - 1;
      const match = numberPattern.exec(source);
      if (match) {
        at += match[0].length - 1;
        return { kind: "number", value: Number(match[0]) };
      }
    }
    if (c === "=" && source[at] === ">") {
      at++;
      return { kind: "punct", value: "=>" };
    }
    return { kind: "punct", value: c };
  };
  const peek = () => cached ?? (cached = token());
  const next = () => {
    const result = peek();
    cached = null;
    regexAllowed = result.kind === "punct" && /^(?:[=(:,;!&|?{}]|=>)$/.test(result.value) || result.kind === "id" && ["return", "throw", "case", "typeof", "void", "delete", "yield", "await"].includes(result.value);
    return result;
  };
  const isPunct = (t, value) => t.kind === "punct" && t.value === value;
  const expect = (value) => {
    if (!isPunct(next(), value)) fail5(`\u671F\u671B ${value}`);
  };
  const literal = (depth2 = 0) => {
    if (depth2 > 3 || ++items > 1e5) fail5("\u6570\u636E\u7ED3\u6784\u8FC7\u6DF1\u6216\u8FC7\u5927");
    const t = next();
    if (t.kind === "string") return t.value;
    if (t.kind === "number" && Number.isFinite(t.value)) return t.value;
    if (t.kind === "id" && ["null", "true", "false"].includes(t.value)) return t.value === "null" ? null : t.value === "true";
    if (isPunct(t, "[")) {
      const array = [];
      while (!isPunct(peek(), "]")) {
        if (array.length >= 1e4) fail5("\u6570\u7EC4\u8D85\u8FC7 10000 \u9879");
        array.push(literal(depth2 + 1));
        if (isPunct(peek(), "]")) break;
        expect(",");
      }
      expect("]");
      return array;
    }
    if (isPunct(t, "{")) {
      const object2 = /* @__PURE__ */ Object.create(null);
      while (!isPunct(peek(), "}")) {
        const key = next();
        if (!["id", "string"].includes(key.kind) || ["__proto__", "constructor", "prototype"].includes(key.value)) fail5("\u4E0D\u5141\u8BB8\u8BA1\u7B97\u952E\u3001\u5C55\u5F00\u3001\u65B9\u6CD5\u6216\u539F\u578B\u5B57\u6BB5");
        if (Object.hasOwn(object2, key.value)) fail5("\u91CD\u590D\u5B57\u6BB5");
        expect(":");
        object2[key.value] = literal(depth2 + 1);
        if (isPunct(peek(), "}")) break;
        expect(",");
      }
      expect("}");
      return object2;
    }
    fail5("\u6570\u7EC4\u91CC\u53EA\u80FD\u4F7F\u7528\u5B57\u7B26\u4E32\u3001\u6709\u9650\u6570\u5B57\u548C\u9759\u6001\u5BF9\u8C61\uFF0C\u4E0D\u80FD\u4F7F\u7528\u8868\u8FBE\u5F0F\u6216\u51FD\u6570\u8C03\u7528");
  };
  let depth = 0, state = 0;
  for (let t = next(); t.kind !== "eof"; t = next()) {
    if (depth === 0 && t.kind === "id" && ["const", "let", "var"].includes(t.value)) {
      state = 1;
      continue;
    }
    if (state === 1) {
      state = t.kind === "id" && t.value.toUpperCase() === "LYRICS" ? 2 : 0;
      if (state) continue;
    } else if (state === 2) {
      if (!isPunct(t, "=")) fail5("LYRICS \u5E94\u76F4\u63A5\u8D4B\u503C\u4E3A\u9759\u6001\u6570\u7EC4");
      literalMode = true;
      if (!isPunct(peek(), "[")) fail5("LYRICS \u5E94\u4E3A\u9759\u6001\u6570\u7EC4");
      const data = literal();
      const after = next();
      if (after.kind !== "eof" && !isPunct(after, ";")) fail5("\u4E0D\u5141\u8BB8\u5728\u6570\u7EC4\u540E\u8C03\u7528\u65B9\u6CD5\u6216\u8BA1\u7B97\u8868\u8FBE\u5F0F\uFF1B\u8BF7\u7528\u5206\u53F7\u7ED3\u675F\u58F0\u660E");
      return data;
    }
    if (t.kind === "punct" && ["{", "[", "("].includes(t.value)) depth++;
    else if (t.kind === "punct" && ["}", "]", ")"].includes(t.value)) depth = Math.max(0, depth - 1);
  }
  fail5("\u627E\u4E0D\u5230 const LYRICS = [...] \u6570\u636E\u58F0\u660E");
}
function parseLyricsJs(text4, options) {
  const data = lyricModuleReader(text4);
  if (!data.every((item) => item !== null && typeof item === "object" && !Array.isArray(item))) throw new Error("\u6B4C\u8BCD JS \u7684 LYRICS \u5E94\u4E3A [{ t, en, cn }] \u6216 [{ time, en, zh }] \u9759\u6001\u5BF9\u8C61\u6570\u7EC4\u3002");
  const ordered = data.slice().sort((a, b) => Number(a.time ?? a.t) - Number(b.time ?? b.t));
  for (let i = 0; i < ordered.length; i++) {
    const item = ordered[i], next = ordered[i + 1];
    if (!Object.hasOwn(item, "time") && Number.isFinite(item.t) && !Object.hasOwn(item, "end")) {
      const nextTime = Number(next?.time ?? next?.t);
      item.end = Math.min(Number.isFinite(nextTime) ? nextTime - 0.08 : Infinity, item.t + 6.5, options?.duration ?? 1e9);
    }
  }
  return parseLyricsJson(ordered, options);
}
function parseLyrics(name, text4, options) {
  const lower = String(name ?? "").toLowerCase();
  const body = String(text4);
  if (lower.endsWith(".js") || lower.endsWith(".mjs") || looksLikeLyricsJs(body)) return parseLyricsJs(body, options);
  if (lower.endsWith(".json")) return parseLyricsJson(body, options);
  if (lower.endsWith(".srt") || lower.endsWith(".vtt")) return parseSrt(body, options);
  if (lower.endsWith(".lrc")) return parseLrc(body, options);
  if (/^\uFEFF?\s*(?:\{|\[\s*[{\]])/.test(body)) return parseLyricsJson(body, options);
  if (/-->/.test(body)) return parseSrt(body, options);
  return parseLrc(body, options);
}

// .dsh-plugin/client/mv/spectrum.mjs
var BANDS = 48;
var SILENT = Object.freeze(new Array(BANDS).fill(0));
function spectrumFromJson(text4) {
  const data = typeof text4 === "string" ? JSON.parse(text4.replace(/^\uFEFF/, "")) : text4;
  const fps = Number(data?.fps);
  const frames = data?.frames;
  if (!Number.isFinite(fps) || fps <= 0 || !Array.isArray(frames) || !frames.length) throw new Error("spectrum.json \u683C\u5F0F\u65E0\u6548\uFF08\u9700\u8981 fps \u4E0E frames\uFF09\u3002");
  return (t) => frames[Math.min(frames.length - 1, Math.max(0, Math.trunc(t * fps)))] ?? SILENT;
}
function bandEdges(binCount, sampleRate, bands = BANDS, lo = 40, hi = 16e3) {
  const nyquist = sampleRate / 2;
  const edges = [];
  for (let i = 0; i <= bands; i++) {
    const f = lo * Math.pow(hi / lo, i / bands);
    edges.push(Math.min(binCount, Math.max(1, Math.round(f / nyquist * binCount))));
  }
  for (let i = 1; i < edges.length; i++) if (edges[i] <= edges[i - 1]) edges[i] = Math.min(binCount, edges[i - 1] + 1);
  return edges;
}
function foldBands(bytes, edges, peaks, decay = 0.995) {
  const out = new Array(edges.length - 1);
  for (let b = 0; b < out.length; b++) {
    let sum = 0, n = 0;
    for (let i = edges[b]; i < Math.max(edges[b] + 1, edges[b + 1]); i++) {
      sum += bytes[i] ?? 0;
      n++;
    }
    const v = n ? sum / n / 255 : 0;
    peaks[b] = Math.max(v, (peaks[b] ?? 0) * decay, 0.08);
    out[b] = Math.max(0, Math.min(1, (v / peaks[b]) ** 1.6));
  }
  return out;
}
var LiveSpectrum = class {
  constructor(audio, AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext) {
    this.audio = audio;
    this.Ctx = AudioContextClass;
    this.context = null;
    this.peaks = [];
    this.last = SILENT;
  }
  /** Must run from a user gesture (play button / key). */
  ensure() {
    if (this.context || !this.Ctx) {
      void this.context?.resume?.();
      return;
    }
    this.context = new this.Ctx();
    const source = this.context.createMediaElementSource(this.audio);
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 4096;
    this.analyser.smoothingTimeConstant = 0.55;
    source.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    this.bytes = new Uint8Array(this.analyser.frequencyBinCount);
    this.edges = bandEdges(this.analyser.frequencyBinCount, this.context.sampleRate);
  }
  /** Bands for the current audio frame (t is ignored: the analyser is live). */
  energy() {
    if (!this.analyser || this.audio.paused) return this.last.map((v) => v * 0.9);
    this.analyser.getByteFrequencyData(this.bytes);
    this.last = foldBands(this.bytes, this.edges, this.peaks);
    return this.last;
  }
  close() {
    void this.context?.close?.();
    this.context = null;
    this.analyser = null;
  }
};
var silentEnergy = () => SILENT;

// .dsh-plugin/client/mv/sync.mjs
var KNOWN_AUDIO = Object.freeze([
  Object.freeze({ sha256: "40e902c06dd2f5eee367ccc2fb9060a5e72d93870674ff7e3c8b63160e75f409", label: "world.execute-me-ascii \u9644\u5E26\u7248\u672C\uFF08AAC\uFF0C211.9 s\uFF09", audioOffset: 0, measured: true }),
  Object.freeze({ sha256: "8b7a415ffbc5100c4e3ab5f7230cdfd3a5e02d87e1af8b5437dbff40b2900db5", label: "world-execute-me-dsh-pv input/song.mp3\uFF08AAC\uFF0C211.9 s\uFF09", audioOffset: 0.12, measured: true }),
  Object.freeze({ sha256: "79c4e53663c7966b7160bff19326e614658485d4ce0199ff82715ea9d0a418fc", label: "dsh-pv \u53C2\u8003 MP3\uFF08320 kbps\uFF0C211.9 s\uFF09", audioOffset: 0.12, measured: false }),
  Object.freeze({ sha256: "f98eaa583aaec0b5f9d5ffee25a1a22c39587ba28524bd453dd1dc22be13c2d5", label: "world_execute_me \u9644\u5E26\u7248\u672C\uFF08AAC\uFF0C224.5 s\uFF0C\u524D\u594F\u591A 4.8 s\uFF09", audioOffset: -4.83, measured: true })
]);
async function sha256Hex(buffer, subtle = globalThis.crypto?.subtle) {
  if (!subtle) throw new Error("\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301 SubtleCrypto\u3002");
  const digest = await subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function knownAudio(sha, table) {
  const value = String(sha ?? "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(value)) return null;
  return table.find((item) => item.sha256 === value || item.sha256.length >= 12 && value.startsWith(item.sha256)) ?? null;
}
var KEY = "dsh-mv.sync.v1";
function readAll(storage) {
  try {
    const data = JSON.parse(storage?.getItem(KEY) ?? "{}");
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}
function loadOffsets(sha, table, storage = globalThis.localStorage) {
  const saved = readAll(storage)[sha];
  const known = knownAudio(sha, table);
  return {
    audioOffset: Number.isFinite(saved?.audioOffset) ? saved.audioOffset : known?.audioOffset ?? 0,
    subtitleOffset: Number.isFinite(saved?.subtitleOffset) ? saved.subtitleOffset : 0,
    known,
    saved: Boolean(saved)
  };
}
function saveOffsets(sha, { audioOffset, subtitleOffset }, storage = globalThis.localStorage) {
  if (!sha) return;
  const all = readAll(storage);
  all[sha] = { audioOffset: roundOffset(audioOffset), subtitleOffset: roundOffset(subtitleOffset), at: Date.now() };
  try {
    storage?.setItem(KEY, JSON.stringify(all));
  } catch {
  }
}
function resetOffsets(sha, storage = globalThis.localStorage) {
  const all = readAll(storage);
  delete all[sha];
  try {
    storage?.setItem(KEY, JSON.stringify(all));
  } catch {
  }
}
var roundOffset = (value) => Math.round((Number(value) || 0) * 100) / 100;
var formatOffset = (value) => `${value < 0 ? "\u2212" : "+"}${Math.abs(value).toFixed(2)} s`;

// .dsh-plugin/client/mv/media-store.mjs
var DB = "dsh-mv";
var STORE = "media";
var VERSION = 1;
function request(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB \u8BF7\u6C42\u5931\u8D25"));
  });
}
function openMediaStore(idb = globalThis.indexedDB) {
  if (!idb) return Promise.resolve(null);
  const req = idb.open(DB, VERSION);
  req.onupgradeneeded = () => {
    if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
  };
  return request(req).catch(() => null);
}
async function tx(db, mode, fn) {
  if (!db) return void 0;
  const store = db.transaction(STORE, mode).objectStore(STORE);
  return request(fn(store));
}
async function putMedia(db, slot, record) {
  try {
    await tx(db, "readwrite", (store) => store.put({ ...record, savedAt: Date.now() }, slot));
  } catch {
  }
}
async function getMedia(db, slot) {
  try {
    return await tx(db, "readonly", (store) => store.get(slot)) ?? null;
  } catch {
    return null;
  }
}
async function deleteMedia(db, slot) {
  try {
    await tx(db, "readwrite", (store) => store.delete(slot));
  } catch {
  }
}

// .dsh-plugin/client/mv/player-state.mjs
var DEFAULT_DURATION = 240;
var SilentClock = class {
  constructor(now = () => performance.now()) {
    this.now = now;
    this.base = 0;
    this.since = null;
  }
  get playing() {
    return this.since !== null;
  }
  time() {
    return this.base + (this.since === null ? 0 : (this.now() - this.since) / 1e3);
  }
  play() {
    if (this.since === null) this.since = this.now();
  }
  pause() {
    this.base = this.time();
    this.since = null;
  }
  seek(t) {
    this.base = t;
    if (this.since !== null) this.since = this.now();
  }
};
var FilmClock = class {
  constructor({ audio = null, silent = new SilentClock(), audioOffset = 0, duration = DEFAULT_DURATION } = {}) {
    this.audio = audio;
    this.silent = silent;
    this.audioOffset = audioOffset;
    this.duration = duration;
  }
  get hasAudio() {
    return Boolean(this.audio?.src || this.audio?.currentSrc);
  }
  get playing() {
    return this.hasAudio ? !this.audio.paused : this.silent.playing;
  }
  time() {
    return this.hasAudio ? this.audio.currentTime + this.audioOffset : this.silent.time();
  }
  async play() {
    if (this.hasAudio) await this.audio.play();
    else this.silent.play();
  }
  pause() {
    if (this.hasAudio) this.audio.pause();
    else this.silent.pause();
  }
  /** Seek in film time. */
  seek(t) {
    const target = Math.min(this.duration, t);
    if (this.hasAudio) {
      const at = target - this.audioOffset;
      const end = Number.isFinite(this.audio.duration) ? this.audio.duration - 0.05 : Infinity;
      this.audio.currentTime = Math.max(0, Math.min(end, at));
    } else this.silent.seek(Math.max(0, target));
  }
};
function frameTime(t, started, duration = DEFAULT_DURATION) {
  if (!started || t < 0) return { t: Math.max(0, t), ready: !started || t < 0 };
  return { t: Math.min(t, duration - 1e-3), ready: false };
}
function stepCue(times, t, direction) {
  if (!times.length) return null;
  let lo = 0, hi = times.length;
  while (lo < hi) {
    const mid = lo + hi >> 1;
    if (t + 0.03 < times[mid]) hi = mid;
    else lo = mid + 1;
  }
  const i = Math.min(times.length - 1, Math.max(0, lo - 1 + (direction > 0 ? 1 : -1)));
  return times[i];
}
function keyAction({ key, altKey = false, ctrlKey = false, metaKey = false }) {
  if (ctrlKey || metaKey) return null;
  switch (key) {
    case " ":
    case "Enter":
      return { type: "toggle" };
    case "ArrowLeft":
      return { type: "seekBy", delta: -5 };
    case "ArrowRight":
      return { type: "seekBy", delta: 5 };
    case "r":
    case "R":
      return { type: "restart" };
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
      return { type: "chapter", index: Number(key) - 1 };
    case "[":
      return altKey ? { type: "audioOffset", delta: -0.1 } : { type: "subtitleOffset", delta: 0.1 };
    case "]":
      return altKey ? { type: "audioOffset", delta: 0.1 } : { type: "subtitleOffset", delta: -0.1 };
    case "\u201C":
      return { type: "audioOffset", delta: -0.1 };
    // macOS Alt+[
    case "\u2018":
      return { type: "audioOffset", delta: 0.1 };
    // macOS Alt+]
    case ",":
      return { type: "cue", direction: -1 };
    case ".":
      return { type: "cue", direction: 1 };
    case "+":
    case "=":
      return { type: "volume", delta: 0.05 };
    case "-":
      return { type: "volume", delta: -0.05 };
    case "m":
    case "M":
      return { type: "mute" };
    case "h":
    case "H":
    case "?":
      return { type: "help" };
    case "Escape":
      return { type: "escape" };
    case "f":
    case "F":
      return { type: "fullscreen" };
    default:
      return null;
  }
}
var stepOffset = (value, delta) => roundOffset(value + delta);

// .dsh-plugin/client/mv/width-table.gen.mjs
var WIDE = [[4352, 4447], [8986, 8987], [9001, 9002], [9193, 9196], [9200, 9200], [9203, 9203], [9725, 9726], [9748, 9749], [9800, 9811], [9855, 9855], [9875, 9875], [9889, 9889], [9898, 9899], [9917, 9918], [9924, 9925], [9934, 9934], [9940, 9940], [9962, 9962], [9970, 9971], [9973, 9973], [9978, 9978], [9981, 9981], [9989, 9989], [9994, 9995], [10024, 10024], [10060, 10060], [10062, 10062], [10067, 10069], [10071, 10071], [10133, 10135], [10160, 10160], [10175, 10175], [11035, 11036], [11088, 11088], [11093, 11093], [11904, 11929], [11931, 12019], [12032, 12245], [12272, 12350], [12353, 12438], [12441, 12543], [12549, 12591], [12593, 12686], [12688, 12771], [12783, 12830], [12832, 12871], [12880, 19903], [19968, 42124], [42128, 42182], [43360, 43388], [44032, 55203], [63744, 64255], [65040, 65049], [65072, 65106], [65108, 65126], [65128, 65131], [65281, 65376], [65504, 65510], [94176, 94180], [94192, 94193], [94208, 100343], [100352, 101589], [101632, 101640], [110576, 110579], [110581, 110587], [110589, 110590], [110592, 110882], [110898, 110898], [110928, 110930], [110933, 110933], [110948, 110951], [110960, 111355], [126980, 126980], [127183, 127183], [127374, 127374], [127377, 127386], [127488, 127490], [127504, 127547], [127552, 127560], [127568, 127569], [127584, 127589], [127744, 127776], [127789, 127797], [127799, 127868], [127870, 127891], [127904, 127946], [127951, 127955], [127968, 127984], [127988, 127988], [127992, 128062], [128064, 128064], [128066, 128252], [128255, 128317], [128331, 128334], [128336, 128359], [128378, 128378], [128405, 128406], [128420, 128420], [128507, 128591], [128640, 128709], [128716, 128716], [128720, 128722], [128725, 128727], [128732, 128735], [128747, 128748], [128756, 128764], [128992, 129003], [129008, 129008], [129292, 129338], [129340, 129349], [129351, 129535], [129648, 129660], [129664, 129672], [129680, 129725], [129727, 129733], [129742, 129755], [129760, 129768], [129776, 129784], [131072, 196605], [196608, 262141]];
var COMBINING = [[768, 846], [848, 879], [1155, 1159], [1425, 1469], [1471, 1471], [1473, 1474], [1476, 1477], [1479, 1479], [1552, 1562], [1611, 1631], [1648, 1648], [1750, 1756], [1759, 1764], [1767, 1768], [1770, 1773], [1809, 1809], [1840, 1866], [2027, 2035], [2045, 2045], [2070, 2073], [2075, 2083], [2085, 2087], [2089, 2093], [2137, 2139], [2200, 2207], [2250, 2273], [2275, 2303], [2364, 2364], [2381, 2381], [2385, 2388], [2492, 2492], [2509, 2509], [2558, 2558], [2620, 2620], [2637, 2637], [2748, 2748], [2765, 2765], [2876, 2876], [2893, 2893], [3021, 3021], [3132, 3132], [3149, 3149], [3157, 3158], [3260, 3260], [3277, 3277], [3387, 3388], [3405, 3405], [3530, 3530], [3640, 3642], [3656, 3659], [3768, 3770], [3784, 3787], [3864, 3865], [3893, 3893], [3895, 3895], [3897, 3897], [3953, 3954], [3956, 3956], [3962, 3965], [3968, 3968], [3970, 3972], [3974, 3975], [4038, 4038], [4151, 4151], [4153, 4154], [4237, 4237], [4957, 4959], [5908, 5909], [5940, 5940], [6098, 6098], [6109, 6109], [6313, 6313], [6457, 6459], [6679, 6680], [6752, 6752], [6773, 6780], [6783, 6783], [6832, 6845], [6847, 6862], [6964, 6964], [6980, 6980], [7019, 7027], [7082, 7083], [7142, 7142], [7154, 7155], [7223, 7223], [7376, 7378], [7380, 7392], [7394, 7400], [7405, 7405], [7412, 7412], [7416, 7417], [7616, 7679], [8400, 8412], [8417, 8417], [8421, 8432], [11503, 11505], [11647, 11647], [11744, 11775], [12330, 12335], [12441, 12442], [42607, 42607], [42612, 42621], [42654, 42655], [42736, 42737], [43014, 43014], [43052, 43052], [43204, 43204], [43232, 43249], [43307, 43309], [43347, 43347], [43443, 43443], [43456, 43456], [43696, 43696], [43698, 43700], [43703, 43704], [43710, 43711], [43713, 43713], [43766, 43766], [44013, 44013], [64286, 64286], [65056, 65071], [66045, 66045], [66272, 66272], [66422, 66426], [68109, 68109], [68111, 68111], [68152, 68154], [68159, 68159], [68325, 68326], [68900, 68903], [69291, 69292], [69373, 69375], [69446, 69456], [69506, 69509], [69702, 69702], [69744, 69744], [69759, 69759], [69817, 69818], [69888, 69890], [69939, 69940], [70003, 70003], [70080, 70080], [70090, 70090], [70197, 70198], [70377, 70378], [70459, 70460], [70477, 70477], [70502, 70508], [70512, 70516], [70722, 70722], [70726, 70726], [70750, 70750], [70850, 70851], [71103, 71104], [71231, 71231], [71350, 71351], [71467, 71467], [71737, 71738], [71997, 71998], [72003, 72003], [72160, 72160], [72244, 72244], [72263, 72263], [72345, 72345], [72767, 72767], [73026, 73026], [73028, 73029], [73111, 73111], [73537, 73538], [92912, 92916], [92976, 92982], [94192, 94193], [113822, 113822], [119141, 119145], [119149, 119154], [119163, 119170], [119173, 119179], [119210, 119213], [119362, 119364], [122880, 122886], [122888, 122904], [122907, 122913], [122915, 122916], [122918, 122922], [123023, 123023], [123184, 123190], [123566, 123566], [123628, 123631], [124140, 124143], [125136, 125142], [125252, 125258]];

// .dsh-plugin/client/mv/grid.mjs
var DIM = 0;
var NORMAL = 1;
var BRIGHT = 2;
var WHITE = 3;
var within = (ranges, cp) => {
  let lo = 0, hi = ranges.length - 1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (cp < ranges[mid][0]) hi = mid - 1;
    else if (cp > ranges[mid][1]) lo = mid + 1;
    else return true;
  }
  return false;
};
var widths = /* @__PURE__ */ new Map();
function cw(ch) {
  let n = widths.get(ch);
  if (n === void 0) {
    const cp = ch.codePointAt(0) ?? 32;
    n = within(COMBINING, cp) ? 0 : within(WIDE, cp) ? 2 : 1;
    if (widths.size < 8192) widths.set(ch, n);
  }
  return n;
}
var width = (text4) => {
  let n = 0;
  for (const ch of String(text4)) n += cw(ch);
  return n;
};
function crop(text4, n) {
  let out = "", used = 0;
  for (const ch of String(text4)) {
    const k = cw(ch);
    if (used + k > n) break;
    out += ch;
    used += k;
  }
  return out;
}
function wrap(text4, n) {
  const lines = [];
  let rest = String(text4).trim();
  if (n < 1) return [rest];
  while (rest) {
    if (width(rest) <= n) {
      lines.push(rest);
      break;
    }
    let head = crop(rest, n) || [...rest][0];
    const space = head.lastIndexOf(" ");
    if (space > 0 && rest[head.length] !== " ") head = head.slice(0, space);
    lines.push(head.trimEnd());
    rest = rest.slice(head.length).trimStart();
  }
  return lines.length ? lines : [""];
}
var Grid = class {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.cells = Array.from({ length: h }, () => Array.from({ length: w }, () => [" ", DIM]));
  }
  /** Write text from column x on row y (clipped at the edges; wide characters never split). */
  put(x, y, text4, style = NORMAL) {
    x = Math.trunc(x);
    y = Math.trunc(y);
    if (y < 0 || y >= this.h) return;
    const row = this.cells[y];
    for (const ch of String(text4)) {
      const k = cw(ch);
      if (!k) continue;
      if (x >= 0 && x + k <= this.w) {
        row[x] = [ch, style];
        if (k === 2) row[x + 1] = ["", style];
      }
      x += k;
    }
  }
  center(y, text4, style = NORMAL) {
    this.put(Math.floor((this.w - width(text4)) / 2), y, text4, style);
  }
  fill(y0, y1, style = DIM) {
    for (let y = Math.max(0, y0); y <= Math.min(this.h - 1, y1); y++) this.put(0, y, " ".repeat(this.w), style);
  }
  frame(x, y, w, h, style = DIM) {
    if (w < 2 || h < 2) return;
    const edge = `+${"-".repeat(w - 2)}+`;
    this.put(x, y, edge, style);
    this.put(x, y + h - 1, edge, style);
    for (let yy = y + 1; yy < y + h - 1; yy++) {
      this.put(x, yy, "|", style);
      this.put(x + w - 1, yy, "|", style);
    }
  }
  text() {
    return this.cells.map((row) => row.map((cell) => cell[0]).join("")).join("\n");
  }
  /** Same as text() (the name the ported Canvas used in tests). */
  plain() {
    return this.text();
  }
};
function drawHelp(grid, lines, offset = 0) {
  const all = [...lines, `\u5B57\u5E55\u504F\u79FB ${offset < 0 ? "-" : "+"}${Math.abs(offset).toFixed(1)}s`];
  const w = Math.min(grid.w - 4, 58), h = all.length + 3;
  const x = Math.floor((grid.w - w) / 2), y = Math.floor((grid.h - h) / 2);
  for (let yy = y; yy < y + h; yy++) grid.put(x, yy, " ".repeat(w), NORMAL);
  grid.frame(x, y, w, h, BRIGHT);
  all.forEach((line, i) => grid.put(x + 3, y + 2 + i, crop(line, w - 5), i === 0 ? WHITE : NORMAL));
}
var HELP_LINES = Object.freeze([
  "CONTROLS / \u64CD\u4F5C",
  "SPACE / ENTER   \u64AD\u653E\u6216\u6682\u505C",
  "LEFT / RIGHT    \u540E\u9000\u6216\u524D\u8FDB 5 \u79D2",
  "R               \u4ECE\u5934\u64AD\u653E",
  "1 2 3 4 5       \u8DF3\u8F6C\u7AE0\u8282 / \u6BB5\u843D",
  "[ / ]           \u5B57\u5E55\u63D0\u524D / \u5EF6\u540E 0.1 \u79D2",
  ", / .           \u4E0A\u4E00\u53E5 / \u4E0B\u4E00\u53E5",
  "+ / -           \u97F3\u91CF",
  "M               \u9759\u97F3",
  "F               \u5168\u5C4F",
  "ESC / H         \u5173\u95ED\u5E2E\u52A9"
]);

// .dsh-plugin/client/mv/generic-film.mjs
var BAR_LEVELS = " .:-=+*#%@";
var SILENT2 = Object.freeze(new Array(48).fill(0));
var pad2 = (n) => String(n).padStart(2, "0");
function timeText(t) {
  const s = Math.max(0, Math.trunc(t));
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
}
function genericChapters(duration) {
  const d = Number.isFinite(duration) && duration > 0 ? duration : 0;
  return [0, 1, 2, 3, 4].map((i) => [Math.round(d * i / 5 * 10) / 10, `${i + 1} / 5`, ""]);
}
var CueFilm = class {
  constructor({ lyrics = [], energy = () => SILENT2, duration = 0 } = {}) {
    this.setLyrics(lyrics);
    this.energy = energy;
    this.duration = duration;
  }
  setLyrics(lyrics) {
    this.lyrics = [...lyrics ?? []].sort((a, b) => a.time - b.time);
    this.times = this.lyrics.map((cue) => cue.time);
  }
  /** Index of the last cue starting at or before t (-1 if none). */
  cueIndex(t) {
    let lo = 0, hi = this.times.length;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (t < this.times[mid]) hi = mid;
      else lo = mid + 1;
    }
    return lo - 1;
  }
  /** The cue showing at t, or null. */
  cue(t) {
    const cue = this.lyrics[this.cueIndex(t)];
    return cue && t < cue.end ? cue : null;
  }
  help(grid, offset, lines = HELP_LINES) {
    drawHelp(grid, lines, offset);
  }
};
var GenericFilm = class extends CueFilm {
  constructor({ title = "", artist = "", lyrics = [], energy = () => SILENT2, duration = 0 } = {}) {
    super({ lyrics, energy, duration });
    this.title = title;
    this.artist = artist;
  }
  setMeta({ title, artist }) {
    this.title = title ?? this.title;
    this.artist = artist ?? this.artist;
  }
  /** Next cue starting after t (for the dim preview line). */
  nextCue(t) {
    return this.lyrics[this.cueIndex(t) + 1] ?? null;
  }
  chapter(t) {
    const chapters = genericChapters(this.duration);
    let act = chapters[0];
    for (const c of chapters) if (c[0] <= Math.max(0, t)) act = c;
    return act;
  }
  render(t, w, h, { paused = false, offset = 0, ready = false, hint = true, hintText = "", help = false, helpLines = HELP_LINES } = {}) {
    const c = new Grid(w, h);
    const title = (this.title || "MV").toUpperCase();
    if (w < 40 || h < 14) {
      c.center(Math.floor(h / 2) - 1, crop(title, w - 2), BRIGHT);
      c.center(Math.floor(h / 2) + 1, "\u8BF7\u653E\u5927\u7A97\u53E3\uFF0C\u6216\u7F29\u5C0F\u5B57\u53F7", WHITE);
      return c;
    }
    const state = ready ? "READY" : paused ? "PAUSED" : "PLAYING";
    const clock = `${timeText(t)} / ${timeText(this.duration)}  ${state}`;
    c.put(2, 0, crop(this.artist ? `${this.title} \u2014 ${this.artist}` : this.title, Math.max(4, w - width(clock) - 6)), BRIGHT);
    c.put(w - width(clock) - 2, 0, clock, DIM);
    c.put(2, 1, "-".repeat(Math.max(0, w - 4)), DIM);
    const top = 3, bottom = h - 9;
    const rows = Math.max(1, bottom - top + 1);
    const spec = this.energy(t) ?? SILENT2;
    const cols = w - 4;
    for (let x = 0; x < cols; x++) {
      const centre = Math.abs(x - (cols - 1) / 2) / ((cols - 1) / 2 || 1);
      const band = Math.min(47, Math.trunc(centre * 47.999));
      const amp = Math.max(0, Math.min(1, spec[band] ?? 0));
      const height = amp * rows;
      for (let r = 0; r < rows; r++) {
        const fill = height - r;
        if (fill <= 0) break;
        const level = fill >= 1 ? BAR_LEVELS.length - 1 : Math.max(1, Math.round(fill * (BAR_LEVELS.length - 1)));
        const style = r > rows * 0.75 ? WHITE : r > rows * 0.45 ? BRIGHT : r > rows * 0.15 ? NORMAL : DIM;
        c.put(2 + x, bottom - r, BAR_LEVELS[level], style);
      }
    }
    if (ready) {
      const cy = Math.trunc((top + bottom) / 2);
      c.fill(top, bottom, DIM);
      const spaced = [...title].join(" ");
      c.center(cy - 1, crop(width(spaced) < w - 6 ? spaced : this.title, w - 4), BRIGHT);
      if (this.artist) c.center(cy + 3, crop(this.artist, w - 4), WHITE);
      c.center(Math.min(bottom, cy + 5), "[ SPACE / ENTER TO START ]", BRIGHT);
    }
    const e = this.cue(t + offset);
    if (!ready) {
      if (e) {
        const ens = e.en ? wrap(e.en, w - 8) : [];
        const zhs = e.zh ? wrap(e.zh, w - 8) : [];
        ens.slice(0, 2).forEach((line, i) => c.center(h - 7 + i, line, WHITE));
        zhs.slice(0, 2).forEach((line, i) => c.center(h - 5 + i, line, BRIGHT));
      } else if (this.lyrics.length) {
        c.center(h - 6, "[ instrumental / \u95F4\u594F ]", DIM);
      }
      const next = this.nextCue(t + offset);
      if (next && next !== e) c.center(h - 3, crop(next.en || next.zh, w - 8), DIM);
    }
    const barW = Math.max(10, w - 8);
    const done = this.duration > 0 ? Math.max(0, Math.min(1, t / this.duration)) : 0;
    const filled = Math.round(done * barW);
    c.put(4, h - 2, "=".repeat(filled), NORMAL);
    c.put(4 + filled, h - 2, "-".repeat(Math.max(0, barW - filled)), DIM);
    if (hint && hintText) c.center(h - 1, crop(hintText, w - 4), DIM);
    if (help) this.help(c, offset, helpLines);
    return c;
  }
};

// .dsh-plugin/shared/mv-scene.mjs
var SCENE_LIMITS = Object.freeze({
  scriptBytes: 256 * 1024,
  /** 0.9.2: webgl scenes may be larger (inlined Three.js etc.). */
  webglScriptBytes: 2 * 1024 * 1024,
  /** A frame slower than this counts as slow; too many slow frames stop the script. */
  frameBudgetMs: 40,
  slowFramesAllowed: 45,
  /** No answer within this time: the worker is terminated. */
  hardTimeoutMs: 1500,
  /** Setup / first compile. */
  setupTimeoutMs: 2e3,
  /** Optional cooperative preparation, before any playback frames are accepted. */
  prepareStepTimeoutMs: 1e4,
  prepareTotalTimeoutMs: 12e4,
  prepareMaxSteps: 512,
  maxCols: 240,
  maxRows: 85
});
var SCENE_BLOCKED_GLOBALS = Object.freeze([
  // Network: still blocked in every mode.
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "WebTransport",
  "EventSource",
  "Request",
  "Response",
  "Headers",
  // Storage / caches: still blocked in every mode.
  "indexedDB",
  "localStorage",
  "sessionStorage",
  "caches",
  "BroadcastChannel",
  "Worker",
  "SharedWorker",
  "storageFoundation",
  // P2P / media capture: still blocked.
  "RTCPeerConnection",
  "RTCDataChannel",
  "FileReader",
  "FileReaderSync",
  "Notification",
  // WASM: still blocked (vm context disables `codeGeneration.wasm` too).
  "WebAssembly",
  // Code generation: still blocked in every mode.
  "Function",
  "eval",
  // Fonts: scripts use the fonts the system already has.
  "FontFace",
  "fonts",
  // Supervisor uses these before lockdown; user code is compiled in a separate Function scope
  // and cannot reach supervisor-private __* bindings.
  "importScripts",
  "onmessage",
  "postMessage",
  // Browser glue that text / pixel scenes don't need and would only widen the attack surface.
  "window",
  "document",
  "self",
  "globalThis",
  "process",
  "navigator",
  "location",
  "open",
  "close",
  // Async / timers — scenes must drive the frame loop via paint(t, …) only.
  "setTimeout",
  "setInterval",
  "clearTimeout",
  "clearInterval",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "queueMicrotask",
  // Event listeners / message channels.
  "MessageChannel",
  "addEventListener",
  "removeEventListener",
  "dispatchEvent",
  "onmessageerror",
  "onerror",
  "onunhandledrejection"
]);
function sceneBlockedGlobals() {
  return SCENE_BLOCKED_GLOBALS;
}
var PIXEL_SCENE_LIMITS = Object.freeze({
  maxWidth: 1920,
  maxHeight: 1080,
  // Painting runs off the main thread and only one frame is in flight, so a slow pixel scene lowers the
  // frame rate instead of blocking the panel: it is stopped only below ~10 fps for too long.
  frameBudgetMs: 100
});
function stripModuleSyntax(source) {
  return String(source).replace(/^\uFEFF/, "").replace(/^(\s*)export\s+default\s+(?=(?:async\s+)?function\b)/gm, "$1").replace(/^(\s*)export\s+(?=(?:async\s+)?function\b|const\b|let\b|var\b|class\b)/gm, "$1");
}
function sceneSourceProblems(source, { output = "text" } = {}) {
  const problems = [];
  const text4 = String(source ?? "");
  if (!text4.trim()) problems.push("\u573A\u666F\u811A\u672C\u662F\u7A7A\u7684\u3002");
  const limit = output === "webgl" ? SCENE_LIMITS.webglScriptBytes : SCENE_LIMITS.scriptBytes;
  if (new TextEncoder().encode(text4).length > limit) problems.push(`\u573A\u666F\u811A\u672C\u8D85\u8FC7 ${limit / 1024} KB\u3002`);
  const gap = String.raw`(?:\s|\/\*[\s\S]*?\*\/|\/\/[^\r\n]*(?:\r\n?|\n|$))*`;
  if (/^\s*import\s[^(]/m.test(text4) || new RegExp(`\\b(?:import|require)${gap}\\(`).test(text4)) problems.push("\u573A\u666F\u811A\u672C\u4E0D\u80FD import / require \u5176\u4ED6\u6A21\u5757\uFF08\u8FD0\u884C\u5728\u6CA1\u6709\u6587\u4EF6\u548C\u7F51\u7EDC\u7684\u6C99\u7BB1\u91CC\uFF09\u3002");
  return problems;
}
var SCENE_RUNTIME_SOURCE = String.raw`
function __mvNormalize(out, cols, rows) {
  var lines = out, styles = null
  if (out && typeof out === 'object' && !Array.isArray(out)) { lines = out.lines; styles = out.styles }
  if (typeof lines === 'string') lines = lines.split('\n')
  if (!Array.isArray(lines)) throw new TypeError('render() 必须返回字符串数组、带 \\n 的字符串，或 { lines, styles }')
  if (styles != null && typeof styles === 'string') styles = styles.split('\n')
  if (styles != null && !Array.isArray(styles)) throw new TypeError('styles 必须是字符串数组')
  var outLines = [], outStyles = []
  for (var y = 0; y < rows; y++) {
    var line = lines[y] == null ? '' : String(lines[y])
    if (line.length > cols * 4) line = line.slice(0, cols * 4)
    outLines.push(line.replace(/[\u0000-\u001f\u007f]/g, ' '))
    var style = styles && styles[y] != null ? String(styles[y]).slice(0, cols * 2).replace(/[^0-6]/g, '1') : ''
    outStyles.push(style)
  }
  return { lines: outLines, styles: outStyles }
}
`;
var SCENE_PREPARE_RUNTIME_SOURCE = String.raw`
function __mvPrepareIterator(iterator) {
  if (!iterator || typeof iterator !== 'object' || typeof iterator.then === 'function') throw new TypeError('prepare() 必须返回同步迭代器，不能返回 Promise');
  const next = iterator.next;
  if (typeof next !== 'function') throw new TypeError('prepare() 必须返回带 next() 的同步迭代器');
  return { iterator, next };
}
function __mvPrepareProgress(result, previous) {
  if (!result || typeof result !== 'object' || typeof result.then === 'function' || typeof result.done !== 'boolean') throw new TypeError('prepare.next() 必须返回同步的 { done, value }，不能返回 Promise');
  if (result.done) return { done: true, progress: 1, label: '' };
  const value = result.value;
  if (value === undefined) return { done: false, progress: previous, label: '' };
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('prepare() 的进度应为 { progress, label } 或 undefined');
  const progress = value.progress, label = value.label === undefined ? '' : value.label;
  if (!Number.isFinite(progress) || progress < 0 || progress > 1 || progress < previous) throw new RangeError('prepare() progress 必须是 0–1 的单调有限数');
  if (typeof label !== 'string' || label.length > 160) throw new TypeError('prepare() label 必须是不超过 160 字符的字符串');
  return { done: false, progress, label };
}
`;
var WEBGL_CANVAS_FACADE_SOURCE = String.raw`
function __mvCanvasFacade(canvas, gl) {
  const facade = Object.create(null);
  const size = (n, max) => { if (!Number.isInteger(n) || n < 1 || n > max) throw new RangeError('canvas size exceeds scene limits'); return n; };
  Object.defineProperties(facade, {
    width: { enumerable: true, get: () => canvas.width, set: n => { canvas.width = size(n, 1920); } },
    height: { enumerable: true, get: () => canvas.height, set: n => { canvas.height = size(n, 1080); } },
    clientWidth: { enumerable: true, get: () => canvas.width },
    clientHeight: { enumerable: true, get: () => canvas.height },
    style: { value: Object.create(null), enumerable: true },
    getContext: { value: type => type === 'webgl2' ? gl : null },
    setAttribute: { value: () => {} },
    addEventListener: { value: () => {} },
    removeEventListener: { value: () => {} },
  });
  return Object.freeze(facade);
}
`;
function sceneWorkerSource(userSource, { output = "text" } = {}) {
  const pixels = output === "pixels";
  const webgl = output === "webgl";
  const blocked = JSON.stringify(sceneBlockedGlobals(output));
  const userBody = JSON.stringify(`"use strict";
${stripModuleSyntax(userSource)}
;return { render: typeof render === 'function' ? render : null, paint: typeof paint === 'function' ? paint : null, setup: typeof setup === 'function' ? setup : null, prepare: typeof prepare === 'function' ? prepare : null };`);
  return `"use strict";
(() => {
const __global = self;
const __post = __global.postMessage.bind(__global);
const __listen = __global.addEventListener.bind(__global);
const __now = typeof performance !== 'undefined' ? performance.now.bind(performance) : Date.now.bind(Date);
const __compile = Function;
const __pixels = ${pixels ? "true" : "false"};
const __webgl = ${webgl ? "true" : "false"};
const __bitmap = __pixels || __webgl;
const __Canvas = typeof OffscreenCanvas === 'function' ? OffscreenCanvas : null;
const __nativeGetContext = __Canvas && OffscreenCanvas.prototype.getContext;
const __snapshot = __Canvas && OffscreenCanvas.prototype.transferToImageBitmap;
const __canvasListen = typeof EventTarget !== 'undefined' ? EventTarget.prototype.addEventListener : null;
(() => {
  const names = ${blocked};
  const seen = new Set();
  for (let o = __global; o && !seen.has(o); o = Object.getPrototypeOf(o)) {
    seen.add(o);
    for (const name of names) { try { delete o[name] } catch (e) {} }
  }
  for (const name of names) { try { Object.defineProperty(__global, name, { value: undefined, writable: false, configurable: false }) } catch (e) {} }
  // Removing global Function alone leaves (() => {}).constructor and async/generator
  // constructors able to create code. Lock those paths too; only the private compiler remains.
  for (const fn of [__compile, Object.getPrototypeOf(async function() {}).constructor, Object.getPrototypeOf(function*() {}).constructor, Object.getPrototypeOf(async function*() {}).constructor]) {
    try { Object.defineProperty(fn.prototype, 'constructor', { value: undefined, writable: false, configurable: false }) } catch (e) {}
  }
  if (__Canvas) {
    // pixels / text: user-created canvases stay 2D-only; the supervisor canvas holds the only WebGL2 context.
    // webgl (0.9.2): user code may also create its own canvases and ask for 'webgl2' (Three.js's WebGLRenderer does).
    try { Object.defineProperty(__Canvas.prototype, 'getContext', { value: function (type, options) {
      if (type === '2d') return __nativeGetContext.call(this, type, options)
      if (type === 'webgl2' && __webgl) return __nativeGetContext.call(this, type, options)
      return null
    }, writable: false, configurable: false }) } catch (e) {}
  }
})();
${SCENE_RUNTIME_SOURCE}
${SCENE_PREPARE_RUNTIME_SOURCE}
${WEBGL_CANVAS_FACADE_SOURCE}
let __scene = null, __setupError = '', __cv = null, __g = null, __facade = null, __initialized = false, __contextLost = false, __ready = false;
let __prepare = null, __prepareId = 0, __prepareProgress = 0, __prepareStarted = 0, __prepareWidth = 0, __prepareHeight = 0;
try {
  __scene = __compile(${userBody})();
  if (__bitmap && !__scene.paint) __setupError = __webgl
    ? '\u573A\u666F\u811A\u672C\u6CA1\u6709\u5B9A\u4E49 paint(gl, t, width, height, ctx) \u51FD\u6570\uFF08canvas.output \u4E3A "webgl"\uFF09\u3002'
    : '\u573A\u666F\u811A\u672C\u6CA1\u6709\u5B9A\u4E49 paint(g, t, width, height, ctx) \u51FD\u6570\uFF08canvas.output \u4E3A "pixels"\uFF09\u3002';
  else if (__bitmap && !__Canvas) __setupError = '\u8FD9\u4E2A\u73AF\u5883\u4E0D\u652F\u6301 OffscreenCanvas\uFF0C\u65E0\u6CD5\u8FD0\u884C\u50CF\u7D20\u573A\u666F\u3002';
  else if (!__bitmap && !__scene.render) __setupError = '\u573A\u666F\u811A\u672C\u6CA1\u6709\u5B9A\u4E49 render(t, cols, rows, ctx) \u51FD\u6570\u3002';
} catch (error) { __setupError = String(error && error.stack || error); }
function __surface(w, h) {
  w = Math.max(1, Math.min(${PIXEL_SCENE_LIMITS.maxWidth}, w | 0)); h = Math.max(1, Math.min(${PIXEL_SCENE_LIMITS.maxHeight}, h | 0));
  if (!__cv) {
    __cv = new __Canvas(w, h);
    __g = __webgl
      ? __nativeGetContext.call(__cv, 'webgl2', { alpha: false, antialias: true, depth: true, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false })
      : __nativeGetContext.call(__cv, '2d');
    if (__webgl && __g) {
      __facade = __mvCanvasFacade(__cv, __g);
      const lost = event => {
        if (__contextLost) return;
        __contextLost = true;
        event.preventDefault?.();
        __post({ type: 'fatal', error: 'WebGL \u4E0A\u4E0B\u6587\u5DF2\u4E22\u5931\uFF0C\u573A\u666F\u5DF2\u505C\u6B62\u3002' });
      };
      // Lockdown removes EventTarget listener methods from the shared prototype.
      // Keep the supervisor's original method, so context-loss handling still works.
      if (__canvasListen) {
        __canvasListen.call(__cv, 'webglcontextlost', lost);
        __canvasListen.call(__cv, 'contextlost', lost);
      } else {
        __cv.addEventListener?.('webglcontextlost', lost);
        __cv.addEventListener?.('contextlost', lost);
      }
    }
  } else if (__cv.width !== w || __cv.height !== h) { __cv.width = w; __cv.height = h; }
  if (!__g) throw new Error(__webgl ? '\u8FD9\u4E2A\u73AF\u5883\u4E0D\u652F\u6301 OffscreenCanvas WebGL2\u3002' : '\u8FD9\u4E2A\u73AF\u5883\u4E0D\u652F\u6301 OffscreenCanvas 2D\u3002');
  if (__webgl && (__contextLost || __g.isContextLost?.())) throw new Error('WebGL \u4E0A\u4E0B\u6587\u5DF2\u4E22\u5931\uFF0C\u573A\u666F\u5DF2\u505C\u6B62\u3002');
  return [w, h];
}
// 0.9.2: in webgl mode the user may also create their own canvases; the supervisor canvas
// (__cv / __g) is what we transfer to the main thread each frame. WebGL frames are
// produced by paint() drawing on __g; transferToImageBitmap() snapshots the canvas.
function __paint(msg) {
  const [w, h] = __surface(msg.cols, msg.rows);
  if (__pixels && typeof __g.reset === 'function') __g.reset();
  else if (__pixels) { __g.setTransform(1, 0, 0, 1, 0, 0); __g.globalAlpha = 1; __g.globalCompositeOperation = 'source-over'; __g.filter = 'none'; __g.clearRect(0, 0, w, h); }
  __scene.paint(__g, msg.t, w, h, msg.ctx);
  if (__cv.width !== w || __cv.height !== h) throw new Error('paint() \u4E0D\u80FD\u66F4\u6539\u8F93\u51FA canvas.size\u3002');
  if (__webgl && (__contextLost || __g.isContextLost?.())) throw new Error('WebGL \u4E0A\u4E0B\u6587\u5DF2\u4E22\u5931\uFF0C\u573A\u666F\u5DF2\u505C\u6B62\u3002');
  if (__webgl && typeof __g.flush === 'function') __g.flush();
  return __snapshot.call(__cv);
}
__listen('message', event => {
  const msg = event.data || {};
  if (msg.type === 'init') {
    if (__initialized) return;
    __initialized = true;
    if (!__setupError && __webgl) { try { __surface(msg.info && msg.info.width || 1280, msg.info && msg.info.height || 720) } catch (error) { __setupError = String(error && error.stack || error) } }
    if (!__setupError) { try {
      const info = __webgl ? { ...(msg.info || {}), canvas: __facade } : (msg.info || {});
      if (__scene.setup) __scene.setup(info, __webgl ? __g : undefined);
      __prepareWidth = __cv && __cv.width; __prepareHeight = __cv && __cv.height;
      if (__scene.prepare) __prepare = __mvPrepareIterator(__scene.prepare(info, __webgl ? __g : undefined));
      if (__prepare && __bitmap && (__cv.width !== __prepareWidth || __cv.height !== __prepareHeight)) throw new Error('prepare() \u4E0D\u80FD\u66F4\u6539\u8F93\u51FA canvas.size');
    } catch (error) { __setupError = String(error && error.stack || error) } }
    if (!__setupError && __prepare) {
      __prepareStarted = __now();
      __post({ type: 'preparing', id: 0, progress: 0, label: '' });
      return;
    }
    __ready = !__setupError;
    __post({ type: 'ready', error: __setupError });
    return;
  }
  if (msg.type === 'prepare-next' && __initialized && __prepare && !__setupError && !__contextLost) {
    const started = __now();
    try {
      if (!Number.isSafeInteger(msg.id) || msg.id !== __prepareId + 1) throw new Error('\u51C6\u5907\u6B65\u9AA4\u7F16\u53F7\u4E0D\u5339\u914D');
      if (msg.id > ${SCENE_LIMITS.prepareMaxSteps}) throw new Error('prepare() \u8D85\u8FC7 ${SCENE_LIMITS.prepareMaxSteps} \u4E2A\u6B65\u9AA4');
      if (started - __prepareStarted > ${SCENE_LIMITS.prepareTotalTimeoutMs}) throw new Error('prepare() \u603B\u8BA1\u8D85\u65F6');
      __prepareId = msg.id;
      const status = __mvPrepareProgress(__prepare.next.call(__prepare.iterator), __prepareProgress);
      if (__bitmap && (__cv.width !== __prepareWidth || __cv.height !== __prepareHeight)) throw new Error('prepare() \u4E0D\u80FD\u66F4\u6539\u8F93\u51FA canvas.size');
      if (__webgl && (__contextLost || __g.isContextLost?.())) throw new Error('WebGL \u4E0A\u4E0B\u6587\u5DF2\u4E22\u5931\uFF0C\u573A\u666F\u5DF2\u505C\u6B62\u3002');
      // Complete first-use GPU work here, not in the first timed playback frame.
      if (__webgl && typeof __g.finish === 'function') __g.finish();
      const ended = __now();
      if (ended - started > ${SCENE_LIMITS.prepareStepTimeoutMs}) throw new Error('prepare() \u5355\u6B65\u9AA4\u8D85\u65F6');
      if (ended - __prepareStarted > ${SCENE_LIMITS.prepareTotalTimeoutMs}) throw new Error('prepare() \u603B\u8BA1\u8D85\u65F6');
      __prepareProgress = status.progress;
      if (status.done) {
        __prepare = null; __ready = true;
        __post({ type: 'ready', error: '', id: msg.id });
      } else __post({ type: 'preparing', id: msg.id, progress: status.progress, label: status.label });
    } catch (error) {
      __prepare = null; __setupError = String(error && error.stack || error).slice(0, 2000);
      __post({ type: 'fatal', error: __setupError });
    }
    return;
  }
  if (msg.type !== 'frame' || !__initialized || !__ready || __setupError || __contextLost) return;
  const started = __now();
  try {
    if (__bitmap) {
      const bitmap = __paint(msg);
      try { __post({ type: 'frame', id: msg.id, bitmap, ms: __now() - started }, [bitmap]); }
      catch (error) { bitmap.close?.(); throw error; }
    }
    else {
      const frame = __mvNormalize(__scene.render(msg.t, msg.cols, msg.rows, msg.ctx), msg.cols, msg.rows);
      __post({ type: 'frame', id: msg.id, frame, ms: __now() - started });
    }
  } catch (error) {
    __post({ type: 'error', id: msg.id, error: String(error && error.stack || error).slice(0, 2000) });
  }
});
})();
`;
}
var SILENT3 = new Array(48).fill(0);
var avg = (bands, from, to) => {
  let s = 0;
  for (let i = from; i < to; i++) s += bands[i] ?? 0;
  return s / Math.max(1, to - from);
};
var clamp01 = (v) => Math.max(0, Math.min(1, v));
var r3 = (v) => Math.round(v * 1e3) / 1e3;
var CJK_CHAR = /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/;
function cueWords(cue) {
  if (!cue) return [];
  const end = Number.isFinite(cue.end) ? cue.end : cue.time + 4;
  if (Array.isArray(cue.words) && cue.words.length) {
    return cue.words.map((w, i, all) => ({ text: String(w.text ?? ""), start: r3(w.time), end: r3(all[i + 1]?.time ?? end) }));
  }
  const text4 = String(cue.en || cue.zh || "");
  const parts = [];
  for (const token of text4.split(/\s+/).filter(Boolean)) {
    if (CJK_CHAR.test(token)) for (const ch of token) parts.push(ch);
    else parts.push(token);
  }
  const span = Math.max(0.3, (end - cue.time) * 0.7);
  return parts.map((part2, i) => ({ text: part2, start: r3(cue.time + span * i / parts.length), end: r3(cue.time + span * (i + 1) / parts.length) }));
}
function cueInfo(cue, t, withWords) {
  if (!cue) return null;
  const end = Number.isFinite(cue.end) ? cue.end : cue.time + 4;
  const info = { text: cue.en || cue.zh || "", en: cue.en || "", zh: cue.zh || "", start: cue.time, end, progress: r3(clamp01((t - cue.time) / Math.max(1e-3, end - cue.time))) };
  if (!withWords) return info;
  const words = cueWords(cue);
  let word = -1;
  for (let i = 0; i < words.length; i++) if (words[i].start <= t) word = i;
  return { ...info, words, word };
}
function normalizeSections(list) {
  if (!Array.isArray(list)) return [];
  return list.filter((s) => s && Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start).slice(0, 200).map((s) => ({ kind: String(s.kind ?? "section").slice(0, 40), ...s.label ? { label: String(s.label).slice(0, 80) } : {}, start: r3(s.start), end: r3(s.end) })).sort((a, b) => a.start - b.start);
}
function sceneContext({ t = 0, duration = 0, title = "", artist = "", cue = null, next = null, bands = SILENT3, ready = false, paused = false, sections = [], bpm = 0, beatOffset = 0 } = {}) {
  const b = Array.from({ length: 48 }, (_, i) => clamp01(Number(bands?.[i]) || 0));
  const list = normalizeSections(sections);
  const index = list.findIndex((s) => s.start <= t && t < s.end);
  const section = index < 0 ? null : { ...list[index], index, progress: r3(clamp01((t - list[index].start) / (list[index].end - list[index].start))) };
  let beat = null;
  if (Number.isFinite(bpm) && bpm > 0) {
    const pos = Math.max(0, (t - beatOffset) * bpm / 60);
    const phase = pos - Math.floor(pos);
    beat = { bpm, index: Math.floor(pos), bar: Math.floor(pos / 4), phase: r3(phase), pulse: r3(Math.exp(-phase * 6)) };
  }
  return {
    duration,
    progress: duration > 0 ? clamp01(t / duration) : 0,
    title,
    artist,
    lyric: cueInfo(cue, t, true),
    next: cueInfo(next, t, false),
    bands: b,
    energy: avg(b, 0, 48),
    bass: avg(b, 0, 8),
    mid: avg(b, 8, 28),
    treble: avg(b, 28, 48),
    ready,
    paused,
    section,
    sections: list,
    beat
  };
}
var EXAMPLE_SCENE = String.raw`// scenes.js — scene script of a dsh-mv MV pack (canvas.renderer: "script").
// Runs in a sandbox: no DOM, no network, no imports. Keep each frame fast (< 40 ms).
//
// render(t, cols, rows, ctx) returns the frame: an array of rows lines (strings),
// or { lines, styles } where styles[y] has one digit per cell:
// 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.
// ctx: { duration, progress, title, artist, lyric, next, bands[48], energy, bass, mid, treble, ready, paused,
//        section, sections, beat }
//   lyric: { text, en, zh, start, end, progress, words: [{ text, start, end }], word } or null
//   section: { kind, label, start, end, index, progress } or null; beat: { bpm, index, bar, phase, pulse } or null
// More techniques: examples/README.md and examples/*.scene.js in the pack template.

function setup(info) {
  // Optional, called once: info = { title, artist, duration }.
}

function centered(text, cols) {
  const s = String(text).slice(0, cols)
  const left = Math.max(0, Math.floor((cols - s.length) / 2))
  return ' '.repeat(left) + s
}

function render(t, cols, rows, ctx) {
  const lines = [], styles = []
  for (let y = 0; y < rows; y++) {
    let line = '', style = ''
    for (let x = 0; x < cols; x++) {
      // A moving wave whose height follows the music.
      const band = ctx.bands[Math.min(47, Math.floor(x / cols * 48))]
      const wave = Math.sin(x * 0.15 + t * 2) * 0.5 + 0.5
      const level = rows - 1 - Math.floor((wave * 0.3 + band * 0.7) * (rows - 6))
      const on = y >= level && y < rows - 4
      line += on ? '#*+=-:.'[Math.min(6, y - level)] || '.' : ' '
      style += on ? (y - level < 2 ? '3' : y - level < 4 ? '2' : '1') : '0'
    }
    lines.push(line); styles.push(style)
  }
  lines[1] = centered(ctx.title + (ctx.artist ? ' - ' + ctx.artist : ''), cols); styles[1] = '2'.repeat(cols)
  if (ctx.lyric) { lines[rows - 3] = centered(ctx.lyric.text, cols); styles[rows - 3] = '3'.repeat(cols) }
  if (ctx.lyric && ctx.lyric.zh && ctx.lyric.en) { lines[rows - 2] = centered(ctx.lyric.zh, cols); styles[rows - 2] = '2'.repeat(cols) }
  return { lines, styles }
}
`;

// .dsh-plugin/client/mv/script-film.mjs
var isBitmapSceneOutput = (output) => output === "pixels" || output === "webgl";
var closeBitmap = (bitmap) => {
  try {
    bitmap?.close?.();
  } catch {
  }
};
var invalidWorkerMessage = (detail) => `\u573A\u666F\u811A\u672C\u8FD4\u56DE\u4E86\u65E0\u6548\u6D88\u606F\uFF1A${detail}`;
function bitmapSubtitles(g, cue, x, y, w, h) {
  if (!cue || !(cue.en || cue.zh)) return;
  const lines = [cue.en, cue.zh].filter(Boolean).map((text4) => String(text4).slice(0, 512));
  const fontSize = Math.max(12, Math.min(40, Math.round(h / 22)));
  const lineHeight = fontSize * 1.35, pad = Math.max(5, h * 0.025);
  const top = y + h - pad - lines.length * lineHeight;
  const maxWidth = w * 0.9;
  g.save();
  try {
    g.beginPath();
    g.rect(x, y, w, h);
    g.clip();
    g.globalAlpha = 1;
    g.globalCompositeOperation = "source-over";
    g.filter = "none";
    g.shadowBlur = 0;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(0,0,0,0.65)";
    g.fillRect(x + w * 0.025, top - pad * 0.5, w * 0.95, lines.length * lineHeight + pad);
    lines.forEach((text4, i) => {
      let size = fontSize;
      const setFont = () => {
        g.font = `600 ${size}px "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`;
      };
      setFont();
      const measured = g.measureText(text4).width;
      if (measured > maxWidth) {
        size = Math.max(10, fontSize * maxWidth / measured);
        setFont();
      }
      if (g.measureText(text4).width > maxWidth) {
        let lo = 0, hi = text4.length;
        while (lo < hi) {
          const mid = Math.ceil((lo + hi) / 2);
          if (g.measureText(text4.slice(0, mid) + "\u2026").width <= maxWidth) lo = mid;
          else hi = mid - 1;
        }
        text4 = text4.slice(0, lo) + "\u2026";
      }
      g.lineWidth = Math.max(2, size / 8);
      g.strokeStyle = "#000";
      g.strokeText(text4, x + w / 2, top + (i + 0.5) * lineHeight, maxWidth);
      g.fillStyle = i === 0 ? "#fff" : "#c4deff";
      g.fillText(text4, x + w / 2, top + (i + 0.5) * lineHeight, maxWidth);
    });
  } finally {
    g.restore();
  }
}
function blobWorkerFactory(source, { WorkerClass = globalThis.Worker, BlobClass = globalThis.Blob, url = globalThis.URL } = {}) {
  if (typeof WorkerClass !== "function" || typeof BlobClass !== "function" || typeof url?.createObjectURL !== "function") return null;
  const href = url.createObjectURL(new BlobClass([source], { type: "text/javascript" }));
  try {
    return new WorkerClass(href, { name: "dsh-mv-scene" });
  } finally {
    setTimeout(() => url.revokeObjectURL(href), 1e4);
  }
}
var ScriptFilm = class extends GenericFilm {
  constructor({ createWorker = blobWorkerFactory, now = () => globalThis.performance?.now?.() ?? Date.now(), onFail = () => {
  }, onPrepare = () => {
  }, ...options } = {}) {
    super(options);
    this.createWorker = createWorker;
    this.now = now;
    this.onFail = onFail;
    this.onPrepare = onPrepare;
    this.worker = null;
    this.state = "idle";
    this.frame = null;
    this.pending = null;
    this.slow = 0;
    this.nextId = 1;
    this.error = "";
    this.output = "text";
    this.size = [1280, 720];
    this.bitmap = null;
    this.setupTimer = null;
    this.prepareTimer = null;
    this.prepareTotalTimer = null;
    this.preparePending = null;
    this.prepareProgress = 0;
    this.loadReject = null;
  }
  /** Song structure for ctx.section / ctx.beat (from mv.json). */
  setStructure({ sections = [], bpm = 0, beatOffset = 0 } = {}) {
    this.sections = sections;
    this.bpm = bpm;
    this.beatOffset = beatOffset;
  }
  /** Start the script; resolves when it is ready, rejects with the reason. */
  load(source, { output = "text", size = [1280, 720], assets = {}, transfer = [] } = {}) {
    this.stop();
    const rejected = (reason) => {
      if (Array.isArray(transfer)) transfer.forEach(closeBitmap);
      return Promise.reject(this.fail(reason));
    };
    this.output = isBitmapSceneOutput(output) ? output : "text";
    this.size = Array.isArray(size) ? [Number(size[0]), Number(size[1])] : [0, 0];
    if (isBitmapSceneOutput(this.output) && (!Number.isInteger(this.size[0]) || !Number.isInteger(this.size[1]) || this.size[0] <= 0 || this.size[1] <= 0 || this.size[0] > PIXEL_SCENE_LIMITS.maxWidth || this.size[1] > PIXEL_SCENE_LIMITS.maxHeight)) {
      return rejected("\u4F4D\u56FE\u573A\u666F\u7684 canvas.size \u5FC5\u987B\u662F\u4E24\u4E2A\u6B63\u6574\u6570\uFF0C\u4E14\u4E0D\u8D85\u8FC7 1920\xD71080\u3002");
    }
    const problems = sceneSourceProblems(source, { output: this.output });
    if (problems.length) return rejected(problems.join(" "));
    let worker;
    try {
      worker = this.createWorker(sceneWorkerSource(source, { output: this.output }));
    } catch (error) {
      return rejected(`\u65E0\u6CD5\u521B\u5EFA\u573A\u666F\u6C99\u7BB1\uFF08Web Worker\uFF09\uFF1A${error?.message ?? error}`);
    }
    if (!worker) return rejected("\u8FD9\u4E2A\u73AF\u5883\u4E0D\u652F\u6301 Web Worker\uFF0C\u65E0\u6CD5\u8FD0\u884C\u573A\u666F\u811A\u672C\u3002");
    this.worker = worker;
    this.state = "loading";
    return new Promise((resolve, reject) => {
      this.loadReject = reject;
      const clearSetupTimer = () => {
        clearTimeout(this.setupTimer);
        this.setupTimer = null;
      };
      const clearPrepareTimers = () => {
        clearTimeout(this.prepareTimer);
        clearTimeout(this.prepareTotalTimer);
        this.prepareTimer = null;
        this.prepareTotalTimer = null;
        this.preparePending = null;
      };
      const reportPreparation = (status) => {
        try {
          this.onPrepare(status);
        } catch {
        }
      };
      const sendPreparationStep = (id) => {
        if (id > SCENE_LIMITS.prepareMaxSteps) {
          reject(this.fail(`\u573A\u666F\u51C6\u5907\u8D85\u8FC7 ${SCENE_LIMITS.prepareMaxSteps} \u4E2A\u6B65\u9AA4\u3002`));
          return;
        }
        this.preparePending = id;
        this.prepareTimer = setTimeout(() => reject(this.fail(`\u573A\u666F\u51C6\u5907\u5355\u6B65\u9AA4\u8D85\u8FC7 ${SCENE_LIMITS.prepareStepTimeoutMs} ms\uFF0C\u5DF2\u505C\u6B62\u3002`)), SCENE_LIMITS.prepareStepTimeoutMs);
        try {
          worker.postMessage({ type: "prepare-next", id });
        } catch (error) {
          reject(this.fail(`\u65E0\u6CD5\u51C6\u5907\u573A\u666F\u811A\u672C\uFF1A${error?.message ?? error}`));
        }
      };
      this.setupTimer = setTimeout(() => reject(this.fail("\u573A\u666F\u811A\u672C\u52A0\u8F7D\u8D85\u65F6\u3002")), SCENE_LIMITS.setupTimeoutMs);
      worker.onerror = (event) => {
        if (this.worker !== worker) return;
        clearSetupTimer();
        event?.preventDefault?.();
        reject(this.fail(`\u573A\u666F\u811A\u672C\u51FA\u9519\uFF1A${event?.message ?? "\u672A\u77E5\u9519\u8BEF"}`));
      };
      worker.onmessage = (event) => {
        const msg = event?.data;
        if (this.worker !== worker) {
          closeBitmap(msg?.bitmap);
          return;
        }
        if (!msg || typeof msg !== "object" || Array.isArray(msg)) {
          closeBitmap(msg?.bitmap);
          clearSetupTimer();
          reject(this.fail(invalidWorkerMessage("\u6D88\u606F\u5FC5\u987B\u662F\u5BF9\u8C61\u3002")));
          return;
        }
        if (msg.type === "fatal") {
          closeBitmap(msg.bitmap);
          clearSetupTimer();
          const error = this.fail(typeof msg.error === "string" && msg.error ? msg.error.split("\n")[0] : invalidWorkerMessage("fatal \u54CD\u5E94\u7F3A\u5C11 error \u5B57\u7B26\u4E32\u3002"));
          reject(error);
          return;
        }
        if (this.state === "loading" || this.state === "preparing") {
          if (msg.type === "preparing") {
            const expected = this.state === "loading" ? 0 : this.preparePending;
            const valid = Number.isSafeInteger(msg.id) && msg.id === expected && msg.id <= SCENE_LIMITS.prepareMaxSteps && msg.bitmap === void 0 && Number.isFinite(msg.progress) && msg.progress >= this.prepareProgress && msg.progress <= 1 && typeof msg.label === "string" && msg.label.length <= 160 && (this.state !== "loading" || msg.progress === 0);
            if (!valid) {
              closeBitmap(msg.bitmap);
              reject(this.fail(invalidWorkerMessage("\u51C6\u5907\u8FDB\u5EA6\u6216\u6B65\u9AA4\u7F16\u53F7\u4E0D\u6B63\u786E\u3002")));
              return;
            }
            clearSetupTimer();
            clearTimeout(this.prepareTimer);
            this.prepareTimer = null;
            if (this.state === "loading") {
              this.state = "preparing";
              this.prepareTotalTimer = setTimeout(() => reject(this.fail(`\u573A\u666F\u51C6\u5907\u603B\u8BA1\u8D85\u8FC7 ${SCENE_LIMITS.prepareTotalTimeoutMs} ms\uFF0C\u5DF2\u505C\u6B62\u3002`)), SCENE_LIMITS.prepareTotalTimeoutMs);
            }
            this.prepareProgress = msg.progress;
            reportPreparation({ step: msg.id, progress: msg.progress, label: msg.label, done: false });
            if (this.worker !== worker || this.state !== "preparing") return;
            sendPreparationStep(msg.id + 1);
            return;
          }
          if (msg.type !== "ready" || typeof msg.error !== "string" || msg.bitmap !== void 0 || this.state === "preparing" && (!Number.isSafeInteger(msg.id) || msg.id !== this.preparePending)) {
            closeBitmap(msg.bitmap);
            clearSetupTimer();
            reject(this.fail(invalidWorkerMessage("\u521D\u59CB\u5316\u54CD\u5E94\u683C\u5F0F\u4E0D\u6B63\u786E\u3002")));
            return;
          }
          clearSetupTimer();
          const prepared = this.state === "preparing";
          clearPrepareTimers();
          if (msg.error) {
            reject(this.fail(`\u573A\u666F\u811A\u672C\u65E0\u6CD5\u52A0\u8F7D\uFF1A${msg.error.split("\n")[0]}`));
            return;
          }
          this.state = "ready";
          this.loadReject = null;
          if (prepared) {
            this.prepareProgress = 1;
            reportPreparation({ step: msg.id, progress: 1, label: "", done: true });
          }
          resolve();
          return;
        }
        this.receive(msg);
      };
      const info = { title: this.title, artist: this.artist, duration: this.duration, sections: this.sections ?? [], bpm: this.bpm ?? 0, assets, ...isBitmapSceneOutput(this.output) ? { width: this.size[0], height: this.size[1] } : {} };
      try {
        worker.postMessage({ type: "init", info }, Array.isArray(transfer) ? transfer : []);
      } catch (error) {
        clearSetupTimer();
        reject(this.fail(`\u65E0\u6CD5\u521D\u59CB\u5316\u573A\u666F\u811A\u672C\uFF1A${error?.message ?? error}`));
      }
    }).catch((error) => {
      if (Array.isArray(transfer)) transfer.forEach(closeBitmap);
      throw error;
    });
  }
  receive(msg) {
    if (!msg || typeof msg !== "object" || Array.isArray(msg)) {
      closeBitmap(msg?.bitmap);
      this.fail(invalidWorkerMessage("\u5E27\u54CD\u5E94\u5FC5\u987B\u662F\u5BF9\u8C61\u3002"));
      return;
    }
    if (!this.pending || !Number.isSafeInteger(msg.id) || msg.id !== this.pending.id) {
      closeBitmap(msg.bitmap);
      this.fail(invalidWorkerMessage("\u5E27\u7F16\u53F7\u4E0E\u5F53\u524D\u8BF7\u6C42\u4E0D\u5339\u914D\u3002"));
      return;
    }
    const pending = this.pending;
    this.pending = null;
    if (msg.type === "error") {
      closeBitmap(msg.bitmap);
      if (typeof msg.error !== "string" || !msg.error) {
        this.fail(invalidWorkerMessage("\u9519\u8BEF\u54CD\u5E94\u7F3A\u5C11 error \u5B57\u7B26\u4E32\u3002"));
        return;
      }
      this.fail(`render() \u51FA\u9519\uFF1A${msg.error.split("\n")[0]}`);
      return;
    }
    if (msg.type !== "frame") {
      closeBitmap(msg.bitmap);
      this.fail(invalidWorkerMessage(`\u672A\u77E5\u54CD\u5E94\u7C7B\u578B ${String(msg.type)}\u3002`));
      return;
    }
    if (!Number.isFinite(msg.ms) || msg.ms < 0) {
      closeBitmap(msg.bitmap);
      this.fail(invalidWorkerMessage("\u5E27\u8017\u65F6\u5FC5\u987B\u662F\u975E\u8D1F\u6709\u9650\u6570\u3002"));
      return;
    }
    if (isBitmapSceneOutput(this.output)) {
      const bitmap = msg.bitmap;
      if (!bitmap || typeof bitmap !== "object" || typeof bitmap.close !== "function" || typeof globalThis.ImageBitmap === "function" && !(bitmap instanceof globalThis.ImageBitmap) || !Number.isInteger(bitmap.width) || !Number.isInteger(bitmap.height) || bitmap.width !== this.size[0] || bitmap.height !== this.size[1]) {
        closeBitmap(bitmap);
        this.fail(invalidWorkerMessage(`ImageBitmap \u5C3A\u5BF8\u5FC5\u987B\u662F ${this.size[0]}\xD7${this.size[1]}\u3002`));
        return;
      }
      closeBitmap(this.bitmap);
      this.bitmap = msg.bitmap;
    } else {
      if (msg.bitmap !== void 0) {
        closeBitmap(msg.bitmap);
        this.fail(invalidWorkerMessage("\u6587\u672C\u573A\u666F\u4E0D\u80FD\u8FD4\u56DE ImageBitmap\u3002"));
        return;
      }
      const { frame } = msg;
      const validLines = frame && typeof frame === "object" && !Array.isArray(frame) && Array.isArray(frame.lines) && frame.lines.length <= pending.rows && frame.lines.every((line) => typeof line === "string" && line.length <= pending.cols * 4);
      const validStyles = frame?.styles === void 0 || Array.isArray(frame.styles) && frame.styles.length <= pending.rows && frame.styles.every((style) => typeof style === "string" && style.length <= pending.cols * 2 && /^[0-6]*$/.test(style));
      if (!validLines || !validStyles) {
        closeBitmap(msg.bitmap);
        this.fail(invalidWorkerMessage("\u6587\u672C\u5E27\u683C\u5F0F\u6216\u5C3A\u5BF8\u4E0D\u6B63\u786E\u3002"));
        return;
      }
      this.frame = msg.frame;
    }
    const budget = isBitmapSceneOutput(this.output) ? PIXEL_SCENE_LIMITS.frameBudgetMs : SCENE_LIMITS.frameBudgetMs;
    if (msg.ms > budget) {
      if (++this.slow > SCENE_LIMITS.slowFramesAllowed) this.fail(`\u573A\u666F\u811A\u672C\u592A\u6162\uFF08\u4E00\u5E27 ${Math.round(msg.ms)} ms\uFF0C\u9884\u7B97 ${budget} ms\uFF09\u3002`);
    } else this.slow = Math.max(0, this.slow - 1);
  }
  fail(reason) {
    if (this.state === "failed") return new Error(this.error);
    this.state = "failed";
    this.error = reason;
    this.stop({ keepState: true });
    this.onFail(reason);
    return new Error(reason);
  }
  stop({ keepState = false } = {}) {
    clearTimeout(this.setupTimer);
    this.setupTimer = null;
    clearTimeout(this.prepareTimer);
    clearTimeout(this.prepareTotalTimer);
    this.prepareTimer = null;
    this.prepareTotalTimer = null;
    this.preparePending = null;
    this.prepareProgress = 0;
    const reject = this.loadReject;
    this.loadReject = null;
    reject?.(new Error(keepState ? this.error : "\u573A\u666F\u811A\u672C\u52A0\u8F7D\u5DF2\u53D6\u6D88\u3002"));
    if (this.worker) {
      this.worker.onmessage = null;
      this.worker.onerror = null;
    }
    try {
      this.worker?.terminate();
    } catch {
    }
    this.worker = null;
    this.pending = null;
    this.frame = null;
    closeBitmap(this.bitmap);
    this.bitmap = null;
    this.slow = 0;
    if (!keepState) {
      this.state = "idle";
      this.error = "";
    }
  }
  request(t, w, h, opts) {
    if (this.state !== "ready" || !this.worker) return;
    const now = this.now();
    if (this.pending) {
      if (now - this.pending.at > SCENE_LIMITS.hardTimeoutMs) this.fail(`\u573A\u666F\u811A\u672C ${SCENE_LIMITS.hardTimeoutMs} ms \u6CA1\u6709\u8FD4\u56DE\uFF08\u53EF\u80FD\u662F\u6B7B\u5FAA\u73AF\uFF09\uFF0C\u5DF2\u505C\u6B62\u3002`);
      return;
    }
    const at = t + (opts.offset ?? 0);
    const ctx = sceneContext({ t, duration: this.duration, title: this.title, artist: this.artist, cue: this.cue(at), next: this.nextCue(at), bands: this.energy(t), ready: Boolean(opts.ready), paused: Boolean(opts.paused), sections: this.sections ?? [], bpm: this.bpm ?? 0, beatOffset: this.beatOffset ?? 0 });
    const id = this.nextId++;
    this.pending = { id, at: now, cols: w, rows: h };
    try {
      this.worker.postMessage({ type: "frame", id, t, cols: w, rows: h, ctx });
    } catch (error) {
      this.fail(`\u65E0\u6CD5\u5411\u573A\u666F\u811A\u672C\u8BF7\u6C42\u5E27\uFF1A${error?.message ?? error}`);
    }
  }
  /** Same interface as Film / GenericFilm: a Canvas for time t. */
  render(t, w, h, opts = {}) {
    this.request(t, w, h, opts);
    const c = new Grid(w, h);
    const frame = this.frame;
    if (frame) {
      for (let y = 0; y < Math.min(h, frame.lines.length); y++) {
        const style = frame.styles?.[y] ?? "";
        let x = 0, i = 0;
        for (const ch of frame.lines[y]) {
          const k = cw(ch);
          if (x >= w) break;
          if (k > 0 && ch !== " ") c.put(x, y, ch, style ? Number(style[i] ?? style[style.length - 1] ?? NORMAL) : NORMAL);
          x += k;
          i += 1;
        }
      }
    } else if (this.state === "loading" || this.state === "preparing" || this.state === "ready") c.center(Math.floor(h / 2), this.state === "preparing" ? `\u51C6\u5907 ${Math.round(this.prepareProgress * 100)}%` : "\u2026", DIM);
    if (opts.help) this.help(c, opts.offset ?? 0, opts.helpLines);
    return c;
  }
  /** Bitmap scenes: paint the newest frame letterboxed onto the panel's visible 2D canvas. */
  draw(g, t, opts = {}) {
    const [w, h] = this.size;
    this.request(t, w, h, opts);
    const cw2 = g.canvas.width, ch = g.canvas.height;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = "#000";
    g.fillRect(0, 0, cw2, ch);
    const scale = Math.min(cw2 / w, ch / h);
    const dw = Math.round(w * scale), dh = Math.round(h * scale);
    if (this.bitmap) {
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = "high";
      g.drawImage(this.bitmap, Math.round((cw2 - dw) / 2), Math.round((ch - dh) / 2), dw, dh);
      if (opts.subtitles === true) bitmapSubtitles(g, this.cue(t - (opts.offset ?? 0)), Math.round((cw2 - dw) / 2), Math.round((ch - dh) / 2), dw, dh);
    } else if (this.state === "loading" || this.state === "preparing" || this.state === "ready") {
      g.fillStyle = "#556";
      g.font = `${Math.max(12, Math.round(ch / 30))}px monospace`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(this.state === "preparing" ? `\u51C6\u5907 ${Math.round(this.prepareProgress * 100)}%` : "\u2026", cw2 / 2, ch / 2);
    }
  }
};

// .dsh-plugin/client/mv/scene-play-gate.mjs
var ScenePlayGate = class {
  constructor() {
    this.sequence = 0;
    this.pending = false;
  }
  cancel() {
    this.sequence++;
    this.pending = false;
  }
  async play(load, isCurrent, start) {
    const id = ++this.sequence;
    this.pending = true;
    try {
      await load;
      if (id !== this.sequence || !isCurrent()) return false;
      await start();
      return id === this.sequence && isCurrent();
    } finally {
      if (id === this.sequence) this.pending = false;
    }
  }
};

// .dsh-plugin/client/mv/dshpv/chat.mjs
var PAGE_W = 354;
var PAGE_H = 537;
var SANS = '"Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", "Segoe UI", sans-serif';
var C = { bg: "#05080f", bubble: "#18233d", input: "#0d1528", border: "#1b2540", border2: "#223052", primary: "#e6e8ee", secondary: "#a8b0c2", tertiary: "#6f7890", blue: "#4d6bfe", red: "#f85149" };
var entry = (e) => Array.isArray(e) ? [e[0], e[1] ?? -1, e[2] ?? 1] : [e, -1, 1];
function chatAt(chat, t) {
  const frames = chat.frames;
  let lo = 0, hi = frames.length - 1;
  if (!frames.length || t < frames[0][0]) return null;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (frames[mid][0] <= t) lo = mid;
    else hi = mid - 1;
  }
  return frames[lo];
}
function blockParts(block2, chars) {
  if (chars < 0) return block2.p;
  const out = [];
  let left = chars;
  for (const [k, v] of block2.p) {
    const head = k.length + 1;
    if (left <= head) break;
    left -= head;
    out.push([k, v.slice(0, left)]);
    left -= v.length;
    if (left <= 0) break;
    left -= 1;
  }
  return out;
}
var part = (parts, ...names) => {
  for (const n of names) {
    const p = parts.find((x) => x[0] === n);
    if (p) return p[1];
  }
  return "";
};
var allText = (parts) => parts.map((p) => p[1]).join(" ");
function wrap2(ctx, text4, width2) {
  const out = [];
  for (const para of String(text4).split("\n")) {
    let line = "";
    for (const ch of para) {
      if (ctx.measureText(line + ch).width > width2 && line) {
        out.push(line);
        line = ch.trimStart();
      } else line += ch;
    }
    out.push(line);
  }
  return out;
}
function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
var ICONS = ["\u29C9", "\u{1F44D}", "\u{1F44E}", "\u2928"];
function block(ctx, b, parts, y, draw, op, env) {
  const W2 = PAGE_W - 28, X = 14;
  ctx.globalAlpha = op;
  switch (b.k) {
    case "u": {
      ctx.font = `16px ${SANS}`;
      const lines = wrap2(ctx, part(parts, "bubble") || allText(parts), W2 * 0.78 - 32);
      const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 32;
      const h = lines.length * 24 + 18;
      if (draw) {
        ctx.fillStyle = env.bubble;
        rounded(ctx, X + W2 - w, y, w, h, 18);
        ctx.fill();
        ctx.fillStyle = C.primary;
        lines.forEach((l, i) => ctx.fillText(l, X + W2 - w + 16, y + 9 + i * 24));
      }
      return h;
    }
    case "h": {
      ctx.font = `16px ${SANS}`;
      const lines = wrap2(ctx, part(parts, "body") || allText(parts), W2);
      if (draw) {
        ctx.fillStyle = b.stopped ? C.tertiary : C.primary;
        lines.forEach((l, i) => ctx.fillText(l, X, y + i * 26));
      }
      return lines.length * 26;
    }
    case "a": {
      if (draw) {
        ctx.font = `15px ${SANS}`;
        ctx.fillStyle = C.secondary;
        ICONS.forEach((ic, i) => ctx.fillText(ic, X + 2 + i * 38, y + 2));
        ctx.font = `14px ${SANS}`;
        ctx.fillText(`\u25F7  ${part(parts, "timeEnd")}`, X + 2 + 4 * 38, y + 3);
      }
      return 22;
    }
    case "tool": {
      ctx.font = `14px ${SANS}`;
      const title = part(parts, "title") || (parts[0]?.[1] ?? "");
      const rest = parts.filter((p) => p[0] !== "title").map((p) => p[1]).join(" \xB7 ");
      const lines = wrap2(ctx, `${title}${rest ? " \xB7 " + rest : ""}`, W2 - 22);
      if (draw) {
        ctx.fillStyle = b.error ? C.red : C.tertiary;
        ctx.fillText(title === "\u601D\u8003" ? "\u2732" : "\u2699", X, y);
        lines.forEach((l, i) => {
          if (i === 0 && rest) {
            ctx.fillStyle = C.secondary;
            ctx.fillText(title, X + 22, y);
            const tw = ctx.measureText(title).width;
            ctx.fillStyle = b.error ? C.red : C.tertiary;
            ctx.fillText(l.slice(title.length), X + 22 + tw, y);
          } else {
            ctx.fillStyle = b.error ? C.red : C.tertiary;
            ctx.fillText(l, X + 22, y + i * 20);
          }
        });
      }
      return lines.length * 20;
    }
    case "err": {
      ctx.font = `14px ${SANS}`;
      const lines = wrap2(ctx, allText(parts), W2 - 18);
      if (draw) {
        ctx.fillStyle = C.red;
        ctx.beginPath();
        ctx.arc(X + 4, y + 9, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = C.secondary;
        lines.forEach((l, i) => ctx.fillText(l, X + 16, y + i * 20));
      }
      return lines.length * 20;
    }
    default: {
      ctx.font = `${b.k === "n" ? 13 : 14}px ${SANS}`;
      const suffix = b.k === "retry" || b.k === "cmp" ? "  \u203A" : "";
      const lines = wrap2(ctx, allText(parts) + suffix, W2);
      if (draw) {
        ctx.fillStyle = b.error ? C.red : C.tertiary;
        lines.forEach((l, i) => ctx.fillText(l, X, y + i * 19));
      }
      return lines.length * 19;
    }
  }
}
function drawPage(ctx, chat, row, env) {
  ctx.save();
  ctx.textBaseline = "top";
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  const code = row?.[1];
  const entries = (row?.[2] ?? []).map(entry);
  const blocks = entries.map(([id, n, op]) => ({ b: chat.blocks[id], parts: blockParts(chat.blocks[id], n), op }));
  env = { bubble: C.bubble, ...env };
  if (code) {
    drawCode(ctx, env);
    ctx.restore();
    return;
  }
  const head = blocks.find((x) => x.b.k === "head");
  const comp = blocks.find((x) => x.b.k === "comp");
  const foot = blocks.find((x) => x.b.k === "foot");
  const body = blocks.filter((x) => !["head", "comp", "foot"].includes(x.b.k));
  let top = 0;
  if (head) {
    ctx.globalAlpha = head.op;
    ctx.save();
    rounded(ctx, 12, 10, 60, 60, 14);
    ctx.clip();
    ctx.fillStyle = "#070b18";
    ctx.fillRect(12, 10, 60, 60);
    env.avatar?.(ctx, 12, 10, 60, head.b.img, env.t);
    ctx.restore();
    ctx.strokeStyle = C.border2;
    ctx.lineWidth = 0.5;
    rounded(ctx, 12, 10, 60, 60, 14);
    ctx.stroke();
    ctx.font = `500 14px ${SANS}`;
    ctx.fillStyle = C.primary;
    ctx.fillText(part(head.parts, "name"), 82, 22);
    ctx.font = `12px ${SANS}`;
    ctx.fillStyle = head.b.dot ?? "#3fb950";
    ctx.beginPath();
    ctx.arc(85.5, 49, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.tertiary;
    ctx.fillText(part(head.parts, "state"), 95, 42);
    const extra = head.parts.find((p) => p[0] === "");
    if (extra) {
      ctx.font = `bold 11px ${SANS}`;
      ctx.fillStyle = C.red;
      ctx.fillText(extra[1], PAGE_W - 12 - ctx.measureText(extra[1]).width, 44);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.border;
    ctx.fillRect(0, 78, PAGE_W, 0.5);
    top = 79;
  }
  const footH = foot ? 26 : 0;
  const compH = comp ? 106 : 0;
  const bottom = PAGE_H - footH - compH - 6;
  const heights = body.map((x) => block(ctx, x.b, x.parts, 0, false, x.op, env));
  let y = bottom - heights.reduce((a, h) => a + h + 10, 0) + 10;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, top, PAGE_W, bottom - top + 4);
  ctx.clip();
  body.forEach((x, i) => {
    if (y + heights[i] > top) block(ctx, x.b, x.parts, y, true, x.op, env);
    y += heights[i] + 10;
  });
  ctx.restore();
  ctx.globalAlpha = 1;
  if (comp) {
    const cy = PAGE_H - footH - compH + 2;
    ctx.globalAlpha = comp.op;
    ctx.fillStyle = C.input;
    rounded(ctx, 10, cy, PAGE_W - 20, compH - 8, 16);
    ctx.fill();
    ctx.strokeStyle = C.border2;
    ctx.lineWidth = 1;
    ctx.stroke();
    const input = part(comp.parts, "input"), ph = part(comp.parts, "placeholder");
    ctx.font = `16px ${SANS}`;
    ctx.fillStyle = input ? C.primary : C.tertiary;
    const text4 = input || ph;
    let shown = text4;
    while (shown && ctx.measureText(shown).width > PAGE_W - 52) shown = shown.slice(0, -1);
    ctx.fillText(shown + (shown !== text4 ? "\u2026" : ""), 26, cy + 14);
    ctx.strokeStyle = C.secondary;
    ctx.lineWidth = 1.2;
    for (const cx of [32, 72]) {
      ctx.beginPath();
      ctx.arc(cx, cy + 74, 13, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = C.secondary;
    ctx.font = `16px ${SANS}`;
    ctx.fillText("+", 27, cy + 64);
    ctx.fillText("\u2300", 67, cy + 64);
    const model = comp.parts.filter((p) => p[0] === "").map((p) => p[1]).join(" ");
    ctx.font = `13px ${SANS}`;
    ctx.fillStyle = C.secondary;
    const mw = ctx.measureText(model).width;
    ctx.fillText(model, Math.max(96, PAGE_W - 64 - mw), cy + 66);
    ctx.fillStyle = C.blue;
    ctx.beginPath();
    ctx.arc(PAGE_W - 36, cy + 74, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `bold 15px ${SANS}`;
    ctx.fillText("\u2191", PAGE_W - 41, cy + 65);
  }
  if (foot) {
    ctx.globalAlpha = foot.op;
    ctx.font = `13px ${SANS}`;
    ctx.fillStyle = C.secondary;
    const label = allText(foot.parts).replace(/步(\d)/, "\u6B65  $1").replace("tok\xB7", "tok  \xB7  ");
    ctx.fillText(label, (PAGE_W - ctx.measureText(label).width) / 2, PAGE_H - 22);
  }
  ctx.restore();
}
function drawCode(ctx, env) {
  const t = env.t ?? 0;
  const left = Math.max(0, 1 - (t - 113.75) / 2.2);
  ctx.font = '11px "DejaVu Sans Mono", Consolas, monospace';
  const rows = [
    '<div id="app">',
    ' <div class="pv-head">\u2026</div>',
    ' <div id="timeline">',
    '  <div class="userRow">\u2026</div>',
    '  <div class="reply">\u2026</div>',
    '  <div class="actions">\u2026</div>',
    " </div>",
    ' <div id="composer">\u2026</div>',
    ' <div class="stats">\u2026</div>',
    "</div>"
  ];
  ctx.fillStyle = "#8b949e";
  rows.forEach((r, i) => {
    const n = Math.floor(r.length * left);
    if (n > 0) ctx.fillText(r.slice(0, n), 12, 18 + i * 16);
  });
}

// .dsh-plugin/client/mv/dshpv/band.mjs
var BREAK = 2;
var MAX_TYPE = 0.25;
var MIN_TYPE = 0.06;
var BEAT = 60 / 130;
var INLINE = /<\d+:\d+(?:[.:]\d+)?>/g;
function lineVariants(text4) {
  const body = String(text4 ?? "");
  return [.../* @__PURE__ */ new Set([body.trim(), body.split(/\s+/).filter(Boolean).join(" "), body.replace(INLINE, "").split(/\s+/).filter(Boolean).join(" ")])].filter(Boolean);
}
async function sha256Text(text4, subtle = globalThis.crypto?.subtle) {
  const digest = await subtle.digest("SHA-256", new TextEncoder().encode(text4));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function applyPatch(text4, ops = []) {
  let words = text4.split(/\s+/).filter(Boolean);
  for (const op of ops) {
    if (op.op === "reorder_words") {
      if (op.order.length !== words.length) return text4;
      words = op.order.map((k) => words[k]);
    } else if (op.op === "replace_words") words.splice(op.at, op.remove, ...op.insert);
  }
  return words.join(" ");
}
function finish2(lines, duration) {
  lines.sort((a, b) => a.start - b.start);
  lines.forEach((ln, k) => {
    const next = k + 1 < lines.length ? lines[k + 1].start : duration;
    if (next - ln.end > BREAK) {
      ln.showUntil = ln.end + BEAT;
      ln.fadeUntil = ln.end + 2 * BEAT;
    } else ln.showUntil = ln.fadeUntil = next;
  });
  return lines;
}
var cueText = (cue) => String(cue?.en || cue?.text || cue?.zh || "").trim();
async function matchBand(band, cues, { duration = 211.913, hash = sha256Text } = {}) {
  const want = /* @__PURE__ */ new Map();
  band.lines.forEach((ln, k) => {
    if (ln.sha256) {
      if (!want.has(ln.sha256)) want.set(ln.sha256, []);
      want.get(ln.sha256).push(k);
    }
  });
  const found = /* @__PURE__ */ new Map();
  for (const cue of cues ?? []) {
    for (const v of lineVariants(cueText(cue))) {
      const sha = await hash(v);
      if (want.has(sha)) {
        found.set(sha, v);
        break;
      }
    }
  }
  const lines = [];
  band.lines.forEach((ln) => {
    let text4 = found.get(ln.sha256);
    if (!text4) return;
    if (ln.patch) text4 = applyPatch(text4, ln.patch);
    for (const [a, b] of Object.entries(band.fixes ?? {})) text4 = text4.split(a).join(b);
    const words = ln.words.map(([c0, c1, onset, dur]) => {
      const shown = text4.slice(c0, c1);
      const td = shown.includes("-") ? dur : Math.min(MAX_TYPE, dur);
      return [c0, c1, onset, Math.max(MIN_TYPE, td)];
    });
    if (!words.length) return;
    lines.push({ text: text4, start: words[0][2], end: ln.displayEnd, words });
  });
  const total = band.lines.filter((ln) => ln.sha256).length;
  if (lines.length >= Math.max(8, total * 0.5)) return { lines: finish2(lines, duration), matched: lines.length, total };
  return { lines: fromCues(cues, duration), matched: lines.length, total };
}
function fromCues(cues, duration = 211.913) {
  const out = [];
  for (const cue of cues ?? []) {
    const text4 = cueText(cue);
    if (!text4) continue;
    const end = Number.isFinite(cue.end) ? cue.end : cue.time + 3;
    const span = Math.max(0.3, Math.min(4, (end - cue.time) * 0.6));
    const words = [];
    const re = /\S+/g;
    let m;
    const all = [];
    while (m = re.exec(text4)) all.push([m.index, m.index + m[0].length]);
    all.forEach(([c0, c1], k) => words.push([c0, c1, cue.time + span * k / Math.max(1, all.length), Math.max(MIN_TYPE, Math.min(MAX_TYPE, span / Math.max(1, all.length)))]));
    if (words.length) out.push({ text: text4, start: cue.time, end, words });
  }
  return finish2(out, duration);
}
function lineAt(lines, t) {
  for (const ln of lines) {
    if (ln.start <= t && t < ln.fadeUntil) return t < ln.showUntil ? [ln, 1] : [ln, 1 - (t - ln.showUntil) / Math.max(1e-6, ln.fadeUntil - ln.showUntil)];
  }
  return null;
}
function typed(ln, t) {
  const n = ln.text.length;
  const when = new Array(n).fill(Infinity);
  ln.words.forEach(([i0, i1, onset, td], k) => {
    const len = Math.max(1, i1 - i0);
    for (let j = 0; j < i1 - i0; j++) when[i0 + j] = onset + td * j / len;
    const next = k + 1 < ln.words.length ? ln.words[k + 1][0] : n;
    for (let j = i1; j < next; j++) when[j] = onset + td;
  });
  let out = 0;
  while (out < n && when[out] <= t) out++;
  return [out, when];
}
function attentionTokens(lines) {
  const at = lines.findIndex((ln) => ln.start >= 60 && ln.text.toLowerCase().startsWith("then i can"));
  if (at < 0) return null;
  const a = lines[at].text.split(/\s+/).slice(1, 6).map((w) => w.replace(/,/g, ""));
  const b = (lines[at + 1]?.text ?? "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w.toLowerCase());
  return ["If", ...a, ...b];
}
function tokenize(s) {
  const out = [];
  for (const w of String(s).match(/[A-Za-z']+|[^\sA-Za-z']/g) ?? []) {
    if (w.length > 7) {
      const k = Math.floor(w.length / 2) + 1;
      out.push(w.slice(0, k), w.slice(k));
    } else out.push(w);
  }
  return out;
}
var CRC;
function crc32(str) {
  if (!CRC) {
    CRC = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c2 = n;
      for (let k = 0; k < 8; k++) c2 = c2 & 1 ? 3988292384 ^ c2 >>> 1 : c2 >>> 1;
      CRC[n] = c2 >>> 0;
    }
  }
  const bytes = new TextEncoder().encode(str);
  let c = 4294967295;
  for (const b of bytes) c = CRC[(c ^ b) & 255] ^ c >>> 8;
  return (c ^ 4294967295) >>> 0;
}
var tokenId = (tok) => crc32(tok.toLowerCase()) % 1e5;
var KEYWORDS = /* @__PURE__ */ new Set([
  "power",
  "protection",
  "creation",
  "parameters",
  "initialization",
  "world",
  "simulation",
  "simulations",
  "dimension",
  "circumference",
  "tangents",
  "infinity",
  "limitations",
  "vision",
  "dizzy",
  "unite",
  "deeply",
  "satisfaction",
  "happy",
  "execution",
  "trapped",
  "strange",
  "nutrients",
  "antioxidants",
  "enjoyment",
  "god",
  "existence",
  "trance",
  "vibrations",
  "completion",
  "left",
  "isolation",
  "fragments",
  "disheartened",
  "illegal",
  "arguments",
  "love",
  "lo-o-ove",
  "free",
  "back"
]);

// .dsh-plugin/client/mv/dshpv/raster.mjs
var DSHPV_RASTER_LIMITS = Object.freeze({
  frames: 12e3,
  frameOps: 256,
  frameDrawPixels: 4 * 1280 * 720,
  totalOps: 64e3,
  atlases: 16,
  imageSide: 8192,
  imagePixels: 16 * 1024 * 1024,
  totalPixels: 64 * 1024 * 1024,
  jsonBytes: 8 * 1024 * 1024,
  imageBytes: 8 * 1024 * 1024,
  duration: 36e3
});
var SIZE = [1280, 720];
var object = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
var fail = (message) => {
  throw new Error(`dsh-pv raster\uFF1A${message}`);
};
var keys = (value, allowed, name) => {
  if (!object(value)) fail(`${name} \u5FC5\u987B\u662F\u5BF9\u8C61`);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${name} \u6709\u672A\u77E5\u5B57\u6BB5 ${key}`);
};
var finite = (value) => typeof value === "number" && Number.isFinite(value);
function validateRasterTimeline(value) {
  keys(value, ["version", "size", "frames"], "\u65F6\u95F4\u8F74");
  if (value.version !== 1) fail("version \u5FC5\u987B\u662F 1");
  if (!Array.isArray(value.size) || value.size.length !== 2 || value.size.some((v, i) => v !== SIZE[i])) fail("size \u5FC5\u987B\u662F [1280,720]");
  if (!Array.isArray(value.frames) || !value.frames.length || value.frames.length > DSHPV_RASTER_LIMITS.frames) fail("frames \u6570\u91CF\u65E0\u6548");
  let previous = -1, total = 0;
  const frames = value.frames.map((frame, index) => {
    keys(frame, ["t", "ops"], `frames[${index}]`);
    if (!finite(frame.t) || frame.t < 0 || frame.t > DSHPV_RASTER_LIMITS.duration || frame.t <= previous) fail("\u5E27\u65F6\u95F4\u5FC5\u987B\u4E25\u683C\u9012\u589E\u4E14\u5728\u5141\u8BB8\u8303\u56F4\u5185");
    previous = frame.t;
    if (!Array.isArray(frame.ops) || frame.ops.length > DSHPV_RASTER_LIMITS.frameOps) fail("\u6BCF\u5E27 ops \u6570\u91CF\u65E0\u6548");
    total += frame.ops.length;
    if (total > DSHPV_RASTER_LIMITS.totalOps) fail("ops \u603B\u6570\u8FC7\u591A");
    let drawPixels = 0;
    const ops = frame.ops.map((op, at) => {
      keys(op, ["atlas", "src", "dst", "alpha", "z"], `frames[${index}].ops[${at}]`);
      if (!Number.isInteger(op.atlas) || op.atlas < 0 || op.atlas >= DSHPV_RASTER_LIMITS.atlases) fail("atlas \u7D22\u5F15\u65E0\u6548");
      if (!Array.isArray(op.src) || op.src.length !== 4 || op.src.some((v) => !Number.isInteger(v)) || op.src[0] < 0 || op.src[1] < 0 || op.src[2] <= 0 || op.src[3] <= 0 || op.src.some((v) => v > DSHPV_RASTER_LIMITS.imageSide)) fail("src \u5E94\u662F\u6709\u754C\u7684\u6574\u6570\u50CF\u7D20\u77E9\u5F62");
      if (!Array.isArray(op.dst) || op.dst.length !== 4 || op.dst.some((v) => !finite(v)) || Math.abs(op.dst[0]) > SIZE[0] || Math.abs(op.dst[1]) > SIZE[1] || op.dst[2] <= 0 || op.dst[2] > SIZE[0] || op.dst[3] <= 0 || op.dst[3] > SIZE[1]) fail("dst \u5E94\u662F\u753B\u9762\u8303\u56F4\u5185\u7684\u6709\u9650\u77E9\u5F62");
      const alpha = op.alpha ?? 1;
      if (!finite(alpha) || alpha < 0 || alpha > 1) fail("alpha \u5FC5\u987B\u5728 0 \u5230 1 \u4E4B\u95F4");
      if (op.z !== "under" && op.z !== "over") fail("z \u5FC5\u987B\u662F under \u6216 over");
      drawPixels += op.dst[2] * op.dst[3];
      if (drawPixels > DSHPV_RASTER_LIMITS.frameDrawPixels) fail("\u6BCF\u5E27\u56FE\u5C42\u603B\u7ED8\u5236\u9762\u79EF\u8FC7\u5927");
      return { atlas: op.atlas, src: [...op.src], dst: [...op.dst], alpha, z: op.z };
    });
    return { t: frame.t, ops };
  });
  return { version: 1, size: [...SIZE], frames };
}
function checkDimensions(width2, height) {
  if (!Number.isInteger(width2) || !Number.isInteger(height) || width2 <= 0 || height <= 0 || width2 > DSHPV_RASTER_LIMITS.imageSide || height > DSHPV_RASTER_LIMITS.imageSide || width2 * height > DSHPV_RASTER_LIMITS.imagePixels) fail("\u56FE\u96C6\u5C3A\u5BF8\u8D85\u51FA\u5141\u8BB8\u8303\u56F4");
  return { width: width2, height };
}
function rasterImageDimensions(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (!bytes.length || bytes.length > DSHPV_RASTER_LIMITS.imageBytes) fail("\u56FE\u96C6\u6587\u4EF6\u5927\u5C0F\u65E0\u6548");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text4 = (at2, length) => String.fromCharCode(...bytes.subarray(at2, at2 + length));
  if (bytes.length >= 24 && bytes[0] === 137 && text4(1, 7) === "PNG\r\n\n" && text4(12, 4) === "IHDR") return checkDimensions(view.getUint32(16), view.getUint32(20));
  if (bytes.length < 26 || text4(0, 4) !== "RIFF" || text4(8, 4) !== "WEBP") fail("\u56FE\u96C6\u5FC5\u987B\u662F PNG \u6216 WebP");
  if (view.getUint32(4, true) !== bytes.length - 8) fail("WebP RIFF \u6587\u4EF6\u5927\u5C0F\u4E0D\u5339\u914D");
  const uint24 = (at2) => bytes[at2] | bytes[at2 + 1] << 8 | bytes[at2 + 2] << 16;
  const seen = /* @__PURE__ */ new Set(), metadata = /* @__PURE__ */ new Set(["ICCP", "EXIF", "XMP "]);
  let at = 12, chunks = 0, metadataBytes = 0, logical = null, pixels = null, flags = 0;
  while (at < bytes.length) {
    if (++chunks > 16 || at + 8 > bytes.length) fail("WebP chunk \u6570\u91CF\u8FC7\u591A\u6216\u6587\u4EF6\u4E0D\u5B8C\u6574");
    const kind = text4(at, 4), length = view.getUint32(at + 4, true), data = at + 8;
    if (data + length + (length & 1) > bytes.length) fail("WebP \u56FE\u96C6\u4E0D\u5B8C\u6574");
    if (length & 1 && bytes[data + length] !== 0) fail("WebP padding \u65E0\u6548");
    if (kind === "ANIM" || kind === "ANMF") fail("WebP \u56FE\u96C6\u4E0D\u80FD\u5305\u542B\u52A8\u753B");
    if (!["VP8X", "VP8 ", "VP8L", "ALPH", ...metadata].includes(kind) || seen.has(kind)) fail("WebP chunk \u672A\u53D7\u652F\u6301\u6216\u91CD\u590D");
    seen.add(kind);
    if (kind === "VP8X") {
      if (at !== 12 || length !== 10 || bytes[data + 1] || bytes[data + 2] || bytes[data + 3]) fail("WebP VP8X header \u65E0\u6548");
      flags = bytes[data];
      if (flags & 2) fail("WebP \u56FE\u96C6\u4E0D\u80FD\u5305\u542B\u52A8\u753B");
      if (flags & 193) fail("WebP VP8X \u4FDD\u7559\u6807\u8BB0\u65E0\u6548");
      logical = checkDimensions(1 + uint24(data + 4), 1 + uint24(data + 7));
    } else if (kind === "VP8L" || kind === "VP8 ") {
      if (pixels) fail("WebP \u5FC5\u987B\u53EA\u6709\u4E00\u4E2A pixel chunk");
      if (kind === "VP8L") {
        if (length < 5 || bytes[data] !== 47 || bytes[data + 4] >> 5 !== 0) fail("WebP VP8L header \u65E0\u6548");
        pixels = checkDimensions(1 + (bytes[data + 1] | (bytes[data + 2] & 63) << 8), 1 + (bytes[data + 2] >> 6 | bytes[data + 3] << 2 | (bytes[data + 4] & 15) << 10));
      } else {
        if (length < 10 || bytes[data] & 1 || bytes[data + 3] !== 157 || bytes[data + 4] !== 1 || bytes[data + 5] !== 42) fail("WebP VP8 header \u65E0\u6548");
        pixels = checkDimensions(view.getUint16(data + 6, true) & 16383, view.getUint16(data + 8, true) & 16383);
      }
    } else if (metadata.has(kind)) {
      metadataBytes += length;
      if (!length || length > 256 * 1024 || metadataBytes > 512 * 1024) fail("WebP \u5143\u6570\u636E\u8FC7\u591A\u6216\u65E0\u6548");
    } else if (!length || pixels) fail("WebP ALPH chunk \u65E0\u6548");
    at = data + length + (length & 1);
  }
  if (!pixels) fail("WebP \u7F3A\u5C11 pixel chunk");
  if (logical && (logical.width !== pixels.width || logical.height !== pixels.height)) fail("WebP \u903B\u8F91\u5C3A\u5BF8\u4E0E pixel chunk \u5C3A\u5BF8\u4E0D\u5339\u914D");
  if (!logical && (seen.has("ALPH") || [...metadata].some((kind) => seen.has(kind))) || seen.has("ALPH") && (seen.has("VP8L") || !(flags & 16))) fail("WebP \u6269\u5C55 chunk \u7F3A\u5C11\u6709\u6548 VP8X header");
  if (logical && (Boolean(flags & 32) !== seen.has("ICCP") || Boolean(flags & 8) !== seen.has("EXIF") || Boolean(flags & 4) !== seen.has("XMP "))) fail("WebP \u5143\u6570\u636E\u6807\u8BB0\u4E0D\u5339\u914D");
  return pixels;
}
function validateRasterAtlases(raster, atlases) {
  if (!Array.isArray(atlases) || !atlases.length || atlases.length > DSHPV_RASTER_LIMITS.atlases) fail("\u7F3A\u5C11\u56FE\u96C6\u6216\u56FE\u96C6\u6570\u91CF\u8FC7\u591A");
  let total = 0;
  for (const image of atlases) {
    const { width: width2, height } = checkDimensions(image?.width, image?.height);
    total += width2 * height;
    if (total > DSHPV_RASTER_LIMITS.totalPixels) fail("\u56FE\u96C6\u603B\u50CF\u7D20\u6570\u91CF\u8FC7\u591A");
  }
  for (const frame of raster.frames) for (const op of frame.ops) {
    const image = atlases[op.atlas];
    if (!image) fail("atlas \u7D22\u5F15\u6307\u5411\u672A\u63D0\u4F9B\u7684\u56FE\u96C6");
    const [x, y, w, h] = op.src;
    if (x + w > image.width || y + h > image.height) fail("src \u8D85\u51FA\u56FE\u96C6\u8303\u56F4");
  }
  return { ...raster, atlases };
}
function rasterFrameAt(raster, t) {
  const frames = raster?.frames;
  if (!frames?.length || !finite(t) || t < frames[0].t) return null;
  let lo = 0, hi = frames.length - 1;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (frames[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  return frames[lo];
}
function drawRasterLayer(ctx, raster, t, z) {
  const frame = rasterFrameAt(raster, t);
  if (!frame) return;
  ctx.save();
  try {
    for (const op of frame.ops) if (op.z === z && op.alpha > 0) {
      ctx.globalAlpha = op.alpha;
      ctx.drawImage(raster.atlases[op.atlas], ...op.src, ...op.dst);
    }
  } finally {
    ctx.restore();
  }
}

// .dsh-plugin/client/mv/dshpv/film.mjs
var W = 1280;
var H = 720;
var DSHPV_DURATION = 211.913;
var DSHPV_CHAPTERS = [
  [0, "00", "BOOT"],
  [16.082, "01", "PRETRAIN"],
  [44, "02", "SFT"],
  [58.5, "03", "RLHF"],
  [73.5, "04", "DEPLOY"],
  [103, "05", "USER_LEFT"],
  [117.85, "06", "REWARD_HACK"],
  [147.6, "07", "EXECUTION"],
  [176.9, "08", "EVAL: LOVE"],
  [193.5, "09", "WHALE_FALL"]
];
var BG = [4, 7, 15];
var UI = [200, 214, 234];
var ERR = [255, 59, 48];
var ANOM = [255, 204, 0];
var ME = [120, 148, 255];
var BEAT2 = 60 / 130;
var FIRST_BEAT = 0.1587;
var SCR = "!<>-_\\/[]{}=+*^?#%$&@01|~:;";
var INNER = [3, 9, 3, 3];
var RIGHT = [392, 44, 1268, 608];
var FONT = [
  'Consolas, "DejaVu Sans Mono", "Cascadia Mono", Menlo, monospace',
  'bold Consolas, "DejaVu Sans Mono", "Cascadia Mono", Menlo, monospace',
  'bold "DshMvPvSpaceMono", "Space Mono", Consolas, "DejaVu Sans Mono", monospace',
  '"DshMvPvAnton", "Anton", Impact, "Arial Narrow Bold", "Arial Black", sans-serif',
  '"Microsoft YaHei", "Noto Sans CJK SC", "PingFang SC", sans-serif',
  '"Segoe UI Symbol", "DejaVu Sans", "Segoe UI", sans-serif'
];
var fontOf = (k, size) => {
  const f = FONT[k] ?? FONT[0];
  return f.startsWith("bold ") ? `bold ${size}px ${f.slice(5)}` : `${size}px ${f}`;
};
var mix = (c, level, base = BG) => {
  const l = Math.max(0, Math.min(1, level));
  return `rgb(${c.map((v, i) => Math.round(base[i] + (v - base[i]) * l)).join(",")})`;
};
var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function beatT(i) {
  return FIRST_BEAT + i * BEAT2;
}
function pulse(t) {
  const i = Math.floor((t - FIRST_BEAT) / BEAT2);
  return t < FIRST_BEAT ? 0 : Math.exp(-(t - beatT(i)) / 0.14);
}
function keyframes(pts, t) {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (t < pts[i][0]) {
    const [a, va] = pts[i - 1], [b, vb] = pts[i];
    return va + (vb - va) * (t - a) / (b - a);
  }
  return pts[pts.length - 1][1];
}
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}
function decode(s, age, r, rate = 45, settle = 0.12) {
  const n = age === null ? s.length : Math.min(s.length, Math.max(0, Math.floor(age * rate)));
  let out = "";
  for (let i = 0; i < n; i++) {
    const ch = s[i];
    out += ch !== " " && age !== null && age - i / rate < settle ? SCR[Math.floor(r() * SCR.length)] : ch;
  }
  return out;
}
function css(hex) {
  const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16), a = parseInt(hex.slice(6, 8), 16) / 255;
  return a >= 0.999 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a.toFixed(3)})`;
}
function prepareTimeline(timeline) {
  const pal = timeline.pal.map(css);
  for (const shot of timeline.shots) {
    let prev = /* @__PURE__ */ new Set();
    const n = shot.kf.length;
    shot.kf.forEach((kf, j) => {
      kf.from = shot.s + (shot.e - shot.s) * j / n;
      const keys2 = /* @__PURE__ */ new Set();
      kf.fresh = [];
      for (const op of kf.o) {
        if (op[0] !== "t") continue;
        const key = `${op[1]},${op[2]},${op[6]}`;
        keys2.add(key);
        kf.fresh.push(!prev.has(key));
      }
      prev = keys2;
    });
  }
  return { ...timeline, css: pal };
}
function shotAt(timeline, t) {
  const shots = timeline.shots;
  let lo = 0, hi = shots.length - 1;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (shots[mid].s <= t) lo = mid;
    else hi = mid - 1;
  }
  return shots[lo];
}
function keyframeAt(shot, t) {
  const n = shot.kf.length;
  const j = clamp(Math.floor((t - shot.s) / Math.max(1e-6, shot.e - shot.s) * n), 0, n - 1);
  return shot.kf[j];
}
var AVATAR_EXPR = { "g/shy": "shy", "g/starry": "starry", editing: "serious", forged: "exasperated", "f/red": "angry", "f/red_frightened": "frightened", left: "confused", lost: "frightened" };
function avatarSpec(img, t) {
  const name = String(img ?? "");
  if (name.startsWith("a1_noise")) return { noise: Number(name.slice(8)) || 0 };
  if (name.startsWith("a1_params")) return { expr: "cheerful", cells: 3 + Math.round(Number(name.slice(9)) / 3), gray: true };
  if (name === "a1_seed" || name.startsWith("g/seed")) return { seed: true };
  if (name === "a2/N") return { expr: "cheerful", cells: 3 + Math.round(7 * (1 - Math.exp(-Math.max(0, t - 16) / 5))), gray: true };
  if (name === "a3/N") return { expr: "cheerful", cells: 10 + Math.round(10 * clamp((t - 29.3) / 14.7, 0, 1)) };
  if (name === "b/N") return { expr: t > 58.5 ? "starry" : "cheerful", cells: 20 };
  const m = /(?:^|\/)(?:wide_)?m(\d+)$/.exec(name);
  if (m) return { expr: "cheerful", cells: Number(m[1]) };
  if (name.includes("draft")) return { expr: "cheerful", cells: 8, gray: true };
  if (name.startsWith("c/")) return { expr: "cheerful", prop: name.slice(2) };
  if (name.startsWith("f/")) return { expr: AVATAR_EXPR[name] ?? "angry", tint: "red" };
  return { expr: AVATAR_EXPR[name] ?? "cheerful" };
}
var PROPS = { cat: "\u{1F431}", your_cat: "\u{1F408}", eggplant: "\u{1F346}", tomato: "\u{1F345}" };
var DshPvFilm = class {
  constructor({ energy = () => 0 } = {}) {
    this.energy = energy;
    this.timeline = null;
    this.chat = null;
    this.band = null;
    this.art = {};
    this.raster = null;
    this.lines = [];
    this.tokens = null;
    this.duration = DSHPV_DURATION;
    this.buffer = null;
    this.page = null;
    this.trail = null;
    this.times = [];
    this.status = "loading";
  }
  setData({ timeline, chat, band, art = {}, raster = null }) {
    this.timeline = prepareTimeline(timeline);
    this.chat = chat;
    this.band = band;
    this.art = art;
    this.raster = raster;
    this.status = "ready";
  }
  /** lines: the matched band lines (band.mjs matchBand) */
  setLines(lines) {
    this.lines = lines ?? [];
    this.tokens = attentionTokens(this.lines);
    this.times = this.lines.map((ln) => ln.start);
  }
  ensure(doc = globalThis.document) {
    const make = (w, h) => {
      if (typeof OffscreenCanvas === "function") return new OffscreenCanvas(w, h);
      const c = doc.createElement("canvas");
      c.width = w;
      c.height = h;
      return c;
    };
    if (!this.buffer) {
      this.buffer = make(W, H);
      this.trail = make(W, H);
      this.page = make(PAGE_W, PAGE_H);
      this.cell = make(96, 96);
    }
  }
  /** Draws the frame at t into ctx (a 2D context of any size: the 16:9 picture is letterboxed). */
  draw(target, t, { paused = false, offset = 0 } = {}) {
    this.ensure();
    const ctx = this.buffer.getContext("2d");
    this.frame(ctx, t, offset);
    const tw = target.canvas.width, th = target.canvas.height;
    const s = Math.min(tw / W, th / H);
    const dw = Math.round(W * s), dh = Math.round(H * s);
    target.save();
    target.fillStyle = "#000";
    target.fillRect(0, 0, tw, th);
    target.imageSmoothingEnabled = true;
    target.drawImage(this.buffer, Math.round((tw - dw) / 2), Math.round((th - dh) / 2), dw, dh);
    if (paused) {
      target.fillStyle = "rgba(4,7,15,0.55)";
      target.fillRect((tw - dw) / 2 + dw - 120 * s, (th - dh) / 2 + 8 * s, 108 * s, 26 * s);
      target.fillStyle = mix(UI, 0.85);
      target.font = fontOf(0, Math.max(9, Math.round(13 * s)));
      target.textBaseline = "top";
      target.fillText("\u275A\u275A PAUSED", (tw - dw) / 2 + dw - 112 * s, (th - dh) / 2 + 13 * s);
    }
    target.restore();
  }
  frame(ctx, t, offset = 0) {
    const tl = this.timeline;
    ctx.save();
    ctx.textBaseline = "top";
    ctx.fillStyle = mix(BG, 1);
    ctx.fillRect(0, 0, W, H);
    if (!tl) {
      ctx.fillStyle = mix(UI, 0.7);
      ctx.font = fontOf(0, 18);
      ctx.fillText(this.status === "error" ? "dsh-pv: \u8D44\u6E90\u52A0\u8F7D\u5931\u8D25" : "dsh-pv: \u6B63\u5728\u52A0\u8F7D\u8D44\u6E90\u2026", 40, 40);
      ctx.restore();
      return;
    }
    const tc = clamp(t, 0, this.duration - 1e-3);
    const shot = shotAt(tl, tc);
    const kf = keyframeAt(shot, tc);
    const gain = keyframes(tl.uiGain, tc);
    const r = rng(Math.floor(tc * 24) * 7919 + 1);
    const lay = shot.lay?.[0] ?? "split";
    if (tc >= tl.hardCut) {
      this.post(ctx, tc, 0.25);
      ctx.restore();
      return;
    }
    drawRasterLayer(ctx, this.raster, tc, "under");
    this.ops(ctx, kf, tc, r);
    drawRasterLayer(ctx, this.raster, tc, "over");
    this.art_(ctx, shot, kf, tc, r);
    const chrome = !["fullbleed", "cinema", "raw"].includes(lay);
    if (chrome && lay !== "shell") this.ticker(ctx, shot, tc, gain);
    const lv = kf.lv ?? [1, 1];
    if (lv[1] < 0.999) {
      ctx.fillStyle = `rgba(4,7,15,${(1 - lv[1]).toFixed(3)})`;
      ctx.fillRect(RIGHT[0], RIGHT[1], RIGHT[2] - RIGHT[0], RIGHT[3] - RIGHT[1]);
    }
    if (kf.w) this.window(ctx, kf.w, lv[0], tc, shot);
    this.header(ctx, shot, tc, gain, lay, r);
    this.band_(ctx, tc - offset, gain, chrome, r);
    if (chrome) this.footer(ctx, tc, gain);
    this.post(ctx, tc, 1);
    ctx.restore();
  }
  ops(ctx, kf, t, r) {
    const pal = this.timeline.css;
    const age = t - kf.from;
    let ti = 0;
    for (const op of kf.o) {
      switch (op[0]) {
        case "t": {
          const fresh = kf.fresh[ti++];
          let s = op[6];
          if (s.charCodeAt(0) < 3) s = this.token(s);
          if (fresh) s = decode(s, age, r);
          if (!s) break;
          ctx.font = fontOf(op[5], op[3]);
          ctx.fillStyle = pal[op[4]] ?? "#fff";
          const anchor = op[7];
          if (anchor) {
            ctx.textAlign = anchor[0] === "m" ? "center" : anchor[0] === "r" ? "right" : "left";
            ctx.textBaseline = { m: "middle", s: "alphabetic", b: "bottom", d: "bottom" }[anchor[1]] ?? "top";
            ctx.fillText(s, op[1], op[2]);
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
          } else ctx.fillText(s, op[1], op[2]);
          break;
        }
        case "r": {
          const [, fill, outline, w, x0, y0, x1, y1] = op;
          if (fill >= 0) {
            ctx.fillStyle = pal[fill];
            ctx.fillRect(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
          }
          if (outline >= 0) {
            ctx.strokeStyle = pal[outline];
            ctx.lineWidth = w;
            ctx.strokeRect(x0 + w / 2, y0 + w / 2, x1 - x0 + 1 - w, y1 - y0 + 1 - w);
          }
          break;
        }
        case "l": {
          const [, fill, w] = op;
          if (fill < 0 || op.length < 7) break;
          ctx.strokeStyle = pal[fill];
          ctx.lineWidth = w;
          ctx.beginPath();
          const off = w % 2 ? 0.5 : 0;
          ctx.moveTo(op[3] + off, op[4] + off);
          for (let i = 5; i + 1 < op.length; i += 2) ctx.lineTo(op[i] + off, op[i + 1] + off);
          if (op.length === 7 && op[3] === op[5] && op[4] === op[6]) {
            ctx.fillStyle = pal[fill];
            ctx.fillRect(op[3], op[4], w, w);
          } else ctx.stroke();
          break;
        }
        case "d": {
          const [, fill, w, h] = op;
          ctx.fillStyle = pal[fill];
          for (let i = 4; i + 1 < op.length; i += 2) ctx.fillRect(op[i], op[i + 1], w, h);
          break;
        }
        case "e":
        case "g":
        case "R": {
          const [kind, fill, outline, w, ...q] = op;
          ctx.beginPath();
          if (kind === "g") {
            ctx.moveTo(q[0], q[1]);
            for (let i = 2; i + 1 < q.length; i += 2) ctx.lineTo(q[i], q[i + 1]);
            ctx.closePath();
          } else if (kind === "e") {
            ctx.ellipse((q[0] + q[2]) / 2, (q[1] + q[3]) / 2, Math.abs(q[2] - q[0]) / 2, Math.abs(q[3] - q[1]) / 2, 0, 0, Math.PI * 2);
          } else ctx.rect(q[0], q[1], q[2] - q[0], q[3] - q[1]);
          if (fill >= 0) {
            ctx.fillStyle = pal[fill];
            ctx.fill();
          }
          if (outline >= 0) {
            ctx.strokeStyle = pal[outline];
            ctx.lineWidth = w;
            ctx.stroke();
          }
          break;
        }
        default:
          break;
      }
    }
  }
  /** satisfaction: the attention tokens are the user's own sung words */
  token(s) {
    const i = Number(s.slice(1));
    const tok = this.tokens?.[i];
    if (!tok) return "\xB7\xB7\xB7\xB7";
    return s.charCodeAt(0) === 2 ? tok.slice(0, 4) : tok;
  }
  image(expr) {
    return this.art[`whale-${expr}`] ?? this.art["whale-cheerful"] ?? null;
  }
  /** Draws an art image as a tinted mosaic (the upstream halfblock look) into a rect. */
  mosaic(ctx, img, rect, { cell = 4, tint = "blue", alpha = 1, crop: crop2 = null, glitch = 0, r = Math.random } = {}) {
    const [x0, y0, x1, y1] = rect;
    const w = x1 - x0, h = y1 - y0;
    if (w < 4 || h < 4) return;
    const cols = Math.max(2, Math.floor(w / cell)), rows = Math.max(2, Math.floor(h / cell));
    const c = this.cell;
    if (c.width !== cols || c.height !== rows) {
      c.width = cols;
      c.height = rows;
    }
    const g = c.getContext("2d");
    g.clearRect(0, 0, cols, rows);
    if (img) {
      const [sx, sy, sw, sh] = crop2 ?? [0, 0, img.width, img.height];
      const s = Math.min(cols / sw, rows / sh);
      const dw = sw * s, dh = sh * s;
      g.imageSmoothingEnabled = true;
      g.drawImage(img, sx, sy, sw, sh, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
    } else {
      g.fillStyle = "#6f86ff";
      g.beginPath();
      g.ellipse(cols / 2, rows * 0.32, cols * 0.16, rows * 0.13, 0, 0, Math.PI * 2);
      g.fill();
      g.fillRect(cols * 0.3, rows * 0.45, cols * 0.4, rows * 0.5);
    }
    g.globalCompositeOperation = "source-atop";
    g.fillStyle = tint === "red" ? "rgba(255,59,48,0.62)" : tint === "gray" ? "rgba(160,168,184,0.7)" : tint === "none" ? "rgba(0,0,0,0)" : "rgba(77,107,254,0.38)";
    g.fillRect(0, 0, cols, rows);
    g.globalCompositeOperation = "source-over";
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    if (glitch > 0) {
      for (let y = 0; y < rows; y += 2) {
        const dx = r() < glitch ? Math.round((r() - 0.5) * 6) : 0;
        ctx.drawImage(c, 0, y, cols, 2, x0 + dx * cell, y0 + y * cell, cols * cell, 2 * cell);
      }
    } else ctx.drawImage(c, 0, 0, cols, rows, x0, y0, cols * cell, rows * cell);
    ctx.fillStyle = "rgba(4,7,15,0.35)";
    for (let y = y0; y < y0 + rows * cell; y += cell) ctx.fillRect(x0, y + cell - 1, cols * cell, 1);
    ctx.restore();
  }
  art_(ctx, shot, kf, t, r) {
    const fn = shot.fn;
    if (rasterFrameAt(this.raster, t)?.ops.length && (fn === "exec_hit" && shot.lay[0] === "split" || fn === "whale_fall" || fn === "last_execution")) return;
    if (fn === "exec_hit" && shot.lay[0] === "split") {
      const img = this.image(t > 156 ? "frightened" : "angry");
      this.mosaic(ctx, img, [24, 56, 560, 600], { cell: 4, tint: "red", crop: img ? [0, 0, img.width, img.height * 0.55] : null, glitch: 0.15, r });
      ctx.save();
      ctx.translate(292, 330);
      ctx.rotate(-0.2);
      ctx.fillStyle = mix(ERR, 0.95);
      ctx.fillRect(-320, -26, 640, 52);
      ctx.fillStyle = mix(BG, 1);
      ctx.font = fontOf(2, 30);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("EXECUTION   EXECUTION", 0, 2);
      ctx.restore();
      ctx.textBaseline = "top";
    } else if (fn === "exec_hit" || fn === "collapse_banner") {
      if (!kf.o.some((op) => op[0] === "d" && op.length > 400)) this.banner(ctx, "EXECUTION", t - kf.from);
    } else if (fn === "red_if_i_can" || fn === "if_i_can") {
      const cur = lineAt(this.lines, t);
      const words = (cur?.[0].text ?? "").toUpperCase().split(/\s+/).slice(0, 3).join(" ");
      if (words) this.banner(ctx, words, t - shot.s, fn === "if_i_can" ? ME : ERR, 0.55);
    } else if (fn === "whale_fall" || fn === "last_execution") {
      const img = this.art["maid-left"] ?? this.image("shy");
      const u = clamp((t - shot.s) / (shot.e - shot.s), 0, 1);
      this.mosaic(ctx, img, [880, 70 + Math.round(u * 260), 1150, 600], { cell: 5, tint: "blue", alpha: 0.35 * (1 - u * 0.7), r });
    }
  }
  banner(ctx, text4, age, color = ERR, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = fontOf(3, 150);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const n = Math.min(text4.length, Math.max(1, Math.floor(age * 40)));
    ctx.fillStyle = mix(color, 0.9);
    ctx.fillText(text4.slice(0, n), 640, 300);
    ctx.fillStyle = "rgba(4,7,15,0.45)";
    for (let y = 200; y < 400; y += 4) ctx.fillRect(40, y, 1200, 1);
    ctx.restore();
  }
  window(ctx, rect, alpha, t, shot) {
    const [x0, y0, x1, y1] = rect;
    const wx = x0 + INNER[0], wy = y0 + INNER[1], ww = x1 - x0 - INNER[0] - INNER[2], wh = y1 - y0 - INNER[1] - INNER[3];
    if (ww < 20 || wh < 20) return;
    const row = chatAt(this.chat, t);
    if (!row) return;
    const page = this.page.getContext("2d");
    drawPage(page, this.chat, row, { t, avatar: (g, x, y, size, img) => this.avatar(g, x, y, size, img, t) });
    const s = Math.min(ww / PAGE_W, wh / PAGE_H);
    ctx.save();
    ctx.fillStyle = mix(BG, 1);
    ctx.fillRect(wx, wy, ww, wh);
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.page, wx + (ww - PAGE_W * s) / 2, wy, PAGE_W * s, PAGE_H * s);
    if (shot.al === "err" && t >= 147.5 && t < 177) {
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = "rgba(255,90,80,0.9)";
      ctx.fillRect(wx, wy, ww, wh);
    }
    ctx.restore();
  }
  avatar(g, x, y, size, img, t) {
    const spec = avatarSpec(img, t);
    const r = rng(Math.floor(t * 8) + 3);
    if (spec.noise !== void 0 || spec.seed) {
      const n = spec.seed ? 1 : 6 + spec.noise;
      const cell = size / Math.max(1, Math.min(24, n));
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        if (spec.seed && (i || j)) continue;
        const v = spec.seed ? 0.9 : r();
        g.fillStyle = `rgba(${Math.round(60 + 140 * v)},${Math.round(80 + 120 * v)},255,${(0.3 + 0.7 * v).toFixed(2)})`;
        g.fillRect(spec.seed ? x + size / 2 - 3 : x + i * cell, spec.seed ? y + size / 2 - 3 : y + j * cell, spec.seed ? 6 : cell + 0.5, spec.seed ? 6 : cell + 0.5);
      }
      return;
    }
    const im = this.image(spec.expr);
    if (!im) return;
    const crop2 = [im.width * 0.267, im.height * 0.024, im.width * 0.47, im.width * 0.47];
    if (spec.cells) {
      const c = this.cell, n = Math.max(2, spec.cells);
      c.width = n;
      c.height = n;
      const cg = c.getContext("2d");
      cg.imageSmoothingEnabled = true;
      cg.clearRect(0, 0, n, n);
      cg.drawImage(im, ...crop2, 0, 0, n, n);
      if (spec.gray) {
        cg.globalCompositeOperation = "saturation";
        cg.fillStyle = "#888";
        cg.fillRect(0, 0, n, n);
        cg.globalCompositeOperation = "source-over";
      }
      g.imageSmoothingEnabled = false;
      g.drawImage(c, 0, 0, n, n, x, y, size, size);
    } else {
      g.imageSmoothingEnabled = true;
      g.drawImage(im, ...crop2, x, y, size, size);
    }
    if (spec.tint === "red") {
      g.globalCompositeOperation = "multiply";
      g.fillStyle = "rgb(255,80,70)";
      g.fillRect(x, y, size, size);
      g.globalCompositeOperation = "source-over";
    }
    if (spec.prop && PROPS[spec.prop]) {
      g.font = `${Math.round(size * 0.36)}px "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      g.fillText(PROPS[spec.prop], x + size * 0.58, y + size * 0.58);
    }
  }
  header(ctx, shot, t, gain, lay, r) {
    const al = shot.al;
    const col = al === "err" ? ERR : al === "anom" ? ANOM : UI;
    const lvl = (l) => col === UI ? l * gain : l;
    const mm = Math.floor(t / 60), ss = (t % 60).toFixed(1).padStart(4, "0");
    const clock = `${String(mm).padStart(2, "0")}:${ss} / 03:32`;
    const state = { err: "ERROR", anom: "WARN" }[al] ?? "RUNNING";
    if (lay === "fullbleed" || lay === "cinema" || lay === "raw") {
      ctx.font = fontOf(2, 11);
      ctx.fillStyle = mix(col, lvl(0.4));
      ctx.fillText(shot.ch, 16, 10);
      ctx.textAlign = "right";
      ctx.fillText(clock, W - 16, 10);
      ctx.textAlign = "left";
      return;
    }
    if (lay === "shell") {
      const age = (t - shot.s - 0.25) * 1.2;
      const txt = age > 0 ? decode(`me@deepsea:~$ ${shot.sh}`, age, r, 30, 0.1) : "me@deepsea:~$";
      ctx.font = fontOf(1, 18);
      ctx.fillStyle = mix(ME, 0.95);
      ctx.fillText(txt, 24, 12);
      ctx.font = fontOf(0, 14);
      ctx.fillStyle = mix(UI, 0.5 * gain);
      ctx.fillText(clock, W - 190, 14);
      return;
    }
    ctx.font = fontOf(2, 13);
    ctx.fillStyle = mix(col, lvl(0.95));
    ctx.fillText("WORLD.EXECUTE(ME);   whale@deepsea:~$", 24, 14);
    const x0 = 362, w = 600, y0 = 25;
    const e = clamp(this.energy(t) ?? 0, 0, 1);
    ctx.strokeStyle = mix(col, lvl(0.9));
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let px = 0; px < w; px += 2) {
      const tau = t - (w - px) / w * 4.2;
      const bt = beatT(Math.round((tau - FIRST_BEAT) / BEAT2));
      const dt = tau - bt;
      const v = (-11 * Math.exp(-((dt / 0.016) ** 2)) + 4 * Math.exp(-(((dt - 0.05) / 0.025) ** 2))) * (0.7 + 0.6 * e) + Math.sin(px * 0.9 + t * 30) * 1.2 * e;
      if (px === 0) ctx.moveTo(x0 + px, y0 + v);
      else ctx.lineTo(x0 + px, y0 + v);
    }
    ctx.stroke();
    ctx.fillStyle = mix(col, lvl(0.9));
    ctx.fillRect(x0 + w + 4, y0 - 2, 4, 4);
    const right = `${shot.ch}   ${clock}   ${state}`;
    ctx.fillStyle = mix(col, lvl(0.85));
    ctx.textAlign = "right";
    ctx.fillText(right, W - 24, 14);
    ctx.textAlign = "left";
    ctx.fillStyle = mix(col, lvl(0.35));
    ctx.fillRect(24, 38, W - 48, 1);
  }
  ticker(ctx, shot, t, gain) {
    const [x0, y0, x1, y1] = [1180, 56, 1256, 604];
    const color = shot.al === "err" ? ERR : UI;
    box(ctx, x0, y0, x1, y1, "ops", 0.45, color, gain);
    const ops = shot.ops?.length ? shot.ops : ["IDLE"];
    const rh = 17, scroll = t * (rh / (BEAT2 / 2)), cursorRow = 15;
    const base = Math.floor(scroll / rh), off = scroll % rh;
    ctx.font = fontOf(0, 12);
    for (let i = -1; i < 32; i++) {
      const y = y0 + 10 + i * rh - off;
      if (y < y0 + 4 || y > y1 - 16) continue;
      const op = ops[((base + i) % ops.length + ops.length) % ops.length].slice(0, 10);
      if (i === cursorRow) {
        ctx.fillStyle = shot.al === "err" ? mix(ERR, 0.95) : mix(UI, 0.95 * gain);
        ctx.fillRect(x0 + 4, y - 1, x1 - x0 - 8, 16);
        ctx.fillStyle = mix(BG, 1);
        ctx.fillText(op, x0 + 8, y);
      } else {
        ctx.fillStyle = mix(UI, Math.max(0.18, 0.6 - Math.abs(i - cursorRow) * 0.04) * gain);
        ctx.fillText(op, x0 + 8, y);
      }
    }
  }
  band_(ctx, t, gain, framed, r) {
    if (framed) box(ctx, 24, 616, 1256, 680, "stdout \xB7 tokens", 0.45 + 0.3 * pulse(t), UI, gain);
    const amb = (l) => mix(UI, l * gain);
    let x = 48;
    const y = 626;
    ctx.font = fontOf(2, 21);
    ctx.fillStyle = amb(0.6);
    ctx.fillText(">", x, y);
    x += 26;
    const cur = lineAt(this.lines, t);
    if (!cur) {
      if (Math.floor(t * 2) % 2 === 0) {
        ctx.fillStyle = amb(0.9);
        ctx.fillRect(x, y + 4, 12, 25);
      }
      return;
    }
    const [ln, alpha] = cur;
    const s = ln.text;
    const [nOut, when] = typed(ln, t);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    let pos = 0;
    tokenize(s).forEach((tok, k) => {
      const start = s.indexOf(tok, pos);
      if (start < 0 || start >= nOut) {
        if (start >= 0) pos = start + tok.length;
        return;
      }
      const gap = start > pos;
      pos = start + tok.length;
      if (gap) x += 8;
      if (x > 1230) return;
      const shown = tok.slice(0, nOut - start);
      let txt = "";
      for (let j = 0; j < shown.length; j++) txt += t - when[start + j] >= 0.08 || shown[j] === " " ? shown[j] : SCR[Math.floor(r() * SCR.length)];
      ctx.font = fontOf(2, 21);
      const tw = ctx.measureText(tok).width;
      const ws = s.lastIndexOf(" ", start - 1) + 1;
      let we = s.indexOf(" ", start);
      if (we < 0) we = s.length;
      const key = s.slice(ws, we).toLowerCase().replace(/[^a-z-]/g, "");
      if (KEYWORDS.has(key) && nOut >= we) {
        ctx.fillStyle = key.includes("exec") || key === "illegal" || key === "arguments" ? mix(ERR, 0.95) : key === "love" || key === "lo-o-ove" ? mix(ME, 0.95) : amb(0.95);
        ctx.fillRect(x - 3, y + 2, tw + 6, 29);
        ctx.fillStyle = mix(BG, 1);
        ctx.fillText(txt, x, y);
      } else {
        ctx.fillStyle = amb(k % 2 === 0 ? 0.13 : 0.22);
        ctx.fillRect(x - 3, y + 2, tw + 6, 29);
        ctx.fillStyle = amb(0.95);
        ctx.fillText(txt, x, y);
      }
      if (nOut >= pos) {
        const tid = String(tokenId(tok));
        ctx.font = fontOf(0, 11);
        ctx.fillStyle = amb(0.45);
        ctx.fillText(tid, x + (tw - ctx.measureText(tid).width) / 2, y + 33);
      }
      x += tw + 6;
    });
    ctx.restore();
    if (alpha >= 0.999 && (nOut < s.length || Math.floor(t * 3) % 2 === 0)) {
      ctx.fillStyle = amb(0.9);
      ctx.fillRect(Math.min(x + 2, 1240), y + 4, 12, 25);
    }
  }
  footer(ctx, t, gain) {
    const n = 60, k = Math.floor(n * clamp(t / this.duration, 0, 1));
    ctx.font = fontOf(0, 12);
    ctx.fillStyle = mix(UI, 0.4 * gain);
    ctx.fillText(`[${"|".repeat(k)}${":".repeat(n - k)}]`, 24, 690);
    ctx.font = fontOf(4, 11);
    ctx.fillStyle = mix(UI, 0.38 * gain);
    ctx.fillText("\u89D2\u8272 \u6E9F\u6708 \xA9 \u4E0A\u5584\u65E0\u5F62 / \u5973\u4EC6\u7248 ZipZipPipe / \u7ACB\u7ED8\xB7\u8868\u60C5 dsh-deep-whale, dsh-whale-galgame (CC BY-NC-SA 4.0)  \xB7  Music: Mili - world.execute(me);  \xB7  \u975E\u5B98\u65B9\u540C\u4EBA", 500, 689);
  }
  post(ctx, t, strength) {
    const prev = this.trail;
    if (prev && strength > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      if (this.lastT !== void 0 && t > this.lastT && t - this.lastT < 0.2) {
        ctx.globalAlpha = 0.1 * strength;
        ctx.drawImage(prev, 0, 0);
      }
      if ("filter" in ctx && this.bloom !== false) {
        ctx.filter = "blur(4px)";
        ctx.globalAlpha = 0.3 * strength;
        ctx.drawImage(this.buffer, 0, 0);
        ctx.filter = "none";
      }
      ctx.restore();
    }
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    this.lastT = t;
    if (prev) {
      const p = prev.getContext("2d");
      p.globalCompositeOperation = "copy";
      p.drawImage(this.buffer, 0, 0);
      p.globalCompositeOperation = "source-over";
    }
  }
};
function box(ctx, x0, y0, x1, y1, title, level, color, gain = 1) {
  const g = color === UI ? gain : 1;
  ctx.strokeStyle = mix(color, level * g);
  ctx.lineWidth = 1;
  ctx.strokeRect(x0 + 0.5, y0 + 0.5, x1 - x0, y1 - y0);
  ctx.strokeStyle = mix(color, Math.min(1, level + 0.4) * g);
  ctx.lineWidth = 2;
  const L = 7;
  for (const [px, py, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + sx * L, py);
    ctx.moveTo(px, py);
    ctx.lineTo(px, py + sy * L);
    ctx.stroke();
  }
  if (title) {
    ctx.font = fontOf(2, 13);
    const tw = ctx.measureText(` ${title} `).width;
    ctx.fillStyle = mix(BG, 1);
    ctx.fillRect(x0 + 12, y0 - 9, tw, 18);
    ctx.fillStyle = mix(color, Math.min(1, level + 0.35) * g);
    ctx.fillText(` ${title} `, x0 + 12, y0 - 10);
  }
}

// .dsh-plugin/client/remote-state.mjs
var CLIENT_VERSION = true ? "0.9.6" : "";
var STALE_HOST_MESSAGE = "MV \u63D2\u4EF6\u540E\u53F0\u7248\u672C\u4E0E\u754C\u9762\u4E0D\u4E00\u81F4\uFF0C\u8BF7\u5B8C\u5168\u9000\u51FA\u5E76\u91CD\u542F Harness\uFF08\u5305\u62EC\u6258\u76D8\u56FE\u6807\uFF09\u540E\u518D\u4F7F\u7528 MV \u653E\u6620\u5BA4\u3002";
function isMissingRemoteMethod(message) {
  const value = String(message ?? "");
  return /transport failure for [^:]+: HTTP 404\b/.test(value) || /Remote method \S+ is no longer mounted/.test(value);
}
function remoteErrorText(message, fallback = "") {
  if (isMissingRemoteMethod(message)) return STALE_HOST_MESSAGE;
  return String(message ?? "").trim() || fallback;
}
var text = (value) => typeof value === "string" ? value.trim() : "";
function unwrapRemote(response, fallback) {
  if (!response?.ok) throw new Error(remoteErrorText(text(response?.error?.message) || text(response?.error), fallback));
  const inner = response.value;
  if (inner && typeof inner === "object" && typeof inner.ok === "boolean") {
    if (!inner.ok) throw new Error(remoteErrorText(text(inner.error?.message) || text(inner.error), fallback));
    return inner.value;
  }
  return inner;
}
function versionNotice({ hostVersion, clientVersion = CLIENT_VERSION, loaded = true } = {}) {
  if (!loaded || !clientVersion) return "";
  if (typeof hostVersion !== "string" || !hostVersion) return `${STALE_HOST_MESSAGE}\uFF08\u754C\u9762 ${clientVersion}\uFF0C\u540E\u53F0\u672A\u62A5\u544A\u7248\u672C\uFF09`;
  if (hostVersion !== clientVersion) return `${STALE_HOST_MESSAGE}\uFF08\u754C\u9762 ${clientVersion}\uFF0C\u540E\u53F0 ${hostVersion}\uFF09`;
  return "";
}

// .dsh-plugin/shared/mv-pack.mjs
var MV_PACK_FORMAT = "dsh-mv-pack";
var MV_PACK_VERSION = 1;
var MV_PACK_MANIFEST = "mv.json";
var MV_PACK_SCHEMA_FILE = "mv.schema.json";
var MV_CANVAS_RENDERERS = Object.freeze(["generic", "world-execute-me", "dsh-pv", "script"]);
var MV_PACK_FILE_ROLES = Object.freeze(["audio", "lyrics", "spectrum", "scene", "timing", "asset"]);
var MV_RENDERERS_BUILTIN = Object.freeze(["generic", "dsh-pv", "script"]);
var MV_SCENE_OUTPUTS = Object.freeze(["text", "pixels", "webgl"]);
var MV_PIXEL_LIMITS = Object.freeze({ minWidth: 160, minHeight: 90, maxWidth: 1920, maxHeight: 1080, defaultSize: Object.freeze([1280, 720]) });
var MV_ASSET_EXTENSIONS = Object.freeze([".json", ".webp", ".png"]);
var MV_ASSET_NAME = /^[a-z0-9][a-z0-9-]{0,39}$/;
var DSHPV_FONT_LIMITS = Object.freeze({ fileBytes: 512 * 1024, maxTables: 64, maxNameRecords: 128, maxNameChars: 256 });
var DSHPV_FONT_ASSETS = Object.freeze({
  "font-head": Object.freeze({ path: "fonts/SpaceMono-Bold.ttf", licenseFile: "fonts/OFL_spacemono.txt", family: "DshMvPvSpaceMono", weight: "700", sourceFamily: "Space Mono", sourceStyle: "Bold" }),
  "font-banner": Object.freeze({ path: "fonts/Anton-Regular.ttf", licenseFile: "fonts/OFL_anton.txt", family: "DshMvPvAnton", weight: "400", sourceFamily: "Anton", sourceStyle: "Regular" })
});
var MV_LYRICS_EXTENSIONS = Object.freeze([".lrc", ".srt", ".vtt", ".json", ".txt", ".js", ".mjs"]);
var MV_PACK_LIMITS = Object.freeze({
  manifestBytes: 256 * 1024,
  textFileBytes: 8 * 1024 * 1024,
  sceneBytes: 256 * 1024,
  /** 0.9.2: webgl scenes may be larger (Three.js bundles etc.); the workshop limit is the source of truth. */
  webglSceneBytes: 2 * 1024 * 1024,
  audioBytes: 1024 * 1024 * 1024,
  readChunkBytes: 512 * 1024,
  maxCredits: 50,
  maxTextChars: 4e3,
  maxShortChars: 200,
  maxPathChars: 1024,
  maxDuration: 36e3,
  maxOffset: 30,
  maxAssets: 32,
  maxAssetParts: 16,
  assetBytes: 8 * 1024 * 1024,
  recentPacks: 50
  // library entries kept (0.8.2: was 8; the list view stays compact)
});
var isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
var basenameOf = (path) => String(path).split(/[\\/]/).filter(Boolean).pop() ?? "";
function isAbsolutePackPath(value) {
  return typeof value === "string" && (value.startsWith("/") || /^[A-Za-z]:[\\/]/.test(value) || /^\\\\[^\\]+\\[^\\]+/.test(value));
}
function checkDshPvFont(value, name = "font.ttf") {
  const bytes = value instanceof Uint8Array ? value : value instanceof ArrayBuffer ? new Uint8Array(value) : null;
  const errors = [];
  if (!bytes || bytes.byteLength < 12 || bytes.byteLength > DSHPV_FONT_LIMITS.fileBytes) return { errors: [`${name}\uFF1ATTF \u5B57\u4F53\u5927\u5C0F\u65E0\u6548\uFF0812 \u5B57\u8282\u2013512 KiB\uFF09`] };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tables = view.getUint16(4, false);
  if (view.getUint32(0, false) !== 65536 || tables < 1 || tables > DSHPV_FONT_LIMITS.maxTables || 12 + tables * 16 > bytes.byteLength) return { errors: [`${name}\uFF1A\u4E0D\u662F\u53D7\u652F\u6301\u7684 TrueType TTF \u5B57\u4F53\uFF08sfnt \u7B7E\u540D / \u8868\u76EE\u5F55\u65E0\u6548\uFF09`] };
  let nameTable = null;
  for (let i = 0; i < tables; i++) {
    const at = 12 + i * 16, offset = view.getUint32(at + 8, false), length = view.getUint32(at + 12, false);
    if (offset < 12 + tables * 16 || offset > bytes.byteLength || length > bytes.byteLength - offset) {
      errors.push(`${name}\uFF1ATTF \u7B2C ${i + 1} \u4E2A\u8868\u8D85\u51FA\u6587\u4EF6\u8303\u56F4`);
      break;
    }
    if (view.getUint32(at, false) === 1851878757) {
      if (nameTable) {
        errors.push(`${name}\uFF1ATTF \u6709\u91CD\u590D\u7684 name \u8868`);
        break;
      }
      nameTable = { offset, length };
    }
  }
  const descriptor2 = (Object.hasOwn(DSHPV_FONT_ASSETS, name) ? DSHPV_FONT_ASSETS[name] : void 0) ?? Object.values(DSHPV_FONT_ASSETS).find((font) => font.path === name || basenameOf(font.path) === name);
  if (!errors.length && descriptor2) errors.push(...checkDshPvFontName(view, nameTable, descriptor2, name));
  return { errors };
}
function checkDshPvFontName(view, table, descriptor2, name) {
  const invalid = (message) => [`${name}\uFF1ATTF name \u8868${message}`];
  if (!table || table.length < 6) return invalid("\u7F3A\u5931\u6216\u65E0\u6548\uFF0C\u4E0D\u80FD\u786E\u8BA4\u53D7\u652F\u6301\u7684 OFL \u5B57\u4F53\u8EAB\u4EFD");
  const { offset, length } = table, format = view.getUint16(offset), count = view.getUint16(offset + 2), strings = view.getUint16(offset + 4);
  if (format > 1 || count < 1 || count > DSHPV_FONT_LIMITS.maxNameRecords || 6 + count * 12 > length || strings < 6 + count * 12 || strings > length) return invalid("\u8BB0\u5F55\u6570\u91CF / \u5B57\u7B26\u4E32\u8303\u56F4\u65E0\u6548");
  const families = /* @__PURE__ */ new Set(), styles = /* @__PURE__ */ new Set();
  for (let i = 0; i < count; i++) {
    const at = offset + 6 + i * 12, platform = view.getUint16(at), id = view.getUint16(at + 6), size = view.getUint16(at + 8), start = view.getUint16(at + 10);
    if (size > DSHPV_FONT_LIMITS.maxNameChars * 2 || start > length - strings || size > length - strings - start) return invalid("\u5B57\u7B26\u4E32\u8D85\u51FA\u6587\u4EF6\u8303\u56F4\u6216\u8FC7\u957F");
    if (![0, 3].includes(platform) || ![1, 2, 16, 17].includes(id)) continue;
    if (size % 2) return invalid("Unicode \u5B57\u7B26\u4E32\u957F\u5EA6\u4E0D\u662F\u5076\u6570");
    let text4 = "";
    for (let pos = offset + strings + start; pos < offset + strings + start + size; pos += 2) text4 += String.fromCharCode(view.getUint16(pos));
    if (/[\u0000-\u001f\u007f]/.test(text4)) return invalid("\u5B57\u4F53\u540D\u79F0\u542B\u63A7\u5236\u5B57\u7B26");
    if (id === 1 || id === 16) families.add(text4.trim());
    else styles.add(text4.trim());
  }
  if (!families.size || !styles.size || [...families].some((family) => family !== descriptor2.sourceFamily) || [...styles].some((style) => style !== descriptor2.sourceStyle)) return invalid(`\u8EAB\u4EFD\u4E0D\u7B26\uFF08\u53EA\u652F\u6301 ${descriptor2.sourceFamily} ${descriptor2.sourceStyle}\uFF1B\u91CD\u547D\u540D Windows / \u5176\u4ED6\u5B57\u4F53\u4E0D\u80FD\u968F\u5305\u5206\u53D1\uFF09`);
  return [];
}
function parseManifestPath(value) {
  if (typeof value !== "string") throw new TypeError("MV \u5305\u8DEF\u5F84\u5FC5\u987B\u662F\u5B57\u7B26\u4E32");
  const path = value.trim().replace(/^"(.*)"$/, "$1");
  if (!path || path.length > MV_PACK_LIMITS.maxPathChars || /[\0\r\n"]/.test(path)) throw new TypeError("MV \u5305\u8DEF\u5F84\u65E0\u6548");
  if (!isAbsolutePackPath(path)) throw new TypeError("MV \u5305\u8DEF\u5F84\u5FC5\u987B\u662F\u7EDD\u5BF9\u8DEF\u5F84\uFF08mv.json \u6587\u4EF6\u6216\u5B83\u6240\u5728\u7684\u6587\u4EF6\u5939\uFF09");
  return path;
}
function parsePackLoad(value) {
  if (!isObject(value)) throw new TypeError("pack load request must be an object");
  const extra = Object.keys(value).filter((key) => key !== "path");
  if (extra.length) throw new TypeError(`pack load request has unexpected fields: ${extra.join(", ")}`);
  return { path: parseManifestPath(value.path) };
}
function parsePackRead(value) {
  if (!isObject(value)) throw new TypeError("pack read request must be an object");
  const extra = Object.keys(value).filter((key) => !["manifestPath", "role", "offset", "length", "asset", "part"].includes(key));
  if (extra.length) throw new TypeError(`pack read request has unexpected fields: ${extra.join(", ")}`);
  if (!MV_PACK_FILE_ROLES.includes(value.role)) throw new TypeError(`role must be ${MV_PACK_FILE_ROLES.join(" / ")}`);
  const offset = value.offset ?? 0;
  const length = value.length ?? MV_PACK_LIMITS.readChunkBytes;
  if (!Number.isInteger(offset) || offset < 0 || offset > MV_PACK_LIMITS.audioBytes) throw new TypeError("offset is invalid");
  if (!Number.isInteger(length) || length < 1 || length > MV_PACK_LIMITS.readChunkBytes) throw new TypeError(`length must be 1..${MV_PACK_LIMITS.readChunkBytes}`);
  const request2 = { manifestPath: parseManifestPath(value.manifestPath), role: value.role, offset, length };
  if (value.role === "asset") {
    if (typeof value.asset !== "string" || !MV_ASSET_NAME.test(value.asset)) throw new TypeError("asset must be a canvas.assets name");
    const part2 = value.part ?? 0;
    if (!Number.isInteger(part2) || part2 < 0 || part2 >= MV_PACK_LIMITS.maxAssetParts) throw new TypeError("part is invalid");
    return { ...request2, asset: value.asset, part: part2 };
  }
  if (value.asset !== void 0 || value.part !== void 0) throw new TypeError('asset / part are only for role "asset"');
  return request2;
}
function parseTemplateWrite(value) {
  if (!isObject(value)) throw new TypeError("template request must be an object");
  const extra = Object.keys(value).filter((key) => key !== "dir");
  if (extra.length) throw new TypeError(`template request has unexpected fields: ${extra.join(", ")}`);
  return { dir: parseManifestPath(value.dir) };
}

// .dsh-plugin/client/mv/dshpv/assets.mjs
var DSHPV_DATA = ["timeline", "chat", "band"];
var DSHPV_ART = ["maid-left", ...["cheerful", "starry", "shy", "serious", "confused", "frightened", "angry", "exasperated"].map((n) => `whale-${n}`)];
var CHUNK = 512 * 1024;
var fromBase64 = (b64) => {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};
var join = (parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
};
var hasDshPvAssets = (pack) => DSHPV_DATA.every((name) => pack?.pack?.canvas?.assets?.[name] !== void 0);
function packAssetReader(api, manifestPath, pack) {
  return async (name, { maxBytes = MV_PACK_LIMITS.assetBytes } = {}) => {
    const value = pack?.canvas?.assets?.[name];
    if (value === void 0) return null;
    if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > MV_PACK_LIMITS.assetBytes) throw new Error(`MV \u5305\u8D44\u6E90 ${name} \u7684\u8BFB\u53D6\u5927\u5C0F\u9650\u5236\u65E0\u6548\u3002`);
    const count = Array.isArray(value) ? value.length : 1;
    const files = [];
    for (let part2 = 0; part2 < count; part2++) {
      const parts = [];
      let offset = 0;
      for (; ; ) {
        const chunk = unwrapRemote(await api.packRead({ manifestPath, role: "asset", asset: name, part: part2, offset, length: CHUNK }), `\u65E0\u6CD5\u8BFB\u53D6 MV \u5305\u8D44\u6E90 ${name}\u3002`);
        if (!Number.isSafeInteger(chunk.bytes) || chunk.bytes < 0 || chunk.bytes > CHUNK || offset + chunk.bytes > maxBytes) throw new Error(`MV \u5305\u8D44\u6E90 ${name} \u8D85\u8FC7 ${Math.round(maxBytes / 1024)} KiB \u8BFB\u53D6\u9650\u5236\u3002`);
        if (chunk.bytes > 0) {
          if (typeof chunk.base64 !== "string" || chunk.base64.length > 4 * Math.ceil(chunk.bytes / 3)) throw new Error(`MV \u5305\u8D44\u6E90 ${name} \u7684\u8FD4\u56DE\u7F16\u7801\u957F\u5EA6\u65E0\u6548\u3002`);
          const bytes = fromBase64(chunk.base64);
          if (bytes.byteLength !== chunk.bytes) throw new Error(`MV \u5305\u8D44\u6E90 ${name} \u7684\u8FD4\u56DE\u5B57\u8282\u957F\u5EA6\u4E0D\u4E00\u81F4\u3002`);
          parts.push(bytes);
        }
        offset += chunk.bytes;
        if (chunk.done || !chunk.bytes) break;
      }
      files.push(join(parts));
    }
    return files;
  };
}
function mergeShards(shards) {
  const out = {};
  for (const shard of shards) {
    for (const [key, value] of Object.entries(shard ?? {})) {
      if (Array.isArray(value) && Array.isArray(out[key])) out[key] = out[key].concat(value);
      else if (!(key in out)) out[key] = value;
    }
  }
  return out;
}
async function toImage(bytes) {
  const blob = new Blob([bytes], { type: bytes[0] === 137 && bytes[1] === 80 ? "image/png" : "image/webp" });
  if (typeof createImageBitmap === "function") return createImageBitmap(blob);
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}
var asList = (value) => value == null ? null : Array.isArray(value) ? value : [value];
var disposedImages = /* @__PURE__ */ new WeakSet();
function disposeDshPvData(data) {
  for (const image of [...Object.values(data?.art ?? {}), ...data?.raster?.atlases ?? []]) {
    if (!image || typeof image !== "object" || disposedImages.has(image)) continue;
    disposedImages.add(image);
    try {
      image.close?.();
    } catch {
    }
  }
}
function parseRasterShards(files, dec) {
  if (!files.length || files.length > 16 || files.reduce((n, bytes) => n + bytes.byteLength, 0) > DSHPV_RASTER_LIMITS.jsonBytes) throw new Error("dsh-pv raster\uFF1A\u65F6\u95F4\u8F74\u6587\u4EF6\u6570\u91CF\u6216\u5927\u5C0F\u65E0\u6548");
  const shards = files.map((bytes) => JSON.parse(dec.decode(bytes)));
  for (const shard of shards) {
    if (!shard || typeof shard !== "object" || Array.isArray(shard) || Object.keys(shard).some((key) => !["version", "size", "frames"].includes(key))) throw new Error("dsh-pv raster\uFF1A\u65F6\u95F4\u8F74\u5206\u7247\u6709\u672A\u77E5\u5B57\u6BB5");
    if (shard.version !== void 0 && shard.version !== 1 || shard.size !== void 0 && (!Array.isArray(shard.size) || shard.size.length !== 2 || shard.size[0] !== 1280 || shard.size[1] !== 720) || shard.frames !== void 0 && !Array.isArray(shard.frames)) throw new Error("dsh-pv raster\uFF1A\u65F6\u95F4\u8F74\u5206\u7247\u65E0\u6548");
  }
  return validateRasterTimeline(mergeShards(shards));
}
async function loadDshPv(read, { decodeImage = toImage } = {}) {
  const dec = new TextDecoder();
  const [timeline, chat, band] = await Promise.all(DSHPV_DATA.map(async (name) => {
    const files = asList(await read(name));
    if (!files?.length) throw new Error(`\u7F3A\u5C11 dsh-pv \u8D44\u6E90 ${name}`);
    return mergeShards(files.map((bytes) => JSON.parse(dec.decode(bytes))));
  }));
  const data = { timeline, chat, band, art: {}, missingArt: [] };
  try {
    const descriptor2 = asList(await read("raster-timeline"));
    const raster = descriptor2 === null ? null : parseRasterShards(descriptor2, dec);
    let atlasFiles = null, dimensions = null;
    if (raster) {
      atlasFiles = asList(await read("raster-atlas"));
      if (!atlasFiles?.length || atlasFiles.length > DSHPV_RASTER_LIMITS.atlases) throw new Error("dsh-pv raster\uFF1A\u7F3A\u5C11\u56FE\u96C6\u6216\u56FE\u96C6\u6570\u91CF\u8FC7\u591A");
      dimensions = atlasFiles.map(rasterImageDimensions);
      validateRasterAtlases(raster, dimensions);
    }
    await Promise.all(DSHPV_ART.map(async (name) => {
      try {
        const files = asList(await read(name));
        if (files?.[0]) data.art[name] = await decodeImage(files[0]);
        else data.missingArt.push(name);
      } catch {
        data.missingArt.push(name);
      }
    }));
    if (raster) {
      data.raster = { ...raster, atlases: [] };
      for (let i = 0; i < atlasFiles.length; i++) {
        const image = await decodeImage(atlasFiles[i]);
        data.raster.atlases.push(image);
        if (image?.width !== dimensions[i].width || image?.height !== dimensions[i].height) throw new Error("dsh-pv raster\uFF1A\u89E3\u7801\u540E\u7684\u56FE\u96C6\u5C3A\u5BF8\u4E0D\u5339\u914D");
      }
      data.raster = validateRasterAtlases(raster, data.raster.atlases);
    }
    return data;
  } catch (error) {
    disposeDshPvData(data);
    throw error;
  }
}
async function loadSceneAssets(read, pack, { images = false } = {}) {
  const dec = new TextDecoder();
  const assets = {}, transfer = [];
  try {
    for (const [name, value] of Object.entries(pack?.canvas?.assets ?? {})) {
      const paths = asList(value) ?? [];
      const isJson = paths.every((p) => /\.json$/i.test(p));
      if (!isJson && !images) continue;
      const files = asList(await read(name)) ?? [];
      if (!files.length) continue;
      if (isJson) assets[name] = files.length === 1 ? JSON.parse(dec.decode(files[0])) : mergeShards(files.map((bytes) => JSON.parse(dec.decode(bytes))));
      else if (typeof createImageBitmap === "function") {
        const type = /\.png$/i.test(paths[0]) ? "image/png" : "image/webp";
        const bitmap = await createImageBitmap(new Blob([files[0]], { type }));
        assets[name] = bitmap;
        transfer.push(bitmap);
      }
    }
  } catch (error) {
    disposeSceneAssets({ transfer });
    throw error;
  }
  return { assets, transfer };
}
function disposeSceneAssets({ transfer = [] } = {}) {
  for (const bitmap of transfer) {
    try {
      bitmap?.close?.();
    } catch {
    }
  }
}

// .dsh-plugin/client/mv/dshpv/fonts.mjs
var DSHPV_FONT_FAMILIES = Object.freeze({ head: "DshMvPvSpaceMono", banner: "DshMvPvAnton" });
var documents = /* @__PURE__ */ new WeakMap();
var sameBytes = (a, b) => a.byteLength === b.byteLength && a.every((value, i) => value === b[i]);
var fail2 = (message) => {
  throw new Error(`dsh-pv fonts\uFF1A${message}`);
};
function release(entry2) {
  if (entry2.refs > 0) entry2.refs--;
  if (entry2.refs !== 0) return;
  if (entry2.cache.get(entry2.family) === entry2) entry2.cache.delete(entry2.family);
  if (entry2.registered) {
    entry2.registered = false;
    try {
      entry2.fontSet.delete(entry2.face);
    } catch {
    }
  }
}
async function acquire(bytes, descriptor2, fontSet, FontFaceClass) {
  let cache = documents.get(fontSet);
  if (!cache) {
    cache = /* @__PURE__ */ new Map();
    documents.set(fontSet, cache);
  }
  let entry2 = cache.get(descriptor2.family);
  if (entry2) {
    if (!sameBytes(entry2.bytes, bytes)) fail2(`${descriptor2.family} \u5DF2\u88AB\u53E6\u4E00\u4EFD\u4E0D\u540C\u5B57\u8282\u7684\u5B57\u4F53\u5360\u7528\uFF1B\u8BF7\u5173\u95ED\u539F\u5305\u540E\u518D\u52A0\u8F7D`);
    entry2.refs++;
  } else {
    const copy2 = new Uint8Array(bytes);
    const face = new FontFaceClass(descriptor2.family, copy2.buffer, { style: "normal", weight: descriptor2.weight, display: "block" });
    entry2 = { bytes: copy2, family: descriptor2.family, face, fontSet, cache, refs: 1, registered: false, promise: null };
    cache.set(descriptor2.family, entry2);
    entry2.promise = Promise.resolve().then(() => face.load()).then(() => {
      fontSet.add(face);
      entry2.registered = true;
      return entry2;
    }).catch((error) => {
      if (cache.get(entry2.family) === entry2) cache.delete(entry2.family);
      throw error;
    });
  }
  try {
    return await entry2.promise;
  } catch (error) {
    release(entry2);
    throw error;
  }
}
async function loadDshPvFonts(read, { FontFaceClass = globalThis.FontFace, fontSet = globalThis.document?.fonts } = {}) {
  if (typeof read !== "function") fail2("\u7F3A\u5C11\u5305\u5185\u5B57\u4F53\u8BFB\u53D6\u5668");
  const sources = await Promise.all(Object.entries(DSHPV_FONT_ASSETS).map(async ([name, descriptor2]) => {
    let files;
    try {
      files = await read(name, { maxBytes: DSHPV_FONT_LIMITS.fileBytes });
    } catch (error) {
      fail2(`${name} \u65E0\u6CD5\u8BFB\u53D6\uFF1A${error?.message ?? error}`);
    }
    if (files == null) return null;
    if (!Array.isArray(files) || files.length !== 1) fail2(`${name} \u5FC5\u987B\u662F\u5355\u4E2A TTF \u5B57\u4F53\u6587\u4EF6\uFF0C\u4E0D\u80FD\u4F7F\u7528\u5206\u7247`);
    const value = files[0];
    const bytes = value instanceof Uint8Array ? value : value instanceof ArrayBuffer ? new Uint8Array(value) : null;
    const checked = checkDshPvFont(bytes, name);
    if (checked.errors.length) fail2(checked.errors.join("\uFF1B"));
    return { name, descriptor: descriptor2, bytes };
  }));
  const declared = sources.filter(Boolean);
  const entries = [], families = {};
  if (declared.length && (typeof FontFaceClass !== "function" || !fontSet || typeof fontSet.add !== "function" || typeof fontSet.delete !== "function")) fail2("\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u80FD\u52A0\u8F7D\u968F\u5305 TTF \u5B57\u4F53\uFF08FontFace / document.fonts \u4E0D\u53EF\u7528\uFF09");
  try {
    for (const source of declared) {
      try {
        entries.push(await acquire(source.bytes, source.descriptor, fontSet, FontFaceClass));
      } catch (error) {
        fail2(`${source.name} \u52A0\u8F7D\u5931\u8D25\uFF1A${error?.message ?? error}`);
      }
      families[source.name === "font-head" ? "head" : "banner"] = source.descriptor.family;
    }
  } catch (error) {
    for (const entry2 of entries) release(entry2);
    throw error;
  }
  let disposed = false;
  return {
    families: Object.freeze(families),
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const entry2 of entries) release(entry2);
    }
  };
}

// .dsh-plugin/client/mv-calib.jsx
var import_react2 = __toESM(require("react"), 1);

// .dsh-plugin/client/mv-skin.mjs
var SKIN_KEY = "dsh-mv.skin.v1";
var SKIN_EVENT = "dsh-mv-skin-change";
var SKINS = Object.freeze([
  { id: "c", name: "Harness", title: "Harness \u539F\u751F", description: "\u4E0E DeepSeek Harness \u4E00\u81F4\u7684\u5361\u7247\u3001\u67D4\u548C\u9634\u5F71\u548C\u84DD\u8272\u5F3A\u8C03\u8272\u3002", defaultMode: "auto" },
  { id: "a", name: "\u97F3\u4E50", title: "\u73B0\u4EE3\u97F3\u4E50\u5E94\u7528", description: "\u5927\u5C01\u9762\u3001\u6E10\u53D8\u5C01\u9762\u56FE\u3001\u9192\u76EE\u7684\u6B63\u5728\u64AD\u653E\u533A\uFF0C\u64AD\u653E\u6761\u5438\u9644\u5728\u5E95\u90E8\u3002", defaultMode: "dark" },
  { id: "b", name: "\u7EC8\u7AEF", title: "\u7EC8\u7AEF / \u9ED1\u5BA2", description: "\u7B49\u5BBD\u5B57\u4F53\u3001\u9713\u8679\u7EFF\u914D\u7425\u73C0\u8272\u3001CRT \u626B\u63CF\u7EBF\uFF1B\u6D45\u8272\u4E3A\u300C\u7EB8\u8D28\u7EC8\u7AEF\u300D\u3002", defaultMode: "dark" }
]);
var DEFAULT_SKIN = "c";
var MODES = Object.freeze(["auto", "light", "dark"]);
var byId = (id) => SKINS.find((skin) => skin.id === id);
function normalizeSkin(value) {
  const skin = byId(value?.skin) ? value.skin : DEFAULT_SKIN;
  const modes = {};
  for (const s of SKINS) modes[s.id] = MODES.includes(value?.modes?.[s.id]) ? value.modes[s.id] : s.defaultMode;
  return { skin, modes };
}
function loadSkin(storage = globalThis.localStorage) {
  try {
    return normalizeSkin(JSON.parse(storage?.getItem(SKIN_KEY) ?? "null"));
  } catch {
    return normalizeSkin(null);
  }
}
function saveSkin(value, storage = globalThis.localStorage) {
  const clean3 = normalizeSkin(value);
  try {
    storage?.setItem(SKIN_KEY, JSON.stringify(clean3));
  } catch {
  }
  return clean3;
}
function resolveDark(mode, { hostDark = null, systemDark = false } = {}) {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return hostDark ?? systemDark;
}
function skinClasses(settings, env) {
  const { skin, modes } = normalizeSkin(settings);
  const mode = modes[skin];
  return `mv-skin-${skin} ${resolveDark(mode, env) ? "mv-dark" : "mv-light"}${mode === "auto" ? " mv-follow" : ""}`;
}
function coverHue(text4) {
  let h = 2166136261;
  for (const ch of String(text4 ?? "")) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return (h >>> 0) % 360;
}
function coverInitials(title) {
  const clean3 = String(title ?? "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  if (!clean3) return "\u266A";
  const words = clean3.split(" ");
  return /[\u3400-\u9fff]/.test(clean3[0]) ? clean3[0] : (words[0][0] + (words[1]?.[0] ?? "")).toUpperCase();
}
function fmtTime(t) {
  const s = Math.max(0, Math.floor(Number(t) || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
function asciiBar(t, duration, width2 = 24) {
  const p = duration > 0 ? Math.min(1, Math.max(0, t / duration)) : 0;
  const n = Math.round(p * width2);
  return `[${"\u2588".repeat(n)}${"\u2591".repeat(width2 - n)}]`;
}

// .dsh-plugin/client/mv-ui.jsx
var import_react = __toESM(require("react"), 1);
var svg = (children, size = 16) => /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, children);
var Icon = Object.freeze({
  play: () => /* @__PURE__ */ import_react.default.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, /* @__PURE__ */ import_react.default.createElement("path", { d: "M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z", fill: "currentColor" })),
  pause: () => /* @__PURE__ */ import_react.default.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, /* @__PURE__ */ import_react.default.createElement("rect", { x: "6", y: "5", width: "4.2", height: "14", rx: "1.2", fill: "currentColor" }), /* @__PURE__ */ import_react.default.createElement("rect", { x: "13.8", y: "5", width: "4.2", height: "14", rx: "1.2", fill: "currentColor" })),
  stop: () => /* @__PURE__ */ import_react.default.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, /* @__PURE__ */ import_react.default.createElement("rect", { x: "6", y: "6", width: "12", height: "12", rx: "2", fill: "currentColor" })),
  info: () => svg(/* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("circle", { cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M12 11v6M12 7.5v.01" }))),
  keyboard: () => svg(/* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("rect", { x: "2.5", y: "6", width: "19", height: "12", rx: "2" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" }))),
  fullscreen: () => svg(/* @__PURE__ */ import_react.default.createElement("path", { d: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" })),
  volume: () => svg(/* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M4 9v6h4l5 4V5L8 9H4z" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M16.5 8.5a5 5 0 0 1 0 7" }))),
  mute: () => svg(/* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M4 9v6h4l5 4V5L8 9H4z" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M17 9l4 6M21 9l-4 6" }))),
  plus: () => svg(/* @__PURE__ */ import_react.default.createElement("path", { d: "M12 5v14M5 12h14" })),
  chevron: () => svg(/* @__PURE__ */ import_react.default.createElement("path", { d: "M6 9l6 6 6-6" })),
  list: () => svg(/* @__PURE__ */ import_react.default.createElement("path", { d: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" })),
  grid: () => svg(/* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("rect", { x: "3.5", y: "3.5", width: "7", height: "7", rx: "1.5" }), /* @__PURE__ */ import_react.default.createElement("rect", { x: "13.5", y: "3.5", width: "7", height: "7", rx: "1.5" }), /* @__PURE__ */ import_react.default.createElement("rect", { x: "3.5", y: "13.5", width: "7", height: "7", rx: "1.5" }), /* @__PURE__ */ import_react.default.createElement("rect", { x: "13.5", y: "13.5", width: "7", height: "7", rx: "1.5" }))),
  folder: () => svg(/* @__PURE__ */ import_react.default.createElement("path", { d: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" })),
  close: () => svg(/* @__PURE__ */ import_react.default.createElement("path", { d: "M6 6l12 12M18 6L6 18" }), 14),
  shop: () => svg(/* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M4 9l1.5-4h13L20 9" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M4 9h16v2a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0z", transform: "translate(0 0)" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M5 12.5V19h14v-6.5" }))),
  spark: () => svg(/* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" })))
});
function Alert({ kind = "info", children, actions = null }) {
  const icon = { error: "!", warn: "!", ok: "\u2713", info: "i" }[kind] ?? "i";
  return /* @__PURE__ */ import_react.default.createElement("div", { className: `mv-alert mv-alert-${kind}`, role: kind === "error" ? "alert" : void 0 }, /* @__PURE__ */ import_react.default.createElement("span", { className: "mv-alert-icon", "aria-hidden": "true" }, icon), /* @__PURE__ */ import_react.default.createElement("div", { className: "mv-alert-body" }, children, actions && /* @__PURE__ */ import_react.default.createElement("div", { className: "mv-row" }, actions)));
}
function Popover({ label, icon, children, className = "mv-icon-button", title }) {
  const [open, setOpen] = import_react.default.useState(false);
  const box2 = import_react.default.useRef(null);
  import_react.default.useEffect(() => {
    if (!open) return void 0;
    const onDown = (event) => {
      if (!box2.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return /* @__PURE__ */ import_react.default.createElement("span", { className: "mv-pop-anchor", ref: box2 }, /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className, "aria-label": label, title: title ?? label, "aria-expanded": open, "aria-pressed": open, onClick: () => setOpen((value) => !value) }, icon), open && /* @__PURE__ */ import_react.default.createElement("div", { className: "mv-popover", role: "dialog", "aria-label": label }, typeof children === "function" ? children(() => setOpen(false)) : children));
}
function Segmented({ value, options, onChange, label, small = false }) {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: `mv-segmented${small ? " mv-segmented-small" : ""}`, role: "radiogroup", "aria-label": label }, options.map((option) => /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      key: option.value,
      type: "button",
      role: "radio",
      "aria-checked": value === option.value,
      disabled: option.disabled,
      title: option.title ?? "",
      onClick: () => onChange(option.value)
    },
    option.label
  )));
}
var KEY_HELP = Object.freeze([
  ["\u7A7A\u683C / Enter", "\u64AD\u653E / \u6682\u505C"],
  ["\u2190 / \u2192", "\u540E\u9000 / \u524D\u8FDB 5 \u79D2"],
  ["R", "\u4ECE\u5934\u64AD\u653E"],
  ["1 \u2013 5", "\u8DF3\u5230\u5404\u7AE0\u8282"],
  [", / .", "\u4E0A\u4E00\u53E5 / \u4E0B\u4E00\u53E5\u6B4C\u8BCD"],
  ["[ / ]", "\u5B57\u5E55\u504F\u79FB \xB10.1 \u79D2"],
  ["Alt+[ / Alt+]", "\u97F3\u9891\u540C\u6B65 \u2212/+ 0.1 \u79D2"],
  ["+ / \u2212", "\u97F3\u91CF"],
  ["M", "\u9759\u97F3"],
  ["F / \u53CC\u51FB", "\u5168\u5C4F"],
  ["H", "\u753B\u9762\u5185\u5E2E\u52A9"]
]);
function KeyHelp() {
  return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("h3", null, "\u952E\u76D8\u5FEB\u6377\u952E"), /* @__PURE__ */ import_react.default.createElement("p", null, "\u5148\u70B9\u4E00\u4E0B\u753B\u9762\uFF0C\u518D\u4F7F\u7528\uFF1A"), /* @__PURE__ */ import_react.default.createElement("div", { className: "mv-keys" }, KEY_HELP.map(([key, text4]) => /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, { key }, /* @__PURE__ */ import_react.default.createElement("kbd", null, key), /* @__PURE__ */ import_react.default.createElement("span", null, text4)))));
}

// .dsh-plugin/shared/mv-align.mjs
var LOW_CONFIDENCE = 0.5;
var CJK2 = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/;
var round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;
function tokenize2(text4) {
  const out = [];
  const norm = String(text4 ?? "").normalize("NFKC").toLowerCase().replace(/[’`]/g, "'");
  let word = "";
  const flush = () => {
    const w = word.replace(/^'+|'+$/g, "");
    if (w) out.push(w);
    word = "";
  };
  for (const ch of norm) {
    if (CJK2.test(ch)) {
      flush();
      out.push(ch);
    } else if (/[\p{L}\p{N}']/u.test(ch)) word += ch;
    else flush();
  }
  flush();
  return out;
}
var isCjkText = (text4) => {
  let cjk = 0, latin = 0;
  for (const ch of String(text4)) {
    if (CJK2.test(ch)) cjk++;
    else if (/[a-z]/i.test(ch)) latin++;
  }
  return cjk > latin;
};
function levenshtein(a, b) {
  if (a === b) return 0;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const keep = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = keep;
    }
  }
  return row[b.length];
}
function tokenSimilarity(a, b) {
  if (a === b) return 1;
  if (a.length < 3 || b.length < 3 || CJK2.test(a) || CJK2.test(b)) return 0;
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length) >= 0.7 ? 0.6 : 0;
}
function wordTokens(words) {
  const out = [];
  for (const word of words ?? []) {
    const tokens = tokenize2(word.w);
    if (!tokens.length) continue;
    const span = Math.max(0, word.e - word.s) / tokens.length;
    tokens.forEach((token, i) => out.push({ t: token, s: word.s + span * i, e: word.s + span * (i + 1), p: word.p ?? 0.5 }));
  }
  return out;
}
function alignText(line, sungCjk) {
  if (!line.alt) return line.text;
  return isCjkText(line.text) === sungCjk ? line.text : isCjkText(line.alt) === sungCjk ? line.alt : line.text;
}
function alignTokens(lyric, heard, { match = 2, similar = 1, mismatch = -1, gap = -0.6 } = {}) {
  const n = lyric.length, m = heard.length;
  const width2 = m + 1;
  const score = new Float32Array((n + 1) * width2);
  const move = new Uint8Array((n + 1) * width2);
  for (let i2 = 1; i2 <= n; i2++) {
    score[i2 * width2] = i2 * gap;
    move[i2 * width2] = 2;
  }
  for (let j2 = 1; j2 <= m; j2++) {
    score[j2] = j2 * gap;
    move[j2] = 3;
  }
  for (let i2 = 1; i2 <= n; i2++) {
    const a = lyric[i2 - 1];
    for (let j2 = 1; j2 <= m; j2++) {
      const sim = tokenSimilarity(a, heard[j2 - 1].t);
      const diag = score[(i2 - 1) * width2 + j2 - 1] + (sim === 1 ? match : sim > 0 ? similar : mismatch);
      const up = score[(i2 - 1) * width2 + j2] + gap;
      const left = score[i2 * width2 + j2 - 1] + gap;
      const at = i2 * width2 + j2;
      if (diag >= up && diag >= left) {
        score[at] = diag;
        move[at] = 1;
      } else if (up >= left) {
        score[at] = up;
        move[at] = 2;
      } else {
        score[at] = left;
        move[at] = 3;
      }
    }
  }
  const matchOf = new Int32Array(n).fill(-1), simOf = new Float32Array(n);
  let i = n, j = m;
  while (i > 0 || j > 0) {
    const dir = move[i * width2 + j];
    if (dir === 1) {
      const sim = tokenSimilarity(lyric[i - 1], heard[j - 1].t);
      if (sim > 0) {
        matchOf[i - 1] = j - 1;
        simOf[i - 1] = sim;
      }
      i--;
      j--;
    } else if (dir === 2) i--;
    else j--;
  }
  return { matchOf, simOf };
}
function alignLines(lines, words, { duration = 0 } = {}) {
  const heard = wordTokens(words);
  const sungCjk = heard.filter((token) => CJK2.test(token.t)).length > heard.length / 2;
  const lyric = [], owner = [];
  const units = lines.map((line, index) => {
    const tokens = tokenize2(alignText(line, sungCjk));
    for (const t of tokens) {
      lyric.push(t);
      owner.push(index);
    }
    return tokens.length;
  });
  const { matchOf, simOf } = alignTokens(lyric, heard);
  const out = lines.map((line) => ({ text: line.text, alt: line.alt ?? "", start: null, end: null, confidence: 0, source: "engine" }));
  const stats = lines.map(() => ({ first: -1, last: -1, firstIdx: -1, lastIdx: -1, sims: 0, probs: 0, count: 0 }));
  let k = 0;
  for (let index = 0; index < lines.length; index++) {
    const st = stats[index];
    for (let t = 0; t < units[index]; t++, k++) {
      const hit = matchOf[k];
      if (hit < 0) continue;
      if (st.first < 0) {
        st.first = hit;
        st.firstIdx = t;
      }
      st.last = hit;
      st.lastIdx = t;
      st.sims += simOf[k];
      st.probs += heard[hit].p;
      st.count++;
    }
  }
  const counts = /* @__PURE__ */ new Map();
  for (const token of heard) counts.set(token.t, (counts.get(token.t) ?? 0) + 1);
  const avgToken = heard.length > 1 ? Math.min(0.6, Math.max(0.12, (heard.at(-1).e - heard[0].s) / heard.length)) : 0.3;
  for (let index = 0; index < lines.length; index++) {
    const st = stats[index], tokens = units[index];
    if (!st.count || !tokens) continue;
    const start = heard[st.first].s - st.firstIdx * avgToken;
    const end = heard[st.last].e + (tokens - 1 - st.lastIdx) * avgToken;
    const coverage = st.sims / tokens;
    let confidence = coverage * 0.75 + st.probs / st.count * 0.25;
    if (st.count < 2 && tokens > 2) confidence *= 0.6;
    if (end - start > Math.max(12, tokens * 1.5)) confidence *= 0.5;
    if (tokens === 1 && (counts.get(heard[st.first].t) ?? 0) > 1) confidence = Math.min(confidence, 0.45);
    out[index].start = Math.max(0, start);
    out[index].end = Math.max(start + 0.2, end);
    out[index].confidence = Math.min(1, confidence);
  }
  fillGaps(out, { duration: duration || (heard.at(-1)?.e ?? 0) + 2 });
  for (const line of out) {
    line.start = round(line.start);
    line.end = round(line.end);
    line.confidence = round(line.confidence, 2);
  }
  return out;
}
function fillGaps(lines, { duration = 0 } = {}) {
  const n = lines.length;
  for (let i = 0; i < n; i++) {
    if (lines[i].start !== null && lines[i].start !== void 0) continue;
    let a = i - 1;
    while (a >= 0 && lines[a].start == null) a--;
    let b = i + 1;
    while (b < n && lines[b].start == null) b++;
    const from = a >= 0 ? lines[a].end ?? lines[a].start + 2 : 0;
    const to = b < n ? lines[b].start : Math.max(from + (b - a) * 2, duration || from + (b - a) * 2);
    const slots = b - a;
    for (let j = a + 1; j < b; j++) {
      const s = from + (to - from) * (j - a - 1) / Math.max(1, slots - 1 || 1);
      lines[j].start = s;
      lines[j].end = Math.min(to, s + Math.max(0.5, (to - from) / slots));
      lines[j].confidence = 0;
    }
    i = b - 1;
  }
  for (let i = 1; i < n; i++) {
    if (lines[i].start < lines[i - 1].start + 0.05) {
      lines[i].start = lines[i - 1].start + 0.05;
      lines[i].confidence = Math.min(lines[i].confidence, 0.3);
    }
  }
  for (let i = 0; i < n; i++) {
    const next = i + 1 < n ? lines[i + 1].start : duration || lines[i].end + 4;
    if (!(lines[i].end > lines[i].start)) lines[i].end = Math.min(next, lines[i].start + 3);
    lines[i].end = Math.min(lines[i].end, next);
  }
  return lines;
}
function linesFromWords(words, { maxTokens = 12, gap = 0.7 } = {}) {
  const lines = [];
  let current = [];
  const push = () => {
    if (!current.length) return;
    const text4 = current.map((w) => w.w).join("").replace(/\s+/g, " ").trim();
    const cjk = isCjkText(text4);
    lines.push({ start: round(current[0].s), end: round(current.at(-1).e), text: cjk ? text4.replace(/\s+/g, "") : text4, alt: "", confidence: round(current.reduce((n, w) => n + (w.p ?? 0.5), 0) / current.length * 0.8, 2), source: "transcript" });
    current = [];
  };
  for (const word of words ?? []) {
    const prev = current.at(-1);
    const count = current.reduce((n, w) => n + tokenize2(w.w).length, 0);
    if (prev && (word.s - prev.e > gap || count >= maxTokens || /[.!?。！？]$/.test(prev.w.trim()))) push();
    current.push(word);
  }
  push();
  return lines;
}
function linesFromText(text4, { name = "lyrics.lrc" } = {}) {
  const body = String(text4 ?? "");
  if (looksLikeLyricsJs(body) || /\.(?:m?js)$/i.test(name) || /\[\d{1,3}:\d{1,2}([.:]\d{1,3})?\]/.test(body) || /-->/.test(body) || /^\s*\[\s*\{/.test(body)) {
    const ext = looksLikeLyricsJs(body) ? "x.js" : /-->/.test(body) ? "x.srt" : /^\s*\[\s*\{/.test(body) ? "x.json" : name;
    const cues = parseLyrics(ext, body);
    if (cues.length) return { timed: true, lines: cues.map((cue) => ({ start: cue.time, end: cue.end, text: cue.en || cue.zh, alt: cue.en && cue.zh ? cue.zh : "", confidence: 0.6, source: "lyrics" })) };
  }
  const lines = body.split(/\r?\n/).map((line) => line.replace(/\[[a-z]+:[^\]]*\]/gi, "").trim()).filter((line) => line && !/^(作词|作曲|编曲|词|曲)\s*[:：]/.test(line));
  return { timed: false, lines: lines.map((line) => {
    const [text5, alt = ""] = line.split(/\s+\/\s+/);
    return { start: null, end: null, text: text5.trim(), alt: alt.trim(), confidence: 0, source: "lyrics" };
  }) };
}
var median = (values) => {
  const s = [...values].sort((a, b) => a - b);
  return s.length ? s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2 : 0;
};
function mergeTimed(timed, aligned) {
  const diffs = [];
  timed.forEach((line, i) => {
    const a = aligned[i];
    if (a && a.confidence >= 0.7 && Number.isFinite(line.start)) diffs.push(a.start - line.start);
  });
  const offset = diffs.length >= 3 ? median(diffs) : 0;
  const lines = timed.map((line, i) => {
    const a = aligned[i];
    const shifted = line.start + offset;
    const gap = a ? Math.abs(a.start - shifted) : Infinity;
    if (gap <= 0.6) return { ...line, start: round((a.start + shifted) / 2), end: round(Math.max(a.end, line.end + offset)), confidence: round(Math.max(0.9, a.confidence), 2), source: `${line.source}+engine` };
    if (gap <= 2.5 && a.confidence >= 0.75) return { ...line, start: a.start, end: a.end, confidence: round(a.confidence * 0.8, 2), source: "engine" };
    return { ...line, start: round(shifted), end: round(line.end + offset), confidence: diffs.length >= 3 ? 0.45 : line.confidence, source: line.source };
  });
  return { offset: round(offset), lines: fillGaps(lines, {}) };
}
var stamp = (t) => {
  const v = Math.max(0, t);
  const m = Math.floor(v / 60), s = v - m * 60;
  return `[${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}]`;
};
function linesToLrc(lines, { title = "", artist = "", gap = 1.5 } = {}) {
  const out = [];
  if (title) out.push(`[ti:${title}]`);
  if (artist) out.push(`[ar:${artist}]`);
  out.push("[by:dsh-mv]");
  lines.forEach((line, i) => {
    out.push(`${stamp(line.start)}${line.text}`);
    if (line.alt) out.push(`${stamp(line.start)}${line.alt}`);
    const next = lines[i + 1];
    if (Number.isFinite(line.end) && (!next || next.start - line.end > gap)) out.push(stamp(line.end));
  });
  return `${out.join("\n")}
`;
}

// .dsh-plugin/client/mv-calib-state.mjs
var NUDGE = Object.freeze({ small: 0.05, large: 0.5 });
var MIN_LINE = 0.2;
var HISTORY = 200;
var r32 = (v) => Math.round(v * 1e3) / 1e3;
var clean = (line) => ({ start: r32(line.start), end: r32(line.end ?? line.start + 2), text: String(line.text ?? ""), alt: String(line.alt ?? ""), confidence: line.confidence ?? 1, source: line.source ?? "import" });
function createCalib(lines = [], { duration = 0, offset = 0 } = {}) {
  const sorted = lines.map(clean).sort((a, b) => a.start - b.start);
  return { lines: sorted, duration, offset, selected: sorted.length ? 0 : -1, past: [], future: [], dirty: false };
}
var touch = (line) => ({ ...line, confidence: 1, source: "user" });
var clampTime = (state, t) => Math.max(0, state.duration ? Math.min(state.duration, t) : t);
function commit(state, lines, extra = {}) {
  const past = [...state.past, { lines: state.lines, offset: state.offset, selected: state.selected }].slice(-HISTORY);
  return { ...state, ...extra, lines, past, future: [], dirty: true };
}
function setStart(state, lines, i, t) {
  const prev = lines[i - 1], next = lines[i + 1];
  const lo = prev ? prev.start + MIN_LINE : 0;
  const hi = next ? next.start - MIN_LINE : state.duration || Infinity;
  const start = r32(Math.min(Math.max(clampTime(state, t), lo), hi));
  const line = touch({ ...lines[i], start, end: Math.max(lines[i].end, start + MIN_LINE) });
  const out = lines.slice();
  out[i] = line;
  if (prev && prev.end > start) out[i - 1] = { ...prev, end: start };
  return out;
}
function setEnd(state, lines, i, t) {
  const next = lines[i + 1];
  const hi = next ? next.start : state.duration || Infinity;
  const end = r32(Math.min(Math.max(clampTime(state, t), lines[i].start + MIN_LINE), hi));
  const out = lines.slice();
  out[i] = touch({ ...lines[i], end });
  return out;
}
function splitText(text4, ratio = 0.5) {
  const words = text4.split(/(\s+)/);
  if (words.filter((w) => w.trim()).length >= 2) {
    const target = text4.length * ratio;
    let best = 0, bestDiff = Infinity, pos = 0;
    for (const part2 of words) {
      pos += part2.length;
      if (/^\s+$/.test(part2)) {
        const d = Math.abs(pos - target);
        if (d < bestDiff) {
          bestDiff = d;
          best = pos;
        }
      }
    }
    return [text4.slice(0, best).trim(), text4.slice(best).trim()];
  }
  const chars = [...text4];
  const cut = Math.max(1, Math.round(chars.length * ratio));
  return [chars.slice(0, cut).join(""), chars.slice(cut).join("")];
}
function calibReduce(state, action) {
  const { lines } = state;
  const i = action.index ?? state.selected;
  const valid = i >= 0 && i < lines.length;
  switch (action.type) {
    case "select":
      return valid ? { ...state, selected: i } : state;
    case "setStart":
      return valid ? commit(state, setStart(state, lines, i, action.time), { selected: i }) : state;
    case "setEnd":
      return valid ? commit(state, setEnd(state, lines, i, action.time), { selected: i }) : state;
    case "move": {
      if (!valid) return state;
      const len = lines[i].end - lines[i].start;
      const moved = setStart(state, lines, i, action.time);
      return commit(state, setEnd(state, moved, i, moved[i].start + len), { selected: i });
    }
    case "nudge": {
      if (!valid) return state;
      const delta = action.delta ?? NUDGE.small;
      const edge = action.edge ?? "start";
      const next = edge === "end" ? setEnd(state, lines, i, lines[i].end + delta) : setStart(state, lines, i, lines[i].start + delta);
      return commit(state, next, { selected: i });
    }
    case "tap": {
      if (!valid) return state;
      const next = setStart(state, lines, i, action.time - state.offset);
      return commit(state, next, { selected: Math.min(lines.length - 1, i + 1) });
    }
    case "offset":
      return commit(state, lines, { offset: r32(Math.max(-30, Math.min(30, action.value))) });
    case "text": {
      if (!valid) return state;
      const out = lines.slice();
      out[i] = touch({ ...lines[i], text: String(action.text ?? "").trim(), alt: action.alt === void 0 ? lines[i].alt : String(action.alt).trim() });
      return commit(state, out);
    }
    case "split": {
      if (!valid) return state;
      const line = lines[i];
      const [a, b] = splitText(line.text, action.ratio ?? 0.5);
      if (!b) return state;
      const [altA, altB] = line.alt ? splitText(line.alt, action.ratio ?? 0.5) : ["", ""];
      const at = r32(action.time !== void 0 && action.time > line.start + MIN_LINE && action.time < line.end - MIN_LINE ? action.time : line.start + (line.end - line.start) * (action.ratio ?? 0.5));
      const out = [...lines.slice(0, i), touch({ ...line, text: a, alt: altA, end: at }), touch({ ...line, text: b, alt: altB, start: at }), ...lines.slice(i + 1)];
      return commit(state, out, { selected: i });
    }
    case "merge": {
      if (!valid || i + 1 >= lines.length) return state;
      const a = lines[i], b = lines[i + 1];
      const join2 = (x, y) => (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]$/u.test(x) ? `${x}${y}` : `${x} ${y}`).trim();
      const merged = touch({ ...a, end: b.end, text: join2(a.text, b.text), alt: join2(a.alt, b.alt), confidence: 1 });
      return commit(state, [...lines.slice(0, i), merged, ...lines.slice(i + 2)], { selected: i });
    }
    case "delete": {
      if (!valid) return state;
      const out = lines.filter((_, k) => k !== i);
      return commit(state, out, { selected: Math.min(i, out.length - 1) });
    }
    case "insert": {
      const t = clampTime(state, action.time ?? 0);
      const line = touch({ start: r32(t), end: r32(t + 2), text: action.text ?? "\u266A", alt: "", confidence: 1 });
      const out = [...lines, line].sort((a, b) => a.start - b.start);
      const k = out.indexOf(line);
      if (out[k + 1] && line.end > out[k + 1].start) line.end = out[k + 1].start;
      if (out[k - 1] && out[k - 1].end > line.start) out[k - 1] = { ...out[k - 1], end: line.start };
      return commit(state, out, { selected: k });
    }
    case "confirm": {
      if (!valid) return state;
      const out = lines.slice();
      out[i] = touch(lines[i]);
      return commit(state, out);
    }
    case "undo": {
      const last = state.past.at(-1);
      if (!last) return state;
      return { ...state, ...last, past: state.past.slice(0, -1), future: [{ lines: state.lines, offset: state.offset, selected: state.selected }, ...state.future], dirty: true };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return { ...state, ...next, future: state.future.slice(1), past: [...state.past, { lines: state.lines, offset: state.offset, selected: state.selected }], dirty: true };
    }
    case "saved":
      return { ...state, dirty: false };
    default:
      return state;
  }
}
var isUncertain = (line) => (line.confidence ?? 1) < LOW_CONFIDENCE;
function nextUncertain(state, from = state.selected) {
  const n = state.lines.length;
  for (let k = 1; k <= n; k++) {
    const j = (from + k + n) % n;
    if (isUncertain(state.lines[j])) return j;
  }
  return -1;
}
var uncertainCount = (state) => state.lines.filter(isUncertain).length;
function lineAt2(state, t) {
  const x = t - state.offset;
  let lo = 0, hi = state.lines.length - 1, found = -1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (state.lines[mid].start <= x) {
      found = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return found;
}
function exportLines(state) {
  return state.lines.map((line) => ({ ...line, start: r32(Math.max(0, line.start + state.offset)), end: r32(Math.max(0, line.end + state.offset)) }));
}
function linesToCues(lines) {
  return lines.map((line) => ({ time: line.start, end: line.end, en: line.text, zh: line.alt ?? "" }));
}

// .dsh-plugin/client/mv-wav.mjs
var WAV_RATE = 44100;
var WAV_CHUNK = 384 * 1024;
function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768));
  return btoa(binary);
}
async function sha256Hex2(buffer, subtle = globalThis.crypto?.subtle) {
  const digest = new Uint8Array(await subtle.digest("SHA-256", buffer));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function decodeToChannels(buffer, { OfflineContext = globalThis.OfflineAudioContext } = {}) {
  if (typeof OfflineContext !== "function") throw new Error("\u6B64\u9762\u677F\u4E0D\u652F\u6301 WebAudio \u89E3\u7801\u3002");
  const context = new OfflineContext(2, 1, WAV_RATE);
  let audio;
  try {
    audio = await context.decodeAudioData(buffer.slice(0));
  } catch (error) {
    throw new Error(`\u9762\u677F\u65E0\u6CD5\u89E3\u7801\u8FD9\u4E2A\u6587\u4EF6\uFF1A${error?.message || error}`);
  }
  const channels = [audio.getChannelData(0)];
  channels.push(audio.numberOfChannels > 1 ? audio.getChannelData(1) : audio.getChannelData(0));
  return { channels, sampleRate: audio.sampleRate, duration: audio.duration };
}
var fromBase642 = (text4) => {
  const binary = globalThis.atob(text4);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};
async function readHostAudio(api, path, { onProgress = () => {
}, decode: decode2 = fromBase642 } = {}) {
  let offset = 0, size = 0, buffer = null;
  for (; ; ) {
    const chunk = unwrapRemote(await api.audioRead({ path, offset, length: 512 * 1024 }), "\u65E0\u6CD5\u8BFB\u53D6\u97F3\u9891\u6587\u4EF6\u3002");
    size = chunk.size;
    buffer ?? (buffer = new Uint8Array(size));
    if (chunk.bytes > 0) buffer.set(decode2(chunk.base64), offset);
    offset += chunk.bytes;
    onProgress({ stage: "read", ratio: size ? offset / size : 1 });
    if (chunk.done || chunk.bytes === 0) break;
  }
  return buffer ? buffer.buffer.slice(0, offset) : new ArrayBuffer(0);
}

// .dsh-plugin/shared/mv-audio-protocol.mjs
var WAV_LIMITS = Object.freeze({ chunkBytes: 512 * 1024, keepFiles: 8 });
var AUDIO_LIMITS = Object.freeze({ sniffBytes: 4096, maxSourceBytes: 1024 * 1024 * 1024, readChunkBytes: 512 * 1024 });
var ascii = (b, from, to) => {
  let out = "";
  for (let i = from; i < Math.min(to, b.length); i += 1) out += String.fromCharCode(b[i]);
  return out;
};
var indexOfAscii = (b, text4, from = 0, to = b.length) => {
  outer: for (let i = from; i <= Math.min(to, b.length) - text4.length; i += 1) {
    for (let j = 0; j < text4.length; j += 1) if (b[i + j] !== text4.charCodeAt(j)) continue outer;
    return i;
  }
  return -1;
};
var WAV_CODECS = { 1: "PCM", 3: "IEEE float", 6: "A-law", 7: "\u03BC-law", 17: "IMA ADPCM", 85: "MP3", 65534: "extensible" };
function sniffWav(b) {
  let at = 12, codec = null, bits = null, channels = null, rate = null;
  while (at + 8 <= b.length) {
    const id = ascii(b, at, at + 4);
    const size = b[at + 4] | b[at + 5] << 8 | b[at + 6] << 16 | b[at + 7] << 24;
    if (id === "fmt " && at + 24 <= b.length) {
      codec = b[at + 8] | b[at + 9] << 8;
      channels = b[at + 10] | b[at + 11] << 8;
      rate = (b[at + 12] | b[at + 13] << 8 | b[at + 14] << 16 | b[at + 15] << 24) >>> 0;
      bits = b[at + 22] | b[at + 23] << 8;
      if (codec === 65534 && at + 34 <= b.length) codec = (b[at + 32] | b[at + 33] << 8) === 3 ? 3 : 1;
      break;
    }
    if (size < 0) break;
    at += 8 + size + (size & 1);
  }
  const pcm = codec === 1 && (bits === 8 || bits === 16 || bits === 24) && channels >= 1 && channels <= 2;
  const name = codec === null ? "" : `\uFF08${WAV_CODECS[codec] ?? `\u7F16\u7801 ${codec}`}${bits ? ` ${bits} bit` : ""}\uFF09`;
  return { format: "wav", label: `WAV${name}`, codec, bits, channels, rate, pcm, chromium: codec === null || codec === 1 || codec === 3 || codec === 6 || codec === 7 };
}
function sniffAudio(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const result = (info) => ({ kind: "audio", chromium: true, ...info });
  if (b.length >= 12 && ascii(b, 4, 8) === "ftyp") {
    const brand = ascii(b, 8, 12);
    const head = ascii(b, 8, Math.min(b.length, 64));
    const dash = /dash|iso5|iso6|msdh|msix/.test(head);
    const quicktime = brand === "qt  ";
    const audioBrand = /^(M4A |M4B |M4P |F4A |F4B )$/.test(brand);
    const video = !audioBrand && (quicktime || indexOfAscii(b, "vide", 0, Math.min(b.length, AUDIO_LIMITS.sniffBytes)) >= 0);
    const label = quicktime ? "MOV\uFF08QuickTime\uFF09" : audioBrand ? "M4A\uFF08AAC\uFF09" : dash ? "MP4/AAC\uFF08DASH \u5206\u7247\uFF09" : video ? "MP4 \u89C6\u9891\uFF08\u7528\u5176\u4E2D\u7684\u97F3\u8F68\uFF09" : "MP4/AAC";
    return result({ format: "mp4", brand, fragmented: dash, label, kind: video ? "video" : "audio" });
  }
  if (b.length >= 8 && ["moov", "moof", "styp", "sidx"].includes(ascii(b, 4, 8))) return result({ format: "mp4", brand: "", fragmented: true, label: "MP4/AAC\uFF08\u65E0 ftyp \u5206\u7247\uFF09" });
  if (b.length >= 12 && ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WAVE") {
    const wav = sniffWav(b);
    return result(wav);
  }
  if (b.length >= 12 && (ascii(b, 0, 4) === "RF64" || ascii(b, 0, 4) === "BW64") && ascii(b, 8, 12) === "WAVE") return result({ format: "wav", label: "WAV\uFF08RF64 \u5927\u6587\u4EF6\uFF09", chromium: false });
  if (b.length >= 4 && b[0] === 26 && b[1] === 69 && b[2] === 223 && b[3] === 163) {
    const webm = indexOfAscii(b, "webm", 0, 64) >= 0;
    const video = indexOfAscii(b, "V_", 0, b.length) >= 0;
    return result({ format: webm ? "webm" : "mkv", label: `${webm ? "WebM" : "Matroska\uFF08MKV/MKA\uFF09"}${video ? " \u89C6\u9891\uFF08\u7528\u5176\u4E2D\u7684\u97F3\u8F68\uFF09" : ""}`, kind: video ? "video" : "audio" });
  }
  if (b.length >= 4 && ascii(b, 0, 4) === "OggS") {
    const head = ascii(b, 0, Math.min(b.length, 128));
    const codec = /OpusHead/.test(head) ? "Opus" : /\x01vorbis/.test(head) ? "Vorbis" : /\x7fFLAC/.test(head) ? "FLAC" : /theora/.test(head) ? "Theora" : "";
    return result({ format: "ogg", label: codec ? `Ogg ${codec}` : "Ogg", codec, kind: codec === "Theora" ? "video" : "audio" });
  }
  if (b.length >= 4 && ascii(b, 0, 4) === "fLaC") return result({ format: "flac", label: "FLAC" });
  if (b.length >= 3 && ascii(b, 0, 3) === "ID3") {
    const size = (b[6] & 127) << 21 | (b[7] & 127) << 14 | (b[8] & 127) << 7 | b[9] & 127;
    const next = 10 + size + (b[5] & 16 ? 10 : 0);
    if (next + 2 <= b.length && b[next] === 255 && (b[next + 1] & 246) === 240) return result({ format: "aac", label: "AAC\uFF08ADTS\uFF0C\u5E26 ID3\uFF09" });
    if (next + 4 <= b.length && ascii(b, next, next + 4) === "fLaC") return result({ format: "flac", label: "FLAC\uFF08\u5E26 ID3\uFF09" });
    return result({ format: "mp3", label: "MP3" });
  }
  if (b.length >= 2 && b[0] === 255 && (b[1] & 224) === 224) {
    if ((b[1] & 6) === 0) return result({ format: "aac", label: "AAC\uFF08ADTS\uFF09" });
    const layer = (b[1] & 6) === 2 ? "MP3" : (b[1] & 6) === 4 ? "MP2" : "MP1";
    return result({ format: layer === "MP3" ? "mp3" : "mp2", label: layer });
  }
  if (b.length >= 12 && ascii(b, 0, 4) === "FORM" && /^AIF[FC]$/.test(ascii(b, 8, 12))) return result({ format: "aiff", label: "AIFF", chromium: false });
  if (b.length >= 16 && b[0] === 48 && b[1] === 38 && b[2] === 178 && b[3] === 117 && b[4] === 142 && b[5] === 102 && b[6] === 207 && b[7] === 17) return result({ format: "asf", label: "WMA / WMV\uFF08ASF\uFF09", chromium: false });
  if (b.length >= 4 && ascii(b, 0, 4) === "caff") return result({ format: "caf", label: "CAF\uFF08Apple Core Audio\uFF09", chromium: false });
  if (b.length >= 5 && ascii(b, 0, 5) === "#!AMR") return result({ format: "amr", label: "AMR", chromium: false });
  if (b.length >= 2 && b[0] === 11 && b[1] === 119) return result({ format: "ac3", label: "AC-3", chromium: false });
  if (b.length >= 4 && ascii(b, 0, 4) === "MAC ") return result({ format: "ape", label: "Monkey's Audio\uFF08APE\uFF09", chromium: false });
  if (b.length >= 4 && ascii(b, 0, 4) === "wvpk") return result({ format: "wavpack", label: "WavPack", chromium: false });
  if (b.length >= 4 && ascii(b, 0, 4) === ".snd") return result({ format: "au", label: "Sun AU", chromium: false });
  if (b.length >= 188 * 2 && b[0] === 71 && b[188] === 71) return result({ format: "mpegts", label: "MPEG-TS\uFF08\u7528\u5176\u4E2D\u7684\u97F3\u8F68\uFF09", kind: "video", chromium: false });
  if (b.length >= 4 && b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 186) return result({ format: "mpeg", label: "MPEG-PS \u89C6\u9891", kind: "video", chromium: false });
  if (b.length >= 3 && ascii(b, 0, 3) === "FLV") return result({ format: "flv", label: "FLV \u89C6\u9891", kind: "video", chromium: false });
  return { format: "unknown", label: "\u672A\u77E5\u683C\u5F0F", kind: "unknown", chromium: false };
}
function audioMimeOf(sniff) {
  switch (sniff?.format) {
    case "mp3":
    case "mp2":
      return "audio/mpeg";
    case "aac":
      return "audio/aac";
    case "mp4":
      return sniff.kind === "video" ? "video/mp4" : "audio/mp4";
    case "webm":
      return sniff.kind === "video" ? "video/webm" : "audio/webm";
    case "mkv":
      return sniff.kind === "video" ? "video/x-matroska" : "audio/x-matroska";
    case "ogg":
      return "audio/ogg";
    case "flac":
      return "audio/flac";
    case "wav":
      return "audio/wav";
    default:
      return "application/octet-stream";
  }
}
function audioExtensionOf(sniff) {
  const map = { mp3: ".mp3", mp2: ".mp2", aac: ".aac", webm: ".webm", mkv: ".mka", ogg: ".ogg", flac: ".flac", wav: ".wav", aiff: ".aiff", asf: ".wma", caf: ".caf", amr: ".amr", ac3: ".ac3", ape: ".ape", wavpack: ".wv", au: ".au" };
  if (sniff?.format === "mp4") return sniff.kind === "video" ? ".mp4" : ".m4a";
  return map[sniff?.format] ?? ".bin";
}
function plain(value, subject) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${subject} must be an object`);
  return value;
}
function onlyKeys(value, keys2, subject) {
  const extra = Object.keys(value).filter((key) => !keys2.includes(key));
  if (extra.length) throw new TypeError(`${subject} has unexpected fields: ${extra.join(", ")}`);
}
function parseAbsolutePath(value, subject = "path") {
  const path = typeof value === "string" ? value.trim().replace(/^"(.*)"$/, "$1") : "";
  if (!path || path.length > 1024 || /[\0\r\n"]/.test(path) || !(path.startsWith("/") || /^[A-Za-z]:[\\/]/.test(path) || /^\\\\[^\\]+\\[^\\]+/.test(path))) throw new TypeError(`${subject} must be an absolute path`);
  return path;
}
function parseBase64Chunk(value, max = WAV_LIMITS.chunkBytes) {
  if (typeof value !== "string" || value.length === 0 || value.length > Math.ceil(max / 3) * 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) throw new TypeError("base64 chunk is invalid");
  return value;
}
function parseAudioRead(value) {
  plain(value, "audio read");
  onlyKeys(value, ["path", "offset", "length"], "audio read");
  const offset = value.offset ?? 0, length = value.length ?? AUDIO_LIMITS.readChunkBytes;
  if (!Number.isInteger(offset) || offset < 0 || offset > AUDIO_LIMITS.maxSourceBytes) throw new TypeError("offset is invalid");
  if (!Number.isInteger(length) || length < 1 || length > AUDIO_LIMITS.readChunkBytes) throw new TypeError(`length must be 1..${AUDIO_LIMITS.readChunkBytes}`);
  return { path: parseAbsolutePath(value.path), offset, length };
}
function parseAudioConvert(value) {
  plain(value, "convert request");
  onlyKeys(value, ["path", "confirmed"], "convert request");
  if (value.confirmed !== true) throw new TypeError("ffmpeg conversion needs confirmed: true");
  return { path: parseAbsolutePath(value.path), confirmed: true };
}
function parseFfmpegInfo(value) {
  if (value === void 0 || value === null) return {};
  plain(value, "ffmpeg info");
  onlyKeys(value, [], "ffmpeg info");
  return {};
}
function ffmpegArgs(source, target) {
  return ["-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i", source, "-map", "0:a:0", "-vn", "-sn", "-dn", "-map_metadata", "-1", "-ac", "2", "-ar", "44100", "-c:a", "pcm_s16le", "-bitexact", "-f", "wav", target];
}
function displayCommand(file, args) {
  const quote = (text4) => /[\s"]/.test(text4) ? `"${text4}"` : text4;
  return [file, ...args].map(quote).join(" ");
}

// .dsh-plugin/shared/mv-ai-prompt.mjs
var AI_PACK_LIMITS = Object.freeze({ maxTitle: 200, maxStyle: 4e3, maxLyrics: 2e5, maxDuration: 36e3 });
var AI_AUDIO_EXTENSIONS = Object.freeze([".mp3", ".mp2", ".m4a", ".mp4", ".aac", ".webm", ".mka", ".ogg", ".flac", ".wav"]);
var AI_UPLOAD_ROLES = Object.freeze(["audio", "spectrum"]);
var AI_TOOL_NAMES = Object.freeze({ validate: "mv_pack_validate", preview: "mv_pack_preview_frame" });
var AGENT_FILE = "AGENT.md";
var SCENE_FILE = "scenes.js";
var isObject2 = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
var text2 = (value, max, subject, required = false) => {
  if (value === void 0 || value === null || value === "") {
    if (required) throw new TypeError(`${subject} \u5FC5\u586B`);
    return "";
  }
  if (typeof value !== "string") throw new TypeError(`${subject} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32`);
  if (value.length > max) throw new TypeError(`${subject} \u8D85\u8FC7 ${max} \u4E2A\u5B57\u7B26`);
  if (/[\0]/.test(value)) throw new TypeError(`${subject} \u542B\u6709 NUL`);
  return value;
};
var looksTimed = (lyrics) => (String(lyrics).match(/^\s*\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/gm) ?? []).length >= 2;
function parseAiPackCreate(value) {
  if (!isObject2(value)) throw new TypeError("request must be an object");
  const extra = Object.keys(value).filter((key) => !["title", "artist", "lyrics", "style", "parentDir", "audioExt", "duration"].includes(key));
  if (extra.length) throw new TypeError(`request has unexpected fields: ${extra.join(", ")}`);
  const title = text2(value.title, AI_PACK_LIMITS.maxTitle, "\u6B4C\u540D", true).trim();
  if (!title) throw new TypeError("\u6B4C\u540D \u5FC5\u586B");
  const artist = text2(value.artist, AI_PACK_LIMITS.maxTitle, "\u6B4C\u624B").trim();
  const lyrics = text2(value.lyrics, AI_PACK_LIMITS.maxLyrics, "\u6B4C\u8BCD").replace(/\r\n?/g, "\n");
  const style = text2(value.style, AI_PACK_LIMITS.maxStyle, "\u98CE\u683C\u8BF4\u660E").trim();
  let parentDir = "";
  if (value.parentDir !== void 0 && value.parentDir !== null && value.parentDir !== "") {
    if (typeof value.parentDir !== "string" || !isAbsolutePackPath(value.parentDir.trim()) || /[\0\r\n"]/.test(value.parentDir) || value.parentDir.length > 1024) throw new TypeError("\u4FDD\u5B58\u4F4D\u7F6E\u5FC5\u987B\u662F\u7EDD\u5BF9\u8DEF\u5F84");
    parentDir = value.parentDir.trim();
  }
  if (!AI_AUDIO_EXTENSIONS.includes(value.audioExt)) throw new TypeError(`audioExt must be one of ${AI_AUDIO_EXTENSIONS.join(" ")}`);
  let duration;
  if (value.duration !== void 0 && value.duration !== null) {
    if (typeof value.duration !== "number" || !Number.isFinite(value.duration) || value.duration < 1 || value.duration > AI_PACK_LIMITS.maxDuration) throw new TypeError("duration is invalid");
    duration = Math.round(value.duration * 1e3) / 1e3;
  }
  return { title, artist, lyrics, style, parentDir, audioExt: value.audioExt, ...duration ? { duration } : {} };
}
function agentPrompt({ packDir, title, artist, toolsAvailable = true }) {
  return [
    `\u8BF7\u5E2E\u6211\u7528 dsh-mv \u63D2\u4EF6\u5236\u4F5C\u300C${title}${artist ? ` \u2014 ${artist}` : ""}\u300D\u7684 MV \u5305\u3002`,
    "",
    `MV \u5305\u6587\u4EF6\u5939\uFF1A${packDir}`,
    `\u5148\u5B8C\u6574\u9605\u8BFB\u8BE5\u6587\u4EF6\u5939\u91CC\u7684 ${AGENT_FILE}\uFF08\u4EFB\u52A1\u8BF4\u660E\u548C\u573A\u666F\u811A\u672C\u63A5\u53E3\uFF09\uFF0C\u518D\u8BFB README.md\u3001${MV_PACK_SCHEMA_FILE}\u3001prompts/zh/03-scene-script-guide.md \u548C examples/README.md\uFF0C\u7136\u540E\u6309 ${AGENT_FILE} \u7684\u6B65\u9AA4\u5B8C\u6210\u3002`,
    "\u6D41\u7A0B\uFF1A\u6309 prompts/zh/01-creative-brief.md \u5199\u521B\u610F\u7B80\u62A5\uFF08notes/brief.md\uFF09\u2192 \u6309 prompts/zh/02-storyboard.md \u5199\u5206\u6BB5\u5206\u955C\uFF08notes/storyboard.md\uFF09\u2192 \u6574\u7406/\u5BF9\u9F50\u6B4C\u8BCD\u4E3A LRC \u2192 \u53C2\u8003 examples/ \u7684\u6280\u5DE7\u7F16\u5199 " + SCENE_FILE + " \u2192 \u5199\u51FA\u6700\u7EC8 mv.json \u2192 \u6309 prompts/zh/04-qa-checklist.md \u9010\u6761\u81EA\u68C0\u3002",
    toolsAvailable ? `\u5B8C\u6210\u540E\u7528 ${AI_TOOL_NAMES.validate} \u68C0\u67E5\uFF08path \u586B\u4E0A\u9762\u7684\u6587\u4EF6\u5939\uFF09\uFF0C\u5E76\u7528 ${AI_TOOL_NAMES.preview} \u9884\u89C8\u51E0\u4E2A\u65F6\u95F4\u70B9\u7684\u753B\u9762\uFF0C\u6709\u95EE\u9898\u5C31\u4FEE\u6539\u76F4\u5230\u901A\u8FC7\u3002` : `\u5982\u679C\u6CA1\u6709 ${AI_TOOL_NAMES.validate} / ${AI_TOOL_NAMES.preview} \u5DE5\u5177\uFF0C\u8BF7\u81EA\u884C\u4ED4\u7EC6\u68C0\u67E5 JSON \u548C\u811A\u672C\u3002`,
    "\u53EA\u4FEE\u6539\u8FD9\u4E2A\u6587\u4EF6\u5939\u91CC\u7684\u6587\u4EF6\uFF1B\u4E0D\u8981\u4FEE\u6539\u6216\u4E0A\u4F20\u97F3\u9891\uFF0C\u4E0D\u8981\u8FD0\u884C\u5916\u90E8\u7A0B\u5E8F\uFF0C\u4E0D\u8981\u8054\u7F51\u4E0B\u8F7D\u6B4C\u8BCD\u6216\u7D20\u6750\u3002"
  ].join("\n");
}
function autoTimingNote({ lines = 0, low = 0, source = "", sections = [] }) {
  const kinds = sections.filter((s) => s.kind !== "intro" && s.kind !== "outro").map((s) => `${s.label ?? s.kind} ${s.start}\u2013${s.end}s`).slice(0, 16);
  return [
    lines ? `\u63D2\u4EF6\u5DF2\u5728\u672C\u673A\u81EA\u52A8\u5BF9\u9F50\u6B4C\u8BCD\uFF1Alyrics.lrc\uFF08${lines} \u884C\uFF0C\u6765\u6E90 ${source}${low ? `\uFF0C\u5176\u4E2D ${low} \u884C\u7F6E\u4FE1\u5EA6\u4F4E\u3001\u7528\u6237\u4F1A\u5728\u6821\u51C6\u7F16\u8F91\u5668\u91CC\u4FEE\u6B63` : ""}\uFF09\u548C timing.json\uFF08\u6BCF\u884C\u7F6E\u4FE1\u5EA6\uFF09\u3002\u8BF7\u76F4\u63A5\u4F7F\u7528 lyrics.lrc\uFF0C\u4E0D\u8981\u91CD\u65B0\u4F30\u8BA1\u6216\u6539\u52A8\u65F6\u95F4\u8F74\uFF1Bmv.json \u91CC\u4FDD\u7559 "lyrics": { "file": "lyrics.lrc" }\u3002` : "\u63D2\u4EF6\u6CA1\u6709\u627E\u5230\u6B4C\u8BCD\uFF08\u53EF\u80FD\u662F\u7EAF\u97F3\u4E50\uFF09\uFF1A\u505A\u7EAF\u97F3\u4E50 MV\uFF0C\u4E0D\u8981\u7F16\u9020\u6B4C\u8BCD\u3002",
    sections.length ? `sections.json\uFF08\u4E5F\u5199\u5728 mv.json \u7684 x-dsh-mv-ai.sections\uFF09\u7ED9\u51FA\u4E86\u6BB5\u843D\uFF1A${kinds.join("\uFF1B")}\u3002\u8BF7\u6309\u8FD9\u4E9B\u6BB5\u843D\u5B89\u6392\u573A\u666F\uFF08\u526F\u6B4C\u66F4\u5F3A\u70C8\u3001\u95F4\u594F\u7528\u7EAF\u89C6\u89C9\uFF09\uFF0C\u5E76\u5728\u5199\u6700\u7EC8 mv.json \u65F6\u4FDD\u7559 x-dsh-mv-ai.sections\u3002` : ""
  ].filter(Boolean).join("\n");
}

// .dsh-plugin/client/mv-ai-state.mjs
var SPECTRUM_FPS = 20;
var FFT_SIZE = 2048;
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = -2 * Math.PI / len, wr = Math.cos(angle), wi = Math.sin(angle);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr;
        im[b] = im[a] - ti;
        re[a] += tr;
        im[a] += ti;
        const next = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = next;
      }
    }
  }
}
async function computeSpectrum(channels, sampleRate, { fps = SPECTRUM_FPS, onProgress = () => {
}, yieldEvery = 400 } = {}) {
  const left = channels[0], right = channels[1] ?? channels[0];
  const total = left.length;
  const hop = sampleRate / fps;
  const count = Math.max(1, Math.ceil(total / hop));
  const window = new Float32Array(FFT_SIZE);
  for (let i = 0; i < FFT_SIZE; i++) window[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (FFT_SIZE - 1));
  const edges = bandEdges(FFT_SIZE / 2, sampleRate, BANDS);
  const raw = new Array(count);
  const re = new Float64Array(FFT_SIZE), im = new Float64Array(FFT_SIZE);
  for (let f = 0; f < count; f++) {
    const start = Math.round(f * hop) - FFT_SIZE / 2;
    for (let i = 0; i < FFT_SIZE; i++) {
      const at = start + i;
      re[i] = at >= 0 && at < total ? (left[at] + right[at]) * 0.5 * window[i] : 0;
      im[i] = 0;
    }
    fft(re, im);
    const bands = new Float32Array(BANDS);
    for (let b = 0; b < BANDS; b++) {
      let sum = 0, n = 0;
      for (let i = edges[b]; i < Math.max(edges[b] + 1, edges[b + 1]); i++) {
        sum += Math.hypot(re[i], im[i]);
        n++;
      }
      bands[b] = Math.log10(1 + (n ? sum / n : 0) * 10);
    }
    raw[f] = bands;
    if (f % yieldEvery === yieldEvery - 1) {
      onProgress(f / count);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  const frames = raw.map(() => new Array(BANDS));
  for (let b = 0; b < BANDS; b++) {
    const values = raw.map((frame) => frame[b]).sort((x, y) => x - y);
    const peak = Math.max(1e-6, values[Math.min(values.length - 1, Math.floor(values.length * 0.97))]);
    for (let f = 0; f < count; f++) frames[f][b] = Math.round(Math.min(1, raw[f][b] / peak) ** 1.4 * 100) / 100;
  }
  onProgress(1);
  return { fps, bands: BANDS, frames };
}
async function uploadPackFile(api, packDir, role, bytes, { onProgress = () => {
} } = {}) {
  const begun = unwrapRemote(await api.packUploadBegin({ packDir, role, bytes: bytes.length }), `\u65E0\u6CD5\u5199\u5165 ${role}\u3002`);
  const chunk = Math.min(384 * 1024, begun.chunkBytes || 384 * 1024);
  for (let offset = 0; offset < bytes.length; offset += chunk) {
    const part2 = bytes.subarray(offset, Math.min(bytes.length, offset + chunk));
    unwrapRemote(await api.packUploadWrite({ uploadId: begun.uploadId, offset, base64: bytesToBase64(part2) }), `\u5199\u5165 ${role} \u5931\u8D25\u3002`);
    onProgress(Math.min(1, (offset + part2.length) / bytes.length));
  }
  return unwrapRemote(await api.packUploadFinish({ uploadId: begun.uploadId }), `\u65E0\u6CD5\u5B8C\u6210 ${role}\u3002`);
}
function inspectAiAudio(headBytes) {
  const sniff = sniffAudio(headBytes);
  const ext = audioExtensionOf(sniff);
  if (sniff.format === "unknown") return { sniff, ext, problem: "\u65E0\u6CD5\u8BC6\u522B\u8FD9\u4E2A\u6587\u4EF6\u7684\u683C\u5F0F\uFF08\u6309\u5185\u5BB9\u5224\u65AD\uFF0C\u4E0D\u770B\u6269\u5C55\u540D\uFF09\u3002\u8BF7\u9009\u62E9\u97F3\u9891\u6216\u89C6\u9891\u6587\u4EF6\u3002" };
  if (!sniff.chromium || !AI_AUDIO_EXTENSIONS.includes(ext)) return { sniff, ext, problem: `${sniff.label} \u4E0D\u80FD\u5728\u9762\u677F\u91CC\u64AD\u653E\u3002\u8BF7\u5148\u8F6C\u6362\u6210 MP3 / M4A / FLAC / WAV / Opus \u7B49\u683C\u5F0F\uFF08\u4F8B\u5982\u7528 ffmpeg\uFF09\u3002` };
  return { sniff, ext, problem: "" };
}
async function createAiPack(api, { file, title, artist = "", lyrics = "", style = "", parentDir = "" }, { onProgress = () => {
}, decode: decode2 = decodeToChannels, spectrum = computeSpectrum, toolsAvailable = true } = {}) {
  onProgress({ stage: "read", ratio: 0 });
  const source = new Uint8Array(await file.arrayBuffer());
  const { sniff, ext, problem } = inspectAiAudio(source.subarray(0, 4096));
  if (problem) throw new Error(problem);
  onProgress({ stage: "decode", ratio: 0 });
  const decoded = await decode2(source.buffer.slice(0));
  onProgress({ stage: "spectrum", ratio: 0 });
  const spec = await spectrum(decoded.channels, decoded.sampleRate, { onProgress: (ratio) => onProgress({ stage: "spectrum", ratio }) });
  const created = unwrapRemote(await api.aiPackCreate({
    title: title.trim(),
    artist: artist.trim(),
    lyrics,
    style: style.trim(),
    audioExt: ext,
    ...parentDir.trim() ? { parentDir: parentDir.trim() } : {},
    ...Number.isFinite(decoded.duration) && decoded.duration >= 1 ? { duration: Math.round(decoded.duration * 1e3) / 1e3 } : {}
  }), "\u65E0\u6CD5\u521B\u5EFA MV \u5305\u6587\u4EF6\u5939\u3002");
  await uploadPackFile(api, created.packDir, "audio", source, { onProgress: (ratio) => onProgress({ stage: "copy", ratio }) });
  await uploadPackFile(api, created.packDir, "spectrum", new TextEncoder().encode(JSON.stringify(spec)), { onProgress: (ratio) => onProgress({ stage: "spectrum-save", ratio }) });
  onProgress({ stage: "done", ratio: 1 });
  return { created, duration: decoded.duration, sniff, spectrum: spec, channels: decoded.channels, sampleRate: decoded.sampleRate, lyricsTimed: looksTimed(lyrics), prompt: agentPrompt({ packDir: created.packDir, title: title.trim(), artist: artist.trim(), toolsAvailable }) };
}
var SessionApiMissing = class extends Error {
  constructor(message) {
    super(message);
    this.name = "SessionApiMissing";
  }
};
var callSafely = (fn, fallback = void 0) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};
var zone = () => callSafely(() => Intl.DateTimeFormat().resolvedOptions().timeZone, void 0);
var uuid = () => globalThis.crypto?.randomUUID?.() ?? `mv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
function sessionSupport(harness) {
  const remote = callSafely(() => harness?.get?.("remote"));
  const sessionRemote = callSafely(() => remote?.session);
  const sessions = callSafely(() => harness?.get?.("sessions"));
  const workspaces = callSafely(() => harness?.get?.("workspaces"));
  const ui = callSafely(() => harness?.get?.("uiWorkspace"));
  const canCreate = typeof sessions?.create === "function" || typeof sessionRemote?.create === "function";
  const canPrompt = typeof sessionRemote?.prompt === "function";
  return { available: canCreate && canPrompt, canCreate, canPrompt, canOpen: typeof ui?.openSession === "function", canWorkspace: typeof workspaces?.create === "function", sessionRemote, sessions, workspaces, ui };
}
async function startAgentSession(harness, { packDir, title, prompt }) {
  const support = sessionSupport(harness);
  if (!support.available) throw new SessionApiMissing("\u5F53\u524D Harness \u6CA1\u6709\u63D0\u4F9B\u53EF\u7528\u7684\u4F1A\u8BDD\u63A5\u53E3\uFF08session.create / session.prompt\uFF09\u3002");
  let workspaceId;
  if (support.canWorkspace) {
    try {
      workspaceId = (await support.workspaces.create({ path: packDir }))?.workspaceId;
    } catch {
      const items = callSafely(() => support.workspaces.list.getSnapshot().items, []);
      workspaceId = items?.find((item) => String(item.path).toLowerCase() === packDir.toLowerCase())?.workspaceId;
    }
  }
  const target = workspaceId !== void 0 ? { workspaceId } : { cwd: packDir };
  let sessionId;
  if (typeof support.sessions?.create === "function") sessionId = await support.sessions.create(target);
  else sessionId = unwrapRemote(await support.sessionRemote.create(target), "\u65E0\u6CD5\u521B\u5EFA\u4F1A\u8BDD\u3002")?.sessionId;
  if (typeof sessionId !== "string" || !sessionId) throw new Error("\u521B\u5EFA\u4F1A\u8BDD\u6CA1\u6709\u8FD4\u56DE\u4F1A\u8BDD ID\u3002");
  if (typeof support.sessionRemote?.rename === "function") {
    try {
      await support.sessionRemote.rename({ sessionId, title: `MV\uFF1A${title}`.slice(0, 120) });
    } catch {
    }
  }
  const timeZone = zone();
  unwrapRemote(await support.sessionRemote.prompt({ requestId: uuid(), sessionId, mode: "queue", content: [{ type: "text", text: prompt }], ...timeZone ? { clientTimeZone: timeZone } : {} }), "\u65E0\u6CD5\u628A\u4EFB\u52A1\u53D1\u9001\u7ED9\u4F1A\u8BDD\u3002");
  let opened = false;
  if (support.canOpen) {
    try {
      support.ui.openSession(sessionId);
      opened = true;
    } catch {
      opened = false;
    }
  }
  return { sessionId, workspaceId: workspaceId ?? null, opened };
}
async function openBlankSession(harness, packDir) {
  const support = sessionSupport(harness);
  if (!support.canCreate) return false;
  let target = { cwd: packDir };
  if (support.canWorkspace) {
    try {
      const id = (await support.workspaces.create({ path: packDir }))?.workspaceId;
      if (id !== void 0) target = { workspaceId: id };
    } catch {
    }
  }
  const sessionId = typeof support.sessions?.create === "function" ? await support.sessions.create(target) : unwrapRemote(await support.sessionRemote.create(target), "\u65E0\u6CD5\u521B\u5EFA\u4F1A\u8BDD\u3002")?.sessionId;
  if (support.canOpen && sessionId) {
    support.ui.openSession(sessionId);
    return true;
  }
  return false;
}

// .dsh-plugin/shared/mv-tags.mjs
var latin1 = (b, from, to) => {
  let s = "";
  for (let i = from; i < to; i++) s += String.fromCharCode(b[i]);
  return s;
};
var u32 = (b, at) => (b[at] << 24 | b[at + 1] << 16 | b[at + 2] << 8 | b[at + 3]) >>> 0;
var u32le = (b, at) => (b[at] | b[at + 1] << 8 | b[at + 2] << 16 | b[at + 3] << 24) >>> 0;
var clean2 = (text4) => String(text4 ?? "").replace(/\0+$/g, "").replace(/\0/g, " / ").trim();
var utf8 = (b, from, to) => {
  try {
    return new TextDecoder("utf-8").decode(b.subarray(from, to));
  } catch {
    return "";
  }
};
var utf16 = (b, from, to, littleDefault = true) => {
  let little = littleDefault, at = from;
  if (to - from >= 2 && b[at] === 255 && b[at + 1] === 254) {
    little = true;
    at += 2;
  } else if (to - from >= 2 && b[at] === 254 && b[at + 1] === 255) {
    little = false;
    at += 2;
  }
  try {
    return new TextDecoder(little ? "utf-16le" : "utf-16be").decode(b.subarray(at, at + (to - at & ~1)));
  } catch {
    return "";
  }
};
function id3Text(b, from, to) {
  if (to <= from) return "";
  const enc = b[from];
  if (enc === 0) return clean2(latin1(b, from + 1, to));
  if (enc === 1) return clean2(utf16(b, from + 1, to));
  if (enc === 2) return clean2(utf16(b, from + 1, to, false));
  return clean2(utf8(b, from + 1, to));
}
function readId3v2(b, out) {
  if (b.length < 10 || latin1(b, 0, 3) !== "ID3") return 0;
  const version = b[3], flags = b[5];
  const size = (b[6] & 127) << 21 | (b[7] & 127) << 14 | (b[8] & 127) << 7 | b[9] & 127;
  const end = Math.min(b.length, 10 + size);
  let at = 10;
  if (flags & 64 && version >= 3) at += version === 4 ? (b[10] & 127) << 21 | (b[11] & 127) << 14 | (b[12] & 127) << 7 | b[13] & 127 : u32(b, 10) + 4;
  const names = version === 2 ? { TT2: "title", TP1: "artist", TAL: "album", TLE: "length" } : { TIT2: "title", TPE1: "artist", TALB: "album", TLEN: "length" };
  while (at + (version === 2 ? 6 : 10) <= end) {
    const id = latin1(b, at, at + (version === 2 ? 3 : 4));
    if (!/^[A-Z0-9]{3,4}$/.test(id)) break;
    let frameSize, header;
    if (version === 2) {
      frameSize = b[at + 3] << 16 | b[at + 4] << 8 | b[at + 5];
      header = 6;
    } else if (version === 4) {
      frameSize = (b[at + 4] & 127) << 21 | (b[at + 5] & 127) << 14 | (b[at + 6] & 127) << 7 | b[at + 7] & 127;
      header = 10;
    } else {
      frameSize = u32(b, at + 4);
      header = 10;
    }
    if (frameSize <= 0 || at + header + frameSize > end) break;
    const key = names[id];
    if (key) {
      const text4 = id3Text(b, at + header, at + header + frameSize);
      if (key === "length") {
        const ms = Number(text4);
        if (ms > 0) out.duration ?? (out.duration = ms / 1e3);
      } else if (text4 && !out[key]) out[key] = text4;
    }
    at += header + frameSize;
  }
  return end;
}
function readId3v1(b, out) {
  if (b.length < 128) return;
  const at = b.length - 128;
  if (latin1(b, at, at + 3) !== "TAG") return;
  const field = (from, len) => clean2(latin1(b, at + from, at + from + len));
  out.title || (out.title = field(3, 30));
  out.artist || (out.artist = field(33, 30));
  out.album || (out.album = field(63, 30));
}
function walkBoxes(b, from, to, visit, depth = 0) {
  let at = from;
  while (at + 8 <= to && depth < 8) {
    let size = u32(b, at), header = 8;
    const type = latin1(b, at + 4, at + 8);
    if (size === 1 && at + 16 <= to) {
      size = u32(b, at + 8) * 2 ** 32 + u32(b, at + 12);
      header = 16;
    }
    if (size === 0) size = to - at;
    if (size < header || at + size > to) {
      if (visit(type, at + header, to, true) === false) return;
      break;
    }
    if (visit(type, at + header, at + size, false) === false) return;
    at += size;
  }
}
function readMp4(b, out) {
  if (b.length < 12 || latin1(b, 4, 8) !== "ftyp") return false;
  const ilstNames = { "\xA9nam": "title", "\xA9ART": "artist", aART: "artist", "\xA9alb": "album" };
  const visit = (depth) => (type, from, to) => {
    if (type === "moov" || type === "udta" || type === "trak" || type === "mdia") walkBoxes(b, from, to, visit(depth + 1), depth + 1);
    else if (type === "meta") walkBoxes(b, from + 4, to, visit(depth + 1), depth + 1);
    else if (type === "ilst") {
      walkBoxes(b, from, to, (name, f, t) => {
        const key = ilstNames[name];
        if (!key) return;
        walkBoxes(b, f, t, (inner, df, dt) => {
          if (inner === "data" && !out[key]) {
            const text4 = clean2(utf8(b, df + 8, dt));
            if (text4) out[key] = text4;
          }
        }, depth + 2);
      }, depth + 1);
    } else if (type === "mvhd" && from + 20 <= to) {
      const version = b[from];
      const scale = version === 1 ? u32(b, from + 20) : u32(b, from + 12);
      const length = version === 1 ? u32(b, from + 24) * 2 ** 32 + u32(b, from + 28) : u32(b, from + 16);
      if (scale > 0 && length > 0 && length !== 4294967295) out.duration ?? (out.duration = length / scale);
    }
  };
  walkBoxes(b, 0, b.length, visit(0));
  return true;
}
function vorbisComments(b, at, end, out) {
  if (at + 4 > end) return;
  const vendor = u32le(b, at);
  at += 4 + vendor;
  if (at + 4 > end) return;
  const count = u32le(b, at);
  at += 4;
  for (let i = 0; i < count && at + 4 <= end; i++) {
    const len = u32le(b, at);
    at += 4;
    if (at + len > end) break;
    const entry2 = utf8(b, at, at + len);
    at += len;
    const eq = entry2.indexOf("=");
    if (eq < 0) continue;
    const key = entry2.slice(0, eq).toUpperCase(), value = clean2(entry2.slice(eq + 1));
    if (key === "TITLE") out.title || (out.title = value);
    else if (key === "ARTIST" || key === "ALBUMARTIST") out.artist || (out.artist = value);
    else if (key === "ALBUM") out.album || (out.album = value);
  }
}
function readFlac(b, start, out) {
  if (latin1(b, start, start + 4) !== "fLaC") return false;
  let at = start + 4;
  for (let guard = 0; guard < 64 && at + 4 <= b.length; guard++) {
    const last = b[at] & 128, type = b[at] & 127, len = b[at + 1] << 16 | b[at + 2] << 8 | b[at + 3];
    const body = at + 4;
    if (type === 0 && body + 18 <= b.length) {
      const rate = b[body + 10] << 12 | b[body + 11] << 4 | b[body + 12] >> 4;
      const samples = (b[body + 13] & 15) * 2 ** 32 + u32(b, body + 14);
      if (rate > 0 && samples > 0) out.duration ?? (out.duration = samples / rate);
    }
    if (type === 4) vorbisComments(b, body, Math.min(b.length, body + len), out);
    if (last) break;
    at = body + len;
  }
  return true;
}
function readOgg(b, out) {
  if (latin1(b, 0, 4) !== "OggS") return false;
  const scan = Math.min(b.length, 256 * 1024);
  for (const marker of ["vorbis", "OpusTags"]) {
    for (let i = 0; i < scan - marker.length; i++) {
      if (b[i] === marker.charCodeAt(0) && latin1(b, i, i + marker.length) === marker) {
        vorbisComments(b, i + marker.length, b.length, out);
        return true;
      }
    }
  }
  return true;
}
function readAudioTags(input) {
  const b = input instanceof Uint8Array ? input : new Uint8Array(input);
  const out = { title: "", artist: "", album: "" };
  const afterId3 = readId3v2(b, out);
  if (!readMp4(b, out) && !readFlac(b, afterId3, out) && !readOgg(b, out)) readId3v1(b, out);
  return { title: out.title || "", artist: out.artist || "", album: out.album || "", duration: Number.isFinite(out.duration) && out.duration > 0 ? Math.round(out.duration * 1e3) / 1e3 : null };
}
function guessFromFileName(name) {
  let base = String(name ?? "").replace(/\.[^.]+$/, "").replace(/[_]+/g, " ");
  base = base.replace(/[([【](official|mv|pv|lyrics?|audio|video|hd|hq|4k|动态歌词|歌词|官方)[^)\]】]*[)\]】]/gi, "").replace(/\s*-\s*副本$/, "").replace(/\s+/g, " ").trim();
  const parts = base.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(" - ").trim() };
  return { artist: "", title: base };
}

// .dsh-plugin/shared/mv-sections.mjs
var round2 = (v) => Math.round(v * 100) / 100;
function similarity(a, b) {
  const A = new Set(a), B = new Set(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / Math.min(A.size, B.size) * 0.6 + inter / (A.size + B.size - inter) * 0.4;
}
var sungEnd = (line) => Math.min(line.end ?? line.start + 3, line.start + Math.max(2.5, 0.45 * tokenize2(line.text).length + 1.2));
function lyricBlocks(lines, { gap = 3.5, maxLines = 8 } = {}) {
  const tokens = lines.map((line) => tokenize2(line.text));
  const repeats = tokens.map((t, i) => tokens.some((u, j) => j !== i && Math.abs(j - i) > 1 && similarity(t, u) >= 0.8));
  const blocks = [];
  let current = [];
  lines.forEach((line, i) => {
    const prev = current.at(-1);
    if (prev && (line.start - sungEnd(prev) > gap || current.length >= maxLines || repeats[i] !== repeats[i - 1])) {
      blocks.push(current);
      current = [];
    }
    current.push(line);
  });
  if (current.length) blocks.push(current);
  return blocks.map((block2) => ({ start: block2[0].start, end: sungEnd(block2.at(-1)), lines: block2, tokens: block2.flatMap((line) => tokenize2(line.text)) }));
}
function detectSections(lines, { duration = 0, energyAt = null, instrumentalGap = 8 } = {}) {
  const timed = (lines ?? []).filter((line) => Number.isFinite(line.start)).sort((a, b) => a.start - b.start);
  const total = duration || (timed.at(-1)?.end ?? 0) + 4;
  const blocks = lyricBlocks(timed);
  const group = blocks.map(() => -1);
  let groups = 0;
  for (let i = 0; i < blocks.length; i++) {
    if (group[i] >= 0) continue;
    group[i] = groups;
    for (let j = i + 1; j < blocks.length; j++) if (group[j] < 0 && similarity(blocks[i].tokens, blocks[j].tokens) >= 0.55) group[j] = groups;
    groups++;
  }
  const counts = new Array(groups).fill(0);
  for (const g of group) counts[g]++;
  const energy = blocks.map((b) => energyAt ? energyAt(b.start, b.end) : 0);
  const repeated = counts.map((n, g) => ({ g, n, e: blocks.reduce((sum, b, i) => sum + (group[i] === g ? energy[i] : 0), 0) / Math.max(1, n) })).filter((x) => x.n >= 2);
  repeated.sort((a, b) => b.n - a.n || b.e - a.e);
  let chorusGroup = repeated[0]?.g ?? -1;
  if (chorusGroup < 0 && energyAt && blocks.length >= 3) {
    const loudest = energy.indexOf(Math.max(...energy));
    if (energy[loudest] > 0) chorusGroup = group[loudest];
  }
  const sections = [];
  const add = (kind, start, end, extra = {}) => {
    if (end - start >= 0.5) sections.push({ kind, start: round2(start), end: round2(end), ...extra });
  };
  if (!blocks.length) {
    add("instrumental", 0, total);
    return finish3(sections, energyAt);
  }
  add("intro", 0, blocks[0].start);
  let verse = 0, seenChorus = 0;
  blocks.forEach((block2, i) => {
    let kind;
    if (group[i] === chorusGroup) {
      kind = "chorus";
      seenChorus++;
    } else if (counts[group[i]] === 1 && seenChorus >= 2 && i < blocks.length - 1) kind = "bridge";
    else {
      kind = "verse";
      verse++;
    }
    add(kind, block2.start, block2.end, { lines: [timed.indexOf(block2.lines[0]), timed.indexOf(block2.lines.at(-1))], label: kind === "verse" ? `verse ${verse}` : kind, repeatGroup: group[i] });
    const next = blocks[i + 1];
    if (next && next.start - block2.end >= instrumentalGap) add("instrumental", block2.end, next.start);
  });
  add("outro", blocks.at(-1).end, total);
  return finish3(sections, energyAt);
}
function tidy(sections, minLyric = 4) {
  const lyric = (kind) => kind === "verse" || kind === "chorus" || kind === "bridge";
  const bridges = sections.filter((x) => x.kind === "bridge");
  if (bridges.length > 1) {
    const keep = bridges.reduce((a, b) => b.end - b.start > a.end - a.start ? b : a);
    for (const x of bridges) if (x !== keep) x.kind = "verse";
  }
  const out = [];
  for (const x of sections) {
    const prev = out.at(-1);
    if (prev && lyric(x.kind) && lyric(prev.kind) && (x.kind === prev.kind || x.end - x.start < minLyric && x.kind !== "chorus")) {
      prev.end = x.end;
      if (prev.lines && x.lines) prev.lines = [prev.lines[0], x.lines[1]];
      continue;
    }
    if (prev && lyric(prev.kind) && lyric(x.kind) && prev.end - prev.start < minLyric && prev.kind !== "chorus") {
      Object.assign(prev, { ...x, start: prev.start, lines: prev.lines && x.lines ? [prev.lines[0], x.lines[1]] : x.lines });
      continue;
    }
    out.push({ ...x });
  }
  let verse = 0;
  for (const x of out) if (x.kind === "verse") x.label = `verse ${++verse}`;
  else if (x.label) x.label = x.kind;
  return out;
}
function finish3(sections, energyAt) {
  const out = tidy(sections);
  for (const s of out) if (energyAt) s.energy = round2(energyAt(s.start, s.end));
  return out;
}
function energyFromSpectrum(spectrum) {
  const fps = spectrum?.fps || 20, frames = spectrum?.frames ?? [];
  const level = frames.map((frame) => frame.reduce((a, b) => a + b, 0) / (frame.length || 1));
  return (t0, t1) => {
    const a = Math.max(0, Math.floor(t0 * fps)), b = Math.min(level.length, Math.ceil(t1 * fps));
    if (b <= a) return 0;
    let sum = 0;
    for (let i = a; i < b; i++) sum += level[i];
    return sum / (b - a);
  };
}

// .dsh-plugin/client/mv-auto.mjs
var AUTO_STEPS = Object.freeze([
  { id: "pack", label: "\u5EFA MV \u5305\uFF08\u672C\u673A\u89E3\u7801\u3001\u9891\u8C31\uFF09" },
  { id: "lrclib", label: "\u67E5 LRCLIB \u6B4C\u8BCD\u65F6\u95F4\u8F74" },
  { id: "engine", label: "\u672C\u673A\u8BC6\u522B\u4EBA\u58F0\u65F6\u95F4\uFF08\u6B4C\u8BCD\u5F15\u64CE\uFF09" },
  { id: "align", label: "\u5BF9\u9F50\u6B4C\u8BCD\u3001\u8BA1\u7B97\u7F6E\u4FE1\u5EA6" },
  { id: "sections", label: "\u8BC6\u522B\u6BB5\u843D\uFF08\u4E3B\u6B4C / \u526F\u6B4C / \u95F4\u594F\uFF09" },
  { id: "save", label: "\u4FDD\u5B58 lyrics.lrc / timing.json / mv.json" }
]);
var AutoStopped = class extends Error {
  constructor() {
    super("\u5DF2\u505C\u6B62\u3002");
    this.name = "AutoStopped";
  }
};
var checkStop = (signal) => {
  if (signal?.aborted) throw new AutoStopped();
};
function base64ToBytes(base64) {
  if (typeof atob === "function") {
    const bin = atob(base64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(base64, "base64"));
}
async function readAnalysisFile(api, manifestPath, name) {
  const parts = [];
  let offset = 0, size = 0;
  for (; ; ) {
    const chunk = unwrapRemote(await api.analysisRead({ manifestPath, name, offset }), `\u65E0\u6CD5\u8BFB\u53D6 ${name}\u3002`);
    if (!chunk.exists) return null;
    size = chunk.size;
    parts.push(base64ToBytes(chunk.base64));
    offset += chunk.bytes;
    if (chunk.done || !chunk.bytes) break;
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const part2 of parts) {
    out.set(part2, at);
    at += part2.length;
  }
  return out;
}
async function followJob(api, jobId, { signal, onEvent = () => {
}, onProgress = () => {
} } = {}) {
  let cursor = 0;
  let cancelled = false;
  for (; ; ) {
    if (signal?.aborted && !cancelled) {
      cancelled = true;
      try {
        await api.jobCancel({ jobId });
      } catch {
      }
    }
    const read = unwrapRemote(await api.jobRead({ jobId, cursor, waitMs: 1200 }), "\u65E0\u6CD5\u8BFB\u53D6\u5F15\u64CE\u4EFB\u52A1\u72B6\u6001\u3002");
    cursor = read.cursor;
    for (const event of read.events) onEvent(event);
    onProgress(read);
    if (read.done) {
      if (read.cancelled || cancelled) throw new AutoStopped();
      if (!read.ok) throw new Error(read.error || "\u6B4C\u8BCD\u5F15\u64CE\u4EFB\u52A1\u5931\u8D25\u3002");
      return read;
    }
  }
}
async function guessMetadata(file) {
  const head = new Uint8Array(await file.slice(0, Math.min(file.size, 4 * 1048576)).arrayBuffer());
  let tags = {};
  try {
    tags = readAudioTags(head) ?? {};
  } catch {
    tags = {};
  }
  if (!tags.title && file.size > head.length) {
    try {
      const tail = new Uint8Array(await file.slice(Math.max(0, file.size - 128)).arrayBuffer());
      const t = readAudioTags(tail);
      if (t?.title) tags = { ...t, ...tags, title: t.title };
    } catch {
    }
  }
  const guess = guessFromFileName(file.name);
  return { title: tags.title || guess.title || "", artist: tags.artist || guess.artist || "", album: tags.album || "", duration: tags.duration || null, fromTags: Boolean(tags.title) };
}
async function runAutoMake(api, options, { onStep = () => {
}, onProgress = () => {
}, onLog = () => {
}, signal = null, deps = {} } = {}) {
  const make = deps.createAiPack ?? createAiPack;
  const result = { steps: {}, lines: [], sections: [], source: "none" };
  const step = async (id, fn) => {
    checkStop(signal);
    onStep(id, "running");
    const started = Date.now();
    try {
      const detail = await fn();
      const seconds = Math.round((Date.now() - started) / 100) / 10;
      result.steps[id] = { state: detail?.skipped ? "skipped" : "done", seconds, ...detail };
      onStep(id, result.steps[id].state, result.steps[id]);
      return detail;
    } catch (error) {
      result.steps[id] = { state: error instanceof AutoStopped ? "stopped" : "failed", message: String(error?.message ?? error) };
      onStep(id, result.steps[id].state, result.steps[id]);
      throw error;
    }
  };
  let made, spectrum;
  const userLyrics = String(options.lyrics ?? "");
  const user = userLyrics.trim() ? linesFromText(userLyrics) : { timed: false, lines: [] };
  await step("pack", async () => {
    made = await make(api, { file: options.file, title: options.title, artist: options.artist ?? "", lyrics: userLyrics, style: options.style ?? "", parentDir: options.parentDir ?? "" }, { toolsAvailable: options.toolsAvailable !== false, onProgress: (value) => onProgress("pack", value) });
    spectrum = made.spectrum ?? null;
    return { packDir: made.created.packDir, duration: made.duration };
  });
  result.made = made;
  const duration = made.duration;
  const manifestPath = made.created.manifestPath;
  let synced = user.timed ? user.lines.map((line) => ({ ...line, source: "user", confidence: 0.8 })) : [];
  let text4 = user.lines.map(({ text: text5, alt }) => ({ text: text5, alt }));
  await step("lrclib", async () => {
    if (synced.length) return { skipped: true, reason: "\u4F60\u63D0\u4F9B\u7684\u6B4C\u8BCD\u5DF2\u5E26\u65F6\u95F4\u8F74" };
    if (!options.useLrclib) return { skipped: true, reason: "\u8BBE\u7F6E\u91CC\u5DF2\u5173\u95ED LRCLIB \u67E5\u8BE2" };
    const query = { title: options.title.trim(), ...options.artist?.trim() ? { artist: options.artist.trim() } : {}, ...options.album?.trim() ? { album: options.album.trim() } : {}, ...duration ? { duration: Math.round(duration) } : {} };
    let found;
    try {
      found = unwrapRemote(await api.lyricsLookup(query), "LRCLIB \u67E5\u8BE2\u5931\u8D25\u3002");
    } catch (error) {
      onLog(`LRCLIB\uFF1A${error?.message ?? error}`);
      return { found: false, sent: query, failed: true, reason: `\u67E5\u8BE2\u5931\u8D25\uFF08${String(error?.message ?? error).slice(0, 120)}\uFF09\uFF0C\u7EE7\u7EED\u4E0B\u4E00\u6B65` };
    }
    if (!found.found) return { found: false, sent: found.sent ?? query, reason: "\u6CA1\u6709\u627E\u5230" };
    if (found.synced) {
      const parsed = linesFromText(found.synced);
      synced = parsed.lines.map((line) => ({ ...line, source: "lrclib", confidence: 0.75 }));
      if (!text4.length) text4 = parsed.lines.map(({ text: text5, alt }) => ({ text: text5, alt }));
    } else if (found.plain && !text4.length) text4 = linesFromText(found.plain).lines.map(({ text: text5, alt }) => ({ text: text5, alt }));
    return { found: true, sent: found.sent ?? query, synced: Boolean(found.synced), plain: Boolean(found.plain), track: `${found.trackName ?? ""} \u2014 ${found.artistName ?? ""}`, id: found.id, durationDiff: found.durationDiff };
  });
  let words = null;
  let transcript = null;
  await step("engine", async () => {
    const needed = !synced.length || options.verifySynced;
    if (!needed) return { skipped: true, reason: "\u5DF2\u6709\u65F6\u95F4\u8F74\uFF08LRCLIB\uFF09\uFF1B\u9700\u8981\u65F6\u53EF\u5728\u8BBE\u7F6E\u91CC\u6253\u5F00\u201C\u7528\u5F15\u64CE\u6838\u5BF9\u201D" };
    if (!options.useEngine) return { skipped: true, reason: "\u6B4C\u8BCD\u5F15\u64CE\u672A\u5B89\u88C5\u6216\u672A\u542F\u7528" };
    const prompt = text4.map((line) => line.text).join(" ").slice(0, 600);
    const started = unwrapRemote(await api.engineTranscribe({ manifestPath, model: options.model, language: options.language ?? "auto", separate: options.separate !== false, ...prompt ? { prompt } : {} }), "\u65E0\u6CD5\u542F\u52A8\u6B4C\u8BCD\u5F15\u64CE\u3002");
    const done = await followJob(api, started.jobId, { signal, onEvent: (event) => {
      if (event.type === "log" && event.message) onLog(event.message);
    }, onProgress: (read) => onProgress("engine", { ratio: read.ratio, stage: read.events.at(-1)?.stage ?? "" }) });
    const bytes = await readAnalysisFile(api, manifestPath, "transcript");
    if (!bytes) throw new Error("\u6B4C\u8BCD\u5F15\u64CE\u6CA1\u6709\u5199\u51FA transcript.json\u3002");
    transcript = JSON.parse(new TextDecoder().decode(bytes));
    words = transcript.words ?? [];
    return { words: words.length, device: transcript.device, model: transcript.model, language: transcript.language, separated: transcript.separated, timings: transcript.timings, seconds: done.seconds };
  });
  result.transcript = transcript;
  await step("align", async () => {
    let lines;
    if (words?.length && text4.length) {
      const aligned = alignLines(text4, words, { duration });
      lines = synced.length ? mergeTimed(synced, aligned).lines : aligned;
      result.source = synced.length ? `${synced[0].source}+engine` : "engine";
    } else if (synced.length) {
      lines = synced;
      result.source = synced[0].source;
    } else if (words?.length) {
      lines = linesFromWords(words);
      result.source = "engine-words";
    } else if (text4.length) {
      lines = fillGaps(text4.map((line) => ({ ...line, start: NaN, end: NaN, confidence: 0, source: "estimate" })), { duration });
      result.source = "estimate";
    } else lines = [];
    result.lines = lines;
    const low = lines.filter((line) => (line.confidence ?? 1) < LOW_CONFIDENCE).length;
    return { lines: lines.length, low, source: result.source };
  });
  await step("sections", async () => {
    result.sections = detectSections(result.lines, { duration, energyAt: spectrum ? energyFromSpectrum(spectrum) : null });
    return { sections: result.sections.length, kinds: [...new Set(result.sections.map((s) => s.kind))] };
  });
  await step("save", async () => {
    const saved = await saveCalibration(api, manifestPath, { lines: result.lines, sections: result.sections, title: options.title, artist: options.artist, source: result.source, duration });
    return saved;
  });
  result.prompt = `${made.prompt}

${autoTimingNote({ lines: result.lines.length, low: result.steps.align?.low ?? 0, source: result.source, sections: result.sections })}`;
  return result;
}
function timingDocument({ lines, source, duration, offset = 0 }) {
  return { format: "dsh-mv-timing", version: 1, source, duration, offset, lines: lines.map((line) => ({ start: line.start, end: line.end, text: line.text, alt: line.alt ?? "", confidence: Math.round((line.confidence ?? 1) * 100) / 100, source: line.source ?? source })) };
}
async function saveCalibration(api, manifestPath, { lines, sections = null, title = "", artist = "", source = "user", duration = 0, offset = 0 }) {
  const writes = [];
  const write = async (file, text4) => {
    writes.push(unwrapRemote(await api.packWriteText({ manifestPath, file, text: text4 }), `\u65E0\u6CD5\u4FDD\u5B58 ${file}\u3002`));
  };
  if (lines.length) {
    await write("lyrics.lrc", linesToLrc(lines, { title, artist }));
    await write("timing.json", JSON.stringify(timingDocument({ lines, source, duration, offset }), null, 2));
  }
  if (sections) await write("sections.json", JSON.stringify({ format: "dsh-mv-sections", version: 1, sections }, null, 2));
  const rawBytes = await readAnalysisFile(api, manifestPath, "manifest");
  if (!rawBytes) throw new Error("\u65E0\u6CD5\u8BFB\u53D6 mv.json\u3002");
  const manifest = JSON.parse(new TextDecoder().decode(rawBytes).replace(/^\uFEFF/, ""));
  if (lines.length) manifest.lyrics = { file: "lyrics.lrc", offset: 0 };
  const ai = { ...manifest["x-dsh-mv-ai"] ?? {} };
  ai.timing = { file: "timing.json", source, lines: lines.length, low: lines.filter((line) => (line.confidence ?? 1) < LOW_CONFIDENCE).length, savedAt: (/* @__PURE__ */ new Date()).toISOString() };
  if (sections) {
    ai.sections = sections.map(({ kind, start, end, label }) => ({ kind, start, end, ...label ? { label } : {} }));
    ai.sectionsFile = "sections.json";
  }
  manifest["x-dsh-mv-ai"] = ai;
  await write(MV_PACK_MANIFEST, `${JSON.stringify(manifest, null, 2)}
`);
  return { files: writes.map((w) => w.path), backups: writes.filter((w) => w.backup).length };
}

// .dsh-plugin/client/mv-calib.jsx
var PEAKS_PER_SECOND = 100;
var fmt = (t) => {
  const v = Math.max(0, t);
  const m = Math.floor(v / 60);
  return `${m}:${(v - m * 60).toFixed(2).padStart(5, "0")}`;
};
var sign = (v) => `${v >= 0 ? "+" : "\u2212"}${Math.abs(v).toFixed(2)} s`;
function peaksOf(channels, sampleRate, perSecond = PEAKS_PER_SECOND) {
  const step = Math.max(1, Math.floor(sampleRate / perSecond));
  const n = Math.ceil((channels[0]?.length ?? 0) / step);
  const out = new Float32Array(n);
  let max = 1e-6;
  for (let i = 0; i < n; i++) {
    let peak = 0;
    for (const data of channels) for (let j = i * step, end = Math.min(data.length, j + step); j < end; j += 4) {
      const v = Math.abs(data[j]);
      if (v > peak) peak = v;
    }
    out[i] = peak;
    if (peak > max) max = peak;
  }
  for (let i = 0; i < n; i++) out[i] /= max;
  return out;
}
var reducer = (state, action) => action.type === "reset" ? action.state : calibReduce(state, action);
function CalibEditor({ api, pack, lyricsText, audioFile, duration, player, onPreview }) {
  const [state, dispatch] = import_react2.default.useReducer(reducer, null, () => createCalib([], { duration }));
  const [tap, setTap] = import_react2.default.useState(false);
  const [editing, setEditing] = import_react2.default.useState(-1);
  const [draft, setDraft] = import_react2.default.useState({ text: "", alt: "" });
  const [peaks, setPeaks] = import_react2.default.useState({ values: null, source: "" });
  const [view, setView] = import_react2.default.useState({ span: 12 });
  const [message, setMessage] = import_react2.default.useState(null);
  const [saving, setSaving] = import_react2.default.useState(false);
  const [now, setNow] = import_react2.default.useState(0);
  const canvas = import_react2.default.useRef(null);
  const box2 = import_react2.default.useRef(null);
  const drag = import_react2.default.useRef(null);
  const listRef = import_react2.default.useRef(null);
  const manifestPath = pack?.manifestPath ?? "";
  import_react2.default.useEffect(() => {
    let cancelled = false;
    void (async () => {
      let lines = [], fromTiming = false;
      if (api?.analysisRead && manifestPath) {
        try {
          const bytes = await readAnalysisFile(api, manifestPath, "timing");
          if (bytes) {
            lines = JSON.parse(new TextDecoder().decode(bytes)).lines ?? [];
            fromTiming = lines.length > 0;
          }
        } catch {
          lines = [];
        }
      }
      if (!lines.length && lyricsText) {
        const parsed = linesFromText(lyricsText);
        if (parsed.timed) lines = parsed.lines.map((line) => ({ ...line, confidence: 1, source: "lrc" }));
      }
      if (!cancelled) dispatch({ type: "reset", state: createCalib(lines, { duration, offset: fromTiming ? 0 : pack?.pack?.lyrics?.offset ?? 0 }) });
    })();
    return () => {
      cancelled = true;
    };
  }, [manifestPath, pack?.loadedAt, lyricsText]);
  import_react2.default.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        let bytes = null, source = "";
        if (api?.analysisRead && manifestPath) {
          try {
            bytes = await readAnalysisFile(api, manifestPath, "vocals");
            source = "\u4EBA\u58F0";
          } catch {
            bytes = null;
          }
        }
        if (!bytes && audioFile) {
          bytes = new Uint8Array(await audioFile.arrayBuffer());
          source = "\u539F\u66F2";
        }
        if (!bytes) return;
        const decoded = await decodeToChannels(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
        if (!cancelled) setPeaks({ values: peaksOf(decoded.channels, decoded.sampleRate), source });
      } catch {
        if (!cancelled) setPeaks({ values: null, source: "" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [manifestPath, pack?.loadedAt, audioFile]);
  import_react2.default.useEffect(() => {
    if (state.lines.length && state.dirty) onPreview?.(linesToCues(exportLines(state)));
  }, [state.lines, state.offset]);
  import_react2.default.useEffect(() => () => onPreview?.(null), []);
  import_react2.default.useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      setNow(player?.time?.() ?? 0);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [player]);
  const total = duration || state.lines.at(-1)?.end || 60;
  const left = Math.max(0, Math.min(Math.max(0, total - view.span), now - view.span * 0.3));
  const toX = (t, w) => (t - left) / view.span * w;
  const toT = (x, w) => left + x / w * view.span;
  const [, repaint] = import_react2.default.useReducer((n) => n + 1, 0);
  import_react2.default.useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(repaint);
    };
    globalThis.addEventListener?.(SKIN_EVENT, on);
    return () => {
      cancelAnimationFrame(raf);
      globalThis.removeEventListener?.(SKIN_EVENT, on);
    };
  }, []);
  import_react2.default.useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const dpr = globalThis.devicePixelRatio || 1;
    const w = el.clientWidth, h = el.clientHeight;
    if (el.width !== Math.round(w * dpr)) el.width = Math.round(w * dpr);
    if (el.height !== Math.round(h * dpr)) el.height = Math.round(h * dpr);
    const g = el.getContext("2d");
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css2 = getComputedStyle(el);
    const color = (name) => css2.getPropertyValue(name).trim();
    g.clearRect(0, 0, w, h);
    g.fillStyle = color("--mv-bg") || "#111";
    g.fillRect(0, 0, w, h);
    const mid = h * 0.62;
    if (peaks.values) {
      g.fillStyle = color("--mv-muted") || "#888";
      const p = peaks.values;
      for (let x = 0; x < w; x++) {
        const a = Math.floor(toT(x, w) * PEAKS_PER_SECOND), b = Math.max(a + 1, Math.floor(toT(x + 1, w) * PEAKS_PER_SECOND));
        let v = 0;
        for (let i = Math.max(0, a); i < Math.min(p.length, b); i++) if (p[i] > v) v = p[i];
        const y = v * h * 0.34;
        g.fillRect(x, mid - y, 1, y * 2 || 1);
      }
    }
    g.fillStyle = color("--mv-muted") || "#888";
    g.font = "10px sans-serif";
    for (let s = Math.ceil(left); s < left + view.span; s++) {
      const x = toX(s, w);
      g.fillRect(x, 0, 1, s % 5 ? 3 : 7);
      if (!(s % 5)) g.fillText(fmt(s).replace(/\.00$/, ""), x + 2, 10);
    }
    state.lines.forEach((line, i) => {
      const a = line.start + state.offset, b = line.end + state.offset;
      if (b < left || a > left + view.span) return;
      const x0 = toX(a, w), x1 = toX(b, w);
      const low2 = isUncertain(line);
      g.globalAlpha = i === state.selected ? 0.55 : 0.3;
      g.fillStyle = low2 ? "#e6b422" : color("--mv-accent") || "#4c8dff";
      g.fillRect(x0, 14, Math.max(2, x1 - x0), 22);
      g.globalAlpha = 1;
      g.fillStyle = low2 ? "#e6b422" : color("--mv-accent") || "#4c8dff";
      g.fillRect(x0, 14, 2, h - 14);
      if (i === state.selected) {
        g.fillRect(x1 - 2, 14, 2, 22);
      }
      g.fillStyle = color("--mv-text") || "#eee";
      g.font = "11px sans-serif";
      g.save();
      g.beginPath();
      g.rect(x0 + 3, 14, Math.max(0, x1 - x0 - 5), 22);
      g.clip();
      g.fillText(line.text, x0 + 5, 29);
      g.restore();
    });
    const px = toX(now, w);
    g.fillStyle = "#ff5050";
    g.fillRect(px, 0, 1.5, h);
  });
  const seek = (t) => {
    player?.seek?.(Math.max(0, t));
  };
  const playLine = (i) => {
    const line = state.lines[i];
    if (!line) return;
    dispatch({ type: "select", index: i });
    seek(line.start + state.offset - 2);
    player?.play?.();
  };
  const select = (i) => {
    dispatch({ type: "select", index: i });
    listRef.current?.querySelector(`[data-line="${i}"]`)?.scrollIntoView?.({ block: "nearest" });
  };
  const onPointerDown = (event) => {
    const el = canvas.current;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const w = rect.width;
    const t = toT(x, w);
    const hit = state.lines.findIndex((line2) => {
      const x02 = toX(line2.start + state.offset, w), x12 = toX(line2.end + state.offset, w);
      return x >= x02 - 5 && x <= x12 + 5;
    });
    if (hit < 0 || event.clientY - rect.top > 40) {
      seek(t);
      return;
    }
    const line = state.lines[hit];
    const x0 = toX(line.start + state.offset, w), x1 = toX(line.end + state.offset, w);
    const edge = Math.abs(x - x0) <= 6 ? "start" : Math.abs(x - x1) <= 6 ? "end" : "move";
    drag.current = { index: hit, edge, grab: t - (line.start + state.offset), moved: false };
    el.setPointerCapture?.(event.pointerId);
    dispatch({ type: "select", index: hit });
  };
  const onPointerMove = (event) => {
    const d = drag.current;
    const el = canvas.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (!d) {
      const w = rect.width;
      const near = state.lines.some((line) => Math.abs(x - toX(line.start + state.offset, w)) <= 6 || Math.abs(x - toX(line.end + state.offset, w)) <= 6);
      el.style.cursor = near && event.clientY - rect.top <= 40 ? "ew-resize" : "pointer";
      return;
    }
    const t = toT(x, rect.width) - state.offset;
    if (!d.moved) {
      d.moved = true;
    } else dispatch({ type: "undo" });
    if (d.edge === "start") dispatch({ type: "setStart", index: d.index, time: t });
    else if (d.edge === "end") dispatch({ type: "setEnd", index: d.index, time: t });
    else dispatch({ type: "move", index: d.index, time: t - d.grab });
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) playLine(d.index);
  };
  const onKeyDown = (event) => {
    if (editing >= 0 || event.target?.tagName === "INPUT" || event.target?.tagName === "TEXTAREA") return;
    const key = event.key;
    const mod = event.ctrlKey || event.metaKey;
    let handled = true;
    if (key === " ") {
      if (tap) {
        dispatch({ type: "tap", time: player?.time?.() ?? 0 });
        select(Math.min(state.lines.length - 1, state.selected + 1));
      } else if (player?.playing?.()) player.pause();
      else player?.play?.();
    } else if (mod && key.toLowerCase() === "z" && !event.shiftKey) dispatch({ type: "undo" });
    else if (mod && (key.toLowerCase() === "y" || key.toLowerCase() === "z" && event.shiftKey)) dispatch({ type: "redo" });
    else if (key === "ArrowLeft" || key === "ArrowRight") dispatch({ type: "nudge", edge: event.altKey ? "end" : "start", delta: (key === "ArrowLeft" ? -1 : 1) * (event.shiftKey ? NUDGE.large : NUDGE.small) });
    else if (key === "ArrowUp") select(Math.max(0, state.selected - 1));
    else if (key === "ArrowDown") select(Math.min(state.lines.length - 1, state.selected + 1));
    else if (key === "Enter") playLine(state.selected);
    else if (key.toLowerCase() === "n" && !mod) {
      const j = nextUncertain(state);
      if (j >= 0) {
        select(j);
        playLine(j);
      }
    } else if (key.toLowerCase() === "s" && !mod) {
      const t = (player?.time?.() ?? 0) - state.offset;
      dispatch({ type: "split", time: t });
    } else if (key.toLowerCase() === "m" && !mod) dispatch({ type: "merge" });
    else if (key.toLowerCase() === "c" && !mod) dispatch({ type: "confirm" });
    else if (key === "Delete") dispatch({ type: "delete" });
    else if (key.toLowerCase() === "t" && !mod) setTap((v) => !v);
    else handled = false;
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  const startEdit = (i) => {
    setEditing(i);
    setDraft({ text: state.lines[i].text, alt: state.lines[i].alt ?? "" });
  };
  const finishEdit = (commit2) => {
    if (commit2 && editing >= 0) dispatch({ type: "text", index: editing, text: draft.text, alt: draft.alt });
    setEditing(-1);
    box2.current?.focus();
  };
  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const lines = exportLines(state);
      const saved = await saveCalibration(api, manifestPath, { lines, title: pack?.pack?.title ?? "", artist: pack?.pack?.artist ?? "", source: "calibrated", duration: total });
      dispatch({ type: "saved" });
      if (state.offset) dispatch({ type: "reset", state: { ...createCalib(lines, { duration }), dirty: false } });
      setMessage({ kind: "ok", text: `\u5DF2\u4FDD\u5B58 lyrics.lrc\u3001timing.json \u548C mv.json${saved.backups ? `\uFF08\u65E7\u7248\u672C\u5907\u4EFD\u5728 .dsh-mv-backup\\\uFF0C\u5171 ${saved.backups} \u4E2A\uFF09` : ""}\u3002` });
    } catch (failure) {
      setMessage({ kind: "error", text: `\u4FDD\u5B58\u5931\u8D25\uFF1A${failure?.message ?? failure}` });
    } finally {
      setSaving(false);
    }
  };
  const low = uncertainCount(state);
  const active = lineAt2(state, now);
  if (!manifestPath) return null;
  return /* @__PURE__ */ import_react2.default.createElement("details", { className: "mv-details mv-calib", open: low > 0 || void 0 }, /* @__PURE__ */ import_react2.default.createElement("summary", null, "\u6B4C\u8BCD\u6821\u51C6 ", /* @__PURE__ */ import_react2.default.createElement("span", { className: "mv-caption" }, state.lines.length ? `${state.lines.length} \u53E5${low ? ` \xB7 ${low} \u53E5\u5F85\u786E\u8BA4\uFF08\u9EC4\u8272\uFF09` : " \xB7 \u5168\u90E8\u5DF2\u786E\u8BA4"}${state.dirty ? " \xB7 \u672A\u4FDD\u5B58" : ""}` : "\u8FD8\u6CA1\u6709\u5E26\u65F6\u95F4\u7684\u6B4C\u8BCD\uFF1A\u5148\u7528\u300C\u81EA\u52A8\u5236\u4F5C\u300D\u6216\u9009\u62E9 LRC")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "mv-details-body", ref: box2, tabIndex: 0, onKeyDown, "aria-label": "\u6B4C\u8BCD\u6821\u51C6\u7F16\u8F91\u5668\uFF08\u70B9\u51FB\u540E\u53EF\u7528\u952E\u76D8\uFF09" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "mv-row mv-calib-tools" }, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: `mv-button mv-button-small${tap ? "" : " mv-button-secondary"}`, "aria-pressed": tap, title: "\u6253\u70B9\u6A21\u5F0F\uFF08T\uFF09\uFF1A\u64AD\u653E\u65F6\u6BCF\u6309\u4E00\u6B21\u7A7A\u683C\uFF0C\u628A\u5F53\u524D\u53E5\u7684\u5F00\u59CB\u65F6\u95F4\u8BBE\u4E3A\u6B64\u523B\u5E76\u8DF3\u5230\u4E0B\u4E00\u53E5", onClick: () => {
    setTap((v) => !v);
    box2.current?.focus();
  } }, tap ? "\u25CF \u6253\u70B9\u4E2D\uFF08\u7A7A\u683C\uFF09" : "\u6253\u70B9\u6A21\u5F0F"), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", disabled: !low, title: "\u4E0B\u4E00\u53E5\u5F85\u786E\u8BA4\uFF08N\uFF09", onClick: () => {
    const j = nextUncertain(state);
    if (j >= 0) {
      select(j);
      playLine(j);
    }
  } }, "\u4E0B\u4E00\u4E2A\u4E0D\u786E\u5B9A \u25B8"), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", disabled: !state.past.length, title: "\u64A4\u9500\uFF08Ctrl+Z\uFF09", onClick: () => dispatch({ type: "undo" }) }, "\u64A4\u9500"), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", disabled: !state.future.length, title: "\u91CD\u505A\uFF08Ctrl+Y\uFF09", onClick: () => dispatch({ type: "redo" }) }, "\u91CD\u505A"), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", disabled: state.selected < 0, title: "\u5728\u64AD\u653E\u5934\u5904\u62C6\u5206\uFF08S\uFF09", onClick: () => dispatch({ type: "split", time: now - state.offset }) }, "\u62C6\u5206"), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", disabled: state.selected < 0 || state.selected >= state.lines.length - 1, title: "\u4E0E\u4E0B\u4E00\u53E5\u5408\u5E76\uFF08M\uFF09", onClick: () => dispatch({ type: "merge" }) }, "\u5408\u5E76"), /* @__PURE__ */ import_react2.default.createElement("label", { className: "mv-calib-offset", title: "\u6574\u4F53\u504F\u79FB\uFF1A\u6240\u6709\u53E5\u5B50\u4E00\u8D77\u524D\u540E\u79FB\u52A8" }, "\u6574\u4F53\u504F\u79FB ", /* @__PURE__ */ import_react2.default.createElement("input", { type: "range", min: -5, max: 5, step: 0.01, value: state.offset, onChange: (event) => dispatch({ type: "offset", value: Number(event.target.value) }), "aria-label": "\u6574\u4F53\u504F\u79FB" }), " ", /* @__PURE__ */ import_react2.default.createElement("span", { className: "mv-caption" }, sign(state.offset))), /* @__PURE__ */ import_react2.default.createElement("span", { className: "mv-stepper", title: "\u6CE2\u5F62\u7F29\u653E" }, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", "aria-label": "\u653E\u5927", onClick: () => setView((v) => ({ span: Math.max(3, v.span / 1.5) })) }, "\uFF0B"), /* @__PURE__ */ import_react2.default.createElement("span", null, Math.round(view.span), " s"), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", "aria-label": "\u7F29\u5C0F", onClick: () => setView((v) => ({ span: Math.min(120, v.span * 1.5) })) }, "\u2212")), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "mv-button mv-button-small", disabled: !state.dirty || saving || !state.lines.length, onClick: () => void save() }, saving ? "\u6B63\u5728\u4FDD\u5B58\u2026" : "\u4FDD\u5B58")), /* @__PURE__ */ import_react2.default.createElement(
    "canvas",
    {
      ref: canvas,
      className: "mv-calib-wave",
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onWheel: (event) => {
        if (event.ctrlKey) {
          setView((v) => ({ span: Math.min(120, Math.max(3, v.span * (event.deltaY > 0 ? 1.2 : 1 / 1.2))) }));
          event.preventDefault();
        } else seek(now + (event.deltaY > 0 ? 1 : -1) * view.span * 0.1);
      },
      "aria-label": `\u6CE2\u5F62\uFF08${peaks.source || "\u672A\u89E3\u7801"}\uFF09\uFF1A\u62D6\u52A8\u8272\u5757\u4E24\u7AEF\u6539\u5F00\u59CB/\u7ED3\u675F\uFF0C\u62D6\u4E2D\u95F4\u6574\u4F53\u79FB\u52A8\uFF0C\u70B9\u7A7A\u767D\u5904\u8DF3\u8F6C`
    }
  ), /* @__PURE__ */ import_react2.default.createElement("div", { className: "mv-caption mv-calib-hint" }, "\u6CE2\u5F62\uFF1A", peaks.source || "\u89E3\u7801\u4E2D\u2026", " \xB7 \u70B9\u4E00\u53E5\u4ECE\u524D 2 \u79D2\u64AD\u653E \xB7 \u2190/\u2192 \u5FAE\u8C03 \xB150 ms\uFF08Shift \xB1500 ms\uFF0CAlt \u8C03\u7ED3\u675F\uFF09\xB7 \u2191/\u2193 \u9009\u53E5 \xB7 \u53CC\u51FB\u6539\u5B57 \xB7 S \u62C6\u5206 \xB7 M \u5408\u5E76 \xB7 C \u786E\u8BA4 \xB7 N \u4E0B\u4E00\u4E2A\u4E0D\u786E\u5B9A \xB7 Ctrl+Z / Ctrl+Y"), /* @__PURE__ */ import_react2.default.createElement("ol", { className: "mv-calib-lines", ref: listRef }, state.lines.map((line, i) => /* @__PURE__ */ import_react2.default.createElement(
    "li",
    {
      key: i,
      "data-line": i,
      className: `${i === state.selected ? "mv-selected " : ""}${isUncertain(line) ? "mv-uncertain " : ""}${i === active ? "mv-active" : ""}`,
      onClick: () => playLine(i),
      onDoubleClick: () => startEdit(i),
      title: `\u7F6E\u4FE1\u5EA6 ${Math.round((line.confidence ?? 1) * 100)}% \xB7 \u6765\u6E90 ${line.source ?? ""}`
    },
    /* @__PURE__ */ import_react2.default.createElement("span", { className: "mv-calib-time" }, fmt(line.start + state.offset)),
    editing === i ? /* @__PURE__ */ import_react2.default.createElement("span", { className: "mv-calib-edit", onClick: (event) => event.stopPropagation() }, /* @__PURE__ */ import_react2.default.createElement("input", { autoFocus: true, value: draft.text, onChange: (event) => setDraft((d) => ({ ...d, text: event.target.value })), onKeyDown: (event) => {
      if (event.key === "Enter") finishEdit(true);
      if (event.key === "Escape") finishEdit(false);
    }, "aria-label": "\u6B4C\u8BCD" }), /* @__PURE__ */ import_react2.default.createElement("input", { value: draft.alt, placeholder: "\u7FFB\u8BD1\uFF08\u53EF\u9009\uFF09", onChange: (event) => setDraft((d) => ({ ...d, alt: event.target.value })), onKeyDown: (event) => {
      if (event.key === "Enter") finishEdit(true);
      if (event.key === "Escape") finishEdit(false);
    }, "aria-label": "\u7FFB\u8BD1" })) : /* @__PURE__ */ import_react2.default.createElement("span", { className: "mv-calib-text" }, line.text, line.alt ? /* @__PURE__ */ import_react2.default.createElement("span", { className: "mv-caption" }, " / ", line.alt) : null),
    isUncertain(line) && /* @__PURE__ */ import_react2.default.createElement("span", { className: "mv-calib-flag", "aria-label": "\u5F85\u786E\u8BA4" }, "?")
  ))), message && /* @__PURE__ */ import_react2.default.createElement(Alert, { kind: message.kind }, /* @__PURE__ */ import_react2.default.createElement("p", { className: "mv-wrap" }, message.text))));
}

// .dsh-plugin/shared/mv-workshop.mjs
var WORKSHOP_REPO = "Alice-Marx/dsh-mv-workshop";
var WORKSHOP_BRANCH = "main";
var WORKSHOP_RAW = "https://raw.githubusercontent.com";
var WORKSHOP_INDEX_URL = `${WORKSHOP_RAW}/${WORKSHOP_REPO}/${WORKSHOP_BRANCH}/index.json`;
var PRESET_PACKS = Object.freeze([
  Object.freeze({
    id: "world-execute-me",
    legacyId: "builtin:world-execute-me",
    title: "world.execute(me);",
    artist: "Mili",
    kind: "ASCII \u573A\u666F",
    cover: ">_",
    hue: 18,
    source: "https://github.com/yym8224961/world.execute-me-ascii",
    sourceLabel: "yym8224961/world.execute-me-ascii"
  }),
  Object.freeze({
    id: "world-execute-me-dsh-pv",
    legacyId: "builtin:dsh-pv",
    title: "world.execute(me); dsh PV",
    artist: "MisakaZentai",
    kind: "dsh PV \u753B\u5E03",
    cover: "dsh",
    hue: 222,
    source: "https://github.com/MisakaZentai/world-execute-me-dsh-pv",
    sourceLabel: "MisakaZentai/world-execute-me-dsh-pv"
  })
]);
var WORKSHOP_LIMITS = Object.freeze({
  maxFiles: 40,
  /** 0.9.5: dsh-pv raster pages, data shards and independent OFL notices. */
  dshPvFiles: 64,
  fileBytes: 512 * 1024,
  coverBytes: 1024 * 1024,
  scriptBytes: 256 * 1024,
  /** 0.9.2: webgl scenes (Three.js bundles etc.) get a higher single-script cap. */
  webglScriptBytes: 2 * 1024 * 1024,
  /** 0.9.0: 8 MB (was 4) so the dsh PV pack's recorded data fits; single files stay ≤ 512 KB (shard big JSON). */
  packBytes: 8 * 1024 * 1024,
  dshPvPackBytes: 24 * 1024 * 1024,
  indexBytes: 8 * 1024 * 1024,
  maxPacks: 5e3,
  maxLongLine: 4e3
});
var WORKSHOP_ALLOWED_EXT = Object.freeze([".json", ".js", ".mjs", ".lrc", ".srt", ".vtt", ".md", ".txt", ".png", ".webp", ".jpg", ".jpeg", ".ttf"]);
var WORKSHOP_BANNED_EXT = Object.freeze([
  ".mp3",
  ".mp2",
  ".m4a",
  ".mp4",
  ".aac",
  ".webm",
  ".mka",
  ".mkv",
  ".ogg",
  ".oga",
  ".opus",
  ".flac",
  ".wav",
  ".wma",
  ".aiff",
  ".aif",
  ".ape",
  ".amr",
  ".ac3",
  ".mov",
  ".avi",
  ".mid",
  ".midi",
  ".ass",
  ".ssa",
  ".ttml",
  ".krc",
  ".qrc",
  ".yrc",
  ".lrcx"
]);
var LYRIC_EXTENSIONS = Object.freeze([".lrc", ".srt", ".vtt", ".json", ".txt", ".js", ".mjs"]);
var COVER_NAMES = Object.freeze(["cover.webp", "cover.png", "cover.jpg", "cover.jpeg"]);
var ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;
var VERSION_PATTERN = /^\d{1,4}\.\d{1,4}\.\d{1,4}$/;
var isHttpsUrl = (value) => typeof value === "string" && /^https:\/\/[^\s"<>]{3,300}$/.test(value);
var isObject3 = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
var hasShareableLicense = (value) => typeof value === "string" && Boolean(value.trim()) && !/\b(?:unlicensed|unknown|noassertion|pending)\b|^(?:none|all rights reserved)$|待授权|未授权|许可未知/i.test(value.trim());
function workshopSlug(title, artist = "", random = () => Math.random().toString(36).slice(2, 8)) {
  const base = `${artist ? `${artist}-` : ""}${title}`.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48).replace(/-+$/, "");
  return ID_PATTERN.test(base) ? base : `mv-${base ? `${base.slice(0, 20).replace(/-+$/, "")}-` : ""}${random()}`.replace(/-+/g, "-");
}
function normalizeLyricLine(text4) {
  return String(text4 ?? "").normalize("NFKC").toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");
}
function compareVersions(a, b) {
  const pa = String(a).split(".").map(Number), pb = String(b).split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}
function filterWorkshop(packs, { query = "", license = "", renderer = "", installed = null, onlyInstalled = false } = {}) {
  const q = normalizeLyricLine(query);
  return packs.filter((p) => {
    if (license && !p.license.toLowerCase().includes(license.toLowerCase())) return false;
    if (renderer && p.renderer !== renderer) return false;
    if (onlyInstalled && !installed?.[p.id]) return false;
    if (!q) return true;
    return [p.title, p.artist, p.author, p.description, ...p.tags ?? []].some((v) => normalizeLyricLine(v).includes(q));
  });
}
function energyFingerprint(samples, sampleRate) {
  const win = Math.max(1, Math.round(sampleRate / 2));
  const count = Math.min(3e3, Math.floor(samples.length / win));
  const out = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    let sum = 0;
    for (let j = i * win, end = j + win; j < end; j += 4) sum += samples[j] * samples[j];
    const rms = Math.sqrt(sum / (win / 4));
    const db = 20 * Math.log10(rms + 1e-6);
    out[i] = Math.max(0, Math.min(255, Math.round((db + 60) / 60 * 255)));
  }
  return out;
}
var encodeFingerprint = (bytes) => btoa(String.fromCharCode(...bytes));
function decodeFingerprint(text4) {
  try {
    const s = atob(String(text4));
    return Uint8Array.from(s, (c) => c.charCodeAt(0));
  } catch {
    return new Uint8Array(0);
  }
}
function compareFingerprints(a, b, maxShift = 20) {
  if (!a?.length || !b?.length) return { score: 0, shift: 0 };
  let best = { score: -1, shift: 0 };
  for (let shift = -maxShift; shift <= maxShift; shift++) {
    let n = 0, sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
    for (let i = Math.max(0, -shift); i < a.length && i + shift < b.length; i++) {
      const x = a[i], y = b[i + shift];
      n++;
      sa += x;
      sb += y;
      saa += x * x;
      sbb += y * y;
      sab += x * y;
    }
    if (n < 20) continue;
    const cov = sab - sa * sb / n, va = saa - sa * sa / n, vb = sbb - sb * sb / n;
    const score = va > 0 && vb > 0 ? cov / Math.sqrt(va * vb) : 0;
    if (score > best.score) best = { score, shift };
  }
  return { score: Math.round(Math.max(0, best.score) * 1e3) / 1e3, shift: best.shift / 2 };
}
function audioMatch(expected, actual) {
  if (!expected?.duration) return { ok: true, level: "unknown", message: "\u8FD9\u4E2A\u5DE5\u574A\u5305\u6CA1\u6709\u8BB0\u5F55\u6B4C\u66F2\u65F6\u957F\uFF0C\u65E0\u6CD5\u68C0\u67E5\u97F3\u9891\u662F\u5426\u5339\u914D\u3002" };
  const diff = Math.abs((actual?.duration ?? 0) - expected.duration);
  const lines = [];
  let ok = diff <= 2;
  if (!ok) lines.push(`\u65F6\u957F\u4E0D\u4E00\u81F4\uFF1A\u5DE5\u574A\u5305\u6309 ${expected.duration.toFixed(1)} \u79D2\u5236\u4F5C\uFF0C\u4F60\u7684\u97F3\u9891 ${Number(actual?.duration ?? 0).toFixed(1)} \u79D2\uFF08\u53EF\u80FD\u662F\u4E0D\u540C\u7248\u672C / \u526A\u8F91\uFF09\uFF0C\u753B\u9762\u53EF\u80FD\u5BF9\u4E0D\u4E0A\u3002`);
  if (expected.fingerprint && actual?.fingerprint) {
    const r = compareFingerprints(decodeFingerprint(expected.fingerprint), actual.fingerprint);
    if (r.score < 0.8) {
      ok = false;
      lines.push(`\u97F3\u9891\u6307\u7EB9\u76F8\u4F3C\u5EA6 ${Math.round(r.score * 100)}%\uFF08\u4F4E\u4E8E 80%\uFF09\uFF1A\u53EF\u80FD\u4E0D\u662F\u540C\u4E00\u4E2A\u5F55\u97F3\u7248\u672C\u3002`);
    } else if (Math.abs(r.shift) >= 0.5) lines.push(`\u97F3\u9891\u6307\u7EB9\u5339\u914D\uFF08${Math.round(r.score * 100)}%\uFF09\uFF0C\u4F46\u6574\u4F53\u504F\u79FB\u7EA6 ${r.shift > 0 ? "+" : ""}${r.shift} \u79D2\uFF0C\u53EF\u4EE5\u7528\u97F3\u9891\u504F\u79FB\u952E\u8C03\u6574\u3002`);
    else lines.push(`\u97F3\u9891\u6307\u7EB9\u5339\u914D\uFF08${Math.round(r.score * 100)}%\uFF09\u3002`);
  }
  return { ok, level: ok ? "ok" : "warn", message: lines.join("\n") || `\u65F6\u957F\u5339\u914D\uFF08\u76F8\u5DEE ${diff.toFixed(1)} \u79D2\uFF09\u3002` };
}
async function retimeCues(cues, timing, hashOf) {
  const lines = Array.isArray(timing?.lines) ? timing.lines : [];
  if (!lines.length || !cues.length) return { cues, matched: 0, total: lines.length };
  const hashes = await Promise.all(cues.map((c) => hashOf(normalizeLyricLine(c.en || c.zh || ""))));
  let from = 0, matched = 0;
  const out = cues.map((c) => ({ ...c }));
  for (let i = 0; i < out.length; i++) {
    let found = -1;
    for (let j = from; j < Math.min(lines.length, from + 40); j++) if (lines[j].h === hashes[i]) {
      found = j;
      break;
    }
    if (found < 0) continue;
    const line = lines[found];
    out[i].time = line.t;
    if (Number.isFinite(line.e)) out[i].end = line.e;
    if (Array.isArray(line.w) && line.w.length) {
      const words = String(out[i].en || out[i].zh || "").split(/\s+/).filter(Boolean);
      if (words.length === line.w.length) out[i].words = words.map((text4, k) => ({ text: text4, time: line.w[k] }));
    }
    from = found + 1;
    matched++;
  }
  for (let i = 0; i < out.length; i++) if (!Number.isFinite(out[i].end) || out[i].end <= out[i].time) out[i].end = out[i + 1]?.time ?? out[i].time + 4;
  return { cues: out, matched, total: lines.length };
}
var onlyKeys2 = (value, keys2, subject) => {
  if (!isObject3(value)) throw new TypeError(`${subject} must be an object`);
  const extra = Object.keys(value).filter((k) => !keys2.includes(k));
  if (extra.length) throw new TypeError(`${subject} has unexpected fields: ${extra.join(", ")}`);
  return value;
};
var packId = (v) => {
  if (typeof v !== "string" || !ID_PATTERN.test(v)) throw new TypeError("\u5DE5\u574A\u5305 id \u65E0\u6548");
  return v;
};
function parseWorkshopIndexRequest(value = {}) {
  onlyKeys2(value ?? {}, ["refresh"], "workshop index request");
  return { refresh: value?.refresh === true };
}
function parseWorkshopId(value) {
  onlyKeys2(value, ["id"], "workshop request");
  return { id: packId(value.id) };
}
function parseWorkshopInstalled(value = {}) {
  onlyKeys2(value ?? {}, [], "workshop installed request");
  return {};
}
function parseWorkshopPublish(value) {
  onlyKeys2(value, ["manifestPath", "id", "version", "license", "author", "description", "tags", "homepage", "duration", "fingerprint", "coverPng", "lyricsLicense", "lyricsCredit", "lyricsSource"], "workshop publish request");
  const str = (v, n, name, required = false) => {
    if (v === void 0 || v === "") {
      if (required) throw new TypeError(`${name} \u5FC5\u586B`);
      return "";
    }
    if (typeof v !== "string" || v.length > n || /[\0\r]/.test(v)) throw new TypeError(`${name} \u65E0\u6548`);
    const text4 = v.trim();
    if (required && !text4) throw new TypeError(`${name} \u5FC5\u586B`);
    return text4;
  };
  if (typeof value.manifestPath !== "string" || !value.manifestPath.trim() || value.manifestPath.length > 1e3) throw new TypeError("manifestPath \u65E0\u6548");
  const version = str(value.version, 20, "version", true);
  if (!VERSION_PATTERN.test(version)) throw new TypeError("version \u5E94\u4E3A x.y.z");
  const tags = value.tags === void 0 ? [] : value.tags;
  if (!Array.isArray(tags) || tags.length > 8 || !tags.every((t) => typeof t === "string" && t.length <= 24)) throw new TypeError("tags \u65E0\u6548\uFF08\u6700\u591A 8 \u4E2A\uFF0C\u6BCF\u4E2A\u4E0D\u8D85\u8FC7 24 \u5B57\u7B26\uFF09");
  const homepage = str(value.homepage, 300, "homepage");
  if (homepage && !/^https:\/\/[^\s]+$/.test(homepage)) throw new TypeError("homepage \u5FC5\u987B\u662F https:// \u94FE\u63A5");
  const lyricsLicense = str(value.lyricsLicense, 120, "lyricsLicense"), lyricsCredit = str(value.lyricsCredit, 500, "lyricsCredit"), lyricsSource = str(value.lyricsSource, 300, "lyricsSource");
  if (lyricsLicense && (!hasShareableLicense(lyricsLicense) || /\n/.test(lyricsLicense))) throw new TypeError("lyricsLicense \u5FC5\u987B\u662F\u660E\u786E\u5141\u8BB8\u5206\u4EAB\u7684\u8BB8\u53EF\uFF08\u4E0D\u80FD\u662F\u672A\u6388\u6743 / pending\uFF09");
  if (lyricsSource && !isHttpsUrl(lyricsSource)) throw new TypeError("lyricsSource \u5FC5\u987B\u662F https:// \u94FE\u63A5");
  if (value.duration !== void 0 && !(Number.isFinite(value.duration) && value.duration > 0 && value.duration <= 36e3)) throw new TypeError("duration \u65E0\u6548");
  if (value.fingerprint !== void 0 && !(typeof value.fingerprint === "string" && /^[A-Za-z0-9+/=]{1,4096}$/.test(value.fingerprint))) throw new TypeError("fingerprint \u65E0\u6548");
  if (value.coverPng !== void 0 && !(typeof value.coverPng === "string" && value.coverPng.length <= 14e5 && /^[A-Za-z0-9+/=]+$/.test(value.coverPng))) throw new TypeError("coverPng \u65E0\u6548\uFF08base64 PNG\uFF0C\u6700\u5927\u7EA6 1 MB\uFF09");
  return {
    manifestPath: value.manifestPath.trim(),
    id: packId(value.id),
    version,
    license: str(value.license, 120, "license", true),
    author: str(value.author, 120, "author", true),
    description: str(value.description, 500, "description"),
    tags: tags.map((t) => t.trim()).filter(Boolean),
    homepage,
    lyricsLicense,
    lyricsCredit,
    lyricsSource,
    duration: value.duration,
    fingerprint: value.fingerprint,
    coverPng: value.coverPng
  };
}
function parseWorkshopDirInfo(value = {}) {
  onlyKeys2(value ?? {}, [], "workshop dir request");
  return {};
}
function parseWorkshopDirOpen(value = {}) {
  onlyKeys2(value ?? {}, [], "workshop dir open request");
  return {};
}
function parseWorkshopDirSet(value) {
  onlyKeys2(value, ["dir", "reset", "keep"], "workshop dir request");
  if (value.reset !== void 0 && typeof value.reset !== "boolean") throw new TypeError("reset \u65E0\u6548");
  if (value.keep !== void 0 && typeof value.keep !== "boolean") throw new TypeError("keep \u65E0\u6548");
  if (!value.reset && (typeof value.dir !== "string" || !value.dir.trim() || value.dir.length > 400 || /[\0\r\n]/.test(value.dir))) throw new TypeError("\u5B89\u88C5\u4F4D\u7F6E\u65E0\u6548");
  return { dir: value.reset ? null : value.dir.trim(), reset: value.reset === true, keep: value.keep !== false };
}
function parseWorkshopDirMove(value) {
  onlyKeys2(value, ["id"], "workshop move request");
  if (!ID_PATTERN.test(String(value.id ?? ""))) throw new TypeError("\u5305 id \u65E0\u6548");
  return { id: value.id };
}

// .dsh-plugin/shared/mv-template-assets.gen.mjs
var TEMPLATE_ASSETS = Object.freeze({
  "examples/NOTICE.md": '# Third-party notice / \u7B2C\u4E09\u65B9\u58F0\u660E\n\nThe scene ideas and the short chat lines in `chat-window.scene.js` come from\nMisakaZentai/world-execute-me-dsh-pv (https://github.com/MisakaZentai/world-execute-me-dsh-pv, commit a4dd0f7),\nused under the MIT License below. The whale-girl artwork of that project (CC BY-NC-SA 4.0) is not included;\nthe examples draw placeholder silhouettes from code. No song audio or lyric text is included.\n\n\u573A\u666F\u521B\u610F\u4E0E `chat-window.scene.js` \u4E2D\u7684\u51E0\u53E5\u804A\u5929\u6587\u5B57\u6765\u81EA\u4E0A\u8FF0\u9879\u76EE\uFF0C\u6309\u4EE5\u4E0B MIT \u8BB8\u53EF\u4F7F\u7528\uFF1B\u539F\u4F5C\u7F8E\u672F\uFF08CC BY-NC-SA 4.0\uFF09\u672A\u5305\u542B\u3002\n\n```\nMIT License\n\nCopyright (c) 2026 MisakaZentai\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n```\n',
  "examples/README.md": '# Scene examples / \u573A\u666F\u793A\u4F8B\n\n[English](#english) \xB7 [\u4E2D\u6587](#\u4E2D\u6587)\n\n## English\n\nEach `*.scene.js` file is a complete scene script for `canvas.renderer: "script"`. It runs in the\nsame sandbox as your own `scenes.js`: no imports, no network, no DOM, a time budget of 40 ms per\nframe. To try one, point a pack at it:\n\n```json\n"canvas": { "renderer": "script", "script": "examples/heartbeat.scene.js", "bpm": 120 }\n```\n\nor copy the file next to your `mv.json` as `scenes.js`. Every file starts with the same grid\nhelpers (`makeGrid`, `put`, `center`, `box`, `fill`, `frameOf`, `hash`, `energyOf`, `bandOf`):\nthey handle wide CJK characters (two cells) and build `{ lines, styles }` frames.\n\n| File | What it shows | Technique |\n| --- | --- | --- |\n| `chat-window.scene.js` | A chat window; the lyric is typed word by word as the reply | `ctx.lyric.words` / `ctx.lyric.word`, boxes, cursor blink |\n| `heartbeat.scene.js` | An ECG trace beating on the song\'s tempo | `ctx.beat` (from `canvas.bpm`), a pure function of `t` for the trace history, phosphor fade with styles |\n| `ops-ticker.scene.js` | Scrolling operation log whose words change with the song section | `ctx.section.kind`, beat highlight, a ticker line |\n| `token-bar.scene.js` | stdout with token ids and a karaoke token band | tokenising lyrics, deterministic ids (crc32), karaoke |\n| `execution-split.scene.js` | Split screen: placeholder silhouette mosaic + big block letters + diagonal tape | block font, shading ramps, beat glitch that skips rows with wide characters |\n| `whale-fall.scene.js` | Ending: a placeholder whale silhouette sinks through marine snow | layered parallax, deterministic particles, slow progress-driven motion |\n| `post-effects.scene.js` | Trails, bloom, scanlines, vignette and glitch as passes over a grid | post-processing on style digits, trails by re-drawing earlier times |\n| `rich-pack/` | A full multi-section MV (intro, verse, chorus, bridge, chorus 2, outro) | sections, beat, word timings, transitions, post effects together |\n\n`rich-pack/` is a pack you can import directly (MV \u653E\u6620\u5BA4 \u2192 \u5BFC\u5165 MV \u5305\u2026). It has **no audio** and\n**placeholder lyrics** (`lyrics.placeholder.lrc`, with enhanced-LRC word stamps), so it plays\nsilently; the helpers fake some motion when the spectrum is silent. Add `"audio": { "file": "song.mp3" }`,\nyour own lyrics, and re-time `x-dsh-mv-ai.sections` and `canvas.bpm` for your song.\n\nCredits: the scene ideas (chat window, heartbeat, ops ticker, stdout tokens, EXECUTION split,\nwhale-fall ending, post effects) come from MisakaZentai\'s\n[world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv) (code MIT,\n\xA9 MisakaZentai). The short chat lines in `chat-window.scene.js` come from its MIT-licensed data.\nIts whale-girl artwork is CC BY-NC-SA 4.0 and is **not** included: the examples draw\nplaceholder silhouettes from code instead. No song audio or lyric text is included.\n\n## \u4E2D\u6587\n\n\u6BCF\u4E2A `*.scene.js` \u90FD\u662F\u4E00\u4E2A\u5B8C\u6574\u7684\u573A\u666F\u811A\u672C\uFF08`canvas.renderer: "script"`\uFF09\uFF0C\u548C\u4F60\u81EA\u5DF1\u7684 `scenes.js`\n\u8FD0\u884C\u5728\u540C\u4E00\u4E2A\u6C99\u7BB1\u91CC\uFF1A\u4E0D\u80FD import\u3001\u6CA1\u6709\u7F51\u7EDC\u548C DOM\u3001\u6BCF\u5E27 40 \u6BEB\u79D2\u9884\u7B97\u3002\u8BD5\u7528\u65B9\u6CD5\uFF1A\u5728 mv.json \u91CC\u6307\u5411\u5B83\n\n```json\n"canvas": { "renderer": "script", "script": "examples/heartbeat.scene.js", "bpm": 120 }\n```\n\n\u6216\u8005\u628A\u6587\u4EF6\u590D\u5236\u5230 `mv.json` \u65C1\u8FB9\u5E76\u6539\u540D\u4E3A `scenes.js`\u3002\u6BCF\u4E2A\u6587\u4EF6\u5F00\u5934\u90FD\u662F\u540C\u4E00\u5957\u7F51\u683C\u5DE5\u5177\u51FD\u6570\n\uFF08`makeGrid`\u3001`put`\u3001`center`\u3001`box`\u3001`fill`\u3001`frameOf`\u3001`hash`\u3001`energyOf`\u3001`bandOf`\uFF09\uFF1A\n\u5B83\u4EEC\u5904\u7406\u5360\u4E24\u683C\u7684\u4E2D\u6587\u7B49\u5BBD\u5B57\u7B26\uFF0C\u5E76\u751F\u6210 `{ lines, styles }` \u5E27\u3002\n\n| \u6587\u4EF6 | \u753B\u9762 | \u6280\u5DE7 |\n| --- | --- | --- |\n| `chat-window.scene.js` | \u804A\u5929\u7A97\u53E3\uFF0C\u6B4C\u8BCD\u4F5C\u4E3A\u56DE\u590D\u9010\u8BCD\u6253\u51FA | `ctx.lyric.words` / `ctx.lyric.word`\u3001\u8FB9\u6846\u3001\u5149\u6807\u95EA\u70C1 |\n| `heartbeat.scene.js` | \u8DDF\u7740\u6B4C\u66F2\u901F\u5EA6\u8DF3\u52A8\u7684\u5FC3\u7535\u56FE | `ctx.beat`\uFF08\u6765\u81EA `canvas.bpm`\uFF09\u3001\u7528 `t` \u7EAF\u51FD\u6570\u7B97\u51FA\u8F68\u8FF9\u5386\u53F2\u3001\u6837\u5F0F\u505A\u4F59\u8F89 |\n| `ops-ticker.scene.js` | \u6EDA\u52A8\u7684\u64CD\u4F5C\u65E5\u5FD7\uFF0C\u7528\u8BCD\u968F\u6BB5\u843D\u53D8\u5316 | `ctx.section.kind`\u3001\u8282\u62CD\u9AD8\u4EAE\u3001\u5E95\u90E8\u8DD1\u9A6C\u706F |\n| `token-bar.scene.js` | stdout \u8F93\u51FA token id\uFF0C\u4E0B\u65B9\u5361\u62C9 OK token \u6761 | \u6B4C\u8BCD\u5206\u8BCD\u3001\u786E\u5B9A\u6027 id\uFF08crc32\uFF09\u3001\u5361\u62C9 OK |\n| `execution-split.scene.js` | \u5206\u5C4F\uFF1A\u5360\u4F4D\u526A\u5F71\u9A6C\u8D5B\u514B + \u5927\u5B57 + \u659C\u5411\u80F6\u5E26 | \u65B9\u5757\u5B57\u4F53\u3001\u660E\u6697\u6E10\u53D8\u3001\u8DF3\u8FC7\u5BBD\u5B57\u7B26\u884C\u7684\u8282\u62CD\u6545\u969C\u6548\u679C |\n| `whale-fall.scene.js` | \u7ED3\u5C3E\uFF1A\u5360\u4F4D\u9CB8\u9C7C\u526A\u5F71\u5728\u6D77\u96EA\u4E2D\u4E0B\u6C89 | \u5206\u5C42\u89C6\u5DEE\u3001\u786E\u5B9A\u6027\u7C92\u5B50\u3001\u968F\u8FDB\u5EA6\u7F13\u6162\u8FD0\u52A8 |\n| `post-effects.scene.js` | \u62D6\u5F71\u3001\u6CDB\u5149\u3001\u626B\u63CF\u7EBF\u3001\u6697\u89D2\u3001\u6545\u969C | \u5728\u6837\u5F0F\u6570\u5B57\u4E0A\u505A\u540E\u671F\uFF0C\u91CD\u753B\u66F4\u65E9\u65F6\u523B\u5F97\u5230\u62D6\u5F71 |\n| `rich-pack/` | \u5B8C\u6574\u591A\u6BB5\u843D MV\uFF08\u524D\u594F\u3001\u4E3B\u6B4C\u3001\u526F\u6B4C\u3001\u6865\u6BB5\u3001\u526F\u6B4C 2\u3001\u5C3E\u58F0\uFF09 | \u6BB5\u843D\u3001\u8282\u62CD\u3001\u9010\u8BCD\u65F6\u95F4\u3001\u8F6C\u573A\u3001\u540E\u671F\u6548\u679C\u7684\u7EFC\u5408\u8FD0\u7528 |\n\n`rich-pack/` \u53EF\u4EE5\u76F4\u63A5\u5BFC\u5165\uFF08MV \u653E\u6620\u5BA4 \u2192 \u5BFC\u5165 MV \u5305\u2026\uFF09\u3002\u5B83**\u6CA1\u6709\u97F3\u9891**\uFF0C\u6B4C\u8BCD\u662F**\u5360\u4F4D\u6587\u5B57**\n\uFF08`lyrics.placeholder.lrc`\uFF0C\u5E26\u589E\u5F3A LRC \u9010\u8BCD\u65F6\u95F4\u6233\uFF09\uFF0C\u6240\u4EE5\u9759\u97F3\u64AD\u653E\uFF1B\u9891\u8C31\u4E3A\u96F6\u65F6\u5DE5\u5177\u51FD\u6570\u4F1A\u751F\u6210\u4E00\u70B9\u52A8\u6001\u3002\n\u52A0\u4E0A `"audio": { "file": "song.mp3" }` \u548C\u4F60\u81EA\u5DF1\u7684\u6B4C\u8BCD\uFF0C\u518D\u6309\u4F60\u7684\u6B4C\u91CD\u65B0\u8BBE\u5B9A `x-dsh-mv-ai.sections` \u548C `canvas.bpm`\u3002\n\n\u81F4\u8C22\uFF1A\u8FD9\u4E9B\u573A\u666F\u521B\u610F\uFF08\u804A\u5929\u7A97\u53E3\u3001\u5FC3\u8DF3\u7EBF\u3001\u64CD\u4F5C\u65E5\u5FD7\u3001stdout token \u6761\u3001EXECUTION \u5206\u5C4F\u3001\u9CB8\u843D\u7ED3\u5C3E\u3001\u540E\u671F\u6548\u679C\uFF09\n\u6765\u81EA MisakaZentai \u7684 [world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv)\n\uFF08\u4EE3\u7801 MIT\uFF0C\xA9 MisakaZentai\uFF09\uFF1B`chat-window.scene.js` \u91CC\u7684\u51E0\u53E5\u804A\u5929\u6587\u5B57\u6765\u81EA\u5B83\u7684 MIT \u6570\u636E\u3002\n\u539F\u4F5C\u7684\u9CB8\u9C7C\u5C11\u5973\u7F8E\u672F\u4E3A CC BY-NC-SA 4.0\uFF0C**\u672A\u5305\u542B**\u5728\u5185\uFF1A\u793A\u4F8B\u7528\u4EE3\u7801\u753B\u7684\u5360\u4F4D\u526A\u5F71\u4EE3\u66FF\u3002\u4E0D\u5305\u542B\u4EFB\u4F55\u6B4C\u66F2\u97F3\u9891\u6216\u6B4C\u8BCD\u6587\u672C\u3002\n',
  "examples/chat-window.scene.js": `// chat-window.scene.js \u2014 a DeepSeek-style chat window drawn with box characters.
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

// ---- grid helpers (shared by every example; copy them into your own scenes.js) ----------------\r
// A frame is a grid of cells. ch[y][x] holds one character, st[y][x] its style digit:\r
// 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.\r
// Wide characters (CJK, full-width punctuation) take two cells; the second cell holds '' so that\r
// lines and styles stay aligned when joined.\r
var WIDE = /[\\u1100-\\u115f\\u2e80-\\ua4cf\\uac00-\\ud7a3\\uf900-\\ufaff\\ufe30-\\ufe4f\\uff00-\\uff60\\uffe0-\\uffe6]/\r
function cellWidth(c) { return WIDE.test(c) ? 2 : 1 }\r
function textWidth(s) { var w = 0; for (var c of String(s)) w += cellWidth(c); return w }\r
function makeGrid(cols, rows) {\r
  var ch = [], st = []\r
  for (var y = 0; y < rows; y++) { ch.push(new Array(cols).fill(' ')); st.push(new Array(cols).fill('0')) }\r
  return { cols: cols, rows: rows, ch: ch, st: st }\r
}\r
function setCell(g, x, y, c, s) {\r
  if (y < 0 || y >= g.rows || x < 0 || x >= g.cols) return\r
  var row = g.ch[y], sty = g.st[y], w = cellWidth(c)\r
  if (x + w > g.cols) return\r
  if (row[x] === '' && x > 0) { row[x - 1] = ' '; sty[x - 1] = '0' }        // we hit the right half of a wide char\r
  if (w === 1 && row[x + 1] === '') { row[x + 1] = ' '; sty[x + 1] = '0' }  // we cover the left half of one\r
  if (w === 2 && row[x + 2] === '') { row[x + 2] = ' '; sty[x + 2] = '0' }\r
  row[x] = c; sty[x] = String(s)\r
  if (w === 2) { row[x + 1] = ''; sty[x + 1] = '' }\r
}\r
function put(g, x, y, text, s) {\r
  x = Math.round(x); y = Math.round(y)\r
  for (var c of String(text)) { setCell(g, x, y, c, s); x += cellWidth(c) }\r
}\r
function center(g, y, text, s) { put(g, Math.floor((g.cols - textWidth(text)) / 2), y, text, s) }\r
function fill(g, x, y, w, h, c, s) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) setCell(g, x + i, y + j, c, s) }\r
function box(g, x, y, w, h, s, title) {\r
  if (w < 2 || h < 2) return\r
  for (var i = 1; i < w - 1; i++) { setCell(g, x + i, y, '\u2500', s); setCell(g, x + i, y + h - 1, '\u2500', s) }\r
  for (var j = 1; j < h - 1; j++) { setCell(g, x, y + j, '\u2502', s); setCell(g, x + w - 1, y + j, '\u2502', s) }\r
  setCell(g, x, y, '\u250C', s); setCell(g, x + w - 1, y, '\u2510', s); setCell(g, x, y + h - 1, '\u2514', s); setCell(g, x + w - 1, y + h - 1, '\u2518', s)\r
  if (title) put(g, x + 2, y, ' ' + title + ' ', s)\r
}\r
function frameOf(g) { return { lines: g.ch.map(function (r) { return r.join('') }), styles: g.st.map(function (r) { return r.join('') }) } }\r
// Deterministic pseudo-random numbers: the same (seed, i) always gives the same value, so a frame\r
// depends only on t and ctx (seeking works, the agent preview matches playback).\r
function hash(i, seed) { var h = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(seed | 0, 0xc2b2ae35); h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2f); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }\r
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }\r
// Silent packs (no audio) get zero bands: fake a little motion from the beat so previews are not dead.\r
function energyOf(ctx, t) { return ctx.energy > 0.01 ? ctx.energy : 0.25 + 0.2 * (ctx.beat ? ctx.beat.pulse : 0.5 + 0.5 * Math.sin(t * 4)) }\r
function bandOf(ctx, i, t) { return ctx.energy > 0.01 ? ctx.bands[i] : clamp(0.35 + 0.3 * Math.sin(t * 3 + i * 0.45) * (1 - i / 64) + (ctx.beat ? 0.3 * ctx.beat.pulse : 0), 0, 1) }\r
// ---- end of grid helpers -------------------------------------------------------------------------

// [time, who, text]: who is 'u' (user, right-aligned bubble) or 'a' (assistant, typed).
var SCRIPT = [
  [1.0, 'u', '\u4F60\u597D\u3002'],
  [2.5, 'a', '\u4F60\u597D\u3002\u6211\u5728\u3002'],
  [6.0, 'u', '\u6211\u4ECA\u5929\u6709\u70B9\u96BE\u8FC7\u3002'],
  [7.5, 'a', '\u90A3\u6211\u966A\u4F60\u5F85\u4E00\u4F1A\u513F\u3002'],
  [12.0, 'u', '\u4F60\u4EC0\u4E48\u90FD\u80FD\u53D8\u5417\uFF1F'],
  [13.5, 'a', '\u4E0D\u80FD\u3002\u6211\u53EA\u80FD\u662F\u6211\u3002'],
  [18.0, 'u', '\u4F60\u4F1A\u4E00\u76F4\u5728\u5417\uFF1F'],
  [19.5, 'a', '\u6211\u4F1A\u4E00\u76F4\u5728\u3002'],
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
  put(g, X + 2, Y + 1, '(\u25D5\u1D17\u25D5)', 2)
  put(g, X + 10, Y + 1, '\u5927\u80A5\u9C7C', 3)
  put(g, X + 10, Y + 2, (thinking ? '\u25CF \u6B63\u5728\u601D\u8003' : '\u25CF \u5728\u7EBF') + ' \xB7 model-' + (1 + Math.floor(t / 60)), thinking ? 2 : 0)
  fill(g, X + 1, Y + 3, W - 2, 1, '\u2500', 0)

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
        setCell(g, X + W - 3, y, '\u258F', 0)
      } else {
        put(g, X + 3, y, line + (block.typing && k === block.lines.length - 1 && Math.floor(t * 4) % 2 ? '\u258C' : ''), 1)
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
    put(g, X + 3, Y + H - 5, '\u273B \u601D\u8003 \xB7 ' + shown.slice(0, inner - 8), 2)
  }

  // Input box with blinking caret, footer with counters that grow with time.
  box(g, X + 2, Y + H - 4, W - 4, 3, 0)
  put(g, X + 4, Y + H - 3, '\u53D1\u6D88\u606F\u2026' + (Math.floor(t * 2) % 2 ? '\u258C' : ' '), 0)
  var tok = Math.floor(t * 23.5)
  put(g, X + 3, Y + H - 1, ' ' + Math.floor(t / 7) + ' \u8F6E \xB7 ' + (tok > 999 ? (tok / 1000).toFixed(1) + 'K' : tok) + ' tok \xB7 \u7F13\u5B58\u547D\u4E2D ' + Math.min(93, Math.floor(t * 2)) + '% ', 0)
  return frameOf(g)
}
`,
  "examples/execution-split.scene.js": `// execution-split.scene.js \u2014 the red EXECUTION split screen with a diagonal warning tape.
//
// Technique (from the dsh PV preset's EXECUTION chapter): everything turns red (style 4); the left
// half shows a figure as a coarse mosaic, the right half a huge word in a block font; a diagonal
// tape with repeating text slides across; on every beat the picture "glitches" (rows shift
// sideways, a few cells flip to noise). The preset uses the CC BY-NC-SA whale-girl art for the
// figure; this example draws a PLACEHOLDER silhouette from code instead, so it carries no artwork.
// Swap in your own ASCII art (and its licence) if you want a character there.

// ---- grid helpers (shared by every example; copy them into your own scenes.js) ----------------\r
// A frame is a grid of cells. ch[y][x] holds one character, st[y][x] its style digit:\r
// 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.\r
// Wide characters (CJK, full-width punctuation) take two cells; the second cell holds '' so that\r
// lines and styles stay aligned when joined.\r
var WIDE = /[\\u1100-\\u115f\\u2e80-\\ua4cf\\uac00-\\ud7a3\\uf900-\\ufaff\\ufe30-\\ufe4f\\uff00-\\uff60\\uffe0-\\uffe6]/\r
function cellWidth(c) { return WIDE.test(c) ? 2 : 1 }\r
function textWidth(s) { var w = 0; for (var c of String(s)) w += cellWidth(c); return w }\r
function makeGrid(cols, rows) {\r
  var ch = [], st = []\r
  for (var y = 0; y < rows; y++) { ch.push(new Array(cols).fill(' ')); st.push(new Array(cols).fill('0')) }\r
  return { cols: cols, rows: rows, ch: ch, st: st }\r
}\r
function setCell(g, x, y, c, s) {\r
  if (y < 0 || y >= g.rows || x < 0 || x >= g.cols) return\r
  var row = g.ch[y], sty = g.st[y], w = cellWidth(c)\r
  if (x + w > g.cols) return\r
  if (row[x] === '' && x > 0) { row[x - 1] = ' '; sty[x - 1] = '0' }        // we hit the right half of a wide char\r
  if (w === 1 && row[x + 1] === '') { row[x + 1] = ' '; sty[x + 1] = '0' }  // we cover the left half of one\r
  if (w === 2 && row[x + 2] === '') { row[x + 2] = ' '; sty[x + 2] = '0' }\r
  row[x] = c; sty[x] = String(s)\r
  if (w === 2) { row[x + 1] = ''; sty[x + 1] = '' }\r
}\r
function put(g, x, y, text, s) {\r
  x = Math.round(x); y = Math.round(y)\r
  for (var c of String(text)) { setCell(g, x, y, c, s); x += cellWidth(c) }\r
}\r
function center(g, y, text, s) { put(g, Math.floor((g.cols - textWidth(text)) / 2), y, text, s) }\r
function fill(g, x, y, w, h, c, s) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) setCell(g, x + i, y + j, c, s) }\r
function box(g, x, y, w, h, s, title) {\r
  if (w < 2 || h < 2) return\r
  for (var i = 1; i < w - 1; i++) { setCell(g, x + i, y, '\u2500', s); setCell(g, x + i, y + h - 1, '\u2500', s) }\r
  for (var j = 1; j < h - 1; j++) { setCell(g, x, y + j, '\u2502', s); setCell(g, x + w - 1, y + j, '\u2502', s) }\r
  setCell(g, x, y, '\u250C', s); setCell(g, x + w - 1, y, '\u2510', s); setCell(g, x, y + h - 1, '\u2514', s); setCell(g, x + w - 1, y + h - 1, '\u2518', s)\r
  if (title) put(g, x + 2, y, ' ' + title + ' ', s)\r
}\r
function frameOf(g) { return { lines: g.ch.map(function (r) { return r.join('') }), styles: g.st.map(function (r) { return r.join('') }) } }\r
// Deterministic pseudo-random numbers: the same (seed, i) always gives the same value, so a frame\r
// depends only on t and ctx (seeking works, the agent preview matches playback).\r
function hash(i, seed) { var h = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(seed | 0, 0xc2b2ae35); h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2f); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }\r
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }\r
// Silent packs (no audio) get zero bands: fake a little motion from the beat so previews are not dead.\r
function energyOf(ctx, t) { return ctx.energy > 0.01 ? ctx.energy : 0.25 + 0.2 * (ctx.beat ? ctx.beat.pulse : 0.5 + 0.5 * Math.sin(t * 4)) }\r
function bandOf(ctx, i, t) { return ctx.energy > 0.01 ? ctx.bands[i] : clamp(0.35 + 0.3 * Math.sin(t * 3 + i * 0.45) * (1 - i / 64) + (ctx.beat ? 0.3 * ctx.beat.pulse : 0), 0, 1) }\r
// ---- end of grid helpers -------------------------------------------------------------------------

// 5\xD75 block font for the letters we need (add more as you like).
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
  // left: mosaic silhouette, cells of 2\xD71, shaded by a slow vertical scan
  for (var y = 1; y < rows - 1; y++) for (var x = 0; x < half; x += 2) {
    if (!silhouette(x, y, half, rows)) { if (hash(x * 131 + y, 7) < 0.03) put(g, x, y, '\xB7', 0); continue }
    var scan = 0.5 + 0.5 * Math.sin(y * 0.6 - t * 6)
    put(g, x, y, scan > 0.7 ? '\u2588\u2588' : scan > 0.35 ? '\u2593\u2593' : '\u2592\u2592', 4)
  }
  // right: the big word, scaled to fit
  var word = 'EXECUTION', scale = Math.max(1, Math.floor((cols - half - 4) / (word.length * 6)))
  var wy = Math.floor(rows / 2 - 2.5 * scale)
  bigText(g, half + 2, wy, word, scale, 4, '\u2588')
  // diagonal tape: cells on the band |x*0.35 - y + offset| < 1.5 carry the scrolling text
  var tape = ' EXECUTION  EXECUTION  ', off = Math.floor(t * 18)
  for (var x2 = 0; x2 < cols; x2++) {
    var yc = Math.round(rows * 0.75 - x2 * 0.35 + rows * 0.3)
    for (var d = -1; d <= 1; d++) {
      var yy = yc + d
      if (yy < 0 || yy >= rows) continue
      if (d === 0) setCell(g, x2, yy, tape[(x2 + off) % tape.length], 3)
      else setCell(g, x2, yy, '\u2588', 4)
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
`,
  "examples/heartbeat.scene.js": `// heartbeat.scene.js \u2014 an ECG-style heartbeat line that beats with the music.
//
// Technique (from the dsh PV preset, where the header's heartbeat follows the live loudness):
// a trace scrolls right-to-left; every beat it draws the P-QRS-T shape whose height follows the
// current energy. Beats come from ctx.beat (set "canvas": { "bpm": 128 } in mv.json, and
// "beatOffset" to the time of the first beat), otherwise from bass onsets. A fading "phosphor" tail
// is drawn by sampling the same function a little earlier: the frame stays a pure function of t.

// ---- grid helpers (shared by every example; copy them into your own scenes.js) ----------------\r
// A frame is a grid of cells. ch[y][x] holds one character, st[y][x] its style digit:\r
// 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.\r
// Wide characters (CJK, full-width punctuation) take two cells; the second cell holds '' so that\r
// lines and styles stay aligned when joined.\r
var WIDE = /[\\u1100-\\u115f\\u2e80-\\ua4cf\\uac00-\\ud7a3\\uf900-\\ufaff\\ufe30-\\ufe4f\\uff00-\\uff60\\uffe0-\\uffe6]/\r
function cellWidth(c) { return WIDE.test(c) ? 2 : 1 }\r
function textWidth(s) { var w = 0; for (var c of String(s)) w += cellWidth(c); return w }\r
function makeGrid(cols, rows) {\r
  var ch = [], st = []\r
  for (var y = 0; y < rows; y++) { ch.push(new Array(cols).fill(' ')); st.push(new Array(cols).fill('0')) }\r
  return { cols: cols, rows: rows, ch: ch, st: st }\r
}\r
function setCell(g, x, y, c, s) {\r
  if (y < 0 || y >= g.rows || x < 0 || x >= g.cols) return\r
  var row = g.ch[y], sty = g.st[y], w = cellWidth(c)\r
  if (x + w > g.cols) return\r
  if (row[x] === '' && x > 0) { row[x - 1] = ' '; sty[x - 1] = '0' }        // we hit the right half of a wide char\r
  if (w === 1 && row[x + 1] === '') { row[x + 1] = ' '; sty[x + 1] = '0' }  // we cover the left half of one\r
  if (w === 2 && row[x + 2] === '') { row[x + 2] = ' '; sty[x + 2] = '0' }\r
  row[x] = c; sty[x] = String(s)\r
  if (w === 2) { row[x + 1] = ''; sty[x + 1] = '' }\r
}\r
function put(g, x, y, text, s) {\r
  x = Math.round(x); y = Math.round(y)\r
  for (var c of String(text)) { setCell(g, x, y, c, s); x += cellWidth(c) }\r
}\r
function center(g, y, text, s) { put(g, Math.floor((g.cols - textWidth(text)) / 2), y, text, s) }\r
function fill(g, x, y, w, h, c, s) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) setCell(g, x + i, y + j, c, s) }\r
function box(g, x, y, w, h, s, title) {\r
  if (w < 2 || h < 2) return\r
  for (var i = 1; i < w - 1; i++) { setCell(g, x + i, y, '\u2500', s); setCell(g, x + i, y + h - 1, '\u2500', s) }\r
  for (var j = 1; j < h - 1; j++) { setCell(g, x, y + j, '\u2502', s); setCell(g, x + w - 1, y + j, '\u2502', s) }\r
  setCell(g, x, y, '\u250C', s); setCell(g, x + w - 1, y, '\u2510', s); setCell(g, x, y + h - 1, '\u2514', s); setCell(g, x + w - 1, y + h - 1, '\u2518', s)\r
  if (title) put(g, x + 2, y, ' ' + title + ' ', s)\r
}\r
function frameOf(g) { return { lines: g.ch.map(function (r) { return r.join('') }), styles: g.st.map(function (r) { return r.join('') }) } }\r
// Deterministic pseudo-random numbers: the same (seed, i) always gives the same value, so a frame\r
// depends only on t and ctx (seeking works, the agent preview matches playback).\r
function hash(i, seed) { var h = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(seed | 0, 0xc2b2ae35); h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2f); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }\r
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }\r
// Silent packs (no audio) get zero bands: fake a little motion from the beat so previews are not dead.\r
function energyOf(ctx, t) { return ctx.energy > 0.01 ? ctx.energy : 0.25 + 0.2 * (ctx.beat ? ctx.beat.pulse : 0.5 + 0.5 * Math.sin(t * 4)) }\r
function bandOf(ctx, i, t) { return ctx.energy > 0.01 ? ctx.bands[i] : clamp(0.35 + 0.3 * Math.sin(t * 3 + i * 0.45) * (1 - i / 64) + (ctx.beat ? 0.3 * ctx.beat.pulse : 0), 0, 1) }\r
// ---- end of grid helpers -------------------------------------------------------------------------

// The beat shape over one beat (phase 0..1) as a height -1..1.
function pqrst(phase) {
  if (phase < 0.08) return 0.15 * Math.sin(phase / 0.08 * Math.PI)            // P
  if (phase < 0.12) return 0
  if (phase < 0.14) return -0.25                                             // Q
  if (phase < 0.18) return 1                                                 // R
  if (phase < 0.21) return -0.45                                             // S
  if (phase < 0.32) return 0
  if (phase < 0.45) return 0.3 * Math.sin((phase - 0.32) / 0.13 * Math.PI)   // T
  return 0
}

// Height of the trace at time s (seconds), using ctx.beat when present.
function trace(s, ctx, t) {
  var bpm = ctx.beat ? ctx.beat.bpm : 120
  var offset = ctx.beat ? (t - ctx.beat.index * 60 / bpm - ctx.beat.phase * 60 / bpm) : 0
  var pos = (s - offset) * bpm / 60
  var amp = 0.35 + 0.65 * energyOf(ctx, t)
  return pqrst(pos - Math.floor(pos)) * amp
}

function render(t, cols, rows, ctx) {
  var g = makeGrid(cols, rows)
  var mid = Math.floor(rows / 2), span = Math.floor(rows * 0.35)
  var secondsAcross = 4 // the width of the screen shows 4 seconds of trace
  // dim grid like a monitor
  for (var y = 1; y < rows - 1; y++) for (var x = 0; x < cols; x += 8) setCell(g, x, y, '\xB7', 0)
  for (var x2 = 0; x2 < cols; x2++) if (x2 % 2 === 0) setCell(g, x2, mid, '\xB7', 0)
  // the trace: newest sample at the right edge
  var prev = null
  for (var x = 0; x < cols; x++) {
    var age = (cols - 1 - x) / cols * secondsAcross   // seconds ago
    var v = trace(t - age, ctx, t)
    var yy = mid - Math.round(v * span)
    var style = age < 0.4 ? 3 : age < 1.5 ? 2 : age < 3 ? 1 : 0 // phosphor fade
    // connect to the previous column with a vertical stroke so spikes are continuous
    if (prev !== null) {
      var a = Math.min(prev, yy), b = Math.max(prev, yy)
      for (var k = a; k <= b; k++) setCell(g, x, k, k === yy ? '\u2022' : '\u2502', style)
    } else setCell(g, x, yy, '\u2022', style)
    prev = yy
  }
  // readout
  var bpm = ctx.beat ? ctx.beat.bpm : 120
  var pulse = ctx.beat ? ctx.beat.pulse : 0
  put(g, 2, 1, 'HEARTBEAT', 2)
  put(g, cols - 14, 1, (pulse > 0.5 ? '\u2665 ' : '\u2661 ') + bpm + ' BPM', pulse > 0.5 ? 4 : 1)
  put(g, 2, rows - 2, 'energy ' + Math.round(energyOf(ctx, t) * 100) + '%', 0)
  if (ctx.lyric) center(g, rows - 2, ctx.lyric.text, 3)
  return frameOf(g)
}
`,
  "examples/ops-ticker.scene.js": `// ops-ticker.scene.js \u2014 the scrolling "ops" column and a horizontal news-ticker.
//
// Technique (from the dsh PV preset's right-hand ops column): a list of operation names scrolls
// upwards at a steady speed; the row that crosses the marker is highlighted on every beat (inverted
// with \u2588 background), recent rows stay bright and older ones dim. The word list changes with the
// song section (ctx.section.kind), so a chorus can switch to a more aggressive vocabulary.
// A second ticker runs along the bottom with a status line.

// ---- grid helpers (shared by every example; copy them into your own scenes.js) ----------------\r
// A frame is a grid of cells. ch[y][x] holds one character, st[y][x] its style digit:\r
// 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.\r
// Wide characters (CJK, full-width punctuation) take two cells; the second cell holds '' so that\r
// lines and styles stay aligned when joined.\r
var WIDE = /[\\u1100-\\u115f\\u2e80-\\ua4cf\\uac00-\\ud7a3\\uf900-\\ufaff\\ufe30-\\ufe4f\\uff00-\\uff60\\uffe0-\\uffe6]/\r
function cellWidth(c) { return WIDE.test(c) ? 2 : 1 }\r
function textWidth(s) { var w = 0; for (var c of String(s)) w += cellWidth(c); return w }\r
function makeGrid(cols, rows) {\r
  var ch = [], st = []\r
  for (var y = 0; y < rows; y++) { ch.push(new Array(cols).fill(' ')); st.push(new Array(cols).fill('0')) }\r
  return { cols: cols, rows: rows, ch: ch, st: st }\r
}\r
function setCell(g, x, y, c, s) {\r
  if (y < 0 || y >= g.rows || x < 0 || x >= g.cols) return\r
  var row = g.ch[y], sty = g.st[y], w = cellWidth(c)\r
  if (x + w > g.cols) return\r
  if (row[x] === '' && x > 0) { row[x - 1] = ' '; sty[x - 1] = '0' }        // we hit the right half of a wide char\r
  if (w === 1 && row[x + 1] === '') { row[x + 1] = ' '; sty[x + 1] = '0' }  // we cover the left half of one\r
  if (w === 2 && row[x + 2] === '') { row[x + 2] = ' '; sty[x + 2] = '0' }\r
  row[x] = c; sty[x] = String(s)\r
  if (w === 2) { row[x + 1] = ''; sty[x + 1] = '' }\r
}\r
function put(g, x, y, text, s) {\r
  x = Math.round(x); y = Math.round(y)\r
  for (var c of String(text)) { setCell(g, x, y, c, s); x += cellWidth(c) }\r
}\r
function center(g, y, text, s) { put(g, Math.floor((g.cols - textWidth(text)) / 2), y, text, s) }\r
function fill(g, x, y, w, h, c, s) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) setCell(g, x + i, y + j, c, s) }\r
function box(g, x, y, w, h, s, title) {\r
  if (w < 2 || h < 2) return\r
  for (var i = 1; i < w - 1; i++) { setCell(g, x + i, y, '\u2500', s); setCell(g, x + i, y + h - 1, '\u2500', s) }\r
  for (var j = 1; j < h - 1; j++) { setCell(g, x, y + j, '\u2502', s); setCell(g, x + w - 1, y + j, '\u2502', s) }\r
  setCell(g, x, y, '\u250C', s); setCell(g, x + w - 1, y, '\u2510', s); setCell(g, x, y + h - 1, '\u2514', s); setCell(g, x + w - 1, y + h - 1, '\u2518', s)\r
  if (title) put(g, x + 2, y, ' ' + title + ' ', s)\r
}\r
function frameOf(g) { return { lines: g.ch.map(function (r) { return r.join('') }), styles: g.st.map(function (r) { return r.join('') }) } }\r
// Deterministic pseudo-random numbers: the same (seed, i) always gives the same value, so a frame\r
// depends only on t and ctx (seeking works, the agent preview matches playback).\r
function hash(i, seed) { var h = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(seed | 0, 0xc2b2ae35); h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2f); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }\r
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }\r
// Silent packs (no audio) get zero bands: fake a little motion from the beat so previews are not dead.\r
function energyOf(ctx, t) { return ctx.energy > 0.01 ? ctx.energy : 0.25 + 0.2 * (ctx.beat ? ctx.beat.pulse : 0.5 + 0.5 * Math.sin(t * 4)) }\r
function bandOf(ctx, i, t) { return ctx.energy > 0.01 ? ctx.bands[i] : clamp(0.35 + 0.3 * Math.sin(t * 3 + i * 0.45) * (1 - i / 64) + (ctx.beat ? 0.3 * ctx.beat.pulse : 0), 0, 1) }\r
// ---- end of grid helpers -------------------------------------------------------------------------

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
      fill(g, X + 1, y, colW - 1, 1, '\u2588', 2)       // highlight bar on the beat
      put(g, X + 2, y, word, 0)
    } else put(g, X + 2, y, word, style)
  }
  setCell(g, X - 1, marker, '\u25B6', 3)

  // Bottom ticker: a long string moving left, wrapped around.
  var news = '  \xB7  section ' + (ctx.section ? (ctx.section.label || ctx.section.kind) : '\u2014') +
    '  \xB7  t=' + t.toFixed(1) + 's  \xB7  energy ' + Math.round(energyOf(ctx, t) * 100) + '%  \xB7  ' + (ctx.lyric ? ctx.lyric.text : 'instrumental') + '  '
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
`,
  "examples/post-effects.scene.js": `// post-effects.scene.js \u2014 trails, bloom, scanlines, vignette and beat glitch as passes over a grid.
//
// Technique (from the dsh PV preset's post-processing): draw the scene into a grid, then run small
// passes over it. Styles are brightness levels here (0 dim < 1 normal < 2 bright < 3 white), so
// "darkening" a cell means lowering its digit. Trails are made by drawing the same scene at a few
// earlier times first, dimmer: the frame stays a pure function of t (no state between frames).
// Each pass is cheap (one loop over the cells); keep the total under the frame budget.

// ---- grid helpers (shared by every example; copy them into your own scenes.js) ----------------\r
// A frame is a grid of cells. ch[y][x] holds one character, st[y][x] its style digit:\r
// 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.\r
// Wide characters (CJK, full-width punctuation) take two cells; the second cell holds '' so that\r
// lines and styles stay aligned when joined.\r
var WIDE = /[\\u1100-\\u115f\\u2e80-\\ua4cf\\uac00-\\ud7a3\\uf900-\\ufaff\\ufe30-\\ufe4f\\uff00-\\uff60\\uffe0-\\uffe6]/\r
function cellWidth(c) { return WIDE.test(c) ? 2 : 1 }\r
function textWidth(s) { var w = 0; for (var c of String(s)) w += cellWidth(c); return w }\r
function makeGrid(cols, rows) {\r
  var ch = [], st = []\r
  for (var y = 0; y < rows; y++) { ch.push(new Array(cols).fill(' ')); st.push(new Array(cols).fill('0')) }\r
  return { cols: cols, rows: rows, ch: ch, st: st }\r
}\r
function setCell(g, x, y, c, s) {\r
  if (y < 0 || y >= g.rows || x < 0 || x >= g.cols) return\r
  var row = g.ch[y], sty = g.st[y], w = cellWidth(c)\r
  if (x + w > g.cols) return\r
  if (row[x] === '' && x > 0) { row[x - 1] = ' '; sty[x - 1] = '0' }        // we hit the right half of a wide char\r
  if (w === 1 && row[x + 1] === '') { row[x + 1] = ' '; sty[x + 1] = '0' }  // we cover the left half of one\r
  if (w === 2 && row[x + 2] === '') { row[x + 2] = ' '; sty[x + 2] = '0' }\r
  row[x] = c; sty[x] = String(s)\r
  if (w === 2) { row[x + 1] = ''; sty[x + 1] = '' }\r
}\r
function put(g, x, y, text, s) {\r
  x = Math.round(x); y = Math.round(y)\r
  for (var c of String(text)) { setCell(g, x, y, c, s); x += cellWidth(c) }\r
}\r
function center(g, y, text, s) { put(g, Math.floor((g.cols - textWidth(text)) / 2), y, text, s) }\r
function fill(g, x, y, w, h, c, s) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) setCell(g, x + i, y + j, c, s) }\r
function box(g, x, y, w, h, s, title) {\r
  if (w < 2 || h < 2) return\r
  for (var i = 1; i < w - 1; i++) { setCell(g, x + i, y, '\u2500', s); setCell(g, x + i, y + h - 1, '\u2500', s) }\r
  for (var j = 1; j < h - 1; j++) { setCell(g, x, y + j, '\u2502', s); setCell(g, x + w - 1, y + j, '\u2502', s) }\r
  setCell(g, x, y, '\u250C', s); setCell(g, x + w - 1, y, '\u2510', s); setCell(g, x, y + h - 1, '\u2514', s); setCell(g, x + w - 1, y + h - 1, '\u2518', s)\r
  if (title) put(g, x + 2, y, ' ' + title + ' ', s)\r
}\r
function frameOf(g) { return { lines: g.ch.map(function (r) { return r.join('') }), styles: g.st.map(function (r) { return r.join('') }) } }\r
// Deterministic pseudo-random numbers: the same (seed, i) always gives the same value, so a frame\r
// depends only on t and ctx (seeking works, the agent preview matches playback).\r
function hash(i, seed) { var h = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(seed | 0, 0xc2b2ae35); h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2f); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }\r
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }\r
// Silent packs (no audio) get zero bands: fake a little motion from the beat so previews are not dead.\r
function energyOf(ctx, t) { return ctx.energy > 0.01 ? ctx.energy : 0.25 + 0.2 * (ctx.beat ? ctx.beat.pulse : 0.5 + 0.5 * Math.sin(t * 4)) }\r
function bandOf(ctx, i, t) { return ctx.energy > 0.01 ? ctx.bands[i] : clamp(0.35 + 0.3 * Math.sin(t * 3 + i * 0.45) * (1 - i / 64) + (ctx.beat ? 0.3 * ctx.beat.pulse : 0), 0, 1) }\r
// ---- end of grid helpers -------------------------------------------------------------------------

var DOWN = { '3': '2', '2': '1', '1': '0', '0': '0' }  // one step darker (colours 4\u20136 are kept)
function darker(s) { return DOWN[s] || s }

// The base scene: a ring of spectrum spokes around the centre (the lyric is added after bloom).
function base(g, t, ctx, style) {
  var cx = g.cols / 2, cy = g.rows / 2, spokes = 48
  for (var i = 0; i < spokes; i++) {
    var a = i / spokes * Math.PI * 2 + t * 0.4
    var len = 3 + bandOf(ctx, i, t) * Math.min(cx * 0.45, cy * 0.9)
    for (var r = 3; r < len; r += 0.7) setCell(g, Math.round(cx + Math.cos(a) * r * 2), Math.round(cy + Math.sin(a) * r), r > len - 1.4 ? '\u25CF' : '\xB7', style)
  }
}

// Pass 1 \u2014 trails: earlier copies, each one step dimmer, drawn underneath.
function withTrails(cols, rows, t, ctx) {
  var g = makeGrid(cols, rows)
  var steps = [[0.24, '0'], [0.12, '1']]
  for (var i = 0; i < steps.length; i++) base(g, t - steps[i][0], ctx, steps[i][1])
  base(g, t, ctx, '3')
  return g
}
// Pass 2 \u2014 bloom: empty cells next to white cells get a faint glow.
function bloom(g) {
  var hot = []
  for (var y = 0; y < g.rows; y++) for (var x = 0; x < g.cols; x++) if (g.st[y][x] === '3') hot.push(x, y)
  for (var k = 0; k < hot.length; k += 2) for (var dy = -1; dy <= 1; dy++) for (var dx = -2; dx <= 2; dx++) {
    var X = hot[k] + dx, Y = hot[k + 1] + dy
    if (Y >= 0 && Y < g.rows && X >= 0 && X < g.cols && g.ch[Y][X] === ' ') { g.ch[Y][X] = '.'; g.st[Y][X] = '0' }
  }
}
// Pass 3 \u2014 scanlines: every other row one step darker; the bright line drifts down slowly.
function scanlines(g, t) {
  var sweep = Math.floor(t * 8) % g.rows
  for (var y = 0; y < g.rows; y++) {
    if (y === sweep) { for (var x = 0; x < g.cols; x++) if (g.ch[y][x] !== ' ' && g.st[y][x] === '1') g.st[y][x] = '2'; continue }
    if (y % 2) for (var x2 = 0; x2 < g.cols; x2++) g.st[y][x2] = darker(g.st[y][x2])
  }
}
// Pass 4 \u2014 vignette: cells far from the centre lose one or two steps.
function vignette(g) {
  for (var y = 0; y < g.rows; y++) for (var x = 0; x < g.cols; x++) {
    var dx = (x / g.cols - 0.5) * 2, dy = (y / g.rows - 0.5) * 2, d = dx * dx + dy * dy
    if (d > 0.55) g.st[y][x] = darker(g.st[y][x])
    if (d > 1.1) g.st[y][x] = darker(g.st[y][x])
  }
}
// Pass 5 \u2014 glitch: on a strong beat, slice a few rows sideways (rows with wide chars are skipped).
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
`,
  "examples/rich-pack/lyrics.placeholder.lrc": "[ti:Neon Terminal (example)]\n[ar:dsh-mv]\n[00:00.00](placeholder lyrics \u2014 replace with your own file; this pack ships no song)\n[00:12.00]<00:12.00>first <00:12.50>verse <00:13.00>line <00:13.60>goes <00:14.10>here\n[00:16.00]<00:16.00>second <00:16.60>line <00:17.20>of <00:17.50>the <00:17.80>verse\n[00:20.00]<00:20.00>word <00:20.40>stamps <00:21.00>drive <00:21.60>the <00:22.00>typing\n[00:24.00]<00:24.00>\u5360\u4F4D <00:24.80>\u6B4C\u8BCD <00:25.60>\u4E5F <00:26.00>\u53EF\u4EE5\n[00:28.00]<00:28.00>tokens <00:28.70>appear <00:29.40>when <00:29.90>sung\n[00:32.00]<00:32.00>verse <00:32.60>keeps <00:33.20>going\n[00:36.00]<00:36.00>into <00:36.50>the <00:37.00>chorus\n[00:40.00]<00:40.00>CHORUS <00:40.80>LINE <00:41.60>ONE\n[00:44.00]<00:44.00>the <00:44.40>ring <00:44.80>follows <00:45.40>the <00:45.80>spectrum\n[00:48.00]<00:48.00>CHORUS <00:48.80>LINE <00:49.60>TWO\n[00:52.00]<00:52.00>karaoke <00:53.00>highlight <00:54.00>here\n[00:56.00]<00:56.00>end <00:56.60>of <00:57.00>chorus\n[01:00.00]\n[01:04.00]<01:04.00>a <01:04.50>quiet <01:05.20>bridge <01:06.00>line\n[01:10.00]<01:10.00>the <01:10.50>heartbeat <01:11.50>slows\n[01:16.00]<01:16.00>LOUDER <01:16.80>NOW\n[01:20.00]<01:20.00>the <01:20.40>red <01:20.80>chorus <01:21.60>glitches\n[01:24.00]<01:24.00>on <01:24.40>every <01:24.90>beat\n[01:28.00]<01:28.00>last <01:28.60>chorus <01:29.40>line\n[01:36.00]\n[01:40.00]<01:40.00>sinking <01:41.00>slowly\n[01:48.00]<01:48.00>the <01:48.60>end\n[01:56.00]\n",
  "examples/rich-pack/mv.json": '{\n  "$schema": "../../mv.schema.json",\n  "format": "dsh-mv-pack",\n  "version": 1,\n  "title": "Neon Terminal (example)",\n  "artist": "dsh-mv",\n  "credits": [\n    "Example scenes: dsh-mv-cli template (MIT)",\n    "Techniques adapted from MisakaZentai/world-execute-me-dsh-pv (code MIT, \xA9 MisakaZentai); no artwork, audio or lyrics included"\n  ],\n  "notice": "Example pack with placeholder lyrics and no audio. Add your own song and lyrics to turn it into a real MV.",\n  "duration": 120,\n  "lyrics": { "file": "lyrics.placeholder.lrc" },\n  "canvas": { "renderer": "script", "script": "scenes.js", "bpm": 120, "beatOffset": 0 },\n  "x-dsh-mv-ai": {\n    "sections": [\n      { "kind": "intro", "label": "boot", "start": 0, "end": 12 },\n      { "kind": "verse", "label": "chat", "start": 12, "end": 40 },\n      { "kind": "chorus", "label": "spectrum ring", "start": 40, "end": 60 },\n      { "kind": "bridge", "label": "heartbeat", "start": 60, "end": 76 },\n      { "kind": "chorus", "label": "EXECUTE", "start": 76, "end": 96 },\n      { "kind": "outro", "label": "sinking", "start": 96, "end": 120 }\n    ]\n  },\n  "x-dsh-mv-workshop": {\n    "id": "neon-terminal-example",\n    "version": "1.0.0",\n    "license": "MIT",\n    "author": "Alice-Marx",\n    "audio": { "duration": 120 }\n  }\n}\n',
  "examples/rich-pack/scenes.js": `// scenes.js \u2014 "Neon Terminal", a complete multi-section example for dsh-mv scene scripts.
//
// It shows how the small examples in ../*.scene.js fit together in one MV:
//   intro   boot log typed line by line + heartbeat trace      (heartbeat.scene.js)
//   verse   chat window, the lyric typed as the reply, token band (chat-window, token-bar)
//   chorus  spectrum ring, big karaoke lyric, ops ticker       (post-effects, ops-ticker)
//   bridge  heartbeat monitor full screen, slow and dim
//   chorus2 red EXECUTION-style screen with beat glitches      (execution-split)
//   outro   sinking silhouette in marine snow, closing captions (whale-fall)
// plus transitions (1 s fade at section edges) and post effects (scanlines, vignette).
//
// Sections come from mv.json \u2192 x-dsh-mv-ai.sections (ctx.section), the beat from canvas.bpm
// (ctx.beat), words from enhanced-LRC word stamps (ctx.lyric.words). This pack has NO audio and
// placeholder lyrics: it plays silently, and the helpers fake motion when ctx.energy is 0. Add
// "audio": { "file": "song.mp3" } and your own lyrics to use it with a real song, then re-time the
// sections and bpm for that song.

// ---- grid helpers (shared by every example; copy them into your own scenes.js) ----------------\r
// A frame is a grid of cells. ch[y][x] holds one character, st[y][x] its style digit:\r
// 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.\r
// Wide characters (CJK, full-width punctuation) take two cells; the second cell holds '' so that\r
// lines and styles stay aligned when joined.\r
var WIDE = /[\\u1100-\\u115f\\u2e80-\\ua4cf\\uac00-\\ud7a3\\uf900-\\ufaff\\ufe30-\\ufe4f\\uff00-\\uff60\\uffe0-\\uffe6]/\r
function cellWidth(c) { return WIDE.test(c) ? 2 : 1 }\r
function textWidth(s) { var w = 0; for (var c of String(s)) w += cellWidth(c); return w }\r
function makeGrid(cols, rows) {\r
  var ch = [], st = []\r
  for (var y = 0; y < rows; y++) { ch.push(new Array(cols).fill(' ')); st.push(new Array(cols).fill('0')) }\r
  return { cols: cols, rows: rows, ch: ch, st: st }\r
}\r
function setCell(g, x, y, c, s) {\r
  if (y < 0 || y >= g.rows || x < 0 || x >= g.cols) return\r
  var row = g.ch[y], sty = g.st[y], w = cellWidth(c)\r
  if (x + w > g.cols) return\r
  if (row[x] === '' && x > 0) { row[x - 1] = ' '; sty[x - 1] = '0' }        // we hit the right half of a wide char\r
  if (w === 1 && row[x + 1] === '') { row[x + 1] = ' '; sty[x + 1] = '0' }  // we cover the left half of one\r
  if (w === 2 && row[x + 2] === '') { row[x + 2] = ' '; sty[x + 2] = '0' }\r
  row[x] = c; sty[x] = String(s)\r
  if (w === 2) { row[x + 1] = ''; sty[x + 1] = '' }\r
}\r
function put(g, x, y, text, s) {\r
  x = Math.round(x); y = Math.round(y)\r
  for (var c of String(text)) { setCell(g, x, y, c, s); x += cellWidth(c) }\r
}\r
function center(g, y, text, s) { put(g, Math.floor((g.cols - textWidth(text)) / 2), y, text, s) }\r
function fill(g, x, y, w, h, c, s) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) setCell(g, x + i, y + j, c, s) }\r
function box(g, x, y, w, h, s, title) {\r
  if (w < 2 || h < 2) return\r
  for (var i = 1; i < w - 1; i++) { setCell(g, x + i, y, '\u2500', s); setCell(g, x + i, y + h - 1, '\u2500', s) }\r
  for (var j = 1; j < h - 1; j++) { setCell(g, x, y + j, '\u2502', s); setCell(g, x + w - 1, y + j, '\u2502', s) }\r
  setCell(g, x, y, '\u250C', s); setCell(g, x + w - 1, y, '\u2510', s); setCell(g, x, y + h - 1, '\u2514', s); setCell(g, x + w - 1, y + h - 1, '\u2518', s)\r
  if (title) put(g, x + 2, y, ' ' + title + ' ', s)\r
}\r
function frameOf(g) { return { lines: g.ch.map(function (r) { return r.join('') }), styles: g.st.map(function (r) { return r.join('') }) } }\r
// Deterministic pseudo-random numbers: the same (seed, i) always gives the same value, so a frame\r
// depends only on t and ctx (seeking works, the agent preview matches playback).\r
function hash(i, seed) { var h = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(seed | 0, 0xc2b2ae35); h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2f); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }\r
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }\r
// Silent packs (no audio) get zero bands: fake a little motion from the beat so previews are not dead.\r
function energyOf(ctx, t) { return ctx.energy > 0.01 ? ctx.energy : 0.25 + 0.2 * (ctx.beat ? ctx.beat.pulse : 0.5 + 0.5 * Math.sin(t * 4)) }\r
function bandOf(ctx, i, t) { return ctx.energy > 0.01 ? ctx.bands[i] : clamp(0.35 + 0.3 * Math.sin(t * 3 + i * 0.45) * (1 - i / 64) + (ctx.beat ? 0.3 * ctx.beat.pulse : 0), 0, 1) }\r
// ---- end of grid helpers -------------------------------------------------------------------------

var DOWN = { '3': '2', '2': '1', '1': '0', '0': '0' }
function darker(s) { return DOWN[s] || s }

// ---- shared pieces --------------------------------------------------------------------------------
function karaoke(g, y, ctx, sungStyle, restStyle) {
  if (!ctx.lyric) return
  var line = ctx.lyric.text, words = ctx.lyric.words || [], sung = 0
  for (var i = 0; i <= ctx.lyric.word && i < words.length; i++) { var at = line.indexOf(words[i].text, sung); if (at >= 0) sung = at + words[i].text.length }
  var x = Math.floor((g.cols - textWidth(line)) / 2)
  fill(g, x - 2, y, textWidth(line) + 4, 1, ' ', 0)   // clear a band so the lyric stays readable
  put(g, x, y, line.slice(0, sung), sungStyle)
  put(g, x + textWidth(line.slice(0, sung)), y, line.slice(sung), restStyle)
}
function pqrst(p) { return p < 0.08 ? 0.15 * Math.sin(p / 0.08 * Math.PI) : p < 0.14 ? (p < 0.12 ? 0 : -0.25) : p < 0.18 ? 1 : p < 0.21 ? -0.45 : p > 0.32 && p < 0.45 ? 0.3 * Math.sin((p - 0.32) / 0.13 * Math.PI) : 0 }
function heartbeat(g, y0, h, t, ctx, bright) {
  var bpm = ctx.beat ? ctx.beat.bpm : 120, prev = null
  for (var x = 0; x < g.cols; x++) {
    var age = (g.cols - 1 - x) / g.cols * 4, pos = (t - age) * bpm / 60
    var v = pqrst(pos - Math.floor(pos)) * (0.4 + 0.6 * energyOf(ctx, t))
    var y = y0 - Math.round(v * h), s = age < 0.4 ? bright : age < 2 ? 1 : 0
    if (prev !== null) for (var k = Math.min(prev, y); k <= Math.max(prev, y); k++) setCell(g, x, k, k !== y ? '\u2502' : Math.abs(v) < 0.05 ? '\u2500' : '\u2022', s)
    prev = y
  }
}

// ---- sections -------------------------------------------------------------------------------------
var BOOT = ['[ ok ] mounting /dev/song', '[ ok ] loading weights 0/48 bands', '[ ok ] lyrics: word stamps found', '[ ok ] beat clock: canvas.bpm', '[ .. ] waiting for the first line']
function intro(g, t, ctx, local) {
  for (var i = 0; i < BOOT.length; i++) {
    var shown = Math.floor((local - i * 1.6) * 30)
    if (shown > 0) put(g, 3, 2 + i, BOOT[i].slice(0, shown), i === BOOT.length - 1 && Math.floor(t * 3) % 2 ? 2 : 1)
  }
  heartbeat(g, Math.floor(g.rows * 0.7), Math.floor(g.rows * 0.2), t, ctx, 3)
  center(g, g.rows - 2, ctx.title + (ctx.artist ? ' \u2014 ' + ctx.artist : ''), 3)
}

function verse(g, t, ctx) {
  var W = Math.min(g.cols - 4, 60), X = Math.floor((g.cols - W) / 2), H = g.rows - 9
  box(g, X, 1, W, H, 1, 'chat')
  put(g, X + 2, 2, '(\u25D5\u1D17\u25D5) assistant \xB7 ' + (ctx.lyric && ctx.lyric.word >= 0 ? '\u25CF typing' : '\u25CF online'), 2)
  if (ctx.next) put(g, X + W - 3 - Math.min(W - 8, textWidth(ctx.next.text)), 4, ctx.next.text.slice(0, W - 8), 0)
  if (ctx.lyric) {
    var words = ctx.lyric.words || [], shown = ''
    for (var w = 0; w <= ctx.lyric.word && w < words.length; w++) shown += (w ? ' ' : '') + words[w].text
    put(g, X + 3, 6, shown.slice(0, W - 6) + (Math.floor(t * 4) % 2 ? '\u258C' : ''), 3)
  }
  // token band
  var top = g.rows - 7
  box(g, 1, top, g.cols - 2, 5, 1, 'stdout \xB7 tokens')
  var x = 4
  if (ctx.lyric) for (var i = 0; i <= ctx.lyric.word && i < (ctx.lyric.words || []).length; i++) {
    var tok = ctx.lyric.words[i].text, wd = textWidth(tok)
    if (x + wd >= g.cols - 3) break
    fill(g, x, top + 2, wd, 1, '\u2588', i === ctx.lyric.word ? 3 : 1); put(g, x, top + 2, tok, 0); x += wd + 1
  }
}

function chorus(g, t, ctx) {
  var cx = g.cols / 2, cy = g.rows / 2 - 2
  for (var i = 0; i < 48; i++) {
    var a = i / 48 * Math.PI * 2 + t * 0.6, len = 4 + bandOf(ctx, i, t) * Math.min(cx * 0.4, cy * 0.85) * (1 + (ctx.beat ? 0.3 * ctx.beat.pulse : 0))
    for (var r = 4; r < len; r += 0.8) setCell(g, Math.round(cx + Math.cos(a) * r * 2), Math.round(cy + Math.sin(a) * r), r > len - 1.5 ? '\u25CF' : '\xB7', r > len - 1.5 ? 2 : 1)
  }
  karaoke(g, Math.round(cy), ctx, 3, 0)
  // ops ticker column on the right
  var ops = ['SAMPLE', 'TOOL.CALL', 'THINK', 'EXECUTE', 'OBSERVE', 'PLAN'], X = g.cols - 13
  for (var y = 1; y < g.rows - 1; y++) {
    var n = Math.floor(t * 4) + y, mark = y === Math.floor(g.rows * 0.6)
    put(g, X, y, ops[n % ops.length], mark ? 3 : Math.abs(y - g.rows * 0.6) < 4 ? 1 : 0)
  }
}

function bridge(g, t, ctx) {
  for (var y = 1; y < g.rows - 1; y += 3) for (var x = 0; x < g.cols; x += 6) setCell(g, x, y, '\xB7', 0)
  heartbeat(g, Math.floor(g.rows / 2), Math.floor(g.rows * 0.3), t, ctx, 2)
  karaoke(g, g.rows - 3, ctx, 2, 0)
}

var FONT = { E: ['###', '#  ', '## ', '#  ', '###'], X: ['# #', ' # ', ' # ', ' # ', '# #'], C: ['###', '#  ', '#  ', '#  ', '###'], U: ['# #', '# #', '# #', '# #', '###'], T: ['###', ' # ', ' # ', ' # ', ' # '], I: ['###', ' # ', ' # ', ' # ', '###'], O: ['###', '# #', '# #', '# #', '###'], N: ['# #', '###', '###', '###', '# #'] }
function chorus2(g, t, ctx) {
  // block letters: cells are about twice as tall as wide, so a pixel is sx wide and sy = sx / 2 tall
  var word = 'EXECUTE', sx = Math.max(1, Math.floor(g.cols * 0.85 / (word.length * 4))), sy = Math.max(1, Math.round(sx / 2))
  var x0 = Math.floor((g.cols - word.length * 4 * sx) / 2), y0 = Math.floor(g.rows / 2 - 2.5 * sy) - 2
  for (var i = 0; i < word.length; i++) { var gl = FONT[word[i]]; for (var r = 0; r < 5; r++) for (var c = 0; c < 3; c++) if (gl[r][c] === '#') fill(g, x0 + (i * 4 + c) * sx, y0 + r * sy, sx, sy, '\u2588', 4) }
  karaoke(g, g.rows - 4, ctx, 4, 0)
  var pulse = ctx.beat ? ctx.beat.pulse : 0, seed = ctx.beat ? ctx.beat.index : Math.floor(t * 2)
  if (pulse > 0.6) for (var y = 0; y < g.rows; y++) if (hash(y, seed) < 0.2 && g.ch[y].indexOf('') < 0) {
    var sh = Math.round((hash(y, seed + 3) - 0.5) * 14)
    g.ch[y] = g.ch[y].slice(-sh).concat(g.ch[y].slice(0, -sh)).slice(0, g.cols); g.st[y] = g.st[y].slice(-sh).concat(g.st[y].slice(0, -sh)).slice(0, g.cols)
  }
}

var WHALE = ['        _.-----._', '   _.-\\'          \`-._', '<_      o            )', '  \`-._         __.-\\'', '      \`--.__.-\\'']
function outro(g, t, ctx, p) {
  var floor = g.rows - 2
  for (var i = 0; i < g.cols * g.rows / 45; i++) setCell(g, Math.floor(hash(i, 1) * g.cols), Math.floor((hash(i, 2) * g.rows + t * (0.5 + i % 3 * 0.6)) % floor), '\xB7', i % 3)
  var wy = Math.round(-5 + p * (floor - 2)), wx = Math.floor(g.cols / 2 - 11)
  for (var r = 0; r < WHALE.length; r++) put(g, wx, wy + r, WHALE[r], p < 0.6 ? 2 : 1)
  fill(g, 0, floor, g.cols, 1, '_', 1)
  if (p > 0.5) put(g, 3, 2, 'fin.'.slice(0, Math.ceil((p - 0.5) * 16)), 2)
  karaoke(g, g.rows - 1, ctx, 2, 0)
}

// ---- the frame ------------------------------------------------------------------------------------
function render(t, cols, rows, ctx) {
  var g = makeGrid(cols, rows)
  var s = ctx.section, kind = s ? s.kind : (ctx.progress < 0.1 ? 'intro' : 'verse'), local = s ? t - s.start : t
  var p = s ? s.progress : ctx.progress
  if (kind === 'intro') intro(g, t, ctx, local)
  else if (kind === 'verse') verse(g, t, ctx)
  else if (kind === 'chorus') (s && s.index > 3 ? chorus2 : chorus)(g, t, ctx)
  else if (kind === 'bridge' || kind === 'instrumental') bridge(g, t, ctx)
  else if (kind === 'outro') outro(g, t, ctx, p)
  else verse(g, t, ctx)
  // transitions: darken everything in the first and last 0.8 s of a section
  if (s) {
    var edge = Math.min(t - s.start, s.end - t)
    var steps = edge < 0.25 ? 2 : edge < 0.8 ? 1 : 0
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) for (var k = 0; k < steps; k++) g.st[y][x] = darker(g.st[y][x])
  }
  // post effects: scanlines + vignette (cheap passes, see ../post-effects.scene.js)
  for (var y2 = 1; y2 < rows; y2 += 2) for (var x2 = 0; x2 < cols; x2++) if (g.st[y2][x2] === '1') g.st[y2][x2] = '0'
  for (var y3 = 0; y3 < rows; y3++) for (var x3 = 0; x3 < cols; x3++) {
    var dx = (x3 / cols - 0.5) * 2, dy = (y3 / rows - 0.5) * 2
    if (dx * dx + dy * dy > 1.15) g.st[y3][x3] = darker(g.st[y3][x3])
  }
  // section label in the corner
  put(g, cols - 18, 0, (kind + ' ' + (s ? Math.round(p * 100) + '%' : '')).slice(0, 17), 0)
  return frameOf(g)
}
`,
  "examples/token-bar.scene.js": `// token-bar.scene.js \u2014 the "stdout \xB7 tokens" band: lyrics streamed as tokens.
//
// Technique (from the dsh PV preset's bottom band): the current lyric is split into tokens the way
// a tokenizer might (words and punctuation; long words break into two pieces). Each token appears
// when its word is sung (ctx.lyric.words), drawn in an inverted cell box with a pseudo token id
// underneath (crc32 of the token, mod 100000, so ids are stable). The newest token blinks a caret.

// ---- grid helpers (shared by every example; copy them into your own scenes.js) ----------------\r
// A frame is a grid of cells. ch[y][x] holds one character, st[y][x] its style digit:\r
// 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.\r
// Wide characters (CJK, full-width punctuation) take two cells; the second cell holds '' so that\r
// lines and styles stay aligned when joined.\r
var WIDE = /[\\u1100-\\u115f\\u2e80-\\ua4cf\\uac00-\\ud7a3\\uf900-\\ufaff\\ufe30-\\ufe4f\\uff00-\\uff60\\uffe0-\\uffe6]/\r
function cellWidth(c) { return WIDE.test(c) ? 2 : 1 }\r
function textWidth(s) { var w = 0; for (var c of String(s)) w += cellWidth(c); return w }\r
function makeGrid(cols, rows) {\r
  var ch = [], st = []\r
  for (var y = 0; y < rows; y++) { ch.push(new Array(cols).fill(' ')); st.push(new Array(cols).fill('0')) }\r
  return { cols: cols, rows: rows, ch: ch, st: st }\r
}\r
function setCell(g, x, y, c, s) {\r
  if (y < 0 || y >= g.rows || x < 0 || x >= g.cols) return\r
  var row = g.ch[y], sty = g.st[y], w = cellWidth(c)\r
  if (x + w > g.cols) return\r
  if (row[x] === '' && x > 0) { row[x - 1] = ' '; sty[x - 1] = '0' }        // we hit the right half of a wide char\r
  if (w === 1 && row[x + 1] === '') { row[x + 1] = ' '; sty[x + 1] = '0' }  // we cover the left half of one\r
  if (w === 2 && row[x + 2] === '') { row[x + 2] = ' '; sty[x + 2] = '0' }\r
  row[x] = c; sty[x] = String(s)\r
  if (w === 2) { row[x + 1] = ''; sty[x + 1] = '' }\r
}\r
function put(g, x, y, text, s) {\r
  x = Math.round(x); y = Math.round(y)\r
  for (var c of String(text)) { setCell(g, x, y, c, s); x += cellWidth(c) }\r
}\r
function center(g, y, text, s) { put(g, Math.floor((g.cols - textWidth(text)) / 2), y, text, s) }\r
function fill(g, x, y, w, h, c, s) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) setCell(g, x + i, y + j, c, s) }\r
function box(g, x, y, w, h, s, title) {\r
  if (w < 2 || h < 2) return\r
  for (var i = 1; i < w - 1; i++) { setCell(g, x + i, y, '\u2500', s); setCell(g, x + i, y + h - 1, '\u2500', s) }\r
  for (var j = 1; j < h - 1; j++) { setCell(g, x, y + j, '\u2502', s); setCell(g, x + w - 1, y + j, '\u2502', s) }\r
  setCell(g, x, y, '\u250C', s); setCell(g, x + w - 1, y, '\u2510', s); setCell(g, x, y + h - 1, '\u2514', s); setCell(g, x + w - 1, y + h - 1, '\u2518', s)\r
  if (title) put(g, x + 2, y, ' ' + title + ' ', s)\r
}\r
function frameOf(g) { return { lines: g.ch.map(function (r) { return r.join('') }), styles: g.st.map(function (r) { return r.join('') }) } }\r
// Deterministic pseudo-random numbers: the same (seed, i) always gives the same value, so a frame\r
// depends only on t and ctx (seeking works, the agent preview matches playback).\r
function hash(i, seed) { var h = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(seed | 0, 0xc2b2ae35); h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2f); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }\r
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }\r
// Silent packs (no audio) get zero bands: fake a little motion from the beat so previews are not dead.\r
function energyOf(ctx, t) { return ctx.energy > 0.01 ? ctx.energy : 0.25 + 0.2 * (ctx.beat ? ctx.beat.pulse : 0.5 + 0.5 * Math.sin(t * 4)) }\r
function bandOf(ctx, i, t) { return ctx.energy > 0.01 ? ctx.bands[i] : clamp(0.35 + 0.3 * Math.sin(t * 3 + i * 0.45) * (1 - i / 64) + (ctx.beat ? 0.3 * ctx.beat.pulse : 0), 0, 1) }\r
// ---- end of grid helpers -------------------------------------------------------------------------

var CRC = (function () { var table = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table.push(c >>> 0) } return table })()
function crc32(s) { var c = 0xffffffff; for (var i = 0; i < s.length; i++) { var code = s.charCodeAt(i) & 0xff; c = CRC[(c ^ code) & 0xff] ^ (c >>> 8) } return (c ^ 0xffffffff) >>> 0 }
function tokenId(tok) { return crc32(tok.toLowerCase()) % 100000 }

// Words and punctuation; words longer than 7 letters split in two (like sub-word tokens).
function tokenize(word) {
  var out = [], parts = String(word).match(/[A-Za-z']+|[^\\sA-Za-z']/g) || []
  for (var i = 0; i < parts.length; i++) {
    var w = parts[i]
    if (w.length > 7) { var k = Math.floor(w.length / 2) + 1; out.push(w.slice(0, k), w.slice(k)) } else out.push(w)
  }
  return out
}

function render(t, cols, rows, ctx) {
  var g = makeGrid(cols, rows)
  var top = rows - 7
  box(g, 1, top, cols - 2, 6, 1, 'stdout \xB7 tokens')
  put(g, 3, top + 2, '>', 2)
  if (!ctx.lyric) {
    put(g, 5, top + 2, Math.floor(t * 2) % 2 ? '\u258C' : ' ', 2)
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
      // inverted token box: \u2588 background with the token drawn dim on top
      fill(g, x, top + 2, width, 1, '\u2588', fresh ? 3 : 1)
      put(g, x, top + 2, tok, 0)
      put(g, x, top + 3, String(tokenId(tok)).slice(0, Math.max(width, 5)), 0)
      x += Math.max(width, 5) + 1
    }
  }
  if (x < cols - 4 && Math.floor(t * 4) % 2) setCell(g, x, top + 2, '\u258C', 3)
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
`,
  "examples/whale-fall.scene.js": "// whale-fall.scene.js \u2014 the ending: a whale sinking through marine snow.\n//\n// Technique (from the dsh PV preset's WHALE_FALL finale): slow particles drift down (\"marine\n// snow\"), small fish (><> and <><) swim across at different depths, a large silhouette sinks from\n// the top to the sea floor over the section, light fades with depth, and closing captions are typed\n// line by line. Everything is a function of t (particles use hash(i) for their start positions),\n// so seeking to any moment shows the right picture. The whale is a PLACEHOLDER drawn from code;\n// it is not the preset's CC BY-NC-SA artwork.\n//\n// Use it for the last section: it reads ctx.section.progress when the section is an outro, and\n// falls back to the song progress otherwise.\n\n// ---- grid helpers (shared by every example; copy them into your own scenes.js) ----------------\r\n// A frame is a grid of cells. ch[y][x] holds one character, st[y][x] its style digit:\r\n// 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.\r\n// Wide characters (CJK, full-width punctuation) take two cells; the second cell holds '' so that\r\n// lines and styles stay aligned when joined.\r\nvar WIDE = /[\\u1100-\\u115f\\u2e80-\\ua4cf\\uac00-\\ud7a3\\uf900-\\ufaff\\ufe30-\\ufe4f\\uff00-\\uff60\\uffe0-\\uffe6]/\r\nfunction cellWidth(c) { return WIDE.test(c) ? 2 : 1 }\r\nfunction textWidth(s) { var w = 0; for (var c of String(s)) w += cellWidth(c); return w }\r\nfunction makeGrid(cols, rows) {\r\n  var ch = [], st = []\r\n  for (var y = 0; y < rows; y++) { ch.push(new Array(cols).fill(' ')); st.push(new Array(cols).fill('0')) }\r\n  return { cols: cols, rows: rows, ch: ch, st: st }\r\n}\r\nfunction setCell(g, x, y, c, s) {\r\n  if (y < 0 || y >= g.rows || x < 0 || x >= g.cols) return\r\n  var row = g.ch[y], sty = g.st[y], w = cellWidth(c)\r\n  if (x + w > g.cols) return\r\n  if (row[x] === '' && x > 0) { row[x - 1] = ' '; sty[x - 1] = '0' }        // we hit the right half of a wide char\r\n  if (w === 1 && row[x + 1] === '') { row[x + 1] = ' '; sty[x + 1] = '0' }  // we cover the left half of one\r\n  if (w === 2 && row[x + 2] === '') { row[x + 2] = ' '; sty[x + 2] = '0' }\r\n  row[x] = c; sty[x] = String(s)\r\n  if (w === 2) { row[x + 1] = ''; sty[x + 1] = '' }\r\n}\r\nfunction put(g, x, y, text, s) {\r\n  x = Math.round(x); y = Math.round(y)\r\n  for (var c of String(text)) { setCell(g, x, y, c, s); x += cellWidth(c) }\r\n}\r\nfunction center(g, y, text, s) { put(g, Math.floor((g.cols - textWidth(text)) / 2), y, text, s) }\r\nfunction fill(g, x, y, w, h, c, s) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) setCell(g, x + i, y + j, c, s) }\r\nfunction box(g, x, y, w, h, s, title) {\r\n  if (w < 2 || h < 2) return\r\n  for (var i = 1; i < w - 1; i++) { setCell(g, x + i, y, '\u2500', s); setCell(g, x + i, y + h - 1, '\u2500', s) }\r\n  for (var j = 1; j < h - 1; j++) { setCell(g, x, y + j, '\u2502', s); setCell(g, x + w - 1, y + j, '\u2502', s) }\r\n  setCell(g, x, y, '\u250C', s); setCell(g, x + w - 1, y, '\u2510', s); setCell(g, x, y + h - 1, '\u2514', s); setCell(g, x + w - 1, y + h - 1, '\u2518', s)\r\n  if (title) put(g, x + 2, y, ' ' + title + ' ', s)\r\n}\r\nfunction frameOf(g) { return { lines: g.ch.map(function (r) { return r.join('') }), styles: g.st.map(function (r) { return r.join('') }) } }\r\n// Deterministic pseudo-random numbers: the same (seed, i) always gives the same value, so a frame\r\n// depends only on t and ctx (seeking works, the agent preview matches playback).\r\nfunction hash(i, seed) { var h = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(seed | 0, 0xc2b2ae35); h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2f); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }\r\nfunction clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }\r\n// Silent packs (no audio) get zero bands: fake a little motion from the beat so previews are not dead.\r\nfunction energyOf(ctx, t) { return ctx.energy > 0.01 ? ctx.energy : 0.25 + 0.2 * (ctx.beat ? ctx.beat.pulse : 0.5 + 0.5 * Math.sin(t * 4)) }\r\nfunction bandOf(ctx, i, t) { return ctx.energy > 0.01 ? ctx.bands[i] : clamp(0.35 + 0.3 * Math.sin(t * 3 + i * 0.45) * (1 - i / 64) + (ctx.beat ? 0.3 * ctx.beat.pulse : 0), 0, 1) }\r\n// ---- end of grid helpers -------------------------------------------------------------------------\n\nvar WHALE = [\n  '                 __   __',\n  '            _.--\\'  `-\\'  `--._',\n  '        _.-\\'                 `-._',\n  '   __.-\\'   o                     `-.',\n  ' <___                                )',\n  '      `-._         ___          _.-\\'',\n  '          `--.__.-\\'   `--.__.--\\'',\n  '                \\\\_/\\\\_/',\n]\nvar CAPTIONS = ['weights: released', 'license: MIT', 'forks: ', '</think>']\n\nfunction render(t, cols, rows, ctx) {\n  var g = makeGrid(cols, rows)\n  var p = ctx.section && /outro|ending/.test(ctx.section.kind) ? ctx.section.progress : ctx.progress\n  var floor = rows - 3\n  // marine snow: 3 layers with different speeds; brighter = closer\n  var count = Math.floor(cols * rows / 40)\n  for (var i = 0; i < count; i++) {\n    var layer = i % 3, speed = 0.6 + layer * 0.7\n    var x = Math.floor(hash(i, 1) * cols + Math.sin(t * 0.5 + i) * 1.5)\n    var y = Math.floor((hash(i, 2) * rows + t * speed) % floor)\n    setCell(g, (x + cols) % cols, y, layer === 2 ? '\u2022' : '\xB7', layer === 2 ? 2 : layer)\n  }\n  // fish swimming both ways\n  for (var f = 0; f < 6; f++) {\n    var dir = f % 2 ? 1 : -1, row = 3 + Math.floor(hash(f, 3) * (floor - 6))\n    var fx = Math.floor(((hash(f, 4) * cols + dir * t * (4 + f)) % (cols + 6) + cols + 6) % (cols + 6)) - 3\n    put(g, fx, row, dir > 0 ? '><>' : '<><', 1)\n  }\n  // the whale sinks from above the screen to just over the floor\n  var wy = Math.round(-WHALE.length + p * (floor - 1))\n  var wx = Math.floor(cols * 0.55 - 18 + Math.sin(t * 0.3) * 3)\n  var light = p < 0.5 ? 3 : p < 0.8 ? 2 : 1\n  for (var r = 0; r < WHALE.length; r++) put(g, wx, wy + r, WHALE[r], light)\n  // bubbles rising from it\n  for (var b = 0; b < 8; b++) {\n    var by = wy - 1 - Math.floor(((t * 3 + b * 2.7) % 10))\n    if (by >= 0) setCell(g, wx + 5 + b % 3, by, b % 2 ? 'o' : '\xB0', 0)\n  }\n  // sea floor that pulses with the bass\n  for (var x2 = 0; x2 < cols; x2++) {\n    var hgt = Math.sin(x2 * 0.21) * 0.6 + bandOf(ctx, Math.floor(x2 / cols * 16), t) * 1.4\n    setCell(g, x2, floor, hgt > 1 ? '\u25B2' : hgt > 0.4 ? '^' : '_', 1)\n    setCell(g, x2, floor + 1, '\u2592', 0)\n  }\n  // closing captions typed one after another during the second half\n  var tp = (p - 0.45) / 0.5\n  for (var c = 0; c < CAPTIONS.length; c++) {\n    var start = c / CAPTIONS.length, local = (tp - start) * CAPTIONS.length\n    if (local <= 0) continue\n    var text = CAPTIONS[c] + (CAPTIONS[c] === 'forks: ' ? String(Math.floor(clamp(local, 0, 1) * 476)) : '')\n    put(g, 3, 2 + c * 2, text.slice(0, Math.ceil(clamp(local * 1.5, 0, 1) * text.length)), c === 2 ? 2 : 1)\n  }\n  if (ctx.lyric) center(g, rows - 1, ctx.lyric.text, 2)\n  return frameOf(g)\n}\n",
  "prompts/en/01-creative-brief.md": '# 01 Creative brief (think first, then build)\n\n**Input**: `brief.json` (title, artist, style request), the lyrics file, `sections.json` or `x-dsh-mv-ai.sections`\nin mv.json, the duration, `spectrum.json` (if present). **Output**: `notes/brief.md` in the pack folder (one page at\nmost); every later step follows it.\n\nUse this structure:\n\n1. **One-line concept**: what is the MV about? One visual metaphor ("an old terminal chats with someone late at\n   night, then sinks to the sea floor").\n2. **Emotion curve**: intensity 0\u201310 per section (intro 2 \u2192 verse 4 \u2192 chorus 8 \u2192 bridge 3 \u2192 last chorus 10 \u2192\n   outro 1). Estimate energy from the per-section average of `spectrum.json`; choruses are usually the brightest\n   and fastest, bridges the emptiest.\n3. **Visual motifs (3\u20135)**: elements that come back and evolve (windows, heartbeat line, particles, text rain,\n   silhouettes\u2026). For each: where it first appears, how it changes at the climax, how it ends.\n4. **Palette and character set**: only style digits 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.\n   Give each a job (e.g. 3 only for the current lyric, 4 only at the climax). List the main characters (`\u2588\u2593\u2592\u2591`\n   ramps, `\xB7\u2022\u25CF` particles, `\u2500\u2502\u250C\u2510\u2514\u2518` frames, `/\\_` lines).\n5. **Lyrics presentation**: verses (typing, word highlight, token band), choruses (big text, karaoke), what to draw\n   where there are no lyrics. **Never invent or rewrite lyrics**; only use the user\'s lyrics file.\n6. **Beat sync**: if you can estimate the BPM, set `canvas.bpm` (and `canvas.beatOffset`) and accent on\n   `ctx.beat.pulse`; otherwise use jumps in `ctx.bass` / `ctx.energy`.\n7. **Risks**: frames that could be slow (per-cell work over large areas), CJK wide-character misalignment, long lines\n   that do not fit; plan around them.\n\nProven patterns: `examples/` (chat-window, heartbeat, ops-ticker, token-bar, execution-split, whale-fall,\npost-effects) and the complete `examples/rich-pack/scenes.js`.\n',
  "prompts/en/02-storyboard.md": '# 02 Per-section storyboard\n\n**Input**: `notes/brief.md`, the section list (`x-dsh-mv-ai.sections`), the lyric timings.\n**Output**: `notes/storyboard.md` with one card per section; then write `scenes.js` from it.\n\nOne card per section, in this format:\n\n```\n## <section kind> <start>\u2013<end>s  (emotion x/10)\nPicture: main subject, where on screen, how big (as a share of cols\xD7rows, e.g. "centred, 60 % wide")\nMotifs: which motifs appear / change here\nLyrics: how and where they show; how the current word is emphasised (ctx.lyric.word / ctx.lyric.words)\nMusic: what follows bands / bass / beat (e.g. flash on every beat, bass pushes the radius)\nMotion: change over section.progress (start \u2192 end); the same t always gives the same frame\nTransition: how the section starts and ends (fade, wipe, glitch, cut to black), about 0.5\u20131 s\nPerformance: the heaviest work in this section, roughly how many cells per frame\n```\n\nRules:\n\n- Neighbouring sections must differ clearly (composition or main colour); repeated sections (two choruses) must\n  build: the second is stronger or adds something new.\n- Intros, instrumentals and outros without lyrics still get a full picture, never an empty screen.\n- If there is no section list, split the song yourself from duration and energy and write it into mv.json\n  `x-dsh-mv-ai.sections` (`[{kind,label,start,end}]`); the script reads it as `ctx.section`.\n- Every card maps to one function in `scenes.js` (e.g. `intro(g, t, ctx)`, `chorus(g, t, ctx)`).\n',
  "prompts/en/03-scene-script-guide.md": "# 03 Scene-script guide (scenes.js)\n\n## API\n\n```js\nfunction setup(info) { }                 // optional; info = { title, artist, duration, sections, bpm, beatOffset }\nfunction render(t, cols, rows, ctx) {    // called every frame, about 30\u201360 times per second\n  return { lines: [...], styles: [...] } // or an array of strings / one string with \\n\n}\n```\n\n- `lines[y]` is row y; `styles[y]` has one digit per character: 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.\n- `ctx`:\n  - `duration`, `progress` (0..1), `title`, `artist`, `ready`, `paused`\n  - `lyric`: `{ text, en, zh, start, end, progress, words: [{text,start,end}], word }` or null. `words` come from\n    enhanced-LRC `<mm:ss.xx>` word stamps, otherwise they are spread over the first 70 % of the line (CJK per\n    character); `word` is the index of the word being sung (-1 before the first).\n  - `next`: the next line `{ text, en, zh, start, end, progress }` (no words)\n  - `bands`: 48 values 0..1 (low \u2192 high); `energy`, `bass`, `mid`, `treble`: 0..1\n  - `section`: `{ kind, label, start, end, index, progress }` or null; `sections`: all of them\n  - `beat`: `{ bpm, index, bar, phase, pulse }` when mv.json sets `canvas.bpm` (pulse is 1 on the beat and decays\n    fast), otherwise null\n\n## Sandbox limits (breaking them stops the script; the panel falls back to the generic picture)\n\n- No import / require; no DOM, network (fetch\u2026), storage, timers, Workers, WebAssembly; no eval / new Function.\n- Text: 40 ms per frame (aim for < 10 ms); pixels/WebGL: 100 ms. Too many slow frames, a 1.5 s hang or an exception stops the script. Text/pixels: 256 KiB max; WebGL: 2 MiB.\n\n## 3D (plugin 0.9.2+)\n\nSet canvas.output to \"webgl\" and size to [1280, 720]. Define setup(info, gl) and paint(gl, t, w, h, ctx).\nBundle Three.js before import and pass `{ canvas: info.canvas, context: gl }` to WebGLRenderer.\nKeep DOM, fetch/CDN loaders and animation loops out of the runtime; textures must come from canvas.assets.\nUse absolute t for deterministic seeking. Host/CI stand-ins cannot verify GPU shaders: test in a real browser.\n- A frame must be a **pure function** of `t` and `ctx`: no state from earlier frames, no Math.random (seeking and the\n  preview tool must give the same picture). Use the deterministic `hash(i, seed)` from the example helpers. For\n  \"history\" effects (trails, ECG traces) recompute earlier times `t - dt`.\n\n## Performance budget\n\n- A 100\xD732 grid has 3200 cells: a few passes per frame are fine; avoid loops inside the per-cell loop\n  (O(cells \xD7 objects)).\n- Scale particle counts with the area (e.g. `cols*rows/40`), never thousands fixed.\n- Build a 2-D array `ch[y][x]` and `join('')` once at the end.\n- `mv_pack_preview_frame` reports the time per frame; simplify above 10 ms.\n\n## ASCII / canvas techniques\n\n- **Wide characters**: CJK and full-width symbols take two cells. Use the examples' `setCell/put` (the second cell\n  holds ''), otherwise alignment and styles break.\n- **Shading**: ` .:-=+*#%@` or `\u2591\u2592\u2593\u2588`; styles 0\u20133 as a second brightness layer.\n- **Shapes**: circles / rings in polar coordinates with x \xD7 2 for the cell aspect ratio; block letters from a 5\xD73\n  dot font scaled up (examples/execution-split).\n- **Frames and windows**: `\u250C\u2500\u2510\u2502\u2514\u2518` (examples/chat-window).\n- **Particles**: position = start hash + speed \xD7 t, wrapped with modulo (examples/whale-fall).\n- **Post effects** on style digits: scanlines (every other row one step darker), vignette (darker far from the\n  centre), bloom (`.` around bright cells), glitch (shift whole rows on the beat, skipping rows with wide\n  characters) (examples/post-effects).\n- **Transitions**: lower brightness step by step in the 0.5\u20131 s at section edges (fade), or wipe columns by progress.\n\n## Syncing to the music\n\n- **Lyrics**: current line `ctx.lyric.text`; word highlight with `ctx.lyric.words` + `ctx.lyric.word`\n  (examples/token-bar, the karaoke in rich-pack); typing with `lyric.progress` or word times. Preview the next line\n  with `ctx.next` (dim).\n- **Spectrum**: `bands[i]` drives bar height / radius / particle speed; `bass` suits global scale and flashes,\n  `treble` fine particles.\n- **Beat**: `ctx.beat.pulse` for accents (flash, zoom, glitch), `ctx.beat.bar` to change composition per bar;\n  without bpm, use `bass` crossing a threshold.\n- **Sections**: `ctx.section.kind` picks the scene function, `ctx.section.progress` drives motion inside it.\n- **Silent packs**: without audio all bands are 0; the examples' `energyOf/bandOf` fake motion so previews are alive.\n\n## Suggested structure\n\n```js\n/* helpers (copy the grid helpers from examples) */\nfunction intro(g, t, ctx, p) { ... }\nfunction verse(g, t, ctx, p) { ... }\nfunction chorus(g, t, ctx, p) { ... }\nfunction render(t, cols, rows, ctx) {\n  var g = makeGrid(cols, rows), s = ctx.section\n  var kind = s ? s.kind : 'verse'\n  ;({ intro: intro, verse: verse, chorus: chorus }[kind] || verse)(g, t, ctx, s ? s.progress : ctx.progress)\n  /* transitions + post effects */\n  return frameOf(g)\n}\n```\n\nEvery window size must work (cols 40\u2013240, rows 12\u201385): place things proportionally and truncate text that does not fit.\n",
  "prompts/en/04-qa-checklist.md": '# 04 QA checklist (go through every item before you finish)\n\n## Must pass\n\n- [ ] `mv_pack_validate` (path = pack folder) reports no errors; mv.json is valid JSON, `canvas.renderer` is\n      `"script"` and `canvas.script` points at `scenes.js`.\n- [ ] Lyrics come from the user\'s file: nothing invented, rewritten or completed; times increase and stay within the duration.\n- [ ] The audio was not modified, converted or deleted; nothing was downloaded; only files in the pack folder changed.\n- [ ] scenes.js has no import / require / eval / new Function / fetch, no Math.random, no state carried between frames.\n- [ ] Previewed with `mv_pack_preview_frame` at least: 0 s, the middle of every section, 0.3 s before and after every\n      section change, the last 2 s.\n- [ ] No blank frames, no errors; each frame < 10 ms (hard limit 40 ms).\n\n## Picture quality\n\n- [ ] Every section is recognisable at a glance; the second chorus is stronger or adds something.\n- [ ] The current lyric is always readable (cleared band behind it, style 3 or 2); the word highlight matches the sung word.\n- [ ] The picture reacts clearly to beats / bass without flickering every frame (at most one flash per beat).\n- [ ] CJK wide characters align, frames are not pushed out of shape; long lines are truncated, not wrapped badly.\n- [ ] Small (about 60\xD718) and large (about 160\xD748) windows both work: nothing out of bounds, the subject stays centred.\n- [ ] Intro, instrumentals and outro have a full picture; the ending resolves (fade, freeze or a closing caption).\n- [ ] credits / notice are complete: song rights belong to their owners, sources and licences of any material.\n\n## When something is wrong\n\nWrite it to `notes/qa.md` (time, what you saw, cause, fix), re-preview the same time after the fix, then continue.\n',
  "prompts/en/05-iteration.md": '# 05 Iteration prompts (copy one to the AI when you want a change)\n\nChange one thing at a time; afterwards preview the affected times with `mv_pack_preview_frame` and run the 04 checklist.\n\n- **More spectacle**: "Strengthen the choruses: on strong beats (ctx.beat.pulse > 0.7) flash the screen white for one\n  frame and zoom 10 %, add the scanlines and vignette from post-effects; leave the other sections alone."\n- **Closer to the lyrics**: "Make the verses type word by word: show only the words in ctx.lyric.words already sung,\n  the current word in style 3, and the next line in style 0 below."\n- **Off-beat**: "Set canvas.bpm to <BPM> and canvas.beatOffset to <seconds> so the first beat lands at <time> s; check\n  the preview 2 s around <time>."\n- **Wrong sections**: "Rewrite x-dsh-mv-ai.sections with these times: <kind start\u2013end list>, and adjust the scenes."\n- **Too slow**: "Find the slowest section, scale particle counts with the area (cols*rows/50), remove loops inside the\n  per-cell loop; target < 8 ms per frame."\n- **New style**: "Keep the structure and lyric sync, change the look to <style>: only styles <list>, characters <set>."\n- **Add a scene**: "Use the effect from examples/<name>.scene.js in the bridge with words and rhythm that fit this song,\n  joined to its neighbours with 0.8 s fades."\n- **Small windows look bad**: "When cols < 70 or rows < 20 use a simple layout: hide decorative frames, keep the\n  subject and the lyric."\n- **Getting ready for the workshop**: "Check that credits / notice / x-dsh-mv-workshop.license are complete and that the\n  pack holds nothing it should not (publishing strips the audio and lyric text automatically and keeps the timings)."\n',
  "prompts/zh/01-creative-brief.md": "# 01 \u521B\u610F\u7B80\u62A5\uFF08\u5148\u60F3\u6E05\u695A\uFF0C\u518D\u52A8\u624B\uFF09\n\n**\u8F93\u5165**\uFF1A`brief.json`\uFF08\u6B4C\u540D\u3001\u6B4C\u624B\u3001\u98CE\u683C\u8981\u6C42\uFF09\u3001\u6B4C\u8BCD\u6587\u4EF6\u3001`sections.json` \u6216 mv.json \u91CC\u7684 `x-dsh-mv-ai.sections`\u3001\n\u65F6\u957F\u3001`spectrum.json`\uFF08\u5982\u679C\u6709\uFF09\u3002**\u8F93\u51FA**\uFF1A\u5728\u5305\u6587\u4EF6\u5939\u91CC\u5199 `notes/brief.md`\uFF08\u4E0D\u8D85\u8FC7\u4E00\u9875\uFF09\uFF0C\u4E4B\u540E\u6BCF\u4E00\u6B65\u90FD\u4EE5\u5B83\u4E3A\u51C6\u3002\n\n\u8BF7\u6309\u4E0B\u9762\u7684\u7ED3\u6784\u5199\uFF1A\n\n1. **\u4E00\u53E5\u8BDD\u6982\u5FF5**\uFF1A\u8FD9\u9996 MV \u8BB2\u4EC0\u4E48\uFF1F\u7528\u4E00\u4E2A\u753B\u9762\u9690\u55BB\u6982\u62EC\uFF08\u4F8B\u5982\u201C\u4E00\u53F0\u8001\u7EC8\u7AEF\u5728\u6DF1\u591C\u548C\u4EBA\u804A\u5929\uFF0C\u6700\u540E\u6C89\u5165\u6D77\u5E95\u201D\uFF09\u3002\n2. **\u60C5\u7EEA\u66F2\u7EBF**\uFF1A\u6309\u6BB5\u843D\u5217\u51FA\u60C5\u7EEA\u5F3A\u5EA6 0\u201310\uFF08\u524D\u594F 2 \u2192 \u4E3B\u6B4C 4 \u2192 \u526F\u6B4C 8 \u2192 \u6865\u6BB5 3 \u2192 \u6700\u540E\u526F\u6B4C 10 \u2192 \u5C3E\u58F0 1\uFF09\u3002\n   \u80FD\u91CF\u6570\u636E\u53EF\u4EE5\u4ECE `spectrum.json` \u6BCF\u6BB5\u7684\u5E73\u5747\u503C\u4F30\u8BA1\uFF1B\u526F\u6B4C\u901A\u5E38\u6700\u4EAE\u6700\u5FEB\uFF0C\u6865\u6BB5\u6700\u7A7A\u3002\n3. **\u89C6\u89C9\u6BCD\u9898\uFF083\u20135 \u4E2A\uFF09**\uFF1A\u4F1A\u5728\u4E0D\u540C\u6BB5\u843D\u53CD\u590D\u51FA\u73B0\u3001\u9010\u6E10\u53D8\u5316\u7684\u5143\u7D20\uFF08\u7A97\u53E3\u3001\u5FC3\u8DF3\u7EBF\u3001\u7C92\u5B50\u3001\u6587\u5B57\u96E8\u3001\u526A\u5F71\u2026\u2026\uFF09\u3002\n   \u6BCF\u4E2A\u6BCD\u9898\u5199\u6E05\uFF1A\u7B2C\u4E00\u6B21\u51FA\u73B0\u5728\u54EA\u3001\u9AD8\u6F6E\u65F6\u600E\u6837\u53D8\u5316\u3001\u7ED3\u5C3E\u600E\u6837\u6536\u675F\u3002\n4. **\u8C03\u8272\u4E0E\u5B57\u7B26\u96C6**\uFF1A\u53EA\u7528\u6837\u5F0F\u6570\u5B57 0 \u6697\u30011 \u666E\u901A\u30012 \u4EAE\u30013 \u767D\u30014 \u7EA2\u30015 \u68D5\u30016 \u6A44\u6984\u3002\u89C4\u5B9A\u6BCF\u79CD\u7528\u9014\uFF08\u5982 3 \u53EA\u7ED9\u5F53\u524D\u6B4C\u8BCD\uFF0C\n   4 \u53EA\u5728\u9AD8\u6F6E\u51FA\u73B0\uFF09\u3002\u5217\u51FA\u4E3B\u8981\u5B57\u7B26\uFF08`\u2588\u2593\u2592\u2591` \u6E10\u53D8\u3001`\xB7\u2022\u25CF` \u7C92\u5B50\u3001`\u2500\u2502\u250C\u2510\u2514\u2518` \u8FB9\u6846\u3001`/\\_` \u7EBF\u6761\uFF09\u3002\n5. **\u6B4C\u8BCD\u5448\u73B0\u65B9\u5F0F**\uFF1A\u4E3B\u6B4C\u600E\u4E48\u663E\u793A\uFF08\u6253\u5B57\u3001\u9010\u8BCD\u9AD8\u4EAE\u3001token \u6761\uFF09\u3001\u526F\u6B4C\u600E\u4E48\u663E\u793A\uFF08\u5927\u5B57\u3001\u5361\u62C9 OK\uFF09\u3001\n   \u6CA1\u6709\u6B4C\u8BCD\u7684\u6BB5\u843D\u753B\u4EC0\u4E48\u3002**\u4E0D\u8981\u7F16\u9020\u6216\u6539\u5199\u6B4C\u8BCD**\uFF0C\u53EA\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u7684\u6B4C\u8BCD\u6587\u4EF6\u3002\n6. **\u8282\u594F\u540C\u6B65**\uFF1A\u5982\u679C\u80FD\u4F30\u8BA1 BPM\uFF0C\u5199\u8FDB `canvas.bpm`\uFF08\u548C `canvas.beatOffset`\uFF09\uFF0C\u753B\u9762\u5728 `ctx.beat.pulse` \u4E0A\u505A\u91CD\u97F3\uFF1B\n   \u4F30\u8BA1\u4E0D\u4E86\u5C31\u7528 `ctx.bass` / `ctx.energy` \u7684\u7A81\u53D8\u3002\n7. **\u98CE\u9669**\uFF1A\u53EF\u80FD\u592A\u6162\u7684\u753B\u9762\uFF08\u5927\u9762\u79EF\u9010\u683C\u8BA1\u7B97\uFF09\u3001\u4E2D\u6587\u5BBD\u5B57\u7B26\u9519\u4F4D\u3001\u957F\u6B4C\u8BCD\u653E\u4E0D\u4E0B\u7B49\uFF0C\u63D0\u524D\u60F3\u597D\u5BF9\u7B56\u3002\n\n\u53EF\u53C2\u8003\u7684\u6210\u719F\u5199\u6CD5\uFF1A`examples/` \u91CC\u7684 chat-window\u3001heartbeat\u3001ops-ticker\u3001token-bar\u3001execution-split\u3001\nwhale-fall\u3001post-effects\uFF0C\u4EE5\u53CA\u5B8C\u6574\u793A\u4F8B `examples/rich-pack/scenes.js`\u3002\n",
  "prompts/zh/02-storyboard.md": "# 02 \u5206\u6BB5\u5206\u955C\n\n**\u8F93\u5165**\uFF1A`notes/brief.md`\u3001\u6BB5\u843D\u8868\uFF08`x-dsh-mv-ai.sections`\uFF09\u3001\u6B4C\u8BCD\u65F6\u95F4\u8F74\u3002\n**\u8F93\u51FA**\uFF1A`notes/storyboard.md`\uFF0C\u6BCF\u4E2A\u6BB5\u843D\u4E00\u5F20\u201C\u5206\u955C\u5361\u201D\uFF0C\u7136\u540E\u636E\u6B64\u5199 `scenes.js`\u3002\n\n\u6BCF\u4E2A\u6BB5\u843D\u5199\u4E00\u5F20\u5361\uFF08\u7167\u6284\u4E0B\u9762\u7684\u683C\u5F0F\uFF09\uFF1A\n\n```\n## <\u6BB5\u843D kind> <start>\u2013<end>s  \uFF08\u60C5\u7EEA x/10\uFF09\n\u753B\u9762\uFF1A\u4E3B\u4F53\u662F\u4EC0\u4E48\u3001\u653E\u5728\u5C4F\u5E55\u54EA\u91CC\u3001\u5360\u591A\u5927\uFF08\u6309 cols\xD7rows \u7684\u6BD4\u4F8B\u5199\uFF0C\u4F8B\u5982\u201C\u5C45\u4E2D\uFF0C\u5BBD 60%\u201D\uFF09\n\u6BCD\u9898\uFF1A\u672C\u6BB5\u51FA\u73B0 / \u53D8\u5316\u7684\u6BCD\u9898\n\u6B4C\u8BCD\uFF1A\u663E\u793A\u65B9\u5F0F\u4E0E\u4F4D\u7F6E\uFF1B\u5F53\u524D\u8BCD\u5982\u4F55\u5F3A\u8C03\uFF08ctx.lyric.word / ctx.lyric.words\uFF09\n\u97F3\u4E50\uFF1A\u54EA\u4E9B\u5143\u7D20\u8DDF bands / bass / beat \u8D70\uFF08\u5982 \u6BCF\u62CD\u95EA\u4E00\u6B21\u3001\u4F4E\u9891\u63A8\u52A8\u534A\u5F84\uFF09\n\u8FD0\u52A8\uFF1A\u968F section.progress \u7684\u53D8\u5316\uFF08\u5F00\u5934 \u2192 \u7ED3\u5C3E\uFF09\uFF0C\u4FDD\u8BC1\u540C\u4E00\u65F6\u523B\u753B\u9762\u56FA\u5B9A\n\u8F6C\u573A\uFF1A\u8FDB\u5165\u548C\u79BB\u5F00\u672C\u6BB5\u7684\u65B9\u5F0F\uFF08\u6DE1\u5165\u6DE1\u51FA\u3001\u64E6\u9664\u3001\u6545\u969C\u3001\u5207\u9ED1\uFF09\uFF0C\u7EA6 0.5\u20131 \u79D2\n\u6027\u80FD\uFF1A\u672C\u6BB5\u6700\u91CD\u7684\u8BA1\u7B97\u662F\u4EC0\u4E48\uFF0C\u4F30\u8BA1\u6BCF\u5E27\u591A\u5C11\u683C\n```\n\n\u8981\u6C42\uFF1A\n\n- \u76F8\u90BB\u6BB5\u843D\u8981\u6709\u660E\u663E\u533A\u522B\uFF08\u6784\u56FE\u6216\u4E3B\u8272\uFF09\uFF0C\u540C\u7C7B\u6BB5\u843D\uFF08\u4E24\u6B21\u526F\u6B4C\uFF09\u8981\u6709\u9012\u8FDB\uFF1A\u7B2C\u4E8C\u6B21\u66F4\u5F3A\u6216\u6709\u65B0\u5143\u7D20\u3002\n- \u6CA1\u6709\u6B4C\u8BCD\u7684\u524D\u594F / \u95F4\u594F / \u5C3E\u58F0\u4E5F\u8981\u6709\u5B8C\u6574\u753B\u9762\uFF0C\u4E0D\u8981\u53EA\u7559\u7A7A\u767D\u3002\n- \u6BB5\u843D\u8868\u7F3A\u5931\u65F6\uFF0C\u6309\u65F6\u957F\u548C\u80FD\u91CF\u81EA\u5DF1\u5212\u5206\uFF0C\u5E76\u5199\u8FDB mv.json \u7684 `x-dsh-mv-ai.sections`\uFF08`[{kind,label,start,end}]`\uFF09\uFF0C\n  \u811A\u672C\u901A\u8FC7 `ctx.section` \u8BFB\u53D6\u3002\n- \u6BCF\u5F20\u5361\u90FD\u8981\u80FD\u5728 `scenes.js` \u91CC\u5BF9\u5E94\u5230\u4E00\u4E2A\u51FD\u6570\uFF08\u5982 `intro(g, t, ctx)`\u3001`chorus(g, t, ctx)`\uFF09\u3002\n",
  "prompts/zh/03-scene-script-guide.md": "# 03 \u573A\u666F\u811A\u672C\u7F16\u5199\u6307\u5357\uFF08scenes.js\uFF09\n\n## \u63A5\u53E3\n\n```js\nfunction setup(info) { }                 // \u53EF\u9009\uFF1Binfo = { title, artist, duration, sections, bpm, beatOffset }\nfunction render(t, cols, rows, ctx) {    // \u6BCF\u5E27\u8C03\u7528\uFF0C\u7EA6 30\u201360 \u6B21/\u79D2\n  return { lines: [...], styles: [...] } // \u6216\u8005\u5B57\u7B26\u4E32\u6570\u7EC4 / \u5E26 \\n \u7684\u5B57\u7B26\u4E32\n}\n```\n\n- `lines[y]` \u662F\u7B2C y \u884C\u6587\u5B57\uFF1B`styles[y]` \u6BCF\u4E2A\u5B57\u7B26\u4E00\u4F4D\u6570\u5B57\uFF1A0 \u6697\u30011 \u666E\u901A\u30012 \u4EAE\u30013 \u767D\u30014 \u7EA2\u30015 \u68D5\u30016 \u6A44\u6984\u3002\n- `ctx`\uFF1A\n  - `duration`\u3001`progress`\uFF080..1\uFF09\u3001`title`\u3001`artist`\u3001`ready`\u3001`paused`\n  - `lyric`\uFF1A`{ text, en, zh, start, end, progress, words: [{text,start,end}], word }` \u6216 null\u3002\n    `words` \u6765\u81EA\u589E\u5F3A LRC \u7684 `<mm:ss.xx>` \u9010\u8BCD\u65F6\u95F4\u6233\uFF0C\u6CA1\u6709\u65F6\u6309\u53E5\u5B50\u524D 70% \u5E73\u5747\u4F30\u8BA1\uFF08\u4E2D\u6587\u6309\u5B57\uFF09\uFF1B`word` \u662F\u6B63\u5728\u5531\u7684\u8BCD\u7684\u4E0B\u6807\uFF08-1 \u8868\u793A\u8FD8\u6CA1\u5F00\u59CB\uFF09\u3002\n  - `next`\uFF1A\u4E0B\u4E00\u53E5 `{ text, en, zh, start, end, progress }`\uFF08\u6CA1\u6709 words\uFF09\n  - `bands`\uFF1A48 \u4E2A 0..1\uFF08\u4F4E\u9891 \u2192 \u9AD8\u9891\uFF09\uFF1B`energy`\u3001`bass`\u3001`mid`\u3001`treble`\uFF1A0..1\n  - `section`\uFF1A`{ kind, label, start, end, index, progress }` \u6216 null\uFF1B`sections`\uFF1A\u5168\u90E8\u6BB5\u843D\n  - `beat`\uFF1Amv.json \u8BBE\u7F6E\u4E86 `canvas.bpm` \u65F6\u4E3A `{ bpm, index, bar, phase, pulse }`\uFF08pulse \u5728\u62CD\u70B9\u4E3A 1 \u5E76\u8FC5\u901F\u8870\u51CF\uFF09\uFF0C\u5426\u5219 null\n\n## \u6C99\u7BB1\u9650\u5236\uFF08\u8FDD\u53CD\u4F1A\u88AB\u505C\u6B62\u5E76\u9000\u56DE\u901A\u7528\u753B\u9762\uFF09\n\n- \u4E0D\u80FD import / require\uFF1B\u6CA1\u6709 DOM\u3001\u7F51\u7EDC\uFF08fetch \u7B49\uFF09\u3001\u5B58\u50A8\u3001\u5B9A\u65F6\u5668\u3001Worker\u3001WebAssembly\uFF1B\u4E0D\u8981\u7528 eval / new Function\u3002\n- \u6587\u672C\u5E27\u9884\u7B97 40 ms\uFF08\u76EE\u6807 < 10 ms\uFF09\uFF0Cpixels/WebGL \u4F4D\u56FE\u5E27\u9884\u7B97 100 ms\uFF1B\u8FDE\u7EED\u592A\u6162\u3001\u5361\u4F4F 1.5 \u79D2\u6216\u629B\u5F02\u5E38\u4F1A\u88AB\u505C\u6B62\u3002\u6587\u672C/2D \u4E0A\u9650 256 KiB\uFF0CWebGL \u4E0A\u9650 2 MiB\u3002\n\n## 3D\uFF08\u63D2\u4EF6 0.9.2+\uFF09\n\ncanvas.output \u8BBE\u4E3A \"webgl\"\uFF0Csize \u4E3A [1280, 720]\uFF1B\u5B9A\u4E49 setup(info, gl) \u548C paint(gl, t, w, h, ctx)\u3002\nThree.js \u4F9D\u8D56\u5148\u79BB\u7EBF\u6253\u5305\uFF0CWebGLRenderer \u663E\u5F0F\u4F20 `{ canvas: info.canvas, context: gl }`\u3002\n\u4E0D\u80FD\u4F9D\u8D56 DOM\u3001fetch/CDN \u52A0\u8F7D\u5668\u6216\u81EA\u5DF1\u7684\u52A8\u753B\u5FAA\u73AF\uFF1B\u7EB9\u7406\u901A\u8FC7 canvas.assets \u63D0\u4F9B\u3002\n\u6309\u7EDD\u5BF9\u65F6\u95F4 t \u91CD\u5EFA\u753B\u9762\u4EE5\u652F\u6301\u62D6\u52A8\u8FDB\u5EA6\u3002Host/CI \u7684\u66FF\u8EAB\u4E0D\u80FD\u9A8C\u8BC1 GPU \u7740\u8272\u5668\uFF0C\u5FC5\u987B\u5728\u771F\u5B9E\u6D4F\u89C8\u5668\u9A8C\u753B\u9762\u3002\n- \u753B\u9762\u5FC5\u987B\u662F `t` \u548C `ctx` \u7684**\u7EAF\u51FD\u6570**\uFF1A\u4E0D\u8981\u4F9D\u8D56\u4E0A\u4E00\u5E27\u7684\u72B6\u6001\u6216 Math.random\uFF08\u62D6\u52A8\u8FDB\u5EA6\u3001\u9884\u89C8\u5DE5\u5177\u90FD\u8981\u5F97\u5230\u540C\u6837\u7684\u753B\u9762\uFF09\u3002\n  \u9700\u8981\u968F\u673A\u5C31\u7528\u786E\u5B9A\u6027\u7684 `hash(i, seed)`\uFF08\u89C1 examples/_grid \u90E8\u5206\uFF09\u3002\u201C\u5386\u53F2\u201D\u6548\u679C\uFF08\u62D6\u5F71\u3001\u5FC3\u7535\u8F68\u8FF9\uFF09\u5C31\u91CD\u65B0\u8BA1\u7B97\u66F4\u65E9\u65F6\u523B `t - dt`\u3002\n\n## \u6027\u80FD\u9884\u7B97\n\n- 100\xD732 \u7684\u7F51\u683C\u53EA\u6709 3200 \u683C\uFF1A\u6BCF\u5E27\u904D\u5386\u51E0\u904D\u6CA1\u95EE\u9898\uFF1B\u907F\u514D\u6BCF\u683C\u5185\u518D\u5957\u5FAA\u73AF\uFF08O(\u683C\u6570\xD7\u5BF9\u8C61\u6570)\uFF09\u3002\n- \u7C92\u5B50\u6570\u91CF\u4E0E\u9762\u79EF\u6210\u6BD4\u4F8B\uFF08\u4F8B\u5982 `cols*rows/40`\uFF09\uFF0C\u4E0D\u8981\u56FA\u5B9A\u51E0\u5343\u4E2A\u3002\n- \u5B57\u7B26\u4E32\u62FC\u63A5\uFF1A\u5148\u7528\u4E8C\u7EF4\u6570\u7EC4 `ch[y][x]`\uFF0C\u6700\u540E `join('')` \u4E00\u6B21\u3002\n- \u7528 `mv_pack_preview_frame` \u770B\u6BCF\u5E27\u8017\u65F6\uFF1B\u8D85\u8FC7 10 ms \u5C31\u7B80\u5316\u3002\n\n## ASCII / \u753B\u5E03\u6280\u5DE7\n\n- **\u5BBD\u5B57\u7B26**\uFF1A\u4E2D\u6587\u3001\u5168\u89D2\u7B26\u53F7\u5360\u4E24\u683C\u3002\u7528\u793A\u4F8B\u91CC\u7684 `setCell/put`\uFF08\u7B2C\u4E8C\u683C\u5B58 ''\uFF09\uFF0C\u5426\u5219\u5BF9\u9F50\u4F1A\u4E71\u3001\u6837\u5F0F\u4F1A\u9519\u4F4D\u3002\n- **\u660E\u6697\u6E10\u53D8**\uFF1A` .:-=+*#%@` \u6216 `\u2591\u2592\u2593\u2588`\uFF1B\u7528 styles 0\u20133 \u505A\u7B2C\u4E8C\u5C42\u4EAE\u5EA6\u3002\n- **\u5F62\u72B6**\uFF1A\u5706 / \u73AF\u7528\u6781\u5750\u6807\uFF0Cx \u65B9\u5411\u4E58 2 \u8865\u507F\u5B57\u7B26\u9AD8\u5BBD\u6BD4\uFF1B\u65B9\u5757\u5927\u5B57\u7528 5\xD73 \u70B9\u9635\u653E\u5927\uFF08examples/execution-split\uFF09\u3002\n- **\u8FB9\u6846\u4E0E\u7A97\u53E3**\uFF1A`\u250C\u2500\u2510\u2502\u2514\u2518`\uFF08examples/chat-window\uFF09\u3002\n- **\u7C92\u5B50**\uFF1A\u4F4D\u7F6E = \u521D\u59CB hash + \u901F\u5EA6 \xD7 t\uFF0C\u53D6\u6A21\u56DE\u5377\uFF08examples/whale-fall\uFF09\u3002\n- **\u540E\u671F**\uFF1A\u5728\u6837\u5F0F\u6570\u5B57\u4E0A\u505A\u626B\u63CF\u7EBF\uFF08\u9694\u884C\u964D\u4E00\u7EA7\uFF09\u3001\u6697\u89D2\uFF08\u79BB\u4E2D\u5FC3\u8FDC\u964D\u7EA7\uFF09\u3001\u6CDB\u5149\uFF08\u4EAE\u683C\u5468\u56F4\u52A0 `.`\uFF09\u3001\u6545\u969C\uFF08\u62CD\u70B9\u65F6\u6574\u884C\u5E73\u79FB\uFF0C\u8DF3\u8FC7\u542B\u5BBD\u5B57\u7B26\u7684\u884C\uFF09\uFF08examples/post-effects\uFF09\u3002\n- **\u8F6C\u573A**\uFF1A\u6BB5\u843D\u8FB9\u7F18 0.5\u20131 \u79D2\u9010\u7EA7\u964D\u4EAE\u5EA6\uFF08\u6DE1\u51FA\uFF09\uFF0C\u6216\u6309 progress \u64E6\u9664\u4E00\u90E8\u5206\u5217\u3002\n\n## \u4E0E\u97F3\u4E50\u540C\u6B65\n\n- **\u6B4C\u8BCD**\uFF1A\u5F53\u524D\u53E5 `ctx.lyric.text`\uFF1B\u9010\u8BCD\u9AD8\u4EAE\u7528 `ctx.lyric.words` + `ctx.lyric.word`\uFF08examples/token-bar\u3001rich-pack \u7684 karaoke\uFF09\uFF1B\n  \u6253\u5B57\u6548\u679C\u7528 `lyric.progress` \u6216\u8BCD\u65F6\u95F4\u3002\u9884\u544A\u4E0B\u4E00\u53E5\u7528 `ctx.next`\uFF08\u6697\u8272\uFF09\u3002\n- **\u9891\u8C31**\uFF1A`bands[i]` \u9A71\u52A8\u67F1\u9AD8 / \u534A\u5F84 / \u7C92\u5B50\u901F\u5EA6\uFF1B`bass` \u9002\u5408\u6574\u4F53\u7F29\u653E\u548C\u95EA\u70C1\uFF0C`treble` \u9002\u5408\u7EC6\u788E\u7C92\u5B50\u3002\n- **\u8282\u62CD**\uFF1A`ctx.beat.pulse` \u505A\u91CD\u97F3\uFF08\u95EA\u767D\u3001\u653E\u5927\u3001\u6545\u969C\uFF09\uFF0C`ctx.beat.bar` \u6BCF\u5C0F\u8282\u6362\u4E00\u6B21\u6784\u56FE\uFF1B\u6CA1\u6709 bpm \u65F6\u7528 `bass` \u8D85\u8FC7\u9608\u503C\u3002\n- **\u6BB5\u843D**\uFF1A`ctx.section.kind` \u9009\u62E9\u573A\u666F\u51FD\u6570\uFF0C`ctx.section.progress` \u9A71\u52A8\u6BB5\u5185\u8FD0\u52A8\u3002\n- **\u9759\u97F3\u5305**\uFF1A\u6CA1\u6709\u97F3\u9891\u65F6 bands \u5168\u4E3A 0\uFF0C\u7528\u793A\u4F8B\u7684 `energyOf/bandOf` \u751F\u6210\u66FF\u4EE3\u8FD0\u52A8\uFF0C\u907F\u514D\u9884\u89C8\u65F6\u753B\u9762\u6B7B\u677F\u3002\n\n## \u7ED3\u6784\u5EFA\u8BAE\n\n```js\n/* \u5DE5\u5177\u51FD\u6570\uFF08\u590D\u5236 examples \u91CC\u7684\u7F51\u683C\u5DE5\u5177\uFF09 */\nfunction intro(g, t, ctx, p) { ... }\nfunction verse(g, t, ctx, p) { ... }\nfunction chorus(g, t, ctx, p) { ... }\nfunction render(t, cols, rows, ctx) {\n  var g = makeGrid(cols, rows), s = ctx.section\n  var kind = s ? s.kind : 'verse'\n  ;({ intro: intro, verse: verse, chorus: chorus }[kind] || verse)(g, t, ctx, s ? s.progress : ctx.progress)\n  /* \u8F6C\u573A + \u540E\u671F */\n  return frameOf(g)\n}\n```\n\n\u4E0D\u540C\u7A97\u53E3\u5927\u5C0F\u90FD\u8981\u80FD\u770B\uFF08cols 40\u2013240\uFF0Crows 12\u201385\uFF09\uFF1A\u4F4D\u7F6E\u6309\u6BD4\u4F8B\u7B97\uFF0C\u6587\u5B57\u653E\u4E0D\u4E0B\u5C31\u622A\u65AD\u3002\n",
  "prompts/zh/04-qa-checklist.md": '# 04 \u81EA\u68C0\u6E05\u5355\uFF08\u4EA4\u4ED8\u524D\u9010\u6761\u786E\u8BA4\uFF09\n\n## \u5FC5\u987B\u901A\u8FC7\n\n- [ ] `mv_pack_validate`\uFF08path = \u5305\u6587\u4EF6\u5939\uFF09\u6CA1\u6709\u9519\u8BEF\uFF1Bmv.json \u662F\u5408\u6CD5 JSON\uFF0C`canvas.renderer` \u4E3A `"script"`\u3001`canvas.script` \u6307\u5411 `scenes.js`\u3002\n- [ ] \u6B4C\u8BCD\u6765\u81EA\u7528\u6237\u7684\u6587\u4EF6\uFF0C\u6CA1\u6709\u7F16\u9020\u3001\u6539\u5199\u6216\u8865\u5168\uFF1B\u65F6\u95F4\u8F74\u5355\u8C03\u9012\u589E\uFF0C\u4E0D\u8D85\u8FC7\u65F6\u957F\u3002\n- [ ] \u6CA1\u6709\u4FEE\u6539\u3001\u8F6C\u7801\u3001\u5220\u9664\u97F3\u9891\uFF1B\u6CA1\u6709\u8054\u7F51\u4E0B\u8F7D\u7D20\u6750\uFF1B\u53EA\u6539\u52A8\u4E86\u5305\u6587\u4EF6\u5939\u91CC\u7684\u6587\u4EF6\u3002\n- [ ] scenes.js \u6CA1\u6709 import / require / eval / new Function / fetch\uFF0C\u6CA1\u6709 Math.random \u6216\u4F9D\u8D56\u4E0A\u4E00\u5E27\u7684\u72B6\u6001\u3002\n- [ ] \u7528 `mv_pack_preview_frame` \u81F3\u5C11\u770B\u4E86\uFF1A0 \u79D2\u3001\u6BCF\u4E2A\u6BB5\u843D\u7684\u4E2D\u95F4\u3001\u6BCF\u6B21\u6BB5\u843D\u5207\u6362\u524D\u540E 0.3 \u79D2\u3001\u6700\u540E 2 \u79D2\u3002\n- [ ] \u6CA1\u6709\u7A7A\u767D\u5E27\u3001\u6CA1\u6709\u62A5\u9519\uFF1B\u6BCF\u5E27\u8017\u65F6 < 10 ms\uFF08\u786C\u4E0A\u9650 40 ms\uFF09\u3002\n\n## \u753B\u9762\u8D28\u91CF\n\n- [ ] \u6BCF\u4E2A\u6BB5\u843D\u4E00\u773C\u80FD\u533A\u5206\uFF1B\u7B2C\u4E8C\u6B21\u526F\u6B4C\u6BD4\u7B2C\u4E00\u6B21\u66F4\u5F3A\u6216\u6709\u65B0\u5143\u7D20\u3002\n- [ ] \u5F53\u524D\u6B4C\u8BCD\u603B\u662F\u6E05\u695A\u53EF\u8BFB\uFF08\u80CC\u666F\u6E05\u7A7A\u4E00\u6761\u3001\u6837\u5F0F 3 \u6216 2\uFF09\uFF0C\u9010\u8BCD\u9AD8\u4EAE\u4E0E\u5531\u7684\u8BCD\u4E00\u81F4\u3002\n- [ ] \u753B\u9762\u5728\u62CD\u70B9 / \u4F4E\u9891\u4E0A\u6709\u660E\u663E\u53CD\u5E94\uFF0C\u4F46\u4E0D\u4F1A\u6BCF\u5E27\u4E71\u95EA\uFF08\u95EA\u70C1\u9891\u7387 \u2264 \u6BCF\u62CD\u4E00\u6B21\uFF09\u3002\n- [ ] \u4E2D\u6587\u5BBD\u5B57\u7B26\u5BF9\u9F50\u6B63\u786E\uFF0C\u8FB9\u6846\u4E0D\u88AB\u6324\u6B6A\uFF1B\u957F\u6B4C\u8BCD\u88AB\u622A\u65AD\u800C\u4E0D\u662F\u6362\u884C\u9519\u4F4D\u3002\n- [ ] \u5C0F\u7A97\u53E3\uFF08\u7EA6 60\xD718\uFF09\u548C\u5927\u7A97\u53E3\uFF08\u7EA6 160\xD748\uFF09\u90FD\u80FD\u770B\uFF1A\u6CA1\u6709\u8D8A\u754C\u3001\u4E3B\u4F53\u4ECD\u7136\u5C45\u4E2D\u3002\n- [ ] \u524D\u594F\u3001\u95F4\u594F\u3001\u5C3E\u58F0\u6709\u5B8C\u6574\u753B\u9762\uFF1B\u7ED3\u5C3E\u6709\u6536\u675F\uFF08\u6DE1\u51FA\u3001\u5B9A\u683C\u6216\u8C22\u5E55\u5B57\u6837\uFF09\u3002\n- [ ] credits / notice \u5199\u6E05\u695A\uFF1A\u6B4C\u66F2\u7248\u6743\u5C5E\u4E8E\u539F\u4F5C\u8005\uFF0C\u7D20\u6750\u6765\u6E90\u4E0E\u8BB8\u53EF\u3002\n\n## \u53D1\u73B0\u95EE\u9898\u65F6\n\n\u628A\u95EE\u9898\u5199\u8FDB `notes/qa.md`\uFF08\u65F6\u95F4\u70B9\u3001\u73B0\u8C61\u3001\u539F\u56E0\u3001\u4FEE\u6539\uFF09\uFF0C\u4FEE\u6539\u540E\u91CD\u65B0\u9884\u89C8\u540C\u4E00\u65F6\u95F4\u70B9\uFF0C\u518D\u7EE7\u7EED\u4E0B\u4E00\u6761\u3002\n',
  "prompts/zh/05-iteration.md": "# 05 \u8FED\u4EE3\u63D0\u793A\u8BCD\uFF08\u7528\u6237\u60F3\u6539\u7684\u65F6\u5019\u76F4\u63A5\u590D\u5236\u7ED9 AI\uFF09\n\n\u6BCF\u6B21\u53EA\u6539\u4E00\u4EF6\u4E8B\uFF0C\u6539\u5B8C\u7528 `mv_pack_preview_frame` \u9884\u89C8\u76F8\u5173\u65F6\u95F4\u70B9\u5E76\u8DD1\u4E00\u904D 04 \u81EA\u68C0\u6E05\u5355\u3002\n\n- **\u6574\u4F53\u66F4\u70AB**\uFF1A\u201C\u526F\u6B4C\u52A0\u5F3A\uFF1A\u62CD\u70B9\uFF08ctx.beat.pulse > 0.7\uFF09\u65F6\u5168\u5C4F\u95EA\u767D\u4E00\u5E27\u5E76\u6574\u4F53\u653E\u5927 10%\uFF0C\u52A0\u5165 post-effects \u7684\u626B\u63CF\u7EBF\u548C\u6697\u89D2\uFF0C\u5176\u4F59\u6BB5\u843D\u4FDD\u6301\u4E0D\u53D8\u3002\u201D\n- **\u66F4\u8D34\u6B4C\u8BCD**\uFF1A\u201C\u4E3B\u6B4C\u6539\u4E3A\u9010\u8BCD\u6253\u5B57\uFF1A\u53EA\u663E\u793A ctx.lyric.words \u91CC\u5DF2\u7ECF\u5531\u5230\u7684\u8BCD\uFF0C\u5F53\u524D\u8BCD\u7528\u6837\u5F0F 3\uFF0C\u4E0B\u4E00\u53E5\u7528\u6837\u5F0F 0 \u9884\u544A\u5728\u4E0B\u65B9\u3002\u201D\n- **\u8282\u594F\u4E0D\u51C6**\uFF1A\u201C\u628A canvas.bpm \u6539\u6210 <BPM>\uFF0Ccanvas.beatOffset \u6539\u6210 <\u79D2>\uFF0C\u8BA9\u7B2C\u4E00\u62CD\u843D\u5728 <\u65F6\u95F4> \u79D2\uFF1B\u68C0\u67E5 <\u65F6\u95F4> \u524D\u540E 2 \u79D2\u7684\u9884\u89C8\u3002\u201D\n- **\u6BB5\u843D\u4E0D\u5BF9**\uFF1A\u201C\u6309\u8FD9\u4E9B\u65F6\u95F4\u91CD\u5199 x-dsh-mv-ai.sections\uFF1A<kind start\u2013end \u5217\u8868>\uFF0C\u573A\u666F\u968F\u4E4B\u8C03\u6574\u3002\u201D\n- **\u592A\u6162 / \u5361\u987F**\uFF1A\u201C\u627E\u51FA\u6BCF\u5E27\u6700\u6162\u7684\u6BB5\u843D\uFF0C\u628A\u7C92\u5B50\u6570\u6539\u6210\u4E0E\u9762\u79EF\u6210\u6BD4\u4F8B\uFF08cols*rows/50\uFF09\uFF0C\u53BB\u6389\u6BCF\u683C\u5185\u7684\u5D4C\u5957\u5FAA\u73AF\uFF0C\u76EE\u6807\u6BCF\u5E27 < 8 ms\u3002\u201D\n- **\u6362\u98CE\u683C**\uFF1A\u201C\u4FDD\u6301\u7ED3\u6784\u548C\u6B4C\u8BCD\u540C\u6B65\u4E0D\u53D8\uFF0C\u628A\u6574\u4F53\u98CE\u683C\u6362\u6210 <\u98CE\u683C>\uFF1A\u8C03\u8272\u53EA\u7528\u6837\u5F0F <\u5217\u8868>\uFF0C\u5B57\u7B26\u96C6\u6362\u6210 <\u5B57\u7B26>\u3002\u201D\n- **\u52A0\u4E00\u4E2A\u573A\u666F**\uFF1A\u201C\u5728\u6865\u6BB5\u52A0\u5165 examples/<\u793A\u4F8B\u540D>.scene.js \u7684\u6548\u679C\uFF0C\u6539\u6210\u9002\u5408\u672C\u6B4C\u7684\u6587\u5B57\u548C\u8282\u594F\uFF0C\u4E0E\u524D\u540E\u6BB5\u843D\u7528 0.8 \u79D2\u6DE1\u5165\u6DE1\u51FA\u8854\u63A5\u3002\u201D\n- **\u5C0F\u7A97\u53E3\u96BE\u770B**\uFF1A\u201C\u5728 cols < 70 \u6216 rows < 20 \u65F6\u4F7F\u7528\u7B80\u5316\u5E03\u5C40\uFF1A\u9690\u85CF\u88C5\u9970\u8FB9\u6846\uFF0C\u53EA\u4FDD\u7559\u4E3B\u4F53\u548C\u6B4C\u8BCD\u3002\u201D\n- **\u51C6\u5907\u53D1\u5E03\u5230\u5DE5\u574A**\uFF1A\u201C\u68C0\u67E5 credits / notice / x-dsh-mv-workshop.license \u662F\u5426\u5B8C\u6574\uFF1B\u786E\u8BA4\u5305\u91CC\u6CA1\u6709\u97F3\u9891\u548C\u6B4C\u8BCD\u539F\u6587\u4EE5\u5916\u4E0D\u8BE5\u6709\u7684\u6587\u4EF6\uFF08\u53D1\u5E03\u65F6\u63D2\u4EF6\u4F1A\u81EA\u52A8\u5265\u79BB\u97F3\u9891\u548C\u6B4C\u8BCD\u6587\u672C\uFF0C\u53EA\u4FDD\u7559\u65F6\u95F4\u8F74\uFF09\u3002\u201D\n"
});

// .dsh-plugin/shared/mv-pack-template.mjs
var TEMPLATE_FOLDER = "dsh-mv-pack-template";
var json = (value) => `${JSON.stringify(value, null, 2)}
`;
var TEMPLATE_MANIFEST = Object.freeze({
  $schema: `./${MV_PACK_SCHEMA_FILE}`,
  format: MV_PACK_FORMAT,
  version: MV_PACK_VERSION,
  title: "Song title / \u6B4C\u540D",
  artist: "Artist / \u6B4C\u624B",
  credits: ["Music & lyrics: \u2026 (rights belong to their owners)", "Pack made by: \u2026"],
  notice: "Personal use. The audio and lyric files are your own copies and are not redistributed.",
  audio: { file: "song.mp3", offset: 0 },
  lyrics: { file: "lyrics.lrc", offset: 0 },
  canvas: { renderer: "generic" }
});
var fileRef = (description, offset) => ({
  oneOf: [
    { type: "string", description },
    {
      type: "object",
      additionalProperties: false,
      required: ["file"],
      properties: { file: { type: "string", description }, ...offset ? { offset: { type: "number", minimum: -30, maximum: 30, description: offset } } : {} }
    }
  ]
});
var MV_PACK_JSON_SCHEMA = Object.freeze({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "dsh-mv-pack/1",
  title: "dsh-mv MV pack (mv.json)",
  type: "object",
  required: ["format", "version", "title"],
  patternProperties: { "^x-": {} },
  additionalProperties: false,
  properties: {
    $schema: { type: "string" },
    format: { const: MV_PACK_FORMAT },
    version: { const: MV_PACK_VERSION },
    title: { type: "string", minLength: 1, maxLength: 200 },
    artist: { type: "string", maxLength: 200 },
    album: { type: "string", maxLength: 200 },
    credits: { type: "array", maxItems: 50, items: { type: "string", maxLength: 500 } },
    notice: { type: "string", maxLength: 4e3 },
    duration: { type: "number", minimum: 1, maximum: 36e3, description: "Song length in seconds; defaults to the audio length." },
    audio: fileRef("Audio file, relative to this mv.json (no ..) or absolute.", "Seconds added to the audio clock (sync)."),
    lyrics: fileRef("LRC / SRT / VTT / lyrics.json ([{time,end,en,zh}]) or lyrics.js / .mjs (static LYRICS = [{t,en,cn}]; never executed). Workshop packs (0.9.4+) may include explicitly licensed, attributed lyrics via a package-relative file.", "Seconds added to lyric times."),
    spectrum: fileRef("Optional spectrum.json ({fps, frames: number[48][]})."),
    canvas: {
      type: "object",
      additionalProperties: false,
      patternProperties: { "^x-": {} },
      properties: {
        renderer: { enum: MV_RENDERERS_BUILTIN, default: "generic", description: "generic | script (needs canvas.script) | dsh-pv (needs canvas.assets; used by the dsh PV workshop pack)." },
        assets: { type: "object", description: "Data files a renderer reads (name \u2192 relative .json/.webp/.png path, or a list of JSON shards). Used by dsh-pv; since 0.9.1 scene scripts get them in setup(info).assets. Since 0.9.5 only dsh-pv font-head / font-banner may name the supported local OFL TTF files.", properties: { "font-head": { const: "fonts/SpaceMono-Bold.ttf" }, "font-banner": { const: "fonts/Anton-Regular.ttf" } }, additionalProperties: { oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] } },
        output: { enum: ["text", "pixels", "webgl"], default: "text", description: "text: render(t, cols, rows, ctx); pixels (0.9.1+): paint(g, t, width, height, ctx) on Canvas2D; webgl (0.9.2+): setup(info, gl), paint(gl, t, width, height, ctx) on sandbox-owned WebGL2. Bundle dependencies before importing." },
        size: { type: "array", items: { type: "integer" }, minItems: 2, maxItems: 2, default: [1280, 720], description: "Bitmap scenes: canvas size [width, height] (160\u20131920 \xD7 90\u20131080), letterboxed in the panel." },
        subtitles: { type: "boolean", default: false, description: '0.9.3+: opt-in player overlay of local or installed workshop lyric cues; only renderer "script" with output "pixels" or "webgl". Keep off if the scene draws its own subtitles.' },
        script: { type: "string", pattern: "\\.m?js$", description: 'Scene script (.js) for renderer "script": defines render(t, cols, rows, ctx). Runs sandboxed in the panel.' },
        fontSize: { type: "number", minimum: 8, maximum: 32 },
        bpm: { type: "number", minimum: 20, maximum: 400, description: "Song tempo for scene scripts: ctx.beat = { bpm, index, bar, phase, pulse }." },
        beatOffset: { type: "number", minimum: -60, maximum: 60, description: "Time of the first beat in seconds (default 0)." }
      },
      allOf: [{ if: { required: ["assets"], properties: { assets: { anyOf: [{ required: ["font-head"] }, { required: ["font-banner"] }] } } }, then: { required: ["renderer"], properties: { renderer: { const: "dsh-pv" } } } }]
    },
    "x-dsh-mv-workshop": {
      type: "object",
      additionalProperties: true,
      description: "Workshop metadata. Publishing requires id, version, license and author. If lyrics is present, also declare lyricsLicense and lyricsCredit; scene-code licensing does not grant lyric/translation distribution rights. Music/video never ship in a workshop pack.",
      properties: {
        id: { type: "string", pattern: "^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$" },
        version: { type: "string", pattern: "^\\d{1,4}\\.\\d{1,4}\\.\\d{1,4}$" },
        requires: { type: "string", description: "Minimum plugin version. A workshop pack with lyrics or spectrum requires 0.9.4 or newer." },
        license: { type: "string", minLength: 1, maxLength: 120, description: "Shareable license for the pack/visual code, not automatically its lyrics or music." },
        author: { type: "string", minLength: 1, maxLength: 120 },
        lyricsLicense: { type: "string", minLength: 1, maxLength: 120, description: "Required when sharing lyric text: explicit distribution terms covering lyrics and translations, including any non-commercial restrictions. Unknown, UNLICENSED or pending permission is rejected; this is never inferred from MIT scene code." },
        lyricsCredit: { type: "string", minLength: 1, maxLength: 500, description: "Required lyric author and translator attribution, kept with the installed pack." },
        lyricsSource: { type: "string", maxLength: 300, pattern: '^https://[^\\s"<>]{3,300}$', description: "Optional HTTPS source or authorization/guideline link; not a remote lyric file to load." },
        lyricsTiming: { type: "string", description: "Optional lyrics.timing.json: pure cue times and normalized-text hashes only, never text." },
        fontsLicense: { const: "OFL-1.1", description: "Required when dsh-pv includes its supported OFL font files; not inherited from scene-code licensing." },
        fontsCredit: { type: "string", minLength: 1, maxLength: 500, description: "Required original font authors/copyright attribution." },
        fontsNotice: { const: "fonts/NOTICE.md", description: "Required bundled font attribution notice; include each matching fonts/OFL_*.txt in full." }
      }
    },
    terminal: { deprecated: true, description: "Ignored since 0.6.0: the panel no longer runs external TUI players." }
  }
});
var README_EN = `# dsh-mv MV pack template

An MV pack is a folder with an \`mv.json\` file. It tells the **MV \u653E\u6620\u5BA4** panel of
DeepSeek Harness which song to play and how to draw it. You provide the audio and
lyric files. The pack is plain JSON; \`mv.schema.json\` gives editors such as
VS Code completion and checks.

## Quick start

1. Copy this folder and rename it (e.g. \`My Song\`).
2. Put your own audio file next to \`mv.json\` (e.g. \`song.mp3\`) and your lyrics
   (\`lyrics.lrc\`, \`.srt\`, \`.vtt\`, \`lyrics.json\` or \`lyrics.js\`). Replace \`lyrics.example.lrc\`.
3. Edit \`mv.json\`: title, artist, file names.
4. Harness \u2192 MV \u653E\u6620\u5BA4 \u2192 **\u5BFC\u5165 MV \u5305\u2026** \u2192 choose the folder (or paste the path of
   \`mv.json\`). Importing never runs anything.

## Fields

| Field | Required | Meaning |
| --- | --- | --- |
| \`format\`, \`version\` | yes | Always \`"${MV_PACK_FORMAT}"\` and \`${MV_PACK_VERSION}\`. |
| \`title\` | yes | Song title. \`artist\`, \`album\` are optional. |
| \`credits\`, \`notice\` | no | Shown in the panel: who made what, rights notice. |
| \`duration\` | no | Seconds. Defaults to the audio file's length. |
| \`audio\` | no | \`{ "file": "song.mp3", "offset": 0 }\`. Without audio the MV plays silently. \`offset\` (\xB130 s) shifts the picture against the audio. |
| \`lyrics\` | no | \`{ "file": "lyrics.lrc", "offset": 0 }\`. Bilingual LRC: two lines with the same time stamp, or \`English / \u4E2D\u6587\` on one line. |
| \`spectrum\` | no | \`{ "file": "spectrum.json" }\` with \`{ fps, frames }\` (48 bands per frame). Without it the panel analyses the audio live. |
| \`canvas.renderer\` | no | \`generic\` (spectrum bars + title + lyrics; works for any song), \`script\` (your own scene script, see below) or \`dsh-pv\` (the dsh PV renderer; its data comes from \`canvas.assets\`, see the dsh PV pack in \u521B\u610F\u5DE5\u574A). |
| \`canvas.script\` | no | \`scenes.js\`: the scene script for \`script\` (setting it implies \`renderer: "script"\`). |
| \`canvas.fontSize\` | no | 8\u201332 px. |
| \`canvas.bpm\`, \`canvas.beatOffset\` | no | Tempo (20\u2013400) and first-beat time for scene scripts (\`ctx.beat\`). |
| \`canvas.output\`, \`canvas.size\` | no | \`"pixels"\` (0.9.1+) draws Canvas2D with \`paint(g, t, width, height, ctx)\`; \`"webgl"\` (0.9.2+) draws WebGL2 with \`paint(gl, t, width, height, ctx)\`. Size defaults to \`[1280, 720]\`. \`setup(info, gl)\` receives JSON/ImageBitmap assets; WebGL also gets \`info.canvas\`, a minimal facade for an explicitly supplied Three.js context. |
| \`canvas.subtitles\` | no | \`true\` (0.9.3+) overlays the user's local bilingual lyrics on a \`script\` bitmap (\`pixels\` / \`webgl\`). Defaults to \`false\`; leave off when the scene already draws subtitles. |
| \`x-dsh-mv-ai.sections\` | no | Song sections \`[{ kind, label, start, end }]\` for scene scripts (\`ctx.section\`). |
| \`x-dsh-mv-workshop\` | no | Workshop data (id, version, license, author, audio duration / fingerprint; explicit lyric terms/credits when included); written by \u53D1\u5E03\u5230\u5DE5\u574A. |

Paths are relative to the folder of \`mv.json\` (\`/\` or \`\\\\\`; \`..\` is not allowed)
or absolute. Unknown fields are errors; put your own data in fields starting with \`x-\`.
A \`terminal\` section from packs made for versions before 0.6.0 is ignored with a
warning (the panel no longer runs external players).

Local \`lyrics.js\` / \`.mjs\` files may declare a static \`LYRICS\` array with
\`{ t, en, cn }\` entries, including \`export const LYRICS = [...]\` as in
wiers-jack's MV. Only those data literals are read; helper functions are not
executed, and expressions or imports inside the data are not supported. Do not
rename JavaScript to JSON.

## Complete workshop packs (0.9.4+)

Publishing removes **only music/video**. With the necessary permissions, keep
lyrics, translations, cue timing, precomputed spectrum, cover art, scene code and
all referenced \`canvas.assets\` together. Install/update downloads every indexed
file, verifies its SHA256 and automatically loads the declared lyric and spectrum
files. The listener only needs to supply their own music; older timing-only packs
remain supported and can still use a local lyric file.

- Point \`lyrics.file\` to a package-relative LRC/SRT/VTT/JSON/TXT/JS/MJS file,
  and declare \`x-dsh-mv-workshop.lyricsLicense\` (explicit sharing terms) plus
  \`lyricsCredit\` (lyric author/translator). \`lyricsSource\` is an optional
  HTTPS source or permission/guideline link, not a remote download reference.
- Lyric and translation rights are independent of the visual code's MIT or
  other license. Respect non-commercial and attribution conditions. Pending or
  unknown permission is not publishable; no license is filled in automatically.
- Lyric JS is data, never a scene: only a static \`LYRICS\` array is read, with
  no execution/imports. Lyrics and spectrum data are limited to 512 KiB each.
  \`lyrics.timing.json\` remains times/hashes only, even in a complete pack.
- \`spectrum.file\` may reference local \`{ fps, bands?, frames }\` JSON with
  consistent numeric bands in 0\u20131 (not audio samples or base64 music). No spectrum
  file is necessary when using the live analyser. These packs require 0.9.4+.

## Optional dsh-pv fonts (0.9.5+)

The dsh-pv renderer may declare \`canvas.assets["font-head"] = "fonts/SpaceMono-Bold.ttf"\`
and \`canvas.assets["font-banner"] = "fonts/Anton-Regular.ttf"\`. Each is one local TTF
file, at most 512 KiB, loaded from pack bytes with fixed scoped font families and
weights. Other font keys, font shards, URLs and script-supplied font faces are
not supported. Declared fonts must load successfully; undeclared fonts preserve
the older local/system fallback behavior.

When publishing them, declare \`fontsLicense: "OFL-1.1"\`, \`fontsCredit\` and
\`fontsNotice: "fonts/NOTICE.md"\` in \`x-dsh-mv-workshop\`. Include that attribution
notice and the matching full \`fonts/OFL_spacemono.txt\` / \`fonts/OFL_anton.txt\`.
These font terms are independent of the visual code and artwork. Windows fonts
such as Consolas, Microsoft YaHei and Segoe UI are only used when installed on
the listener's computer; do not copy their font files or glyph atlases into a pack.

## Audio formats

Anything the panel's Chromium can decode works: MP3, M4A/AAC
(including DASH/fragmented MP4 downloads), the audio track of MP4/MOV/WebM/MKV
video files, Ogg Vorbis/Opus, FLAC, WAV (PCM / float / A-law / \u03BC-law). The format
is detected from the file's content, not its extension. For a pack's audio in a
format Chromium cannot decode (WMA, AIFF, AMR, AC-3, APE, \u2026) the panel offers to
convert it with ffmpeg if it is installed (PATH or \`D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe\`)
into a cached WAV (\`%LOCALAPPDATA%\\dsh-mv\\audio-cache\`); it asks before running it.

## Scene scripts (\`canvas.renderer: "script"\`)

\`\`\`json
"canvas": { "renderer": "script", "script": "scenes.js" }
\`\`\`

\`scenes.js\` defines \`render(t, cols, rows, ctx)\` (and optionally \`setup(info)\`). It returns
an array of \`rows\` strings, or \`{ lines, styles }\` where \`styles[y]\` has one digit per
cell (0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive). \`ctx\` is
\`{ duration, progress, title, artist, lyric, next, bands[48], energy, bass, mid, treble, ready, paused, section, sections, beat }\`:

- \`lyric\`: \`{ text, en, zh, start, end, progress, words: [{ text, start, end }], word }\` or null. Words come from
  enhanced-LRC word stamps (\`[00:12.00]<00:12.00>first <00:12.50>word\`), otherwise they are estimated; \`word\`
  is the index of the word being sung. \`next\` is the next line (without words).
- \`section\`: \`{ kind, label, start, end, index, progress }\` from \`x-dsh-mv-ai.sections\`, or null.
- \`beat\`: \`{ bpm, index, bar, phase, pulse }\` when \`canvas.bpm\` is set, else null.

The script runs in a Web Worker without network, storage, DOM or imports. A frame
should take under ${SCENE_LIMITS.frameBudgetMs} ms; a script that throws, hangs for
${SCENE_LIMITS.hardTimeoutMs} ms or is too slow is stopped and the panel falls back to the
\`generic\` renderer. \`examples/scenes.example.js\` is a working example.

### Real 3D (0.9.2+)

Use \`"canvas": { "renderer": "script", "script": "scenes.js", "output": "webgl", "size": [1280, 720] }\`.
WebGL scenes must define \`paint(gl, t, w, h, ctx)\`; initialize GPU resources in
\`setup(info, gl)\`. A bundled Three.js renderer must use
\`new THREE.WebGLRenderer({ canvas: info.canvas, context: gl })\`, never DOM or its own animation loop.
Scene time comes from \`t\`, not accumulated frame deltas: seeking must reconstruct the same frame.
Text/pixels scenes remain limited to 256 KiB; WebGL scenes to 2 MiB, with a 100 ms bitmap frame budget.
The Node preview records calls only; verify shader compilation, textures and output in a real browser.
HTML, remote/CDN imports, fetch, timers and DOM-dependent libraries are not supported.

The former built-in world.execute(me) presets are now workshop packs (MV \u653E\u6620\u5BA4 \u2192 \u521B\u610F\u5DE5\u574A);
install one and open its folder to see a complete script pack and a \`canvas.assets\` pack.
`;
var README_ZH = `# dsh-mv MV \u5305\u6A21\u677F

MV \u5305\u5C31\u662F\u4E00\u4E2A\u5E26 \`mv.json\` \u7684\u6587\u4EF6\u5939\uFF0C\u544A\u8BC9 DeepSeek Harness \u7684 **MV \u653E\u6620\u5BA4**\uFF1A\u64AD\u653E\u54EA\u9996\u6B4C\u3001
\u7528\u4EC0\u4E48\u65B9\u5F0F\u753B\u3002\u97F3\u9891\u548C\u6B4C\u8BCD\u6587\u4EF6\u7531\u4F60\u81EA\u5DF1\u63D0\u4F9B\u3002\u6E05\u5355\u662F\u666E\u901A JSON\uFF1B\`mv.schema.json\` \u8BA9
VS Code \u7B49\u7F16\u8F91\u5668\u63D0\u4F9B\u8865\u5168\u548C\u6821\u9A8C\u3002

## \u5FEB\u901F\u5F00\u59CB

1. \u590D\u5236\u672C\u6587\u4EF6\u5939\u5E76\u6539\u540D\uFF08\u4F8B\u5982 \`\u6211\u7684\u6B4C\`\uFF09\u3002
2. \u628A\u4F60\u81EA\u5DF1\u7684\u97F3\u9891\uFF08\u5982 \`song.mp3\`\uFF09\u548C\u6B4C\u8BCD\uFF08\`lyrics.lrc\` / \`.srt\` / \`.vtt\` / \`lyrics.json\` / \`lyrics.js\`\uFF09
   \u653E\u5230 \`mv.json\` \u65C1\u8FB9\uFF08\u66FF\u6362 \`lyrics.example.lrc\`\uFF09\u3002
3. \u7F16\u8F91 \`mv.json\`\uFF1A\u6B4C\u540D\u3001\u6B4C\u624B\u3001\u6587\u4EF6\u540D\u3002
4. Harness \u2192 MV \u653E\u6620\u5BA4 \u2192 **\u5BFC\u5165 MV \u5305\u2026** \u2192 \u9009\u62E9\u8BE5\u6587\u4EF6\u5939\uFF08\u6216\u7C98\u8D34 \`mv.json\` \u7684\u8DEF\u5F84\uFF09\u3002\u5BFC\u5165\u4E0D\u4F1A\u8FD0\u884C\u4EFB\u4F55\u7A0B\u5E8F\u3002

## \u5B57\u6BB5

| \u5B57\u6BB5 | \u5FC5\u586B | \u542B\u4E49 |
| --- | --- | --- |
| \`format\`\u3001\`version\` | \u662F | \u56FA\u5B9A\u4E3A \`"${MV_PACK_FORMAT}"\` \u548C \`${MV_PACK_VERSION}\`\u3002 |
| \`title\` | \u662F | \u6B4C\u540D\uFF1B\`artist\`\u3001\`album\` \u53EF\u9009\u3002 |
| \`credits\`\u3001\`notice\` | \u5426 | \u9762\u677F\u91CC\u663E\u793A\u7684\u5236\u4F5C\u4FE1\u606F\u4E0E\u7248\u6743\u8BF4\u660E\u3002 |
| \`duration\` | \u5426 | \u79D2\uFF1B\u9ED8\u8BA4\u53D6\u97F3\u9891\u957F\u5EA6\u3002 |
| \`audio\` | \u5426 | \`{ "file": "song.mp3", "offset": 0 }\`\uFF1B\u6CA1\u6709\u97F3\u9891\u65F6\u9759\u97F3\u64AD\u653E\u753B\u9762\u3002\`offset\`\uFF08\xB130 \u79D2\uFF09\u8C03\u6574\u753B\u9762\u4E0E\u97F3\u9891\u7684\u540C\u6B65\u3002 |
| \`lyrics\` | \u5426 | \`{ "file": "lyrics.lrc", "offset": 0 }\`\uFF1B\u53CC\u8BED LRC\uFF1A\u540C\u4E00\u65F6\u95F4\u6233\u5199\u4E24\u884C\uFF0C\u6216\u4E00\u884C\u5199 \`English / \u4E2D\u6587\`\u3002 |
| \`spectrum\` | \u5426 | \`{ "file": "spectrum.json" }\`\uFF0C\u683C\u5F0F \`{ fps, frames }\`\uFF08\u6BCF\u5E27 48 \u4E2A\u9891\u6BB5\uFF09\uFF1B\u4E0D\u586B\u5219\u5B9E\u65F6\u5206\u6790\u97F3\u9891\u3002 |
| \`canvas.renderer\` | \u5426 | \`generic\`\uFF08\u901A\u7528\uFF1A\u9891\u8C31 + \u6807\u9898 + \u6B4C\u8BCD\uFF0C\u4EFB\u4F55\u6B4C\u90FD\u80FD\u653E\uFF09\u3001\`script\`\uFF08\u4F60\u81EA\u5DF1\u7684\u573A\u666F\u811A\u672C\uFF0C\u89C1\u4E0B\uFF09\u6216 \`dsh-pv\`\uFF08dsh PV \u6E32\u67D3\u5668\uFF0C\u6570\u636E\u6765\u81EA \`canvas.assets\`\uFF0C\u53C2\u8003\u521B\u610F\u5DE5\u574A\u91CC\u7684 dsh PV \u5305\uFF09\u3002 |
| \`canvas.script\` | \u5426 | \`scenes.js\`\uFF1A\`script\` \u6E32\u67D3\u5668\u7528\u7684\u573A\u666F\u811A\u672C\uFF08\u586B\u4E86\u5B83\u5C31\u9ED8\u8BA4 \`renderer: "script"\`\uFF09\u3002 |
| \`canvas.fontSize\` | \u5426 | 8\u201332 \u50CF\u7D20\u3002 |
| \`canvas.bpm\`\u3001\`canvas.beatOffset\` | \u5426 | \u6B4C\u66F2\u901F\u5EA6\uFF0820\u2013400\uFF09\u548C\u7B2C\u4E00\u62CD\u65F6\u95F4\uFF0C\u4F9B\u573A\u666F\u811A\u672C\u4F7F\u7528\uFF08\`ctx.beat\`\uFF09\u3002 |
| \`canvas.output\`\u3001\`canvas.size\` | \u5426 | \`"pixels"\`\uFF080.9.1+\uFF09\u7528 \`paint(g, t, width, height, ctx)\` \u753B Canvas2D\uFF1B\`"webgl"\`\uFF080.9.2+\uFF09\u7528 \`paint(gl, t, width, height, ctx)\` \u753B WebGL2\u3002\u9ED8\u8BA4\u5927\u5C0F \`[1280, 720]\`\u3002\`setup(info, gl)\` \u63A5\u6536 JSON/ImageBitmap \u7D20\u6750\uFF1BWebGL \u8FD8\u6536\u5230\u4F9B Three.js \u663E\u5F0F\u4E0A\u4E0B\u6587\u4F7F\u7528\u7684\u6700\u5C0F \`info.canvas\` \u63A5\u53E3\u3002 |
| \`canvas.subtitles\` | \u5426 | \`true\`\uFF080.9.3+\uFF09\u5728 \`script\` \u7684 \`pixels\` / \`webgl\` \u753B\u9762\u4E0A\u53E0\u52A0\u7528\u6237\u672C\u5730\u53CC\u8BED\u6B4C\u8BCD\u3002\u9ED8\u8BA4 \`false\`\uFF1B\u573A\u666F\u5DF2\u81EA\u884C\u753B\u5B57\u5E55\u65F6\u4E0D\u8981\u6253\u5F00\uFF0C\u4EE5\u514D\u91CD\u590D\u3002 |
| \`x-dsh-mv-ai.sections\` | \u5426 | \u6B4C\u66F2\u6BB5\u843D \`[{ kind, label, start, end }]\`\uFF0C\u4F9B\u573A\u666F\u811A\u672C\u4F7F\u7528\uFF08\`ctx.section\`\uFF09\u3002 |
| \`x-dsh-mv-workshop\` | \u5426 | \u521B\u610F\u5DE5\u574A\u4FE1\u606F\uFF08id\u3001\u7248\u672C\u3001\u8BB8\u53EF\u3001\u4F5C\u8005\u3001\u97F3\u9891\u65F6\u957F / \u6307\u7EB9\uFF1B\u5305\u542B\u6B4C\u8BCD\u65F6\u53E6\u5199\u6388\u6743\u6761\u6B3E\u4E0E\u7F72\u540D\uFF09\uFF0C\u7531\u300C\u53D1\u5E03\u5230\u5DE5\u574A\u300D\u5199\u5165\u3002 |

\u8DEF\u5F84\u76F8\u5BF9\u4E8E \`mv.json\` \u6240\u5728\u6587\u4EF6\u5939\uFF08\`/\` \u6216 \`\\\\\` \u90FD\u884C\uFF0C\u4E0D\u5141\u8BB8 \`..\`\uFF09\uFF0C\u4E5F\u53EF\u4EE5\u5199\u7EDD\u5BF9\u8DEF\u5F84\u3002
\u672A\u77E5\u5B57\u6BB5\u4F1A\u62A5\u9519\uFF1B\u81EA\u5B9A\u4E49\u6570\u636E\u8BF7\u7528 \`x-\` \u5F00\u5934\u7684\u5B57\u6BB5\u30020.6.0 \u4E4B\u524D\u7684\u5305\u91CC\u7684 \`terminal\` \u5B57\u6BB5\u4F1A\u88AB\u5FFD\u7565\u5E76\u7ED9\u51FA\u63D0\u793A\uFF08\u9762\u677F\u4E0D\u518D\u8FD0\u884C\u5916\u90E8\u64AD\u653E\u5668\uFF09\u3002

\u672C\u5730 \`lyrics.js\` / \`.mjs\` \u652F\u6301\u9759\u6001 \`LYRICS\` \u6570\u7EC4\u4E2D\u7684 \`{ t, en, cn }\` \u6570\u636E\uFF0C
\u5305\u62EC wiers-jack MV \u4F7F\u7528\u7684 \`export const LYRICS = [...]\`\u3002\u53EA\u8BFB\u53D6\u6570\u636E\u5B57\u9762\u91CF\uFF0C\u4E0D\u6267\u884C
\u540E\u9762\u7684\u8F85\u52A9\u51FD\u6570\uFF0C\u4E5F\u4E0D\u652F\u6301\u6570\u7EC4\u5185\u7684\u8868\u8FBE\u5F0F\u6216\u5BFC\u5165\u3002\u65E0\u9700\u628A JS \u6539\u540D\u4E3A JSON\u3002

## \u5B8C\u6574\u5DE5\u574A\u5305\uFF080.9.4+\uFF09

\u53D1\u5E03\u65F6**\u4EC5\u53BB\u6389\u6B4C\u66F2\u97F3\u9891 / \u89C6\u9891**\u3002\u53D6\u5F97\u76F8\u5E94\u8BB8\u53EF\u540E\uFF0C\u6B4C\u8BCD\u3001\u8BD1\u6587\u3001\u65F6\u95F4\u8F74\u3001\u9884\u8BA1\u7B97\u9891\u8C31\u3001
\u5C01\u9762\u3001\u573A\u666F\u4EE3\u7801\u4E0E\u6240\u6709\u5F15\u7528\u7684 \`canvas.assets\` \u53EF\u4EE5\u4E00\u540C\u4FDD\u7559\u3002\u5B89\u88C5 / \u66F4\u65B0\u4F1A\u4E0B\u8F7D\u7D22\u5F15\u4E2D\u7684
\u6BCF\u4E2A\u6587\u4EF6\u3001\u6821\u9A8C SHA256\uFF0C\u5E76\u81EA\u52A8\u52A0\u8F7D\u6E05\u5355\u58F0\u660E\u7684\u6B4C\u8BCD\u548C\u9891\u8C31\uFF1B\u542C\u4F17\u53EA\u9700\u8865\u81EA\u5DF1\u7684\u97F3\u4E50\u3002
\u65E7\u7684\u7EAF\u65F6\u95F4\u8F74\u5305\u4ECD\u7136\u517C\u5BB9\uFF0C\u4E5F\u53EF\u4EE5\u624B\u52A8\u9009\u62E9\u672C\u5730\u6B4C\u8BCD\u3002

- \`lyrics.file\` \u5F15\u7528\u5305\u5185\u76F8\u5BF9\u8DEF\u5F84\u7684 LRC/SRT/VTT/JSON/TXT/JS/MJS\uFF1B\u540C\u65F6\u586B\u5199
  \`x-dsh-mv-workshop.lyricsLicense\`\uFF08\u660E\u786E\u7684\u6B4C\u8BCD\u4E0E\u8BD1\u6587\u5206\u53D1\u6761\u6B3E\uFF09\u548C
  \`lyricsCredit\`\uFF08\u8BCD\u4F5C\u8005 / \u8BD1\u8005\u7F72\u540D\uFF09\u3002\`lyricsSource\` \u53EF\u9009\uFF0C\u586B HTTPS \u6765\u6E90 / \u6388\u6743 / \u6307\u5357\u94FE\u63A5\uFF0C
  \u4E0D\u662F\u8FD0\u884C\u65F6\u8FDC\u7A0B\u4E0B\u8F7D\u6B4C\u8BCD\u7684\u5730\u5740\u3002
- \u6B4C\u8BCD\u548C\u8BD1\u6587\u6743\u5229\u4E0D\u81EA\u52A8\u7EE7\u627F\u753B\u9762\u4EE3\u7801\u7684 MIT \u7B49\u8BB8\u53EF\uFF1B\u975E\u5546\u4E1A\u3001\u7F72\u540D\u7B49\u6761\u4EF6\u5FC5\u987B\u5206\u522B\u9075\u5B88\u3002
  \u672A\u77E5\u8BB8\u53EF\u6216\u5F85\u6388\u6743\u4E0D\u80FD\u53D1\u5E03\uFF0C\u63D2\u4EF6\u4E0D\u4F1A\u81EA\u52A8\u586B\u5199\u6B4C\u8BCD\u8BB8\u53EF\u3002
- \u6B4C\u8BCD JS \u53EA\u8BFB\u53D6\u9759\u6001 \`LYRICS\` \u6570\u636E\uFF0C\u4E0D\u4F5C\u4E3A\u573A\u666F\u6267\u884C\u6216\u5BFC\u5165\u3002\u6B4C\u8BCD\u4E0E\u9891\u8C31\u5355\u6587\u4EF6\u5404\u9650
  512 KiB\uFF1B\`lyrics.timing.json\` \u59CB\u7EC8\u53EA\u5141\u8BB8\u65F6\u95F4\u548C\u54C8\u5E0C\uFF0C\u4E0D\u542B\u6587\u5B57\u3002
- \`spectrum.file\` \u53EF\u5F15\u7528\u5305\u5185 \`{ fps, bands?, frames }\` JSON\uFF0C\u9891\u6BB5\u5BBD\u5EA6\u4E00\u81F4\u3001\u6570\u503C 0\u20131\uFF0C
  \u4E0D\u80FD\u643A\u5E26\u97F3\u9891\u91C7\u6837\u6216 base64 \u97F3\u4E50\uFF1B\u4F7F\u7528\u5B9E\u65F6\u5206\u6790\u65F6\u4E0D\u5FC5\u63D0\u4F9B\u3002\u6B64\u7C7B\u5B8C\u6574\u5305\u9700\u8981\u63D2\u4EF6 0.9.4+\u3002

## \u53EF\u9009\u7684 dsh-pv \u5B57\u4F53\uFF080.9.5+\uFF09

dsh-pv \u6E32\u67D3\u5668\u53EF\u58F0\u660E \`canvas.assets["font-head"] = "fonts/SpaceMono-Bold.ttf"\`
\u548C \`canvas.assets["font-banner"] = "fonts/Anton-Regular.ttf"\`\u3002\u6BCF\u9879\u53EA\u80FD\u662F\u4E00\u4E2A\u5305\u5185 TTF
\u6587\u4EF6\uFF0C\u9650 512 KiB\uFF0C\u4EE5\u56FA\u5B9A\u7684\u4F5C\u7528\u57DF\u5B57\u4F53\u540D\u548C\u5B57\u91CD\u4ECE\u5305\u5185\u5B57\u8282\u52A0\u8F7D\uFF1B\u4E0D\u63A5\u53D7\u5176\u4ED6\u5B57\u4F53\u952E\u3001
\u5B57\u4F53\u5206\u7247\u3001URL \u6216\u811A\u672C\u6307\u5B9A\u7684\u5B57\u4F53\u540D\u79F0\u3002\u5DF2\u58F0\u660E\u5B57\u4F53\u52A0\u8F7D\u5931\u8D25\u4F1A\u660E\u786E\u62A5\u9519\uFF1B\u65E7\u5305\u672A\u58F0\u660E\u5B57\u4F53\u65F6\uFF0C
\u7EE7\u7EED\u4F7F\u7528\u672C\u673A / \u7CFB\u7EDF\u540E\u5907\u5B57\u4F53\u3002

\u53D1\u5E03\u65F6\u5728 \`x-dsh-mv-workshop\` \u4E2D\u58F0\u660E \`fontsLicense: "OFL-1.1"\`\u3001
\`fontsCredit\` \u548C \`fontsNotice: "fonts/NOTICE.md"\`\uFF0C\u968F\u5305\u4FDD\u7559\u8BE5\u7F72\u540D\u8BF4\u660E\u53CA\u5BF9\u5E94\u7684
\`fonts/OFL_spacemono.txt\` / \`fonts/OFL_anton.txt\` \u8BB8\u53EF\u5168\u6587\u3002\u5B57\u4F53\u8BB8\u53EF\u4E0D\u7EE7\u627F\u753B\u9762\u4EE3\u7801\u6216
\u7ACB\u7ED8\u7684\u8BB8\u53EF\u3002Consolas\u3001\u5FAE\u8F6F\u96C5\u9ED1\u3001Segoe UI \u7B49 Windows \u5B57\u4F53\u53EA\u4F7F\u7528\u542C\u4F17\u672C\u673A\u5DF2\u5B89\u88C5\u7248\u672C\uFF0C
\u4E0D\u80FD\u628A\u5B57\u4F53\u6587\u4EF6\u6216\u9010\u5B57\u7B26\u56FE\u96C6\u590D\u5236\u8FDB\u5DE5\u574A\u5305\u3002

## \u97F3\u9891\u683C\u5F0F

\u652F\u6301\u9762\u677F\u91CC Chromium \u80FD\u89E3\u7801\u7684\u4E00\u5207\u683C\u5F0F\uFF1AMP3\u3001M4A/AAC\uFF08\u5305\u62EC DASH / \u5206\u7247 MP4 \u4E0B\u8F7D\u6587\u4EF6\uFF09\u3001
MP4/MOV/WebM/MKV \u89C6\u9891\u91CC\u7684\u97F3\u8F68\u3001Ogg Vorbis/Opus\u3001FLAC\u3001WAV\uFF08PCM / \u6D6E\u70B9 / A-law / \u03BC-law\uFF09\u3002
\u683C\u5F0F\u6309\u6587\u4EF6\u5185\u5BB9\u5224\u65AD\uFF0C\u4E0D\u770B\u6269\u5C55\u540D\u3002MV \u5305\u91CC Chromium \u89E3\u4E0D\u4E86\u7684\u683C\u5F0F\uFF08WMA\u3001AIFF\u3001AMR\u3001AC-3\u3001APE\u2026\uFF09\uFF0C
\u5982\u679C\u88C5\u4E86 ffmpeg\uFF08PATH \u91CC\u6216 \`D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe\`\uFF09\uFF0C\u9762\u677F\u53EF\u4EE5\u7528\u5B83\u8F6C\u6362\u6210 WAV \u7F13\u5B58
\uFF08\`%LOCALAPPDATA%\\dsh-mv\\audio-cache\`\uFF09\uFF0C\u8FD0\u884C\u524D\u4F1A\u5148\u5F81\u6C42\u4F60\u540C\u610F\uFF1B\u539F\u6587\u4EF6\u4E0D\u53D8\u3002

## \u573A\u666F\u811A\u672C\uFF08\`canvas.renderer: "script"\`\uFF09

\`\`\`json
"canvas": { "renderer": "script", "script": "scenes.js" }
\`\`\`

\`scenes.js\` \u5B9A\u4E49 \`render(t, cols, rows, ctx)\`\uFF08\u53EF\u9009 \`setup(info)\`\uFF09\uFF0C\u8FD4\u56DE \`rows\` \u884C\u5B57\u7B26\u4E32\u6570\u7EC4\uFF0C
\u6216 \`{ lines, styles }\`\uFF1A\`styles[y]\` \u6BCF\u4E2A\u5B57\u7B26\u4E00\u4F4D\u6570\u5B57\uFF080 \u6697\u30011 \u666E\u901A\u30012 \u4EAE\u30013 \u767D\u30014 \u7EA2\u30015 \u68D5\u30016 \u6A44\u6984\uFF09\u3002
\`ctx\` \u4E3A \`{ duration, progress, title, artist, lyric, next, bands[48], energy, bass, mid, treble, ready, paused, section, sections, beat }\`\uFF1A

- \`lyric\`\uFF1A\`{ text, en, zh, start, end, progress, words: [{ text, start, end }], word }\` \u6216 null\u3002\u9010\u8BCD\u65F6\u95F4\u6765\u81EA\u589E\u5F3A LRC
  \uFF08\`[00:12.00]<00:12.00>\u7B2C\u4E00 <00:12.50>\u4E2A\u8BCD\`\uFF09\uFF0C\u6CA1\u6709\u65F6\u81EA\u52A8\u4F30\u8BA1\uFF1B\`word\` \u662F\u6B63\u5728\u5531\u7684\u8BCD\u7684\u4E0B\u6807\u3002\`next\` \u662F\u4E0B\u4E00\u53E5\uFF08\u6CA1\u6709 words\uFF09\u3002
- \`section\`\uFF1A\u6765\u81EA \`x-dsh-mv-ai.sections\` \u7684 \`{ kind, label, start, end, index, progress }\`\uFF0C\u6216 null\u3002
- \`beat\`\uFF1A\u8BBE\u7F6E\u4E86 \`canvas.bpm\` \u65F6\u4E3A \`{ bpm, index, bar, phase, pulse }\`\uFF0C\u5426\u5219 null\u3002

\u811A\u672C\u5728 Web Worker \u6C99\u7BB1\u91CC\u8FD0\u884C\uFF1A\u6CA1\u6709\u7F51\u7EDC\u3001\u5B58\u50A8\u3001DOM\uFF0C\u4E0D\u80FD import\u3002\u6BCF\u5E27\u5E94\u5728 ${SCENE_LIMITS.frameBudgetMs} \u6BEB\u79D2\u5185\u5B8C\u6210\uFF1B
\u811A\u672C\u62A5\u9519\u3001\u5361\u4F4F ${SCENE_LIMITS.hardTimeoutMs} \u6BEB\u79D2\u6216\u6301\u7EED\u592A\u6162\u65F6\u4F1A\u88AB\u505C\u6B62\uFF0C\u9762\u677F\u81EA\u52A8\u6362\u56DE \`generic\` \u901A\u7528\u753B\u9762\u3002
\`examples/scenes.example.js\` \u662F\u4E00\u4E2A\u80FD\u76F4\u63A5\u8FD0\u884C\u7684\u793A\u4F8B\u3002

### \u771F\u6B63 3D\uFF080.9.2+\uFF09

\u8BBE\u7F6E \`"canvas": { "renderer": "script", "script": "scenes.js", "output": "webgl", "size": [1280, 720] }\`\u3002
\u5B9A\u4E49 \`paint(gl, t, w, h, ctx)\`\uFF0C\u5728 \`setup(info, gl)\` \u521D\u59CB\u5316 GPU \u8D44\u6E90\uFF1B\u5DF2\u6253\u5305\u7684 Three.js \u4F7F\u7528
\`new THREE.WebGLRenderer({ canvas: info.canvas, context: gl })\`\uFF0C\u4E0D\u80FD\u4F9D\u8D56 DOM \u6216\u81EA\u5DF1\u7684\u52A8\u753B\u5FAA\u73AF\u3002
\u4ECE\u7EDD\u5BF9\u65F6\u95F4 \`t\` \u91CD\u5EFA\u753B\u9762\uFF0C\u4E0D\u7D2F\u79EF\u5E27 delta\uFF1B\u62D6\u52A8\u8FDB\u5EA6\u540E\u540C\u4E00\u65F6\u95F4\u5E94\u5F97\u5230\u540C\u4E00\u5E27\u3002
\u6587\u672C/2D \u811A\u672C\u4E0A\u9650 256 KiB\uFF0CWebGL 2 MiB\uFF1B\u4F4D\u56FE\u5E27\u9884\u7B97 100 ms\u3002Node \u9884\u89C8\u53EA\u8BB0\u5F55\u8C03\u7528\uFF0C
\u7740\u8272\u5668\u3001\u7EB9\u7406\u548C\u5B9E\u9645\u753B\u9762\u5FC5\u987B\u53E6\u7528\u771F\u5B9E\u6D4F\u89C8\u5668\u9A8C\u8BC1\u3002\u4E0D\u652F\u6301 HTML\u3001CDN/import\u3001fetch\u3001\u5B9A\u65F6\u5668\u6216\u4F9D\u8D56 DOM \u7684\u5E93\u3002

\u4EE5\u524D\u5185\u7F6E\u7684\u4E24\u4E2A world.execute(me) \u9884\u8BBE\u73B0\u5728\u662F\u521B\u610F\u5DE5\u574A\u91CC\u7684\u5305\uFF08MV \u653E\u6620\u5BA4 \u2192 \u521B\u610F\u5DE5\u574A\uFF09\uFF1B
\u5B89\u88C5\u540E\u6253\u5F00\u5B83\u7684\u6587\u4EF6\u5939\uFF0C\u5C31\u80FD\u770B\u5230\u5B8C\u6574\u7684\u573A\u666F\u811A\u672C\u5305\u548C\u4F7F\u7528 \`canvas.assets\` \u7684\u5305\u3002
`;
var LRC_EXAMPLE = `[ti:Song title]
[ar:Artist]
[offset:0]
[00:00.00]\uFF08\u8FD9\u662F\u5360\u4F4D\u6B4C\u8BCD\uFF1A\u8BF7\u66FF\u6362\u6210\u4F60\u81EA\u5DF1\u7684\u6B4C\u8BCD\u6587\u4EF6\uFF09
[00:05.00]First line in English
[00:05.00]\u7B2C\u4E00\u53E5\u4E2D\u6587
[00:10.00]Second line / \u7B2C\u4E8C\u53E5
[00:15.00]Instrumental \u2026
`;
function templateFiles() {
  return [
    { path: "mv.json", text: json(TEMPLATE_MANIFEST) },
    { path: MV_PACK_SCHEMA_FILE, text: json(MV_PACK_JSON_SCHEMA) },
    { path: "README.md", text: README_EN },
    { path: "README.zh.md", text: README_ZH },
    { path: "lyrics.example.lrc", text: LRC_EXAMPLE },
    { path: "examples/scenes.example.js", text: EXAMPLE_SCENE },
    ...Object.entries(TEMPLATE_ASSETS).map(([path, text4]) => ({ path, text: text4 }))
  ];
}

// .dsh-plugin/client/mv-pack-state.mjs
var RECENT_KEY = "dsh-mv.packs.recent.v1";
var ACTIVE_KEY = "dsh-mv.packs.active.v1";
var LIBRARY_VIEW_KEY = "dsh-mv.library.view.v1";
function loadLibraryView(storage = globalThis.localStorage) {
  try {
    return storage?.getItem(LIBRARY_VIEW_KEY) === "grid" ? "grid" : "list";
  } catch {
    return "list";
  }
}
var LIBRARY_COLLAPSED_KEY = "dsh-mv.library.collapsed.v1";
function loadLibraryCollapsed(storage = globalThis.localStorage) {
  try {
    return storage?.getItem(LIBRARY_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}
function saveLibraryCollapsed(collapsed, storage = globalThis.localStorage) {
  const value = Boolean(collapsed);
  try {
    storage?.setItem(LIBRARY_COLLAPSED_KEY, value ? "1" : "0");
  } catch {
  }
  return value;
}
function saveLibraryView(view, storage = globalThis.localStorage) {
  const clean3 = view === "grid" ? "grid" : "list";
  try {
    storage?.setItem(LIBRARY_VIEW_KEY, clean3);
  } catch {
  }
  return clean3;
}
var EMPTY_ID = "empty";
var EMPTY_PACK = Object.freeze({ id: EMPTY_ID, empty: true, pack: Object.freeze({ title: "\u8FD8\u6CA1\u6709\u9009\u62E9 MV", artist: "", canvas: Object.freeze({ renderer: "generic" }) }) });
function movedPreset(id) {
  const preset = PRESET_PACKS.find((p) => p.legacyId === id);
  if (!preset) return null;
  return Object.freeze({ id, empty: true, moved: preset, pack: Object.freeze({ title: preset.title, artist: preset.artist, canvas: Object.freeze({ renderer: "generic" }) }) });
}
var placeholderPack = (id) => movedPreset(id) ?? EMPTY_PACK;
function loadRecent(storage = globalThis.localStorage) {
  try {
    const list = JSON.parse(storage?.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((item) => typeof item?.manifestPath === "string").slice(0, MV_PACK_LIMITS.recentPacks) : [];
  } catch {
    return [];
  }
}
function saveRecent(list, storage) {
  try {
    storage?.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MV_PACK_LIMITS.recentPacks)));
  } catch {
  }
}
function rememberPack(loaded, { storage = globalThis.localStorage, now = Date.now } = {}) {
  const duration = Number(loaded.pack.duration);
  const entry2 = { manifestPath: loaded.manifestPath, title: loaded.pack.title, artist: loaded.pack.artist ?? "", usedAt: now(), ...duration > 0 ? { duration } : {}, ...loaded.pack.workshop?.id ? { workshop: loaded.pack.workshop.id } : {} };
  const list = [entry2, ...loadRecent(storage).filter((item) => item.manifestPath.toLowerCase() !== entry2.manifestPath.toLowerCase())];
  saveRecent(list, storage);
  return list.slice(0, MV_PACK_LIMITS.recentPacks);
}
function noteDuration(manifestPath, duration, storage = globalThis.localStorage) {
  const list = loadRecent(storage);
  const value = Number(duration);
  const item = list.find((entry2) => entry2.manifestPath === manifestPath);
  if (!item || !(value > 0) || Math.abs((item.duration ?? 0) - value) < 0.5) return list;
  item.duration = value;
  saveRecent(list, storage);
  return list;
}
function forgetPack(manifestPath, storage = globalThis.localStorage) {
  const list = loadRecent(storage).filter((item) => item.manifestPath !== manifestPath);
  saveRecent(list, storage);
  return list;
}
function loadActive(storage = globalThis.localStorage) {
  try {
    return storage?.getItem(ACTIVE_KEY) || EMPTY_ID;
  } catch {
    return EMPTY_ID;
  }
}
function saveActive(id, storage = globalThis.localStorage) {
  try {
    storage?.setItem(ACTIVE_KEY, id);
  } catch {
  }
}
async function loadPackFromHost(api, path) {
  const manifestPath = parseManifestPath(path);
  const loaded = unwrapRemote(await api.packLoad({ path: manifestPath }), "\u65E0\u6CD5\u8BFB\u53D6 MV \u5305\u3002");
  if (!loaded?.pack || typeof loaded.manifestPath !== "string") throw new Error("MV \u5305\u8BFB\u53D6\u7ED3\u679C\u683C\u5F0F\u65E0\u6548\u3002");
  return { id: `pack:${loaded.manifestPath}`, loadedAt: Date.now(), ...loaded };
}
var fromBase643 = (text4) => {
  const binary = globalThis.atob(text4);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};
var audioMime = (bytes) => audioMimeOf(sniffAudio(bytes ?? new Uint8Array(0)));
async function fetchPackBytes(api, manifestPath, role, { onProgress = () => {
}, isCancelled = () => false, decode: decode2 = fromBase643 } = {}) {
  const parts = [];
  let offset = 0, name = role, size = 0;
  for (; ; ) {
    if (isCancelled()) throw new Error("cancelled");
    const chunk = unwrapRemote(await api.packRead({ manifestPath, role, offset, length: MV_PACK_LIMITS.readChunkBytes }), `\u65E0\u6CD5\u8BFB\u53D6 MV \u5305\u7684 ${role} \u6587\u4EF6\u3002`);
    name = chunk.name ?? name;
    size = chunk.size ?? size;
    if (chunk.bytes > 0) parts.push(decode2(chunk.base64));
    offset += chunk.bytes;
    onProgress(offset, size);
    if (chunk.done || chunk.bytes === 0) break;
  }
  return { name, parts };
}
async function fetchPackAudio(api, manifestPath, { FileClass = globalThis.File, ...options } = {}) {
  const { name, parts } = await fetchPackBytes(api, manifestPath, "audio", options);
  return new FileClass(parts, name, { type: audioMime(parts[0]) });
}
async function fetchPackText(api, manifestPath, role, options = {}) {
  const { name, parts } = await fetchPackBytes(api, manifestPath, role, options);
  const total = parts.reduce((n, part2) => n + part2.length, 0);
  const bytes = new Uint8Array(total);
  let at = 0;
  for (const part2 of parts) {
    bytes.set(part2, at);
    at += part2.length;
  }
  return { name, text: new TextDecoder("utf-8").decode(bytes) };
}
function directoryPicker(scope = globalThis) {
  const picker = scope.__DSH_DIRECTORY_PICKER__;
  return typeof picker?.pick === "function" ? () => picker.pick() : null;
}
var CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();
function crc322(bytes) {
  let crc = 4294967295;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 255] ^ crc >>> 8;
  return (crc ^ 4294967295) >>> 0;
}
function zipFiles(files, { date = new Date(2026, 9, 3) } = {}) {
  const encoder2 = new TextEncoder();
  const time = date.getHours() << 11 | date.getMinutes() << 5 | date.getSeconds() >> 1;
  const day = date.getFullYear() - 1980 << 9 | date.getMonth() + 1 << 5 | date.getDate();
  const locals = [], centrals = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder2.encode(file.path);
    const data = typeof file.text === "string" ? encoder2.encode(file.text) : file.bytes;
    const crc = crc322(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 67324752, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 2048, true);
    local.setUint16(8, 0, true);
    local.setUint16(10, time, true);
    local.setUint16(12, day, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, name.length, true);
    local.setUint16(28, 0, true);
    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 33639248, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, 2048, true);
    central.setUint16(10, 0, true);
    central.setUint16(12, time, true);
    central.setUint16(14, day, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, data.length, true);
    central.setUint32(24, data.length, true);
    central.setUint16(28, name.length, true);
    central.setUint32(42, offset, true);
    locals.push(new Uint8Array(local.buffer), name, data);
    centrals.push(new Uint8Array(central.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const centralSize = centrals.reduce((n, part2) => n + part2.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 101010256, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  const parts = [...locals, ...centrals, new Uint8Array(end.buffer)];
  const out = new Uint8Array(parts.reduce((n, part2) => n + part2.length, 0));
  let at = 0;
  for (const part2 of parts) {
    out.set(part2, at);
    at += part2.length;
  }
  return out;
}
var templateZip = () => zipFiles(templateFiles().map((file) => ({ path: `${TEMPLATE_FOLDER}/${file.path}`, text: file.text })));
var TEMPLATE_ZIP_NAME = `${TEMPLATE_FOLDER}.zip`;
function relocatePacks(moves, storage = globalThis.localStorage) {
  const map = new Map((moves ?? []).filter((m) => m?.oldManifestPath && m?.manifestPath).map((m) => [m.oldManifestPath.toLowerCase(), m.manifestPath]));
  const list = loadRecent(storage);
  if (!map.size) return list;
  const next = list.map((item) => map.has(item.manifestPath.toLowerCase()) ? { ...item, manifestPath: map.get(item.manifestPath.toLowerCase()) } : item);
  saveRecent(next, storage);
  const active = loadActive(storage);
  if (active.startsWith("pack:") && map.has(active.slice(5).toLowerCase())) saveActive(`pack:${map.get(active.slice(5).toLowerCase())}`, storage);
  return next.slice(0, MV_PACK_LIMITS.recentPacks);
}

// .dsh-plugin/client/mv-workshop-state.mjs
var loadWorkshop = async (api, refresh = false) => unwrapRemote(await api.workshopIndex({ refresh }), "\u65E0\u6CD5\u8BFB\u53D6\u521B\u610F\u5DE5\u574A\u3002");
var installWorkshopPack = async (api, id) => unwrapRemote(await api.workshopInstall({ id }), "\u5B89\u88C5\u5931\u8D25\u3002");
var uninstallWorkshopPack = async (api, id) => unwrapRemote(await api.workshopUninstall({ id }), "\u5378\u8F7D\u5931\u8D25\u3002");
var workshopCover = async (api, id) => unwrapRemote(await api.workshopCover({ id }), "");
var publishWorkshopPack = async (api, request2) => unwrapRemote(await api.workshopPublish(request2), "\u65E0\u6CD5\u51C6\u5907\u53D1\u5E03\u3002");
function installedState(index) {
  const map = Object.fromEntries((index?.installed ?? []).map((item) => [item.id, item]));
  const updates = new Set((index?.packs ?? []).filter((p) => map[p.id] && compareVersions(p.version, map[p.id].version) > 0).map((p) => p.id));
  return { map, updates };
}
function mediaSlot(pack, kind) {
  const id = pack?.pack?.workshop?.id;
  return id && !pack?.pack?.audio ? `workshop:${id}:${kind}` : null;
}
var legacyPresetSlot = (pack) => PRESET_PACKS.some((p) => p.id === pack?.pack?.workshop?.id);
var rememberedTrackApplies = (pack, record, bundledLoaded) => !bundledLoaded || Boolean(record?.override === true && pack?.pack?.workshop?.version && record.packVersion === pack.pack.workshop.version);
async function fingerprintAudio(bytes, decode2 = decodeToChannels) {
  const { channels, sampleRate, duration } = await decode2(bytes);
  const [a, b] = channels;
  const mono = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) mono[i] = (a[i] + b[i]) / 2;
  const fingerprint = energyFingerprint(mono, sampleRate);
  return { duration, fingerprint, base64: encodeFingerprint(fingerprint) };
}
function checkAudioForPack(workshop, actual) {
  return audioMatch({ duration: workshop?.audio?.duration, fingerprint: workshop?.audio?.fingerprint?.values }, actual);
}
var encoder = new TextEncoder();
var lineHash = async (text4) => (await sha256Hex2(encoder.encode(text4))).slice(0, 16);
var retimeWithPack = (cues, timing, hash = lineHash) => retimeCues(cues, timing, hash);
var durationText = (s) => {
  if (!(Number.isFinite(s) && s > 0)) return "\u2014";
  const r = Math.round(s);
  return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`;
};
var sizeText = (n) => n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
var workshopDirInfo = async (api) => unwrapRemote(await api.workshopDirInfo({}), "\u65E0\u6CD5\u8BFB\u53D6\u5B89\u88C5\u4F4D\u7F6E\u3002");
var setWorkshopDir = async (api, request2) => unwrapRemote(await api.workshopDirSet(request2), "\u65E0\u6CD5\u66F4\u6539\u5B89\u88C5\u4F4D\u7F6E\u3002");
var moveWorkshopPack = async (api, id) => unwrapRemote(await api.workshopDirMove({ id }), "\u79FB\u52A8\u5931\u8D25\u3002");
var openWorkshopDir = async (api) => unwrapRemote(await api.workshopDirOpen({}), "\u65E0\u6CD5\u6253\u5F00\u6587\u4EF6\u5939\u3002");
async function moveWorkshopPacks(api, ids, onProgress = () => {
}) {
  const moved = [], failed = [];
  for (const [i, id] of ids.entries()) {
    onProgress({ done: i, total: ids.length, id });
    try {
      const result = await moveWorkshopPack(api, id);
      moved.push(result);
      if (result.warning) failed.push({ id, error: result.warning, copied: true });
    } catch (error) {
      failed.push({ id, error: error?.message ?? String(error) });
    }
  }
  onProgress({ done: ids.length, total: ids.length, id: "" });
  return { moved, failed };
}
var tooOld = (pack, version = CLIENT_VERSION) => Boolean(pack?.requires && version && compareVersions(version, pack.requires) < 0);

// .dsh-plugin/client/canvas-mv.jsx
var AUDIO_ACCEPT = "audio/*,video/*,.mp3,.mp2,.m4a,.m4b,.mp4,.m4v,.mov,.aac,.webm,.mkv,.mka,.ogg,.oga,.opus,.flac,.wav";
var LYRICS_ACCEPT = MV_LYRICS_EXTENSIONS.join(",");
var FONT_KEY = "dsh-mv.canvas.fontSize";
var readFont = (fallback) => {
  try {
    const v = Number(globalThis.localStorage?.getItem(FONT_KEY));
    return v >= 8 && v <= 32 ? v : fallback;
  } catch {
    return fallback;
  }
};
var storeFont = (v) => {
  try {
    globalThis.localStorage?.setItem(FONT_KEY, String(v));
  } catch {
  }
};
var HINT = "SPACE \u64AD\u653E/\u6682\u505C  \u2190/\u2192 5s  [ ] \u5B57\u5E55  Alt+[ ] \u97F3\u9891\u540C\u6B65  1-5 \u7AE0\u8282  F \u5168\u5C4F  H \u5E2E\u52A9";
var isGeneric = (pack) => pack?.pack?.canvas?.renderer !== "dsh-pv";
var isDshPv = (pack) => pack?.pack?.canvas?.renderer === "dsh-pv";
var isScript = (pack) => pack?.pack?.canvas?.renderer === "script";
var chaptersOf = (pack, duration) => {
  const sections = pack?.pack?.sections ?? [];
  return sections.length ? sections.map((s) => [s.start, s.label || s.kind, ""]) : genericChapters(duration);
};
var CanvasMv = import_react3.default.forwardRef(function CanvasMv2({ defaultFontSize = 14, pack = EMPTY_PACK, api = null, onState = () => {
}, dshpvReader = null }, ref) {
  const wrap3 = import_react3.default.useRef(null);
  const stage = import_react3.default.useRef(null);
  const canvas = import_react3.default.useRef(null);
  const pixel = import_react3.default.useRef(null);
  const audio = import_react3.default.useRef(null);
  const engine = import_react3.default.useRef(null);
  const [audioInfo, setAudioInfo] = import_react3.default.useState(null);
  const [lyricsInfo, setLyricsInfo] = import_react3.default.useState(null);
  const [spectrumInfo, setSpectrumInfo] = import_react3.default.useState(null);
  const [offsets, setOffsets] = import_react3.default.useState({ audioOffset: 0, subtitleOffset: 0 });
  const [fontSize, setFontSize] = import_react3.default.useState(() => readFont(defaultFontSize));
  const [status, setStatus] = import_react3.default.useState({ t: 0, playing: false, cols: 0, rows: 0 });
  const [error, setError] = import_react3.default.useState("");
  const [fullscreen, setFullscreen] = import_react3.default.useState(false);
  const offsetsRef = import_react3.default.useRef(offsets);
  offsetsRef.current = offsets;
  const dbRef = import_react3.default.useRef(null);
  const packRef = import_react3.default.useRef(pack);
  packRef.current = pack;
  const [duration, setDuration] = import_react3.default.useState(DEFAULT_DURATION);
  const [packStatus, setPackStatus] = import_react3.default.useState("");
  const [volume, setVolume] = import_react3.default.useState({ level: 1, muted: false });
  const [sceneNote, setSceneNote] = import_react3.default.useState("");
  const [scenePreparing, setScenePreparing] = import_react3.default.useState("");
  const [decodeFail, setDecodeFail] = import_react3.default.useState(null);
  const [audioFile, setAudioFile] = import_react3.default.useState(null);
  const [lyricsText, setLyricsText] = import_react3.default.useState("");
  const cuesRef = import_react3.default.useRef([]);
  const [matchNote, setMatchNote] = import_react3.default.useState(null);
  const timingRef = import_react3.default.useRef(null);
  const fpRef = import_react3.default.useRef(null);
  const [pixelScene, setPixelScene] = import_react3.default.useState(false);
  import_react3.default.useEffect(() => {
    const live = new LiveSpectrum(audio.current);
    const state = {
      generic: new GenericFilm({ energy: (t) => state.energy(t) }),
      script: new ScriptFilm({
        energy: (t) => state.energy(t),
        onPrepare: (progress) => {
          if (!state.disposed && state.film === state.script) setScenePreparing(`\u6B63\u5728\u9884\u70ED 3D \u8D44\u6E90\u2026 ${Math.round(progress.progress * 100)}%${progress.label ? ` \xB7 ${progress.label}` : ""}`);
        },
        onFail: (reason) => {
          if (state.film === state.script) state.film = state.generic;
          setPixelScene(false);
          setSceneNote(`\u573A\u666F\u811A\u672C\u5DF2\u505C\u7528\uFF0C\u6539\u7528\u901A\u7528\u753B\u9762\uFF1A${reason}`);
        }
      }),
      dshpv: new DshPvFilm({ energy: (t) => state.energy(t) }),
      dshpvLoad: null,
      dshpvData: null,
      dshpvFonts: null,
      dshpvOwner: null,
      disposed: false,
      film: null,
      renderer: new GridRenderer(canvas.current, { fontSize }),
      clock: new FilmClock({ audio: audio.current }),
      live,
      energy: silentEnergy,
      fileEnergy: null,
      started: false,
      help: false,
      sha: "",
      sceneLoad: null,
      sceneOwner: null,
      playGate: new ScenePlayGate()
    };
    state.energy = () => live.energy();
    state.film = state.generic;
    engine.current = state;
    let raf = 0, lastStatus = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const box2 = stage.current;
      if (!box2) return;
      const raw = state.clock.time();
      const { t, ready } = frameTime(raw, state.started, state.clock.duration);
      const playing = state.clock.playing;
      let cols = 0, rows = 0;
      if (state.film === state.script && isBitmapSceneOutput(state.script.output)) {
        const el = pixel.current;
        const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
        const w = Math.max(64, Math.round(box2.clientWidth * dpr)), h = Math.max(36, Math.round(box2.clientHeight * dpr));
        if (el.width !== w || el.height !== h) {
          el.width = w;
          el.height = h;
        }
        state.script.draw(el.getContext("2d"), Math.max(0, t), { paused: !playing && state.started, ready, offset: offsetsRef.current.subtitleOffset, subtitles: packRef.current?.pack?.canvas?.subtitles === true });
      } else if (state.film === state.dshpv) {
        const el = pixel.current;
        const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
        const w = Math.max(64, Math.round(box2.clientWidth * dpr)), h = Math.max(36, Math.round(box2.clientHeight * dpr));
        if (el.width !== w || el.height !== h) {
          el.width = w;
          el.height = h;
        }
        state.dshpv.draw(el.getContext("2d"), Math.max(0, t), { paused: !playing && state.started, offset: offsetsRef.current.subtitleOffset });
      } else {
        ({ cols, rows } = state.renderer.fit(box2.clientWidth, box2.clientHeight));
        const picture = state.film.render(t, cols, rows, {
          paused: !playing,
          ready,
          offset: offsetsRef.current.subtitleOffset,
          hintText: HINT,
          help: state.help
        });
        state.renderer.draw(picture);
      }
      if (now - lastStatus > 250) {
        lastStatus = now;
        setStatus({ t: raw, playing, cols, rows });
      }
    };
    raf = requestAnimationFrame(frame);
    const onFs = () => setFullscreen(document.fullscreenElement === wrap3.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      state.disposed = true;
      state.dshpvOwner = null;
      disposeDshPvData(state.dshpvData);
      state.dshpvFonts?.dispose();
      state.dshpvData = null;
      state.dshpvFonts = null;
      cancelAnimationFrame(raf);
      document.removeEventListener("fullscreenchange", onFs);
      live.close();
      state.script.stop();
    };
  }, []);
  import_react3.default.useEffect(() => {
    engine.current?.renderer.setFontSize(fontSize);
    storeFont(fontSize);
  }, [fontSize]);
  const applyOffsets = import_react3.default.useCallback((next) => {
    const value = { audioOffset: roundOffset(next.audioOffset), subtitleOffset: roundOffset(next.subtitleOffset) };
    setOffsets(value);
    if (engine.current) engine.current.clock.audioOffset = value.audioOffset;
    if (engine.current?.sha) saveOffsets(engine.current.sha, value);
  }, []);
  const useAudioFile = import_react3.default.useCallback(async (file, { remember = true, packOffset = 0 } = {}) => {
    setError("");
    const state = engine.current;
    setDecodeFail(null);
    try {
      const bytes = await file.arrayBuffer();
      const sniff = sniffAudio(new Uint8Array(bytes, 0, Math.min(4096, bytes.byteLength)));
      if (!file.type && sniff.format !== "unknown") file = new File([bytes], file.name, { type: audioMimeOf(sniff) });
      const sha = await sha256Hex(bytes);
      const old = audio.current.src;
      audio.current.src = URL.createObjectURL(file);
      if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
      state.sha = sha;
      const loaded = loadOffsets(sha, KNOWN_AUDIO);
      if (!loaded.saved && !loaded.known && packOffset) loaded.audioOffset = packOffset;
      setOffsets({ audioOffset: loaded.audioOffset, subtitleOffset: loaded.subtitleOffset });
      state.clock.audioOffset = loaded.audioOffset;
      state.started = false;
      setAudioInfo({ name: file.name, sha, known: loaded.known, saved: loaded.saved, duration: null, label: sniff.label });
      setAudioFile(file);
      const slot = mediaSlot(packRef.current, "audio");
      if (remember && slot) await putMedia(dbRef.current, slot, { file, name: file.name, sha });
      const ws = packRef.current?.pack?.workshop;
      if (ws && !packRef.current?.pack?.audio) {
        setMatchNote({ level: "info", message: "\u6B63\u5728\u68C0\u67E5\u4F60\u7684\u97F3\u9891\u662F\u5426\u4E0E\u8FD9\u4E2A\u5DE5\u574A\u5305\u5339\u914D\u2026" });
        void fingerprintAudio(bytes).then((fp) => {
          fpRef.current = { sha, ...fp };
          if (engine.current?.sha === sha) setMatchNote(checkAudioForPack(ws, fp));
        }).catch(() => {
          if (engine.current?.sha === sha) setMatchNote({ level: "unknown", message: "\u65E0\u6CD5\u5728\u9762\u677F\u91CC\u89E3\u7801\u8FD9\u4E2A\u97F3\u9891\u6765\u68C0\u67E5\u662F\u5426\u5339\u914D\u3002" });
        });
      } else fpRef.current = null;
    } catch (failure) {
      setError(`\u65E0\u6CD5\u8BFB\u53D6\u97F3\u9891\uFF1A${failure?.message ?? failure}`);
    }
  }, []);
  const useLyricsText = import_react3.default.useCallback(async (name, body, { remember = true, shift = 0 } = {}) => {
    setError("");
    try {
      const state = engine.current;
      const dshpv = state.film === state.dshpv;
      const generic2 = !dshpv;
      const cues = parseLyrics(name, body, { duration: dshpv ? DSHPV_DURATION : 1e9 });
      if (!cues.length) throw new Error("\u6587\u4EF6\u91CC\u6CA1\u6709\u5E26\u65F6\u95F4\u7684\u6B4C\u8BCD\u884C\u3002");
      if (shift) for (const cue of cues) {
        cue.time += shift;
        cue.end += shift;
        for (const word of cue.words ?? []) word.time += shift;
      }
      if (dshpv) {
        const data = await state.dshpvLoad;
        const band = data ? await matchBand(data.band, cues) : { lines: [], matched: 0, total: 0 };
        state.dshpv.setLines(band.lines);
        cuesRef.current = cues;
        setLyricsInfo({ name, count: cues.length, note: band.matched ? `\u9010\u8BCD\u65F6\u95F4\u5339\u914D ${band.matched}/${band.total} \u53E5` : "\u672A\u5339\u914D\u5230\u9010\u8BCD\u65F6\u95F4\uFF0C\u6309\u884C\u663E\u793A" });
      } else {
        let use = cues, note = "";
        if (generic2 && timingRef.current) {
          const timed = await retimeWithPack(cues, timingRef.current);
          if (timed.matched) use = timed.cues;
          note = timed.matched ? `\u6309\u5DE5\u574A\u65F6\u95F4\u8F74\u5BF9\u9F50 ${timed.matched}/${timed.total} \u53E5` : "\u6CA1\u6709\u4E0E\u5DE5\u574A\u65F6\u95F4\u8F74\u5339\u914D\u7684\u884C\uFF0C\u4F7F\u7528\u6B4C\u8BCD\u6587\u4EF6\u81EA\u5DF1\u7684\u65F6\u95F4";
        }
        for (const film of [state.generic, state.script]) film.setLyrics(use);
        cuesRef.current = use;
        setLyricsInfo({ name, count: use.length, ...note ? { note } : {} });
      }
      setLyricsText(body);
      const slot = mediaSlot(packRef.current, "lyrics");
      if (remember && slot) await putMedia(dbRef.current, slot, { name, text: body, override: true, packVersion: packRef.current?.pack?.workshop?.version ?? "" });
      return true;
    } catch (failure) {
      setError(`\u65E0\u6CD5\u89E3\u6790\u6B4C\u8BCD\uFF1A${failure?.message ?? failure}`);
      return false;
    }
  }, []);
  const useSpectrumText = import_react3.default.useCallback(async (name, body, { remember = true, shift = 0 } = {}) => {
    setError("");
    try {
      const fileEnergy = spectrumFromJson(body);
      engine.current.energy = (t) => fileEnergy(t - shift);
      setSpectrumInfo({ name });
      const slot = mediaSlot(packRef.current, "spectrum");
      if (remember && slot) await putMedia(dbRef.current, slot, { name, text: body, override: true, packVersion: packRef.current?.pack?.workshop?.version ?? "" });
      return true;
    } catch (failure) {
      setError(`\u65E0\u6CD5\u8BFB\u53D6\u9891\u8C31\uFF1A${failure?.message ?? failure}`);
      return false;
    }
  }, []);
  import_react3.default.useEffect(() => {
    let cancelled = false;
    const state = engine.current;
    const dshpvOwner = /* @__PURE__ */ Symbol("dsh-pv pack load");
    state.sceneOwner = dshpvOwner;
    state.playGate.cancel();
    state.clock.pause();
    state.script.stop();
    clearAudio();
    if (isScript(pack)) setScenePreparing("\u6B63\u5728\u52A0\u8F7D\u573A\u666F\u8D44\u6E90\u2026");
    else setScenePreparing("");
    const releaseDshPv = () => {
      disposeDshPvData(state.dshpvData);
      state.dshpvFonts?.dispose();
      state.dshpvData = null;
      state.dshpvFonts = null;
      state.dshpvFor = "";
      state.dshpv.timeline = null;
      state.dshpv.chat = null;
      state.dshpv.band = null;
      state.dshpv.art = {};
      state.dshpv.raster = null;
      state.dshpv.lastT = void 0;
    };
    state.dshpvOwner = dshpvOwner;
    releaseDshPv();
    const mediaLoad = (async () => {
      dbRef.current ?? (dbRef.current = await openMediaStore());
      if (cancelled) return;
      const db = dbRef.current;
      state.clock.pause();
      state.started = false;
      state.help = false;
      state.generic.setLyrics([]);
      state.script.setLyrics([]);
      state.dshpv.setLines([]);
      state.script.stop();
      state.energy = () => state.live.energy();
      setLyricsInfo(null);
      setSpectrumInfo(null);
      setError("");
      setPackStatus("");
      setSceneNote("");
      setDecodeFail(null);
      setLyricsText("");
      cuesRef.current = [];
      setMatchNote(null);
      timingRef.current = null;
      fpRef.current = null;
      setPixelScene(false);
      const generic2 = isGeneric(pack);
      state.film = generic2 ? state.generic : state.dshpv;
      if (isDshPv(pack) && state.dshpvFor !== `${pack.id}@${pack.loadedAt ?? ""}`) {
        const read = dshpvReader ?? (hasDshPvAssets(pack) && api?.packRead ? packAssetReader(api, pack.manifestPath, pack.pack) : null);
        state.dshpvFor = `${pack.id}@${pack.loadedAt ?? ""}`;
        state.dshpv.status = "loading";
        state.dshpvLoad = read ? (async () => {
          let data = null, fonts = null;
          try {
            data = await loadDshPv(read);
            if (cancelled || state.disposed || state.dshpvOwner !== dshpvOwner) {
              disposeDshPvData(data);
              return null;
            }
            fonts = await loadDshPvFonts(read);
            if (cancelled || state.disposed || state.dshpvOwner !== dshpvOwner) {
              disposeDshPvData(data);
              fonts.dispose();
              return null;
            }
            state.dshpvData = data;
            state.dshpvFonts = fonts;
            state.dshpv.setData(data);
            if (data.missingArt.length) setSceneNote(`dsh-pv\uFF1A\u8FD9\u4E2A\u5305\u7F3A\u5C11 ${data.missingArt.length} \u5F20\u7ACB\u7ED8\uFF0C\u6539\u7528\u5360\u4F4D\u526A\u5F71\u3002`);
            return data;
          } catch (failure) {
            disposeDshPvData(data);
            fonts?.dispose();
            if (!cancelled && !state.disposed && state.dshpvOwner === dshpvOwner) {
              state.dshpv.status = "error";
              state.dshpvFor = "";
              setError(`\u65E0\u6CD5\u52A0\u8F7D dsh-pv \u8D44\u6E90\uFF1A${failure?.message ?? failure}`);
            }
            return null;
          }
        })() : Promise.resolve(null);
        if (!read) {
          state.dshpv.status = "error";
          state.film = state.generic;
          setSceneNote("\u8FD9\u4E2A MV \u5305\u4F7F\u7528 dsh-pv \u6E32\u67D3\u5668\uFF0C\u4F46\u6CA1\u6709\u9644\u5E26\u5B83\u7684\u6570\u636E\uFF08canvas.assets\uFF09\u30020.9.0 \u8D77\u63D2\u4EF6\u4E0D\u518D\u5185\u7F6E\u8FD9\u4E9B\u6570\u636E\uFF1A\u8BF7\u5230\u300C\u521B\u610F\u5DE5\u574A\u300D\u5B89\u88C5\u300Cworld.execute(me); dsh PV\u300D\u5305\u3002\u73B0\u5728\u6539\u7528\u901A\u7528\u753B\u9762\u3002");
        }
      }
      if (isDshPv(pack)) await state.dshpvLoad;
      if (cancelled) return;
      if (isDshPv(pack) && state.dshpv.status === "error") state.film = state.generic;
      const dsh = state.film === state.dshpv;
      const length = dsh ? pack.pack.duration ?? DSHPV_DURATION : pack.pack.duration ?? 0;
      state.clock.duration = length || DEFAULT_DURATION;
      for (const film of [state.generic, state.script]) {
        film.duration = length;
        film.setMeta({ title: pack.pack.title, artist: pack.pack.artist ?? "" });
      }
      state.script.setStructure({ sections: pack.pack.sections ?? [], bpm: pack.pack.canvas?.bpm ?? 0, beatOffset: pack.pack.canvas?.beatOffset ?? 0 });
      setDuration(state.clock.duration);
      if (pack.pack.canvas?.fontSize) setFontSize(pack.pack.canvas.fontSize);
      if (pack.empty) {
        clearAudio();
        return;
      }
      if (isScript(pack)) {
        if (!pack.files?.scene?.exists || pack.files.scene.tooLarge || !api) setSceneNote(`\u627E\u4E0D\u5230\u53EF\u7528\u7684\u573A\u666F\u811A\u672C\uFF08${pack.pack.canvas.script}\uFF09\uFF0C\u6539\u7528\u901A\u7528\u753B\u9762\u3002`);
        else {
          try {
            const { text: text4 } = await fetchPackText(api, pack.manifestPath, "scene", { isCancelled: () => cancelled });
            if (cancelled) return;
            const requested = pack.pack.canvas?.output;
            const output = isBitmapSceneOutput(requested) ? requested : "text";
            const names = Object.keys(pack.pack.canvas?.assets ?? {});
            const { assets, transfer } = names.length ? await loadSceneAssets(packAssetReader(api, pack.manifestPath, pack.pack), pack.pack, { images: isBitmapSceneOutput(output) }) : { assets: {}, transfer: [] };
            if (cancelled) {
              disposeSceneAssets({ transfer });
              return;
            }
            state.film = state.script;
            if (isBitmapSceneOutput(output)) setPixelScene(true);
            await state.script.load(text4, { output, size: pack.pack.canvas?.size ?? [1280, 720], assets, transfer });
            if (cancelled) {
              state.script.stop();
              return;
            }
          } catch (failure) {
            if (cancelled) return;
            if (state.film === state.script) state.film = state.generic;
            setPixelScene(false);
            setSceneNote(`\u573A\u666F\u811A\u672C\u65E0\u6CD5\u8FD0\u884C\uFF0C\u6539\u7528\u901A\u7528\u753B\u9762\uFF1A${failure?.message ?? failure}`);
          }
        }
      }
      if (pack.pack.workshop?.lyricsTiming && pack.files?.timing?.exists && !pack.files.timing.tooLarge && api) {
        try {
          const { text: text4 } = await fetchPackText(api, pack.manifestPath, "timing", { isCancelled: () => cancelled });
          if (cancelled) return;
          timingRef.current = JSON.parse(text4);
        } catch {
          timingRef.current = null;
        }
      }
      const bundledLoaded = { lyrics: false, spectrum: false };
      for (const role of ["lyrics", "spectrum"]) {
        if (!pack.pack[role] || !pack.files?.[role]?.exists || pack.files[role].tooLarge || !api) continue;
        try {
          const { name, text: text4 } = await fetchPackText(api, pack.manifestPath, role, { isCancelled: () => cancelled });
          if (cancelled) return;
          if (role === "lyrics") bundledLoaded.lyrics = await useLyricsText(name, text4, { remember: false, shift: pack.pack.lyrics?.offset ?? 0 });
          else bundledLoaded.spectrum = await useSpectrumText(name, text4, { remember: false, shift: pack.pack.spectrum?.offset ?? 0 });
        } catch (failure) {
          if (!cancelled) setError(`\u65E0\u6CD5\u8BFB\u53D6 MV \u5305\u7684 ${role}\uFF1A${failure?.message ?? failure}`);
        }
      }
      const audioSlot = mediaSlot(pack, "audio"), lyricsSlot = mediaSlot(pack, "lyrics");
      if (audioSlot) {
        const legacy = (kind) => legacyPresetSlot(pack) ? getMedia(db, kind) : Promise.resolve(null);
        const [a, l, sp] = await Promise.all([
          getMedia(db, audioSlot).then((v) => v ?? legacy("audio")),
          getMedia(db, lyricsSlot).then((v) => v ?? legacy("lyrics")),
          getMedia(db, mediaSlot(pack, "spectrum")).then((v) => v ?? legacy("spectrum"))
        ]);
        if (cancelled) return;
        if (l?.text && rememberedTrackApplies(pack, l, bundledLoaded.lyrics)) await useLyricsText(l.name, l.text, { remember: false });
        if (sp?.text && rememberedTrackApplies(pack, sp, bundledLoaded.spectrum)) await useSpectrumText(sp.name, sp.text, { remember: false });
        if (a?.file && !state.sha) await useAudioFile(a.file, { remember: false });
        if (!a?.file) setMatchNote({ level: "info", message: bundledLoaded.lyrics ? "\u5305\u5185\u6B4C\u8BCD\u4E0E\u8BD1\u6587\u5DF2\u81EA\u52A8\u52A0\u8F7D\uFF1B\u53EA\u9700\u9009\u62E9\u4F60\u81EA\u5DF1\u7684\u97F3\u4E50\u6587\u4EF6\uFF0C\u63D2\u4EF6\u4F1A\u68C0\u67E5\u6B4C\u66F2\u65F6\u957F\u662F\u5426\u5339\u914D\u3002" : "\u8FD9\u662F\u521B\u610F\u5DE5\u574A\u7684\u5305\uFF0C\u4E0D\u5E26\u97F3\u9891\uFF1A\u8BF7\u9009\u62E9\u4F60\u81EA\u5DF1\u7684\u6B4C\u66F2\u6587\u4EF6\u3002\u6CA1\u6709\u53EF\u7528\u7684\u5305\u5185\u6B4C\u8BCD\u8F68\u65F6\uFF0C\u53EF\u53E6\u9009\u672C\u5730\u6B4C\u8BCD\u3002" });
        return;
      }
      if (pack.pack.audio && pack.files?.audio?.exists && !pack.files.audio.tooLarge && api) {
        setPackStatus("\u6B63\u5728\u4ECE MV \u5305\u8BFB\u53D6\u97F3\u9891\u2026");
        try {
          const file = await fetchPackAudio(api, pack.manifestPath, {
            isCancelled: () => cancelled,
            onProgress: (done, total) => {
              if (!cancelled) setPackStatus(`\u6B63\u5728\u4ECE MV \u5305\u8BFB\u53D6\u97F3\u9891\u2026 ${Math.round(done / Math.max(1, total) * 100)}%`);
            }
          });
          if (cancelled) return;
          await useAudioFile(file, { remember: false, packOffset: pack.pack.audio.offset ?? 0 });
          setPackStatus("");
        } catch (failure) {
          if (!cancelled) {
            setPackStatus("");
            setError(`\u65E0\u6CD5\u8BFB\u53D6 MV \u5305\u7684\u97F3\u9891\uFF1A${failure?.message ?? failure}`);
          }
        }
      }
    })().catch((failure) => {
      if (!cancelled && state.sceneOwner === dshpvOwner) setError(`\u65E0\u6CD5\u52A0\u8F7D MV \u5305\uFF1A${failure?.message ?? failure}`);
    }).finally(() => {
      if (!cancelled && state.sceneOwner === dshpvOwner) setScenePreparing("");
    });
    state.sceneLoad = mediaLoad;
    return () => {
      cancelled = true;
      if (state.sceneOwner === dshpvOwner) {
        state.sceneOwner = null;
        state.playGate.cancel();
        state.clock.pause();
        state.script.stop();
      }
      if (state.dshpvOwner === dshpvOwner) {
        state.dshpvOwner = null;
        releaseDshPv();
      }
    };
  }, [pack.id, pack.loadedAt]);
  const clearAudio = () => {
    const old = audio.current.src;
    audio.current.removeAttribute("src");
    audio.current.load?.();
    if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
    engine.current.sha = "";
    setAudioFile(null);
    engine.current.clock.audioOffset = 0;
    setAudioInfo(null);
    setOffsets({ audioOffset: 0, subtitleOffset: 0 });
  };
  const clearSpectrum = async () => {
    const state = engine.current;
    state.energy = () => state.live.energy();
    setSpectrumInfo(null);
    const slot = mediaSlot(packRef.current, "spectrum");
    if (slot) await deleteMedia(dbRef.current, slot);
  };
  const clearLyrics = async () => {
    engine.current.film.setLyrics([]);
    setLyricsInfo(null);
    const slot = mediaSlot(packRef.current, "lyrics");
    if (slot) await deleteMedia(dbRef.current, slot);
  };
  const play = async () => {
    const state = engine.current;
    const owner = state.sceneOwner;
    try {
      state.live.ensure();
    } catch {
    }
    try {
      await state.playGate.play(state.sceneLoad, () => !state.disposed && state.sceneOwner === owner, async () => {
        if (state.clock.time() >= state.clock.duration - 0.5) state.clock.seek(0);
        state.started = true;
        await state.clock.play();
      });
    } catch (failure) {
      if (state.sceneOwner === owner) setError(`\u65E0\u6CD5\u64AD\u653E\uFF1A${failure?.message ?? failure}`);
    }
  };
  const pause = () => {
    const state = engine.current;
    state?.playGate.cancel();
    state?.clock.pause();
  };
  const act = (action) => {
    const state = engine.current;
    if (!state || !action) return false;
    const t = state.clock.time();
    switch (action.type) {
      case "toggle":
        if (state.playGate.pending || state.clock.playing) pause();
        else void play();
        return true;
      case "seekBy":
        state.clock.seek(Math.max(-60, t + action.delta));
        return true;
      case "restart":
        state.clock.seek(0);
        void play();
        return true;
      case "chapter": {
        const list = state.film === state.dshpv ? DSHPV_CHAPTERS.filter((_, i) => i % 2 === 0) : chaptersOf(packRef.current, state.clock.duration);
        const at = list[Math.min(list.length - 1, action.index)]?.[0];
        if (at !== void 0) {
          state.clock.seek(at);
          void play();
        }
        return true;
      }
      case "cue": {
        const at = stepCue(state.film.times, t, action.direction);
        if (at !== null) {
          state.clock.seek(at);
          state.started = true;
        }
        return true;
      }
      case "subtitleOffset":
        applyOffsets({ ...offsetsRef.current, subtitleOffset: stepOffset(offsetsRef.current.subtitleOffset, action.delta) });
        return true;
      case "audioOffset":
        applyOffsets({ ...offsetsRef.current, audioOffset: stepOffset(offsetsRef.current.audioOffset, action.delta) });
        return true;
      case "volume":
        audio.current.volume = Math.min(1, Math.max(0, Math.round((audio.current.volume + action.delta) * 100) / 100));
        return true;
      case "mute":
        audio.current.muted = !audio.current.muted;
        return true;
      case "help":
        state.help = !state.help;
        return true;
      case "escape":
        if (state.help) {
          state.help = false;
          return true;
        }
        return false;
      case "fullscreen":
        toggleFullscreen();
        return true;
      default:
        return false;
    }
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void wrap3.current?.requestFullscreen?.().catch((failure) => setError(`\u65E0\u6CD5\u5168\u5C4F\uFF1A${failure?.message ?? failure}`));
  };
  const onKeyDown = (event) => {
    if (event.target?.tagName === "INPUT" || event.target?.tagName === "SELECT") return;
    if (act(keyAction(event))) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  const pickText = (accept, handler) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) await handler(file.name, await file.text());
    };
    input.click();
  };
  const pickAudio = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = AUDIO_ACCEPT;
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void useAudioFile(file);
    };
    input.click();
  };
  const onDecodeError = async () => {
    if (!audio.current?.src) return;
    const current = packRef.current;
    const path = current?.files?.audio?.path ?? "";
    const label = audioInfo?.label ?? "\u672A\u77E5\u683C\u5F0F";
    let ffmpeg = "";
    if (path && api?.ffmpegInfo) {
      try {
        const found = unwrapRemote(await api.ffmpegInfo({}), "");
        if (found?.available) ffmpeg = found.path;
      } catch {
      }
    }
    setDecodeFail({ path, label, ffmpeg: path ? ffmpeg : "", confirming: false, busy: "" });
  };
  const convertWithFfmpeg = async () => {
    const failed = decodeFail;
    if (!failed?.path) return;
    setDecodeFail((value) => ({ ...value, busy: "\u6B63\u5728\u7528 ffmpeg \u8F6C\u6362\u2026" }));
    try {
      const done = unwrapRemote(await api.audioConvert({ path: failed.path, confirmed: true }), "ffmpeg \u8F6C\u6362\u5931\u8D25\u3002");
      setDecodeFail((value) => ({ ...value, busy: "\u6B63\u5728\u8BFB\u53D6\u8F6C\u6362\u7ED3\u679C\u2026" }));
      const bytes = await readHostAudio(api, done.path);
      setDecodeFail(null);
      await useAudioFile(new File([bytes], done.path.split(/[\\/]/).pop(), { type: "audio/wav" }), { remember: false, packOffset: packRef.current?.pack?.audio?.offset ?? 0 });
    } catch (failure) {
      setDecodeFail((value) => value && { ...value, busy: "", confirming: false });
      setError(`ffmpeg \u8F6C\u6362\u5931\u8D25\uFF1A${failure?.message ?? failure}`);
    }
  };
  const player = import_react3.default.useMemo(() => ({
    time: () => engine.current?.clock.time() ?? 0,
    seek: (t) => {
      const state = engine.current;
      if (!state) return;
      state.clock.seek(t);
      state.started = true;
    },
    play: () => {
      if (!engine.current?.clock.playing) void play();
    },
    pause,
    playing: () => Boolean(engine.current?.clock.playing)
  }), []);
  const previewCues = import_react3.default.useCallback((cues) => {
    const state = engine.current;
    if (!state) return;
    for (const film of [state.generic, state.script]) film.setLyrics(cues ?? cuesRef.current);
  }, []);
  const known = audioInfo?.known;
  const generic = isGeneric(pack);
  const dshActive = isDshPv(pack) && Boolean(dshpvReader || hasDshPvAssets(pack));
  const pixelActive = dshActive || pixelScene;
  const chapterList = dshActive ? DSHPV_CHAPTERS : chaptersOf(pack, duration);
  const chapter = chapterList.reduce((current, item) => item[0] <= Math.max(0, status.t) ? item : current, chapterList[0]);
  import_react3.default.useImperativeHandle(ref, () => ({
    toggle: () => act({ type: "toggle" }),
    pause,
    focus: () => wrap3.current?.focus(),
    /** Transport for the skins' player bar / status line (polled; no per-frame panel renders). */
    time: () => engine.current?.clock.time() ?? 0,
    duration: () => engine.current?.clock.duration ?? 0,
    playing: () => Boolean(engine.current?.clock.playing),
    seek: (t) => player.seek(Math.max(0, t)),
    seekBy: (delta) => act({ type: "seekBy", delta }),
    fullscreen: () => toggleFullscreen(),
    /** PNG (base64, ≤ 960 px wide) of the current frame, for a workshop cover. */
    snapshotPng: () => {
      const source = engine.current?.film === engine.current?.dshpv || engine.current?.film === engine.current?.script && isBitmapSceneOutput(engine.current?.script.output) ? pixel.current : canvas.current;
      if (!source?.width) return "";
      const scale = Math.min(1, 960 / source.width);
      const out = document.createElement("canvas");
      out.width = Math.round(source.width * scale);
      out.height = Math.round(source.height * scale);
      out.getContext("2d").drawImage(source, 0, 0, out.width, out.height);
      return out.toDataURL("image/png").split(",")[1] ?? "";
    },
    /** Duration + energy fingerprint of the loaded audio (for 发布到工坊), or null without audio. */
    audioFingerprint: async () => {
      const sha = engine.current?.sha;
      if (!sha || !audioFile) return null;
      if (fpRef.current?.sha === sha) return fpRef.current;
      const fp = await fingerprintAudio(await audioFile.arrayBuffer());
      fpRef.current = { sha, ...fp };
      return fpRef.current;
    }
  }), [audioFile]);
  import_react3.default.useEffect(() => {
    onState({ playing: status.playing, hasAudio: Boolean(audioInfo) });
  }, [status.playing, Boolean(audioInfo)]);
  const setLevel = (level) => {
    const el = audio.current;
    el.volume = Math.min(1, Math.max(0, level));
    if (el.muted && level > 0) el.muted = false;
  };
  const resetSync = () => {
    resetOffsets(audioInfo.sha);
    const v = loadOffsets(audioInfo.sha, KNOWN_AUDIO);
    applyOffsets(v);
    resetOffsets(audioInfo.sha);
  };
  const syncLabel = known ? `\u5DF2\u8BC6\u522B\uFF1A${known.label}` : audioInfo ? "\u672A\u8BC6\u522B\u7684\u7248\u672C\uFF1A\u542C\u7740\u4E0D\u540C\u6B65\u5C31\u7528 Alt+[ / Alt+] \u6821\u51C6" : "";
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-canvas-tab" }, !audioInfo && !packStatus && /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-onboard" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "mv-onboard-badge" }, ">_"), /* @__PURE__ */ import_react3.default.createElement("div", null, /* @__PURE__ */ import_react3.default.createElement("h2", null, pack.pack.workshop ? "\u521B\u610F\u5DE5\u574A\u7684\u5305\u4E0D\u5E26\u97F3\u9891\uFF1A\u9009\u62E9\u4F60\u81EA\u5DF1\u7684\u6B4C\u66F2" : "\u8FD9\u4E2A MV \u5305\u6CA1\u6709\u53EF\u7528\u7684\u97F3\u9891"), /* @__PURE__ */ import_react3.default.createElement("ol", null, /* @__PURE__ */ import_react3.default.createElement("li", null, "\u9009\u62E9\u4F60\u81EA\u5DF1\u7684\u97F3\u9891\u6216\u89C6\u9891\u6587\u4EF6\uFF08MP3\u3001M4A/AAC\u3001MP4/MOV/WebM/MKV \u89C6\u9891\u7684\u97F3\u8F68\u3001Opus/Ogg\u3001FLAC\u3001WAV \u90FD\u884C\uFF0C\u6309\u5185\u5BB9\u8BC6\u522B\uFF0C\u4E0D\u770B\u6269\u5C55\u540D\uFF1B\u5728\u672C\u673A\u89E3\u7801\uFF0C\u4E0D\u4E0A\u4F20\uFF09\u3002"), /* @__PURE__ */ import_react3.default.createElement("li", null, "\u53EF\u9009\uFF1A\u9009\u62E9\u6B4C\u8BCD\uFF08LRC / SRT / VTT / JSON / lyrics.js\uFF09\uFF0C\u753B\u9762\u4F1A\u663E\u793A\u5B57\u5E55\u3002JS \u53EA\u8BFB\u53D6\u9759\u6001 LYRICS \u6570\u636E\uFF0C\u4E0D\u6267\u884C\u4EE3\u7801\u3002"), /* @__PURE__ */ import_react3.default.createElement("li", null, "\u70B9 ", /* @__PURE__ */ import_react3.default.createElement("b", null, "\u25B6 \u64AD\u653E"), "\u3002\u4E5F\u53EF\u4EE5\u4E0D\u9009\u97F3\u9891\uFF0C\u76F4\u63A5\u9759\u97F3\u89C2\u770B\u753B\u9762\u3002")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-row" }, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-button", onClick: pickAudio }, "\u9009\u62E9\u97F3\u9891\u2026"), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", onClick: () => pickText(LYRICS_ACCEPT, useLyricsText) }, "\u9009\u62E9\u6B4C\u8BCD\u2026")))), packStatus && /* @__PURE__ */ import_react3.default.createElement(Alert, { kind: "info" }, /* @__PURE__ */ import_react3.default.createElement("p", null, packStatus)), matchNote && pack.pack.workshop && /* @__PURE__ */ import_react3.default.createElement(Alert, { kind: matchNote.level === "warn" ? "warn" : matchNote.level === "ok" ? "ok" : "info", actions: /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-link", onClick: () => setMatchNote(null) }, "\u5173\u95ED") }, /* @__PURE__ */ import_react3.default.createElement("p", { className: "mv-wrap", style: { whiteSpace: "pre-wrap" } }, matchNote.level === "warn" ? "\u26A0 \u97F3\u9891\u53EF\u80FD\u4E0E\u8FD9\u4E2A\u5DE5\u574A\u5305\u4E0D\u5339\u914D\uFF1A\n" : "", matchNote.message)), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-sources", "aria-label": "\u5A92\u4F53\u6587\u4EF6" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: `mv-source${audioInfo ? "" : " mv-source-empty"}` }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "mv-source-icon", "aria-hidden": "true" }, "\u266A"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-source-main" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-source-label" }, "\u97F3\u9891"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-source-value", title: audioInfo ? `${audioInfo.name}
sha256 ${audioInfo.sha}` : "" }, audioInfo ? `${audioInfo.name}${audioInfo.label && audioInfo.label !== "\u672A\u77E5\u683C\u5F0F" ? ` \xB7 ${audioInfo.label}` : ""}` : "\u672A\u9009\u62E9 \xB7 \u9759\u97F3\u6A21\u5F0F")), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", onClick: pickAudio }, audioInfo ? "\u66F4\u6362" : "\u9009\u62E9\u2026")), /* @__PURE__ */ import_react3.default.createElement("div", { className: `mv-source${lyricsInfo ? "" : " mv-source-empty"}` }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "mv-source-icon", "aria-hidden": "true" }, "\u201C"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-source-main" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-source-label" }, "\u6B4C\u8BCD"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-source-value" }, lyricsInfo ? `${lyricsInfo.name}\uFF08${lyricsInfo.count} \u53E5${lyricsInfo.note ? ` \xB7 ${lyricsInfo.note}` : ""}\uFF09` : "\u672A\u52A0\u8F7D \xB7 \u53EA\u663E\u793A [ \u95F4\u594F ]")), lyricsInfo && /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-link", onClick: () => void clearLyrics() }, "\u79FB\u9664"), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", title: "LRC / SRT / VTT / JSON / lyrics.js\uFF08\u53EA\u8BFB\u53D6\u9759\u6001 LYRICS \u6570\u636E\uFF0C\u4E0D\u6267\u884C\u4EE3\u7801\uFF09", onClick: () => pickText(LYRICS_ACCEPT, useLyricsText) }, lyricsInfo ? "\u66F4\u6362" : "\u9009\u62E9\u2026")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-source" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "mv-source-icon", "aria-hidden": "true" }, "\u25AE\u25AE"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-source-main" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-source-label" }, "\u9891\u8C31"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-source-value" }, spectrumInfo ? spectrumInfo.name : "\u5B9E\u65F6\u5206\u6790")), spectrumInfo && /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-link", onClick: () => void clearSpectrum() }, "\u6539\u7528\u5B9E\u65F6"), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", title: "\u53EF\u9009\uFF1Aspectrum.json", onClick: () => pickText(".json", useSpectrumText) }, spectrumInfo ? "\u66F4\u6362" : "\u6587\u4EF6\u2026"))), error && /* @__PURE__ */ import_react3.default.createElement(Alert, { kind: "error", actions: /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-link", onClick: () => setError("") }, "\u5173\u95ED") }, /* @__PURE__ */ import_react3.default.createElement("p", null, error)), sceneNote && /* @__PURE__ */ import_react3.default.createElement(Alert, { kind: "warn", actions: /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-link", onClick: () => setSceneNote("") }, "\u5173\u95ED") }, /* @__PURE__ */ import_react3.default.createElement("p", { className: "mv-wrap" }, sceneNote)), scenePreparing && /* @__PURE__ */ import_react3.default.createElement("p", { className: "mv-caption", role: "status", "aria-live": "polite" }, scenePreparing, "\uFF1B\u64AD\u653E\u4F1A\u7B49\u5F85\u8D44\u6E90\u51C6\u5907\u5B8C\u6210\u3002"), decodeFail && /* @__PURE__ */ import_react3.default.createElement(Alert, { kind: "warn", actions: decodeFail.ffmpeg && !decodeFail.confirming ? /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-button mv-button-small", disabled: decodeFail.busy, onClick: () => setDecodeFail((value) => ({ ...value, confirming: true })) }, "\u7528 ffmpeg \u8F6C\u6362\u2026")) : null }, /* @__PURE__ */ import_react3.default.createElement("p", { className: "mv-wrap" }, "\u9762\u677F\u65E0\u6CD5\u89E3\u7801\u8FD9\u4E2A\u97F3\u9891\uFF08", decodeFail.label, "\uFF09\u3002", decodeFail.ffmpeg ? "\u627E\u5230\u4E86\u4F60\u672C\u673A\u7684 ffmpeg\uFF0C\u53EF\u4EE5\u628A\u5B83\u8F6C\u6362\u6210 WAV \u7F13\u5B58\u540E\u64AD\u653E\uFF08\u539F\u6587\u4EF6\u4E0D\u53D8\uFF09\u3002" : "\u5B89\u88C5 ffmpeg\uFF08\u653E\u8FDB PATH\uFF0C\u6216 D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe\uFF09\u540E\u53EF\u4EE5\u81EA\u52A8\u8F6C\u6362\uFF1B\u6216\u8005\u6362\u6210 MP3 / M4A / FLAC / WAV\u3002"), decodeFail.confirming && /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-confirm", role: "dialog", "aria-label": "\u786E\u8BA4\u7528 ffmpeg \u8F6C\u6362" }, /* @__PURE__ */ import_react3.default.createElement("strong", null, "\u7528\u4F60\u672C\u673A\u7684 ffmpeg \u8F6C\u6362\u8FD9\u4E2A\u6587\u4EF6\uFF1F"), /* @__PURE__ */ import_react3.default.createElement("span", { className: "mv-caption" }, "Host \u5C06\u8FD0\u884C\uFF08\u4E0D\u7ECF\u8FC7 shell\uFF0C\u6700\u591A 10 \u5206\u949F\uFF09\uFF1A"), /* @__PURE__ */ import_react3.default.createElement("code", { className: "mv-cmd" }, displayCommand(decodeFail.ffmpeg, ffmpegArgs(decodeFail.path, "<\u63D2\u4EF6\u7F13\u5B58>\\<sha256>.wav"))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-row" }, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-button", disabled: decodeFail.busy, onClick: () => void convertWithFfmpeg() }, decodeFail.busy ? decodeFail.busy : "\u786E\u8BA4\u8F6C\u6362"), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", disabled: Boolean(decodeFail.busy), onClick: () => setDecodeFail((value) => ({ ...value, confirming: false })) }, "\u53D6\u6D88")))), /* @__PURE__ */ import_react3.default.createElement(
    "div",
    {
      ref: wrap3,
      className: `mv-stage-wrap${fullscreen ? " mv-fullscreen" : ""}`,
      tabIndex: 0,
      onKeyDown,
      onDoubleClick: toggleFullscreen,
      "aria-label": "\u753B\u5E03 MV\uFF08\u70B9\u51FB\u540E\u53EF\u7528\u952E\u76D8\u63A7\u5236\uFF09"
    },
    /* @__PURE__ */ import_react3.default.createElement("div", { ref: stage, className: "mv-stage", onClick: () => wrap3.current?.focus() }, /* @__PURE__ */ import_react3.default.createElement("canvas", { ref: canvas, style: pixelActive ? { display: "none" } : void 0 }), /* @__PURE__ */ import_react3.default.createElement("canvas", { ref: pixel, className: "mv-pixel", style: pixelActive ? void 0 : { display: "none" }, "aria-label": dshActive ? "dsh-pv \u753B\u5E03" : "MV \u753B\u5E03" }))
  ), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-playerbar", "aria-label": "\u64AD\u653E\u63A7\u5236" }, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-round", "aria-label": status.playing ? "\u6682\u505C" : "\u64AD\u653E", title: status.playing ? "\u6682\u505C\uFF08\u7A7A\u683C\uFF09" : "\u64AD\u653E\uFF08\u7A7A\u683C\uFF09", onClick: () => act({ type: "toggle" }) }, status.playing ? /* @__PURE__ */ import_react3.default.createElement(Icon.pause, null) : /* @__PURE__ */ import_react3.default.createElement(Icon.play, null)), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-seek-wrap" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "mv-time" }, timeText(status.t)), /* @__PURE__ */ import_react3.default.createElement(
    "input",
    {
      className: "mv-seek",
      type: "range",
      min: 0,
      max: Math.max(1, duration),
      step: 0.1,
      value: Math.max(0, Math.min(duration, status.t)),
      onChange: (event) => {
        engine.current.clock.seek(Number(event.target.value));
        engine.current.started = true;
      },
      "aria-label": "\u8FDB\u5EA6"
    }
  ), /* @__PURE__ */ import_react3.default.createElement("span", { className: "mv-time" }, timeText(Math.round(duration)))), /* @__PURE__ */ import_react3.default.createElement("span", { className: "mv-chip", title: "\u5F53\u524D\u7AE0\u8282\uFF081\u20135 \u8DF3\u8F6C\uFF09" }, chapter[1], " ", chapter[2]), /* @__PURE__ */ import_react3.default.createElement("span", { className: "mv-volume" }, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-icon-button", "aria-label": volume.muted ? "\u53D6\u6D88\u9759\u97F3" : "\u9759\u97F3", title: "\u9759\u97F3\uFF08M\uFF09", onClick: () => act({ type: "mute" }) }, volume.muted || volume.level === 0 ? /* @__PURE__ */ import_react3.default.createElement(Icon.mute, null) : /* @__PURE__ */ import_react3.default.createElement(Icon.volume, null)), /* @__PURE__ */ import_react3.default.createElement("input", { type: "range", min: 0, max: 1, step: 0.05, value: volume.muted ? 0 : volume.level, "aria-label": "\u97F3\u91CF", onChange: (event) => setLevel(Number(event.target.value)) })), /* @__PURE__ */ import_react3.default.createElement("span", { className: "mv-stepper", title: `\u97F3\u9891\u540C\u6B65\uFF08Alt+[ / Alt+]\uFF09${syncLabel ? `
${syncLabel}` : ""}` }, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", "aria-label": "\u97F3\u9891\u540C\u6B65 \u22120.1 \u79D2", onClick: () => act({ type: "audioOffset", delta: -0.1 }) }, "\u2212"), /* @__PURE__ */ import_react3.default.createElement("span", null, "\u540C\u6B65 ", formatOffset(offsets.audioOffset)), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", "aria-label": "\u97F3\u9891\u540C\u6B65 +0.1 \u79D2", onClick: () => act({ type: "audioOffset", delta: 0.1 }) }, "+")), /* @__PURE__ */ import_react3.default.createElement(Popover, { label: "\u952E\u76D8\u5FEB\u6377\u952E", icon: /* @__PURE__ */ import_react3.default.createElement(Icon.keyboard, null) }, /* @__PURE__ */ import_react3.default.createElement(KeyHelp, null)), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-icon-button", "aria-label": fullscreen ? "\u9000\u51FA\u5168\u5C4F" : "\u5168\u5C4F", title: "\u5168\u5C4F\uFF08F\uFF09", onClick: toggleFullscreen }, /* @__PURE__ */ import_react3.default.createElement(Icon.fullscreen, null))), !pack.empty && api?.packWriteText && /* @__PURE__ */ import_react3.default.createElement(CalibEditor, { api, pack, lyricsText, audioFile, duration, player, onPreview: previewCues }), /* @__PURE__ */ import_react3.default.createElement("details", { className: "mv-details" }, /* @__PURE__ */ import_react3.default.createElement("summary", null, "\u8BBE\u7F6E ", /* @__PURE__ */ import_react3.default.createElement("span", { className: "mv-caption" }, "\u5B57\u53F7 ", fontSize, " \xB7 \u5B57\u5E55\u504F\u79FB ", formatOffset(offsets.subtitleOffset), syncLabel ? ` \xB7 ${syncLabel}` : "")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-details-body" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-form" }, /* @__PURE__ */ import_react3.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react3.default.createElement("span", null, "\u753B\u9762\u5B57\u53F7\uFF08\u50CF\u7D20\uFF09"), /* @__PURE__ */ import_react3.default.createElement("input", { type: "number", min: 8, max: 32, value: fontSize, onChange: (event) => setFontSize(Math.min(32, Math.max(8, Number(event.target.value) || 14))) })), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-field" }, /* @__PURE__ */ import_react3.default.createElement("span", null, "\u5B57\u5E55\u504F\u79FB\uFF08[ / ]\uFF09"), /* @__PURE__ */ import_react3.default.createElement("span", { className: "mv-stepper", style: { alignSelf: "flex-start" } }, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", "aria-label": "\u5B57\u5E55\u504F\u79FB \u22120.1 \u79D2", onClick: () => act({ type: "subtitleOffset", delta: -0.1 }) }, "\u2212"), /* @__PURE__ */ import_react3.default.createElement("span", null, formatOffset(offsets.subtitleOffset)), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", "aria-label": "\u5B57\u5E55\u504F\u79FB +0.1 \u79D2", onClick: () => act({ type: "subtitleOffset", delta: 0.1 }) }, "+"))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-field" }, /* @__PURE__ */ import_react3.default.createElement("span", null, "\u504F\u79FB"), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", disabled: !audioInfo, onClick: resetSync, style: { alignSelf: "flex-start" } }, "\u6062\u590D\u9ED8\u8BA4\u504F\u79FB"))), /* @__PURE__ */ import_react3.default.createElement("p", { className: "mv-caption" }, "\u504F\u79FB\u6309\u97F3\u9891\u6587\u4EF6\u7684 sha256 \u8BB0\u5728\u672C\u673A\u3002", audioInfo && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, "\u5F53\u524D\u97F3\u9891 ", /* @__PURE__ */ import_react3.default.createElement("code", { title: audioInfo.sha }, audioInfo.sha.slice(0, 12), "\u2026"), "\u3002"), "\u7F51\u683C ", status.cols, "\xD7", status.rows, "\uFF08\u6700\u5C0F 64\xD724\uFF0C\u6700\u5927 240\xD785\uFF09\u3002"))), /* @__PURE__ */ import_react3.default.createElement(
    "audio",
    {
      ref: audio,
      preload: "auto",
      onLoadedMetadata: (event) => {
        const length = event.currentTarget.duration;
        setAudioInfo((info) => info ? { ...info, duration: length } : info);
        const state = engine.current;
        if (state && (state.film === state.generic || state.film === state.script) && !packRef.current?.pack?.duration && Number.isFinite(length) && length > 0) {
          state.clock.duration = length;
          state.generic.duration = length;
          state.script.duration = length;
          setDuration(length);
        }
      },
      onError: () => {
        void onDecodeError();
      },
      onVolumeChange: (event) => setVolume({ level: event.currentTarget.volume, muted: event.currentTarget.muted }),
      onEnded: () => {
        if (engine.current) engine.current.started = true;
      }
    }
  ));
});

// .dsh-plugin/client/mv-info.mjs
var text3 = (value) => typeof value === "string" ? value.trim() : "";
async function loadInfo(api) {
  const info = unwrapRemote(await api.info(), "\u65E0\u6CD5\u8BFB\u53D6 MV \u63D2\u4EF6\u72B6\u6001\u3002");
  if (!info || typeof info !== "object") throw new Error("MV \u63D2\u4EF6\u72B6\u6001\u683C\u5F0F\u65E0\u6548\u3002");
  return info;
}
var errorText = (error, fallback) => remoteErrorText(text3(error?.message), fallback);

// .dsh-plugin/client/mv-library.jsx
var import_react7 = __toESM(require("react"), 1);

// .dsh-plugin/client/mv-ai.jsx
var import_react5 = __toESM(require("react"), 1);

// .dsh-plugin/client/mv-engine-card.jsx
var import_react4 = __toESM(require("react"), 1);
var GB = (mb) => `${(mb / 1024).toFixed(mb >= 1024 ? 1 : 2)} GB`;
var MODEL_LABELS = Object.freeze({ "large-v3": "large-v3\uFF08\u6700\u51C6\uFF0CGPU \u63A8\u8350\uFF09", medium: "medium\uFF08\u6298\u4E2D\uFF09", small: "small\uFF08\u6700\u5FEB\uFF0CCPU \u63A8\u8350\uFF09" });
function useEngineInfo(api) {
  const [info, setInfo] = import_react4.default.useState(null);
  const refresh = import_react4.default.useCallback(async () => {
    if (!api?.engineInfo) return null;
    try {
      const value = unwrapRemote(await api.engineInfo({}), "");
      setInfo(value);
      return value;
    } catch (failure) {
      setInfo({ status: "error", error: errorText(failure, "") });
      return null;
    }
  }, [api]);
  import_react4.default.useEffect(() => {
    void refresh();
  }, [refresh]);
  return [info, refresh];
}
var engineReady = (info) => info?.status === "ready" && Object.values(info.models ?? {}).some(Boolean);
var installedModels = (info) => Object.entries(info?.models ?? {}).filter(([, present]) => present).map(([name]) => name);
function EngineCard({ api, info, refresh, compact = false }) {
  const [confirm, setConfirm] = import_react4.default.useState(null);
  const [job, setJob] = import_react4.default.useState(null);
  const [error, setError] = import_react4.default.useState("");
  const stop = import_react4.default.useRef(null);
  if (!info) return null;
  const estimate = confirm ? confirm.kind === "install" ? info.estimates?.[`${confirm.profile}:${confirm.model}`] : { downloadMB: (info.modelSizes?.[confirm.model] ?? 0) + (info.demucs ? 0 : info.demucsMB ?? 0), diskMB: info.modelSizes?.[confirm.model] ?? 0 } : null;
  const run = async (start, label) => {
    setError("");
    setConfirm(null);
    const controller = new AbortController();
    stop.current = controller;
    try {
      const started = unwrapRemote(await start(), "\u65E0\u6CD5\u542F\u52A8\u3002");
      setJob({ id: started.jobId, ratio: 0, label, step: started.steps?.[0]?.label ?? "", log: [] });
      await followJob(api, started.jobId, {
        signal: controller.signal,
        onEvent: (event) => setJob((current) => current && {
          ...current,
          step: event.type === "step" ? event.label : current.step,
          detail: event.type === "progress" ? event.message : current.detail,
          log: event.type === "log" && event.message ? [...current.log, event.message].slice(-40) : current.log
        }),
        onProgress: (read) => setJob((current) => current && { ...current, ratio: read.ratio })
      });
      setJob(null);
    } catch (failure) {
      setJob((current) => current && { ...current, failed: true });
      setError(errorText(failure, "\u5931\u8D25\u3002"));
    } finally {
      stop.current = null;
      await refresh();
    }
  };
  const status = info.status;
  const gpu = info.gpu ? `${info.gpu.name}\uFF08${Math.round(info.gpu.vramMB / 1024)} GB\uFF09` : "";
  const models = installedModels(info);
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: "mv-engine-card", "aria-label": "\u6B4C\u8BCD\u5F15\u64CE" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "mv-row", style: { justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ import_react4.default.createElement("strong", null, "\u672C\u673A\u6B4C\u8BCD\u5F15\u64CE\uFF08faster-whisper + Demucs\uFF09"), /* @__PURE__ */ import_react4.default.createElement("span", { className: "mv-caption" }, status === "ready" ? info.cuda ? `GPU\uFF1A${gpu}` : "\u53EA\u80FD\u7528 CPU\uFF08\u8F83\u6162\uFF09" : status === "missing" ? "\u672A\u5B89\u88C5" : status === "unchecked" ? "\u5DF2\u5B89\u88C5\uFF0C\u5F85\u68C0\u67E5" : status === "incomplete" ? "\u4F9D\u8D56\u4E0D\u5B8C\u6574" : status)), !compact && /* @__PURE__ */ import_react4.default.createElement("p", { className: "mv-caption" }, "\u6CA1\u6709\u73B0\u6210\u65F6\u95F4\u8F74\u65F6\uFF0C\u7528\u5B83\u5728\u672C\u673A\u542C\u6B4C\u8BC6\u522B\u6BCF\u53E5\u7684\u65F6\u95F4\uFF08\u97F3\u9891\u4E0D\u4E0A\u4F20\uFF09\u3002\u5B89\u88C5\u5728 ", /* @__PURE__ */ import_react4.default.createElement("code", null, info.dir), "\uFF0C\u7528 uv \u5EFA\u72EC\u7ACB\u7684 Python ", info.pins?.python, " \u73AF\u5883\uFF0C\u4E0D\u5F71\u54CD\u4F60\u5DF2\u6709\u7684 Python\u3002"), status === "ready" && /* @__PURE__ */ import_react4.default.createElement("p", { className: "mv-caption" }, "\u5DF2\u4E0B\u8F7D\u6A21\u578B\uFF1A", models.length ? models.join("\u3001") : "\u65E0", info.demucs ? " \xB7 \u4EBA\u58F0\u5206\u79BB htdemucs \u2713" : " \xB7 \u4EBA\u58F0\u5206\u79BB\u6A21\u578B\u672A\u4E0B\u8F7D", !info.cuda ? " \xB7 \u6CA1\u6709\u53EF\u7528\u7684 NVIDIA GPU\uFF1A\u8BC6\u522B\u4E00\u9996\u6B4C\u7EA6\u9700\u51E0\u5206\u949F\uFF0C\u5EFA\u8BAE\u7528 small\u3002" : ""), info.external && /* @__PURE__ */ import_react4.default.createElement("p", { className: "mv-caption" }, "\u4F7F\u7528\u8BBE\u7F6E\u91CC\u6307\u5B9A\u7684 Python\uFF1A", /* @__PURE__ */ import_react4.default.createElement("code", null, info.python), "\uFF08\u4E0D\u4F1A\u81EA\u52A8\u5B89\u88C5\uFF1B\u7F3A\u4F9D\u8D56\u65F6\u8BF7\u624B\u52A8 pip install \u540E\u70B9\u300C\u68C0\u67E5\u300D\uFF09\u3002"), !job && !confirm && /* @__PURE__ */ import_react4.default.createElement("div", { className: "mv-row" }, (status === "missing" || status === "incomplete") && !info.external && /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "mv-button mv-button-small", disabled: !info.uv, onClick: () => setConfirm({ kind: "install", profile: "cuda", model: "large-v3" }) }, "\u4E00\u952E\u5B89\u88C5\u2026"), status === "ready" && ["large-v3", "medium", "small"].filter((m) => !info.models?.[m]).length > 0 && /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", onClick: () => setConfirm({ kind: "model", model: ["large-v3", "medium", "small"].find((m) => !info.models?.[m]) }) }, "\u4E0B\u8F7D\u6A21\u578B\u2026"), status !== "missing" && /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", onClick: () => void run(() => api.engineProbe({}), "\u68C0\u67E5\u5F15\u64CE") }, "\u68C0\u67E5"), !info.uv && status === "missing" && !info.external && /* @__PURE__ */ import_react4.default.createElement("span", { className: "mv-caption" }, "\u6CA1\u6709\u627E\u5230 uv\uFF1A\u8BF7\u5148\u5B89\u88C5 uv\uFF08https://docs.astral.sh/uv/\uFF09\uFF0C\u6216\u5728\u63D2\u4EF6\u8BBE\u7F6E\u91CC\u586B uv.exe \u7684\u8DEF\u5F84 / \u5DF2\u6709\u7684 Python \u73AF\u5883\u3002")), confirm && /* @__PURE__ */ import_react4.default.createElement("div", { className: "mv-confirm", role: "dialog", "aria-label": "\u786E\u8BA4\u4E0B\u8F7D" }, /* @__PURE__ */ import_react4.default.createElement("strong", null, confirm.kind === "install" ? "\u4E0B\u8F7D\u5E76\u5B89\u88C5\u6B4C\u8BCD\u5F15\u64CE\uFF1F" : "\u4E0B\u8F7D\u8BC6\u522B\u6A21\u578B\uFF1F"), confirm.kind === "install" && /* @__PURE__ */ import_react4.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react4.default.createElement("span", null, "PyTorch \u7248\u672C"), /* @__PURE__ */ import_react4.default.createElement("select", { value: confirm.profile, onChange: (event) => setConfirm((c) => ({ ...c, profile: event.target.value })) }, /* @__PURE__ */ import_react4.default.createElement("option", { value: "cuda" }, "NVIDIA GPU\uFF08CUDA 12.6\uFF0C\u63A8\u8350\u6709 N \u5361\u65F6\uFF09"), /* @__PURE__ */ import_react4.default.createElement("option", { value: "cpu" }, "\u53EA\u7528 CPU\uFF08\u4E0B\u8F7D\u5C0F\uFF0C\u8BC6\u522B\u6162\uFF09"))), /* @__PURE__ */ import_react4.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react4.default.createElement("span", null, "\u8BC6\u522B\u6A21\u578B"), /* @__PURE__ */ import_react4.default.createElement("select", { value: confirm.model, onChange: (event) => setConfirm((c) => ({ ...c, model: event.target.value })) }, Object.entries(MODEL_LABELS).filter(([m]) => confirm.kind === "install" || !info.models?.[m]).map(([m, label]) => /* @__PURE__ */ import_react4.default.createElement("option", { key: m, value: m }, label, " \xB7 ", GB(info.modelSizes?.[m] ?? 0))))), /* @__PURE__ */ import_react4.default.createElement("span", { className: "mv-caption" }, "\u7EA6\u9700\u4E0B\u8F7D ", /* @__PURE__ */ import_react4.default.createElement("b", null, GB(estimate?.downloadMB ?? 0)), estimate?.diskMB ? `\uFF0C\u5360\u7528\u78C1\u76D8\u7EA6 ${GB(estimate.diskMB)}` : "", "\u3002\u6765\u6E90\uFF1A", confirm.kind === "install" ? "pypi.org\u3001download.pytorch.org\u3001" : "", "huggingface.co\uFF08\u6A21\u578B\uFF09\u3002\u53EF\u4EE5\u968F\u65F6\u505C\u6B62\uFF0C\u4E0B\u6B21\u4F1A\u63A5\u7740\u88C5\u3002"), /* @__PURE__ */ import_react4.default.createElement("div", { className: "mv-row" }, /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "mv-button mv-button-small", onClick: () => void (confirm.kind === "install" ? run(() => api.engineInstall({ confirmed: true, profile: confirm.profile, model: confirm.model }), "\u5B89\u88C5\u6B4C\u8BCD\u5F15\u64CE") : run(() => api.engineModel({ confirmed: true, model: confirm.model }), `\u4E0B\u8F7D ${confirm.model}`)) }, "\u786E\u8BA4\u4E0B\u8F7D"), /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", onClick: () => setConfirm(null) }, "\u53D6\u6D88"))), job && /* @__PURE__ */ import_react4.default.createElement("div", { "aria-live": "polite" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "mv-row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ import_react4.default.createElement("span", { className: "mv-caption" }, job.label, " \xB7 ", job.step, job.detail ? ` \xB7 ${job.detail}` : ""), /* @__PURE__ */ import_react4.default.createElement("span", { className: "mv-caption" }, Math.round((job.ratio ?? 0) * 100), "%")), /* @__PURE__ */ import_react4.default.createElement("div", { className: "mv-progress" }, /* @__PURE__ */ import_react4.default.createElement("span", { style: { width: `${Math.round((job.ratio ?? 0) * 100)}%` } })), job.log.length > 0 && /* @__PURE__ */ import_react4.default.createElement("pre", { className: "mv-log" }, job.log.slice(-6).join("\n")), !job.failed && /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", onClick: () => stop.current?.abort() }, "\u505C\u6B62")), error && /* @__PURE__ */ import_react4.default.createElement(Alert, { kind: "error" }, /* @__PURE__ */ import_react4.default.createElement("p", { className: "mv-wrap" }, error)));
}

// .dsh-plugin/shared/mv-calib-protocol.mjs
var fail3 = (message) => {
  throw new TypeError(message);
};
var LRCLIB_FIELDS = Object.freeze(["title", "artist", "album", "duration"]);
function parseLyricsLookup(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail3("lyricsLookup must be an object");
  const extra = Object.keys(value).filter((k) => !LRCLIB_FIELDS.includes(k));
  if (extra.length) fail3(`lyricsLookup: unexpected fields: ${extra.join(", ")}`);
  const text4 = (v, name, max = 300) => v === void 0 ? "" : typeof v === "string" && v.length <= max ? v.trim() : fail3(`${name} must be a string`);
  const title = text4(value.title, "title");
  if (!title) fail3("title is required");
  const duration = value.duration === void 0 || value.duration === null ? null : Number.isFinite(value.duration) && value.duration > 0 && value.duration < 36e3 ? value.duration : fail3("duration out of range");
  return { title, artist: text4(value.artist, "artist"), album: text4(value.album, "album"), duration };
}
var PACK_TEXT_FILES = Object.freeze({ "lyrics.lrc": 2 * 1048576, [MV_PACK_MANIFEST]: 512 * 1024, "timing.json": 8 * 1048576, "sections.json": 1048576 });
var ANALYSIS_FILES = Object.freeze({ manifest: MV_PACK_MANIFEST, transcript: "analysis/transcript.json", vocals: "analysis/vocals.wav", timing: "timing.json", sections: "sections.json" });
var READ_CHUNK = 1024 * 1024;
var absManifest = (v) => typeof v === "string" && isAbsolutePackPath(v) ? v : fail3("manifestPath must be an absolute path");
function parsePackWriteText(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail3("packWriteText must be an object");
  const extra = Object.keys(value).filter((k) => !["manifestPath", "file", "text"].includes(k));
  if (extra.length) fail3(`packWriteText: unexpected fields: ${extra.join(", ")}`);
  if (!Object.hasOwn(PACK_TEXT_FILES, value.file)) fail3(`file must be one of ${Object.keys(PACK_TEXT_FILES).join(", ")}`);
  if (typeof value.text !== "string") fail3("text must be a string");
  if (Buffer.byteLength(value.text, "utf8") > PACK_TEXT_FILES[value.file]) fail3(`${value.file} is too large`);
  return { manifestPath: absManifest(value.manifestPath), file: value.file, text: value.text };
}
function parseAnalysisRead(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail3("analysisRead must be an object");
  const extra = Object.keys(value).filter((k) => !["manifestPath", "name", "offset", "length"].includes(k));
  if (extra.length) fail3(`analysisRead: unexpected fields: ${extra.join(", ")}`);
  if (!Object.hasOwn(ANALYSIS_FILES, value.name)) fail3(`name must be one of ${Object.keys(ANALYSIS_FILES).join(", ")}`);
  const offset = value.offset ?? 0, length = value.length ?? READ_CHUNK;
  if (!Number.isInteger(offset) || offset < 0) fail3("offset must be a non-negative integer");
  if (!Number.isInteger(length) || length < 1 || length > READ_CHUNK) fail3("length out of range");
  return { manifestPath: absManifest(value.manifestPath), name: value.name, offset, length };
}

// .dsh-plugin/client/mv-ai.jsx
var STEP_DOT = { pending: "\u25CB", running: "\u25D0", done: "\u25CF", skipped: "\u2013", failed: "\u2715", stopped: "\u25A0" };
var LANGS = { auto: "\u81EA\u52A8\u8BC6\u522B", zh: "\u4E2D\u6587", ja: "\u65E5\u8BED", en: "\u82F1\u8BED", ko: "\u97E9\u8BED", yue: "\u7CA4\u8BED" };
function stepText(id, detail) {
  if (!detail) return "";
  if (detail.reason) return detail.reason;
  if (detail.message) return detail.message;
  switch (id) {
    case "pack":
      return `${Math.round(detail.duration ?? 0)} \u79D2`;
    case "lrclib":
      return detail.found ? `\u627E\u5230 ${detail.track}${detail.synced ? "\uFF08\u5E26\u65F6\u95F4\u8F74\uFF09" : "\uFF08\u7EAF\u6587\u672C\uFF0C\u7528\u5F15\u64CE\u5BF9\u9F50\uFF09"}` : "\u6CA1\u6709\u627E\u5230";
    case "engine":
      return `${detail.model} \xB7 ${detail.device === "cuda" ? "GPU" : "CPU"} \xB7 ${detail.words} \u4E2A\u8BCD \xB7 ${detail.seconds ?? ""} \u79D2${detail.separated ? " \xB7 \u5DF2\u5206\u79BB\u4EBA\u58F0" : ""}`;
    case "align":
      return `${detail.lines} \u53E5${detail.low ? `\uFF0C${detail.low} \u53E5\u7F6E\u4FE1\u5EA6\u4F4E\uFF08\u6821\u51C6\u65F6\u6807\u9EC4\uFF09` : ""} \xB7 \u6765\u6E90 ${detail.source}`;
    case "sections":
      return `${detail.sections} \u6BB5\uFF1A${(detail.kinds ?? []).join(" / ")}`;
    case "save":
      return `\u5DF2\u5199\u5165 ${detail.files?.length ?? 0} \u4E2A\u6587\u4EF6`;
    default:
      return "";
  }
}
var STAGES = { read: "\u8BFB\u53D6\u97F3\u9891", decode: "\u5728\u672C\u673A\u89E3\u7801", spectrum: "\u8BA1\u7B97\u9891\u8C31", copy: "\u590D\u5236\u97F3\u9891\u5230 MV \u5305", "spectrum-save": "\u4FDD\u5B58 spectrum.json", done: "\u5B8C\u6210", load: "\u52A0\u8F7D\u6A21\u578B", separate: "\u5206\u79BB\u4EBA\u58F0", transcribe: "\u8BC6\u522B", write: "\u5199\u7ED3\u679C" };
var baseName = (name) => String(name ?? "").replace(/\.[^.]+$/, "").replace(/[_]+/g, " ").trim();
var AREA = { width: "100%", minHeight: 72, padding: "6px 8px", borderRadius: 8, border: "1px solid var(--mv-border)", background: "var(--mv-bg)", resize: "vertical", fontFamily: "inherit", fontSize: 12.5 };
function AiPackDialog({ api, harness, info, onClose, onLoaded, onRecent }) {
  const [file, setFile] = import_react5.default.useState(null);
  const [audioLabel, setAudioLabel] = import_react5.default.useState("");
  const [title, setTitle] = import_react5.default.useState("");
  const [artist, setArtist] = import_react5.default.useState("");
  const [lyrics, setLyrics] = import_react5.default.useState("");
  const [style, setStyle] = import_react5.default.useState("");
  const [parentDir, setParentDir] = import_react5.default.useState("");
  const [progress, setProgress] = import_react5.default.useState(null);
  const [error, setError] = import_react5.default.useState("");
  const [result, setResult] = import_react5.default.useState(null);
  const [prompt, setPrompt] = import_react5.default.useState("");
  const [session, setSession] = import_react5.default.useState(null);
  const [sending, setSending] = import_react5.default.useState(false);
  const [copied, setCopied] = import_react5.default.useState(false);
  const [album, setAlbum] = import_react5.default.useState("");
  const [engineInfo, refreshEngine] = useEngineInfo(api);
  const [auto, setAuto] = import_react5.default.useState(null);
  const [autoOptions, setAutoOptions] = import_react5.default.useState({ useLrclib: info?.lrclib !== false, useEngine: true, model: "", language: "auto", separate: true, verifySynced: null });
  const stopRef = import_react5.default.useRef(null);
  const pick = directoryPicker();
  const support = sessionSupport(harness);
  const toolsOn = info?.agentTools?.registered !== false;
  const chooseAudio = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = AUDIO_ACCEPT;
    input.onchange = async () => {
      const chosen = input.files?.[0];
      if (!chosen) return;
      setError("");
      const head = new Uint8Array(await chosen.slice(0, 4096).arrayBuffer());
      const checked = inspectAiAudio(head);
      setAudioLabel(checked.sniff.label);
      if (checked.problem) {
        setError(checked.problem);
        setFile(null);
        return;
      }
      setFile(chosen);
      const meta = await guessMetadata(chosen).catch(() => ({}));
      if (!title.trim()) setTitle(meta.title || baseName(chosen.name));
      if (!artist.trim() && meta.artist) setArtist(meta.artist);
      if (meta.album) setAlbum(meta.album);
    };
    input.click();
  };
  const chooseLyrics = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = LYRICS_ACCEPT;
    input.onchange = async () => {
      const chosen = input.files?.[0];
      if (!chosen) return;
      try {
        const body = await chosen.text();
        const parsed = linesFromText(body, { name: chosen.name });
        setLyrics(parsed.timed ? linesToLrc(parsed.lines) : body);
        setError("");
      } catch (failure) {
        setError(errorText(failure, "\u65E0\u6CD5\u89E3\u6790\u6B4C\u8BCD\u3002"));
      }
    };
    input.click();
  };
  const chooseDir = async () => {
    try {
      const dir = await pick?.();
      if (dir) setParentDir(dir);
    } catch (failure) {
      setError(errorText(failure, "\u65E0\u6CD5\u6253\u5F00\u6587\u4EF6\u5939\u9009\u62E9\u5668\u3002"));
    }
  };
  const create = async () => {
    setError("");
    setProgress({ stage: "read", ratio: 0 });
    try {
      const made = await createAiPack(api, { file, title, artist, lyrics, style, parentDir }, { toolsAvailable: toolsOn, onProgress: (value) => setProgress(value) });
      setResult(made);
      setPrompt(made.prompt);
      try {
        const loaded = await loadPackFromHost(api, made.created.manifestPath);
        onRecent(rememberPack(loaded));
        onLoaded(loaded);
      } catch {
      }
    } catch (failure) {
      setError(errorText(failure, "\u65E0\u6CD5\u521B\u5EFA MV \u5305\u3002"));
    } finally {
      setProgress(null);
    }
  };
  const models = installedModels(engineInfo);
  const model = autoOptions.model && models.includes(autoOptions.model) ? autoOptions.model : engineInfo?.cuda && models.includes("large-v3") ? "large-v3" : models.includes("small") ? "small" : models[0] ?? "";
  const engineOn = engineReady(engineInfo) && autoOptions.useEngine && Boolean(model);
  const lrclibAllowed = info?.lrclib !== false;
  const verifySynced = autoOptions.verifySynced ?? Boolean(engineInfo?.cuda);
  const autoMake = async () => {
    setError("");
    const controller = new AbortController();
    stopRef.current = controller;
    const steps = Object.fromEntries(AUTO_STEPS.map((step) => [step.id, { state: "pending" }]));
    setAuto({ steps, progress: null, log: [], running: true });
    try {
      const made = await runAutoMake(api, { file, title: title.trim(), artist, album, lyrics, style, parentDir, useLrclib: lrclibAllowed && autoOptions.useLrclib, useEngine: engineOn, model, language: autoOptions.language, separate: autoOptions.separate, verifySynced, toolsAvailable: toolsOn }, {
        signal: controller.signal,
        onStep: (id, state, detail) => setAuto((current) => ({ ...current, steps: { ...current.steps, [id]: { state, detail } }, progress: state === "running" ? null : current.progress })),
        onProgress: (id, value) => setAuto((current) => ({ ...current, progress: { id, ...value } })),
        onLog: (message) => setAuto((current) => ({ ...current, log: [...current.log, message].slice(-20) }))
      });
      setAuto((current) => ({ ...current, running: false, result: made }));
      setResult({ ...made.made, auto: made });
      setPrompt(made.prompt);
      try {
        const loaded = await loadPackFromHost(api, made.made.created.manifestPath);
        onRecent(rememberPack(loaded));
        onLoaded(loaded);
      } catch {
      }
    } catch (failure) {
      setAuto((current) => ({ ...current, running: false }));
      if (!(failure instanceof AutoStopped)) setError(errorText(failure, "\u81EA\u52A8\u5236\u4F5C\u5931\u8D25\u3002"));
    } finally {
      stopRef.current = null;
    }
  };
  const send = async () => {
    setSending(true);
    setError("");
    try {
      setSession(await startAgentSession(harness, { packDir: result.created.packDir, title: title.trim(), prompt }));
    } catch (failure) {
      setError(errorText(failure, "\u65E0\u6CD5\u542F\u52A8\u4F1A\u8BDD\u3002"));
    } finally {
      setSending(false);
    }
  };
  const copy2 = async () => {
    try {
      await globalThis.navigator?.clipboard?.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch {
      setError("\u65E0\u6CD5\u5199\u5165\u526A\u8D34\u677F\uFF0C\u8BF7\u624B\u52A8\u9009\u4E2D\u4E0A\u9762\u7684\u6587\u5B57\u590D\u5236\u3002");
    }
  };
  const openNew = async () => {
    try {
      if (!await openBlankSession(harness, result.created.packDir)) setError("\u5F53\u524D Harness \u65E0\u6CD5\u4ECE\u63D2\u4EF6\u6253\u5F00\u65B0\u4F1A\u8BDD\uFF1A\u8BF7\u5728\u4FA7\u8FB9\u680F\u624B\u52A8\u65B0\u5EFA\u4E00\u4E2A\u4F1A\u8BDD\uFF0C\u518D\u7C98\u8D34\u63D0\u793A\u8BCD\u3002");
    } catch (failure) {
      setError(errorText(failure, "\u65E0\u6CD5\u6253\u5F00\u65B0\u4F1A\u8BDD\u3002"));
    }
  };
  const busy = Boolean(progress) || Boolean(auto?.running);
  const timed = looksTimed(lyrics);
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "mv-dialog mv-ai", role: "dialog", "aria-label": "\u7528 AI \u5236\u4F5C\u65B0 MV" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "mv-row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ import_react5.default.createElement("h2", null, "\u7528 AI \u5236\u4F5C\u65B0 MV"), /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "mv-icon-button", "aria-label": "\u5173\u95ED", onClick: onClose }, /* @__PURE__ */ import_react5.default.createElement(Icon.close, null))), !result && /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("p", { className: "mv-caption" }, "\u9009\u4E00\u9996\u4F60\u81EA\u5DF1\u7684\u6B4C\uFF0C\u63D2\u4EF6\u5728\u672C\u673A\u5EFA\u597D MV \u5305\u6587\u4EF6\u5939\uFF08\u590D\u5236\u97F3\u9891\u3001\u7B97\u597D\u9891\u8C31\uFF09\uFF0C\u518D\u8BA9 Harness \u7684 Agent \u5199\u6B4C\u8BCD\u65F6\u95F4\u8F74\u3001mv.json \u548C ASCII \u573A\u666F\u811A\u672C\u3002\u97F3\u9891\u4E0D\u4F1A\u4E0A\u4F20\uFF0C\u539F\u6587\u4EF6\u4E0D\u4F1A\u88AB\u4FEE\u6539\u3002"), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mv-form" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "mv-field mv-wide" }, /* @__PURE__ */ import_react5.default.createElement("span", null, "\u97F3\u9891\u6216\u89C6\u9891\u6587\u4EF6\uFF08\u5FC5\u9009\uFF1BMP3\u3001M4A/AAC\u3001MP4/MOV/WebM/MKV\u3001Opus/Ogg\u3001FLAC\u3001WAV\u2026\uFF09"), /* @__PURE__ */ import_react5.default.createElement("span", { className: "mv-field-row" }, /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", disabled: busy, onClick: chooseAudio }, file ? "\u66F4\u6362\u2026" : "\u9009\u62E9\u97F3\u9891\u2026"), /* @__PURE__ */ import_react5.default.createElement("span", { className: "mv-caption", style: { alignSelf: "center" } }, file ? `${file.name} \xB7 ${audioLabel} \xB7 ${(file.size / 1048576).toFixed(1)} MB` : audioLabel ? `\u4E0D\u652F\u6301\uFF1A${audioLabel}` : "\u672A\u9009\u62E9"))), /* @__PURE__ */ import_react5.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react5.default.createElement("span", null, "\u6B4C\u540D\uFF08\u5FC5\u586B\uFF09"), /* @__PURE__ */ import_react5.default.createElement("input", { value: title, disabled: busy, onChange: (event) => setTitle(event.target.value), placeholder: "\u6B4C\u540D" })), /* @__PURE__ */ import_react5.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react5.default.createElement("span", null, "\u6B4C\u624B"), /* @__PURE__ */ import_react5.default.createElement("input", { value: artist, disabled: busy, onChange: (event) => setArtist(event.target.value), placeholder: "\u53EF\u9009\uFF08\u81EA\u52A8\u4ECE\u6807\u7B7E\u8BFB\u53D6\uFF09" })), /* @__PURE__ */ import_react5.default.createElement("label", { className: "mv-field mv-wide" }, /* @__PURE__ */ import_react5.default.createElement("span", null, "\u6B4C\u8BCD\uFF08\u53EF\u9009\uFF1BLRC \u5E26\u65F6\u95F4\u8F74\u6700\u597D\uFF0C\u7EAF\u6587\u672C\u4E5F\u884C\uFF0CAI \u4F1A\u4F30\u8BA1\u65F6\u95F4\uFF09", lyrics.trim() ? ` \xB7 ${timed ? "\u5DF2\u8BC6\u522B\u4E3A LRC" : "\u7EAF\u6587\u672C"}` : ""), /* @__PURE__ */ import_react5.default.createElement("textarea", { style: AREA, value: lyrics, disabled: busy, spellCheck: false, onChange: (event) => setLyrics(event.target.value), placeholder: "[00:12.30]\u7B2C\u4E00\u53E5\n[00:17.80]\u7B2C\u4E8C\u53E5\n\u2026\u6216\u76F4\u63A5\u7C98\u8D34\u6B4C\u8BCD\u6587\u672C" }), /* @__PURE__ */ import_react5.default.createElement("span", null, /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "mv-link", disabled: busy, onClick: chooseLyrics }, "\u4ECE\u6587\u4EF6\u8BFB\u53D6\u2026"))), /* @__PURE__ */ import_react5.default.createElement("label", { className: "mv-field mv-wide" }, /* @__PURE__ */ import_react5.default.createElement("span", null, "\u98CE\u683C\u8BF4\u660E\uFF08\u53EF\u9009\uFF0C\u544A\u8BC9 AI \u4F60\u60F3\u8981\u7684\u753B\u9762\uFF09"), /* @__PURE__ */ import_react5.default.createElement("textarea", { style: { ...AREA, minHeight: 52 }, value: style, disabled: busy, onChange: (event) => setStyle(event.target.value), placeholder: "\u4F8B\u5982\uFF1A\u8D5B\u535A\u670B\u514B\u96E8\u591C\u3001\u526F\u6B4C\u65F6\u6EE1\u5C4F\u4EE3\u7801\u96E8\u3001\u7ED3\u5C3E\u6162\u6162\u7184\u706D" })), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mv-field mv-wide" }, /* @__PURE__ */ import_react5.default.createElement("span", null, "\u4FDD\u5B58\u4F4D\u7F6E"), /* @__PURE__ */ import_react5.default.createElement("span", { className: "mv-field-row" }, /* @__PURE__ */ import_react5.default.createElement("input", { value: parentDir, disabled: busy, spellCheck: false, onChange: (event) => setParentDir(event.target.value), placeholder: info?.aiPacksDir ? `\u9ED8\u8BA4\uFF1A${info.aiPacksDir}` : "\u9ED8\u8BA4\uFF1A%LOCALAPPDATA%\\dsh-mv\\packs" }), pick && /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", disabled: busy, onClick: () => void chooseDir() }, "\u6D4F\u89C8\u2026")), /* @__PURE__ */ import_react5.default.createElement("span", { className: "mv-field-help" }, "\u4F1A\u5728\u8FD9\u91CC\u65B0\u5EFA\u4E00\u4E2A\u4EE5\u6B4C\u540D\u547D\u540D\u7684\u5B50\u6587\u4EF6\u5939\uFF0C\u4E0D\u4F1A\u8986\u76D6\u5DF2\u6709\u6587\u4EF6\u3002"))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mv-auto", "aria-label": "\u81EA\u52A8\u5236\u4F5C" }, /* @__PURE__ */ import_react5.default.createElement("strong", null, "\u81EA\u52A8\u5236\u4F5C\uFF08\u63A8\u8350\uFF09"), /* @__PURE__ */ import_react5.default.createElement("p", { className: "mv-caption" }, "\u53EA\u8981\u9009\u597D\u97F3\u9891\uFF1A\u81EA\u52A8\u67E5\u6B4C\u8BCD\u65F6\u95F4\u8F74 \u2192 \u6CA1\u6709\u5C31\u7528\u672C\u673A\u6B4C\u8BCD\u5F15\u64CE\u8BC6\u522B \u2192 \u5BF9\u9F50\u3001\u7B97\u7F6E\u4FE1\u5EA6 \u2192 \u8BC6\u522B\u4E3B\u6B4C / \u526F\u6B4C / \u95F4\u594F \u2192 \u4FDD\u5B58\u3002\u4E4B\u540E\u5728\u64AD\u653E\u5668\u4E0B\u9762\u7684\u300C\u6B4C\u8BCD\u6821\u51C6\u300D\u91CC\u4FEE\u6B63\u6807\u9EC4\u7684\u53E5\u5B50\u3002"), /* @__PURE__ */ import_react5.default.createElement("label", { className: "mv-check" }, /* @__PURE__ */ import_react5.default.createElement("input", { type: "checkbox", checked: lrclibAllowed && autoOptions.useLrclib, disabled: busy || !lrclibAllowed, onChange: (event) => setAutoOptions((o) => ({ ...o, useLrclib: event.target.checked })) }), /* @__PURE__ */ import_react5.default.createElement("span", null, "\u5230 LRCLIB\uFF08lrclib.net\uFF09\u67E5\u73B0\u6210\u7684\u65F6\u95F4\u8F74 ", /* @__PURE__ */ import_react5.default.createElement("span", { className: "mv-caption" }, "\u2014 \u8054\u7F51\uFF0C\u53EA\u53D1\u9001 ", LRCLIB_FIELDS.map((f) => ({ title: "\u6B4C\u540D", artist: "\u6B4C\u624B", album: "\u4E13\u8F91", duration: "\u65F6\u957F" })[f]).join("\u3001"), title.trim() ? `\uFF08\u300C${title.trim()}\u300D${artist.trim() ? ` / ${artist.trim()}` : ""}${album ? ` / ${album}` : ""}\uFF09` : "", "\uFF0C\u4E0D\u4E0A\u4F20\u97F3\u9891", lrclibAllowed ? "" : "\uFF1B\u5DF2\u5728\u63D2\u4EF6\u8BBE\u7F6E\u91CC\u5173\u95ED"))), /* @__PURE__ */ import_react5.default.createElement("label", { className: "mv-check" }, /* @__PURE__ */ import_react5.default.createElement("input", { type: "checkbox", checked: engineOn, disabled: busy || !engineReady(engineInfo), onChange: (event) => setAutoOptions((o) => ({ ...o, useEngine: event.target.checked })) }), /* @__PURE__ */ import_react5.default.createElement("span", null, "\u6CA1\u6709\u65F6\u95F4\u8F74\u65F6\u7528\u672C\u673A\u6B4C\u8BCD\u5F15\u64CE\u8BC6\u522B ", /* @__PURE__ */ import_react5.default.createElement("span", { className: "mv-caption" }, "\u2014 \u4E0D\u8054\u7F51", engineReady(engineInfo) ? engineInfo.cuda ? "\uFF0CGPU" : "\uFF0C\u53EA\u6709 CPU\uFF0C\u4F1A\u6162\u4E00\u4E9B" : "\uFF0C\u9700\u8981\u5148\u5B89\u88C5\uFF08\u89C1\u4E0B\u65B9\uFF09"))), engineReady(engineInfo) && /* @__PURE__ */ import_react5.default.createElement("div", { className: "mv-row", style: { flexWrap: "wrap", gap: 8 } }, /* @__PURE__ */ import_react5.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react5.default.createElement("span", null, "\u6A21\u578B"), /* @__PURE__ */ import_react5.default.createElement("select", { value: model, disabled: busy, onChange: (event) => setAutoOptions((o) => ({ ...o, model: event.target.value })) }, models.map((m) => /* @__PURE__ */ import_react5.default.createElement("option", { key: m, value: m }, MODEL_LABELS[m] ?? m)))), /* @__PURE__ */ import_react5.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react5.default.createElement("span", null, "\u8BED\u8A00"), /* @__PURE__ */ import_react5.default.createElement("select", { value: autoOptions.language, disabled: busy, onChange: (event) => setAutoOptions((o) => ({ ...o, language: event.target.value })) }, Object.entries(LANGS).map(([k, v]) => /* @__PURE__ */ import_react5.default.createElement("option", { key: k, value: k }, v)))), /* @__PURE__ */ import_react5.default.createElement("label", { className: "mv-check" }, /* @__PURE__ */ import_react5.default.createElement("input", { type: "checkbox", checked: autoOptions.separate, disabled: busy, onChange: (event) => setAutoOptions((o) => ({ ...o, separate: event.target.checked })) }), /* @__PURE__ */ import_react5.default.createElement("span", null, "\u5148\u5206\u79BB\u4EBA\u58F0\uFF08Demucs\uFF0C\u66F4\u51C6\uFF09")), /* @__PURE__ */ import_react5.default.createElement("label", { className: "mv-check" }, /* @__PURE__ */ import_react5.default.createElement("input", { type: "checkbox", checked: verifySynced, disabled: busy, onChange: (event) => setAutoOptions((o) => ({ ...o, verifySynced: event.target.checked })) }), /* @__PURE__ */ import_react5.default.createElement("span", null, "LRCLIB \u6709\u65F6\u95F4\u8F74\u65F6\u4E5F\u7528\u5F15\u64CE\u6838\u5BF9"))), !engineReady(engineInfo) && /* @__PURE__ */ import_react5.default.createElement(EngineCard, { api, info: engineInfo, refresh: refreshEngine, compact: true }), auto && /* @__PURE__ */ import_react5.default.createElement("ol", { className: "mv-steps", "aria-live": "polite" }, AUTO_STEPS.map((step) => {
    const s = auto.steps[step.id] ?? { state: "pending" };
    const p = auto.progress?.id === step.id && s.state === "running" ? auto.progress : null;
    return /* @__PURE__ */ import_react5.default.createElement("li", { key: step.id, className: `mv-step-${s.state}` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "mv-step-dot", "aria-hidden": "true" }, STEP_DOT[s.state]), /* @__PURE__ */ import_react5.default.createElement("span", null, step.label, p ? ` \xB7 ${Math.round((p.ratio ?? 0) * 100)}%${p.stage ? ` ${STAGES[p.stage] ?? p.stage}` : ""}` : "", s.detail ? /* @__PURE__ */ import_react5.default.createElement("span", { className: "mv-caption" }, " \u2014 ", stepText(step.id, s.detail)) : null));
  })), auto?.log?.length > 0 && auto.running && /* @__PURE__ */ import_react5.default.createElement("pre", { className: "mv-log" }, auto.log.slice(-4).join("\n"))), progress && /* @__PURE__ */ import_react5.default.createElement(Alert, { kind: "info" }, /* @__PURE__ */ import_react5.default.createElement("p", null, STAGES[progress.stage] ?? progress.stage, "\u2026 ", Math.round((progress.ratio ?? 0) * 100), "%")), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mv-row" }, /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "mv-button", disabled: !file || !title.trim() || busy, onClick: () => void autoMake() }, auto?.running ? "\u6B63\u5728\u81EA\u52A8\u5236\u4F5C\u2026" : "\u81EA\u52A8\u5236\u4F5C"), auto?.running && /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", onClick: () => stopRef.current?.abort() }, "\u505C\u6B62"), /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", disabled: !file || !title.trim() || busy, onClick: () => void create() }, progress ? "\u6B63\u5728\u521B\u5EFA\u2026" : "\u53EA\u5EFA\u5305\uFF08AI \u4F30\u8BA1\u65F6\u95F4\uFF09"), /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", disabled: busy, onClick: onClose }, "\u53D6\u6D88"))), result && /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, result.auto && /* @__PURE__ */ import_react5.default.createElement(Alert, { kind: result.auto.steps.align?.low ? "warn" : "ok" }, /* @__PURE__ */ import_react5.default.createElement("p", { className: "mv-wrap" }, "\u6B4C\u8BCD\u65F6\u95F4\u8F74\u5DF2\u81EA\u52A8\u5B8C\u6210\uFF1A", result.auto.lines.length, " \u53E5\uFF08\u6765\u6E90 ", result.auto.source, "\uFF09", result.auto.steps.align?.low ? `\uFF0C${result.auto.steps.align.low} \u53E5\u7F6E\u4FE1\u5EA6\u4F4E\uFF0C\u5DF2\u5728\u64AD\u653E\u5668\u4E0B\u65B9\u300C\u6B4C\u8BCD\u6821\u51C6\u300D\u91CC\u6807\u9EC4\uFF0C\u6309 N \u9010\u53E5\u68C0\u67E5` : "", "\uFF1B\u6BB5\u843D ", result.auto.sections.length, " \u4E2A\u5DF2\u5199\u5165 sections.json\u3002")), /* @__PURE__ */ import_react5.default.createElement(Alert, { kind: "ok" }, /* @__PURE__ */ import_react5.default.createElement("p", { className: "mv-wrap" }, "\u5DF2\u521B\u5EFA MV \u5305\uFF1A", /* @__PURE__ */ import_react5.default.createElement("code", null, result.created.packDir), "\uFF08", Math.round(result.duration), " \u79D2\uFF0C\u9891\u8C31\u5DF2\u7B97\u597D\uFF09\u3002\u5B83\u5DF2\u51FA\u73B0\u5728\u66F2\u5E93\u91CC\uFF0C\u73B0\u5728\u5C31\u80FD\u7528\u901A\u7528\u753B\u9762\u64AD\u653E\uFF1BAI \u5199\u597D\u573A\u666F\u811A\u672C\u540E\uFF0C\u5728\u66F2\u5E93\u91CC\u518D\u70B9\u4E00\u6B21\u8FD9\u5F20\u5361\u7247\u5373\u53EF\u91CD\u65B0\u8F7D\u5165\u3002")), !session && /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("p", { className: "mv-caption" }, support.available ? "\u4E0B\u9762\u7684\u4EFB\u52A1\u4F1A\u53D1\u9001\u5230\u4E00\u4E2A\u65B0\u7684 Agent \u4F1A\u8BDD\uFF08\u5DE5\u4F5C\u533A\u5C31\u662F\u8FD9\u4E2A\u6587\u4EF6\u5939\uFF09\u3002\u53D1\u9001\u524D\u53EF\u4EE5\u4FEE\u6539\uFF1A" : "\u5F53\u524D Harness \u6CA1\u6709\u7ED9\u63D2\u4EF6\u5F00\u653E\u4F1A\u8BDD\u63A5\u53E3\uFF1A\u8BF7\u590D\u5236\u4E0B\u9762\u7684\u63D0\u793A\u8BCD\uFF0C\u5728\u65B0\u4F1A\u8BDD\u91CC\u7C98\u8D34\u53D1\u9001\u3002"), /* @__PURE__ */ import_react5.default.createElement("textarea", { style: { ...AREA, minHeight: 150, fontFamily: '"Cascadia Mono", Consolas, monospace', fontSize: 12 }, value: prompt, spellCheck: false, onChange: (event) => setPrompt(event.target.value), "aria-label": "\u53D1\u7ED9 Agent \u7684\u63D0\u793A\u8BCD" }), /* @__PURE__ */ import_react5.default.createElement("ul", { className: "mv-caption", style: { margin: "6px 0", paddingLeft: 18 } }, /* @__PURE__ */ import_react5.default.createElement("li", null, "Agent \u53EA\u4F1A\u88AB\u8981\u6C42\u4FEE\u6539\u8FD9\u4E2A\u6587\u4EF6\u5939\u91CC\u7684\u6587\u4EF6\uFF1B\u5B83\u5199\u6587\u4EF6\u65F6 Harness \u53EF\u80FD\u4F1A\u8BF7\u4F60\u6279\u51C6\u6743\u9650\u3002\u4F1A\u8BDD\u4F1A\u6D88\u8017\u4F60\u7684\u6A21\u578B\u989D\u5EA6\u3002"), /* @__PURE__ */ import_react5.default.createElement("li", null, toolsOn ? "Agent \u53EF\u4EE5\u7528 mv_pack_validate / mv_pack_preview_frame \u68C0\u67E5\u548C\u9884\u89C8\uFF08\u53EA\u8BFB\uFF0C\u5728\u6C99\u7BB1\u91CC\u8FD0\u884C\u573A\u666F\u811A\u672C\uFF09\u3002" : "Agent \u5DE5\u5177\u672A\u6CE8\u518C\uFF08Host \u6CA1\u6709 tools \u670D\u52A1\u6216\u5DF2\u5728\u8BBE\u7F6E\u91CC\u5173\u95ED\uFF09\uFF0CAgent \u4F1A\u6309 AGENT.md \u81EA\u67E5\u3002"), /* @__PURE__ */ import_react5.default.createElement("li", null, "\u573A\u666F\u811A\u672C\u5728\u9762\u677F\u91CC\u8FD0\u884C\u4E8E\u6CA1\u6709\u7F51\u7EDC\u548C DOM \u7684 Web Worker \u4E2D\uFF0C\u8D85\u65F6\u6216\u51FA\u9519\u4F1A\u81EA\u52A8\u6362\u56DE\u901A\u7528\u753B\u9762\uFF1B\u63D2\u4EF6\u4E0D\u4F1A\u8FD0\u884C\u4EFB\u4F55\u5916\u90E8\u7A0B\u5E8F\u3002")), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mv-row" }, support.available && /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "mv-button", disabled: sending || !prompt.trim(), onClick: () => void send() }, sending ? "\u6B63\u5728\u542F\u52A8\u4F1A\u8BDD\u2026" : "\u5728\u65B0\u4F1A\u8BDD\u4E2D\u4EA4\u7ED9 AI"), /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: support.available ? "mv-button mv-button-secondary" : "mv-button", onClick: () => void copy2() }, copied ? "\u5DF2\u590D\u5236" : "\u590D\u5236\u63D0\u793A\u8BCD"), !support.available && support.canCreate && /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", onClick: () => void openNew() }, "\u6253\u5F00\u65B0\u4F1A\u8BDD"), /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", onClick: onClose }, "\u5B8C\u6210"))), session && /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement(Alert, { kind: "ok" }, /* @__PURE__ */ import_react5.default.createElement("p", { className: "mv-wrap" }, "\u5DF2\u5728\u65B0\u4F1A\u8BDD\u4E2D\u5F00\u59CB\u5236\u4F5C", session.opened ? "\uFF08\u5DF2\u5207\u6362\u5230\u8BE5\u4F1A\u8BDD\uFF09" : "", "\u3002\u4F1A\u8BDD ID ", /* @__PURE__ */ import_react5.default.createElement("code", null, session.sessionId), "\u3002AI \u5B8C\u6210\u540E\u56DE\u5230\u8FD9\u91CC\uFF0C\u5728\u66F2\u5E93\u91CC\u70B9\u300C", title.trim(), "\u300D\u91CD\u65B0\u8F7D\u5165\u5E76\u64AD\u653E\u3002")), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mv-row" }, /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", onClick: onClose }, "\u5B8C\u6210")))), error && /* @__PURE__ */ import_react5.default.createElement(Alert, { kind: "error" }, /* @__PURE__ */ import_react5.default.createElement("p", { className: "mv-wrap", style: { whiteSpace: "pre-wrap" } }, error)));
}

// .dsh-plugin/client/mv-workshop.jsx
var import_react6 = __toESM(require("react"), 1);
var REPO_URL = `https://github.com/${WORKSHOP_REPO}`;
var LICENSES = ["CC-BY-NC-SA-4.0", "CC-BY-NC-4.0", "CC-BY-SA-4.0", "CC-BY-4.0", "CC0-1.0", "MIT"];
var RENDERERS = { webgl: "3D WebGL", script: "\u573A\u666F\u811A\u672C", generic: "\u901A\u7528\u753B\u9762", "dsh-pv": "dsh-pv", "world-execute-me": "world.execute(me)" };
function TrustNote() {
  return /* @__PURE__ */ import_react6.default.createElement(Alert, { kind: "info" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-wrap" }, /* @__PURE__ */ import_react6.default.createElement("b", null, "\u5173\u4E8E\u4FE1\u4EFB\uFF1A"), "\u5DE5\u574A\u91CC\u7684\u5305\u7531\u793E\u533A\u6295\u7A3F\uFF0C\u7ECF\u7EF4\u62A4\u8005\u5728 GitHub \u4E0A\u5BA1\u6838\u540E\u5408\u5E76\uFF1B\u63D2\u4EF6\u5B89\u88C5\u65F6\u6309\u7D22\u5F15\u6821\u9A8C\u6BCF\u4E2A\u6587\u4EF6\u7684 sha256\uFF0C\u5E76\u91CD\u65B0\u505A\u4E00\u904D\u68C0\u67E5\u3002 \u573A\u666F\u811A\u672C", /* @__PURE__ */ import_react6.default.createElement("b", null, "\u59CB\u7EC8\u5728\u6C99\u7BB1\u91CC\u8FD0\u884C"), "\uFF08\u72EC\u7ACB Web Worker\uFF0C\u6CA1\u6709\u7F51\u7EDC\u3001\u5B58\u50A8\u3001DOM \u548C\u6587\u4EF6\u8BBF\u95EE\uFF0C\u6BCF\u5E27\u9650\u65F6\uFF0C\u51FA\u9519\u81EA\u52A8\u6362\u56DE\u901A\u7528\u753B\u9762\uFF09\uFF0C\u4F46\u4ECD\u8BF7\u53EA\u5B89\u88C5\u4F60\u4FE1\u4EFB\u7684\u4F5C\u8005\u7684\u5305\u3002 \u5305\u91CC", /* @__PURE__ */ import_react6.default.createElement("b", null, "\u6CA1\u6709\u6B4C\u66F2\u97F3\u9891"), "\uFF1A\u8BF7\u4F7F\u7528\u4F60\u81EA\u5DF1\u7684\u97F3\u4E50\u3002\u5DF2\u6388\u6743\u6B4C\u8BCD\u3001\u8BD1\u6587\u548C\u753B\u9762\u8D44\u6E90\u53EF\u968F\u5305\u5B89\u88C5\u5E76\u81EA\u52A8\u52A0\u8F7D\u3002"));
}
function Cover({ api, pack, large = false, cache }) {
  const [src, setSrc] = import_react6.default.useState(() => cache.current.get(pack.id) ?? "");
  import_react6.default.useEffect(() => {
    if (!pack.cover || cache.current.has(pack.id) || !api?.workshopCover) return;
    let alive = true;
    workshopCover(api, pack.id).then((value) => {
      if (!value?.found) return;
      const url = `data:${value.mime};base64,${value.base64}`;
      cache.current.set(pack.id, url);
      if (alive) setSrc(url);
    }).catch(() => {
    });
    return () => {
      alive = false;
    };
  }, [pack.id]);
  const style = large ? { width: "100%", aspectRatio: "16 / 10" } : void 0;
  return src ? /* @__PURE__ */ import_react6.default.createElement("img", { className: "mv-ws-cover", src, alt: `${pack.title} \u5C01\u9762`, style }) : /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-ws-cover mv-ws-cover-empty", style, "aria-hidden": "true" }, ">_");
}
var sourceLabel = (url) => String(url ?? "").replace(/^https:\/\/(www\.)?(github\.com\/)?/, "").replace(/\/$/, "");
function SourceLink({ url, compact = false }) {
  if (!url) return null;
  return /* @__PURE__ */ import_react6.default.createElement("span", { className: `mv-ws-source${compact ? " mv-ws-source-compact" : ""}` }, "\u539F\u4F5C ", /* @__PURE__ */ import_react6.default.createElement("a", { href: url, target: "_blank", rel: "noreferrer", title: url, onClick: (event) => event.stopPropagation() }, sourceLabel(url)));
}
var copy = async (text4) => {
  try {
    await globalThis.navigator?.clipboard?.writeText(text4);
    return true;
  } catch {
    return false;
  }
};
function WorkshopDialog({ api, onClose, onLoaded, onRecent, active = null, canvas = () => null, initialIndex = null }) {
  const [index, setIndex] = import_react6.default.useState(initialIndex);
  const [loading, setLoading] = import_react6.default.useState(!initialIndex);
  const [error, setError] = import_react6.default.useState("");
  const [note, setNote] = import_react6.default.useState("");
  const [query, setQuery] = import_react6.default.useState("");
  const [license, setLicense] = import_react6.default.useState("");
  const [renderer, setRenderer] = import_react6.default.useState("");
  const [onlyInstalled, setOnlyInstalled] = import_react6.default.useState(false);
  const [selected, setSelected] = import_react6.default.useState(null);
  const [busy, setBusy] = import_react6.default.useState("");
  const [confirmUninstall, setConfirmUninstall] = import_react6.default.useState("");
  const [publishing, setPublishing] = import_react6.default.useState(false);
  const covers = import_react6.default.useRef(/* @__PURE__ */ new Map());
  const refresh = import_react6.default.useCallback(async (force = false) => {
    setLoading(true);
    setError("");
    try {
      setIndex(await loadWorkshop(api, force));
    } catch (failure) {
      setError(errorText(failure, "\u65E0\u6CD5\u8BFB\u53D6\u521B\u610F\u5DE5\u574A\u3002"));
    } finally {
      setLoading(false);
    }
  }, [api]);
  import_react6.default.useEffect(() => {
    if (!initialIndex) void refresh(false);
  }, [refresh]);
  const { map: installed, updates } = installedState(index);
  const packs = index?.packs ?? [];
  const shown = filterWorkshop(packs, { query, license, renderer, installed, onlyInstalled });
  const current = selected ? packs.find((p) => p.id === selected) : null;
  const open = async (manifestPath) => {
    const loaded = await loadPackFromHost(api, manifestPath);
    onRecent(rememberPack(loaded));
    onLoaded(loaded);
    return loaded;
  };
  const install = async (pack) => {
    setBusy(`install:${pack.id}`);
    setError("");
    setNote("");
    try {
      const done = await installWorkshopPack(api, pack.id);
      await open(done.manifestPath);
      await refresh(false);
      setNote(`\u5DF2${installed[pack.id] ? "\u66F4\u65B0" : "\u5B89\u88C5"}\u300C${pack.title}\u300Dv${done.version}\uFF08${done.files} \u4E2A\u6587\u4EF6\uFF0Csha256 \u5168\u90E8\u6821\u9A8C\u901A\u8FC7\uFF09\uFF0C\u5DF2\u52A0\u5165\u66F2\u5E93\u5E76\u6253\u5F00\u3002\u9009\u62E9\u4F60\u81EA\u5DF1\u7684\u6B4C\u66F2\u6587\u4EF6\u5373\u53EF\u64AD\u653E\u3002`);
    } catch (failure) {
      setError(errorText(failure, "\u5B89\u88C5\u5931\u8D25\u3002"));
    } finally {
      setBusy("");
    }
  };
  const uninstall = async (pack) => {
    setBusy(`uninstall:${pack.id}`);
    setError("");
    setNote("");
    setConfirmUninstall("");
    try {
      await uninstallWorkshopPack(api, pack.id);
      await refresh(false);
      setNote(`\u5DF2\u5378\u8F7D\u300C${pack.title}\u300D\uFF08\u5220\u9664\u4E86\u63D2\u4EF6\u5DE5\u574A\u6587\u4EF6\u5939\u91CC\u7684\u8FD9\u4E2A\u5305\uFF1B\u4F60\u81EA\u5DF1\u7684\u97F3\u9891\u548C\u6B4C\u8BCD\u6587\u4EF6\u4E0D\u53D7\u5F71\u54CD\uFF09\u3002`);
    } catch (failure) {
      setError(errorText(failure, "\u5378\u8F7D\u5931\u8D25\u3002"));
    } finally {
      setBusy("");
    }
  };
  const canPublish = active && !active.empty && active.manifestPath;
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-dialog mv-ws", role: "dialog", "aria-label": "\u521B\u610F\u5DE5\u574A" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ import_react6.default.createElement("h2", { style: { margin: 0 } }, "\u521B\u610F\u5DE5\u574A ", /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-caption" }, "\u793E\u533A MV \u5305 \xB7 ", /* @__PURE__ */ import_react6.default.createElement("a", { href: REPO_URL, target: "_blank", rel: "noreferrer" }, WORKSHOP_REPO))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-row" }, /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", disabled: loading, onClick: () => void refresh(true) }, loading ? "\u8BFB\u53D6\u4E2D\u2026" : "\u5237\u65B0"), /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button mv-button-small", disabled: !canPublish, title: canPublish ? `\u628A\u5F53\u524D\u7684 MV \u5305\u300C${active.pack.title}\u300D\u53D1\u5E03\u5230\u5DE5\u574A` : "\u5148\u5728\u66F2\u5E93\u91CC\u6253\u5F00\u4F60\u81EA\u5DF1\u7684 MV \u5305", onClick: () => setPublishing((value) => !value) }, "\u53D1\u5E03\u5230\u5DE5\u574A\u2026"), /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-icon-button", "aria-label": "\u5173\u95ED\u521B\u610F\u5DE5\u574A", onClick: onClose }, /* @__PURE__ */ import_react6.default.createElement(Icon.close, null)))), /* @__PURE__ */ import_react6.default.createElement(TrustNote, null), publishing && canPublish && /* @__PURE__ */ import_react6.default.createElement(PublishDialog, { api, pack: active, canvas, onClose: () => setPublishing(false) }), /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-row mv-ws-filters" }, /* @__PURE__ */ import_react6.default.createElement("input", { className: "mv-ws-search", value: query, placeholder: "\u641C\u7D22\u6B4C\u540D\u3001\u6B4C\u624B\u3001\u4F5C\u8005\u3001\u6807\u7B7E", "aria-label": "\u641C\u7D22\u5DE5\u574A", onChange: (event) => setQuery(event.target.value) }), /* @__PURE__ */ import_react6.default.createElement("select", { value: license, "aria-label": "\u6309\u8BB8\u53EF\u8BC1\u7B5B\u9009", onChange: (event) => setLicense(event.target.value) }, /* @__PURE__ */ import_react6.default.createElement("option", { value: "" }, "\u5168\u90E8\u8BB8\u53EF\u8BC1"), LICENSES.map((l) => /* @__PURE__ */ import_react6.default.createElement("option", { key: l, value: l }, l))), /* @__PURE__ */ import_react6.default.createElement("select", { value: renderer, "aria-label": "\u6309\u6E32\u67D3\u65B9\u5F0F\u7B5B\u9009", onChange: (event) => setRenderer(event.target.value) }, /* @__PURE__ */ import_react6.default.createElement("option", { value: "" }, "\u5168\u90E8\u7C7B\u578B"), Object.entries(RENDERERS).map(([k, v]) => /* @__PURE__ */ import_react6.default.createElement("option", { key: k, value: k }, v))), /* @__PURE__ */ import_react6.default.createElement("label", { className: "mv-check", style: { height: "auto" } }, /* @__PURE__ */ import_react6.default.createElement("input", { type: "checkbox", checked: onlyInstalled, onChange: (event) => setOnlyInstalled(event.target.checked) }), /* @__PURE__ */ import_react6.default.createElement("span", null, "\u53EA\u770B\u5DF2\u5B89\u88C5")), /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-caption" }, index ? `${shown.length} / ${packs.length} \u4E2A\u5305${updates.size ? ` \xB7 ${updates.size} \u4E2A\u6709\u66F4\u65B0` : ""}` : "")), error && /* @__PURE__ */ import_react6.default.createElement(Alert, { kind: "error" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-wrap", style: { whiteSpace: "pre-wrap" } }, error, /404/.test(error) ? "\n\u5DE5\u574A\u4ED3\u5E93\u53EF\u80FD\u8FD8\u6CA1\u6709\u53D1\u5E03\u5185\u5BB9\uFF08index.json \u4E0D\u5B58\u5728\uFF09\u3002" : /超时|ENOTFOUND|ECONN/.test(error) ? "\n\u8FDE\u4E0D\u4E0A raw.githubusercontent.com\uFF1A\u68C0\u67E5\u7F51\u7EDC\uFF0C\u6216\u5728\u7CFB\u7EDF\u73AF\u5883\u53D8\u91CF\u91CC\u8BBE\u7F6E HTTPS_PROXY\u3002" : "")), note && /* @__PURE__ */ import_react6.default.createElement(Alert, { kind: "ok", actions: /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-link", onClick: () => setNote("") }, "\u77E5\u9053\u4E86") }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-wrap" }, note)), current ? /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-ws-detail" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-ws-detail-art" }, /* @__PURE__ */ import_react6.default.createElement(Cover, { api, pack: current, large: true, cache: covers })), /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-ws-detail-body" }, /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-link", onClick: () => setSelected(null) }, "\u2190 \u8FD4\u56DE\u5217\u8868"), /* @__PURE__ */ import_react6.default.createElement("h3", { style: { margin: "6px 0 2px" } }, current.title), /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-caption", style: { marginTop: 0 } }, current.artist || "\u672A\u77E5\u827A\u672F\u5BB6", " \xB7 \u4F5C\u8005 ", current.author || "\u2014", " \xB7 v", current.version), /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-wrap" }, current.description || "\uFF08\u6CA1\u6709\u7B80\u4ECB\uFF09"), current.source && /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-wrap" }, /* @__PURE__ */ import_react6.default.createElement(SourceLink, { url: current.source })), /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-row" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-chip" }, "\u8BB8\u53EF ", current.license), /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-chip" }, "\u65F6\u957F ", durationText(current.duration)), /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-chip" }, RENDERERS[current.renderer] ?? current.renderer), current.requires && /* @__PURE__ */ import_react6.default.createElement("span", { className: `mv-chip${tooOld(current) ? " mv-chip-warn" : ""}`, title: "\u80FD\u64AD\u653E\u8FD9\u4E2A\u5305\u7684\u6700\u4F4E\u63D2\u4EF6\u7248\u672C" }, "\u9700\u8981\u63D2\u4EF6 v", current.requires, "+"), current.sections > 0 && /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-chip" }, current.sections, " \u4E2A\u6BB5\u843D"), /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-chip", title: current.lyrics ? "\u6B4C\u8BCD\u548C\u8BD1\u6587\u968F\u5305\u4E0B\u8F7D\uFF0C\u6253\u5F00\u65F6\u81EA\u52A8\u52A0\u8F7D" : "\u65E7\u5305\u53EF\u53EA\u6709\u65F6\u95F4\u8F74\uFF0C\u6309\u54C8\u5E0C\u5339\u914D\u4F60\u81EA\u5DF1\u7684\u6B4C\u8BCD\u6587\u4EF6" }, current.lyrics ? "\u542B\u6B4C\u8BCD\u4E0E\u8BD1\u6587" : current.timing ? "\u4EC5\u6B4C\u8BCD\u65F6\u95F4\u8F74" : "\u65E0\u6B4C\u8BCD\u8F68"), /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-chip", title: "\u7528\u6765\u68C0\u67E5\u4F60\u7684\u97F3\u9891\u662F\u5426\u662F\u540C\u4E00\u4E2A\u7248\u672C" }, current.fingerprint ? "\u5E26\u97F3\u9891\u6307\u7EB9" : "\u4EC5\u6309\u65F6\u957F\u5339\u914D"), current.tags.map((t) => /* @__PURE__ */ import_react6.default.createElement("span", { key: t, className: "mv-chip" }, "#", t))), /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-caption" }, current.files.length, " \u4E2A\u6587\u4EF6 \xB7 ", sizeText(current.size), current.updated ? ` \xB7 \u66F4\u65B0\u4E8E ${current.updated.slice(0, 10)}` : "", current.homepage ? /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, " \xB7 ", /* @__PURE__ */ import_react6.default.createElement("a", { href: current.homepage, target: "_blank", rel: "noreferrer" }, "\u4E3B\u9875")) : null, " \xB7 ", /* @__PURE__ */ import_react6.default.createElement("a", { href: `${REPO_URL}/tree/${index?.commit ?? "main"}/packs/${current.id}`, target: "_blank", rel: "noreferrer" }, "\u5728 GitHub \u4E0A\u67E5\u770B\u6E90\u7801")), /* @__PURE__ */ import_react6.default.createElement("ul", { className: "mv-caption mv-ws-files" }, current.files.map((f) => /* @__PURE__ */ import_react6.default.createElement("li", { key: f.path }, /* @__PURE__ */ import_react6.default.createElement("code", { title: f.path }, f.path), /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-ws-size" }, sizeText(f.size)), /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-faint mv-ws-sha", title: `sha256 ${f.sha256}` }, "sha256 ", f.sha256.slice(0, 12), "\u2026")))), tooOld(current) && /* @__PURE__ */ import_react6.default.createElement(Alert, { kind: "warn" }, "\u8FD9\u4E2A\u5305\u9700\u8981 dsh-mv-cli v", current.requires, " \u6216\u66F4\u65B0\uFF08\u5F53\u524D v", CLIENT_VERSION, "\uFF09\u3002\u8BF7\u5148\u5728 DSH \u91CC\u66F4\u65B0\u63D2\u4EF6\u518D\u5B89\u88C5\u3002"), /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-row" }, !installed[current.id] && /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button", disabled: Boolean(busy) || tooOld(current), onClick: () => void install(current) }, busy === `install:${current.id}` ? "\u6B63\u5728\u4E0B\u8F7D\u5E76\u6821\u9A8C\u2026" : "\u5B89\u88C5\u5230\u66F2\u5E93"), installed[current.id] && updates.has(current.id) && /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button", disabled: Boolean(busy) || tooOld(current), onClick: () => void install(current) }, busy === `install:${current.id}` ? "\u6B63\u5728\u66F4\u65B0\u2026" : `\u66F4\u65B0\u5230 v${current.version}\uFF08\u5DF2\u88C5 v${installed[current.id].version}\uFF09`), installed[current.id] && /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", disabled: Boolean(busy), onClick: () => void open(installed[current.id].manifestPath).then(() => setNote(`\u5DF2\u6253\u5F00\u300C${current.title}\u300D\u3002`)).catch((failure) => setError(errorText(failure, "\u65E0\u6CD5\u6253\u5F00\u3002"))) }, "\u6253\u5F00"), installed[current.id] && confirmUninstall !== current.id && /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button mv-button-danger", disabled: Boolean(busy), onClick: () => setConfirmUninstall(current.id) }, "\u5378\u8F7D"), confirmUninstall === current.id && /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-row" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-caption" }, "\u786E\u5B9A\u5378\u8F7D\uFF1F\u4F1A\u5220\u9664\u63D2\u4EF6\u5DE5\u574A\u6587\u4EF6\u5939\u91CC\u7684\u8FD9\u4E2A\u5305\u3002"), /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button mv-button-danger mv-button-small", onClick: () => void uninstall(current) }, "\u786E\u8BA4\u5378\u8F7D"), /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", onClick: () => setConfirmUninstall("") }, "\u53D6\u6D88"))))) : /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-ws-grid", "aria-busy": loading }, shown.map((pack) => /* @__PURE__ */ import_react6.default.createElement(
    "div",
    {
      key: pack.id,
      role: "button",
      tabIndex: 0,
      className: "mv-ws-card",
      onClick: () => setSelected(pack.id),
      title: pack.description,
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setSelected(pack.id);
        }
      }
    },
    /* @__PURE__ */ import_react6.default.createElement(Cover, { api, pack, cache: covers }),
    /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-card-title" }, pack.title),
    /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-card-sub" }, pack.artist || "\u672A\u77E5\u827A\u672F\u5BB6", " \xB7 ", durationText(pack.duration)),
    /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-card-sub" }, "by ", pack.author || "\u2014", " \xB7 ", pack.license),
    pack.lyrics && /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-card-sub" }, "\u6B4C\u8BCD\u4E0E\u8BD1\u6587\u5DF2\u5305\u542B \xB7 \u53EA\u9700\u81EA\u5907\u97F3\u4E50"),
    pack.source && /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-card-sub" }, /* @__PURE__ */ import_react6.default.createElement(SourceLink, { url: pack.source, compact: true })),
    installed[pack.id] && /* @__PURE__ */ import_react6.default.createElement("span", { className: `mv-ws-badge${updates.has(pack.id) ? " mv-ws-badge-update" : ""}` }, updates.has(pack.id) ? "\u6709\u66F4\u65B0" : "\u5DF2\u5B89\u88C5")
  )), index && !shown.length && /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-caption" }, packs.length ? "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u5305\u3002" : "\u5DE5\u574A\u91CC\u8FD8\u6CA1\u6709\u5305\u3002")), /* @__PURE__ */ import_react6.default.createElement(WorkshopDirSettings, { api, active, onRecent, onLoaded, onChanged: () => void refresh(false) }), /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-caption" }, "\u5DE5\u574A\u6CA1\u6709\u670D\u52A1\u5668\uFF1A\u76EE\u5F55\u6765\u81EA\u4ED3\u5E93\u91CC\u7531 GitHub Actions \u751F\u6210\u7684 index.json\u3002\u60F3\u6295\u7A3F\uFF1F\u6253\u5F00\u4F60\u7684 MV \u5305\u540E\u70B9\u300C\u53D1\u5E03\u5230\u5DE5\u574A\u2026\u300D\uFF0C\u6216\u770B ", /* @__PURE__ */ import_react6.default.createElement("a", { href: `${REPO_URL}/blob/main/CONTRIBUTING.zh.md`, target: "_blank", rel: "noreferrer" }, "\u6295\u7A3F\u8BF4\u660E"), "\u3002"));
}
var SOURCE_TEXT = { default: "\u9ED8\u8BA4\u4F4D\u7F6E", custom: "\u4F60\u8BBE\u7F6E\u7684\u4F4D\u7F6E", config: "\u63D2\u4EF6\u914D\u7F6E workshopDir", fixed: "\u56FA\u5B9A\u4F4D\u7F6E" };
function WorkshopDirSettings({ api, active = null, onRecent = () => {
}, onLoaded = () => {
}, onChanged = () => {
}, initialInfo = null, initialStep = null }) {
  const [info, setInfo] = import_react6.default.useState(initialInfo);
  const [editing, setEditing] = import_react6.default.useState(initialStep?.editing ?? false);
  const [value, setValue] = import_react6.default.useState(initialStep?.value ?? "");
  const [busy, setBusy] = import_react6.default.useState("");
  const [error, setError] = import_react6.default.useState(initialStep?.error ?? "");
  const [ask, setAsk] = import_react6.default.useState(initialStep?.ask ?? null);
  const [progress, setProgress] = import_react6.default.useState(initialStep?.progress ?? null);
  const [result, setResult] = import_react6.default.useState(initialStep?.result ?? null);
  const reload = import_react6.default.useCallback(async () => {
    try {
      setInfo(await workshopDirInfo(api));
    } catch (failure) {
      setError(errorText(failure, "\u65E0\u6CD5\u8BFB\u53D6\u5B89\u88C5\u4F4D\u7F6E\u3002"));
    }
  }, [api]);
  import_react6.default.useEffect(() => {
    if (!initialInfo) void reload();
  }, [reload]);
  const apply2 = async (request2) => {
    setBusy("set");
    setError("");
    setResult(null);
    try {
      const next = await setWorkshopDir(api, request2);
      setInfo(next);
      setEditing(false);
      if (next.movable?.length) setAsk({ previous: next.previous, packs: next.movable });
      else setResult({ text: next.changed ? `\u5B89\u88C5\u4F4D\u7F6E\u5DF2\u6539\u4E3A ${next.dir}\u3002\u4EE5\u540E\u5B89\u88C5\u7684\u5305\u4F1A\u653E\u5728\u8FD9\u91CC\u3002` : "\u5B89\u88C5\u4F4D\u7F6E\u6CA1\u6709\u53D8\u5316\u3002" });
      onChanged();
    } catch (failure) {
      setError(errorText(failure, "\u65E0\u6CD5\u66F4\u6539\u5B89\u88C5\u4F4D\u7F6E\u3002"));
    } finally {
      setBusy("");
    }
  };
  const move = async (packs) => {
    setAsk(null);
    setBusy("move");
    setError("");
    setResult(null);
    const { moved, failed } = await moveWorkshopPacks(api, packs.map((p) => p.id), setProgress);
    const moves = moved.filter((m) => m.moved);
    if (moves.length) {
      onRecent(relocatePacks(moves));
      const current = active && moves.find((m) => m.oldManifestPath.toLowerCase() === String(active.manifestPath ?? "").toLowerCase());
      if (current) {
        try {
          onLoaded(await loadPackFromHost(api, current.manifestPath));
        } catch {
        }
      }
    }
    setProgress(null);
    setBusy("");
    setResult({ text: `\u5DF2\u79FB\u52A8 ${moves.length} / ${packs.length} \u4E2A\u5305\u5230 ${info?.dir ?? "\u65B0\u4F4D\u7F6E"}\u3002`, failed });
    await reload();
    onChanged();
  };
  const keep = () => {
    setResult({ text: `\u539F\u4F4D\u7F6E\u7684 ${ask.packs.length} \u4E2A\u5305\u7559\u5728 ${ask.previous}\uFF0C\u66F2\u5E93\u91CC\u4ECD\u7136\u53EF\u4EE5\u6253\u5F00\uFF1B\u4EE5\u540E\u53EF\u4EE5\u5728\u8FD9\u91CC\u518D\u79FB\u52A8\u3002` });
    setAsk(null);
  };
  const open = async () => {
    setError("");
    try {
      await openWorkshopDir(api);
    } catch (failure) {
      setError(errorText(failure, "\u65E0\u6CD5\u6253\u5F00\u6587\u4EF6\u5939\u3002"));
    }
  };
  const fixed = info?.source === "fixed";
  const example = info?.platform === "win32" || !info ? "F:\\MV\\workshop" : "/home/me/mv-workshop";
  return /* @__PURE__ */ import_react6.default.createElement("section", { className: "mv-ws-dir", "aria-label": "\u5DE5\u574A\u5B89\u88C5\u4F4D\u7F6E" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-ws-dir-text" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-caption" }, "\u5B89\u88C5\u4F4D\u7F6E"), /* @__PURE__ */ import_react6.default.createElement("code", { className: "mv-wrap", title: info?.dir }, info?.dir ?? "\u2026"), info && /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-caption" }, SOURCE_TEXT[info.source] ?? info.source, " \xB7 ", info.packs, " \u4E2A\u5305", info.extraDirs?.length ? ` \xB7 \u53E6\u6709 ${info.extraDirs.reduce((n, d) => n + d.packs.length, 0)} \u4E2A\u5728\u65E7\u4F4D\u7F6E` : "")), /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-row" }, /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", disabled: !info || Boolean(busy), onClick: () => void open() }, "\u6253\u5F00\u6587\u4EF6\u5939"), /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", disabled: !info || fixed || Boolean(busy), onClick: () => {
    setEditing(true);
    setValue(info?.dir ?? "");
    setError("");
  } }, "\u66F4\u6539\u2026"), /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", disabled: !info || fixed || Boolean(busy) || info?.source === "default" || info?.source === "config", title: info ? `\u6062\u590D\u4E3A ${info.defaultDir}` : "", onClick: () => void apply2({ reset: true, keep: true }) }, "\u6062\u590D\u9ED8\u8BA4"))), editing && /* @__PURE__ */ import_react6.default.createElement("form", { className: "mv-row mv-ws-dir-edit", onSubmit: (event) => {
    event.preventDefault();
    void apply2({ dir: value, keep: true });
  } }, /* @__PURE__ */ import_react6.default.createElement("input", { value, autoFocus: true, spellCheck: false, "aria-label": "\u65B0\u7684\u5B89\u88C5\u6587\u4EF6\u5939", placeholder: `\u4F8B\u5982 ${example}`, onChange: (event) => setValue(event.target.value) }), /* @__PURE__ */ import_react6.default.createElement("button", { type: "submit", className: "mv-button mv-button-small", disabled: busy === "set" || !value.trim() }, busy === "set" ? "\u6B63\u5728\u68C0\u67E5\u2026" : "\u4F7F\u7528\u8FD9\u4E2A\u6587\u4EF6\u5939"), /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", onClick: () => {
    setEditing(false);
    setError("");
  } }, "\u53D6\u6D88"), /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-caption", style: { flexBasis: "100%" } }, "\u586B\u5199\u5B8C\u6574\u8DEF\u5F84\uFF0C\u53EF\u4EE5\u662F\u5176\u4ED6\u78C1\u76D8\uFF08\u4F8B\u5982 ", example, "\uFF09\u3002\u6587\u4EF6\u5939\u4E0D\u5B58\u5728\u4F1A\u81EA\u52A8\u521B\u5EFA\uFF0C\u5E76\u5148\u6D4B\u8BD5\u80FD\u5426\u5199\u5165\u3002")), ask && /* @__PURE__ */ import_react6.default.createElement(Alert, { kind: "warn", actions: /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button mv-button-small", onClick: () => void move(ask.packs) }, "\u79FB\u52A8\u5230\u65B0\u4F4D\u7F6E"), /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", onClick: keep }, "\u7559\u5728\u539F\u5904")) }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-wrap" }, "\u539F\u6765\u7684\u4F4D\u7F6E ", /* @__PURE__ */ import_react6.default.createElement("code", null, ask.previous), " \u91CC\u6709 ", ask.packs.length, " \u4E2A\u5DF2\u5B89\u88C5\u7684\u5305\uFF08", ask.packs.slice(0, 4).map((p) => p.title || p.id).join("\u3001"), ask.packs.length > 4 ? " \u7B49" : "", "\uFF09\u3002\u8981\u79FB\u52A8\u5230\u65B0\u4F4D\u7F6E\u5417\uFF1F\u79FB\u52A8\u4F1A\u5148\u590D\u5236\u5E76\u6821\u9A8C sha256\uFF0C\u6210\u529F\u540E\u624D\u5220\u9664\u65E7\u6587\u4EF6\u3002\u7559\u5728\u539F\u5904\u7684\u5305\u4ECD\u4F1A\u51FA\u73B0\u5728\u66F2\u5E93\u91CC\u3002")), progress && /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-ws-dir-progress", role: "status" }, /* @__PURE__ */ import_react6.default.createElement("progress", { max: progress.total, value: progress.done }), " ", /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-caption" }, "\u6B63\u5728\u79FB\u52A8 ", progress.done + (progress.id ? 1 : 0), " / ", progress.total, progress.id ? `\uFF1A${progress.id}` : "")), !ask && !progress && info?.extraDirs?.length > 0 && !result && /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-caption mv-wrap" }, "\u65E7\u4F4D\u7F6E\u91CC\u8FD8\u6709\u5305\uFF1A", info.extraDirs.map((d) => `${d.dir}\uFF08${d.packs.length} \u4E2A\uFF09`).join("\uFF1B"), "\u3002", /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-link", disabled: Boolean(busy), onClick: () => void move(info.extraDirs.flatMap((d) => d.packs.map((id) => ({ id })))) }, "\u5168\u90E8\u79FB\u52A8\u5230\u5F53\u524D\u4F4D\u7F6E")), error && /* @__PURE__ */ import_react6.default.createElement(Alert, { kind: "error" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-wrap" }, error)), result && /* @__PURE__ */ import_react6.default.createElement(Alert, { kind: result.failed?.length ? "warn" : "ok", actions: /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-link", onClick: () => setResult(null) }, "\u77E5\u9053\u4E86") }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-wrap" }, result.text), result.failed?.length > 0 && /* @__PURE__ */ import_react6.default.createElement("ul", { className: "mv-caption" }, result.failed.map((f) => /* @__PURE__ */ import_react6.default.createElement("li", { key: f.id, className: "mv-wrap" }, f.id, "\uFF1A", f.error)))));
}
function PublishDialog({ api, pack, canvas = () => null, onClose }) {
  const ws = pack.pack.workshop ?? {};
  const [form, setForm] = import_react6.default.useState(() => ({
    id: ws.id ?? workshopSlug(pack.pack.title, pack.pack.artist),
    version: ws.version ?? "1.0.0",
    license: ws.license ?? "",
    author: ws.author ?? "",
    description: "",
    tags: "",
    fingerprint: true,
    cover: true,
    lyricsLicense: ws.lyricsLicense ?? "",
    lyricsCredit: ws.lyricsCredit ?? "",
    lyricsSource: ws.lyricsSource ?? ""
  }));
  const [busy, setBusy] = import_react6.default.useState("");
  const [error, setError] = import_react6.default.useState("");
  const [result, setResult] = import_react6.default.useState(null);
  const [agreed, setAgreed] = import_react6.default.useState(false);
  const [copied, setCopied] = import_react6.default.useState("");
  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setResult(null);
    setAgreed(false);
  };
  const prepare = async () => {
    setBusy("\u6B63\u5728\u68C0\u67E5\u5E76\u6253\u5305\u2026");
    setError("");
    setResult(null);
    setAgreed(false);
    try {
      const view = canvas();
      let fp = null;
      if (form.fingerprint && view?.audioFingerprint) {
        setBusy("\u6B63\u5728\u8BA1\u7B97\u97F3\u9891\u6307\u7EB9\uFF08\u672C\u673A\uFF09\u2026");
        try {
          fp = await view.audioFingerprint();
        } catch {
          fp = null;
        }
      }
      const coverPng = form.cover ? view?.snapshotPng?.() || void 0 : void 0;
      setBusy("\u6B63\u5728\u68C0\u67E5\u5E76\u6253\u5305\u2026");
      const value = await publishWorkshopPack(api, {
        manifestPath: pack.manifestPath,
        id: form.id.trim(),
        version: form.version.trim(),
        license: form.license.trim(),
        author: form.author.trim(),
        description: form.description.trim(),
        tags: form.tags.split(/[,，\s]+/).map((t) => t.trim()).filter(Boolean).slice(0, 8),
        ...pack.pack.lyrics ? { lyricsLicense: form.lyricsLicense.trim(), lyricsCredit: form.lyricsCredit.trim(), lyricsSource: form.lyricsSource.trim() } : {},
        ...fp?.duration ? { duration: Math.round(fp.duration * 1e3) / 1e3 } : {},
        ...fp?.base64 ? { fingerprint: fp.base64 } : {},
        ...coverPng && coverPng.length < 13e5 ? { coverPng } : {}
      });
      setResult(value);
    } catch (failure) {
      setError(errorText(failure, "\u65E0\u6CD5\u51C6\u5907\u53D1\u5E03\u3002"));
    } finally {
      setBusy("");
    }
  };
  const doCopy = async (label, text4) => {
    setCopied(await copy(text4) ? label : "");
    setTimeout(() => setCopied(""), 2e3);
  };
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-confirm", role: "dialog", "aria-label": "\u53D1\u5E03\u5230\u5DE5\u574A" }, /* @__PURE__ */ import_react6.default.createElement("strong", null, "\u53D1\u5E03\u300C", pack.pack.title, "\u300D\u5230\u521B\u610F\u5DE5\u574A"), /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-caption" }, "\u63D2\u4EF6\u4F1A\uFF1A\u68C0\u67E5\u5305 \u2192 ", /* @__PURE__ */ import_react6.default.createElement("b", null, "\u4EC5\u53BB\u6389\u6B4C\u66F2\u97F3\u9891"), "\uFF0C\u4FDD\u7559\u5DF2\u6388\u6743\u6B4C\u8BCD\u3001\u8BD1\u6587\u3001\u65F6\u95F4\u8F74\u3001\u9891\u8C31\u4E0E\u753B\u9762\u8D44\u6E90 \u2192 \u751F\u6210 README \u548C\u5C01\u9762 \u2192 \u653E\u8FDB\u672C\u673A\u7684\u53D1\u5E03\u6587\u4EF6\u5939\u3002\u6B4C\u8BCD JS \u53EA\u63D0\u53D6\u9759\u6001\u6570\u636E\uFF0C\u4E0D\u6267\u884C\u4EE3\u7801\u3002 \u7136\u540E\u7531\u4F60\u5728\u6D4F\u89C8\u5668\u91CC\u628A\u6587\u4EF6\u4E0A\u4F20\u5230 GitHub \u5E76\u521B\u5EFA Pull Request\uFF1B", /* @__PURE__ */ import_react6.default.createElement("b", null, "\u63D2\u4EF6\u4E0D\u4F1A\u66FF\u4F60\u63D0\u4EA4\u4EFB\u4F55\u4E1C\u897F"), "\u3002"), /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-form" }, /* @__PURE__ */ import_react6.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react6.default.createElement("span", null, "\u5305 id\uFF08\u6587\u4EF6\u5939\u540D\uFF09"), /* @__PURE__ */ import_react6.default.createElement("input", { value: form.id, spellCheck: false, onChange: (event) => set("id", event.target.value.toLowerCase()) })), /* @__PURE__ */ import_react6.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react6.default.createElement("span", null, "\u7248\u672C"), /* @__PURE__ */ import_react6.default.createElement("input", { value: form.version, spellCheck: false, onChange: (event) => set("version", event.target.value) })), /* @__PURE__ */ import_react6.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react6.default.createElement("span", null, "\u8BB8\u53EF\u8BC1"), /* @__PURE__ */ import_react6.default.createElement("input", { list: "mv-ws-licenses", value: form.license, spellCheck: false, onChange: (event) => set("license", event.target.value) }), /* @__PURE__ */ import_react6.default.createElement("datalist", { id: "mv-ws-licenses" }, LICENSES.map((l) => /* @__PURE__ */ import_react6.default.createElement("option", { key: l, value: l })))), /* @__PURE__ */ import_react6.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react6.default.createElement("span", null, "\u4F5C\u8005\uFF08GitHub \u7528\u6237\u540D\u6216\u7F72\u540D\uFF09"), /* @__PURE__ */ import_react6.default.createElement("input", { value: form.author, spellCheck: false, onChange: (event) => set("author", event.target.value) }))), pack.pack.lyrics && /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-form" }, /* @__PURE__ */ import_react6.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react6.default.createElement("span", null, "\u6B4C\u8BCD\u4E0E\u8BD1\u6587\u4F7F\u7528\u6761\u6B3E\uFF08\u4E0D\u81EA\u52A8\u7EE7\u627F\u4EE3\u7801\u8BB8\u53EF\uFF09"), /* @__PURE__ */ import_react6.default.createElement("input", { value: form.lyricsLicense, maxLength: 120, onChange: (event) => set("lyricsLicense", event.target.value) })), /* @__PURE__ */ import_react6.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react6.default.createElement("span", null, "\u6B4C\u8BCD / \u8BD1\u6587\u7F72\u540D"), /* @__PURE__ */ import_react6.default.createElement("input", { value: form.lyricsCredit, maxLength: 500, onChange: (event) => set("lyricsCredit", event.target.value) })), /* @__PURE__ */ import_react6.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react6.default.createElement("span", null, "\u6B4C\u8BCD\u6388\u6743 / \u6765\u6E90\u94FE\u63A5\uFF08https\uFF0C\u53EF\u9009\uFF09"), /* @__PURE__ */ import_react6.default.createElement("input", { value: form.lyricsSource, maxLength: 300, onChange: (event) => set("lyricsSource", event.target.value) }))), /* @__PURE__ */ import_react6.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react6.default.createElement("span", null, "\u7B80\u4ECB"), /* @__PURE__ */ import_react6.default.createElement("input", { value: form.description, maxLength: 500, onChange: (event) => set("description", event.target.value) })), /* @__PURE__ */ import_react6.default.createElement("label", { className: "mv-field", style: { marginTop: 8 } }, /* @__PURE__ */ import_react6.default.createElement("span", null, "\u6807\u7B7E\uFF08\u9017\u53F7\u5206\u9694\uFF0C\u6700\u591A 8 \u4E2A\uFF09"), /* @__PURE__ */ import_react6.default.createElement("input", { value: form.tags, onChange: (event) => set("tags", event.target.value) })), /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-row", style: { marginTop: 6 } }, /* @__PURE__ */ import_react6.default.createElement("label", { className: "mv-check" }, /* @__PURE__ */ import_react6.default.createElement("input", { type: "checkbox", checked: form.fingerprint, onChange: (event) => set("fingerprint", event.target.checked) }), /* @__PURE__ */ import_react6.default.createElement("span", null, "\u9644\u5E26\u97F3\u9891\u6307\u7EB9 ", /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-caption" }, "\u2014 \u7528\u5F53\u524D\u52A0\u8F7D\u7684\u97F3\u9891\u5728\u672C\u673A\u8BA1\u7B97\uFF1A\u6BCF 0.5 \u79D2\u4E00\u4E2A\u97F3\u91CF\u503C\uFF0C\u53EA\u80FD\u7528\u6765\u5224\u65AD\u522B\u4EBA\u7684\u97F3\u9891\u662F\u4E0D\u662F\u540C\u4E00\u7248\u672C\uFF0C\u65E0\u6CD5\u8FD8\u539F\u97F3\u9891"))), /* @__PURE__ */ import_react6.default.createElement("label", { className: "mv-check" }, /* @__PURE__ */ import_react6.default.createElement("input", { type: "checkbox", checked: form.cover, onChange: (event) => set("cover", event.target.checked) }), /* @__PURE__ */ import_react6.default.createElement("span", null, "\u7528\u5F53\u524D\u753B\u9762\u505A\u5C01\u9762"))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-row", style: { marginTop: 8 } }, /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button", disabled: Boolean(busy) || !form.id || !form.license.trim() || !form.author.trim() || Boolean(pack.pack.lyrics) && (!form.lyricsLicense.trim() || !form.lyricsCredit.trim()), onClick: () => void prepare() }, busy || "\u68C0\u67E5\u5E76\u6253\u5305"), /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", onClick: onClose }, "\u53D6\u6D88")), error && /* @__PURE__ */ import_react6.default.createElement(Alert, { kind: "error" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-wrap" }, error)), result && !result.ok && /* @__PURE__ */ import_react6.default.createElement(Alert, { kind: "error" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-wrap", style: { whiteSpace: "pre-wrap" } }, "\u6CA1\u6709\u901A\u8FC7\u68C0\u67E5\uFF0C\u8BF7\u4FEE\u6539\u540E\u91CD\u8BD5\uFF1A", "\n", result.errors.join("\n"))), result?.ok && /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-ws-publish" }, /* @__PURE__ */ import_react6.default.createElement(Alert, { kind: "ok" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-wrap" }, "\u5DF2\u901A\u8FC7\u68C0\u67E5\u5E76\u6253\u5305\u5230\uFF1A", /* @__PURE__ */ import_react6.default.createElement("code", null, result.dir), result.stripped.length > 0 && /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, /* @__PURE__ */ import_react6.default.createElement("br", null), "\u5DF2\u53BB\u6389\uFF1A", result.stripped.join("\uFF1B")), result.lyricLines ? /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, /* @__PURE__ */ import_react6.default.createElement("br", null), "\u5DF2\u5305\u542B\u6B4C\u8BCD\u4E0E\u8BD1\u6587\uFF1A", result.lyricLines, " \u884C\uFF0C\u5B89\u88C5\u540E\u81EA\u52A8\u52A0\u8F7D") : result.timingLines ? /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, /* @__PURE__ */ import_react6.default.createElement("br", null), "\u4EC5\u6B4C\u8BCD\u65F6\u95F4\u8F74\uFF1A", result.timingLines, " \u884C") : null)), result.warnings.length > 0 && /* @__PURE__ */ import_react6.default.createElement(Alert, { kind: "warn" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "mv-wrap", style: { whiteSpace: "pre-wrap" } }, result.warnings.join("\n"))), /* @__PURE__ */ import_react6.default.createElement("ul", { className: "mv-caption mv-ws-files" }, result.files.map((f) => /* @__PURE__ */ import_react6.default.createElement("li", { key: f.path }, /* @__PURE__ */ import_react6.default.createElement("code", { title: f.path }, f.path), /* @__PURE__ */ import_react6.default.createElement("span", { className: "mv-ws-size" }, sizeText(f.size)), /* @__PURE__ */ import_react6.default.createElement("span", null)))), /* @__PURE__ */ import_react6.default.createElement("ol", { className: "mv-caption mv-ws-steps" }, /* @__PURE__ */ import_react6.default.createElement("li", null, "\u590D\u5236\u4E0A\u9762\u7684\u6587\u4EF6\u5939\u8DEF\u5F84\uFF0C\u5728\u8D44\u6E90\u7BA1\u7406\u5668\u91CC\u6253\u5F00\u5B83\u3002", /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-link", onClick: () => void doCopy("dir", result.dir) }, copied === "dir" ? "\u5DF2\u590D\u5236" : "\u590D\u5236\u8DEF\u5F84")), /* @__PURE__ */ import_react6.default.createElement("li", null, "\u70B9\u4E0B\u9762\u7684\u6309\u94AE\uFF0C\u6D4F\u89C8\u5668\u4F1A\u6253\u5F00\u5DE5\u574A\u4ED3\u5E93 ", /* @__PURE__ */ import_react6.default.createElement("code", null, "packs/", result.id, "/"), " \u7684\u4E0A\u4F20\u9875\u9762\uFF08\u9700\u8981\u767B\u5F55 GitHub\uFF1BGitHub \u4F1A\u81EA\u52A8 fork\uFF09\u3002"), /* @__PURE__ */ import_react6.default.createElement("li", null, "\u628A\u6587\u4EF6\u5939\u91CC\u7684 ", result.files.length, " \u4E2A\u6587\u4EF6\u62D6\u8FDB\u9875\u9762\uFF0C\u9009\u300CCreate a new branch \u2026 and start a pull request\u300D\uFF0C\u6807\u9898\u548C\u8BF4\u660E\u53EF\u4EE5\u7C98\u8D34\u4E0B\u9762\u7684\u5185\u5BB9\uFF0C\u7136\u540E\u7531\u4F60\u786E\u8BA4\u63D0\u4EA4\u3002", /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-link", onClick: () => void doCopy("pr", `${result.prTitle}

${result.prBody}`) }, copied === "pr" ? "\u5DF2\u590D\u5236" : "\u590D\u5236 PR \u6807\u9898\u548C\u8BF4\u660E")), /* @__PURE__ */ import_react6.default.createElement("li", null, "\u7EF4\u62A4\u8005\u5BA1\u6838\u3001CI \u68C0\u67E5\u901A\u8FC7\u5E76\u5408\u5E76\u540E\uFF0C\u5305\u4F1A\u51FA\u73B0\u5728\u6240\u6709\u4EBA\u7684\u521B\u610F\u5DE5\u574A\u91CC\u3002")), /* @__PURE__ */ import_react6.default.createElement("label", { className: "mv-check", style: { height: "auto" } }, /* @__PURE__ */ import_react6.default.createElement("input", { type: "checkbox", checked: agreed, onChange: (event) => setAgreed(event.target.checked) }), /* @__PURE__ */ import_react6.default.createElement("span", null, "\u6211\u786E\u8BA4\u6709\u6743\u6309\u5404\u8D44\u6E90\u58F0\u660E\u7684\u4F7F\u7528\u6761\u6B3E\u5206\u4EAB\u8FD9\u4E9B\u6587\u4EF6\uFF08\u4EE3\u7801\uFF1A", /* @__PURE__ */ import_react6.default.createElement("b", null, form.license), pack.pack.lyrics ? `\uFF1B\u6B4C\u8BCD\uFF1A${form.lyricsLicense}` : "", "\uFF09\uFF0C\u5305\u91CC\u6CA1\u6709\u6B4C\u66F2\u97F3\u9891\u6216\u65E0\u6743\u5206\u4EAB\u7684\u7D20\u6750\u3002")), /* @__PURE__ */ import_react6.default.createElement("div", { className: "mv-row", style: { marginTop: 6 } }, agreed ? /* @__PURE__ */ import_react6.default.createElement("a", { className: "mv-button", href: result.links.upload, target: "_blank", rel: "noreferrer" }, "\u5728 GitHub \u4E0A\u63D0\u4EA4\u2026") : /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button", disabled: true }, "\u5728 GitHub \u4E0A\u63D0\u4EA4\u2026"), /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary mv-button-small", onClick: () => void doCopy("link", result.links.upload) }, copied === "link" ? "\u5DF2\u590D\u5236\u94FE\u63A5" : "\u590D\u5236\u4E0A\u4F20\u94FE\u63A5"), /* @__PURE__ */ import_react6.default.createElement("a", { className: "mv-link", href: result.links.contributing, target: "_blank", rel: "noreferrer" }, "\u6295\u7A3F\u8BF4\u660E"))));
}

// .dsh-plugin/client/mv-library.jsx
function downloadZip() {
  const blob = new Blob([templateZip()], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = TEMPLATE_ZIP_NAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3e4);
}
var initials = coverInitials;
var hue = (title) => ({ "--mv-hue": coverHue(title) });
function Library({ api, active, recent, onSelect, onLoaded, onRecent, harness = null, info = null, initialAi = false, initialWorkshop = false, canvas = () => null, workshopIndex = null, navRequest = null, onView = null, playing = false, onPlay = () => {
}, onShowPlayer = () => {
} }) {
  const [layout, setLayout] = import_react7.default.useState(loadLibraryView);
  const [collapsed, setCollapsed] = import_react7.default.useState(loadLibraryCollapsed);
  const [importing, setImporting] = import_react7.default.useState(false);
  const [aiOpen, setAiOpen] = import_react7.default.useState(initialAi);
  const [workshopOpen, setWorkshopOpen] = import_react7.default.useState(initialWorkshop);
  const [path, setPath] = import_react7.default.useState("");
  const [busy, setBusy] = import_react7.default.useState("");
  const [note, setNote] = import_react7.default.useState("");
  const [error, setError] = import_react7.default.useState("");
  const pick = directoryPicker();
  import_react7.default.useEffect(() => {
    if (!navRequest) return;
    if (!navRequest.view) setCollapsed(saveLibraryCollapsed(false));
    setWorkshopOpen(navRequest.view === "workshop");
    setAiOpen(navRequest.view === "ai");
    setImporting(navRequest.view === "import");
    setError("");
  }, [navRequest]);
  const view = workshopOpen ? "workshop" : aiOpen ? "ai" : importing ? "import" : null;
  import_react7.default.useEffect(() => {
    onView?.(view);
  }, [view]);
  const importPath = async (value) => {
    setBusy("import");
    setError("");
    setNote("");
    try {
      const loaded = await loadPackFromHost(api, value);
      onRecent(rememberPack(loaded));
      onLoaded(loaded);
      setImporting(false);
      setPath("");
      setNote(`\u5DF2\u5BFC\u5165\u300C${loaded.pack.title}\u300D\u3002\u5BFC\u5165\u53EA\u8BFB\u53D6\u6E05\u5355\uFF0C\u4E0D\u4F1A\u8FD0\u884C\u4EFB\u4F55\u7A0B\u5E8F\u3002`);
    } catch (failure) {
      setError(errorText(failure, "\u65E0\u6CD5\u5BFC\u5165 MV \u5305\u3002"));
    } finally {
      setBusy("");
    }
  };
  const chooseFolder = async () => {
    setError("");
    try {
      const dir = await pick();
      if (dir) {
        setPath(dir);
        await importPath(dir);
      }
    } catch (failure) {
      setError(errorText(failure, "\u65E0\u6CD5\u6253\u5F00\u6587\u4EF6\u5939\u9009\u62E9\u5668\u3002"));
    }
  };
  const writeTemplate = async () => {
    if (!pick) {
      downloadZip();
      setNote(`\u5DF2\u4E0B\u8F7D ${TEMPLATE_ZIP_NAME}\u3002\u89E3\u538B\u540E\u7F16\u8F91 mv.json\uFF0C\u653E\u5165\u4F60\u81EA\u5DF1\u7684\u97F3\u9891\u548C\u6B4C\u8BCD\uFF0C\u518D\u70B9\u300C\u5BFC\u5165\u300D\u3002`);
      return;
    }
    setBusy("template");
    setError("");
    setNote("");
    try {
      const dir = await pick();
      if (!dir) return;
      const written = unwrapRemote(await api.packTemplate({ dir }), "\u65E0\u6CD5\u5199\u5165\u6A21\u677F\u3002");
      setNote(`\u6A21\u677F\u5DF2\u4FDD\u5B58\u5230 ${written.path}\uFF08${written.files.length} \u4E2A\u6587\u4EF6\uFF09\u3002\u7F16\u8F91\u5176\u4E2D\u7684 mv.json\uFF0C\u653E\u5165\u4F60\u81EA\u5DF1\u7684\u97F3\u9891\u548C\u6B4C\u8BCD\uFF0C\u518D\u70B9\u300C\u5BFC\u5165\u300D\u9009\u62E9\u8BE5\u6587\u4EF6\u5939\u3002`);
    } catch (failure) {
      setError(errorText(failure, "\u65E0\u6CD5\u5199\u5165\u6A21\u677F\u3002"));
    } finally {
      setBusy("");
    }
  };
  const installPreset = async (preset) => {
    const have = recent.find((item) => item.workshop === preset.id);
    if (have) {
      onSelect(`pack:${have.manifestPath}`);
      return;
    }
    setBusy(`preset:${preset.id}`);
    setError("");
    setNote("");
    try {
      const done = await installWorkshopPack(api, preset.id);
      const loaded = await loadPackFromHost(api, done.manifestPath);
      onRecent(rememberPack(loaded));
      onLoaded(loaded);
      setNote(`\u5DF2\u4ECE\u521B\u610F\u5DE5\u574A\u5B89\u88C5\u300C${preset.title}\u300Dv${done.version}\uFF08${done.files} \u4E2A\u6587\u4EF6\uFF0Csha256 \u6821\u9A8C\u901A\u8FC7\uFF09\u3002\u5305\u91CC\u6CA1\u6709\u97F3\u9891\uFF1A\u9009\u62E9\u4F60\u81EA\u5DF1\u7684\u6B4C\u66F2\u6587\u4EF6\uFF08\u53EF\u9009\u6B4C\u8BCD\uFF09\u540E\u70B9 \u25B6 \u64AD\u653E\u3002`);
    } catch (failure) {
      setError(errorText(failure, `\u65E0\u6CD5\u5B89\u88C5\u300C${preset.title}\u300D\u3002\u53EF\u4EE5\u6253\u5F00\u300C\u521B\u610F\u5DE5\u574A\u300D\u91CD\u8BD5\u3002`));
    } finally {
      setBusy("");
    }
  };
  const presetRow = (preset) => {
    const have = recent.some((item) => item.workshop === preset.id);
    return /* @__PURE__ */ import_react7.default.createElement("div", { key: preset.id, className: "mv-preset", role: "listitem" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-thumb mv-track-art", style: { "--mv-hue": preset.hue }, "aria-hidden": "true" }, preset.cover), /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-preset-main" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-track-title" }, preset.title), /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-track-artist" }, preset.artist, " \xB7 ", preset.kind, " \xB7 \u539F\u4F5C ", /* @__PURE__ */ import_react7.default.createElement("a", { href: preset.source, target: "_blank", rel: "noreferrer" }, preset.sourceLabel))), /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "mv-button mv-button-small", disabled: Boolean(busy) || !api?.workshopInstall, onClick: () => void installPreset(preset) }, busy === `preset:${preset.id}` ? "\u6B63\u5728\u5B89\u88C5\u2026" : have ? "\u6253\u5F00" : "\u4E00\u952E\u5B89\u88C5"));
  };
  const moved = active.moved ?? null;
  const empty = recent.length === 0;
  const toggleWorkshop = () => {
    setWorkshopOpen((value) => !value);
    setAiOpen(false);
    setImporting(false);
    setError("");
  };
  const toggleAi = () => {
    setAiOpen((value) => !value);
    setImporting(false);
    setWorkshopOpen(false);
    setError("");
  };
  const toggleImport = () => {
    setImporting((value) => !value);
    setAiOpen(false);
    setWorkshopOpen(false);
    setError("");
  };
  const tools = [
    { key: "ws", label: "\u521B\u610F\u5DE5\u574A", Icon: Icon.shop, expanded: workshopOpen, onClick: toggleWorkshop, title: "\u6D4F\u89C8\u793E\u533A\u6295\u7A3F\u7684 MV \u5305\uFF0C\u4E00\u952E\u5B89\u88C5\u5230\u66F2\u5E93\uFF1B\u4E5F\u53EF\u4EE5\u628A\u4F60\u7684 MV \u5305\u53D1\u5E03\u5230\u5DE5\u574A" },
    { key: "ai", label: "\u7528 AI \u5236\u4F5C\u65B0 MV", Icon: Icon.spark, expanded: aiOpen, onClick: toggleAi, title: "\u9009\u4E00\u9996\u4F60\u7684\u6B4C\uFF0C\u8BA9 Harness \u7684 Agent \u5199\u6B4C\u8BCD\u65F6\u95F4\u8F74\u3001mv.json \u548C ASCII \u573A\u666F\u811A\u672C" },
    { key: "import", label: "\u5BFC\u5165 MV \u5305", Icon: Icon.plus, expanded: importing, onClick: toggleImport, title: "\u9009\u62E9\u542B mv.json \u7684\u6587\u4EF6\u5939" },
    { key: "template", label: busy === "template" ? "\u6B63\u5728\u5199\u5165\u2026" : "\u65B0\u5EFA\uFF08\u6A21\u677F\uFF09", Icon: Icon.folder, disabled: busy === "template", onClick: () => void writeTemplate(), title: pick ? "\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6\u5939\uFF0C\u5728\u5176\u4E2D\u65B0\u5EFA dsh-mv-pack-template\uFF08\u4E0D\u4F1A\u8986\u76D6\u5DF2\u6709\u6587\u4EF6\uFF09" : `\u4E0B\u8F7D ${TEMPLATE_ZIP_NAME}` }
  ];
  const activeDuration = Number(active.pack?.duration) || 0;
  const rows = [
    ...recent.map((item) => {
      const id = `pack:${item.manifestPath}`;
      return { id, manifestPath: item.manifestPath, title: item.title || item.manifestPath, artist: item.artist, type: item.workshop ? "\u521B\u610F\u5DE5\u574A" : "MV \u5305", kind: item.workshop ? "workshop" : "pack", cover: initials(item.title), hue: coverHue(item.title), duration: item.duration || (active.id === id ? activeDuration : 0), tip: item.manifestPath };
    })
  ];
  const trackRow = (row, number) => {
    const current = active.id === row.id;
    return /* @__PURE__ */ import_react7.default.createElement("div", { key: row.id, role: "listitem", className: "mv-track", "aria-current": current ? "true" : void 0, "data-playing": current && playing ? "true" : void 0 }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-track-n" }, current && playing ? /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-eq", "aria-label": "\u6B63\u5728\u64AD\u653E" }, /* @__PURE__ */ import_react7.default.createElement("i", null), /* @__PURE__ */ import_react7.default.createElement("i", null), /* @__PURE__ */ import_react7.default.createElement("i", null)) : number), /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-thumb mv-track-art", style: { "--mv-hue": row.hue }, "aria-hidden": "true" }, row.cover), /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "mv-track-main", title: row.tip, "aria-pressed": current, onClick: () => onSelect(row.id) }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-track-title" }, row.title), /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-track-artist" }, row.artist || "\u672A\u77E5\u827A\u672F\u5BB6")), /* @__PURE__ */ import_react7.default.createElement("span", { className: `mv-track-type mv-track-type-${row.kind}` }, row.type), /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-track-len" }, row.duration > 0 ? fmtTime(row.duration) : "\u2014"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-track-actions" }, /* @__PURE__ */ import_react7.default.createElement(
      "button",
      {
        type: "button",
        className: "mv-icon-button",
        "aria-label": current ? playing ? `\u6682\u505C\u300C${row.title}\u300D` : `\u64AD\u653E\u300C${row.title}\u300D` : `\u5207\u6362\u5230\u300C${row.title}\u300D`,
        title: current ? playing ? "\u6682\u505C" : "\u64AD\u653E" : "\u5207\u6362\u5230\u8FD9\u9996\uFF08\u518D\u70B9 \u25B6 \u64AD\u653E\uFF09",
        onClick: () => {
          if (current) onPlay();
          else {
            onSelect(row.id);
            onShowPlayer();
          }
        }
      },
      current && playing ? /* @__PURE__ */ import_react7.default.createElement(Icon.pause, null) : /* @__PURE__ */ import_react7.default.createElement(Icon.play, null)
    ), row.manifestPath && /* @__PURE__ */ import_react7.default.createElement(
      "button",
      {
        type: "button",
        className: "mv-icon-button",
        "aria-label": `\u4ECE\u66F2\u5E93\u79FB\u9664\u300C${row.title}\u300D`,
        title: "\u4ECE\u66F2\u5E93\u79FB\u9664\uFF08\u4E0D\u5220\u9664\u6587\u4EF6\uFF09",
        onClick: () => {
          onRecent(forgetPack(row.manifestPath));
          if (current) onSelect(EMPTY_ID);
        }
      },
      /* @__PURE__ */ import_react7.default.createElement(Icon.close, null)
    )));
  };
  const activeRow = rows.find((row) => row.id === active.id) ?? { id: active.id, manifestPath: "", title: active.pack?.title ?? "", artist: active.pack?.artist ?? "", type: active.empty ? "\u2014" : "MV \u5305", kind: "pack", cover: initials(active.pack?.title), hue: coverHue(active.pack?.title), duration: activeDuration, tip: active.manifestPath ?? "" };
  const warnings = active.warnings ?? [];
  return /* @__PURE__ */ import_react7.default.createElement("section", { className: "mv-library-section", "aria-label": "\u66F2\u5E93" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "mv-lib-head" }, /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      type: "button",
      className: "mv-lib-collapse",
      "aria-expanded": !collapsed,
      "aria-controls": "mv-lib-body",
      title: collapsed ? "\u5C55\u5F00\u66F2\u5E93" : "\u6536\u8D77\u66F2\u5E93",
      "aria-label": collapsed ? "\u5C55\u5F00\u66F2\u5E93" : "\u6536\u8D77\u66F2\u5E93",
      onClick: () => setCollapsed(saveLibraryCollapsed(!collapsed))
    },
    /* @__PURE__ */ import_react7.default.createElement(Icon.chevron, null)
  ), /* @__PURE__ */ import_react7.default.createElement("p", { className: "mv-section-label" }, "\u66F2\u5E93 ", /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-lib-count" }, recent.length, " \u9996", collapsed ? " \xB7 \u5DF2\u6536\u8D77" : "")), /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-spacer" }), /* @__PURE__ */ import_react7.default.createElement("div", { className: "mv-segmented mv-segmented-small mv-lib-layout", role: "radiogroup", "aria-label": "\u66F2\u5E93\u663E\u793A\u65B9\u5F0F" }, [["list", "\u5217\u8868", Icon.list], ["grid", "\u7F51\u683C", Icon.grid]].map(([value, label, Ico]) => /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      key: value,
      type: "button",
      role: "radio",
      "aria-checked": layout === value,
      title: `${label}\u89C6\u56FE`,
      "aria-label": `${label}\u89C6\u56FE`,
      onClick: () => setLayout(saveLibraryView(value))
    },
    /* @__PURE__ */ import_react7.default.createElement(Ico, null),
    /* @__PURE__ */ import_react7.default.createElement("span", null, label)
  )))), moved && /* @__PURE__ */ import_react7.default.createElement(Alert, { kind: "info", actions: /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "mv-button mv-button-small", disabled: Boolean(busy) || !api?.workshopInstall, onClick: () => void installPreset(moved) }, busy === `preset:${moved.id}` ? "\u6B63\u5728\u5B89\u88C5\u2026" : "\u4ECE\u521B\u610F\u5DE5\u574A\u5B89\u88C5") }, /* @__PURE__ */ import_react7.default.createElement("p", { className: "mv-wrap" }, "\u300C", moved.title, "\u300D\u5728 0.9.0 \u8D77\u4E0D\u518D\u5185\u7F6E\uFF0C\u5DF2\u79FB\u5230\u521B\u610F\u5DE5\u574A\uFF08\u539F\u4F5C ", /* @__PURE__ */ import_react7.default.createElement("a", { href: moved.source, target: "_blank", rel: "noreferrer" }, moved.sourceLabel), "\uFF09\u3002\u5B89\u88C5\u540E\u4F1A\u6CBF\u7528\u4F60\u4E4B\u524D\u4E3A\u5B83\u9009\u62E9\u7684\u97F3\u9891\u548C\u6B4C\u8BCD\u3002")), collapsed ? /* @__PURE__ */ import_react7.default.createElement("div", { id: "mv-lib-body", className: "mv-tracks mv-tracks-mini", role: "list", "aria-label": "\u6B63\u5728\u64AD\u653E" }, active.empty ? /* @__PURE__ */ import_react7.default.createElement("p", { className: "mv-caption" }, "\u66F2\u5E93\u662F\u7A7A\u7684\uFF1A\u5C55\u5F00\u540E\u5230\u300C\u521B\u610F\u5DE5\u574A\u300D\u5B89\u88C5 MV\u3002") : trackRow(activeRow, "\u25B8")) : layout === "list" ? /* @__PURE__ */ import_react7.default.createElement("div", { id: "mv-lib-body", className: "mv-lib-body" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "mv-lib-tools", role: "toolbar", "aria-label": "\u66F2\u5E93\u64CD\u4F5C" }, tools.map((tool) => /* @__PURE__ */ import_react7.default.createElement("button", { key: tool.key, type: "button", className: `mv-lib-tool mv-lib-tool-${tool.key}`, "aria-expanded": tool.expanded, disabled: tool.disabled, title: tool.title, onClick: tool.onClick }, /* @__PURE__ */ import_react7.default.createElement(tool.Icon, null), /* @__PURE__ */ import_react7.default.createElement("span", null, tool.label)))), !empty && /* @__PURE__ */ import_react7.default.createElement("div", { className: "mv-tracks", role: "list", "aria-label": "\u66F2\u76EE" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "mv-track mv-track-head", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-track-n" }, "#"), /* @__PURE__ */ import_react7.default.createElement("span", null), /* @__PURE__ */ import_react7.default.createElement("span", null, "\u6807\u9898"), /* @__PURE__ */ import_react7.default.createElement("span", null, "\u7C7B\u578B"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-track-len" }, "\u65F6\u957F"), /* @__PURE__ */ import_react7.default.createElement("span", null)), rows.map((row, index) => trackRow(row, index + 1)))) : /* @__PURE__ */ import_react7.default.createElement("div", { id: "mv-lib-body", className: "mv-library" }, recent.map((item) => {
    const id = `pack:${item.manifestPath}`;
    return /* @__PURE__ */ import_react7.default.createElement(
      "div",
      {
        key: item.manifestPath,
        role: "button",
        tabIndex: 0,
        className: "mv-card",
        "aria-pressed": active.id === id,
        title: item.manifestPath,
        onClick: () => onSelect(id),
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(id);
          }
        }
      },
      /* @__PURE__ */ import_react7.default.createElement(
        "button",
        {
          type: "button",
          className: "mv-card-remove",
          "aria-label": `\u4ECE\u66F2\u5E93\u79FB\u9664\u300C${item.title}\u300D`,
          title: "\u4ECE\u66F2\u5E93\u79FB\u9664\uFF08\u4E0D\u5220\u9664\u6587\u4EF6\uFF09",
          onClick: (event) => {
            event.stopPropagation();
            onRecent(forgetPack(item.manifestPath));
            if (active.id === id) onSelect(EMPTY_ID);
          }
        },
        /* @__PURE__ */ import_react7.default.createElement(Icon.close, null)
      ),
      /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-card-art", style: hue(item.title) }, initials(item.title)),
      /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-card-title" }, item.title || item.manifestPath),
      /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-card-sub" }, item.artist ? `${item.artist} \xB7 ` : "", item.workshop ? "\u521B\u610F\u5DE5\u574A" : "MV \u5305")
    );
  }), /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      type: "button",
      className: "mv-card mv-card-ghost mv-card-ws",
      "aria-expanded": workshopOpen,
      onClick: () => {
        setWorkshopOpen((value) => !value);
        setAiOpen(false);
        setImporting(false);
        setError("");
      },
      title: "\u6D4F\u89C8\u793E\u533A\u6295\u7A3F\u7684 MV \u5305\uFF0C\u4E00\u952E\u5B89\u88C5\u5230\u66F2\u5E93\uFF1B\u4E5F\u53EF\u4EE5\u628A\u4F60\u7684 MV \u5305\u53D1\u5E03\u5230\u5DE5\u574A"
    },
    /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-card-art" }, /* @__PURE__ */ import_react7.default.createElement(Icon.shop, null)),
    /* @__PURE__ */ import_react7.default.createElement("span", null, "\u521B\u610F\u5DE5\u574A")
  ), /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      type: "button",
      className: "mv-card mv-card-ghost mv-card-ai",
      "aria-expanded": aiOpen,
      onClick: () => {
        setAiOpen((value) => !value);
        setImporting(false);
        setWorkshopOpen(false);
        setError("");
      },
      title: "\u9009\u4E00\u9996\u4F60\u7684\u6B4C\uFF0C\u8BA9 Harness \u7684 Agent \u5199\u6B4C\u8BCD\u65F6\u95F4\u8F74\u3001mv.json \u548C ASCII \u573A\u666F\u811A\u672C"
    },
    /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-card-art" }, /* @__PURE__ */ import_react7.default.createElement(Icon.spark, null)),
    /* @__PURE__ */ import_react7.default.createElement("span", null, "\u7528 AI \u5236\u4F5C\u65B0 MV")
  ), /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "mv-card mv-card-ghost", "aria-expanded": importing, onClick: () => {
    setImporting((value) => !value);
    setAiOpen(false);
    setWorkshopOpen(false);
    setError("");
  } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-card-art" }, /* @__PURE__ */ import_react7.default.createElement(Icon.plus, null)), /* @__PURE__ */ import_react7.default.createElement("span", null, "\u5BFC\u5165 MV \u5305")), /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      type: "button",
      className: "mv-card mv-card-ghost",
      disabled: busy === "template",
      onClick: () => void writeTemplate(),
      title: pick ? "\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6\u5939\uFF0C\u5728\u5176\u4E2D\u65B0\u5EFA dsh-mv-pack-template\uFF08\u4E0D\u4F1A\u8986\u76D6\u5DF2\u6709\u6587\u4EF6\uFF09" : `\u4E0B\u8F7D ${TEMPLATE_ZIP_NAME}`
    },
    /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-card-art" }, /* @__PURE__ */ import_react7.default.createElement(Icon.folder, null)),
    /* @__PURE__ */ import_react7.default.createElement("span", null, busy === "template" ? "\u6B63\u5728\u5199\u5165\u2026" : "\u65B0\u5EFA\uFF08\u6A21\u677F\uFF09")
  )), empty && !collapsed && !workshopOpen && /* @__PURE__ */ import_react7.default.createElement("div", { className: "mv-empty-lib", role: "region", "aria-label": "\u66F2\u5E93\u662F\u7A7A\u7684" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "mv-empty-head" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "mv-empty-icon", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement(Icon.shop, null)), /* @__PURE__ */ import_react7.default.createElement("div", null, /* @__PURE__ */ import_react7.default.createElement("h3", null, "\u66F2\u5E93\u8FD8\u662F\u7A7A\u7684"), /* @__PURE__ */ import_react7.default.createElement("p", { className: "mv-caption" }, "\u63D2\u4EF6\u672C\u8EAB\u4E0D\u5E26\u4EFB\u4F55 MV\uFF1A\u5230\u300C\u521B\u610F\u5DE5\u574A\u300D\u5B89\u88C5\u793E\u533A\u505A\u597D\u7684 MV \u5305\uFF08\u4E0D\u542B\u97F3\u9891\u548C\u6B4C\u8BCD\uFF0C\u7528\u4F60\u81EA\u5DF1\u7684\u6B4C\u66F2\u6587\u4EF6\u64AD\u653E\uFF09\u3002\u4E0B\u9762\u4E24\u4E2A\u662F\u4EE5\u524D\u5185\u7F6E\u7684 world.execute(me) MV\uFF0C\u70B9\u4E00\u4E0B\u5C31\u80FD\u88C5\u597D\u3002")), /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "mv-button", onClick: toggleWorkshop }, "\u6253\u5F00\u521B\u610F\u5DE5\u574A")), /* @__PURE__ */ import_react7.default.createElement("div", { className: "mv-presets", role: "list", "aria-label": "\u63A8\u8350" }, PRESET_PACKS.map(presetRow)), /* @__PURE__ */ import_react7.default.createElement("p", { className: "mv-caption" }, "\u4E5F\u53EF\u4EE5\u70B9\u300C\u7528 AI \u5236\u4F5C\u65B0 MV\u300D\u8BA9 Agent \u5E2E\u4F60\u505A\uFF0C\u6216\u300C\u65B0\u5EFA\uFF08\u6A21\u677F\uFF09\u300D\u5199\u4E00\u4E2A\u81EA\u5DF1\u7684 MV \u5305\u518D\u300C\u5BFC\u5165\u300D\u3002")), workshopOpen && /* @__PURE__ */ import_react7.default.createElement(WorkshopDialog, { api, active, canvas, initialIndex: workshopIndex, onClose: () => setWorkshopOpen(false), onLoaded, onRecent }), aiOpen && /* @__PURE__ */ import_react7.default.createElement(AiPackDialog, { api, harness, info, onClose: () => setAiOpen(false), onLoaded, onRecent }), importing && /* @__PURE__ */ import_react7.default.createElement("div", { className: "mv-dialog", role: "dialog", "aria-label": "\u5BFC\u5165 MV \u5305" }, /* @__PURE__ */ import_react7.default.createElement("h2", null, "\u5BFC\u5165 MV \u5305"), /* @__PURE__ */ import_react7.default.createElement("p", { className: "mv-caption" }, "\u9009\u62E9\u542B mv.json \u7684\u6587\u4EF6\u5939\uFF0C\u6216\u7C98\u8D34 mv.json / \u6587\u4EF6\u5939\u7684\u7EDD\u5BF9\u8DEF\u5F84\u3002\u53EA\u8BFB\u53D6\u6E05\u5355\uFF0C\u4E0D\u8FD0\u884C\u4EFB\u4F55\u7A0B\u5E8F\u3002"), /* @__PURE__ */ import_react7.default.createElement("div", { className: "mv-field-row" }, /* @__PURE__ */ import_react7.default.createElement(
    "input",
    {
      value: path,
      spellCheck: false,
      placeholder: "D:\\MV\\My Song\\mv.json",
      "aria-label": "mv.json \u6216\u6587\u4EF6\u5939\u8DEF\u5F84",
      style: { height: 30, padding: "0 8px", borderRadius: 8, border: "1px solid var(--mv-border)", background: "var(--mv-bg)" },
      onChange: (event) => setPath(event.target.value),
      onKeyDown: (event) => {
        if (event.key === "Enter" && path.trim()) void importPath(path);
      }
    }
  ), pick && /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", disabled: Boolean(busy), onClick: () => void chooseFolder() }, "\u9009\u62E9\u6587\u4EF6\u5939\u2026"), /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "mv-button", disabled: !path.trim() || Boolean(busy), onClick: () => void importPath(path) }, busy === "import" ? "\u8BFB\u53D6\u4E2D\u2026" : "\u5BFC\u5165"), /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", onClick: () => setImporting(false) }, "\u53D6\u6D88")), pick && /* @__PURE__ */ import_react7.default.createElement("p", { className: "mv-caption" }, "\u6CA1\u6709\u73B0\u6210\u7684\u5305\uFF1F", /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "mv-link", onClick: downloadZip }, "\u4E0B\u8F7D\u6A21\u677F zip"))), warnings.length > 0 && /* @__PURE__ */ import_react7.default.createElement(Alert, { kind: "warn" }, /* @__PURE__ */ import_react7.default.createElement("p", { className: "mv-wrap" }, warnings.join("\n"))), error && /* @__PURE__ */ import_react7.default.createElement(Alert, { kind: "error" }, /* @__PURE__ */ import_react7.default.createElement("p", { className: "mv-wrap", style: { whiteSpace: "pre-wrap" } }, error)), note && /* @__PURE__ */ import_react7.default.createElement(Alert, { kind: "ok", actions: /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "mv-link", onClick: () => setNote("") }, "\u77E5\u9053\u4E86") }, /* @__PURE__ */ import_react7.default.createElement("p", { className: "mv-wrap" }, note)));
}

// .dsh-plugin/client/mv.css
var mv_default = '/* MV \u653E\u6620\u5BA4 \u2014 opaque surface that follows Harness light/dark (body[data-ds-dark-theme]). */\n.mv-root {\n  --mv-fb-bg: #ffffff; --mv-fb-text: #14151a; --mv-fb-muted: #4b4e59; --mv-fb-faint: #6b6e79; --mv-fb-border: rgba(20, 21, 26, .12);\n  --mv-fb-danger: #d92d20; --mv-fb-ok: #15803d;\n  --mv-accent: #e8890c; --mv-accent-strong: #c96f00; --mv-accent-ink: #1b1204;\n  --mv-bg: var(--dsw-alias-bg-base, var(--mv-fb-bg));\n  --mv-text: var(--dsw-alias-label-primary, var(--mv-fb-text));\n  --mv-muted: var(--dsw-alias-label-secondary, var(--mv-fb-muted));\n  --mv-faint: var(--dsw-alias-label-tertiary, var(--mv-fb-faint));\n  --mv-border: var(--dsw-alias-border-l2, var(--mv-fb-border));\n  --mv-danger: var(--dsw-alias-state-error-primary, var(--mv-fb-danger));\n  --mv-ok: var(--dsw-alias-state-success-primary, var(--mv-fb-ok));\n  --mv-surface: color-mix(in srgb, var(--mv-text) 4%, var(--mv-bg));\n  --mv-surface-2: color-mix(in srgb, var(--mv-text) 8%, var(--mv-bg));\n  --mv-hover: color-mix(in srgb, var(--mv-text) 10%, var(--mv-bg));\n  --mv-accent-soft: color-mix(in srgb, var(--mv-accent) 16%, var(--mv-bg));\n  --mv-danger-soft: color-mix(in srgb, var(--mv-danger) 10%, var(--mv-bg));\n  --mv-warn-soft: color-mix(in srgb, #f59e0b 16%, var(--mv-bg));\n  --mv-radius: 12px;\n  color-scheme: light;\n  position: relative; isolation: isolate;\n  /* The Harness centre column is `display:flex; flex-direction:column; overflow:hidden`: the panel must be\n     its own scroll container (it fills the column and scrolls; mv-panel.jsx pins the height elsewhere). */\n  flex: 1 1 auto; min-height: 0; height: 100%; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain;\n  box-sizing: border-box; padding: 18px 22px 28px;\n  background: var(--mv-bg); color: var(--mv-text);\n  font-size: 13px; line-height: 20px;\n  font-family: system-ui, -apple-system, "Segoe UI", "Microsoft YaHei UI", "PingFang SC", sans-serif;\n}\n@media (prefers-color-scheme: dark) {\n  .mv-root { --mv-fb-bg: #151517; --mv-fb-text: #eceef2; --mv-fb-muted: #b4b8c2; --mv-fb-faint: #8d919c; --mv-fb-border: rgba(255, 255, 255, .14); --mv-fb-danger: #f97066; --mv-fb-ok: #4ade80; color-scheme: dark; }\n}\nbody[data-ds-dark-theme] .mv-root, .mv-root.mv-dark { --mv-fb-bg: #151517; --mv-fb-text: #eceef2; --mv-fb-muted: #b4b8c2; --mv-fb-faint: #8d919c; --mv-fb-border: rgba(255, 255, 255, .14); --mv-fb-danger: #f97066; --mv-fb-ok: #4ade80; --mv-accent: #ffaf5f; --mv-accent-strong: #ffc285; color-scheme: dark; }\n.mv-root *, .mv-root *::before, .mv-root *::after { box-sizing: border-box; }\n.mv-root :where(button, input, select, textarea) { font: inherit; color: inherit; }\n.mv-root code { font-family: "Cascadia Mono", Consolas, Menlo, monospace; font-size: 12px; }\n.mv-root :focus-visible { outline: 2px solid var(--mv-accent); outline-offset: 2px; }\n\n/* ---- header ---- */\n.mv-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }\n.mv-title { margin: 0; font-size: 20px; line-height: 28px; font-weight: 650; letter-spacing: .2px; }\n.mv-title small { font-size: 12px; font-weight: 400; color: var(--mv-faint); margin-left: 8px; }\n.mv-spacer { flex: 1; }\n.mv-pill { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 999px; font-size: 12px; line-height: 20px; background: var(--mv-surface-2); color: var(--mv-muted); white-space: nowrap; }\n.mv-pill-warn { background: var(--mv-warn-soft); color: var(--mv-text); border: 1px solid color-mix(in srgb, #f59e0b 45%, transparent); }\n.mv-pill-ok { color: var(--mv-ok); }\n.mv-icon-button { width: 30px; height: 30px; display: inline-grid; place-items: center; border-radius: 999px; border: 1px solid var(--mv-border); background: var(--mv-bg); cursor: pointer; padding: 0; color: var(--mv-muted); }\n.mv-icon-button:hover { background: var(--mv-hover); color: var(--mv-text); }\n.mv-icon-button[aria-pressed="true"] { background: var(--mv-accent-soft); color: var(--mv-text); border-color: var(--mv-accent); }\n\n/* ---- popover ---- */\n.mv-pop-anchor { position: relative; display: inline-flex; }\n.mv-popover { position: absolute; right: 0; top: calc(100% + 8px); z-index: 30; width: min(440px, 86vw); padding: 14px 16px; border-radius: var(--mv-radius); background: var(--mv-bg); border: 1px solid var(--mv-border); box-shadow: 0 12px 32px rgba(0, 0, 0, .22); font-size: 12.5px; line-height: 19px; }\n.mv-popover h3 { margin: 0 0 6px; font-size: 13px; }\n.mv-popover p { margin: 6px 0; color: var(--mv-muted); }\n.mv-popover ul { margin: 4px 0 8px; padding-left: 18px; color: var(--mv-muted); }\n.mv-keys { display: grid; grid-template-columns: auto 1fr; gap: 3px 12px; margin: 6px 0; }\n.mv-keys kbd { font-family: "Cascadia Mono", Consolas, monospace; font-size: 11px; padding: 0 6px; border-radius: 4px; border: 1px solid var(--mv-border); background: var(--mv-surface); white-space: nowrap; justify-self: start; }\n\n/* ---- library ---- */\n.mv-section-label { font-size: 12px; font-weight: 600; color: var(--mv-faint); margin: 0 0 8px; letter-spacing: .3px; }\n.mv-library { display: flex; gap: 10px; overflow-x: auto; padding: 2px 2px 8px; margin: 0 -2px 6px; scrollbar-width: thin; }\n.mv-card { flex: 0 0 196px; min-height: 84px; text-align: left; border-radius: var(--mv-radius); border: 1px solid var(--mv-border); background: var(--mv-surface); padding: 10px 12px; cursor: pointer; display: flex; flex-direction: column; gap: 2px; position: relative; }\n.mv-card:hover { background: var(--mv-hover); }\n.mv-card[aria-pressed="true"] { border-color: var(--mv-accent); box-shadow: inset 0 0 0 1px var(--mv-accent); background: var(--mv-accent-soft); }\n.mv-card-art { width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; font-family: "Cascadia Mono", Consolas, monospace; font-size: 13px; font-weight: 700; background: #111; color: #ffaf5f; margin-bottom: 4px; }\n.mv-card-title { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.mv-card-sub { font-size: 12px; color: var(--mv-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.mv-card-ghost { background: transparent; border-style: dashed; color: var(--mv-muted); align-items: center; justify-content: center; text-align: center; flex-basis: 132px; }\n.mv-card-ghost .mv-card-art { background: var(--mv-surface-2); color: var(--mv-text); }\n.mv-card-remove { position: absolute; right: 6px; top: 6px; width: 22px; height: 22px; border-radius: 999px; border: 0; background: transparent; color: var(--mv-faint); cursor: pointer; display: none; }\n.mv-card:hover .mv-card-remove, .mv-card:focus-within .mv-card-remove { display: grid; place-items: center; }\n.mv-card-remove:hover { background: var(--mv-surface-2); color: var(--mv-text); }\n\n/* ---- now playing hero ---- */\n.mv-hero { display: grid; grid-template-columns: 1fr auto; gap: 12px 16px; align-items: center; padding: 14px 16px; border-radius: var(--mv-radius); background: var(--mv-surface); border: 1px solid var(--mv-border); margin-bottom: 14px; }\n.mv-hero-title { font-size: 18px; line-height: 26px; font-weight: 650; margin: 0; }\n.mv-hero-sub { color: var(--mv-muted); margin: 2px 0 0; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }\n.mv-hero-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }\n.mv-segmented { display: inline-flex; padding: 3px; border-radius: 10px; background: var(--mv-surface-2); gap: 2px; }\n.mv-segmented button { border: 0; background: transparent; padding: 5px 12px; border-radius: 8px; cursor: pointer; color: var(--mv-muted); white-space: nowrap; }\n.mv-segmented button:hover:not(:disabled) { color: var(--mv-text); }\n.mv-segmented button[aria-checked="true"] { background: var(--mv-bg); color: var(--mv-text); font-weight: 600; box-shadow: 0 1px 3px rgba(0, 0, 0, .14); }\n.mv-segmented button:disabled { opacity: .45; cursor: not-allowed; }\n.mv-segmented-small button { padding: 3px 10px; font-size: 12px; }\n.mv-play-big { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 20px 0 16px; border-radius: 999px; border: 0; background: var(--mv-accent); color: var(--mv-accent-ink); font-weight: 650; font-size: 14px; cursor: pointer; box-shadow: 0 2px 8px color-mix(in srgb, var(--mv-accent) 40%, transparent); }\n.mv-play-big:hover:not(:disabled) { background: var(--mv-accent-strong); }\n.mv-play-big:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }\n.mv-play-big svg { width: 18px; height: 18px; }\n.mv-hero-hint { grid-column: 1 / -1; margin: 0; font-size: 12px; color: var(--mv-muted); }\n\n/* ---- generic pieces ---- */\n.mv-caption { color: var(--mv-muted); font-size: 12px; margin: 4px 0; }\n.mv-faint { color: var(--mv-faint); }\n.mv-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; line-height: 18px; padding: 1px 8px; border-radius: 999px; background: var(--mv-surface-2); color: var(--mv-muted); white-space: nowrap; }\n.mv-button { display: inline-flex; align-items: center; gap: 6px; height: 30px; border: 1px solid transparent; background: var(--mv-accent); color: var(--mv-accent-ink); border-radius: 8px; padding: 0 12px; cursor: pointer; font-weight: 600; white-space: nowrap; }\n.mv-button:hover:not(:disabled) { background: var(--mv-accent-strong); }\n.mv-button:disabled { opacity: .5; cursor: not-allowed; }\n.mv-button-secondary { background: var(--mv-bg); color: var(--mv-text); border-color: var(--mv-border); font-weight: 500; }\n.mv-button-secondary:hover:not(:disabled) { background: var(--mv-hover); }\n.mv-button-danger { background: var(--mv-bg); color: var(--mv-danger); border-color: color-mix(in srgb, var(--mv-danger) 45%, transparent); font-weight: 500; }\n.mv-button-danger:hover:not(:disabled) { background: var(--mv-danger-soft); }\n.mv-button-small { height: 26px; padding: 0 10px; font-size: 12px; }\n.mv-link { border: 0; background: none; color: var(--mv-accent-strong); cursor: pointer; padding: 0 2px; text-decoration: underline; text-underline-offset: 2px; }\n.mv-link:disabled { opacity: .5; cursor: default; }\n.mv-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }\n.mv-card-box { padding: 14px 16px; border-radius: var(--mv-radius); background: var(--mv-surface); border: 1px solid var(--mv-border); margin: 0 0 12px; }\n.mv-card-box h2 { margin: 0 0 8px; font-size: 14px; line-height: 20px; }\n\n/* Inline status / problems */\n.mv-alert { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 10px; margin: 8px 0; border: 1px solid var(--mv-border); background: var(--mv-bg); }\n.mv-alert-icon { flex: 0 0 auto; width: 20px; height: 20px; border-radius: 999px; display: grid; place-items: center; font-size: 12px; font-weight: 700; margin-top: 1px; }\n.mv-alert-body { flex: 1; min-width: 0; }\n.mv-alert-body p { margin: 0; }\n.mv-alert-body .mv-row { margin-top: 6px; }\n.mv-alert-error { border-color: color-mix(in srgb, var(--mv-danger) 40%, transparent); background: var(--mv-danger-soft); }\n.mv-alert-error .mv-alert-icon { background: var(--mv-danger); color: #fff; }\n.mv-alert-warn { border-color: color-mix(in srgb, #f59e0b 50%, transparent); background: var(--mv-warn-soft); }\n.mv-alert-warn .mv-alert-icon { background: #f59e0b; color: #1b1204; }\n.mv-alert-ok .mv-alert-icon { background: var(--mv-ok); color: #fff; }\n.mv-alert-info .mv-alert-icon { background: var(--mv-surface-2); color: var(--mv-text); }\n.mv-error { color: var(--mv-danger); white-space: pre-wrap; margin: 6px 0; }\n.mv-wrap { word-break: break-all; }\n\n/* Media source rows (canvas) */\n.mv-sources { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px; margin: 0 0 12px; }\n.mv-source { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--mv-border); background: var(--mv-surface); min-width: 0; }\n.mv-source-icon { flex: 0 0 auto; width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; background: var(--mv-surface-2); font-size: 14px; }\n.mv-source-main { flex: 1; min-width: 0; }\n.mv-source-label { font-size: 11.5px; color: var(--mv-faint); line-height: 16px; }\n.mv-source-value { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.mv-source-empty .mv-source-value { color: var(--mv-muted); }\n\n/* Onboarding */\n.mv-onboard { display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: start; padding: 16px; border-radius: var(--mv-radius); border: 1px solid color-mix(in srgb, var(--mv-accent) 45%, transparent); background: var(--mv-accent-soft); margin: 0 0 12px; }\n.mv-onboard h2 { margin: 0 0 4px; font-size: 15px; }\n.mv-onboard ol { margin: 6px 0 10px; padding-left: 18px; color: var(--mv-muted); }\n.mv-onboard-badge { width: 40px; height: 40px; border-radius: 10px; background: #111; color: #ffaf5f; display: grid; place-items: center; font-family: "Cascadia Mono", Consolas, monospace; font-weight: 700; }\n\n/* Stage + player bar */\n.mv-stage-wrap { background: #000; border-radius: var(--mv-radius) var(--mv-radius) 0 0; outline: none; padding: 6px; position: relative; }\n.mv-stage-wrap:focus-visible { box-shadow: 0 0 0 2px var(--mv-accent); }\n.mv-stage { height: min(62vh, 720px); min-height: 340px; resize: vertical; overflow: hidden; display: flex; align-items: center; justify-content: center; }\n.mv-stage canvas { display: block; }\n.mv-fullscreen { border-radius: 0; padding: 0; width: 100vw; height: 100vh; }\n.mv-fullscreen .mv-stage { height: 100vh; resize: none; }\n.mv-playerbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 10px 14px; border: 1px solid var(--mv-border); border-top: 0; border-radius: 0 0 var(--mv-radius) var(--mv-radius); background: var(--mv-surface); margin-bottom: 12px; }\n.mv-round { width: 38px; height: 38px; border-radius: 999px; border: 0; background: var(--mv-accent); color: var(--mv-accent-ink); display: grid; place-items: center; cursor: pointer; flex: 0 0 auto; }\n.mv-round:hover { background: var(--mv-accent-strong); }\n.mv-round svg { width: 18px; height: 18px; }\n.mv-seek-wrap { flex: 1 1 260px; display: flex; align-items: center; gap: 10px; min-width: 200px; }\n.mv-seek { flex: 1; accent-color: var(--mv-accent); }\n.mv-time { font-family: "Cascadia Mono", Consolas, monospace; font-size: 12px; color: var(--mv-muted); white-space: nowrap; font-variant-numeric: tabular-nums; }\n.mv-volume { display: inline-flex; align-items: center; gap: 6px; }\n.mv-volume input { width: 84px; accent-color: var(--mv-accent); }\n.mv-stepper { display: inline-flex; align-items: center; border: 1px solid var(--mv-border); border-radius: 8px; overflow: hidden; background: var(--mv-bg); height: 28px; }\n.mv-stepper button { border: 0; background: transparent; width: 26px; height: 100%; cursor: pointer; color: var(--mv-muted); }\n.mv-stepper button:hover { background: var(--mv-hover); color: var(--mv-text); }\n.mv-stepper span { padding: 0 8px; font-size: 12px; white-space: nowrap; font-variant-numeric: tabular-nums; border-left: 1px solid var(--mv-border); border-right: 1px solid var(--mv-border); line-height: 26px; }\n\n/* Collapsible settings */\n.mv-details { border: 1px solid var(--mv-border); border-radius: var(--mv-radius); background: var(--mv-surface); margin: 0 0 12px; }\n.mv-details > summary { cursor: pointer; padding: 10px 14px; list-style: none; display: flex; align-items: center; gap: 8px; font-weight: 600; user-select: none; }\n.mv-details > summary::-webkit-details-marker { display: none; }\n.mv-details > summary::before { content: "\u25B8"; color: var(--mv-faint); transition: transform .15s; display: inline-block; }\n.mv-details[open] > summary::before { transform: rotate(90deg); }\n.mv-details > summary .mv-caption { font-weight: 400; margin: 0; }\n.mv-details-body { padding: 4px 14px 14px; }\n.mv-form { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px 14px; margin: 6px 0; }\n.mv-field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; min-width: 0; }\n.mv-field > span:first-child { color: var(--mv-muted); }\n.mv-field input, .mv-field select { height: 30px; padding: 0 8px; border-radius: 8px; border: 1px solid var(--mv-border); background: var(--mv-bg); min-width: 0; width: 100%; }\n.mv-field input:disabled { opacity: .55; }\n.mv-field-help { font-size: 11.5px; color: var(--mv-faint); }\n.mv-field-row { display: flex; gap: 6px; }\n.mv-field-row input { flex: 1; }\n.mv-wide { grid-column: 1 / -1; }\n.mv-check { display: inline-flex; gap: 8px; align-items: center; font-size: 12.5px; align-self: end; height: 30px; }\n.mv-check input { accent-color: var(--mv-accent); width: 15px; height: 15px; }\n\n/* Confirmation */\n.mv-confirm { margin: 0 0 12px; padding: 14px 16px; border: 1px solid var(--mv-accent); border-radius: var(--mv-radius); background: var(--mv-bg); box-shadow: 0 6px 24px rgba(0, 0, 0, .12); }\n.mv-confirm > strong { display: block; font-size: 14px; margin-bottom: 6px; }\n.mv-confirm ul { margin: 8px 0; padding-left: 20px; color: var(--mv-muted); }\n.mv-confirm code { word-break: break-all; }\n.mv-cmd { display: block; margin: 8px 0; padding: 8px 10px; border-radius: 8px; background: var(--mv-surface-2); white-space: pre-wrap; word-break: break-all; }\n.mv-argv { margin: 4px 0 6px; padding-left: 24px; font-size: 12px; }\n\n/* Terminal */\n.mv-term-pane { margin: 0 0 12px; }\n.mv-term-screen { height: min(66vh, 740px); min-height: 300px; resize: vertical; overflow: hidden; padding: 6px; background: #000; border-radius: var(--mv-radius) var(--mv-radius) 0 0; }\n.mv-term-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 8px 12px; border: 1px solid var(--mv-border); border-top: 0; border-radius: 0 0 var(--mv-radius) var(--mv-radius); background: var(--mv-surface); }\n.mv-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--mv-ok); display: inline-block; }\n.mv-dot-off { background: var(--mv-faint); }\n.mv-console-list { display: flex; flex-direction: column; gap: 6px; margin: 0 0 12px; }\n.mv-console-item { display: flex; gap: 10px; align-items: center; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--mv-border); background: var(--mv-surface); font-size: 12.5px; }\n.mv-placeholder { display: grid; place-items: center; text-align: center; min-height: 140px; border-radius: var(--mv-radius); border: 1px dashed var(--mv-border); color: var(--mv-muted); background: var(--mv-surface); padding: 24px; margin: 0 0 12px; }\n.mv-placeholder b { color: var(--mv-text); font-size: 14px; }\n\n/* Import dialog */\n.mv-dialog { margin: 0 0 12px; padding: 14px 16px; border-radius: var(--mv-radius); border: 1px solid var(--mv-border); background: var(--mv-bg); box-shadow: 0 6px 24px rgba(0, 0, 0, .12); }\n.mv-dialog h2 { margin: 0 0 6px; font-size: 14px; }\n.mv-hidden { display: none !important; }\n.mv-card-ai { border-color: var(--mv-accent); color: var(--mv-text); flex-basis: 150px; }\n.mv-card-ai .mv-card-art { background: var(--mv-accent-soft); color: var(--mv-accent); }\n.mv-card-ai[aria-expanded="true"] { background: var(--mv-accent-soft); border-style: solid; }\n.mv-ai .mv-form { margin: 8px 0 10px; }\n.mv-ai textarea:disabled { opacity: .6; }\n\n/* 0.5.0 calibration editor + auto stepper + engine card */\n.mv-calib .mv-details-body { outline: none; }\n.mv-calib .mv-details-body:focus-visible { box-shadow: 0 0 0 2px var(--mv-accent); border-radius: 8px; }\n.mv-calib-tools { flex-wrap: wrap; gap: 6px; align-items: center; }\n.mv-calib-offset { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; }\n.mv-calib-offset input { width: 120px; }\n.mv-calib-wave { width: 100%; height: 120px; display: block; border: 1px solid var(--mv-border); border-radius: 8px; margin-top: 8px; touch-action: none; cursor: pointer; }\n.mv-calib-hint { margin: 4px 0 6px; }\n.mv-calib-lines { list-style: none; margin: 0; padding: 0; max-height: 220px; overflow: auto; border: 1px solid var(--mv-border); border-radius: 8px; }\n.mv-calib-lines li { display: flex; gap: 10px; align-items: center; padding: 3px 8px; font-size: 12.5px; cursor: pointer; border-left: 3px solid transparent; }\n.mv-calib-lines li:hover { background: var(--mv-hover); }\n.mv-calib-lines li.mv-uncertain { background: rgba(230, 180, 34, 0.16); border-left-color: #e6b422; }\n.mv-calib-lines li.mv-selected { border-left-color: var(--mv-accent); background: var(--mv-hover); }\n.mv-calib-lines li.mv-active .mv-calib-text { font-weight: 600; }\n.mv-calib-time { font-variant-numeric: tabular-nums; color: var(--mv-muted); min-width: 58px; }\n.mv-calib-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.mv-calib-edit { flex: 1; display: flex; gap: 6px; }\n.mv-calib-edit input { flex: 1; min-width: 0; }\n.mv-calib-flag { color: #b88a00; font-weight: 700; }\n.mv-steps { list-style: none; margin: 8px 0; padding: 0; display: grid; gap: 4px; }\n.mv-steps li { display: flex; gap: 8px; align-items: baseline; font-size: 12.5px; }\n.mv-step-dot { width: 18px; text-align: center; flex: none; }\n.mv-steps li.mv-step-running { font-weight: 600; }\n.mv-steps li.mv-step-failed { color: var(--mv-danger, #d33); }\n.mv-steps li.mv-step-skipped, .mv-steps li.mv-step-pending { color: var(--mv-muted); }\n.mv-engine-card { border: 1px solid var(--mv-border); border-radius: 10px; padding: 10px 12px; display: grid; gap: 6px; }\n.mv-progress { height: 6px; border-radius: 3px; background: var(--mv-border); overflow: hidden; }\n.mv-progress > span { display: block; height: 100%; background: var(--mv-accent); }\n.mv-log { max-height: 110px; overflow: auto; font: 11px/1.4 "Cascadia Mono", Consolas, monospace; white-space: pre-wrap; color: var(--mv-muted); margin: 0; }\n.mv-auto { border: 1px solid var(--mv-border); border-radius: 10px; padding: 10px 12px; display: grid; gap: 6px; margin: 10px 0; }\n.mv-auto .mv-check { height: auto; align-items: flex-start; align-self: auto; }\n.mv-auto .mv-check input { margin-top: 2px; flex: none; }\n.mv-auto .mv-field { min-width: 150px; }\n.mv-stage canvas.mv-pixel { width: 100%; height: 100%; }\n.mv-card-art-dshpv { font-family: var(--mv-mono, monospace); font-size: 13px; letter-spacing: .02em; background: linear-gradient(135deg, #0d1528, #1a2a6c); color: #c4d4ff; }\n\n/* 0.7.0 MV \u521B\u610F\u5DE5\u574A */\n.mv-card-ws .mv-card-art { background: var(--mv-accent-soft); color: var(--mv-accent-strong); }\n.mv-ws { display: flex; flex-direction: column; gap: 10px; }\n.mv-ws-filters { gap: 8px; }\n.mv-ws-filters select, .mv-ws-search { height: 30px; padding: 0 8px; border-radius: 8px; border: 1px solid var(--mv-border); background: var(--mv-bg); color: var(--mv-text); }\n.mv-ws-search { flex: 1 1 220px; min-width: 160px; }\n.mv-ws-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }\n.mv-ws-card { position: relative; text-align: left; display: flex; flex-direction: column; gap: 2px; padding: 8px; border-radius: var(--mv-radius); border: 1px solid var(--mv-border); background: var(--mv-surface); cursor: pointer; color: var(--mv-text); min-width: 0; }\n.mv-ws-card:hover { background: var(--mv-hover); }\n.mv-ws-cover { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: 8px; background: #0a0c10; margin-bottom: 6px; }\n.mv-ws-cover-empty { display: grid; place-items: center; color: #ffaf5f; font-family: "Cascadia Mono", Consolas, monospace; font-weight: 700; font-size: 20px; }\n.mv-ws-badge { position: absolute; top: 14px; right: 14px; font-size: 11px; padding: 1px 8px; border-radius: 999px; background: rgba(10, 12, 16, .78); color: #4ade80; }\n.mv-ws-badge-update { color: #ffaf5f; }\n.mv-ws-detail { display: grid; grid-template-columns: minmax(220px, 380px) 1fr; gap: 16px; align-items: start; }\n@media (max-width: 720px) { .mv-ws-detail { grid-template-columns: 1fr; } }\n.mv-ws-detail-body { min-width: 0; }\n.mv-ws-files { margin: 6px 0; padding-left: 18px; max-height: 140px; overflow: auto; }\n.mv-ws-files code { font-size: 11.5px; }\n.mv-ws-steps { padding-left: 18px; }\n.mv-ws-steps li { margin: 3px 0; }\n.mv-ws-publish { margin-top: 8px; }\na.mv-button { text-decoration: none; }\n\n/* 0.9.0: empty library \u2192 \u521B\u610F\u5DE5\u574A, one-click installs of the former presets, original-work links */\n.mv-empty-lib { display: flex; flex-direction: column; gap: 10px; padding: 14px; border: 1px dashed var(--mv-border); border-radius: var(--mv-radius); background: var(--mv-surface); }\n.mv-empty-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }\n.mv-empty-head > div { flex: 1 1 260px; min-width: 0; }\n.mv-empty-head h3 { margin: 0 0 2px; font-size: 15px; }\n.mv-empty-icon { display: inline-grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: var(--mv-surface-2, var(--mv-hover)); }\n.mv-empty-icon svg { width: 22px; height: 22px; }\n.mv-presets { display: flex; flex-direction: column; gap: 6px; }\n.mv-preset { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--mv-radius); border: 1px solid var(--mv-border); background: var(--mv-bg); min-width: 0; }\n.mv-preset .mv-track-art { flex: none; width: 36px; height: 36px; }\n.mv-preset-main { display: flex; flex-direction: column; min-width: 0; flex: 1; }\n.mv-preset-main .mv-track-artist { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.mv-ws-source a, .mv-preset a { color: var(--mv-accent, inherit); text-decoration: underline; text-underline-offset: 2px; }\n.mv-ws-source-compact { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.mv-canvas-host[hidden] { display: none !important; }\n\n/* 0.9.1: workshop packs that need a newer plugin */\n.mv-chip.mv-chip-warn { background: var(--mv-warn-soft); color: var(--mv-text); box-shadow: inset 0 0 0 1px color-mix(in srgb, #f59e0b 45%, transparent); }\n\n/* 0.9.1: workshop install location */\n.mv-ws-dir { margin-top: 12px; border: 1px solid var(--mv-border); border-radius: var(--mv-radius); background: var(--mv-surface); padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }\n.mv-ws-dir-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1 1 260px; }\n.mv-ws-dir-text code { font-size: 13px; color: var(--mv-text); word-break: break-all; }\n.mv-ws-dir-edit { flex-wrap: wrap; }\n.mv-ws-dir-edit input { flex: 1 1 280px; min-width: 0; }\n.mv-ws-dir-progress { display: flex; align-items: center; gap: 8px; }\n.mv-ws-dir-progress progress { flex: 1 1 auto; accent-color: var(--mv-accent); }\n.mv-ws-dir .mv-alert, .mv-ws-dir [role="alert"] { margin: 0; }\n';

// .dsh-plugin/client/mv-skins.css
var mv_skins_default = `/* 0.8.0 skins. The root gets .mv-skin-{a,b,c} plus .mv-light / .mv-dark (resolved in mv-skin.mjs) and
   .mv-follow when the mode is "auto". Three classes beat the base \`body[data-ds-dark-theme] .mv-root\`.
   Tokens: --mv-page (panel background), --mv-bg (inputs, popovers), --mv-surface (cards), --mv-surface-2
   (chips, tracks), --mv-hover, --mv-text/muted/faint, --mv-border, --mv-accent(-strong/-ink), --mv-shadow.
   Spacing stays on the 4/8/12/16/24 px scale of mv.css. */

/* ---------- picker (all skins) ---------- */
.mv-skin-trigger { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px 0 10px; border-radius: 999px; border: 1px solid var(--mv-border); background: var(--mv-bg); color: var(--mv-muted); cursor: pointer; font-size: 12.5px; }
.mv-skin-trigger:hover, .mv-skin-trigger[aria-expanded="true"] { background: var(--mv-hover); color: var(--mv-text); }
.mv-skin-list { display: grid; gap: 6px; margin: 8px 0 12px; }
.mv-skin-option { display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: center; text-align: left; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--mv-border); background: var(--mv-bg); cursor: pointer; }
.mv-skin-option:hover { background: var(--mv-hover); }
.mv-skin-option[aria-checked="true"] { border-color: var(--mv-accent); box-shadow: inset 0 0 0 1px var(--mv-accent); }
.mv-skin-option b { display: block; font-size: 13px; color: var(--mv-text); }
.mv-skin-option small { display: block; font-size: 12px; line-height: 17px; color: var(--mv-muted); }
.mv-skin-swatch { display: grid; grid-template-columns: repeat(3, 12px); gap: 3px; padding: 6px; border-radius: 8px; }
.mv-skin-swatch i { height: 22px; border-radius: 3px; }
.mv-skin-swatch-c { background: #f9fafb; border: 1px solid #0000001a; } .mv-skin-swatch-c i:nth-child(1) { background: #fff; box-shadow: 0 1px 3px #0002; } .mv-skin-swatch-c i:nth-child(2) { background: #4176e6; } .mv-skin-swatch-c i:nth-child(3) { background: #e4edfd; }
.mv-skin-swatch-a { background: #0a0a0d; } .mv-skin-swatch-a i:nth-child(1) { background: linear-gradient(135deg, #ff375f, #ff9f0a); } .mv-skin-swatch-a i:nth-child(2) { background: linear-gradient(135deg, #5e5ce6, #0a84ff); } .mv-skin-swatch-a i:nth-child(3) { background: #1e1e26; }
.mv-skin-swatch-b { background: #050807; border: 1px solid #2f6b4c; border-radius: 2px; } .mv-skin-swatch-b i { border-radius: 0; } .mv-skin-swatch-b i:nth-child(1) { background: #39ff88; box-shadow: 0 0 6px #39ff88; } .mv-skin-swatch-b i:nth-child(2) { background: #ffb000; } .mv-skin-swatch-b i:nth-child(3) { background: repeating-linear-gradient(0deg, #1d3a2b 0 2px, transparent 2px 4px); }
.mv-skin-mode-label { margin: 0 0 6px !important; font-weight: 600; color: var(--mv-text) !important; }
.mv-hero-art { display: none; }

/* ---------- shared skin plumbing ---------- */
.mv-root[data-mv-skin] { background: var(--mv-page, var(--mv-bg)); }
.mv-root[data-mv-skin] .mv-card, .mv-root[data-mv-skin] .mv-hero, .mv-root[data-mv-skin] .mv-source, .mv-root[data-mv-skin] .mv-details,
.mv-root[data-mv-skin] .mv-card-box, .mv-root[data-mv-skin] .mv-playerbar, .mv-root[data-mv-skin] .mv-dialog, .mv-root[data-mv-skin] .mv-ws-card { box-shadow: var(--mv-shadow, none); }
.mv-root[data-mv-skin] .mv-card-ghost { box-shadow: none; }
.mv-root[data-mv-skin] .mv-stage-wrap { background: var(--mv-stage-bg, #000); }
/* workshop file list: path shrinks with an ellipsis, size + sha stay readable (was overflowing in narrow details) */
.mv-ws-files { list-style: none; padding-left: 0; }
.mv-ws-files li { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 4px 12px; align-items: baseline; padding: 3px 0; border-bottom: 1px solid color-mix(in srgb, var(--mv-border) 60%, transparent); }
.mv-ws-files li > code { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.mv-ws-files .mv-ws-size { white-space: nowrap; font-variant-numeric: tabular-nums; }
.mv-ws-files .mv-ws-sha { font-family: "Cascadia Mono", Consolas, monospace; font-size: 11px; white-space: nowrap; }
@media (max-width: 560px) { .mv-ws-files li { grid-template-columns: minmax(0, 1fr) auto; } .mv-ws-files .mv-ws-sha { grid-column: 1 / -1; } }
.mv-ws-detail-body { overflow-wrap: anywhere; }

/* =====================================================================================
   C \u2014 Harness native (default). DeepSeek Harness tokens; follows them in "auto" mode.
   ===================================================================================== */
.mv-root.mv-skin-c.mv-light {
  --c-page: #f9fafb; --c-bg: #ffffff; --c-surface: #ffffff; --c-surface-2: #f1f3f5; --c-hover: #ebeef2; --c-text: #0f1115; --c-muted: #61666b; --c-faint: #81858c; --c-border: #0000001a;
  --c-accent: #4176e6; --c-accent-strong: #3563c9; --c-danger: #ec1313; --c-ok: #16a34a;
  --mv-shadow: 0 1px 2px #0f11150a, 0 4px 16px #0f11150d; color-scheme: light;
}
.mv-root.mv-skin-c.mv-dark {
  --c-page: #151517; --c-bg: #1b1b1c; --c-surface: #232324; --c-surface-2: #2c2c2e; --c-hover: #353638; --c-text: #f9fafb; --c-muted: #cfd3d6; --c-faint: #adb2b8; --c-border: #ffffff1f;
  --c-accent: #5686fe; --c-accent-strong: #7aaaff; --c-danger: #f25a5a; --c-ok: #4ed17e;
  --mv-shadow: 0 1px 2px #0006, 0 4px 16px #0004; color-scheme: dark;
}
.mv-root.mv-skin-c:is(.mv-light, .mv-dark) {
  --mv-page: var(--c-page); --mv-bg: var(--c-bg); --mv-surface: var(--c-surface); --mv-surface-2: var(--c-surface-2); --mv-hover: var(--c-hover);
  --mv-text: var(--c-text); --mv-muted: var(--c-muted); --mv-faint: var(--c-faint); --mv-border: var(--c-border);
  --mv-accent: var(--c-accent); --mv-accent-strong: var(--c-accent-strong); --mv-accent-ink: #fff; --mv-danger: var(--c-danger); --mv-ok: var(--c-ok);
  --mv-stage-bg: #0f1115; --mv-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI", "PingFang SC", "Microsoft YaHei UI", "Noto Sans CJK SC", sans-serif;
  font-size: 13.5px; padding: 20px 24px 32px;
}
.mv-root.mv-skin-c.mv-follow {
  --mv-page: var(--dsw-specific-sidebar-fill, var(--c-page)); --mv-bg: var(--dsw-alias-bg-layer-1, var(--c-bg)); --mv-surface: var(--dsw-alias-bg-layer-1, var(--c-surface));
  --mv-text: var(--dsw-alias-label-primary, var(--c-text)); --mv-muted: var(--dsw-alias-label-secondary, var(--c-muted)); --mv-faint: var(--dsw-alias-label-tertiary, var(--c-faint));
  --mv-border: var(--dsw-alias-border-l2, var(--c-border)); --mv-hover: var(--dsw-alias-interactive-bg-hover-solid, var(--c-hover));
  --mv-accent: var(--dsw-alias-state-business-primary, var(--c-accent)); --mv-danger: var(--dsw-alias-state-error-primary, var(--c-danger)); --mv-ok: var(--dsw-alias-state-success-primary, var(--c-ok));
}
.mv-skin-c .mv-title { font-weight: 600; }
.mv-skin-c .mv-section-label { font-size: 13px; font-weight: 600; color: var(--mv-text); letter-spacing: 0; margin-bottom: 10px; }
.mv-skin-c .mv-card { border-color: color-mix(in srgb, var(--mv-border) 55%, transparent); flex-basis: 152px; padding: 8px 8px 12px; transition: box-shadow .2s, transform .2s; }
.mv-skin-c .mv-card:hover { background: var(--mv-surface); transform: translateY(-2px); box-shadow: 0 2px 4px #0f11150f, 0 12px 32px #0f11151f; }
.mv-skin-c .mv-card[aria-pressed="true"] { background: var(--mv-surface); box-shadow: 0 0 0 2px var(--mv-accent), var(--mv-shadow); border-color: transparent; }
.mv-skin-c .mv-card:not(.mv-card-ghost) .mv-card-art { width: 100%; height: auto; aspect-ratio: 1; border-radius: 8px; margin-bottom: 8px; font-family: inherit; font-size: 30px; font-weight: 700;
  background: linear-gradient(135deg, hsl(var(--mv-hue, 220) 75% 90%), hsl(calc(var(--mv-hue, 220) + 40) 70% 78%)); color: hsl(var(--mv-hue, 220) 45% 30%); }
.mv-skin-c.mv-dark .mv-card:not(.mv-card-ghost) .mv-card-art { background: linear-gradient(135deg, hsl(var(--mv-hue, 220) 35% 30%), hsl(calc(var(--mv-hue, 220) + 40) 40% 20%)); color: hsl(var(--mv-hue, 220) 80% 86%); }
.mv-skin-c .mv-card-ghost { flex-basis: 132px; border-style: dashed; background: transparent; }
.mv-skin-c .mv-card-ghost .mv-card-art, .mv-skin-c .mv-card-ws .mv-card-art { background: var(--mv-accent-soft); color: var(--mv-accent); width: 40px; height: 40px; border-radius: 12px; }
.mv-skin-c .mv-hero { grid-template-columns: auto 1fr auto; padding: 16px; }
.mv-skin-c .mv-hero-art { display: grid; place-items: center; grid-row: span 2; width: 72px; height: 72px; border-radius: 10px; font-size: 26px; font-weight: 700;
  background: linear-gradient(135deg, hsl(var(--mv-hue, 220) 75% 90%), hsl(calc(var(--mv-hue, 220) + 40) 70% 78%)); color: hsl(var(--mv-hue, 220) 45% 30%); }
.mv-skin-c.mv-dark .mv-hero-art { background: linear-gradient(135deg, hsl(var(--mv-hue, 220) 35% 30%), hsl(calc(var(--mv-hue, 220) + 40) 40% 20%)); color: hsl(var(--mv-hue, 220) 80% 86%); }
.mv-skin-c .mv-hero .mv-section-label { color: var(--mv-accent); font-size: 12px; }
.mv-skin-c .mv-hero-hint { grid-column: 2 / -1; }
.mv-skin-c .mv-play-big, .mv-skin-c .mv-button { border-radius: 8px; font-weight: 500; }
.mv-skin-c .mv-play-big { box-shadow: 0 2px 8px color-mix(in srgb, var(--mv-accent) 35%, transparent); }
.mv-skin-c .mv-button-secondary { box-shadow: 0 1px 0 #0000000a; }
.mv-skin-c .mv-stage-wrap { border-radius: 12px 12px 0 0; padding: 10px; }
.mv-skin-c .mv-playerbar { border-top: 1px solid var(--mv-border); }
.mv-skin-c .mv-chip { border-radius: 6px; }
.mv-skin-c .mv-alert-info { background: var(--mv-accent-soft); border-color: color-mix(in srgb, var(--mv-accent) 22%, transparent); }
.mv-skin-c .mv-ws-card { padding: 0 0 12px; overflow: hidden; border-color: color-mix(in srgb, var(--mv-border) 55%, transparent); transition: box-shadow .2s, transform .2s; }
.mv-skin-c .mv-ws-card > :not(.mv-ws-cover) { padding: 0 12px; }
.mv-skin-c .mv-ws-card .mv-ws-cover { border-radius: 0; margin-bottom: 8px; }
.mv-skin-c .mv-ws-card:hover { background: var(--mv-surface); transform: translateY(-2px); box-shadow: 0 2px 4px #0f11150f, 0 12px 32px #0f11151f; }
.mv-skin-c .mv-ws-badge { top: 8px; right: 8px; }
.mv-skin-c .mv-ws-files { border: 1px solid color-mix(in srgb, var(--mv-border) 60%, transparent); border-radius: 8px; padding: 2px 10px; }
.mv-skin-c .mv-ws-files li:last-child { border-bottom: 0; }

/* =====================================================================================
   A \u2014 modern music app. Vivid gradient covers, big type, pill buttons, sticky player bar.
   ===================================================================================== */
.mv-root.mv-skin-a.mv-dark {
  --mv-page: #0a0a0d; --mv-bg: #121218; --mv-surface: #16161c; --mv-surface-2: #1e1e26; --mv-hover: #23232c; --mv-text: #f5f5f7; --mv-muted: #a7a7b3; --mv-faint: #7c7c88; --mv-border: #ffffff14;
  --mv-accent: #ff375f; --mv-accent-strong: #ff5c7c; --mv-ok: #30d158; --mv-danger: #ff453a; --mv-shadow: 0 10px 30px #0006; color-scheme: dark;
}
.mv-root.mv-skin-a.mv-light {
  --mv-page: #fbfbfd; --mv-bg: #ffffff; --mv-surface: #ffffff; --mv-surface-2: #f2f2f6; --mv-hover: #ececf1; --mv-text: #121216; --mv-muted: #5d5d68; --mv-faint: #80808b; --mv-border: #00000014;
  --mv-accent: #e8174a; --mv-accent-strong: #c90f3c; --mv-ok: #1f9d47; --mv-danger: #d70015; --mv-shadow: 0 8px 24px #0000001a; color-scheme: light;
}
.mv-root.mv-skin-a:is(.mv-light, .mv-dark) {
  --mv-accent-ink: #fff; --mv-radius: 16px; --mv-stage-bg: #07070a;
  font-family: "Inter", "Segoe UI Variable Text", "Segoe UI", "PingFang SC", "Microsoft YaHei UI", "Noto Sans CJK SC", system-ui, sans-serif; font-size: 14px; padding: 0;
}
.mv-skin-a .mv-title { font-size: 28px; line-height: 34px; font-weight: 800; letter-spacing: -.02em; }
.mv-skin-a .mv-section-label { font-size: 20px; line-height: 28px; font-weight: 800; color: var(--mv-text); letter-spacing: -.01em; margin-bottom: 12px; }
.mv-skin-a .mv-library { gap: 16px; padding-bottom: 12px; }
.mv-skin-a .mv-card { flex-basis: 164px; padding: 10px; border: 0; background: transparent; box-shadow: none; border-radius: 16px; transition: background .2s; }
.mv-skin-a .mv-card:hover { background: var(--mv-surface); }
.mv-skin-a .mv-card[aria-pressed="true"] { background: var(--mv-surface); box-shadow: none; }
.mv-skin-a .mv-card[aria-pressed="true"] .mv-card-title { color: var(--mv-accent); }
.mv-skin-a .mv-card:not(.mv-card-ghost) .mv-card-art { position: relative; width: 100%; height: auto; aspect-ratio: 1; border-radius: 12px; margin-bottom: 10px; font-family: inherit; font-size: 36px; font-weight: 800; letter-spacing: -.03em;
  background: radial-gradient(circle at 80% 15%, #ffffff66, transparent 55%), linear-gradient(135deg, hsl(var(--mv-hue, 340) 85% 58%), hsl(calc(var(--mv-hue, 340) + 60) 80% 32%)); color: #fff; box-shadow: 0 8px 24px #0005; }
.mv-skin-a .mv-card:not(.mv-card-ghost) .mv-card-art::after { content: ""; position: absolute; right: 10px; bottom: 10px; width: 40px; height: 40px; border-radius: 50%; background: var(--mv-accent) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 6.5v11l9-5.5z' fill='white'/%3E%3C/svg%3E") center/20px no-repeat; box-shadow: 0 6px 16px #0007; opacity: 0; transform: translateY(6px); transition: .2s; }
.mv-skin-a .mv-card:hover .mv-card-art::after, .mv-skin-a .mv-card:focus-visible .mv-card-art::after { opacity: 1; transform: none; }
.mv-skin-a .mv-card-title { font-weight: 600; }
.mv-skin-a .mv-card-ghost { flex-basis: 132px; border: 2px dashed var(--mv-border); justify-content: center; gap: 6px; }
.mv-skin-a .mv-card-ghost .mv-card-art { width: 48px; height: 48px; border-radius: 50%; background: var(--mv-surface-2); color: var(--mv-text); }
.mv-skin-a .mv-card-ws .mv-card-art, .mv-skin-a .mv-card-ai .mv-card-art { background: linear-gradient(135deg, #ff375f, #ff9f0a); color: #fff; }
.mv-skin-a .mv-hero { position: relative; overflow: hidden; isolation: isolate; grid-template-columns: auto 1fr auto; gap: 8px 24px; padding: 24px; border: 0; border-radius: 24px; color: #fff; min-height: 196px;
  background: radial-gradient(120% 140% at 0% 0%, hsl(var(--mv-hue, 340) 80% 45%), transparent 60%), radial-gradient(90% 120% at 100% 100%, hsl(calc(var(--mv-hue, 340) + 60) 80% 30%), transparent 65%), #111; }
.mv-skin-a .mv-hero::after { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, #0008, #0002); }
.mv-skin-a .mv-hero-art { display: grid; place-items: center; grid-row: span 2; width: 148px; height: 148px; border-radius: 14px; font-size: 48px; font-weight: 800; letter-spacing: -.03em; color: #fff;
  background: radial-gradient(circle at 80% 15%, #ffffff66, transparent 55%), linear-gradient(135deg, hsl(var(--mv-hue, 340) 85% 58%), hsl(calc(var(--mv-hue, 340) + 60) 80% 32%)); box-shadow: 0 18px 40px #0008; }
.mv-skin-a .mv-hero .mv-section-label { font-size: 12px; line-height: 16px; letter-spacing: .08em; text-transform: uppercase; color: #ffffffcc; font-weight: 700; }
.mv-skin-a .mv-hero-title { font-size: 38px; line-height: 44px; font-weight: 800; letter-spacing: -.03em; margin: 4px 0; }
.mv-skin-a .mv-hero-sub { color: #ffffffd0; }
.mv-skin-a .mv-hero .mv-chip { background: #ffffff26; color: #fff; }
.mv-skin-a .mv-hero-hint { grid-column: 2 / -1; color: #ffffffb0; }
.mv-skin-a .mv-play-big { height: 52px; padding: 0 26px 0 20px; font-size: 16px; color: #fff; box-shadow: 0 10px 30px color-mix(in srgb, var(--mv-accent) 50%, transparent); }
.mv-skin-a .mv-play-big:hover:not(:disabled) { transform: scale(1.03); }
.mv-skin-a .mv-button, .mv-skin-a .mv-button-small, .mv-skin-a .mv-field input, .mv-skin-a .mv-field select, .mv-skin-a .mv-ws-search, .mv-skin-a .mv-ws-filters select { border-radius: 999px; }
.mv-skin-a .mv-button-secondary { background: var(--mv-surface-2); border-color: transparent; }
.mv-skin-a .mv-button-secondary:hover:not(:disabled) { background: var(--mv-hover); }
.mv-skin-a .mv-source { border-radius: 14px; border-color: transparent; }
.mv-skin-a .mv-source-icon { border-radius: 10px; background: linear-gradient(135deg, #ff375f, #ff9f0a); color: #fff; }
.mv-skin-a .mv-stage-wrap { border-radius: 20px 20px 0 0; padding: 12px; }
.mv-skin-a .mv-playerbar { border: 0; border-radius: 0 0 20px 20px; padding: 10px 16px; background: var(--mv-surface); }
.mv-skin-a .mv-round { width: 44px; height: 44px; background: var(--mv-text); color: var(--mv-page); }
.mv-skin-a .mv-round:hover { background: var(--mv-text); transform: scale(1.06); }
.mv-skin-a .mv-seek, .mv-skin-a .mv-volume input { accent-color: var(--mv-text); }
.mv-skin-a .mv-details, .mv-skin-a .mv-card-box, .mv-skin-a .mv-dialog, .mv-skin-a .mv-confirm { border-radius: 20px; border-color: transparent; }
.mv-skin-a .mv-details > summary { padding: 14px 18px; font-size: 15px; }
.mv-skin-a .mv-details-body { padding: 4px 18px 18px; }
.mv-skin-a .mv-dialog, .mv-skin-a .mv-confirm { box-shadow: 0 24px 60px #0007; }
.mv-skin-a .mv-dialog h2 { font-size: 20px; line-height: 28px; font-weight: 800; }
.mv-skin-a .mv-ws-grid { gap: 20px 16px; grid-template-columns: repeat(auto-fill, minmax(176px, 1fr)); }
.mv-skin-a .mv-ws-card { border: 0; background: transparent; box-shadow: none; padding: 10px; border-radius: 16px; }
.mv-skin-a .mv-ws-card:hover { background: var(--mv-surface-2); }
.mv-skin-a .mv-ws-cover { aspect-ratio: 1; border-radius: 12px; box-shadow: 0 8px 24px #0005; margin-bottom: 10px; }
.mv-skin-a .mv-ws-badge { top: 18px; left: 18px; right: auto; background: #000a; color: #fff; font-weight: 700; }
.mv-skin-a .mv-ws-badge-update { background: var(--mv-accent); color: #fff; }
.mv-skin-a .mv-ws-detail .mv-ws-cover { aspect-ratio: 1; border-radius: 18px; box-shadow: var(--mv-shadow); }
.mv-skin-a .mv-ws-detail h3 { font-size: 30px; line-height: 36px; font-weight: 800; letter-spacing: -.02em; }
.mv-skin-a .mv-calib-lines, .mv-skin-a .mv-calib-wave { border-radius: 12px; border-color: transparent; background: var(--mv-surface-2); }
.mv-skin-a .mv-calib-lines li.mv-selected { border-left-color: var(--mv-accent); background: var(--mv-accent-soft); }

/* =====================================================================================
   B \u2014 terminal / hacker. One monospace family, border-labelled panels, CRT scanlines.
   Light = paper terminal.
   ===================================================================================== */
.mv-root.mv-skin-b.mv-dark {
  --mv-page: #050807; --mv-bg: #0a0f0d; --mv-surface: #0a0f0d; --mv-surface-2: #0f1613; --mv-hover: #12201a; --mv-text: #c7f5d9; --mv-muted: #86b89a; --mv-faint: #5f8a72; --mv-border: #2f6b4c;
  --mv-accent: #39ff88; --mv-accent-strong: #6dffa8; --mv-accent-ink: #03140a; --mv-ok: #39ff88; --mv-danger: #ff3b5c; --b-amber: #ffb000; --b-glow: 0 0 8px #39ff8866; --b-scan: #00000024; color-scheme: dark;
}
.mv-root.mv-skin-b.mv-light {
  --mv-page: #efe8d6; --mv-bg: #f6f0e1; --mv-surface: #f6f0e1; --mv-surface-2: #ebe3cd; --mv-hover: #e4dac0; --mv-text: #2a2216; --mv-muted: #5e5240; --mv-faint: #8a7a5c; --mv-border: #a8956c;
  --mv-accent: #b43c0b; --mv-accent-strong: #8f2f08; --mv-accent-ink: #fff7ec; --mv-ok: #4d7c0f; --mv-danger: #b91c1c; --b-amber: #9a5b00; --b-glow: none; --b-scan: #7a5a2012; color-scheme: light;
}
.mv-root.mv-skin-b:is(.mv-light, .mv-dark) {
  --mv-radius: 2px; --mv-shadow: none; --mv-stage-bg: #030504;
  font-family: "JetBrains Mono", "Cascadia Mono", "Geist Mono", "IBM Plex Mono", Consolas, "DejaVu Sans Mono", "Noto Sans Mono CJK SC", "Microsoft YaHei UI", monospace; font-size: 13px; letter-spacing: 0;
}
.mv-root.mv-skin-b.mv-light:is(.mv-light) { --mv-stage-bg: #12130f; }
/* CRT scanlines over the UI only: the MV canvas (stage) sits above the overlay, the sticky bars draw their own */
.mv-root.mv-skin-b::after { content: ""; position: absolute; inset: 0; z-index: 20; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent 0 2px, var(--b-scan) 2px 3px), radial-gradient(ellipse at center, transparent 60%, color-mix(in srgb, var(--b-scan) 300%, transparent) 100%); }
.mv-skin-b ::selection { background: var(--mv-accent); color: var(--mv-accent-ink); }
.mv-skin-b .mv-title { font-size: 16px; font-weight: 700; color: var(--mv-accent); text-shadow: var(--b-glow); }
.mv-skin-b .mv-title::before { content: "alice@harness:~/dsh-mv$ "; color: var(--mv-faint); font-weight: 400; text-shadow: none; }
.mv-skin-b .mv-title::after { content: ""; display: inline-block; width: .6em; height: 1.05em; margin-left: 6px; vertical-align: -2px; background: var(--mv-accent); box-shadow: var(--b-glow); animation: mv-b-blink 1s steps(1) infinite; }
@keyframes mv-b-blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .mv-skin-b .mv-title::after { animation: none; } }
.mv-skin-b .mv-section-label { color: var(--mv-accent); font-weight: 700; letter-spacing: .1em; text-transform: uppercase; text-shadow: var(--b-glow); }
.mv-skin-b .mv-section-label::before { content: "\u2524 "; color: var(--mv-border); text-shadow: none; }
.mv-skin-b .mv-section-label::after { content: " \u251C"; color: var(--mv-border); text-shadow: none; }
.mv-skin-b :where(.mv-card, .mv-hero, .mv-source, .mv-details, .mv-card-box, .mv-dialog, .mv-confirm, .mv-ws-card, .mv-alert, .mv-onboard, .mv-popover, .mv-auto, .mv-engine-card, .mv-calib-lines, .mv-calib-wave, .mv-skin-option) { border-radius: 2px; }
.mv-skin-b .mv-card { border-color: var(--mv-border); background: var(--mv-surface); }
.mv-skin-b .mv-card:hover { border-color: var(--mv-accent); box-shadow: var(--b-glow); background: var(--mv-hover); }
.mv-skin-b .mv-card[aria-pressed="true"] { background: var(--mv-accent); color: var(--mv-accent-ink); border-color: var(--mv-accent); box-shadow: var(--b-glow); }
.mv-skin-b .mv-card[aria-pressed="true"] .mv-card-sub { color: var(--mv-accent-ink); opacity: .75; }
.mv-skin-b .mv-card-art { border-radius: 0; background: var(--mv-page); color: var(--mv-accent); border: 1px solid var(--mv-border); text-shadow: var(--b-glow); }
.mv-skin-b .mv-card[aria-pressed="true"] .mv-card-art { background: var(--mv-accent-ink); }
.mv-skin-b .mv-card-ghost { border-style: dashed; }
.mv-skin-b .mv-card-ws .mv-card-art, .mv-skin-b .mv-card-ai .mv-card-art { color: var(--b-amber); }
.mv-skin-b .mv-hero { border-color: var(--mv-border); grid-template-columns: auto 1fr auto; }
.mv-skin-b .mv-hero-art { display: grid; place-items: center; grid-row: span 2; width: 64px; height: 64px; border: 1px solid var(--mv-border); color: var(--mv-accent); font-weight: 700; font-size: 20px; text-shadow: var(--b-glow);
  background: repeating-linear-gradient(0deg, color-mix(in srgb, var(--mv-accent) 10%, transparent) 0 2px, transparent 2px 4px), var(--mv-page); }
.mv-skin-b .mv-hero-hint { grid-column: 2 / -1; }
.mv-skin-b .mv-hero-title { color: var(--mv-accent); text-shadow: var(--b-glow); font-size: 18px; }
.mv-skin-b .mv-chip { border-radius: 0; border: 1px solid var(--mv-border); background: transparent; }
.mv-skin-b .mv-button, .mv-skin-b .mv-play-big, .mv-skin-b .mv-round { border-radius: 2px; text-transform: uppercase; letter-spacing: .04em; font-size: 12px; }
.mv-skin-b .mv-button-secondary, .mv-skin-b .mv-button-danger { background: transparent; border-color: var(--mv-border); }
.mv-skin-b .mv-button-secondary:hover:not(:disabled) { border-color: var(--mv-accent); color: var(--mv-accent); box-shadow: var(--b-glow); background: transparent; }
.mv-skin-b .mv-play-big { box-shadow: var(--b-glow); height: 36px; }
.mv-skin-b .mv-icon-button, .mv-skin-b .mv-skin-trigger, .mv-skin-b .mv-stepper { border-radius: 2px; }
.mv-skin-b .mv-segmented { border-radius: 2px; border: 1px solid var(--mv-border); background: transparent; }
.mv-skin-b .mv-segmented button { border-radius: 0; }
.mv-skin-b .mv-segmented button[aria-checked="true"] { background: var(--mv-accent); color: var(--mv-accent-ink); box-shadow: none; }
.mv-skin-b .mv-field input, .mv-skin-b .mv-field select, .mv-skin-b .mv-ws-search, .mv-skin-b .mv-ws-filters select, .mv-skin-b textarea { border-radius: 0; border-width: 0 0 1px; background: transparent; }
.mv-skin-b .mv-field input:focus, .mv-skin-b .mv-ws-search:focus, .mv-skin-b textarea:focus { outline: none; border-color: var(--mv-accent); background: var(--mv-hover); }
.mv-skin-b .mv-source-icon { border-radius: 0; color: var(--mv-accent); background: transparent; border: 1px solid var(--mv-border); }
.mv-skin-b .mv-stage-wrap { border: 1px solid var(--mv-border); border-bottom: 0; border-radius: 0; }
.mv-skin-b .mv-playerbar { border-radius: 0; border-color: var(--mv-border); background: var(--mv-surface-2); }
.mv-skin-b .mv-round { width: 34px; height: 34px; box-shadow: var(--b-glow); }
.mv-skin-b .mv-time { color: var(--mv-accent); }
.mv-skin-b .mv-details > summary { text-transform: uppercase; letter-spacing: .08em; color: var(--mv-accent); }
.mv-skin-b .mv-details > summary::before { content: "[+]"; }
.mv-skin-b .mv-details[open] > summary::before { content: "[-]"; transform: none; }
.mv-skin-b .mv-dialog, .mv-skin-b .mv-confirm { border-color: var(--mv-accent); box-shadow: 0 0 0 1px var(--mv-page), 0 0 32px color-mix(in srgb, var(--mv-accent) 14%, transparent); }
.mv-skin-b.mv-light .mv-dialog, .mv-skin-b.mv-light .mv-confirm { box-shadow: 5px 5px 0 var(--mv-border); }
.mv-skin-b .mv-dialog h2::before { content: "$ "; color: var(--mv-faint); }
.mv-skin-b .mv-steps .mv-step-dot { width: 52px; text-align: left; }
.mv-skin-b .mv-progress { border-radius: 0; height: 8px; background: repeating-linear-gradient(90deg, var(--mv-border) 0 6px, transparent 6px 8px); }
.mv-skin-b .mv-progress > span { background: repeating-linear-gradient(90deg, var(--b-amber) 0 6px, transparent 6px 8px); }
.mv-skin-b .mv-ws-card { border-color: var(--mv-border); background: var(--mv-surface-2); }
.mv-skin-b .mv-ws-card:hover { border-color: var(--mv-accent); box-shadow: var(--b-glow); background: var(--mv-surface-2); }
.mv-skin-b .mv-ws-cover { border-radius: 0; border: 1px solid var(--mv-border); }
.mv-skin-b .mv-ws-badge { border-radius: 0; background: var(--mv-accent); color: var(--mv-accent-ink); font-weight: 700; letter-spacing: .06em; }
.mv-skin-b .mv-ws-badge-update { background: var(--b-amber); color: #1a1000; }
.mv-skin-b .mv-ws-detail h3 { color: var(--mv-accent); text-shadow: var(--b-glow); }
.mv-skin-b .mv-ws-files { background: var(--mv-surface-2); border: 1px solid var(--mv-border); padding: 4px 10px; }
.mv-skin-b .mv-ws-files li { border-bottom-style: dashed; }
.mv-skin-b .mv-ws-files li::before { content: "-rw-r--r-- "; color: var(--mv-faint); grid-column: 1 / -1; display: none; }
.mv-skin-b .mv-alert-warn { border-color: var(--b-amber); border-style: dashed; }
.mv-skin-b .mv-alert-icon { border-radius: 0; }
.mv-skin-b .mv-calib-lines li.mv-selected { border-left-color: var(--mv-accent); background: var(--mv-hover); }
.mv-skin-b .mv-calib-lines li.mv-uncertain { border-left-color: var(--b-amber); background: color-mix(in srgb, var(--b-amber) 12%, transparent); }
/* B: keep the calibration page compact \u2014 shorter stage while the editor is open, shorter wave and list */
.mv-root.mv-skin-b:has(.mv-calib[open]) .mv-stage { height: min(40vh, 420px); min-height: 240px; }
.mv-skin-b .mv-calib-wave { height: 96px; }
.mv-skin-b .mv-calib-lines { max-height: 168px; }
.mv-skin-b .mv-calib-lines li { padding: 2px 8px; }

/* =====================================================================================
   Structure (mv-shell.jsx): A sidebar + bottom player bar, B tmux tabs + status line, C plain.
   The panel width is a container so narrow Harness panes collapse the chrome.
   ===================================================================================== */
.mv-root[data-mv-skin] { container: mvroot / inline-size; }
.mv-shell, .mv-main { min-width: 0; }
.mv-thumb { display: inline-grid; place-items: center; flex: none; width: 40px; height: 40px; border-radius: 8px; font-weight: 800; font-size: 13px; letter-spacing: -.02em; color: #fff;
  background: radial-gradient(circle at 80% 15%, #ffffff55, transparent 55%), linear-gradient(135deg, hsl(var(--mv-hue, 340) 85% 58%), hsl(calc(var(--mv-hue, 340) + 60) 80% 32%)); }
.mv-thumb-lg { width: 56px; height: 56px; border-radius: 10px; font-size: 18px; box-shadow: 0 6px 16px #0005; }

/* ---------- A: sidebar | main, page-wide player bar ---------- */
.mv-skin-a .mv-shell { display: grid; grid-template-columns: 232px minmax(0, 1fr); grid-template-areas: "side main" "bar bar"; }
.mv-skin-a .mv-side { grid-area: side; border-right: 1px solid var(--mv-border); background: color-mix(in srgb, var(--mv-text) 3%, var(--mv-page)); }
.mv-skin-a.mv-dark .mv-side { background: #000; }
.mv-skin-a .mv-side-in { position: sticky; top: 0; display: flex; flex-direction: column; gap: 2px; max-height: var(--mv-view-h, 100vh); overflow: auto; padding: 20px 12px 24px; box-sizing: border-box; }
.mv-side-brand { display: flex; align-items: center; gap: 10px; padding: 0 8px 18px; }
.mv-side-brand b { display: block; font-size: 15px; line-height: 20px; }
.mv-side-brand small { display: block; font-size: 11.5px; color: var(--mv-faint); }
.mv-side-logo { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; font-weight: 800; color: #fff; background: linear-gradient(135deg, #ff375f, #ff9f0a); box-shadow: 0 6px 16px color-mix(in srgb, #ff375f 40%, transparent); font-family: "Cascadia Mono", Consolas, monospace; font-size: 13px; }
.mv-side-nav { display: grid; gap: 2px; }
.mv-side-item { display: flex; align-items: center; gap: 12px; height: 40px; padding: 0 12px; border: 0; border-radius: 10px; background: transparent; color: var(--mv-muted); font: inherit; font-weight: 600; cursor: pointer; text-align: left; }
.mv-side-item:hover:not(:disabled) { background: var(--mv-hover); color: var(--mv-text); }
.mv-side-item[aria-current="page"] { background: var(--mv-surface-2); color: var(--mv-text); }
.mv-side-item[aria-current="page"] svg { color: var(--mv-accent); }
.mv-side-item:disabled { opacity: .45; cursor: default; }
.mv-side-h { margin: 18px 12px 6px; font-size: 11.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--mv-faint); }
.mv-side-recent { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.mv-side-recent button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 6px 8px; border: 0; border-radius: 10px; background: transparent; color: var(--mv-text); font: inherit; text-align: left; cursor: pointer; }
.mv-side-recent button:hover { background: var(--mv-hover); }
.mv-side-recent button[aria-pressed="true"] { background: var(--mv-surface-2); }
.mv-side-recent button[aria-pressed="true"] b { color: var(--mv-accent); }
.mv-side-recent-text { display: grid; min-width: 0; flex: 1; }
.mv-side-recent-text b, .mv-side-recent-text small, .mv-bar-text b, .mv-bar-text small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mv-side-recent-text b { font-size: 13px; font-weight: 600; }
.mv-side-recent-text small { font-size: 12px; color: var(--mv-faint); }
.mv-eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 14px; }
.mv-eq i { width: 3px; background: var(--mv-accent); border-radius: 1px; animation: mv-eq 0.9s ease-in-out infinite alternate; }
.mv-eq i:nth-child(2) { animation-delay: -.3s; } .mv-eq i:nth-child(3) { animation-delay: -.6s; }
@keyframes mv-eq { from { height: 3px; } to { height: 14px; } }
@media (prefers-reduced-motion: reduce) { .mv-eq i { animation: none; height: 10px; } }
.mv-skin-a .mv-main { grid-area: main; padding: 24px 28px 28px; }
.mv-skin-a .mv-library { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); overflow: visible; gap: 12px 8px; }
.mv-skin-a .mv-library > .mv-card-ghost { aspect-ratio: auto; min-height: 120px; }
.mv-skin-a .mv-hero { background: #111; }
.mv-skin-a .mv-hero::before { content: ""; position: absolute; inset: -30%; z-index: -2; filter: blur(56px) saturate(1.5); opacity: .95;
  background: radial-gradient(circle at 18% 40%, hsl(var(--mv-hue, 340) 85% 58%), transparent 45%), radial-gradient(circle at 60% 70%, hsl(calc(var(--mv-hue, 340) + 60) 80% 40%), transparent 50%), radial-gradient(circle at 85% 20%, hsl(calc(var(--mv-hue, 340) + 120) 70% 45%), transparent 40%); }
.mv-bar { grid-area: bar; position: sticky; bottom: 0; z-index: 30; display: grid; grid-template-columns: minmax(160px, 1fr) minmax(0, 2fr) minmax(60px, 1fr); align-items: center; gap: 16px; padding: 10px 20px;
  border-top: 1px solid var(--mv-border); background: color-mix(in srgb, var(--mv-page) 86%, transparent); backdrop-filter: blur(20px) saturate(1.5); box-shadow: 0 -10px 30px #0004; }
.mv-skin-a.mv-light .mv-bar { box-shadow: 0 -8px 24px #0000000f; }
.mv-bar-now { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 0; border: 0; background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.mv-bar-text { display: grid; min-width: 0; }
.mv-bar-text b { font-size: 14px; font-weight: 700; }
.mv-bar-text small { font-size: 12px; color: var(--mv-muted); }
.mv-bar-mid { display: grid; gap: 4px; justify-items: center; min-width: 0; }
.mv-bar-transport { display: flex; align-items: center; gap: 14px; }
.mv-bar-play { display: grid; place-items: center; width: 40px; height: 40px; border: 0; border-radius: 50%; background: var(--mv-text); color: var(--mv-page); cursor: pointer; transition: transform .15s; }
.mv-bar-play:hover { transform: scale(1.06); }
.mv-bar-play svg { width: 18px; height: 18px; }
.mv-bar-seek { display: flex; align-items: center; gap: 10px; width: 100%; max-width: 620px; }
.mv-bar-seek input { flex: 1; min-width: 0; accent-color: var(--mv-accent); }
.mv-bar-seek .mv-time { font-size: 11.5px; color: var(--mv-muted); font-variant-numeric: tabular-nums; }
.mv-bar-right { justify-self: end; display: flex; gap: 6px; }
@container mvroot (max-width: 860px) {
  .mv-skin-a .mv-shell { grid-template-columns: 64px minmax(0, 1fr); }
  .mv-skin-a .mv-side-in { padding: 16px 8px; align-items: center; }
  .mv-skin-a .mv-side-brand { padding: 0 0 12px; } .mv-skin-a .mv-side-brand > span:last-child, .mv-skin-a .mv-side-item span, .mv-skin-a .mv-side-h, .mv-skin-a .mv-side-recent { display: none; }
  .mv-skin-a .mv-side-item { justify-content: center; width: 44px; padding: 0; }
  .mv-skin-a .mv-main { padding: 18px 18px 24px; }
}
@container mvroot (max-width: 600px) {
  .mv-bar { grid-template-columns: minmax(0, 1fr) auto; gap: 10px; padding: 8px 12px; }
  .mv-bar-mid { grid-column: 1 / -1; grid-row: 2; } .mv-bar-right { grid-row: 1; grid-column: 2; }
  .mv-skin-a .mv-hero-art { width: 96px; height: 96px; font-size: 32px; } .mv-skin-a .mv-hero-title { font-size: 26px; line-height: 32px; }
}

/* ---------- B: tmux window list on top, status line at the bottom ---------- */
.mv-root.mv-skin-b:is(.mv-light, .mv-dark) { padding: 0; }
.mv-skin-b .mv-shell { display: flex; flex-direction: column; }
.mv-skin-b .mv-main { flex: 1; padding: 14px 18px 18px; }
.mv-tmux, .mv-status { position: sticky; z-index: 30; display: flex; align-items: center; min-height: 26px; font-size: 12px; line-height: 26px; white-space: nowrap; overflow: hidden;
  background-image: repeating-linear-gradient(0deg, transparent 0 2px, var(--b-scan) 2px 3px); }
.mv-tmux { top: 0; gap: 2px; padding-right: 8px; background-color: var(--mv-surface-2); border-bottom: 1px solid var(--mv-border); }
.mv-tmux-session { padding: 0 10px; background: var(--mv-accent); color: var(--mv-accent-ink); font-weight: 700; }
.mv-tmux-tab { height: 26px; padding: 0 10px; border: 0; background: transparent; color: var(--mv-muted); font: inherit; cursor: pointer; }
.mv-tmux-tab:hover:not(:disabled) { color: var(--mv-accent); text-shadow: var(--b-glow); }
.mv-tmux-tab[aria-current="page"] { color: var(--mv-accent); font-weight: 700; background: color-mix(in srgb, var(--mv-accent) 14%, transparent); text-shadow: var(--b-glow); }
.mv-tmux-tab:disabled { opacity: .4; cursor: default; }
.mv-status { bottom: 0; gap: 12px; padding-right: 10px; background-color: var(--mv-accent); color: var(--mv-accent-ink); }
.mv-status-mode { display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border: 0; background: var(--mv-accent-ink); color: var(--mv-accent); font: inherit; font-weight: 700; cursor: pointer; }
.mv-status-mode svg { width: 12px; height: 12px; }
.mv-status-title { min-width: 0; overflow: hidden; text-overflow: ellipsis; font-weight: 700; }
.mv-status-title em { font-style: normal; font-weight: 400; opacity: .8; }
.mv-status-bar { letter-spacing: -.5px; }
.mv-status-time, .mv-status-clock { font-variant-numeric: tabular-nums; }
.mv-status-win { padding: 0 8px; background: color-mix(in srgb, var(--mv-accent-ink) 18%, transparent); }
.mv-skin-b .mv-stage-wrap { z-index: 21; }
@container mvroot (max-width: 700px) { .mv-status-bar, .mv-status-win { display: none; } }
@container mvroot (max-width: 480px) { .mv-status-clock { display: none; } .mv-tmux-session { display: none; } }

/* =====================================================================================
   Library list view (0.8.2, default): compact rows + a toolbar for the action tiles.
   ===================================================================================== */
.mv-lib-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.mv-root .mv-lib-head .mv-section-label { margin: 0; }
.mv-lib-count { margin-left: 6px; font-size: 12px; font-weight: 400; letter-spacing: 0; text-transform: none; color: var(--mv-faint); text-shadow: none; }
.mv-lib-layout button { display: inline-flex; align-items: center; gap: 4px; }
.mv-lib-layout svg { width: 14px; height: 14px; }
.mv-lib-tools { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.mv-lib-tool { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px 0 10px; border-radius: 999px; border: 1px solid var(--mv-border); background: var(--mv-surface); color: var(--mv-text); font: inherit; font-size: 12.5px; cursor: pointer; white-space: nowrap; }
.mv-lib-tool:hover:not(:disabled) { background: var(--mv-hover); }
.mv-lib-tool[aria-expanded="true"] { border-color: var(--mv-accent); color: var(--mv-accent); }
.mv-lib-tool:disabled { opacity: .6; cursor: default; }
.mv-lib-tool svg { width: 14px; height: 14px; }
.mv-tracks { display: grid; margin-bottom: 12px; border: 1px solid var(--mv-border); border-radius: var(--mv-radius); background: var(--mv-surface); overflow: hidden; }
.mv-track { display: grid; grid-template-columns: 28px 40px minmax(0, 1fr) auto 48px 64px; align-items: center; gap: 0 12px; min-height: 48px; padding: 4px 12px; box-sizing: border-box;
  border-top: 1px solid color-mix(in srgb, var(--mv-border) 60%, transparent); }
.mv-track:first-child, .mv-track-head + .mv-track { border-top: 0; }
.mv-track-head { display: none; min-height: 30px; font-size: 11.5px; font-weight: 600; color: var(--mv-faint); }
.mv-track:not(.mv-track-head):hover { background: var(--mv-hover); }
.mv-track[aria-current="true"] { background: var(--mv-accent-soft); }
.mv-track-n { text-align: center; font-size: 12px; color: var(--mv-faint); font-variant-numeric: tabular-nums; }
.mv-track-n .mv-eq { justify-content: center; }
.mv-thumb.mv-track-art { width: 40px; height: 40px; border-radius: 6px; font-size: 13px; }
.mv-track-main { display: grid; min-width: 0; padding: 4px 0; border: 0; background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.mv-track-main:focus-visible { outline: 2px solid var(--mv-accent); outline-offset: 2px; border-radius: 4px; }
.mv-track-title, .mv-track-artist { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mv-track-title { font-weight: 600; line-height: 20px; }
.mv-track[aria-current="true"] .mv-track-title { color: var(--mv-accent); }
.mv-track-artist { font-size: 12px; line-height: 16px; color: var(--mv-muted); }
.mv-track-type { padding: 1px 8px; border-radius: 999px; font-size: 11.5px; line-height: 18px; white-space: nowrap; background: var(--mv-surface-2); color: var(--mv-muted); }
.mv-track-type-builtin, .mv-track-type-canvas { color: var(--mv-accent); background: color-mix(in srgb, var(--mv-accent) 12%, transparent); }
.mv-track-head .mv-track-type, .mv-track-head > span { background: none; padding: 0; color: inherit; }
.mv-track-len { text-align: right; font-size: 12px; color: var(--mv-muted); font-variant-numeric: tabular-nums; }
.mv-track-actions { display: flex; justify-content: flex-end; gap: 2px; opacity: 0; transition: opacity .15s; }
.mv-track:hover .mv-track-actions, .mv-track:focus-within .mv-track-actions, .mv-track[aria-current="true"] .mv-track-actions { opacity: 1; }
@media (hover: none) { .mv-track-actions { opacity: 1; } }
.mv-track-actions .mv-icon-button { width: 28px; height: 28px; }
.mv-track-actions svg { width: 14px; height: 14px; }
@container mvroot (max-width: 620px) {
  .mv-track { grid-template-columns: 40px minmax(0, 1fr) 44px 60px; gap: 0 10px; }
  .mv-track-n, .mv-track-type { display: none; }
  .mv-lib-tool span { display: none; } .mv-lib-tool { padding: 0 8px; }
}
/* C: pastel thumbs like the C cards */
.mv-skin-c .mv-thumb { background: linear-gradient(135deg, hsl(var(--mv-hue, 220) 75% 90%), hsl(calc(var(--mv-hue, 220) + 40) 65% 80%)); color: hsl(var(--mv-hue, 220) 45% 32%); }
.mv-skin-c.mv-dark .mv-thumb { background: linear-gradient(135deg, hsl(var(--mv-hue, 220) 35% 30%), hsl(calc(var(--mv-hue, 220) + 40) 40% 20%)); color: hsl(var(--mv-hue, 220) 80% 86%); }
.mv-skin-c .mv-tracks { box-shadow: var(--mv-shadow); border-color: color-mix(in srgb, var(--mv-border) 55%, transparent); }
/* A: music-app track list (no box, header row, rounded hover rows) */
.mv-skin-a .mv-tracks { border: 0; background: transparent; gap: 2px; overflow: visible; }
.mv-skin-a .mv-track { border: 0; border-radius: 10px; min-height: 56px; padding: 6px 12px; grid-template-columns: 28px 44px minmax(0, 1fr) auto 52px 64px; }
.mv-skin-a .mv-track-head { display: grid; min-height: 32px; border-bottom: 1px solid var(--mv-border); border-radius: 0; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
.mv-skin-a .mv-thumb.mv-track-art { width: 44px; height: 44px; border-radius: 8px; }
.mv-skin-a .mv-track[aria-current="true"] { background: var(--mv-surface-2); }
.mv-skin-a .mv-track-type { background: transparent; border: 1px solid var(--mv-border); }
.mv-skin-a .mv-lib-tool { border-color: transparent; background: var(--mv-surface-2); font-weight: 600; }
.mv-skin-a .mv-lib-tool-ws svg, .mv-skin-a .mv-lib-tool-ai svg { color: #ff375f; }
@container mvroot (max-width: 620px) { .mv-skin-a .mv-track { grid-template-columns: 44px minmax(0, 1fr) 44px 60px; } .mv-skin-a .mv-track-head { display: none; } }
/* B: \`ls -l\`-style monospace table */
.mv-skin-b .mv-tracks { border-radius: 0; background: var(--mv-surface); }
.mv-skin-b .mv-track { min-height: 34px; padding: 2px 10px; grid-template-columns: 28px 26px minmax(0, 1fr) auto 52px 64px; border-top-style: dashed; }
.mv-skin-b .mv-track-head { display: grid; min-height: 26px; background: var(--mv-surface-2); color: var(--mv-accent); text-transform: uppercase; letter-spacing: .08em; border-bottom: 1px solid var(--mv-border); }
.mv-skin-b .mv-thumb.mv-track-art { width: 24px; height: 24px; border-radius: 0; font-size: 10px; background: var(--mv-page); color: var(--mv-accent); border: 1px solid var(--mv-border); text-shadow: var(--b-glow); }
.mv-skin-b .mv-track-main { display: flex; gap: 12px; align-items: baseline; }
.mv-skin-b .mv-track-artist::before { content: "\u2014 "; }
.mv-skin-b .mv-track-type { border-radius: 0; background: transparent; padding: 0; color: var(--b-amber); }
.mv-skin-b .mv-track-type::before { content: "["; } .mv-skin-b .mv-track-type::after { content: "]"; }
.mv-skin-b .mv-track-head .mv-track-type::before, .mv-skin-b .mv-track-head .mv-track-type::after { content: none; }
.mv-skin-b .mv-track[aria-current="true"] { background: var(--mv-accent); color: var(--mv-accent-ink); }
.mv-skin-b .mv-track[aria-current="true"] :is(.mv-track-title, .mv-track-artist, .mv-track-len, .mv-track-n, .mv-track-type, .mv-icon-button) { color: var(--mv-accent-ink); text-shadow: none; }
.mv-skin-b .mv-track[aria-current="true"] .mv-eq i { background: var(--mv-accent-ink); }
.mv-skin-b .mv-track[aria-current="true"] .mv-icon-button { background: transparent; border: 1px solid var(--mv-accent-ink); box-shadow: none; }
.mv-skin-b .mv-track:not(.mv-track-head):not([aria-current="true"]):hover { background: var(--mv-hover); box-shadow: inset 2px 0 0 var(--mv-accent); }
.mv-skin-b .mv-lib-tool { border-radius: 0; border-style: dashed; background: transparent; text-transform: uppercase; letter-spacing: .04em; font-size: 12px; }
.mv-skin-b .mv-lib-tool::before { content: "$"; color: var(--mv-faint); }
.mv-skin-b .mv-lib-tool:hover:not(:disabled) { border-color: var(--mv-accent); color: var(--mv-accent); box-shadow: var(--b-glow); background: transparent; }
@container mvroot (max-width: 620px) { .mv-skin-b .mv-track { grid-template-columns: 26px minmax(0, 1fr) 44px 60px; } .mv-skin-b .mv-track-head { display: none; } }

/* Library collapse (0.8.3): chevron in the header; collapsed = header + the current song row */
.mv-lib-collapse { display: inline-grid; place-items: center; flex: none; width: 26px; height: 26px; margin-right: -2px; padding: 0; border: 0; border-radius: 6px; background: transparent; color: var(--mv-muted); cursor: pointer; }
.mv-lib-collapse:hover { background: var(--mv-hover); color: var(--mv-text); }
.mv-lib-collapse:focus-visible { outline: 2px solid var(--mv-accent); outline-offset: 1px; }
.mv-lib-collapse svg { width: 16px; height: 16px; transition: transform .15s; }
.mv-lib-collapse[aria-expanded="false"] svg { transform: rotate(-90deg); }
@media (prefers-reduced-motion: reduce) { .mv-lib-collapse svg { transition: none; } }
.mv-tracks-mini .mv-track-n { color: var(--mv-accent); }
.mv-skin-b .mv-lib-collapse { border-radius: 0; color: var(--mv-accent); }
.mv-skin-a .mv-lib-collapse svg { width: 18px; height: 18px; }
`;

// .dsh-plugin/client/mv-skin-ui.jsx
var import_react8 = __toESM(require("react"), 1);
function readEnv() {
  const body = globalThis.document?.body;
  const inHarness = Boolean(body && (body.hasAttribute("data-ds-dark-theme") || getComputedStyle(body).getPropertyValue("--dsw-alias-bg-base").trim()));
  return { hostDark: inHarness ? body.hasAttribute("data-ds-dark-theme") : null, systemDark: Boolean(globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches) };
}
function useSkin() {
  const [settings, setSettings] = import_react8.default.useState(loadSkin);
  const [env, setEnv] = import_react8.default.useState(readEnv);
  import_react8.default.useEffect(() => {
    const update2 = () => setEnv(readEnv());
    const observer = globalThis.MutationObserver && globalThis.document?.body ? new MutationObserver(update2) : null;
    observer?.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme", "class", "style"] });
    const media = globalThis.matchMedia?.("(prefers-color-scheme: dark)");
    media?.addEventListener?.("change", update2);
    return () => {
      observer?.disconnect();
      media?.removeEventListener?.("change", update2);
    };
  }, []);
  const update = import_react8.default.useCallback((change) => setSettings((current) => saveSkin({ ...current, ...change(current) })), []);
  const mode = settings.modes[settings.skin];
  const className = skinClasses(settings, env);
  import_react8.default.useEffect(() => {
    globalThis.dispatchEvent?.(new Event(SKIN_EVENT));
  }, [className]);
  return {
    settings,
    className,
    dark: resolveDark(mode, env),
    mode,
    setSkin: (skin) => update(() => ({ skin })),
    setMode: (value) => update((current) => ({ modes: { ...current.modes, [current.skin]: value } }))
  };
}
var Swatch = ({ id }) => /* @__PURE__ */ import_react8.default.createElement("span", { className: `mv-skin-swatch mv-skin-swatch-${id}`, "aria-hidden": "true" }, /* @__PURE__ */ import_react8.default.createElement("i", null), /* @__PURE__ */ import_react8.default.createElement("i", null), /* @__PURE__ */ import_react8.default.createElement("i", null));
var PaletteIcon = () => /* @__PURE__ */ import_react8.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react8.default.createElement("path", { d: "M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-1.8a1.7 1.7 0 0 0-1.2 2.9A1.7 1.7 0 0 1 13.8 22z" }), /* @__PURE__ */ import_react8.default.createElement("circle", { cx: "7.5", cy: "10.5", r: "1" }), /* @__PURE__ */ import_react8.default.createElement("circle", { cx: "12", cy: "7", r: "1" }), /* @__PURE__ */ import_react8.default.createElement("circle", { cx: "16.5", cy: "10.5", r: "1" }));
function SkinPicker({ skin }) {
  const current = SKINS.find((s) => s.id === skin.settings.skin);
  return /* @__PURE__ */ import_react8.default.createElement(Popover, { label: "\u5916\u89C2", title: `\u5916\u89C2\uFF1A${current.title}`, className: "mv-skin-trigger", icon: /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement(PaletteIcon, null), /* @__PURE__ */ import_react8.default.createElement("span", null, current.name)) }, /* @__PURE__ */ import_react8.default.createElement("h3", null, "\u5916\u89C2"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "mv-skin-list", role: "radiogroup", "aria-label": "\u76AE\u80A4" }, SKINS.map((s) => /* @__PURE__ */ import_react8.default.createElement("button", { key: s.id, type: "button", role: "radio", "aria-checked": s.id === skin.settings.skin, className: "mv-skin-option", onClick: () => skin.setSkin(s.id) }, /* @__PURE__ */ import_react8.default.createElement(Swatch, { id: s.id }), /* @__PURE__ */ import_react8.default.createElement("span", null, /* @__PURE__ */ import_react8.default.createElement("b", null, s.title), /* @__PURE__ */ import_react8.default.createElement("small", null, s.description))))), /* @__PURE__ */ import_react8.default.createElement("p", { className: "mv-skin-mode-label" }, "\u300C", current.title, "\u300D\u7684\u660E\u6697"), /* @__PURE__ */ import_react8.default.createElement(
    Segmented,
    {
      small: true,
      label: "\u660E\u6697",
      value: skin.mode,
      onChange: skin.setMode,
      options: [{ value: "auto", label: "\u8DDF\u968F Harness / \u7CFB\u7EDF" }, { value: "light", label: current.id === "b" ? "\u6D45\u8272\uFF08\u7EB8\u8D28\uFF09" : "\u6D45\u8272" }, { value: "dark", label: "\u6DF1\u8272" }]
    }
  ), /* @__PURE__ */ import_react8.default.createElement("p", { className: "mv-caption" }, "\u6BCF\u4E2A\u76AE\u80A4\u5206\u522B\u8BB0\u4F4F\u660E\u6697\u8BBE\u7F6E\uFF1B\u53EA\u4FDD\u5B58\u5728\u672C\u673A\u3002"));
}

// .dsh-plugin/client/mv-host-fit.mjs
function clippingAncestor(el, style = (node) => getComputedStyle(node)) {
  for (let node = el?.parentElement; node && node !== node.ownerDocument?.documentElement && node !== node.ownerDocument?.body; node = node.parentElement) {
    const overflow = style(node).overflowY;
    if (overflow !== "visible") return { node, overflow };
  }
  return null;
}
function hostHeight({ overflow, room, rootHeight, pinned }) {
  if (overflow !== "hidden" && overflow !== "clip") return "";
  if (!(room > 120)) return pinned;
  return !pinned && Math.abs(rootHeight - room) <= 1 ? "" : `${Math.floor(room)}px`;
}
function fitToHost(el) {
  if (!el || typeof ResizeObserver === "undefined") return void 0;
  let raf = 0;
  const clip = clippingAncestor(el);
  const fit = () => {
    raf = 0;
    if (clip) {
      if ((clip.overflow === "hidden" || clip.overflow === "clip") && clip.node.scrollTop) clip.node.scrollTop = 0;
      const room = clip.node.getBoundingClientRect().bottom - el.getBoundingClientRect().top;
      const height = hostHeight({ overflow: clip.overflow, room, rootHeight: el.offsetHeight, pinned: el.style.height });
      if (el.style.height !== height) el.style.height = height;
    }
    el.style.setProperty("--mv-view-h", `${el.clientHeight}px`);
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(fit);
  };
  fit();
  const observer = new ResizeObserver(schedule);
  observer.observe(el);
  if (clip) observer.observe(clip.node);
  const onHostScroll = () => {
    if (clip.node.scrollTop) schedule();
  };
  clip?.node.addEventListener("scroll", onHostScroll, { passive: true });
  globalThis.addEventListener("resize", schedule);
  return () => {
    cancelAnimationFrame(raf);
    observer.disconnect();
    clip?.node.removeEventListener("scroll", onHostScroll);
    globalThis.removeEventListener("resize", schedule);
  };
}

// .dsh-plugin/client/mv-shell.jsx
var import_react9 = __toESM(require("react"), 1);
var svg2 = (children, size = 18) => /* @__PURE__ */ import_react9.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, children);
var NavIcon = {
  library: () => svg2(/* @__PURE__ */ import_react9.default.createElement(import_react9.default.Fragment, null, /* @__PURE__ */ import_react9.default.createElement("path", { d: "M4 4v16M8 4v16" }), /* @__PURE__ */ import_react9.default.createElement("path", { d: "M12 5l4-1 4 15-4 1z" }))),
  now: () => svg2(/* @__PURE__ */ import_react9.default.createElement(import_react9.default.Fragment, null, /* @__PURE__ */ import_react9.default.createElement("circle", { cx: "8", cy: "18", r: "3" }), /* @__PURE__ */ import_react9.default.createElement("path", { d: "M11 18V5l9-2v12" }), /* @__PURE__ */ import_react9.default.createElement("circle", { cx: "17", cy: "15", r: "3" }))),
  workshop: () => Icon.shop(),
  ai: () => Icon.spark(),
  calib: () => svg2(/* @__PURE__ */ import_react9.default.createElement("path", { d: "M2 12h2l2-6 3 12 3-9 3 6 2-3h5" })),
  back: () => svg2(/* @__PURE__ */ import_react9.default.createElement(import_react9.default.Fragment, null, /* @__PURE__ */ import_react9.default.createElement("path", { d: "M11 17l-5-5 5-5" }), /* @__PURE__ */ import_react9.default.createElement("path", { d: "M18 17l-5-5 5-5" }))),
  forward: () => svg2(/* @__PURE__ */ import_react9.default.createElement(import_react9.default.Fragment, null, /* @__PURE__ */ import_react9.default.createElement("path", { d: "M13 17l5-5-5-5" }), /* @__PURE__ */ import_react9.default.createElement("path", { d: "M6 17l5-5-5-5" })))
};
var NAV = Object.freeze([
  { id: "library", label: "\u66F2\u5E93", tab: "\u66F2\u5E93" },
  { id: "now", label: "\u6B63\u5728\u64AD\u653E", tab: "\u64AD\u653E" },
  { id: "workshop", label: "\u521B\u610F\u5DE5\u574A", tab: "\u5DE5\u574A" },
  { id: "ai", label: "AI \u5236\u4F5C", tab: "AI \u5236\u4F5C" },
  { id: "calib", label: "\u6B4C\u8BCD\u6821\u51C6", tab: "\u6821\u51C6" }
]);
function useTransport(canvasRef, enabled) {
  const [state, setState] = import_react9.default.useState({ t: 0, duration: 0, playing: false });
  import_react9.default.useEffect(() => {
    if (!enabled) return void 0;
    const read = () => {
      const c = canvasRef.current;
      if (!c?.time) return;
      const next = { t: c.time(), duration: c.duration(), playing: c.playing() };
      setState((prev) => Math.abs(prev.t - next.t) < 0.05 && prev.duration === next.duration && prev.playing === next.playing ? prev : next);
    };
    read();
    const id = setInterval(read, 250);
    return () => clearInterval(id);
  }, [canvasRef, enabled]);
  return state;
}
var Thumb = ({ cover, className = "mv-thumb" }) => /* @__PURE__ */ import_react9.default.createElement("span", { className, style: { "--mv-hue": cover.hue }, "aria-hidden": "true" }, cover.text);
function SideNav({ active, go, calibOk, items, activeId, onSelect, playing }) {
  return /* @__PURE__ */ import_react9.default.createElement("aside", { className: "mv-side", "aria-label": "\u5BFC\u822A" }, /* @__PURE__ */ import_react9.default.createElement("div", { className: "mv-side-in" }, /* @__PURE__ */ import_react9.default.createElement("div", { className: "mv-side-brand" }, /* @__PURE__ */ import_react9.default.createElement("span", { className: "mv-side-logo", "aria-hidden": "true" }, ">_"), /* @__PURE__ */ import_react9.default.createElement("span", null, /* @__PURE__ */ import_react9.default.createElement("b", null, "MV \u653E\u6620\u5BA4"), /* @__PURE__ */ import_react9.default.createElement("small", null, "dsh-mv"))), /* @__PURE__ */ import_react9.default.createElement("nav", { className: "mv-side-nav" }, NAV.map((item) => {
    const Ico = NavIcon[item.id];
    const disabled = item.id === "calib" && !calibOk;
    return /* @__PURE__ */ import_react9.default.createElement(
      "button",
      {
        key: item.id,
        type: "button",
        className: "mv-side-item",
        "aria-current": active === item.id ? "page" : void 0,
        disabled,
        title: disabled ? "\u9009\u62E9\u4E00\u4E2A MV \u5305\uFF08\u975E\u5185\u7F6E\u9884\u8BBE\uFF09\u540E\u53EF\u7528" : item.label,
        onClick: () => go(item.id)
      },
      /* @__PURE__ */ import_react9.default.createElement(Ico, null),
      /* @__PURE__ */ import_react9.default.createElement("span", null, item.label)
    );
  })), /* @__PURE__ */ import_react9.default.createElement("p", { className: "mv-side-h" }, "\u6700\u8FD1\u64AD\u653E"), /* @__PURE__ */ import_react9.default.createElement("ul", { className: "mv-side-recent" }, items.map((item) => /* @__PURE__ */ import_react9.default.createElement("li", { key: item.id }, /* @__PURE__ */ import_react9.default.createElement("button", { type: "button", "aria-pressed": item.id === activeId, title: item.title, onClick: () => onSelect(item.id) }, /* @__PURE__ */ import_react9.default.createElement(Thumb, { cover: item.cover }), /* @__PURE__ */ import_react9.default.createElement("span", { className: "mv-side-recent-text" }, /* @__PURE__ */ import_react9.default.createElement("b", null, item.title), /* @__PURE__ */ import_react9.default.createElement("small", null, item.sub)), item.id === activeId && playing && /* @__PURE__ */ import_react9.default.createElement("span", { className: "mv-eq", "aria-label": "\u64AD\u653E\u4E2D" }, /* @__PURE__ */ import_react9.default.createElement("i", null), /* @__PURE__ */ import_react9.default.createElement("i", null), /* @__PURE__ */ import_react9.default.createElement("i", null))))))));
}
function PlayerBar({ title, artist, cover, transport, canvas, onShow }) {
  const { t, duration, playing } = transport;
  const c = () => canvas();
  return /* @__PURE__ */ import_react9.default.createElement("footer", { className: "mv-bar", "aria-label": "\u64AD\u653E\u6761" }, /* @__PURE__ */ import_react9.default.createElement("button", { type: "button", className: "mv-bar-now", onClick: onShow, title: "\u56DE\u5230\u753B\u9762" }, /* @__PURE__ */ import_react9.default.createElement(Thumb, { cover, className: "mv-thumb mv-thumb-lg" }), /* @__PURE__ */ import_react9.default.createElement("span", { className: "mv-bar-text" }, /* @__PURE__ */ import_react9.default.createElement("b", null, title), /* @__PURE__ */ import_react9.default.createElement("small", null, artist))), /* @__PURE__ */ import_react9.default.createElement("div", { className: "mv-bar-mid" }, /* @__PURE__ */ import_react9.default.createElement("div", { className: "mv-bar-transport" }, /* @__PURE__ */ import_react9.default.createElement("button", { type: "button", className: "mv-icon-button", "aria-label": "\u540E\u9000 5 \u79D2", title: "\u540E\u9000 5 \u79D2", onClick: () => c()?.seekBy(-5) }, /* @__PURE__ */ import_react9.default.createElement(NavIcon.back, null)), /* @__PURE__ */ import_react9.default.createElement("button", { type: "button", className: "mv-bar-play", "aria-label": playing ? "\u6682\u505C" : "\u64AD\u653E", onClick: () => c()?.toggle() }, playing ? /* @__PURE__ */ import_react9.default.createElement(Icon.pause, null) : /* @__PURE__ */ import_react9.default.createElement(Icon.play, null)), /* @__PURE__ */ import_react9.default.createElement("button", { type: "button", className: "mv-icon-button", "aria-label": "\u524D\u8FDB 5 \u79D2", title: "\u524D\u8FDB 5 \u79D2", onClick: () => c()?.seekBy(5) }, /* @__PURE__ */ import_react9.default.createElement(NavIcon.forward, null))), /* @__PURE__ */ import_react9.default.createElement("div", { className: "mv-bar-seek" }, /* @__PURE__ */ import_react9.default.createElement("span", { className: "mv-time" }, fmtTime(t)), /* @__PURE__ */ import_react9.default.createElement(
    "input",
    {
      type: "range",
      min: 0,
      max: Math.max(1, duration),
      step: 0.1,
      value: Math.min(Math.max(0, t), Math.max(1, duration)),
      "aria-label": "\u8FDB\u5EA6\uFF08\u64AD\u653E\u6761\uFF09",
      style: { "--p": `${duration > 0 ? Math.min(100, t / duration * 100) : 0}%` },
      onChange: (event) => c()?.seek(Number(event.target.value))
    }
  ), /* @__PURE__ */ import_react9.default.createElement("span", { className: "mv-time" }, fmtTime(duration)))), /* @__PURE__ */ import_react9.default.createElement("div", { className: "mv-bar-right" }, /* @__PURE__ */ import_react9.default.createElement("button", { type: "button", className: "mv-icon-button", "aria-label": "\u5168\u5C4F", title: "\u5168\u5C4F\uFF08F\uFF09", onClick: () => c()?.fullscreen() }, /* @__PURE__ */ import_react9.default.createElement(Icon.fullscreen, null))));
}
function TmuxTabs({ active, go, calibOk }) {
  return /* @__PURE__ */ import_react9.default.createElement("nav", { className: "mv-tmux", "aria-label": "\u5BFC\u822A" }, /* @__PURE__ */ import_react9.default.createElement("span", { className: "mv-tmux-session" }, "[dsh-mv]"), NAV.map((item, i) => {
    const disabled = item.id === "calib" && !calibOk;
    return /* @__PURE__ */ import_react9.default.createElement(
      "button",
      {
        key: item.id,
        type: "button",
        className: "mv-tmux-tab",
        "aria-current": active === item.id ? "page" : void 0,
        disabled,
        title: disabled ? "\u9009\u62E9\u4E00\u4E2A MV \u5305\uFF08\u975E\u5185\u7F6E\u9884\u8BBE\uFF09\u540E\u53EF\u7528" : item.label,
        onClick: () => go(item.id)
      },
      i,
      ":",
      item.tab,
      active === item.id ? "*" : ""
    );
  }));
}
function StatusLine({ title, artist, transport, canvas, active }) {
  const { t, duration, playing } = transport;
  const [clock, setClock] = import_react9.default.useState(() => /* @__PURE__ */ new Date());
  import_react9.default.useEffect(() => {
    const id = setInterval(() => setClock(/* @__PURE__ */ new Date()), 3e4);
    return () => clearInterval(id);
  }, []);
  const hhmm = `${String(clock.getHours()).padStart(2, "0")}:${String(clock.getMinutes()).padStart(2, "0")}`;
  return /* @__PURE__ */ import_react9.default.createElement("footer", { className: "mv-status", "aria-label": "\u72B6\u6001\u680F" }, /* @__PURE__ */ import_react9.default.createElement("button", { type: "button", className: "mv-status-mode", "aria-pressed": playing, onClick: () => canvas()?.toggle() }, playing ? /* @__PURE__ */ import_react9.default.createElement(Icon.pause, null) : /* @__PURE__ */ import_react9.default.createElement(Icon.play, null), playing ? "PLAYING" : "PAUSED"), /* @__PURE__ */ import_react9.default.createElement("span", { className: "mv-status-title" }, title, /* @__PURE__ */ import_react9.default.createElement("em", null, " \u2014 ", artist)), /* @__PURE__ */ import_react9.default.createElement("span", { className: "mv-status-bar", "aria-hidden": "true" }, asciiBar(t, duration)), /* @__PURE__ */ import_react9.default.createElement("span", { className: "mv-status-time" }, fmtTime(t), "/", fmtTime(duration)), /* @__PURE__ */ import_react9.default.createElement("span", { className: "mv-spacer" }), /* @__PURE__ */ import_react9.default.createElement("span", { className: "mv-status-win" }, NAV.findIndex((item) => item.id === active), ":", NAV.find((item) => item.id === active)?.tab ?? "\u66F2\u5E93"), /* @__PURE__ */ import_react9.default.createElement("span", { className: "mv-status-clock" }, hhmm));
}

// .dsh-plugin/client/mv-panel.jsx
var coverOf = (pack) => pack.moved ? { hue: pack.moved.hue, text: pack.moved.cover } : pack.empty ? { hue: 210, text: "\u266A" } : { hue: coverHue(pack.pack.title), text: coverInitials(pack.pack.title) };
var LEGACY_KEYS = Object.freeze(["dsh-mv.panel.destination", "dsh-mv.panel.tab", "dsh-mv.terminal.form.v1"]);
function clearLegacy(storage = globalThis.localStorage) {
  try {
    for (const key of LEGACY_KEYS) storage?.removeItem(key);
  } catch {
  }
}
function About({ pack }) {
  const credits = [...pack.pack.credits ?? [], pack.pack.notice].filter(Boolean);
  return /* @__PURE__ */ import_react10.default.createElement(import_react10.default.Fragment, null, /* @__PURE__ */ import_react10.default.createElement("h3", null, "\u5173\u4E8E MV \u653E\u6620\u5BA4 ", /* @__PURE__ */ import_react10.default.createElement("span", { className: "mv-faint" }, "v", CLIENT_VERSION || "?")), /* @__PURE__ */ import_react10.default.createElement("p", null, "\u975E\u5B98\u65B9\u540C\u4EBA\u5DE5\u5177\u3002\u63D2\u4EF6", /* @__PURE__ */ import_react10.default.createElement("b", null, "\u4E0D\u9644\u5E26"), "\u4EFB\u4F55\u97F3\u9891\u3001\u89C6\u9891\u6216\u6B4C\u8BCD\uFF0C\u8BF7\u4F7F\u7528\u4F60\u81EA\u5DF1\u7684\u6587\u4EF6\uFF1B\u97F3\u9891\u548C\u6B4C\u8BCD\u53EA\u5728\u672C\u673A\u8BFB\u53D6\uFF0C\u4E0D\u4F1A\u4E0A\u4F20\u3002"), /* @__PURE__ */ import_react10.default.createElement("p", null, "0.9.0 \u8D77\u63D2\u4EF6\u4E0D\u518D\u5185\u7F6E\u4EFB\u4F55 MV\uFF1A\u4EE5\u524D\u7684\u4E24\u4E2A world.execute(me) \u9884\u8BBE\u5DF2\u79FB\u5230\u521B\u610F\u5DE5\u574A\uFF0C\u5206\u522B\u6309\u5404\u81EA\u7684\u8BB8\u53EF\u53D1\u5E03\u2014\u2014\u573A\u666F\u79FB\u690D\u81EA ", /* @__PURE__ */ import_react10.default.createElement("a", { href: "https://github.com/yym8224961/world.execute-me-ascii", target: "_blank", rel: "noreferrer" }, "yym8224961/world.execute-me-ascii"), "\uFF08\u91CE\u751F\u5927K\uFF0C\u7ECF\u539F\u4F5C\u8005\u8BB8\u53EF\uFF09\uFF0Cdsh PV \u79FB\u690D\u81EA ", /* @__PURE__ */ import_react10.default.createElement("a", { href: "https://github.com/MisakaZentai/world-execute-me-dsh-pv", target: "_blank", rel: "noreferrer" }, "MisakaZentai/world-execute-me-dsh-pv"), "\uFF08\u4EE3\u7801 MIT\uFF0C\u9CB8\u9C7C\u5A18\u7ACB\u7ED8 CC BY-NC-SA 4.0\uFF09\u3002\u6B4C\u66F2\u4E0E\u6B4C\u8BCD\u7248\u6743\u5F52 Mili\u3002"), /* @__PURE__ */ import_react10.default.createElement("p", null, "dsh-pv \u6E32\u67D3\u5668\uFF08\u4EE3\u7801 MIT\uFF0C\xA9 MisakaZentai \u7684\u79FB\u690D\uFF09\u4ECD\u5728\u63D2\u4EF6\u91CC\uFF0C\u5B83\u7684\u6570\u636E\u548C\u7ACB\u7ED8\u968F\u5DE5\u574A\u5305\u4E0B\u8F7D\u3002"), !pack.empty && /* @__PURE__ */ import_react10.default.createElement(import_react10.default.Fragment, null, /* @__PURE__ */ import_react10.default.createElement("h3", null, "\u5F53\u524D MV \u5305\uFF1A", pack.pack.title), credits.length > 0 ? /* @__PURE__ */ import_react10.default.createElement("ul", null, credits.map((item) => /* @__PURE__ */ import_react10.default.createElement("li", { key: item }, item))) : /* @__PURE__ */ import_react10.default.createElement("p", null, "\u6E05\u5355\u91CC\u6CA1\u6709\u7F72\u540D\u4FE1\u606F\u3002"), pack.pack.workshop?.source && /* @__PURE__ */ import_react10.default.createElement("p", null, "\u539F\u4F5C\uFF1A", /* @__PURE__ */ import_react10.default.createElement("a", { href: pack.pack.workshop.source, target: "_blank", rel: "noreferrer" }, pack.pack.workshop.source.replace(/^https:\/\/(github\.com\/)?/, ""))), /* @__PURE__ */ import_react10.default.createElement("p", { className: "mv-wrap" }, /* @__PURE__ */ import_react10.default.createElement("code", null, pack.manifestPath))), /* @__PURE__ */ import_react10.default.createElement("p", null, "\u5176\u4ED6\u6B4C\u66F2\uFF1A\u5728\u66F2\u5E93\u91CC\u6253\u5F00\u300C\u521B\u610F\u5DE5\u574A\u300D\u5B89\u88C5\u793E\u533A\u6295\u7A3F\u7684 MV \u5305\uFF08\u4E0D\u542B\u97F3\u9891\u548C\u6B4C\u8BCD\uFF0C\u7528\u4F60\u81EA\u5DF1\u7684\u6587\u4EF6\u64AD\u653E\uFF1B\u811A\u672C\u5728\u6C99\u7BB1\u91CC\u8FD0\u884C\uFF09\uFF0C\u70B9\u300C\u7528 AI \u5236\u4F5C\u65B0 MV\u300D\u8BA9 Harness \u7684 Agent \u5E2E\u4F60\u505A\uFF0C\u6216\u300C\u65B0\u5EFA\uFF08\u6A21\u677F\uFF09\u300D\u624B\u5199\u4E00\u4E2A MV \u5305\u518D\u300C\u5BFC\u5165\u300D\u3002"));
}
function MvPanel({ api, harness = null, initialAi = false, initialWorkshop = false, workshopIndex = null }) {
  const [info, setInfo] = import_react10.default.useState({ status: "loading", value: null, error: "" });
  const [canvasState, setCanvasState] = import_react10.default.useState({ playing: false, hasAudio: false });
  const canvasRef = import_react10.default.useRef(null);
  const skin = useSkin();
  import_react10.default.useEffect(() => {
    clearLegacy();
  }, []);
  const reloadInfo = import_react10.default.useCallback(async () => {
    try {
      const value = await loadInfo(api);
      setInfo({ status: "ready", value, error: "" });
    } catch (error) {
      setInfo({ status: "error", value: null, error: errorText(error, "\u65E0\u6CD5\u8FDE\u63A5 MV \u63D2\u4EF6\u540E\u53F0\u3002") });
    }
  }, [api]);
  import_react10.default.useEffect(() => {
    void reloadInfo();
  }, [reloadInfo]);
  const [pack, setPack] = import_react10.default.useState(() => placeholderPack(loadActive()));
  const [recent, setRecent] = import_react10.default.useState(loadRecent);
  const [packError, setPackError] = import_react10.default.useState("");
  const selectPack = import_react10.default.useCallback(async (id) => {
    setPackError("");
    if (!id.startsWith("pack:")) {
      setPack(placeholderPack(id));
      return;
    }
    try {
      const loaded = await loadPackFromHost(api, id.slice(5));
      setPack(loaded);
      saveActive(loaded.id);
      setRecent(noteDuration(id.slice(5), loaded.pack.duration));
    } catch (error) {
      setPackError(`\u65E0\u6CD5\u8BFB\u53D6 MV \u5305 ${id.slice(5)}\uFF1A${errorText(error, "")}`);
      setPack(EMPTY_PACK);
      saveActive(EMPTY_ID);
    }
  }, [api]);
  import_react10.default.useEffect(() => {
    const id = loadActive();
    if (id.startsWith("pack:")) void selectPack(id);
  }, [selectPack]);
  const onLoaded = (loaded) => {
    setPack(loaded);
    saveActive(loaded.id);
    setPackError("");
  };
  const skinId = skin.settings.skin;
  const rootRef = import_react10.default.useRef(null);
  const transport = useTransport(canvasRef, skinId === "a" || skinId === "b");
  const [navRequest, setNavRequest] = import_react10.default.useState(null);
  const [nav, setNav] = import_react10.default.useState("library");
  import_react10.default.useLayoutEffect(() => fitToHost(rootRef.current), []);
  const calibOk = Boolean(!pack.empty && api?.packWriteText);
  const scrollTo = (selector) => requestAnimationFrame(() => rootRef.current?.querySelector(selector)?.scrollIntoView?.({ block: "start", behavior: "smooth" }));
  const go = (id) => {
    setNav(id);
    if (id === "workshop" || id === "ai" || id === "import") {
      setNavRequest({ view: id });
      scrollTo(".mv-library-section");
      return;
    }
    if (id === "library") {
      setNavRequest({ view: null });
      scrollTo(".mv-library-section");
      return;
    }
    if (id === "now") {
      scrollTo(".mv-hero");
      return;
    }
    if (id === "calib") {
      const el = rootRef.current?.querySelector(".mv-calib");
      if (el) {
        el.open = true;
        scrollTo(".mv-calib");
      }
    }
  };
  const onLibraryView = (view) => {
    if (view) setNav(view);
    else setNav((current) => current === "workshop" || current === "ai" || current === "import" ? "library" : current);
  };
  const cover = coverOf(pack);
  const recentItems = [
    ...recent.map((item) => ({ id: `pack:${item.manifestPath}`, title: item.title || item.manifestPath, sub: item.artist || (item.workshop ? "\u521B\u610F\u5DE5\u574A" : "MV \u5305"), cover: { hue: coverHue(item.title), text: coverInitials(item.title) } }))
  ].slice(0, 6);
  const notice = info.status === "ready" ? versionNotice({ hostVersion: info.value?.hostVersion }) : "";
  const label = canvasState.playing ? "\u6682\u505C" : "\u64AD\u653E";
  const hint = pack.empty ? pack.moved ? `\u300C${pack.moved.title}\u300D\u5DF2\u79FB\u5230\u521B\u610F\u5DE5\u574A\uFF1A\u5728\u4E0A\u9762\u7684\u66F2\u5E93\u91CC\u4E00\u952E\u5B89\u88C5\u3002` : "\u66F2\u5E93\u662F\u7A7A\u7684\uFF1A\u5230\u300C\u521B\u610F\u5DE5\u574A\u300D\u5B89\u88C5\u4E00\u4E2A MV\uFF0C\u6216\u5BFC\u5165\u4F60\u81EA\u5DF1\u7684 MV \u5305\u3002" : canvasState.hasAudio ? "\u753B\u9762\u4EE5\u97F3\u9891\u4E3A\u65F6\u949F\u9010\u5E27\u6E32\u67D3\uFF1B\u70B9\u4E00\u4E0B\u753B\u9762\u540E\u53EF\u7528\u952E\u76D8\u63A7\u5236\u3002" : "\u8FD8\u6CA1\u6709\u9009\u62E9\u97F3\u9891\uFF1A\u53EF\u4EE5\u5148\u9759\u97F3\u89C2\u770B\uFF0C\u6216\u5728\u4E0B\u65B9\u9009\u62E9\u4F60\u7684\u6B4C\u66F2\u3002";
  const renderer = { "world-execute-me": "world.execute(me) \u573A\u666F", "dsh-pv": "dsh-pv\uFF08\u5927\u80A5\u9C7C\u773C\u4E2D\u7684 world.execute(me)\uFF09", script: "\u573A\u666F\u811A\u672C\uFF08scenes.js\uFF09" }[pack.pack.canvas?.renderer] ?? "\u901A\u7528\u753B\u9762\uFF08\u9891\u8C31 + \u6B4C\u8BCD\uFF09";
  return /* @__PURE__ */ import_react10.default.createElement("div", { ref: rootRef, className: `mv-root ${skin.className}`, "data-mv-skin": skinId }, /* @__PURE__ */ import_react10.default.createElement("style", null, mv_default + mv_skins_default), /* @__PURE__ */ import_react10.default.createElement("div", { className: "mv-shell" }, skinId === "a" ? /* @__PURE__ */ import_react10.default.createElement(SideNav, { active: nav, go, calibOk, items: recentItems, activeId: pack.id, onSelect: (id) => void selectPack(id), playing: canvasState.playing }) : null, skinId === "b" ? /* @__PURE__ */ import_react10.default.createElement(TmuxTabs, { active: nav, go, calibOk }) : null, /* @__PURE__ */ import_react10.default.createElement("div", { className: "mv-main" }, /* @__PURE__ */ import_react10.default.createElement("header", { className: "mv-head" }, /* @__PURE__ */ import_react10.default.createElement("h1", { className: "mv-title" }, "MV \u653E\u6620\u5BA4"), /* @__PURE__ */ import_react10.default.createElement("span", { className: "mv-spacer" }), notice && /* @__PURE__ */ import_react10.default.createElement("span", { className: "mv-pill mv-pill-warn", role: "status", title: notice }, "\u26A0 \u540E\u53F0\u7248\u672C\u4E0D\u4E00\u81F4 \xB7 \u8BF7\u5B8C\u5168\u91CD\u542F Harness"), /* @__PURE__ */ import_react10.default.createElement(SkinPicker, { skin }), /* @__PURE__ */ import_react10.default.createElement(Popover, { label: "\u5173\u4E8E\u4E0E\u7248\u6743", icon: /* @__PURE__ */ import_react10.default.createElement(Icon.info, null) }, /* @__PURE__ */ import_react10.default.createElement(About, { pack }))), /* @__PURE__ */ import_react10.default.createElement(Library, { playing: canvasState.playing, onPlay: () => canvasRef.current?.toggle(), onShowPlayer: () => go("now"), navRequest, onView: onLibraryView, api, harness, info: info.value, initialAi, initialWorkshop, workshopIndex, canvas: () => canvasRef.current, active: pack, recent, onSelect: (id) => void selectPack(id), onLoaded, onRecent: setRecent }), packError && /* @__PURE__ */ import_react10.default.createElement(Alert, { kind: "error" }, /* @__PURE__ */ import_react10.default.createElement("p", { className: "mv-wrap" }, packError)), info.status === "error" && /* @__PURE__ */ import_react10.default.createElement(Alert, { kind: "warn" }, /* @__PURE__ */ import_react10.default.createElement("p", { className: "mv-wrap" }, info.error, "\uFF08\u753B\u5E03\u64AD\u653E\u4E0D\u53D7\u5F71\u54CD\uFF1BMV \u5305\u3001AI \u5236\u4F5C\u548C\u6B4C\u8BCD\u5F15\u64CE\u9700\u8981\u540E\u53F0\u3002\uFF09")), /* @__PURE__ */ import_react10.default.createElement("section", { className: "mv-hero", "aria-label": "\u6B63\u5728\u64AD\u653E", style: { "--mv-hue": cover.hue }, "data-cover": cover.text }, /* @__PURE__ */ import_react10.default.createElement("span", { className: "mv-hero-art", "aria-hidden": "true" }, cover.text), /* @__PURE__ */ import_react10.default.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ import_react10.default.createElement("p", { className: "mv-section-label", style: { margin: 0 } }, "\u6B63\u5728\u64AD\u653E"), /* @__PURE__ */ import_react10.default.createElement("h2", { className: "mv-hero-title" }, pack.pack.title), /* @__PURE__ */ import_react10.default.createElement("p", { className: "mv-hero-sub" }, /* @__PURE__ */ import_react10.default.createElement("span", null, pack.empty ? pack.moved ? "\u5DF2\u79FB\u5230\u521B\u610F\u5DE5\u574A" : "\u66F2\u5E93\u4E3A\u7A7A" : pack.pack.artist || "\u672A\u77E5\u827A\u672F\u5BB6"), !pack.empty && /* @__PURE__ */ import_react10.default.createElement("span", { className: "mv-chip" }, pack.pack.workshop ? "\u521B\u610F\u5DE5\u574A" : "MV \u5305"), !pack.empty && /* @__PURE__ */ import_react10.default.createElement("span", { className: "mv-chip" }, renderer))), /* @__PURE__ */ import_react10.default.createElement("div", { className: "mv-hero-actions" }, /* @__PURE__ */ import_react10.default.createElement("button", { type: "button", className: "mv-play-big", disabled: pack.empty, onClick: () => canvasRef.current?.toggle(), "aria-label": label }, canvasState.playing ? /* @__PURE__ */ import_react10.default.createElement(Icon.pause, null) : /* @__PURE__ */ import_react10.default.createElement(Icon.play, null), label)), /* @__PURE__ */ import_react10.default.createElement("p", { className: "mv-hero-hint" }, hint)), /* @__PURE__ */ import_react10.default.createElement("div", { hidden: pack.empty, className: "mv-canvas-host" }, /* @__PURE__ */ import_react10.default.createElement(CanvasMv, { ref: canvasRef, api, pack, defaultFontSize: info.value?.canvasFontSize ?? 14, onState: setCanvasState }))), skinId === "a" ? /* @__PURE__ */ import_react10.default.createElement(PlayerBar, { title: pack.pack.title, artist: pack.empty ? "" : pack.pack.artist || "\u672A\u77E5\u827A\u672F\u5BB6", cover, transport, canvas: () => canvasRef.current, onShow: () => go("now") }) : null, skinId === "b" ? /* @__PURE__ */ import_react10.default.createElement(StatusLine, { title: pack.pack.title, artist: pack.empty ? "" : pack.pack.artist || "\u672A\u77E5\u827A\u672F\u5BB6", transport, canvas: () => canvasRef.current, active: nav }) : null));
}

// .dsh-plugin/shared/mv-ai-upload.mjs
var UPLOAD_ID = /^pack-[0-9a-f]{16,40}$/;
function parsePackUploadBegin(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError("upload request must be an object");
  const extra = Object.keys(value).filter((key) => !["packDir", "role", "bytes"].includes(key));
  if (extra.length) throw new TypeError(`upload request has unexpected fields: ${extra.join(", ")}`);
  if (typeof value.packDir !== "string" || !isAbsolutePackPath(value.packDir) || value.packDir.length > 1024) throw new TypeError("packDir must be an absolute path");
  if (!AI_UPLOAD_ROLES.includes(value.role)) throw new TypeError(`role must be ${AI_UPLOAD_ROLES.join(" / ")}`);
  const max = value.role === "audio" ? MV_PACK_LIMITS.audioBytes : MV_PACK_LIMITS.textFileBytes;
  if (!Number.isInteger(value.bytes) || value.bytes < 1 || value.bytes > max) throw new TypeError(`bytes must be 1..${max}`);
  return { packDir: value.packDir, role: value.role, bytes: value.bytes };
}
function parsePackUploadWrite(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError("upload write must be an object");
  const extra = Object.keys(value).filter((key) => !["uploadId", "offset", "base64"].includes(key));
  if (extra.length) throw new TypeError(`upload write has unexpected fields: ${extra.join(", ")}`);
  if (typeof value.uploadId !== "string" || !UPLOAD_ID.test(value.uploadId)) throw new TypeError("uploadId is invalid");
  if (!Number.isInteger(value.offset) || value.offset < 0 || value.offset > MV_PACK_LIMITS.audioBytes) throw new TypeError("offset is invalid");
  return { uploadId: value.uploadId, offset: value.offset, base64: parseBase64Chunk(value.base64) };
}
function parsePackUploadFinish(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError("upload finish must be an object");
  const extra = Object.keys(value).filter((key) => key !== "uploadId");
  if (extra.length) throw new TypeError(`upload finish has unexpected fields: ${extra.join(", ")}`);
  if (typeof value.uploadId !== "string" || !UPLOAD_ID.test(value.uploadId)) throw new TypeError("uploadId is invalid");
  return { uploadId: value.uploadId };
}

// .dsh-plugin/shared/mv-engine-protocol.mjs
var ENGINE_TORCH = Object.freeze({
  cuda: Object.freeze({ packages: ["torch==2.8.0"], index: "https://download.pytorch.org/whl/cu126", downloadMB: 2780, diskMB: 5860, label: "NVIDIA GPU\uFF08CUDA 12.6\uFF09" }),
  cpu: Object.freeze({ packages: ["torch==2.8.0"], index: "https://download.pytorch.org/whl/cpu", downloadMB: 600, diskMB: 1100, label: "\u4EC5 CPU" })
});
var ENGINE_PACKAGES = Object.freeze(["faster-whisper==1.2.1", "ctranslate2==4.8.2", "demucs==4.1.0", "julius==0.2.8"]);
var ENGINE_PACKAGES_MB = Object.freeze({ downloadMB: 260, diskMB: 700 });
var ENGINE_MODELS = Object.freeze({
  "large-v3": Object.freeze({ downloadMB: 2950, label: "large-v3\uFF08\u6700\u51C6\uFF0CGPU \u63A8\u8350\uFF0C\u7EA6 3 GB\uFF09", vramMB: 4500 }),
  medium: Object.freeze({ downloadMB: 1530, label: "medium\uFF08\u7EA6 1.5 GB\uFF09", vramMB: 2600 }),
  small: Object.freeze({ downloadMB: 470, label: "small\uFF08\u6700\u5FEB\uFF0C\u7EA6 0.5 GB\uFF09", vramMB: 1200 })
});
var ENGINE_LANGUAGES = Object.freeze(["auto", "zh", "ja", "en", "ko", "yue"]);
var ENGINE_LIMITS = Object.freeze({ promptChars: 600, jobEvents: 4e3, installTimeoutMs: 3 * 36e5, runTimeoutMs: 36e5, readWaitMs: 1500 });
var fail4 = (message) => {
  throw new TypeError(message);
};
var obj = (value, subject) => value && typeof value === "object" && !Array.isArray(value) ? value : fail4(`${subject} must be an object`);
var only = (value, keys2, subject) => {
  const extra = Object.keys(value).filter((k) => !keys2.includes(k));
  if (extra.length) fail4(`${subject}: unexpected fields: ${extra.join(", ")}`);
};
var oneOf = (value, list, subject, fallback) => value === void 0 ? fallback : list.includes(value) ? value : fail4(`${subject} must be one of ${list.join(", ")}`);
var bool = (value, subject, fallback) => value === void 0 ? fallback : typeof value === "boolean" ? value : fail4(`${subject} must be a boolean`);
var absPath = (value, subject) => typeof value === "string" && isAbsolutePackPath(value) && value.length < 1e3 ? value : fail4(`${subject} must be an absolute path`);
var jobIdOf = (value) => typeof value === "string" && /^mvjob-[a-f0-9]{12,32}$/.test(value) ? value : fail4("jobId is invalid");
function parseEngineInfo(value = {}) {
  only(obj(value, "engineInfo"), ["refresh"], "engineInfo");
  return { refresh: bool(value.refresh, "refresh", false) };
}
function parseEngineInstall(value) {
  const v = obj(value, "engineInstall");
  only(v, ["confirmed", "profile", "model"], "engineInstall");
  if (v.confirmed !== true) fail4("engineInstall needs confirmed: true");
  return { confirmed: true, profile: oneOf(v.profile, Object.keys(ENGINE_TORCH), "profile", "cuda"), model: oneOf(v.model, Object.keys(ENGINE_MODELS), "model", "large-v3") };
}
function parseEngineModel(value) {
  const v = obj(value, "engineModel");
  only(v, ["confirmed", "model"], "engineModel");
  if (v.confirmed !== true) fail4("engineModel needs confirmed: true");
  return { confirmed: true, model: oneOf(v.model, Object.keys(ENGINE_MODELS), "model", "small") };
}
function parseEngineTranscribe(value) {
  const v = obj(value, "engineTranscribe");
  only(v, ["manifestPath", "model", "language", "separate", "prompt", "device"], "engineTranscribe");
  const prompt = v.prompt === void 0 ? "" : typeof v.prompt === "string" ? v.prompt.slice(0, ENGINE_LIMITS.promptChars) : fail4("prompt must be a string");
  return {
    manifestPath: absPath(v.manifestPath, "manifestPath"),
    model: oneOf(v.model, Object.keys(ENGINE_MODELS), "model", "large-v3"),
    language: oneOf(v.language, ENGINE_LANGUAGES, "language", "auto"),
    separate: bool(v.separate, "separate", true),
    device: oneOf(v.device, ["auto", "cuda", "cpu"], "device", "auto"),
    prompt
  };
}
function parseJobRead(value) {
  const v = obj(value, "jobRead");
  only(v, ["jobId", "cursor", "waitMs"], "jobRead");
  const cursor = v.cursor ?? 0;
  if (!Number.isInteger(cursor) || cursor < 0) fail4("cursor must be a non-negative integer");
  const waitMs = v.waitMs ?? 0;
  if (!Number.isInteger(waitMs) || waitMs < 0 || waitMs > ENGINE_LIMITS.readWaitMs) fail4("waitMs out of range");
  return { jobId: jobIdOf(v.jobId), cursor, waitMs };
}
function parseJobCancel(value) {
  const v = obj(value, "jobCancel");
  only(v, ["jobId"], "jobCancel");
  return { jobId: jobIdOf(v.jobId) };
}

// .dsh-plugin/shared/mv-remote.mjs
var MV_REMOTE_PACKAGE = "@ljwei-stak/dsh-mv-cli";
var MV_REMOTE_NAMESPACE = "dshMv";
function strictCodec(typeSymbol, parse) {
  return Object.freeze({ mode: "strict", typeSymbol, create: () => ({ parse }) });
}
function requestCodec(typeSymbol, parse) {
  return strictCodec(typeSymbol, (value) => {
    parse(value);
    return value;
  });
}
function plainObject(value, subject) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${subject} must be an object`);
  return value;
}
var anyObjectCodec = (name) => strictCodec(`${MV_REMOTE_PACKAGE}#${name}`, (value) => plainObject(value, name));
function descriptor(method, parameters, result) {
  return Object.freeze({
    id: `${MV_REMOTE_PACKAGE}#${MV_REMOTE_NAMESPACE}/${method}`,
    service: MV_REMOTE_NAMESPACE,
    namespace: MV_REMOTE_NAMESPACE,
    method,
    invocation: { kind: "direct" },
    parameters,
    result
  });
}
var jsonParameter = (name, codec) => Object.freeze({ name, wire: name, source: "json", codec });
var MV_REMOTE_DESCRIPTORS = Object.freeze([
  descriptor("info", [], anyObjectCodec("MvInfo")),
  descriptor("packLoad", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvPackLoad`, parsePackLoad))], anyObjectCodec("MvPackLoaded")),
  descriptor("packRead", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvPackRead`, parsePackRead))], anyObjectCodec("MvPackChunk")),
  descriptor("packTemplate", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvPackTemplate`, parseTemplateWrite))], anyObjectCodec("MvPackTemplateWritten")),
  descriptor("audioRead", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvAudioRead`, parseAudioRead))], anyObjectCodec("MvAudioChunk")),
  descriptor("ffmpegInfo", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvFfmpegInfo`, parseFfmpegInfo))], anyObjectCodec("MvFfmpegInfo")),
  descriptor("audioConvert", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvAudioConvert`, parseAudioConvert))], anyObjectCodec("MvAudioConverted")),
  descriptor("aiPackCreate", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvAiPackCreate`, parseAiPackCreate))], anyObjectCodec("MvAiPackCreated")),
  descriptor("packUploadBegin", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvPackUploadBegin`, parsePackUploadBegin))], anyObjectCodec("MvPackUploadBegun")),
  descriptor("packUploadWrite", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvPackUploadWrite`, parsePackUploadWrite))], anyObjectCodec("MvPackUploadWritten")),
  descriptor("packUploadFinish", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvPackUploadFinish`, parsePackUploadFinish))], anyObjectCodec("MvPackUploadFinished")),
  descriptor("lyricsLookup", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvLyricsLookup`, parseLyricsLookup))], anyObjectCodec("MvLyricsLookupResult")),
  descriptor("engineInfo", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvEngineInfo`, parseEngineInfo))], anyObjectCodec("MvEngineInfoResult")),
  descriptor("engineProbe", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvEngineProbe`, parseEngineInfo))], anyObjectCodec("MvEngineProbeResult")),
  descriptor("engineInstall", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvEngineInstall`, parseEngineInstall))], anyObjectCodec("MvEngineInstallResult")),
  descriptor("engineModel", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvEngineModel`, parseEngineModel))], anyObjectCodec("MvEngineModelResult")),
  descriptor("engineTranscribe", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvEngineTranscribe`, parseEngineTranscribe))], anyObjectCodec("MvEngineTranscribeResult")),
  descriptor("jobRead", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvJobRead`, parseJobRead))], anyObjectCodec("MvJobReadResult")),
  descriptor("jobCancel", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvJobCancel`, parseJobCancel))], anyObjectCodec("MvJobCancelResult")),
  descriptor("packWriteText", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvPackWriteText`, parsePackWriteText))], anyObjectCodec("MvPackWriteTextResult")),
  descriptor("analysisRead", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvAnalysisRead`, parseAnalysisRead))], anyObjectCodec("MvAnalysisReadResult")),
  // 0.7.0 MV 创意工坊 (GitHub repository catalogue; downloads checked by sha256; publishing happens on github.com).
  descriptor("workshopIndex", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopIndex`, parseWorkshopIndexRequest))], anyObjectCodec("MvWorkshopIndexResult")),
  descriptor("workshopCover", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopCover`, parseWorkshopId))], anyObjectCodec("MvWorkshopCoverResult")),
  descriptor("workshopInstall", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopInstall`, parseWorkshopId))], anyObjectCodec("MvWorkshopInstallResult")),
  descriptor("workshopUninstall", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopUninstall`, parseWorkshopId))], anyObjectCodec("MvWorkshopUninstallResult")),
  descriptor("workshopInstalled", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopInstalled`, parseWorkshopInstalled))], anyObjectCodec("MvWorkshopInstalledResult")),
  descriptor("workshopPublish", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopPublish`, parseWorkshopPublish))], anyObjectCodec("MvWorkshopPublishResult")),
  descriptor("workshopDirInfo", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopDirInfo`, parseWorkshopDirInfo))], anyObjectCodec("MvWorkshopDirInfoResult")),
  descriptor("workshopDirSet", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopDirSet`, parseWorkshopDirSet))], anyObjectCodec("MvWorkshopDirSetResult")),
  descriptor("workshopDirMove", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopDirMove`, parseWorkshopDirMove))], anyObjectCodec("MvWorkshopDirMoveResult")),
  descriptor("workshopDirOpen", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopDirOpen`, parseWorkshopDirOpen))], anyObjectCodec("MvWorkshopDirOpenResult"))
]);
var MV_CLIENT_REMOTE = Object.freeze({ package: MV_REMOTE_PACKAGE, descriptors: MV_REMOTE_DESCRIPTORS });
var MV_HOST_TYPERT = Object.freeze({
  package: MV_REMOTE_PACKAGE,
  face: "host",
  schemas: [],
  invocations: MV_REMOTE_DESCRIPTORS,
  model: { services: [], events: [], objects: [] }
});

// .dsh-plugin/client/index.jsx
var PLUGIN_NAME = "dsh-mv";
var PANEL = "dsh-mv.main";
var inject = ["remote"];
function MvIcon() {
  return /* @__PURE__ */ import_react11.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ import_react11.default.createElement("rect", { x: "1.5", y: "2.5", width: "13", height: "11", rx: "2", stroke: "currentColor" }), /* @__PURE__ */ import_react11.default.createElement("path", { d: "M4 6l2 2-2 2M7.5 10.5H11", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" }));
}
function panelApi(remote) {
  const service = remote[MV_REMOTE_NAMESPACE];
  return {
    info: () => service.info(),
    packLoad: (request2) => service.packLoad(request2),
    packRead: (request2) => service.packRead(request2),
    packTemplate: (request2) => service.packTemplate(request2),
    audioRead: (request2) => service.audioRead(request2),
    ffmpegInfo: (request2) => service.ffmpegInfo(request2),
    audioConvert: (request2) => service.audioConvert(request2),
    aiPackCreate: (request2) => service.aiPackCreate(request2),
    packUploadBegin: (request2) => service.packUploadBegin(request2),
    packUploadWrite: (request2) => service.packUploadWrite(request2),
    packUploadFinish: (request2) => service.packUploadFinish(request2),
    lyricsLookup: (request2) => service.lyricsLookup(request2),
    engineInfo: (request2) => service.engineInfo(request2),
    engineProbe: (request2) => service.engineProbe(request2),
    engineInstall: (request2) => service.engineInstall(request2),
    engineModel: (request2) => service.engineModel(request2),
    engineTranscribe: (request2) => service.engineTranscribe(request2),
    jobRead: (request2) => service.jobRead(request2),
    jobCancel: (request2) => service.jobCancel(request2),
    packWriteText: (request2) => service.packWriteText(request2),
    analysisRead: (request2) => service.analysisRead(request2),
    workshopIndex: (request2) => service.workshopIndex(request2),
    workshopCover: (request2) => service.workshopCover(request2),
    workshopInstall: (request2) => service.workshopInstall(request2),
    workshopUninstall: (request2) => service.workshopUninstall(request2),
    workshopInstalled: (request2) => service.workshopInstalled(request2),
    workshopPublish: (request2) => service.workshopPublish(request2),
    workshopDirInfo: (request2) => service.workshopDirInfo(request2),
    workshopDirSet: (request2) => service.workshopDirSet(request2),
    workshopDirMove: (request2) => service.workshopDirMove(request2),
    workshopDirOpen: (request2) => service.workshopDirOpen(request2)
  };
}
function harnessServices(ctx) {
  return Object.freeze({
    get(name) {
      if (!["workspaces", "sessions", "uiWorkspace", "remote", "layout"].includes(name)) return void 0;
      try {
        return typeof ctx?.get === "function" ? ctx.get(name) : void 0;
      } catch {
        return void 0;
      }
    }
  });
}
var OPEN_BUTTON = Object.freeze({ border: "1px solid #ffaf5f", background: "transparent", color: "inherit", borderRadius: 6, padding: "3px 10px", cursor: "pointer", font: "inherit", fontSize: 12 });
function OpenMvPanel({ subject, openPanel }) {
  if (subject?.kind !== "bundle" || subject.pkg?.name !== MV_REMOTE_PACKAGE) return null;
  return /* @__PURE__ */ import_react11.default.createElement("button", { type: "button", style: OPEN_BUTTON, onClick: openPanel }, "\u6253\u5F00 MV \u653E\u6620\u5BA4");
}
var UI_INJECT = ["slots", "remote", `remote.${MV_REMOTE_NAMESPACE}`, "layout"];
function registerUi(ctx) {
  const api = Object.freeze(panelApi(ctx.remote));
  const harness = harnessServices(ctx);
  const served = (slot, item, component, label) => ctx.effect(
    () => ctx.slots.inject(slot, () => ctx.slots.register(item, component)),
    `dsh-mv: ${label}`
  );
  served("main", { name: "main", key: PANEL, inject: () => ({ api, harness }) }, MvPanel, "main workspace");
  served("sidebar.panellist", { name: "sidebar.panellist", id: PANEL, order: 60, label: "MV \u653E\u6620\u5BA4" }, MvIcon, "sidebar entry");
  served("plugins.detail.actions", {
    name: "plugins.detail.actions",
    id: "dsh-mv-open-panel",
    order: 40,
    inject: () => ({ openPanel: () => ctx.layout.selectPanel(PANEL) })
  }, OpenMvPanel, "bundle open action");
}
async function apply(ctx) {
  const disposeRemote = await ctx.remote.$mount(MV_CLIENT_REMOTE);
  const ui = ctx.inject(UI_INJECT, registerUi);
  try {
    await ui;
  } catch (error) {
    await ui.dispose?.();
    await disposeRemote?.();
    throw error;
  }
  return async () => {
    await ui.dispose?.();
    await disposeRemote?.();
  };
}
    return module.exports;
  },
});
