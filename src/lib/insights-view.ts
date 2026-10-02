/**
 * Vista del informe compartido de Insights (TASK-1875): SELECCIONA y AGRUPA lo que trae `InsightWebModelV1`; nunca
 * crea una cifra, una comparación ni un texto. Una función pura para que el layout nativo web (hallazgos que se
 * expanden, filtros por módulo, escenas por capítulo) no meta lógica en el template.
 */
import type { ChartSpecV1, InsightModule, InsightWebChapterV1, InsightWebClaimV1, InsightWebFactV1, InsightWebModelV1, InsightWebReadingV1 } from './insights'

export interface FindingEvidence {
  chapterId: string
  chart: InsightWebChapterV1['charts'][number]
  reading?: InsightWebReadingV1
}

export interface FindingView {
  id: string
  module: InsightModule | null
  claim: InsightWebClaimV1
  /** La cifra protagonista: el primer hecho de la afirmación (lo decide el orden del plan, no el render). */
  fact?: InsightWebFactV1
  evidence?: FindingEvidence
}

export interface ModuleView {
  module: InsightModule
  chapterId: string
  title: string
  /** Nombre corto para navegación (1.3); en un modelo previo, el título del capítulo. */
  label: string
}

/**
 * Evidencia de un hallazgo: la figura que Greenhouse declara en `claim.evidence` (modelo 1.3). Think la RESUELVE por
 * ids; no la busca recorriendo capítulos. Un modelo previo sin referencia muestra el hallazgo sin figura.
 */
export const resolveEvidence = (model: InsightWebModelV1, ref: InsightWebClaimV1['evidence']): FindingEvidence | undefined => {
  if (!ref) return undefined
  const chapter = model.chapters.find((c) => c.chapterId === ref.chapterId)
  const chart = chapter?.charts.find((c) => c.spec.chartId === ref.chartId)
  if (!chapter || !chart) return undefined
  return { chapterId: chapter.chapterId, chart, reading: chapter.readings?.find((r) => r.chartId === ref.chartId) }
}

/**
 * Hallazgos: «Lo esencial del mes» (v2). Un modelo v1 no lo trae: se usan las afirmaciones del resumen que citan
 * hechos, en su orden. Sin ninguna, no hay grilla. Módulo y evidencia vienen del modelo (1.3).
 */
export const buildFindings = (model: InsightWebModelV1): FindingView[] => {
  const claims = model.essentials?.length ? model.essentials : model.executiveSummary.filter((claim) => claim.factIds.length > 0)
  return claims.map((claim) => ({
    id: `h-${claim.claimId}`,
    module: claim.module ?? null,
    claim,
    fact: claim.factIds.map((id) => model.facts[id]).find(Boolean),
    evidence: resolveEvidence(model, claim.evidence),
  }))
}

export const buildModules = (model: InsightWebModelV1): ModuleView[] =>
  model.chapters.map((chapter) => ({ module: chapter.module, chapterId: chapter.chapterId, title: chapter.title, label: chapter.label ?? chapter.title }))

/** Nombre corto de un módulo según el capítulo que el modelo trae (1.3 `chapter.label`). */
export const moduleLabelOf = (model: InsightWebModelV1, module: InsightModule | null | undefined): string | null => {
  if (!module) return null
  const chapter = model.chapters.find((c) => c.module === module)
  return chapter ? (chapter.label ?? chapter.title) : null
}

/** El titular del informe es la primera afirmación del resumen; el resto es su bajada. */
export const splitSummary = (model: InsightWebModelV1) => ({
  headline: model.executiveSummary[0],
  rest: model.executiveSummary.slice(1),
})

/** Todos los hechos que dibuja una figura: los de sus series y los de sus datos propios (TASK-1888). */
export const chartFactIds = (spec: ChartSpecV1): string[] => {
  const ids = spec.series.flatMap((series) => series.factIds)
  const data = spec.data
  if (!data) return ids
  switch (data.kind) {
    case 'bullet': return [...ids, ...data.items.flatMap((it) => [it.valueFactId, it.targetFactId, ...(it.bandFactId ? [it.bandFactId] : [])])]
    case 'gauge': return [...ids, data.valueFactId, data.previousFactId, ...(data.targetFactId ? [data.targetFactId] : [])]
    case 'waterfall': return [...ids, ...data.steps.map((st) => st.factId)]
    case 'funnel': return [...ids, ...data.stages.map((st) => st.factId)]
    case 'heatmap': return [...ids, ...data.cells.flat().filter((id): id is string => !!id)]
    case 'waffle': return [...ids, ...data.parts.map((p) => p.factId), ...(data.totalFactId ? [data.totalFactId] : [])]
    case 'venn_two': return [...ids, data.onlyAFactId, data.onlyBFactId, data.bothFactId]
    case 'upset': return [...ids, ...data.intersections.map((it) => it.factId)]
  }
}

/**
 * Jerarquía de un texto largo del modelo (la decisión): lo que se pide, a lo grande, y el resto como lectura. Parte en
 * los dos puntos si la petición es corta; si no, en la primera oración. Nunca reescribe: las dos partes, unidas, son el
 * texto original (en la partición por dos puntos, la cabeza los omite: el layout ya une petición y lectura, y
 * `joiner` los devuelve). Si ninguna partición deja una cabeza legible, todo va como cabeza.
 */
export const splitLead = (text: string): { lead: string; rest: string | null; joiner: string } => {
  const clean = text.trim()
  const colon = clean.indexOf(':')
  if (colon >= 12 && colon <= 80 && clean.length - colon > 20) {
    return { lead: clean.slice(0, colon), rest: clean.slice(colon + 1).trim(), joiner: ': ' }
  }
  const sentence = /^(.{12,110}?[.!?])\s+(\S[\s\S]*)$/.exec(clean)
  if (sentence) return { lead: sentence[1]!, rest: sentence[2]!, joiner: ' ' }
  return { lead: clean, rest: null, joiner: '' }
}
