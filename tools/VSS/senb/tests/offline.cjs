const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { currentContext } = require('./regression.cjs');
const root = path.resolve(__dirname, '..');
const hash = body => crypto.createHash('sha256').update(body).digest('hex');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/offline-assets.json'), 'utf8'));
function walk(directory) {
    return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]);
}
const physical = new Set([...walk('images'), ...walk('sounds')]);
const context = currentContext();
const basic = vm.runInContext('Object.entries(ITEMS_DATABASE).flatMap(([categoryId, items]) => items.map(item => getBasicImagePath({ ...item, categoryId })))', context);
for (const url of basic) assert.ok(physical.has(url), `Case-sensitive basic image path: ${url}`);
assert.equal(context.getBasicImagePath({ customImgPath: 'images/01 subject/1.png' }), 'images/01 subject/1.webp');
assert.equal(context.getBasicImagePath({ customImgPath: 'data:image/png;base64,abcd' }), 'data:image/png;base64,abcd');
for (const entry of catalog.assets) {
    assert.ok(physical.has(entry.url), `Case-sensitive catalog path: ${entry.url}`);
    const body = fs.readFileSync(path.join(root, entry.url));
    assert.equal(body.length, entry.bytes);
    assert.equal(hash(body), entry.revision);
    if (entry.url.endsWith('.webp')) assert.equal(body.subarray(8, 12).toString(), 'WEBP');
    if (entry.url.endsWith('.m4a')) assert.equal(body.subarray(4, 8).toString(), 'ftyp');
}
assert.equal(catalog.totalBytes, catalog.assets.reduce((sum, entry) => sum + entry.bytes, 0));
assert.equal(catalog.assets.length, [...physical].filter(url => /\.(webp|png|m4a)$/.test(url)).length);
const release = require('../../tests/module-release.cjs')('senb');
for (const file of release.shell) {
    assert.ok(fs.existsSync(path.join(root,file)),file);
    assert.equal(release.integrity[file], `sha256-${crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('base64')}`);
}
assert.ok(!release.shell.some(file=>file.endsWith('.m4a')),'Media remains opt-in');

require('./offline-download.cjs');
