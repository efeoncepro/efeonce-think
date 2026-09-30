import type {RenderBlock} from './render-model'
/** Three-column comparisons can be presented as cards without dropping any cell.
 * Other tables remain in the original article renderer, with their headings intact. */
export function landingComparison(blocks:RenderBlock[]){
 const table=blocks.find(b=>b.type==='table'&&b.headers.length===3&&b.rows.every(r=>r.length===3))
 if(!table||table.type!=='table')return null
 const heading=blocks.slice(0,blocks.indexOf(table)).findLast(b=>b.type==='h2')
 const groups=[...new Set(table.rows.map(r=>r[0]))].map(label=>({label,rows:table.rows.filter(r=>r[0]===label)}))
 return {table,heading,groups}
}

/** A landing is composed as sections; each source block keeps its ID and evidence coupling. */
export function landingSections(blocks:RenderBlock[]){
 const sections:Array<{blocks:RenderBlock[]}>=[]
 for(const block of blocks){
  const standalone=['answer-capsule','faq','internal-links','sources'].includes(block.type)
  if(block.type==='h2'||standalone||sections.length===0)sections.push({blocks:[]})
  sections[sections.length-1].blocks.push(block)
 }
 return sections
}
