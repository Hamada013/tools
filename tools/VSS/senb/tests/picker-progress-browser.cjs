const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.SENB_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    let body = fs.readFileSync(file);
    if (file.endsWith('/index.html')) body = Buffer.from(body.toString().replace(/<link[^>]+(?:googleapis|gstatic)[^>]*>/g, ''));
    // Allows this regression to run while the shell integration is developed separately.
    if (file.endsWith('/index.html') && !body.includes('assets/child-progress.js')) body = Buffer.from(body.toString().replace('<script src="assets/app.js"', '<script src="assets/child-progress.js" defer></script><script src="assets/app.js"'));
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
});
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const options = { headless: true };
    const chrome = process.env.SENB_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(chrome)) options.executablePath = chrome;
    const browser = await chromium.launch(options);
    try {
        for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }, { width: 1366, height: 768 }]) {
            const context = await browser.newContext({ viewport });
            await context.route('https://**', route => route.abort());
            await context.addInitScript(() => {
                if (!localStorage.getItem('voc-children-v1')) localStorage.setItem('voc-children-v1', JSON.stringify({ schema: 1, active: 'picker-child', children: [{ id: 'picker-child', name: 'علي', senb: {} }] }));
                window.frameClips=[];
                HTMLMediaElement.prototype.play = function () { clearTimeout(this.frameTimer);window.frameClips.push(this.src);this.frameTimer=setTimeout(() => this.dispatchEvent(new Event('ended')), 20); return Promise.resolve(); };
                HTMLMediaElement.prototype.pause = function () { clearTimeout(this.frameTimer); };
            });
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.goto(`http://127.0.0.1:${server.address().port}/index.html`, { waitUntil: 'domcontentloaded' });
            await page.evaluate(() => navigateTo('workplace'));
            assert.deepEqual(await page.locator('header button:visible').evaluateAll(nodes => nodes.filter(node => {
                const box = node.getBoundingClientRect();
                return box.left < -1 || box.right > innerWidth + 1 || box.bottom > innerHeight + 1 || box.width < 44 || box.height < 44;
            }).map(node => node.getAttribute('aria-label'))), [], 'Header controls remain visible and touch sized');
            if (viewport.width === 320) assert.equal(await page.locator('#workplaceView').evaluate(view => view.scrollHeight <= view.clientHeight + 1), true, 'The default sentence and cards fit below the compact phone header');
            assert.equal(await page.evaluate(() => getWorkplaceSentence().key), 's:2/1/1');
            assert.equal(await page.locator('#slotsRow1 .slot-card').count(), 2);
            await page.locator('#nextAdvancedSentence').click();
            assert.equal(await page.evaluate(() => getWorkplaceSentence().key), 's:2/1/2');
            assert.equal(await page.evaluate(() => state.isPlayingSequence), false);
            await page.reload({waitUntil:'domcontentloaded'});
            await page.evaluate(() => navigateTo('workplace'));
            assert.equal(await page.evaluate(() => getWorkplaceSentence().key), 's:2/1/2', 'Saved board overrides the default');
            await page.evaluate(() => {
                SenbProgress.logSession({ id: 'picker-learned', kind: 'assessment', partial: false, records: [
                    { key: 's:2/1/1', title: 'ولد يأكل', entity: 'sentence', domain: 'receptive', presentation: 'advanced', correct: 4, total: 5 },
                    { key: 'w:01 subject/1', title: 'ولد', entity: 'word', domain: 'receptive', presentation: 'slots', correct: 4, total: 5 }
                ] });
                openAdvancedCategoryModal();
            });
            assert.equal(await page.locator('#advMainCatList').textContent().then(text => text.includes('خانات')), false);
            assert.equal(await page.locator('[data-advanced-subgroup]').count(), 1);
            assert.equal(await page.locator('[data-advanced-subgroup="1"]').getAttribute('aria-pressed'), 'true');
            await page.locator('[data-advanced-group="2"]').click();
            assert.equal(await page.locator('[data-advanced-subgroup]').count(), 8);
            assert.equal(await page.locator('[data-advanced-group="2"]').getAttribute('aria-expanded'), 'true');
            await page.screenshot({path:`/private/tmp/senb-subgroups-${viewport.width}-expanded.png`});
            assert.equal(await page.locator('#advSubCatList').isVisible(), false);
            await page.locator('[data-learned-type="advanced"][data-learned-domain="receptive"]').click();
            assert.equal(await page.locator('#advItemsGrid .picker-card').count(), 1);
            await page.locator('[data-learned-type="advanced"][data-learned-domain="receptive"]').click();
            assert.equal(await page.locator('#advItemsGrid .picker-card').count(), 24, 'Main categories retain every item');
            await page.locator('[data-advanced-subgroup="2"]').click();
            assert.equal(await page.locator('[data-advanced-subgroup]').count(), 1, 'Selecting a subgroup collapses its siblings');
            assert.equal(await page.locator('[data-advanced-group="2"]').getAttribute('aria-expanded'), 'false');
            assert.equal(await page.locator('[data-advanced-subgroup="2"]').evaluate(button => getComputedStyle(button).backgroundColor), 'rgb(220, 245, 231)');
            await page.waitForFunction(() => { const image=document.querySelector('#advItemsGrid img'); return image?.complete && image.naturalWidth > 0; });
            await page.screenshot({path:`/private/tmp/senb-subgroups-${viewport.width}-selected.png`});
            assert.equal(await page.evaluate(() => state.advSubCatId), 2);
            await page.evaluate(() => { closeAdvancedModal(); openAdvancedCategoryModal(); });
            assert.equal(await page.locator('[data-advanced-subgroup="2"]').getAttribute('aria-pressed'), 'true');
            await page.locator('[data-advanced-subgroup="2"]').click();
            assert.equal(await page.locator('[data-advanced-subgroup]').count(), 8, 'The retained choice can reopen all subgroups');
            await page.locator('[data-advanced-subgroup="2"]').click();
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
            await page.evaluate(() => { closeAdvancedModal(); openCategoryModal(1, 0); });
            await page.locator('[data-learned-type="basic"][data-learned-domain="receptive"]').click();
            assert.equal(await page.locator('#itemsGrid .picker-card').count(), 1);
            await page.locator('[data-learned-type="basic"][data-learned-domain="receptive"]').click();
            assert.ok(await page.locator('#itemsGrid .picker-card').count() > 1);
            await page.evaluate(() => { closeCategoryModal(); toggleAdvancedMode(); });
            assert.equal(await page.evaluate(() => getWorkplaceSentence().presentation), 'slots');
            assert.ok(await page.evaluate(() => getWorkplaceSentence().imgPath), 'Preset card rows retain their mapped advanced scene');
            await page.evaluate(() => { clearAllSlots(); state.row1Slots[1] = { ...ITEMS_DATABASE['01 subject'][0], categoryId: '01 subject' }; renderWorkplace(); });
            const custom = await page.evaluate(() => getWorkplaceSentence());
            assert.ok(custom.key.startsWith('b:'));
            assert.equal(custom.imgPath, null);
            assert.equal(custom.slotContexts[0].index, 1, 'Gaps retain original grammar context');
            await page.evaluate(() => clearAllSlots());
            await page.reload({waitUntil:'domcontentloaded'});
            assert.equal(await page.evaluate(() => getWorkplaceSentence()), null, 'Explicitly cleared board remains empty');
            await page.evaluate(() => { openActivitySetup('expressive'); chooseActivityFolder(6); chooseActivitySubgroup(8); });
            assert.equal(await page.locator('[data-presentation]').count(), 2);
            await page.locator('[data-presentation="slots"]').click();
            await page.locator('#startActivityBtn').click();
            assert.equal(await page.locator('#activityAdvancedCard').count(), 0);
            assert.equal(await page.locator('.expressive-word-cards .activity-slot').count(), 6);
            const expectedClips=await page.evaluate(()=>{const s=currentActivitySentence();return s.slots.flatMap((slot,index)=>SENBActivities.slotSegments(s,slot,index)).map(seg=>new URL(seg.path,location.href).href);});
            await page.evaluate(()=>window.frameClips=[]);
            await page.locator('.expressive-word-cards').focus();await page.keyboard.press('Enter');
            await page.waitForFunction(count=>window.frameClips.length===count,expectedClips.length);await page.waitForTimeout(80);
            assert.deepEqual(await page.evaluate(()=>window.frameClips),expectedClips,'Keyboard activation plays the full sentence in RTL word order');
            const singleClips=await page.evaluate(()=>{const s=currentActivitySentence();return SENBActivities.slotSegments(s,s.slots[1],1).map(seg=>new URL(seg.path,location.href).href);});
            await page.evaluate(()=>window.frameClips=[]);await page.locator('.expressive-word-cards .activity-slot').nth(1).click();await page.waitForTimeout(250);
            assert.deepEqual(await page.evaluate(()=>window.frameClips),singleClips,'Individual words remain independently playable');
            const cardPositions=await page.locator('.expressive-word-cards .activity-slot').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right};}));
            for(let i=1;i<cardPositions.length;i++){assert.ok(cardPositions[i].right<=cardPositions[i-1].left);assert.ok(cardPositions[i-1].left-cardPositions[i].right<=10,'Words stay close inside their frame');}
            await page.screenshot({path:`/private/tmp/senb-expression-frame-${viewport.width}.png`});
            await page.locator('.word-score-dot').nth(2).click();
            await page.evaluate(() => renderActivity());
            assert.equal(await page.locator('.word-score-dot').nth(2).getAttribute('aria-pressed'), 'true');
            const outside = await page.locator('#activityView').evaluate(view => {
                const bounds = view.getBoundingClientRect();
                return [...view.querySelectorAll('button, img')].filter(node => {
                    const box = node.getBoundingClientRect();
                    return box.width && box.height && (box.left < -1 || box.right > innerWidth + 1 || box.top < bounds.top - 1 || box.bottom > bounds.bottom + 1);
                }).map(node => node.className);
            });
            assert.deepEqual(outside, [], `Expressive card layout fits ${JSON.stringify(viewport)}`);
            await page.evaluate(() => {
                activity.results = activity.plan.map(trial => ({ subgroup: trial.target.subCatId, item: trial.target.itemNum, words: 6, total: 6, marks: Array(6).fill(true) }));
                renderActivitySummary(); renderActivitySummary();
            });
            assert.equal(await page.evaluate(() => SenbProgress.sessions().filter(session => session.id.startsWith('senb-assessment-')).length), 1, 'Summary re-render must not duplicate evidence');
            await page.evaluate(()=>{navigateTo('workplace');loadAdvancedSentence(getAdvancedItemData('6',1,1));renderWorkplace();SenbSession.start();});
            const guidedLayout=await page.evaluate(()=>{const scene=document.querySelector('.dynamic-board .session-advanced').getBoundingClientRect(),cards=[...document.querySelectorAll('.session-target-words button')].map(node=>node.getBoundingClientRect());return {below:cards.every(r=>r.top>=scene.bottom),inside:cards.every(r=>r.left>=0&&r.right<=innerWidth),center:Math.abs((Math.min(...cards.map(r=>r.left))+Math.max(...cards.map(r=>r.right)))/2-(scene.left+scene.right)/2)};});
            assert.equal(guidedLayout.below,true,'Guided word cards stay below the scene, including landscape');assert.equal(guidedLayout.inside,true);assert.ok(guidedLayout.center<2);
            await page.screenshot({path:`/private/tmp/senb-guided-layout-${viewport.width}.png`});
            await page.evaluate(()=>SenbSession.stop());
            assert.deepEqual(errors, []);
            console.log(`PASS ${viewport.width}x${viewport.height}: default/saved board, subgroup select, navigation, learned copies, custom snapshots, expressive cards and single assessment log`);
            await context.close();
        }
    } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
