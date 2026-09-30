import assert from 'node:assert/strict'
import {mkdirSync,writeFileSync} from 'node:fs'
import {chromium} from 'playwright'
import sample from '../src/lib/aeo-xray/published/pichincha.json' with {type:'json'}
const base=process.env.XRAY_VERIFY_BASE??'http://127.0.0.1:4345',token=process.env.XRAY_VERIFY_TOKEN??sample.key,out='.captures/aeo-xray-media';mkdirSync(out,{recursive:true})
const checks=[],check=(name,value)=>{assert.ok(value,name);checks.push(name)}
const browser=await chromium.launch()
try{
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844],['compact',320,780]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message))
  const route=step=>`${base}/aeo-xray/r/${token}?artifact=guia-cuenta-online&step=${step}`
  await page.goto(route('articulo'),{waitUntil:'networkidle'})
  check(name+' disclaimer only in footer',!(await page.locator('.xr-chrome').innerText()).includes('Demostración')&&(await page.locator('.xr-foot').innerText()).includes('Demostración'))
  const logo=page.locator('.xr-client-brand img');await logo.evaluate(i=>i.decode());check(name+' official logo loads',await logo.evaluate(i=>i.complete&&i.naturalWidth>0))
  for(const id of ['art-banner-compare','art-banner-prepare']){const b=page.locator(`#block-${id}`);await b.scrollIntoViewIfNeeded();await b.locator('img').evaluate(i=>i.decode());check(name+' contextual banner '+id,await b.locator('img').evaluate(i=>{const r=i.getBoundingClientRect();return i.naturalWidth===1440&&Math.abs(r.width/r.height-i.naturalWidth/i.naturalHeight)<.01})&&!(await b.innerText()).includes('Foto: Efeonce'));await page.screenshot({path:`${out}/${name}-${id}.png`})}
  await page.goto(route('atomizacion'),{waitUntil:'networkidle'})
  check(name+' four linked graphics',await page.locator('.atom').count()===4&&await page.locator('.atom-origin').count()===4)
  for(let i=0;i<4;i++){
   const tab=page.locator('[data-format]').nth(i);await tab.click();const panel=page.locator('[data-format-panel]:visible')
   check(name+` format ${i} selected`,await panel.count()===1&&await tab.getAttribute('aria-selected')==='true')
   const img=panel.locator('.ss-artwork img');await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());check(name+` format ${i} loads artwork`,await img.evaluate(i=>i.naturalWidth===1080))
   check(name+` format ${i} no overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
   await panel.locator('[data-enlarge]').click();check(name+` format ${i} enlarges`,await page.locator('dialog[open] img').isVisible());await page.keyboard.press('Escape');check(name+` format ${i} closes`,await page.locator('dialog[open]').count()===0)
   const download=panel.locator('.ss-artwork-tools a[download]');check(name+` format ${i} download exists`,!!await download.getAttribute('href'))
   if(i===0){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${out}/${name}-showcase.png`})}
  }
  await page.locator('[data-format]').nth(1).click();await page.locator('[data-format-panel]:visible [data-media-choice="video"]').click()
  const video=page.locator('video');await video.scrollIntoViewIfNeeded();await video.evaluate(v=>new Promise((resolve,reject)=>{if(v.readyState>=1)resolve();else{v.addEventListener('loadedmetadata',resolve,{once:true});v.addEventListener('error',reject,{once:true})}}))
  check(name+' real ten second video',await video.evaluate(v=>v.videoWidth===720&&v.videoHeight===1280&&Math.abs(v.duration-10)<.2&&v.controls&&!v.autoplay&&!v.loop))
  await page.waitForFunction(()=>document.querySelector('video').currentTime>.25);check(name+' video selector starts playback from user action',await video.evaluate(v=>!v.paused));await video.evaluate(v=>v.pause());check(name+' visible play control when paused',await page.locator('[data-video-play]:visible').isVisible());await page.locator('[data-video-play]:visible').click();await page.waitForFunction(()=>!document.querySelector('video').paused);check(name+' large play control resumes video',await video.evaluate(v=>!v.paused));await page.screenshot({path:`${out}/${name}-video.png`});await page.locator('[data-format]').first().click();check(name+' switching format pauses video',await video.evaluate(v=>v.paused))
  await page.locator('[data-format]').first().focus();await page.keyboard.press('ArrowRight');check(name+' keyboard selects next format',await page.locator('[data-format]').nth(1).getAttribute('aria-selected')==='true')
  await page.locator('[data-format]').first().click();await page.locator('.atom-origin:visible').click();await page.waitForSelector('.split');check(name+' origin navigates to actual block',new URL(page.url()).hash==='#block-article-answer')
  check(name+' no browser errors',errors.length===0);await context.close()
 }
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await context.newPage();await page.goto(`${base}/aeo-xray/r/${token}?artifact=guia-cuenta-online&step=atomizacion`);check('no JS all four pieces visible',await page.locator('.atom:visible').count()===4);check('no JS video remains accessible',await page.locator('video').isVisible());await context.close();writeFileSync(out+'/verification.json',JSON.stringify({checks},null,2));console.log(`${checks.length} media checks passed`)
}finally{await browser.close()}
