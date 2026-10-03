// Real Cordis runtime: the Host plugin reads only injected services, registers
// its Typert descriptors and withdraws them on unload.
import test from 'node:test'
import assert from 'node:assert/strict'
import { Context } from '@deepseek-ai/cordis'
import { HOST_INJECT } from './helpers/strict-ctx.mjs'
import * as host from '../.dsh-plugin/index.mjs'
import { MV_HOST_TYPERT } from '../.dsh-plugin/shared/mv-remote.mjs'

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
  const fiber = root.plugin(host, { canvasFontSize: 16 })
  await fiber
  assert.equal(registered.length, 1)
  assert.equal(registered[0], MV_HOST_TYPERT)
  assert.equal(registered[0].package, '@ljwei-stak/dsh-mv-cli')
  await fiber.dispose()
  assert.equal(withdrawn, 1)
})

test('config: canvas font size is bounded', () => {
  assert.equal(host.Config({}).canvasFontSize, 14)
  assert.throws(() => host.Config({ canvasFontSize: 99 }))
})
