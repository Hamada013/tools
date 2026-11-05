const { solveParentGate } = require('../../../tests/solve-parent-gate.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.SENB_PLAYWRIGHT || path.resolve(__dirname, '../../voc/node_modules/playwright'));
const root = path.resolve(__dirname, '../../../..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.m4a': 'audio/mp4', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = http.createServer((request, response) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    fs.readFile(file, (error, bytes) => {
        if (error) { response.writeHead(404).end(); return; }
        response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream'); response.end(bytes);
    });
});
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const browser = await chromium.launch({ headless: true, ...(fs.existsSync(chromePath) ? { executablePath: chromePath } : {}) });
    try {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
        await context.route('https://**', route => route.abort());
        const voc = await context.newPage(); const errors = [];
        voc.on('pageerror', error => errors.push(error.message));
        await voc.goto(origin + '/tools/VSS/voc/index.html');
        await voc.locator('#child-dialog[open]').waitFor();
        await voc.locator('#child-name').fill('علي');
        await voc.locator('#child-dialog button[type=submit]').click();
        await voc.waitForFunction(() => window.VocProgress?.active()?.name === 'علي' && !document.querySelector('#child-dialog[open]'));
        const aliId = await voc.evaluate(() => { VocProgress.record('receptive', [{ key: '1_1', correct: true }]); return VocProgress.active().id; });
        await voc.locator('a[href="../senb/index.html"]').click();
        await voc.waitForURL(/\/tools\/senb\/index.html$/);
        await voc.waitForFunction(() => window.SenbProgress?.active()?.name === 'علي');
        assert.equal(await voc.evaluate(() => SenbProgress.active().id), aliId, 'The VOC home link opens the same child in SENB');
        assert.equal(await voc.locator('#senb-child-dialog[open]').count(), 0);
        await voc.evaluate(() => {
            SenbProgress.logSession({ id: 'shared-profile-assessment', kind: 'assessment', records: [{ key: 's:2/1/1', title: 'ولد يأكل', entity: 'sentence', domain: 'receptive', presentation: 'advanced', correct: 4, total: 5 }] });
            SenbProgress.saveLesson({ text: 'مرحباً، أنا علي. اليوم لعبت مع ماما وبابا.' });
        });
        await voc.locator('[data-senb-child-profile]').click(); await solveParentGate(voc);
        await voc.locator('#senb-child-name').fill('سارة');
        await voc.locator('#senb-child-dialog button[type=submit]').click();
        await voc.waitForFunction(() => window.SenbProgress?.active()?.name === 'سارة');
        assert.deepEqual(await voc.evaluate(() => SenbProgress.sessions()), []);
        assert.equal(await voc.evaluate(() => SenbProgress.learned('s:2/1/1', 'receptive')), false);
        assert.equal(await voc.evaluate(() => SenbProgress.lesson()), null);
        const vocabulary = await context.newPage(); vocabulary.on('pageerror', error => errors.push(error.message));
        await vocabulary.goto(origin + '/tools/VSS/voc/index.html');
        await vocabulary.waitForFunction(() => window.VocProgress?.active()?.name === 'سارة');
        assert.equal(await vocabulary.evaluate(() => !!VocProgress.active().words['1_1']), false);
        await vocabulary.locator('[data-child-profile]:visible').first().click(); await solveParentGate(vocabulary);
        await vocabulary.locator('#saved-children button').filter({ hasText: 'علي' }).click();
        await vocabulary.waitForFunction(() => window.VocProgress?.active()?.name === 'علي');
        await voc.waitForFunction(() => window.SenbProgress?.active()?.name === 'علي');
        assert.equal(await voc.evaluate(() => SenbProgress.sessions().length), 1);
        assert.equal(await voc.evaluate(() => SenbProgress.learned('s:2/1/1', 'receptive')), true);
        assert.equal(await vocabulary.evaluate(() => VocProgress.active().words['1_1'].receptive.passed), true);
        await vocabulary.evaluate(() => { window.profileUnchangedMarker = 'same-active'; });
        await voc.evaluate(() => SenbProgress.saveLesson({ text: 'تمرين البيت لعلي' }));
        await vocabulary.waitForTimeout(150);
        assert.equal(await vocabulary.evaluate(() => window.profileUnchangedMarker), 'same-active', 'Progress saves for the same child must not reload the other app');
        assert.deepEqual(errors, []);
        await context.close();
        console.log('VOC → SENB shared child navigation, profile isolation, cross-tab profile synchronization, and same-profile saves passed.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
