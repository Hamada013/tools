const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const os = require('node:os');
const { chromium, webkit } = require(process.env.FLUENCY_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const prefix = '/speech-website/tools/Fluency Flow/';
const overrides = new Map();
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname === '/outside.html') { res.setHeader('Content-Type', 'text/html'); res.end('<html><body>Another app</body></html>'); return; }
  const relative = pathname.slice(prefix.length) || 'index.html';
  const file = path.resolve(root, relative);
  if (!pathname.startsWith(prefix) || !file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  const override = overrides.get(relative);
  res.writeHead(override?.status || 200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(override?.body || fs.readFileSync(file));
});
const releaseVM = vm.createContext({ self: {} });
vm.runInContext(fs.readFileSync(path.join(root, 'assets/pwa-release.js'), 'utf8'), releaseVM);
const original = JSON.parse(JSON.stringify(releaseVM.self.FLUENCY_RELEASE));
function release(version) {
  const next = { ...original, version, integrity: {} };
  for (const file of next.shell) next.integrity[file] = 'sha256-' + crypto.createHash('sha256').update(overrides.get(file)?.body || fs.readFileSync(path.join(root, file))).digest('base64');
  overrides.set('assets/pwa-release.js', { body: Buffer.from('self.FLUENCY_RELEASE = ' + JSON.stringify(next) + ';') });
}
let port;
async function offline(context, name, value) {
  // WebKit's emulated offline mode can reject cached worker responses. Stop the
  // origin in both engines to verify real network loss without that limitation.
  if (name === 'chromium') await context.setOffline(value);
  if (value && server.listening) await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
  if (!value && !server.listening) await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
}
async function ready(page) {
  try {
    // Safari can keep reporting a claimed worker as activating after it has finished, so this does not check .state.
    await page.waitForFunction(() => navigator.serviceWorker.controller && document.querySelector('[data-screen]'), null, { timeout: 20000 });
  } catch {
    const state = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return { controller: navigator.serviceWorker.controller?.state, active: registration?.active?.state, waiting: registration?.waiting?.state, installing: registration?.installing?.state, app: Boolean(document.querySelector('[data-screen]')) };
    });
    throw new Error(`The app did not become ready: ${JSON.stringify(state)}`);
  }
}
const click = (page, name) => page.getByRole('button', { name, exact: true }).click();
async function run(type, name) {
  overrides.clear();
  const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const profile = name === 'chromium' ? fs.mkdtempSync(path.join(os.tmpdir(), 'fluency-pwa-')) : null;
  const options = { headless: true, ...(name === 'chromium' && fs.existsSync(chrome) ? { executablePath: chrome } : {}) };
  const contextOptions = { viewport: { width: 320, height: 740 }, hasTouch: true, serviceWorkers: 'allow', reducedMotion: 'reduce' };
  // Playwright's macOS WebKit persistent profiles discard CacheStorage bodies.
  // Use its normal context, as in the site's existing WebKit offline tests.
  const browser = name === 'webkit' ? await type.launch(options) : null;
  const context = browser ? await browser.newContext(contextOptions) : await type.launchPersistentContext(profile, { ...options, ...contextOptions });
  try {
    const page = await context.newPage(); page.setDefaultTimeout(10000);
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const base = `http://127.0.0.1:${port}` + encodeURI(prefix);
    await page.goto(base + 'index.html');
    await ready(page);
    const manifest = await page.evaluate(async () => {
      const href = document.querySelector('link[rel=manifest]').href;
      return { href, json: await (await fetch(href)).json() };
    });
    assert.equal(manifest.json.display, 'standalone');
    assert.equal(new URL(manifest.json.scope, manifest.href).href, base);
    assert.equal(new URL(manifest.json.start_url, manifest.href).href, base + 'index.html');
    const icons = await page.evaluate(async icons => {
      const result = [];
      for (const icon of icons) { const image = new Image(); image.src = icon.src; await image.decode(); result.push([image.naturalWidth, image.naturalHeight]); }
      return result;
    }, manifest.json.icons);
    assert.deepEqual(icons, [[192, 192], [512, 512], [512, 512]]);
    const registration = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return { scope: reg.scope, script: reg.active.scriptURL };
    });
    assert.equal(registration.scope, base);
    assert.equal(registration.script, base + 'sw.js');
    if (name === 'chromium') {
      const cdp = await context.newCDPSession(page);
      const manifestResult = await cdp.send('Page.getAppManifest');
      assert.deepEqual(manifestResult.errors, []);
      const installability = await cdp.send('Page.getInstallabilityErrors');
      assert.deepEqual(installability.installabilityErrors, [], 'Chromium installability requirements');
      await cdp.detach();
    }
    await page.evaluate(async () => {
      await (await caches.open('another-app-cache')).put('/outside-data', new Response('preserve'));
      await (await caches.open('fluency-flow:another-scope:shell:old')).put('/other-fluency-data', new Response('preserve'));
    });
    await click(page, 'Switch to English');
    if (name === 'webkit') {
      await page.locator('#pwa-install').click();
      assert.match(await page.locator('#pwa-install-help').textContent(), /iPhone.*Share/);
      await page.keyboard.press('Escape');
    }
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt', { cancelable: true });
      event.prompt = async () => { window.installPromptCalled = true; };
      event.userChoice = Promise.resolve({ outcome: 'dismissed' });
      window.dispatchEvent(event);
    });
    await page.locator('#pwa-install').click();
    assert.equal(await page.evaluate(() => window.installPromptCalled), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (process.env.FLUENCY_PWA_DEBUG) console.log(name, 'cache before offline', await page.evaluate(async () => { const names = await caches.keys(); const entries = {}; for (const key of names) entries[key] = (await (await caches.open(key)).keys()).map(request => request.url); return { entries, controller: navigator.serviceWorker.controller?.scriptURL }; }));
    await offline(context, name, true);
    if (process.env.FLUENCY_PWA_DEBUG) console.log(name, 'offline entry', await page.evaluate(async () => { const key = new URL('index.html', document.baseURI).href; const entries = []; for (const name of await caches.keys()) entries.push([name, Boolean(await (await caches.open(name)).match(key))]); return { key, entries, fetch: await fetch(key).then(response => response.status).catch(error => error.message) }; }));
    await page.reload({ waitUntil: 'load' }); await ready(page);
    assert.equal(await page.evaluate(async () => { try { await fetch('/network-probe'); return true; } catch { return false; } }), false);
    const offlineFiles = await page.evaluate(async files => {
      const result = [];
      for (const file of files) { const response = await fetch(file); result.push(response.ok); }
      return result;
    }, original.shell);
    assert.ok(offlineFiles.every(Boolean), 'Every shipped asset must work offline');
    await click(page, 'Fluency Shaping'); await click(page, 'Easy Onsets');
    await click(page, 'Play'); await page.waitForTimeout(200); await click(page, 'Pause');
    await click(page, 'Practice'); await click(page, 'A');
    assert.match(await page.locator('.ff-practice-card').textContent(), /apple/);
    await click(page, 'Show word pictures');
    assert.ok(await page.locator('[data-picture-word] svg').count(), 'Local word pictures must render offline');
    assert.equal(await page.locator('[data-picture-word]').first().getAttribute('aria-label'), 'apple');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await click(page, 'Back'); await click(page, 'Back');
    // Launch the installed-app entry point in a new tab with no live origin.
    const cold = await context.newPage();
    await cold.goto(base + '?source=home-screen'); await ready(cold);
    await click(cold, 'Breathing Techniques');
    await click(cold, 'Controlled Exhalation'); await click(cold, 'Play'); await click(cold, 'Pause');
    await cold.close();
    await offline(context, name, false);
    const newCSS = Buffer.concat([fs.readFileSync(path.join(root, 'assets/responsive.css')), Buffer.from('\n/* verified test update */')]);
    overrides.set('assets/responsive.css', { body: newCSS });
    release(`test-update-${name}`);
    await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration()).update(); });
    await page.locator('#pwa-update').waitFor({ state: 'visible', timeout: 20000 });
    assert.equal(await page.evaluate(async version => (await caches.keys()).some(key => key.endsWith(version)), original.version), true, 'Waiting update retains the active release');
    // An update stays available but cannot interrupt a running exercise.
    await click(page, 'Breathing Techniques'); await click(page, 'Controlled Exhalation'); await click(page, 'Play');
    assert.equal(await page.locator('#pwa-update').isDisabled(), true);
    await click(page, 'Pause');
    await Promise.all([page.waitForEvent('load'), page.locator('#pwa-update').click()]);
    await ready(page);
    assert.equal(await page.evaluate(async version => (await caches.keys()).some(key => key.endsWith(version)), original.version), false);
    assert.ok(await page.evaluate(async () => (await fetch('assets/responsive.css').then(response => response.text())).includes('verified test update')));
    release(`broken-${name}`);
    overrides.set('assets/responsive.css', { status: 503, body: Buffer.from('unavailable') });
    await page.evaluate(async () => {
      window.failedUpdate = false;
      const registration = await navigator.serviceWorker.getRegistration();
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker.addEventListener('statechange', () => { if (worker.state === 'redundant') window.failedUpdate = true; });
      });
      await registration.update().catch(() => {});
    });
    await page.waitForFunction(() => window.failedUpdate, null, { timeout: 20000 });
    assert.equal(await page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting)), false);
    await offline(context, name, true);
    await page.reload({ waitUntil: 'load' }); await ready(page);
    assert.ok(await page.evaluate(async () => (await fetch('assets/responsive.css').then(response => response.text())).includes('verified test update')), 'Failed deployment must preserve the working offline release');
    const cachesRemaining = await page.evaluate(() => caches.keys());
    assert.ok(cachesRemaining.includes('another-app-cache'));
    assert.ok(cachesRemaining.includes('fluency-flow:another-scope:shell:old'));
    await offline(context, name, false);
    const outside = await context.newPage(); await outside.goto(`http://127.0.0.1:${port}/outside.html`);
    assert.equal(await outside.evaluate(() => navigator.serviceWorker.controller), null);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `/private/tmp/fluency-pwa-${name}.png`, fullPage: true });
    console.log(`PASS ${name}: nested-path installation, icons, offline assets/practice/cold launch, install help, safe updates, failed-release rollback and other-app isolation`);
  } finally { await offline(context, name, false); await context.close(); await browser?.close(); if (profile) fs.rmSync(profile, { recursive: true, force: true }); overrides.clear(); }
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); port = server.address().port;
  try { if (!process.env.FLUENCY_ONLY_WEBKIT) await run(chromium, 'chromium'); if (!process.env.FLUENCY_SKIP_WEBKIT) await run(webkit, 'webkit'); }
  catch (error) { console.error(error); process.exitCode = 1; }
  finally { server.close(); server.closeAllConnections(); }
})();
