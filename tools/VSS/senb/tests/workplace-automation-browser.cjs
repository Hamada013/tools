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
  await page.setViewportSize({width:1280,height:900});
  await page.evaluate(()=>{navigateTo('workplace');loadAdvancedSentence(getAdvancedItemData('2',1,1));renderWorkplace();});
  await page.locator('[data-suite-settings]').click();
  await page.locator('#splitWorkplaceBtn').click();
  const expected=await page.evaluate(()=>SenbSplit.snapshot());
  await page.locator('[data-suite-settings]').click();
  await page.locator('#sequencePlayBtn').click();
  await page.locator('.session-count').waitFor();
  assert.equal(await page.evaluate(()=>SenbSession.state().worked.length),2);
  assert.equal(await page.evaluate(()=>SenbSession.state().phase),'automation-countdown');
  await page.waitForFunction(()=>SenbSession.state().phase==='automation');
  assert.deepEqual(await page.evaluate(()=>events.filter(e=>e.kind==='count').map(e=>e.value)),['1','2','3']);
  assert.equal(await page.locator('.session-advanced').count(),1);
  await page.evaluate(()=>SenbSession.stop());
  assert.deepEqual(await page.evaluate(()=>SenbSplit.snapshot()),expected,'Starting automation preserves both boards and selection');
  await page.locator('[data-suite-settings]').click();
  await page.locator('#workplacePractice').click();
  await page.locator('.session-demo-hand').waitFor();
  assert.equal(await page.evaluate(()=>events.find(e=>e.kind==='audio')!==undefined),true);
  await page.locator('#sessionCompletion[open]').waitFor({timeout:30000});
  assert.equal(await page.locator('#workplaceView').isVisible(),true);
  await page.locator('#sessionKeepPracticing').click();
  await page.locator('[data-suite-settings]').click();
  await page.locator('#workplaceDynamicTest').click();
  await page.waitForFunction(()=>SenbSession.state().phase==='dynamic-test'&&SenbSession.state().answerReady);
  assert.equal(await page.locator('.session-demo-hand').count(),0);
  await page.evaluate(()=>SenbSession.stop());
  // Exhaust the last stage to verify the automatic return and choice dialog.
  await page.evaluate(()=>{const s=getWorkplaceSentence();SenbProgress.saveDraft({id:'done',phase:'automation',worked:[s],sessionIds:[],logIndex:0,stageIndex:SenbSessionModel.stages([s]).length,stagePosition:0,stageRecords:[]});SenbSession.resume();});
  await page.locator('#sessionContinue').click();
  await page.locator('#sessionCompletion[open]').waitFor();
  assert.equal(await page.locator('#workplaceView').isVisible(),true);
  await page.locator('#sessionPlayAgain').click();
  await page.locator('.session-count').waitFor();
  await page.evaluate(()=>SenbSession.stop());
  await page.evaluate(()=>{SenbSplit.restore({...SenbSplit.snapshot(),enabled:false,active:0});toggleAdvancedMode();SenbSession.startAutomation();});
  await page.waitForFunction(()=>SenbSession.state().phase==='automation');
  assert.equal(await page.evaluate(()=>SenbSession.state().worked.length),1);
  assert.equal(await page.locator('#sessionBoard .session-advanced').count(),0);
  assert.ok(await page.locator('#sessionBoard .session-word-row').count()>0);
  await page.evaluate(()=>SenbSession.stop());
  await page.goto(`http://127.0.0.1:${server.address().port}/tools/VSS/voc/index.html`,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>app.switchView('workplace'));
  for(const width of [390,1280]){
   await page.setViewportSize({width,height:844});
   await page.waitForFunction(()=>document.querySelector('#workplace-view [data-suite-settings]'));
   const controls=await page.locator('#workplace-view > header').evaluate(header=>[...header.querySelectorAll(':scope > [data-suite-apps],:scope > [data-suite-menu],:scope > [data-suite-settings]')].map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right};}).sort((a,b)=>a.left-b.left));
   assert.equal(controls.length,3);
   for(let i=1;i<controls.length;i++)assert.ok(controls[i].left-controls[i-1].right<=12,'Header buttons stay together');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  }
  assert.deepEqual(errors,[]);console.log('PASS: workplace play, split snapshots, countdown, practice demo, direct test, and completion choices.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{server.closeAllConnections();server.close();});
