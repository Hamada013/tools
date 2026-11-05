// Binary audio is stored as bytes + MIME type for reliable Safari navigation.
// Metadata lists never retain every saved recording in phone memory.
let database;
export function openDatabase(){
 if(!database)database=new Promise((resolve,reject)=>{
  if(!globalThis.indexedDB)return reject(Error('التخزين المحلي غير متاح.'));
  const r=indexedDB.open('ihki-hilou',1);
  r.onupgradeneeded=()=>{const db=r.result;db.createObjectStore('profiles',{keyPath:'id'});for(const name of ['sessions','recordings']){const s=db.createObjectStore(name,{keyPath:'id'});s.createIndex('profileID','profileID');}};
  r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();database=null;};resolve(r.result);};
  r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('أغلق النوافذ الأخرى للتطبيق ثم حاول مجددًا.'));
 }).catch(e=>{database=null;throw e;});return database;
}
async function run(stores,mode,work){const db=await openDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction(stores,mode);let value;tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('لم يكتمل الحفظ.'));try{work(tx,v=>{value=v;});}catch(e){tx.abort();reject(e);}});}
const read=(store,id)=>run([store],'readonly',(tx,set)=>{const r=id===undefined?tx.objectStore(store).getAll():tx.objectStore(store).get(id);r.onsuccess=()=>set(r.result);});
const write=(store,value)=>run([store],'readwrite',(tx,set)=>{tx.objectStore(store).put(value);set(value);});
export const allProfiles=()=>read('profiles');
export const saveProfile=profile=>write('profiles',profile);
export const saveSession=session=>run(['sessions'],'readwrite',(tx,set)=>{const store=tx.objectStore('sessions'),r=store.get(session.id);r.onsuccess=()=>{if(r.result?.status==='complete'){set(r.result);return;}const attempts=[...new Map([...(r.result?.attempts||[]),...session.attempts].map(a=>[a.id,a])).values()];const merged={...session,attempts};store.put(merged);set(merged);};});
export async function saveAttempt(session,record){
 const encoded=record?{...record,bytes:await record.blob.arrayBuffer(),mime:record.blob.type}:null;if(encoded)delete encoded.blob;
 return run(['sessions','recordings'],'readwrite',(tx,set)=>{const store=tx.objectStore('sessions'),r=store.get(session.id);r.onsuccess=()=>{if(r.result?.status==='complete'){tx.abort();return;}const attempts=[...new Map([...(r.result?.attempts||[]),...session.attempts].map(a=>[a.id,a])).values()];const merged={...session,attempts};if(encoded)tx.objectStore('recordings').put(encoded);store.put(merged);set(merged);};});
}
export const sessionsFor=profileID=>run(['sessions'],'readonly',(tx,set)=>{const r=tx.objectStore('sessions').index('profileID').getAll(profileID);r.onsuccess=()=>set(r.result.sort((a,b)=>b.started-a.started));});
export async function putRecording(value){const{blob,...metadata}=value;return write('recordings',{...metadata,bytes:await blob.arrayBuffer(),mime:blob.type});}
export async function getRecording(id){const value=await read('recordings',id);if(!value)return null;const{bytes,...metadata}=value;return{...metadata,blob:new Blob([bytes],{type:value.mime||'audio/wav'})};}
export const recordingMetadata=profileID=>run(['recordings'],'readonly',(tx,set)=>{const rows=[],r=tx.objectStore('recordings').index('profileID').openCursor(profileID);r.onsuccess=()=>{const c=r.result;if(c){const{bytes,...metadata}=c.value;rows.push(metadata);c.continue();}};set(rows);});
export const deleteRecording=id=>run(['recordings'],'readwrite',tx=>tx.objectStore('recordings').delete(id));
export const deleteProfile=profileID=>run(['profiles','sessions','recordings'],'readwrite',tx=>{tx.objectStore('profiles').delete(profileID);for(const name of ['sessions','recordings']){const r=tx.objectStore(name).index('profileID').openCursor(profileID);r.onsuccess=()=>{const c=r.result;if(c){c.delete();c.continue();}};}});
export function reward(profile,session){
 const earned=session.attempts.length?Math.min(3,1+Math.floor(session.attempts.length/3)):0;
 const stars=(Number(profile.stars)||0)+earned,games=[...new Set([...(profile.games||[]),session.moduleID])];
 const badges=[...new Set([...(profile.badges||[]),...(stars>=1?['first']:[]),...(stars>=5?['five']:[]),...(games.length===5?['explorer']:[])])];
 return{profile:{...profile,stars,games,badges},session:{...session,status:'complete',completed:Date.now(),earned}};
}
// Session status and stars change in one transaction. Retrying completion,
// reloading, or double-tapping cannot award the same session's stars twice.
export const completeSession=session=>run(['profiles','sessions'],'readwrite',(tx,set)=>{
 const sessions=tx.objectStore('sessions'),profiles=tx.objectStore('profiles'),r=sessions.get(session.id);
 r.onsuccess=()=>{const stored=r.result;if(stored?.status==='complete'){set({session:stored,duplicate:true});return;}
  const p=profiles.get(session.profileID);p.onsuccess=()=>{if(!p.result){tx.abort();return;}const attempts=[...new Map([...(stored?.attempts||[]),...session.attempts].map(a=>[a.id,a])).values()];const result=reward(p.result,{...session,attempts});profiles.put(result.profile);sessions.put(result.session);set(result);};
 };
});
export function readSettings(){try{const value=JSON.parse(localStorage.getItem('ihki-settings'));return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return{};}}
export function saveSettings(value){try{localStorage.setItem('ihki-settings',JSON.stringify(value));return true;}catch{return false;}}
export function cacheProfile(profile,lastRating){try{localStorage.setItem('ihki-profile-'+profile.id,JSON.stringify({stars:profile.stars,badges:profile.badges,lastRating}));}catch{}}
export function removeCachedProfile(id){try{localStorage.removeItem('ihki-profile-'+id);}catch{}}
