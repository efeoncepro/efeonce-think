import { GREENHOUSE_API_BASE } from 'astro:env/server'

/**
 * Cliente headless del informe compartido de Efeonce Insights (TASK-1875, greenhouse-eo).
 *
 * Consume `GET {base}/api/public/insights/shared/{token}` (TASK-1848) → `InsightSharedEditionResponseV1`. Think es un
 * render tonto: no calcula, no compara, no interpola. El fetch es SERVER-SIDE y SIN CACHE (revocar debe revocar en la
 * lectura siguiente, a diferencia del Grader); el token nunca se escribe en logs, HTML ni analytics.
 *
 * Los tipos son copia del contrato de Greenhouse (`src/lib/efeonce-insights/contracts/web-model.ts`). Los campos
 * marcados «v2» vienen del contrato editorial de TASK-1888 y son OPCIONALES: un modelo sin ellos se dibuja igual.
 */

export type InsightModule = 'seo' | 'aeo' | 'ico'
export type InsightOutput = 'deck_pdf' | 'report_pdf' | 'web'
export type EvidenceUnit = 'count' | 'percent' | 'ratio' | 'position' | 'score' | 'days' | 'visits_estimated' | 'usd' | 'clp'

export interface InsightWebFactV1 {
  factId: string
  module: InsightModule
  label: string
  /** null = ausente (nunca un cero disfrazado). */
  value: number | null
  unit: EvidenceUnit
  /** Cifra ya formateada por Greenhouse: lo ÚNICO que se imprime como texto. */
  display: string
  observation: 'observed' | 'estimated'
  source: string
  asOf: string | null
  absentReason: 'no_data' | null
}

export interface InsightWebClaimV1 {
  claimId: string
  text: string
  factIds: string[]
}

export interface ChartSeriesV1 {
  seriesId: string
  label: string
  factIds: string[]
  unit: string
}

export interface ChartSpecV1 {
  chartId: string
  family: string
  relation: string
  title: string
  series: ChartSeriesV1[]
  dimensionLabels: string[]
  unit: string
  scale: { kind: 'linear'; baseline: 0 | null }
  references: Array<{ label: string; factId: string | null; value: number | null }>
}

/** v2 — lectura de una figura: cifra principal, conclusión, «Lo que significa» y «Próximo paso». */
export interface InsightWebReadingV1 {
  chartId: string
  keyFigure?: { factId: string; value: string; caption: InsightWebClaimV1 }
  conclusion?: InsightWebClaimV1
  meaning?: InsightWebClaimV1
  nextStep: InsightWebClaimV1 | null
}

export interface InsightWebChapterV1 {
  chapterId: string
  module: InsightModule
  title: string
  claims: InsightWebClaimV1[]
  charts: Array<{ spec: ChartSpecV1; table: { columns: string[]; rows: Array<Array<string | null>> } }>
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
export const isSupportedModelVersion = (version: unknown): boolean => typeof version === 'string' && /^1\.\d+$/.test(version)

const apiBase = () => (GREENHOUSE_API_BASE || 'https://greenhouse.efeoncepro.com').replace(/\/+$/, '')

/**
 * Fixtures del modelo para ver el informe en `astro dev` sin Greenhouse. Sólo en desarrollo: en un build de
 * producción `import.meta.env.DEV` es false y el bloque ni siquiera se evalúa, así que un token `fixture-*` real
 * sigue el camino normal contra Greenhouse.
 */
const devFixture = async (token: string): Promise<SharedInsightResult | null> => {
  if (!import.meta.env.DEV || !token.startsWith('fixture-')) return null
  const { resolveInsightFixture } = await import('./insights-fixtures')

  return resolveInsightFixture(token)
}

export async function fetchSharedInsightEdition(token: string): Promise<SharedInsightResult> {
  const fixture = await devFixture(token)
  if (fixture) return fixture

  let res: Response
  try {
    res = await fetch(`${apiBase()}/api/public/insights/shared/${encodeURIComponent(token)}`, {
      headers: { accept: 'application/json' },
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
    const edition = (await res.json()) as InsightSharedEditionResponseV1
    if (!isSupportedModelVersion(edition?.modelVersion) || !edition.model || !edition.header) {
      console.error('[insights] unsupported model', String(edition?.modelVersion))
      return { status: 'error' }
    }

    return { status: 'ok', edition }
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
      cache: 'no-store',
    })

    return res
  } catch (e) {
    console.error('[insights] output fetch threw', (e as Error).name)
    return new Response(null, { status: 502 })
  }
}
