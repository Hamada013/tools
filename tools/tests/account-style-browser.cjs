const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(process.env.APP_PLAYWRIGHT||path.resolve(__dirname,'../VSS/voc/node_modules/playwright'));
const {solveParentGate}=require('./solve-parent-gate.cjs');
const root=path.resolve(__dirname,'../..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(error,body)=>{if(error)return res.writeHead(404).end();res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(body);});
});
const children=[['ali','علي','apple'],['sara','سارة','rabbit'],['amal','أمل','pear'],['nour','نور','fox'],['youssef','يوسف','cherry'],['layan','ليان','turtle']];
const apps=[['voc','VocProfile','#child-dialog'],['senb','SenbProfile','#senb-child-dialog'],['taffaha','TaffahaProfile','#taffaha-child-dialog']];
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const engine=process.env.APP_ENGINE==='webkit'?webkit:chromium;
 const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 let page;
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  await context.route('https://**',route=>route.abort());
  await context.addInitScript(children=>{
   if(localStorage.getItem('voc-children-v1'))return;
   localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'ali',children:[
    {id:'admin',name:'Hamada',role:'admin'},
    ...children.map(([id,name],index)=>({id,name,role:'child',created:`202${index}-01-01`,words:{keep:true},sessions:[],senb:{sessions:[]},taffaha:{attempts:[]}}))
   ]}));
   localStorage.setItem('speech-account-avatars-v1',JSON.stringify({schema:1,icons:Object.fromEntries(children.map(([id,,icon])=>[id,icon]))}));
  },children);
  page=await context.newPage();page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
  let firstAvatars;
  for(const [app,profile,selector]of apps){
   await page.goto(`http://127.0.0.1:${server.address().port}/tools/VSS/${app}/index.html`,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(profile=>window[profile],profile);
   if(app==='taffaha')await page.waitForFunction(()=>window.TaffahaApp);
   await page.evaluate(profile=>{void window[profile].open();},profile);await solveParentGate(page);
   const dialog=page.locator(selector),trigger=dialog.locator('.suite-account-sort'),menu=dialog.getByRole('listbox');
   await dialog.waitFor({state:'visible'});
   assert.equal(await dialog.locator('.suite-account-filters select').count(),0,'Sorting has no native OS select');
   assert.equal(await dialog.locator('[data-account-id=admin]').count(),0,'Hamada stays hidden for child accounts');
   assert.equal(await dialog.locator('.suite-account-avatar svg').count(),children.length,'Avatars are real SVG drawings');
   assert.equal((await dialog.locator('.suite-account-avatar').allTextContents()).join(''),'','No emoji glyphs in avatars');
   const avatars=await dialog.locator('.suite-account-avatar').evaluateAll(nodes=>nodes.map(node=>({id:node.closest('[data-account-id]').dataset.accountId,icon:node.dataset.avatar,svg:node.innerHTML})));
   if(firstAvatars)assert.deepEqual(avatars,firstAvatars,'Icon drawings persist across apps');else firstAvatars=avatars;
   const progress=await page.evaluate(()=>localStorage.getItem('voc-children-v1'));
   const ids=()=>dialog.locator('.suite-account-grid [data-account-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.accountId));
   assert.deepEqual(await ids(),children.map(([id])=>id));
   await trigger.focus();await trigger.press('ArrowDown');
   assert.equal(await trigger.getAttribute('aria-expanded'),'true');assert.equal(await menu.getByRole('option').count(),3);
   assert.equal(await menu.getByRole('option',{selected:true}).getAttribute('data-sort-value'),'oldest');
   await page.keyboard.press('End');await page.keyboard.press('Enter');
   assert.equal(await menu.isVisible(),false);assert.equal(await dialog.isVisible(),true,'Sorting never submits or closes the account dialog');
   assert.equal((await ids())[0],'amal','Alphabet sort works');
   await trigger.press('Space');await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('Space');
   assert.deepEqual(await ids(),children.map(([id])=>id).reverse(),'Keyboard selection applies newest first');
   await trigger.press('ArrowUp');await page.keyboard.press('Escape');
   assert.equal(await menu.isVisible(),false);assert.equal(await dialog.isVisible(),true,'Escape closes only the sorting menu');
   assert.equal(await trigger.evaluate(node=>node===document.activeElement),true,'Escape restores trigger focus');
   await trigger.click();await dialog.locator('.suite-account-search').click();assert.equal(await menu.isVisible(),false,'Outside click dismisses the menu');
   await trigger.click();await page.keyboard.press('Tab');assert.equal(await menu.isVisible(),false,'Tab dismisses without trapping focus');
   await trigger.click();await menu.locator('[data-sort-value=oldest]').click();
   await dialog.locator('.suite-account-search').fill('عَلِيّ');assert.deepEqual(await ids(),['ali']);
   await dialog.locator('.suite-account-search').fill('');
   for(const viewport of [{width:320,height:568},{width:390,height:844},{width:768,height:844},{width:844,height:390}]){
    await page.setViewportSize(viewport);await trigger.click();
    const layout=await menu.evaluate(node=>{
     const r=node.getBoundingClientRect(),d=node.closest('dialog').getBoundingClientRect();
     return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,dialogTop:d.top,dialogBottom:d.bottom,options:[...node.querySelectorAll('[role=option]')].map(option=>{const b=option.getBoundingClientRect();return {width:b.width,height:b.height};})};
    });
    assert.ok(layout.left>=0&&layout.right<=viewport.width,`${app}: menu fits ${viewport.width}px width`);
    assert.ok(layout.top>=layout.dialogTop&&layout.bottom<=layout.dialogBottom,`${app}: all choices stay inside the dialog at ${viewport.width}x${viewport.height}: ${JSON.stringify(layout)}`);
    assert.ok(layout.options.every(option=>option.width>=44&&option.height>=44),'Menu choices have touch-sized targets');
    await menu.locator('[data-sort-value=newest]').click();assert.deepEqual(await ids(),children.map(([id])=>id).reverse());
    await trigger.click();await menu.locator('[data-sort-value=oldest]').click();
   }
   assert.equal(await page.evaluate(()=>localStorage.getItem('voc-children-v1')),progress,'Searching and sorting preserve learning progress');
   await page.setViewportSize({width:390,height:844});await trigger.click();
   await page.screenshot({path:`/private/tmp/account-menu-${app}-${process.env.APP_ENGINE||'chromium'}.png`});
   await page.keyboard.press('Escape');
   await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(profile=>window[profile],profile);
   if(app==='taffaha')await page.waitForFunction(()=>window.TaffahaApp);
   await page.evaluate(profile=>{void window[profile].open();},profile);await solveParentGate(page);
   assert.deepEqual(await dialog.locator('.suite-account-avatar').evaluateAll(nodes=>nodes.map(node=>node.dataset.avatar)),children.map(([, ,icon])=>icon),'Reload retains SVG identities');
  }
  assert.deepEqual(errors,[]);await context.close();
  console.log('PASS: SVG fruit/animal avatars persist across all three apps; custom sorting supports mouse, keyboard, dismissal, touch targets and phone/landscape layouts without changing progress.');
 }catch(error){await page?.screenshot({path:'/private/tmp/account-style-error.png'}).catch(()=>{});throw error;}
 finally{await browser.close();server.closeAllConnections();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.closeAllConnections();server.close();});
