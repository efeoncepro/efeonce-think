import { resolveAeoXrayIntent, type AxisAeoXrayManifest } from '../axis/aeo-xray/aeo-xray.js'
import type { XrayFailure } from './transport'

export interface SharedXrayEdition {
  modelVersion: '1.0'
  header: { title: string; preparedFor: string; editionId: string }
  model: AxisAeoXrayManifest
  expiresAt: string
}
export type SharedXrayResult = XrayFailure | { status: 'ok'; edition: SharedXrayEdition }

const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const stable = (value: unknown): string => JSON.stringify(value, (_key, item) =>
  object(item) ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item,
)

/** Validate the frozen server model; never upgrade or silently resolve a different version for rendering. */
export function acceptSharedXray(payload: unknown): SharedXrayResult {
  if (!object(payload) || payload.modelVersion !== '1.0' || !object(payload.header) || !object(payload.model)) return { status: 'error' }
  const { header, model } = payload
  if (!['title', 'preparedFor', 'editionId'].every(key => text(header[key]))) return { status: 'error' }
  if (!text(payload.expiresAt) || !Number.isFinite(Date.parse(payload.expiresAt))) return { status: 'error' }
  const { status, schema, tokens, adapterChecks, ...intent } = model
  if (status !== 'resolved' || schema !== 'axis.aeo-xray-composition.v1') return { status: 'error' }
  try {
    const expected = resolveAeoXrayIntent(intent)
    if (expected.status !== 'resolved') return { status: 'error' }
    // An unsupported token contract fails closed, rather than accepting injected CSS or altered checks.
    if (stable(tokens) !== stable(expected.tokens) || stable(adapterChecks) !== stable(expected.adapterChecks)) return { status: 'error' }
    if (header.title !== model.title || header.preparedFor !== model.preparedFor) return { status: 'error' }
  } catch {
    return { status: 'error' }
  }
  return { status: 'ok', edition: payload as unknown as SharedXrayEdition }
}
