/**
 * Geometría de las familias de gráfico del informe compartido de Insights (TASK-1875).
 *
 * Mismas convenciones que `src/lib/artifact-composer/chart-geometry.ts` de greenhouse-eo (la fuente de los PDF):
 * barras con origen cero, pie/donut hasta 3 partes, medidor de 270° abierto, heatmap por INTENSIDAD (luminancia, nunca
 * tono), waffle de un cuadro por unidad, Venn con áreas proporcionales. Sólo produce POSICIONES y TAMAÑOS: toda
 * cifra impresa sigue saliendo de `display` del modelo.
 */

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d

/** Techo «redondo» (1, 2, 2,5 o 5 × 10^k) y sus marcas, para ~4 tramos. Siempre cubre el máximo. */
export const niceScale = (max: number, min = 0) => {
  const span = Math.max(max - min, 0)
  const raw = span / 4
  let step = 1
  if (raw > 0) {
    const exp = Math.pow(10, Math.floor(Math.log10(raw)))
    const f = raw / exp
    step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * exp
  }
  const lo = Math.floor(min / step) * step
  const hi = Math.max(lo + step, Math.ceil(max / step) * step)
  const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => round(lo + i * step, 6))
  return { min: lo, max: hi, step, ticks, pct: (v: number) => round(((v - lo) / (hi - lo)) * 100) }
}

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180
  return { x: round(cx + r * Math.cos(a)), y: round(cy + r * Math.sin(a)) }
}

/** Arco de `from` a `to` grados (0 = las 12, sentido horario). */
export const arcPath = (cx: number, cy: number, r: number, from: number, to: number) => {
  const a = polar(cx, cy, r, from)
  const b = polar(cx, cy, r, to)
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${b.x} ${b.y}`
}

/** Porciones de pie/donut (sector cerrado; `inner` > 0 = dona). */
export const slices = (values: number[], r: number, inner = 0) => {
  const total = values.reduce((a, b) => a + b, 0) || 1
  let angle = 0
  return values.map((value) => {
    const sweep = (value / total) * 360
    const from = angle
    const to = angle + sweep
    angle = to
    const large = sweep > 180 ? 1 : 0
    const o1 = polar(r, r, r, from)
    const o2 = polar(r, r, r, to - 0.0001)
    const mid = polar(r, r, inner ? (r + inner) / 2 : r * 0.62, from + sweep / 2)
    const d = inner
      ? (() => {
          const i1 = polar(r, r, inner, to - 0.0001)
          const i2 = polar(r, r, inner, from)
          return `M ${o1.x} ${o1.y} A ${r} ${r} 0 ${large} 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${inner} ${inner} 0 ${large} 0 ${i2.x} ${i2.y} Z`
        })()
      : `M ${r} ${r} L ${o1.x} ${o1.y} A ${r} ${r} 0 ${large} 1 ${o2.x} ${o2.y} Z`
    return { d, mid, sharePct: round((value / total) * 100, 1) }
  })
}

/** Medidor de 270°, abierto abajo: 0 % a las 7:30, 100 % a las 4:30. */
export const GAUGE_START = 225
export const GAUGE_SWEEP = 270
export const gaugeAngle = (value: number, min: number, max: number) => GAUGE_START + (Math.min(Math.max(value, min), max) - min) / (max - min) * GAUGE_SWEEP
export const gaugePoint = polar

/** Bullet: posición del valor, la meta y la banda sobre un techo común (10 % de aire sobre el mayor). */
export const bulletScale = (values: number[]) => {
  const ceiling = Math.max(...values, 0) * 1.1 || 1
  return (v: number) => round((v / ceiling) * 100)
}

/** Cascada: cada paso flota sobre el acumulado; los totales parten de cero. */
export const waterfallBars = (steps: Array<{ value: number; isTotal: boolean }>) => {
  let running = 0
  const bars = steps.map((step) => {
    if (step.isTotal) {
      running = step.value
      return { from: 0, to: step.value, negative: false }
    }
    const from = running
    running += step.value
    return { from: Math.min(from, running), to: Math.max(from, running), negative: step.value < 0 }
  })
  const scale = niceScale(Math.max(...bars.map((b) => b.to)))
  return { scale, bars: bars.map((b) => ({ ...b, bottomPct: scale.pct(b.from), heightPct: round(scale.pct(b.to) - scale.pct(b.from)) })) }
}

/** Heatmap: intensidad 0–100 entre el mínimo y el máximo medidos; una celda sin dato no es cero. */
export const heatmapIntensity = (values: Array<number | null>) => {
  const measured = values.filter((v): v is number => v !== null)
  const lo = Math.min(...measured)
  const span = Math.max(...measured) - lo
  return (v: number | null) => (v === null ? null : span === 0 ? 100 : round(((v - lo) / span) * 100, 1))
}

/**
 * Waffle por unidad (TASK-1975): un cuadro es UNA unidad — 8 respuestas son 8 cuadros, no cien repartidos por
 * participación. Misma regla que `waffleUnitGeometry` de los PDF (greenhouse-eo `artifact-composer/chart-geometry.ts`):
 * hasta 30 unidades en 5 columnas, de 31 a 100 en 10; un conteo no entero o negativo, un total vacío o de más de cien
 * unidades no se dibuja (null: la figura queda en su tabla equivalente). Cada celda lleva el índice de su parte, en el
 * orden de las partes y llenando fila por fila.
 */
export const WAFFLE_MAX_UNITS = 100
export const WAFFLE_NARROW_MAX_UNITS = 30
export const waffleCells = (values: number[]): { columns: number; rows: number; cells: number[] } | null => {
  if (values.some((v) => !Number.isInteger(v) || v < 0)) return null
  const total = values.reduce((a, b) => a + b, 0)
  if (total === 0 || total > WAFFLE_MAX_UNITS) return null
  const columns = total <= WAFFLE_NARROW_MAX_UNITS ? 5 : 10
  const cells: number[] = []
  values.forEach((v, i) => { for (let k = 0; k < v; k += 1) cells.push(i) })
  return { columns, rows: Math.ceil(total / columns), cells }
}

/** Venn de dos conjuntos con áreas proporcionales (distancia entre centros por bisección del área de la lente). */
export const vennTwo = (onlyA: number, onlyB: number, both: number) => {
  const rA = Math.sqrt((onlyA + both) / Math.PI)
  const rB = Math.sqrt((onlyB + both) / Math.PI)
  const rMin = Math.min(rA, rB)
  const lens = (d: number) => {
    if (d >= rA + rB) return 0
    if (d <= Math.abs(rA - rB)) return Math.PI * rMin * rMin
    const a = rA * rA
    const b = rB * rB
    return a * Math.acos((d * d + a - b) / (2 * d * rA)) + b * Math.acos((d * d + b - a) / (2 * d * rB)) - 0.5 * Math.sqrt((-d + rA + rB) * (d + rA - rB) * (d - rA + rB) * (d + rA + rB))
  }
  let lo = Math.abs(rA - rB)
  let hi = rA + rB
  if (both === 0) lo = hi
  else for (let k = 0; k < 60; k += 1) { const mid = (lo + hi) / 2; if (lens(mid) > both) lo = mid; else hi = mid }
  const d = (lo + hi) / 2
  return { rA, rB, d }
}
