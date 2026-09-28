/**
 * Pruebas del informe compartido de Insights (TASK-1875): la vista (qué se muestra y en qué orden) y la geometría de
 * las familias de gráfico. Ninguna prueba compara strings de markup: se prueba el comportamiento de las funciones que
 * decide qué se dibuja. Correr con `pnpm test:insights` (Node ≥ 24 ejecuta TypeScript sin compilar).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveInsightFixture } from '../src/lib/insights-fixtures.ts'
import { acceptSharedEdition, isSupportedModelVersion } from '../src/lib/insights-accept.ts'
import { buildFindings, chartFactIds, findEvidence, splitLead, splitSummary } from '../src/lib/insights-view.ts'
import { bulletScale, gaugeAngle, GAUGE_START, GAUGE_SWEEP, heatmapIntensity, niceScale, slices, vennTwo, waffleCells, waterfallBars } from '../src/lib/insights-chart-geometry.ts'

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
    assert.equal(f.module, first?.module ?? null)
  }
})

test('un modelo 1.0 sin «Lo esencial» usa sólo las afirmaciones del resumen que citan hechos', () => {
  const m = model('fixture-v1')
  assert.equal(m.essentials, undefined)
  const findings = buildFindings(m)
  assert.deepEqual(findings.map((f) => f.claim.claimId), m.executiveSummary.filter((c) => c.factIds.length > 0).map((c) => c.claimId))
})

test('la evidencia prefiere la figura cuya cifra principal ES el hecho', () => {
  const m = model('fixture-completo')
  for (const chapter of m.chapters) {
    for (const reading of chapter.readings ?? []) {
      if (!reading.keyFigure) continue
      const evidence = findEvidence(m, reading.keyFigure.factId)
      assert.equal(evidence?.chart.spec.chartId, reading.chartId)
    }
  }
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

test('waffle: siempre 100 celdas y cada parte redondea por restos mayores', () => {
  for (const values of [[1, 1, 1], [60.1, 39.9], [33, 33, 34], [0, 7]]) {
    const cells = waffleCells(values)
    assert.equal(cells.length, 100)
    assert.equal(cells.filter((c) => c !== null).length, 100)
    values.forEach((v, i) => {
      const exact = (v / values.reduce((a, b) => a + b, 0)) * 100
      const got = cells.filter((c) => c === i).length
      assert.ok(Math.abs(got - exact) < 1, `${values}: parte ${i} = ${got}, exacto ${exact}`)
    })
  }
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
