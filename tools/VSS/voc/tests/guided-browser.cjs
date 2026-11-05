const assert = require('node:assert/strict');
const fs = require('node:fs'); const path = require('node:path'); const http = require('node:http');
const { chromium } = require(process.env.VOC_PLAYWRIGHT || 'playwright');
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
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try {
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 // Deterministic media completion lets us inspect the preview before/after each clip.
 await context.addInitScript(()=>{
   window.audioEvents=[];
   HTMLMediaElement.prototype.play=function(){
     if(window.denyAudio){window.denyAudio=false;return Promise.reject(new DOMException('blocked','NotAllowedError'));}
     const el=this; clearTimeout(el.testTimer); window.audioEvents.push({kind:'start',src:el.src});
     el.testTimer=setTimeout(()=>{window.audioEvents.push({kind:'end',src:el.src});el.dispatchEvent(new Event('ended'));},450);
     return Promise.resolve();
   };
   HTMLMediaElement.prototype.pause=function(){clearTimeout(this.testTimer);};
 });
 const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'index.html');
 await page.locator('#child-name').fill('ليان');await page.locator('#child-dialog button[type=submit]').click();
 await page.waitForFunction(()=>VocProgress.active()?.name==='ليان');
 assert.equal(await page.locator('#parents-lesson').count(),0);
 await page.evaluate(()=>VocProgress.startPlan(['1_1','1_2'],'easy',['memory','rapid','test']));
 await page.goto(origin+'memory.html?plan=1');
 await page.waitForFunction(()=>document.querySelectorAll('.guide-glow').length===2);
 assert.equal(await page.locator('.memory-front:visible').count(),4);
 assert.equal(await page.locator('#game-board>button:not(:disabled)').count(),0);
 await page.screenshot({path:'/private/tmp/voc-guided-memory.png'});
 await page.locator('#pause-game').click();await page.reload();await page.locator('#continue-game').click();
 await page.waitForFunction(()=>document.querySelector('#game-board>button:not(:disabled)'));
 assert.equal(await page.locator('.memory-front:visible').count(),0,'All fronts covered before guessing');
 let draft=await page.evaluate(()=>JSON.parse(localStorage.getItem(VocProgress.scope('hamada-game-memory')+'-draft')));
 assert.equal(draft.moves,0);assert.equal(draft.records.length,0);
 for(const key of draft.order){await page.locator(`#game-board>button[data-key="${key}"]`).nth(0).click();await page.locator(`#game-board>button[data-key="${key}"]`).nth(1).click();}
 await page.waitForURL(/rapid.html/);await page.locator('#word-preview:not([hidden])').waitFor();
 assert.equal(await page.locator('[data-grade]:not(:disabled)').count(),0);
 assert.equal(await page.locator('#play-view').evaluate(el=>el.classList.contains('production-preview')),true);
 await page.screenshot({path:'/private/tmp/voc-guided-production.png'});
 await page.locator('#word-preview [aria-label="إيقاف مؤقت"]').click();
 assert.equal(await page.locator('#word-preview').isHidden(),true);
 await page.reload();await page.locator('#continue-game').click();
 await page.locator('#word-preview[open]').waitFor();
 await page.waitForFunction(()=>document.querySelector('#show-grading:not(:disabled)'));
 assert.equal(await page.locator('#word-preview').isHidden(),true);
 assert.equal(await page.locator('#game-board span').count(),0,'Production test hides the written answer');
 assert.equal(await page.evaluate(()=>new Set(window.audioEvents.filter(e=>e.kind==='end').map(e=>e.src)).size),2,'Every selected word was modeled after resuming production');
 for(const result of ['mastered','learning']){
   await page.locator('#show-grading').click();await page.locator(`[data-grade=${result}]`).click();
   if(result==='mastered')await page.waitForFunction(()=>document.querySelector('#show-grading:not(:disabled)'));
 }
 await page.waitForURL(/test.html/);
 await page.waitForFunction(()=>window.audioEvents.some(e=>e.kind==='start'));
 assert.equal(await page.locator('.guide-glow').count(),0,'Listening model starts with sound only');
 await page.waitForFunction(()=>document.querySelector('.guide-glow'));
 assert.equal(await page.locator('#game-board>button:not(:disabled)').count(),0);
 assert.ok(await page.evaluate(()=>audioEvents.some(e=>e.kind==='end')),'Sound finishes before the answer glows');
 await page.screenshot({path:'/private/tmp/voc-guided-listening.png'});
 for(let i=0;i<2;i++){
   await page.waitForFunction(()=>document.querySelector('#game-board>button:not(:disabled)'));
   draft=await page.evaluate(()=>JSON.parse(localStorage.getItem(VocProgress.scope('hamada-game-test')+'-draft')));
   assert.equal(draft.records.length,i);
   await page.locator(`#game-board>button[data-key="${draft.order[draft.position]}"]`).click();
 }
 await page.waitForURL(/index.html\?workplace/);await page.locator('#parents-lesson').click();
 const note=await page.locator('#home-lesson-text').inputValue();
 assert.ok(note.startsWith('مرحباً، أنا ليان!'));assert.ok(note.includes('لسه عم أتعلّمها'));assert.ok(note.includes('فهم الكلمات:'));assert.ok(note.includes('تسمية الكلمات:'));assert.ok(!note.includes('undefined'));
 await page.screenshot({path:'/private/tmp/voc-home-lesson.png'});
 await page.reload();await page.locator('#parents-lesson').click();assert.equal(await page.locator('#home-lesson-text').inputValue(),note);
 await page.locator('[data-close]').click();
 // A blocked model can be retried, and ending during preview cannot finish a plan.
 await page.evaluate(()=>VocProgress.startPlan(['1_1'],'easy',['test']));await page.goto(origin+'test.html?plan=1');
 await page.evaluate(()=>window.denyAudio=true);
 await page.waitForFunction(()=>document.querySelector('#game-feedback.error'));
 await page.locator('#play-word').click();
 await page.evaluate(()=>{const audio=document.querySelector('#game-audio');clearTimeout(audio.testTimer);audio.dispatchEvent(new Event('error'));});
 await page.waitForFunction(()=>document.querySelector('#game-feedback').textContent.startsWith('تعذر إكمال'));
 assert.equal(await page.locator('#game-board>button:not(:disabled)').count(),0);
 await page.locator('#play-word').click();await page.waitForFunction(()=>document.querySelector('.guide-glow'));
 await page.locator('#finish-game').click();assert.equal(await page.evaluate(()=>VocProgress.currentRound()),null);
 assert.equal(await page.evaluate(()=>VocProgress.active().homeLesson.keys.length),2,'An incomplete plan cannot overwrite the completed lesson');
 assert.deepEqual(errors,[]);
 console.log('PASS: guided pairs, pause/reload, full production preview, sound-before-glow, unscored demos, Arabic parent note, persistence and blocked-audio retry.');
 } finally {
   await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
   await browser.close();
 }
})().catch(error=>{console.error(error);server.closeAllConnections();server.close();process.exitCode=1;});
