import{test}from'node:test'
import assert from'node:assert/strict'
import{landingComparison,landingSections}from'../src/lib/aeo-xray/landing-model.ts'
test('non-banking comparisons preserve every row and label',()=>{
 const heading={type:'h2' as const,coupleId:'plans',text:'Planes de soporte',short:'Planes',anchor:'plans'}
 const table={type:'table' as const,coupleId:'comparison',headers:['Plan','Cobertura','Respuesta'],caption:'Acuerdos de atención',rows:[['Esencial','Laborables','24 horas'],['Completo','Todos los días','4 horas']]}
 const result=landingComparison([heading,table]);assert.deepEqual(result?.groups,[{label:'Esencial',rows:[table.rows[0]]},{label:'Completo',rows:[table.rows[1]]}]);assert.equal(result?.heading,heading)
})
test('two/four-column tables and unrelated headings remain in the original body',()=>{
 for(const headers of [['Servicio','Detalle'],['Uno','Dos','Tres','Cuatro']])assert.equal(landingComparison([{type:'table' as const,coupleId:'t',headers,rows:[headers],caption:'Detalle'}]),null)
 const result=landingComparison([{type:'table' as const,coupleId:'t',headers:['a','b','c'],rows:[['d','e','f']],caption:'Comparación'},{type:'h2' as const,coupleId:'later',text:'Otra sección',short:'Otra',anchor:'later'}]);assert.equal(result?.heading,undefined)
})

test('landing sections retain every source block and bind tables to the nearest heading',()=>{
 const blocks=[{type:'h2' as const,coupleId:'benefits',text:'Benefits',short:'Benefits',anchor:'benefits'},{type:'ordered-list' as const,coupleId:'list',title:'',ordered:false,items:['One','Two']},{type:'h2' as const,coupleId:'conditions',text:'Conditions',short:'Conditions',anchor:'conditions'},{type:'table' as const,coupleId:'table',headers:['a','b','c'],rows:[['a','b','c']],caption:'Conditions'}]
 const sections=landingSections(blocks)
 assert.equal(sections.length,2)
 assert.deepEqual(sections.flatMap(s=>s.blocks),blocks)
 assert.equal(landingComparison(blocks)?.heading?.coupleId,'conditions')
})
