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

const facts: Record<string, InsightWebFactV1> = Object.fromEntries(
  Object.entries(seeds).map(([factId, seed]) => [factId, { factId, ...seed, absentReason: seed.value === null ? 'no_data' : null }]),
)

const claim = (claimId: string, text: string, factIds: string[] = []): InsightWebClaimV1 => ({ claimId, text, factIds })
const d = (id: string) => facts[id].display

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
      ],
      readings: [
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
      ],
      readings: [
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
      claims: [],
      charts: [],
      tables: [],
      limits: ['Sin entregas cerradas en agosto: el capítulo no tiene cifras este mes.'],
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

export const resolveInsightFixture = (token: string): SharedInsightResult | null => {
  switch (token) {
    case 'fixture-completo':
      return { status: 'ok', edition: base(token) }
    case 'fixture-parcial':
      return { status: 'ok', edition: { ...base(token), header: { ...base(token).header, asOfMax: '2026-08-24' } } }
    case 'fixture-v1':
      return { status: 'ok', edition: withoutV2(base(token)) }
    case 'fixture-sin-descargas':
      return { status: 'ok', edition: { ...base(token), downloads: base(token).downloads.map((download) => ({ output: download.output, status: 'unavailable' as const })) } }
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
