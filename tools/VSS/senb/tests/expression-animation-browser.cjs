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
   window.clips=[];HTMLMediaElement.prototype.play=function(){if(window.denyClip){window.denyClip=false;return Promise.reject(new DOMException('Gesture','NotAllowedError'));}window.currentClip=this;clips.push({src:this.src,index:[...document.querySelectorAll('.expressive-word-cards .activity-slot')].findIndex(el=>el.classList.contains('expression-card-playing'))});return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){};
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/tools/VSS/senb/index.html`,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{openActivitySetup('expressive');chooseActivityFolder(3);chooseActivitySubgroup(1);chooseTestPresentation('slots');startActivity();});
  const frame=page.locator('.expressive-word-cards'),cards=frame.locator('.activity-slot');
  const expected=await page.evaluate(()=>{const s=currentActivitySentence();return s.slots.flatMap((slot,index)=>SENBActivities.slotSegments(s,slot,index).map(segment=>({src:new URL(segment.path,location.href).href,index})));});
  const finish=()=>page.evaluate(()=>currentClip.dispatchEvent(new Event('ended')));
  const drain=async(expectedClips)=>{for(let i=0;i<expectedClips.length;i++){await page.waitForFunction(n=>clips.length===n,i+1);assert.equal(await page.locator('.expression-card-playing').count(),1);await finish();}await page.waitForFunction(()=>!document.querySelector('.expression-card-playing'));};
  await frame.click({position:{x:5,y:5}});await page.waitForFunction(()=>clips.length===1);
  assert.equal(await cards.first().getAttribute('aria-busy'),'true');
  const visual=await cards.first().evaluate(el=>{const style=getComputedStyle(el);return {animation:style.animationName,border:style.borderColor,transform:style.transform,x:el.getBoundingClientRect().x};});
  assert.equal(visual.animation,'expression-card-speaking');assert.equal(visual.border,'rgb(25, 168, 128)');assert.notEqual(visual.transform,'none');assert.ok(visual.x>(await cards.last().boundingBox()).x,'The first sound belongs to the rightmost card');
  await page.screenshot({path:'/private/tmp/senb-expression-card-animation.png'});await drain(expected);assert.deepEqual(await page.evaluate(()=>clips),expected);
  assert.equal(await frame.getAttribute('aria-busy'),'false');assert.deepEqual(await page.evaluate(()=>activity.wordMarks),[false,false,false]);
  // A single-card press plays and animates only that card.
  const single=expected.filter(clip=>clip.index===1);await page.evaluate(()=>clips=[]);await cards.nth(1).click();await page.waitForFunction(()=>clips.length===1);assert.equal(await cards.nth(1).getAttribute('aria-busy'),'true');await drain(single);assert.deepEqual(await page.evaluate(()=>clips),single);
  // Interrupt a sequence with one card and preserve its new highlight.
  await page.evaluate(()=>clips=[]);await frame.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>clips.length===1);await cards.nth(2).click();await page.waitForFunction(()=>clips.length===2);assert.equal(await cards.first().getAttribute('aria-busy'),'false');assert.equal(await cards.nth(2).getAttribute('aria-busy'),'true');await page.locator('#activitySetupBtn').click();assert.equal(await page.locator('.expression-card-playing,.expression-frame-playing').count(),0);
  await page.evaluate(()=>{startActivity();window.denyClip=true;});await page.locator('.expressive-word-cards .activity-slot').first().click();await page.waitForFunction(()=>document.querySelector('#activityStatus').textContent.includes('تعذّر'));assert.equal(await page.locator('.expression-card-playing').count(),0);
  await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>clips=[]);await page.locator('.expressive-word-cards .activity-slot').first().click();await page.waitForFunction(()=>clips.length===1);assert.equal(await page.locator('.expression-card-playing').evaluate(el=>getComputedStyle(el).animationName),'none');assert.equal(await page.locator('.expression-card-playing').evaluate(el=>getComputedStyle(el).borderColor),'rgb(25, 168, 128)');await page.evaluate(()=>stopActivityPlayback());
  assert.deepEqual(errors,[]);console.log('PASS: expression frame RTL speech/animation order, individual-card motion/glow, keyboard playback, interruption, error/navigation cleanup, unchanged scoring, and reduced motion.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{server.close();server.closeAllConnections();});
