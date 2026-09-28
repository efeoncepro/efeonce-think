/**
 * Aceptación del payload del informe compartido (TASK-1875, greenhouse-eo): la única puerta por la que un modelo llega
 * al render, venga de Greenhouse o de un fixture de desarrollo. Un major no soportado, o un payload sin `model` o sin
 * `header`, es `error` (502 visible + log), nunca un render parcial. Sin imports de Astro para poder probarla con
 * `node --test`.
 */
import type { InsightSharedEditionResponseV1, SharedInsightResult } from './insights'

/** Think entiende la familia 1.x (1.1 es aditivo sobre 1.0). Otro major exige actualizar Think antes de servirlo. */
export const isSupportedModelVersion = (version: unknown): boolean => typeof version === 'string' && /^1\.\d+$/.test(version)

export const acceptSharedEdition = (payload: unknown): SharedInsightResult => {
  const edition = payload as InsightSharedEditionResponseV1 | null | undefined
  if (!edition || !isSupportedModelVersion(edition.modelVersion) || !edition.model || !edition.header) {
    // Nunca el token: sólo la versión recibida.
    console.error('[insights] unsupported model', String(edition?.modelVersion))
    return { status: 'error' }
  }
  return { status: 'ok', edition }
}
