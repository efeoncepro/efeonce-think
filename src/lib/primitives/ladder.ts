/**
 * Contrato de la primitiva canónica **MaturityLadder** (la "escalera").
 *
 * Una escalera de N peldaños de madurez que se suben en orden. El componente es
 * PRESENTACIÓN PURA y está DESACOPLADO del modelo del grader: el consumer arma los
 * `LadderRung[]` (ordenados 01→N, con el `isNext` marcado) desde su propia data y los
 * pasa a `<MaturityLadder rungs={...} />`.
 *
 * Encoding de la escalera:
 *  - **posición/altura del pedestal-líquido** = el peldaño (ordinal, 01 abajo → N arriba)
 *  - **color del líquido + chip** = severidad
 *  - **score** = número del peldaño; `null` = "En cobertura" (no medido → pedestal con hatch)
 *  - **isNext** = "tu próximo nivel" (marcar UNO solo)
 *
 * Reusable por cualquier lead magnet del hub (AEO hoy; SEO/otros mañana). La severidad usa
 * los tokens de `report-tokens` (capa de design tokens compartida del hub).
 */
export interface LadderRung {
  /** "01".."05" — posición en la escalera (define la altura del pedestal). */
  ordinal: string
  /** Tag de metodología opcional (eyebrow en acento), ej. "Be Found". */
  eyebrow?: string
  /** Nombre del peldaño, ej. "Que te encuentre". */
  label: string
  /** Sub-línea opcional (pregunta guía / explicación corta). */
  caption?: string
  /** Score 0-100; `null` = no medido ("En cobertura"). */
  score: number | null
  /** Severidad (design token): 'critico' | 'atencion' | 'optimo' | 'sin_dato'. */
  severity: string
  /** Marca este peldaño como "tu próximo nivel". Debe marcarse en UNO solo. */
  isNext?: boolean
}

export interface MaturityLadderProps {
  /** Peldaños ya ordenados (01→N) con `isNext` resuelto por el consumer. */
  rungs: LadderRung[]
  /** Anima la entrada (peldaños suben + count-up) al hacer scroll. Default true. */
  animate?: boolean
  /** Texto del marcador de próximo nivel. Default "Empieza aquí". */
  nextLabel?: string
  /** Texto del estado no medido. Default "En cobertura". */
  coverageLabel?: string
}
