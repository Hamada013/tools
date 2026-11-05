const { solveParentGate } = require('../../../tests/solve-parent-gate.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs'); const path = require('node:path'); const http = require('node:http');
const { chromium, webkit } = require(process.env.VOC_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req,res)=>{
 const file=path.resolve(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/tools\/voc\//,''));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.m4a':'audio/mp4','.webp':'image/webp','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}/tools/VSS/voc/`;
 const engine=process.env.VOC_GAME_ENGINE==='webkit'?webkit:chromium;
 const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 const page=await context.newPage(); page.setDefaultTimeout(15000); page.setDefaultNavigationTimeout(20000); const errors=[]; page.on('pageerror',error=>errors.push(error.message));
 const openProfile = async () => {
   if (!await page.locator('[data-child-profile]:visible').count()) await page.locator('[data-suite-settings]').click();
   await page.locator('[data-child-profile]:visible').first().click(); await solveParentGate(page);
 };
 await page.goto(origin+'index.html'); await page.locator('#child-dialog[open]').waitFor();
 assert.equal(await page.locator('#child-close').isHidden(),true); await page.keyboard.press('Escape'); assert.equal(await page.locator('#child-dialog').evaluate(dialog=>dialog.open),true);
 await page.locator('#child-name').fill('سارة'); await page.locator('#child-dialog button[type=submit]').click();
 await page.waitForFunction(()=>window.VocProgress?.active()?.name==='سارة'&&!document.querySelector('#child-dialog[open]'));
 assert.equal(await page.locator('[data-child-profile] span').first().textContent().then(s=>s.trim()),'سارة');
 await page.evaluate(()=>{app.switchView('workplace');app.setTemplate(2);app.state.slotsData.forEach((slot,i)=>slot.item=CATEGORIES[0].items[i]);app.renderSlotsContent();});
 const complete=async(mode,wrong=false)=>page.evaluate(async({mode,wrong})=>{
   await app.handleModeButtonClick(mode);
   for(let i=0;i<10;i++){
     const at=app.state.slotsData.findIndex(slot=>slot.item&&VocProgress.key(slot.item)===VocProgress.key(app.state.testState.targetItem));
     if(i<(typeof wrong==='number'?wrong:wrong?3:0)){app.evaluateTestAnswer(1-at);app.state.testState.answering=false;}
     app.evaluateTestAnswer(at);app.nextTrial();
   }
 },{mode,wrong});
 await complete('test'); assert.equal(await page.locator('#automation-dialog').evaluate(el=>el.open),true,'Any completed test offers the game plan'); await page.locator('#dismiss-plan').click();
 await complete('practice'); await complete('test',true);
 assert.equal(await page.locator('#automation-dialog').evaluate(el=>el.open),true,'Scores below 80% also offer automation'); await page.locator('#dismiss-plan').click();
 assert.equal(await page.evaluate(()=>app.state.stars),0);
 await complete('test',2); await page.locator('#automation-dialog[open]').waitFor();
 assert.equal(await page.evaluate(()=>VocProgress.active().workspace.lastResult.percentage),80);
 await page.locator('#dismiss-plan').click();
 await complete('test'); await page.locator('#automation-dialog[open]').waitFor();
 assert.equal(await page.locator('#plan-games [aria-pressed=true]').count(),4);
 await page.screenshot({path:'/private/tmp/voc-automation.png'});
 await page.locator('[data-difficulty=advanced]').click();
 await page.locator('[data-mode=matching]').click(); await page.locator('[data-mode=memory]').click();
 await page.locator('[data-mode=test]').click();
 await page.locator('#start-plan').click(); await page.waitForURL(/rapid.html\?plan=1/);
 await page.locator('.voc-countdown[open]').waitFor(); await page.locator('.voc-countdown').waitFor({state:'detached'});
 await page.waitForFunction(()=>document.querySelector('#show-grading:not(:disabled),[data-grade]:not(:disabled)'));
 let draft=await page.evaluate(()=>JSON.parse(localStorage.getItem(VocProgress.scope('hamada-game-rapid')+'-draft')));
 if (!draft) throw Error(JSON.stringify(await page.evaluate(()=>({ keys:Object.keys(localStorage),active:VocProgress.active(),alert:document.querySelector('#game-alert')?.textContent,errors:document.body.innerText})))) ;
 await page.locator('#pause-game').click(); await page.reload();
 await page.locator('#pause-view:not([hidden])').waitFor(); await page.locator('#continue-game').click();
 await page.locator('.voc-countdown').waitFor({state:'detached'});
 await page.waitForFunction(()=>document.querySelector('#show-grading:not(:disabled)'));
 assert.deepEqual([...draft.pool].sort(),['1_1','1_2']); assert.equal(draft.settings.duration,2); assert.equal(draft.settings.sound,false);
 for(let i=0;i<2;i++){
   await page.locator('#show-grading').click(); await page.locator('[data-grade=mastered]').click();
   if(i===0)await page.waitForFunction(()=>document.querySelector('#show-grading:not(:disabled)'));
 }
 await page.waitForURL(/index.html\?workplace=1/);
 await page.waitForFunction(()=>app.state.slotsData[0]?.item);
 assert.equal(await page.evaluate(()=>app.state.slotsCount),2);
 await page.evaluate(()=>{app.state.activeSlotForSelection=0;app.modals.open('category-modal');});
 assert.equal(await page.locator('#items-grid img[src="images/1/1.webp"]').count(),1,'One advanced naming pass and untiered workplace tests do not establish mastery');
 assert.deepEqual(await page.evaluate(()=>VocProgress.active().words['1_1'].expressive.levels),{advanced:true},'Completed advanced plan records the naming difficulty');
 await page.locator('#learned-library-receptive').click();
 assert.equal(await page.locator('#items-grid img[src="images/1/1.webp"]').count(),0);
 await page.locator('#learned-library-expressive').click();
 assert.equal(await page.locator('#learned-library-receptive').getAttribute('aria-pressed'),'false');
 assert.equal(await page.locator('#items-grid img[src="images/1/1.webp"]').count(),0);
 await page.evaluate(()=>{for(const level of ['easy','moderate','advanced'])VocProgress.record('receptive',[{key:'1_1',correct:true}],level);});
 await page.locator('#learned-library-receptive').click();
 assert.equal(await page.locator('#items-grid img[src="images/1/1.webp"]').count(),1,'Ear library needs only comprehension passes');
 await page.locator('#learned-library-expressive').click();
 assert.equal(await page.locator('#items-grid img[src="images/1/1.webp"]').count(),0,'Mouth library remains independent');
 await page.evaluate(()=>{for(const level of ['easy','moderate'])VocProgress.record('expressive',[{key:'1_1',correct:true}],level);});
 await page.locator('#learned-library-expressive').click(); // Normal bank
 assert.equal(await page.locator('#items-grid img[src="images/1/1.webp"]').count(),0,'Both skills completed: move out of ordinary workspace bank');
 await page.locator('#learned-library-expressive').click();
 assert.equal(await page.locator('#items-grid img[src="images/1/1.webp"]').count(),1);
 await page.screenshot({path:'/private/tmp/voc-learned-library.png'});
 await page.locator('#items-grid button:has(img[src="images/1/1.webp"])').click();
 await page.waitForTimeout(250);
 await openProfile();
 await page.locator('#child-name').fill('عمر'); await page.locator('#child-dialog button[type=submit]').click();
 await page.waitForFunction(()=>window.VocProgress?.active()?.name==='عمر');
 assert.equal(await page.evaluate(()=>VocProgress.mastered('1_1')),false);
 assert.equal(await page.evaluate(()=>app.state.slotsData.filter(s=>s.item).length),0,'No workspace leaks between children');
 await openProfile(); await page.locator('#saved-children button').filter({hasText:'سارة'}).click();
 await page.waitForFunction(()=>window.VocProgress?.active()?.name==='سارة');
 assert.equal(await page.evaluate(()=>VocProgress.mastered('1_1')),true); assert.equal(await page.evaluate(()=>app.state.slotsCount),2);
 for(const game of ['test','rapid','matching','memory']) {
   await page.goto(origin+game+'.html');
   await page.evaluate(()=>{
     for(const level of ['easy','moderate','advanced']) {
       VocProgress.record('receptive',[{key:'1_2',correct:true}],level);
       VocProgress.record('expressive',[{key:'1_3',correct:true}],level);
     }
   });
   await page.locator('#game-learned-library-receptive').click();
   assert.equal(await page.locator('#selection-grid [data-key="1_2"]').count(),1);
   assert.equal(await page.locator('#selection-grid [data-key="1_3"]').count(),0);
   await page.locator('#game-learned-library-expressive').click();
   assert.equal(await page.locator('#game-learned-library-receptive').getAttribute('aria-pressed'),'false');
   assert.equal(await page.locator('#selection-grid [data-key="1_2"]').count(),0);
   assert.equal(await page.locator('#selection-grid [data-key="1_3"]').count(),1);
 }
 await page.goto(origin+'index.html?workplace=1');
 await page.evaluate(()=>{app.state.activeSlotForSelection=0;app.modals.open('category-modal');});
 await page.locator('#learned-library-expressive').click();
 const earBox = await page.locator('#learned-library-receptive').boundingBox(), mouthBox = await page.locator('#learned-library-expressive').boundingBox();
 assert.ok(Math.abs(earBox.y-mouthBox.y)<2,'Both learned controls stay together on mobile');
 assert.ok(earBox.width>=44 && mouthBox.width>=44,'Touch targets remain accessible');
 await page.waitForTimeout(250); // Let the picker opening transition finish before capturing it.
 await page.screenshot({path:'/private/tmp/voc-learned-library.png'});
 await page.evaluate(()=>app.modals.close('category-modal')); await page.waitForTimeout(250);
 console.log('Profile persistence and library passed');
 // Switching names must never interpolate markup.
 await openProfile(); await page.locator('#child-name').fill('<img src=x onerror=alert(1)>'); await page.locator('#child-dialog button[type=submit]').click();
 await page.waitForFunction(()=>window.VocProgress?.active()?.name.startsWith('<img'));
 assert.equal(await page.locator('[data-child-profile] img').count(),0);
 console.log('Safe profile names passed');
 // A one-card plan still uses that exact card in every game.
 await page.evaluate(()=>VocProgress.startPlan(['1_1'],'easy',['matching','memory','test']));
 await page.goto(origin+'matching.html?plan=1');
 await page.waitForFunction(()=>document.querySelector('#game-board>button:not(:disabled)'));
 assert.equal(await page.locator('#game-board>button').count(),1); await page.locator('#game-board>button').click();
 console.log('One-card matching completed');
 await page.waitForURL(/memory.html\?plan=1/); await page.waitForFunction(()=>document.querySelector('#game-board>button:not(:disabled)'));
 assert.equal(await page.locator('#game-board>button').count(),2);
 await page.locator('#game-board>button').nth(0).click();await page.locator('#game-board>button').nth(1).click();
 console.log('One-card memory completed');
 await page.waitForURL(/test.html\?plan=1/);
 await page.locator('#play-word:not(:disabled)').waitFor();
 // Safari requires a fresh audio gesture after navigation; the existing replay icon supplies it.
 if(!await page.locator('#game-board>button:not(:disabled)').count()) await page.locator('#play-word').click();
 await page.waitForFunction(()=>document.querySelector('#game-board>button:not(:disabled)'));
 await page.locator('#game-board>button').click();await page.waitForURL(/index.html\?workplace=1/);
 assert.equal(await page.evaluate(()=>VocProgress.currentRound()),null);
 // A four-card easy plan must cross matching groups and both memory boards automatically.
 await page.evaluate(()=>VocProgress.startPlan(['1_1','1_2','1_3','1_4'],'easy',['matching','memory']));
 await page.goto(origin+'matching.html?plan=1');
 for(let i=0;i<4;i++) {
   await page.waitForFunction(()=>document.querySelector('#game-board>button:not(:disabled):not(.matched)'));
   const state=await page.evaluate(()=>JSON.parse(localStorage.getItem(VocProgress.scope('hamada-game-matching')+'-draft')));
   await page.locator(`#game-board>button[data-key="${state.order[state.position]}"]`).click();
 }
 await page.waitForURL(/memory.html\?plan=1/);
 for(const position of [1,2]) {
   await page.waitForFunction(position=>JSON.parse(localStorage.getItem(VocProgress.scope('hamada-game-memory')+'-draft'))?.planPosition===position,position);
   await page.waitForFunction(()=>document.querySelector('#game-board>button:not(:disabled)'));
   const state=await page.evaluate(()=>JSON.parse(localStorage.getItem(VocProgress.scope('hamada-game-memory')+'-draft')));
   assert.equal(state.order.length,2);
   for(const key of state.order) {
     const indices=state.deck.map((card,index)=>card.key===key?index:-1).filter(index=>index>=0);
     await page.locator(`#game-board>button[data-index="${indices[0]}"]`).click();
     await page.locator(`#game-board>button[data-index="${indices[1]}"]`).click();
   }
 }
 await page.waitForURL(/index.html\?workplace=1/);
 assert.equal(await page.evaluate(()=>VocProgress.currentRound()),null);
 // Stopping the automatic path leaves the current game available as a manual session.
 await page.evaluate(()=>VocProgress.startPlan(['1_1'],'easy',['rapid','test']));
 await page.goto(origin+'rapid.html?plan=1');
 await page.locator('.voc-countdown').waitFor({state:'detached'});
 await page.locator('.voc-plan-banner button').click();
 assert.equal(await page.evaluate(()=>VocProgress.currentRound()),null);
 assert.equal(await page.locator('[data-child-profile]').isEnabled(),true);
 assert.deepEqual(errors,[]);
 await page.screenshot({path:'/private/tmp/voc-profile-workplace.png'});
 console.log('PASS browser: name login, child isolation/reload, first-attempt threshold, mastery/library reuse, exact pool, automatic progression and single-card templates.');
 await context.close();
 }catch(error){throw error;}finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);server.closeAllConnections();server.close();process.exitCode=1;});
