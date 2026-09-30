import type { AxisAeoXrayManifest, AxisAeoXrayCta, AxisAeoXrayArtifact } from '../axis/aeo-xray/aeo-xray.js'

export type XrayView = 'read' | 'explore'
export const artifactHref = (artifactId: string, view: XrayView = 'read', blockId?: string): string =>
  `?${new URLSearchParams({ artifact: artifactId, ...(view === 'explore' ? { view } : {}) })}${blockId ? `#${encodeURIComponent(blockId)}` : ''}`
export const ctaHref = (cta: AxisAeoXrayCta): string => cta.artifactId ? artifactHref(cta.artifactId, 'read', cta.blockId) : cta.href ?? '#'
export const assetHref = (asset: AxisAeoXrayManifest['assets'][number]): string =>
  asset.ref.kind === 'public' ? asset.ref.url : `?${new URLSearchParams({ asset: asset.id })}`

export function selectArtifact(model: AxisAeoXrayManifest, artifactId: string | null): AxisAeoXrayArtifact | null {
  return model.artifacts.find(artifact => artifact.id === (artifactId ?? model.flow.entryArtifactId)) ?? null
}

/** Presentation only: the content and its hierarchy already belong to the frozen model. */
export function tableOfContents(artifact: AxisAeoXrayArtifact) {
  return artifact.blocks.flatMap(block => block.kind === 'heading' && block.level === 2 ? [{ id: block.id, label: block.text }] : [])
}

export function displayDate(value: string, locale: string): string {
  const date = new Date(value.length === 10 ? `${value}T12:00:00Z` : value)
  try { return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(date) }
  catch { return value.slice(0, 10) }
}

/** Only values validated by the AXIS acceptance boundary enter style attributes. */
export function compositionStyle(model: AxisAeoXrayManifest): string {
  const t = model.tokens, b = model.brand
  const vars: Record<string, string | number> = {
    'shell': t.shell.ground, 'shell-ink': t.shell.ink, 'shell-muted': t.shell.muted, 'focus': t.shell.accent,
    'paper': t.canvas.background, 'ink': b?.ink ?? t.canvas.ink, 'muted': t.canvas.muted, 'rule': t.canvas.rule,
    'brand': b?.accent ?? t.canvas.ink, 'action': b?.action ?? b?.accent ?? t.shell.accent,
    'action-ink': b?.actionText ?? t.shell.ink,
    'body-font': t.fonts[b?.fontFamily ?? 'system-sans'], 'display-font': t.fonts[b?.displayFontFamily ?? 'system-serif'],
    'max': t.layout.maxWidth, 'reading': t.layout.readingWidth, 'inspector': t.layout.inspectorWidth,
    'gap': t.layout.gap, 'padding': t.layout.padding,
    'radius': t.radius.sm, 'radius-lg': t.radius.display,
    'motion': t.motion.duration.standard, 'ease': t.motion.ease.emphasized,
    'target': `${t.accessibility.targetSizePx}px`,
  }
  for (const [key, value] of Object.entries(t.typography)) vars[`type-${key}`] = value
  for (const [key, value] of Object.entries(t.spacing)) vars[`space-${key}`] = value
  for (const [key, value] of Object.entries(t.hero)) vars[`hero-${key}`] = value
  return Object.entries(vars).map(([key, value]) => `--x-${key}:${value}`).join(';')
}
