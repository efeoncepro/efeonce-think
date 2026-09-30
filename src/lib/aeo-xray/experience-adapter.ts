import type { CollectionEntry } from 'astro:content'
import type { RenderSample, RenderBlock } from './render-model'
import type { ImageMetadata } from 'astro'
import type { AxisAeoXrayArtifact, AxisAeoXrayManifest } from '../axis/aeo-xray/aeo-xray.js'
import { assetHref } from './view'

type Legacy = CollectionEntry<'aeoXray'>['data']
type Block = RenderBlock
export const experienceSteps = ['', 'articulo', 'radiografia', 'atomizacion'] as const
export const experienceHref = (artifact: string, step: string, block?: string) => `?${new URLSearchParams({artifact, ...(step ? {step} : {})})}${block ? `#${encodeURIComponent(block)}` : ''}`

/** Presentation adapter only. AXIS has already validated content, references and evidence. */
export function adaptExperience(model: AxisAeoXrayManifest, artifact: AxisAeoXrayArtifact): RenderSample | null {
  const x = artifact.experience
  if (!x) return null
  const asset = (id: string) => {
    const value = model.assets.find(a => a.id === id)
    if (!value) throw new Error('Missing accepted asset')
    return value
  }
  const image = (id: string): ImageMetadata => {
    const a = asset(id)
    return {src: assetHref(a), width:a.width, height:a.height, format:'webp'}
  }
  const imageBlock = (id:string, assetId:string, hero=false, caption?:string): Block => {
    const a=asset(assetId), source=model.sources.find(s=>s.id===a.sourceId)!
    return {type:hero?'hero-image':'image', coupleId:id,src:image(assetId),alt:a.alt,caption,creditLabel:a.credit.startsWith('Composición:')?'Diseño':'Foto',credit:{author:a.credit.replace(/^(Fotografía|Imagen|Composición):\s*/,''),license:'Fuente',url:source.url}}
  }
  const blocks: Block[] = artifact.blocks.flatMap((b):Block[] => {
    const coupleId=b.id
    switch(b.kind) {
      case 'hero': return [{type:'h1',coupleId,text:b.title},{type:'paragraph',text:b.text}, ...(b.assetId?[imageBlock(`${b.id}-image`,b.assetId,true)]:[])]
      case 'heading': return [{type:'h2',coupleId,headingLevel:b.level,text:b.text,anchor:b.anchor??b.id,short:b.short??b.text}]
      case 'paragraph': return [{type:'paragraph',coupleId,text:b.text}]
      case 'answer-capsule': case 'pull-quote': return [{type:b.kind,coupleId,text:b.text}]
      case 'toc': return [{type:'toc',coupleId,title:b.title}]
      case 'internal-links': case 'sources': return [{type:b.kind,coupleId,title:b.title,items:b.items}]
      case 'table': return [{type:'table',coupleId,caption:b.caption,headers:b.columns,rows:b.rows}]
      case 'list': return [{type:'ordered-list',coupleId,ordered:b.ordered??false,title:'',items:b.items}]
      case 'image': return [imageBlock(coupleId,b.assetId,b.role==='hero',b.caption)]
      case 'quote': return [{type:'pull-quote',coupleId,text:`${b.text} — ${b.attribution}`}]
      case 'faq': return [{type:'faq',coupleId,title:b.title??'Preguntas frecuentes',anchor:b.anchor??b.id,short:b.short??'Preguntas frecuentes',items:b.items.map(i=>({q:i.question,a:i.answer}))}]
      case 'cta': return [{type:'internal-links',coupleId,title:b.title??b.text??'Siguiente paso',items:[{text:b.action.label,href:b.action.artifactId?experienceHref(b.action.artifactId,'articulo',b.action.blockId):b.action.href!,note:b.text}]}]
    }
  })
  const m=x.machine
  // Empty coupling means page/site scope, never a fabricated relationship to the hero.
  const node = (n:typeof m.seo[number]) => ({...n,coupleId:n.coupleId??'',id:n.id??'',label:n.label??'',value:n.value??'',why:n.why??'',tier:n.tier??3 as 1|2|3})
  const media = (v: NonNullable<typeof x.atoms[number]['video']>) => ({...v,src:assetHref(asset(v.assetId)),poster:assetHref(asset(v.posterAssetId))})
  return {
    token:'',
    client:{bodyFont:model.tokens.fonts[model.brand?.fontFamily??'system-sans'],name:model.brand?.name??model.preparedFor,legalName:model.preparedFor,site:new URL(artifact.seo.canonical).origin,accent:model.brand?.ink??model.tokens.canvas.ink,font:{family:model.tokens.fonts[model.brand?.displayFontFamily??'system-serif'],titleWeight:700,bodyWeight:400}},
    meta:{instrument:'AEO X-Ray',sampleFor:model.preparedFor,sampleTitle:artifact.title,kicker:'Una muestra de nuestro trabajo',preparedAt:model.preparedAt,preparedBy:'Efeonce',...x.meta},
    thesis:x.thesis,gap:x.gap,flow:x.flow,atomsIntro:x.atomsIntro,
    article:{proposedUrl:artifact.seo.canonical,category:artifact.blocks.find(b=>b.kind==='hero')?.eyebrow??(artifact.kind==='article'?'Artículo':'Página'),author:artifact.byline?.author??'Efeonce',publishedAt:(artifact.byline?.publishedAt??model.preparedAt).slice(0,10),blocks},
    machine:{seo:m.seo.map(node),og:m.og.map(node),headings:{...m.headings,coupleId:m.headings.coupleId??'',tree:m.headings.tree.map(h=>({...h,coupleId:h.coupleId??''}))},alts:m.alts.map(a=>({...a,coupleId:a.coupleId??''})),jsonld:m.jsonld.map(n=>({...node(n),type:n.type??'',metric:n.metric??'',code:n.code??{}})),craft:m.craft.map(n=>({...node(n),detail:n.detail??''}))},
    evidence:{...x.evidence,facts:x.evidence.facts.map(f=>({...f,coupleId:f.coupleId??''}))},
    atoms:x.atoms.map(a=>({...a,coupleId:a.coupleId??'',stat:a.stat??'',statNote:a.statNote??'',source:a.source??'',asOf:a.asOf??'',video:a.video?media(a.video):undefined,reel:a.reel?media(a.reel):undefined,post:a.post?{...a.post,image:a.post.imageAssetId?image(a.post.imageAssetId):undefined}:undefined})),
    // AXIS validates every original UI key and verifySteps before this boundary.
    ui:x.ui as Legacy['ui'],
  }
}
