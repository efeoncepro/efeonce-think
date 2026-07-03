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
  | { status: 'ok'; header: ReportHeader; model: Record<string, unknown>; report: unknown; modelVersion?: string }
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
    }
    return {
      status: 'ok',
      header: data.header ?? {},
      model: data.model ?? {},
      report: data.report,
      modelVersion: data.modelVersion,
    }
  } catch {
    return { status: 'error' }
  }
}
