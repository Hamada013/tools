/* Scoped to this app. A controlled page can request sibling media without a
 * root-scoped worker: other apps' service workers and caches stay independent.
 * Versioned keys reuse unchanged shared media across releases. No bulk addAll:
 * only the small shell installs automatically; library downloads are opt-in.
 */
importScripts('./assets/pwa-release.js');
const RELEASE=self.IHKI_RELEASE,BASE=new URL('./',self.location.href);
const PREFIX='ihki-hilou:'+BASE.pathname+':',SHELL=PREFIX+'shell:'+RELEASE.version,MEDIA=PREFIX+'media',RUNTIME=PREFIX+'runtime';
const absolute=u=>new URL(u,BASE).href;
const catalog=new Map(RELEASE.media.map(a=>[absolute(a.url),a]));
const shell=new Map(RELEASE.shell.map(u=>[absolute(u),RELEASE.integrity[u]]));
const key=a=>{const u=new URL(a.url,BASE);u.searchParams.set('__ihki-hilou_rev',a.revision);return u.href;};
const hex=buffer=>Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('');
async function verified(url,revision){
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
 try{
  const response=await fetch(url,{cache:'no-store',signal:abort.signal});if(!response.ok||response.status!==200)throw Error('تعذر تنزيل أحد الملفات. تحقق من الاتصال ثم استكمل التنزيل.');
  const body=await response.arrayBuffer();if(hex(await crypto.subtle.digest('SHA-256',body))!==revision)throw Error('تغيّر ملف في المكتبة. حدّث التطبيق بعد نشر النسخة الجديدة.');
  // Fetch already decoded any HTTP compression. Do not attach a stale
  // compressed length/encoding to the decoded bytes stored in Cache Storage.
  const headers=new Headers(response.headers);headers.delete('Content-Encoding');headers.set('Content-Length',String(body.byteLength));
  return new Response(body,{status:200,headers});
 }finally{clearTimeout(timer);}
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(SHELL);
 try{for(const [url,revision]of shell)await cache.put(url,await verified(url,revision));}
 catch(e){await caches.delete(SHELL);throw e;}
 // Waiting until existing windows close avoids mixing old UI with a new bank.
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith(PREFIX+'shell:')&&name!==SHELL)await caches.delete(name);
 const valid=new Set(RELEASE.media.map(key)),media=await caches.open(MEDIA);
 for(const request of await media.keys())if(!valid.has(request.url))await media.delete(request);
 await self.clients.claim();
})()));
async function byteRange(response,range){
 if(!range)return response;
 const buffer=await response.arrayBuffer(),length=buffer.byteLength,match=/^bytes=(\d*)-(\d*)$/.exec(range);
 if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${length}`}});
 let start=match[1]?Number(match[1]):Math.max(0,length-Number(match[2])),end=match[1]?(match[2]?Number(match[2]):length-1):length-1;
 if(start>=length||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${length}`}});
 end=Math.min(end,length-1);const headers=new Headers(response.headers);headers.set('Content-Range',`bytes ${start}-${end}/${length}`);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');
 return new Response(buffer.slice(start,end+1),{status:206,headers});
}
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);if(url.origin!==BASE.origin)return;
 url.hash='';url.search='';let canonical=url.href;
 if(canonical===BASE.href)canonical=absolute('index.html');
 if(shell.has(canonical)){
  event.respondWith((async()=>{const cache=await caches.open(SHELL),cached=await cache.match(canonical);if(cached)return cached;const response=await verified(canonical,shell.get(canonical));await cache.put(canonical,response.clone());return response;})());return;
 }
 const item=catalog.get(canonical);
 if(item){
  event.respondWith((async()=>{
   const cache=await caches.open(MEDIA),cached=await cache.match(key(item));
   if(cached)return byteRange(cached,request.headers.get('Range'));
   // Visiting a card also saves the verified full response, never a partial
   // range. Full cached audio can answer iOS Safari's byte-range requests.
   const response=await verified(canonical,item.revision);await cache.put(key(item),response.clone());return byteRange(response,request.headers.get('Range'));
  })().catch(()=>new Response('',{status:503})));return;
 }
 // Stale-while-revalidate is limited to optional same-origin app assets.
 // Recordings live in IndexedDB; unknown shared files are not silently cached.
 if(canonical.startsWith(absolute('assets/'))){
  event.respondWith((async()=>{
   const cache=await caches.open(RUNTIME),cached=await cache.match(request);
   const update=fetch(request).then(async r=>{if(r.ok&&r.status===200)await cache.put(request,r.clone());return r;});
   event.waitUntil(update.catch(()=>{}));return cached||update;
  })());
 }
});
let batch=null,paused=false;
async function inventory(){const cache=await caches.open(MEDIA);return new Set((await cache.keys()).map(r=>r.url));}
async function status(){
 const stored=await inventory(),groups={};
 for(const a of RELEASE.media){const g=groups[a.library]||={total:0,count:0,bytes:0};g.total++;g.bytes+=a.bytes;if(stored.has(key(a)))g.count++;}
 return {version:RELEASE.version,groups,running:!!batch};
}
async function download(libraries){
 paused=false;const cache=await caches.open(MEDIA),stored=await inventory();
 const pending=RELEASE.media.filter(a=>libraries.includes(a.library)&&!stored.has(key(a))).slice(0,3);
 for(const a of pending){if(paused)break;const response=await verified(absolute(a.url),a.revision);await cache.put(key(a),response);}
 return status();
}
self.addEventListener('message',event=>{
 const port=event.ports[0];if(!port)return;
 event.waitUntil((async()=>{
  try{
   const {type,libraries}=event.data||{};let result;
   if(type==='STATUS')result=await status();
   else if(type==='BATCH'){
    if(!Array.isArray(libraries)||libraries.some(x=>!['voc','senb','arabicsounds'].includes(x)))throw Error('اختر مكتبة للتنزيل.');
    if(!batch)batch=download(libraries).finally(()=>{batch=null;});result=await batch;
   }else if(type==='PAUSE'){paused=true;result={paused:true};}
   else if(type==='CLEAR'){
    paused=true;if(batch)await batch.catch(()=>{});await caches.delete(MEDIA);await caches.delete(RUNTIME);result=await status();
   }else throw Error('طلب غير معروف.');
   port.postMessage({ok:true,result});
  }catch(e){port.postMessage({ok:false,error:e.name==='QuotaExceededError'?'المساحة غير كافية. حرّر بعض المساحة ثم استكمل التنزيل.':e.message||'توقف التنزيل. حاول مجددًا.'});}
 })());
});
