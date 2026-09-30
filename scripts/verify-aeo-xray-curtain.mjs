import assert from 'node:assert/strict'
import {mkdirSync,writeFileSync} from 'node:fs'
import {chromium} from 'playwright'
const base=process.env.XRAY_VERIFY_BASE??'http://127.0.0.1:4345'
const token=process.env.XRAY_VERIFY_TOKEN??'fixture-pichincha'
const entry=`${base}/aeo-xray/r/${token}?artifact=guia-cuenta-online`
const out='.captures/aeo-xray-curtain';mkdirSync(out,{recursive:true})
const checks=[],check=(name,ok)=>{assert.ok(ok,name);checks.push(name);console.log(name)}
const browser=await chromium.launch()
try{
 for(const [name,width,height]of[['desktop',1440,1000],['mobile',390,844],['compact',320,568]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference',recordVideo:{dir:out,size:{width,height}}})
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto(entry,{waitUntil:'networkidle'})
  check(name+' welcome is modal and focused',await page.locator('[data-xray-curtain]').evaluate(d=>d.matches(':modal')&&d.contains(document.activeElement)))
  const geometry=await page.locator('[data-xray-curtain]').evaluate(d=>{const r=d.getBoundingClientRect(),button=d.querySelector('button').getBoundingClientRect(),brand=d.querySelector('.curtain-logo').getBoundingClientRect();return {width:r.width,height:r.height,scroll:d.scrollHeight,space:brand.top-button.bottom}})
  check(name+' full viewport without overflow',geometry.width===width&&geometry.height===height&&geometry.scroll<=height)
  check(name+' signature separated from invitation',geometry.space>=60)
  check(name+' both official brands and URL loaded',await page.locator('[data-xray-curtain] img').evaluateAll(imgs=>imgs.length===3&&imgs.every(i=>i.complete&&i.naturalWidth>0)))
  check(name+' search sequence waits for entrance',await page.locator('[data-op-demo]').getAttribute('data-phase')==='complete')
  await page.screenshot({path:`${out}/${name}-closed.png`})
  await page.locator('[data-xray-curtain] button').click()
  await page.waitForTimeout(180)
  check(name+' curtain actually moves upward',await page.locator('[data-xray-curtain]').evaluate(d=>{const r=d.getBoundingClientRect();return r.top<0&&r.bottom>0}))
  check(name+' search is ready to begin without a visible reset',await page.locator('[data-op-demo]').evaluate(d=>d.dataset.phase==='query'&&getComputedStyle(d.querySelector('.op-response')).opacity==='0'))
  await page.screenshot({path:`${out}/${name}-lifting.png`,animations:'allow'})
  await page.locator('[data-xray-curtain][open]').waitFor({state:'hidden'})
  check(name+' focus transfers to opportunity',await page.locator('[data-opportunity] h1').evaluate(h=>h===document.activeElement))
  check(name+' scroll restored',await page.evaluate(()=>getComputedStyle(document.documentElement).overflow!=='hidden'))
  await page.locator('[data-op-open]').click();await page.locator('.sp-editorial').waitFor()
  await page.locator('.xr-rail a').first().click();await page.locator('[data-opportunity]').waitFor()
  check(name+' internal return never repeats welcome',await page.locator('[data-xray-curtain][open]').count()===0)
  await page.reload({waitUntil:'networkidle'})
  check(name+' remembered within this tab',await page.locator('[data-xray-curtain][open]').count()===0)
  check(name+' no script errors',errors.length===0)
  await context.close()
 }
 const reduced=await browser.newContext({reducedMotion:'reduce'}),rp=await reduced.newPage()
 await rp.goto(entry,{waitUntil:'networkidle'});await rp.keyboard.press('Escape')
 check('Escape and reduced motion reveal immediately',await rp.locator('[data-xray-curtain][open]').count()===0&&await rp.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length===0))
 await reduced.close()
 const nojs=await browser.newContext({javaScriptEnabled:false}),np=await nojs.newPage()
 await np.goto(entry);await np.locator('[data-xray-curtain] button').click()
 check('native form opens content without JavaScript',await np.locator('[data-xray-curtain][open]').count()===0&&await np.locator('[data-opportunity] h1').isVisible())
 await nojs.close()
 const deep=await browser.newContext(),dp=await deep.newPage()
 await dp.goto(entry+'&step=articulo',{waitUntil:'networkidle'})
 check('deep links retain their destination',await dp.locator('.sp-editorial').isVisible()&&await dp.locator('[data-xray-curtain][open]').count()===0)
 await dp.locator('.xr-rail a').first().click();await dp.locator('[data-opportunity]').waitFor()
 check('deep-link navigation does not introduce a welcome',await dp.locator('[data-xray-curtain][open]').count()===0)
 await deep.close()
 const privateContext=await browser.newContext({reducedMotion:'reduce'})
 await privateContext.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new DOMException('Blocked','SecurityError')};Storage.prototype.setItem=()=>{throw new DOMException('Blocked','SecurityError')}})
 const pp=await privateContext.newPage();await pp.goto(entry,{waitUntil:'networkidle'});await pp.locator('[data-xray-curtain] button').click()
 check('blocked storage does not trap the visitor',await pp.locator('[data-xray-curtain][open]').count()===0)
 await privateContext.close()
 writeFileSync(`${out}/verification.json`,JSON.stringify({checks},null,2))
 console.log(`${checks.length} welcome checks passed`)
}finally{await browser.close()}
