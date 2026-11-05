const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.APP_PLAYWRIGHT||path.resolve(__dirname,'../VSS/voc/node_modules/playwright'));
const {solveParentGate}=require('./solve-parent-gate.cjs');
const root=path.resolve(__dirname,'../..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.m4a':'audio/mp4','.json':'application/json'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(error,body)=>{if(error){res.writeHead(404).end();return;}if(file.endsWith('/index.html'))body=Buffer.from(body.toString().replace(/<link[^>]+(?:googleapis|gstatic)[^>]*>/g,''));res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(body);});});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const engine=process.env.APP_ENGINE==='webkit'?webkit:chromium;
 const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',acceptDownloads:true});const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const origin=`http://127.0.0.1:${server.address().port}/tools/VSS/`;
 await page.goto(origin+'voc/index.html',{waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('#parent-gate[open]').count(),0,'The first child does not need a parent calculation');
 await page.locator('#suite-welcome-name').fill('علي');await Promise.all([page.waitForEvent('domcontentloaded'),page.locator('#suite-welcome button[type=submit]').click()]);await page.waitForFunction(()=>window.VocProgress?.active()?.name==='علي');
 const ali=await page.evaluate(()=>{VocProgress.logSession({id:'ali-score',date:new Date().toISOString(),source:'test',kind:'assessment',domain:'receptive',records:[{key:'1_1',correct:4,total:5}]});return VocProgress.active().id;});
 assert.equal(await page.locator('[data-child-report]:visible').count(),1);
 const reportUrl=page.url(),appTitle=await page.title();await page.locator('[data-child-report]:visible').click();const report=page;await report.locator('#voc-activity-report[open]').waitFor();await report.waitForFunction(()=>window.VocReports?.current()?.title==='علي');assert.equal(report.url(),reportUrl);assert.equal(await page.title(),appTitle);assert.equal(context.pages().length,1);
 assert.equal(await report.locator('[data-period]').count(),6);assert.equal(await report.evaluate(()=>VocReports.percent(VocReports.current().domains.receptive)),80);
 await report.locator('[data-period=day]').click();const download=report.waitForEvent('download');await report.locator('#report-download').click();const pdf=await download;await pdf.saveAs('/private/tmp/voc-regular-child-report.pdf');assert.equal(fs.readFileSync('/private/tmp/voc-regular-child-report.pdf').subarray(0,5).toString(),'%PDF-');for(const width of [320,390,768]){await page.setViewportSize({width,height:844});assert.deepEqual(await page.locator('#voc-activity-report button').evaluateAll(nodes=>nodes.filter(node=>{const b=node.getBoundingClientRect();return b.left<0||b.right>innerWidth||b.width<44||b.height<44;}).map(node=>node.id||node.dataset.period)),[],'Popup controls fit and remain touch sized');}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/private/tmp/voc-report-popup.png'});await report.locator('#report-close').click();assert.equal(await page.locator('#voc-activity-report[open]').count(),0);
 await page.locator('[data-child-report]:visible').click();await page.keyboard.press('Escape');assert.equal(await page.locator('#voc-activity-report[open]').count(),0);
 const profile=()=>page.locator('[data-child-profile]:visible').first();
 await profile().click();await page.locator('#parent-gate[open]').waitFor();assert.equal(await page.locator('#child-dialog[open]').count(),0);
 const gate=page.locator('#parent-gate');const options=await gate.locator('[data-answer]').evaluateAll(nodes=>nodes.map(node=>Number(node.dataset.answer)));
 assert.equal(options.length,3);assert.equal(new Set(options).size,3);assert.equal(await gate.locator('input').count(),0);
 const expected=await gate.evaluate(d=>{const a=Number(d.querySelector('[data-left]').textContent),b=Number(d.querySelector('[data-right]').textContent);return d.querySelector('[data-operation]').textContent==='−'?a-b:a+b;});
 const wrong=options.find(value=>value!==expected);await gate.locator(`[data-answer="${wrong}"]`).click();assert.equal(await gate.evaluate(d=>d.open),true);assert.equal(await page.evaluate(()=>VocProgress.active().id),ali);assert.equal(await gate.locator(`[data-answer="${wrong}"]`).getAttribute('aria-invalid'),'true');
 await page.screenshot({path:'/private/tmp/parent-gate-phone.png'});await page.keyboard.press('Escape');assert.equal(await page.locator('#child-dialog[open]').count(),0);
 await profile().click();await solveParentGate(page);await page.locator('#child-dialog[open]').waitFor();await page.locator('#child-close').click();
 await profile().click();await page.locator('#parent-gate[open]').waitFor();assert.equal(await page.locator('#child-dialog[open]').count(),0,'Closing the profile revokes access');
 const calculation=await page.locator('#parent-gate').evaluate(d=>{const a=Number(d.querySelector('[data-left]').textContent),b=Number(d.querySelector('[data-right]').textContent);return d.querySelector('[data-operation]').textContent==='−'?a-b:a+b;});
 await page.locator(`#parent-gate [data-answer="${calculation}"]`).click();
 await page.locator('#child-name').fill('سارة');await page.locator('#child-dialog button[type=submit]').click();await page.waitForFunction(()=>window.VocProgress?.active()?.name==='سارة');const sara=await page.evaluate(()=>VocProgress.active().id);
 await page.goto(origin+'voc/report.html?child='+ali,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.VocReports?.current());assert.equal(await page.evaluate(()=>VocReports.current().title),'سارة');assert.equal(await page.evaluate(()=>VocReports.current().sessions),0,'A child-specific URL cannot show another child’s history');
 await page.goto(origin+'senb/index.html',{waitUntil:'domcontentloaded'});assert.equal(await page.evaluate(()=>SenbProgress.active().id),sara);assert.equal(await page.locator('#vocAppLink').getAttribute('href'),'../voc/index.html');
 await page.locator('[data-senb-child-profile]').click();await page.locator('#parent-gate[open]').waitFor();assert.equal(await page.locator('#senb-child-dialog[open]').count(),0);
 await page.locator('.parent-gate-close').click();assert.equal(await page.evaluate(()=>SenbProgress.active().id),sara);
 await page.locator('[data-senb-child-profile]').click();await solveParentGate(page);await page.locator('.senb-saved-children button').filter({hasText:'علي'}).click();await page.waitForFunction(()=>window.SenbProgress?.active()?.name==='علي');
 assert.equal(await page.evaluate(()=>SenbProgress.active().id),ali);
 for(const width of [320,390,768]){
  await page.setViewportSize({width,height:844});
  assert.equal(await page.locator('#vocAppLink').isVisible(),true);
  const outside=await page.locator('.app-header a:visible,.app-header button:visible').evaluateAll(nodes=>nodes.filter(node=>{const b=node.getBoundingClientRect();return b.left < -1||b.right>innerWidth+1||b.width<44||b.height<44;}).map(node=>node.getAttribute('aria-label')));assert.deepEqual(outside,[],`SENB header fits ${width}`);
 }
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/private/tmp/senb-voc-header.png'});
 await page.evaluate(()=>navigateTo('workplace'));await page.locator('[data-suite-settings]:visible').click();await page.locator('#workplaceDynamicTest').click();assert.equal(await page.locator('#vocAppLink').isVisible(),true,'The VOC link remains available during a sentence session');
 await page.locator('#vocAppLink').click();await page.locator('[data-suite-app=voc]').click();await page.waitForURL(/voc\/index.html$/);assert.equal(await page.evaluate(()=>VocProgress.active().id),ali);
 for(const width of [320,390,768]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);const outside=await page.locator('#home-view header a:visible,#home-view header button:visible').evaluateAll(nodes=>nodes.filter(node=>{const b=node.getBoundingClientRect();return b.left < -1||b.right>innerWidth+1;}).map(node=>node.getAttribute('aria-label')));assert.deepEqual(outside,[],`VOC header fits ${width}`);}
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(120);assert.equal(await page.locator('#workplace-view').isVisible(),false);await page.screenshot({path:'/private/tmp/voc-report-header.png'});
 // Native choice buttons remain usable with a physical keyboard.
 await profile().click();await page.locator('#parent-gate[open]').waitFor();const answer=await page.locator('#parent-gate').evaluate(d=>{const a=Number(d.querySelector('[data-left]').textContent),b=Number(d.querySelector('[data-right]').textContent);return d.querySelector('[data-operation]').textContent==='−'?a-b:a+b;});
 await page.locator(`#parent-gate [data-answer="${answer}"]`).focus();await page.keyboard.press('Enter');await page.locator('#child-dialog[open]').waitFor();await page.locator('#child-close').click();
 assert.deepEqual(errors,[]);console.log('PASS: current-child reports/PDF, protected add/switch in both apps, wrong/cancel/reopen cases, three unique choices and keyboard selection, reciprocal navigation, child isolation and mobile headers.');
 }finally{await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});await browser.close();}
})().catch(error=>{console.error(error);server.closeAllConnections();server.close();process.exitCode=1;});
