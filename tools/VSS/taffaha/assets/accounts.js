/* Account deletion is shared across all three apps, with tombstones for old tabs. */
((root)=>{
 const KEY='voc-children-v1';
 const isAdmin=child=>child?.role==='admin'||String(child?.name||'').normalize('NFKC').trim().toLocaleLowerCase()==='hamada';
 const AVATAR_KEY='speech-account-avatars-v1';
 // Local outline drawings keep the same simple appearance on every device.
 // Store names, never platform emoji glyphs, separately from learning progress.
 const AVATAR_DRAWINGS={
  apple:'<path d="M12 7c-7-5-11 4-7 11 2 4 4 2 7 2s5 2 7-2c4-7 0-16-7-11Zm0 0V3m0 3c0-3 3-4 5-3-1 3-3 4-5 3Z"/>',
  pear:'<path d="M12 6c-3 0-3 5-6 8-5 6 1 8 6 8s11-2 6-8c-3-3-3-8-6-8Zm0 0V2m0 3c2-3 4-3 6-2-1 3-4 3-6 2Z"/>',
  orange:'<circle cx="12" cy="14" r="8"/><path d="M12 6V3m0 2c2-3 5-3 7-2-2 3-4 4-7 2M7 13l1-2"/>',
  lemon:'<path d="M4 17c-5-8 5-18 13-13l3 1 1 3c5 8-5 18-13 13l-3-1-1-3Zm4-5c0-2 2-4 4-4"/>',
  banana:'<path d="M17 3c2 8-3 14-12 12l-2 2c10 10 20-1 17-12l-3-2Zm0 0 1-2M3 17l-1 2m5-1c5 1 10-2 11-7"/>',
  watermelon:'<path d="M2 8h20a10 10 0 0 1-20 0Zm3 0a7 7 0 0 0 14 0M8 11v1m4 0v1m4-2v1"/>',
  grapes:'<path d="M12 5V2m0 3c2-3 5-3 7-2-2 3-5 4-7 2"/><circle cx="8" cy="8" r="3"/><circle cx="15" cy="8" r="3"/><circle cx="5" cy="14" r="3"/><circle cx="12" cy="14" r="3"/><circle cx="19" cy="14" r="3"/><circle cx="8.5" cy="20" r="3"/><circle cx="15.5" cy="20" r="3"/>',
  strawberry:'<path d="m12 6-4-4v4L4 5l2 4c-6 3 1 13 6 13s12-10 6-13l2-4-4 1V2l-4 4Zm-4 6h.01M15 12h.01M12 17h.01"/>',
  cherry:'<circle cx="6" cy="17" r="4"/><circle cx="18" cy="17" r="4"/><path d="M6 13 12 3l6 10M12 3c3-3 7-1 8 2-4 1-6 0-8-2Z"/>',
  peach:'<path d="M12 7c-8-5-14 8-6 13 4 3 8 3 12-1 7-7 0-16-6-12Zm0 0c3 4 2 9 0 13m0-13V3m1 2c2-3 5-3 7-1-2 3-5 3-7 1Z"/>',
  pineapple:'<path d="m8 7-2-5 6 3 6-3-2 5m-4-2V1M7 8c-5 5-4 14 5 14s10-9 5-14H7Zm0 1 10 10m-12-6 9 9m3-13L7 19m12-6-9 9"/>',
  avocado:'<path d="M12 2c-4 0-3 4-7 9-4 5-1 11 7 11s11-6 7-11c-4-5-3-9-7-9Z"/><circle cx="12" cy="15" r="4"/>',
  coconut:'<circle cx="12" cy="13" r="9"/><path d="M5 7c4 4 10 4 14 0M4 12c5 4 11 4 16 0m-8 4h.01M9 18h.01M15 18h.01"/>',
  kiwi:'<ellipse cx="12" cy="12" rx="9" ry="10"/><ellipse cx="12" cy="12" rx="6.5" ry="7.5"/><ellipse cx="12" cy="12" rx="2" ry="3"/><path d="M12 6v1m0 10v1m-5-6h1m8 0h1M8 8l1 1m6 6 1 1M8 16l1-1m6-6 1-1"/>',
  mango:'<path d="M18 4c5 4 3 15-5 18C2 25-2 10 8 6c4-1 5-5 10-2Zm0 0c-3-4-5-3-6-2m5 6c1 4-1 8-4 10"/>',
  melon:'<circle cx="12" cy="13" r="9"/><ellipse cx="12" cy="13" rx="4" ry="9"/><path d="M12 4V2m-9 8h18M3 16h18"/>',
  tomato:'<path d="M8 7c-8-2-9 14 4 14s12-16 4-14M12 8V2m0 5-5-3 1 5-4 1 6 2 2-4 2 4 6-2-4-1 1-5-5 3Z"/>',
  blueberry:'<circle cx="12" cy="13" r="9"/><path d="m12 7 1 3 3 1-2 2v3l-2-2-3 1 1-3-2-2h3l1-3Zm0-3V2m1 1c3-2 5-1 6 1-3 2-5 1-6-1Z"/>',
  olive:'<path d="M6 21 18 3M12 12C3 15 0 6 4 4c6-2 9 5 8 8Zm0 0c8-5 12 2 8 6-5 3-9-2-8-6Z"/>',
  starfruit:'<path d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1 3-6Zm0 5v8m-6-4 6 4 6-4m-6 4-3 4m3-4 3 4"/>',
  cat:'<path d="m4 10-1-7 7 4h4l7-4-1 7c6 12-22 16-16 0Zm4 2h.01M16 12h.01m-5 4h2l-1 1-1-1Zm1 1v2m-6-3-4-1m4 4-4 1m16-4 4-1m-4 4 4 1"/>',
  dog:'<path d="M7 5c-3-5-7 8-3 9l2-4m11-5c3-5 7 8 3 9l-2-4M7 5c3-2 7-2 10 0l2 10c0 9-14 9-14 0L7 5Zm2 6h.01M15 11h.01m-5 4h4l-2 2-2-2Zm2 2v3"/>',
  rabbit:'<path d="M8 10C0-2 8-4 10 9m4 0c2-13 10-11 2 1M6 11c-5 5-2 11 6 11s11-6 6-11c-2-3-10-3-12 0Zm3 3h.01M15 14h.01m-4 3h2l-1 1-1-1Zm1 1v2"/>',
  bear:'<path d="M5 9c-7-6 2-11 4-5m6 0c2-6 11-1 4 5M3 13a9 9 0 1 1 18 0c0 11-18 11-18 0Zm5-2h.01M16 11h.01"/><ellipse cx="12" cy="17" rx="4" ry="3"/><path d="M11 16h2l-1 1-1-1Z"/>',
  fox:'<path d="M3 3 11 7h2l8-4-1 12-8 7-8-7L3 3Zm1 12 8-3 8 3M8 10h.01M16 10h.01m-6 7h4l-2 2-2-2Z"/>',
  lion:'<path d="m12 1 4 3 4 1 1 5 2 4-3 4-2 4h-6l-6 1-2-5-3-4 2-4 1-5 5-1 3-3Z"/><ellipse cx="12" cy="13" rx="6" ry="7"/><path d="M9 11h.01M15 11h.01m-5 4h4l-2 2-2-2Zm2 2v2"/>',
  monkey:'<path d="M5 9c-6-2-6 8 0 7m14-7c6-2 6 8 0 7M5 11C1-1 23-1 19 11m-7-2C5 1-1 19 9 21c12 5 18-13 7-15l-4 3ZM8 12h.01M16 12h.01m-8 5c2 2 6 2 8 0"/>',
  pig:'<path d="m5 8-2-6 7 3m4 0 7-3-2 6M3 13a9 9 0 1 1 18 0c0 11-18 11-18 0Zm5-3h.01M16 10h.01"/><rect x="7" y="14" width="10" height="6" rx="3"/><path d="M10 17h.01M14 17h.01"/>',
  cow:'<path d="M6 7C2 8 1 4 2 2l5 3m10 0 5-3c1 2 0 6-4 5M6 7c-6 0-6 6-1 5m14 0c5 1 5-5-1-5M7 5h10l2 10c0 9-14 9-14 0L7 5Zm2 5h.01M15 10h.01"/><ellipse cx="12" cy="17" rx="6" ry="4"/><path d="M9 17h.01M15 17h.01"/>',
  panda:'<circle cx="5" cy="5" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="12" cy="13" r="9"/><ellipse cx="8" cy="12" rx="2" ry="3" transform="rotate(30 8 12)"/><ellipse cx="16" cy="12" rx="2" ry="3" transform="rotate(-30 16 12)"/><path d="m10 17 2 2 2-2h-4Z"/>',
  owl:'<path d="m4 8-1-6 7 3h4l7-3-1 6c6 17-22 17-16 0Zm6 13-2 2m6-2 2 2m-6-10 2 3 2-3"/><circle cx="7.5" cy="10" r="4"/><circle cx="16.5" cy="10" r="4"/><path d="M7.5 10h.01M16.5 10h.01"/>',
  penguin:'<path d="M6 8C5 0 19 0 18 8l3 8-3-1c2 9-14 9-12 0l-3 1 3-8Zm1 13-3 2m13-2 3 2M9 7h.01M15 7h.01m-6 3 3 2 3-2H9Z"/><path d="M9 14c-3 7 9 7 6 0"/>',
  bird:'<path d="M3 16C1 3 17-2 18 8l4 3h-5c1 9-8 13-14 5Zm4-4c0 6 6 5 7 1M13 7h.01m-6 13-1 3m6-3v3"/>',
  duck:'<path d="M3 12c2 3 5 3 7 0C3 5 12-2 17 4c2 2 1 5 0 6l5 1-5 2c3 9-15 13-15 3l1-4Zm4 4c2 2 4 2 6 0M14 5h.01"/>',
  fish:'<path d="M4 12c6-10 12-10 16 0-4 10-10 10-16 0Zm0 0-3-6v12l3-6Zm9-7c-2 5-2 9 0 14M17 11h.01m-9-5 2-4 5 2m-7 14 2 4 5-2"/>',
  whale:'<path d="M3 9c4-6 15-3 15 3l3-4 2 1-1 7c-2 9-21 7-21-2 0-2 1-4 2-5Zm0 7c4 2 7 2 10 1M6 11h.01M8 4V2m0 2L5 2m3 2 3-2"/>',
  dolphin:'<path d="M2 14c2-7 7-10 13-8l3-4 1 7c3 2 4 6 3 9l-4-3c-3 1-7 2-10-1l-6 2v-2Zm6 0-1 5 6-3m4-6h.01"/>',
  turtle:'<ellipse cx="11" cy="13" rx="7" ry="6"/><circle cx="20" cy="10" r="3"/><path d="m6 8-2-4m2 14-2 4m11-14 1-4m-1 14 1 4M4 13H1m7-4 6 8m1-8-7 8m-4-4h13"/>',
  snail:'<circle cx="10" cy="12" r="7"/><path d="M10 15c-4 0-4-6 0-6 3 0 3 4 0 4M3 19c-3 3 13 5 17-1l1-6m-2-1 3-2m-3 2-1-3m3 4h.01"/>',
  butterfly:'<path d="M11 9C0-9-4 20 10 14-3 22 14 26 12 14c-2 12 15 8 2 0 14 6 10-23-1-5m-1 0v7m0-9-3-4m3 4 3-4"/>',
  bee:'<ellipse cx="12" cy="15" rx="7" ry="6"/><path d="M7 11C-1 5 9-3 12 9c3-12 13-4 5 2M9 10v10m6-10v10M5 15H2m17 0h3M9 14h.01M15 14h.01"/>',
  ladybird:'<ellipse cx="12" cy="14" rx="8" ry="8"/><path d="M8 6c0-6 8-6 8 0m-7-3L7 1m8 2 2-2m-5 5v16M4 11l-3-1m3 6-3 1m19-6 3-1m-3 6 3 1M8 11h.01M16 11h.01M8 17h.01M16 17h.01"/>',
  crab:'<ellipse cx="12" cy="15" rx="7" ry="5"/><path d="M9 10V7m6 3V7M5 14 2 9m17 5 3-5M3 3c-5 4 1 9 3 5l-3-2 3-3M21 3c5 4-1 9-3 5l3-2-3-3M5 17l-4 2m7 1-4 3m15-6 4 2m-7 1 4 3"/>',
  octopus:'<path d="M6 12C0-2 24-2 18 12c7 3 5 10 2 8l-3-4c4 8-3 9-3 2v-2c1 10-5 10-4 0v2c0 7-7 6-3-2l-3 4c-3 2-5-5 2-8Zm3-4h.01M15 8h.01m-5 3c1 1 3 1 4 0"/>',
  elephant:'<path d="M8 7c-11-10-9 15-1 10m9-10c11-10 9 15 1 10M8 7c0-6 8-6 8 0v10c0 7-8 6-8 1m0-8h.01M16 10h.01m-7 3v6c0 3 5 3 5 0v-1"/>',
  giraffe:'<path d="M9 7V3m6 4V3M7 9C0 6 0 1 8 6m8 0c8-5 8 0 1 3M8 7h8l2 11c1 6-13 6-12 0L8 7Zm2 4h.01M14 11h.01M7 16h10M9 19h.01M15 19h.01"/>',
  frog:'<path d="M3 10C-1 1 11 0 10 7h4c-1-7 11-6 7 3 8 16-26 16-18 0Zm3-4h.01M18 6h.01m-12 9c3 4 9 4 12 0"/>',
  hedgehog:'<path d="m2 16 1-5 2 1-1-6 4 2 1-6 4 4 4-4 1 6 4-1-1 6 2 4-5 4H7l-5-5Zm0 0 6-4 5 7m-8-3h.01m3 5v2m9-2v2"/>',
  squirrel:'<path d="M10 15C-5 18 0-4 9 3c5 4-5 3-3 8m5-2 1-6 4 4 3 3-3 3c9 9-9 13-9 6l4-10Zm4 0h.01m-3 12h7m-6-7 4 2"/>',
  horse:'<path d="m6 9 3-6h7l4 7-4 12H6l2-7-5-3 3-3Zm4-5V1l4 3m2 0 2-3 1 8M7 9h.01m-3 3 5-1m3 0-2 10"/>',
  koala:'<circle cx="5" cy="8" r="4"/><circle cx="19" cy="8" r="4"/><circle cx="12" cy="14" r="8"/><ellipse cx="12" cy="14" rx="2" ry="3"/><path d="M8 12h.01M16 12h.01m-6 7c1 1 3 1 4 0"/>'
 };
 const AVATAR_ICONS=Object.keys(AVATAR_DRAWINGS);
 const avatarMemory=new WeakMap(),unavailableStorage={};
 function* avatarChoices(){
  yield* AVATAR_ICONS;
  // Large account lists continue with unique pairs, then larger combinations.
  // Never reuse a child's complete avatar or put the same icon twice in one.
  for(let size=2;size<=AVATAR_ICONS.length;size++){
   const indexes=Array.from({length:size},(_,i)=>i);
   while(true){
    yield indexes.map(index=>AVATAR_ICONS[index]).join(' ');
    let at=size-1;while(at>=0&&indexes[at]===AVATAR_ICONS.length-size+at)at--;
    if(at<0)break;indexes[at]++;for(let i=at+1;i<size;i++)indexes[i]=indexes[i-1]+1;
   }
  }
 }
 function assignAvatars(storage,children,random=Math.random){
  const memoryKey=storage||unavailableStorage;
  let saved=avatarMemory.get(memoryKey)||{},raw=null;
  try{raw=storage?.getItem(AVATAR_KEY);const record=JSON.parse(raw);if(record?.schema===1&&record.icons&&typeof record.icons==='object')saved={...saved,...record.icons};}catch{}
  const kids=children.filter(child=>child?.id&&!isAdmin(child)),assigned=new Map(),used=new Set();
  const valid=value=>{
   if(typeof value!=='string')return false;
   const indexes=value.split(' ').map(icon=>AVATAR_ICONS.indexOf(icon));
   return indexes.every((index,i)=>index>=0&&(i===0||index>indexes[i-1]));
  };
  for(const child of kids){const icon=saved[child.id];if(valid(icon)&&!used.has(icon)){assigned.set(child.id,icon);used.add(icon);}}
  const missing=kids.filter(child=>!assigned.has(child.id)),free=AVATAR_ICONS.filter(icon=>!used.has(icon));
  if(missing.length){
   if(free.length<missing.length)for(const icon of avatarChoices()){if(icon.includes(' ')&&!used.has(icon))free.push(icon);if(free.length>=missing.length)break;}
   for(let i=free.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[free[i],free[j]]=[free[j],free[i]];}
   for(const child of missing)assigned.set(child.id,free.pop());
  }
  const icons={...saved,...Object.fromEntries(assigned)};
  avatarMemory.set(memoryKey,icons);
  const next=JSON.stringify({schema:1,icons});
  if(raw!==next)try{storage?.setItem(AVATAR_KEY,next);}catch{}
  return assigned;
 }
 function remove(storage,ownerId,targetId){
  let data;try{data=JSON.parse(storage.getItem(KEY));}catch{return false;}
  if(data?.schema!==1||!Array.isArray(data.children))return false;
  const owner=data?.children?.find(child=>child.id===ownerId),target=data?.children?.find(child=>child.id===targetId);
  if(!isAdmin(owner)||data.active!==ownerId||!target||isAdmin(target))return false;
  data.deletedChildren={...data.deletedChildren,[targetId]:new Date().toISOString()};
  data.children=data.children.filter(child=>child.id!==targetId);if(data.active===targetId)data.active=null;
  try{storage.setItem(KEY,JSON.stringify(data));}catch{return false;}
  for(const app of ['voc','senb','taffaha','arabicsounds','auditory-rehabilitation'])try{storage.removeItem?.(`speech-homework-v1:${app}:${encodeURIComponent(targetId)}`);}catch{}
  try{for(let i=storage.length-1;i>=0;i--){const key=storage.key(i);if(['arabicsounds','auditory-rehabilitation'].some(app=>key?.startsWith(`speech-sound-lesson:${app}:${targetId}:`)))storage.removeItem(key);}}catch{}
  return true;
 }
 // Reset only the protected owner's activity; identities, children and media stay intact.
 function resetHamada(storage,ownerId){
  let data;try{data=JSON.parse(storage.getItem(KEY));}catch{return false;}
  if(data?.schema!==1||!Array.isArray(data.children)||data.active!==ownerId)return false;
  const owner=data.children.find(child=>child.id===ownerId);
  if(!isAdmin(owner)||String(owner.name||'').normalize('NFKC').trim().toLocaleLowerCase()!=='hamada')return false;
  const previousReset=data.accountResets?.[ownerId];
  Object.assign(owner,{words:{},workspace:null,plan:null,sessions:[],homeLesson:null,wordLevels:{},senb:{sessions:[],mastery:{},workspace:null,draft:null,lesson:null},taffaha:{attempts:[],workspace:null,flow:null}});
  data.accountResets={...data.accountResets,[ownerId]:`${Date.now()}-${Math.random().toString(36).slice(2)}`};
  try{storage.setItem(KEY,JSON.stringify(data));}catch{return false;}
  // Old VOC drafts are also invalidated by the revision in VocProgress.scope().
  const keys=['voc','senb','taffaha'].flatMap(app=>{const key=`speech-homework-v1:${app}:${encodeURIComponent(ownerId)}`;return previousReset?[key,`${key}:reset-${previousReset}`]:[key];});
  for(const mode of ['matching','memory','rapid','test'])for(const revision of [null,previousReset].filter((value,index)=>index===0||value))for(const suffix of ['draft','last','preferences'])keys.push(`hamada-game-${mode}-child-${ownerId}${revision?'-reset-'+revision:''}-${suffix}`);
  for(const key of keys)try{storage.removeItem?.(key);}catch{}
  return true;
 }
 const normalizeName=name=>String(name||'').normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').trim().toLocaleLowerCase();
 function orderedChildren(children,query='',sort='oldest'){
  const collator=new Intl.Collator('ar',{sensitivity:'base',numeric:true}),needle=normalizeName(query);
  const list=children.map((child,index)=>({...child,position:index})).filter(child=>!isAdmin(child)&&normalizeName(child.name).includes(needle));
  return list.sort((a,b)=>sort==='alphabet'?collator.compare(a.name,b.name)||a.position-b.position:(sort==='newest'?-1:1)*(((Date.parse(a.created)||0)-(Date.parse(b.created)||0))||a.position-b.position));
 }
 if(typeof module!=='undefined')module.exports={remove,resetHamada,orderedChildren,assignAvatars};
 if(!root.document)return;
 const current=()=>root.VocProgress?.active()||root.SenbProgress?.active()||root.TaffahaProgress?.active()||root.SoundProgress?.active();
 let dialog,resetDialog,openSort,sortSerial=0,avatars=new Map();
 const glyph=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 function requestReset(){
  const child=current();if(!isAdmin(child)||!['VocProgress','SenbProgress','TaffahaProgress'].some(name=>root[name]))return;
  if(!resetDialog){
   resetDialog=document.createElement('dialog');resetDialog.id='reset-hamada-dialog';resetDialog.className='suite-dialog';resetDialog.setAttribute('aria-labelledby','reset-hamada-title');
   resetDialog.innerHTML=`<h2 id="reset-hamada-title">مسح بيانات حمادة؟</h2><p>مسح تدريب حمادة وتقاريره ومساحات عمله في كلمة وجملة ومقطع. تبقى حسابات الأطفال وتقدّمهم والتنزيلات.</p><div class="suite-reset-actions"><button type="button" data-reset-cancel aria-label="إلغاء" title="إلغاء">${glyph('<path d="m6 6 12 12M18 6 6 18"/>')}</button><button type="button" data-reset-confirm aria-label="نعم، امسح بيانات حمادة" title="نعم، امسح بيانات حمادة">${glyph('<path d="m5 12 4 4L19 6"/>')}</button></div><p role="alert"></p>`;
   document.body.append(resetDialog);resetDialog.querySelector('[data-reset-cancel]').onclick=()=>resetDialog.close();
  }
  const owner=child.id;resetDialog.querySelector('[role=alert]').textContent='';
  resetDialog.querySelector('[data-reset-confirm]').onclick=()=>{
   let ok=false;try{ok=resetHamada(localStorage,owner);}catch{}
   if(ok){resetDialog.close();location.reload();}else resetDialog.querySelector('[role=alert]').textContent='تعذّر مسح البيانات. لم يتغيّر الحساب؛ أعد المحاولة.';
  };
  resetDialog.showModal();resetDialog.querySelector('[data-reset-cancel]').focus();
 }
 function avatar(child){
  const icon=avatars.get(child.id),parts=icon.split(' ');
  let seed=0;for(const letter of icon)seed=(seed+letter.codePointAt(0))>>>0;
  const colors=[['#edf5fb','#487a9a'],['#edf6f0','#4e8869'],['#fbf3e8','#a47c40'],['#f4eff9','#8b70a6'],['#fcf0ed','#b07764'],['#eaf6f4','#4b8b83']],circle=document.createElement('span');circle.className='suite-account-avatar';circle.dir='ltr';[circle.style.background,circle.style.color]=colors[seed%colors.length];circle.dataset.avatar=icon;circle.setAttribute('aria-hidden','true');
  circle.style.setProperty('--avatar-columns',String(Math.ceil(Math.sqrt(parts.length))));
  for(const part of parts){const symbol=document.createElement('span');symbol.innerHTML=glyph(AVATAR_DRAWINGS[part]);circle.append(symbol);}
  return circle;
 }
 function sortControl(onChange){
  const choices=[['oldest','الأقدم أولًا','<path d="M5 4v15m-3-3 3 3 3-3M11 6h10M11 12h7M11 18h4"/>'],['newest','الأحدث أولًا','<path d="M5 20V5M2 8l3-3 3 3M11 6h4M11 12h7M11 18h10"/>'],['alphabet','حسب الأبجدية','<path d="M5 4v15m-3-3 3 3 3-3M13 4v5m-2 0h4m-2 6c-3 0-4 4-1 4h5m-2-6h.01"/>']];
  const wrap=document.createElement('div');wrap.className='suite-account-sort-wrap';
  const trigger=document.createElement('button');trigger.type='button';trigger.className='suite-account-sort';trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-label','ترتيب الحسابات: '+choices[0][1]);
  const label=document.createElement('span');label.textContent=choices[0][1];
  trigger.innerHTML=glyph('<path d="M4 6h16M4 12h11M4 18h6"/>');trigger.append(label);trigger.insertAdjacentHTML('beforeend',glyph('<path d="m7 10 5 5 5-5"/>'));
  const list=document.createElement('div');list.id='suite-account-sort-'+(++sortSerial);list.className='suite-account-sort-menu';list.setAttribute('role','listbox');list.setAttribute('aria-label','ترتيب الحسابات');list.hidden=true;trigger.setAttribute('aria-controls',list.id);
  let value='oldest';
  const close=(restore=false)=>{list.hidden=true;trigger.setAttribute('aria-expanded','false');if(openSort?.wrap===wrap)openSort=null;if(restore)trigger.focus();};
  const options=choices.map(([id,text,path])=>{
   const option=document.createElement('button');option.type='button';option.className='suite-account-sort-option';option.dataset.sortValue=id;option.setAttribute('role','option');option.setAttribute('aria-selected',String(id===value));option.tabIndex=-1;
   option.innerHTML=glyph(path);const name=document.createElement('span');name.textContent=text;option.append(name);option.insertAdjacentHTML('beforeend',glyph('<path d="m5 12 4 4L19 6"/>'));
   option.onclick=()=>{value=id;label.textContent=text;trigger.setAttribute('aria-label','ترتيب الحسابات: '+text);options.forEach(item=>item.setAttribute('aria-selected',String(item===option)));close(true);onChange(value);};list.append(option);return option;
  });
  const show=(focus=true)=>{
   openSort?.close();list.hidden=false;trigger.setAttribute('aria-expanded','true');openSort={wrap,close};
   // Open upwards when the surrounding modal has too little space below.
   list.classList.remove('suite-account-sort-above');const bounds=wrap.closest('dialog')?.getBoundingClientRect(),rect=list.getBoundingClientRect();
   if(rect.bottom>Math.min(root.innerHeight,bounds?.bottom||root.innerHeight)-12&&wrap.getBoundingClientRect().top-rect.height>(bounds?.top||0)+12)list.classList.add('suite-account-sort-above');
   if(focus)options.find(option=>option.dataset.sortValue===value).focus({preventScroll:true});
  };
  trigger.onclick=()=>list.hidden?show():close();
  trigger.onkeydown=event=>{if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();show();if(event.key==='Home')options[0].focus();if(event.key==='End')options.at(-1).focus();}};
  wrap.onkeydown=event=>{
   if(list.hidden)return;
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);}
   else if(event.key==='Tab')close();
   else if(event.target!==trigger&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
    event.preventDefault();const index=options.indexOf(document.activeElement),next=event.key==='Home'?0:event.key==='End'?options.length-1:(index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;options[next].focus();
   }
  };
  wrap.onfocusout=event=>{if(!wrap.contains(event.relatedTarget))close();};
  wrap.append(trigger,list);return wrap;
 }
 document.addEventListener('pointerdown',event=>{if(openSort&&!openSort.wrap.contains(event.target))openSort.close();});
 function request(child){
  if(!isAdmin(current())||!child||isAdmin(child))return;
  if(!dialog){dialog=document.createElement('dialog');dialog.id='delete-account-dialog';dialog.className='suite-dialog';dialog.setAttribute('aria-labelledby','delete-account-title');dialog.innerHTML='<h2 id="delete-account-title">حذف الحساب</h2><p data-delete-message></p><div class="suite-text-actions"><button type="button" data-delete-confirm>نعم، حذف الحساب</button><button type="button" data-delete-back>عودة</button></div><p role="alert"></p>';document.body.append(dialog);dialog.querySelector('[data-delete-back]').onclick=()=>dialog.close();}
  const owner=current().id;dialog.querySelector('[data-delete-message]').textContent=`هل أنت متأكد أنك تريد حذف حساب «${child.name}» وتقدّمه من التطبيقات على هذا الجهاز؟`;dialog.querySelector('[role=alert]').textContent='';
  dialog.querySelector('[data-delete-confirm]').onclick=()=>{let ok=false;try{ok=remove(localStorage,owner,child.id);}catch{}if(ok){dialog.close();location.reload();}else dialog.querySelector('[role=alert]').textContent='تعذّر حذف الحساب. تأكد من الحساب النشط وحاول مجددًا.';};
  dialog.showModal();dialog.querySelector('[data-delete-back]').focus();
 }
 function button(child){
  if(!isAdmin(current())||!child||isAdmin(child))return null;
  const b=document.createElement('button');b.type='button';b.className='suite-delete';b.dataset.deleteChild=child.id;
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M5 6l1 14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-14M10 10v7m4-7v7"/></svg>';
  b.setAttribute('aria-label','حذف حساب '+child.name);b.title='حذف حساب '+child.name;b.onclick=()=>request(child);return b;
 }
 function row(child,select,actions=[]){
  const item=document.createElement('div');item.className='suite-account-row'+(isAdmin(child)?' suite-account-admin':'');item.setAttribute('role','listitem');item.dataset.accountId=child.id;
  select.classList.add('suite-account-select');select.setAttribute('aria-label',child.name);select.setAttribute('aria-pressed',String(child.id===current()?.id));
  const label=document.createElement('span');label.className='suite-account-name';label.textContent=child.name;select.replaceChildren(...(isAdmin(child)?[label]:[avatar(child),label]));
  item.append(select);
  const tools=document.createElement('div');tools.className='suite-account-tools';tools.append(...actions);
  const remove=button(child);if(remove)tools.append(remove);
  if(isAdmin(child)&&current()?.id===child.id&&['VocProgress','SenbProgress','TaffahaProgress'].some(name=>root[name])){
   const reset=document.createElement('button');reset.type='button';reset.className='suite-account-reset';reset.dataset.resetHamada='';reset.setAttribute('aria-label','مسح بيانات حمادة');reset.title='مسح بيانات حمادة';reset.innerHTML=glyph('<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>');reset.onclick=requestReset;tools.append(reset);
  }
  if(tools.children.length)item.append(tools);return item;
 }
 function render(host,children,makeRow){
  openSort?.close();
  host.classList.remove('suite-account-list');host.classList.add('suite-account-browser');host.replaceChildren();
  host.removeAttribute('role');
  // Sorting metadata comes from the shared store, including legacy creation dates.
  let saved=[];try{saved=JSON.parse(localStorage.getItem(KEY))?.children||[];}catch{}
  const entries=children.map(child=>({...saved.find(entry=>entry.id===child.id),...child}));
  let storage;try{storage=localStorage;}catch{}
  // Allocate from the complete account list before filtering or sorting it.
  avatars=assignAvatars(storage,[...saved.filter(child=>!entries.some(entry=>entry.id===child.id)),...entries]);
  const admins=document.createElement('div');admins.className='suite-account-admins';admins.setAttribute('role','list');admins.setAttribute('aria-label','Hamada');
  entries.filter(child=>isAdmin(child)&&child.id===current()?.id).forEach(child=>admins.append(makeRow(child)));
  if(admins.children.length)host.append(admins);
  const filters=document.createElement('div');filters.className='suite-account-filters';
  const search=document.createElement('input');search.type='search';search.className='suite-account-search';search.placeholder='ابحث بالاسم';search.setAttribute('aria-label','البحث عن حساب بالاسم');search.autocomplete='off';
  let sortValue='oldest';const sort=sortControl(value=>{sortValue=value;update();});
  filters.append(search,sort);host.append(filters);
  const grid=document.createElement('div');grid.className='suite-account-grid';grid.setAttribute('role','list');grid.setAttribute('aria-label','حسابات الأطفال');host.append(grid);
  const empty=document.createElement('p');empty.className='suite-account-empty';empty.setAttribute('role','status');host.append(empty);
  const update=()=>{const list=orderedChildren(entries,search.value,sortValue);grid.replaceChildren(...list.map(makeRow));empty.textContent=list.length?'':search.value?'لا يوجد حساب بهذا الاسم.':'لا توجد حسابات أطفال بعد.';empty.hidden=!!list.length;};
  search.oninput=update;search.onkeydown=event=>{if(event.key==='Enter')event.preventDefault();};update();
 }
 root.addEventListener('storage',event=>{if(event.key!==KEY)return;try{const before=JSON.parse(event.oldValue||'null'),after=JSON.parse(event.newValue||'null');if(JSON.stringify(before?.deletedChildren)!==JSON.stringify(after?.deletedChildren)||['VocProgress','SenbProgress','TaffahaProgress'].some(name=>root[name])&&current()?.id&&(before?.accountResets?.[current().id]||null)!==(after?.accountResets?.[current().id]||null))location.reload();}catch{}});
 root.SuiteAccounts={button,request,row,render,requestReset};
})(globalThis);
