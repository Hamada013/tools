const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.SENB_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const output = path.resolve(__dirname, '../../../tmp/pdfs/senb-report-check');
const fixture = '<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/assets/session-reports.css"><link rel="stylesheet" href="/assets/acquisition-charts.css"><script src="/assets/acquisition-charts.js"></script><body><main id="buttons"></main><script src="/assets/activity-report.js"></script><script src="/assets/session-reports.js"></script></body></html>';
const server = http.createServer((req, res) => {
    if (req.url === '/report-fixture.html') { res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'}); return res.end(fixture); }
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, {'Content-Type':path.extname(file) === '.css' ? 'text/css' : 'text/javascript'}); fs.createReadStream(file).pipe(res);
});
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const browser = await chromium.launch({ headless: true, channel: 'chrome' });
    try {
        const context = await browser.newContext({ viewport:{width:1040,height:900}, acceptDownloads:true });
        const page = await context.newPage();
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        await page.goto(`http://127.0.0.1:${server.address().port}/report-fixture.html`);
        await page.evaluate(() => {
            const records = [];
            for (let i=1; i<=4; i++) for (const presentation of ['advanced','slots']) for (const domain of ['receptive','expressive']) records.push({key:`2/1/${i}`,title:['ولد يأكل','بنت تشرب','ماما تطبخ','بابا يقرأ'][i-1],entity:'sentence',presentation,domain,correct:i < 4 ? 1 : 0,total:1});
            const sessions = [{id:'finished',date:new Date().toISOString(),source:'automation',kind:'assessment',records}];
            let saved;
            window.SenbProgress = { active:() => ({id:'ali',name:'علي'}), sessions:() => sessions, lesson:() => saved, saveLesson:value => {saved=value;} };
            SenbSessionReports.prepareLesson({sentences:[{key:'2/1/1',title:'ولد يأكل'}],sessionIds:['finished']});
            SenbSessionReports.mountButtons('#buttons');
        });
        assert.ok(await page.evaluate(() => SenbProgress.lesson()?.text?.startsWith('مرحباً، أنا علي!')), 'A family lesson is stored before opening its UI');
        await page.getByRole('button',{name:'تقرير التقدم',exact:true}).click();
        assert.equal(await page.getByRole('dialog').count(), 1);
        assert.equal(await page.locator('.senb-report-domains .receptive > b').textContent(), '75%');
        assert.equal(await page.locator('.senb-report-domains .expressive > b').textContent(), '75%');
        assert.equal(await page.getByRole('button',{name:'آخر 3 أشهر',exact:true}).getAttribute('aria-pressed'), 'false');
        await page.getByRole('button',{name:'آخر 3 أشهر',exact:true}).click();
        assert.equal(await page.getByRole('button',{name:'آخر 3 أشهر',exact:true}).getAttribute('aria-pressed'), 'true');
        fs.mkdirSync(output,{recursive:true});
        await page.screenshot({path:path.join(output,'desktop.png')});
        await context.setOffline(true);
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('button',{name:'تنزيل تقرير PDF',exact:true}).click();
        const download = await downloadPromise; const pdfPath=path.join(output,'senb-report.pdf'); await download.saveAs(pdfPath);
        const pdf = fs.readFileSync(pdfPath);
        assert.ok(pdf.subarray(0,8).toString().startsWith('%PDF-1.4'));
        assert.ok(pdf.length>10000);
        const pages = await page.evaluate(async () => {
            const model = SenbSessionReports.current();
            return SenbSessionReports.renderPDF(model).map(canvas=>canvas.toDataURL('image/png').split(',')[1]);
        });
        for (let i=0;i<pages.length;i++) fs.writeFileSync(path.join(output,`page-${i+1}.png`),Buffer.from(pages[i],'base64'));
        assert.ok(pages.length > 1, 'Long reports produce several complete pages');
        assert.equal((pdf.toString('latin1').match(/\/Type \/Page\s/g) || []).length, pages.length);
        await page.getByRole('button',{name:'إغلاق',exact:true}).click();
        await page.getByRole('button',{name:'درس البيت للأهل',exact:true}).click();
        const note = page.getByRole('textbox',{name:'رسالة للأهل، يمكنك تعديلها قبل المشاركة'});
        assert.match(await note.inputValue(), /بابا يقرأ/);
        await note.fill('مرحباً، أنا علي! رسالة معدلة.');
        assert.equal(await page.evaluate(()=>SenbProgress.lesson().text), 'مرحباً، أنا علي! رسالة معدلة.');
        await page.screenshot({path:path.join(output,'lesson.png')});
        await page.getByRole('button',{name:'إغلاق',exact:true}).click();
        await page.setViewportSize({width:360,height:780});
        await page.getByRole('button',{name:'تقرير التقدم',exact:true}).click();
        const outside = await page.locator('#senb-session-report button, #senb-session-report section').evaluateAll(nodes=>nodes.filter(node=>{const r=node.getBoundingClientRect();return r.width&&(r.left<0||r.right>innerWidth);}).map(node=>node.className));
        assert.deepEqual(outside,[], 'Report controls and cards fit a narrow phone');
        await page.screenshot({path:path.join(output,'mobile.png')});
        await page.evaluate(()=>window.dispatchEvent(new Event('senb-profile-beforechange')));
        assert.equal(await page.getByRole('dialog').count(),0, 'Changing child removes private report and lesson dialogs');
        assert.deepEqual(errors,[]);
        console.log(`SENB report/lesson browser, mobile, offline PDF and child isolation checks passed (${pages.length} PDF pages).`);
        await context.close();
    } finally { await browser.close(); server.close(); }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
