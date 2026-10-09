import assert from 'node:assert/strict'
import {mkdirSync,writeFileSync} from 'node:fs'
import {chromium} from 'playwright'
import pichincha from '../src/lib/aeo-xray/published/pichincha.json' with {type:'json'}
import pibank from '../src/lib/aeo-xray/published/pibank.json' with {type:'json'}
const base=process.env.XRAY_VERIFY_BASE??'http://127.0.0.1:4345',token=process.env.XRAY_VERIFY_TOKEN??pichincha.key
const sample=[pichincha,pibank].find(s=>s.key===token)??pichincha,landingId=sample.model.artifacts[0].id
const url=artifact=>`${base}/aeo-xray/r/${token}?artifact=${artifact}&step=articulo`
const out='.captures/aeo-xray-value';mkdirSync(out,{recursive:true})
const checks=[],check=(name,value)=>{assert.ok(value,name);checks.push(name)}
const browser=await chromium.launch()
try{
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844],['compact',320,780]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),page=await context.newPage(),errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  for(const artifact of sample.model.artifacts){
   const prefix=`${name}/${artifact.id}`
   await page.goto(url(artifact.id),{waitUntil:'networkidle'})
   const explorer=page.locator('[data-value-explorer]')
   check(prefix+' starts compact',await explorer.getAttribute('open')===null)
   await explorer.locator(':scope > summary').click()
   for(const [i,question] of artifact.experience.evidence.fanOut.items.entries()){
    await explorer.locator('[data-value-select]').nth(i).click()
    const panel=explorer.locator('[data-value-panel]:visible')
    check(prefix+` question ${i} has its actual answer`,await panel.count()===1&&(await panel.locator('h3').innerText())===question.q&&await panel.locator('.value-answer').innerText().then(t=>t.length>80))
    check(prefix+` question ${i} links exact evidence`,(await panel.locator('.value-primary').getAttribute('href')).endsWith(`#block-${question.coveredBy}`))
   }
   await explorer.locator('[data-value-select]').first().click()
   await explorer.locator('.value-measure > summary').click()
   check(prefix+' measurement separates SEO AEO and conversion',await explorer.locator('.value-measure dt').count()===3)
   check(prefix+' no overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
   await explorer.locator('.value-measure > summary').click()
   await explorer.locator(':scope > summary').scrollIntoViewIfNeeded()
   await page.evaluate(()=>scrollBy(0,-64))
   await page.screenshot({path:`${out}/${name}-${artifact.id}.png`})
   await explorer.locator('.value-case:visible .value-primary').click()
   const id=artifact.experience.evidence.fanOut.items[0].coveredBy
   await page.waitForSelector('.split')
   await page.waitForFunction(id=>document.querySelector(`#block-${id} [data-probe]`)?.getAttribute('aria-expanded')==='true',id)
   check(prefix+' exact block selected after navigation',new URL(page.url()).hash===`#block-${id}`)
   check(prefix+' explorer collapses for specimen',await page.locator('[data-value-explorer]').getAttribute('open')===null)
  }
  await page.goto(url(landingId),{waitUntil:'networkidle'})
  check(name+' landing contains nine distinct modules',await page.locator('[data-landing-module]').count()===9)
  await page.locator('[data-currency="1"]').click()
  check(name+' second condition group selected',await page.locator('[data-currency-panel="1"]').isVisible()&&!await page.locator('[data-currency-panel="0"]').isVisible())
  await page.locator('.faq-item > summary').first().click()
  check(name+' FAQ expands',await page.locator('.faq-item').first().getAttribute('open')!==null)
  check(name+' no browser errors',errors.length===0)
  await context.close()
 }
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await context.newPage()
 await page.goto(url(landingId))
 await page.locator('[data-value-explorer] > summary').click()
 check('no JS all question answers remain available',await page.locator('[data-value-panel]:visible').count()===sample.model.artifacts[0].experience.evidence.fanOut.items.length)
 check('no JS all condition groups remain available',await page.locator('[data-currency-panel]:visible').count()>=2)
 check('no JS no mobile overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
 await context.close();writeFileSync(out+'/verification.json',JSON.stringify({checks},null,2));console.log(`${checks.length} value and landing checks passed`)
}finally{await browser.close()}
