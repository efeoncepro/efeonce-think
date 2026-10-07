import assert from 'node:assert/strict'
import test from 'node:test'
import { getEventListeners } from 'node:events'
import {
  serializeAxisVideoOptions,
  mountAxisVideoPlayer,
  disposeAxisVideoPlayer,
  getAxisVideoPlayer,
  type AxisVideoConfigureDetail,
  type AxisVideoSerializableOptions,
} from '../src/lib/axis-video-client.ts'

// Only the host event/data boundary is simulated. Tests do not load a browser engine.
class Host extends EventTarget {
  isConnected = true
  config = JSON.stringify({model: {id: 'test-video', title: 'Test', src: '/test.mp4'}, options: {resumeTime: 3}})
  querySelector(selector: string) {
    if (selector === '[data-axis-config]') return {textContent: this.config}
    if (selector === '.axis-video') return {dataset: {}}
    return null
  }
}
const element = (host: Host) => host as unknown as HTMLElement

test('SSR allows only serializable player preferences, never callback or engine options', () => {
  const input = {resumeTime: 12, loading: 'visible' as const, preferences: {size: 'large' as const}, doubleTapSeek: true}
  const output = serializeAxisVideoOptions(input)
  assert.deepEqual(output, input)
  assert.notEqual(output.preferences, input.preferences)
  for (const value of [{onNext() {}}, {signal: new AbortController().signal}, {unknown: 1}]) {
    assert.throws(() => serializeAxisVideoOptions(value as AxisVideoSerializableOptions), /client-only-option/)
  }
  assert.throws(() => serializeAxisVideoOptions({resumeTime: Infinity}), /invalid-resume-time/)
  assert.throws(() => serializeAxisVideoOptions({preferences: {size: 'giant'} as never}), /invalid-preferences/)
})

test('duplicate mounts share one task and teardown before registration prevents hooks or enhancement', async () => {
  const host = new Host()
  let configured = 0
  host.addEventListener('axis-video:configure', () => configured++)
  const first = mountAxisVideoPlayer(element(host))
  assert.equal(mountAxisVideoPlayer(element(host)), first)
  disposeAxisVideoPlayer(element(host))
  assert.equal(await first, null)
  assert.equal(configured, 0)
  assert.equal(getAxisVideoPlayer(element(host)), undefined)
})

test('configure exposes mutable callbacks and lifetime signal; aborting the hook cancels registration', async () => {
  const host = new Host()
  let signal: AbortSignal | undefined
  let calls = 0
  host.addEventListener('axis-video:configure', event => {
    calls++
    const detail = (event as CustomEvent<AxisVideoConfigureDetail>).detail
    signal = detail.signal
    assert.equal(detail.options.resumeTime, 3)
    detail.options.onNext = () => {}
    // A consumer teardown during its hook must not register/enhance a removed owner.
    disposeAxisVideoPlayer(element(host))
  })
  assert.equal(await mountAxisVideoPlayer(element(host)), null)
  assert.equal(calls, 1)
  assert.equal(signal?.aborted, true)
})

test('disconnection while pending releases owner without firing configure', async () => {
  const host = new Host()
  let configured = false
  host.addEventListener('axis-video:configure', () => { configured = true })
  const pending = mountAxisVideoPlayer(element(host))
  host.isConnected = false
  assert.equal(await pending, null)
  assert.equal(configured, false)
  assert.equal(getAxisVideoPlayer(element(host)), undefined)
})

test('invalid serialized config preserves native SSR and emits only a stable error code', async () => {
  const host = new Host()
  host.config = 'invalid https://example.test/private-media'
  let error: unknown
  host.addEventListener('axis-video:error', event => { error = (event as CustomEvent).detail })
  assert.equal(await mountAxisVideoPlayer(element(host)), null)
  assert.deepEqual(error, {code: 'enhancement-failed'})
  assert.equal(getAxisVideoPlayer(element(host)), undefined)
})


test('a pre-aborted client signal cancels before enhancement and aborts the lifecycle signal', async () => {
  const host = new Host()
  const consumer = new AbortController()
  consumer.abort()
  let lifecycle: AbortSignal | undefined
  let errors = 0
  host.addEventListener('axis-video:error', () => errors++)
  host.addEventListener('axis-video:configure', event => {
    const detail = (event as CustomEvent<AxisVideoConfigureDetail>).detail
    lifecycle = detail.signal
    detail.options.signal = consumer.signal
  })
  assert.equal(await mountAxisVideoPlayer(element(host)), null)
  assert.equal(lifecycle?.aborted, true)
  assert.equal(errors, 0)
  assert.equal(getEventListeners(consumer.signal, 'abort').length, 0)
})

test('client abort while registration is pending disposes ownership and removes its listener', async () => {
  const host = new Host()
  const consumer = new AbortController()
  let lifecycle: AbortSignal | undefined
  let destroyed = 0
  let errors = 0
  host.addEventListener('axis-video:destroy', () => destroyed++)
  host.addEventListener('axis-video:error', () => errors++)
  host.addEventListener('axis-video:configure', event => {
    const detail = (event as CustomEvent<AxisVideoConfigureDetail>).detail
    lifecycle = detail.signal
    detail.options.signal = consumer.signal
    queueMicrotask(() => consumer.abort())
  })
  assert.equal(await mountAxisVideoPlayer(element(host)), null)
  assert.equal(lifecycle?.aborted, true)
  assert.equal(destroyed, 1)
  assert.equal(errors, 0)
  assert.equal(getAxisVideoPlayer(element(host)), undefined)
  assert.equal(getEventListeners(consumer.signal, 'abort').length, 0)
})
