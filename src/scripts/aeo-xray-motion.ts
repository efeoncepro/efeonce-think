import type { TransitionBeforePreparationEvent, TransitionBeforeSwapEvent } from 'astro:transitions/client'

// The shared URL keeps its pathname; the step is in the query string. Read the
// actual destination instead of treating all of those links as the same screen.
const steps = ['', 'articulo', 'radiografia', 'atomizacion']
const stage = (url: URL) => url.searchParams.get('step') ?? (url.pathname.startsWith('/muestras/') ? url.pathname.split('/').at(-1) ?? '' : '')
const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
let initializedRoot: HTMLElement | null = null

function initializeMotion() {
  const root = document.querySelector<HTMLElement>('[data-testid="xray-root"]')
  if (!root || root === initializedRoot) return
  initializedRoot = root
  document.documentElement.dataset.xrayMotion = 'on'
  root.dataset.motion = motion.matches ? 'reduced' : 'ready'
  if (motion.matches) return

  // The distribution is the one-to-many reveal: the source arrives first, then
  // its three deliverables. This animation never hides content before JS runs.
  const cards = root.querySelectorAll<HTMLElement>('.at-lineage, .atom')
  cards.forEach((card, index) => {
    card.animate(
      [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 560, delay: index * 90, easing: 'cubic-bezier(.2,.65,.2,1)', fill: 'backwards' },
    )
  })
}

function prepareMotion(event: TransitionBeforePreparationEvent) {
  if (!document.querySelector('[data-testid="xray-root"]')) return
  const from = steps.indexOf(stage(event.from))
  const to = steps.indexOf(stage(event.to))
  const changingArtifact = event.from.searchParams.get('artifact') !== event.to.searchParams.get('artifact')
  document.documentElement.dataset.xrayDirection = changingArtifact ? 'artifact' : to < from ? 'back' : 'forward'
}

function transferMotion(event: TransitionBeforeSwapEvent) {
  if (!event.newDocument.querySelector('[data-testid="xray-root"]')) return
  event.newDocument.documentElement.dataset.xrayMotion = 'on'
  event.newDocument.documentElement.dataset.xrayDirection = document.documentElement.dataset.xrayDirection ?? 'forward'
}

initializeMotion()
document.addEventListener('astro:page-load', initializeMotion)
document.addEventListener('astro:before-preparation', prepareMotion)
document.addEventListener('astro:before-swap', transferMotion)
