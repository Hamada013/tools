const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.APP_PLAYWRIGHT||path.resolve(__dirname,'../VSS/voc/node_modules/playwright'));
const {solveParentGate}=require('./solve-parent-gate.cjs');
const root=path.resolve(__dirname,'../..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json','.woff2':'font/woff2','.m4a':'audio/mp4'};
const server=http.createServer((req,res)=>{let relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(relative.endsWith('/'))relative+='index.html';const file=path.resolve(root,'.'+relative);if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(error,body)=>{if(error)return res.writeHead(404).end();res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(body);});});
const apps=[['voc','VocProgress'],['senb','SenbProgress'],['taffaha','TaffahaProgress']];
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const engine=process.env.APP_ENGINE==='webkit'?webkit:chromium;
 const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});let page;
 const errors=[];
 async function context(options={}){const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'no-preference',...options});await context.route('https://**',route=>route.abort());return context;}
 const base=`http://127.0.0.1:${server.address().port}/tools/VSS/`;
 const account=()=>({schema:1,active:'ali',children:[{id:'ali',name:'علي',role:'child',apps:{voc:true,senb:true,taffaha:true},words:{keep:{receptive:true}},sessions:[],senb:{sessions:[],mastery:{keep:true}},taffaha:{attempts:[]}}]});
 try{
  for(const [app,api]of apps){
   const ctx=await context();await ctx.addInitScript(()=>{
    window.welcomeLetters=[];window.welcomeLogo=null;new MutationObserver(changes=>{for(const change of changes){const node=change.target.nodeType===3?change.target.parentElement:change.target;if(node.matches?.('[data-welcome-word]')&&node.textContent)welcomeLetters.push(node.textContent);if(node.id==='suite-welcome'&&node.dataset.phase==='logo'){const capture=()=>{if(node.dataset.phase!=='logo')return;const style=getComputedStyle(node.querySelector('img'));if(style.animationName==='none'){requestAnimationFrame(capture);return;}welcomeLogo={phase:node.dataset.phase,fit:style.objectFit,animation:style.animationName,formHidden:node.querySelector('form').hidden};};requestAnimationFrame(capture);}}}).observe(document,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-phase']});
   });
   page=await ctx.newPage();page.setDefaultTimeout(12000);page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+app+'/index.html',{waitUntil:'domcontentloaded'});const welcome=page.locator('#suite-welcome');await welcome.waitFor();
   await page.waitForFunction(()=>window.welcomeLogo);assert.deepEqual(await page.evaluate(()=>welcomeLogo),{phase:'logo',fit:'contain',animation:'suite-welcome-logo',formHidden:true});
   await page.keyboard.press('Escape');assert.equal(await welcome.evaluate(node=>node.open),true,'An account-free launch cannot bypass child entry');
   await welcome.locator('input').waitFor({state:'visible'});assert.equal(await welcome.locator('[data-welcome-word]').innerText(),'مرحبا');
   const letters=await page.evaluate(()=>welcomeLetters);for(const text of ['م','مر','مرح','مرحب','مرحبا'])assert.ok(letters.includes(text),'Greeting types letter by letter');
   assert.equal(await welcome.locator('input').evaluate(node=>node===document.activeElement),true,'Name entry has keyboard focus after the greeting');
   for(const viewport of [{width:320,height:480},{width:390,height:844},{width:844,height:390}]){
    await page.setViewportSize(viewport);const geometry=await welcome.locator('input,button').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height};}));
    assert.ok(geometry.every(rect=>rect.left>=0&&rect.right<=viewport.width&&rect.width>=44&&rect.height>=44),`${app}: name controls fit portrait and landscape`);
   }
   await page.setViewportSize({width:390,height:844});await page.screenshot({path:`/private/tmp/${app}-welcome-name-${process.env.APP_ENGINE||'chromium'}.png`});
   await welcome.locator('input').fill('   ');await welcome.locator('button').click();assert.equal(await welcome.locator('[role=alert]').isVisible(),true);assert.equal(await page.evaluate(api=>window[api].active(),api),null);
   await welcome.locator('input').fill('  لَيان   أحمد  ');
   if(app==='taffaha')await welcome.locator('button').click();else await Promise.all([page.waitForEvent('domcontentloaded'),welcome.locator('button').click()]);
   await page.waitForFunction(api=>window[api]?.active()?.name==='لَيان أحمد',api);
   assert.equal(await page.evaluate(()=>SuiteWelcome.pending),false,'Creating an account never starts a second introduction');assert.equal(await welcome.count(),0);
   assert.equal(await page.evaluate(api=>window[api].children().filter(child=>child.role!=='admin').length,api),1,'One submission creates one child');
   const id=await page.evaluate(api=>window[api].active().id,api);
   // Reload is a fresh direct opening, but never asks the saved child to create an account again.
   await page.reload({waitUntil:'domcontentloaded'});await welcome.waitFor();await page.waitForFunction(()=>!SuiteWelcome.pending);assert.equal(await welcome.count(),0);assert.equal(await page.evaluate(api=>window[api].active().id,api),id);
   const direct=await ctx.newPage();await direct.goto(base+app+'/index.html',{waitUntil:'domcontentloaded'});await direct.locator('#suite-welcome').waitFor();await direct.waitForFunction(()=>!SuiteWelcome.pending);assert.equal(await direct.locator('#suite-welcome-name').count(),0,'A direct new tab welcomes an existing child without asking for a name');await direct.close();
   await ctx.close();console.log('PASS '+app+': animated logo, typed greeting, protected name entry, responsive form, account creation, no reload loop and returning-user launches.');
  }
  // The actual 1-2-3 picker transition must never stack another startup animation.
  const linked=await context();await linked.addInitScript(data=>{if(!localStorage.getItem('voc-children-v1'))localStorage.setItem('voc-children-v1',JSON.stringify(data));},account());
  page=await linked.newPage();page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));await page.goto(base+'voc/index.html');await page.waitForFunction(()=>!SuiteWelcome.pending);
  for(const [destination,api]of [apps[1],apps[2],apps[0]]){
   await page.locator('[data-suite-apps]:visible').click();await page.locator(`[data-suite-app="${destination}"]`).click();await page.locator('#suite-transition[open]').waitFor();
   await page.waitForURL(base+destination+'/index.html');await page.waitForFunction(api=>window[api]?.active(),api);
   assert.equal(await page.evaluate(()=>SuiteWelcome.pending),false);assert.equal(await page.locator('#suite-welcome').count(),0);assert.equal(await page.evaluate(api=>window[api].active().id,api),'ali');
  }
  assert.deepEqual(await page.evaluate(()=>({words:VocProgress.active().words,senb:VocProgress.active().senb.mastery,taffaha:VocProgress.active().taffaha.attempts})),{words:{keep:{receptive:true}},senb:{keep:true},taffaha:[]},'App transitions preserve learning data');
  await linked.close();
  // Slow logo delivery cannot consume the animation before the image is ready.
  const slow=await context({reducedMotion:'reduce'});await slow.addInitScript(data=>localStorage.setItem('voc-children-v1',JSON.stringify(data)),account());
  let releaseLogo;const logoGate=new Promise(resolve=>releaseLogo=resolve);
  await slow.route('**/tools/VSS/voc/images/logo.webp',async route=>{await logoGate;await route.continue();});
  page=await slow.newPage();await page.goto(base+'voc/index.html',{waitUntil:'domcontentloaded'});
  try{await page.locator('#suite-welcome').waitFor();assert.equal(await page.locator('#suite-welcome').getAttribute('data-phase'),'loading');assert.equal(await page.locator('[data-welcome-word]').textContent(),'');}finally{releaseLogo();}
  await page.waitForFunction(()=>!SuiteWelcome.pending);await slow.close();
  // Saved children remain protected even if there is currently no active child.
  const saved=await context({reducedMotion:'reduce'});await saved.addInitScript(data=>{if(!localStorage.getItem('voc-children-v1'))localStorage.setItem('voc-children-v1',JSON.stringify({...data,active:null}));},account());
  page=await saved.newPage();await page.goto(base+'voc/index.html');await page.locator('#suite-welcome-name').waitFor({state:'visible'});await page.locator('#suite-welcome-name').fill('علي');await page.locator('#suite-welcome button').click();await page.locator('#parent-gate[open]').waitFor();await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>VocProgress.active()),null);
  await page.locator('#suite-welcome button').click();await Promise.all([page.waitForEvent('domcontentloaded'),solveParentGate(page)]);await page.waitForFunction(()=>VocProgress?.active()?.id==='ali');assert.deepEqual(await page.evaluate(()=>VocProgress.active().words),{keep:{receptive:true}});assert.equal(await page.evaluate(()=>SuiteWelcome.pending),false);await saved.close();
  // History supplies the one-shot reload marker when session storage is unavailable.
  const blocked=await context({reducedMotion:'reduce'});await blocked.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Blocked','SecurityError');}}));
  page=await blocked.newPage();await page.goto(base+'voc/index.html');await page.locator('#suite-welcome-name').waitFor({state:'visible'});assert.equal(await page.locator('#suite-welcome img').evaluate(node=>getComputedStyle(node).animationName),'none');
  await page.locator('#suite-welcome-name').fill('سارة');await Promise.all([page.waitForEvent('domcontentloaded'),page.locator('#suite-welcome button').click()]);await page.waitForFunction(()=>VocProgress?.active()?.name==='سارة');assert.equal(await page.evaluate(()=>SuiteWelcome.pending),false,'History fallback avoids reload loops without session storage');await blocked.close();
  assert.deepEqual(errors,[]);console.log('PASS: real cross-app transitions skip startup, saved progress stays intact, reduced motion works and blocked session storage retains a safe first-entry flow.');
 }catch(error){await page?.screenshot({path:'/private/tmp/welcome-browser-error.png'}).catch(()=>{});throw error;}
 finally{server.closeAllConnections();server.close();await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.closeAllConnections();server.close();});
