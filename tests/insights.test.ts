/**
 * Pruebas del informe compartido de Insights (TASK-1875): la vista (qué se muestra y en qué orden) y la geometría de
 * las familias de gráfico. Ninguna prueba compara strings de markup: se prueba el comportamiento de las funciones que
 * decide qué se dibuja. Correr con `pnpm test:insights` (Node ≥ 24 ejecuta TypeScript sin compilar).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveInsightFixture } from '../src/lib/insights-fixtures.ts'
import { acceptSharedEdition, isSupportedModelVersion } from '../src/lib/insights-accept.ts'
import { buildFindings, chartFactIds, chartsArriveOrdered, moduleLabelOf, resolveEvidence, splitLead, splitSummary, statCellPlacement, statColumns } from '../src/lib/insights-view.ts'
import { bulletScale, gaugeAngle, GAUGE_START, GAUGE_SWEEP, heatmapIntensity, niceScale, slices, vennTwo, waffleCells, waterfallBars } from '../src/lib/insights-chart-geometry.ts'
import { INSIGHTS_COPY, INSIGHTS_COPY_EN } from '../src/lib/insights-copy.ts'

const model = (token: string) => {
  const result = resolveInsightFixture(token)
  assert.equal(result?.status, 'ok')
  return (result as Extract<typeof result, { status: 'ok' }>).edition.model
}

test('hallazgos v2 salen de «Lo esencial», en su orden, con la cifra del primer hecho citado', () => {
  const m = model('fixture-completo')
  const findings = buildFindings(m)
  assert.deepEqual(findings.map((f) => f.claim.claimId), m.essentials!.map((c) => c.claimId))
  for (const f of findings) {
    const first = f.claim.factIds.map((id) => m.facts[id]).find(Boolean)
    assert.equal(f.fact?.factId, first?.factId)
    // 1.3 — el módulo lo trae el modelo (Greenhouse), no se infiere en Think.
    assert.equal(f.module, f.claim.module ?? null)
  }
})

test('1.3 — un hallazgo sin módulo ni evidencia en el modelo se muestra sin chip ni figura (Think no los deduce)', () => {
  const m = model('fixture-completo')
  const bare = { ...m, essentials: m.essentials!.map(({ module: _m, evidence: _e, ...claim }) => claim) }
  for (const f of buildFindings(bare)) {
    assert.equal(f.module, null)
    assert.equal(f.evidence, undefined)
  }
})

test('1.3 — el nombre del módulo sale del capítulo del modelo', () => {
  const m = model('fixture-completo')
  for (const chapter of m.chapters) assert.equal(moduleLabelOf(m, chapter.module), chapter.label ?? chapter.title)
  assert.equal(moduleLabelOf(m, null), null)
})

test('un modelo 1.0 sin «Lo esencial» usa sólo las afirmaciones del resumen que citan hechos', () => {
  const m = model('fixture-v1')
  assert.equal(m.essentials, undefined)
  const findings = buildFindings(m)
  assert.deepEqual(findings.map((f) => f.claim.claimId), m.executiveSummary.filter((c) => c.factIds.length > 0).map((c) => c.claimId))
})

test('1.3 — la evidencia resuelve la figura que el modelo declara, con su lectura', () => {
  const m = model('fixture-completo')
  for (const chapter of m.chapters) {
    for (const reading of chapter.readings ?? []) {
      const evidence = resolveEvidence(m, { chapterId: chapter.chapterId, chartId: reading.chartId })
      if (chapter.charts.some((c) => c.spec.chartId === reading.chartId)) assert.equal(evidence?.chart?.spec.chartId, reading.chartId)
      assert.equal(evidence?.reading, reading)
    }
  }
  assert.equal(resolveEvidence(m, { chapterId: 'no-existe', chartId: 'x' }), undefined)
  assert.equal(resolveEvidence(m, undefined), undefined)
})

test('toda figura del modelo declara hechos que existen en el modelo', () => {
  const m = model('fixture-completo')
  for (const chapter of m.chapters) for (const chart of chapter.charts) {
    const ids = chartFactIds(chart.spec)
    assert.ok(ids.length > 0, `${chart.spec.chartId} sin hechos`)
    for (const id of ids) assert.ok(m.facts[id], `${chart.spec.chartId} cita ${id}, que no existe`)
  }
})

test('el titular es la primera afirmación del resumen', () => {
  const m = model('fixture-completo')
  assert.equal(splitSummary(m).headline, m.executiveSummary[0])
  assert.equal(splitSummary(m).rest.length, m.executiveSummary.length - 1)
})

test('las 15 familias aparecen en el fixture completo', () => {
  const families = new Set(model('fixture-completo').chapters.flatMap((c) => c.charts.map((ch) => ch.spec.family)))
  assert.equal(families.size, 15, [...families].join(', '))
})

test('niceScale: techo redondo que cubre el máximo, marcas equiespaciadas', () => {
  for (const max of [0, 3, 9.2, 372, 1284, 68000]) {
    const s = niceScale(max)
    assert.ok(s.max >= max && s.min === 0)
    assert.ok(s.ticks.length >= 2 && s.ticks.length <= 6, `${max}: ${s.ticks}`)
    assert.equal(s.pct(s.max), 100)
    assert.equal(s.pct(0), 0)
  }
  const shifted = niceScale(2.8, 2.3)
  assert.ok(shifted.min <= 2.3 && shifted.max >= 2.8 && shifted.min > 0)
})

test('pie: las porciones suman 100 % y cierran el círculo', () => {
  const parts = slices([60.1, 39.9], 50)
  assert.equal(parts.reduce((a, p) => a + p.sharePct, 0), 100)
  assert.ok(parts.every((p) => p.d.endsWith('Z')))
})

test('medidor: 270° abierto abajo, el valor se acota al rango', () => {
  assert.equal(gaugeAngle(0, 0, 100), GAUGE_START)
  assert.equal(gaugeAngle(100, 0, 100), GAUGE_START + GAUGE_SWEEP)
  assert.equal(gaugeAngle(150, 0, 100), GAUGE_START + GAUGE_SWEEP)
  assert.equal(gaugeAngle(-5, 0, 100), GAUGE_START)
})

test('bullet: el mayor queda con 10 % de aire', () => {
  const at = bulletScale([80, 100, 60])
  assert.ok(Math.abs(at(100) - 90.91) < 0.01)
})

test('cascada: los pasos flotan sobre el acumulado y el total parte de cero', () => {
  const { bars } = waterfallBars([{ value: 100, isTotal: true }, { value: 30, isTotal: false }, { value: -20, isTotal: false }, { value: 110, isTotal: true }])
  assert.deepEqual(bars.map((b) => [b.from, b.to, b.negative]), [[0, 100, false], [100, 130, false], [110, 130, true], [0, 110, false]])
})

test('heatmap: intensidad entre mínimo y máximo; sin dato no es cero', () => {
  const at = heatmapIntensity([10, null, 30, 20])
  assert.equal(at(10), 0)
  assert.equal(at(30), 100)
  assert.equal(at(20), 50)
  assert.equal(at(null), null)
  assert.equal(heatmapIntensity([5, 5])(5), 100)
})

test('waffle por unidad: 8 unidades son 8 cuadros, en el orden de las partes', () => {
  const grid = waffleCells([4, 3, 1])
  assert.ok(grid)
  assert.equal(grid.cells.length, 8)
  assert.deepEqual(grid.cells, [0, 0, 0, 0, 1, 1, 1, 2])
  assert.equal(grid.columns, 5)
  assert.equal(grid.rows, 2)
})

test('waffle por unidad: 5 columnas hasta 30 unidades, 10 hasta 100; más de 100, decimales o vacío no se dibujan', () => {
  assert.equal(waffleCells([30])?.columns, 5)
  assert.equal(waffleCells([20, 11])?.columns, 10)
  assert.equal(waffleCells([41, 17, 6])?.columns, 10)
  assert.equal(waffleCells([41, 17, 6])?.cells.length, 64)
  assert.equal(waffleCells([100])?.rows, 10)
  assert.equal(waffleCells([60, 41]), null)
  assert.equal(waffleCells([60.1, 39.9]), null)
  assert.equal(waffleCells([0, 0]), null)
  assert.equal(waffleCells([5, -1]), null)
})

test('venn: áreas proporcionales a cada conjunto y a la intersección', () => {
  const { rA, rB, d } = vennTwo(40, 25, 15)
  assert.ok(Math.abs(Math.PI * rA * rA - 55) < 1e-9)
  assert.ok(Math.abs(Math.PI * rB * rB - 40) < 1e-9)
  const a = rA * rA, b = rB * rB
  const lens = a * Math.acos((d * d + a - b) / (2 * d * rA)) + b * Math.acos((d * d + b - a) / (2 * d * rB)) - 0.5 * Math.sqrt((-d + rA + rB) * (d + rA - rB) * (d - rA + rB) * (d + rA + rB))
  assert.ok(Math.abs(lens - 15) < 1e-6)
  assert.equal(vennTwo(10, 10, 0).d, vennTwo(10, 10, 0).rA + vennTwo(10, 10, 0).rB)
})

test('la decisión se parte en lo que se pide y su lectura, sin perder ni cambiar texto', () => {
  const text = 'Aprobar el plan de septiembre: cinco acciones para convertir mejor el tráfico que ya llega. Las dos primeras pueden estar en producción en dos semanas.'
  const colon = splitLead(text)
  assert.equal(colon.lead, 'Aprobar el plan de septiembre')
  assert.equal(`${colon.lead}${colon.joiner}${colon.rest}`, text)
  const sentence = splitLead('Mover el presupuesto a búsqueda de marca. El CPC bajó a la mitad y la conversión se duplicó.')
  assert.equal(sentence.lead, 'Mover el presupuesto a búsqueda de marca.')
  assert.equal(`${sentence.lead}${sentence.joiner}${sentence.rest}`, 'Mover el presupuesto a búsqueda de marca. El CPC bajó a la mitad y la conversión se duplicó.')
  assert.equal(splitLead('Aprobar el plan.').rest, null)
})

test('sólo la familia 1.x del modelo llega al render; otro major o un payload incompleto es error', () => {
  for (const v of ['1.0', '1.1', '1.12']) assert.equal(isSupportedModelVersion(v), true, v)
  for (const v of ['2.0', '0.9', '1', '1.x', 1.1, null, undefined]) assert.equal(isSupportedModelVersion(v), false, String(v))
  const ok = resolveInsightFixture('fixture-completo')
  assert.equal(ok?.status, 'ok')
  const edition = (ok as Extract<typeof ok, { status: 'ok' }>).edition
  const silence = console.error
  console.error = () => {}
  try {
    assert.equal(acceptSharedEdition(edition).status, 'ok')
    assert.equal(acceptSharedEdition({ ...edition, modelVersion: '2.0' }).status, 'error')
    assert.equal(acceptSharedEdition({ ...edition, model: undefined }).status, 'error')
    assert.equal(acceptSharedEdition(null).status, 'error')
  } finally {
    console.error = silence
  }
})

// ── Modelo 1.4: tarjeta de cifra (TASK-1975) ────────────────────────────────

const statsOf = (token: string) => model(token).chapters.flatMap((c) => c.stats ?? [])

test('1.4 — la retícula de cifras: 1 en horizontal; 2 o 4 en dos columnas; 3, 5 o 6 en tres', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7].map(statColumns), [1, 2, 3, 2, 3, 3, 3])
  // Filetes: primera columna sin filete izquierdo y última fila sin filete inferior.
  const six = Array.from({ length: 6 }, (_, i) => statCellPlacement(i, 6))
  assert.deepEqual(six.map((p) => p.firstColumn), [true, false, false, true, false, false])
  assert.deepEqual(six.map((p) => p.lastRow), [false, false, false, true, true, true])
  const five = Array.from({ length: 5 }, (_, i) => statCellPlacement(i, 5))
  assert.deepEqual(five.map((p) => p.lastRow), [false, false, false, true, true])
  const four = Array.from({ length: 4 }, (_, i) => statCellPlacement(i, 4))
  assert.deepEqual(four.map((p) => p.firstColumn), [true, false, true, false])
  assert.deepEqual(statCellPlacement(0, 1), { column: 0, firstColumn: true, lastRow: true })
})

test('1.4 — el fixture de cifras trae las seis de visibilidad orgánica, en tres columnas, todas con su hecho', () => {
  const m = model('fixture-cifras')
  const seo = m.chapters.find((c) => c.module === 'seo')!.stats![0]!
  assert.deepEqual(seo.items.map((i) => i.label), ['Clics', 'Impresiones', 'CTR', 'Posición media', 'Primera página', 'Tráfico estimado'])
  assert.equal(statColumns(seo.items.length), 3)
  for (const stat of statsOf('fixture-cifras')) for (const item of stat.items) assert.ok(m.facts[item.factId], `${item.itemId} cita ${item.factId}`)
  const sizes = statsOf('fixture-cifras').map((s) => s.items.length)
  assert.deepEqual(sizes, [6, 4, 1])
})

test('1.4 — sin dato: «—», «Sin dato en …» y ninguna píldora ni recorrido; sin anterior: ni variación ni «vs»', () => {
  const items = statsOf('fixture-cifras').flatMap((s) => s.items)
  const absent = items.find((i) => i.noData)!
  assert.equal(absent.display, '—')
  assert.equal(absent.change, undefined)
  assert.equal(absent.count, undefined)
  assert.equal(absent.versus, undefined)
  assert.match(absent.noData!, /^Sin dato en /)
  const first = items.find((i) => i.itemId === 'share_of_model')!
  assert.equal(first.change, undefined)
  assert.equal(first.versus, undefined)
  assert.equal(first.count, undefined)
  // Toda cifra con variación trae su recorrido y su «vs»; el recorrido termina en la cifra impresa.
  for (const item of items.filter((i) => i.change)) {
    assert.ok(item.versus && item.count, item.itemId)
    const printed = Number(item.parts!.value.replace(/\./g, '').replace(',', '.'))
    assert.equal(item.count!.to, printed, item.itemId)
  }
})

test('1.4 — la variación se lee como frase completa (dirección, cifra, «vs …» y si mejora o empeora)', () => {
  assert.equal(INSIGHTS_COPY.statChangeSentence('down', '17,0 %', 'vs 16.390 en agosto de 2026', 'worse'), 'baja 17,0 %, vs 16.390 en agosto de 2026; empeora')
  assert.equal(INSIGHTS_COPY.statChangeSentence('up', '1,2 pos.', 'vs #5,7 en agosto de 2026', 'worse'), 'sube 1,2 pos., vs #5,7 en agosto de 2026; empeora')
  assert.equal(INSIGHTS_COPY.statChangeSentence('up', '23,4 %', undefined, 'better'), 'sube 23,4 %; mejora')
  assert.equal(INSIGHTS_COPY.statChangeSentence('flat', '0,0 pp', 'vs 18,4 % en agosto de 2026', 'neutral'), 'sin cambio (0,0 pp), vs 18,4 % en agosto de 2026')
  assert.equal(INSIGHTS_COPY_EN.statChangeSentence('down', '17.0%', 'vs 16,390 in August 2026', 'worse'), 'down 17.0%, vs 16,390 in August 2026; worse')
  assert.equal(INSIGHTS_COPY.statCount(1), '1 cifra')
  assert.equal(INSIGHTS_COPY.statCount(6), '6 cifras')
})

test('1.4 — un hallazgo puede apuntar a la tarjeta de cifra del capítulo', () => {
  const m = model('fixture-cifras')
  const evidence = resolveEvidence(m, { chapterId: 'ch-seo', chartId: 'stats.seo' })
  assert.equal(evidence?.stat?.figureId, 'stats.seo')
  assert.equal(evidence?.chart, undefined)
  assert.equal(evidence?.reading?.chartId, 'stats.seo')
  const waffle = resolveEvidence(m, { chapterId: 'ch-aeo', chartId: 'aeo-cite-waffle' })
  assert.equal(waffle?.chart?.spec.family, 'waffle')
  assert.equal(waffle?.stat, undefined)
})

test('1.4 — los gráficos llegan ordenados: Think respeta el orden desde 1.4 y acepta la familia 1.x', () => {
  assert.equal(chartsArriveOrdered('1.4'), true)
  assert.equal(chartsArriveOrdered('1.12'), true)
  assert.equal(chartsArriveOrdered('1.3'), false)
  assert.equal(chartsArriveOrdered(undefined), false)
  const ok = resolveInsightFixture('fixture-cifras')
  assert.equal(acceptSharedEdition((ok as Extract<typeof ok, { status: 'ok' }>).edition).status, 'ok')
})
