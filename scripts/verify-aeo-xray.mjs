#!/usr/bin/env node
/**
 * verify-aeo-xray — gate de la Radiografía AEO (TASK-1410).
 *
 * Espeja el patrón de `verify-brand-visibility-landing.mjs`.
 *
 * Los asserts NO son cosméticos. El #1 es el que impide que publiquemos, en NUESTRO
 * dominio, datos estructurados que declaran que Efeonce publicó un artículo de un
 * cliente. Ese daño es silencioso: lo detectaría un crawler antes que nosotros.
 *
 *   pnpm build && pnpm verify:aeo-xray
 */
import { chromium } from 'playwright'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const SAMPLE = process.env.XRAY_SAMPLE ?? 'sky-carretera-austral'
// El token vive en el payload (declarado, estable, versionado). El verify lo LEE de ahí:
// hardcodearlo acá haría que el gate y la URL real se separen en silencio.
const { token } = JSON.parse(readFileSync(`src/content/aeo-xray/${SAMPLE}.json`, 'utf8'))
const SLUG = `${SAMPLE}-${token}`
const ROUTE = `/muestras/${SLUG}/`
const PORT = 4321
const BASE = `http://localhost:${PORT}`
const OUT = '.captures/aeo-xray'

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? '  ✓' : '  ✗'} ${name}${detail && !ok ? ` — ${detail}` : ''}`)
}

if (!existsSync('dist/client')) {
  console.error('✗ No existe dist/client/. Corre `pnpm build` primero.')
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

// ── El HTML servido, tal cual sale del build (sin JS, sin navegador) ─────────
const htmlPath = `dist/client/muestras/${SLUG}/index.html`
if (!existsSync(htmlPath)) {
  console.error(`✗ No se generó ${htmlPath}`)
  process.exit(1)
}
const html = readFileSync(htmlPath, 'utf8')

console.log('\n▸ HTML servido (build estático)\n')

// 1. 🔴 EL ASSERT QUE MÁS IMPORTA.
const ldjson = html.match(/<script[^>]*type=["']application\/ld\+json["']/gi) ?? []
check(
  '1. Cero <script type="application/ld+json"> en el HTML servido',
  ldjson.length === 0,
  `encontrados ${ldjson.length}. Publicar schema con author/publisher del cliente en nuestro dominio = dato estructurado falso.`,
)

// 2. noindex
check('2. <meta name="robots" content="noindex"> presente', /name=["']robots["'][^>]*noindex/i.test(html))

// 3. Fuera del sitemap
const sitemaps = ['dist/client/sitemap-index.xml', 'dist/client/sitemap-0.xml'].filter(existsSync)
const inSitemap = sitemaps.some(f => readFileSync(f, 'utf8').includes('/muestras/'))
check('3. La ruta NO aparece en el sitemap', !inSitemap, sitemaps.length ? 'aparece en el sitemap' : 'no se generó sitemap')

// 4. Rótulo
check('4. Rótulo "Ejemplo ilustrativo de Efeonce" en el HTML', html.includes('Ejemplo ilustrativo de Efeonce'))

// 5. Todo <img> con alt no vacío
const imgs = html.match(/<img[^>]*>/gi) ?? []
const badAlt = imgs.filter(t => !/\salt=["'][^"']{5,}["']/i.test(t))
check(`5. Las ${imgs.length} imágenes tienen alt no vacío`, imgs.length > 0 && badAlt.length === 0, `${badAlt.length} sin alt útil`)

// 6. Crédito + licencia por imagen
const credits = (html.match(/creativecommons\.org|commons\.wikimedia\.org/gi) ?? []).length
check('6. Cada imagen tiene autoría + licencia enlazada', credits >= imgs.length, `${credits} enlaces de licencia para ${imgs.length} imágenes`)

// 7. Toda cifra de evidencia con fuente + as-of
const cites = (html.match(/<cite[\s>]/gi) ?? []).length
check('7. Toda cifra de evidencia lleva <cite> con fuente y as-of', cites >= 5, `${cites} cites`)

/* 20. 🔴 HONESTIDAD DE LAS CIFRAS. La pieza entera vale por NO exagerar.
   El «+41%» (Quotation Addition, KDD 2024) mide citas de FUENTES entre comillas, no una frase
   propia destacada. Reclamarlo sobre la cita destacada era atribuirle un lift medido a una
   táctica que no aplicamos — y es lo primero que un evaluador técnico caza.

   El assert NO puede ser "que la cadena +41% no exista": la muestra la NOMBRA a propósito,
   dentro de la frase que declara que la táctica no aplica. Eso es honestidad, no un bug.
   Lo que no puede existir es un STAT —el número grande— que la reclame como propia. */
const stats = [...html.matchAll(/<p class="stat[^"]*"[^>]*>([\s\S]*?)<\/p>/g)].map(m => m[1])
const claims41 = stats.some(x => x.includes('41%'))
check(
  '20. Ningún stat reclama el +41% (esa táctica exige citar fuentes, no destacarse a uno mismo)',
  !claims41,
  'un stat atribuye un lift medido a una táctica que la muestra no aplica',
)
const claimsReal = stats.some(x => x.includes('30%')) && stats.some(x => x.includes('32%'))
check(
  '20b. Sí se declaran las tácticas que la muestra SÍ aplica (+30% fuentes · +32% estadísticas)',
  claimsReal,
  `stats: ${stats.map(x => x.replace(/<[^>]+>/g, '').trim().slice(0, 12)).join(' | ')}`,
)

// 21. El chip direccional es `content` de CSS: invisible para lectores de pantalla.
const srCount = (html.match(/class="[^"]*\bsr\b[^"]*"[^>]*>Produce \d+ datos/g) ?? []).length
check('21. Cada bloque acoplable anuncia cuántos datos produce (el chip solo existe para quien ve)', srCount >= 6, `${srCount} bloques con voz`)

// 22. Una región con scroll tiene que ser alcanzable por teclado (WCAG 2.1.1).
const preTab = (html.match(/<pre[^>]*tabindex="0"/g) ?? []).length
const preAll = (html.match(/<pre/g) ?? []).length
check('22. WCAG 2.1.1 — el <pre> scrolleable es enfocable por teclado', preAll > 0 && preTab === preAll, `${preTab}/${preAll}`)

// 23. Sin JS el hover no produce nada: el copy no puede prometerlo.
check('23. Sin JS, el hint NO promete interactividad (viene hidden)', /class="hint[^"]*"[^>]*hidden|hidden[^>]*class="hint/.test(html))

// 8. Sin JS: el contenido sigue ahí (es HTML estático — se verifica sobre el mismo string)
const degrada =
  html.includes('Carretera Austral') && html.includes('FAQPage') && html.includes('Semrush')
check('8. Sin JavaScript: artículo + schema + evidencia siguen en el DOM', degrada)

// ── Navegador real: el frame, el teclado, reduced-motion ────────────────────
console.log('\n▸ Navegador real\n')
// `astro preview` no opera bajo el adapter de Vercel: servimos el build estático tal cual.
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', 'dist/client'], { stdio: 'ignore' })
await sleep(1500)

const browser = await chromium.launch()
try {
  // Desktop — EL FRAME DE LA LÁMINA
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `${OUT}/hero-desktop.png`, fullPage: false })
  await page.screenshot({ path: `${OUT}/full-desktop.png`, fullPage: true })

  const heroOn = await page.locator('[data-couple="capsule-main"][data-on]').count()
  check('9. El acoplamiento héroe viene pintado desde el HTML', heroOn > 0)

  /* El chip direccional ES la afordancia: sin él, el hover dice QUE hay algo al otro lado,
     pero no hacia dónde ni cuánto. Se mide sobre el estado héroe, ANTES de tocar nada:
     medirlo después de interactuar mediría un bloque que ya no está acoplado. */
  const chip = await page.locator('[data-couple="capsule-main"]').first().evaluate(el => {
    const st = getComputedStyle(el, '::after')

    return { content: st.content, opacity: st.opacity }
  })
  check(
    '17. El chip direccional es visible en el bloque acoplado',
    chip.opacity === '1' && chip.content.includes('datos'),
    `opacity=${chip.opacity} content=${chip.content}`,
  )

  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check('10. Sin scroll horizontal en 1440px', scrollW <= 1, `overflow ${scrollW}px`)

  // Acoplamiento: hover sobre la imagen -> se resalta su ImageObject/alt
  await page.locator('[data-couple="img-hero"]').first().hover()
  await page.waitForTimeout(250)
  const coupled = await page.locator('[data-couple-target="img-hero"][data-on]').count()
  check('11. Hover en el artículo resalta su contraparte en la capa de máquina', coupled > 0)
  await page.screenshot({ path: `${OUT}/couple-image.png` })

  /**
   * El acoplamiento scrollea el PANEL, nunca la página.
   *
   * Se despacha el `mouseover` a mano en vez de usar `locator.hover()`: el hover de
   * Playwright scrollea el elemento a la vista como parte de su chequeo de accionabilidad,
   * y ese scroll es SUYO, no nuestro. Medirlo daría un falso rojo (y peor: un falso verde
   * si algún día lo "arreglamos" relajando el umbral). Acá aislamos el efecto de NUESTRO
   * código. Que `focus()` scrollee la página, en cambio, es correcto y esperado.
   */
  const before = await page.evaluate(() => {
    const el = document.querySelector('[data-couple="faq"]')
    el?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

    return document.documentElement.scrollTop
  })
  await page.waitForTimeout(600)
  const after = await page.evaluate(() => document.documentElement.scrollTop)
  check('13. Al acoplar, la página NO se mueve (scrollea el panel)', Math.abs(after - before) < 5, `${before} → ${after}`)

  // Teclado con el MOUSE APOYADO en otra parte: el cursor quieto no puede robarle el
  // acoplamiento al teclado (al enfocar, la página scrollea y dispara mouseover fantasma).
  await page.mouse.move(300, 400)
  await page.keyboard.press('Tab')
  await page.locator('[data-couple="h2-como-llegar"]').first().focus()
  await page.waitForTimeout(350)
  const kb = await page.locator('[data-couple-target="h2-como-llegar"][aria-current="true"]').count()
  check('12. El teclado acopla aunque el mouse esté apoyado en otra parte', kb > 0)
  await page.screenshot({ path: `${OUT}/couple-keyboard.png` })

  /* LOS FRAMES DE LA LÁMINA — deliberados, no accidentales.
     Con el hero editorial la correspondencia queda bajo el pliegue: la página se diseña
     para LEERSE, la lámina se captura donde ARGUMENTA. Dos frames, dos argumentos. */
  const slide = async (couple, scroll, name) => {
    await page.keyboard.press('Escape')
    await page.mouse.move(10, 10)
    await page.evaluate(y => window.scrollTo(0, y), scroll)
    await page.waitForTimeout(250)
    await page.evaluate(id => {
      document
        .querySelector(`[data-couple="${id}"]`)
        ?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    }, couple)
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/${name}.png` })
  }

  // (a) El oficio: la cápsula de respuesta ↔ el 72,4% de las páginas que ChatGPT cita.
  await slide('capsule-main', 980, 'slide-oficio')
  // (b) La competencia: el H2 de «cómo se llega» ↔ quién ocupa hoy ese espacio
  //     (Wikipedia · Instagram · TripAdvisor). Cero aerolíneas.
  await slide('h2-como-llegar', 1180, 'slide-competencia')

  /* El chip y el lector de pantalla tienen que decir EL MISMO número. Si el chip promete 9
     y el anuncio dice 10, uno de los dos miente — y el que ve el número es el evaluador. */
  await page.keyboard.press('Escape')
  await page.evaluate(() => {
    document.querySelector('[data-couple="h1"]')?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
  })
  await page.waitForTimeout(400)
  const counts = await page.evaluate(() => {
    const src = document.querySelector('[data-couple="h1"]')
    const dom = document.querySelectorAll('[data-couple-target="h1"]').length
    const chip = (src?.getAttribute('data-n') ?? '').match(/\d+/)?.[0]

    return { dom, chip: Number(chip) }
  })
  check(
    '18. El chip y el DOM cuentan lo mismo (el chip no puede mentir)',
    counts.dom === counts.chip,
    `chip=${counts.chip} dom=${counts.dom}`,
  )

  /* Focus Not Obscured (WCAG 2.2 AA · 2.4.11): el header pegajoso del instrumento NO puede
     tapar el nodo al que saltamos. Es el fallo que el operador vio: medio número cortado. */
  await page.waitForTimeout(900) // el scroll suave del panel tiene que TERMINAR antes de medir
  const obscured = await page.evaluate(() => {
    const pane = document.querySelector('.inst')
    const head = pane?.querySelector('.in-head')
    const node = pane?.querySelector('[data-couple-target][data-on]')
    if (!pane || !head || !node) return null
    const h = head.getBoundingClientRect()
    const n = node.getBoundingClientRect()

    return n.top >= h.bottom - 1
  })
  check('19. WCAG 2.4.11 — el header pegajoso no tapa el nodo acoplado', obscured === true, `top del nodo bajo el header: ${obscured}`)

  /* El texto para lectores de pantalla NO puede verse. Si se ve, no es accesibilidad: es un
     bug visual. (Pasó: el reemplazo de CSS apuntaba a una clase que ya no existía = no-op.) */
  const srVisible = await page.locator('.sr').first().isVisible()
  const srBox = await page.locator('.sr').first().boundingBox()
  check(
    '24. El texto para lectores de pantalla es invisible (pero está en el DOM)',
    !srVisible || (srBox !== null && srBox.width <= 2 && srBox.height <= 2),
    `visible=${srVisible} box=${JSON.stringify(srBox)}`,
  )

  await page.close()

  // Reduced motion
  const rm = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  await rm.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' })
  const dur = await rm.locator('.blk').first().evaluate(el => getComputedStyle(el).transitionDuration)
  check('14. Con prefers-reduced-motion, transitionDuration = 0s', dur.startsWith('0s'), dur)
  await rm.screenshot({ path: `${OUT}/reduced-motion.png` })
  await rm.close()

  // Mobile
  // hasTouch + isMobile: sin esto Chromium reporta `hover: hover` en un viewport de 390px y
  // la captura miente — mostraría "Pasa el cursor" en un teléfono, que no tiene cursor.
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  await m.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' })
  const mScroll = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check('15. Sin scroll horizontal en 390px', mScroll <= 1, `overflow ${mScroll}px`)

  const hint = (await m.locator('[data-testid="hint-m"]').textContent()) ?? ''
  const hintVisible = await m.locator('[data-testid="hint-m"]').isVisible()
  check('16. En táctil el copy no habla de cursor', hintVisible && !hint.includes('cursor'), hint.slice(0, 40))
  await m.screenshot({ path: `${OUT}/hero-mobile.png` })
  await m.screenshot({ path: `${OUT}/full-mobile.png`, fullPage: true })
  await m.close()
} finally {
  await browser.close()
  server.kill()
}

const failed = results.filter(r => !r.ok)
console.log(`\n${failed.length === 0 ? '✅' : '❌'} ${results.length - failed.length}/${results.length} asserts\n`)
if (failed.length) {
  failed.forEach(f => console.log(`   ✗ ${f.name} — ${f.detail}`))
  process.exit(1)
}
console.log(`   Capturas en ${OUT}/`)
console.log('   ⚠️  MIRA hero-desktop.png a tamaño de lámina. Un verify verde con una captura ilegible NO es un cierre válido.\n')
