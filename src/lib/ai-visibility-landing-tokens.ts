/**
 * Tokens de la landing del Efeonce AI Visibility Report (`/brand-visibility`, TASK-1966 en greenhouse-eo).
 *
 * La landing es una pieza de la familia SEO/AEO de Efeonce y se pinta con «La órbita» en su línea **Engine**
 * (`efeonceGraphicLine.lines[engine]` de `@efeoncepro/axis-tokens` 0.3.41). Think no consume los paquetes privados de
 * AXIS: los valores se copian 1:1 acá y en ningún otro lado. Ningún estilo de la landing escribe un HEX: todo sale de
 * este archivo como variable CSS (`landingCssVars`).
 *
 * Archivos de marca (copiados sin modificar de `@efeoncepro/axis-brand-assets` 0.4.10, `public/branding/`):
 * - `products/ai-visibility-report-lockup-negative.svg` — sha256 cb497e63…dce
 * - `products/orbit-engine-dark-screen.svg` (`assets/orbit/`) — sha256 aa65567c…606
 * - `efeonce-logo-negative.svg` — sha256 f221fc92…b3f
 */

/** Colores de la línea Engine. El acento es luz y gráfico: nunca en texto de menos de 24 px. */
export const engine = {
  ground: '#091951', // lines[engine].darkBg — fondo del hero y del pie
  accent: '#0375db', // lines[engine].accentOnDark / accentOnLight — ≈ 3,6:1 sobre ground
  ink: '#ffffff', // tinta sobre oscuro
  inkSoft: '#cfe4fa', // apoyo sobre oscuro (artboard aprobado; mismo valor que Insights)
  halo: '#72ded8', // color.halo — anillo fino sobre oscuro
  paperInk: '#091951', // color.productInk — titulares y tinta sobre papel
  paperInkSoft: '#6d6777', // apoyo sobre papel (5,3:1)
  paper: '#f7f8f6', // color.paper
  line: '#d5d4d8', // AXIS gray 200 — filetes sobre papel
  sloganLeadOnDark: '#e2e2e2', // slogan.leadColor.onDark — «Empower your»
} as const

/**
 * Eslogan como elemento gráfico (criteria §5): bloque logo arriba, eslogan debajo al 64 % del ancho del logo,
 * separado 1,35 veces su cuerpo. «Empower your Engine» mide 11,263 em en sus pesos oficiales.
 */
export const slogan = {
  word: 'Engine',
  ofLogo: 0.64, // motion.layout.sloganOfLogo
  gapOfFont: 1.35, // motion.layout.sloganGapOfFont
  widthEm: 11.263, // slogan.widthEmByWord.Engine
} as const

/** Cuerpo del eslogan en px para un logo de `logoWidthPx` de ancho. */
export const sloganFontPx = (logoWidthPx: number): number =>
  Number(((slogan.ofLogo * logoWidthPx) / slogan.widthEm).toFixed(3))

/** Variables CSS que consume la página (style del `<main>`). */
export const landingCssVars = [
  `--engine-ground:${engine.ground}`,
  `--engine-accent:${engine.accent}`,
  `--engine-ink:${engine.ink}`,
  `--engine-ink-soft:${engine.inkSoft}`,
  `--engine-halo:${engine.halo}`,
  `--engine-paper-ink:${engine.paperInk}`,
  `--engine-paper-ink-soft:${engine.paperInkSoft}`,
  `--engine-paper:${engine.paper}`,
  `--engine-line:${engine.line}`,
].join(';')
