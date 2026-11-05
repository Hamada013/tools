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
   localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'animation',children:[{id:'animation',name:'علي',words:{},sessions:[]}]}));
   window.clips=[];HTMLMediaElement.prototype.play=function(){if(window.denyClip){window.denyClip=false;return Promise.reject(new DOMException('Gesture','NotAllowedError'));}window.currentClip=this;clips.push({src:this.src,index:[...document.querySelectorAll('#slotsRow1 .slot-card')].findIndex(el=>el.classList.contains('expression-card-playing'))});return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){};
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const tool=async selector=>{if(!await page.locator(selector).isVisible())await page.locator('[data-suite-settings]:visible').click();await page.locator(selector).click();};
  await page.goto(`http://127.0.0.1:${server.address().port}/tools/VSS/senb/index.html`,{waitUntil:'domcontentloaded'});
  await page.locator('#homeWorkplaceBtn').click();
  await page.evaluate(()=>{loadAdvancedSentence(getAdvancedItemData('3',1,2));state.showMetronome=true;renderWorkplace();});
  const frame=page.locator('#workplaceWordFrame'),cards=frame.locator('.slot-card');
  const expected=await page.evaluate(()=>state.row1Slots.slice(0,state.slotCount).flatMap((slot,index)=>getSlotAudioSegments(slot,1,index).map(segment=>({src:new URL(segment.path,location.href).href,index}))));
  const finish=()=>page.evaluate(()=>currentClip.dispatchEvent(new Event('ended')));
  const drain=async(expectedClips)=>{for(let i=0;i<expectedClips.length;i++){await page.waitForFunction(n=>clips.length===n,i+1);assert.equal(await frame.locator('.expression-card-playing').count(),1);await finish();}await page.waitForFunction(()=>!workplaceWordsPlaying);};
  await frame.click({position:{x:5,y:5}});await page.waitForFunction(()=>clips.length===1);
  assert.equal(await cards.first().getAttribute('aria-busy'),'true');await page.waitForTimeout(240);
  const visual=await cards.first().evaluate(el=>{const style=getComputedStyle(el);return {animation:style.animationName,border:style.borderColor,transform:style.transform,x:el.getBoundingClientRect().x};});
  assert.equal(visual.animation,'expression-card-speaking');assert.equal(visual.border,'rgb(25, 168, 128)');assert.notEqual(visual.transform,'none');assert.ok(visual.x>(await cards.last().boundingBox()).x,'The first word is on the right');
  await drain(expected);assert.deepEqual(await page.evaluate(()=>clips),expected);assert.equal(await frame.getAttribute('aria-busy'),'false');
  const single=expected.filter(clip=>clip.index===1);await page.evaluate(()=>clips=[]);await cards.nth(1).click();await drain(single);assert.deepEqual(await page.evaluate(()=>clips),single);
  // One card interrupts the frame without its click bubbling into a new full sequence.
  await page.evaluate(()=>clips=[]);await frame.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>clips.length===1);await cards.nth(2).click();await page.waitForFunction(()=>clips.length===2);assert.equal(await cards.first().getAttribute('aria-busy'),'false');assert.equal(await cards.nth(2).getAttribute('aria-busy'),'true');
  await page.locator('#nextAdvancedSentence').click();assert.equal(await frame.locator('.expression-card-playing').count(),0);assert.equal(await frame.getAttribute('aria-busy'),'false');
  assert.equal(await page.locator('#advancedSentencePosition').count(),0);
  assert.equal(await page.locator('#advancedSentenceNav').evaluate(el=>el.parentElement.id),'advancedImageStage');
  // Navigation stays beside the word frame when advanced images are turned off.
  await tool('#advancedModeBtn');assert.equal(await page.locator('#advancedSentenceNav').evaluate(el=>el.parentElement.id),'workplaceWordStage');
  await page.locator('#nextAdvancedSentence').click();assert.equal(await page.evaluate(()=>state.isAdvancedMode),false);assert.equal(await page.evaluate(()=>state.featuredAdvancedCard.itemNum),4);
  await page.locator('#previousAdvancedSentence').click();assert.equal(await page.evaluate(()=>state.featuredAdvancedCard.itemNum),3);
  const alignment=async()=>{
   const bounds=await page.evaluate(()=>{
    const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,cx:r.left+r.width/2,cy:r.top+r.height/2};};
    const word=document.getElementById('workplaceWordFrame'),beat=document.getElementById('workplaceMetronomeFrame'),target=document.getElementById(state.isAdvancedMode?'featuredCard':'workplaceWordFrame'),visible=document.querySelector('.workplace-word-stack');
    return {word:rect(word),beat:rect(beat),target:rect(target),visible:rect(visible),advanced:state.isAdvancedMode,buttons:[...document.querySelectorAll('#advancedSentenceNav button')].map(rect),pairs:[...document.querySelectorAll('[data-workplace-beat]')].map(el=>[rect(el),rect(document.getElementById(`slot-1-${el.dataset.slotIndex}`))]),overflow:document.documentElement.scrollWidth>innerWidth};
   });
   assert.equal(bounds.overflow,false);assert.ok(Math.abs(bounds.word.left-bounds.beat.left)<1);assert.ok(Math.abs(bounds.word.right-bounds.beat.right)<1);
   for(const [circle,card] of bounds.pairs){assert.ok(Math.abs(circle.cx-card.cx)<1,'Every circle is centered below its matching card');assert.ok(circle.top>=card.bottom);}
   for(const button of bounds.buttons){assert.ok(Math.abs(button.cy-bounds.target.cy)<1,'Navigation is centered beside the visible image/frame');const visible=bounds.advanced?bounds.target:bounds.visible;assert.ok(button.right<=visible.left+1||button.left>=visible.right-1,`Navigation does not cover the image/frame: ${JSON.stringify(bounds)}`);}
  };
  for(const [width,height] of [[320,568],[390,844],[844,390],[768,1024],[1366,768]]){
   await page.setViewportSize({width,height});
   for(const count of [2,3,6])for(const advanced of [true,false]){
    await page.evaluate(({count,advanced})=>{loadAdvancedSentence(getAdvancedItemData(String(count),1,2));state.isAdvancedMode=advanced;renderWorkplace();},{count,advanced});await page.waitForTimeout(60);await alignment();
    if(count===3)await page.screenshot({path:`/private/tmp/senb-workplace-frame-${width}${advanced?'':'-cards'}.png`});
   }
  }
  // A missing middle card retains its empty rhythm column.
  await page.evaluate(()=>{loadAdvancedSentence(getAdvancedItemData('3',1,2));state.row1Slots[1]=null;renderWorkplace();});await page.waitForTimeout(60);assert.deepEqual(await page.locator('[data-workplace-beat]').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.slotIndex))),[0,2]);await alignment();
  await page.evaluate(()=>clips=[]);await page.locator('.slot-cover-toggle').first().click();assert.equal(await page.evaluate(()=>clips.length),0,'Covering a card does not start the frame');
  await page.evaluate(()=>{window.denyClip=true;});await cards.first().click();await page.waitForFunction(()=>!workplaceWordsPlaying);assert.equal(await frame.locator('.expression-card-playing').count(),0);assert.ok(await page.locator('#audioStatus').textContent());
  await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>clips=[]);await cards.first().click();await page.waitForFunction(()=>clips.length===1);await page.waitForTimeout(240);assert.equal(await cards.first().evaluate(el=>getComputedStyle(el).animationName),'none');assert.equal(await cards.first().evaluate(el=>getComputedStyle(el).borderColor),'rgb(25, 168, 128)');await page.evaluate(()=>navigateTo('home'));assert.equal(await frame.getAttribute('aria-busy'),'false');assert.equal(await frame.locator('.expression-card-playing').count(),0);
  assert.deepEqual(errors,[]);console.log('PASS: workplace frame RTL speech and motion, individual cards and interruption, keyboard/reduced motion, navigation beside either image format, and matching card/rhythm columns across phone/tablet/desktop.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{server.close();server.closeAllConnections();});
