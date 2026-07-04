/**
 * Contrato de la primitiva canónica **EngineAvatarGroup**.
 *
 * Grupo compacto de motores de IA medidos/citados, expresado como avatares de marca
 * solapados con tooltip y microinteracción de pull-up. Es presentación pura: el consumer
 * entrega proveedores normalizados y la primitiva resuelve orden visual, deduplicación,
 * overflow y accesibilidad.
 */
export type EngineAvatarGroupSize = 'sm' | 'md'

export interface EngineAvatarGroupProps {
  /** IDs de proveedores, ej. "openai", "gemini", "perplexity", "google_ai_overview". */
  providers: string[]
  /** Cantidad máxima visible antes de compactar en +N. Default 6. */
  max?: number
  /** Tamaño visual de cada avatar. Default "md". */
  size?: EngineAvatarGroupSize
}
