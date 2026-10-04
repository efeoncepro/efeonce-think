/**
 * Ícono Trazo (catálogo AXIS) por métrica de Insights. Los SVG viven en `public/branding/icons/`, generados con
 * `resolveIcon` de `@efeoncepro/axis-graphic-line`; nunca se dibujan a mano. Una métrica sin ícono no lleva ninguno.
 */
// Respaldo para ediciones anteriores a `metricIcon` (TASK-1990/1996): el mismo mapa que `metric-glyphs.ts` de Greenhouse.
const ICON_BY_METRIC: Record<string, string> = {
  clicks: 'clic',
  impressions: 'impresion',
  ctr: 'ctr',
  position: 'posicion',
  rank: 'posicion',
  page_one_keywords: 'keyword',
  keywords_top10: 'keyword',
  keywords_tracked: 'keyword',
  organic_etv: 'visita',
  ai_sessions: 'visita',
  share_of_model: 'ia',
  share_of_voice: 'competencia',
  citation_share: 'enlace',
  overall_score: 'medicion',
  otd: 'reloj',
  otd_pct: 'reloj',
  ftr: 'checklist',
  ftr_pct: 'checklist',
  rpa: 'reunion',
  'delivered.completed': 'assets',
}

/** Familias con prefijo (`sov.brand`, `sov.competitor.x`). */
const ICON_BY_FAMILY: Record<string, string> = { sov: 'competencia', site: 'visita', ai_source: 'visita', mention_rate: 'cita' }

export const insightIconFor = (metricId: string | undefined): string | null => {
  if (!metricId) return null
  const glyph = ICON_BY_METRIC[metricId] ?? ICON_BY_FAMILY[metricId.split('.')[0]]
  return glyph ? `/branding/icons/trazo-${glyph}.svg` : null
}
