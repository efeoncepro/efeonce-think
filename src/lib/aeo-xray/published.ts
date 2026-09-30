/** Published, unlisted samples bundled with Think. No Greenhouse request or grant is required.
 * Remove the registry entry and media in a redeploy to withdraw a sample.
 * These links are distribution links, not authenticated access grants.
 */
import pichincha from './published/pichincha.json' with { type: 'json' }
import { acceptSharedXray, type SharedXrayResult } from './accept.ts'

const samples = [pichincha]
export const isPublishedSampleKey = (key: string) => key.startsWith('sample_')
export function readPublishedSample(key: string): SharedXrayResult {
  const sample = samples.find(sample => sample.key === key)
  if (!sample) return { status: 'not_found' }
  return acceptSharedXray({
    modelVersion: '1.0', model: sample.model,
    header: { title: sample.model.title, preparedFor: sample.model.preparedFor, editionId: sample.editionId },
    // Compatibility field for the rendering envelope; bundled samples have no grant lifecycle.
    expiresAt: '2099-01-01T00:00:00.000Z',
  })
}
export function publishedSampleAsset(key: string, assetId: string): string | null {
  const sample = samples.find(sample => sample.key === key)
  if (!sample || !Object.hasOwn(sample.assets, assetId)) return null
  return sample.assets[assetId as keyof typeof sample.assets]
}
