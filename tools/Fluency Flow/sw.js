/* Fluency Flow only. A complete release is cached before it can activate. */
importScripts('./assets/pwa-release.js');
const BASE = self.registration.scope;
const PREFIX = `fluency-flow:${BASE}:shell:`;
const CACHE = PREFIX + self.FLUENCY_RELEASE.version;
const INDEX = new URL('index.html', BASE).href;
const FILES = new Set(self.FLUENCY_RELEASE.shell.map(file => new URL(file, BASE).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      await cache.addAll(self.FLUENCY_RELEASE.shell.map(file => new Request(new URL(file, BASE), {
        cache: 'reload', integrity: self.FLUENCY_RELEASE.integrity[file]
      })));
    } catch (error) {
      await caches.delete(CACHE);
      throw error;
    }
    // Updates wait until all existing sessions close or the user chooses Reload.
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(BASE)) return;
  const key = url.origin + url.pathname;
  const isEntry = request.mode === 'navigate' && (key === BASE || key === INDEX);
  if (!isEntry && !FILES.has(key)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(isEntry ? INDEX : key)) || fetch(request);
  })().catch(() => Response.error()));
});
