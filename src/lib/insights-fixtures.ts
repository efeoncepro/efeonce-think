/**
 * Fixtures del informe compartido de Insights — SÓLO para `astro dev` (TASK-1875). `insights.ts` los carga con un
 * import dinámico detrás de `import.meta.env.DEV`: nunca entran al camino de producción.
 *
 * Datos de ejemplo coherentes entre sí (los mismos del canvas aprobado de los PDF, TASK-1889). Cada cifra impresa sale
 * de `display`, con el formato que produce Greenhouse (`formatFactValue`, es-CL): el render nunca formatea.
 *
 * Tokens: `fixture-completo`, `fixture-parcial`, `fixture-v1` (sin campos editoriales v2), `fixture-sin-descargas`,
 * `fixture-no-existe` (404), `fixture-retirado` (410), `fixture-limite` (429), `fixture-error` (5xx).
 */
import type {
  InsightSharedEditionResponseV1,
  InsightWebClaimV1,
  InsightWebFactV1,
  InsightWebModelV1,
  SharedInsightResult,
} from './insights'

type FactSeed = Omit<InsightWebFactV1, 'factId' | 'absentReason'>

const seeds: Record<string, FactSeed> = {
  'seo.clicks_change': { module: 'seo', label: 'Variación de clics desde Google', value: 16.5, unit: 'percent', display: '16,5 %', observation: 'observed', source: 'Google Search Console', asOf: '2026-08-31' },
  'seo.clicks_aug': { module: 'seo', label: 'Clics desde Google en agosto', value: 1284, unit: 'count', display: '1.284', observation: 'observed', source: 'Google Search Console', asOf: '2026-08-31' },
  'seo.clicks_jul': { module: 'seo', label: 'Clics desde Google en julio', value: 1102, unit: 'count', display: '1.102', observation: 'observed', source: 'Google Search Console', asOf: '2026-07-31' },
  'seo.nonbrand_share': { module: 'seo', label: 'Clics sin buscar la marca', value: 60.1, unit: 'percent', display: '60,1 %', observation: 'estimated', source: 'Google Search Console y GA4', asOf: '2026-08-31' },
  'seo.ctr_aug': { module: 'seo', label: 'CTR medio', value: 2.56, unit: 'percent', display: '2,6 %', observation: 'observed', source: 'Google Search Console', asOf: '2026-08-31' },
  'seo.position_aug': { module: 'seo', label: 'Posición media', value: 7.4, unit: 'position', display: '#7,4', observation: 'observed', source: 'Google Search Console', asOf: '2026-08-31' },
  'seo.etv': { module: 'seo', label: 'Valor del tráfico estimado', value: null, unit: 'usd', display: '—', observation: 'estimated', source: 'DataForSEO', asOf: null },
  'seo.contact_rate': { module: 'seo', label: 'Visitas con interacción que llegan a contacto', value: 5.9, unit: 'percent', display: '5,9 %', observation: 'observed', source: 'GA4 y HubSpot', asOf: '2026-08-31' },
  'seo.tech_score': { module: 'seo', label: 'Salud técnica del sitio', value: 78, unit: 'score', display: '78', observation: 'observed', source: 'Auditoría técnica', asOf: '2026-08-29' },
  'aeo.mention_rate': { module: 'aeo', label: 'Respuestas de IA que nombran la marca', value: 62, unit: 'percent', display: '62,0 %', observation: 'observed', source: 'Panel de 50 consultas', asOf: '2026-08-30' },
  'aeo.cited_links': { module: 'aeo', label: 'Respuestas que enlazan al sitio', value: 19, unit: 'count', display: '19', observation: 'observed', source: 'Panel de 50 consultas', asOf: '2026-08-30' },
  'aeo.chatgpt': { module: 'aeo', label: 'ChatGPT nombra la marca', value: 12, unit: 'count', display: '12', observation: 'observed', source: 'Panel de 50 consultas', asOf: '2026-08-30' },
  'aeo.gemini': { module: 'aeo', label: 'Gemini nombra la marca', value: 10, unit: 'count', display: '10', observation: 'observed', source: 'Panel de 50 consultas', asOf: '2026-08-30' },
  'aeo.perplexity': { module: 'aeo', label: 'Perplexity nombra la marca', value: 9, unit: 'count', display: '9', observation: 'observed', source: 'Panel de 50 consultas', asOf: '2026-08-30' },
}

const weeks: Array<[string, number, number]> = [
  ['w1', 281, 262],
  ['w2', 304, 271],
  ['w3', 327, 276],
  ['w4', 372, 293],
]
for (const [w, aug, jul] of weeks) {
  seeds[`seo.clicks_${w}_aug`] = { module: 'seo', label: `Clics semana ${w.slice(1)} de agosto`, value: aug, unit: 'count', display: new Intl.NumberFormat('es-CL').format(aug), observation: 'observed', source: 'Google Search Console', asOf: '2026-08-31' }
  seeds[`seo.clicks_${w}_jul`] = { module: 'seo', label: `Clics semana ${w.slice(1)} de julio`, value: jul, unit: 'count', display: new Intl.NumberFormat('es-CL').format(jul), observation: 'observed', source: 'Google Search Console', asOf: '2026-07-31' }
}

// ── Hechos de las demás familias (catálogo completo de TASK-1888) ─────────────
const nf = (digits: number) => new Intl.NumberFormat('es-CL', { minimumFractionDigits: digits, maximumFractionDigits: digits })
type Module = FactSeed['module']
const add = (id: string, module: Module, label: string, value: number | null, unit: FactSeed['unit'], source: string, observation: FactSeed['observation'] = 'observed') => {
  const display = value === null ? '—' : unit === 'percent' ? `${nf(1).format(value)} %` : unit === 'position' ? `#${nf(1).format(value)}` : nf(0).format(value)
  seeds[id] = { module, label, value, unit, display, observation, source, asOf: value === null ? null : module === 'aeo' ? '2026-08-30' : '2026-08-31' }
}
const GSC = 'Google Search Console'
const PANEL = 'Panel de 50 consultas'
const ICO = 'Motor ICO de Efeonce'

// SEO · línea: CTR semanal
;[['w1', 2.31], ['w2', 2.44], ['w3', 2.61], ['w4', 2.78]].forEach(([w, v]) => add(`seo.ctr_${w}`, 'seo', `CTR semana ${String(w).slice(1)}`, v as number, 'percent', GSC))
// SEO · apiladas: clics con marca / sin marca por semana (suman los clics de cada semana)
;[['w1', 112, 169], ['w2', 121, 183], ['w3', 128, 199], ['w4', 151, 221]].forEach(([w, brand, nonbrand]) => {
  add(`seo.brand_${w}`, 'seo', `Clics con marca, semana ${String(w).slice(1)}`, brand as number, 'count', GSC)
  add(`seo.nonbrand_${w}`, 'seo', `Clics sin marca, semana ${String(w).slice(1)}`, nonbrand as number, 'count', GSC, 'estimated')
})
// SEO · cascada: de 1.102 a 1.284 clics
add('seo.wf_services', 'seo', 'Aporte de las páginas de servicio', 104, 'count', GSC)
add('seo.wf_blog', 'seo', 'Aporte del blog', 61, 'count', GSC)
add('seo.wf_faq', 'seo', 'Aporte de preguntas frecuentes', 38, 'count', GSC)
add('seo.wf_other', 'seo', 'Otras páginas', -21, 'count', GSC)
// SEO · embudo: del clic al contacto
add('seo.f_clicks', 'seo', 'Clics desde Google', 1284, 'count', GSC)
add('seo.f_engaged', 'seo', 'Visitas con interacción', 690, 'count', 'GA4')
add('seo.f_forms', 'seo', 'Formularios enviados', 41, 'count', 'GA4 y HubSpot')
add('seo.f_sql', 'seo', 'Oportunidades calificadas', 18, 'count', 'HubSpot')
// SEO · dispersión: posición frente a CTR por página
const pages: Array<[string, string, number, number]> = [['p1', '/servicios', 2.1, 8.4], ['p2', '/precios', 3.4, 6.1], ['p3', '/casos', 5.2, 3.9], ['p4', '/blog/aeo', 6.8, 2.7], ['p5', '/nosotros', 8.9, 1.6], ['p6', '/blog/crm', 11.5, 0.9], ['p7', '/recursos', 14.2, 0.5]]
pages.forEach(([id, label, pos, ctr]) => {
  add(`seo.pos_${id}`, 'seo', `Posición media de ${label}`, pos, 'position', GSC)
  add(`seo.ctrp_${id}`, 'seo', `CTR de ${label}`, ctr, 'percent', GSC)
})

// IA · torta y dona
add('aeo.named', 'aeo', 'Respuestas que nombran la marca', 31, 'count', PANEL)
add('aeo.not_named', 'aeo', 'Respuestas que no la nombran', 19, 'count', PANEL)
add('aeo.linked', 'aeo', 'Con enlace al sitio', 19, 'count', PANEL)
add('aeo.unlinked', 'aeo', 'Sin enlace', 12, 'count', PANEL)
// IA · heatmap: motor × tipo de consulta (una celda sin dato)
const engines = ['ChatGPT', 'Gemini', 'Perplexity']
const intents = ['Categoría', 'Comparación', 'Problema', 'Marca']
const heat = [[3, 4, 2, 3], [2, 3, 2, 3], [2, 1, 3, null]]
heat.forEach((row, r) => row.forEach((v, c) => add(`aeo.h_${r}_${c}`, 'aeo', `${engines[r]} · ${intents[c]}`, v, 'count', PANEL)))
// IA · Venn: Google top 10 y cita de la IA
add('aeo.v_google', 'aeo', 'Sólo rankeamos en Google', 14, 'count', `${GSC} y ${PANEL}`)
add('aeo.v_ai', 'aeo', 'Sólo nos cita la IA', 7, 'count', `${GSC} y ${PANEL}`)
add('aeo.v_both', 'aeo', 'Ambos', 12, 'count', `${GSC} y ${PANEL}`)
// IA · UpSet: qué motores nombran la marca en la misma consulta
const ups: Array<[string, string[], number]> = [['u1', ['chatgpt', 'gemini', 'perplexity'], 6], ['u2', ['chatgpt'], 4], ['u3', ['chatgpt', 'gemini'], 3], ['u4', ['gemini'], 2], ['u5', ['perplexity'], 2], ['u6', ['gemini', 'perplexity'], 1]]
ups.forEach(([id, , v]) => add(`aeo.${id}`, 'aeo', `Consultas de la intersección ${id}`, v, 'count', PANEL))

// Entrega · bullet (meta y banda son hechos del registro ICO)
add('ico.otd', 'ico', 'Entregas a tiempo (OTD)', 91, 'percent', ICO)
add('ico.otd_target', 'ico', 'Meta de OTD', 95, 'percent', ICO)
add('ico.otd_band', 'ico', 'Umbral de atención de OTD', 88, 'percent', ICO)
add('ico.ftr', 'ico', 'Aprobadas a la primera (FTR)', 78, 'percent', ICO)
add('ico.ftr_target', 'ico', 'Meta de FTR', 70, 'percent', ICO)
add('ico.ftr_band', 'ico', 'Umbral de atención de FTR', 65, 'percent', ICO)
// Entrega · medidor
add('ico.score', 'ico', 'Índice de entrega creativa', 82, 'score', ICO)
add('ico.score_prev', 'ico', 'Índice de entrega creativa en julio', 76, 'score', ICO)
add('ico.score_target', 'ico', 'Meta del índice', 85, 'score', ICO)
// Entrega · waffle
add('ico.pieces', 'ico', 'Piezas entregadas', 64, 'count', ICO)
add('ico.first', 'ico', 'Aprobadas a la primera', 41, 'count', ICO)
add('ico.one_round', 'ico', 'Con una ronda', 17, 'count', ICO)
add('ico.more_rounds', 'ico', 'Con dos rondas o más', 6, 'count', ICO)

const facts: Record<string, InsightWebFactV1> = Object.fromEntries(
  Object.entries(seeds).map(([factId, seed]) => [factId, { factId, ...seed, absentReason: seed.value === null ? 'no_data' : null }]),
)

const claim = (claimId: string, text: string, factIds: string[] = []): InsightWebClaimV1 => ({ claimId, text, factIds })
const d = (id: string) => facts[id].display


// ── Figuras de todas las familias, con su lectura (catálogo completo de TASK-1888) ─
type Chart = InsightWebModelV1['chapters'][number]['charts'][number]
type Reading = NonNullable<InsightWebModelV1['chapters'][number]['readings']>[number]
const spec = (s: Partial<Chart['spec']> & Pick<Chart['spec'], 'chartId' | 'family' | 'relation' | 'title' | 'unit'>): Chart['spec'] => ({
  series: [], dimensionLabels: [], scale: { kind: 'linear', baseline: 0 }, references: [], ...s,
})
const read = (chartId: string, conclusion: string, extra: Partial<Reading> = {}): Reading => ({ chartId, conclusion: claim(`conc-${chartId}`, conclusion), nextStep: null, ...extra })

const SEO_EXTRA: { charts: Chart[]; readings: Reading[] } = {
  charts: [
    {
      spec: spec({ chartId: 'seo-ctr-trend', family: 'line', relation: 'trend', title: 'CTR medio por semana de agosto', unit: '%', scale: { kind: 'linear', baseline: null },
        series: [{ seriesId: 'ctr', label: 'CTR', factIds: ['seo.ctr_w1', 'seo.ctr_w2', 'seo.ctr_w3', 'seo.ctr_w4'], unit: '%' }], dimensionLabels: ['1 al 7', '8 al 14', '15 al 21', '22 al 31'] }),
      table: { columns: ['Semana', 'CTR'], rows: [['1 al 7', d('seo.ctr_w1')], ['8 al 14', d('seo.ctr_w2')], ['15 al 21', d('seo.ctr_w3')], ['22 al 31', d('seo.ctr_w4')]] },
    },
    {
      spec: spec({ chartId: 'seo-brand-split', family: 'bar_stacked', relation: 'composition', title: 'Clics con y sin marca, por semana', unit: 'clics',
        series: [
          { seriesId: 'nonbrand', label: 'Sin buscar la marca', factIds: ['seo.nonbrand_w1', 'seo.nonbrand_w2', 'seo.nonbrand_w3', 'seo.nonbrand_w4'], unit: 'clics' },
          { seriesId: 'brand', label: 'Buscando la marca', factIds: ['seo.brand_w1', 'seo.brand_w2', 'seo.brand_w3', 'seo.brand_w4'], unit: 'clics' },
        ], dimensionLabels: ['1 al 7', '8 al 14', '15 al 21', '22 al 31'] }),
      table: { columns: ['Semana', 'Sin marca', 'Con marca'], rows: [1, 2, 3, 4].map((w) => [['1 al 7', '8 al 14', '15 al 21', '22 al 31'][w - 1], d(`seo.nonbrand_w${w}`), d(`seo.brand_w${w}`)]) },
    },
    {
      spec: spec({ chartId: 'seo-waterfall', family: 'waterfall', relation: 'decomposition', title: 'De 1.102 a 1.284 clics: de dónde salió el alza', unit: 'clics',
        data: { kind: 'waterfall', steps: [
          { stepId: 's0', label: 'Julio', factId: 'seo.clicks_jul', isTotal: true },
          { stepId: 's1', label: 'Servicios', factId: 'seo.wf_services', isTotal: false },
          { stepId: 's2', label: 'Blog', factId: 'seo.wf_blog', isTotal: false },
          { stepId: 's3', label: 'Preguntas', factId: 'seo.wf_faq', isTotal: false },
          { stepId: 's4', label: 'Otras', factId: 'seo.wf_other', isTotal: false },
          { stepId: 's5', label: 'Agosto', factId: 'seo.clicks_aug', isTotal: true },
        ] } }),
      table: { columns: ['Paso', 'Clics'], rows: [['Julio', d('seo.clicks_jul')], ['Páginas de servicio', d('seo.wf_services')], ['Blog', d('seo.wf_blog')], ['Preguntas frecuentes', d('seo.wf_faq')], ['Otras páginas', d('seo.wf_other')], ['Agosto', d('seo.clicks_aug')]] },
    },
    {
      spec: spec({ chartId: 'seo-funnel', family: 'funnel', relation: 'conversion', title: 'Del clic al contacto', unit: 'personas',
        data: { kind: 'funnel', stages: [
          { stageId: 'f1', label: 'Clics desde Google', factId: 'seo.f_clicks' },
          { stageId: 'f2', label: 'Visitas con interacción', factId: 'seo.f_engaged' },
          { stageId: 'f3', label: 'Formularios', factId: 'seo.f_forms' },
          { stageId: 'f4', label: 'Oportunidades calificadas', factId: 'seo.f_sql' },
        ] } }),
      table: { columns: ['Etapa', 'Personas'], rows: [['Clics desde Google', d('seo.f_clicks')], ['Visitas con interacción', d('seo.f_engaged')], ['Formularios', d('seo.f_forms')], ['Oportunidades calificadas', d('seo.f_sql')]] },
      // 1.1: Greenhouse deriva las tasas con la misma geometría de los PDF (funnelGeometry) y las formatea.
      derived: { funnelStepRates: [{ stageId: 'f1', display: null }, { stageId: 'f2', display: '53,7 %' }, { stageId: 'f3', display: '5,9 %' }, { stageId: 'f4', display: '43,9 %' }] },
    },
    {
      spec: spec({ chartId: 'seo-scatter', family: 'scatter', relation: 'correlation', title: 'Posición frente a CTR, por página', unit: '%',
        series: [
          { seriesId: 'pos', label: 'Posición media', factIds: pages.map(([id]) => `seo.pos_${id}`), unit: 'posición' },
          { seriesId: 'ctr', label: 'CTR', factIds: pages.map(([id]) => `seo.ctrp_${id}`), unit: '%' },
        ], dimensionLabels: pages.map(([, label]) => label) }),
      table: { columns: ['Página', 'Posición media', 'CTR'], rows: pages.map(([id, label]) => [label, d(`seo.pos_${id}`), d(`seo.ctrp_${id}`)]) },
    },
  ],
  readings: [
    read('seo-ctr-trend', 'El CTR subió las cuatro semanas: el alza no fue un pico'),
    read('seo-brand-split', 'Lo que crece es la audiencia que no nos buscaba', { meaning: claim('m-brand', 'La marca gana visibilidad en búsquedas genéricas, no sólo entre quienes ya la conocen.') }),
    read('seo-waterfall', 'Las páginas de servicio explican más de la mitad del alza', { nextStep: claim('n-wf', 'Llevar el mismo trabajo de títulos a preguntas frecuentes, que ya aporta 38 clics.') }),
    read('seo-funnel', 'La caída grande está entre la visita y el formulario', { meaning: claim('m-funnel', 'Llega tráfico con interés, pero el formulario frena el paso a contacto.'), nextStep: claim('n-funnel', 'Probar un formulario corto en /servicios y /precios.') }),
    read('seo-scatter', 'Pasada la posición 5, el CTR cae fuerte', { nextStep: claim('n-scatter', 'Priorizar las páginas entre la posición 6 y 11: un salto ahí vale más clics.') }),
  ],
}

const AEO_EXTRA: { charts: Chart[]; readings: Reading[] } = {
  charts: [
    {
      spec: spec({ chartId: 'aeo-pie', family: 'pie', relation: 'composition', title: 'Respuestas del panel que nombran la marca', unit: 'respuestas',
        series: [{ seriesId: 'panel', label: 'Respuestas', factIds: ['aeo.named', 'aeo.not_named'], unit: 'respuestas' }], dimensionLabels: ['La nombran', 'No la nombran'] }),
      table: { columns: ['Respuesta', 'Cantidad'], rows: [['La nombran', d('aeo.named')], ['No la nombran', d('aeo.not_named')]] },
    },
    {
      spec: spec({ chartId: 'aeo-donut', family: 'donut', relation: 'composition', title: 'Cómo la nombran: con o sin enlace', unit: 'respuestas',
        series: [{ seriesId: 'links', label: 'Respuestas', factIds: ['aeo.linked', 'aeo.unlinked'], unit: 'respuestas' }], dimensionLabels: ['Con enlace', 'Sin enlace'] }),
      table: { columns: ['Mención', 'Respuestas'], rows: [['Con enlace', d('aeo.linked')], ['Sin enlace', d('aeo.unlinked')]] },
    },
    {
      spec: spec({ chartId: 'aeo-heatmap', family: 'heatmap', relation: 'distribution', title: 'Menciones por motor y tipo de consulta', unit: 'respuestas',
        data: { kind: 'heatmap', rowLabels: engines, columnLabels: intents, cells: heat.map((row, r) => row.map((_, c) => `aeo.h_${r}_${c}`)) } }),
      table: { columns: ['Motor', ...intents], rows: heat.map((row, r) => [engines[r], ...row.map((_, c) => d(`aeo.h_${r}_${c}`))]) },
    },
    {
      spec: spec({ chartId: 'aeo-venn', family: 'venn_two', relation: 'overlap', title: 'Consultas donde rankeamos en Google y donde nos cita la IA', unit: 'consultas',
        data: { kind: 'venn_two', setA: { label: 'Top 10 en Google' }, setB: { label: 'Citada con enlace por la IA' }, onlyAFactId: 'aeo.v_google', onlyBFactId: 'aeo.v_ai', bothFactId: 'aeo.v_both' } }),
      table: { columns: ['Conjunto', 'Consultas'], rows: [['Sólo Google', d('aeo.v_google')], ['Ambos', d('aeo.v_both')], ['Sólo la IA', d('aeo.v_ai')]] },
    },
    {
      spec: spec({ chartId: 'aeo-upset', family: 'upset', relation: 'overlap', title: 'Qué motores nombran la marca en la misma consulta', unit: 'consultas',
        data: { kind: 'upset', sets: [{ setId: 'chatgpt', label: 'ChatGPT' }, { setId: 'gemini', label: 'Gemini' }, { setId: 'perplexity', label: 'Perplexity' }], intersections: ups.map(([id, setIds]) => ({ intersectionId: id, setIds, factId: `aeo.${id}` })) } }),
      table: { columns: ['Motores', 'Consultas'], rows: ups.map(([id, setIds]) => [setIds.map((x) => ({ chatgpt: 'ChatGPT', gemini: 'Gemini', perplexity: 'Perplexity' })[x]).join(' + '), d(`aeo.${id}`)]) },
    },
  ],
  readings: [
    read('aeo-pie', 'Tres de cada cinco respuestas ya nombran a la marca'),
    read('aeo-donut', 'Una de cada tres menciones no trae enlace', { nextStep: claim('n-donut', 'Dar a la IA una página citable por cada tema donde ya nos nombra.') }),
    read('aeo-heatmap', 'Las comparaciones en ChatGPT son el punto más fuerte', { meaning: claim('m-heat', 'Perplexity casi no nos nombra cuando se compara: ahí está la brecha.') }),
    read('aeo-venn', 'En 14 consultas rankeamos en Google y la IA no nos cita', { nextStep: claim('n-venn', 'Empezar por esas 14: el contenido ya posiciona, falta que sea citable.') }),
    read('aeo-upset', 'Sólo en 6 consultas nos nombran los tres motores a la vez'),
  ],
}

const ICO_CHARTS: Chart[] = [
  {
    spec: spec({ chartId: 'ico-bullet', family: 'bullet', relation: 'target', title: 'Entrega frente a su meta', unit: '%',
      data: { kind: 'bullet', direction: 'higher_is_better', items: [
        { itemId: 'otd', label: 'Entregas a tiempo', valueFactId: 'ico.otd', targetFactId: 'ico.otd_target', bandFactId: 'ico.otd_band' },
        { itemId: 'ftr', label: 'Aprobadas a la primera', valueFactId: 'ico.ftr', targetFactId: 'ico.ftr_target', bandFactId: 'ico.ftr_band' },
      ] } }),
    table: { columns: ['Métrica', 'Agosto', 'Meta'], rows: [['Entregas a tiempo', d('ico.otd'), d('ico.otd_target')], ['Aprobadas a la primera', d('ico.ftr'), d('ico.ftr_target')]] },
  },
  {
    spec: spec({ chartId: 'ico-gauge', family: 'gauge', relation: 'target', title: 'Índice de entrega creativa', unit: 'puntos',
      data: { kind: 'gauge', valueFactId: 'ico.score', previousFactId: 'ico.score_prev', targetFactId: 'ico.score_target', min: 0, max: 100 } }),
    table: { columns: ['Lectura', 'Puntos'], rows: [['Agosto', d('ico.score')], ['Julio', d('ico.score_prev')], ['Meta', d('ico.score_target')]] },
  },
  {
    spec: spec({ chartId: 'ico-waffle', family: 'waffle', relation: 'composition', title: 'Las 64 piezas de agosto, por rondas de revisión', unit: 'piezas',
      data: { kind: 'waffle', parts: [
        { partId: 'first', label: 'A la primera', factId: 'ico.first' },
        { partId: 'one', label: 'Con una ronda', factId: 'ico.one_round' },
        { partId: 'more', label: 'Dos rondas o más', factId: 'ico.more_rounds' },
      ], totalFactId: 'ico.pieces' } }),
    table: { columns: ['Rondas', 'Piezas'], rows: [['A la primera', d('ico.first')], ['Con una ronda', d('ico.one_round')], ['Dos rondas o más', d('ico.more_rounds')], ['Total', d('ico.pieces')]] },
  },
]
const ICO_READINGS: Reading[] = [
  read('ico-bullet', 'A tiempo casi siempre; a la primera, sobre la meta', { keyFigure: { factId: 'ico.otd', value: d('ico.otd'), caption: claim('kf-ico', 'de las entregas llegó a tiempo; la meta es 95 %', ['ico.otd']) }, meaning: claim('m-ico', 'La calidad se sostiene; el plazo es lo que hay que cuidar en septiembre.'), nextStep: claim('n-ico', 'Adelantar la revisión interna un día en las piezas con fecha fija.') }),
  read('ico-gauge', 'El índice subió seis puntos y queda a tres de la meta'),
  read('ico-waffle', 'Casi dos de cada tres piezas salieron a la primera'),
]

const model: InsightWebModelV1 = {
  modelVersion: '1.0',
  locale: 'es-CL',
  executiveSummary: [
    claim('sum-1', 'Agosto trajo más clics y más oportunidades. La brecha ahora está en convertir.'),
    claim(
      'sum-2',
      `El sitio recibió ${d('seo.clicks_change')} más clics desde Google con menos impresiones, y la marca aparece en el ${d('aeo.mention_rate')} de las respuestas de IA del panel. El freno está en dos pasos: que la IA nos cite con enlace y que las visitas se conviertan en contacto.`,
      ['seo.clicks_change', 'aeo.mention_rate'],
    ),
  ],
  essentials: [
    claim('ess-1', 'Más clics con menos impresiones: el CTR subió y cada punto vale unos 480 clics al mes.', ['seo.clicks_change']),
    claim('ess-2', `El alza viene de audiencia nueva: ${d('seo.nonbrand_share')} de los clics llegaron sin buscar la marca.`, ['seo.nonbrand_share']),
    claim('ess-3', `La IA ya conoce la marca, pero no siempre la cita: sólo ${d('aeo.cited_links')} respuestas enlazan al sitio.`, ['aeo.mention_rate']),
    claim('ess-4', 'La fuga está en el paso a contacto: de 690 visitas con interacción salieron 41 formularios.', ['seo.contact_rate']),
    claim('ess-5', 'La base técnica acompaña: velocidad y rastreo están sanos; sólo las imágenes del blog quedan bajo la meta.', ['seo.tech_score']),
  ],
  decision: claim('dec', 'Aprobar el plan de septiembre: cinco acciones para convertir mejor el tráfico que ya llega. Las dos primeras pueden estar en producción en dos semanas.'),
  measurement: claim('meas', 'Contra la línea base de agosto, en el informe de septiembre.'),
  ask: claim('ask', 'Aprobar el plan y dar acceso de edición a /precios y /servicios.'),
  scopeLines: ['Visibilidad orgánica en Google', 'Respuestas de ChatGPT, Gemini y Perplexity', 'Entrega creativa: plazos, rondas y aprobación'],
  chapters: [
    {
      chapterId: 'ch-seo',
      module: 'seo',
      title: 'Visibilidad orgánica',
      opening: claim('ch-seo-open', 'El sitio convierte mejor lo que muestra: agosto trajo más clics con menos impresiones, y el alza se sostuvo todo el mes.'),
      claims: [
        claim('ch-seo-c1', `El CTR medio llegó a ${d('seo.ctr_aug')} y la posición media mejoró a ${d('seo.position_aug')}.`, ['seo.ctr_aug', 'seo.position_aug']),
        claim('ch-seo-c2', 'El valor del tráfico estimado no se muestra este mes.', ['seo.etv']),
      ],
      charts: [
        {
          spec: {
            chartId: 'seo-weekly-clicks',
            family: 'bar_grouped',
            relation: 'comparison',
            title: 'Clics por semana, agosto frente a julio',
            series: [
              { seriesId: 'aug', label: 'Agosto 2026', factIds: weeks.map(([w]) => `seo.clicks_${w}_aug`), unit: 'clics' },
              { seriesId: 'jul', label: 'Julio 2026', factIds: weeks.map(([w]) => `seo.clicks_${w}_jul`), unit: 'clics' },
            ],
            dimensionLabels: ['1 al 7', '8 al 14', '15 al 21', '22 al 31'],
            unit: 'clics',
            scale: { kind: 'linear', baseline: 0 },
            references: [],
          },
          table: {
            columns: ['Semana', 'Agosto 2026', 'Julio 2026'],
            rows: [
              ['1 al 7', d('seo.clicks_w1_aug'), d('seo.clicks_w1_jul')],
              ['8 al 14', d('seo.clicks_w2_aug'), d('seo.clicks_w2_jul')],
              ['15 al 21', d('seo.clicks_w3_aug'), d('seo.clicks_w3_jul')],
              ['22 al 31', d('seo.clicks_w4_aug'), d('seo.clicks_w4_jul')],
            ],
          },
        },
        ...SEO_EXTRA.charts,
      ],
      readings: [
        ...SEO_EXTRA.readings,
        {
          chartId: 'seo-weekly-clicks',
          keyFigure: { factId: 'seo.clicks_change', value: d('seo.clicks_change'), caption: claim('kf-seo', `${d('seo.clicks_aug')} clics en agosto frente a ${d('seo.clicks_jul')} en julio`, ['seo.clicks_aug', 'seo.clicks_jul']) },
          conclusion: claim('conc-seo', 'Más clics con menos impresiones: cada semana superó a su par de julio'),
          meaning: claim('mean-seo', 'El sitio ya aparece donde importa: cada punto de CTR vale unos 480 clics al mes.'),
          nextStep: claim('next-seo', 'Reescribir títulos y descripciones de las tres páginas con CTR bajo 1 %.'),
        },
      ],
      tables: [],
      limits: ['El valor del tráfico estimado no se muestra: la fuente no sirve esta ventana con exactitud.', 'Las posiciones en Bing no entran: no hay datos para agosto.'],
    },
    {
      chapterId: 'ch-aeo',
      module: 'aeo',
      title: 'Respuestas de IA',
      opening: claim('ch-aeo-open', 'La IA ya nombra a la marca en la mayoría de las respuestas del panel; lo que falta es que la cite con enlace.'),
      claims: [claim('ch-aeo-c1', `Sólo ${d('aeo.cited_links')} respuestas enlazan al sitio: en 14 consultas rankeamos en Google y la IA no nos cita.`, ['aeo.cited_links'])],
      charts: [
        {
          spec: {
            chartId: 'aeo-engines',
            family: 'bar',
            relation: 'comparison',
            title: 'Respuestas que nombran la marca, por motor',
            series: [{ seriesId: 'mentions', label: 'Nombran la marca', factIds: ['aeo.chatgpt', 'aeo.gemini', 'aeo.perplexity'], unit: 'respuestas' }],
            dimensionLabels: ['ChatGPT', 'Gemini', 'Perplexity'],
            unit: 'respuestas',
            scale: { kind: 'linear', baseline: 0 },
            references: [],
          },
          table: {
            columns: ['Motor', 'Nombran la marca'],
            rows: [
              ['ChatGPT', d('aeo.chatgpt')],
              ['Gemini', d('aeo.gemini')],
              ['Perplexity', d('aeo.perplexity')],
            ],
          },
        },
        ...AEO_EXTRA.charts,
      ],
      readings: [
        ...AEO_EXTRA.readings,
        {
          chartId: 'aeo-engines',
          keyFigure: { factId: 'aeo.mention_rate', value: d('aeo.mention_rate'), caption: claim('kf-aeo', 'de las respuestas del panel nombran a la marca', ['aeo.mention_rate']) },
          conclusion: claim('conc-aeo', 'ChatGPT es el motor que más nos nombra; Perplexity, el que menos'),
          meaning: undefined,
          nextStep: claim('next-aeo', 'Publicar respuestas directas y datos con fuente en las 14 páginas que ya rankean.'),
        },
      ],
      tables: [],
      limits: ['Claude no entra en esta edición: el panel todavía no lo mide.'],
    },
    {
      chapterId: 'ch-ico',
      module: 'ico',
      title: 'Entrega creativa',
      opening: claim('ch-ico-open', 'Agosto cerró con 64 piezas: la calidad subió y el plazo quedó a cuatro puntos de su meta.'),
      claims: [],
      charts: ICO_CHARTS,
      readings: ICO_READINGS,
      tables: [],
      limits: ['RpA no entra en esta edición: el registro de rondas de agosto todavía está abierto.'],
    },
  ],
  actions: [
    { actionId: 'a1', text: 'Reescribir títulos y descripciones de /precios, /servicios y /preguntas-frecuentes: suman el 31 % de las impresiones con un CTR bajo 1 %.', factIds: ['seo.ctr_aug'] },
    { actionId: 'a2', text: 'Probar un formulario corto en /servicios y /precios: es el paso más débil del embudo.', factIds: ['seo.contact_rate'] },
    { actionId: 'a3', text: 'Publicar contenido citable por la IA en las 14 páginas que ya rankean.', factIds: ['aeo.cited_links'] },
    { actionId: 'a4', text: 'Enlazar internamente las 21 keywords en posiciones 11 a 20.', factIds: [] },
    { actionId: 'a5', text: 'Comprimir las imágenes del blog a WebP para llegar a la meta técnica.', factIds: ['seo.tech_score'] },
  ],
  limits: ['Las cifras son las del corte indicado en cada módulo. Esta edición no se actualiza: una lectura nueva sale como versión nueva.'],
  methodology: [
    'Visibilidad orgánica: Google Search Console, propiedad de dominio; lectura mensual, versión 2.1; cobertura completa.',
    'Respuestas de IA: panel fijo de 50 consultas en ChatGPT, Gemini y Perplexity, una corrida por motor.',
    'Entrega creativa: motor ICO de Efeonce; plazos, rondas de revisión y aprobación a la primera.',
  ],
  references: [
    { referenceId: 'r1', label: 'Informe de rendimiento de Google Search Console' },
    { referenceId: 'r2', label: 'Metodología del panel de respuestas de IA de Efeonce' },
  ],
  facts,
}

const base = (token: string): InsightSharedEditionResponseV1 => ({
  modelVersion: '1.0',
  header: {
    organizationName: 'Greenhouse Demo',
    reportCode: 'EO-INS-000123',
    reportTitle: 'Visibilidad, respuestas de IA y entrega',
    editionVersion: 2,
    periodLabel: '1 al 31 de agosto de 2026',
    periodStart: '2026-08-01',
    periodEndExclusive: '2026-09-01',
    timeZone: 'America/Santiago',
    issuedAt: '2026-09-02T12:00:00-03:00',
    asOfMax: '2026-08-31',
    clientLogo: { href: `/api/public/insights/shared/${token}/logo`, variant: 'default' },
  },
  model,
  downloads: [
    { output: 'report_pdf', status: 'available', href: `/api/public/insights/shared/${token}/outputs/report_pdf` },
    { output: 'deck_pdf', status: 'unavailable' },
  ],
  expiresAt: '2026-09-30T23:59:59-03:00',
})

/** Quita los campos editoriales v2: así se ve un modelo sellado antes de TASK-1888. */
const withoutV2 = (edition: InsightSharedEditionResponseV1): InsightSharedEditionResponseV1 => ({
  ...edition,
  model: {
    ...edition.model,
    essentials: undefined,
    decision: undefined,
    scopeLines: undefined,
    chapters: edition.model.chapters.map((chapter) => ({ ...chapter, opening: undefined, readings: undefined })),
  },
})

/** Logo de ejemplo del cliente (sólo dev): una marca de palabra neutra, sin parecerse a ninguna real. */
/** Logo del fixture con el MISMO gate que Greenhouse: sólo si el enlace existe y la edición trae logo. */
export const fixtureLogoResponse = (token: string): Response => {
  const result = resolveInsightFixture(token)
  if (result?.status !== 'ok' || !result.edition.header.clientLogo) {
    return new Response(null, { status: result?.status === 'gone' ? 410 : 404 })
  }
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 48"><rect width="240" height="48" rx="10" fill="#1d4d3a"/><circle cx="26" cy="24" r="10" fill="#9fe0b7"/><text x="46" y="31" font-family="Georgia, serif" font-size="20" fill="#ffffff">Greenhouse Demo</text></svg>`,
    { headers: { 'content-type': 'image/svg+xml' } },
  )
}

/** Contenido extremo: muchos hallazgos, nombres y cifras largas, un capítulo con muchas figuras. */
const extreme = (token: string): InsightSharedEditionResponseV1 => {
  const edition = base(token)
  const longClaims = Array.from({ length: 9 }, (_, i) =>
    claim(`x-${i}`, `${['Más clics', 'Más audiencia nueva', 'La IA nombra la marca', 'Fuga en el contacto', 'Base técnica', 'CTR al alza', 'Posición media', 'Citas con enlace', 'Oportunidades calificadas'][i]}: una afirmación deliberadamente larga para probar cómo se acomoda el texto cuando el plan trae frases de más de dos líneas en la grilla de hallazgos.`, [['seo.clicks_change', 'seo.nonbrand_share', 'aeo.mention_rate', 'seo.contact_rate', 'seo.tech_score', 'seo.ctr_aug', 'seo.position_aug', 'aeo.cited_links', 'seo.f_sql'][i]]),
  )
  return {
    ...edition,
    header: { ...edition.header, organizationName: 'Compañía Sudamericana de Distribución y Servicios Integrados de Consumo Masivo S.A.', reportTitle: 'Visibilidad orgánica, respuestas de inteligencia artificial, conversión comercial y entrega creativa del trimestre' },
    model: { ...edition.model, essentials: longClaims, facts: { ...edition.model.facts, 'seo.clicks_aug': { ...edition.model.facts['seo.clicks_aug'], display: '1.284.567.890' } } },
  }
}

export const resolveInsightFixture = (token: string): SharedInsightResult | null => {
  switch (token) {
    case 'fixture-completo':
      return { status: 'ok', edition: base(token) }
    case 'fixture-parcial': {
      const edition = base(token)
      return {
        status: 'ok',
        edition: {
          ...edition,
          header: { ...edition.header, asOfMax: '2026-08-24' },
          model: { ...edition.model, chapters: edition.model.chapters.map((ch) => (ch.module === 'ico' ? { ...ch, opening: undefined, charts: [], readings: [], limits: ['Sin entregas cerradas en el corte: el capítulo no tiene cifras todavía.'] } : ch)) },
        },
      }
    }
    case 'fixture-v1':
      return { status: 'ok', edition: withoutV2(base(token)) }
    case 'fixture-sin-descargas':
      return { status: 'ok', edition: { ...base(token), downloads: base(token).downloads.map((download) => ({ output: download.output, status: 'unavailable' as const })) } }
    case 'fixture-extremo':
      return { status: 'ok', edition: extreme(token) }
    case 'fixture-en':
      return { status: 'ok', edition: { ...base(token), model: { ...base(token).model, locale: 'en-US' } } }
    case 'fixture-no-existe':
      return { status: 'not_found' }
    case 'fixture-retirado':
      return { status: 'gone' }
    case 'fixture-limite':
      return { status: 'rate_limited' }
    case 'fixture-error':
      return { status: 'error' }
    default:
      return { status: 'not_found' }
  }
}

/**
 * Muestra pública del producto (`/insights/muestra`): el fixture completo con una marca ficticia, sin logo de cliente
 * ni descargas. Es un ejemplo para mostrar a clientes, no una edición: sus cifras no corresponden a ninguna marca real.
 */
export const insightSampleEdition = (organizationName: string): InsightSharedEditionResponseV1 => {
  const edition = base('muestra')
  const { clientLogo: _logo, ...header } = edition.header
  return { ...edition, header: { ...header, organizationName }, downloads: [] }
}
