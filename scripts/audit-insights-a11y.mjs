// Auditoría de accesibilidad del informe compartido de Insights (TASK-1875): contraste AA de todo texto visible
// (4,5:1; 3:1 desde 24 px o 18,66 px en negrita) contra su fondo efectivo, y recorrido con Tab (todo foco visible,
// sin trampas). Uso: node scripts/audit-insights-a11y.mjs [baseUrl] [token]
import { chromium } from 'playwright'

const base = (process.argv[2] ?? 'http://localhost:4331').replace(/\/+$/, '')
const token = process.argv[3] ?? 'fixture-completo'
const browser = await chromium.launch()
let failures = 0
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await (await browser.newContext({ viewport, reducedMotion: 'reduce' })).newPage()
    await page.goto(`${base}/insights/r/${token}`, { waitUntil: 'networkidle' })
    const low = await page.evaluate(() => {
      const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
      const rgba = (css) => { probe.clearRect(0, 0, 1, 1); probe.fillStyle = '#000'; probe.fillStyle = css; probe.fillRect(0, 0, 1, 1); const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data; return [r, g, b, a / 255] }
      const over = (top, under) => top.slice(0, 3).map((c, i) => c * top[3] + under[i] * (1 - top[3])).concat(1)
      const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
      // Fondo efectivo: sólo los ancestros cuya caja contiene el centro del texto (una cifra puesta sobre una barra
      // no se mide contra el relleno de la barra).
      const bgOf = (el) => {
        const r = el.getBoundingClientRect(); const x = r.left + r.width / 2; const y = r.top + r.height / 2
        const layers = []
        for (let n = el; n; n = n.parentElement) {
          const b = n.getBoundingClientRect()
          if (n !== el && (x < b.left || x > b.right || y < b.top || y > b.bottom)) continue
          const c = getComputedStyle(n); const bg = rgba(c.backgroundColor); if (bg[3] > 0) layers.push([bg, Number(c.opacity)]); if (bg[3] >= 1) break }
        let acc = [255, 255, 255, 1]
        for (const [bg] of layers.reverse()) acc = over(bg, acc)
        return acc
      }
      const out = []
      for (const el of document.querySelectorAll('body *')) {
        if (!(el.offsetWidth || el.offsetHeight) || el.closest('[hidden], [aria-hidden="true"], .ins-present, svg, astro-dev-toolbar')) continue
        if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue
        const box = el.getBoundingClientRect()
        if (box.left + box.width / 2 > innerWidth || box.right < 0) continue // recortado en un carril con scroll horizontal
        const c = getComputedStyle(el)
        if (c.visibility === 'hidden' || Number(c.opacity) === 0) continue
        let opacity = 1; for (let n = el; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity)
        const bg = bgOf(el)
        const fgRaw = rgba(c.color); const fg = over([...fgRaw.slice(0, 3), fgRaw[3] * opacity], bg)
        const [L1, L2] = [lum(fg), lum(bg)].sort((a, b) => b - a)
        const ratio = (L1 + 0.05) / (L2 + 0.05)
        const size = parseFloat(c.fontSize); const bold = Number(c.fontWeight) >= 700
        const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5
        if (ratio < need) out.push(`${ratio.toFixed(2)}:1 < ${need} · ${size}px · .${String(el.className).split(' ')[0]} · «${el.textContent.trim().slice(0, 40)}»`)
      }
      return [...new Set(out)]
    })
    console.log(`\n${viewport.width}px — contraste: ${low.length ? low.length + ' bajo AA' : 'todo AA'}`)
    low.forEach((l) => console.log('  ' + l))
    failures += low.length

    // Teclado: cada parada de Tab tiene foco visible y el recorrido termina (sin trampas).
    const stops = []
    for (let i = 0; i < 80; i += 1) {
      await page.keyboard.press('Tab')
      const info = await page.evaluate(() => {
        const el = document.activeElement
        if (!el || el === document.body || el.tagName === 'ASTRO-DEV-TOOLBAR') return el?.tagName === 'ASTRO-DEV-TOOLBAR' ? { skip: true } : null
        const c = getComputedStyle(el)
        const visible = c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0 || c.boxShadow !== 'none'
        return { label: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30), visible, key: el.outerHTML.slice(0, 80) }
      })
      if (!info) break
      if (info.skip) continue
      if (stops.length && stops[0].key === info.key) break
      stops.push(info)
    }
    const invisible = stops.filter((s) => !s.visible)
    console.log(`${viewport.width}px — teclado: ${stops.length} paradas, ${invisible.length} sin foco visible`)
    invisible.forEach((s) => console.log('  sin foco visible: ' + s.label))
    failures += invisible.length
  }
} finally { await browser.close() }
process.exit(failures ? 1 : 0)
