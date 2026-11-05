const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(process.env.APP_PLAYWRIGHT||path.resolve(__dirname,'../VSS/voc/node_modules/playwright'));
const root=path.resolve(__dirname,'../..'),out=path.join(root,'tmp/pdfs/acquisition-reports');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,bytes)=>{if(err){res.writeHead(404).end();return;}if(file.endsWith('.html'))bytes=Buffer.from(bytes.toString().replace(/<link[^>]+(?:googleapis|gstatic)[^>]*>/g,''));res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(bytes);});});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));fs.mkdirSync(out,{recursive:true});const engine=process.env.APP_ENGINE==='webkit'?webkit:chromium;
 const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 try{
 const context=await browser.newContext({viewport:{width:1040,height:900},serviceWorkers:'block',acceptDownloads:true});await context.route('https://**',route=>route.abort());
 await context.addInitScript(()=>{
  if(localStorage.getItem('voc-children-v1'))return;const date=new Date().toISOString();
  const words=Array.from({length:5},(_,i)=>({key:`1_${i+1}`,correct:1,total:1}));
  const sentences=Array.from({length:24},(_,i)=>({key:`s:2/1/${i+1}`,title:`عنوان مخفي ${i+1}`,entity:'sentence',domain:'receptive',presentation:'advanced',correct:1,total:1}));
  sentences.push({...sentences[0],domain:'expressive'},{key:'w:01 subject/1',title:'كلمة مخفية',entity:'word',domain:'expressive',correct:1,total:1});
  const child={id:'charts',name:'علي',words:{},sessions:[{id:'v1',date,kind:'assessment',domain:'receptive',records:words},{id:'v2',date,kind:'assessment',domain:'expressive',records:words}],senb:{sessions:[{id:'s1',date,kind:'assessment',records:sentences}],mastery:{}}};
  localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'charts',children:[child]}));
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(20000);
 const origin=`http://127.0.0.1:${server.address().port}/tools/VSS/`;
 await page.goto(origin+'voc/report.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>VocReports.current()?.acquisition?.length===1);
 const voc=await page.evaluate(()=>({row:VocReports.current().acquisition[0],total:VOC_GAME_DATA.categories[0].items.length}));assert.equal(voc.row.total,voc.total);assert.equal(voc.row.receptive.acquired,5);assert.equal(voc.row.receptive.percentage,Math.round(5/voc.total*10000)/100);assert.equal(voc.row.expressive.percentage,voc.row.receptive.percentage);
 assert.equal(await page.locator('[data-acquisition-details]').getAttribute('open'),null);await page.locator('[data-acquisition-details]>summary').click();assert.equal(await page.locator('.acq-pie').count(),2);assert.equal(await page.locator('.acq-chart rect[data-domain]').count(),2);assert.match(await page.locator('.acq-chart svg').textContent(),/100%/);
 await page.screenshot({path:path.join(out,'voc-desktop.png'),fullPage:true});
 // Grow the report from fresh activity, including a tested-but-not-yet-acquired category.
 await page.evaluate(()=>{VocProgress.logSession({id:'new-category',date:new Date().toISOString(),domain:'receptive',kind:'assessment',records:[{key:'2_1',correct:0,total:1}]});VocReports.open();});
 await page.locator('#voc-activity-report [data-acquisition-details]>summary').click();assert.equal(await page.locator('#voc-activity-report .acq-pie').count(),4);
 for(const width of [320,390,768]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);const outside=await page.locator('#voc-activity-report .acq-details,#voc-activity-report .acq-pie-category').evaluateAll(nodes=>nodes.filter(el=>{const r=el.getBoundingClientRect();return r.left<0||r.right>innerWidth;}).length);assert.equal(outside,0);}
 await page.setViewportSize({width:390,height:844});await page.locator('#voc-activity-report .acq-chart').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'voc-phone.png')});
 // Capture the exact export canvases as well as the downloadable PDF.
 await page.evaluate(()=>{window.exportCanvases=[];const create=document.createElement.bind(document);document.createElement=function(tag,...args){const node=create(tag,...args);if(tag==='canvas')exportCanvases.push(node);return node;};});
 const vdownload=page.waitForEvent('download');await page.locator('#voc-activity-report #report-download').click();const vpdf=await vdownload;await vpdf.saveAs(path.join(out,'voc.pdf'));
 const vp=await page.evaluate(()=>exportCanvases.filter(canvas=>canvas.width===1240).map(canvas=>canvas.toDataURL().split(',')[1]));vp.forEach((bytes,i)=>fs.writeFileSync(path.join(out,`voc-page-${i+1}.png`),Buffer.from(bytes,'base64')));assert.ok(vp.length>=2);
 await page.goto(origin+'senb/index.html',{waitUntil:'domcontentloaded'});await page.evaluate(()=>SenbSessionReports.openReport());await page.locator('#senb-session-report[open]').waitFor();
 const senb=await page.evaluate(()=>SenbSessionReports.current().acquisition);assert.equal(senb.types.length,1);assert.equal(senb.types[0].receptive.percentage,12.5);assert.equal(senb.groups[0].expressive.percentage,4.17);
 const dialog=page.locator('#senb-session-report');assert.doesNotMatch(await dialog.textContent(),/عنوان مخفي|كلمة مخفية|تفاصيل الجمل والكلمات/);assert.equal(await dialog.locator('[data-acquisition-details]').getAttribute('open'),null);await dialog.locator('[data-acquisition-details]>summary').click();assert.equal(await dialog.locator('.acq-chart svg').count(),2);assert.match(await dialog.textContent(),/24 \/ 24/);assert.match(await dialog.textContent(),/4.17%/);
 await page.setViewportSize({width:1040,height:900});await page.screenshot({path:path.join(out,'senb-desktop.png'),fullPage:true});
 for(const width of [320,390,768]){await page.setViewportSize({width,height:900});const outside=await dialog.locator('.acq-chart,.acq-details,.senb-report-group').evaluateAll(nodes=>nodes.filter(el=>{const r=el.getBoundingClientRect();return r.left<0||r.right>innerWidth;}).length);assert.equal(outside,0);}
 await page.setViewportSize({width:390,height:844});await dialog.locator('.acq-chart').first().scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'senb-phone.png')});
 const sp=await page.evaluate(()=>SenbSessionReports.renderPDF(SenbSessionReports.current()).map(canvas=>canvas.toDataURL().split(',')[1]));sp.forEach((bytes,i)=>fs.writeFileSync(path.join(out,`senb-page-${i+1}.png`),Buffer.from(bytes,'base64')));
 await context.setOffline(true);const sdownload=page.waitForEvent('download');await dialog.locator('[data-report-action=download]').click();const spdf=await sdownload;await spdf.saveAs(path.join(out,'senb.pdf'));
 await context.setOffline(false);await dialog.locator('[data-report-action=close]').click();
 await page.evaluate(()=>{openActivitySetup('expressive');chooseActivityFolder(2);chooseActivitySubgroup(1);startActivity();activity.results=activity.plan.map(trial=>({subgroup:trial.target.subCatId,item:trial.target.itemNum,words:1,total:2,marks:[true,false]}));renderActivitySummary();});
 assert.equal(await page.locator('[data-word-type],.activity-word-findings').count(),0);assert.equal(await page.locator('[data-result-subgroup]').count(),1);assert.doesNotMatch(await page.locator('.activity-summary').textContent(),/الأداء حسب نوع الكلمة/);
 const standalone=page.waitForEvent('download');await page.locator('#downloadActivityResultsBtn').click();await(await standalone).saveAs(path.join(out,'senb-sentence-test.pdf'));
 for(const file of ['voc.pdf','senb.pdf'])assert.equal(fs.readFileSync(path.join(out,file)).subarray(0,5).toString(),'%PDF-');assert.deepEqual(errors,[]);
 console.log(`PASS: VOC catalog-based paired bars/pies and expanding worked categories, collapsed details, SENB type/subgroup percentages without individual sentences/words, narrow layouts, and exported chart PDFs (${vp.length} VOC/${sp.length} SENB pages).`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{server.close();server.closeAllConnections();});
