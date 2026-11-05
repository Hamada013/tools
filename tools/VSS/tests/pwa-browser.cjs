// Production worker/client with small real catalogs, or the entire media bank.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.APP_PLAYWRIGHT||'../voc/node_modules/playwright');
const root=path.resolve(__dirname,'..'),prefix='/speech-website/tools/VSS/';
const context={self:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/pwa-release.js'),'utf8'),context);
const release=JSON.parse(JSON.stringify(context.self.VSS_RELEASE));
const full=!!process.env.APP_FULL_CATALOG;
if(!full)release.media=['voc','senb','taffaha'].flatMap(module=>['.webp','.m4a'].flatMap(ext=>release.media.filter(a=>a.module===module&&a.url.endsWith(ext)).slice(0,3)));
release.version='vss-initial';
const overrides=new Map(),types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.m4a':'audio/mp4'};
let releaseGate,openGate,mediaGate,openMediaGate,failShell=true,port,browser,testingOffline=false;
const mediaRequests=new Map();
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/download-observer.html')return res.writeHead(200,{'Content-Type':'text/html'}).end('<!doctype html><title>Outside VSS</title>');
  if(!pathname.startsWith(prefix))return res.writeHead(404).end();
  let file=pathname.slice(prefix.length)||'index.html';if(file.endsWith('/'))file+='index.html';
  if(file.split('/').includes('..'))return res.writeHead(403).end();
  if(file==='voc/assets/navigation/taffaha.webp'){
   if(releaseGate)await releaseGate;
   if(failShell){failShell=false;return res.writeHead(503).end();}
  }
  if(release.media.some(asset=>asset.url===file)){
   mediaRequests.set(file,(mediaRequests.get(file)||0)+1);
   // Hold one file so leaving the app cannot race completion. Holding all six
   // would exhaust HTTP/1 connections and block the observer navigation itself.
   if(mediaGate&&file===release.media[0].url)await mediaGate;
  }
  const body=file==='assets/pwa-release.js'?Buffer.from('self.VSS_RELEASE='+JSON.stringify(release)+';'):overrides.get(file)||await fs.promises.readFile(path.join(root,file));
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
 }catch{res.writeHead(404).end();}
});
async function offline(ctx,value){
 testingOffline=value;
 if(process.env.APP_ENGINE!=='webkit')return ctx.setOffline(value);
 if(value&&server.listening)await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
 else if(!value&&!server.listening)await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
}
async function waitForAsync(check,timeout=60000){
 const deadline=Date.now()+timeout;
 while(!await check()){
  assert.ok(Date.now()<deadline,'Timed out waiting for asynchronous browser state');
  await new Promise(resolve=>setTimeout(resolve,100));
 }
}
async function leftControls(page,selector){
 const layout=await page.locator(selector).evaluate(header=>{
  const controls=[...header.querySelectorAll('[data-suite-control],.vss-icon')].filter(node=>node.getBoundingClientRect().width&&node.getBoundingClientRect().height);
  const rect=header.getBoundingClientRect();
  return {left:Math.min(...controls.map(node=>node.getBoundingClientRect().left))-rect.left,overflow:document.documentElement.scrollWidth>innerWidth};
 });
 assert.ok(layout.left>=0&&layout.left<=32,`Header controls stay on the physical left: ${JSON.stringify(layout)}`);
 assert.equal(layout.overflow,false,'No horizontal header overflow');
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));port=server.address().port;
 const base=`http://127.0.0.1:${port}${prefix}`,engine=process.env.APP_ENGINE==='webkit'?webkit:chromium;
 browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await ctx.addInitScript(()=>{
  if(!localStorage.getItem('voc-children-v1'))localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'vss-qa',children:[{id:'vss-qa',name:'اختبار VSS',words:{'1_1':{custom:'preserve'}},sessions:[],senb:{sessions:[]},taffaha:{attempts:[]}}]}));
 });
 let page=await ctx.newPage();page.setDefaultTimeout(60000);const errors=[];page.on('pageerror',e=>{
  // WebKit reports a caught worker-registration network failure as a page error
  // when this test deliberately stops the origin. Offline rendering still runs.
  if(testingOffline&&process.env.APP_ENGINE==='webkit'&&/\/sw\.js due to access control checks\.$/.test(e.message))return;
  errors.push(e.message);
 });
 if(process.env.APP_NATIVE_FETCH){
  assert.equal(engine,chromium,'Native Background Fetch permission fixture uses Chromium');
  const session=await ctx.newCDPSession(page),{targetInfo}=await session.send('Target.getTargetInfo');
  await session.send('Browser.grantPermissions',{origin:new URL(base).origin,permissions:['backgroundFetch'],browserContextId:targetInfo.browserContextId});
 }
 releaseGate=new Promise(resolve=>openGate=resolve);
 try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!window.SuiteWelcome?.pending);
  assert.equal(await page.title(),'احكي حلو');
  for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Home fits the viewport');
   assert.equal(await page.locator('.vss-activities a').count(),3);
   await leftControls(page,'.vss-header');
  }
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(200);
  await page.screenshot({path:`/private/tmp/vss-home-${process.env.APP_ENGINE||'chrome'}.png`,fullPage:true});
  // An early click waits for the whole suite shell. A failed shell can retry.
  await page.locator('[data-open-download]').click();await page.locator('[data-offline-download]').click();
  await page.locator('[data-offline-download][aria-busy=true]').waitFor();
  openGate();releaseGate=null;
  await page.locator('[data-offline-error]:visible').waitFor();
  await page.waitForFunction(()=>!document.querySelector('[data-offline-download]').disabled);
  mediaGate=new Promise(resolve=>openMediaGate=resolve);
  await page.locator('[data-offline-download]').click();
  await page.waitForFunction(()=>document.querySelector('[data-offline-card]').dataset.state==='downloading').catch(async error=>{
   console.error('Download start diagnostics',await page.evaluate(async()=>({card:document.querySelector('[data-offline-card]').outerHTML,registrations:(await navigator.serviceWorker.getRegistrations()).map(r=>({active:r.active?.state,installing:r.installing?.state,waiting:r.waiting?.state})),status:await VSSOffline.send('VSS_STATUS',{resume:false}).catch(String)})),errors);throw error;
  });
  if(process.env.APP_NATIVE_FETCH)await waitForAsync(()=>page.evaluate(async()=>!!await(await navigator.serviceWorker.getRegistration()).backgroundFetch.get('vss-offline:vss-initial')),10000);
  // Leave every VSS page. This same-origin observer has no app scripts/worker.
  // Completion here cannot be caused by a foreground page pumping batches.
  await page.goto(new URL('/download-observer.html',base).href);
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller),null);
  openMediaGate();mediaGate=null;
  await waitForAsync(()=>page.evaluate(async total=>{
   const mediaName=(await caches.keys()).find(name=>name.startsWith('vss:')&&name.endsWith(':media'));
   const stateName=(await caches.keys()).find(name=>name.startsWith('vss:')&&name.endsWith(':state'));
   if(!mediaName||!stateName)return false;
   const state=await(await caches.open(stateName)).match(new URL('__offline_state__',location.origin+'/speech-website/tools/VSS/'));
   return (await(await caches.open(mediaName)).keys()).length===total&&state&&!!(await state.json()).completedAt;
  },release.media.length),full?300000:60000).catch(async error=>{
   console.error('Background download diagnostics',{
    requests:[...mediaRequests.entries()],
    storage:await page.evaluate(async()=>Object.fromEntries(await Promise.all((await caches.keys()).map(async name=>[name,name.endsWith(':state')?await(await(await caches.open(name)).match(new URL('__offline_state__',location.origin+'/speech-website/tools/VSS/'))).text():(await(await caches.open(name)).keys()).length])))),
    workers:await Promise.all(ctx.serviceWorkers().map(worker=>worker.evaluate(async()=>JSON.stringify({wanted,downloadPending:!!downloadPromise,native:!!self.registration.backgroundFetch,error:lastError,status:await statusWithProgress()})).catch(String))),errors
   });throw error;
  });
  const savedRequests=[...mediaRequests.entries()];
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.locator('[data-offline-dialog][open] [data-offline-card][data-state=ready]').waitFor();
  assert.equal(await page.locator('[data-offline-status]').textContent(),'100%');
  assert.equal(await page.locator('[data-offline-complete]:visible').count(),1);
  assert.equal(await page.locator('[data-offline-status]').evaluate(node=>getComputedStyle(node).color),'rgb(21, 128, 61)','Completion feedback is green');
  await page.screenshot({path:`/private/tmp/vss-download-complete-${process.env.APP_ENGINE||'chrome'}.png`});
  await page.waitForFunction(()=>!document.querySelector('[data-offline-dialog]').open);
  await page.evaluate(()=>VSSOffline.sync());
  assert.equal(await page.locator('[data-offline-dialog][open]').count(),0,'Completion is acknowledged once, after display');
  assert.deepEqual([...mediaRequests.entries()],savedRequests,'Returning reuses the background download');
  await ctx.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
  await ctx.route('https://fonts.gstatic.com/**',route=>route.abort());
  assert.equal(await page.locator('[data-offline-error]:visible').count(),0);
  const registration=await page.evaluate(async()=>{const registrations=await navigator.serviceWorker.getRegistrations();return registrations.map(r=>({scope:r.scope,worker:r.active?.scriptURL}));});
  assert.deepEqual(registration,[{scope:base,worker:base+'sw.js'}]);
  for(const module of ['voc','senb','taffaha']){
   await page.goto(base+module+'/index.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.AppNavigation&&window.VSSOffline&&!window.SuiteWelcome?.pending).catch(async error=>{
    console.error('Activity startup diagnostics',module,await page.evaluate(()=>({url:location.href,navigation:!!window.AppNavigation,offline:!!window.VSSOffline,welcome:window.SuiteWelcome?.pending,account:window.VocProgress?.active?.()?.name})),errors);throw error;
   });
   assert.equal(await page.evaluate(()=>document.querySelector('link[rel=manifest]').href),base+'manifest.webmanifest');
   assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),base+'sw.js');
   assert.equal(await page.locator('[data-open-download],#pwaDownloadToggle,#open-offline,[data-logo-download]').count(),0,'Activity logos never download');
   assert.equal(await page.locator('[data-offline-dialog],#offlinePanel,#offline-dialog').count(),0,'Only the suite home has a download dialog');
   assert.equal(await page.locator('#home-title').textContent(),{voc:'كلمة',senb:'جملة',taffaha:'مقطع'}[module]);
   assert.equal((await page.evaluate(async()=>VSSOffline.send('VSS_STATUS'))).ready,true,'All apps share the complete download');
   for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1280,height:900}]){
    await page.setViewportSize(viewport);
    await leftControls(page,module==='taffaha'?'.topbar':module==='senb'?'.header-inner':'.app-home-bar');
   }
   await page.setViewportSize({width:390,height:844});
   await page.screenshot({path:`/private/tmp/vss-${module}-${process.env.APP_ENGINE||'chrome'}.png`,fullPage:true});
   if(module==='voc'){
    await page.locator('.app-home-action').first().click();
    await leftControls(page,'#workplace-view>header');
    await page.evaluate(()=>app.switchView('home'));
   }
   const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('voc-children-v1')));
   assert.equal(stored.active,'vss-qa');assert.equal(stored.children[0].words['1_1'].custom,'preserve');
  }
  // The real 1-2-3 picker stays in this window and inside the installed scope.
  await page.locator('[data-suite-apps]:visible').click();await page.locator('[data-suite-app=voc]').click();
  await page.waitForURL(base+'voc/index.html');assert.equal(ctx.pages().length,1);
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),base+'sw.js');
  await offline(ctx,true);
  for(const route of ['index.html','voc/index.html','voc/games.html','voc/matching.html','voc/memory.html','voc/rapid.html','voc/test.html','voc/report.html','senb/index.html','taffaha/index.html']){
   const response=await page.goto(base+route+'?offline=1',{waitUntil:'domcontentloaded'});assert.equal(response.status(),200,route);
  }
  // Each module's real audio remains available, including Safari byte ranges.
  for(const module of ['voc','senb','taffaha']){
   const asset=release.media.find(a=>a.module===module&&a.url.endsWith('.m4a'));
   const result=await page.evaluate(async url=>{const r=await fetch(url,{headers:{Range:'bytes=0-31'}});return {status:r.status,bytes:[...new Uint8Array(await r.arrayBuffer())],range:r.headers.get('Content-Range')};},base+asset.url);
   assert.equal(result.status,206);assert.deepEqual(result.bytes,[...fs.readFileSync(path.join(root,asset.url)).subarray(0,32)]);assert.match(result.range,/^bytes 0-31\//);
  }
  await offline(ctx,false);
  // One update replaces the full suite and reloads all open module windows.
  await page.goto(base+'index.html',{waitUntil:'domcontentloaded'});
  const second=await ctx.newPage();second.setDefaultTimeout(60000);await second.goto(base+'senb/index.html',{waitUntil:'domcontentloaded'});
  await second.waitForFunction(()=>window.AppUpdates&&window.VSSOffline);
  const before=await page.evaluate(async()=>VSSOffline.send('VSS_STATUS'));
  const changed='assets/home.css',body=Buffer.concat([fs.readFileSync(path.join(root,changed)),Buffer.from('\n/* VSS update fixture */\n')]);
  overrides.set(changed,body);release.integrity[changed]='sha256-'+crypto.createHash('sha256').update(body).digest('base64');release.version='vss-updated';
  // Also publish replacement audio so a media-only revision participates in updates.
  const clip=release.media.find(a=>a.module==='taffaha'&&a.url.endsWith('.m4a'));
  const replacement=fs.readFileSync(path.join(root,release.media.find(a=>a.module==='taffaha'&&a.url.endsWith('.m4a')&&a.url!==clip.url).url));
  overrides.set(clip.url,replacement);clip.bytes=replacement.length;clip.revision=crypto.createHash('sha256').update(replacement).digest('hex');
  await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration()).update();});
  await page.locator('#app-update-dialog[open]').waitFor();await page.locator('[data-update-later]').click();
  assert.equal((await page.evaluate(async()=>VSSOffline.send('VSS_STATUS'))).version,before.version,'Later keeps the complete previous release');
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#app-update-dialog[open]').waitFor();
  // Keep one real download pending in the old release while accepting its update.
  // This catches both a permanently disabled button and activation blocked by a
  // long old-worker message. Native transfers must survive the release handoff.
  mediaGate=new Promise(resolve=>openMediaGate=resolve);
  const deleted=await page.evaluate(async url=>{
   const name=(await caches.keys()).find(name=>name.startsWith('vss:')&&name.endsWith(':media'));
   const cache=await caches.open(name);let deleted=0;
   for(const key of await cache.keys())if(key.url.split('?')[0]===url&&await cache.delete(key))deleted++;
   return deleted;
  },new URL(release.media[0].url,base).href);
  assert.equal(deleted,1,'The pending-download fixture removes exactly one saved revision');
  // A full-catalog startup status request can predate the fixture's deletion.
  // Wait for a fresh rendered inventory before starting this download.
  await waitForAsync(()=>page.evaluate(async()=>{
   await VSSOffline.sync();const button=document.querySelector('[data-offline-download]');
   return !button.hidden&&!button.disabled;
  }));
  await page.evaluate(()=>document.querySelector('[data-offline-download]').click());
  await page.waitForFunction(()=>document.querySelector('[data-offline-download]').getAttribute('aria-busy')==='false');
  assert.equal((await page.evaluate(()=>VSSOffline.send('VSS_STATUS',{resume:false}))).wanted,true);
  assert.equal(await page.locator('[data-update-accept]').isEnabled(),true,'A pending download cannot block Update now');
  const oneReload=page.waitForEvent('domcontentloaded',{timeout:20000}),twoReload=second.waitForEvent('domcontentloaded',{timeout:20000});
  const feedback=await page.evaluate(()=>{
   const button=document.querySelector('[data-update-accept]');button.click();
   return {busy:button.getAttribute('aria-busy'),label:button.textContent,laterDisabled:document.querySelector('[data-update-later]').disabled};
  });
  assert.equal(feedback.busy,'true');assert.match(feedback.label,/جارٍ/);assert.equal(feedback.laterDisabled,true);
  await Promise.all([oneReload,twoReload]);
  openMediaGate();mediaGate=null;
  await waitForAsync(()=>page.evaluate(async()=>window.VSSOffline&&(await VSSOffline.send('VSS_STATUS')).version==='vss-updated'));
  await waitForAsync(()=>second.evaluate(async()=>window.VSSOffline&&(await VSSOffline.send('VSS_STATUS')).version==='vss-updated'));
  await waitForAsync(()=>page.evaluate(async()=>!!(await VSSOffline.send('VSS_STATUS',{resume:false})).ready),full?300000:60000);
  assert.equal((await second.evaluate(()=>VSSOffline.send('VSS_STATUS',{resume:false}))).ready,true,'The saved download resumes across the complete release');
  assert.deepEqual(await page.evaluate(async url=>[...new Uint8Array(await(await fetch(url)).arrayBuffer())],base+clip.url),[...replacement]);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('voc-children-v1')).children[0].words['1_1'].custom),'preserve');
  assert.deepEqual(errors,[]);
  await second.close();await ctx.close();
  // First use of VSS still creates the shared child account through the welcome.
  const fresh=await browser.newContext({reducedMotion:'reduce',serviceWorkers:'block'}),first=await fresh.newPage();
  await first.goto(base,{waitUntil:'domcontentloaded'});await first.locator('#suite-welcome form:not([hidden])').waitFor();
  await first.locator('#suite-welcome-name').fill('نور');await first.locator('#suite-welcome button[type=submit]').click();
  await first.waitForFunction(()=>!window.SuiteWelcome.pending);await first.locator('a[href="voc/index.html"]').click();
  await first.waitForFunction(()=>window.VocProgress?.active()?.name==='نور');assert.equal(await first.locator('#suite-welcome[open]').count(),0);
  await fresh.close();
  console.log(`PASS: VSS home, first child, early download/failure/retry, download with no VSS page open (${release.media.length} files), persistent green completion and auto-close, one worker, shared download, left headers and renamed apps, same-window switching, offline activities/audio ranges, deferred updates, immediate update feedback and activation during a pending download in two windows, changed-media reuse and saved progress.`);
 }catch(error){console.error('VSS browser failure',error,errors);throw error;}
 finally{
  openGate?.();openMediaGate?.();
  // A failed assertion must not leave an unfinished browser download holding
  // Chrome's shutdown open and hiding the useful error behind cleanup.
  await page.evaluate(async base=>{
   const manager=(await navigator.serviceWorker.getRegistration(base))?.backgroundFetch;
   for(const id of await manager?.getIds()||[])await(await manager.get(id))?.abort();
  },base).catch(()=>{});
  await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});await browser.close();
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
