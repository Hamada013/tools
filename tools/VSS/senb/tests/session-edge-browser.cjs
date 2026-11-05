const { solveParentGate } = require('../../../tests/solve-parent-gate.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, webkit } = require(process.env.SENB_PLAYWRIGHT || path.resolve(__dirname, '../../voc/node_modules/playwright'));
const root = path.resolve(__dirname, '../../../..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.m4a': 'audio/mp4', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
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
    const engine = process.env.SENB_ENGINE === 'webkit' ? webkit : chromium;
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const browser = await engine.launch({ headless: true, ...(engine === chromium && fs.existsSync(chromePath) ? { executablePath: chromePath } : {}) });
    try {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
        await context.route('https://**', route => route.abort());
        await context.addInitScript(() => {
            localStorage.setItem('voc-children-v1', JSON.stringify({ schema: 1, active: 'session-edge-child', children: [{ id: 'session-edge-child', name: 'نور', words: {}, sessions: [] }] }));
            const originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = function (key, value) {
                if (window.edgeStorageBlocked && key === 'voc-children-v1') throw new DOMException('Storage full', 'QuotaExceededError');
                return originalSetItem.call(this, key, value);
            };
            window.edgeClips = [];window.edgeRepetitions=0;
            HTMLMediaElement.prototype.play = function () {
                clearTimeout(this.edgeTimer);
                window.edgeClips.push(this.src);const r=window.SenbSession?.state();if(r?.phase==='automation'&&SenbSessionModel.stages(r.worked)[r.stageIndex]?.id==='repetition')window.edgeRepetitions++;
                this.edgeTimer = setTimeout(() => this.dispatchEvent(new Event('ended')), 20);
                return Promise.resolve();
            };
            HTMLMediaElement.prototype.pause = function () { clearTimeout(this.edgeTimer); };
        });
        const page = await context.newPage();
        const errors = []; page.on('pageerror', error => errors.push(error.message)); page.setDefaultTimeout(20000);
        const url = `http://127.0.0.1:${server.address().port}/tools/VSS/senb/index.html`;
        await context.route('**/tools/VSS/senb/index.html',route=>route.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(root,'tools/VSS/senb/index.html'),'utf8').replace(/<link[^>]+(?:googleapis|gstatic)[^>]*>/g,'')}));
        await page.goto(url,{waitUntil:'domcontentloaded'});
        const customBoard = count => page.evaluate(count => {
            navigateTo('workplace');
            const word = { ...ITEMS_DATABASE['03 object'][0], categoryId: '03 object' };
            state.slotCount = 2; state.isMultiline = false; state.isAdvancedMode = false; state.featuredAdvancedCard = null;
            state.row1Slots = Array(6).fill(null); state.row2Slots = Array(6).fill(null);
            for (let index = 0; index < count; index++) state.row1Slots[index] = { ...word };
            renderWorkplace();
            return getWorkplaceSentence();
        }, count);
        const waitDynamic = () => page.waitForFunction(() => SenbSession.state()?.phase === 'dynamic-test' && SenbSession.state().answerReady);
        const waitStage = id => page.waitForFunction(id => {
            const run = SenbSession.state();
            return run?.phase === 'automation' && SenbSessionModel.stages(run.worked)[run.stageIndex]?.id === id;
        }, id);
        const finishSingleDynamic = async () => {
            await page.locator('#workplaceDynamicTest').click();
            await waitDynamic();
            assert.equal(await page.locator('[data-target]').count(), 1, 'A custom single-word row has one target and no invented advanced card');
            const target = await page.evaluate(() => { const run = SenbSession.state(); return run.testOrder?.[run.targetIndex] ?? run.targetIndex; });
            await page.locator(`[data-target="${target}"]`).click();
            await page.locator('#sessionStartAutomation').waitFor();
        };

        console.log('Checking custom-row automation');
        const snapshot = await customBoard(1);
        assert.ok(snapshot.key.startsWith('b:'));
        assert.equal(snapshot.slots.length, 1);
        assert.equal(snapshot.folder, '1');
        assert.equal(snapshot.presentation, 'slots');
        assert.equal(snapshot.imgPath, null);
        assert.equal(snapshot.soundPath, null);
        assert.deepEqual(await page.evaluate(snapshot => SenbSessionModel.stages([snapshot]).map(stage => stage.id), snapshot), ['repetition', 'missing', 'receptive-slots', 'expressive-slots']);
        await finishSingleDynamic();
        await page.locator('#sessionStartAutomation').click();
        await waitStage('repetition');
        await waitStage('missing');
        assert.equal(await page.evaluate(() => edgeRepetitions), 10, 'A single-word custom sentence plays exactly ten complete repetition models');
        assert.equal(await page.evaluate(() => SenbProgress.sessions().filter(session => session.source === 'repetition').length), 1);
        const missing = await page.evaluate(() => {
            const current = SenbSession.state().missing;
            return current.choices.findIndex(slot => SenbSessionModel.wordKey(slot) === current.wanted);
        });
        await page.locator(`[data-missing-choice="${missing}"]`).click();
        await waitStage('receptive-slots');
        await page.waitForFunction(() => document.querySelector('[data-sentence-choice]:not(:disabled)'));
        const choices = await page.evaluate(() => {
            const run = SenbSession.state();
            return { options: run.currentChoices.map(choice => ({ key: choice.key, images: choice.slots.map(SENBActivities.imagePath), advanced: choice.imgPath })), target: run.worked[0].key };
        });
        assert.equal(choices.options.length, 4, 'One-word comprehension still offers four choices');
        assert.equal(new Set(choices.options.map(option => option.images.join('|'))).size, 4, 'All four row choices have different card images');
        assert.ok(choices.options.every(option => option.images.length === 1 && option.advanced === null), 'Custom distractors preserve row length and do not fabricate advanced images');
        const correct = choices.options.findIndex(option => option.key === choices.target);
        await page.locator(`[data-sentence-choice="${correct}"]`).click();
        await waitStage('expressive-slots');
        assert.equal(await page.locator('.session-word-mark').count(), 1);
        await page.locator('.session-word-mark').click();
        await page.locator('#sessionExpressionNext').click();
        await page.waitForFunction(() => SenbSession.state()?.phase === 'finished');
        const sessions = await page.evaluate(() => SenbProgress.sessions());
        assert.equal(sessions.filter(session => session.source === 'missing').length, 1);
        for (const source of ['receptive-slots', 'expressive-slots']) {
            const rows = sessions.find(session => session.source === source).records.filter(record => record.entity === 'sentence');
            assert.equal(rows.length, 1, `${source} has one sentence trial for the one sentence practiced`);
            assert.equal(rows[0].correct, 1); assert.equal(rows[0].total, 1);
        }
        assert.equal(sessions.filter(session => /-advanced$/.test(session.source)).length, 0, 'The custom row never enters or logs an advanced assessment');

        console.log('Checking duplicate targets');
        // Two visible copies of one word represent equivalent answers in dynamic testing.
        await page.locator('#sessionHome').click();
        const duplicate = await customBoard(2);
        assert.ok(duplicate.key.startsWith('b:'));
        await page.locator('#workplaceDynamicTest').click(); await waitDynamic();
        assert.equal(await page.locator('[data-target]').count(), 2);
        assert.equal(await page.evaluate(() => SenbSession.state().targets[0].key === SenbSession.state().targets[1].key), true);
        const firstTarget = await page.evaluate(() => { const run = SenbSession.state(); return run.testOrder?.[run.targetIndex] ?? run.targetIndex; });
        await page.locator(`[data-target="${1 - firstTarget}"]`).click();
        await page.waitForFunction(() => SenbSession.state()?.phase === 'dynamic-test' && SenbSession.state().targetIndex === 1 && SenbSession.state().answerReady);
        const secondTarget = await page.evaluate(() => { const run = SenbSession.state(); return run.testOrder?.[run.targetIndex] ?? run.targetIndex; });
        await page.locator(`[data-target="${1 - secondTarget}"]`).click();
        await page.locator('#sessionStartAutomation').waitFor();
        assert.deepEqual(await page.evaluate(() => SenbSession.state().dynamicRecords.map(record => record.correct)), [1, 1], 'Either matching word position is accepted without first-answer penalties');
        await page.locator('#sessionCancelAutomation').click();

        console.log('Checking repeat and cancel');
        // Repeat allows arbitrary selections and accumulates every completed sentence.
        await customBoard(1); await finishSingleDynamic();
        await page.locator('#sessionChooseMore').click();
        assert.equal(await page.evaluate(() => state.currentView), 'workplace');
        assert.equal(await page.evaluate(() => getWorkplaceSentence().slots.length), 1);
        for (const item of [7, 19]) {
            await page.evaluate(item => { loadAdvancedSentence(getAdvancedItemData('2', 1, item)); renderWorkplace(); }, item);
            await page.locator('#workplaceDynamicTest').click();
            while (await page.evaluate(() => SenbSession.state().phase !== 'another')) {
                await waitDynamic();
                const target = await page.evaluate(() => { const r=SenbSession.state(); return r.testOrder[r.targetIndex]; });
                await page.locator(`[data-target="${target}"]`).click();
                await page.waitForTimeout(800);
            }
            if (item === 7) await page.locator('#sessionChooseMore').click();
        }
        assert.equal(await page.evaluate(() => SenbSession.state().worked.length), 3);
        assert.deepEqual(await page.evaluate(() => SenbSession.state().worked.map(s => s.itemNum)), [null, 7, 19]);
        const selected = await page.evaluate(() => getWorkplaceSentence().key);
        const completed = await page.evaluate(() => SenbProgress.sessions().length);
        await page.locator('#sessionCancelAutomation').click();
        assert.equal(await page.evaluate(() => state.currentView), 'workplace');
        assert.equal(await page.evaluate(() => getWorkplaceSentence().key), selected, 'Cancel preserves the selected scene');
        assert.equal(await page.evaluate(() => SenbSession.state()), null);
        assert.equal(await page.evaluate(() => SenbProgress.draft()), null);
        assert.equal(await page.evaluate(() => SenbProgress.sessions().length), completed, 'Cancel never starts or logs automation');
        await customBoard(1); await finishSingleDynamic();
        const selectedCards = await page.evaluate(() => getWorkplaceSentence().key);
        await page.locator('#sessionCancelAutomation').click();
        assert.equal(await page.evaluate(() => getWorkplaceSentence().key), selectedCards, 'Cancel also preserves a custom card row');

        console.log('Checking profile isolation');
        // Quota failures keep the new identity in memory and must discard the prior child's live run.
        const otherChildWord = await page.evaluate(() => {
            const originalName = SenbProgress.active().name;
            SenbProgress.signIn('عمر');
            const word = { ...ITEMS_DATABASE['03 object'][1], categoryId: '03 object' };
            SenbProgress.saveWorkspace({ ...workplaceStateSnapshot(), slotCount: 2, isMultiline: false, isAdvancedMode: false, featuredAdvancedCard: null,
                row1Slots: [word, null, null, null, null, null], row2Slots: Array(6).fill(null) });
            SenbProgress.signIn(originalName);
            return word.id;
        });
        await customBoard(1);
        await page.locator('#workplaceDynamicTest').click();
        await page.locator('#sessionPause').click();
        await page.locator('#sessionExit').click();
        await page.locator('[data-senb-child-profile]').click(); await solveParentGate(page);
        await page.locator('#senb-child-dialog[open]').waitFor();
        await page.evaluate(() => { window.edgeStorageBlocked = true; });
        await page.locator('.senb-saved-children button').filter({ hasText: 'عمر' }).click();
        await page.waitForFunction(() => SenbProgress.active()?.name === 'عمر' && !document.querySelector('#senb-child-dialog[open]'));
        assert.equal(await page.evaluate(() => SenbProgress.storageOK()), false);
        assert.equal(await page.evaluate(() => SenbSession.state()), null, 'A storage-blocked profile change must clear the previous child’s live session');
        assert.equal(await page.evaluate(() => SenbProgress.draft()), null, 'The new child does not inherit the prior child’s session draft');
        assert.equal(await page.evaluate(() => state.row1Slots[0]?.id), otherChildWord, 'The new child’s own workspace is restored without reloading');
        assert.equal(await page.evaluate(() => state.featuredAdvancedCard), null);
        assert.deepEqual(await page.evaluate(() => SenbProgress.sessions()), []);
        assert.equal(await page.evaluate(() => SenbProgress.lesson()), null);
        await page.locator('.senb-storage-error').waitFor();
        assert.deepEqual(errors, []);
        console.log(`PASS (${engine === webkit ? 'WebKit' : 'Chromium'}): custom single-word snapshots, ten repetitions, missing word, four unique row choices, row-only one-trial assessments, interchangeable duplicate cards, arbitrary sentence collection, cancellation, and storage-blocked profile isolation.`);
        await context.close();
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { server.closeAllConnections(); server.close(); });
