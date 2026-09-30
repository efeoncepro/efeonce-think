import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import sample from '../src/lib/aeo-xray/published/pichincha.json' with {type:'json'}
import {readPublishedSample,publishedSampleAsset} from '../src/lib/aeo-xray/published.ts'

test('published package accepts the complete composition and exact approved media',()=>{
 const result=readPublishedSample(sample.key)
 assert.equal(result.status,'ok')
 assert.equal(sample.model.artifacts.length,2)
 for(const asset of sample.model.assets){
  const url=publishedSampleAsset(sample.key,asset.id)
  assert.ok(url)
  const bytes=readFileSync(new URL('../public'+url,import.meta.url))
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.ref.sha256)
 }
})
test('unknown publication and undeclared assets fail closed',()=>{
 assert.deepEqual(readPublishedSample('sample_unknown'),{status:'not_found'})
 for(const id of ['../pichincha.json','constructor','__proto__','unknown'])assert.equal(publishedSampleAsset(sample.key,id),null)
 assert.equal(publishedSampleAsset('sample_unknown','bank-logo'),null)
})

test('published question decisions agree with their instrument nodes',()=>{
 for(const artifact of sample.model.artifacts){
  for(const question of artifact.experience.evidence.fanOut.items){
   assert.ok(artifact.blocks.some(block=>block.id===question.coveredBy))
   for(const annotation of artifact.annotations.filter(a=>a.blockId===question.coveredBy)){
    const node=[...artifact.experience.machine.craft,...artifact.experience.machine.jsonld].find(n=>n.id===annotation.id)
    assert.ok(node,annotation.id)
    assert.equal(node.sourceStatus,annotation.status)
    assert.equal(node.why,annotation.explanation)
   }
  }
 }
})
