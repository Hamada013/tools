const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.APP_PLAYWRIGHT || path.resolve(__dirname, '../VSS/voc/node_modules/playwright'));
const { solveParentGate } = require('./solve-parent-gate.cjs');
const root = path.resolve(__dirname, '../..'), KEY = 'voc-children-v1';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    fs.readFile(file, (error, body) => {
        if (error) return res.writeHead(404).end();
        res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); res.end(body);
    });
});
const configs = [
    { app: 'voc', profile: '[data-child-profile]:visible', dialog: '#child-dialog', api: 'VocProgress' },
    { app: 'senb', profile: '[data-senb-child-profile]', dialog: '#senb-child-dialog', api: 'SenbProgress' },
    { app: 'taffaha', profile: '#open-profile', dialog: '#taffaha-child-dialog', api: 'TaffahaProgress' }
];
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const engine = process.env.APP_ENGINE === 'webkit' ? webkit : chromium;
    const browser = await engine.launch({ headless: true, ...(engine === chromium ? { channel: 'chrome' } : {}) });
    let page;
    try {
        for (const config of configs) {
            const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
            await context.addInitScript(({ key }) => {
                if (localStorage.getItem(key)) return;
                localStorage.setItem(key, JSON.stringify({ schema: 1, active: 'admin', children: [
                    { id: 'admin', name: 'Hamada', role: 'admin' },
                    { id: 'ali', name: 'علي', role: 'child' },
                    { id: 'sara', name: 'سارة', role: 'child' },
                    { id: 'long', name: 'عبدالرحمن محمد عبدالله عبدالرحمن محمد عبدالله', role: 'child' }
                ].map(child => ({ ...child, apps: { voc: true, senb: true, taffaha: true }, words: {}, sessions: [], senb: { sessions: [] }, taffaha: { attempts: [] } })) }));
            }, { key: KEY });
            page = await context.newPage(); page.setDefaultTimeout(10000);
            const errors = []; page.on('pageerror', error => errors.push(error.message));
            await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
            await page.goto(`http://127.0.0.1:${server.address().port}/tools/VSS/${config.app}/index.html`);
            await page.locator(config.profile).first().click(); await solveParentGate(page);
            const dialog = page.locator(config.dialog); await dialog.locator('.suite-account-browser').waitFor();
            assert.equal(await dialog.locator('[role=listitem]').count(), 4);
            assert.equal(await dialog.locator('[data-delete-child=admin]').count(), 0, config.app + ': no Hamada delete control');
            assert.equal(await dialog.locator('[data-delete-child]').count(), 3);
            const avatars=await dialog.locator('.suite-account-avatar').evaluateAll(nodes=>nodes.map(node=>node.dataset.avatar));
            assert.equal(new Set(avatars).size,3,'Child fruit/animal icons never repeat');
            assert.equal(await dialog.locator('.suite-account-avatar svg').count(),3,'Every child has a local outline SVG icon');
            assert.equal(await dialog.locator('.suite-account-avatar').allTextContents().then(texts=>texts.join('')),'','Avatar drawings contain no emoji text');
            assert.deepEqual(await dialog.locator('[data-delete-child]').evaluateAll(nodes => nodes.map(node => ({ text: node.textContent, icon: !!node.querySelector('svg'), label: !!node.getAttribute('aria-label') }))), Array(3).fill({ text: '', icon: true, label: true }));
            for (const width of [320, 390, 768]) {
                await page.setViewportSize({ width, height: 844 });
                const rows = await dialog.locator('[role=listitem]').evaluateAll(nodes => nodes.map(node => {
                    const rect = node.getBoundingClientRect(); return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
                }));
                rows.forEach((row, index) => {
                    assert.ok(row.left >= 0 && row.right <= width, config.app + ': list fits screen');
                    for(const prior of rows.slice(0,index))assert.ok(row.right<=prior.left||row.left>=prior.right||row.bottom<=prior.top||row.top>=prior.bottom,config.app+': avatar cards do not overlap');
                });
                assert.ok(await dialog.locator('[data-delete-child]').evaluateAll(nodes => nodes.every(node => {
                    const r = node.getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && r.left >= 0 && r.right <= innerWidth;
                })), config.app + ': touch-sized trash icons');
            }
            await page.setViewportSize({ width: 390, height: 844 });
            await page.screenshot({ path: `/private/tmp/${config.app}-account-list.png` });
            await page.evaluate(api => SuiteAccounts.request(window[api].active()), config.api);
            assert.equal(await page.locator('#delete-account-dialog[open]').count(), 0, 'Direct requests cannot delete Hamada');
            await dialog.locator('[data-delete-child=ali]').click();
            await page.locator('[data-delete-back]').click();
            assert.ok(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).children.some(child => child.id === 'ali'), KEY));
            await dialog.locator('[data-delete-child=ali]').click();
            await Promise.all([page.waitForEvent('load'), page.locator('[data-delete-confirm]').click()]);
            assert.deepEqual(await page.evaluate(key => {
                const data = JSON.parse(localStorage.getItem(key));
                return { active: data.active, ids: data.children.map(child => child.id), deleted: !!data.deletedChildren.ali };
            }, KEY), { active: 'admin', ids: ['admin', 'sara', 'long'], deleted: true });
            await page.locator(config.profile).first().click(); await solveParentGate(page);
            await dialog.locator('.suite-account-select').filter({ hasText: 'سارة' }).click();
            await page.waitForFunction(api => window[api]?.active()?.id === 'sara', config.api);
            await page.locator(config.profile).first().click(); await solveParentGate(page);
            assert.equal(await dialog.locator('[data-delete-child]').count(), 0, 'Child accounts have no delete controls');
            assert.deepEqual(errors, [], config.app + ': no page errors');
            await context.close();
        }
        console.log('PASS: protected Hamada account, searchable avatar grids, accessible trash icons, cancel/confirm deletion and child restrictions in VOC, SENB and Taffaha.');
    } catch (error) {
        await page?.screenshot({ path: '/private/tmp/account-deletion-error.png', fullPage: true }).catch(() => {}); throw error;
    } finally {
        await browser.close(); await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
