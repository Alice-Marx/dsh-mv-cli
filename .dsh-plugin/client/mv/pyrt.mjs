/**
 * Minimal Python semantics for the transpiled world.execute-me-ascii scenes
 * (scenes.gen.mjs). Only what that code uses: floor modulo, negative indices,
 * slices, list/str concatenation and repetition, tuple comparison, dict/set
 * with tuple keys, banker's rounding, code-point string indexing and format specs.
 */

const SURROGATE = /[\uD800-\uDFFF]/

function chars(s) { return SURROGATE.test(s) ? Array.from(s) : null }

export function $key(k) {
  switch (typeof k) {
    case 'number': return 'n' + k
    case 'boolean': return 'n' + (+k)
    case 'string': return 's' + k
    default:
      if (k === null || k === undefined) return 'N'
      if (Array.isArray(k)) return '[' + k.map($key).join(',') + ']'
      throw new TypeError('unhashable key')
  }
}

export class PyDict {
  constructor(entries = []) { this.map = new Map(); for (const [k, v] of entries) this.set(k, v) }
  get size() { return this.map.size }
  has(k) { return this.map.has($key(k)) }
  get(k) {
    const e = this.map.get($key(k))
    if (e === undefined) throw new Error('KeyError: ' + String(k))
    return e[1]
  }
  set(k, v) { this.map.set($key(k), [k, v]) }
  keys() { return [...this.map.values()].map(e => e[0]) }
  entries() { return [...this.map.values()].map(e => [e[0], e[1]]) }
}

export class PySet {
  constructor(values = []) { this.map = new Map(); for (const v of values) this.add(v) }
  get size() { return this.map.size }
  has(v) { return this.map.has($key(v)) }
  add(v) { this.map.set($key(v), v) }
  values() { return [...this.map.values()] }
}

export function $iter(x) {
  if (Array.isArray(x)) return x
  if (typeof x === 'string') return chars(x) ?? x.split('')
  if (x instanceof PyDict) return x.keys()
  if (x instanceof PySet) return x.values()
  if (x && typeof x[Symbol.iterator] === 'function') return Array.from(x)
  throw new TypeError('object is not iterable')
}

export function $unpack(v, n) {
  const a = Array.isArray(v) ? v : $iter(v)
  if (a.length !== n) throw new Error(`ValueError: expected ${n} values to unpack, got ${a.length}`)
  return a
}

export function $add(a, b) {
  if (Array.isArray(a)) return a.concat(b)
  return a + b
}

export function $mul(a, b) {
  const ta = typeof a, tb = typeof b
  if (ta === 'number' && tb === 'number') return a * b
  if (ta === 'string') return b > 0 ? a.repeat(Math.trunc(b)) : ''
  if (tb === 'string') return a > 0 ? b.repeat(Math.trunc(a)) : ''
  if (Array.isArray(a)) { const out = []; for (let i = 0; i < b; i++) out.push(...a); return out }
  if (Array.isArray(b)) return $mul(b, a)
  return a * b
}

export function $mod(a, b) {
  const r = a % b
  return r !== 0 && (r < 0) !== (b < 0) ? r + b : r
}

const SMALL = x => Number.isInteger(x) && x >= -0x80000000 && x <= 0x7fffffff
export function $band(a, b) { return SMALL(a) && SMALL(b) ? a & b : Number(BigInt(a) & BigInt(b)) }
export function $bor(a, b) { return SMALL(a) && SMALL(b) ? a | b : Number(BigInt(a) | BigInt(b)) }
export function $bxor(a, b) { return SMALL(a) && SMALL(b) ? a ^ b : Number(BigInt(a) ^ BigInt(b)) }
export function $rshift(a, b) { return SMALL(a) && b < 32 ? a >> b : Number(BigInt(a) >> BigInt(b)) }
export function $lshift(a, b) { return Number(BigInt(a) << BigInt(b)) }

/** splitmix-style 16-bit hash, bit-exact with the Python original. */
export function hash16(i) {
  let v = (i + 0x9E3779B9) >>> 0
  v = Math.imul((v ^ (v >>> 16)) >>> 0, 0x7FEB352D) >>> 0
  v = Math.imul((v ^ (v >>> 15)) >>> 0, 0x846CA68B) >>> 0
  return ((v ^ (v >>> 16)) >>> 0) & 65535
}

export function $eq(a, b) {
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (!$eq(a[i], b[i])) return false
    return true
  }
  if (typeof a === 'boolean' || typeof b === 'boolean') return +a === +b
  return false
}

export function $cmp(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    const n = Math.min(a.length, b.length)
    for (let i = 0; i < n; i++) { const c = $cmp(a[i], b[i]); if (c !== 0) return c }
    return a.length - b.length
  }
  return a < b ? -1 : a > b ? 1 : 0
}

export function $in(x, c) {
  if (typeof c === 'string') return c.includes(x)
  if (Array.isArray(c)) { for (const v of c) if ($eq(v, x)) return true; return false }
  if (c instanceof PyDict || c instanceof PySet) return c.has(x)
  if (c && typeof c === 'object') return Object.hasOwn(c, x)
  throw new TypeError('argument is not iterable')
}

function index(len, i) { return i < 0 ? len + i : i }

export function $at(o, i) {
  if (Array.isArray(o)) return o[i < 0 ? o.length + i : i]
  if (typeof o === 'string') {
    const cs = chars(o)
    if (cs) return cs[index(cs.length, i)]
    return o[index(o.length, i)]
  }
  if (o instanceof PyDict) return o.get(i)
  if (o === null || o === undefined) throw new TypeError('NoneType is not subscriptable')
  return o[i]
}

export function $setitem(o, i, v) {
  if (Array.isArray(o)) { o[i < 0 ? o.length + i : i] = v; return }
  if (o instanceof PyDict) { o.set(i, v); return }
  o[i] = v
}

function sliceBounds(len, lo, hi, step) {
  const st = step ?? 1
  if (st === 0) throw new Error('slice step cannot be zero')
  const clampIdx = (x, def, lower, upper) => {
    if (x === null || x === undefined) return def
    let v = Math.trunc(x)
    if (v < 0) v += len
    return Math.min(Math.max(v, lower), upper)
  }
  if (st > 0) return [clampIdx(lo, 0, 0, len), clampIdx(hi, len, 0, len), st]
  return [clampIdx(lo, len - 1, -1, len - 1), clampIdx(hi, -1, -1, len - 1), st]
}

export function $slice(o, lo, hi, step) {
  const isStr = typeof o === 'string'
  const seq = isStr ? (chars(o) ?? o) : o
  const [a, b, st] = sliceBounds(seq.length, lo, hi, step)
  if (st === 1) {
    const part = seq.slice(a, Math.max(a, b))
    return isStr && Array.isArray(part) ? part.join('') : part
  }
  const out = []
  if (st > 0) for (let i = a; i < b; i += st) out.push(seq[i])
  else for (let i = a; i > b; i += st) out.push(seq[i])
  return isStr ? out.join('') : out
}

export function $setslice(o, lo, hi, v) {
  const [a, b] = sliceBounds(o.length, lo, hi, 1)
  o.splice(a, Math.max(0, b - a), ...$iter(v))
}

export function $truth(x) {
  if (x === null || x === undefined || x === false) return false
  if (x === true) return true
  if (typeof x === 'number') return x !== 0 && !Number.isNaN(x)
  if (typeof x === 'string' || Array.isArray(x)) return x.length > 0
  if (x instanceof PyDict || x instanceof PySet) return x.size > 0
  return true
}

export function $str(v) {
  if (v === null || v === undefined) return 'None'
  if (v === true) return 'True'
  if (v === false) return 'False'
  if (typeof v === 'number') {
    if (Number.isNaN(v)) return 'nan'
    if (!Number.isFinite(v)) return v > 0 ? 'inf' : '-inf'
    return String(v)
  }
  if (Array.isArray(v)) return '(' + v.map(x => typeof x === 'string' ? `'${x}'` : $str(x)).join(', ') + (v.length === 1 ? ',)' : ')')
  return String(v)
}

/** Python format-spec mini-language: [[fill]align][sign][0][width][.precision][type]. */
export function $fmt(v, spec) {
  if (!spec) return $str(v)
  const m = /^(?:(.)?([<>^=]))?([+\- ])?(0)?(\d+)?(?:\.(\d+))?([dfxXseEg%])?$/u.exec(spec)
  if (!m) throw new Error('unsupported format spec ' + spec)
  let [, fill, align, sign, zero, width, prec, type] = m
  let body
  const num = typeof v === 'number' || typeof v === 'boolean'
  const n = Number(v)
  if (type === 'd') body = String(Math.abs(Math.trunc(n)))
  else if (type === 'x' || type === 'X') { body = Math.abs(Math.trunc(n)).toString(16); if (type === 'X') body = body.toUpperCase() }
  else if (type === 'f') body = Math.abs(n).toFixed(prec === undefined ? 6 : Number(prec))
  else if (type === '%') body = (Math.abs(n) * 100).toFixed(prec === undefined ? 6 : Number(prec)) + '%'
  else if (type === 'e' || type === 'E') { body = Math.abs(n).toExponential(prec === undefined ? 6 : Number(prec)).replace(/e([+-])(\d)$/, 'e$10$2'); if (type === 'E') body = body.toUpperCase() }
  else if (num && prec !== undefined) body = Math.abs(n).toFixed(Number(prec))
  else body = num ? $str(Math.abs(n)) : $str(v)
  let s = ''
  if (num) {
    const negative = n < 0 || Object.is(n, -0) && type === 'f'
    if (negative && n !== 0) s = '-'
    else if (sign === '+') s = '+'
    else if (sign === ' ') s = ' '
  }
  const w = width ? Number(width) : 0
  if (zero && !align) { fill = '0'; align = '=' }
  fill = fill ?? ' '
  align = align ?? (num ? '>' : '<')
  const len = Array.from(s + body).length
  const pad = Math.max(0, w - len)
  if (align === '=') return s + fill.repeat(pad) + body
  if (align === '<') return s + body + fill.repeat(pad)
  if (align === '^') { const l = Math.floor(pad / 2); return fill.repeat(l) + s + body + fill.repeat(pad - l) }
  return fill.repeat(pad) + s + body
}

export function $range(a, b, s) {
  let start = 0, stop = a, step = 1
  if (b !== undefined) { start = a; stop = b }
  if (s !== undefined) step = s
  start = $int(start); stop = $int(stop)
  const out = []
  if (step > 0) for (let i = start; i < stop; i += step) out.push(i)
  else for (let i = start; i > stop; i += step) out.push(i)
  return out
}

export function $enumerate(it, start = 0) { return $iter(it).map((v, i) => [i + start, v]) }

export function $zip(...its) {
  const arrays = its.map($iter)
  const n = Math.min(...arrays.map(a => a.length))
  const out = []
  for (let i = 0; i < n; i++) out.push(arrays.map(a => a[i]))
  return out
}

export function $sorted(it) { return [...$iter(it)].sort($cmp) }
export function $reversed(it) { return [...$iter(it)].reverse() }
export function $sum(it, start = 0) { let s = start; for (const v of $iter(it)) s = $add(s, v); return s }

function pick(args, better) {
  const list = args.length === 1 ? $iter(args[0]) : args
  if (list.length === 0) throw new Error('ValueError: arg is an empty sequence')
  let best = list[0]
  for (let i = 1; i < list.length; i++) if (better(list[i], best)) best = list[i]
  return best
}
export function $min(...args) {
  if (args.length === 2 && typeof args[0] === 'number' && typeof args[1] === 'number') return args[1] < args[0] ? args[1] : args[0]
  return pick(args, (a, b) => $cmp(a, b) < 0)
}
export function $max(...args) {
  if (args.length === 2 && typeof args[0] === 'number' && typeof args[1] === 'number') return args[1] > args[0] ? args[1] : args[0]
  return pick(args, (a, b) => $cmp(a, b) > 0)
}

export function $len(o) {
  if (typeof o === 'string') { const cs = chars(o); return cs ? cs.length : o.length }
  if (Array.isArray(o)) return o.length
  if (o instanceof PyDict || o instanceof PySet) return o.size
  throw new TypeError('object has no len()')
}

export function $int(v) {
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new Error('cannot convert float to integer')
    return Math.trunc(v) + 0
  }
  if (typeof v === 'boolean') return +v
  if (typeof v === 'string') { const n = Number.parseInt(v.trim(), 10); if (Number.isNaN(n)) throw new Error('invalid literal for int()'); return n }
  throw new TypeError('int() argument')
}
export function $float(v) { return Number(v) }

/** Python round(): half to even. */
export function $round(x, nd) {
  if (nd === undefined || nd === null) {
    const f = Math.floor(x), d = x - f
    if (d > 0.5) return f + 1
    if (d < 0.5) return f
    return f % 2 === 0 ? f : f + 1
  }
  const p = 10 ** nd
  return $round(x * p) / p
}

export function $next(it, ...fallback) {
  const a = $iter(it)
  if (a.length) return a[0]
  if (fallback.length) return fallback[0]
  throw new Error('StopIteration')
}
export function $chr(n) { return String.fromCodePoint(n) }
export function $ord(s) { return s.codePointAt(0) }
export function $bin(n) { return (n < 0 ? '-0b' : '0b') + Math.abs(n).toString(2) }
export function $list(it) { return it === undefined ? [] : [...$iter(it)] }
export function $set_(it) { return new PySet(it === undefined ? [] : $iter(it)) }
export function $dict_(it) { return new PyDict(it === undefined ? [] : $iter(it)) }
export function $any(it) { return $iter(it).some($truth) }
export function $all(it) { return $iter(it).every($truth) }
export function $isinstance(v, names) {
  return names.some(n => n === 'int' ? Number.isInteger(v) || typeof v === 'boolean'
    : n === 'float' ? typeof v === 'number'
      : n === 'str' ? typeof v === 'string'
        : n === 'tuple' || n === 'list' ? Array.isArray(v)
          : n === 'dict' ? v instanceof PyDict : false)
}
export function $join(sep, it) { return $iter(it).join(sep) }
export function $items(d) { return d instanceof PyDict ? d.entries() : Object.entries(d) }
export function $get(o, k, d = null) {
  if (o instanceof PyDict) return o.has(k) ? o.get(k) : d
  return Object.hasOwn(o, k) ? o[k] : d
}
export function $strip(s, set) {
  if (set === undefined || set === null) return s.replace(/^\s+|\s+$/gu, '')
  const cs = new Set(Array.from(set)); const a = Array.from(s)
  let i = 0, j = a.length
  while (i < j && cs.has(a[i])) i++
  while (j > i && cs.has(a[j - 1])) j--
  return a.slice(i, j).join('')
}
export function $ljust(s, n, ch = ' ') { const l = $len(s); return l >= n ? s : s + ch.repeat(n - l) }
export function $rjust(s, n, ch = ' ') { const l = $len(s); return l >= n ? s : ch.repeat(n - l) + s }
export function $count(o, x) {
  if (typeof o === 'string') { if (x === '') return $len(o) + 1; let c = 0, i = 0; while ((i = o.indexOf(x, i)) !== -1) { c++; i += x.length } return c }
  return $iter(o).filter(v => $eq(v, x)).length
}
export function $split(s, sep) {
  if (sep === undefined || sep === null) return s.split(/\s+/u).filter(Boolean)
  return s.split(sep)
}
export function $index(o, x) {
  const a = typeof o === 'string' ? null : $iter(o)
  const i = a ? a.findIndex(v => $eq(v, x)) : o.indexOf(x)
  if (i < 0) throw new Error('ValueError: not in list')
  return i
}
