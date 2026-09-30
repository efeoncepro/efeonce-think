import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolveAeoXrayIntent } from '../src/lib/axis/aeo-xray/aeo-xray.js'
import { acceptSharedXray } from '../src/lib/aeo-xray/accept.ts'

const intent = JSON.parse(readFileSync(new URL('../src/lib/aeo-xray/fixture-minimal.json', import.meta.url), 'utf8'))
function edition() {
  const model = resolveAeoXrayIntent(intent)
  assert.equal(model.status, 'resolved')
  return { modelVersion: '1.0', header: { title: intent.title, preparedFor: intent.preparedFor, editionId: 'test-edition' }, model: structuredClone(model), expiresAt: '2099-01-01T00:00:00Z' }
}

test('the declared frozen composition is accepted without replacement', () => {
  const input = edition()
  const accepted = acceptSharedXray(input)
  assert.equal(accepted.status, 'ok')
  if (accepted.status === 'ok') assert.equal(accepted.edition, input)
})

test('unsupported versions and absent envelope metadata fail closed', () => {
  for (const override of [{ modelVersion: '2.0' }, { header: {} }, { expiresAt: 'never' }, { model: {} }]) {
    assert.deepEqual(acceptSharedXray({ ...edition(), ...override }), { status: 'error' })
  }
})

test('annotation references and CSS-bearing token mutations are rejected at the rendering boundary', () => {
  const broken = edition() as any
  broken.model.artifacts[0].annotations[0].blockId = 'not-a-block'
  assert.deepEqual(acceptSharedXray(broken), { status: 'error' })
  const css = edition() as any
  css.model.tokens.shell.ground = 'red;background:url(https://attacker.example)'
  assert.deepEqual(acceptSharedXray(css), { status: 'error' })
})

test('header cannot label a frozen model as a different client', () => {
  const input = edition()
  input.header.preparedFor = 'Different client'
  assert.deepEqual(acceptSharedXray(input), { status: 'error' })
})
