// SPDX-License-Identifier: AGPL-3.0-or-later
// Cooperative CPU preparation adapter, copyright 2026 Alice-Marx.
// Source is parsed and copied, never executed by this transformation.
import assert from 'node:assert/strict'
import { parse } from 'acorn'

export const CAT_PREPARE_CHUNK = 4096
const paths = new Set(['src/ch/v2/cat.js', 'src/ch/v2/bake.js', 'src/ch/06_v2.js'])
const program = text => parse(text, { ecmaVersion: 'latest', sourceType: 'module' })
const declarations = ast => ast.body.map(node => node.type === 'ExportNamedDeclaration' ? node.declaration : node).filter(Boolean)
const namedFunction = (ast, name) => declarations(ast).find(node => node.type === 'FunctionDeclaration' && node.id?.name === name)
const seam = (condition, description) => assert.ok(condition, `FrostNova CPU preparation seam changed: ${description}`)

function applyEdits(text, edits) {
  for (const edit of edits.sort((a, b) => b.start - a.start)) text = text.slice(0, edit.start) + edit.replacement + text.slice(edit.end)
  return text
}
function walk(node, visit) {
  if (!node || typeof node !== 'object') return
  if (typeof node.type === 'string') visit(node)
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(child => walk(child, visit))
    else if (value && typeof value === 'object') walk(value, visit)
  }
}
function particleLoop(fn, name) {
  const candidates = fn.body.body.filter(node => node.type === 'ForStatement' && node.init?.type === 'VariableDeclaration'
    && node.init.declarations.length === 1 && node.init.declarations[0].id.name === 'i'
    && node.test?.type === 'BinaryExpression' && node.test.operator === '<' && node.test.left?.name === 'i' && node.test.right?.name === 'N')
  seam(candidates.length === 1, `${name} outer i < N loop`)
  seam(candidates[0].body.type === 'BlockStatement', `${name} outer loop block`)
  return candidates[0]
}
function addStages(text, ast, name, stages, { accepted = false, label }) {
  if (namedFunction(ast, stages)) return text
  const fn = namedFunction(ast, name)
  seam(fn && !fn.async && !fn.generator, `${name} synchronous function`)
  const loop = particleLoop(fn, name)
  if (accepted) {
    seam(loop.update === null, `${name} acceptance-only increment`)
    const final = loop.body.body.at(-1)
    seam(final?.type === 'ExpressionStatement' && final.expression.type === 'CallExpression'
      && final.expression.callee.name === 'coat' && final.expression.arguments[1]?.type === 'UpdateExpression'
      && final.expression.arguments[1].operator === '++' && !final.expression.arguments[1].prefix
      && final.expression.arguments[1].argument.name === 'i', `${name} final coat(S, i++, ...)`)
  } else {
    seam(loop.update?.type === 'UpdateExpression' && loop.update.operator === '++' && loop.update.argument.name === 'i', `${name} loop increment`)
  }
  // Cat rejection/continue paths never reach this insertion. Its postfix i++ in
  // coat's arguments and every RNG call still run at precisely their original position.
  const count = accepted ? 'i' : '(i + 1)'
  const original = text.slice(fn.start, fn.end)
  const position = loop.body.end - 1 - fn.start
  const yieldCode = `\n\t\tif (${count} % ${CAT_PREPARE_CHUNK} === 0) yield { progress: ${count} / N, label: ${JSON.stringify(label)} };\n\t`
  let clone = original.slice(0, position) + yieldCode + original.slice(position)
  clone = 'function* ' + stages + clone.slice(fn.id.end - fn.start)
  return `${text}\n\n// Same algorithm, arrays and random stream; only accepted-point work is cooperatively staged.\n${clone}\nexport { ${stages} };\n`
}
function stageImport(ast, sourceSuffix, importedName, stageName) {
  const candidates = ast.body.filter(node => node.type === 'ImportDeclaration' && node.source.value.split('?')[0].endsWith(sourceSuffix))
  seam(candidates.length === 1, `one ${sourceSuffix} import`)
  const declaration = candidates[0]
  seam(declaration.specifiers.some(node => node.type === 'ImportSpecifier' && node.imported.name === importedName && node.local.name === importedName), `${importedName} named import`)
  const final = declaration.specifiers.at(-1)
  seam(final?.type === 'ImportSpecifier', `${sourceSuffix} named import tail`)
  return { start: final.end, end: final.end, replacement: `, ${stageName}` }
}
function adaptChapter(text, ast) {
  if (namedFunction(ast, 'prepareCat')) return text
  const make = namedFunction(ast, 'makeCat')
  seam(make, 'makeCat()')
  const edits = [stageImport(ast, '/v2/cat.js', 'catShape', 'catShapeStages'), stageImport(ast, '/v2/bake.js', 'bakeLight', 'bakeLightStages')]
  const calls = { catShape: [], bakeLight: [] }
  walk(make.body, node => { if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && calls[node.callee.name]) calls[node.callee.name].push(node) })
  for (const [name, cache] of [['catShape', '__preparedCatShape'], ['bakeLight', '__preparedCatLight']]) {
    seam(calls[name].length === 1, `makeCat one ${name} call`)
    const node = calls[name][0]
    edits.push({ start: node.start, end: node.end, replacement: `(${cache} ?? ${text.slice(node.start, node.end)})` })
  }
  // The two delegates return their original typed arrays. Progress maps to two
  // monotone halves; yielding does not consume RNG or change any sample order.
  return applyEdits(text, edits) + `

let __preparedCatShape = null, __preparedCatLight = null;
function* __catStageProgress(iterator, start, span) {
  for (;;) {
    const step = iterator.next();
    if (step.done) return step.value;
    yield { progress: start + span * step.value.progress, label: step.value.label };
  }
}
export function* prepareCat() {
  if (__preparedCatShape === null) __preparedCatShape = yield* __catStageProgress(catShapeStages(CAT_N), 0, .5);
  if (__preparedCatLight === null) __preparedCatLight = yield* __catStageProgress(bakeLightStages(__preparedCatShape, CAT_N, catSDF, norm3(CAT_LIGHT)), .5, .5);
}
`
}

/** Add faithful chunked cat CPU preparation to the three pinned modules only. */
export function transformCpuModule(text, path) {
  const normalized = String(path).replace(/\\/g, '/').split('?')[0]
  if (!paths.has(normalized)) return text
  const ast = program(text)
  if (normalized === 'src/ch/v2/cat.js') return addStages(text, ast, 'catShape', 'catShapeStages', { accepted: true, label: 'cat surface' })
  if (normalized === 'src/ch/v2/bake.js') return addStages(text, ast, 'bakeLight', 'bakeLightStages', { label: 'cat light' })
  return adaptChapter(text, ast)
}
