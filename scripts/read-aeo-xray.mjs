#!/usr/bin/env node
/**
 * read-aeo-xray — imprime el artículo como PARES cápsula ↔ narrador, para LEERLO.
 *
 * Por qué existe.
 *
 * El 2026-07-14 el gate dio 40/40 con un artículo que se contradecía a sí mismo en
 * CINCO puntos: el lead abría con «en ripio no se maneja a 90» y tres secciones más
 * abajo la cápsula decía «está pavimentada por tramos»; una cápsula decía «tres
 * puertas de entrada» y el narrador de al lado hablaba de «las dos puertas»; y el
 * mismo dato (diez días) tenía DOS explicaciones distintas en la misma pieza.
 *
 * El gate no lo cazó, y NO PODÍA: sus asserts verifican ESTRUCTURA —¿hay cápsula?
 * ¿hay tabla? ¿hay fuente?— y la coherencia argumental no es una propiedad
 * estructural. No hay regex que la vea.
 *
 * Así que este script NO verifica nada. Hace algo más honesto: pone cada párrafo del
 * narrador PEGADO a la cápsula que le toca, para que un humano lea los dos juntos y
 * la contradicción salte a la vista. Es el paso que yo me salté — escribí la capa del
 * narrador sin releer el artículo completo.
 *
 * 🔴 Correrlo y LEER la salida es obligatorio antes de tocar el texto de una muestra.
 *    Un verify verde sobre un artículo incoherente es peor que uno rojo: te deja
 *    tranquilo.
 *
 *   pnpm read:aeo-xray [slug]
 */
import { readFileSync } from 'node:fs'

const SAMPLE = process.argv[2] ?? process.env.XRAY_SAMPLE ?? 'sky-carretera-austral'
const d = JSON.parse(readFileSync(`src/content/aeo-xray/${SAMPLE}.json`, 'utf8'))

const wrap = (s, w = 74) =>
  s.split(' ').reduce(
    (acc, word) => {
      const last = acc[acc.length - 1]

      if ((last + ' ' + word).trim().length <= w) acc[acc.length - 1] = (last + ' ' + word).trim()
      else acc.push(word)

      return acc
    },
    [''],
  )

const C = { dim: '\x1b[2m', b: '\x1b[1m', cap: '\x1b[35m', nar: '\x1b[36m', r: '\x1b[0m' }

console.log(`\n${C.b}${d.article.category} · ${d.article.author}${C.r}`)
console.log(`${C.dim}Léelo como lector, no como agente. La pregunta es una sola:`)
console.log(`¿el narrador contradice, repite o sostiene lo que dice su cápsula?${C.r}\n`)

let caps = 0
let paras = 0

for (const b of d.article.blocks) {
  if (b.type === 'h1') console.log(`\n${C.b}══ ${b.text}${C.r}`)
  if (b.type === 'h2') console.log(`\n${C.b}── ${b.text}${C.r}`)

  if (b.type === 'answer-capsule') {
    caps++
    console.log(`\n  ${C.cap}┌─ CÁPSULA — la responde la máquina. Seca, autocontenida, 40-60 palabras.${C.r}`)
    wrap(b.text).forEach(l => console.log(`  ${C.cap}│${C.r} ${l}`))
  }

  if (b.type === 'paragraph') {
    paras++
    console.log(`  ${C.nar}├─ NARRADOR — cuenta lo que la respuesta NO dice. Si la repite, sobra.${C.r}`)
    wrap(b.text).forEach(l => console.log(`  ${C.nar}│${C.r} ${l}`))
  }

  if (b.type === 'ordered-list') {
    console.log(`  ${C.dim}├─ LISTA · ${b.title}${C.r}`)
    b.items.forEach(x => console.log(`  ${C.dim}│   · ${x}${C.r}`))
  }

  if (b.type === 'table') {
    console.log(`  ${C.dim}├─ TABLA · ${b.caption}${C.r}`)
    b.rows.forEach(r => console.log(`  ${C.dim}│   ${r.join(' · ')}${C.r}`))
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   LA MISMA HISTORIA, CONTADA POR LAS OTRAS DOS CAPAS.

   El artículo puede quedar perfectamente coherente CONSIGO MISMO y aun así la pieza
   se desmiente — porque la prosa vive en TRES capas y este script solo leía una.
   Pasó de verdad (2026-07-14): el artículo se corrigió a «los DOS transbordadores del
   norte» y la corrección se detuvo ahí. La meta description, el BlogPosting y las
   cuatro líneas del átomo de video siguieron diciendo «los TRES» — durante días, con
   el gate en verde. Y en la ③ quedaban lado a lado: la cápsula decía dos, la meta
   description decía tres, a diez centímetros de distancia.

   La capa de máquina y los átomos son PROSA que el evaluador lee. Se releen igual. */
const line = (label, text) => {
  if (!text) return
  console.log(`  ${C.dim}${label}${C.r}`)
  wrap(String(text)).forEach(l => console.log(`  ${C.nar}│${C.r} ${l}`))
}

console.log(`\n${C.b}══ LA CAPA DE MÁQUINA — la misma historia, en prosa que el evaluador LEE${C.r}`)
console.log(`${C.dim}   ¿dice exactamente lo mismo que el artículo de arriba? Los números, sobre todo.${C.r}\n`)
for (const n of [...d.machine.seo, ...d.machine.og]) line(`${n.label}${n.detail ? ` (${n.detail})` : ''}`, n.value)
for (const n of d.machine.jsonld) {
  const desc = n.code?.description ?? n.code?.headline ?? n.code?.name
  if (desc) line(`JSON-LD · ${n.type}`, desc)
}

console.log(`\n${C.b}══ LOS ÁTOMOS (④) — también son prosa, y también se contradicen${C.r}\n`)
for (const a of d.atoms) {
  console.log(`  ${C.b}${a.kind}${C.r} ${C.dim}· ${a.bornFrom}${C.r}`)
  line(`cifra`, `${a.stat} — ${a.statNote}  [${a.source} · ${a.asOf}]`)
  a.deliverable.forEach(x => line(x.k, x.v))
  if (a.post) line('pieza', `${a.post.hook} ${a.post.body}`)
  if (a.code?.description) line(`JSON-LD · ${a.code['@type']}`, a.code.description)
  console.log('')
}

console.log(`\n${C.dim}${'─'.repeat(78)}${C.r}`)
console.log(`${caps} cápsulas · ${paras} párrafos de narrador · ${d.atoms.length} átomos\n`)
console.log(`${C.b}Las cuatro preguntas, en orden:${C.r}`)
console.log(`  1. ¿Algún párrafo AFIRMA algo que otro bloque desmiente?  (la peor)`)
console.log(`  2. ¿Algún párrafo REPITE su cápsula en vez de aportar?    (sobra)`)
console.log(`  3. ¿Algún párrafo discute con un adversario INVENTADO?    («parecen tres días» — ¿a quién?)`)
console.log(`  4. ¿La MÁQUINA y los ÁTOMOS cuentan la misma historia que el artículo?`)
console.log(`     ${C.dim}(el «tres transbordadores» sobrevivió acá tres capas, con el gate en verde)${C.r}\n`)
