/* This app owns only the shell and media within its own scope. */
importScripts('./assets/release-worker.js');
const BASE=new URL('./',self.location.href),PREFIX=RELEASE.id+':'+BASE.pathname+':';
const SHELL_CACHE=PREFIX+'shell:'+RELEASE.version,MEDIA_CACHE=PREFIX+'media:v1';
const absolute=url=>new URL(url,BASE).href;
const shell=new Map(RELEASE.shell.map(entry=>[absolute(entry.url),entry]));
const media=new Map(RELEASE.media.map(entry=>[absolute(entry.url),entry]));
const key=(url,entry)=>{const result=new URL(url);result.searchParams.set('sound_rev',entry.sha);return result.href;};
async function checked(url,entry){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(url,{cache:'no-store',signal:controller.signal});
  if(response.status!==200||response.redirected)throw Error('تعذر تنزيل الملف. تحقق من الاتصال ثم حاول مجدداً.');
  const bytes=await response.arrayBuffer(),sha=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
  if(sha!==entry.sha)throw Error('تم تحديث المحتوى. حدّث التطبيق ثم حاول مجدداً.');
  return new Response(bytes,{headers:{'Content-Type':entry.mime,'Content-Length':String(bytes.byteLength),'Accept-Ranges':'bytes'}});
 }finally{clearTimeout(timer);}
}
const pending=new Map();
async function cacheMedia(url,entry){
 if(!pending.has(url))pending.set(url,(async()=>{const cache=await caches.open(MEDIA_CACHE);if(!await cache.match(key(url,entry)))await cache.put(key(url,entry),await checked(url,entry));})().finally(()=>pending.delete(url)));
 await pending.get(url);
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(SHELL_CACHE);
 try{for(const [url,entry]of shell)await cache.put(url,await checked(url,entry));}
 catch(error){await caches.delete(SHELL_CACHE);throw error;}
 // A complete new shell waits for the user's Update now choice.
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith(PREFIX+'shell:')&&name!==SHELL_CACHE)await caches.delete(name);
 const valid=new Set([...media].map(([url,entry])=>key(url,entry))),cache=await caches.open(MEDIA_CACHE);
 for(const request of await cache.keys())if(!valid.has(request.url))await cache.delete(request);
 await self.clients.claim();
})()));
function fullURL(request){const url=new URL(request.url);url.search='';url.hash='';if(url.pathname===BASE.pathname)url.pathname+='index.html';return url.href;}
async function rangeResponse(response,range){
 const data=await response.arrayBuffer(),match=/^bytes=(\d*)-(\d*)$/.exec(range||'');
 const invalid=()=>new Response(null,{status:416,headers:{'Content-Range':`bytes */${data.byteLength}`}});
 if(!match||!match[1]&&!match[2])return invalid();
 let start=match[1]?Number(match[1]):Math.max(0,data.byteLength-Number(match[2]));
 let end=match[1]?(match[2]?Number(match[2]):data.byteLength-1):data.byteLength-1;end=Math.min(end,data.byteLength-1);
 if(start>end||start>=data.byteLength)return invalid();
 return new Response(data.slice(start,end+1),{status:206,headers:{'Content-Type':response.headers.get('Content-Type'),'Content-Length':String(end-start+1),'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${data.byteLength}`}});
}
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;const url=fullURL(event.request),entry=shell.get(url)||media.get(url);if(!entry)return;
 event.respondWith((async()=>{
  let response;
  if(media.has(url)){await cacheMedia(url,entry);response=await(await caches.open(MEDIA_CACHE)).match(key(url,entry));}
  else{const cache=await caches.open(SHELL_CACHE);response=await cache.match(url);if(!response){response=await checked(url,entry);await cache.put(url,response.clone());}}
  return event.request.headers.has('Range')?rangeResponse(response,event.request.headers.get('Range')):response;
 })().catch(()=>new Response('المحتوى غير محفوظ. نزّله عند الاتصال بالإنترنت.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})));
});
self.addEventListener('message',event=>{
 if(!event.source?.url?.startsWith(BASE.href))return;
 if(event.data?.type==='ACTIVATE_UPDATE'){event.waitUntil(self.skipWaiting());return;}
 const port=event.ports[0];if(!port)return;
 event.waitUntil((async()=>{try{
  if(event.data.type==='STATUS'){
   const cache=await caches.open(MEDIA_CACHE),keys=new Set((await cache.keys()).map(r=>r.url));
   const urls=[...media].filter(([url,entry])=>keys.has(key(url,entry))).map(([url])=>url);
   port.postMessage({count:urls.length,urls,version:RELEASE.version});
  }else if(event.data.type==='CACHE_ONE'){
   const url=event.data.url,entry=media.get(url);if(!entry)throw Error('ملف غير معروف. أعد فتح التطبيق.');
   await cacheMedia(url,entry);port.postMessage({ok:true});
  }else throw Error('طلب غير معروف.');
 }catch(error){port.postMessage({error:error.name==='QuotaExceededError'?'مساحة الجهاز غير كافية. حرّر مساحة ثم حاول مجدداً.':error.message});}})());
});
