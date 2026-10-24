// Real Cordis runtime: the Host plugin reads only injected services, registers
// its Typert descriptors and withdraws them on unload.
import test from 'node:test'
import assert from 'node:assert/strict'
import { Context } from '@deepseek-ai/cordis'
import { HOST_INJECT } from './helpers/strict-ctx.mjs'
import * as host from '../.dsh-plugin/index.mjs'
import { MV_HOST_TYPERT, MV_REMOTE_NAMESPACE } from '../.dsh-plugin/shared/mv-remote.mjs'

test('cordis: inject list matches the strict test context', () => {
  assert.deepEqual(host.inject, [...HOST_INJECT])
  assert.equal(host.name, 'dsh-mv')
})

test('cordis: apply under a real Context registers and withdraws the remote', async () => {
  const root = new Context()
  const registered = []
  let withdrawn = 0
  const typert = { register(model) { registered.push(model); return () => { withdrawn++ } } }
  await root.plugin({ name: 'provider-typert', apply: ctx => { ctx.provide('typert', typert) } })
  assert.equal(root.get(MV_REMOTE_NAMESPACE), undefined)
  const fiber = root.plugin(host, { canvasFontSize: 16 })
  await fiber
  try {
    assert.equal(registered.length, 1)
    assert.equal(registered[0], MV_HOST_TYPERT)
    assert.equal(registered[0].package, '@ljwei-stak/dsh-mv-cli')
    const service = root.get(MV_REMOTE_NAMESPACE)
    assert.ok(service, 'the Remote namespace resolves to the live Cordis service')
    assert.equal(service.typertRemote.serviceKey, MV_REMOTE_NAMESPACE)
    assert.equal(service.typertRemote.namespace, MV_REMOTE_NAMESPACE)
    const result = await service.info()
    assert.equal(result.ok, true)
    assert.equal(result.value.canvasFontSize, 16)
    assert.equal(result.value.platform, process.platform)
  } finally {
    await fiber.dispose()
  }
  assert.equal(withdrawn, 1)
  assert.equal(root.get(MV_REMOTE_NAMESPACE), undefined, 'unloading removes the service as well as its descriptors')
})

test('config: canvas font size is bounded', () => {
  assert.equal(host.Config({}).canvasFontSize, 14)
  assert.throws(() => host.Config({ canvasFontSize: 99 }))
})
