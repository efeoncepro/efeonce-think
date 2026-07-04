// Verificacion visual/runtime del informe AI Visibility en efeonce-think.
//
// Uso:
//   node scripts/verify-report.mjs <url> <label>
//
// Cubre TASK-1329:
// - capturas desktop 1440, laptop 1280 y mobile 390;
// - scrollWidth <= clientWidth;
// - no prompts/raw provider answers/full citation URLs/internal findings en texto publico;
// - categoria renderizada de forma honesta: sin filas fabricadas, labels internos ni NaN.

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const url = process.argv[2]
const label = process.argv[3] ?? 'report-verify'

if (!url) {
  console.error('Uso: node scripts/verify-report.mjs <url> <label>')
  process.exit(1)
}

const OUT_DIR = resolve('.captures')
const viewports = [
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'laptop-1280', width: 1280, height: 900 },
  { name: 'mobile-390', width: 390, height: 844 },
]

const forbiddenTextPatterns = [
  /raw provider/i,
  /provider answer/i,
  /execution_prompts/i,
  /accuracyFindings/i,
  /providerFindings/i,
  /normalized_findings/i,
  /ambiguousCount/i,
  /unmappedCount/i,
  /mid_category/i,
  /service_line/i,
  /adjacent_capability/i,
  /product_or_service/i,
  /canonical signals/i,
  /\bambiguas\b/i,
  /internal reason/i,
  /hallucination detail/i,
  /prompt:\s/i,
  /https?:\/\/[^\s]+/i,
]

mkdirSync(OUT_DIR, { recursive: true })

const browser = await chromium.launch()
const results = []
let failed = false

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })

    await page.evaluate(async () => {
      const max = document.body.scrollHeight
      for (let y = 0; y < max; y += 420) {
        window.scrollTo(0, y)
        await new Promise((resolve) => setTimeout(resolve, 35))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(700)

    const metrics = await page.evaluate((patterns) => {
      const text = document.body.innerText
      const html = document.documentElement.innerHTML
      const leaks = patterns.filter((pattern) => new RegExp(pattern.source, pattern.flags).test(text))
      return {
        status: document.readyState,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasCategory: Boolean(document.querySelector('[data-capture="report-category-association"]')),
        categoryStatus: document.querySelector('[data-capture="report-category-association"]')?.getAttribute('data-category-status') ?? null,
        hasCategoryRows: Boolean(document.querySelector('[data-capture="report-category-rows"]')),
        hasNaN: /\bNaN\b/.test(text),
        hasLadder: Boolean(document.querySelector('[data-capture="report-ladder"]')),
        hasHero: Boolean(document.querySelector('[data-capture="report-hero"]')),
        hasEngineCoverage: Boolean(document.querySelector('[data-capture="report-engine-coverage"]')),
        hasSourceEvidence: Boolean(document.querySelector('[data-capture="report-source-evidence"]')),
        visibleLeakPatterns: leaks.map((pattern) => pattern.source),
        hasInternalHtmlKeys: /providerFindings|accuracyFindings|execution_prompts|normalized_findings/.test(html),
      }
    }, forbiddenTextPatterns.map((pattern) => ({ source: pattern.source, flags: pattern.flags })))

    const screenshot = resolve(OUT_DIR, `${label}-${viewport.name}.png`)
    await page.screenshot({ path: screenshot, fullPage: true })

    const errors = []
    if ((response?.status() ?? 0) !== 200) errors.push(`HTTP ${response?.status()}`)
    if (metrics.scrollWidth > metrics.clientWidth) errors.push(`overflow ${metrics.scrollWidth}/${metrics.clientWidth}`)
    if (metrics.categoryStatus && metrics.categoryStatus !== 'mapped' && metrics.hasCategoryRows) {
      errors.push(`category rows rendered for ${metrics.categoryStatus}`)
    }
    if (metrics.hasNaN) errors.push('visible NaN')
    if (!metrics.hasHero || !metrics.hasEngineCoverage || !metrics.hasSourceEvidence || !metrics.hasLadder) {
      errors.push('required capture marker missing')
    }
    if (metrics.visibleLeakPatterns.length > 0) errors.push(`visible leak patterns: ${metrics.visibleLeakPatterns.join(', ')}`)
    if (metrics.hasInternalHtmlKeys) errors.push('internal keys present in HTML')

    if (errors.length > 0) failed = true

    results.push({
      viewport: viewport.name,
      httpStatus: response?.status() ?? null,
      screenshot,
      metrics,
      errors,
    })

    console.log(`[verify-report] ${viewport.name} HTTP ${response?.status()} overflow=${metrics.scrollWidth}/${metrics.clientWidth} category=${metrics.hasCategory} screenshot=${screenshot}`)
    if (errors.length > 0) console.error(`[verify-report] ${viewport.name} FAIL ${errors.join('; ')}`)
    await context.close()
  }
} finally {
  await browser.close()
}

const manifest = {
  url,
  label,
  generatedAt: new Date().toISOString(),
  results,
  ok: !failed,
}
const manifestPath = resolve(OUT_DIR, `${label}-manifest.json`)
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
console.log(`[verify-report] manifest=${manifestPath}`)

if (failed) process.exit(1)
