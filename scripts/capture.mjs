// Captura visual (GVC-equivalente para efeonce-think — sitio público, sin auth).
// Screenshotea una ruta a desktop + mobile con Playwright/Chromium para revisar UI en loop.
//
// Uso:
//   node scripts/capture.mjs <url> <label>
//   node scripts/capture.mjs http://localhost:4321/brand-visibility/r/<token> report
//
// Output: .captures/<label>-desktop.png  y  .captures/<label>-mobile.png

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '../.captures')

const url = process.argv[2]
const label = process.argv[3] ?? 'capture'

if (!url) {
  console.error('Uso: node scripts/capture.mjs <url> <label>')
  process.exit(1)
}

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 2 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 2 },
]

mkdirSync(OUT_DIR, { recursive: true })

const browser = await chromium.launch()
try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
    })
    const page = await context.newPage()
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(400)
    const out = resolve(OUT_DIR, `${label}-${vp.name}.png`)
    await page.screenshot({ path: out, fullPage: true })
    console.log(`[capture] ${vp.name} HTTP ${res?.status()} → ${out}`)
    await context.close()
  }
} finally {
  await browser.close()
}
