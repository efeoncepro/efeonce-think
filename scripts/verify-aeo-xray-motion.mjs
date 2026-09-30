import assert from 'node:assert/strict'
import {mkdirSync, writeFileSync} from 'node:fs'
import {chromium} from 'playwright'

const base = process.env.XRAY_VERIFY_BASE ?? 'http://127.0.0.1:4345'
const token = process.env.XRAY_VERIFY_TOKEN ?? 'fixture-pichincha'
const url = (step='articulo', artifact='ahorro-preferente') => `${base}/aeo-xray/r/${token}?artifact=${artifact}&step=${step}`
const out = '.captures/aeo-xray-motion'
mkdirSync(out, {recursive:true})
const browser = await chromium.launch()
const checks = []
const check = (name, value) => {assert.ok(value, name); checks.push(name)}
try {
 for (const [name,width,height] of [['desktop',1440,1000], ['mobile',390,844]]) {
  const context = await browser.newContext({viewport:{width,height}, reducedMotion:'no-preference', recordVideo:{dir:out,size:{width,height}}})
  const page = await context.newPage()
  const errors=[]; page.on('pageerror',e=>errors.push(e.message))
  await page.addInitScript(()=>{
   window.__xrayDocument = Math.random()
   window.__xrayTransitions = []
   const original = document.startViewTransition.bind(document)
   document.startViewTransition = (...args) => {
    const specimenNames=()=>[...document.querySelectorAll('.op-preview,.sp,.landing,.xr-hero-img,.inst')].map(el=>({name:getComputedStyle(el).viewTransitionName,src:el instanceof HTMLImageElement?el.currentSrc:undefined}))
    const oldNames=specimenNames()
    const vt=original(...args)
    const item={ready:false,finished:false,frames:[],animations:[],oldNames}
    window.__xrayTransitions.push(item)
    vt.ready.then(()=>{
     item.ready=true
     item.route=document.documentElement.dataset.xrayRoute
     item.direction=document.documentElement.dataset.xrayDirection
     item.newNames=specimenNames()
     item.animations=document.getAnimations().map(a=>({name:a.animationName,pseudo:a.effect?.pseudoElement,duration:a.effect?.getTiming().duration}))
     const sample=()=>{
      const css=getComputedStyle(document.documentElement,'::view-transition-group(xr-article)')
      item.frames.push({width:css.width,height:css.height,transform:css.transform})
      if(!item.finished)requestAnimationFrame(sample)
     }
     requestAnimationFrame(sample)
    }).catch(e=>{item.error=e.name})
    vt.finished.then(()=>{item.finished=true})
    return vt
   }
  })
  const navigate=async(action,selector,screenshot)=>{
   const index=await page.evaluate(()=>window.__xrayTransitions.length)
   await action();await page.waitForSelector(selector)
   await page.waitForFunction(index=>window.__xrayTransitions[index]?.ready||window.__xrayTransitions[index]?.error,index)
   if(screenshot){await page.waitForTimeout(230);await page.screenshot({path:`${out}/${name}-${screenshot}.png`,animations:'allow'})}
   await page.waitForFunction(index=>window.__xrayTransitions[index]?.finished,index)
   return await page.evaluate(index=>window.__xrayTransitions[index],index)
  }
  await page.goto(url(''),{waitUntil:'networkidle'})
  await page.locator('[data-xray-curtain] button').click()
  await page.locator('[data-xray-curtain][open]').waitFor({state:'hidden'})
  for(const [artifactIndex,kind] of [[0,'landing'],[1,'article']]){
   if(artifactIndex){
    const changed=await navigate(()=>page.locator('.xr-artifacts a').nth(artifactIndex).click(),'.op-preview')
    check(name+' opportunity artifact change does not morph different entities',changed.direction==='artifact'&&[...changed.oldNames,...changed.newNames].every(n=>n.name==='none'))
   }
   const opening=await navigate(()=>page.locator('[data-op-open]').first().click(),'.read-stage',`${kind}-opportunity-open`)
   check(name+' '+kind+' preview opens with dedicated choreography',opening.ready&&!opening.error&&opening.route==='opportunity-piece'&&opening.animations.some(a=>a.pseudo?.includes('xr-article')&&a.duration===820))
   check(name+' '+kind+' preview geometry expands',new Set(opening.frames.map(f=>f.width+f.height+f.transform)).size>=3)
   if(kind==='article')check(name+' article photograph keeps its identity',opening.oldNames.some(old=>old.name==='xr-hero'&&opening.newNames.some(next=>next.name==='xr-hero'&&next.src===old.src)))
   const returning=await navigate(()=>page.locator('.xr-rail a').first().click(),'.op-preview',`${kind}-opportunity-return`)
   check(name+' '+kind+' piece returns to its preview',returning.ready&&!returning.error&&returning.route==='piece-opportunity'&&returning.animations.some(a=>a.pseudo?.includes('xr-article')&&a.duration===700))
   check(name+' '+kind+' return keeps its source visible',await page.evaluate(()=>document.querySelector('[data-op-demo]')?.dataset.phase==='complete'&&getComputedStyle(document.querySelector('[data-op-source]')).opacity==='1'))
  }
  writeFileSync(`${out}/${name}-opportunity-transitions.json`,JSON.stringify(await page.evaluate(()=>window.__xrayTransitions),null,2))
  await page.goto(url(),{waitUntil:'networkidle'})
  const documentId=await page.evaluate(()=>window.__xrayDocument)
  await page.locator('.xr-rail a').nth(2).click()
  await page.waitForSelector('.split')
  await page.waitForFunction(()=>window.__xrayTransitions[0]?.ready)
  await page.waitForTimeout(230)
  await page.screenshot({path:`${out}/${name}-morph.png`, animations:'allow'})
  await page.waitForFunction(()=>window.__xrayTransitions[0]?.finished)
  const transition=await page.evaluate(()=>window.__xrayTransitions[0])
  check(name+' same-document query navigation',await page.evaluate(()=>window.__xrayDocument)===documentId)
  check(name+' shared specimen transition actually ran',transition.ready && !transition.error && transition.animations.some(a=>a.pseudo?.includes('xr-article')&&a.duration>=600))
  check(name+' specimen geometry changed during animation',new Set(transition.frames.map(f=>f.width+f.transform)).size>=3)
  if(name==='desktop')check(name+' machine entered with motion',transition.animations.some(a=>a.name==='xr-slide-in'))
  const probe=page.locator('[data-couple] [data-probe]').first()
  await probe.focus();await page.keyboard.press('Enter')
  check(name+' instrument initialized after swap',await probe.getAttribute('aria-expanded')==='true')
  await page.keyboard.press('Escape')
  await page.locator('.xr-rail a').nth(1).click();await page.waitForSelector('.read-stage');await page.waitForTimeout(700)
  check(name+' backward transition direction',await page.evaluate(()=>document.documentElement.dataset.xrayDirection)==='back')
  const changed=await navigate(()=>page.locator('.xr-artifacts a').nth(1).click(),'.sp-editorial')
  check(name+' switching piece reuses document',await page.evaluate(()=>window.__xrayDocument)===documentId)
  check(name+' switching piece never morphs unrelated content',changed.direction==='artifact'&&[...changed.oldNames,...changed.newNames].every(n=>n.name==='none'))
  await page.goBack();await page.waitForSelector('.landing');await page.waitForTimeout(700)
  check(name+' browser back restores landing',await page.locator('.landing').count()===1)
  await page.goForward();await page.waitForSelector('.sp-editorial');await page.waitForTimeout(700)
  check(name+' browser forward restores article',await page.locator('.sp-editorial').count()===1)
  await page.locator('.xr-rail a').nth(3).click();await page.waitForSelector('.atom');await page.waitForTimeout(900)
  check(name+' original derivative flow retained',await page.locator('.atom').count()>=3)
  await page.locator('.atom-origin').first().click();await page.waitForSelector('.split');await page.waitForTimeout(700)
  check(name+' lineage initializes coupled destination',await page.locator('[data-couple][data-on]').count()>0)
  check(name+' no console exceptions',errors.length===0)
  writeFileSync(`${out}/${name}-transitions.json`,JSON.stringify(await page.evaluate(()=>window.__xrayTransitions),null,2))
  await context.close()
 }
 const reduced=await browser.newContext({reducedMotion:'reduce'})
 const reducedPage=await reduced.newPage()
 await reducedPage.goto(url(''),{waitUntil:'networkidle'})
 await reducedPage.locator('[data-xray-curtain] button').click()
 await reducedPage.locator('[data-op-open]').first().click();await reducedPage.waitForSelector('.read-stage')
 check('reduced opportunity still opens the complete piece',await reducedPage.locator('.landing').isVisible()&&await reducedPage.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length===0))
 await reducedPage.locator('.xr-rail a').nth(2).click();await reducedPage.waitForSelector('.split');await reducedPage.waitForTimeout(100)
 check('reduced motion keeps complete content without animations',await reducedPage.evaluate(()=>document.querySelector('.xr').dataset.motion==='reduced' && document.getAnimations().filter(a=>a.playState==='running').length===0))
 await reduced.close()
 const nojs=await browser.newContext({javaScriptEnabled:false})
 const nojsPage=await nojs.newPage();await nojsPage.goto(url(''))
 await nojsPage.locator('[data-xray-curtain] button').click()
 await nojsPage.locator('[data-op-open]').first().click();await nojsPage.waitForSelector('.landing')
 check('no-JS opportunity link opens the complete piece',await nojsPage.locator('.landing').isVisible())
 await nojsPage.locator('.xr-rail a').nth(2).click();await nojsPage.waitForSelector('.inst');await nojsPage.waitForLoadState('networkidle')
 check('no-JS links and instrument still work',await nojsPage.locator('.inst').isVisible()&&await nojsPage.locator('[data-couple][data-on]').count()>0)
 await nojs.close()
 writeFileSync(`${out}/verification.json`,JSON.stringify({checks},null,2))
 console.log(`${checks.length} motion and navigation checks passed`)
} finally {await browser.close()}
