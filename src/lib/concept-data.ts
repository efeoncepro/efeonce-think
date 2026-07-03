import { fetchPublicReport } from '@lib/report'

/**
 * Loader compartido para los 3 conceptos de art direction (product-design-loop Fase 1).
 * Extrae los campos que definen el hero/verdict/evidencia desde el modelo headless real,
 * para que los 3 conceptos rendericen DATA REAL (no mockup falso). Temporal (exploración).
 */

// Token demo real (el del correo) — solo para la exploración de conceptos.
export const CONCEPT_DEMO_TOKEN =
  'grt-21f97a38c0fb4c27bb69fcb949a88fc85b727e79bfed47c7b3fc0931a97eb138'

export interface ConceptEngine {
  provider: string
  present: number
  logo: string | null
  label: string
}

export interface ConceptModel {
  organizationName: string
  reportDate: string
  periodLabel: string
  headlineFrame: string
  overallScore: number | null
  overallSeverity: string
  perceptionScore: number | null
  agenticScore: number | null
  primaryGapTitle: string | null
  primaryGapSeverity: string
  engines: ConceptEngine[]
  isPartial: boolean
}

const ENGINE_LOGO: Record<string, string> = {
  gemini: '/logos/engines/gemini.svg',
  chatgpt: '/logos/engines/chatgpt.svg',
  openai: '/logos/engines/chatgpt.svg',
  perplexity: '/logos/engines/perplexity.svg',
}

const ENGINE_LABEL: Record<string, string> = {
  gemini: 'Gemini',
  google_ai_overview: 'Google AI Overview',
  google_ai_mode: 'Google AI Mode',
  chatgpt: 'ChatGPT',
  openai: 'ChatGPT',
  perplexity: 'Perplexity',
  copilot: 'Copilot',
}

const round = (v: unknown): number | null => (typeof v === 'number' ? Math.round(v) : null)

export async function getConceptModel(token = CONCEPT_DEMO_TOKEN): Promise<ConceptModel | null> {
  const res = await fetchPublicReport(token)
  if (res.status !== 'ok') return null
  const m = res.model as Record<string, any>
  const h = res.header

  return {
    organizationName: h.organizationName ?? 'Tu marca',
    reportDate: h.reportDate ?? '',
    periodLabel: h.periodLabel ?? '',
    headlineFrame: m.headline?.frame ?? '',
    overallScore: round(m.overallScore),
    overallSeverity: m.overallSeverity ?? 'sin_dato',
    perceptionScore: round(m.perceptionAxisScore),
    agenticScore: round(m.agenticAxisScore),
    primaryGapTitle: m.primaryGap?.title ?? null,
    primaryGapSeverity: m.primaryGap?.severity ?? 'critico',
    isPartial: m.gate?.status === 'partial',
    engines: ((m.engineSnapshot as any[]) ?? []).map((e) => ({
      provider: e.provider,
      present: e.present ?? 0,
      logo: ENGINE_LOGO[e.provider] ?? null,
      label: ENGINE_LABEL[e.provider] ?? e.provider,
    })),
  }
}
