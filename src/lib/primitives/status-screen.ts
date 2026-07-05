/**
 * StatusScreen — contrato de la primitiva de pantallas de estado del hub.
 *
 * Un primitive = una fuente de verdad, muchos consumers. Las rutas token-gated del hub
 * (`/brand-visibility/r/[token]`, `/s/[code]`) y el 404 global colapsan sus bloques de
 * "enlace inválido / expirado / demasiadas solicitudes / error" a `<StatusScreen kind=… />`.
 *
 * El contrato NO conoce el modelo del grader: sólo el universo de estados HTTP que el hub
 * puede mostrar. El copy canónico vive acá (es-CL, tuteo) para no reescribirlo en cada consumer;
 * el consumer puede override puntual (p. ej. el 404 global, que no es un token sino una ruta).
 */

/** Estados de superficie que el hub renderiza a pantalla completa. */
export type StatusKind = 'not_found' | 'gone' | 'rate_limited' | 'error'

/** Pose del personaje Nexa → `/characters/nexa-<pose>.webp`. */
export type StatusPose = 'not-found' | 'expired' | 'rate-limited' | 'error'

export interface StatusAction {
  label: string
  /** Navegación a una ruta (recuperación real: generar un diagnóstico nuevo). */
  href?: string
  /** Reintento in-place (recarga la misma URL) — para estados transitorios (429/5xx). */
  reload?: boolean
}

export interface StatusScreenContent {
  pose: StatusPose
  /** `status` = informativo (polite); `alert` = requiere reacción del usuario (assertive). */
  role: 'status' | 'alert'
  /** Kicker corto sobre el título (código humano del estado). */
  eyebrow: string
  title: string
  body: string
  /** Acción primaria. `null` = sin acción (raro; todo estado ofrece recuperación). */
  action: StatusAction | null
}

const NEW_DIAGNOSIS: StatusAction = { label: 'Hacer un diagnóstico nuevo', href: '/brand-visibility' }
const RETRY: StatusAction = { label: 'Reintentar', reload: true }

/**
 * Copy canónico por estado (es-CL, tuteo). Fuente única — validado contra el tono del hub.
 * - not_found / gone → permanentes: no hay retry, la recuperación es generar un informe nuevo.
 * - rate_limited / error → transitorios: la recuperación es reintentar.
 */
export const STATUS_CONTENT: Record<StatusKind, StatusScreenContent> = {
  not_found: {
    pose: 'not-found',
    role: 'status',
    eyebrow: 'Enlace no encontrado',
    title: 'No encontramos este informe',
    body: 'El enlace que abriste no es válido o el informe ya no existe. Puedes generar uno nuevo en un par de minutos.',
    action: NEW_DIAGNOSIS
  },
  gone: {
    pose: 'expired',
    role: 'status',
    eyebrow: 'Enlace expirado',
    title: 'Este enlace expiró',
    body: 'El informe que buscabas venció o su enlace fue revocado. Genera un diagnóstico nuevo y te damos un enlace fresco.',
    action: NEW_DIAGNOSIS
  },
  rate_limited: {
    pose: 'rate-limited',
    role: 'alert',
    eyebrow: 'Demasiadas solicitudes',
    title: 'Espera un momento',
    body: 'Recibimos muchas solicitudes desde tu conexión. Aguanta unos segundos y vuelve a intentarlo.',
    action: RETRY
  },
  error: {
    pose: 'error',
    role: 'alert',
    eyebrow: 'Algo salió mal',
    title: 'No pudimos cargar tu informe',
    body: 'Tuvimos un problema al cargar el informe. No es tu culpa — vuelve a intentar en unos minutos.',
    action: RETRY
  }
}
