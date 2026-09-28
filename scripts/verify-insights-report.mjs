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

const expectStatus = { 'fixture-completo': 200, 'fixture-parcial': 200, 'fixture-v1': 200, 'fixture-sin-descargas': 200, 'fixture-no-existe': 404, 'fixture-retirado': 410, 'fixture-limite': 429, 'fixture-error': 502 }

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
} finally {
  await browser.close()
}

console.log(failures.length ? `\n${failures.length} falla(s)` : '\nTodo verde')
process.exit(failures.length ? 1 : 0)
