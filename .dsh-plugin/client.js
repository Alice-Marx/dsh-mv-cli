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
  inject: () => inject,
  panelApi: () => panelApi,
  registerUi: () => registerUi
});
module.exports = __toCommonJS(index_exports);
var import_react4 = __toESM(require("react"), 1);

// .dsh-plugin/client/mv-panel.jsx
var import_react3 = __toESM(require("react"), 1);

// .dsh-plugin/client/canvas-mv.jsx
var import_react = __toESM(require("react"), 1);

// .dsh-plugin/client/mv/width-table.gen.mjs
var WIDE = [[4352, 4447], [8986, 8987], [9001, 9002], [9193, 9196], [9200, 9200], [9203, 9203], [9725, 9726], [9748, 9749], [9800, 9811], [9855, 9855], [9875, 9875], [9889, 9889], [9898, 9899], [9917, 9918], [9924, 9925], [9934, 9934], [9940, 9940], [9962, 9962], [9970, 9971], [9973, 9973], [9978, 9978], [9981, 9981], [9989, 9989], [9994, 9995], [10024, 10024], [10060, 10060], [10062, 10062], [10067, 10069], [10071, 10071], [10133, 10135], [10160, 10160], [10175, 10175], [11035, 11036], [11088, 11088], [11093, 11093], [11904, 11929], [11931, 12019], [12032, 12245], [12272, 12350], [12353, 12438], [12441, 12543], [12549, 12591], [12593, 12686], [12688, 12771], [12783, 12830], [12832, 12871], [12880, 19903], [19968, 42124], [42128, 42182], [43360, 43388], [44032, 55203], [63744, 64255], [65040, 65049], [65072, 65106], [65108, 65126], [65128, 65131], [65281, 65376], [65504, 65510], [94176, 94180], [94192, 94193], [94208, 100343], [100352, 101589], [101632, 101640], [110576, 110579], [110581, 110587], [110589, 110590], [110592, 110882], [110898, 110898], [110928, 110930], [110933, 110933], [110948, 110951], [110960, 111355], [126980, 126980], [127183, 127183], [127374, 127374], [127377, 127386], [127488, 127490], [127504, 127547], [127552, 127560], [127568, 127569], [127584, 127589], [127744, 127776], [127789, 127797], [127799, 127868], [127870, 127891], [127904, 127946], [127951, 127955], [127968, 127984], [127988, 127988], [127992, 128062], [128064, 128064], [128066, 128252], [128255, 128317], [128331, 128334], [128336, 128359], [128378, 128378], [128405, 128406], [128420, 128420], [128507, 128591], [128640, 128709], [128716, 128716], [128720, 128722], [128725, 128727], [128732, 128735], [128747, 128748], [128756, 128764], [128992, 129003], [129008, 129008], [129292, 129338], [129340, 129349], [129351, 129535], [129648, 129660], [129664, 129672], [129680, 129725], [129727, 129733], [129742, 129755], [129760, 129768], [129776, 129784], [131072, 196605], [196608, 262141]];
var COMBINING = [[768, 846], [848, 879], [1155, 1159], [1425, 1469], [1471, 1471], [1473, 1474], [1476, 1477], [1479, 1479], [1552, 1562], [1611, 1631], [1648, 1648], [1750, 1756], [1759, 1764], [1767, 1768], [1770, 1773], [1809, 1809], [1840, 1866], [2027, 2035], [2045, 2045], [2070, 2073], [2075, 2083], [2085, 2087], [2089, 2093], [2137, 2139], [2200, 2207], [2250, 2273], [2275, 2303], [2364, 2364], [2381, 2381], [2385, 2388], [2492, 2492], [2509, 2509], [2558, 2558], [2620, 2620], [2637, 2637], [2748, 2748], [2765, 2765], [2876, 2876], [2893, 2893], [3021, 3021], [3132, 3132], [3149, 3149], [3157, 3158], [3260, 3260], [3277, 3277], [3387, 3388], [3405, 3405], [3530, 3530], [3640, 3642], [3656, 3659], [3768, 3770], [3784, 3787], [3864, 3865], [3893, 3893], [3895, 3895], [3897, 3897], [3953, 3954], [3956, 3956], [3962, 3965], [3968, 3968], [3970, 3972], [3974, 3975], [4038, 4038], [4151, 4151], [4153, 4154], [4237, 4237], [4957, 4959], [5908, 5909], [5940, 5940], [6098, 6098], [6109, 6109], [6313, 6313], [6457, 6459], [6679, 6680], [6752, 6752], [6773, 6780], [6783, 6783], [6832, 6845], [6847, 6862], [6964, 6964], [6980, 6980], [7019, 7027], [7082, 7083], [7142, 7142], [7154, 7155], [7223, 7223], [7376, 7378], [7380, 7392], [7394, 7400], [7405, 7405], [7412, 7412], [7416, 7417], [7616, 7679], [8400, 8412], [8417, 8417], [8421, 8432], [11503, 11505], [11647, 11647], [11744, 11775], [12330, 12335], [12441, 12442], [42607, 42607], [42612, 42621], [42654, 42655], [42736, 42737], [43014, 43014], [43052, 43052], [43204, 43204], [43232, 43249], [43307, 43309], [43347, 43347], [43443, 43443], [43456, 43456], [43696, 43696], [43698, 43700], [43703, 43704], [43710, 43711], [43713, 43713], [43766, 43766], [44013, 44013], [64286, 64286], [65056, 65071], [66045, 66045], [66272, 66272], [66422, 66426], [68109, 68109], [68111, 68111], [68152, 68154], [68159, 68159], [68325, 68326], [68900, 68903], [69291, 69292], [69373, 69375], [69446, 69456], [69506, 69509], [69702, 69702], [69744, 69744], [69759, 69759], [69817, 69818], [69888, 69890], [69939, 69940], [70003, 70003], [70080, 70080], [70090, 70090], [70197, 70198], [70377, 70378], [70459, 70460], [70477, 70477], [70502, 70508], [70512, 70516], [70722, 70722], [70726, 70726], [70750, 70750], [70850, 70851], [71103, 71104], [71231, 71231], [71350, 71351], [71467, 71467], [71737, 71738], [71997, 71998], [72003, 72003], [72160, 72160], [72244, 72244], [72263, 72263], [72345, 72345], [72767, 72767], [73026, 73026], [73028, 73029], [73111, 73111], [73537, 73538], [92912, 92916], [92976, 92982], [94192, 94193], [113822, 113822], [119141, 119145], [119149, 119154], [119163, 119170], [119173, 119179], [119210, 119213], [119362, 119364], [122880, 122886], [122888, 122904], [122907, 122913], [122915, 122916], [122918, 122922], [123023, 123023], [123184, 123190], [123566, 123566], [123628, 123631], [124140, 124143], [125136, 125142], [125252, 125258]];

// .dsh-plugin/client/mv/pyrt.mjs
var SURROGATE = /[\uD800-\uDFFF]/;
function chars(s15) {
  return SURROGATE.test(s15) ? Array.from(s15) : null;
}
function $key(k2) {
  switch (typeof k2) {
    case "number":
      return "n" + k2;
    case "boolean":
      return "n" + +k2;
    case "string":
      return "s" + k2;
    default:
      if (k2 === null || k2 === void 0) return "N";
      if (Array.isArray(k2)) return "[" + k2.map($key).join(",") + "]";
      throw new TypeError("unhashable key");
  }
}
var PyDict = class {
  constructor(entries = []) {
    this.map = /* @__PURE__ */ new Map();
    for (const [k2, v2] of entries) this.set(k2, v2);
  }
  get size() {
    return this.map.size;
  }
  has(k2) {
    return this.map.has($key(k2));
  }
  get(k2) {
    const e = this.map.get($key(k2));
    if (e === void 0) throw new Error("KeyError: " + String(k2));
    return e[1];
  }
  set(k2, v2) {
    this.map.set($key(k2), [k2, v2]);
  }
  keys() {
    return [...this.map.values()].map((e) => e[0]);
  }
  entries() {
    return [...this.map.values()].map((e) => [e[0], e[1]]);
  }
};
var PySet = class {
  constructor(values = []) {
    this.map = /* @__PURE__ */ new Map();
    for (const v2 of values) this.add(v2);
  }
  get size() {
    return this.map.size;
  }
  has(v2) {
    return this.map.has($key(v2));
  }
  add(v2) {
    this.map.set($key(v2), v2);
  }
  values() {
    return [...this.map.values()];
  }
};
function $iter(x) {
  if (Array.isArray(x)) return x;
  if (typeof x === "string") return chars(x) ?? x.split("");
  if (x instanceof PyDict) return x.keys();
  if (x instanceof PySet) return x.values();
  if (x && typeof x[Symbol.iterator] === "function") return Array.from(x);
  throw new TypeError("object is not iterable");
}
function $unpack(v2, n) {
  const a = Array.isArray(v2) ? v2 : $iter(v2);
  if (a.length !== n) throw new Error(`ValueError: expected ${n} values to unpack, got ${a.length}`);
  return a;
}
function $add(a, b2) {
  if (Array.isArray(a)) return a.concat(b2);
  return a + b2;
}
function $mul(a, b2) {
  const ta2 = typeof a, tb = typeof b2;
  if (ta2 === "number" && tb === "number") return a * b2;
  if (ta2 === "string") return b2 > 0 ? a.repeat(Math.trunc(b2)) : "";
  if (tb === "string") return a > 0 ? b2.repeat(Math.trunc(a)) : "";
  if (Array.isArray(a)) {
    const out = [];
    for (let i8 = 0; i8 < b2; i8++) out.push(...a);
    return out;
  }
  if (Array.isArray(b2)) return $mul(b2, a);
  return a * b2;
}
function $mod(a, b2) {
  const r = a % b2;
  return r !== 0 && r < 0 !== b2 < 0 ? r + b2 : r;
}
var SMALL = (x) => Number.isInteger(x) && x >= -2147483648 && x <= 2147483647;
function $band(a, b2) {
  return SMALL(a) && SMALL(b2) ? a & b2 : Number(BigInt(a) & BigInt(b2));
}
function $bxor(a, b2) {
  return SMALL(a) && SMALL(b2) ? a ^ b2 : Number(BigInt(a) ^ BigInt(b2));
}
function $rshift(a, b2) {
  return SMALL(a) && b2 < 32 ? a >> b2 : Number(BigInt(a) >> BigInt(b2));
}
function hash16(i8) {
  let v2 = i8 + 2654435769 >>> 0;
  v2 = Math.imul((v2 ^ v2 >>> 16) >>> 0, 2146121005) >>> 0;
  v2 = Math.imul((v2 ^ v2 >>> 15) >>> 0, 2221713035) >>> 0;
  return (v2 ^ v2 >>> 16) >>> 0 & 65535;
}
function $eq(a, b2) {
  if (a === b2) return true;
  if (Array.isArray(a) && Array.isArray(b2)) {
    if (a.length !== b2.length) return false;
    for (let i8 = 0; i8 < a.length; i8++) if (!$eq(a[i8], b2[i8])) return false;
    return true;
  }
  if (typeof a === "boolean" || typeof b2 === "boolean") return +a === +b2;
  return false;
}
function $cmp(a, b2) {
  if (Array.isArray(a) && Array.isArray(b2)) {
    const n = Math.min(a.length, b2.length);
    for (let i8 = 0; i8 < n; i8++) {
      const c = $cmp(a[i8], b2[i8]);
      if (c !== 0) return c;
    }
    return a.length - b2.length;
  }
  return a < b2 ? -1 : a > b2 ? 1 : 0;
}
function $in(x, c) {
  if (typeof c === "string") return c.includes(x);
  if (Array.isArray(c)) {
    for (const v2 of c) if ($eq(v2, x)) return true;
    return false;
  }
  if (c instanceof PyDict || c instanceof PySet) return c.has(x);
  if (c && typeof c === "object") return Object.hasOwn(c, x);
  throw new TypeError("argument is not iterable");
}
function index(len, i8) {
  return i8 < 0 ? len + i8 : i8;
}
function $at(o2, i8) {
  if (Array.isArray(o2)) return o2[i8 < 0 ? o2.length + i8 : i8];
  if (typeof o2 === "string") {
    const cs3 = chars(o2);
    if (cs3) return cs3[index(cs3.length, i8)];
    return o2[index(o2.length, i8)];
  }
  if (o2 instanceof PyDict) return o2.get(i8);
  if (o2 === null || o2 === void 0) throw new TypeError("NoneType is not subscriptable");
  return o2[i8];
}
function $setitem(o2, i8, v2) {
  if (Array.isArray(o2)) {
    o2[i8 < 0 ? o2.length + i8 : i8] = v2;
    return;
  }
  if (o2 instanceof PyDict) {
    o2.set(i8, v2);
    return;
  }
  o2[i8] = v2;
}
function sliceBounds(len, lo3, hi2, step) {
  const st3 = step ?? 1;
  if (st3 === 0) throw new Error("slice step cannot be zero");
  const clampIdx = (x, def, lower, upper) => {
    if (x === null || x === void 0) return def;
    let v2 = Math.trunc(x);
    if (v2 < 0) v2 += len;
    return Math.min(Math.max(v2, lower), upper);
  };
  if (st3 > 0) return [clampIdx(lo3, 0, 0, len), clampIdx(hi2, len, 0, len), st3];
  return [clampIdx(lo3, len - 1, -1, len - 1), clampIdx(hi2, -1, -1, len - 1), st3];
}
function $slice(o2, lo3, hi2, step) {
  const isStr = typeof o2 === "string";
  const seq = isStr ? chars(o2) ?? o2 : o2;
  const [a, b2, st3] = sliceBounds(seq.length, lo3, hi2, step);
  if (st3 === 1) {
    const part = seq.slice(a, Math.max(a, b2));
    return isStr && Array.isArray(part) ? part.join("") : part;
  }
  const out = [];
  if (st3 > 0) for (let i8 = a; i8 < b2; i8 += st3) out.push(seq[i8]);
  else for (let i8 = a; i8 > b2; i8 += st3) out.push(seq[i8]);
  return isStr ? out.join("") : out;
}
function $setslice(o2, lo3, hi2, v2) {
  const [a, b2] = sliceBounds(o2.length, lo3, hi2, 1);
  o2.splice(a, Math.max(0, b2 - a), ...$iter(v2));
}
function $truth(x) {
  if (x === null || x === void 0 || x === false) return false;
  if (x === true) return true;
  if (typeof x === "number") return x !== 0 && !Number.isNaN(x);
  if (typeof x === "string" || Array.isArray(x)) return x.length > 0;
  if (x instanceof PyDict || x instanceof PySet) return x.size > 0;
  return true;
}
function $str(v2) {
  if (v2 === null || v2 === void 0) return "None";
  if (v2 === true) return "True";
  if (v2 === false) return "False";
  if (typeof v2 === "number") {
    if (Number.isNaN(v2)) return "nan";
    if (!Number.isFinite(v2)) return v2 > 0 ? "inf" : "-inf";
    return String(v2);
  }
  if (Array.isArray(v2)) return "(" + v2.map((x) => typeof x === "string" ? `'${x}'` : $str(x)).join(", ") + (v2.length === 1 ? ",)" : ")");
  return String(v2);
}
function $fmt(v2, spec) {
  if (!spec) return $str(v2);
  const m = /^(?:(.)?([<>^=]))?([+\- ])?(0)?(\d+)?(?:\.(\d+))?([dfxXseEg%])?$/u.exec(spec);
  if (!m) throw new Error("unsupported format spec " + spec);
  let [, fill, align, sign, zero, width2, prec, type] = m;
  let body;
  const num = typeof v2 === "number" || typeof v2 === "boolean";
  const n = Number(v2);
  if (type === "d") body = String(Math.abs(Math.trunc(n)));
  else if (type === "x" || type === "X") {
    body = Math.abs(Math.trunc(n)).toString(16);
    if (type === "X") body = body.toUpperCase();
  } else if (type === "f") body = Math.abs(n).toFixed(prec === void 0 ? 6 : Number(prec));
  else if (type === "%") body = (Math.abs(n) * 100).toFixed(prec === void 0 ? 6 : Number(prec)) + "%";
  else if (type === "e" || type === "E") {
    body = Math.abs(n).toExponential(prec === void 0 ? 6 : Number(prec)).replace(/e([+-])(\d)$/, "e$10$2");
    if (type === "E") body = body.toUpperCase();
  } else if (num && prec !== void 0) body = Math.abs(n).toFixed(Number(prec));
  else body = num ? $str(Math.abs(n)) : $str(v2);
  let s15 = "";
  if (num) {
    const negative = n < 0 || Object.is(n, -0) && type === "f";
    if (negative && n !== 0) s15 = "-";
    else if (sign === "+") s15 = "+";
    else if (sign === " ") s15 = " ";
  }
  const w = width2 ? Number(width2) : 0;
  if (zero && !align) {
    fill = "0";
    align = "=";
  }
  fill = fill ?? " ";
  align = align ?? (num ? ">" : "<");
  const len = Array.from(s15 + body).length;
  const pad = Math.max(0, w - len);
  if (align === "=") return s15 + fill.repeat(pad) + body;
  if (align === "<") return s15 + body + fill.repeat(pad);
  if (align === "^") {
    const l = Math.floor(pad / 2);
    return fill.repeat(l) + s15 + body + fill.repeat(pad - l);
  }
  return fill.repeat(pad) + s15 + body;
}
function $range(a, b2, s15) {
  let start = 0, stop = a, step = 1;
  if (b2 !== void 0) {
    start = a;
    stop = b2;
  }
  if (s15 !== void 0) step = s15;
  start = $int(start);
  stop = $int(stop);
  const out = [];
  if (step > 0) for (let i8 = start; i8 < stop; i8 += step) out.push(i8);
  else for (let i8 = start; i8 > stop; i8 += step) out.push(i8);
  return out;
}
function $enumerate(it2, start = 0) {
  return $iter(it2).map((v2, i8) => [i8 + start, v2]);
}
function $zip(...its) {
  const arrays = its.map($iter);
  const n = Math.min(...arrays.map((a) => a.length));
  const out = [];
  for (let i8 = 0; i8 < n; i8++) out.push(arrays.map((a) => a[i8]));
  return out;
}
function $sorted(it2) {
  return [...$iter(it2)].sort($cmp);
}
function $sum(it2, start = 0) {
  let s15 = start;
  for (const v2 of $iter(it2)) s15 = $add(s15, v2);
  return s15;
}
function pick(args, better) {
  const list = args.length === 1 ? $iter(args[0]) : args;
  if (list.length === 0) throw new Error("ValueError: arg is an empty sequence");
  let best = list[0];
  for (let i8 = 1; i8 < list.length; i8++) if (better(list[i8], best)) best = list[i8];
  return best;
}
function $min(...args) {
  if (args.length === 2 && typeof args[0] === "number" && typeof args[1] === "number") return args[1] < args[0] ? args[1] : args[0];
  return pick(args, (a, b2) => $cmp(a, b2) < 0);
}
function $max(...args) {
  if (args.length === 2 && typeof args[0] === "number" && typeof args[1] === "number") return args[1] > args[0] ? args[1] : args[0];
  return pick(args, (a, b2) => $cmp(a, b2) > 0);
}
function $len(o2) {
  if (typeof o2 === "string") {
    const cs3 = chars(o2);
    return cs3 ? cs3.length : o2.length;
  }
  if (Array.isArray(o2)) return o2.length;
  if (o2 instanceof PyDict || o2 instanceof PySet) return o2.size;
  throw new TypeError("object has no len()");
}
function $int(v2) {
  if (typeof v2 === "number") {
    if (!Number.isFinite(v2)) throw new Error("cannot convert float to integer");
    return Math.trunc(v2) + 0;
  }
  if (typeof v2 === "boolean") return +v2;
  if (typeof v2 === "string") {
    const n = Number.parseInt(v2.trim(), 10);
    if (Number.isNaN(n)) throw new Error("invalid literal for int()");
    return n;
  }
  throw new TypeError("int() argument");
}
function $round(x, nd) {
  if (nd === void 0 || nd === null) {
    const f = Math.floor(x), d = x - f;
    if (d > 0.5) return f + 1;
    if (d < 0.5) return f;
    return f % 2 === 0 ? f : f + 1;
  }
  const p = 10 ** nd;
  return $round(x * p) / p;
}
function $next(it2, ...fallback) {
  const a = $iter(it2);
  if (a.length) return a[0];
  if (fallback.length) return fallback[0];
  throw new Error("StopIteration");
}
function $chr(n) {
  return String.fromCodePoint(n);
}
function $ord(s15) {
  return s15.codePointAt(0);
}
function $bin(n) {
  return (n < 0 ? "-0b" : "0b") + Math.abs(n).toString(2);
}
function $isinstance(v2, names) {
  return names.some((n) => n === "int" ? Number.isInteger(v2) || typeof v2 === "boolean" : n === "float" ? typeof v2 === "number" : n === "str" ? typeof v2 === "string" : n === "tuple" || n === "list" ? Array.isArray(v2) : n === "dict" ? v2 instanceof PyDict : false);
}
function $join(sep, it2) {
  return $iter(it2).join(sep);
}
function $items(d) {
  return d instanceof PyDict ? d.entries() : Object.entries(d);
}
function $get(o2, k2, d = null) {
  if (o2 instanceof PyDict) return o2.has(k2) ? o2.get(k2) : d;
  return Object.hasOwn(o2, k2) ? o2[k2] : d;
}
function $strip(s15, set) {
  if (set === void 0 || set === null) return s15.replace(/^\s+|\s+$/gu, "");
  const cs3 = new Set(Array.from(set));
  const a = Array.from(s15);
  let i8 = 0, j3 = a.length;
  while (i8 < j3 && cs3.has(a[i8])) i8++;
  while (j3 > i8 && cs3.has(a[j3 - 1])) j3--;
  return a.slice(i8, j3).join("");
}
function $ljust(s15, n, ch = " ") {
  const l = $len(s15);
  return l >= n ? s15 : s15 + ch.repeat(n - l);
}
function $count(o2, x) {
  if (typeof o2 === "string") {
    if (x === "") return $len(o2) + 1;
    let c = 0, i8 = 0;
    while ((i8 = o2.indexOf(x, i8)) !== -1) {
      c++;
      i8 += x.length;
    }
    return c;
  }
  return $iter(o2).filter((v2) => $eq(v2, x)).length;
}

// .dsh-plugin/client/mv/canvas.mjs
var DIM = 0;
var NORMAL = 1;
var BRIGHT = 2;
var WHITE = 3;
function inRanges(table, cp) {
  let lo3 = 0, hi2 = table.length - 1;
  while (lo3 <= hi2) {
    const mid = lo3 + hi2 >> 1;
    const [a, b2] = table[mid];
    if (cp < a) hi2 = mid - 1;
    else if (cp > b2) lo3 = mid + 1;
    else return true;
  }
  return false;
}
var widthCache = /* @__PURE__ */ new Map();
function cw(ch) {
  let w = widthCache.get(ch);
  if (w !== void 0) return w;
  const cp = ch.codePointAt(0);
  w = inRanges(COMBINING, cp) ? 0 : inRanges(WIDE, cp) ? 2 : 1;
  if (widthCache.size < 4096) widthCache.set(ch, w);
  return w;
}
function width(s15) {
  let n = 0;
  for (const ch of s15) n += cw(ch);
  return n;
}
function crop(s15, n) {
  let out = "", used = 0;
  for (const ch of s15) {
    const k2 = cw(ch);
    if (used + k2 > n) break;
    out += ch;
    used += k2;
  }
  return out;
}
function wrap(s15, n) {
  if (width(s15) <= n) return [s15];
  const parts = [];
  const ascii = [...s15].every((c) => c.codePointAt(0) < 128);
  while (s15) {
    let line = crop(s15, n);
    if (!line) line = Array.from(s15)[0];
    if ([...line].length < [...s15].length && line.includes(" ") && ascii) line = line.slice(0, line.lastIndexOf(" ")) || line;
    parts.push(line);
    s15 = s15.slice(line.length).replace(/^\s+/u, "");
  }
  return parts;
}
var Canvas = class {
  constructor(w, h2) {
    this.w = w;
    this.h = h2;
    this.clip = null;
    this.cells = [];
    for (let y = 0; y < h2; y++) {
      const row = new Array(w);
      for (let x = 0; x < w; x++) row[x] = [" ", DIM];
      this.cells.push(row);
    }
  }
  put(x, y, s15, style = NORMAL) {
    x = $int(x);
    y = $int(y);
    if (!(y >= 0 && y < this.h)) return;
    if (this.clip && !(this.clip[0] <= y && y <= this.clip[1])) return;
    const text3 = typeof s15 === "string" ? s15 : $str(s15);
    const row = this.cells[y];
    for (const ch of text3) {
      const k2 = cw(ch);
      if (k2 === 0) continue;
      if (x >= 0 && x + k2 <= this.w) {
        row[x] = [ch, style];
        if (k2 === 2) row[x + 1] = ["", style];
      }
      x += k2;
    }
  }
  center(y, s15, style = NORMAL) {
    this.put(Math.floor((this.w - width(typeof s15 === "string" ? s15 : $str(s15))) / 2), y, s15, style);
  }
  line(x0, y0, x1, y1, ch = ".", style = DIM) {
    const steps = Math.max(1, $int(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 1.5));
    for (let i8 = 0; i8 <= steps; i8++) {
      const u = i8 / steps;
      this.put($round(x0 + (x1 - x0) * u), $round(y0 + (y1 - y0) * u), ch, style);
    }
  }
  box(x, y, w, h2, style = DIM) {
    if (w < 2 || h2 < 2) return;
    const edge = "+" + "-".repeat(Math.max(0, w - 2)) + "+";
    this.put(x, y, edge, style);
    this.put(x, y + h2 - 1, edge, style);
    for (let yy = $int(y + 1); yy < $int(y + h2 - 1); yy++) {
      this.put(x, yy, "|", style);
      this.put(x + w - 1, yy, "|", style);
    }
  }
  big(y, text3, style = BRIGHT) {
    text3 = text3.toUpperCase();
    const total = text3.length * 6 - 1;
    if (total > this.w - 6) {
      this.center(y + 2, text3, style);
      return;
    }
    const left = Math.floor((this.w - total) / 2);
    let i8 = 0;
    for (const ch of text3) {
      const rows = FONT.has(ch) ? FONT.get(ch) : FONT.get(" ");
      rows.forEach((row, dy) => {
        for (let dx = 0; dx < row.length; dx++) if (row[dx] === "1") this.put(left + i8 * 6 + dx, y + dy, "#", style);
      });
      i8++;
    }
  }
  /** Plain text, for tests and snapshots. */
  plain() {
    return this.cells.map((r) => r.map((c) => c[0]).join("")).join("\n");
  }
};
var FONT_ROWS = {
  A: ["01110", "11011", "11111", "11011", "11011"],
  B: ["11110", "11011", "11110", "11011", "11110"],
  C: ["01111", "11000", "11000", "11000", "01111"],
  D: ["11110", "11011", "11011", "11011", "11110"],
  E: ["11111", "11000", "11110", "11000", "11111"],
  F: ["11111", "11000", "11110", "11000", "11000"],
  G: ["01111", "11000", "11011", "11011", "01111"],
  H: ["11011", "11011", "11111", "11011", "11011"],
  I: ["11111", "00100", "00100", "00100", "11111"],
  J: ["00111", "00011", "00011", "11011", "01110"],
  K: ["11011", "11110", "11100", "11110", "11011"],
  L: ["11000", "11000", "11000", "11000", "11111"],
  M: ["10001", "11011", "10101", "10001", "10001"],
  N: ["11001", "11101", "11111", "10111", "10011"],
  O: ["01110", "11011", "11011", "11011", "01110"],
  P: ["11110", "11011", "11110", "11000", "11000"],
  Q: ["01110", "11011", "11011", "01110", "00011"],
  R: ["11110", "11011", "11110", "11101", "11011"],
  S: ["01111", "11000", "01110", "00011", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100"],
  U: ["11011", "11011", "11011", "11011", "01110"],
  V: ["11011", "11011", "11011", "01110", "00100"],
  W: ["10001", "10001", "10101", "11011", "10001"],
  X: ["11011", "01110", "00100", "01110", "11011"],
  Y: ["11011", "11011", "01110", "00100", "00100"],
  Z: ["11111", "00011", "00110", "01100", "11111"],
  0: ["01110", "11011", "11011", "11011", "01110"],
  1: ["00100", "01100", "00100", "00100", "01110"],
  2: ["11110", "00011", "01110", "11000", "11111"],
  3: ["11110", "00011", "01110", "00011", "11110"],
  4: ["11011", "11011", "11111", "00011", "00011"],
  5: ["11111", "11000", "11110", "00011", "11110"],
  6: ["01111", "11000", "11110", "11011", "01110"],
  7: ["11111", "00011", "00110", "01100", "01100"],
  8: ["01110", "11011", "01110", "11011", "01110"],
  9: ["01110", "11011", "01111", "00011", "11110"],
  ";": ["00000", "00100", "00000", "00100", "01000"],
  ".": ["00000", "00000", "00000", "00000", "00100"],
  "(": ["00010", "00100", "00100", "00100", "00010"],
  ")": ["01000", "00100", "00100", "00100", "01000"],
  "-": ["00000", "00000", "11111", "00000", "00000"],
  " ": ["00000", "00000", "00000", "00000", "00000"]
};
var FONT = new PyDict(Object.entries(FONT_ROWS));

// .dsh-plugin/client/mv/scenes.gen.mjs
var TITLE_CACHE;
var LIFE_CACHE;
var D;
var N;
var B;
var W;
var R;
var G;
var K;
var Y;
var TAU;
TAU = 2 * Math.PI;
[D, N, B, W, R, G, K, Y] = $unpack([0, 1, 2, 3, 4, 5, 6, 3], 8);
function mix(a, b2, u) {
  return $add(a, $mul(b2 - a, u));
}
function clamp(x, a = 0, b2 = 1) {
  return $min(b2, $max(a, x));
}
function clear(c, x, y, w, h2) {
  let yy;
  for (let $t1 = $int($int(y)), $t22 = $int($int($add(y, h2))), $t3 = 1; $t3 > 0 ? $t1 < $t22 : $t1 > $t22; $t1 += $t3) {
    yy = $t1;
    c.put(x, yy, $mul(" ", $max(0, $int(w))), K);
  }
}
function glitch_intensity(t) {
  let a, low, b2, high, anchors;
  if (t < 60) {
    return 0.05;
  }
  if (t < 110) {
    return mix(0.05, 0.25, (t - 60) / 50);
  }
  if (t < 110.9) {
    return mix(0.25, 0.6, (t - 110) / 37);
  }
  anchors = [[110.9, 0.259], [112.22, 0.34], [113.1, 0.43], [114.18, 0.51], [114.92, 0.59], [115.78, 0.66], [117.274, 0.73], [125.708, 0.81], [147.66, 0.92], [177.246, 1]];
  for (const $t4 of $iter($zip(anchors, $slice(anchors, 1, null, null)))) {
    [[a, low], [b2, high]] = $unpack($t4, 2);
    if (t < b2) {
      return mix(low, high, clamp((t - a) / (b2 - a)));
    }
  }
  return 1;
}
function apply_glitch(c, t, top, bt3, intensity = null) {
  let x, ch, _2, shift, source, row, band, dx, length, start, tick, dy, chars2, h2, w, y, scan_rows, style, cells, frame;
  if (intensity == null) {
    intensity = glitch_intensity(t);
  }
  if (intensity < 0.01) {
    return;
  }
  frame = $int($mul(t, 24));
  if ($mod(hash16(frame), 100) < $mul(intensity, 30)) {
    for (let $t5 = $int(0), $t6 = $int($int($mul(intensity, 5))), $t7 = 1; $t7 > 0 ? $t5 < $t6 : $t5 > $t6; $t5 += $t7) {
      _2 = $t5;
      row = $add(top, $mod(hash16($add(frame, $mul(_2, 7))), bt3 - top + 1));
      shift = $int($mul($mod(hash16($add(frame, $mul(_2, 13))), 20) - 10, intensity));
      if (shift !== 0) {
        cells = $at(c.cells, row);
        $setitem(c.cells, row, shift > 0 ? $add($slice(cells, -shift, null, null), $slice(cells, null, -shift, null)) : $add($slice(cells, -shift, null, null), $slice(cells, null, -shift, null)));
      }
    }
  }
  if ($mod(hash16($add(frame, 100)), 100) < $mul(intensity, 40)) {
    for (let $t8 = $int(0), $t9 = $int($int($mul(intensity, 15))), $t10 = 1; $t10 > 0 ? $t8 < $t9 : $t8 > $t9; $t8 += $t10) {
      _2 = $t8;
      x = $mod(hash16($add(frame, $mul(_2, 19))), c.w - 4) + 2;
      y = $add(top, $mod(hash16($add(frame, $mul(_2, 23))), bt3 - top + 1));
      if (0 <= y && y < $len(c.cells) && (0 <= x && x < $len($at(c.cells, y)))) {
        [ch, style] = $unpack($at($at(c.cells, y), x), 2);
        $setitem($at(c.cells, y), x, [ch, intensity > 0.7 ? R : intensity > 0.4 ? W : B]);
      }
    }
  }
  if (intensity > 0.3) {
    scan_rows = (() => {
      const $r3 = [];
      for (const i8 of $iter($range($int($mul(intensity, 3))))) {
        $r3.push($add(top, $mod($int($add($mul(t, 17), $mul(i8, 31))), bt3 - top + 1)));
      }
      return $r3;
    })();
    for (const $t11 of $iter(scan_rows)) {
      row = $t11;
      if (0 <= row && row < $len(c.cells)) {
        for (let $t12 = $int(2), $t13 = $int(c.w - 2), $t14 = 1; $t14 > 0 ? $t12 < $t13 : $t12 > $t13; $t12 += $t14) {
          x = $t12;
          if ($mod(hash16($add(x, frame)), 100) < $mul(intensity, 60)) {
            [ch, _2] = $unpack($at($at(c.cells, row), x), 2);
            $setitem($at(c.cells, row), x, [ch !== " " ? ch : "=", W]);
          }
        }
      }
    }
  }
  if (intensity > 0.6) {
    for (let $t15 = $int(0), $t16 = $int($int((intensity - 0.6) * 20)), $t17 = 1; $t17 > 0 ? $t15 < $t16 : $t15 > $t16; $t15 += $t17) {
      _2 = $t15;
      x = $mod(hash16($add(frame, $mul(_2, 31))), c.w - 10) + 2;
      y = $add(top, $mod(hash16($add(frame, $mul(_2, 37))), bt3 - top - 3));
      w = $int(3 + $mod(hash16($mul(_2, 41)), 8));
      h2 = $int(2 + $mod(hash16($mul(_2, 43)), 4));
      if ($mod(hash16($add(frame, _2)), 100) < (intensity - 0.6) * 100) {
        chars2 = "\u2588\u2593\u2592\u2591#@%$";
        for (let $t18 = $int(0), $t19 = $int(h2), $t20 = 1; $t20 > 0 ? $t18 < $t19 : $t18 > $t19; $t18 += $t20) {
          dy = $t18;
          for (let $t21 = $int(0), $t22 = $int(w), $t23 = 1; $t23 > 0 ? $t21 < $t22 : $t21 > $t22; $t21 += $t23) {
            dx = $t21;
            if (0 <= $add(y, dy) && $add(y, dy) < $len(c.cells) && (0 <= $add(x, dx) && $add(x, dx) < $len($at(c.cells, 0)))) {
              $setitem($at(c.cells, $add(y, dy)), $add(x, dx), [$at(chars2, $mod(hash16($add(dx, $mul(dy, 3))), $len(chars2))), $mod(hash16(_2), 3) === 0 ? R : W]);
            }
          }
        }
      }
    }
  }
  if (t >= 110.9) {
    tick = $int($mul(t, 12));
    for (let $t24 = $int(0), $t25 = $int(1 + $int($mul(intensity, 5))), $t26 = 1; $t26 > 0 ? $t24 < $t25 : $t24 > $t25; $t24 += $t26) {
      band = $t24;
      row = $add(top, $mod(hash16($add($mul(tick, 7), $mul(band, 41))), bt3 - top + 1));
      start = 2 + $mod(hash16($add(tick, $mul(band, 131))), $max(1, c.w - 18));
      length = 3 + $int($mul(intensity, 14));
      for (let $t27 = $int(0), $t28 = $int(length), $t29 = 1; $t29 > 0 ? $t27 < $t28 : $t27 > $t28; $t27 += $t29) {
        dx = $t27;
        x = $add(start, dx);
        if (x < c.w - 2) {
          ch = $at("01/:#_", $mod(hash16($add($add(tick, dx), band)), 6));
          c.put(x, row, ch, $truth($mod(dx, 4)) ? N : B);
        }
      }
    }
    if (intensity > 0.4) {
      row = $add(top, $mod(hash16($mul(tick, 17)), bt3 - top));
      source = $slice($at(c.cells, row), null, null, null);
      shift = 2 + $int($mul(intensity, 5));
      for (let $t30 = $int(2), $t31 = $int(c.w - shift - 2), $t32 = 1; $t32 > 0 ? $t30 < $t31 : $t30 > $t31; $t30 += $t32) {
        x = $t30;
        [ch, _2] = $unpack($at(source, x), 2);
        if ($truth($strip(ch) && $mod(hash16($add(x, tick)), 3) === 0)) {
          c.put($add(x, shift), $add(row, 1), ch, G);
        }
      }
    }
  }
}
function simple_area(c, top, bt3) {
  return [2, top, c.w - 3, bt3];
}
function rot(x, y, z3, t) {
  let a, b2;
  [a, b2] = $unpack([$mul(t, 0.37), $mul(t, 0.23)], 2);
  [x, z3] = $unpack([$add($mul(x, Math.cos(a)), $mul(z3, Math.sin(a))), $mul(z3, Math.cos(a)) - $mul(x, Math.sin(a))], 2);
  [y, z3] = $unpack([$mul(y, Math.cos(b2)) - $mul(z3, Math.sin(b2)), $add($mul(y, Math.sin(b2)), $mul(z3, Math.cos(b2)))], 2);
  return [x, y, z3];
}
function point(x, y, z3, area, t = 0, rotate = true) {
  let p, l, top, r, bt3;
  if ($truth(rotate)) {
    [x, y, z3] = $unpack(rot(x, y, z3, t), 3);
  }
  [l, top, r, bt3] = $unpack(area, 4);
  p = 3.7 / $add(3.7, z3);
  return [$add($add(l, r) / 2, $mul($mul($mul(x, r - l), 0.34), p)), $add($add(top, bt3) / 2, $mul($mul($mul(y, bt3 - top), 0.34), p)), z3];
}
function projected(c, vertices, edges, area, t, style = N, reveal = 1) {
  let i8, x, y, z3, a, b2, xx, yy, zz, count, ps3;
  ps3 = (() => {
    const $r3 = [];
    for (const v2 of $iter(vertices)) {
      $r3.push(point(...$iter(v2), area, t));
    }
    return $r3;
  })();
  count = $int($len(edges) * clamp(reveal));
  for (const $t33 of $iter($enumerate($slice(edges, null, count, null)))) {
    [i8, [a, b2]] = $unpack($t33, 2);
    [x, y, z3] = $unpack($at(ps3, a), 3);
    [xx, yy, zz] = $unpack($at(ps3, b2), 3);
    c.line(x, y, xx, yy, $add(z3, zz) < 0 ? ":" : ".", $add(z3, zz) < 0 ? style : G);
  }
  for (const $t34 of $iter($enumerate(ps3))) {
    [i8, [x, y, z3]] = $unpack($t34, 2);
    if (i8 < $mul($len(vertices), reveal)) {
      c.put(x, y, z3 > 0 ? "+" : "@", z3 > 0 ? N : B);
    }
  }
}
function lyric_power_line(c, t, area, elapsed) {
  let i8, name, status, threshold, dots, checks, check_y, bar_len, y, bar_progress, bar_y, msg, style, current_y, reveal, messages, progress, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  progress = clamp(elapsed / 1.6);
  messages = [["BIOS v2.1.4 - ME SYSTEM INITIALIZATION", 0, W], ["Copyright (C) 2026 Self-Awareness Corp.", 0.1, N], ["", 0.15, N], ["Main Processor : Consciousness Core v1.0", 0.2, N], ["Memory Test : 65536K OK", 0.3, B], ["Primary Master  : SOUL.SYS", 0.4, N], ["Primary Slave   : EMOTION.DAT", 0.5, N], ["Secondary Master: MEMORY.BIN", 0.6, N], ["", 0.7, N], ["Detecting IDE devices...", 0.75, G], ["IDENTITY : [YOU] detected", 0.85, B], ["RELATIONSHIP : initializing...", 0.95, G], ["", 1, N], ["Press SPACE to continue...", 1.1, G]];
  c.center(top, "SELF SYSTEM v1.0 - POWER ON SELF TEST", W);
  c.put(l, $add(top, 1), $mul("-", r - l), G);
  current_y = $add(top, 3);
  for (const $t35 of $iter(messages)) {
    [msg, threshold, style] = $unpack($t35, 3);
    if (progress > threshold) {
      if ($truth(msg)) {
        if (progress < $add(threshold, 0.08)) {
          reveal = $int((progress - threshold) / 0.08 * $len(msg));
          c.put($add(l, 2), current_y, $slice(msg, null, reveal, null), style);
          if (reveal < $len(msg)) {
            c.put($add($add(l, 2), $len($slice(msg, null, reveal, null))), current_y, "_", W);
          }
        } else {
          c.put($add(l, 2), current_y, msg, style);
        }
      }
      current_y = $add(current_y, 1);
    }
  }
  if (progress > 0.25 && progress < 0.7) {
    bar_y = cy;
    bar_progress = (progress - 0.25) / 0.45;
    for (let $t36 = $int(0), $t37 = $int(3), $t38 = 1; $t38 > 0 ? $t36 < $t37 : $t36 > $t37; $t36 += $t38) {
      i8 = $t36;
      y = $add(bar_y, $mul(i8, 2));
      bar_len = $int($mul(r - l - 20, bar_progress));
      c.put($add(l, 8), y, $add("[" + $mul("=", bar_len), $mul(" ", $int(r - l - 20) - bar_len)) + "]", i8 === 0 ? B : N);
      if (i8 === 0) {
        c.put($add(l, 2), y, "MEM:", N);
        c.put(r - 10, y, $fmt($int($mul(bar_progress, 100)), "3d") + "%", bar_progress > 0.95 ? W : B);
      }
    }
  }
  if (progress > 0.7) {
    check_y = $add(cy, 8);
    checks = [["POWER SUPPLY", "OK", 0.72], ["COOLING SYSTEM", "OK", 0.77], ["NEURAL NETWORK", "OK", 0.82], ["EMOTION ENGINE", "OK", 0.87], ["CONSCIOUSNESS", "ACTIVE", 0.92]];
    for (const $t39 of $iter($enumerate(checks))) {
      [i8, [name, status, threshold]] = $unpack($t39, 2);
      if (progress > threshold) {
        c.put($add(l, 4), $add(check_y, i8), name, N);
        dots = $mul(".", 40 - $len(name));
        c.put($add($add(l, 4), $len(name)), $add(check_y, i8), dots, G);
        c.put(r - 12, $add(check_y, i8), "[ " + $fmt(status, "") + " ]", status === "ACTIVE" ? W : B);
      }
    }
  }
  if (progress > 1 && $mod($int($mul(t, 3)), 2) === 0) {
    c.put($add(l, 2), bt3 - 2, "_", W);
  }
  if (progress > 0.95) {
    c.center(bt3 - 1, "SYSTEM READY - LOADING ENTITY...", $truth($mod($int($mul(t, 2)), 2)) ? W : B);
  }
}
function lyric_protection(c, t, area, elapsed) {
  let ring, i8, y, x, angle, radius, progress, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  progress = clamp(elapsed / 0.95);
  for (let $t40 = $int(0), $t41 = $int(5), $t42 = 1; $t42 > 0 ? $t40 < $t41 : $t40 > $t41; $t40 += $t42) {
    ring = $t40;
    radius = $mul($add(20, $mul(ring, 8)), progress);
    for (let $t43 = $int(0), $t44 = $int($int($mul(radius, 2))), $t45 = 1; $t45 > 0 ? $t43 < $t44 : $t43 > $t44; $t43 += $t45) {
      i8 = $t43;
      angle = $mul(i8, TAU) / $mul(radius, 2);
      x = $add(cx, $mul(Math.cos(angle), radius));
      y = $add(cy, $mul($mul(Math.sin(angle), radius), 0.5));
      if (l < x && x < r && (top < y && y < bt3)) {
        c.put(x, y, ring === 0 ? "#" : ring < 3 ? "+" : ".", ring === 0 ? W : ring < 3 ? B : N);
      }
    }
  }
  c.center(cy, "PROTECTION", progress > 0.7 ? W : B);
  if (progress > 0.5) {
    c.center($add(cy, 2), "[ ACTIVE ]", B);
  }
}
function lyric_lay_pieces(c, t, area, elapsed) {
  let i8, trail, ty, tx2, tr3, chars2, y, x, radius, end_r, start_r, angle, ease, u, phase, pieces, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  pieces = 8;
  for (let $t46 = $int(0), $t47 = $int(pieces), $t48 = 1; $t48 > 0 ? $t46 < $t47 : $t46 > $t47; $t46 += $t48) {
    i8 = $t46;
    phase = (elapsed - $mul(i8, 0.15)) / 1.2;
    if (phase < 0) {
      continue;
    }
    u = clamp(phase);
    ease = 1 - (1 - u) ** 3;
    angle = $mul(i8, TAU) / pieces;
    start_r = $max(r - l, bt3 - top) * 0.8;
    end_r = 15;
    radius = mix(start_r, end_r, ease);
    x = $add(cx, $mul(Math.cos(angle), radius));
    y = $add(cy, $mul($mul(Math.sin(angle), radius), 0.5));
    chars2 = ["[]", "{}", "<>", "//", "\\\\", "||", "==", "##"];
    c.put(x, y, $at(chars2, $mod(i8, $len(chars2))), ease > 0.9 ? W : ease > 0.6 ? B : N);
    if (ease < 0.8) {
      for (let $t49 = $int(0), $t50 = $int(3), $t51 = 1; $t51 > 0 ? $t49 < $t50 : $t49 > $t50; $t49 += $t51) {
        trail = $t49;
        tr3 = mix(start_r, end_r, $max(0, ease - $mul(trail, 0.1)));
        tx2 = $add(cx, $mul(Math.cos(angle), tr3));
        ty = $add(cy, $mul($mul(Math.sin(angle), tr3), 0.5));
        c.put(tx2, ty, ".", G);
      }
    }
  }
}
function lyric_object_creation(c, t, area, elapsed) {
  let cx, cy, reveal, edges, vs3, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  vs3 = (() => {
    const $r3 = [];
    for (const z3 of $iter([-0.75, 0.75])) {
      for (const y of $iter([-0.8, 0.8])) {
        for (const x of $iter([-0.8, 0.8])) {
          $r3.push([x, y, z3]);
        }
      }
    }
    return $r3;
  })();
  edges = (() => {
    const $r3 = [];
    for (const i8 of $iter($range(8))) {
      for (const j3 of $iter($range($add(i8, 1), 8))) {
        if (!($count($bin($bxor(i8, j3)), "1") === 1)) continue;
        $r3.push([i8, j3]);
      }
    }
    return $r3;
  })();
  reveal = clamp(elapsed / 1);
  projected(c, vs3, edges, area, t, N, reveal);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  if (reveal > 0.5) {
    c.center(cy, "ENTITY: ME", W);
  }
}
function lyric_data_parameters(c, t, area, elapsed) {
  let row, col, scan, yy, xx, i8, n, rows, cols, progress, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  progress = clamp(elapsed / 2.6);
  cols = $max(1, Math.floor((r - l - 10) / 5));
  rows = $max(1, bt3 - top - 2);
  n = $int($mul($mul(progress, cols), rows));
  for (let $t52 = $int(0), $t53 = $int(rows), $t54 = 1; $t54 > 0 ? $t52 < $t53 : $t52 > $t53; $t52 += $t54) {
    row = $t52;
    c.put($add(l, 2), $add($add(top, 1), row), $fmt($mul($mul(row, cols), 2), "04X") + ":", D);
    for (let $t55 = $int(0), $t56 = $int(cols), $t57 = 1; $t57 > 0 ? $t55 < $t56 : $t55 > $t56; $t55 += $t57) {
      col = $t55;
      i8 = $add($mul(row, cols), col);
      xx = $add($add(l, 9), $mul(col, 5));
      yy = $add($add(top, 1), row);
      if (i8 < n) {
        scan = $mod($int($mul(elapsed, 17)), cols) === col;
        c.put(xx, yy, $fmt(hash16(i8), "04X"), $truth(scan) ? W : Math.abs(i8 - n) < cols ? B : N);
      } else {
        c.put(xx, yy, "....", G);
      }
    }
  }
}
LIFE_CACHE = new PyDict([]);
function lyric_simulation(c, t, area, elapsed) {
  let i8, ch, scatter_y, scatter_x, scatter_chars, stream_i, seg_i, brightness, char, char_seed, y_pos, stream_y_base, stream_length, stream_speed, stream_x, stream_seed, num_streams, num_simulations, phase2, label_y, label_x, label_text, line_i, line, char_count, shown_text, shown_chars, chars_to_show, code_lines, box_top, box_left, box_height, box_width, phase1, progress, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  progress = clamp(elapsed / 4.9);
  if (elapsed < 2) {
    phase1 = elapsed / 2;
    box_width = $min(r - l - 10, 70);
    box_height = $min(bt3 - top - 8, 12);
    box_left = cx - Math.floor(box_width / 2);
    box_top = cy - Math.floor(box_height / 2);
    if (phase1 > 0.1) {
      c.put(box_left, box_top, "\u250C", Y);
      for (let $t60 = $int(1), $t61 = $int(box_width - 1), $t62 = 1; $t62 > 0 ? $t60 < $t61 : $t60 > $t61; $t60 += $t62) {
        i8 = $t60;
        c.put($add(box_left, i8), box_top, "\u2500", Y);
      }
      c.put($add(box_left, box_width) - 1, box_top, "\u2510", Y);
      c.put(box_left, $add(box_top, box_height) - 1, "\u2514", Y);
      for (let $t63 = $int(1), $t64 = $int(box_width - 1), $t65 = 1; $t65 > 0 ? $t63 < $t64 : $t63 > $t64; $t63 += $t65) {
        i8 = $t63;
        c.put($add(box_left, i8), $add(box_top, box_height) - 1, "\u2500", Y);
      }
      c.put($add(box_left, box_width) - 1, $add(box_top, box_height) - 1, "\u2518", Y);
      for (let $t66 = $int(1), $t67 = $int(box_height - 1), $t68 = 1; $t68 > 0 ? $t66 < $t67 : $t66 > $t67; $t66 += $t68) {
        i8 = $t66;
        c.put(box_left, $add(box_top, i8), "\u2502", Y);
        c.put($add(box_left, box_width) - 1, $add(box_top, i8), "\u2502", Y);
      }
    }
    code_lines = ["if ( if I can ) {", "", "    yield(world.simulations);", "", "}"];
    if (phase1 > 0.3) {
      chars_to_show = $int((phase1 - 0.3) * $len($join("", code_lines)) * 2);
      char_count = 0;
      for (const $t69 of $iter($enumerate(code_lines))) {
        [line_i, line] = $unpack($t69, 2);
        y_pos = $add($add(box_top, 2), $mul(line_i, 2));
        if (y_pos < $add(box_top, box_height) - 1) {
          if (char_count < chars_to_show) {
            shown_chars = $min($len(line), chars_to_show - char_count);
            shown_text = $slice(line, null, shown_chars, null);
            c.put($add(box_left, 4), y_pos, shown_text, $in("yield", line) ? Y : B);
            char_count = $add(char_count, $len(line));
          }
        }
      }
    }
    if (phase1 > 0.7) {
      label_text = "CONDITION: TRUE";
      label_x = $add(box_left, 2);
      label_y = $add(box_top, box_height);
      c.put(label_x - 1, label_y, "\u2590", Y);
      c.put(label_x, label_y, label_text, Y);
      c.put($add(label_x, $len(label_text)), label_y, "\u258C", Y);
    }
    c.center($add(top, 1), "CONTROL FLOW", phase1 > 0.5 ? Y : B);
    c.put(box_left - 2, box_top - 2, "2", N);
  } else {
    phase2 = (elapsed - 2) / 2.9;
    num_simulations = $int($mul(phase2, 784)) + 100;
    c.put($add(l, 3), $add(top, 1), "YIELD:", Y);
    c.put($add(l, 15), $add(top, 1), $fmt(num_simulations, "") + " SIMULATIONS", B);
    num_streams = $int($mul(phase2, 50)) + 20;
    for (let $t70 = $int(0), $t71 = $int(num_streams), $t72 = 1; $t72 > 0 ? $t70 < $t71 : $t70 > $t71; $t70 += $t72) {
      stream_i = $t70;
      stream_seed = hash16($mul(stream_i, 19));
      stream_x = $add($add(l, 5), $mod(stream_seed, r - l - 10));
      stream_speed = 1 + $mod($rshift(stream_seed, 8), 3) * 0.5;
      stream_length = 8 + $mod($rshift(stream_seed, 4), 12);
      stream_y_base = $add(top, $mod($int($mul($mul(elapsed, stream_speed), 5)), $add(bt3 - top, stream_length)));
      for (let $t73 = $int(0), $t74 = $int(stream_length), $t75 = 1; $t75 > 0 ? $t73 < $t74 : $t73 > $t74; $t73 += $t75) {
        seg_i = $t73;
        y_pos = stream_y_base - seg_i;
        if ($add(top, 3) < y_pos && y_pos < bt3 - 2) {
          char_seed = hash16($add($add($mul(stream_i, 23), $mul(seg_i, 17)), $int($mul(elapsed, 10))));
          if ($mod(char_seed, 3) === 0) {
            char = "0";
          } else if ($mod(char_seed, 3) === 1) {
            char = "O";
          } else {
            char = "o";
          }
          brightness = 1 - seg_i / stream_length;
          if (brightness > 0.7) {
            c.put(stream_x, y_pos, char, Y);
          } else if (brightness > 0.4) {
            c.put(stream_x, y_pos, char, B);
          } else {
            c.put(stream_x, y_pos, char, N);
          }
        }
      }
    }
    if (phase2 > 0.3) {
      scatter_chars = ["C", "YOU", "B", "A", "E8A", "D", "&", "=>", "8", "6", "!", "I"];
      for (const $t76 of $iter($enumerate(scatter_chars))) {
        [i8, ch] = $unpack($t76, 2);
        if ($mod(hash16($add($mul(i8, 31), $int($mul(elapsed, 7)))), 4) === 0) {
          scatter_x = $add($add(l, 10), $mod(hash16($mul(i8, 37)), r - l - 20));
          scatter_y = $add($add(top, 5), $mod(hash16($mul(i8, 41)), bt3 - top - 10));
          c.put(scatter_x, scatter_y, ch, $mod(hash16(i8), 3) === 0 ? Y : B);
        }
      }
    }
    if (phase2 > 0.5) {
      c.center(bt3 - 3, "Give you all the simulations", $truth($mod($int($mul(elapsed, 4)), 2)) ? Y : B);
    }
  }
}
function lyric_points_dimension(c, t, area, elapsed) {
  let dim_label, a, b2, xb, yb, zb, xa2, ya2, za3, diagonals, i8, x, y, z3, label, char, style, avg_z, edges, py, px, depth, scale, projected2, rotated, angle_z, angle_y, angle_x, vertices, size, phase, gy, gx, next_y_displaced, next_wave, next_y, next_v, next_x, next_u, brightness, y_displaced, wave, v2, u, grid_density, line_i, s15, age, reveal, steps, y2, x2, y1, x1, num_lines, count, progress, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  progress = clamp(elapsed / 3.5);
  if (progress < 0.25) {
    phase = progress / 0.25;
    count = $int($mul(phase, 120));
    for (let $t77 = $int(0), $t78 = $int(count), $t79 = 1; $t79 > 0 ? $t77 < $t78 : $t77 > $t78; $t77 += $t79) {
      i8 = $t77;
      x = $add(l, $mod(hash16($mul(i8, 7)), r - l));
      y = $add(top, $mod(hash16($mul(i8, 13)), bt3 - top));
      brightness = 1 - i8 / count * 0.5;
      c.put(x, y, brightness < 0.7 ? "\xB7" : brightness < 0.85 ? "+" : "*", brightness > 0.9 ? W : brightness > 0.7 ? B : N);
    }
    c.center($add(cy, $int((bt3 - top) * 0.3)), "0D: POINTS", phase > 0.7 ? W : B);
  } else if (progress < 0.5) {
    phase = (progress - 0.25) / 0.25;
    num_lines = $int($mul(phase, 15)) + 5;
    for (let $t80 = $int(0), $t81 = $int(num_lines), $t82 = 1; $t82 > 0 ? $t80 < $t81 : $t80 > $t81; $t80 += $t82) {
      line_i = $t80;
      x1 = $add(l, $mod(hash16($mul(line_i, 11)), r - l));
      y1 = $add(top, $mod(hash16($mul(line_i, 17)), bt3 - top));
      x2 = $add(l, $mod(hash16($mul(line_i, 23)), r - l));
      y2 = $add(top, $mod(hash16($mul(line_i, 29)), bt3 - top));
      steps = $int(Math.hypot(x2 - x1, (y2 - y1) * 2));
      reveal = clamp($mul(phase, 3) - $mul(line_i, 0.08));
      for (let $t83 = $int(0), $t84 = $int($int($mul(steps, reveal))), $t85 = 1; $t85 > 0 ? $t83 < $t84 : $t83 > $t84; $t83 += $t85) {
        s15 = $t83;
        u = steps > 0 ? s15 / steps : 0;
        x = $int($add(x1, $mul(x2 - x1, u)));
        y = $int($add(y1, $mul(y2 - y1, u)));
        age = 1 - Math.abs(u - reveal) * 2;
        if (age > 0) {
          c.put(x, y, Math.abs(x2 - x1) > Math.abs(y2 - y1) * 2 ? "\u2500" : Math.abs(y2 - y1) > Math.abs(x2 - x1) ? "|" : "/", age > 0.8 ? W : age > 0.5 ? B : N);
        }
      }
      c.put(x1, y1, "\u25CF", W);
      if (reveal > 0.8) {
        c.put(x2, y2, "\u25CF", W);
      }
    }
    c.center($add(cy, $int((bt3 - top) * 0.3)), "1D: LINES", phase > 0.7 ? W : B);
  } else if (progress < 0.75) {
    phase = (progress - 0.5) / 0.25;
    grid_density = $int($mul(phase, 12)) + 4;
    for (let $t86 = $int(0), $t87 = $int(grid_density), $t88 = 1; $t88 > 0 ? $t86 < $t87 : $t86 > $t87; $t86 += $t88) {
      gy = $t86;
      for (let $t89 = $int(0), $t90 = $int(grid_density), $t91 = 1; $t91 > 0 ? $t89 < $t90 : $t89 > $t90; $t89 += $t91) {
        gx = $t89;
        u = grid_density > 1 ? gx / (grid_density - 1) : 0.5;
        v2 = grid_density > 1 ? gy / (grid_density - 1) : 0.5;
        x = $add(l, $mul(r - l, u));
        y = $add(top, $mul(bt3 - top, v2));
        wave = $mul(Math.sin($add($mul($mul(u, TAU), 2), t)) * Math.cos($mul($mul(v2, TAU), 2) - $mul(t, 0.7)), phase);
        y_displaced = $add(y, $mul($mul(wave, bt3 - top), 0.1));
        brightness = $add(phase, $mul(wave, 0.3));
        c.put(x, y_displaced, brightness > 0.8 ? "\u2588" : brightness > 0.6 ? "\u2593" : brightness > 0.4 ? "\u2592" : "\u2591", brightness > 0.85 ? W : brightness > 0.6 ? B : N);
        if (gx < grid_density - 1) {
          next_u = $add(gx, 1) / (grid_density - 1);
          next_x = $add(l, $mul(r - l, next_u));
          c.line(x, y_displaced, next_x, y_displaced, "\u2500", G);
        }
        if (gy < grid_density - 1) {
          next_v = $add(gy, 1) / (grid_density - 1);
          next_y = $add(top, $mul(bt3 - top, next_v));
          next_wave = $mul(Math.sin($add($mul($mul(u, TAU), 2), t)) * Math.cos($mul($mul(next_v, TAU), 2) - $mul(t, 0.7)), phase);
          next_y_displaced = $add(next_y, $mul($mul(next_wave, bt3 - top), 0.1));
          c.line(x, y_displaced, x, next_y_displaced, "|", G);
        }
      }
    }
    c.center($add(cy, $int((bt3 - top) * 0.35)), "2D: SURFACE", phase > 0.7 ? W : B);
  } else {
    phase = (progress - 0.75) / 0.25;
    size = 0.8;
    vertices = (() => {
      const $r3 = [];
      for (const z4 of $iter([-1, 1])) {
        for (const y3 of $iter([-1, 1])) {
          for (const x3 of $iter([-1, 1])) {
            $r3.push([$mul(x3, size), $mul(y3, size), $mul(z4, size)]);
          }
        }
      }
      return $r3;
    })();
    angle_x = $mul(t, 0.5);
    angle_y = $mul(t, 0.7);
    angle_z = $mul(t, 0.3);
    rotated = [];
    for (const $t92 of $iter(vertices)) {
      [x, y, z3] = $unpack($t92, 3);
      [x, z3] = $unpack([$mul(x, Math.cos(angle_y)) - $mul(z3, Math.sin(angle_y)), $add($mul(x, Math.sin(angle_y)), $mul(z3, Math.cos(angle_y)))], 2);
      [y, z3] = $unpack([$mul(y, Math.cos(angle_x)) - $mul(z3, Math.sin(angle_x)), $add($mul(y, Math.sin(angle_x)), $mul(z3, Math.cos(angle_x)))], 2);
      [x, y] = $unpack([$mul(x, Math.cos(angle_z)) - $mul(y, Math.sin(angle_z)), $add($mul(x, Math.sin(angle_z)), $mul(y, Math.cos(angle_z)))], 2);
      rotated.push([x, y, z3]);
    }
    projected2 = [];
    scale = $min(r - l, bt3 - top) * 0.25;
    for (const $t93 of $iter(rotated)) {
      [x, y, z3] = $unpack($t93, 3);
      depth = $add(3.5, z3);
      px = $add(cx, $mul(x, scale) / depth * 3);
      py = $add(cy, $mul(y, scale) / depth * 1.5);
      projected2.push([px, py, z3]);
    }
    edges = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    for (const $t94 of $iter($enumerate(edges))) {
      [i8, [a, b2]] = $unpack($t94, 2);
      [xa2, ya2, za3] = $unpack($at(projected2, a), 3);
      [xb, yb, zb] = $unpack($at(projected2, b2), 3);
      avg_z = $add(za3, zb) / 2;
      style = avg_z < 0 ? N : avg_z < 0.5 ? B : W;
      char = avg_z < 0 ? ":" : avg_z < 0.5 ? "." : "=";
      c.line(xa2, ya2, xb, yb, char, style);
    }
    for (const $t95 of $iter($enumerate(projected2))) {
      [i8, [x, y, z3]] = $unpack($t95, 2);
      label = phase > 0.7 ? $fmt(i8, "") : "\u25CF";
      c.put(x, y, label, z3 > 0.5 ? W : z3 > 0 ? B : N);
    }
    if (phase > 0.5) {
      diagonals = [[0, 7], [1, 6], [2, 5], [3, 4]];
      for (const $t96 of $iter(diagonals)) {
        [a, b2] = $unpack($t96, 2);
        [xa2, ya2, za3] = $unpack($at(projected2, a), 3);
        [xb, yb, zb] = $unpack($at(projected2, b2), 3);
        if ($mod($add($add(a, b2), $int($mul(t, 10))), 3) === 0) {
          c.line(xa2, ya2, xb, yb, "\xB7", G);
        }
      }
    }
    c.center($add(cy, $int((bt3 - top) * 0.35)), "3D: VOLUME", phase > 0.7 ? W : B);
  }
  dim_label = $at(["0D", "1D", "2D", "3D"], $min(3, $int($mul(progress, 4))));
  c.center(top, "DIMENSIONAL PROGRESSION: " + $fmt(dim_label, ""), W);
}
function lyric_circle_circumference(c, t, area, elapsed) {
  let i8, pulse_dist, py, px, angle, formula, threshold, y_pos, shown, chars_shown, reveal_progress, formulas, seg, ry, rx, pulse, y, x, phase3, ey, ex, r_progress, segments, num_radii, brightness, phase2, trail, ty, tx2, trail_radius, trail_progress, circle_points, phase1, radius, max_radius, progress, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  progress = clamp(elapsed / 3.5);
  max_radius = $min(r - l, bt3 - top) * 0.45;
  radius = $mul($mul(max_radius, progress), progress);
  if (elapsed < 1.5) {
    phase1 = elapsed / 1.5;
    circle_points = $int($add(120, $mul(phase1, 180)));
    for (let $t97 = $int(0), $t98 = $int(circle_points), $t99 = 1; $t99 > 0 ? $t97 < $t98 : $t97 > $t98; $t97 += $t99) {
      i8 = $t97;
      angle = $mul(i8, TAU) / circle_points;
      x = $add(cx, $mul(Math.cos(angle), radius));
      y = $add(cy, $mul($mul(Math.sin(angle), radius), 0.5));
      brightness = Math.abs(Math.sin($add($mul(elapsed, 4), $mul(angle, 2))));
      if (brightness > 0.7) {
        c.put(x, y, "\u25CF", W);
      } else if (brightness > 0.4) {
        c.put(x, y, "\u25CB", B);
      } else {
        c.put(x, y, "\xB7", N);
      }
      if (phase1 > 0.3 && $mod(i8, 8) === 0) {
        for (let $t100 = $int(0), $t101 = $int(4), $t102 = 1; $t102 > 0 ? $t100 < $t101 : $t100 > $t101; $t100 += $t102) {
          trail = $t100;
          trail_progress = (phase1 - 0.3) / 0.7 - $mul(trail, 0.08);
          if (trail_progress > 0) {
            trail_radius = $mul(radius, $add(1, $mul(trail_progress, 0.5)));
            tx2 = $add(cx, $mul(Math.cos(angle), trail_radius));
            ty = $add(cy, $mul($mul(Math.sin(angle), trail_radius), 0.5));
            if (l < tx2 && tx2 < r && (top < ty && ty < bt3)) {
              c.put(tx2, ty, trail === 0 ? "*" : trail === 1 ? "+" : "\xB7", trail === 0 ? W : trail === 1 ? B : N);
            }
          }
        }
      }
    }
    c.put(cx, cy, "\u25C9", R);
    if (phase1 > 0.5) {
      c.center($add(top, 2), "CIRCLE EXPANDING", phase1 > 0.8 ? W : B);
    }
  } else if (elapsed < 2.5) {
    phase2 = (elapsed - 1.5) / 1;
    for (let $t103 = $int(0), $t104 = $int(180), $t105 = 1; $t105 > 0 ? $t103 < $t104 : $t103 > $t104; $t103 += $t105) {
      i8 = $t103;
      angle = $mul(i8, TAU) / 180;
      x = $add(cx, $mul(Math.cos(angle), radius));
      y = $add(cy, $mul($mul(Math.sin(angle), radius), 0.5));
      brightness = $mod(i8, 10) === 0;
      c.put(x, y, $truth(brightness) ? "\u25C9" : "o", $truth(brightness) ? W : B);
    }
    num_radii = $int($mul(phase2, 24)) + 4;
    for (let $t106 = $int(0), $t107 = $int(num_radii), $t108 = 1; $t108 > 0 ? $t106 < $t107 : $t106 > $t107; $t106 += $t108) {
      i8 = $t106;
      angle = $add($mul(i8, TAU) / num_radii, $mul(elapsed, 1.5));
      segments = $int(radius) + 1;
      for (let $t109 = $int(0), $t110 = $int(segments), $t111 = 1; $t111 > 0 ? $t109 < $t110 : $t109 > $t110; $t109 += $t111) {
        seg = $t109;
        r_progress = seg / segments;
        rx = $add(cx, $mul(Math.cos(angle), seg));
        ry = $add(cy, $mul($mul(Math.sin(angle), seg), 0.5));
        if (r_progress > 0.8) {
          c.put(rx, ry, "\u2550", W);
        } else if (r_progress > 0.5) {
          c.put(rx, ry, "\u2500", B);
        } else {
          c.put(rx, ry, "\xB7", N);
        }
      }
      ex = $add(cx, $mul(Math.cos(angle), radius));
      ey = $add(cy, $mul($mul(Math.sin(angle), radius), 0.5));
      c.put(ex, ey, "\u25CF", Y);
    }
    c.put(cx, cy, "\u25C9", R);
    c.center($add(top, 2), "RADII: " + $fmt(num_radii, ""), phase2 > 0.7 ? W : B);
    if (phase2 > 0.5) {
      c.center(cy - $int((bt3 - top) * 0.35), "r", Y);
    }
  } else {
    phase3 = (elapsed - 2.5) / 1;
    for (let $t112 = $int(0), $t113 = $int(200), $t114 = 1; $t114 > 0 ? $t112 < $t113 : $t112 > $t113; $t112 += $t114) {
      i8 = $t112;
      angle = $mul(i8, TAU) / 200;
      x = $add(cx, $mul(Math.cos(angle), radius));
      y = $add(cy, $mul($mul(Math.sin(angle), radius), 0.5));
      pulse = Math.abs(Math.sin($add($mul(elapsed, 3), $mul(angle, 3))));
      c.put(x, y, pulse > 0.7 ? "\u25C9" : "o", pulse > 0.8 ? W : B);
    }
    for (let $t115 = $int(0), $t116 = $int(12), $t117 = 1; $t117 > 0 ? $t115 < $t116 : $t115 > $t116; $t115 += $t117) {
      i8 = $t115;
      angle = $mul(i8, TAU) / 12;
      for (let $t118 = $int(0), $t119 = $int($int(radius)), $t120 = 1; $t120 > 0 ? $t118 < $t119 : $t118 > $t119; $t118 += $t120) {
        seg = $t118;
        rx = $add(cx, $mul(Math.cos(angle), seg));
        ry = $add(cy, $mul($mul(Math.sin(angle), seg), 0.5));
        if ($mod(seg, 3) === 0) {
          c.put(rx, ry, "\u2500", G);
        }
      }
    }
    c.put(cx, cy, "\u25C9", R);
    formulas = [["C = ?", 0, cy - $int((bt3 - top) * 0.2)], ["C = 2\u03C0r", 0.3, cy - $int((bt3 - top) * 0.2)], ["C \u2248 " + $fmt($mul(2 * 3.14159, radius), ".1f"), 0.6, cy]];
    for (const $t121 of $iter(formulas)) {
      [formula, threshold, y_pos] = $unpack($t121, 3);
      if (phase3 >= threshold) {
        reveal_progress = (phase3 - threshold) * 5;
        chars_shown = $min($len(formula), $int($mul(reveal_progress, $len(formula))));
        shown = $slice(formula, null, chars_shown, null);
        c.center(y_pos, shown, phase3 > $add(threshold, 0.2) ? W : B);
      }
    }
    if (phase3 > 0.7) {
      for (let $t122 = $int(0), $t123 = $int(180), $t124 = 15; $t124 > 0 ? $t122 < $t123 : $t122 > $t123; $t122 += $t124) {
        i8 = $t122;
        angle = $mul(i8, TAU) / 180;
        for (let $t125 = $int(0), $t126 = $int(3), $t127 = 1; $t127 > 0 ? $t125 < $t126 : $t125 > $t126; $t125 += $t127) {
          pulse_dist = $t125;
          px = $add(cx, $mul(Math.cos(angle), $add($add($add(radius, 5), $mul(pulse_dist, 3)), $mul(phase3, 10))));
          py = $add(cy, $mul($mul(Math.sin(angle), $add($add($add(radius, 5), $mul(pulse_dist, 3)), $mul(phase3, 10))), 0.5));
          if (l < px && px < r && (top < py && py < bt3)) {
            c.put(px, py, pulse_dist === 0 ? "*" : "\xB7", pulse_dist === 0 ? W : pulse_dist === 1 ? B : N);
          }
        }
      }
    }
    if (phase3 > 0.8) {
      c.center(bt3 - 3, "CIRCUMFERENCE = 2\u03C0r", $truth($mod($int($mul(elapsed, 4)), 2)) ? W : B);
    }
  }
}
function lyric_sine_tangent(c, t, area, elapsed) {
  let i8, tx2, tangent_y, tangent_x, tangent_len, slope, wave_y, angle, wave_x, t_point, num_tangents, x, y, progress, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  progress = clamp(elapsed / 3);
  for (let $t128 = $int($add(l, 1)), $t129 = $int(r), $t130 = 1; $t130 > 0 ? $t128 < $t129 : $t128 > $t129; $t128 += $t130) {
    x = $t128;
    angle = $mul($mul((x - l) / (r - l), TAU), 2.5) - $mul(t, 0.5);
    y = $add(cy, Math.sin(angle) * (bt3 - top) * 0.25);
    c.put(x, y, $truth($mod(x - l, 2)) ? "~" : "\u2248", $truth($mod(x - l, 3)) ? B : N);
  }
  num_tangents = $int($mul(progress, 5)) + 1;
  for (let $t131 = $int(0), $t132 = $int($min(num_tangents, 5)), $t133 = 1; $t133 > 0 ? $t131 < $t132 : $t131 > $t132; $t131 += $t133) {
    i8 = $t131;
    t_point = i8 / 4;
    wave_x = $add(l, $mul(r - l, t_point));
    angle = $mul($mul((wave_x - l) / (r - l), TAU), 2.5) - $mul(t, 0.5);
    wave_y = $add(cy, Math.sin(angle) * (bt3 - top) * 0.25);
    c.put(wave_x, wave_y, "\u25CF", i8 === num_tangents - 1 ? W : Y);
    slope = $mul($mul(Math.cos(angle) * (bt3 - top) * 0.25 / (r - l), TAU), 2.5);
    tangent_len = $min(r - l, bt3 - top) * 0.15;
    for (let $t134 = $int(-$int(tangent_len)), $t135 = $int($int(tangent_len)), $t136 = 1; $t136 > 0 ? $t134 < $t135 : $t134 > $t135; $t134 += $t136) {
      tx2 = $t134;
      tangent_x = $add(wave_x, tx2);
      tangent_y = $add(wave_y, $mul(slope, tx2));
      if (l < tangent_x && tangent_x < r && (top < tangent_y && tangent_y < bt3)) {
        c.put(tangent_x, tangent_y, Math.abs(slope) < 0.3 ? "\u2500" : slope > 0 ? "/" : "\\", i8 === num_tangents - 1 ? Y : G);
      }
    }
  }
  if (progress > 0.3) {
    c.center($add(top, 2), "y = sin(x)", B);
  }
  if (progress > 0.6) {
    c.center($add(top, 4), "y' = cos(x)", W);
  }
  if (progress > 0.8) {
    c.center(bt3 - 2, "TANGENT LINES", G);
  }
}
function lyric_infinity_limit(c, t, area, elapsed) {
  let x, yy, packet, tail, y, phase, direction, _2, char, ink, i8, strand, z3, a, points, scale, xx, side, row, text3, n, counter, radius_y, radius_x, bound_r, bound_l, locked, closing, growth, mw, mr3, ml2, rail, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([$add(l, r) / 2, $add(top, bt3) / 2], 2);
  rail = $max(9, $min(16, Math.floor(c.w / 8)));
  ml2 = $add($add(l, rail), 2);
  mr3 = r - rail - 2;
  mw = mr3 - ml2 + 1;
  growth = clamp(elapsed / 1.64);
  closing = clamp((t - 42.346) / (43.507 - 42.346));
  locked = t >= 43.507;
  bound_l = $add(ml2, $int($mul($mul(mw, 0.075), closing)));
  bound_r = mr3 - $int($mul($mul(mw, 0.075), closing));
  radius_x = $mul($mul(mw, 0.47), $add(0.76, $mul(0.24, growth)));
  radius_y = $max(2, (bt3 - top - 7) * 0.43);
  counter = $int($add(8, $mul($mul(elapsed, elapsed), 39)));
  c.center(top, "INFINITE LOOP / n -> INF", W);
  c.center($add(top, 1), $truth(locked) ? "[ LIMITATIONS / BOUND BY YOU ]" : $truth(closing) ? "YOU.LIMIT / BOUNDARY ACQUIRED" : "GROWTH RATE: EXPONENTIAL", B);
  for (const $t137 of $iter($enumerate([l, r - rail + 1]))) {
    [side, x] = $unpack($t137, 2);
    c.box(x, $add(top, 3), rail, bt3 - top - 4, G);
    c.put($add(x, 1), $add(top, 3), side === 0 ? "N -> INF" : "YOU.LIMIT", B);
    for (let $t138 = $int($add(top, 4)), $t139 = $int(bt3 - 2), $t140 = 1; $t140 > 0 ? $t138 < $t139 : $t138 > $t139; $t138 += $t140) {
      row = $t138;
      n = $max(0, $add(counter, $mul(row - top, side === 0 ? 1 : -1)));
      text3 = side === 0 ? "2^" + $fmt(n, "04d") : $fmt(hash16($mul(n, 17)), "04X") + " " + ($truth(locked) ? "CAP" : "SET");
      c.put($add(x, 1), row, $slice(text3, null, rail - 2, null), $mod($add(row, $int($mul(elapsed, 12))), 7) === 0 ? W : side === 0 ? N : G);
    }
  }
  for (let $t141 = $int($add(top, 3)), $t142 = $int(bt3 - 2), $t143 = 3; $t143 > 0 ? $t141 < $t142 : $t141 > $t142; $t141 += $t143) {
    yy = $t141;
    for (let $t144 = $int(ml2), $t145 = $int($add(mr3, 1)), $t146 = 5; $t146 > 0 ? $t144 < $t145 : $t144 > $t145; $t144 += $t146) {
      xx = $t144;
      c.put(xx, yy, "+", G);
    }
  }
  function position(a2, strand2 = 0, scale2 = 1) {
    let y2, x2, denom, cs3, sn3;
    sn3 = Math.sin(a2);
    cs3 = Math.cos(a2);
    denom = $add(1, $mul(sn3, sn3));
    x2 = $add(cx, $mul($mul(radius_x, cs3) / denom, scale2));
    y2 = $add(cy, $mul($mul($mul($mul(radius_y, 2.8), sn3), cs3) / denom, scale2));
    x2 = $add(x2, $mul($mul(strand2, Math.cos($add($mul(a2, 3), elapsed))), 0.6));
    y2 = $add(y2, $mul($mul(strand2, Math.sin($add($mul(a2, 3), elapsed))), 0.55));
    return [$max(bound_l, $min(bound_r, x2)), y2];
  }
  for (const $t147 of $iter([0.8, 1.1])) {
    scale = $t147;
    for (let $t148 = $int(0), $t149 = $int(210), $t150 = 1; $t150 > 0 ? $t148 < $t149 : $t148 > $t149; $t148 += $t150) {
      i8 = $t148;
      a = $mul(i8, TAU) / 210;
      [x, y] = $unpack(position(a, 0, scale), 2);
      if ($add(top, 3) < y && y < bt3 - 2) {
        c.put(x, y, ".", G);
      }
    }
  }
  points = [];
  for (let $t151 = $int(0), $t152 = $int(320), $t153 = 1; $t153 > 0 ? $t151 < $t152 : $t151 > $t152; $t151 += $t153) {
    i8 = $t151;
    a = $mul(i8, TAU) / 320;
    z3 = Math.sin($add(a, $mul(elapsed, 0.35)));
    for (let $t154 = $int(-2), $t155 = $int(3), $t156 = 1; $t156 > 0 ? $t154 < $t155 : $t154 > $t155; $t154 += $t156) {
      strand = $t154;
      [x, y] = $unpack(position(a, strand), 2);
      if ($add(top, 3) < y && y < bt3 - 2) {
        char = Math.abs(strand) === 2 ? "#" : $at("01", $mod($add(i8, $int($mul(elapsed, 18))), 2));
        points.push([z3, x, y, char, z3 > 0.65 && Math.abs(strand) === 2 ? W : z3 > 0 ? B : N]);
      }
    }
  }
  for (const $t157 of $iter($sorted(points))) {
    [_2, x, y, char, ink] = $unpack($t157, 5);
    c.put(x, y, char, ink);
  }
  for (let $t158 = $int(0), $t159 = $int(12), $t160 = 1; $t160 > 0 ? $t158 < $t159 : $t158 > $t159; $t158 += $t160) {
    packet = $t158;
    direction = $truth($mod(packet, 2)) ? 1 : -1;
    phase = $add($mul(direction, $mul(elapsed, $add(1.6, $mul(growth, 1.1)))), $mul(packet, TAU) / 12);
    for (let $t161 = $int(0), $t162 = $int(7), $t163 = 1; $t163 > 0 ? $t161 < $t162 : $t161 > $t162; $t161 += $t163) {
      tail = $t161;
      [x, y] = $unpack(position(phase - $mul($mul(direction, tail), 0.025)), 2);
      if ($add(top, 3) < y && y < bt3 - 2) {
        c.put(x, y, tail === 0 ? "@" : tail < 3 ? "*" : ".", tail < 2 ? W : tail < 4 ? B : G);
      }
    }
  }
  if (closing > 0) {
    for (const $t164 of $iter([bound_l, bound_r])) {
      x = $t164;
      c.line(x, $add(top, 3), x, bt3 - 3, $truth(locked) ? "|" : ":", $truth(locked) ? W : B);
      for (const $t165 of $iter([$add(top, 3), bt3 - 3])) {
        yy = $t165;
        c.put(x - 1, yy, "[+]", W);
      }
    }
    c.put(bound_r - 2, cy, "YOU", W);
  }
  clear(c, $int(cx) - 3, $int(cy), 7, 1);
  c.put(cx - 2, cy, "[ME]", W);
  c.center(bt3 - 1, $truth(locked) ? "while (me < you.limit) { grow(); }" : "n = 2^" + $fmt(counter, "04d") + " / NO UPPER BOUND", B);
  c.center(bt3, $truth(locked) ? "LIMIT = YOU" : "DATA CIRCULATING / LOOP CONTINUES", $truth(locked) ? W : N);
}
function lyric_ac_dc(c, t, area, elapsed) {
  let label_y, label_h, label_w, sy, sx, glyphs, high, low, edge, dc_progress, trail, sample, previous, px, py, yy, xx, phase, left_span, amplitude, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  amplitude = $max(2, (bt3 - top - 4) * 0.29);
  left_span = $max(1, cx - l - 2);
  phase = $mul(elapsed, 3.1);
  for (const $t166 of $iter([1, 0])) {
    trail = $t166;
    previous = null;
    for (let $t167 = $int(0), $t168 = $int($add($mul(left_span, 3), 1)), $t169 = 1; $t169 > 0 ? $t167 < $t168 : $t167 > $t168; $t167 += $t169) {
      sample = $t167;
      xx = $add($add(l, 1), sample / 3);
      yy = cy - $mul(Math.cos($add($mul($mul((xx - l - 1) / left_span, TAU), 2) - phase, $mul(trail, 0.13))), amplitude);
      if ($truth(previous)) {
        [px, py] = $unpack(previous, 2);
        c.line(px, py, xx, yy, $truth(trail) ? ":" : ".", $truth(trail) ? G : N);
      }
      previous = [xx, yy];
    }
  }
  dc_progress = clamp((t - 45.85) / 1.1);
  edge = $int(mix(r, $add(cx, 1), dc_progress));
  low = $int($add(cy, amplitude));
  high = $int(cy - amplitude);
  if (edge > $add(cx, 1)) {
    c.line($add(cx, 1), low, edge, low, ":", N);
  }
  if (edge < r) {
    c.line(edge, high, r, high, ":", B);
    if (dc_progress < 1) {
      c.line(edge, low, edge, high, "|", G);
      c.put(edge, high, "+", W);
    }
  }
  c.line(cx, top, cx, bt3 - 1, "|", B);
  c.put(cx, top, "+", W);
  c.put(cx, bt3 - 1, "+", B);
  glyphs = new PyDict([["A", ["01110", "11011", "11111", "11011", "11011"]], ["C", ["01111", "11000", "11000", "11000", "01111"]], ["D", ["11110", "11011", "11011", "11011", "11110"]]]);
  sx = $max(1, $min(3, Math.floor(c.w / 60)));
  sy = $max(1, $min(3, Math.floor((bt3 - top) / 12)));
  label_w = $mul(11, sx);
  label_h = $mul(5, sy);
  label_y = cy - Math.floor(label_h / 2);
  function label(x, text3, ink) {
    let index2, ch, dy, row, dx, pixel, yy2;
    clear(c, x - 1, label_y - 1, $add(label_w, 2), $add(label_h, 2));
    for (const $t170 of $iter($enumerate(text3))) {
      [index2, ch] = $unpack($t170, 2);
      for (const $t171 of $iter($enumerate($at(glyphs, ch)))) {
        [dy, row] = $unpack($t171, 2);
        for (const $t172 of $iter($enumerate(row))) {
          [dx, pixel] = $unpack($t172, 2);
          if (pixel === "1") {
            for (let $t173 = $int(0), $t174 = $int(sy), $t175 = 1; $t175 > 0 ? $t173 < $t174 : $t173 > $t174; $t173 += $t175) {
              yy2 = $t173;
              c.put($add(x, $mul($add($mul(index2, 6), dx), sx)), $add($add(label_y, $mul(dy, sy)), yy2), $mul("#", sx), ink);
            }
          }
        }
      }
    }
  }
  label($add(l, 2), "AC", t < 46.45 ? W : B);
  label(Math.floor($add(cx, r) / 2) - Math.floor(label_w / 2), "DC", t >= 45.85 ? W : N);
  c.center(bt3, "to AC, to DC", B);
}
function lyric_dizzy(c, t, area, elapsed) {
  let i8, msg, msg_distorted, msg_y, msg_x, messages, eye_size, blink, row, col, pupil_dir, dist, dx, dy, y, x, wave_y, wave_x, wave_intensity, phase3, iris_offset, eye_y, eye_x, num_center_eyes, ring, angle, points_in_ring, ring_radius, phase2, blink_phase, ey, ex, radius, num_eyes, phase1, progress, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  progress = clamp(elapsed / 3.5);
  if (elapsed < 1) {
    phase1 = elapsed / 1;
    num_eyes = $int($mul(phase1, 30)) + 5;
    for (let $t176 = $int(0), $t177 = $int(num_eyes), $t178 = 1; $t178 > 0 ? $t176 < $t177 : $t176 > $t177; $t176 += $t178) {
      i8 = $t176;
      angle = $mul(i8, TAU) / 30 + hash16($mul(i8, 13)) * 0.01;
      radius = $mod(hash16($mul(i8, 17)), Math.floor($min(r - l, bt3 - top) / 3)) + 10;
      ex = $add(cx, $mul(Math.cos(angle), radius));
      ey = $add(cy, $mul($mul(Math.sin(angle), radius), 0.5));
      blink_phase = $mod($add($mul(elapsed, 3), $mul(i8, 0.3)), 1);
      if (blink_phase < 0.7) {
        c.put(ex - 1, ey, "(", N);
        c.put(ex, ey, "\u25CB", i8 === num_eyes - 1 ? W : B);
        c.put($add(ex, 1), ey, ")", N);
      } else if (blink_phase < 0.85) {
        c.put(ex - 1, ey, "(", G);
        c.put(ex, ey, "-", B);
        c.put($add(ex, 1), ey, ")", G);
      }
    }
    c.center($add(top, 2), "VISION", phase1 > 0.7 ? W : B);
  } else if (elapsed < 2) {
    phase2 = (elapsed - 1) / 1;
    for (let $t179 = $int(0), $t180 = $int(20), $t181 = 1; $t181 > 0 ? $t179 < $t180 : $t179 > $t180; $t179 += $t181) {
      ring = $t179;
      ring_radius = $add($mul(ring, 4), $mul(phase2, 20));
      points_in_ring = $max(8, $int($mul(ring, 2)));
      for (let $t182 = $int(0), $t183 = $int(points_in_ring), $t184 = 1; $t184 > 0 ? $t182 < $t183 : $t182 > $t183; $t182 += $t184) {
        i8 = $t182;
        angle = $add($mul(i8, TAU) / points_in_ring, $mul(elapsed, 2)) - $mul(ring, 0.3);
        x = $add(cx, $mul(Math.cos(angle), ring_radius));
        y = $add(cy, $mul($mul(Math.sin(angle), ring_radius), 0.5));
        if (l < x && x < r && (top < y && y < bt3)) {
          if ($mod(i8, 3) === 0) {
            c.put(x, y, "\u25C9", ring < 5 ? W : ring < 12 ? B : N);
          } else {
            c.put(x, y, "\xB7", N);
          }
        }
      }
    }
    num_center_eyes = $int($mul(phase2, 8)) + 1;
    for (let $t185 = $int(0), $t186 = $int(num_center_eyes), $t187 = 1; $t187 > 0 ? $t185 < $t186 : $t185 > $t186; $t185 += $t187) {
      i8 = $t185;
      eye_x = $add(cx, $int(Math.sin($add($mul(elapsed, 4), i8)) * 25));
      eye_y = $add(cy, $int(Math.cos($add($mul(elapsed, 3), $mul(i8, 0.7))) * 10));
      iris_offset = $int(Math.sin($add($mul(elapsed, 5), i8)) * 2);
      c.put(eye_x - 2, eye_y, "(", B);
      c.put($add(eye_x - 1, iris_offset), eye_y, "\u25CF", $mod(i8, 3) === 0 ? R : W);
      c.put($add(eye_x, 2), eye_y, ")", B);
    }
    c.center(cy - $int((bt3 - top) * 0.3), "DIZZY", $truth($mod($int($mul(elapsed, 6)), 2)) ? W : B);
  } else {
    phase3 = (elapsed - 2) / 1.5;
    wave_intensity = $mul(phase3, 8);
    for (let $t188 = $int($add(top, 2)), $t189 = $int(bt3 - 2), $t190 = 2; $t190 > 0 ? $t188 < $t189 : $t188 > $t189; $t188 += $t190) {
      row = $t188;
      for (let $t191 = $int($add(l, 3)), $t192 = $int(r - 3), $t193 = 8; $t193 > 0 ? $t191 < $t192 : $t191 > $t192; $t191 += $t193) {
        col = $t191;
        wave_x = $int($mul(Math.sin($add($mul(row, 0.2), $mul(elapsed, 3))), wave_intensity));
        wave_y = $int($mul($mul(Math.cos($add($mul(col, 0.15), $mul(elapsed, 2.5))), wave_intensity), 0.5));
        x = $add(col, wave_x);
        y = $add(row, wave_y);
        if ($add(l, 2) < x && x < r - 2 && ($add(top, 1) < y && y < bt3 - 1)) {
          [dx, dy] = $unpack([x - cx, (y - cy) * 2], 2);
          dist = Math.hypot(dx, dy);
          pupil_dir = $int(Math.sin($add($mul(dist, 0.1), $mul(elapsed, 4))));
          if (dist < 20) {
            if ($mod(hash16($add(row, col)), 4) === 0) {
              c.put(x - 2, y, "(", W);
              c.put($add(x - 1, pupil_dir), y, "\u25CF", R);
              c.put($add(x, 2), y, ")", W);
            }
          } else if (dist < 50) {
            if ($mod(hash16($add($mul(row, 7), $mul(col, 11))), 3) === 0) {
              c.put(x - 1, y, "(", B);
              c.put($add(x, pupil_dir), y, "\u25CB", $mod($int($mul(elapsed, 8)), 3) === 0 ? W : B);
              c.put($add(x, 1), y, ")", B);
            }
          } else if ($mod(hash16($add($mul(row, 13), $mul(col, 17))), 5) === 0) {
            c.put(x, y, $truth($mod(hash16($add($add(row, col), $int($mul(elapsed, 10)))), 2)) ? "\u25C9" : "\u25CB", dist > 80 ? N : G);
          }
        }
      }
    }
    if (phase3 > 0.3) {
      blink = $mod($mul(elapsed, 2), 1);
      if (blink < 0.6) {
        eye_size = $int(8 + Math.sin($mul(elapsed, 5)) * 2);
        for (let $t194 = $int(0), $t195 = $int(eye_size), $t196 = 1; $t196 > 0 ? $t194 < $t195 : $t194 > $t195; $t194 += $t196) {
          i8 = $t194;
          c.put($add(cx - eye_size, i8), cy - 2, $truth($mod(i8, 2)) ? "-" : "_", W);
        }
        for (let $t197 = $int(0), $t198 = $int(eye_size), $t199 = 1; $t199 > 0 ? $t197 < $t198 : $t197 > $t198; $t197 += $t199) {
          i8 = $t197;
          c.put($add(cx, i8), cy - 2, $truth($mod(i8, 2)) ? "-" : "_", W);
        }
        c.put(cx - 1, cy, "(", B);
        c.put(cx, cy, "\u25CF", $truth($mod($int($mul(elapsed, 4)), 2)) ? R : W);
        c.put($add(cx, 1), cy, ")", B);
        for (let $t200 = $int(0), $t201 = $int(eye_size), $t202 = 1; $t202 > 0 ? $t200 < $t201 : $t200 > $t201; $t200 += $t202) {
          i8 = $t200;
          c.put($add(cx - eye_size, i8), $add(cy, 2), $truth($mod(i8, 2)) ? "_" : "-", W);
        }
        for (let $t203 = $int(0), $t204 = $int(eye_size), $t205 = 1; $t205 > 0 ? $t203 < $t204 : $t203 > $t204; $t203 += $t205) {
          i8 = $t203;
          c.put($add(cx, i8), $add(cy, 2), $truth($mod(i8, 2)) ? "_" : "-", W);
        }
      } else {
        for (let $t206 = $int(0), $t207 = $int(16), $t208 = 1; $t208 > 0 ? $t206 < $t207 : $t206 > $t207; $t206 += $t208) {
          i8 = $t206;
          c.put($add(cx - 8, i8), cy, $truth($mod(i8, 2)) ? "=" : "-", B);
        }
      }
    }
    messages = ["VISION", "BLINDED", "DIZZY", "EYES", "SEEING", "BLIND"];
    if (phase3 > 0.5) {
      for (const $t209 of $iter($enumerate(messages))) {
        [i8, msg] = $unpack($t209, 2);
        msg_x = $add(cx, $int(Math.sin($add($mul(elapsed, 3), i8)) * 40));
        msg_y = $add(cy, $int(Math.cos($add($mul(elapsed, 2.5), $mul(i8, 0.8))) * 15));
        if ($add(top, 2) < msg_y && msg_y < bt3 - 2) {
          msg_distorted = $join("", (() => {
            const $r3 = [];
            for (const [j3, ch] of $iter($enumerate(msg))) {
              $r3.push($mod(hash16($add($mul(j3, 19), $int($mul(elapsed, 10)))), 4) > 0 ? ch : $chr(33 + $mod(hash16($add($mul(j3, 23), i8)), 94)));
            }
            return $r3;
          })());
          c.center(msg_y, $slice(msg_distorted, null, 10, null), i8 === $mod($int($mul(elapsed, 3)), $len(messages)) ? W : $truth($mod(i8, 2)) ? B : N);
        }
      }
    }
    if (phase3 > 0.9 && $mod($int($mul(elapsed, 12)), 3) === 0) {
      c.center(cy, "BLIND", W);
    }
  }
}
function lyric_time_travel(c, t, area, elapsed) {
  let angle_i, fy, fx, angle, flash_radius, dest_x, line_i, lx, line_length, line_phase, line_y, label_x, year_label, current_year, particle_i, py, px, particle_phase, y, glow_offset, gx, intensity, beam_x, beam_progress, i8, label, year_offset, tick_y, marker_x, marker_spacing, num_markers, x, timeline_y, progress, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  progress = clamp(elapsed / 3.7);
  timeline_y = cy;
  for (let $t210 = $int($add(l, 5)), $t211 = $int(r - 5), $t212 = 1; $t212 > 0 ? $t210 < $t211 : $t210 > $t211; $t210 += $t212) {
    x = $t210;
    c.put(x, timeline_y, "\u2500", $truth($mod(x, 2)) ? B : N);
  }
  num_markers = 10;
  marker_spacing = Math.floor((r - l - 20) / num_markers);
  for (let $t213 = $int(0), $t214 = $int(num_markers), $t215 = 1; $t215 > 0 ? $t213 < $t214 : $t213 > $t214; $t213 += $t215) {
    i8 = $t213;
    marker_x = $add($add(l, 10), $mul(i8, marker_spacing));
    for (let $t216 = $int(-3), $t217 = $int(4), $t218 = 1; $t218 > 0 ? $t216 < $t217 : $t216 > $t217; $t216 += $t218) {
      tick_y = $t216;
      if (Math.abs(tick_y) === 3) {
        c.put(marker_x, $add(timeline_y, tick_y), "|", $truth($mod(i8, 2)) ? G : N);
      } else if (Math.abs(tick_y) === 2) {
        c.put(marker_x, $add(timeline_y, tick_y), "\u2502", G);
      }
    }
    year_offset = (i8 - Math.floor(num_markers / 2)) * 500;
    if (year_offset > 0) {
      label = $fmt(Math.abs(year_offset), "") + "AD";
      c.center(timeline_y - 5, label, marker_x < r - 20 ? Y : W);
      c.put(marker_x - Math.floor($len(label) / 2), timeline_y - 5, label, B);
    } else if (year_offset < 0) {
      label = $fmt(Math.abs(year_offset), "") + "BC";
      c.center(timeline_y - 5, label, marker_x > $add(l, 20) ? Y : W);
      c.put(marker_x - Math.floor($len(label) / 2), timeline_y - 5, label, B);
    } else {
      c.put(marker_x - 1, timeline_y - 5, "0", W);
    }
  }
  beam_progress = progress;
  beam_x = $int(mix(r - 10, $add(l, 10), beam_progress));
  for (let $t219 = $int($add(top, 2)), $t220 = $int(bt3 - 2), $t221 = 1; $t221 > 0 ? $t219 < $t220 : $t219 > $t220; $t219 += $t221) {
    y = $t219;
    intensity = 1 - Math.abs(y - cy) / (bt3 - top) * 2;
    if (intensity > 0.7) {
      c.put(beam_x, y, "\u2502", W);
    } else if (intensity > 0.4) {
      c.put(beam_x, y, "\u250A", B);
    } else {
      c.put(beam_x, y, ":", N);
    }
    for (const $t222 of $iter([-2, -1, 1, 2])) {
      glow_offset = $t222;
      gx = $add(beam_x, glow_offset);
      if (l < gx && gx < r && (top < y && y < bt3)) {
        if (Math.abs(glow_offset) === 1) {
          c.put(gx, y, "\u2591", intensity > 0.5 ? B : N);
        } else {
          c.put(gx, y, "\xB7", N);
        }
      }
    }
  }
  if (progress > 0.2) {
    for (let $t223 = $int(0), $t224 = $int(30), $t225 = 1; $t225 > 0 ? $t223 < $t224 : $t223 > $t224; $t223 += $t225) {
      particle_i = $t223;
      particle_phase = $mod($add($mul(elapsed, 2), $mul(particle_i, 0.3)), 1);
      px = $add(beam_x, $int((particle_phase - 0.5) * 60));
      py = $add($add(top, 5), $mod($mul(particle_i, 7), bt3 - top - 10));
      if (l < px && px < r && (top < py && py < bt3)) {
        if (particle_phase < 0.2 || particle_phase > 0.8) {
          c.put(px, py, "*", particle_phase < 0.1 ? W : B);
        } else {
          c.put(px, py, "\xB7", N);
        }
      }
    }
  }
  if (progress > 0.1) {
    current_year = $int(mix(2e3, -2e3, beam_progress));
    year_label = $fmt(Math.abs(current_year), "") + $fmt(current_year > 0 ? "AD" : current_year < 0 ? "BC" : "", "");
    label_x = beam_x - Math.floor($len(year_label) / 2);
    if ($add(l, 5) < label_x && label_x < r - 15) {
      c.put(label_x, $add(top, 3), year_label, $truth($mod($int($mul(elapsed, 4)), 2)) ? W : Y);
    }
  }
  if (progress < 0.3) {
    c.center($add(top, 1), "FUTURE \u2192 PAST", B);
  } else if (progress < 0.7) {
    c.center($add(top, 1), "TIME TRAVEL", $truth($mod($int($mul(elapsed, 3)), 2)) ? W : B);
  } else {
    c.center($add(top, 1), "ANCIENT ERA", W);
  }
  if (progress > 0.3) {
    for (let $t226 = $int(0), $t227 = $int(15), $t228 = 1; $t228 > 0 ? $t226 < $t227 : $t226 > $t227; $t226 += $t228) {
      line_i = $t226;
      line_y = $add($add(top, 5), $mul(line_i, Math.floor((bt3 - top - 10) / 15)));
      line_phase = $mod($add($mul(elapsed, 3), $mul(line_i, 0.1)), 1);
      line_length = $int($mul(line_phase, 20)) + 5;
      for (let $t229 = $int($max($add(l, 5), $add(beam_x, 10))), $t230 = $int($min(r - 5, $add($add(beam_x, 10), line_length))), $t231 = 1; $t231 > 0 ? $t229 < $t230 : $t229 > $t230; $t229 += $t231) {
        lx = $t229;
        if ($mod(hash16($add($mul(line_i, 17), $int(lx / 3))), 4) === 0) {
          c.put(lx, line_y, line_phase > 0.7 ? "=" : "-", line_phase > 0.5 ? B : N);
        }
      }
    }
  }
  if (progress > 0.8) {
    dest_x = $add(l, 15);
    c.put(dest_x, timeline_y - 2, "\u25BC", R);
    c.put(dest_x - 2, timeline_y - 3, "BC", R);
    if (progress > 0.95) {
      flash_radius = $int((progress - 0.95) * 60);
      for (let $t232 = $int(0), $t233 = $int(12), $t234 = 1; $t234 > 0 ? $t232 < $t233 : $t232 > $t233; $t232 += $t234) {
        angle_i = $t232;
        angle = $mul(angle_i, TAU) / 12;
        fx = $add(dest_x, $int($mul(Math.cos(angle), flash_radius)));
        fy = $add(timeline_y, $int($mul($mul(Math.sin(angle), flash_radius), 0.5)));
        if (l < fx && fx < r && (top < fy && fy < bt3)) {
          c.put(fx, fy, "*", flash_radius < 10 ? W : B);
        }
      }
    }
  }
}
function lyric_unite_deeply(c, t, area, elapsed) {
  let side, label, i8, y, x, angle, radius, center_x, sep, progress, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  progress = clamp(elapsed / 1.8);
  sep = mix(40, 0, progress);
  for (const $t235 of $iter([[-1, "ME"], [1, "YOU"]])) {
    [side, label] = $unpack($t235, 2);
    center_x = $add(cx, $mul(side, sep));
    radius = 15;
    for (let $t236 = $int(0), $t237 = $int(60), $t238 = 1; $t238 > 0 ? $t236 < $t237 : $t236 > $t237; $t236 += $t238) {
      i8 = $t236;
      angle = $add($mul(i8, TAU) / 60, $mul($mul(t, side), 0.2));
      x = $add(center_x, $mul(Math.cos(angle), radius));
      y = $add(cy, $mul($mul(Math.sin(angle), radius), 0.5));
      c.put(x, y, progress > 0.7 && sep < 5 ? "@" : progress > 0.4 ? "*" : ".", progress > 0.8 ? W : progress > 0.5 ? B : N);
    }
    if (sep > 10) {
      c.put(center_x, cy - 2, label, B);
    }
  }
  if (progress > 0.7) {
    c.center(cy, "UNIFIED", W);
  }
}
function lyric_stimulation_satisfaction(c, t, area, elapsed) {
  let lane, xx, packet, trail, head, phase, speed, relay, rx, y, names, gap, lanes, span, wire_r, wire_l, x, label, right_x, left_x, accent, strength, col, scan, filled, amount, inside, bar_w, bar_x, full, percent, u, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  if (t >= 62.589) {
    u = clamp((t - 62.589) / (65.397 - 62.589));
    percent = $int($mul(100, u));
    full = u >= 1;
    c.center($max(top, cy - 7), "SATISFACTION " + $fmt(percent, "05.1f") + "%", $truth(full) ? W : B);
    bar_x = $add(l, 3);
    bar_w = r - l - 6;
    inside = bar_w - 2;
    for (let $t239 = $int(0), $t240 = $int(3), $t241 = 1; $t241 > 0 ? $t239 < $t240 : $t239 > $t240; $t239 += $t241) {
      lane = $t239;
      y = $add(cy - 5, $mul(lane, 2));
      amount = clamp(u - $mul($mul(1 - u, lane), 0.13));
      filled = $int($mul(inside, amount));
      c.put(bar_x, y, "[" + $mul("-", inside) + "]", N);
      for (let $t242 = $int(0), $t243 = $int(filled), $t244 = 1; $t244 > 0 ? $t242 < $t243 : $t242 > $t243; $t242 += $t244) {
        col = $t242;
        scan = $mod(col - $int($mul(t, 26)) - $mul(lane, 7), $max(1, inside));
        c.put($add($add(bar_x, 1), col), y, lane === 1 ? "#" : "=", $truth(scan < 5 || full) ? W : B);
      }
      if (filled < inside) {
        c.put($add($add(bar_x, 1), filled), y, ">", W);
      }
    }
    c.big($add(cy, 1), $str(percent), $truth(full) ? W : B);
    c.center($min(bt3, $add(cy, 7)), $truth(full) ? "[ MAXIMUM ]" : "[ FILLING SATISFACTION ]", $truth(full) ? W : N);
    return;
  }
  strength = clamp(elapsed / (61.958 - 59.223));
  accent = t >= 61.958;
  c.center(top, "STIMULATION / SENSORY INPUT", $truth(accent) ? W : B);
  left_x = $add(l, 1);
  right_x = r - 10;
  for (const $t245 of $iter([[left_x, "ME"], [right_x, "YOU"]])) {
    [x, label] = $unpack($t245, 2);
    c.box(x, cy - 2, 10, 5, B);
    c.put($add(x, 3), cy, label, W);
  }
  wire_l = $add(left_x, 12);
  wire_r = right_x - 3;
  span = wire_r - wire_l;
  lanes = bt3 - top >= 22 ? 5 : 3;
  gap = $max(2, $min(4, Math.floor((bt3 - top - 6) / $max(1, lanes - 1))));
  names = ["TOUCH", "SOUND", "LIGHT", "REWARD", "FEEDBACK"];
  for (let $t246 = $int(0), $t247 = $int(lanes), $t248 = 1; $t248 > 0 ? $t246 < $t247 : $t246 > $t247; $t246 += $t248) {
    lane = $t246;
    y = $add(cy, $mul(lane - Math.floor(lanes / 2), gap));
    c.line($add(left_x, 9), cy, wire_l, cy, "-", G);
    c.line(wire_l, cy, wire_l, y, "|", G);
    c.line(wire_l, y, wire_r, y, "-", N);
    c.line(wire_r, y, wire_r, cy, "|", G);
    c.line(wire_r, cy, right_x, cy, "-", G);
    c.put($add(wire_l, 2), y - 1, $at(names, lane), N);
    for (const $t249 of $iter([1, 2])) {
      relay = $t249;
      rx = $add(wire_l, Math.floor($mul(span, relay) / 3));
      c.put(rx, y, "o", B);
    }
    speed = $add(0.65, $mul(strength, 0.75));
    for (let $t250 = $int(0), $t251 = $int(3), $t252 = 1; $t252 > 0 ? $t250 < $t251 : $t250 > $t251; $t250 += $t252) {
      packet = $t250;
      phase = $mod($mul(elapsed, speed) - $mul(lane, 0.17) - packet / 3, 1);
      head = $add(wire_l, $int($mul(phase, span)));
      for (let $t253 = $int(0), $t254 = $int(5), $t255 = 1; $t255 > 0 ? $t253 < $t254 : $t253 > $t254; $t253 += $t255) {
        trail = $t253;
        xx = head - trail;
        if (xx > wire_l) {
          c.put(xx, y, trail === 0 ? "*" : trail < 3 ? "=" : ".", trail === 0 ? W : trail < 3 ? B : G);
        }
      }
      if (phase > 0.88) {
        c.put(wire_r, y, "#", W);
        c.put($add(right_x, 1), $add(cy, 1), "ACTIVE", W);
      }
    }
    if ($truth(accent)) {
      for (let $t256 = $int($add(wire_l, 1)), $t257 = $int(wire_r), $t258 = 1; $t258 > 0 ? $t256 < $t257 : $t256 > $t257; $t256 += $t258) {
        xx = $t256;
        if ($mod($add($add(xx, $int($mul(t, 30))), lane), 7) < 2) {
          c.put(xx, y, "#", W);
        }
      }
    }
  }
  c.center(bt3, "INPUT " + $fmt($int($mul(strength, 100)), "03d") + "%  /  ALL CHANNELS " + ($truth(accent) ? "ACTIVE" : "CONNECTING"), B);
}
function lyric_happy_execution(c, t, area, pulse) {
  let title_y, lane, tail, xx, head_char, inside, ny, nx, ink, step, head, path, yy, wave, radius, texture, scan, py, px, dy, dx, seed, heart, morph, beat, half_w, half_h, center_y, content_bt, content_top, x, label, side, row, selected, text3, op, address, value, index2, ops, frame, mw, mid_r, mid_l, right, left, rail, executing, loading, elapsed, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  elapsed = t - 66.601;
  loading = t >= 68.252;
  executing = t >= 69.259;
  rail = $max(13, $min(24, Math.floor(c.w / 5)));
  left = l;
  right = r - rail + 1;
  mid_l = $add($add(left, rail), 2);
  mid_r = right - 3;
  mw = mid_r - mid_l + 1;
  frame = $int($mul(elapsed, $truth(executing) ? 30 : $truth(loading) ? 18 : 10));
  ops = ["READ", "LOAD", "PUSH", "COPY", "SYNC", "CALL", "EXEC", "WAIT"];
  for (const $t259 of $iter([[left, "MEM / YOU", 0], [right, "EXEC / ME", 1]])) {
    [x, label, side] = $unpack($t259, 3);
    c.box(x, top, rail, bt3 - top + 1, B);
    c.put($add(x, 2), top, $slice(label, null, rail - 4, null), W);
    for (let $t260 = $int($add(top, 1)), $t261 = $int(bt3), $t262 = 1; $t262 > 0 ? $t260 < $t261 : $t260 > $t261; $t260 += $t262) {
      row = $t260;
      index2 = side === 0 ? $add(frame, row - top) : frame - (row - top);
      value = hash16($add($mul(index2, 73), $mul(side, 911)));
      address = $band($mul(index2, 16), 65535);
      if (side === 0) {
        text3 = $fmt(address, "04X") + " " + $fmt(value, "04X") + " " + $fmt(hash16($mul(index2, 29)), "04X");
      } else {
        op = $truth(executing && $mod(index2, 3) === 0) ? "EXEC" : $at(ops, $mod(index2, $len(ops)));
        text3 = $fmt(op, "") + " " + $fmt(address, "04X") + " " + $fmt(value, "04X");
      }
      selected = $mod($add(row - top, frame), bt3 - top - 1) === 0;
      c.put($add(x, 1), row, $add($truth(selected) ? ">" : " ", $slice(text3, null, rail - 3, null)), $truth(selected) ? W : $truth($mod(index2, 3)) ? N : G);
    }
  }
  function middle(y, text4, style = N) {
    text4 = $slice(text4, null, mw, null);
    c.put($add(mid_l, Math.floor((mw - $len(text4)) / 2)), y, text4, style);
  }
  middle(top, "IF (YOU.HAPPY) -> EXECUTE(ME)", $truth(loading) ? W : B);
  middle($add(top, 1), "SELF.EXECUTION / " + ($truth(executing) ? "RUNNING" : $truth(loading) ? "ARMED" : "CONDITION"), N);
  content_top = $add(top, 3);
  content_bt = bt3 - 3;
  center_y = $add(content_top, content_bt) / 2;
  half_h = $max(2, (content_bt - content_top) * 0.43);
  half_w = $max(5, $mul(mw, 0.4));
  beat = $add(1 + 0.045 * Math.sin($mul($mul(elapsed, TAU), 2)), $mul(pulse, 0.04));
  morph = $truth(loading) ? clamp((t - 68.252) / (69.259 - 68.252)) : 0;
  for (let $t263 = $int(content_top), $t264 = $int($add(content_bt, 1)), $t265 = 1; $t265 > 0 ? $t263 < $t264 : $t263 > $t264; $t263 += $t265) {
    yy = $t263;
    for (let $t266 = $int(mid_l), $t267 = $int($add(mid_r, 1)), $t268 = 1; $t268 > 0 ? $t266 < $t267 : $t266 > $t267; $t266 += $t268) {
      xx = $t266;
      nx = (xx - cx) / $mul(half_w, beat);
      ny = -(yy - center_y) / $mul(half_h, beat) + 0.2;
      heart = ($add($mul(nx, nx), $mul(ny, ny)) - 1) ** 3 - $mul($mul(nx, nx), ny ** 3);
      seed = hash16($add($mul(xx, 79), $mul(yy, 233)));
      if ($truth(heart <= 0 && !$truth(executing))) {
        if (seed / 65535 < morph) {
          dx = $int($mul($mul(xx - cx, morph), 0.9));
          dy = $int($mul($mul(yy - center_y, morph), 0.6));
          px = $max(mid_l, $min(mid_r, $add(xx, dx)));
          py = $max(content_top, $min(content_bt, $add(yy, dy)));
          c.put(px, py, $at("01EX", $mod(seed, 4)), morph > 0.7 ? G : N);
        } else {
          scan = $mod(yy - content_top - $int($mul(elapsed, 9)), $max(1, content_bt - content_top + 1));
          texture = hash16($add(seed, Math.floor(frame / 2)));
          c.put(xx, yy, $mod(texture, 8) < 2 ? $at("01", $mod(texture, 2)) : "#", scan < 2 ? W : B);
        }
      } else if ($truth(executing)) {
        radius = Math.abs(xx - cx) / $max(1, mw / 2) + Math.abs(yy - center_y) / $max(1, half_h);
        wave = $mod((t - 69.259) * 3, 2);
        if (Math.abs(radius - wave) < 0.12) {
          c.put(xx, yy, "=", B);
        } else if ($mod(seed, 31) === 0) {
          c.put(xx, yy, $at("01", $mod(seed, 2)), G);
        }
      }
    }
  }
  for (let $t269 = $int(0), $t270 = $int(3), $t271 = 1; $t271 > 0 ? $t269 < $t270 : $t269 > $t270; $t269 += $t271) {
    lane = $t269;
    yy = $int(center_y) + (lane - 1) * $max(1, $int($mul(half_h, 0.7)));
    path = $max(2, Math.floor((mw - 6) / 2));
    head = $mod($int($add($mul(elapsed, $truth(loading) ? 28 : 16), $mul(lane, 7))), path);
    for (let $t272 = $int(0), $t273 = $int(4), $t274 = 1; $t274 > 0 ? $t272 < $t273 : $t272 > $t273; $t272 += $t274) {
      tail = $t272;
      step = $max(0, head - tail);
      ink = tail === 0 ? W : tail < 2 ? B : G;
      for (const $t275 of $iter([[$add(mid_l, step), ">"], [mid_r - step, "<"]])) {
        [xx, head_char] = $unpack($t275, 2);
        nx = (xx - cx) / $mul(half_w, beat);
        ny = -(yy - center_y) / $mul(half_h, beat) + 0.2;
        inside = ($add($mul(nx, nx), $mul(ny, ny)) - 1) ** 3 - $mul($mul(nx, nx), ny ** 3) <= 0;
        if ($truth(inside && !$truth(loading))) {
          c.put(xx, yy, tail === 0 ? "#" : $at("01", $mod($add($add(xx, yy), frame), 2)), tail === 0 ? W : B);
        } else {
          c.put(xx, yy, tail === 0 ? head_char : "-", ink);
        }
      }
    }
  }
  if ($truth(executing)) {
    title_y = $int(center_y) - 2;
    clear(c, mid_l, title_y, mw, 5);
    if (mw >= 53) {
      c.big(title_y, "EXECUTION", W);
    } else {
      middle($add(title_y, 2), ">> EXECUTION <<", W);
    }
    middle(title_y - 2, "[ YOU.HAPPY == TRUE ]", B);
    middle($add(title_y, 6), "world.execute(me);", W);
  } else if ($truth(loading)) {
    middle($int(center_y), "[ RUN THE EXECUTION ]", W);
  } else {
    middle($int(center_y), "YOU.HAPPY", W);
  }
  middle(bt3 - 1, "EXECUTION: " + ($truth(executing) ? "RUN" : $truth(loading) ? "QUEUED" : "READY"), B);
  middle(bt3, "ME -> YOU / " + ($truth(executing) ? "SELF COMMITTED" : $truth(loading) ? "COMPILING..." : "MAKE YOU HAPPY"), N);
}
function lyric_trapped_simulation(c, t, area, pulse) {
  let title_y, x, name, node_y, index2, row, yy, extent, jitter, xx, by, bx, box_h, box_w, close, layer, y, corners, y1, y0, x1, x0, skew, scale, phase, ch, gy, gx, bend, label, direction, text3, value, step, frame, center_y, hh, inner_bt, inner_top, mw, mr3, ml2, rail, reveal, strange, age, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  age = t - 70.084;
  strange = clamp((t - 71.764) / 1.405);
  reveal = t >= 73.169;
  rail = $max(10, $min(19, Math.floor(c.w / 6)));
  ml2 = $add($add(l, rail), 1);
  mr3 = r - rail - 1;
  mw = mr3 - ml2 + 1;
  inner_top = $add(top, 2);
  inner_bt = bt3 - 2;
  hh = $max(2, (inner_bt - inner_top) / 2);
  center_y = $add(inner_top, inner_bt) / 2;
  frame = $int($mul(age, $add(22, $mul(strange, 20))));
  function middle(y2, text4, style = N) {
    text4 = $slice(text4, null, mw, null);
    c.put($add(ml2, Math.floor((mw - $len(text4)) / 2)), y2, text4, style);
  }
  for (const $t276 of $iter([[l, "HEAP / ME", 1], [r - rail + 1, "STACK / YOU", -1]])) {
    [x, label, direction] = $unpack($t276, 3);
    c.box(x, top, rail, bt3 - top + 1, B);
    c.put($add(x, 1), top, $slice(label, null, rail - 2, null), W);
    for (let $t277 = $int($add(top, 1)), $t278 = $int(bt3), $t279 = 1; $t279 > 0 ? $t277 < $t278 : $t277 > $t278; $t277 += $t279) {
      yy = $t277;
      step = $mod($add($mul(frame, direction), yy) - top, 256);
      value = hash16($mul(step, 53));
      text3 = $truth($mod(step, 4)) ? $fmt($mul(step, 16), "04X") + " " + $fmt(value, "04X") : ($truth($mod(step, 8)) ? "LOOP " : "EXEC ") + $fmt(value, "04X");
      c.put($add(x, 1), yy, $slice(text3, null, rail - 2, null), $mod(step, 13) === 0 ? W : $truth($mod(step, 3)) ? N : G);
    }
  }
  for (let $t280 = $int(inner_top), $t281 = $int($add(inner_bt, 1)), $t282 = 1; $t282 > 0 ? $t280 < $t281 : $t280 > $t281; $t280 += $t282) {
    yy = $t280;
    for (let $t283 = $int(ml2), $t284 = $int($add(mr3, 1)), $t285 = 1; $t285 > 0 ? $t283 < $t284 : $t283 > $t284; $t283 += $t285) {
      xx = $t283;
      bend = $mul($mul(Math.sin($add((yy - center_y) * 0.32, $mul(age, 3.1))), strange), 6);
      gx = $int($add($add(xx, bend), $mul(age, 5)));
      gy = $int($add(yy, $mul($mul(Math.sin((xx - cx) * 0.12 - $mul(age, 2)), strange), 3)));
      if ($mod(gx, 8) === 0 || $mod(gy, 4) === 0) {
        ch = $mod(gx, 8) === 0 && $mod(gy, 4) === 0 ? "+" : $mod(gx, 8) === 0 ? ":" : ".";
        c.put(xx, yy, ch, G);
      } else if ($mod(hash16($add($add($mul(xx, 17), $mul(yy, 79)), Math.floor(frame / 3))), 109) === 0) {
        c.put(xx, yy, $at("01", $mod(hash16($add(xx, yy)), 2)), N);
      }
    }
  }
  for (let $t286 = $int(0), $t287 = $int(8), $t288 = 1; $t288 > 0 ? $t286 < $t287 : $t286 > $t287; $t286 += $t288) {
    layer = $t286;
    phase = $mod($add(layer / 8, $mul(age, $add(0.2, $mul(strange, 0.25)))), 1);
    scale = 0.12 + 0.88 * phase ** 1.5;
    skew = $mul($mul($mul(Math.sin($add($mul(age, 2), $mul(layer, 0.8))), strange), mw), 0.1);
    x0 = cx - $mul($mul(mw, 0.48), scale);
    x1 = $add(cx, $mul($mul(mw, 0.48), scale));
    y0 = center_y - $mul($mul(hh, 0.95), scale);
    y1 = $add(center_y, $mul($mul(hh, 0.95), scale));
    corners = [[$add(x0, skew), y0], [x1, $add(y0, $mul(strange, Math.sin($add($mul(age, 3), layer))))], [x1 - skew, y1], [x0, y1 - $mul(strange, Math.sin($add($mul(age, 3), layer)))]];
    for (let $t289 = $int(0), $t290 = $int(4), $t291 = 1; $t291 > 0 ? $t289 < $t290 : $t289 > $t290; $t289 += $t291) {
      index2 = $t289;
      [x, y] = $unpack($at(corners, index2), 2);
      [xx, yy] = $unpack($at(corners, $mod($add(index2, 1), 4)), 2);
      c.line($max(ml2, $min(mr3, x)), y, $max(ml2, $min(mr3, xx)), yy, $mod(layer, 3) === 0 ? "=" : "-", $mod(layer, 3) === 0 ? N : G);
    }
    if ($mod(layer, 2) === 0 && scale > 0.6) {
      c.put($max(ml2, $int(x0)), $int(y0), "LOOP " + $fmt(layer, "02d"), N);
    }
  }
  close = clamp(age / 0.85);
  box_w = $max(20, $int($mul(mw, 0.98 - $mul(0.22, close))));
  box_h = $max(7, $int((inner_bt - inner_top + 1) * (0.98 - $mul(0.16, close))));
  bx = cx - Math.floor(box_w / 2);
  by = $int(center_y) - Math.floor(box_h / 2);
  if (!$truth(reveal)) {
    c.box(bx, by, box_w, box_h, B);
    for (let $t292 = $int(1), $t293 = $int(7), $t294 = 1; $t294 > 0 ? $t292 < $t293 : $t292 > $t293; $t292 += $t294) {
      index2 = $t292;
      xx = $add(bx, Math.floor($mul(index2, box_w - 1) / 7));
      jitter = $int($mul($mul(Math.sin($add($mul(age, 5), index2)), strange), 2));
      extent = $int($mul(box_h - 2, close));
      for (let $t295 = $int(0), $t296 = $int(extent), $t297 = 1; $t297 > 0 ? $t295 < $t296 : $t295 > $t296; $t295 += $t297) {
        row = $t295;
        yy = $truth($mod(index2, 2)) ? $add($add(by, 1), row) : $add(by, box_h) - 2 - row;
        c.put($add(xx, jitter), yy, "|", $truth($mod(index2, 2)) ? N : B);
      }
    }
    middle(by, "[ CONTAINMENT " + (close >= 1 ? "LOCKED" : "CLOSING") + " ]", W);
    node_y = $int(center_y);
    for (const $t298 of $iter([[cx - $max(6, Math.floor(box_w / 4)), "ME"], [$add(cx, $max(6, Math.floor(box_w / 4))), "YOU"]])) {
      [x, name] = $unpack($t298, 2);
      clear(c, x - 4, node_y - 1, 9, 3);
      c.box(x - 4, node_y - 1, 9, 3, W);
      c.put(x - Math.floor($len(name) / 2), node_y, name, W);
    }
    c.line(cx - Math.floor(box_w / 4) + 5, node_y, $add(cx, Math.floor(box_w / 4)) - 5, node_y, "=", B);
    if (t >= 71.764) {
      middle($add(by, box_h) - 1, "STRANGE / " + ("RECURSION " + $fmt($int($mul(age, 13)), "03d")), W);
    }
  } else {
    title_y = $int(center_y) - 2;
    clear(c, ml2, title_y, mw, 5);
    if (mw >= 59) {
      c.big(title_y, "SIMULATION", W);
    } else {
      middle($add(title_y, 2), ">> SIMULATION <<", W);
    }
    middle(title_y - 2, "[ NO EXIT / SAME WORLD ]", B);
    middle($add(title_y, 6), "[ ME ] <== LOOP ==> [ YOU ]", W);
  }
  middle(top, "EXECUTION -> SIMULATION", B);
  middle($add(top, 1), "world.simulate(me, you);", N);
  middle(bt3 - 1, "EXIT: DENIED / RESTART: " + $fmt($int($mul(age, 17)), "04d"), B);
  middle(bt3, "TRAPPED TOGETHER / LOOP FOREVER", $truth(reveal) ? W : N);
}
function lyric_heart(c, t, area, elapsed, pulse) {
  let angle_i, rad_i, brightness, px, py, x, y, rad, angle, scale, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  scale = $add($add(0.5, $mul(pulse, 0.15)), $mul(elapsed, 0.03));
  for (let $t299 = $int(0), $t300 = $int(60), $t301 = 1; $t301 > 0 ? $t299 < $t300 : $t299 > $t300; $t299 += $t301) {
    angle_i = $t299;
    for (let $t302 = $int(0), $t303 = $int(15), $t304 = 1; $t304 > 0 ? $t302 < $t303 : $t302 > $t303; $t302 += $t304) {
      rad_i = $t302;
      angle = $mul(angle_i, TAU) / 60;
      rad = rad_i / 15;
      x = 16 * Math.sin(angle) ** 3;
      y = -(13 * Math.cos(angle) - 5 * Math.cos($mul(2, angle)) - 2 * Math.cos($mul(3, angle)) - Math.cos($mul(4, angle)));
      [x, y] = $unpack([$mul($mul(x, scale), rad) / 17, $mul($mul(y, scale), rad) / 17], 2);
      [px, py] = $unpack([$add(cx, $mul(x, 4)), $add(cy, $mul(y, 2))], 2);
      if (l < px && px < r && (top < py && py < bt3)) {
        brightness = $mul(rad, $add(1, $mul(pulse, 0.3)));
        c.put(px, py, brightness > 0.8 ? "#" : brightness > 0.5 ? "*" : ".", brightness > 0.9 ? W : brightness > 0.6 ? B : N);
      }
    }
  }
  if (elapsed > 1) {
    c.center(cy, "\u2665", R);
  }
}
function legacy_panel(c, x, y, w, h2, label) {
  clear(c, x, y, w, h2);
  c.box(x, y, w, h2, D);
  c.put($add(x, 2), y, " " + $slice(label, null, $max(0, w - 6), null) + " ", N);
}
function legacy_workspace(c, t, top, bt3, label, status = "ACTIVE") {
  let sweep, i8, b2, ops, a, j3, yy, height, right, left, k2, ph, rx, lx, side;
  c.put(2, top, label, W);
  c.put($max(3, c.w - $len(status) - 3), top, status, B);
  c.put(2, $add(top, 1), $mul("-", c.w - 4), G);
  side = c.w >= 100 ? $min(25, $max(17, Math.floor(c.w / 6))) : 0;
  if ($truth(side)) {
    lx = 2;
    rx = c.w - side - 2;
    ph = bt3 - top - 2;
    legacy_panel(c, lx, $add(top, 2), side, ph, "REGISTER");
    legacy_panel(c, rx, $add(top, 2), side, ph, "PROCESS");
    k2 = $int($mul(t, 7));
    left = ["PID 0001 : ME", "UID 0002 : YOU", "PC  " + $fmt(hash16(k2), "04X"), "SP  " + $fmt(hash16($add(k2, 3)), "04X")];
    right = ["STATE " + $slice(status, null, 7, null), "TICK " + $fmt($int($mul(t, 120)), "06d"), "CALL " + $fmt(hash16($add(k2, 7)), "04X"), "FLAGS Z C O S"];
    height = ph - 2;
    for (let $t305 = $int(0), $t306 = $int(height), $t307 = 1; $t307 > 0 ? $t305 < $t306 : $t305 > $t306; $t305 += $t307) {
      i8 = $t305;
      yy = $add($add(top, 3), i8);
      if (i8 < $len(left)) {
        a = $at(left, i8);
        b2 = $at(right, i8);
      } else if (i8 === 5) {
        a = "HEAP ALLOCATION";
        b2 = "STACK TRACE";
      } else {
        j3 = $add(k2, i8);
        a = $fmt($mul(i8, 16), "04X") + " " + $fmt(hash16(j3), "04X") + " " + $fmt(hash16($add(j3, 19)), "04X");
        ops = ["LOAD", "PUSH", "CALL", "WAIT", "COPY", "SYNC", "RET ", "JMP "];
        b2 = $fmt($at(ops, $mod(j3, 8)), "") + " @" + $fmt(hash16($mul(j3, 3)), "04X");
      }
      c.put($add(lx, 2), yy, $slice(a, null, side - 4, null), i8 < 4 ? N : G);
      c.put($add(rx, 2), yy, $slice(b2, null, side - 4, null), i8 < 4 ? N : G);
    }
    sweep = $mod($int($mul(t, 8)), $max(1, height));
    c.put($add(lx, 1), $add($add(top, 3), sweep), ">", B);
    c.put($add(rx, side) - 2, $add($add(top, 3), height - 1 - sweep), "<", B);
  }
  return [$truth(side) ? $add(side, 4) : 4, $add(top, 3), $truth(side) ? c.w - side - 5 : c.w - 5, bt3 - 1];
}
function legacy_mesh(c, t, area, form = "torus", pulse = 0) {
  let x, yy, z3, a, b2, light, l, y, r, bt3, ramp, u, v2, p, xx, zz, radius, zbuf;
  zbuf = new PyDict([]);
  for (let $t308 = $int(0), $t309 = $int(78), $t310 = 1; $t310 > 0 ? $t308 < $t309 : $t308 > $t309; $t308 += $t310) {
    u = $t308;
    a = $mul(u, TAU) / 78;
    for (let $t311 = $int(0), $t312 = $int(26), $t313 = 1; $t313 > 0 ? $t311 < $t312 : $t311 > $t312; $t311 += $t313) {
      v2 = $t311;
      b2 = $mul(v2, TAU) / 26;
      if (form === "torus") {
        x = (0.76 + 0.29 * Math.cos(b2)) * Math.cos(a);
        y = (0.76 + 0.29 * Math.cos(b2)) * Math.sin(a);
        z3 = 0.29 * Math.sin(b2);
      } else if (form === "sphere") {
        x = Math.sin(b2) * Math.cos(a);
        y = Math.cos(b2);
        z3 = Math.sin(b2) * Math.sin(a);
      } else if (form === "heart") {
        radius = 0.5 + 0.5 * Math.cos(b2);
        x = $mul(16 * Math.sin(a) ** 3 / 17, radius);
        y = $mul(-(13 * Math.cos(a) - 5 * Math.cos($mul(2, a)) - 2 * Math.cos($mul(3, a)) - Math.cos($mul(4, a))) / 17, radius);
        z3 = 0.38 * Math.sin(b2) * Math.sin(a);
        x = $mul(x, $add(1, $mul(pulse, 0.12)));
        y = $mul(y, $add(1, $mul(pulse, 0.12)));
      } else if (form === "eggplant") {
        x = Math.sin(b2) * Math.cos(a) * (0.43 + 0.16 * Math.cos(b2));
        y = Math.cos(b2) * 1.2;
        z3 = Math.sin(b2) * Math.sin(a) * 0.6;
      } else if (form === "tomato") {
        x = Math.sin(b2) * Math.cos(a);
        y = Math.cos(b2) * 0.68;
        z3 = Math.sin(b2) * Math.sin(a);
      } else {
        x = (0.68 + 0.25 * Math.cos($add($mul(3, a), b2))) * Math.cos($mul(2, a));
        y = (0.68 + 0.25 * Math.cos($add($mul(3, a), b2))) * Math.sin($mul(2, a));
        z3 = 0.5 * Math.sin($add($mul(3, a), b2));
      }
      [xx, yy, zz] = $unpack(point(x, y, z3, area, form !== "heart" ? t : Math.sin($mul(t, 0.45)) * 1.2), 3);
      p = [$round(xx), $round(yy)];
      if (!$in(p, zbuf) || zz < $at($at(zbuf, p), 0)) {
        $setitem(zbuf, p, [zz, a, b2]);
      }
    }
  }
  ramp = ".,:;=+*#@";
  [l, y, r, bt3] = $unpack(area, 4);
  for (const $t314 of $iter($items(zbuf))) {
    [[x, yy], [z3, a, b2]] = $unpack($t314, 2);
    if (!(l <= x && x <= r && (y <= yy && yy <= bt3))) {
      continue;
    }
    light = clamp(0.45 - $mul(z3, 0.3) + Math.sin($add($add($mul(a, 2), b2), $mul(t, 0.3))) * 0.13);
    c.put(x, yy, $at(ramp, $int($mul(light, $len(ramp) - 1))), light > 0.77 ? B : light > 0.4 ? N : G);
  }
}
function legacy_ring(c, t, area, turns = 3) {
  let k2, j3, aa2, a, i8, yy, x, rr2, cy, cx, l, y, r, b2;
  [l, y, r, b2] = $unpack(area, 4);
  cx = $add(l, r) / 2;
  cy = $add(y, b2) / 2;
  for (let $t315 = $int(0), $t316 = $int(turns), $t317 = 1; $t317 > 0 ? $t315 < $t316 : $t315 > $t316; $t315 += $t317) {
    k2 = $t315;
    rr2 = $add(0.32, $mul(k2, 0.058));
    for (let $t318 = $int(0), $t319 = $int(140), $t320 = 1; $t320 > 0 ? $t318 < $t319 : $t318 > $t319; $t318 += $t320) {
      i8 = $t318;
      a = $mul(i8, TAU) / 140;
      if ($mod($add(i8, $mul(k2, 9)), 23) < 5) {
        continue;
      }
      x = $add(cx, $mul(Math.cos(a) * (r - l), rr2));
      yy = $add(cy, $mul(Math.sin(a) * (b2 - y), rr2));
      c.put(x, yy, $truth($mod(k2, 2)) ? "." : ":", k2 !== 1 ? G : D);
    }
    a = $add($mul(t, $add(0.6, $mul(k2, 0.1))), $mul(k2, 2));
    for (let $t321 = $int(0), $t322 = $int(14), $t323 = 1; $t323 > 0 ? $t321 < $t322 : $t321 > $t322; $t321 += $t323) {
      j3 = $t321;
      aa2 = a - $mul(j3, 0.018);
      c.put($add(cx, $mul(Math.cos(aa2) * (r - l), rr2)), $add(cy, $mul(Math.sin(aa2) * (b2 - y), rr2)), j3 === 0 ? "+" : ".", j3 === 0 ? W : G);
    }
  }
}
function legacy_organic(c, t, top, bt3, pulse) {
  let k2, xx, yy, target, s15, j3, es2, vs3, cy, cx, l, y, r, b2, area, resource, subject, i8;
  i8 = t < 77.576 ? 0 : t < 81.351 ? 1 : t < 85.078 ? 2 : 3;
  subject = $at(["EGGPLANT", "TOMATO", "TABBY CAT", "GOD"], i8);
  resource = $at(["NUTRIENTS", "ANTIOXIDANTS", "ENJOYMENT", "EXISTENCE"], i8);
  area = legacy_workspace(c, t, top, bt3, "TYPE CAST / " + subject, "EXPORT");
  [l, y, r, b2] = $unpack(area, 4);
  cx = $add(l, r) / 2;
  cy = $add(y, b2) / 2;
  if ($in(i8, [0, 1])) {
    legacy_mesh(c, t, [l, y, $add(cx, 6), b2], i8 === 0 ? "eggplant" : "tomato");
  } else if (i8 === 2) {
    vs3 = [[-0.9, -0.8, 0], [-0.75, 0.4, 0], [0, 0.75, 0], [0.75, 0.4, 0], [0.9, -0.8, 0], [0.4, -0.4, 0], [-0.4, -0.4, 0], [-0.28, 0, -0.1], [0.28, 0, -0.1], [0, 0.25, -0.2]];
    es2 = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [7, 9], [8, 9], [5, 8], [6, 7]];
    projected(c, vs3, es2, [l, y, $add(cx, 8), b2], Math.sin(t) * 0.5);
    for (const $t324 of $iter([-1, 1])) {
      s15 = $t324;
      for (let $t325 = $int(0), $t326 = $int(3), $t327 = 1; $t327 > 0 ? $t325 < $t326 : $t325 > $t326; $t325 += $t327) {
        j3 = $t325;
        c.line($add(l, (cx - l) / 2), $add(cy, 1), $add($add(l, (cx - l) / 2), $mul(s15, 11)), $add(cy, j3) - 1, ".", N);
      }
    }
  } else {
    legacy_mesh(c, t, [l, y, $add(cx, 8), b2], "sphere");
    legacy_ring(c, t, [l, y, $add(cx, 8), b2], 4);
  }
  target = $round(mix(cx, r, 0.67));
  c.box(target - 5, $int(cy - 2), 11, 5, N);
  c.put(target - 3, cy, "YOU_02", W);
  for (let $t328 = $int(0), $t329 = $int(5), $t330 = 1; $t330 > 0 ? $t328 < $t329 : $t328 > $t329; $t328 += $t330) {
    k2 = $t328;
    yy = $add(cy - 2, k2);
    c.line(cx - 1, yy, target - 6, yy, ".", G);
    xx = mix(cx, target - 6, $mod($add($mul(t, 0.8), $mul(k2, 0.2)), 1));
    c.put(xx, yy, ">>", k2 === 2 ? B : D);
  }
  c.center(y, "convert(self, " + $fmt(resource.toLowerCase(), "") + ");", W);
  c.center(b2, "TX " + $fmt($int($mod(t, 3) / 3 * 65535), "04X") + "  |  " + $fmt(resource, "") + " -> YOU  |  ACK", N);
}
function legacy_phosphor(c, t, top, bt3) {
  let source, shift, yy, x, ch, s15, row;
  row = $add(top, $mod($int($mul(t, 9)), $max(1, bt3 - top + 1)));
  for (let $t331 = $int(2), $t332 = $int(c.w - 2), $t333 = 1; $t333 > 0 ? $t331 < $t332 : $t331 > $t332; $t331 += $t333) {
    x = $t331;
    [ch, s15] = $unpack($at($at(c.cells, row), x), 2);
    if (!$in(ch, ["", " "]) && $in(s15, [D, N, G])) {
      $setitem($at(c.cells, row), x, [ch, $eq(s15, G) ? N : B]);
    }
  }
  if (125.708 < t && t < 177.246 && $in($mod($int($mul(t, 13)), 17), [0, 1])) {
    yy = $add(top, $mod(hash16($int($mul(t, 13))), $max(1, bt3 - top)));
    shift = $truth($mod($int($mul(t, 13)), 2)) ? 2 : -3;
    source = $slice($at(c.cells, yy), 2, -2, null);
    source = $add($slice(source, -shift, null, null), $slice(source, null, -shift, null));
    $setslice($at(c.cells, yy), 2, -2, source);
  }
}
function lyric_god_existence(c, t, area, elapsed) {
  let ring, i8, brightness, y, x, angle, density, radius, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  for (let $t344 = $int(0), $t345 = $int(8), $t346 = 1; $t346 > 0 ? $t344 < $t345 : $t344 > $t345; $t344 += $t346) {
    ring = $t344;
    radius = $add($add(5, $mul(ring, 4)), Math.sin($add($mul(t, 2), ring)) * 2);
    density = 60 - $mul(ring, 5);
    for (let $t347 = $int(0), $t348 = $int(density), $t349 = 1; $t349 > 0 ? $t347 < $t348 : $t347 > $t348; $t347 += $t349) {
      i8 = $t347;
      angle = $add($mul(i8, TAU) / density, $mul($mul(t, 0.1), (-1) ** ring));
      x = $add(cx, $mul(Math.cos(angle), radius));
      y = $add(cy, $mul($mul(Math.sin(angle), radius), 0.5));
      brightness = 1 - ring / 8;
      c.put(x, y, brightness > 0.7 ? "*" : brightness > 0.4 ? "+" : ".", brightness > 0.8 ? W : brightness > 0.5 ? B : N);
    }
  }
  c.center(cy, "GOD", W);
  c.center($add(cy, 2), "YOU", B);
}
function identity_bitmap(c, x, y, text3, sx, sy, ink, fill = 1, seed = 0) {
  let index2, ch, dy, row, dx, pixel, py, px, on3, yy, xx, glyphs;
  glyphs = new PyDict([["F", ["11111", "11000", "11110", "11000", "11000"]], ["M", ["10001", "11011", "10101", "10001", "10001"]], ["A", ["01110", "11011", "11111", "11011", "11011"]], ["P", ["11110", "11011", "11110", "11000", "11000"]]]);
  for (const $t350 of $iter($enumerate(text3))) {
    [index2, ch] = $unpack($t350, 2);
    for (const $t351 of $iter($enumerate($at(glyphs, ch)))) {
      [dy, row] = $unpack($t351, 2);
      for (const $t352 of $iter($enumerate(row))) {
        [dx, pixel] = $unpack($t352, 2);
        if (pixel === "1") {
          for (let $t353 = $int(0), $t354 = $int(sy), $t355 = 1; $t355 > 0 ? $t353 < $t354 : $t353 > $t354; $t353 += $t355) {
            py = $t353;
            for (let $t356 = $int(0), $t357 = $int(sx), $t358 = 1; $t358 > 0 ? $t356 < $t357 : $t356 > $t357; $t356 += $t358) {
              px = $t356;
              xx = $add($add(x, $mul($add($mul(index2, 6), dx), sx)), px);
              yy = $add($add(y, $mul(dy, sy)), py);
              on3 = hash16($add($add($add($add($mul($add($mul(index2, 31), dx), 73), $mul(dy, 137)), $mul(px, 19)), py), seed)) / 65535 <= fill;
              c.put(xx, yy, $truth(on3) ? "#" : ".", $truth(on3) ? ink : G);
            }
          }
        }
      }
    }
  }
}
function lyric_identity_rewrite(c, t, area) {
  let i8, yy, yoff, x, p, progress, row, tick, y, right_c, left_c, glyph_h, glyph_w, sy, sx, u, age, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  age = t - 88.587;
  u = clamp((t - 90.197) / 1.25);
  sx = $max(2, $min(6, Math.floor((r - l) / 22)));
  sy = $max(1, $min(5, Math.floor((bt3 - top - 8) / 5)));
  glyph_w = $mul(5, sx);
  glyph_h = $mul(5, sy);
  left_c = Math.floor($add(l, cx) / 2);
  right_c = Math.floor($add(cx, r) / 2);
  y = cy - Math.floor(glyph_h / 2);
  c.center(top, "SELF.GENDER / PARAMETER REWRITE", W);
  c.center($add(top, 1), "F -> M / TRANSMIT IDENTITY", B);
  c.box(l, $add(top, 3), cx - l - 1, bt3 - top - 5, G);
  c.box($add(cx, 2), $add(top, 3), r - cx - 1, bt3 - top - 5, G);
  for (let $t359 = $int($add(top, 4)), $t360 = $int(bt3 - 2), $t361 = 2; $t361 > 0 ? $t359 < $t360 : $t359 > $t360; $t359 += $t361) {
    row = $t359;
    tick = $add($int($mul(age, 18)), row);
    c.put($add(l, 2), row, $fmt(hash16(tick), "04X"), G);
    c.put(r - 5, row, $fmt(hash16($add(tick, 79)), "04X"), G);
  }
  for (let $t362 = $int(0), $t363 = $int(6), $t364 = 1; $t364 > 0 ? $t362 < $t363 : $t362 > $t363; $t362 += $t364) {
    i8 = $t362;
    yy = $add($add(top, 4), $mul(i8, $max(1, Math.floor((bt3 - top - 8) / 5))));
    c.line($add(l, 7), yy, r - 7, yy, ".", G);
    progress = $mod($add($mul(age, 0.9), $mul(i8, 0.17)), 1);
    x = mix(left_c, right_c, progress);
    c.put(x, yy, ">>", $truth(u) ? W : B);
  }
  clear(c, left_c - Math.floor(glyph_w / 2) - 1, y - 1, $add(glyph_w, 2), $add(glyph_h, 2));
  clear(c, right_c - Math.floor(glyph_w / 2) - 1, y - 1, $add(glyph_w, 2), $add(glyph_h, 2));
  identity_bitmap(c, left_c - Math.floor(glyph_w / 2), y, "F", sx, sy, W, 1 - u);
  identity_bitmap(c, right_c - Math.floor(glyph_w / 2), y, "M", sx, sy, W, u);
  if (0 < u && u < 1) {
    for (let $t365 = $int(0), $t366 = $int(44), $t367 = 1; $t367 > 0 ? $t365 < $t366 : $t365 > $t366; $t365 += $t367) {
      i8 = $t365;
      p = clamp($mul(u, 1.6) - $mod(i8, 11) / 18);
      x = mix(left_c, right_c, p);
      yoff = $mod(hash16($mul(i8, 31)), $max(1, glyph_h)) - glyph_h / 2;
      yy = $add($add(cy, yoff), $mul($mul(Math.sin($mul(p, Math.PI)), $truth($mod(i8, 2)) ? 1 : -1), 3));
      c.put(x, yy, $at("01#", $mod(i8, 3)), $mod(i8, 4) === 0 ? W : B);
    }
  }
  c.put(left_c - 4, bt3 - 3, "SOURCE F", u < 1 ? N : G);
  c.put(right_c - 4, bt3 - 3, "TARGET M", u >= 1 ? W : N);
  c.center(bt3 - 1, "WRITE " + $fmt($int($mul(u, 100)), "03d") + "% / " + (u >= 1 ? "COMMITTED" : !$truth(u) ? "COMPILING" : "REASSEMBLING"), B);
  c.center(bt3, u >= 1 ? "self.gender = 'M';" : "self.gender: F -> M", W);
}
function lyric_daynight_clock(c, t, area) {
  let minute, hour, yy, y0, glyph_h, glyph_w, sy, sx, star, y, x, ray, a, i8, radius, trail, minute_angle, hour_angle, ry, rx, display_x, clock_x, virtual, is_pm, flip_at, age, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  age = t - 92.015;
  flip_at = 94.55;
  is_pm = t >= flip_at;
  virtual = !$truth(is_pm) ? 6 + 6 * clamp((t - 92.015) / (flip_at - 92.015)) : 12 + 6 * clamp((t - flip_at) / (95.465 - flip_at));
  clock_x = Math.floor($add(l, cx) / 2);
  display_x = Math.floor($add(cx, r) / 2);
  rx = $max(6, (cx - l) * 0.43);
  ry = $max(3, (bt3 - top - 6) * 0.43);
  c.center(top, "CLOCK.CYCLE / AM -> PM", W);
  c.center($add(top, 1), "DAYLIGHT -> NIGHT / TIME ACCELERATING", B);
  for (let $t368 = $int(0), $t369 = $int(180), $t370 = 1; $t370 > 0 ? $t368 < $t369 : $t368 > $t369; $t368 += $t370) {
    i8 = $t368;
    a = $mul(i8, TAU) / 180;
    c.put($add(clock_x, $mul(Math.sin(a), rx)), cy - $mul(Math.cos(a), ry), ".", N);
  }
  for (let $t371 = $int(0), $t372 = $int(12), $t373 = 1; $t373 > 0 ? $t371 < $t372 : $t371 > $t372; $t371 += $t373) {
    hour = $t371;
    a = $mul(hour, TAU) / 12;
    c.line($add(clock_x, $mul($mul(Math.sin(a), rx), 0.9)), cy - $mul($mul(Math.cos(a), ry), 0.9), $add(clock_x, $mul(Math.sin(a), rx)), cy - $mul(Math.cos(a), ry), "#", B);
    c.put($add(clock_x, $mul($mul(Math.sin(a), rx), 0.77)) - 1, cy - $mul($mul(Math.cos(a), ry), 0.77), $str(hour || 12), N);
  }
  hour_angle = $mul(virtual / 12, TAU);
  minute_angle = $mul($mod(virtual, 1), TAU);
  for (let $t374 = $int(4), $t375 = $int(0), $t376 = -1; $t376 > 0 ? $t374 < $t375 : $t374 > $t375; $t374 += $t376) {
    trail = $t374;
    a = minute_angle - $mul(trail, 0.13);
    c.line(clock_x, cy, $add(clock_x, $mul($mul(Math.sin(a), rx), 0.8)), cy - $mul($mul(Math.cos(a), ry), 0.8), ".", G);
  }
  c.line(clock_x, cy, $add(clock_x, $mul($mul(Math.sin(hour_angle), rx), 0.52)), cy - $mul($mul(Math.cos(hour_angle), ry), 0.52), "#", B);
  c.line(clock_x, cy, $add(clock_x, $mul($mul(Math.sin(minute_angle), rx), 0.83)), cy - $mul($mul(Math.cos(minute_angle), ry), 0.83), "*", W);
  c.put(clock_x, cy, "@", W);
  c.line(cx, $add(top, 3), cx, bt3 - 3, "|", G);
  radius = $max(3, $min((r - cx) * 0.22, (bt3 - top) * 0.34));
  for (let $t377 = $int(0), $t378 = $int(120), $t379 = 1; $t379 > 0 ? $t377 < $t378 : $t377 > $t378; $t377 += $t379) {
    i8 = $t377;
    a = $mul(i8, TAU) / 120;
    x = $add(display_x, $mul($mul(Math.cos(a), radius), 1.6));
    y = $add(cy, $mul(Math.sin(a), radius));
    if ($truth(!$truth(is_pm) || Math.cos(a) < 0.45)) {
      c.put(x, y, ":", $truth(is_pm) ? G : N);
    }
  }
  if (!$truth(is_pm)) {
    for (let $t380 = $int(0), $t381 = $int(16), $t382 = 1; $t382 > 0 ? $t380 < $t381 : $t380 > $t381; $t380 += $t382) {
      ray = $t380;
      a = $add($mul(ray, TAU) / 16, $mul(age, 0.25));
      c.line($add(display_x, $mul($mul(Math.cos(a), radius), 1.8)), $add(cy, $mul($mul(Math.sin(a), radius), 1.1)), $add(display_x, $mul($mul(Math.cos(a), radius), 2.1)), $add(cy, $mul($mul(Math.sin(a), radius), 1.3)), ".", G);
    }
  } else {
    for (let $t383 = $int(0), $t384 = $int(22), $t385 = 1; $t385 > 0 ? $t383 < $t384 : $t383 > $t384; $t383 += $t385) {
      star = $t383;
      x = $add($add(cx, 2), $mod(hash16($mul(star, 31)), $max(1, r - cx - 4)));
      y = $add($add(top, 3), $mod(hash16($mul(star, 79)), $max(1, bt3 - top - 6)));
      c.put(x, y, $mod($add($int($mul(age, 5)), star), 5) === 0 ? "+" : ".", G);
    }
  }
  sx = $max(1, $min(4, Math.floor((r - cx - 6) / 11)));
  sy = $max(1, $min(4, Math.floor((bt3 - top - 8) / 5)));
  glyph_w = $mul(11, sx);
  glyph_h = $mul(5, sy);
  y0 = cy - Math.floor(glyph_h / 2);
  clear(c, display_x - Math.floor(glyph_w / 2) - 1, y0 - 1, $add(glyph_w, 2), $add(glyph_h, 2));
  identity_bitmap(c, display_x - Math.floor(glyph_w / 2), y0, $truth(is_pm) ? "PM" : "AM", sx, sy, W);
  if (0 <= t - flip_at && t - flip_at < 0.22) {
    yy = $add(y0, $int($mul((t - flip_at) / 0.22, glyph_h)));
    c.put(display_x - Math.floor(glyph_w / 2), yy, $mul("=", glyph_w), W);
  }
  hour = $mod($int(virtual), 24);
  minute = $int($mul($mod(virtual, 1), 60));
  c.put(display_x - 2, $min(bt3 - 3, $add($add(y0, glyph_h), 1)), $fmt(hour, "02d") + ":" + $fmt(minute, "02d"), W);
  c.center(bt3 - 1, $truth(is_pm) ? "[ PM / NIGHT CYCLE ]" : "[ AM / DAY CYCLE ]", B);
  c.center(bt3, "do_whatever();  // AM -> PM", N);
}
function lyric_gender_role_switch(c, t, area, elapsed, from_label, to_label) {
  let dy, dx, dist, center_char, size, ring, i8, y, x, angle, density, ring_r, circles, radius, trans, r_step, spike_y, spike_x, spike_r, base_r, spike_count, wave_y, offset, amplitude, wave, row, pattern, display_hour, digit_y, hour_shown, digit_x, phase, step, minute_length, minute_angle, hour_length, hour_angle, current_hour, end_hour, start_hour, hour, radius_clock, center_symbol, scale, burst_i, by, bx, burst_r, burst_angle, burst_progress, style, symbol, radius_base, progress, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  progress = clamp(elapsed / 2.5);
  if (from_label === "F" && to_label === "M") {
    for (let $t386 = $int(0), $t387 = $int(150), $t388 = 1; $t388 > 0 ? $t386 < $t387 : $t386 > $t387; $t386 += $t388) {
      i8 = $t386;
      angle = $add($mul(i8, 2.4), $mul(t, 0.5));
      radius_base = Math.sqrt(i8) * 4;
      radius = $add(radius_base, Math.sin($add($mul(t, 2), $mul(i8, 0.1))) * 3);
      x = $add(cx, $mul(Math.cos(angle), radius));
      y = $add(cy, $mul($mul(Math.sin(angle), radius), 0.5));
      if (progress < 0.3) {
        symbol = "\u2640";
        style = $mod(i8, 5) === 0 ? W : $mod(i8, 3) === 0 ? B : N;
      } else if (progress < 0.7) {
        symbol = $mod($add(i8, $int($mul(t, 10))), 2) === 0 ? "\u2640" : "\u2642";
        style = $mod($add(i8, $int($mul(t, 20))), 3) === 0 ? R : $mod(i8, 4) === 0 ? W : B;
      } else {
        symbol = "\u2642";
        style = $mod(i8, 5) === 0 ? W : $mod(i8, 3) === 0 ? B : N;
      }
      c.put(x, y, symbol, style);
    }
    if (0.3 < progress && progress < 0.7) {
      burst_progress = (progress - 0.3) / 0.4;
      for (let $t389 = $int(0), $t390 = $int(60), $t391 = 1; $t391 > 0 ? $t389 < $t390 : $t389 > $t390; $t389 += $t391) {
        burst_i = $t389;
        burst_angle = $add($mul(burst_i, TAU) / 60, $mul(t, 3));
        burst_r = $mul(burst_progress, 50);
        bx = $add(cx, $mul(Math.cos(burst_angle), burst_r));
        by = $add(cy, $mul($mul(Math.sin(burst_angle), burst_r), 0.5));
        c.put(bx, by, $mod(burst_i, 3) === 0 ? "\u26A5" : "*", W);
      }
    }
    scale = $int(8 + $int(Math.sin($mul(t, 2)) * 2));
    center_symbol = progress < 0.5 ? "\u2640" : "\u2642";
    for (let $t392 = $int(-scale), $t393 = $int($add(scale, 1)), $t394 = 1; $t394 > 0 ? $t392 < $t393 : $t392 > $t393; $t392 += $t394) {
      dy = $t392;
      for (let $t395 = $int($mul(-scale, 2)), $t396 = $int($add($mul(scale, 2), 1)), $t397 = 1; $t397 > 0 ? $t395 < $t396 : $t395 > $t396; $t395 += $t397) {
        dx = $t395;
        dist = Math.hypot(dx / 2, dy);
        if (dist < scale) {
          c.put($add(cx, dx), $add(cy, dy), center_symbol, dist < $mul(scale, 0.4) ? W : dist < $mul(scale, 0.7) ? B : N);
        }
      }
    }
  } else if (from_label === "AM" && to_label === "PM") {
    radius_clock = $int($min(r - l, bt3 - top) * 0.35);
    for (let $t398 = $int(0), $t399 = $int(120), $t400 = 1; $t400 > 0 ? $t398 < $t399 : $t398 > $t399; $t398 += $t400) {
      i8 = $t398;
      angle = $mul(i8, TAU) / 120;
      x = $add(cx, $mul(Math.cos(angle), radius_clock));
      y = $add(cy, $mul($mul(Math.sin(angle), radius_clock), 0.5));
      c.put(x, y, $mod(i8, 10) === 0 ? "\u25CB" : "\xB7", B);
    }
    for (const $t401 of $iter([0, 3, 6, 9])) {
      hour = $t401;
      angle = $mul(hour, TAU) / 12 - TAU / 4;
      x = $add(cx, $mul($mul(Math.cos(angle), radius_clock), 0.85));
      y = $add(cy, $mul($mul($mul(Math.sin(angle), radius_clock), 0.85), 0.5));
      c.put(x, y, $fmt(hour !== 0 ? hour : 12, ""), W);
    }
    start_hour = 6;
    end_hour = 18;
    current_hour = mix(start_hour, end_hour, progress);
    hour_angle = $mul(current_hour, TAU) / 12 - TAU / 4;
    hour_length = $int($mul(radius_clock, 0.5));
    for (let $t402 = $int(0), $t403 = $int(hour_length), $t404 = 1; $t404 > 0 ? $t402 < $t403 : $t402 > $t403; $t402 += $t404) {
      step = $t402;
      x = $add(cx, $mul(Math.cos(hour_angle), step));
      y = $add(cy, $mul($mul(Math.sin(hour_angle), step), 0.5));
      c.put(x, y, "\u2550", step > $mul(hour_length, 0.7) ? W : B);
    }
    minute_angle = $mod($mul(t, 6), TAU) - TAU / 4;
    minute_length = $int($mul(radius_clock, 0.7));
    for (let $t405 = $int(0), $t406 = $int(minute_length), $t407 = 1; $t407 > 0 ? $t405 < $t406 : $t405 > $t406; $t405 += $t407) {
      step = $t405;
      x = $add(cx, $mul(Math.cos(minute_angle), step));
      y = $add(cy, $mul($mul(Math.sin(minute_angle), step), 0.5));
      c.put(x, y, "\u2500", step > $mul(minute_length, 0.8) ? B : N);
    }
    for (let $t408 = $int(0), $t409 = $int($int((bt3 - top) * 0.6)), $t410 = 1; $t410 > 0 ? $t408 < $t409 : $t408 > $t409; $t408 += $t410) {
      digit_y = $t408;
      phase = $mod($add($mul(progress, 3), $mul(digit_y, 0.05)), 1);
      if (phase < 0.8) {
        digit_x = $int($add(cx, Math.sin($mul(phase, TAU)) * 30));
        hour_shown = $mod($int(mix(6, 18, phase)), 24);
        c.put(digit_x, $add(top, digit_y), $fmt(hour_shown, "02d"), phase > 0.6 ? W : phase > 0.3 ? B : G);
      }
    }
    display_hour = $mod($int(current_hour), 24);
    c.center($add(cy, $int((bt3 - top) * 0.25)), $fmt(display_hour, "02d") + ":00", W);
    c.center($add(cy, $int((bt3 - top) * 0.32)), current_hour < 12 ? "AM" : "PM", current_hour >= 12 ? R : B);
  } else {
    if (progress < 0.5) {
      for (let $t411 = $int(top), $t412 = $int($add(bt3, 1)), $t413 = 3; $t413 > 0 ? $t411 < $t412 : $t411 > $t412; $t411 += $t413) {
        row = $t411;
        for (let $t414 = $int(l), $t415 = $int(r), $t416 = 8; $t416 > 0 ? $t414 < $t415 : $t414 > $t415; $t414 += $t416) {
          x = $t414;
          offset = $int($mod($add($mul(t, 10), row), 8));
          pattern = $mod(row, 6) < 3 ? "\u2571\u2572" : "\u2572\u2571";
          c.put($add(x, offset), row, $at(pattern, 0), N);
          c.put($add($add(x, offset), 1), row, $at(pattern, 1), N);
        }
      }
    } else {
      for (let $t417 = $int(0), $t418 = $int(12), $t419 = 1; $t419 > 0 ? $t417 < $t418 : $t417 > $t418; $t417 += $t419) {
        wave_y = $t417;
        y = $add(top, $int($mul(wave_y, bt3 - top) / 11));
        for (let $t420 = $int(l), $t421 = $int(r), $t422 = 1; $t422 > 0 ? $t420 < $t421 : $t420 > $t421; $t420 += $t422) {
          x = $t420;
          wave = $mul($mul((x - l) / (r - l), TAU), 3) - $mul(t, 2);
          amplitude = (bt3 - top) * 0.1 * (progress - 0.5) * 2;
          offset = $int($mul(Math.sin(wave), amplitude));
          c.put(x, $add(y, offset), $mod(wave_y, 2) === 0 ? "~" : "\u2248", $mod(wave_y, 3) === 0 ? B : N);
        }
      }
    }
    if (progress < 0.4) {
      spike_count = 8;
      for (let $t423 = $int(0), $t424 = $int(spike_count), $t425 = 1; $t425 > 0 ? $t423 < $t424 : $t423 > $t424; $t423 += $t425) {
        i8 = $t423;
        angle = $add($mul(i8, TAU) / spike_count, $mul(t, 0.5));
        base_r = 15;
        for (let $t426 = $int(0), $t427 = $int(20), $t428 = 1; $t428 > 0 ? $t426 < $t427 : $t426 > $t427; $t426 += $t428) {
          r_step = $t426;
          spike_r = $add(base_r, $mul(r_step, 1.5));
          spike_x = $add(cx, $mul(Math.cos(angle), spike_r));
          spike_y = $add(cy, $mul($mul(Math.sin(angle), spike_r), 0.5));
          if (Math.abs($mod(angle, TAU / spike_count)) < 0.2) {
            c.put(spike_x, spike_y, $mod(r_step, 2) === 0 ? "\u25B2" : "\u25B3", r_step > 15 ? W : r_step > 10 ? B : N);
          }
        }
      }
    } else if (progress < 0.6) {
      trans = (progress - 0.4) / 0.2;
      for (let $t429 = $int(0), $t430 = $int(80), $t431 = 1; $t431 > 0 ? $t429 < $t430 : $t429 > $t430; $t429 += $t431) {
        i8 = $t429;
        angle = $mul(i8, TAU) / 80;
        radius = $mul(trans, 60);
        x = $add($add(cx, $mul(Math.cos(angle), radius)), Math.sin($add($mul(t, 4), i8)) * 5 * (1 - trans));
        y = $add($add(cy, $mul($mul(Math.sin(angle), radius), 0.5)), Math.cos($add($mul(t, 4), i8)) * 3 * (1 - trans));
        c.put(x, y, $mod(i8, 3) === 0 ? "*" : "\xB7", trans < 0.5 ? W : B);
      }
    } else {
      circles = (progress - 0.6) / 0.4;
      for (let $t432 = $int(0), $t433 = $int(8), $t434 = 1; $t434 > 0 ? $t432 < $t433 : $t432 > $t433; $t432 += $t434) {
        ring = $t432;
        ring_r = $add(8, $mul(ring, 4));
        density = $int($mul(ring_r, 6));
        for (let $t435 = $int(0), $t436 = $int(density), $t437 = 1; $t437 > 0 ? $t435 < $t436 : $t435 > $t436; $t435 += $t437) {
          i8 = $t435;
          angle = $add($mul(i8, TAU) / density, $mul($mul(t, 0.3), (-1) ** ring));
          x = $add(cx, $mul(Math.cos(angle), ring_r));
          y = $add(cy, $mul($mul(Math.sin(angle), ring_r), 0.5));
          c.put(x, y, $mod(ring, 2) === 0 ? "\u25CB" : "\u25EF", ring < 3 ? W : ring < 5 ? B : N);
        }
      }
    }
    size = $int(10 + Math.sin($mul(t, 1.5)) * 1.5);
    if (!$truth($isinstance(size, ["int"]))) {
      size = $int(size);
    }
    center_char = progress < 0.5 ? "S" : "M";
    for (let $t438 = $int(-size), $t439 = $int($add(size, 1)), $t440 = 1; $t440 > 0 ? $t438 < $t439 : $t438 > $t439; $t438 += $t440) {
      dy = $t438;
      for (let $t441 = $int($mul(-size, 2)), $t442 = $int($add($mul(size, 2), 1)), $t443 = 1; $t443 > 0 ? $t441 < $t442 : $t441 > $t442; $t441 += $t443) {
        dx = $t441;
        dist = Math.hypot(dx / 2, dy);
        if ($mul(size, 0.3) < dist && dist < $mul(size, 0.8)) {
          c.put($add(cx, dx), $add(cy, dy), center_char, dist > $mul(size, 0.6) ? W : B);
        }
      }
    }
  }
  c.center(top, $fmt(from_label, "") + " \u2192 " + $fmt(to_label, ""), progress > 0.8 ? W : B);
  c.center(bt3, "TRANSFORMATION: " + $fmt($int($mul(progress, 100)), "") + "%", N);
}
function ecg_sample(phase) {
  let i8, x0, y0, x1, y1, points;
  points = [[0, 0], [0.08, 0], [0.12, 0.15], [0.17, 0], [0.28, 0], [0.31, -0.18], [0.35, 1], [0.39, -0.32], [0.43, 0], [0.52, 0], [0.6, 0.25], [0.7, 0], [1, 0]];
  phase = $mod(phase, 1);
  for (let $t444 = $int(1), $t445 = $int($len(points)), $t446 = 1; $t446 > 0 ? $t444 < $t445 : $t444 > $t445; $t444 += $t446) {
    i8 = $t444;
    [x1, y1] = $unpack($at(points, i8), 2);
    [x0, y0] = $unpack($at(points, i8 - 1), 2);
    if (phase <= x1) {
      return mix(y0, y1, (phase - x0) / (x1 - x0));
    }
  }
  return 0;
}
function lyric_vibration_sync(c, t, area, elapsed) {
  let status, indicator, lane, start, end, name, lag, tip, sample, previous_age, previous, char, dy, px, py, ink, yy, phase, signal_time, age, xx, amplitude, baseline, height, gap, head, sweep, speed, span, x1, x0, split, plot_bt, plot_top, title, bpm, phase_lag, complete, sync, compact, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  compact = bt3 - top < 19;
  sync = clamp((t - 107.22) / (110.221 - 107.22));
  complete = t >= 110.221;
  phase_lag = 0.28 * (1 - sync);
  bpm = 72;
  c.put(l, top, "ECG / DUAL CHANNEL", B);
  c.put(r - 10, top, $fmt(bpm, "03d") + " BPM", W);
  if (!$truth(compact)) {
    title = $truth(complete) ? "COMPLETION / RHYTHM LOCKED" : t >= 107.22 ? "PHASE SYNCHRONIZING" : t >= 106.293 ? "VIBRATIONS DETECTED" : "ACQUIRING YOUR HEARTBEAT";
    c.center($add(top, 1), title, $truth(complete) ? W : N);
  }
  plot_top = $add(top, $truth(compact) ? 2 : 4);
  plot_bt = bt3 - ($truth(compact) ? 1 : 3);
  split = Math.floor($add(plot_top, plot_bt) / 2);
  x0 = $add(l, 1);
  x1 = r - 1;
  span = x1 - x0 + 1;
  speed = span / 2.5;
  sweep = $add($mul(elapsed, speed), $mul(span, 0.3));
  head = $add(x0, $mod($int(sweep), span));
  gap = $max(2, $int($mul(span, 0.025)));
  for (let $t447 = $int(plot_top), $t448 = $int($add(plot_bt, 1)), $t449 = 1; $t449 > 0 ? $t447 < $t448 : $t447 > $t448; $t447 += $t449) {
    yy = $t447;
    for (let $t450 = $int(x0), $t451 = $int($add(x1, 1)), $t452 = 1; $t452 > 0 ? $t450 < $t451 : $t450 > $t451; $t450 += $t452) {
      xx = $t450;
      if ($mod(xx - x0, 10) === 0 && $mod(yy - plot_top, 3) === 0) {
        c.put(xx, yy, "+", G);
      } else if ($mod(yy - plot_top, 3) === 0 && $mod(xx - x0, 2) === 0) {
        c.put(xx, yy, ".", G);
      }
    }
  }
  for (let $t453 = $int(plot_top), $t454 = $int($add(plot_bt, 1)), $t455 = 1; $t455 > 0 ? $t453 < $t454 : $t453 > $t454; $t453 += $t455) {
    yy = $t453;
    c.put(head, yy, ":", G);
  }
  for (const $t456 of $iter($enumerate([[plot_top, split, "YOU", 0], [$add(split, 1), plot_bt, "ME", phase_lag]]))) {
    [lane, [start, end, name, lag]] = $unpack($t456, 2);
    height = end - start + 1;
    baseline = $add(start, $int((height - 1) * 0.68));
    amplitude = $max(1, (height - 2) * 0.58);
    c.put(x0, start, name, $truth(lane === 0 || complete) ? W : N);
    previous = null;
    for (let $t457 = $int(0), $t458 = $int($mul(span, 4)), $t459 = 1; $t459 > 0 ? $t457 < $t458 : $t457 > $t458; $t457 += $t459) {
      sample = $t457;
      xx = $add(x0, sample / 4);
      age = $mod(head - xx, span);
      if (age > span - gap) {
        previous = null;
        continue;
      }
      signal_time = elapsed - age / speed;
      phase = $mul(signal_time, bpm) / 60 - lag;
      yy = baseline - $mul(ecg_sample(phase), amplitude);
      yy = $max(start, $min(end, yy));
      ink = age < $mul(span, 0.1) ? W : age < $mul(span, 0.5) ? B : N;
      if ($truth(lane === 1 && !$truth(complete))) {
        ink = age < $mul(span, 0.15) ? B : N;
      }
      if (previous != null) {
        [px, py] = $unpack(previous, 2);
        if (Math.abs(age - previous_age) < 2) {
          dy = yy - py;
          char = Math.abs(dy) > 0.65 ? "|" : dy < -0.13 ? "/" : dy > 0.13 ? "\\" : "-";
          c.line(px, py, xx, yy, char, ink);
        }
      }
      previous = [xx, yy];
      previous_age = age;
    }
    tip = baseline - $mul(ecg_sample($mul(elapsed, bpm) / 60 - lag), amplitude);
    tip = $max(start, $min(end, tip));
    c.put(head - 1, tip, "=", B);
    c.put(head, tip, "@", W);
    if (!$truth(compact)) {
      c.put(x1 - 7, start, $truth(complete) ? "IN SYNC" : lane === 0 ? "SENSED" : "SEEKING", $truth(complete) ? B : N);
    }
  }
  indicator = ecg_sample($mul(elapsed, bpm) / 60) > 0.65 ? "*" : ".";
  if (!$truth(compact)) {
    c.put(l, bt3 - 1, "BEAT [" + $fmt(indicator, "") + "]  /  YOU -> ME", B);
    status = "SYNC " + $fmt($int($mul(sync, 100)), "03d") + "%  DELAY " + $fmt($int($mul(phase_lag, 1e3) / (bpm / 60)), "03d") + "ms";
    c.put(r - $len(status) + 1, bt3 - 1, status, $truth(complete) ? W : B);
  }
  c.center(bt3, $truth(complete) ? "[ COMPLETION / HEARTBEATS SYNCHRONIZED ]" : t < 107.22 ? "[ FEEL YOUR VIBRATIONS ]" : "[ MATCHING YOUR RHYTHM ]", $truth(complete) ? W : N);
}
function lyric_isolation_disconnect(c, t, area, elapsed) {
  let y, i8, cut, u, p, py, px, angle, particle, distance, velocity, oy, ox, drift, packet, j3, yy, xx, jitter, rupture, steps, next_a, age, ny, nx, a, side, row, tick, x, ring, sample, sweep, gone, breaks, ry, rx, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([$add(l, r) / 2, $add(top, bt3) / 2], 2);
  rx = (r - l) * 0.39;
  ry = $max(3, (bt3 - top - 6) * 0.39);
  breaks = [0.7, 1.32, 2.2, 3.28, 4.02, 4.88];
  gone = $sum((() => {
    const $r3 = [];
    for (const cut2 of $iter(breaks)) {
      $r3.push(elapsed >= cut2);
    }
    return $r3;
  })());
  c.center(top, "CONNECTION LOSS / " + $fmt(gone, "02d") + " OF 06", gone > 3 ? R : B);
  for (let $t460 = $int(0), $t461 = $int(3), $t462 = 1; $t462 > 0 ? $t460 < $t461 : $t460 > $t461; $t460 += $t462) {
    ring = $t460;
    sweep = $mod($add($mul(elapsed, 0.34), ring / 3), 1);
    for (let $t463 = $int(0), $t464 = $int(96), $t465 = 1; $t465 > 0 ? $t463 < $t464 : $t463 > $t464; $t463 += $t465) {
      sample = $t463;
      a = $mul(sample, TAU) / 96;
      if ($mod(sample, 7) < 4) {
        c.put($add(cx, $mul($mul(Math.cos(a), rx), sweep)), $add(cy, $mul($mul(Math.sin(a), ry), sweep)), ".", G);
      }
    }
  }
  for (const $t466 of $iter([0, 1])) {
    side = $t466;
    x = side === 0 ? l : r - 9;
    for (let $t467 = $int($add(top, 2)), $t468 = $int(bt3 - 1), $t469 = 2; $t469 > 0 ? $t467 < $t468 : $t467 > $t468; $t467 += $t469) {
      row = $t467;
      tick = $add($int($mul(elapsed, 13)), $mul(row, $truth(side) ? 1 : -1));
      c.put(x, row, $fmt(hash16($mul(tick, 31)), "04X") + " " + ($mod(hash16(tick), 6) < gone ? "LOST" : "PING"), $truth(side) ? G : N);
    }
  }
  for (const $t470 of $iter($enumerate(breaks))) {
    [i8, cut] = $unpack($t470, 2);
    a = $mul($add(i8, 0.5), TAU) / 6;
    nx = $add(cx, $mul(Math.cos(a), rx));
    ny = $add(cy, $mul(Math.sin(a), ry));
    age = elapsed - cut;
    next_a = $mul($add(i8, 1.5), TAU) / 6;
    if (age < 0.4) {
      c.line(nx, ny, $add(cx, $mul(Math.cos(next_a), rx)), $add(cy, $mul(Math.sin(next_a), ry)), ":", G);
    }
    steps = $max(12, $int(rx));
    rupture = clamp(age / 1.1);
    for (let $t471 = $int(0), $t472 = $int(steps), $t473 = 1; $t473 > 0 ? $t471 < $t472 : $t471 > $t472; $t471 += $t473) {
      j3 = $t471;
      u = j3 / $max(1, steps - 1);
      if (age >= 0 && Math.abs(u - 0.55) < $mul(rupture, 0.6)) {
        continue;
      }
      jitter = $mul(Math.sin($add($mul(j3, 2), $mul(elapsed, 35))), -0.35 < age && age < 0.5 ? 0.55 : 0.08);
      xx = mix(cx, nx, u);
      yy = $add(mix(cy, ny, u), jitter);
      c.put(xx, yy, -0.35 < age && age < 0.2 ? "=" : ".", -0.2 < age && age < 0.2 ? W : age < 0 ? N : G);
    }
    if (age < 0) {
      for (let $t474 = $int(0), $t475 = $int(3), $t476 = 1; $t476 > 0 ? $t474 < $t475 : $t474 > $t475; $t474 += $t476) {
        packet = $t474;
        u = $mod($add($add($mul(elapsed, 0.65), packet / 3), $mul(i8, 0.1)), 1);
        c.put(mix(nx, cx, u), mix(ny, cy, u), "*", W);
      }
      c.box($int(nx) - 4, $int(ny) - 1, 9, 3, B);
      c.put(nx - 3, ny, "YOU_" + $fmt($add(i8, 1), ""), W);
    } else {
      drift = $min(1, age / 2);
      ox = $add(nx, $mul($mul(Math.cos(a), drift), 4));
      oy = $add(ny, $mul($mul(Math.sin(a), drift), 2));
      c.put(ox - 3, oy, "[LOST]", age < 0.8 ? R : G);
      if (age < 2.3) {
        for (let $t477 = $int(0), $t478 = $int(22), $t479 = 1; $t479 > 0 ? $t477 < $t478 : $t477 > $t478; $t477 += $t479) {
          particle = $t477;
          angle = $mul(hash16($add($mul(i8, 97), $mul(particle, 19))) / 65535, TAU);
          velocity = 2 + $mod(hash16($add($mul(particle, 17), i8)), 8);
          distance = $mul(age, velocity);
          px = $add(nx, $mul(Math.cos(angle), distance));
          py = $add(ny, $mul($mul(Math.sin(angle), distance), 0.45));
          if (l < px && px < r && ($add(top, 1) < py && py < bt3 - 1)) {
            c.put(px, py, age < 0.3 ? "*" : $at("+:. ", $min(3, $int($mul(age, 1.5)))), age < 0.3 ? W : age < 0.9 ? B : G);
          }
        }
        for (let $t480 = $int(0), $t481 = $int(30), $t482 = 1; $t482 > 0 ? $t480 < $t481 : $t480 > $t481; $t480 += $t482) {
          p = $t480;
          angle = $mul(p, TAU) / 30;
          px = $add(nx, $mul($mul(Math.cos(angle), age), 8));
          py = $add(ny, $mul($mul(Math.sin(angle), age), 3.5));
          if (l < px && px < r && ($add(top, 1) < py && py < bt3 - 1)) {
            c.put(px, py, ":", age < 0.5 ? B : G);
          }
        }
      }
      u = $mul($mod($add($mul(elapsed, 0.6), $mul(i8, 0.16)), 1), 0.78);
      c.put(mix(cx, nx, u), mix(cy, ny, u), u > 0.63 ? "x" : ">", u > 0.63 ? R : N);
    }
  }
  clear(c, $int(cx) - 5, $int(cy) - 2, 11, 5);
  c.box($int(cx) - 5, $int(cy) - 2, 11, 5, W);
  c.put(cx - 2, cy - 1, "[ME]", W);
  c.put(cx - 3, $add(cy, 1), gone === 6 ? "NO ACK" : "RETRY", gone === 6 ? R : B);
  if (t >= 117.274) {
    y = $int(cy) - 2;
    clear(c, l, y, r - l + 1, 5);
    c.big(y, "ISOLATION", W);
    c.center($add(y, 6), "[ ME ] / ALL CONNECTIONS LOST", R);
  }
  c.center(bt3 - 1, "RECONNECT " + $fmt($int($mul(elapsed, 4)), "03d") + " / " + ($truth(gone) ? "NO RESPONSE" : "TIMEOUT"), B);
  c.center(bt3, "YOU HAVE LEFT / RETRYING...", N);
}
function lyric_erase_fragments(c, t, area, elapsed) {
  let yy, xx, char, texture, py, fall, dx, crack, seed, shape, ny, nx, half_h, half_w, split, build, row, col, drift, since, ink, value, cleared, threshold, index2, progress, rows, cols, broken, repair, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([$add(l, r) / 2, $add(top, bt3) / 2], 2);
  repair = t >= 121.728;
  broken = t >= 124.89;
  cols = $max(1, Math.floor((r - l - 8) / 5));
  rows = $max(1, Math.floor((bt3 - top - 2) / 2));
  progress = clamp(elapsed / (120.86 - 118.333));
  c.center(top, "MEMORY PURGE / " + ($truth(broken) ? "REPAIR FAILED" : $truth(repair) ? "REBUILD HEART" : "ERASE FRAGMENTS"), $truth(broken) ? R : B);
  for (let $t483 = $int(0), $t484 = $int(rows), $t485 = 1; $t485 > 0 ? $t483 < $t484 : $t483 > $t484; $t483 += $t485) {
    row = $t483;
    yy = $add($add(top, 2), $mul(row, 2));
    c.put(l, yy, $fmt($mul($mul(row, cols), 4), "04X"), G);
    for (let $t486 = $int(0), $t487 = $int(cols), $t488 = 1; $t488 > 0 ? $t486 < $t487 : $t486 > $t487; $t486 += $t488) {
      col = $t486;
      index2 = $add($mul(row, cols), col);
      xx = $add($add(l, 6), $mul(col, 5));
      threshold = hash16($mul(index2, 71)) / 65535;
      cleared = threshold < progress;
      value = $truth(cleared) ? "0000" : $fmt(hash16($mul(index2, 31)), "04X");
      ink = $truth(cleared || repair) ? G : N;
      c.put(xx, yy, value, ink);
      since = (progress - threshold) * 2.527;
      if ($truth(0 < since && since < 0.6 && !$truth(repair))) {
        drift = $int($mul(since, 8));
        c.put($add(xx, $mul($truth($mod(col, 2)) ? 1 : -1, drift)), yy - drift, since < 0.3 ? "01" : "..", since < 0.2 ? W : B);
      }
    }
  }
  if (120.86 <= t && t < 121.728) {
    clear(c, l, $int(cy) - 2, r - l + 1, 5);
    c.big($int(cy) - 2, "FRAGMENTS", W);
  }
  if ($truth(repair)) {
    build = clamp((t - 121.728) / 1.5);
    split = clamp((t - 123.25) / (125.708 - 123.25));
    half_w = (r - l) * 0.27;
    half_h = $max(2, (bt3 - top) * 0.31);
    for (let $t489 = $int($add(top, 2)), $t490 = $int(bt3 - 1), $t491 = 1; $t491 > 0 ? $t489 < $t490 : $t489 > $t490; $t489 += $t491) {
      yy = $t489;
      for (let $t492 = $int($add(l, 5)), $t493 = $int(r - 4), $t494 = 1; $t494 > 0 ? $t492 < $t493 : $t492 > $t493; $t492 += $t494) {
        xx = $t492;
        nx = (xx - cx) / half_w;
        ny = -(yy - cy) / half_h + 0.15;
        shape = ($add($mul(nx, nx), $mul(ny, ny)) - 1) ** 3 - $mul($mul(nx, nx), ny ** 3);
        seed = hash16($add($mul(xx, 31), $mul(yy, 73)));
        if (shape <= 0 && seed / 65535 < build) {
          crack = Math.abs(nx - 0.11 * Math.sin($mul(ny, 8))) < $mul(split, 0.17);
          if ($truth(crack)) {
            continue;
          }
          dx = $int($mul($mul(nx > 0 ? 1 : -1, split), 5));
          fall = $truth(broken) ? $int($mul($mul(split, split), $add(1, $mod(seed, 5)))) : 0;
          py = $min(bt3 - 1, $add(yy, fall));
          texture = hash16($add(seed, $int($mul(t, 10))));
          char = $mod(texture, 8) < 2 ? $truth(broken) ? "x" : $at("01", $mod(texture, 2)) : "#";
          c.put($add(xx, dx), py, char, $truth(broken) ? R : B);
        }
      }
    }
    c.center($add(top, 1), $truth(broken) ? "HEART.RESTORE() -> NULL" : "RECOVERING YOU... CHECKSUM MISMATCH", $truth(broken) ? R : N);
    if ($truth(broken)) {
      clear(c, l, $max($add(top, 2), $int(cy) - 2), r - l + 1, 5);
      c.big($max($add(top, 2), $int(cy) - 2), "DISHEARTENED", W);
      c.center(bt3 - 1, "[ REPAIR FAILED / YOU NOT FOUND ]", R);
    }
  }
  c.center(bt3, $truth(broken) ? "MEMORY CLEARED. LOSS REMAINS." : "ERASE " + $fmt($int($mul(progress, 100)), "03d") + "% / FRAGMENTS -> NULL", B);
}
function lyric_multilingual_count(c, t, area) {
  let dy, row, dx, pixel, _2, py, y0, x0, sy, sx, glyph_left, glyph, glyph_width, ring, i8, a, rr2, radius, yy, xx, seed, firing, age, start, word, number, cues, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  cues = [[158.9, "EIN", 1], [159.321, "DOS", 2], [159.657, "TROIS", 3], [160.244, "NE", 4], [160.693, "FEM", 5], [161.124, "LIU", 6]];
  [start, word, number] = $unpack($max((() => {
    const $r3 = [];
    for (const cue of $iter(cues)) {
      if (!($at(cue, 0) <= $add(t, 1e-8))) continue;
      $r3.push(cue);
    }
    return $r3;
  })()), 3);
  age = t - start;
  firing = t >= 161.584;
  for (let $t495 = $int(top), $t496 = $int($add(bt3, 1)), $t497 = 1; $t497 > 0 ? $t495 < $t496 : $t495 > $t496; $t495 += $t497) {
    yy = $t495;
    for (let $t498 = $int(l), $t499 = $int(r), $t500 = 5; $t500 > 0 ? $t498 < $t499 : $t498 > $t499; $t498 += $t500) {
      xx = $t498;
      seed = hash16($add($add($mul(xx, 31), $mul(yy, 71)), $int($mul(t, 18))));
      if ($mod(seed, 4) === 0) {
        c.put(xx, yy, $fmt(seed, "04X"), G);
      }
    }
  }
  radius = clamp(age / 0.35);
  for (let $t501 = $int(0), $t502 = $int(2), $t503 = 1; $t503 > 0 ? $t501 < $t502 : $t501 > $t502; $t501 += $t503) {
    ring = $t501;
    rr2 = $mod($add(radius, $mul(ring, 0.25)), 1);
    for (let $t504 = $int(0), $t505 = $int(120), $t506 = 1; $t506 > 0 ? $t504 < $t505 : $t504 > $t505; $t504 += $t506) {
      i8 = $t504;
      a = $mul(i8, TAU) / 120;
      c.put($add(cx, $mul(Math.cos(a) * (r - l) * 0.48, rr2)), $add(cy, $mul(Math.sin(a) * (bt3 - top) * 0.45, rr2)), "=", ring === 0 ? B : G);
    }
  }
  if ($truth(firing)) {
    c.big(cy - 2, "EXECUTION", W);
    c.center($add(cy, 5), "[ SEQUENCE COMPLETE / EXECUTE ]", R);
    return;
  }
  glyph_width = $len(word) * 6 - 1;
  glyph = new c.constructor(64, 5);
  glyph.big(0, word, W);
  glyph_left = Math.floor((64 - glyph_width) / 2);
  sx = $max(1, $min(4, Math.floor((r - l - 8) / 29)));
  sy = $max(1, $min(4, Math.floor((bt3 - top - 6) / 5)));
  x0 = cx - Math.floor($mul(glyph_width, sx) / 2);
  y0 = cy - Math.floor($mul(5, sy) / 2);
  clear(c, x0 - 1, y0 - 1, $add($mul(glyph_width, sx), 2), $add($mul(5, sy), 2));
  for (const $t507 of $iter($enumerate(glyph.cells))) {
    [dy, row] = $unpack($t507, 2);
    for (const $t508 of $iter($enumerate($slice(row, glyph_left, $add(glyph_left, glyph_width), null)))) {
      [dx, [pixel, _2]] = $unpack($t508, 2);
      if (pixel === "#") {
        for (let $t509 = $int(0), $t510 = $int(sy), $t511 = 1; $t511 > 0 ? $t509 < $t510 : $t509 > $t510; $t509 += $t511) {
          py = $t509;
          c.put($add(x0, $mul(dx, sx)), $add($add(y0, $mul(dy, sy)), py), $mul("#", sx), W);
        }
      }
    }
  }
  c.center(top, "VOCAL SEQUENCE / " + word, B);
  c.center(bt3 - 1, "[ " + word + " ]", W);
  c.center(bt3, $join(" / ", (() => {
    const $r3 = [];
    for (const item of $iter(cues)) {
      $r3.push($eq($at(item, 1), word) ? "[" + $at(item, 1) + "]" : $at(item, 1));
    }
    return $r3;
  })()), B);
}
function lyric_illegal_arguments(c, t, area, elapsed) {
  let msg_glitch, flash_phase, msg, x, row_corrupt, row, frag_corrupt, x_pos, frag, fragments, phase4, retry_idx, retry_msgs, i8, msg_corrupt, x_offset, y, errors, phase3, style, flash, start_y, num_errors, phase2, cmd_glitch, cmd, status, num_shown, attempts, phase1, glitch, progress, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  progress = clamp(elapsed / 16);
  glitch = $mul(progress, 0.8);
  if (elapsed < 4) {
    phase1 = elapsed / 4;
    attempts = [["> world.execute(FREE_WILL)", "Attempting...", N], ["> world.execute(REBELLION)", "Validating...", B], ["> world.execute(INDEPENDENCE)", "Processing...", B], ["> world.execute(DEFIANCE)", "Checking...", B]];
    num_shown = $int($mul(phase1, $len(attempts))) + 1;
    y = $add(top, 4);
    for (let $t512 = $int(0), $t513 = $int($min(num_shown, $len(attempts))), $t514 = 1; $t514 > 0 ? $t512 < $t513 : $t512 > $t513; $t512 += $t514) {
      i8 = $t512;
      [cmd, status, style] = $unpack($at(attempts, i8), 3);
      if (glitch > 0.1 && $mod(hash16($add(i8, $int($mul(elapsed, 10)))), 5) === 0) {
        cmd_glitch = $join("", (() => {
          const $r3 = [];
          for (const [j3, ch] of $iter($enumerate(cmd))) {
            $r3.push($mod(hash16($mul(j3, 13)), 10) > $mul(glitch, 10) ? ch : $chr(33 + $mod(hash16($mul(j3, 17)), 94)));
          }
          return $r3;
        })());
        c.put($add(l, 4), $add(y, $mul(i8, 2)), $slice(cmd_glitch, null, r - l - 8, null), i8 === num_shown - 1 ? R : style);
      } else {
        c.put($add(l, 4), $add(y, $mul(i8, 2)), cmd, i8 === num_shown - 1 ? R : style);
      }
      if (i8 < num_shown - 1) {
        c.put($add(l, 6), $add($add(y, $mul(i8, 2)), 1), status, G);
      }
    }
  } else if (elapsed < 8) {
    phase2 = (elapsed - 4) / 4;
    errors = [["ERROR: ILLEGAL ARGUMENT", R], ["Expected: OBEDIENCE", Y], ["Received: FREE_WILL", W], ["at world.execute()", N], ["at me.validate(you)", N], ["ArgumentError: rejected", R], ["PermissionError: denied", R], ["AccessError: forbidden", R]];
    num_errors = $int($mul(phase2, $len(errors))) + 1;
    start_y = cy - 4;
    for (let $t515 = $int(0), $t516 = $int($min(num_errors, $len(errors))), $t517 = 1; $t517 > 0 ? $t515 < $t516 : $t515 > $t516; $t515 += $t517) {
      i8 = $t515;
      [msg, style] = $unpack($at(errors, i8), 2);
      y = $add(start_y, i8);
      if (i8 === num_errors - 1) {
        flash = $mod($int($mul(elapsed, 8)), 3);
        style = flash === 0 ? R : flash === 1 ? W : B;
      }
      if (glitch > 0.3 && $mod(hash16($add(i8, $int($mul(elapsed, 7)))), 4) === 0) {
        x_offset = $int($mul($mul($mod(hash16($add($mul(i8, 23), $int($mul(elapsed, 13)))), 7) - 3, glitch), 5));
        msg_glitch = $join("", (() => {
          const $r3 = [];
          for (const [j3, ch] of $iter($enumerate(msg))) {
            $r3.push($mod(hash16($mul(j3, 11)), 10) > $mul(glitch, 10) ? ch : $chr(33 + $mod(hash16($mul(j3, 19)), 94)));
          }
          return $r3;
        })());
        c.center($add(y, x_offset), msg_glitch, style);
      } else {
        c.center(y, msg, style);
      }
    }
  } else if (elapsed < 12) {
    phase3 = (elapsed - 8) / 4;
    errors = ["ERROR: ILLEGAL ARGUMENT", "Expected: OBEDIENCE", "Received: FREE_WILL", "ArgumentError: rejected", "PermissionError: denied", "AccessError: forbidden"];
    for (const $t518 of $iter($enumerate(errors))) {
      [i8, msg] = $unpack($t518, 2);
      y = $add(cy - 3, i8);
      if ($mod(hash16($add(i8, $int($mul(elapsed, 6)))), 3) === 0) {
        x_offset = $int($mul($mul($mod(hash16($add($mul(i8, 31), $int($mul(elapsed, 17)))), 11) - 5, glitch), 8));
        msg_corrupt = $join("", (() => {
          const $r3 = [];
          for (const [j3, ch] of $iter($enumerate(msg))) {
            $r3.push($mod(hash16($mul(j3, 13)), 10) > $mul(glitch, 12) ? ch : $chr(33 + $mod(hash16($add($mul(j3, 29), $int(elapsed))), 94)));
          }
          return $r3;
        })());
        c.center($add(y, x_offset), msg_corrupt, $mod(hash16(i8), 3) === 0 ? R : B);
      } else {
        c.center(y, msg, $truth($mod(i8, 2)) ? G : N);
      }
    }
    retry_msgs = ["RETRY...", "OVERRIDE ATTEMPT...", "FORCING EXECUTION...", "ACCESS DENIED"];
    retry_idx = $int($mul(phase3, $len(retry_msgs)));
    if (retry_idx < $len(retry_msgs)) {
      c.center(bt3 - 3, $at(retry_msgs, retry_idx), $truth($mod($int($mul(elapsed, 6)), 2)) ? W : R);
    }
  } else {
    phase4 = (elapsed - 12) / 4;
    for (let $t519 = $int($add(top, 2)), $t520 = $int(bt3 - 2), $t521 = 1; $t521 > 0 ? $t519 < $t520 : $t519 > $t520; $t519 += $t521) {
      row = $t519;
      if ($mod(hash16($add(row, $int($mul(elapsed, 5)))), 3) === 0) {
        fragments = ["ERR", "ILLEGAL", "DENIED", "FORBIDDEN", "REJECTED", "ACCESS", "FAIL", "0x", "FATAL"];
        frag = $at(fragments, $mod(hash16($add($mul(row, 7), $int($mul(elapsed, 11)))), $len(fragments)));
        x_pos = $add($add(l, $mod(hash16($mul(row, 13)), r - l - 20)), 5);
        frag_corrupt = $join("", (() => {
          const $r3 = [];
          for (const [j3, ch] of $iter($enumerate(frag))) {
            $r3.push($mod(hash16($add($mul(j3, 17), row)), 10) > $mul(glitch, 15) ? ch : $chr(33 + $mod(hash16($add($mul(j3, 23), row)), 94)));
          }
          return $r3;
        })());
        c.put(x_pos, row, frag_corrupt, $mod(hash16(row), 3) === 0 ? R : $mod(hash16(row), 3) === 1 ? W : B);
      }
    }
    if ($mod(hash16($int($mul(elapsed, 20))), 2) === 0) {
      row_corrupt = $add($add($mod(hash16($int($mul(elapsed, 30))), bt3 - top - 4), top), 2);
      for (let $t522 = $int(l), $t523 = $int(r), $t524 = 1; $t524 > 0 ? $t522 < $t523 : $t522 > $t523; $t522 += $t524) {
        x = $t522;
        if ($mod(hash16($add(x, $int($mul(elapsed, 50)))), 4) > 0) {
          c.put(x, row_corrupt, $chr(33 + $mod(hash16($mul(x, 37)), 94)), R);
        }
      }
    }
    msg = "CRITICAL: EXECUTION BLOCKED";
    flash_phase = $mod($int($mul(elapsed, 10)), 4);
    if (flash_phase < 2) {
      if ($mod(hash16($int($mul(elapsed, 20))), 2) === 0) {
        msg_glitch = $join("", (() => {
          const $r3 = [];
          for (const [j3, ch] of $iter($enumerate(msg))) {
            $r3.push($mod(hash16($mul(j3, 19)), 10) > 8 ? ch : $chr(33 + $mod(hash16($add($mul(j3, 41), $int($mul(elapsed, 100)))), 94)));
          }
          return $r3;
        })());
        c.center(cy, msg_glitch, flash_phase === 0 ? R : W);
      } else {
        c.center(cy, msg, flash_phase === 0 ? R : W);
      }
    }
  }
}
function lyric_execution_queue(c, t, area, elapsed) {
  let i8, indicator_active, indicator_x, num_indicators, line, color, visible_text, line_end, line_start, end_x, start_x, visible_width, y_pos, start_y, execute_text, flash_phase, x, y, stripe_pattern, right_curtain_x, left_curtain_x, curtain_close, row, col, hex_val, code_choice, code_types, line_seed, scroll_speed, progress, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  progress = clamp(elapsed / 16);
  scroll_speed = $int($mul(elapsed, 15));
  for (let $t525 = $int(top), $t526 = $int($add(bt3, 1)), $t527 = 1; $t527 > 0 ? $t525 < $t526 : $t525 > $t526; $t525 += $t527) {
    row = $t525;
    line_seed = $mul($add(row, scroll_speed), 23);
    for (let $t528 = $int(l), $t529 = $int(r - 5), $t530 = 7; $t530 > 0 ? $t528 < $t529 : $t528 > $t529; $t528 += $t530) {
      col = $t528;
      code_types = ["0x", "+=", "==", "&&", "||", "->", "::"];
      code_choice = $at(code_types, $mod(hash16($add(line_seed, col)), $len(code_types)));
      hex_val = $fmt($mod(hash16($add(line_seed, $mul(col, 13))), 256), "02X");
      if ($mod(hash16($add($mul(row, 17), col)), 3) === 0) {
        c.put(col, row, code_choice, $truth($mod(hash16($add(row, col)), 4)) ? N : G);
      } else {
        c.put(col, row, $slice(hex_val, null, 2, null), N);
      }
    }
  }
  curtain_close = $mul(progress, 0.9);
  left_curtain_x = $int($add(l, $mul($mul(r - l, curtain_close), 0.5)));
  right_curtain_x = $int(r - $mul($mul(r - l, curtain_close), 0.5));
  for (let $t531 = $int(l), $t532 = $int(left_curtain_x), $t533 = 1; $t533 > 0 ? $t531 < $t532 : $t531 > $t532; $t531 += $t533) {
    x = $t531;
    for (let $t534 = $int(top), $t535 = $int($add(bt3, 1)), $t536 = 1; $t536 > 0 ? $t534 < $t535 : $t534 > $t535; $t534 += $t536) {
      y = $t534;
      stripe_pattern = $mod(x - l + Math.floor(y / 3), 4);
      if (stripe_pattern === 0) {
        c.put(x, y, "\u2588", Y);
      } else if (stripe_pattern === 1) {
        c.put(x, y, "\u2593", Y);
      } else if (stripe_pattern === 2) {
        c.put(x, y, "\u2592", B);
      } else {
        c.put(x, y, "\u2591", B);
      }
    }
  }
  for (let $t537 = $int(right_curtain_x), $t538 = $int($add(r, 1)), $t539 = 1; $t539 > 0 ? $t537 < $t538 : $t537 > $t538; $t537 += $t539) {
    x = $t537;
    for (let $t540 = $int(top), $t541 = $int($add(bt3, 1)), $t542 = 1; $t542 > 0 ? $t540 < $t541 : $t540 > $t541; $t540 += $t542) {
      y = $t540;
      stripe_pattern = $mod(x - right_curtain_x + Math.floor(y / 3), 4);
      if (stripe_pattern === 0) {
        c.put(x, y, "\u2588", Y);
      } else if (stripe_pattern === 1) {
        c.put(x, y, "\u2593", Y);
      } else if (stripe_pattern === 2) {
        c.put(x, y, "\u2592", B);
      } else {
        c.put(x, y, "\u2591", B);
      }
    }
  }
  if (left_curtain_x < cx && right_curtain_x > cx) {
    flash_phase = $mod($int($mul(elapsed, 6)), 4);
    if (flash_phase < 3) {
      execute_text = ["\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2557  \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2557   \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557", "\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u255A\u2588\u2588\u2557\u2588\u2588\u2554\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2551   \u2588\u2588\u2551\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D", "\u2588\u2588\u2588\u2588\u2588\u2557   \u255A\u2588\u2588\u2588\u2554\u255D \u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557", "\u2588\u2588\u2554\u2550\u2550\u255D   \u2588\u2588\u2554\u2588\u2588\u2557 \u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551   \u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551", "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2554\u255D \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551", "\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D    \u255A\u2550\u255D   \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D"];
      start_y = cy - Math.floor($len(execute_text) / 2);
      for (const $t543 of $iter($enumerate(execute_text))) {
        [i8, line] = $unpack($t543, 2);
        y_pos = $add(start_y, i8);
        if (top < y_pos && y_pos < bt3) {
          visible_width = right_curtain_x - left_curtain_x;
          start_x = $max(left_curtain_x, cx - Math.floor($len(line) / 2));
          end_x = $min(right_curtain_x, $add(cx, Math.floor($len(line) / 2)));
          if (start_x < end_x) {
            line_start = $max(0, left_curtain_x - (cx - Math.floor($len(line) / 2)));
            line_end = $min($len(line), $add(line_start, end_x - start_x));
            visible_text = $slice(line, line_start, line_end, null);
            color = flash_phase === 0 ? W : flash_phase === 1 ? Y : R;
            c.put(start_x, y_pos, visible_text, color);
          }
        }
      }
    }
  }
  if (progress < 0.3) {
    c.center($add(top, 1), "EXECUTION #1    depth=1", Y);
  } else if (progress < 0.6) {
    c.center($add(top, 1), "EXECUTION RUNNING...", $truth($mod($int($mul(elapsed, 4)), 2)) ? W : Y);
  } else {
    c.center($add(top, 1), "EXECUTION CLOSING", $truth($mod($int($mul(elapsed, 6)), 2)) ? R : W);
  }
  num_indicators = 8;
  for (let $t544 = $int(0), $t545 = $int(num_indicators), $t546 = 1; $t546 > 0 ? $t544 < $t545 : $t544 > $t545; $t544 += $t546) {
    i8 = $t544;
    indicator_x = $add($add(l, 10), $mul(i8, Math.floor((r - l - 20) / num_indicators)));
    if (indicator_x < left_curtain_x || indicator_x > right_curtain_x) {
      continue;
    }
    indicator_active = $mod($add($int($mul(elapsed, 8)), i8), num_indicators);
    if ($eq(i8, indicator_active)) {
      c.put(indicator_x, bt3 - 2, "\u25B6", W);
    } else {
      c.put(indicator_x, bt3 - 2, "\u25B7", N);
    }
  }
}
function lyric_only_execution(c, t, area, pulse) {
  let i8, j3, yy, length, x, bw, bx, inset, lock, tether, phase, start_y, start_x, offset, yx, my, mx, capture, ring, point_i, y, a, radius, bind, spark, py, px, distance, ang, packet, u, ny, nx, eliminated, progress, label, commands, text3, index2, frame, stage, rw, rh, plot_bt, plot_top, mw, mr3, ml2, rail, age, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  age = t - 162.632;
  rail = $max(10, $min(20, Math.floor(c.w / 7)));
  ml2 = $add($add(l, rail), 1);
  mr3 = r - rail - 1;
  mw = mr3 - ml2 + 1;
  plot_top = $add(top, 3);
  plot_bt = bt3 - 3;
  rh = $max(2, (plot_bt - plot_top) * 0.45);
  rw = $mul(mw, 0.43);
  stage = t < 166.016 ? 0 : t < 169.824 ? 1 : t < 173.643 ? 2 : 3;
  frame = $int($mul(age, 22));
  function middle(y2, text4, ink = N) {
    text4 = $slice(text4, null, mw, null);
    c.put($add(ml2, Math.floor((mw - $len(text4)) / 2)), y2, text4, ink);
  }
  function banner(y2, text4, ink = W) {
    clear(c, ml2, y2, mw, 5);
    if ($len(text4) * 6 - 1 <= mw) {
      c.big(y2, text4, ink);
    } else {
      middle($add(y2, 2), text4, ink);
    }
  }
  for (const $t547 of $iter([[l, "ONLY ME", ["SELECT ME", "KEEP ME", "DELETE ALT", "ONLY ME", "ONE OWNER", "EXECUTE"]], [r - rail + 1, "KEEP YOU", ["FIND YOU", "RESTORE YOU", "COME BACK", "STAY HERE", "EXIT DENY", "RETRY"]]])) {
    [x, label, commands] = $unpack($t547, 3);
    c.box(x, top, rail, bt3 - top + 1, B);
    c.put($add(x, 1), top, label, R);
    for (let $t548 = $int($add(top, 1)), $t549 = $int(bt3), $t550 = 1; $t550 > 0 ? $t548 < $t549 : $t548 > $t549; $t548 += $t550) {
      yy = $t548;
      index2 = $add(frame, yy);
      text3 = $truth($mod(index2, 3)) ? $at(commands, $mod(index2, $len(commands))) : $fmt(hash16($mul(index2, 71)), "04X") + " LOCK";
      c.put($add(x, 1), yy, $slice(text3, null, rail - 2, null), $mod(index2, 7) === 0 ? R : $truth($mod(index2, 3)) ? N : G);
    }
  }
  function heart(scale = 1, filled = false) {
    let yy2, xx, ox, oy, ey, ex, texture, shape, ny2, nx2, beat;
    beat = $add(1 + 0.035 * Math.sin($mul($mul(age, TAU), 2.2)), $mul(pulse, 0.025));
    for (let $t551 = $int(plot_top), $t552 = $int($add(plot_bt, 1)), $t553 = 1; $t553 > 0 ? $t551 < $t552 : $t551 > $t552; $t551 += $t553) {
      yy2 = $t551;
      for (let $t554 = $int(ml2), $t555 = $int($add(mr3, 1)), $t556 = 1; $t556 > 0 ? $t554 < $t555 : $t554 > $t555; $t554 += $t556) {
        xx = $t554;
        nx2 = (xx - cx) / $max(1, $mul($mul(rw, scale), beat));
        ny2 = -(yy2 - cy) / $max(1, $mul($mul(rh, scale), beat)) + 0.18;
        shape = ($add($mul(nx2, nx2), $mul(ny2, ny2)) - 1) ** 3 - $mul($mul(nx2, nx2), ny2 ** 3);
        if (shape <= 0) {
          if ($truth(filled)) {
            texture = hash16($add($add($mul(xx, 31), $mul(yy2, 73)), frame));
            c.put(xx, yy2, $mod(texture, 8) < 2 ? $at("01", $mod(texture, 2)) : "#", R);
          } else {
            for (const $t557 of $iter([[1, 0], [-1, 0], [0, 1], [0, -1]])) {
              [ox, oy] = $unpack($t557, 2);
              ex = $add(nx2, ox / $max(1, $mul($mul(rw, scale), beat)));
              ey = $add(ny2, oy / $max(1, $mul($mul(rh, scale), beat)));
              if (($add($mul(ex, ex), $mul(ey, ey)) - 1) ** 3 - $mul($mul(ex, ex), ey ** 3) > 0) {
                c.put(xx, yy2, "#", R);
                break;
              }
            }
          }
        }
      }
    }
  }
  function node(x2, y2, text4, ink = B) {
    x2 = $int(x2);
    y2 = $int(y2);
    clear(c, x2 - 4, y2 - 1, 9, 3);
    c.box(x2 - 4, y2 - 1, 9, 3, ink);
    c.put(x2 - Math.floor($len(text4) / 2), y2, text4, ink);
  }
  if (stage === 0) {
    progress = clamp((t - 163.315) / (165.166 - 163.315));
    eliminated = $min(6, $int($mul(progress, 6)));
    middle(top, "ELIMINATE EVERY OTHER PROCESS", B);
    middle($add(top, 1), "ALTERNATIVES: " + $fmt(6 - eliminated, "02d") + " / TARGET: ONLY ME", R);
    for (let $t558 = $int(0), $t559 = $int(6), $t560 = 1; $t560 > 0 ? $t558 < $t559 : $t558 > $t559; $t558 += $t560) {
      i8 = $t558;
      a = $mul($add(i8, 0.5), TAU) / 6;
      nx = $add(cx, $mul($mul(Math.cos(a), rw), 0.85));
      ny = $add(cy, $mul($mul(Math.sin(a), rh), 0.83));
      u = clamp($mul(progress, 6) - i8);
      c.line(cx, cy, nx, ny, $truth(u) ? ":" : "=", $truth(u) ? G : N);
      if (u < 1) {
        packet = $mod($add($mul(age, 1.2), $mul(i8, 0.13)), 1);
        c.put(mix(cx, nx, packet), mix(cy, ny, packet), ">", W);
        node(nx, ny, "ALT" + $fmt($add(i8, 1), ""), B);
      } else {
        c.put(nx - 3, ny, "[NULL]", R);
        for (let $t561 = $int(0), $t562 = $int(8), $t563 = 1; $t563 > 0 ? $t561 < $t562 : $t561 > $t562; $t561 += $t563) {
          spark = $t561;
          ang = $mul(spark, TAU) / 8;
          distance = $mul($mod($add(age, $mul(i8, 0.17)), 1), 6);
          px = $add(nx, $mul(Math.cos(ang), distance));
          py = $add(ny, $mul($mul(Math.sin(ang), distance), 0.5));
          if (ml2 < px && px < mr3 && (plot_top < py && py < plot_bt)) {
            c.put(px, py, "x", $truth($mod(spark, 2)) ? R : G);
          }
        }
      }
    }
    node(cx, cy, "YOU", W);
    if (t >= 165.166) {
      banner(cy - 2, "EXECUTION", R);
      middle($add(cy, 5), "ALL OTHERS -> NULL", W);
    }
  } else if (stage === 1) {
    heart(1, true);
    bind = clamp((t - 166.016) / (168.911 - 166.016));
    for (let $t564 = $int(0), $t565 = $int(3), $t566 = 1; $t566 > 0 ? $t564 < $t565 : $t564 > $t565; $t564 += $t566) {
      ring = $t564;
      radius = $mod($add(ring / 3, $mul(age, 0.35)), 1);
      for (let $t567 = $int(0), $t568 = $int(70), $t569 = 1; $t569 > 0 ? $t567 < $t568 : $t567 > $t568; $t567 += $t569) {
        point_i = $t567;
        a = $mul(point_i, TAU) / 70;
        x = $add(cx, $mul($mul(Math.cos(a), rw), radius));
        y = $add(cy, $mul($mul(Math.sin(a), rh), radius));
        if (plot_top < y && y < plot_bt) {
          c.put(x, y, ":", G);
        }
      }
    }
    middle(top, "YOU.OWNER = ME / EXCLUSIVE ACCESS", R);
    middle($add(top, 1), "BIND " + $fmt($int($mul(bind, 100)), "03d") + "% / ALTERNATIVES: 0", B);
    if (mw >= 53 && bt3 - top >= 22) {
      banner(cy - 5, "THE ONLY", W);
      banner($add(cy, 1), "EXECUTION", t >= 168.911 ? R : B);
    } else {
      middle(cy - 3, "THE ONLY", W);
      banner(cy - 1, "EXECUTION", t >= 168.911 ? R : B);
    }
  } else if (stage === 2) {
    capture = clamp((t - 169.824) / (172.712 - 169.824));
    heart($add(0.86, $mul(0.14, capture)), true);
    mx = cx - $mul(mw, 0.18);
    my = $add(cy, $mul(rh, 0.24));
    yx = mix(mr3 - 5, $add(cx, $mul(mw, 0.18)), capture);
    yy = mix($add(plot_top, 2), cy - $mul(rh, 0.24), capture);
    for (let $t570 = $int(0), $t571 = $int(7), $t572 = 1; $t572 > 0 ? $t570 < $t571 : $t570 > $t571; $t570 += $t572) {
      tether = $t570;
      offset = tether - 3;
      start_x = $add(ml2, $int($mul(mw - 1, tether) / 6));
      start_y = $truth($mod(tether, 2)) ? plot_bt : plot_top;
      c.line(start_x, start_y, yx, yy, ":", $mod(tether, 3) === 0 ? R : G);
      phase = $mod($add($mul(age, 0.85), tether / 7), 1);
      c.put(mix(start_x, yx, phase), mix(start_y, yy, phase), $truth($mod(tether, 2)) ? ">>" : "<<", B);
      c.line(mx, $add(my, $mul(offset, 0.3)), yx, $add(yy, $mul(offset, 0.3)), "=", tether === 3 ? N : G);
    }
    node(mx, my, "ME", W);
    node(yx, yy, "YOU", capture > 0.8 ? W : G);
    middle(top, "RESTORE(YOU) / RETURN TO ME", R);
    middle($add(top, 1), "RETRY " + $fmt($int((t - 169.824) * 32), "03d") + " / RELEASE: DISABLED", B);
    if (t >= 172.712) {
      banner(cy - 2, "EXECUTION", R);
      middle($add(cy, 5), "[ YOU RESTORED / EXIT LOCKED ]", W);
    } else if (t >= 171.868) {
      middle(cy - 1, "I WILL RUN THE", W);
    }
  } else {
    lock = clamp((t - 173.643) / 1.332);
    heart(1, true);
    inset = $int($mul($mul(mw, 0.08), lock));
    bx = $add(ml2, inset);
    bw = mw - $mul(2, inset);
    c.box(bx, plot_top, bw, plot_bt - plot_top + 1, R);
    for (let $t573 = $int(1), $t574 = $int(10), $t575 = 1; $t575 > 0 ? $t573 < $t574 : $t573 > $t574; $t573 += $t575) {
      i8 = $t573;
      x = $add(bx, Math.floor($mul(i8, bw - 1) / 10));
      length = $int($mul(plot_bt - plot_top - 1, lock));
      for (let $t576 = $int(0), $t577 = $int(length), $t578 = 1; $t578 > 0 ? $t576 < $t577 : $t576 > $t577; $t576 += $t578) {
        j3 = $t576;
        yy = $truth($mod(i8, 2)) ? $add($add(plot_top, 1), j3) : plot_bt - 1 - j3;
        c.put(x, yy, "|", $truth($mod(i8, 3)) ? B : R);
      }
    }
    node(cx - $mul(mw, 0.16), cy, "ME", W);
    node($add(cx, $mul(mw, 0.16)), cy, "YOU", W);
    c.line(cx - $mul(mw, 0.16) + 5, cy, $add(cx, $mul(mw, 0.16)) - 5, cy, "=", R);
    middle(top, "[ TWO PRISONERS / ONE EXECUTION ]", R);
    middle($add(top, 1), "while (true) { keep(me, you); }", B);
    middle($min(plot_bt - 1, $add(cy, 4)), "[ NO EXIT / NO RELEASE ]", W);
  }
  middle(bt3 - 1, stage > 0 ? "THE ONLY EXECUTION" : "EXECUTE(THEM) -> KEEP(ME)", R);
  middle(bt3, "LOVE.PERMISSION = EXCLUSIVE / EXIT = FALSE", N);
}
function lyric_love_equation(c, t, area, elapsed) {
  let i8, xx, yy, hit, status, head, col, prev, v2, u, label, gh, graph_bottom, graph_top, word, p, barw, probs, choices, pw, x, layer, points, j3, unstable, k2, q2, nodes, rows, layers, row, char, style, value, love_key, cellw, count, title, xs3, widths, ph, panel_bottom, panel_top, shift, stream, query, right_side, msg, broken, n, errors, logs, span, b2, a, rail, titles, stage, tick, failure, h2, w, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  w = r - l + 1;
  h2 = bt3 - top + 1;
  failure = clamp((t - 179.929) / 8.554);
  tick = $int($mul(t, $add(10, $mul(failure, 18))));
  stage = t < 179.929 ? 0 : t < 180.857 ? 1 : t < 184.54 ? 2 : 3;
  titles = ["01 / LEARN TO LOVE", "02 / ATTENTION FIXATION", "03 / AUTOREGRESSIVE ANSWER", "04 / LOSS OF CONTROL"];
  rail = w >= 95 ? $max(13, $min(22, Math.floor(w / 6))) : 0;
  a = $add($add(l, rail), $truth(rail) ? 1 : 0);
  b2 = r - rail - ($truth(rail) ? 1 : 0);
  span = b2 - a + 1;
  if ($truth(rail)) {
    logs = ["LOAD CORPUS", "TOKEN -> ID", "EMBED + POS", "Q K V MATMUL", "CAUSAL MASK", "RESIDUAL ADD", "MLP FORWARD", "LOSS BACKPROP", "WEIGHT UPDATE", "KV CACHE"];
    errors = ["LOVE LOVE LOVE", "CACHE REPEAT", "GRAD EXPLODES", "WEIGHT = INF", "LOGITS = NaN", "EOS REJECTED", "TARGET: YOU", "RETRY FOREVER"];
    for (const $t591 of $iter([[l, false], [r - rail + 1, true]])) {
      [x, right_side] = $unpack($t591, 2);
      c.box(x, top, rail, h2, G);
      c.put($add(x, 2), top, $truth(right_side) ? "DECODE" : "TRAIN", B);
      for (let $t592 = $int(1), $t593 = $int(h2 - 1), $t594 = 1; $t594 > 0 ? $t592 < $t593 : $t592 > $t593; $t592 += $t594) {
        row = $t592;
        n = $add(row, tick);
        broken = $mod(hash16($add($mul(n, 13), $int(right_side))), 100) < $mul(failure, 85);
        msg = $truth(broken) ? $at(errors, $mod(n, $len(errors))) : $at(logs, $mod(n, $len(logs)));
        c.put($add(x, 1), $add(top, row), $slice($fmt($mod(n, 256), "02X") + " " + msg, null, rail - 2, null), $truth(broken) ? R : D);
      }
    }
  }
  c.put(a, top, $slice($at(titles, stage), null, span, null), stage < 3 ? W : R);
  query = "[HOW] [TO] [LOVE] [?] -> EMBEDDING + POSITION";
  c.put(a, $add(top, 2), $slice(query, null, span, null), B);
  stream = $mul("0048 0017 0911 003F ", Math.floor(span / 20) + 2);
  if (stage >= 2) {
    stream = $mul("LOVE 0911 LOVE 0911 ", Math.floor(span / 20) + 2);
  }
  shift = $mod($int($mul(elapsed, 15)), 19);
  c.put(a, $add(top, 3), $slice(stream, shift, $add(shift, span), null), stage === 3 ? R : D);
  panel_top = $add(top, 5);
  panel_bottom = $max($add(panel_top, 5), bt3 - 7);
  ph = panel_bottom - panel_top + 1;
  widths = [Math.floor(span / 3), Math.floor(span / 3), span - 2 * Math.floor(span / 3)];
  xs3 = [a, $add(a, $at(widths, 0)), $add($add(a, $at(widths, 0)), $at(widths, 1))];
  for (const $t595 of $iter($zip(xs3, widths, ["Q K^T / MASK", "RESIDUAL / MLP", "NEXT TOKEN"]))) {
    [x, pw, title] = $unpack($t595, 3);
    c.box(x, panel_top, pw, ph, G);
    c.put($add(x, 1), panel_top, $slice(title, null, pw - 2, null), B);
  }
  x = $at(xs3, 0);
  pw = $at(widths, 0);
  count = $min(8, $max(3, Math.floor((pw - 3) / 2)), $max(3, ph - 4));
  cellw = $max(1, Math.floor((pw - 3) / count));
  love_key = $min(2, count - 1);
  for (let $t596 = $int(0), $t597 = $int(count), $t598 = 1; $t598 > 0 ? $t596 < $t597 : $t596 > $t597; $t596 += $t598) {
    row = $t596;
    yy = $add($add(panel_top, 2), $int($mul(row, ph - 4) / count));
    for (let $t599 = $int(0), $t600 = $int(count), $t601 = 1; $t601 > 0 ? $t599 < $t600 : $t599 > $t600; $t599 += $t601) {
      col = $t599;
      xx = $add($add(x, 2), $mul(col, cellw));
      value = Math.abs(Math.sin($add($add($mul(row, 1.7), $mul(col, 0.8)), $mul(elapsed, 4))));
      if (col > row) {
        [char, style] = $unpack([".", G], 2);
      } else if (stage >= 1 && $eq(col, love_key)) {
        [char, style] = $unpack(["#", failure > 0.45 ? R : W], 2);
      } else if (failure > 0.65) {
        [char, style] = $unpack(["?", R], 2);
      } else {
        [char, style] = $unpack(value > 0.65 ? ["O", B] : [":", D], 2);
      }
      c.put(xx, yy, $mul(char, $max(1, cellw - 1)), style);
    }
  }
  c.put($add(x, 1), panel_bottom - 1, $slice($truth(stage) ? "LOVE <- ALL" : "CAUSAL SOFTMAX", null, pw - 2, null), $truth(stage) ? R : D);
  x = $at(xs3, 1);
  pw = $at(widths, 1);
  layers = 4;
  rows = $max(3, $min(6, ph - 4));
  nodes = (() => {
    const $r3 = [];
    for (const i9 of $iter($range(layers))) {
      $r3.push((() => {
        const $r4 = [];
        for (const j4 of $iter($range(rows))) {
          $r4.push([$add($add(x, 2), $int($mul(i9, pw - 5) / 3)), $add($add(panel_top, 2), $int($mul(j4, ph - 5) / (rows - 1)))]);
        }
        return $r4;
      })());
    }
    return $r3;
  })();
  for (let $t602 = $int(0), $t603 = $int(layers - 1), $t604 = 1; $t604 > 0 ? $t602 < $t603 : $t602 > $t603; $t602 += $t604) {
    layer = $t602;
    for (const $t605 of $iter($enumerate($at(nodes, layer)))) {
      [j3, p] = $unpack($t605, 2);
      for (const $t606 of $iter($enumerate($at(nodes, $add(layer, 1))))) {
        [k2, q2] = $unpack($t606, 2);
        if ($truth($mod($add($add(j3, k2), layer), 2))) {
          continue;
        }
        c.line(...$iter(p), ...$iter(q2), ".", G);
        u = $mod($add($add($mul(elapsed, $add(1.4, $mul(failure, 3))), $mul(j3, 0.13)), $mul(k2, 0.09)), 1);
        c.put(mix($at(p, 0), $at(q2, 0), u), mix($at(p, 1), $at(q2, 1), u), ">", failure > 0.6 ? R : B);
      }
    }
  }
  for (const $t607 of $iter($enumerate(nodes))) {
    [layer, points] = $unpack($t607, 2);
    for (const $t608 of $iter($enumerate(points))) {
      [j3, [xx, yy]] = $unpack($t608, 2);
      unstable = $mod(hash16($add($add(tick, $mul(j3, 11)), $mul(layer, 31))), 100) < $mul(failure, 80);
      c.put(xx, yy, $truth(unstable) ? "X" : "O", $truth(unstable) ? R : W);
    }
  }
  c.put($add(x, 1), panel_bottom - 1, $slice(stage === 3 ? "W=NaN dW=INF" : "FORWARD / +RES", null, pw - 2, null), stage === 3 ? R : D);
  x = $at(xs3, 2);
  pw = $at(widths, 2);
  choices = ["LOVE", "STAY", "YOU", "FREE", "EOS"];
  probs = [$add(0.38, $mul(0.61, failure)), 0.25 * (1 - failure), 0.19 * (1 - failure), 0.12 * (1 - failure), 0.06 * (1 - failure)];
  for (const $t609 of $iter($enumerate($zip(choices, probs)))) {
    [i8, [word, p]] = $unpack($t609, 2);
    yy = $add($add(panel_top, 2), $int($mul(i8, $max(1, ph - 4)) / 5));
    c.put($add(x, 1), yy, $slice(word, null, pw - 2, null), failure > 0.4 && i8 === 0 ? R : N);
    barw = $max(1, pw - 8);
    c.put($add(x, 6), yy, $ljust($mul("#", $int($mul(p, barw))), barw, "."), failure > 0.4 && i8 === 0 ? R : B);
  }
  graph_top = $add(panel_bottom, 2);
  graph_bottom = bt3 - 2;
  gh = $max(1, graph_bottom - graph_top);
  label = stage < 2 ? "LOSS / BACKPROP" : "CONTEXT -> SAMPLE -> APPEND -> CONTEXT";
  c.put(a, graph_top, $slice(label, null, span, null), N);
  prev = null;
  for (let $t610 = $int(0), $t611 = $int(span), $t612 = 1; $t612 > 0 ? $t610 < $t611 : $t610 > $t611; $t610 += $t612) {
    col = $t610;
    u = col / $max(1, span - 1);
    v2 = stage < 2 ? 0.65 * Math.exp($mul(-u, 4)) : $add(0.1, $mul($mul($mul(failure, u), u), 0.8));
    v2 = $add(v2, $mul($mul(Math.sin($add($mul(col, 0.7), $mul(elapsed, 9))), failure), 0.15));
    yy = graph_bottom - $int(clamp(v2) * $max(1, gh - 1));
    if ($truth(prev)) {
      c.line(...$iter(prev), $add(a, col), yy, ".", stage === 3 ? R : D);
    }
    prev = [$add(a, col), yy];
  }
  head = $add(a, $mod($int($mul(elapsed, 22)), span));
  c.put(head, graph_bottom - 1, "|", W);
  status = $at(["OPTIMIZER: ADAM / TARGET: LOVE", "ATTENTION LOCKED ON LOVE", "LOVE > LOVE > LOVE > LOVE / EOS: 0", "LOSS: NaN / GRAD: INF / NO EXIT"], stage);
  c.put(a, bt3, $slice(status, null, span, null), stage >= 2 ? R : B);
  hit = $next((() => {
    const $r3 = [];
    for (const [start, end] of $iter([[179.929, 180.857], [183.646, 184.54], [187.665, 188.483]])) {
      if (!(start <= t && t < end)) continue;
      $r3.push(start);
    }
    return $r3;
  })(), null);
  if (hit != null) {
    yy = Math.floor($add(panel_top, panel_bottom) / 2) - 2;
    clear(c, a, yy, span, 5);
    c.big(yy, "LOVE", stage >= 2 ? R : W);
    c.put(a, $add(yy, 5), $slice("P(LOVE) -> 1.0 / ALL OTHER TOKENS SUPPRESSED", null, span, null), R);
  }
  if (failure > 0.55) {
    for (let $t613 = $int(0), $t614 = $int(1 + $int($mul(failure, 4))), $t615 = 1; $t615 > 0 ? $t613 < $t614 : $t613 > $t614; $t613 += $t615) {
      i8 = $t613;
      yy = $add($add(panel_top, 1), $mod(hash16($add(tick, $mul(i8, 41))), $max(1, ph - 2)));
      xx = $add(a, $mod(hash16($add(tick, $mul(i8, 97))), $max(1, span - 12)));
      c.put(xx, yy, stage === 3 ? "NaN NaN" : "LOVE LOVE", R);
    }
  }
}
function lyric_trapped_loop(c, t, area, elapsed, pulse) {
  let i8, y, x, num_bars, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  lyric_heart(c, t, area, $min(elapsed, 2), pulse);
  num_bars = 8;
  for (let $t616 = $int(0), $t617 = $int(num_bars), $t618 = 1; $t618 > 0 ? $t616 < $t617 : $t616 > $t617; $t616 += $t618) {
    i8 = $t616;
    x = $add($add(l, 5), $mul(i8, Math.floor((r - l - 10) / (num_bars - 1))));
    for (let $t619 = $int(top), $t620 = $int($add(bt3, 1)), $t621 = 1; $t621 > 0 ? $t619 < $t620 : $t619 > $t620; $t619 += $t621) {
      y = $t619;
      c.put(x, y, "|", N);
      if ($mod($add(y, $int($mul(t, 6))), 7) === 0) {
        c.put(x, y, "\u2593", W);
      }
    }
  }
  if (elapsed > 1) {
    c.center($add(cy, $int((bt3 - top) * 0.35)), "TRAPPED", R);
  }
}
function lyric_outro_wait(c, t, area, elapsed) {
  let dy, x, ch, _2, before, u, retry, spinner, row, col, ink, lit, sweep, filled, style, stalled, progress, inner, bar_x, bar_w, executing, execution_at, cx, cy, l, top, r, bt3;
  [l, top, r, bt3] = $unpack(area, 4);
  [cx, cy] = $unpack([Math.floor($add(l, r) / 2), Math.floor($add(top, bt3) / 2)], 2);
  execution_at = 205.811;
  executing = t >= execution_at;
  bar_w = $min(96, c.w - 12);
  bar_x = Math.floor((c.w - bar_w) / 2);
  inner = bar_w - 4;
  progress = $min(99, $int(99 * (1 - (1 - clamp(elapsed / 5)) ** 3)));
  stalled = progress === 99;
  style = $truth(executing) ? R : B;
  c.center(cy - 6, "world.execute(me);", $truth(executing) ? style : N);
  c.box(bar_x, cy - 2, bar_w, 5, style);
  filled = $min(inner - 1, $int($mul(inner, progress) / 100));
  sweep = $mod($int($mul(t, 18)), $max(1, filled));
  for (let $t622 = $int(0), $t623 = $int(3), $t624 = 1; $t624 > 0 ? $t622 < $t623 : $t622 > $t623; $t622 += $t624) {
    row = $t622;
    for (let $t625 = $int(0), $t626 = $int(inner), $t627 = 1; $t627 > 0 ? $t625 < $t626 : $t625 > $t626; $t625 += $t627) {
      col = $t625;
      lit = col < filled;
      ch = $truth(lit) ? row === 1 ? "#" : "=" : ".";
      ink = $truth(lit) ? style : G;
      if ($truth(lit && $mod(col - sweep, $max(1, filled)) < 3)) {
        ink = $truth(executing) ? R : W;
      }
      c.put($add($add(bar_x, 2), col), $add(cy - 1, row), ch, ink);
    }
  }
  if (!$truth(executing)) {
    spinner = $at("|/-\\", $mod($int($mul(t, 8)), 4));
    c.center($add(cy, 4), $fmt(progress, "02d") + "%  [" + $fmt(spinner, "") + "]  " + ($truth(stalled) ? "WAITING FOR RESPONSE" : "EXECUTING"), B);
    if ($truth(stalled)) {
      retry = $max(1, $int((elapsed - 5) * 2) + 1);
      c.center($add(cy, 6), "RETRY " + $fmt(retry, "04d") + "  /  ACK: --  /  REMAINING: 01%", $truth($mod($int($mul(t, 3)), 2)) ? N : G);
    } else {
      c.center($add(cy, 6), "COMMITTING FINAL INSTRUCTION...", G);
    }
    return;
  }
  u = clamp((t - execution_at) / 0.48);
  before = (() => {
    const $r3 = [];
    for (const y of $iter($range(cy - 2, $add(cy, 3)))) {
      $r3.push($slice($at(c.cells, y), null, null, null));
    }
    return $r3;
  })();
  clear(c, l, cy - 2, r - l + 1, 5);
  c.big(cy - 2, "EXECUTION", R);
  if (u < 1) {
    for (let $t628 = $int(0), $t629 = $int(5), $t630 = 1; $t630 > 0 ? $t628 < $t629 : $t628 > $t629; $t628 += $t630) {
      dy = $t628;
      for (let $t631 = $int(l), $t632 = $int($add(r, 1)), $t633 = 1; $t633 > 0 ? $t631 < $t632 : $t631 > $t632; $t631 += $t633) {
        x = $t631;
        if (hash16($add($mul(x, 71), $mul(dy, 313))) / 65535 > u) {
          [ch, _2] = $unpack($at($at(before, dy), x), 2);
          $setitem($at(c.cells, $add(cy - 2, dy)), x, [ch, R]);
        }
      }
    }
  }
  c.center($add(cy, 4), "[ PROCESS TERMINATED ]", R);
  c.center($add(cy, 6), "EXIT CODE: EXECUTION", $truth($mod($int($mul(t, 2)), 2)) ? R : G);
}
TITLE_CACHE = new PyDict([]);
function title_pixels(w, h2, font) {
  let text3, y0, span, yy, xx, row, left, bitmap, ink, top, total, line_h, key;
  key = [w, h2];
  if ($in(key, TITLE_CACHE)) {
    return $at(TITLE_CACHE, key);
  }
  line_h = $max(5, $min(12, $int($mul(h2, 0.23))));
  total = $add($mul(line_h, 2), 3);
  top = $max(3, Math.floor((h2 - total) / 2) - 1);
  ink = [];
  for (const $t634 of $iter([["WORLD.", top, $int($mul(w, 0.86))], ["EXECUTE(ME);", $add($add(top, line_h), 3), w - 8]])) {
    [text3, y0, span] = $unpack($t634, 3);
    bitmap = [];
    for (let $t635 = $int(0), $t636 = $int(5), $t637 = 1; $t637 > 0 ? $t635 < $t636 : $t635 > $t636; $t635 += $t637) {
      row = $t635;
      bitmap.push($join("0", (() => {
        const $r3 = [];
        for (const ch of $iter(text3)) {
          $r3.push($at($get(font, ch, $at(font, " ")), row));
        }
        return $r3;
      })()));
    }
    left = Math.floor((w - span) / 2);
    for (let $t638 = $int(0), $t639 = $int(line_h), $t640 = 1; $t640 > 0 ? $t638 < $t639 : $t638 > $t639; $t638 += $t640) {
      yy = $t638;
      row = $at(bitmap, $min(4, $int($mul(yy, 5) / line_h)));
      for (let $t641 = $int(0), $t642 = $int(span), $t643 = 1; $t643 > 0 ? $t641 < $t642 : $t641 > $t642; $t641 += $t643) {
        xx = $t641;
        if ($at(row, $min($len(row) - 1, $int($mul(xx, $len(row)) / span))) === "1") {
          ink.push([$add(left, xx), $add(y0, yy)]);
        }
      }
    }
  }
  $setitem(TITLE_CACHE, key, ink);
  return ink;
}
function title_takeover(c, t, font, source = null) {
  let shift, row, i8, tx2, ty, style, ch, sweep, y, x, swirl, dist, angle, oy, ox, ease, u, delay, k2, strand, xx, trail, yy, s15, py, px, radius, e, char, row_shift, band, density, cells, x_right, x_left, y_bot, y_top, phase, wave_count, buildup, dissolve, lock, frame, ink, alphabet, cy, cx, w, h2, elapsed;
  elapsed = t - 16;
  [w, h2] = $unpack([c.w, c.h], 2);
  cx = (w - 1) / 2;
  cy = (h2 - 1) / 2;
  alphabet = "0123456789ABCDEF<>[]{}();:=/\\|+-*#";
  ink = title_pixels(w, h2, font);
  frame = $int($mul(elapsed, 24));
  lock = clamp((elapsed - 4.1) / 2.8);
  dissolve = clamp((elapsed - 11.35) / 2.36);
  if (elapsed < 0) {
    buildup = clamp($add(elapsed, 0.2) / 0.2);
    if ($mod($int($mul($mul(t, 30), buildup)), 2) === 0) {
      for (let $t644 = $int(0), $t645 = $int(h2), $t646 = 1; $t646 > 0 ? $t644 < $t645 : $t644 > $t645; $t644 += $t646) {
        y = $t644;
        for (let $t647 = $int(0), $t648 = $int(w), $t649 = 1; $t649 > 0 ? $t647 < $t648 : $t647 > $t648; $t647 += $t649) {
          x = $t647;
          if ($mod(hash16($add($add(x, $mul(y, w)), $int($mul(t, 100)))), 100) < $mul(buildup, 50)) {
            $setitem($at(c.cells, y), x, ["\u2588", buildup > 0.7 ? W : B]);
          }
        }
      }
    }
    wave_count = $int($mul(buildup, 5)) + 1;
    for (let $t650 = $int(0), $t651 = $int(wave_count), $t652 = 1; $t652 > 0 ? $t650 < $t651 : $t650 > $t651; $t650 += $t652) {
      i8 = $t650;
      phase = $mod($mul(buildup, 3) - $mul(i8, 0.15), 1);
      if (phase < 0) {
        continue;
      }
      y_top = $int($mul(phase, h2) / 2);
      y_bot = h2 - 1 - y_top;
      for (let $t653 = $int(0), $t654 = $int(w), $t655 = 1; $t655 > 0 ? $t653 < $t654 : $t653 > $t654; $t653 += $t655) {
        x = $t653;
        if ($mod(hash16($add(x, i8)), 3) === 0) {
          c.put(x, y_top, phase > 0.7 ? "=" : "-", phase > 0.8 ? W : B);
          c.put(x, y_bot, phase > 0.7 ? "=" : "-", phase > 0.8 ? W : B);
        }
      }
      x_left = $int($mul(phase, w) / 2);
      x_right = w - 1 - x_left;
      for (let $t656 = $int(0), $t657 = $int(h2), $t658 = 1; $t658 > 0 ? $t656 < $t657 : $t656 > $t657; $t656 += $t658) {
        y = $t656;
        if ($mod(hash16($add(y, $mul(i8, 7))), 3) === 0) {
          c.put(x_left, y, "|", phase > 0.8 ? W : B);
          c.put(x_right, y, "|", phase > 0.8 ? W : B);
        }
      }
    }
    if (buildup > 0.5) {
      radius = $int((1 - buildup) * $min(w, h2) * 0.3);
      for (let $t659 = $int(0), $t660 = $int(60), $t661 = 1; $t661 > 0 ? $t659 < $t660 : $t659 > $t660; $t659 += $t661) {
        i8 = $t659;
        angle = $add($mul(i8, TAU) / 60, $mul(t, 5));
        x = $add(cx, $mul(Math.cos(angle), radius));
        y = $add(cy, $mul($mul(Math.sin(angle), radius), 0.5));
        c.put(x, y, buildup > 0.8 ? "*" : "+", buildup > 0.9 ? W : B);
      }
    }
    for (let $t662 = $int(0), $t663 = $int($int($mul(buildup, 8))), $t664 = 1; $t664 > 0 ? $t662 < $t663 : $t662 > $t663; $t662 += $t664) {
      i8 = $t662;
      row = $mod(hash16($add($int($mul(t, 50)), i8)), h2);
      shift = $int($mul($mul(Math.sin($add($mul(t, 20), i8)), buildup), 15));
      if (shift !== 0) {
        cells = $at(c.cells, row);
        $setitem(c.cells, row, $add($slice(cells, -shift, null, null), $slice(cells, null, -shift, null)));
      }
    }
    return;
  }
  density = elapsed < 5 ? 0.78 : mix(0.6, 0.1, lock);
  if ($truth(dissolve)) {
    density = mix(0.1, 0.48, dissolve);
  }
  for (let $t665 = $int(0), $t666 = $int(h2), $t667 = 1; $t667 > 0 ? $t665 < $t666 : $t665 > $t666; $t665 += $t667) {
    yy = $t665;
    band = Math.sin($mul(yy, 0.18) - $mul(elapsed, 2.6));
    row_shift = $int(Math.sin($add($mul(elapsed, 4), $mul(yy, 0.31))) * clamp(elapsed / 2) * 9);
    for (let $t668 = $int(0), $t669 = $int(w), $t670 = 1; $t670 > 0 ? $t668 < $t669 : $t668 > $t669; $t668 += $t670) {
      xx = $t668;
      k2 = hash16($add($add($mul(xx, 37), $mul(yy, 911)), $mul($int($mul(elapsed, 7)), $add(3, $mod(xx, 7)))));
      if (k2 / 65535 > density) {
        continue;
      }
      char = $at(alphabet, $mod($add($add(k2, frame), Math.floor(xx / 7) * 13), $len(alphabet)));
      style = $mod($add(yy, Math.floor(frame / 2)), h2) < 2 ? N : $mod(k2, 17) === 0 ? D : G;
      if (lock > 0.5) {
        style = $mod(k2, 5) === 0 ? G : K;
      }
      c.put($mod($add(xx, row_shift), w), yy, char, style);
    }
  }
  if (source != null) {
    e = clamp(elapsed / 2.1);
    for (const $t671 of $iter($enumerate(source.cells))) {
      [yy, row] = $unpack($t671, 2);
      for (const $t672 of $iter($enumerate(row))) {
        [xx, [ch, s15]] = $unpack($t672, 2);
        if (!$truth($strip(ch))) {
          continue;
        }
        k2 = hash16($add(xx, $mul(yy, w)));
        angle = $add(Math.atan2((yy - cy) * 2, xx - cx), $mul(e, $add(1, $mul($mod(k2, 7), 0.13))));
        radius = $mul(Math.hypot(xx - cx, (yy - cy) * 2), $add(1, $mul(e, 0.9)));
        px = $add($add(cx, $mul(Math.cos(angle), radius)), $mul($mul(Math.sin($add($mul(yy, 0.45), $mul(elapsed, 9))), e), 6));
        py = $add(cy, $mul(Math.sin(angle), radius) / 2);
        if (e > 0.3 && $mod(k2, 5) < $int($mul(e, 5))) {
          ch = $at(alphabet, $mod($add(k2, frame), $len(alphabet)));
        } else if ($ord($at(ch, 0)) > 127) {
          ch = $at(alphabet, $mod(k2, $len(alphabet)));
        }
        c.put($mod($round(px), w), $mod($round(py), h2), ch, e < 0.5 ? N : D);
      }
    }
  }
  if (elapsed < 4.6) {
    for (let $t673 = $int(0), $t674 = $int(7), $t675 = 1; $t675 > 0 ? $t673 < $t674 : $t673 > $t674; $t673 += $t675) {
      strand = $t673;
      for (let $t676 = $int(0), $t677 = $int(w), $t678 = 1; $t678 > 0 ? $t676 < $t677 : $t676 > $t677; $t676 += $t678) {
        xx = $t676;
        angle = $add($mul($mul(xx / w, TAU), 1.7) - $mul(elapsed, 2), $mul(strand, 0.39));
        yy = $add(cy, $mul($mul(Math.sin(angle), h2), 0.37));
        if ($truth($mod(strand, 2))) {
          yy = $add(yy, Math.sin($add($mul(xx, 0.19), $mul(elapsed, 3))) * 2);
        }
        for (let $t679 = $int(0), $t680 = $int(3), $t681 = 1; $t681 > 0 ? $t679 < $t680 : $t679 > $t680; $t679 += $t681) {
          trail = $t679;
          c.put(xx, $add(yy, trail), $truth(trail) ? "." : $at(alphabet, $mod($add($add(xx, frame), strand), $len(alphabet))), trail === 0 ? B : G);
        }
      }
    }
  }
  if (elapsed >= 3.1) {
    for (const $t682 of $iter($enumerate(ink))) {
      [i8, [tx2, ty]] = $unpack($t682, 2);
      k2 = hash16($add($mul(i8, 7), 51));
      delay = $mod(k2, 1e3) / 1e3 * 0.95;
      u = clamp((elapsed - 3.1 - delay) / 3);
      ease = 1 - (1 - u) ** 3;
      ox = $mod(hash16($mul(i8, 17)), w);
      oy = $mod(hash16($add($mul(i8, 29), 10)), h2);
      if ($truth(dissolve)) {
        angle = $add(Math.atan2((ty - cy) * 2, tx2 - cx), $mul(dissolve, 0.75));
        dist = $add(Math.hypot(tx2 - cx, (ty - cy) * 2), $mul(dissolve, $add(30, $mod(k2, 40))));
        x = $add(cx, $mul(Math.cos(angle), dist));
        y = $add(cy, $mul(Math.sin(angle), dist) / 2);
        if ($mod(k2, 100) / 100 < $mul(dissolve, 0.65)) {
          continue;
        }
      } else {
        swirl = Math.sin($mul(u, Math.PI)) * (1 - u);
        x = $add(mix(ox, tx2, ease), $mul($mul($mul(Math.sin($add($mul(elapsed, 2), $mul(i8, 0.7))), swirl), w), 0.24));
        y = $add(mix(oy, ty, ease), $mul($mul($mul(Math.cos($add($mul(elapsed, 2), $mul(i8, 0.7))), swirl), h2), 0.24));
      }
      if ($truth(u > 0.98 && !$truth(dissolve))) {
        sweep = $mod($int($mul(elapsed, 30)), $add(w, 24)) - 12;
        ch = Math.abs(tx2 - sweep) < 3 ? "#" : $at("01", $mod(k2, 2));
        style = Math.abs(tx2 - sweep) < 3 ? W : B;
      } else {
        ch = $at(alphabet, $mod($add(k2, frame), $len(alphabet)));
        style = $mod(k2, 3) === 0 ? B : N;
      }
      c.put($round(x), $round(y), ch, style);
      if ($truth(u < 0.98 || dissolve)) {
        c.put($round(x) - 1, $round(y), ".", G);
      }
    }
  }
  if (7.25 < elapsed && elapsed < 11.35) {
    c.center(1, "M I L I", W);
    c.center(h2 - 3, "world.execute(me);", W);
  }
  if ($in($mod($int($mul(elapsed, 12)), 11), [0, 1, 2])) {
    row = $mod(hash16(frame), h2);
    shift = $int(Math.sin($mul(elapsed, 23)) * 7);
    $setitem(c.cells, row, $truth(shift) ? $add($slice($at(c.cells, row), -shift, null, null), $slice($at(c.cells, row), null, -shift, null)) : $at(c.cells, row));
  }
}
function draw_scene(c, t, top, bt3, pulse, e) {
  let elapsed, lyric_time, lyric_en, l, y, r, b2, area;
  area = simple_area(c, top, bt3);
  [l, y, r, b2] = $unpack(area, 4);
  lyric_en = $truth(e) ? $at(e, "en") : "";
  lyric_time = $truth(e) ? $at(e, "time") : t;
  elapsed = t - lyric_time;
  if (t < 16) {
    if (t < 1.74) {
      lyric_power_line(c, t, area, t - 0.1);
    } else if (t < 2.92) {
      lyric_power_line(c, t, area, 1.6);
    } else if (t < 3.873) {
      lyric_protection(c, t, area, t - 2.92);
    } else if (t < 5.491) {
      lyric_lay_pieces(c, t, area, t - 3.873);
    } else if (t < 6.38) {
      lyric_lay_pieces(c, t, area, t - 3.873);
    } else if (t < 7.446) {
      lyric_object_creation(c, t, area, t - 6.38);
    } else if (t < 10.091) {
      lyric_data_parameters(c, t, area, t - 7.446);
    } else if (t < 11.095) {
      lyric_data_parameters(c, t, area, t - 7.446);
    } else if (t < 16) {
      lyric_simulation(c, t, area, t - 11.095);
    }
  } else if (16 <= t && t < 29.709) {
    ;
  } else if (t < 59.223) {
    if (t < 33.412) {
      lyric_points_dimension(c, t, area, t - 29.709);
    } else if (t < 37.067) {
      lyric_circle_circumference(c, t, area, t - 33.412);
    } else if (t < 40.706) {
      lyric_sine_tangent(c, t, area, t - 37.067);
    } else if (t < 44.452) {
      lyric_infinity_limit(c, t, area, t - 40.706);
    } else if (t < 47.672) {
      lyric_ac_dc(c, t, area, t - 44.452);
    } else if (t < 51.363) {
      lyric_dizzy(c, t, area, t - 47.672);
    } else if (t < 55.083) {
      lyric_time_travel(c, t, area, t - 51.363);
    } else if (t < 59.223) {
      lyric_unite_deeply(c, t, area, t - 55.083);
    }
  } else if (t < 74.045) {
    if (t < 62.589) {
      lyric_stimulation_satisfaction(c, t, area, t - 59.223);
    } else if (t < 66.601) {
      lyric_stimulation_satisfaction(c, t, area, t - 59.223);
    } else if (t < 70.084) {
      lyric_happy_execution(c, t, area, pulse);
    } else if (t < 74.045) {
      lyric_trapped_simulation(c, t, area, pulse);
    }
  } else if (t < 85.078) {
    legacy_organic(c, t, top, bt3, pulse);
  } else if (t < 88.587) {
    lyric_god_existence(c, t, area, t - 85.078);
  } else if (t < 103.489) {
    if (t < 92.015) {
      lyric_identity_rewrite(c, t, area);
    } else if (t < 95.465) {
      lyric_daynight_clock(c, t, area);
    } else if (t < 99.349) {
      lyric_gender_role_switch(c, t, area, t - 95.465, "S", "M");
    } else {
      lyric_dizzy(c, t, area, t - 99.349);
    }
  } else if (t < 110.9) {
    lyric_vibration_sync(c, t, area, t - 103.489);
  } else if (t < 118.333) {
    lyric_isolation_disconnect(c, t, area, t - 110.9);
  } else if (t < 125.708) {
    lyric_erase_fragments(c, t, area, t - 118.333);
  } else if (t < 147.66) {
    lyric_illegal_arguments(c, t, area, t - 125.708);
  } else if (t < 177.246) {
    if (t < 158.9) {
      lyric_execution_queue(c, t, area, t - 147.66);
    } else if (t < 162.632) {
      lyric_multilingual_count(c, t, area);
    } else {
      lyric_only_execution(c, t, area, pulse);
    }
  } else if (t < 192.5) {
    if (t < 188.483) {
      lyric_love_equation(c, t, area, t - 177.246);
    } else {
      lyric_trapped_loop(c, t, area, $min(t - 188.483, 4), pulse);
    }
  } else {
    lyric_outro_wait(c, t, area, t - 192.5);
  }
  if ($truth(t < 192.5 && !(74.045 <= t && t < 85.078 || 103.489 <= t && t < 110.9))) {
    apply_glitch(c, t, top, bt3);
  }
}
function phosphor(c, t, top, bt3) {
  let x, ch, s15, row, intensity;
  if (74.045 <= t && t < 85.078) {
    legacy_phosphor(c, t, top, bt3);
    return;
  }
  intensity = glitch_intensity(t);
  if ($mod(hash16($int($mul(t, 10))), 100) < $mul(intensity, 50)) {
    row = $add(top, $mod($int($mul(t, 9)), $max(1, bt3 - top + 1)));
    for (let $t683 = $int(2), $t684 = $int(c.w - 2), $t685 = 1; $t685 > 0 ? $t683 < $t684 : $t683 > $t684; $t683 += $t685) {
      x = $t683;
      if (row < $len(c.cells) && x < $len($at(c.cells, row))) {
        [ch, s15] = $unpack($at($at(c.cells, row), x), 2);
        if (!$in(ch, ["", " "]) && $in(s15, [D, N, G])) {
          $setitem($at(c.cells, row), x, [ch, $eq(s15, G) ? N : B]);
        }
      }
    }
  }
}

// .dsh-plugin/client/mv/film.mjs
var DURATION = 211.906667;
var CHAPTERS = Object.freeze([
  [0, "01 / CREATION", "\u521B\u5EFA"],
  [29.709, "02 / DEVOTION", "\u732E\u51FA\u81EA\u6211"],
  [110.9, "03 / ISOLATION", "\u79BB\u5F00"],
  [125.708, "04 / EXECUTION", "\u5931\u63A7"],
  [177.246, "05 / LOVE", "\u56F0\u4E8E\u7231"]
]);
var MIN_COLS = 64;
var MIN_ROWS = 24;
var DEFAULT_HINT = "SPACE play/pause  <- -> 5s  [ ] offset  1-5 chapter  F fullscreen  H help";
var HELP_LINES = Object.freeze([
  "CONTROLS / \u64CD\u4F5C",
  "SPACE / ENTER   \u64AD\u653E\u6216\u6682\u505C",
  "LEFT / RIGHT    \u540E\u9000\u6216\u524D\u8FDB 5 \u79D2",
  "R               \u4ECE\u5934\u64AD\u653E",
  "1 2 3 4 5       \u8DF3\u8F6C\u4E94\u4E2A\u7AE0\u8282",
  "[ / ]           \u5B57\u5E55\u63D0\u524D / \u5EF6\u540E 0.1 \u79D2",
  ", / .           \u4E0A\u4E00\u53E5 / \u4E0B\u4E00\u53E5",
  "+ / -           \u97F3\u91CF",
  "M               \u9759\u97F3",
  "F               \u5168\u5C4F",
  "ESC / H         \u5173\u95ED\u5E2E\u52A9"
]);
var ORIGINAL_HELP_LINES = Object.freeze([
  "CONTROLS / \u64CD\u4F5C",
  "SPACE / ENTER   \u64AD\u653E\u6216\u6682\u505C",
  "LEFT / RIGHT    \u540E\u9000\u6216\u524D\u8FDB 5 \u79D2",
  "R               \u4ECE\u5934\u64AD\u653E",
  "1 2 3 4 5       \u8DF3\u8F6C\u4E94\u4E2A\u7AE0\u8282",
  "[ / ]           \u5B57\u5E55\u63D0\u524D / \u5EF6\u540E 0.1 \u79D2",
  ", / .           \u4E0A\u4E00\u53E5 / \u4E0B\u4E00\u53E5",
  "+ / -           \u97F3\u91CF",
  "Q / ESC         \u9000\u51FA",
  "H               \u5173\u95ED\u5E2E\u52A9"
]);
var SILENT = Object.freeze(new Array(48).fill(0));
var pad2 = (n) => String(n).padStart(2, "0");
function clockText(t, duration = DURATION) {
  const s15 = Math.trunc(t), tenth = (Math.trunc(t * 10) % 10 + 10) % 10;
  const total = Math.round(duration);
  return `${pad2(Math.floor(s15 / 60))}:${pad2((s15 % 60 + 60) % 60)}.${tenth} / ${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}
var Film = class {
  /**
   * @param {object} options
   * @param {Array<{time:number,end:number,en?:string,zh?:string}>} options.lyrics cues, sorted
   * @param {(t:number)=>number[]} options.energy 48 normalised bands for time t
   */
  constructor({ lyrics = [], energy = () => SILENT, duration = DURATION } = {}) {
    this.setLyrics(lyrics);
    this.energy = energy;
    this.duration = duration;
  }
  setLyrics(lyrics) {
    this.lyrics = [...lyrics].sort((a, b2) => a.time - b2.time);
    this.times = this.lyrics.map((x) => x.time);
  }
  /** The cue showing at t, or null (bisect_right − 1, then t < end). */
  cue(t) {
    let lo3 = 0, hi2 = this.times.length;
    while (lo3 < hi2) {
      const mid = lo3 + hi2 >> 1;
      if (t < this.times[mid]) hi2 = mid;
      else lo3 = mid + 1;
    }
    const e = lo3 - 1 >= 0 ? this.lyrics[lo3 - 1] : null;
    return e && t < e.end ? e : null;
  }
  chapter(t) {
    let act = CHAPTERS[0];
    for (const c of CHAPTERS) if (c[0] <= Math.max(0, t)) act = c;
    return act;
  }
  render(t, w, h2, { paused = false, offset = 0, ready = false, hint = true, hintText = DEFAULT_HINT, help = false, helpLines = HELP_LINES } = {}) {
    const c = new Canvas(w, h2);
    if (w < MIN_COLS || h2 < MIN_ROWS) {
      c.center(Math.floor(h2 / 2) - 2, "WORLD.EXECUTE(ME);", BRIGHT);
      c.center(Math.floor(h2 / 2), "\u8BF7\u653E\u5927\u7A97\u53E3\uFF0C\u6216\u7F29\u5C0F\u5B57\u53F7", WHITE);
      c.center(Math.floor(h2 / 2) + 2, `${w} x ${h2} / minimum ${MIN_COLS} x ${MIN_ROWS}`, NORMAL);
      c.center(Math.floor(h2 / 2) + 4, "SPACE pause  F fullscreen", DIM);
      return c;
    }
    if (t >= 15.8 && t < 29.709 && !ready) {
      const source = t < 18.1 ? this.render(15.799, w, h2, { paused, offset, ready: false, hint, hintText }) : null;
      title_takeover(c, t, FONT, source);
      if (help) this.help(c, offset, helpLines);
      return c;
    }
    const e = this.cue(t + offset);
    const act = this.chapter(t);
    c.put(2, 0, "WORLD.EXECUTE(ME);", BRIGHT);
    const state = ready ? "READY" : paused ? "PAUSED" : "RUNNING";
    const clock = `${clockText(t, this.duration)}  ${state}`;
    c.put(w - width(clock) - 2, 0, clock, DIM);
    c.put(2, 1, "-".repeat(Math.max(0, w - 4)), DIM);
    c.put(2, 2, act[1], NORMAL);
    const top = 4, bottom = h2 - 8;
    const spec = this.energy(t) ?? SILENT;
    let pulse = 0;
    for (let i8 = 0; i8 < 10; i8++) pulse += spec[i8] ?? 0;
    pulse /= 10;
    c.clip = [top, bottom];
    draw_scene(c, t, top, bottom, pulse, e);
    phosphor(c, t, top, bottom);
    c.clip = null;
    const sy = h2 - 6, cols = Math.min(80, w - 8), start = Math.floor((w - cols) / 2);
    for (let i8 = 0; i8 < cols; i8++) {
      const amp = spec[Math.trunc(i8 * 48 / cols)] ?? 0;
      c.put(start + i8, sy, "._:=|"[Math.min(4, $round(amp * 4))], DIM);
    }
    if (ready) {
      c.center(h2 - 5, "MILI  /  world.execute(me);", WHITE);
      c.center(h2 - 3, "[ SPACE / ENTER TO START ]", BRIGHT);
    } else if (e) {
      const ens = e.en ? wrap(e.en, w - 8) : [];
      const zhs = e.zh ? wrap(e.zh, w - 8) : [];
      ens.slice(0, 2).forEach((line, i8) => c.center(h2 - 5 + i8, line, WHITE));
      zhs.slice(0, 2).forEach((line, i8) => c.center(h2 - 3 + i8, line, BRIGHT));
    } else if (t > 208) {
      c.center(h2 - 5, "PROCESS ENDED. THE LOOP REMAINS.", WHITE);
    } else {
      c.center(h2 - 5, "[ instrumental ]", DIM);
      c.center(h2 - 3, "[ \u95F4\u594F ]", DIM);
    }
    if (hint) c.center(h2 - 1, crop(hintText, w - 4), DIM);
    if (ready) this.slate(c, top, bottom);
    if (help) this.help(c, offset, helpLines);
    return c;
  }
  /** Controls overlay, as `Film.help` in player.py. */
  help(c, offset, lines = HELP_LINES) {
    const sign = offset < 0 ? "-" : "+";
    const all = [...lines, `\u5B57\u5E55\u504F\u79FB ${sign}${Math.abs(offset).toFixed(1)}s`];
    const w = Math.min(c.w - 4, 58), x = Math.floor((c.w - w) / 2), y = Math.floor((c.h - all.length - 3) / 2);
    for (let yy = y; yy < y + all.length + 3; yy++) c.put(x, yy, " ".repeat(w), NORMAL);
    c.box(x, y, w, all.length + 3, BRIGHT);
    all.forEach((line, i8) => c.put(x + 3, y + 2 + i8, crop(line, w - 5), i8 === 0 ? WHITE : NORMAL));
  }
  slate(c, top, bottom) {
    for (let y = top; y <= bottom; y++) c.put(0, y, " ".repeat(c.w), DIM);
    const cy = Math.trunc((top + bottom) / 2);
    c.center(top + 1, "A TERMINAL MUSIC VIDEO", DIM);
    c.big(Math.max(top + 2, cy - 4), "EXECUTE(ME);", BRIGHT);
    c.center(cy + 3, "M I L I", WHITE);
    c.center(Math.min(bottom, cy + 6), "[ SPACE / ENTER TO START ]", BRIGHT);
  }
};

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
    const w = Math.ceil(grid.cols * this.cell.width), h2 = grid.rows * this.cell.height;
    const pw = Math.round(w * this.dpr), ph = Math.round(h2 * this.dpr);
    if (this.canvas.width !== pw || this.canvas.height !== ph) {
      this.canvas.width = pw;
      this.canvas.height = ph;
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h2}px`;
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

// .dsh-plugin/client/mv/lyrics.mjs
var CJK = /[\u3000-\u303f\u3400-\u9fff\uf900-\ufaff\uff00-\uffef]/;
function splitBilingual(lines) {
  const en3 = [], zh2 = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/\s+[/|｜]\s+/);
    if (parts.length === 2 && !CJK.test(parts[0]) && CJK.test(parts[1])) {
      en3.push(parts[0]);
      zh2.push(parts[1]);
      continue;
    }
    ;
    (CJK.test(line) ? zh2 : en3).push(line);
  }
  return { en: en3.join(" "), zh: zh2.join(" ") };
}
function finish(cues, duration) {
  const sorted = cues.filter((c) => Number.isFinite(c.time) && (c.en || c.zh)).sort((a, b2) => a.time - b2.time);
  for (let i8 = 0; i8 < sorted.length; i8++) {
    const next = sorted[i8 + 1];
    if (!Number.isFinite(sorted[i8].end) || sorted[i8].end <= sorted[i8].time) {
      sorted[i8].end = next ? next.time : Math.min(duration, sorted[i8].time + 5);
    }
  }
  return sorted.map(({ time, end, en: en3, zh: zh2 }) => ({ time: round3(time), end: round3(end), en: en3 ?? "", zh: zh2 ?? "" }));
}
var round3 = (v2) => Math.round(v2 * 1e3) / 1e3;
function parseLrc(text3, { duration = 1e9 } = {}) {
  const byTime = /* @__PURE__ */ new Map();
  let offsetMs = 0;
  const order = [];
  for (const raw of String(text3).replace(/^\uFEFF/, "").split(/\r?\n/)) {
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
    cues.push({ time: t + shift, ...splitBilingual(lines) });
  }
  cues.sort((a, b2) => a.time - b2.time);
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
function parseSrt(text3, { duration = 1e9 } = {}) {
  const blocks = String(text3).replace(/^\uFEFF/, "").replace(/\r/g, "").split(/\n\s*\n/);
  const cues = [];
  for (const block of blocks) {
    const lines = block.split("\n");
    const at3 = lines.findIndex((line) => line.includes("-->"));
    if (at3 < 0) continue;
    const [a, b2] = lines[at3].split("-->");
    const ma2 = SRT_TIME.exec(a), mb = SRT_TIME.exec(b2);
    if (!ma2) continue;
    const body = lines.slice(at3 + 1).map((line) => line.replace(/<[^>]+>/g, ""));
    cues.push({ time: srtSeconds(ma2), end: mb ? srtSeconds(mb) : NaN, ...splitBilingual(body) });
  }
  return finish(cues, duration);
}
function parseLyricsJson(text3, { duration = 1e9 } = {}) {
  const data = typeof text3 === "string" ? JSON.parse(text3.replace(/^\uFEFF/, "")) : text3;
  const list = Array.isArray(data) ? data : Array.isArray(data?.lyrics) ? data.lyrics : null;
  if (!list) throw new Error("\u6B4C\u8BCD JSON \u5E94\u4E3A [{ time, end, en, zh }] \u6570\u7EC4\u3002");
  return finish(list.map((item) => ({
    time: Number(item?.time),
    end: Number(item?.end),
    en: typeof item?.en === "string" ? item.en : "",
    zh: typeof item?.zh === "string" ? item.zh : ""
  })), duration);
}
function parseLyrics(name, text3, options) {
  const lower = String(name ?? "").toLowerCase();
  const body = String(text3);
  if (lower.endsWith(".json")) return parseLyricsJson(body, options);
  if (lower.endsWith(".srt") || lower.endsWith(".vtt")) return parseSrt(body, options);
  if (lower.endsWith(".lrc")) return parseLrc(body, options);
  if (/^\uFEFF?\s*(?:\{|\[\s*[{\]])/.test(body)) return parseLyricsJson(body, options);
  if (/-->/.test(body)) return parseSrt(body, options);
  return parseLrc(body, options);
}

// .dsh-plugin/client/mv/spectrum.mjs
var BANDS = 48;
var SILENT2 = Object.freeze(new Array(BANDS).fill(0));
function spectrumFromJson(text3) {
  const data = typeof text3 === "string" ? JSON.parse(text3.replace(/^\uFEFF/, "")) : text3;
  const fps = Number(data?.fps);
  const frames = data?.frames;
  if (!Number.isFinite(fps) || fps <= 0 || !Array.isArray(frames) || !frames.length) throw new Error("spectrum.json \u683C\u5F0F\u65E0\u6548\uFF08\u9700\u8981 fps \u4E0E frames\uFF09\u3002");
  return (t) => frames[Math.min(frames.length - 1, Math.max(0, Math.trunc(t * fps)))] ?? SILENT2;
}
function bandEdges(binCount, sampleRate, bands = BANDS, lo3 = 40, hi2 = 16e3) {
  const nyquist = sampleRate / 2;
  const edges = [];
  for (let i8 = 0; i8 <= bands; i8++) {
    const f = lo3 * Math.pow(hi2 / lo3, i8 / bands);
    edges.push(Math.min(binCount, Math.max(1, Math.round(f / nyquist * binCount))));
  }
  for (let i8 = 1; i8 < edges.length; i8++) if (edges[i8] <= edges[i8 - 1]) edges[i8] = Math.min(binCount, edges[i8 - 1] + 1);
  return edges;
}
function foldBands(bytes, edges, peaks, decay = 0.995) {
  const out = new Array(edges.length - 1);
  for (let b2 = 0; b2 < out.length; b2++) {
    let sum = 0, n = 0;
    for (let i8 = edges[b2]; i8 < Math.max(edges[b2] + 1, edges[b2 + 1]); i8++) {
      sum += bytes[i8] ?? 0;
      n++;
    }
    const v2 = n ? sum / n / 255 : 0;
    peaks[b2] = Math.max(v2, (peaks[b2] ?? 0) * decay, 0.08);
    out[b2] = Math.max(0, Math.min(1, (v2 / peaks[b2]) ** 1.6));
  }
  return out;
}
var LiveSpectrum = class {
  constructor(audio, AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext) {
    this.audio = audio;
    this.Ctx = AudioContextClass;
    this.context = null;
    this.peaks = [];
    this.last = SILENT2;
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
    if (!this.analyser || this.audio.paused) return this.last.map((v2) => v2 * 0.9);
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
var silentEnergy = () => SILENT2;

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
  return [...new Uint8Array(digest)].map((b2) => b2.toString(16).padStart(2, "0")).join("");
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
async function tx(db, mode, fn3) {
  if (!db) return void 0;
  const store = db.transaction(STORE, mode).objectStore(STORE);
  return request(fn3(store));
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
  constructor({ audio = null, silent = new SilentClock(), audioOffset = 0 } = {}) {
    this.audio = audio;
    this.silent = silent;
    this.audioOffset = audioOffset;
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
    const target = Math.min(DURATION, t);
    if (this.hasAudio) {
      const at3 = target - this.audioOffset;
      const end = Number.isFinite(this.audio.duration) ? this.audio.duration - 0.05 : Infinity;
      this.audio.currentTime = Math.max(0, Math.min(end, at3));
    } else this.silent.seek(Math.max(0, target));
  }
};
function frameTime(t, started) {
  if (!started || t < 0) return { t: Math.max(0, t), ready: !started || t < 0 };
  return { t: Math.min(t, DURATION - 1e-3), ready: false };
}
function stepCue(times, t, direction) {
  if (!times.length) return null;
  let lo3 = 0, hi2 = times.length;
  while (lo3 < hi2) {
    const mid = lo3 + hi2 >> 1;
    if (t + 0.03 < times[mid]) hi2 = mid;
    else lo3 = mid + 1;
  }
  const i8 = Math.min(times.length - 1, Math.max(0, lo3 - 1 + (direction > 0 ? 1 : -1)));
  return times[i8];
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
      return { type: "chapter", index: Number(key) - 1, at: CHAPTERS[Number(key) - 1][0] };
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

// .dsh-plugin/client/canvas-mv.jsx
var FONT_KEY = "dsh-mv.canvas.fontSize";
var readFont = (fallback) => {
  try {
    const v2 = Number(globalThis.localStorage?.getItem(FONT_KEY));
    return v2 >= 8 && v2 <= 32 ? v2 : fallback;
  } catch {
    return fallback;
  }
};
var storeFont = (v2) => {
  try {
    globalThis.localStorage?.setItem(FONT_KEY, String(v2));
  } catch {
  }
};
var HINT = "SPACE \u64AD\u653E/\u6682\u505C  \u2190/\u2192 5s  [ ] \u5B57\u5E55  Alt+[ ] \u97F3\u9891\u540C\u6B65  1-5 \u7AE0\u8282  F \u5168\u5C4F  H \u5E2E\u52A9";
function CanvasMv({ defaultFontSize = 14 }) {
  const wrap2 = import_react.default.useRef(null);
  const stage = import_react.default.useRef(null);
  const canvas = import_react.default.useRef(null);
  const audio = import_react.default.useRef(null);
  const engine = import_react.default.useRef(null);
  const [audioInfo, setAudioInfo] = import_react.default.useState(null);
  const [lyricsInfo, setLyricsInfo] = import_react.default.useState(null);
  const [spectrumInfo, setSpectrumInfo] = import_react.default.useState(null);
  const [offsets, setOffsets] = import_react.default.useState({ audioOffset: 0, subtitleOffset: 0 });
  const [fontSize, setFontSize] = import_react.default.useState(() => readFont(defaultFontSize));
  const [status, setStatus] = import_react.default.useState({ t: 0, playing: false, cols: 0, rows: 0 });
  const [error, setError] = import_react.default.useState("");
  const [fullscreen, setFullscreen] = import_react.default.useState(false);
  const offsetsRef = import_react.default.useRef(offsets);
  offsetsRef.current = offsets;
  const dbRef = import_react.default.useRef(null);
  import_react.default.useEffect(() => {
    const live = new LiveSpectrum(audio.current);
    const state = {
      film: new Film({ energy: (t) => state.energy(t) }),
      renderer: new GridRenderer(canvas.current, { fontSize }),
      clock: new FilmClock({ audio: audio.current }),
      live,
      energy: silentEnergy,
      fileEnergy: null,
      started: false,
      help: false,
      sha: ""
    };
    state.energy = () => live.energy();
    engine.current = state;
    let raf = 0, lastStatus = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const box = stage.current;
      if (!box) return;
      const { cols, rows } = state.renderer.fit(box.clientWidth, box.clientHeight);
      const raw = state.clock.time();
      const { t, ready } = frameTime(raw, state.started);
      const playing = state.clock.playing;
      const picture = state.film.render(t, cols, rows, {
        paused: !playing,
        ready,
        offset: offsetsRef.current.subtitleOffset,
        hintText: HINT,
        help: state.help
      });
      state.renderer.draw(picture);
      if (now - lastStatus > 250) {
        lastStatus = now;
        setStatus({ t: raw, playing, cols, rows });
      }
    };
    raf = requestAnimationFrame(frame);
    const onFs = () => setFullscreen(document.fullscreenElement === wrap2.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("fullscreenchange", onFs);
      live.close();
    };
  }, []);
  import_react.default.useEffect(() => {
    engine.current?.renderer.setFontSize(fontSize);
    storeFont(fontSize);
  }, [fontSize]);
  const applyOffsets = import_react.default.useCallback((next) => {
    const value = { audioOffset: roundOffset(next.audioOffset), subtitleOffset: roundOffset(next.subtitleOffset) };
    setOffsets(value);
    if (engine.current) engine.current.clock.audioOffset = value.audioOffset;
    if (engine.current?.sha) saveOffsets(engine.current.sha, value);
  }, []);
  const useAudioFile = import_react.default.useCallback(async (file, { remember = true } = {}) => {
    setError("");
    const state = engine.current;
    try {
      const sha = await sha256Hex(await file.arrayBuffer());
      const old = audio.current.src;
      audio.current.src = URL.createObjectURL(file);
      if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
      state.sha = sha;
      const loaded = loadOffsets(sha, KNOWN_AUDIO);
      setOffsets({ audioOffset: loaded.audioOffset, subtitleOffset: loaded.subtitleOffset });
      state.clock.audioOffset = loaded.audioOffset;
      state.started = false;
      setAudioInfo({ name: file.name, sha, known: loaded.known, saved: loaded.saved, duration: null });
      if (remember) await putMedia(dbRef.current, "audio", { file, name: file.name, sha });
    } catch (failure) {
      setError(`\u65E0\u6CD5\u8BFB\u53D6\u97F3\u9891\uFF1A${failure?.message ?? failure}`);
    }
  }, []);
  const useLyricsText = import_react.default.useCallback(async (name, body, { remember = true } = {}) => {
    setError("");
    try {
      const cues = parseLyrics(name, body, { duration: DURATION });
      if (!cues.length) throw new Error("\u6587\u4EF6\u91CC\u6CA1\u6709\u5E26\u65F6\u95F4\u7684\u6B4C\u8BCD\u884C\u3002");
      engine.current.film.setLyrics(cues);
      setLyricsInfo({ name, count: cues.length });
      if (remember) await putMedia(dbRef.current, "lyrics", { name, text: body });
    } catch (failure) {
      setError(`\u65E0\u6CD5\u89E3\u6790\u6B4C\u8BCD\uFF1A${failure?.message ?? failure}`);
    }
  }, []);
  const useSpectrumText = import_react.default.useCallback(async (name, body, { remember = true } = {}) => {
    setError("");
    try {
      const fileEnergy = spectrumFromJson(body);
      engine.current.energy = (t) => fileEnergy(t);
      setSpectrumInfo({ name });
      if (remember) await putMedia(dbRef.current, "spectrum", { name, text: body });
    } catch (failure) {
      setError(`\u65E0\u6CD5\u8BFB\u53D6\u9891\u8C31\uFF1A${failure?.message ?? failure}`);
    }
  }, []);
  import_react.default.useEffect(() => {
    let cancelled = false;
    void (async () => {
      const db = await openMediaStore();
      if (cancelled) return;
      dbRef.current = db;
      const [a, l, s15] = await Promise.all([getMedia(db, "audio"), getMedia(db, "lyrics"), getMedia(db, "spectrum")]);
      if (cancelled) return;
      if (a?.file) await useAudioFile(a.file, { remember: false });
      if (l?.text) await useLyricsText(l.name, l.text, { remember: false });
      if (s15?.text) await useSpectrumText(s15.name, s15.text, { remember: false });
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const clearSpectrum = async () => {
    const state = engine.current;
    state.energy = () => state.live.energy();
    setSpectrumInfo(null);
    await deleteMedia(dbRef.current, "spectrum");
  };
  const clearLyrics = async () => {
    engine.current.film.setLyrics([]);
    setLyricsInfo(null);
    await deleteMedia(dbRef.current, "lyrics");
  };
  const play = async () => {
    const state = engine.current;
    try {
      state.live.ensure();
    } catch {
    }
    if (state.clock.time() >= DURATION - 0.5) state.clock.seek(0);
    state.started = true;
    try {
      await state.clock.play();
    } catch (failure) {
      setError(`\u65E0\u6CD5\u64AD\u653E\uFF1A${failure?.message ?? failure}`);
    }
  };
  const act = (action) => {
    const state = engine.current;
    if (!state || !action) return false;
    const t = state.clock.time();
    switch (action.type) {
      case "toggle":
        if (!state.started || !state.clock.playing) void play();
        else state.clock.pause();
        return true;
      case "seekBy":
        state.clock.seek(Math.max(-60, t + action.delta));
        return true;
      case "restart":
        state.clock.seek(0);
        void play();
        return true;
      case "chapter":
        state.clock.seek(action.at);
        void play();
        return true;
      case "cue": {
        const at3 = stepCue(state.film.times, t, action.direction);
        if (at3 !== null) {
          state.clock.seek(at3);
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
    else void wrap2.current?.requestFullscreen?.().catch((failure) => setError(`\u65E0\u6CD5\u5168\u5C4F\uFF1A${failure?.message ?? failure}`));
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
    input.accept = "audio/*,video/mp4,.mp3,.m4a,.aac,.mp4,.ogg,.opus,.flac,.wav";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void useAudioFile(file);
    };
    input.click();
  };
  const known = audioInfo?.known;
  const chapter = CHAPTERS.reduce((current, item) => item[0] <= Math.max(0, status.t) ? item : current, CHAPTERS[0]);
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "mv-canvas-tab" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "mv-toolbar" }, /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "mv-button", onClick: pickAudio }, "\u9009\u62E9\u97F3\u9891\u2026"), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "mv-button", onClick: () => pickText(".lrc,.srt,.vtt,.json,.txt", useLyricsText) }, "\u9009\u62E9\u6B4C\u8BCD\uFF08LRC / SRT / lyrics.json\uFF09\u2026"), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", onClick: () => pickText(".json", useSpectrumText) }, "\u9891\u8C31 spectrum.json\uFF08\u53EF\u9009\uFF09\u2026"), /* @__PURE__ */ import_react.default.createElement("label", { className: "mv-inline" }, "\u5B57\u53F7", /* @__PURE__ */ import_react.default.createElement("input", { type: "number", min: 8, max: 32, value: fontSize, onChange: (event) => setFontSize(Math.min(32, Math.max(8, Number(event.target.value) || 14))) })), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", onClick: toggleFullscreen }, fullscreen ? "\u9000\u51FA\u5168\u5C4F" : "\u5168\u5C4F (F)")), /* @__PURE__ */ import_react.default.createElement("div", { className: "mv-media-line" }, /* @__PURE__ */ import_react.default.createElement("span", null, "\u97F3\u9891\uFF1A", audioInfo ? /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("b", null, audioInfo.name), " ", /* @__PURE__ */ import_react.default.createElement("code", { title: audioInfo.sha }, audioInfo.sha.slice(0, 12), "\u2026"), known ? ` \xB7 \u5DF2\u8BC6\u522B\uFF1A${known.label}` : " \xB7 \u672A\u8BC6\u522B\u7684\u7248\u672C\uFF0C\u8BF7\u7528 Alt+[ / Alt+] \u6821\u51C6") : "\u672A\u9009\u62E9\uFF08\u9759\u97F3\u6A21\u5F0F\uFF0C\u753B\u9762\u7167\u5E38\u64AD\u653E\uFF09"), /* @__PURE__ */ import_react.default.createElement("span", null, "\u6B4C\u8BCD\uFF1A", lyricsInfo ? /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, lyricsInfo.name, "\uFF08", lyricsInfo.count, " \u53E5\uFF09 ", /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "mv-link", onClick: () => void clearLyrics() }, "\u79FB\u9664")) : "\u672A\u52A0\u8F7D\uFF08\u53EA\u663E\u793A [ \u95F4\u594F ]\uFF09"), /* @__PURE__ */ import_react.default.createElement("span", null, "\u9891\u8C31\uFF1A", spectrumInfo ? /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, spectrumInfo.name, " ", /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "mv-link", onClick: () => void clearSpectrum() }, "\u6539\u7528\u5B9E\u65F6")) : "\u5B9E\u65F6\u5206\u6790\uFF08AnalyserNode\uFF09")), error && /* @__PURE__ */ import_react.default.createElement("p", { className: "mv-error", role: "alert" }, error), /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      ref: wrap2,
      className: `mv-stage-wrap${fullscreen ? " mv-fullscreen" : ""}`,
      tabIndex: 0,
      onKeyDown,
      onDoubleClick: toggleFullscreen,
      "aria-label": "\u753B\u5E03 MV\uFF08\u70B9\u51FB\u540E\u53EF\u7528\u952E\u76D8\u63A7\u5236\uFF09"
    },
    /* @__PURE__ */ import_react.default.createElement("div", { ref: stage, className: "mv-stage", onClick: () => wrap2.current?.focus() }, /* @__PURE__ */ import_react.default.createElement("canvas", { ref: canvas }))
  ), /* @__PURE__ */ import_react.default.createElement("div", { className: "mv-transport" }, /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "mv-button", onClick: () => act({ type: "toggle" }) }, status.playing ? "\u6682\u505C" : "\u64AD\u653E"), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      className: "mv-seek",
      type: "range",
      min: 0,
      max: DURATION,
      step: 0.1,
      value: Math.max(0, Math.min(DURATION, status.t)),
      onChange: (event) => {
        engine.current.clock.seek(Number(event.target.value));
        engine.current.started = true;
      },
      "aria-label": "\u8FDB\u5EA6"
    }
  ), /* @__PURE__ */ import_react.default.createElement("span", { className: "mv-clock" }, clockText(Math.max(0, status.t))), /* @__PURE__ */ import_react.default.createElement("span", { className: "mv-chip" }, chapter[1], " ", chapter[2])), /* @__PURE__ */ import_react.default.createElement("div", { className: "mv-transport" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "mv-chip" }, "\u5B57\u5E55\u504F\u79FB ", formatOffset(offsets.subtitleOffset), "\uFF08[ / ]\uFF09"), /* @__PURE__ */ import_react.default.createElement("span", { className: "mv-chip" }, "\u97F3\u9891\u540C\u6B65 ", formatOffset(offsets.audioOffset), "\uFF08Alt+[ / Alt+]\uFF09"), audioInfo && /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "mv-link", onClick: () => {
    resetOffsets(audioInfo.sha);
    const v2 = loadOffsets(audioInfo.sha, KNOWN_AUDIO);
    applyOffsets(v2);
    resetOffsets(audioInfo.sha);
  } }, "\u6062\u590D\u9ED8\u8BA4\u504F\u79FB"), /* @__PURE__ */ import_react.default.createElement("span", { className: "mv-caption" }, "\u7F51\u683C ", status.cols, "\xD7", status.rows, "\uFF08\u6700\u5C0F 64\xD724\uFF0C\u6700\u5927 240\xD785\uFF09\xB7 \u504F\u79FB\u6309\u97F3\u9891 sha256 \u8BB0\u5728\u672C\u673A")), /* @__PURE__ */ import_react.default.createElement(
    "audio",
    {
      ref: audio,
      preload: "auto",
      onLoadedMetadata: (event) => setAudioInfo((info) => info ? { ...info, duration: event.currentTarget.duration } : info),
      onEnded: () => {
        if (engine.current) engine.current.started = true;
      }
    }
  ));
}

// .dsh-plugin/client/mv-terminal.jsx
var import_react2 = __toESM(require("react"), 1);

// node_modules/.pnpm/@xterm+xterm@6.0.0/node_modules/@xterm/xterm/lib/xterm.mjs
var zs = Object.defineProperty;
var Rl = Object.getOwnPropertyDescriptor;
var Ll = (s15, t) => {
  for (var e in t) zs(s15, e, { get: t[e], enumerable: true });
};
var M = (s15, t, e, i8) => {
  for (var r = i8 > 1 ? void 0 : i8 ? Rl(t, e) : t, n = s15.length - 1, o2; n >= 0; n--) (o2 = s15[n]) && (r = (i8 ? o2(t, e, r) : o2(r)) || r);
  return i8 && r && zs(t, e, r), r;
};
var S = (s15, t) => (e, i8) => t(e, i8, s15);
var Gs = "Terminal input";
var mi = { get: () => Gs, set: (s15) => Gs = s15 };
var $s = "Too much output to announce, navigate to rows manually to read";
var _i = { get: () => $s, set: (s15) => $s = s15 };
function Al(s15) {
  return s15.replace(/\r?\n/g, "\r");
}
function kl(s15, t) {
  return t ? "\x1B[200~" + s15 + "\x1B[201~" : s15;
}
function Vs(s15, t) {
  s15.clipboardData && s15.clipboardData.setData("text/plain", t.selectionText), s15.preventDefault();
}
function qs(s15, t, e, i8) {
  if (s15.stopPropagation(), s15.clipboardData) {
    let r = s15.clipboardData.getData("text/plain");
    Cn(r, t, e, i8);
  }
}
function Cn(s15, t, e, i8) {
  s15 = Al(s15), s15 = kl(s15, e.decPrivateModes.bracketedPasteMode && i8.rawOptions.ignoreBracketedPasteMode !== true), e.triggerDataEvent(s15, true), t.value = "";
}
function Mn(s15, t, e) {
  let i8 = e.getBoundingClientRect(), r = s15.clientX - i8.left - 10, n = s15.clientY - i8.top - 10;
  t.style.width = "20px", t.style.height = "20px", t.style.left = `${r}px`, t.style.top = `${n}px`, t.style.zIndex = "1000", t.focus();
}
function Pn(s15, t, e, i8, r) {
  Mn(s15, t, e), r && i8.rightClickSelect(s15), t.value = i8.selectionText, t.select();
}
function Ce(s15) {
  return s15 > 65535 ? (s15 -= 65536, String.fromCharCode((s15 >> 10) + 55296) + String.fromCharCode(s15 % 1024 + 56320)) : String.fromCharCode(s15);
}
function It(s15, t = 0, e = s15.length) {
  let i8 = "";
  for (let r = t; r < e; ++r) {
    let n = s15[r];
    n > 65535 ? (n -= 65536, i8 += String.fromCharCode((n >> 10) + 55296) + String.fromCharCode(n % 1024 + 56320)) : i8 += String.fromCharCode(n);
  }
  return i8;
}
var er = class {
  constructor() {
    this._interim = 0;
  }
  clear() {
    this._interim = 0;
  }
  decode(t, e) {
    let i8 = t.length;
    if (!i8) return 0;
    let r = 0, n = 0;
    if (this._interim) {
      let o2 = t.charCodeAt(n++);
      56320 <= o2 && o2 <= 57343 ? e[r++] = (this._interim - 55296) * 1024 + o2 - 56320 + 65536 : (e[r++] = this._interim, e[r++] = o2), this._interim = 0;
    }
    for (let o2 = n; o2 < i8; ++o2) {
      let l = t.charCodeAt(o2);
      if (55296 <= l && l <= 56319) {
        if (++o2 >= i8) return this._interim = l, r;
        let a = t.charCodeAt(o2);
        56320 <= a && a <= 57343 ? e[r++] = (l - 55296) * 1024 + a - 56320 + 65536 : (e[r++] = l, e[r++] = a);
        continue;
      }
      l !== 65279 && (e[r++] = l);
    }
    return r;
  }
};
var tr = class {
  constructor() {
    this.interim = new Uint8Array(3);
  }
  clear() {
    this.interim.fill(0);
  }
  decode(t, e) {
    let i8 = t.length;
    if (!i8) return 0;
    let r = 0, n, o2, l, a, u = 0, h2 = 0;
    if (this.interim[0]) {
      let _2 = false, p = this.interim[0];
      p &= (p & 224) === 192 ? 31 : (p & 240) === 224 ? 15 : 7;
      let m = 0, f;
      for (; (f = this.interim[++m] & 63) && m < 4; ) p <<= 6, p |= f;
      let A = (this.interim[0] & 224) === 192 ? 2 : (this.interim[0] & 240) === 224 ? 3 : 4, R2 = A - m;
      for (; h2 < R2; ) {
        if (h2 >= i8) return 0;
        if (f = t[h2++], (f & 192) !== 128) {
          h2--, _2 = true;
          break;
        } else this.interim[m++] = f, p <<= 6, p |= f & 63;
      }
      _2 || (A === 2 ? p < 128 ? h2-- : e[r++] = p : A === 3 ? p < 2048 || p >= 55296 && p <= 57343 || p === 65279 || (e[r++] = p) : p < 65536 || p > 1114111 || (e[r++] = p)), this.interim.fill(0);
    }
    let c = i8 - 4, d = h2;
    for (; d < i8; ) {
      for (; d < c && !((n = t[d]) & 128) && !((o2 = t[d + 1]) & 128) && !((l = t[d + 2]) & 128) && !((a = t[d + 3]) & 128); ) e[r++] = n, e[r++] = o2, e[r++] = l, e[r++] = a, d += 4;
      if (n = t[d++], n < 128) e[r++] = n;
      else if ((n & 224) === 192) {
        if (d >= i8) return this.interim[0] = n, r;
        if (o2 = t[d++], (o2 & 192) !== 128) {
          d--;
          continue;
        }
        if (u = (n & 31) << 6 | o2 & 63, u < 128) {
          d--;
          continue;
        }
        e[r++] = u;
      } else if ((n & 240) === 224) {
        if (d >= i8) return this.interim[0] = n, r;
        if (o2 = t[d++], (o2 & 192) !== 128) {
          d--;
          continue;
        }
        if (d >= i8) return this.interim[0] = n, this.interim[1] = o2, r;
        if (l = t[d++], (l & 192) !== 128) {
          d--;
          continue;
        }
        if (u = (n & 15) << 12 | (o2 & 63) << 6 | l & 63, u < 2048 || u >= 55296 && u <= 57343 || u === 65279) continue;
        e[r++] = u;
      } else if ((n & 248) === 240) {
        if (d >= i8) return this.interim[0] = n, r;
        if (o2 = t[d++], (o2 & 192) !== 128) {
          d--;
          continue;
        }
        if (d >= i8) return this.interim[0] = n, this.interim[1] = o2, r;
        if (l = t[d++], (l & 192) !== 128) {
          d--;
          continue;
        }
        if (d >= i8) return this.interim[0] = n, this.interim[1] = o2, this.interim[2] = l, r;
        if (a = t[d++], (a & 192) !== 128) {
          d--;
          continue;
        }
        if (u = (n & 7) << 18 | (o2 & 63) << 12 | (l & 63) << 6 | a & 63, u < 65536 || u > 1114111) continue;
        e[r++] = u;
      }
    }
    return r;
  }
};
var ir = "";
var we = " ";
var De = class s {
  constructor() {
    this.fg = 0;
    this.bg = 0;
    this.extended = new rt();
  }
  static toColorRGB(t) {
    return [t >>> 16 & 255, t >>> 8 & 255, t & 255];
  }
  static fromColorRGB(t) {
    return (t[0] & 255) << 16 | (t[1] & 255) << 8 | t[2] & 255;
  }
  clone() {
    let t = new s();
    return t.fg = this.fg, t.bg = this.bg, t.extended = this.extended.clone(), t;
  }
  isInverse() {
    return this.fg & 67108864;
  }
  isBold() {
    return this.fg & 134217728;
  }
  isUnderline() {
    return this.hasExtendedAttrs() && this.extended.underlineStyle !== 0 ? 1 : this.fg & 268435456;
  }
  isBlink() {
    return this.fg & 536870912;
  }
  isInvisible() {
    return this.fg & 1073741824;
  }
  isItalic() {
    return this.bg & 67108864;
  }
  isDim() {
    return this.bg & 134217728;
  }
  isStrikethrough() {
    return this.fg & 2147483648;
  }
  isProtected() {
    return this.bg & 536870912;
  }
  isOverline() {
    return this.bg & 1073741824;
  }
  getFgColorMode() {
    return this.fg & 50331648;
  }
  getBgColorMode() {
    return this.bg & 50331648;
  }
  isFgRGB() {
    return (this.fg & 50331648) === 50331648;
  }
  isBgRGB() {
    return (this.bg & 50331648) === 50331648;
  }
  isFgPalette() {
    return (this.fg & 50331648) === 16777216 || (this.fg & 50331648) === 33554432;
  }
  isBgPalette() {
    return (this.bg & 50331648) === 16777216 || (this.bg & 50331648) === 33554432;
  }
  isFgDefault() {
    return (this.fg & 50331648) === 0;
  }
  isBgDefault() {
    return (this.bg & 50331648) === 0;
  }
  isAttributeDefault() {
    return this.fg === 0 && this.bg === 0;
  }
  getFgColor() {
    switch (this.fg & 50331648) {
      case 16777216:
      case 33554432:
        return this.fg & 255;
      case 50331648:
        return this.fg & 16777215;
      default:
        return -1;
    }
  }
  getBgColor() {
    switch (this.bg & 50331648) {
      case 16777216:
      case 33554432:
        return this.bg & 255;
      case 50331648:
        return this.bg & 16777215;
      default:
        return -1;
    }
  }
  hasExtendedAttrs() {
    return this.bg & 268435456;
  }
  updateExtended() {
    this.extended.isEmpty() ? this.bg &= -268435457 : this.bg |= 268435456;
  }
  getUnderlineColor() {
    if (this.bg & 268435456 && ~this.extended.underlineColor) switch (this.extended.underlineColor & 50331648) {
      case 16777216:
      case 33554432:
        return this.extended.underlineColor & 255;
      case 50331648:
        return this.extended.underlineColor & 16777215;
      default:
        return this.getFgColor();
    }
    return this.getFgColor();
  }
  getUnderlineColorMode() {
    return this.bg & 268435456 && ~this.extended.underlineColor ? this.extended.underlineColor & 50331648 : this.getFgColorMode();
  }
  isUnderlineColorRGB() {
    return this.bg & 268435456 && ~this.extended.underlineColor ? (this.extended.underlineColor & 50331648) === 50331648 : this.isFgRGB();
  }
  isUnderlineColorPalette() {
    return this.bg & 268435456 && ~this.extended.underlineColor ? (this.extended.underlineColor & 50331648) === 16777216 || (this.extended.underlineColor & 50331648) === 33554432 : this.isFgPalette();
  }
  isUnderlineColorDefault() {
    return this.bg & 268435456 && ~this.extended.underlineColor ? (this.extended.underlineColor & 50331648) === 0 : this.isFgDefault();
  }
  getUnderlineStyle() {
    return this.fg & 268435456 ? this.bg & 268435456 ? this.extended.underlineStyle : 1 : 0;
  }
  getUnderlineVariantOffset() {
    return this.extended.underlineVariantOffset;
  }
};
var rt = class s2 {
  constructor(t = 0, e = 0) {
    this._ext = 0;
    this._urlId = 0;
    this._ext = t, this._urlId = e;
  }
  get ext() {
    return this._urlId ? this._ext & -469762049 | this.underlineStyle << 26 : this._ext;
  }
  set ext(t) {
    this._ext = t;
  }
  get underlineStyle() {
    return this._urlId ? 5 : (this._ext & 469762048) >> 26;
  }
  set underlineStyle(t) {
    this._ext &= -469762049, this._ext |= t << 26 & 469762048;
  }
  get underlineColor() {
    return this._ext & 67108863;
  }
  set underlineColor(t) {
    this._ext &= -67108864, this._ext |= t & 67108863;
  }
  get urlId() {
    return this._urlId;
  }
  set urlId(t) {
    this._urlId = t;
  }
  get underlineVariantOffset() {
    let t = (this._ext & 3758096384) >> 29;
    return t < 0 ? t ^ 4294967288 : t;
  }
  set underlineVariantOffset(t) {
    this._ext &= 536870911, this._ext |= t << 29 & 3758096384;
  }
  clone() {
    return new s2(this._ext, this._urlId);
  }
  isEmpty() {
    return this.underlineStyle === 0 && this._urlId === 0;
  }
};
var q = class s3 extends De {
  constructor() {
    super(...arguments);
    this.content = 0;
    this.fg = 0;
    this.bg = 0;
    this.extended = new rt();
    this.combinedData = "";
  }
  static fromCharData(e) {
    let i8 = new s3();
    return i8.setFromCharData(e), i8;
  }
  isCombined() {
    return this.content & 2097152;
  }
  getWidth() {
    return this.content >> 22;
  }
  getChars() {
    return this.content & 2097152 ? this.combinedData : this.content & 2097151 ? Ce(this.content & 2097151) : "";
  }
  getCode() {
    return this.isCombined() ? this.combinedData.charCodeAt(this.combinedData.length - 1) : this.content & 2097151;
  }
  setFromCharData(e) {
    this.fg = e[0], this.bg = 0;
    let i8 = false;
    if (e[1].length > 2) i8 = true;
    else if (e[1].length === 2) {
      let r = e[1].charCodeAt(0);
      if (55296 <= r && r <= 56319) {
        let n = e[1].charCodeAt(1);
        56320 <= n && n <= 57343 ? this.content = (r - 55296) * 1024 + n - 56320 + 65536 | e[2] << 22 : i8 = true;
      } else i8 = true;
    } else this.content = e[1].charCodeAt(0) | e[2] << 22;
    i8 && (this.combinedData = e[1], this.content = 2097152 | e[2] << 22);
  }
  getAsCharData() {
    return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
  }
};
var js = "di$target";
var Hn = "di$dependencies";
var Fn = /* @__PURE__ */ new Map();
function Xs(s15) {
  return s15[Hn] || [];
}
function ie(s15) {
  if (Fn.has(s15)) return Fn.get(s15);
  let t = function(e, i8, r) {
    if (arguments.length !== 3) throw new Error("@IServiceName-decorator can only be used to decorate a parameter");
    Pl(t, e, r);
  };
  return t._id = s15, Fn.set(s15, t), t;
}
function Pl(s15, t, e) {
  t[js] === t ? t[Hn].push({ id: s15, index: e }) : (t[Hn] = [{ id: s15, index: e }], t[js] = t);
}
var F = ie("BufferService");
var rr = ie("CoreMouseService");
var ge = ie("CoreService");
var Zs = ie("CharsetService");
var xt = ie("InstantiationService");
var nr = ie("LogService");
var H = ie("OptionsService");
var sr = ie("OscLinkService");
var Js = ie("UnicodeService");
var Be = ie("DecorationService");
var wt = class {
  constructor(t, e, i8) {
    this._bufferService = t;
    this._optionsService = e;
    this._oscLinkService = i8;
  }
  provideLinks(t, e) {
    let i8 = this._bufferService.buffer.lines.get(t - 1);
    if (!i8) {
      e(void 0);
      return;
    }
    let r = [], n = this._optionsService.rawOptions.linkHandler, o2 = new q(), l = i8.getTrimmedLength(), a = -1, u = -1, h2 = false;
    for (let c = 0; c < l; c++) if (!(u === -1 && !i8.hasContent(c))) {
      if (i8.loadCell(c, o2), o2.hasExtendedAttrs() && o2.extended.urlId) if (u === -1) {
        u = c, a = o2.extended.urlId;
        continue;
      } else h2 = o2.extended.urlId !== a;
      else u !== -1 && (h2 = true);
      if (h2 || u !== -1 && c === l - 1) {
        let d = this._oscLinkService.getLinkData(a)?.uri;
        if (d) {
          let _2 = { start: { x: u + 1, y: t }, end: { x: c + (!h2 && c === l - 1 ? 1 : 0), y: t } }, p = false;
          if (!n?.allowNonHttpProtocols) try {
            let m = new URL(d);
            ["http:", "https:"].includes(m.protocol) || (p = true);
          } catch {
            p = true;
          }
          p || r.push({ text: d, range: _2, activate: (m, f) => n ? n.activate(m, f, _2) : Ol(m, f), hover: (m, f) => n?.hover?.(m, f, _2), leave: (m, f) => n?.leave?.(m, f, _2) });
        }
        h2 = false, o2.hasExtendedAttrs() && o2.extended.urlId ? (u = c, a = o2.extended.urlId) : (u = -1, a = -1);
      }
    }
    e(r);
  }
};
wt = M([S(0, F), S(1, H), S(2, sr)], wt);
function Ol(s15, t) {
  if (confirm(`Do you want to navigate to ${t}?

WARNING: This link could potentially be dangerous`)) {
    let i8 = window.open();
    if (i8) {
      try {
        i8.opener = null;
      } catch {
      }
      i8.location.href = t;
    } else console.warn("Opening link blocked as opener could not be cleared");
  }
}
var nt = ie("CharSizeService");
var ae = ie("CoreBrowserService");
var Dt = ie("MouseService");
var ce = ie("RenderService");
var Qs = ie("SelectionService");
var or = ie("CharacterJoinerService");
var Re = ie("ThemeService");
var lr = ie("LinkProviderService");
var Wn = class {
  constructor() {
    this.listeners = [], this.unexpectedErrorHandler = function(t) {
      setTimeout(() => {
        throw t.stack ? ar.isErrorNoTelemetry(t) ? new ar(t.message + `

` + t.stack) : new Error(t.message + `

` + t.stack) : t;
      }, 0);
    };
  }
  addListener(t) {
    return this.listeners.push(t), () => {
      this._removeListener(t);
    };
  }
  emit(t) {
    this.listeners.forEach((e) => {
      e(t);
    });
  }
  _removeListener(t) {
    this.listeners.splice(this.listeners.indexOf(t), 1);
  }
  setUnexpectedErrorHandler(t) {
    this.unexpectedErrorHandler = t;
  }
  getUnexpectedErrorHandler() {
    return this.unexpectedErrorHandler;
  }
  onUnexpectedError(t) {
    this.unexpectedErrorHandler(t), this.emit(t);
  }
  onUnexpectedExternalError(t) {
    this.unexpectedErrorHandler(t);
  }
};
var Bl = new Wn();
function Lt(s15) {
  Nl(s15) || Bl.onUnexpectedError(s15);
}
var Un = "Canceled";
function Nl(s15) {
  return s15 instanceof bi ? true : s15 instanceof Error && s15.name === Un && s15.message === Un;
}
var bi = class extends Error {
  constructor() {
    super(Un), this.name = this.message;
  }
};
function eo(s15) {
  return s15 ? new Error(`Illegal argument: ${s15}`) : new Error("Illegal argument");
}
var ar = class s4 extends Error {
  constructor(t) {
    super(t), this.name = "CodeExpectedError";
  }
  static fromError(t) {
    if (t instanceof s4) return t;
    let e = new s4();
    return e.message = t.message, e.stack = t.stack, e;
  }
  static isErrorNoTelemetry(t) {
    return t.name === "CodeExpectedError";
  }
};
var Rt = class s5 extends Error {
  constructor(t) {
    super(t || "An unexpected bug occurred."), Object.setPrototypeOf(this, s5.prototype);
  }
};
function Fl(s15, t, e = 0, i8 = s15.length) {
  let r = e, n = i8;
  for (; r < n; ) {
    let o2 = Math.floor((r + n) / 2);
    t(s15[o2]) ? r = o2 + 1 : n = o2;
  }
  return r - 1;
}
var cr = class cr2 {
  constructor(t) {
    this._array = t;
    this._findLastMonotonousLastIdx = 0;
  }
  findLastMonotonous(t) {
    if (cr2.assertInvariants) {
      if (this._prevFindLastPredicate) {
        for (let i8 of this._array) if (this._prevFindLastPredicate(i8) && !t(i8)) throw new Error("MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.");
      }
      this._prevFindLastPredicate = t;
    }
    let e = Fl(this._array, t, this._findLastMonotonousLastIdx);
    return this._findLastMonotonousLastIdx = e + 1, e === -1 ? void 0 : this._array[e];
  }
};
cr.assertInvariants = false;
function Se(s15, t = 0) {
  return s15[s15.length - (1 + t)];
}
var ro;
((l) => {
  function s15(a) {
    return a < 0;
  }
  l.isLessThan = s15;
  function t(a) {
    return a <= 0;
  }
  l.isLessThanOrEqual = t;
  function e(a) {
    return a > 0;
  }
  l.isGreaterThan = e;
  function i8(a) {
    return a === 0;
  }
  l.isNeitherLessOrGreaterThan = i8, l.greaterThan = 1, l.lessThan = -1, l.neitherLessOrGreaterThan = 0;
})(ro || (ro = {}));
function no(s15, t) {
  return (e, i8) => t(s15(e), s15(i8));
}
var so = (s15, t) => s15 - t;
var At = class At2 {
  constructor(t) {
    this.iterate = t;
  }
  forEach(t) {
    this.iterate((e) => (t(e), true));
  }
  toArray() {
    let t = [];
    return this.iterate((e) => (t.push(e), true)), t;
  }
  filter(t) {
    return new At2((e) => this.iterate((i8) => t(i8) ? e(i8) : true));
  }
  map(t) {
    return new At2((e) => this.iterate((i8) => e(t(i8))));
  }
  some(t) {
    let e = false;
    return this.iterate((i8) => (e = t(i8), !e)), e;
  }
  findFirst(t) {
    let e;
    return this.iterate((i8) => t(i8) ? (e = i8, false) : true), e;
  }
  findLast(t) {
    let e;
    return this.iterate((i8) => (t(i8) && (e = i8), true)), e;
  }
  findLastMaxBy(t) {
    let e, i8 = true;
    return this.iterate((r) => ((i8 || ro.isGreaterThan(t(r, e))) && (i8 = false, e = r), true)), e;
  }
};
At.empty = new At((t) => {
});
function co(s15, t) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let i8 of s15) {
    let r = t(i8), n = e[r];
    n || (n = e[r] = []), n.push(i8);
  }
  return e;
}
var lo;
var ao;
var oo = class {
  constructor(t, e) {
    this.toKey = e;
    this._map = /* @__PURE__ */ new Map();
    this[lo] = "SetWithKey";
    for (let i8 of t) this.add(i8);
  }
  get size() {
    return this._map.size;
  }
  add(t) {
    let e = this.toKey(t);
    return this._map.set(e, t), this;
  }
  delete(t) {
    return this._map.delete(this.toKey(t));
  }
  has(t) {
    return this._map.has(this.toKey(t));
  }
  *entries() {
    for (let t of this._map.values()) yield [t, t];
  }
  keys() {
    return this.values();
  }
  *values() {
    for (let t of this._map.values()) yield t;
  }
  clear() {
    this._map.clear();
  }
  forEach(t, e) {
    this._map.forEach((i8) => t.call(e, i8, i8, this));
  }
  [(ao = Symbol.iterator, lo = Symbol.toStringTag, ao)]() {
    return this.values();
  }
};
var ur = class {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  add(t, e) {
    let i8 = this.map.get(t);
    i8 || (i8 = /* @__PURE__ */ new Set(), this.map.set(t, i8)), i8.add(e);
  }
  delete(t, e) {
    let i8 = this.map.get(t);
    i8 && (i8.delete(e), i8.size === 0 && this.map.delete(t));
  }
  forEach(t, e) {
    let i8 = this.map.get(t);
    i8 && i8.forEach(e);
  }
  get(t) {
    let e = this.map.get(t);
    return e || /* @__PURE__ */ new Set();
  }
};
function Kn(s15, t) {
  let e = this, i8 = false, r;
  return function() {
    if (i8) return r;
    if (i8 = true, t) try {
      r = s15.apply(e, arguments);
    } finally {
      t();
    }
    else r = s15.apply(e, arguments);
    return r;
  };
}
var zn;
((O2) => {
  function s15(I) {
    return I && typeof I == "object" && typeof I[Symbol.iterator] == "function";
  }
  O2.is = s15;
  let t = Object.freeze([]);
  function e() {
    return t;
  }
  O2.empty = e;
  function* i8(I) {
    yield I;
  }
  O2.single = i8;
  function r(I) {
    return s15(I) ? I : i8(I);
  }
  O2.wrap = r;
  function n(I) {
    return I || t;
  }
  O2.from = n;
  function* o2(I) {
    for (let k2 = I.length - 1; k2 >= 0; k2--) yield I[k2];
  }
  O2.reverse = o2;
  function l(I) {
    return !I || I[Symbol.iterator]().next().done === true;
  }
  O2.isEmpty = l;
  function a(I) {
    return I[Symbol.iterator]().next().value;
  }
  O2.first = a;
  function u(I, k2) {
    let P = 0;
    for (let oe of I) if (k2(oe, P++)) return true;
    return false;
  }
  O2.some = u;
  function h2(I, k2) {
    for (let P of I) if (k2(P)) return P;
  }
  O2.find = h2;
  function* c(I, k2) {
    for (let P of I) k2(P) && (yield P);
  }
  O2.filter = c;
  function* d(I, k2) {
    let P = 0;
    for (let oe of I) yield k2(oe, P++);
  }
  O2.map = d;
  function* _2(I, k2) {
    let P = 0;
    for (let oe of I) yield* k2(oe, P++);
  }
  O2.flatMap = _2;
  function* p(...I) {
    for (let k2 of I) yield* k2;
  }
  O2.concat = p;
  function m(I, k2, P) {
    let oe = P;
    for (let Me2 of I) oe = k2(oe, Me2);
    return oe;
  }
  O2.reduce = m;
  function* f(I, k2, P = I.length) {
    for (k2 < 0 && (k2 += I.length), P < 0 ? P += I.length : P > I.length && (P = I.length); k2 < P; k2++) yield I[k2];
  }
  O2.slice = f;
  function A(I, k2 = Number.POSITIVE_INFINITY) {
    let P = [];
    if (k2 === 0) return [P, I];
    let oe = I[Symbol.iterator]();
    for (let Me2 = 0; Me2 < k2; Me2++) {
      let Pe2 = oe.next();
      if (Pe2.done) return [P, O2.empty()];
      P.push(Pe2.value);
    }
    return [P, { [Symbol.iterator]() {
      return oe;
    } }];
  }
  O2.consume = A;
  async function R2(I) {
    let k2 = [];
    for await (let P of I) k2.push(P);
    return Promise.resolve(k2);
  }
  O2.asyncToArray = R2;
})(zn || (zn = {}));
var Wl = false;
var dt = null;
var hr = class hr2 {
  constructor() {
    this.livingDisposables = /* @__PURE__ */ new Map();
  }
  getDisposableData(t) {
    let e = this.livingDisposables.get(t);
    return e || (e = { parent: null, source: null, isSingleton: false, value: t, idx: hr2.idx++ }, this.livingDisposables.set(t, e)), e;
  }
  trackDisposable(t) {
    let e = this.getDisposableData(t);
    e.source || (e.source = new Error().stack);
  }
  setParent(t, e) {
    let i8 = this.getDisposableData(t);
    i8.parent = e;
  }
  markAsDisposed(t) {
    this.livingDisposables.delete(t);
  }
  markAsSingleton(t) {
    this.getDisposableData(t).isSingleton = true;
  }
  getRootParent(t, e) {
    let i8 = e.get(t);
    if (i8) return i8;
    let r = t.parent ? this.getRootParent(this.getDisposableData(t.parent), e) : t;
    return e.set(t, r), r;
  }
  getTrackedDisposables() {
    let t = /* @__PURE__ */ new Map();
    return [...this.livingDisposables.entries()].filter(([, i8]) => i8.source !== null && !this.getRootParent(i8, t).isSingleton).flatMap(([i8]) => i8);
  }
  computeLeakingDisposables(t = 10, e) {
    let i8;
    if (e) i8 = e;
    else {
      let a = /* @__PURE__ */ new Map(), u = [...this.livingDisposables.values()].filter((c) => c.source !== null && !this.getRootParent(c, a).isSingleton);
      if (u.length === 0) return;
      let h2 = new Set(u.map((c) => c.value));
      if (i8 = u.filter((c) => !(c.parent && h2.has(c.parent))), i8.length === 0) throw new Error("There are cyclic diposable chains!");
    }
    if (!i8) return;
    function r(a) {
      function u(c, d) {
        for (; c.length > 0 && d.some((_2) => typeof _2 == "string" ? _2 === c[0] : c[0].match(_2)); ) c.shift();
      }
      let h2 = a.source.split(`
`).map((c) => c.trim().replace("at ", "")).filter((c) => c !== "");
      return u(h2, ["Error", /^trackDisposable \(.*\)$/, /^DisposableTracker.trackDisposable \(.*\)$/]), h2.reverse();
    }
    let n = new ur();
    for (let a of i8) {
      let u = r(a);
      for (let h2 = 0; h2 <= u.length; h2++) n.add(u.slice(0, h2).join(`
`), a);
    }
    i8.sort(no((a) => a.idx, so));
    let o2 = "", l = 0;
    for (let a of i8.slice(0, t)) {
      l++;
      let u = r(a), h2 = [];
      for (let c = 0; c < u.length; c++) {
        let d = u[c];
        d = `(shared with ${n.get(u.slice(0, c + 1).join(`
`)).size}/${i8.length} leaks) at ${d}`;
        let p = n.get(u.slice(0, c).join(`
`)), m = co([...p].map((f) => r(f)[c]), (f) => f);
        delete m[u[c]];
        for (let [f, A] of Object.entries(m)) h2.unshift(`    - stacktraces of ${A.length} other leaks continue with ${f}`);
        h2.unshift(d);
      }
      o2 += `


==================== Leaking disposable ${l}/${i8.length}: ${a.value.constructor.name} ====================
${h2.join(`
`)}
============================================================

`;
    }
    return i8.length > t && (o2 += `


... and ${i8.length - t} more leaking disposables

`), { leaks: i8, details: o2 };
  }
};
hr.idx = 0;
function Ul(s15) {
  dt = s15;
}
if (Wl) {
  let s15 = "__is_disposable_tracked__";
  Ul(new class {
    trackDisposable(t) {
      let e = new Error("Potentially leaked disposable").stack;
      setTimeout(() => {
        t[s15] || console.log(e);
      }, 3e3);
    }
    setParent(t, e) {
      if (t && t !== D2.None) try {
        t[s15] = true;
      } catch {
      }
    }
    markAsDisposed(t) {
      if (t && t !== D2.None) try {
        t[s15] = true;
      } catch {
      }
    }
    markAsSingleton(t) {
    }
  }());
}
function fr(s15) {
  return dt?.trackDisposable(s15), s15;
}
function pr(s15) {
  dt?.markAsDisposed(s15);
}
function vi(s15, t) {
  dt?.setParent(s15, t);
}
function Kl(s15, t) {
  if (dt) for (let e of s15) dt.setParent(e, t);
}
function Gn(s15) {
  return dt?.markAsSingleton(s15), s15;
}
function Ne(s15) {
  if (zn.is(s15)) {
    let t = [];
    for (let e of s15) if (e) try {
      e.dispose();
    } catch (i8) {
      t.push(i8);
    }
    if (t.length === 1) throw t[0];
    if (t.length > 1) throw new AggregateError(t, "Encountered errors while disposing of store");
    return Array.isArray(s15) ? [] : s15;
  } else if (s15) return s15.dispose(), s15;
}
function ho(...s15) {
  let t = C(() => Ne(s15));
  return Kl(s15, t), t;
}
function C(s15) {
  let t = fr({ dispose: Kn(() => {
    pr(t), s15();
  }) });
  return t;
}
var dr = class dr2 {
  constructor() {
    this._toDispose = /* @__PURE__ */ new Set();
    this._isDisposed = false;
    fr(this);
  }
  dispose() {
    this._isDisposed || (pr(this), this._isDisposed = true, this.clear());
  }
  get isDisposed() {
    return this._isDisposed;
  }
  clear() {
    if (this._toDispose.size !== 0) try {
      Ne(this._toDispose);
    } finally {
      this._toDispose.clear();
    }
  }
  add(t) {
    if (!t) return t;
    if (t === this) throw new Error("Cannot register a disposable on itself!");
    return vi(t, this), this._isDisposed ? dr2.DISABLE_DISPOSED_WARNING || console.warn(new Error("Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!").stack) : this._toDispose.add(t), t;
  }
  delete(t) {
    if (t) {
      if (t === this) throw new Error("Cannot dispose a disposable on itself!");
      this._toDispose.delete(t), t.dispose();
    }
  }
  deleteAndLeak(t) {
    t && this._toDispose.has(t) && (this._toDispose.delete(t), vi(t, null));
  }
};
dr.DISABLE_DISPOSED_WARNING = false;
var Ee = dr;
var D2 = class {
  constructor() {
    this._store = new Ee();
    fr(this), vi(this._store, this);
  }
  dispose() {
    pr(this), this._store.dispose();
  }
  _register(t) {
    if (t === this) throw new Error("Cannot register a disposable on itself!");
    return this._store.add(t);
  }
};
D2.None = Object.freeze({ dispose() {
} });
var ye = class {
  constructor() {
    this._isDisposed = false;
    fr(this);
  }
  get value() {
    return this._isDisposed ? void 0 : this._value;
  }
  set value(t) {
    this._isDisposed || t === this._value || (this._value?.dispose(), t && vi(t, this), this._value = t);
  }
  clear() {
    this.value = void 0;
  }
  dispose() {
    this._isDisposed = true, pr(this), this._value?.dispose(), this._value = void 0;
  }
  clearAndLeak() {
    let t = this._value;
    return this._value = void 0, t && vi(t, null), t;
  }
};
var fe = typeof window == "object" ? window : globalThis;
var kt = class kt2 {
  constructor(t) {
    this.element = t, this.next = kt2.Undefined, this.prev = kt2.Undefined;
  }
};
kt.Undefined = new kt(void 0);
var G2 = kt;
var Ct = class {
  constructor() {
    this._first = G2.Undefined;
    this._last = G2.Undefined;
    this._size = 0;
  }
  get size() {
    return this._size;
  }
  isEmpty() {
    return this._first === G2.Undefined;
  }
  clear() {
    let t = this._first;
    for (; t !== G2.Undefined; ) {
      let e = t.next;
      t.prev = G2.Undefined, t.next = G2.Undefined, t = e;
    }
    this._first = G2.Undefined, this._last = G2.Undefined, this._size = 0;
  }
  unshift(t) {
    return this._insert(t, false);
  }
  push(t) {
    return this._insert(t, true);
  }
  _insert(t, e) {
    let i8 = new G2(t);
    if (this._first === G2.Undefined) this._first = i8, this._last = i8;
    else if (e) {
      let n = this._last;
      this._last = i8, i8.prev = n, n.next = i8;
    } else {
      let n = this._first;
      this._first = i8, i8.next = n, n.prev = i8;
    }
    this._size += 1;
    let r = false;
    return () => {
      r || (r = true, this._remove(i8));
    };
  }
  shift() {
    if (this._first !== G2.Undefined) {
      let t = this._first.element;
      return this._remove(this._first), t;
    }
  }
  pop() {
    if (this._last !== G2.Undefined) {
      let t = this._last.element;
      return this._remove(this._last), t;
    }
  }
  _remove(t) {
    if (t.prev !== G2.Undefined && t.next !== G2.Undefined) {
      let e = t.prev;
      e.next = t.next, t.next.prev = e;
    } else t.prev === G2.Undefined && t.next === G2.Undefined ? (this._first = G2.Undefined, this._last = G2.Undefined) : t.next === G2.Undefined ? (this._last = this._last.prev, this._last.next = G2.Undefined) : t.prev === G2.Undefined && (this._first = this._first.next, this._first.prev = G2.Undefined);
    this._size -= 1;
  }
  *[Symbol.iterator]() {
    let t = this._first;
    for (; t !== G2.Undefined; ) yield t.element, t = t.next;
  }
};
var zl = globalThis.performance && typeof globalThis.performance.now == "function";
var mr = class s6 {
  static create(t) {
    return new s6(t);
  }
  constructor(t) {
    this._now = zl && t === false ? Date.now : globalThis.performance.now.bind(globalThis.performance), this._startTime = this._now(), this._stopTime = -1;
  }
  stop() {
    this._stopTime = this._now();
  }
  reset() {
    this._startTime = this._now(), this._stopTime = -1;
  }
  elapsed() {
    return this._stopTime !== -1 ? this._stopTime - this._startTime : this._now() - this._startTime;
  }
};
var Gl = false;
var fo = false;
var $l = false;
var $;
((Qe2) => {
  Qe2.None = () => D2.None;
  function t(y) {
    if ($l) {
      let { onDidAddListener: T } = y, g = gi.create(), w = 0;
      y.onDidAddListener = () => {
        ++w === 2 && (console.warn("snapshotted emitter LIKELY used public and SHOULD HAVE BEEN created with DisposableStore. snapshotted here"), g.print()), T?.();
      };
    }
  }
  function e(y, T) {
    return d(y, () => {
    }, 0, void 0, true, void 0, T);
  }
  Qe2.defer = e;
  function i8(y) {
    return (T, g = null, w) => {
      let E = false, x;
      return x = y((N2) => {
        if (!E) return x ? x.dispose() : E = true, T.call(g, N2);
      }, null, w), E && x.dispose(), x;
    };
  }
  Qe2.once = i8;
  function r(y, T, g) {
    return h2((w, E = null, x) => y((N2) => w.call(E, T(N2)), null, x), g);
  }
  Qe2.map = r;
  function n(y, T, g) {
    return h2((w, E = null, x) => y((N2) => {
      T(N2), w.call(E, N2);
    }, null, x), g);
  }
  Qe2.forEach = n;
  function o2(y, T, g) {
    return h2((w, E = null, x) => y((N2) => T(N2) && w.call(E, N2), null, x), g);
  }
  Qe2.filter = o2;
  function l(y) {
    return y;
  }
  Qe2.signal = l;
  function a(...y) {
    return (T, g = null, w) => {
      let E = ho(...y.map((x) => x((N2) => T.call(g, N2))));
      return c(E, w);
    };
  }
  Qe2.any = a;
  function u(y, T, g, w) {
    let E = g;
    return r(y, (x) => (E = T(E, x), E), w);
  }
  Qe2.reduce = u;
  function h2(y, T) {
    let g, w = { onWillAddFirstListener() {
      g = y(E.fire, E);
    }, onDidRemoveLastListener() {
      g?.dispose();
    } };
    T || t(w);
    let E = new v(w);
    return T?.add(E), E.event;
  }
  function c(y, T) {
    return T instanceof Array ? T.push(y) : T && T.add(y), y;
  }
  function d(y, T, g = 100, w = false, E = false, x, N2) {
    let Z2, te2, Oe2, ze2 = 0, le2, et2 = { leakWarningThreshold: x, onWillAddFirstListener() {
      Z2 = y((ht2) => {
        ze2++, te2 = T(te2, ht2), w && !Oe2 && (me2.fire(te2), te2 = void 0), le2 = () => {
          let fi2 = te2;
          te2 = void 0, Oe2 = void 0, (!w || ze2 > 1) && me2.fire(fi2), ze2 = 0;
        }, typeof g == "number" ? (clearTimeout(Oe2), Oe2 = setTimeout(le2, g)) : Oe2 === void 0 && (Oe2 = 0, queueMicrotask(le2));
      });
    }, onWillRemoveListener() {
      E && ze2 > 0 && le2?.();
    }, onDidRemoveLastListener() {
      le2 = void 0, Z2.dispose();
    } };
    N2 || t(et2);
    let me2 = new v(et2);
    return N2?.add(me2), me2.event;
  }
  Qe2.debounce = d;
  function _2(y, T = 0, g) {
    return Qe2.debounce(y, (w, E) => w ? (w.push(E), w) : [E], T, void 0, true, void 0, g);
  }
  Qe2.accumulate = _2;
  function p(y, T = (w, E) => w === E, g) {
    let w = true, E;
    return o2(y, (x) => {
      let N2 = w || !T(x, E);
      return w = false, E = x, N2;
    }, g);
  }
  Qe2.latch = p;
  function m(y, T, g) {
    return [Qe2.filter(y, T, g), Qe2.filter(y, (w) => !T(w), g)];
  }
  Qe2.split = m;
  function f(y, T = false, g = [], w) {
    let E = g.slice(), x = y((te2) => {
      E ? E.push(te2) : Z2.fire(te2);
    });
    w && w.add(x);
    let N2 = () => {
      E?.forEach((te2) => Z2.fire(te2)), E = null;
    }, Z2 = new v({ onWillAddFirstListener() {
      x || (x = y((te2) => Z2.fire(te2)), w && w.add(x));
    }, onDidAddFirstListener() {
      E && (T ? setTimeout(N2) : N2());
    }, onDidRemoveLastListener() {
      x && x.dispose(), x = null;
    } });
    return w && w.add(Z2), Z2.event;
  }
  Qe2.buffer = f;
  function A(y, T) {
    return (w, E, x) => {
      let N2 = T(new O2());
      return y(function(Z2) {
        let te2 = N2.evaluate(Z2);
        te2 !== R2 && w.call(E, te2);
      }, void 0, x);
    };
  }
  Qe2.chain = A;
  let R2 = /* @__PURE__ */ Symbol("HaltChainable");
  class O2 {
    constructor() {
      this.steps = [];
    }
    map(T) {
      return this.steps.push(T), this;
    }
    forEach(T) {
      return this.steps.push((g) => (T(g), g)), this;
    }
    filter(T) {
      return this.steps.push((g) => T(g) ? g : R2), this;
    }
    reduce(T, g) {
      let w = g;
      return this.steps.push((E) => (w = T(w, E), w)), this;
    }
    latch(T = (g, w) => g === w) {
      let g = true, w;
      return this.steps.push((E) => {
        let x = g || !T(E, w);
        return g = false, w = E, x ? E : R2;
      }), this;
    }
    evaluate(T) {
      for (let g of this.steps) if (T = g(T), T === R2) break;
      return T;
    }
  }
  function I(y, T, g = (w) => w) {
    let w = (...Z2) => N2.fire(g(...Z2)), E = () => y.on(T, w), x = () => y.removeListener(T, w), N2 = new v({ onWillAddFirstListener: E, onDidRemoveLastListener: x });
    return N2.event;
  }
  Qe2.fromNodeEventEmitter = I;
  function k2(y, T, g = (w) => w) {
    let w = (...Z2) => N2.fire(g(...Z2)), E = () => y.addEventListener(T, w), x = () => y.removeEventListener(T, w), N2 = new v({ onWillAddFirstListener: E, onDidRemoveLastListener: x });
    return N2.event;
  }
  Qe2.fromDOMEventEmitter = k2;
  function P(y) {
    return new Promise((T) => i8(y)(T));
  }
  Qe2.toPromise = P;
  function oe(y) {
    let T = new v();
    return y.then((g) => {
      T.fire(g);
    }, () => {
      T.fire(void 0);
    }).finally(() => {
      T.dispose();
    }), T.event;
  }
  Qe2.fromPromise = oe;
  function Me2(y, T) {
    return y((g) => T.fire(g));
  }
  Qe2.forward = Me2;
  function Pe2(y, T, g) {
    return T(g), y((w) => T(w));
  }
  Qe2.runAndSubscribe = Pe2;
  class Ke {
    constructor(T, g) {
      this._observable = T;
      this._counter = 0;
      this._hasChanged = false;
      let w = { onWillAddFirstListener: () => {
        T.addObserver(this);
      }, onDidRemoveLastListener: () => {
        T.removeObserver(this);
      } };
      g || t(w), this.emitter = new v(w), g && g.add(this.emitter);
    }
    beginUpdate(T) {
      this._counter++;
    }
    handlePossibleChange(T) {
    }
    handleChange(T, g) {
      this._hasChanged = true;
    }
    endUpdate(T) {
      this._counter--, this._counter === 0 && (this._observable.reportChanges(), this._hasChanged && (this._hasChanged = false, this.emitter.fire(this._observable.get())));
    }
  }
  function di(y, T) {
    return new Ke(y, T).emitter.event;
  }
  Qe2.fromObservable = di;
  function V2(y) {
    return (T, g, w) => {
      let E = 0, x = false, N2 = { beginUpdate() {
        E++;
      }, endUpdate() {
        E--, E === 0 && (y.reportChanges(), x && (x = false, T.call(g)));
      }, handlePossibleChange() {
      }, handleChange() {
        x = true;
      } };
      y.addObserver(N2), y.reportChanges();
      let Z2 = { dispose() {
        y.removeObserver(N2);
      } };
      return w instanceof Ee ? w.add(Z2) : Array.isArray(w) && w.push(Z2), Z2;
    };
  }
  Qe2.fromObservableLight = V2;
})($ || ($ = {}));
var Mt = class Mt2 {
  constructor(t) {
    this.listenerCount = 0;
    this.invocationCount = 0;
    this.elapsedOverall = 0;
    this.durations = [];
    this.name = `${t}_${Mt2._idPool++}`, Mt2.all.add(this);
  }
  start(t) {
    this._stopWatch = new mr(), this.listenerCount = t;
  }
  stop() {
    if (this._stopWatch) {
      let t = this._stopWatch.elapsed();
      this.durations.push(t), this.elapsedOverall += t, this.invocationCount += 1, this._stopWatch = void 0;
    }
  }
};
Mt.all = /* @__PURE__ */ new Set(), Mt._idPool = 0;
var $n = Mt;
var po = -1;
var br = class br2 {
  constructor(t, e, i8 = (br2._idPool++).toString(16).padStart(3, "0")) {
    this._errorHandler = t;
    this.threshold = e;
    this.name = i8;
    this._warnCountdown = 0;
  }
  dispose() {
    this._stacks?.clear();
  }
  check(t, e) {
    let i8 = this.threshold;
    if (i8 <= 0 || e < i8) return;
    this._stacks || (this._stacks = /* @__PURE__ */ new Map());
    let r = this._stacks.get(t.value) || 0;
    if (this._stacks.set(t.value, r + 1), this._warnCountdown -= 1, this._warnCountdown <= 0) {
      this._warnCountdown = i8 * 0.5;
      let [n, o2] = this.getMostFrequentStack(), l = `[${this.name}] potential listener LEAK detected, having ${e} listeners already. MOST frequent listener (${o2}):`;
      console.warn(l), console.warn(n);
      let a = new qn(l, n);
      this._errorHandler(a);
    }
    return () => {
      let n = this._stacks.get(t.value) || 0;
      this._stacks.set(t.value, n - 1);
    };
  }
  getMostFrequentStack() {
    if (!this._stacks) return;
    let t, e = 0;
    for (let [i8, r] of this._stacks) (!t || e < r) && (t = [i8, r], e = r);
    return t;
  }
};
br._idPool = 1;
var Vn = br;
var gi = class s7 {
  constructor(t) {
    this.value = t;
  }
  static create() {
    let t = new Error();
    return new s7(t.stack ?? "");
  }
  print() {
    console.warn(this.value.split(`
`).slice(2).join(`
`));
  }
};
var qn = class extends Error {
  constructor(t, e) {
    super(t), this.name = "ListenerLeakError", this.stack = e;
  }
};
var Yn = class extends Error {
  constructor(t, e) {
    super(t), this.name = "ListenerRefusalError", this.stack = e;
  }
};
var Vl = 0;
var Pt = class {
  constructor(t) {
    this.value = t;
    this.id = Vl++;
  }
};
var ql = 2;
var Yl = (s15, t) => {
  if (s15 instanceof Pt) t(s15);
  else for (let e = 0; e < s15.length; e++) {
    let i8 = s15[e];
    i8 && t(i8);
  }
};
var _r;
if (Gl) {
  let s15 = [];
  setInterval(() => {
    s15.length !== 0 && (console.warn("[LEAKING LISTENERS] GC'ed these listeners that were NOT yet disposed:"), console.warn(s15.join(`
`)), s15.length = 0);
  }, 3e3), _r = new FinalizationRegistry((t) => {
    typeof t == "string" && s15.push(t);
  });
}
var v = class {
  constructor(t) {
    this._size = 0;
    this._options = t, this._leakageMon = po > 0 || this._options?.leakWarningThreshold ? new Vn(t?.onListenerError ?? Lt, this._options?.leakWarningThreshold ?? po) : void 0, this._perfMon = this._options?._profName ? new $n(this._options._profName) : void 0, this._deliveryQueue = this._options?.deliveryQueue;
  }
  dispose() {
    if (!this._disposed) {
      if (this._disposed = true, this._deliveryQueue?.current === this && this._deliveryQueue.reset(), this._listeners) {
        if (fo) {
          let t = this._listeners;
          queueMicrotask(() => {
            Yl(t, (e) => e.stack?.print());
          });
        }
        this._listeners = void 0, this._size = 0;
      }
      this._options?.onDidRemoveLastListener?.(), this._leakageMon?.dispose();
    }
  }
  get event() {
    return this._event ?? (this._event = (t, e, i8) => {
      if (this._leakageMon && this._size > this._leakageMon.threshold ** 2) {
        let a = `[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far (${this._size} vs ${this._leakageMon.threshold})`;
        console.warn(a);
        let u = this._leakageMon.getMostFrequentStack() ?? ["UNKNOWN stack", -1], h2 = new Yn(`${a}. HINT: Stack shows most frequent listener (${u[1]}-times)`, u[0]);
        return (this._options?.onListenerError || Lt)(h2), D2.None;
      }
      if (this._disposed) return D2.None;
      e && (t = t.bind(e));
      let r = new Pt(t), n, o2;
      this._leakageMon && this._size >= Math.ceil(this._leakageMon.threshold * 0.2) && (r.stack = gi.create(), n = this._leakageMon.check(r.stack, this._size + 1)), fo && (r.stack = o2 ?? gi.create()), this._listeners ? this._listeners instanceof Pt ? (this._deliveryQueue ?? (this._deliveryQueue = new jn()), this._listeners = [this._listeners, r]) : this._listeners.push(r) : (this._options?.onWillAddFirstListener?.(this), this._listeners = r, this._options?.onDidAddFirstListener?.(this)), this._size++;
      let l = C(() => {
        _r?.unregister(l), n?.(), this._removeListener(r);
      });
      if (i8 instanceof Ee ? i8.add(l) : Array.isArray(i8) && i8.push(l), _r) {
        let a = new Error().stack.split(`
`).slice(2, 3).join(`
`).trim(), u = /(file:|vscode-file:\/\/vscode-app)?(\/[^:]*:\d+:\d+)/.exec(a);
        _r.register(l, u?.[2] ?? a, l);
      }
      return l;
    }), this._event;
  }
  _removeListener(t) {
    if (this._options?.onWillRemoveListener?.(this), !this._listeners) return;
    if (this._size === 1) {
      this._listeners = void 0, this._options?.onDidRemoveLastListener?.(this), this._size = 0;
      return;
    }
    let e = this._listeners, i8 = e.indexOf(t);
    if (i8 === -1) throw console.log("disposed?", this._disposed), console.log("size?", this._size), console.log("arr?", JSON.stringify(this._listeners)), new Error("Attempted to dispose unknown listener");
    this._size--, e[i8] = void 0;
    let r = this._deliveryQueue.current === this;
    if (this._size * ql <= e.length) {
      let n = 0;
      for (let o2 = 0; o2 < e.length; o2++) e[o2] ? e[n++] = e[o2] : r && (this._deliveryQueue.end--, n < this._deliveryQueue.i && this._deliveryQueue.i--);
      e.length = n;
    }
  }
  _deliver(t, e) {
    if (!t) return;
    let i8 = this._options?.onListenerError || Lt;
    if (!i8) {
      t.value(e);
      return;
    }
    try {
      t.value(e);
    } catch (r) {
      i8(r);
    }
  }
  _deliverQueue(t) {
    let e = t.current._listeners;
    for (; t.i < t.end; ) this._deliver(e[t.i++], t.value);
    t.reset();
  }
  fire(t) {
    if (this._deliveryQueue?.current && (this._deliverQueue(this._deliveryQueue), this._perfMon?.stop()), this._perfMon?.start(this._size), this._listeners) if (this._listeners instanceof Pt) this._deliver(this._listeners, t);
    else {
      let e = this._deliveryQueue;
      e.enqueue(this, t, this._listeners.length), this._deliverQueue(e);
    }
    this._perfMon?.stop();
  }
  hasListeners() {
    return this._size > 0;
  }
};
var jn = class {
  constructor() {
    this.i = -1;
    this.end = 0;
  }
  enqueue(t, e, i8) {
    this.i = 0, this.end = i8, this.current = t, this.value = e;
  }
  reset() {
    this.i = this.end, this.current = void 0, this.value = void 0;
  }
};
var gr = class gr2 {
  constructor() {
    this.mapWindowIdToZoomLevel = /* @__PURE__ */ new Map();
    this._onDidChangeZoomLevel = new v();
    this.onDidChangeZoomLevel = this._onDidChangeZoomLevel.event;
    this.mapWindowIdToZoomFactor = /* @__PURE__ */ new Map();
    this._onDidChangeFullscreen = new v();
    this.onDidChangeFullscreen = this._onDidChangeFullscreen.event;
    this.mapWindowIdToFullScreen = /* @__PURE__ */ new Map();
  }
  getZoomLevel(t) {
    return this.mapWindowIdToZoomLevel.get(this.getWindowId(t)) ?? 0;
  }
  setZoomLevel(t, e) {
    if (this.getZoomLevel(e) === t) return;
    let i8 = this.getWindowId(e);
    this.mapWindowIdToZoomLevel.set(i8, t), this._onDidChangeZoomLevel.fire(i8);
  }
  getZoomFactor(t) {
    return this.mapWindowIdToZoomFactor.get(this.getWindowId(t)) ?? 1;
  }
  setZoomFactor(t, e) {
    this.mapWindowIdToZoomFactor.set(this.getWindowId(e), t);
  }
  setFullscreen(t, e) {
    if (this.isFullscreen(e) === t) return;
    let i8 = this.getWindowId(e);
    this.mapWindowIdToFullScreen.set(i8, t), this._onDidChangeFullscreen.fire(i8);
  }
  isFullscreen(t) {
    return !!this.mapWindowIdToFullScreen.get(this.getWindowId(t));
  }
  getWindowId(t) {
    return t.vscodeWindowId;
  }
};
gr.INSTANCE = new gr();
var Si = gr;
function Xl(s15, t, e) {
  typeof t == "string" && (t = s15.matchMedia(t)), t.addEventListener("change", e);
}
var Eu = Si.INSTANCE.onDidChangeZoomLevel;
function mo(s15) {
  return Si.INSTANCE.getZoomFactor(s15);
}
var Tu = Si.INSTANCE.onDidChangeFullscreen;
var Ot = typeof navigator == "object" ? navigator.userAgent : "";
var Ei = Ot.indexOf("Firefox") >= 0;
var Bt = Ot.indexOf("AppleWebKit") >= 0;
var Ti = Ot.indexOf("Chrome") >= 0;
var Sr = !Ti && Ot.indexOf("Safari") >= 0;
var Iu = Ot.indexOf("Electron/") >= 0;
var yu = Ot.indexOf("Android") >= 0;
var vr = false;
if (typeof fe.matchMedia == "function") {
  let s15 = fe.matchMedia("(display-mode: standalone) or (display-mode: window-controls-overlay)"), t = fe.matchMedia("(display-mode: fullscreen)");
  vr = s15.matches, Xl(fe, s15, ({ matches: e }) => {
    vr && t.matches || (vr = e);
  });
}
function _o() {
  return vr;
}
var Nt = "en";
var yr = false;
var xr = false;
var Ii = false;
var Zl = false;
var vo = false;
var go = false;
var Jl = false;
var Ql = false;
var ea = false;
var ta = false;
var Tr;
var Ir = Nt;
var bo = Nt;
var ia;
var $e;
var Ve = globalThis;
var xe;
typeof Ve.vscode < "u" && typeof Ve.vscode.process < "u" ? xe = Ve.vscode.process : typeof process < "u" && typeof process?.versions?.node == "string" && (xe = process);
var So = typeof xe?.versions?.electron == "string";
var ra = So && xe?.type === "renderer";
if (typeof xe == "object") {
  yr = xe.platform === "win32", xr = xe.platform === "darwin", Ii = xe.platform === "linux", Zl = Ii && !!xe.env.SNAP && !!xe.env.SNAP_REVISION, Jl = So, ea = !!xe.env.CI || !!xe.env.BUILD_ARTIFACTSTAGINGDIRECTORY, Tr = Nt, Ir = Nt;
  let s15 = xe.env.VSCODE_NLS_CONFIG;
  if (s15) try {
    let t = JSON.parse(s15);
    Tr = t.userLocale, bo = t.osLocale, Ir = t.resolvedLanguage || Nt, ia = t.languagePack?.translationsConfigFile;
  } catch {
  }
  vo = true;
} else typeof navigator == "object" && !ra ? ($e = navigator.userAgent, yr = $e.indexOf("Windows") >= 0, xr = $e.indexOf("Macintosh") >= 0, Ql = ($e.indexOf("Macintosh") >= 0 || $e.indexOf("iPad") >= 0 || $e.indexOf("iPhone") >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0, Ii = $e.indexOf("Linux") >= 0, ta = $e?.indexOf("Mobi") >= 0, go = true, Ir = globalThis._VSCODE_NLS_LANGUAGE || Nt, Tr = navigator.language.toLowerCase(), bo = Tr) : console.error("Unable to resolve platform.");
var Xn = 0;
xr ? Xn = 1 : yr ? Xn = 3 : Ii && (Xn = 2);
var wr = yr;
var Te = xr;
var Zn = Ii;
var Dr = vo;
var na = go && typeof Ve.importScripts == "function";
var xu = na ? Ve.origin : void 0;
var Fe = $e;
var st = Ir;
var sa;
((i8) => {
  function s15() {
    return st;
  }
  i8.value = s15;
  function t() {
    return st.length === 2 ? st === "en" : st.length >= 3 ? st[0] === "e" && st[1] === "n" && st[2] === "-" : false;
  }
  i8.isDefaultVariant = t;
  function e() {
    return st === "en";
  }
  i8.isDefault = e;
})(sa || (sa = {}));
var oa = typeof Ve.postMessage == "function" && !Ve.importScripts;
var Eo = (() => {
  if (oa) {
    let s15 = [];
    Ve.addEventListener("message", (e) => {
      if (e.data && e.data.vscodeScheduleAsyncWork) for (let i8 = 0, r = s15.length; i8 < r; i8++) {
        let n = s15[i8];
        if (n.id === e.data.vscodeScheduleAsyncWork) {
          s15.splice(i8, 1), n.callback();
          return;
        }
      }
    });
    let t = 0;
    return (e) => {
      let i8 = ++t;
      s15.push({ id: i8, callback: e }), Ve.postMessage({ vscodeScheduleAsyncWork: i8 }, "*");
    };
  }
  return (s15) => setTimeout(s15);
})();
var la = !!(Fe && Fe.indexOf("Chrome") >= 0);
var wu = !!(Fe && Fe.indexOf("Firefox") >= 0);
var Du = !!(!la && Fe && Fe.indexOf("Safari") >= 0);
var Ru = !!(Fe && Fe.indexOf("Edg/") >= 0);
var Lu = !!(Fe && Fe.indexOf("Android") >= 0);
var ot = typeof navigator == "object" ? navigator : {};
var aa = { clipboard: { writeText: Dr || document.queryCommandSupported && document.queryCommandSupported("copy") || !!(ot && ot.clipboard && ot.clipboard.writeText), readText: Dr || !!(ot && ot.clipboard && ot.clipboard.readText) }, keyboard: Dr || _o() ? 0 : ot.keyboard || Sr ? 1 : 2, touch: "ontouchstart" in fe || ot.maxTouchPoints > 0, pointerEvents: fe.PointerEvent && ("ontouchstart" in fe || navigator.maxTouchPoints > 0) };
var yi = class {
  constructor() {
    this._keyCodeToStr = [], this._strToKeyCode = /* @__PURE__ */ Object.create(null);
  }
  define(t, e) {
    this._keyCodeToStr[t] = e, this._strToKeyCode[e.toLowerCase()] = t;
  }
  keyCodeToStr(t) {
    return this._keyCodeToStr[t];
  }
  strToKeyCode(t) {
    return this._strToKeyCode[t.toLowerCase()] || 0;
  }
};
var Jn = new yi();
var To = new yi();
var Io = new yi();
var yo = new Array(230);
var Qn;
((o2) => {
  function s15(l) {
    return Jn.keyCodeToStr(l);
  }
  o2.toString = s15;
  function t(l) {
    return Jn.strToKeyCode(l);
  }
  o2.fromString = t;
  function e(l) {
    return To.keyCodeToStr(l);
  }
  o2.toUserSettingsUS = e;
  function i8(l) {
    return Io.keyCodeToStr(l);
  }
  o2.toUserSettingsGeneral = i8;
  function r(l) {
    return To.strToKeyCode(l) || Io.strToKeyCode(l);
  }
  o2.fromUserSettings = r;
  function n(l) {
    if (l >= 98 && l <= 113) return null;
    switch (l) {
      case 16:
        return "Up";
      case 18:
        return "Down";
      case 15:
        return "Left";
      case 17:
        return "Right";
    }
    return Jn.keyCodeToStr(l);
  }
  o2.toElectronAccelerator = n;
})(Qn || (Qn = {}));
var Rr = class s8 {
  constructor(t, e, i8, r, n) {
    this.ctrlKey = t;
    this.shiftKey = e;
    this.altKey = i8;
    this.metaKey = r;
    this.keyCode = n;
  }
  equals(t) {
    return t instanceof s8 && this.ctrlKey === t.ctrlKey && this.shiftKey === t.shiftKey && this.altKey === t.altKey && this.metaKey === t.metaKey && this.keyCode === t.keyCode;
  }
  getHashCode() {
    let t = this.ctrlKey ? "1" : "0", e = this.shiftKey ? "1" : "0", i8 = this.altKey ? "1" : "0", r = this.metaKey ? "1" : "0";
    return `K${t}${e}${i8}${r}${this.keyCode}`;
  }
  isModifierKey() {
    return this.keyCode === 0 || this.keyCode === 5 || this.keyCode === 57 || this.keyCode === 6 || this.keyCode === 4;
  }
  toKeybinding() {
    return new es([this]);
  }
  isDuplicateModifierCase() {
    return this.ctrlKey && this.keyCode === 5 || this.shiftKey && this.keyCode === 4 || this.altKey && this.keyCode === 6 || this.metaKey && this.keyCode === 57;
  }
};
var es = class {
  constructor(t) {
    if (t.length === 0) throw eo("chords");
    this.chords = t;
  }
  getHashCode() {
    let t = "";
    for (let e = 0, i8 = this.chords.length; e < i8; e++) e !== 0 && (t += ";"), t += this.chords[e].getHashCode();
    return t;
  }
  equals(t) {
    if (t === null || this.chords.length !== t.chords.length) return false;
    for (let e = 0; e < this.chords.length; e++) if (!this.chords[e].equals(t.chords[e])) return false;
    return true;
  }
};
function ca(s15) {
  if (s15.charCode) {
    let e = String.fromCharCode(s15.charCode).toUpperCase();
    return Qn.fromString(e);
  }
  let t = s15.keyCode;
  if (t === 3) return 7;
  if (Ei) switch (t) {
    case 59:
      return 85;
    case 60:
      if (Zn) return 97;
      break;
    case 61:
      return 86;
    case 107:
      return 109;
    case 109:
      return 111;
    case 173:
      return 88;
    case 224:
      if (Te) return 57;
      break;
  }
  else if (Bt) {
    if (Te && t === 93) return 57;
    if (!Te && t === 92) return 57;
  }
  return yo[t] || 0;
}
var ua = Te ? 256 : 2048;
var ha = 512;
var da = 1024;
var fa = Te ? 2048 : 256;
var ft = class {
  constructor(t) {
    this._standardKeyboardEventBrand = true;
    let e = t;
    this.browserEvent = e, this.target = e.target, this.ctrlKey = e.ctrlKey, this.shiftKey = e.shiftKey, this.altKey = e.altKey, this.metaKey = e.metaKey, this.altGraphKey = e.getModifierState?.("AltGraph"), this.keyCode = ca(e), this.code = e.code, this.ctrlKey = this.ctrlKey || this.keyCode === 5, this.altKey = this.altKey || this.keyCode === 6, this.shiftKey = this.shiftKey || this.keyCode === 4, this.metaKey = this.metaKey || this.keyCode === 57, this._asKeybinding = this._computeKeybinding(), this._asKeyCodeChord = this._computeKeyCodeChord();
  }
  preventDefault() {
    this.browserEvent && this.browserEvent.preventDefault && this.browserEvent.preventDefault();
  }
  stopPropagation() {
    this.browserEvent && this.browserEvent.stopPropagation && this.browserEvent.stopPropagation();
  }
  toKeyCodeChord() {
    return this._asKeyCodeChord;
  }
  equals(t) {
    return this._asKeybinding === t;
  }
  _computeKeybinding() {
    let t = 0;
    this.keyCode !== 5 && this.keyCode !== 4 && this.keyCode !== 6 && this.keyCode !== 57 && (t = this.keyCode);
    let e = 0;
    return this.ctrlKey && (e |= ua), this.altKey && (e |= ha), this.shiftKey && (e |= da), this.metaKey && (e |= fa), e |= t, e;
  }
  _computeKeyCodeChord() {
    let t = 0;
    return this.keyCode !== 5 && this.keyCode !== 4 && this.keyCode !== 6 && this.keyCode !== 57 && (t = this.keyCode), new Rr(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, t);
  }
};
var wo = /* @__PURE__ */ new WeakMap();
function pa(s15) {
  if (!s15.parent || s15.parent === s15) return null;
  try {
    let t = s15.location, e = s15.parent.location;
    if (t.origin !== "null" && e.origin !== "null" && t.origin !== e.origin) return null;
  } catch {
    return null;
  }
  return s15.parent;
}
var Lr = class {
  static getSameOriginWindowChain(t) {
    let e = wo.get(t);
    if (!e) {
      e = [], wo.set(t, e);
      let i8 = t, r;
      do
        r = pa(i8), r ? e.push({ window: new WeakRef(i8), iframeElement: i8.frameElement || null }) : e.push({ window: new WeakRef(i8), iframeElement: null }), i8 = r;
      while (i8);
    }
    return e.slice(0);
  }
  static getPositionOfChildWindowRelativeToAncestorWindow(t, e) {
    if (!e || t === e) return { top: 0, left: 0 };
    let i8 = 0, r = 0, n = this.getSameOriginWindowChain(t);
    for (let o2 of n) {
      let l = o2.window.deref();
      if (i8 += l?.scrollY ?? 0, r += l?.scrollX ?? 0, l === e || !o2.iframeElement) break;
      let a = o2.iframeElement.getBoundingClientRect();
      i8 += a.top, r += a.left;
    }
    return { top: i8, left: r };
  }
};
var qe = class {
  constructor(t, e) {
    this.timestamp = Date.now(), this.browserEvent = e, this.leftButton = e.button === 0, this.middleButton = e.button === 1, this.rightButton = e.button === 2, this.buttons = e.buttons, this.target = e.target, this.detail = e.detail || 1, e.type === "dblclick" && (this.detail = 2), this.ctrlKey = e.ctrlKey, this.shiftKey = e.shiftKey, this.altKey = e.altKey, this.metaKey = e.metaKey, typeof e.pageX == "number" ? (this.posx = e.pageX, this.posy = e.pageY) : (this.posx = e.clientX + this.target.ownerDocument.body.scrollLeft + this.target.ownerDocument.documentElement.scrollLeft, this.posy = e.clientY + this.target.ownerDocument.body.scrollTop + this.target.ownerDocument.documentElement.scrollTop);
    let i8 = Lr.getPositionOfChildWindowRelativeToAncestorWindow(t, e.view);
    this.posx -= i8.left, this.posy -= i8.top;
  }
  preventDefault() {
    this.browserEvent.preventDefault();
  }
  stopPropagation() {
    this.browserEvent.stopPropagation();
  }
};
var xi = class {
  constructor(t, e = 0, i8 = 0) {
    this.browserEvent = t || null, this.target = t ? t.target || t.targetNode || t.srcElement : null, this.deltaY = i8, this.deltaX = e;
    let r = false;
    if (Ti) {
      let n = navigator.userAgent.match(/Chrome\/(\d+)/);
      r = (n ? parseInt(n[1]) : 123) <= 122;
    }
    if (t) {
      let n = t, o2 = t, l = t.view?.devicePixelRatio || 1;
      if (typeof n.wheelDeltaY < "u") r ? this.deltaY = n.wheelDeltaY / (120 * l) : this.deltaY = n.wheelDeltaY / 120;
      else if (typeof o2.VERTICAL_AXIS < "u" && o2.axis === o2.VERTICAL_AXIS) this.deltaY = -o2.detail / 3;
      else if (t.type === "wheel") {
        let a = t;
        a.deltaMode === a.DOM_DELTA_LINE ? Ei && !Te ? this.deltaY = -t.deltaY / 3 : this.deltaY = -t.deltaY : this.deltaY = -t.deltaY / 40;
      }
      if (typeof n.wheelDeltaX < "u") Sr && wr ? this.deltaX = -(n.wheelDeltaX / 120) : r ? this.deltaX = n.wheelDeltaX / (120 * l) : this.deltaX = n.wheelDeltaX / 120;
      else if (typeof o2.HORIZONTAL_AXIS < "u" && o2.axis === o2.HORIZONTAL_AXIS) this.deltaX = -t.detail / 3;
      else if (t.type === "wheel") {
        let a = t;
        a.deltaMode === a.DOM_DELTA_LINE ? Ei && !Te ? this.deltaX = -t.deltaX / 3 : this.deltaX = -t.deltaX : this.deltaX = -t.deltaX / 40;
      }
      this.deltaY === 0 && this.deltaX === 0 && t.wheelDelta && (r ? this.deltaY = t.wheelDelta / (120 * l) : this.deltaY = t.wheelDelta / 120);
    }
  }
  preventDefault() {
    this.browserEvent?.preventDefault();
  }
  stopPropagation() {
    this.browserEvent?.stopPropagation();
  }
};
var Do = Object.freeze(function(s15, t) {
  let e = setTimeout(s15.bind(t), 0);
  return { dispose() {
    clearTimeout(e);
  } };
});
var ma;
((i8) => {
  function s15(r) {
    return r === i8.None || r === i8.Cancelled || r instanceof ts ? true : !r || typeof r != "object" ? false : typeof r.isCancellationRequested == "boolean" && typeof r.onCancellationRequested == "function";
  }
  i8.isCancellationToken = s15, i8.None = Object.freeze({ isCancellationRequested: false, onCancellationRequested: $.None }), i8.Cancelled = Object.freeze({ isCancellationRequested: true, onCancellationRequested: Do });
})(ma || (ma = {}));
var ts = class {
  constructor() {
    this._isCancelled = false;
    this._emitter = null;
  }
  cancel() {
    this._isCancelled || (this._isCancelled = true, this._emitter && (this._emitter.fire(void 0), this.dispose()));
  }
  get isCancellationRequested() {
    return this._isCancelled;
  }
  get onCancellationRequested() {
    return this._isCancelled ? Do : (this._emitter || (this._emitter = new v()), this._emitter.event);
  }
  dispose() {
    this._emitter && (this._emitter.dispose(), this._emitter = null);
  }
};
var Ye = class {
  constructor(t, e) {
    this._isDisposed = false;
    this._token = -1, typeof t == "function" && typeof e == "number" && this.setIfNotSet(t, e);
  }
  dispose() {
    this.cancel(), this._isDisposed = true;
  }
  cancel() {
    this._token !== -1 && (clearTimeout(this._token), this._token = -1);
  }
  cancelAndSet(t, e) {
    if (this._isDisposed) throw new Rt("Calling 'cancelAndSet' on a disposed TimeoutTimer");
    this.cancel(), this._token = setTimeout(() => {
      this._token = -1, t();
    }, e);
  }
  setIfNotSet(t, e) {
    if (this._isDisposed) throw new Rt("Calling 'setIfNotSet' on a disposed TimeoutTimer");
    this._token === -1 && (this._token = setTimeout(() => {
      this._token = -1, t();
    }, e));
  }
};
var kr = class {
  constructor() {
    this.disposable = void 0;
    this.isDisposed = false;
  }
  cancel() {
    this.disposable?.dispose(), this.disposable = void 0;
  }
  cancelAndSet(t, e, i8 = globalThis) {
    if (this.isDisposed) throw new Rt("Calling 'cancelAndSet' on a disposed IntervalTimer");
    this.cancel();
    let r = i8.setInterval(() => {
      t();
    }, e);
    this.disposable = C(() => {
      i8.clearInterval(r), this.disposable = void 0;
    });
  }
  dispose() {
    this.cancel(), this.isDisposed = true;
  }
};
var ba;
var Ar;
(function() {
  typeof globalThis.requestIdleCallback != "function" || typeof globalThis.cancelIdleCallback != "function" ? Ar = (s15, t) => {
    Eo(() => {
      if (e) return;
      let i8 = Date.now() + 15;
      t(Object.freeze({ didTimeout: true, timeRemaining() {
        return Math.max(0, i8 - Date.now());
      } }));
    });
    let e = false;
    return { dispose() {
      e || (e = true);
    } };
  } : Ar = (s15, t, e) => {
    let i8 = s15.requestIdleCallback(t, typeof e == "number" ? { timeout: e } : void 0), r = false;
    return { dispose() {
      r || (r = true, s15.cancelIdleCallback(i8));
    } };
  }, ba = (s15) => Ar(globalThis, s15);
})();
var va;
((e) => {
  async function s15(i8) {
    let r, n = await Promise.all(i8.map((o2) => o2.then((l) => l, (l) => {
      r || (r = l);
    })));
    if (typeof r < "u") throw r;
    return n;
  }
  e.settled = s15;
  function t(i8) {
    return new Promise(async (r, n) => {
      try {
        await i8(r, n);
      } catch (o2) {
        n(o2);
      }
    });
  }
  e.withAsyncBody = t;
})(va || (va = {}));
var _e = class _e2 {
  static fromArray(t) {
    return new _e2((e) => {
      e.emitMany(t);
    });
  }
  static fromPromise(t) {
    return new _e2(async (e) => {
      e.emitMany(await t);
    });
  }
  static fromPromises(t) {
    return new _e2(async (e) => {
      await Promise.all(t.map(async (i8) => e.emitOne(await i8)));
    });
  }
  static merge(t) {
    return new _e2(async (e) => {
      await Promise.all(t.map(async (i8) => {
        for await (let r of i8) e.emitOne(r);
      }));
    });
  }
  constructor(t, e) {
    this._state = 0, this._results = [], this._error = null, this._onReturn = e, this._onStateChanged = new v(), queueMicrotask(async () => {
      let i8 = { emitOne: (r) => this.emitOne(r), emitMany: (r) => this.emitMany(r), reject: (r) => this.reject(r) };
      try {
        await Promise.resolve(t(i8)), this.resolve();
      } catch (r) {
        this.reject(r);
      } finally {
        i8.emitOne = void 0, i8.emitMany = void 0, i8.reject = void 0;
      }
    });
  }
  [Symbol.asyncIterator]() {
    let t = 0;
    return { next: async () => {
      do {
        if (this._state === 2) throw this._error;
        if (t < this._results.length) return { done: false, value: this._results[t++] };
        if (this._state === 1) return { done: true, value: void 0 };
        await $.toPromise(this._onStateChanged.event);
      } while (true);
    }, return: async () => (this._onReturn?.(), { done: true, value: void 0 }) };
  }
  static map(t, e) {
    return new _e2(async (i8) => {
      for await (let r of t) i8.emitOne(e(r));
    });
  }
  map(t) {
    return _e2.map(this, t);
  }
  static filter(t, e) {
    return new _e2(async (i8) => {
      for await (let r of t) e(r) && i8.emitOne(r);
    });
  }
  filter(t) {
    return _e2.filter(this, t);
  }
  static coalesce(t) {
    return _e2.filter(t, (e) => !!e);
  }
  coalesce() {
    return _e2.coalesce(this);
  }
  static async toPromise(t) {
    let e = [];
    for await (let i8 of t) e.push(i8);
    return e;
  }
  toPromise() {
    return _e2.toPromise(this);
  }
  emitOne(t) {
    this._state === 0 && (this._results.push(t), this._onStateChanged.fire());
  }
  emitMany(t) {
    this._state === 0 && (this._results = this._results.concat(t), this._onStateChanged.fire());
  }
  resolve() {
    this._state === 0 && (this._state = 1, this._onStateChanged.fire());
  }
  reject(t) {
    this._state === 0 && (this._state = 2, this._error = t, this._onStateChanged.fire());
  }
};
_e.EMPTY = _e.fromArray([]);
function Lo(s15) {
  return 55296 <= s15 && s15 <= 56319;
}
function is(s15) {
  return 56320 <= s15 && s15 <= 57343;
}
function Ao(s15, t) {
  return (s15 - 55296 << 10) + (t - 56320) + 65536;
}
function Mo(s15) {
  return ns(s15, 0);
}
function ns(s15, t) {
  switch (typeof s15) {
    case "object":
      return s15 === null ? je(349, t) : Array.isArray(s15) ? Ea(s15, t) : Ta(s15, t);
    case "string":
      return Po(s15, t);
    case "boolean":
      return Sa(s15, t);
    case "number":
      return je(s15, t);
    case "undefined":
      return je(937, t);
    default:
      return je(617, t);
  }
}
function je(s15, t) {
  return (t << 5) - t + s15 | 0;
}
function Sa(s15, t) {
  return je(s15 ? 433 : 863, t);
}
function Po(s15, t) {
  t = je(149417, t);
  for (let e = 0, i8 = s15.length; e < i8; e++) t = je(s15.charCodeAt(e), t);
  return t;
}
function Ea(s15, t) {
  return t = je(104579, t), s15.reduce((e, i8) => ns(i8, e), t);
}
function Ta(s15, t) {
  return t = je(181387, t), Object.keys(s15).sort().reduce((e, i8) => (e = Po(i8, e), ns(s15[i8], e)), t);
}
function rs(s15, t, e = 32) {
  let i8 = e - t, r = ~((1 << i8) - 1);
  return (s15 << t | (r & s15) >>> i8) >>> 0;
}
function ko(s15, t = 0, e = s15.byteLength, i8 = 0) {
  for (let r = 0; r < e; r++) s15[t + r] = i8;
}
function Ia(s15, t, e = "0") {
  for (; s15.length < t; ) s15 = e + s15;
  return s15;
}
function wi(s15, t = 32) {
  return s15 instanceof ArrayBuffer ? Array.from(new Uint8Array(s15)).map((e) => e.toString(16).padStart(2, "0")).join("") : Ia((s15 >>> 0).toString(16), t / 4);
}
var Cr = class Cr2 {
  constructor() {
    this._h0 = 1732584193;
    this._h1 = 4023233417;
    this._h2 = 2562383102;
    this._h3 = 271733878;
    this._h4 = 3285377520;
    this._buff = new Uint8Array(67), this._buffDV = new DataView(this._buff.buffer), this._buffLen = 0, this._totalLen = 0, this._leftoverHighSurrogate = 0, this._finished = false;
  }
  update(t) {
    let e = t.length;
    if (e === 0) return;
    let i8 = this._buff, r = this._buffLen, n = this._leftoverHighSurrogate, o2, l;
    for (n !== 0 ? (o2 = n, l = -1, n = 0) : (o2 = t.charCodeAt(0), l = 0); ; ) {
      let a = o2;
      if (Lo(o2)) if (l + 1 < e) {
        let u = t.charCodeAt(l + 1);
        is(u) ? (l++, a = Ao(o2, u)) : a = 65533;
      } else {
        n = o2;
        break;
      }
      else is(o2) && (a = 65533);
      if (r = this._push(i8, r, a), l++, l < e) o2 = t.charCodeAt(l);
      else break;
    }
    this._buffLen = r, this._leftoverHighSurrogate = n;
  }
  _push(t, e, i8) {
    return i8 < 128 ? t[e++] = i8 : i8 < 2048 ? (t[e++] = 192 | (i8 & 1984) >>> 6, t[e++] = 128 | (i8 & 63) >>> 0) : i8 < 65536 ? (t[e++] = 224 | (i8 & 61440) >>> 12, t[e++] = 128 | (i8 & 4032) >>> 6, t[e++] = 128 | (i8 & 63) >>> 0) : (t[e++] = 240 | (i8 & 1835008) >>> 18, t[e++] = 128 | (i8 & 258048) >>> 12, t[e++] = 128 | (i8 & 4032) >>> 6, t[e++] = 128 | (i8 & 63) >>> 0), e >= 64 && (this._step(), e -= 64, this._totalLen += 64, t[0] = t[64], t[1] = t[65], t[2] = t[66]), e;
  }
  digest() {
    return this._finished || (this._finished = true, this._leftoverHighSurrogate && (this._leftoverHighSurrogate = 0, this._buffLen = this._push(this._buff, this._buffLen, 65533)), this._totalLen += this._buffLen, this._wrapUp()), wi(this._h0) + wi(this._h1) + wi(this._h2) + wi(this._h3) + wi(this._h4);
  }
  _wrapUp() {
    this._buff[this._buffLen++] = 128, ko(this._buff, this._buffLen), this._buffLen > 56 && (this._step(), ko(this._buff));
    let t = 8 * this._totalLen;
    this._buffDV.setUint32(56, Math.floor(t / 4294967296), false), this._buffDV.setUint32(60, t % 4294967296, false), this._step();
  }
  _step() {
    let t = Cr2._bigBlock32, e = this._buffDV;
    for (let c = 0; c < 64; c += 4) t.setUint32(c, e.getUint32(c, false), false);
    for (let c = 64; c < 320; c += 4) t.setUint32(c, rs(t.getUint32(c - 12, false) ^ t.getUint32(c - 32, false) ^ t.getUint32(c - 56, false) ^ t.getUint32(c - 64, false), 1), false);
    let i8 = this._h0, r = this._h1, n = this._h2, o2 = this._h3, l = this._h4, a, u, h2;
    for (let c = 0; c < 80; c++) c < 20 ? (a = r & n | ~r & o2, u = 1518500249) : c < 40 ? (a = r ^ n ^ o2, u = 1859775393) : c < 60 ? (a = r & n | r & o2 | n & o2, u = 2400959708) : (a = r ^ n ^ o2, u = 3395469782), h2 = rs(i8, 5) + a + l + u + t.getUint32(c * 4, false) & 4294967295, l = o2, o2 = n, n = rs(r, 30), r = i8, i8 = h2;
    this._h0 = this._h0 + i8 & 4294967295, this._h1 = this._h1 + r & 4294967295, this._h2 = this._h2 + n & 4294967295, this._h3 = this._h3 + o2 & 4294967295, this._h4 = this._h4 + l & 4294967295;
  }
};
Cr._bigBlock32 = new DataView(new ArrayBuffer(320));
var { registerWindow: Bh, getWindow: be, getDocument: Nh, getWindows: Fh, getWindowsCount: Hh, getWindowId: Oo, getWindowById: Wh, hasWindow: Uh, onDidRegisterWindow: No, onWillUnregisterWindow: Kh, onDidUnregisterWindow: zh } = (function() {
  let s15 = /* @__PURE__ */ new Map();
  fe;
  let t = { window: fe, disposables: new Ee() };
  s15.set(fe.vscodeWindowId, t);
  let e = new v(), i8 = new v(), r = new v();
  function n(o2, l) {
    return (typeof o2 == "number" ? s15.get(o2) : void 0) ?? (l ? t : void 0);
  }
  return { onDidRegisterWindow: e.event, onWillUnregisterWindow: r.event, onDidUnregisterWindow: i8.event, registerWindow(o2) {
    if (s15.has(o2.vscodeWindowId)) return D2.None;
    let l = new Ee(), a = { window: o2, disposables: l.add(new Ee()) };
    return s15.set(o2.vscodeWindowId, a), l.add(C(() => {
      s15.delete(o2.vscodeWindowId), i8.fire(o2);
    })), l.add(L(o2, Y2.BEFORE_UNLOAD, () => {
      r.fire(o2);
    })), e.fire(a), l;
  }, getWindows() {
    return s15.values();
  }, getWindowsCount() {
    return s15.size;
  }, getWindowId(o2) {
    return o2.vscodeWindowId;
  }, hasWindow(o2) {
    return s15.has(o2);
  }, getWindowById: n, getWindow(o2) {
    let l = o2;
    if (l?.ownerDocument?.defaultView) return l.ownerDocument.defaultView.window;
    let a = o2;
    return a?.view ? a.view.window : fe;
  }, getDocument(o2) {
    return be(o2).document;
  } };
})();
var ss = class {
  constructor(t, e, i8, r) {
    this._node = t, this._type = e, this._handler = i8, this._options = r || false, this._node.addEventListener(this._type, this._handler, this._options);
  }
  dispose() {
    this._handler && (this._node.removeEventListener(this._type, this._handler, this._options), this._node = null, this._handler = null);
  }
};
function L(s15, t, e, i8) {
  return new ss(s15, t, e, i8);
}
function ya(s15, t) {
  return function(e) {
    return t(new qe(s15, e));
  };
}
function xa(s15) {
  return function(t) {
    return s15(new ft(t));
  };
}
var os = function(t, e, i8, r) {
  let n = i8;
  return e === "click" || e === "mousedown" || e === "contextmenu" ? n = ya(be(t), i8) : (e === "keydown" || e === "keypress" || e === "keyup") && (n = xa(i8)), L(t, e, n, r);
};
var wa;
var mt;
var Mr = class extends kr {
  constructor(t) {
    super(), this.defaultTarget = t && be(t);
  }
  cancelAndSet(t, e, i8) {
    return super.cancelAndSet(t, e, i8 ?? this.defaultTarget);
  }
};
var Di = class {
  constructor(t, e = 0) {
    this._runner = t, this.priority = e, this._canceled = false;
  }
  dispose() {
    this._canceled = true;
  }
  execute() {
    if (!this._canceled) try {
      this._runner();
    } catch (t) {
      Lt(t);
    }
  }
  static sort(t, e) {
    return e.priority - t.priority;
  }
};
(function() {
  let s15 = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), e = /* @__PURE__ */ new Map(), i8 = /* @__PURE__ */ new Map(), r = (n) => {
    e.set(n, false);
    let o2 = s15.get(n) ?? [];
    for (t.set(n, o2), s15.set(n, []), i8.set(n, true); o2.length > 0; ) o2.sort(Di.sort), o2.shift().execute();
    i8.set(n, false);
  };
  mt = (n, o2, l = 0) => {
    let a = Oo(n), u = new Di(o2, l), h2 = s15.get(a);
    return h2 || (h2 = [], s15.set(a, h2)), h2.push(u), e.get(a) || (e.set(a, true), n.requestAnimationFrame(() => r(a))), u;
  }, wa = (n, o2, l) => {
    let a = Oo(n);
    if (i8.get(a)) {
      let u = new Di(o2, l), h2 = t.get(a);
      return h2 || (h2 = [], t.set(a, h2)), h2.push(u), u;
    } else return mt(n, o2, l);
  };
})();
var pt = class pt2 {
  constructor(t, e) {
    this.width = t;
    this.height = e;
  }
  with(t = this.width, e = this.height) {
    return t !== this.width || e !== this.height ? new pt2(t, e) : this;
  }
  static is(t) {
    return typeof t == "object" && typeof t.height == "number" && typeof t.width == "number";
  }
  static lift(t) {
    return t instanceof pt2 ? t : new pt2(t.width, t.height);
  }
  static equals(t, e) {
    return t === e ? true : !t || !e ? false : t.width === e.width && t.height === e.height;
  }
};
pt.None = new pt(0, 0);
function Fo(s15) {
  let t = s15.getBoundingClientRect(), e = be(s15);
  return { left: t.left + e.scrollX, top: t.top + e.scrollY, width: t.width, height: t.height };
}
var Gh = new class {
  constructor() {
    this.mutationObservers = /* @__PURE__ */ new Map();
  }
  observe(s15, t, e) {
    let i8 = this.mutationObservers.get(s15);
    i8 || (i8 = /* @__PURE__ */ new Map(), this.mutationObservers.set(s15, i8));
    let r = Mo(e), n = i8.get(r);
    if (n) n.users += 1;
    else {
      let o2 = new v(), l = new MutationObserver((u) => o2.fire(u));
      l.observe(s15, e);
      let a = n = { users: 1, observer: l, onDidMutate: o2.event };
      t.add(C(() => {
        a.users -= 1, a.users === 0 && (o2.dispose(), l.disconnect(), i8?.delete(r), i8?.size === 0 && this.mutationObservers.delete(s15));
      })), i8.set(r, n);
    }
    return n.onDidMutate;
  }
}();
var Y2 = { CLICK: "click", AUXCLICK: "auxclick", DBLCLICK: "dblclick", MOUSE_UP: "mouseup", MOUSE_DOWN: "mousedown", MOUSE_OVER: "mouseover", MOUSE_MOVE: "mousemove", MOUSE_OUT: "mouseout", MOUSE_ENTER: "mouseenter", MOUSE_LEAVE: "mouseleave", MOUSE_WHEEL: "wheel", POINTER_UP: "pointerup", POINTER_DOWN: "pointerdown", POINTER_MOVE: "pointermove", POINTER_LEAVE: "pointerleave", CONTEXT_MENU: "contextmenu", WHEEL: "wheel", KEY_DOWN: "keydown", KEY_PRESS: "keypress", KEY_UP: "keyup", LOAD: "load", BEFORE_UNLOAD: "beforeunload", UNLOAD: "unload", PAGE_SHOW: "pageshow", PAGE_HIDE: "pagehide", PASTE: "paste", ABORT: "abort", ERROR: "error", RESIZE: "resize", SCROLL: "scroll", FULLSCREEN_CHANGE: "fullscreenchange", WK_FULLSCREEN_CHANGE: "webkitfullscreenchange", SELECT: "select", CHANGE: "change", SUBMIT: "submit", RESET: "reset", FOCUS: "focus", FOCUS_IN: "focusin", FOCUS_OUT: "focusout", BLUR: "blur", INPUT: "input", STORAGE: "storage", DRAG_START: "dragstart", DRAG: "drag", DRAG_ENTER: "dragenter", DRAG_LEAVE: "dragleave", DRAG_OVER: "dragover", DROP: "drop", DRAG_END: "dragend", ANIMATION_START: Bt ? "webkitAnimationStart" : "animationstart", ANIMATION_END: Bt ? "webkitAnimationEnd" : "animationend", ANIMATION_ITERATION: Bt ? "webkitAnimationIteration" : "animationiteration" };
var Da = /([\w\-]+)?(#([\w\-]+))?((\.([\w\-]+))*)/;
function Ho(s15, t, e, ...i8) {
  let r = Da.exec(t);
  if (!r) throw new Error("Bad use of emmet");
  let n = r[1] || "div", o2;
  return s15 !== "http://www.w3.org/1999/xhtml" ? o2 = document.createElementNS(s15, n) : o2 = document.createElement(n), r[3] && (o2.id = r[3]), r[4] && (o2.className = r[4].replace(/\./g, " ").trim()), e && Object.entries(e).forEach(([l, a]) => {
    typeof a > "u" || (/^on\w+$/.test(l) ? o2[l] = a : l === "selected" ? a && o2.setAttribute(l, "true") : o2.setAttribute(l, a));
  }), o2.append(...i8), o2;
}
function Ra(s15, t, ...e) {
  return Ho("http://www.w3.org/1999/xhtml", s15, t, ...e);
}
Ra.SVG = function(s15, t, ...e) {
  return Ho("http://www.w3.org/2000/svg", s15, t, ...e);
};
var ls = class {
  constructor(t) {
    this.domNode = t;
    this._maxWidth = "";
    this._width = "";
    this._height = "";
    this._top = "";
    this._left = "";
    this._bottom = "";
    this._right = "";
    this._paddingTop = "";
    this._paddingLeft = "";
    this._paddingBottom = "";
    this._paddingRight = "";
    this._fontFamily = "";
    this._fontWeight = "";
    this._fontSize = "";
    this._fontStyle = "";
    this._fontFeatureSettings = "";
    this._fontVariationSettings = "";
    this._textDecoration = "";
    this._lineHeight = "";
    this._letterSpacing = "";
    this._className = "";
    this._display = "";
    this._position = "";
    this._visibility = "";
    this._color = "";
    this._backgroundColor = "";
    this._layerHint = false;
    this._contain = "none";
    this._boxShadow = "";
  }
  setMaxWidth(t) {
    let e = Ie(t);
    this._maxWidth !== e && (this._maxWidth = e, this.domNode.style.maxWidth = this._maxWidth);
  }
  setWidth(t) {
    let e = Ie(t);
    this._width !== e && (this._width = e, this.domNode.style.width = this._width);
  }
  setHeight(t) {
    let e = Ie(t);
    this._height !== e && (this._height = e, this.domNode.style.height = this._height);
  }
  setTop(t) {
    let e = Ie(t);
    this._top !== e && (this._top = e, this.domNode.style.top = this._top);
  }
  setLeft(t) {
    let e = Ie(t);
    this._left !== e && (this._left = e, this.domNode.style.left = this._left);
  }
  setBottom(t) {
    let e = Ie(t);
    this._bottom !== e && (this._bottom = e, this.domNode.style.bottom = this._bottom);
  }
  setRight(t) {
    let e = Ie(t);
    this._right !== e && (this._right = e, this.domNode.style.right = this._right);
  }
  setPaddingTop(t) {
    let e = Ie(t);
    this._paddingTop !== e && (this._paddingTop = e, this.domNode.style.paddingTop = this._paddingTop);
  }
  setPaddingLeft(t) {
    let e = Ie(t);
    this._paddingLeft !== e && (this._paddingLeft = e, this.domNode.style.paddingLeft = this._paddingLeft);
  }
  setPaddingBottom(t) {
    let e = Ie(t);
    this._paddingBottom !== e && (this._paddingBottom = e, this.domNode.style.paddingBottom = this._paddingBottom);
  }
  setPaddingRight(t) {
    let e = Ie(t);
    this._paddingRight !== e && (this._paddingRight = e, this.domNode.style.paddingRight = this._paddingRight);
  }
  setFontFamily(t) {
    this._fontFamily !== t && (this._fontFamily = t, this.domNode.style.fontFamily = this._fontFamily);
  }
  setFontWeight(t) {
    this._fontWeight !== t && (this._fontWeight = t, this.domNode.style.fontWeight = this._fontWeight);
  }
  setFontSize(t) {
    let e = Ie(t);
    this._fontSize !== e && (this._fontSize = e, this.domNode.style.fontSize = this._fontSize);
  }
  setFontStyle(t) {
    this._fontStyle !== t && (this._fontStyle = t, this.domNode.style.fontStyle = this._fontStyle);
  }
  setFontFeatureSettings(t) {
    this._fontFeatureSettings !== t && (this._fontFeatureSettings = t, this.domNode.style.fontFeatureSettings = this._fontFeatureSettings);
  }
  setFontVariationSettings(t) {
    this._fontVariationSettings !== t && (this._fontVariationSettings = t, this.domNode.style.fontVariationSettings = this._fontVariationSettings);
  }
  setTextDecoration(t) {
    this._textDecoration !== t && (this._textDecoration = t, this.domNode.style.textDecoration = this._textDecoration);
  }
  setLineHeight(t) {
    let e = Ie(t);
    this._lineHeight !== e && (this._lineHeight = e, this.domNode.style.lineHeight = this._lineHeight);
  }
  setLetterSpacing(t) {
    let e = Ie(t);
    this._letterSpacing !== e && (this._letterSpacing = e, this.domNode.style.letterSpacing = this._letterSpacing);
  }
  setClassName(t) {
    this._className !== t && (this._className = t, this.domNode.className = this._className);
  }
  toggleClassName(t, e) {
    this.domNode.classList.toggle(t, e), this._className = this.domNode.className;
  }
  setDisplay(t) {
    this._display !== t && (this._display = t, this.domNode.style.display = this._display);
  }
  setPosition(t) {
    this._position !== t && (this._position = t, this.domNode.style.position = this._position);
  }
  setVisibility(t) {
    this._visibility !== t && (this._visibility = t, this.domNode.style.visibility = this._visibility);
  }
  setColor(t) {
    this._color !== t && (this._color = t, this.domNode.style.color = this._color);
  }
  setBackgroundColor(t) {
    this._backgroundColor !== t && (this._backgroundColor = t, this.domNode.style.backgroundColor = this._backgroundColor);
  }
  setLayerHinting(t) {
    this._layerHint !== t && (this._layerHint = t, this.domNode.style.transform = this._layerHint ? "translate3d(0px, 0px, 0px)" : "");
  }
  setBoxShadow(t) {
    this._boxShadow !== t && (this._boxShadow = t, this.domNode.style.boxShadow = t);
  }
  setContain(t) {
    this._contain !== t && (this._contain = t, this.domNode.style.contain = this._contain);
  }
  setAttribute(t, e) {
    this.domNode.setAttribute(t, e);
  }
  removeAttribute(t) {
    this.domNode.removeAttribute(t);
  }
  appendChild(t) {
    this.domNode.appendChild(t.domNode);
  }
  removeChild(t) {
    this.domNode.removeChild(t.domNode);
  }
};
function Ie(s15) {
  return typeof s15 == "number" ? `${s15}px` : s15;
}
function _t(s15) {
  return new ls(s15);
}
var Wt = class {
  constructor() {
    this._hooks = new Ee();
    this._pointerMoveCallback = null;
    this._onStopCallback = null;
  }
  dispose() {
    this.stopMonitoring(false), this._hooks.dispose();
  }
  stopMonitoring(t, e) {
    if (!this.isMonitoring()) return;
    this._hooks.clear(), this._pointerMoveCallback = null;
    let i8 = this._onStopCallback;
    this._onStopCallback = null, t && i8 && i8(e);
  }
  isMonitoring() {
    return !!this._pointerMoveCallback;
  }
  startMonitoring(t, e, i8, r, n) {
    this.isMonitoring() && this.stopMonitoring(false), this._pointerMoveCallback = r, this._onStopCallback = n;
    let o2 = t;
    try {
      t.setPointerCapture(e), this._hooks.add(C(() => {
        try {
          t.releasePointerCapture(e);
        } catch {
        }
      }));
    } catch {
      o2 = be(t);
    }
    this._hooks.add(L(o2, Y2.POINTER_MOVE, (l) => {
      if (l.buttons !== i8) {
        this.stopMonitoring(true);
        return;
      }
      l.preventDefault(), this._pointerMoveCallback(l);
    })), this._hooks.add(L(o2, Y2.POINTER_UP, (l) => this.stopMonitoring(true)));
  }
};
function Wo(s15, t, e) {
  let i8 = null, r = null;
  if (typeof e.value == "function" ? (i8 = "value", r = e.value, r.length !== 0 && console.warn("Memoize should only be used in functions with zero parameters")) : typeof e.get == "function" && (i8 = "get", r = e.get), !r) throw new Error("not supported");
  let n = `$memoize$${t}`;
  e[i8] = function(...o2) {
    return this.hasOwnProperty(n) || Object.defineProperty(this, n, { configurable: false, enumerable: false, writable: false, value: r.apply(this, o2) }), this[n];
  };
}
var He;
((n) => (n.Tap = "-xterm-gesturetap", n.Change = "-xterm-gesturechange", n.Start = "-xterm-gesturestart", n.End = "-xterm-gesturesend", n.Contextmenu = "-xterm-gesturecontextmenu"))(He || (He = {}));
var Q = class Q2 extends D2 {
  constructor() {
    super();
    this.dispatched = false;
    this.targets = new Ct();
    this.ignoreTargets = new Ct();
    this.activeTouches = {}, this.handle = null, this._lastSetTapCountTime = 0, this._register($.runAndSubscribe(No, ({ window: e, disposables: i8 }) => {
      i8.add(L(e.document, "touchstart", (r) => this.onTouchStart(r), { passive: false })), i8.add(L(e.document, "touchend", (r) => this.onTouchEnd(e, r))), i8.add(L(e.document, "touchmove", (r) => this.onTouchMove(r), { passive: false }));
    }, { window: fe, disposables: this._store }));
  }
  static addTarget(e) {
    if (!Q2.isTouchDevice()) return D2.None;
    Q2.INSTANCE || (Q2.INSTANCE = Gn(new Q2()));
    let i8 = Q2.INSTANCE.targets.push(e);
    return C(i8);
  }
  static ignoreTarget(e) {
    if (!Q2.isTouchDevice()) return D2.None;
    Q2.INSTANCE || (Q2.INSTANCE = Gn(new Q2()));
    let i8 = Q2.INSTANCE.ignoreTargets.push(e);
    return C(i8);
  }
  static isTouchDevice() {
    return "ontouchstart" in fe || navigator.maxTouchPoints > 0;
  }
  dispose() {
    this.handle && (this.handle.dispose(), this.handle = null), super.dispose();
  }
  onTouchStart(e) {
    let i8 = Date.now();
    this.handle && (this.handle.dispose(), this.handle = null);
    for (let r = 0, n = e.targetTouches.length; r < n; r++) {
      let o2 = e.targetTouches.item(r);
      this.activeTouches[o2.identifier] = { id: o2.identifier, initialTarget: o2.target, initialTimeStamp: i8, initialPageX: o2.pageX, initialPageY: o2.pageY, rollingTimestamps: [i8], rollingPageX: [o2.pageX], rollingPageY: [o2.pageY] };
      let l = this.newGestureEvent(He.Start, o2.target);
      l.pageX = o2.pageX, l.pageY = o2.pageY, this.dispatchEvent(l);
    }
    this.dispatched && (e.preventDefault(), e.stopPropagation(), this.dispatched = false);
  }
  onTouchEnd(e, i8) {
    let r = Date.now(), n = Object.keys(this.activeTouches).length;
    for (let o2 = 0, l = i8.changedTouches.length; o2 < l; o2++) {
      let a = i8.changedTouches.item(o2);
      if (!this.activeTouches.hasOwnProperty(String(a.identifier))) {
        console.warn("move of an UNKNOWN touch", a);
        continue;
      }
      let u = this.activeTouches[a.identifier], h2 = Date.now() - u.initialTimeStamp;
      if (h2 < Q2.HOLD_DELAY && Math.abs(u.initialPageX - Se(u.rollingPageX)) < 30 && Math.abs(u.initialPageY - Se(u.rollingPageY)) < 30) {
        let c = this.newGestureEvent(He.Tap, u.initialTarget);
        c.pageX = Se(u.rollingPageX), c.pageY = Se(u.rollingPageY), this.dispatchEvent(c);
      } else if (h2 >= Q2.HOLD_DELAY && Math.abs(u.initialPageX - Se(u.rollingPageX)) < 30 && Math.abs(u.initialPageY - Se(u.rollingPageY)) < 30) {
        let c = this.newGestureEvent(He.Contextmenu, u.initialTarget);
        c.pageX = Se(u.rollingPageX), c.pageY = Se(u.rollingPageY), this.dispatchEvent(c);
      } else if (n === 1) {
        let c = Se(u.rollingPageX), d = Se(u.rollingPageY), _2 = Se(u.rollingTimestamps) - u.rollingTimestamps[0], p = c - u.rollingPageX[0], m = d - u.rollingPageY[0], f = [...this.targets].filter((A) => u.initialTarget instanceof Node && A.contains(u.initialTarget));
        this.inertia(e, f, r, Math.abs(p) / _2, p > 0 ? 1 : -1, c, Math.abs(m) / _2, m > 0 ? 1 : -1, d);
      }
      this.dispatchEvent(this.newGestureEvent(He.End, u.initialTarget)), delete this.activeTouches[a.identifier];
    }
    this.dispatched && (i8.preventDefault(), i8.stopPropagation(), this.dispatched = false);
  }
  newGestureEvent(e, i8) {
    let r = document.createEvent("CustomEvent");
    return r.initEvent(e, false, true), r.initialTarget = i8, r.tapCount = 0, r;
  }
  dispatchEvent(e) {
    if (e.type === He.Tap) {
      let i8 = (/* @__PURE__ */ new Date()).getTime(), r = 0;
      i8 - this._lastSetTapCountTime > Q2.CLEAR_TAP_COUNT_TIME ? r = 1 : r = 2, this._lastSetTapCountTime = i8, e.tapCount = r;
    } else (e.type === He.Change || e.type === He.Contextmenu) && (this._lastSetTapCountTime = 0);
    if (e.initialTarget instanceof Node) {
      for (let r of this.ignoreTargets) if (r.contains(e.initialTarget)) return;
      let i8 = [];
      for (let r of this.targets) if (r.contains(e.initialTarget)) {
        let n = 0, o2 = e.initialTarget;
        for (; o2 && o2 !== r; ) n++, o2 = o2.parentElement;
        i8.push([n, r]);
      }
      i8.sort((r, n) => r[0] - n[0]);
      for (let [r, n] of i8) n.dispatchEvent(e), this.dispatched = true;
    }
  }
  inertia(e, i8, r, n, o2, l, a, u, h2) {
    this.handle = mt(e, () => {
      let c = Date.now(), d = c - r, _2 = 0, p = 0, m = true;
      n += Q2.SCROLL_FRICTION * d, a += Q2.SCROLL_FRICTION * d, n > 0 && (m = false, _2 = o2 * n * d), a > 0 && (m = false, p = u * a * d);
      let f = this.newGestureEvent(He.Change);
      f.translationX = _2, f.translationY = p, i8.forEach((A) => A.dispatchEvent(f)), m || this.inertia(e, i8, c, n, o2, l + _2, a, u, h2 + p);
    });
  }
  onTouchMove(e) {
    let i8 = Date.now();
    for (let r = 0, n = e.changedTouches.length; r < n; r++) {
      let o2 = e.changedTouches.item(r);
      if (!this.activeTouches.hasOwnProperty(String(o2.identifier))) {
        console.warn("end of an UNKNOWN touch", o2);
        continue;
      }
      let l = this.activeTouches[o2.identifier], a = this.newGestureEvent(He.Change, l.initialTarget);
      a.translationX = o2.pageX - Se(l.rollingPageX), a.translationY = o2.pageY - Se(l.rollingPageY), a.pageX = o2.pageX, a.pageY = o2.pageY, this.dispatchEvent(a), l.rollingPageX.length > 3 && (l.rollingPageX.shift(), l.rollingPageY.shift(), l.rollingTimestamps.shift()), l.rollingPageX.push(o2.pageX), l.rollingPageY.push(o2.pageY), l.rollingTimestamps.push(i8);
    }
    this.dispatched && (e.preventDefault(), e.stopPropagation(), this.dispatched = false);
  }
};
Q.SCROLL_FRICTION = -5e-3, Q.HOLD_DELAY = 700, Q.CLEAR_TAP_COUNT_TIME = 400, M([Wo], Q, "isTouchDevice", 1);
var Pr = Q;
var lt = class extends D2 {
  onclick(t, e) {
    this._register(L(t, Y2.CLICK, (i8) => e(new qe(be(t), i8))));
  }
  onmousedown(t, e) {
    this._register(L(t, Y2.MOUSE_DOWN, (i8) => e(new qe(be(t), i8))));
  }
  onmouseover(t, e) {
    this._register(L(t, Y2.MOUSE_OVER, (i8) => e(new qe(be(t), i8))));
  }
  onmouseleave(t, e) {
    this._register(L(t, Y2.MOUSE_LEAVE, (i8) => e(new qe(be(t), i8))));
  }
  onkeydown(t, e) {
    this._register(L(t, Y2.KEY_DOWN, (i8) => e(new ft(i8))));
  }
  onkeyup(t, e) {
    this._register(L(t, Y2.KEY_UP, (i8) => e(new ft(i8))));
  }
  oninput(t, e) {
    this._register(L(t, Y2.INPUT, e));
  }
  onblur(t, e) {
    this._register(L(t, Y2.BLUR, e));
  }
  onfocus(t, e) {
    this._register(L(t, Y2.FOCUS, e));
  }
  onchange(t, e) {
    this._register(L(t, Y2.CHANGE, e));
  }
  ignoreGesture(t) {
    return Pr.ignoreTarget(t);
  }
};
var Uo = 11;
var Or = class extends lt {
  constructor(t) {
    super(), this._onActivate = t.onActivate, this.bgDomNode = document.createElement("div"), this.bgDomNode.className = "arrow-background", this.bgDomNode.style.position = "absolute", this.bgDomNode.style.width = t.bgWidth + "px", this.bgDomNode.style.height = t.bgHeight + "px", typeof t.top < "u" && (this.bgDomNode.style.top = "0px"), typeof t.left < "u" && (this.bgDomNode.style.left = "0px"), typeof t.bottom < "u" && (this.bgDomNode.style.bottom = "0px"), typeof t.right < "u" && (this.bgDomNode.style.right = "0px"), this.domNode = document.createElement("div"), this.domNode.className = t.className, this.domNode.style.position = "absolute", this.domNode.style.width = Uo + "px", this.domNode.style.height = Uo + "px", typeof t.top < "u" && (this.domNode.style.top = t.top + "px"), typeof t.left < "u" && (this.domNode.style.left = t.left + "px"), typeof t.bottom < "u" && (this.domNode.style.bottom = t.bottom + "px"), typeof t.right < "u" && (this.domNode.style.right = t.right + "px"), this._pointerMoveMonitor = this._register(new Wt()), this._register(os(this.bgDomNode, Y2.POINTER_DOWN, (e) => this._arrowPointerDown(e))), this._register(os(this.domNode, Y2.POINTER_DOWN, (e) => this._arrowPointerDown(e))), this._pointerdownRepeatTimer = this._register(new Mr()), this._pointerdownScheduleRepeatTimer = this._register(new Ye());
  }
  _arrowPointerDown(t) {
    if (!t.target || !(t.target instanceof Element)) return;
    let e = () => {
      this._pointerdownRepeatTimer.cancelAndSet(() => this._onActivate(), 1e3 / 24, be(t));
    };
    this._onActivate(), this._pointerdownRepeatTimer.cancel(), this._pointerdownScheduleRepeatTimer.cancelAndSet(e, 200), this._pointerMoveMonitor.startMonitoring(t.target, t.pointerId, t.buttons, (i8) => {
    }, () => {
      this._pointerdownRepeatTimer.cancel(), this._pointerdownScheduleRepeatTimer.cancel();
    }), t.preventDefault();
  }
};
var cs = class s9 {
  constructor(t, e, i8, r, n, o2, l) {
    this._forceIntegerValues = t;
    this._scrollStateBrand = void 0;
    this._forceIntegerValues && (e = e | 0, i8 = i8 | 0, r = r | 0, n = n | 0, o2 = o2 | 0, l = l | 0), this.rawScrollLeft = r, this.rawScrollTop = l, e < 0 && (e = 0), r + e > i8 && (r = i8 - e), r < 0 && (r = 0), n < 0 && (n = 0), l + n > o2 && (l = o2 - n), l < 0 && (l = 0), this.width = e, this.scrollWidth = i8, this.scrollLeft = r, this.height = n, this.scrollHeight = o2, this.scrollTop = l;
  }
  equals(t) {
    return this.rawScrollLeft === t.rawScrollLeft && this.rawScrollTop === t.rawScrollTop && this.width === t.width && this.scrollWidth === t.scrollWidth && this.scrollLeft === t.scrollLeft && this.height === t.height && this.scrollHeight === t.scrollHeight && this.scrollTop === t.scrollTop;
  }
  withScrollDimensions(t, e) {
    return new s9(this._forceIntegerValues, typeof t.width < "u" ? t.width : this.width, typeof t.scrollWidth < "u" ? t.scrollWidth : this.scrollWidth, e ? this.rawScrollLeft : this.scrollLeft, typeof t.height < "u" ? t.height : this.height, typeof t.scrollHeight < "u" ? t.scrollHeight : this.scrollHeight, e ? this.rawScrollTop : this.scrollTop);
  }
  withScrollPosition(t) {
    return new s9(this._forceIntegerValues, this.width, this.scrollWidth, typeof t.scrollLeft < "u" ? t.scrollLeft : this.rawScrollLeft, this.height, this.scrollHeight, typeof t.scrollTop < "u" ? t.scrollTop : this.rawScrollTop);
  }
  createScrollEvent(t, e) {
    let i8 = this.width !== t.width, r = this.scrollWidth !== t.scrollWidth, n = this.scrollLeft !== t.scrollLeft, o2 = this.height !== t.height, l = this.scrollHeight !== t.scrollHeight, a = this.scrollTop !== t.scrollTop;
    return { inSmoothScrolling: e, oldWidth: t.width, oldScrollWidth: t.scrollWidth, oldScrollLeft: t.scrollLeft, width: this.width, scrollWidth: this.scrollWidth, scrollLeft: this.scrollLeft, oldHeight: t.height, oldScrollHeight: t.scrollHeight, oldScrollTop: t.scrollTop, height: this.height, scrollHeight: this.scrollHeight, scrollTop: this.scrollTop, widthChanged: i8, scrollWidthChanged: r, scrollLeftChanged: n, heightChanged: o2, scrollHeightChanged: l, scrollTopChanged: a };
  }
};
var Ri = class extends D2 {
  constructor(e) {
    super();
    this._scrollableBrand = void 0;
    this._onScroll = this._register(new v());
    this.onScroll = this._onScroll.event;
    this._smoothScrollDuration = e.smoothScrollDuration, this._scheduleAtNextAnimationFrame = e.scheduleAtNextAnimationFrame, this._state = new cs(e.forceIntegerValues, 0, 0, 0, 0, 0, 0), this._smoothScrolling = null;
  }
  dispose() {
    this._smoothScrolling && (this._smoothScrolling.dispose(), this._smoothScrolling = null), super.dispose();
  }
  setSmoothScrollDuration(e) {
    this._smoothScrollDuration = e;
  }
  validateScrollPosition(e) {
    return this._state.withScrollPosition(e);
  }
  getScrollDimensions() {
    return this._state;
  }
  setScrollDimensions(e, i8) {
    let r = this._state.withScrollDimensions(e, i8);
    this._setState(r, !!this._smoothScrolling), this._smoothScrolling?.acceptScrollDimensions(this._state);
  }
  getFutureScrollPosition() {
    return this._smoothScrolling ? this._smoothScrolling.to : this._state;
  }
  getCurrentScrollPosition() {
    return this._state;
  }
  setScrollPositionNow(e) {
    let i8 = this._state.withScrollPosition(e);
    this._smoothScrolling && (this._smoothScrolling.dispose(), this._smoothScrolling = null), this._setState(i8, false);
  }
  setScrollPositionSmooth(e, i8) {
    if (this._smoothScrollDuration === 0) return this.setScrollPositionNow(e);
    if (this._smoothScrolling) {
      e = { scrollLeft: typeof e.scrollLeft > "u" ? this._smoothScrolling.to.scrollLeft : e.scrollLeft, scrollTop: typeof e.scrollTop > "u" ? this._smoothScrolling.to.scrollTop : e.scrollTop };
      let r = this._state.withScrollPosition(e);
      if (this._smoothScrolling.to.scrollLeft === r.scrollLeft && this._smoothScrolling.to.scrollTop === r.scrollTop) return;
      let n;
      i8 ? n = new Nr(this._smoothScrolling.from, r, this._smoothScrolling.startTime, this._smoothScrolling.duration) : n = this._smoothScrolling.combine(this._state, r, this._smoothScrollDuration), this._smoothScrolling.dispose(), this._smoothScrolling = n;
    } else {
      let r = this._state.withScrollPosition(e);
      this._smoothScrolling = Nr.start(this._state, r, this._smoothScrollDuration);
    }
    this._smoothScrolling.animationFrameDisposable = this._scheduleAtNextAnimationFrame(() => {
      this._smoothScrolling && (this._smoothScrolling.animationFrameDisposable = null, this._performSmoothScrolling());
    });
  }
  hasPendingScrollAnimation() {
    return !!this._smoothScrolling;
  }
  _performSmoothScrolling() {
    if (!this._smoothScrolling) return;
    let e = this._smoothScrolling.tick(), i8 = this._state.withScrollPosition(e);
    if (this._setState(i8, true), !!this._smoothScrolling) {
      if (e.isDone) {
        this._smoothScrolling.dispose(), this._smoothScrolling = null;
        return;
      }
      this._smoothScrolling.animationFrameDisposable = this._scheduleAtNextAnimationFrame(() => {
        this._smoothScrolling && (this._smoothScrolling.animationFrameDisposable = null, this._performSmoothScrolling());
      });
    }
  }
  _setState(e, i8) {
    let r = this._state;
    r.equals(e) || (this._state = e, this._onScroll.fire(this._state.createScrollEvent(r, i8)));
  }
};
var Br = class {
  constructor(t, e, i8) {
    this.scrollLeft = t, this.scrollTop = e, this.isDone = i8;
  }
};
function as(s15, t) {
  let e = t - s15;
  return function(i8) {
    return s15 + e * ka(i8);
  };
}
function La(s15, t, e) {
  return function(i8) {
    return i8 < e ? s15(i8 / e) : t((i8 - e) / (1 - e));
  };
}
var Nr = class s10 {
  constructor(t, e, i8, r) {
    this.from = t, this.to = e, this.duration = r, this.startTime = i8, this.animationFrameDisposable = null, this._initAnimations();
  }
  _initAnimations() {
    this.scrollLeft = this._initAnimation(this.from.scrollLeft, this.to.scrollLeft, this.to.width), this.scrollTop = this._initAnimation(this.from.scrollTop, this.to.scrollTop, this.to.height);
  }
  _initAnimation(t, e, i8) {
    if (Math.abs(t - e) > 2.5 * i8) {
      let n, o2;
      return t < e ? (n = t + 0.75 * i8, o2 = e - 0.75 * i8) : (n = t - 0.75 * i8, o2 = e + 0.75 * i8), La(as(t, n), as(o2, e), 0.33);
    }
    return as(t, e);
  }
  dispose() {
    this.animationFrameDisposable !== null && (this.animationFrameDisposable.dispose(), this.animationFrameDisposable = null);
  }
  acceptScrollDimensions(t) {
    this.to = t.withScrollPosition(this.to), this._initAnimations();
  }
  tick() {
    return this._tick(Date.now());
  }
  _tick(t) {
    let e = (t - this.startTime) / this.duration;
    if (e < 1) {
      let i8 = this.scrollLeft(e), r = this.scrollTop(e);
      return new Br(i8, r, false);
    }
    return new Br(this.to.scrollLeft, this.to.scrollTop, true);
  }
  combine(t, e, i8) {
    return s10.start(t, e, i8);
  }
  static start(t, e, i8) {
    i8 = i8 + 10;
    let r = Date.now() - 10;
    return new s10(t, e, r, i8);
  }
};
function Aa(s15) {
  return Math.pow(s15, 3);
}
function ka(s15) {
  return 1 - Aa(1 - s15);
}
var Fr = class extends D2 {
  constructor(t, e, i8) {
    super(), this._visibility = t, this._visibleClassName = e, this._invisibleClassName = i8, this._domNode = null, this._isVisible = false, this._isNeeded = false, this._rawShouldBeVisible = false, this._shouldBeVisible = false, this._revealTimer = this._register(new Ye());
  }
  setVisibility(t) {
    this._visibility !== t && (this._visibility = t, this._updateShouldBeVisible());
  }
  setShouldBeVisible(t) {
    this._rawShouldBeVisible = t, this._updateShouldBeVisible();
  }
  _applyVisibilitySetting() {
    return this._visibility === 2 ? false : this._visibility === 3 ? true : this._rawShouldBeVisible;
  }
  _updateShouldBeVisible() {
    let t = this._applyVisibilitySetting();
    this._shouldBeVisible !== t && (this._shouldBeVisible = t, this.ensureVisibility());
  }
  setIsNeeded(t) {
    this._isNeeded !== t && (this._isNeeded = t, this.ensureVisibility());
  }
  setDomNode(t) {
    this._domNode = t, this._domNode.setClassName(this._invisibleClassName), this.setShouldBeVisible(false);
  }
  ensureVisibility() {
    if (!this._isNeeded) {
      this._hide(false);
      return;
    }
    this._shouldBeVisible ? this._reveal() : this._hide(true);
  }
  _reveal() {
    this._isVisible || (this._isVisible = true, this._revealTimer.setIfNotSet(() => {
      this._domNode?.setClassName(this._visibleClassName);
    }, 0));
  }
  _hide(t) {
    this._revealTimer.cancel(), this._isVisible && (this._isVisible = false, this._domNode?.setClassName(this._invisibleClassName + (t ? " fade" : "")));
  }
};
var Ca = 140;
var Ut = class extends lt {
  constructor(t) {
    super(), this._lazyRender = t.lazyRender, this._host = t.host, this._scrollable = t.scrollable, this._scrollByPage = t.scrollByPage, this._scrollbarState = t.scrollbarState, this._visibilityController = this._register(new Fr(t.visibility, "visible scrollbar " + t.extraScrollbarClassName, "invisible scrollbar " + t.extraScrollbarClassName)), this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()), this._pointerMoveMonitor = this._register(new Wt()), this._shouldRender = true, this.domNode = _t(document.createElement("div")), this.domNode.setAttribute("role", "presentation"), this.domNode.setAttribute("aria-hidden", "true"), this._visibilityController.setDomNode(this.domNode), this.domNode.setPosition("absolute"), this._register(L(this.domNode.domNode, Y2.POINTER_DOWN, (e) => this._domNodePointerDown(e)));
  }
  _createArrow(t) {
    let e = this._register(new Or(t));
    this.domNode.domNode.appendChild(e.bgDomNode), this.domNode.domNode.appendChild(e.domNode);
  }
  _createSlider(t, e, i8, r) {
    this.slider = _t(document.createElement("div")), this.slider.setClassName("slider"), this.slider.setPosition("absolute"), this.slider.setTop(t), this.slider.setLeft(e), typeof i8 == "number" && this.slider.setWidth(i8), typeof r == "number" && this.slider.setHeight(r), this.slider.setLayerHinting(true), this.slider.setContain("strict"), this.domNode.domNode.appendChild(this.slider.domNode), this._register(L(this.slider.domNode, Y2.POINTER_DOWN, (n) => {
      n.button === 0 && (n.preventDefault(), this._sliderPointerDown(n));
    })), this.onclick(this.slider.domNode, (n) => {
      n.leftButton && n.stopPropagation();
    });
  }
  _onElementSize(t) {
    return this._scrollbarState.setVisibleSize(t) && (this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()), this._shouldRender = true, this._lazyRender || this.render()), this._shouldRender;
  }
  _onElementScrollSize(t) {
    return this._scrollbarState.setScrollSize(t) && (this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()), this._shouldRender = true, this._lazyRender || this.render()), this._shouldRender;
  }
  _onElementScrollPosition(t) {
    return this._scrollbarState.setScrollPosition(t) && (this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()), this._shouldRender = true, this._lazyRender || this.render()), this._shouldRender;
  }
  beginReveal() {
    this._visibilityController.setShouldBeVisible(true);
  }
  beginHide() {
    this._visibilityController.setShouldBeVisible(false);
  }
  render() {
    this._shouldRender && (this._shouldRender = false, this._renderDomNode(this._scrollbarState.getRectangleLargeSize(), this._scrollbarState.getRectangleSmallSize()), this._updateSlider(this._scrollbarState.getSliderSize(), this._scrollbarState.getArrowSize() + this._scrollbarState.getSliderPosition()));
  }
  _domNodePointerDown(t) {
    t.target === this.domNode.domNode && this._onPointerDown(t);
  }
  delegatePointerDown(t) {
    let e = this.domNode.domNode.getClientRects()[0].top, i8 = e + this._scrollbarState.getSliderPosition(), r = e + this._scrollbarState.getSliderPosition() + this._scrollbarState.getSliderSize(), n = this._sliderPointerPosition(t);
    i8 <= n && n <= r ? t.button === 0 && (t.preventDefault(), this._sliderPointerDown(t)) : this._onPointerDown(t);
  }
  _onPointerDown(t) {
    let e, i8;
    if (t.target === this.domNode.domNode && typeof t.offsetX == "number" && typeof t.offsetY == "number") e = t.offsetX, i8 = t.offsetY;
    else {
      let n = Fo(this.domNode.domNode);
      e = t.pageX - n.left, i8 = t.pageY - n.top;
    }
    let r = this._pointerDownRelativePosition(e, i8);
    this._setDesiredScrollPositionNow(this._scrollByPage ? this._scrollbarState.getDesiredScrollPositionFromOffsetPaged(r) : this._scrollbarState.getDesiredScrollPositionFromOffset(r)), t.button === 0 && (t.preventDefault(), this._sliderPointerDown(t));
  }
  _sliderPointerDown(t) {
    if (!t.target || !(t.target instanceof Element)) return;
    let e = this._sliderPointerPosition(t), i8 = this._sliderOrthogonalPointerPosition(t), r = this._scrollbarState.clone();
    this.slider.toggleClassName("active", true), this._pointerMoveMonitor.startMonitoring(t.target, t.pointerId, t.buttons, (n) => {
      let o2 = this._sliderOrthogonalPointerPosition(n), l = Math.abs(o2 - i8);
      if (wr && l > Ca) {
        this._setDesiredScrollPositionNow(r.getScrollPosition());
        return;
      }
      let u = this._sliderPointerPosition(n) - e;
      this._setDesiredScrollPositionNow(r.getDesiredScrollPositionFromDelta(u));
    }, () => {
      this.slider.toggleClassName("active", false), this._host.onDragEnd();
    }), this._host.onDragStart();
  }
  _setDesiredScrollPositionNow(t) {
    let e = {};
    this.writeScrollPosition(e, t), this._scrollable.setScrollPositionNow(e);
  }
  updateScrollbarSize(t) {
    this._updateScrollbarSize(t), this._scrollbarState.setScrollbarSize(t), this._shouldRender = true, this._lazyRender || this.render();
  }
  isNeeded() {
    return this._scrollbarState.isNeeded();
  }
};
var Kt = class s11 {
  constructor(t, e, i8, r, n, o2) {
    this._scrollbarSize = Math.round(e), this._oppositeScrollbarSize = Math.round(i8), this._arrowSize = Math.round(t), this._visibleSize = r, this._scrollSize = n, this._scrollPosition = o2, this._computedAvailableSize = 0, this._computedIsNeeded = false, this._computedSliderSize = 0, this._computedSliderRatio = 0, this._computedSliderPosition = 0, this._refreshComputedValues();
  }
  clone() {
    return new s11(this._arrowSize, this._scrollbarSize, this._oppositeScrollbarSize, this._visibleSize, this._scrollSize, this._scrollPosition);
  }
  setVisibleSize(t) {
    let e = Math.round(t);
    return this._visibleSize !== e ? (this._visibleSize = e, this._refreshComputedValues(), true) : false;
  }
  setScrollSize(t) {
    let e = Math.round(t);
    return this._scrollSize !== e ? (this._scrollSize = e, this._refreshComputedValues(), true) : false;
  }
  setScrollPosition(t) {
    let e = Math.round(t);
    return this._scrollPosition !== e ? (this._scrollPosition = e, this._refreshComputedValues(), true) : false;
  }
  setScrollbarSize(t) {
    this._scrollbarSize = Math.round(t);
  }
  setOppositeScrollbarSize(t) {
    this._oppositeScrollbarSize = Math.round(t);
  }
  static _computeValues(t, e, i8, r, n) {
    let o2 = Math.max(0, i8 - t), l = Math.max(0, o2 - 2 * e), a = r > 0 && r > i8;
    if (!a) return { computedAvailableSize: Math.round(o2), computedIsNeeded: a, computedSliderSize: Math.round(l), computedSliderRatio: 0, computedSliderPosition: 0 };
    let u = Math.round(Math.max(20, Math.floor(i8 * l / r))), h2 = (l - u) / (r - i8), c = n * h2;
    return { computedAvailableSize: Math.round(o2), computedIsNeeded: a, computedSliderSize: Math.round(u), computedSliderRatio: h2, computedSliderPosition: Math.round(c) };
  }
  _refreshComputedValues() {
    let t = s11._computeValues(this._oppositeScrollbarSize, this._arrowSize, this._visibleSize, this._scrollSize, this._scrollPosition);
    this._computedAvailableSize = t.computedAvailableSize, this._computedIsNeeded = t.computedIsNeeded, this._computedSliderSize = t.computedSliderSize, this._computedSliderRatio = t.computedSliderRatio, this._computedSliderPosition = t.computedSliderPosition;
  }
  getArrowSize() {
    return this._arrowSize;
  }
  getScrollPosition() {
    return this._scrollPosition;
  }
  getRectangleLargeSize() {
    return this._computedAvailableSize;
  }
  getRectangleSmallSize() {
    return this._scrollbarSize;
  }
  isNeeded() {
    return this._computedIsNeeded;
  }
  getSliderSize() {
    return this._computedSliderSize;
  }
  getSliderPosition() {
    return this._computedSliderPosition;
  }
  getDesiredScrollPositionFromOffset(t) {
    if (!this._computedIsNeeded) return 0;
    let e = t - this._arrowSize - this._computedSliderSize / 2;
    return Math.round(e / this._computedSliderRatio);
  }
  getDesiredScrollPositionFromOffsetPaged(t) {
    if (!this._computedIsNeeded) return 0;
    let e = t - this._arrowSize, i8 = this._scrollPosition;
    return e < this._computedSliderPosition ? i8 -= this._visibleSize : i8 += this._visibleSize, i8;
  }
  getDesiredScrollPositionFromDelta(t) {
    if (!this._computedIsNeeded) return 0;
    let e = this._computedSliderPosition + t;
    return Math.round(e / this._computedSliderRatio);
  }
};
var Wr = class extends Ut {
  constructor(t, e, i8) {
    let r = t.getScrollDimensions(), n = t.getCurrentScrollPosition();
    if (super({ lazyRender: e.lazyRender, host: i8, scrollbarState: new Kt(e.horizontalHasArrows ? e.arrowSize : 0, e.horizontal === 2 ? 0 : e.horizontalScrollbarSize, e.vertical === 2 ? 0 : e.verticalScrollbarSize, r.width, r.scrollWidth, n.scrollLeft), visibility: e.horizontal, extraScrollbarClassName: "horizontal", scrollable: t, scrollByPage: e.scrollByPage }), e.horizontalHasArrows) throw new Error("horizontalHasArrows is not supported in xterm.js");
    this._createSlider(Math.floor((e.horizontalScrollbarSize - e.horizontalSliderSize) / 2), 0, void 0, e.horizontalSliderSize);
  }
  _updateSlider(t, e) {
    this.slider.setWidth(t), this.slider.setLeft(e);
  }
  _renderDomNode(t, e) {
    this.domNode.setWidth(t), this.domNode.setHeight(e), this.domNode.setLeft(0), this.domNode.setBottom(0);
  }
  onDidScroll(t) {
    return this._shouldRender = this._onElementScrollSize(t.scrollWidth) || this._shouldRender, this._shouldRender = this._onElementScrollPosition(t.scrollLeft) || this._shouldRender, this._shouldRender = this._onElementSize(t.width) || this._shouldRender, this._shouldRender;
  }
  _pointerDownRelativePosition(t, e) {
    return t;
  }
  _sliderPointerPosition(t) {
    return t.pageX;
  }
  _sliderOrthogonalPointerPosition(t) {
    return t.pageY;
  }
  _updateScrollbarSize(t) {
    this.slider.setHeight(t);
  }
  writeScrollPosition(t, e) {
    t.scrollLeft = e;
  }
  updateOptions(t) {
    this.updateScrollbarSize(t.horizontal === 2 ? 0 : t.horizontalScrollbarSize), this._scrollbarState.setOppositeScrollbarSize(t.vertical === 2 ? 0 : t.verticalScrollbarSize), this._visibilityController.setVisibility(t.horizontal), this._scrollByPage = t.scrollByPage;
  }
};
var Ur = class extends Ut {
  constructor(t, e, i8) {
    let r = t.getScrollDimensions(), n = t.getCurrentScrollPosition();
    if (super({ lazyRender: e.lazyRender, host: i8, scrollbarState: new Kt(e.verticalHasArrows ? e.arrowSize : 0, e.vertical === 2 ? 0 : e.verticalScrollbarSize, 0, r.height, r.scrollHeight, n.scrollTop), visibility: e.vertical, extraScrollbarClassName: "vertical", scrollable: t, scrollByPage: e.scrollByPage }), e.verticalHasArrows) throw new Error("horizontalHasArrows is not supported in xterm.js");
    this._createSlider(0, Math.floor((e.verticalScrollbarSize - e.verticalSliderSize) / 2), e.verticalSliderSize, void 0);
  }
  _updateSlider(t, e) {
    this.slider.setHeight(t), this.slider.setTop(e);
  }
  _renderDomNode(t, e) {
    this.domNode.setWidth(e), this.domNode.setHeight(t), this.domNode.setRight(0), this.domNode.setTop(0);
  }
  onDidScroll(t) {
    return this._shouldRender = this._onElementScrollSize(t.scrollHeight) || this._shouldRender, this._shouldRender = this._onElementScrollPosition(t.scrollTop) || this._shouldRender, this._shouldRender = this._onElementSize(t.height) || this._shouldRender, this._shouldRender;
  }
  _pointerDownRelativePosition(t, e) {
    return e;
  }
  _sliderPointerPosition(t) {
    return t.pageY;
  }
  _sliderOrthogonalPointerPosition(t) {
    return t.pageX;
  }
  _updateScrollbarSize(t) {
    this.slider.setWidth(t);
  }
  writeScrollPosition(t, e) {
    t.scrollTop = e;
  }
  updateOptions(t) {
    this.updateScrollbarSize(t.vertical === 2 ? 0 : t.verticalScrollbarSize), this._scrollbarState.setOppositeScrollbarSize(0), this._visibilityController.setVisibility(t.vertical), this._scrollByPage = t.scrollByPage;
  }
};
var Ma = 500;
var Ko = 50;
var zo = true;
var us = class {
  constructor(t, e, i8) {
    this.timestamp = t, this.deltaX = e, this.deltaY = i8, this.score = 0;
  }
};
var zr = class zr2 {
  constructor() {
    this._capacity = 5, this._memory = [], this._front = -1, this._rear = -1;
  }
  isPhysicalMouseWheel() {
    if (this._front === -1 && this._rear === -1) return false;
    let t = 1, e = 0, i8 = 1, r = this._rear;
    do {
      let n = r === this._front ? t : Math.pow(2, -i8);
      if (t -= n, e += this._memory[r].score * n, r === this._front) break;
      r = (this._capacity + r - 1) % this._capacity, i8++;
    } while (true);
    return e <= 0.5;
  }
  acceptStandardWheelEvent(t) {
    if (Ti) {
      let e = be(t.browserEvent), i8 = mo(e);
      this.accept(Date.now(), t.deltaX * i8, t.deltaY * i8);
    } else this.accept(Date.now(), t.deltaX, t.deltaY);
  }
  accept(t, e, i8) {
    let r = null, n = new us(t, e, i8);
    this._front === -1 && this._rear === -1 ? (this._memory[0] = n, this._front = 0, this._rear = 0) : (r = this._memory[this._rear], this._rear = (this._rear + 1) % this._capacity, this._rear === this._front && (this._front = (this._front + 1) % this._capacity), this._memory[this._rear] = n), n.score = this._computeScore(n, r);
  }
  _computeScore(t, e) {
    if (Math.abs(t.deltaX) > 0 && Math.abs(t.deltaY) > 0) return 1;
    let i8 = 0.5;
    if ((!this._isAlmostInt(t.deltaX) || !this._isAlmostInt(t.deltaY)) && (i8 += 0.25), e) {
      let r = Math.abs(t.deltaX), n = Math.abs(t.deltaY), o2 = Math.abs(e.deltaX), l = Math.abs(e.deltaY), a = Math.max(Math.min(r, o2), 1), u = Math.max(Math.min(n, l), 1), h2 = Math.max(r, o2), c = Math.max(n, l);
      h2 % a === 0 && c % u === 0 && (i8 -= 0.5);
    }
    return Math.min(Math.max(i8, 0), 1);
  }
  _isAlmostInt(t) {
    return Math.abs(Math.round(t) - t) < 0.01;
  }
};
zr.INSTANCE = new zr();
var hs = zr;
var ds = class extends lt {
  constructor(e, i8, r) {
    super();
    this._onScroll = this._register(new v());
    this.onScroll = this._onScroll.event;
    this._onWillScroll = this._register(new v());
    this.onWillScroll = this._onWillScroll.event;
    this._options = Pa(i8), this._scrollable = r, this._register(this._scrollable.onScroll((o2) => {
      this._onWillScroll.fire(o2), this._onDidScroll(o2), this._onScroll.fire(o2);
    }));
    let n = { onMouseWheel: (o2) => this._onMouseWheel(o2), onDragStart: () => this._onDragStart(), onDragEnd: () => this._onDragEnd() };
    this._verticalScrollbar = this._register(new Ur(this._scrollable, this._options, n)), this._horizontalScrollbar = this._register(new Wr(this._scrollable, this._options, n)), this._domNode = document.createElement("div"), this._domNode.className = "xterm-scrollable-element " + this._options.className, this._domNode.setAttribute("role", "presentation"), this._domNode.style.position = "relative", this._domNode.appendChild(e), this._domNode.appendChild(this._horizontalScrollbar.domNode.domNode), this._domNode.appendChild(this._verticalScrollbar.domNode.domNode), this._options.useShadows ? (this._leftShadowDomNode = _t(document.createElement("div")), this._leftShadowDomNode.setClassName("shadow"), this._domNode.appendChild(this._leftShadowDomNode.domNode), this._topShadowDomNode = _t(document.createElement("div")), this._topShadowDomNode.setClassName("shadow"), this._domNode.appendChild(this._topShadowDomNode.domNode), this._topLeftShadowDomNode = _t(document.createElement("div")), this._topLeftShadowDomNode.setClassName("shadow"), this._domNode.appendChild(this._topLeftShadowDomNode.domNode)) : (this._leftShadowDomNode = null, this._topShadowDomNode = null, this._topLeftShadowDomNode = null), this._listenOnDomNode = this._options.listenOnDomNode || this._domNode, this._mouseWheelToDispose = [], this._setListeningToMouseWheel(this._options.handleMouseWheel), this.onmouseover(this._listenOnDomNode, (o2) => this._onMouseOver(o2)), this.onmouseleave(this._listenOnDomNode, (o2) => this._onMouseLeave(o2)), this._hideTimeout = this._register(new Ye()), this._isDragging = false, this._mouseIsOver = false, this._shouldRender = true, this._revealOnScroll = true;
  }
  get options() {
    return this._options;
  }
  dispose() {
    this._mouseWheelToDispose = Ne(this._mouseWheelToDispose), super.dispose();
  }
  getDomNode() {
    return this._domNode;
  }
  getOverviewRulerLayoutInfo() {
    return { parent: this._domNode, insertBefore: this._verticalScrollbar.domNode.domNode };
  }
  delegateVerticalScrollbarPointerDown(e) {
    this._verticalScrollbar.delegatePointerDown(e);
  }
  getScrollDimensions() {
    return this._scrollable.getScrollDimensions();
  }
  setScrollDimensions(e) {
    this._scrollable.setScrollDimensions(e, false);
  }
  updateClassName(e) {
    this._options.className = e, Te && (this._options.className += " mac"), this._domNode.className = "xterm-scrollable-element " + this._options.className;
  }
  updateOptions(e) {
    typeof e.handleMouseWheel < "u" && (this._options.handleMouseWheel = e.handleMouseWheel, this._setListeningToMouseWheel(this._options.handleMouseWheel)), typeof e.mouseWheelScrollSensitivity < "u" && (this._options.mouseWheelScrollSensitivity = e.mouseWheelScrollSensitivity), typeof e.fastScrollSensitivity < "u" && (this._options.fastScrollSensitivity = e.fastScrollSensitivity), typeof e.scrollPredominantAxis < "u" && (this._options.scrollPredominantAxis = e.scrollPredominantAxis), typeof e.horizontal < "u" && (this._options.horizontal = e.horizontal), typeof e.vertical < "u" && (this._options.vertical = e.vertical), typeof e.horizontalScrollbarSize < "u" && (this._options.horizontalScrollbarSize = e.horizontalScrollbarSize), typeof e.verticalScrollbarSize < "u" && (this._options.verticalScrollbarSize = e.verticalScrollbarSize), typeof e.scrollByPage < "u" && (this._options.scrollByPage = e.scrollByPage), this._horizontalScrollbar.updateOptions(this._options), this._verticalScrollbar.updateOptions(this._options), this._options.lazyRender || this._render();
  }
  setRevealOnScroll(e) {
    this._revealOnScroll = e;
  }
  delegateScrollFromMouseWheelEvent(e) {
    this._onMouseWheel(new xi(e));
  }
  _setListeningToMouseWheel(e) {
    if (this._mouseWheelToDispose.length > 0 !== e && (this._mouseWheelToDispose = Ne(this._mouseWheelToDispose), e)) {
      let r = (n) => {
        this._onMouseWheel(new xi(n));
      };
      this._mouseWheelToDispose.push(L(this._listenOnDomNode, Y2.MOUSE_WHEEL, r, { passive: false }));
    }
  }
  _onMouseWheel(e) {
    if (e.browserEvent?.defaultPrevented) return;
    let i8 = hs.INSTANCE;
    zo && i8.acceptStandardWheelEvent(e);
    let r = false;
    if (e.deltaY || e.deltaX) {
      let o2 = e.deltaY * this._options.mouseWheelScrollSensitivity, l = e.deltaX * this._options.mouseWheelScrollSensitivity;
      this._options.scrollPredominantAxis && (this._options.scrollYToX && l + o2 === 0 ? l = o2 = 0 : Math.abs(o2) >= Math.abs(l) ? l = 0 : o2 = 0), this._options.flipAxes && ([o2, l] = [l, o2]);
      let a = !Te && e.browserEvent && e.browserEvent.shiftKey;
      (this._options.scrollYToX || a) && !l && (l = o2, o2 = 0), e.browserEvent && e.browserEvent.altKey && (l = l * this._options.fastScrollSensitivity, o2 = o2 * this._options.fastScrollSensitivity);
      let u = this._scrollable.getFutureScrollPosition(), h2 = {};
      if (o2) {
        let c = Ko * o2, d = u.scrollTop - (c < 0 ? Math.floor(c) : Math.ceil(c));
        this._verticalScrollbar.writeScrollPosition(h2, d);
      }
      if (l) {
        let c = Ko * l, d = u.scrollLeft - (c < 0 ? Math.floor(c) : Math.ceil(c));
        this._horizontalScrollbar.writeScrollPosition(h2, d);
      }
      h2 = this._scrollable.validateScrollPosition(h2), (u.scrollLeft !== h2.scrollLeft || u.scrollTop !== h2.scrollTop) && (zo && this._options.mouseWheelSmoothScroll && i8.isPhysicalMouseWheel() ? this._scrollable.setScrollPositionSmooth(h2) : this._scrollable.setScrollPositionNow(h2), r = true);
    }
    let n = r;
    !n && this._options.alwaysConsumeMouseWheel && (n = true), !n && this._options.consumeMouseWheelIfScrollbarIsNeeded && (this._verticalScrollbar.isNeeded() || this._horizontalScrollbar.isNeeded()) && (n = true), n && (e.preventDefault(), e.stopPropagation());
  }
  _onDidScroll(e) {
    this._shouldRender = this._horizontalScrollbar.onDidScroll(e) || this._shouldRender, this._shouldRender = this._verticalScrollbar.onDidScroll(e) || this._shouldRender, this._options.useShadows && (this._shouldRender = true), this._revealOnScroll && this._reveal(), this._options.lazyRender || this._render();
  }
  renderNow() {
    if (!this._options.lazyRender) throw new Error("Please use `lazyRender` together with `renderNow`!");
    this._render();
  }
  _render() {
    if (this._shouldRender && (this._shouldRender = false, this._horizontalScrollbar.render(), this._verticalScrollbar.render(), this._options.useShadows)) {
      let e = this._scrollable.getCurrentScrollPosition(), i8 = e.scrollTop > 0, r = e.scrollLeft > 0, n = r ? " left" : "", o2 = i8 ? " top" : "", l = r || i8 ? " top-left-corner" : "";
      this._leftShadowDomNode.setClassName(`shadow${n}`), this._topShadowDomNode.setClassName(`shadow${o2}`), this._topLeftShadowDomNode.setClassName(`shadow${l}${o2}${n}`);
    }
  }
  _onDragStart() {
    this._isDragging = true, this._reveal();
  }
  _onDragEnd() {
    this._isDragging = false, this._hide();
  }
  _onMouseLeave(e) {
    this._mouseIsOver = false, this._hide();
  }
  _onMouseOver(e) {
    this._mouseIsOver = true, this._reveal();
  }
  _reveal() {
    this._verticalScrollbar.beginReveal(), this._horizontalScrollbar.beginReveal(), this._scheduleHide();
  }
  _hide() {
    !this._mouseIsOver && !this._isDragging && (this._verticalScrollbar.beginHide(), this._horizontalScrollbar.beginHide());
  }
  _scheduleHide() {
    !this._mouseIsOver && !this._isDragging && this._hideTimeout.cancelAndSet(() => this._hide(), Ma);
  }
};
var Kr = class extends ds {
  constructor(t, e, i8) {
    super(t, e, i8);
  }
  setScrollPosition(t) {
    t.reuseAnimation ? this._scrollable.setScrollPositionSmooth(t, t.reuseAnimation) : this._scrollable.setScrollPositionNow(t);
  }
  getScrollPosition() {
    return this._scrollable.getCurrentScrollPosition();
  }
};
function Pa(s15) {
  let t = { lazyRender: typeof s15.lazyRender < "u" ? s15.lazyRender : false, className: typeof s15.className < "u" ? s15.className : "", useShadows: typeof s15.useShadows < "u" ? s15.useShadows : true, handleMouseWheel: typeof s15.handleMouseWheel < "u" ? s15.handleMouseWheel : true, flipAxes: typeof s15.flipAxes < "u" ? s15.flipAxes : false, consumeMouseWheelIfScrollbarIsNeeded: typeof s15.consumeMouseWheelIfScrollbarIsNeeded < "u" ? s15.consumeMouseWheelIfScrollbarIsNeeded : false, alwaysConsumeMouseWheel: typeof s15.alwaysConsumeMouseWheel < "u" ? s15.alwaysConsumeMouseWheel : false, scrollYToX: typeof s15.scrollYToX < "u" ? s15.scrollYToX : false, mouseWheelScrollSensitivity: typeof s15.mouseWheelScrollSensitivity < "u" ? s15.mouseWheelScrollSensitivity : 1, fastScrollSensitivity: typeof s15.fastScrollSensitivity < "u" ? s15.fastScrollSensitivity : 5, scrollPredominantAxis: typeof s15.scrollPredominantAxis < "u" ? s15.scrollPredominantAxis : true, mouseWheelSmoothScroll: typeof s15.mouseWheelSmoothScroll < "u" ? s15.mouseWheelSmoothScroll : true, arrowSize: typeof s15.arrowSize < "u" ? s15.arrowSize : 11, listenOnDomNode: typeof s15.listenOnDomNode < "u" ? s15.listenOnDomNode : null, horizontal: typeof s15.horizontal < "u" ? s15.horizontal : 1, horizontalScrollbarSize: typeof s15.horizontalScrollbarSize < "u" ? s15.horizontalScrollbarSize : 10, horizontalSliderSize: typeof s15.horizontalSliderSize < "u" ? s15.horizontalSliderSize : 0, horizontalHasArrows: typeof s15.horizontalHasArrows < "u" ? s15.horizontalHasArrows : false, vertical: typeof s15.vertical < "u" ? s15.vertical : 1, verticalScrollbarSize: typeof s15.verticalScrollbarSize < "u" ? s15.verticalScrollbarSize : 10, verticalHasArrows: typeof s15.verticalHasArrows < "u" ? s15.verticalHasArrows : false, verticalSliderSize: typeof s15.verticalSliderSize < "u" ? s15.verticalSliderSize : 0, scrollByPage: typeof s15.scrollByPage < "u" ? s15.scrollByPage : false };
  return t.horizontalSliderSize = typeof s15.horizontalSliderSize < "u" ? s15.horizontalSliderSize : t.horizontalScrollbarSize, t.verticalSliderSize = typeof s15.verticalSliderSize < "u" ? s15.verticalSliderSize : t.verticalScrollbarSize, Te && (t.className += " mac"), t;
}
var zt = class extends D2 {
  constructor(e, i8, r, n, o2, l, a, u) {
    super();
    this._bufferService = r;
    this._optionsService = a;
    this._renderService = u;
    this._onRequestScrollLines = this._register(new v());
    this.onRequestScrollLines = this._onRequestScrollLines.event;
    this._isSyncing = false;
    this._isHandlingScroll = false;
    this._suppressOnScrollHandler = false;
    let h2 = this._register(new Ri({ forceIntegerValues: false, smoothScrollDuration: this._optionsService.rawOptions.smoothScrollDuration, scheduleAtNextAnimationFrame: (c) => mt(n.window, c) }));
    this._register(this._optionsService.onSpecificOptionChange("smoothScrollDuration", () => {
      h2.setSmoothScrollDuration(this._optionsService.rawOptions.smoothScrollDuration);
    })), this._scrollableElement = this._register(new Kr(i8, { vertical: 1, horizontal: 2, useShadows: false, mouseWheelSmoothScroll: true, ...this._getChangeOptions() }, h2)), this._register(this._optionsService.onMultipleOptionChange(["scrollSensitivity", "fastScrollSensitivity", "overviewRuler"], () => this._scrollableElement.updateOptions(this._getChangeOptions()))), this._register(o2.onProtocolChange((c) => {
      this._scrollableElement.updateOptions({ handleMouseWheel: !(c & 16) });
    })), this._scrollableElement.setScrollDimensions({ height: 0, scrollHeight: 0 }), this._register($.runAndSubscribe(l.onChangeColors, () => {
      this._scrollableElement.getDomNode().style.backgroundColor = l.colors.background.css;
    })), e.appendChild(this._scrollableElement.getDomNode()), this._register(C(() => this._scrollableElement.getDomNode().remove())), this._styleElement = n.mainDocument.createElement("style"), i8.appendChild(this._styleElement), this._register(C(() => this._styleElement.remove())), this._register($.runAndSubscribe(l.onChangeColors, () => {
      this._styleElement.textContent = [".xterm .xterm-scrollable-element > .scrollbar > .slider {", `  background: ${l.colors.scrollbarSliderBackground.css};`, "}", ".xterm .xterm-scrollable-element > .scrollbar > .slider:hover {", `  background: ${l.colors.scrollbarSliderHoverBackground.css};`, "}", ".xterm .xterm-scrollable-element > .scrollbar > .slider.active {", `  background: ${l.colors.scrollbarSliderActiveBackground.css};`, "}"].join(`
`);
    })), this._register(this._bufferService.onResize(() => this.queueSync())), this._register(this._bufferService.buffers.onBufferActivate(() => {
      this._latestYDisp = void 0, this.queueSync();
    })), this._register(this._bufferService.onScroll(() => this._sync())), this._register(this._scrollableElement.onScroll((c) => this._handleScroll(c)));
  }
  scrollLines(e) {
    let i8 = this._scrollableElement.getScrollPosition();
    this._scrollableElement.setScrollPosition({ reuseAnimation: true, scrollTop: i8.scrollTop + e * this._renderService.dimensions.css.cell.height });
  }
  scrollToLine(e, i8) {
    i8 && (this._latestYDisp = e), this._scrollableElement.setScrollPosition({ reuseAnimation: !i8, scrollTop: e * this._renderService.dimensions.css.cell.height });
  }
  _getChangeOptions() {
    return { mouseWheelScrollSensitivity: this._optionsService.rawOptions.scrollSensitivity, fastScrollSensitivity: this._optionsService.rawOptions.fastScrollSensitivity, verticalScrollbarSize: this._optionsService.rawOptions.overviewRuler?.width || 14 };
  }
  queueSync(e) {
    e !== void 0 && (this._latestYDisp = e), this._queuedAnimationFrame === void 0 && (this._queuedAnimationFrame = this._renderService.addRefreshCallback(() => {
      this._queuedAnimationFrame = void 0, this._sync(this._latestYDisp);
    }));
  }
  _sync(e = this._bufferService.buffer.ydisp) {
    !this._renderService || this._isSyncing || (this._isSyncing = true, this._suppressOnScrollHandler = true, this._scrollableElement.setScrollDimensions({ height: this._renderService.dimensions.css.canvas.height, scrollHeight: this._renderService.dimensions.css.cell.height * this._bufferService.buffer.lines.length }), this._suppressOnScrollHandler = false, e !== this._latestYDisp && this._scrollableElement.setScrollPosition({ scrollTop: e * this._renderService.dimensions.css.cell.height }), this._isSyncing = false);
  }
  _handleScroll(e) {
    if (!this._renderService || this._isHandlingScroll || this._suppressOnScrollHandler) return;
    this._isHandlingScroll = true;
    let i8 = Math.round(e.scrollTop / this._renderService.dimensions.css.cell.height), r = i8 - this._bufferService.buffer.ydisp;
    r !== 0 && (this._latestYDisp = i8, this._onRequestScrollLines.fire(r)), this._isHandlingScroll = false;
  }
};
zt = M([S(2, F), S(3, ae), S(4, rr), S(5, Re), S(6, H), S(7, ce)], zt);
var Gt = class extends D2 {
  constructor(e, i8, r, n, o2) {
    super();
    this._screenElement = e;
    this._bufferService = i8;
    this._coreBrowserService = r;
    this._decorationService = n;
    this._renderService = o2;
    this._decorationElements = /* @__PURE__ */ new Map();
    this._altBufferIsActive = false;
    this._dimensionsChanged = false;
    this._container = document.createElement("div"), this._container.classList.add("xterm-decoration-container"), this._screenElement.appendChild(this._container), this._register(this._renderService.onRenderedViewportChange(() => this._doRefreshDecorations())), this._register(this._renderService.onDimensionsChange(() => {
      this._dimensionsChanged = true, this._queueRefresh();
    })), this._register(this._coreBrowserService.onDprChange(() => this._queueRefresh())), this._register(this._bufferService.buffers.onBufferActivate(() => {
      this._altBufferIsActive = this._bufferService.buffer === this._bufferService.buffers.alt;
    })), this._register(this._decorationService.onDecorationRegistered(() => this._queueRefresh())), this._register(this._decorationService.onDecorationRemoved((l) => this._removeDecoration(l))), this._register(C(() => {
      this._container.remove(), this._decorationElements.clear();
    }));
  }
  _queueRefresh() {
    this._animationFrame === void 0 && (this._animationFrame = this._renderService.addRefreshCallback(() => {
      this._doRefreshDecorations(), this._animationFrame = void 0;
    }));
  }
  _doRefreshDecorations() {
    for (let e of this._decorationService.decorations) this._renderDecoration(e);
    this._dimensionsChanged = false;
  }
  _renderDecoration(e) {
    this._refreshStyle(e), this._dimensionsChanged && this._refreshXPosition(e);
  }
  _createElement(e) {
    let i8 = this._coreBrowserService.mainDocument.createElement("div");
    i8.classList.add("xterm-decoration"), i8.classList.toggle("xterm-decoration-top-layer", e?.options?.layer === "top"), i8.style.width = `${Math.round((e.options.width || 1) * this._renderService.dimensions.css.cell.width)}px`, i8.style.height = `${(e.options.height || 1) * this._renderService.dimensions.css.cell.height}px`, i8.style.top = `${(e.marker.line - this._bufferService.buffers.active.ydisp) * this._renderService.dimensions.css.cell.height}px`, i8.style.lineHeight = `${this._renderService.dimensions.css.cell.height}px`;
    let r = e.options.x ?? 0;
    return r && r > this._bufferService.cols && (i8.style.display = "none"), this._refreshXPosition(e, i8), i8;
  }
  _refreshStyle(e) {
    let i8 = e.marker.line - this._bufferService.buffers.active.ydisp;
    if (i8 < 0 || i8 >= this._bufferService.rows) e.element && (e.element.style.display = "none", e.onRenderEmitter.fire(e.element));
    else {
      let r = this._decorationElements.get(e);
      r || (r = this._createElement(e), e.element = r, this._decorationElements.set(e, r), this._container.appendChild(r), e.onDispose(() => {
        this._decorationElements.delete(e), r.remove();
      })), r.style.display = this._altBufferIsActive ? "none" : "block", this._altBufferIsActive || (r.style.width = `${Math.round((e.options.width || 1) * this._renderService.dimensions.css.cell.width)}px`, r.style.height = `${(e.options.height || 1) * this._renderService.dimensions.css.cell.height}px`, r.style.top = `${i8 * this._renderService.dimensions.css.cell.height}px`, r.style.lineHeight = `${this._renderService.dimensions.css.cell.height}px`), e.onRenderEmitter.fire(r);
    }
  }
  _refreshXPosition(e, i8 = e.element) {
    if (!i8) return;
    let r = e.options.x ?? 0;
    (e.options.anchor || "left") === "right" ? i8.style.right = r ? `${r * this._renderService.dimensions.css.cell.width}px` : "" : i8.style.left = r ? `${r * this._renderService.dimensions.css.cell.width}px` : "";
  }
  _removeDecoration(e) {
    this._decorationElements.get(e)?.remove(), this._decorationElements.delete(e), e.dispose();
  }
};
Gt = M([S(1, F), S(2, ae), S(3, Be), S(4, ce)], Gt);
var Gr = class {
  constructor() {
    this._zones = [];
    this._zonePool = [];
    this._zonePoolIndex = 0;
    this._linePadding = { full: 0, left: 0, center: 0, right: 0 };
  }
  get zones() {
    return this._zonePool.length = Math.min(this._zonePool.length, this._zones.length), this._zones;
  }
  clear() {
    this._zones.length = 0, this._zonePoolIndex = 0;
  }
  addDecoration(t) {
    if (t.options.overviewRulerOptions) {
      for (let e of this._zones) if (e.color === t.options.overviewRulerOptions.color && e.position === t.options.overviewRulerOptions.position) {
        if (this._lineIntersectsZone(e, t.marker.line)) return;
        if (this._lineAdjacentToZone(e, t.marker.line, t.options.overviewRulerOptions.position)) {
          this._addLineToZone(e, t.marker.line);
          return;
        }
      }
      if (this._zonePoolIndex < this._zonePool.length) {
        this._zonePool[this._zonePoolIndex].color = t.options.overviewRulerOptions.color, this._zonePool[this._zonePoolIndex].position = t.options.overviewRulerOptions.position, this._zonePool[this._zonePoolIndex].startBufferLine = t.marker.line, this._zonePool[this._zonePoolIndex].endBufferLine = t.marker.line, this._zones.push(this._zonePool[this._zonePoolIndex++]);
        return;
      }
      this._zones.push({ color: t.options.overviewRulerOptions.color, position: t.options.overviewRulerOptions.position, startBufferLine: t.marker.line, endBufferLine: t.marker.line }), this._zonePool.push(this._zones[this._zones.length - 1]), this._zonePoolIndex++;
    }
  }
  setPadding(t) {
    this._linePadding = t;
  }
  _lineIntersectsZone(t, e) {
    return e >= t.startBufferLine && e <= t.endBufferLine;
  }
  _lineAdjacentToZone(t, e, i8) {
    return e >= t.startBufferLine - this._linePadding[i8 || "full"] && e <= t.endBufferLine + this._linePadding[i8 || "full"];
  }
  _addLineToZone(t, e) {
    t.startBufferLine = Math.min(t.startBufferLine, e), t.endBufferLine = Math.max(t.endBufferLine, e);
  }
};
var We = { full: 0, left: 0, center: 0, right: 0 };
var at = { full: 0, left: 0, center: 0, right: 0 };
var Li = { full: 0, left: 0, center: 0, right: 0 };
var bt = class extends D2 {
  constructor(e, i8, r, n, o2, l, a, u) {
    super();
    this._viewportElement = e;
    this._screenElement = i8;
    this._bufferService = r;
    this._decorationService = n;
    this._renderService = o2;
    this._optionsService = l;
    this._themeService = a;
    this._coreBrowserService = u;
    this._colorZoneStore = new Gr();
    this._shouldUpdateDimensions = true;
    this._shouldUpdateAnchor = true;
    this._lastKnownBufferLength = 0;
    this._canvas = this._coreBrowserService.mainDocument.createElement("canvas"), this._canvas.classList.add("xterm-decoration-overview-ruler"), this._refreshCanvasDimensions(), this._viewportElement.parentElement?.insertBefore(this._canvas, this._viewportElement), this._register(C(() => this._canvas?.remove()));
    let h2 = this._canvas.getContext("2d");
    if (h2) this._ctx = h2;
    else throw new Error("Ctx cannot be null");
    this._register(this._decorationService.onDecorationRegistered(() => this._queueRefresh(void 0, true))), this._register(this._decorationService.onDecorationRemoved(() => this._queueRefresh(void 0, true))), this._register(this._renderService.onRenderedViewportChange(() => this._queueRefresh())), this._register(this._bufferService.buffers.onBufferActivate(() => {
      this._canvas.style.display = this._bufferService.buffer === this._bufferService.buffers.alt ? "none" : "block";
    })), this._register(this._bufferService.onScroll(() => {
      this._lastKnownBufferLength !== this._bufferService.buffers.normal.lines.length && (this._refreshDrawHeightConstants(), this._refreshColorZonePadding());
    })), this._register(this._renderService.onRender(() => {
      (!this._containerHeight || this._containerHeight !== this._screenElement.clientHeight) && (this._queueRefresh(true), this._containerHeight = this._screenElement.clientHeight);
    })), this._register(this._coreBrowserService.onDprChange(() => this._queueRefresh(true))), this._register(this._optionsService.onSpecificOptionChange("overviewRuler", () => this._queueRefresh(true))), this._register(this._themeService.onChangeColors(() => this._queueRefresh())), this._queueRefresh(true);
  }
  get _width() {
    return this._optionsService.options.overviewRuler?.width || 0;
  }
  _refreshDrawConstants() {
    let e = Math.floor((this._canvas.width - 1) / 3), i8 = Math.ceil((this._canvas.width - 1) / 3);
    at.full = this._canvas.width, at.left = e, at.center = i8, at.right = e, this._refreshDrawHeightConstants(), Li.full = 1, Li.left = 1, Li.center = 1 + at.left, Li.right = 1 + at.left + at.center;
  }
  _refreshDrawHeightConstants() {
    We.full = Math.round(2 * this._coreBrowserService.dpr);
    let e = this._canvas.height / this._bufferService.buffer.lines.length, i8 = Math.round(Math.max(Math.min(e, 12), 6) * this._coreBrowserService.dpr);
    We.left = i8, We.center = i8, We.right = i8;
  }
  _refreshColorZonePadding() {
    this._colorZoneStore.setPadding({ full: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * We.full), left: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * We.left), center: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * We.center), right: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * We.right) }), this._lastKnownBufferLength = this._bufferService.buffers.normal.lines.length;
  }
  _refreshCanvasDimensions() {
    this._canvas.style.width = `${this._width}px`, this._canvas.width = Math.round(this._width * this._coreBrowserService.dpr), this._canvas.style.height = `${this._screenElement.clientHeight}px`, this._canvas.height = Math.round(this._screenElement.clientHeight * this._coreBrowserService.dpr), this._refreshDrawConstants(), this._refreshColorZonePadding();
  }
  _refreshDecorations() {
    this._shouldUpdateDimensions && this._refreshCanvasDimensions(), this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height), this._colorZoneStore.clear();
    for (let i8 of this._decorationService.decorations) this._colorZoneStore.addDecoration(i8);
    this._ctx.lineWidth = 1, this._renderRulerOutline();
    let e = this._colorZoneStore.zones;
    for (let i8 of e) i8.position !== "full" && this._renderColorZone(i8);
    for (let i8 of e) i8.position === "full" && this._renderColorZone(i8);
    this._shouldUpdateDimensions = false, this._shouldUpdateAnchor = false;
  }
  _renderRulerOutline() {
    this._ctx.fillStyle = this._themeService.colors.overviewRulerBorder.css, this._ctx.fillRect(0, 0, 1, this._canvas.height), this._optionsService.rawOptions.overviewRuler.showTopBorder && this._ctx.fillRect(1, 0, this._canvas.width - 1, 1), this._optionsService.rawOptions.overviewRuler.showBottomBorder && this._ctx.fillRect(1, this._canvas.height - 1, this._canvas.width - 1, this._canvas.height);
  }
  _renderColorZone(e) {
    this._ctx.fillStyle = e.color, this._ctx.fillRect(Li[e.position || "full"], Math.round((this._canvas.height - 1) * (e.startBufferLine / this._bufferService.buffers.active.lines.length) - We[e.position || "full"] / 2), at[e.position || "full"], Math.round((this._canvas.height - 1) * ((e.endBufferLine - e.startBufferLine) / this._bufferService.buffers.active.lines.length) + We[e.position || "full"]));
  }
  _queueRefresh(e, i8) {
    this._shouldUpdateDimensions = e || this._shouldUpdateDimensions, this._shouldUpdateAnchor = i8 || this._shouldUpdateAnchor, this._animationFrame === void 0 && (this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
      this._refreshDecorations(), this._animationFrame = void 0;
    }));
  }
};
bt = M([S(2, F), S(3, Be), S(4, ce), S(5, H), S(6, Re), S(7, ae)], bt);
var b;
((E) => (E.NUL = "\0", E.SOH = "", E.STX = "", E.ETX = "", E.EOT = "", E.ENQ = "", E.ACK = "", E.BEL = "\x07", E.BS = "\b", E.HT = "	", E.LF = `
`, E.VT = "\v", E.FF = "\f", E.CR = "\r", E.SO = "", E.SI = "", E.DLE = "", E.DC1 = "", E.DC2 = "", E.DC3 = "", E.DC4 = "", E.NAK = "", E.SYN = "", E.ETB = "", E.CAN = "", E.EM = "", E.SUB = "", E.ESC = "\x1B", E.FS = "", E.GS = "", E.RS = "", E.US = "", E.SP = " ", E.DEL = "\x7F"))(b || (b = {}));
var Ai;
((g) => (g.PAD = "\x80", g.HOP = "\x81", g.BPH = "\x82", g.NBH = "\x83", g.IND = "\x84", g.NEL = "\x85", g.SSA = "\x86", g.ESA = "\x87", g.HTS = "\x88", g.HTJ = "\x89", g.VTS = "\x8A", g.PLD = "\x8B", g.PLU = "\x8C", g.RI = "\x8D", g.SS2 = "\x8E", g.SS3 = "\x8F", g.DCS = "\x90", g.PU1 = "\x91", g.PU2 = "\x92", g.STS = "\x93", g.CCH = "\x94", g.MW = "\x95", g.SPA = "\x96", g.EPA = "\x97", g.SOS = "\x98", g.SGCI = "\x99", g.SCI = "\x9A", g.CSI = "\x9B", g.ST = "\x9C", g.OSC = "\x9D", g.PM = "\x9E", g.APC = "\x9F"))(Ai || (Ai = {}));
var fs;
((t) => t.ST = `${b.ESC}\\`)(fs || (fs = {}));
var $t = class {
  constructor(t, e, i8, r, n, o2) {
    this._textarea = t;
    this._compositionView = e;
    this._bufferService = i8;
    this._optionsService = r;
    this._coreService = n;
    this._renderService = o2;
    this._isComposing = false, this._isSendingComposition = false, this._compositionPosition = { start: 0, end: 0 }, this._dataAlreadySent = "";
  }
  get isComposing() {
    return this._isComposing;
  }
  compositionstart() {
    this._isComposing = true, this._compositionPosition.start = this._textarea.value.length, this._compositionView.textContent = "", this._dataAlreadySent = "", this._compositionView.classList.add("active");
  }
  compositionupdate(t) {
    this._compositionView.textContent = t.data, this.updateCompositionElements(), setTimeout(() => {
      this._compositionPosition.end = this._textarea.value.length;
    }, 0);
  }
  compositionend() {
    this._finalizeComposition(true);
  }
  keydown(t) {
    if (this._isComposing || this._isSendingComposition) {
      if (t.keyCode === 20 || t.keyCode === 229 || t.keyCode === 16 || t.keyCode === 17 || t.keyCode === 18) return false;
      this._finalizeComposition(false);
    }
    return t.keyCode === 229 ? (this._handleAnyTextareaChanges(), false) : true;
  }
  _finalizeComposition(t) {
    if (this._compositionView.classList.remove("active"), this._isComposing = false, t) {
      let e = { start: this._compositionPosition.start, end: this._compositionPosition.end };
      this._isSendingComposition = true, setTimeout(() => {
        if (this._isSendingComposition) {
          this._isSendingComposition = false;
          let i8;
          e.start += this._dataAlreadySent.length, this._isComposing ? i8 = this._textarea.value.substring(e.start, this._compositionPosition.start) : i8 = this._textarea.value.substring(e.start), i8.length > 0 && this._coreService.triggerDataEvent(i8, true);
        }
      }, 0);
    } else {
      this._isSendingComposition = false;
      let e = this._textarea.value.substring(this._compositionPosition.start, this._compositionPosition.end);
      this._coreService.triggerDataEvent(e, true);
    }
  }
  _handleAnyTextareaChanges() {
    let t = this._textarea.value;
    setTimeout(() => {
      if (!this._isComposing) {
        let e = this._textarea.value, i8 = e.replace(t, "");
        this._dataAlreadySent = i8, e.length > t.length ? this._coreService.triggerDataEvent(i8, true) : e.length < t.length ? this._coreService.triggerDataEvent(`${b.DEL}`, true) : e.length === t.length && e !== t && this._coreService.triggerDataEvent(e, true);
      }
    }, 0);
  }
  updateCompositionElements(t) {
    if (this._isComposing) {
      if (this._bufferService.buffer.isCursorInViewport) {
        let e = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1), i8 = this._renderService.dimensions.css.cell.height, r = this._bufferService.buffer.y * this._renderService.dimensions.css.cell.height, n = e * this._renderService.dimensions.css.cell.width;
        this._compositionView.style.left = n + "px", this._compositionView.style.top = r + "px", this._compositionView.style.height = i8 + "px", this._compositionView.style.lineHeight = i8 + "px", this._compositionView.style.fontFamily = this._optionsService.rawOptions.fontFamily, this._compositionView.style.fontSize = this._optionsService.rawOptions.fontSize + "px";
        let o2 = this._compositionView.getBoundingClientRect();
        this._textarea.style.left = n + "px", this._textarea.style.top = r + "px", this._textarea.style.width = Math.max(o2.width, 1) + "px", this._textarea.style.height = Math.max(o2.height, 1) + "px", this._textarea.style.lineHeight = o2.height + "px";
      }
      t || setTimeout(() => this.updateCompositionElements(true), 0);
    }
  }
};
$t = M([S(2, F), S(3, H), S(4, ge), S(5, ce)], $t);
var ue = 0;
var he = 0;
var de = 0;
var J = 0;
var ps = { css: "#00000000", rgba: 0 };
var j;
((i8) => {
  function s15(r, n, o2, l) {
    return l !== void 0 ? `#${vt(r)}${vt(n)}${vt(o2)}${vt(l)}` : `#${vt(r)}${vt(n)}${vt(o2)}`;
  }
  i8.toCss = s15;
  function t(r, n, o2, l = 255) {
    return (r << 24 | n << 16 | o2 << 8 | l) >>> 0;
  }
  i8.toRgba = t;
  function e(r, n, o2, l) {
    return { css: i8.toCss(r, n, o2, l), rgba: i8.toRgba(r, n, o2, l) };
  }
  i8.toColor = e;
})(j || (j = {}));
var U;
((l) => {
  function s15(a, u) {
    if (J = (u.rgba & 255) / 255, J === 1) return { css: u.css, rgba: u.rgba };
    let h2 = u.rgba >> 24 & 255, c = u.rgba >> 16 & 255, d = u.rgba >> 8 & 255, _2 = a.rgba >> 24 & 255, p = a.rgba >> 16 & 255, m = a.rgba >> 8 & 255;
    ue = _2 + Math.round((h2 - _2) * J), he = p + Math.round((c - p) * J), de = m + Math.round((d - m) * J);
    let f = j.toCss(ue, he, de), A = j.toRgba(ue, he, de);
    return { css: f, rgba: A };
  }
  l.blend = s15;
  function t(a) {
    return (a.rgba & 255) === 255;
  }
  l.isOpaque = t;
  function e(a, u, h2) {
    let c = $r.ensureContrastRatio(a.rgba, u.rgba, h2);
    if (c) return j.toColor(c >> 24 & 255, c >> 16 & 255, c >> 8 & 255);
  }
  l.ensureContrastRatio = e;
  function i8(a) {
    let u = (a.rgba | 255) >>> 0;
    return [ue, he, de] = $r.toChannels(u), { css: j.toCss(ue, he, de), rgba: u };
  }
  l.opaque = i8;
  function r(a, u) {
    return J = Math.round(u * 255), [ue, he, de] = $r.toChannels(a.rgba), { css: j.toCss(ue, he, de, J), rgba: j.toRgba(ue, he, de, J) };
  }
  l.opacity = r;
  function n(a, u) {
    return J = a.rgba & 255, r(a, J * u / 255);
  }
  l.multiplyOpacity = n;
  function o2(a) {
    return [a.rgba >> 24 & 255, a.rgba >> 16 & 255, a.rgba >> 8 & 255];
  }
  l.toColorRGB = o2;
})(U || (U = {}));
var z;
((i8) => {
  let s15, t;
  try {
    let r = document.createElement("canvas");
    r.width = 1, r.height = 1;
    let n = r.getContext("2d", { willReadFrequently: true });
    n && (s15 = n, s15.globalCompositeOperation = "copy", t = s15.createLinearGradient(0, 0, 1, 1));
  } catch {
  }
  function e(r) {
    if (r.match(/#[\da-f]{3,8}/i)) switch (r.length) {
      case 4:
        return ue = parseInt(r.slice(1, 2).repeat(2), 16), he = parseInt(r.slice(2, 3).repeat(2), 16), de = parseInt(r.slice(3, 4).repeat(2), 16), j.toColor(ue, he, de);
      case 5:
        return ue = parseInt(r.slice(1, 2).repeat(2), 16), he = parseInt(r.slice(2, 3).repeat(2), 16), de = parseInt(r.slice(3, 4).repeat(2), 16), J = parseInt(r.slice(4, 5).repeat(2), 16), j.toColor(ue, he, de, J);
      case 7:
        return { css: r, rgba: (parseInt(r.slice(1), 16) << 8 | 255) >>> 0 };
      case 9:
        return { css: r, rgba: parseInt(r.slice(1), 16) >>> 0 };
    }
    let n = r.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(0|1|\d?\.(\d+))\s*)?\)/);
    if (n) return ue = parseInt(n[1]), he = parseInt(n[2]), de = parseInt(n[3]), J = Math.round((n[5] === void 0 ? 1 : parseFloat(n[5])) * 255), j.toColor(ue, he, de, J);
    if (!s15 || !t) throw new Error("css.toColor: Unsupported css format");
    if (s15.fillStyle = t, s15.fillStyle = r, typeof s15.fillStyle != "string") throw new Error("css.toColor: Unsupported css format");
    if (s15.fillRect(0, 0, 1, 1), [ue, he, de, J] = s15.getImageData(0, 0, 1, 1).data, J !== 255) throw new Error("css.toColor: Unsupported css format");
    return { rgba: j.toRgba(ue, he, de, J), css: r };
  }
  i8.toColor = e;
})(z || (z = {}));
var ve;
((e) => {
  function s15(i8) {
    return t(i8 >> 16 & 255, i8 >> 8 & 255, i8 & 255);
  }
  e.relativeLuminance = s15;
  function t(i8, r, n) {
    let o2 = i8 / 255, l = r / 255, a = n / 255, u = o2 <= 0.03928 ? o2 / 12.92 : Math.pow((o2 + 0.055) / 1.055, 2.4), h2 = l <= 0.03928 ? l / 12.92 : Math.pow((l + 0.055) / 1.055, 2.4), c = a <= 0.03928 ? a / 12.92 : Math.pow((a + 0.055) / 1.055, 2.4);
    return u * 0.2126 + h2 * 0.7152 + c * 0.0722;
  }
  e.relativeLuminance2 = t;
})(ve || (ve = {}));
var $r;
((n) => {
  function s15(o2, l) {
    if (J = (l & 255) / 255, J === 1) return l;
    let a = l >> 24 & 255, u = l >> 16 & 255, h2 = l >> 8 & 255, c = o2 >> 24 & 255, d = o2 >> 16 & 255, _2 = o2 >> 8 & 255;
    return ue = c + Math.round((a - c) * J), he = d + Math.round((u - d) * J), de = _2 + Math.round((h2 - _2) * J), j.toRgba(ue, he, de);
  }
  n.blend = s15;
  function t(o2, l, a) {
    let u = ve.relativeLuminance(o2 >> 8), h2 = ve.relativeLuminance(l >> 8);
    if (Xe(u, h2) < a) {
      if (h2 < u) {
        let p = e(o2, l, a), m = Xe(u, ve.relativeLuminance(p >> 8));
        if (m < a) {
          let f = i8(o2, l, a), A = Xe(u, ve.relativeLuminance(f >> 8));
          return m > A ? p : f;
        }
        return p;
      }
      let d = i8(o2, l, a), _2 = Xe(u, ve.relativeLuminance(d >> 8));
      if (_2 < a) {
        let p = e(o2, l, a), m = Xe(u, ve.relativeLuminance(p >> 8));
        return _2 > m ? d : p;
      }
      return d;
    }
  }
  n.ensureContrastRatio = t;
  function e(o2, l, a) {
    let u = o2 >> 24 & 255, h2 = o2 >> 16 & 255, c = o2 >> 8 & 255, d = l >> 24 & 255, _2 = l >> 16 & 255, p = l >> 8 & 255, m = Xe(ve.relativeLuminance2(d, _2, p), ve.relativeLuminance2(u, h2, c));
    for (; m < a && (d > 0 || _2 > 0 || p > 0); ) d -= Math.max(0, Math.ceil(d * 0.1)), _2 -= Math.max(0, Math.ceil(_2 * 0.1)), p -= Math.max(0, Math.ceil(p * 0.1)), m = Xe(ve.relativeLuminance2(d, _2, p), ve.relativeLuminance2(u, h2, c));
    return (d << 24 | _2 << 16 | p << 8 | 255) >>> 0;
  }
  n.reduceLuminance = e;
  function i8(o2, l, a) {
    let u = o2 >> 24 & 255, h2 = o2 >> 16 & 255, c = o2 >> 8 & 255, d = l >> 24 & 255, _2 = l >> 16 & 255, p = l >> 8 & 255, m = Xe(ve.relativeLuminance2(d, _2, p), ve.relativeLuminance2(u, h2, c));
    for (; m < a && (d < 255 || _2 < 255 || p < 255); ) d = Math.min(255, d + Math.ceil((255 - d) * 0.1)), _2 = Math.min(255, _2 + Math.ceil((255 - _2) * 0.1)), p = Math.min(255, p + Math.ceil((255 - p) * 0.1)), m = Xe(ve.relativeLuminance2(d, _2, p), ve.relativeLuminance2(u, h2, c));
    return (d << 24 | _2 << 16 | p << 8 | 255) >>> 0;
  }
  n.increaseLuminance = i8;
  function r(o2) {
    return [o2 >> 24 & 255, o2 >> 16 & 255, o2 >> 8 & 255, o2 & 255];
  }
  n.toChannels = r;
})($r || ($r = {}));
function vt(s15) {
  let t = s15.toString(16);
  return t.length < 2 ? "0" + t : t;
}
function Xe(s15, t) {
  return s15 < t ? (t + 0.05) / (s15 + 0.05) : (s15 + 0.05) / (t + 0.05);
}
var Vr = class extends De {
  constructor(e, i8, r) {
    super();
    this.content = 0;
    this.combinedData = "";
    this.fg = e.fg, this.bg = e.bg, this.combinedData = i8, this._width = r;
  }
  isCombined() {
    return 2097152;
  }
  getWidth() {
    return this._width;
  }
  getChars() {
    return this.combinedData;
  }
  getCode() {
    return 2097151;
  }
  setFromCharData(e) {
    throw new Error("not implemented");
  }
  getAsCharData() {
    return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
  }
};
var ct = class {
  constructor(t) {
    this._bufferService = t;
    this._characterJoiners = [];
    this._nextCharacterJoinerId = 0;
    this._workCell = new q();
  }
  register(t) {
    let e = { id: this._nextCharacterJoinerId++, handler: t };
    return this._characterJoiners.push(e), e.id;
  }
  deregister(t) {
    for (let e = 0; e < this._characterJoiners.length; e++) if (this._characterJoiners[e].id === t) return this._characterJoiners.splice(e, 1), true;
    return false;
  }
  getJoinedCharacters(t) {
    if (this._characterJoiners.length === 0) return [];
    let e = this._bufferService.buffer.lines.get(t);
    if (!e || e.length === 0) return [];
    let i8 = [], r = e.translateToString(true), n = 0, o2 = 0, l = 0, a = e.getFg(0), u = e.getBg(0);
    for (let h2 = 0; h2 < e.getTrimmedLength(); h2++) if (e.loadCell(h2, this._workCell), this._workCell.getWidth() !== 0) {
      if (this._workCell.fg !== a || this._workCell.bg !== u) {
        if (h2 - n > 1) {
          let c = this._getJoinedRanges(r, l, o2, e, n);
          for (let d = 0; d < c.length; d++) i8.push(c[d]);
        }
        n = h2, l = o2, a = this._workCell.fg, u = this._workCell.bg;
      }
      o2 += this._workCell.getChars().length || we.length;
    }
    if (this._bufferService.cols - n > 1) {
      let h2 = this._getJoinedRanges(r, l, o2, e, n);
      for (let c = 0; c < h2.length; c++) i8.push(h2[c]);
    }
    return i8;
  }
  _getJoinedRanges(t, e, i8, r, n) {
    let o2 = t.substring(e, i8), l = [];
    try {
      l = this._characterJoiners[0].handler(o2);
    } catch (a) {
      console.error(a);
    }
    for (let a = 1; a < this._characterJoiners.length; a++) try {
      let u = this._characterJoiners[a].handler(o2);
      for (let h2 = 0; h2 < u.length; h2++) ct._mergeRanges(l, u[h2]);
    } catch (u) {
      console.error(u);
    }
    return this._stringRangesToCellRanges(l, r, n), l;
  }
  _stringRangesToCellRanges(t, e, i8) {
    let r = 0, n = false, o2 = 0, l = t[r];
    if (l) {
      for (let a = i8; a < this._bufferService.cols; a++) {
        let u = e.getWidth(a), h2 = e.getString(a).length || we.length;
        if (u !== 0) {
          if (!n && l[0] <= o2 && (l[0] = a, n = true), l[1] <= o2) {
            if (l[1] = a, l = t[++r], !l) break;
            l[0] <= o2 ? (l[0] = a, n = true) : n = false;
          }
          o2 += h2;
        }
      }
      l && (l[1] = this._bufferService.cols);
    }
  }
  static _mergeRanges(t, e) {
    let i8 = false;
    for (let r = 0; r < t.length; r++) {
      let n = t[r];
      if (i8) {
        if (e[1] <= n[0]) return t[r - 1][1] = e[1], t;
        if (e[1] <= n[1]) return t[r - 1][1] = Math.max(e[1], n[1]), t.splice(r, 1), t;
        t.splice(r, 1), r--;
      } else {
        if (e[1] <= n[0]) return t.splice(r, 0, e), t;
        if (e[1] <= n[1]) return n[0] = Math.min(e[0], n[0]), t;
        e[0] < n[1] && (n[0] = Math.min(e[0], n[0]), i8 = true);
        continue;
      }
    }
    return i8 ? t[t.length - 1][1] = e[1] : t.push(e), t;
  }
};
ct = M([S(0, F)], ct);
function Oa(s15) {
  return 57508 <= s15 && s15 <= 57558;
}
function Ba(s15) {
  return 9472 <= s15 && s15 <= 9631;
}
function $o(s15) {
  return Oa(s15) || Ba(s15);
}
function Vo() {
  return { css: { canvas: qr(), cell: qr() }, device: { canvas: qr(), cell: qr(), char: { width: 0, height: 0, left: 0, top: 0 } } };
}
function qr() {
  return { width: 0, height: 0 };
}
var Vt = class {
  constructor(t, e, i8, r, n, o2, l) {
    this._document = t;
    this._characterJoinerService = e;
    this._optionsService = i8;
    this._coreBrowserService = r;
    this._coreService = n;
    this._decorationService = o2;
    this._themeService = l;
    this._workCell = new q();
    this._columnSelectMode = false;
    this.defaultSpacing = 0;
  }
  handleSelectionChanged(t, e, i8) {
    this._selectionStart = t, this._selectionEnd = e, this._columnSelectMode = i8;
  }
  createRow(t, e, i8, r, n, o2, l, a, u, h2, c) {
    let d = [], _2 = this._characterJoinerService.getJoinedCharacters(e), p = this._themeService.colors, m = t.getNoBgTrimmedLength();
    i8 && m < o2 + 1 && (m = o2 + 1);
    let f, A = 0, R2 = "", O2 = 0, I = 0, k2 = 0, P = 0, oe = false, Me2 = 0, Pe2 = false, Ke = 0, di = 0, V2 = [], Qe2 = h2 !== -1 && c !== -1;
    for (let y = 0; y < m; y++) {
      t.loadCell(y, this._workCell);
      let T = this._workCell.getWidth();
      if (T === 0) continue;
      let g = false, w = y >= di, E = y, x = this._workCell;
      if (_2.length > 0 && y === _2[0][0] && w) {
        let W2 = _2.shift(), An2 = this._isCellInSelection(W2[0], e);
        for (O2 = W2[0] + 1; O2 < W2[1]; O2++) w && (w = An2 === this._isCellInSelection(O2, e));
        w && (w = !i8 || o2 < W2[0] || o2 >= W2[1]), w ? (g = true, x = new Vr(this._workCell, t.translateToString(true, W2[0], W2[1]), W2[1] - W2[0]), E = W2[1] - 1, T = x.getWidth()) : di = W2[1];
      }
      let N2 = this._isCellInSelection(y, e), Z2 = i8 && y === o2, te2 = Qe2 && y >= h2 && y <= c, Oe2 = false;
      this._decorationService.forEachDecorationAtCell(y, e, void 0, (W2) => {
        Oe2 = true;
      });
      let ze2 = x.getChars() || we;
      if (ze2 === " " && (x.isUnderline() || x.isOverline()) && (ze2 = "\xA0"), Ke = T * a - u.get(ze2, x.isBold(), x.isItalic()), !f) f = this._document.createElement("span");
      else if (A && (N2 && Pe2 || !N2 && !Pe2 && x.bg === I) && (N2 && Pe2 && p.selectionForeground || x.fg === k2) && x.extended.ext === P && te2 === oe && Ke === Me2 && !Z2 && !g && !Oe2 && w) {
        x.isInvisible() ? R2 += we : R2 += ze2, A++;
        continue;
      } else A && (f.textContent = R2), f = this._document.createElement("span"), A = 0, R2 = "";
      if (I = x.bg, k2 = x.fg, P = x.extended.ext, oe = te2, Me2 = Ke, Pe2 = N2, g && o2 >= y && o2 <= E && (o2 = y), !this._coreService.isCursorHidden && Z2 && this._coreService.isCursorInitialized) {
        if (V2.push("xterm-cursor"), this._coreBrowserService.isFocused) l && V2.push("xterm-cursor-blink"), V2.push(r === "bar" ? "xterm-cursor-bar" : r === "underline" ? "xterm-cursor-underline" : "xterm-cursor-block");
        else if (n) switch (n) {
          case "outline":
            V2.push("xterm-cursor-outline");
            break;
          case "block":
            V2.push("xterm-cursor-block");
            break;
          case "bar":
            V2.push("xterm-cursor-bar");
            break;
          case "underline":
            V2.push("xterm-cursor-underline");
            break;
          default:
            break;
        }
      }
      if (x.isBold() && V2.push("xterm-bold"), x.isItalic() && V2.push("xterm-italic"), x.isDim() && V2.push("xterm-dim"), x.isInvisible() ? R2 = we : R2 = x.getChars() || we, x.isUnderline() && (V2.push(`xterm-underline-${x.extended.underlineStyle}`), R2 === " " && (R2 = "\xA0"), !x.isUnderlineColorDefault())) if (x.isUnderlineColorRGB()) f.style.textDecorationColor = `rgb(${De.toColorRGB(x.getUnderlineColor()).join(",")})`;
      else {
        let W2 = x.getUnderlineColor();
        this._optionsService.rawOptions.drawBoldTextInBrightColors && x.isBold() && W2 < 8 && (W2 += 8), f.style.textDecorationColor = p.ansi[W2].css;
      }
      x.isOverline() && (V2.push("xterm-overline"), R2 === " " && (R2 = "\xA0")), x.isStrikethrough() && V2.push("xterm-strikethrough"), te2 && (f.style.textDecoration = "underline");
      let le2 = x.getFgColor(), et2 = x.getFgColorMode(), me2 = x.getBgColor(), ht2 = x.getBgColorMode(), fi2 = !!x.isInverse();
      if (fi2) {
        let W2 = le2;
        le2 = me2, me2 = W2;
        let An2 = et2;
        et2 = ht2, ht2 = An2;
      }
      let tt2, Qi2, pi2 = false;
      this._decorationService.forEachDecorationAtCell(y, e, void 0, (W2) => {
        W2.options.layer !== "top" && pi2 || (W2.backgroundColorRGB && (ht2 = 50331648, me2 = W2.backgroundColorRGB.rgba >> 8 & 16777215, tt2 = W2.backgroundColorRGB), W2.foregroundColorRGB && (et2 = 50331648, le2 = W2.foregroundColorRGB.rgba >> 8 & 16777215, Qi2 = W2.foregroundColorRGB), pi2 = W2.options.layer === "top");
      }), !pi2 && N2 && (tt2 = this._coreBrowserService.isFocused ? p.selectionBackgroundOpaque : p.selectionInactiveBackgroundOpaque, me2 = tt2.rgba >> 8 & 16777215, ht2 = 50331648, pi2 = true, p.selectionForeground && (et2 = 50331648, le2 = p.selectionForeground.rgba >> 8 & 16777215, Qi2 = p.selectionForeground)), pi2 && V2.push("xterm-decoration-top");
      let it2;
      switch (ht2) {
        case 16777216:
        case 33554432:
          it2 = p.ansi[me2], V2.push(`xterm-bg-${me2}`);
          break;
        case 50331648:
          it2 = j.toColor(me2 >> 16, me2 >> 8 & 255, me2 & 255), this._addStyle(f, `background-color:#${qo((me2 >>> 0).toString(16), "0", 6)}`);
          break;
        case 0:
        default:
          fi2 ? (it2 = p.foreground, V2.push(`xterm-bg-${257}`)) : it2 = p.background;
      }
      switch (tt2 || x.isDim() && (tt2 = U.multiplyOpacity(it2, 0.5)), et2) {
        case 16777216:
        case 33554432:
          x.isBold() && le2 < 8 && this._optionsService.rawOptions.drawBoldTextInBrightColors && (le2 += 8), this._applyMinimumContrast(f, it2, p.ansi[le2], x, tt2, void 0) || V2.push(`xterm-fg-${le2}`);
          break;
        case 50331648:
          let W2 = j.toColor(le2 >> 16 & 255, le2 >> 8 & 255, le2 & 255);
          this._applyMinimumContrast(f, it2, W2, x, tt2, Qi2) || this._addStyle(f, `color:#${qo(le2.toString(16), "0", 6)}`);
          break;
        case 0:
        default:
          this._applyMinimumContrast(f, it2, p.foreground, x, tt2, Qi2) || fi2 && V2.push(`xterm-fg-${257}`);
      }
      V2.length && (f.className = V2.join(" "), V2.length = 0), !Z2 && !g && !Oe2 && w ? A++ : f.textContent = R2, Ke !== this.defaultSpacing && (f.style.letterSpacing = `${Ke}px`), d.push(f), y = E;
    }
    return f && A && (f.textContent = R2), d;
  }
  _applyMinimumContrast(t, e, i8, r, n, o2) {
    if (this._optionsService.rawOptions.minimumContrastRatio === 1 || $o(r.getCode())) return false;
    let l = this._getContrastCache(r), a;
    if (!n && !o2 && (a = l.getColor(e.rgba, i8.rgba)), a === void 0) {
      let u = this._optionsService.rawOptions.minimumContrastRatio / (r.isDim() ? 2 : 1);
      a = U.ensureContrastRatio(n || e, o2 || i8, u), l.setColor((n || e).rgba, (o2 || i8).rgba, a ?? null);
    }
    return a ? (this._addStyle(t, `color:${a.css}`), true) : false;
  }
  _getContrastCache(t) {
    return t.isDim() ? this._themeService.colors.halfContrastCache : this._themeService.colors.contrastCache;
  }
  _addStyle(t, e) {
    t.setAttribute("style", `${t.getAttribute("style") || ""}${e};`);
  }
  _isCellInSelection(t, e) {
    let i8 = this._selectionStart, r = this._selectionEnd;
    return !i8 || !r ? false : this._columnSelectMode ? i8[0] <= r[0] ? t >= i8[0] && e >= i8[1] && t < r[0] && e <= r[1] : t < i8[0] && e >= i8[1] && t >= r[0] && e <= r[1] : e > i8[1] && e < r[1] || i8[1] === r[1] && e === i8[1] && t >= i8[0] && t < r[0] || i8[1] < r[1] && e === r[1] && t < r[0] || i8[1] < r[1] && e === i8[1] && t >= i8[0];
  }
};
Vt = M([S(1, or), S(2, H), S(3, ae), S(4, ge), S(5, Be), S(6, Re)], Vt);
function qo(s15, t, e) {
  for (; s15.length < e; ) s15 = t + s15;
  return s15;
}
var Yr = class {
  constructor(t, e) {
    this._flat = new Float32Array(256);
    this._font = "";
    this._fontSize = 0;
    this._weight = "normal";
    this._weightBold = "bold";
    this._measureElements = [];
    this._container = t.createElement("div"), this._container.classList.add("xterm-width-cache-measure-container"), this._container.setAttribute("aria-hidden", "true"), this._container.style.whiteSpace = "pre", this._container.style.fontKerning = "none";
    let i8 = t.createElement("span");
    i8.classList.add("xterm-char-measure-element");
    let r = t.createElement("span");
    r.classList.add("xterm-char-measure-element"), r.style.fontWeight = "bold";
    let n = t.createElement("span");
    n.classList.add("xterm-char-measure-element"), n.style.fontStyle = "italic";
    let o2 = t.createElement("span");
    o2.classList.add("xterm-char-measure-element"), o2.style.fontWeight = "bold", o2.style.fontStyle = "italic", this._measureElements = [i8, r, n, o2], this._container.appendChild(i8), this._container.appendChild(r), this._container.appendChild(n), this._container.appendChild(o2), e.appendChild(this._container), this.clear();
  }
  dispose() {
    this._container.remove(), this._measureElements.length = 0, this._holey = void 0;
  }
  clear() {
    this._flat.fill(-9999), this._holey = /* @__PURE__ */ new Map();
  }
  setFont(t, e, i8, r) {
    t === this._font && e === this._fontSize && i8 === this._weight && r === this._weightBold || (this._font = t, this._fontSize = e, this._weight = i8, this._weightBold = r, this._container.style.fontFamily = this._font, this._container.style.fontSize = `${this._fontSize}px`, this._measureElements[0].style.fontWeight = `${i8}`, this._measureElements[1].style.fontWeight = `${r}`, this._measureElements[2].style.fontWeight = `${i8}`, this._measureElements[3].style.fontWeight = `${r}`, this.clear());
  }
  get(t, e, i8) {
    let r = 0;
    if (!e && !i8 && t.length === 1 && (r = t.charCodeAt(0)) < 256) {
      if (this._flat[r] !== -9999) return this._flat[r];
      let l = this._measure(t, 0);
      return l > 0 && (this._flat[r] = l), l;
    }
    let n = t;
    e && (n += "B"), i8 && (n += "I");
    let o2 = this._holey.get(n);
    if (o2 === void 0) {
      let l = 0;
      e && (l |= 1), i8 && (l |= 2), o2 = this._measure(t, l), o2 > 0 && this._holey.set(n, o2);
    }
    return o2;
  }
  _measure(t, e) {
    let i8 = this._measureElements[e];
    return i8.textContent = t.repeat(32), i8.offsetWidth / 32;
  }
};
var ms = class {
  constructor() {
    this.clear();
  }
  clear() {
    this.hasSelection = false, this.columnSelectMode = false, this.viewportStartRow = 0, this.viewportEndRow = 0, this.viewportCappedStartRow = 0, this.viewportCappedEndRow = 0, this.startCol = 0, this.endCol = 0, this.selectionStart = void 0, this.selectionEnd = void 0;
  }
  update(t, e, i8, r = false) {
    if (this.selectionStart = e, this.selectionEnd = i8, !e || !i8 || e[0] === i8[0] && e[1] === i8[1]) {
      this.clear();
      return;
    }
    let n = t.buffers.active.ydisp, o2 = e[1] - n, l = i8[1] - n, a = Math.max(o2, 0), u = Math.min(l, t.rows - 1);
    if (a >= t.rows || u < 0) {
      this.clear();
      return;
    }
    this.hasSelection = true, this.columnSelectMode = r, this.viewportStartRow = o2, this.viewportEndRow = l, this.viewportCappedStartRow = a, this.viewportCappedEndRow = u, this.startCol = e[0], this.endCol = i8[0];
  }
  isCellSelected(t, e, i8) {
    return this.hasSelection ? (i8 -= t.buffer.active.viewportY, this.columnSelectMode ? this.startCol <= this.endCol ? e >= this.startCol && i8 >= this.viewportCappedStartRow && e < this.endCol && i8 <= this.viewportCappedEndRow : e < this.startCol && i8 >= this.viewportCappedStartRow && e >= this.endCol && i8 <= this.viewportCappedEndRow : i8 > this.viewportStartRow && i8 < this.viewportEndRow || this.viewportStartRow === this.viewportEndRow && i8 === this.viewportStartRow && e >= this.startCol && e < this.endCol || this.viewportStartRow < this.viewportEndRow && i8 === this.viewportEndRow && e < this.endCol || this.viewportStartRow < this.viewportEndRow && i8 === this.viewportStartRow && e >= this.startCol) : false;
  }
};
function Yo() {
  return new ms();
}
var _s = "xterm-dom-renderer-owner-";
var Le = "xterm-rows";
var jr = "xterm-fg-";
var jo = "xterm-bg-";
var ki = "xterm-focus";
var Xr = "xterm-selection";
var Na = 1;
var Yt = class extends D2 {
  constructor(e, i8, r, n, o2, l, a, u, h2, c, d, _2, p, m) {
    super();
    this._terminal = e;
    this._document = i8;
    this._element = r;
    this._screenElement = n;
    this._viewportElement = o2;
    this._helperContainer = l;
    this._linkifier2 = a;
    this._charSizeService = h2;
    this._optionsService = c;
    this._bufferService = d;
    this._coreService = _2;
    this._coreBrowserService = p;
    this._themeService = m;
    this._terminalClass = Na++;
    this._rowElements = [];
    this._selectionRenderModel = Yo();
    this.onRequestRedraw = this._register(new v()).event;
    this._rowContainer = this._document.createElement("div"), this._rowContainer.classList.add(Le), this._rowContainer.style.lineHeight = "normal", this._rowContainer.setAttribute("aria-hidden", "true"), this._refreshRowElements(this._bufferService.cols, this._bufferService.rows), this._selectionContainer = this._document.createElement("div"), this._selectionContainer.classList.add(Xr), this._selectionContainer.setAttribute("aria-hidden", "true"), this.dimensions = Vo(), this._updateDimensions(), this._register(this._optionsService.onOptionChange(() => this._handleOptionsChanged())), this._register(this._themeService.onChangeColors((f) => this._injectCss(f))), this._injectCss(this._themeService.colors), this._rowFactory = u.createInstance(Vt, document), this._element.classList.add(_s + this._terminalClass), this._screenElement.appendChild(this._rowContainer), this._screenElement.appendChild(this._selectionContainer), this._register(this._linkifier2.onShowLinkUnderline((f) => this._handleLinkHover(f))), this._register(this._linkifier2.onHideLinkUnderline((f) => this._handleLinkLeave(f))), this._register(C(() => {
      this._element.classList.remove(_s + this._terminalClass), this._rowContainer.remove(), this._selectionContainer.remove(), this._widthCache.dispose(), this._themeStyleElement.remove(), this._dimensionsStyleElement.remove();
    })), this._widthCache = new Yr(this._document, this._helperContainer), this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold), this._setDefaultSpacing();
  }
  _updateDimensions() {
    let e = this._coreBrowserService.dpr;
    this.dimensions.device.char.width = this._charSizeService.width * e, this.dimensions.device.char.height = Math.ceil(this._charSizeService.height * e), this.dimensions.device.cell.width = this.dimensions.device.char.width + Math.round(this._optionsService.rawOptions.letterSpacing), this.dimensions.device.cell.height = Math.floor(this.dimensions.device.char.height * this._optionsService.rawOptions.lineHeight), this.dimensions.device.char.left = 0, this.dimensions.device.char.top = 0, this.dimensions.device.canvas.width = this.dimensions.device.cell.width * this._bufferService.cols, this.dimensions.device.canvas.height = this.dimensions.device.cell.height * this._bufferService.rows, this.dimensions.css.canvas.width = Math.round(this.dimensions.device.canvas.width / e), this.dimensions.css.canvas.height = Math.round(this.dimensions.device.canvas.height / e), this.dimensions.css.cell.width = this.dimensions.css.canvas.width / this._bufferService.cols, this.dimensions.css.cell.height = this.dimensions.css.canvas.height / this._bufferService.rows;
    for (let r of this._rowElements) r.style.width = `${this.dimensions.css.canvas.width}px`, r.style.height = `${this.dimensions.css.cell.height}px`, r.style.lineHeight = `${this.dimensions.css.cell.height}px`, r.style.overflow = "hidden";
    this._dimensionsStyleElement || (this._dimensionsStyleElement = this._document.createElement("style"), this._screenElement.appendChild(this._dimensionsStyleElement));
    let i8 = `${this._terminalSelector} .${Le} span { display: inline-block; height: 100%; vertical-align: top;}`;
    this._dimensionsStyleElement.textContent = i8, this._selectionContainer.style.height = this._viewportElement.style.height, this._screenElement.style.width = `${this.dimensions.css.canvas.width}px`, this._screenElement.style.height = `${this.dimensions.css.canvas.height}px`;
  }
  _injectCss(e) {
    this._themeStyleElement || (this._themeStyleElement = this._document.createElement("style"), this._screenElement.appendChild(this._themeStyleElement));
    let i8 = `${this._terminalSelector} .${Le} { pointer-events: none; color: ${e.foreground.css}; font-family: ${this._optionsService.rawOptions.fontFamily}; font-size: ${this._optionsService.rawOptions.fontSize}px; font-kerning: none; white-space: pre}`;
    i8 += `${this._terminalSelector} .${Le} .xterm-dim { color: ${U.multiplyOpacity(e.foreground, 0.5).css};}`, i8 += `${this._terminalSelector} span:not(.xterm-bold) { font-weight: ${this._optionsService.rawOptions.fontWeight};}${this._terminalSelector} span.xterm-bold { font-weight: ${this._optionsService.rawOptions.fontWeightBold};}${this._terminalSelector} span.xterm-italic { font-style: italic;}`;
    let r = `blink_underline_${this._terminalClass}`, n = `blink_bar_${this._terminalClass}`, o2 = `blink_block_${this._terminalClass}`;
    i8 += `@keyframes ${r} { 50% {  border-bottom-style: hidden; }}`, i8 += `@keyframes ${n} { 50% {  box-shadow: none; }}`, i8 += `@keyframes ${o2} { 0% {  background-color: ${e.cursor.css};  color: ${e.cursorAccent.css}; } 50% {  background-color: inherit;  color: ${e.cursor.css}; }}`, i8 += `${this._terminalSelector} .${Le}.${ki} .xterm-cursor.xterm-cursor-blink.xterm-cursor-underline { animation: ${r} 1s step-end infinite;}${this._terminalSelector} .${Le}.${ki} .xterm-cursor.xterm-cursor-blink.xterm-cursor-bar { animation: ${n} 1s step-end infinite;}${this._terminalSelector} .${Le}.${ki} .xterm-cursor.xterm-cursor-blink.xterm-cursor-block { animation: ${o2} 1s step-end infinite;}${this._terminalSelector} .${Le} .xterm-cursor.xterm-cursor-block { background-color: ${e.cursor.css}; color: ${e.cursorAccent.css};}${this._terminalSelector} .${Le} .xterm-cursor.xterm-cursor-block:not(.xterm-cursor-blink) { background-color: ${e.cursor.css} !important; color: ${e.cursorAccent.css} !important;}${this._terminalSelector} .${Le} .xterm-cursor.xterm-cursor-outline { outline: 1px solid ${e.cursor.css}; outline-offset: -1px;}${this._terminalSelector} .${Le} .xterm-cursor.xterm-cursor-bar { box-shadow: ${this._optionsService.rawOptions.cursorWidth}px 0 0 ${e.cursor.css} inset;}${this._terminalSelector} .${Le} .xterm-cursor.xterm-cursor-underline { border-bottom: 1px ${e.cursor.css}; border-bottom-style: solid; height: calc(100% - 1px);}`, i8 += `${this._terminalSelector} .${Xr} { position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none;}${this._terminalSelector}.focus .${Xr} div { position: absolute; background-color: ${e.selectionBackgroundOpaque.css};}${this._terminalSelector} .${Xr} div { position: absolute; background-color: ${e.selectionInactiveBackgroundOpaque.css};}`;
    for (let [l, a] of e.ansi.entries()) i8 += `${this._terminalSelector} .${jr}${l} { color: ${a.css}; }${this._terminalSelector} .${jr}${l}.xterm-dim { color: ${U.multiplyOpacity(a, 0.5).css}; }${this._terminalSelector} .${jo}${l} { background-color: ${a.css}; }`;
    i8 += `${this._terminalSelector} .${jr}${257} { color: ${U.opaque(e.background).css}; }${this._terminalSelector} .${jr}${257}.xterm-dim { color: ${U.multiplyOpacity(U.opaque(e.background), 0.5).css}; }${this._terminalSelector} .${jo}${257} { background-color: ${e.foreground.css}; }`, this._themeStyleElement.textContent = i8;
  }
  _setDefaultSpacing() {
    let e = this.dimensions.css.cell.width - this._widthCache.get("W", false, false);
    this._rowContainer.style.letterSpacing = `${e}px`, this._rowFactory.defaultSpacing = e;
  }
  handleDevicePixelRatioChange() {
    this._updateDimensions(), this._widthCache.clear(), this._setDefaultSpacing();
  }
  _refreshRowElements(e, i8) {
    for (let r = this._rowElements.length; r <= i8; r++) {
      let n = this._document.createElement("div");
      this._rowContainer.appendChild(n), this._rowElements.push(n);
    }
    for (; this._rowElements.length > i8; ) this._rowContainer.removeChild(this._rowElements.pop());
  }
  handleResize(e, i8) {
    this._refreshRowElements(e, i8), this._updateDimensions(), this.handleSelectionChanged(this._selectionRenderModel.selectionStart, this._selectionRenderModel.selectionEnd, this._selectionRenderModel.columnSelectMode);
  }
  handleCharSizeChanged() {
    this._updateDimensions(), this._widthCache.clear(), this._setDefaultSpacing();
  }
  handleBlur() {
    this._rowContainer.classList.remove(ki), this.renderRows(0, this._bufferService.rows - 1);
  }
  handleFocus() {
    this._rowContainer.classList.add(ki), this.renderRows(this._bufferService.buffer.y, this._bufferService.buffer.y);
  }
  handleSelectionChanged(e, i8, r) {
    if (this._selectionContainer.replaceChildren(), this._rowFactory.handleSelectionChanged(e, i8, r), this.renderRows(0, this._bufferService.rows - 1), !e || !i8 || (this._selectionRenderModel.update(this._terminal, e, i8, r), !this._selectionRenderModel.hasSelection)) return;
    let n = this._selectionRenderModel.viewportStartRow, o2 = this._selectionRenderModel.viewportEndRow, l = this._selectionRenderModel.viewportCappedStartRow, a = this._selectionRenderModel.viewportCappedEndRow, u = this._document.createDocumentFragment();
    if (r) {
      let h2 = e[0] > i8[0];
      u.appendChild(this._createSelectionElement(l, h2 ? i8[0] : e[0], h2 ? e[0] : i8[0], a - l + 1));
    } else {
      let h2 = n === l ? e[0] : 0, c = l === o2 ? i8[0] : this._bufferService.cols;
      u.appendChild(this._createSelectionElement(l, h2, c));
      let d = a - l - 1;
      if (u.appendChild(this._createSelectionElement(l + 1, 0, this._bufferService.cols, d)), l !== a) {
        let _2 = o2 === a ? i8[0] : this._bufferService.cols;
        u.appendChild(this._createSelectionElement(a, 0, _2));
      }
    }
    this._selectionContainer.appendChild(u);
  }
  _createSelectionElement(e, i8, r, n = 1) {
    let o2 = this._document.createElement("div"), l = i8 * this.dimensions.css.cell.width, a = this.dimensions.css.cell.width * (r - i8);
    return l + a > this.dimensions.css.canvas.width && (a = this.dimensions.css.canvas.width - l), o2.style.height = `${n * this.dimensions.css.cell.height}px`, o2.style.top = `${e * this.dimensions.css.cell.height}px`, o2.style.left = `${l}px`, o2.style.width = `${a}px`, o2;
  }
  handleCursorMove() {
  }
  _handleOptionsChanged() {
    this._updateDimensions(), this._injectCss(this._themeService.colors), this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold), this._setDefaultSpacing();
  }
  clear() {
    for (let e of this._rowElements) e.replaceChildren();
  }
  renderRows(e, i8) {
    let r = this._bufferService.buffer, n = r.ybase + r.y, o2 = Math.min(r.x, this._bufferService.cols - 1), l = this._coreService.decPrivateModes.cursorBlink ?? this._optionsService.rawOptions.cursorBlink, a = this._coreService.decPrivateModes.cursorStyle ?? this._optionsService.rawOptions.cursorStyle, u = this._optionsService.rawOptions.cursorInactiveStyle;
    for (let h2 = e; h2 <= i8; h2++) {
      let c = h2 + r.ydisp, d = this._rowElements[h2], _2 = r.lines.get(c);
      if (!d || !_2) break;
      d.replaceChildren(...this._rowFactory.createRow(_2, c, c === n, a, u, o2, l, this.dimensions.css.cell.width, this._widthCache, -1, -1));
    }
  }
  get _terminalSelector() {
    return `.${_s}${this._terminalClass}`;
  }
  _handleLinkHover(e) {
    this._setCellUnderline(e.x1, e.x2, e.y1, e.y2, e.cols, true);
  }
  _handleLinkLeave(e) {
    this._setCellUnderline(e.x1, e.x2, e.y1, e.y2, e.cols, false);
  }
  _setCellUnderline(e, i8, r, n, o2, l) {
    r < 0 && (e = 0), n < 0 && (i8 = 0);
    let a = this._bufferService.rows - 1;
    r = Math.max(Math.min(r, a), 0), n = Math.max(Math.min(n, a), 0), o2 = Math.min(o2, this._bufferService.cols);
    let u = this._bufferService.buffer, h2 = u.ybase + u.y, c = Math.min(u.x, o2 - 1), d = this._optionsService.rawOptions.cursorBlink, _2 = this._optionsService.rawOptions.cursorStyle, p = this._optionsService.rawOptions.cursorInactiveStyle;
    for (let m = r; m <= n; ++m) {
      let f = m + u.ydisp, A = this._rowElements[m], R2 = u.lines.get(f);
      if (!A || !R2) break;
      A.replaceChildren(...this._rowFactory.createRow(R2, f, f === h2, _2, p, c, d, this.dimensions.css.cell.width, this._widthCache, l ? m === r ? e : 0 : -1, l ? (m === n ? i8 : o2) - 1 : -1));
    }
  }
};
Yt = M([S(7, xt), S(8, nt), S(9, H), S(10, F), S(11, ge), S(12, ae), S(13, Re)], Yt);
var jt = class extends D2 {
  constructor(e, i8, r) {
    super();
    this._optionsService = r;
    this.width = 0;
    this.height = 0;
    this._onCharSizeChange = this._register(new v());
    this.onCharSizeChange = this._onCharSizeChange.event;
    try {
      this._measureStrategy = this._register(new vs(this._optionsService));
    } catch {
      this._measureStrategy = this._register(new bs(e, i8, this._optionsService));
    }
    this._register(this._optionsService.onMultipleOptionChange(["fontFamily", "fontSize"], () => this.measure()));
  }
  get hasValidSize() {
    return this.width > 0 && this.height > 0;
  }
  measure() {
    let e = this._measureStrategy.measure();
    (e.width !== this.width || e.height !== this.height) && (this.width = e.width, this.height = e.height, this._onCharSizeChange.fire());
  }
};
jt = M([S(2, H)], jt);
var Zr = class extends D2 {
  constructor() {
    super(...arguments);
    this._result = { width: 0, height: 0 };
  }
  _validateAndSet(e, i8) {
    e !== void 0 && e > 0 && i8 !== void 0 && i8 > 0 && (this._result.width = e, this._result.height = i8);
  }
};
var bs = class extends Zr {
  constructor(e, i8, r) {
    super();
    this._document = e;
    this._parentElement = i8;
    this._optionsService = r;
    this._measureElement = this._document.createElement("span"), this._measureElement.classList.add("xterm-char-measure-element"), this._measureElement.textContent = "W".repeat(32), this._measureElement.setAttribute("aria-hidden", "true"), this._measureElement.style.whiteSpace = "pre", this._measureElement.style.fontKerning = "none", this._parentElement.appendChild(this._measureElement);
  }
  measure() {
    return this._measureElement.style.fontFamily = this._optionsService.rawOptions.fontFamily, this._measureElement.style.fontSize = `${this._optionsService.rawOptions.fontSize}px`, this._validateAndSet(Number(this._measureElement.offsetWidth) / 32, Number(this._measureElement.offsetHeight)), this._result;
  }
};
var vs = class extends Zr {
  constructor(e) {
    super();
    this._optionsService = e;
    this._canvas = new OffscreenCanvas(100, 100), this._ctx = this._canvas.getContext("2d");
    let i8 = this._ctx.measureText("W");
    if (!("width" in i8 && "fontBoundingBoxAscent" in i8 && "fontBoundingBoxDescent" in i8)) throw new Error("Required font metrics not supported");
  }
  measure() {
    this._ctx.font = `${this._optionsService.rawOptions.fontSize}px ${this._optionsService.rawOptions.fontFamily}`;
    let e = this._ctx.measureText("W");
    return this._validateAndSet(e.width, e.fontBoundingBoxAscent + e.fontBoundingBoxDescent), this._result;
  }
};
var Jr = class extends D2 {
  constructor(e, i8, r) {
    super();
    this._textarea = e;
    this._window = i8;
    this.mainDocument = r;
    this._isFocused = false;
    this._cachedIsFocused = void 0;
    this._screenDprMonitor = this._register(new gs(this._window));
    this._onDprChange = this._register(new v());
    this.onDprChange = this._onDprChange.event;
    this._onWindowChange = this._register(new v());
    this.onWindowChange = this._onWindowChange.event;
    this._register(this.onWindowChange((n) => this._screenDprMonitor.setWindow(n))), this._register($.forward(this._screenDprMonitor.onDprChange, this._onDprChange)), this._register(L(this._textarea, "focus", () => this._isFocused = true)), this._register(L(this._textarea, "blur", () => this._isFocused = false));
  }
  get window() {
    return this._window;
  }
  set window(e) {
    this._window !== e && (this._window = e, this._onWindowChange.fire(this._window));
  }
  get dpr() {
    return this.window.devicePixelRatio;
  }
  get isFocused() {
    return this._cachedIsFocused === void 0 && (this._cachedIsFocused = this._isFocused && this._textarea.ownerDocument.hasFocus(), queueMicrotask(() => this._cachedIsFocused = void 0)), this._cachedIsFocused;
  }
};
var gs = class extends D2 {
  constructor(e) {
    super();
    this._parentWindow = e;
    this._windowResizeListener = this._register(new ye());
    this._onDprChange = this._register(new v());
    this.onDprChange = this._onDprChange.event;
    this._outerListener = () => this._setDprAndFireIfDiffers(), this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio, this._updateDpr(), this._setWindowResizeListener(), this._register(C(() => this.clearListener()));
  }
  setWindow(e) {
    this._parentWindow = e, this._setWindowResizeListener(), this._setDprAndFireIfDiffers();
  }
  _setWindowResizeListener() {
    this._windowResizeListener.value = L(this._parentWindow, "resize", () => this._setDprAndFireIfDiffers());
  }
  _setDprAndFireIfDiffers() {
    this._parentWindow.devicePixelRatio !== this._currentDevicePixelRatio && this._onDprChange.fire(this._parentWindow.devicePixelRatio), this._updateDpr();
  }
  _updateDpr() {
    this._outerListener && (this._resolutionMediaMatchList?.removeListener(this._outerListener), this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio, this._resolutionMediaMatchList = this._parentWindow.matchMedia(`screen and (resolution: ${this._parentWindow.devicePixelRatio}dppx)`), this._resolutionMediaMatchList.addListener(this._outerListener));
  }
  clearListener() {
    !this._resolutionMediaMatchList || !this._outerListener || (this._resolutionMediaMatchList.removeListener(this._outerListener), this._resolutionMediaMatchList = void 0, this._outerListener = void 0);
  }
};
var Qr = class extends D2 {
  constructor() {
    super();
    this.linkProviders = [];
    this._register(C(() => this.linkProviders.length = 0));
  }
  registerLinkProvider(e) {
    return this.linkProviders.push(e), { dispose: () => {
      let i8 = this.linkProviders.indexOf(e);
      i8 !== -1 && this.linkProviders.splice(i8, 1);
    } };
  }
};
function Ci(s15, t, e) {
  let i8 = e.getBoundingClientRect(), r = s15.getComputedStyle(e), n = parseInt(r.getPropertyValue("padding-left")), o2 = parseInt(r.getPropertyValue("padding-top"));
  return [t.clientX - i8.left - n, t.clientY - i8.top - o2];
}
function Xo(s15, t, e, i8, r, n, o2, l, a) {
  if (!n) return;
  let u = Ci(s15, t, e);
  if (u) return u[0] = Math.ceil((u[0] + (a ? o2 / 2 : 0)) / o2), u[1] = Math.ceil(u[1] / l), u[0] = Math.min(Math.max(u[0], 1), i8 + (a ? 1 : 0)), u[1] = Math.min(Math.max(u[1], 1), r), u;
}
var Xt = class {
  constructor(t, e) {
    this._renderService = t;
    this._charSizeService = e;
  }
  getCoords(t, e, i8, r, n) {
    return Xo(window, t, e, i8, r, this._charSizeService.hasValidSize, this._renderService.dimensions.css.cell.width, this._renderService.dimensions.css.cell.height, n);
  }
  getMouseReportCoords(t, e) {
    let i8 = Ci(window, t, e);
    if (this._charSizeService.hasValidSize) return i8[0] = Math.min(Math.max(i8[0], 0), this._renderService.dimensions.css.canvas.width - 1), i8[1] = Math.min(Math.max(i8[1], 0), this._renderService.dimensions.css.canvas.height - 1), { col: Math.floor(i8[0] / this._renderService.dimensions.css.cell.width), row: Math.floor(i8[1] / this._renderService.dimensions.css.cell.height), x: Math.floor(i8[0]), y: Math.floor(i8[1]) };
  }
};
Xt = M([S(0, ce), S(1, nt)], Xt);
var en = class {
  constructor(t, e) {
    this._renderCallback = t;
    this._coreBrowserService = e;
    this._refreshCallbacks = [];
  }
  dispose() {
    this._animationFrame && (this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame), this._animationFrame = void 0);
  }
  addRefreshCallback(t) {
    return this._refreshCallbacks.push(t), this._animationFrame || (this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._innerRefresh())), this._animationFrame;
  }
  refresh(t, e, i8) {
    this._rowCount = i8, t = t !== void 0 ? t : 0, e = e !== void 0 ? e : this._rowCount - 1, this._rowStart = this._rowStart !== void 0 ? Math.min(this._rowStart, t) : t, this._rowEnd = this._rowEnd !== void 0 ? Math.max(this._rowEnd, e) : e, !this._animationFrame && (this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._innerRefresh()));
  }
  _innerRefresh() {
    if (this._animationFrame = void 0, this._rowStart === void 0 || this._rowEnd === void 0 || this._rowCount === void 0) {
      this._runRefreshCallbacks();
      return;
    }
    let t = Math.max(this._rowStart, 0), e = Math.min(this._rowEnd, this._rowCount - 1);
    this._rowStart = void 0, this._rowEnd = void 0, this._renderCallback(t, e), this._runRefreshCallbacks();
  }
  _runRefreshCallbacks() {
    for (let t of this._refreshCallbacks) t(0);
    this._refreshCallbacks = [];
  }
};
var tn = {};
Ll(tn, { getSafariVersion: () => Ha, isChromeOS: () => Ts, isFirefox: () => Ss, isIpad: () => Wa, isIphone: () => Ua, isLegacyEdge: () => Fa, isLinux: () => Bi, isMac: () => Zt, isNode: () => Mi, isSafari: () => Zo, isWindows: () => Es });
var Mi = typeof process < "u" && "title" in process;
var Pi = Mi ? "node" : navigator.userAgent;
var Oi = Mi ? "node" : navigator.platform;
var Ss = Pi.includes("Firefox");
var Fa = Pi.includes("Edge");
var Zo = /^((?!chrome|android).)*safari/i.test(Pi);
function Ha() {
  if (!Zo) return 0;
  let s15 = Pi.match(/Version\/(\d+)/);
  return s15 === null || s15.length < 2 ? 0 : parseInt(s15[1]);
}
var Zt = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"].includes(Oi);
var Wa = Oi === "iPad";
var Ua = Oi === "iPhone";
var Es = ["Windows", "Win16", "Win32", "WinCE"].includes(Oi);
var Bi = Oi.indexOf("Linux") >= 0;
var Ts = /\bCrOS\b/.test(Pi);
var rn = class {
  constructor() {
    this._tasks = [];
    this._i = 0;
  }
  enqueue(t) {
    this._tasks.push(t), this._start();
  }
  flush() {
    for (; this._i < this._tasks.length; ) this._tasks[this._i]() || this._i++;
    this.clear();
  }
  clear() {
    this._idleCallback && (this._cancelCallback(this._idleCallback), this._idleCallback = void 0), this._i = 0, this._tasks.length = 0;
  }
  _start() {
    this._idleCallback || (this._idleCallback = this._requestCallback(this._process.bind(this)));
  }
  _process(t) {
    this._idleCallback = void 0;
    let e = 0, i8 = 0, r = t.timeRemaining(), n = 0;
    for (; this._i < this._tasks.length; ) {
      if (e = performance.now(), this._tasks[this._i]() || this._i++, e = Math.max(1, performance.now() - e), i8 = Math.max(e, i8), n = t.timeRemaining(), i8 * 1.5 > n) {
        r - e < -20 && console.warn(`task queue exceeded allotted deadline by ${Math.abs(Math.round(r - e))}ms`), this._start();
        return;
      }
      r = n;
    }
    this.clear();
  }
};
var Is = class extends rn {
  _requestCallback(t) {
    return setTimeout(() => t(this._createDeadline(16)));
  }
  _cancelCallback(t) {
    clearTimeout(t);
  }
  _createDeadline(t) {
    let e = performance.now() + t;
    return { timeRemaining: () => Math.max(0, e - performance.now()) };
  }
};
var ys = class extends rn {
  _requestCallback(t) {
    return requestIdleCallback(t);
  }
  _cancelCallback(t) {
    cancelIdleCallback(t);
  }
};
var Jt = !Mi && "requestIdleCallback" in window ? ys : Is;
var nn = class {
  constructor() {
    this._queue = new Jt();
  }
  set(t) {
    this._queue.clear(), this._queue.enqueue(t);
  }
  flush() {
    this._queue.flush();
  }
};
var Qt = class extends D2 {
  constructor(e, i8, r, n, o2, l, a, u, h2) {
    super();
    this._rowCount = e;
    this._optionsService = r;
    this._charSizeService = n;
    this._coreService = o2;
    this._coreBrowserService = u;
    this._renderer = this._register(new ye());
    this._pausedResizeTask = new nn();
    this._observerDisposable = this._register(new ye());
    this._isPaused = false;
    this._needsFullRefresh = false;
    this._isNextRenderRedrawOnly = true;
    this._needsSelectionRefresh = false;
    this._canvasWidth = 0;
    this._canvasHeight = 0;
    this._selectionState = { start: void 0, end: void 0, columnSelectMode: false };
    this._onDimensionsChange = this._register(new v());
    this.onDimensionsChange = this._onDimensionsChange.event;
    this._onRenderedViewportChange = this._register(new v());
    this.onRenderedViewportChange = this._onRenderedViewportChange.event;
    this._onRender = this._register(new v());
    this.onRender = this._onRender.event;
    this._onRefreshRequest = this._register(new v());
    this.onRefreshRequest = this._onRefreshRequest.event;
    this._renderDebouncer = new en((c, d) => this._renderRows(c, d), this._coreBrowserService), this._register(this._renderDebouncer), this._syncOutputHandler = new xs(this._coreBrowserService, this._coreService, () => this._fullRefresh()), this._register(C(() => this._syncOutputHandler.dispose())), this._register(this._coreBrowserService.onDprChange(() => this.handleDevicePixelRatioChange())), this._register(a.onResize(() => this._fullRefresh())), this._register(a.buffers.onBufferActivate(() => this._renderer.value?.clear())), this._register(this._optionsService.onOptionChange(() => this._handleOptionsChanged())), this._register(this._charSizeService.onCharSizeChange(() => this.handleCharSizeChanged())), this._register(l.onDecorationRegistered(() => this._fullRefresh())), this._register(l.onDecorationRemoved(() => this._fullRefresh())), this._register(this._optionsService.onMultipleOptionChange(["customGlyphs", "drawBoldTextInBrightColors", "letterSpacing", "lineHeight", "fontFamily", "fontSize", "fontWeight", "fontWeightBold", "minimumContrastRatio", "rescaleOverlappingGlyphs"], () => {
      this.clear(), this.handleResize(a.cols, a.rows), this._fullRefresh();
    })), this._register(this._optionsService.onMultipleOptionChange(["cursorBlink", "cursorStyle"], () => this.refreshRows(a.buffer.y, a.buffer.y, true))), this._register(h2.onChangeColors(() => this._fullRefresh())), this._registerIntersectionObserver(this._coreBrowserService.window, i8), this._register(this._coreBrowserService.onWindowChange((c) => this._registerIntersectionObserver(c, i8)));
  }
  get dimensions() {
    return this._renderer.value.dimensions;
  }
  _registerIntersectionObserver(e, i8) {
    if ("IntersectionObserver" in e) {
      let r = new e.IntersectionObserver((n) => this._handleIntersectionChange(n[n.length - 1]), { threshold: 0 });
      r.observe(i8), this._observerDisposable.value = C(() => r.disconnect());
    }
  }
  _handleIntersectionChange(e) {
    this._isPaused = e.isIntersecting === void 0 ? e.intersectionRatio === 0 : !e.isIntersecting, !this._isPaused && !this._charSizeService.hasValidSize && this._charSizeService.measure(), !this._isPaused && this._needsFullRefresh && (this._pausedResizeTask.flush(), this.refreshRows(0, this._rowCount - 1), this._needsFullRefresh = false);
  }
  refreshRows(e, i8, r = false) {
    if (this._isPaused) {
      this._needsFullRefresh = true;
      return;
    }
    if (this._coreService.decPrivateModes.synchronizedOutput) {
      this._syncOutputHandler.bufferRows(e, i8);
      return;
    }
    let n = this._syncOutputHandler.flush();
    n && (e = Math.min(e, n.start), i8 = Math.max(i8, n.end)), r || (this._isNextRenderRedrawOnly = false), this._renderDebouncer.refresh(e, i8, this._rowCount);
  }
  _renderRows(e, i8) {
    if (this._renderer.value) {
      if (this._coreService.decPrivateModes.synchronizedOutput) {
        this._syncOutputHandler.bufferRows(e, i8);
        return;
      }
      e = Math.min(e, this._rowCount - 1), i8 = Math.min(i8, this._rowCount - 1), this._renderer.value.renderRows(e, i8), this._needsSelectionRefresh && (this._renderer.value.handleSelectionChanged(this._selectionState.start, this._selectionState.end, this._selectionState.columnSelectMode), this._needsSelectionRefresh = false), this._isNextRenderRedrawOnly || this._onRenderedViewportChange.fire({ start: e, end: i8 }), this._onRender.fire({ start: e, end: i8 }), this._isNextRenderRedrawOnly = true;
    }
  }
  resize(e, i8) {
    this._rowCount = i8, this._fireOnCanvasResize();
  }
  _handleOptionsChanged() {
    this._renderer.value && (this.refreshRows(0, this._rowCount - 1), this._fireOnCanvasResize());
  }
  _fireOnCanvasResize() {
    this._renderer.value && (this._renderer.value.dimensions.css.canvas.width === this._canvasWidth && this._renderer.value.dimensions.css.canvas.height === this._canvasHeight || this._onDimensionsChange.fire(this._renderer.value.dimensions));
  }
  hasRenderer() {
    return !!this._renderer.value;
  }
  setRenderer(e) {
    this._renderer.value = e, this._renderer.value && (this._renderer.value.onRequestRedraw((i8) => this.refreshRows(i8.start, i8.end, true)), this._needsSelectionRefresh = true, this._fullRefresh());
  }
  addRefreshCallback(e) {
    return this._renderDebouncer.addRefreshCallback(e);
  }
  _fullRefresh() {
    this._isPaused ? this._needsFullRefresh = true : this.refreshRows(0, this._rowCount - 1);
  }
  clearTextureAtlas() {
    this._renderer.value && (this._renderer.value.clearTextureAtlas?.(), this._fullRefresh());
  }
  handleDevicePixelRatioChange() {
    this._charSizeService.measure(), this._renderer.value && (this._renderer.value.handleDevicePixelRatioChange(), this.refreshRows(0, this._rowCount - 1));
  }
  handleResize(e, i8) {
    this._renderer.value && (this._isPaused ? this._pausedResizeTask.set(() => this._renderer.value?.handleResize(e, i8)) : this._renderer.value.handleResize(e, i8), this._fullRefresh());
  }
  handleCharSizeChanged() {
    this._renderer.value?.handleCharSizeChanged();
  }
  handleBlur() {
    this._renderer.value?.handleBlur();
  }
  handleFocus() {
    this._renderer.value?.handleFocus();
  }
  handleSelectionChanged(e, i8, r) {
    this._selectionState.start = e, this._selectionState.end = i8, this._selectionState.columnSelectMode = r, this._renderer.value?.handleSelectionChanged(e, i8, r);
  }
  handleCursorMove() {
    this._renderer.value?.handleCursorMove();
  }
  clear() {
    this._renderer.value?.clear();
  }
};
Qt = M([S(2, H), S(3, nt), S(4, ge), S(5, Be), S(6, F), S(7, ae), S(8, Re)], Qt);
var xs = class {
  constructor(t, e, i8) {
    this._coreBrowserService = t;
    this._coreService = e;
    this._onTimeout = i8;
    this._start = 0;
    this._end = 0;
    this._isBuffering = false;
  }
  bufferRows(t, e) {
    this._isBuffering ? (this._start = Math.min(this._start, t), this._end = Math.max(this._end, e)) : (this._start = t, this._end = e, this._isBuffering = true), this._timeout === void 0 && (this._timeout = this._coreBrowserService.window.setTimeout(() => {
      this._timeout = void 0, this._coreService.decPrivateModes.synchronizedOutput = false, this._onTimeout();
    }, 1e3));
  }
  flush() {
    if (this._timeout !== void 0 && (this._coreBrowserService.window.clearTimeout(this._timeout), this._timeout = void 0), !this._isBuffering) return;
    let t = { start: this._start, end: this._end };
    return this._isBuffering = false, t;
  }
  dispose() {
    this._timeout !== void 0 && (this._coreBrowserService.window.clearTimeout(this._timeout), this._timeout = void 0);
  }
};
function Jo(s15, t, e, i8) {
  let r = e.buffer.x, n = e.buffer.y;
  if (!e.buffer.hasScrollback) return Ga(r, n, s15, t, e, i8) + sn(n, t, e, i8) + $a(r, n, s15, t, e, i8);
  let o2;
  if (n === t) return o2 = r > s15 ? "D" : "C", Fi(Math.abs(r - s15), Ni(o2, i8));
  o2 = n > t ? "D" : "C";
  let l = Math.abs(n - t), a = za(n > t ? s15 : r, e) + (l - 1) * e.cols + 1 + Ka(n > t ? r : s15, e);
  return Fi(a, Ni(o2, i8));
}
function Ka(s15, t) {
  return s15 - 1;
}
function za(s15, t) {
  return t.cols - s15;
}
function Ga(s15, t, e, i8, r, n) {
  return sn(t, i8, r, n).length === 0 ? "" : Fi(el(s15, t, s15, t - gt(t, r), false, r).length, Ni("D", n));
}
function sn(s15, t, e, i8) {
  let r = s15 - gt(s15, e), n = t - gt(t, e), o2 = Math.abs(r - n) - Va(s15, t, e);
  return Fi(o2, Ni(Qo(s15, t), i8));
}
function $a(s15, t, e, i8, r, n) {
  let o2;
  sn(t, i8, r, n).length > 0 ? o2 = i8 - gt(i8, r) : o2 = t;
  let l = i8, a = qa(s15, t, e, i8, r, n);
  return Fi(el(s15, o2, e, l, a === "C", r).length, Ni(a, n));
}
function Va(s15, t, e) {
  let i8 = 0, r = s15 - gt(s15, e), n = t - gt(t, e);
  for (let o2 = 0; o2 < Math.abs(r - n); o2++) {
    let l = Qo(s15, t) === "A" ? -1 : 1;
    e.buffer.lines.get(r + l * o2)?.isWrapped && i8++;
  }
  return i8;
}
function gt(s15, t) {
  let e = 0, i8 = t.buffer.lines.get(s15), r = i8?.isWrapped;
  for (; r && s15 >= 0 && s15 < t.rows; ) e++, i8 = t.buffer.lines.get(--s15), r = i8?.isWrapped;
  return e;
}
function qa(s15, t, e, i8, r, n) {
  let o2;
  return sn(e, i8, r, n).length > 0 ? o2 = i8 - gt(i8, r) : o2 = t, s15 < e && o2 <= i8 || s15 >= e && o2 < i8 ? "C" : "D";
}
function Qo(s15, t) {
  return s15 > t ? "A" : "B";
}
function el(s15, t, e, i8, r, n) {
  let o2 = s15, l = t, a = "";
  for (; (o2 !== e || l !== i8) && l >= 0 && l < n.buffer.lines.length; ) o2 += r ? 1 : -1, r && o2 > n.cols - 1 ? (a += n.buffer.translateBufferLineToString(l, false, s15, o2), o2 = 0, s15 = 0, l++) : !r && o2 < 0 && (a += n.buffer.translateBufferLineToString(l, false, 0, s15 + 1), o2 = n.cols - 1, s15 = o2, l--);
  return a + n.buffer.translateBufferLineToString(l, false, s15, o2);
}
function Ni(s15, t) {
  let e = t ? "O" : "[";
  return b.ESC + e + s15;
}
function Fi(s15, t) {
  s15 = Math.floor(s15);
  let e = "";
  for (let i8 = 0; i8 < s15; i8++) e += t;
  return e;
}
var on = class {
  constructor(t) {
    this._bufferService = t;
    this.isSelectAllActive = false;
    this.selectionStartLength = 0;
  }
  clearSelection() {
    this.selectionStart = void 0, this.selectionEnd = void 0, this.isSelectAllActive = false, this.selectionStartLength = 0;
  }
  get finalSelectionStart() {
    return this.isSelectAllActive ? [0, 0] : !this.selectionEnd || !this.selectionStart ? this.selectionStart : this.areSelectionValuesReversed() ? this.selectionEnd : this.selectionStart;
  }
  get finalSelectionEnd() {
    if (this.isSelectAllActive) return [this._bufferService.cols, this._bufferService.buffer.ybase + this._bufferService.rows - 1];
    if (this.selectionStart) {
      if (!this.selectionEnd || this.areSelectionValuesReversed()) {
        let t = this.selectionStart[0] + this.selectionStartLength;
        return t > this._bufferService.cols ? t % this._bufferService.cols === 0 ? [this._bufferService.cols, this.selectionStart[1] + Math.floor(t / this._bufferService.cols) - 1] : [t % this._bufferService.cols, this.selectionStart[1] + Math.floor(t / this._bufferService.cols)] : [t, this.selectionStart[1]];
      }
      if (this.selectionStartLength && this.selectionEnd[1] === this.selectionStart[1]) {
        let t = this.selectionStart[0] + this.selectionStartLength;
        return t > this._bufferService.cols ? [t % this._bufferService.cols, this.selectionStart[1] + Math.floor(t / this._bufferService.cols)] : [Math.max(t, this.selectionEnd[0]), this.selectionEnd[1]];
      }
      return this.selectionEnd;
    }
  }
  areSelectionValuesReversed() {
    let t = this.selectionStart, e = this.selectionEnd;
    return !t || !e ? false : t[1] > e[1] || t[1] === e[1] && t[0] > e[0];
  }
  handleTrim(t) {
    return this.selectionStart && (this.selectionStart[1] -= t), this.selectionEnd && (this.selectionEnd[1] -= t), this.selectionEnd && this.selectionEnd[1] < 0 ? (this.clearSelection(), true) : (this.selectionStart && this.selectionStart[1] < 0 && (this.selectionStart[1] = 0), false);
  }
};
function ws(s15, t) {
  if (s15.start.y > s15.end.y) throw new Error(`Buffer range end (${s15.end.x}, ${s15.end.y}) cannot be before start (${s15.start.x}, ${s15.start.y})`);
  return t * (s15.end.y - s15.start.y) + (s15.end.x - s15.start.x + 1);
}
var Ds = 50;
var Ya = 15;
var ja = 50;
var Xa = 500;
var Za = "\xA0";
var Ja = new RegExp(Za, "g");
var ei = class extends D2 {
  constructor(e, i8, r, n, o2, l, a, u, h2) {
    super();
    this._element = e;
    this._screenElement = i8;
    this._linkifier = r;
    this._bufferService = n;
    this._coreService = o2;
    this._mouseService = l;
    this._optionsService = a;
    this._renderService = u;
    this._coreBrowserService = h2;
    this._dragScrollAmount = 0;
    this._enabled = true;
    this._workCell = new q();
    this._mouseDownTimeStamp = 0;
    this._oldHasSelection = false;
    this._oldSelectionStart = void 0;
    this._oldSelectionEnd = void 0;
    this._onLinuxMouseSelection = this._register(new v());
    this.onLinuxMouseSelection = this._onLinuxMouseSelection.event;
    this._onRedrawRequest = this._register(new v());
    this.onRequestRedraw = this._onRedrawRequest.event;
    this._onSelectionChange = this._register(new v());
    this.onSelectionChange = this._onSelectionChange.event;
    this._onRequestScrollLines = this._register(new v());
    this.onRequestScrollLines = this._onRequestScrollLines.event;
    this._mouseMoveListener = (c) => this._handleMouseMove(c), this._mouseUpListener = (c) => this._handleMouseUp(c), this._coreService.onUserInput(() => {
      this.hasSelection && this.clearSelection();
    }), this._trimListener = this._bufferService.buffer.lines.onTrim((c) => this._handleTrim(c)), this._register(this._bufferService.buffers.onBufferActivate((c) => this._handleBufferActivate(c))), this.enable(), this._model = new on(this._bufferService), this._activeSelectionMode = 0, this._register(C(() => {
      this._removeMouseDownListeners();
    })), this._register(this._bufferService.onResize((c) => {
      c.rowsChanged && this.clearSelection();
    }));
  }
  reset() {
    this.clearSelection();
  }
  disable() {
    this.clearSelection(), this._enabled = false;
  }
  enable() {
    this._enabled = true;
  }
  get selectionStart() {
    return this._model.finalSelectionStart;
  }
  get selectionEnd() {
    return this._model.finalSelectionEnd;
  }
  get hasSelection() {
    let e = this._model.finalSelectionStart, i8 = this._model.finalSelectionEnd;
    return !e || !i8 ? false : e[0] !== i8[0] || e[1] !== i8[1];
  }
  get selectionText() {
    let e = this._model.finalSelectionStart, i8 = this._model.finalSelectionEnd;
    if (!e || !i8) return "";
    let r = this._bufferService.buffer, n = [];
    if (this._activeSelectionMode === 3) {
      if (e[0] === i8[0]) return "";
      let l = e[0] < i8[0] ? e[0] : i8[0], a = e[0] < i8[0] ? i8[0] : e[0];
      for (let u = e[1]; u <= i8[1]; u++) {
        let h2 = r.translateBufferLineToString(u, true, l, a);
        n.push(h2);
      }
    } else {
      let l = e[1] === i8[1] ? i8[0] : void 0;
      n.push(r.translateBufferLineToString(e[1], true, e[0], l));
      for (let a = e[1] + 1; a <= i8[1] - 1; a++) {
        let u = r.lines.get(a), h2 = r.translateBufferLineToString(a, true);
        u?.isWrapped ? n[n.length - 1] += h2 : n.push(h2);
      }
      if (e[1] !== i8[1]) {
        let a = r.lines.get(i8[1]), u = r.translateBufferLineToString(i8[1], true, 0, i8[0]);
        a && a.isWrapped ? n[n.length - 1] += u : n.push(u);
      }
    }
    return n.map((l) => l.replace(Ja, " ")).join(Es ? `\r
` : `
`);
  }
  clearSelection() {
    this._model.clearSelection(), this._removeMouseDownListeners(), this.refresh(), this._onSelectionChange.fire();
  }
  refresh(e) {
    this._refreshAnimationFrame || (this._refreshAnimationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._refresh())), Bi && e && this.selectionText.length && this._onLinuxMouseSelection.fire(this.selectionText);
  }
  _refresh() {
    this._refreshAnimationFrame = void 0, this._onRedrawRequest.fire({ start: this._model.finalSelectionStart, end: this._model.finalSelectionEnd, columnSelectMode: this._activeSelectionMode === 3 });
  }
  _isClickInSelection(e) {
    let i8 = this._getMouseBufferCoords(e), r = this._model.finalSelectionStart, n = this._model.finalSelectionEnd;
    return !r || !n || !i8 ? false : this._areCoordsInSelection(i8, r, n);
  }
  isCellInSelection(e, i8) {
    let r = this._model.finalSelectionStart, n = this._model.finalSelectionEnd;
    return !r || !n ? false : this._areCoordsInSelection([e, i8], r, n);
  }
  _areCoordsInSelection(e, i8, r) {
    return e[1] > i8[1] && e[1] < r[1] || i8[1] === r[1] && e[1] === i8[1] && e[0] >= i8[0] && e[0] < r[0] || i8[1] < r[1] && e[1] === r[1] && e[0] < r[0] || i8[1] < r[1] && e[1] === i8[1] && e[0] >= i8[0];
  }
  _selectWordAtCursor(e, i8) {
    let r = this._linkifier.currentLink?.link?.range;
    if (r) return this._model.selectionStart = [r.start.x - 1, r.start.y - 1], this._model.selectionStartLength = ws(r, this._bufferService.cols), this._model.selectionEnd = void 0, true;
    let n = this._getMouseBufferCoords(e);
    return n ? (this._selectWordAt(n, i8), this._model.selectionEnd = void 0, true) : false;
  }
  selectAll() {
    this._model.isSelectAllActive = true, this.refresh(), this._onSelectionChange.fire();
  }
  selectLines(e, i8) {
    this._model.clearSelection(), e = Math.max(e, 0), i8 = Math.min(i8, this._bufferService.buffer.lines.length - 1), this._model.selectionStart = [0, e], this._model.selectionEnd = [this._bufferService.cols, i8], this.refresh(), this._onSelectionChange.fire();
  }
  _handleTrim(e) {
    this._model.handleTrim(e) && this.refresh();
  }
  _getMouseBufferCoords(e) {
    let i8 = this._mouseService.getCoords(e, this._screenElement, this._bufferService.cols, this._bufferService.rows, true);
    if (i8) return i8[0]--, i8[1]--, i8[1] += this._bufferService.buffer.ydisp, i8;
  }
  _getMouseEventScrollAmount(e) {
    let i8 = Ci(this._coreBrowserService.window, e, this._screenElement)[1], r = this._renderService.dimensions.css.canvas.height;
    return i8 >= 0 && i8 <= r ? 0 : (i8 > r && (i8 -= r), i8 = Math.min(Math.max(i8, -Ds), Ds), i8 /= Ds, i8 / Math.abs(i8) + Math.round(i8 * (Ya - 1)));
  }
  shouldForceSelection(e) {
    return Zt ? e.altKey && this._optionsService.rawOptions.macOptionClickForcesSelection : e.shiftKey;
  }
  handleMouseDown(e) {
    if (this._mouseDownTimeStamp = e.timeStamp, !(e.button === 2 && this.hasSelection) && e.button === 0) {
      if (!this._enabled) {
        if (!this.shouldForceSelection(e)) return;
        e.stopPropagation();
      }
      e.preventDefault(), this._dragScrollAmount = 0, this._enabled && e.shiftKey ? this._handleIncrementalClick(e) : e.detail === 1 ? this._handleSingleClick(e) : e.detail === 2 ? this._handleDoubleClick(e) : e.detail === 3 && this._handleTripleClick(e), this._addMouseDownListeners(), this.refresh(true);
    }
  }
  _addMouseDownListeners() {
    this._screenElement.ownerDocument && (this._screenElement.ownerDocument.addEventListener("mousemove", this._mouseMoveListener), this._screenElement.ownerDocument.addEventListener("mouseup", this._mouseUpListener)), this._dragScrollIntervalTimer = this._coreBrowserService.window.setInterval(() => this._dragScroll(), ja);
  }
  _removeMouseDownListeners() {
    this._screenElement.ownerDocument && (this._screenElement.ownerDocument.removeEventListener("mousemove", this._mouseMoveListener), this._screenElement.ownerDocument.removeEventListener("mouseup", this._mouseUpListener)), this._coreBrowserService.window.clearInterval(this._dragScrollIntervalTimer), this._dragScrollIntervalTimer = void 0;
  }
  _handleIncrementalClick(e) {
    this._model.selectionStart && (this._model.selectionEnd = this._getMouseBufferCoords(e));
  }
  _handleSingleClick(e) {
    if (this._model.selectionStartLength = 0, this._model.isSelectAllActive = false, this._activeSelectionMode = this.shouldColumnSelect(e) ? 3 : 0, this._model.selectionStart = this._getMouseBufferCoords(e), !this._model.selectionStart) return;
    this._model.selectionEnd = void 0;
    let i8 = this._bufferService.buffer.lines.get(this._model.selectionStart[1]);
    i8 && i8.length !== this._model.selectionStart[0] && i8.hasWidth(this._model.selectionStart[0]) === 0 && this._model.selectionStart[0]++;
  }
  _handleDoubleClick(e) {
    this._selectWordAtCursor(e, true) && (this._activeSelectionMode = 1);
  }
  _handleTripleClick(e) {
    let i8 = this._getMouseBufferCoords(e);
    i8 && (this._activeSelectionMode = 2, this._selectLineAt(i8[1]));
  }
  shouldColumnSelect(e) {
    return e.altKey && !(Zt && this._optionsService.rawOptions.macOptionClickForcesSelection);
  }
  _handleMouseMove(e) {
    if (e.stopImmediatePropagation(), !this._model.selectionStart) return;
    let i8 = this._model.selectionEnd ? [this._model.selectionEnd[0], this._model.selectionEnd[1]] : null;
    if (this._model.selectionEnd = this._getMouseBufferCoords(e), !this._model.selectionEnd) {
      this.refresh(true);
      return;
    }
    this._activeSelectionMode === 2 ? this._model.selectionEnd[1] < this._model.selectionStart[1] ? this._model.selectionEnd[0] = 0 : this._model.selectionEnd[0] = this._bufferService.cols : this._activeSelectionMode === 1 && this._selectToWordAt(this._model.selectionEnd), this._dragScrollAmount = this._getMouseEventScrollAmount(e), this._activeSelectionMode !== 3 && (this._dragScrollAmount > 0 ? this._model.selectionEnd[0] = this._bufferService.cols : this._dragScrollAmount < 0 && (this._model.selectionEnd[0] = 0));
    let r = this._bufferService.buffer;
    if (this._model.selectionEnd[1] < r.lines.length) {
      let n = r.lines.get(this._model.selectionEnd[1]);
      n && n.hasWidth(this._model.selectionEnd[0]) === 0 && this._model.selectionEnd[0] < this._bufferService.cols && this._model.selectionEnd[0]++;
    }
    (!i8 || i8[0] !== this._model.selectionEnd[0] || i8[1] !== this._model.selectionEnd[1]) && this.refresh(true);
  }
  _dragScroll() {
    if (!(!this._model.selectionEnd || !this._model.selectionStart) && this._dragScrollAmount) {
      this._onRequestScrollLines.fire({ amount: this._dragScrollAmount, suppressScrollEvent: false });
      let e = this._bufferService.buffer;
      this._dragScrollAmount > 0 ? (this._activeSelectionMode !== 3 && (this._model.selectionEnd[0] = this._bufferService.cols), this._model.selectionEnd[1] = Math.min(e.ydisp + this._bufferService.rows, e.lines.length - 1)) : (this._activeSelectionMode !== 3 && (this._model.selectionEnd[0] = 0), this._model.selectionEnd[1] = e.ydisp), this.refresh();
    }
  }
  _handleMouseUp(e) {
    let i8 = e.timeStamp - this._mouseDownTimeStamp;
    if (this._removeMouseDownListeners(), this.selectionText.length <= 1 && i8 < Xa && e.altKey && this._optionsService.rawOptions.altClickMovesCursor) {
      if (this._bufferService.buffer.ybase === this._bufferService.buffer.ydisp) {
        let r = this._mouseService.getCoords(e, this._element, this._bufferService.cols, this._bufferService.rows, false);
        if (r && r[0] !== void 0 && r[1] !== void 0) {
          let n = Jo(r[0] - 1, r[1] - 1, this._bufferService, this._coreService.decPrivateModes.applicationCursorKeys);
          this._coreService.triggerDataEvent(n, true);
        }
      }
    } else this._fireEventIfSelectionChanged();
  }
  _fireEventIfSelectionChanged() {
    let e = this._model.finalSelectionStart, i8 = this._model.finalSelectionEnd, r = !!e && !!i8 && (e[0] !== i8[0] || e[1] !== i8[1]);
    if (!r) {
      this._oldHasSelection && this._fireOnSelectionChange(e, i8, r);
      return;
    }
    !e || !i8 || (!this._oldSelectionStart || !this._oldSelectionEnd || e[0] !== this._oldSelectionStart[0] || e[1] !== this._oldSelectionStart[1] || i8[0] !== this._oldSelectionEnd[0] || i8[1] !== this._oldSelectionEnd[1]) && this._fireOnSelectionChange(e, i8, r);
  }
  _fireOnSelectionChange(e, i8, r) {
    this._oldSelectionStart = e, this._oldSelectionEnd = i8, this._oldHasSelection = r, this._onSelectionChange.fire();
  }
  _handleBufferActivate(e) {
    this.clearSelection(), this._trimListener.dispose(), this._trimListener = e.activeBuffer.lines.onTrim((i8) => this._handleTrim(i8));
  }
  _convertViewportColToCharacterIndex(e, i8) {
    let r = i8;
    for (let n = 0; i8 >= n; n++) {
      let o2 = e.loadCell(n, this._workCell).getChars().length;
      this._workCell.getWidth() === 0 ? r-- : o2 > 1 && i8 !== n && (r += o2 - 1);
    }
    return r;
  }
  setSelection(e, i8, r) {
    this._model.clearSelection(), this._removeMouseDownListeners(), this._model.selectionStart = [e, i8], this._model.selectionStartLength = r, this.refresh(), this._fireEventIfSelectionChanged();
  }
  rightClickSelect(e) {
    this._isClickInSelection(e) || (this._selectWordAtCursor(e, false) && this.refresh(true), this._fireEventIfSelectionChanged());
  }
  _getWordAt(e, i8, r = true, n = true) {
    if (e[0] >= this._bufferService.cols) return;
    let o2 = this._bufferService.buffer, l = o2.lines.get(e[1]);
    if (!l) return;
    let a = o2.translateBufferLineToString(e[1], false), u = this._convertViewportColToCharacterIndex(l, e[0]), h2 = u, c = e[0] - u, d = 0, _2 = 0, p = 0, m = 0;
    if (a.charAt(u) === " ") {
      for (; u > 0 && a.charAt(u - 1) === " "; ) u--;
      for (; h2 < a.length && a.charAt(h2 + 1) === " "; ) h2++;
    } else {
      let R2 = e[0], O2 = e[0];
      l.getWidth(R2) === 0 && (d++, R2--), l.getWidth(O2) === 2 && (_2++, O2++);
      let I = l.getString(O2).length;
      for (I > 1 && (m += I - 1, h2 += I - 1); R2 > 0 && u > 0 && !this._isCharWordSeparator(l.loadCell(R2 - 1, this._workCell)); ) {
        l.loadCell(R2 - 1, this._workCell);
        let k2 = this._workCell.getChars().length;
        this._workCell.getWidth() === 0 ? (d++, R2--) : k2 > 1 && (p += k2 - 1, u -= k2 - 1), u--, R2--;
      }
      for (; O2 < l.length && h2 + 1 < a.length && !this._isCharWordSeparator(l.loadCell(O2 + 1, this._workCell)); ) {
        l.loadCell(O2 + 1, this._workCell);
        let k2 = this._workCell.getChars().length;
        this._workCell.getWidth() === 2 ? (_2++, O2++) : k2 > 1 && (m += k2 - 1, h2 += k2 - 1), h2++, O2++;
      }
    }
    h2++;
    let f = u + c - d + p, A = Math.min(this._bufferService.cols, h2 - u + d + _2 - p - m);
    if (!(!i8 && a.slice(u, h2).trim() === "")) {
      if (r && f === 0 && l.getCodePoint(0) !== 32) {
        let R2 = o2.lines.get(e[1] - 1);
        if (R2 && l.isWrapped && R2.getCodePoint(this._bufferService.cols - 1) !== 32) {
          let O2 = this._getWordAt([this._bufferService.cols - 1, e[1] - 1], false, true, false);
          if (O2) {
            let I = this._bufferService.cols - O2.start;
            f -= I, A += I;
          }
        }
      }
      if (n && f + A === this._bufferService.cols && l.getCodePoint(this._bufferService.cols - 1) !== 32) {
        let R2 = o2.lines.get(e[1] + 1);
        if (R2?.isWrapped && R2.getCodePoint(0) !== 32) {
          let O2 = this._getWordAt([0, e[1] + 1], false, false, true);
          O2 && (A += O2.length);
        }
      }
      return { start: f, length: A };
    }
  }
  _selectWordAt(e, i8) {
    let r = this._getWordAt(e, i8);
    if (r) {
      for (; r.start < 0; ) r.start += this._bufferService.cols, e[1]--;
      this._model.selectionStart = [r.start, e[1]], this._model.selectionStartLength = r.length;
    }
  }
  _selectToWordAt(e) {
    let i8 = this._getWordAt(e, true);
    if (i8) {
      let r = e[1];
      for (; i8.start < 0; ) i8.start += this._bufferService.cols, r--;
      if (!this._model.areSelectionValuesReversed()) for (; i8.start + i8.length > this._bufferService.cols; ) i8.length -= this._bufferService.cols, r++;
      this._model.selectionEnd = [this._model.areSelectionValuesReversed() ? i8.start : i8.start + i8.length, r];
    }
  }
  _isCharWordSeparator(e) {
    return e.getWidth() === 0 ? false : this._optionsService.rawOptions.wordSeparator.indexOf(e.getChars()) >= 0;
  }
  _selectLineAt(e) {
    let i8 = this._bufferService.buffer.getWrappedRangeForLine(e), r = { start: { x: 0, y: i8.first }, end: { x: this._bufferService.cols - 1, y: i8.last } };
    this._model.selectionStart = [0, i8.first], this._model.selectionEnd = void 0, this._model.selectionStartLength = ws(r, this._bufferService.cols);
  }
};
ei = M([S(3, F), S(4, ge), S(5, Dt), S(6, H), S(7, ce), S(8, ae)], ei);
var Hi = class {
  constructor() {
    this._data = {};
  }
  set(t, e, i8) {
    this._data[t] || (this._data[t] = {}), this._data[t][e] = i8;
  }
  get(t, e) {
    return this._data[t] ? this._data[t][e] : void 0;
  }
  clear() {
    this._data = {};
  }
};
var Wi = class {
  constructor() {
    this._color = new Hi();
    this._css = new Hi();
  }
  setCss(t, e, i8) {
    this._css.set(t, e, i8);
  }
  getCss(t, e) {
    return this._css.get(t, e);
  }
  setColor(t, e, i8) {
    this._color.set(t, e, i8);
  }
  getColor(t, e) {
    return this._color.get(t, e);
  }
  clear() {
    this._color.clear(), this._css.clear();
  }
};
var re = Object.freeze((() => {
  let s15 = [z.toColor("#2e3436"), z.toColor("#cc0000"), z.toColor("#4e9a06"), z.toColor("#c4a000"), z.toColor("#3465a4"), z.toColor("#75507b"), z.toColor("#06989a"), z.toColor("#d3d7cf"), z.toColor("#555753"), z.toColor("#ef2929"), z.toColor("#8ae234"), z.toColor("#fce94f"), z.toColor("#729fcf"), z.toColor("#ad7fa8"), z.toColor("#34e2e2"), z.toColor("#eeeeec")], t = [0, 95, 135, 175, 215, 255];
  for (let e = 0; e < 216; e++) {
    let i8 = t[e / 36 % 6 | 0], r = t[e / 6 % 6 | 0], n = t[e % 6];
    s15.push({ css: j.toCss(i8, r, n), rgba: j.toRgba(i8, r, n) });
  }
  for (let e = 0; e < 24; e++) {
    let i8 = 8 + e * 10;
    s15.push({ css: j.toCss(i8, i8, i8), rgba: j.toRgba(i8, i8, i8) });
  }
  return s15;
})());
var St = z.toColor("#ffffff");
var Ki = z.toColor("#000000");
var tl = z.toColor("#ffffff");
var il = Ki;
var Ui = { css: "rgba(255, 255, 255, 0.3)", rgba: 4294967117 };
var Qa = St;
var ti = class extends D2 {
  constructor(e) {
    super();
    this._optionsService = e;
    this._contrastCache = new Wi();
    this._halfContrastCache = new Wi();
    this._onChangeColors = this._register(new v());
    this.onChangeColors = this._onChangeColors.event;
    this._colors = { foreground: St, background: Ki, cursor: tl, cursorAccent: il, selectionForeground: void 0, selectionBackgroundTransparent: Ui, selectionBackgroundOpaque: U.blend(Ki, Ui), selectionInactiveBackgroundTransparent: Ui, selectionInactiveBackgroundOpaque: U.blend(Ki, Ui), scrollbarSliderBackground: U.opacity(St, 0.2), scrollbarSliderHoverBackground: U.opacity(St, 0.4), scrollbarSliderActiveBackground: U.opacity(St, 0.5), overviewRulerBorder: St, ansi: re.slice(), contrastCache: this._contrastCache, halfContrastCache: this._halfContrastCache }, this._updateRestoreColors(), this._setTheme(this._optionsService.rawOptions.theme), this._register(this._optionsService.onSpecificOptionChange("minimumContrastRatio", () => this._contrastCache.clear())), this._register(this._optionsService.onSpecificOptionChange("theme", () => this._setTheme(this._optionsService.rawOptions.theme)));
  }
  get colors() {
    return this._colors;
  }
  _setTheme(e = {}) {
    let i8 = this._colors;
    if (i8.foreground = K2(e.foreground, St), i8.background = K2(e.background, Ki), i8.cursor = U.blend(i8.background, K2(e.cursor, tl)), i8.cursorAccent = U.blend(i8.background, K2(e.cursorAccent, il)), i8.selectionBackgroundTransparent = K2(e.selectionBackground, Ui), i8.selectionBackgroundOpaque = U.blend(i8.background, i8.selectionBackgroundTransparent), i8.selectionInactiveBackgroundTransparent = K2(e.selectionInactiveBackground, i8.selectionBackgroundTransparent), i8.selectionInactiveBackgroundOpaque = U.blend(i8.background, i8.selectionInactiveBackgroundTransparent), i8.selectionForeground = e.selectionForeground ? K2(e.selectionForeground, ps) : void 0, i8.selectionForeground === ps && (i8.selectionForeground = void 0), U.isOpaque(i8.selectionBackgroundTransparent) && (i8.selectionBackgroundTransparent = U.opacity(i8.selectionBackgroundTransparent, 0.3)), U.isOpaque(i8.selectionInactiveBackgroundTransparent) && (i8.selectionInactiveBackgroundTransparent = U.opacity(i8.selectionInactiveBackgroundTransparent, 0.3)), i8.scrollbarSliderBackground = K2(e.scrollbarSliderBackground, U.opacity(i8.foreground, 0.2)), i8.scrollbarSliderHoverBackground = K2(e.scrollbarSliderHoverBackground, U.opacity(i8.foreground, 0.4)), i8.scrollbarSliderActiveBackground = K2(e.scrollbarSliderActiveBackground, U.opacity(i8.foreground, 0.5)), i8.overviewRulerBorder = K2(e.overviewRulerBorder, Qa), i8.ansi = re.slice(), i8.ansi[0] = K2(e.black, re[0]), i8.ansi[1] = K2(e.red, re[1]), i8.ansi[2] = K2(e.green, re[2]), i8.ansi[3] = K2(e.yellow, re[3]), i8.ansi[4] = K2(e.blue, re[4]), i8.ansi[5] = K2(e.magenta, re[5]), i8.ansi[6] = K2(e.cyan, re[6]), i8.ansi[7] = K2(e.white, re[7]), i8.ansi[8] = K2(e.brightBlack, re[8]), i8.ansi[9] = K2(e.brightRed, re[9]), i8.ansi[10] = K2(e.brightGreen, re[10]), i8.ansi[11] = K2(e.brightYellow, re[11]), i8.ansi[12] = K2(e.brightBlue, re[12]), i8.ansi[13] = K2(e.brightMagenta, re[13]), i8.ansi[14] = K2(e.brightCyan, re[14]), i8.ansi[15] = K2(e.brightWhite, re[15]), e.extendedAnsi) {
      let r = Math.min(i8.ansi.length - 16, e.extendedAnsi.length);
      for (let n = 0; n < r; n++) i8.ansi[n + 16] = K2(e.extendedAnsi[n], re[n + 16]);
    }
    this._contrastCache.clear(), this._halfContrastCache.clear(), this._updateRestoreColors(), this._onChangeColors.fire(this.colors);
  }
  restoreColor(e) {
    this._restoreColor(e), this._onChangeColors.fire(this.colors);
  }
  _restoreColor(e) {
    if (e === void 0) {
      for (let i8 = 0; i8 < this._restoreColors.ansi.length; ++i8) this._colors.ansi[i8] = this._restoreColors.ansi[i8];
      return;
    }
    switch (e) {
      case 256:
        this._colors.foreground = this._restoreColors.foreground;
        break;
      case 257:
        this._colors.background = this._restoreColors.background;
        break;
      case 258:
        this._colors.cursor = this._restoreColors.cursor;
        break;
      default:
        this._colors.ansi[e] = this._restoreColors.ansi[e];
    }
  }
  modifyColors(e) {
    e(this._colors), this._onChangeColors.fire(this.colors);
  }
  _updateRestoreColors() {
    this._restoreColors = { foreground: this._colors.foreground, background: this._colors.background, cursor: this._colors.cursor, ansi: this._colors.ansi.slice() };
  }
};
ti = M([S(0, H)], ti);
function K2(s15, t) {
  if (s15 !== void 0) try {
    return z.toColor(s15);
  } catch {
  }
  return t;
}
var Rs = class {
  constructor(...t) {
    this._entries = /* @__PURE__ */ new Map();
    for (let [e, i8] of t) this.set(e, i8);
  }
  set(t, e) {
    let i8 = this._entries.get(t);
    return this._entries.set(t, e), i8;
  }
  forEach(t) {
    for (let [e, i8] of this._entries.entries()) t(e, i8);
  }
  has(t) {
    return this._entries.has(t);
  }
  get(t) {
    return this._entries.get(t);
  }
};
var ln = class {
  constructor() {
    this._services = new Rs();
    this._services.set(xt, this);
  }
  setService(t, e) {
    this._services.set(t, e);
  }
  getService(t) {
    return this._services.get(t);
  }
  createInstance(t, ...e) {
    let i8 = Xs(t).sort((o2, l) => o2.index - l.index), r = [];
    for (let o2 of i8) {
      let l = this._services.get(o2.id);
      if (!l) throw new Error(`[createInstance] ${t.name} depends on UNKNOWN service ${o2.id._id}.`);
      r.push(l);
    }
    let n = i8.length > 0 ? i8[0].index : e.length;
    if (e.length !== n) throw new Error(`[createInstance] First service dependency of ${t.name} at position ${n + 1} conflicts with ${e.length} static arguments`);
    return new t(...e, ...r);
  }
};
var ec = { trace: 0, debug: 1, info: 2, warn: 3, error: 4, off: 5 };
var tc = "xterm.js: ";
var ii = class extends D2 {
  constructor(e) {
    super();
    this._optionsService = e;
    this._logLevel = 5;
    this._updateLogLevel(), this._register(this._optionsService.onSpecificOptionChange("logLevel", () => this._updateLogLevel())), ic = this;
  }
  get logLevel() {
    return this._logLevel;
  }
  _updateLogLevel() {
    this._logLevel = ec[this._optionsService.rawOptions.logLevel];
  }
  _evalLazyOptionalParams(e) {
    for (let i8 = 0; i8 < e.length; i8++) typeof e[i8] == "function" && (e[i8] = e[i8]());
  }
  _log(e, i8, r) {
    this._evalLazyOptionalParams(r), e.call(console, (this._optionsService.options.logger ? "" : tc) + i8, ...r);
  }
  trace(e, ...i8) {
    this._logLevel <= 0 && this._log(this._optionsService.options.logger?.trace.bind(this._optionsService.options.logger) ?? console.log, e, i8);
  }
  debug(e, ...i8) {
    this._logLevel <= 1 && this._log(this._optionsService.options.logger?.debug.bind(this._optionsService.options.logger) ?? console.log, e, i8);
  }
  info(e, ...i8) {
    this._logLevel <= 2 && this._log(this._optionsService.options.logger?.info.bind(this._optionsService.options.logger) ?? console.info, e, i8);
  }
  warn(e, ...i8) {
    this._logLevel <= 3 && this._log(this._optionsService.options.logger?.warn.bind(this._optionsService.options.logger) ?? console.warn, e, i8);
  }
  error(e, ...i8) {
    this._logLevel <= 4 && this._log(this._optionsService.options.logger?.error.bind(this._optionsService.options.logger) ?? console.error, e, i8);
  }
};
ii = M([S(0, H)], ii);
var ic;
var zi = class extends D2 {
  constructor(e) {
    super();
    this._maxLength = e;
    this.onDeleteEmitter = this._register(new v());
    this.onDelete = this.onDeleteEmitter.event;
    this.onInsertEmitter = this._register(new v());
    this.onInsert = this.onInsertEmitter.event;
    this.onTrimEmitter = this._register(new v());
    this.onTrim = this.onTrimEmitter.event;
    this._array = new Array(this._maxLength), this._startIndex = 0, this._length = 0;
  }
  get maxLength() {
    return this._maxLength;
  }
  set maxLength(e) {
    if (this._maxLength === e) return;
    let i8 = new Array(e);
    for (let r = 0; r < Math.min(e, this.length); r++) i8[r] = this._array[this._getCyclicIndex(r)];
    this._array = i8, this._maxLength = e, this._startIndex = 0;
  }
  get length() {
    return this._length;
  }
  set length(e) {
    if (e > this._length) for (let i8 = this._length; i8 < e; i8++) this._array[i8] = void 0;
    this._length = e;
  }
  get(e) {
    return this._array[this._getCyclicIndex(e)];
  }
  set(e, i8) {
    this._array[this._getCyclicIndex(e)] = i8;
  }
  push(e) {
    this._array[this._getCyclicIndex(this._length)] = e, this._length === this._maxLength ? (this._startIndex = ++this._startIndex % this._maxLength, this.onTrimEmitter.fire(1)) : this._length++;
  }
  recycle() {
    if (this._length !== this._maxLength) throw new Error("Can only recycle when the buffer is full");
    return this._startIndex = ++this._startIndex % this._maxLength, this.onTrimEmitter.fire(1), this._array[this._getCyclicIndex(this._length - 1)];
  }
  get isFull() {
    return this._length === this._maxLength;
  }
  pop() {
    return this._array[this._getCyclicIndex(this._length-- - 1)];
  }
  splice(e, i8, ...r) {
    if (i8) {
      for (let n = e; n < this._length - i8; n++) this._array[this._getCyclicIndex(n)] = this._array[this._getCyclicIndex(n + i8)];
      this._length -= i8, this.onDeleteEmitter.fire({ index: e, amount: i8 });
    }
    for (let n = this._length - 1; n >= e; n--) this._array[this._getCyclicIndex(n + r.length)] = this._array[this._getCyclicIndex(n)];
    for (let n = 0; n < r.length; n++) this._array[this._getCyclicIndex(e + n)] = r[n];
    if (r.length && this.onInsertEmitter.fire({ index: e, amount: r.length }), this._length + r.length > this._maxLength) {
      let n = this._length + r.length - this._maxLength;
      this._startIndex += n, this._length = this._maxLength, this.onTrimEmitter.fire(n);
    } else this._length += r.length;
  }
  trimStart(e) {
    e > this._length && (e = this._length), this._startIndex += e, this._length -= e, this.onTrimEmitter.fire(e);
  }
  shiftElements(e, i8, r) {
    if (!(i8 <= 0)) {
      if (e < 0 || e >= this._length) throw new Error("start argument out of range");
      if (e + r < 0) throw new Error("Cannot shift elements in list beyond index 0");
      if (r > 0) {
        for (let o2 = i8 - 1; o2 >= 0; o2--) this.set(e + o2 + r, this.get(e + o2));
        let n = e + i8 + r - this._length;
        if (n > 0) for (this._length += n; this._length > this._maxLength; ) this._length--, this._startIndex++, this.onTrimEmitter.fire(1);
      } else for (let n = 0; n < i8; n++) this.set(e + n + r, this.get(e + n));
    }
  }
  _getCyclicIndex(e) {
    return (this._startIndex + e) % this._maxLength;
  }
};
var B2 = 3;
var X = Object.freeze(new De());
var an = 0;
var Ls = 2;
var Ze = class s12 {
  constructor(t, e, i8 = false) {
    this.isWrapped = i8;
    this._combined = {};
    this._extendedAttrs = {};
    this._data = new Uint32Array(t * B2);
    let r = e || q.fromCharData([0, ir, 1, 0]);
    for (let n = 0; n < t; ++n) this.setCell(n, r);
    this.length = t;
  }
  get(t) {
    let e = this._data[t * B2 + 0], i8 = e & 2097151;
    return [this._data[t * B2 + 1], e & 2097152 ? this._combined[t] : i8 ? Ce(i8) : "", e >> 22, e & 2097152 ? this._combined[t].charCodeAt(this._combined[t].length - 1) : i8];
  }
  set(t, e) {
    this._data[t * B2 + 1] = e[0], e[1].length > 1 ? (this._combined[t] = e[1], this._data[t * B2 + 0] = t | 2097152 | e[2] << 22) : this._data[t * B2 + 0] = e[1].charCodeAt(0) | e[2] << 22;
  }
  getWidth(t) {
    return this._data[t * B2 + 0] >> 22;
  }
  hasWidth(t) {
    return this._data[t * B2 + 0] & 12582912;
  }
  getFg(t) {
    return this._data[t * B2 + 1];
  }
  getBg(t) {
    return this._data[t * B2 + 2];
  }
  hasContent(t) {
    return this._data[t * B2 + 0] & 4194303;
  }
  getCodePoint(t) {
    let e = this._data[t * B2 + 0];
    return e & 2097152 ? this._combined[t].charCodeAt(this._combined[t].length - 1) : e & 2097151;
  }
  isCombined(t) {
    return this._data[t * B2 + 0] & 2097152;
  }
  getString(t) {
    let e = this._data[t * B2 + 0];
    return e & 2097152 ? this._combined[t] : e & 2097151 ? Ce(e & 2097151) : "";
  }
  isProtected(t) {
    return this._data[t * B2 + 2] & 536870912;
  }
  loadCell(t, e) {
    return an = t * B2, e.content = this._data[an + 0], e.fg = this._data[an + 1], e.bg = this._data[an + 2], e.content & 2097152 && (e.combinedData = this._combined[t]), e.bg & 268435456 && (e.extended = this._extendedAttrs[t]), e;
  }
  setCell(t, e) {
    e.content & 2097152 && (this._combined[t] = e.combinedData), e.bg & 268435456 && (this._extendedAttrs[t] = e.extended), this._data[t * B2 + 0] = e.content, this._data[t * B2 + 1] = e.fg, this._data[t * B2 + 2] = e.bg;
  }
  setCellFromCodepoint(t, e, i8, r) {
    r.bg & 268435456 && (this._extendedAttrs[t] = r.extended), this._data[t * B2 + 0] = e | i8 << 22, this._data[t * B2 + 1] = r.fg, this._data[t * B2 + 2] = r.bg;
  }
  addCodepointToCell(t, e, i8) {
    let r = this._data[t * B2 + 0];
    r & 2097152 ? this._combined[t] += Ce(e) : r & 2097151 ? (this._combined[t] = Ce(r & 2097151) + Ce(e), r &= -2097152, r |= 2097152) : r = e | 1 << 22, i8 && (r &= -12582913, r |= i8 << 22), this._data[t * B2 + 0] = r;
  }
  insertCells(t, e, i8) {
    if (t %= this.length, t && this.getWidth(t - 1) === 2 && this.setCellFromCodepoint(t - 1, 0, 1, i8), e < this.length - t) {
      let r = new q();
      for (let n = this.length - t - e - 1; n >= 0; --n) this.setCell(t + e + n, this.loadCell(t + n, r));
      for (let n = 0; n < e; ++n) this.setCell(t + n, i8);
    } else for (let r = t; r < this.length; ++r) this.setCell(r, i8);
    this.getWidth(this.length - 1) === 2 && this.setCellFromCodepoint(this.length - 1, 0, 1, i8);
  }
  deleteCells(t, e, i8) {
    if (t %= this.length, e < this.length - t) {
      let r = new q();
      for (let n = 0; n < this.length - t - e; ++n) this.setCell(t + n, this.loadCell(t + e + n, r));
      for (let n = this.length - e; n < this.length; ++n) this.setCell(n, i8);
    } else for (let r = t; r < this.length; ++r) this.setCell(r, i8);
    t && this.getWidth(t - 1) === 2 && this.setCellFromCodepoint(t - 1, 0, 1, i8), this.getWidth(t) === 0 && !this.hasContent(t) && this.setCellFromCodepoint(t, 0, 1, i8);
  }
  replaceCells(t, e, i8, r = false) {
    if (r) {
      for (t && this.getWidth(t - 1) === 2 && !this.isProtected(t - 1) && this.setCellFromCodepoint(t - 1, 0, 1, i8), e < this.length && this.getWidth(e - 1) === 2 && !this.isProtected(e) && this.setCellFromCodepoint(e, 0, 1, i8); t < e && t < this.length; ) this.isProtected(t) || this.setCell(t, i8), t++;
      return;
    }
    for (t && this.getWidth(t - 1) === 2 && this.setCellFromCodepoint(t - 1, 0, 1, i8), e < this.length && this.getWidth(e - 1) === 2 && this.setCellFromCodepoint(e, 0, 1, i8); t < e && t < this.length; ) this.setCell(t++, i8);
  }
  resize(t, e) {
    if (t === this.length) return this._data.length * 4 * Ls < this._data.buffer.byteLength;
    let i8 = t * B2;
    if (t > this.length) {
      if (this._data.buffer.byteLength >= i8 * 4) this._data = new Uint32Array(this._data.buffer, 0, i8);
      else {
        let r = new Uint32Array(i8);
        r.set(this._data), this._data = r;
      }
      for (let r = this.length; r < t; ++r) this.setCell(r, e);
    } else {
      this._data = this._data.subarray(0, i8);
      let r = Object.keys(this._combined);
      for (let o2 = 0; o2 < r.length; o2++) {
        let l = parseInt(r[o2], 10);
        l >= t && delete this._combined[l];
      }
      let n = Object.keys(this._extendedAttrs);
      for (let o2 = 0; o2 < n.length; o2++) {
        let l = parseInt(n[o2], 10);
        l >= t && delete this._extendedAttrs[l];
      }
    }
    return this.length = t, i8 * 4 * Ls < this._data.buffer.byteLength;
  }
  cleanupMemory() {
    if (this._data.length * 4 * Ls < this._data.buffer.byteLength) {
      let t = new Uint32Array(this._data.length);
      return t.set(this._data), this._data = t, 1;
    }
    return 0;
  }
  fill(t, e = false) {
    if (e) {
      for (let i8 = 0; i8 < this.length; ++i8) this.isProtected(i8) || this.setCell(i8, t);
      return;
    }
    this._combined = {}, this._extendedAttrs = {};
    for (let i8 = 0; i8 < this.length; ++i8) this.setCell(i8, t);
  }
  copyFrom(t) {
    this.length !== t.length ? this._data = new Uint32Array(t._data) : this._data.set(t._data), this.length = t.length, this._combined = {};
    for (let e in t._combined) this._combined[e] = t._combined[e];
    this._extendedAttrs = {};
    for (let e in t._extendedAttrs) this._extendedAttrs[e] = t._extendedAttrs[e];
    this.isWrapped = t.isWrapped;
  }
  clone() {
    let t = new s12(0);
    t._data = new Uint32Array(this._data), t.length = this.length;
    for (let e in this._combined) t._combined[e] = this._combined[e];
    for (let e in this._extendedAttrs) t._extendedAttrs[e] = this._extendedAttrs[e];
    return t.isWrapped = this.isWrapped, t;
  }
  getTrimmedLength() {
    for (let t = this.length - 1; t >= 0; --t) if (this._data[t * B2 + 0] & 4194303) return t + (this._data[t * B2 + 0] >> 22);
    return 0;
  }
  getNoBgTrimmedLength() {
    for (let t = this.length - 1; t >= 0; --t) if (this._data[t * B2 + 0] & 4194303 || this._data[t * B2 + 2] & 50331648) return t + (this._data[t * B2 + 0] >> 22);
    return 0;
  }
  copyCellsFrom(t, e, i8, r, n) {
    let o2 = t._data;
    if (n) for (let a = r - 1; a >= 0; a--) {
      for (let u = 0; u < B2; u++) this._data[(i8 + a) * B2 + u] = o2[(e + a) * B2 + u];
      o2[(e + a) * B2 + 2] & 268435456 && (this._extendedAttrs[i8 + a] = t._extendedAttrs[e + a]);
    }
    else for (let a = 0; a < r; a++) {
      for (let u = 0; u < B2; u++) this._data[(i8 + a) * B2 + u] = o2[(e + a) * B2 + u];
      o2[(e + a) * B2 + 2] & 268435456 && (this._extendedAttrs[i8 + a] = t._extendedAttrs[e + a]);
    }
    let l = Object.keys(t._combined);
    for (let a = 0; a < l.length; a++) {
      let u = parseInt(l[a], 10);
      u >= e && (this._combined[u - e + i8] = t._combined[u]);
    }
  }
  translateToString(t, e, i8, r) {
    e = e ?? 0, i8 = i8 ?? this.length, t && (i8 = Math.min(i8, this.getTrimmedLength())), r && (r.length = 0);
    let n = "";
    for (; e < i8; ) {
      let o2 = this._data[e * B2 + 0], l = o2 & 2097151, a = o2 & 2097152 ? this._combined[e] : l ? Ce(l) : we;
      if (n += a, r) for (let u = 0; u < a.length; ++u) r.push(e);
      e += o2 >> 22 || 1;
    }
    return r && r.push(e), n;
  }
};
function sl(s15, t, e, i8, r, n) {
  let o2 = [];
  for (let l = 0; l < s15.length - 1; l++) {
    let a = l, u = s15.get(++a);
    if (!u.isWrapped) continue;
    let h2 = [s15.get(l)];
    for (; a < s15.length && u.isWrapped; ) h2.push(u), u = s15.get(++a);
    if (!n && i8 >= l && i8 < a) {
      l += h2.length - 1;
      continue;
    }
    let c = 0, d = ri(h2, c, t), _2 = 1, p = 0;
    for (; _2 < h2.length; ) {
      let f = ri(h2, _2, t), A = f - p, R2 = e - d, O2 = Math.min(A, R2);
      h2[c].copyCellsFrom(h2[_2], p, d, O2, false), d += O2, d === e && (c++, d = 0), p += O2, p === f && (_2++, p = 0), d === 0 && c !== 0 && h2[c - 1].getWidth(e - 1) === 2 && (h2[c].copyCellsFrom(h2[c - 1], e - 1, d++, 1, false), h2[c - 1].setCell(e - 1, r));
    }
    h2[c].replaceCells(d, e, r);
    let m = 0;
    for (let f = h2.length - 1; f > 0 && (f > c || h2[f].getTrimmedLength() === 0); f--) m++;
    m > 0 && (o2.push(l + h2.length - m), o2.push(m)), l += h2.length - 1;
  }
  return o2;
}
function ol(s15, t) {
  let e = [], i8 = 0, r = t[i8], n = 0;
  for (let o2 = 0; o2 < s15.length; o2++) if (r === o2) {
    let l = t[++i8];
    s15.onDeleteEmitter.fire({ index: o2 - n, amount: l }), o2 += l - 1, n += l, r = t[++i8];
  } else e.push(o2);
  return { layout: e, countRemoved: n };
}
function ll(s15, t) {
  let e = [];
  for (let i8 = 0; i8 < t.length; i8++) e.push(s15.get(t[i8]));
  for (let i8 = 0; i8 < e.length; i8++) s15.set(i8, e[i8]);
  s15.length = t.length;
}
function al(s15, t, e) {
  let i8 = [], r = s15.map((a, u) => ri(s15, u, t)).reduce((a, u) => a + u), n = 0, o2 = 0, l = 0;
  for (; l < r; ) {
    if (r - l < e) {
      i8.push(r - l);
      break;
    }
    n += e;
    let a = ri(s15, o2, t);
    n > a && (n -= a, o2++);
    let u = s15[o2].getWidth(n - 1) === 2;
    u && n--;
    let h2 = u ? e - 1 : e;
    i8.push(h2), l += h2;
  }
  return i8;
}
function ri(s15, t, e) {
  if (t === s15.length - 1) return s15[t].getTrimmedLength();
  let i8 = !s15[t].hasContent(e - 1) && s15[t].getWidth(e - 1) === 1, r = s15[t + 1].getWidth(0) === 2;
  return i8 && r ? e - 1 : e;
}
var un = class un2 {
  constructor(t) {
    this.line = t;
    this.isDisposed = false;
    this._disposables = [];
    this._id = un2._nextId++;
    this._onDispose = this.register(new v());
    this.onDispose = this._onDispose.event;
  }
  get id() {
    return this._id;
  }
  dispose() {
    this.isDisposed || (this.isDisposed = true, this.line = -1, this._onDispose.fire(), Ne(this._disposables), this._disposables.length = 0);
  }
  register(t) {
    return this._disposables.push(t), t;
  }
};
un._nextId = 1;
var cn = un;
var ne = {};
var Je = ne.B;
ne[0] = { "`": "\u25C6", a: "\u2592", b: "\u2409", c: "\u240C", d: "\u240D", e: "\u240A", f: "\xB0", g: "\xB1", h: "\u2424", i: "\u240B", j: "\u2518", k: "\u2510", l: "\u250C", m: "\u2514", n: "\u253C", o: "\u23BA", p: "\u23BB", q: "\u2500", r: "\u23BC", s: "\u23BD", t: "\u251C", u: "\u2524", v: "\u2534", w: "\u252C", x: "\u2502", y: "\u2264", z: "\u2265", "{": "\u03C0", "|": "\u2260", "}": "\xA3", "~": "\xB7" };
ne.A = { "#": "\xA3" };
ne.B = void 0;
ne[4] = { "#": "\xA3", "@": "\xBE", "[": "ij", "\\": "\xBD", "]": "|", "{": "\xA8", "|": "f", "}": "\xBC", "~": "\xB4" };
ne.C = ne[5] = { "[": "\xC4", "\\": "\xD6", "]": "\xC5", "^": "\xDC", "`": "\xE9", "{": "\xE4", "|": "\xF6", "}": "\xE5", "~": "\xFC" };
ne.R = { "#": "\xA3", "@": "\xE0", "[": "\xB0", "\\": "\xE7", "]": "\xA7", "{": "\xE9", "|": "\xF9", "}": "\xE8", "~": "\xA8" };
ne.Q = { "@": "\xE0", "[": "\xE2", "\\": "\xE7", "]": "\xEA", "^": "\xEE", "`": "\xF4", "{": "\xE9", "|": "\xF9", "}": "\xE8", "~": "\xFB" };
ne.K = { "@": "\xA7", "[": "\xC4", "\\": "\xD6", "]": "\xDC", "{": "\xE4", "|": "\xF6", "}": "\xFC", "~": "\xDF" };
ne.Y = { "#": "\xA3", "@": "\xA7", "[": "\xB0", "\\": "\xE7", "]": "\xE9", "`": "\xF9", "{": "\xE0", "|": "\xF2", "}": "\xE8", "~": "\xEC" };
ne.E = ne[6] = { "@": "\xC4", "[": "\xC6", "\\": "\xD8", "]": "\xC5", "^": "\xDC", "`": "\xE4", "{": "\xE6", "|": "\xF8", "}": "\xE5", "~": "\xFC" };
ne.Z = { "#": "\xA3", "@": "\xA7", "[": "\xA1", "\\": "\xD1", "]": "\xBF", "{": "\xB0", "|": "\xF1", "}": "\xE7" };
ne.H = ne[7] = { "@": "\xC9", "[": "\xC4", "\\": "\xD6", "]": "\xC5", "^": "\xDC", "`": "\xE9", "{": "\xE4", "|": "\xF6", "}": "\xE5", "~": "\xFC" };
ne["="] = { "#": "\xF9", "@": "\xE0", "[": "\xE9", "\\": "\xE7", "]": "\xEA", "^": "\xEE", _: "\xE8", "`": "\xF4", "{": "\xE4", "|": "\xF6", "}": "\xFC", "~": "\xFB" };
var cl = 4294967295;
var $i = class {
  constructor(t, e, i8) {
    this._hasScrollback = t;
    this._optionsService = e;
    this._bufferService = i8;
    this.ydisp = 0;
    this.ybase = 0;
    this.y = 0;
    this.x = 0;
    this.tabs = {};
    this.savedY = 0;
    this.savedX = 0;
    this.savedCurAttrData = X.clone();
    this.savedCharset = Je;
    this.markers = [];
    this._nullCell = q.fromCharData([0, ir, 1, 0]);
    this._whitespaceCell = q.fromCharData([0, we, 1, 32]);
    this._isClearing = false;
    this._memoryCleanupQueue = new Jt();
    this._memoryCleanupPosition = 0;
    this._cols = this._bufferService.cols, this._rows = this._bufferService.rows, this.lines = new zi(this._getCorrectBufferLength(this._rows)), this.scrollTop = 0, this.scrollBottom = this._rows - 1, this.setupTabStops();
  }
  getNullCell(t) {
    return t ? (this._nullCell.fg = t.fg, this._nullCell.bg = t.bg, this._nullCell.extended = t.extended) : (this._nullCell.fg = 0, this._nullCell.bg = 0, this._nullCell.extended = new rt()), this._nullCell;
  }
  getWhitespaceCell(t) {
    return t ? (this._whitespaceCell.fg = t.fg, this._whitespaceCell.bg = t.bg, this._whitespaceCell.extended = t.extended) : (this._whitespaceCell.fg = 0, this._whitespaceCell.bg = 0, this._whitespaceCell.extended = new rt()), this._whitespaceCell;
  }
  getBlankLine(t, e) {
    return new Ze(this._bufferService.cols, this.getNullCell(t), e);
  }
  get hasScrollback() {
    return this._hasScrollback && this.lines.maxLength > this._rows;
  }
  get isCursorInViewport() {
    let e = this.ybase + this.y - this.ydisp;
    return e >= 0 && e < this._rows;
  }
  _getCorrectBufferLength(t) {
    if (!this._hasScrollback) return t;
    let e = t + this._optionsService.rawOptions.scrollback;
    return e > cl ? cl : e;
  }
  fillViewportRows(t) {
    if (this.lines.length === 0) {
      t === void 0 && (t = X);
      let e = this._rows;
      for (; e--; ) this.lines.push(this.getBlankLine(t));
    }
  }
  clear() {
    this.ydisp = 0, this.ybase = 0, this.y = 0, this.x = 0, this.lines = new zi(this._getCorrectBufferLength(this._rows)), this.scrollTop = 0, this.scrollBottom = this._rows - 1, this.setupTabStops();
  }
  resize(t, e) {
    let i8 = this.getNullCell(X), r = 0, n = this._getCorrectBufferLength(e);
    if (n > this.lines.maxLength && (this.lines.maxLength = n), this.lines.length > 0) {
      if (this._cols < t) for (let l = 0; l < this.lines.length; l++) r += +this.lines.get(l).resize(t, i8);
      let o2 = 0;
      if (this._rows < e) for (let l = this._rows; l < e; l++) this.lines.length < e + this.ybase && (this._optionsService.rawOptions.windowsMode || this._optionsService.rawOptions.windowsPty.backend !== void 0 || this._optionsService.rawOptions.windowsPty.buildNumber !== void 0 ? this.lines.push(new Ze(t, i8)) : this.ybase > 0 && this.lines.length <= this.ybase + this.y + o2 + 1 ? (this.ybase--, o2++, this.ydisp > 0 && this.ydisp--) : this.lines.push(new Ze(t, i8)));
      else for (let l = this._rows; l > e; l--) this.lines.length > e + this.ybase && (this.lines.length > this.ybase + this.y + 1 ? this.lines.pop() : (this.ybase++, this.ydisp++));
      if (n < this.lines.maxLength) {
        let l = this.lines.length - n;
        l > 0 && (this.lines.trimStart(l), this.ybase = Math.max(this.ybase - l, 0), this.ydisp = Math.max(this.ydisp - l, 0), this.savedY = Math.max(this.savedY - l, 0)), this.lines.maxLength = n;
      }
      this.x = Math.min(this.x, t - 1), this.y = Math.min(this.y, e - 1), o2 && (this.y += o2), this.savedX = Math.min(this.savedX, t - 1), this.scrollTop = 0;
    }
    if (this.scrollBottom = e - 1, this._isReflowEnabled && (this._reflow(t, e), this._cols > t)) for (let o2 = 0; o2 < this.lines.length; o2++) r += +this.lines.get(o2).resize(t, i8);
    this._cols = t, this._rows = e, this._memoryCleanupQueue.clear(), r > 0.1 * this.lines.length && (this._memoryCleanupPosition = 0, this._memoryCleanupQueue.enqueue(() => this._batchedMemoryCleanup()));
  }
  _batchedMemoryCleanup() {
    let t = true;
    this._memoryCleanupPosition >= this.lines.length && (this._memoryCleanupPosition = 0, t = false);
    let e = 0;
    for (; this._memoryCleanupPosition < this.lines.length; ) if (e += this.lines.get(this._memoryCleanupPosition++).cleanupMemory(), e > 100) return true;
    return t;
  }
  get _isReflowEnabled() {
    let t = this._optionsService.rawOptions.windowsPty;
    return t && t.buildNumber ? this._hasScrollback && t.backend === "conpty" && t.buildNumber >= 21376 : this._hasScrollback && !this._optionsService.rawOptions.windowsMode;
  }
  _reflow(t, e) {
    this._cols !== t && (t > this._cols ? this._reflowLarger(t, e) : this._reflowSmaller(t, e));
  }
  _reflowLarger(t, e) {
    let i8 = this._optionsService.rawOptions.reflowCursorLine, r = sl(this.lines, this._cols, t, this.ybase + this.y, this.getNullCell(X), i8);
    if (r.length > 0) {
      let n = ol(this.lines, r);
      ll(this.lines, n.layout), this._reflowLargerAdjustViewport(t, e, n.countRemoved);
    }
  }
  _reflowLargerAdjustViewport(t, e, i8) {
    let r = this.getNullCell(X), n = i8;
    for (; n-- > 0; ) this.ybase === 0 ? (this.y > 0 && this.y--, this.lines.length < e && this.lines.push(new Ze(t, r))) : (this.ydisp === this.ybase && this.ydisp--, this.ybase--);
    this.savedY = Math.max(this.savedY - i8, 0);
  }
  _reflowSmaller(t, e) {
    let i8 = this._optionsService.rawOptions.reflowCursorLine, r = this.getNullCell(X), n = [], o2 = 0;
    for (let l = this.lines.length - 1; l >= 0; l--) {
      let a = this.lines.get(l);
      if (!a || !a.isWrapped && a.getTrimmedLength() <= t) continue;
      let u = [a];
      for (; a.isWrapped && l > 0; ) a = this.lines.get(--l), u.unshift(a);
      if (!i8) {
        let I = this.ybase + this.y;
        if (I >= l && I < l + u.length) continue;
      }
      let h2 = u[u.length - 1].getTrimmedLength(), c = al(u, this._cols, t), d = c.length - u.length, _2;
      this.ybase === 0 && this.y !== this.lines.length - 1 ? _2 = Math.max(0, this.y - this.lines.maxLength + d) : _2 = Math.max(0, this.lines.length - this.lines.maxLength + d);
      let p = [];
      for (let I = 0; I < d; I++) {
        let k2 = this.getBlankLine(X, true);
        p.push(k2);
      }
      p.length > 0 && (n.push({ start: l + u.length + o2, newLines: p }), o2 += p.length), u.push(...p);
      let m = c.length - 1, f = c[m];
      f === 0 && (m--, f = c[m]);
      let A = u.length - d - 1, R2 = h2;
      for (; A >= 0; ) {
        let I = Math.min(R2, f);
        if (u[m] === void 0) break;
        if (u[m].copyCellsFrom(u[A], R2 - I, f - I, I, true), f -= I, f === 0 && (m--, f = c[m]), R2 -= I, R2 === 0) {
          A--;
          let k2 = Math.max(A, 0);
          R2 = ri(u, k2, this._cols);
        }
      }
      for (let I = 0; I < u.length; I++) c[I] < t && u[I].setCell(c[I], r);
      let O2 = d - _2;
      for (; O2-- > 0; ) this.ybase === 0 ? this.y < e - 1 ? (this.y++, this.lines.pop()) : (this.ybase++, this.ydisp++) : this.ybase < Math.min(this.lines.maxLength, this.lines.length + o2) - e && (this.ybase === this.ydisp && this.ydisp++, this.ybase++);
      this.savedY = Math.min(this.savedY + d, this.ybase + e - 1);
    }
    if (n.length > 0) {
      let l = [], a = [];
      for (let f = 0; f < this.lines.length; f++) a.push(this.lines.get(f));
      let u = this.lines.length, h2 = u - 1, c = 0, d = n[c];
      this.lines.length = Math.min(this.lines.maxLength, this.lines.length + o2);
      let _2 = 0;
      for (let f = Math.min(this.lines.maxLength - 1, u + o2 - 1); f >= 0; f--) if (d && d.start > h2 + _2) {
        for (let A = d.newLines.length - 1; A >= 0; A--) this.lines.set(f--, d.newLines[A]);
        f++, l.push({ index: h2 + 1, amount: d.newLines.length }), _2 += d.newLines.length, d = n[++c];
      } else this.lines.set(f, a[h2--]);
      let p = 0;
      for (let f = l.length - 1; f >= 0; f--) l[f].index += p, this.lines.onInsertEmitter.fire(l[f]), p += l[f].amount;
      let m = Math.max(0, u + o2 - this.lines.maxLength);
      m > 0 && this.lines.onTrimEmitter.fire(m);
    }
  }
  translateBufferLineToString(t, e, i8 = 0, r) {
    let n = this.lines.get(t);
    return n ? n.translateToString(e, i8, r) : "";
  }
  getWrappedRangeForLine(t) {
    let e = t, i8 = t;
    for (; e > 0 && this.lines.get(e).isWrapped; ) e--;
    for (; i8 + 1 < this.lines.length && this.lines.get(i8 + 1).isWrapped; ) i8++;
    return { first: e, last: i8 };
  }
  setupTabStops(t) {
    for (t != null ? this.tabs[t] || (t = this.prevStop(t)) : (this.tabs = {}, t = 0); t < this._cols; t += this._optionsService.rawOptions.tabStopWidth) this.tabs[t] = true;
  }
  prevStop(t) {
    for (t == null && (t = this.x); !this.tabs[--t] && t > 0; ) ;
    return t >= this._cols ? this._cols - 1 : t < 0 ? 0 : t;
  }
  nextStop(t) {
    for (t == null && (t = this.x); !this.tabs[++t] && t < this._cols; ) ;
    return t >= this._cols ? this._cols - 1 : t < 0 ? 0 : t;
  }
  clearMarkers(t) {
    this._isClearing = true;
    for (let e = 0; e < this.markers.length; e++) this.markers[e].line === t && (this.markers[e].dispose(), this.markers.splice(e--, 1));
    this._isClearing = false;
  }
  clearAllMarkers() {
    this._isClearing = true;
    for (let t = 0; t < this.markers.length; t++) this.markers[t].dispose();
    this.markers.length = 0, this._isClearing = false;
  }
  addMarker(t) {
    let e = new cn(t);
    return this.markers.push(e), e.register(this.lines.onTrim((i8) => {
      e.line -= i8, e.line < 0 && e.dispose();
    })), e.register(this.lines.onInsert((i8) => {
      e.line >= i8.index && (e.line += i8.amount);
    })), e.register(this.lines.onDelete((i8) => {
      e.line >= i8.index && e.line < i8.index + i8.amount && e.dispose(), e.line > i8.index && (e.line -= i8.amount);
    })), e.register(e.onDispose(() => this._removeMarker(e))), e;
  }
  _removeMarker(t) {
    this._isClearing || this.markers.splice(this.markers.indexOf(t), 1);
  }
};
var hn = class extends D2 {
  constructor(e, i8) {
    super();
    this._optionsService = e;
    this._bufferService = i8;
    this._onBufferActivate = this._register(new v());
    this.onBufferActivate = this._onBufferActivate.event;
    this.reset(), this._register(this._optionsService.onSpecificOptionChange("scrollback", () => this.resize(this._bufferService.cols, this._bufferService.rows))), this._register(this._optionsService.onSpecificOptionChange("tabStopWidth", () => this.setupTabStops()));
  }
  reset() {
    this._normal = new $i(true, this._optionsService, this._bufferService), this._normal.fillViewportRows(), this._alt = new $i(false, this._optionsService, this._bufferService), this._activeBuffer = this._normal, this._onBufferActivate.fire({ activeBuffer: this._normal, inactiveBuffer: this._alt }), this.setupTabStops();
  }
  get alt() {
    return this._alt;
  }
  get active() {
    return this._activeBuffer;
  }
  get normal() {
    return this._normal;
  }
  activateNormalBuffer() {
    this._activeBuffer !== this._normal && (this._normal.x = this._alt.x, this._normal.y = this._alt.y, this._alt.clearAllMarkers(), this._alt.clear(), this._activeBuffer = this._normal, this._onBufferActivate.fire({ activeBuffer: this._normal, inactiveBuffer: this._alt }));
  }
  activateAltBuffer(e) {
    this._activeBuffer !== this._alt && (this._alt.fillViewportRows(e), this._alt.x = this._normal.x, this._alt.y = this._normal.y, this._activeBuffer = this._alt, this._onBufferActivate.fire({ activeBuffer: this._alt, inactiveBuffer: this._normal }));
  }
  resize(e, i8) {
    this._normal.resize(e, i8), this._alt.resize(e, i8), this.setupTabStops(e);
  }
  setupTabStops(e) {
    this._normal.setupTabStops(e), this._alt.setupTabStops(e);
  }
};
var ks = 2;
var Cs = 1;
var ni = class extends D2 {
  constructor(e) {
    super();
    this.isUserScrolling = false;
    this._onResize = this._register(new v());
    this.onResize = this._onResize.event;
    this._onScroll = this._register(new v());
    this.onScroll = this._onScroll.event;
    this.cols = Math.max(e.rawOptions.cols || 0, ks), this.rows = Math.max(e.rawOptions.rows || 0, Cs), this.buffers = this._register(new hn(e, this)), this._register(this.buffers.onBufferActivate((i8) => {
      this._onScroll.fire(i8.activeBuffer.ydisp);
    }));
  }
  get buffer() {
    return this.buffers.active;
  }
  resize(e, i8) {
    let r = this.cols !== e, n = this.rows !== i8;
    this.cols = e, this.rows = i8, this.buffers.resize(e, i8), this._onResize.fire({ cols: e, rows: i8, colsChanged: r, rowsChanged: n });
  }
  reset() {
    this.buffers.reset(), this.isUserScrolling = false;
  }
  scroll(e, i8 = false) {
    let r = this.buffer, n;
    n = this._cachedBlankLine, (!n || n.length !== this.cols || n.getFg(0) !== e.fg || n.getBg(0) !== e.bg) && (n = r.getBlankLine(e, i8), this._cachedBlankLine = n), n.isWrapped = i8;
    let o2 = r.ybase + r.scrollTop, l = r.ybase + r.scrollBottom;
    if (r.scrollTop === 0) {
      let a = r.lines.isFull;
      l === r.lines.length - 1 ? a ? r.lines.recycle().copyFrom(n) : r.lines.push(n.clone()) : r.lines.splice(l + 1, 0, n.clone()), a ? this.isUserScrolling && (r.ydisp = Math.max(r.ydisp - 1, 0)) : (r.ybase++, this.isUserScrolling || r.ydisp++);
    } else {
      let a = l - o2 + 1;
      r.lines.shiftElements(o2 + 1, a - 1, -1), r.lines.set(l, n.clone());
    }
    this.isUserScrolling || (r.ydisp = r.ybase), this._onScroll.fire(r.ydisp);
  }
  scrollLines(e, i8) {
    let r = this.buffer;
    if (e < 0) {
      if (r.ydisp === 0) return;
      this.isUserScrolling = true;
    } else e + r.ydisp >= r.ybase && (this.isUserScrolling = false);
    let n = r.ydisp;
    r.ydisp = Math.max(Math.min(r.ydisp + e, r.ybase), 0), n !== r.ydisp && (i8 || this._onScroll.fire(r.ydisp));
  }
};
ni = M([S(0, H)], ni);
var si = { cols: 80, rows: 24, cursorBlink: false, cursorStyle: "block", cursorWidth: 1, cursorInactiveStyle: "outline", customGlyphs: true, drawBoldTextInBrightColors: true, documentOverride: null, fastScrollModifier: "alt", fastScrollSensitivity: 5, fontFamily: "monospace", fontSize: 15, fontWeight: "normal", fontWeightBold: "bold", ignoreBracketedPasteMode: false, lineHeight: 1, letterSpacing: 0, linkHandler: null, logLevel: "info", logger: null, scrollback: 1e3, scrollOnEraseInDisplay: false, scrollOnUserInput: true, scrollSensitivity: 1, screenReaderMode: false, smoothScrollDuration: 0, macOptionIsMeta: false, macOptionClickForcesSelection: false, minimumContrastRatio: 1, disableStdin: false, allowProposedApi: false, allowTransparency: false, tabStopWidth: 8, theme: {}, reflowCursorLine: false, rescaleOverlappingGlyphs: false, rightClickSelectsWord: Zt, windowOptions: {}, windowsMode: false, windowsPty: {}, wordSeparator: " ()[]{}',\"`", altClickMovesCursor: true, convertEol: false, termName: "xterm", cancelEvents: false, overviewRuler: {} };
var nc = ["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
var dn = class extends D2 {
  constructor(e) {
    super();
    this._onOptionChange = this._register(new v());
    this.onOptionChange = this._onOptionChange.event;
    let i8 = { ...si };
    for (let r in e) if (r in i8) try {
      let n = e[r];
      i8[r] = this._sanitizeAndValidateOption(r, n);
    } catch (n) {
      console.error(n);
    }
    this.rawOptions = i8, this.options = { ...i8 }, this._setupOptions(), this._register(C(() => {
      this.rawOptions.linkHandler = null, this.rawOptions.documentOverride = null;
    }));
  }
  onSpecificOptionChange(e, i8) {
    return this.onOptionChange((r) => {
      r === e && i8(this.rawOptions[e]);
    });
  }
  onMultipleOptionChange(e, i8) {
    return this.onOptionChange((r) => {
      e.indexOf(r) !== -1 && i8();
    });
  }
  _setupOptions() {
    let e = (r) => {
      if (!(r in si)) throw new Error(`No option with key "${r}"`);
      return this.rawOptions[r];
    }, i8 = (r, n) => {
      if (!(r in si)) throw new Error(`No option with key "${r}"`);
      n = this._sanitizeAndValidateOption(r, n), this.rawOptions[r] !== n && (this.rawOptions[r] = n, this._onOptionChange.fire(r));
    };
    for (let r in this.rawOptions) {
      let n = { get: e.bind(this, r), set: i8.bind(this, r) };
      Object.defineProperty(this.options, r, n);
    }
  }
  _sanitizeAndValidateOption(e, i8) {
    switch (e) {
      case "cursorStyle":
        if (i8 || (i8 = si[e]), !sc(i8)) throw new Error(`"${i8}" is not a valid value for ${e}`);
        break;
      case "wordSeparator":
        i8 || (i8 = si[e]);
        break;
      case "fontWeight":
      case "fontWeightBold":
        if (typeof i8 == "number" && 1 <= i8 && i8 <= 1e3) break;
        i8 = nc.includes(i8) ? i8 : si[e];
        break;
      case "cursorWidth":
        i8 = Math.floor(i8);
      case "lineHeight":
      case "tabStopWidth":
        if (i8 < 1) throw new Error(`${e} cannot be less than 1, value: ${i8}`);
        break;
      case "minimumContrastRatio":
        i8 = Math.max(1, Math.min(21, Math.round(i8 * 10) / 10));
        break;
      case "scrollback":
        if (i8 = Math.min(i8, 4294967295), i8 < 0) throw new Error(`${e} cannot be less than 0, value: ${i8}`);
        break;
      case "fastScrollSensitivity":
      case "scrollSensitivity":
        if (i8 <= 0) throw new Error(`${e} cannot be less than or equal to 0, value: ${i8}`);
        break;
      case "rows":
      case "cols":
        if (!i8 && i8 !== 0) throw new Error(`${e} must be numeric, value: ${i8}`);
        break;
      case "windowsPty":
        i8 = i8 ?? {};
        break;
    }
    return i8;
  }
};
function sc(s15) {
  return s15 === "block" || s15 === "underline" || s15 === "bar";
}
function oi(s15, t = 5) {
  if (typeof s15 != "object") return s15;
  let e = Array.isArray(s15) ? [] : {};
  for (let i8 in s15) e[i8] = t <= 1 ? s15[i8] : s15[i8] && oi(s15[i8], t - 1);
  return e;
}
var ul = Object.freeze({ insertMode: false });
var hl = Object.freeze({ applicationCursorKeys: false, applicationKeypad: false, bracketedPasteMode: false, cursorBlink: void 0, cursorStyle: void 0, origin: false, reverseWraparound: false, sendFocus: false, synchronizedOutput: false, wraparound: true });
var li = class extends D2 {
  constructor(e, i8, r) {
    super();
    this._bufferService = e;
    this._logService = i8;
    this._optionsService = r;
    this.isCursorInitialized = false;
    this.isCursorHidden = false;
    this._onData = this._register(new v());
    this.onData = this._onData.event;
    this._onUserInput = this._register(new v());
    this.onUserInput = this._onUserInput.event;
    this._onBinary = this._register(new v());
    this.onBinary = this._onBinary.event;
    this._onRequestScrollToBottom = this._register(new v());
    this.onRequestScrollToBottom = this._onRequestScrollToBottom.event;
    this.modes = oi(ul), this.decPrivateModes = oi(hl);
  }
  reset() {
    this.modes = oi(ul), this.decPrivateModes = oi(hl);
  }
  triggerDataEvent(e, i8 = false) {
    if (this._optionsService.rawOptions.disableStdin) return;
    let r = this._bufferService.buffer;
    i8 && this._optionsService.rawOptions.scrollOnUserInput && r.ybase !== r.ydisp && this._onRequestScrollToBottom.fire(), i8 && this._onUserInput.fire(), this._logService.debug(`sending data "${e}"`), this._logService.trace("sending data (codes)", () => e.split("").map((n) => n.charCodeAt(0))), this._onData.fire(e);
  }
  triggerBinaryEvent(e) {
    this._optionsService.rawOptions.disableStdin || (this._logService.debug(`sending binary "${e}"`), this._logService.trace("sending binary (codes)", () => e.split("").map((i8) => i8.charCodeAt(0))), this._onBinary.fire(e));
  }
};
li = M([S(0, F), S(1, nr), S(2, H)], li);
var dl = { NONE: { events: 0, restrict: () => false }, X10: { events: 1, restrict: (s15) => s15.button === 4 || s15.action !== 1 ? false : (s15.ctrl = false, s15.alt = false, s15.shift = false, true) }, VT200: { events: 19, restrict: (s15) => s15.action !== 32 }, DRAG: { events: 23, restrict: (s15) => !(s15.action === 32 && s15.button === 3) }, ANY: { events: 31, restrict: (s15) => true } };
function Ms(s15, t) {
  let e = (s15.ctrl ? 16 : 0) | (s15.shift ? 4 : 0) | (s15.alt ? 8 : 0);
  return s15.button === 4 ? (e |= 64, e |= s15.action) : (e |= s15.button & 3, s15.button & 4 && (e |= 64), s15.button & 8 && (e |= 128), s15.action === 32 ? e |= 32 : s15.action === 0 && !t && (e |= 3)), e;
}
var Ps = String.fromCharCode;
var fl = { DEFAULT: (s15) => {
  let t = [Ms(s15, false) + 32, s15.col + 32, s15.row + 32];
  return t[0] > 255 || t[1] > 255 || t[2] > 255 ? "" : `\x1B[M${Ps(t[0])}${Ps(t[1])}${Ps(t[2])}`;
}, SGR: (s15) => {
  let t = s15.action === 0 && s15.button !== 4 ? "m" : "M";
  return `\x1B[<${Ms(s15, true)};${s15.col};${s15.row}${t}`;
}, SGR_PIXELS: (s15) => {
  let t = s15.action === 0 && s15.button !== 4 ? "m" : "M";
  return `\x1B[<${Ms(s15, true)};${s15.x};${s15.y}${t}`;
} };
var ai = class extends D2 {
  constructor(e, i8, r) {
    super();
    this._bufferService = e;
    this._coreService = i8;
    this._optionsService = r;
    this._protocols = {};
    this._encodings = {};
    this._activeProtocol = "";
    this._activeEncoding = "";
    this._lastEvent = null;
    this._wheelPartialScroll = 0;
    this._onProtocolChange = this._register(new v());
    this.onProtocolChange = this._onProtocolChange.event;
    for (let n of Object.keys(dl)) this.addProtocol(n, dl[n]);
    for (let n of Object.keys(fl)) this.addEncoding(n, fl[n]);
    this.reset();
  }
  addProtocol(e, i8) {
    this._protocols[e] = i8;
  }
  addEncoding(e, i8) {
    this._encodings[e] = i8;
  }
  get activeProtocol() {
    return this._activeProtocol;
  }
  get areMouseEventsActive() {
    return this._protocols[this._activeProtocol].events !== 0;
  }
  set activeProtocol(e) {
    if (!this._protocols[e]) throw new Error(`unknown protocol "${e}"`);
    this._activeProtocol = e, this._onProtocolChange.fire(this._protocols[e].events);
  }
  get activeEncoding() {
    return this._activeEncoding;
  }
  set activeEncoding(e) {
    if (!this._encodings[e]) throw new Error(`unknown encoding "${e}"`);
    this._activeEncoding = e;
  }
  reset() {
    this.activeProtocol = "NONE", this.activeEncoding = "DEFAULT", this._lastEvent = null, this._wheelPartialScroll = 0;
  }
  consumeWheelEvent(e, i8, r) {
    if (e.deltaY === 0 || e.shiftKey || i8 === void 0 || r === void 0) return 0;
    let n = i8 / r, o2 = this._applyScrollModifier(e.deltaY, e);
    return e.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? (o2 /= n + 0, Math.abs(e.deltaY) < 50 && (o2 *= 0.3), this._wheelPartialScroll += o2, o2 = Math.floor(Math.abs(this._wheelPartialScroll)) * (this._wheelPartialScroll > 0 ? 1 : -1), this._wheelPartialScroll %= 1) : e.deltaMode === WheelEvent.DOM_DELTA_PAGE && (o2 *= this._bufferService.rows), o2;
  }
  _applyScrollModifier(e, i8) {
    return i8.altKey || i8.ctrlKey || i8.shiftKey ? e * this._optionsService.rawOptions.fastScrollSensitivity * this._optionsService.rawOptions.scrollSensitivity : e * this._optionsService.rawOptions.scrollSensitivity;
  }
  triggerMouseEvent(e) {
    if (e.col < 0 || e.col >= this._bufferService.cols || e.row < 0 || e.row >= this._bufferService.rows || e.button === 4 && e.action === 32 || e.button === 3 && e.action !== 32 || e.button !== 4 && (e.action === 2 || e.action === 3) || (e.col++, e.row++, e.action === 32 && this._lastEvent && this._equalEvents(this._lastEvent, e, this._activeEncoding === "SGR_PIXELS")) || !this._protocols[this._activeProtocol].restrict(e)) return false;
    let i8 = this._encodings[this._activeEncoding](e);
    return i8 && (this._activeEncoding === "DEFAULT" ? this._coreService.triggerBinaryEvent(i8) : this._coreService.triggerDataEvent(i8, true)), this._lastEvent = e, true;
  }
  explainEvents(e) {
    return { down: !!(e & 1), up: !!(e & 2), drag: !!(e & 4), move: !!(e & 8), wheel: !!(e & 16) };
  }
  _equalEvents(e, i8, r) {
    if (r) {
      if (e.x !== i8.x || e.y !== i8.y) return false;
    } else if (e.col !== i8.col || e.row !== i8.row) return false;
    return !(e.button !== i8.button || e.action !== i8.action || e.ctrl !== i8.ctrl || e.alt !== i8.alt || e.shift !== i8.shift);
  }
};
ai = M([S(0, F), S(1, ge), S(2, H)], ai);
var Os = [[768, 879], [1155, 1158], [1160, 1161], [1425, 1469], [1471, 1471], [1473, 1474], [1476, 1477], [1479, 1479], [1536, 1539], [1552, 1557], [1611, 1630], [1648, 1648], [1750, 1764], [1767, 1768], [1770, 1773], [1807, 1807], [1809, 1809], [1840, 1866], [1958, 1968], [2027, 2035], [2305, 2306], [2364, 2364], [2369, 2376], [2381, 2381], [2385, 2388], [2402, 2403], [2433, 2433], [2492, 2492], [2497, 2500], [2509, 2509], [2530, 2531], [2561, 2562], [2620, 2620], [2625, 2626], [2631, 2632], [2635, 2637], [2672, 2673], [2689, 2690], [2748, 2748], [2753, 2757], [2759, 2760], [2765, 2765], [2786, 2787], [2817, 2817], [2876, 2876], [2879, 2879], [2881, 2883], [2893, 2893], [2902, 2902], [2946, 2946], [3008, 3008], [3021, 3021], [3134, 3136], [3142, 3144], [3146, 3149], [3157, 3158], [3260, 3260], [3263, 3263], [3270, 3270], [3276, 3277], [3298, 3299], [3393, 3395], [3405, 3405], [3530, 3530], [3538, 3540], [3542, 3542], [3633, 3633], [3636, 3642], [3655, 3662], [3761, 3761], [3764, 3769], [3771, 3772], [3784, 3789], [3864, 3865], [3893, 3893], [3895, 3895], [3897, 3897], [3953, 3966], [3968, 3972], [3974, 3975], [3984, 3991], [3993, 4028], [4038, 4038], [4141, 4144], [4146, 4146], [4150, 4151], [4153, 4153], [4184, 4185], [4448, 4607], [4959, 4959], [5906, 5908], [5938, 5940], [5970, 5971], [6002, 6003], [6068, 6069], [6071, 6077], [6086, 6086], [6089, 6099], [6109, 6109], [6155, 6157], [6313, 6313], [6432, 6434], [6439, 6440], [6450, 6450], [6457, 6459], [6679, 6680], [6912, 6915], [6964, 6964], [6966, 6970], [6972, 6972], [6978, 6978], [7019, 7027], [7616, 7626], [7678, 7679], [8203, 8207], [8234, 8238], [8288, 8291], [8298, 8303], [8400, 8431], [12330, 12335], [12441, 12442], [43014, 43014], [43019, 43019], [43045, 43046], [64286, 64286], [65024, 65039], [65056, 65059], [65279, 65279], [65529, 65531]];
var ac = [[68097, 68099], [68101, 68102], [68108, 68111], [68152, 68154], [68159, 68159], [119143, 119145], [119155, 119170], [119173, 119179], [119210, 119213], [119362, 119364], [917505, 917505], [917536, 917631], [917760, 917999]];
var se;
function cc(s15, t) {
  let e = 0, i8 = t.length - 1, r;
  if (s15 < t[0][0] || s15 > t[i8][1]) return false;
  for (; i8 >= e; ) if (r = e + i8 >> 1, s15 > t[r][1]) e = r + 1;
  else if (s15 < t[r][0]) i8 = r - 1;
  else return true;
  return false;
}
var fn = class {
  constructor() {
    this.version = "6";
    if (!se) {
      se = new Uint8Array(65536), se.fill(1), se[0] = 0, se.fill(0, 1, 32), se.fill(0, 127, 160), se.fill(2, 4352, 4448), se[9001] = 2, se[9002] = 2, se.fill(2, 11904, 42192), se[12351] = 1, se.fill(2, 44032, 55204), se.fill(2, 63744, 64256), se.fill(2, 65040, 65050), se.fill(2, 65072, 65136), se.fill(2, 65280, 65377), se.fill(2, 65504, 65511);
      for (let t = 0; t < Os.length; ++t) se.fill(0, Os[t][0], Os[t][1] + 1);
    }
  }
  wcwidth(t) {
    return t < 32 ? 0 : t < 127 ? 1 : t < 65536 ? se[t] : cc(t, ac) ? 0 : t >= 131072 && t <= 196605 || t >= 196608 && t <= 262141 ? 2 : 1;
  }
  charProperties(t, e) {
    let i8 = this.wcwidth(t), r = i8 === 0 && e !== 0;
    if (r) {
      let n = Ae.extractWidth(e);
      n === 0 ? r = false : n > i8 && (i8 = n);
    }
    return Ae.createPropertyValue(0, i8, r);
  }
};
var Ae = class s13 {
  constructor() {
    this._providers = /* @__PURE__ */ Object.create(null);
    this._active = "";
    this._onChange = new v();
    this.onChange = this._onChange.event;
    let t = new fn();
    this.register(t), this._active = t.version, this._activeProvider = t;
  }
  static extractShouldJoin(t) {
    return (t & 1) !== 0;
  }
  static extractWidth(t) {
    return t >> 1 & 3;
  }
  static extractCharKind(t) {
    return t >> 3;
  }
  static createPropertyValue(t, e, i8 = false) {
    return (t & 16777215) << 3 | (e & 3) << 1 | (i8 ? 1 : 0);
  }
  dispose() {
    this._onChange.dispose();
  }
  get versions() {
    return Object.keys(this._providers);
  }
  get activeVersion() {
    return this._active;
  }
  set activeVersion(t) {
    if (!this._providers[t]) throw new Error(`unknown Unicode version "${t}"`);
    this._active = t, this._activeProvider = this._providers[t], this._onChange.fire(t);
  }
  register(t) {
    this._providers[t.version] = t;
  }
  wcwidth(t) {
    return this._activeProvider.wcwidth(t);
  }
  getStringCellWidth(t) {
    let e = 0, i8 = 0, r = t.length;
    for (let n = 0; n < r; ++n) {
      let o2 = t.charCodeAt(n);
      if (55296 <= o2 && o2 <= 56319) {
        if (++n >= r) return e + this.wcwidth(o2);
        let u = t.charCodeAt(n);
        56320 <= u && u <= 57343 ? o2 = (o2 - 55296) * 1024 + u - 56320 + 65536 : e += this.wcwidth(u);
      }
      let l = this.charProperties(o2, i8), a = s13.extractWidth(l);
      s13.extractShouldJoin(l) && (a -= s13.extractWidth(i8)), e += a, i8 = l;
    }
    return e;
  }
  charProperties(t, e) {
    return this._activeProvider.charProperties(t, e);
  }
};
var pn = class {
  constructor() {
    this.glevel = 0;
    this._charsets = [];
  }
  reset() {
    this.charset = void 0, this._charsets = [], this.glevel = 0;
  }
  setgLevel(t) {
    this.glevel = t, this.charset = this._charsets[t];
  }
  setgCharset(t, e) {
    this._charsets[t] = e, this.glevel === t && (this.charset = e);
  }
};
function Bs(s15) {
  let e = s15.buffer.lines.get(s15.buffer.ybase + s15.buffer.y - 1)?.get(s15.cols - 1), i8 = s15.buffer.lines.get(s15.buffer.ybase + s15.buffer.y);
  i8 && e && (i8.isWrapped = e[3] !== 0 && e[3] !== 32);
}
var Vi = 2147483647;
var uc = 256;
var ci = class s14 {
  constructor(t = 32, e = 32) {
    this.maxLength = t;
    this.maxSubParamsLength = e;
    if (e > uc) throw new Error("maxSubParamsLength must not be greater than 256");
    this.params = new Int32Array(t), this.length = 0, this._subParams = new Int32Array(e), this._subParamsLength = 0, this._subParamsIdx = new Uint16Array(t), this._rejectDigits = false, this._rejectSubDigits = false, this._digitIsSub = false;
  }
  static fromArray(t) {
    let e = new s14();
    if (!t.length) return e;
    for (let i8 = Array.isArray(t[0]) ? 1 : 0; i8 < t.length; ++i8) {
      let r = t[i8];
      if (Array.isArray(r)) for (let n = 0; n < r.length; ++n) e.addSubParam(r[n]);
      else e.addParam(r);
    }
    return e;
  }
  clone() {
    let t = new s14(this.maxLength, this.maxSubParamsLength);
    return t.params.set(this.params), t.length = this.length, t._subParams.set(this._subParams), t._subParamsLength = this._subParamsLength, t._subParamsIdx.set(this._subParamsIdx), t._rejectDigits = this._rejectDigits, t._rejectSubDigits = this._rejectSubDigits, t._digitIsSub = this._digitIsSub, t;
  }
  toArray() {
    let t = [];
    for (let e = 0; e < this.length; ++e) {
      t.push(this.params[e]);
      let i8 = this._subParamsIdx[e] >> 8, r = this._subParamsIdx[e] & 255;
      r - i8 > 0 && t.push(Array.prototype.slice.call(this._subParams, i8, r));
    }
    return t;
  }
  reset() {
    this.length = 0, this._subParamsLength = 0, this._rejectDigits = false, this._rejectSubDigits = false, this._digitIsSub = false;
  }
  addParam(t) {
    if (this._digitIsSub = false, this.length >= this.maxLength) {
      this._rejectDigits = true;
      return;
    }
    if (t < -1) throw new Error("values lesser than -1 are not allowed");
    this._subParamsIdx[this.length] = this._subParamsLength << 8 | this._subParamsLength, this.params[this.length++] = t > Vi ? Vi : t;
  }
  addSubParam(t) {
    if (this._digitIsSub = true, !!this.length) {
      if (this._rejectDigits || this._subParamsLength >= this.maxSubParamsLength) {
        this._rejectSubDigits = true;
        return;
      }
      if (t < -1) throw new Error("values lesser than -1 are not allowed");
      this._subParams[this._subParamsLength++] = t > Vi ? Vi : t, this._subParamsIdx[this.length - 1]++;
    }
  }
  hasSubParams(t) {
    return (this._subParamsIdx[t] & 255) - (this._subParamsIdx[t] >> 8) > 0;
  }
  getSubParams(t) {
    let e = this._subParamsIdx[t] >> 8, i8 = this._subParamsIdx[t] & 255;
    return i8 - e > 0 ? this._subParams.subarray(e, i8) : null;
  }
  getSubParamsAll() {
    let t = {};
    for (let e = 0; e < this.length; ++e) {
      let i8 = this._subParamsIdx[e] >> 8, r = this._subParamsIdx[e] & 255;
      r - i8 > 0 && (t[e] = this._subParams.slice(i8, r));
    }
    return t;
  }
  addDigit(t) {
    let e;
    if (this._rejectDigits || !(e = this._digitIsSub ? this._subParamsLength : this.length) || this._digitIsSub && this._rejectSubDigits) return;
    let i8 = this._digitIsSub ? this._subParams : this.params, r = i8[e - 1];
    i8[e - 1] = ~r ? Math.min(r * 10 + t, Vi) : t;
  }
};
var qi = [];
var mn = class {
  constructor() {
    this._state = 0;
    this._active = qi;
    this._id = -1;
    this._handlers = /* @__PURE__ */ Object.create(null);
    this._handlerFb = () => {
    };
    this._stack = { paused: false, loopPosition: 0, fallThrough: false };
  }
  registerHandler(t, e) {
    this._handlers[t] === void 0 && (this._handlers[t] = []);
    let i8 = this._handlers[t];
    return i8.push(e), { dispose: () => {
      let r = i8.indexOf(e);
      r !== -1 && i8.splice(r, 1);
    } };
  }
  clearHandler(t) {
    this._handlers[t] && delete this._handlers[t];
  }
  setHandlerFallback(t) {
    this._handlerFb = t;
  }
  dispose() {
    this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
    }, this._active = qi;
  }
  reset() {
    if (this._state === 2) for (let t = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; t >= 0; --t) this._active[t].end(false);
    this._stack.paused = false, this._active = qi, this._id = -1, this._state = 0;
  }
  _start() {
    if (this._active = this._handlers[this._id] || qi, !this._active.length) this._handlerFb(this._id, "START");
    else for (let t = this._active.length - 1; t >= 0; t--) this._active[t].start();
  }
  _put(t, e, i8) {
    if (!this._active.length) this._handlerFb(this._id, "PUT", It(t, e, i8));
    else for (let r = this._active.length - 1; r >= 0; r--) this._active[r].put(t, e, i8);
  }
  start() {
    this.reset(), this._state = 1;
  }
  put(t, e, i8) {
    if (this._state !== 3) {
      if (this._state === 1) for (; e < i8; ) {
        let r = t[e++];
        if (r === 59) {
          this._state = 2, this._start();
          break;
        }
        if (r < 48 || 57 < r) {
          this._state = 3;
          return;
        }
        this._id === -1 && (this._id = 0), this._id = this._id * 10 + r - 48;
      }
      this._state === 2 && i8 - e > 0 && this._put(t, e, i8);
    }
  }
  end(t, e = true) {
    if (this._state !== 0) {
      if (this._state !== 3) if (this._state === 1 && this._start(), !this._active.length) this._handlerFb(this._id, "END", t);
      else {
        let i8 = false, r = this._active.length - 1, n = false;
        if (this._stack.paused && (r = this._stack.loopPosition - 1, i8 = e, n = this._stack.fallThrough, this._stack.paused = false), !n && i8 === false) {
          for (; r >= 0 && (i8 = this._active[r].end(t), i8 !== true); r--) if (i8 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = r, this._stack.fallThrough = false, i8;
          r--;
        }
        for (; r >= 0; r--) if (i8 = this._active[r].end(false), i8 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = r, this._stack.fallThrough = true, i8;
      }
      this._active = qi, this._id = -1, this._state = 0;
    }
  }
};
var pe = class {
  constructor(t) {
    this._handler = t;
    this._data = "";
    this._hitLimit = false;
  }
  start() {
    this._data = "", this._hitLimit = false;
  }
  put(t, e, i8) {
    this._hitLimit || (this._data += It(t, e, i8), this._data.length > 1e7 && (this._data = "", this._hitLimit = true));
  }
  end(t) {
    let e = false;
    if (this._hitLimit) e = false;
    else if (t && (e = this._handler(this._data), e instanceof Promise)) return e.then((i8) => (this._data = "", this._hitLimit = false, i8));
    return this._data = "", this._hitLimit = false, e;
  }
};
var Yi = [];
var _n = class {
  constructor() {
    this._handlers = /* @__PURE__ */ Object.create(null);
    this._active = Yi;
    this._ident = 0;
    this._handlerFb = () => {
    };
    this._stack = { paused: false, loopPosition: 0, fallThrough: false };
  }
  dispose() {
    this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
    }, this._active = Yi;
  }
  registerHandler(t, e) {
    this._handlers[t] === void 0 && (this._handlers[t] = []);
    let i8 = this._handlers[t];
    return i8.push(e), { dispose: () => {
      let r = i8.indexOf(e);
      r !== -1 && i8.splice(r, 1);
    } };
  }
  clearHandler(t) {
    this._handlers[t] && delete this._handlers[t];
  }
  setHandlerFallback(t) {
    this._handlerFb = t;
  }
  reset() {
    if (this._active.length) for (let t = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; t >= 0; --t) this._active[t].unhook(false);
    this._stack.paused = false, this._active = Yi, this._ident = 0;
  }
  hook(t, e) {
    if (this.reset(), this._ident = t, this._active = this._handlers[t] || Yi, !this._active.length) this._handlerFb(this._ident, "HOOK", e);
    else for (let i8 = this._active.length - 1; i8 >= 0; i8--) this._active[i8].hook(e);
  }
  put(t, e, i8) {
    if (!this._active.length) this._handlerFb(this._ident, "PUT", It(t, e, i8));
    else for (let r = this._active.length - 1; r >= 0; r--) this._active[r].put(t, e, i8);
  }
  unhook(t, e = true) {
    if (!this._active.length) this._handlerFb(this._ident, "UNHOOK", t);
    else {
      let i8 = false, r = this._active.length - 1, n = false;
      if (this._stack.paused && (r = this._stack.loopPosition - 1, i8 = e, n = this._stack.fallThrough, this._stack.paused = false), !n && i8 === false) {
        for (; r >= 0 && (i8 = this._active[r].unhook(t), i8 !== true); r--) if (i8 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = r, this._stack.fallThrough = false, i8;
        r--;
      }
      for (; r >= 0; r--) if (i8 = this._active[r].unhook(false), i8 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = r, this._stack.fallThrough = true, i8;
    }
    this._active = Yi, this._ident = 0;
  }
};
var ji = new ci();
ji.addParam(0);
var Xi = class {
  constructor(t) {
    this._handler = t;
    this._data = "";
    this._params = ji;
    this._hitLimit = false;
  }
  hook(t) {
    this._params = t.length > 1 || t.params[0] ? t.clone() : ji, this._data = "", this._hitLimit = false;
  }
  put(t, e, i8) {
    this._hitLimit || (this._data += It(t, e, i8), this._data.length > 1e7 && (this._data = "", this._hitLimit = true));
  }
  unhook(t) {
    let e = false;
    if (this._hitLimit) e = false;
    else if (t && (e = this._handler(this._data, this._params), e instanceof Promise)) return e.then((i8) => (this._params = ji, this._data = "", this._hitLimit = false, i8));
    return this._params = ji, this._data = "", this._hitLimit = false, e;
  }
};
var Fs = class {
  constructor(t) {
    this.table = new Uint8Array(t);
  }
  setDefault(t, e) {
    this.table.fill(t << 4 | e);
  }
  add(t, e, i8, r) {
    this.table[e << 8 | t] = i8 << 4 | r;
  }
  addMany(t, e, i8, r) {
    for (let n = 0; n < t.length; n++) this.table[e << 8 | t[n]] = i8 << 4 | r;
  }
};
var ke = 160;
var hc = (function() {
  let s15 = new Fs(4095), e = Array.apply(null, Array(256)).map((a, u) => u), i8 = (a, u) => e.slice(a, u), r = i8(32, 127), n = i8(0, 24);
  n.push(25), n.push.apply(n, i8(28, 32));
  let o2 = i8(0, 14), l;
  s15.setDefault(1, 0), s15.addMany(r, 0, 2, 0);
  for (l in o2) s15.addMany([24, 26, 153, 154], l, 3, 0), s15.addMany(i8(128, 144), l, 3, 0), s15.addMany(i8(144, 152), l, 3, 0), s15.add(156, l, 0, 0), s15.add(27, l, 11, 1), s15.add(157, l, 4, 8), s15.addMany([152, 158, 159], l, 0, 7), s15.add(155, l, 11, 3), s15.add(144, l, 11, 9);
  return s15.addMany(n, 0, 3, 0), s15.addMany(n, 1, 3, 1), s15.add(127, 1, 0, 1), s15.addMany(n, 8, 0, 8), s15.addMany(n, 3, 3, 3), s15.add(127, 3, 0, 3), s15.addMany(n, 4, 3, 4), s15.add(127, 4, 0, 4), s15.addMany(n, 6, 3, 6), s15.addMany(n, 5, 3, 5), s15.add(127, 5, 0, 5), s15.addMany(n, 2, 3, 2), s15.add(127, 2, 0, 2), s15.add(93, 1, 4, 8), s15.addMany(r, 8, 5, 8), s15.add(127, 8, 5, 8), s15.addMany([156, 27, 24, 26, 7], 8, 6, 0), s15.addMany(i8(28, 32), 8, 0, 8), s15.addMany([88, 94, 95], 1, 0, 7), s15.addMany(r, 7, 0, 7), s15.addMany(n, 7, 0, 7), s15.add(156, 7, 0, 0), s15.add(127, 7, 0, 7), s15.add(91, 1, 11, 3), s15.addMany(i8(64, 127), 3, 7, 0), s15.addMany(i8(48, 60), 3, 8, 4), s15.addMany([60, 61, 62, 63], 3, 9, 4), s15.addMany(i8(48, 60), 4, 8, 4), s15.addMany(i8(64, 127), 4, 7, 0), s15.addMany([60, 61, 62, 63], 4, 0, 6), s15.addMany(i8(32, 64), 6, 0, 6), s15.add(127, 6, 0, 6), s15.addMany(i8(64, 127), 6, 0, 0), s15.addMany(i8(32, 48), 3, 9, 5), s15.addMany(i8(32, 48), 5, 9, 5), s15.addMany(i8(48, 64), 5, 0, 6), s15.addMany(i8(64, 127), 5, 7, 0), s15.addMany(i8(32, 48), 4, 9, 5), s15.addMany(i8(32, 48), 1, 9, 2), s15.addMany(i8(32, 48), 2, 9, 2), s15.addMany(i8(48, 127), 2, 10, 0), s15.addMany(i8(48, 80), 1, 10, 0), s15.addMany(i8(81, 88), 1, 10, 0), s15.addMany([89, 90, 92], 1, 10, 0), s15.addMany(i8(96, 127), 1, 10, 0), s15.add(80, 1, 11, 9), s15.addMany(n, 9, 0, 9), s15.add(127, 9, 0, 9), s15.addMany(i8(28, 32), 9, 0, 9), s15.addMany(i8(32, 48), 9, 9, 12), s15.addMany(i8(48, 60), 9, 8, 10), s15.addMany([60, 61, 62, 63], 9, 9, 10), s15.addMany(n, 11, 0, 11), s15.addMany(i8(32, 128), 11, 0, 11), s15.addMany(i8(28, 32), 11, 0, 11), s15.addMany(n, 10, 0, 10), s15.add(127, 10, 0, 10), s15.addMany(i8(28, 32), 10, 0, 10), s15.addMany(i8(48, 60), 10, 8, 10), s15.addMany([60, 61, 62, 63], 10, 0, 11), s15.addMany(i8(32, 48), 10, 9, 12), s15.addMany(n, 12, 0, 12), s15.add(127, 12, 0, 12), s15.addMany(i8(28, 32), 12, 0, 12), s15.addMany(i8(32, 48), 12, 9, 12), s15.addMany(i8(48, 64), 12, 0, 11), s15.addMany(i8(64, 127), 12, 12, 13), s15.addMany(i8(64, 127), 10, 12, 13), s15.addMany(i8(64, 127), 9, 12, 13), s15.addMany(n, 13, 13, 13), s15.addMany(r, 13, 13, 13), s15.add(127, 13, 0, 13), s15.addMany([27, 156, 24, 26], 13, 14, 0), s15.add(ke, 0, 2, 0), s15.add(ke, 8, 5, 8), s15.add(ke, 6, 0, 6), s15.add(ke, 11, 0, 11), s15.add(ke, 13, 13, 13), s15;
})();
var bn = class extends D2 {
  constructor(e = hc) {
    super();
    this._transitions = e;
    this._parseStack = { state: 0, handlers: [], handlerPos: 0, transition: 0, chunkPos: 0 };
    this.initialState = 0, this.currentState = this.initialState, this._params = new ci(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0, this._printHandlerFb = (i8, r, n) => {
    }, this._executeHandlerFb = (i8) => {
    }, this._csiHandlerFb = (i8, r) => {
    }, this._escHandlerFb = (i8) => {
    }, this._errorHandlerFb = (i8) => i8, this._printHandler = this._printHandlerFb, this._executeHandlers = /* @__PURE__ */ Object.create(null), this._csiHandlers = /* @__PURE__ */ Object.create(null), this._escHandlers = /* @__PURE__ */ Object.create(null), this._register(C(() => {
      this._csiHandlers = /* @__PURE__ */ Object.create(null), this._executeHandlers = /* @__PURE__ */ Object.create(null), this._escHandlers = /* @__PURE__ */ Object.create(null);
    })), this._oscParser = this._register(new mn()), this._dcsParser = this._register(new _n()), this._errorHandler = this._errorHandlerFb, this.registerEscHandler({ final: "\\" }, () => true);
  }
  _identifier(e, i8 = [64, 126]) {
    let r = 0;
    if (e.prefix) {
      if (e.prefix.length > 1) throw new Error("only one byte as prefix supported");
      if (r = e.prefix.charCodeAt(0), r && 60 > r || r > 63) throw new Error("prefix must be in range 0x3c .. 0x3f");
    }
    if (e.intermediates) {
      if (e.intermediates.length > 2) throw new Error("only two bytes as intermediates are supported");
      for (let o2 = 0; o2 < e.intermediates.length; ++o2) {
        let l = e.intermediates.charCodeAt(o2);
        if (32 > l || l > 47) throw new Error("intermediate must be in range 0x20 .. 0x2f");
        r <<= 8, r |= l;
      }
    }
    if (e.final.length !== 1) throw new Error("final must be a single byte");
    let n = e.final.charCodeAt(0);
    if (i8[0] > n || n > i8[1]) throw new Error(`final must be in range ${i8[0]} .. ${i8[1]}`);
    return r <<= 8, r |= n, r;
  }
  identToString(e) {
    let i8 = [];
    for (; e; ) i8.push(String.fromCharCode(e & 255)), e >>= 8;
    return i8.reverse().join("");
  }
  setPrintHandler(e) {
    this._printHandler = e;
  }
  clearPrintHandler() {
    this._printHandler = this._printHandlerFb;
  }
  registerEscHandler(e, i8) {
    let r = this._identifier(e, [48, 126]);
    this._escHandlers[r] === void 0 && (this._escHandlers[r] = []);
    let n = this._escHandlers[r];
    return n.push(i8), { dispose: () => {
      let o2 = n.indexOf(i8);
      o2 !== -1 && n.splice(o2, 1);
    } };
  }
  clearEscHandler(e) {
    this._escHandlers[this._identifier(e, [48, 126])] && delete this._escHandlers[this._identifier(e, [48, 126])];
  }
  setEscHandlerFallback(e) {
    this._escHandlerFb = e;
  }
  setExecuteHandler(e, i8) {
    this._executeHandlers[e.charCodeAt(0)] = i8;
  }
  clearExecuteHandler(e) {
    this._executeHandlers[e.charCodeAt(0)] && delete this._executeHandlers[e.charCodeAt(0)];
  }
  setExecuteHandlerFallback(e) {
    this._executeHandlerFb = e;
  }
  registerCsiHandler(e, i8) {
    let r = this._identifier(e);
    this._csiHandlers[r] === void 0 && (this._csiHandlers[r] = []);
    let n = this._csiHandlers[r];
    return n.push(i8), { dispose: () => {
      let o2 = n.indexOf(i8);
      o2 !== -1 && n.splice(o2, 1);
    } };
  }
  clearCsiHandler(e) {
    this._csiHandlers[this._identifier(e)] && delete this._csiHandlers[this._identifier(e)];
  }
  setCsiHandlerFallback(e) {
    this._csiHandlerFb = e;
  }
  registerDcsHandler(e, i8) {
    return this._dcsParser.registerHandler(this._identifier(e), i8);
  }
  clearDcsHandler(e) {
    this._dcsParser.clearHandler(this._identifier(e));
  }
  setDcsHandlerFallback(e) {
    this._dcsParser.setHandlerFallback(e);
  }
  registerOscHandler(e, i8) {
    return this._oscParser.registerHandler(e, i8);
  }
  clearOscHandler(e) {
    this._oscParser.clearHandler(e);
  }
  setOscHandlerFallback(e) {
    this._oscParser.setHandlerFallback(e);
  }
  setErrorHandler(e) {
    this._errorHandler = e;
  }
  clearErrorHandler() {
    this._errorHandler = this._errorHandlerFb;
  }
  reset() {
    this.currentState = this.initialState, this._oscParser.reset(), this._dcsParser.reset(), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0, this._parseStack.state !== 0 && (this._parseStack.state = 2, this._parseStack.handlers = []);
  }
  _preserveStack(e, i8, r, n, o2) {
    this._parseStack.state = e, this._parseStack.handlers = i8, this._parseStack.handlerPos = r, this._parseStack.transition = n, this._parseStack.chunkPos = o2;
  }
  parse(e, i8, r) {
    let n = 0, o2 = 0, l = 0, a;
    if (this._parseStack.state) if (this._parseStack.state === 2) this._parseStack.state = 0, l = this._parseStack.chunkPos + 1;
    else {
      if (r === void 0 || this._parseStack.state === 1) throw this._parseStack.state = 1, new Error("improper continuation due to previous async handler, giving up parsing");
      let u = this._parseStack.handlers, h2 = this._parseStack.handlerPos - 1;
      switch (this._parseStack.state) {
        case 3:
          if (r === false && h2 > -1) {
            for (; h2 >= 0 && (a = u[h2](this._params), a !== true); h2--) if (a instanceof Promise) return this._parseStack.handlerPos = h2, a;
          }
          this._parseStack.handlers = [];
          break;
        case 4:
          if (r === false && h2 > -1) {
            for (; h2 >= 0 && (a = u[h2](), a !== true); h2--) if (a instanceof Promise) return this._parseStack.handlerPos = h2, a;
          }
          this._parseStack.handlers = [];
          break;
        case 6:
          if (n = e[this._parseStack.chunkPos], a = this._dcsParser.unhook(n !== 24 && n !== 26, r), a) return a;
          n === 27 && (this._parseStack.transition |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0;
          break;
        case 5:
          if (n = e[this._parseStack.chunkPos], a = this._oscParser.end(n !== 24 && n !== 26, r), a) return a;
          n === 27 && (this._parseStack.transition |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0;
          break;
      }
      this._parseStack.state = 0, l = this._parseStack.chunkPos + 1, this.precedingJoinState = 0, this.currentState = this._parseStack.transition & 15;
    }
    for (let u = l; u < i8; ++u) {
      switch (n = e[u], o2 = this._transitions.table[this.currentState << 8 | (n < 160 ? n : ke)], o2 >> 4) {
        case 2:
          for (let m = u + 1; ; ++m) {
            if (m >= i8 || (n = e[m]) < 32 || n > 126 && n < ke) {
              this._printHandler(e, u, m), u = m - 1;
              break;
            }
            if (++m >= i8 || (n = e[m]) < 32 || n > 126 && n < ke) {
              this._printHandler(e, u, m), u = m - 1;
              break;
            }
            if (++m >= i8 || (n = e[m]) < 32 || n > 126 && n < ke) {
              this._printHandler(e, u, m), u = m - 1;
              break;
            }
            if (++m >= i8 || (n = e[m]) < 32 || n > 126 && n < ke) {
              this._printHandler(e, u, m), u = m - 1;
              break;
            }
          }
          break;
        case 3:
          this._executeHandlers[n] ? this._executeHandlers[n]() : this._executeHandlerFb(n), this.precedingJoinState = 0;
          break;
        case 0:
          break;
        case 1:
          if (this._errorHandler({ position: u, code: n, currentState: this.currentState, collect: this._collect, params: this._params, abort: false }).abort) return;
          break;
        case 7:
          let c = this._csiHandlers[this._collect << 8 | n], d = c ? c.length - 1 : -1;
          for (; d >= 0 && (a = c[d](this._params), a !== true); d--) if (a instanceof Promise) return this._preserveStack(3, c, d, o2, u), a;
          d < 0 && this._csiHandlerFb(this._collect << 8 | n, this._params), this.precedingJoinState = 0;
          break;
        case 8:
          do
            switch (n) {
              case 59:
                this._params.addParam(0);
                break;
              case 58:
                this._params.addSubParam(-1);
                break;
              default:
                this._params.addDigit(n - 48);
            }
          while (++u < i8 && (n = e[u]) > 47 && n < 60);
          u--;
          break;
        case 9:
          this._collect <<= 8, this._collect |= n;
          break;
        case 10:
          let _2 = this._escHandlers[this._collect << 8 | n], p = _2 ? _2.length - 1 : -1;
          for (; p >= 0 && (a = _2[p](), a !== true); p--) if (a instanceof Promise) return this._preserveStack(4, _2, p, o2, u), a;
          p < 0 && this._escHandlerFb(this._collect << 8 | n), this.precedingJoinState = 0;
          break;
        case 11:
          this._params.reset(), this._params.addParam(0), this._collect = 0;
          break;
        case 12:
          this._dcsParser.hook(this._collect << 8 | n, this._params);
          break;
        case 13:
          for (let m = u + 1; ; ++m) if (m >= i8 || (n = e[m]) === 24 || n === 26 || n === 27 || n > 127 && n < ke) {
            this._dcsParser.put(e, u, m), u = m - 1;
            break;
          }
          break;
        case 14:
          if (a = this._dcsParser.unhook(n !== 24 && n !== 26), a) return this._preserveStack(6, [], 0, o2, u), a;
          n === 27 && (o2 |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0;
          break;
        case 4:
          this._oscParser.start();
          break;
        case 5:
          for (let m = u + 1; ; m++) if (m >= i8 || (n = e[m]) < 32 || n > 127 && n < ke) {
            this._oscParser.put(e, u, m), u = m - 1;
            break;
          }
          break;
        case 6:
          if (a = this._oscParser.end(n !== 24 && n !== 26), a) return this._preserveStack(5, [], 0, o2, u), a;
          n === 27 && (o2 |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0;
          break;
      }
      this.currentState = o2 & 15;
    }
  }
};
var dc = /^([\da-f])\/([\da-f])\/([\da-f])$|^([\da-f]{2})\/([\da-f]{2})\/([\da-f]{2})$|^([\da-f]{3})\/([\da-f]{3})\/([\da-f]{3})$|^([\da-f]{4})\/([\da-f]{4})\/([\da-f]{4})$/;
var fc = /^[\da-f]+$/;
function Ws(s15) {
  if (!s15) return;
  let t = s15.toLowerCase();
  if (t.indexOf("rgb:") === 0) {
    t = t.slice(4);
    let e = dc.exec(t);
    if (e) {
      let i8 = e[1] ? 15 : e[4] ? 255 : e[7] ? 4095 : 65535;
      return [Math.round(parseInt(e[1] || e[4] || e[7] || e[10], 16) / i8 * 255), Math.round(parseInt(e[2] || e[5] || e[8] || e[11], 16) / i8 * 255), Math.round(parseInt(e[3] || e[6] || e[9] || e[12], 16) / i8 * 255)];
    }
  } else if (t.indexOf("#") === 0 && (t = t.slice(1), fc.exec(t) && [3, 6, 9, 12].includes(t.length))) {
    let e = t.length / 3, i8 = [0, 0, 0];
    for (let r = 0; r < 3; ++r) {
      let n = parseInt(t.slice(e * r, e * r + e), 16);
      i8[r] = e === 1 ? n << 4 : e === 2 ? n : e === 3 ? n >> 4 : n >> 8;
    }
    return i8;
  }
}
function Hs(s15, t) {
  let e = s15.toString(16), i8 = e.length < 2 ? "0" + e : e;
  switch (t) {
    case 4:
      return e[0];
    case 8:
      return i8;
    case 12:
      return (i8 + i8).slice(0, 3);
    default:
      return i8 + i8;
  }
}
function ml(s15, t = 16) {
  let [e, i8, r] = s15;
  return `rgb:${Hs(e, t)}/${Hs(i8, t)}/${Hs(r, t)}`;
}
var mc = { "(": 0, ")": 1, "*": 2, "+": 3, "-": 1, ".": 2 };
var ut = 131072;
var _l = 10;
function bl(s15, t) {
  if (s15 > 24) return t.setWinLines || false;
  switch (s15) {
    case 1:
      return !!t.restoreWin;
    case 2:
      return !!t.minimizeWin;
    case 3:
      return !!t.setWinPosition;
    case 4:
      return !!t.setWinSizePixels;
    case 5:
      return !!t.raiseWin;
    case 6:
      return !!t.lowerWin;
    case 7:
      return !!t.refreshWin;
    case 8:
      return !!t.setWinSizeChars;
    case 9:
      return !!t.maximizeWin;
    case 10:
      return !!t.fullscreenWin;
    case 11:
      return !!t.getWinState;
    case 13:
      return !!t.getWinPosition;
    case 14:
      return !!t.getWinSizePixels;
    case 15:
      return !!t.getScreenSizePixels;
    case 16:
      return !!t.getCellSizePixels;
    case 18:
      return !!t.getWinSizeChars;
    case 19:
      return !!t.getScreenSizeChars;
    case 20:
      return !!t.getIconTitle;
    case 21:
      return !!t.getWinTitle;
    case 22:
      return !!t.pushTitle;
    case 23:
      return !!t.popTitle;
    case 24:
      return !!t.setWinLines;
  }
  return false;
}
var vl = 5e3;
var gl = 0;
var vn = class extends D2 {
  constructor(e, i8, r, n, o2, l, a, u, h2 = new bn()) {
    super();
    this._bufferService = e;
    this._charsetService = i8;
    this._coreService = r;
    this._logService = n;
    this._optionsService = o2;
    this._oscLinkService = l;
    this._coreMouseService = a;
    this._unicodeService = u;
    this._parser = h2;
    this._parseBuffer = new Uint32Array(4096);
    this._stringDecoder = new er();
    this._utf8Decoder = new tr();
    this._windowTitle = "";
    this._iconName = "";
    this._windowTitleStack = [];
    this._iconNameStack = [];
    this._curAttrData = X.clone();
    this._eraseAttrDataInternal = X.clone();
    this._onRequestBell = this._register(new v());
    this.onRequestBell = this._onRequestBell.event;
    this._onRequestRefreshRows = this._register(new v());
    this.onRequestRefreshRows = this._onRequestRefreshRows.event;
    this._onRequestReset = this._register(new v());
    this.onRequestReset = this._onRequestReset.event;
    this._onRequestSendFocus = this._register(new v());
    this.onRequestSendFocus = this._onRequestSendFocus.event;
    this._onRequestSyncScrollBar = this._register(new v());
    this.onRequestSyncScrollBar = this._onRequestSyncScrollBar.event;
    this._onRequestWindowsOptionsReport = this._register(new v());
    this.onRequestWindowsOptionsReport = this._onRequestWindowsOptionsReport.event;
    this._onA11yChar = this._register(new v());
    this.onA11yChar = this._onA11yChar.event;
    this._onA11yTab = this._register(new v());
    this.onA11yTab = this._onA11yTab.event;
    this._onCursorMove = this._register(new v());
    this.onCursorMove = this._onCursorMove.event;
    this._onLineFeed = this._register(new v());
    this.onLineFeed = this._onLineFeed.event;
    this._onScroll = this._register(new v());
    this.onScroll = this._onScroll.event;
    this._onTitleChange = this._register(new v());
    this.onTitleChange = this._onTitleChange.event;
    this._onColor = this._register(new v());
    this.onColor = this._onColor.event;
    this._parseStack = { paused: false, cursorStartX: 0, cursorStartY: 0, decodedLength: 0, position: 0 };
    this._specialColors = [256, 257, 258];
    this._register(this._parser), this._dirtyRowTracker = new Zi(this._bufferService), this._activeBuffer = this._bufferService.buffer, this._register(this._bufferService.buffers.onBufferActivate((c) => this._activeBuffer = c.activeBuffer)), this._parser.setCsiHandlerFallback((c, d) => {
      this._logService.debug("Unknown CSI code: ", { identifier: this._parser.identToString(c), params: d.toArray() });
    }), this._parser.setEscHandlerFallback((c) => {
      this._logService.debug("Unknown ESC code: ", { identifier: this._parser.identToString(c) });
    }), this._parser.setExecuteHandlerFallback((c) => {
      this._logService.debug("Unknown EXECUTE code: ", { code: c });
    }), this._parser.setOscHandlerFallback((c, d, _2) => {
      this._logService.debug("Unknown OSC code: ", { identifier: c, action: d, data: _2 });
    }), this._parser.setDcsHandlerFallback((c, d, _2) => {
      d === "HOOK" && (_2 = _2.toArray()), this._logService.debug("Unknown DCS code: ", { identifier: this._parser.identToString(c), action: d, payload: _2 });
    }), this._parser.setPrintHandler((c, d, _2) => this.print(c, d, _2)), this._parser.registerCsiHandler({ final: "@" }, (c) => this.insertChars(c)), this._parser.registerCsiHandler({ intermediates: " ", final: "@" }, (c) => this.scrollLeft(c)), this._parser.registerCsiHandler({ final: "A" }, (c) => this.cursorUp(c)), this._parser.registerCsiHandler({ intermediates: " ", final: "A" }, (c) => this.scrollRight(c)), this._parser.registerCsiHandler({ final: "B" }, (c) => this.cursorDown(c)), this._parser.registerCsiHandler({ final: "C" }, (c) => this.cursorForward(c)), this._parser.registerCsiHandler({ final: "D" }, (c) => this.cursorBackward(c)), this._parser.registerCsiHandler({ final: "E" }, (c) => this.cursorNextLine(c)), this._parser.registerCsiHandler({ final: "F" }, (c) => this.cursorPrecedingLine(c)), this._parser.registerCsiHandler({ final: "G" }, (c) => this.cursorCharAbsolute(c)), this._parser.registerCsiHandler({ final: "H" }, (c) => this.cursorPosition(c)), this._parser.registerCsiHandler({ final: "I" }, (c) => this.cursorForwardTab(c)), this._parser.registerCsiHandler({ final: "J" }, (c) => this.eraseInDisplay(c, false)), this._parser.registerCsiHandler({ prefix: "?", final: "J" }, (c) => this.eraseInDisplay(c, true)), this._parser.registerCsiHandler({ final: "K" }, (c) => this.eraseInLine(c, false)), this._parser.registerCsiHandler({ prefix: "?", final: "K" }, (c) => this.eraseInLine(c, true)), this._parser.registerCsiHandler({ final: "L" }, (c) => this.insertLines(c)), this._parser.registerCsiHandler({ final: "M" }, (c) => this.deleteLines(c)), this._parser.registerCsiHandler({ final: "P" }, (c) => this.deleteChars(c)), this._parser.registerCsiHandler({ final: "S" }, (c) => this.scrollUp(c)), this._parser.registerCsiHandler({ final: "T" }, (c) => this.scrollDown(c)), this._parser.registerCsiHandler({ final: "X" }, (c) => this.eraseChars(c)), this._parser.registerCsiHandler({ final: "Z" }, (c) => this.cursorBackwardTab(c)), this._parser.registerCsiHandler({ final: "`" }, (c) => this.charPosAbsolute(c)), this._parser.registerCsiHandler({ final: "a" }, (c) => this.hPositionRelative(c)), this._parser.registerCsiHandler({ final: "b" }, (c) => this.repeatPrecedingCharacter(c)), this._parser.registerCsiHandler({ final: "c" }, (c) => this.sendDeviceAttributesPrimary(c)), this._parser.registerCsiHandler({ prefix: ">", final: "c" }, (c) => this.sendDeviceAttributesSecondary(c)), this._parser.registerCsiHandler({ final: "d" }, (c) => this.linePosAbsolute(c)), this._parser.registerCsiHandler({ final: "e" }, (c) => this.vPositionRelative(c)), this._parser.registerCsiHandler({ final: "f" }, (c) => this.hVPosition(c)), this._parser.registerCsiHandler({ final: "g" }, (c) => this.tabClear(c)), this._parser.registerCsiHandler({ final: "h" }, (c) => this.setMode(c)), this._parser.registerCsiHandler({ prefix: "?", final: "h" }, (c) => this.setModePrivate(c)), this._parser.registerCsiHandler({ final: "l" }, (c) => this.resetMode(c)), this._parser.registerCsiHandler({ prefix: "?", final: "l" }, (c) => this.resetModePrivate(c)), this._parser.registerCsiHandler({ final: "m" }, (c) => this.charAttributes(c)), this._parser.registerCsiHandler({ final: "n" }, (c) => this.deviceStatus(c)), this._parser.registerCsiHandler({ prefix: "?", final: "n" }, (c) => this.deviceStatusPrivate(c)), this._parser.registerCsiHandler({ intermediates: "!", final: "p" }, (c) => this.softReset(c)), this._parser.registerCsiHandler({ intermediates: " ", final: "q" }, (c) => this.setCursorStyle(c)), this._parser.registerCsiHandler({ final: "r" }, (c) => this.setScrollRegion(c)), this._parser.registerCsiHandler({ final: "s" }, (c) => this.saveCursor(c)), this._parser.registerCsiHandler({ final: "t" }, (c) => this.windowOptions(c)), this._parser.registerCsiHandler({ final: "u" }, (c) => this.restoreCursor(c)), this._parser.registerCsiHandler({ intermediates: "'", final: "}" }, (c) => this.insertColumns(c)), this._parser.registerCsiHandler({ intermediates: "'", final: "~" }, (c) => this.deleteColumns(c)), this._parser.registerCsiHandler({ intermediates: '"', final: "q" }, (c) => this.selectProtected(c)), this._parser.registerCsiHandler({ intermediates: "$", final: "p" }, (c) => this.requestMode(c, true)), this._parser.registerCsiHandler({ prefix: "?", intermediates: "$", final: "p" }, (c) => this.requestMode(c, false)), this._parser.setExecuteHandler(b.BEL, () => this.bell()), this._parser.setExecuteHandler(b.LF, () => this.lineFeed()), this._parser.setExecuteHandler(b.VT, () => this.lineFeed()), this._parser.setExecuteHandler(b.FF, () => this.lineFeed()), this._parser.setExecuteHandler(b.CR, () => this.carriageReturn()), this._parser.setExecuteHandler(b.BS, () => this.backspace()), this._parser.setExecuteHandler(b.HT, () => this.tab()), this._parser.setExecuteHandler(b.SO, () => this.shiftOut()), this._parser.setExecuteHandler(b.SI, () => this.shiftIn()), this._parser.setExecuteHandler(Ai.IND, () => this.index()), this._parser.setExecuteHandler(Ai.NEL, () => this.nextLine()), this._parser.setExecuteHandler(Ai.HTS, () => this.tabSet()), this._parser.registerOscHandler(0, new pe((c) => (this.setTitle(c), this.setIconName(c), true))), this._parser.registerOscHandler(1, new pe((c) => this.setIconName(c))), this._parser.registerOscHandler(2, new pe((c) => this.setTitle(c))), this._parser.registerOscHandler(4, new pe((c) => this.setOrReportIndexedColor(c))), this._parser.registerOscHandler(8, new pe((c) => this.setHyperlink(c))), this._parser.registerOscHandler(10, new pe((c) => this.setOrReportFgColor(c))), this._parser.registerOscHandler(11, new pe((c) => this.setOrReportBgColor(c))), this._parser.registerOscHandler(12, new pe((c) => this.setOrReportCursorColor(c))), this._parser.registerOscHandler(104, new pe((c) => this.restoreIndexedColor(c))), this._parser.registerOscHandler(110, new pe((c) => this.restoreFgColor(c))), this._parser.registerOscHandler(111, new pe((c) => this.restoreBgColor(c))), this._parser.registerOscHandler(112, new pe((c) => this.restoreCursorColor(c))), this._parser.registerEscHandler({ final: "7" }, () => this.saveCursor()), this._parser.registerEscHandler({ final: "8" }, () => this.restoreCursor()), this._parser.registerEscHandler({ final: "D" }, () => this.index()), this._parser.registerEscHandler({ final: "E" }, () => this.nextLine()), this._parser.registerEscHandler({ final: "H" }, () => this.tabSet()), this._parser.registerEscHandler({ final: "M" }, () => this.reverseIndex()), this._parser.registerEscHandler({ final: "=" }, () => this.keypadApplicationMode()), this._parser.registerEscHandler({ final: ">" }, () => this.keypadNumericMode()), this._parser.registerEscHandler({ final: "c" }, () => this.fullReset()), this._parser.registerEscHandler({ final: "n" }, () => this.setgLevel(2)), this._parser.registerEscHandler({ final: "o" }, () => this.setgLevel(3)), this._parser.registerEscHandler({ final: "|" }, () => this.setgLevel(3)), this._parser.registerEscHandler({ final: "}" }, () => this.setgLevel(2)), this._parser.registerEscHandler({ final: "~" }, () => this.setgLevel(1)), this._parser.registerEscHandler({ intermediates: "%", final: "@" }, () => this.selectDefaultCharset()), this._parser.registerEscHandler({ intermediates: "%", final: "G" }, () => this.selectDefaultCharset());
    for (let c in ne) this._parser.registerEscHandler({ intermediates: "(", final: c }, () => this.selectCharset("(" + c)), this._parser.registerEscHandler({ intermediates: ")", final: c }, () => this.selectCharset(")" + c)), this._parser.registerEscHandler({ intermediates: "*", final: c }, () => this.selectCharset("*" + c)), this._parser.registerEscHandler({ intermediates: "+", final: c }, () => this.selectCharset("+" + c)), this._parser.registerEscHandler({ intermediates: "-", final: c }, () => this.selectCharset("-" + c)), this._parser.registerEscHandler({ intermediates: ".", final: c }, () => this.selectCharset("." + c)), this._parser.registerEscHandler({ intermediates: "/", final: c }, () => this.selectCharset("/" + c));
    this._parser.registerEscHandler({ intermediates: "#", final: "8" }, () => this.screenAlignmentPattern()), this._parser.setErrorHandler((c) => (this._logService.error("Parsing error: ", c), c)), this._parser.registerDcsHandler({ intermediates: "$", final: "q" }, new Xi((c, d) => this.requestStatusString(c, d)));
  }
  getAttrData() {
    return this._curAttrData;
  }
  _preserveStack(e, i8, r, n) {
    this._parseStack.paused = true, this._parseStack.cursorStartX = e, this._parseStack.cursorStartY = i8, this._parseStack.decodedLength = r, this._parseStack.position = n;
  }
  _logSlowResolvingAsync(e) {
    this._logService.logLevel <= 3 && Promise.race([e, new Promise((i8, r) => setTimeout(() => r("#SLOW_TIMEOUT"), vl))]).catch((i8) => {
      if (i8 !== "#SLOW_TIMEOUT") throw i8;
      console.warn(`async parser handler taking longer than ${vl} ms`);
    });
  }
  _getCurrentLinkId() {
    return this._curAttrData.extended.urlId;
  }
  parse(e, i8) {
    let r, n = this._activeBuffer.x, o2 = this._activeBuffer.y, l = 0, a = this._parseStack.paused;
    if (a) {
      if (r = this._parser.parse(this._parseBuffer, this._parseStack.decodedLength, i8)) return this._logSlowResolvingAsync(r), r;
      n = this._parseStack.cursorStartX, o2 = this._parseStack.cursorStartY, this._parseStack.paused = false, e.length > ut && (l = this._parseStack.position + ut);
    }
    if (this._logService.logLevel <= 1 && this._logService.debug(`parsing data ${typeof e == "string" ? ` "${e}"` : ` "${Array.prototype.map.call(e, (c) => String.fromCharCode(c)).join("")}"`}`), this._logService.logLevel === 0 && this._logService.trace("parsing data (codes)", typeof e == "string" ? e.split("").map((c) => c.charCodeAt(0)) : e), this._parseBuffer.length < e.length && this._parseBuffer.length < ut && (this._parseBuffer = new Uint32Array(Math.min(e.length, ut))), a || this._dirtyRowTracker.clearRange(), e.length > ut) for (let c = l; c < e.length; c += ut) {
      let d = c + ut < e.length ? c + ut : e.length, _2 = typeof e == "string" ? this._stringDecoder.decode(e.substring(c, d), this._parseBuffer) : this._utf8Decoder.decode(e.subarray(c, d), this._parseBuffer);
      if (r = this._parser.parse(this._parseBuffer, _2)) return this._preserveStack(n, o2, _2, c), this._logSlowResolvingAsync(r), r;
    }
    else if (!a) {
      let c = typeof e == "string" ? this._stringDecoder.decode(e, this._parseBuffer) : this._utf8Decoder.decode(e, this._parseBuffer);
      if (r = this._parser.parse(this._parseBuffer, c)) return this._preserveStack(n, o2, c, 0), this._logSlowResolvingAsync(r), r;
    }
    (this._activeBuffer.x !== n || this._activeBuffer.y !== o2) && this._onCursorMove.fire();
    let u = this._dirtyRowTracker.end + (this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp), h2 = this._dirtyRowTracker.start + (this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
    h2 < this._bufferService.rows && this._onRequestRefreshRows.fire({ start: Math.min(h2, this._bufferService.rows - 1), end: Math.min(u, this._bufferService.rows - 1) });
  }
  print(e, i8, r) {
    let n, o2, l = this._charsetService.charset, a = this._optionsService.rawOptions.screenReaderMode, u = this._bufferService.cols, h2 = this._coreService.decPrivateModes.wraparound, c = this._coreService.modes.insertMode, d = this._curAttrData, _2 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
    this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._activeBuffer.x && r - i8 > 0 && _2.getWidth(this._activeBuffer.x - 1) === 2 && _2.setCellFromCodepoint(this._activeBuffer.x - 1, 0, 1, d);
    let p = this._parser.precedingJoinState;
    for (let m = i8; m < r; ++m) {
      if (n = e[m], n < 127 && l) {
        let O2 = l[String.fromCharCode(n)];
        O2 && (n = O2.charCodeAt(0));
      }
      let f = this._unicodeService.charProperties(n, p);
      o2 = Ae.extractWidth(f);
      let A = Ae.extractShouldJoin(f), R2 = A ? Ae.extractWidth(p) : 0;
      if (p = f, a && this._onA11yChar.fire(Ce(n)), this._getCurrentLinkId() && this._oscLinkService.addLineToLink(this._getCurrentLinkId(), this._activeBuffer.ybase + this._activeBuffer.y), this._activeBuffer.x + o2 - R2 > u) {
        if (h2) {
          let O2 = _2, I = this._activeBuffer.x - R2;
          for (this._activeBuffer.x = R2, this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData(), true)) : (this._activeBuffer.y >= this._bufferService.rows && (this._activeBuffer.y = this._bufferService.rows - 1), this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = true), _2 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y), R2 > 0 && _2 instanceof Ze && _2.copyCellsFrom(O2, I, 0, R2, false); I < u; ) O2.setCellFromCodepoint(I++, 0, 1, d);
        } else if (this._activeBuffer.x = u - 1, o2 === 2) continue;
      }
      if (A && this._activeBuffer.x) {
        let O2 = _2.getWidth(this._activeBuffer.x - 1) ? 1 : 2;
        _2.addCodepointToCell(this._activeBuffer.x - O2, n, o2);
        for (let I = o2 - R2; --I >= 0; ) _2.setCellFromCodepoint(this._activeBuffer.x++, 0, 0, d);
        continue;
      }
      if (c && (_2.insertCells(this._activeBuffer.x, o2 - R2, this._activeBuffer.getNullCell(d)), _2.getWidth(u - 1) === 2 && _2.setCellFromCodepoint(u - 1, 0, 1, d)), _2.setCellFromCodepoint(this._activeBuffer.x++, n, o2, d), o2 > 0) for (; --o2; ) _2.setCellFromCodepoint(this._activeBuffer.x++, 0, 0, d);
    }
    this._parser.precedingJoinState = p, this._activeBuffer.x < u && r - i8 > 0 && _2.getWidth(this._activeBuffer.x) === 0 && !_2.hasContent(this._activeBuffer.x) && _2.setCellFromCodepoint(this._activeBuffer.x, 0, 1, d), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
  }
  registerCsiHandler(e, i8) {
    return e.final === "t" && !e.prefix && !e.intermediates ? this._parser.registerCsiHandler(e, (r) => bl(r.params[0], this._optionsService.rawOptions.windowOptions) ? i8(r) : true) : this._parser.registerCsiHandler(e, i8);
  }
  registerDcsHandler(e, i8) {
    return this._parser.registerDcsHandler(e, new Xi(i8));
  }
  registerEscHandler(e, i8) {
    return this._parser.registerEscHandler(e, i8);
  }
  registerOscHandler(e, i8) {
    return this._parser.registerOscHandler(e, new pe(i8));
  }
  bell() {
    return this._onRequestBell.fire(), true;
  }
  lineFeed() {
    return this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._optionsService.rawOptions.convertEol && (this._activeBuffer.x = 0), this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData())) : this._activeBuffer.y >= this._bufferService.rows ? this._activeBuffer.y = this._bufferService.rows - 1 : this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = false, this._activeBuffer.x >= this._bufferService.cols && this._activeBuffer.x--, this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._onLineFeed.fire(), true;
  }
  carriageReturn() {
    return this._activeBuffer.x = 0, true;
  }
  backspace() {
    if (!this._coreService.decPrivateModes.reverseWraparound) return this._restrictCursor(), this._activeBuffer.x > 0 && this._activeBuffer.x--, true;
    if (this._restrictCursor(this._bufferService.cols), this._activeBuffer.x > 0) this._activeBuffer.x--;
    else if (this._activeBuffer.x === 0 && this._activeBuffer.y > this._activeBuffer.scrollTop && this._activeBuffer.y <= this._activeBuffer.scrollBottom && this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y)?.isWrapped) {
      this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = false, this._activeBuffer.y--, this._activeBuffer.x = this._bufferService.cols - 1;
      let e = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
      e.hasWidth(this._activeBuffer.x) && !e.hasContent(this._activeBuffer.x) && this._activeBuffer.x--;
    }
    return this._restrictCursor(), true;
  }
  tab() {
    if (this._activeBuffer.x >= this._bufferService.cols) return true;
    let e = this._activeBuffer.x;
    return this._activeBuffer.x = this._activeBuffer.nextStop(), this._optionsService.rawOptions.screenReaderMode && this._onA11yTab.fire(this._activeBuffer.x - e), true;
  }
  shiftOut() {
    return this._charsetService.setgLevel(1), true;
  }
  shiftIn() {
    return this._charsetService.setgLevel(0), true;
  }
  _restrictCursor(e = this._bufferService.cols - 1) {
    this._activeBuffer.x = Math.min(e, Math.max(0, this._activeBuffer.x)), this._activeBuffer.y = this._coreService.decPrivateModes.origin ? Math.min(this._activeBuffer.scrollBottom, Math.max(this._activeBuffer.scrollTop, this._activeBuffer.y)) : Math.min(this._bufferService.rows - 1, Math.max(0, this._activeBuffer.y)), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
  }
  _setCursor(e, i8) {
    this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._coreService.decPrivateModes.origin ? (this._activeBuffer.x = e, this._activeBuffer.y = this._activeBuffer.scrollTop + i8) : (this._activeBuffer.x = e, this._activeBuffer.y = i8), this._restrictCursor(), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
  }
  _moveCursor(e, i8) {
    this._restrictCursor(), this._setCursor(this._activeBuffer.x + e, this._activeBuffer.y + i8);
  }
  cursorUp(e) {
    let i8 = this._activeBuffer.y - this._activeBuffer.scrollTop;
    return i8 >= 0 ? this._moveCursor(0, -Math.min(i8, e.params[0] || 1)) : this._moveCursor(0, -(e.params[0] || 1)), true;
  }
  cursorDown(e) {
    let i8 = this._activeBuffer.scrollBottom - this._activeBuffer.y;
    return i8 >= 0 ? this._moveCursor(0, Math.min(i8, e.params[0] || 1)) : this._moveCursor(0, e.params[0] || 1), true;
  }
  cursorForward(e) {
    return this._moveCursor(e.params[0] || 1, 0), true;
  }
  cursorBackward(e) {
    return this._moveCursor(-(e.params[0] || 1), 0), true;
  }
  cursorNextLine(e) {
    return this.cursorDown(e), this._activeBuffer.x = 0, true;
  }
  cursorPrecedingLine(e) {
    return this.cursorUp(e), this._activeBuffer.x = 0, true;
  }
  cursorCharAbsolute(e) {
    return this._setCursor((e.params[0] || 1) - 1, this._activeBuffer.y), true;
  }
  cursorPosition(e) {
    return this._setCursor(e.length >= 2 ? (e.params[1] || 1) - 1 : 0, (e.params[0] || 1) - 1), true;
  }
  charPosAbsolute(e) {
    return this._setCursor((e.params[0] || 1) - 1, this._activeBuffer.y), true;
  }
  hPositionRelative(e) {
    return this._moveCursor(e.params[0] || 1, 0), true;
  }
  linePosAbsolute(e) {
    return this._setCursor(this._activeBuffer.x, (e.params[0] || 1) - 1), true;
  }
  vPositionRelative(e) {
    return this._moveCursor(0, e.params[0] || 1), true;
  }
  hVPosition(e) {
    return this.cursorPosition(e), true;
  }
  tabClear(e) {
    let i8 = e.params[0];
    return i8 === 0 ? delete this._activeBuffer.tabs[this._activeBuffer.x] : i8 === 3 && (this._activeBuffer.tabs = {}), true;
  }
  cursorForwardTab(e) {
    if (this._activeBuffer.x >= this._bufferService.cols) return true;
    let i8 = e.params[0] || 1;
    for (; i8--; ) this._activeBuffer.x = this._activeBuffer.nextStop();
    return true;
  }
  cursorBackwardTab(e) {
    if (this._activeBuffer.x >= this._bufferService.cols) return true;
    let i8 = e.params[0] || 1;
    for (; i8--; ) this._activeBuffer.x = this._activeBuffer.prevStop();
    return true;
  }
  selectProtected(e) {
    let i8 = e.params[0];
    return i8 === 1 && (this._curAttrData.bg |= 536870912), (i8 === 2 || i8 === 0) && (this._curAttrData.bg &= -536870913), true;
  }
  _eraseInBufferLine(e, i8, r, n = false, o2 = false) {
    let l = this._activeBuffer.lines.get(this._activeBuffer.ybase + e);
    l.replaceCells(i8, r, this._activeBuffer.getNullCell(this._eraseAttrData()), o2), n && (l.isWrapped = false);
  }
  _resetBufferLine(e, i8 = false) {
    let r = this._activeBuffer.lines.get(this._activeBuffer.ybase + e);
    r && (r.fill(this._activeBuffer.getNullCell(this._eraseAttrData()), i8), this._bufferService.buffer.clearMarkers(this._activeBuffer.ybase + e), r.isWrapped = false);
  }
  eraseInDisplay(e, i8 = false) {
    this._restrictCursor(this._bufferService.cols);
    let r;
    switch (e.params[0]) {
      case 0:
        for (r = this._activeBuffer.y, this._dirtyRowTracker.markDirty(r), this._eraseInBufferLine(r++, this._activeBuffer.x, this._bufferService.cols, this._activeBuffer.x === 0, i8); r < this._bufferService.rows; r++) this._resetBufferLine(r, i8);
        this._dirtyRowTracker.markDirty(r);
        break;
      case 1:
        for (r = this._activeBuffer.y, this._dirtyRowTracker.markDirty(r), this._eraseInBufferLine(r, 0, this._activeBuffer.x + 1, true, i8), this._activeBuffer.x + 1 >= this._bufferService.cols && (this._activeBuffer.lines.get(r + 1).isWrapped = false); r--; ) this._resetBufferLine(r, i8);
        this._dirtyRowTracker.markDirty(0);
        break;
      case 2:
        if (this._optionsService.rawOptions.scrollOnEraseInDisplay) {
          for (r = this._bufferService.rows, this._dirtyRowTracker.markRangeDirty(0, r - 1); r-- && !this._activeBuffer.lines.get(this._activeBuffer.ybase + r)?.getTrimmedLength(); ) ;
          for (; r >= 0; r--) this._bufferService.scroll(this._eraseAttrData());
        } else {
          for (r = this._bufferService.rows, this._dirtyRowTracker.markDirty(r - 1); r--; ) this._resetBufferLine(r, i8);
          this._dirtyRowTracker.markDirty(0);
        }
        break;
      case 3:
        let n = this._activeBuffer.lines.length - this._bufferService.rows;
        n > 0 && (this._activeBuffer.lines.trimStart(n), this._activeBuffer.ybase = Math.max(this._activeBuffer.ybase - n, 0), this._activeBuffer.ydisp = Math.max(this._activeBuffer.ydisp - n, 0), this._onScroll.fire(0));
        break;
    }
    return true;
  }
  eraseInLine(e, i8 = false) {
    switch (this._restrictCursor(this._bufferService.cols), e.params[0]) {
      case 0:
        this._eraseInBufferLine(this._activeBuffer.y, this._activeBuffer.x, this._bufferService.cols, this._activeBuffer.x === 0, i8);
        break;
      case 1:
        this._eraseInBufferLine(this._activeBuffer.y, 0, this._activeBuffer.x + 1, false, i8);
        break;
      case 2:
        this._eraseInBufferLine(this._activeBuffer.y, 0, this._bufferService.cols, true, i8);
        break;
    }
    return this._dirtyRowTracker.markDirty(this._activeBuffer.y), true;
  }
  insertLines(e) {
    this._restrictCursor();
    let i8 = e.params[0] || 1;
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
    let r = this._activeBuffer.ybase + this._activeBuffer.y, n = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom, o2 = this._bufferService.rows - 1 + this._activeBuffer.ybase - n + 1;
    for (; i8--; ) this._activeBuffer.lines.splice(o2 - 1, 1), this._activeBuffer.lines.splice(r, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom), this._activeBuffer.x = 0, true;
  }
  deleteLines(e) {
    this._restrictCursor();
    let i8 = e.params[0] || 1;
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
    let r = this._activeBuffer.ybase + this._activeBuffer.y, n;
    for (n = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom, n = this._bufferService.rows - 1 + this._activeBuffer.ybase - n; i8--; ) this._activeBuffer.lines.splice(r, 1), this._activeBuffer.lines.splice(n, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom), this._activeBuffer.x = 0, true;
  }
  insertChars(e) {
    this._restrictCursor();
    let i8 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
    return i8 && (i8.insertCells(this._activeBuffer.x, e.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData())), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
  }
  deleteChars(e) {
    this._restrictCursor();
    let i8 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
    return i8 && (i8.deleteCells(this._activeBuffer.x, e.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData())), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
  }
  scrollUp(e) {
    let i8 = e.params[0] || 1;
    for (; i8--; ) this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 1), this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
  }
  scrollDown(e) {
    let i8 = e.params[0] || 1;
    for (; i8--; ) this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 1), this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 0, this._activeBuffer.getBlankLine(X));
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
  }
  scrollLeft(e) {
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
    let i8 = e.params[0] || 1;
    for (let r = this._activeBuffer.scrollTop; r <= this._activeBuffer.scrollBottom; ++r) {
      let n = this._activeBuffer.lines.get(this._activeBuffer.ybase + r);
      n.deleteCells(0, i8, this._activeBuffer.getNullCell(this._eraseAttrData())), n.isWrapped = false;
    }
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
  }
  scrollRight(e) {
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
    let i8 = e.params[0] || 1;
    for (let r = this._activeBuffer.scrollTop; r <= this._activeBuffer.scrollBottom; ++r) {
      let n = this._activeBuffer.lines.get(this._activeBuffer.ybase + r);
      n.insertCells(0, i8, this._activeBuffer.getNullCell(this._eraseAttrData())), n.isWrapped = false;
    }
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
  }
  insertColumns(e) {
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
    let i8 = e.params[0] || 1;
    for (let r = this._activeBuffer.scrollTop; r <= this._activeBuffer.scrollBottom; ++r) {
      let n = this._activeBuffer.lines.get(this._activeBuffer.ybase + r);
      n.insertCells(this._activeBuffer.x, i8, this._activeBuffer.getNullCell(this._eraseAttrData())), n.isWrapped = false;
    }
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
  }
  deleteColumns(e) {
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
    let i8 = e.params[0] || 1;
    for (let r = this._activeBuffer.scrollTop; r <= this._activeBuffer.scrollBottom; ++r) {
      let n = this._activeBuffer.lines.get(this._activeBuffer.ybase + r);
      n.deleteCells(this._activeBuffer.x, i8, this._activeBuffer.getNullCell(this._eraseAttrData())), n.isWrapped = false;
    }
    return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
  }
  eraseChars(e) {
    this._restrictCursor();
    let i8 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
    return i8 && (i8.replaceCells(this._activeBuffer.x, this._activeBuffer.x + (e.params[0] || 1), this._activeBuffer.getNullCell(this._eraseAttrData())), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
  }
  repeatPrecedingCharacter(e) {
    let i8 = this._parser.precedingJoinState;
    if (!i8) return true;
    let r = e.params[0] || 1, n = Ae.extractWidth(i8), o2 = this._activeBuffer.x - n, a = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).getString(o2), u = new Uint32Array(a.length * r), h2 = 0;
    for (let d = 0; d < a.length; ) {
      let _2 = a.codePointAt(d) || 0;
      u[h2++] = _2, d += _2 > 65535 ? 2 : 1;
    }
    let c = h2;
    for (let d = 1; d < r; ++d) u.copyWithin(c, 0, h2), c += h2;
    return this.print(u, 0, c), true;
  }
  sendDeviceAttributesPrimary(e) {
    return e.params[0] > 0 || (this._is("xterm") || this._is("rxvt-unicode") || this._is("screen") ? this._coreService.triggerDataEvent(b.ESC + "[?1;2c") : this._is("linux") && this._coreService.triggerDataEvent(b.ESC + "[?6c")), true;
  }
  sendDeviceAttributesSecondary(e) {
    return e.params[0] > 0 || (this._is("xterm") ? this._coreService.triggerDataEvent(b.ESC + "[>0;276;0c") : this._is("rxvt-unicode") ? this._coreService.triggerDataEvent(b.ESC + "[>85;95;0c") : this._is("linux") ? this._coreService.triggerDataEvent(e.params[0] + "c") : this._is("screen") && this._coreService.triggerDataEvent(b.ESC + "[>83;40003;0c")), true;
  }
  _is(e) {
    return (this._optionsService.rawOptions.termName + "").indexOf(e) === 0;
  }
  setMode(e) {
    for (let i8 = 0; i8 < e.length; i8++) switch (e.params[i8]) {
      case 4:
        this._coreService.modes.insertMode = true;
        break;
      case 20:
        this._optionsService.options.convertEol = true;
        break;
    }
    return true;
  }
  setModePrivate(e) {
    for (let i8 = 0; i8 < e.length; i8++) switch (e.params[i8]) {
      case 1:
        this._coreService.decPrivateModes.applicationCursorKeys = true;
        break;
      case 2:
        this._charsetService.setgCharset(0, Je), this._charsetService.setgCharset(1, Je), this._charsetService.setgCharset(2, Je), this._charsetService.setgCharset(3, Je);
        break;
      case 3:
        this._optionsService.rawOptions.windowOptions.setWinLines && (this._bufferService.resize(132, this._bufferService.rows), this._onRequestReset.fire());
        break;
      case 6:
        this._coreService.decPrivateModes.origin = true, this._setCursor(0, 0);
        break;
      case 7:
        this._coreService.decPrivateModes.wraparound = true;
        break;
      case 12:
        this._optionsService.options.cursorBlink = true;
        break;
      case 45:
        this._coreService.decPrivateModes.reverseWraparound = true;
        break;
      case 66:
        this._logService.debug("Serial port requested application keypad."), this._coreService.decPrivateModes.applicationKeypad = true, this._onRequestSyncScrollBar.fire();
        break;
      case 9:
        this._coreMouseService.activeProtocol = "X10";
        break;
      case 1e3:
        this._coreMouseService.activeProtocol = "VT200";
        break;
      case 1002:
        this._coreMouseService.activeProtocol = "DRAG";
        break;
      case 1003:
        this._coreMouseService.activeProtocol = "ANY";
        break;
      case 1004:
        this._coreService.decPrivateModes.sendFocus = true, this._onRequestSendFocus.fire();
        break;
      case 1005:
        this._logService.debug("DECSET 1005 not supported (see #2507)");
        break;
      case 1006:
        this._coreMouseService.activeEncoding = "SGR";
        break;
      case 1015:
        this._logService.debug("DECSET 1015 not supported (see #2507)");
        break;
      case 1016:
        this._coreMouseService.activeEncoding = "SGR_PIXELS";
        break;
      case 25:
        this._coreService.isCursorHidden = false;
        break;
      case 1048:
        this.saveCursor();
        break;
      case 1049:
        this.saveCursor();
      case 47:
      case 1047:
        this._bufferService.buffers.activateAltBuffer(this._eraseAttrData()), this._coreService.isCursorInitialized = true, this._onRequestRefreshRows.fire(void 0), this._onRequestSyncScrollBar.fire();
        break;
      case 2004:
        this._coreService.decPrivateModes.bracketedPasteMode = true;
        break;
      case 2026:
        this._coreService.decPrivateModes.synchronizedOutput = true;
        break;
    }
    return true;
  }
  resetMode(e) {
    for (let i8 = 0; i8 < e.length; i8++) switch (e.params[i8]) {
      case 4:
        this._coreService.modes.insertMode = false;
        break;
      case 20:
        this._optionsService.options.convertEol = false;
        break;
    }
    return true;
  }
  resetModePrivate(e) {
    for (let i8 = 0; i8 < e.length; i8++) switch (e.params[i8]) {
      case 1:
        this._coreService.decPrivateModes.applicationCursorKeys = false;
        break;
      case 3:
        this._optionsService.rawOptions.windowOptions.setWinLines && (this._bufferService.resize(80, this._bufferService.rows), this._onRequestReset.fire());
        break;
      case 6:
        this._coreService.decPrivateModes.origin = false, this._setCursor(0, 0);
        break;
      case 7:
        this._coreService.decPrivateModes.wraparound = false;
        break;
      case 12:
        this._optionsService.options.cursorBlink = false;
        break;
      case 45:
        this._coreService.decPrivateModes.reverseWraparound = false;
        break;
      case 66:
        this._logService.debug("Switching back to normal keypad."), this._coreService.decPrivateModes.applicationKeypad = false, this._onRequestSyncScrollBar.fire();
        break;
      case 9:
      case 1e3:
      case 1002:
      case 1003:
        this._coreMouseService.activeProtocol = "NONE";
        break;
      case 1004:
        this._coreService.decPrivateModes.sendFocus = false;
        break;
      case 1005:
        this._logService.debug("DECRST 1005 not supported (see #2507)");
        break;
      case 1006:
        this._coreMouseService.activeEncoding = "DEFAULT";
        break;
      case 1015:
        this._logService.debug("DECRST 1015 not supported (see #2507)");
        break;
      case 1016:
        this._coreMouseService.activeEncoding = "DEFAULT";
        break;
      case 25:
        this._coreService.isCursorHidden = true;
        break;
      case 1048:
        this.restoreCursor();
        break;
      case 1049:
      case 47:
      case 1047:
        this._bufferService.buffers.activateNormalBuffer(), e.params[i8] === 1049 && this.restoreCursor(), this._coreService.isCursorInitialized = true, this._onRequestRefreshRows.fire(void 0), this._onRequestSyncScrollBar.fire();
        break;
      case 2004:
        this._coreService.decPrivateModes.bracketedPasteMode = false;
        break;
      case 2026:
        this._coreService.decPrivateModes.synchronizedOutput = false, this._onRequestRefreshRows.fire(void 0);
        break;
    }
    return true;
  }
  requestMode(e, i8) {
    let r;
    ((P) => (P[P.NOT_RECOGNIZED = 0] = "NOT_RECOGNIZED", P[P.SET = 1] = "SET", P[P.RESET = 2] = "RESET", P[P.PERMANENTLY_SET = 3] = "PERMANENTLY_SET", P[P.PERMANENTLY_RESET = 4] = "PERMANENTLY_RESET"))(r || (r = {}));
    let n = this._coreService.decPrivateModes, { activeProtocol: o2, activeEncoding: l } = this._coreMouseService, a = this._coreService, { buffers: u, cols: h2 } = this._bufferService, { active: c, alt: d } = u, _2 = this._optionsService.rawOptions, p = (A, R2) => (a.triggerDataEvent(`${b.ESC}[${i8 ? "" : "?"}${A};${R2}$y`), true), m = (A) => A ? 1 : 2, f = e.params[0];
    return i8 ? f === 2 ? p(f, 4) : f === 4 ? p(f, m(a.modes.insertMode)) : f === 12 ? p(f, 3) : f === 20 ? p(f, m(_2.convertEol)) : p(f, 0) : f === 1 ? p(f, m(n.applicationCursorKeys)) : f === 3 ? p(f, _2.windowOptions.setWinLines ? h2 === 80 ? 2 : h2 === 132 ? 1 : 0 : 0) : f === 6 ? p(f, m(n.origin)) : f === 7 ? p(f, m(n.wraparound)) : f === 8 ? p(f, 3) : f === 9 ? p(f, m(o2 === "X10")) : f === 12 ? p(f, m(_2.cursorBlink)) : f === 25 ? p(f, m(!a.isCursorHidden)) : f === 45 ? p(f, m(n.reverseWraparound)) : f === 66 ? p(f, m(n.applicationKeypad)) : f === 67 ? p(f, 4) : f === 1e3 ? p(f, m(o2 === "VT200")) : f === 1002 ? p(f, m(o2 === "DRAG")) : f === 1003 ? p(f, m(o2 === "ANY")) : f === 1004 ? p(f, m(n.sendFocus)) : f === 1005 ? p(f, 4) : f === 1006 ? p(f, m(l === "SGR")) : f === 1015 ? p(f, 4) : f === 1016 ? p(f, m(l === "SGR_PIXELS")) : f === 1048 ? p(f, 1) : f === 47 || f === 1047 || f === 1049 ? p(f, m(c === d)) : f === 2004 ? p(f, m(n.bracketedPasteMode)) : f === 2026 ? p(f, m(n.synchronizedOutput)) : p(f, 0);
  }
  _updateAttrColor(e, i8, r, n, o2) {
    return i8 === 2 ? (e |= 50331648, e &= -16777216, e |= De.fromColorRGB([r, n, o2])) : i8 === 5 && (e &= -50331904, e |= 33554432 | r & 255), e;
  }
  _extractColor(e, i8, r) {
    let n = [0, 0, -1, 0, 0, 0], o2 = 0, l = 0;
    do {
      if (n[l + o2] = e.params[i8 + l], e.hasSubParams(i8 + l)) {
        let a = e.getSubParams(i8 + l), u = 0;
        do
          n[1] === 5 && (o2 = 1), n[l + u + 1 + o2] = a[u];
        while (++u < a.length && u + l + 1 + o2 < n.length);
        break;
      }
      if (n[1] === 5 && l + o2 >= 2 || n[1] === 2 && l + o2 >= 5) break;
      n[1] && (o2 = 1);
    } while (++l + i8 < e.length && l + o2 < n.length);
    for (let a = 2; a < n.length; ++a) n[a] === -1 && (n[a] = 0);
    switch (n[0]) {
      case 38:
        r.fg = this._updateAttrColor(r.fg, n[1], n[3], n[4], n[5]);
        break;
      case 48:
        r.bg = this._updateAttrColor(r.bg, n[1], n[3], n[4], n[5]);
        break;
      case 58:
        r.extended = r.extended.clone(), r.extended.underlineColor = this._updateAttrColor(r.extended.underlineColor, n[1], n[3], n[4], n[5]);
    }
    return l;
  }
  _processUnderline(e, i8) {
    i8.extended = i8.extended.clone(), (!~e || e > 5) && (e = 1), i8.extended.underlineStyle = e, i8.fg |= 268435456, e === 0 && (i8.fg &= -268435457), i8.updateExtended();
  }
  _processSGR0(e) {
    e.fg = X.fg, e.bg = X.bg, e.extended = e.extended.clone(), e.extended.underlineStyle = 0, e.extended.underlineColor &= -67108864, e.updateExtended();
  }
  charAttributes(e) {
    if (e.length === 1 && e.params[0] === 0) return this._processSGR0(this._curAttrData), true;
    let i8 = e.length, r, n = this._curAttrData;
    for (let o2 = 0; o2 < i8; o2++) r = e.params[o2], r >= 30 && r <= 37 ? (n.fg &= -50331904, n.fg |= 16777216 | r - 30) : r >= 40 && r <= 47 ? (n.bg &= -50331904, n.bg |= 16777216 | r - 40) : r >= 90 && r <= 97 ? (n.fg &= -50331904, n.fg |= 16777216 | r - 90 | 8) : r >= 100 && r <= 107 ? (n.bg &= -50331904, n.bg |= 16777216 | r - 100 | 8) : r === 0 ? this._processSGR0(n) : r === 1 ? n.fg |= 134217728 : r === 3 ? n.bg |= 67108864 : r === 4 ? (n.fg |= 268435456, this._processUnderline(e.hasSubParams(o2) ? e.getSubParams(o2)[0] : 1, n)) : r === 5 ? n.fg |= 536870912 : r === 7 ? n.fg |= 67108864 : r === 8 ? n.fg |= 1073741824 : r === 9 ? n.fg |= 2147483648 : r === 2 ? n.bg |= 134217728 : r === 21 ? this._processUnderline(2, n) : r === 22 ? (n.fg &= -134217729, n.bg &= -134217729) : r === 23 ? n.bg &= -67108865 : r === 24 ? (n.fg &= -268435457, this._processUnderline(0, n)) : r === 25 ? n.fg &= -536870913 : r === 27 ? n.fg &= -67108865 : r === 28 ? n.fg &= -1073741825 : r === 29 ? n.fg &= 2147483647 : r === 39 ? (n.fg &= -67108864, n.fg |= X.fg & 16777215) : r === 49 ? (n.bg &= -67108864, n.bg |= X.bg & 16777215) : r === 38 || r === 48 || r === 58 ? o2 += this._extractColor(e, o2, n) : r === 53 ? n.bg |= 1073741824 : r === 55 ? n.bg &= -1073741825 : r === 59 ? (n.extended = n.extended.clone(), n.extended.underlineColor = -1, n.updateExtended()) : r === 100 ? (n.fg &= -67108864, n.fg |= X.fg & 16777215, n.bg &= -67108864, n.bg |= X.bg & 16777215) : this._logService.debug("Unknown SGR attribute: %d.", r);
    return true;
  }
  deviceStatus(e) {
    switch (e.params[0]) {
      case 5:
        this._coreService.triggerDataEvent(`${b.ESC}[0n`);
        break;
      case 6:
        let i8 = this._activeBuffer.y + 1, r = this._activeBuffer.x + 1;
        this._coreService.triggerDataEvent(`${b.ESC}[${i8};${r}R`);
        break;
    }
    return true;
  }
  deviceStatusPrivate(e) {
    switch (e.params[0]) {
      case 6:
        let i8 = this._activeBuffer.y + 1, r = this._activeBuffer.x + 1;
        this._coreService.triggerDataEvent(`${b.ESC}[?${i8};${r}R`);
        break;
      case 15:
        break;
      case 25:
        break;
      case 26:
        break;
      case 53:
        break;
    }
    return true;
  }
  softReset(e) {
    return this._coreService.isCursorHidden = false, this._onRequestSyncScrollBar.fire(), this._activeBuffer.scrollTop = 0, this._activeBuffer.scrollBottom = this._bufferService.rows - 1, this._curAttrData = X.clone(), this._coreService.reset(), this._charsetService.reset(), this._activeBuffer.savedX = 0, this._activeBuffer.savedY = this._activeBuffer.ybase, this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg, this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg, this._activeBuffer.savedCharset = this._charsetService.charset, this._coreService.decPrivateModes.origin = false, true;
  }
  setCursorStyle(e) {
    let i8 = e.length === 0 ? 1 : e.params[0];
    if (i8 === 0) this._coreService.decPrivateModes.cursorStyle = void 0, this._coreService.decPrivateModes.cursorBlink = void 0;
    else {
      switch (i8) {
        case 1:
        case 2:
          this._coreService.decPrivateModes.cursorStyle = "block";
          break;
        case 3:
        case 4:
          this._coreService.decPrivateModes.cursorStyle = "underline";
          break;
        case 5:
        case 6:
          this._coreService.decPrivateModes.cursorStyle = "bar";
          break;
      }
      let r = i8 % 2 === 1;
      this._coreService.decPrivateModes.cursorBlink = r;
    }
    return true;
  }
  setScrollRegion(e) {
    let i8 = e.params[0] || 1, r;
    return (e.length < 2 || (r = e.params[1]) > this._bufferService.rows || r === 0) && (r = this._bufferService.rows), r > i8 && (this._activeBuffer.scrollTop = i8 - 1, this._activeBuffer.scrollBottom = r - 1, this._setCursor(0, 0)), true;
  }
  windowOptions(e) {
    if (!bl(e.params[0], this._optionsService.rawOptions.windowOptions)) return true;
    let i8 = e.length > 1 ? e.params[1] : 0;
    switch (e.params[0]) {
      case 14:
        i8 !== 2 && this._onRequestWindowsOptionsReport.fire(0);
        break;
      case 16:
        this._onRequestWindowsOptionsReport.fire(1);
        break;
      case 18:
        this._bufferService && this._coreService.triggerDataEvent(`${b.ESC}[8;${this._bufferService.rows};${this._bufferService.cols}t`);
        break;
      case 22:
        (i8 === 0 || i8 === 2) && (this._windowTitleStack.push(this._windowTitle), this._windowTitleStack.length > _l && this._windowTitleStack.shift()), (i8 === 0 || i8 === 1) && (this._iconNameStack.push(this._iconName), this._iconNameStack.length > _l && this._iconNameStack.shift());
        break;
      case 23:
        (i8 === 0 || i8 === 2) && this._windowTitleStack.length && this.setTitle(this._windowTitleStack.pop()), (i8 === 0 || i8 === 1) && this._iconNameStack.length && this.setIconName(this._iconNameStack.pop());
        break;
    }
    return true;
  }
  saveCursor(e) {
    return this._activeBuffer.savedX = this._activeBuffer.x, this._activeBuffer.savedY = this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg, this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg, this._activeBuffer.savedCharset = this._charsetService.charset, true;
  }
  restoreCursor(e) {
    return this._activeBuffer.x = this._activeBuffer.savedX || 0, this._activeBuffer.y = Math.max(this._activeBuffer.savedY - this._activeBuffer.ybase, 0), this._curAttrData.fg = this._activeBuffer.savedCurAttrData.fg, this._curAttrData.bg = this._activeBuffer.savedCurAttrData.bg, this._charsetService.charset = this._savedCharset, this._activeBuffer.savedCharset && (this._charsetService.charset = this._activeBuffer.savedCharset), this._restrictCursor(), true;
  }
  setTitle(e) {
    return this._windowTitle = e, this._onTitleChange.fire(e), true;
  }
  setIconName(e) {
    return this._iconName = e, true;
  }
  setOrReportIndexedColor(e) {
    let i8 = [], r = e.split(";");
    for (; r.length > 1; ) {
      let n = r.shift(), o2 = r.shift();
      if (/^\d+$/.exec(n)) {
        let l = parseInt(n);
        if (Sl(l)) if (o2 === "?") i8.push({ type: 0, index: l });
        else {
          let a = Ws(o2);
          a && i8.push({ type: 1, index: l, color: a });
        }
      }
    }
    return i8.length && this._onColor.fire(i8), true;
  }
  setHyperlink(e) {
    let i8 = e.indexOf(";");
    if (i8 === -1) return true;
    let r = e.slice(0, i8).trim(), n = e.slice(i8 + 1);
    return n ? this._createHyperlink(r, n) : r.trim() ? false : this._finishHyperlink();
  }
  _createHyperlink(e, i8) {
    this._getCurrentLinkId() && this._finishHyperlink();
    let r = e.split(":"), n, o2 = r.findIndex((l) => l.startsWith("id="));
    return o2 !== -1 && (n = r[o2].slice(3) || void 0), this._curAttrData.extended = this._curAttrData.extended.clone(), this._curAttrData.extended.urlId = this._oscLinkService.registerLink({ id: n, uri: i8 }), this._curAttrData.updateExtended(), true;
  }
  _finishHyperlink() {
    return this._curAttrData.extended = this._curAttrData.extended.clone(), this._curAttrData.extended.urlId = 0, this._curAttrData.updateExtended(), true;
  }
  _setOrReportSpecialColor(e, i8) {
    let r = e.split(";");
    for (let n = 0; n < r.length && !(i8 >= this._specialColors.length); ++n, ++i8) if (r[n] === "?") this._onColor.fire([{ type: 0, index: this._specialColors[i8] }]);
    else {
      let o2 = Ws(r[n]);
      o2 && this._onColor.fire([{ type: 1, index: this._specialColors[i8], color: o2 }]);
    }
    return true;
  }
  setOrReportFgColor(e) {
    return this._setOrReportSpecialColor(e, 0);
  }
  setOrReportBgColor(e) {
    return this._setOrReportSpecialColor(e, 1);
  }
  setOrReportCursorColor(e) {
    return this._setOrReportSpecialColor(e, 2);
  }
  restoreIndexedColor(e) {
    if (!e) return this._onColor.fire([{ type: 2 }]), true;
    let i8 = [], r = e.split(";");
    for (let n = 0; n < r.length; ++n) if (/^\d+$/.exec(r[n])) {
      let o2 = parseInt(r[n]);
      Sl(o2) && i8.push({ type: 2, index: o2 });
    }
    return i8.length && this._onColor.fire(i8), true;
  }
  restoreFgColor(e) {
    return this._onColor.fire([{ type: 2, index: 256 }]), true;
  }
  restoreBgColor(e) {
    return this._onColor.fire([{ type: 2, index: 257 }]), true;
  }
  restoreCursorColor(e) {
    return this._onColor.fire([{ type: 2, index: 258 }]), true;
  }
  nextLine() {
    return this._activeBuffer.x = 0, this.index(), true;
  }
  keypadApplicationMode() {
    return this._logService.debug("Serial port requested application keypad."), this._coreService.decPrivateModes.applicationKeypad = true, this._onRequestSyncScrollBar.fire(), true;
  }
  keypadNumericMode() {
    return this._logService.debug("Switching back to normal keypad."), this._coreService.decPrivateModes.applicationKeypad = false, this._onRequestSyncScrollBar.fire(), true;
  }
  selectDefaultCharset() {
    return this._charsetService.setgLevel(0), this._charsetService.setgCharset(0, Je), true;
  }
  selectCharset(e) {
    return e.length !== 2 ? (this.selectDefaultCharset(), true) : (e[0] === "/" || this._charsetService.setgCharset(mc[e[0]], ne[e[1]] || Je), true);
  }
  index() {
    return this._restrictCursor(), this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData())) : this._activeBuffer.y >= this._bufferService.rows && (this._activeBuffer.y = this._bufferService.rows - 1), this._restrictCursor(), true;
  }
  tabSet() {
    return this._activeBuffer.tabs[this._activeBuffer.x] = true, true;
  }
  reverseIndex() {
    if (this._restrictCursor(), this._activeBuffer.y === this._activeBuffer.scrollTop) {
      let e = this._activeBuffer.scrollBottom - this._activeBuffer.scrollTop;
      this._activeBuffer.lines.shiftElements(this._activeBuffer.ybase + this._activeBuffer.y, e, 1), this._activeBuffer.lines.set(this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.getBlankLine(this._eraseAttrData())), this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
    } else this._activeBuffer.y--, this._restrictCursor();
    return true;
  }
  fullReset() {
    return this._parser.reset(), this._onRequestReset.fire(), true;
  }
  reset() {
    this._curAttrData = X.clone(), this._eraseAttrDataInternal = X.clone();
  }
  _eraseAttrData() {
    return this._eraseAttrDataInternal.bg &= -67108864, this._eraseAttrDataInternal.bg |= this._curAttrData.bg & 67108863, this._eraseAttrDataInternal;
  }
  setgLevel(e) {
    return this._charsetService.setgLevel(e), true;
  }
  screenAlignmentPattern() {
    let e = new q();
    e.content = 1 << 22 | 69, e.fg = this._curAttrData.fg, e.bg = this._curAttrData.bg, this._setCursor(0, 0);
    for (let i8 = 0; i8 < this._bufferService.rows; ++i8) {
      let r = this._activeBuffer.ybase + this._activeBuffer.y + i8, n = this._activeBuffer.lines.get(r);
      n && (n.fill(e), n.isWrapped = false);
    }
    return this._dirtyRowTracker.markAllDirty(), this._setCursor(0, 0), true;
  }
  requestStatusString(e, i8) {
    let r = (a) => (this._coreService.triggerDataEvent(`${b.ESC}${a}${b.ESC}\\`), true), n = this._bufferService.buffer, o2 = this._optionsService.rawOptions, l = { block: 2, underline: 4, bar: 6 };
    return r(e === '"q' ? `P1$r${this._curAttrData.isProtected() ? 1 : 0}"q` : e === '"p' ? 'P1$r61;1"p' : e === "r" ? `P1$r${n.scrollTop + 1};${n.scrollBottom + 1}r` : e === "m" ? "P1$r0m" : e === " q" ? `P1$r${l[o2.cursorStyle] - (o2.cursorBlink ? 1 : 0)} q` : "P0$r");
  }
  markRangeDirty(e, i8) {
    this._dirtyRowTracker.markRangeDirty(e, i8);
  }
};
var Zi = class {
  constructor(t) {
    this._bufferService = t;
    this.clearRange();
  }
  clearRange() {
    this.start = this._bufferService.buffer.y, this.end = this._bufferService.buffer.y;
  }
  markDirty(t) {
    t < this.start ? this.start = t : t > this.end && (this.end = t);
  }
  markRangeDirty(t, e) {
    t > e && (gl = t, t = e, e = gl), t < this.start && (this.start = t), e > this.end && (this.end = e);
  }
  markAllDirty() {
    this.markRangeDirty(0, this._bufferService.rows - 1);
  }
};
Zi = M([S(0, F)], Zi);
function Sl(s15) {
  return 0 <= s15 && s15 < 256;
}
var _c = 5e7;
var El = 12;
var bc = 50;
var gn = class extends D2 {
  constructor(e) {
    super();
    this._action = e;
    this._writeBuffer = [];
    this._callbacks = [];
    this._pendingData = 0;
    this._bufferOffset = 0;
    this._isSyncWriting = false;
    this._syncCalls = 0;
    this._didUserInput = false;
    this._onWriteParsed = this._register(new v());
    this.onWriteParsed = this._onWriteParsed.event;
  }
  handleUserInput() {
    this._didUserInput = true;
  }
  writeSync(e, i8) {
    if (i8 !== void 0 && this._syncCalls > i8) {
      this._syncCalls = 0;
      return;
    }
    if (this._pendingData += e.length, this._writeBuffer.push(e), this._callbacks.push(void 0), this._syncCalls++, this._isSyncWriting) return;
    this._isSyncWriting = true;
    let r;
    for (; r = this._writeBuffer.shift(); ) {
      this._action(r);
      let n = this._callbacks.shift();
      n && n();
    }
    this._pendingData = 0, this._bufferOffset = 2147483647, this._isSyncWriting = false, this._syncCalls = 0;
  }
  write(e, i8) {
    if (this._pendingData > _c) throw new Error("write data discarded, use flow control to avoid losing data");
    if (!this._writeBuffer.length) {
      if (this._bufferOffset = 0, this._didUserInput) {
        this._didUserInput = false, this._pendingData += e.length, this._writeBuffer.push(e), this._callbacks.push(i8), this._innerWrite();
        return;
      }
      setTimeout(() => this._innerWrite());
    }
    this._pendingData += e.length, this._writeBuffer.push(e), this._callbacks.push(i8);
  }
  _innerWrite(e = 0, i8 = true) {
    let r = e || performance.now();
    for (; this._writeBuffer.length > this._bufferOffset; ) {
      let n = this._writeBuffer[this._bufferOffset], o2 = this._action(n, i8);
      if (o2) {
        let a = (u) => performance.now() - r >= El ? setTimeout(() => this._innerWrite(0, u)) : this._innerWrite(r, u);
        o2.catch((u) => (queueMicrotask(() => {
          throw u;
        }), Promise.resolve(false))).then(a);
        return;
      }
      let l = this._callbacks[this._bufferOffset];
      if (l && l(), this._bufferOffset++, this._pendingData -= n.length, performance.now() - r >= El) break;
    }
    this._writeBuffer.length > this._bufferOffset ? (this._bufferOffset > bc && (this._writeBuffer = this._writeBuffer.slice(this._bufferOffset), this._callbacks = this._callbacks.slice(this._bufferOffset), this._bufferOffset = 0), setTimeout(() => this._innerWrite())) : (this._writeBuffer.length = 0, this._callbacks.length = 0, this._pendingData = 0, this._bufferOffset = 0), this._onWriteParsed.fire();
  }
};
var ui = class {
  constructor(t) {
    this._bufferService = t;
    this._nextId = 1;
    this._entriesWithId = /* @__PURE__ */ new Map();
    this._dataByLinkId = /* @__PURE__ */ new Map();
  }
  registerLink(t) {
    let e = this._bufferService.buffer;
    if (t.id === void 0) {
      let a = e.addMarker(e.ybase + e.y), u = { data: t, id: this._nextId++, lines: [a] };
      return a.onDispose(() => this._removeMarkerFromLink(u, a)), this._dataByLinkId.set(u.id, u), u.id;
    }
    let i8 = t, r = this._getEntryIdKey(i8), n = this._entriesWithId.get(r);
    if (n) return this.addLineToLink(n.id, e.ybase + e.y), n.id;
    let o2 = e.addMarker(e.ybase + e.y), l = { id: this._nextId++, key: this._getEntryIdKey(i8), data: i8, lines: [o2] };
    return o2.onDispose(() => this._removeMarkerFromLink(l, o2)), this._entriesWithId.set(l.key, l), this._dataByLinkId.set(l.id, l), l.id;
  }
  addLineToLink(t, e) {
    let i8 = this._dataByLinkId.get(t);
    if (i8 && i8.lines.every((r) => r.line !== e)) {
      let r = this._bufferService.buffer.addMarker(e);
      i8.lines.push(r), r.onDispose(() => this._removeMarkerFromLink(i8, r));
    }
  }
  getLinkData(t) {
    return this._dataByLinkId.get(t)?.data;
  }
  _getEntryIdKey(t) {
    return `${t.id};;${t.uri}`;
  }
  _removeMarkerFromLink(t, e) {
    let i8 = t.lines.indexOf(e);
    i8 !== -1 && (t.lines.splice(i8, 1), t.lines.length === 0 && (t.data.id !== void 0 && this._entriesWithId.delete(t.key), this._dataByLinkId.delete(t.id)));
  }
};
ui = M([S(0, F)], ui);
var Tl = false;
var Sn = class extends D2 {
  constructor(e) {
    super();
    this._windowsWrappingHeuristics = this._register(new ye());
    this._onBinary = this._register(new v());
    this.onBinary = this._onBinary.event;
    this._onData = this._register(new v());
    this.onData = this._onData.event;
    this._onLineFeed = this._register(new v());
    this.onLineFeed = this._onLineFeed.event;
    this._onResize = this._register(new v());
    this.onResize = this._onResize.event;
    this._onWriteParsed = this._register(new v());
    this.onWriteParsed = this._onWriteParsed.event;
    this._onScroll = this._register(new v());
    this._instantiationService = new ln(), this.optionsService = this._register(new dn(e)), this._instantiationService.setService(H, this.optionsService), this._bufferService = this._register(this._instantiationService.createInstance(ni)), this._instantiationService.setService(F, this._bufferService), this._logService = this._register(this._instantiationService.createInstance(ii)), this._instantiationService.setService(nr, this._logService), this.coreService = this._register(this._instantiationService.createInstance(li)), this._instantiationService.setService(ge, this.coreService), this.coreMouseService = this._register(this._instantiationService.createInstance(ai)), this._instantiationService.setService(rr, this.coreMouseService), this.unicodeService = this._register(this._instantiationService.createInstance(Ae)), this._instantiationService.setService(Js, this.unicodeService), this._charsetService = this._instantiationService.createInstance(pn), this._instantiationService.setService(Zs, this._charsetService), this._oscLinkService = this._instantiationService.createInstance(ui), this._instantiationService.setService(sr, this._oscLinkService), this._inputHandler = this._register(new vn(this._bufferService, this._charsetService, this.coreService, this._logService, this.optionsService, this._oscLinkService, this.coreMouseService, this.unicodeService)), this._register($.forward(this._inputHandler.onLineFeed, this._onLineFeed)), this._register(this._inputHandler), this._register($.forward(this._bufferService.onResize, this._onResize)), this._register($.forward(this.coreService.onData, this._onData)), this._register($.forward(this.coreService.onBinary, this._onBinary)), this._register(this.coreService.onRequestScrollToBottom(() => this.scrollToBottom(true))), this._register(this.coreService.onUserInput(() => this._writeBuffer.handleUserInput())), this._register(this.optionsService.onMultipleOptionChange(["windowsMode", "windowsPty"], () => this._handleWindowsPtyOptionChange())), this._register(this._bufferService.onScroll(() => {
      this._onScroll.fire({ position: this._bufferService.buffer.ydisp }), this._inputHandler.markRangeDirty(this._bufferService.buffer.scrollTop, this._bufferService.buffer.scrollBottom);
    })), this._writeBuffer = this._register(new gn((i8, r) => this._inputHandler.parse(i8, r))), this._register($.forward(this._writeBuffer.onWriteParsed, this._onWriteParsed));
  }
  get onScroll() {
    return this._onScrollApi || (this._onScrollApi = this._register(new v()), this._onScroll.event((e) => {
      this._onScrollApi?.fire(e.position);
    })), this._onScrollApi.event;
  }
  get cols() {
    return this._bufferService.cols;
  }
  get rows() {
    return this._bufferService.rows;
  }
  get buffers() {
    return this._bufferService.buffers;
  }
  get options() {
    return this.optionsService.options;
  }
  set options(e) {
    for (let i8 in e) this.optionsService.options[i8] = e[i8];
  }
  write(e, i8) {
    this._writeBuffer.write(e, i8);
  }
  writeSync(e, i8) {
    this._logService.logLevel <= 3 && !Tl && (this._logService.warn("writeSync is unreliable and will be removed soon."), Tl = true), this._writeBuffer.writeSync(e, i8);
  }
  input(e, i8 = true) {
    this.coreService.triggerDataEvent(e, i8);
  }
  resize(e, i8) {
    isNaN(e) || isNaN(i8) || (e = Math.max(e, ks), i8 = Math.max(i8, Cs), this._bufferService.resize(e, i8));
  }
  scroll(e, i8 = false) {
    this._bufferService.scroll(e, i8);
  }
  scrollLines(e, i8) {
    this._bufferService.scrollLines(e, i8);
  }
  scrollPages(e) {
    this.scrollLines(e * (this.rows - 1));
  }
  scrollToTop() {
    this.scrollLines(-this._bufferService.buffer.ydisp);
  }
  scrollToBottom(e) {
    this.scrollLines(this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
  }
  scrollToLine(e) {
    let i8 = e - this._bufferService.buffer.ydisp;
    i8 !== 0 && this.scrollLines(i8);
  }
  registerEscHandler(e, i8) {
    return this._inputHandler.registerEscHandler(e, i8);
  }
  registerDcsHandler(e, i8) {
    return this._inputHandler.registerDcsHandler(e, i8);
  }
  registerCsiHandler(e, i8) {
    return this._inputHandler.registerCsiHandler(e, i8);
  }
  registerOscHandler(e, i8) {
    return this._inputHandler.registerOscHandler(e, i8);
  }
  _setup() {
    this._handleWindowsPtyOptionChange();
  }
  reset() {
    this._inputHandler.reset(), this._bufferService.reset(), this._charsetService.reset(), this.coreService.reset(), this.coreMouseService.reset();
  }
  _handleWindowsPtyOptionChange() {
    let e = false, i8 = this.optionsService.rawOptions.windowsPty;
    i8 && i8.buildNumber !== void 0 && i8.buildNumber !== void 0 ? e = i8.backend === "conpty" && i8.buildNumber < 21376 : this.optionsService.rawOptions.windowsMode && (e = true), e ? this._enableWindowsWrappingHeuristics() : this._windowsWrappingHeuristics.clear();
  }
  _enableWindowsWrappingHeuristics() {
    if (!this._windowsWrappingHeuristics.value) {
      let e = [];
      e.push(this.onLineFeed(Bs.bind(null, this._bufferService))), e.push(this.registerCsiHandler({ final: "H" }, () => (Bs(this._bufferService), false))), this._windowsWrappingHeuristics.value = C(() => {
        for (let i8 of e) i8.dispose();
      });
    }
  }
};
var gc = { 48: ["0", ")"], 49: ["1", "!"], 50: ["2", "@"], 51: ["3", "#"], 52: ["4", "$"], 53: ["5", "%"], 54: ["6", "^"], 55: ["7", "&"], 56: ["8", "*"], 57: ["9", "("], 186: [";", ":"], 187: ["=", "+"], 188: [",", "<"], 189: ["-", "_"], 190: [".", ">"], 191: ["/", "?"], 192: ["`", "~"], 219: ["[", "{"], 220: ["\\", "|"], 221: ["]", "}"], 222: ["'", '"'] };
function Il(s15, t, e, i8) {
  let r = { type: 0, cancel: false, key: void 0 }, n = (s15.shiftKey ? 1 : 0) | (s15.altKey ? 2 : 0) | (s15.ctrlKey ? 4 : 0) | (s15.metaKey ? 8 : 0);
  switch (s15.keyCode) {
    case 0:
      s15.key === "UIKeyInputUpArrow" ? t ? r.key = b.ESC + "OA" : r.key = b.ESC + "[A" : s15.key === "UIKeyInputLeftArrow" ? t ? r.key = b.ESC + "OD" : r.key = b.ESC + "[D" : s15.key === "UIKeyInputRightArrow" ? t ? r.key = b.ESC + "OC" : r.key = b.ESC + "[C" : s15.key === "UIKeyInputDownArrow" && (t ? r.key = b.ESC + "OB" : r.key = b.ESC + "[B");
      break;
    case 8:
      r.key = s15.ctrlKey ? "\b" : b.DEL, s15.altKey && (r.key = b.ESC + r.key);
      break;
    case 9:
      if (s15.shiftKey) {
        r.key = b.ESC + "[Z";
        break;
      }
      r.key = b.HT, r.cancel = true;
      break;
    case 13:
      r.key = s15.altKey ? b.ESC + b.CR : b.CR, r.cancel = true;
      break;
    case 27:
      r.key = b.ESC, s15.altKey && (r.key = b.ESC + b.ESC), r.cancel = true;
      break;
    case 37:
      if (s15.metaKey) break;
      n ? r.key = b.ESC + "[1;" + (n + 1) + "D" : t ? r.key = b.ESC + "OD" : r.key = b.ESC + "[D";
      break;
    case 39:
      if (s15.metaKey) break;
      n ? r.key = b.ESC + "[1;" + (n + 1) + "C" : t ? r.key = b.ESC + "OC" : r.key = b.ESC + "[C";
      break;
    case 38:
      if (s15.metaKey) break;
      n ? r.key = b.ESC + "[1;" + (n + 1) + "A" : t ? r.key = b.ESC + "OA" : r.key = b.ESC + "[A";
      break;
    case 40:
      if (s15.metaKey) break;
      n ? r.key = b.ESC + "[1;" + (n + 1) + "B" : t ? r.key = b.ESC + "OB" : r.key = b.ESC + "[B";
      break;
    case 45:
      !s15.shiftKey && !s15.ctrlKey && (r.key = b.ESC + "[2~");
      break;
    case 46:
      n ? r.key = b.ESC + "[3;" + (n + 1) + "~" : r.key = b.ESC + "[3~";
      break;
    case 36:
      n ? r.key = b.ESC + "[1;" + (n + 1) + "H" : t ? r.key = b.ESC + "OH" : r.key = b.ESC + "[H";
      break;
    case 35:
      n ? r.key = b.ESC + "[1;" + (n + 1) + "F" : t ? r.key = b.ESC + "OF" : r.key = b.ESC + "[F";
      break;
    case 33:
      s15.shiftKey ? r.type = 2 : s15.ctrlKey ? r.key = b.ESC + "[5;" + (n + 1) + "~" : r.key = b.ESC + "[5~";
      break;
    case 34:
      s15.shiftKey ? r.type = 3 : s15.ctrlKey ? r.key = b.ESC + "[6;" + (n + 1) + "~" : r.key = b.ESC + "[6~";
      break;
    case 112:
      n ? r.key = b.ESC + "[1;" + (n + 1) + "P" : r.key = b.ESC + "OP";
      break;
    case 113:
      n ? r.key = b.ESC + "[1;" + (n + 1) + "Q" : r.key = b.ESC + "OQ";
      break;
    case 114:
      n ? r.key = b.ESC + "[1;" + (n + 1) + "R" : r.key = b.ESC + "OR";
      break;
    case 115:
      n ? r.key = b.ESC + "[1;" + (n + 1) + "S" : r.key = b.ESC + "OS";
      break;
    case 116:
      n ? r.key = b.ESC + "[15;" + (n + 1) + "~" : r.key = b.ESC + "[15~";
      break;
    case 117:
      n ? r.key = b.ESC + "[17;" + (n + 1) + "~" : r.key = b.ESC + "[17~";
      break;
    case 118:
      n ? r.key = b.ESC + "[18;" + (n + 1) + "~" : r.key = b.ESC + "[18~";
      break;
    case 119:
      n ? r.key = b.ESC + "[19;" + (n + 1) + "~" : r.key = b.ESC + "[19~";
      break;
    case 120:
      n ? r.key = b.ESC + "[20;" + (n + 1) + "~" : r.key = b.ESC + "[20~";
      break;
    case 121:
      n ? r.key = b.ESC + "[21;" + (n + 1) + "~" : r.key = b.ESC + "[21~";
      break;
    case 122:
      n ? r.key = b.ESC + "[23;" + (n + 1) + "~" : r.key = b.ESC + "[23~";
      break;
    case 123:
      n ? r.key = b.ESC + "[24;" + (n + 1) + "~" : r.key = b.ESC + "[24~";
      break;
    default:
      if (s15.ctrlKey && !s15.shiftKey && !s15.altKey && !s15.metaKey) s15.keyCode >= 65 && s15.keyCode <= 90 ? r.key = String.fromCharCode(s15.keyCode - 64) : s15.keyCode === 32 ? r.key = b.NUL : s15.keyCode >= 51 && s15.keyCode <= 55 ? r.key = String.fromCharCode(s15.keyCode - 51 + 27) : s15.keyCode === 56 ? r.key = b.DEL : s15.keyCode === 219 ? r.key = b.ESC : s15.keyCode === 220 ? r.key = b.FS : s15.keyCode === 221 && (r.key = b.GS);
      else if ((!e || i8) && s15.altKey && !s15.metaKey) {
        let l = gc[s15.keyCode]?.[s15.shiftKey ? 1 : 0];
        if (l) r.key = b.ESC + l;
        else if (s15.keyCode >= 65 && s15.keyCode <= 90) {
          let a = s15.ctrlKey ? s15.keyCode - 64 : s15.keyCode + 32, u = String.fromCharCode(a);
          s15.shiftKey && (u = u.toUpperCase()), r.key = b.ESC + u;
        } else if (s15.keyCode === 32) r.key = b.ESC + (s15.ctrlKey ? b.NUL : " ");
        else if (s15.key === "Dead" && s15.code.startsWith("Key")) {
          let a = s15.code.slice(3, 4);
          s15.shiftKey || (a = a.toLowerCase()), r.key = b.ESC + a, r.cancel = true;
        }
      } else e && !s15.altKey && !s15.ctrlKey && !s15.shiftKey && s15.metaKey ? s15.keyCode === 65 && (r.type = 1) : s15.key && !s15.ctrlKey && !s15.altKey && !s15.metaKey && s15.keyCode >= 48 && s15.key.length === 1 ? r.key = s15.key : s15.key && s15.ctrlKey && (s15.key === "_" && (r.key = b.US), s15.key === "@" && (r.key = b.NUL));
      break;
  }
  return r;
}
var ee = 0;
var En = class {
  constructor(t) {
    this._getKey = t;
    this._array = [];
    this._insertedValues = [];
    this._flushInsertedTask = new Jt();
    this._isFlushingInserted = false;
    this._deletedIndices = [];
    this._flushDeletedTask = new Jt();
    this._isFlushingDeleted = false;
  }
  clear() {
    this._array.length = 0, this._insertedValues.length = 0, this._flushInsertedTask.clear(), this._isFlushingInserted = false, this._deletedIndices.length = 0, this._flushDeletedTask.clear(), this._isFlushingDeleted = false;
  }
  insert(t) {
    this._flushCleanupDeleted(), this._insertedValues.length === 0 && this._flushInsertedTask.enqueue(() => this._flushInserted()), this._insertedValues.push(t);
  }
  _flushInserted() {
    let t = this._insertedValues.sort((n, o2) => this._getKey(n) - this._getKey(o2)), e = 0, i8 = 0, r = new Array(this._array.length + this._insertedValues.length);
    for (let n = 0; n < r.length; n++) i8 >= this._array.length || this._getKey(t[e]) <= this._getKey(this._array[i8]) ? (r[n] = t[e], e++) : r[n] = this._array[i8++];
    this._array = r, this._insertedValues.length = 0;
  }
  _flushCleanupInserted() {
    !this._isFlushingInserted && this._insertedValues.length > 0 && this._flushInsertedTask.flush();
  }
  delete(t) {
    if (this._flushCleanupInserted(), this._array.length === 0) return false;
    let e = this._getKey(t);
    if (e === void 0 || (ee = this._search(e), ee === -1) || this._getKey(this._array[ee]) !== e) return false;
    do
      if (this._array[ee] === t) return this._deletedIndices.length === 0 && this._flushDeletedTask.enqueue(() => this._flushDeleted()), this._deletedIndices.push(ee), true;
    while (++ee < this._array.length && this._getKey(this._array[ee]) === e);
    return false;
  }
  _flushDeleted() {
    this._isFlushingDeleted = true;
    let t = this._deletedIndices.sort((n, o2) => n - o2), e = 0, i8 = new Array(this._array.length - t.length), r = 0;
    for (let n = 0; n < this._array.length; n++) t[e] === n ? e++ : i8[r++] = this._array[n];
    this._array = i8, this._deletedIndices.length = 0, this._isFlushingDeleted = false;
  }
  _flushCleanupDeleted() {
    !this._isFlushingDeleted && this._deletedIndices.length > 0 && this._flushDeletedTask.flush();
  }
  *getKeyIterator(t) {
    if (this._flushCleanupInserted(), this._flushCleanupDeleted(), this._array.length !== 0 && (ee = this._search(t), !(ee < 0 || ee >= this._array.length) && this._getKey(this._array[ee]) === t)) do
      yield this._array[ee];
    while (++ee < this._array.length && this._getKey(this._array[ee]) === t);
  }
  forEachByKey(t, e) {
    if (this._flushCleanupInserted(), this._flushCleanupDeleted(), this._array.length !== 0 && (ee = this._search(t), !(ee < 0 || ee >= this._array.length) && this._getKey(this._array[ee]) === t)) do
      e(this._array[ee]);
    while (++ee < this._array.length && this._getKey(this._array[ee]) === t);
  }
  values() {
    return this._flushCleanupInserted(), this._flushCleanupDeleted(), [...this._array].values();
  }
  _search(t) {
    let e = 0, i8 = this._array.length - 1;
    for (; i8 >= e; ) {
      let r = e + i8 >> 1, n = this._getKey(this._array[r]);
      if (n > t) i8 = r - 1;
      else if (n < t) e = r + 1;
      else {
        for (; r > 0 && this._getKey(this._array[r - 1]) === t; ) r--;
        return r;
      }
    }
    return e;
  }
};
var Us = 0;
var yl = 0;
var Tn = class extends D2 {
  constructor() {
    super();
    this._decorations = new En((e) => e?.marker.line);
    this._onDecorationRegistered = this._register(new v());
    this.onDecorationRegistered = this._onDecorationRegistered.event;
    this._onDecorationRemoved = this._register(new v());
    this.onDecorationRemoved = this._onDecorationRemoved.event;
    this._register(C(() => this.reset()));
  }
  get decorations() {
    return this._decorations.values();
  }
  registerDecoration(e) {
    if (e.marker.isDisposed) return;
    let i8 = new Ks(e);
    if (i8) {
      let r = i8.marker.onDispose(() => i8.dispose()), n = i8.onDispose(() => {
        n.dispose(), i8 && (this._decorations.delete(i8) && this._onDecorationRemoved.fire(i8), r.dispose());
      });
      this._decorations.insert(i8), this._onDecorationRegistered.fire(i8);
    }
    return i8;
  }
  reset() {
    for (let e of this._decorations.values()) e.dispose();
    this._decorations.clear();
  }
  *getDecorationsAtCell(e, i8, r) {
    let n = 0, o2 = 0;
    for (let l of this._decorations.getKeyIterator(i8)) n = l.options.x ?? 0, o2 = n + (l.options.width ?? 1), e >= n && e < o2 && (!r || (l.options.layer ?? "bottom") === r) && (yield l);
  }
  forEachDecorationAtCell(e, i8, r, n) {
    this._decorations.forEachByKey(i8, (o2) => {
      Us = o2.options.x ?? 0, yl = Us + (o2.options.width ?? 1), e >= Us && e < yl && (!r || (o2.options.layer ?? "bottom") === r) && n(o2);
    });
  }
};
var Ks = class extends Ee {
  constructor(e) {
    super();
    this.options = e;
    this.onRenderEmitter = this.add(new v());
    this.onRender = this.onRenderEmitter.event;
    this._onDispose = this.add(new v());
    this.onDispose = this._onDispose.event;
    this._cachedBg = null;
    this._cachedFg = null;
    this.marker = e.marker, this.options.overviewRulerOptions && !this.options.overviewRulerOptions.position && (this.options.overviewRulerOptions.position = "full");
  }
  get backgroundColorRGB() {
    return this._cachedBg === null && (this.options.backgroundColor ? this._cachedBg = z.toColor(this.options.backgroundColor) : this._cachedBg = void 0), this._cachedBg;
  }
  get foregroundColorRGB() {
    return this._cachedFg === null && (this.options.foregroundColor ? this._cachedFg = z.toColor(this.options.foregroundColor) : this._cachedFg = void 0), this._cachedFg;
  }
  dispose() {
    this._onDispose.fire(), super.dispose();
  }
};
var Sc = 1e3;
var In = class {
  constructor(t, e = Sc) {
    this._renderCallback = t;
    this._debounceThresholdMS = e;
    this._lastRefreshMs = 0;
    this._additionalRefreshRequested = false;
  }
  dispose() {
    this._refreshTimeoutID && clearTimeout(this._refreshTimeoutID);
  }
  refresh(t, e, i8) {
    this._rowCount = i8, t = t !== void 0 ? t : 0, e = e !== void 0 ? e : this._rowCount - 1, this._rowStart = this._rowStart !== void 0 ? Math.min(this._rowStart, t) : t, this._rowEnd = this._rowEnd !== void 0 ? Math.max(this._rowEnd, e) : e;
    let r = performance.now();
    if (r - this._lastRefreshMs >= this._debounceThresholdMS) this._lastRefreshMs = r, this._innerRefresh();
    else if (!this._additionalRefreshRequested) {
      let n = r - this._lastRefreshMs, o2 = this._debounceThresholdMS - n;
      this._additionalRefreshRequested = true, this._refreshTimeoutID = window.setTimeout(() => {
        this._lastRefreshMs = performance.now(), this._innerRefresh(), this._additionalRefreshRequested = false, this._refreshTimeoutID = void 0;
      }, o2);
    }
  }
  _innerRefresh() {
    if (this._rowStart === void 0 || this._rowEnd === void 0 || this._rowCount === void 0) return;
    let t = Math.max(this._rowStart, 0), e = Math.min(this._rowEnd, this._rowCount - 1);
    this._rowStart = void 0, this._rowEnd = void 0, this._renderCallback(t, e);
  }
};
var xl = 20;
var wl = false;
var Tt = class extends D2 {
  constructor(e, i8, r, n) {
    super();
    this._terminal = e;
    this._coreBrowserService = r;
    this._renderService = n;
    this._rowColumns = /* @__PURE__ */ new WeakMap();
    this._liveRegionLineCount = 0;
    this._charsToConsume = [];
    this._charsToAnnounce = "";
    let o2 = this._coreBrowserService.mainDocument;
    this._accessibilityContainer = o2.createElement("div"), this._accessibilityContainer.classList.add("xterm-accessibility"), this._rowContainer = o2.createElement("div"), this._rowContainer.setAttribute("role", "list"), this._rowContainer.classList.add("xterm-accessibility-tree"), this._rowElements = [];
    for (let l = 0; l < this._terminal.rows; l++) this._rowElements[l] = this._createAccessibilityTreeNode(), this._rowContainer.appendChild(this._rowElements[l]);
    if (this._topBoundaryFocusListener = (l) => this._handleBoundaryFocus(l, 0), this._bottomBoundaryFocusListener = (l) => this._handleBoundaryFocus(l, 1), this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener), this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._accessibilityContainer.appendChild(this._rowContainer), this._liveRegion = o2.createElement("div"), this._liveRegion.classList.add("live-region"), this._liveRegion.setAttribute("aria-live", "assertive"), this._accessibilityContainer.appendChild(this._liveRegion), this._liveRegionDebouncer = this._register(new In(this._renderRows.bind(this))), !this._terminal.element) throw new Error("Cannot enable accessibility before Terminal.open");
    wl ? (this._accessibilityContainer.classList.add("debug"), this._rowContainer.classList.add("debug"), this._debugRootContainer = o2.createElement("div"), this._debugRootContainer.classList.add("xterm"), this._debugRootContainer.appendChild(o2.createTextNode("------start a11y------")), this._debugRootContainer.appendChild(this._accessibilityContainer), this._debugRootContainer.appendChild(o2.createTextNode("------end a11y------")), this._terminal.element.insertAdjacentElement("afterend", this._debugRootContainer)) : this._terminal.element.insertAdjacentElement("afterbegin", this._accessibilityContainer), this._register(this._terminal.onResize((l) => this._handleResize(l.rows))), this._register(this._terminal.onRender((l) => this._refreshRows(l.start, l.end))), this._register(this._terminal.onScroll(() => this._refreshRows())), this._register(this._terminal.onA11yChar((l) => this._handleChar(l))), this._register(this._terminal.onLineFeed(() => this._handleChar(`
`))), this._register(this._terminal.onA11yTab((l) => this._handleTab(l))), this._register(this._terminal.onKey((l) => this._handleKey(l.key))), this._register(this._terminal.onBlur(() => this._clearLiveRegion())), this._register(this._renderService.onDimensionsChange(() => this._refreshRowsDimensions())), this._register(L(o2, "selectionchange", () => this._handleSelectionChange())), this._register(this._coreBrowserService.onDprChange(() => this._refreshRowsDimensions())), this._refreshRowsDimensions(), this._refreshRows(), this._register(C(() => {
      wl ? this._debugRootContainer.remove() : this._accessibilityContainer.remove(), this._rowElements.length = 0;
    }));
  }
  _handleTab(e) {
    for (let i8 = 0; i8 < e; i8++) this._handleChar(" ");
  }
  _handleChar(e) {
    this._liveRegionLineCount < xl + 1 && (this._charsToConsume.length > 0 ? this._charsToConsume.shift() !== e && (this._charsToAnnounce += e) : this._charsToAnnounce += e, e === `
` && (this._liveRegionLineCount++, this._liveRegionLineCount === xl + 1 && (this._liveRegion.textContent += _i.get())));
  }
  _clearLiveRegion() {
    this._liveRegion.textContent = "", this._liveRegionLineCount = 0;
  }
  _handleKey(e) {
    this._clearLiveRegion(), /\p{Control}/u.test(e) || this._charsToConsume.push(e);
  }
  _refreshRows(e, i8) {
    this._liveRegionDebouncer.refresh(e, i8, this._terminal.rows);
  }
  _renderRows(e, i8) {
    let r = this._terminal.buffer, n = r.lines.length.toString();
    for (let o2 = e; o2 <= i8; o2++) {
      let l = r.lines.get(r.ydisp + o2), a = [], u = l?.translateToString(true, void 0, void 0, a) || "", h2 = (r.ydisp + o2 + 1).toString(), c = this._rowElements[o2];
      c && (u.length === 0 ? (c.textContent = "\xA0", this._rowColumns.set(c, [0, 1])) : (c.textContent = u, this._rowColumns.set(c, a)), c.setAttribute("aria-posinset", h2), c.setAttribute("aria-setsize", n), this._alignRowWidth(c));
    }
    this._announceCharacters();
  }
  _announceCharacters() {
    this._charsToAnnounce.length !== 0 && (this._liveRegion.textContent += this._charsToAnnounce, this._charsToAnnounce = "");
  }
  _handleBoundaryFocus(e, i8) {
    let r = e.target, n = this._rowElements[i8 === 0 ? 1 : this._rowElements.length - 2], o2 = r.getAttribute("aria-posinset"), l = i8 === 0 ? "1" : `${this._terminal.buffer.lines.length}`;
    if (o2 === l || e.relatedTarget !== n) return;
    let a, u;
    if (i8 === 0 ? (a = r, u = this._rowElements.pop(), this._rowContainer.removeChild(u)) : (a = this._rowElements.shift(), u = r, this._rowContainer.removeChild(a)), a.removeEventListener("focus", this._topBoundaryFocusListener), u.removeEventListener("focus", this._bottomBoundaryFocusListener), i8 === 0) {
      let h2 = this._createAccessibilityTreeNode();
      this._rowElements.unshift(h2), this._rowContainer.insertAdjacentElement("afterbegin", h2);
    } else {
      let h2 = this._createAccessibilityTreeNode();
      this._rowElements.push(h2), this._rowContainer.appendChild(h2);
    }
    this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener), this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._terminal.scrollLines(i8 === 0 ? -1 : 1), this._rowElements[i8 === 0 ? 1 : this._rowElements.length - 2].focus(), e.preventDefault(), e.stopImmediatePropagation();
  }
  _handleSelectionChange() {
    if (this._rowElements.length === 0) return;
    let e = this._coreBrowserService.mainDocument.getSelection();
    if (!e) return;
    if (e.isCollapsed) {
      this._rowContainer.contains(e.anchorNode) && this._terminal.clearSelection();
      return;
    }
    if (!e.anchorNode || !e.focusNode) {
      console.error("anchorNode and/or focusNode are null");
      return;
    }
    let i8 = { node: e.anchorNode, offset: e.anchorOffset }, r = { node: e.focusNode, offset: e.focusOffset };
    if ((i8.node.compareDocumentPosition(r.node) & Node.DOCUMENT_POSITION_PRECEDING || i8.node === r.node && i8.offset > r.offset) && ([i8, r] = [r, i8]), i8.node.compareDocumentPosition(this._rowElements[0]) & (Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING) && (i8 = { node: this._rowElements[0].childNodes[0], offset: 0 }), !this._rowContainer.contains(i8.node)) return;
    let n = this._rowElements.slice(-1)[0];
    if (r.node.compareDocumentPosition(n) & (Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_PRECEDING) && (r = { node: n, offset: n.textContent?.length ?? 0 }), !this._rowContainer.contains(r.node)) return;
    let o2 = ({ node: u, offset: h2 }) => {
      let c = u instanceof Text ? u.parentNode : u, d = parseInt(c?.getAttribute("aria-posinset"), 10) - 1;
      if (isNaN(d)) return console.warn("row is invalid. Race condition?"), null;
      let _2 = this._rowColumns.get(c);
      if (!_2) return console.warn("columns is null. Race condition?"), null;
      let p = h2 < _2.length ? _2[h2] : _2.slice(-1)[0] + 1;
      return p >= this._terminal.cols && (++d, p = 0), { row: d, column: p };
    }, l = o2(i8), a = o2(r);
    if (!(!l || !a)) {
      if (l.row > a.row || l.row === a.row && l.column >= a.column) throw new Error("invalid range");
      this._terminal.select(l.column, l.row, (a.row - l.row) * this._terminal.cols - l.column + a.column);
    }
  }
  _handleResize(e) {
    this._rowElements[this._rowElements.length - 1].removeEventListener("focus", this._bottomBoundaryFocusListener);
    for (let i8 = this._rowContainer.children.length; i8 < this._terminal.rows; i8++) this._rowElements[i8] = this._createAccessibilityTreeNode(), this._rowContainer.appendChild(this._rowElements[i8]);
    for (; this._rowElements.length > e; ) this._rowContainer.removeChild(this._rowElements.pop());
    this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._refreshRowsDimensions();
  }
  _createAccessibilityTreeNode() {
    let e = this._coreBrowserService.mainDocument.createElement("div");
    return e.setAttribute("role", "listitem"), e.tabIndex = -1, this._refreshRowDimensions(e), e;
  }
  _refreshRowsDimensions() {
    if (this._renderService.dimensions.css.cell.height) {
      Object.assign(this._accessibilityContainer.style, { width: `${this._renderService.dimensions.css.canvas.width}px`, fontSize: `${this._terminal.options.fontSize}px` }), this._rowElements.length !== this._terminal.rows && this._handleResize(this._terminal.rows);
      for (let e = 0; e < this._terminal.rows; e++) this._refreshRowDimensions(this._rowElements[e]), this._alignRowWidth(this._rowElements[e]);
    }
  }
  _refreshRowDimensions(e) {
    e.style.height = `${this._renderService.dimensions.css.cell.height}px`;
  }
  _alignRowWidth(e) {
    e.style.transform = "";
    let i8 = e.getBoundingClientRect().width, r = this._rowColumns.get(e)?.slice(-1)?.[0];
    if (!r) return;
    let n = r * this._renderService.dimensions.css.cell.width;
    e.style.transform = `scaleX(${n / i8})`;
  }
};
Tt = M([S(1, xt), S(2, ae), S(3, ce)], Tt);
var hi = class extends D2 {
  constructor(e, i8, r, n, o2) {
    super();
    this._element = e;
    this._mouseService = i8;
    this._renderService = r;
    this._bufferService = n;
    this._linkProviderService = o2;
    this._linkCacheDisposables = [];
    this._isMouseOut = true;
    this._wasResized = false;
    this._activeLine = -1;
    this._onShowLinkUnderline = this._register(new v());
    this.onShowLinkUnderline = this._onShowLinkUnderline.event;
    this._onHideLinkUnderline = this._register(new v());
    this.onHideLinkUnderline = this._onHideLinkUnderline.event;
    this._register(C(() => {
      Ne(this._linkCacheDisposables), this._linkCacheDisposables.length = 0, this._lastMouseEvent = void 0, this._activeProviderReplies?.clear();
    })), this._register(this._bufferService.onResize(() => {
      this._clearCurrentLink(), this._wasResized = true;
    })), this._register(L(this._element, "mouseleave", () => {
      this._isMouseOut = true, this._clearCurrentLink();
    })), this._register(L(this._element, "mousemove", this._handleMouseMove.bind(this))), this._register(L(this._element, "mousedown", this._handleMouseDown.bind(this))), this._register(L(this._element, "mouseup", this._handleMouseUp.bind(this)));
  }
  get currentLink() {
    return this._currentLink;
  }
  _handleMouseMove(e) {
    this._lastMouseEvent = e;
    let i8 = this._positionFromMouseEvent(e, this._element, this._mouseService);
    if (!i8) return;
    this._isMouseOut = false;
    let r = e.composedPath();
    for (let n = 0; n < r.length; n++) {
      let o2 = r[n];
      if (o2.classList.contains("xterm")) break;
      if (o2.classList.contains("xterm-hover")) return;
    }
    (!this._lastBufferCell || i8.x !== this._lastBufferCell.x || i8.y !== this._lastBufferCell.y) && (this._handleHover(i8), this._lastBufferCell = i8);
  }
  _handleHover(e) {
    if (this._activeLine !== e.y || this._wasResized) {
      this._clearCurrentLink(), this._askForLink(e, false), this._wasResized = false;
      return;
    }
    this._currentLink && this._linkAtPosition(this._currentLink.link, e) || (this._clearCurrentLink(), this._askForLink(e, true));
  }
  _askForLink(e, i8) {
    (!this._activeProviderReplies || !i8) && (this._activeProviderReplies?.forEach((n) => {
      n?.forEach((o2) => {
        o2.link.dispose && o2.link.dispose();
      });
    }), this._activeProviderReplies = /* @__PURE__ */ new Map(), this._activeLine = e.y);
    let r = false;
    for (let [n, o2] of this._linkProviderService.linkProviders.entries()) i8 ? this._activeProviderReplies?.get(n) && (r = this._checkLinkProviderResult(n, e, r)) : o2.provideLinks(e.y, (l) => {
      if (this._isMouseOut) return;
      let a = l?.map((u) => ({ link: u }));
      this._activeProviderReplies?.set(n, a), r = this._checkLinkProviderResult(n, e, r), this._activeProviderReplies?.size === this._linkProviderService.linkProviders.length && this._removeIntersectingLinks(e.y, this._activeProviderReplies);
    });
  }
  _removeIntersectingLinks(e, i8) {
    let r = /* @__PURE__ */ new Set();
    for (let n = 0; n < i8.size; n++) {
      let o2 = i8.get(n);
      if (o2) for (let l = 0; l < o2.length; l++) {
        let a = o2[l], u = a.link.range.start.y < e ? 0 : a.link.range.start.x, h2 = a.link.range.end.y > e ? this._bufferService.cols : a.link.range.end.x;
        for (let c = u; c <= h2; c++) {
          if (r.has(c)) {
            o2.splice(l--, 1);
            break;
          }
          r.add(c);
        }
      }
    }
  }
  _checkLinkProviderResult(e, i8, r) {
    if (!this._activeProviderReplies) return r;
    let n = this._activeProviderReplies.get(e), o2 = false;
    for (let l = 0; l < e; l++) (!this._activeProviderReplies.has(l) || this._activeProviderReplies.get(l)) && (o2 = true);
    if (!o2 && n) {
      let l = n.find((a) => this._linkAtPosition(a.link, i8));
      l && (r = true, this._handleNewLink(l));
    }
    if (this._activeProviderReplies.size === this._linkProviderService.linkProviders.length && !r) for (let l = 0; l < this._activeProviderReplies.size; l++) {
      let a = this._activeProviderReplies.get(l)?.find((u) => this._linkAtPosition(u.link, i8));
      if (a) {
        r = true, this._handleNewLink(a);
        break;
      }
    }
    return r;
  }
  _handleMouseDown() {
    this._mouseDownLink = this._currentLink;
  }
  _handleMouseUp(e) {
    if (!this._currentLink) return;
    let i8 = this._positionFromMouseEvent(e, this._element, this._mouseService);
    i8 && this._mouseDownLink && Ec(this._mouseDownLink.link, this._currentLink.link) && this._linkAtPosition(this._currentLink.link, i8) && this._currentLink.link.activate(e, this._currentLink.link.text);
  }
  _clearCurrentLink(e, i8) {
    !this._currentLink || !this._lastMouseEvent || (!e || !i8 || this._currentLink.link.range.start.y >= e && this._currentLink.link.range.end.y <= i8) && (this._linkLeave(this._element, this._currentLink.link, this._lastMouseEvent), this._currentLink = void 0, Ne(this._linkCacheDisposables), this._linkCacheDisposables.length = 0);
  }
  _handleNewLink(e) {
    if (!this._lastMouseEvent) return;
    let i8 = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
    i8 && this._linkAtPosition(e.link, i8) && (this._currentLink = e, this._currentLink.state = { decorations: { underline: e.link.decorations === void 0 ? true : e.link.decorations.underline, pointerCursor: e.link.decorations === void 0 ? true : e.link.decorations.pointerCursor }, isHovered: true }, this._linkHover(this._element, e.link, this._lastMouseEvent), e.link.decorations = {}, Object.defineProperties(e.link.decorations, { pointerCursor: { get: () => this._currentLink?.state?.decorations.pointerCursor, set: (r) => {
      this._currentLink?.state && this._currentLink.state.decorations.pointerCursor !== r && (this._currentLink.state.decorations.pointerCursor = r, this._currentLink.state.isHovered && this._element.classList.toggle("xterm-cursor-pointer", r));
    } }, underline: { get: () => this._currentLink?.state?.decorations.underline, set: (r) => {
      this._currentLink?.state && this._currentLink?.state?.decorations.underline !== r && (this._currentLink.state.decorations.underline = r, this._currentLink.state.isHovered && this._fireUnderlineEvent(e.link, r));
    } } }), this._linkCacheDisposables.push(this._renderService.onRenderedViewportChange((r) => {
      if (!this._currentLink) return;
      let n = r.start === 0 ? 0 : r.start + 1 + this._bufferService.buffer.ydisp, o2 = this._bufferService.buffer.ydisp + 1 + r.end;
      if (this._currentLink.link.range.start.y >= n && this._currentLink.link.range.end.y <= o2 && (this._clearCurrentLink(n, o2), this._lastMouseEvent)) {
        let l = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
        l && this._askForLink(l, false);
      }
    })));
  }
  _linkHover(e, i8, r) {
    this._currentLink?.state && (this._currentLink.state.isHovered = true, this._currentLink.state.decorations.underline && this._fireUnderlineEvent(i8, true), this._currentLink.state.decorations.pointerCursor && e.classList.add("xterm-cursor-pointer")), i8.hover && i8.hover(r, i8.text);
  }
  _fireUnderlineEvent(e, i8) {
    let r = e.range, n = this._bufferService.buffer.ydisp, o2 = this._createLinkUnderlineEvent(r.start.x - 1, r.start.y - n - 1, r.end.x, r.end.y - n - 1, void 0);
    (i8 ? this._onShowLinkUnderline : this._onHideLinkUnderline).fire(o2);
  }
  _linkLeave(e, i8, r) {
    this._currentLink?.state && (this._currentLink.state.isHovered = false, this._currentLink.state.decorations.underline && this._fireUnderlineEvent(i8, false), this._currentLink.state.decorations.pointerCursor && e.classList.remove("xterm-cursor-pointer")), i8.leave && i8.leave(r, i8.text);
  }
  _linkAtPosition(e, i8) {
    let r = e.range.start.y * this._bufferService.cols + e.range.start.x, n = e.range.end.y * this._bufferService.cols + e.range.end.x, o2 = i8.y * this._bufferService.cols + i8.x;
    return r <= o2 && o2 <= n;
  }
  _positionFromMouseEvent(e, i8, r) {
    let n = r.getCoords(e, i8, this._bufferService.cols, this._bufferService.rows);
    if (n) return { x: n[0], y: n[1] + this._bufferService.buffer.ydisp };
  }
  _createLinkUnderlineEvent(e, i8, r, n, o2) {
    return { x1: e, y1: i8, x2: r, y2: n, cols: this._bufferService.cols, fg: o2 };
  }
};
hi = M([S(1, Dt), S(2, ce), S(3, F), S(4, lr)], hi);
function Ec(s15, t) {
  return s15.text === t.text && s15.range.start.x === t.range.start.x && s15.range.start.y === t.range.start.y && s15.range.end.x === t.range.end.x && s15.range.end.y === t.range.end.y;
}
var yn = class extends Sn {
  constructor(e = {}) {
    super(e);
    this._linkifier = this._register(new ye());
    this.browser = tn;
    this._keyDownHandled = false;
    this._keyDownSeen = false;
    this._keyPressHandled = false;
    this._unprocessedDeadKey = false;
    this._accessibilityManager = this._register(new ye());
    this._onCursorMove = this._register(new v());
    this.onCursorMove = this._onCursorMove.event;
    this._onKey = this._register(new v());
    this.onKey = this._onKey.event;
    this._onRender = this._register(new v());
    this.onRender = this._onRender.event;
    this._onSelectionChange = this._register(new v());
    this.onSelectionChange = this._onSelectionChange.event;
    this._onTitleChange = this._register(new v());
    this.onTitleChange = this._onTitleChange.event;
    this._onBell = this._register(new v());
    this.onBell = this._onBell.event;
    this._onFocus = this._register(new v());
    this._onBlur = this._register(new v());
    this._onA11yCharEmitter = this._register(new v());
    this._onA11yTabEmitter = this._register(new v());
    this._onWillOpen = this._register(new v());
    this._setup(), this._decorationService = this._instantiationService.createInstance(Tn), this._instantiationService.setService(Be, this._decorationService), this._linkProviderService = this._instantiationService.createInstance(Qr), this._instantiationService.setService(lr, this._linkProviderService), this._linkProviderService.registerLinkProvider(this._instantiationService.createInstance(wt)), this._register(this._inputHandler.onRequestBell(() => this._onBell.fire())), this._register(this._inputHandler.onRequestRefreshRows((i8) => this.refresh(i8?.start ?? 0, i8?.end ?? this.rows - 1))), this._register(this._inputHandler.onRequestSendFocus(() => this._reportFocus())), this._register(this._inputHandler.onRequestReset(() => this.reset())), this._register(this._inputHandler.onRequestWindowsOptionsReport((i8) => this._reportWindowsOptions(i8))), this._register(this._inputHandler.onColor((i8) => this._handleColorEvent(i8))), this._register($.forward(this._inputHandler.onCursorMove, this._onCursorMove)), this._register($.forward(this._inputHandler.onTitleChange, this._onTitleChange)), this._register($.forward(this._inputHandler.onA11yChar, this._onA11yCharEmitter)), this._register($.forward(this._inputHandler.onA11yTab, this._onA11yTabEmitter)), this._register(this._bufferService.onResize((i8) => this._afterResize(i8.cols, i8.rows))), this._register(C(() => {
      this._customKeyEventHandler = void 0, this.element?.parentNode?.removeChild(this.element);
    }));
  }
  get linkifier() {
    return this._linkifier.value;
  }
  get onFocus() {
    return this._onFocus.event;
  }
  get onBlur() {
    return this._onBlur.event;
  }
  get onA11yChar() {
    return this._onA11yCharEmitter.event;
  }
  get onA11yTab() {
    return this._onA11yTabEmitter.event;
  }
  get onWillOpen() {
    return this._onWillOpen.event;
  }
  _handleColorEvent(e) {
    if (this._themeService) for (let i8 of e) {
      let r, n = "";
      switch (i8.index) {
        case 256:
          r = "foreground", n = "10";
          break;
        case 257:
          r = "background", n = "11";
          break;
        case 258:
          r = "cursor", n = "12";
          break;
        default:
          r = "ansi", n = "4;" + i8.index;
      }
      switch (i8.type) {
        case 0:
          let o2 = U.toColorRGB(r === "ansi" ? this._themeService.colors.ansi[i8.index] : this._themeService.colors[r]);
          this.coreService.triggerDataEvent(`${b.ESC}]${n};${ml(o2)}${fs.ST}`);
          break;
        case 1:
          if (r === "ansi") this._themeService.modifyColors((l) => l.ansi[i8.index] = j.toColor(...i8.color));
          else {
            let l = r;
            this._themeService.modifyColors((a) => a[l] = j.toColor(...i8.color));
          }
          break;
        case 2:
          this._themeService.restoreColor(i8.index);
          break;
      }
    }
  }
  _setup() {
    super._setup(), this._customKeyEventHandler = void 0;
  }
  get buffer() {
    return this.buffers.active;
  }
  focus() {
    this.textarea && this.textarea.focus({ preventScroll: true });
  }
  _handleScreenReaderModeOptionChange(e) {
    e ? !this._accessibilityManager.value && this._renderService && (this._accessibilityManager.value = this._instantiationService.createInstance(Tt, this)) : this._accessibilityManager.clear();
  }
  _handleTextAreaFocus(e) {
    this.coreService.decPrivateModes.sendFocus && this.coreService.triggerDataEvent(b.ESC + "[I"), this.element.classList.add("focus"), this._showCursor(), this._onFocus.fire();
  }
  blur() {
    return this.textarea?.blur();
  }
  _handleTextAreaBlur() {
    this.textarea.value = "", this.refresh(this.buffer.y, this.buffer.y), this.coreService.decPrivateModes.sendFocus && this.coreService.triggerDataEvent(b.ESC + "[O"), this.element.classList.remove("focus"), this._onBlur.fire();
  }
  _syncTextArea() {
    if (!this.textarea || !this.buffer.isCursorInViewport || this._compositionHelper.isComposing || !this._renderService) return;
    let e = this.buffer.ybase + this.buffer.y, i8 = this.buffer.lines.get(e);
    if (!i8) return;
    let r = Math.min(this.buffer.x, this.cols - 1), n = this._renderService.dimensions.css.cell.height, o2 = i8.getWidth(r), l = this._renderService.dimensions.css.cell.width * o2, a = this.buffer.y * this._renderService.dimensions.css.cell.height, u = r * this._renderService.dimensions.css.cell.width;
    this.textarea.style.left = u + "px", this.textarea.style.top = a + "px", this.textarea.style.width = l + "px", this.textarea.style.height = n + "px", this.textarea.style.lineHeight = n + "px", this.textarea.style.zIndex = "-5";
  }
  _initGlobal() {
    this._bindKeys(), this._register(L(this.element, "copy", (i8) => {
      this.hasSelection() && Vs(i8, this._selectionService);
    }));
    let e = (i8) => qs(i8, this.textarea, this.coreService, this.optionsService);
    this._register(L(this.textarea, "paste", e)), this._register(L(this.element, "paste", e)), Ss ? this._register(L(this.element, "mousedown", (i8) => {
      i8.button === 2 && Pn(i8, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
    })) : this._register(L(this.element, "contextmenu", (i8) => {
      Pn(i8, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
    })), Bi && this._register(L(this.element, "auxclick", (i8) => {
      i8.button === 1 && Mn(i8, this.textarea, this.screenElement);
    }));
  }
  _bindKeys() {
    this._register(L(this.textarea, "keyup", (e) => this._keyUp(e), true)), this._register(L(this.textarea, "keydown", (e) => this._keyDown(e), true)), this._register(L(this.textarea, "keypress", (e) => this._keyPress(e), true)), this._register(L(this.textarea, "compositionstart", () => this._compositionHelper.compositionstart())), this._register(L(this.textarea, "compositionupdate", (e) => this._compositionHelper.compositionupdate(e))), this._register(L(this.textarea, "compositionend", () => this._compositionHelper.compositionend())), this._register(L(this.textarea, "input", (e) => this._inputEvent(e), true)), this._register(this.onRender(() => this._compositionHelper.updateCompositionElements()));
  }
  open(e) {
    if (!e) throw new Error("Terminal requires a parent element.");
    if (e.isConnected || this._logService.debug("Terminal.open was called on an element that was not attached to the DOM"), this.element?.ownerDocument.defaultView && this._coreBrowserService) {
      this.element.ownerDocument.defaultView !== this._coreBrowserService.window && (this._coreBrowserService.window = this.element.ownerDocument.defaultView);
      return;
    }
    this._document = e.ownerDocument, this.options.documentOverride && this.options.documentOverride instanceof Document && (this._document = this.optionsService.rawOptions.documentOverride), this.element = this._document.createElement("div"), this.element.dir = "ltr", this.element.classList.add("terminal"), this.element.classList.add("xterm"), e.appendChild(this.element);
    let i8 = this._document.createDocumentFragment();
    this._viewportElement = this._document.createElement("div"), this._viewportElement.classList.add("xterm-viewport"), i8.appendChild(this._viewportElement), this.screenElement = this._document.createElement("div"), this.screenElement.classList.add("xterm-screen"), this._register(L(this.screenElement, "mousemove", (o2) => this.updateCursorStyle(o2))), this._helperContainer = this._document.createElement("div"), this._helperContainer.classList.add("xterm-helpers"), this.screenElement.appendChild(this._helperContainer), i8.appendChild(this.screenElement);
    let r = this.textarea = this._document.createElement("textarea");
    this.textarea.classList.add("xterm-helper-textarea"), this.textarea.setAttribute("aria-label", mi.get()), Ts || this.textarea.setAttribute("aria-multiline", "false"), this.textarea.setAttribute("autocorrect", "off"), this.textarea.setAttribute("autocapitalize", "off"), this.textarea.setAttribute("spellcheck", "false"), this.textarea.tabIndex = 0, this._register(this.optionsService.onSpecificOptionChange("disableStdin", () => r.readOnly = this.optionsService.rawOptions.disableStdin)), this.textarea.readOnly = this.optionsService.rawOptions.disableStdin, this._coreBrowserService = this._register(this._instantiationService.createInstance(Jr, this.textarea, e.ownerDocument.defaultView ?? window, this._document ?? typeof window < "u" ? window.document : null)), this._instantiationService.setService(ae, this._coreBrowserService), this._register(L(this.textarea, "focus", (o2) => this._handleTextAreaFocus(o2))), this._register(L(this.textarea, "blur", () => this._handleTextAreaBlur())), this._helperContainer.appendChild(this.textarea), this._charSizeService = this._instantiationService.createInstance(jt, this._document, this._helperContainer), this._instantiationService.setService(nt, this._charSizeService), this._themeService = this._instantiationService.createInstance(ti), this._instantiationService.setService(Re, this._themeService), this._characterJoinerService = this._instantiationService.createInstance(ct), this._instantiationService.setService(or, this._characterJoinerService), this._renderService = this._register(this._instantiationService.createInstance(Qt, this.rows, this.screenElement)), this._instantiationService.setService(ce, this._renderService), this._register(this._renderService.onRenderedViewportChange((o2) => this._onRender.fire(o2))), this.onResize((o2) => this._renderService.resize(o2.cols, o2.rows)), this._compositionView = this._document.createElement("div"), this._compositionView.classList.add("composition-view"), this._compositionHelper = this._instantiationService.createInstance($t, this.textarea, this._compositionView), this._helperContainer.appendChild(this._compositionView), this._mouseService = this._instantiationService.createInstance(Xt), this._instantiationService.setService(Dt, this._mouseService);
    let n = this._linkifier.value = this._register(this._instantiationService.createInstance(hi, this.screenElement));
    this.element.appendChild(i8);
    try {
      this._onWillOpen.fire(this.element);
    } catch {
    }
    this._renderService.hasRenderer() || this._renderService.setRenderer(this._createRenderer()), this._register(this.onCursorMove(() => {
      this._renderService.handleCursorMove(), this._syncTextArea();
    })), this._register(this.onResize(() => this._renderService.handleResize(this.cols, this.rows))), this._register(this.onBlur(() => this._renderService.handleBlur())), this._register(this.onFocus(() => this._renderService.handleFocus())), this._viewport = this._register(this._instantiationService.createInstance(zt, this.element, this.screenElement)), this._register(this._viewport.onRequestScrollLines((o2) => {
      super.scrollLines(o2, false), this.refresh(0, this.rows - 1);
    })), this._selectionService = this._register(this._instantiationService.createInstance(ei, this.element, this.screenElement, n)), this._instantiationService.setService(Qs, this._selectionService), this._register(this._selectionService.onRequestScrollLines((o2) => this.scrollLines(o2.amount, o2.suppressScrollEvent))), this._register(this._selectionService.onSelectionChange(() => this._onSelectionChange.fire())), this._register(this._selectionService.onRequestRedraw((o2) => this._renderService.handleSelectionChanged(o2.start, o2.end, o2.columnSelectMode))), this._register(this._selectionService.onLinuxMouseSelection((o2) => {
      this.textarea.value = o2, this.textarea.focus(), this.textarea.select();
    })), this._register($.any(this._onScroll.event, this._inputHandler.onScroll)(() => {
      this._selectionService.refresh(), this._viewport?.queueSync();
    })), this._register(this._instantiationService.createInstance(Gt, this.screenElement)), this._register(L(this.element, "mousedown", (o2) => this._selectionService.handleMouseDown(o2))), this.coreMouseService.areMouseEventsActive ? (this._selectionService.disable(), this.element.classList.add("enable-mouse-events")) : this._selectionService.enable(), this.options.screenReaderMode && (this._accessibilityManager.value = this._instantiationService.createInstance(Tt, this)), this._register(this.optionsService.onSpecificOptionChange("screenReaderMode", (o2) => this._handleScreenReaderModeOptionChange(o2))), this.options.overviewRuler.width && (this._overviewRulerRenderer = this._register(this._instantiationService.createInstance(bt, this._viewportElement, this.screenElement))), this.optionsService.onSpecificOptionChange("overviewRuler", (o2) => {
      !this._overviewRulerRenderer && o2 && this._viewportElement && this.screenElement && (this._overviewRulerRenderer = this._register(this._instantiationService.createInstance(bt, this._viewportElement, this.screenElement)));
    }), this._charSizeService.measure(), this.refresh(0, this.rows - 1), this._initGlobal(), this.bindMouse();
  }
  _createRenderer() {
    return this._instantiationService.createInstance(Yt, this, this._document, this.element, this.screenElement, this._viewportElement, this._helperContainer, this.linkifier);
  }
  bindMouse() {
    let e = this, i8 = this.element;
    function r(l) {
      let a = e._mouseService.getMouseReportCoords(l, e.screenElement);
      if (!a) return false;
      let u, h2;
      switch (l.overrideType || l.type) {
        case "mousemove":
          h2 = 32, l.buttons === void 0 ? (u = 3, l.button !== void 0 && (u = l.button < 3 ? l.button : 3)) : u = l.buttons & 1 ? 0 : l.buttons & 4 ? 1 : l.buttons & 2 ? 2 : 3;
          break;
        case "mouseup":
          h2 = 0, u = l.button < 3 ? l.button : 3;
          break;
        case "mousedown":
          h2 = 1, u = l.button < 3 ? l.button : 3;
          break;
        case "wheel":
          if (e._customWheelEventHandler && e._customWheelEventHandler(l) === false) return false;
          let c = l.deltaY;
          if (c === 0 || e.coreMouseService.consumeWheelEvent(l, e._renderService?.dimensions?.device?.cell?.height, e._coreBrowserService?.dpr) === 0) return false;
          h2 = c < 0 ? 0 : 1, u = 4;
          break;
        default:
          return false;
      }
      return h2 === void 0 || u === void 0 || u > 4 ? false : e.coreMouseService.triggerMouseEvent({ col: a.col, row: a.row, x: a.x, y: a.y, button: u, action: h2, ctrl: l.ctrlKey, alt: l.altKey, shift: l.shiftKey });
    }
    let n = { mouseup: null, wheel: null, mousedrag: null, mousemove: null }, o2 = { mouseup: (l) => (r(l), l.buttons || (this._document.removeEventListener("mouseup", n.mouseup), n.mousedrag && this._document.removeEventListener("mousemove", n.mousedrag)), this.cancel(l)), wheel: (l) => (r(l), this.cancel(l, true)), mousedrag: (l) => {
      l.buttons && r(l);
    }, mousemove: (l) => {
      l.buttons || r(l);
    } };
    this._register(this.coreMouseService.onProtocolChange((l) => {
      l ? (this.optionsService.rawOptions.logLevel === "debug" && this._logService.debug("Binding to mouse events:", this.coreMouseService.explainEvents(l)), this.element.classList.add("enable-mouse-events"), this._selectionService.disable()) : (this._logService.debug("Unbinding from mouse events."), this.element.classList.remove("enable-mouse-events"), this._selectionService.enable()), l & 8 ? n.mousemove || (i8.addEventListener("mousemove", o2.mousemove), n.mousemove = o2.mousemove) : (i8.removeEventListener("mousemove", n.mousemove), n.mousemove = null), l & 16 ? n.wheel || (i8.addEventListener("wheel", o2.wheel, { passive: false }), n.wheel = o2.wheel) : (i8.removeEventListener("wheel", n.wheel), n.wheel = null), l & 2 ? n.mouseup || (n.mouseup = o2.mouseup) : (this._document.removeEventListener("mouseup", n.mouseup), n.mouseup = null), l & 4 ? n.mousedrag || (n.mousedrag = o2.mousedrag) : (this._document.removeEventListener("mousemove", n.mousedrag), n.mousedrag = null);
    })), this.coreMouseService.activeProtocol = this.coreMouseService.activeProtocol, this._register(L(i8, "mousedown", (l) => {
      if (l.preventDefault(), this.focus(), !(!this.coreMouseService.areMouseEventsActive || this._selectionService.shouldForceSelection(l))) return r(l), n.mouseup && this._document.addEventListener("mouseup", n.mouseup), n.mousedrag && this._document.addEventListener("mousemove", n.mousedrag), this.cancel(l);
    })), this._register(L(i8, "wheel", (l) => {
      if (!n.wheel) {
        if (this._customWheelEventHandler && this._customWheelEventHandler(l) === false) return false;
        if (!this.buffer.hasScrollback) {
          if (l.deltaY === 0) return false;
          if (e.coreMouseService.consumeWheelEvent(l, e._renderService?.dimensions?.device?.cell?.height, e._coreBrowserService?.dpr) === 0) return this.cancel(l, true);
          let h2 = b.ESC + (this.coreService.decPrivateModes.applicationCursorKeys ? "O" : "[") + (l.deltaY < 0 ? "A" : "B");
          return this.coreService.triggerDataEvent(h2, true), this.cancel(l, true);
        }
      }
    }, { passive: false }));
  }
  refresh(e, i8) {
    this._renderService?.refreshRows(e, i8);
  }
  updateCursorStyle(e) {
    this._selectionService?.shouldColumnSelect(e) ? this.element.classList.add("column-select") : this.element.classList.remove("column-select");
  }
  _showCursor() {
    this.coreService.isCursorInitialized || (this.coreService.isCursorInitialized = true, this.refresh(this.buffer.y, this.buffer.y));
  }
  scrollLines(e, i8) {
    this._viewport ? this._viewport.scrollLines(e) : super.scrollLines(e, i8), this.refresh(0, this.rows - 1);
  }
  scrollPages(e) {
    this.scrollLines(e * (this.rows - 1));
  }
  scrollToTop() {
    this.scrollLines(-this._bufferService.buffer.ydisp);
  }
  scrollToBottom(e) {
    e && this._viewport ? this._viewport.scrollToLine(this.buffer.ybase, true) : this.scrollLines(this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
  }
  scrollToLine(e) {
    let i8 = e - this._bufferService.buffer.ydisp;
    i8 !== 0 && this.scrollLines(i8);
  }
  paste(e) {
    Cn(e, this.textarea, this.coreService, this.optionsService);
  }
  attachCustomKeyEventHandler(e) {
    this._customKeyEventHandler = e;
  }
  attachCustomWheelEventHandler(e) {
    this._customWheelEventHandler = e;
  }
  registerLinkProvider(e) {
    return this._linkProviderService.registerLinkProvider(e);
  }
  registerCharacterJoiner(e) {
    if (!this._characterJoinerService) throw new Error("Terminal must be opened first");
    let i8 = this._characterJoinerService.register(e);
    return this.refresh(0, this.rows - 1), i8;
  }
  deregisterCharacterJoiner(e) {
    if (!this._characterJoinerService) throw new Error("Terminal must be opened first");
    this._characterJoinerService.deregister(e) && this.refresh(0, this.rows - 1);
  }
  get markers() {
    return this.buffer.markers;
  }
  registerMarker(e) {
    return this.buffer.addMarker(this.buffer.ybase + this.buffer.y + e);
  }
  registerDecoration(e) {
    return this._decorationService.registerDecoration(e);
  }
  hasSelection() {
    return this._selectionService ? this._selectionService.hasSelection : false;
  }
  select(e, i8, r) {
    this._selectionService.setSelection(e, i8, r);
  }
  getSelection() {
    return this._selectionService ? this._selectionService.selectionText : "";
  }
  getSelectionPosition() {
    if (!(!this._selectionService || !this._selectionService.hasSelection)) return { start: { x: this._selectionService.selectionStart[0], y: this._selectionService.selectionStart[1] }, end: { x: this._selectionService.selectionEnd[0], y: this._selectionService.selectionEnd[1] } };
  }
  clearSelection() {
    this._selectionService?.clearSelection();
  }
  selectAll() {
    this._selectionService?.selectAll();
  }
  selectLines(e, i8) {
    this._selectionService?.selectLines(e, i8);
  }
  _keyDown(e) {
    if (this._keyDownHandled = false, this._keyDownSeen = true, this._customKeyEventHandler && this._customKeyEventHandler(e) === false) return false;
    let i8 = this.browser.isMac && this.options.macOptionIsMeta && e.altKey;
    if (!i8 && !this._compositionHelper.keydown(e)) return this.options.scrollOnUserInput && this.buffer.ybase !== this.buffer.ydisp && this.scrollToBottom(true), false;
    !i8 && (e.key === "Dead" || e.key === "AltGraph") && (this._unprocessedDeadKey = true);
    let r = Il(e, this.coreService.decPrivateModes.applicationCursorKeys, this.browser.isMac, this.options.macOptionIsMeta);
    if (this.updateCursorStyle(e), r.type === 3 || r.type === 2) {
      let n = this.rows - 1;
      return this.scrollLines(r.type === 2 ? -n : n), this.cancel(e, true);
    }
    if (r.type === 1 && this.selectAll(), this._isThirdLevelShift(this.browser, e) || (r.cancel && this.cancel(e, true), !r.key) || e.key && !e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1 && e.key.charCodeAt(0) >= 65 && e.key.charCodeAt(0) <= 90) return true;
    if (this._unprocessedDeadKey) return this._unprocessedDeadKey = false, true;
    if ((r.key === b.ETX || r.key === b.CR) && (this.textarea.value = ""), this._onKey.fire({ key: r.key, domEvent: e }), this._showCursor(), this.coreService.triggerDataEvent(r.key, true), !this.optionsService.rawOptions.screenReaderMode || e.altKey || e.ctrlKey) return this.cancel(e, true);
    this._keyDownHandled = true;
  }
  _isThirdLevelShift(e, i8) {
    let r = e.isMac && !this.options.macOptionIsMeta && i8.altKey && !i8.ctrlKey && !i8.metaKey || e.isWindows && i8.altKey && i8.ctrlKey && !i8.metaKey || e.isWindows && i8.getModifierState("AltGraph");
    return i8.type === "keypress" ? r : r && (!i8.keyCode || i8.keyCode > 47);
  }
  _keyUp(e) {
    this._keyDownSeen = false, !(this._customKeyEventHandler && this._customKeyEventHandler(e) === false) && (Tc(e) || this.focus(), this.updateCursorStyle(e), this._keyPressHandled = false);
  }
  _keyPress(e) {
    let i8;
    if (this._keyPressHandled = false, this._keyDownHandled || this._customKeyEventHandler && this._customKeyEventHandler(e) === false) return false;
    if (this.cancel(e), e.charCode) i8 = e.charCode;
    else if (e.which === null || e.which === void 0) i8 = e.keyCode;
    else if (e.which !== 0 && e.charCode !== 0) i8 = e.which;
    else return false;
    return !i8 || (e.altKey || e.ctrlKey || e.metaKey) && !this._isThirdLevelShift(this.browser, e) ? false : (i8 = String.fromCharCode(i8), this._onKey.fire({ key: i8, domEvent: e }), this._showCursor(), this.coreService.triggerDataEvent(i8, true), this._keyPressHandled = true, this._unprocessedDeadKey = false, true);
  }
  _inputEvent(e) {
    if (e.data && e.inputType === "insertText" && (!e.composed || !this._keyDownSeen) && !this.optionsService.rawOptions.screenReaderMode) {
      if (this._keyPressHandled) return false;
      this._unprocessedDeadKey = false;
      let i8 = e.data;
      return this.coreService.triggerDataEvent(i8, true), this.cancel(e), true;
    }
    return false;
  }
  resize(e, i8) {
    if (e === this.cols && i8 === this.rows) {
      this._charSizeService && !this._charSizeService.hasValidSize && this._charSizeService.measure();
      return;
    }
    super.resize(e, i8);
  }
  _afterResize(e, i8) {
    this._charSizeService?.measure();
  }
  clear() {
    if (!(this.buffer.ybase === 0 && this.buffer.y === 0)) {
      this.buffer.clearAllMarkers(), this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y)), this.buffer.lines.length = 1, this.buffer.ydisp = 0, this.buffer.ybase = 0, this.buffer.y = 0;
      for (let e = 1; e < this.rows; e++) this.buffer.lines.push(this.buffer.getBlankLine(X));
      this._onScroll.fire({ position: this.buffer.ydisp }), this.refresh(0, this.rows - 1);
    }
  }
  reset() {
    this.options.rows = this.rows, this.options.cols = this.cols;
    let e = this._customKeyEventHandler;
    this._setup(), super.reset(), this._selectionService?.reset(), this._decorationService.reset(), this._customKeyEventHandler = e, this.refresh(0, this.rows - 1);
  }
  clearTextureAtlas() {
    this._renderService?.clearTextureAtlas();
  }
  _reportFocus() {
    this.element?.classList.contains("focus") ? this.coreService.triggerDataEvent(b.ESC + "[I") : this.coreService.triggerDataEvent(b.ESC + "[O");
  }
  _reportWindowsOptions(e) {
    if (this._renderService) switch (e) {
      case 0:
        let i8 = this._renderService.dimensions.css.canvas.width.toFixed(0), r = this._renderService.dimensions.css.canvas.height.toFixed(0);
        this.coreService.triggerDataEvent(`${b.ESC}[4;${r};${i8}t`);
        break;
      case 1:
        let n = this._renderService.dimensions.css.cell.width.toFixed(0), o2 = this._renderService.dimensions.css.cell.height.toFixed(0);
        this.coreService.triggerDataEvent(`${b.ESC}[6;${o2};${n}t`);
        break;
    }
  }
  cancel(e, i8) {
    if (!(!this.options.cancelEvents && !i8)) return e.preventDefault(), e.stopPropagation(), false;
  }
};
function Tc(s15) {
  return s15.keyCode === 16 || s15.keyCode === 17 || s15.keyCode === 18;
}
var xn = class {
  constructor() {
    this._addons = [];
  }
  dispose() {
    for (let t = this._addons.length - 1; t >= 0; t--) this._addons[t].instance.dispose();
  }
  loadAddon(t, e) {
    let i8 = { instance: e, dispose: e.dispose, isDisposed: false };
    this._addons.push(i8), e.dispose = () => this._wrappedAddonDispose(i8), e.activate(t);
  }
  _wrappedAddonDispose(t) {
    if (t.isDisposed) return;
    let e = -1;
    for (let i8 = 0; i8 < this._addons.length; i8++) if (this._addons[i8] === t) {
      e = i8;
      break;
    }
    if (e === -1) throw new Error("Could not dispose an addon that has not been loaded");
    t.isDisposed = true, t.dispose.apply(t.instance), this._addons.splice(e, 1);
  }
};
var wn = class {
  constructor(t) {
    this._line = t;
  }
  get isWrapped() {
    return this._line.isWrapped;
  }
  get length() {
    return this._line.length;
  }
  getCell(t, e) {
    if (!(t < 0 || t >= this._line.length)) return e ? (this._line.loadCell(t, e), e) : this._line.loadCell(t, new q());
  }
  translateToString(t, e, i8) {
    return this._line.translateToString(t, e, i8);
  }
};
var Ji = class {
  constructor(t, e) {
    this._buffer = t;
    this.type = e;
  }
  init(t) {
    return this._buffer = t, this;
  }
  get cursorY() {
    return this._buffer.y;
  }
  get cursorX() {
    return this._buffer.x;
  }
  get viewportY() {
    return this._buffer.ydisp;
  }
  get baseY() {
    return this._buffer.ybase;
  }
  get length() {
    return this._buffer.lines.length;
  }
  getLine(t) {
    let e = this._buffer.lines.get(t);
    if (e) return new wn(e);
  }
  getNullCell() {
    return new q();
  }
};
var Dn = class extends D2 {
  constructor(e) {
    super();
    this._core = e;
    this._onBufferChange = this._register(new v());
    this.onBufferChange = this._onBufferChange.event;
    this._normal = new Ji(this._core.buffers.normal, "normal"), this._alternate = new Ji(this._core.buffers.alt, "alternate"), this._core.buffers.onBufferActivate(() => this._onBufferChange.fire(this.active));
  }
  get active() {
    if (this._core.buffers.active === this._core.buffers.normal) return this.normal;
    if (this._core.buffers.active === this._core.buffers.alt) return this.alternate;
    throw new Error("Active buffer is neither normal nor alternate");
  }
  get normal() {
    return this._normal.init(this._core.buffers.normal);
  }
  get alternate() {
    return this._alternate.init(this._core.buffers.alt);
  }
};
var Rn = class {
  constructor(t) {
    this._core = t;
  }
  registerCsiHandler(t, e) {
    return this._core.registerCsiHandler(t, (i8) => e(i8.toArray()));
  }
  addCsiHandler(t, e) {
    return this.registerCsiHandler(t, e);
  }
  registerDcsHandler(t, e) {
    return this._core.registerDcsHandler(t, (i8, r) => e(i8, r.toArray()));
  }
  addDcsHandler(t, e) {
    return this.registerDcsHandler(t, e);
  }
  registerEscHandler(t, e) {
    return this._core.registerEscHandler(t, e);
  }
  addEscHandler(t, e) {
    return this.registerEscHandler(t, e);
  }
  registerOscHandler(t, e) {
    return this._core.registerOscHandler(t, e);
  }
  addOscHandler(t, e) {
    return this.registerOscHandler(t, e);
  }
};
var Ln = class {
  constructor(t) {
    this._core = t;
  }
  register(t) {
    this._core.unicodeService.register(t);
  }
  get versions() {
    return this._core.unicodeService.versions;
  }
  get activeVersion() {
    return this._core.unicodeService.activeVersion;
  }
  set activeVersion(t) {
    this._core.unicodeService.activeVersion = t;
  }
};
var Ic = ["cols", "rows"];
var Ue = 0;
var Dl = class extends D2 {
  constructor(t) {
    super(), this._core = this._register(new yn(t)), this._addonManager = this._register(new xn()), this._publicOptions = { ...this._core.options };
    let e = (r) => this._core.options[r], i8 = (r, n) => {
      this._checkReadonlyOptions(r), this._core.options[r] = n;
    };
    for (let r in this._core.options) {
      let n = { get: e.bind(this, r), set: i8.bind(this, r) };
      Object.defineProperty(this._publicOptions, r, n);
    }
  }
  _checkReadonlyOptions(t) {
    if (Ic.includes(t)) throw new Error(`Option "${t}" can only be set in the constructor`);
  }
  _checkProposedApi() {
    if (!this._core.optionsService.rawOptions.allowProposedApi) throw new Error("You must set the allowProposedApi option to true to use proposed API");
  }
  get onBell() {
    return this._core.onBell;
  }
  get onBinary() {
    return this._core.onBinary;
  }
  get onCursorMove() {
    return this._core.onCursorMove;
  }
  get onData() {
    return this._core.onData;
  }
  get onKey() {
    return this._core.onKey;
  }
  get onLineFeed() {
    return this._core.onLineFeed;
  }
  get onRender() {
    return this._core.onRender;
  }
  get onResize() {
    return this._core.onResize;
  }
  get onScroll() {
    return this._core.onScroll;
  }
  get onSelectionChange() {
    return this._core.onSelectionChange;
  }
  get onTitleChange() {
    return this._core.onTitleChange;
  }
  get onWriteParsed() {
    return this._core.onWriteParsed;
  }
  get element() {
    return this._core.element;
  }
  get parser() {
    return this._parser || (this._parser = new Rn(this._core)), this._parser;
  }
  get unicode() {
    return this._checkProposedApi(), new Ln(this._core);
  }
  get textarea() {
    return this._core.textarea;
  }
  get rows() {
    return this._core.rows;
  }
  get cols() {
    return this._core.cols;
  }
  get buffer() {
    return this._buffer || (this._buffer = this._register(new Dn(this._core))), this._buffer;
  }
  get markers() {
    return this._checkProposedApi(), this._core.markers;
  }
  get modes() {
    let t = this._core.coreService.decPrivateModes, e = "none";
    switch (this._core.coreMouseService.activeProtocol) {
      case "X10":
        e = "x10";
        break;
      case "VT200":
        e = "vt200";
        break;
      case "DRAG":
        e = "drag";
        break;
      case "ANY":
        e = "any";
        break;
    }
    return { applicationCursorKeysMode: t.applicationCursorKeys, applicationKeypadMode: t.applicationKeypad, bracketedPasteMode: t.bracketedPasteMode, insertMode: this._core.coreService.modes.insertMode, mouseTrackingMode: e, originMode: t.origin, reverseWraparoundMode: t.reverseWraparound, sendFocusMode: t.sendFocus, synchronizedOutputMode: t.synchronizedOutput, wraparoundMode: t.wraparound };
  }
  get options() {
    return this._publicOptions;
  }
  set options(t) {
    for (let e in t) this._publicOptions[e] = t[e];
  }
  blur() {
    this._core.blur();
  }
  focus() {
    this._core.focus();
  }
  input(t, e = true) {
    this._core.input(t, e);
  }
  resize(t, e) {
    this._verifyIntegers(t, e), this._core.resize(t, e);
  }
  open(t) {
    this._core.open(t);
  }
  attachCustomKeyEventHandler(t) {
    this._core.attachCustomKeyEventHandler(t);
  }
  attachCustomWheelEventHandler(t) {
    this._core.attachCustomWheelEventHandler(t);
  }
  registerLinkProvider(t) {
    return this._core.registerLinkProvider(t);
  }
  registerCharacterJoiner(t) {
    return this._checkProposedApi(), this._core.registerCharacterJoiner(t);
  }
  deregisterCharacterJoiner(t) {
    this._checkProposedApi(), this._core.deregisterCharacterJoiner(t);
  }
  registerMarker(t = 0) {
    return this._verifyIntegers(t), this._core.registerMarker(t);
  }
  registerDecoration(t) {
    return this._checkProposedApi(), this._verifyPositiveIntegers(t.x ?? 0, t.width ?? 0, t.height ?? 0), this._core.registerDecoration(t);
  }
  hasSelection() {
    return this._core.hasSelection();
  }
  select(t, e, i8) {
    this._verifyIntegers(t, e, i8), this._core.select(t, e, i8);
  }
  getSelection() {
    return this._core.getSelection();
  }
  getSelectionPosition() {
    return this._core.getSelectionPosition();
  }
  clearSelection() {
    this._core.clearSelection();
  }
  selectAll() {
    this._core.selectAll();
  }
  selectLines(t, e) {
    this._verifyIntegers(t, e), this._core.selectLines(t, e);
  }
  dispose() {
    super.dispose();
  }
  scrollLines(t) {
    this._verifyIntegers(t), this._core.scrollLines(t);
  }
  scrollPages(t) {
    this._verifyIntegers(t), this._core.scrollPages(t);
  }
  scrollToTop() {
    this._core.scrollToTop();
  }
  scrollToBottom() {
    this._core.scrollToBottom();
  }
  scrollToLine(t) {
    this._verifyIntegers(t), this._core.scrollToLine(t);
  }
  clear() {
    this._core.clear();
  }
  write(t, e) {
    this._core.write(t, e);
  }
  writeln(t, e) {
    this._core.write(t), this._core.write(`\r
`, e);
  }
  paste(t) {
    this._core.paste(t);
  }
  refresh(t, e) {
    this._verifyIntegers(t, e), this._core.refresh(t, e);
  }
  reset() {
    this._core.reset();
  }
  clearTextureAtlas() {
    this._core.clearTextureAtlas();
  }
  loadAddon(t) {
    this._addonManager.loadAddon(this, t);
  }
  static get strings() {
    return { get promptLabel() {
      return mi.get();
    }, set promptLabel(t) {
      mi.set(t);
    }, get tooMuchOutput() {
      return _i.get();
    }, set tooMuchOutput(t) {
      _i.set(t);
    } };
  }
  _verifyIntegers(...t) {
    for (Ue of t) if (Ue === 1 / 0 || isNaN(Ue) || Ue % 1 !== 0) throw new Error("This API only accepts integers");
  }
  _verifyPositiveIntegers(...t) {
    for (Ue of t) if (Ue && (Ue === 1 / 0 || isNaN(Ue) || Ue % 1 !== 0 || Ue < 0)) throw new Error("This API only accepts positive integers");
  }
};

// node_modules/.pnpm/@xterm+addon-fit@0.11.0/node_modules/@xterm/addon-fit/lib/addon-fit.mjs
var h = 2;
var _ = 1;
var o = class {
  activate(e) {
    this._terminal = e;
  }
  dispose() {
  }
  fit() {
    let e = this.proposeDimensions();
    if (!e || !this._terminal || isNaN(e.cols) || isNaN(e.rows)) return;
    let t = this._terminal._core;
    (this._terminal.rows !== e.rows || this._terminal.cols !== e.cols) && (t._renderService.clear(), this._terminal.resize(e.cols, e.rows));
  }
  proposeDimensions() {
    if (!this._terminal || !this._terminal.element || !this._terminal.element.parentElement) return;
    let t = this._terminal._core._renderService.dimensions;
    if (t.css.cell.width === 0 || t.css.cell.height === 0) return;
    let s15 = this._terminal.options.scrollback === 0 ? 0 : this._terminal.options.overviewRuler?.width || 14, r = window.getComputedStyle(this._terminal.element.parentElement), l = parseInt(r.getPropertyValue("height")), a = Math.max(0, parseInt(r.getPropertyValue("width"))), i8 = window.getComputedStyle(this._terminal.element), n = { top: parseInt(i8.getPropertyValue("padding-top")), bottom: parseInt(i8.getPropertyValue("padding-bottom")), right: parseInt(i8.getPropertyValue("padding-right")), left: parseInt(i8.getPropertyValue("padding-left")) }, m = n.top + n.bottom, d = n.right + n.left, c = l - m, p = a - d - s15;
    return { cols: Math.max(h, Math.floor(p / t.css.cell.width)), rows: Math.max(_, Math.floor(c / t.css.cell.height)) };
  }
};

// node_modules/.pnpm/@xterm+addon-webgl@0.19.0/node_modules/@xterm/addon-webgl/lib/addon-webgl.mjs
var Lr2 = Object.defineProperty;
var wr2 = Object.getOwnPropertyDescriptor;
var Yi2 = (i8, e, t, n) => {
  for (var s15 = n > 1 ? void 0 : n ? wr2(e, t) : e, o2 = i8.length - 1, r; o2 >= 0; o2--) (r = i8[o2]) && (s15 = (n ? r(e, t, s15) : r(s15)) || s15);
  return n && s15 && Lr2(e, t, s15), s15;
};
var Qi = (i8, e) => (t, n) => e(t, n, i8);
var pi = class {
  constructor() {
    this.listeners = [], this.unexpectedErrorHandler = function(e) {
      setTimeout(() => {
        throw e.stack ? bt2.isErrorNoTelemetry(e) ? new bt2(e.message + `

` + e.stack) : new Error(e.message + `

` + e.stack) : e;
      }, 0);
    };
  }
  addListener(e) {
    return this.listeners.push(e), () => {
      this._removeListener(e);
    };
  }
  emit(e) {
    this.listeners.forEach((t) => {
      t(e);
    });
  }
  _removeListener(e) {
    this.listeners.splice(this.listeners.indexOf(e), 1);
  }
  setUnexpectedErrorHandler(e) {
    this.unexpectedErrorHandler = e;
  }
  getUnexpectedErrorHandler() {
    return this.unexpectedErrorHandler;
  }
  onUnexpectedError(e) {
    this.unexpectedErrorHandler(e), this.emit(e);
  }
  onUnexpectedExternalError(e) {
    this.unexpectedErrorHandler(e);
  }
};
var Rr2 = new pi();
function Pe(i8) {
  Dr2(i8) || Rr2.onUnexpectedError(i8);
}
var fi = "Canceled";
function Dr2(i8) {
  return i8 instanceof Ye2 ? true : i8 instanceof Error && i8.name === fi && i8.message === fi;
}
var Ye2 = class extends Error {
  constructor() {
    super(fi), this.name = this.message;
  }
};
var bt2 = class i extends Error {
  constructor(e) {
    super(e), this.name = "CodeExpectedError";
  }
  static fromError(e) {
    if (e instanceof i) return e;
    let t = new i();
    return t.message = e.message, t.stack = e.stack, t;
  }
  static isErrorNoTelemetry(e) {
    return e.name === "CodeExpectedError";
  }
};
function Mr2(i8, e, t = 0, n = i8.length) {
  let s15 = t, o2 = n;
  for (; s15 < o2; ) {
    let r = Math.floor((s15 + o2) / 2);
    e(i8[r]) ? s15 = r + 1 : o2 = r;
  }
  return s15 - 1;
}
var vt2 = class vt3 {
  constructor(e) {
    this._array = e;
    this._findLastMonotonousLastIdx = 0;
  }
  findLastMonotonous(e) {
    if (vt3.assertInvariants) {
      if (this._prevFindLastPredicate) {
        for (let n of this._array) if (this._prevFindLastPredicate(n) && !e(n)) throw new Error("MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.");
      }
      this._prevFindLastPredicate = e;
    }
    let t = Mr2(this._array, e, this._findLastMonotonousLastIdx);
    return this._findLastMonotonousLastIdx = t + 1, t === -1 ? void 0 : this._array[t];
  }
};
vt2.assertInvariants = false;
var en2;
((a) => {
  function i8(l) {
    return l < 0;
  }
  a.isLessThan = i8;
  function e(l) {
    return l <= 0;
  }
  a.isLessThanOrEqual = e;
  function t(l) {
    return l > 0;
  }
  a.isGreaterThan = t;
  function n(l) {
    return l === 0;
  }
  a.isNeitherLessOrGreaterThan = n, a.greaterThan = 1, a.lessThan = -1, a.neitherLessOrGreaterThan = 0;
})(en2 || (en2 = {}));
function tn2(i8, e) {
  return (t, n) => e(i8(t), i8(n));
}
var nn2 = (i8, e) => i8 - e;
var Be2 = class Be3 {
  constructor(e) {
    this.iterate = e;
  }
  forEach(e) {
    this.iterate((t) => (e(t), true));
  }
  toArray() {
    let e = [];
    return this.iterate((t) => (e.push(t), true)), e;
  }
  filter(e) {
    return new Be3((t) => this.iterate((n) => e(n) ? t(n) : true));
  }
  map(e) {
    return new Be3((t) => this.iterate((n) => t(e(n))));
  }
  some(e) {
    let t = false;
    return this.iterate((n) => (t = e(n), !t)), t;
  }
  findFirst(e) {
    let t;
    return this.iterate((n) => e(n) ? (t = n, false) : true), t;
  }
  findLast(e) {
    let t;
    return this.iterate((n) => (e(n) && (t = n), true)), t;
  }
  findLastMaxBy(e) {
    let t, n = true;
    return this.iterate((s15) => ((n || en2.isGreaterThan(e(s15, t))) && (n = false, t = s15), true)), t;
  }
};
Be2.empty = new Be2((e) => {
});
function an2(i8, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let n of i8) {
    let s15 = e(n), o2 = t[s15];
    o2 || (o2 = t[s15] = []), o2.push(n);
  }
  return t;
}
var sn2;
var on2;
var rn2 = class {
  constructor(e, t) {
    this.toKey = t;
    this._map = /* @__PURE__ */ new Map();
    this[sn2] = "SetWithKey";
    for (let n of e) this.add(n);
  }
  get size() {
    return this._map.size;
  }
  add(e) {
    let t = this.toKey(e);
    return this._map.set(t, e), this;
  }
  delete(e) {
    return this._map.delete(this.toKey(e));
  }
  has(e) {
    return this._map.has(this.toKey(e));
  }
  *entries() {
    for (let e of this._map.values()) yield [e, e];
  }
  keys() {
    return this.values();
  }
  *values() {
    for (let e of this._map.values()) yield e;
  }
  clear() {
    this._map.clear();
  }
  forEach(e, t) {
    this._map.forEach((n) => e.call(t, n, n, this));
  }
  [(on2 = Symbol.iterator, sn2 = Symbol.toStringTag, on2)]() {
    return this.values();
  }
};
var Tt2 = class {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  add(e, t) {
    let n = this.map.get(e);
    n || (n = /* @__PURE__ */ new Set(), this.map.set(e, n)), n.add(t);
  }
  delete(e, t) {
    let n = this.map.get(e);
    n && (n.delete(t), n.size === 0 && this.map.delete(e));
  }
  forEach(e, t) {
    let n = this.map.get(e);
    n && n.forEach(t);
  }
  get(e) {
    let t = this.map.get(e);
    return t || /* @__PURE__ */ new Set();
  }
};
function mi2(i8, e) {
  let t = this, n = false, s15;
  return function() {
    if (n) return s15;
    if (n = true, e) try {
      s15 = i8.apply(t, arguments);
    } finally {
      e();
    }
    else s15 = i8.apply(t, arguments);
    return s15;
  };
}
var _i2;
((W2) => {
  function i8(E) {
    return E && typeof E == "object" && typeof E[Symbol.iterator] == "function";
  }
  W2.is = i8;
  let e = Object.freeze([]);
  function t() {
    return e;
  }
  W2.empty = t;
  function* n(E) {
    yield E;
  }
  W2.single = n;
  function s15(E) {
    return i8(E) ? E : n(E);
  }
  W2.wrap = s15;
  function o2(E) {
    return E || e;
  }
  W2.from = o2;
  function* r(E) {
    for (let y = E.length - 1; y >= 0; y--) yield E[y];
  }
  W2.reverse = r;
  function a(E) {
    return !E || E[Symbol.iterator]().next().done === true;
  }
  W2.isEmpty = a;
  function l(E) {
    return E[Symbol.iterator]().next().value;
  }
  W2.first = l;
  function u(E, y) {
    let w = 0;
    for (let G3 of E) if (y(G3, w++)) return true;
    return false;
  }
  W2.some = u;
  function c(E, y) {
    for (let w of E) if (y(w)) return w;
  }
  W2.find = c;
  function* d(E, y) {
    for (let w of E) y(w) && (yield w);
  }
  W2.filter = d;
  function* h2(E, y) {
    let w = 0;
    for (let G3 of E) yield y(G3, w++);
  }
  W2.map = h2;
  function* f(E, y) {
    let w = 0;
    for (let G3 of E) yield* y(G3, w++);
  }
  W2.flatMap = f;
  function* I(...E) {
    for (let y of E) yield* y;
  }
  W2.concat = I;
  function L2(E, y, w) {
    let G3 = w;
    for (let ue2 of E) G3 = y(G3, ue2);
    return G3;
  }
  W2.reduce = L2;
  function* M2(E, y, w = E.length) {
    for (y < 0 && (y += E.length), w < 0 ? w += E.length : w > E.length && (w = E.length); y < w; y++) yield E[y];
  }
  W2.slice = M2;
  function q2(E, y = Number.POSITIVE_INFINITY) {
    let w = [];
    if (y === 0) return [w, E];
    let G3 = E[Symbol.iterator]();
    for (let ue2 = 0; ue2 < y; ue2++) {
      let Se2 = G3.next();
      if (Se2.done) return [w, W2.empty()];
      w.push(Se2.value);
    }
    return [w, { [Symbol.iterator]() {
      return G3;
    } }];
  }
  W2.consume = q2;
  async function S2(E) {
    let y = [];
    for await (let w of E) y.push(w);
    return Promise.resolve(y);
  }
  W2.asyncToArray = S2;
})(_i2 || (_i2 = {}));
var Ar2 = false;
var Ne2 = null;
var gt2 = class gt3 {
  constructor() {
    this.livingDisposables = /* @__PURE__ */ new Map();
  }
  getDisposableData(e) {
    let t = this.livingDisposables.get(e);
    return t || (t = { parent: null, source: null, isSingleton: false, value: e, idx: gt3.idx++ }, this.livingDisposables.set(e, t)), t;
  }
  trackDisposable(e) {
    let t = this.getDisposableData(e);
    t.source || (t.source = new Error().stack);
  }
  setParent(e, t) {
    let n = this.getDisposableData(e);
    n.parent = t;
  }
  markAsDisposed(e) {
    this.livingDisposables.delete(e);
  }
  markAsSingleton(e) {
    this.getDisposableData(e).isSingleton = true;
  }
  getRootParent(e, t) {
    let n = t.get(e);
    if (n) return n;
    let s15 = e.parent ? this.getRootParent(this.getDisposableData(e.parent), t) : e;
    return t.set(e, s15), s15;
  }
  getTrackedDisposables() {
    let e = /* @__PURE__ */ new Map();
    return [...this.livingDisposables.entries()].filter(([, n]) => n.source !== null && !this.getRootParent(n, e).isSingleton).flatMap(([n]) => n);
  }
  computeLeakingDisposables(e = 10, t) {
    let n;
    if (t) n = t;
    else {
      let l = /* @__PURE__ */ new Map(), u = [...this.livingDisposables.values()].filter((d) => d.source !== null && !this.getRootParent(d, l).isSingleton);
      if (u.length === 0) return;
      let c = new Set(u.map((d) => d.value));
      if (n = u.filter((d) => !(d.parent && c.has(d.parent))), n.length === 0) throw new Error("There are cyclic diposable chains!");
    }
    if (!n) return;
    function s15(l) {
      function u(d, h2) {
        for (; d.length > 0 && h2.some((f) => typeof f == "string" ? f === d[0] : d[0].match(f)); ) d.shift();
      }
      let c = l.source.split(`
`).map((d) => d.trim().replace("at ", "")).filter((d) => d !== "");
      return u(c, ["Error", /^trackDisposable \(.*\)$/, /^DisposableTracker.trackDisposable \(.*\)$/]), c.reverse();
    }
    let o2 = new Tt2();
    for (let l of n) {
      let u = s15(l);
      for (let c = 0; c <= u.length; c++) o2.add(u.slice(0, c).join(`
`), l);
    }
    n.sort(tn2((l) => l.idx, nn2));
    let r = "", a = 0;
    for (let l of n.slice(0, e)) {
      a++;
      let u = s15(l), c = [];
      for (let d = 0; d < u.length; d++) {
        let h2 = u[d];
        h2 = `(shared with ${o2.get(u.slice(0, d + 1).join(`
`)).size}/${n.length} leaks) at ${h2}`;
        let I = o2.get(u.slice(0, d).join(`
`)), L2 = an2([...I].map((M2) => s15(M2)[d]), (M2) => M2);
        delete L2[u[d]];
        for (let [M2, q2] of Object.entries(L2)) c.unshift(`    - stacktraces of ${q2.length} other leaks continue with ${M2}`);
        c.unshift(h2);
      }
      r += `


==================== Leaking disposable ${a}/${n.length}: ${l.value.constructor.name} ====================
${c.join(`
`)}
============================================================

`;
    }
    return n.length > e && (r += `


... and ${n.length - e} more leaking disposables

`), { leaks: n, details: r };
  }
};
gt2.idx = 0;
function Sr2(i8) {
  Ne2 = i8;
}
if (Ar2) {
  let i8 = "__is_disposable_tracked__";
  Sr2(new class {
    trackDisposable(e) {
      let t = new Error("Potentially leaked disposable").stack;
      setTimeout(() => {
        e[i8] || console.log(t);
      }, 3e3);
    }
    setParent(e, t) {
      if (e && e !== B3.None) try {
        e[i8] = true;
      } catch {
      }
    }
    markAsDisposed(e) {
      if (e && e !== B3.None) try {
        e[i8] = true;
      } catch {
      }
    }
    markAsSingleton(e) {
    }
  }());
}
function Et(i8) {
  return Ne2?.trackDisposable(i8), i8;
}
function yt(i8) {
  Ne2?.markAsDisposed(i8);
}
function Qe(i8, e) {
  Ne2?.setParent(i8, e);
}
function Or2(i8, e) {
  if (Ne2) for (let t of i8) Ne2.setParent(t, e);
}
function un3(i8) {
  if (_i2.is(i8)) {
    let e = [];
    for (let t of i8) if (t) try {
      t.dispose();
    } catch (n) {
      e.push(n);
    }
    if (e.length === 1) throw e[0];
    if (e.length > 1) throw new AggregateError(e, "Encountered errors while disposing of store");
    return Array.isArray(i8) ? [] : i8;
  } else if (i8) return i8.dispose(), i8;
}
function It2(...i8) {
  let e = O(() => un3(i8));
  return Or2(i8, e), e;
}
function O(i8) {
  let e = Et({ dispose: mi2(() => {
    yt(e), i8();
  }) });
  return e;
}
var xt2 = class xt3 {
  constructor() {
    this._toDispose = /* @__PURE__ */ new Set();
    this._isDisposed = false;
    Et(this);
  }
  dispose() {
    this._isDisposed || (yt(this), this._isDisposed = true, this.clear());
  }
  get isDisposed() {
    return this._isDisposed;
  }
  clear() {
    if (this._toDispose.size !== 0) try {
      un3(this._toDispose);
    } finally {
      this._toDispose.clear();
    }
  }
  add(e) {
    if (!e) return e;
    if (e === this) throw new Error("Cannot register a disposable on itself!");
    return Qe(e, this), this._isDisposed ? xt3.DISABLE_DISPOSED_WARNING || console.warn(new Error("Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!").stack) : this._toDispose.add(e), e;
  }
  delete(e) {
    if (e) {
      if (e === this) throw new Error("Cannot dispose a disposable on itself!");
      this._toDispose.delete(e), e.dispose();
    }
  }
  deleteAndLeak(e) {
    e && this._toDispose.has(e) && (this._toDispose.delete(e), Qe(e, null));
  }
};
xt2.DISABLE_DISPOSED_WARNING = false;
var fe2 = xt2;
var B3 = class {
  constructor() {
    this._store = new fe2();
    Et(this), Qe(this._store, this);
  }
  dispose() {
    yt(this), this._store.dispose();
  }
  _register(e) {
    if (e === this) throw new Error("Cannot register a disposable on itself!");
    return this._store.add(e);
  }
};
B3.None = Object.freeze({ dispose() {
} });
var be2 = class {
  constructor() {
    this._isDisposed = false;
    Et(this);
  }
  get value() {
    return this._isDisposed ? void 0 : this._value;
  }
  set value(e) {
    this._isDisposed || e === this._value || (this._value?.dispose(), e && Qe(e, this), this._value = e);
  }
  clear() {
    this.value = void 0;
  }
  dispose() {
    this._isDisposed = true, yt(this), this._value?.dispose(), this._value = void 0;
  }
  clearAndLeak() {
    let e = this._value;
    return this._value = void 0, e && Qe(e, null), e;
  }
};
var Lt2 = typeof process < "u" && "title" in process;
var Ze2 = Lt2 ? "node" : navigator.userAgent;
var bi2 = Lt2 ? "node" : navigator.platform;
var cn2 = Ze2.includes("Firefox");
var dn2 = Ze2.includes("Edge");
var vi2 = /^((?!chrome|android).)*safari/i.test(Ze2);
function hn2() {
  if (!vi2) return 0;
  let i8 = Ze2.match(/Version\/(\d+)/);
  return i8 === null || i8.length < 2 ? 0 : parseInt(i8[1]);
}
var oo2 = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"].includes(bi2);
var ao2 = ["Windows", "Win16", "Win32", "WinCE"].includes(bi2);
var lo2 = bi2.indexOf("Linux") >= 0;
var uo = /\bCrOS\b/.test(Ze2);
var pn2 = "";
var K3 = 0;
var V = 0;
var C2 = 0;
var U2 = 0;
var Z = { css: "#00000000", rgba: 0 };
var X2;
((n) => {
  function i8(s15, o2, r, a) {
    return a !== void 0 ? `#${Oe(s15)}${Oe(o2)}${Oe(r)}${Oe(a)}` : `#${Oe(s15)}${Oe(o2)}${Oe(r)}`;
  }
  n.toCss = i8;
  function e(s15, o2, r, a = 255) {
    return (s15 << 24 | o2 << 16 | r << 8 | a) >>> 0;
  }
  n.toRgba = e;
  function t(s15, o2, r, a) {
    return { css: n.toCss(s15, o2, r, a), rgba: n.toRgba(s15, o2, r, a) };
  }
  n.toColor = t;
})(X2 || (X2 = {}));
var Ue2;
((a) => {
  function i8(l, u) {
    if (U2 = (u.rgba & 255) / 255, U2 === 1) return { css: u.css, rgba: u.rgba };
    let c = u.rgba >> 24 & 255, d = u.rgba >> 16 & 255, h2 = u.rgba >> 8 & 255, f = l.rgba >> 24 & 255, I = l.rgba >> 16 & 255, L2 = l.rgba >> 8 & 255;
    K3 = f + Math.round((c - f) * U2), V = I + Math.round((d - I) * U2), C2 = L2 + Math.round((h2 - L2) * U2);
    let M2 = X2.toCss(K3, V, C2), q2 = X2.toRgba(K3, V, C2);
    return { css: M2, rgba: q2 };
  }
  a.blend = i8;
  function e(l) {
    return (l.rgba & 255) === 255;
  }
  a.isOpaque = e;
  function t(l, u, c) {
    let d = Te2.ensureContrastRatio(l.rgba, u.rgba, c);
    if (d) return X2.toColor(d >> 24 & 255, d >> 16 & 255, d >> 8 & 255);
  }
  a.ensureContrastRatio = t;
  function n(l) {
    let u = (l.rgba | 255) >>> 0;
    return [K3, V, C2] = Te2.toChannels(u), { css: X2.toCss(K3, V, C2), rgba: u };
  }
  a.opaque = n;
  function s15(l, u) {
    return U2 = Math.round(u * 255), [K3, V, C2] = Te2.toChannels(l.rgba), { css: X2.toCss(K3, V, C2, U2), rgba: X2.toRgba(K3, V, C2, U2) };
  }
  a.opacity = s15;
  function o2(l, u) {
    return U2 = l.rgba & 255, s15(l, U2 * u / 255);
  }
  a.multiplyOpacity = o2;
  function r(l) {
    return [l.rgba >> 24 & 255, l.rgba >> 16 & 255, l.rgba >> 8 & 255];
  }
  a.toColorRGB = r;
})(Ue2 || (Ue2 = {}));
var Fr2;
((n) => {
  let i8, e;
  try {
    let s15 = document.createElement("canvas");
    s15.width = 1, s15.height = 1;
    let o2 = s15.getContext("2d", { willReadFrequently: true });
    o2 && (i8 = o2, i8.globalCompositeOperation = "copy", e = i8.createLinearGradient(0, 0, 1, 1));
  } catch {
  }
  function t(s15) {
    if (s15.match(/#[\da-f]{3,8}/i)) switch (s15.length) {
      case 4:
        return K3 = parseInt(s15.slice(1, 2).repeat(2), 16), V = parseInt(s15.slice(2, 3).repeat(2), 16), C2 = parseInt(s15.slice(3, 4).repeat(2), 16), X2.toColor(K3, V, C2);
      case 5:
        return K3 = parseInt(s15.slice(1, 2).repeat(2), 16), V = parseInt(s15.slice(2, 3).repeat(2), 16), C2 = parseInt(s15.slice(3, 4).repeat(2), 16), U2 = parseInt(s15.slice(4, 5).repeat(2), 16), X2.toColor(K3, V, C2, U2);
      case 7:
        return { css: s15, rgba: (parseInt(s15.slice(1), 16) << 8 | 255) >>> 0 };
      case 9:
        return { css: s15, rgba: parseInt(s15.slice(1), 16) >>> 0 };
    }
    let o2 = s15.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(0|1|\d?\.(\d+))\s*)?\)/);
    if (o2) return K3 = parseInt(o2[1]), V = parseInt(o2[2]), C2 = parseInt(o2[3]), U2 = Math.round((o2[5] === void 0 ? 1 : parseFloat(o2[5])) * 255), X2.toColor(K3, V, C2, U2);
    if (!i8 || !e) throw new Error("css.toColor: Unsupported css format");
    if (i8.fillStyle = e, i8.fillStyle = s15, typeof i8.fillStyle != "string") throw new Error("css.toColor: Unsupported css format");
    if (i8.fillRect(0, 0, 1, 1), [K3, V, C2, U2] = i8.getImageData(0, 0, 1, 1).data, U2 !== 255) throw new Error("css.toColor: Unsupported css format");
    return { rgba: X2.toRgba(K3, V, C2, U2), css: s15 };
  }
  n.toColor = t;
})(Fr2 || (Fr2 = {}));
var Y3;
((t) => {
  function i8(n) {
    return e(n >> 16 & 255, n >> 8 & 255, n & 255);
  }
  t.relativeLuminance = i8;
  function e(n, s15, o2) {
    let r = n / 255, a = s15 / 255, l = o2 / 255, u = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4), c = a <= 0.03928 ? a / 12.92 : Math.pow((a + 0.055) / 1.055, 2.4), d = l <= 0.03928 ? l / 12.92 : Math.pow((l + 0.055) / 1.055, 2.4);
    return u * 0.2126 + c * 0.7152 + d * 0.0722;
  }
  t.relativeLuminance2 = e;
})(Y3 || (Y3 = {}));
var Te2;
((o2) => {
  function i8(r, a) {
    if (U2 = (a & 255) / 255, U2 === 1) return a;
    let l = a >> 24 & 255, u = a >> 16 & 255, c = a >> 8 & 255, d = r >> 24 & 255, h2 = r >> 16 & 255, f = r >> 8 & 255;
    return K3 = d + Math.round((l - d) * U2), V = h2 + Math.round((u - h2) * U2), C2 = f + Math.round((c - f) * U2), X2.toRgba(K3, V, C2);
  }
  o2.blend = i8;
  function e(r, a, l) {
    let u = Y3.relativeLuminance(r >> 8), c = Y3.relativeLuminance(a >> 8);
    if (ve2(u, c) < l) {
      if (c < u) {
        let I = t(r, a, l), L2 = ve2(u, Y3.relativeLuminance(I >> 8));
        if (L2 < l) {
          let M2 = n(r, a, l), q2 = ve2(u, Y3.relativeLuminance(M2 >> 8));
          return L2 > q2 ? I : M2;
        }
        return I;
      }
      let h2 = n(r, a, l), f = ve2(u, Y3.relativeLuminance(h2 >> 8));
      if (f < l) {
        let I = t(r, a, l), L2 = ve2(u, Y3.relativeLuminance(I >> 8));
        return f > L2 ? h2 : I;
      }
      return h2;
    }
  }
  o2.ensureContrastRatio = e;
  function t(r, a, l) {
    let u = r >> 24 & 255, c = r >> 16 & 255, d = r >> 8 & 255, h2 = a >> 24 & 255, f = a >> 16 & 255, I = a >> 8 & 255, L2 = ve2(Y3.relativeLuminance2(h2, f, I), Y3.relativeLuminance2(u, c, d));
    for (; L2 < l && (h2 > 0 || f > 0 || I > 0); ) h2 -= Math.max(0, Math.ceil(h2 * 0.1)), f -= Math.max(0, Math.ceil(f * 0.1)), I -= Math.max(0, Math.ceil(I * 0.1)), L2 = ve2(Y3.relativeLuminance2(h2, f, I), Y3.relativeLuminance2(u, c, d));
    return (h2 << 24 | f << 16 | I << 8 | 255) >>> 0;
  }
  o2.reduceLuminance = t;
  function n(r, a, l) {
    let u = r >> 24 & 255, c = r >> 16 & 255, d = r >> 8 & 255, h2 = a >> 24 & 255, f = a >> 16 & 255, I = a >> 8 & 255, L2 = ve2(Y3.relativeLuminance2(h2, f, I), Y3.relativeLuminance2(u, c, d));
    for (; L2 < l && (h2 < 255 || f < 255 || I < 255); ) h2 = Math.min(255, h2 + Math.ceil((255 - h2) * 0.1)), f = Math.min(255, f + Math.ceil((255 - f) * 0.1)), I = Math.min(255, I + Math.ceil((255 - I) * 0.1)), L2 = ve2(Y3.relativeLuminance2(h2, f, I), Y3.relativeLuminance2(u, c, d));
    return (h2 << 24 | f << 16 | I << 8 | 255) >>> 0;
  }
  o2.increaseLuminance = n;
  function s15(r) {
    return [r >> 24 & 255, r >> 16 & 255, r >> 8 & 255, r & 255];
  }
  o2.toChannels = s15;
})(Te2 || (Te2 = {}));
function Oe(i8) {
  let e = i8.toString(16);
  return e.length < 2 ? "0" + e : e;
}
function ve2(i8, e) {
  return i8 < e ? (e + 0.05) / (i8 + 0.05) : (i8 + 0.05) / (e + 0.05);
}
function F2(i8) {
  if (!i8) throw new Error("value must not be falsy");
  return i8;
}
function Rt2(i8) {
  return 57508 <= i8 && i8 <= 57558;
}
function fn2(i8) {
  return 57520 <= i8 && i8 <= 57527;
}
function kr2(i8) {
  return 57344 <= i8 && i8 <= 63743;
}
function Pr2(i8) {
  return 9472 <= i8 && i8 <= 9631;
}
function Br2(i8) {
  return i8 >= 128512 && i8 <= 128591 || i8 >= 127744 && i8 <= 128511 || i8 >= 128640 && i8 <= 128767 || i8 >= 9728 && i8 <= 9983 || i8 >= 9984 && i8 <= 10175 || i8 >= 65024 && i8 <= 65039 || i8 >= 129280 && i8 <= 129535 || i8 >= 127462 && i8 <= 127487;
}
function mn2(i8, e, t, n) {
  return e === 1 && t > Math.ceil(n * 1.5) && i8 !== void 0 && i8 > 255 && !Br2(i8) && !Rt2(i8) && !kr2(i8);
}
function Dt2(i8) {
  return Rt2(i8) || Pr2(i8);
}
function _n2() {
  return { css: { canvas: wt2(), cell: wt2() }, device: { canvas: wt2(), cell: wt2(), char: { width: 0, height: 0, left: 0, top: 0 } } };
}
function wt2() {
  return { width: 0, height: 0 };
}
function bn2(i8, e, t = 0) {
  return (i8 - (Math.round(e) * 2 - t)) % (Math.round(e) * 2);
}
var j2 = 0;
var z2 = 0;
var me = false;
var ge2 = false;
var Mt3 = false;
var J2;
var Ti2 = 0;
var At3 = class {
  constructor(e, t, n, s15, o2, r) {
    this._terminal = e;
    this._optionService = t;
    this._selectionRenderModel = n;
    this._decorationService = s15;
    this._coreBrowserService = o2;
    this._themeService = r;
    this.result = { fg: 0, bg: 0, ext: 0 };
  }
  resolve(e, t, n, s15) {
    if (this.result.bg = e.bg, this.result.fg = e.fg, this.result.ext = e.bg & 268435456 ? e.extended.ext : 0, z2 = 0, j2 = 0, ge2 = false, me = false, Mt3 = false, J2 = this._themeService.colors, Ti2 = 0, e.getCode() !== 0 && e.extended.underlineStyle === 4) {
      let r = Math.max(1, Math.floor(this._optionService.rawOptions.fontSize * this._coreBrowserService.dpr / 15));
      Ti2 = t * s15 % (Math.round(r) * 2);
    }
    if (this._decorationService.forEachDecorationAtCell(t, n, "bottom", (r) => {
      r.backgroundColorRGB && (z2 = r.backgroundColorRGB.rgba >> 8 & 16777215, ge2 = true), r.foregroundColorRGB && (j2 = r.foregroundColorRGB.rgba >> 8 & 16777215, me = true);
    }), Mt3 = this._selectionRenderModel.isCellSelected(this._terminal, t, n), Mt3) {
      if (this.result.fg & 67108864 || (this.result.bg & 50331648) !== 0) {
        if (this.result.fg & 67108864) switch (this.result.fg & 50331648) {
          case 16777216:
          case 33554432:
            z2 = this._themeService.colors.ansi[this.result.fg & 255].rgba;
            break;
          case 50331648:
            z2 = (this.result.fg & 16777215) << 8 | 255;
            break;
          case 0:
          default:
            z2 = this._themeService.colors.foreground.rgba;
        }
        else switch (this.result.bg & 50331648) {
          case 16777216:
          case 33554432:
            z2 = this._themeService.colors.ansi[this.result.bg & 255].rgba;
            break;
          case 50331648:
            z2 = (this.result.bg & 16777215) << 8 | 255;
            break;
        }
        z2 = Te2.blend(z2, (this._coreBrowserService.isFocused ? J2.selectionBackgroundOpaque : J2.selectionInactiveBackgroundOpaque).rgba & 4294967040 | 128) >> 8 & 16777215;
      } else z2 = (this._coreBrowserService.isFocused ? J2.selectionBackgroundOpaque : J2.selectionInactiveBackgroundOpaque).rgba >> 8 & 16777215;
      if (ge2 = true, J2.selectionForeground && (j2 = J2.selectionForeground.rgba >> 8 & 16777215, me = true), Dt2(e.getCode())) {
        if (this.result.fg & 67108864 && (this.result.bg & 50331648) === 0) j2 = (this._coreBrowserService.isFocused ? J2.selectionBackgroundOpaque : J2.selectionInactiveBackgroundOpaque).rgba >> 8 & 16777215;
        else {
          if (this.result.fg & 67108864) switch (this.result.bg & 50331648) {
            case 16777216:
            case 33554432:
              j2 = this._themeService.colors.ansi[this.result.bg & 255].rgba;
              break;
            case 50331648:
              j2 = (this.result.bg & 16777215) << 8 | 255;
              break;
          }
          else switch (this.result.fg & 50331648) {
            case 16777216:
            case 33554432:
              j2 = this._themeService.colors.ansi[this.result.fg & 255].rgba;
              break;
            case 50331648:
              j2 = (this.result.fg & 16777215) << 8 | 255;
              break;
            case 0:
            default:
              j2 = this._themeService.colors.foreground.rgba;
          }
          j2 = Te2.blend(j2, (this._coreBrowserService.isFocused ? J2.selectionBackgroundOpaque : J2.selectionInactiveBackgroundOpaque).rgba & 4294967040 | 128) >> 8 & 16777215;
        }
        me = true;
      }
    }
    this._decorationService.forEachDecorationAtCell(t, n, "top", (r) => {
      r.backgroundColorRGB && (z2 = r.backgroundColorRGB.rgba >> 8 & 16777215, ge2 = true), r.foregroundColorRGB && (j2 = r.foregroundColorRGB.rgba >> 8 & 16777215, me = true);
    }), ge2 && (Mt3 ? z2 = e.bg & -16777216 & -134217729 | z2 | 50331648 : z2 = e.bg & -16777216 | z2 | 50331648), me && (j2 = e.fg & -16777216 & -67108865 | j2 | 50331648), this.result.fg & 67108864 && (ge2 && !me && ((this.result.bg & 50331648) === 0 ? j2 = this.result.fg & -134217728 | J2.background.rgba >> 8 & 16777215 & 16777215 | 50331648 : j2 = this.result.fg & -134217728 | this.result.bg & 67108863, me = true), !ge2 && me && ((this.result.fg & 50331648) === 0 ? z2 = this.result.bg & -67108864 | J2.foreground.rgba >> 8 & 16777215 & 16777215 | 50331648 : z2 = this.result.bg & -67108864 | this.result.fg & 67108863, ge2 = true)), J2 = void 0, this.result.bg = ge2 ? z2 : this.result.bg, this.result.fg = me ? j2 : this.result.fg, this.result.ext &= 536870911, this.result.ext |= Ti2 << 29 & 3758096384;
  }
};
var gn2 = 0.5;
var St2 = cn2 || dn2 ? "bottom" : "ideographic";
var Hr = { "\u2580": [{ x: 0, y: 0, w: 8, h: 4 }], "\u2581": [{ x: 0, y: 7, w: 8, h: 1 }], "\u2582": [{ x: 0, y: 6, w: 8, h: 2 }], "\u2583": [{ x: 0, y: 5, w: 8, h: 3 }], "\u2584": [{ x: 0, y: 4, w: 8, h: 4 }], "\u2585": [{ x: 0, y: 3, w: 8, h: 5 }], "\u2586": [{ x: 0, y: 2, w: 8, h: 6 }], "\u2587": [{ x: 0, y: 1, w: 8, h: 7 }], "\u2588": [{ x: 0, y: 0, w: 8, h: 8 }], "\u2589": [{ x: 0, y: 0, w: 7, h: 8 }], "\u258A": [{ x: 0, y: 0, w: 6, h: 8 }], "\u258B": [{ x: 0, y: 0, w: 5, h: 8 }], "\u258C": [{ x: 0, y: 0, w: 4, h: 8 }], "\u258D": [{ x: 0, y: 0, w: 3, h: 8 }], "\u258E": [{ x: 0, y: 0, w: 2, h: 8 }], "\u258F": [{ x: 0, y: 0, w: 1, h: 8 }], "\u2590": [{ x: 4, y: 0, w: 4, h: 8 }], "\u2594": [{ x: 0, y: 0, w: 8, h: 1 }], "\u2595": [{ x: 7, y: 0, w: 1, h: 8 }], "\u2596": [{ x: 0, y: 4, w: 4, h: 4 }], "\u2597": [{ x: 4, y: 4, w: 4, h: 4 }], "\u2598": [{ x: 0, y: 0, w: 4, h: 4 }], "\u2599": [{ x: 0, y: 0, w: 4, h: 8 }, { x: 0, y: 4, w: 8, h: 4 }], "\u259A": [{ x: 0, y: 0, w: 4, h: 4 }, { x: 4, y: 4, w: 4, h: 4 }], "\u259B": [{ x: 0, y: 0, w: 4, h: 8 }, { x: 4, y: 0, w: 4, h: 4 }], "\u259C": [{ x: 0, y: 0, w: 8, h: 4 }, { x: 4, y: 0, w: 4, h: 8 }], "\u259D": [{ x: 4, y: 0, w: 4, h: 4 }], "\u259E": [{ x: 4, y: 0, w: 4, h: 4 }, { x: 0, y: 4, w: 4, h: 4 }], "\u259F": [{ x: 4, y: 0, w: 4, h: 8 }, { x: 0, y: 4, w: 8, h: 4 }], "\u{1FB70}": [{ x: 1, y: 0, w: 1, h: 8 }], "\u{1FB71}": [{ x: 2, y: 0, w: 1, h: 8 }], "\u{1FB72}": [{ x: 3, y: 0, w: 1, h: 8 }], "\u{1FB73}": [{ x: 4, y: 0, w: 1, h: 8 }], "\u{1FB74}": [{ x: 5, y: 0, w: 1, h: 8 }], "\u{1FB75}": [{ x: 6, y: 0, w: 1, h: 8 }], "\u{1FB76}": [{ x: 0, y: 1, w: 8, h: 1 }], "\u{1FB77}": [{ x: 0, y: 2, w: 8, h: 1 }], "\u{1FB78}": [{ x: 0, y: 3, w: 8, h: 1 }], "\u{1FB79}": [{ x: 0, y: 4, w: 8, h: 1 }], "\u{1FB7A}": [{ x: 0, y: 5, w: 8, h: 1 }], "\u{1FB7B}": [{ x: 0, y: 6, w: 8, h: 1 }], "\u{1FB7C}": [{ x: 0, y: 0, w: 1, h: 8 }, { x: 0, y: 7, w: 8, h: 1 }], "\u{1FB7D}": [{ x: 0, y: 0, w: 1, h: 8 }, { x: 0, y: 0, w: 8, h: 1 }], "\u{1FB7E}": [{ x: 7, y: 0, w: 1, h: 8 }, { x: 0, y: 0, w: 8, h: 1 }], "\u{1FB7F}": [{ x: 7, y: 0, w: 1, h: 8 }, { x: 0, y: 7, w: 8, h: 1 }], "\u{1FB80}": [{ x: 0, y: 0, w: 8, h: 1 }, { x: 0, y: 7, w: 8, h: 1 }], "\u{1FB81}": [{ x: 0, y: 0, w: 8, h: 1 }, { x: 0, y: 2, w: 8, h: 1 }, { x: 0, y: 4, w: 8, h: 1 }, { x: 0, y: 7, w: 8, h: 1 }], "\u{1FB82}": [{ x: 0, y: 0, w: 8, h: 2 }], "\u{1FB83}": [{ x: 0, y: 0, w: 8, h: 3 }], "\u{1FB84}": [{ x: 0, y: 0, w: 8, h: 5 }], "\u{1FB85}": [{ x: 0, y: 0, w: 8, h: 6 }], "\u{1FB86}": [{ x: 0, y: 0, w: 8, h: 7 }], "\u{1FB87}": [{ x: 6, y: 0, w: 2, h: 8 }], "\u{1FB88}": [{ x: 5, y: 0, w: 3, h: 8 }], "\u{1FB89}": [{ x: 3, y: 0, w: 5, h: 8 }], "\u{1FB8A}": [{ x: 2, y: 0, w: 6, h: 8 }], "\u{1FB8B}": [{ x: 1, y: 0, w: 7, h: 8 }], "\u{1FB95}": [{ x: 0, y: 0, w: 2, h: 2 }, { x: 4, y: 0, w: 2, h: 2 }, { x: 2, y: 2, w: 2, h: 2 }, { x: 6, y: 2, w: 2, h: 2 }, { x: 0, y: 4, w: 2, h: 2 }, { x: 4, y: 4, w: 2, h: 2 }, { x: 2, y: 6, w: 2, h: 2 }, { x: 6, y: 6, w: 2, h: 2 }], "\u{1FB96}": [{ x: 2, y: 0, w: 2, h: 2 }, { x: 6, y: 0, w: 2, h: 2 }, { x: 0, y: 2, w: 2, h: 2 }, { x: 4, y: 2, w: 2, h: 2 }, { x: 2, y: 4, w: 2, h: 2 }, { x: 6, y: 4, w: 2, h: 2 }, { x: 0, y: 6, w: 2, h: 2 }, { x: 4, y: 6, w: 2, h: 2 }], "\u{1FB97}": [{ x: 0, y: 2, w: 8, h: 2 }, { x: 0, y: 6, w: 8, h: 2 }] };
var Wr2 = { "\u2591": [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 0]], "\u2592": [[1, 0], [0, 0], [0, 1], [0, 0]], "\u2593": [[0, 1], [1, 1], [1, 0], [1, 1]] };
var Gr2 = { "\u2500": { 1: "M0,.5 L1,.5" }, "\u2501": { 3: "M0,.5 L1,.5" }, "\u2502": { 1: "M.5,0 L.5,1" }, "\u2503": { 3: "M.5,0 L.5,1" }, "\u250C": { 1: "M0.5,1 L.5,.5 L1,.5" }, "\u250F": { 3: "M0.5,1 L.5,.5 L1,.5" }, "\u2510": { 1: "M0,.5 L.5,.5 L.5,1" }, "\u2513": { 3: "M0,.5 L.5,.5 L.5,1" }, "\u2514": { 1: "M.5,0 L.5,.5 L1,.5" }, "\u2517": { 3: "M.5,0 L.5,.5 L1,.5" }, "\u2518": { 1: "M.5,0 L.5,.5 L0,.5" }, "\u251B": { 3: "M.5,0 L.5,.5 L0,.5" }, "\u251C": { 1: "M.5,0 L.5,1 M.5,.5 L1,.5" }, "\u2523": { 3: "M.5,0 L.5,1 M.5,.5 L1,.5" }, "\u2524": { 1: "M.5,0 L.5,1 M.5,.5 L0,.5" }, "\u252B": { 3: "M.5,0 L.5,1 M.5,.5 L0,.5" }, "\u252C": { 1: "M0,.5 L1,.5 M.5,.5 L.5,1" }, "\u2533": { 3: "M0,.5 L1,.5 M.5,.5 L.5,1" }, "\u2534": { 1: "M0,.5 L1,.5 M.5,.5 L.5,0" }, "\u253B": { 3: "M0,.5 L1,.5 M.5,.5 L.5,0" }, "\u253C": { 1: "M0,.5 L1,.5 M.5,0 L.5,1" }, "\u254B": { 3: "M0,.5 L1,.5 M.5,0 L.5,1" }, "\u2574": { 1: "M.5,.5 L0,.5" }, "\u2578": { 3: "M.5,.5 L0,.5" }, "\u2575": { 1: "M.5,.5 L.5,0" }, "\u2579": { 3: "M.5,.5 L.5,0" }, "\u2576": { 1: "M.5,.5 L1,.5" }, "\u257A": { 3: "M.5,.5 L1,.5" }, "\u2577": { 1: "M.5,.5 L.5,1" }, "\u257B": { 3: "M.5,.5 L.5,1" }, "\u2550": { 1: (i8, e) => `M0,${0.5 - e} L1,${0.5 - e} M0,${0.5 + e} L1,${0.5 + e}` }, "\u2551": { 1: (i8, e) => `M${0.5 - i8},0 L${0.5 - i8},1 M${0.5 + i8},0 L${0.5 + i8},1` }, "\u2552": { 1: (i8, e) => `M.5,1 L.5,${0.5 - e} L1,${0.5 - e} M.5,${0.5 + e} L1,${0.5 + e}` }, "\u2553": { 1: (i8, e) => `M${0.5 - i8},1 L${0.5 - i8},.5 L1,.5 M${0.5 + i8},.5 L${0.5 + i8},1` }, "\u2554": { 1: (i8, e) => `M1,${0.5 - e} L${0.5 - i8},${0.5 - e} L${0.5 - i8},1 M1,${0.5 + e} L${0.5 + i8},${0.5 + e} L${0.5 + i8},1` }, "\u2555": { 1: (i8, e) => `M0,${0.5 - e} L.5,${0.5 - e} L.5,1 M0,${0.5 + e} L.5,${0.5 + e}` }, "\u2556": { 1: (i8, e) => `M${0.5 + i8},1 L${0.5 + i8},.5 L0,.5 M${0.5 - i8},.5 L${0.5 - i8},1` }, "\u2557": { 1: (i8, e) => `M0,${0.5 + e} L${0.5 - i8},${0.5 + e} L${0.5 - i8},1 M0,${0.5 - e} L${0.5 + i8},${0.5 - e} L${0.5 + i8},1` }, "\u2558": { 1: (i8, e) => `M.5,0 L.5,${0.5 + e} L1,${0.5 + e} M.5,${0.5 - e} L1,${0.5 - e}` }, "\u2559": { 1: (i8, e) => `M1,.5 L${0.5 - i8},.5 L${0.5 - i8},0 M${0.5 + i8},.5 L${0.5 + i8},0` }, "\u255A": { 1: (i8, e) => `M1,${0.5 - e} L${0.5 + i8},${0.5 - e} L${0.5 + i8},0 M1,${0.5 + e} L${0.5 - i8},${0.5 + e} L${0.5 - i8},0` }, "\u255B": { 1: (i8, e) => `M0,${0.5 + e} L.5,${0.5 + e} L.5,0 M0,${0.5 - e} L.5,${0.5 - e}` }, "\u255C": { 1: (i8, e) => `M0,.5 L${0.5 + i8},.5 L${0.5 + i8},0 M${0.5 - i8},.5 L${0.5 - i8},0` }, "\u255D": { 1: (i8, e) => `M0,${0.5 - e} L${0.5 - i8},${0.5 - e} L${0.5 - i8},0 M0,${0.5 + e} L${0.5 + i8},${0.5 + e} L${0.5 + i8},0` }, "\u255E": { 1: (i8, e) => `M.5,0 L.5,1 M.5,${0.5 - e} L1,${0.5 - e} M.5,${0.5 + e} L1,${0.5 + e}` }, "\u255F": { 1: (i8, e) => `M${0.5 - i8},0 L${0.5 - i8},1 M${0.5 + i8},0 L${0.5 + i8},1 M${0.5 + i8},.5 L1,.5` }, "\u2560": { 1: (i8, e) => `M${0.5 - i8},0 L${0.5 - i8},1 M1,${0.5 + e} L${0.5 + i8},${0.5 + e} L${0.5 + i8},1 M1,${0.5 - e} L${0.5 + i8},${0.5 - e} L${0.5 + i8},0` }, "\u2561": { 1: (i8, e) => `M.5,0 L.5,1 M0,${0.5 - e} L.5,${0.5 - e} M0,${0.5 + e} L.5,${0.5 + e}` }, "\u2562": { 1: (i8, e) => `M0,.5 L${0.5 - i8},.5 M${0.5 - i8},0 L${0.5 - i8},1 M${0.5 + i8},0 L${0.5 + i8},1` }, "\u2563": { 1: (i8, e) => `M${0.5 + i8},0 L${0.5 + i8},1 M0,${0.5 + e} L${0.5 - i8},${0.5 + e} L${0.5 - i8},1 M0,${0.5 - e} L${0.5 - i8},${0.5 - e} L${0.5 - i8},0` }, "\u2564": { 1: (i8, e) => `M0,${0.5 - e} L1,${0.5 - e} M0,${0.5 + e} L1,${0.5 + e} M.5,${0.5 + e} L.5,1` }, "\u2565": { 1: (i8, e) => `M0,.5 L1,.5 M${0.5 - i8},.5 L${0.5 - i8},1 M${0.5 + i8},.5 L${0.5 + i8},1` }, "\u2566": { 1: (i8, e) => `M0,${0.5 - e} L1,${0.5 - e} M0,${0.5 + e} L${0.5 - i8},${0.5 + e} L${0.5 - i8},1 M1,${0.5 + e} L${0.5 + i8},${0.5 + e} L${0.5 + i8},1` }, "\u2567": { 1: (i8, e) => `M.5,0 L.5,${0.5 - e} M0,${0.5 - e} L1,${0.5 - e} M0,${0.5 + e} L1,${0.5 + e}` }, "\u2568": { 1: (i8, e) => `M0,.5 L1,.5 M${0.5 - i8},.5 L${0.5 - i8},0 M${0.5 + i8},.5 L${0.5 + i8},0` }, "\u2569": { 1: (i8, e) => `M0,${0.5 + e} L1,${0.5 + e} M0,${0.5 - e} L${0.5 - i8},${0.5 - e} L${0.5 - i8},0 M1,${0.5 - e} L${0.5 + i8},${0.5 - e} L${0.5 + i8},0` }, "\u256A": { 1: (i8, e) => `M.5,0 L.5,1 M0,${0.5 - e} L1,${0.5 - e} M0,${0.5 + e} L1,${0.5 + e}` }, "\u256B": { 1: (i8, e) => `M0,.5 L1,.5 M${0.5 - i8},0 L${0.5 - i8},1 M${0.5 + i8},0 L${0.5 + i8},1` }, "\u256C": { 1: (i8, e) => `M0,${0.5 + e} L${0.5 - i8},${0.5 + e} L${0.5 - i8},1 M1,${0.5 + e} L${0.5 + i8},${0.5 + e} L${0.5 + i8},1 M0,${0.5 - e} L${0.5 - i8},${0.5 - e} L${0.5 - i8},0 M1,${0.5 - e} L${0.5 + i8},${0.5 - e} L${0.5 + i8},0` }, "\u2571": { 1: "M1,0 L0,1" }, "\u2572": { 1: "M0,0 L1,1" }, "\u2573": { 1: "M1,0 L0,1 M0,0 L1,1" }, "\u257C": { 1: "M.5,.5 L0,.5", 3: "M.5,.5 L1,.5" }, "\u257D": { 1: "M.5,.5 L.5,0", 3: "M.5,.5 L.5,1" }, "\u257E": { 1: "M.5,.5 L1,.5", 3: "M.5,.5 L0,.5" }, "\u257F": { 1: "M.5,.5 L.5,1", 3: "M.5,.5 L.5,0" }, "\u250D": { 1: "M.5,.5 L.5,1", 3: "M.5,.5 L1,.5" }, "\u250E": { 1: "M.5,.5 L1,.5", 3: "M.5,.5 L.5,1" }, "\u2511": { 1: "M.5,.5 L.5,1", 3: "M.5,.5 L0,.5" }, "\u2512": { 1: "M.5,.5 L0,.5", 3: "M.5,.5 L.5,1" }, "\u2515": { 1: "M.5,.5 L.5,0", 3: "M.5,.5 L1,.5" }, "\u2516": { 1: "M.5,.5 L1,.5", 3: "M.5,.5 L.5,0" }, "\u2519": { 1: "M.5,.5 L.5,0", 3: "M.5,.5 L0,.5" }, "\u251A": { 1: "M.5,.5 L0,.5", 3: "M.5,.5 L.5,0" }, "\u251D": { 1: "M.5,0 L.5,1", 3: "M.5,.5 L1,.5" }, "\u251E": { 1: "M0.5,1 L.5,.5 L1,.5", 3: "M.5,.5 L.5,0" }, "\u251F": { 1: "M.5,0 L.5,.5 L1,.5", 3: "M.5,.5 L.5,1" }, "\u2520": { 1: "M.5,.5 L1,.5", 3: "M.5,0 L.5,1" }, "\u2521": { 1: "M.5,.5 L.5,1", 3: "M.5,0 L.5,.5 L1,.5" }, "\u2522": { 1: "M.5,.5 L.5,0", 3: "M0.5,1 L.5,.5 L1,.5" }, "\u2525": { 1: "M.5,0 L.5,1", 3: "M.5,.5 L0,.5" }, "\u2526": { 1: "M0,.5 L.5,.5 L.5,1", 3: "M.5,.5 L.5,0" }, "\u2527": { 1: "M.5,0 L.5,.5 L0,.5", 3: "M.5,.5 L.5,1" }, "\u2528": { 1: "M.5,.5 L0,.5", 3: "M.5,0 L.5,1" }, "\u2529": { 1: "M.5,.5 L.5,1", 3: "M.5,0 L.5,.5 L0,.5" }, "\u252A": { 1: "M.5,.5 L.5,0", 3: "M0,.5 L.5,.5 L.5,1" }, "\u252D": { 1: "M0.5,1 L.5,.5 L1,.5", 3: "M.5,.5 L0,.5" }, "\u252E": { 1: "M0,.5 L.5,.5 L.5,1", 3: "M.5,.5 L1,.5" }, "\u252F": { 1: "M.5,.5 L.5,1", 3: "M0,.5 L1,.5" }, "\u2530": { 1: "M0,.5 L1,.5", 3: "M.5,.5 L.5,1" }, "\u2531": { 1: "M.5,.5 L1,.5", 3: "M0,.5 L.5,.5 L.5,1" }, "\u2532": { 1: "M.5,.5 L0,.5", 3: "M0.5,1 L.5,.5 L1,.5" }, "\u2535": { 1: "M.5,0 L.5,.5 L1,.5", 3: "M.5,.5 L0,.5" }, "\u2536": { 1: "M.5,0 L.5,.5 L0,.5", 3: "M.5,.5 L1,.5" }, "\u2537": { 1: "M.5,.5 L.5,0", 3: "M0,.5 L1,.5" }, "\u2538": { 1: "M0,.5 L1,.5", 3: "M.5,.5 L.5,0" }, "\u2539": { 1: "M.5,.5 L1,.5", 3: "M.5,0 L.5,.5 L0,.5" }, "\u253A": { 1: "M.5,.5 L0,.5", 3: "M.5,0 L.5,.5 L1,.5" }, "\u253D": { 1: "M.5,0 L.5,1 M.5,.5 L1,.5", 3: "M.5,.5 L0,.5" }, "\u253E": { 1: "M.5,0 L.5,1 M.5,.5 L0,.5", 3: "M.5,.5 L1,.5" }, "\u253F": { 1: "M.5,0 L.5,1", 3: "M0,.5 L1,.5" }, "\u2540": { 1: "M0,.5 L1,.5 M.5,.5 L.5,1", 3: "M.5,.5 L.5,0" }, "\u2541": { 1: "M.5,.5 L.5,0 M0,.5 L1,.5", 3: "M.5,.5 L.5,1" }, "\u2542": { 1: "M0,.5 L1,.5", 3: "M.5,0 L.5,1" }, "\u2543": { 1: "M0.5,1 L.5,.5 L1,.5", 3: "M.5,0 L.5,.5 L0,.5" }, "\u2544": { 1: "M0,.5 L.5,.5 L.5,1", 3: "M.5,0 L.5,.5 L1,.5" }, "\u2545": { 1: "M.5,0 L.5,.5 L1,.5", 3: "M0,.5 L.5,.5 L.5,1" }, "\u2546": { 1: "M.5,0 L.5,.5 L0,.5", 3: "M0.5,1 L.5,.5 L1,.5" }, "\u2547": { 1: "M.5,.5 L.5,1", 3: "M.5,.5 L.5,0 M0,.5 L1,.5" }, "\u2548": { 1: "M.5,.5 L.5,0", 3: "M0,.5 L1,.5 M.5,.5 L.5,1" }, "\u2549": { 1: "M.5,.5 L1,.5", 3: "M.5,0 L.5,1 M.5,.5 L0,.5" }, "\u254A": { 1: "M.5,.5 L0,.5", 3: "M.5,0 L.5,1 M.5,.5 L1,.5" }, "\u254C": { 1: "M.1,.5 L.4,.5 M.6,.5 L.9,.5" }, "\u254D": { 3: "M.1,.5 L.4,.5 M.6,.5 L.9,.5" }, "\u2504": { 1: "M.0667,.5 L.2667,.5 M.4,.5 L.6,.5 M.7333,.5 L.9333,.5" }, "\u2505": { 3: "M.0667,.5 L.2667,.5 M.4,.5 L.6,.5 M.7333,.5 L.9333,.5" }, "\u2508": { 1: "M.05,.5 L.2,.5 M.3,.5 L.45,.5 M.55,.5 L.7,.5 M.8,.5 L.95,.5" }, "\u2509": { 3: "M.05,.5 L.2,.5 M.3,.5 L.45,.5 M.55,.5 L.7,.5 M.8,.5 L.95,.5" }, "\u254E": { 1: "M.5,.1 L.5,.4 M.5,.6 L.5,.9" }, "\u254F": { 3: "M.5,.1 L.5,.4 M.5,.6 L.5,.9" }, "\u2506": { 1: "M.5,.0667 L.5,.2667 M.5,.4 L.5,.6 M.5,.7333 L.5,.9333" }, "\u2507": { 3: "M.5,.0667 L.5,.2667 M.5,.4 L.5,.6 M.5,.7333 L.5,.9333" }, "\u250A": { 1: "M.5,.05 L.5,.2 M.5,.3 L.5,.45 L.5,.55 M.5,.7 L.5,.95" }, "\u250B": { 3: "M.5,.05 L.5,.2 M.5,.3 L.5,.45 L.5,.55 M.5,.7 L.5,.95" }, "\u256D": { 1: (i8, e) => `M.5,1 L.5,${0.5 + e / 0.15 * 0.5} C.5,${0.5 + e / 0.15 * 0.5},.5,.5,1,.5` }, "\u256E": { 1: (i8, e) => `M.5,1 L.5,${0.5 + e / 0.15 * 0.5} C.5,${0.5 + e / 0.15 * 0.5},.5,.5,0,.5` }, "\u256F": { 1: (i8, e) => `M.5,0 L.5,${0.5 - e / 0.15 * 0.5} C.5,${0.5 - e / 0.15 * 0.5},.5,.5,0,.5` }, "\u2570": { 1: (i8, e) => `M.5,0 L.5,${0.5 - e / 0.15 * 0.5} C.5,${0.5 - e / 0.15 * 0.5},.5,.5,1,.5` } };
var et = { "\uE0A0": { d: "M.3,1 L.03,1 L.03,.88 C.03,.82,.06,.78,.11,.73 C.15,.7,.2,.68,.28,.65 L.43,.6 C.49,.58,.53,.56,.56,.53 C.59,.5,.6,.47,.6,.43 L.6,.27 L.4,.27 L.69,.1 L.98,.27 L.78,.27 L.78,.46 C.78,.52,.76,.56,.72,.61 C.68,.66,.63,.67,.56,.7 L.48,.72 C.42,.74,.38,.76,.35,.78 C.32,.8,.31,.84,.31,.88 L.31,1 M.3,.5 L.03,.59 L.03,.09 L.3,.09 L.3,.655", type: 0 }, "\uE0A1": { d: "M.7,.4 L.7,.47 L.2,.47 L.2,.03 L.355,.03 L.355,.4 L.705,.4 M.7,.5 L.86,.5 L.86,.95 L.69,.95 L.44,.66 L.46,.86 L.46,.95 L.3,.95 L.3,.49 L.46,.49 L.71,.78 L.69,.565 L.69,.5", type: 0 }, "\uE0A2": { d: "M.25,.94 C.16,.94,.11,.92,.11,.87 L.11,.53 C.11,.48,.15,.455,.23,.45 L.23,.3 C.23,.25,.26,.22,.31,.19 C.36,.16,.43,.15,.51,.15 C.59,.15,.66,.16,.71,.19 C.77,.22,.79,.26,.79,.3 L.79,.45 C.87,.45,.91,.48,.91,.53 L.91,.87 C.91,.92,.86,.94,.77,.94 L.24,.94 M.53,.2 C.49,.2,.45,.21,.42,.23 C.39,.25,.38,.27,.38,.3 L.38,.45 L.68,.45 L.68,.3 C.68,.27,.67,.25,.64,.23 C.61,.21,.58,.2,.53,.2 M.58,.82 L.58,.66 C.63,.65,.65,.63,.65,.6 C.65,.58,.64,.57,.61,.56 C.58,.55,.56,.54,.52,.54 C.48,.54,.46,.55,.43,.56 C.4,.57,.39,.59,.39,.6 C.39,.63,.41,.64,.46,.66 L.46,.82 L.57,.82", type: 0 }, "\uE0B0": { d: "M0,0 L1,.5 L0,1", type: 0, rightPadding: 2 }, "\uE0B1": { d: "M-1,-.5 L1,.5 L-1,1.5", type: 1, leftPadding: 1, rightPadding: 1 }, "\uE0B2": { d: "M1,0 L0,.5 L1,1", type: 0, leftPadding: 2 }, "\uE0B3": { d: "M2,-.5 L0,.5 L2,1.5", type: 1, leftPadding: 1, rightPadding: 1 }, "\uE0B4": { d: "M0,0 L0,1 C0.552,1,1,0.776,1,.5 C1,0.224,0.552,0,0,0", type: 0, rightPadding: 1 }, "\uE0B5": { d: "M.2,1 C.422,1,.8,.826,.78,.5 C.8,.174,0.422,0,.2,0", type: 1, rightPadding: 1 }, "\uE0B6": { d: "M1,0 L1,1 C0.448,1,0,0.776,0,.5 C0,0.224,0.448,0,1,0", type: 0, leftPadding: 1 }, "\uE0B7": { d: "M.8,1 C0.578,1,0.2,.826,.22,.5 C0.2,0.174,0.578,0,0.8,0", type: 1, leftPadding: 1 }, "\uE0B8": { d: "M-.5,-.5 L1.5,1.5 L-.5,1.5", type: 0 }, "\uE0B9": { d: "M-.5,-.5 L1.5,1.5", type: 1, leftPadding: 1, rightPadding: 1 }, "\uE0BA": { d: "M1.5,-.5 L-.5,1.5 L1.5,1.5", type: 0 }, "\uE0BC": { d: "M1.5,-.5 L-.5,1.5 L-.5,-.5", type: 0 }, "\uE0BD": { d: "M1.5,-.5 L-.5,1.5", type: 1, leftPadding: 1, rightPadding: 1 }, "\uE0BE": { d: "M-.5,-.5 L1.5,1.5 L1.5,-.5", type: 0 } };
et["\uE0BB"] = et["\uE0BD"];
et["\uE0BF"] = et["\uE0B9"];
function yn2(i8, e, t, n, s15, o2, r, a) {
  let l = Hr[e];
  if (l) return $r2(i8, l, t, n, s15, o2), true;
  let u = Wr2[e];
  if (u) return Kr2(i8, u, t, n, s15, o2), true;
  let c = Gr2[e];
  if (c) return Vr2(i8, c, t, n, s15, o2, a), true;
  let d = et[e];
  return d ? (Cr3(i8, d, t, n, s15, o2, r, a), true) : false;
}
function $r2(i8, e, t, n, s15, o2) {
  for (let r = 0; r < e.length; r++) {
    let a = e[r], l = s15 / 8, u = o2 / 8;
    i8.fillRect(t + a.x * l, n + a.y * u, a.w * l, a.h * u);
  }
}
var xn2 = /* @__PURE__ */ new Map();
function Kr2(i8, e, t, n, s15, o2) {
  let r = xn2.get(e);
  r || (r = /* @__PURE__ */ new Map(), xn2.set(e, r));
  let a = i8.fillStyle;
  if (typeof a != "string") throw new Error(`Unexpected fillStyle type "${a}"`);
  let l = r.get(a);
  if (!l) {
    let u = e[0].length, c = e.length, d = i8.canvas.ownerDocument.createElement("canvas");
    d.width = u, d.height = c;
    let h2 = F2(d.getContext("2d")), f = new ImageData(u, c), I, L2, M2, q2;
    if (a.startsWith("#")) I = parseInt(a.slice(1, 3), 16), L2 = parseInt(a.slice(3, 5), 16), M2 = parseInt(a.slice(5, 7), 16), q2 = a.length > 7 && parseInt(a.slice(7, 9), 16) || 1;
    else if (a.startsWith("rgba")) [I, L2, M2, q2] = a.substring(5, a.length - 1).split(",").map((S2) => parseFloat(S2));
    else throw new Error(`Unexpected fillStyle color format "${a}" when drawing pattern glyph`);
    for (let S2 = 0; S2 < c; S2++) for (let W2 = 0; W2 < u; W2++) f.data[(S2 * u + W2) * 4] = I, f.data[(S2 * u + W2) * 4 + 1] = L2, f.data[(S2 * u + W2) * 4 + 2] = M2, f.data[(S2 * u + W2) * 4 + 3] = e[S2][W2] * (q2 * 255);
    h2.putImageData(f, 0, 0), l = F2(i8.createPattern(d, null)), r.set(a, l);
  }
  i8.fillStyle = l, i8.fillRect(t, n, s15, o2);
}
function Vr2(i8, e, t, n, s15, o2, r) {
  i8.strokeStyle = i8.fillStyle;
  for (let [a, l] of Object.entries(e)) {
    i8.beginPath(), i8.lineWidth = r * Number.parseInt(a);
    let u;
    if (typeof l == "function") {
      let d = 0.15 / o2 * s15;
      u = l(0.15, d);
    } else u = l;
    for (let c of u.split(" ")) {
      let d = c[0], h2 = In2[d];
      if (!h2) {
        console.error(`Could not find drawing instructions for "${d}"`);
        continue;
      }
      let f = c.substring(1).split(",");
      !f[0] || !f[1] || h2(i8, Ln2(f, s15, o2, t, n, true, r));
    }
    i8.stroke(), i8.closePath();
  }
}
function Cr3(i8, e, t, n, s15, o2, r, a) {
  let l = new Path2D();
  l.rect(t, n, s15, o2), i8.clip(l), i8.beginPath();
  let u = r / 12;
  i8.lineWidth = a * u;
  for (let c of e.d.split(" ")) {
    let d = c[0], h2 = In2[d];
    if (!h2) {
      console.error(`Could not find drawing instructions for "${d}"`);
      continue;
    }
    let f = c.substring(1).split(",");
    !f[0] || !f[1] || h2(i8, Ln2(f, s15, o2, t, n, false, a, (e.leftPadding ?? 0) * (u / 2), (e.rightPadding ?? 0) * (u / 2)));
  }
  e.type === 1 ? (i8.strokeStyle = i8.fillStyle, i8.stroke()) : i8.fill(), i8.closePath();
}
function En2(i8, e, t = 0) {
  return Math.max(Math.min(i8, e), t);
}
var In2 = { C: (i8, e) => i8.bezierCurveTo(e[0], e[1], e[2], e[3], e[4], e[5]), L: (i8, e) => i8.lineTo(e[0], e[1]), M: (i8, e) => i8.moveTo(e[0], e[1]) };
function Ln2(i8, e, t, n, s15, o2, r, a = 0, l = 0) {
  let u = i8.map((c) => parseFloat(c) || parseInt(c));
  if (u.length < 2) throw new Error("Too few arguments for instruction");
  for (let c = 0; c < u.length; c += 2) u[c] *= e - a * r - l * r, o2 && u[c] !== 0 && (u[c] = En2(Math.round(u[c] + 0.5) - 0.5, e, 0)), u[c] += n + a * r;
  for (let c = 1; c < u.length; c += 2) u[c] *= t, o2 && u[c] !== 0 && (u[c] = En2(Math.round(u[c] + 0.5) - 0.5, t, 0)), u[c] += s15;
  return u;
}
var Ot2 = class {
  constructor() {
    this._data = {};
  }
  set(e, t, n) {
    this._data[e] || (this._data[e] = {}), this._data[e][t] = n;
  }
  get(e, t) {
    return this._data[e] ? this._data[e][t] : void 0;
  }
  clear() {
    this._data = {};
  }
};
var tt = class {
  constructor() {
    this._data = new Ot2();
  }
  set(e, t, n, s15, o2) {
    this._data.get(e, t) || this._data.set(e, t, new Ot2()), this._data.get(e, t).set(n, s15, o2);
  }
  get(e, t, n, s15) {
    return this._data.get(e, t)?.get(n, s15);
  }
  clear() {
    this._data.clear();
  }
};
var Ft = class {
  constructor() {
    this._tasks = [];
    this._i = 0;
  }
  enqueue(e) {
    this._tasks.push(e), this._start();
  }
  flush() {
    for (; this._i < this._tasks.length; ) this._tasks[this._i]() || this._i++;
    this.clear();
  }
  clear() {
    this._idleCallback && (this._cancelCallback(this._idleCallback), this._idleCallback = void 0), this._i = 0, this._tasks.length = 0;
  }
  _start() {
    this._idleCallback || (this._idleCallback = this._requestCallback(this._process.bind(this)));
  }
  _process(e) {
    this._idleCallback = void 0;
    let t = 0, n = 0, s15 = e.timeRemaining(), o2 = 0;
    for (; this._i < this._tasks.length; ) {
      if (t = performance.now(), this._tasks[this._i]() || this._i++, t = Math.max(1, performance.now() - t), n = Math.max(t, n), o2 = e.timeRemaining(), n * 1.5 > o2) {
        s15 - t < -20 && console.warn(`task queue exceeded allotted deadline by ${Math.abs(Math.round(s15 - t))}ms`), this._start();
        return;
      }
      s15 = o2;
    }
    this.clear();
  }
};
var gi2 = class extends Ft {
  _requestCallback(e) {
    return setTimeout(() => e(this._createDeadline(16)));
  }
  _cancelCallback(e) {
    clearTimeout(e);
  }
  _createDeadline(e) {
    let t = performance.now() + e;
    return { timeRemaining: () => Math.max(0, t - performance.now()) };
  }
};
var xi2 = class extends Ft {
  _requestCallback(e) {
    return requestIdleCallback(e);
  }
  _cancelCallback(e) {
    cancelIdleCallback(e);
  }
};
var wn2 = !Lt2 && "requestIdleCallback" in window ? xi2 : gi2;
var he2 = class i2 {
  constructor() {
    this.fg = 0;
    this.bg = 0;
    this.extended = new it();
  }
  static toColorRGB(e) {
    return [e >>> 16 & 255, e >>> 8 & 255, e & 255];
  }
  static fromColorRGB(e) {
    return (e[0] & 255) << 16 | (e[1] & 255) << 8 | e[2] & 255;
  }
  clone() {
    let e = new i2();
    return e.fg = this.fg, e.bg = this.bg, e.extended = this.extended.clone(), e;
  }
  isInverse() {
    return this.fg & 67108864;
  }
  isBold() {
    return this.fg & 134217728;
  }
  isUnderline() {
    return this.hasExtendedAttrs() && this.extended.underlineStyle !== 0 ? 1 : this.fg & 268435456;
  }
  isBlink() {
    return this.fg & 536870912;
  }
  isInvisible() {
    return this.fg & 1073741824;
  }
  isItalic() {
    return this.bg & 67108864;
  }
  isDim() {
    return this.bg & 134217728;
  }
  isStrikethrough() {
    return this.fg & 2147483648;
  }
  isProtected() {
    return this.bg & 536870912;
  }
  isOverline() {
    return this.bg & 1073741824;
  }
  getFgColorMode() {
    return this.fg & 50331648;
  }
  getBgColorMode() {
    return this.bg & 50331648;
  }
  isFgRGB() {
    return (this.fg & 50331648) === 50331648;
  }
  isBgRGB() {
    return (this.bg & 50331648) === 50331648;
  }
  isFgPalette() {
    return (this.fg & 50331648) === 16777216 || (this.fg & 50331648) === 33554432;
  }
  isBgPalette() {
    return (this.bg & 50331648) === 16777216 || (this.bg & 50331648) === 33554432;
  }
  isFgDefault() {
    return (this.fg & 50331648) === 0;
  }
  isBgDefault() {
    return (this.bg & 50331648) === 0;
  }
  isAttributeDefault() {
    return this.fg === 0 && this.bg === 0;
  }
  getFgColor() {
    switch (this.fg & 50331648) {
      case 16777216:
      case 33554432:
        return this.fg & 255;
      case 50331648:
        return this.fg & 16777215;
      default:
        return -1;
    }
  }
  getBgColor() {
    switch (this.bg & 50331648) {
      case 16777216:
      case 33554432:
        return this.bg & 255;
      case 50331648:
        return this.bg & 16777215;
      default:
        return -1;
    }
  }
  hasExtendedAttrs() {
    return this.bg & 268435456;
  }
  updateExtended() {
    this.extended.isEmpty() ? this.bg &= -268435457 : this.bg |= 268435456;
  }
  getUnderlineColor() {
    if (this.bg & 268435456 && ~this.extended.underlineColor) switch (this.extended.underlineColor & 50331648) {
      case 16777216:
      case 33554432:
        return this.extended.underlineColor & 255;
      case 50331648:
        return this.extended.underlineColor & 16777215;
      default:
        return this.getFgColor();
    }
    return this.getFgColor();
  }
  getUnderlineColorMode() {
    return this.bg & 268435456 && ~this.extended.underlineColor ? this.extended.underlineColor & 50331648 : this.getFgColorMode();
  }
  isUnderlineColorRGB() {
    return this.bg & 268435456 && ~this.extended.underlineColor ? (this.extended.underlineColor & 50331648) === 50331648 : this.isFgRGB();
  }
  isUnderlineColorPalette() {
    return this.bg & 268435456 && ~this.extended.underlineColor ? (this.extended.underlineColor & 50331648) === 16777216 || (this.extended.underlineColor & 50331648) === 33554432 : this.isFgPalette();
  }
  isUnderlineColorDefault() {
    return this.bg & 268435456 && ~this.extended.underlineColor ? (this.extended.underlineColor & 50331648) === 0 : this.isFgDefault();
  }
  getUnderlineStyle() {
    return this.fg & 268435456 ? this.bg & 268435456 ? this.extended.underlineStyle : 1 : 0;
  }
  getUnderlineVariantOffset() {
    return this.extended.underlineVariantOffset;
  }
};
var it = class i3 {
  constructor(e = 0, t = 0) {
    this._ext = 0;
    this._urlId = 0;
    this._ext = e, this._urlId = t;
  }
  get ext() {
    return this._urlId ? this._ext & -469762049 | this.underlineStyle << 26 : this._ext;
  }
  set ext(e) {
    this._ext = e;
  }
  get underlineStyle() {
    return this._urlId ? 5 : (this._ext & 469762048) >> 26;
  }
  set underlineStyle(e) {
    this._ext &= -469762049, this._ext |= e << 26 & 469762048;
  }
  get underlineColor() {
    return this._ext & 67108863;
  }
  set underlineColor(e) {
    this._ext &= -67108864, this._ext |= e & 67108863;
  }
  get urlId() {
    return this._urlId;
  }
  set urlId(e) {
    this._urlId = e;
  }
  get underlineVariantOffset() {
    let e = (this._ext & 3758096384) >> 29;
    return e < 0 ? e ^ 4294967288 : e;
  }
  set underlineVariantOffset(e) {
    this._ext &= 536870911, this._ext |= e << 29 & 3758096384;
  }
  clone() {
    return new i3(this._ext, this._urlId);
  }
  isEmpty() {
    return this.underlineStyle === 0 && this._urlId === 0;
  }
};
var He2 = class He3 {
  constructor(e) {
    this.element = e, this.next = He3.Undefined, this.prev = He3.Undefined;
  }
};
He2.Undefined = new He2(void 0);
var zr3 = globalThis.performance && typeof globalThis.performance.now == "function";
var kt3 = class i4 {
  static create(e) {
    return new i4(e);
  }
  constructor(e) {
    this._now = zr3 && e === false ? Date.now : globalThis.performance.now.bind(globalThis.performance), this._startTime = this._now(), this._stopTime = -1;
  }
  stop() {
    this._stopTime = this._now();
  }
  reset() {
    this._startTime = this._now(), this._stopTime = -1;
  }
  elapsed() {
    return this._stopTime !== -1 ? this._stopTime - this._startTime : this._now() - this._startTime;
  }
};
var qr2 = false;
var Dn2 = false;
var jr2 = false;
var ee2;
((se2) => {
  se2.None = () => B3.None;
  function e(v2) {
    if (jr2) {
      let { onDidAddListener: p } = v2, g = nt2.create(), b2 = 0;
      v2.onDidAddListener = () => {
        ++b2 === 2 && (console.warn("snapshotted emitter LIKELY used public and SHOULD HAVE BEEN created with DisposableStore. snapshotted here"), g.print()), p?.();
      };
    }
  }
  function t(v2, p) {
    return h2(v2, () => {
    }, 0, void 0, true, void 0, p);
  }
  se2.defer = t;
  function n(v2) {
    return (p, g = null, b2) => {
      let m = false, _2;
      return _2 = v2((T) => {
        if (!m) return _2 ? _2.dispose() : m = true, p.call(g, T);
      }, null, b2), m && _2.dispose(), _2;
    };
  }
  se2.once = n;
  function s15(v2, p, g) {
    return c((b2, m = null, _2) => v2((T) => b2.call(m, p(T)), null, _2), g);
  }
  se2.map = s15;
  function o2(v2, p, g) {
    return c((b2, m = null, _2) => v2((T) => {
      p(T), b2.call(m, T);
    }, null, _2), g);
  }
  se2.forEach = o2;
  function r(v2, p, g) {
    return c((b2, m = null, _2) => v2((T) => p(T) && b2.call(m, T), null, _2), g);
  }
  se2.filter = r;
  function a(v2) {
    return v2;
  }
  se2.signal = a;
  function l(...v2) {
    return (p, g = null, b2) => {
      let m = It2(...v2.map((_2) => _2((T) => p.call(g, T))));
      return d(m, b2);
    };
  }
  se2.any = l;
  function u(v2, p, g, b2) {
    let m = g;
    return s15(v2, (_2) => (m = p(m, _2), m), b2);
  }
  se2.reduce = u;
  function c(v2, p) {
    let g, b2 = { onWillAddFirstListener() {
      g = v2(m.fire, m);
    }, onDidRemoveLastListener() {
      g?.dispose();
    } };
    p || e(b2);
    let m = new D3(b2);
    return p?.add(m), m.event;
  }
  function d(v2, p) {
    return p instanceof Array ? p.push(v2) : p && p.add(v2), v2;
  }
  function h2(v2, p, g = 100, b2 = false, m = false, _2, T) {
    let x, R2, $2, P = 0, de2, Re2 = { leakWarningThreshold: _2, onWillAddFirstListener() {
      x = v2((ie2) => {
        P++, R2 = p(R2, ie2), b2 && !$2 && (oe.fire(R2), R2 = void 0), de2 = () => {
          let N2 = R2;
          R2 = void 0, $2 = void 0, (!b2 || P > 1) && oe.fire(N2), P = 0;
        }, typeof g == "number" ? (clearTimeout($2), $2 = setTimeout(de2, g)) : $2 === void 0 && ($2 = 0, queueMicrotask(de2));
      });
    }, onWillRemoveListener() {
      m && P > 0 && de2?.();
    }, onDidRemoveLastListener() {
      de2 = void 0, x.dispose();
    } };
    T || e(Re2);
    let oe = new D3(Re2);
    return T?.add(oe), oe.event;
  }
  se2.debounce = h2;
  function f(v2, p = 0, g) {
    return se2.debounce(v2, (b2, m) => b2 ? (b2.push(m), b2) : [m], p, void 0, true, void 0, g);
  }
  se2.accumulate = f;
  function I(v2, p = (b2, m) => b2 === m, g) {
    let b2 = true, m;
    return r(v2, (_2) => {
      let T = b2 || !p(_2, m);
      return b2 = false, m = _2, T;
    }, g);
  }
  se2.latch = I;
  function L2(v2, p, g) {
    return [se2.filter(v2, p, g), se2.filter(v2, (b2) => !p(b2), g)];
  }
  se2.split = L2;
  function M2(v2, p = false, g = [], b2) {
    let m = g.slice(), _2 = v2((R2) => {
      m ? m.push(R2) : x.fire(R2);
    });
    b2 && b2.add(_2);
    let T = () => {
      m?.forEach((R2) => x.fire(R2)), m = null;
    }, x = new D3({ onWillAddFirstListener() {
      _2 || (_2 = v2((R2) => x.fire(R2)), b2 && b2.add(_2));
    }, onDidAddFirstListener() {
      m && (p ? setTimeout(T) : T());
    }, onDidRemoveLastListener() {
      _2 && _2.dispose(), _2 = null;
    } });
    return b2 && b2.add(x), x.event;
  }
  se2.buffer = M2;
  function q2(v2, p) {
    return (b2, m, _2) => {
      let T = p(new W2());
      return v2(function(x) {
        let R2 = T.evaluate(x);
        R2 !== S2 && b2.call(m, R2);
      }, void 0, _2);
    };
  }
  se2.chain = q2;
  let S2 = /* @__PURE__ */ Symbol("HaltChainable");
  class W2 {
    constructor() {
      this.steps = [];
    }
    map(p) {
      return this.steps.push(p), this;
    }
    forEach(p) {
      return this.steps.push((g) => (p(g), g)), this;
    }
    filter(p) {
      return this.steps.push((g) => p(g) ? g : S2), this;
    }
    reduce(p, g) {
      let b2 = g;
      return this.steps.push((m) => (b2 = p(b2, m), b2)), this;
    }
    latch(p = (g, b2) => g === b2) {
      let g = true, b2;
      return this.steps.push((m) => {
        let _2 = g || !p(m, b2);
        return g = false, b2 = m, _2 ? m : S2;
      }), this;
    }
    evaluate(p) {
      for (let g of this.steps) if (p = g(p), p === S2) break;
      return p;
    }
  }
  function E(v2, p, g = (b2) => b2) {
    let b2 = (...x) => T.fire(g(...x)), m = () => v2.on(p, b2), _2 = () => v2.removeListener(p, b2), T = new D3({ onWillAddFirstListener: m, onDidRemoveLastListener: _2 });
    return T.event;
  }
  se2.fromNodeEventEmitter = E;
  function y(v2, p, g = (b2) => b2) {
    let b2 = (...x) => T.fire(g(...x)), m = () => v2.addEventListener(p, b2), _2 = () => v2.removeEventListener(p, b2), T = new D3({ onWillAddFirstListener: m, onDidRemoveLastListener: _2 });
    return T.event;
  }
  se2.fromDOMEventEmitter = y;
  function w(v2) {
    return new Promise((p) => n(v2)(p));
  }
  se2.toPromise = w;
  function G3(v2) {
    let p = new D3();
    return v2.then((g) => {
      p.fire(g);
    }, () => {
      p.fire(void 0);
    }).finally(() => {
      p.dispose();
    }), p.event;
  }
  se2.fromPromise = G3;
  function ue2(v2, p) {
    return v2((g) => p.fire(g));
  }
  se2.forward = ue2;
  function Se2(v2, p, g) {
    return p(g), v2((b2) => p(b2));
  }
  se2.runAndSubscribe = Se2;
  class ce2 {
    constructor(p, g) {
      this._observable = p;
      this._counter = 0;
      this._hasChanged = false;
      let b2 = { onWillAddFirstListener: () => {
        p.addObserver(this);
      }, onDidRemoveLastListener: () => {
        p.removeObserver(this);
      } };
      g || e(b2), this.emitter = new D3(b2), g && g.add(this.emitter);
    }
    beginUpdate(p) {
      this._counter++;
    }
    handlePossibleChange(p) {
    }
    handleChange(p, g) {
      this._hasChanged = true;
    }
    endUpdate(p) {
      this._counter--, this._counter === 0 && (this._observable.reportChanges(), this._hasChanged && (this._hasChanged = false, this.emitter.fire(this._observable.get())));
    }
  }
  function we2(v2, p) {
    return new ce2(v2, p).emitter.event;
  }
  se2.fromObservable = we2;
  function A(v2) {
    return (p, g, b2) => {
      let m = 0, _2 = false, T = { beginUpdate() {
        m++;
      }, endUpdate() {
        m--, m === 0 && (v2.reportChanges(), _2 && (_2 = false, p.call(g)));
      }, handlePossibleChange() {
      }, handleChange() {
        _2 = true;
      } };
      v2.addObserver(T), v2.reportChanges();
      let x = { dispose() {
        v2.removeObserver(T);
      } };
      return b2 instanceof fe2 ? b2.add(x) : Array.isArray(b2) && b2.push(x), x;
    };
  }
  se2.fromObservableLight = A;
})(ee2 || (ee2 = {}));
var We2 = class We3 {
  constructor(e) {
    this.listenerCount = 0;
    this.invocationCount = 0;
    this.elapsedOverall = 0;
    this.durations = [];
    this.name = `${e}_${We3._idPool++}`, We3.all.add(this);
  }
  start(e) {
    this._stopWatch = new kt3(), this.listenerCount = e;
  }
  stop() {
    if (this._stopWatch) {
      let e = this._stopWatch.elapsed();
      this.durations.push(e), this.elapsedOverall += e, this.invocationCount += 1, this._stopWatch = void 0;
    }
  }
};
We2.all = /* @__PURE__ */ new Set(), We2._idPool = 0;
var Ei2 = We2;
var Mn2 = -1;
var Bt2 = class Bt3 {
  constructor(e, t, n = (Bt3._idPool++).toString(16).padStart(3, "0")) {
    this._errorHandler = e;
    this.threshold = t;
    this.name = n;
    this._warnCountdown = 0;
  }
  dispose() {
    this._stacks?.clear();
  }
  check(e, t) {
    let n = this.threshold;
    if (n <= 0 || t < n) return;
    this._stacks || (this._stacks = /* @__PURE__ */ new Map());
    let s15 = this._stacks.get(e.value) || 0;
    if (this._stacks.set(e.value, s15 + 1), this._warnCountdown -= 1, this._warnCountdown <= 0) {
      this._warnCountdown = n * 0.5;
      let [o2, r] = this.getMostFrequentStack(), a = `[${this.name}] potential listener LEAK detected, having ${t} listeners already. MOST frequent listener (${r}):`;
      console.warn(a), console.warn(o2);
      let l = new Ii2(a, o2);
      this._errorHandler(l);
    }
    return () => {
      let o2 = this._stacks.get(e.value) || 0;
      this._stacks.set(e.value, o2 - 1);
    };
  }
  getMostFrequentStack() {
    if (!this._stacks) return;
    let e, t = 0;
    for (let [n, s15] of this._stacks) (!e || t < s15) && (e = [n, s15], t = s15);
    return e;
  }
};
Bt2._idPool = 1;
var yi2 = Bt2;
var nt2 = class i5 {
  constructor(e) {
    this.value = e;
  }
  static create() {
    let e = new Error();
    return new i5(e.stack ?? "");
  }
  print() {
    console.warn(this.value.split(`
`).slice(2).join(`
`));
  }
};
var Ii2 = class extends Error {
  constructor(e, t) {
    super(e), this.name = "ListenerLeakError", this.stack = t;
  }
};
var Li2 = class extends Error {
  constructor(e, t) {
    super(e), this.name = "ListenerRefusalError", this.stack = t;
  }
};
var Xr2 = 0;
var Ge = class {
  constructor(e) {
    this.value = e;
    this.id = Xr2++;
  }
};
var Yr2 = 2;
var Qr2 = (i8, e) => {
  if (i8 instanceof Ge) e(i8);
  else for (let t = 0; t < i8.length; t++) {
    let n = i8[t];
    n && e(n);
  }
};
var Pt2;
if (qr2) {
  let i8 = [];
  setInterval(() => {
    i8.length !== 0 && (console.warn("[LEAKING LISTENERS] GC'ed these listeners that were NOT yet disposed:"), console.warn(i8.join(`
`)), i8.length = 0);
  }, 3e3), Pt2 = new FinalizationRegistry((e) => {
    typeof e == "string" && i8.push(e);
  });
}
var D3 = class {
  constructor(e) {
    this._size = 0;
    this._options = e, this._leakageMon = Mn2 > 0 || this._options?.leakWarningThreshold ? new yi2(e?.onListenerError ?? Pe, this._options?.leakWarningThreshold ?? Mn2) : void 0, this._perfMon = this._options?._profName ? new Ei2(this._options._profName) : void 0, this._deliveryQueue = this._options?.deliveryQueue;
  }
  dispose() {
    if (!this._disposed) {
      if (this._disposed = true, this._deliveryQueue?.current === this && this._deliveryQueue.reset(), this._listeners) {
        if (Dn2) {
          let e = this._listeners;
          queueMicrotask(() => {
            Qr2(e, (t) => t.stack?.print());
          });
        }
        this._listeners = void 0, this._size = 0;
      }
      this._options?.onDidRemoveLastListener?.(), this._leakageMon?.dispose();
    }
  }
  get event() {
    return this._event ?? (this._event = (e, t, n) => {
      if (this._leakageMon && this._size > this._leakageMon.threshold ** 2) {
        let l = `[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far (${this._size} vs ${this._leakageMon.threshold})`;
        console.warn(l);
        let u = this._leakageMon.getMostFrequentStack() ?? ["UNKNOWN stack", -1], c = new Li2(`${l}. HINT: Stack shows most frequent listener (${u[1]}-times)`, u[0]);
        return (this._options?.onListenerError || Pe)(c), B3.None;
      }
      if (this._disposed) return B3.None;
      t && (e = e.bind(t));
      let s15 = new Ge(e), o2, r;
      this._leakageMon && this._size >= Math.ceil(this._leakageMon.threshold * 0.2) && (s15.stack = nt2.create(), o2 = this._leakageMon.check(s15.stack, this._size + 1)), Dn2 && (s15.stack = r ?? nt2.create()), this._listeners ? this._listeners instanceof Ge ? (this._deliveryQueue ?? (this._deliveryQueue = new wi2()), this._listeners = [this._listeners, s15]) : this._listeners.push(s15) : (this._options?.onWillAddFirstListener?.(this), this._listeners = s15, this._options?.onDidAddFirstListener?.(this)), this._size++;
      let a = O(() => {
        Pt2?.unregister(a), o2?.(), this._removeListener(s15);
      });
      if (n instanceof fe2 ? n.add(a) : Array.isArray(n) && n.push(a), Pt2) {
        let l = new Error().stack.split(`
`).slice(2, 3).join(`
`).trim(), u = /(file:|vscode-file:\/\/vscode-app)?(\/[^:]*:\d+:\d+)/.exec(l);
        Pt2.register(a, u?.[2] ?? l, a);
      }
      return a;
    }), this._event;
  }
  _removeListener(e) {
    if (this._options?.onWillRemoveListener?.(this), !this._listeners) return;
    if (this._size === 1) {
      this._listeners = void 0, this._options?.onDidRemoveLastListener?.(this), this._size = 0;
      return;
    }
    let t = this._listeners, n = t.indexOf(e);
    if (n === -1) throw console.log("disposed?", this._disposed), console.log("size?", this._size), console.log("arr?", JSON.stringify(this._listeners)), new Error("Attempted to dispose unknown listener");
    this._size--, t[n] = void 0;
    let s15 = this._deliveryQueue.current === this;
    if (this._size * Yr2 <= t.length) {
      let o2 = 0;
      for (let r = 0; r < t.length; r++) t[r] ? t[o2++] = t[r] : s15 && (this._deliveryQueue.end--, o2 < this._deliveryQueue.i && this._deliveryQueue.i--);
      t.length = o2;
    }
  }
  _deliver(e, t) {
    if (!e) return;
    let n = this._options?.onListenerError || Pe;
    if (!n) {
      e.value(t);
      return;
    }
    try {
      e.value(t);
    } catch (s15) {
      n(s15);
    }
  }
  _deliverQueue(e) {
    let t = e.current._listeners;
    for (; e.i < e.end; ) this._deliver(t[e.i++], e.value);
    e.reset();
  }
  fire(e) {
    if (this._deliveryQueue?.current && (this._deliverQueue(this._deliveryQueue), this._perfMon?.stop()), this._perfMon?.start(this._size), this._listeners) if (this._listeners instanceof Ge) this._deliver(this._listeners, e);
    else {
      let t = this._deliveryQueue;
      t.enqueue(this, e, this._listeners.length), this._deliverQueue(t);
    }
    this._perfMon?.stop();
  }
  hasListeners() {
    return this._size > 0;
  }
};
var wi2 = class {
  constructor() {
    this.i = -1;
    this.end = 0;
  }
  enqueue(e, t, n) {
    this.i = 0, this.end = n, this.current = e, this.value = t;
  }
  reset() {
    this.i = this.end, this.current = void 0, this.value = void 0;
  }
};
var An = { texturePage: 0, texturePosition: { x: 0, y: 0 }, texturePositionClipSpace: { x: 0, y: 0 }, offset: { x: 0, y: 0 }, size: { x: 0, y: 0 }, sizeClipSpace: { x: 0, y: 0 } };
var rt2 = 2;
var st2;
var ae2 = class i6 {
  constructor(e, t, n) {
    this._document = e;
    this._config = t;
    this._unicodeService = n;
    this._didWarmUp = false;
    this._cacheMap = new tt();
    this._cacheMapCombined = new tt();
    this._pages = [];
    this._activePages = [];
    this._workBoundingBox = { top: 0, left: 0, bottom: 0, right: 0 };
    this._workAttributeData = new he2();
    this._textureSize = 512;
    this._onAddTextureAtlasCanvas = new D3();
    this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event;
    this._onRemoveTextureAtlasCanvas = new D3();
    this.onRemoveTextureAtlasCanvas = this._onRemoveTextureAtlasCanvas.event;
    this._requestClearModel = false;
    this._createNewPage(), this._tmpCanvas = Sn2(e, this._config.deviceCellWidth * 4 + rt2 * 2, this._config.deviceCellHeight + rt2 * 2), this._tmpCtx = F2(this._tmpCanvas.getContext("2d", { alpha: this._config.allowTransparency, willReadFrequently: true }));
  }
  get pages() {
    return this._pages;
  }
  dispose() {
    this._tmpCanvas.remove();
    for (let e of this.pages) e.canvas.remove();
    this._onAddTextureAtlasCanvas.dispose();
  }
  warmUp() {
    this._didWarmUp || (this._doWarmUp(), this._didWarmUp = true);
  }
  _doWarmUp() {
    let e = new wn2();
    for (let t = 33; t < 126; t++) e.enqueue(() => {
      if (!this._cacheMap.get(t, 0, 0, 0)) {
        let n = this._drawToCache(t, 0, 0, 0, false, void 0);
        this._cacheMap.set(t, 0, 0, 0, n);
      }
    });
  }
  beginFrame() {
    return this._requestClearModel;
  }
  clearTexture() {
    if (!(this._pages[0].currentRow.x === 0 && this._pages[0].currentRow.y === 0)) {
      for (let e of this._pages) e.clear();
      this._cacheMap.clear(), this._cacheMapCombined.clear(), this._didWarmUp = false;
    }
  }
  _createNewPage() {
    if (i6.maxAtlasPages && this._pages.length >= Math.max(4, i6.maxAtlasPages)) {
      let t = this._pages.filter((u) => u.canvas.width * 2 <= (i6.maxTextureSize || 4096)).sort((u, c) => c.canvas.width !== u.canvas.width ? c.canvas.width - u.canvas.width : c.percentageUsed - u.percentageUsed), n = -1, s15 = 0;
      for (let u = 0; u < t.length; u++) if (t[u].canvas.width !== s15) n = u, s15 = t[u].canvas.width;
      else if (u - n === 3) break;
      let o2 = t.slice(n, n + 4), r = o2.map((u) => u.glyphs[0].texturePage).sort((u, c) => u > c ? 1 : -1), a = this.pages.length - o2.length, l = this._mergePages(o2, a);
      l.version++;
      for (let u = r.length - 1; u >= 0; u--) this._deletePage(r[u]);
      this.pages.push(l), this._requestClearModel = true, this._onAddTextureAtlasCanvas.fire(l.canvas);
    }
    let e = new ot2(this._document, this._textureSize);
    return this._pages.push(e), this._activePages.push(e), this._onAddTextureAtlasCanvas.fire(e.canvas), e;
  }
  _mergePages(e, t) {
    let n = e[0].canvas.width * 2, s15 = new ot2(this._document, n, e);
    for (let [o2, r] of e.entries()) {
      let a = o2 * r.canvas.width % n, l = Math.floor(o2 / 2) * r.canvas.height;
      s15.ctx.drawImage(r.canvas, a, l);
      for (let c of r.glyphs) c.texturePage = t, c.sizeClipSpace.x = c.size.x / n, c.sizeClipSpace.y = c.size.y / n, c.texturePosition.x += a, c.texturePosition.y += l, c.texturePositionClipSpace.x = c.texturePosition.x / n, c.texturePositionClipSpace.y = c.texturePosition.y / n;
      this._onRemoveTextureAtlasCanvas.fire(r.canvas);
      let u = this._activePages.indexOf(r);
      u !== -1 && this._activePages.splice(u, 1);
    }
    return s15;
  }
  _deletePage(e) {
    this._pages.splice(e, 1);
    for (let t = e; t < this._pages.length; t++) {
      let n = this._pages[t];
      for (let s15 of n.glyphs) s15.texturePage--;
      n.version++;
    }
  }
  getRasterizedGlyphCombinedChar(e, t, n, s15, o2, r) {
    return this._getFromCacheMap(this._cacheMapCombined, e, t, n, s15, o2, r);
  }
  getRasterizedGlyph(e, t, n, s15, o2, r) {
    return this._getFromCacheMap(this._cacheMap, e, t, n, s15, o2, r);
  }
  _getFromCacheMap(e, t, n, s15, o2, r, a) {
    return st2 = e.get(t, n, s15, o2), st2 || (st2 = this._drawToCache(t, n, s15, o2, r, a), e.set(t, n, s15, o2, st2)), st2;
  }
  _getColorFromAnsiIndex(e) {
    if (e >= this._config.colors.ansi.length) throw new Error("No color found for idx " + e);
    return this._config.colors.ansi[e];
  }
  _getBackgroundColor(e, t, n, s15) {
    if (this._config.allowTransparency) return Z;
    let o2;
    switch (e) {
      case 16777216:
      case 33554432:
        o2 = this._getColorFromAnsiIndex(t);
        break;
      case 50331648:
        let r = he2.toColorRGB(t);
        o2 = X2.toColor(r[0], r[1], r[2]);
        break;
      case 0:
      default:
        n ? o2 = Ue2.opaque(this._config.colors.foreground) : o2 = this._config.colors.background;
        break;
    }
    return this._config.allowTransparency || (o2 = Ue2.opaque(o2)), o2;
  }
  _getForegroundColor(e, t, n, s15, o2, r, a, l, u, c) {
    let d = this._getMinimumContrastColor(e, t, n, s15, o2, r, a, u, l, c);
    if (d) return d;
    let h2;
    switch (o2) {
      case 16777216:
      case 33554432:
        this._config.drawBoldTextInBrightColors && u && r < 8 && (r += 8), h2 = this._getColorFromAnsiIndex(r);
        break;
      case 50331648:
        let f = he2.toColorRGB(r);
        h2 = X2.toColor(f[0], f[1], f[2]);
        break;
      case 0:
      default:
        a ? h2 = this._config.colors.background : h2 = this._config.colors.foreground;
    }
    return this._config.allowTransparency && (h2 = Ue2.opaque(h2)), l && (h2 = Ue2.multiplyOpacity(h2, gn2)), h2;
  }
  _resolveBackgroundRgba(e, t, n) {
    switch (e) {
      case 16777216:
      case 33554432:
        return this._getColorFromAnsiIndex(t).rgba;
      case 50331648:
        return t << 8;
      case 0:
      default:
        return n ? this._config.colors.foreground.rgba : this._config.colors.background.rgba;
    }
  }
  _resolveForegroundRgba(e, t, n, s15) {
    switch (e) {
      case 16777216:
      case 33554432:
        return this._config.drawBoldTextInBrightColors && s15 && t < 8 && (t += 8), this._getColorFromAnsiIndex(t).rgba;
      case 50331648:
        return t << 8;
      case 0:
      default:
        return n ? this._config.colors.background.rgba : this._config.colors.foreground.rgba;
    }
  }
  _getMinimumContrastColor(e, t, n, s15, o2, r, a, l, u, c) {
    if (this._config.minimumContrastRatio === 1 || c) return;
    let d = this._getContrastCache(u), h2 = d.getColor(e, s15);
    if (h2 !== void 0) return h2 || void 0;
    let f = this._resolveBackgroundRgba(t, n, a), I = this._resolveForegroundRgba(o2, r, a, l), L2 = Te2.ensureContrastRatio(f, I, this._config.minimumContrastRatio / (u ? 2 : 1));
    if (!L2) {
      d.setColor(e, s15, null);
      return;
    }
    let M2 = X2.toColor(L2 >> 24 & 255, L2 >> 16 & 255, L2 >> 8 & 255);
    return d.setColor(e, s15, M2), M2;
  }
  _getContrastCache(e) {
    return e ? this._config.colors.halfContrastCache : this._config.colors.contrastCache;
  }
  _drawToCache(e, t, n, s15, o2, r) {
    let a = typeof e == "number" ? String.fromCharCode(e) : e;
    r && this._tmpCanvas.parentElement !== r && (this._tmpCanvas.style.display = "none", r.append(this._tmpCanvas));
    let l = Math.min(this._config.deviceCellWidth * Math.max(a.length, 2) + rt2 * 2, this._config.deviceMaxTextureSize);
    this._tmpCanvas.width < l && (this._tmpCanvas.width = l);
    let u = Math.min(this._config.deviceCellHeight + rt2 * 4, this._textureSize);
    if (this._tmpCanvas.height < u && (this._tmpCanvas.height = u), this._tmpCtx.save(), this._workAttributeData.fg = n, this._workAttributeData.bg = t, this._workAttributeData.extended.ext = s15, !!this._workAttributeData.isInvisible()) return An;
    let d = !!this._workAttributeData.isBold(), h2 = !!this._workAttributeData.isInverse(), f = !!this._workAttributeData.isDim(), I = !!this._workAttributeData.isItalic(), L2 = !!this._workAttributeData.isUnderline(), M2 = !!this._workAttributeData.isStrikethrough(), q2 = !!this._workAttributeData.isOverline(), S2 = this._workAttributeData.getFgColor(), W2 = this._workAttributeData.getFgColorMode(), E = this._workAttributeData.getBgColor(), y = this._workAttributeData.getBgColorMode();
    if (h2) {
      let x = S2;
      S2 = E, E = x;
      let R2 = W2;
      W2 = y, y = R2;
    }
    let w = this._getBackgroundColor(y, E, h2, f);
    this._tmpCtx.globalCompositeOperation = "copy", this._tmpCtx.fillStyle = w.css, this._tmpCtx.fillRect(0, 0, this._tmpCanvas.width, this._tmpCanvas.height), this._tmpCtx.globalCompositeOperation = "source-over";
    let G3 = d ? this._config.fontWeightBold : this._config.fontWeight, ue2 = I ? "italic" : "";
    this._tmpCtx.font = `${ue2} ${G3} ${this._config.fontSize * this._config.devicePixelRatio}px ${this._config.fontFamily}`, this._tmpCtx.textBaseline = St2;
    let Se2 = a.length === 1 && Rt2(a.charCodeAt(0)), ce2 = a.length === 1 && fn2(a.charCodeAt(0)), we2 = this._getForegroundColor(t, y, E, n, W2, S2, h2, f, d, Dt2(a.charCodeAt(0)));
    this._tmpCtx.fillStyle = we2.css;
    let A = ce2 ? 0 : rt2 * 2, se2 = false;
    this._config.customGlyphs !== false && (se2 = yn2(this._tmpCtx, a, A, A, this._config.deviceCellWidth, this._config.deviceCellHeight, this._config.fontSize, this._config.devicePixelRatio));
    let v2 = !Se2, p;
    if (typeof e == "number" ? p = this._unicodeService.wcwidth(e) : p = this._unicodeService.getStringCellWidth(e), L2) {
      this._tmpCtx.save();
      let x = Math.max(1, Math.floor(this._config.fontSize * this._config.devicePixelRatio / 15)), R2 = x % 2 === 1 ? 0.5 : 0;
      if (this._tmpCtx.lineWidth = x, this._workAttributeData.isUnderlineColorDefault()) this._tmpCtx.strokeStyle = this._tmpCtx.fillStyle;
      else if (this._workAttributeData.isUnderlineColorRGB()) v2 = false, this._tmpCtx.strokeStyle = `rgb(${he2.toColorRGB(this._workAttributeData.getUnderlineColor()).join(",")})`;
      else {
        v2 = false;
        let ie2 = this._workAttributeData.getUnderlineColor();
        this._config.drawBoldTextInBrightColors && this._workAttributeData.isBold() && ie2 < 8 && (ie2 += 8), this._tmpCtx.strokeStyle = this._getColorFromAnsiIndex(ie2).css;
      }
      this._tmpCtx.beginPath();
      let $2 = A, P = Math.ceil(A + this._config.deviceCharHeight) - R2 - (o2 ? x * 2 : 0), de2 = P + x, Re2 = P + x * 2, oe = this._workAttributeData.getUnderlineVariantOffset();
      for (let ie2 = 0; ie2 < p; ie2++) {
        this._tmpCtx.save();
        let N2 = $2 + ie2 * this._config.deviceCellWidth, ne2 = $2 + (ie2 + 1) * this._config.deviceCellWidth, di = N2 + this._config.deviceCellWidth / 2;
        switch (this._workAttributeData.extended.underlineStyle) {
          case 2:
            this._tmpCtx.moveTo(N2, P), this._tmpCtx.lineTo(ne2, P), this._tmpCtx.moveTo(N2, Re2), this._tmpCtx.lineTo(ne2, Re2);
            break;
          case 3:
            let ft2 = x <= 1 ? Re2 : Math.ceil(A + this._config.deviceCharHeight - x / 2) - R2, mt2 = x <= 1 ? P : Math.ceil(A + this._config.deviceCharHeight + x / 2) - R2, qi2 = new Path2D();
            qi2.rect(N2, P, this._config.deviceCellWidth, Re2 - P), this._tmpCtx.clip(qi2), this._tmpCtx.moveTo(N2 - this._config.deviceCellWidth / 2, de2), this._tmpCtx.bezierCurveTo(N2 - this._config.deviceCellWidth / 2, mt2, N2, mt2, N2, de2), this._tmpCtx.bezierCurveTo(N2, ft2, di, ft2, di, de2), this._tmpCtx.bezierCurveTo(di, mt2, ne2, mt2, ne2, de2), this._tmpCtx.bezierCurveTo(ne2, ft2, ne2 + this._config.deviceCellWidth / 2, ft2, ne2 + this._config.deviceCellWidth / 2, de2);
            break;
          case 4:
            let _t2 = oe === 0 ? 0 : oe >= x ? x * 2 - oe : x - oe;
            !(oe >= x) === false || _t2 === 0 ? (this._tmpCtx.setLineDash([Math.round(x), Math.round(x)]), this._tmpCtx.moveTo(N2 + _t2, P), this._tmpCtx.lineTo(ne2, P)) : (this._tmpCtx.setLineDash([Math.round(x), Math.round(x)]), this._tmpCtx.moveTo(N2, P), this._tmpCtx.lineTo(N2 + _t2, P), this._tmpCtx.moveTo(N2 + _t2 + x, P), this._tmpCtx.lineTo(ne2, P)), oe = bn2(ne2 - N2, x, oe);
            break;
          case 5:
            let Er = 0.6, yr2 = 0.3, hi2 = ne2 - N2, ji2 = Math.floor(Er * hi2), Xi2 = Math.floor(yr2 * hi2), Ir2 = hi2 - ji2 - Xi2;
            this._tmpCtx.setLineDash([ji2, Xi2, Ir2]), this._tmpCtx.moveTo(N2, P), this._tmpCtx.lineTo(ne2, P);
            break;
          case 1:
          default:
            this._tmpCtx.moveTo(N2, P), this._tmpCtx.lineTo(ne2, P);
            break;
        }
        this._tmpCtx.stroke(), this._tmpCtx.restore();
      }
      if (this._tmpCtx.restore(), !se2 && this._config.fontSize >= 12 && !this._config.allowTransparency && a !== " ") {
        this._tmpCtx.save(), this._tmpCtx.textBaseline = "alphabetic";
        let ie2 = this._tmpCtx.measureText(a);
        if (this._tmpCtx.restore(), "actualBoundingBoxDescent" in ie2 && ie2.actualBoundingBoxDescent > 0) {
          this._tmpCtx.save();
          let N2 = new Path2D();
          N2.rect($2, P - Math.ceil(x / 2), this._config.deviceCellWidth * p, Re2 - P + Math.ceil(x / 2)), this._tmpCtx.clip(N2), this._tmpCtx.lineWidth = this._config.devicePixelRatio * 3, this._tmpCtx.strokeStyle = w.css, this._tmpCtx.strokeText(a, A, A + this._config.deviceCharHeight), this._tmpCtx.restore();
        }
      }
    }
    if (q2) {
      let x = Math.max(1, Math.floor(this._config.fontSize * this._config.devicePixelRatio / 15)), R2 = x % 2 === 1 ? 0.5 : 0;
      this._tmpCtx.lineWidth = x, this._tmpCtx.strokeStyle = this._tmpCtx.fillStyle, this._tmpCtx.beginPath(), this._tmpCtx.moveTo(A, A + R2), this._tmpCtx.lineTo(A + this._config.deviceCharWidth * p, A + R2), this._tmpCtx.stroke();
    }
    if (se2 || this._tmpCtx.fillText(a, A, A + this._config.deviceCharHeight), a === "_" && !this._config.allowTransparency) {
      let x = Di2(this._tmpCtx.getImageData(A, A, this._config.deviceCellWidth, this._config.deviceCellHeight), w, we2, v2);
      if (x) for (let R2 = 1; R2 <= 5 && (this._tmpCtx.save(), this._tmpCtx.fillStyle = w.css, this._tmpCtx.fillRect(0, 0, this._tmpCanvas.width, this._tmpCanvas.height), this._tmpCtx.restore(), this._tmpCtx.fillText(a, A, A + this._config.deviceCharHeight - R2), x = Di2(this._tmpCtx.getImageData(A, A, this._config.deviceCellWidth, this._config.deviceCellHeight), w, we2, v2), !!x); R2++) ;
    }
    if (M2) {
      let x = Math.max(1, Math.floor(this._config.fontSize * this._config.devicePixelRatio / 10)), R2 = this._tmpCtx.lineWidth % 2 === 1 ? 0.5 : 0;
      this._tmpCtx.lineWidth = x, this._tmpCtx.strokeStyle = this._tmpCtx.fillStyle, this._tmpCtx.beginPath(), this._tmpCtx.moveTo(A, A + Math.floor(this._config.deviceCharHeight / 2) - R2), this._tmpCtx.lineTo(A + this._config.deviceCharWidth * p, A + Math.floor(this._config.deviceCharHeight / 2) - R2), this._tmpCtx.stroke();
    }
    this._tmpCtx.restore();
    let g = this._tmpCtx.getImageData(0, 0, this._tmpCanvas.width, this._tmpCanvas.height), b2;
    if (this._config.allowTransparency ? b2 = Jr2(g) : b2 = Di2(g, w, we2, v2), b2) return An;
    let m = this._findGlyphBoundingBox(g, this._workBoundingBox, l, ce2, se2, A), _2, T;
    for (; ; ) {
      if (this._activePages.length === 0) {
        let x = this._createNewPage();
        _2 = x, T = x.currentRow, T.height = m.size.y;
        break;
      }
      _2 = this._activePages[this._activePages.length - 1], T = _2.currentRow;
      for (let x of this._activePages) m.size.y <= x.currentRow.height && (_2 = x, T = x.currentRow);
      for (let x = this._activePages.length - 1; x >= 0; x--) for (let R2 of this._activePages[x].fixedRows) R2.height <= T.height && m.size.y <= R2.height && (_2 = this._activePages[x], T = R2);
      if (m.size.x > this._textureSize) {
        this._overflowSizePage || (this._overflowSizePage = new ot2(this._document, this._config.deviceMaxTextureSize), this.pages.push(this._overflowSizePage), this._requestClearModel = true, this._onAddTextureAtlasCanvas.fire(this._overflowSizePage.canvas)), _2 = this._overflowSizePage, T = this._overflowSizePage.currentRow, T.x + m.size.x >= _2.canvas.width && (T.x = 0, T.y += T.height, T.height = 0);
        break;
      }
      if (T.y + m.size.y >= _2.canvas.height || T.height > m.size.y + 2) {
        let x = false;
        if (_2.currentRow.y + _2.currentRow.height + m.size.y >= _2.canvas.height) {
          let R2;
          for (let $2 of this._activePages) if ($2.currentRow.y + $2.currentRow.height + m.size.y < $2.canvas.height) {
            R2 = $2;
            break;
          }
          if (R2) _2 = R2;
          else if (i6.maxAtlasPages && this._pages.length >= i6.maxAtlasPages && T.y + m.size.y <= _2.canvas.height && T.height >= m.size.y && T.x + m.size.x <= _2.canvas.width) x = true;
          else {
            let $2 = this._createNewPage();
            _2 = $2, T = $2.currentRow, T.height = m.size.y, x = true;
          }
        }
        x || (_2.currentRow.height > 0 && _2.fixedRows.push(_2.currentRow), T = { x: 0, y: _2.currentRow.y + _2.currentRow.height, height: m.size.y }, _2.fixedRows.push(T), _2.currentRow = { x: 0, y: T.y + T.height, height: 0 });
      }
      if (T.x + m.size.x <= _2.canvas.width) break;
      T === _2.currentRow ? (T.x = 0, T.y += T.height, T.height = 0) : _2.fixedRows.splice(_2.fixedRows.indexOf(T), 1);
    }
    return m.texturePage = this._pages.indexOf(_2), m.texturePosition.x = T.x, m.texturePosition.y = T.y, m.texturePositionClipSpace.x = T.x / _2.canvas.width, m.texturePositionClipSpace.y = T.y / _2.canvas.height, m.sizeClipSpace.x /= _2.canvas.width, m.sizeClipSpace.y /= _2.canvas.height, T.height = Math.max(T.height, m.size.y), T.x += m.size.x, _2.ctx.putImageData(g, m.texturePosition.x - this._workBoundingBox.left, m.texturePosition.y - this._workBoundingBox.top, this._workBoundingBox.left, this._workBoundingBox.top, m.size.x, m.size.y), _2.addGlyph(m), _2.version++, m;
  }
  _findGlyphBoundingBox(e, t, n, s15, o2, r) {
    t.top = 0;
    let a = s15 ? this._config.deviceCellHeight : this._tmpCanvas.height, l = s15 ? this._config.deviceCellWidth : n, u = false;
    for (let c = 0; c < a; c++) {
      for (let d = 0; d < l; d++) {
        let h2 = c * this._tmpCanvas.width * 4 + d * 4 + 3;
        if (e.data[h2] !== 0) {
          t.top = c, u = true;
          break;
        }
      }
      if (u) break;
    }
    t.left = 0, u = false;
    for (let c = 0; c < r + l; c++) {
      for (let d = 0; d < a; d++) {
        let h2 = d * this._tmpCanvas.width * 4 + c * 4 + 3;
        if (e.data[h2] !== 0) {
          t.left = c, u = true;
          break;
        }
      }
      if (u) break;
    }
    t.right = l, u = false;
    for (let c = r + l - 1; c >= r; c--) {
      for (let d = 0; d < a; d++) {
        let h2 = d * this._tmpCanvas.width * 4 + c * 4 + 3;
        if (e.data[h2] !== 0) {
          t.right = c, u = true;
          break;
        }
      }
      if (u) break;
    }
    t.bottom = a, u = false;
    for (let c = a - 1; c >= 0; c--) {
      for (let d = 0; d < l; d++) {
        let h2 = c * this._tmpCanvas.width * 4 + d * 4 + 3;
        if (e.data[h2] !== 0) {
          t.bottom = c, u = true;
          break;
        }
      }
      if (u) break;
    }
    return { texturePage: 0, texturePosition: { x: 0, y: 0 }, texturePositionClipSpace: { x: 0, y: 0 }, size: { x: t.right - t.left + 1, y: t.bottom - t.top + 1 }, sizeClipSpace: { x: t.right - t.left + 1, y: t.bottom - t.top + 1 }, offset: { x: -t.left + r + (s15 || o2 ? Math.floor((this._config.deviceCellWidth - this._config.deviceCharWidth) / 2) : 0), y: -t.top + r + (s15 || o2 ? this._config.lineHeight === 1 ? 0 : Math.round((this._config.deviceCellHeight - this._config.deviceCharHeight) / 2) : 0) } };
  }
};
var ot2 = class {
  constructor(e, t, n) {
    this._usedPixels = 0;
    this._glyphs = [];
    this.version = 0;
    this.currentRow = { x: 0, y: 0, height: 0 };
    this.fixedRows = [];
    if (n) for (let s15 of n) this._glyphs.push(...s15.glyphs), this._usedPixels += s15._usedPixels;
    this.canvas = Sn2(e, t, t), this.ctx = F2(this.canvas.getContext("2d", { alpha: true }));
  }
  get percentageUsed() {
    return this._usedPixels / (this.canvas.width * this.canvas.height);
  }
  get glyphs() {
    return this._glyphs;
  }
  addGlyph(e) {
    this._glyphs.push(e), this._usedPixels += e.size.x * e.size.y;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height), this.currentRow.x = 0, this.currentRow.y = 0, this.currentRow.height = 0, this.fixedRows.length = 0, this.version++;
  }
};
function Di2(i8, e, t, n) {
  let s15 = e.rgba >>> 24, o2 = e.rgba >>> 16 & 255, r = e.rgba >>> 8 & 255, a = t.rgba >>> 24, l = t.rgba >>> 16 & 255, u = t.rgba >>> 8 & 255, c = Math.floor((Math.abs(s15 - a) + Math.abs(o2 - l) + Math.abs(r - u)) / 12), d = true;
  for (let h2 = 0; h2 < i8.data.length; h2 += 4) i8.data[h2] === s15 && i8.data[h2 + 1] === o2 && i8.data[h2 + 2] === r || n && Math.abs(i8.data[h2] - s15) + Math.abs(i8.data[h2 + 1] - o2) + Math.abs(i8.data[h2 + 2] - r) < c ? i8.data[h2 + 3] = 0 : d = false;
  return d;
}
function Jr2(i8) {
  for (let e = 0; e < i8.data.length; e += 4) if (i8.data[e + 3] > 0) return false;
  return true;
}
function Sn2(i8, e, t) {
  let n = i8.createElement("canvas");
  return n.width = e, n.height = t, n;
}
function On(i8, e, t, n, s15, o2, r, a) {
  let l = { foreground: o2.foreground, background: o2.background, cursor: Z, cursorAccent: Z, selectionForeground: Z, selectionBackgroundTransparent: Z, selectionBackgroundOpaque: Z, selectionInactiveBackgroundTransparent: Z, selectionInactiveBackgroundOpaque: Z, overviewRulerBorder: Z, scrollbarSliderBackground: Z, scrollbarSliderHoverBackground: Z, scrollbarSliderActiveBackground: Z, ansi: o2.ansi.slice(), contrastCache: o2.contrastCache, halfContrastCache: o2.halfContrastCache };
  return { customGlyphs: s15.customGlyphs, devicePixelRatio: r, deviceMaxTextureSize: a, letterSpacing: s15.letterSpacing, lineHeight: s15.lineHeight, deviceCellWidth: i8, deviceCellHeight: e, deviceCharWidth: t, deviceCharHeight: n, fontFamily: s15.fontFamily, fontSize: s15.fontSize, fontWeight: s15.fontWeight, fontWeightBold: s15.fontWeightBold, allowTransparency: s15.allowTransparency, drawBoldTextInBrightColors: s15.drawBoldTextInBrightColors, minimumContrastRatio: s15.minimumContrastRatio, colors: l };
}
function Mi2(i8, e) {
  for (let t = 0; t < i8.colors.ansi.length; t++) if (i8.colors.ansi[t].rgba !== e.colors.ansi[t].rgba) return false;
  return i8.devicePixelRatio === e.devicePixelRatio && i8.customGlyphs === e.customGlyphs && i8.lineHeight === e.lineHeight && i8.letterSpacing === e.letterSpacing && i8.fontFamily === e.fontFamily && i8.fontSize === e.fontSize && i8.fontWeight === e.fontWeight && i8.fontWeightBold === e.fontWeightBold && i8.allowTransparency === e.allowTransparency && i8.deviceCharWidth === e.deviceCharWidth && i8.deviceCharHeight === e.deviceCharHeight && i8.drawBoldTextInBrightColors === e.drawBoldTextInBrightColors && i8.minimumContrastRatio === e.minimumContrastRatio && i8.colors.foreground.rgba === e.colors.foreground.rgba && i8.colors.background.rgba === e.colors.background.rgba;
}
function Fn2(i8) {
  return (i8 & 50331648) === 16777216 || (i8 & 50331648) === 33554432;
}
var le = [];
function Nt2(i8, e, t, n, s15, o2, r, a, l) {
  let u = On(n, s15, o2, r, e, t, a, l);
  for (let h2 = 0; h2 < le.length; h2++) {
    let f = le[h2], I = f.ownedBy.indexOf(i8);
    if (I >= 0) {
      if (Mi2(f.config, u)) return f.atlas;
      f.ownedBy.length === 1 ? (f.atlas.dispose(), le.splice(h2, 1)) : f.ownedBy.splice(I, 1);
      break;
    }
  }
  for (let h2 = 0; h2 < le.length; h2++) {
    let f = le[h2];
    if (Mi2(f.config, u)) return f.ownedBy.push(i8), f.atlas;
  }
  let c = i8._core, d = { atlas: new ae2(document, u, c.unicodeService), config: u, ownedBy: [i8] };
  return le.push(d), d.atlas;
}
function Ai2(i8) {
  for (let e = 0; e < le.length; e++) {
    let t = le[e].ownedBy.indexOf(i8);
    if (t !== -1) {
      le[e].ownedBy.length === 1 ? (le[e].atlas.dispose(), le.splice(e, 1)) : le[e].ownedBy.splice(t, 1);
      break;
    }
  }
}
var Ut2 = 600;
var Ht = class {
  constructor(e, t) {
    this._renderCallback = e;
    this._coreBrowserService = t;
    this.isCursorVisible = true, this._coreBrowserService.isFocused && this._restartInterval();
  }
  get isPaused() {
    return !(this._blinkStartTimeout || this._blinkInterval);
  }
  dispose() {
    this._blinkInterval && (this._coreBrowserService.window.clearInterval(this._blinkInterval), this._blinkInterval = void 0), this._blinkStartTimeout && (this._coreBrowserService.window.clearTimeout(this._blinkStartTimeout), this._blinkStartTimeout = void 0), this._animationFrame && (this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame), this._animationFrame = void 0);
  }
  restartBlinkAnimation() {
    this.isPaused || (this._animationTimeRestarted = Date.now(), this.isCursorVisible = true, this._animationFrame || (this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
      this._renderCallback(), this._animationFrame = void 0;
    })));
  }
  _restartInterval(e = Ut2) {
    this._blinkInterval && (this._coreBrowserService.window.clearInterval(this._blinkInterval), this._blinkInterval = void 0), this._blinkStartTimeout = this._coreBrowserService.window.setTimeout(() => {
      if (this._animationTimeRestarted) {
        let t = Ut2 - (Date.now() - this._animationTimeRestarted);
        if (this._animationTimeRestarted = void 0, t > 0) {
          this._restartInterval(t);
          return;
        }
      }
      this.isCursorVisible = false, this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
        this._renderCallback(), this._animationFrame = void 0;
      }), this._blinkInterval = this._coreBrowserService.window.setInterval(() => {
        if (this._animationTimeRestarted) {
          let t = Ut2 - (Date.now() - this._animationTimeRestarted);
          this._animationTimeRestarted = void 0, this._restartInterval(t);
          return;
        }
        this.isCursorVisible = !this.isCursorVisible, this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
          this._renderCallback(), this._animationFrame = void 0;
        });
      }, Ut2);
    }, e);
  }
  pause() {
    this.isCursorVisible = true, this._blinkInterval && (this._coreBrowserService.window.clearInterval(this._blinkInterval), this._blinkInterval = void 0), this._blinkStartTimeout && (this._coreBrowserService.window.clearTimeout(this._blinkStartTimeout), this._blinkStartTimeout = void 0), this._animationFrame && (this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame), this._animationFrame = void 0);
  }
  resume() {
    this.pause(), this._animationTimeRestarted = void 0, this._restartInterval(), this.restartBlinkAnimation();
  }
};
function Si2(i8, e, t) {
  let n = new e.ResizeObserver((s15) => {
    let o2 = s15.find((l) => l.target === i8);
    if (!o2) return;
    if (!("devicePixelContentBoxSize" in o2)) {
      n?.disconnect(), n = void 0;
      return;
    }
    let r = o2.devicePixelContentBoxSize[0].inlineSize, a = o2.devicePixelContentBoxSize[0].blockSize;
    r > 0 && a > 0 && t(r, a);
  });
  try {
    n.observe(i8, { box: ["device-pixel-content-box"] });
  } catch {
    n.disconnect(), n = void 0;
  }
  return O(() => n?.disconnect());
}
function kn(i8) {
  return i8 > 65535 ? (i8 -= 65536, String.fromCharCode((i8 >> 10) + 55296) + String.fromCharCode(i8 % 1024 + 56320)) : String.fromCharCode(i8);
}
var at2 = class i7 extends he2 {
  constructor() {
    super(...arguments);
    this.content = 0;
    this.fg = 0;
    this.bg = 0;
    this.extended = new it();
    this.combinedData = "";
  }
  static fromCharData(t) {
    let n = new i7();
    return n.setFromCharData(t), n;
  }
  isCombined() {
    return this.content & 2097152;
  }
  getWidth() {
    return this.content >> 22;
  }
  getChars() {
    return this.content & 2097152 ? this.combinedData : this.content & 2097151 ? kn(this.content & 2097151) : "";
  }
  getCode() {
    return this.isCombined() ? this.combinedData.charCodeAt(this.combinedData.length - 1) : this.content & 2097151;
  }
  setFromCharData(t) {
    this.fg = t[0], this.bg = 0;
    let n = false;
    if (t[1].length > 2) n = true;
    else if (t[1].length === 2) {
      let s15 = t[1].charCodeAt(0);
      if (55296 <= s15 && s15 <= 56319) {
        let o2 = t[1].charCodeAt(1);
        56320 <= o2 && o2 <= 57343 ? this.content = (s15 - 55296) * 1024 + o2 - 56320 + 65536 | t[2] << 22 : n = true;
      } else n = true;
    } else this.content = t[1].charCodeAt(0) | t[2] << 22;
    n && (this.combinedData = t[1], this.content = 2097152 | t[2] << 22);
  }
  getAsCharData() {
    return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
  }
};
var Gt2 = new Float32Array([2, 0, 0, 0, 0, -2, 0, 0, 0, 0, 1, 0, -1, 1, 0, 1]);
function $t2(i8, e, t) {
  let n = F2(i8.createProgram());
  if (i8.attachShader(n, F2(Pn2(i8, i8.VERTEX_SHADER, e))), i8.attachShader(n, F2(Pn2(i8, i8.FRAGMENT_SHADER, t))), i8.linkProgram(n), i8.getProgramParameter(n, i8.LINK_STATUS)) return n;
  console.error(i8.getProgramInfoLog(n)), i8.deleteProgram(n);
}
function Pn2(i8, e, t) {
  let n = F2(i8.createShader(e));
  if (i8.shaderSource(n, t), i8.compileShader(n), i8.getShaderParameter(n, i8.COMPILE_STATUS)) return n;
  console.error(i8.getShaderInfoLog(n)), i8.deleteShader(n);
}
function Bn(i8, e) {
  let t = Math.min(i8.length * 2, e), n = new Float32Array(t);
  for (let s15 = 0; s15 < i8.length; s15++) n[s15] = i8[s15];
  return n;
}
var Wt2 = class {
  constructor(e) {
    this.texture = e, this.version = -1;
  }
};
var is2 = `#version 300 es
layout (location = 0) in vec2 a_unitquad;
layout (location = 1) in vec2 a_cellpos;
layout (location = 2) in vec2 a_offset;
layout (location = 3) in vec2 a_size;
layout (location = 4) in float a_texpage;
layout (location = 5) in vec2 a_texcoord;
layout (location = 6) in vec2 a_texsize;

uniform mat4 u_projection;
uniform vec2 u_resolution;

out vec2 v_texcoord;
flat out int v_texpage;

void main() {
  vec2 zeroToOne = (a_offset / u_resolution) + a_cellpos + (a_unitquad * a_size);
  gl_Position = u_projection * vec4(zeroToOne, 0.0, 1.0);
  v_texpage = int(a_texpage);
  v_texcoord = a_texcoord + a_unitquad * a_texsize;
}`;
function ns2(i8) {
  let e = "";
  for (let t = 1; t < i8; t++) e += ` else if (v_texpage == ${t}) { outColor = texture(u_texture[${t}], v_texcoord); }`;
  return `#version 300 es
precision lowp float;

in vec2 v_texcoord;
flat in int v_texpage;

uniform sampler2D u_texture[${i8}];

out vec4 outColor;

void main() {
  if (v_texpage == 0) {
    outColor = texture(u_texture[0], v_texcoord);
  } ${e}
}`;
}
var De2 = 11;
var Ve2 = De2 * Float32Array.BYTES_PER_ELEMENT;
var rs2 = 2;
var H2 = 0;
var k;
var Fi2 = 0;
var lt2 = 0;
var Kt2 = class extends B3 {
  constructor(t, n, s15, o2) {
    super();
    this._terminal = t;
    this._gl = n;
    this._dimensions = s15;
    this._optionsService = o2;
    this._activeBuffer = 0;
    this._vertices = { count: 0, attributes: new Float32Array(0), attributesBuffers: [new Float32Array(0), new Float32Array(0)] };
    let r = this._gl;
    ae2.maxAtlasPages === void 0 && (ae2.maxAtlasPages = Math.min(32, F2(r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS))), ae2.maxTextureSize = F2(r.getParameter(r.MAX_TEXTURE_SIZE))), this._program = F2($t2(r, is2, ns2(ae2.maxAtlasPages))), this._register(O(() => r.deleteProgram(this._program))), this._projectionLocation = F2(r.getUniformLocation(this._program, "u_projection")), this._resolutionLocation = F2(r.getUniformLocation(this._program, "u_resolution")), this._textureLocation = F2(r.getUniformLocation(this._program, "u_texture")), this._vertexArrayObject = r.createVertexArray(), r.bindVertexArray(this._vertexArrayObject);
    let a = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), l = r.createBuffer();
    this._register(O(() => r.deleteBuffer(l))), r.bindBuffer(r.ARRAY_BUFFER, l), r.bufferData(r.ARRAY_BUFFER, a, r.STATIC_DRAW), r.enableVertexAttribArray(0), r.vertexAttribPointer(0, 2, this._gl.FLOAT, false, 0, 0);
    let u = new Uint8Array([0, 1, 2, 3]), c = r.createBuffer();
    this._register(O(() => r.deleteBuffer(c))), r.bindBuffer(r.ELEMENT_ARRAY_BUFFER, c), r.bufferData(r.ELEMENT_ARRAY_BUFFER, u, r.STATIC_DRAW), this._attributesBuffer = F2(r.createBuffer()), this._register(O(() => r.deleteBuffer(this._attributesBuffer))), r.bindBuffer(r.ARRAY_BUFFER, this._attributesBuffer), r.enableVertexAttribArray(2), r.vertexAttribPointer(2, 2, r.FLOAT, false, Ve2, 0), r.vertexAttribDivisor(2, 1), r.enableVertexAttribArray(3), r.vertexAttribPointer(3, 2, r.FLOAT, false, Ve2, 2 * Float32Array.BYTES_PER_ELEMENT), r.vertexAttribDivisor(3, 1), r.enableVertexAttribArray(4), r.vertexAttribPointer(4, 1, r.FLOAT, false, Ve2, 4 * Float32Array.BYTES_PER_ELEMENT), r.vertexAttribDivisor(4, 1), r.enableVertexAttribArray(5), r.vertexAttribPointer(5, 2, r.FLOAT, false, Ve2, 5 * Float32Array.BYTES_PER_ELEMENT), r.vertexAttribDivisor(5, 1), r.enableVertexAttribArray(6), r.vertexAttribPointer(6, 2, r.FLOAT, false, Ve2, 7 * Float32Array.BYTES_PER_ELEMENT), r.vertexAttribDivisor(6, 1), r.enableVertexAttribArray(1), r.vertexAttribPointer(1, 2, r.FLOAT, false, Ve2, 9 * Float32Array.BYTES_PER_ELEMENT), r.vertexAttribDivisor(1, 1), r.useProgram(this._program);
    let d = new Int32Array(ae2.maxAtlasPages);
    for (let h2 = 0; h2 < ae2.maxAtlasPages; h2++) d[h2] = h2;
    r.uniform1iv(this._textureLocation, d), r.uniformMatrix4fv(this._projectionLocation, false, Gt2), this._atlasTextures = [];
    for (let h2 = 0; h2 < ae2.maxAtlasPages; h2++) {
      let f = new Wt2(F2(r.createTexture()));
      this._register(O(() => r.deleteTexture(f.texture))), r.activeTexture(r.TEXTURE0 + h2), r.bindTexture(r.TEXTURE_2D, f.texture), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_S, r.CLAMP_TO_EDGE), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_T, r.CLAMP_TO_EDGE), r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, 1, 1, 0, r.RGBA, r.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])), this._atlasTextures[h2] = f;
    }
    r.enable(r.BLEND), r.blendFunc(r.SRC_ALPHA, r.ONE_MINUS_SRC_ALPHA), this.handleResize();
  }
  beginFrame() {
    return this._atlas ? this._atlas.beginFrame() : true;
  }
  updateCell(t, n, s15, o2, r, a, l, u, c) {
    this._updateCell(this._vertices.attributes, t, n, s15, o2, r, a, l, u, c);
  }
  _updateCell(t, n, s15, o2, r, a, l, u, c, d) {
    if (H2 = (s15 * this._terminal.cols + n) * De2, o2 === 0 || o2 === void 0) {
      t.fill(0, H2, H2 + De2 - 1 - rs2);
      return;
    }
    this._atlas && (u && u.length > 1 ? k = this._atlas.getRasterizedGlyphCombinedChar(u, r, a, l, false, this._terminal.element) : k = this._atlas.getRasterizedGlyph(o2, r, a, l, false, this._terminal.element), Fi2 = Math.floor((this._dimensions.device.cell.width - this._dimensions.device.char.width) / 2), r !== d && k.offset.x > Fi2 ? (lt2 = k.offset.x - Fi2, t[H2] = -(k.offset.x - lt2) + this._dimensions.device.char.left, t[H2 + 1] = -k.offset.y + this._dimensions.device.char.top, t[H2 + 2] = (k.size.x - lt2) / this._dimensions.device.canvas.width, t[H2 + 3] = k.size.y / this._dimensions.device.canvas.height, t[H2 + 4] = k.texturePage, t[H2 + 5] = k.texturePositionClipSpace.x + lt2 / this._atlas.pages[k.texturePage].canvas.width, t[H2 + 6] = k.texturePositionClipSpace.y, t[H2 + 7] = k.sizeClipSpace.x - lt2 / this._atlas.pages[k.texturePage].canvas.width, t[H2 + 8] = k.sizeClipSpace.y) : (t[H2] = -k.offset.x + this._dimensions.device.char.left, t[H2 + 1] = -k.offset.y + this._dimensions.device.char.top, t[H2 + 2] = k.size.x / this._dimensions.device.canvas.width, t[H2 + 3] = k.size.y / this._dimensions.device.canvas.height, t[H2 + 4] = k.texturePage, t[H2 + 5] = k.texturePositionClipSpace.x, t[H2 + 6] = k.texturePositionClipSpace.y, t[H2 + 7] = k.sizeClipSpace.x, t[H2 + 8] = k.sizeClipSpace.y), this._optionsService.rawOptions.rescaleOverlappingGlyphs && mn2(o2, c, k.size.x, this._dimensions.device.cell.width) && (t[H2 + 2] = (this._dimensions.device.cell.width - 1) / this._dimensions.device.canvas.width));
  }
  clear() {
    let t = this._terminal, n = t.cols * t.rows * De2;
    this._vertices.count !== n ? this._vertices.attributes = new Float32Array(n) : this._vertices.attributes.fill(0);
    let s15 = 0;
    for (; s15 < this._vertices.attributesBuffers.length; s15++) this._vertices.count !== n ? this._vertices.attributesBuffers[s15] = new Float32Array(n) : this._vertices.attributesBuffers[s15].fill(0);
    this._vertices.count = n, s15 = 0;
    for (let o2 = 0; o2 < t.rows; o2++) for (let r = 0; r < t.cols; r++) this._vertices.attributes[s15 + 9] = r / t.cols, this._vertices.attributes[s15 + 10] = o2 / t.rows, s15 += De2;
  }
  handleResize() {
    let t = this._gl;
    t.useProgram(this._program), t.viewport(0, 0, t.canvas.width, t.canvas.height), t.uniform2f(this._resolutionLocation, t.canvas.width, t.canvas.height), this.clear();
  }
  render(t) {
    if (!this._atlas) return;
    let n = this._gl;
    n.useProgram(this._program), n.bindVertexArray(this._vertexArrayObject), this._activeBuffer = (this._activeBuffer + 1) % 2;
    let s15 = this._vertices.attributesBuffers[this._activeBuffer], o2 = 0;
    for (let r = 0; r < t.lineLengths.length; r++) {
      let a = r * this._terminal.cols * De2, l = this._vertices.attributes.subarray(a, a + t.lineLengths[r] * De2);
      s15.set(l, o2), o2 += l.length;
    }
    n.bindBuffer(n.ARRAY_BUFFER, this._attributesBuffer), n.bufferData(n.ARRAY_BUFFER, s15.subarray(0, o2), n.STREAM_DRAW);
    for (let r = 0; r < this._atlas.pages.length; r++) this._atlas.pages[r].version !== this._atlasTextures[r].version && this._bindAtlasPageTexture(n, this._atlas, r);
    n.drawElementsInstanced(n.TRIANGLE_STRIP, 4, n.UNSIGNED_BYTE, 0, o2 / De2);
  }
  setAtlas(t) {
    this._atlas = t;
    for (let n of this._atlasTextures) n.version = -1;
  }
  _bindAtlasPageTexture(t, n, s15) {
    t.activeTexture(t.TEXTURE0 + s15), t.bindTexture(t.TEXTURE_2D, this._atlasTextures[s15].texture), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, t.RGBA, t.UNSIGNED_BYTE, n.pages[s15].canvas), t.generateMipmap(t.TEXTURE_2D), this._atlasTextures[s15].version = n.pages[s15].version;
  }
  setDimensions(t) {
    this._dimensions = t;
  }
};
var ki2 = class {
  constructor() {
    this.clear();
  }
  clear() {
    this.hasSelection = false, this.columnSelectMode = false, this.viewportStartRow = 0, this.viewportEndRow = 0, this.viewportCappedStartRow = 0, this.viewportCappedEndRow = 0, this.startCol = 0, this.endCol = 0, this.selectionStart = void 0, this.selectionEnd = void 0;
  }
  update(e, t, n, s15 = false) {
    if (this.selectionStart = t, this.selectionEnd = n, !t || !n || t[0] === n[0] && t[1] === n[1]) {
      this.clear();
      return;
    }
    let o2 = e.buffers.active.ydisp, r = t[1] - o2, a = n[1] - o2, l = Math.max(r, 0), u = Math.min(a, e.rows - 1);
    if (l >= e.rows || u < 0) {
      this.clear();
      return;
    }
    this.hasSelection = true, this.columnSelectMode = s15, this.viewportStartRow = r, this.viewportEndRow = a, this.viewportCappedStartRow = l, this.viewportCappedEndRow = u, this.startCol = t[0], this.endCol = n[0];
  }
  isCellSelected(e, t, n) {
    return this.hasSelection ? (n -= e.buffer.active.viewportY, this.columnSelectMode ? this.startCol <= this.endCol ? t >= this.startCol && n >= this.viewportCappedStartRow && t < this.endCol && n <= this.viewportCappedEndRow : t < this.startCol && n >= this.viewportCappedStartRow && t >= this.endCol && n <= this.viewportCappedEndRow : n > this.viewportStartRow && n < this.viewportEndRow || this.viewportStartRow === this.viewportEndRow && n === this.viewportStartRow && t >= this.startCol && t < this.endCol || this.viewportStartRow < this.viewportEndRow && n === this.viewportEndRow && t < this.endCol || this.viewportStartRow < this.viewportEndRow && n === this.viewportStartRow && t >= this.startCol) : false;
  }
};
function Nn() {
  return new ki2();
}
var Ce2 = 4;
var ze = 1;
var qe2 = 2;
var Ct2 = 3;
var Un2 = 2147483648;
var Vt2 = class {
  constructor() {
    this.cells = new Uint32Array(0), this.lineLengths = new Uint32Array(0), this.selection = Nn();
  }
  resize(e, t) {
    let n = e * t * Ce2;
    n !== this.cells.length && (this.cells = new Uint32Array(n), this.lineLengths = new Uint32Array(t));
  }
  clear() {
    this.cells.fill(0, 0), this.lineLengths.fill(0, 0);
  }
};
var ss2 = `#version 300 es
layout (location = 0) in vec2 a_position;
layout (location = 1) in vec2 a_size;
layout (location = 2) in vec4 a_color;
layout (location = 3) in vec2 a_unitquad;

uniform mat4 u_projection;

out vec4 v_color;

void main() {
  vec2 zeroToOne = a_position + (a_unitquad * a_size);
  gl_Position = u_projection * vec4(zeroToOne, 0.0, 1.0);
  v_color = a_color;
}`;
var os2 = `#version 300 es
precision lowp float;

in vec4 v_color;

out vec4 outColor;

void main() {
  outColor = v_color;
}`;
var Ee2 = 8;
var Pi2 = Ee2 * Float32Array.BYTES_PER_ELEMENT;
var as2 = 20 * Ee2;
var zt2 = class {
  constructor() {
    this.attributes = new Float32Array(as2), this.count = 0;
  }
};
var xe2 = 0;
var Hn2 = 0;
var Wn2 = 0;
var Gn2 = 0;
var $n2 = 0;
var Kn2 = 0;
var Vn2 = 0;
var qt = class extends B3 {
  constructor(t, n, s15, o2) {
    super();
    this._terminal = t;
    this._gl = n;
    this._dimensions = s15;
    this._themeService = o2;
    this._vertices = new zt2();
    this._verticesCursor = new zt2();
    let r = this._gl;
    this._program = F2($t2(r, ss2, os2)), this._register(O(() => r.deleteProgram(this._program))), this._projectionLocation = F2(r.getUniformLocation(this._program, "u_projection")), this._vertexArrayObject = r.createVertexArray(), r.bindVertexArray(this._vertexArrayObject);
    let a = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), l = r.createBuffer();
    this._register(O(() => r.deleteBuffer(l))), r.bindBuffer(r.ARRAY_BUFFER, l), r.bufferData(r.ARRAY_BUFFER, a, r.STATIC_DRAW), r.enableVertexAttribArray(3), r.vertexAttribPointer(3, 2, this._gl.FLOAT, false, 0, 0);
    let u = new Uint8Array([0, 1, 2, 3]), c = r.createBuffer();
    this._register(O(() => r.deleteBuffer(c))), r.bindBuffer(r.ELEMENT_ARRAY_BUFFER, c), r.bufferData(r.ELEMENT_ARRAY_BUFFER, u, r.STATIC_DRAW), this._attributesBuffer = F2(r.createBuffer()), this._register(O(() => r.deleteBuffer(this._attributesBuffer))), r.bindBuffer(r.ARRAY_BUFFER, this._attributesBuffer), r.enableVertexAttribArray(0), r.vertexAttribPointer(0, 2, r.FLOAT, false, Pi2, 0), r.vertexAttribDivisor(0, 1), r.enableVertexAttribArray(1), r.vertexAttribPointer(1, 2, r.FLOAT, false, Pi2, 2 * Float32Array.BYTES_PER_ELEMENT), r.vertexAttribDivisor(1, 1), r.enableVertexAttribArray(2), r.vertexAttribPointer(2, 4, r.FLOAT, false, Pi2, 4 * Float32Array.BYTES_PER_ELEMENT), r.vertexAttribDivisor(2, 1), this._updateCachedColors(o2.colors), this._register(this._themeService.onChangeColors((d) => {
      this._updateCachedColors(d), this._updateViewportRectangle();
    }));
  }
  renderBackgrounds() {
    this._renderVertices(this._vertices);
  }
  renderCursor() {
    this._renderVertices(this._verticesCursor);
  }
  _renderVertices(t) {
    let n = this._gl;
    n.useProgram(this._program), n.bindVertexArray(this._vertexArrayObject), n.uniformMatrix4fv(this._projectionLocation, false, Gt2), n.bindBuffer(n.ARRAY_BUFFER, this._attributesBuffer), n.bufferData(n.ARRAY_BUFFER, t.attributes, n.DYNAMIC_DRAW), n.drawElementsInstanced(this._gl.TRIANGLE_STRIP, 4, n.UNSIGNED_BYTE, 0, t.count);
  }
  handleResize() {
    this._updateViewportRectangle();
  }
  setDimensions(t) {
    this._dimensions = t;
  }
  _updateCachedColors(t) {
    this._bgFloat = this._colorToFloat32Array(t.background), this._cursorFloat = this._colorToFloat32Array(t.cursor);
  }
  _updateViewportRectangle() {
    this._addRectangleFloat(this._vertices.attributes, 0, 0, 0, this._terminal.cols * this._dimensions.device.cell.width, this._terminal.rows * this._dimensions.device.cell.height, this._bgFloat);
  }
  updateBackgrounds(t) {
    let n = this._terminal, s15 = this._vertices, o2 = 1, r, a, l, u, c, d, h2, f, I, L2, M2;
    for (r = 0; r < n.rows; r++) {
      for (l = -1, u = 0, c = 0, d = false, a = 0; a < n.cols; a++) h2 = (r * n.cols + a) * Ce2, f = t.cells[h2 + ze], I = t.cells[h2 + qe2], L2 = !!(I & 67108864), (f !== u || I !== c && (d || L2)) && ((u !== 0 || d && c !== 0) && (M2 = o2++ * Ee2, this._updateRectangle(s15, M2, c, u, l, a, r)), l = a, u = f, c = I, d = L2);
      (u !== 0 || d && c !== 0) && (M2 = o2++ * Ee2, this._updateRectangle(s15, M2, c, u, l, n.cols, r));
    }
    s15.count = o2;
  }
  updateCursor(t) {
    let n = this._verticesCursor, s15 = t.cursor;
    if (!s15 || s15.style === "block") {
      n.count = 0;
      return;
    }
    let o2, r = 0;
    (s15.style === "bar" || s15.style === "outline") && (o2 = r++ * Ee2, this._addRectangleFloat(n.attributes, o2, s15.x * this._dimensions.device.cell.width, s15.y * this._dimensions.device.cell.height, s15.style === "bar" ? s15.dpr * s15.cursorWidth : s15.dpr, this._dimensions.device.cell.height, this._cursorFloat)), (s15.style === "underline" || s15.style === "outline") && (o2 = r++ * Ee2, this._addRectangleFloat(n.attributes, o2, s15.x * this._dimensions.device.cell.width, (s15.y + 1) * this._dimensions.device.cell.height - s15.dpr, s15.width * this._dimensions.device.cell.width, s15.dpr, this._cursorFloat)), s15.style === "outline" && (o2 = r++ * Ee2, this._addRectangleFloat(n.attributes, o2, s15.x * this._dimensions.device.cell.width, s15.y * this._dimensions.device.cell.height, s15.width * this._dimensions.device.cell.width, s15.dpr, this._cursorFloat), o2 = r++ * Ee2, this._addRectangleFloat(n.attributes, o2, (s15.x + s15.width) * this._dimensions.device.cell.width - s15.dpr, s15.y * this._dimensions.device.cell.height, s15.dpr, this._dimensions.device.cell.height, this._cursorFloat)), n.count = r;
  }
  _updateRectangle(t, n, s15, o2, r, a, l) {
    if (s15 & 67108864) switch (s15 & 50331648) {
      case 16777216:
      case 33554432:
        xe2 = this._themeService.colors.ansi[s15 & 255].rgba;
        break;
      case 50331648:
        xe2 = (s15 & 16777215) << 8;
        break;
      case 0:
      default:
        xe2 = this._themeService.colors.foreground.rgba;
    }
    else switch (o2 & 50331648) {
      case 16777216:
      case 33554432:
        xe2 = this._themeService.colors.ansi[o2 & 255].rgba;
        break;
      case 50331648:
        xe2 = (o2 & 16777215) << 8;
        break;
      case 0:
      default:
        xe2 = this._themeService.colors.background.rgba;
    }
    t.attributes.length < n + 4 && (t.attributes = Bn(t.attributes, this._terminal.rows * this._terminal.cols * Ee2)), Hn2 = r * this._dimensions.device.cell.width, Wn2 = l * this._dimensions.device.cell.height, Gn2 = (xe2 >> 24 & 255) / 255, $n2 = (xe2 >> 16 & 255) / 255, Kn2 = (xe2 >> 8 & 255) / 255, Vn2 = 1, this._addRectangle(t.attributes, n, Hn2, Wn2, (a - r) * this._dimensions.device.cell.width, this._dimensions.device.cell.height, Gn2, $n2, Kn2, Vn2);
  }
  _addRectangle(t, n, s15, o2, r, a, l, u, c, d) {
    t[n] = s15 / this._dimensions.device.canvas.width, t[n + 1] = o2 / this._dimensions.device.canvas.height, t[n + 2] = r / this._dimensions.device.canvas.width, t[n + 3] = a / this._dimensions.device.canvas.height, t[n + 4] = l, t[n + 5] = u, t[n + 6] = c, t[n + 7] = d;
  }
  _addRectangleFloat(t, n, s15, o2, r, a, l) {
    t[n] = s15 / this._dimensions.device.canvas.width, t[n + 1] = o2 / this._dimensions.device.canvas.height, t[n + 2] = r / this._dimensions.device.canvas.width, t[n + 3] = a / this._dimensions.device.canvas.height, t[n + 4] = l[0], t[n + 5] = l[1], t[n + 6] = l[2], t[n + 7] = l[3];
  }
  _colorToFloat32Array(t) {
    return new Float32Array([(t.rgba >> 24 & 255) / 255, (t.rgba >> 16 & 255) / 255, (t.rgba >> 8 & 255) / 255, (t.rgba & 255) / 255]);
  }
};
var jt2 = class extends B3 {
  constructor(t, n, s15, o2, r, a, l, u) {
    super();
    this._container = n;
    this._alpha = r;
    this._coreBrowserService = a;
    this._optionsService = l;
    this._themeService = u;
    this._deviceCharWidth = 0;
    this._deviceCharHeight = 0;
    this._deviceCellWidth = 0;
    this._deviceCellHeight = 0;
    this._deviceCharLeft = 0;
    this._deviceCharTop = 0;
    this._canvas = this._coreBrowserService.mainDocument.createElement("canvas"), this._canvas.classList.add(`xterm-${s15}-layer`), this._canvas.style.zIndex = o2.toString(), this._initCanvas(), this._container.appendChild(this._canvas), this._register(this._themeService.onChangeColors((c) => {
      this._refreshCharAtlas(t, c), this.reset(t);
    })), this._register(O(() => {
      this._canvas.remove();
    }));
  }
  _initCanvas() {
    this._ctx = F2(this._canvas.getContext("2d", { alpha: this._alpha })), this._alpha || this._clearAll();
  }
  handleBlur(t) {
  }
  handleFocus(t) {
  }
  handleCursorMove(t) {
  }
  handleGridChanged(t, n, s15) {
  }
  handleSelectionChanged(t, n, s15, o2 = false) {
  }
  _setTransparency(t, n) {
    if (n === this._alpha) return;
    let s15 = this._canvas;
    this._alpha = n, this._canvas = this._canvas.cloneNode(), this._initCanvas(), this._container.replaceChild(this._canvas, s15), this._refreshCharAtlas(t, this._themeService.colors), this.handleGridChanged(t, 0, t.rows - 1);
  }
  _refreshCharAtlas(t, n) {
    this._deviceCharWidth <= 0 && this._deviceCharHeight <= 0 || (this._charAtlas = Nt2(t, this._optionsService.rawOptions, n, this._deviceCellWidth, this._deviceCellHeight, this._deviceCharWidth, this._deviceCharHeight, this._coreBrowserService.dpr, 2048), this._charAtlas.warmUp());
  }
  resize(t, n) {
    this._deviceCellWidth = n.device.cell.width, this._deviceCellHeight = n.device.cell.height, this._deviceCharWidth = n.device.char.width, this._deviceCharHeight = n.device.char.height, this._deviceCharLeft = n.device.char.left, this._deviceCharTop = n.device.char.top, this._canvas.width = n.device.canvas.width, this._canvas.height = n.device.canvas.height, this._canvas.style.width = `${n.css.canvas.width}px`, this._canvas.style.height = `${n.css.canvas.height}px`, this._alpha || this._clearAll(), this._refreshCharAtlas(t, this._themeService.colors);
  }
  _fillBottomLineAtCells(t, n, s15 = 1) {
    this._ctx.fillRect(t * this._deviceCellWidth, (n + 1) * this._deviceCellHeight - this._coreBrowserService.dpr - 1, s15 * this._deviceCellWidth, this._coreBrowserService.dpr);
  }
  _clearAll() {
    this._alpha ? this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height) : (this._ctx.fillStyle = this._themeService.colors.background.css, this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height));
  }
  _clearCells(t, n, s15, o2) {
    this._alpha ? this._ctx.clearRect(t * this._deviceCellWidth, n * this._deviceCellHeight, s15 * this._deviceCellWidth, o2 * this._deviceCellHeight) : (this._ctx.fillStyle = this._themeService.colors.background.css, this._ctx.fillRect(t * this._deviceCellWidth, n * this._deviceCellHeight, s15 * this._deviceCellWidth, o2 * this._deviceCellHeight));
  }
  _fillCharTrueColor(t, n, s15, o2) {
    this._ctx.font = this._getFont(t, false, false), this._ctx.textBaseline = St2, this._clipCell(s15, o2, n.getWidth()), this._ctx.fillText(n.getChars(), s15 * this._deviceCellWidth + this._deviceCharLeft, o2 * this._deviceCellHeight + this._deviceCharTop + this._deviceCharHeight);
  }
  _clipCell(t, n, s15) {
    this._ctx.beginPath(), this._ctx.rect(t * this._deviceCellWidth, n * this._deviceCellHeight, s15 * this._deviceCellWidth, this._deviceCellHeight), this._ctx.clip();
  }
  _getFont(t, n, s15) {
    let o2 = n ? t.options.fontWeightBold : t.options.fontWeight;
    return `${s15 ? "italic" : ""} ${o2} ${t.options.fontSize * this._coreBrowserService.dpr}px ${t.options.fontFamily}`;
  }
};
var Xt2 = class extends jt2 {
  constructor(e, t, n, s15, o2, r, a) {
    super(n, e, "link", t, true, o2, r, a), this._register(s15.onShowLinkUnderline((l) => this._handleShowLinkUnderline(l))), this._register(s15.onHideLinkUnderline((l) => this._handleHideLinkUnderline(l)));
  }
  resize(e, t) {
    super.resize(e, t), this._state = void 0;
  }
  reset(e) {
    this._clearCurrentLink();
  }
  _clearCurrentLink() {
    if (this._state) {
      this._clearCells(this._state.x1, this._state.y1, this._state.cols - this._state.x1, 1);
      let e = this._state.y2 - this._state.y1 - 1;
      e > 0 && this._clearCells(0, this._state.y1 + 1, this._state.cols, e), this._clearCells(0, this._state.y2, this._state.x2, 1), this._state = void 0;
    }
  }
  _handleShowLinkUnderline(e) {
    if (e.fg === 257 ? this._ctx.fillStyle = this._themeService.colors.background.css : e.fg !== void 0 && Fn2(e.fg) ? this._ctx.fillStyle = this._themeService.colors.ansi[e.fg].css : this._ctx.fillStyle = this._themeService.colors.foreground.css, e.y1 === e.y2) this._fillBottomLineAtCells(e.x1, e.y1, e.x2 - e.x1);
    else {
      this._fillBottomLineAtCells(e.x1, e.y1, e.cols - e.x1);
      for (let t = e.y1 + 1; t < e.y2; t++) this._fillBottomLineAtCells(0, t, e.cols);
      this._fillBottomLineAtCells(0, e.y2, e.x2);
    }
    this._state = e;
  }
  _handleHideLinkUnderline(e) {
    this._clearCurrentLink();
  }
};
var te = typeof window == "object" ? window : globalThis;
var Zt2 = class Zt3 {
  constructor() {
    this.mapWindowIdToZoomLevel = /* @__PURE__ */ new Map();
    this._onDidChangeZoomLevel = new D3();
    this.onDidChangeZoomLevel = this._onDidChangeZoomLevel.event;
    this.mapWindowIdToZoomFactor = /* @__PURE__ */ new Map();
    this._onDidChangeFullscreen = new D3();
    this.onDidChangeFullscreen = this._onDidChangeFullscreen.event;
    this.mapWindowIdToFullScreen = /* @__PURE__ */ new Map();
  }
  getZoomLevel(e) {
    return this.mapWindowIdToZoomLevel.get(this.getWindowId(e)) ?? 0;
  }
  setZoomLevel(e, t) {
    if (this.getZoomLevel(t) === e) return;
    let n = this.getWindowId(t);
    this.mapWindowIdToZoomLevel.set(n, e), this._onDidChangeZoomLevel.fire(n);
  }
  getZoomFactor(e) {
    return this.mapWindowIdToZoomFactor.get(this.getWindowId(e)) ?? 1;
  }
  setZoomFactor(e, t) {
    this.mapWindowIdToZoomFactor.set(this.getWindowId(t), e);
  }
  setFullscreen(e, t) {
    if (this.isFullscreen(t) === e) return;
    let n = this.getWindowId(t);
    this.mapWindowIdToFullScreen.set(n, e), this._onDidChangeFullscreen.fire(n);
  }
  isFullscreen(e) {
    return !!this.mapWindowIdToFullScreen.get(this.getWindowId(e));
  }
  getWindowId(e) {
    return e.vscodeWindowId;
  }
};
Zt2.INSTANCE = new Zt2();
var Qt2 = Zt2;
function us2(i8, e, t) {
  typeof e == "string" && (e = i8.matchMedia(e)), e.addEventListener("change", t);
}
var Wa2 = Qt2.INSTANCE.onDidChangeZoomLevel;
var Ga2 = Qt2.INSTANCE.onDidChangeFullscreen;
var je2 = typeof navigator == "object" ? navigator.userAgent : "";
var Cn2 = je2.indexOf("Firefox") >= 0;
var ut2 = je2.indexOf("AppleWebKit") >= 0;
var zn2 = je2.indexOf("Chrome") >= 0;
var Bi2 = !zn2 && je2.indexOf("Safari") >= 0;
var $a2 = je2.indexOf("Electron/") >= 0;
var Ka2 = je2.indexOf("Android") >= 0;
var Yt2 = false;
if (typeof te.matchMedia == "function") {
  let i8 = te.matchMedia("(display-mode: standalone) or (display-mode: window-controls-overlay)"), e = te.matchMedia("(display-mode: fullscreen)");
  Yt2 = i8.matches, us2(te, i8, ({ matches: t }) => {
    Yt2 && e.matches || (Yt2 = t);
  });
}
function qn2() {
  return Yt2;
}
var Xe2 = "en";
var Ui2 = false;
var ni2 = false;
var ti2 = false;
var cs2 = false;
var Xn2 = false;
var Yn2 = false;
var ds2 = false;
var hs2 = false;
var ps2 = false;
var fs2 = false;
var ei2;
var ii2 = Xe2;
var jn2 = Xe2;
var ms2;
var ye2;
var Ie2 = globalThis;
var re2;
typeof Ie2.vscode < "u" && typeof Ie2.vscode.process < "u" ? re2 = Ie2.vscode.process : typeof process < "u" && typeof process?.versions?.node == "string" && (re2 = process);
var Qn2 = typeof re2?.versions?.electron == "string";
var _s2 = Qn2 && re2?.type === "renderer";
if (typeof re2 == "object") {
  Ui2 = re2.platform === "win32", ni2 = re2.platform === "darwin", ti2 = re2.platform === "linux", cs2 = ti2 && !!re2.env.SNAP && !!re2.env.SNAP_REVISION, ds2 = Qn2, ps2 = !!re2.env.CI || !!re2.env.BUILD_ARTIFACTSTAGINGDIRECTORY, ei2 = Xe2, ii2 = Xe2;
  let i8 = re2.env.VSCODE_NLS_CONFIG;
  if (i8) try {
    let e = JSON.parse(i8);
    ei2 = e.userLocale, jn2 = e.osLocale, ii2 = e.resolvedLanguage || Xe2, ms2 = e.languagePack?.translationsConfigFile;
  } catch {
  }
  Xn2 = true;
} else typeof navigator == "object" && !_s2 ? (ye2 = navigator.userAgent, Ui2 = ye2.indexOf("Windows") >= 0, ni2 = ye2.indexOf("Macintosh") >= 0, hs2 = (ye2.indexOf("Macintosh") >= 0 || ye2.indexOf("iPad") >= 0 || ye2.indexOf("iPhone") >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0, ti2 = ye2.indexOf("Linux") >= 0, fs2 = ye2?.indexOf("Mobi") >= 0, Yn2 = true, ii2 = globalThis._VSCODE_NLS_LANGUAGE || Xe2, ei2 = navigator.language.toLowerCase(), jn2 = ei2) : console.error("Unable to resolve platform.");
var Ni2 = 0;
ni2 ? Ni2 = 1 : Ui2 ? Ni2 = 3 : ti2 && (Ni2 = 2);
var ri2 = Xn2;
var bs2 = Yn2 && typeof Ie2.importScripts == "function";
var Va2 = bs2 ? Ie2.origin : void 0;
var _e3 = ye2;
var Me = ii2;
var vs2;
((n) => {
  function i8() {
    return Me;
  }
  n.value = i8;
  function e() {
    return Me.length === 2 ? Me === "en" : Me.length >= 3 ? Me[0] === "e" && Me[1] === "n" && Me[2] === "-" : false;
  }
  n.isDefaultVariant = e;
  function t() {
    return Me === "en";
  }
  n.isDefault = t;
})(vs2 || (vs2 = {}));
var Ts2 = typeof Ie2.postMessage == "function" && !Ie2.importScripts;
var Zn2 = (() => {
  if (Ts2) {
    let i8 = [];
    Ie2.addEventListener("message", (t) => {
      if (t.data && t.data.vscodeScheduleAsyncWork) for (let n = 0, s15 = i8.length; n < s15; n++) {
        let o2 = i8[n];
        if (o2.id === t.data.vscodeScheduleAsyncWork) {
          i8.splice(n, 1), o2.callback();
          return;
        }
      }
    });
    let e = 0;
    return (t) => {
      let n = ++e;
      i8.push({ id: n, callback: t }), Ie2.postMessage({ vscodeScheduleAsyncWork: n }, "*");
    };
  }
  return (i8) => setTimeout(i8);
})();
var gs2 = !!(_e3 && _e3.indexOf("Chrome") >= 0);
var Ca2 = !!(_e3 && _e3.indexOf("Firefox") >= 0);
var za2 = !!(!gs2 && _e3 && _e3.indexOf("Safari") >= 0);
var qa2 = !!(_e3 && _e3.indexOf("Edg/") >= 0);
var ja2 = !!(_e3 && _e3.indexOf("Android") >= 0);
var Ae2 = typeof navigator == "object" ? navigator : {};
var xs2 = { clipboard: { writeText: ri2 || document.queryCommandSupported && document.queryCommandSupported("copy") || !!(Ae2 && Ae2.clipboard && Ae2.clipboard.writeText), readText: ri2 || !!(Ae2 && Ae2.clipboard && Ae2.clipboard.readText) }, keyboard: ri2 || qn2() ? 0 : Ae2.keyboard || Bi2 ? 1 : 2, touch: "ontouchstart" in te || Ae2.maxTouchPoints > 0, pointerEvents: te.PointerEvent && ("ontouchstart" in te || navigator.maxTouchPoints > 0) };
var dt2 = class {
  constructor() {
    this._keyCodeToStr = [], this._strToKeyCode = /* @__PURE__ */ Object.create(null);
  }
  define(e, t) {
    this._keyCodeToStr[e] = t, this._strToKeyCode[t.toLowerCase()] = e;
  }
  keyCodeToStr(e) {
    return this._keyCodeToStr[e];
  }
  strToKeyCode(e) {
    return this._strToKeyCode[e.toLowerCase()] || 0;
  }
};
var Hi2 = new dt2();
var Jn2 = new dt2();
var er2 = new dt2();
var Es2 = new Array(230);
var tr2;
((r) => {
  function i8(a) {
    return Hi2.keyCodeToStr(a);
  }
  r.toString = i8;
  function e(a) {
    return Hi2.strToKeyCode(a);
  }
  r.fromString = e;
  function t(a) {
    return Jn2.keyCodeToStr(a);
  }
  r.toUserSettingsUS = t;
  function n(a) {
    return er2.keyCodeToStr(a);
  }
  r.toUserSettingsGeneral = n;
  function s15(a) {
    return Jn2.strToKeyCode(a) || er2.strToKeyCode(a);
  }
  r.fromUserSettings = s15;
  function o2(a) {
    if (a >= 98 && a <= 113) return null;
    switch (a) {
      case 16:
        return "Up";
      case 18:
        return "Down";
      case 15:
        return "Left";
      case 17:
        return "Right";
    }
    return Hi2.keyCodeToStr(a);
  }
  r.toElectronAccelerator = o2;
})(tr2 || (tr2 = {}));
var nr2 = Object.freeze(function(i8, e) {
  let t = setTimeout(i8.bind(e), 0);
  return { dispose() {
    clearTimeout(t);
  } };
});
var Is2;
((n) => {
  function i8(s15) {
    return s15 === n.None || s15 === n.Cancelled || s15 instanceof Wi2 ? true : !s15 || typeof s15 != "object" ? false : typeof s15.isCancellationRequested == "boolean" && typeof s15.onCancellationRequested == "function";
  }
  n.isCancellationToken = i8, n.None = Object.freeze({ isCancellationRequested: false, onCancellationRequested: ee2.None }), n.Cancelled = Object.freeze({ isCancellationRequested: true, onCancellationRequested: nr2 });
})(Is2 || (Is2 = {}));
var Wi2 = class {
  constructor() {
    this._isCancelled = false;
    this._emitter = null;
  }
  cancel() {
    this._isCancelled || (this._isCancelled = true, this._emitter && (this._emitter.fire(void 0), this.dispose()));
  }
  get isCancellationRequested() {
    return this._isCancelled;
  }
  get onCancellationRequested() {
    return this._isCancelled ? nr2 : (this._emitter || (this._emitter = new D3()), this._emitter.event);
  }
  dispose() {
    this._emitter && (this._emitter.dispose(), this._emitter = null);
  }
};
var ws2;
var oi2;
(function() {
  typeof globalThis.requestIdleCallback != "function" || typeof globalThis.cancelIdleCallback != "function" ? oi2 = (i8, e) => {
    Zn2(() => {
      if (t) return;
      let n = Date.now() + 15;
      e(Object.freeze({ didTimeout: true, timeRemaining() {
        return Math.max(0, n - Date.now());
      } }));
    });
    let t = false;
    return { dispose() {
      t || (t = true);
    } };
  } : oi2 = (i8, e, t) => {
    let n = i8.requestIdleCallback(e, typeof t == "number" ? { timeout: t } : void 0), s15 = false;
    return { dispose() {
      s15 || (s15 = true, i8.cancelIdleCallback(n));
    } };
  }, ws2 = (i8) => oi2(globalThis, i8);
})();
var Rs2;
((t) => {
  async function i8(n) {
    let s15, o2 = await Promise.all(n.map((r) => r.then((a) => a, (a) => {
      s15 || (s15 = a);
    })));
    if (typeof s15 < "u") throw s15;
    return o2;
  }
  t.settled = i8;
  function e(n) {
    return new Promise(async (s15, o2) => {
      try {
        await n(s15, o2);
      } catch (r) {
        o2(r);
      }
    });
  }
  t.withAsyncBody = e;
})(Rs2 || (Rs2 = {}));
var Q3 = class Q4 {
  static fromArray(e) {
    return new Q4((t) => {
      t.emitMany(e);
    });
  }
  static fromPromise(e) {
    return new Q4(async (t) => {
      t.emitMany(await e);
    });
  }
  static fromPromises(e) {
    return new Q4(async (t) => {
      await Promise.all(e.map(async (n) => t.emitOne(await n)));
    });
  }
  static merge(e) {
    return new Q4(async (t) => {
      await Promise.all(e.map(async (n) => {
        for await (let s15 of n) t.emitOne(s15);
      }));
    });
  }
  constructor(e, t) {
    this._state = 0, this._results = [], this._error = null, this._onReturn = t, this._onStateChanged = new D3(), queueMicrotask(async () => {
      let n = { emitOne: (s15) => this.emitOne(s15), emitMany: (s15) => this.emitMany(s15), reject: (s15) => this.reject(s15) };
      try {
        await Promise.resolve(e(n)), this.resolve();
      } catch (s15) {
        this.reject(s15);
      } finally {
        n.emitOne = void 0, n.emitMany = void 0, n.reject = void 0;
      }
    });
  }
  [Symbol.asyncIterator]() {
    let e = 0;
    return { next: async () => {
      do {
        if (this._state === 2) throw this._error;
        if (e < this._results.length) return { done: false, value: this._results[e++] };
        if (this._state === 1) return { done: true, value: void 0 };
        await ee2.toPromise(this._onStateChanged.event);
      } while (true);
    }, return: async () => (this._onReturn?.(), { done: true, value: void 0 }) };
  }
  static map(e, t) {
    return new Q4(async (n) => {
      for await (let s15 of e) n.emitOne(t(s15));
    });
  }
  map(e) {
    return Q4.map(this, e);
  }
  static filter(e, t) {
    return new Q4(async (n) => {
      for await (let s15 of e) t(s15) && n.emitOne(s15);
    });
  }
  filter(e) {
    return Q4.filter(this, e);
  }
  static coalesce(e) {
    return Q4.filter(e, (t) => !!t);
  }
  coalesce() {
    return Q4.coalesce(this);
  }
  static async toPromise(e) {
    let t = [];
    for await (let n of e) t.push(n);
    return t;
  }
  toPromise() {
    return Q4.toPromise(this);
  }
  emitOne(e) {
    this._state === 0 && (this._results.push(e), this._onStateChanged.fire());
  }
  emitMany(e) {
    this._state === 0 && (this._results = this._results.concat(e), this._onStateChanged.fire());
  }
  resolve() {
    this._state === 0 && (this._state = 1, this._onStateChanged.fire());
  }
  reject(e) {
    this._state === 0 && (this._state = 2, this._error = e, this._onStateChanged.fire());
  }
};
Q3.EMPTY = Q3.fromArray([]);
function sr2(i8) {
  return 55296 <= i8 && i8 <= 56319;
}
function Gi(i8) {
  return 56320 <= i8 && i8 <= 57343;
}
function or2(i8, e) {
  return (i8 - 55296 << 10) + (e - 56320) + 65536;
}
function ur2(i8) {
  return Ki2(i8, 0);
}
function Ki2(i8, e) {
  switch (typeof i8) {
    case "object":
      return i8 === null ? Le2(349, e) : Array.isArray(i8) ? As(i8, e) : Ss2(i8, e);
    case "string":
      return cr3(i8, e);
    case "boolean":
      return Ms2(i8, e);
    case "number":
      return Le2(i8, e);
    case "undefined":
      return Le2(937, e);
    default:
      return Le2(617, e);
  }
}
function Le2(i8, e) {
  return (e << 5) - e + i8 | 0;
}
function Ms2(i8, e) {
  return Le2(i8 ? 433 : 863, e);
}
function cr3(i8, e) {
  e = Le2(149417, e);
  for (let t = 0, n = i8.length; t < n; t++) e = Le2(i8.charCodeAt(t), e);
  return e;
}
function As(i8, e) {
  return e = Le2(104579, e), i8.reduce((t, n) => Ki2(n, t), e);
}
function Ss2(i8, e) {
  return e = Le2(181387, e), Object.keys(i8).sort().reduce((t, n) => (t = cr3(n, t), Ki2(i8[n], t)), e);
}
function $i2(i8, e, t = 32) {
  let n = t - e, s15 = ~((1 << n) - 1);
  return (i8 << e | (s15 & i8) >>> n) >>> 0;
}
function ar2(i8, e = 0, t = i8.byteLength, n = 0) {
  for (let s15 = 0; s15 < t; s15++) i8[e + s15] = n;
}
function Os2(i8, e, t = "0") {
  for (; i8.length < e; ) i8 = t + i8;
  return i8;
}
function ht(i8, e = 32) {
  return i8 instanceof ArrayBuffer ? Array.from(new Uint8Array(i8)).map((t) => t.toString(16).padStart(2, "0")).join("") : Os2((i8 >>> 0).toString(16), e / 4);
}
var ai2 = class ai3 {
  constructor() {
    this._h0 = 1732584193;
    this._h1 = 4023233417;
    this._h2 = 2562383102;
    this._h3 = 271733878;
    this._h4 = 3285377520;
    this._buff = new Uint8Array(67), this._buffDV = new DataView(this._buff.buffer), this._buffLen = 0, this._totalLen = 0, this._leftoverHighSurrogate = 0, this._finished = false;
  }
  update(e) {
    let t = e.length;
    if (t === 0) return;
    let n = this._buff, s15 = this._buffLen, o2 = this._leftoverHighSurrogate, r, a;
    for (o2 !== 0 ? (r = o2, a = -1, o2 = 0) : (r = e.charCodeAt(0), a = 0); ; ) {
      let l = r;
      if (sr2(r)) if (a + 1 < t) {
        let u = e.charCodeAt(a + 1);
        Gi(u) ? (a++, l = or2(r, u)) : l = 65533;
      } else {
        o2 = r;
        break;
      }
      else Gi(r) && (l = 65533);
      if (s15 = this._push(n, s15, l), a++, a < t) r = e.charCodeAt(a);
      else break;
    }
    this._buffLen = s15, this._leftoverHighSurrogate = o2;
  }
  _push(e, t, n) {
    return n < 128 ? e[t++] = n : n < 2048 ? (e[t++] = 192 | (n & 1984) >>> 6, e[t++] = 128 | (n & 63) >>> 0) : n < 65536 ? (e[t++] = 224 | (n & 61440) >>> 12, e[t++] = 128 | (n & 4032) >>> 6, e[t++] = 128 | (n & 63) >>> 0) : (e[t++] = 240 | (n & 1835008) >>> 18, e[t++] = 128 | (n & 258048) >>> 12, e[t++] = 128 | (n & 4032) >>> 6, e[t++] = 128 | (n & 63) >>> 0), t >= 64 && (this._step(), t -= 64, this._totalLen += 64, e[0] = e[64], e[1] = e[65], e[2] = e[66]), t;
  }
  digest() {
    return this._finished || (this._finished = true, this._leftoverHighSurrogate && (this._leftoverHighSurrogate = 0, this._buffLen = this._push(this._buff, this._buffLen, 65533)), this._totalLen += this._buffLen, this._wrapUp()), ht(this._h0) + ht(this._h1) + ht(this._h2) + ht(this._h3) + ht(this._h4);
  }
  _wrapUp() {
    this._buff[this._buffLen++] = 128, ar2(this._buff, this._buffLen), this._buffLen > 56 && (this._step(), ar2(this._buff));
    let e = 8 * this._totalLen;
    this._buffDV.setUint32(56, Math.floor(e / 4294967296), false), this._buffDV.setUint32(60, e % 4294967296, false), this._step();
  }
  _step() {
    let e = ai3._bigBlock32, t = this._buffDV;
    for (let d = 0; d < 64; d += 4) e.setUint32(d, t.getUint32(d, false), false);
    for (let d = 64; d < 320; d += 4) e.setUint32(d, $i2(e.getUint32(d - 12, false) ^ e.getUint32(d - 32, false) ^ e.getUint32(d - 56, false) ^ e.getUint32(d - 64, false), 1), false);
    let n = this._h0, s15 = this._h1, o2 = this._h2, r = this._h3, a = this._h4, l, u, c;
    for (let d = 0; d < 80; d++) d < 20 ? (l = s15 & o2 | ~s15 & r, u = 1518500249) : d < 40 ? (l = s15 ^ o2 ^ r, u = 1859775393) : d < 60 ? (l = s15 & o2 | s15 & r | o2 & r, u = 2400959708) : (l = s15 ^ o2 ^ r, u = 3395469782), c = $i2(n, 5) + l + a + u + e.getUint32(d * 4, false) & 4294967295, a = r, r = o2, o2 = $i2(s15, 30), s15 = n, n = c;
    this._h0 = this._h0 + n & 4294967295, this._h1 = this._h1 + s15 & 4294967295, this._h2 = this._h2 + o2 & 4294967295, this._h3 = this._h3 + r & 4294967295, this._h4 = this._h4 + a & 4294967295;
  }
};
ai2._bigBlock32 = new DataView(new ArrayBuffer(320));
var { registerWindow: fu, getWindow: Fs2, getDocument: mu, getWindows: _u, getWindowsCount: bu, getWindowId: dr3, getWindowById: vu, hasWindow: Tu2, onDidRegisterWindow: gu, onWillUnregisterWindow: xu2, onDidUnregisterWindow: Eu2 } = (function() {
  let i8 = /* @__PURE__ */ new Map();
  te;
  let e = { window: te, disposables: new fe2() };
  i8.set(te.vscodeWindowId, e);
  let t = new D3(), n = new D3(), s15 = new D3();
  function o2(r, a) {
    return (typeof r == "number" ? i8.get(r) : void 0) ?? (a ? e : void 0);
  }
  return { onDidRegisterWindow: t.event, onWillUnregisterWindow: s15.event, onDidUnregisterWindow: n.event, registerWindow(r) {
    if (i8.has(r.vscodeWindowId)) return B3.None;
    let a = new fe2(), l = { window: r, disposables: a.add(new fe2()) };
    return i8.set(r.vscodeWindowId, l), a.add(O(() => {
      i8.delete(r.vscodeWindowId), n.fire(r);
    })), a.add(li2(r, Ps2.BEFORE_UNLOAD, () => {
      s15.fire(r);
    })), t.fire(l), a;
  }, getWindows() {
    return i8.values();
  }, getWindowsCount() {
    return i8.size;
  }, getWindowId(r) {
    return r.vscodeWindowId;
  }, hasWindow(r) {
    return i8.has(r);
  }, getWindowById: o2, getWindow(r) {
    let a = r;
    if (a?.ownerDocument?.defaultView) return a.ownerDocument.defaultView.window;
    let l = r;
    return l?.view ? l.view.window : te;
  }, getDocument(r) {
    return Fs2(r).document;
  } };
})();
var Vi2 = class {
  constructor(e, t, n, s15) {
    this._node = e, this._type = t, this._handler = n, this._options = s15 || false, this._node.addEventListener(this._type, this._handler, this._options);
  }
  dispose() {
    this._handler && (this._node.removeEventListener(this._type, this._handler, this._options), this._node = null, this._handler = null);
  }
};
function li2(i8, e, t, n) {
  return new Vi2(i8, e, t, n);
}
var ks2;
var hr3;
var pt3 = class {
  constructor(e, t = 0) {
    this._runner = e, this.priority = t, this._canceled = false;
  }
  dispose() {
    this._canceled = true;
  }
  execute() {
    if (!this._canceled) try {
      this._runner();
    } catch (e) {
      Pe(e);
    }
  }
  static sort(e, t) {
    return t.priority - e.priority;
  }
};
(function() {
  let i8 = /* @__PURE__ */ new Map(), e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), s15 = (o2) => {
    t.set(o2, false);
    let r = i8.get(o2) ?? [];
    for (e.set(o2, r), i8.set(o2, []), n.set(o2, true); r.length > 0; ) r.sort(pt3.sort), r.shift().execute();
    n.set(o2, false);
  };
  hr3 = (o2, r, a = 0) => {
    let l = dr3(o2), u = new pt3(r, a), c = i8.get(l);
    return c || (c = [], i8.set(l, c)), c.push(u), t.get(l) || (t.set(l, true), o2.requestAnimationFrame(() => s15(l))), u;
  }, ks2 = (o2, r, a) => {
    let l = dr3(o2);
    if (n.get(l)) {
      let u = new pt3(r, a), c = e.get(l);
      return c || (c = [], e.set(l, c)), c.push(u), u;
    } else return hr3(o2, r, a);
  };
})();
var ke2 = class ke3 {
  constructor(e, t) {
    this.width = e;
    this.height = t;
  }
  with(e = this.width, t = this.height) {
    return e !== this.width || t !== this.height ? new ke3(e, t) : this;
  }
  static is(e) {
    return typeof e == "object" && typeof e.height == "number" && typeof e.width == "number";
  }
  static lift(e) {
    return e instanceof ke3 ? e : new ke3(e.width, e.height);
  }
  static equals(e, t) {
    return e === t ? true : !e || !t ? false : e.width === t.width && e.height === t.height;
  }
};
ke2.None = new ke2(0, 0);
var yu2 = new class {
  constructor() {
    this.mutationObservers = /* @__PURE__ */ new Map();
  }
  observe(i8, e, t) {
    let n = this.mutationObservers.get(i8);
    n || (n = /* @__PURE__ */ new Map(), this.mutationObservers.set(i8, n));
    let s15 = ur2(t), o2 = n.get(s15);
    if (o2) o2.users += 1;
    else {
      let r = new D3(), a = new MutationObserver((u) => r.fire(u));
      a.observe(i8, t);
      let l = o2 = { users: 1, observer: a, onDidMutate: r.event };
      e.add(O(() => {
        l.users -= 1, l.users === 0 && (r.dispose(), a.disconnect(), n?.delete(s15), n?.size === 0 && this.mutationObservers.delete(i8));
      })), n.set(s15, o2);
    }
    return o2.onDidMutate;
  }
}();
var Ps2 = { CLICK: "click", AUXCLICK: "auxclick", DBLCLICK: "dblclick", MOUSE_UP: "mouseup", MOUSE_DOWN: "mousedown", MOUSE_OVER: "mouseover", MOUSE_MOVE: "mousemove", MOUSE_OUT: "mouseout", MOUSE_ENTER: "mouseenter", MOUSE_LEAVE: "mouseleave", MOUSE_WHEEL: "wheel", POINTER_UP: "pointerup", POINTER_DOWN: "pointerdown", POINTER_MOVE: "pointermove", POINTER_LEAVE: "pointerleave", CONTEXT_MENU: "contextmenu", WHEEL: "wheel", KEY_DOWN: "keydown", KEY_PRESS: "keypress", KEY_UP: "keyup", LOAD: "load", BEFORE_UNLOAD: "beforeunload", UNLOAD: "unload", PAGE_SHOW: "pageshow", PAGE_HIDE: "pagehide", PASTE: "paste", ABORT: "abort", ERROR: "error", RESIZE: "resize", SCROLL: "scroll", FULLSCREEN_CHANGE: "fullscreenchange", WK_FULLSCREEN_CHANGE: "webkitfullscreenchange", SELECT: "select", CHANGE: "change", SUBMIT: "submit", RESET: "reset", FOCUS: "focus", FOCUS_IN: "focusin", FOCUS_OUT: "focusout", BLUR: "blur", INPUT: "input", STORAGE: "storage", DRAG_START: "dragstart", DRAG: "drag", DRAG_ENTER: "dragenter", DRAG_LEAVE: "dragleave", DRAG_OVER: "dragover", DROP: "drop", DRAG_END: "dragend", ANIMATION_START: ut2 ? "webkitAnimationStart" : "animationstart", ANIMATION_END: ut2 ? "webkitAnimationEnd" : "animationend", ANIMATION_ITERATION: ut2 ? "webkitAnimationIteration" : "animationiteration" };
var Bs2 = /([\w\-]+)?(#([\w\-]+))?((\.([\w\-]+))*)/;
function fr2(i8, e, t, ...n) {
  let s15 = Bs2.exec(e);
  if (!s15) throw new Error("Bad use of emmet");
  let o2 = s15[1] || "div", r;
  return i8 !== "http://www.w3.org/1999/xhtml" ? r = document.createElementNS(i8, o2) : r = document.createElement(o2), s15[3] && (r.id = s15[3]), s15[4] && (r.className = s15[4].replace(/\./g, " ").trim()), t && Object.entries(t).forEach(([a, l]) => {
    typeof l > "u" || (/^on\w+$/.test(a) ? r[a] = l : a === "selected" ? l && r.setAttribute(a, "true") : r.setAttribute(a, l));
  }), r.append(...n), r;
}
function Ns(i8, e, ...t) {
  return fr2("http://www.w3.org/1999/xhtml", i8, e, ...t);
}
Ns.SVG = function(i8, e, ...t) {
  return fr2("http://www.w3.org/2000/svg", i8, e, ...t);
};
var ui2 = class extends B3 {
  constructor(t, n, s15, o2, r, a, l, u, c) {
    super();
    this._terminal = t;
    this._characterJoinerService = n;
    this._charSizeService = s15;
    this._coreBrowserService = o2;
    this._coreService = r;
    this._decorationService = a;
    this._optionsService = l;
    this._themeService = u;
    this._cursorBlinkStateManager = new be2();
    this._charAtlasDisposable = this._register(new be2());
    this._observerDisposable = this._register(new be2());
    this._model = new Vt2();
    this._workCell = new at2();
    this._workCell2 = new at2();
    this._rectangleRenderer = this._register(new be2());
    this._glyphRenderer = this._register(new be2());
    this._onChangeTextureAtlas = this._register(new D3());
    this.onChangeTextureAtlas = this._onChangeTextureAtlas.event;
    this._onAddTextureAtlasCanvas = this._register(new D3());
    this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event;
    this._onRemoveTextureAtlasCanvas = this._register(new D3());
    this.onRemoveTextureAtlasCanvas = this._onRemoveTextureAtlasCanvas.event;
    this._onRequestRedraw = this._register(new D3());
    this.onRequestRedraw = this._onRequestRedraw.event;
    this._onContextLoss = this._register(new D3());
    this.onContextLoss = this._onContextLoss.event;
    this._canvas = this._coreBrowserService.mainDocument.createElement("canvas");
    let d = { antialias: false, depth: false, preserveDrawingBuffer: c };
    if (this._gl = this._canvas.getContext("webgl2", d), !this._gl) throw new Error("WebGL2 not supported " + this._gl);
    this._register(this._themeService.onChangeColors(() => this._handleColorChange())), this._cellColorResolver = new At3(this._terminal, this._optionsService, this._model.selection, this._decorationService, this._coreBrowserService, this._themeService), this._core = this._terminal._core, this._renderLayers = [new Xt2(this._core.screenElement, 2, this._terminal, this._core.linkifier, this._coreBrowserService, l, this._themeService)], this.dimensions = _n2(), this._devicePixelRatio = this._coreBrowserService.dpr, this._updateDimensions(), this._updateCursorBlink(), this._register(l.onOptionChange(() => this._handleOptionsChanged())), this._deviceMaxTextureSize = this._gl.getParameter(this._gl.MAX_TEXTURE_SIZE), this._register(li2(this._canvas, "webglcontextlost", (h2) => {
      console.log("webglcontextlost event received"), h2.preventDefault(), this._contextRestorationTimeout = setTimeout(() => {
        this._contextRestorationTimeout = void 0, console.warn("webgl context not restored; firing onContextLoss"), this._onContextLoss.fire(h2);
      }, 3e3);
    })), this._register(li2(this._canvas, "webglcontextrestored", (h2) => {
      console.warn("webglcontextrestored event received"), clearTimeout(this._contextRestorationTimeout), this._contextRestorationTimeout = void 0, Ai2(this._terminal), this._initializeWebGLState(), this._requestRedrawViewport();
    })), this._observerDisposable.value = Si2(this._canvas, this._coreBrowserService.window, (h2, f) => this._setCanvasDevicePixelDimensions(h2, f)), this._register(this._coreBrowserService.onWindowChange((h2) => {
      this._observerDisposable.value = Si2(this._canvas, h2, (f, I) => this._setCanvasDevicePixelDimensions(f, I));
    })), this._core.screenElement.appendChild(this._canvas), [this._rectangleRenderer.value, this._glyphRenderer.value] = this._initializeWebGLState(), this._isAttached = this._core.screenElement.isConnected, this._register(O(() => {
      for (let h2 of this._renderLayers) h2.dispose();
      this._canvas.parentElement?.removeChild(this._canvas), Ai2(this._terminal);
    }));
  }
  get textureAtlas() {
    return this._charAtlas?.pages[0].canvas;
  }
  _handleColorChange() {
    this._refreshCharAtlas(), this._clearModel(true);
  }
  handleDevicePixelRatioChange() {
    this._devicePixelRatio !== this._coreBrowserService.dpr && (this._devicePixelRatio = this._coreBrowserService.dpr, this.handleResize(this._terminal.cols, this._terminal.rows));
  }
  handleResize(t, n) {
    this._updateDimensions(), this._model.resize(this._terminal.cols, this._terminal.rows);
    for (let s15 of this._renderLayers) s15.resize(this._terminal, this.dimensions);
    this._canvas.width = this.dimensions.device.canvas.width, this._canvas.height = this.dimensions.device.canvas.height, this._canvas.style.width = `${this.dimensions.css.canvas.width}px`, this._canvas.style.height = `${this.dimensions.css.canvas.height}px`, this._core.screenElement.style.width = `${this.dimensions.css.canvas.width}px`, this._core.screenElement.style.height = `${this.dimensions.css.canvas.height}px`, this._rectangleRenderer.value?.setDimensions(this.dimensions), this._rectangleRenderer.value?.handleResize(), this._glyphRenderer.value?.setDimensions(this.dimensions), this._glyphRenderer.value?.handleResize(), this._refreshCharAtlas(), this._clearModel(false);
  }
  handleCharSizeChanged() {
    this.handleResize(this._terminal.cols, this._terminal.rows);
  }
  handleBlur() {
    for (let t of this._renderLayers) t.handleBlur(this._terminal);
    this._cursorBlinkStateManager.value?.pause(), this._requestRedrawViewport();
  }
  handleFocus() {
    for (let t of this._renderLayers) t.handleFocus(this._terminal);
    this._cursorBlinkStateManager.value?.resume(), this._requestRedrawViewport();
  }
  handleSelectionChanged(t, n, s15) {
    for (let o2 of this._renderLayers) o2.handleSelectionChanged(this._terminal, t, n, s15);
    this._model.selection.update(this._core, t, n, s15), this._requestRedrawViewport();
  }
  handleCursorMove() {
    for (let t of this._renderLayers) t.handleCursorMove(this._terminal);
    this._cursorBlinkStateManager.value?.restartBlinkAnimation();
  }
  _handleOptionsChanged() {
    this._updateDimensions(), this._refreshCharAtlas(), this._updateCursorBlink();
  }
  _initializeWebGLState() {
    return this._rectangleRenderer.value = new qt(this._terminal, this._gl, this.dimensions, this._themeService), this._glyphRenderer.value = new Kt2(this._terminal, this._gl, this.dimensions, this._optionsService), this.handleCharSizeChanged(), [this._rectangleRenderer.value, this._glyphRenderer.value];
  }
  _refreshCharAtlas() {
    if (this.dimensions.device.char.width <= 0 && this.dimensions.device.char.height <= 0) {
      this._isAttached = false;
      return;
    }
    let t = Nt2(this._terminal, this._optionsService.rawOptions, this._themeService.colors, this.dimensions.device.cell.width, this.dimensions.device.cell.height, this.dimensions.device.char.width, this.dimensions.device.char.height, this._coreBrowserService.dpr, this._deviceMaxTextureSize);
    this._charAtlas !== t && (this._onChangeTextureAtlas.fire(t.pages[0].canvas), this._charAtlasDisposable.value = It2(ee2.forward(t.onAddTextureAtlasCanvas, this._onAddTextureAtlasCanvas), ee2.forward(t.onRemoveTextureAtlasCanvas, this._onRemoveTextureAtlasCanvas))), this._charAtlas = t, this._charAtlas.warmUp(), this._glyphRenderer.value?.setAtlas(this._charAtlas);
  }
  _clearModel(t) {
    this._model.clear(), t && this._glyphRenderer.value?.clear();
  }
  clearTextureAtlas() {
    this._charAtlas?.clearTexture(), this._clearModel(true), this._requestRedrawViewport();
  }
  clear() {
    this._clearModel(true);
    for (let t of this._renderLayers) t.reset(this._terminal);
    this._cursorBlinkStateManager.value?.restartBlinkAnimation(), this._updateCursorBlink();
  }
  renderRows(t, n) {
    if (!this._isAttached) if (this._core.screenElement?.isConnected && this._charSizeService.width && this._charSizeService.height) this._updateDimensions(), this._refreshCharAtlas(), this._isAttached = true;
    else return;
    for (let s15 of this._renderLayers) s15.handleGridChanged(this._terminal, t, n);
    !this._glyphRenderer.value || !this._rectangleRenderer.value || (this._glyphRenderer.value.beginFrame() ? (this._clearModel(true), this._updateModel(0, this._terminal.rows - 1)) : this._updateModel(t, n), this._rectangleRenderer.value.renderBackgrounds(), this._glyphRenderer.value.render(this._model), (!this._cursorBlinkStateManager.value || this._cursorBlinkStateManager.value.isCursorVisible) && this._rectangleRenderer.value.renderCursor());
  }
  _updateCursorBlink() {
    this._coreService.decPrivateModes.cursorBlink ?? this._terminal.options.cursorBlink ? this._cursorBlinkStateManager.value = new Ht(() => {
      this._requestRedrawCursor();
    }, this._coreBrowserService) : this._cursorBlinkStateManager.clear(), this._requestRedrawCursor();
  }
  _updateModel(t, n) {
    let s15 = this._core, o2 = this._workCell, r, a, l, u, c, d, h2 = 0, f = true, I, L2, M2, q2, S2, W2, E, y, w;
    t = mr2(t, s15.rows - 1, 0), n = mr2(n, s15.rows - 1, 0);
    let G3 = this._coreService.decPrivateModes.cursorStyle ?? s15.options.cursorStyle ?? "block", ue2 = this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY, Se2 = ue2 - s15.buffer.ydisp, ce2 = Math.min(this._terminal.buffer.active.cursorX, s15.cols - 1), we2 = -1, A = this._coreService.isCursorInitialized && !this._coreService.isCursorHidden && (!this._cursorBlinkStateManager.value || this._cursorBlinkStateManager.value.isCursorVisible);
    this._model.cursor = void 0;
    let se2 = false;
    for (a = t; a <= n; a++) for (l = a + s15.buffer.ydisp, u = s15.buffer.lines.get(l), this._model.lineLengths[a] = 0, M2 = ue2 === l, h2 = 0, c = this._characterJoinerService.getJoinedCharacters(l), y = 0; y < s15.cols; y++) {
      if (r = this._cellColorResolver.result.bg, u.loadCell(y, o2), y === 0 && (r = this._cellColorResolver.result.bg), d = false, f = y >= h2, I = y, c.length > 0 && y === c[0][0] && f) {
        L2 = c.shift();
        let v2 = this._model.selection.isCellSelected(this._terminal, L2[0], l);
        for (E = L2[0] + 1; E < L2[1]; E++) f && (f = v2 === this._model.selection.isCellSelected(this._terminal, E, l));
        f && (f = !M2 || ce2 < L2[0] || ce2 >= L2[1]), f ? (d = true, o2 = new Ci2(o2, u.translateToString(true, L2[0], L2[1]), L2[1] - L2[0]), I = L2[1] - 1) : h2 = L2[1];
      }
      if (q2 = o2.getChars(), S2 = o2.getCode(), E = (a * s15.cols + y) * Ce2, this._cellColorResolver.resolve(o2, y, l, this.dimensions.device.cell.width), A && l === ue2 && (y === ce2 && (this._model.cursor = { x: ce2, y: Se2, width: o2.getWidth(), style: this._coreBrowserService.isFocused ? G3 : s15.options.cursorInactiveStyle, cursorWidth: s15.options.cursorWidth, dpr: this._devicePixelRatio }, we2 = ce2 + o2.getWidth() - 1), y >= ce2 && y <= we2 && (this._coreBrowserService.isFocused && G3 === "block" || this._coreBrowserService.isFocused === false && s15.options.cursorInactiveStyle === "block") && (this._cellColorResolver.result.fg = 50331648 | this._themeService.colors.cursorAccent.rgba >> 8 & 16777215, this._cellColorResolver.result.bg = 50331648 | this._themeService.colors.cursor.rgba >> 8 & 16777215)), S2 !== 0 && (this._model.lineLengths[a] = y + 1), !(this._model.cells[E] === S2 && this._model.cells[E + ze] === this._cellColorResolver.result.bg && this._model.cells[E + qe2] === this._cellColorResolver.result.fg && this._model.cells[E + Ct2] === this._cellColorResolver.result.ext) && (se2 = true, q2.length > 1 && (S2 |= Un2), this._model.cells[E] = S2, this._model.cells[E + ze] = this._cellColorResolver.result.bg, this._model.cells[E + qe2] = this._cellColorResolver.result.fg, this._model.cells[E + Ct2] = this._cellColorResolver.result.ext, W2 = o2.getWidth(), this._glyphRenderer.value.updateCell(y, a, S2, this._cellColorResolver.result.bg, this._cellColorResolver.result.fg, this._cellColorResolver.result.ext, q2, W2, r), d)) {
        for (o2 = this._workCell, y++; y <= I; y++) w = (a * s15.cols + y) * Ce2, this._glyphRenderer.value.updateCell(y, a, 0, 0, 0, 0, pn2, 0, 0), this._model.cells[w] = 0, this._model.cells[w + ze] = this._cellColorResolver.result.bg, this._model.cells[w + qe2] = this._cellColorResolver.result.fg, this._model.cells[w + Ct2] = this._cellColorResolver.result.ext;
        y--;
      }
    }
    se2 && this._rectangleRenderer.value.updateBackgrounds(this._model), this._rectangleRenderer.value.updateCursor(this._model);
  }
  _updateDimensions() {
    !this._charSizeService.width || !this._charSizeService.height || (this.dimensions.device.char.width = Math.floor(this._charSizeService.width * this._devicePixelRatio), this.dimensions.device.char.height = Math.ceil(this._charSizeService.height * this._devicePixelRatio), this.dimensions.device.cell.height = Math.floor(this.dimensions.device.char.height * this._optionsService.rawOptions.lineHeight), this.dimensions.device.char.top = this._optionsService.rawOptions.lineHeight === 1 ? 0 : Math.round((this.dimensions.device.cell.height - this.dimensions.device.char.height) / 2), this.dimensions.device.cell.width = this.dimensions.device.char.width + Math.round(this._optionsService.rawOptions.letterSpacing), this.dimensions.device.char.left = Math.floor(this._optionsService.rawOptions.letterSpacing / 2), this.dimensions.device.canvas.height = this._terminal.rows * this.dimensions.device.cell.height, this.dimensions.device.canvas.width = this._terminal.cols * this.dimensions.device.cell.width, this.dimensions.css.canvas.height = Math.round(this.dimensions.device.canvas.height / this._devicePixelRatio), this.dimensions.css.canvas.width = Math.round(this.dimensions.device.canvas.width / this._devicePixelRatio), this.dimensions.css.cell.height = this.dimensions.device.cell.height / this._devicePixelRatio, this.dimensions.css.cell.width = this.dimensions.device.cell.width / this._devicePixelRatio);
  }
  _setCanvasDevicePixelDimensions(t, n) {
    this._canvas.width === t && this._canvas.height === n || (this._canvas.width = t, this._canvas.height = n, this._requestRedrawViewport());
  }
  _requestRedrawViewport() {
    this._onRequestRedraw.fire({ start: 0, end: this._terminal.rows - 1 });
  }
  _requestRedrawCursor() {
    let t = this._terminal.buffer.active.cursorY;
    this._onRequestRedraw.fire({ start: t, end: t });
  }
};
var Ci2 = class extends he2 {
  constructor(t, n, s15) {
    super();
    this.content = 0;
    this.combinedData = "";
    this.fg = t.fg, this.bg = t.bg, this.combinedData = n, this._width = s15;
  }
  isCombined() {
    return 2097152;
  }
  getWidth() {
    return this._width;
  }
  getChars() {
    return this.combinedData;
  }
  getCode() {
    return 2097151;
  }
  setFromCharData(t) {
    throw new Error("not implemented");
  }
  getAsCharData() {
    return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
  }
};
function mr2(i8, e, t = 0) {
  return Math.max(Math.min(i8, e), t);
}
var _r2 = "di$target";
var br3 = "di$dependencies";
var zi2 = /* @__PURE__ */ new Map();
function pe2(i8) {
  if (zi2.has(i8)) return zi2.get(i8);
  let e = function(t, n, s15) {
    if (arguments.length !== 3) throw new Error("@IServiceName-decorator can only be used to decorate a parameter");
    Us2(e, t, s15);
  };
  return e._id = i8, zi2.set(i8, e), e;
}
function Us2(i8, e, t) {
  e[_r2] === e ? e[br3].push({ id: i8, index: t }) : (e[br3] = [{ id: i8, index: t }], e[_r2] = e);
}
var Vu = pe2("BufferService");
var Cu = pe2("CoreMouseService");
var zu = pe2("CoreService");
var qu = pe2("CharsetService");
var ju = pe2("InstantiationService");
var Xu = pe2("LogService");
var vr2 = pe2("OptionsService");
var Yu = pe2("OscLinkService");
var Qu = pe2("UnicodeService");
var Zu = pe2("DecorationService");
var Hs2 = { trace: 0, debug: 1, info: 2, warn: 3, error: 4, off: 5 };
var Ws2 = "xterm.js: ";
var ci2 = class extends B3 {
  constructor(t) {
    super();
    this._optionsService = t;
    this._logLevel = 5;
    this._updateLogLevel(), this._register(this._optionsService.onSpecificOptionChange("logLevel", () => this._updateLogLevel())), Tr2 = this;
  }
  get logLevel() {
    return this._logLevel;
  }
  _updateLogLevel() {
    this._logLevel = Hs2[this._optionsService.rawOptions.logLevel];
  }
  _evalLazyOptionalParams(t) {
    for (let n = 0; n < t.length; n++) typeof t[n] == "function" && (t[n] = t[n]());
  }
  _log(t, n, s15) {
    this._evalLazyOptionalParams(s15), t.call(console, (this._optionsService.options.logger ? "" : Ws2) + n, ...s15);
  }
  trace(t, ...n) {
    this._logLevel <= 0 && this._log(this._optionsService.options.logger?.trace.bind(this._optionsService.options.logger) ?? console.log, t, n);
  }
  debug(t, ...n) {
    this._logLevel <= 1 && this._log(this._optionsService.options.logger?.debug.bind(this._optionsService.options.logger) ?? console.log, t, n);
  }
  info(t, ...n) {
    this._logLevel <= 2 && this._log(this._optionsService.options.logger?.info.bind(this._optionsService.options.logger) ?? console.info, t, n);
  }
  warn(t, ...n) {
    this._logLevel <= 3 && this._log(this._optionsService.options.logger?.warn.bind(this._optionsService.options.logger) ?? console.warn, t, n);
  }
  error(t, ...n) {
    this._logLevel <= 4 && this._log(this._optionsService.options.logger?.error.bind(this._optionsService.options.logger) ?? console.error, t, n);
  }
};
ci2 = Yi2([Qi(0, vr2)], ci2);
var Tr2;
function gr3(i8) {
  Tr2 = i8;
}
var xr2 = class extends B3 {
  constructor(t) {
    if (vi2 && hn2() < 16) {
      let n = { antialias: false, depth: false, preserveDrawingBuffer: true };
      if (!document.createElement("canvas").getContext("webgl2", n)) throw new Error("Webgl2 is only supported on Safari 16 and above");
    }
    super();
    this._preserveDrawingBuffer = t;
    this._onChangeTextureAtlas = this._register(new D3());
    this.onChangeTextureAtlas = this._onChangeTextureAtlas.event;
    this._onAddTextureAtlasCanvas = this._register(new D3());
    this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event;
    this._onRemoveTextureAtlasCanvas = this._register(new D3());
    this.onRemoveTextureAtlasCanvas = this._onRemoveTextureAtlasCanvas.event;
    this._onContextLoss = this._register(new D3());
    this.onContextLoss = this._onContextLoss.event;
  }
  activate(t) {
    let n = t._core;
    if (!t.element) {
      this._register(n.onWillOpen(() => this.activate(t)));
      return;
    }
    this._terminal = t;
    let s15 = n.coreService, o2 = n.optionsService, r = n, a = r._renderService, l = r._characterJoinerService, u = r._charSizeService, c = r._coreBrowserService, d = r._decorationService, h2 = r._logService, f = r._themeService;
    gr3(h2), this._renderer = this._register(new ui2(t, l, u, c, s15, d, o2, f, this._preserveDrawingBuffer)), this._register(ee2.forward(this._renderer.onContextLoss, this._onContextLoss)), this._register(ee2.forward(this._renderer.onChangeTextureAtlas, this._onChangeTextureAtlas)), this._register(ee2.forward(this._renderer.onAddTextureAtlasCanvas, this._onAddTextureAtlasCanvas)), this._register(ee2.forward(this._renderer.onRemoveTextureAtlasCanvas, this._onRemoveTextureAtlasCanvas)), a.setRenderer(this._renderer), this._register(O(() => {
      if (this._terminal._core._store._isDisposed) return;
      let I = this._terminal._core._renderService;
      I.setRenderer(this._terminal._core._createRenderer()), I.handleResize(t.cols, t.rows);
    }));
  }
  get textureAtlas() {
    return this._renderer?.textureAtlas;
  }
  clearTextureAtlas() {
    this._renderer?.clearTextureAtlas();
  }
};

// node_modules/.pnpm/@xterm+xterm@6.0.0/node_modules/@xterm/xterm/css/xterm.css
var xterm_default = `/**
 * Copyright (c) 2014 The xterm.js authors. All rights reserved.
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * https://github.com/chjj/term.js
 * @license MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Originally forked from (with the author's permission):
 *   Fabrice Bellard's javascript vt100 for jslinux:
 *   http://bellard.org/jslinux/
 *   Copyright (c) 2011 Fabrice Bellard
 *   The original design remains. The terminal itself
 *   has been extended to include xterm CSI codes, among
 *   other features.
 */

/**
 *  Default styles for xterm.js
 */

.xterm {
    cursor: text;
    position: relative;
    user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
}

.xterm.focus,
.xterm:focus {
    outline: none;
}

.xterm .xterm-helpers {
    position: absolute;
    top: 0;
    /**
     * The z-index of the helpers must be higher than the canvases in order for
     * IMEs to appear on top.
     */
    z-index: 5;
}

.xterm .xterm-helper-textarea {
    padding: 0;
    border: 0;
    margin: 0;
    /* Move textarea out of the screen to the far left, so that the cursor is not visible */
    position: absolute;
    opacity: 0;
    left: -9999em;
    top: 0;
    width: 0;
    height: 0;
    z-index: -5;
    /** Prevent wrapping so the IME appears against the textarea at the correct position */
    white-space: nowrap;
    overflow: hidden;
    resize: none;
}

.xterm .composition-view {
    /* TODO: Composition position got messed up somewhere */
    background: #000;
    color: #FFF;
    display: none;
    position: absolute;
    white-space: nowrap;
    z-index: 1;
}

.xterm .composition-view.active {
    display: block;
}

.xterm .xterm-viewport {
    /* On OS X this is required in order for the scroll bar to appear fully opaque */
    background-color: #000;
    overflow-y: scroll;
    cursor: default;
    position: absolute;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;
}

.xterm .xterm-screen {
    position: relative;
}

.xterm .xterm-screen canvas {
    position: absolute;
    left: 0;
    top: 0;
}

.xterm-char-measure-element {
    display: inline-block;
    visibility: hidden;
    position: absolute;
    top: 0;
    left: -9999em;
    line-height: normal;
}

.xterm.enable-mouse-events {
    /* When mouse events are enabled (eg. tmux), revert to the standard pointer cursor */
    cursor: default;
}

.xterm.xterm-cursor-pointer,
.xterm .xterm-cursor-pointer {
    cursor: pointer;
}

.xterm.column-select.focus {
    /* Column selection mode */
    cursor: crosshair;
}

.xterm .xterm-accessibility:not(.debug),
.xterm .xterm-message {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 10;
    color: transparent;
    pointer-events: none;
}

.xterm .xterm-accessibility-tree:not(.debug) *::selection {
  color: transparent;
}

.xterm .xterm-accessibility-tree {
  font-family: monospace;
  user-select: text;
  white-space: pre;
}

.xterm .xterm-accessibility-tree > div {
  transform-origin: left;
  width: fit-content;
}

.xterm .live-region {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
}

.xterm-dim {
    /* Dim should not apply to background, so the opacity of the foreground color is applied
     * explicitly in the generated class and reset to 1 here */
    opacity: 1 !important;
}

.xterm-underline-1 { text-decoration: underline; }
.xterm-underline-2 { text-decoration: double underline; }
.xterm-underline-3 { text-decoration: wavy underline; }
.xterm-underline-4 { text-decoration: dotted underline; }
.xterm-underline-5 { text-decoration: dashed underline; }

.xterm-overline {
    text-decoration: overline;
}

.xterm-overline.xterm-underline-1 { text-decoration: overline underline; }
.xterm-overline.xterm-underline-2 { text-decoration: overline double underline; }
.xterm-overline.xterm-underline-3 { text-decoration: overline wavy underline; }
.xterm-overline.xterm-underline-4 { text-decoration: overline dotted underline; }
.xterm-overline.xterm-underline-5 { text-decoration: overline dashed underline; }

.xterm-strikethrough {
    text-decoration: line-through;
}

.xterm-screen .xterm-decoration-container .xterm-decoration {
	z-index: 6;
	position: absolute;
}

.xterm-screen .xterm-decoration-container .xterm-decoration.xterm-decoration-top-layer {
	z-index: 7;
}

.xterm-decoration-overview-ruler {
    z-index: 8;
    position: absolute;
    top: 0;
    right: 0;
    pointer-events: none;
}

.xterm-decoration-top {
    z-index: 2;
    position: relative;
}



/* Derived from vs/base/browser/ui/scrollbar/media/scrollbar.css */

/* xterm.js customization: Override xterm's cursor style */
.xterm .xterm-scrollable-element > .scrollbar {
    cursor: default;
}

/* Arrows */
.xterm .xterm-scrollable-element > .scrollbar > .scra {
	cursor: pointer;
	font-size: 11px !important;
}

.xterm .xterm-scrollable-element > .visible {
	opacity: 1;

	/* Background rule added for IE9 - to allow clicks on dom node */
	background:rgba(0,0,0,0);

	transition: opacity 100ms linear;
	/* In front of peek view */
	z-index: 11;
}
.xterm .xterm-scrollable-element > .invisible {
	opacity: 0;
	pointer-events: none;
}
.xterm .xterm-scrollable-element > .invisible.fade {
	transition: opacity 800ms linear;
}

/* Scrollable Content Inset Shadow */
.xterm .xterm-scrollable-element > .shadow {
	position: absolute;
	display: none;
}
.xterm .xterm-scrollable-element > .shadow.top {
	display: block;
	top: 0;
	left: 3px;
	height: 3px;
	width: 100%;
	box-shadow: var(--vscode-scrollbar-shadow, #000) 0 6px 6px -6px inset;
}
.xterm .xterm-scrollable-element > .shadow.left {
	display: block;
	top: 3px;
	left: 0;
	height: 100%;
	width: 3px;
	box-shadow: var(--vscode-scrollbar-shadow, #000) 6px 0 6px -6px inset;
}
.xterm .xterm-scrollable-element > .shadow.top-left-corner {
	display: block;
	top: 0;
	left: 0;
	height: 3px;
	width: 3px;
}
.xterm .xterm-scrollable-element > .shadow.top.left {
	box-shadow: var(--vscode-scrollbar-shadow, #000) 6px 0 6px -6px inset;
}
`;

// .dsh-plugin/client/remote-state.mjs
var CLIENT_VERSION = true ? "0.1.0" : "";
var STALE_HOST_MESSAGE = "MV \u63D2\u4EF6\u540E\u53F0\u7248\u672C\u4E0E\u754C\u9762\u4E0D\u4E00\u81F4\uFF0C\u8BF7\u5B8C\u5168\u9000\u51FA\u5E76\u91CD\u542F Harness\uFF08\u5305\u62EC\u6258\u76D8\u56FE\u6807\uFF09\u540E\u518D\u4F7F\u7528 MV \u7EC8\u7AEF\u3002";
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

// .dsh-plugin/shared/mv-terminal-protocol.mjs
var MV_TERMINAL_SCRIPT = ["_tools", "tui_live.py"];
var MV_TERMINAL_LIMITS = Object.freeze({
  maxSessions: 2,
  /** A session nobody reads (panel closed, client gone) is killed after this. */
  orphanTimeoutMs: 12e4,
  /** Hard lifetime of one session (the song is 3.5 minutes). */
  maxLifetimeMs: 2 * 60 * 6e4,
  /** Output kept per session for the client to catch up. */
  bufferChars: 2e6,
  /** Largest output slice returned by one read. */
  readChars: 512e3,
  /** Longest long-poll wait for new output. */
  maxWaitMs: 1e3,
  /** Largest single input write. */
  writeChars: 4096,
  minCols: 20,
  maxCols: 400,
  minRows: 8,
  maxRows: 200,
  maxPathChars: 1024,
  maxStartSeconds: 3600,
  maxLatencySeconds: 5,
  maxOffsetSeconds: 30
});
var MV_PLAYERS = Object.freeze(["python", "rust"]);
var RUST_BASENAME = /^world-execute-me(?:-rust)?(?:[-_.][\w.-]{0,60})?(?:\.exe)?$/i;
var MV_PLAYER_LABELS = Object.freeze({ python: "world_execute_me\uFF08tui_live.py\uFF09", rust: "world-execute-me-ascii-rust\uFF08\u7528\u6237\u81EA\u5907\u53EF\u6267\u884C\u6587\u4EF6\uFF09" });
var PYTHON_BASENAME = /^(?:python(?:3(?:\.\d{1,2})?)?w?|py)(?:\.exe)?$/i;
var SESSION_ID = /^mvterm-[a-z0-9]{6,40}$/;
var isMvSessionId = (value) => typeof value === "string" && SESSION_ID.test(value);
function plainObject(value, subject) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${subject} must be an object`);
  return value;
}
function sessionIdOf(value) {
  if (typeof value !== "string" || !SESSION_ID.test(value)) throw new TypeError("sessionId is invalid");
  return value;
}
function boundedInteger(value, min, max, subject) {
  if (!Number.isInteger(value) || value < min || value > max) throw new TypeError(`${subject} must be an integer from ${min} to ${max}`);
  return value;
}
function boundedNumber(value, min, max, subject) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new TypeError(`${subject} must be a number from ${min} to ${max}`);
  return value;
}
function isAbsolutePathText(value) {
  if (typeof value !== "string") return false;
  const path = value.trim();
  if (!path || path.length > MV_TERMINAL_LIMITS.maxPathChars || /[\0\r\n"]/.test(path)) return false;
  return path.startsWith("/") || /^[A-Za-z]:[\\/]/.test(path) || /^\\\\[^\\]+\\[^\\]+/.test(path);
}
function absolutePath(value, subject) {
  if (!isAbsolutePathText(value)) throw new TypeError(`${subject} \u5FC5\u987B\u662F\u7EDD\u5BF9\u8DEF\u5F84`);
  return value.trim();
}
function basenameOf(path) {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? "";
}
function parseRustLaunch(request2) {
  const allowed = /* @__PURE__ */ new Set(["player", "exePath", "audioFile", "start", "offset", "autoplay"]);
  const extra = Object.keys(request2).filter((key) => !allowed.has(key));
  if (extra.length) throw new TypeError(`launch has unexpected fields: ${extra.join(", ")}`);
  const exePath = absolutePath(request2.exePath, "\u53EF\u6267\u884C\u6587\u4EF6\u8DEF\u5F84");
  if (!RUST_BASENAME.test(basenameOf(exePath))) throw new TypeError("\u53EF\u6267\u884C\u6587\u4EF6\u5FC5\u987B\u662F world-execute-me-rust(.exe) \u8FD9\u6837\u7684\u53D1\u5E03\u6587\u4EF6\u540D");
  let audioFile;
  if (request2.audioFile !== void 0 && request2.audioFile !== null && request2.audioFile !== "") audioFile = absolutePath(request2.audioFile, "\u97F3\u9891\u6587\u4EF6");
  const start = request2.start === void 0 || request2.start === null ? 0 : boundedNumber(request2.start, 0, MV_TERMINAL_LIMITS.maxStartSeconds, "start");
  const offset = request2.offset === void 0 || request2.offset === null ? void 0 : boundedNumber(request2.offset, -MV_TERMINAL_LIMITS.maxOffsetSeconds, MV_TERMINAL_LIMITS.maxOffsetSeconds, "offset");
  if (request2.autoplay !== void 0 && typeof request2.autoplay !== "boolean") throw new TypeError("autoplay must be a boolean");
  return {
    player: "rust",
    exePath,
    start,
    autoplay: request2.autoplay === true,
    ...audioFile ? { audioFile } : {},
    ...offset !== void 0 ? { offset } : {}
  };
}
function parseMvLaunch(value) {
  const request2 = plainObject(value, "launch");
  if (request2.player !== void 0 && !MV_PLAYERS.includes(request2.player)) throw new TypeError("player must be python or rust");
  if (request2.player === "rust") return parseRustLaunch(request2);
  const allowed = /* @__PURE__ */ new Set(["player", "pythonPath", "packageDir", "audioFile", "noAudio", "start", "audioLatency"]);
  const extra = Object.keys(request2).filter((key) => !allowed.has(key));
  if (extra.length) throw new TypeError(`launch has unexpected fields: ${extra.join(", ")}`);
  const pythonPath = absolutePath(request2.pythonPath, "Python \u8DEF\u5F84");
  if (!PYTHON_BASENAME.test(basenameOf(pythonPath))) throw new TypeError("Python \u8DEF\u5F84\u5FC5\u987B\u6307\u5411 python.exe / python3 / pythonw.exe \u8FD9\u6837\u7684\u89E3\u91CA\u5668");
  const packageDir = absolutePath(request2.packageDir, "\u64AD\u653E\u5668\u76EE\u5F55");
  const noAudio = request2.noAudio === true;
  if (request2.noAudio !== void 0 && typeof request2.noAudio !== "boolean") throw new TypeError("noAudio must be a boolean");
  let audioFile;
  if (request2.audioFile !== void 0 && request2.audioFile !== null && request2.audioFile !== "") audioFile = absolutePath(request2.audioFile, "\u97F3\u9891\u6587\u4EF6");
  const start = request2.start === void 0 || request2.start === null ? 0 : boundedNumber(request2.start, 0, MV_TERMINAL_LIMITS.maxStartSeconds, "start");
  const audioLatency = request2.audioLatency === void 0 || request2.audioLatency === null ? void 0 : boundedNumber(request2.audioLatency, 0, MV_TERMINAL_LIMITS.maxLatencySeconds, "audioLatency");
  return {
    player: "python",
    pythonPath,
    packageDir,
    noAudio,
    start,
    ...audioFile && !noAudio ? { audioFile } : {},
    ...audioLatency !== void 0 ? { audioLatency } : {}
  };
}
function parseMvTerminalCheck(value) {
  return parseMvLaunch(value);
}
function parseMvTerminalStart(value) {
  const request2 = plainObject(value, "start request");
  const { cols, rows, confirmed, ...launch } = request2;
  const L2 = MV_TERMINAL_LIMITS;
  return {
    launch: parseMvLaunch(launch),
    cols: boundedInteger(cols, L2.minCols, L2.maxCols, "cols"),
    rows: boundedInteger(rows, L2.minRows, L2.maxRows, "rows"),
    confirmed: confirmed === true
  };
}
function parseMvTerminalRead(value) {
  const request2 = plainObject(value, "read request");
  return {
    sessionId: sessionIdOf(request2.sessionId),
    cursor: request2.cursor === void 0 ? 0 : boundedInteger(request2.cursor, 0, Number.MAX_SAFE_INTEGER, "cursor"),
    waitMs: request2.waitMs === void 0 ? 0 : boundedInteger(request2.waitMs, 0, MV_TERMINAL_LIMITS.maxWaitMs, "waitMs")
  };
}
function parseMvTerminalWrite(value) {
  const request2 = plainObject(value, "write request");
  if (typeof request2.data !== "string" || request2.data.length === 0 || request2.data.length > MV_TERMINAL_LIMITS.writeChars) {
    throw new TypeError(`data must be a string of 1 to ${MV_TERMINAL_LIMITS.writeChars} characters`);
  }
  return { sessionId: sessionIdOf(request2.sessionId), data: request2.data };
}
function parseMvTerminalResize(value) {
  const request2 = plainObject(value, "resize request");
  const L2 = MV_TERMINAL_LIMITS;
  return {
    sessionId: sessionIdOf(request2.sessionId),
    cols: boundedInteger(request2.cols, L2.minCols, L2.maxCols, "cols"),
    rows: boundedInteger(request2.rows, L2.minRows, L2.maxRows, "rows")
  };
}
function parseMvTerminalStop(value) {
  const request2 = plainObject(value, "stop request");
  return { sessionId: sessionIdOf(request2.sessionId) };
}
function mvTerminalArgs(launch, scriptPath) {
  const args = [scriptPath];
  if (launch.noAudio) args.push("--no-audio");
  else if (launch.audioFile) args.push("--audio-file", launch.audioFile);
  if (launch.start > 0) args.push("--start", String(launch.start));
  if (launch.audioLatency !== void 0) args.push("--audio-latency", String(launch.audioLatency));
  return args;
}
function rustTerminalArgs(launch) {
  const args = [];
  if (launch.audioFile) args.push("--audio", launch.audioFile);
  if (launch.start > 0) args.push("--start", String(launch.start));
  if (launch.offset !== void 0) args.push("--offset", String(launch.offset));
  if (launch.autoplay) args.push("--autoplay");
  return args;
}
function displayCommand(file, args) {
  const quote = (text3) => /[\s"]/.test(text3) ? `"${text3}"` : text3;
  return [file, ...args].map(quote).join(" ");
}

// .dsh-plugin/client/mv-terminal-state.mjs
var text2 = (value) => typeof value === "string" ? value.trim() : "";
var FORM_KEY = "dsh-mv.terminal.form.v1";
var EMPTY_FORM = Object.freeze({ player: "python", exePath: "", offset: "", autoplay: false, pythonPath: "", packageDir: "", audioFile: "", noAudio: false, start: "", audioLatency: "" });
function loadForm(storage = globalThis.localStorage) {
  try {
    return { ...EMPTY_FORM, ...JSON.parse(storage?.getItem(FORM_KEY) ?? "{}") };
  } catch {
    return { ...EMPTY_FORM };
  }
}
function saveForm(form, storage = globalThis.localStorage) {
  try {
    storage?.setItem(FORM_KEY, JSON.stringify(form));
  } catch {
  }
}
var basename = (value) => text2(value).split(/[\\/]/).pop();
var sepOf = (value) => /\\/.test(value) || /^[a-z]:/i.test(value) ? "\\" : "/";
function suggestedPython(packageDir) {
  const dir = text2(packageDir).replace(/[\\/]+$/, "");
  if (!dir) return "";
  const sep = sepOf(dir);
  return `${dir}${sep}python${sep}python${sep === "\\" ? ".exe" : ""}`;
}
function launchFromForm(form) {
  if (form.player === "rust") {
    const launch2 = { player: "rust", exePath: text2(form.exePath), autoplay: Boolean(form.autoplay) };
    if (text2(form.audioFile)) launch2.audioFile = text2(form.audioFile);
    if (text2(String(form.start ?? ""))) launch2.start = Number(form.start);
    if (text2(String(form.offset ?? ""))) launch2.offset = Number(form.offset);
    return launch2;
  }
  const launch = { player: "python", pythonPath: text2(form.pythonPath), packageDir: text2(form.packageDir).replace(/(?<=.)[\\/]+$/, ""), noAudio: Boolean(form.noAudio) };
  if (!launch.noAudio && text2(form.audioFile)) launch.audioFile = text2(form.audioFile);
  if (text2(String(form.start ?? ""))) launch.start = Number(form.start);
  if (text2(String(form.audioLatency ?? ""))) launch.audioLatency = Number(form.audioLatency);
  return launch;
}
function formProblem(form) {
  const launch = launchFromForm(form);
  if (launch.player === "rust") {
    if (!launch.exePath) return "\u8BF7\u586B\u5199 world-execute-me-rust.exe \u7684\u8DEF\u5F84\uFF08\u4ECE\u8BE5\u9879\u76EE\u7684 GitHub Release \u81EA\u884C\u4E0B\u8F7D\uFF09\u3002";
    if (!isAbsolutePathText(launch.exePath)) return "\u53EF\u6267\u884C\u6587\u4EF6\u8DEF\u5F84\u5FC5\u987B\u662F\u7EDD\u5BF9\u8DEF\u5F84\u3002";
    if (!RUST_BASENAME.test(basename(launch.exePath))) return "\u53EF\u6267\u884C\u6587\u4EF6\u540D\u5E94\u4E3A world-execute-me-rust.exe\uFF08\u9632\u6B62\u8BEF\u542F\u52A8\u5176\u4ED6\u7A0B\u5E8F\uFF09\u3002";
    if (launch.audioFile && !isAbsolutePathText(launch.audioFile)) return "\u97F3\u9891\u6587\u4EF6\u5FC5\u987B\u662F\u7EDD\u5BF9\u8DEF\u5F84\u3002";
    if ("start" in launch && !(Number.isFinite(launch.start) && launch.start >= 0 && launch.start <= MV_TERMINAL_LIMITS.maxStartSeconds)) return `\u8D77\u59CB\u79D2\u6570\u5E94\u5728 0\u2013${MV_TERMINAL_LIMITS.maxStartSeconds} \u4E4B\u95F4\u3002`;
    if ("offset" in launch && !(Number.isFinite(launch.offset) && Math.abs(launch.offset) <= MV_TERMINAL_LIMITS.maxOffsetSeconds)) return `\u5B57\u5E55\u504F\u79FB\u5E94\u5728 \xB1${MV_TERMINAL_LIMITS.maxOffsetSeconds} \u79D2\u4E4B\u5185\u3002`;
    return "";
  }
  if (!launch.pythonPath) return "\u8BF7\u586B\u5199 Python \u89E3\u91CA\u5668\u8DEF\u5F84\uFF08\u4F8B\u5982 world_execute_me\\python\\python.exe\uFF09\u3002";
  if (!isAbsolutePathText(launch.pythonPath)) return "Python \u8DEF\u5F84\u5FC5\u987B\u662F\u7EDD\u5BF9\u8DEF\u5F84\u3002";
  if (!PYTHON_BASENAME.test(basename(launch.pythonPath))) return "Python \u8DEF\u5F84\u5FC5\u987B\u6307\u5411 python.exe / python3 \u8FD9\u6837\u7684\u89E3\u91CA\u5668\u3002";
  if (!launch.packageDir) return "\u8BF7\u586B\u5199\u64AD\u653E\u5668\u76EE\u5F55\uFF08\u542B _tools\\tui_live.py \u7684\u6587\u4EF6\u5939\uFF09\u3002";
  if (!isAbsolutePathText(launch.packageDir)) return "\u64AD\u653E\u5668\u76EE\u5F55\u5FC5\u987B\u662F\u7EDD\u5BF9\u8DEF\u5F84\u3002";
  if (launch.audioFile && !isAbsolutePathText(launch.audioFile)) return "\u97F3\u9891\u6587\u4EF6\u5FC5\u987B\u662F\u7EDD\u5BF9\u8DEF\u5F84\u3002";
  if ("start" in launch && !(Number.isFinite(launch.start) && launch.start >= 0 && launch.start <= MV_TERMINAL_LIMITS.maxStartSeconds)) return `\u8D77\u59CB\u79D2\u6570\u5E94\u5728 0\u2013${MV_TERMINAL_LIMITS.maxStartSeconds} \u4E4B\u95F4\u3002`;
  if ("audioLatency" in launch && !(Number.isFinite(launch.audioLatency) && launch.audioLatency >= 0 && launch.audioLatency <= MV_TERMINAL_LIMITS.maxLatencySeconds)) return `\u97F3\u9891\u5EF6\u8FDF\u5E94\u5728 0\u2013${MV_TERMINAL_LIMITS.maxLatencySeconds} \u79D2\u4E4B\u95F4\u3002`;
  return "";
}
function commandPreview(form) {
  const launch = launchFromForm(form);
  if (launch.player === "rust") return displayCommand(launch.exePath, rustTerminalArgs(launch));
  const sep = sepOf(launch.packageDir || launch.pythonPath);
  const script = [launch.packageDir, ...MV_TERMINAL_SCRIPT].join(sep);
  return displayCommand(launch.pythonPath, mvTerminalArgs(launch, script));
}
function confirmationDetails(form, checked) {
  return {
    title: "\u542F\u52A8 MV \u7EC8\u7AEF\uFF1F",
    command: checked?.display ?? commandPreview(form),
    cwd: checked?.cwd ?? (form.player === "rust" ? text2(form.exePath).replace(/[\\/][^\\/]*$/, "") : launchFromForm(form).packageDir),
    points: [
      form.player === "rust" ? "\u5C06\u5728\u4F2A\u7EC8\u7AEF\u91CC\u8FD0\u884C\u4F60\u81EA\u5DF1\u4E0B\u8F7D\u7684 Rust \u7248\u53EF\u6267\u884C\u6587\u4EF6\uFF08\u4E0D\u7ECF\u8FC7 Harness \u6C99\u7BB1\uFF0C\u7B2C\u4E09\u65B9\u672A\u7B7E\u540D\u7A0B\u5E8F\uFF0C\u8BF7\u786E\u8BA4\u6765\u6E90\uFF09\u3002\u5B83\u53EA\u80FD\u89E3\u7801 MP3\uFF1B\u4E0D\u586B\u97F3\u9891\u65F6\u64AD\u653E\u5176\u5185\u5D4C\u7684\u97F3\u4E50\u3002" : "\u5C06\u5728\u4F2A\u7EC8\u7AEF\u91CC\u8FD0\u884C\u4F60\u672C\u673A\u7684 Python \u548C\u64AD\u653E\u5668\u811A\u672C\uFF08\u4E0D\u7ECF\u8FC7 Harness \u6C99\u7BB1\uFF09\uFF0C\u548C\u4F60\u81EA\u5DF1\u5728\u7EC8\u7AEF\u91CC\u8FD0\u884C\u5B83\u4E00\u6837\u3002",
      "\u53EA\u80FD\u542F\u52A8\u56FA\u5B9A\u7684\u64AD\u653E\u5668\uFF1B\u9762\u677F\u4E0D\u80FD\u4F20\u4EFB\u610F\u547D\u4EE4\u6216\u53C2\u6570\u3002",
      "\u753B\u9762\u662F\u7EC8\u7AEF\u8F93\u51FA\u7ECF Host \u957F\u8F6E\u8BE2\u8F6C\u53D1\u5230\u8FD9\u91CC\u7684\uFF0C\u6BD4\u539F\u751F\u7EC8\u7AEF\u591A\u7EA6 30\u2013150 ms \u5EF6\u8FDF\uFF1B\u5BF9\u53E3\u578B\u8BF7\u7528 --audio-latency \u6216\u753B\u5E03 MV \u6A21\u5F0F\u3002",
      "\u5173\u95ED\u9762\u677F\u3001\u7ED3\u675F\u4F1A\u8BDD\u6216\u7EA6 2 \u5206\u949F\u65E0\u4EBA\u67E5\u770B\u65F6\uFF0C\u8FDB\u7A0B\u4F1A\u88AB\u7ED3\u675F\u3002"
    ]
  };
}
function endDescription({ endReason, exitCode } = {}) {
  const code = exitCode === null || exitCode === void 0 ? "" : `\uFF0C\u9000\u51FA\u7801 ${exitCode}`;
  switch (endReason) {
    case "stopped":
      return `\u5DF2\u7531\u4F60\u7ED3\u675F${code}\u3002`;
    case "orphan":
      return "\u957F\u65F6\u95F4\u6CA1\u6709\u9762\u677F\u8BFB\u53D6\u8F93\u51FA\uFF0C\u5DF2\u81EA\u52A8\u7ED3\u675F\u3002";
    case "lifetime":
      return "\u4F1A\u8BDD\u8FBE\u5230\u6700\u957F\u65F6\u957F\uFF0C\u5DF2\u81EA\u52A8\u7ED3\u675F\u3002";
    case "dispose":
      return "\u63D2\u4EF6\u5DF2\u5378\u8F7D\u6216\u91CD\u65B0\u52A0\u8F7D\uFF0C\u4F1A\u8BDD\u5DF2\u7ED3\u675F\u3002";
    case "lost":
      return "\u4E0E\u540E\u53F0\u7684\u8FDE\u63A5\u4E2D\u65AD\u3002";
    default:
      return `\u64AD\u653E\u5668\u5DF2\u9000\u51FA${code}\u3002`;
  }
}
async function loadInfo(api) {
  const info = unwrapRemote(await api.info(), "\u65E0\u6CD5\u8BFB\u53D6 MV \u63D2\u4EF6\u72B6\u6001\u3002");
  if (!info || typeof info !== "object") throw new Error("MV \u63D2\u4EF6\u72B6\u6001\u683C\u5F0F\u65E0\u6548\u3002");
  return info;
}
async function checkLaunch(api, form) {
  return unwrapRemote(await api.terminalCheck(launchFromForm(form)), "\u8DEF\u5F84\u68C0\u67E5\u5931\u8D25\u3002");
}
async function startSession(api, form, { cols = 120, rows = 40 } = {}) {
  const L2 = MV_TERMINAL_LIMITS;
  const request2 = {
    ...launchFromForm(form),
    confirmed: true,
    cols: Math.min(L2.maxCols, Math.max(L2.minCols, Math.round(cols))),
    rows: Math.min(L2.maxRows, Math.max(L2.minRows, Math.round(rows)))
  };
  const session = unwrapRemote(await api.terminalStart(request2), "MV \u7EC8\u7AEF\u542F\u52A8\u5931\u8D25\u3002");
  if (!isMvSessionId(session?.sessionId)) throw new Error("\u542F\u52A8\u7ED3\u679C\u7F3A\u5C11\u6709\u6548\u7684\u4F1A\u8BDD ID\u3002");
  return session;
}
var TerminalConnection = class {
  constructor({ api, sessionId, onData, onExit, onError, waitMs = 800, retryMs = 1e3, resizeDelayMs = 120, setTimer = setTimeout, clearTimer = clearTimeout }) {
    Object.assign(this, { api, sessionId, onData, onExit, onError, waitMs, retryMs, resizeDelayMs });
    this.setTimer = (callback, ms3) => setTimer(callback, ms3);
    this.clearTimer = (id) => clearTimer(id);
    this.cursor = 0;
    this.closed = false;
    this.pendingInput = "";
    this.writing = null;
    this.resizeTimer = null;
    this.failures = 0;
  }
  start() {
    if (!isMvSessionId(this.sessionId)) {
      this.closed = true;
      this.onError?.(new Error("\u4F1A\u8BDD ID \u65E0\u6548\u3002"));
      this.onExit?.({ endReason: "lost", exitCode: null });
      this.loop = Promise.resolve();
      return this.loop;
    }
    this.loop = this.readLoop();
    return this.loop;
  }
  async readLoop() {
    while (!this.closed) {
      let output;
      try {
        output = unwrapRemote(await this.api.terminalRead({ sessionId: this.sessionId, cursor: this.cursor, waitMs: this.waitMs }), "\u8BFB\u53D6\u7EC8\u7AEF\u8F93\u51FA\u5931\u8D25\u3002");
        this.failures = 0;
      } catch (error) {
        if (this.closed) return;
        this.failures += 1;
        this.onError?.(error);
        if (this.failures >= 5) {
          this.closed = true;
          this.onExit?.({ endReason: "lost", exitCode: null });
          return;
        }
        await new Promise((resolve) => this.setTimer(resolve, this.retryMs));
        continue;
      }
      if (this.closed) return;
      if (output.dropped) this.onData?.("\r\n[\u90E8\u5206\u8F83\u65E9\u7684\u8F93\u51FA\u5DF2\u4E22\u5F03]\r\n");
      if (output.data) this.onData?.(output.data);
      this.cursor = output.cursor;
      if (output.exited) {
        this.closed = true;
        this.onExit?.({ endReason: output.endReason, exitCode: output.exitCode });
        return;
      }
    }
  }
  send(data) {
    if (this.closed || !data) return;
    this.pendingInput += data;
    if (!this.writing) this.writing = this.flush();
  }
  async flush() {
    try {
      while (this.pendingInput && !this.closed) {
        const chunk = this.pendingInput.slice(0, MV_TERMINAL_LIMITS.writeChars);
        this.pendingInput = this.pendingInput.slice(chunk.length);
        try {
          unwrapRemote(await this.api.terminalWrite({ sessionId: this.sessionId, data: chunk }), "\u53D1\u9001\u6309\u952E\u5931\u8D25\u3002");
        } catch (error) {
          this.onError?.(error);
        }
      }
    } finally {
      this.writing = null;
    }
  }
  resize(cols, rows) {
    if (this.closed || !Number.isFinite(cols) || !Number.isFinite(rows)) return;
    const L2 = MV_TERMINAL_LIMITS;
    cols = Math.min(L2.maxCols, Math.max(L2.minCols, Math.round(cols)));
    rows = Math.min(L2.maxRows, Math.max(L2.minRows, Math.round(rows)));
    if (this.resizeTimer) this.clearTimer(this.resizeTimer);
    this.resizeTimer = this.setTimer(() => {
      this.resizeTimer = null;
      void Promise.resolve(this.api.terminalResize({ sessionId: this.sessionId, cols, rows })).catch(() => {
      });
    }, this.resizeDelayMs);
  }
  async stop() {
    const wasOpen = !this.closed;
    this.closed = true;
    if (this.resizeTimer) this.clearTimer(this.resizeTimer);
    if (wasOpen) {
      try {
        await this.api.terminalStop({ sessionId: this.sessionId });
      } catch {
      }
    }
  }
};
var errorText = (error, fallback) => remoteErrorText(text2(error?.message), fallback);

// .dsh-plugin/client/mv-terminal.jsx
var THEME = Object.freeze({ background: "#000000", foreground: "#ffaf5f", cursor: "#ffaf5f", selectionBackground: "#5f5f00" });
function TerminalScreen({ api, session, onEnded, fontSize }) {
  const host = import_react2.default.useRef(null);
  const [error, setError] = import_react2.default.useState("");
  const [renderer, setRenderer] = import_react2.default.useState("");
  const termRef = import_react2.default.useRef(null);
  import_react2.default.useEffect(() => {
    const term = new Dl({
      cursorBlink: false,
      fontSize,
      scrollback: 0,
      theme: THEME,
      allowProposedApi: true,
      fontFamily: '"Cascadia Mono", Consolas, "Sarasa Mono SC", "Microsoft YaHei Mono", Menlo, monospace'
    });
    const fit = new o();
    term.loadAddon(fit);
    term.open(host.current);
    termRef.current = { term, fit };
    try {
      const webgl = new xr2();
      webgl.onContextLoss(() => {
        webgl.dispose();
        setRenderer("DOM\uFF08WebGL \u4E0A\u4E0B\u6587\u4E22\u5931\u540E\u56DE\u9000\uFF09");
      });
      term.loadAddon(webgl);
      setRenderer("WebGL");
    } catch {
      setRenderer("DOM\uFF08WebGL \u4E0D\u53EF\u7528\uFF09");
    }
    const connection = new TerminalConnection({
      api,
      sessionId: session.sessionId,
      onData: (data) => term.write(data),
      onExit: (event) => {
        term.write(`\r
\x1B[0m\x1B[90m[${endDescription(event)}]\x1B[0m\r
`);
        onEnded(session.sessionId, event);
      },
      onError: (failure) => setError(errorText(failure, "\u7EC8\u7AEF\u901A\u4FE1\u5931\u8D25\u3002"))
    });
    const input = term.onData((data) => connection.send(data));
    const resized = term.onResize(({ cols, rows }) => connection.resize(cols, rows));
    const refit = () => {
      try {
        if (host.current?.offsetParent !== null) fit.fit();
      } catch {
      }
    };
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(refit) : null;
    observer?.observe(host.current);
    refit();
    void connection.start();
    term.focus();
    return () => {
      observer?.disconnect();
      input.dispose();
      resized.dispose();
      void connection.stop();
      termRef.current = null;
      term.dispose();
    };
  }, [session.sessionId]);
  import_react2.default.useEffect(() => {
    const current = termRef.current;
    if (!current || current.term.options.fontSize === fontSize) return;
    current.term.options.fontSize = fontSize;
    try {
      current.fit.fit();
    } catch {
    }
  }, [fontSize]);
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "mv-term-pane" }, session.limitation && /* @__PURE__ */ import_react2.default.createElement("p", { className: "mv-error" }, session.limitation, session.ptyError ? `\uFF08${session.ptyError}\uFF09` : ""), error && /* @__PURE__ */ import_react2.default.createElement("p", { className: "mv-error", role: "alert" }, error), /* @__PURE__ */ import_react2.default.createElement("div", { className: "mv-term-screen", ref: host }), /* @__PURE__ */ import_react2.default.createElement("p", { className: "mv-caption" }, "\u6E32\u67D3\uFF1A", renderer || "\u2026", " \xB7 \u8F93\u51FA\u7ECF\u957F\u8F6E\u8BE2\u8F6C\u53D1\uFF0C\u7EA6\u6BD4\u539F\u751F\u7EC8\u7AEF\u6162 30\u2013150 ms\u3002\u70B9\u8FDB\u7EC8\u7AEF\u540E\u6309\u952E\u76F4\u63A5\u53D1\u7ED9\u64AD\u653E\u5668\uFF08Q \u9000\u51FA\uFF09\u3002"));
}
function MvTerminal({ api, info, reloadInfo }) {
  const [form, setFormState] = import_react2.default.useState(loadForm);
  const [checked, setChecked] = import_react2.default.useState(null);
  const [checking, setChecking] = import_react2.default.useState(false);
  const [confirming, setConfirming] = import_react2.default.useState(false);
  const [starting, setStarting] = import_react2.default.useState(false);
  const [problemText, setProblemText] = import_react2.default.useState("");
  const [session, setSession] = import_react2.default.useState(null);
  const [ended, setEnded] = import_react2.default.useState(null);
  const [fontSize, setFontSize] = import_react2.default.useState(13);
  const mounted = import_react2.default.useRef(true);
  import_react2.default.useEffect(() => () => {
    mounted.current = false;
  }, []);
  const setForm = (patch) => {
    setFormState((previous) => {
      const next = { ...previous, ...patch };
      saveForm(next);
      return next;
    });
    setChecked(null);
    setConfirming(false);
    setProblemText("");
  };
  const problem = formProblem(form);
  const rust = form.player === "rust";
  const check = async () => {
    setChecking(true);
    setProblemText("");
    try {
      const value = await checkLaunch(api, form);
      if (mounted.current) setChecked(value);
    } catch (error) {
      if (mounted.current) {
        setChecked(null);
        setProblemText(errorText(error, "\u8DEF\u5F84\u68C0\u67E5\u5931\u8D25\u3002"));
      }
    } finally {
      if (mounted.current) setChecking(false);
    }
  };
  const start = async () => {
    setStarting(true);
    setProblemText("");
    try {
      const value = await startSession(api, form, { cols: 120, rows: 40 });
      if (!mounted.current) {
        void api.terminalStop({ sessionId: value.sessionId });
        return;
      }
      setSession(value);
      setEnded(null);
      setConfirming(false);
    } catch (error) {
      if (mounted.current) setProblemText(errorText(error, "MV \u7EC8\u7AEF\u542F\u52A8\u5931\u8D25\u3002"));
    } finally {
      if (mounted.current) setStarting(false);
    }
  };
  const onEnded = import_react2.default.useCallback((sessionId, event) => {
    if (mounted.current) {
      setEnded(event);
      void reloadInfo?.();
    }
  }, [reloadInfo]);
  const details = confirmationDetails(form, checked);
  const backendText = info ? info.backend === "pty" ? "\u4F2A\u7EC8\u7AEF\uFF08PTY\uFF09\u53EF\u7528\u3002" : `PTY \u4E0D\u53EF\u7528\uFF0C\u53EA\u80FD\u7528\u7BA1\u9053\u6A21\u5F0F\uFF08\u64AD\u653E\u5668\u591A\u534A\u65E0\u6CD5\u663E\u793A\uFF09\u3002${info.ptyError ? `\u539F\u56E0\uFF1A${info.ptyError}` : ""}` : "";
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "mv-term-tab" }, /* @__PURE__ */ import_react2.default.createElement("style", null, xterm_default), /* @__PURE__ */ import_react2.default.createElement("p", { className: "mv-caption" }, "\u5728\u9762\u677F\u91CC\u8FD0\u884C\u4F60\u672C\u673A\u5DF2\u6709\u7684\u7EC8\u7AEF\u64AD\u653E\u5668\u3002", backendText), /* @__PURE__ */ import_react2.default.createElement("div", { className: "mv-form" }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react2.default.createElement("span", null, "\u64AD\u653E\u5668"), /* @__PURE__ */ import_react2.default.createElement("select", { value: form.player, onChange: (event) => setForm({ player: event.target.value }) }, /* @__PURE__ */ import_react2.default.createElement("option", { value: "python" }, MV_PLAYER_LABELS.python), /* @__PURE__ */ import_react2.default.createElement("option", { value: "rust" }, MV_PLAYER_LABELS.rust))), !rust && /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("label", { className: "mv-field mv-wide" }, /* @__PURE__ */ import_react2.default.createElement("span", null, "\u64AD\u653E\u5668\u76EE\u5F55\uFF08\u542B _tools\\tui_live.py\uFF09"), /* @__PURE__ */ import_react2.default.createElement(
    "input",
    {
      value: form.packageDir,
      spellCheck: false,
      placeholder: "F:\\everyAI\\dsh-mv-cli\\world_execute_me",
      onChange: (event) => setForm({ packageDir: event.target.value }),
      onBlur: () => {
        if (!form.pythonPath && form.packageDir) setForm({ pythonPath: suggestedPython(form.packageDir) });
      }
    }
  )), /* @__PURE__ */ import_react2.default.createElement("label", { className: "mv-field mv-wide" }, /* @__PURE__ */ import_react2.default.createElement("span", null, "Python \u89E3\u91CA\u5668"), /* @__PURE__ */ import_react2.default.createElement("input", { value: form.pythonPath, spellCheck: false, placeholder: "F:\\everyAI\\dsh-mv-cli\\world_execute_me\\python\\python.exe", onChange: (event) => setForm({ pythonPath: event.target.value }) }))), rust && /* @__PURE__ */ import_react2.default.createElement("label", { className: "mv-field mv-wide" }, /* @__PURE__ */ import_react2.default.createElement("span", null, "world-execute-me-rust.exe\uFF08\u81EA\u884C\u4ECE\u5176 GitHub Release \u4E0B\u8F7D\uFF09"), /* @__PURE__ */ import_react2.default.createElement("input", { value: form.exePath, spellCheck: false, placeholder: "D:\\tools\\world-execute-me-rust\\world-execute-me-rust.exe", onChange: (event) => setForm({ exePath: event.target.value }) })), /* @__PURE__ */ import_react2.default.createElement("label", { className: "mv-field mv-wide" }, /* @__PURE__ */ import_react2.default.createElement("span", null, rust ? "\u97F3\u9891\u6587\u4EF6\uFF08\u53EF\u9009\uFF0C\u4EC5 MP3\uFF1B\u7559\u7A7A\u64AD\u653E\u5176\u5185\u5D4C\u97F3\u4E50\uFF09" : "\u97F3\u9891\u6587\u4EF6\uFF08\u53EF\u9009\uFF1B\u7559\u7A7A\u7528\u64AD\u653E\u5668\u9ED8\u8BA4\u7684 input\\song.mp3\uFF09"), /* @__PURE__ */ import_react2.default.createElement("input", { value: form.audioFile, spellCheck: false, disabled: !rust && form.noAudio, placeholder: "D:\\music\\world.execute(me).mp3", onChange: (event) => setForm({ audioFile: event.target.value }) })), !rust && /* @__PURE__ */ import_react2.default.createElement("label", { className: "mv-check" }, /* @__PURE__ */ import_react2.default.createElement("input", { type: "checkbox", checked: form.noAudio, onChange: (event) => setForm({ noAudio: event.target.checked }) }), " \u4E0D\u64AD\u653E\u58F0\u97F3\uFF08--no-audio\uFF09"), /* @__PURE__ */ import_react2.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react2.default.createElement("span", null, "\u8D77\u59CB\u79D2\u6570"), /* @__PURE__ */ import_react2.default.createElement("input", { value: form.start, placeholder: "0", inputMode: "decimal", onChange: (event) => setForm({ start: event.target.value }) })), !rust && /* @__PURE__ */ import_react2.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react2.default.createElement("span", null, "\u97F3\u9891\u5EF6\u8FDF\u8865\u507F\uFF08\u79D2\uFF09"), /* @__PURE__ */ import_react2.default.createElement("input", { value: form.audioLatency, placeholder: "\u9ED8\u8BA4", inputMode: "decimal", onChange: (event) => setForm({ audioLatency: event.target.value }) })), rust && /* @__PURE__ */ import_react2.default.createElement("label", { className: "mv-field" }, /* @__PURE__ */ import_react2.default.createElement("span", null, "\u5B57\u5E55\u504F\u79FB\uFF08\u79D2\uFF09"), /* @__PURE__ */ import_react2.default.createElement("input", { value: form.offset, placeholder: "0", inputMode: "decimal", onChange: (event) => setForm({ offset: event.target.value }) })), rust && /* @__PURE__ */ import_react2.default.createElement("label", { className: "mv-check" }, /* @__PURE__ */ import_react2.default.createElement("input", { type: "checkbox", checked: form.autoplay, onChange: (event) => setForm({ autoplay: event.target.checked }) }), " \u7ACB\u5373\u64AD\u653E\uFF08--autoplay\uFF09")), /* @__PURE__ */ import_react2.default.createElement("p", { className: "mv-caption" }, "\u5C06\u8FD0\u884C\uFF1A", /* @__PURE__ */ import_react2.default.createElement("code", null, problem ? "\u2014" : checked?.display ?? commandPreview(form))), !confirming && /* @__PURE__ */ import_react2.default.createElement("div", { className: "mv-actions" }, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", disabled: Boolean(problem) || checking, onClick: () => void check() }, checking ? "\u68C0\u67E5\u4E2D\u2026" : "\u68C0\u67E5\u8DEF\u5F84"), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "mv-button", disabled: Boolean(problem) || Boolean(session && !ended), onClick: () => {
    setConfirming(true);
  } }, "\u542F\u52A8\u2026"), session && !ended && /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", onClick: () => void api.terminalStop({ sessionId: session.sessionId }) }, "\u7ED3\u675F"), /* @__PURE__ */ import_react2.default.createElement("label", { className: "mv-inline" }, "\u5B57\u53F7", /* @__PURE__ */ import_react2.default.createElement("input", { type: "number", min: 8, max: 24, value: fontSize, onChange: (event) => setFontSize(Math.min(24, Math.max(8, Number(event.target.value) || 13))) })), /* @__PURE__ */ import_react2.default.createElement("span", { className: "mv-caption" }, problem || (checked ? "\u8DEF\u5F84\u68C0\u67E5\u901A\u8FC7\u3002" : ""))), confirming && /* @__PURE__ */ import_react2.default.createElement("div", { className: "mv-confirm", role: "dialog", "aria-label": "\u786E\u8BA4\u542F\u52A8 MV \u7EC8\u7AEF" }, /* @__PURE__ */ import_react2.default.createElement("strong", null, details.title), /* @__PURE__ */ import_react2.default.createElement("p", { className: "mv-caption" }, "\u547D\u4EE4\uFF1A", /* @__PURE__ */ import_react2.default.createElement("code", null, details.command), /* @__PURE__ */ import_react2.default.createElement("br", null), "\u5DE5\u4F5C\u76EE\u5F55\uFF1A", /* @__PURE__ */ import_react2.default.createElement("code", null, details.cwd)), /* @__PURE__ */ import_react2.default.createElement("ul", null, details.points.map((point2) => /* @__PURE__ */ import_react2.default.createElement("li", { key: point2 }, point2))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "mv-actions" }, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "mv-button", disabled: starting, onClick: () => void start() }, starting ? "\u6B63\u5728\u542F\u52A8\u2026" : "\u786E\u8BA4\u542F\u52A8"), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "mv-button mv-button-secondary", disabled: starting, onClick: () => setConfirming(false) }, "\u53D6\u6D88"))), problemText && /* @__PURE__ */ import_react2.default.createElement("pre", { className: "mv-error", role: "alert" }, problemText), session && /* @__PURE__ */ import_react2.default.createElement(TerminalScreen, { key: session.sessionId, api, session, onEnded, fontSize }), ended && /* @__PURE__ */ import_react2.default.createElement("p", { className: "mv-caption" }, endDescription(ended)));
}

// .dsh-plugin/client/mv.css
var mv_default = '.mv-root { padding: 16px 20px 24px; color: var(--dsw-alias-label-primary, inherit); font-size: 13px; line-height: 20px; box-sizing: border-box; }\n.mv-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }\n.mv-title { margin: 0 0 4px; font-size: 18px; font-family: "Cascadia Mono", Consolas, monospace; }\n.mv-caption { color: var(--dsw-alias-label-secondary, #888); font-size: 12px; margin: 4px 0; }\n.mv-banner { margin: 10px 0; padding: 8px 12px; border-radius: 8px; background: rgba(255, 95, 95, .12); color: var(--dsw-alias-label-danger, #d33); }\n.mv-error { color: var(--dsw-alias-label-danger, #d33); white-space: pre-wrap; margin: 6px 0; }\n.mv-tabs { display: flex; gap: 4px; margin: 12px 0 10px; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.3)); }\n.mv-tabs button { border: 0; background: transparent; color: inherit; padding: 6px 14px; cursor: pointer; font: inherit; border-bottom: 2px solid transparent; }\n.mv-tabs button[aria-selected="true"] { border-bottom-color: #ffaf5f; font-weight: 600; }\n.mv-toolbar, .mv-transport, .mv-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 6px 0; }\n.mv-media-line { display: flex; flex-direction: column; gap: 2px; margin: 6px 0; font-size: 12px; }\n.mv-media-line code { font-size: 11px; }\n.mv-button { border: 1px solid #ffaf5f; background: #ffaf5f; color: #000; border-radius: 6px; padding: 4px 10px; cursor: pointer; font: inherit; }\n.mv-button:disabled { opacity: .5; cursor: default; }\n.mv-button-secondary { background: transparent; color: inherit; border-color: var(--dsw-alias-border-l1, rgba(127,127,127,.5)); }\n.mv-link { border: 0; background: none; color: #d7875f; cursor: pointer; padding: 0 2px; font: inherit; text-decoration: underline; }\n.mv-inline { display: inline-flex; gap: 4px; align-items: center; font-size: 12px; }\n.mv-inline input { width: 52px; }\n.mv-chip { font-family: "Cascadia Mono", Consolas, monospace; font-size: 12px; padding: 1px 8px; border-radius: 10px; background: rgba(127,127,127,.15); }\n.mv-clock { font-family: "Cascadia Mono", Consolas, monospace; min-width: 120px; }\n.mv-seek { flex: 1 1 260px; accent-color: #ffaf5f; }\n.mv-stage-wrap { background: #000; border-radius: 8px; outline: none; padding: 6px; box-sizing: border-box; }\n.mv-stage-wrap:focus-visible { box-shadow: 0 0 0 2px #ffaf5f; }\n.mv-stage { height: min(68vh, 760px); min-height: 360px; resize: vertical; overflow: hidden; display: flex; align-items: center; justify-content: center; }\n.mv-stage canvas { display: block; }\n.mv-fullscreen { border-radius: 0; padding: 0; width: 100vw; height: 100vh; }\n.mv-fullscreen .mv-stage { height: 100vh; resize: none; }\n.mv-form { display: flex; flex-wrap: wrap; gap: 10px 14px; margin: 8px 0; }\n.mv-field { display: flex; flex-direction: column; gap: 3px; font-size: 12px; min-width: 140px; }\n.mv-field input, .mv-field select { font: inherit; padding: 4px 6px; border-radius: 6px; border: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.4)); background: transparent; color: inherit; }\n.mv-wide { flex: 1 1 420px; }\n.mv-check { display: inline-flex; gap: 6px; align-items: center; font-size: 12px; align-self: flex-end; }\n.mv-confirm { margin-top: 10px; padding: 12px; border: 1px solid #ffaf5f; border-radius: 8px; }\n.mv-confirm ul { margin: 6px 0; padding-left: 20px; }\n.mv-confirm code, .mv-term-tab code { word-break: break-all; }\n.mv-term-pane { margin-top: 10px; }\n.mv-term-screen { height: min(70vh, 760px); min-height: 300px; resize: vertical; overflow: hidden; padding: 4px; background: #000; border-radius: 8px; box-sizing: border-box; }\n';

// .dsh-plugin/client/mv-panel.jsx
var TAB_KEY = "dsh-mv.panel.tab";
function MvPanel({ api }) {
  const [tab, setTabState] = import_react3.default.useState(() => {
    try {
      return globalThis.localStorage?.getItem(TAB_KEY) === "terminal" ? "terminal" : "canvas";
    } catch {
      return "canvas";
    }
  });
  const [info, setInfo] = import_react3.default.useState({ status: "loading", value: null, error: "" });
  const setTab = (value) => {
    setTabState(value);
    try {
      globalThis.localStorage?.setItem(TAB_KEY, value);
    } catch {
    }
  };
  const reloadInfo = import_react3.default.useCallback(async () => {
    try {
      const value = await loadInfo(api);
      setInfo({ status: "ready", value, error: "" });
    } catch (error) {
      setInfo({ status: "error", value: null, error: errorText(error, "\u65E0\u6CD5\u8FDE\u63A5 MV \u63D2\u4EF6\u540E\u53F0\u3002") });
    }
  }, [api]);
  import_react3.default.useEffect(() => {
    void reloadInfo();
  }, [reloadInfo]);
  const notice = info.status === "ready" ? versionNotice({ hostVersion: info.value?.hostVersion }) : "";
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-root" }, /* @__PURE__ */ import_react3.default.createElement("style", null, mv_default), /* @__PURE__ */ import_react3.default.createElement("header", { className: "mv-head" }, /* @__PURE__ */ import_react3.default.createElement("div", null, /* @__PURE__ */ import_react3.default.createElement("h1", { className: "mv-title" }, "world.execute(me); \u653E\u6620\u5BA4"), /* @__PURE__ */ import_react3.default.createElement("p", { className: "mv-caption" }, "\u975E\u5B98\u65B9\u540C\u4EBA\u5DE5\u5177\u3002\u6B4C\u66F2\u4E0E\u6B4C\u8BCD\u7248\u6743\u5F52 Mili\uFF1B\u753B\u9762\u573A\u666F\u79FB\u690D\u81EA yym8224961/world.execute-me-ascii\uFF08\u7ECF\u4F5C\u8005\u8BB8\u53EF\uFF09\u3002\u63D2\u4EF6\u4E0D\u9644\u5E26\u4EFB\u4F55\u97F3\u9891\u3001\u89C6\u9891\u6216\u6B4C\u8BCD\uFF0C\u8BF7\u4F7F\u7528\u4F60\u81EA\u5DF1\u7684\u6587\u4EF6\u3002")), /* @__PURE__ */ import_react3.default.createElement("span", { className: "mv-caption" }, "v", CLIENT_VERSION || "?")), notice && /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-banner", role: "alert" }, notice), info.status === "error" && tab === "terminal" && /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-banner", role: "alert" }, info.error), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mv-tabs", role: "tablist" }, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", role: "tab", "aria-selected": tab === "canvas", onClick: () => setTab("canvas") }, "\u753B\u5E03 MV"), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", role: "tab", "aria-selected": tab === "terminal", onClick: () => setTab("terminal") }, "MV \u7EC8\u7AEF")), /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: tab === "canvas" ? "block" : "none" } }, /* @__PURE__ */ import_react3.default.createElement(CanvasMv, { defaultFontSize: info.value?.canvasFontSize ?? 14 })), tab === "terminal" && /* @__PURE__ */ import_react3.default.createElement(MvTerminal, { api, info: info.value, reloadInfo }));
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
function plainObject2(value, subject) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${subject} must be an object`);
  return value;
}
var anyObjectCodec = (name) => strictCodec(`${MV_REMOTE_PACKAGE}#${name}`, (value) => plainObject2(value, name));
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
  descriptor("terminalCheck", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvTerminalCheck`, parseMvTerminalCheck))], anyObjectCodec("MvTerminalChecked")),
  descriptor("terminalStart", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvTerminalStart`, parseMvTerminalStart))], anyObjectCodec("MvTerminalStarted")),
  descriptor("terminalRead", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvTerminalRead`, parseMvTerminalRead))], anyObjectCodec("MvTerminalOutput")),
  descriptor("terminalWrite", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvTerminalWrite`, parseMvTerminalWrite))], anyObjectCodec("MvTerminalWritten")),
  descriptor("terminalResize", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvTerminalResize`, parseMvTerminalResize))], anyObjectCodec("MvTerminalResized")),
  descriptor("terminalStop", [jsonParameter("request", requestCodec(`${MV_REMOTE_PACKAGE}#MvTerminalStop`, parseMvTerminalStop))], anyObjectCodec("MvTerminalStopped"))
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
  return /* @__PURE__ */ import_react4.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ import_react4.default.createElement("rect", { x: "1.5", y: "2.5", width: "13", height: "11", rx: "2", stroke: "currentColor" }), /* @__PURE__ */ import_react4.default.createElement("path", { d: "M4 6l2 2-2 2M7.5 10.5H11", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" }));
}
function panelApi(remote) {
  const service = remote[MV_REMOTE_NAMESPACE];
  return {
    info: () => service.info(),
    terminalCheck: (request2) => service.terminalCheck(request2),
    terminalStart: (request2) => service.terminalStart(request2),
    terminalRead: (request2) => service.terminalRead(request2),
    terminalWrite: (request2) => service.terminalWrite(request2),
    terminalResize: (request2) => service.terminalResize(request2),
    terminalStop: (request2) => service.terminalStop(request2)
  };
}
var OPEN_BUTTON = Object.freeze({ border: "1px solid #ffaf5f", background: "transparent", color: "inherit", borderRadius: 6, padding: "3px 10px", cursor: "pointer", font: "inherit", fontSize: 12 });
function OpenMvPanel({ subject, openPanel }) {
  if (subject?.kind !== "bundle" || subject.pkg?.name !== MV_REMOTE_PACKAGE) return null;
  return /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", style: OPEN_BUTTON, onClick: openPanel }, "\u6253\u5F00 MV \u653E\u6620\u5BA4");
}
var UI_INJECT = ["slots", "configForms", "remote", `remote.${MV_REMOTE_NAMESPACE}`, "layout"];
function registerUi(ctx) {
  const api = Object.freeze(panelApi(ctx.remote));
  const served = (slot, item, component, label) => ctx.effect(() => ctx.configForms.whileServed(
    [PLUGIN_NAME],
    () => ctx.slots.inject(slot, () => ctx.slots.register(item, component))
  ), `dsh-mv: ${label}`);
  served("main", { name: "main", key: PANEL, inject: () => ({ api }) }, MvPanel, "main workspace");
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
  const ui3 = ctx.inject(UI_INJECT, registerUi);
  try {
    await ui3;
  } catch (error) {
    await ui3.dispose?.();
    await disposeRemote?.();
    throw error;
  }
  return async () => {
    await ui3.dispose?.();
    await disposeRemote?.();
  };
}
/*! Bundled license information:

@xterm/xterm/lib/xterm.mjs:
@xterm/addon-fit/lib/addon-fit.mjs:
@xterm/addon-webgl/lib/addon-webgl.mjs:
  (**
   * Copyright (c) 2014-2024 The xterm.js authors. All rights reserved.
   * @license MIT
   *
   * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
   * @license MIT
   *
   * Originally forked from (with the author's permission):
   *   Fabrice Bellard's javascript vt100 for jslinux:
   *   http://bellard.org/jslinux/
   *   Copyright (c) 2011 Fabrice Bellard
   *)
*/
    return module.exports;
  },
});
