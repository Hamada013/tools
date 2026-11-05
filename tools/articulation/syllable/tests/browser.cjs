const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(process.env.ARTICULATION_PLAYWRIGHT||'playwright');
const repo=path.resolve(__dirname,'../../../..');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.json':'application/json'};
const server=http.createServer(async(req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(repo,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));if(!file.startsWith(repo+path.sep)){res.writeHead(403).end();return;}try{const data=await fs.promises.readFile(file);const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');if(range){const start=Number(range[1]),end=Math.min(data.length-1,range[2]?Number(range[2]):data.length-1);if(start>=data.length||end<start){res.writeHead(416,{'Content-Range':`bytes */${data.length}`}).end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1}).end(data.subarray(start,end+1));}else res.writeHead(200,{...headers,'Content-Length':data.length}).end(data);}catch{res.writeHead(404).end();}});
const visible=(page,selector)=>page.locator(selector).waitFor({state:'visible'});
async function fit(page,label){
 const issues=await page.evaluate(()=>{
  const errors=[];if(document.documentElement.scrollWidth>innerWidth+1)errors.push('horizontal page overflow');
  for(const element of document.querySelectorAll('#activity-view .syllable-card, #activity-view .grade, #activity-view .drop-target, #pause-button, #listening-cue, #activity-view #previous-page, #activity-view #next-page')){
   if(!element.getClientRects().length)continue;const r=element.getBoundingClientRect();if(r.left<-.5||r.right>innerWidth+.5||r.top<-.5||r.bottom>innerHeight+.5)errors.push(element.className+' outside viewport '+JSON.stringify({x:r.x,y:r.y,w:r.width,h:r.height}));
   if(element.tagName==='BUTTON'&&(r.width<43||r.height<43))errors.push(element.className+' small touch target');
  }
  return errors;
 });assert.deepEqual(issues,[],label);
}
async function setup(page,kind,mode='cv'){
 await page.locator('#home-button').click();await visible(page,'#home-view');
 if(kind==='matching'){await page.goto(new URL('matching.html',page.url()).href);}else await page.locator(`[data-open="${kind}"]`).click();
 await visible(page,'#setup-dialog');
 await page.locator(`#setup-modes button[data-value="${mode}"]`).click();
 await page.locator('#start-button').click();await visible(page,'#activity-view');
}
async function stored(page){return page.evaluate(()=>JSON.parse(localStorage.getItem('articulation-syllable-results-v1')).sessions);}
async function listeningReady(page){
 await page.waitForFunction(()=>[...document.querySelectorAll('#choice-grid button')].length===3&&[...document.querySelectorAll('#choice-grid button')].every(button=>!button.disabled),null,{timeout:20000});
}
async function run(engine,name,origin){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{channel:'chrome'}:{})});
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true}),page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('request',req=>{if(!req.url().startsWith(origin)&&!req.url().startsWith('data:'))external.push(req.url());});
 try{
  await page.goto(origin+'/tools/articulation/syllable/syllable.html');await visible(page,'#home-view');
  assert.equal(await page.locator('.activity-card').count(),4);
  assert.equal(await page.locator('meta[name=viewport]').getAttribute('content'),'width=device-width,initial-scale=1,viewport-fit=cover');
  const viewports=[[320,568],[390,844],[568,320],[667,375],[844,390],[768,1024],[1024,768],[820,1180],[1180,820]];
  await setup(page,'practice','vcv');
  for(const [width,height]of viewports){await page.setViewportSize({width,height});await page.waitForTimeout(180);await fit(page,`${name} practice ${width}x${height}`);}
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(180);
  assert.equal(await page.locator('#practice-grid button').count(),3);
  await page.locator('#practice-grid button').first().click();await page.waitForFunction(()=>document.querySelector('#syllable-audio').currentTime>0);
  await page.locator('#next-page').click();assert.match(await page.locator('#page-count').textContent(),/2 \/ 3/);
  await page.locator('#vowel-filters [data-value="28"]').click();assert.match(await page.locator('#page-count').textContent(),/1 \/ 1/);
  await page.locator('#settings-button').click();await page.locator('[data-letter="3"]').click();await page.locator('[data-letter="12"]').click();assert.equal(await page.locator('[data-letter="4"]').isDisabled(),true);await page.locator('#start-button').click();
  assert.equal(await page.locator('#practice-grid button').count(),3);assert.match(await page.locator('#page-count').textContent(),/1 \/ 9/);
  await page.locator('#rewards-button').click();await visible(page,'#rewards-dialog');await page.locator('#reward-target').click();assert.equal(await page.locator('.reward-star').count(),10);await page.locator('.reward-star').first().click();assert.equal(await page.locator('.reward-star').first().getAttribute('aria-pressed'),'true');await page.locator('#rewards-dialog [data-close]').click();
  // Listening: one consonant must still have three real alternatives.
  await page.locator('#home-button').click();await page.locator('[data-open=listening]').click();await visible(page,'#setup-dialog');
  for(const id of ['3','12'])await page.locator(`[data-letter="${id}"]`).click();await page.locator('#setup-modes [data-value=cv]').click();await page.locator('#start-button').click();await listeningReady(page);
  for(const [width,height]of viewports){await page.setViewportSize({width,height});await fit(page,`${name} listening ${width}x${height}`);}
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:`/private/tmp/artic-syllable-${name}-listening.png`,fullPage:true});
  let draft=(await stored(page)).find(s=>s.kind==='listening');assert.equal(draft.plan.length,3);assert.equal(draft.plan[0].choices.length,3);
  assert.equal(await page.locator('#replay-button').count(),0);
  await page.locator('#listening-cue').focus();await page.keyboard.press('Enter');await listeningReady(page);
  assert.equal((await stored(page)).find(s=>s.kind==='listening').records.length,0,'Listening card playback never records an answer');
  assert.equal(await page.locator('.syllable-part>span').count(),0,'No duplicated printed letter captions');
  const wrong=draft.plan[0].choices.find(id=>id!==draft.plan[0].id);
  await page.locator(`#choice-grid [data-item="${wrong}"]`).dblclick({delay:30});
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('articulation-syllable-results-v1')).sessions.find(s=>s.kind==='listening').records.length===1);
  draft=(await stored(page)).find(s=>s.kind==='listening');assert.equal(draft.records[0].outcome,'incorrect');
  await page.locator('#pause-button').click();await visible(page,'#paused-view');await page.reload();await visible(page,'#resume-button');await page.locator('#resume-button').click();await listeningReady(page);
  draft=(await stored(page)).find(s=>s.kind==='listening');
  await page.locator(`#choice-grid [data-item="${draft.plan[1].id}"]`).click();await page.waitForTimeout(520);await listeningReady(page);await page.locator('#skip-button').click();await visible(page,'#results-view');
  assert.match(await page.locator('#result-content').textContent(),/50%/);draft=(await stored(page)).find(s=>s.kind==='listening');assert.equal(draft.records.length,3);assert.equal(draft.status,'complete');
  // Production starts silently; cues survive pause/reload and never score automatically.
  await setup(page,'production','cv');await page.waitForFunction(()=>!document.querySelector('[data-grade="100"]').disabled);
  assert.equal(await page.locator('#syllable-audio').evaluate(audio=>audio.paused),true);assert.deepEqual((await stored(page)).find(s=>s.kind==='production').cues,{});
  for(const [width,height]of viewports){await page.setViewportSize({width,height});await fit(page,`${name} production ${width}x${height}`);}
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:`/private/tmp/artic-syllable-${name}-production.png`,fullPage:true});await page.locator('[data-grade="0"]').click();await page.waitForTimeout(520);await page.waitForFunction(()=>!document.querySelector('[data-grade="100"]').disabled);
  await page.locator('#production-stage button').click();await page.waitForFunction(()=>document.querySelector('#syllable-audio').currentTime>0);
  await page.locator('#pause-button').click();await visible(page,'#paused-view');await page.reload();await visible(page,'#resume-button');await page.locator('#resume-button').click();await page.waitForFunction(()=>!document.querySelector('[data-grade="40"]').disabled);
  assert.match(await page.locator('#audio-status').textContent(),/سبق تشغيل/);await page.locator('[data-grade="40"]').click();await page.waitForTimeout(520);await page.waitForFunction(()=>!document.querySelector('[data-grade="100"]').disabled);await page.locator('[data-grade="100"]').click();await visible(page,'#results-view');
  let production=(await stored(page)).find(s=>s.kind==='production');assert.deepEqual(production.records.map(r=>r.outcome),['incorrect','emerging','correct']);assert.deepEqual(production.records.map(r=>r.score),[0,40,100]);assert.deepEqual(production.records.map(r=>r.modeled),[false,true,false]);assert.match(await page.locator('#result-content').textContent(),/47%/);
  await page.screenshot({path:`/private/tmp/artic-syllable-${name}-report.png`,fullPage:true});
  await setup(page,'production','vcv');
  assert.deepEqual(await page.locator('#production-grades button').allTextContents(),['0%','20%','40%','60%','80%','100%']);
  for(const score of [0,20,40,60,80,100]){await page.waitForFunction(()=>!document.querySelector('[data-grade="100"]').disabled);await page.locator(`[data-grade="${score}"]`).click();await page.waitForTimeout(520);}
  for(let i=0;i<3;i++){await page.locator('#skip-button').click();await page.waitForTimeout(520);}
  await visible(page,'#results-view');
  const percentages=(await stored(page)).filter(s=>s.kind==='production').find(s=>s.mode==='vcv');
  assert.deepEqual(percentages.records.slice(0,6).map(r=>r.score),[0,20,40,60,80,100]);assert.match(await page.locator('#result-content').textContent(),/50%/);
  // Tap/keyboard matching and pointer dragging; matched targets cannot score twice.
  await setup(page,'matching','vcv');
  assert.equal(await page.locator('#matching-targets .icon').count(),0);
  await page.locator('.drop-target').first().click();await page.waitForFunction(()=>document.querySelector('#syllable-audio').currentTime>0);
  assert.match(await page.locator('#matching-count').textContent(),/0 \/ 3/,'Listening to a covered card never matches it');
  for(const [width,height]of viewports){await page.setViewportSize({width,height});await fit(page,`${name} matching ${width}x${height}`);}
  await page.setViewportSize({width:390,height:844});
  let id=await page.locator('.matching-source').first().getAttribute('data-item');await page.locator(`.matching-source[data-item="${id}"]`).click();await page.locator(`.drop-target[data-target="${id}"]`).click();assert.match(await page.locator('#matching-count').textContent(),/1 \/ 3/);assert.equal(await page.locator(`.drop-target[data-target="${id}"]`).isDisabled(),false);await page.locator(`.drop-target[data-target="${id}"]`).click();assert.match(await page.locator('#matching-count').textContent(),/1 \/ 3/);
  id=await page.locator('.matching-source:not(.matched)').first().getAttribute('data-item');const source=page.locator(`.matching-source[data-item="${id}"]`),target=page.locator(`.drop-target[data-target="${id}"]`),a=await source.boundingBox(),b=await target.boundingBox();
  await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:12});await page.mouse.up();assert.match(await page.locator('#matching-count').textContent(),/2 \/ 3/);
  id=await page.locator('.matching-source:not(.matched)').first().getAttribute('data-item');await page.locator(`.matching-source[data-item="${id}"]`).focus();await page.keyboard.press('Enter');await page.locator(`.drop-target[data-target="${id}"]`).focus();await page.keyboard.press('Enter');assert.match(await page.locator('#matching-count').textContent(),/3 \/ 3/);
  await page.locator('#restart-button').click();
  id=await page.locator('.matching-source').first().getAttribute('data-item');
  if(name==='chromium'){
   const sourceBox=await page.locator(`.matching-source[data-item="${id}"]`).boundingBox(),targetBox=await page.locator(`.drop-target[data-target="${id}"]`).boundingBox(),cdp=await context.newCDPSession(page);
   const from={x:sourceBox.x+sourceBox.width/2,y:sourceBox.y+sourceBox.height/2},to={x:targetBox.x+targetBox.width/2,y:targetBox.y+targetBox.height/2};
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...from,id:1}]});
   for(let step=1;step<=10;step++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*step/10,y:from.y+(to.y-from.y)*step/10,id:1}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
  }else{await page.locator(`.matching-source[data-item="${id}"]`).tap();await page.locator(`.drop-target[data-target="${id}"]`).tap();}
  assert.match(await page.locator('#matching-count').textContent(),/1 \/ 3/,'Touch matching');
  await page.screenshot({path:`/private/tmp/artic-syllable-${name}-matching.png`,fullPage:true});
  // A storage failure leaves the trial unrecorded and available for retry.
  await setup(page,'production','cv');await page.waitForFunction(()=>!document.querySelector('[data-grade="100"]').disabled);
  await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('QA quota','QuotaExceededError');};});
  await page.locator('[data-grade="100"]').click();await visible(page,'#error');
  assert.equal((await stored(page)).at(-1).records.length,0);
  await page.evaluate(()=>{Storage.prototype.setItem=window.originalSetItem;});
  await page.locator('[data-grade="100"]').click();await page.waitForTimeout(520);
  assert.equal((await stored(page)).at(-1).records.length,1);assert.equal(await page.locator('#error').isVisible(),false);
  await page.locator('#pause-button').click();await visible(page,'#paused-view');await page.locator('#finish-button').click();await visible(page,'#results-view');assert.match(await page.locator('#result-content').textContent(),/جزئي/);
  // No listening score is possible when sound fails; replay recovers the same item.
  await page.route('**/sounds/**',route=>route.abort());await setup(page,'listening','cv');
  await page.waitForFunction(()=>document.querySelector('#audio-status').textContent.length>0);
  assert.equal(await page.locator('#choice-grid button').first().isDisabled(),true);assert.equal(await page.locator('#skip-button').isDisabled(),false);
  assert.equal((await stored(page)).at(-1).records.length,0);
  await page.unroute('**/sounds/**');await page.locator('#listening-cue').click();await listeningReady(page);
  assert.equal((await stored(page)).at(-1).records.length,0);
  await page.locator('#pause-button').click();await visible(page,'#paused-view');await page.locator('#finish-button').click();await visible(page,'#results-view');
  await page.locator('#home-button').click();await visible(page,'#home-view');await page.screenshot({path:`/private/tmp/artic-syllable-${name}-home-phone.png`,fullPage:true});
  await page.setViewportSize({width:820,height:1180});await page.screenshot({path:`/private/tmp/artic-syllable-${name}-home-ipad.png`,fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log(`PASS ${name}: 9 phone/iPad/landscape sizes; practice, multi-letter/vowel filters, real WAVs, finite listening, production cue persistence/grades, reload/resume, local reports, mouse/touch/keyboard matching, storage failure retry, audio recovery, no external requests.`);
 }catch(error){console.error(name,'audio:',await page.evaluate(()=>{const a=document.querySelector('#syllable-audio');return {src:a?.currentSrc,time:a?.currentTime,paused:a?.paused,error:a?.error?.message,code:a?.error?.code,status:document.querySelector('#audio-status')?.textContent};}));await page.screenshot({path:`/private/tmp/artic-syllable-${name}-failure.png`,fullPage:true}).catch(()=>{});throw error;}finally{await context.close();await browser.close();}
}
(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));try{const origin=`http://127.0.0.1:${server.address().port}`;if(process.env.ARTICULATION_ENGINE!=='webkit')await run(chromium,'chromium',origin);if(process.env.ARTICULATION_ENGINE!=='chromium')await run(webkit,'webkit',origin);}finally{server.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
