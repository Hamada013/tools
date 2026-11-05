// Standalone hosting, real media, independent offline caches, updates and old links.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const{chromium}=require(process.env.SOUNDS_PLAYWRIGHT||require.resolve('playwright',{paths:[path.resolve(__dirname,'../arabicsounds'),path.resolve(__dirname,'../auditory-rehabilitation')]}));
const root=path.resolve(__dirname,'../..'),apps=['arabicsounds','auditory-rehabilitation'],releases={},overrides=new Map(),requests=[];
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.m4a':'audio/mp4','.woff2':'font/woff2','.txt':'text/plain'};
const sha=body=>crypto.createHash('sha256').update(body).digest('hex');
for(const app of apps){const ctx={};vm.runInNewContext(fs.readFileSync(path.join(root,'tools',app,'assets/release-worker.js'),'utf8')+';this.release=RELEASE;',ctx);releases[app]=JSON.parse(JSON.stringify(ctx.release));}
let corruptNext=false,oldAswati=false;
const legacy=new Map([
 ['index.html',Buffer.from('<!doctype html><html lang="ar" dir="rtl"><body><main>أصواتي</main><script>navigator.serviceWorker.register("./sw.js",{scope:"./",updateViaCache:"none"});</script></body></html>')],
 ['sw.js',Buffer.from("const CACHE='aswati-shell-legacy-fixture';self.addEventListener('install',e=>e.waitUntil((async()=>{await(await caches.open(CACHE)).add('index.html');await self.skipWaiting();})()));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(e.request.mode==='navigate')e.respondWith(caches.open(CACHE).then(cache=>cache.match('index.html')));});")]
]);
const server=http.createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const match=pathname.match(/^\/(standalone|tools)\/([^/]+)\/(.*)$/);if(!match)return res.writeHead(404).end();
 const[,mode,app,relative]=match,file=relative||'index.html';if(file.split('/').includes('..'))return res.writeHead(403).end();
 requests.push({mode,app,file});let body;
 if(mode==='tools'&&app==='aswati'&&oldAswati&&legacy.has(file))body=legacy.get(file);
 else if(file==='assets/release-worker.js'&&releases[app])body=Buffer.from('const RELEASE='+JSON.stringify(releases[app])+';');
 else body=overrides.get(app+'/'+file)||await fs.promises.readFile(path.join(root,'tools',app,file));
 if(corruptNext&&mode==='standalone'&&/^(images|sounds)\/\d+\./.test(file)){corruptNext=false;body=Buffer.from('corrupt file fixture');}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
}catch{res.writeHead(404).end();}});
async function rpc(page,type){return page.evaluate(async type=>(await import('./assets/pwa.js')).request(type),type);}
(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
try{
 browser=await chromium.launch({headless:true,channel:'chrome'});
 const origin=`http://127.0.0.1:${server.address().port}`;
 for(const app of process.env.SOUNDS_MIGRATION_ONLY?[]:apps.filter(app=>!process.env.SOUNDS_APP||app===process.env.SOUNDS_APP)){
  const kind=app==='arabicsounds'?'arabic':'around',total=kind==='arabic'?62:200,context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage(),errors=[],foreign=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{const url=new URL(request.url());if(!url.pathname.startsWith('/standalone/'+app+'/')&&url.pathname!=='/favicon.ico')foreign.push(url.pathname);});
  await page.addInitScript(app=>{localStorage.setItem(`${app}-children-v1`,JSON.stringify({schema:1,active:'qa-sounds',children:[{id:'qa-sounds',name:'اختبار',role:'child',apps:{},words:{}}]}));window.finishedAudio=0;const Context=window.AudioContext||window.webkitAudioContext;if(Context){const create=Context.prototype.createBufferSource;Context.prototype.createBufferSource=function(...args){const node=create.apply(this,args);node.addEventListener('ended',()=>{if(node.buffer?.length>1)window.finishedAudio++;},{once:true});return node;};}const native=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){this.addEventListener('ended',()=>window.finishedAudio++,{once:true});return native.call(this);};},app);
  const url=`${origin}/standalone/${app}/index.html`;await page.goto(url);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await page.waitForFunction(()=>!document.getElementById('offline-download').disabled);
  assert.equal(await page.locator('.app-home-action').count(),5);assert.equal(await page.locator('[data-suite-apps],[data-report-app]').count(),0,'No cross-app navigation');assert.equal(await page.locator('#menu-toggle:visible,#home-link:visible').count(),0);
  const cdp=await context.newCDPSession(page);const installability=await cdp.send('Page.getInstallabilityErrors');assert.deepEqual(installability.installabilityErrors.filter(error=>error.errorId!=='in-incognito'),[],'Chromium installation requirements (test contexts are incognito)');await cdp.detach();
  assert.equal((await rpc(page,'STATUS')).count,0,'Startup does not bulk-download media');
  for(const[width,height]of[[320,568],[390,844],[844,390],[768,1024],[1280,640]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(width>=768&&height>=600)assert(await page.locator('main').evaluate(main=>main.scrollHeight<=main.clientHeight+1));
   await page.screenshot({path:`/tmp/${app}-${width}-home.png`});
  }
  await page.setViewportSize({width:390,height:844});await page.locator('[data-sound-download]').click();
  assert.equal(await page.locator('#install-dialog button').count(),3);assert.equal(await page.locator('#offline-download').textContent(),'تنزيل');assert.equal(await page.locator('#offline-progress').getAttribute('max'),'100');
  corruptNext=true;await page.locator('#offline-download').click();await page.waitForFunction(()=>!document.getElementById('offline-download').disabled);
  assert(await page.locator('#offline-error').isVisible());assert((await rpc(page,'STATUS')).count<total,'Corrupt files are not counted');
  await page.locator('#offline-download').click();await page.waitForFunction(()=>document.getElementById('offline-status').textContent==='100%',null,{timeout:60000});
  assert.equal((await rpc(page,'STATUS')).count,total);assert(await page.locator('#offline-error').isHidden());await page.screenshot({path:`/tmp/${app}-download.png`});await page.keyboard.press('Escape');
  const decoded=await page.evaluate(async()=>{const{MEDIA}=await import('./assets/release.js');const files=MEDIA.filter(entry=>entry.url.endsWith('.m4a'));const results=[];let next=0;await Promise.all(Array.from({length:6},async()=>{while(next<files.length){const{url}=files[next++];const audio=new Audio();results.push(await new Promise(resolve=>{const timer=setTimeout(()=>resolve({url,error:'timeout'}),15000);audio.onloadedmetadata=()=>{clearTimeout(timer);resolve({url,duration:audio.duration});audio.removeAttribute('src');audio.load();};audio.onerror=()=>{clearTimeout(timer);resolve({url,error:'decode'});};audio.src=url;}));}}));return results;});
  assert(decoded.every(entry=>entry.duration>0),JSON.stringify(decoded.filter(entry=>!entry.duration)));
  if(kind==='arabic'){await page.evaluate(()=>location.hash='/arabic/sounds');await page.waitForFunction(()=>document.querySelectorAll('#selection img').length===31&&[...document.querySelectorAll('#selection img')].every(img=>img.complete&&img.naturalWidth>0));}
  await page.evaluate(kind=>location.hash='/'+kind+(kind==='arabic'?'/pair':'/library'),kind);await page.locator('.picture').first().waitFor();
  assert(await page.locator('#install').isHidden(),'Download icon appears only on home');
  await page.locator('[data-suite-menu]').click();assert(await page.locator('#suite-activity-menu').isVisible());await page.keyboard.press('Escape');
  await context.setOffline(true);await page.reload();await page.locator('.picture img').first().waitFor();await page.waitForFunction(()=>[...document.querySelectorAll('.picture img')].every(img=>img.complete&&img.naturalWidth>0));
  await page.locator('.picture').first().click();await page.waitForFunction(()=>window.finishedAudio>0,null,{timeout:45000});
  const range=await page.evaluate(async()=>{const response=await fetch('sounds/1.m4a',{headers:{Range:'bytes=0-31'}});return[response.status,(await response.arrayBuffer()).byteLength];});assert.deepEqual(range,[206,32]);
  await context.setOffline(false);await page.evaluate(()=>location.hash='/home');await page.locator('.app-home-action').first().waitFor();
  const css='assets/home.css',body=Buffer.concat([fs.readFileSync(path.join(root,'tools',app,css)),Buffer.from('\n/* published update fixture */\n')]);overrides.set(app+'/'+css,body);
  releases[app].version+='-updated';releases[app].shell.find(entry=>entry.url===css).sha=sha(body);releases[app].shell.find(entry=>entry.url===css).bytes=body.length;
  await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration()).update();});await page.locator('.app-update-dialog').waitFor({state:'visible'});
  await page.locator('[data-update-later]').click();assert(await page.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting));await page.reload();await page.locator('.app-update-dialog').waitFor({state:'visible'});
  await Promise.all([page.waitForEvent('load'),page.locator('[data-update-accept]').click()]);await page.waitForFunction(()=>document.querySelectorAll('.app-home-action').length===5);
  assert.equal((await rpc(page,'STATUS')).count,total);assert.equal((await rpc(page,'STATUS')).version,releases[app].version);
  assert.deepEqual(errors,[]);assert.deepEqual(foreign,[],'Standalone app never requests a sibling app');await context.close();
  console.log(`PASS ${app}: five home actions, responsive layouts, own ${total} media files, integrity rejection/retry, all ${decoded.length} native audio decoders, real offline images/audio/ranges, deferred and accepted updates.`);
 }
 // Both installed apps can be open on the same origin without sharing accounts.
 const isolated=await browser.newContext(),one=await isolated.newPage(),two=await isolated.newPage();
 await one.goto(`${origin}/standalone/arabicsounds/index.html`);await one.waitForFunction(()=>!!window.SoundProgress);
 await one.evaluate(()=>{SoundProgress.add('العربية فقط');document.querySelector('#sound-profile')?.close();SoundProgress.record({label:'م',kind:'practice'});});
 await two.goto(`${origin}/standalone/auditory-rehabilitation/index.html`);await two.waitForFunction(()=>!!window.SoundProgress);
 assert.equal(await two.evaluate(()=>SoundProgress.active()),null,'A new app requires its own account');
 await two.evaluate(()=>{SoundProgress.add('من حولي فقط');document.querySelector('#sound-profile')?.close();});
 assert.equal(await one.evaluate(()=>SoundProgress.active().name),'العربية فقط');
 assert.equal(await two.evaluate(()=>SoundProgress.report().sessions.length),0);
 await one.reload();await one.waitForFunction(()=>!!window.SoundProgress);assert.equal(await one.evaluate(()=>SoundProgress.active().name),'العربية فقط');
 await one.evaluate(()=>{window.installCalls=0;const event=new Event('beforeinstallprompt',{cancelable:true});event.prompt=async()=>{window.installCalls++;};event.userChoice=Promise.resolve({outcome:'accepted'});window.dispatchEvent(event);document.querySelector('#install').click();});
 await one.locator('#install-app').click();assert.equal(await one.evaluate(()=>window.installCalls),1);
 await one.evaluate(()=>window.dispatchEvent(new Event('appinstalled')));assert(await one.locator('#install-app').isHidden());
 await isolated.close();console.log('PASS: two same-origin apps keep separate accounts and reports after reload; install control invokes the browser prompt.');
 const context=await browser.newContext(),page=await context.newPage();
 const aliases={arabicsounds:['matching','memory'],'auditory-rehabilitation':['detection','discrimination','duration','identification','memory']};
 for(const[app,names]of process.env.SOUNDS_MIGRATION_ONLY?[]:Object.entries(aliases))for(const name of names){await page.goto(`${origin}/tools/${app}/${name}.html`);await page.waitForURL(`${origin}/tools/${app}/index.html#/${app==='arabicsounds'?'arabic':'around'}/${name}`);assert(await page.locator('main').textContent());}
 for(const[kind,app]of process.env.SOUNDS_MIGRATION_ONLY?[]:[['arabic','arabicsounds'],['around','auditory-rehabilitation']]){await page.goto(`${origin}/tools/aswati/index.html#/${kind}/memory`);await page.waitForURL(`${origin}/tools/${app}/index.html#/${kind}/memory`);await page.locator('[data-size="4"]').waitFor();}
 await context.close();
 // Upgrade an already-installed combined app, including a saved deep link.
 oldAswati=true;const oldContext=await browser.newContext(),oldPage=await oldContext.newPage();await oldPage.goto(`${origin}/tools/aswati/index.html#/arabic/sounds`);await oldPage.waitForFunction(()=>!!navigator.serviceWorker.controller);oldAswati=false;
 await oldPage.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration()).update();});await oldPage.waitForURL(`${origin}/tools/arabicsounds/index.html#/arabic/sounds`,{timeout:30000});await oldPage.locator('#open-pair').waitFor();await oldContext.close();
 console.log('PASS: legacy activity URLs, old Aswati deep links and installed combined-app migration.');
}finally{await browser?.close();await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});}})().catch(error=>{console.error(error);process.exitCode=1;});
