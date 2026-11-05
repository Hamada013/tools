// A complete browser restart must preserve the selected card and cached shell.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.TAFFAHA_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'../../../..'),profile=fs.mkdtempSync('/private/tmp/taffaha-position-');
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.m4a':'audio/mp4'};
let server,context;
async function launch(){return chromium.launchPersistentContext(profile,{headless:true,viewport:{width:390,height:844},executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});}
(async()=>{
 server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost'),f=path.resolve(root,'.'+decodeURIComponent(u.pathname.endsWith('/')?u.pathname+'index.html':u.pathname));if(!f.startsWith(root+path.sep))return res.writeHead(403).end();const bytes=await fs.promises.readFile(f);res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'}).end(bytes);}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/tools/VSS/taffaha/`;
 try{
  context=await launch();let p=context.pages()[0]||await context.newPage();await p.goto(base+'#practice');await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await p.locator('#open-library').click();await p.locator('#category-filters button[data-count="5"]').click();await p.getByRole('button',{name:'طبيبة عيون',exact:true}).click();await p.waitForFunction(()=>!document.getElementById('word-image').dataset.loading);
  assert.equal(await p.locator('.syllable-circle').count(),5);await p.locator('#original').click();await p.waitForFunction(()=>!document.querySelector('.is-playing'));assert.equal(await p.locator('#status').innerText(),'');
  await context.close();context=null;await new Promise(r=>server.close(r));
  context=await launch();p=context.pages()[0]||await context.newPage();await p.goto(base+'#practice');await p.waitForFunction(()=>document.getElementById('word-label').textContent==='طبيبة عيون');await p.waitForFunction(()=>!document.getElementById('word-image').dataset.loading);
  assert.equal(await p.locator('.syllable-circle').count(),5);assert.ok((await p.locator('#word-image').getAttribute('src')).includes('/taffaha/assets/images/senb/01%20subject/29.webp'));assert.equal(await p.locator('#toggle-recording,.record-button,#stop-audio').count(),0);
  await p.locator('#original').click();await p.waitForFunction(()=>!document.querySelector('.is-playing'));assert.equal(await p.locator('#status').innerText(),'');
  const prefs=await p.evaluate(()=>JSON.parse(localStorage.getItem('taffaha-preferences')));assert.equal(prefs.lastWord,'senb-subject-29');assert.ok(!('segments'in prefs));
  console.log('PASS: full offline browser restart retained five-syllable selection, image and whole-word audio.');
 }finally{await context?.close();if(server.listening)await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
