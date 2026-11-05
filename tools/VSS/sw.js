/* The worker owns the download, independent of page visibility or navigation.
 * Media never downloads in install. Cache entries prove offline readiness.
 * Rebuild assets/pwa-release.js after changing this file or any app/media file. */
importScripts('./assets/pwa-release.js');
const { version, shell, integrity, media } = self.VSS_RELEASE;
const BASE = self.registration.scope;
const PREFIX = `vss:${new URL(BASE).pathname}:`;
const SHELL_CACHE = `${PREFIX}shell:${version}`;
const MEDIA_CACHE = `${PREFIX}media`; // Revisioned keys reuse unchanged assets between releases.
const STATE_CACHE = `${PREFIX}state`;
const STATE_URL = new URL('__offline_state__', BASE).href;
const BACKGROUND_ID = `vss-offline:${version}`;
const BACKGROUND_PREFIX = 'vss-offline:';
const absolute = path => new URL(path, BASE).href;

// All three activity catalogs share this scope and download state.
const assets = media.map(asset => ({
    ...asset,
    href: absolute(asset.url),
    key: `${absolute(asset.url)}?vss-rev=${asset.revision}`
}));
const byURL = new Map(assets.map(asset => [asset.href, asset]));
const shellURLs = new Set(shell.map(absolute));
const inFlight = new Map();
let downloadPromise = null;
let wanted;
let stateReady;
let stateWrite = Promise.resolve();
let completedAt = 0;
let inventory = null;
let lastError = null;
let handoffPromise;
let finishHandoff;
let preparingUpdate = false;
const mediaControllers = new Set();
const finishingBackground = new Set();

// A timeout covers both headers AND writing the body into Cache Storage.
async function cacheFile(cache, url, key, fileIntegrity, controllers) {
    const controller = new AbortController();
    controllers?.add(controller);
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
        const response = await fetch(url, {
            cache: 'reload', credentials: 'same-origin', signal: controller.signal,
            ...(fileIntegrity ? { integrity: fileIntegrity } : {})
        });
        // Never count 404s, redirects, partial audio, or opaque responses as saved.
        if (response.status !== 200 || response.redirected || response.type === 'opaque') {
            throw new Error(`HTTP ${response.status}: ${url}`);
        }
        await cache.put(key, response);
    } finally {
        clearTimeout(timeout);
        controllers?.delete(controller);
    }
}

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(SHELL_CACHE);
        // Only a small local shell, sequentially; no decoded Image/Audio objects.
        try {
            for (const url of shell) await cacheFile(cache, absolute(url), absolute(url), integrity[url]);
        } catch (error) { await caches.delete(SHELL_CACHE); throw error; }
        // Updates wait for existing app windows to close, avoiding mixed releases.
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        for (const name of await caches.keys()) {
            if (name.startsWith(PREFIX + 'shell:') && name !== SHELL_CACHE) await caches.delete(name);
        }
        const cache = await caches.open(MEDIA_CACHE);
        const current = new Set(assets.map(asset => asset.key));
        for (const request of await cache.keys()) {
            if (!current.has(request.url)) await cache.delete(request);
        }
        await self.clients.claim();
        // Finish activation before resuming media. Chrome queues navigation
        // fetches until this event resolves, even after clients.claim(). The
        // reloaded clients resume saved intent through their first VSS_STATUS.
    })());
});

async function readWanted() {
    if (wanted === undefined) {
        stateReady ||= (async () => {
            const response = await (await caches.open(STATE_CACHE)).match(STATE_URL);
            const state = response ? await response.json() : {};
            wanted = state.wanted === true;
            completedAt = state.completedAt || 0;
        })();
        await stateReady;
    }
    return wanted;
}

async function setWanted(value, complete = false) {
    await readWanted();
    wanted = value;
    if (value) completedAt = 0;
    if (complete) completedAt = Date.now();
    const body = JSON.stringify({ wanted, completedAt });
    stateWrite = stateWrite.catch(() => {}).then(async () => (await caches.open(STATE_CACHE)).put(STATE_URL,
        new Response(body, { headers: { 'Content-Type': 'application/json' } })));
    await stateWrite;
}

async function inspect(refresh = true) {
    if (!refresh && inventory) {
        inventory.wanted = await readWanted();
        inventory.completedAt = completedAt;
        return inventory;
    }
    const cache = await caches.open(MEDIA_CACHE);
    // keys() reads request metadata only, never thousands of response bodies.
    const keys = new Set((await cache.keys()).map(request => request.url));
    const shellCache = await caches.open(SHELL_CACHE);
    const shellKeys = new Set((await shellCache.keys()).map(request => request.url));
    const missingShell = shell.filter(url => !shellKeys.has(absolute(url)));
    const done = assets.reduce((count, asset) => count + Number(keys.has(asset.key)), 0);
    inventory = { keys, missingShell, done, total: assets.length,
        bytes: assets.reduce((sum, asset) => sum + asset.bytes, 0),
        ready: done === assets.length && missingShell.length === 0,
        wanted: await readWanted(), completedAt, version };
    return inventory;
}

function publicStatus(status) {
    const { keys, missingShell, ...result } = status;
    return result;
}

async function broadcast(status) {
    for (const client of await self.clients.matchAll({ type: 'window' })) {
        if (client.url.startsWith(BASE)) client.postMessage({ type: 'VSS_OFFLINE_PROGRESS', ...status });
    }
}

async function finishStatus(refresh = true) {
    const status = await inspect(refresh);
    if (status.ready && status.wanted) {
        await setWanted(false, true);
        status.wanted = false;
        status.completedAt = completedAt;
    }
    return publicStatus(status);
}

async function downloadError(error) {
    // Network loss preserves intent for online/reopen. A full disk needs a retry.
    const storageError = ['QuotaExceededError', 'SecurityError', 'InvalidStateError'].includes(error.name);
    if (storageError) { try { await setWanted(false); } catch {} }
    const result = { error: storageError ? 'storage' : 'network', message: error.message };
    lastError = result;
    await broadcast(result);
    return result;
}

async function saveMedia(asset) {
    // A second tab or a runtime audio/image request joins the same pending work.
    if (!inFlight.has(asset.key)) {
        const task = (async () => {
            const cache = await caches.open(MEDIA_CACHE);
            if (await cache.match(asset.key)) return;
            if (preparingUpdate) throw new DOMException('Preparing update', 'AbortError');
            const digest = btoa(String.fromCharCode(...asset.revision.match(/../g).map(hex => parseInt(hex, 16))));
            await cacheFile(cache, asset.href, asset.key, `sha256-${digest}`, mediaControllers);
        })();
        inFlight.set(asset.key, task);
    }
    try { await inFlight.get(asset.key); }
    finally { inFlight.delete(asset.key); }
}

async function runDownload() {
    const status = await inspect(false);
    for (const url of [...status.missingShell]) {
        if (preparingUpdate || !(await readWanted())) return;
        await cacheFile(await caches.open(SHELL_CACHE), absolute(url), absolute(url), integrity[url], mediaControllers);
        status.missingShell = status.missingShell.filter(missing => missing !== url);
    }
    let cursor = 0, failure;
    // A bounded queue runs inside waitUntil, even with no visible app window.
    // If the OS terminates it, a later visit inspects and reuses saved revisions.
    await Promise.all(Array.from({ length: 6 }, async () => {
        while (!failure && !preparingUpdate && await readWanted()) {
            const asset = assets[cursor++];
            if (!asset) return;
            if (status.keys.has(asset.key)) continue;
            try {
                await saveMedia(asset);
                if (!status.keys.has(asset.key)) { status.keys.add(asset.key); status.done++; }
                await broadcast({ ...publicStatus(status), ready: false, wanted });
            } catch (error) { failure = error; }
        }
    }));
    if (!preparingUpdate) {
        if (failure) throw failure;
        await broadcast(await finishStatus());
    }
}

async function backgroundRegistration() {
    try {
        const manager = self.registration.backgroundFetch;
        if (!manager) return;
        const ids = [BACKGROUND_ID, ...(await manager.getIds?.() || [])];
        for (const id of new Set(ids)) {
            if (!id.startsWith(BACKGROUND_PREFIX) || finishingBackground.has(id)) continue;
            const transfer = await manager.get(id);
            if (transfer) return transfer;
        }
    }
    catch { return undefined; }
}

async function statusWithProgress() {
    const status = await finishStatus(!downloadPromise);
    if (lastError && !status.ready) return { ...status, ...lastError };
    const background = status.wanted && await backgroundRegistration();
    if (background?.downloadTotal) {
        // 100% means verified in Cache Storage, not merely received by the browser.
        status.percent = Math.min(99, Math.floor(100 * (status.done +
            (status.total - status.done) * background.downloaded / background.downloadTotal) / (status.total || 1)));
    }
    return status;
}

function download() {
    if (downloadPromise) return downloadPromise;
    downloadPromise = (async () => {
        // Chrome permits backgroundFetch.fetch() only in a page. Give that page
        // a bounded handoff, then own the fallback if it closes or is denied.
        await handoffPromise;
        const status = await inspect(false);
        if (preparingUpdate || !status.wanted || status.ready || await backgroundRegistration()) return;
        await runDownload();
    })().catch(error => { if (!preparingUpdate) return downloadError(error); }).finally(() => { downloadPromise = null; });
    return downloadPromise;
}

function prepareBackground(status) {
    if (!handoffPromise) {
        handoffPromise = new Promise(resolve => {
            const timer = setTimeout(() => finishHandoff?.(), 5000);
            finishHandoff = () => {
                clearTimeout(timer);
                handoffPromise = null;
                finishHandoff = null;
                resolve();
            };
        });
    }
    const missing = assets.filter(asset => !status.keys.has(asset.key));
    return {
        id: BACKGROUND_ID,
        requests: [...status.missingShell.map(absolute), ...missing.map(asset => asset.href)],
        options: {
            title: 'تنزيل احكي حلو',
            icons: [{ src: absolute('icons/icon-192.png'), sizes: '192x192', type: 'image/png' }],
            // Shell sizes aren't in the inventory; leave the total unknown if
            // storage eviction also requires repairing the interface.
            ...(!status.missingShell.length ? { downloadTotal: missing.reduce((sum, asset) => sum + asset.bytes, 0) } : {})
        }
    };
}

async function saveBackgroundRecords(registration) {
    const records = await registration.matchAll();
    let cursor = 0, failure;
    // Keep only six response bodies in memory, including on a full-catalog run.
    await Promise.all(Array.from({ length: 6 }, async () => {
        while (cursor < records.length) {
            const record = records[cursor++];
            const asset = byURL.get(record.request.url);
            const shellFile = shellURLs.has(record.request.url) && record.request.url.slice(BASE.length);
            if (!asset && !shellFile) continue;
            try {
                const response = await record.responseReady;
                if (response.status !== 200 || response.redirected || response.type === 'opaque') throw new Error('Invalid download response');
                const body = await response.clone().arrayBuffer();
                const hash = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256', body))));
                const expected = asset
                    ? btoa(String.fromCharCode(...asset.revision.match(/../g).map(hex => parseInt(hex, 16))))
                    : integrity[shellFile].slice('sha256-'.length);
                if (hash !== expected || (asset && body.byteLength !== asset.bytes)) {
                    // A transfer started before an update can contain old revisions.
                    // Reuse unchanged files and fetch changed ones from the new release.
                    if (registration.id !== BACKGROUND_ID) continue;
                    throw new Error('Download verification failed');
                }
                await (await caches.open(asset ? MEDIA_CACHE : SHELL_CACHE)).put(asset ? asset.key : record.request.url, response);
            } catch (error) {
                // Salvage completed records even if another file failed or storage filled.
                if (!failure || error.name === 'QuotaExceededError') failure = error;
            }
        }
    }));
    if (failure) throw failure;
}

for (const type of ['backgroundfetchsuccess', 'backgroundfetchfail']) {
    self.addEventListener(type, event => {
        if (!event.registration.id.startsWith(BACKGROUND_PREFIX)) return;
        event.waitUntil((async () => {
            finishingBackground.add(event.registration.id);
            downloadPromise = saveBackgroundRecords(event.registration);
            try {
                await downloadPromise;
                const status = await finishStatus();
                await broadcast(status);
                if (!status.ready && event.registration.id !== BACKGROUND_ID && status.wanted) {
                    // End this save task before continuing the new release's queue.
                    downloadPromise = null;
                    await download();
                } else if (!status.ready) throw new Error('Background download incomplete');
                if ((await finishStatus()).ready) {
                    try { await event.updateUI({ title: 'اكتمل تنزيل احكي حلو' }); } catch {}
                }
            } catch (error) { await downloadError(error); }
            finally { downloadPromise = null; finishingBackground.delete(event.registration.id); }
        })());
    });
}
self.addEventListener('backgroundfetchabort', event => {
    if (!event.registration.id.startsWith(BACKGROUND_PREFIX)) return;
    event.waitUntil((async () => {
        try { await saveBackgroundRecords(event.registration); } catch {}
        await setWanted(false);
        await broadcast(await finishStatus());
    })());
});
self.addEventListener('backgroundfetchclick', event => {
    if (!event.registration.id.startsWith(BACKGROUND_PREFIX)) return;
    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: 'window' });
        const home = windows.find(client => client.url === absolute('index.html') || client.url === BASE);
        if (home) await home.focus();
        else await self.clients.openWindow(absolute('index.html'));
    })());
});

self.addEventListener('message', event => {
    const command = event.data?.type;
    if (command === 'ACTIVATE_UPDATE' && event.source?.url?.startsWith(BASE)) { event.waitUntil(self.skipWaiting()); return; }
    if (!['VSS_STATUS', 'VSS_START', 'VSS_PAUSE', 'VSS_BATCH', 'VSS_CONTINUE', 'VSS_PREPARE_UPDATE', 'VSS_CANCEL_UPDATE'].includes(command)) return;
    // Only this app's own windows can initiate a download.
    if (!event.source?.url?.startsWith(BASE)) return;
    event.waitUntil((async () => {
        let result, background;
        try {
            if (command === 'VSS_PREPARE_UPDATE') {
                preparingUpdate = true;
                finishHandoff?.();
                for (const controller of mediaControllers) controller.abort();
                await Promise.allSettled([...inFlight.values()]);
                await downloadPromise;
                event.ports[0]?.postMessage({ prepared: true });
                return;
            }
            if (command === 'VSS_CANCEL_UPDATE') preparingUpdate = false;
            const status = await inspect(!downloadPromise);
            if (command === 'VSS_START' || (command === 'VSS_STATUS' && event.data.resume !== false && status.wanted)) lastError = null;
            if (command === 'VSS_START' && !status.ready) await setWanted(true);
            if (command === 'VSS_CONTINUE') finishHandoff?.();
            if (command === 'VSS_PAUSE') {
                lastError = null;
                await setWanted(false);
                finishHandoff?.();
                await (await backgroundRegistration())?.abort();
            }
            result = await statusWithProgress();
            if (!preparingUpdate && event.data.background && result.wanted && !result.error && !result.ready &&
                (!downloadPromise || handoffPromise) && !await backgroundRegistration()) {
                background = prepareBackground(await inspect(false));
            }
        } catch (error) {
            result = await downloadError(error);
        }
        event.ports[0]?.postMessage(background ? { ...result, background } : result);
        await broadcast(result);
        // Acknowledge immediately; the event, not a page timer, owns the queue.
        // Polls observe progress only. Opening/returning/going online may resume it.
        if (!result.error && result.wanted && command !== 'VSS_PAUSE' && event.data.resume !== false) await download();
    })());
});

// Safari requests byte ranges even for short M4A clips. Slice just this one
// cached audio blob; never read the entire collection into memory.
async function rangeResponse(request, response) {
    const range = request.headers.get('Range');
    const match = /^bytes=(\d*)-(\d*)$/.exec(range || '');
    const blob = await response.blob();
    const size = blob.size;
    let start = match?.[1] ? Number(match[1]) : 0;
    let end = match?.[2] ? Number(match[2]) : size - 1;
    if (match && !match[1] && match[2]) { start = Math.max(0, size - Number(match[2])); end = size - 1; }
    const headers = new Headers(response.headers);
    headers.delete('Content-Encoding');
    headers.set('Accept-Ranges', 'bytes');
    if (!match || (!match[1] && !match[2]) || start >= size || start > end) {
        headers.set('Content-Range', `bytes */${size}`);
        headers.set('Content-Length', '0');
        return new Response(null, { status: 416, headers });
    }
    end = Math.min(end, size - 1);
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(blob.slice(start, end + 1), { status: 206, headers });
}

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    if (request.method !== 'GET' || !url.href.startsWith(BASE)) return;
    url.search = ''; // App links may carry category/search parameters.
    url.hash = '';
    if (url.pathname.endsWith('/')) url.pathname += 'index.html';
    const href = url.href;
    const asset = byURL.get(href);
    if (!asset && !shellURLs.has(href)) return; // Do not cache unrelated site pages.
    event.respondWith((async () => {
        try {
            const cache = await caches.open(asset ? MEDIA_CACHE : SHELL_CACHE);
            let response = await cache.match(asset ? asset.key : href);
            if (!response) {
                if (asset) await saveMedia(asset);
                else {
                    const relative = href.slice(BASE.length);
                    await cacheFile(cache, href, href, integrity[relative]);
                }
                response = await cache.match(asset ? asset.key : href);
            }
            if (!response) throw new Error('Cached file unavailable');
            return request.headers.has('Range') && asset?.url.endsWith('.m4a')
                ? rangeResponse(request, response) : response;
        } catch {
            // A full disk must not prevent normal online use.
            try { return await fetch(request); }
            catch { return new Response('هذا المحتوى غير متاح دون اتصال. عد للرئيسية لتنزيله.',
                { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
        }
    })());
});
