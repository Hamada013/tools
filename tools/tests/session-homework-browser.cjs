const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(process.env.APP_PLAYWRIGHT||path.resolve(__dirname,'../VSS/voc/node_modules/playwright'));
const root=path.resolve(__dirname,'../..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.m4a':'audio/mp4'};
const server=http.createServer((req,res)=>{let pathname=new URL(req.url,'http://localhost').pathname;if(pathname.endsWith('/'))pathname+='index.html';const file=path.resolve(root,'.'+decodeURIComponent(pathname));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(error,data)=>{if(error)return res.writeHead(404).end();res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const engines=process.env.APP_ENGINE==='webkit'?[['webkit',webkit]]:process.env.APP_ENGINE==='chromium'?[['chromium',chromium]]:[['chromium',chromium],['webkit',webkit]];
 try{for(const [name,engine]of engines){
  const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
  try{
   const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,serviceWorkers:'block'});
   await context.addInitScript(()=>{
    if(!localStorage.getItem('voc-children-v1'))localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'ali',children:[{id:'ali',name:'علي',role:'child',apps:{voc:true,senb:true,taffaha:true},words:{},sessions:[],senb:{sessions:[]},taffaha:{attempts:[]}}]}));
    HTMLMediaElement.prototype.play=function(){clearTimeout(this.qaTimer);this.qaTimer=setTimeout(()=>this.dispatchEvent(new Event('ended')),25);return Promise.resolve();};
    HTMLMediaElement.prototype.pause=function(){clearTimeout(this.qaTimer);};
   });
   let page;const errors=[];
   const freshPage=async()=>{await page?.close();page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));await page.route('https://**',route=>route.abort());};
   await freshPage();
   const base=`http://127.0.0.1:${server.address().port}/tools/VSS/`;
   const goto=async app=>{await page.goto(base+app+'/index.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.SessionHomework&&window.AppNavigation&&document.querySelector('[data-session-end]:not(:disabled)'));};
   const open=async()=>{await page.locator('[data-session-end]:visible').click();await page.locator('#session-homework-dialog[open]').waitFor();};
   const text=()=>page.locator('#session-homework-dialog textarea').inputValue();
   const close=()=>page.locator('[data-homework-close]').click();
   const finish=async app=>{
    // The development WebKit build can abort navigation after repeatedly
    // resizing a live dialog. Also verify durable reopening in a fresh window.
    const refresh=async()=>{if(name==='webkit'&&app==='taffaha'){await freshPage();await goto(app);}else await page.reload({waitUntil:'domcontentloaded'});};
    await open();const note=await text();assert.match(note,/^مرحبًا ماما وبابا/);assert.match(note,/أنا علي/);assert.doesNotMatch(note,/لعبت وتدرّبت على/);assert.ok(note.length<1200);assert.match(note,/خلّونا نلعب شوي بالبيت/);assert.equal(await page.evaluate(()=>SessionHomework.current()),null);
    for(const viewport of [{width:320,height:568},{width:390,height:844},{width:1280,height:800}]){
     await page.setViewportSize(viewport);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
     const bounds=await page.locator('#session-homework-dialog').boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=viewport.width+1);assert.ok(bounds.height<=viewport.height);
     await page.screenshot({path:`/private/tmp/homework-${name}-${app}-${viewport.width}.png`,fullPage:true,animations:'disabled'});
    }
    await page.setViewportSize({width:390,height:844});await close();await refresh();await page.locator('[data-session-end]:not(:disabled)').waitFor();await open();assert.equal(await text(),note,'The ended message survives reopening');
    await page.locator('#session-homework-dialog textarea').fill(note+'\nرسالتنا الخاصة بالبيت.');await close();await refresh();await page.locator('[data-session-end]:not(:disabled)').waitFor();await open();assert.match(await text(),/رسالتنا الخاصة بالبيت/);await close();return note;
   };
   // Honest empty states; all three home headers share the same icon and label.
   for(const app of ['voc','senb','taffaha']){await goto(app);await open();assert.equal(await page.locator('[data-homework-empty]').isVisible(),true);assert.equal(await page.locator('[data-homework-copy]').isHidden(),true);await page.keyboard.press('Escape');}
   await freshPage();await goto('voc');
   const word=await page.evaluate(async()=>{
    app.switchView('workplace');app.setTemplate(2);app.state.slotsData.forEach((slot,index)=>slot.item=CATEGORIES[0].items[index]);app.renderSlotsContent();
    await app.playAudioForItem(app.state.slotsData[0].item);return app.state.slotsData[0].item.name;
   });
   await page.waitForFunction(()=>SessionHomework.current());assert.equal(await page.locator('[data-session-end]').isHidden(),true);
   await page.evaluate(async()=>{await app.handleModeButtonClick('test');const at=app.state.slotsData.findIndex(slot=>VocProgress.key(slot.item)===VocProgress.key(app.state.testState.targetItem));app.evaluateTestAnswer(at);app.switchView('home');});
   let note=await finish('voc');assert.match(note,new RegExp(word));assert.doesNotMatch(note,/اختبار فهم الكلمات/);assert.match(note,/1\/1 محاولات صحيحة/);
   // Game practice on another page joins the same app's next summary.
   await page.goto(base+'voc/memory.html',{waitUntil:'domcontentloaded'});await page.locator('#start-game:not(:disabled)').waitFor();await page.locator('#sound-hint').uncheck();await page.locator('#start-game').click();await page.locator('#game-board button:not(:disabled)').first().waitFor();
   const memoryWord=await page.locator('#game-board button').first().getAttribute('data-key');await page.locator('#game-board button').first().click();await goto('voc');await open();note=await text();assert.doesNotMatch(note,/الذاكرة/);assert.match(note,/بلا تقييم/);assert.doesNotMatch(note,/اختبار فهم الكلمات/);assert.ok(memoryWord);await close();
   await page.goto(base+'voc/rapid.html',{waitUntil:'domcontentloaded'});await page.locator('#start-game:not(:disabled)').waitFor();
   if(await page.locator('#select-everything').getAttribute('aria-pressed')!=='true')await page.locator('#select-everything').click();await page.locator('#select-everything').click();
   await page.locator('.selection-card').nth(0).click();await page.locator('.selection-card').nth(1).click();await page.locator('#sound-hint').uncheck();await page.locator('#start-game').click();
   await page.locator('[data-rating="1"]:enabled').waitFor();await page.locator('[data-rating="1"]').click();
   await goto('voc');await open();note=await text();assert.doesNotMatch(note,/البطاقات السريعة/);assert.match(note,/0\/1 محاولات صحيحة/);assert.doesNotMatch(note,/الذاكرة/);await close();
   // SENB captures completed playback plus a partial guided assessment.
   await freshPage();await goto('senb');await page.evaluate(async()=>{navigateTo('workplace');await playSentenceSequence();});
   assert.equal(await page.locator('[data-session-end]').isHidden(),true);
   await page.evaluate(()=>SenbSession.start('test'));await page.waitForFunction(()=>document.querySelector('[data-target]:not(:disabled)'));
   const target=await page.evaluate(()=>{const run=SenbSession.state();return run.testOrder[run.targetIndex];});await page.locator(`[data-target="${target}"]`).click();
   await page.evaluate(()=>navigateTo('home'));note=await finish('senb');assert.doesNotMatch(note,/اختبار الفهم في مساحة العمل/);assert.match(note,/محاولات صحيحة/);
   await page.evaluate(()=>{openActivitySetup('test');chooseActivityMode('expressive');chooseActivityFolder(2);chooseActivitySubgroup(1);startActivity();activity.wordMarks=[true,false];nextExpressiveTrial();navigateTo('home');});
   await open();note=await text();assert.doesNotMatch(note,/اختبار التعبير بالجمل/);assert.match(note,/1\/2 محاولات صحيحة/);assert.doesNotMatch(note,/اختبار الفهم في مساحة العمل/);await close();
   await page.evaluate(()=>{openActivitySetup('test');chooseActivityMode('comprehension');chooseActivityFolder(2);chooseActivitySubgroup(1);startActivity();});
   await page.waitForFunction(()=>activity.phase==='answer');await page.evaluate(()=>answerComprehension(activity.plan[activity.index].choices.findIndex(sentence=>SENBActivities.key(sentence)===SENBActivities.key(activity.plan[activity.index].target))));
   await page.evaluate(()=>navigateTo('home'));await open();note=await text();assert.doesNotMatch(note,/اختبار فهم الجمل/);assert.match(note,/1\/1 محاولات صحيحة/);await close();
   // Taffaha records practice and real responses for both independent modes.
   await freshPage();await goto('taffaha');await page.evaluate(async()=>{const {AudioEngine}=await import('./audio.js');AudioEngine.prototype.unlock=()=>{};AudioEngine.prototype.play=async()=>{};AudioEngine.prototype.beat=async()=>{};});
   await page.locator('#start-practice:not(:disabled)').click();const syllables=await page.locator('#syllables .syllable-circle').allTextContents();assert.equal(await page.locator('[data-session-end]').isHidden(),true);
   await page.evaluate(()=>TaffahaApp.go('home'));await page.locator('#start-test').click();await page.waitForFunction(()=>document.body.dataset.screen==='test');
   const id=await page.locator('#test-screen').getAttribute('data-word-id');await page.locator(`.picture-answer[data-word-id="${id}"]`).click();await page.locator('#answer-feedback[open]').waitFor();await page.locator('#answer-feedback[open]').waitFor({state:'hidden'});
   await page.evaluate(()=>TaffahaApp.test('count'));await page.waitForFunction(()=>document.querySelector('.count-answer'));
   const count=await page.evaluate(()=>document.querySelectorAll('#syllables .syllable-circle').length);await page.locator(`.count-answer[data-count="${count}"]`).click();await page.locator('#answer-feedback[open]').waitFor();await page.locator('#answer-feedback[open]').waitFor({state:'hidden'});await page.evaluate(()=>TaffahaApp.go('home'));
   note=await finish('taffaha');assert.doesNotMatch(note,/المقاطع والصورة|الصورة وعدد المقاطع/);assert.ok(syllables.every(segment=>note.includes(segment)));assert.match(note,/تمييز عدد المقاطع/);
   await goto('voc');await page.evaluate(()=>{const key='speech-homework-v1:voc:ali',state=JSON.parse(localStorage.getItem(key));state.windowStarted=new Date(Date.now()-6*60*60*1000).toISOString();localStorage.setItem(key,JSON.stringify(state));});
   await open();assert.equal(await page.locator('[data-homework-empty]').isVisible(),true);assert.equal(await page.locator('#session-homework-dialog textarea').inputValue(),'');await close();
   assert.deepEqual(errors,[]);await context.close();console.log(`PASS ${name}: three home end buttons, honest empty states, real practice/partial assessments, cross-page games, two syllable skills, fresh session boundaries, edited/reloaded notes and 320px/desktop dialogs.`);
  }finally{await browser.close();}
 }}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);server.closeAllConnections();server.close();process.exitCode=1;});
