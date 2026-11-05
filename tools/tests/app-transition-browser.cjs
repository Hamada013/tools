const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.APP_PLAYWRIGHT || path.resolve(__dirname, '../VSS/voc/node_modules/playwright'));
const root = path.resolve(__dirname, '../..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    fs.readFile(file, (error, body) => {
        if (error) return res.writeHead(404).end();
        res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); res.end(body);
    });
});
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const engine = process.env.APP_ENGINE === 'webkit' ? webkit : chromium;
    const browser = await engine.launch({ headless: true, ...(engine === chromium ? { channel: 'chrome' } : {}) });
    let page;
    try {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
        await context.addInitScript(() => {
            if (localStorage.getItem('voc-children-v1')) return;
            localStorage.setItem('voc-children-v1', JSON.stringify({ schema: 1, active: 'admin', children: [
                { id: 'admin', name: 'Hamada', role: 'admin', apps: { voc: true, senb: true, taffaha: true, arabicsounds: true, 'auditory-rehabilitation': true }, words: {}, sessions: [] },
                { id: 'ali', name: 'علي', role: 'child', apps: { voc: true, senb: true, taffaha: true }, words: {}, sessions: [], senb: { sessions: [] }, taffaha: { attempts: [] } }
            ] }));
        });
        page = await context.newPage(); page.setDefaultTimeout(10000);
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
        const origin = `http://127.0.0.1:${server.address().port}/tools/`;
        let expectedOwner = 'admin';
        const ready = app => page.waitForFunction(id => ({ voc: window.VocReports, senb: window.SenbSessionReports, taffaha: window.TaffahaReports,arabicsounds:window.SoundReports,'auditory-rehabilitation':window.SoundReports })[id] && window.AppNavigation, app);
        async function checkTransition(from, to, { reduced = false, screenshot = false } = {}) {
            const curtain = page.locator('#suite-transition[open]');
            for (const value of [1, 2, 3]) {
                await curtain.locator(`.suite-count[data-count="${value}"]`).waitFor();
                assert.ok(page.url().includes(`/${from}/`), 'Navigation waits for the full count');
                assert.equal(await curtain.locator('.suite-count').textContent(), String(value));
                assert.ok((await curtain.locator('img').getAttribute('src')).endsWith(`/navigation/${to}.webp`));
                const layout = await curtain.evaluate(dialog => {
                    const number = dialog.querySelector('.suite-count'), logo = dialog.querySelector('img');
                    const n = number.getBoundingClientRect(), i = logo.getBoundingClientRect(), d = dialog.getBoundingClientRect();
                    const backdrop = getComputedStyle(dialog, '::backdrop');
                    return { left: n.right <= i.left, fits: d.left >= 0 && d.right <= innerWidth && d.top >= 0 && d.bottom <= innerHeight,
                        blur: backdrop.backdropFilter || backdrop.webkitBackdropFilter, animation: getComputedStyle(number).animationName,
                        backgroundBlur: getComputedStyle(document.querySelector('body>header,body>main,body>#home-view')).filter,
                        endOpacity: number.getAnimations()[0]?.effect.getKeyframes().at(-1).opacity,
                        loaded: logo.complete && logo.naturalWidth > 0 };
                });
                assert.ok(layout.left, 'The count stays left of the destination icon in RTL apps');
                assert.ok(layout.fits, 'The transition fits the viewport');
                assert.match(layout.blur, /blur\(12px\)/);
                assert.equal(layout.backgroundBlur, 'blur(8px)', 'The app itself also blurs for Safari backdrop compatibility');
                if (reduced) assert.equal(layout.animation, 'none', 'Reduced motion keeps counting without movement');
                else assert.equal(layout.endOpacity, '1', 'Each number remains visible until the next count');
                if (value === 2) {
                    assert.ok(layout.loaded, 'The destination logo has loaded');
                    if (screenshot) await page.screenshot({ path: `/private/tmp/${from}-app-transition.png`, animations: 'disabled' });
                }
            }
            await page.waitForURL(url => url.pathname.endsWith(`/${to}/index.html`)); await ready(to);
            assert.equal(await page.locator('#suite-transition[open]').count(), 0);
            assert.equal(await page.locator('body.suite-transition-active').count(), 0, 'The destination app is clear');
            assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('voc-children-v1')).active), expectedOwner);
        }
        const apps = ['voc', 'senb', 'taffaha','arabicsounds','auditory-rehabilitation'];
        const viewports = [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 844, height: 390 }];
        for (const [index, from] of apps.entries()) for (const to of apps.filter(app => app !== from && (index >= 3 || apps.indexOf(app) < 3))) {
            await page.setViewportSize(viewports[index % viewports.length]);
            await page.goto(origin + (['voc','senb','taffaha'].includes(from)?'VSS/':'') + from + '/index.html'); await ready(from);
            await page.locator('[data-suite-apps]:visible').click();
            if (index < 3) assert.deepEqual(await page.locator('#suite-app-picker [data-suite-app]').evaluateAll(nodes => nodes.map(node => node.dataset.suiteApp)), apps.slice(0, 3), 'VSS only offers its three activity areas, including for Hamada');
            await page.locator(`[data-suite-app=${to}]`).click();
            // A second queued click must not start another transition or change its destination.
            await page.evaluate(other => document.querySelector(`[data-suite-app=${other}]`).click(), apps.find(app => app !== from && app !== to));
            assert.equal(await page.locator('#suite-transition').count(), 1);
            await checkTransition(from, to, { screenshot: to === apps[(index + 1) % apps.length] });
        }
        // Report links use the same transition and preserve the selected child.
        await page.goto(origin + 'VSS/voc/index.html'); await ready('voc');
        await page.evaluate(() => VocProgress.signIn('علي')); await page.reload(); await ready('voc'); expectedOwner = 'ali';
        await page.locator('[data-child-report]:visible').click();
        await page.locator('#voc-activity-report [data-report-app=taffaha]').click();
        await checkTransition('voc', 'taffaha');
        await page.locator('#taffaha-report[open]').waitFor();
        assert.equal(await page.evaluate(() => TaffahaReports.current().childId), 'ali');
        await page.goBack(); await ready('voc');
        assert.equal(await page.locator('#suite-transition[open]').count(), 0, 'Back navigation clears the old transition');
        await page.goto(origin + 'VSS/senb/index.html'); await ready('senb');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.locator('[data-suite-apps]:visible').click(); await page.locator('[data-suite-app=voc]').click();
        await checkTransition('senb', 'voc', { reduced: true });
        assert.deepEqual(errors, []);
        await context.close();
        console.log('PASS: all six VSS routes stay within the suite; eight sound-app admin routes, 1–2–3 count, mobile/landscape, report identity, duplicate clicks, back navigation and reduced motion.');
    } catch (error) {
        await page?.screenshot({ path: '/private/tmp/app-transition-error.png', fullPage: true }).catch(() => {}); throw error;
    } finally {
        await browser.close(); await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
