export const LIBRARIES={voc:'../VSS/voc/',senb:'../VSS/senb/',arabicsounds:'../arabicsounds/','arabic-sound-app':'../arabicsounds/',local:'./assets/'};
export const PLACEHOLDER=new URL('assets/placeholder.svg',import.meta.url).href;
export function assetURL(asset){
 if(!asset||!Object.prototype.hasOwnProperty.call(LIBRARIES,asset.library)||typeof asset.path!=='string'||asset.path.startsWith('/')||asset.path.split('/').includes('..')||/[?#\\]/.test(asset.path))return null;
 return new URL(LIBRARIES[asset.library]+asset.path,import.meta.url).href;
}
export function loadImage(img,assets,label=''){
 const list=(Array.isArray(assets)?assets:[assets]).map(assetURL).filter(Boolean);img.alt=label;
 const next=()=>{const url=list.shift();if(url)img.src=url;else{img.onerror=null;img.src=PLACEHOLDER;}};img.onerror=next;next();
}
export async function loadPrompts(){const r=await fetch(new URL('assets/prompts.json',import.meta.url));if(!r.ok)throw Error('تعذر تحميل الكلمات. أعد فتح التطبيق عندما يعود الاتصال.');return(await r.json()).prompts;}
export const PHONEMES={'ا':1,'ب':2,'ت':3,'ك':22,'م':24,'ن':25,'و':27,'ي':28};
export const phoneme=letter=>({library:'arabic-sound-app',path:`sounds/${PHONEMES[letter]}.m4a`});
// Whole-word and sentence recordings are normal speech examples. The app never
// labels them as professionally recorded demonstrations of a therapy technique.
