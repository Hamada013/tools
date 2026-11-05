const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(process.env.SENB_PLAYWRIGHT||path.resolve(__dirname,'../VSS/voc/node_modules/playwright'));
const root=path.resolve(__dirname,'../..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.m4a':'audio/mp4','.json':'application/json'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(error,bytes)=>{if(error){res.writeHead(404).end();return;}if(file.endsWith('/index.html'))bytes=Buffer.from(bytes.toString().replace(/<link[^>]+(?:googleapis|gstatic)[^>]*>/g,''));res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(bytes);});});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const engine=process.env.SENB_ENGINE==='webkit'?webkit:chromium;
 const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});await context.route('https://**',route=>route.abort());
  await context.addInitScript(()=>{
   if(!localStorage.getItem('voc-children-v1'))localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'dynamic',children:[{id:'dynamic',name:'نور',words:{},sessions:[]}]}));
   window.nativePlay=HTMLMediaElement.prototype.play;window.nativePause=HTMLMediaElement.prototype.pause;
   window.events=[];HTMLMediaElement.prototype.play=function(){if(window.denyAudio){window.denyAudio=false;return Promise.reject(new DOMException('Gesture','NotAllowedError'));}events.push({kind:'audio',src:this.src});clearTimeout(this.qaTimer);this.qaTimer=setTimeout(()=>this.dispatchEvent(new Event('ended')),30);return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){clearTimeout(this.qaTimer);};
   document.addEventListener('DOMContentLoaded',()=>new MutationObserver(changes=>{for(const change of changes)for(const node of change.addedNodes)if(node.nodeType===1){if(node.matches('.session-finger'))events.push({kind:'hand'});const count=node.matches('.session-count')?node:node.querySelector('.session-count');if(count)events.push({kind:'count',value:count.textContent});}}).observe(document.body,{childList:true,subtree:true}));
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(20000);
  await page.goto(`http://127.0.0.1:${server.address().port}/tools/VSS/senb/index.html`,{waitUntil:'domcontentloaded'});
  for(const appId of ['voc','senb']){
   await page.goto(`http://127.0.0.1:${server.address().port}/tools/VSS/${appId}/index.html`,{waitUntil:'domcontentloaded'});
   await page.evaluate(id=>id==='voc'?app.switchView('workplace'):navigateTo('workplace'),appId);
   const header=appId==='voc'?'#workplace-view > header':'.app-header';
   await page.locator(`${header} [data-suite-menu]`).click();
   await page.locator(appId==='voc'?'.workspace-container':'#workplaceView').click({position:{x:2,y:2}});
   assert.equal(await page.locator('#suite-activity-menu').isVisible(),false);
   await page.locator(`${header} [data-suite-menu]`).click();
   await page.locator('#suite-activity-menu button').nth(1).click();
   assert.equal(await page.locator('#suite-activity-menu').isVisible(),false);
   await page.locator(`${header} [data-suite-menu]`).click();
   await page.locator(`${header} [data-suite-menu]`).click();
   assert.equal(await page.locator('#suite-activity-menu').isVisible(),false);
   await page.locator(`${header} [data-suite-settings]`).click();
   await page.locator(appId==='voc'?'.workspace-container':'#workplaceView').click({position:{x:2,y:2}});
   assert.equal(await page.locator('#suite-workplace-settings').isVisible(),false);
   await page.locator(`${header} [data-suite-settings]`).click();
   if(appId==='senb'){await page.locator(`${header} [data-suite-settings]`).click();continue;}
   await page.evaluate(()=>{
    app.state.slotsData[0].item=CATEGORIES[0].items[0];app.renderSlotsContent();
    window.players=new Set();window.prompts=[];
    HTMLMediaElement.prototype.play=function(){
     if(this.src.startsWith('data:audio/')){players.add(this);return Promise.resolve();}
     if(!players.has(this))return Promise.reject(new DOMException('Not primed','NotAllowedError'));
     if(window.failPrompt){window.failPrompt=false;return Promise.reject(new Error('Media failure'));}
     prompts.push(this.src);return Promise.resolve();
    };
   });
   for(const mode of ['practice','test']){
    await page.locator(`#btn-${mode}`).click();
    await page.waitForFunction(()=>prompts.length>0);
    assert.equal(await page.locator('#suite-workplace-settings').isVisible(),false);
    assert.equal(await page.evaluate(()=>players.size),1,'One player survives mode changes');
    await page.evaluate(()=>{app.exitTestMode(false);prompts=[];});
    await page.locator(`${header} [data-suite-settings]`).click();
   }
   await page.locator('#btn-test').click();await page.waitForFunction(()=>prompts.length>0);
   await page.evaluate(()=>{window.failPrompt=true;app.replayPromptSound();});
   await page.getByText('تعذّر تشغيل الصوت. اضغط إعادة الصوت للمحاولة مجدداً.',{exact:true}).waitFor();
   const before=await page.evaluate(()=>prompts.length);await page.locator(`${header} [data-suite-settings]`).click();await page.locator('#btn-replay-sound').click();
   await page.waitForFunction(n=>prompts.length>n,before);
   await page.evaluate(()=>app.exitTestMode(false));
   for(const width of [390,1280]){
    await page.setViewportSize({width,height:844});
    const layout=await page.locator(header).evaluate(el=>{const rect=s=>{const r=el.querySelector(s).getBoundingClientRect();return {x:r.x,width:r.width};};return {stars:rect('#stars-container'),settings:rect('[data-suite-settings]'),menu:rect('[data-suite-menu]'),apps:rect('[data-suite-apps]')};});
    assert.ok(layout.settings.x<30);
    assert.ok(Math.abs(layout.stars.x+layout.stars.width/2-width/2)<2);
    assert.ok(layout.apps.x-layout.settings.x<120);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   }
   await page.screenshot({path:'/private/tmp/voc-centered-header.png'});
   // Also exercise the actual media implementation, after a fresh page load.
   await page.reload({waitUntil:'domcontentloaded'});
   await page.evaluate(()=>{HTMLMediaElement.prototype.play=nativePlay;HTMLMediaElement.prototype.pause=nativePause;app.switchView('workplace');app.state.slotsData[0].item=CATEGORIES[0].items[0];app.renderSlotsContent();});
   await page.locator(`${header} [data-suite-settings]`).click();
   await page.locator('#btn-practice').click();
   await page.waitForFunction(()=>app.cardAudio && !app.cardAudio.paused && app.cardAudio.currentTime>0,{},{timeout:15000});
   await page.evaluate(()=>app.exitTestMode(false));

  }
  assert.deepEqual(errors,[]);console.log('PASS: dismissable lists, first-attempt primed audio, recovery, left controls and centered stars.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{server.closeAllConnections();server.close();});
