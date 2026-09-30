/** TASK-1950. Imported only by the DEV branch; all fixtures use the production acceptance path. */
import {readFixtureCase,readFixtureCaseAsset} from './fixture-case'
import intent from './fixture-minimal.json'
import { resolveAeoXrayIntent } from '../axis/aeo-xray/aeo-xray.js'
import { acceptSharedXray, type SharedXrayResult } from './accept'

export function fixtureEdition() {
  const model = resolveAeoXrayIntent(intent)
  if (model.status !== 'resolved') throw new Error('Invalid synthetic X-Ray fixture')
  return {
    modelVersion: '1.0',
    header: { title: model.title, preparedFor: model.preparedFor, editionId: 'synthetic-edition' },
    model,
    expiresAt: '2099-01-01T00:00:00.000Z',
  }
}

export async function resolveXrayFixture(token: string): Promise<SharedXrayResult> {
  if (token === 'fixture-client') return readFixtureCase(process.env.XRAY_CASE_DIR)
  if (token === 'fixture-pichincha') return readFixtureCase(process.env.XRAY_DEMO_DIR,legacyCase)
  if (token === 'fixture-not-found') return { status: 'not_found' }
  if (token === 'fixture-gone') return { status: 'gone' }
  if (token === 'fixture-rate-limited') return { status: 'rate_limited' }
  if (token === 'fixture-error') return { status: 'error' }
  if (token === 'fixture-unsupported') return acceptSharedXray({ ...fixtureEdition(), modelVersion: '2.0' })
  if (token === 'fixture-completo') return acceptSharedXray(fixtureEdition())
  return { status: 'not_found' }
}

const legacyCase={manifestFile:'pichincha-xray-manifest-v1.json',assets:{'bank-logo':'pichincha-logo.webp','landing-banner':'landing-ahorro-v1.webp','article-banner':'blog-elegir-cuenta-v1.webp'}}
export async function resolveXrayFixtureAsset(token:string,assetId:string):Promise<Response|null>{
  if(token==='fixture-client')return readFixtureCaseAsset(process.env.XRAY_CASE_DIR,assetId)
  if(token==='fixture-pichincha')return readFixtureCaseAsset(process.env.XRAY_DEMO_DIR,assetId,legacyCase)
  return null
}
