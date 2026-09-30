/** Local authoring only; client.ts imports the fixture lane exclusively under import.meta.env.DEV. */
import { readFile, realpath } from 'node:fs/promises'
import { resolve, relative, isAbsolute, extname, sep } from 'node:path'
import { createHash } from 'node:crypto'
import { acceptSharedXray, type SharedXrayResult } from './accept.ts'

export interface CaseFiles { manifestFile?: string; assets?: Record<string,string> }
const mime:Record<string,string>={'.avif':'image/avif','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'}
const inside=(base:string,path:string)=>{const r=relative(base,path);return r!==''&&!r.startsWith('..'+sep)&&r!=='..'&&!isAbsolute(r)}
const filename=(v:unknown):v is string=>typeof v==='string'&&v.length>0&&!isAbsolute(v)&&!/[\\\0]/.test(v)&&v.split('/').every(p=>p!==''&&p!=='.'&&p!=='..')
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
async function contained(base:string,name:string){
  if(!filename(name))throw Error('Invalid case file')
  const file=await realpath(resolve(base,name))
  if(!inside(base,file))throw Error('Case file outside root')
  return file
}
async function load(root:string,options:CaseFiles={}){
  const base=await realpath(root)
  const model=JSON.parse(await readFile(await contained(base,options.manifestFile??'manifest.json'),'utf8'))
  const accepted=acceptSharedXray({modelVersion:'1.0',model,header:{title:model.title,preparedFor:model.preparedFor,editionId:'dev-case'},expiresAt:'2099-01-01T00:00:00Z'})
  if(accepted.status!=='ok')throw Error('Invalid case manifest')
  const map:unknown=options.assets??JSON.parse(await readFile(await contained(base,'assets.json'),'utf8'))
  if(!object(map))throw Error('Invalid asset map')
  const declared=accepted.edition.model.assets.filter(a=>a.ref.kind==='protected')
  if(Object.keys(map).some(id=>!declared.some(a=>a.id===id))||declared.some(a=>!Object.hasOwn(map,a.id)))throw Error('Asset map does not match manifest')
  const paths=new Map<string,string>()
  if(declared.length){
    const assetRoot=await contained(base,'assets')
    for(const a of declared){
      const file=map[a.id]
      if(!filename(file)||!mime[extname(file).toLowerCase()])throw Error('Invalid raster asset')
      paths.set(a.id,await contained(assetRoot,file))
    }
  }
  return {accepted,paths}
}
export async function readFixtureCase(root:string|undefined,options:CaseFiles={}):Promise<SharedXrayResult>{
  if(!root)return {status:'not_found'}
  try{return (await load(root,options)).accepted}catch{return {status:'error'}}
}
export async function readFixtureCaseAsset(root:string|undefined,id:string,options:CaseFiles={}):Promise<Response|null>{
  if(!root||!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(id))return null
  try{
    const {accepted,paths}=await load(root,options),file=paths.get(id)
    if(!file)return null
    const asset=accepted.edition.model.assets.find(a=>a.id===id)!,bytes=await readFile(file)
    if(asset.ref.kind==='protected'&&asset.ref.sha256&&createHash('sha256').update(bytes).digest('hex')!==asset.ref.sha256)return null
    return new Response(bytes,{headers:{'content-type':mime[extname(file).toLowerCase()],'cache-control':'private, no-store'}})
  }catch{return null}
}
