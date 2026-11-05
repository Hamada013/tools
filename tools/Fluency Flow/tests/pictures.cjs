const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm');
const {chromium,webkit}=require(process.env.FLUENCY_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'../../..'),app=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(app,'assets/app.js'),'utf8');
const banks=[...source.matchAll(/letterWords: (\{[\s\S]*?\n        \}),/g)].map(m=>vm.runInNewContext('('+m[1]+')'));
assert.equal(banks.length,2);
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
const click=(page,name)=>page.getByRole('button',{name,exact:true}).click();
async function run(engine,name){
 const browser=await engine.launch(name==='chromium'?{channel:'chrome'}:{});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(8000);
  await page.goto(`http://127.0.0.1:${server.address().port}/resources/Fluency%20Flow/index.html?from=bookmark#practice`);
  await page.waitForURL('**/tools/Fluency%20Flow/index.html?from=bookmark#practice');
  await page.locator('[data-screen=home]').waitFor();
  const coverage=await page.evaluate(async banks=>{const {pictureItems}=await import('./assets/pictures.js');return banks.flatMap(bank=>Object.entries(bank).map(([letter,words])=>({letter,count:pictureItems(words).length,allNamed:pictureItems(words).every(i=>i.text&&i.icon)})));},banks);
  assert.equal(coverage.length,54);assert.deepEqual(coverage.filter(i=>!i.count||!i.allNamed),[],'Every Arabic/English letter needs concrete picture cues');
  const grouped=await page.evaluate(async banks=>{const {pictureItems}=await import('./assets/pictures.js');const {lettersForScreen,practiceItems}=await import('./assets/practice.js');return banks.flatMap(bank=>['easy-onset-practice','light-contact-practice'].flatMap(screen=>lettersForScreen(screen,bank).map(letter=>{const words=practiceItems({letterWords:bank},'practice',letter,screen).map(i=>i.text);return {screen,letter,words:words.length,pictures:pictureItems(words).length};})));},banks);
  assert.equal(grouped.length,54,'Every letter belongs to one exercise');assert.deepEqual(grouped.filter(i=>!i.words||!i.pictures),[],'Every grouped letter needs words and pictures');
  for(const ar of [true,false]){
   if(!ar)await click(page,'Switch to English');
   await click(page,ar?'تشكيل الطلاقة':'Fluency Shaping');await click(page,ar?'بدايات سهلة':'Easy Onsets');
   assert.equal(await page.locator('.ff-picture-switch').count(),0,'Switch only appears after choosing a letter');
   await click(page,ar?'التدريب':'Practice');await click(page,ar?'أ':'A');
   const toggle=page.locator('.ff-picture-switch');
   assert.equal(await toggle.getAttribute('aria-pressed'),'false');
   assert.match(await page.locator('.ff-practice-card').textContent(),ar?/أرنب/:/apple/);
   await click(page,ar?'تشغيل':'Play');await page.waitForTimeout(100);await toggle.click();
   assert.equal(await page.locator('[data-playing]').getAttribute('data-playing'),'false','Changing cues stops the guide');
   assert.equal(await toggle.getAttribute('aria-pressed'),'true');
   assert.ok(await page.locator('[data-picture-word] svg').count());
   assert.deepEqual(await page.locator('[data-picture-word]').allTextContents(),Array(await page.locator('[data-picture-word]').count()).fill(''),'No printed word in picture mode');
   for(const [width,height] of [[320,568],[390,844],[768,1024],[1024,768],[844,390]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(70);
    const issues=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,button:[...document.querySelectorAll('.ff-picture-switch')].some(e=>{const r=e.getBoundingClientRect();return r.width<44||r.height<44||r.left<0||r.right>innerWidth+1;})}));assert.deepEqual(issues,{overflow:false,button:false},`${name} ${ar?'Arabic':'English'} ${width}`);
    if(width===390)await page.screenshot({path:`/private/tmp/fluency-picture-${name}-${ar?'ar':'en'}.png`,fullPage:true});
   }
   await page.setViewportSize({width:390,height:844});
   if(ar){await click(page,'التالي');assert.ok(await page.locator('[data-picture-word]').count());}
   await toggle.focus();await page.keyboard.press('Space');assert.equal(await toggle.getAttribute('aria-pressed'),'false');assert.match(await page.locator('.ff-practice-card').textContent(),ar?/أرنب/:/apple/);
   await click(page,ar?'رجوع':'Back');await click(page,ar?'رجوع':'Back');
  }
  const retired = await page.evaluate(async () => {
   const scope=new URL('/resources/Fluency%20Flow/',location.origin).href;
   const oldCache=`fluency-flow:${scope}:shell:old`;
   await caches.open(oldCache);await caches.open('unrelated-cache');
   const registration=await navigator.serviceWorker.register(scope+'sw.js');
   const worker=registration.installing||registration.waiting||registration.active;
   if(worker.state!=='activated')await new Promise((resolve,reject)=>{worker.addEventListener('statechange',()=>{if(worker.state==='activated'||worker.state==='redundant')resolve();});});
   return {oldCacheLeft:(await caches.keys()).includes(oldCache),otherCacheLeft:(await caches.keys()).includes('unrelated-cache'),oldWorkerLeft:(await navigator.serviceWorker.getRegistrations()).some(r=>r.scope===scope)};
  });
  assert.deepEqual(retired,{oldCacheLeft:false,otherCacheLeft:true,oldWorkerLeft:false});
  assert.deepEqual(errors,[]);await context.close();console.log(`PASS ${name}: tools relocation/bookmark redirect, 54 letter picture banks, Arabic/English icon switch, keyboard, timer reset, pagination and five phone/iPad sizes`);
 }finally{await browser.close();}
}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));try{await run(chromium,'chromium');if(!process.env.FLUENCY_SKIP_WEBKIT)await run(webkit,'webkit');}finally{server.close();server.closeAllConnections();}})().catch(e=>{console.error(e);process.exitCode=1;});
