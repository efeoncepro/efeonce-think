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

  // Teclado: el foco produce el mismo acoplamiento
  await page.locator('[data-couple="h2-como-llegar"]').first().focus()
  await page.waitForTimeout(250)
  const kb = await page.locator('[data-couple-target="h2-como-llegar"][aria-current="true"]').count()
  check('12. El foco por teclado acopla igual que el hover (aria-current)', kb > 0)
  await page.screenshot({ path: `${OUT}/couple-keyboard.png` })

  await page.close()

  // Reduced motion
  const rm = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  await rm.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' })
  const dur = await rm.locator('.blk').first().evaluate(el => getComputedStyle(el).transitionDuration)
  check('14. Con prefers-reduced-motion, transitionDuration = 0s', dur.startsWith('0s'), dur)
  await rm.screenshot({ path: `${OUT}/reduced-motion.png` })
  await rm.close()

  // Mobile
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await m.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' })
  const mScroll = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check('15. Sin scroll horizontal en 390px', mScroll <= 1, `overflow ${mScroll}px`)
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
