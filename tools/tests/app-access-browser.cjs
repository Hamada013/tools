// VSS always offers its three areas; sound apps retain their account rules.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(path.resolve(__dirname,'../VSS/voc/node_modules/playwright'));
const {solveParentGate}=require('./solve-parent-gate.cjs');
const root=path.resolve(__dirname,'../..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.m4a':'audio/mp4'};
const apps=['voc','senb','taffaha','arabicsounds','auditory-rehabilitation'];
const configs={
 voc:{api:'VocProgress',profile:'[data-child-profile]:visible',dialog:'#child-dialog',input:'#child-name'},
 senb:{api:'SenbProgress',profile:'[data-senb-child-profile]:visible',dialog:'#senb-child-dialog',input:'#senb-child-name'},
 taffaha:{api:'TaffahaProgress',profile:'#open-profile',dialog:'#taffaha-child-dialog',input:'#taffaha-child-name'},
 arabicsounds:{api:'SoundProgress',profile:'[data-suite-control=profile]:visible',dialog:'#sound-profile',input:'#sound-child-name'},
 'auditory-rehabilitation':{api:'SoundProgress',profile:'[data-suite-control=profile]:visible',dialog:'#sound-profile',input:'#sound-child-name'}
};
const server=http.createServer((req,res)=>{
 let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name.endsWith('/'))name+='index.html';
 const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(error,body)=>{if(error)return res.writeHead(404).end();res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(body);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const engine=process.env.APP_ENGINE==='webkit'?webkit:chromium;
 let browser;
 try{
  browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
  const styles=new Map();
  for(const app of apps){
   const config=configs[app],context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
   await context.route('https://**',route=>route.abort());
   await context.addInitScript(()=>{
    if(localStorage.getItem('voc-children-v1'))return;
    localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'ali',children:[
     {id:'ali',name:'علي',role:'child',apps:{voc:true,senb:true,taffaha:true,arabicsounds:true,'auditory-rehabilitation':true},words:{keep:true},sessions:[],senb:{sessions:[]},taffaha:{attempts:[]}},
     {id:'admin',name:'Hamada',role:'admin',words:{},sessions:[]}
    ]}));
   });
   const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(15000);
   const url=`http://127.0.0.1:${server.address().port}/tools/${['voc','senb','taffaha'].includes(app)?'VSS/':''}${app}/index.html`;
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(api=>window[api]&&window.AppNavigation,config.api);
   const group=apps.slice(apps.indexOf(app)<3?0:3,apps.indexOf(app)<3?3:5);
   async function picker(expected,role){
    await page.locator('[data-suite-apps]:visible').click();
    const dialog=page.locator('#suite-app-picker[open]');await dialog.waitFor();
    assert.deepEqual(await dialog.locator('[data-suite-app]').evaluateAll(nodes=>nodes.map(node=>node.dataset.suiteApp)),expected,`${app}: ${role} destinations`);
    await page.waitForTimeout(350);
    for(const width of [320,390,1024]){
     await page.setViewportSize({width,height:844});
     const look=await dialog.evaluate(d=>{
      const css=node=>{const s=getComputedStyle(node);return Object.fromEntries(['backgroundColor','borderRadius','borderColor','padding','font','gap','objectFit'].map(key=>[key,s[key]]));};
      const r=d.getBoundingClientRect();return {dialog:css(d),header:css(d.querySelector('header')),button:css(d.querySelector('[data-suite-app]')),image:css(d.querySelector('img')),fits:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight};
     });
     assert(look.fits,`${app} picker fits at ${width}`);
     const key=String(width);if(styles.has(key))assert.deepEqual(look,styles.get(key),`${app}: shared popup styling at ${width}`);else styles.set(key,look);
    }
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:`/tmp/${app}-${role}-picker.png`});
    await page.keyboard.press('Escape');
   }
   await picker(group,'child');
   // Reports use the same destinations and cannot offer a cross-group shortcut.
   assert.deepEqual(await page.evaluate(()=>{const host=document.createElement('nav');AppNavigation.reportLinks(host,{id:'ali'});return [...host.children].map(node=>node.dataset.reportApp);}),group);
   await page.locator(config.profile).first().click();await solveParentGate(page);
   const profile=page.locator(config.dialog);await profile.waitFor({state:'visible'});
   assert.equal(await profile.locator('[data-account-id=admin]').count(),0,`${app}: Hamada is hidden from child accounts`);
   assert.equal(await profile.locator('[data-delete-child],[data-reset-hamada]').count(),0);
   await profile.locator('.suite-account-search').fill('Hamada');
   assert.equal(await profile.locator('.suite-account-grid [role=listitem]').count(),0,'Searching saved children does not reveal Hamada');
   await profile.locator('.suite-account-search').fill('');
   await page.locator(config.input).fill('Hamada');await profile.locator('button[type=submit]').click();
   await page.waitForFunction(api=>window[api]?.active()?.name==='Hamada',config.api);
   const adminDestinations=apps.indexOf(app)<3?group:apps;
   await picker(adminDestinations,'admin');
   assert.deepEqual(await page.evaluate(()=>{const host=document.createElement('nav');AppNavigation.reportLinks(host,{id:'ali'});return [...host.children].map(node=>node.dataset.reportApp);}),adminDestinations);
   await page.locator(config.profile).first().click();await solveParentGate(page);await profile.waitFor({state:'visible'});
   await profile.locator('[data-account-id=ali] .suite-account-select').click();
   await page.waitForFunction(api=>window[api]?.active()?.id==='ali',config.api);
   await picker(group,'returned-child');
   // Suite logos are artwork; the two sound apps retain logo downloads.
   const suite=apps.indexOf(app)<3;
   if(suite)assert.equal(await page.locator('[data-logo-download]').count(),0);
   for(const width of [320,390,1024]){
    await page.setViewportSize({width,height:844});
    const selector=suite?'.app-home-brand img,.topbar .brand img':'[data-logo-download]';
    assert(await page.locator(selector).first().evaluate(element=>{
     const img=element.matches('img')?element:element.querySelector('img'),a=element.getBoundingClientRect(),b=img.getBoundingClientRect();
     return img.complete&&img.naturalWidth>0&&b.width>0&&b.height>0&&getComputedStyle(img).objectFit==='contain'&&(element===img||(getComputedStyle(element).padding==='0px'&&Math.abs(a.width-b.width)<1&&Math.abs(a.height-b.height)<1));
    }),`${app}: complete logo at ${width}`);
   }
   assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('voc-children-v1')).children.find(child=>child.id==='ali').words),{keep:true});
   assert.deepEqual(errors,[],`${app}: no browser errors`);await context.close();
   console.log(`PASS ${app}: shared picker, child group, hidden Hamada, typed admin entry, account switching, report links and complete logo.`);
  }
 }finally{await browser?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
