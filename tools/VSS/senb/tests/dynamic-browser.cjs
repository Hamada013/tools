const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(process.env.SENB_PLAYWRIGHT||path.resolve(__dirname,'../../voc/node_modules/playwright'));
const root=path.resolve(__dirname,'../../../..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.m4a':'audio/mp4','.json':'application/json'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(error,bytes)=>{if(error){res.writeHead(404).end();return;}if(file.endsWith('/index.html'))bytes=Buffer.from(bytes.toString().replace(/<link[^>]+(?:googleapis|gstatic)[^>]*>/g,''));res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(bytes);});});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const engine=process.env.SENB_ENGINE==='webkit'?webkit:chromium;
 const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});await context.route('https://**',route=>route.abort());
  await context.addInitScript(()=>{
   if(!localStorage.getItem('voc-children-v1'))localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'dynamic',children:[{id:'dynamic',name:'نور',words:{},sessions:[]}]}));
   window.events=[];HTMLMediaElement.prototype.play=function(){if(window.denyAudio){window.denyAudio=false;return Promise.reject(new DOMException('Gesture','NotAllowedError'));}events.push({kind:'audio',src:this.src});clearTimeout(this.qaTimer);this.qaTimer=setTimeout(()=>this.dispatchEvent(new Event('ended')),30);return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){clearTimeout(this.qaTimer);};
   document.addEventListener('DOMContentLoaded',()=>new MutationObserver(changes=>{for(const change of changes)for(const node of change.addedNodes)if(node.nodeType===1){if(node.matches('.session-finger'))events.push({kind:'hand'});const count=node.matches('.session-count')?node:node.querySelector('.session-count');if(count)events.push({kind:'count',value:count.textContent});}}).observe(document.body,{childList:true,subtree:true}));
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(20000);
  await page.goto(`http://127.0.0.1:${server.address().port}/tools/VSS/senb/index.html`,{waitUntil:'domcontentloaded'});
  const seed=async(id,words=2,deny=false)=>{
   await page.evaluate(({id,words,deny})=>{
    navigateTo('workplace');loadAdvancedSentence(getAdvancedItemData(String(words),1,1));renderWorkplace();const s=getWorkplaceSentence();
    SenbProgress.saveDraft({id:`qa-${id}-${words}-${Date.now()}`,phase:'automation',worked:[s],sessionIds:[],logIndex:0,stageIndex:SenbSessionModel.stages([s]).findIndex(stage=>stage.id===id),stagePosition:0,repeatIndex:0,stageRecords:[],startedAt:new Date().toISOString()});
    window.events=[];window.denyAudio=deny;SenbSession.resume();
   },{id,words,deny});await page.locator('#sessionContinue').click();
  };
  const ready=()=>page.waitForFunction(()=>SenbSession.state().trialPhase==='test'&&document.querySelector('#sessionBoard button:not(:disabled)')&&!document.querySelector('#sessionReplay').disabled);
  const counts=async()=>assert.deepEqual(await page.evaluate(()=>events.filter(e=>e.kind==='count').map(e=>e.value)),['1','2','3']);
  const correctMissing=()=>page.evaluate(()=>{const r=SenbSession.state();return r.missing.choices.findIndex(slot=>SenbSessionModel.wordKey(slot)===r.missing.wanted);});
  const drag=async index=>{const from=await page.locator(`[data-missing-choice="${index}"]`).boundingBox(),to=await page.locator('.session-gap').boundingBox();await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:12});await page.mouse.up();};
  await seed('missing',2,true);await page.locator('#sessionStatus.error').waitFor();assert.equal(await page.locator('[data-missing-choice]:not(:disabled)').count(),0);await page.locator('#sessionReplay').click();
  await page.locator('.session-drag-copy').waitFor();assert.equal(await page.evaluate(()=>events[0].kind),'audio');assert.equal(await page.locator('[data-missing-choice]:not(:disabled)').count(),0);
  await page.screenshot({path:'/private/tmp/senb-missing-drag-demo.png'});await page.locator('#sessionPause').click();assert.equal(await page.locator('.session-drag-copy,.session-demo-hand').count(),0);
  await page.evaluate(()=>events=[]);await page.locator('#sessionContinue').click();await ready();await counts();
  assert.equal(await page.evaluate(()=>SenbProgress.sessions().length),0,'The model never logs a response');
  const correct=await correctMissing();await drag((correct+1)%3);await page.locator('.session-answer.no').waitFor();await ready();await drag(correct);await page.locator('.session-answer.yes').waitFor();
  await page.waitForFunction(()=>SenbSessionModel.stages(SenbSession.state().worked)[SenbSession.state().stageIndex].id==='receptive-advanced');
  await page.locator('.session-demo-hand').waitFor();assert.equal(await page.locator('[data-sentence-choice]:not(:disabled)').count(),0);await ready();
  const correctSentence=await page.evaluate(()=>{const r=SenbSession.state();return r.currentChoices.findIndex(s=>s.key===r.worked[0].key);});
  await page.locator(`[data-sentence-choice="${(correctSentence+1)%4}"]`).click();await page.locator('.session-answer.no').waitFor();await ready();await page.locator(`[data-sentence-choice="${correctSentence}"]`).click();
  await page.waitForFunction(()=>SenbProgress.sessions().some(s=>s.source==='receptive-advanced'));
  assert.equal(await page.evaluate(()=>SenbProgress.sessions().find(s=>s.source==='receptive-advanced').records[0].correct),0,'A wrong first answer is retained after the demonstration');
  for(const [id,words] of [['expressive-advanced',2],['expressive-advanced',3],['expressive-slots',3]]){
   await seed(id,words);assert.equal(await page.locator('.session-beat').count(),words);assert.equal(await page.locator('#sessionExpressionNext').isDisabled(),true);
   await page.waitForFunction(()=>document.querySelector('.session-beat.lit'));assert.equal(await page.locator('.session-beat:not(:disabled)').count(),0);
   await page.screenshot({path:`/private/tmp/senb-${id}-${words}-beats.png`});
   await ready();await counts();
   const actual=await page.evaluate(()=>events.filter(e=>e.kind==='audio').map(e=>e.src));
   const expected=await page.evaluate(id=>{const s=SenbSession.state().worked[0];return (id.endsWith('advanced')?[{path:s.soundPath}]:s.slotContexts.flatMap(c=>c.segments)).map(segment=>new URL(segment.path,location.href).href);},id);
   assert.deepEqual(actual.slice(0,expected.length),expected);assert.equal(actual.length,expected.length+words);assert.ok(actual.slice(expected.length).every(src=>src.startsWith('blob:')),'All metronome sounds follow all spoken sounds');
   assert.deepEqual(await page.evaluate(()=>SenbSession.state().marks),Array(words).fill(false));
   for(const width of [320,768,1280]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);const below=await page.evaluate(()=>document.querySelector('.session-expression-marks').getBoundingClientRect().top>=document.querySelector('.session-advanced,.session-expression-frame').getBoundingClientRect().bottom);assert.equal(below,true);}
   await page.setViewportSize({width:390,height:844});
   await page.locator('.session-word-mark').first().click();await page.locator('#sessionPause').click();await page.reload({waitUntil:'domcontentloaded'});await page.locator('#resumeSenbSession').click();await page.locator('#sessionContinue').click();
   assert.equal(await page.locator('.session-word-mark').first().getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#sessionExpressionNext').isEnabled(),true);
  }
  // A paused beat must disappear and the full model must run again before testing.
  await seed('expressive-slots',3);await page.waitForFunction(()=>document.querySelector('.session-beat.lit'));await page.locator('#sessionPause').click();assert.equal(await page.locator('.session-beat.lit').count(),0);await page.evaluate(()=>events=[]);await page.locator('#sessionContinue').click();await ready();await counts();assert.equal(await page.evaluate(()=>events.filter(e=>e.kind==='audio'&&e.src.startsWith('blob:')).length),3);
  assert.deepEqual(errors,[]);console.log('PASS: missing-word drag model, audio recovery, wrong/correct drops, comprehension model and scoring, 1–2–3 transitions, two/three metronome circles after speech, responsive layout, pause/reload and beat cancellation.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{server.closeAllConnections();server.close();});
