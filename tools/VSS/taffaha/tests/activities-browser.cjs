const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.TAFFAHA_PLAYWRIGHT||'playwright'),engine=process.env.TAFFAHA_ENGINE||'chromium';
const root=path.resolve(__dirname,'../../../..'),out='/private/tmp/taffaha-qa';fs.mkdirSync(out,{recursive:true});
const words=JSON.parse(fs.readFileSync(path.join(root,'tools/VSS/taffaha/assets/words.json'))).words;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.m4a':'audio/mp4'};
let server,browser,context,page;
const current=()=>page.locator('#test-screen').getAttribute('data-word-id');
async function currentWord(){const id=await current();return words.find(w=>w.id===id);}
async function choose(word){
 await page.locator('#open-library').click();assert.ok(await page.locator('#test-category-dialog').isVisible());
 assert.equal(await page.locator('#test-category-dialog [data-count]').count(),5);assert.equal(await page.locator('#test-category-dialog img,#test-category-dialog input').count(),0);
 await page.locator(`#test-categories [data-count="${word.syllableCount}"]`).click();
 for(let n=0;n<15&&(await current())!==word.id;n++)await page.locator('#next').click();
 assert.equal(await current(),word.id);assert.ok(await page.locator('#test-category-dialog').isHidden());
}
async function level(name){await page.locator('#open-level').click();await page.locator(`#level-dialog button[data-level="${name}"]`).click();assert.equal(await page.locator('#test-screen').getAttribute('data-level'),name);}
async function mode(name){
 const before=await current();await page.locator('#open-mode').click();assert.equal(await page.locator('#mode-dialog [data-mode]').count(),2);
 await page.locator(`#mode-dialog [data-mode="${name}"]`).click();assert.equal(await page.locator('#test-screen').getAttribute('data-kind'),name);assert.equal(await current(),before);
 assert.equal(await page.locator('#test-syllables').isVisible(),name==='picture');assert.equal(await page.locator('#test-picture').isVisible(),name==='count');
 assert.equal(await page.locator('#test-answers>button').count(),2);
}
async function assertFits(){
 const result=await page.evaluate(()=>{const els=[document.querySelector('.topbar'),...document.querySelectorAll('main>section:not([hidden]),main>.workspace:not([hidden]),#word-navigation:not([hidden]),.contact-footer:not([hidden])')];return{overflow:document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth,height:innerHeight,boxes:els.map(e=>{const r=e.getBoundingClientRect();return{h:r.height,top:r.top,bottom:r.bottom};})};});
 assert.ok(!result.overflow,JSON.stringify(result));assert.ok(result.boxes.every(r=>r.h>0&&r.top>=-1&&r.bottom<=result.height+1),JSON.stringify(result));
}
async function feedback(result){await page.waitForFunction(result=>document.getElementById('answer-feedback').hasAttribute('open')&&document.getElementById('answer-feedback').dataset.result===result,result);}
async function noFeedback(){await page.waitForFunction(()=>!document.getElementById('answer-feedback').hasAttribute('open'));}
async function advanced(id){await page.waitForFunction(id=>document.getElementById('test-screen').dataset.wordId!==id,id);}
async function picture(correct){const id=await current();return correct?page.locator(`.picture-answer[data-word-id="${id}"]`):page.locator(`.picture-answer:not([data-word-id="${id}"])`);}
(async()=>{
 server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),f=path.resolve(root,'.'+decodeURIComponent(url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname));if(!f.startsWith(root+path.sep))return res.writeHead(403).end();const data=await fs.promises.readFile(f);res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'}).end(data);}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/tools/VSS/taffaha/`;
 try{
  browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});context=await browser.newContext({viewport:{width:1280,height:900}});await require('./profile-fixture.cjs')(context);page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Removed preferences must not retain a disabled automatic-advance state.
  await page.addInitScript(()=>{if(!localStorage.getItem('taffaha-preferences'))localStorage.setItem('taffaha-preferences',JSON.stringify({autoAdvance:false,imagePrompt:false}));});
  await page.goto(base);await page.waitForFunction(()=>!document.getElementById('start-practice').disabled);assert.ok(await page.locator('#home-screen').isVisible());assert.ok(await page.locator('#open-library').isHidden());assert.ok(await page.locator('#open-offline').isVisible());assert.ok(await page.locator('.contact-footer').isVisible());
  await page.locator('#start-practice').click();await page.waitForFunction(()=>document.body.dataset.screen==='practice');assert.ok(await page.locator('#original').isVisible());await page.locator('#open-library').click();assert.ok(await page.locator('#word-library').isVisible());assert.ok(await page.locator('#search').isVisible());await page.locator('#library-dialog [data-close]').click();await page.locator('#go-home').click();await page.locator('#start-test').click();await page.waitForFunction(()=>document.body.dataset.screen==='test');
  assert.ok(await page.locator('#open-offline').isHidden());assert.ok(await page.locator('.contact-footer').isHidden());assert.equal(await page.locator('#toggle-auto,#toggle-prompt,#test-kind,#test-play,.beat-preview').count(),0);assert.ok(await page.locator('#open-mode').isVisible());
  const banana=words.find(w=>w.label==='موزة');await choose(banana);assert.equal((await page.locator('#test-syllables').innerText()).trim(),'');assert.equal(await page.locator('#test-syllables .syllable-circle').count(),2);await page.locator('#test-prompt').click();await page.waitForFunction(()=>document.getElementById('test-prompt').getAttribute('aria-busy')==='false');assert.equal(await page.locator('#status').innerText(),'');
  await page.locator('#open-library').click();await page.screenshot({path:out+'/'+engine+'-category-popup.png',fullPage:true});await page.locator('#test-category-dialog [data-close]').click();await page.locator('#open-mode').click();await page.screenshot({path:out+'/'+engine+'-mode-popup.png',fullPage:true});await page.locator('#mode-dialog [data-close]').click();
  for(const name of ['easy','moderate','hard']){
   await level(name);for(let n=1;n<=5;n++){
    const target=words.find(w=>w.syllableCount===n);await choose(target);const ids=await page.locator('.picture-answer').evaluateAll(bs=>bs.map(b=>b.dataset.wordId));assert.equal(ids.filter(id=>id===target.id).length,1);const other=words.find(w=>w.id===ids.find(id=>id!==target.id)),diff=Math.abs(other.syllableCount-n);assert.ok(name==='easy'?diff>=2:name==='moderate'?diff===1:diff===0);assert.notEqual(other.image.revision,target.image.revision);
   }
  }
  await choose(banana);await (await picture(false)).click();await feedback('wrong');assert.match(await page.locator('main').evaluate(e=>getComputedStyle(e).filter),/blur/);await noFeedback();assert.equal(await current(),banana.id);
  await (await picture(true)).click();await feedback('correct');await advanced(banana.id);assert.equal((await currentWord()).syllableCount,2);assert.ok(await page.locator('.picture-answer').first().isEnabled());
  const before=await current();await page.locator('#random').click();assert.notEqual(await current(),before);assert.equal((await currentWord()).syllableCount,2);
  // Leaving during feedback cancels the pending advance.
  await choose(banana);await (await picture(true)).click();await feedback('correct');await page.evaluate(()=>location.hash='');await page.waitForFunction(()=>document.body.dataset.screen==='home');await page.waitForTimeout(1200);await page.locator('#start-test').click();await page.waitForFunction(()=>document.body.dataset.screen==='test');assert.equal(await current(),banana.id);
  await mode('count');
  for(const name of ['easy','moderate','hard']){
   await level(name);for(let n=1;n<=5;n++){
    await choose(words.find(w=>w.syllableCount===n));const counts=await page.locator('.count-answer').evaluateAll(cs=>cs.map(c=>Number(c.dataset.count)));assert.equal(counts.length,2);assert.equal(new Set(counts).size,2);assert.ok(counts.includes(n));const gap=Math.abs(counts.find(count=>count!==n)-n);assert.ok(name==='hard'?gap===1:name==='moderate'?gap===2:gap>=Math.min(3,Math.max(n-1,5-n)));for(const count of counts)assert.equal(await page.locator(`.count-answer[data-count="${count}"] .beat-dot`).count(),count);
   }
  }
  await page.evaluate(async()=>{const {AudioEngine}=await import('./audio.js'),original=AudioEngine.prototype.beat;window.beats=[];AudioEngine.prototype.beat=function(options){const lit=document.querySelector('.count-answer .lit');window.beats.push({count:Number(lit.closest('.count-answer').dataset.count),index:[...lit.parentElement.children].indexOf(lit)});return original.call(this,options);};});
  for(let count=1;count<=5;count++){
   const target=words.find(w=>w.syllableCount===count);await choose(target);await page.evaluate(()=>window.beats=[]);await page.locator(`.count-answer[data-count="${count}"]`).click();await feedback('correct');assert.deepEqual(await page.evaluate(()=>window.beats),Array.from({length:count},(_,index)=>({count,index})));await advanced(target.id);assert.equal((await currentWord()).syllableCount,count);
  }
  const apple=words.find(w=>w.label==='تفاحة');await choose(apple);await page.locator('.count-answer:not([data-count="3"])').click();await feedback('wrong');await noFeedback();assert.equal(await current(),apple.id);
  await page.locator('.count-answer[data-count="3"]').click();await page.locator('#next').click();const moved=await current();await page.waitForTimeout(700);assert.equal(await page.locator('#answer-feedback[open]').count(),0);assert.equal(await current(),moved);
  await page.evaluate(async()=>{const {AudioEngine}=await import('./audio.js'),original=AudioEngine.prototype.play;window.played=[];AudioEngine.prototype.play=function(source,options){if(typeof source==='string')window.played.push(new URL(source).pathname);return original.call(this,source,options);};});await page.locator('#test-picture').click();await page.waitForFunction(()=>document.getElementById('test-prompt').getAttribute('aria-busy')==='false');assert.equal(await page.locator('#status').innerText(),'');const target=words.find(w=>w.id===moved);assert.ok((await page.evaluate(()=>window.played)).some(p=>p.endsWith('/'+target.audio.library+'/'+target.audio.path)));
  for(const [width,height] of [[320,480],[320,568],[390,844],[721,700],[1280,900],[844,390]]){
   await page.setViewportSize({width,height});await assertFits();const sizes=await page.locator('.count-answer').evaluateAll(cs=>cs.map(c=>{const r=c.getBoundingClientRect(),dots=[...c.querySelectorAll('.beat-dot')].map(d=>d.getBoundingClientRect());return{w:r.width,h:r.height,ys:dots.map(d=>d.y),inside:dots.every(d=>d.left>=r.left&&d.right<=r.right)};}));assert.ok(sizes.every(s=>Math.abs(s.w-sizes[0].w)<1&&s.h===sizes[0].h));assert.ok(sizes.every(s=>s.inside&&s.ys.every(y=>Math.abs(y-s.ys[0])<1)));await page.screenshot({path:out+'/'+engine+'-simplified-count-'+width+'x'+height+'.png',fullPage:true});
   await page.locator('#open-library').click();const buttons=await page.locator('#test-categories button').evaluateAll(bs=>bs.map(b=>{const r=b.getBoundingClientRect();return{x:r.x,right:r.right,y:r.y,bottom:r.bottom,w:r.width,h:r.height};}));assert.equal(buttons.length,5);assert.ok(buttons.every(b=>Math.abs(b.w-b.h)<1&&b.x>=0&&b.right<=width&&b.y>=0&&b.bottom<=height));await page.locator('#test-category-dialog [data-close]').click();await mode('picture');await assertFits();await mode('count');
  }
  await page.locator('#go-home').click();await page.reload();await page.waitForFunction(()=>!document.getElementById('start-test').disabled);await page.locator('#start-test').click();await page.waitForFunction(()=>document.body.dataset.screen==='test');assert.equal(await page.locator('#test-screen').getAttribute('data-kind'),'count');assert.ok(await page.locator('#test-picture').isVisible());const prefs=await page.evaluate(()=>TaffahaProgress.workspace());assert.ok(!('autoAdvance'in prefs));assert.ok(!('imagePrompt'in prefs));assert.equal(await page.locator('#toggle-recording,.record-button,#stop-audio').count(),0);assert.deepEqual(errors,[]);
  console.log(`PASS ${engine}: five-number-only test categories; one visual mode popup; automatic correct-only advance in both modes despite old preferences; 1–5 beats; feedback/cancellation; practice library; saved mode; no-scroll phone/landscape layouts.`);
 }catch(e){if(page)await page.screenshot({path:out+'/'+engine+'-activities-error.png',fullPage:true}).catch(()=>{});throw e;}
 finally{await context?.close();await browser?.close();if(server?.listening)await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
