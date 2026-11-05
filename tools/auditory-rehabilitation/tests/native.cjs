const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.SOUNDS_PLAYWRIGHT||path.resolve(__dirname,'../../VSS/voc/node_modules/playwright'));
const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.m4a':'audio/mp4'};
let failWorker=true,corruptMedia=true;
const server=http.createServer(async(req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if(failWorker&&pathname==='/sw.js')return res.writeHead(503).end('temporary installation failure');
 try{let body=await fs.promises.readFile(file);if(pathname==='/assets/styles.css')await new Promise(resolve=>setTimeout(resolve,150));if(corruptMedia&&/\/(images|sounds)\/\d+\./.test(pathname)){corruptMedia=false;body=Buffer.from('corrupt download fixture');}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(404).end();}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;
 const engine=(process.env.SOUNDS_ENGINE||process.env.APP_ENGINE)==='webkit'?webkit:chromium;const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});let page;
 try{
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.addInitScript(()=>{
   if(!localStorage.getItem('auditory-rehabilitation-children-v1'))localStorage.setItem('auditory-rehabilitation-children-v1',JSON.stringify({schema:1,active:'child',children:[{id:'child',name:'طفل',role:'child',words:{preserve:true},apps:{}}]}));
   window.audioEnds=0;const Context=window.AudioContext||window.webkitAudioContext;if(Context){const original=Context.prototype.createBufferSource;Context.prototype.createBufferSource=function(...args){const node=original.apply(this,args);node.addEventListener('ended',()=>{if(node.buffer?.length>1)window.audioEnds++;});return node;};}
  });
  page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/index.html`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.getElementById('offline-error').textContent.length>0);
  assert.equal(await page.locator('#offline-download').isEnabled(),true,'Failed shell setup leaves a working retry');
  failWorker=false;await page.locator('[data-sound-download]').click();await page.locator('#offline-download').click();
  await page.waitForFunction(()=>!document.getElementById('offline-download').disabled&&document.getElementById('offline-error').textContent.length>0);
  assert.equal(await page.locator('#offline-status').textContent()==='100%',false,'Corrupted media are rejected');
  await page.locator('#offline-download').click();await page.waitForFunction(()=>document.getElementById('offline-status').textContent==='100%',null,{timeout:90000});
  const status=await page.evaluate(async()=>(await import('./assets/pwa.js')).request('STATUS'));assert.equal(status.count,200);assert.equal(await page.locator('#offline-error').isVisible(),false);await page.screenshot({path:`/private/tmp/rehab-download-${process.env.SOUNDS_ENGINE||'chromium'}.png`});await page.keyboard.press('Escape');
  const decoded=await page.evaluate(async()=>{
   const {MEDIA}=await import('./assets/release.js'),files=MEDIA.filter(entry=>entry.url.endsWith('.m4a')),results=[];let next=0;
   await Promise.all(Array.from({length:5},async()=>{while(next<files.length){const {url}=files[next++],audio=new Audio();results.push(await new Promise(resolve=>{const timer=setTimeout(()=>resolve({url,error:true}),15000);audio.onloadedmetadata=()=>{clearTimeout(timer);resolve({url,duration:audio.duration});audio.removeAttribute('src');audio.load();};audio.onerror=()=>{clearTimeout(timer);resolve({url,error:true});};audio.src=url;}));}}));return results;
  });assert.equal(decoded.length,150);assert.ok(decoded.every(row=>row.duration>0),JSON.stringify(decoded.filter(row=>!row.duration)));
  await page.evaluate(()=>location.hash='/around/library');await page.locator('.pitch-library').waitFor();
  // Stop the actual origin so Safari's worker behavior is exercised without offline emulation.
  server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await page.reload();await page.locator('.pitch-library').waitFor();
  await page.waitForFunction(()=>[...document.querySelectorAll('.pitch-grid img')].every(img=>img.complete&&img.naturalWidth>0));
  const range=await page.evaluate(async()=>{const response=await fetch('sounds/46.m4a',{headers:{Range:'bytes=0-31'}});return [response.status,(await response.arrayBuffer()).byteLength];});assert.deepEqual(range,[206,32]);
  while(!await page.locator('.pitch-grid [data-sound="46"]').count()&&await page.locator('#pitch-next').isEnabled())await page.locator('#pitch-next').click();
  await page.locator('.pitch-grid [data-sound="46"]').click();await page.waitForFunction(()=>audioEnds>0,null,{timeout:30000});
  await page.evaluate(()=>{Math.random=()=>0;location.hash='/around/memory';});await page.locator('[data-size="4"]').click();await page.locator('#session-countdown[open]').waitFor();
  await page.waitForFunction(()=>document.querySelectorAll('.memory-grid .hidden-face').length===4,null,{timeout:60000});
  assert.ok(await page.evaluate(()=>audioEnds>=3),'Native offline pair audio continues after the 3-second countdown');
  assert.equal(await page.evaluate(()=>SoundProgress.report().sessions.filter(session=>session.skill==='memory'&&session.kind==='assessment').length),0,'Native pair introduction never scores a child answer');
  assert.deepEqual(await page.evaluate(()=>SoundProgress.active().words),{preserve:true});assert.deepEqual(errors,[]);await context.close();
  console.log('PASS: Auditory Rehabilitation early-download setup, failed worker retry in the same tab, integrity rejection/retry, all 200 assets, all 150 native AAC metadata decoders, real stopped-origin offline library/audio and byte ranges, and native automatic memory-pair audio after the countdown.');
 }catch(error){await page?.screenshot({path:'/private/tmp/rehab-download-error.png'}).catch(()=>{});throw error;}
 finally{await browser.close();if(server.listening){server.closeAllConnections();server.close();}}
})().catch(error=>{console.error(error);process.exitCode=1;if(server.listening){server.closeAllConnections();server.close();}});
