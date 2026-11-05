const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(process.env.VOC_PLAYWRIGHT||'playwright');const {solveParentGate}=require('../../../tests/solve-parent-gate.cjs');
const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.m4a':'audio/mp4','.woff2':'font/woff2','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(error,data)=>{if(error)return res.writeHead(404).end();res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const engine=process.env.VOC_GAME_ENGINE==='webkit'?webkit:chromium;
 const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(12000);
  await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.locator('#child-name').fill('سارة');await page.locator('#child-dialog button[type=submit]').click();
  await page.waitForFunction(()=>window.VocProgress?.active()?.name==='سارة'&&!document.querySelector('#child-dialog[open]'));
  await page.locator('#home-view .app-home-action').filter({hasText:'بدء العمل'}).click();
  const open=async()=>{if(!await page.locator('#workplace-levels').isVisible())await page.locator('[data-suite-settings]').click();await page.locator('#workplace-levels').click();await page.locator('#workplace-levels-dialog[open]').waitFor();};
  const choose=async id=>{await page.locator('#word-level-group').click();await page.locator(`[data-category-id="${id}"]`).click();};
  const complete=async(mode,wrong=false)=>{
   await page.evaluate(async mode=>{await app.handleModeButtonClick(mode);},mode);
   await page.evaluate(wrong=>{for(let i=0;i<10;i++){
    const at=app.state.slotsData.findIndex(slot=>slot.item&&VocProgress.key(slot.item)===VocProgress.key(app.state.testState.targetItem));
    if(wrong&&i===0){app.evaluateTestAnswer((at+1)%app.state.slotsData.length);app.state.testState.answering=false;}
    app.evaluateTestAnswer(at);app.nextTrial();
   }},wrong);
   await page.locator('#automation-dialog[open]').waitFor();await page.locator('#dismiss-plan').click();
  };
  await open();assert.equal(await page.locator('#word-level-search,input[type=search]').count(),0,'Level search is removed');
  assert.equal(await page.locator('.word-level-card:not(:disabled)').count(),1);assert.equal(await page.locator('.word-level-card:disabled').count(),7);
  await page.screenshot({path:'/private/tmp/voc-level-locks-phone.png'});
  await page.locator('.word-level-card').first().click();assert.equal(await page.locator('.slot').count(),3);
  const firstId=await page.evaluate(()=>VocProgress.active().workspace.wordLevel.id);
  await complete('practice');await open();assert.equal(await page.locator('.word-level-card:not(:disabled)').count(),1,'Practice does not unlock');await page.locator('[data-levels-close]').click();
  await complete('test',true);await open();assert.equal(await page.locator('.word-level-card:not(:disabled)').count(),1,'Corrected errors do not unlock');await page.locator('[data-levels-close]').click();
  await complete('test');await open();assert.equal(await page.locator('.word-level-card:not(:disabled)').count(),2,'A full independent comprehension test unlocks only the next level');
  assert.equal(await page.locator('.word-level-card[data-status=completed]').count(),1);
  assert.equal(await page.evaluate(()=>VocProgress.mastered('9_10','expressive')),false);
  await page.reload();await page.locator('#home-view .app-home-action').filter({hasText:'بدء العمل'}).click();await open();assert.equal(await page.locator('.word-level-card:not(:disabled)').count(),2);
  // A separate category starts independently; the native select is replaced by a keyboard-accessible illustrated menu.
  await page.locator('#word-level-group').click();assert.equal(await page.locator('#word-level-categories [role=option]').count(),41);
  await page.screenshot({path:'/private/tmp/voc-level-categories-phone.png'});
  await page.keyboard.press('End');await page.keyboard.press('Enter');assert.equal(await page.locator('#word-level-group').getAttribute('aria-expanded'),'false');
  assert.equal(await page.locator('#word-level-group strong').innerText(),'الأرقام');assert.equal(await page.locator('.word-level-card:not(:disabled)').count(),1);
  await choose('5');assert.equal(await page.locator('.word-level-card:not(:disabled)').count(),1,'Food has its own first open level');
  assert.equal(await page.locator('.word-level-card').evaluateAll(cards=>cards.every(card=>card.querySelectorAll('img').length>=2)),true);
  await page.setViewportSize({width:1365,height:960});await page.screenshot({path:'/private/tmp/voc-level-locks-desktop.png'});
  await page.locator('.word-level-card').first().click();assert.ok(await page.locator('.slot').count()>=2);
  // A completed listening game also unlocks the next set; the game remains the established one.
  await page.evaluate(()=>{const level=VocProgress.active().workspace.wordLevel;VocProgress.startPlan(level.keys,'easy',['test']);});
  await page.goto(`http://127.0.0.1:${server.address().port}/test.html?plan=1`);
  const gameCount=await page.evaluate(()=>VocProgress.active().workspace.wordLevel.keys.length);
  for(let i=0;i<gameCount;i++){
   await page.locator('#play-word:not(:disabled)').waitFor();
   if(!await page.locator('#game-board>button:not(:disabled)').count())await page.locator('#play-word').click();
   await page.waitForFunction(()=>document.querySelector('#game-board>button:not(:disabled)'));
   const key=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem(VocProgress.scope('hamada-game-test')+'-draft'));return s.order[s.position];});
   await page.locator(`#game-board>button[data-key="${key}"]`).click();
  }
  await page.waitForURL(/index.html\?workplace=1/);await open();await choose('5');assert.equal(await page.locator('.word-level-card:not(:disabled)').count(),2,'Completed listening game unlock is saved');
  await page.locator('[data-levels-close]').click();
  // Admin bypasses locks without manufacturing child completion.
  await page.locator('[data-suite-settings]').click();await page.locator('[data-child-profile]:visible').first().click();await solveParentGate(page);await page.locator('#saved-children button').filter({hasText:'Hamada'}).click();
  await page.waitForFunction(()=>window.VocProgress?.isAdmin());if(!await page.locator('#workplace-view').isVisible())await page.locator('#home-view .app-home-action').filter({hasText:'بدء العمل'}).click();
  await open();await choose('5');assert.equal(await page.locator('.word-level-card:disabled').count(),0);
  assert.equal(await page.evaluate(()=>VocProgress.active().wordLevels),undefined);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);assert.ok(firstId);
  await context.close();console.log('PASS level browser: no singleton/search, category menu, keyboard selection, independent locks, practice/error rejection, comprehension/game unlocks, reload and Hamada exemption.');
 }finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);server.closeAllConnections();server.close();process.exitCode=1;});
