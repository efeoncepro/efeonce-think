import type {CollectionEntry} from 'astro:content'
type Legacy = CollectionEntry<'aeoXray'>['data']
type LegacyBlock = Legacy['article']['blocks'][number]
/** Additive presentation fields. The original static collection remains assignable unchanged. */
export type RenderBlock = LegacyBlock & {coupleId?:string; headingLevel?:2|3; ordered?:boolean; creditLabel?:string}
export type RenderEvidence = {description:string;asOf:string;sources:{label:string;url:string}[]}
type Scoped<T> = T extends Array<infer U> ? Scoped<U>[] : T extends object ? {[K in keyof T]:Scoped<T[K]>} & {sourceScope?:'block'|'page'|'site';sourceStatus?:'proposed'|'implemented'|'verified'|'measured';sourceEvidence?:RenderEvidence} : T
export type RenderSample = Omit<Legacy,'article'|'machine'|'evidence'|'client'> & {client:Legacy['client'] & {bodyFont?:string};machine:Scoped<Legacy['machine']>;evidence:Scoped<Legacy['evidence']>} & {article:Omit<Legacy['article'],'blocks'> & {blocks:RenderBlock[];reviewer?:string}}
