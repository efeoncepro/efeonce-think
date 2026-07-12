// Verificación visual y estructural de /seo-surround-discovery (TASK-1387).
//
// Uso:
//   pnpm verify:surround-discovery -- http://127.0.0.1:4321/seo-surround-discovery local
//
// Prueba la composición local (no envía PII ni intenta resolver Turnstile). La
// evidencia de submit real/accepted/download/generate_lead se ejecuta únicamente
// desde Think desplegado, donde el origen está permitido por el Growth Form.

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2).filter((arg) => arg !== '--')
const url = args[0]
const label = args[1] ?? 'surround-discovery-landing'

if (!url) {
  console.error('Uso: pnpm verify:surround-discovery -- <url> [label]')
  process.exit(1)
}

const OUT_DIR = resolve('.captures')
const formKey = 'e8d2bfcc-c4fe-4396-8f3b-08f5ac190409'
const surfaceId = 'fhsf-surround-discovery-ebook'
const markers = [
  'surround-discovery-landing',
  'surround-discovery-hero',
  'surround-discovery-fragmentation',
  'surround-discovery-answer-capsule',
  'surround-discovery-surfaces',
  'surround-discovery-cycle',
  'surround-discovery-relationships',
  'surround-discovery-ebook',
  'surround-discovery-form-section',
  'surround-discovery-form',
  'surround-discovery-faq',
  'surround-discovery-final',
]
const viewports = [
  { name: 'desktop-1440', width: 1440, height: 1024, reducedMotion: 'no-preference' },
  { name: 'mobile-390', width: 390, height: 844, reducedMotion: 'no-preference' },
  { name: 'reduced-motion-1440', width: 1440, height: 1024, reducedMotion: 'reduce' },
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
      reducedMotion: viewport.reducedMotion,
    })
    const page = await context.newPage()
    const consoleErrors = []
    const failedRequests = []
    page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(`console: ${message.text()}`)
    })
    page.on('requestfailed', (request) => failedRequests.push(`${request.url()} :: ${request.failure()?.errorText ?? 'failed'}`))

    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2100)
    const heroScreenshot = resolve(OUT_DIR, `${label}-${viewport.name}-hero.png`)
    await page.screenshot({ path: heroScreenshot })
    let motionMetrics
    let primaryHoverScreenshot = null
    let secondaryHoverScreenshot = null
    if (viewport.reducedMotion === 'reduce') {
      motionMetrics = await page.evaluate(() => ({
        allRevealed: Array.from(document.querySelectorAll('[data-reveal]')).every((item) => item.getAttribute('data-revealed') === 'true'),
        motionMode: document.querySelector('[data-capture="surround-discovery-landing"]')?.getAttribute('data-motion') ?? null,
        heroNodeAnimation: getComputedStyle(document.querySelector('.sd-hero-node--1')).animationName,
        ebookLightCount: document.querySelectorAll('#ebook [data-ebook-light]').length,
        ebookLightAnimations: Array.from(document.querySelectorAll('#ebook [data-ebook-light]')).flatMap((node) => {
          const child = node.firstElementChild
          return [getComputedStyle(node).animationName, child ? getComputedStyle(child).animationName : 'none']
        }),
        cycleBeatAnimation: getComputedStyle(document.querySelector('.sd-cycle__grid li > i')).animationName,
        heroTransform: getComputedStyle(document.querySelector('.sd-hero-map')).transform,
      }))
    } else {
      const motionInitial = await page.evaluate(() => {
        const animation = (selector, pseudo = undefined) => {
          const node = document.querySelector(selector)
          return node ? getComputedStyle(node, pseudo).animationName : null
        }
        const childAnimation = (selector) => {
          const node = document.querySelector(selector)?.firstElementChild
          return node ? getComputedStyle(node).animationName : null
        }

        return {
          heroNodeAnimation: animation('.sd-hero-node--1'),
          haloAnimation: animation('.sd-map-halo'),
          heroWaveAnimation: animation('.sd-map-wave--late', '::before'),
          ebookLightCount: document.querySelectorAll('#ebook [data-ebook-light]').length,
          ebookRaysAnimation: childAnimation('.sd-book-art__light--rays'),
          ebookSpectrumAnimation: childAnimation('.sd-book-art__light--spectrum'),
          auraHueAnimation: animation('.sd-book-art__light--aura'),
          auraBreathAnimation: childAnimation('.sd-book-art__light--aura'),
          shaftAnimation: animation('.sd-book-art__shaft'),
          cycleBeatAnimation: animation('.sd-cycle__grid li > i'),
        }
      })
      await page.mouse.move(Math.max(8, viewport.width - 20), Math.min(500, viewport.height - 20))
      await page.waitForTimeout(20)
      const pointer = await page.evaluate(() => ({
        x: document.querySelector('.sd-hero-map')?.style.getPropertyValue('--px') ?? '',
        y: document.querySelector('.sd-hero-map')?.style.getPropertyValue('--py') ?? '',
      }))
      await page.locator('[data-surface-card="seo"]').hover()
      const highlight = await page.evaluate(() => ({
        nodeTransform: document.querySelector('[data-surface-node="seo"]')?.getAttribute('style') ?? '',
        cardBorder: document.querySelector('[data-surface-card="seo"]')?.style.borderColor ?? '',
        cardShadow: document.querySelector('[data-surface-card="seo"]')?.style.boxShadow ?? '',
      }))
      await page.locator('[data-capture="surround-discovery-hero"] .sd-button--primary').hover()
      await page.waitForTimeout(100)
      const cta = await page.evaluate(() => ({
        transform: getComputedStyle(document.querySelector('[data-capture="surround-discovery-hero"] .sd-button--primary')).transform,
        shineAnimation: getComputedStyle(document.querySelector('[data-capture="surround-discovery-hero"] .sd-button--primary'), '::before').animationName,
      }))
      primaryHoverScreenshot = resolve(OUT_DIR, `${label}-${viewport.name}-hero-primary-hover.png`)
      await page.screenshot({ path: primaryHoverScreenshot })
      await page.locator('[data-capture="surround-discovery-hero"] [data-cta2]').hover()
      await page.waitForTimeout(100)
      const secondaryCta = await page.evaluate(() => ({
        shadow: getComputedStyle(document.querySelector('[data-capture="surround-discovery-hero"] [data-cta2]')).boxShadow,
        arrowTransform: getComputedStyle(document.querySelector('[data-capture="surround-discovery-hero"] [data-cta2] svg')).transform,
      }))
      secondaryHoverScreenshot = resolve(OUT_DIR, `${label}-${viewport.name}-hero-secondary-hover.png`)
      await page.screenshot({ path: secondaryHoverScreenshot })
      await page.locator('[data-card-hover]').first().hover()
      await page.waitForTimeout(100)
      const relationshipCard = await page.evaluate(() => ({
        border: getComputedStyle(document.querySelector('[data-card-hover]')).borderColor,
        shadow: getComputedStyle(document.querySelector('[data-card-hover]')).boxShadow,
      }))
      const rippleCount = await page.evaluate(() => {
        const target = document.querySelector('.sd-header__cta')
        target?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 22, clientY: 22 }))
        return document.querySelectorAll('.sd-ripple').length
      })
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
      await page.waitForTimeout(40)
      const parallax = await page.evaluate(() => ({
        hero: document.querySelector('.sd-hero-map')?.style.getPropertyValue('--sy') ?? '',
        cycle: document.querySelector('.sd-cycle__aura')?.style.getPropertyValue('--sy') ?? '',
        ebook: document.querySelector('.sd-ebook__aura')?.style.getPropertyValue('--sy') ?? '',
        bookAura: document.querySelector('.sd-book-art__parallax')?.style.getPropertyValue('--sy') ?? '',
        book: document.querySelector('.sd-book')?.style.getPropertyValue('--sy') ?? '',
        form: document.querySelector('.sd-form-section__aura--right')?.style.getPropertyValue('--sy') ?? '',
      }))
      motionMetrics = { ...motionInitial, pointer, highlight, cta, secondaryCta, relationshipCard, rippleCount, parallax }
    }
    await page.locator('details summary').first().focus()
    await page.keyboard.press('Enter')
    const firstFaqOpen = await page.locator('details').first().evaluate((details) => details.hasAttribute('open'))
    await page.locator('[data-capture="surround-discovery-hero"] a[href="#form"]').first().click()
    await page.waitForTimeout(2200)

    const metrics = await page.evaluate(({ markers, formKey, surfaceId }) => {
      const missingMarkers = markers.filter((marker) => !document.querySelector(`[data-capture="${marker}"]`))
      const form = document.querySelector('greenhouse-form')
      const localInputs = Array.from(document.querySelectorAll('input, textarea, select')).filter((node) => !node.closest('greenhouse-form'))
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? ''
      const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? ''
      const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).flatMap((node) => {
        try { return [JSON.parse(node.textContent ?? '')] } catch { return [] }
      })
      const entities = jsonLd.flatMap((entry) => entry['@graph'] ?? [entry]).map((entry) => entry['@type'])

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        h1Count: document.querySelectorAll('h1').length,
        missingMarkers,
        formKey: form?.getAttribute('form-key') ?? null,
        surface: form?.getAttribute('surface') ?? null,
        localInputCount: localInputs.length,
        canonical,
        robots,
        jsonLdTypes: entities,
        faqCount: document.querySelectorAll('details').length,
        fiveSurfaces: document.querySelectorAll('[data-surface-card]').length,
        cycleStages: document.querySelectorAll('.sd-cycle__grid > li').length,
        heroNodeIconCount: Array.from(document.querySelectorAll('.sd-hero-node')).filter((node) => Boolean(node.querySelector('svg, .sd-glyph'))).length,
        heroCore: (() => {
          const wrap = document.querySelector('.sd-map-core-wrap')
          const core = document.querySelector('.sd-map-core')
          const halo = document.querySelector('.sd-map-halo')
          return {
            hasWrap: Boolean(wrap),
            hasHalo: Boolean(halo),
            coreDisplay: core ? getComputedStyle(core).display : null,
            coreDirection: core ? getComputedStyle(core).flexDirection : null,
            coreGap: core ? getComputedStyle(core).gap : null,
            labelOffset: core?.querySelector('span') ? getComputedStyle(core.querySelector('span')).marginTop : null,
          }
        })(),
        surfaceMapIconCount: Array.from(document.querySelectorAll('.sd-surface-map__node')).filter((node) => Boolean(node.querySelector('svg, .sd-glyph'))).length,
        surfaceCardIconCount: Array.from(document.querySelectorAll('.sd-surface-cards article')).filter((node) => Boolean(node.querySelector('svg, .sd-glyph'))).length,
        googleGlyphPathCounts: Array.from(document.querySelectorAll('.sd-glyph--google')).map((node) => node.querySelectorAll('path').length),
        unresolvedComponentCount: document.querySelectorAll('component').length,
        externalFontOrIconStylesheet: Boolean(document.querySelector('link[href*="fonts.googleapis"], link[href*="fonts.gstatic"], link[href*="@tabler/icons-webfont"], link[href*="cdn.jsdelivr.net/npm/@tabler"]')),
        supportRuntimeLoaded: Array.from(document.scripts).some((script) => script.src.includes('support.js')),
        closingSecondaryCta: document.querySelector('[data-capture="surround-discovery-final"] a[href="/brand-visibility"]')?.textContent?.trim() ?? '',
        smallTouchTargets: Array.from(document.querySelectorAll('.sd-header__cta, .sd-surface-cards article a, .sd-footer a')).flatMap((node) => {
          const rect = node.getBoundingClientRect()
          return rect.height < 44 ? [`${node.textContent?.trim() || node.getAttribute('href')}:${Math.round(rect.height)}`] : []
        }),
        formTargetInViewport: (() => {
          const target = document.querySelector('#form')?.getBoundingClientRect()
          return Boolean(target && target.top < window.innerHeight && target.bottom > 0)
        })(),
        heroCtaTarget: document.querySelector('[data-capture="surround-discovery-hero"] a[href="#form"]')?.getAttribute('href') ?? null,
        answerCapsule: document.querySelector('[data-capture="surround-discovery-answer-capsule"]')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
        ctaEvents: Array.from(window.dataLayer ?? []).filter((entry) => entry?.event === 'gh_surround_discovery_cta_click'),
        internalPlatformCopyLeak: /Greenhouse Growth Forms/i.test(document.body.textContent ?? ''),
        reducedOpacity: getComputedStyle(document.querySelector('.reveal') ?? document.body).opacity,
        expected: { formKey, surfaceId },
      }
    }, { markers, formKey, surfaceId })

    const readyScreenshot = resolve(OUT_DIR, `${label}-${viewport.name}-form-ready.png`)
    await page.screenshot({ path: readyScreenshot })

    const acceptedMetrics = await page.evaluate(async () => {
      const dock = document.querySelector('[data-surround-form-dock]')
      const form = dock?.querySelector('greenhouse-form')
      const rendererCard = document.createElement('button')
      rendererCard.id = 'surround-renderer-success-probe'
      rendererCard.className = 'ghf-success-card'
      rendererCard.tabIndex = -1
      form?.append(rendererCard)
      const preventSyntheticDownloadNavigation = (event) => event.preventDefault()
      document.addEventListener('click', preventSyntheticDownloadNavigation, true)
      dock?.dispatchEvent(new CustomEvent('gh_form_submission_accepted', {
        bubbles: true,
        composed: true,
        detail: { download_url: 'https://greenhouse.efeoncepro.com/api/public/growth/forms/efeonce-surround-discovery-ebook/asset/fsub-probe' },
      }))
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      document.removeEventListener('click', preventSyntheticDownloadNavigation, true)

      return {
        readyVisible: !document.querySelector('[data-form-state="ready"]')?.hidden,
        recoveryVisible: !document.querySelector('[data-form-state="recovery"]')?.hidden,
        recoveryHref: document.querySelector('[data-redownload]')?.href ?? '',
        rendererCardVisible: Boolean(document.querySelector('.ghf-success-card')),
        sectionComplete: document.querySelector('[data-capture="surround-discovery-form-section"]')?.getAttribute('data-form-complete') ?? '',
        railCompleteVisible: !document.querySelector('[data-form-rail-state="complete"]')?.hidden,
        activeId: document.activeElement?.id ?? null,
      }
    })

    const degradedMetrics = await page.evaluate(() => {
      const dock = document.querySelector('[data-surround-form-dock]')
      dock?.dispatchEvent(new CustomEvent('gh_form_submission_accepted', { bubbles: true, composed: true, detail: {} }))
      return {
        readyHidden: document.querySelector('[data-form-state="ready"]')?.hidden ?? false,
        degradedVisible: !document.querySelector('[data-form-state="degraded"]')?.hidden,
        activeId: document.activeElement?.id ?? null,
      }
    })

    const degradedScreenshot = resolve(OUT_DIR, `${label}-${viewport.name}-form-degraded.png`)
    await page.screenshot({ path: degradedScreenshot })
    const errors = []
    if ((response?.status() ?? 0) !== 200) errors.push(`HTTP ${response?.status()}`)
    if (metrics.scrollWidth > metrics.clientWidth) errors.push(`overflow ${metrics.scrollWidth}/${metrics.clientWidth}`)
    if (metrics.h1Count !== 1) errors.push(`expected one H1, got ${metrics.h1Count}`)
    if (metrics.missingMarkers.length) errors.push(`missing markers: ${metrics.missingMarkers.join(', ')}`)
    if (metrics.formKey !== formKey) errors.push(`wrong form key: ${metrics.formKey}`)
    if (metrics.surface !== surfaceId) errors.push(`wrong surface: ${metrics.surface}`)
    if (metrics.localInputCount) errors.push(`local inputs outside renderer: ${metrics.localInputCount}`)
    if (!metrics.canonical.endsWith('/seo-surround-discovery')) errors.push(`wrong canonical: ${metrics.canonical}`)
    if (/noindex/i.test(metrics.robots)) errors.push('landing has noindex')
    if (!metrics.jsonLdTypes.includes('Book') || !metrics.jsonLdTypes.includes('FAQPage') || !metrics.jsonLdTypes.includes('WebPage') || !metrics.jsonLdTypes.includes('DefinedTerm')) errors.push(`incomplete JSON-LD: ${metrics.jsonLdTypes.join(', ')}`)
    if (!/Surround Discovery™ es el sistema de Efeonce/i.test(metrics.answerCapsule) || !/SENSE, SHAPE, SURFACE y SOLVE/i.test(metrics.answerCapsule)) errors.push('answer capsule is missing or not self-contained')
    if (metrics.faqCount !== 6) errors.push(`expected 6 FAQs, got ${metrics.faqCount}`)
    if (metrics.fiveSurfaces !== 5) errors.push(`expected 5 surfaces, got ${metrics.fiveSurfaces}`)
    if (metrics.heroNodeIconCount !== 5 || metrics.surfaceMapIconCount !== 5 || metrics.surfaceCardIconCount !== 5) errors.push(`approved source icons missing: hero=${metrics.heroNodeIconCount} map=${metrics.surfaceMapIconCount} cards=${metrics.surfaceCardIconCount}`)
    if (!metrics.googleGlyphPathCounts.length || metrics.googleGlyphPathCounts.some((count) => count !== 4)) errors.push(`SEO Google glyph is not the 4-path Google G: ${metrics.googleGlyphPathCounts.join(', ')}`)
    if (!metrics.heroCore.hasWrap || !metrics.heroCore.hasHalo || metrics.heroCore.coreDisplay !== 'flex' || metrics.heroCore.coreDirection !== 'column' || metrics.heroCore.coreGap !== '2px' || metrics.heroCore.labelOffset !== '0px') errors.push(`approved Discovery core mapping mismatch: ${JSON.stringify(metrics.heroCore)}`)
    if (metrics.unresolvedComponentCount) errors.push(`Astro rendered ${metrics.unresolvedComponentCount} unresolved component tag(s)`)
    if (metrics.externalFontOrIconStylesheet) errors.push('landing still loads external Google/Tabler font or icon stylesheet')
    if (!/Medir visibilidad en IA/i.test(metrics.closingSecondaryCta)) errors.push('closing section does not expose the secondary AI visibility path')
    if (metrics.smallTouchTargets.length) errors.push(`touch targets under 44px: ${metrics.smallTouchTargets.join(', ')}`)
    if (metrics.cycleStages !== 4) errors.push(`expected 4 S4 stages, got ${metrics.cycleStages}`)
    if (metrics.supportRuntimeLoaded) errors.push('approved source support.js was copied into Think')
    if (metrics.heroCtaTarget !== '#form') errors.push(`wrong hero CTA target: ${metrics.heroCtaTarget}`)
    if (!metrics.ctaEvents.some((entry) => entry.location === 'hero-primary' && entry.href === '#form')) errors.push(`CTA telemetry missing hero-primary event: ${JSON.stringify(metrics.ctaEvents)}`)
    if (metrics.internalPlatformCopyLeak) errors.push('internal platform copy leaked into public landing')
    if (!metrics.formTargetInViewport) errors.push('hero CTA did not reach form dock')
    if (!firstFaqOpen) errors.push('FAQ does not open with keyboard')
    if (!acceptedMetrics.readyVisible || !acceptedMetrics.recoveryVisible || !acceptedMetrics.rendererCardVisible || !acceptedMetrics.recoveryHref.endsWith('/asset/fsub-probe') || acceptedMetrics.activeId !== 'surround-renderer-success-probe') errors.push('accepted download does not preserve the governed success card and recovery link')
    if (acceptedMetrics.sectionComplete !== 'true' || !acceptedMetrics.railCompleteVisible) errors.push('accepted download does not switch the form rail to the completed state')
    if (!degradedMetrics.readyHidden || !degradedMetrics.degradedVisible || degradedMetrics.activeId !== 'surround-discovery-degraded-title') errors.push('degraded recovery state is not focus-safe')
    if (viewport.reducedMotion === 'reduce' && metrics.reducedOpacity !== '1') errors.push(`reduced-motion content not visible (${metrics.reducedOpacity})`)
    if (viewport.reducedMotion === 'reduce') {
      if (!motionMetrics.allRevealed || motionMetrics.motionMode !== null) errors.push('reduced-motion reveal mode is not static')
      if (motionMetrics.ebookLightCount !== 4) errors.push(`ebook light layer count mismatch in reduced-motion: ${motionMetrics.ebookLightCount}`)
      if ([motionMetrics.heroNodeAnimation, motionMetrics.cycleBeatAnimation, ...motionMetrics.ebookLightAnimations].some((animation) => animation !== 'none')) errors.push('reduced-motion leaves decorative animation active')
      if (motionMetrics.heroTransform !== 'none') errors.push(`reduced-motion leaves hero parallax active (${motionMetrics.heroTransform})`)
    } else {
      const richMotionMetrics = /** @type {Record<string, any>} */ (motionMetrics)
      if (richMotionMetrics.ebookLightCount !== 4) errors.push(`ebook light layer count mismatch: ${richMotionMetrics.ebookLightCount}`)
      const expectedAnimations = ['sd-float-a', 'sd-halo-pulse', 'sd-wave', 'sd-spin', 'sd-spin', 'sd-aura-hue', 'sd-aura', 'sd-shaft-breath', 'sd-beat']
      const actualAnimations = [richMotionMetrics.heroNodeAnimation, richMotionMetrics.haloAnimation, richMotionMetrics.heroWaveAnimation, richMotionMetrics.ebookRaysAnimation, richMotionMetrics.ebookSpectrumAnimation, richMotionMetrics.auraHueAnimation, richMotionMetrics.auraBreathAnimation, richMotionMetrics.shaftAnimation, richMotionMetrics.cycleBeatAnimation]
      if (expectedAnimations.some((animation, index) => actualAnimations[index] !== animation)) errors.push(`motion animation mapping mismatch: ${actualAnimations.join(', ')}`)
      if (viewport.width > 560 && (!richMotionMetrics.pointer.x || !richMotionMetrics.pointer.y)) errors.push('hero constellation does not respond to pointer movement')
      if (!/scale\(1\.14\)/.test(richMotionMetrics.highlight.nodeTransform) || richMotionMetrics.highlight.cardBorder !== 'var(--sd-teal)' || !richMotionMetrics.highlight.cardShadow) errors.push('surface-to-card hover cross-highlight is incomplete')
      if (richMotionMetrics.cta.transform === 'none' || richMotionMetrics.cta.shineAnimation !== 'sd-cta-shine') errors.push('primary CTA luminous hover is incomplete')
      if (richMotionMetrics.secondaryCta.shadow === 'none' || richMotionMetrics.secondaryCta.arrowTransform === 'none') errors.push('secondary CTA lift, glow, and arrow response are incomplete')
      if (!richMotionMetrics.relationshipCard.shadow || !/var\(--sd-teal\)|rgb/.test(richMotionMetrics.relationshipCard.border)) errors.push('relationship card hover is incomplete')
      if (richMotionMetrics.rippleCount !== 1) errors.push('pointer ripple did not render')
      if (Object.values(richMotionMetrics.parallax).some((value) => !value)) errors.push('scroll parallax did not set all approved layers')
    }

    // Local previews intentionally have a non-authorized origin for the production
    // renderer. The structural verifier neither submits PII nor treats this CORS
    // guardrail as an app regression; deployment smoke must still be clean.
    const unexpectedConsoleErrors = consoleErrors.filter((error) => !/greenhouse\.efeoncepro\.com|CORS policy|Failed to load resource/i.test(error))
    if (unexpectedConsoleErrors.length) errors.push(...unexpectedConsoleErrors)
    if (errors.length) failed = true

    results.push({ viewport: viewport.name, httpStatus: response?.status() ?? null, heroScreenshot, primaryHoverScreenshot, secondaryHoverScreenshot, readyScreenshot, degradedScreenshot, metrics, motionMetrics, acceptedMetrics, degradedMetrics, consoleErrors, failedRequests, errors })
    console.log(`[verify-surround] ${viewport.name} HTTP ${response?.status()} overflow=${metrics.scrollWidth}/${metrics.clientWidth} ready=${readyScreenshot}`)
    if (errors.length) console.error(`[verify-surround] ${viewport.name} FAIL ${errors.join('; ')}`)
    await context.close()
  }
} finally {
  await browser.close()
}

const manifestPath = resolve(OUT_DIR, `${label}-manifest.json`)
writeFileSync(manifestPath, JSON.stringify({ url, label, generatedAt: new Date().toISOString(), results, ok: !failed }, null, 2))
console.log(`[verify-surround] manifest=${manifestPath}`)
if (failed) process.exit(1)
