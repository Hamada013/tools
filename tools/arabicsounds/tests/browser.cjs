const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(process.env.SOUNDS_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'../../..'),out=process.env.ASWATI_QA_DIR||'/private/tmp/arabicsounds-qa';fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp','.m4a':'audio/mp4'};let corrupt=false,port,requests=0;
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),f=path.resolve(root,'.'+decodeURIComponent(url.pathname)),isMedia=/\/(arabicsounds|auditory-rehabilitation)\/(sounds|images)\//.test(url.pathname);if(!f.startsWith(root+path.sep))return res.writeHead(403).end();const data=await fs.promises.readFile(f);if(isMedia){requests++;await new Promise(r=>setTimeout(r,8));if(corrupt){corrupt=false;return res.writeHead(200,{'Content-Type':mime[path.extname(f)]}).end('incorrect revision');}}res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store','Content-Length':data.length});res.end(data);}catch{res.writeHead(404).end();}});
const listen=()=>new Promise(r=>server.listen(port||0,'127.0.0.1',()=>{port=server.address().port;r();}));const stop=()=>new Promise(r=>{server.close(r);server.closeAllConnections();});
async function rpc(page,type,url){return page.evaluate(({type,url})=>new Promise(resolve=>{const ch=new MessageChannel();ch.port1.onmessage=e=>resolve(e.data);navigator.serviceWorker.controller.postMessage({type,url},[ch.port2]);}),{type,url});}
async function go(page,route){await page.evaluate(r=>{if(location.hash==='#/'+r)history.replaceState(null,'','#/home');location.hash='/'+r;},route);await page.waitForTimeout(70);}
async function screenshot(page,name){await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});}
async function mocked(context){await context.addInitScript(()=>{
 window.audioLog=[];window.audioStarts=[];window.audioEnds=[];window.pairEvents=[];window.countdownSteps=[];window.fastPairTimers=false;
 const nativeTimeout=window.setTimeout.bind(window);
 window.setTimeout=(fn,ms,...args)=>nativeTimeout(fn,window.fastPairTimers&&[1000,650].includes(ms)?25:ms,...args);
 class FakeAudio{constructor(){this.src='';this.timer=null;}pause(){clearTimeout(this.timer);}load(){}removeAttribute(){this.src='';}play(){window.audioLog.push(this.src);window.audioStarts.push(Date.now());this.onplaying?.();return new Promise(resolve=>{this.timer=setTimeout(()=>{window.audioEnds.push(Date.now());this.onended?.();resolve();},18);});}}
 window.Audio=FakeAudio;
 const nativeFetch=window.fetch.bind(window);
 window.fetch=async(...args)=>{const response=await nativeFetch(...args);if(/\/sounds\/\d+\.m4a$/.test(new URL(args[0],location.href).pathname)){const read=response.arrayBuffer.bind(response);response.arrayBuffer=async()=>{const bytes=await read();window.decodedPairURL=new URL(args[0],location.href).href;return bytes;};}return response;};
 class FakeContext{
  constructor(){this.state='running';this.destination={};}
  resume(){this.state='running';return Promise.resolve();}
  createBuffer(){return{silent:true};}
  decodeAudioData(){return window.failPairAudio?Promise.reject(Error('Missing recording')):Promise.resolve({duration:.018,url:window.decodedPairURL});}
  createBufferSource(){return{connect(){},disconnect(){},stop(){clearTimeout(this.timer);},start(){if(this.buffer.silent){queueMicrotask(()=>this.onended?.());return;}window.audioLog.push(this.buffer.url);window.audioStarts.push(Date.now());window.pairEvents.push([...document.querySelectorAll('#pair-cards button')].map(card=>({sound:card.dataset.sound,covered:card.classList.contains('pair-covered'),imageVisibility:getComputedStyle(card.querySelector('img')).visibility})));this.timer=setTimeout(()=>{window.audioEnds.push(Date.now());this.onended?.();},18);}};}
 }
 window.AudioContext=FakeContext;
 new MutationObserver(records=>{for(const record of records)if(record.target.id==='countdown-number')window.countdownSteps.push({number:record.target.textContent,color:getComputedStyle(record.target).color,time:Date.now()});}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-step']});
});}
async function pairChecks(p,engineName){
 await p.locator('#open-pair').click();
 for(const selector of ['#pair-practice','#pair-test']){assert.equal(await p.locator(selector).innerText(),'');assert.ok(await p.locator(selector).getAttribute('aria-label'));}
 await p.locator('#swap').click();const originalOrder=await p.locator('#pair-cards button').evaluateAll(cards=>cards.map(card=>card.dataset.sound));
 await screenshot(p,engineName+'-pair-workplace');
 const mapping=await p.evaluate(async()=>(await import('./assets/data.js')).LETTER_MAP);
 await p.locator('#pair-practice').click();await p.locator('#pair-countdown').waitFor({state:'visible'});
 assert.equal(await p.evaluate(()=>window.audioLog.length),0,'Countdown precedes sound');await screenshot(p,engineName+'-pair-countdown');
 await p.waitForFunction(()=>document.querySelectorAll('#pair-cards .pair-covered').length===1);await screenshot(p,engineName+'-practice-cover');
 assert.equal(await p.locator('#status,#pair-play,#pair-next,.pair-actions,.pair-tools').count(),0,'Automatic practice has no messages or session controls');
 await p.locator('#pair-practice').waitFor({state:'visible',timeout:35000});
 const practice=await p.evaluate(()=>({log:window.audioLog,starts:window.audioStarts,ends:window.audioEnds,covers:window.pairEvents,steps:window.countdownSteps}));
 assert.equal(practice.log.length,20,'Exactly twenty exposures and no target question');
 for(let i=0;i<20;i++){const active=i<10?0:1;assert.ok(practice.log[i].endsWith('/'+mapping[originalOrder[active]]+'.m4a'));assert.deepEqual(practice.covers[i].map(card=>card.covered),[active!==0,active!==1]);assert.equal(practice.covers[i][1-active].imageVisibility,'hidden');if(i)assert(practice.starts[i]-practice.ends[i-1]>=990,'One-second gaps follow completed audio');}
 assert.deepEqual(practice.steps.map(step=>step.number),['1','2','3']);assert.equal(new Set(practice.steps.map(step=>step.color)).size,3);assert(practice.starts[0]-practice.steps[0].time>=2900);
 assert.deepEqual(await p.locator('#pair-cards button').evaluateAll(cards=>cards.map(card=>card.dataset.sound)),originalOrder,'Practice restores the swapped workplace');
 await p.evaluate(()=>{window.fastPairTimers=true;window.audioLog=[];window.countdownSteps=[];});
 await runPairTest(p,mapping,9);
 await go(p,'arabic/levels');await p.locator('#level2 [data-pair]').first().click();await p.locator('#pair-practice').waitFor({state:'visible'});
 const levelOrder=await p.locator('#pair-cards button').evaluateAll(cards=>cards.map(card=>card.dataset.sound));assert.equal(await p.locator('.section-heading a').getAttribute('href'),'#/arabic/levels');
 await p.evaluate(()=>{window.audioLog=[];window.pairEvents=[];window.countdownSteps=[];});await p.locator('#pair-practice').click();
 await p.waitForFunction(()=>window.audioLog.length===20&&!!document.querySelector('#pair-practice'));
 assert.deepEqual((await p.evaluate(()=>window.audioLog)).map(url=>Number(url.match(/\/(\d+)\.m4a$/)[1])),[...Array(10).fill(mapping[levelOrder[0]]),...Array(10).fill(mapping[levelOrder[1]])]);
 assert.deepEqual(await p.locator('#pair-cards button').evaluateAll(cards=>cards.map(card=>card.dataset.sound)),levelOrder);
 await p.evaluate(()=>{window.audioLog=[];window.countdownSteps=[];});await runPairTest(p,mapping,10);
 // Leaving the countdown or an active exposure cancels every pending callback.
 await p.evaluate(()=>window.fastPairTimers=false);const before=await p.evaluate(()=>window.audioLog.length);await p.locator('#pair-practice').click();await p.locator('#pair-countdown').waitFor({state:'visible'});await go(p,'home');await p.waitForTimeout(1100);assert.equal(await p.evaluate(()=>window.audioLog.length),before);assert.equal(await p.locator('#pair-countdown').isVisible(),false);
 await go(p,'arabic/pair');await p.evaluate(()=>window.fastPairTimers=true);await p.locator('#pair-practice').click();await p.waitForFunction(n=>window.audioLog.length>n,before);await go(p,'home');const stopped=await p.evaluate(()=>window.audioLog.length);await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>window.audioLog.length),stopped);
 await go(p,'arabic/pair');await p.locator('#pair-practice').click();await p.waitForFunction(n=>window.audioLog.length>n,stopped);
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;});await p.locator('#pair-practice').waitFor();const hiddenCount=await p.evaluate(()=>window.audioLog.length);await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>window.audioLog.length),hiddenCount,'Backgrounding cancels practice');
 await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>window.fastPairTimers=false);await p.locator('#pair-test').click();await p.locator('#pair-countdown').waitFor({state:'visible'});assert.equal(await p.locator('#countdown-number').evaluate(number=>number.getAnimations().length),0);await p.keyboard.press('Escape');await p.locator('#pair-practice').waitFor();await p.emulateMedia({reducedMotion:'no-preference'});
 await p.evaluate(()=>{window.fastPairTimers=true;window.failPairAudio=true;});await p.locator('#pair-practice').click();await p.locator('#modal').waitFor({state:'visible'});assert(await p.locator('#pair-practice').isVisible());await p.keyboard.press('Escape');await p.evaluate(()=>window.failPairAudio=false);
 for(const size of [{width:320,height:568},{width:844,height:390},{width:1280,height:768}]){await p.setViewportSize(size);await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await p.locator('#pair-cards').evaluate(cards=>cards.getBoundingClientRect().bottom<=innerHeight));}await p.setViewportSize({width:390,height:844});
 console.log(engineName+': icon-only controls, countdown colors, exact covered 10+10 exposure order, automatic balanced tests, Levels parity, cancellation, reduced motion and error recovery passed');
}
async function runPairTest(p,mapping,score){
 await p.locator('#pair-test').click();
 for(let i=0;i<10;i++){
  await p.waitForFunction(()=>document.querySelector('main').dataset.pairMode==='test'&&!document.querySelector('#pair-countdown').open&&document.querySelectorAll('#pair-cards button:not(:disabled)').length===2);
  assert.equal(await p.locator('#status,#pair-play,#pair-next,#pair-cards .cue,#pair-cards .pair-covered').count(),0);
  const played=await p.evaluate(()=>window.audioLog.at(-1)),target=Object.keys(mapping).find(id=>played.endsWith('/'+mapping[id]+'.m4a'));
  const answer=i===0&&score===9?p.locator(`#pair-cards button:not([data-sound="${target}"])`):p.locator(`#pair-cards [data-sound="${target}"]`);
  await answer.click();
 }
 await p.locator('#modal').waitFor({state:'visible'});assert.equal(await p.locator('.result-metric').innerText(),score+' / 10');assert.equal(await p.locator('#pair-practice').isVisible(),true);
 const data=await p.evaluate(()=>({log:window.audioLog,steps:window.countdownSteps.map(step=>step.number)}));assert.equal(data.log.length,10);assert.equal(new Set(data.log).size,2);assert.equal(data.log.filter(url=>url===data.log[0]).length,5);assert.deepEqual(data.steps,['1','2','3']);await p.keyboard.press('Escape');
}
async function lingChecks(p,engineName){
 await go(p,'arabic');await p.locator('#ling').click();
 assert.equal(await p.locator('#ling-setup').evaluate(x=>x.open),true);
 assert.equal(await p.locator('#ling-setup input').count(),1);assert.equal(await p.locator('#ling-setup select').count(),0);
 await p.locator('#ling-name').fill('طفل تجريبي <علي>');await p.locator('#ling-detection').click();
 const sounds=['م','و','ا','ي','ش','س'];
 for(let i=0;i<6;i++){
  await p.waitForFunction(()=>document.querySelectorAll('.ling-response:not(:disabled)').length===3);
  assert.equal(await p.locator('.ling-detection-card .picture').count(),1);
  assert.equal(await p.locator('.ling-detection-card .picture').getAttribute('data-sound'),sounds[i]);
  if(i===0)await screenshot(p,engineName+'-ling-detection');
  assert.equal(await p.locator('#ling-report').isDisabled(),true);
  await p.locator(`[data-response="${i===0?'none':i===1?'no':'yes'}"]`).click();
  if(i<5)await p.locator('#ling-next').click();
 }
 await p.locator('#ling-previous').click();await p.waitForFunction(()=>!document.querySelector('.ling-response').disabled);
 assert.equal(await p.locator('[data-response="yes"]').getAttribute('aria-pressed'),'true');
 const before=await p.evaluate(()=>audioLog.length);await p.locator('#ling-play').click();await p.waitForFunction(n=>audioLog.length>n,before);
 await p.waitForFunction(()=>!document.querySelector('.ling-response').disabled);await p.locator('#ling-report').click();await p.locator('#ling-pdf').waitFor();
 assert.equal(await p.locator('tbody tr').count(),6);assert.match(await p.locator('.ling-result').innerText(),/طفل تجريبي <علي>/);assert.match(await p.locator('.ling-result').innerText(),/التاريخ:/);
 assert.equal(await p.locator('[data-result=correct] tbody tr').count(),4);assert.equal(await p.locator('[data-result=incorrect] tbody tr').count(),2);assert.deepEqual(await p.locator('[data-result=incorrect] tbody tr td:first-of-type').allTextContents(),['لا استجابة','لم يستجب']);assert.match(await p.locator('.ling-result > p bdi').innerText(),/^[0-9٠-٩\/\u200e\u200f]+$/);
 await p.locator('#ling-notes').fill('استجابة أفضل عند التركيز.\nيوصى بإعادة الملاحظة في الجلسة التالية.');
 let download=p.waitForEvent('download');await p.locator('#ling-pdf').click();await(await download).saveAs(path.join(out,engineName+'-ling-detection.pdf'));await screenshot(p,engineName+'-ling-detection-result');
 await go(p,'arabic');await p.locator('#ling').click();await p.locator('#ling-identification').click();await p.locator('#ling-levels').waitFor({state:'visible'});
 for(const [size,count] of [[2,15],[3,20],[4,15],[5,6],[6,1]]){
  await p.locator(`[data-level="${size}"]`).click();assert.equal(await p.locator('.ling-set').count(),count);
  const sets=await p.locator('.ling-set').evaluateAll(nodes=>nodes.map(n=>[...n.querySelectorAll('img')].map(img=>img.alt)));
  assert.equal(new Set(sets.map(set=>set.join(','))).size,count);assert(sets.every(set=>set.length===size));
 }
 await p.locator('[data-level="3"]').click();await p.locator('.ling-set').first().click();
 const mapping=await p.evaluate(async()=>(await import('./assets/data.js')).LETTER_MAP);
 // Retain visible feedback long enough to inspect it even when pair timers are accelerated.
 await p.evaluate(()=>window.fastPairTimers=false);
 for(let i=0;i<10;i++){
  await p.waitForFunction(()=>document.querySelectorAll('.ling-choices button:not(:disabled)').length===3);
  assert.equal(await p.locator('#ling-trial-number').innerText(),`${i+1} / 10`);
  assert.equal(await p.locator('.ling-choices .cue').count(),0,'Target is not visually cued');
  const played=await p.evaluate(()=>audioLog.at(-1)),target=Object.keys(mapping).find(id=>played.endsWith('/'+mapping[id]+'.m4a'));
  if(i===0){await screenshot(p,engineName+'-ling-identification');const n=await p.evaluate(()=>audioLog.length);await p.locator('#ling-play').click();await p.waitForFunction(n=>audioLog.length===n+1,n);await p.waitForFunction(()=>!document.querySelector('.ling-choices button').disabled);assert.equal(await p.evaluate(()=>audioLog.at(-1)),played);}
  await p.locator(i===0?`.ling-choices [data-sound]:not([data-sound="${target}"])`:`.ling-choices [data-sound="${target}"]`).first().click();
  await p.locator('#ling-feedback').waitFor();assert.equal(await p.locator('#ling-feedback').getAttribute('aria-label'),i===0?'إجابة غير صحيحة':'إجابة صحيحة');
 }
 await p.locator('#ling-pdf').waitFor();assert.equal(await p.locator('tbody tr').count(),10);assert.equal(await p.locator('[data-result=correct] tbody tr').count(),9);assert.equal(await p.locator('[data-result=incorrect] tbody tr').count(),1);assert.match(await p.locator('.ling-outcome').innerText(),/اجتاز.*90%/);assert.match(await p.locator('.ling-result').innerText(),/9 \/ 10/);
 await p.locator('#ling-notes').fill('الطفل يختار من ثلاث بطاقات.');download=p.waitForEvent('download');await p.locator('#ling-pdf').click();await(await download).saveAs(path.join(out,engineName+'-ling-identification.pdf'));
 await p.evaluate(()=>window.fastPairTimers=true);
 for(const scenario of [{sounds:['ش','س'],wrong:2,percent:80,pattern:'عالية',pass:true},{sounds:['م','و'],wrong:3,percent:70,pattern:'منخفضة',pass:false},{sounds:['ا','ي'],wrong:3,percent:70,pattern:'متوسطة',pass:false},{sounds:['م','س'],wrong:10,percent:0,pattern:'متعددة',pass:false}]){
  await go(p,'arabic');await p.locator('#ling').click();await p.locator('#ling-identification').click();await p.locator('#ling-levels').waitFor({state:'visible'});await p.getByRole('button',{name:scenario.sounds.join('، '),exact:true}).click();
  for(let trial=0;trial<10;trial++){
   await p.waitForFunction(()=>document.querySelectorAll('.ling-choices button:enabled').length===2);
   const played=await p.evaluate(()=>audioLog.at(-1)),target=Object.keys(mapping).find(id=>played.endsWith('/'+mapping[id]+'.m4a'));
   await p.locator(trial<scenario.wrong?`.ling-choices button:not([data-sound="${target}"])`:`.ling-choices [data-sound="${target}"]`).click();
  }
  await p.locator('#ling-pdf').waitFor();assert.equal(await p.locator('.ling-outcome.pass').count(),Number(scenario.pass));assert.match(await p.locator('.ling-outcome').innerText(),new RegExp(scenario.percent+'%'));assert((await p.locator('.ling-error-pattern').innerText()).includes(scenario.pattern));
  if(scenario.percent===0){assert.equal(await p.locator('.ling-empty').count(),1);await p.locator('#ling-notes').fill('ملاحظات الجلسة: تحتاج الأصوات المفحوصة إلى متابعة في التدريب. '.repeat(10).slice(0,600));download=p.waitForEvent('download');await p.locator('#ling-pdf').click();await(await download).saveAs(path.join(out,engineName+'-ling-multiple-long.pdf'));await screenshot(p,engineName+'-ling-frequency-summary');}
 }
 // A failed clip cannot create a false response; replay restores the same trial.
 await go(p,'arabic');await p.locator('#ling').click();await p.locator('#ling-identification').click();await p.locator('#ling-levels').waitFor({state:'visible'});await p.evaluate(()=>window.failPairAudio=true);await p.locator('.ling-set').first().click();await p.locator('#status:not([hidden])').waitFor();assert.equal(await p.locator('.ling-choices button:enabled').count(),0);await p.evaluate(()=>window.failPairAudio=false);await p.locator('#ling-play').click();await p.waitForFunction(()=>document.querySelectorAll('.ling-choices button:enabled').length===2);
 // Changing level cancels the old round and starts ten fresh trials with the chosen set.
 await p.locator('#ling-select-level').click();await p.locator('[data-level="6"]').click();await p.locator('.ling-set').click();await p.waitForFunction(()=>document.querySelectorAll('.ling-choices button:enabled').length===6);assert.equal(await p.locator('#ling-trial-number').innerText(),'1 / 10');
 for(const size of [{width:320,height:568},{width:844,height:390},{width:1280,height:768}]){await p.setViewportSize(size);await assertFits(p);}
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;});assert.equal(await p.locator('.ling-choices button:enabled').count(),0);await p.locator('#ling-play').click();await p.waitForFunction(()=>document.querySelectorAll('.ling-choices button:enabled').length===6);
 await go(p,'home');const stopped=await p.evaluate(()=>audioLog.length);await p.waitForTimeout(750);assert.equal(await p.evaluate(()=>audioLog.length),stopped);
 await p.setViewportSize({width:390,height:844});console.log(engineName+': Ling six detection cards, saved responses, every combination, ten identification trials, replay, feedback, cancellation, audio recovery and both PDFs passed');
}
async function assertFits(p){
 await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const layout=await p.evaluate(()=>{
  const root=document.scrollingElement,main=document.querySelector('main');
  const rects=[...main.querySelectorAll('.picture,.icon-button,.ling-response,.ling-trial')].filter(n=>n.getClientRects().length).map(n=>{const r=n.getBoundingClientRect();return{control:n.matches('button,a'),label:n.getAttribute('aria-label')||n.className,x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};});
  return {height:innerHeight,width:innerWidth,scrollY,documentHeight:root.scrollHeight,documentWidth:root.scrollWidth,mainHeight:main.clientHeight,mainContentHeight:main.scrollHeight,rects};
 });
 assert(layout.documentHeight<=layout.height+1,JSON.stringify(layout));assert(layout.documentWidth<=layout.width+1,JSON.stringify(layout));assert(layout.mainContentHeight<=layout.mainHeight+1,JSON.stringify(layout));assert.equal(layout.scrollY,0);
 for(const r of layout.rects){assert(r.x>=-1&&r.y>=-1&&r.right<=layout.width+1&&r.bottom<=layout.height+1,JSON.stringify({r,layout}));if(r.control)assert(r.width>=43&&r.height>=43,JSON.stringify(r));}
}
async function lingFitChecks(p,engineName){
 await go(p,'home');await p.locator('#ling').click();await p.locator('#ling-detection').click();await p.waitForFunction(()=>document.querySelectorAll('.ling-response:enabled').length===3);
 const viewports=[{width:320,height:480},{width:320,height:568},{width:390,height:844},{width:568,height:320},{width:844,height:390},{width:1280,height:768}];
 for(const viewport of viewports){await p.setViewportSize(viewport);await assertFits(p);await screenshot(p,engineName+'-ling-detection-fit-'+viewport.width+'x'+viewport.height);}
 await go(p,'home');await p.locator('#ling').click();await p.locator('#ling-identification').click();await p.locator('#ling-levels').waitFor({state:'visible'});await p.locator('.ling-set').first().click();
 for(const size of [2,3,4,5,6]){
  if(size!==2){await p.locator('#ling-select-level').click();await p.locator(`[data-level="${size}"]`).click();await p.locator('.ling-set').first().click();}
  await p.waitForFunction(size=>document.querySelectorAll('.ling-choices button:enabled').length===size,size);
  for(const viewport of viewports){await p.setViewportSize(viewport);await assertFits(p);await screenshot(p,engineName+'-ling-'+size+'-fit-'+viewport.width+'x'+viewport.height);}
 }
 await p.setViewportSize({width:390,height:844});await go(p,'home');console.log(engineName+': Ling detection and all 2-6-card levels fit portrait and short landscape screens without scroll or clipped controls');
}
async function matchingChecks(p,engineName){
 await p.evaluate(()=>window.fastPairTimers=false);
 await go(p,'arabic/matching');assert.equal(await p.locator('.target-card').innerText(),'');assert.equal(await p.locator('.match-options').innerText(),'');await p.locator('#match-cover-toggle').click();
 assert.equal(await p.locator('#match-cover').count(),0,'No shared overlay blocks the cards');
 assert.equal(await p.locator('.match-options .match-hidden').count(),3);
 const mapping=await p.evaluate(async()=>(await import('./assets/data.js')).LETTER_MAP);
 const target=await p.locator('.target-card').getAttribute('data-sound');
 const cards=await p.locator('.match-options button').evaluateAll(nodes=>nodes.map(n=>({sound:n.dataset.sound,label:n.getAttribute('aria-label'),image:getComputedStyle(n.querySelector('img')).visibility})));
 assert.equal(await p.locator('.target-card img').evaluate(img=>getComputedStyle(img).visibility),'visible');
 for(let i=0;i<cards.length;i++){
  assert.equal(cards[i].image,'hidden');assert.equal(cards[i].label,`استمع للبطاقة ${i+1}`);
  const before=await p.evaluate(()=>window.audioLog.length);await p.locator('.match-options button').nth(i).click();await p.waitForFunction(n=>audioLog.length===n+1,before);
  assert.ok((await p.evaluate(()=>audioLog.at(-1))).endsWith('/'+mapping[cards[i].sound]+'.m4a'));
 }
 await p.waitForTimeout(750);assert.equal(await p.locator('.matching-toolbar').innerText(),'');assert.equal(await p.locator('.target-card').getAttribute('data-sound'),target);assert.equal(await p.locator('.match-hidden').count(),3);
 await screenshot(p,engineName+'-matching-cover');
 async function dragTo(sound){const top=p.locator('.target-card'),option=p.locator(`.match-options [data-sound="${sound}"]`),a=await top.boundingBox(),b=await option.boundingBox();await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await p.mouse.up();}
 const wrong=cards.find(card=>card.sound!==target).sound;await dragTo(wrong);await p.locator('#match-feedback.incorrect').waitFor();assert.equal(await p.locator('#match-feedback').getAttribute('aria-label'),'إجابة غير صحيحة');assert.equal(await p.locator('#match-feedback svg').evaluate(node=>getComputedStyle(node).animationName),'ling-pop');await screenshot(p,engineName+'-matching-cross');await p.locator('#match-feedback').waitFor({state:'detached'});assert.equal(await p.locator('.matching-toolbar').innerText(),'');
 await dragTo(target);await p.locator('#match-feedback.correct').waitFor();await screenshot(p,engineName+'-matching-tick');await p.locator('#match-feedback').waitFor({state:'detached'});assert.equal(await p.locator('.match-options .matched').count(),0);assert.equal(await p.locator('#status').innerText(),'');assert.equal(await p.locator('.match-hidden').count(),3,'Hide state persists in the next round');
 await p.locator('#match-cover-toggle').click();assert.equal(await p.locator('.match-hidden').count(),0);assert.equal(await p.locator('.match-options img').first().evaluate(img=>getComputedStyle(img).visibility),'visible');
 const nextTarget=await p.locator('.target-card').getAttribute('data-sound');await p.locator(`.match-options [data-sound="${nextTarget}"]`).click();await p.waitForTimeout(780);assert.equal(await p.locator('.match-options .matched').count(),0);assert.equal(await p.locator('#status').innerText(),'');
 await p.locator('#match-settings').click();assert.equal(await p.locator('#match-pool button').count(),31);assert.equal(await p.locator('#match-pool img').count(),31);assert.equal((await p.locator('#match-pool').innerText()).trim(),'');assert.equal(await p.locator('#match-pool [aria-pressed=true]').count(),3);
 await p.locator('#match-pool [aria-pressed=true]').first().click();await p.locator('#pool-save').click();assert.match(await p.locator('#pool-warning').innerText(),/ثلاث/);assert.equal(await p.locator('#modal').evaluate(d=>d.open),true);
 const wanted=['م','و','ا','ش','س'];
 const choices=await p.locator('#match-pool button').evaluateAll(nodes=>nodes.map(n=>({sound:n.dataset.choice,on:n.getAttribute('aria-pressed')==='true'})));
 for(const card of choices)if(card.on!==wanted.includes(card.sound))await p.locator(`#match-pool [data-choice="${card.sound}"]`).click();
 assert.equal(await p.locator('#match-pool [aria-pressed=true]').count(),5);await screenshot(p,engineName+'-matching-catalog');await p.locator('#pool-save').click();
 for(let round=0;round<5;round++){const sounds=await p.locator('.match-options button').evaluateAll(nodes=>nodes.map(n=>n.dataset.sound));assert.equal(sounds.length,3);assert.equal(new Set(sounds).size,3);assert(sounds.every(sound=>wanted.includes(sound)));assert(wanted.includes(await p.locator('.target-card').getAttribute('data-sound')));await p.locator('#match-next').click();}
 await p.locator('#match-settings').click();assert.deepEqual((await p.locator('#match-pool [aria-pressed=true]').evaluateAll(nodes=>nodes.map(n=>n.dataset.choice))).sort(),wanted.sort());await p.locator('#match-pool [aria-pressed=true]').first().click();await p.keyboard.press('Escape');await p.locator('#match-settings').click();assert.equal(await p.locator('#match-pool [aria-pressed=true]').count(),5,'Cancel preserves the applied selection');await p.keyboard.press('Escape');
 for(const size of [{width:320,height:568},{width:844,height:390},{width:1280,height:768}]){await p.setViewportSize(size);await assertFits(p);await screenshot(p,engineName+'-matching-fit-'+size.width);assert(await p.locator('.target-card,.match-options .picture').evaluateAll(cards=>cards.every(card=>{const r=card.getBoundingClientRect();return Math.abs(r.width-r.height)<1;})));await p.locator('#match-settings').click();assert(await p.evaluate(()=>document.querySelector('#modal').scrollWidth<=document.querySelector('#modal').clientWidth));await p.keyboard.press('Escape');}
 await p.setViewportSize({width:390,height:844});await p.emulateMedia({reducedMotion:'reduce'});
 const activeTarget=await p.locator('.target-card').getAttribute('data-sound');await p.locator(`.match-options button:not([data-sound="${activeTarget}"])`).first().click();await p.locator('#match-feedback.incorrect').waitFor();assert.equal(await p.locator('#match-feedback svg').evaluate(node=>node.getAnimations().length),0);await go(p,'home');await p.waitForTimeout(700);assert.equal(await p.locator('#match-feedback').count(),0);await go(p,'arabic/matching');assert.equal(await p.locator('.matching-layout button:disabled').count(),0);await p.emulateMedia({reducedMotion:'no-preference'});
 console.log(engineName+': three independent covers, hidden-card audio without scoring/reveal, covered drag matching, normal matching, image-only catalog, selection validation/persistence and responsive layouts passed');
}
async function memoryChecks(p,engineName){
 for(const size of [4,6,8,12]){
  await go(p,'arabic/memory');await p.locator(`[data-size="${size}"]`).click();assert.equal(await p.locator('.memory-grid .picture').count(),size);assert.equal(await p.locator('#memory-count').count(),0);assert.equal(await p.locator('.memory-grid .picture span').count(),0);
  const groups=await p.locator('.memory-grid [data-sound]').evaluateAll(nodes=>{const groups={};nodes.forEach(n=>(groups[n.dataset.sound]??=[]).push(n.dataset.index));return Object.values(groups);});
  for(const pair of groups){assert.equal(pair.length,2);for(const index of pair)await p.locator(`[data-index="${index}"]`).click();}assert.match(await p.locator('#status').innerText(),/بطاقات جديدة/);
 }
 for(const viewport of [{width:320,height:568},{width:844,height:390},{width:1280,height:768},{width:2050,height:1122}]){
  await p.setViewportSize(viewport);await go(p,'arabic/memory');await p.locator('[data-size="6"]').click();
  const layout=()=>p.locator('.memory-grid .picture').evaluateAll(cards=>cards.map(card=>{const r=card.getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height};}));
  await assertFits(p);const before=await layout(),rows=new Map();for(const r of before){assert(Math.abs(r.width-r.height)<1);const y=Math.round(r.y);rows.set(y,(rows.get(y)||0)+1);}assert.deepEqual([...rows.values()],[3,3],'Six cards always form two rows of three');
  await screenshot(p,engineName+'-memory-six-'+viewport.width);await p.locator('.memory-grid .picture').first().click();assert.deepEqual(await layout(),before,'Revealing a card preserves every square and its position');assert.equal(await p.locator('.memory-grid .picture').first().innerText(),'');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 for(const viewport of [{width:320,height:480},{width:320,height:568},{width:390,height:844},{width:568,height:320},{width:844,height:390},{width:1280,height:768}]){await p.setViewportSize(viewport);await go(p,'arabic/memory');await p.locator('[data-size="12"]').click();await assertFits(p);await screenshot(p,engineName+'-memory-twelve-fit-'+viewport.width+'x'+viewport.height);await p.locator('.memory-grid .picture').last().click();await assertFits(p);}
 await p.setViewportSize({width:390,height:844});console.log(engineName+': title-free memory cards, no counter, all board sizes playable, six-card 3-by-2 layout at phone/landscape/desktop sizes and stable revealed-card squares passed');
}
async function behavior(browser,engineName,base){const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});await mocked(ctx);const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'#/arabic/sounds');if(process.env.SOUNDS_LING_ONLY){await lingChecks(p,engineName);await lingFitChecks(p,engineName);assert.deepEqual(errors,[]);await ctx.close();return;}if(process.env.SOUNDS_LAYOUT_ONLY){await matchingChecks(p,engineName);await memoryChecks(p,engineName);await lingFitChecks(p,engineName);assert.deepEqual(errors,[]);await ctx.close();return;}if(process.env.SOUNDS_MATCHING_ONLY){await matchingChecks(p,engineName);await memoryChecks(p,engineName);assert.deepEqual(errors,[]);await ctx.close();return;}await pairChecks(p,engineName);
 await matchingChecks(p,engineName);
 await memoryChecks(p,engineName);
 await lingChecks(p,engineName);await lingFitChecks(p,engineName);
 // Auditory assessment, duration and identification workflows are covered in auditory.cjs.
 assert.deepEqual(errors,[]);await ctx.close();console.log(engineName+': practice, tests, all games, Ling PDF, drawer passed');}
(async()=>{await listen();const base=`http://127.0.0.1:${port}/tools/arabicsounds/index.html`;try{for(const name of process.env.SOUNDS_ENGINE?[process.env.SOUNDS_ENGINE]:['chromium']){const browser=await(name==='chromium'?chromium:webkit).launch({headless:true,...(name==='chromium'?{channel:'chrome'}:{})});try{await behavior(browser,name,base);}finally{await browser.close();}}}finally{await stop();}})().catch(e=>{console.error(e);process.exitCode=1;});
