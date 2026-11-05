const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.APP_PLAYWRIGHT || '../voc/node_modules/playwright');
const { solveParentGate } = require('../../tests/solve-parent-gate.cjs');
const root = path.resolve(__dirname, '../../..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json', '.m4a': 'audio/mp4' };
const server = http.createServer((req, res) => {
  let url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (url.endsWith('/')) url += 'index.html';
  const file = path.resolve(root, '.' + url);
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  fs.readFile(file, (error, body) => {
    if (error) return res.writeHead(404).end();
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(body);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const engine = process.env.APP_ENGINE === 'webkit' ? webkit : chromium;
  const browser = await engine.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const page = await context.newPage(), errors = [];
    page.setDefaultTimeout(15000);
    page.on('pageerror', error => errors.push(error.message));
    const base = `http://127.0.0.1:${server.address().port}/tools/VSS/`;
    const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('voc-children-v1')));
    const ready = () => page.waitForFunction(() => !window.SuiteWelcome?.pending);
    const open = async () => {
      await page.locator('[data-open-accounts]').click();
      await solveParentGate(page);
      await page.locator('#vss-accounts-dialog[open]').waitFor();
    };
    const enter = async name => {
      await page.locator('#vss-child-name').fill(name);
      await page.locator('#vss-accounts-dialog button[type=submit]').click();
      await page.waitForFunction(() => !document.querySelector('#vss-accounts-dialog').open);
    };
    await page.goto(base);
    await page.locator('#suite-welcome-name').fill('  علي   أحمد  ');
    await page.locator('#suite-welcome button[type=submit]').click();
    await ready();
    let data = await stored();
    const ali = data.children.find(child => child.name === 'علي أحمد');
    assert.ok(ali);
    assert.deepEqual(ali.apps, { voc: true, senb: true, taffaha: true });
    assert.deepEqual(ali.senb.sessions, []);
    assert.deepEqual(ali.taffaha.attempts, []);
    assert.equal(data.active, ali.id);
    assert.equal(await page.locator('[data-account-name]').textContent(), ali.name);
    // Closing/cancelling the gate does not expose saved accounts.
    await page.locator('[data-open-accounts]').click();
    await page.locator('#parent-gate[open]').waitFor();
    assert.equal(await page.locator('#vss-accounts-dialog[open]').count(), 0);
    await page.keyboard.press('Escape');
    await open();
    assert.equal(await page.locator('[data-delete-child]').count(), 0);
    assert.equal(await page.locator('.suite-account-admin').count(), 0);
    await enter('سارة');
    data = await stored();
    const sara = data.children.find(child => child.name === 'سارة');
    assert.deepEqual(sara.apps, { voc: true, senb: true, taffaha: true });
    // Existing work survives selecting, revisiting home and opening every area.
    await page.evaluate(id => {
      const data = JSON.parse(localStorage.getItem('voc-children-v1'));
      const child = data.children.find(child => child.id === id);
      child.words = { preserve: { receptive: { correct: 1 } } };
      child.senb.mastery = { preserve: { expressive: { passed: true } } };
      child.taffaha.attempts = [{ id: 'saved-attempt', wordId: 'preserve' }];
      child.soundApps = { preserve: { sessions: ['untouched'] } };
      localStorage.setItem('voc-children-v1', JSON.stringify(data));
    }, ali.id);
    await open();
    await page.locator(`[data-account-id="${ali.id}"] .suite-account-select`).click();
    for (const [app, model] of [['voc', 'VocProgress'], ['senb', 'SenbProgress'], ['taffaha', 'TaffahaProgress']]) {
      await page.locator(`.vss-activities a[href="${app}/index.html"]`).click();
      await page.waitForFunction(model => window[model]?.active()?.name === 'علي أحمد', model);
      assert.equal(await page.evaluate(model => window[model].active().id, model), ali.id);
      assert.equal(await page.locator('#suite-welcome-name:visible').count(), 0, 'No second account prompt in subapps');
      await page.goto(base); await ready();
    }
    data = await stored();
    const preserved = data.children.find(child => child.id === ali.id);
    assert.equal(preserved.words.preserve.receptive.correct, 1);
    assert.equal(preserved.senb.mastery.preserve.expressive.passed, true);
    assert.equal(preserved.taffaha.attempts[0].id, 'saved-attempt');
    assert.deepEqual(preserved.soundApps, { preserve: { sessions: ['untouched'] } });
    await open(); await enter('  علي  أحمد ');
    assert.equal((await stored()).children.filter(child => child.name === ali.name).length, 1, 'Same name reuses the shared identity');
    await page.reload(); await ready();
    assert.equal(await page.locator('[data-account-name]').textContent(), ali.name);
    // Search, sort, touch targets and the white account card fit phones/landscape.
    for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport); await open();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.locator('.suite-account-search').fill('سارة');
      assert.equal(await page.locator('.suite-account-grid .suite-account-row').count(), 1);
      await page.locator('.suite-account-sort').click();
      await page.locator('[data-sort-value=alphabet]').click();
      assert.equal(await page.locator('.suite-account-sort').getAttribute('aria-expanded'), 'false');
      await page.locator('[data-accounts-close]').click();
    }
    await page.screenshot({ path: `/private/tmp/vss-accounts-home-${process.env.APP_ENGINE || 'chrome'}.png`, fullPage: true });
    await open();
    await page.screenshot({ path: `/private/tmp/vss-accounts-dialog-${process.env.APP_ENGINE || 'chrome'}.png`, fullPage: true });
    await enter('Hamada');
    await open();
    assert.equal(await page.locator('[data-delete-child]').count(), 2);
    assert.equal(await page.locator('[data-reset-hamada]').count(), 1);
    assert.equal(await page.locator('[data-account-id=hamada-admin] [data-delete-child]').count(), 0);
    await page.locator(`[data-delete-child="${sara.id}"]`).click();
    await page.locator('[data-delete-back]').click();
    assert.ok((await stored()).children.some(child => child.id === sara.id));
    await page.locator(`[data-delete-child="${sara.id}"]`).click();
    await Promise.all([page.waitForEvent('domcontentloaded'), page.locator('[data-delete-confirm]').click()]);
    await ready();
    assert.ok(!(await stored()).children.some(child => child.id === sara.id));
    assert.ok((await stored()).deletedChildren[sara.id]);
    // Storage failures leave an actionable error and a retryable account form.
    await open();
    await page.evaluate(() => {
      window.restoreAccountStorage = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) {
        if (key === 'voc-children-v1') throw Error('full');
        return window.restoreAccountStorage.call(this, key, value);
      };
    });
    await page.locator('#vss-child-name').fill('اختبار التخزين');
    await page.locator('#vss-accounts-dialog button[type=submit]').click();
    assert.equal(await page.locator('[data-dialog-error]').isVisible(), true);
    assert.equal(await page.locator('#vss-accounts-dialog[open]').count(), 1);
    assert.ok(!(await stored()).children.some(child => child.name === 'اختبار التخزين'));
    await page.evaluate(() => { Storage.prototype.setItem = window.restoreAccountStorage; });
    await enter('اختبار التخزين');
    assert.deepEqual((await stored()).children.find(child => child.name === 'اختبار التخزين').apps, { voc: true, senb: true, taffaha: true });
    assert.deepEqual(errors, []);
    await context.close();
    console.log('PASS: homepage creation/switching, one identity in all three apps, progress preservation, reloads, parent gate, avatars/search/sort, Hamada protection/deletion, responsive layout and storage retry.');
  } finally { await browser.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); server.closeAllConnections(); server.close(); process.exitCode = 1; });
