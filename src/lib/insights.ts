import { GREENHOUSE_API_BASE, GREENHOUSE_API_BYPASS, GREENHOUSE_THINK_KEY } from 'astro:env/server'
import { acceptSharedEdition } from './insights-accept'

/**
 * Cliente headless del informe compartido de Efeonce Insights (TASK-1875, greenhouse-eo).
 *
 * Consume `GET {base}/api/public/insights/shared/{token}` (TASK-1848) → `InsightSharedEditionResponseV1`. Think es un
 * render tonto: no calcula, no compara, no interpola. El fetch es SERVER-SIDE y SIN CACHE (revocar debe revocar en la
 * lectura siguiente, a diferencia del Grader); el token nunca se escribe en logs, HTML ni analytics.
 *
 * Los tipos son copia del contrato de Greenhouse (`src/lib/efeonce-insights/contracts/web-model.ts`, modelVersion 1.1).
 * Los campos marcados «v2» (editorial de TASK-1888) y «1.1» son OPCIONALES: un modelo 1.0 se dibuja igual.
 */

export type InsightModule = 'seo' | 'aeo' | 'ico'
export type InsightOutput = 'deck_pdf' | 'report_pdf' | 'web'
export type EvidenceUnit = 'count' | 'percent' | 'ratio' | 'position' | 'score' | 'days' | 'visits_estimated' | 'usd' | 'clp'

export interface InsightWebFactV1 {
  factId: string
  module: InsightModule
  /** 1.2 — métrica del hecho; sólo para elegir el ícono. */
  metricId?: string
  label: string
  /** null = ausente (nunca un cero disfrazado). */
  value: number | null
  unit: EvidenceUnit
  /** Cifra ya formateada por Greenhouse: lo ÚNICO que se imprime como texto. */
  display: string
  observation: 'observed' | 'estimated'
  source: string
  /** 1.2 — unidad legible («Cantidad»); vacía si no tiene nombre de cara al lector. */
  unitLabel?: string
  asOf: string | null
  /** 1.2 — corte legible por locale («20 sept 2026»). */
  asOfLabel?: string | null
  /** 1.2 — canal (motor de respuesta, buscador). */
  channelId?: string
  /** 1.2 — hecho del período anterior con que se compara; nunca se muestra como tarjeta suelta. */
  comparisonFactId?: string
  absentReason: 'no_data' | null
}

export interface InsightWebClaimV1 {
  claimId: string
  text: string
  factIds: string[]
  /** 1.2 — en capítulo: hallazgo (se dice) o respaldo (sólo su cifra). Ausente en modelos previos. */
  role?: 'finding' | 'backing'
  /** 1.2 — cifra protagonista de una esencial: el cambio frente al período anterior. */
  figure?: { display: string; direction: 'up' | 'down' | 'flat'; kind?: 'change' | 'level' }
}

export interface ChartSeriesV1 {
  seriesId: string
  label: string
  factIds: string[]
  unit: string
}

/** Datos propios de las familias de TASK-1888 (cada número es un `factId` del modelo). */
export type ChartFamilyDataV1 =
  | { kind: 'bullet'; direction: 'higher_is_better' | 'lower_is_better'; items: Array<{ itemId: string; label: string; valueFactId: string; targetFactId: string; bandFactId?: string }> }
  | { kind: 'gauge'; valueFactId: string; previousFactId: string; targetFactId: string | null; min: number; max: number }
  | { kind: 'waterfall'; steps: Array<{ stepId: string; label: string; factId: string; isTotal: boolean }> }
  | { kind: 'funnel'; stages: Array<{ stageId: string; label: string; factId: string }> }
  | { kind: 'heatmap'; rowLabels: string[]; columnLabels: string[]; cells: Array<Array<string | null>> }
  | { kind: 'waffle'; parts: Array<{ partId: string; label: string; factId: string }>; totalFactId: string | null }
  | { kind: 'venn_two'; setA: { label: string }; setB: { label: string }; onlyAFactId: string; onlyBFactId: string; bothFactId: string }
  | { kind: 'upset'; sets: Array<{ setId: string; label: string }>; intersections: Array<{ intersectionId: string; setIds: string[]; factId: string }> }

export interface ChartSpecV1 {
  chartId: string
  family: string
  relation: string
  title: string
  series: ChartSeriesV1[]
  dimensionLabels: string[]
  unit: string
  scale: { kind: 'linear'; baseline: 0 | null; perDimension?: true }
  references: Array<{ label: string; factId: string | null; value: number | null }>
  /** v2 — obligatorio en las familias de datos propios; ausente en las de series. */
  data?: ChartFamilyDataV1
}

/** v2 — lectura de una figura: cifra principal, conclusión, «Lo que significa» y «Próximo paso». */
export interface InsightWebReadingV1 {
  chartId: string
  keyFigure?: { factId: string; value: string; caption: InsightWebClaimV1 }
  conclusion?: InsightWebClaimV1
  meaning?: InsightWebClaimV1
  nextStep: InsightWebClaimV1 | null
}

/** 1.1 — cifras que Greenhouse deriva con la geometría de los PDF (el render nunca las calcula). */
export interface InsightWebChartDerivedV1 {
  funnelStepRates?: Array<{ stageId: string; display: string | null }>
}

export interface InsightWebChapterV1 {
  chapterId: string
  module: InsightModule
  title: string
  claims: InsightWebClaimV1[]
  charts: Array<{ spec: ChartSpecV1; table: { columns: string[]; rows: Array<Array<string | null>> }; derived?: InsightWebChartDerivedV1; unitLabel?: string }>
  tables: Array<{ tableId: string; title: string; columns: string[]; rows: Array<Array<string | null>> }>
  limits: string[]
  /** v2 */
  opening?: InsightWebClaimV1
  /** v2 */
  readings?: InsightWebReadingV1[]
}

export interface InsightWebModelV1 {
  modelVersion: string
  locale: string
  executiveSummary: InsightWebClaimV1[]
  chapters: InsightWebChapterV1[]
  actions: Array<{ actionId: string; text: string; factIds: string[] }>
  limits: string[]
  methodology: string[]
  references: Array<{ referenceId: string; label: string }>
  facts: Record<string, InsightWebFactV1>
  /** v2 — «Lo esencial del mes». */
  essentials?: InsightWebClaimV1[]
  /** v2 — «Para decidir en la reunión». */
  decision?: InsightWebClaimV1
  /** v2 — «Qué mide este informe». */
  scopeLines?: string[]
  /** v2 — «Cómo lo mediremos». */
  measurement?: InsightWebClaimV1
  /** v2 — «Qué necesitamos de ustedes». */
  ask?: InsightWebClaimV1
}

export interface InsightSharedHeaderV1 {
  organizationName: string
  reportCode: string
  reportTitle: string
  editionVersion: number
  periodLabel: string
  periodStart: string
  periodEndExclusive: string
  timeZone: string
  issuedAt: string
  asOfMax: string | null
  /** 1.1 — logo del cliente por el proxy de Greenhouse; `variant` dice sobre qué fondo se diseñó. */
  clientLogo?: { href: string; variant: 'on_dark' | 'default' }
  /** 1.2 — alcance de la portada: etiqueta y glifo Trazo (archivo `/branding/icons/trazo-<glyph>-dark.svg`). */
  scopeChips?: Array<{ key: string; label: string; glyph: string; line: string }>
}

export interface InsightSharedDownloadV1 {
  output: InsightOutput
  status: 'available' | 'unavailable'
  href?: string
}

export interface InsightSharedEditionResponseV1 {
  modelVersion: string
  header: InsightSharedHeaderV1
  model: InsightWebModelV1
  downloads: InsightSharedDownloadV1[]
  expiresAt: string
}

export type SharedInsightResult =
  | { status: 'ok'; edition: InsightSharedEditionResponseV1 }
  | { status: 'not_found' }
  | { status: 'gone' }
  | { status: 'rate_limited' }
  | { status: 'error' }

/** Versiones del modelo que este render sabe dibujar: la mayor 1 es aditiva (un campo nuevo no rompe). */
export { isSupportedModelVersion } from './insights-accept'

const apiBase = () => (GREENHOUSE_API_BASE || 'https://greenhouse.efeoncepro.com').replace(/\/+$/, '')

/** Cabeceras server-side hacia Greenhouse: la llave de Think (excepción del Firewall) y, sólo en staging, el bypass. */
const serverHeaders = (accept: string): Record<string, string> => ({
  accept,
  ...(GREENHOUSE_THINK_KEY ? { 'x-efeonce-think-key': GREENHOUSE_THINK_KEY } : {}),
  ...(GREENHOUSE_API_BYPASS ? { 'x-vercel-protection-bypass': GREENHOUSE_API_BYPASS } : {}),
})

/**
 * Fixtures del modelo para ver el informe en `astro dev` sin Greenhouse. Sólo en desarrollo: en un build de
 * producción `import.meta.env.DEV` es false y el bloque ni siquiera se evalúa, así que un token `fixture-*` real
 * sigue el camino normal contra Greenhouse.
 */
const devFixture = async (token: string): Promise<SharedInsightResult | null> => {
  if (!import.meta.env.DEV || !token.startsWith('fixture-')) return null
  const { resolveInsightFixture } = await import('./insights-fixtures')
  const result = resolveInsightFixture(token)

  // Un fixture pasa por la MISMA aceptación que la respuesta real (así se prueba el major no soportado).
  return result?.status === 'ok' ? acceptSharedEdition(result.edition) : result
}

export async function fetchSharedInsightEdition(token: string): Promise<SharedInsightResult> {
  const fixture = await devFixture(token)
  if (fixture) return fixture

  let res: Response
  try {
    res = await fetch(`${apiBase()}/api/public/insights/shared/${encodeURIComponent(token)}`, {
      headers: serverHeaders('application/json'),
      cache: 'no-store',
    })
  } catch (e) {
    // Nunca el token ni la URL en el log: sólo la clase de falla.
    console.error('[insights] fetch threw', (e as Error).name)
    return { status: 'error' }
  }

  // 404 = desconocido, expirado, módulo ausente u organización suspendida: indistintos por diseño.
  if (res.status === 404) return { status: 'not_found' }
  // 410 = revocado o retirado.
  if (res.status === 410) return { status: 'gone' }
  if (res.status === 429) return { status: 'rate_limited' }
  if (!res.ok) {
    console.error('[insights] non-2xx', res.status)
    return { status: 'error' }
  }

  try {
    return acceptSharedEdition(await res.json())
  } catch {
    return { status: 'error' }
  }
}

/**
 * Descarga por el proxy de Greenhouse (que revalida el grant en cada pedido). Think nunca conoce ni expone una URL de
 * almacenamiento: reenvía el cuerpo tal cual con `no-store`.
 */
export async function fetchSharedInsightOutput(token: string, output: InsightOutput): Promise<Response> {
  if (import.meta.env.DEV && token.startsWith('fixture-')) return new Response(null, { status: 404 })

  try {
    const res = await fetch(`${apiBase()}/api/public/insights/shared/${encodeURIComponent(token)}/outputs/${encodeURIComponent(output)}`, {
      headers: serverHeaders('application/pdf'),
      cache: 'no-store',
    })

    return res
  } catch (e) {
    console.error('[insights] output fetch threw', (e as Error).name)
    return new Response(null, { status: 502 })
  }
}

/** 1.1 — logo del cliente por el proxy de Greenhouse (mismo gate del token: revocar corta el logo). */
export async function fetchSharedInsightLogo(token: string): Promise<Response> {
  if (import.meta.env.DEV && token.startsWith('fixture-')) {
    const { fixtureLogoResponse } = await import('./insights-fixtures')
    return fixtureLogoResponse(token)
  }

  try {
    return await fetch(`${apiBase()}/api/public/insights/shared/${encodeURIComponent(token)}/logo`, {
      headers: serverHeaders('image/*'),
      cache: 'no-store',
    })
  } catch (e) {
    console.error('[insights] logo fetch threw', (e as Error).name)
    return new Response(null, { status: 502 })
  }
}
