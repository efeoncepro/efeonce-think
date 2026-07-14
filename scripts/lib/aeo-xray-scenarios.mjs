const blockId = block => {
  const id = block?.coupleId

  return typeof id === 'string' && id.trim().length > 0 ? id : null
}

const blocksOf = payload => (Array.isArray(payload?.article?.blocks) ? payload.article.blocks : [])

const firstBlockId = (payload, predicate) => {
  const block = blocksOf(payload).find(candidate => predicate(candidate) && blockId(candidate))

  return blockId(block)
}

export const AEO_XRAY_REQUIRED_SCENARIOS = ['hero', 'image', 'keyboard', 'scrollGuard', 'mobile', 'heading']

export const resolveAeoXrayScenarioIds = payload => {
  const hero = firstBlockId(payload, block => block.type === 'answer-capsule') ?? firstBlockId(payload, () => true)
  const image =
    firstBlockId(payload, block => block.type === 'hero-image') ??
    firstBlockId(payload, block => block.type === 'image')
  const heading = firstBlockId(payload, block => block.type === 'h1') ?? hero
  const keyboard = firstBlockId(payload, block => block.type === 'h2') ?? hero
  const scrollGuard =
    firstBlockId(payload, block => block.type === 'faq') ??
    firstBlockId(payload, block => block.type === 'h2') ??
    hero
  const mobile =
    firstBlockId(payload, block => block.type === 'table') ??
    firstBlockId(payload, block => block.type === 'ordered-list') ??
    image ??
    hero

  return { hero, image, keyboard, scrollGuard, mobile, heading }
}

export const assertAeoXrayScenarioIds = (payload, label = 'payload') => {
  const scenarios = resolveAeoXrayScenarioIds(payload)
  const missing = AEO_XRAY_REQUIRED_SCENARIOS.filter(name => !scenarios[name])

  if (missing.length) {
    throw new Error(
      `${label}: faltan bloques para escenarios de verify (${missing.join(', ')}). ` +
        'El gate necesita al menos cápsula, imagen, H1, H2, FAQ y bloque móvil/table/lista.',
    )
  }

  return scenarios
}
