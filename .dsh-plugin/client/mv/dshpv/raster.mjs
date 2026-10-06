/** Optional, data-only dsh-pv raster layers. Image references are atlas indices, never paths or URLs. */
export const DSHPV_RASTER_LIMITS = Object.freeze({
  frames: 12_000, frameOps: 256, frameDrawPixels: 4 * 1280 * 720, totalOps: 64_000, atlases: 16,
  imageSide: 8192, imagePixels: 16 * 1024 * 1024, totalPixels: 64 * 1024 * 1024,
  jsonBytes: 8 * 1024 * 1024, imageBytes: 8 * 1024 * 1024, duration: 36_000,
})

const SIZE = [1280, 720]
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v)
const fail = message => { throw new Error(`dsh-pv raster：${message}`) }
const keys = (value, allowed, name) => {
  if (!object(value)) fail(`${name} 必须是对象`)
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${name} 有未知字段 ${key}`)
}
const finite = value => typeof value === 'number' && Number.isFinite(value)

/** Validates and copies the descriptor without evaluating code or retaining arbitrary extension fields. */
export function validateRasterTimeline(value) {
  keys(value, ['version', 'size', 'frames'], '时间轴')
  if (value.version !== 1) fail('version 必须是 1')
  if (!Array.isArray(value.size) || value.size.length !== 2 || value.size.some((v, i) => v !== SIZE[i])) fail('size 必须是 [1280,720]')
  if (!Array.isArray(value.frames) || !value.frames.length || value.frames.length > DSHPV_RASTER_LIMITS.frames) fail('frames 数量无效')
  let previous = -1, total = 0
  const frames = value.frames.map((frame, index) => {
    keys(frame, ['t', 'ops'], `frames[${index}]`)
    if (!finite(frame.t) || frame.t < 0 || frame.t > DSHPV_RASTER_LIMITS.duration || frame.t <= previous) fail('帧时间必须严格递增且在允许范围内')
    previous = frame.t
    if (!Array.isArray(frame.ops) || frame.ops.length > DSHPV_RASTER_LIMITS.frameOps) fail('每帧 ops 数量无效')
    total += frame.ops.length
    if (total > DSHPV_RASTER_LIMITS.totalOps) fail('ops 总数过多')
    let drawPixels = 0
    const ops = frame.ops.map((op, at) => {
      keys(op, ['atlas', 'src', 'dst', 'alpha', 'z'], `frames[${index}].ops[${at}]`)
      if (!Number.isInteger(op.atlas) || op.atlas < 0 || op.atlas >= DSHPV_RASTER_LIMITS.atlases) fail('atlas 索引无效')
      if (!Array.isArray(op.src) || op.src.length !== 4 || op.src.some(v => !Number.isInteger(v)) || op.src[0] < 0 || op.src[1] < 0 || op.src[2] <= 0 || op.src[3] <= 0 || op.src.some(v => v > DSHPV_RASTER_LIMITS.imageSide)) fail('src 应是有界的整数像素矩形')
      if (!Array.isArray(op.dst) || op.dst.length !== 4 || op.dst.some(v => !finite(v)) || Math.abs(op.dst[0]) > SIZE[0] || Math.abs(op.dst[1]) > SIZE[1] || op.dst[2] <= 0 || op.dst[2] > SIZE[0] || op.dst[3] <= 0 || op.dst[3] > SIZE[1]) fail('dst 应是画面范围内的有限矩形')
      const alpha = op.alpha ?? 1
      if (!finite(alpha) || alpha < 0 || alpha > 1) fail('alpha 必须在 0 到 1 之间')
      if (op.z !== 'under' && op.z !== 'over') fail('z 必须是 under 或 over')
      drawPixels += op.dst[2] * op.dst[3]
      if (drawPixels > DSHPV_RASTER_LIMITS.frameDrawPixels) fail('每帧图层总绘制面积过大')
      return { atlas: op.atlas, src: [...op.src], dst: [...op.dst], alpha, z: op.z }
    })
    return { t: frame.t, ops }
  })
  return { version: 1, size: [...SIZE], frames }
}

function checkDimensions(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || width > DSHPV_RASTER_LIMITS.imageSide || height > DSHPV_RASTER_LIMITS.imageSide || width * height > DSHPV_RASTER_LIMITS.imagePixels) fail('图集尺寸超出允许范围')
  return { width, height }
}

/** Reads PNG/WebP dimensions before decoding, so compressed oversized images are rejected first. */
export function rasterImageDimensions(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input)
  if (!bytes.length || bytes.length > DSHPV_RASTER_LIMITS.imageBytes) fail('图集文件大小无效')
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const text = (at, length) => String.fromCharCode(...bytes.subarray(at, at + length))
  if (bytes.length >= 24 && bytes[0] === 137 && text(1, 7) === 'PNG\r\n\x1a\n' && text(12, 4) === 'IHDR') return checkDimensions(view.getUint32(16), view.getUint32(20))
  if (bytes.length < 26 || text(0, 4) !== 'RIFF' || text(8, 4) !== 'WEBP') fail('图集必须是 PNG 或 WebP')
  if (view.getUint32(4, true) !== bytes.length - 8) fail('WebP RIFF 文件大小不匹配')
  const uint24 = at => bytes[at] | bytes[at + 1] << 8 | bytes[at + 2] << 16
  const seen = new Set(), metadata = new Set(['ICCP', 'EXIF', 'XMP '])
  let at = 12, chunks = 0, metadataBytes = 0, logical = null, pixels = null, flags = 0
  while (at < bytes.length) {
    if (++chunks > 16 || at + 8 > bytes.length) fail('WebP chunk 数量过多或文件不完整')
    const kind = text(at, 4), length = view.getUint32(at + 4, true), data = at + 8
    if (data + length + (length & 1) > bytes.length) fail('WebP 图集不完整')
    if (length & 1 && bytes[data + length] !== 0) fail('WebP padding 无效')
    if (kind === 'ANIM' || kind === 'ANMF') fail('WebP 图集不能包含动画')
    if (!['VP8X', 'VP8 ', 'VP8L', 'ALPH', ...metadata].includes(kind) || seen.has(kind)) fail('WebP chunk 未受支持或重复')
    seen.add(kind)
    if (kind === 'VP8X') {
      if (at !== 12 || length !== 10 || bytes[data + 1] || bytes[data + 2] || bytes[data + 3]) fail('WebP VP8X header 无效')
      flags = bytes[data]
      if (flags & 2) fail('WebP 图集不能包含动画')
      if (flags & 193) fail('WebP VP8X 保留标记无效')
      logical = checkDimensions(1 + uint24(data + 4), 1 + uint24(data + 7))
    } else if (kind === 'VP8L' || kind === 'VP8 ') {
      if (pixels) fail('WebP 必须只有一个 pixel chunk')
      if (kind === 'VP8L') {
        if (length < 5 || bytes[data] !== 47 || bytes[data + 4] >> 5 !== 0) fail('WebP VP8L header 无效')
        pixels = checkDimensions(1 + (bytes[data + 1] | (bytes[data + 2] & 63) << 8), 1 + ((bytes[data + 2] >> 6) | bytes[data + 3] << 2 | (bytes[data + 4] & 15) << 10))
      } else {
        if (length < 10 || bytes[data] & 1 || bytes[data + 3] !== 157 || bytes[data + 4] !== 1 || bytes[data + 5] !== 42) fail('WebP VP8 header 无效')
        pixels = checkDimensions(view.getUint16(data + 6, true) & 16383, view.getUint16(data + 8, true) & 16383)
      }
    } else if (metadata.has(kind)) {
      metadataBytes += length
      if (!length || length > 256 * 1024 || metadataBytes > 512 * 1024) fail('WebP 元数据过多或无效')
    } else if (!length || pixels) fail('WebP ALPH chunk 无效')
    at = data + length + (length & 1)
  }
  if (!pixels) fail('WebP 缺少 pixel chunk')
  if (logical && (logical.width !== pixels.width || logical.height !== pixels.height)) fail('WebP 逻辑尺寸与 pixel chunk 尺寸不匹配')
  if ((!logical && (seen.has('ALPH') || [...metadata].some(kind => seen.has(kind)))) || seen.has('ALPH') && (seen.has('VP8L') || !(flags & 16))) fail('WebP 扩展 chunk 缺少有效 VP8X header')
  if (logical && (Boolean(flags & 32) !== seen.has('ICCP') || Boolean(flags & 8) !== seen.has('EXIF') || Boolean(flags & 4) !== seen.has('XMP '))) fail('WebP 元数据标记不匹配')
  return pixels
}

/** Validates decoded atlases and all crops; called only after bounded header checks. */
export function validateRasterAtlases(raster, atlases) {
  if (!Array.isArray(atlases) || !atlases.length || atlases.length > DSHPV_RASTER_LIMITS.atlases) fail('缺少图集或图集数量过多')
  let total = 0
  for (const image of atlases) {
    const { width, height } = checkDimensions(image?.width, image?.height)
    total += width * height
    if (total > DSHPV_RASTER_LIMITS.totalPixels) fail('图集总像素数量过多')
  }
  for (const frame of raster.frames) for (const op of frame.ops) {
    const image = atlases[op.atlas]
    if (!image) fail('atlas 索引指向未提供的图集')
    const [x, y, w, h] = op.src
    if (x + w > image.width || y + h > image.height) fail('src 超出图集范围')
  }
  return { ...raster, atlases }
}

/** Uses the most recent frame at or before t, including deterministic backward seeks. */
export function rasterFrameAt(raster, t) {
  const frames = raster?.frames
  if (!frames?.length || !finite(t) || t < frames[0].t) return null
  let lo = 0, hi = frames.length - 1
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (frames[mid].t <= t) lo = mid; else hi = mid - 1 }
  return frames[lo]
}

/** Draws only the selected z layer. Order within the frame is retained. */
export function drawRasterLayer(ctx, raster, t, z) {
  const frame = rasterFrameAt(raster, t)
  if (!frame) return
  ctx.save()
  try {
    for (const op of frame.ops) if (op.z === z && op.alpha > 0) {
      ctx.globalAlpha = op.alpha
      ctx.drawImage(raster.atlases[op.atlas], ...op.src, ...op.dst)
    }
  } finally { ctx.restore() }
}
