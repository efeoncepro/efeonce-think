// Verificación del informe compartido de Insights (TASK-1875, greenhouse-eo) contra los fixtures de `astro dev`.
//
// Uso: node scripts/verify-insights-report.mjs [baseUrl]   (por defecto http://localhost:4331)
//
// Comprueba, por fixture: estado HTTP, cabeceras (no-store, noindex, no-referrer), que el HTML nunca contenga el token,
// que no haya scroll horizontal en 1440 ni en 390, que las cifras impresas sean las del modelo, que un modelo sin
// campos v2 se dibuje igual, y que con movimiento reducido todo quede visible sin animar.
import { chromium } from 'playwright'

const base = (process.argv[2] ?? 'http://localhost:4331').replace(/\/+$/, '')
const failures = []
const check = (cond, msg) => { if (!cond) failures.push(msg); console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`) }

const expectStatus = { 'fixture-cifras': 200, 'fixture-completo': 200, 'fixture-extremo': 200, 'fixture-en': 200, 'fixture-parcial': 200, 'fixture-v1': 200, 'fixture-sin-descargas': 200, 'fixture-no-existe': 404, 'fixture-retirado': 410, 'fixture-limite': 429, 'fixture-error': 502, 'fixture-version-2': 502 }

for (const [token, status] of Object.entries(expectStatus)) {
  const res = await fetch(`${base}/insights/r/${token}`, { redirect: 'manual' })
  const html = await res.text()
  check(res.status === status, `${token}: HTTP ${res.status} (esperado ${status})`)
  check(res.headers.get('cache-control') === 'private, no-store', `${token}: Cache-Control private, no-store`)
  check((res.headers.get('x-robots-tag') ?? '').includes('noindex'), `${token}: X-Robots-Tag noindex`)
  check(res.headers.get('referrer-policy') === 'no-referrer', `${token}: Referrer-Policy no-referrer`)
  check(!html.includes(token), `${token}: el HTML no contiene el token`)
  check(!html.includes('googletagmanager'), `${token}: sin GTM`)
}

const v2 = await (await fetch(`${base}/insights/r/fixture-version-2`)).text()
check(!v2.includes('class="ins-page"') && !v2.includes('EO-INS-') && !v2.includes('Greenhouse Demo'), 'major no soportado: pantalla de error, sin render parcial ni datos de la edición')

const complete = await (await fetch(`${base}/insights/r/fixture-completo`)).text()
for (const display of ['16,5 %', '60,1 %', '62,0 %', '5,9 %', '1.284', '1.102', '372', '#7,4']) check(complete.includes(display), `completo: imprime «${display}» del modelo`)
check(complete.includes('Sin dato'), 'completo: la ausencia se muestra como «Sin dato», no como cero')
check(complete.includes('Descargar PDF') && complete.includes('No disponible en esta edición'), 'completo: una descarga disponible y otra no')

const partial = await (await fetch(`${base}/insights/r/fixture-parcial`)).text()
check(partial.includes('Período abierto'), 'parcial: banda de período abierto')
check(!complete.includes('Período abierto'), 'completo: sin banda de período abierto')

const v1 = await (await fetch(`${base}/insights/r/fixture-v1`)).text()
check(v1.includes('Visibilidad orgánica') && !v1.includes('Más clics con menos impresiones: el CTR subió') && !v1.includes('Para decidir en la reunión'), 'v1: se dibuja sin los campos v2 (hallazgos desde el resumen)')

const none = await (await fetch(`${base}/insights/r/fixture-sin-descargas`)).text()
check(!none.includes('?descargar='), 'sin descargas: ningún botón inerte')

check(complete.includes('Qué mide este informe') && complete.includes('Respuestas de ChatGPT, Gemini y Perplexity'), 'completo: alcance del modelo 1.1 (scopeLines) en «Cómo se midió»')
// El rótulo «Qué mide este informe» también nombra los chips de alcance de la portada: se busca el bloque del modelo.
check(!v1.includes('class="ins-scope"'), 'v1: sin alcance cuando el modelo no lo trae')
check(complete.includes('pasa el 53,7 %') && complete.includes('pasa el 43,9 %'), 'completo: tasas de paso del embudo (modelo 1.1)')
check(/property="og:image" content="[^"]*og-insights\.png"/.test(complete), 'completo: imagen para compartir sin datos del informe')
check(!complete.includes('/api/public/insights/shared/'), 'completo: el logo del cliente sale por la misma URL, nunca por la ruta con token')

const en = await (await fetch(`${base}/insights/r/fixture-en`)).text()
check(en.includes('<html lang="en-US"') && en.includes('>Present<') && !en.includes('Descargar PDF'), 'en-US: idioma del documento y chrome en inglés')

const logo = await fetch(`${base}/insights/r/fixture-completo?logo=1`)
check(logo.status === 200 && (logo.headers.get('content-type') ?? '').startsWith('image/') && logo.headers.get('cache-control') === 'private, no-store', `logo del cliente: imagen privada no-store (HTTP ${logo.status})`)
const logoMissing = await fetch(`${base}/insights/r/fixture-no-existe?logo=1`)
check(logoMissing.status === 404, `logo con enlace inexistente: 404 (HTTP ${logoMissing.status})`)

const sample = await fetch(`${base}/insights/muestra`)
const sampleHtml = await sample.text()
check(sample.status === 200, `muestra: HTTP ${sample.status}`)
check(sampleHtml.includes('Muestra con datos de ejemplo') && sampleHtml.includes('Marca de ejemplo') && sampleHtml.includes('no corresponden a ninguna marca real'), 'muestra: aviso de datos de ejemplo en portada y pie, con marca ficticia')
check(!sampleHtml.includes('Greenhouse Demo') && !sampleHtml.includes('?descargar=') && !sampleHtml.includes('?logo=1') && !sampleHtml.includes('/api/public/'), 'muestra: sin organización real, descargas, logo ni rutas de Greenhouse')
check(sampleHtml.includes('mailto:sales@efeoncepro.com') && sampleHtml.includes('Conversemos'), 'muestra: invitación a conversar en lugar de descargas')

// Modelo 1.4 (TASK-1975): tarjeta de cifra y waffle por unidad.
const cifras = await (await fetch(`${base}/insights/r/fixture-cifras`)).text()
for (const display of ['13.606', '770.462', '130.166', '17,0 %', '1,2 pos.', 'vs 16.390 en agosto de 2026', 'de 31 keywords', 'Menor es mejor', 'Sin dato en septiembre de 2026']) check(cifras.includes(display), `cifras: imprime «${display}» del modelo`)
check(['data-cols="3"', 'data-cols="2"', 'data-cols="1"'].every((attr) => cifras.includes(attr)), 'cifras: 6 cifras en tres columnas, 4 en dos y 1 en horizontal')
check(cifras.includes('baja 17,0 %, vs 16.390 en agosto de 2026; empeora') && cifras.includes('sube 1,2 pos., vs #5,7 en agosto de 2026; empeora'), 'cifras: la variación se lee como frase completa')
check(/<dt class="ins-stat__name"/.test(cifras) && /<dd class="ins-stat__value"/.test(cifras), 'cifras: semántica <dl> (nombre en <dt>, valor en <dd>)')
check(cifras.includes('vs <b class="ins-stat__vs-figure">16.390</b> en agosto de 2026') && cifras.includes('vs <b class="ins-stat__vs-figure">#5,7</b> en agosto de 2026'), 'cifras: la cifra del «vs» en negrita, con la pieza del modelo')
check(cifras.includes('Primer período medido'), 'cifras: sin período anterior, «Primer período medido» del modelo')
check(cifras.indexOf('data-capture="stats-stats.seo"') < cifras.indexOf('data-capture="chapter-aeo"'), 'cifras: la tarjeta abre su capítulo')
{
  const absent = cifras.slice(cifras.indexOf('Respuestas con cita'), cifras.indexOf('Sin dato en septiembre de 2026'))
  check(!absent.includes('data-tone='), 'cifras: sin dato no lleva píldora de variación')
}
check(/class="ins-waffle"[^>]*data-units="8"/.test(cifras) && cifras.includes('Cada cuadro es una unidad; el total es 8.'), 'cifras: 8 respuestas = 8 cuadros, con su nota')
check(/class="ins-waffle"[^>]*data-units="64"/.test(complete), 'completo: las 64 piezas son 64 cuadros')

const download = await fetch(`${base}/insights/r/fixture-completo?descargar=report_pdf`, { redirect: 'manual' })
check(download.status === 303, `descarga sin archivo: vuelve al informe (HTTP ${download.status})`)

const browser = await chromium.launch()
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    for (const reducedMotion of ['no-preference', 'reduce']) {
      const context = await browser.newContext({ viewport, reducedMotion })
      const page = await context.newPage()
      await page.goto(`${base}/insights/r/fixture-completo`, { waitUntil: 'networkidle' })
      const tag = `${viewport.width}px ${reducedMotion}`
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      check(overflow === 0, `${tag}: sin scroll horizontal (${overflow}px)`)
      const printOnlyShown = await page.evaluate(() => [...document.querySelectorAll('.ins-print-only')].filter((el) => getComputedStyle(el).display !== 'none').length)
      check(printOnlyShown === 0, `${tag}: los logos de impresión no se ven en pantalla (${printOnlyShown})`)
      if (reducedMotion === 'reduce') {
        const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal], .ins-chart .ins-bar')].filter((el) => getComputedStyle(el).opacity === '0' || getComputedStyle(el).transform.includes('matrix(1, 0, 0, 0')).length)
        check(hidden === 0, `${tag}: nada queda oculto ni sin crecer (${hidden})`)
        const motionClass = await page.evaluate(() => document.documentElement.classList.contains('ins-motion'))
        check(!motionClass, `${tag}: sin clase de motion`)
      }
      if (reducedMotion === 'no-preference') {
        // Interacción: abrir un hallazgo muestra su evidencia; filtrar deja sólo su módulo.
        await page.click('#h-ess-1 .ins-tile__hit')
        await page.waitForTimeout(700)
        const evidence = await page.evaluate(() => getComputedStyle(document.querySelector('#h-ess-1 .ins-tile__evidence')).display !== 'none')
        check(evidence, `${tag}: abrir un hallazgo muestra su evidencia`)
        const expanded = await page.getAttribute('#h-ess-1 .ins-tile__hit', 'aria-expanded')
        check(expanded === 'true', `${tag}: aria-expanded se actualiza`)
        if (viewport.width > 720) {
          await page.click('[data-filter-btn="aeo"]')
          await page.waitForTimeout(700)
          const seoVisible = await page.evaluate(() => [...document.querySelectorAll('[data-finding][data-module="seo"], .ins-scene[data-module="seo"]')].filter((el) => getComputedStyle(el).display !== 'none').length)
          check(seoVisible === 0, `${tag}: el filtro deja sólo Respuestas de IA`)
        }
      }
      const overflowAfter = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      check(overflowAfter === 0, `${tag}: sin scroll horizontal tras interactuar (${overflowAfter}px)`)
      await context.close()
    }
  }

  // Tarjeta de cifra: sin desborde, estado final sin motion, recorrido que termina en la cifra impresa, impresión.
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    for (const reducedMotion of ['reduce', 'no-preference']) {
      const context = await browser.newContext({ viewport, reducedMotion })
      const page = await context.newPage()
      await page.goto(`${base}/insights/r/fixture-cifras`, { waitUntil: 'networkidle' })
      const tag = `cifras ${viewport.width}px ${reducedMotion}`
      const finals = await page.$$eval('.ins-main .ins-stat__run', (els) => els.map((e) => e.textContent))
      if (reducedMotion === 'no-preference') {
        for (const grid of await page.$$('.ins-main [data-stat-grid]')) { await grid.scrollIntoViewIfNeeded(); await page.waitForTimeout(150) }
        await page.waitForTimeout(2600)
      }
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        hidden: [...document.querySelectorAll('.ins-main .ins-stat *')].filter((el) => el.getClientRects().length && getComputedStyle(el).opacity === '0').length,
        texts: [...document.querySelectorAll('.ins-main .ins-stat__run')].map((e) => e.textContent),
        ariaHidden: [...document.querySelectorAll('.ins-main .ins-stat__figure')].every((el) => el.getAttribute('aria-hidden') === 'true'),
        columns: [...document.querySelectorAll('.ins-main .ins-stats__grid')].map((g) => getComputedStyle(g).gridTemplateColumns.split(' ').length),
      }))
      check(state.overflow <= 0, `${tag}: sin scroll horizontal (${state.overflow}px)`)
      check(state.hidden === 0, `${tag}: ninguna pieza queda oculta (${state.hidden})`)
      check(JSON.stringify(state.texts) === JSON.stringify(finals), `${tag}: cada cifra termina en la del modelo`)
      check(state.ariaHidden, `${tag}: el número que corre es aria-hidden`)
      check(JSON.stringify(state.columns) === JSON.stringify(viewport.width === 390 ? [1, 1, 1] : [3, 2, 1]), `${tag}: columnas ${JSON.stringify(state.columns)}`)
      await context.close()
    }
  }
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    await page.goto(`${base}/insights/r/fixture-cifras`, { waitUntil: 'networkidle' })
    const finals = await page.$$eval('.ins-main .ins-stat__run', (els) => els.map((e) => e.textContent))
    // A mitad del recorrido se imprime: el estado debe ser el final.
    await page.$eval('.ins-main [data-stat-grid]', (el) => el.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(500)
    await page.emulateMedia({ media: 'print' })
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')))
    const state = await page.evaluate(() => ({
      texts: [...document.querySelectorAll('.ins-main .ins-stat__run')].map((e) => e.textContent),
      hidden: [...document.querySelectorAll('.ins-main .ins-stat *')].filter((el) => el.getClientRects().length && getComputedStyle(el).opacity === '0').length,
    }))
    check(JSON.stringify(state.texts) === JSON.stringify(finals) && state.hidden === 0, `cifras impresión a mitad del recorrido: estado final (${state.hidden} ocultas)`)
    await context.close()
  }

  // Caso extremo (textos y cifras largas, nueve hallazgos): nada desborda.
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto(`${base}/insights/r/fixture-extremo`, { waitUntil: 'networkidle' })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    check(overflow === 0, `extremo ${viewport.width}px: sin scroll horizontal (${overflow}px)`)
    await context.close()
  }

  // Modo presentación: abre con el primer lámina, avanza con teclado, Esc cierra y devuelve el foco.
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    await page.goto(`${base}/insights/r/fixture-completo`, { waitUntil: 'networkidle' })
    await page.focus('[data-present-open]')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    const first = await page.textContent('[data-present-count]')
    await page.keyboard.press('ArrowRight')
    const second = await page.textContent('[data-present-count]')
    check(/^1 de \d+$/.test(first ?? '') && /^2 de \d+$/.test(second ?? ''), `presentación: contador ${first} → ${second}`)
    const visible = await page.evaluate(() => [...document.querySelectorAll('[data-slide]')].filter((s) => s.classList.contains('is-current')).length)
    check(visible === 1, 'presentación: una sola lámina a la vez')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    const closed = await page.evaluate(() => document.querySelector('[data-present]').hidden && document.activeElement?.hasAttribute('data-present-open'))
    check(closed, 'presentación: Esc cierra y devuelve el foco al botón')
    await context.close()
  }

  // Impresión: sin barra ni controles, hallazgos visibles, logos en positivo, tablas abiertas, sin desborde.
  {
    const context = await browser.newContext({ viewport: { width: 794, height: 1123 } })
    const page = await context.newPage()
    await page.goto(`${base}/insights/r/fixture-completo`, { waitUntil: 'networkidle' })
    await page.emulateMedia({ media: 'print' })
    const state = await page.evaluate(() => ({
      topbar: getComputedStyle(document.querySelector('.ins-topbar')).display,
      heroHidden: [...document.querySelectorAll('.ins-hero__body > *')].filter((el) => getComputedStyle(el).opacity !== '1').length,
      whiteText: [...document.querySelectorAll('.ins-main p, .ins-main h2, .ins-main h3')].filter((el) => el.offsetParent && getComputedStyle(el).color === 'rgb(255, 255, 255)').length,
      tilesHidden: [...document.querySelectorAll('.ins-tile')].filter((el) => getComputedStyle(el).opacity !== '1').length,
      positiveLogo: getComputedStyle(document.querySelector('.ins-lockup.ins-print-only')).display !== 'none',
      tables: [...document.querySelectorAll('.ins-chart__table')].filter((el) => getComputedStyle(el).display === 'none').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }))
    check(state.topbar === 'none' && state.heroHidden === 0 && state.whiteText === 0 && state.tilesHidden === 0 && state.positiveLogo && state.tables === 0 && state.overflow === 0, `impresión: ${JSON.stringify(state)}`)
    await page.pdf({ path: '/tmp/insights-print-check.pdf', format: 'A4', printBackground: true })
    await context.close()
  }
} finally {
  await browser.close()
}

console.log(failures.length ? `\n${failures.length} falla(s)` : '\nTodo verde')
process.exit(failures.length ? 1 : 0)
