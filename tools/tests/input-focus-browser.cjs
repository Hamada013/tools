/* Reproduce script-focused dialogs after text entry, pointer taps, and keyboard use. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(process.env.APP_PLAYWRIGHT||path.resolve(__dirname,'../VSS/voc/node_modules/playwright'));
const root=path.resolve(__dirname,'../..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.m4a':'audio/mp4'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(error,data)=>{if(error)return res.writeHead(404).end();res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const engines=process.env.APP_ENGINE==='webkit'?[['webkit',webkit]]:process.env.APP_ENGINE==='chromium'?[['chromium',chromium]]:[['chromium',chromium],['webkit',webkit]];
 try{for(const [name,engine]of engines){
  const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
  try{
   const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
   await context.addInitScript(()=>localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'hamada-admin',children:[{id:'hamada-admin',name:'Hamada',role:'admin',apps:{voc:true,senb:true,taffaha:true},words:{},sessions:[],senb:{sessions:[]},taffaha:{attempts:[]}}]})));
   const page=await context.newPage();page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.route('https://**',route=>route.abort());
   for(const app of ['voc','senb','taffaha']){
    await page.goto(`http://127.0.0.1:${server.address().port}/tools/VSS/${app}/index.html`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.ChildAccountGate&&window.FlowUI);
    await page.evaluate(()=>{
     const host=document.createElement('div');host.id='qa-focus-host';host.style.cssText='position:fixed;bottom:0;left:0;z-index:99999;background:white;padding:8px;display:flex;gap:8px;';
     host.innerHTML='<input id="qa-focus-text" aria-label="Test text field" style="width:90px"><button id="qa-open-parent" type="button" aria-label="Open parent gate"><span>Open</span></button><button id="qa-selected" aria-pressed="true" style="background:rgb(10,120,70)">Selected</button>';
     const style=document.createElement('style');style.textContent='#qa-focus-text:focus{outline:3px solid rgb(100,40,140)}';document.head.append(style);
     host.querySelector('#qa-open-parent').onclick=()=>{void window.ChildAccountGate.request();};document.body.append(host);
    });
    // Keyboard text entry used to carry a focus-visible ring into a pointer-opened dialog.
    await page.locator('#qa-focus-text').tap();await page.locator('#qa-focus-text').fill('test');await page.keyboard.press('End');
    assert.equal(await page.locator('#qa-focus-text').evaluate(input=>getComputedStyle(input).outlineStyle),'solid','Text entry keeps its focus indication');
    await page.locator('#qa-open-parent span').tap();await page.locator('#parent-gate[open]').waitFor();
    assert.equal(await page.locator('html').getAttribute('data-suite-input'),'pointer');
    assert.equal(await page.locator('#parent-gate [data-answer]').first().evaluate(button=>button===document.activeElement),true,'Keep programmatic focus for accessibility');
    assert.equal(await page.locator('#parent-gate button').evaluateAll(buttons=>buttons.every(button=>getComputedStyle(button).outlineStyle==='none')),true,'No apparent selection after a tap');
    const wrong=await page.locator('#parent-gate').evaluate(gate=>{
     const left=Number(gate.querySelector('[data-left]').textContent),right=Number(gate.querySelector('[data-right]').textContent),answer=gate.querySelector('[data-operation]').textContent==='−'?left-right:left+right;
     return [...gate.querySelectorAll('[data-answer]')].find(button=>Number(button.dataset.answer)!==answer).dataset.answer;
    });
    await page.locator(`#parent-gate [data-answer="${wrong}"]`).tap();
    assert.equal(await page.locator(`#parent-gate [data-answer="${wrong}"]`).getAttribute('aria-invalid'),'true','Wrong-answer feedback is retained');
    assert.ok(await page.locator('#parent-gate-error').textContent());
    assert.equal(await page.locator('#parent-gate button').evaluateAll(buttons=>buttons.every(button=>getComputedStyle(button).outlineStyle==='none')),true);
    if(app==='voc')await page.screenshot({path:`/private/tmp/${name}-pointer-focus.png`});
    // Safari's default tab policy uses Option+Tab to include buttons.
    await page.keyboard.press(name==='webkit'?'Alt+Tab':'Tab');
    assert.equal(await page.locator('html').getAttribute('data-suite-input'),'keyboard');
    const keyboardState=await page.evaluate(()=>({inside:document.activeElement.closest('#parent-gate')!==null,outline:getComputedStyle(document.activeElement).outlineStyle,active:document.activeElement.outerHTML.slice(0,400),visible:document.activeElement.matches(':focus-visible')}));
    assert.equal(keyboardState.inside&&keyboardState.outline==='solid',true,`Tab restores a visible keyboard focus ring: ${JSON.stringify(keyboardState)}`);
    if(app==='voc')await page.screenshot({path:`/private/tmp/${name}-keyboard-focus.png`});
    // Mouse interaction also clears a stale keyboard ring, without erasing a real selected state.
    await page.locator(`#parent-gate [data-answer="${wrong}"]`).click();
    assert.equal(await page.locator('#parent-gate button').evaluateAll(buttons=>buttons.every(button=>getComputedStyle(button).outlineStyle==='none')),true);
    await page.locator('.parent-gate-close').click();await page.locator('#qa-selected').tap();
    assert.equal(await page.locator('#qa-selected').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#qa-selected').evaluate(button=>getComputedStyle(button).backgroundColor),'rgb(10, 120, 70)');
    await page.locator('#qa-focus-text').tap();assert.equal(await page.locator('#qa-focus-text').evaluate(input=>getComputedStyle(input).outlineStyle),'solid');
    await page.locator('#qa-open-parent').focus();await page.keyboard.press('Enter');await page.locator('#parent-gate[open]').waitFor();
    assert.equal(await page.locator('#parent-gate [data-answer]').first().evaluate(button=>getComputedStyle(button).outlineStyle),'solid','Keyboard activation keeps the dialog focus ring');
    await page.keyboard.press('Escape');
    console.log(`PASS ${name} ${app}: touch/mouse remove stale rings, Tab/Enter retain keyboard focus, text fields and selected/error states stay intact.`);
   }
   assert.deepEqual(errors,[]);await context.close();
  }finally{await browser.close();}
 }}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);server.closeAllConnections();server.close();process.exitCode=1;});
