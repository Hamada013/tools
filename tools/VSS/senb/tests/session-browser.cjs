const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.SENB_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'../../../..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.m4a':'audio/mp4','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const engine=process.env.SENB_ENGINE==='webkit'?webkit:chromium;
 const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await context.addInitScript(()=>{
  if(!localStorage.getItem('voc-children-v1'))localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'qa',children:[{id:'qa',name:'ليان',words:{},sessions:[]}]}));
  window.handEvents=[];document.addEventListener('DOMContentLoaded',()=>new MutationObserver(changes=>{for(const change of changes){for(const node of change.addedNodes)if(node.nodeType===1&&node.matches('.session-finger'))window.handEvents.push({kind:'start',at:performance.now()});for(const node of change.removedNodes)if(node.nodeType===1&&node.matches('.session-finger'))window.handEvents.push({kind:'end',at:performance.now()});}}).observe(document.body,{childList:true,subtree:true}));
  window.clipStages=[];window.clips=[];HTMLMediaElement.prototype.play=function(){const el=this;if(window.denyNextAudio){window.denyNextAudio=false;return Promise.reject(new DOMException('Gesture','NotAllowedError'));}clearTimeout(el.qaTimer);window.clips.push(el.src);const r=window.SenbSession?.state();window.clipStages.push({src:el.src,stage:r?.phase==='automation'?SenbSessionModel.stages(r.worked)[r.stageIndex]?.id:r?.phase});el.qaTimer=setTimeout(()=>el.dispatchEvent(new Event('ended')),35);return Promise.resolve();};
  HTMLMediaElement.prototype.pause=function(){clearTimeout(this.qaTimer);};
 });
 await context.route('https://**',route=>route.abort());
 // Exercise the offline system-font fallback without waiting on an external font service.
 await context.route('**/tools/VSS/senb/index.html',route=>route.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(root,'tools/VSS/senb/index.html'),'utf8').replace(/<link[^>]+(?:googleapis|gstatic)[^>]*>/g,'')}));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
 const origin=`http://127.0.0.1:${server.address().port}/tools/VSS/senb/index.html`;
 await page.goto(origin,{waitUntil:'domcontentloaded'});await page.evaluate(()=>navigateTo('workplace'));
 assert.equal(await page.evaluate(()=>state.slotCount),2);assert.equal(await page.evaluate(()=>state.isAdvancedMode),true);
 await page.evaluate(()=>window.denyNextAudio=true);await page.locator('#workplaceDynamicTest').click();
 await page.locator('#sessionStatus.error').waitFor();assert.equal(await page.locator('.session-practiced').count(),0);
 await page.locator('#sessionReplay').click();await page.locator('.session-finger').first().waitFor();
 await page.screenshot({path:'/private/tmp/senb-guided-hand.png'});
 assert.equal(await page.locator('[data-target]:not(:disabled)').count(),0);
 await page.locator('#sessionPause').click();await page.reload({waitUntil:'domcontentloaded'});await page.locator('#resumeSenbSession').click();await page.locator('#sessionContinue').click();
 await page.locator('.session-count').first().waitFor();
 const handEvents=await page.evaluate(()=>window.handEvents);
 for(let i=2;i<handEvents.length;i+=2)assert.ok(handEvents[i].at-handEvents[i-1].at>=980,'A full second separates the completed selection from the next hand');
 assert.ok(handEvents.length>=4);
 const layout=await page.evaluate(()=>{const scene=document.querySelector('.dynamic-board .session-advanced').getBoundingClientRect(),row=document.querySelector('.session-target-words').getBoundingClientRect(),cards=[...document.querySelectorAll('.session-target-words button')].map(el=>el.getBoundingClientRect());return {below:row.top>=scene.bottom,center:Math.abs((cards[0].right+cards.at(-1).left)/2-(scene.left+scene.right)/2),gap:cards[0].left-cards[1].right};});
 assert.equal(layout.below,true);assert.ok(layout.center<2);assert.ok(layout.gap<20);
 await page.screenshot({path:'/private/tmp/senb-countdown.png'});
 let pausedFeedback=false;
 async function answerDynamic(wrong=false){
  while(await page.evaluate(()=>SenbSession.state().phase!=='another')){
   await page.waitForFunction(()=>SenbSession.state().phase==='another'||document.querySelector('[data-target]:not(:disabled)'));
   if(await page.evaluate(()=>SenbSession.state().phase==='another'))break;
   const state=await page.evaluate(()=>SenbSession.state());
   const target=state.testOrder?.[state.targetIndex]??state.targetIndex;
   if(wrong){const bad=state.targets.findIndex(item=>item.key!==state.targets[target].key||item.entity!==state.targets[target].entity);await page.locator(`[data-target="${bad}"]`).click();await page.locator('.session-answer.no').waitFor();assert.equal(await page.locator('#sessionReplay').isDisabled(),true,'Replay cannot interrupt answer feedback');await page.screenshot({path:'/private/tmp/senb-wrong-feedback.png'});wrong=false;await page.waitForFunction(()=>document.querySelector('[data-target]:not(:disabled)'));}
   await page.locator(`[data-target="${target}"]`).click();
   if(!pausedFeedback&&state.targetIndex===state.targets.length-1){
    pausedFeedback=true;await page.locator('.session-answer.yes').waitFor();await page.locator('#sessionPause').click();await page.reload({waitUntil:'domcontentloaded'});await page.locator('#resumeSenbSession').click();await page.locator('#sessionContinue').click();
   }
  }
 }
 await answerDynamic(true);assert.equal(await page.evaluate(()=>SenbProgress.sessions()[0].records[0].correct),0);
 const firstKey=await page.evaluate(()=>getWorkplaceSentence().key);
 await page.locator('#sessionChooseMore').click();
 assert.equal(await page.evaluate(()=>state.currentView),'workplace');
 assert.equal(await page.evaluate(()=>getWorkplaceSentence().key),firstKey,'Repeat returns to the same editable workplace');
 await page.reload({waitUntil:'domcontentloaded'});await page.locator('#resumeSenbSession').click();
 assert.equal(await page.evaluate(()=>state.currentView),'workplace');
 await page.evaluate(()=>{loadAdvancedSentence(getAdvancedItemData('2',1,9));renderWorkplace();});
 await page.locator('#workplaceDynamicTest').click();await answerDynamic();
 assert.equal(await page.evaluate(()=>SenbSession.state().worked.length),2);
 const repetitionClips=await page.evaluate(()=>SenbSession.state().worked.reduce((sum,s)=>sum+10*(1+s.slotContexts.flatMap(context=>context.segments).length),0));
 await page.locator('#sessionStartAutomation').click();
 let countedRepetitions=false;
 const observed=new Set();let pausedSentence=false;
 while(await page.evaluate(()=>SenbSession.state().phase!=='finished')){
  const run=await page.evaluate(()=>SenbSession.state());
  if(run.phase!=='automation'){await page.waitForTimeout(50);continue;}
  const stages=await page.evaluate(()=>SenbSessionModel.stages(SenbSession.state().worked));const stage=stages[run.stageIndex];if(!stage){await page.waitForTimeout(50);continue;}observed.add(stage.id);
  if(stage.id==='repetition'){await page.waitForTimeout(150);continue;}
  if(stage.id==='missing'){
   if(!countedRepetitions){countedRepetitions=true;assert.equal(await page.evaluate(()=>window.clipStages.filter(clip=>clip.stage==='repetition').length),repetitionClips,'Every worked sentence plays its full contextual sequence exactly ten times');}
   await page.waitForFunction(()=>SenbSession.state().trialPhase==='test'&&SenbSession.state().answerReady&&document.querySelector('[data-missing-choice]:not(:disabled)'));const current=await page.evaluate(()=>SenbSession.state());const correct=current.missing.choices.findIndex(slot=>`w:${slot.categoryId}/${slot.id}`===current.missing.wanted);await page.locator(`[data-missing-choice="${correct}"]`).click();await page.waitForTimeout(750);
  }else if(stage.domain==='receptive'){
   await page.waitForFunction(()=>document.querySelector('[data-sentence-choice]:not(:disabled)'));
   const state=await page.evaluate(()=>{const r=SenbSession.state(),st=SenbSessionModel.stages(r.worked)[r.stageIndex];return {choices:r.currentChoices,target:r.worked[st.indices[r.stagePosition]].key};});
   const correct=state.choices.findIndex(s=>s.key===state.target);await page.locator(`[data-sentence-choice="${correct}"]`).click();
   if(!pausedSentence){pausedSentence=true;await page.locator('.session-answer.yes').waitFor();await page.locator('#sessionPause').click();await page.reload({waitUntil:'domcontentloaded'});await page.locator('#resumeSenbSession').click();await page.locator('#sessionContinue').click();}
   await page.waitForTimeout(750);
  }else{
   await page.waitForFunction(()=>SenbSession.state().trialPhase==='test'&&!document.querySelector('#sessionExpressionNext')?.disabled);
   if(stage.presentation==='slots'){
    const expected=await page.evaluate(()=>{const r=SenbSession.state(),st=SenbSessionModel.stages(r.worked)[r.stageIndex],s=r.worked[st.indices[r.stagePosition]];return s.slotContexts.flatMap(c=>c.segments).map(seg=>new URL(seg.path,location.href).href);});
    await page.evaluate(()=>window.clips=[]);await page.locator('.session-expression-frame').click({position:{x:5,y:5}});
    await page.waitForFunction(()=>!document.querySelector('#sessionExpressionNext').disabled);
    assert.deepEqual(await page.evaluate(()=>window.clips.filter(src=>!src.startsWith('blob:'))),expected,'Frame plays contextual word clips in RTL order');
    const single=await page.evaluate(()=>{const r=SenbSession.state(),st=SenbSessionModel.stages(r.worked)[r.stageIndex];return r.worked[st.indices[r.stagePosition]].slotContexts[0].segments.map(seg=>new URL(seg.path,location.href).href);});
    await page.evaluate(()=>window.clips=[]);await page.locator('.session-expression-frame button').first().click();await page.waitForTimeout(200);assert.deepEqual(await page.evaluate(()=>window.clips),single,'A word click does not bubble into frame playback');
   }
   const buttons=page.locator('.session-word-mark');await buttons.nth(0).click();await page.locator('#sessionExpressionNext').click();await page.waitForTimeout(300);
  }
 }
 assert.equal(observed.size,6);const sessions=await page.evaluate(()=>SenbProgress.sessions());
 assert.equal(sessions.filter(s=>s.source==='repetition').length,2);
 for(const source of ['receptive-advanced','receptive-slots','expressive-advanced','expressive-slots'])assert.equal(sessions.find(s=>s.source===source).records.filter(r=>r.entity==='sentence').length,2);
 assert.ok(await page.evaluate(()=>SenbProgress.lesson()));
 await page.locator('#sessionFamily').click();await page.locator('dialog[open] textarea').waitFor();const lesson=await page.locator('dialog[open] textarea').inputValue();assert.ok(lesson.includes('ليان'));assert.ok(lesson.includes('ماما'));await page.screenshot({path:'/private/tmp/senb-family-lesson.png'});await page.keyboard.press('Escape');
 await page.locator('#sessionReport').click();await page.locator('dialog[open]').waitFor();assert.equal(await page.locator('[data-period]').count(),6);await page.screenshot({path:'/private/tmp/senb-period-report.png'});
 // Browser report PDF download is also covered by reports-browser.cjs.
 assert.deepEqual(errors,[]);console.log('PASS: blocked-audio recovery, guided hand/ticks, countdown, first-answer errors, another-sentence cycle, exact plan, ten repetitions, four assessment formats, saved family lesson and period report.');
 }finally{await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});await browser.close();}
})().catch(error=>{console.error(error);server.closeAllConnections();server.close();process.exitCode=1;});
