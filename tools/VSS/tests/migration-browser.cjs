const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require('../voc/node_modules/playwright');
const root=path.resolve(__dirname,'..'),site=fs.mkdtempSync(path.join(os.tmpdir(),'vss-links-'));
require('../scripts/legacy-redirects.cjs').writeRedirects(site);
const legacy=new Set(),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
const html='<!doctype html><meta charset="utf-8"><title>Legacy app</title><script>navigator.serviceWorker.register("sw.js",{scope:"./"});</script>';
const worker=`self.addEventListener('install',e=>e.waitUntil((async()=>{await(await caches.open('vss-migration-fixture')).put(new URL('index.html',self.registration.scope),new Response(${JSON.stringify(html)},{headers:{'Content-Type':'text/html'}}));await self.skipWaiting();})()));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(e.request.mode==='navigate')e.respondWith(caches.open('vss-migration-fixture').then(c=>c.match(new URL('index.html',self.registration.scope))));});`;
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),match=pathname.match(/^\/site\/tools\/(voc|senb|taffaha)\/(.*)$/);
  let body,file;
  if(match){const[,module,relative]=match;file=relative||'index.html';body=legacy.has(module)&&['index.html','sw.js'].includes(file)?Buffer.from(file==='sw.js'?worker:html):await fs.promises.readFile(path.join(site,'tools',module,file));}
  else if(pathname.startsWith('/site/tools/VSS/')){file=pathname.slice('/site/tools/VSS/'.length)||'index.html';body=await fs.promises.readFile(path.join(root,file));}
  else return res.writeHead(404).end();
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
 }catch{res.writeHead(404).end();}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin=`http://127.0.0.1:${server.address().port}`;
 const engine=process.env.APP_ENGINE==='webkit'?webkit:chromium,browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 try{
  for(const module of ['voc','senb','taffaha']){
   const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();page.setDefaultTimeout(30000);
   await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
   legacy.add(module);await page.goto(`${origin}/site/tools/${module}/index.html?legacy=1#saved`);
   await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
   await page.evaluate(()=>localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'saved',children:[{id:'saved',name:'طفل محفوظ',words:{sentinel:'keep'},sessions:[]}]})));
   legacy.delete(module);await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration()).update();});
   await page.waitForURL(`${origin}/site/tools/VSS/${module}/index.html?legacy=1#saved`);
   await page.waitForFunction(()=>window.VSSOffline&&window.AppNavigation&&!window.SuiteWelcome?.pending);
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('voc-children-v1')).children[0].words.sentinel),'keep');
   const registrations=await page.evaluate(async()=>{await window.AppUpdates.ready();return(await navigator.serviceWorker.getRegistrations()).map(r=>r.scope);});
   assert.deepEqual(registrations,[`${origin}/site/tools/VSS/`]);
   // An ordinary old bookmark also lands on the corresponding new activity.
   await page.goto(`${origin}/site/tools/${module}/index.html?bookmark=1#saved`);
   await page.waitForURL(`${origin}/site/tools/VSS/${module}/index.html?bookmark=1#saved`);
   await context.close();
  }
  console.log('PASS: all three cached legacy workers migrate to VSS; old bookmarks, subpath hosting, query/hash, child records and the single new registration are preserved.');
 }finally{await browser.close();await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});fs.rmSync(site,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
