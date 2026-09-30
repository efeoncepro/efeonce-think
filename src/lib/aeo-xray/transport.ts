/** TASK-1950: request-scoped headless transport. Never logs URLs or bearer tokens. */
export type XrayFailure = { status: 'not_found' | 'gone' | 'rate_limited' | 'error' }
export type XrayTransportResult = XrayFailure | { status: 'ok'; payload: unknown }
export interface XrayTransportOptions {
  base: string
  headers?: Record<string, string>
  fetcher?: typeof fetch
}

export const isShareToken = (value: string): boolean => /^xrg_[A-Za-z0-9_-]{43}$/.test(value)
export const isAssetId = (value: string): boolean => /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,95}$/.test(value)

const failureFor = (status: number): XrayFailure => ({
  status: status === 404 ? 'not_found' : status === 410 ? 'gone' : status === 429 ? 'rate_limited' : 'error',
})

async function request(token: string, suffix: string, options: XrayTransportOptions): Promise<Response | null> {
  if (!isShareToken(token)) return null
  try {
    return await (options.fetcher ?? fetch)(
      `${options.base.replace(/\/+$/, '')}/api/public/growth/aeo-xray/shared/${encodeURIComponent(token)}${suffix}`,
      {
        headers: options.headers,
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(12_000),
      },
    )
  } catch {
    return null
  }
}

export async function readSharedXray(token: string, options: XrayTransportOptions): Promise<XrayTransportResult> {
  if (!isShareToken(token)) return { status: 'not_found' }
  const response = await request(token, '', options)
  if (!response) return { status: 'error' }
  if (!response.ok) return failureFor(response.status)
  if (!response.headers.get('content-type')?.includes('application/json')) return { status: 'error' }
  try {
    return { status: 'ok', payload: await response.json() }
  } catch {
    return { status: 'error' }
  }
}

/** Assets are fetched only through the same grant, never from a URL supplied by content. */
export async function readSharedXrayAsset(token: string, assetId: string, options: XrayTransportOptions): Promise<Response | null> {
  if (!isAssetId(assetId)) return null
  return request(token, `/assets/${encodeURIComponent(assetId)}`, options)
}
