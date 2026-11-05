/* Shared icon treatment and navigation order across home and activity screens. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(process.env.APP_PLAYWRIGHT||path.resolve(__dirname,'../VSS/voc/node_modules/playwright'));
const root=path.resolve(__dirname,'../..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.m4a':'audio/mp4'};
const server=http.createServer((req,res)=>{
 let pathname=new URL(req.url,'http://localhost').pathname;if(pathname.endsWith('/'))pathname+='index.html';
 const file=path.resolve(root,'.'+decodeURIComponent(pathname));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(error,data)=>{if(error)return res.writeHead(404).end();res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);});
});
const rank={settings:0,activities:10,apps:20,download:30,end:35,info:40,family:45,report:50,profile:60,back:70};
async function toolbar(page){
 await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].filter(link=>new URL(link.href).origin===location.origin).every(link=>link.sheet));
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const result=await page.locator('.suite-toolbar:visible').evaluateAll(hosts=>hosts.map(host=>{
  const controls=[...host.querySelectorAll('[data-suite-control]')].filter(node=>node.getClientRects().length);
  return controls.map(node=>{const style=getComputedStyle(node),rect=node.getBoundingClientRect();return {kind:node.dataset.suiteControl,background:style.backgroundColor,color:style.color,width:rect.width,height:rect.height,label:node.getAttribute('aria-label'),x:rect.x,y:rect.y};});
 }));
 assert.ok(result.length,'An active screen has a shared toolbar');
 for(const controls of result){
  const kinds=controls.map(control=>control.kind);assert.deepEqual(kinds,[...kinds].sort((a,b)=>rank[a]-rank[b]),'DOM and keyboard order match across apps');
  for(const control of controls){assert.equal(control.background,'rgba(0, 0, 0, 0)',control.kind);assert.equal(control.color,'rgb(34, 68, 90)',control.kind);assert.equal(control.width,44,control.kind);assert.equal(control.height,44,control.kind);assert.ok(control.label,control.kind);}
  for(let i=1;i<controls.length;i++)if(Math.abs(controls[i].y-controls[i-1].y)<3)assert.ok(controls[i].x>controls[i-1].x,'Visual LTR order matches DOM order');
 }
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No horizontal overflow');
 return result.flat().map(control=>control.kind);
}
async function plainIcons(page,selector){
 assert.ok(await page.locator(selector).count(),selector);
 assert.equal(await page.locator(selector).evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).backgroundColor==='rgba(0, 0, 0, 0)')),true,`${selector}: icons have no background badge`);
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const engines=process.env.APP_ENGINE==='webkit'?[['webkit',webkit]]:process.env.APP_ENGINE==='chromium'?[['chromium',chromium]]:[['chromium',chromium],['webkit',webkit]];
 try{for(const [name,engine]of engines){
  const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
  try{for(const viewport of [{width:320,height:740},{width:390,height:844},{width:1280,height:800}]){
   const context=await browser.newContext({viewport,hasTouch:true,serviceWorkers:'block'});
   await context.addInitScript(()=>localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'ali',children:[{id:'ali',name:'علي',role:'child',apps:{voc:true,senb:true,taffaha:true},words:{},sessions:[],senb:{sessions:[]},taffaha:{attempts:[]}}]})));
   const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[],glyphs=new Map();page.on('pageerror',error=>errors.push(error.message));await page.route('https://**',route=>route.abort());
   const origin=`http://127.0.0.1:${server.address().port}/tools/VSS/`,photo=async label=>page.screenshot({path:`/private/tmp/icons-${name}-${viewport.width}-${label}.png`,fullPage:true});
   for(const app of ['voc','senb','taffaha']){
    await page.goto(origin+app+'/index.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.AppNavigation&&document.querySelector('[data-suite-control="profile"]'));
    await toolbar(page);await plainIcons(page,app==='taffaha'?'.home-action-icon':'.app-home-action-icon');await photo(app+'-home');
    for(const kind of ['profile','report']){
     const markup=await page.locator(`[data-suite-control="${kind}"] svg`).first().evaluate(svg=>svg.outerHTML);
     if(glyphs.has(kind))assert.equal(markup,glyphs.get(kind),`${kind}: identical outline icon across apps`);else glyphs.set(kind,markup);
    }
    // Shared app picker and menu retain their actions after controls move.
    await page.locator('[data-suite-apps]:visible').click();await page.locator('#suite-app-picker[open]').waitFor();await page.locator(`#suite-app-picker [data-suite-app="${app}"]`).click();
    await page.locator('[data-suite-menu]:visible').click();await page.locator('#suite-activity-menu:visible').waitFor();await page.locator('[data-suite-menu]:visible').click();
    if(app==='voc')await page.evaluate(()=>app.switchView('workplace'));
    else if(app==='senb')await page.evaluate(()=>navigateTo('workplace'));
    else{await page.locator('#start-practice:not(:disabled)').click();await page.waitForFunction(()=>document.body.dataset.screen==='practice');}
    await page.locator('[data-suite-settings]:visible').waitFor();await toolbar(page);await page.locator('[data-suite-settings]:visible').click();
    await page.locator('#suite-workplace-settings:visible').waitFor();await plainIcons(page,'#suite-workplace-settings :is(.icon,.voc-icon,button[title],.child-button i)');await photo(app+'-tools');
    if(app==='voc')await page.evaluate(()=>app.switchView('home'));
    else if(app==='senb')await page.evaluate(()=>navigateTo('home'));
    else await page.locator('#go-home').click();
    await page.locator('[data-suite-settings]:visible').waitFor({state:'hidden'});await toolbar(page);
    if(app==='senb'){
     await page.evaluate(()=>openActivitySetup('test'));await page.locator('#chooseComprehension').waitFor();await plainIcons(page,'.home-menu-symbol');await toolbar(page);await photo('senb-test-menu');
     for(const mode of ['repetition','game']){await page.evaluate(()=>navigateTo('home'));await page.evaluate(mode=>openActivitySetup(mode),mode);await toolbar(page);}
    }
    if(app==='taffaha'){await page.locator('#start-test:not(:disabled)').click();await page.waitForFunction(()=>document.body.dataset.screen==='test');await toolbar(page);await photo('taffaha-test');}
   }
   for(const route of ['games','matching','memory','rapid','test']){
    await page.goto(origin+'voc/'+route+'.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('[data-suite-control="profile"]'));await toolbar(page);
    if(route==='games'){
     await plainIcons(page,'.hub-icon');assert.equal(await page.locator('.hub-icon svg').count(),4);
     const tops=await page.locator('.hub-icon').evaluateAll(icons=>icons.map(icon=>icon.getBoundingClientRect().top));assert.ok(Math.max(...tops)-Math.min(...tops)<1,'Game icons stay aligned when labels wrap');
     await page.locator('.hub-card').first().hover();await plainIcons(page,'.hub-icon');await photo('voc-games');
    }
    else{await plainIcons(page,'.icon-button');await photo('voc-'+route);}
   }
   assert.deepEqual(errors,[]);await context.close();console.log(`PASS ${name} ${viewport.width}px: shared plain icons, toolbar order, settings round trips, all home/activity menus and VOC game pages.`);
  }}finally{await browser.close();}
 }}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);server.closeAllConnections();server.close();process.exitCode=1;});
