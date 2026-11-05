const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { currentContext } = require('./regression.cjs');
const root = path.resolve(__dirname, '..');
const hash = body => crypto.createHash('sha256').update(body).digest('hex');
class MemoryCache {
    constructor() { this.entries = new Map(); }
    async keys() { return [...this.entries.keys()].map(url => new Request(url)); }
    async match(key) { return this.entries.get(String(key))?.clone(); }
    async put(key, response) { this.entries.set(String(key), response.clone()); }
}
const context = currentContext();
const stores = new Map();
let requests = 0, corrupt = false, active = 0, peak = 0;
const base = 'https://example.com/tools/VSS/senb/';
const fixtures = Array.from({ length: 6 }, (_, index) => Buffer.from(`recording-${index}`));
const sample = { assets: fixtures.map((body, index) => ({ url: `sounds/test/${index}.m4a`, bytes: body.length, revision: hash(body) })), totalBytes: fixtures.reduce((sum, body) => sum + body.length, 0) };
Object.assign(context, {
    URL, Request, Response, Headers, DOMException, AbortController, setTimeout, clearTimeout, crypto: crypto.webcrypto,
    caches: { async open(name) { if (!stores.has(name)) stores.set(name, new MemoryCache()); return stores.get(name); } },
    async fetch(url, options) {
        requests++; active++; peak = Math.max(peak, active);
        await new Promise(resolve => setTimeout(resolve, 5)); active--;
        const index = Number(new URL(url).pathname.split('/').at(-1).split('.')[0]);
        return new Response(corrupt ? 'HTML error page' : fixtures[index], { headers: { 'Content-Type': 'audio/mp4' } });
    }
});
vm.runInContext(fs.readFileSync(path.join(root, 'assets/offline-store.js'), 'utf8'), context);
const offline = context.SENBOffline;
(async () => {

    const media = await context.caches.open(offline.names(base).media);
    const entry = sample.assets[0];
    await offline.fetchAndStore(entry, media, base);
    assert.equal(requests, 1, 'On-demand caching requests only the displayed media');
    assert.equal((await media.keys()).length, 1);
    assert.equal(await (await media.match(offline.key(entry, base))).text(), fixtures[0].toString());
    const updated = { ...entry, revision: 'changed' };
    assert.equal(await media.match(offline.key(updated, base)), undefined, 'Changed revisions cannot reuse stale media');
    corrupt = true;
    await assert.rejects(offline.fetchAndStore(sample.assets[1], media, base), /File changed/);
    assert.equal((await media.keys()).length, 1, 'HTML/error responses must never enter the media cache');
    corrupt = false;
    const bigger = { assets: Array.from({ length: 18 }, (_, index) => ({ ...sample.assets[index % 6], url: `sounds/batch-${index}/${index % 6}.m4a` })) };
    bigger.totalBytes = bigger.assets.reduce((sum, entry) => sum + entry.bytes, 0);
    const controller = new AbortController();
    await assert.rejects(offline.download(bigger, base, { signal: controller.signal, onProgress: progress => { if (progress.completed === 1) controller.abort(); } }), /paused/);
    const partial = await offline.inspect(bigger, base);
    assert.ok(partial.completed > 0 && partial.completed <= 6, 'Pause retains only the active batch');
    const before = requests;
    await offline.download(bigger, base);
    assert.equal(requests - before, 18 - partial.completed, 'Resume skips completed files');
    assert.equal(peak, 6, 'No more than six media requests may run together');
    assert.equal((await offline.inspect(bigger, base)).completed, 18);
    const after = requests;
    await offline.download(bigger, base);
    assert.equal(requests, after, 'Repeated downloads reuse verified files');
    const complete = () => new Response('0123456789', { headers: { 'Content-Type': 'audio/mp4' } });
    for (const [range, expected, status] of [['bytes=0-3', '0123', 206], ['bytes=7-', '789', 206], ['bytes=-2', '89', 206], ['bytes=8-50', '89', 206], ['bytes=20-', '', 416], ['bytes=3-1', '', 416], ['bytes=-0', '', 416], ['bytes=0-2,5-6', '', 416]]) {
        const response = await offline.rangeResponse(new Request(base + 'test.m4a', { headers: { Range: range } }), complete());
        assert.equal(response.status, status, range); assert.equal(await response.text(), expected, range);
    }
    console.log('PASS: six-file concurrency, pause/resume, cached retry, revision validation, corrupt-response rejection, and audio byte ranges.');
})().catch(error => { console.error(error); process.exitCode = 1; });
