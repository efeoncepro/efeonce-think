/**
 * Ícono Trazo (catálogo AXIS) por métrica de Insights. Los SVG viven en `public/branding/icons/`, generados con
 * `resolveIcon` de `@efeoncepro/axis-graphic-line`; nunca se dibujan a mano. Una métrica sin ícono no lleva ninguno.
 */
const ICON_BY_METRIC: Record<string, string> = {
  clicks: 'medicion',
  impressions: 'buscador',
  ctr: 'objetivo',
  position: 'busqueda',
  keywords_tracked: 'busqueda',
  keywords_top10: 'objetivo',
  page_one_keywords: 'objetivo',
  organic_etv: 'medicion',
  share_of_model: 'ia',
  ai_sessions: 'ia',
  citation_share: 'web',
  overall_score: 'medicion',
  otd: 'reloj',
  ftr: 'checklist',
  rpa: 'reunion',
  'delivered.completed': 'checklist',
}

/** Familias con prefijo (`sov.brand`, `sov.competitor.x`). */
const ICON_BY_FAMILY: Record<string, string> = { sov: 'ia' }

export const insightIconFor = (metricId: string | undefined): string | null => {
  if (!metricId) return null
  const glyph = ICON_BY_METRIC[metricId] ?? ICON_BY_FAMILY[metricId.split('.')[0]]
  return glyph ? `/branding/icons/trazo-${glyph}.svg` : null
}
