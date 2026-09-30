import {test,type TestContext} from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,readFile,writeFile,mkdir,symlink,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createHash} from 'node:crypto'
import {resolveAeoXrayIntent} from '../src/lib/axis/aeo-xray/aeo-xray.js'
import {readFixtureCase,readFixtureCaseAsset} from '../src/lib/aeo-xray/fixture-case.ts'
const bytes=Buffer.from('89504e470d0a1a0a','hex')
async function fixture(t:TestContext){
 const dir=await mkdtemp(join(tmpdir(),'xray-case-'));t.after(()=>rm(dir,{recursive:true,force:true}))
 await mkdir(join(dir,'assets'));await writeFile(join(dir,'assets','brand.png'),bytes)
 const intent=JSON.parse(await readFile(new URL('../src/lib/aeo-xray/fixture-minimal.json',import.meta.url),'utf8'))
 intent.preparedFor='Taller Norte';intent.brand.name='Taller Norte'
 intent.assets=[{id:'brand',ref:{kind:'protected',assetId:'brand',sha256:createHash('sha256').update(bytes).digest('hex')},alt:'Marca Taller Norte',width:20,height:20,credit:'Recurso autorizado del taller',sourceId:'source',approval:'approved'}]
 const model=resolveAeoXrayIntent(intent);assert.equal(model.status,'resolved')
 await writeFile(join(dir,'manifest.json'),JSON.stringify(model));await writeFile(join(dir,'assets.json'),JSON.stringify({brand:'brand.png'}));return dir
}
test('another client loads its frozen manifest and private raster asset without a code change',async t=>{
 const dir=await fixture(t),result=await readFixtureCase(dir);assert.equal(result.status,'ok');if(result.status==='ok')assert.equal(result.edition.header.preparedFor,'Taller Norte')
 const response=await readFixtureCaseAsset(dir,'brand');assert.equal(response?.headers.get('content-type'),'image/png');assert.deepEqual(Buffer.from(await response!.arrayBuffer()),bytes)
 assert.equal(await readFixtureCaseAsset(dir,'unlisted'),null)
})
test('missing directory, corrupt model and mismatched map fail closed',async t=>{
 assert.deepEqual(await readFixtureCase(undefined),{status:'not_found'});const dir=await fixture(t)
 await writeFile(join(dir,'assets.json'),'{}');assert.deepEqual(await readFixtureCase(dir),{status:'error'})
 await writeFile(join(dir,'manifest.json'),'{');assert.deepEqual(await readFixtureCase(dir),{status:'error'})
})
test('paths, symlinks and unsupported active formats cannot escape the asset root',async t=>{
 const dir=await fixture(t)
 for(const value of ['../manifest.json','/etc/passwd','..\\secret.png','nested/../brand.png','brand.svg']){
  await writeFile(join(dir,'assets.json'),JSON.stringify({brand:value}));assert.equal(await readFixtureCaseAsset(dir,'brand'),null,value)
 }
 await writeFile(join(dir,'outside.png'),bytes);await symlink(join(dir,'outside.png'),join(dir,'assets','escape.png'))
 await writeFile(join(dir,'assets.json'),JSON.stringify({brand:'escape.png'}));assert.deepEqual(await readFixtureCase(dir),{status:'error'})
 assert.equal(await readFixtureCaseAsset(dir,'../manifest.json'),null)
})
test('declared hash prevents serving replaced bytes',async t=>{
 const dir=await fixture(t);await writeFile(join(dir,'assets','brand.png'),'changed');assert.equal(await readFixtureCaseAsset(dir,'brand'),null)
})
