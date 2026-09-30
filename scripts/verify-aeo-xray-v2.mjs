import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import {mkdirSync,writeFileSync} from 'node:fs'
const base=process.env.XRAY_VERIFY_BASE??'http://127.0.0.1:4345'
const token=process.env.XRAY_VERIFY_TOKEN??'fixture-pichincha'
const out='.captures/aeo-xray-extension';mkdirSync(out,{recursive:true})
const browser=await chromium.launch();const checks=[]
const check=(name,value)=>{assert.ok(value,name);checks.push(name)}
try{
 for(const [name,width,height]of[['desktop',1440,1000],['mobile',390,844],['compact',320,780]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.name))
  for(const artifact of ['ahorro-preferente','guia-cuenta-online'])for(const step of['','articulo','radiografia','atomizacion']){
   const prefix=`${name}/${artifact}/${step||'gap'}`;console.log(prefix)
   const response=await page.goto(`${base}/aeo-xray/r/${token}?artifact=${artifact}&step=${step}`,{waitUntil:'networkidle'})
   check(prefix+' status',response.status()===200)
   if(await page.locator('[data-xray-curtain][open]').count()){
    await page.locator('[data-xray-curtain] button').click()
    await page.locator('[data-xray-curtain][open]').waitFor({state:'hidden'})
   }
   await page.locator('.xr-artifacts a').first().hover();await page.waitForTimeout(140)
   const html=await page.content(),headers=response.headers()
   if(html.includes(token)){const at=html.indexOf(token);console.error('Unexpected share-key context:',html.slice(Math.max(0,at-90),at+token.length+90).replaceAll(token,'[share-key]'))}
   const privacy={noStore:headers['cache-control']?.includes('no-store'),noReferrer:headers['referrer-policy']==='no-referrer',noKeyInMarkup:!html.includes(token),noAnalytics:!html.includes('googletagmanager.com'),noActiveSchema:!html.includes('application/ld+json')}
   check(prefix+' privacy '+JSON.stringify(privacy),Object.values(privacy).every(Boolean))
   check(prefix+' flow4',await page.locator('.xr-rail a').count()===4)
   check(prefix+' selector retains step',(await page.locator('.xr-artifacts a').evaluateAll(els=>els.map(e=>e.getAttribute('href')))).every(h=>step?h.includes('step='+step):!h.includes('step=')))
   check(prefix+' no overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
   for(const img of await page.locator('.xr img:visible').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode()).catch(()=>{})}
   await page.evaluate(()=>scrollTo(0,0))
   check(prefix+' images loaded',await page.locator('.xr img:visible').evaluateAll(els=>els.every(i=>i.complete&&i.naturalWidth>0)))
   if(step==='articulo'){
    if(artifact==='ahorro-preferente'){
     const layout=await page.locator('.landing-hero').evaluate(el=>{
      const figure=el.querySelector('.landing-photo'),copy=el.querySelector('.landing-copy');
      const f=figure.getBoundingClientRect(),c=copy.getBoundingClientRect();
      return {position:getComputedStyle(figure).position,imageTop:f.top,copyTop:c.top,copyBottom:c.bottom}
     })
     check(prefix+' hero composition',name==='desktop'?layout.position==='absolute'&&layout.imageTop<=layout.copyTop+1:layout.position==='relative'&&layout.imageTop>=layout.copyBottom-1)
    }

    check(prefix+' full piece',await page.locator('.post').innerText().then(t=>t.split(/\s+/).length>(artifact==='guia-cuenta-online'?800:250)))
    if(artifact==='guia-cuenta-online')check(prefix+' toc',await page.locator('.toc a,.editorial-aside nav a').count()>=5)
   }
   if(step==='radiografia'){
    await page.mouse.move(1,1);await page.keyboard.press('Escape')
    check(prefix+' actual machine',await page.locator('.inst').innerText().then(t=>['Metadatos','Estructura','Datos estructurados'].every(s=>t.toLowerCase().includes(s.toLowerCase()))))
    check(prefix+' zeroJS selection',await page.locator('[data-couple][data-on]').count()>0)
    const probe=page.locator('[data-couple] [data-probe]').first();await probe.focus();await page.keyboard.press('Enter');
    check(prefix+' coupled selected',await probe.getAttribute('aria-expanded')==='true')
    if(name!=='desktop'){check(prefix+' sheet open',await page.locator('.inst').isVisible());await page.locator('[data-close-sheet]').click()}
    else{check(prefix+' filter concrete',await page.locator('.inst [data-hide]').count()>0);await page.keyboard.press('Escape');check(prefix+' map restored',await page.locator('.inst [data-hide]').count()===0)}
   }
   if(step==='atomizacion'){check(prefix+' all derivatives',await page.locator('.atom').count()>=3);check(prefix+' origin links',await page.locator('.atom-origin').count()===await page.locator('.atom').count())}
   await page.screenshot({path:`${out}/${name}-${artifact}-${step||'gap'}.png`})
  }
  check(name+' no JS errors',errors.length===0);await context.close()
 }
 const nojs=await browser.newContext({javaScriptEnabled:false});const p=await nojs.newPage();await p.goto(`${base}/aeo-xray/r/${token}?artifact=guia-cuenta-online&step=radiografia`);check('noJS instrument and selected source',await p.locator('.inst').count()===1&&await p.locator('[data-couple][data-on]').count()>0);await nojs.close()
 writeFileSync(out+'/verification.json',JSON.stringify({checks},null,2));console.log(`${checks.length} checks passed`)
}finally{await browser.close()}
