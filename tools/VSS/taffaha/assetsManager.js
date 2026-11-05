/** Paths are resolved against this module, so subpath hosting works. */
export const LIBRARIES={taffaha:'./'};
export const PLACEHOLDER=new URL('./assets/placeholder.svg',import.meta.url).href;
const imageRequests=new WeakMap();
export function assetURL(asset){
 if(!asset||!Object.prototype.hasOwnProperty.call(LIBRARIES,asset.library)||typeof asset.path!=='string')return null;
 if(asset.path.startsWith('/')||asset.path.split('/').includes('..')||/[?#\\]/.test(asset.path))return null;
 const url=new URL(LIBRARIES[asset.library]+asset.path,import.meta.url);
 if(asset.revision)url.searchParams.set('v',asset.revision);
 return url.origin===location.origin?url.href:null;
}
export function loadImage(img,asset,label=''){
 const candidates=(Array.isArray(asset)?asset:[asset]).map(assetURL).filter(Boolean),request={};imageRequests.set(img,request);
 // Clear the old picture immediately. Browsers otherwise retain its decoded
 // pixels while the new URL loads, briefly pairing a new label with old art.
 img.onerror=null;img.alt=label;img.src=PLACEHOLDER;img.dataset.loading='true';
 const next=()=>{
  if(imageRequests.get(img)!==request)return;
  const url=candidates.shift();if(!url){delete img.dataset.loading;return;}
  const pending=new Image();pending.onload=()=>{if(imageRequests.get(img)!==request)return;img.src=url;delete img.dataset.loading;};
  pending.onerror=next;pending.src=url;
 };next();
}
export async function loadWords(){
 const r=await fetch(new URL('assets/words.json',import.meta.url));
 if(!r.ok)throw Error('تعذر تحميل بطاقات الكلمات. أعد فتح التطبيق عندما يعود الاتصال.');
 return(await r.json()).words;
}
