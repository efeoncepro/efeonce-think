/**
 * Tokens del informe compartido de Efeonce Insights (TASK-1875, greenhouse-eo).
 *
 * El informe es una pieza de la marca propia: se pinta con «La órbita» (`efeonceGraphicLine` de
 * `@efeoncepro/axis-tokens`), no con la paleta del Grader. Valores copiados 1:1 de AXIS (axis-tokens 0.3.23,
 * axis-brand-assets 0.4.0) mientras Think no consuma los paquetes privados: si AXIS cambia, se cambia acá y en ningún
 * otro lado. Ningún componente del informe escribe un HEX, una curva o una duración: todo sale de este archivo.
 */

/** Colores de la línea (tema oscuro = fondo por defecto; papel = interiores de lectura). */
export const orbita = {
  ground: '#001a33', // fondo oscuro Efeonce
  navy: '#023c70', // tinta sobre papel y paneles de cierre
  paper: '#f7f8f6',
  surface: '#ffffff',
  ink: '#ffffff', // tinta sobre oscuro
  inkSoftDark: '#cfe4fa', // apoyo sobre oscuro
  inkSoftLight: '#6d6777', // apoyo sobre papel (5,3:1)
  halo: '#72ded8', // anillo y halo sobre oscuro
  accentDark: '#36c8bf', // acento Growth sobre oscuro (arco, esfera, palabra del eslogan ≥ 24 px)
  accentLight: '#0e8c82', // acento Growth sobre papel (3,87:1: sólo gráfico o texto ≥ 24 px)
  sloganLeadDark: '#e2e2e2', // «Empower your» sobre oscuro
} as const

/**
 * Roles de dato (mismos que los PDF de TASK-1889, `--axis-deck-role-data*` del catálogo insights-deck): actual y
 * anterior se distinguen también por luminosidad. En navy: actual = teal, anterior = periwinkle.
 */
export const dataRoles = {
  current: orbita.navy,
  previous: '#1f9e94', // --axis-deck-role-dataPriorOnPaper (--axis-deck-teal-650); gráfico ≥ 3:1, nunca texto chico
  currentOnNavy: orbita.accentDark,
  previousOnNavy: '#8aa8d8', // --axis-deck-role-dataPriorOnNavy (--axis-deck-blue-310)
} as const

/**
 * Variación de la tarjeta de cifra (TASK-1975): tonos semánticos, nunca roles de dato (una serie no se pinta de rojo
 * porque bajó). Copiados de `efeonceInsights.variation` y `efeonceInsights.ink` de AXIS (`packages/tokens/src/tokens.ts`,
 * aprobados el 2026-10-03; el paquete aún no se publica con ellos). Sobre papel, variante A: píldora teñida con la cifra
 * en el tono. Sobre navy, variante C: sin píldora rellena, el tono sólo en el triángulo y la cifra en tinta suave.
 */
export const variation = {
  betterOnPaper: '#0d6b3f', // --axis-ppt-green-900 · deltaBetterOnPaper
  betterTintPct: '12%', // tintOpacity 0.12
  worseOnPaper: '#b91954', // --axis-ppt-red-800 · deltaWorseOnPaper
  worseTintPct: '10%', // tintOpacity 0.1
  neutralOnPaper: '#020061', // --axis-ppt-indigo-950 · paperInk (neutral.onPaper.ink)
  neutralGroundOnPaper: '#e9edf3', // --axis-deck-surface-70 · ruleSoft (neutral.onPaper.ground)
  betterOnNavy: '#28c76f', // --axis-ppt-green-400 · deltaBetterOnNavy (sólo el triángulo)
  worseOnNavy: '#ff7063', // --axis-ppt-red-300 · deltaWorseOnNavy (sólo el triángulo)
  neutralOnNavy: '#b9c9e9', // --axis-deck-ice-200 · navyMuted
  leadOnNavy: '#d0f3ff', // --axis-deck-cyan-100 · navyLead: la cifra de la variación sobre navy
  /** Triángulo de puntas redondeadas (`variation.shape`): mismo color en relleno y trazo, unión redondeada. */
  shape: { viewBox: '0 0 9 8', up: 'M4.5 0.5 L8.5 7.5 H0.5 Z', down: 'M4.5 7.5 L8.5 0.5 H0.5 Z', strokePx: 1.4 },
} as const

/**
 * Movimiento de la tarjeta de cifra (`docs/ui/motion/TASK-1975-efeonce-insights-stat-card-motion.md`, aprobado el
 * 2026-10-03): la cifra recorre del valor anterior al actual y, al llegar, la variación toma su tono.
 */
export const statMotion = {
  staggerMs: 70, // cada tarjeta, 70 ms después de la anterior
  nameMs: 300, // nombre, ícono y «Estimado» suben 8 px (0–300 ms)
  countStartMs: 150, // la cifra recorre de 150 a 1.250 ms
  countMs: 1100,
  changeStartMs: 1250, // la variación pasa de gris a su tono (1.250–1.600 ms)
  changeMs: 350,
  lowerStartMs: 1600, // «Menor es mejor» al final (1.600–1.900 ms)
  lowerMs: 300,
  risePx: 8,
} as const

/** Anatomía de la órbita que mide (`efeonceGraphicLine.trajectory.measure` + `lens.anatomy`, escalada por ancho). */
export const orbitMeasure = {
  degreesPerUnit: 360, // valor × 360°, desde las 12 en sentido horario
  trailDeg: 50, // estela corta detrás de la esfera; nunca antes de la partida
  ringOpacity: 0.16, // ring-thin
  haloRadiusRatio: 1.86,
  /** Trazos a la escala base de 794 px de ancho (se multiplican por ancho/794). */
  base: { widthPx: 794, ringStrokePx: 1.4, trailStrokePx: 2.8, sphereRadiusPx: 5.6, originTickPx: 6 },
} as const

/** Movimiento (`axisMotion`): llega con énfasis, se transforma estándar, se va acelerando. */
export const motion = {
  easeEmphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  easeStandard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  durationShort: '150ms',
  durationMedium: '300ms',
  /** La órbita sola: aparece el anillo, recorre la esfera con su estela, asienta y sube el halo (≈2,1 s: 200 + 1100 + 800). */
  orbitMs: { ring: 350, travel: 1100, travelDelay: 200, halo: 800 },
} as const

/** Variables CSS que consume el informe (`<style define:vars>` en la página). */
export const insightsCssVars = {
  'ins-ground': orbita.ground,
  'ins-navy': orbita.navy,
  'ins-paper': orbita.paper,
  'ins-surface': orbita.surface,
  'ins-ink': orbita.ink,
  'ins-ink-soft-dark': orbita.inkSoftDark,
  'ins-ink-soft-light': orbita.inkSoftLight,
  'ins-halo': orbita.halo,
  'ins-accent-dark': orbita.accentDark,
  'ins-accent-light': orbita.accentLight,
  'ins-slogan-lead-dark': orbita.sloganLeadDark,
  'ins-data-current': dataRoles.current,
  'ins-data-previous': dataRoles.previous,
  'ins-data-current-dark': dataRoles.currentOnNavy,
  'ins-data-previous-dark': dataRoles.previousOnNavy,
  'ins-ease-emphasized': motion.easeEmphasized,
  'ins-ease-standard': motion.easeStandard,
  'ins-duration-short': motion.durationShort,
  'ins-duration-medium': motion.durationMedium,
  'ins-delta-better': variation.betterOnPaper,
  'ins-delta-better-tint': variation.betterTintPct,
  'ins-delta-worse': variation.worseOnPaper,
  'ins-delta-worse-tint': variation.worseTintPct,
  'ins-delta-neutral': variation.neutralOnPaper,
  'ins-delta-neutral-ground': variation.neutralGroundOnPaper,
  'ins-delta-better-dark': variation.betterOnNavy,
  'ins-delta-worse-dark': variation.worseOnNavy,
  'ins-delta-neutral-dark': variation.neutralOnNavy,
  'ins-delta-lead-dark': variation.leadOnNavy,
  'ins-stat-stagger': `${statMotion.staggerMs}ms`,
  'ins-stat-name': `${statMotion.nameMs}ms`,
  'ins-stat-count-start': `${statMotion.countStartMs}ms`,
  'ins-stat-change-start': `${statMotion.changeStartMs}ms`,
  'ins-stat-change': `${statMotion.changeMs}ms`,
  'ins-stat-lower-start': `${statMotion.lowerStartMs}ms`,
  'ins-stat-lower': `${statMotion.lowerMs}ms`,
  'ins-stat-rise': `${statMotion.risePx}px`,
} as const
