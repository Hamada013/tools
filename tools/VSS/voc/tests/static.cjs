const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const release = require('../../tests/module-release.cjs')('voc');
assert.equal(release.media.length, 40);
const media = release.media.flat();
assert.equal(new Set(media.map(a => a.url)).size, media.length);
for (const asset of media) {
    const body = fs.readFileSync(path.join(root, asset.url));
    assert.equal(asset.bytes, body.length);
    assert.equal(asset.revision, crypto.createHash('sha256').update(body).digest('hex'));
}
for (const url of release.shell) {
    assert.equal(release.integrity[url], `sha256-${crypto.createHash('sha256').update(fs.readFileSync(path.join(root, url))).digest('base64')}`);
}
const missing = new Set();
for (const page of release.shell.filter(url => url.endsWith('.html'))) {
    const source = fs.readFileSync(path.join(root, page), 'utf8');
    assert.ok(source.includes('apple-mobile-web-app-capable'));
    assert.ok(source.includes('assets/pwa.js'));
    assert.ok(!/cdn\.tailwindcss|fonts\.googleapis|cdnjs\.cloudflare|placehold\.co|\.wav`|\.png`/.test(source));
    // Compile inline app scripts and inspect their real category references.
    const sandbox = vm.createContext({ document: { addEventListener() {}, write() {} }, window: {} });
    for (const script of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
        new vm.Script(script[1], { filename: page }).runInContext(sandbox);
    }
    if (page === 'report.html') { assert.ok(source.includes('assets/reports.js')); continue; }
    if (page !== 'index.html') {
        assert.ok(source.includes('assets/games.js'), `${page} must load the shared game engine`);
        continue;
    }
    const categories = vm.runInContext('CATEGORIES', sandbox);
    for (const category of categories) for (const item of category.items) {
        for (const url of [item.image, item.audio]) if (!fs.existsSync(path.join(root, url))) missing.add(url);
    }
}
const gameContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/game-data.js'), 'utf8'), gameContext);
const gameData = gameContext.window.VOC_GAME_DATA;
assert.equal(gameData.categories.length, 40);
for (const category of gameData.categories) for (const item of category.items) {
    assert.ok(fs.existsSync(path.join(root, item.image)));
    assert.ok(fs.existsSync(path.join(root, item.audio)));
}
console.log(`Static checks passed: ${media.length} media assets and ${release.shell.length} local shell assets.`);
if (missing.size) console.log(`Existing source gaps (offline placeholders used for images):\n${[...missing].sort().join('\n')}`);
