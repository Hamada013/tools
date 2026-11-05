/* A complete revision is installed before any saved release is replaced. */
importScripts('./release.js');
const CACHE='follow-direction-'+self.FD_RELEASE.version,FILES=self.FD_RELEASE.files,ROOT=new URL('./',self.location).href;
const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);try{for(const entry of FILES){const r=await fetch(new Request(new URL(entry.url,self.registration.scope),{cache:'reload'}));if(!r.ok||await hash(await r.clone().arrayBuffer())!==entry.hash)throw Error('Incomplete release: '+entry.url);await cache.put(new URL(entry.url,ROOT).href,r);}}catch(e){await caches.delete(CACHE);throw e;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{await self.clients.claim();for(const key of await caches.keys())if(key.startsWith('follow-direction-')&&key!==CACHE)await caches.delete(key);})()));
self.addEventListener('message',event=>{
 if(event.data?.type==='ACTIVATE')self.skipWaiting();
 if(event.data?.type==='CHECK_OFFLINE')event.waitUntil((async()=>{const cache=await caches.open(CACHE);let done=0;for(const entry of FILES){if(!await cache.match(new URL(entry.url,ROOT).href)){event.ports[0]?.postMessage({error:true});return;}event.ports[0]?.postMessage({percent:Math.round(++done/FILES.length*100)});} })());
});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url),scope=new URL(self.registration.scope);if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),direct=await cache.match(event.request);if(direct)return direct;if(event.request.mode==='navigate'&&(url.pathname===scope.pathname||url.pathname===scope.pathname+'index.html'))return cache.match(new URL('index.html',ROOT).href);return fetch(event.request);})());
});
