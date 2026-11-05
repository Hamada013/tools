const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(process.env.SENB_PLAYWRIGHT||path.resolve(__dirname,'../../voc/node_modules/playwright'));
const root=path.resolve(__dirname,'../../../..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,bytes)=>{if(err){res.writeHead(404).end();return;}if(file.endsWith('/index.html'))bytes=Buffer.from(bytes.toString().replace(/<link[^>]+(?:googleapis|gstatic)[^>]*>/g,''));res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(bytes);});});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const engine=process.env.SENB_ENGINE==='webkit'?webkit:chromium;
 const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 try{
  const context=await browser.newContext({viewport:{width:1024,height:768},serviceWorkers:'block'});await context.route('https://**',route=>route.abort());
  await context.addInitScript(()=>{
   if(!localStorage.getItem('voc-children-v1'))localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'animation',children:[{id:'animation',name:'علي',words:{},sessions:[]}]}));
   window.clips=[];HTMLMediaElement.prototype.play=function(){if(window.denyClip){window.denyClip=false;return Promise.reject(new DOMException('Gesture','NotAllowedError'));}window.currentClip=this;clips.push({src:this.src,index:[...document.querySelectorAll('.expressive-word-cards .activity-slot')].findIndex(el=>el.classList.contains('expression-card-playing'))});return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){};
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const tool=async selector=>{if(!await page.locator(selector).isVisible())await page.locator('[data-suite-settings]:visible').click();await page.locator(selector).click();};
  await page.goto(`http://127.0.0.1:${server.address().port}/tools/VSS/senb/index.html`,{waitUntil:'domcontentloaded'});
  await page.locator('#homeWorkplaceBtn').click();
  assert.equal(await page.locator('#multilineBtn,#slotsRow2').count(),0);
  await tool('#workplaceMetronomeBtn');
  const frame=page.locator('#workplaceMetronomeFrame');
  assert.equal(await page.locator('[data-workplace-beat]').count(),2);
  await page.evaluate(()=>{
   window.clips=[];
   HTMLMediaElement.prototype.play=function(){
    if(window.denyClip){window.denyClip=false;return Promise.reject(new DOMException('Gesture','NotAllowedError'));}
    clips.push({src:this.src,index:[...document.querySelectorAll('[data-workplace-beat]')].findIndex(el=>el.classList.contains('lit'))});
    clearTimeout(this.qaTimer);this.qaTimer=setTimeout(()=>this.dispatchEvent(new Event('ended')),30);return Promise.resolve();
   };
   HTMLMediaElement.prototype.pause=function(){clearTimeout(this.qaTimer);};
  });
  await frame.click({position:{x:5,y:5}});
  await page.waitForFunction(()=>document.querySelector('[data-workplace-beat="0"].lit'));
  assert.equal(await frame.getAttribute('aria-busy'),'true');
  await page.waitForFunction(()=>!workplaceMetronomePlaying);
  assert.deepEqual(await page.evaluate(()=>clips.map(c=>c.index)),[0,1]);
  assert.ok(await page.evaluate(()=>clips.every(c=>c.src.startsWith('blob:'))));
  // The click asset is a real, local WAV shared with guided expression models.
  assert.equal(await page.evaluate(async()=>{const bytes=new Uint8Array(await(await fetch(getMetronomeAudioPath())).arrayBuffer());return String.fromCharCode(...bytes.slice(0,4));}),'RIFF');
  for(const words of [3,6]){
   await page.evaluate(words=>{loadAdvancedSentence(getAdvancedItemData(String(words),1,1));renderWorkplace();clips=[];},words);
   assert.equal(await page.locator('[data-workplace-beat]').count(),words);
   const colors=await page.locator('[data-workplace-beat]').evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).borderColor));assert.equal(new Set(colors).size,words);
   await frame.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!workplaceMetronomePlaying);
   assert.deepEqual(await page.evaluate(()=>clips.map(c=>c.index)),Array.from({length:words},(_,i)=>i));
  }
  for(const [width,height] of [[320,568],[390,844],[844,390],[768,1024],[1366,768]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(160);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   const bounds=await page.locator('[data-workplace-beat]').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,width:r.width,height:r.height};}));
   assert.ok(bounds.every(r=>r.left>=0&&r.right<=width&&r.width>=44&&r.height>=44));
   assert.ok(bounds[0].left>bounds.at(-1).left);assert.ok(bounds.every(r=>Math.abs(r.top-bounds[0].top)<1),`Six circles fit in one RTL row at ${width}: ${JSON.stringify(bounds)}`);
   await page.screenshot({path:`/private/tmp/senb-workplace-metronome-${width}.png`});
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>clips=[]);await page.locator('[data-workplace-beat="2"]').click();await page.waitForFunction(()=>!workplaceMetronomePlaying);assert.deepEqual(await page.evaluate(()=>clips.map(c=>c.index)),[2]);
  // Empty gaps and cleared cards are excluded from both rhythm and sentence snapshots.
  await page.evaluate(()=>{state.row1Slots[1]=null;renderWorkplace();});assert.equal(await page.locator('[data-workplace-beat]').count(),5);
  await page.evaluate(()=>{state.slotCount=2;state.row1Slots=[state.row1Slots[0],null,null,null,null,null];renderWorkplace();});assert.equal(await page.locator('[data-workplace-beat]').count(),1);
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#homeWorkplaceBtn').click();assert.equal(await page.locator('#workplaceMetronomeBtn').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-workplace-beat]').count(),1);
  // Switching the row off cancels the active beat and pending later beats.
  await page.evaluate(()=>{loadAdvancedSentence(getAdvancedItemData('3',1,1));renderWorkplace();clips=[];});
  // Restore the short test playback after reload.
  await page.evaluate(()=>{HTMLMediaElement.prototype.play=function(){clips.push({src:this.src,index:0});this.qaTimer=setTimeout(()=>this.dispatchEvent(new Event('ended')),30);return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){clearTimeout(this.qaTimer);};});
  await frame.click({position:{x:5,y:5}});await page.waitForFunction(()=>workplaceMetronomePlaying);await tool('#workplaceMetronomeBtn');assert.equal(await page.locator('[data-workplace-beat].lit').count(),0);await page.waitForTimeout(650);assert.equal(await page.evaluate(()=>clips.length),1);
  await tool('#workplaceMetronomeBtn');await page.evaluate(()=>clearAllSlots());assert.equal(await frame.isVisible(),false);assert.equal(await page.locator('[data-workplace-beat]').count(),0);
  await page.evaluate(()=>{loadAdvancedSentence(getAdvancedItemData('2',1,1));renderWorkplace();clips=[];});await frame.click({position:{x:5,y:5}});await page.waitForFunction(()=>workplaceMetronomePlaying);await page.evaluate(()=>navigateTo('home'));await page.waitForTimeout(650);assert.equal(await page.evaluate(()=>clips.length),1);assert.equal(await page.locator('[data-workplace-beat].lit').count(),0);
  await page.locator('#homeWorkplaceBtn').click();
  await page.evaluate(()=>{
   const saved=workplaceStateSnapshot();delete saved.showMetronome;delete saved.splitWorkplace;saved.isMultiline=true;saved.row2Slots=[...saved.row1Slots];
   SenbProgress.saveWorkspace(saved);initializeWorkplace();renderWorkplace();clips=[];
  });
  assert.equal(await page.locator('[data-workplace-beat]').count(),2);assert.equal(await page.evaluate(()=>getWorkplaceSentence().slots.length),2);assert.equal(await page.evaluate(()=>getWorkplaceSentence().secondRow),false);assert.ok(await page.evaluate(()=>state.row2Slots.some(Boolean)),'Legacy second-row data is retained');
  await frame.click({position:{x:5,y:5}});await page.waitForFunction(()=>workplaceMetronomePlaying);await page.evaluate(()=>void playSlotAudio(state.row1Slots[0],1,0));assert.equal(await page.locator('[data-workplace-beat].lit').count(),0);await page.waitForTimeout(650);assert.equal(await page.evaluate(()=>clips.filter(c=>c.src.startsWith('blob:')).length),1,'Speech cancels the pending rhythm');
  await page.evaluate(()=>{window.rhythmPlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Gesture','NotAllowedError'));};});
  await page.locator('[data-workplace-beat="0"]').click();await page.waitForFunction(()=>!workplaceMetronomePlaying);assert.equal(await frame.getAttribute('aria-busy'),'false');assert.equal(await page.locator('[data-workplace-beat].lit').count(),0);assert.ok(await page.locator('#audioStatus').textContent());
  await page.evaluate(()=>{HTMLMediaElement.prototype.play=window.rhythmPlay;});await page.locator('[data-workplace-beat="0"]').click();await page.waitForFunction(()=>!workplaceMetronomePlaying);assert.equal(await page.locator('#audioStatus').textContent(),'');
  await page.evaluate(()=>{SenbProgress.saveWorkspace(null);initializeWorkplace();renderWorkplace();});assert.equal(await page.locator('#workplaceMetronomeBtn').getAttribute('aria-pressed'),'false','A new workspace does not inherit another child’s rhythm preference');
  assert.deepEqual(errors,[]);console.log('PASS: replacement rhythm control, filled-word counts, shared local WAV, RTL colored beats/frame and single-circle playback, live edits, persistence, responsive six-circle row, and migration, error recovery, and hide/speech/navigation cancellation.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{server.close();server.closeAllConnections();});
