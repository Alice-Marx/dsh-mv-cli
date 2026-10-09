import assert from 'node:assert/strict'
import test from 'node:test'
import { filterWorkshop, WORKSHOP_LIMITS } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { hasWorkshopMetrics, parseWorkshopCommunitySnapshot, selectWorkshopPacks, workshopMetricText } from '../.dsh-plugin/shared/mv-workshop-community.mjs'

const NOW = '2026-10-09T08:30:00.000Z'
const policy = () => ({ id: 'community-v1', description: 'A server-declared award policy, without a local threshold.' })
const snapshot = (packs = {}, overrides = {}) => ({
  status: 'ready', fetchedAt: NOW, viewer: { status: 'unsupported', name: null }, packs, policy: null, ...overrides,
})
const ids = packs => packs.map(pack => pack.id)
const catalogue = () => [
  { id: 'pack-alpha', title: 'Delta', artist: 'Artist A', author: 'Author A', description: 'Ocean study', tags: ['Ocean'], license: 'MIT', renderer: 'text', lyrics: false, timing: false, requires: '', updated: '2026-10-07' },
  { id: 'pack-beta', title: 'Alpha', artist: 'Artist B', author: 'Author B', description: 'Forest', tags: ['Forest'], license: 'CC-BY-4.0', renderer: 'webgl', lyrics: true, timing: true, requires: '0.10.0', updated: '2026-10-09T06:00:00Z' },
  { id: 'pack-gamma', title: 'Alpha', artist: 'Artist C', author: 'Author C', description: 'Ocean timestamps', tags: ['Ocean'], license: 'MIT', renderer: 'webgl', lyrics: false, timing: true, requires: '0.9.2', updated: '2026-10-08T00:00:00Z' },
  { id: 'pack-delta', title: 'Beta', artist: 'Artist D', author: 'Author D', description: 'Future scene', tags: ['Ocean'], license: 'MIT', renderer: 'script', lyrics: true, timing: false, requires: '2.0.0', updated: 'not-a-date' },
]

test('missing community measurements stay null while measured zero stays zero', () => {
  const parsed = parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': {}, 'pack-beta': { downloadCount: 0, uniqueDownloadUsers: 0, likeCount: 0, popularityScore: 0, likedByViewer: false } }))
  assert.deepEqual(parsed.packs['pack-alpha'], {
    downloadCount: null, uniqueDownloadUsers: null, likeCount: null, popularityScore: null, likedByViewer: null, acclaimed: null,
  })
  assert.equal(parsed.packs['pack-beta'].downloadCount, 0)
  assert.equal(parsed.packs['pack-beta'].uniqueDownloadUsers, 0)
  assert.equal(parsed.packs['pack-beta'].likeCount, 0)
  assert.equal(parsed.packs['pack-beta'].popularityScore, 0)
  assert.equal(parsed.packs['pack-beta'].likedByViewer, false)
  assert.equal(hasWorkshopMetrics(parsed), true)
  assert.equal(hasWorkshopMetrics(snapshot({ 'pack-alpha': {} })), false)
  assert.equal(hasWorkshopMetrics(snapshot()), false)
})

test('counter formatting never invents zero or evaluates nonnumeric content', () => {
  assert.equal(workshopMetricText(0), '0')
  assert.equal(workshopMetricText(-0), '0')
  assert.equal(workshopMetricText(12345), '12345')
  assert.equal(workshopMetricText(Number.MAX_SAFE_INTEGER), String(Number.MAX_SAFE_INTEGER))
  for (const value of [null, undefined, '', '0', '<img src=x onerror=alert(1)>', NaN, Infinity, -Infinity, -1, 0.5, Number.MAX_SAFE_INTEGER + 1, true, {}, []]) {
    assert.equal(workshopMetricText(value), '—')
  }
})

test('known unique installers cannot exceed accepted installation completions', () => {
  assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': { downloadCount: 1, uniqueDownloadUsers: 2 } })), /exceeds downloadCount/)
  assert.equal(parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': { downloadCount: null, uniqueDownloadUsers: 2 } })).packs['pack-alpha'].downloadCount, null)
  assert.equal(parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': { downloadCount: 2, uniqueDownloadUsers: 2 } })).packs['pack-alpha'].uniqueDownloadUsers, 2)
})

test('all counters require nonnegative safe integers, without string coercion', () => {
  for (const key of ['downloadCount', 'uniqueDownloadUsers', 'likeCount']) {
    for (const value of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity, -Infinity, true, '0', {}, []]) {
      assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': { [key]: value } })), TypeError)
    }
    assert.equal(parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': { [key]: Number.MAX_SAFE_INTEGER } })).packs['pack-alpha'][key], Number.MAX_SAFE_INTEGER)
    assert.equal(parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': { [key]: null } })).packs['pack-alpha'][key], null)
  }
})

test('popularity accepts finite nonnegative scores and refuses bad numeric values', () => {
  for (const value of [0, 0.125, 100000, Number.MAX_VALUE]) {
    assert.equal(parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': { popularityScore: value } })).packs['pack-alpha'].popularityScore, value)
  }
  for (const value of [-1, NaN, Infinity, -Infinity, '1', true, {}, []]) {
    assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': { popularityScore: value } })), TypeError)
  }
})

test('viewer projection admits no credentials and never treats signed-out data as a like', () => {
  for (const status of ['unsupported', 'signed-out']) {
    assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': { likedByViewer: true } }, { viewer: { status, name: null } })), /likedByViewer/)
    assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({}, { viewer: { status, name: 'Old account' } })), /viewer name/)
  }
  const parsed = parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': { likedByViewer: true } }, { viewer: { status: 'authenticated', name: 'Community display name' } }))
  assert.equal(parsed.packs['pack-alpha'].likedByViewer, true)
  assert.equal(parsed.viewer.name, 'Community display name')
  for (const value of [0, 1, 'true', {}, []]) assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': { likedByViewer: value } })), TypeError)
  for (const status of ['logged-in', '', null]) assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({}, { viewer: { status, name: null } })), TypeError)
})

test('strict ISO timestamps reject invalid calendars, missing timezones and HTML', () => {
  assert.equal(parseWorkshopCommunitySnapshot(snapshot({}, { fetchedAt: '2026-10-09T16:30:00+08:00' })).fetchedAt, NOW)
  assert.equal(parseWorkshopCommunitySnapshot(snapshot({}, { fetchedAt: '2024-02-29T01:02:03.12Z' })).fetchedAt, '2024-02-29T01:02:03.120Z')
  for (const fetchedAt of [null, undefined, '', '2026-10-09', '2026-10-09T08:30:00', '2026-02-29T00:00:00Z', '2026-02-30T00:00:00Z', '2026-04-31T00:00:00Z', '2026-13-01T00:00:00Z', '2026-00-01T00:00:00Z', '2026-01-00T00:00:00Z', '2026-01-01T24:00:00Z', '2026-01-01T00:60:00Z', '2026-01-01T00:00:60Z', '2026-01-01T00:00:00.1234Z', '2026-01-01T00:00:00+24:00', '<time>2026-10-09</time>', 0]) {
    for (const status of ['ready', 'stale']) assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({}, { status, fetchedAt })), TypeError)
  }
  for (const status of ['offline', 'unavailable']) assert.equal(parseWorkshopCommunitySnapshot(snapshot({}, { status, fetchedAt: null })).fetchedAt, null)
})

test('awards require a declared matching server policy; counts alone never create a trophy', () => {
  const award = { awardedAt: NOW, criterion: 'community-v1' }
  assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': { acclaimed: award } })), /award policy/)
  assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': { acclaimed: { ...award, criterion: 'different-policy' } } }, { policy: policy() })), /award policy/)
  assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': { acclaimed: { ...award, awardedAt: '2026-02-30T00:00:00Z' } } }, { policy: policy() })), /awardedAt/)
  const community = parseWorkshopCommunitySnapshot(snapshot({
    'pack-alpha': { acclaimed: award }, 'pack-beta': { downloadCount: Number.MAX_SAFE_INTEGER, likeCount: Number.MAX_SAFE_INTEGER },
  }, { policy: policy() }))
  assert.deepEqual(ids(selectWorkshopPacks(catalogue(), { onlyAcclaimed: true }, community)), ['pack-alpha'])
  assert.equal(community.packs['pack-beta'].acclaimed, null)
  assert.equal(hasWorkshopMetrics(snapshot({ 'pack-alpha': { acclaimed: award } }, { policy: policy() })), false)
})

test('closed records reject secret/privacy fields at every level', () => {
  const award = { awardedAt: NOW, criterion: 'community-v1' }
  for (const key of ['token', 'session', 'userId', 'email', 'contact', 'authorization', 'profile', 'localAccount']) {
    for (const value of [
      snapshot({}, { [key]: 'private-value' }),
      snapshot({}, { viewer: { status: 'authenticated', name: null, [key]: 'private-value' } }),
      snapshot({ 'pack-alpha': { [key]: 'private-value' } }),
      snapshot({}, { policy: { ...policy(), [key]: 'private-value' } }),
      snapshot({ 'pack-alpha': { acclaimed: { ...award, [key]: 'private-value' } } }, { policy: policy() }),
    ]) assert.throws(() => parseWorkshopCommunitySnapshot(value), TypeError)
  }
  assert.throws(() => parseWorkshopCommunitySnapshot(JSON.parse('{"status":"offline","viewer":{"status":"unsupported","name":null},"packs":{},"__proto__":{"polluted":true}}')), TypeError)
  assert.equal({}.polluted, undefined)
})

test('bounded JSON records reject arrays, exotic prototypes, getters and oversized text/maps', () => {
  for (const value of [null, [], 'ready', new Date(), Object.create({ status: 'ready' })]) assert.throws(() => parseWorkshopCommunitySnapshot(value), TypeError)
  for (const key of ['viewer', 'packs', 'policy']) assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({}, { [key]: [] })), TypeError)
  for (const id of ['a', 'ab', '-bad-id', 'bad-id-', 'UPPER-ID', '../pack', '__proto__', 'a'.repeat(65)]) {
    assert.throws(() => parseWorkshopCommunitySnapshot(snapshot(Object.fromEntries([[id, {}]]))), /pack id/)
  }
  assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': [] })), TypeError)
  assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({}, { viewer: { status: 'authenticated', name: 'x'.repeat(121) } })), TypeError)
  assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({}, { viewer: { status: 'authenticated', name: 'a\0b' } })), TypeError)
  assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({}, { policy: { ...policy(), description: 'x'.repeat(2001) } })), TypeError)
  assert.throws(() => parseWorkshopCommunitySnapshot(snapshot({}, { policy: { ...policy(), id: 'x'.repeat(81) } })), TypeError)
  const packs = Object.fromEntries(Array.from({ length: WORKSHOP_LIMITS.maxPacks + 1 }, (_, index) => [`pack-${index}`, {}]))
  assert.throws(() => parseWorkshopCommunitySnapshot(snapshot(packs)), /pack count/)
  let getterRead = false
  const getterSnapshot = snapshot()
  Object.defineProperty(getterSnapshot, 'token', { enumerable: true, get() { getterRead = true; return 'secret' } })
  assert.throws(() => parseWorkshopCommunitySnapshot(getterSnapshot), TypeError)
  assert.equal(getterRead, false)
  const symbolic = snapshot()
  symbolic[Symbol('secret')] = 'private-value'
  assert.throws(() => parseWorkshopCommunitySnapshot(symbolic), TypeError)
})

test('parser returns fresh records and constructor pack ids cannot read inherited metrics', () => {
  const input = snapshot({ constructor: { downloadCount: 2 }, 'pack-alpha': { downloadCount: 0 } })
  const parsed = parseWorkshopCommunitySnapshot(input)
  parsed.packs.constructor.downloadCount = 7
  assert.equal(input.packs.constructor.downloadCount, 2)
  assert.notEqual(parsed.viewer, input.viewer)
  assert.notEqual(parsed.packs, input.packs)
  assert.deepEqual(ids(selectWorkshopPacks([{ ...catalogue()[0], id: 'constructor' }, catalogue()[0]], { sort: 'downloads' }, snapshot({ 'pack-alpha': { downloadCount: 0 } }))), ['pack-alpha', 'constructor'])
})

test('inherited metric getters never run or turn a missing measurement into data', () => {
  const previous = Object.getOwnPropertyDescriptor(Object.prototype, 'downloadCount')
  let getterRead = false
  Object.defineProperty(Object.prototype, 'downloadCount', { configurable: true, get() { getterRead = true; return 500 } })
  try {
    const parsed = parseWorkshopCommunitySnapshot(snapshot({ 'pack-alpha': {} }))
    assert.equal(parsed.packs['pack-alpha'].downloadCount, null)
    assert.equal(hasWorkshopMetrics(parsed), false)
    assert.equal(getterRead, false)
  } finally {
    if (previous === undefined) delete Object.prototype.downloadCount
    else Object.defineProperty(Object.prototype, 'downloadCount', previous)
  }
})

test('availability requires valid ready/stale data and counts real zero as available', () => {
  for (const status of ['ready', 'stale']) {
    for (const key of ['downloadCount', 'uniqueDownloadUsers', 'likeCount', 'popularityScore']) assert.equal(hasWorkshopMetrics(snapshot({ 'pack-alpha': { [key]: 0 } }, { status })), true)
  }
  for (const status of ['unavailable', 'offline']) assert.equal(hasWorkshopMetrics(snapshot({ 'pack-alpha': { downloadCount: 50 } }, { status })), false)
  for (const value of [null, {}, [], snapshot({ 'pack-alpha': { downloadCount: -1 } }), snapshot({ 'pack-alpha': { downloadCount: 1 } }, { token: 'private-value' })]) assert.equal(hasWorkshopMetrics(value), false)
})

test('new selector preserves original catalogue query/license/renderer filtering', () => {
  const packs = catalogue()
  for (const options of [{}, { query: 'o c e a n' }, { query: 'author B' }, { license: 'mit' }, { renderer: 'webgl' }, { query: 'ocean', renderer: 'webgl', license: 'MIT' }]) {
    assert.deepEqual(selectWorkshopPacks(packs, options), filterWorkshop(packs, options))
  }
  assert.deepEqual(ids(selectWorkshopPacks(packs, { tag: ' OCEAN ' })), ['pack-alpha', 'pack-gamma', 'pack-delta'])
  assert.deepEqual(ids(selectWorkshopPacks(packs, { tag: 'oce' })), [])
})

test('installation, update, lyric, tag and compatibility filters compose', () => {
  const packs = catalogue(), installed = { 'pack-alpha': {}, 'pack-beta': {}, 'pack-gamma': {} }, updates = new Set(['pack-beta', 'pack-gamma', 'pack-delta'])
  assert.deepEqual(ids(selectWorkshopPacks(packs, { installed, installation: 'installed' })), ['pack-alpha', 'pack-beta', 'pack-gamma'])
  assert.deepEqual(ids(selectWorkshopPacks(packs, { installed, updates, installation: 'updates' })), ['pack-beta', 'pack-gamma'])
  assert.deepEqual(ids(selectWorkshopPacks(packs, { installed, updates, installation: 'updates', renderer: 'webgl', tag: 'Ocean', lyrics: 'timing', compatibleOnly: true, clientVersion: '0.9.2' })), ['pack-gamma'])
  assert.deepEqual(ids(selectWorkshopPacks(packs, { lyrics: 'included' })), ['pack-beta', 'pack-delta'])
  assert.deepEqual(ids(selectWorkshopPacks(packs, { lyrics: 'timing' })), ['pack-gamma'])
  assert.deepEqual(ids(selectWorkshopPacks(packs, { lyrics: 'none' })), ['pack-alpha'])
  assert.deepEqual(ids(selectWorkshopPacks(packs, { compatibleOnly: true, clientVersion: '0.10.0' })), ['pack-alpha', 'pack-beta', 'pack-gamma'])
  assert.deepEqual(ids(selectWorkshopPacks(packs, { compatibleOnly: true })), ['pack-alpha'])
  assert.deepEqual(ids(selectWorkshopPacks(packs, { installed: new Set(['pack-beta']), installation: 'installed' })), ['pack-beta'])
  const inherited = Object.create({ 'pack-alpha': {} })
  assert.throws(() => selectWorkshopPacks(packs, { installed: inherited, installation: 'installed' }), TypeError)
})

test('metric sorts descend with missing last, real zero above unknown, and stable ties', () => {
  const packs = catalogue()
  for (const [sort, key] of [['downloads', 'downloadCount'], ['likes', 'likeCount'], ['popular', 'popularityScore']]) {
    const community = snapshot({ 'pack-alpha': { [key]: null }, 'pack-beta': { [key]: 0 }, 'pack-gamma': { [key]: 10 }, 'pack-delta': { [key]: 10 } })
    assert.deepEqual(ids(selectWorkshopPacks(packs, { sort }, community)), ['pack-gamma', 'pack-delta', 'pack-beta', 'pack-alpha'])
    assert.deepEqual(ids(selectWorkshopPacks(packs, { sort, tag: 'Ocean', license: 'MIT' }, community)), ['pack-gamma', 'pack-delta', 'pack-alpha'])
    assert.deepEqual(ids(selectWorkshopPacks(packs, { sort }, snapshot())), ids(packs))
  }
  assert.deepEqual(ids(selectWorkshopPacks(packs, { sort: 'popular' }, snapshot({ 'pack-alpha': { popularityScore: 0.3 }, 'pack-beta': { popularityScore: 0.25 } }))), ['pack-alpha', 'pack-beta', 'pack-gamma', 'pack-delta'])
})

test('title and update sorting preserve ties and place invalid dates last', () => {
  const packs = catalogue()
  assert.deepEqual(ids(selectWorkshopPacks(packs, { sort: 'title' })), ['pack-beta', 'pack-gamma', 'pack-delta', 'pack-alpha'])
  assert.deepEqual(ids(selectWorkshopPacks(packs, { sort: 'updated' })), ['pack-beta', 'pack-gamma', 'pack-alpha', 'pack-delta'])
  const equalDates = packs.map(pack => ({ ...pack, updated: '2026-10-09' }))
  assert.deepEqual(ids(selectWorkshopPacks(equalDates, { sort: 'updated' })), ids(packs))
  const invalidDates = packs.map(pack => ({ ...pack, updated: '2026-02-30' }))
  assert.deepEqual(ids(selectWorkshopPacks(invalidDates, { sort: 'updated' })), ids(packs))
})

test('offline/unknown snapshots preserve ordinary filtering and cannot manufacture awards', () => {
  const packs = catalogue()
  const row = { downloadCount: 100, acclaimed: { awardedAt: NOW, criterion: 'community-v1' } }
  const unavailable = [null, {}, snapshot({ 'pack-delta': row }, { status: 'offline', policy: policy() }), snapshot({ 'pack-delta': row }, { status: 'unavailable', policy: policy() }), snapshot({ 'pack-delta': row }, { policy: policy(), token: 'secret' })]
  for (const community of unavailable) {
    assert.deepEqual(ids(selectWorkshopPacks(packs, { query: 'ocean', sort: 'downloads' }, community)), ['pack-alpha', 'pack-gamma', 'pack-delta'])
    assert.deepEqual(selectWorkshopPacks(packs, { onlyAcclaimed: true }, community), [])
  }
  assert.deepEqual(ids(selectWorkshopPacks(packs, { onlyAcclaimed: true }, snapshot({ 'pack-delta': row }, { status: 'stale', policy: policy() }))), ['pack-delta'])
})

test('selection never mutates packs, snapshots, local installs or update membership', () => {
  const packs = catalogue().map(Object.freeze), before = ids(packs), installed = Object.freeze({ 'pack-alpha': true, 'pack-gamma': true }), updates = new Set(['pack-gamma'])
  const community = snapshot({ 'pack-alpha': { downloadCount: 0 }, 'pack-gamma': { downloadCount: 20 } })
  const original = structuredClone(community)
  Object.freeze(packs)
  assert.deepEqual(ids(selectWorkshopPacks(packs, { sort: 'downloads', installed, installation: 'installed', updates }, community)), ['pack-gamma', 'pack-alpha'])
  assert.deepEqual(ids(packs), before)
  assert.deepEqual(community, original)
  assert.deepEqual([...updates], ['pack-gamma'])
})

test('invalid selector options fail explicitly instead of widening a requested filter', () => {
  for (const options of [{ token: 'private-value' }, { query: 2 }, { query: 'x'.repeat(501) }, { installation: 'all' }, { lyrics: 'yes' }, { sort: 'unknown' }, { onlyAcclaimed: 'true' }, { compatibleOnly: 1 }, { updates: [] }, { installed: [] }]) {
    assert.throws(() => selectWorkshopPacks(catalogue(), options), TypeError)
  }
  assert.throws(() => selectWorkshopPacks(new Array(WORKSHOP_LIMITS.maxPacks + 1)), TypeError)
})
