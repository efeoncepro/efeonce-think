// Verificacion visual/runtime de la landing Brand Visibility en efeonce-think.
//
// Uso:
//   node scripts/verify-brand-visibility-landing.mjs <url> <label>
//
// Cubre TASK-1327:
// - capturas desktop 1440, laptop 1280 y mobile 390;
// - scrollWidth <= clientWidth;
// - landing indexable;
// - host <greenhouse-form> presente con form-key/surface correctos;
// - no formulario local fuera del web component;
// - no scores, porcentajes ni progreso inventado antes del run.

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2).filter((arg) => arg !== '--')
const url = args[0]
const label = args[1] ?? 'brand-visibility-landing'

if (!url) {
  console.error('Uso: node scripts/verify-brand-visibility-landing.mjs <url> <label>')
  process.exit(1)
}

const OUT_DIR = resolve('.captures')
const viewports = [
  { name: 'desktop-1440', width: 1440, height: 1024 },
  { name: 'laptop-1280', width: 1280, height: 900 },
  { name: 'mobile-390', width: 390, height: 844 },
]

const requiredMarkers = [
  'brand-visibility-landing',
  'brand-visibility-hero',
  'brand-visibility-signal-preview',
  'brand-visibility-form',
  'brand-visibility-report-preview',
  'brand-visibility-flow',
  'brand-visibility-trust',
]

const forbiddenTextPatterns = [
  /\b\d{1,3}\s*\/\s*100\b/i,
  /\b\d{1,3}%\b/i,
  /\bscore\b/i,
  /\brun id\b/i,
  /\breport token\b/i,
  /\bprompt:\s/i,
  /raw provider/i,
  /provider answer/i,
  /providerFindings/i,
  /accuracyFindings/i,
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
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(1800)

    await page.evaluate(async () => {
      const max = document.body.scrollHeight
      for (let y = 0; y < max; y += 480) {
        window.scrollTo(0, y)
        await new Promise((resolve) => setTimeout(resolve, 25))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(500)

    const metrics = await page.evaluate((args) => {
      const { requiredMarkers, forbiddenPatterns } = args
      const text = document.body.innerText
      const missingMarkers = requiredMarkers.filter((marker) => !document.querySelector(`[data-capture="${marker}"]`))
      const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? ''
      const form = document.querySelector('greenhouse-form')
      const localInputs = Array.from(document.querySelectorAll('input, textarea, select')).filter((node) => !node.closest('greenhouse-form'))
      const leaks = forbiddenPatterns.filter((pattern) => new RegExp(pattern.source, pattern.flags).test(text))

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        missingMarkers,
        robots,
        hasFormHost: Boolean(form),
        formKey: form?.getAttribute('form-key') ?? null,
        surface: form?.getAttribute('surface') ?? null,
        localInputCount: localInputs.length,
        hasAnalysisPanel: Boolean(document.querySelector('[data-analysis-panel]')),
        visibleForbiddenText: leaks.map((pattern) => pattern.source),
      }
    }, {
      requiredMarkers,
      forbiddenPatterns: forbiddenTextPatterns.map((pattern) => ({ source: pattern.source, flags: pattern.flags })),
    })

    const screenshot = resolve(OUT_DIR, `${label}-${viewport.name}.png`)
    await page.screenshot({ path: screenshot, fullPage: true })

    await page.evaluate(() => {
      document.querySelector('greenhouse-form')?.dispatchEvent(
        new CustomEvent('gh_form_submission_accepted', {
          bubbles: true,
          composed: true,
          detail: { correlation_id: 'fsub-verifier', success_behavior: 'tokenized_report' },
        }),
      )
    })
    await page.waitForTimeout(300)

    const analysisMetrics = await page.evaluate(() => {
      const panel = document.querySelector('[data-analysis-panel]')
      const formState = document.querySelector('[data-form-state="ready"]')

      return {
        analysisVisible: Boolean(panel && !panel.hasAttribute('hidden')),
        formHidden: Boolean(formState?.hasAttribute('hidden')),
        reportLinkVisible: Boolean(document.querySelector('[data-report-link]:not([hidden])')),
      }
    })
    const analysisScreenshot = resolve(OUT_DIR, `${label}-${viewport.name}-analysis.png`)
    await page.screenshot({ path: analysisScreenshot, fullPage: true })

    const errors = []
    if ((response?.status() ?? 0) !== 200) errors.push(`HTTP ${response?.status()}`)
    if (metrics.scrollWidth > metrics.clientWidth) errors.push(`overflow ${metrics.scrollWidth}/${metrics.clientWidth}`)
    if (metrics.robots && /noindex/i.test(metrics.robots)) errors.push('landing has noindex')
    if (metrics.missingMarkers.length > 0) errors.push(`missing markers: ${metrics.missingMarkers.join(', ')}`)
    if (!metrics.hasFormHost) errors.push('greenhouse-form host missing')
    if (metrics.formKey !== '69cd5269-5f97-4d32-99c4-0b23f41aa2f5') errors.push(`wrong form-key ${metrics.formKey}`)
    if (metrics.surface !== 'fhsf-ai-visibility-grader') errors.push(`wrong surface ${metrics.surface}`)
    if (metrics.localInputCount > 0) errors.push(`local inputs outside greenhouse-form: ${metrics.localInputCount}`)
    if (!metrics.hasAnalysisPanel) errors.push('analysis panel missing')
    if (!analysisMetrics.analysisVisible) errors.push('analysis panel did not open after accepted event')
    if (!analysisMetrics.formHidden) errors.push('form panel did not hide after accepted event')
    if (analysisMetrics.reportLinkVisible) errors.push('report link visible without reportToken')
    if (metrics.visibleForbiddenText.length > 0) errors.push(`forbidden text: ${metrics.visibleForbiddenText.join(', ')}`)

    if (errors.length > 0) failed = true

    results.push({
      viewport: viewport.name,
      httpStatus: response?.status() ?? null,
      screenshot,
      analysisScreenshot,
      metrics,
      analysisMetrics,
      errors,
    })

    console.log(`[verify-landing] ${viewport.name} HTTP ${response?.status()} overflow=${metrics.scrollWidth}/${metrics.clientWidth} screenshot=${screenshot}`)
    if (errors.length > 0) console.error(`[verify-landing] ${viewport.name} FAIL ${errors.join('; ')}`)
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
console.log(`[verify-landing] manifest=${manifestPath}`)

if (failed) process.exit(1)
