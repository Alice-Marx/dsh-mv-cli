import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyWorkshopCommunity, installWorkshopPack, loadWorkshopCommunity, publicWorkshopCommunity } from '../.dsh-plugin/client/mv-workshop-state.mjs'

const ok = value => ({ ok: true, value: { ok: true, value } })
const fixture = () => ({
  status: 'ready', fetchedAt: '2026-10-09T09:00:00Z',
  viewer: { status: 'authenticated', name: 'SYNTHETIC — not an actual account' },
  packs: { 'synthetic-mv': { downloadCount: 2, uniqueDownloadUsers: 1, likeCount: 0, likedByViewer: true } },
  policy: null,
})

test('old Hosts and absent community APIs remain unavailable rather than inventing statistics', async () => {
  for (const api of [undefined, null, {}, { workshopCommunity: true }]) {
    const result = await loadWorkshopCommunity(api)
    assert.deepEqual(result, emptyWorkshopCommunity())
    assert.deepEqual(result.packs, {})
    assert.equal(result.viewer.status, 'unsupported')
    assert.equal(result.fetchedAt, null)
  }
})

test('optional community read sends no account or credential and strips personal state', async () => {
  const original = fixture(), calls = []
  const result = await loadWorkshopCommunity({ workshopCommunity: async request => { calls.push(request); return ok(original) } })
  assert.deepEqual(calls, [{}])
  assert.deepEqual(result.viewer, { status: 'unsupported', name: null })
  assert.equal(result.packs['synthetic-mv'].likedByViewer, null)
  assert.equal(result.packs['synthetic-mv'].likeCount, 0)
  assert.equal(result.packs['synthetic-mv'].downloadCount, 2)
  assert.equal(result.packs['synthetic-mv'].uniqueDownloadUsers, 1)
  assert.equal(original.viewer.name, 'SYNTHETIC — not an actual account')
  assert.equal(original.packs['synthetic-mv'].likedByViewer, true)
})

test('public cache retains only public measurements and never authenticates a viewer', async () => {
  const result = await loadWorkshopCommunity({ workshopCommunity: async () => ok(fixture()) })
  const cached = publicWorkshopCommunity({ ...result, status: 'stale' })
  assert.equal(cached.status, 'stale')
  assert.deepEqual(cached.viewer, { status: 'unsupported', name: null })
  assert.equal(cached.packs['synthetic-mv'].likedByViewer, null)
  assert.notEqual(cached.packs['synthetic-mv'], result.packs['synthetic-mv'])
})

test('malformed or privacy-bearing community results reject without displaying them', async () => {
  for (const mutate of [
    value => ({ ...value, token: 'SYNTHETIC forbidden field, not a real secret' }),
    value => ({ ...value, viewer: { ...value.viewer, id: 'SYNTHETIC forbidden ID' } }),
    value => ({ ...value, packs: { 'synthetic-mv': { downloadCount: '2' } } }),
    value => ({ ...value, packs: { 'synthetic-mv': { likeCount: -1 } } }),
  ]) {
    await assert.rejects(loadWorkshopCommunity({ workshopCommunity: async () => ok(mutate(fixture())) }), TypeError)
  }
})

test('community read failure cannot prevent independently invoked pack installation', async () => {
  const requests = [], api = {
    workshopCommunity: async () => { throw new Error('SYNTHETIC community offline') },
    workshopInstall: async request => { requests.push(request); return ok({ id: request.id, files: 2, version: '1.0.0', manifestPath: 'SYNTHETIC fixture path' }) },
  }
  await assert.rejects(loadWorkshopCommunity(api), /community offline/)
  const installed = await installWorkshopPack(api, 'synthetic-mv')
  assert.deepEqual(requests, [{ id: 'synthetic-mv' }])
  assert.equal(installed.id, 'synthetic-mv')
  assert.equal(installed.files, 2)
})

test('failed gateway/service envelopes are not parsed as ready community snapshots', async () => {
  for (const response of [
    { ok: false, error: { message: 'SYNTHETIC gateway failure' } },
    { ok: true, value: { ok: false, error: { message: 'SYNTHETIC service failure' } } },
  ]) await assert.rejects(loadWorkshopCommunity({ workshopCommunity: async () => response }), /SYNTHETIC/)
})
