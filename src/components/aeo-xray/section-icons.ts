import type {RenderBlock} from '@/lib/aeo-xray/render-model'

/** Presentation belongs to the specimen, independently of the AXIS content contract. */
export type SectionRole = 'contents' | 'comparison' | 'steps' | 'benefits' | 'requirements' | 'questions' | 'sources' | 'related' | 'costs' | 'protection'
export interface SpecimenPresentation {
  /** Explicit editorial roles, keyed by a stable block ID or heading anchor. */
  sectionRoles?: Readonly<Record<string, SectionRole>>
}

/** Infer only what the block structure establishes. Prose never decides an icon. */
export function sectionRoleFor(block: RenderBlock, blocks: readonly RenderBlock[], presentation?: SpecimenPresentation): SectionRole | undefined {
  const explicit = (block.coupleId && presentation?.sectionRoles?.[block.coupleId]) ||
    ('anchor' in block && presentation?.sectionRoles?.[block.anchor])
  if (explicit) return explicit
  if (block.type === 'faq') return 'questions'
  if (block.type === 'sources') return 'sources'
  if (block.type === 'internal-links') return 'related'
  if (block.type === 'toc') return 'contents'
  if (block.type === 'table') return 'comparison'
  if (block.type === 'ordered-list') return block.ordered === false ? 'benefits' : 'steps'
  if (block.type !== 'h2') return undefined

  const start = blocks.indexOf(block)
  if (start < 0) return undefined
  const end = blocks.findIndex((candidate, i) => i > start && ['h2', 'faq', 'sources', 'internal-links'].includes(candidate.type))
  const section = blocks.slice(start + 1, end < 0 ? undefined : end)
  if (section.some(b => b.type === 'table')) return 'comparison'
  const list = section.find(b => b.type === 'ordered-list')
  return list ? sectionRoleFor(list, blocks, presentation) : undefined
}
