// Focused TASK-1334 verifier for the category perception section.
//
// It starts a local Greenhouse-shaped fixture API and an Astro dev server pointed
// at that API, then validates mapped/unknown/needs_review/legacy states across
// desktop, laptop and mobile viewports.

import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'
import net from 'node:net'

const label = process.argv[2] ?? 'task1334-category-renderer'
const OUT_DIR = resolve('.captures', `${label}-${new Date().toISOString().replace(/[:.]/g, '-')}`)
const viewports = [
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'laptop-1280', width: 1280, height: 900 },
  { name: 'mobile-390', width: 390, height: 844 },
]

const forbiddenVisiblePatterns = [
  /ambiguousCount/i,
  /unmappedCount/i,
  /mid_category/i,
  /service_line/i,
  /adjacent_capability/i,
  /product_or_service/i,
  /canonical signals/i,
  /\bambiguas\b/i,
  /\bNaN\b/,
  /providerFindings/i,
  /accuracyFindings/i,
  /normalized_findings/i,
  /execution_prompts/i,
]

const baseModel = {
  headline: { frame: 'Snapshot de visibilidad en IA' },
  gate: { status: 'auto_releasable' },
  overallScore: 58,
  overallSeverity: 'atencion',
  perceptionAxisScore: 52,
  agenticAxisScore: 64,
  levels: [
    { id: 'found', axis: 'perception', score: 78, severity: 'optimo', status: 'measured' },
    { id: 'readable', axis: 'perception', score: 61, severity: 'atencion', status: 'measured' },
    { id: 'correct', axis: 'perception', score: 48, severity: 'atencion', status: 'measured' },
    { id: 'actionable', axis: 'agentic', score: 64, severity: 'atencion', status: 'measured' },
    { id: 'intrinsic', axis: 'perception', score: null, severity: 'sin_dato', status: 'coverage' },
  ],
  dimensions: [
    { label: 'AI Visibility', score: 62, severity: 'atencion' },
    { label: 'Entity Clarity', score: 58, severity: 'atencion' },
    { label: 'Category Ownership', score: 43, severity: 'atencion' },
  ],
  recommendations: [{ title: 'Refuerza la evidencia propia de categoría', severity: 'atencion' }],
  primaryGap: { title: 'La categoría todavía necesita más evidencia propia', severity: 'atencion' },
  engineSnapshot: [
    { provider: 'openai', present: 2, resolved: 4 },
    { provider: 'anthropic', present: 1, resolved: 4 },
    { provider: 'perplexity', present: 2, resolved: 4 },
  ],
  citationSourceBreakdown: {
    totalCitations: 6,
    uniqueDomains: 3,
    domains: [
      { domain: 'efeoncepro.com', count: 3, engines: ['chatgpt', 'claude'], classification: 'own_domain' },
      { domain: 'think.efeoncepro.com', count: 2, engines: ['perplexity'], classification: 'own_domain' },
    ],
  },
  readiness: {
    structural: {
      axis: 'structural',
      overallScore: 70,
      severity: 'optimo',
      coverage: { probed: 5, measured: 4 },
      dimensions: [],
    },
  },
  sentimentSummary: { positive: 2, neutral: 1, negative: 0, mixed: 0, evaluated: 3, net: 'positivo' },
  provenance: { providersSampled: ['openai', 'anthropic', 'perplexity'], promptCount: 8, scoreVersion: 'test' },
  viewFacts: {
    shareFacts: {
      graderUrl: 'https://efeoncepro.com/aeo-2/',
      scoreText: '58/100',
      shareOfModelText: 'presencia parcial',
      citabilityText: '6 citas',
      providersText: 'ChatGPT · Claude · Perplexity',
    },
  },
}

const scenarios = {
  mapped: {
    token: 'task-1334-mapped',
    expectedStatus: 'mapped',
    expectsRows: true,
    expectsSection: true,
    model: {
      ...baseModel,
      categoryTaxonomySummary: {
        status: 'mapped',
        taxonomyVersion: 'category_taxonomy_v1',
        totalSignals: 9,
        categories: [
          {
            nodeId: 'sector:banking_insurance',
            level: 'sector',
            label: { es: 'Banca y seguros', en: 'Banking and insurance' },
            count: 5,
          },
          {
            nodeId: 'product_service_category:ai_visibility',
            level: 'product_service_category',
            label: { es: 'Visibilidad en IA', en: 'AI visibility' },
            count: 4,
          },
        ],
      },
    },
  },
  unknown: {
    token: 'task-1334-unknown',
    expectedStatus: 'unknown',
    expectsRows: false,
    expectsSection: true,
    model: {
      ...baseModel,
      categoryTaxonomySummary: {
        status: 'unknown',
        taxonomyVersion: 'category_taxonomy_v1',
        totalSignals: 0,
        categories: [],
      },
    },
  },
  needs_review: {
    token: 'task-1334-needs-review',
    expectedStatus: 'needs_review',
    expectsRows: false,
    expectsSection: true,
    model: {
      ...baseModel,
      categoryTaxonomySummary: {
        status: 'needs_review',
        taxonomyVersion: 'category_taxonomy_v1',
        totalSignals: 2,
        ambiguousCount: 1,
        unmappedCount: 1,
        categories: [],
      },
    },
  },
  legacy: {
    token: 'task-1334-legacy',
    expectedStatus: null,
    expectsRows: false,
    expectsSection: false,
    model: { ...baseModel },
  },
  malformed: {
    token: 'task-1334-malformed',
    expectedStatus: 'unknown',
    expectsRows: false,
    expectsSection: true,
    model: {
      ...baseModel,
      categoryTaxonomySummary: {
        status: 'mapped',
        taxonomyVersion: 'category_taxonomy_v1',
        totalSignals: -5,
        categories: [
          { nodeId: 'sector:test', level: 'sector', label: { es: 'Sector de prueba' }, count: Number.NaN },
        ],
      },
    },
  },
}

async function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = net.createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : null
      server.close(() => {
        if (!port) reject(new Error('Could not resolve free port'))
        else resolvePort(port)
      })
    })
  })
}

function startFixtureApi(port) {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`)
    const token = url.pathname.split('/').pop()
    const scenario = Object.values(scenarios).find((candidate) => candidate.token === token)

    if (!scenario || !url.pathname.startsWith('/api/public/growth/ai-visibility/report/')) {
      res.writeHead(404, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: 'not_found' }))
      return
    }

    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({
      header: {
        organizationName: `Fixture ${scenario.expectedStatus ?? 'legacy'}`,
        reportDate: '4 jul 2026',
        periodLabel: 'Fixture TASK-1334',
      },
      modelVersion: '1.1.0',
      runPublicId: `EO-GRUN-1334-${scenario.token.split('-').pop()?.toUpperCase() ?? 'FIX'}`,
      report: { publicSafeFixture: true },
      model: scenario.model,
    }))
  })

  return new Promise((resolveServer) => {
    server.listen(port, '127.0.0.1', () => resolveServer(server))
  })
}

async function runCommand(command, args, env) {
  await new Promise((resolveCommand, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    child.stdout.on('data', (chunk) => process.stdout.write(`[${args[1] ?? command}] ${chunk}`))
    child.stderr.on('data', (chunk) => process.stderr.write(`[${args[1] ?? command}] ${chunk}`))
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolveCommand()
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`))
    })
  })
}

async function waitFor(url, labelName) {
  const started = Date.now()
  let lastError
  while (Date.now() - started < 30000) {
    try {
      const response = await fetch(url)
      if (response.status < 500) return
    } catch (error) {
      lastError = error
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 400))
  }
  throw new Error(`Timed out waiting for ${labelName}: ${lastError?.message ?? 'no response'}`)
}

mkdirSync(OUT_DIR, { recursive: true })

const apiPort = await getFreePort()
const astroPort = await getFreePort()
const fixtureApi = await startFixtureApi(apiPort)
const astroEnv = {
  ...process.env,
  GREENHOUSE_API_BASE: `http://127.0.0.1:${apiPort}`,
}
await runCommand('pnpm', ['astro', 'dev', '--host', '127.0.0.1', '--port', String(astroPort), '--force'], astroEnv)
const browser = await chromium.launch()

const results = []
let failed = false

try {
  await waitFor(`http://127.0.0.1:${astroPort}/brand-visibility/r/${scenarios.unknown.token}`, 'Astro dev')

  for (const [scenarioName, scenario] of Object.entries(scenarios)) {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()
      const url = `http://127.0.0.1:${astroPort}/brand-visibility/r/${scenario.token}`
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      await page.evaluate(async () => {
        const max = document.body.scrollHeight
        for (let y = 0; y < max; y += 520) {
          window.scrollTo(0, y)
          await new Promise((resolveScroll) => setTimeout(resolveScroll, 20))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(250)

      const metrics = await page.evaluate((patterns) => {
        const text = document.body.innerText
        const section = document.querySelector('[data-capture="report-category-association"]')
        const leaks = patterns.filter((pattern) => new RegExp(pattern.source, pattern.flags).test(text))
        const sectionText = section?.textContent ?? ''
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasSection: Boolean(section),
          categoryStatus: section?.getAttribute('data-category-status') ?? null,
          hasRows: Boolean(document.querySelector('[data-capture="report-category-rows"]')),
          hasMappedPanel: Boolean(document.querySelector('[data-capture="report-category-mapped"]')),
          hasEmptyPanel: Boolean(document.querySelector('[data-capture="report-category-empty"]')),
          hasReviewPanel: Boolean(document.querySelector('[data-capture="report-category-review"]')),
          sectionText,
          visibleLeakPatterns: leaks.map((pattern) => pattern.source),
        }
      }, forbiddenVisiblePatterns.map((pattern) => ({ source: pattern.source, flags: pattern.flags })))

      const fullPagePath = resolve(OUT_DIR, `${scenarioName}-${viewport.name}.png`)
      await page.screenshot({ path: fullPagePath, fullPage: true })
      const sectionPath = resolve(OUT_DIR, `${scenarioName}-${viewport.name}-category.png`)
      const section = page.locator('[data-capture="report-category-association"]')
      if (await section.count()) await section.first().screenshot({ path: sectionPath })

      const errors = []
      if ((response?.status() ?? 0) !== 200) errors.push(`HTTP ${response?.status()}`)
      if (metrics.scrollWidth > metrics.clientWidth) errors.push(`overflow ${metrics.scrollWidth}/${metrics.clientWidth}`)
      if (metrics.hasSection !== scenario.expectsSection) errors.push(`section expected=${scenario.expectsSection} actual=${metrics.hasSection}`)
      if (scenario.expectedStatus && metrics.categoryStatus !== scenario.expectedStatus) {
        errors.push(`status expected=${scenario.expectedStatus} actual=${metrics.categoryStatus}`)
      }
      if (metrics.hasRows !== scenario.expectsRows) errors.push(`rows expected=${scenario.expectsRows} actual=${metrics.hasRows}`)
      if (scenarioName === 'mapped' && !/Banca y seguros/.test(metrics.sectionText)) errors.push('mapped label missing')
      if (scenarioName === 'unknown' && !metrics.hasEmptyPanel) errors.push('unknown empty panel missing')
      if (scenarioName === 'needs_review' && !metrics.hasReviewPanel) errors.push('needs_review panel missing')
      if (metrics.visibleLeakPatterns.length > 0) errors.push(`visible leaks: ${metrics.visibleLeakPatterns.join(', ')}`)

      if (errors.length > 0) failed = true
      results.push({
        scenario: scenarioName,
        viewport: viewport.name,
        httpStatus: response?.status() ?? null,
        screenshots: {
          fullPage: fullPagePath,
          category: metrics.hasSection ? sectionPath : null,
        },
        metrics,
        errors,
      })

      console.log(`[verify-category] ${scenarioName}/${viewport.name} HTTP ${response?.status()} status=${metrics.categoryStatus ?? 'none'} overflow=${metrics.scrollWidth}/${metrics.clientWidth} rows=${metrics.hasRows}`)
      if (errors.length > 0) console.error(`[verify-category] ${scenarioName}/${viewport.name} FAIL ${errors.join('; ')}`)
      await context.close()
    }
  }
} finally {
  await browser.close()
  await runCommand('pnpm', ['astro', 'dev', 'stop'], astroEnv).catch((error) => {
    console.error(`[verify-category] Could not stop Astro dev server: ${error.message}`)
  })
  fixtureApi.close()
}

const manifest = {
  label,
  generatedAt: new Date().toISOString(),
  astroUrl: `http://127.0.0.1:${astroPort}`,
  fixtureApi: `http://127.0.0.1:${apiPort}`,
  results,
  ok: !failed,
}
const manifestPath = resolve(OUT_DIR, 'manifest.json')
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
console.log(`[verify-category] manifest=${manifestPath}`)

if (failed) process.exit(1)
