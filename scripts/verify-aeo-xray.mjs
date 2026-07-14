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
/** El FLOW: cuatro pantallas. Los gates de HTML corren sobre TODAS — un `ld+json` filtrado en
 *  la pantalla ④ es igual de grave que en la ①. El acoplamiento vive en la ③. */
const STEPS = ['', 'articulo', 'radiografia', 'atomizacion']
const ROUTE = `/muestras/${SLUG}/radiografia/`
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
const pageOf = step => `dist/client/muestras/${SLUG}${step ? `/${step}` : ''}/index.html`
for (const st of STEPS) {
  if (!existsSync(pageOf(st))) {
    console.error(`✗ No se generó ${pageOf(st)}`)
    process.exit(1)
  }
}
const pages = Object.fromEntries(STEPS.map(st => [st || 'index', readFileSync(pageOf(st), 'utf8')]))
/** La ③ es la que lleva el acoplamiento y el instrumento; los gates puntuales van contra ella. */
const html = pages.radiografia
const allHtml = Object.values(pages).join('\n')

console.log('\n▸ HTML servido (build estático)\n')

// 1. 🔴 EL ASSERT QUE MÁS IMPORTA.
const ldjson = allHtml.match(/<script[^>]*type=["']application\/ld\+json["']/gi) ?? []
check(
  '1. Cero <script type="application/ld+json"> en NINGUNA de las 4 pantallas',
  ldjson.length === 0,
  `encontrados ${ldjson.length}. Publicar schema con author/publisher del cliente en nuestro dominio = dato estructurado falso.`,
)

// 2. noindex
const noindexAll = STEPS.every(st => /name=["']robots["'][^>]*noindex/i.test(pages[st || 'index']))
check('2. noindex en las 4 pantallas', noindexAll)

// 3. Fuera del sitemap
const sitemaps = ['dist/client/sitemap-index.xml', 'dist/client/sitemap-0.xml'].filter(existsSync)
const inSitemap = sitemaps.some(f => readFileSync(f, 'utf8').includes('/muestras/'))
check('3. La ruta NO aparece en el sitemap', !inSitemap, sitemaps.length ? 'aparece en el sitemap' : 'no se generó sitemap')

// 4. Rótulo
const rotuloAll = STEPS.every(st => pages[st || 'index'].includes('Ejemplo ilustrativo de Efeonce'))
check('4. Rótulo "Ejemplo ilustrativo de Efeonce" en las 4 pantallas', rotuloAll)

/* 31-33. EL FLOW. Cuatro pantallas, cada una con UN trabajo. La ② es la que arregla de raíz el
   «se ve plano»: el artículo por fin tiene la pantalla entera para ser LEÍDO. */
check('31. El artículo (②) se sirve SIN acoplamiento — ahí se lee, no se inspecciona', !pages.articulo.includes('data-couple='))
check('32. La radiografía (③) SÍ tiene el acoplamiento', html.includes('data-couple='))
const railAll = STEPS.every(st => (pages[st || 'index'].match(/class="xr-step"/g) ?? []).length >= 3)
check('33. El riel avisa en las 4 pantallas que el recorrido tiene más', railAll)
check('34. La atomización (④) declara la línea de sangre al bloque del artículo', /atom[\s\S]*data-couple-target/.test(pages.atomizacion))

/* 34b. LA MUESTRA SE DEFIENDE SOLA — nunca cita NUESTROS documentos.
   La ④ abría con «Nuestra oferta dice, textual: …». Le hablaba al comité sobre NUESTRO PDF, no
   sobre su negocio: convertía la muestra en una nota al pie de la propuesta en vez de una pieza
   que se sostiene por sí misma, y quedaba huérfana el día que se mande el enlace sin la oferta
   adjunta. Además rompe la reutilización: el motor es genérico, esa línea era de la licitación.
   Citar las BASES del cliente sí vale (es SU documento, y hablar su idioma suma). Citar la
   oferta propia, no. */
const autoreferencia = /nuestra oferta|nuestra propuesta|la oferta dice|esta propuesta|nuestro documento/i
const paginasAutoref = STEPS.filter(st => autoreferencia.test(pages[st || 'index']))
check(
  '34b. El copy visible NUNCA cita nuestra propia oferta (la muestra se defiende sola)',
  paginasAutoref.length === 0,
  `pantallas que hablan de nuestro PDF: ${paginasAutoref.map(s => s || '(el hueco)').join(', ')}`,
)

/* 42b. CADA CIFRA DE LA ④, CON SU FUENTE.
   La ④ afirmaba tres cifras —«#1», «3×», «4»— con CERO <cite>, mientras la ① citaba 3 veces
   y la ③ cinco. Justo en la pantalla que CIERRA el argumento, y en la pieza cuya tesis entera
   es que una cifra sin fuente es una opinión con números. El schema ya lo obliga (`source` +
   `asOf` en cada átomo); esto verifica que además se RENDERICE — un dato obligatorio que no
   se pinta no le sirve de nada al evaluador que lo quiere comprobar. */
const atomCards = (pages.atomizacion.match(/<article class="atom"/g) ?? []).length
const atomCites = (pages.atomizacion.match(/<cite class="atom-cite"/g) ?? []).length
check(
  '42b. Cada cifra de la atomización (④) se muestra con su fuente y su fecha',
  atomCards > 0 && atomCites === atomCards,
  `${atomCites} citas para ${atomCards} átomos`,
)
/* View transitions: sin ellas, cuatro pantallas se sienten como cuatro páginas sueltas. */
check('35. View transitions cross-document activas (CSS puro, cero JS)', allHtml.includes('view-transition') || /@view-transition/.test(readFileSync('src/styles/aeo-xray.css', 'utf8')))

// 5. Todo <img> con alt no vacío
const imgs = html.match(/<img[^>]*>/gi) ?? []
const badAlt = imgs.filter(t => !/\salt=["'][^"']{5,}["']/i.test(t))
check(`5. Las ${imgs.length} imágenes tienen alt no vacío`, imgs.length > 0 && badAlt.length === 0, `${badAlt.length} sin alt útil`)

/* 6. Crédito + licencia por imagen — PROVEEDOR-AGNÓSTICO.
   Antes matcheaba `creativecommons.org|commons.wikimedia.org` literal. El assert se ató al
   proveedor del día y se cayó solo cuando las fotos pasaron a ser stock licenciado — y eso NO
   es una regresión, es un cambio legítimo. Lo que hay que blindar es el CONTRATO (cada foto
   declara autoría y ENLAZA su licencia), no el dominio de quien la emite. */
const creditRows = html.match(/<p class="credit"[^>]*>[\s\S]*?<\/p>/g) ?? []
const licRows = html.match(/<span class="lic-c"[^>]*>[\s\S]*?<\/span>/g) ?? []
const rows = [...creditRows, ...licRows]
const linked = rows.filter(r => /<a[^>]+href="https?:\/\//i.test(r))
check(
  '6. Cada imagen declara autoría y ENLAZA su licencia (sea cual sea el proveedor)',
  creditRows.length >= 4 && licRows.length >= 4 && linked.length === rows.length,
  `${creditRows.length} créditos · ${licRows.length} filas del pie · ${linked.length}/${rows.length} con licencia enlazada`,
)

/* 40-41. EL CONTRATO DEL ACOPLAMIENTO — huérfanos y fantasmas.
   Un bloque acoplable PROMETE que hay algo al otro lado: se ilumina, invita a pasar el
   cursor, ofrece foco de teclado. Si el instrumento no lo referencia, la promesa se rompe
   en silencio — no falla nada, simplemente no pasa nada. Es peor que no acoplarlo.
   Pasó de verdad: 4 de las 6 cápsulas quedaron huérfanas al agregar secciones, porque el
   instrumento declaraba la técnica UNA vez y el artículo la aplica SEIS.
   El espejo del bug es el fantasma: un nodo que apunta a un bloque que ya no existe (pasa
   al renombrar un coupleId). Los dos se cazan con el mismo par de conjuntos. */
const payload = JSON.parse(readFileSync(`src/content/aeo-xray/${SAMPLE}.json`, 'utf8'))
const artIds = new Set(payload.article.blocks.filter(b => b.coupleId).map(b => b.coupleId))
const instIds = new Set([
  ...['seo', 'og', 'craft', 'jsonld', 'alts'].flatMap(k => payload.machine[k].map(x => x.coupleId)),
  payload.machine.headings.coupleId,
  ...payload.machine.headings.tree.map(x => x.coupleId),
  ...payload.evidence.facts.map(x => x.coupleId),
  ...payload.evidence.fanOut.items.map(x => x.coveredBy),
])
const orphans = [...artIds].filter(id => !instIds.has(id))
const ghosts = [...instIds].filter(id => !artIds.has(id))
check(
  '40. Cero bloques HUÉRFANOS — ninguno se ilumina contra la nada',
  orphans.length === 0,
  `acoplables sin contraparte en el instrumento: ${orphans.join(', ')}`,
)
check(
  '41. Cero nodos FANTASMA — ninguno apunta a un bloque que ya no existe',
  ghosts.length === 0,
  `el instrumento referencia bloques inexistentes: ${ghosts.join(', ')}`,
)

// 7. Toda cifra de evidencia con fuente + as-of
const cites = (html.match(/<cite[\s>]/gi) ?? []).length
check('7. Toda cifra de evidencia lleva <cite> con fuente y as-of', cites >= 5, `${cites} cites`)

/* 20. 🔴 HONESTIDAD DE LAS CIFRAS. La pieza entera vale por NO exagerar.
   El «+41%» (Quotation Addition, KDD 2024) mide citas de FUENTES entre comillas, no una frase
   propia destacada. Reclamarlo sobre la cita destacada era atribuirle un lift medido a una
   táctica que no aplicamos — y es lo primero que un evaluador técnico caza.

   El assert NO puede ser "que la cadena +41% no exista": la muestra la NOMBRA a propósito,
   dentro de la frase que declara que la táctica no aplica. Eso es honestidad, no un bug.
   Lo que no puede existir es un STAT —el número grande— que la reclame como propia. */
const stats = [...html.matchAll(/<p class="stat[^"]*"[^>]*>([\s\S]*?)<\/p>/g)].map(m => m[1])
const claims41 = stats.some(x => x.includes('41%'))
check(
  '20. Ningún stat reclama el +41% (esa táctica exige citar fuentes, no destacarse a uno mismo)',
  !claims41,
  'un stat atribuye un lift medido a una táctica que la muestra no aplica',
)
const claimsReal = stats.some(x => x.includes('30%')) && stats.some(x => x.includes('32%'))
check(
  '20b. Sí se declaran las tácticas que la muestra SÍ aplica (+30% fuentes · +32% estadísticas)',
  claimsReal,
  `stats: ${stats.map(x => x.replace(/<[^>]+>/g, '').trim().slice(0, 12)).join(' | ')}`,
)

// 21. El chip direccional es `content` de CSS: invisible para lectores de pantalla.
const srCount = (html.match(/class="[^"]*\bxr-sr\b[^"]*"[^>]*>Produce \d+ datos/g) ?? []).length
check('21. Cada bloque acoplable anuncia cuántos datos produce (el chip solo existe para quien ve)', srCount >= 6, `${srCount} bloques con voz`)

// 22. Una región con scroll tiene que ser alcanzable por teclado (WCAG 2.1.1).
const preTab = (html.match(/<pre[^>]*tabindex="0"/g) ?? []).length
const preAll = (html.match(/<pre/g) ?? []).length
check('22. WCAG 2.1.1 — el <pre> scrolleable es enfocable por teclado', preAll > 0 && preTab === preAll, `${preTab}/${preAll}`)

// 23. Sin JS el hover no produce nada: el copy no puede prometerlo.
check(
  '23. Sin JS, el hint NO promete interactividad (viene hidden)',
  /<p class="r-hint[^"]*"[^>]*\shidden/.test(html),
)

/* 25-27. 🔴 CORE WEB VITALS. La pieza ARGUMENTA rigor técnico: si el comité (o su área de
   TI) le corre un PageSpeed y sale mal, se cae todo lo demás. Las imágenes vivían en
   `public/`, que SALTA el pipeline de Astro: sin width/height (CLS), sin srcset (el teléfono
   bajaba los 527 KB del hero) y sin AVIF. */
const artImgs = (html.match(/<img[^>]*_astro[^>]*>/g) ?? [])
const withDims = artImgs.filter(t => /\swidth="\d+"/.test(t) && /\sheight="\d+"/.test(t))
check('25. Toda imagen del artículo declara width y height (sin eso: CLS)', artImgs.length > 0 && withDims.length === artImgs.length, `${withDims.length}/${artImgs.length}`)

const withSrcset = artImgs.filter(t => t.includes('srcset='))
check('26. Toda imagen sirve srcset (un teléfono no puede bajar el hero de escritorio)', withSrcset.length === artImgs.length, `${withSrcset.length}/${artImgs.length}`)

const modern = artImgs.filter(t => /\.avif|\.webp/.test(t))
check('27. Formato moderno (AVIF/WebP), no JPEG crudo', modern.length === artImgs.length, `${modern.length}/${artImgs.length}`)

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

  /* El chip direccional ES la afordancia: sin él, el hover dice QUE hay algo al otro lado,
     pero no hacia dónde ni cuánto. Se mide sobre el estado héroe, ANTES de tocar nada:
     medirlo después de interactuar mediría un bloque que ya no está acoplado. */
  const chip = await page.locator('[data-couple="capsule-main"]').first().evaluate(el => {
    const st = getComputedStyle(el, '::after')

    return { content: st.content, opacity: st.opacity }
  })
  check(
    '17. El chip direccional es visible en el bloque acoplado',
    chip.opacity === '1' && chip.content.includes('datos'),
    `opacity=${chip.opacity} content=${chip.content}`,
  )

  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check('10. Sin scroll horizontal en 1440px', scrollW <= 1, `overflow ${scrollW}px`)

  // Acoplamiento: hover sobre la imagen -> se resalta su ImageObject/alt
  await page.locator('[data-couple="img-hero"]').first().hover()
  await page.waitForTimeout(250)
  const coupled = await page.locator('[data-couple-target="img-hero"][data-on]').count()
  check('11. Hover en el artículo resalta su contraparte en la capa de máquina', coupled > 0)
  await page.screenshot({ path: `${OUT}/couple-image.png` })

  /* 11b-11c. EL INSTRUMENTO ENFOCA — y el chip no puede mentir.
     El panel se ordena POR FAMILIA (Metadatos · Estructura · Evidencia) pero al tocar un bloque la
     pregunta es «¿qué produce ESTO?»: los datos de un bloque NUNCA son contiguos. Cuando el panel
     sólo atenuaba y scrolleaba al primer match, de 51 datos prometidos por los chips **44 no se
     veían jamás** — el `h1` prometía 11 y mostraba 0, y el único visible solía ser el más
     tautológico («tu H2 está en la lista de H2»), así que para quien no sabe SEO no pasaba nada.
     Un chip que promete «4 datos» y muestra uno miente, y en la pieza cuya tesis es el rigor esa es
     la mentira más cara. Estos dos asserts recorren TODOS los bloques acoplables. */
  const foco = await page.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const vis = el => {
      const r = el.getBoundingClientRect()

      return r.height > 0 && r.top >= 0 && r.bottom <= window.innerHeight
    }
    const ruido = []
    const miente = []

    for (const src of document.querySelectorAll('[data-couple]')) {
      const id = src.dataset.couple
      src.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      await sleep(120)

      // (a) cero ruido: nada visible en el panel puede pertenecer a OTRO bloque.
      const ajenos = [...document.querySelectorAll('.inst [data-couple-target]')].filter(
        el => el.dataset.coupleTarget !== id && vis(el) && !el.querySelector(`[data-couple-target="${id}"]`),
      )
      if (ajenos.length) ruido.push(`${id}:${ajenos.length}`)

      // (b) el header declara la cuenta EXACTA que promete el chip.
      const n = document.querySelectorAll(`.inst [data-couple-target="${id}"]`).length
      const nota = document.querySelector('[data-testid="focus-note"]')?.textContent ?? ''
      if (n > 0 && !nota.includes(String(n))) miente.push(`${id}: dice "${nota}" y produce ${n}`)

      src.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }))
      await sleep(40)
    }

    return { ruido, miente }
  })

  check(
    '11b. Al enfocar, el panel NO muestra un solo nodo de otro bloque (el instrumento enfoca, no atenúa)',
    foco.ruido.length === 0,
    `bloques con ruido ajeno visible: ${foco.ruido.join(', ')}`,
  )
  check(
    '11c. El header declara la cuenta EXACTA que el chip promete (un chip que promete 4 y muestra 1, miente)',
    foco.miente.length === 0,
    foco.miente.join(' · '),
  )

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

  // Teclado con el MOUSE APOYADO en otra parte: el cursor quieto no puede robarle el
  // acoplamiento al teclado (al enfocar, la página scrollea y dispara mouseover fantasma).
  await page.mouse.move(300, 400)
  await page.keyboard.press('Tab')
  await page.locator('[data-couple="h2-como-llegar"]').first().focus()
  await page.waitForTimeout(350)
  const kb = await page.locator('[data-couple-target="h2-como-llegar"][aria-current="true"]').count()
  check('12. El teclado acopla aunque el mouse esté apoyado en otra parte', kb > 0)
  await page.screenshot({ path: `${OUT}/couple-keyboard.png` })

  /* LOS FRAMES DE LA LÁMINA — deliberados, no accidentales.
     Con el hero editorial la correspondencia queda bajo el pliegue: la página se diseña
     para LEERSE, la lámina se captura donde ARGUMENTA. Dos frames, dos argumentos. */
  const slide = async (couple, scroll, name) => {
    await page.keyboard.press('Escape')
    await page.mouse.move(10, 10)
    await page.evaluate(y => window.scrollTo(0, y), scroll)
    await page.waitForTimeout(250)
    await page.evaluate(id => {
      document
        .querySelector(`[data-couple="${id}"]`)
        ?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    }, couple)
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/${name}.png` })
  }

  // (a) El oficio: la cápsula de respuesta ↔ el 72,4% de las páginas que ChatGPT cita.
  await slide('capsule-main', 980, 'slide-oficio')
  // (b) La competencia: el H2 de «cómo se llega» ↔ quién ocupa hoy ese espacio
  //     (Wikipedia · Instagram · TripAdvisor). Cero aerolíneas.
  await slide('h2-como-llegar', 1180, 'slide-competencia')

  /* El chip y el lector de pantalla tienen que decir EL MISMO número. Si el chip promete 9
     y el anuncio dice 10, uno de los dos miente — y el que ve el número es el evaluador. */
  await page.keyboard.press('Escape')
  await page.evaluate(() => {
    document.querySelector('[data-couple="h1"]')?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
  })
  await page.waitForTimeout(400)
  const counts = await page.evaluate(() => {
    const src = document.querySelector('[data-couple="h1"]')
    const dom = document.querySelectorAll('[data-couple-target="h1"]').length
    const chip = (src?.getAttribute('data-n') ?? '').match(/\d+/)?.[0]

    return { dom, chip: Number(chip) }
  })
  check(
    '18. El chip y el DOM cuentan lo mismo (el chip no puede mentir)',
    counts.dom === counts.chip,
    `chip=${counts.chip} dom=${counts.dom}`,
  )

  /* Focus Not Obscured (WCAG 2.2 AA · 2.4.11): el header pegajoso del instrumento NO puede
     tapar el nodo al que saltamos. Es el fallo que el operador vio: medio número cortado. */
  await page.waitForTimeout(900) // el scroll suave del panel tiene que TERMINAR antes de medir
  const obscured = await page.evaluate(() => {
    const pane = document.querySelector('.inst')
    const head = pane?.querySelector('.in-head')
    const node = pane?.querySelector('[data-couple-target][data-on]')
    if (!pane || !head || !node) return null
    const h = head.getBoundingClientRect()
    const n = node.getBoundingClientRect()

    return n.top >= h.bottom - 1
  })
  check('19. WCAG 2.4.11 — el header pegajoso no tapa el nodo acoplado', obscured === true, `top del nodo bajo el header: ${obscured}`)

  /* El texto para lectores de pantalla NO puede verse. Si se ve, no es accesibilidad: es un
     bug visual. (Pasó: el reemplazo de CSS apuntaba a una clase que ya no existía = no-op.) */
  const srVisible = await page.locator('.xr-sr').first().isVisible()
  const srBox = await page.locator('.xr-sr').first().boundingBox()
  check(
    '24. El texto para lectores de pantalla es invisible (pero está en el DOM)',
    !srVisible || (srBox !== null && srBox.width <= 2 && srBox.height <= 2),
    `visible=${srVisible} box=${JSON.stringify(srBox)}`,
  )

  /* 36. EL PESO QUE EL NAVEGADOR DIBUJA, no el que el CSS pide.
     Bug real: la ruta nunca importó Poppins 600/500 — solo heredaba los del slogan (800/900i).
     Un @font-face que falta NO falla: el algoritmo de matching CSS (Fonts L4 §5.2) busca hacia
     arriba y SUSTITUYE. Todo H1/H2/stat salía ExtraBold 800 mientras el CSS decía 600. Se veía
     "raro pero dibujado", así que no lo cazó ni el build, ni el lint, ni un assert de string:
     solo el ojo. Este assert compara el peso COMPUTADO contra el sistema, y por eso vale. */
  const weights = await page.evaluate(() => {
    const w = s => {
      const e = document.querySelector(s)
      if (!e) return null
      const c = getComputedStyle(e)

      return { sel: s, fam: c.fontFamily.split(',')[0].replace(/['"]/g, ''), w: Number(c.fontWeight) }
    }

    return ['.p-h1', '.p-h2', '.stat', '.kpi-n', '.para', '.nd-v', '.nd-l'].map(w).filter(Boolean)
  })
  const poppins = weights.filter(x => x.fam === 'Poppins')
  const heavy = poppins.filter(x => x.w > 600)
  check(
    '36. Ningún display de la pieza se dibuja por encima de Poppins 600 (el 700+ es del lockup de marca)',
    poppins.length > 0 && heavy.length === 0,
    heavy.length ? heavy.map(x => `${x.sel}=${x.w}`).join(' ') : `${poppins.length} nodos Poppins ≤600`,
  )
  const dark = weights.find(x => x.sel === '.nd-v')
  check(
    '37. El texto sobre navy sube un paso (500): el mismo peso sobre oscuro se ve más fino',
    dark?.w === 500,
    `.nd-v=${dark?.w}`,
  )

  /* 38-39. LA FRONTERA DE LAS DOS ZONAS.
     El artículo es la SIMULACIÓN del blog del cliente: si no habla en la tipografía del
     cliente, no es un mockup — es un ejemplo, y le muestra al comité un resultado que
     nunca vería publicado. Y al revés: el análisis es NUESTRO y no puede hablar con la
     voz del cliente. Si alguien borra la frontera, nada falla: se ve "bien" y MIENTE. */
  const zones = await page.evaluate(() => {
    const fam = s => {
      const e = document.querySelector(s)

      return e ? getComputedStyle(e).fontFamily.split(',')[0].replace(/['"]/g, '') : null
    }

    return {
      articulo: ['.p-h1', '.p-h2', '.para', '.cap p'].map(fam),
      efeonce: ['.stat', '.nd-v', '.xr-brand-t', '.sp-head h2'].map(fam),
    }
  })
  check(
    '38. El artículo habla en la tipografía del CLIENTE (Assistant), no en la nuestra',
    zones.articulo.length > 0 && zones.articulo.every(f => f?.startsWith('Assistant')),
    zones.articulo.join(' · '),
  )
  check(
    '39. El instrumento y el chrome hablan en la de EFEONCE — Assistant no cruza la frontera',
    zones.efeonce.length > 0 && zones.efeonce.every(f => f && !f.startsWith('Assistant')),
    zones.efeonce.join(' · '),
  )
  await page.close()

  // Reduced motion
  const rm = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  await rm.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' })
  const dur = await rm.locator('.blk').first().evaluate(el => getComputedStyle(el).transitionDuration)
  check('14. Con prefers-reduced-motion, transitionDuration = 0s', dur.startsWith('0s'), dur)
  await rm.screenshot({ path: `${OUT}/reduced-motion.png` })
  await rm.close()

  // Mobile
  // hasTouch + isMobile: sin esto Chromium reporta `hover: hover` en un viewport de 390px y
  // la captura miente — mostraría "Pasa el cursor" en un teléfono, que no tiene cursor.
  /* 28-29. La transferencia REAL, no el peso en disco: el navegador baja UNA variante por
     imagen. Antes el móvil se tragaba 1,5 MB de JPEG pensados para escritorio. */
  const cwv = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  let imgBytes = 0
  cwv.on('response', async r => {
    try {
      if ((r.headers()['content-type'] ?? '').startsWith('image')) imgBytes += (await r.body()).length
    } catch {}
  })
  await cwv.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' })
  const imgKb = Math.round(imgBytes / 1024)
  check('28. En móvil, las imágenes pesan < 200 KB transferidos', imgKb < 200, `${imgKb} KB`)

  const cls = await cwv.evaluate(
    () =>
      new Promise(res => {
        let v = 0
        new PerformanceObserver(l => {
          for (const e of l.getEntries()) if (!e.hadRecentInput) v += e.value
        }).observe({ type: 'layout-shift', buffered: true })
        setTimeout(() => res(Number(v.toFixed(4))), 1200)
      }),
  )
  check('29. CLS ≤ 0.1 (el umbral «good» de Core Web Vitals)', cls <= 0.1, `CLS=${cls}`)
  await cwv.close()

  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  await m.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' })
  const mScroll = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check('15. Sin scroll horizontal en 390px', mScroll <= 1, `overflow ${mScroll}px`)

  const hint = (await m.locator('[data-testid="hint-m"]').textContent()) ?? ''
  const hintVisible = await m.locator('[data-testid="hint-m"]').isVisible()
  check('16. En táctil el copy no habla de cursor', hintVisible && !hint.includes('cursor'), hint.slice(0, 40))
  await m.screenshot({ path: `${OUT}/hero-mobile.png` })
  await m.screenshot({ path: `${OUT}/full-mobile.png`, fullPage: true })

  /* 30. 🔴 EL ACOPLAMIENTO TIENE QUE EXISTIR EN MÓVIL.
     Apilado, el instrumento queda a DIEZ PANTALLAS del artículo: tocabas un bloque, se
     encendía el chip «↓ 3 datos»… y no pasaba nada más. El argumento central de la pieza
     simplemente NO EXISTÍA en un teléfono. Ahora el instrumento sube como hoja inferior.
     Y se mide con getBoundingClientRect, NO con isVisible(): `isVisible` solo mira el CSS
     y devolvía `true` para un nodo que estaba diez pantallas fuera de la vista. */
  await m.locator('[data-couple="table-entradas"]').first().scrollIntoViewIfNeeded()
  await m.waitForTimeout(250)
  await m.locator('[data-couple="table-entradas"]').first().tap()
  await m.waitForTimeout(800)
  const inView = await m
    .locator('[data-couple-target="table-entradas"][data-on]')
    .first()
    .evaluate(el => {
      const r = el.getBoundingClientRect()

      return r.top >= 0 && r.bottom <= window.innerHeight && r.height > 0
    })
  check('30. En móvil, al tocar un bloque el dato acoplado ENTRA al viewport (hoja inferior)', inView)
  await m.screenshot({ path: `${OUT}/mobile-sheet.png` })
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
