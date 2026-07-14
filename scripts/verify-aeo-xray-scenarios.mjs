#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { assertAeoXrayScenarioIds } from './lib/aeo-xray-scenarios.mjs'

const SOURCES = [
  { label: 'contenido publicado', dir: 'src/content/aeo-xray', fixture: false },
  { label: 'fixtures no publicadas', dir: 'scripts/fixtures/aeo-xray', fixture: true },
]

let total = 0
let failed = false
const publishedIds = new Set()

if (existsSync('src/content/aeo-xray')) {
  for (const file of readdirSync('src/content/aeo-xray').filter(name => name.endsWith('.json'))) {
    const payload = JSON.parse(readFileSync(join('src/content/aeo-xray', file), 'utf8'))
    for (const block of payload.article?.blocks ?? []) {
      if (typeof block.coupleId === 'string') publishedIds.add(block.coupleId)
    }
  }
}

for (const source of SOURCES) {
  if (!existsSync(source.dir)) continue

  for (const file of readdirSync(source.dir).filter(name => name.endsWith('.json')).sort()) {
    total += 1
    const path = join(source.dir, file)
    try {
      const payload = JSON.parse(readFileSync(path, 'utf8'))
      const scenarios = assertAeoXrayScenarioIds(payload, path)
      const selectedIds = Object.values(scenarios)
      const fixtureReusesPublishedIds = source.fixture && selectedIds.some(id => publishedIds.has(id))

      if (fixtureReusesPublishedIds) {
        throw new Error(
          `la fixture reutiliza IDs de contenido publicado (${selectedIds.filter(id => publishedIds.has(id)).join(', ')})`,
        )
      }

      console.log(`✓ ${source.label}: ${file} → ${Object.entries(scenarios).map(([k, v]) => `${k}=${v}`).join(' · ')}`)
    } catch (error) {
      failed = true
      console.error(`✗ ${source.label}: ${file} — ${error.message}`)
    }
  }
}

if (total === 0) {
  console.error('✗ No se encontraron payloads ni fixtures para validar escenarios AEO X-Ray.')
  process.exit(1)
}

if (failed) process.exit(1)

console.log(`\n✅ ${total} payload(s)/fixture(s) validan escenarios sin depender de IDs de SKY.\n`)
