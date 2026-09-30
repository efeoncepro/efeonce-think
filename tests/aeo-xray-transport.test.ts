import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isShareToken, readSharedXray, readSharedXrayAsset } from '../src/lib/aeo-xray/transport.ts'

const token = `xrg_${'a'.repeat(43)}`
const base = 'https://backend.example'

test('only opaque grants are sent upstream; dev fixture and legacy tokens fail closed', async () => {
  let calls = 0
  const fetcher = async () => { calls++; return new Response('{}') }
  for (const value of ['fixture-completo', 'abc123def456', '../admin', '', `xrg_${'a'.repeat(42)}`]) {
    assert.equal(isShareToken(value), false)
    assert.deepEqual(await readSharedXray(value, { base, fetcher }), { status: 'not_found' })
  }
  assert.equal(calls, 0)
})

test('each read revalidates the grant without cache or redirects', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), init })
    return Response.json({ modelVersion: '1.0' })
  }
  await readSharedXray(token, { base: `${base}/`, headers: { accept: 'application/json' }, fetcher })
  await readSharedXray(token, { base, fetcher })
  assert.equal(calls.length, 2)
  assert.equal(calls[0].url, `${base}/api/public/growth/aeo-xray/shared/${token}`)
  assert.equal(calls[0].init?.cache, 'no-store')
  assert.equal(calls[0].init?.redirect, 'error')
  assert.ok(calls[0].init?.signal)
})

test('transport preserves unavailable, revoked and rate-limited states without backend details', async () => {
  for (const [code, expected] of [[404, 'not_found'], [410, 'gone'], [429, 'rate_limited'], [503, 'error']] as const) {
    const fetcher = async () => new Response('private diagnostics', { status: code })
    assert.deepEqual(await readSharedXray(token, { base, fetcher }), { status: expected })
  }
  assert.deepEqual(await readSharedXray(token, { base, fetcher: async () => { throw new Error(token) } }), { status: 'error' })
})

test('a success HTML page or malformed JSON never reaches the renderer', async () => {
  for (const response of [new Response('<html>login</html>'), new Response('{bad', { headers: { 'content-type': 'application/json' } })]) {
    assert.deepEqual(await readSharedXray(token, { base, fetcher: async () => response }), { status: 'error' })
  }
})

test('asset reads share the grant and reject path traversal before networking', async () => {
  let target = ''
  const fetcher: typeof fetch = async (input) => { target = String(input); return new Response('image') }
  assert.equal(await readSharedXrayAsset(token, '../private', { base, fetcher }), null)
  assert.equal(target, '')
  await readSharedXrayAsset(token, 'hero-01', { base, fetcher })
  assert.equal(target, `${base}/api/public/growth/aeo-xray/shared/${token}/assets/hero-01`)
})
