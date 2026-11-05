/* Covers the actual mobile regressions: exclusive menus, standalone templates,
   logo downloads, lesson controls, pointer states, and corrected automatic answers. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(path.resolve(__dirname,'../VSS/voc/node_modules/playwright'));
const root=path.resolve(__dirname,'../..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.m4a':'audio/mp4'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(error,data)=>{if(error)return res.writeHead(404).end();res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const engine=process.env.APP_ENGINE==='webkit'?webkit:chromium,browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
 await context.addInitScript(()=>{
  if(!localStorage.getItem('voc-children-v1'))localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'ali',children:[{id:'ali',name:'علي',role:'child',apps:{voc:true,senb:true,taffaha:true},words:{},sessions:[],senb:{sessions:[]},taffaha:{attempts:[]}}]}));
  HTMLMediaElement.prototype.play=function(){clearTimeout(this.qaTimer);this.qaTimer=setTimeout(()=>this.dispatchEvent(new Event('ended')),40);return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){clearTimeout(this.qaTimer);};
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(15000);await page.route('https://**',route=>route.abort());
 const origin=`http://127.0.0.1:${server.address().port}/tools/VSS/`;
 for(const appId of ['voc','senb','taffaha']){
  await page.goto(origin+appId+'/index.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.AppNavigation&&window.SessionHomework);
  const logo=page.locator('.app-logo-download');await logo.click();const download=page.locator(appId==='voc'?'[data-offline-dialog]':appId==='senb'?'#offlinePanel':'#offline-dialog');await download.waitFor({state:'visible'});await page.keyboard.press('Escape');
  await page.locator('[data-logo-download]').click();await download.waitFor({state:'visible'});await page.keyboard.press('Escape');
  assert.equal(await page.locator('.suite-toolbar [data-suite-control=download]').count(),0);
  const home=await page.locator('.suite-toolbar:visible [data-suite-control]:visible').evaluateAll(nodes=>nodes.map(node=>({x:node.getBoundingClientRect().x,y:node.getBoundingClientRect().y})));
  for(let i=1;i<home.length;i++)if(Math.abs(home[i].y-home[i-1].y)<2)assert.ok(home[i].x>home[i-1].x,'Home controls follow LTR DOM order');
  if(appId==='voc')await page.evaluate(()=>{app.switchView('workplace');app.state.slotsData[0].item=CATEGORIES[0].items[0];app.renderSlotsContent();});
  if(appId==='senb')await page.evaluate(()=>navigateTo('workplace'));
  if(appId==='taffaha')await page.locator('#start-practice:not(:disabled)').click();
  const settings=page.locator('[data-suite-settings]:visible'),list=page.locator('[data-suite-menu]:visible'),apps=page.locator('[data-suite-apps]:visible');
  await settings.click();await list.click();assert.equal(await page.locator('#suite-workplace-settings').isVisible(),false);
  await settings.click();assert.equal(await page.locator('#suite-activity-menu').isVisible(),false);
  await apps.click();assert.equal(await page.locator('#suite-workplace-settings').isVisible(),false);await page.keyboard.press('Escape');
  await list.click();await page.mouse.click(2,830);assert.equal(await page.locator('#suite-activity-menu').isVisible(),false);
  await settings.click();await page.mouse.click(2,830);assert.equal(await page.locator('#suite-workplace-settings').isVisible(),false);
  const sessionBeforeLesson=await page.evaluate(()=>SessionHomework.current()?.id);
  await settings.click();await page.locator('[data-family-lesson]').click();await page.locator('#session-homework-dialog[open]').waitFor();assert.equal(await page.locator('#suite-workplace-settings').isVisible(),false);assert.equal(await page.evaluate(()=>SessionHomework.current()?.id),sessionBeforeLesson,'Previewing homework does not end the current session');
  if(sessionBeforeLesson){await page.locator('#session-homework-dialog textarea').fill('رسالة البيت المعدّلة');}
  await page.keyboard.press('Escape');
  if(sessionBeforeLesson){await settings.click();await page.locator('[data-family-lesson]').click();assert.equal(await page.locator('#session-homework-dialog textarea').inputValue(),'رسالة البيت المعدّلة');await page.keyboard.press('Escape');}
  if(appId==='voc'){
   await settings.click();await page.locator('[title="القوالب (١-٩)"]').click();await page.locator('#template-modal:not(.hidden)').waitFor();assert.equal(await page.locator('#suite-workplace-settings').isVisible(),false);await page.locator('#template-modal button[onclick="app.setTemplate(2)"]').click();
  }
  if(appId==='senb'){
   const rects=await page.locator('.header-actions [data-suite-control]:visible').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().x));assert.ok(Math.max(...rects)-Math.min(...rects)<110);
   await settings.click();await page.locator('#templateToggleBtn').click();await page.locator('#templateDropdown:not(.hidden)').waitFor();assert.equal(await page.locator('#suite-workplace-settings').isVisible(),false);await page.locator('#templateDropdown button').last().click();
   await settings.click();const rhythm=page.locator('#metronomeToggleBtn');if(await rhythm.count()){await rhythm.click();await settings.click();assert.equal(await rhythm.evaluate(el=>getComputedStyle(el).boxShadow),'none');}await page.mouse.click(2,830);
  }
  await page.screenshot({path:`/private/tmp/suite-${appId}-workplace.png`,fullPage:true});
 }
 await page.goto(origin+'voc/index.html',{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>{app.switchView('workplace');app.setTemplate(2);app.state.slotsData.forEach((slot,i)=>slot.item=CATEGORIES[0].items[i]);app.renderSlotsContent();});
 await page.locator('[data-suite-settings]:visible').click();await page.locator('#start-automatic-path').click();await page.locator('#start-plan').click();
 for(const phase of ['practice','test']){
  await page.waitForFunction(phase=>app.state.testState.active&&app.state.mode===phase,phase);
  for(let i=0;i<10;i++){
   await page.waitForFunction(()=>app.state.testState.active&&!app.state.testState.answering);
   const at=await page.evaluate(()=>app.state.slotsData.findIndex(slot=>slot.item&&VocProgress.key(slot.item)===VocProgress.key(app.state.testState.targetItem)));
   if(phase==='practice'&&i===0){await page.locator('#slot-'+(1-at)).click();await page.waitForTimeout(1100);assert.equal(await page.evaluate(()=>app.state.testState.completedTrials),0);}
   await page.locator('#slot-'+at).click();
   await page.waitForFunction(({phase,i})=>!app.state.testState.active||app.state.mode!==phase||app.state.testState.completedTrials>i,{phase,i});
   if(i<9)await page.waitForFunction(()=>!app.state.testState.answering);
  }
 }
 await page.waitForURL(/matching.html\?plan=1/);

 for(const mode of ['matching','memory','rapid','test']){
  await page.waitForURL(new RegExp(mode+'\\.html'));
  await page.waitForFunction(()=>document.body.classList.contains('automatic-plan'));
  assert.equal(await page.locator('.voc-plan-banner').isVisible(),false);
  assert.equal(await page.locator('.game-stats').isVisible(),false);
  if(mode==='rapid'){
   await page.waitForFunction(()=>!document.querySelector('[data-grade=mastered]').disabled);
   const before=await page.evaluate(()=>JSON.parse(localStorage.getItem(VocProgress.scope('hamada-game-rapid')+'-draft')).position);
   await page.locator('[data-grade=learning]').click();await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(VocProgress.scope('hamada-game-rapid')+'-draft')).position),before,'Incorrect production stays on the current task');
   for(let i=0;i<2;i++){await page.locator('[data-grade=mastered]:not(:disabled)').click();if(i===0)await page.waitForTimeout(500);}
  }else if(mode==='memory'){
   await page.waitForFunction(()=>document.querySelector('#game-board>button:not(:disabled)'));
   const order=await page.evaluate(()=>JSON.parse(localStorage.getItem(VocProgress.scope('hamada-game-memory')+'-draft')).order);
   for(const key of order){await page.locator(`#game-board>button[data-key="${key}"]`).nth(0).click();await page.locator(`#game-board>button[data-key="${key}"]`).nth(1).click();}
  }else{
   for(let i=0;i<2;i++){
    await page.waitForFunction(()=>document.querySelector('#game-board>button:not(:disabled)'));
    const draft=await page.evaluate(mode=>JSON.parse(localStorage.getItem(VocProgress.scope('hamada-game-'+mode)+'-draft')),mode);
    if(i===0&&mode==='matching')await page.screenshot({path:'/private/tmp/voc-automatic-matching.png'});
    if(i===0){const wrong=draft.pool.find(key=>key!==draft.order[draft.position]);await page.locator(`#game-board>button[data-key="${wrong}"]`).click();await page.waitForTimeout(1100);assert.equal(await page.evaluate(mode=>JSON.parse(localStorage.getItem(VocProgress.scope('hamada-game-'+mode)+'-draft')).position,mode),0);}
    await page.locator(`#game-board>button[data-key="${draft.order[draft.position]}"]:not(:disabled)`).click();if(i===0)await page.waitForTimeout(900);
   }
  }
 }
 await page.waitForURL(/index.html\?workplace/);assert.equal(await page.evaluate(()=>VocProgress.currentRound()),null);
 assert.deepEqual(errors,[]);console.log('PASS: all three apps logo downloads, LTR headers, exclusive/outside-dismissable menus, lesson buttons, standalone templates, and the four-game automatic path with correction before advancing.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{server.closeAllConnections();server.close();});
