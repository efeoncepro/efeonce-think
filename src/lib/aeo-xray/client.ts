import { GREENHOUSE_API_BASE, GREENHOUSE_API_BYPASS, GREENHOUSE_THINK_KEY } from 'astro:env/server'
import { acceptSharedXray, type SharedXrayResult } from './accept'
import { readSharedXray, readSharedXrayAsset } from './transport'
import { isPublishedSampleKey, readPublishedSample } from './published'

const options = (accept: string) => ({
  base: GREENHOUSE_API_BASE || 'https://greenhouse.efeoncepro.com',
  headers: {
    accept,
    ...(GREENHOUSE_THINK_KEY ? { 'x-efeonce-think-key': GREENHOUSE_THINK_KEY } : {}),
    ...(GREENHOUSE_API_BYPASS ? { 'x-vercel-protection-bypass': GREENHOUSE_API_BYPASS } : {}),
  },
})

export async function fetchSharedXray(token: string): Promise<SharedXrayResult> {
  if (isPublishedSampleKey(token)) return readPublishedSample(token)
  if (import.meta.env.DEV && token.startsWith('fixture-')) {
    const { resolveXrayFixture } = await import('./fixtures')
    return resolveXrayFixture(token)
  }
  const result = await readSharedXray(token, options('application/json'))
  return result.status === 'ok' ? acceptSharedXray(result.payload) : result
}

export async function fetchSharedXrayAsset(token: string, assetId: string): Promise<Response | null> {
  if (import.meta.env.DEV && token.startsWith('fixture-')) {
    const { resolveXrayFixtureAsset } = await import('./fixtures')
    return resolveXrayFixtureAsset(token, assetId)
  }
  return readSharedXrayAsset(token, assetId, options('image/avif,image/webp,image/png,image/jpeg'))
}
