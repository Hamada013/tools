/* Child accounts window shared by جملة, كلمة and مقطع (same layout as VB-MAPP):
   one add row, one search/sort row, one tidy list with 25 drawn animal heads.
   Only the storage KEY differs between the three copies of this file. */
((root)=>{
 const KEY=(root.document?.currentScript?.dataset.app||'arabicsounds')+'-children-v1';
 // The built-in Hamada owner account was retired on 2026-11-19; every account is an ordinary child.
 const isRetiredOwner=child=>child?.role==='admin'||child?.id==='hamada-admin';
 const AVATAR_KEY='speech-account-avatars-v2';
 // 25 simple drawn heads (viewBox 0 0 64 64): [background, drawing]. Original drawings; no emoji.
 const INK = '#26323a', S = `stroke="${INK}" stroke-width="2" stroke-linejoin="round"`;
 const eyes = (y = 34, dx = 8, r = 3) => `<circle cx="${32 - dx}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${32 + dx}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${33 - dx}" cy="${y - 1}" r="1" fill="#fff"/><circle cx="${33 + dx}" cy="${y - 1}" r="1" fill="#fff"/>`;
 const cheeks = (y = 41, c = '#f28b8b') => `<circle cx="18" cy="${y}" r="3.5" fill="${c}" opacity=".55"/><circle cx="46" cy="${y}" r="3.5" fill="${c}" opacity=".55"/>`;
 const smile = (y = 44, w = 4) => `<path d="M${32 - w} ${y}q${w} ${w} ${w * 2} 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
 const whiskers = y => `<path d="M10 ${y - 2}l9 1M10 ${y + 3}l9-1M54 ${y - 2}l-9 1M54 ${y + 3}l-9-1" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>`;
 const head = (fill, r = 20, cy = 36) => `<circle cx="32" cy="${cy}" r="${r}" fill="${fill}" ${S}/>`;

 const AVATARS = {
   cat: ['#fff1e0', `<path d="M14 30 13 9l15 11z" fill="#f6a54c" ${S}/><path d="M50 30l1-21-15 11z" fill="#f6a54c" ${S}/><path d="M17 15l1 9 6-4z" fill="#f9c9a0"/><path d="M47 15l-1 9-6-4z" fill="#f9c9a0"/>${head('#f6a54c')}${eyes(34)}<path d="M30 40h4l-2 2.5z" fill="#e5736f"/>${smile(44, 3)}${whiskers(42)}`],
   dog: ['#f6efe6', `${head('#d6ae84')}<path d="M13 22c-6 4-5 18 2 19 3-6 4-12 3-17z" fill="#8d6748" ${S}/><path d="M51 22c6 4 5 18-2 19-3-6-4-12-3-17z" fill="#8d6748" ${S}/>${eyes(32)}<ellipse cx="32" cy="43" rx="10" ry="7" fill="#f3dfc6"/><ellipse cx="32" cy="40" rx="4" ry="3" fill="${INK}"/>${smile(46, 3)}`],
   bear: ['#f3ece6', `<circle cx="16" cy="20" r="7" fill="#a1785c" ${S}/><circle cx="48" cy="20" r="7" fill="#a1785c" ${S}/><circle cx="16" cy="20" r="3" fill="#d7b899"/><circle cx="48" cy="20" r="3" fill="#d7b899"/>${head('#a1785c')}${eyes(33)}<ellipse cx="32" cy="43" rx="9" ry="7" fill="#d7b899"/><ellipse cx="32" cy="40" rx="3.5" ry="2.5" fill="${INK}"/>${smile(45, 3)}`],
   bunny: ['#fdeef2', `<ellipse cx="24" cy="14" rx="5.5" ry="13" fill="#f4f4f4" ${S}/><ellipse cx="40" cy="14" rx="5.5" ry="13" fill="#f4f4f4" ${S}/><ellipse cx="24" cy="15" rx="2.5" ry="9" fill="#f7b6c2"/><ellipse cx="40" cy="15" rx="2.5" ry="9" fill="#f7b6c2"/>${head('#f4f4f4', 19, 38)}${eyes(36)}${cheeks(43)}<path d="M30 42h4l-2 2z" fill="#e5736f"/><rect x="30" y="45" width="4" height="4" rx="1" fill="#fff" ${S}/>`],
   fox: ['#fff0e5', `<path d="M12 30 14 9l14 12z" fill="#f08a3c" ${S}/><path d="M52 30 50 9 36 21z" fill="#f08a3c" ${S}/><path d="M12 30c0-12 9-18 20-18s20 6 20 18c0 12-10 22-20 24-10-2-20-12-20-24z" fill="#f08a3c" ${S}/><path d="M14 36c6 0 12 4 18 16 6-12 12-16 18-16-2 9-9 16-18 18-9-2-16-9-18-18z" fill="#fff"/>${eyes(33)}<ellipse cx="32" cy="46" rx="3" ry="2.2" fill="${INK}"/>`],
   lion: ['#fff6e2', `<circle cx="32" cy="34" r="27" fill="#d9882e" ${S}/><path d="M7 30l-3-6 7 1M57 30l3-6-7 1M14 12l-2-6 7 3M50 12l2-6-7 3" stroke="${INK}" stroke-width="2" fill="none"/>${head('#f7c873', 18)}<circle cx="18" cy="21" r="4" fill="#f7c873" ${S}/><circle cx="46" cy="21" r="4" fill="#f7c873" ${S}/>${eyes(33, 7)}<path d="M29 39h6l-3 3z" fill="#8d5a32"/>${smile(44, 3)}`],
   panda: ['#eef3f1', `<circle cx="15" cy="19" r="7" fill="${INK}"/><circle cx="49" cy="19" r="7" fill="${INK}"/>${head('#fff')}<ellipse cx="23" cy="34" rx="6" ry="7.5" fill="${INK}" transform="rotate(25 23 34)"/><ellipse cx="41" cy="34" rx="6" ry="7.5" fill="${INK}" transform="rotate(-25 41 34)"/><circle cx="24" cy="34" r="2" fill="#fff"/><circle cx="40" cy="34" r="2" fill="#fff"/><ellipse cx="32" cy="42" rx="3.5" ry="2.5" fill="${INK}"/>${smile(46, 3)}`],
   koala: ['#eef1f4', `<circle cx="13" cy="26" r="10" fill="#a9b4bd" ${S}/><circle cx="51" cy="26" r="10" fill="#a9b4bd" ${S}/><circle cx="13" cy="26" r="5" fill="#f2c7cf"/><circle cx="51" cy="26" r="5" fill="#f2c7cf"/>${head('#a9b4bd', 19)}${eyes(32, 9)}<ellipse cx="32" cy="40" rx="5" ry="7" fill="#4b5560"/>${cheeks(44, '#f2c7cf')}`],
   owl: ['#f3eee8', `<path d="M14 16l4 10M50 16l-4 10" stroke="${INK}" stroke-width="2"/><path d="M12 14l8 4-4 6zM52 14l-8 4 4 6z" fill="#9c7a5b" ${S}/><ellipse cx="32" cy="36" rx="20" ry="21" fill="#9c7a5b" ${S}/><circle cx="24" cy="32" r="8" fill="#fff" ${S}/><circle cx="40" cy="32" r="8" fill="#fff" ${S}/><circle cx="24" cy="32" r="3.5" fill="${INK}"/><circle cx="40" cy="32" r="3.5" fill="${INK}"/><path d="M29 39h6l-3 5z" fill="#f2a33a" ${S}/><path d="M22 48q4 3 8 0M34 48q4 3 8 0" stroke="#c9ab8d" stroke-width="2" fill="none"/>`],
   frog: ['#ebf6e8', `<circle cx="21" cy="21" r="8" fill="#7cc36b" ${S}/><circle cx="43" cy="21" r="8" fill="#7cc36b" ${S}/><ellipse cx="32" cy="38" rx="22" ry="17" fill="#7cc36b" ${S}/><circle cx="21" cy="21" r="4.5" fill="#fff"/><circle cx="43" cy="21" r="4.5" fill="#fff"/><circle cx="21" cy="21" r="2.5" fill="${INK}"/><circle cx="43" cy="21" r="2.5" fill="${INK}"/><path d="M18 40q14 10 28 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>${cheeks(38)}`],
   turtle: ['#eaf6e4', `<path d="M14 30c0-14 9-22 18-22s18 8 18 22" fill="#7cb36a" ${S}/><path d="M24 14l8 5 8-5M21 24l11-5 11 5M32 19v-9" fill="none" stroke="#4f7f43" stroke-width="2" stroke-linejoin="round"/>${head('#a8d98f', 18, 38)}${eyes(36)}${cheeks(43)}${smile(46, 4)}`],
   cow: ['#f2f2ee', `<path d="M17 17c-4-1-6-6-4-9 2 3 6 4 8 4zM47 17c4-1 6-6 4-9-2 3-6 4-8 4z" fill="#f5e3b8" ${S}/><ellipse cx="11" cy="28" rx="7" ry="4" fill="#fff" ${S}/><ellipse cx="53" cy="28" rx="7" ry="4" fill="#fff" ${S}/>${head('#fff', 19)}<path d="M18 26c4-6 12-6 12 2-4 4-10 4-12-2z" fill="${INK}"/>${eyes(32)}<ellipse cx="32" cy="45" rx="11" ry="8" fill="#f7b6c2" ${S}/><circle cx="28" cy="45" r="1.8" fill="${INK}"/><circle cx="36" cy="45" r="1.8" fill="${INK}"/>`],
   monkey: ['#f5ede4', `<circle cx="12" cy="34" r="7" fill="#e8c39e" ${S}/><circle cx="52" cy="34" r="7" fill="#e8c39e" ${S}/>${head('#8d6748')}<path d="M32 27c-4-6-15-4-15 6 0 12 9 17 15 17s15-5 15-17c0-10-11-12-15-6z" fill="#e8c39e"/>${eyes(34, 6)}<path d="M30 40h4" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>${smile(44, 4)}`],
   elephant: ['#eaf0f6', `<ellipse cx="12" cy="33" rx="10" ry="13" fill="#9fb4c7" ${S}/><ellipse cx="52" cy="33" rx="10" ry="13" fill="#9fb4c7" ${S}/><ellipse cx="12" cy="33" rx="5" ry="8" fill="#f2c7cf"/><ellipse cx="52" cy="33" rx="5" ry="8" fill="#f2c7cf"/>${head('#9fb4c7', 18, 32)}${eyes(30, 7)}<path d="M28 38c0 8-1 14 3 17 2 1 4-1 3-3-2-3-1-8 2-14z" fill="#9fb4c7" ${S}/>${cheeks(38, '#f2c7cf')}`],
   penguin: ['#e9f1f6', `<ellipse cx="32" cy="34" rx="22" ry="22" fill="#33475b" ${S}/><path d="M32 22c-6-5-17-2-17 10 0 12 8 20 17 20s17-8 17-20c0-12-11-15-17-10z" fill="#fff"/>${eyes(33, 7)}<path d="M27 40h10l-5 6z" fill="#f2a33a" ${S}/>${cheeks(42, '#f7a8b8')}`],
   chick: ['#fffbe4', `<path d="M30 15c-2-6 4-8 4-3 2-5 7-2 3 3" fill="#ffd54f" ${S}/><circle cx="32" cy="36" r="21" fill="#ffd54f" ${S}/>${eyes(33, 8)}<path d="M27 39h10l-5 6z" fill="#f2862e" ${S}/>${cheeks(41)}`],
   mouse: ['#eef0f3', `<circle cx="16" cy="20" r="10" fill="#b0b8c1" ${S}/><circle cx="48" cy="20" r="10" fill="#b0b8c1" ${S}/><circle cx="16" cy="20" r="5.5" fill="#f2c7cf"/><circle cx="48" cy="20" r="5.5" fill="#f2c7cf"/><path d="M14 36c0-10 8-14 18-14s18 4 18 14c0 9-9 18-18 20-9-2-18-11-18-20z" fill="#b0b8c1" ${S}/>${eyes(35, 7)}<circle cx="32" cy="46" r="2.8" fill="#e5736f"/>${whiskers(46)}`],
   tiger: ['#fff2e3', `<circle cx="16" cy="19" r="6" fill="#f39c3d" ${S}/><circle cx="48" cy="19" r="6" fill="#f39c3d" ${S}/>${head('#f39c3d')}<path d="M32 17v7M25 18l2 6M39 18l-2 6M13 32h6M13 38h5M51 32h-6M51 38h-5" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="32" cy="45" rx="10" ry="7" fill="#fff"/>${eyes(33)}<path d="M29 41h6l-3 3z" fill="${INK}"/>${smile(47, 3)}`],
   giraffe: ['#fff7e3', `<path d="M24 16V7M40 16V7" stroke="${INK}" stroke-width="2"/><circle cx="24" cy="7" r="3" fill="#a9743f"/><circle cx="40" cy="7" r="3" fill="#a9743f"/><ellipse cx="13" cy="25" rx="7" ry="3.5" fill="#f5c45e" ${S} transform="rotate(-20 13 25)"/><ellipse cx="51" cy="25" rx="7" ry="3.5" fill="#f5c45e" ${S} transform="rotate(20 51 25)"/><path d="M18 34c0-12 6-18 14-18s14 6 14 18v8c0 7-6 13-14 13s-14-6-14-13z" fill="#f5c45e" ${S}/><circle cx="22" cy="24" r="3" fill="#c98a3f"/><circle cx="42" cy="22" r="2.5" fill="#c98a3f"/><circle cx="44" cy="34" r="2" fill="#c98a3f"/>${eyes(31, 7)}<ellipse cx="32" cy="46" rx="10" ry="7" fill="#f7dca0"/><circle cx="28" cy="45" r="1.5" fill="${INK}"/><circle cx="36" cy="45" r="1.5" fill="${INK}"/>`],
   sheep: ['#f2f4ec', `<path d="M14 30a7 7 0 0 1 4-12 7 7 0 0 1 10-6 7 7 0 0 1 10 0 7 7 0 0 1 10 6 7 7 0 0 1 4 12 7 7 0 0 1-4 12H18a7 7 0 0 1-4-12z" fill="#fff" ${S}/><ellipse cx="13" cy="34" rx="6" ry="3.5" fill="#5d4a3a" ${S}/><ellipse cx="51" cy="34" rx="6" ry="3.5" fill="#5d4a3a" ${S}/><ellipse cx="32" cy="40" rx="13" ry="15" fill="#5d4a3a" ${S}/><circle cx="26" cy="37" r="3" fill="#fff"/><circle cx="38" cy="37" r="3" fill="#fff"/><circle cx="26" cy="37" r="1.5" fill="${INK}"/><circle cx="38" cy="37" r="1.5" fill="${INK}"/><path d="M29 47q3 2 6 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`],
   hedgehog: ['#f4efe8', `<path d="M8 40 6 30l7 2-3-10 8 4-1-11 8 6 3-10 5 9 6-8 1 11 8-5-2 10 8-1-4 9 8 4H8z" fill="#8a6a4f" ${S}/><path d="M16 42c0-9 7-14 16-14s16 5 16 14-7 13-16 13-16-4-16-13z" fill="#f0d9b5" ${S}/>${eyes(40, 6, 2.5)}<circle cx="32" cy="47" r="2.5" fill="${INK}"/>${cheeks(46)}`],
   octopus: ['#f4ecfa', `<path d="M12 34c0-14 9-24 20-24s20 10 20 24v6c0 4-3 4-4 0-1 6-5 7-6 1-1 7-6 7-7 1-1 6-5 6-6 0-1 6-6 6-7-1-1 6-5 5-6-1-1 4-4 4-4 0z" fill="#b07cd8" ${S}/>${eyes(30, 8)}${cheeks(37, '#f7a8b8')}${smile(39, 4)}<circle cx="24" cy="18" r="2" fill="#d3b2ec"/><circle cx="40" cy="16" r="1.5" fill="#d3b2ec"/>`],
   dino: ['#edf6e4', `<path d="M24 14l4-8 4 7 4-7 4 8" fill="#f2a33a" ${S}/><path d="M12 36c0-14 9-22 20-22s20 8 20 22c0 10-8 18-20 18s-20-8-20-18z" fill="#8bc34a" ${S}/>${eyes(30, 9)}<circle cx="27" cy="42" r="1.5" fill="${INK}"/><circle cx="37" cy="42" r="1.5" fill="${INK}"/><path d="M22 47q10 5 20 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path d="M30 49l2 3 2-3" fill="#fff" ${S}/>`],
   monster: ['#e6f5fb', `<path d="M18 18 13 6l11 8M46 18l5-12-11 8" fill="#f8c14a" ${S}/><path d="M12 38c0-14 9-24 20-24s20 10 20 24v14l-5-4-5 4-5-4-5 4-5-4-5 4-5-4-5 4z" fill="#6ec6e8" ${S}/><circle cx="32" cy="32" r="9" fill="#fff" ${S}/><circle cx="33" cy="33" r="4" fill="${INK}"/><circle cx="34" cy="31.5" r="1.3" fill="#fff"/><path d="M24 44q8 6 16 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`],
   unicorn: ['#fbeefa', `<path d="M32 3l-5 15h10z" fill="#ffe082" ${S}/><path d="M29 10h6M28 14h8" stroke="#f2a33a" stroke-width="1.5"/><path d="M16 24l-2-12 10 7zM48 24l2-12-10 7z" fill="#fff" ${S}/><path d="M44 18c8 2 10 12 6 20-2-6-6-8-10-8" fill="#c792ea" ${S}/>${head('#fff')}<path d="M44 18c4 4 4 10 2 14" stroke="#7fc8f8" stroke-width="3" fill="none"/>${eyes(34)}${cheeks(41, '#f7a8b8')}${smile(45, 3)}`]
 };
 const AVATAR_DRAWINGS=AVATARS,AVATAR_ICONS=Object.keys(AVATAR_DRAWINGS);
 const AVATAR_NAMES={cat:'قطة',dog:'كلب',bear:'دب',bunny:'أرنب',fox:'ثعلب',lion:'أسد',panda:'باندا',koala:'كوالا',owl:'بومة',frog:'ضفدع',turtle:'سلحفاة',cow:'بقرة',monkey:'قرد',elephant:'فيل',penguin:'بطريق',chick:'صوص',mouse:'فأر',tiger:'نمر',giraffe:'زرافة',sheep:'خروف',hedgehog:'قنفذ',octopus:'أخطبوط',dino:'ديناصور',monster:'وحش لطيف',unicorn:'حصان وحيد القرن'};
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
 const validAvatar=value=>{
  if(typeof value!=='string'||!value)return false;
  const indexes=value.split(' ').map(icon=>AVATAR_ICONS.indexOf(icon));
  return indexes.every((index,i)=>index>=0&&(i===0||index>indexes[i-1]));
 };
 function readAvatars(storage){
  let saved=avatarMemory.get(storage||unavailableStorage)||{},raw=null;
  try{raw=storage?.getItem(AVATAR_KEY);const record=JSON.parse(raw);if(record?.schema===1&&record.icons&&typeof record.icons==='object')saved={...saved,...record.icons};}catch{}
  return {saved,raw};
 }
 function writeAvatars(storage,icons,raw){
  avatarMemory.set(storage||unavailableStorage,icons);
  const next=JSON.stringify({schema:1,icons});
  if(raw!==next)try{storage?.setItem(AVATAR_KEY,next);}catch{}
 }
 function assignAvatars(storage,children,random=Math.random){
  const {saved,raw}=readAvatars(storage);
  const kids=children.filter(child=>child?.id),assigned=new Map(),used=new Set();
  for(const child of kids){const icon=saved[child.id];if(validAvatar(icon)&&!used.has(icon)){assigned.set(child.id,icon);used.add(icon);}}
  const missing=kids.filter(child=>!assigned.has(child.id)),free=AVATAR_ICONS.filter(icon=>!used.has(icon));
  if(missing.length){
   if(free.length<missing.length)for(const icon of avatarChoices()){if(icon.includes(' ')&&!used.has(icon))free.push(icon);if(free.length>=missing.length)break;}
   for(let i=free.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[free[i],free[j]]=[free[j],free[i]];}
   for(const child of missing)assigned.set(child.id,free.pop());
  }
  writeAvatars(storage,{...saved,...Object.fromEntries(assigned)},raw);
  return assigned;
 }
 // A child may pick any head that no other child on this device is using.
 function setAvatar(storage,childId,icon,children=[]){
  if(!childId||!AVATAR_ICONS.includes(icon))return false;
  const {saved,raw}=readAvatars(storage),others=new Set(children.filter(child=>child?.id&&child.id!==childId).map(child=>saved[child.id]));
  if(others.has(icon))return false;
  writeAvatars(storage,{...saved,[childId]:icon},raw);return true;
 }
 // Any child account may be deleted. The window is already behind the parent check,
 // and the UI asks for a confirmation first.
 function remove(storage,targetId){
  let data;try{data=JSON.parse(storage.getItem(KEY));}catch{return false;}
  if(data?.schema!==1||!Array.isArray(data.children))return false;
  const target=data.children.find(child=>child.id===targetId);
  if(!target)return false;
  data.deletedChildren={...data.deletedChildren,[targetId]:new Date().toISOString()};
  data.children=data.children.filter(child=>child.id!==targetId);if(data.active===targetId)data.active=null;
  try{storage.setItem(KEY,JSON.stringify(data));}catch{return false;}
  for(const app of ['voc','senb','taffaha','arabicsounds','auditory-rehabilitation'])try{storage.removeItem?.(`speech-homework-v1:${app}:${encodeURIComponent(targetId)}`);}catch{}
  try{for(let i=storage.length-1;i>=0;i--){const key=storage.key(i);if(['arabicsounds','auditory-rehabilitation'].some(app=>key?.startsWith(`speech-sound-lesson:${app}:${targetId}:`)))storage.removeItem(key);}}catch{}
  try{const {saved,raw}=readAvatars(storage);if(saved[targetId]){const icons={...saved};delete icons[targetId];writeAvatars(storage,icons,raw);}}catch{}
  return true;
 }
 const normalizeName=name=>String(name||'').normalize('NFKC').replace(/[ً-ٰٟـ]/g,'').replace(/[أإآٱ]/g,'ا').trim().toLocaleLowerCase();
 function orderedChildren(children,query='',sort='oldest'){
  const collator=new Intl.Collator('ar',{sensitivity:'base',numeric:true}),needle=normalizeName(query);
  const list=children.map((child,index)=>({...child,position:index})).filter(child=>normalizeName(child.name).includes(needle));
  return list.sort((a,b)=>sort==='alphabet'?collator.compare(a.name,b.name)||a.position-b.position:(sort==='newest'?-1:1)*(((Date.parse(a.created)||0)-(Date.parse(b.created)||0))||a.position-b.position));
 }
 // Remove the old Hamada owner once, exactly like a deleted child (tombstone), so open tabs cannot restore it.
 function retireOwner(storage){
  const FLAG='speech-hamada-retired-v1:'+KEY;
  try{if(storage.getItem(FLAG))return false;}catch{return false;}
  let data=null;try{data=JSON.parse(storage.getItem(KEY));}catch{}
  let changed=false;
  if(data?.schema===1&&Array.isArray(data.children)){
   const old=data.children.filter(child=>isRetiredOwner(child)||normalizeName(child.name)==='hamada');
   if(old.length){
    const now=new Date().toISOString();data.deletedChildren={...data.deletedChildren};
    for(const child of old)data.deletedChildren[child.id]=now;
    data.children=data.children.filter(child=>!old.includes(child));if(old.some(child=>child.id===data.active))data.active=null;
    try{storage.setItem(KEY,JSON.stringify(data));changed=true;}catch{return false;}
   }
  }
  try{storage.setItem(FLAG,'1');}catch{}
  return changed;
 }
 if(typeof module!=='undefined')module.exports={remove,retireOwner,orderedChildren,assignAvatars,setAvatar,AVATAR_ICONS};
 if(!root.document)return;
 try{if(retireOwner(localStorage)){location.reload();return;}}catch{}
 const current=()=>root.VocProgress?.active()||root.SenbProgress?.active()||root.TaffahaProgress?.active()||root.SoundProgress?.active()||root.FollowProgress?.active()||root.AuralProgress?.active();
 let dialog,openSort,sortSerial=0,avatars=new Map(),entries=[],refresh=()=>{},openPickerFor=null;
 const glyph=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const storageOrNull=()=>{try{return localStorage;}catch{return null;}};
 // Drawn head for one icon name (or a space-separated combination for very large lists).
 function avatarElement(icon,size){
  const parts=String(icon||'cat').split(' ').filter(part=>AVATAR_DRAWINGS[part]),circle=document.createElement('span');
  circle.className='suite-account-avatar';circle.dir='ltr';circle.dataset.avatar=icon||'cat';circle.setAttribute('aria-hidden','true');
  circle.style.background=AVATAR_DRAWINGS[parts[0]]?.[0]||'#eef4f7';circle.style.setProperty('--avatar-columns',String(Math.ceil(Math.sqrt(parts.length||1))));
  if(size)circle.style.setProperty('--avatar-size',size+'px');
  for(const part of parts.length?parts:['cat']){const symbol=document.createElement('span');symbol.innerHTML=`<svg viewBox="0 0 64 64" aria-hidden="true">${AVATAR_DRAWINGS[part][1]}</svg>`;circle.append(symbol);}
  return circle;
 }
 // Header buttons can show the active child's head next to the name.
 function avatarFor(child,size){
  if(!child?.id)return null;
  let list=[];try{list=JSON.parse(localStorage.getItem(KEY))?.children||[];}catch{}
  if(!list.some(entry=>entry.id===child.id))list=[...list,child];
  return avatarElement(assignAvatars(storageOrNull(),list).get(child.id),size);
 }
 function confirmDelete(child){
  if(!child)return;
  if(!dialog){
   dialog=document.createElement('dialog');dialog.id='delete-account-dialog';dialog.className='suite-dialog suite-account-confirm';dialog.setAttribute('aria-labelledby','delete-account-title');
   dialog.innerHTML='<h2 id="delete-account-title">حذف الحساب؟</h2><p data-delete-message></p><div class="suite-text-actions"><button type="button" data-delete-back>إلغاء</button><button type="button" data-delete-confirm>نعم، حذف</button></div><p role="alert"></p>';
   document.body.append(dialog);dialog.querySelector('[data-delete-back]').onclick=()=>dialog.close();
  }
  const message=dialog.querySelector('[data-delete-message]');message.replaceChildren('حذف حساب «',Object.assign(document.createElement('bdi'),{textContent:child.name}),'» وتقدّمه وتقاريره من هذا الجهاز؟ لا يمكن التراجع.');
  dialog.querySelector('[role=alert]').textContent='';
  dialog.querySelector('[data-delete-confirm]').onclick=()=>{
   const wasActive=child.id===current()?.id;let ok=false;try{ok=remove(localStorage,child.id);}catch{}
   if(!ok){dialog.querySelector('[role=alert]').textContent='تعذّر حذف الحساب. أعد المحاولة.';return;}
   dialog.close();
   // Each app keeps its own copy of the list in memory; reloading keeps every page consistent.
   location.reload();
  };
  dialog.showModal();dialog.querySelector('[data-delete-back]').focus();
 }
 function deleteButton(child){
  if(!child)return null;
  const b=document.createElement('button');b.type='button';b.className='suite-delete';b.dataset.deleteChild=child.id;
  b.innerHTML=glyph('<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>');
  b.setAttribute('aria-label','حذف حساب '+child.name);b.title='حذف';b.onclick=()=>confirmDelete(child);return b;
 }
 const when=iso=>{try{return iso?new Intl.DateTimeFormat('ar-SY-u-nu-latn',{day:'numeric',month:'long',year:'numeric'}).format(new Date(iso)):'';}catch{return '';}};
 function avatarPicker(child,anchor){
  const panel=document.createElement('div');panel.className='suite-avatar-picker';panel.setAttribute('role','group');panel.setAttribute('aria-label','اختر صورة '+child.name);
  const mine=avatars.get(child.id),taken=new Set([...avatars].filter(([id])=>id!==child.id).map(([,icon])=>icon));
  for(const icon of AVATAR_ICONS){
   const choice=document.createElement('button');choice.type='button';choice.className='suite-avatar-choice';choice.dataset.avatarChoice=icon;
   choice.setAttribute('aria-label',AVATAR_NAMES[icon]||icon);choice.title=AVATAR_NAMES[icon]||icon;choice.setAttribute('aria-pressed',String(icon===mine));
   choice.disabled=taken.has(icon);choice.append(avatarElement(icon));
   choice.onclick=()=>{if(setAvatar(storageOrNull(),child.id,icon,entries)){avatars.set(child.id,icon);openPickerFor=null;refresh();document.querySelector(`[data-account-id="${CSS.escape(child.id)}"] .suite-account-avatar-button`)?.focus();root.dispatchEvent(new Event('suite-avatar-change'));}};
   panel.append(choice);
  }
  panel.onkeydown=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();openPickerFor=null;refresh();anchor?.focus?.();}};
  return panel;
 }
 // One list row: [head] [name + status] [host actions] [delete].
 function row(child,select,actions=[]){
  const isCurrent=child.id===current()?.id,item=document.createElement('div');
  item.className='suite-account-row'+(isCurrent?' is-current':'');item.setAttribute('role','listitem');item.dataset.accountId=child.id;
  const face=document.createElement('button');face.type='button';face.className='suite-account-avatar-button';
  face.setAttribute('aria-label','تغيير صورة '+child.name);face.title='تغيير الصورة';face.setAttribute('aria-expanded',String(openPickerFor===child.id));
  face.append(avatarElement(avatars.get(child.id)));face.insertAdjacentHTML('beforeend',`<span class="suite-avatar-edit" aria-hidden="true">${glyph('<path d="M4 20h4L19 9l-4-4L4 16v4ZM13 7l4 4"/>')}</span>`);
  face.onclick=()=>{openPickerFor=openPickerFor===child.id?null:child.id;refresh();const target=document.querySelector(`[data-account-id="${CSS.escape(child.id)}"]`);(target?.querySelector('.suite-avatar-choice[aria-pressed=true]')||target?.querySelector('.suite-account-avatar-button'))?.focus();};
  select.className=(select.className||'').split(' ').filter(name=>name&&!/^voc-/.test(name)).concat('suite-account-select').join(' ');
  select.setAttribute('aria-label',child.name);select.setAttribute('aria-pressed',String(isCurrent));
  const text=document.createElement('span');text.className='suite-account-text';
  const label=document.createElement('span');label.className='suite-account-name';label.textContent=child.name;
  const meta=document.createElement('span');meta.className='suite-account-meta';meta.textContent=isCurrent?'مفتوح الآن':(child.created?'أضيف '+when(child.created):'');
  text.append(label);if(meta.textContent)text.append(meta);select.replaceChildren(text);
  item.append(face,select);
  const tools=document.createElement('div');tools.className='suite-account-tools';tools.append(...actions);
  const del=deleteButton(child);if(del)tools.append(del);
  if(tools.children.length)item.append(tools);
  if(openPickerFor===child.id)item.append(avatarPicker(child,face));
  return item;
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
 // Fills a host container with: search + sort, "عدد الأطفال", and the list of rows.
 function render(host,children,makeRow){
  openSort?.close();openPickerFor=null;
  host.classList.remove('suite-account-list');host.classList.add('suite-account-browser');host.replaceChildren();host.removeAttribute('role');
  // Sorting metadata comes from the shared store, including legacy creation dates.
  let saved=[];try{saved=JSON.parse(localStorage.getItem(KEY))?.children||[];}catch{}
  entries=children.map(child=>({...saved.find(entry=>entry.id===child.id),...child}));
  // Allocate from the complete account list before filtering or sorting it.
  avatars=assignAvatars(storageOrNull(),[...saved.filter(child=>!entries.some(entry=>entry.id===child.id)),...entries]);
  const filters=document.createElement('div');filters.className='suite-account-filters';
  const search=document.createElement('input');search.type='search';search.className='suite-account-search';search.placeholder='ابحث بالاسم';search.setAttribute('aria-label','البحث عن حساب بالاسم');search.autocomplete='off';
  let sortValue='oldest';const sort=sortControl(value=>{sortValue=value;update();});
  filters.append(search,sort);
  const count=document.createElement('p');count.className='suite-account-count';
  const grid=document.createElement('div');grid.className='suite-account-grid';grid.setAttribute('role','list');grid.setAttribute('aria-label','حسابات الأطفال');
  const empty=document.createElement('p');empty.className='suite-account-empty';empty.setAttribute('role','status');
  const kids=entries;
  if(kids.length>3)host.append(filters);
  host.append(count,grid,empty);
  const update=()=>{
   const list=orderedChildren(entries,search.value,sortValue);grid.replaceChildren(...list.map(makeRow));grid.hidden=!list.length;
   count.textContent=kids.length?`عدد الأطفال: ${kids.length}`:'';
   empty.textContent=list.length?'':search.value?'لا يوجد اسم مطابق.':'لا يوجد أطفال بعد. اكتب اسم أول طفل في الأعلى.';empty.hidden=!!list.length;
  };
  refresh=update;search.oninput=update;search.onkeydown=event=>{if(event.key==='Enter')event.preventDefault();};update();
 }
 root.addEventListener('storage',event=>{if(event.key!==KEY)return;try{const before=JSON.parse(event.oldValue||'null'),after=JSON.parse(event.newValue||'null');if(JSON.stringify(before?.deletedChildren)!==JSON.stringify(after?.deletedChildren))location.reload();}catch{}});
 const closeIcon=glyph('<path d="m6 6 12 12M18 6 6 18"/>');
 root.SuiteAccounts={button:deleteButton,request:confirmDelete,row,render,avatarFor,closeIcon};
})(globalThis);
