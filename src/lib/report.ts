import { GREENHOUSE_API_BASE } from 'astro:env/server'

/**
 * Cliente headless del informe público del AI Visibility Grader.
 *
 * Consume el contrato de TASK-1280: `GET {base}/api/public/growth/ai-visibility/report/{token}`
 * → `{ report, model, modelVersion, header }`. El fetch es SERVER-SIDE (SSR): el token
 * (256 bits = la autenticación) NUNCA llega al browser. No-leak garantizado por el
 * backend (el modelo `publicWeb` no carga evidencia cruda de providers).
 *
 * El render "tonto" del `model` (variant publicWeb) con Tailwind + blend AXIS es el
 * grueso de TASK-1325 Slice 2. Este cliente sólo trae el modelo y clasifica el estado.
 */

export interface ReportHeader {
  organizationName?: string
  reportDate?: string
  periodLabel?: string
}

export type ReportFetchResult =
  | { status: 'ok'; header: ReportHeader; model: Record<string, unknown>; report: unknown; modelVersion?: string; runPublicId?: string }
  | { status: 'not_found' }
  | { status: 'rate_limited' }
  | { status: 'error' }

export async function fetchPublicReport(token: string): Promise<ReportFetchResult> {
  const base = (GREENHOUSE_API_BASE || 'https://greenhouse.efeoncepro.com').replace(/\/+$/, '')
  const url = `${base}/api/public/growth/ai-visibility/report/${encodeURIComponent(token)}`

  let res: Response
  try {
    res = await fetch(url, { headers: { accept: 'application/json' } })
  } catch (e) {
    console.error('[report] fetch threw', url, (e as Error).message)
    return { status: 'error' }
  }
  if (res.status !== 200) console.error('[report] non-200', url, res.status)

  // 404 = token inexistente o expirado (el backend no distingue, por diseño).
  if (res.status === 404) return { status: 'not_found' }
  // 429 = rate-limit por IP; el consumer debe reintentar con backoff.
  if (res.status === 429) return { status: 'rate_limited' }
  if (!res.ok) return { status: 'error' }

  try {
    const data = (await res.json()) as {
      header?: ReportHeader
      model?: Record<string, unknown>
      report?: unknown
      modelVersion?: string
      runPublicId?: string
    }
    return {
      status: 'ok',
      header: data.header ?? {},
      model: data.model ?? {},
      report: data.report,
      modelVersion: data.modelVersion,
      runPublicId: typeof data.runPublicId === 'string' ? data.runPublicId : undefined,
    }
  } catch {
    return { status: 'error' }
  }
}

/**
 * Resolución de un short link del informe (TASK-1330).
 *
 * Consume `GET {base}/api/public/growth/ai-visibility/report/short-link/{code}` → resuelve el código
 * a `{ status: 'active', reportToken }`. El fetch es SERVER-SIDE: el token viaja server-to-server y
 * NUNCA llega al browser. `/s/[code].astro` usa esto para `Astro.rewrite` a la página del token
 * (render-in-place, la URL corta se conserva). Estados: `active` (con token), `not_found` (404),
 * `gone` (410, revocado/expirado), `rate_limited` (429), `error`.
 */
export type ShortLinkResolution =
  | { status: 'active'; reportToken: string }
  | { status: 'not_found' }
  | { status: 'gone' }
  | { status: 'rate_limited' }
  | { status: 'error' }

export async function resolveShortLink(code: string): Promise<ShortLinkResolution> {
  const base = (GREENHOUSE_API_BASE || 'https://greenhouse.efeoncepro.com').replace(/\/+$/, '')
  const url = `${base}/api/public/growth/ai-visibility/report/short-link/${encodeURIComponent(code)}`

  let res: Response
  try {
    res = await fetch(url, { headers: { accept: 'application/json' } })
  } catch (e) {
    console.error('[short-link] fetch threw', url, (e as Error).message)
    return { status: 'error' }
  }

  if (res.status === 404) return { status: 'not_found' }
  if (res.status === 410) return { status: 'gone' }
  if (res.status === 429) return { status: 'rate_limited' }
  if (!res.ok) {
    console.error('[short-link] non-2xx', url, res.status)
    return { status: 'error' }
  }

  try {
    const data = (await res.json()) as { status?: string; reportToken?: string }
    if (data.status === 'active' && typeof data.reportToken === 'string' && data.reportToken.length > 0) {
      return { status: 'active', reportToken: data.reportToken }
    }
    return { status: 'error' }
  } catch {
    return { status: 'error' }
  }
}
