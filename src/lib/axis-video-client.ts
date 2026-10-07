import {
  enhanceVideoPlayer,
  registerVideoPlayer,
  videoPlayerHtml,
  type VideoPlayerHandle,
  type VideoPlayerModel,
  type VideoPlayerOptions,
} from '@efeoncepro/axis-ui-primitives/video-player'

/** Only values cross SSR. Functions, AbortSignals and engines belong to client hooks. */
export type AxisVideoSerializableOptions = Pick<VideoPlayerOptions,
  'resumeTime' | 'doubleTapSeek' | 'preferences' | 'loading' | 'enableAnnotations'>
export interface AxisVideoConfigureDetail {
  model: VideoPlayerModel
  options: VideoPlayerOptions
  /** Tie consumer listeners/streaming work to this instance's lifetime. */
  signal: AbortSignal
}
export interface AxisVideoReadyDetail { player: VideoPlayerHandle; signal: AbortSignal }

export function serializeAxisVideoOptions(input: AxisVideoSerializableOptions = {}): AxisVideoSerializableOptions {
  const allowed = new Set(['resumeTime', 'doubleTapSeek', 'preferences', 'loading', 'enableAnnotations'])
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) throw new TypeError(`axis-video:client-only-option:${key}`)
  }
  if (input.resumeTime !== undefined && (!Number.isFinite(input.resumeTime) || input.resumeTime < 0)) throw new TypeError('axis-video:invalid-resume-time')
  for (const key of ['doubleTapSeek', 'enableAnnotations'] as const) {
    if (input[key] !== undefined && typeof input[key] !== 'boolean') throw new TypeError(`axis-video:invalid-option:${key}`)
  }
  if (input.loading !== undefined && !['eager', 'visible'].includes(input.loading)) throw new TypeError('axis-video:invalid-loading')
  if (input.preferences !== undefined) {
    if (!input.preferences || typeof input.preferences !== 'object') throw new TypeError('axis-video:invalid-preferences')
    const choices = { size: ['normal', 'large'], background: ['solid', 'clear'], position: ['bottom', 'top'] }
    for (const [key, value] of Object.entries(input.preferences)) {
      if (value !== undefined && (!(key in choices) || !choices[key as keyof typeof choices].includes(value))) throw new TypeError('axis-video:invalid-preferences')
    }
  }
  return JSON.parse(JSON.stringify(input)) as AxisVideoSerializableOptions
}

interface Instance {
  abort: AbortController
  player?: VideoPlayerHandle
  pending?: Promise<VideoPlayerHandle | null>
}
const instances = new Map<HTMLElement, Instance>()
let intersection: IntersectionObserver | undefined
let mutations: MutationObserver | undefined
let installed = false

export function getAxisVideoPlayer(host: HTMLElement): VideoPlayerHandle | undefined {
  return instances.get(host)?.player
}

function emit(host: HTMLElement, name: string, detail: unknown) {
  host.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }))
}

export function disposeAxisVideoPlayer(host: HTMLElement): void {
  intersection?.unobserve(host)
  const instance = instances.get(host)
  if (!instance) return
  instances.delete(host)
  instance.abort.abort()
  instance.player?.destroy()
  emit(host, 'axis-video:destroy', { player: instance.player })
}

/** Explicit mounting is useful when a consumer is ready before lazy intersection. */
export function mountAxisVideoPlayer(host: HTMLElement): Promise<VideoPlayerHandle | null> {
  const existing = instances.get(host)
  if (existing?.pending) return existing.pending
  if (existing?.player) return Promise.resolve(existing.player)
  if (!host.isConnected) return Promise.resolve(null)
  intersection?.unobserve(host)
  const instance = existing ?? { abort: new AbortController() }
  instances.set(host, instance)
  instance.pending = Promise.resolve().then(async () => {
    try {
      if (instance.abort.signal.aborted || !host.isConnected || instances.get(host) !== instance) {
        if (instances.get(host) === instance) disposeAxisVideoPlayer(host)
        return null
      }
      const data = host.querySelector<HTMLScriptElement>('[data-axis-config]')
      const root = host.querySelector<HTMLElement>('.axis-video')
      if (!data || !root) throw new Error('axis-video:missing-ssr')
      const config = JSON.parse(data.textContent ?? '') as { model: VideoPlayerModel; options?: AxisVideoSerializableOptions }
      const initialModel = JSON.stringify(config.model)
      const detail: AxisVideoConfigureDetail = {
        model: config.model, options: serializeAxisVideoOptions(config.options), signal: instance.abort.signal,
      }
      emit(host, 'axis-video:configure', detail)
      // Consumer cancellation joins (rather than replaces) adapter-owned teardown.
      const consumerSignal = detail.options.signal
      if (consumerSignal && consumerSignal !== instance.abort.signal && !instance.abort.signal.aborted) {
        const cancel = () => {
          if (instances.get(host) === instance) disposeAxisVideoPlayer(host)
        }
        if (consumerSignal.aborted) cancel()
        else {
          consumerSignal.addEventListener('abort', cancel, { once: true })
          instance.abort.signal.addEventListener('abort', () => consumerSignal.removeEventListener('abort', cancel), { once: true })
        }
      }
      if (instance.abort.signal.aborted || !host.isConnected) {
        if (instances.get(host) === instance) disposeAxisVideoPlayer(host)
        return null
      }
      // A synchronous hook may supply a different model; its SSR must match enhancement.
      let mountRoot = root
      if (JSON.stringify(detail.model) !== initialModel) {
        const template = document.createElement('template')
        template.innerHTML = videoPlayerHtml(detail.model)
        mountRoot = template.content.firstElementChild as HTMLElement
        root.replaceWith(mountRoot)
      }
      await registerVideoPlayer()
      if (instance.abort.signal.aborted || !host.isConnected || instances.get(host) !== instance) {
        if (instances.get(host) === instance) disposeAxisVideoPlayer(host)
        return null
      }
      const player = enhanceVideoPlayer(mountRoot, detail.model, { ...detail.options, signal: instance.abort.signal })
      instance.player = player
      emit(host, 'axis-video:ready', { player, signal: instance.abort.signal } satisfies AxisVideoReadyDetail)
      return instance.abort.signal.aborted ? null : player
    } catch {
      // SSR native controls stay available. Never expose source URLs or raw errors in events.
      if (!instance.abort.signal.aborted) {
        emit(host, 'axis-video:error', { code: 'enhancement-failed' })
        disposeAxisVideoPlayer(host)
      }
      return null
    }
  })
  return instance.pending
}

function hostsWithin(root: ParentNode): HTMLElement[] {
  const hosts = Array.from(root.querySelectorAll<HTMLElement>('[data-axis-player]'))
  if (root instanceof HTMLElement && root.matches('[data-axis-player]')) hosts.unshift(root)
  return hosts
}

/** Idempotent discovery; a host owns one handle and one pending registration at most. */
export function mountAxisVideoPlayers(root: ParentNode = document): void {
  for (const host of hostsWithin(root)) {
    if (!host.isConnected || instances.has(host)) continue
    const instance = { abort: new AbortController() }
    instances.set(host, instance)
    const eager = host.dataset.axisLoading === 'eager'
    if (eager || typeof IntersectionObserver === 'undefined') void mountAxisVideoPlayer(host)
    else {
      intersection ??= new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) void mountAxisVideoPlayer(entry.target as HTMLElement)
      }, { rootMargin: '200px' })
      intersection.observe(host)
    }
  }
}

export function disposeAxisVideoPlayers(root: ParentNode = document): void {
  for (const host of [...instances.keys()]) {
    if (root === document || root === host || root.contains(host)) disposeAxisVideoPlayer(host)
  }
}

/** Astro navigation and DOM removals share the same deterministic teardown. */
export function installAxisVideoPlayers(): void {
  if (installed) { mountAxisVideoPlayers(); return }
  installed = true
  const discover = () => mountAxisVideoPlayers()
  document.addEventListener('astro:page-load', discover)
  document.addEventListener('astro:before-swap', () => disposeAxisVideoPlayers())
  window.addEventListener('pagehide', () => disposeAxisVideoPlayers())
  window.addEventListener('pageshow', discover)
  mutations = new MutationObserver(records => {
    // Check connectivity after the mutation batch; moving a host does not destroy it.
    for (const host of [...instances.keys()]) if (!host.isConnected) disposeAxisVideoPlayer(host)
    for (const record of records) for (const added of record.addedNodes) {
      if (added instanceof HTMLElement) mountAxisVideoPlayers(added)
    }
  })
  mutations.observe(document.documentElement, { childList: true, subtree: true })
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', discover, { once: true })
  else discover()
}
