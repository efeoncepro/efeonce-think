// Dossier visual del informe compartido de Insights (TASK-1875, greenhouse-eo): los escenarios del plan GVC en
// desktop 1440×900 y mobile 390×844, más presentación y movimiento reducido. El hub no usa el DSL GVC de Greenhouse.
//
// Uso: node scripts/capture-insights-report.mjs <dirSalida> [baseUrl]
// Incluye el modelo 1.4 (TASK-1975): tarjetas de cifra, waffle por unidad y cuadros del motion de la cifra.
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'

const out = process.argv[2]
if (!out) throw new Error('Falta el directorio de salida')
const base = (process.argv[3] ?? 'http://localhost:4331').replace(/\/+$/, '')
mkdirSync(out, { recursive: true })

const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } }
const shots = []
const browser = await chromium.launch()
try {
  for (const [vp, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' })
    const page = await context.newPage()
    const shot = async (name) => { const file = `${vp}-${name}.png`; shots.push(file); return join(out, file) }
    // Capturas por elemento: sin la barra fija ni el dock móvil (flotan sobre el elemento al hacer scroll; en uso real
    // la página reserva su espacio) ni la barra de desarrollo de Astro.
    const hideChrome = () => page.addStyleTag({ content: '.ins-topbar, .ins-dock, astro-dev-toolbar { visibility: hidden !important; }' })
    const element = async (name, selector) => {
      await hideChrome()
      const el = await page.$(selector)
      if (!el) throw new Error(`${name}: no existe ${selector}`)
      await el.scrollIntoViewIfNeeded()
      await el.screenshot({ path: await shot(name) })
    }

    await page.goto(`${base}/insights/r/fixture-completo`, { waitUntil: 'networkidle' })
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' })
    await page.screenshot({ path: await shot('first-fold') })
    await element('summary', '[data-capture="summary"]')
    await page.click('#h-ess-1 .ins-tile__hit')
    await page.waitForTimeout(300)
    await element('finding-open', '#h-ess-1')
    await element('chapter-figure', '[data-capture="chapter-seo"] .ins-story')
    await page.click('[data-capture="chapter-seo"] .ins-story [data-view-btn="table"]')
    await page.waitForTimeout(200)
    await element('chapter-table-open', '[data-capture="chapter-seo"] .ins-story__stage')
    await element('chapter-aeo', '[data-capture="chapter-aeo"]')
    await element('chapter-ico', '[data-capture="chapter-ico"]')
    await element('downloads', '[data-capture="downloads"]')
    await element('footer', '[data-capture="footer"]')

    // Modelo 1.4 (TASK-1975): tarjetas de cifra (6, 4 y 1 cifra), waffle por unidad y la tarjeta en un hallazgo.
    await page.goto(`${base}/insights/r/fixture-cifras`, { waitUntil: 'networkidle' })
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' })
    await element('stats-six', '[data-capture="stats-stats.seo"]')
    await element('stats-four', '[data-capture="stats-stats.aeo"]')
    await element('stats-one', '[data-capture="stats-stats.ico"]')
    await element('waffle-units', '[data-capture="chapter-aeo"] .ins-chain, [data-capture="chapter-aeo"] .ins-story')
    await page.click('#h-ce-1 .ins-tile__hit')
    await page.waitForTimeout(300)
    await element('stats-finding-dark', '#h-ce-1')

    await page.goto(`${base}/insights/r/fixture-parcial`, { waitUntil: 'networkidle' })
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' })
    // La nota de datos parciales va justo bajo la portada: se centra en pantalla para que quede en el cuadro.
    await hideChrome()
    await page.$eval('.ins-partial', (el) => el.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(200)
    await page.screenshot({ path: await shot('partial-note') })
    await element('limits', '[data-capture="chapter-ico"]')

    await page.goto(`${base}/insights/r/fixture-sin-descargas`, { waitUntil: 'networkidle' })
    await element('downloads-unavailable', '[data-capture="downloads"]')

    for (const [token, name] of [['fixture-no-existe', 'status-not-found'], ['fixture-retirado', 'status-gone'], ['fixture-limite', 'status-rate-limited'], ['fixture-error', 'status-error']]) {
      await page.goto(`${base}/insights/r/${token}`, { waitUntil: 'networkidle' })
      await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' })
      await page.screenshot({ path: await shot(name) })
    }

    if (vp === 'desktop') {
      await page.goto(`${base}/insights/r/fixture-completo`, { waitUntil: 'networkidle' })
      await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' })
      await page.click('[data-present-open]')
      await page.waitForTimeout(400)
      await page.screenshot({ path: await shot('present-cover') })
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(700)
      await page.screenshot({ path: await shot('present-finding') })
    }
    await context.close()

    // Motion de la tarjeta (sin movimiento reducido): cuadros del recorrido y el estado final.
    {
      const motion = await browser.newContext({ viewport, deviceScaleFactor: 1 })
      const live = await motion.newPage()
      await live.goto(`${base}/insights/r/fixture-cifras`, { waitUntil: 'networkidle' })
      await live.addStyleTag({ content: '.ins-topbar, .ins-dock, astro-dev-toolbar { visibility: hidden !important; }' })
      await live.$eval('[data-capture="stats-stats.seo"] .ins-stats__panel', (el) => el.scrollIntoView({ block: 'start' }))
      const t0 = Date.now()
      for (const ms of [500, 1400, 2600]) {
        await live.waitForTimeout(Math.max(0, ms - (Date.now() - t0)))
        const file = `${vp}-stats-motion-${ms}ms.png`
        shots.push(file)
        await live.screenshot({ path: join(out, file) })
      }
      await motion.close()
    }
  }
} finally {
  await browser.close()
}
console.log(`${shots.length} capturas en ${out}`)
