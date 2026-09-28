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

/** Roles de dato (mismos que los PDF de TASK-1889): actual y anterior se distinguen también por luminosidad. */
export const dataRoles = {
  current: orbita.navy,
  previous: orbita.accentLight,
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
  /** La órbita sola: aparece el anillo, recorre la esfera con su estela, asienta y sube el halo (2,0 s). */
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
  'ins-ease-emphasized': motion.easeEmphasized,
  'ins-ease-standard': motion.easeStandard,
  'ins-duration-short': motion.durationShort,
  'ins-duration-medium': motion.durationMedium,
} as const
