const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, webkit } = require(process.env.VOC_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml', '.m4a':'audio/mp4', '.woff2':'font/woff2' };
let port;
const server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (!pathname.startsWith('/tools/VSS/voc/')) { response.writeHead(404).end(); return; }
    const relative = pathname.slice('/tools/VSS/voc/'.length) || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    try { const body = await fs.promises.readFile(file); response.writeHead(200, { 'Content-Type':mime[path.extname(file)] || 'text/plain', 'Cache-Control':'no-store', 'Content-Length':body.length }); response.end(body); }
    catch { response.writeHead(404).end(); }
});
async function offline(context, name, value) {
    if (name === 'chromium') await context.setOffline(value);
    if (value && server.listening) await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    if (!value && !server.listening) await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
}
const snapshot = (page, mode) => page.evaluate(mode => JSON.parse(localStorage.getItem(`${VocProgress.scope(`hamada-game-${mode}`)}-draft`)), mode);
const last = (page, mode) => page.evaluate(mode => JSON.parse(localStorage.getItem(`${VocProgress.scope(`hamada-game-${mode}`)}-last`)), mode);
async function ready(page, mode) {
    for (let i = 0; i < 900; i++) {
        const enabled = mode === 'rapid' ? await page.locator('#show-grading').isEnabled() || await page.locator('[data-grade]').first().isEnabled()
            : await page.locator('#game-board > button:not(:disabled)').count() > 0;
        if (enabled) return;
        if (await page.locator('#play-word').isEnabled() && (mode === 'test' || await page.locator('#game-feedback.error').count())) await page.locator('#play-word').click();
        await page.waitForTimeout(100);
    }
    throw new Error(`${mode}: ${await page.locator('#game-feedback').textContent()}`);
}
async function start(page, mode, origin) {
    await page.goto(`${origin}/tools/VSS/voc/${mode}.html`);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.locator('#start-game:not(:disabled)').waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await page.locator('select').count(),0,'Games use direct choice cards instead of dropdowns');
    await page.locator('#toggle-categories').click();
    const name=await page.evaluate(()=>VOC_GAME_DATA.categories[1].name);
    await page.locator('#category-search').fill(name);
    await page.locator('#category-grid [data-category="2"]').click();
    assert.equal(await page.locator('#category-panel').isHidden(),true);
    assert.equal(await page.locator('.selection-card').first().getAttribute('data-key').then(key=>key.startsWith('2_')),true);
    await page.reload(); await page.locator('#start-game:not(:disabled)').waitFor();
    assert.equal(await page.locator('#category-rail [data-category="2"]').getAttribute('aria-pressed'),'true','Category persists across reload');
    await page.locator('#category-rail [data-category="1"]').click();
    await page.locator('#toggle-categories').click(); await page.locator('#category-search').fill('zzzz');
    assert.equal(await page.locator('#category-empty').isVisible(),true);
    await page.locator('#category-search').fill('');
    await page.keyboard.press('Escape'); assert.equal(await page.locator('#category-panel').isHidden(),true);
    if(mode==='matching') await page.screenshot({path:`/private/tmp/voc-games-${process.env.VOC_GAME_ENGINE || 'all'}-new-settings.png`,fullPage:true});
}
async function clearSelection(page) {
    if (await page.locator('#select-everything').getAttribute('aria-pressed') !== 'true') await page.locator('#select-everything').click();
    await page.locator('#select-everything').click();
}
async function recordAudioEnds(page) {
    await page.evaluate(()=>{
        window.completedWords=[];
        document.getElementById('game-audio').addEventListener('ended',()=>{
            const audio=document.getElementById('game-audio');
            window.completedWords.push({ time:audio.currentTime, duration:audio.duration, sourceKey:document.querySelector('#active-match > button')?.dataset.key });
        });
    });
}
async function expectFullMatchingAudio(page,key) {
    await page.waitForFunction(key=>window.completedWords.some(word=>word.sourceKey===key),key);
    const completed=await page.evaluate(key=>window.completedWords.find(word=>word.sourceKey===key),key);
    assert.ok(Number.isFinite(completed.duration) && completed.time >= completed.duration-.05,'Matched word reaches its real end before its card is replaced');
    await page.waitForFunction(()=>!document.getElementById('next-round').hidden || !document.getElementById('results-view').hidden || document.querySelector('#game-board > button:not(:disabled)'));
}
async function run(name, engine, origin) {
    // Installed Chrome supplies AAC/M4A decoding on macOS; Playwright's
    // bundled headless shell does not include that proprietary codec.
    const browser = await engine.launch({ headless:true, ...(name === 'chromium' ? { channel:'chrome' } : {}) });
    const context = await browser.newContext({ viewport:{width:390,height:844}, hasTouch:true });
    await context.addInitScript(() => { if (!localStorage.getItem('voc-children-v1')) localStorage.setItem('voc-children-v1', JSON.stringify({schema:1,active:'qa',children:[{id:'qa',name:'طفل الاختبار',words:{},workspace:null,plan:null}]})); });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
        await page.goto(`${origin}/tools/VSS/voc/games.html`);
        await page.waitForFunction(() => !!navigator.serviceWorker.controller);
        assert.equal(await page.locator('.hub-card').count(), 4);
        assert.equal(await page.locator('.hub-card p, .hub-card .game-note').count(), 0);
        const hubBoxes = await page.locator('.hub-icon').evaluateAll(icons => icons.map(icon => icon.getBoundingClientRect().top));
        assert.equal(new Set(hubBoxes).size, 1, 'All game icons share one row on a phone');
        await page.screenshot({path:`/private/tmp/voc-games-${name}-hub.png`,fullPage:true});

        await page.goto(`${origin}/tools/VSS/voc/index.html`);
        await page.screenshot({path:`/private/tmp/voc-${name}-new-home.png`, fullPage:true});
        assert.equal(await page.locator('#home-view h1').textContent().then(text=>text.trim()), 'كلمة');
        assert.equal(await page.locator('#home-view [data-offline-card], a[href="res/1.pdf"]').count(), 0);
        await page.evaluate(() => app.switchView('workplace'));
        for (const size of [{width:768,height:1024},{width:1024,height:768},{width:1366,height:768},{width:640,height:480}]) {
            await page.setViewportSize(size);
            for (const count of [7,8,9]) {
                await page.evaluate(count => { app.setTemplate(count); app.state.slotsData.forEach((slot,i)=>slot.item=CATEGORIES[0].items[i]); app.renderSlotsContent(); }, count);
                assert.equal(await page.locator('.slot').evaluateAll(slots=>slots.every(slot=>{const r=slot.getBoundingClientRect();return r.top>=68 && r.bottom<=innerHeight && r.left>=0 && r.right<=innerWidth;})),true, `${count} cards fit at ${size.width} × ${size.height}`);
            }
            if (size.width===1024) { await page.evaluate(()=>document.getElementById('toast-container').replaceChildren()); }
            if (size.width===1024) await page.screenshot({path:`/private/tmp/voc-${name}-nine-cards.png`,fullPage:true});
        }
        for (const mode of ['test','practice']) {
            await page.evaluate(async mode => {
                app.exitTestMode(false); app.setTemplate(4);
                app.state.slotsData.forEach((slot,i)=>slot.item=CATEGORIES[0].items[i]); app.renderSlotsContent();
                window.shuffleCalls=0; const original=app.executeShuffle.bind(app);
                if (!window.originalShuffle) window.originalShuffle=original;
                app.executeShuffle=()=>{window.shuffleCalls++;window.originalShuffle();};
                await app.handleModeButtonClick(mode);
            },mode);
            for(let trial=0;trial<3;trial++) {
                await page.evaluate(()=>app.evaluateTestAnswer(app.state.slotsData.findIndex(slot=>slot.item===app.state.testState.targetItem)));
                await page.waitForTimeout(1050);
            }
            assert.equal(await page.evaluate(()=>window.shuffleCalls),1, 'Cards shuffle after three completed trials in both modes');
            await page.evaluate(()=>app.exitTestMode(false));
        }
        await page.evaluate(()=>app.setStars(1));
        assert.equal(await page.locator('.star-active').evaluate(star=>getComputedStyle(star).color), 'rgb(250, 204, 21)');
        await page.evaluate(()=>app.setStars(10)); await page.waitForTimeout(500);
        assert.equal(await page.locator('.star-active').count(),0,'Filled star bar clears automatically');
        await page.evaluate(()=>app.closeStarCelebration());
        await page.setViewportSize({width:390,height:844});
        console.log(`${name}: home branding, yellow star reset, three-trial shuffle and 7/8/9 tablet layouts passed`);

        await start(page, 'matching', origin);
        assert.equal(await page.locator('#clear-category, #clear-everything').count(), 0);
        await page.locator('#select-category').click();
        assert.equal(await page.locator('#select-category').getAttribute('aria-pressed'), 'true');
        await page.locator('#select-category').click();
        assert.equal(await page.locator('.selection-card[aria-pressed=true]').count(), 0);
        await page.locator('#select-category').click();
        await clearSelection(page);
        for (let i=0; i<6; i++) await page.locator('.selection-card').nth(i).click();
        await page.locator('input[name="game-level"][value="2"]').check(); await page.locator('input[name="game-length"][value="6"]').check();
        await page.locator('#start-game').click(); await ready(page, 'matching');
        await page.screenshot({path:`/private/tmp/voc-games-${name}-matching-phone.png`,fullPage:true});
        let s = await snapshot(page, 'matching');
        const wrong = s.boards[0].find(key => key !== s.order[0]);
        await page.locator(`#game-board > button[data-key="${wrong}"]`).tap();
        assert.equal((await snapshot(page, 'matching')).mistakes, 1);
        assert.equal(await page.locator('#play-word').textContent(), '');
        assert.equal(await page.locator('#active-match > button').evaluate(card => getComputedStyle(card).touchAction), 'none');
        const source = await page.locator('#active-match > button').boundingBox();
        const zone = await page.locator(`#game-board > button[data-key="${s.order[0]}"]`).boundingBox();
        await page.mouse.move(source.x+source.width/2,source.y+source.height/2); await page.mouse.down();
        await page.mouse.move(zone.x+zone.width/2,zone.y+zone.height/2,{steps:10}); await page.mouse.up();
        await page.waitForFunction(() => JSON.parse(localStorage.getItem('hamada-game-matching-child-qa-draft')).position === 1);
        await page.locator('#pause-game').click(); await page.waitForTimeout(800);
        assert.equal(await page.locator('#pause-view').isVisible(), true, 'Old match transition cannot undo pause');
        await page.reload(); await page.locator('#resume-saved').click(); await ready(page, 'matching');
        s = await snapshot(page, 'matching'); assert.equal(s.position, 1);
        await recordAudioEnds(page);
        for (let count=1; count<6; count++) {
            if (await page.locator('#next-round').isVisible()) await page.locator('#next-round').click();
            await ready(page, 'matching'); s = await snapshot(page, 'matching');
            const button = page.locator(`#game-board > button[data-key="${s.order[s.position]}"]`);
            if (count===1 && name==='chromium') {
                const source=await page.locator('#active-match > button').boundingBox(), target=await button.boundingBox();
                const client=await context.newCDPSession(page), scroll=await page.evaluate(()=>scrollY);
                const from={x:source.x+source.width/2,y:source.y+source.height/2}, to={x:target.x+target.width/2,y:target.y+target.height/2};
                await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[from]});
                for(let step=1;step<=10;step++) await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*step/10,y:from.y+(to.y-from.y)*step/10}]});
                await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
                assert.equal(await page.evaluate(()=>scrollY),scroll,'Touch dragging does not scroll the page');
                await client.detach();
            } else { await button.focus(); await page.keyboard.press('Enter'); }
            assert.equal(await page.locator('#play-word').isDisabled(),true,'Replay cannot interrupt the matched word');
            await expectFullMatchingAudio(page,s.order[s.position]);
        }
        await page.locator('#results-view').waitFor({state:'visible'});
        assert.equal((await last(page,'matching')).percentage,83);
        assert.equal(await page.locator('#review-missed').isVisible(),true);
        await page.locator('#review-missed').click(); await ready(page,'matching');
        assert.equal((await snapshot(page,'matching')).review,true);
        await page.locator('#finish-game').click(); await page.waitForTimeout(750);
        assert.equal(await page.locator('#results-view').isVisible(),true);
        assert.equal((await last(page,'matching')).percentage,null);
        console.log(`${name}: visual selectors, matching tap/drag/keyboard, full word playback, pause/reload and one-word review passed`);

        await start(page,'memory',origin); await page.setViewportSize({width:320,height:740});
        await page.locator('input[name="game-level"][value="2"]').check(); await page.locator('#start-game').click(); await ready(page,'memory');
        s = await snapshot(page,'memory'); const second = s.deck.findIndex(card=>card.key!==s.deck[0].key);
        assert.equal(await page.locator('#game-board > button').count(),4);
        assert.equal(await page.locator('#game-board > button').first().getAttribute('aria-label'),'بطاقة مخفية 1');
        await page.locator('#game-board > button').nth(0).tap(); await page.locator('#game-board > button').nth(second).tap();
        await page.evaluate(() => { const buttons=[...document.querySelectorAll('#game-board > button')]; buttons.find(button=>!button.classList.contains('flipped')).click(); });
        assert.equal((await snapshot(page,'memory')).open.length,2);
        await page.locator('#pause-game').click(); await page.waitForTimeout(1000); await page.reload();
        await page.locator('#resume-saved').click();
        await page.waitForFunction(() => JSON.parse(localStorage.getItem('hamada-game-memory-child-qa-draft')).open.length===0);
        assert.deepEqual((await snapshot(page,'memory')).deck,s.deck,'Memory board survives pause/reload');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true);
        await page.screenshot({path:`/private/tmp/voc-games-${name}-memory-phone.png`,fullPage:true});
        for (const key of s.order) {
            const positions=s.deck.map((card,i)=>card.key===key?i:-1).filter(i=>i>=0);
            await page.locator('#game-board > button').nth(positions[0]).click(); await page.locator('#game-board > button').nth(positions[1]).click();
        }
        await page.locator('#results-view').waitFor({state:'visible'});
        assert.equal((await last(page,'memory')).moves,3); assert.equal((await last(page,'memory')).percentage,67);
        // A large selected bank still creates just one bounded memory board.
        await page.locator('#return-setup').click(); await page.locator('#select-everything').click();
        assert.ok(await page.locator('.selection-card').count() <= 24);
        await page.locator('input[name="game-level"][value="6"]').check(); await page.locator('#start-game').click(); await ready(page,'memory');
        assert.equal(await page.locator('#game-board > button').count(),12);
        assert.equal(await page.evaluate(() => [...document.querySelectorAll('#game-board > button')].every(button => { const rect=button.getBoundingClientRect(); return rect.left>=0 && rect.right<=innerWidth && rect.width>=44; })),true);
        s=await snapshot(page,'memory');
        const pair=s.deck.map((card,i)=>card.key===s.deck[0].key?i:-1).filter(i=>i>=0);
        await page.locator('#game-board > button').nth(pair[0]).click(); await page.locator('#game-board > button').nth(pair[1]).click();
        await page.screenshot({path:`/private/tmp/voc-games-${name}-memory-large-phone.png`,fullPage:true});
        await page.setViewportSize({width:1024,height:768});
        await page.screenshot({path:`/private/tmp/voc-games-${name}-memory-tablet.png`,fullPage:true});
        await page.locator('#finish-game').click(); await page.locator('#return-setup').click();
        await clearSelection(page);
        for(let i=0;i<6;i++) await page.locator('.selection-card').nth(i).click();
        await page.locator('input[name="game-level"][value="2"]').check();
        console.log(`${name}: memory mismatch lock, restored board, mobile grid and pair scoring passed`);

        await page.setViewportSize({width:390,height:844}); await start(page,'rapid',origin);
        await clearSelection(page);
        for (let i=0;i<3;i++) await page.locator('.selection-card').nth(i).click();
        await page.locator('#sound-hint').uncheck(); await page.locator('input[name="game-duration"][value="2"]').check();
        await page.locator('#start-game').click(); await ready(page,'rapid');
        await page.screenshot({path:`/private/tmp/voc-games-${name}-rapid-phone.png`,fullPage:true});
        assert.equal(await page.locator('[data-grade]').first().isDisabled(),true);
        await page.locator('#pause-game').click(); await page.waitForTimeout(2200);
        assert.equal((await snapshot(page,'rapid')).position,0);
        await page.locator('#continue-game').click(); await ready(page,'rapid');
        await page.locator('#show-grading').click();
        await page.evaluate(() => { const b=document.querySelector('[data-grade="notMastered"]'); b.click(); b.click(); });
        await page.waitForFunction(() => JSON.parse(localStorage.getItem('hamada-game-rapid-child-qa-draft')).position===1);
        for (const grade of ['learning','mastered']) {
            await page.waitForTimeout(350); await ready(page,'rapid');
            if (await page.locator('#show-grading').isVisible()) await page.locator('#show-grading').click();
            await page.locator(`[data-grade="${grade}"]`).click();
        }
        await page.locator('#results-view').waitFor({state:'visible'});
        assert.equal((await last(page,'rapid')).percentage,33); assert.equal((await last(page,'rapid')).learning,1);
        await page.waitForTimeout(700); assert.equal(await page.locator('#results-view').isVisible(),true,'No endless retry loop');
        await page.evaluate(()=>document.getElementById('sound-hint').checked=true);
        await page.locator('#play-again').click(); await ready(page, 'rapid');
        await page.locator('#rapid-autoplay').click();
        await page.waitForFunction(() => JSON.parse(localStorage.getItem('hamada-game-rapid-child-qa-draft')).records.some(record => record.result === 'viewed'));
        await page.locator('#pause-game').click();
        const autoPaused = await snapshot(page, 'rapid'); await page.waitForTimeout(2200);
        assert.equal((await snapshot(page, 'rapid')).position, autoPaused.position, 'Autoplay pauses safely');
        assert.equal(autoPaused.records.filter(record => record.result === 'viewed').length, autoPaused.records.length);
        assert.equal(autoPaused.missed.length, 0);
        await page.locator('#continue-game').click();
        await page.locator('#rapid-autoplay').click(); await ready(page, 'rapid');
        assert.equal(await page.locator('#rapid-grading').isVisible(), true);
        assert.equal(await page.locator('[data-grade="notMastered"]').textContent(), '');
        await page.locator('#rapid-autoplay').click();
        await page.locator('#results-view').waitFor({state:'visible'});
        assert.equal((await last(page, 'rapid')).percentage, null, 'Autoplay never creates an assessment');
        assert.equal((await last(page, 'rapid')).viewed, 3);
        console.log(`${name}: rapid grading, finite unscored autoplay, toggle and pause-safe timer passed`);

        await start(page,'test',origin);
        await page.evaluate(() => {
            const play=HTMLMediaElement.prototype.play; let deny=true;
            HTMLMediaElement.prototype.play=function(){ if(deny){deny=false;return Promise.reject(new DOMException('Gesture required','NotAllowedError'));} return play.call(this); };
        });
        await page.locator('#start-game').click();
        await page.waitForFunction(() => document.getElementById('game-feedback').textContent.startsWith('اضغط'));
        assert.equal(await page.locator('#game-board > button:not(:disabled)').count(),0,'Listen before answering');
        await page.locator('#play-word').click(); await ready(page,'test');
        await page.screenshot({path:`/private/tmp/voc-games-${name}-listening-phone.png`,fullPage:true});
        s=await snapshot(page,'test'); const choices=await page.locator('#game-board > button').evaluateAll(buttons=>buttons.map(button=>button.dataset.key));
        assert.equal(await page.locator('#game-board > button').evaluateAll(cards => cards.every(card => { const r = card.getBoundingClientRect(); return Math.abs(r.width-r.height) < 2; })), true, 'Listening cards are square');
        assert.equal(choices.length,4); assert.equal(await page.locator('#game-board > button > span').count(),0,'No written-answer cue');
        await page.locator(`#game-board > button[data-key="${choices.find(key=>key!==s.order[0])}"]`).tap();
        await page.waitForFunction(() => document.getElementById('play-view').classList.contains('listening-replay'));
        assert.equal(await page.locator('#game-board > button:not(:disabled)').count(), 0, 'Answers lock during replay');
        await ready(page, 'test');
        assert.equal(await page.locator('#play-view').evaluate(view => view.classList.contains('listening-replay')), false);
        assert.deepEqual(await page.locator('#game-board > button').evaluateAll(buttons=>buttons.map(button=>button.dataset.key)),choices);
        for(let count=0;count<6;count++){
            await ready(page,'test'); s=await snapshot(page,'test');
            await page.locator(`#game-board > button[data-key="${s.order[s.position]}"]`).click(); await page.waitForTimeout(700);
        }
        await page.locator('#results-view').waitFor({state:'visible'}); assert.equal((await last(page,'test')).percentage,83);
        console.log(`${name}: listening game, autoplay retry, answer gating, stable retries and first-choice scoring passed`);

        // Cache only the small test pool, stop the actual origin, and exercise
        // every game offline without relying on the HTTP browser cache.
        await page.evaluate(async()=>{
            for(const item of VOC_GAME_DATA.categories[0].items.slice(0,6)) for(const url of [item.image,item.audio]) {
                const response=await fetch(url); if(!response.ok)throw new Error(url);
            }
        });
        await offline(context,name,true);
        for(const game of ['matching','memory','rapid','test']){
            await page.goto(`${origin}/tools/VSS/voc/${game}.html`);
            if(game==='rapid') await page.locator('input[name="game-duration"][value="0"]').check();
            await page.locator('#start-game').click(); await ready(page,game);
            assert.equal(await page.locator('#reload-media').isHidden(),true);
            if(game==='matching') {
                await recordAudioEnds(page); const draft=await snapshot(page,game), key=draft.order[0];
                await page.locator(`#game-board > button[data-key="${key}"]`).click();
                await expectFullMatchingAudio(page,key);
            }
            await page.locator('#pause-game').click(); await page.locator('#finish-paused').click();
            assert.equal(await page.locator('#results-view').isVisible(),true);
        }
        await offline(context,name,false); assert.equal(errors.length,0,errors.join('\n'));
        console.log(`${name}: all four games work offline with cached images/audio; no JavaScript errors`);
    } catch(error) {
        console.error(name,await page.locator('#game-feedback').textContent().catch(()=>''));
        console.error(await page.evaluate(async () => ({ registrations: (await navigator.serviceWorker.getRegistrations()).map(registration => ({ active: registration.active?.state, installing: registration.installing?.state, waiting: registration.waiting?.state })), caches: await caches.keys() })).catch(()=>({})), errors);
        await page.screenshot({path:`/private/tmp/voc-games-${name}-failure.png`,fullPage:true}).catch(()=>{}); throw error;
    } finally {
        await offline(context,name,false);
        await context.close();
        await browser.close();
    }
}
(async()=>{
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); port=server.address().port;
    try { const origin=`http://127.0.0.1:${port}`;
        if(process.env.VOC_GAME_ENGINE!=='webkit') await run('chromium',chromium,origin);
        if(process.env.VOC_GAME_ENGINE!=='chromium') await run('webkit',webkit,origin);
    } finally { server.close(); server.closeAllConnections(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
