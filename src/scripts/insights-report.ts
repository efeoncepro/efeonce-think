/**
 * Interacción y movimiento del informe compartido de Insights (TASK-1875) — dirección «tablero de respuestas».
 *
 * Mejora progresiva: el HTML del servidor ya está completo y final. Sin JS: todo abierto, gráfico y tabla visibles.
 * Con `prefers-reduced-motion`: toda la interacción, nada de animación.
 *
 * - Portada: la esfera recorre su arco con la estela detrás, sube el halo y late el anillo «en vivo». Al bajar, la
 *   órbita se aleja y reaparece pequeña en la barra fija: una sola órbita a la vista, que ahora marca el avance.
 * - Hallazgos: se expanden en su lugar (View Transitions si el navegador la tiene), uno a la vez, con Escape para
 *   cerrar y enlace directo (`#h-…`) que abre el hallazgo al cargar.
 * - Filtros: la barra deja sólo lo del módulo elegido.
 * - Escenas: el gráfico principal queda fijo y cambia de estado con cada paso del relato.
 * - Cifras: cuentan hasta su valor y terminan EXACTAMENTE en el `display` del modelo.
 */

type Win = Window & { __insMounted?: boolean }

const EMPHASIZED = (t: number) => 1 - Math.pow(1 - t, 4)
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const withTransition = (update: () => void) => {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
  if (!reducedMotion() && typeof doc.startViewTransition === 'function') doc.startViewTransition(update)
  else update()
}

// ── Portada ─────────────────────────────────────────────────────────────────
function mountOrbit(animate: boolean) {
  const host = document.querySelector<HTMLElement>('[data-orbit]')
  const hero = document.querySelector<HTMLElement>('[data-hero]')
  const bar = document.querySelector<HTMLElement>('[data-bar]')
  if (!host || !hero) return

  // La barra «recibe» la órbita cuando la portada sale de pantalla.
  if (bar) new IntersectionObserver(([entry]) => bar.classList.toggle('is-stuck', !entry.isIntersecting), { threshold: 0.02 }).observe(hero)

  if (!animate) return
  const arc = host.querySelector<SVGPathElement>('.ins-orbit__arc')
  const sphere = host.querySelector<SVGCircleElement>('.ins-orbit__sphere')
  const ring = host.querySelector<SVGCircleElement>('.ins-orbit__ring')
  const halo = host.querySelector<SVGCircleElement>('.ins-orbit__halo')
  if (!arc || !sphere || !ring || !halo) return

  const R = Number(host.dataset.r)
  const start = Number(host.dataset.start)
  const sweep = Number(host.dataset.sweep)
  const duration = Number(host.dataset.ms)
  const delay = Number(host.dataset.delay)
  const polar = (deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180
    return { x: R + R * Math.cos(a), y: R + R * Math.sin(a) }
  }

  ring.style.opacity = '0'
  halo.style.opacity = '0'
  ring.style.transition = 'opacity 350ms cubic-bezier(0.4, 0, 0.2, 1)'
  halo.style.transition = 'opacity 900ms cubic-bezier(0.4, 0, 0.2, 1)'
  const from = polar(start)
  sphere.setAttribute('cx', from.x.toFixed(2))
  sphere.setAttribute('cy', from.y.toFixed(2))
  arc.setAttribute('d', `M ${from.x} ${from.y}`)
  requestAnimationFrame(() => (ring.style.opacity = '1'))

  const t0 = performance.now() + delay
  const frame = (now: number) => {
    const t = Math.min(1, Math.max(0, (now - t0) / duration))
    const angle = start + sweep * EMPHASIZED(t)
    const head = polar(angle)
    const tail = polar(Math.max(start, angle - sweep)) // la estela nunca antes de la partida
    arc.setAttribute('d', `M ${tail.x.toFixed(2)} ${tail.y.toFixed(2)} A ${R} ${R} 0 0 1 ${head.x.toFixed(2)} ${head.y.toFixed(2)}`)
    sphere.setAttribute('cx', head.x.toFixed(2))
    sphere.setAttribute('cy', head.y.toFixed(2))
    if (t < 1) requestAnimationFrame(frame)
    else halo.style.opacity = '1'
  }
  requestAnimationFrame(frame)

  // Al bajar, la órbita gira un poco, se aleja y se apaga: la misma órbita sigue en la barra.
  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const p = Math.min(1, window.scrollY / Math.max(1, hero.offsetHeight))
      host.style.transform = `translate3d(0, ${(p * 120).toFixed(1)}px, 0) rotate(${(p * 24).toFixed(2)}deg) scale(${(1 - p * 0.18).toFixed(3)})`
      host.style.opacity = Math.max(0, 1 - p * 1.25).toFixed(3)
      ticking = false
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
}

// ── Cifras ──────────────────────────────────────────────────────────────────
function countUp(el: HTMLElement) {
  const target = Number(el.dataset.countup)
  const display = el.dataset.display ?? el.textContent ?? ''
  const match = display.match(/[\d.,]+/)
  if (!Number.isFinite(target) || !match || el.dataset.counted) return
  el.dataset.counted = '1'
  const decimals = (match[0].split(',')[1] ?? '').length
  const format = new Intl.NumberFormat(document.documentElement.lang || 'es-CL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  const before = display.slice(0, match.index)
  const after = display.slice((match.index ?? 0) + match[0].length)
  const t0 = performance.now()
  const frame = (now: number) => {
    const t = Math.min(1, (now - t0) / 1100)
    if (t < 1) {
      el.textContent = `${before}${format.format(target * EMPHASIZED(t))}${after}`
      requestAnimationFrame(frame)
    } else {
      el.textContent = display
    }
  }
  requestAnimationFrame(frame)
}

function mountReveals() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        el.classList.add('is-in')
        if (el.dataset.countup !== undefined) countUp(el)
        io.unobserve(el)
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  )
  document.querySelectorAll<HTMLElement>('[data-reveal], [data-stagger], [data-chart], [data-countup]').forEach((el) => {
    // Lo que está dentro de un hallazgo cerrado o de una escena se arma al abrirlo o al llegar al paso.
    if (el.closest('.ins-tile__evidence') || (el.matches('[data-chart]') && el.closest('[data-story]'))) return
    io.observe(el)
  })
}

// ── Hallazgos ───────────────────────────────────────────────────────────────
function mountFindings(animate: boolean) {
  const tiles = Array.from(document.querySelectorAll<HTMLElement>('[data-finding]'))

  const setOpen = (tile: HTMLElement, open: boolean) => {
    tile.classList.toggle('is-open', open)
    tile.querySelector('.ins-tile__hit')?.setAttribute('aria-expanded', String(open))
    if (open) tile.querySelectorAll<HTMLElement>('[data-chart]').forEach((chart) => requestAnimationFrame(() => chart.classList.add('is-in')))
  }

  const open = (tile: HTMLElement) => {
    withTransition(() => {
      tiles.forEach((other) => other !== tile && setOpen(other, false))
      setOpen(tile, true)
    })
    history.replaceState(null, '', `#${tile.id}`)
    window.setTimeout(() => tile.scrollIntoView({ behavior: animate ? 'smooth' : 'auto', block: 'start' }), animate ? 380 : 0)
  }

  const close = (tile: HTMLElement) => {
    withTransition(() => setOpen(tile, false))
    history.replaceState(null, '', location.pathname + location.search)
    tile.querySelector<HTMLElement>('.ins-tile__hit')?.focus()
  }

  tiles.forEach((tile, i) => {
    tile.style.setProperty('view-transition-name', `ins-tile-${i}`)
    tile.querySelector('.ins-tile__hit')?.addEventListener('click', () => (tile.classList.contains('is-open') ? close(tile) : open(tile)))
    tile.querySelector('[data-close]')?.addEventListener('click', () => close(tile))
    tile.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && tile.classList.contains('is-open')) close(tile)
    })
  })

  // Enlace directo a un hallazgo: se abre al cargar.
  const target = location.hash ? document.getElementById(location.hash.slice(1)) : null
  if (target?.matches('[data-finding]')) open(target)
}

// ── Filtros por módulo ──────────────────────────────────────────────────────
function mountFilters() {
  const page = document.querySelector<HTMLElement>('.ins-page')
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-filter-btn]'))
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-finding], .ins-scene[data-module]'))
  const findings = document.getElementById('hallazgos')
  if (!page) return

  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      const filter = button.dataset.filterBtn ?? 'all'
      withTransition(() => {
        page.dataset.filter = filter
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)))
        items.forEach((item) => {
          const module = item.dataset.module
          item.classList.toggle('is-filtered-out', filter !== 'all' && module !== 'all' && module !== filter)
        })
      })
      // Si el lector está más abajo, lo lleva al tablero para que vea el efecto del filtro.
      if (findings && findings.getBoundingClientRect().top < 0) findings.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
    }),
  )
}

// ── Gráfico ↔ tabla ─────────────────────────────────────────────────────────
function mountChartSwitches() {
  document.querySelectorAll<HTMLElement>('[data-chart]').forEach((chart) => {
    const buttons = chart.querySelectorAll<HTMLButtonElement>('[data-view-btn]')
    buttons.forEach((button) =>
      button.addEventListener('click', () => {
        chart.dataset.view = button.dataset.viewBtn ?? 'chart'
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)))
        if (chart.dataset.view === 'chart') requestAnimationFrame(() => chart.classList.add('is-in'))
      }),
    )
  })
}

// ── Escenas narradas ────────────────────────────────────────────────────────
function mountStories() {
  document.querySelectorAll<HTMLElement>('[data-story]').forEach((story) => {
    const chart = story.querySelector<HTMLElement>('[data-chart]')
    const steps = Array.from(story.querySelectorAll<HTMLElement>('.ins-step'))
    if (!chart) return
    if (steps.length === 0) {
      new IntersectionObserver(([entry], obs) => {
        if (entry.isIntersecting) {
          chart.classList.add('is-in')
          obs.disconnect()
        }
      }, { threshold: 0.2 }).observe(chart)
      return
    }
    chart.dataset.step = steps[0].dataset.step ?? '1'
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const step = entry.target as HTMLElement
          steps.forEach((s) => s.classList.toggle('is-active', s === step))
          chart.dataset.step = step.dataset.step ?? '1'
          chart.classList.add('is-in')
          const figure = step.querySelector<HTMLElement>('[data-countup]')
          if (figure) countUp(figure)
        }
      },
      { rootMargin: '-40% 0px -45% 0px' },
    )
    steps.forEach((s) => io.observe(s))
  })
}

// ── Avance de lectura en la órbita de la barra ──────────────────────────────
function mountProgress() {
  const progress = document.querySelector<HTMLElement>('[data-progress]')
  const arc = progress?.querySelector<SVGCircleElement>('.ins-topbar__arc')
  const sphere = progress?.querySelector<SVGGElement>('.ins-topbar__sphere')
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'))
  if (!arc || !sphere || sections.length === 0) return

  // Progreso por secciones: cada una SUMA su tramo; al terminar, la órbita completa con la esfera arriba.
  const set = (index: number) => {
    const fraction = Math.max(0.04, (index + 1) / sections.length)
    arc.style.strokeDashoffset = String(100 - fraction * 100)
    sphere.style.transform = `rotate(${fraction * 360}deg)`
  }
  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).map((e) => sections.indexOf(e.target as HTMLElement))
      if (visible.length) set(Math.max(...visible))
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  sections.forEach((s) => io.observe(s))
}

// ── Copiar enlace ───────────────────────────────────────────────────────────
function mountCopyLinks() {
  const toast = document.querySelector<HTMLElement>('[data-toast]')
  let timer: number | undefined
  document.querySelectorAll<HTMLElement>('[data-copy-link]').forEach((button) =>
    button.addEventListener('click', async () => {
      // El enlace sale de `location` en el navegador de quien ya lo tiene: el token nunca se escribió en el HTML.
      const anchor = button.dataset.copyLink
      const url = `${location.origin}${location.pathname}${anchor ? `#${anchor}` : ''}`
      try {
        await navigator.clipboard.writeText(url)
      } catch {
        return
      }
      if (!toast) return
      toast.textContent = toast.dataset.text ?? ''
      toast.classList.add('is-on')
      window.clearTimeout(timer)
      timer = window.setTimeout(() => toast.classList.remove('is-on'), 2200)
    }),
  )
}

export function mountInsightsReport() {
  if (!document.querySelector('.ins-page')) return
  ;(window as Win).__insMounted = true
  const animate = !reducedMotion()
  document.documentElement.classList.add('ins-js')
  document.documentElement.classList.toggle('ins-motion', animate)

  mountOrbit(animate)
  mountFindings(animate)
  mountFilters()
  mountChartSwitches()
  mountProgress()
  mountCopyLinks()
  if (animate) {
    mountReveals()
    mountStories()
  }
}
