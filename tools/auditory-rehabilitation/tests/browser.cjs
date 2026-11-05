const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(process.env.SOUNDS_PLAYWRIGHT||path.resolve(__dirname,'../../VSS/voc/node_modules/playwright'));
const {solveParentGate}=require('../../tests/solve-parent-gate.cjs');
const root=path.resolve(__dirname,'../../..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.m4a':'audio/mp4'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(e,b)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(b);});});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const engine=(process.env.SOUNDS_ENGINE||process.env.APP_ENGINE)==='webkit'?webkit:chromium;
 const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});let page;
 try{
  const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
  await context.addInitScript(()=>{
   if(!localStorage.getItem('auditory-rehabilitation-children-v1'))localStorage.setItem('auditory-rehabilitation-children-v1',JSON.stringify({schema:1,active:'ali',children:[{id:'ali',name:'علي',role:'child',words:{keep:true},senb:{mastery:{keep:true}},taffaha:{attempts:[{keep:true}]},apps:{voc:true}},{id:'hamada-admin',name:'Hamada',role:'admin',apps:{}}]}));
   window.audioLog=[];window.playingAudio=null;window.clipMs=1100;window.modelPairs=[];window.countSteps=[];window.demoDrops=0;
   const timeout=setTimeout.bind(window);window.setTimeout=(fn,ms,...args)=>timeout(fn,[1000,3000,1200,700,200,300].includes(ms)?40:ms===650?180:ms,...args);
   const animate=Element.prototype.animate;Element.prototype.animate=function(frames,options){return animate.call(this,frames,typeof options==='object'?{...options,duration:Math.min(options.duration,180)}:options);};
   const nativeFetch=fetch.bind(window);window.fetch=async(...args)=>{const response=await nativeFetch(...args);if(String(args[0]).includes('sounds/')){const arrayBuffer=response.arrayBuffer.bind(response);response.arrayBuffer=async()=>{const result=await arrayBuffer();window.decodingURL=String(args[0]);return result;};}return response;};
   class Context{
    constructor(){this.state='running';this.destination={};}resume(){return Promise.resolve();}createBuffer(){return {silent:true};}
    decodeAudioData(){return window.failAudio?Promise.reject(Error('Audio failure')):Promise.resolve({duration:window.clipMs/1000,url:window.decodingURL});}
    createBufferSource(){return {connect(){},disconnect(){},stop(){clearTimeout(this.timer);if(window.playingAudio===this.buffer?.url)window.playingAudio=null;},start(){if(this.buffer.silent){queueMicrotask(()=>this.onended?.());return;}audioLog.push(this.buffer.url);window.playingAudio=this.buffer.url;this.timer=timeout(()=>{window.playingAudio=null;this.onended?.();},window.clipMs);}};}
   }window.AudioContext=Context;
   new MutationObserver(records=>{for(const change of records){if(change.target.id==='countdown-number'&&change.attributeName==='data-step')countSteps.push(change.target.dataset.step);if(change.target.classList?.contains('memory-model-pair')){const pair=[...document.querySelectorAll('.memory-model-pair')];if(pair.length===2&&pair[0].dataset.sound===pair[1].dataset.sound)modelPairs.push(pair[0].dataset.sound);}}}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-step','class']});
   new MutationObserver(changes=>{for(const change of changes)for(const node of change.addedNodes)if(node.classList?.contains('demo-ghost'))window.demoDrops++;}).observe(document,{childList:true,subtree:true});
  });
  await context.route('https://**',route=>route.abort());page=await context.newPage();page.setDefaultTimeout(12000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/tools/auditory-rehabilitation/index.html`);
  const go=async(route,selector)=>{await page.evaluate(route=>{if(location.hash==='#/'+route)history.replaceState(null,'','#/home');location.hash='/'+route;},route);await page.locator(selector).first().waitFor();};
  const mode=async(prefix,value)=>{if(!await page.locator(`#${prefix}-${value}`).isVisible())await page.locator('[data-suite-settings]:visible').click();await page.locator(`#${prefix}-${value}`).click();};
  const records=()=>page.evaluate(()=>SoundProgress.report().sessions.flatMap(session=>session.records.map(record=>({...record,kind:session.kind,skill:session.skill}))));
  const ready=selector=>page.waitForFunction(selector=>{const node=document.querySelector(selector);return node&&!node.disabled&&!document.querySelector('#session-countdown').open&&!document.querySelector('#answer-feedback');},selector);
  const target=()=>page.evaluate(()=>audioLog.at(-1).match(/(?:^|\/)(\d+)\.m4a$/)[1]);
  async function drop(card){const from=await card.boundingBox(),to=await page.locator('#identify-target').boundingBox();await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:5});await page.mouse.up();}
  async function fit(){const result=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,main:document.querySelector('main').getBoundingClientRect().bottom,buttons:[...document.querySelectorAll('main button,main a')].filter(node=>node.getClientRects().length).map(node=>{const r=node.getBoundingClientRect();return [r.x,r.y,r.right,r.bottom,r.width,r.height,node.getAttribute('aria-label')];})}));assert.ok(result.scrollWidth<=result.width+1&&result.scrollHeight<=result.height+1,JSON.stringify(result));for(const [x,y,right,bottom,w,h,label]of result.buttons)assert.ok(x>=-1&&y>=-1&&right<=result.width+1&&bottom<=result.height+1&&w>=43&&h>=43,JSON.stringify({label,x,y,right,bottom,w,h,...result}));}
  // Tick/cross detection accepts a response during the actual audio buffer.
  await go('around/detection','#sudden');await page.locator('#sudden').click();let before=0,presentCount=0;
  for(let i=0;i<10;i++){
   await ready('#heard');const count=await page.evaluate(()=>audioLog.length),present=count>before;before=count;presentCount+=Number(present);
   assert.equal(await page.locator('.detect-bucket,.detect-toy').count(),0);if(present){assert.ok(await page.evaluate(()=>!!playingAudio));assert.equal(await page.locator('.detect-ear').evaluate(node=>getComputedStyle(node.querySelector('svg')).animationName),'rehab-ear-dance');}
   const heard=i===0?!present:present;await page.locator(heard?'#heard':'#silent').click();await page.locator('#answer-feedback').waitFor();assert.equal(await page.locator('#answer-feedback').getAttribute('class'),`answer-feedback ${i===0?'incorrect':'correct'}`);
  }
  await page.locator('#session-again').waitFor();assert.equal(presentCount,5);assert.equal(await page.locator('.result-metric').innerText(),'9 / 10');assert.equal((await records()).filter(r=>r.skill==='detection').length,10);
  console.log('Detection passed');
  // Every discrimination/identification variant keeps all choices during its glove model.
  const setups=[['around/discrimination','#wide',true],['around/discrimination','#similar',true],['around/identification','#two-set',true],['around/identification','#closed-set',true],['around/identification','#closed-set',5],['around/identification','#open-set',false]];
  for(const [route,choice,sets]of setups){console.log('Checking',route,choice);
   await go(route,choice);await page.locator(choice).click();if(sets)await page.locator('.set-card').nth(typeof sets==='number'?sets:0).click();await page.locator('#identify-target').waitFor();
   await page.locator('#identify-target').click();await ready('.answer-grid button');let id=await target();let wrong=page.locator(`.answer-grid button:not([data-sound="${id}"])`).first();
   await drop(wrong);await page.locator('#answer-feedback.incorrect').waitFor();assert.equal(await page.locator('#identify-target img').count(),1,'Drop fills the target before cross feedback');await ready('#identify-target');
   await page.locator('#identify-target').click();await ready('.answer-grid button');id=await target();await drop(page.locator(`.answer-grid [data-sound="${id}"]`));await page.locator('#answer-feedback.correct').waitFor();await ready('#identify-target');
   const scoredBefore=(await records()).filter(r=>r.kind==='assessment').length;
   const drops=await page.evaluate(()=>demoDrops);await mode('identify','practice');await page.locator('.demo-glove').waitFor();assert.equal(await page.locator('.practice-covered').count(),0);assert.ok(await page.locator('.answer-grid img').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).visibility==='visible')));await page.waitForFunction(previous=>demoDrops>previous,drops);
   await ready('.answer-grid button');assert.equal((await records()).filter(r=>r.kind==='assessment').length,scoredBefore,'Model never becomes a test answer');id=await target();await drop(page.locator(`.answer-grid [data-sound="${id}"]`));await page.locator('#answer-feedback.correct').waitFor();await ready('.answer-grid button');
   await mode('identify','test');await ready('.answer-grid button');assert.ok(await page.evaluate(()=>!!playingAudio),'Choices are live during test playback');id=await target();
   await drop(page.locator(`.answer-grid [data-sound="${id}"]`));await page.locator('#answer-feedback.correct').waitFor();assert.equal((await records()).filter(r=>r.kind==='assessment').length,scoredBefore+1,'Dragging records exactly one test answer');
  }
  console.log('Identification passed');
  // Duration marks stay attached to short/long, including after position shuffling.
  await go('around/duration','#duration-cards');await mode('duration','practice');await page.locator('.demo-glove').waitFor();assert.equal(await page.locator('.practice-covered').count(),0);await page.waitForFunction(()=>document.querySelector('.duration-card.matched.cue'));await page.screenshot({path:'/private/tmp/rehab-duration-model.png'});
  await ready('#duration-cards button');await mode('duration','test');let lastPosition=null;
  for(let i=0;i<10;i++){
   await ready('#duration-cards button');const type=await page.evaluate(()=>audioLog.at(-1).includes('/long/')?'long':'short');
   const styles=await page.locator('#duration-cards button').evaluateAll(nodes=>nodes.map(node=>({type:node.dataset.duration,stripe:getComputedStyle(node.querySelector('.duration-stripe')).backgroundColor,dot:getComputedStyle(node.querySelector('.duration-dot')).backgroundColor})));
   for(const row of styles){assert.equal(row.stripe,row.dot);assert.equal(row.stripe,row.type==='short'?'rgb(228, 181, 55)':'rgb(41, 155, 208)');}
   const position=styles.findIndex(row=>row.type===type);if(lastPosition!==null)assert.notEqual(position,lastPosition);lastPosition=position;
   assert.equal(await page.locator('#sound-progress').getAttribute('data-duration'),type);await page.locator(`#duration-cards [data-duration="${type}"]`).click();await page.locator('#answer-feedback.correct').waitFor();
  }
  await page.locator('#session-again').waitFor();assert.equal(await page.locator('.result-metric').innerText(),'10 / 10');
  console.log('Duration passed');
  // All pairs are modelled together before any memory response can be scored.
  await go('around/memory','[data-size="6"]');await page.locator('[data-size="6"]').click();await page.locator('#session-countdown[open]').waitFor();assert.equal(await page.locator('.memory-grid button:enabled').count(),0);
  await page.waitForFunction(()=>document.querySelectorAll('.memory-grid .hidden-face').length===6);assert.equal(new Set(await page.evaluate(()=>modelPairs)).size,3);assert.deepEqual((await page.evaluate(()=>countSteps)).slice(-3),['1','2','3']);
  const pairs=await page.locator('.memory-grid button').evaluateAll(nodes=>{const pairs={};nodes.forEach(node=>(pairs[node.dataset.sound]??=[]).push(node.dataset.index));return Object.values(pairs);});
  const memoryBefore=(await records()).filter(r=>r.skill==='memory'&&r.kind==='assessment').length;assert.equal(memoryBefore,0);
  for(const pair of pairs){for(const index of pair)await page.locator(`.memory-grid [data-index="${index}"]`).click();}
  assert.equal((await records()).filter(r=>r.skill==='memory'&&r.kind==='assessment').length,3);await go('around/library','.pitch-library');
  console.log('Memory passed');
  // Three colored pitch columns fit without page scrolling. Page controls keep small-screen targets usable.
  for(const viewport of [{width:1280,height:800},{width:390,height:844},{width:320,height:480},{width:844,height:390},{width:568,height:320}]){
   console.log('Library layout',viewport);await page.setViewportSize(viewport);await page.waitForTimeout(100);let safety=0;while(await page.locator('#pitch-prev').isEnabled())await page.locator('#pitch-prev').click();const seen=new Set();
   do{assert.ok(safety++<30,'Pagination terminates');await fit();(await page.locator('.pitch-grid [data-sound]').evaluateAll(nodes=>nodes.map(node=>node.dataset.sound))).forEach(id=>seen.add(id));if(await page.locator('#pitch-next').isDisabled())break;await page.locator('#pitch-next').click();}while(true);
   assert.equal(seen.size,50,'All 50 sounds remain available');assert.equal(await page.locator('.pitch-column').count(),3);
  }
  await page.setViewportSize({width:1280,height:800});await page.waitForTimeout(100);await page.screenshot({path:'/private/tmp/rehab-pitch-library.png'});
  // Active game layouts retain the viewport fit after adding timelines and ear animation.
  for(const viewport of [{width:320,height:480},{width:390,height:844},{width:844,height:390},{width:568,height:320}]){
   await page.setViewportSize(viewport);await go('around/duration','#duration-cards');await fit();
   await go('around/identification','#open-set');await page.locator('#open-set').click();await page.locator('.answer-grid').waitFor();await fit();
   await go('around/memory','[data-size="12"]');await page.locator('[data-size="12"]').click();await fit();
   await go('around/detection','#sudden');await page.locator('#sudden').click();await ready('#heard');await fit();
  }
  await page.setViewportSize({width:1280,height:800});
  // Visual report agrees with actual records and preserves unrelated learning data.
  await go('home','.app-home-action');await page.locator('[data-suite-control=report]:visible').click();await page.locator('#sound-report[open]').waitFor();assert.equal(await page.locator('.sound-score-ring').count(),1);assert.ok(await page.locator('.sound-skill-charts article').count()>=4);await page.locator('#sound-report').evaluate(node=>node.getAnimations().forEach(animation=>animation.finish()));await page.screenshot({path:'/private/tmp/rehab-visual-report.png'});await page.setViewportSize({width:390,height:844});assert.ok(await page.locator('#sound-report').evaluate(node=>node.scrollWidth<=node.clientWidth));await page.screenshot({path:'/private/tmp/rehab-visual-report-mobile.png'});await page.keyboard.press('Escape');await page.setViewportSize({width:1280,height:800});
  assert.deepEqual(await page.evaluate(()=>({words:SoundProgress.active().words,senb:SoundProgress.active().senb,taffaha:SoundProgress.active().taffaha})),{words:{keep:true},senb:{mastery:{keep:true}},taffaha:{attempts:[{keep:true}]}});
  await page.locator('[data-suite-control=profile]:visible').click();await solveParentGate(page);assert.equal(await page.locator('#sound-profile [data-account-id=hamada-admin]').count(),0);await page.locator('#sound-child-name').fill('Hamada');await page.locator('#sound-profile [type=submit]').click();assert.equal(await page.evaluate(()=>SoundProgress.isAdmin()),true);assert.equal(await page.locator('[data-suite-apps],[data-suite-app]').count(),0);
  // Navigation cancels an in-flight memory model and its countdown.
  await go('around/memory','[data-size="4"]');await page.locator('[data-size="4"]').click();await page.locator('#session-countdown[open]').waitFor();await page.evaluate(()=>location.hash='/home');await page.locator('.app-home-action').first().waitFor();await page.waitForTimeout(300);assert.equal(await page.locator('#session-countdown[open],.demo-glove,.demo-ghost').count(),0);
  assert.deepEqual(errors,[]);await context.close();console.log('PASS: auditory detection tick/cross and early responses, all identification/discrimination models and sandbox feedback, live drag responses, duration cues and shuffling, complete automatic memory preview, pitch library layouts, graphical reports, typed Hamada access and cancellation.');
 }catch(error){await page?.screenshot({path:'/private/tmp/rehab-interactions-error.png',fullPage:true}).catch(()=>{});throw error;}
 finally{server.closeAllConnections();server.close();await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.closeAllConnections();server.close();});
