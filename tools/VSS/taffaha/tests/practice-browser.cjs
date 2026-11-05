const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.TAFFAHA_PLAYWRIGHT||'playwright'),engine=process.env.TAFFAHA_ENGINE||'chromium';
const root=path.resolve(__dirname,'../../../..'),out='/private/tmp/taffaha-qa';fs.mkdirSync(out,{recursive:true});
const words=JSON.parse(fs.readFileSync(path.join(root,'tools/VSS/taffaha/assets/words.json'))).words;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.m4a':'audio/mp4'};
let server,browser,context,page;
async function choose(word){await page.locator('#open-library').click();await page.locator(`#category-filters [data-count="${word.syllableCount}"]`).click();await page.getByRole('button',{name:word.label,exact:true}).click();await page.waitForFunction(()=>!document.getElementById('word-image').dataset.loading&&document.getElementById('word-image').complete);assert.equal(await page.locator('#word-label').innerText(),word.label);}
async function rhythm(on){if((await page.locator('#toggle-rhythm').getAttribute('aria-pressed'))!==String(on))await page.locator('#toggle-rhythm').click();assert.equal(await page.locator('#rhythm-frame').isVisible(),on);}
async function clear(){await page.evaluate(()=>window.calls=[]);}
async function done(){await page.waitForFunction(()=>!document.querySelector('#practice-screen .lit,#practice-screen .is-playing'));assert.equal(await page.locator('#status').innerText(),'');}
async function frame(id){await page.locator('#'+id).click({position:{x:8,y:8}});await done();}
async function fits(on){
 const info=await page.evaluate(()=>{
  const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,w:r.width,h:r.height};};
  const panels=['.word-card','#syllable-frame','#word-navigation',...(document.getElementById('rhythm-frame').hidden?[]:['#rhythm-frame'])].map(rect);
  const rows=['#syllables',...(document.getElementById('rhythm-frame').hidden?[]:['#practice-beats'])].map(s=>{const r=rect(s),dots=[...document.querySelectorAll(s+' .syllable-circle')].map(b=>{const d=b.getBoundingClientRect();return{x:d.x,y:d.y,right:d.right,bottom:d.bottom,w:d.width,h:d.height};});return{r,dots};});
  return{overflow:document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth,viewport:{w:innerWidth,h:innerHeight},panels,rows,image:rect('#original'),title:rect('#word-label'),word:rect('.word-card'),syllables:rect('#syllable-frame'),beats:rect('#rhythm-frame')};
 });
 assert.ok(!info.overflow,JSON.stringify(info));assert.ok(info.panels.every(r=>r.h>0&&r.top>=0&&r.bottom<=info.viewport.h+1),JSON.stringify(info));
 assert.ok(info.title.top>=info.image.bottom+3&&info.title.bottom<info.word.bottom&&info.image.h>=30,JSON.stringify(info));
 for(const {r,dots}of info.rows){assert.ok(dots.every(d=>Math.abs(d.w-d.h)<1&&Math.abs(d.y-dots[0].y)<1&&d.x>=r.left-1&&d.right<=r.right+1&&d.y>=r.top-1&&d.bottom<=r.bottom+1),JSON.stringify(info));}
 if(on){assert.ok(info.syllables.top>=info.word.bottom,JSON.stringify(info));if(info.viewport.w>720)assert.ok(info.beats.right<info.word.left,JSON.stringify(info));}
}
(async()=>{
 server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+decodeURIComponent(url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();const data=await fs.promises.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(data);}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});context=await browser.newContext({viewport:{width:1280,height:900}});await require('./profile-fixture.cjs')(context);page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{if(!localStorage.getItem('taffaha-preferences'))localStorage.setItem('taffaha-preferences',JSON.stringify({pace:250}));});
  await page.goto(`http://127.0.0.1:${server.address().port}/tools/VSS/taffaha/#practice`);await page.waitForFunction(()=>!document.getElementById('original').disabled);
  assert.equal(await page.locator('#original svg,#sequence svg,.sequence-controls,#practice-screen button button').count(),0);assert.ok(await page.locator('#toggle-rhythm svg').isVisible());
  const banana=words.find(w=>w.label==='موزة');await choose(banana);
  // Verify native image audio and synthesized rhythm before observing positional playback.
  await page.locator('#word-image').click();await done();await rhythm(true);await frame('rhythm-sequence');await rhythm(false);
  // Compare real onset intervals, including metronome-first playback before
  // speech has populated any recording durations. Both frames must agree.
  await page.evaluate(async()=>{
   const {AudioEngine}=await import('./audio.js'),play=AudioEngine.prototype.play,beat=AudioEngine.prototype.beat;
   window.timing={speech:[],beat:[]};
   AudioEngine.prototype.play=function(source,options){if(typeof source==='string')window.timing.speech.push(performance.now());return play.call(this,source,options);};
   AudioEngine.prototype.beat=function(options){window.timing.beat.push(performance.now());return beat.call(this,options);};
  });
  for(const count of [2,3,5]){
   await choose(words.find(w=>w.syllableCount===count));await rhythm(true);
   await page.evaluate(()=>window.timing={speech:[],beat:[]});
   await frame('rhythm-sequence');await frame('sequence');
   const timing=await page.evaluate(()=>window.timing);
   assert.equal(timing.speech.length,count);assert.equal(timing.beat.length,count);
   for(let i=1;i<count;i++){
    const spoken=timing.speech[i]-timing.speech[i-1],beat=timing.beat[i]-timing.beat[i-1];
    assert.ok(Math.abs(spoken-beat)<100,`Group ${count}, interval ${i}: speech ${spoken.toFixed(0)} ms, metronome ${beat.toFixed(0)} ms`);
   }
  }
  await choose(banana);await rhythm(false);
  await page.evaluate(async()=>{
   const {AudioEngine}=await import('./audio.js');window.calls=[];window.cancelled=0;
   const wait=signal=>new Promise((resolve,reject)=>{const finish=()=>{signal?.removeEventListener('abort',abort);resolve();},timer=setTimeout(finish,100),abort=()=>{clearTimeout(timer);window.cancelled++;reject(new DOMException('Cancelled','AbortError'));};signal?.addEventListener('abort',abort,{once:true});});
   AudioEngine.prototype.play=function(source,{signal}={}){window.calls.push({kind:'speech',path:new URL(source).pathname,lit:[...document.querySelectorAll('#syllables .lit')].map(c=>Number(c.dataset.index))});return wait(signal);};
   AudioEngine.prototype.beat=function({signal}={}){window.calls.push({kind:'beat',lit:[...document.querySelectorAll('#practice-beats .lit')].map(c=>Number(c.dataset.index))});return wait(signal);};
   AudioEngine.prototype.duration=async()=>.1;
  });
  for(const on of [false,true]){
   await rhythm(on);await clear();await page.locator('#word-image').click();await done();assert.deepEqual((await page.evaluate(()=>window.calls)).map(c=>c.path),['/tools/'+banana.audio.library+'/'+banana.audio.path]);
   await clear();await frame('sequence');assert.deepEqual(await page.evaluate(()=>window.calls),banana.syllableAudio.map((a,i)=>({kind:'speech',path:'/tools/VSS/taffaha/'+a.path,lit:[i]})));
   await clear();await page.locator('#syllables .syllable-circle').nth(1).click();await done();assert.deepEqual(await page.evaluate(()=>window.calls),[{kind:'speech',path:'/tools/VSS/taffaha/'+banana.syllableAudio[1].path,lit:[1]}]);
   await clear();await page.locator('#sequence').focus();await page.keyboard.press('Enter');await done();assert.equal((await page.evaluate(()=>window.calls)).length,2);
  }
  for(let n=1;n<=5;n++){
   await choose(words.find(w=>w.syllableCount===n));await clear();await frame('rhythm-sequence');assert.deepEqual(await page.evaluate(()=>window.calls),Array.from({length:n},(_,i)=>({kind:'beat',lit:[i]})));
   await clear();await page.locator('#practice-beats .syllable-circle').last().click();await done();assert.deepEqual(await page.evaluate(()=>window.calls),[{kind:'beat',lit:[n-1]}]);
  }
  // Toggling layout and changing words cancel pending speech and beats.
  await page.locator('#sequence').click({position:{x:8,y:8}});await rhythm(false);await done();assert.equal(await page.locator('.lit').count(),0);assert.ok(await page.evaluate(()=>window.cancelled>0));
  await rhythm(true);await page.locator('#rhythm-sequence').click({position:{x:8,y:8}});await page.locator('#next').click();await done();assert.equal(await page.locator('.lit').count(),0);
  for(const [width,height]of [[320,480],[320,568],[390,844],[721,700],[1280,900],[844,390]]){
   await page.setViewportSize({width,height});
   for(const on of [false,true]){await rhythm(on);for(let n=1;n<=5;n++){await choose(words.find(w=>w.syllableCount===n));await fits(on);}await choose(words.find(w=>w.label==='ليمونادة'));await fits(on);await page.screenshot({path:`${out}/${engine}-practice-${on?'rhythm':'syllables'}-${width}x${height}.png`,fullPage:true});}
  }
  await page.reload();await page.waitForFunction(()=>!document.getElementById('original').disabled);assert.ok(await page.locator('#rhythm-frame').isVisible());assert.equal(await page.locator('#toggle-rhythm').getAttribute('aria-pressed'),'true');
  await page.locator('#go-home').click();await page.waitForFunction(()=>document.body.dataset.screen==='home');assert.ok(await page.locator('#toggle-rhythm').isHidden());await page.locator('#start-test').click();await page.waitForFunction(()=>document.body.dataset.screen==='test');assert.ok(await page.locator('#toggle-rhythm').isHidden());assert.deepEqual(errors,[]);
  console.log(`PASS ${engine}: matching real speech/metronome intervals; tap image, frame and individual syllables; keyboard playback; rhythm toggle, 1–5 sequence/single beats, cancellation and persistence; separate titles; no-scroll phone/landscape layouts.`);
 }catch(e){if(page)await page.screenshot({path:out+'/'+engine+'-practice-error.png',fullPage:true}).catch(()=>{});throw e;}
 finally{await context?.close();await browser?.close();if(server?.listening)await new Promise(r=>{server.close(r);server.closeAllConnections();});}
})().catch(e=>{console.error(e);process.exitCode=1;});
