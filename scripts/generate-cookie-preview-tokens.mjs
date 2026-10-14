/** Development-only projection from the exact AXIS version consumed by primitives. */
import { createRequire } from 'node:module'
import { writeFileSync } from 'node:fs'
const require = createRequire(import.meta.url)
const primitiveRequire = createRequire(require.resolve('@efeoncepro/axis-ui-primitives'))
const { efeonceGraphicLine, axisGeometry, axisMotion, axisTypography, axisElevation, axisButton, axisForms } =
  await import(primitiveRequire.resolve('@efeoncepro/axis-tokens'))
writeFileSync(new URL('../src/lib/cookie-preview-tokens.json', import.meta.url), JSON.stringify({
  provenance: 'Generated from axis-ui-primitives 0.6.6 → axis-tokens 0.6.1. Run scripts/generate-cookie-preview-tokens.mjs; do not edit values.',
  color: efeonceGraphicLine.color, type: efeonceGraphicLine.type,
  geometry: axisGeometry, motion: axisMotion, typography: axisTypography.scale,
  elevation: axisElevation, neutral: axisButton.surfaces.light.neutral,
  brand: axisButton.surfaces.light.brand, focusWidth: axisForms.focusWidth,
  focusOffset: axisForms.focusOffset, borderWidth: axisForms.borderWidth,
}, null, 2) + '\n')
