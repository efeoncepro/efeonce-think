/**
 * Movimiento y microinteracciones del informe compartido de Insights (TASK-1875). Todo es mejora progresiva: el HTML
 * del servidor ya está completo y final; esto sólo «arma» lo que está. Con `prefers-reduced-motion` o sin JS no se
 * anima nada y el contenido es idéntico.
 *
 * - Portada: el anillo aparece, la esfera recorre su arco con la estela detrás (lento → rápido → lento) y sube el halo.
 * - Secciones: entran al viewport con un reveal corto; listas con stagger.
 * - Cifras: cuentan hasta su valor y terminan EXACTAMENTE en el `display` del modelo.
 * - Figuras: las barras crecen desde cero una sola vez; las líneas se trazan.
 * - Índice: sigue la lectura (sección activa + órbita de progreso que suma un tramo por sección); los anclas mueven el
 *   foco al título de la sección.
 * - Tabla equivalente: el rótulo dice «Ver» u «Ocultar» según su estado.
 */

const EMPHASIZED = (t: number) => {
  // cubic-bezier(0.2, 0, 0, 1) aproximada: arranque lento, golpe, asentamiento largo.
  const u = 1 - t
  return 1 - u * u * u * u
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function mountOrbit() {
  const host = document.querySelector<HTMLElement>('[data-orbit]')
  if (!host) return
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

  // Estado inicial: anillo y halo apagados, esfera en la partida, sin estela.
  ring.style.opacity = '0'
  halo.style.opacity = '0'
  const from = polar(start)
  sphere.setAttribute('cx', from.x.toFixed(2))
  sphere.setAttribute('cy', from.y.toFixed(2))
  sphere.style.transformOrigin = `${from.x}px ${from.y}px`
  arc.setAttribute('d', `M ${from.x} ${from.y}`)

  ring.style.transition = 'opacity 350ms cubic-bezier(0.4, 0, 0.2, 1)'
  halo.style.transition = 'opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)'
  requestAnimationFrame(() => (ring.style.opacity = '1'))

  const t0 = performance.now() + delay
  const frame = (now: number) => {
    const t = Math.min(1, Math.max(0, (now - t0) / duration))
    const angle = start + sweep * EMPHASIZED(t)
    const head = polar(angle)
    // La estela nunca se extiende antes de la partida.
    const tailAngle = Math.max(start, angle - sweep)
    const tail = polar(tailAngle)
    arc.setAttribute('d', `M ${tail.x.toFixed(2)} ${tail.y.toFixed(2)} A ${R} ${R} 0 0 1 ${head.x.toFixed(2)} ${head.y.toFixed(2)}`)
    sphere.setAttribute('cx', head.x.toFixed(2))
    sphere.setAttribute('cy', head.y.toFixed(2))
    if (t < 1) requestAnimationFrame(frame)
    else halo.style.opacity = '1'
  }
  requestAnimationFrame(frame)
}

function countUp(el: HTMLElement) {
  const target = Number(el.dataset.countup)
  const display = el.dataset.display ?? el.textContent ?? ''
  const match = display.match(/[\d.,]+/)
  if (!Number.isFinite(target) || !match) return
  const decimals = (match[0].split(',')[1] ?? '').length
  const format = new Intl.NumberFormat(document.documentElement.lang || 'es-CL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  const [before, after] = [display.slice(0, match.index), display.slice((match.index ?? 0) + match[0].length)]
  const t0 = performance.now()
  const duration = 1100
  const frame = (now: number) => {
    const t = Math.min(1, (now - t0) / duration)
    if (t < 1) {
      el.textContent = `${before}${format.format(target * EMPHASIZED(t))}${after}`
      requestAnimationFrame(frame)
    } else {
      el.textContent = display // termina exactamente en la cifra del modelo
    }
  }
  requestAnimationFrame(frame)
}

function mountReveals() {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-stagger], [data-chart], [data-countup]')
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
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
  )
  targets.forEach((el) => io.observe(el))
}

function mountNavigation() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc]'))
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'))
  const progress = document.querySelector<HTMLElement>('[data-progress]')
  const progressArc = progress?.querySelector<SVGCircleElement>('.ins-progress__arc')
  const progressSphere = progress?.querySelector<SVGGElement>('.ins-progress__sphere')
  const progressText = progress?.querySelector<HTMLElement>('[data-progress-text]')
  const total = sections.length

  const setActive = (id: string) => {
    const index = sections.findIndex((s) => s.id === id)
    links.forEach((link) => (link.dataset.toc === id ? link.setAttribute('aria-current', 'true') : link.removeAttribute('aria-current')))
    if (index < 0 || !progressArc || !progressSphere) return
    // Progreso: cada sección SUMA su tramo; al final la órbita se completa con la esfera arriba.
    const fraction = (index + 1) / total
    progressArc.style.strokeDashoffset = String(100 - fraction * 100)
    progressSphere.style.transform = `rotate(${fraction * 360}deg)`
    if (progressText) progressText.textContent = (progressText.dataset.template ?? '').replace(/\d+ de/, `${index + 1} de`)
  }

  const spy = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]) setActive((visible[0].target as HTMLElement).id)
    },
    { rootMargin: '-35% 0px -55% 0px' },
  )
  sections.forEach((s) => spy.observe(s))

  // Arriba, en la portada, la sección activa es la primera (el espía no ve ninguna en su banda).
  const resetAtTop = () => {
    if (window.scrollY < window.innerHeight * 0.5 && sections[0]) setActive(sections[0].id)
  }
  window.addEventListener('scroll', resetAtTop, { passive: true })
  resetAtTop()

  // El progreso aparece cuando la portada sale de pantalla: nunca dos órbitas a la vista.
  const masthead = document.querySelector('[data-masthead]')
  if (masthead && progress) {
    new IntersectionObserver(([entry]) => progress.classList.toggle('is-visible', !entry.isIntersecting), { threshold: 0.05 }).observe(masthead)
  }

  // Anclas: scroll suave y foco al título de la sección (a11y), cerrando el índice móvil.
  document.querySelectorAll<HTMLAnchorElement>('.ins-toc a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href')!.slice(1)
      const section = document.getElementById(id)
      if (!section) return
      event.preventDefault()
      section.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
      const heading = section.querySelector<HTMLElement>('h2')
      heading?.focus({ preventScroll: true })
      history.replaceState(null, '', `#${id}`)
      link.closest('details')?.removeAttribute('open')
    })
  })
}

function mountTables() {
  document.querySelectorAll<HTMLDetailsElement>('[data-table]').forEach((details) => {
    const label = details.querySelector<HTMLElement>('[data-show]')
    if (!label) return
    details.addEventListener('toggle', () => {
      label.textContent = details.open ? label.dataset.hide ?? '' : label.dataset.show ?? ''
    })
  })
}

export function mountInsightsReport() {
  if (!document.querySelector('.ins-page')) return
  ;(window as unknown as { __insMounted?: boolean }).__insMounted = true
  mountTables()
  mountNavigation()
  if (reducedMotion()) {
    document.documentElement.classList.remove('ins-motion')
    return
  }
  document.documentElement.classList.add('ins-motion')
  mountOrbit()
  mountReveals()
}
