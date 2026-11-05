const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.SENB_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.m4a': 'audio/mp4', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.wav': 'audio/wav' };
const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404); res.end(); return;
    }
    const size = fs.statSync(file).size;
    const headers = { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Accept-Ranges': 'bytes' };
    const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range) {
        const start = Number(range[1]);
        const end = Math.min(range[2] ? Number(range[2]) : size - 1, size - 1);
        if (start > end) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }); res.end(); return; }
        res.writeHead(206, { ...headers, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${size}` });
        fs.createReadStream(file, { start, end }).pipe(res);
    } else {
        res.writeHead(200, { ...headers, 'Content-Length': size });
        fs.createReadStream(file).pipe(res);
    }
});
const viewports = [
    { width: 320, height: 568 }, { width: 390, height: 844 },
    { width: 844, height: 390 }, { width: 768, height: 1024 },
    { width: 1024, height: 768 }, { width: 820, height: 1180 },
    { width: 1366, height: 768 }
];
async function inViewport(page, selector) {
    const boxes = await page.locator(selector).evaluateAll(nodes => nodes.filter(node => node.getClientRects().length).map(node => {
        const r = node.getBoundingClientRect();
        return { label: node.getAttribute('aria-label') || node.id || node.textContent, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    }));
    const { width, height } = page.viewportSize();
    for (const box of boxes) assert.ok(box.left >= -1 && box.right <= width + 1 && box.top >= -1 && box.bottom <= height + 1, `${selector}: ${JSON.stringify(box)} outside ${width}x${height}`);
    return boxes;
}
async function run(browserType, name) {
    const chromePath = process.env.SENB_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const options = { headless: true };
    if (name === 'chromium' && fs.existsSync(chromePath)) options.executablePath = chromePath;
    const browser = await browserType.launch(options);
    try {
        for (const viewport of viewports) {
            const context = await browser.newContext({ viewport, hasTouch: viewport.width < 1200 });
            await context.route('https://**', route => route.abort());
            await context.addInitScript(() => localStorage.setItem('voc-children-v1', JSON.stringify({ schema: 1, active: 'browser-child', children: [{ id: 'browser-child', name: 'علي', senb: {} }] })));
            const page = await context.newPage();
            const errors = [], requests = [];
            page.on('pageerror', error => errors.push(error.message));
            page.on('request', req => requests.push(req.url()));
            await page.goto(`http://127.0.0.1:${server.address().port}/index.html`, { waitUntil: 'domcontentloaded' });
            assert.equal(await page.locator('#homeView').isVisible(), true);
            assert.equal(requests.filter(url => url.includes('/sounds/')).length, 0, 'Startup should not bulk-download audio');
            assert.ok(requests.filter(url => url.includes('/images/')).length <= 3, 'Startup should only load the logo');
            await page.getByRole('button', { name: 'ابدأ الجلسة', exact: true }).click();
            assert.equal(await page.evaluate(() => getWorkplaceSentence().key), 's:2/1/1', 'The first two-word sentence starts on the workplace');
            assert.equal(await page.locator('#slotsRow1 > div').count(), 2);
            assert.equal(await page.locator('#featuredCard img').getAttribute('src'), 'images/advanced/6/1/1.webp');
            if (viewport.width === 320) {
                // First confirm that a genuine user tap starts a real local M4A in this engine.
                await page.locator('#slot-1-0').click();
                try {
                    await page.waitForFunction(() => playbackAudio.currentTime > 0, null, { timeout: 10000 });
                } catch (error) {
                    console.log('Real M4A diagnostic', name, await page.evaluate(() => ({ currentTime: playbackAudio.currentTime, paused: playbackAudio.paused, readyState: playbackAudio.readyState, networkState: playbackAudio.networkState, src: playbackAudio.src, error: playbackAudio.error && { code: playbackAudio.error.code, message: playbackAudio.error.message }, status: document.getElementById('audioStatus').textContent }))); 
                    throw error;
                }
                assert.equal(await page.evaluate(() => playbackAudio.error), null);
                await page.evaluate(() => { playbackAudio.pause(); finishActivePlayback?.(); });
            }
            await page.evaluate(() => { clearAllSlots(); state.isAdvancedMode = false; renderWorkplace(); });
            // Track sequence order separately, without relying on speakers or playback duration.
            await page.evaluate(() => {
                window.playedPaths = [];
                HTMLMediaElement.prototype.play = function () {
                    window.playedPaths.push(new URL(this.src).pathname);
                    setTimeout(() => this.onended?.(), 15);
                    return Promise.resolve();
                };
            });
            await page.locator('#sequencePlayBtn').click({trial:true}); // Wait for the header's opening transition to settle.
            const buttons = await inViewport(page, 'header button');
            for (const box of buttons) assert.ok(box.width >= 44 && box.height >= 44, `Toolbar touch target is too small: ${JSON.stringify(box)}`);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
            await page.locator('#templateToggleBtn').click();
            await inViewport(page, '#templateDropdown');
            await page.locator('#templateDropdown button').filter({ hasText: /^6$/ }).click();
            assert.equal(await page.locator('#slotsRow1 > div').count(), 6);
            await page.locator('#workplaceMetronomeBtn').click();
            assert.equal(await page.locator('#slotsRow2').count(), 0);
            assert.equal(await page.locator('[data-workplace-beat]').count(), 0, 'Empty slots do not add beats');
            await page.locator('#slot-1-0').click();
            await inViewport(page, '#categoryModal .picker-panel');
            assert.equal(await page.locator('header').evaluate(node => node.inert), true);
            await page.locator('#itemsGrid .picker-card').nth(1).click();
            assert.equal(await page.locator('#slot-1-0 img').getAttribute('src'), 'images/01 subject/2.webp');
            assert.equal(await page.locator('[data-workplace-beat]').count(), 1);
            await page.locator('#slot-1-1').click();
            await page.locator('#categoriesList button').filter({ hasText: 'أفعال' }).click();
            await inViewport(page, '#modalGrammarControls');
            await page.locator('#tenseFutureBtn').click();
            await page.locator('#itemsGrid .picker-card').first().click();
            const futureTitle = await page.evaluate(() => getDisplayedItemTitle(state.row1Slots[1], 1, 1));
            assert.equal(await page.locator('#slot-1-1 img').getAttribute('alt'), futureTitle);
            await page.waitForFunction(() => playedPaths.at(-1).includes('/sounds/verbs/present/she/1.m4a'));
            assert.deepEqual((await page.evaluate(() => playedPaths)).slice(-2), [
                '/sounds/verbs/present/she/15.m4a', '/sounds/verbs/present/she/1.m4a'
            ]);
            await page.locator('#slotsRow1 .slot-cover-toggle').first().click();
            assert.equal(await page.evaluate(() => state.row1Covered[0]), true);
            await page.locator('#circlesToggleBtn').click();
            assert.equal(await page.locator('#slotsRow1 .slot-cover-toggle').count(), 0);
            await page.locator('#circlesToggleBtn').click();
            await page.locator('#clearBoardBtn').click();await page.locator('#slot-1-1').evaluate(card=>card.click());await page.locator('#clearBoardBtn').click();
            assert.equal(await page.evaluate(() => state.row1Slots[1]), null);
            await page.locator('#slot-1-2').click();
            await page.keyboard.press('Escape');
            assert.equal(await page.locator('#categoryModal').isVisible(), false);
            assert.equal(await page.locator('header').evaluate(node => node.inert), false);
            await page.locator('#advancedModeBtn').click();
            await page.locator('#featuredCard').click();
            await page.locator('[data-advanced-group="2"]').click();
            assert.equal(await page.locator('#advMainCatList').textContent().then(text => text.includes('خانات')), false);
            await page.locator('[data-advanced-subgroup="2"]').click();
            assert.equal(await page.locator('#advItemsGrid img').first().getAttribute('src'), 'images/advanced/3/2/1.webp');
            await page.locator('#advItemsGrid .picker-card').first().click();
            assert.equal(await page.locator('#featuredCard img').getAttribute('src'), 'images/advanced/3/2/1.webp');
            assert.equal(await page.locator('#slotsRow1 > div').count(), 2);
            const slotIds = await page.evaluate(() => state.row1Slots.filter(Boolean).map(item => [item.categoryId, item.id]));
            const expected = await page.evaluate(() => getAdvancedItemData('2', '2', 1).slots.map(item => [item.categoryId, item.id]));
            assert.deepEqual(slotIds, expected);
            const navigationStart = await page.evaluate(() => playedPaths.length);
            await page.locator('#nextAdvancedSentence').click();
            assert.equal(await page.evaluate(() => state.featuredAdvancedCard.itemNum), 2);
            await page.locator('#previousAdvancedSentence').click();
            assert.equal(await page.evaluate(() => state.featuredAdvancedCard.itemNum), 1);
            assert.equal(await page.evaluate(() => playedPaths.length), navigationStart, 'Sentence arrows navigate independently of playback');
            const before = await page.evaluate(() => playedPaths.length);
            await page.locator('#sequencePlayBtn').click();
            assert.equal(await page.locator('#sequencePlayBtn').isDisabled(), true);
            await page.waitForFunction(() => !state.isPlayingSequence);
            const played = await page.evaluate(start => playedPaths.slice(start), before);
            assert.equal(played.length, 3, 'Sequence should play featured sentence followed by two slots');
            assert.equal(played[0], '/sounds/advanced/2/2/1.m4a');
            await page.setViewportSize({ width: viewport.height, height: viewport.width });
            await inViewport(page, 'header button');
            assert.deepEqual(await page.evaluate(() => state.row1Slots.filter(Boolean).map(item => [item.categoryId, item.id])), expected, 'Rotation must preserve slot assignments');
            await page.setViewportSize(viewport);
            await page.waitForFunction(() => Math.abs(parseFloat(document.documentElement.style.getPropertyValue('--app-height')) - window.innerHeight) < 2);
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            if (viewport.width === 390 || viewport.width === 768 || viewport.height === 390) {
                await page.screenshot({ path: `/private/tmp/senb-${name}-${viewport.width}x${viewport.height}.png`, fullPage: true });
            }
            await page.locator('#clearBoardBtn').click();
            await page.evaluate(()=>{while(state.deleteMode){const card=document.querySelector('#workplaceView .workplace-delete-card');if(!card)break;card.click();}});
            assert.equal(await page.evaluate(() => state.row1Slots.every(item => !item) && state.row2Slots.every(item => !item) && !state.featuredAdvancedCard), true);
            if (viewport.width === 320) {
                // The reported five-word preset: subject, adjective, verb, preposition, object.
                await page.locator('#featuredCard').click();
                await page.locator('[data-advanced-group="5"]').click();
                await page.locator('[data-advanced-subgroup="8"]').click();
                await page.locator('#advItemsGrid .picker-card').first().click();
                assert.equal(await page.locator('#featuredCard img').getAttribute('src'), 'images/advanced/6/8/1.webp');
                const verbBox = await page.locator('#slot-1-2').boundingBox();
                await page.locator('#slot-1-2').click({ position: { x: verbBox.width - 8, y: verbBox.height - 8 } });
                assert.equal((await page.evaluate(() => playedPaths)).at(-1), '/sounds/verbs/present/he/14.m4a');
                const start = await page.evaluate(() => playedPaths.length);
                await page.locator('#sequencePlayBtn').click();
                await page.waitForFunction(() => !state.isPlayingSequence);
                const sequence = await page.evaluate(start => playedPaths.slice(start), start);
                assert.equal(sequence.length, 6);
                assert.equal(sequence[0], '/sounds/advanced/5/8/1.m4a');
                assert.equal(sequence[3], '/sounds/verbs/present/he/14.m4a');

                // Dynamically inserted future verbs must use the same earlier female subject
                // in their rendered title and in both audio clips, even after a modifier/gap.
                await page.evaluate(() => {
                    state.row1Slots = [
                        { ...ITEMS_DATABASE['01 subject'][1], categoryId: '01 subject' },
                        { ...ITEMS_DATABASE['05 adjectives'][0], categoryId: '05 adjectives' },
                        null,
                        { id: 14, categoryId: '02 verbs', verbTense: 'future', title: 'قعد' },
                        null, null
                    ];
                    renderWorkplace();
                });
                assert.equal(await page.locator('#slot-1-3 img').getAttribute('alt'), 'بدها تقعد');
                const futureStart = await page.evaluate(() => playedPaths.length);
                const futureBox = await page.locator('#slot-1-3').boundingBox();
                await page.locator('#slot-1-3').click({ position: { x: futureBox.width - 8, y: futureBox.height - 8 } });
                await page.waitForFunction(() => playedPaths.at(-1).endsWith('/present/she/14.m4a'));
                assert.deepEqual((await page.evaluate(() => playedPaths)).slice(futureStart), [
                    '/sounds/verbs/present/she/15.m4a', '/sounds/verbs/present/she/14.m4a'
                ]);
            }
            assert.deepEqual(errors, []);
            console.log(`PASS ${name} ${viewport.width}x${viewport.height}: startup, toolbar, dialogs, slots, grammar, covers, advanced mapping, and audio order`);
            await context.close();
        }
    } finally { await browser.close(); }
}
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    if (process.env.SENB_ENGINE !== 'webkit') await run(chromium, 'chromium');
    if (process.env.SENB_SKIP_WEBKIT !== '1') await run(webkit, 'webkit');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
