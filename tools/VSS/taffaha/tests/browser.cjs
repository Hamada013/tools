const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.TAFFAHA_PLAYWRIGHT||'playwright'),engine=process.env.TAFFAHA_ENGINE||'chromium';
const root=path.resolve(__dirname,'../../../..'),out='/private/tmp/taffaha-qa';fs.mkdirSync(out,{recursive:true});
const words=JSON.parse(fs.readFileSync(path.join(root,'tools/VSS/taffaha/assets/words.json'))).words;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.m4a':'audio/mp4'};
let server,browser,context,base;
async function closeServer(){if(server?.listening)await new Promise(r=>{server.close(r);server.closeAllConnections();});}
async function rpc(p,type,extra={}){return p.evaluate(async({type,extra})=>(await import('./offline.js')).rpc(type,extra),{type,extra});}
async function choose(p,word){await p.locator('#open-library').click();await p.locator(`#category-filters button[data-count="${word.syllables.length}"]`).click();await p.getByRole('button',{name:word.label,exact:true}).click();await p.waitForFunction(()=>!document.getElementById('word-image').dataset.loading&&document.getElementById('word-image').complete);assert.equal(await p.locator('#word-label').innerText(),word.label);}
(async()=>{
 server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');if(u.pathname.includes('missing-slow'))await new Promise(r=>setTimeout(r,250));const f=path.resolve(root,'.'+decodeURIComponent(u.pathname.endsWith('/')?u.pathname+'index.html':u.pathname));if(!f.startsWith(root+path.sep))return res.writeHead(403).end();const bytes=await fs.promises.readFile(f);res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'}).end(bytes);}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}/tools/VSS/taffaha/`;
 try{
  browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
  context=await browser.newContext({viewport:{width:390,height:844}});let p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  // Legacy divisions must not shrink or move cards between the curated groups.
  await require('./profile-fixture.cjs')(context);
  await p.addInitScript(()=>localStorage.setItem('taffaha-preferences',JSON.stringify({lastWord:'voc-6-1',segments:{'voc-6-1':['تفاحة']},pace:250})));
  await p.goto(base+'#practice');await p.waitForFunction(()=>document.querySelectorAll('.syllable-circle').length===3);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  assert.equal(await p.locator('#toggle-recording,.record-button,#recording-bar,#stop-audio,#save-copy').count(),0);
  assert.equal(await p.getByText('لنقلها معًا!',{exact:true}).count(),0);assert.equal(await p.getByText('مقطع… مقطع',{exact:true}).count(),0);
  assert.equal(await p.locator('.sequence-controls,.icon-action#original,.icon-action#sequence').count(),0);
  assert.equal(await p.locator('#original img').count(),1);assert.equal(await p.locator('#sequence svg').count(),0);
  for(const id of ['previous','next','random']){assert.equal(await p.locator('#'+id).innerText(),'');assert.equal(await p.locator('#'+id+' svg').count(),1);}
  for(const word of words){
   await choose(p,word);const src=new URL(await p.locator('#word-image').getAttribute('src'));
   assert.ok(decodeURIComponent(src.pathname).endsWith('/'+word.image.library+'/'+word.image.path),word.label);assert.equal(src.searchParams.get('v'),word.image.revision);
   assert.ok(await p.evaluate(()=>document.getElementById('word-label').getBoundingClientRect().top>=document.getElementById('original').getBoundingClientRect().bottom+3),'The title is below the image: '+word.label);
   assert.equal(await p.locator('.syllable-circle').count(),word.syllableCount);assert.match(await p.locator('#position').innerText(),/\/ ١٥$/);
   await p.locator('#next').click();assert.equal(await p.locator('.syllable-circle').count(),word.syllableCount,'Navigation stays in group');
  }
  // All supplied whole-word audio must be real, nonempty and decodable.
  const decoded=await p.evaluate(async words=>{const context=new AudioContext(),results=[];try{for(const word of words){const u=new URL('../'+word.audio.library+'/'+word.audio.path,location.href),r=await fetch(u);if(!r.ok)throw Error(word.label+': '+r.status);const b=await context.decodeAudioData(await r.arrayBuffer());results.push({id:word.id,duration:b.duration});}}finally{await context.close();}return results;},words);
  assert.equal(decoded.length,75);assert.ok(decoded.every(r=>r.duration>.05));
  await p.evaluate(async()=>{const{loadImage}=await import('./assetsManager.js'),img=document.getElementById('word-image');loadImage(img,{library:'taffaha',path:'assets/images/missing-slow.webp'},'old');loadImage(img,{library:'taffaha',path:'assets/images/voc/6/1.webp'},'تفاحة');});await p.waitForTimeout(450);assert.ok((await p.locator('#word-image').getAttribute('src')).endsWith('/assets/images/voc/6/1.webp'));
  const apple=words.find(w=>w.label==='تفاحة'),banana=words.find(w=>w.label==='موزة');await choose(p,apple);
  await p.locator('#original').click();await p.waitForFunction(()=>!document.querySelector('.is-playing'));assert.equal(await p.locator('#status').innerText(),'');
  await choose(p,banana);if(!fs.existsSync(path.join(root,'tools/VSS/taffaha',banana.syllableAudio[0].path))){await p.locator('.syllable-circle').first().click();await p.waitForFunction(()=>document.getElementById('status').textContent.includes('غير متوفر'));assert.equal(await p.locator('.lit').count(),0);}
  const single=words.find(w=>w.syllableCount===1);await choose(p,single);
  for(const selector of ['.syllable-circle','#sequence']){await p.locator(selector).click(selector==='#sequence'?{position:{x:8,y:8}}:{});await p.waitForFunction(()=>!document.querySelector('.lit,.is-playing'));assert.equal(await p.locator('#status').innerText(),'','One-syllable playback uses existing word audio');}
  await choose(p,banana);
  // Observe positional playback separately from the files still to be recorded.
  await p.evaluate(async()=>{const {AudioEngine}=await import('./audio.js');window.calls=[];window.cancelled=0;AudioEngine.prototype.play=function(source,{signal}={}){window.calls.push({path:new URL(source).pathname,highlight:[...document.querySelectorAll('.lit')].map(n=>Number(n.dataset.index))});return new Promise((resolve,reject)=>{const finish=()=>{signal?.removeEventListener('abort',abort);resolve();},timer=setTimeout(finish,300),abort=()=>{clearTimeout(timer);window.cancelled++;reject(new DOMException('Cancelled','AbortError'));};signal?.addEventListener('abort',abort,{once:true});});};});
  await p.locator('#sequence').click({position:{x:8,y:8}});await p.waitForFunction(()=>document.getElementById('sequence').getAttribute('aria-busy')==='false');
  assert.deepEqual(await p.evaluate(()=>window.calls.map(c=>c.path)),['/tools/VSS/taffaha/assets/sounds/2/1.m4a','/tools/VSS/taffaha/assets/sounds/2/2.m4a']);assert.deepEqual(await p.evaluate(()=>window.calls.map(c=>c.highlight)),[[0],[1]]);
  const potato=words.find(w=>w.label==='بطاطا');await choose(p,potato);await p.evaluate(()=>window.calls=[]);await p.locator('#sequence').click({position:{x:8,y:8}});await p.waitForFunction(()=>document.getElementById('sequence').getAttribute('aria-busy')==='false');
  assert.deepEqual(await p.evaluate(()=>window.calls.map(c=>c.path)),potato.syllableAudio.map(a=>'/tools/VSS/taffaha/'+a.path));assert.equal(new Set(await p.evaluate(()=>window.calls.map(c=>c.path))).size,3,'Repeated طا uses distinct audio files');
  // Switching cards aborts pending playback and clears highlights.
  await p.locator('.syllable-circle').first().click();await p.locator('#next').click();await p.waitForFunction(()=>window.cancelled>0);assert.equal(await p.locator('.lit,.is-playing').count(),0);
  for(const n of [1,2,3,4,5]){await p.setViewportSize({width:320,height:740});await choose(p,words.find(w=>w.syllableCount===n));assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const ys=await p.locator('.syllable-circle').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().y));assert.ok(ys.every(y=>y===ys[0]),'Group '+n+' fits in one row');}
  await p.setViewportSize({width:390,height:844});await choose(p,apple);await p.screenshot({path:out+'/'+engine+'-mobile.png',fullPage:true});await p.setViewportSize({width:1280,height:900});await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.equal(await p.locator('header.topbar').count(),1);await p.screenshot({path:out+'/'+engine+'-desktop.png',fullPage:true});
  // Real file decoding through numbered URLs, using a known-good clip as a test fixture.
  console.log('Checked practice cards, audio and layouts.');
  const fixtureContext=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'}),fixturePage=await fixtureContext.newPage(),requests=[];
  const shortest=decoded.reduce((a,b)=>a.duration<b.duration?a:b),fixtureWord=words.find(w=>w.id===shortest.id);
  const fixtureBytes=fs.readFileSync(path.join(root,'tools',fixtureWord.audio.library,fixtureWord.audio.path));
  await require('./profile-fixture.cjs')(fixtureContext);
  await fixturePage.route('**/assets/sounds/**/*.m4a*',route=>{requests.push(new URL(route.request().url()).pathname);return route.fulfill({status:200,contentType:'audio/mp4',body:fixtureBytes});});
  await fixturePage.goto(base+'#practice');await choose(fixturePage,banana);await fixturePage.locator('#sequence').click({position:{x:8,y:8}});await fixturePage.waitForFunction(()=>document.getElementById('sequence').getAttribute('aria-busy')==='false');assert.equal(await fixturePage.locator('#status').innerText(),'');
  assert.deepEqual(requests,['/tools/VSS/taffaha/assets/sounds/2/1.m4a','/tools/VSS/taffaha/assets/sounds/2/2.m4a']);
  await fixturePage.evaluate(async()=>{const {AudioEngine}=await import('./audio.js'),b=document.createElement('button');b.id='native-audio-test';b.textContent='Native audio test';b.onclick=async()=>{try{await new AudioEngine().play(new URL('assets/sounds/2/1.m4a',location.href).href);b.dataset.result='ok';}catch(e){b.dataset.result=e.message;}};document.body.append(b);});
  await fixturePage.locator('#native-audio-test').click();await fixturePage.waitForFunction(()=>document.getElementById('native-audio-test').dataset.result);assert.equal(await fixturePage.locator('#native-audio-test').getAttribute('data-result'),'ok');await fixturePage.locator('#native-audio-test').evaluate(e=>e.remove());
  await fixturePage.screenshot({path:out+'/'+engine+'-desktop.png',fullPage:true});await fixtureContext.close();
  console.log('Checked native audio and numbered clips.');
  const legacy=await context.newPage();await legacy.addInitScript(()=>{HTMLDialogElement.prototype.showModal=undefined;HTMLDialogElement.prototype.close=undefined;});await legacy.goto(base+'#practice');await legacy.locator('#open-library').click();assert.equal(await legacy.locator('.legacy-dialog[open]').count(),1);await legacy.keyboard.press('Escape');await legacy.close();
  // Download only Taffaha media, then verify offline playback, ranges and isolation.
  await p.evaluate(()=>caches.open('taffaha-other-app-sentinel').then(c=>c.put('/sentinel',new Response('ok'))));
  await p.locator('#go-home').click();await p.locator('#open-offline').click();assert.equal(await p.locator('#offline-dialog button').count(),1);await p.screenshot({path:out+'/'+engine+'-download-popup.png'});await p.locator('#download').click();await p.waitForFunction(()=>!document.getElementById('download').disabled,null,{timeout:75000});assert.equal(await p.locator('#download-status').innerText(),'100%');await p.keyboard.press('Escape');await p.locator('#start-practice').click();
  console.log('Downloaded Taffaha assets; shutting down the server.');
  await closeServer();await p.close();p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'#practice');await p.waitForFunction(()=>document.querySelectorAll('.syllable-circle').length===3);await p.waitForFunction(()=>!document.getElementById('word-image').dataset.loading);assert.ok((await p.locator('#word-image').getAttribute('src')).includes('/taffaha/assets/images/voc/6/1.webp'));
  await p.locator('#original').click();await p.waitForFunction(()=>!document.querySelector('.is-playing'));assert.equal(await p.locator('#status').innerText(),'');
  await choose(p,single);await p.locator('#sequence').click({position:{x:8,y:8}});await p.waitForFunction(()=>!document.querySelector('.lit,.is-playing'));assert.equal(await p.locator('#status').innerText(),'','One-syllable sequence plays its source audio offline');
  await p.locator('#go-home').click();await p.locator('#start-test').click();await p.waitForFunction(()=>document.body.dataset.screen==='test');await p.locator('#open-mode').click();await p.locator('#mode-dialog [data-mode="count"]').click();
  await p.locator('#test-prompt').click();await p.waitForFunction(()=>document.getElementById('test-prompt').getAttribute('aria-busy')==='false');assert.equal(await p.locator('#status').innerText(),'');
  await p.locator('.count-answer[data-count="1"]').click();await p.waitForFunction(()=>document.getElementById('answer-feedback').hasAttribute('open'));assert.equal(await p.locator('#answer-feedback').getAttribute('data-result'),'correct');await p.waitForFunction(()=>!document.getElementById('answer-feedback').hasAttribute('open'));
  const range=await p.evaluate(async()=>{const r=await fetch('assets/sounds/2/1.m4a',{headers:{Range:'bytes=0-31'}});return[r.status,(await r.arrayBuffer()).byteLength];});assert.deepEqual(range,[206,32]);await rpc(p,'CLEAR');assert.ok(await p.evaluate(()=>caches.has('taffaha-other-app-sentinel')));assert.deepEqual(errors,[]);
  console.log(`PASS ${engine}: 75 cards/images and decoded word recordings, positional syllables, missing clips, cancellation, 320px layout, offline reopening/ranges and cache isolation.`);
 }finally{await context?.close();await browser?.close();await closeServer();}
})().catch(e=>{console.error(e);process.exitCode=1;});
