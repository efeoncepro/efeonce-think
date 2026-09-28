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
}

const chartHasFact = (spec: ChartSpecV1, factId: string) => spec.series.some((series) => series.factIds.includes(factId))

/** Evidencia de un hecho: primero la figura cuya cifra principal ES ese hecho; si no, la figura que lo dibuja. */
export const findEvidence = (model: InsightWebModelV1, factId: string): FindingEvidence | undefined => {
  for (const chapter of model.chapters) {
    for (const chart of chapter.charts) {
      const reading = chapter.readings?.find((r) => r.chartId === chart.spec.chartId)
      if (reading?.keyFigure?.factId === factId) return { chapterId: chapter.chapterId, chart, reading }
    }
  }
  for (const chapter of model.chapters) {
    for (const chart of chapter.charts) {
      if (chartHasFact(chart.spec, factId)) {
        return { chapterId: chapter.chapterId, chart, reading: chapter.readings?.find((r) => r.chartId === chart.spec.chartId) }
      }
    }
  }
  return undefined
}

/**
 * Hallazgos: «Lo esencial del mes» (v2). Un modelo v1 no lo trae: se usan las afirmaciones del resumen que citan
 * hechos, en su orden. Sin ninguna, no hay grilla.
 */
export const buildFindings = (model: InsightWebModelV1): FindingView[] => {
  const claims = model.essentials?.length ? model.essentials : model.executiveSummary.filter((claim) => claim.factIds.length > 0)
  return claims.map((claim) => {
    const fact = claim.factIds.map((id) => model.facts[id]).find(Boolean)
    return {
      id: `h-${claim.claimId}`,
      module: fact?.module ?? null,
      claim,
      fact,
      evidence: fact ? findEvidence(model, fact.factId) : undefined,
    }
  })
}

export const buildModules = (model: InsightWebModelV1): ModuleView[] =>
  model.chapters.map((chapter) => ({ module: chapter.module, chapterId: chapter.chapterId, title: chapter.title }))

/** El titular del informe es la primera afirmación del resumen; el resto es su bajada. */
export const splitSummary = (model: InsightWebModelV1) => ({
  headline: model.executiveSummary[0],
  rest: model.executiveSummary.slice(1),
})
