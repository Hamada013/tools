// Shared device-local identities. Taffaha owns only child.taffaha.
export const STORAGE = 'voc-children-v1';
export const MODES = {count:'الصورة وعدد المقاطع', picture:'المقاطع والصورة'};
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const normalize = value => String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').slice(0, 60);
export function createProgress(storage, onError = () => {}) {
 const empty = () => ({schema:1, active:null, children:[]});
 const read = () => {try {const data=JSON.parse(storage.getItem(STORAGE));return data?.schema===1&&Array.isArray(data.children)?data:empty();} catch {return empty();}};
 let data=read(), owner=data.active, ok=true, resetEpochs={...data.accountResets};
 const active=()=>data.children.find(child=>child.id===owner)||null;
 // Read before every mutation, preserving progress written by other apps/tabs.
 function write(change, activate=false) {
  const latest=read();
  if(!activate&&(latest.accountResets?.[owner]||null)!==(resetEpochs[owner]||null))return false;
  if(latest.deletedChildren?.[owner]&&!activate){data=latest;owner=null;return false;}
  for(const child of data.children)if(!latest.deletedChildren?.[child.id]&&!latest.children.some(saved=>saved.id===child.id))latest.children.push(clone(child));
  if(!ok&&(latest.accountResets?.[owner]||null)===(resetEpochs[owner]||null)){const saved=latest.children.find(child=>child.id===owner);if(saved&&active()?.taffaha)saved.taffaha=clone(active().taffaha);}
  change(latest);if(activate){latest.active=owner;resetEpochs={...latest.accountResets};}data=latest;
  try {storage.setItem(STORAGE,JSON.stringify(data));ok=true;return true;} catch {ok=false;onError();return false;}
 }
 function signIn(name) {
  name=normalize(name);if(!name)return null;
  write(latest=>{
   let child=latest.children.find(child=>normalize(child.name).toLocaleLowerCase()===name.toLocaleLowerCase());
   if(!child){child={id:globalThis.crypto?.randomUUID?.()||`child-${Date.now()}-${Math.random().toString(36).slice(2)}`,name,role:name.toLocaleLowerCase()==='hamada'?'admin':'child',created:new Date().toISOString()};latest.children.push(child);}
   owner=child.id;child.taffaha||={attempts:[],workspace:null};child.apps = { ...child.apps, voc: true, senb: true, taffaha: true };
  },true);return active();
 }
 function record({id,word,mode,level,correct,firstTry,completed,sessionId}) {
  if(!active()||active().role==='admin'||!word?.id||!Object.hasOwn(MODES,mode)||!id)return false;
  return write(latest=>{
   const child=latest.children.find(child=>child.id===owner);child.taffaha||={};child.taffaha.attempts||=[];
   if(child.taffaha.attempts.some(entry=>entry.id===id))return;
   child.taffaha.attempts.push({id,sessionId,wordId:word.id,label:word.label,count:word.syllableCount,mode,level,correct:correct===true,firstTry:firstTry===true,completed:completed===true,date:new Date().toISOString()});
  });
 }
 const latestChild = id => (ok?read():data).children.find(child=>child.id===id)||null;
 function learned(wordId,mode) {
  const attempts=(latestChild(owner)?.taffaha?.attempts||[]).filter(entry=>entry.wordId===wordId&&entry.mode===mode&&entry.completed);
  const last=attempts.at(-1);return !!(last?.correct&&last.firstTry);
 }
 return {active,signIn,record,learned,storageOK:()=>ok,
  children:()=>clone((ok?read():data).children),
  reportChild:id=>{const child=active();if(!child)return null;return clone(latestChild(child.role==='admin'&&id?id:child.id));},
  workspace:()=>clone(active()?.taffaha?.workspace||null),
  flow:()=>clone(active()?.taffaha?.flow||null),
  saveFlow:flow=>!active()?false:write(latest=>{const child=latest.children.find(child=>child.id===owner);child.taffaha||={};child.taffaha.flow=clone(flow);}),
  saveWorkspace:workspace=>!active()?false:write(latest=>{const child=latest.children.find(child=>child.id===owner);child.taffaha||={};child.taffaha.workspace=clone(workspace);})
 };
}
let storage;try{storage=globalThis.localStorage;}catch{}
export const progress=createProgress(storage||{getItem(){},setItem(){throw Error('unavailable');}},()=>globalThis.dispatchEvent?.(new Event('taffaha-storage-error')));
if(globalThis.document)globalThis.TaffahaProgress=progress;
