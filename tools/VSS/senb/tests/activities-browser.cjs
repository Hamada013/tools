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

async function assertLayout(page) {
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Page must not overflow horizontally');
    if (await page.locator('.comprehension-header-active').count()) {
        assert.equal(await page.locator('.app-header #activityHeading, .app-header #activityStars, .app-header #testListenBtn, .app-header #activitySetupBtn').count(), 4, 'Comprehension title, stars, sound, and settings belong in the header');
        assert.equal(await page.locator('#activityContent .activity-top, #activityContent .activity-stars, #activityContent #testListenBtn').count(), 0, 'Only the choices and status occupy the comprehension body');
        const outsideHeader = await page.locator('#comprehensionHeader h2, #comprehensionHeader p, #comprehensionHeader button, #comprehensionHeader .activity-star').evaluateAll(nodes => nodes.filter(node => {
            const box = node.getBoundingClientRect();
            const header = document.querySelector('.app-header').getBoundingClientRect();
            return box.width && (box.left < -1 || box.right > innerWidth + 1 || box.top < header.top - 1 || box.bottom > header.bottom + 1);
        }).map(node => node.id || node.className));
        assert.deepEqual(outsideHeader, [], 'Header content remains visible without clipping');
    } else {
        assert.equal(await page.locator('#comprehensionHeader').isVisible(), false, 'Session controls disappear outside comprehension');
        assert.equal(await page.locator('#comprehensionHeader').textContent(), '');
    }
    const outside = await page.locator('#activityContent button, #activityContent img').evaluateAll(nodes => nodes.filter(node => {
        const rect = node.getBoundingClientRect();
        return rect.width && (rect.left < -1 || rect.right > innerWidth + 1);
    }).map(node => node.outerHTML.slice(0, 180)));
    assert.deepEqual(outside, [], 'Activity cards must fit the screen width');
    if (await page.locator('#activityAdvancedCard').count() && !await page.locator('.fixed-session').count()) {
        const image = await page.locator('#activityAdvancedCard').boundingBox();
        assert.ok(Math.abs(image.width / image.height - 16 / 9) < .01, 'Advanced cards must keep a 16:9 ratio in every activity');
    }
    if (await page.locator('.fixed-session').count()) {
        const bounds = await page.locator('#activityView').evaluate(view => ({ scroll: view.scrollHeight - view.clientHeight, outside: [...view.querySelectorAll('button, img, p, span')].filter(node => {
            const box = node.getBoundingClientRect(), rect = view.getBoundingClientRect();
            return box.width && box.height && (box.top < rect.top - 1 || box.bottom > rect.bottom + 1);
        }).map(node => node.id || node.className) }));
        assert.ok(bounds.scroll <= 1, JSON.stringify(bounds));
        assert.deepEqual(bounds.outside, [], 'All game and expressive content fits without clipping');
    }
    const invalidIcons = await page.locator('.activity-icon-button:visible').evaluateAll(nodes => nodes.filter(node => {
        const rect = node.getBoundingClientRect();
        return node.textContent.trim() || !node.querySelector('svg') || !node.getAttribute('aria-label') || rect.width < 44 || rect.height < 44;
    }).map(node => node.id));
    assert.deepEqual(invalidIcons, [], 'Icon buttons must retain accessible names and touch-sized targets');
    if (await page.locator('#activityView.comprehension-session').count() && page.viewportSize().width >= 768 && page.viewportSize().height >= 600) {
        const bounds = await page.evaluate(() => {
            const view = document.getElementById('activityView');
            const rect = view.getBoundingClientRect();
            return { scrollHeight: view.scrollHeight, clientHeight: view.clientHeight, top: rect.top, bottom: rect.bottom, outside: [...view.querySelectorAll('button, img, #activityStatus')].filter(node => {
                const box = node.getBoundingClientRect();
                return box.height && (box.top < rect.top - 1 || box.bottom > rect.bottom + 1);
            }).map(node => node.id || node.className) };
        });
        assert.ok(bounds.scrollHeight <= bounds.clientHeight + 1, `Desktop comprehension must fit without scrolling: ${JSON.stringify(bounds)}`);
        assert.deepEqual(bounds.outside, [], 'Every choice and control must fit vertically without clipping');
        assert.equal(await page.locator('.comprehension-option').count(), 4);
        const grid = await page.locator('.comprehension-grid').boundingBox();
        assert.ok(grid.height > (bounds.bottom - bounds.top) * .85, 'Images receive most of the available content height');
    }
}
async function assertTestPicker(page) {
    const grid = await page.locator('.test-mode-grid').boundingBox();
    const content = await page.locator('#activityContent').boundingBox();
    const view = await page.locator('#activityView').boundingBox();
    // Center within the content area, excluding the RTL scrollbar gutter.
    assert.ok(Math.abs(grid.x + grid.width / 2 - (content.x + content.width / 2)) < 2, `Test choices must be centered horizontally: ${JSON.stringify({ grid, content, view })}`);
    assert.ok(Math.abs(grid.y + grid.height / 2 - (view.y + view.height / 2)) < 65, 'Test choices must be near the center of the available screen');
    await assertLayout(page);
}
async function setup(page, mode, folder, subgroup, presentation, trials = 3) {
    await page.locator('#activityHomeBtn').click();
    await page.locator(mode === 'repetition' ? '#homeTasksBtn' : mode === 'game' ? '#homeGameBtn' : '#homeTestBtn').click();
    if (mode === 'comprehension' || mode === 'expressive') {
        await assertTestPicker(page);
        await page.locator(mode === 'comprehension' ? '#chooseComprehension' : '#chooseExpressive').click();
    }
    assert.equal(await page.locator('#startActivityBtn').isDisabled(), true);
    await page.locator(`[data-folder="${folder}"]`).click();
    if (mode === 'comprehension' || mode === 'expressive') {
        assert.equal(await page.locator('[data-subgroup]').count(), 9);
        assert.deepEqual(await page.locator('[data-trial-count]').allTextContents(), ['3', '4', '5', '6', '7', '8', '9', '10']);
        assert.equal(await page.locator('[data-trial-count="3"]').getAttribute('aria-pressed'), 'true');
        if (trials !== 3) {
            await page.locator(`[data-trial-count="${trials}"]`).click();
            assert.match(await page.locator('#assessmentTrialInfo').textContent(), new RegExp(`${trials * 8} محاولة`));
        }
        assert.equal(await page.locator('[data-subgroup="all"]').getAttribute('aria-pressed'), 'true');
        if (!subgroup) {
            await page.locator('[data-subgroup="8"]').click();
            await page.locator('[data-subgroup="all"]').click();
        }
    }
    if (subgroup) await page.locator(`[data-subgroup="${subgroup}"]`).click();
    if (presentation) await page.locator(`[data-presentation="${presentation}"]`).click();
    if (mode === 'comprehension' || mode === 'expressive') assert.equal(await page.locator(`[data-trial-count="${trials}"]`).getAttribute('aria-pressed'), 'true', 'Changing subgroup or presentation retains the trial count');
    await page.locator('#startActivityBtn').click();
    await assertLayout(page);
}
async function run(browserType, name) {
    const options = { headless: true };
    const chromePath = process.env.SENB_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (name === 'chromium' && fs.existsSync(chromePath)) options.executablePath = chromePath;
    const browser = await browserType.launch(options);
    try {
        const viewports = [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1366, height: 768 }, { width: 1280, height: 640 }, { width: 1920, height: 1080 }];
        for (const viewport of process.env.SENB_ACTIVITY_SMOKE === '1' ? viewports.slice(0, 1) : viewports) {
            const context = await browser.newContext({ viewport, hasTouch: true });
            await context.route('https://**', route => route.abort());
            await context.addInitScript(() => localStorage.setItem('voc-children-v1', JSON.stringify({ schema: 1, active: 'activity-child', children: [{ id: 'activity-child', name: 'علي', senb: {} }] })));
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.goto(`http://127.0.0.1:${server.address().port}/index.html`, { waitUntil: 'domcontentloaded' });
            assert.equal(await page.locator('.home-menu-card').count(), 4);
            assert.deepEqual(await page.locator('#homeFooter p').allTextContents(), ['SPEECH AND LANGUAGE PATHOLOGY', 'Ahmad Ghanem', 'Latakia - Syria', 'slp.ahmadghanem@gmail.com']);
            assert.deepEqual(await page.locator('.brand-logo, .home-logo').evaluateAll(nodes => nodes.map(node => {
                const style = getComputedStyle(node);
                return [style.borderTopWidth, style.backgroundColor, style.backgroundImage, style.boxShadow, style.paddingTop];
            })), Array(2).fill(['0px', 'rgba(0, 0, 0, 0)', 'none', 'none', '0px']), 'Both logos use the original image without a decorative frame');
            assert.equal(await page.locator('#activityHomeBtn').isVisible(), false);
            assert.equal(await page.locator('.app-header #pwaDownloadToggle svg').count(), 1);
            assert.equal(await page.locator('#pwaInstallBtn, #offlinePauseBtn, #offlineCloseBtn').count(), 0);
            assert.equal(await page.locator('#pwaDownloadToggle, #offlinePanel').count(), 2, 'Header download controls are present');
            if (viewport.width >= 768 && viewport.height >= 600) {
                const home = await page.locator('#homeView').evaluate(view => {
                    const bounds = view.getBoundingClientRect();
                    return { scrollHeight: view.scrollHeight, clientHeight: view.clientHeight, outside: [...view.querySelectorAll('img, h1, p, button:not([hidden])')].filter(node => {
                        const box = node.getBoundingClientRect();
                        return box.height && (box.top < bounds.top - 1 || box.bottom > bounds.bottom + 1);
                    }).map(node => node.id || node.className) };
                });
                assert.ok(home.scrollHeight <= home.clientHeight + 1, `Desktop home must fit without scrolling: ${JSON.stringify(home)}`);
                assert.deepEqual(home.outside, [], 'Home logo, menu, and contact details must remain visible');
            }
            await page.screenshot({ path: `/private/tmp/senb-${name}-${viewport.width}-home.png` });
            if (process.env.SENB_HOME_ONLY === '1') {
                await page.locator('#pwaDownloadToggle').click();
                assert.equal(await page.locator('#offlinePanel button').count(), 1);
                assert.equal(await page.locator('#offlineDownloadBtn').textContent(), 'تنزيل');
                await page.keyboard.press('Escape');
                assert.equal(await page.locator('#offlinePanel').isVisible(), false);
                await page.locator('#homeWorkplaceBtn').click();
                assert.equal(await page.locator('#workplaceView').isVisible(), true);
                assert.equal(await page.locator('#pwaDownloadToggle').isVisible(), false);
                await page.locator('.app-brand').click();
                assert.equal(await page.locator('#homeView').isVisible(), true);
                assert.equal(await page.locator('#pwaDownloadToggle').isVisible(), true);
                assert.deepEqual(errors, []);
                console.log(`PASS ${name} ${viewport.width}x${viewport.height}: home layout, single download icon/dialog, menu navigation, percentage progress`);
                await context.close();
                continue;
            }
            await page.locator('#homeTestBtn').click();
            await assertTestPicker(page);
            if (viewport.width === 768 || viewport.width === 1366) await page.screenshot({ path: `/private/tmp/senb-${name}-${viewport.width}-test-picker.png` });
            await page.locator('#activityHomeBtn').click();
            await page.evaluate(() => {
                state.row1Slots = [{ ...ITEMS_DATABASE['01 subject'][1], categoryId: '01 subject' }, { id: 14, title: 'قعد', categoryId: '02 verbs', verbTense: 'future' }, null, null, null, null];
                window.manualBoardBefore = JSON.stringify(state.row1Slots);
            });
            await page.locator('#homeTasksBtn').click();
            await page.locator('[data-folder="5"]').click();
            await page.locator('[data-subgroup="8"]').click();
            await page.locator('#startActivityBtn').click();
            if (viewport.width === 320) {
                // Real recorded sentence playback after a touch gesture in both engines.
                await page.locator('#activityAdvancedCard').tap();
                await page.waitForFunction(() => playbackAudio.currentTime > 0, null, { timeout: 10000 });
                assert.equal(await page.evaluate(() => playbackAudio.error), null);
            }
            await page.evaluate(() => {
                stopActivityPlayback();
                window.playedPaths = [];
                window.clipDuration = 12;
                HTMLMediaElement.prototype.play = function () {
                    playedPaths.push(new URL(this.src).pathname);
                    const ended = this.onended;
                    setTimeout(() => ended?.(), clipDuration);
                    return Promise.resolve();
                };
            });
            assert.equal(await page.locator('#activityStage select').count(), 0);
            assert.deepEqual(await page.locator('[data-repeat-count]').allTextContents(), ['1', '2', '3', '4', '5']);
            await page.locator('[data-repeat-count="2"]').click();
            assert.equal(await page.locator('[data-repeat-count="2"]').getAttribute('aria-pressed'), 'true');
            await page.locator('#repeatPlayBtn').click();
            assert.equal(await page.locator('#activityStatus').textContent(), '', 'Playback does not show a repetition counter');
            await page.waitForFunction(() => activity.completed.size === 1 && !activity.busy);
            const paths = await page.evaluate(() => playedPaths);
            const expected = ['/sounds/advanced/5/8/1.m4a', '/sounds/subject/1.m4a', '/sounds/adjectives/male/43.m4a', '/sounds/verbs/present/he/14.m4a', '/sounds/prepositions/9.m4a', '/sounds/object/28.m4a'];
            assert.deepEqual(paths, [...expected, ...expected], 'Each repeat must include the advanced sentence followed by all contextual slot recordings');
            assert.equal(await page.locator('.activity-star').count(), 24);
            assert.equal(await page.locator('.activity-star.lit').count(), 1);
            await page.locator('#repeatNextBtn').click();
            assert.equal(await page.evaluate(() => activity.index), 1);
            await page.locator('#repeatPreviousBtn').click();
            assert.equal(await page.evaluate(() => activity.index), 0);
            await page.locator('[data-repeat-count="1"]').click();
            await page.locator('#repeatAutoBtn').click();
            assert.equal(await page.locator('#activityContent').getAttribute('aria-busy'), 'true');
            await page.waitForFunction(() => activity.index === 1);
            await page.locator('#repeatAutoBtn').click();
            assert.equal(await page.locator('#activityContent').getAttribute('aria-busy'), 'false');
            const stoppedIndex = await page.evaluate(() => activity.index);
            await page.waitForTimeout(650);
            assert.equal(await page.evaluate(() => activity.index), stoppedIndex, 'Pause must stop automatic advancement');
            await assertLayout(page);
            if (process.env.SENB_ACTIVITY_SMOKE !== '1' && (viewport.width === 320 || viewport.width === 768)) {
                await page.screenshot({ path: `/private/tmp/senb-${name}-${viewport.width}-repetition.png` });
                await setup(page, 'comprehension', 2);
                for (let index = 0; index < 24; index++) {
                    await page.waitForFunction(() => activity.phase === 'answer');
                    assert.equal(await page.locator('.comprehension-option').count(), 4);
                    assert.equal(await page.locator('.comprehension-option').allTextContents().then(text => text.join('').trim()), '');
                    assert.equal(await page.locator('.activity-slot-dot, .activity-sentence-title').count(), 0);
                    const answer = await page.evaluate(index => {
                        const trial = activity.plan[activity.index];
                        return trial.choices.findIndex(sentence => (SENBActivities.key(sentence) === SENBActivities.key(trial.target)) === (index % 2 === 0));
                    }, index);
                    if (!index) await page.screenshot({ path: `/private/tmp/senb-${name}-${viewport.width}-comprehension.png` });
                    await page.locator(`[data-choice="${answer}"]`).tap();
                    // A second tap cannot overwrite the first recorded answer.
                    await page.evaluate(() => answerComprehension(0));
                    await page.waitForFunction(count => activity.results.length === count, index + 1);
                    if (index < 23) await page.waitForFunction(count => activity.index === count, index + 1);
                }
                await page.locator('.activity-result-total').waitFor();
                assert.equal(await page.locator('.activity-result-total').textContent(), '50%');
                assert.equal(await page.locator('[data-result-subgroup]').count(), 8);
                assert.deepEqual(await page.locator('[data-result-subgroup] td:last-child').allTextContents(), ['66.7%', '33.3%', '66.7%', '33.3%', '66.7%', '33.3%', '66.7%', '33.3%']);
                const comprehensionDownload = page.waitForEvent('download');
                await page.locator('#downloadActivityResultsBtn').click();
                const comprehensionPdf = await comprehensionDownload;
                assert.equal(comprehensionPdf.suggestedFilename(), 'senb-comprehension-2-words.pdf');
                await comprehensionPdf.saveAs(`/private/tmp/senb-${name}-${viewport.width}-comprehension-report.pdf`);
                assert.equal(fs.readFileSync(`/private/tmp/senb-${name}-${viewport.width}-comprehension-report.pdf`).subarray(0, 8).toString(), '%PDF-1.4');
                await assertLayout(page);
                assert.equal(await page.evaluate(() => activity.results.every((result, index) => Number(result.subgroup) === Math.floor(index / 3) + 1)), true);
                await setup(page, 'comprehension', 6, null, 'slots');
                await page.waitForFunction(() => activity.phase === 'answer');
                assert.equal(await page.locator('.comprehension-option img').count(), 24);
                assert.equal(await page.locator('.comprehension-option').allTextContents().then(text => text.join('').trim()), '');
                assert.equal(await page.locator('.activity-slot-dot, .activity-sentence-title').count(), 0);
                await assertLayout(page);
                await setup(page, 'expressive', 5);
                for (let index = 0; index < 24; index++) {
                    assert.equal(await page.locator('.word-score-dot').count(), 5);
                    assert.equal(await page.locator('.activity-slot').count(), 0);
                    assert.ok(await page.locator('.activity-sentence-title').textContent());
                    await page.locator('.word-score-dot').nth(0).tap();
                    await page.locator('.word-score-dot').nth(2).tap();
                    assert.equal(await page.locator('.word-score-dot.marked').count(), 2);
                    if (!index) await page.screenshot({ path: `/private/tmp/senb-${name}-${viewport.width}-expressive.png` });
                    await page.locator('#expressiveNextBtn').click();
                }
                assert.equal(await page.locator('.activity-result-total').textContent(), '2');
                assert.equal(await page.locator('[data-result-subgroup]').count(), 8);
                assert.deepEqual(await page.locator('[data-result-subgroup] td:first-of-type').allTextContents(), Array(8).fill('2'));
                assert.deepEqual(await page.locator('[data-result-subgroup] td:last-child').allTextContents(), Array(8).fill('3'));
                const expressiveDownload = page.waitForEvent('download');
                await page.locator('#downloadActivityResultsBtn').click();
                const expressivePdf = await expressiveDownload;
                await expressivePdf.saveAs(`/private/tmp/senb-${name}-${viewport.width}-expressive-report.pdf`);
                assert.match(fs.readFileSync(`/private/tmp/senb-${name}-${viewport.width}-expressive-report.pdf`).toString('latin1'), /\/Count \d+/, 'The concise subgroup report exports complete PDF pages');
                assert.equal(await page.evaluate(() => activity.results.every(result => result.words === 2)), true);
                await assertLayout(page);
                await page.screenshot({ path: `/private/tmp/senb-${name}-${viewport.width}-result.png` });
                for (const presentation of ['advanced', 'slots']) {
                    await setup(page, 'comprehension', 2, 8, presentation);
                    assert.equal(await page.evaluate(() => activity.plan.length), 3);
                    assert.equal(await page.locator('.activity-star').count(), 3);
                    for (let index = 0; index < 3; index++) {
                        await page.waitForFunction(() => activity.phase === 'answer');
                        assert.equal(await page.evaluate(() => currentActivitySentence().subCatId), '8');
                        const answer = await page.evaluate(index => {
                            const trial = activity.plan[activity.index];
                            return trial.choices.findIndex(sentence => (SENBActivities.key(sentence) === SENBActivities.key(trial.target)) === (index < 2));
                        }, index);
                        await page.locator(`[data-choice="${answer}"]`).tap();
                        if (index < 2) await page.waitForFunction(next => activity.index === next, index + 1);
                    }
                    await page.locator('.activity-result-total').waitFor();
                    assert.equal(await page.locator('.activity-result-total').textContent(), '66.7%', 'Single-subgroup comprehension must score two correct answers out of three');
                    assert.equal(await page.evaluate(() => activity.results.length), 3);
                    assert.match(await page.locator('.activity-summary').textContent(), /المجموعة الفرعية 8/);
                }
                await setup(page, 'expressive', 5, 8);
                assert.equal(await page.locator('.activity-star').count(), 3);
                for (let index = 0; index < 3; index++) {
                    assert.equal(await page.evaluate(() => currentActivitySentence().subCatId), '8');
                    for (let word = 0; word < index * 2 + 1; word++) await page.locator('.word-score-dot').nth(word).tap();
                    await page.locator('#expressiveNextBtn').click();
                }
                assert.equal(await page.locator('.activity-result-total').textContent(), '3', 'Nine spoken words in three trials gives MLU 3');
                assert.equal(await page.evaluate(() => activity.results.length), 3);
                await page.locator('#testRestartBtn').click();
                assert.equal(await page.locator('[data-subgroup="8"]').getAttribute('aria-pressed'), 'true');
                await page.locator('[data-folder="3"]').click();
                assert.equal(await page.locator('[data-subgroup="all"]').getAttribute('aria-pressed'), 'true', 'Changing sentence length must reset the subgroup selection');
                if (viewport.width === 768) await page.screenshot({ path: `/private/tmp/senb-${name}-${viewport.width}-test-subgroups.png` });
            }
            await setup(page, 'comprehension', 2, null, 'advanced', 10);
            assert.equal(await page.evaluate(() => activity.plan.length), 80);
            assert.equal(await page.locator('.activity-star').count(), 80);
            await assertLayout(page);
            if (viewport.width >= 1024) await page.screenshot({ path: `/private/tmp/senb-${name}-${viewport.width}-comprehension-fit.png` });
            await page.locator('#activitySetupBtn').click();
            assert.equal(await page.locator('[data-trial-count="10"]').getAttribute('aria-pressed'), 'true');
            await page.locator('[data-subgroup="8"]').click();
            for (const count of [3, 4, 5, 6, 7, 8, 9, 10]) {
                await page.locator(`[data-trial-count="${count}"]`).click();
                assert.equal(await page.locator(`[data-trial-count="${count}"]`).getAttribute('aria-pressed'), 'true');
            }
            await assertLayout(page);
            if (viewport.width === 320 || viewport.width === 768) await page.screenshot({ path: `/private/tmp/senb-${name}-${viewport.width}-trial-picker.png` });
            await page.locator('#startActivityBtn').click();
            assert.equal(await page.evaluate(() => activity.plan.length), 10);
            assert.match(await page.locator('.activity-progress-label').textContent(), /1 \/ 10/);
            for (let trial = 0; trial < 10; trial++) {
                await page.waitForFunction(() => activity.phase === 'answer');
                const answer = await page.evaluate(() => {
                    const trial = activity.plan[activity.index];
                    return trial.choices.findIndex(sentence => SENBActivities.key(sentence) === SENBActivities.key(trial.target));
                });
                await page.locator(`[data-choice="${answer}"]`).tap();
                if (trial < 9) await page.waitForFunction(next => activity.index === next, trial + 1);
            }
            await page.locator('.activity-result-total').waitFor();
            assert.equal(await page.locator('.activity-result-total').textContent(), '100%');
            assert.equal(await page.locator('[data-result-subgroup="8"] td').first().textContent(), '10 / 10');
            await setup(page, 'expressive', 2, 1, undefined, 4);
            assert.equal(await page.evaluate(() => activity.plan.length), 4);
            const testStartedAt = await page.evaluate(() => activity.testStartedAt.toISOString());
            for (let trial = 0; trial < 4; trial++) {
                await page.locator('.word-score-dot').first().tap();
                await page.locator('#expressiveNextBtn').click();
            }
            assert.equal(await page.locator('.activity-result-total').textContent(), '1');
            assert.equal(await page.locator('[data-result-subgroup="1"] td').first().textContent(), '1');
            assert.equal(await page.locator('[data-word-type],.activity-word-findings').count(),0,'Sentence reports omit word details');
            assert.equal(await page.evaluate(() => activity.reportDate.toISOString()), testStartedAt, 'The report uses the test start date');
            assert.match(await page.locator('.activity-report-meta').allTextContents().then(lines => lines.join(' ')), /SLP\.AHMAD GHANEM/);
            if (viewport.width === 320 || viewport.width === 768) {
                await page.screenshot({ path: `/private/tmp/senb-${name}-${viewport.width}-mlu-report.png`, fullPage: true });
                await page.evaluate(() => {
                    window.reportText = [];
                    const fill = CanvasRenderingContext2D.prototype.fillText;
                    CanvasRenderingContext2D.prototype.fillText = function (value, ...args) { reportText.push(String(value)); return fill.call(this, value, ...args); };
                });
                const sampleDownload = page.waitForEvent('download');
                await page.locator('#downloadActivityResultsBtn').click();
                await (await sampleDownload).saveAs(`/private/tmp/senb-${name}-${viewport.width}-mlu-report.pdf`);
                const drawnText = await page.evaluate(() => reportText.join(' '));
                assert.match(drawnText, /SLP\.AHMAD GHANEM/);
                assert.match(drawnText, /تاريخ الاختبار:/);
                assert.match(drawnText, /MLU = 1/);
                assert.match(drawnText, /فعل حاضر/);
            }
            await setup(page, 'game', 6);
            await page.locator('#activitySetupBtn').click();
            await page.locator('[data-game-subgroup="2"]').click();
            await page.locator('[data-game-subgroup="7"]').click();
            await page.locator('#startActivityBtn').click();
            assert.equal(await page.evaluate(() => activity.bag.length), 48);
            assert.equal(await page.evaluate(() => activity.bag.every(sentence => [2, 7].includes(Number(sentence.subCatId)))), true);
            await assertLayout(page);
            assert.equal(await page.locator('.game-choice').count(), 3);
            assert.equal(await page.locator('#gameMissingSlot').count(), 1);
            assert.equal(await page.locator('#gameNextBtn').isDisabled(), true);
            await page.locator('#gameHintBtn').tap();
            assert.equal(await page.evaluate(() => activity.round.hintUsed), true);
            const correct = await page.evaluate(() => activity.round.choices.findIndex(slot => SENBActivities.imagePath(slot) === SENBActivities.imagePath(activity.round.sentence.slots[activity.round.missingIndex])));
            await page.locator(`[data-game-choice="${(correct + 1) % 3}"]`).tap();
            await page.locator('#gameMissingSlot').tap();
            assert.equal(await page.locator('#gameNextBtn').isDisabled(), true);
            await page.locator(`[data-game-choice="${correct}"]`).tap();
            await page.locator('#gameMissingSlot').tap();
            assert.equal(await page.locator('#gameNextBtn').isDisabled(), false);
            await page.locator('#gameNextBtn').click();
            // Drag with actual captured pointer events; touch selection is covered above.
            await page.locator('.game-choice').first().scrollIntoViewIfNeeded();
            const dragIndex = await page.evaluate(() => activity.round.choices.findIndex(slot => SENBActivities.imagePath(slot) === SENBActivities.imagePath(activity.round.sentence.slots[activity.round.missingIndex])));
            const source = await page.locator(`[data-game-choice="${dragIndex}"]`).boundingBox();
            const target = await page.locator('#gameMissingSlot').boundingBox();
            await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
            await page.mouse.down();
            await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 12 });
            await page.mouse.up();
            assert.equal(await page.evaluate(() => activity.round.solved), true, 'Dragging the matching card should fill the missing slot');
            assert.equal(await page.locator('.game-drag-ghost').count(), 0);
            if (name === 'chromium' && viewport.width === 320) {
                // Exercise real touch pointer capture rather than synthetic JS pointer events.
                await page.locator('#gameNextBtn').click();
                await page.locator('.game-choice').first().scrollIntoViewIfNeeded();
                const touchIndex = await page.evaluate(() => activity.round.choices.findIndex(slot => SENBActivities.imagePath(slot) === SENBActivities.imagePath(activity.round.sentence.slots[activity.round.missingIndex])));
                const from = await page.locator(`[data-game-choice="${touchIndex}"]`).boundingBox();
                const to = await page.locator('#gameMissingSlot').boundingBox();
                const client = await context.newCDPSession(page);
                const x = from.x + from.width / 2, y = from.y + from.height / 2;
                await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
                for (let step = 1; step <= 10; step++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (to.x + to.width / 2 - x) * step / 10, y: y + (to.y + to.height / 2 - y) * step / 10 }] });
                await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
                assert.equal(await page.evaluate(() => activity.round.solved), true, 'Touch dragging should fill the missing slot');
                assert.equal(await page.locator('.game-drag-ghost').count(), 0);
                await client.detach();
            }
            await assertLayout(page);
            if (viewport.width === 320 || viewport.width === 768) await page.screenshot({ path: `/private/tmp/senb-${name}-${viewport.width}-game.png` });
            // Leaving an in-flight sequence must stop audio and keep the manual board.
            await setup(page, 'repetition', 5, 8);
            await page.evaluate(() => { window.clipDuration = 600; playedPaths.length = 0; });
            await page.locator('#repeatAutoBtn').click();
            await page.locator('#activityHomeBtn').click();
            const count = await page.evaluate(() => playedPaths.length);
            await page.waitForTimeout(800);
            assert.equal(await page.evaluate(() => playedPaths.length), count);
            await page.locator('#homeWorkplaceBtn').click();
            assert.equal(await page.locator('#workplaceView').isVisible(), true);
            assert.equal(await page.locator('#activityView').isVisible(), false);
            assert.equal(await page.evaluate(() => state.isPlayingSequence), false);
            assert.equal(await page.evaluate(() => JSON.stringify(state.row1Slots) === manualBoardBefore), true, 'Activities must preserve the original manual slot assignments');
            await page.evaluate(() => {
                state.slotCount = 4;
                const noun = id => ({ ...ITEMS_DATABASE['01 subject'].find(item => item.id === id), categoryId: '01 subject' });
                const pronoun = id => ({ ...ITEMS_DATABASE['07 Pronoun'].find(item => item.id === id), categoryId: '07 Pronoun' });
                const and = { categoryId: '08 linking', id: 3, title: 'و' };
                const verb = { categoryId: '02 verbs', id: 14, verbTense: 'present' };
                state.row1Slots = [noun(1), and, noun(2), verb];
                state.row2Slots = [pronoun(1), and, pronoun(8), verb];
                renderWorkplace();
            });
            assert.equal(await page.locator('#slot-1-3').getAttribute('aria-label'), await page.evaluate(() => VERB_CONJUGATIONS[14].present.they));
            assert.equal(await page.evaluate(() => getDisplayedItemTitle(state.row2Slots[3], 2, 3)), await page.evaluate(() => VERB_CONJUGATIONS[14].present.we));
            assert.equal(await page.locator('.slot-clear,.featured-clear').count(),0);
            const playedBeforeClear = await page.evaluate(() => playedPaths.length);
            await page.locator('#clearBoardBtn').click();
            const clearCard=await page.locator('#slot-1-0').boundingBox();await page.touchscreen.tap(clearCard.x+clearCard.width/2,clearCard.y+clearCard.height/2);
            assert.equal(await page.evaluate(() => state.row1Slots[0]), null);
            assert.equal(await page.evaluate(() => playedPaths.length), playedBeforeClear, 'Delete mode clears the tapped card without playback');
            assert.equal(await page.locator('#slot-1-3').getAttribute('aria-label'), await page.evaluate(() => VERB_CONJUGATIONS[14].present.she));
            await page.evaluate(() => {state.row1Slots=state.row2Slots.map(item=>({...item}));renderWorkplace();});
            await page.locator('#slot-1-0').focus();
            await page.keyboard.press('Enter');
            assert.equal(await page.evaluate(() => state.row1Slots[0]), null, 'Delete mode also works from the keyboard');
            assert.equal(await page.locator('#slot-1-3').getAttribute('aria-label'), await page.evaluate(() => VERB_CONJUGATIONS[14].present.youfemale));
            assert.deepEqual(errors, []);
            console.log(`PASS ${name} ${viewport.width}x${viewport.height}: activity layout, complete-sentence repetition, stars, auto/pause, test plans/scoring, game touch/drag/hint, navigation cancellation`);
            await context.close();
        }
    } finally { await browser.close(); }
}
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        if (process.env.SENB_ACTIVITY_ENGINE !== 'webkit') await run(chromium, 'chromium');
        if (process.env.SENB_ACTIVITY_ENGINE !== 'chromium' && process.env.SENB_SKIP_WEBKIT !== '1') await run(webkit, 'webkit');
    }
    finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
