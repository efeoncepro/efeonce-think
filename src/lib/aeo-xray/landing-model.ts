import type {RenderBlock} from './render-model'
/** Three-column comparisons can be presented as cards without dropping any cell.
 * Other tables remain in the original article renderer, with their headings intact. */
export function landingComparison(blocks:RenderBlock[]){
 const table=blocks.find(b=>b.type==='table'&&b.headers.length===3&&b.rows.every(r=>r.length===3))
 if(!table||table.type!=='table')return null
 const heading=blocks.slice(0,blocks.indexOf(table)).find(b=>b.type==='h2')
 const groups=[...new Set(table.rows.map(r=>r[0]))].map(label=>({label,rows:table.rows.filter(r=>r[0]===label)}))
 return {table,heading,groups}
}
