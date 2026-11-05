import {installDialogFallback} from './dialogs.js';
import {GAMES,RATINGS,faceSVG,gameArtwork,FluencyGame} from './fluencyGames.js';
import {loadPrompts,loadImage,assetURL,PHONEMES,phoneme} from './assetsManager.js';
import {AudioEngine,VoiceRecorder,micError} from './audio.js';
import * as store from './storage.js';
import {initOffline,refreshOffline} from './offline.js';
installDialogFallback();
const $=id=>document.getElementById(id),settings=store.readSettings(),audio=new AudioEngine(),recorder=new VoiceRecorder(audio),game=new FluencyGame($('game-stage'),$('waveform'));
const AVATARS=['🐢','🦊','🐼','🐰','🐳','🦁'],BADGES={first:'🌱 أول خطوة',five:'⭐ خمس نجوم مشاركة',explorer:'🧭 مستكشف الألعاب الخمس'};
const profiles=new Map(),memorySessions=new Map(),memoryAudio=new Map(),recordMetadata=new Map();
let prompts=[],activeID=null,session=null,moduleID=null,promptIndex=0,running=null,finishing=false,playback=null,lastTake=null,ratingAction=null,ratingValue=null,queuedGame=null,avatar=AVATARS[0],deleteAction=null,saveBusy=false;
const id=()=>crypto.randomUUID?.()||Date.now().toString(36)+'-'+Array.from(crypto.getRandomValues(new Uint32Array(2)),x=>x.toString(36)).join('');
const digits=value=>String(value).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const profile=()=>profiles.get(activeID),definition=()=>GAMES.find(g=>g.id===moduleID),available=()=>prompts.filter(p=>p.games.includes(moduleID)),prompt=()=>available()[promptIndex%available().length];
const say=text=>{$('status').textContent=text;};
function temporary(){ $('storage-warning').hidden=false; }
function savePrefs(){if(!store.saveSettings(settings))temporary();}
function showDialog(name){$(name).showModal();}
for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>b.closest('dialog').close();
for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
// Native pointer/touch feedback without duplicate synthetic click listeners.
for(const type of ['touchstart','touchend','touchcancel'])document.addEventListener(type,e=>{const b=e.target.closest?.('button');if(b)b.classList.toggle('touching',type==='touchstart');},{passive:true});
function view(name){for(const key of ['home','game','history'])$(key+'-view').hidden=key!==name;history.replaceState(null,'','#'+name);window.scrollTo({top:0,behavior:'instant'});}
function stopPlayback(){playback?.abort();playback=null;audio.stop();}
async function play(action){if(running||finishing){say('أنهِ المحاولة أولًا.');return;}audio.unlock();stopPlayback();say('نستمع…');const controller=new AbortController();playback=controller;try{await action(controller.signal);if(!controller.signal.aborted)say('انتهى الصوت. يمكنك الاستماع مجددًا.');}catch(e){if(e.name!=='AbortError')say(e.message||'تعذر تشغيل الصوت.');}finally{if(playback===controller)playback=null;}}
function locks(){const busy=!!running||finishing;for(const key of ['profile-button','history-button','back-home','previous-prompt','next-prompt','play-model','play-take','finish-session','pause-session','start-attempt','demo-attempt'])$(key).disabled=busy;$('stop-attempt').hidden=!busy;$('start-attempt').hidden=busy;$('demo-attempt').hidden=busy;$('record-kind').disabled=busy;$('play-take').disabled=busy||!lastTake?.recordingID;$('download-take').disabled=busy||!lastTake?.recordingID;if(moduleID)$('play-model').disabled=busy||(!prompt()?.audio.length&&!recordMetadata.has(modelID()));}
function modelID(){return JSON.stringify(['model',activeID,moduleID,prompt()?.id]);}
async function blobFor(recordID){if(memoryAudio.has(recordID))return memoryAudio.get(recordID).blob;const record=await store.getRecording(recordID);if(!record?.blob)throw Error('التسجيل غير متاح على هذا الجهاز.');return record.blob;}
async function downloadAudio(recordID,label){try{const blob=await blobFor(recordID),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${label}.${blob.type.includes('wav')?'wav':blob.type.includes('mp4')?'m4a':blob.type.includes('ogg')?'ogg':'webm'}`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}catch(e){say(e.message||'تعذر تنزيل التسجيل.');}}
function downloadJSON(data,name){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
async function saveDraft(){if(!session)return;const snapshot=session;memorySessions.set(snapshot.id,snapshot);try{const saved=await store.saveSession(snapshot);if(session?.id===snapshot.id&&activeID===snapshot.profileID)session=saved;if(memorySessions.get(snapshot.id)===snapshot)memorySessions.delete(snapshot.id);}catch{temporary();}}
async function sessions(){let rows=[];try{rows=await store.sessionsFor(activeID);}catch{temporary();}return[...new Map([...rows,...[...memorySessions.values()].filter(s=>s.profileID===activeID)].map(s=>[s.id,s])).values()].sort((a,b)=>b.started-a.started);}
function ratingButtons(container,selected,change,compact=false){container.replaceChildren();for(let n=1;n<=5;n++){const b=document.createElement('button');b.type='button';b.innerHTML=faceSVG(n)+`<span>${digits(n)}</span>`;b.setAttribute('aria-label',`${n}: ${RATINGS[n-1]}`);b.title=RATINGS[n-1];b.setAttribute('aria-pressed',String(n===selected));b.onclick=()=>{for(const el of container.children)el.setAttribute('aria-pressed',String(el===b));change(n);};container.append(b);}}
function askRating(post,action){ratingAction=action;ratingValue=null;$('rating-title').textContent=post?'كيف تشعر بعد اللعب؟':'كيف تشعر بالكلام الآن؟';$('rating-description').textContent='اختر الوجه الأقرب لشعورك؛ لا توجد إجابة صحيحة أو خاطئة.';$('rating-continue').textContent=post?'حفظ الجلسة':'نبدأ اللعب';$('rating-continue').disabled=true;ratingButtons($('session-rating'),null,n=>{ratingValue=n;$('rating-continue').disabled=false;});showDialog('rating-dialog');}
async function acceptRating(skip=false){if(saveBusy||!ratingAction)return;saveBusy=true;const action=ratingAction;ratingAction=null;$('rating-dialog').close();try{await action(skip?null:ratingValue);}catch(e){say(e.message||'لم تكتمل العملية. حاول مجددًا.');}finally{saveBusy=false;}}
$('rating-continue').onclick=()=>acceptRating();$('rating-skip').onclick=()=>acceptRating(true);$('rating-dialog').addEventListener('close',()=>{ratingAction=null;});
function renderProfiles(){
 $('profile-list').replaceChildren();for(const p of profiles.values()){
  const row=document.createElement('div'),choose=document.createElement('button'),avatarEl=document.createElement('span'),label=document.createElement('span'),edit=document.createElement('button'),remove=document.createElement('button');row.className='profile-row';choose.className='choose-profile';avatarEl.className='avatar';avatarEl.textContent=p.avatar;label.textContent=p.name+' · '+digits(p.age)+' سنوات';choose.append(avatarEl,label);choose.setAttribute('aria-pressed',String(p.id===activeID));choose.onclick=()=>selectProfile(p.id);edit.className='edit';edit.textContent='تعديل';edit.onclick=()=>{$('profile-id').value=p.id;$('child-name').value=p.name;$('child-age').value=p.age;$('profile-form-title').textContent='تعديل الملف';avatar=p.avatar;renderAvatars();};remove.className='delete';remove.textContent='حذف';remove.onclick=()=>confirmDelete('حذف ملف '+p.name+'؟','سيُحذف الملف وجلساته وتسجيلاته من هذا الجهاز.',async()=>{
   if(!p.temporary)await store.deleteProfile(p.id);profiles.delete(p.id);for(const [key,s]of memorySessions)if(s.profileID===p.id)memorySessions.delete(key);for(const [key,a]of memoryAudio)if(a.profileID===p.id)memoryAudio.delete(key);store.removeCachedProfile(p.id);if(activeID===p.id){session=null;activeID=profiles.keys().next().value||null;settings.activeID=activeID;savePrefs();view('home');await renderHome();}renderProfiles();say('حُذف الملف وتسجيلاته.');
  });row.append(choose,edit,remove);$('profile-list').append(row);
 }
}
function resetForm(){$('profile-form').reset();$('profile-id').value='';$('profile-form-title').textContent='صديق جديد';avatar=AVATARS[0];renderAvatars();}
function renderAvatars(){$('avatar-picker').replaceChildren();for(const value of AVATARS){const b=document.createElement('button');b.type='button';b.textContent=value;b.setAttribute('aria-label','الصورة '+value);b.setAttribute('aria-pressed',String(value===avatar));b.onclick=()=>{avatar=value;renderAvatars();};$('avatar-picker').append(b);}}
$('reset-profile-form').onclick=resetForm;
$('profile-form').onsubmit=async e=>{
 e.preventDefault();if(saveBusy)return;const name=$('child-name').value.trim(),age=Number($('child-age').value);if(!name||name.length>32||!Number.isInteger(age)||age<6||age>18){say('اكتب لقبًا وعمرًا من ٦ إلى ١٨ سنة.');return;}
 saveBusy=true;const profileID=$('profile-id').value||id(),old=profiles.get(profileID),value={...old,id:profileID,name,age,avatar,stars:old?.stars||0,badges:old?.badges||[],games:old?.games||[],created:old?.created||Date.now()};
 try{await store.saveProfile(value);}catch{value.temporary=true;temporary();}profiles.set(profileID,value);saveBusy=false;resetForm();await selectProfile(profileID);
};
async function selectProfile(profileID){if(running||finishing)return;stopPlayback();await saveDraft();activeID=profileID;session=null;lastTake=null;settings.activeID=profileID;savePrefs();$('profiles-dialog').close();view('home');await renderHome();if(queuedGame){const next=queuedGame;queuedGame=null;startSession(next);}}
$('profile-button').onclick=()=>{renderProfiles();showDialog('profiles-dialog');};$('create-first').onclick=()=>{renderProfiles();showDialog('profiles-dialog');};
async function renderHome(){
 const p=profile();$('greeting').textContent=p?'أهلًا '+p.name+'، نلعب معًا؟':'أهلًا بك في احكي حلو!';$('profile-button').textContent=p?p.avatar+' '+p.name+' ⌄':'اختر طفلًا ⌄';$('create-first').hidden=!!p;$('home-stars').textContent='☆ '+digits(p?.stars||0)+' نجوم مشاركة';$('home-badges').textContent=p?.badges?.length?p.badges.map(b=>BADGES[b]).join(' · '):'رحلتك تبدأ بمحاولة';$('resume-session').hidden=true;
 if(p){const token=activeID,rows=await sessions();if(token!==activeID)return;const draft=rows.find(s=>s.status==='draft');if(draft){$('resume-session').hidden=false;$('resume-session').onclick=()=>resume(draft);}}
}
for(const def of GAMES){const b=document.createElement('button');b.className='game-tile '+def.color;b.innerHTML=`<div class="tile-art">${gameArtwork(def.id)}</div><h3>${def.title}</h3><p>${def.short}</p><div class="tile-footer"><span>${def.technique}</span><span class="circle-arrow">←</span></div>`;b.onclick=()=>startSession(def.id);$('games-grid').append(b);}
function startSession(next){if(!profile()){queuedGame=next;renderProfiles();showDialog('profiles-dialog');return;}askRating(false,async value=>{moduleID=next;promptIndex=0;lastTake=null;session={id:id(),profileID:activeID,moduleID:next,started:Date.now(),status:'draft',preRating:value,postRating:null,attempts:[]};await saveDraft();await loadModels();renderGame();view('game');say('خذ وقتك، وابدأ حين تكون مستعدًا.');});}
async function loadModels(){recordMetadata.clear();try{for(const row of await store.recordingMetadata(activeID))recordMetadata.set(row.id,row);}catch{temporary();}for(const row of memoryAudio.values())if(row.profileID===activeID)recordMetadata.set(row.id,row);}
async function resume(value){stopPlayback();activeID=value.profileID;session=value;moduleID=value.moduleID;promptIndex=Math.max(0,available().findIndex(p=>p.id===value.attempts[value.attempts.length-1]?.promptID));lastTake=value.attempts[value.attempts.length-1]||null;await loadModels();renderGame();view('game');say('استكمل على راحتك؛ الميكروفون لا يعمل حتى تضغط ابدأ.');}
function renderGame(){
 const def=definition(),p=prompt();if(!def||!p)return;game.render(def.id);$('play-model').hidden=moduleID==='balloon'&&!recordMetadata.has(modelID());$('model-source').hidden=moduleID==='balloon'&&!recordMetadata.has(modelID());document.querySelector('.prompt-nav').hidden=available().length<2;document.querySelector('.sound-panel').hidden=moduleID==='balloon';$('game-stage').dataset.game=def.id;$('game-name').textContent=def.title;$('game-technique').textContent=def.technique;$('game-instructions').textContent=def.instructions;$('prompt-label').textContent=p.label;loadImage($('prompt-image'),p.images,p.label);$('attempt-count').textContent=digits(session?.attempts.length||0)+' محاولات';$('game-cue').textContent='اختر ابدأ حين تكون مستعدًا.';$('play-mode').textContent='جاهز للمحاولة';$('attempt-timer').textContent='';$('level-fill').style.width='0%';$('pitch').textContent='— Hz';$('model-source').textContent=recordMetadata.has(modelID())?'نموذج المرافق المحفوظ':moduleID==='balloon'?'اتبع حركة المنطاد على راحتك':'صوت المكتبة: مثال للكلمة';$('start-attempt').textContent=settings.recordKind==='model'?'● سجّل نموذج المرافق':'● ابدأ وسجّل';renderTake();locks();
}
function renderTake(){
 $('take-panel').hidden=!lastTake||lastTake.kind==='model';if(!lastTake)return;$('play-take').parentElement.hidden=!lastTake.recordingID;$('play-take').disabled=!lastTake.recordingID;$('download-take').disabled=!lastTake.recordingID;
 ratingButtons($('attempt-rating'),lastTake.rating,n=>{const attempt=session.attempts.find(a=>a.id===lastTake.id);if(attempt){attempt.rating=n;lastTake=attempt;saveDraft();}});
}
function changePrompt(step){if(running||finishing)return;stopPlayback();promptIndex=(promptIndex+step+available().length)%available().length;lastTake=null;renderGame();}
$('previous-prompt').onclick=()=>changePrompt(-1);$('next-prompt').onclick=()=>changePrompt(1);
$('play-model').onclick=()=>play(async signal=>{
 if(recordMetadata.has(modelID())){const blob=await blobFor(modelID());if(!signal.aborted)await audio.play(blob,{signal});return;}
 for(const asset of prompt().audio){try{await audio.play(assetURL(asset),{signal});return;}catch(e){if(e.name==='AbortError')throw e;}}
 say('صوت المكتبة غير متاح؛ نستخدم صوت الجهاز إن توفر.');await audio.speak(prompt().label,{signal});
});
$('play-take').onclick=()=>lastTake?.recordingID&&play(async signal=>{const blob=await blobFor(lastTake.recordingID);if(!signal.aborted)await audio.play(blob,{signal});});
$('download-take').onclick=()=>lastTake?.recordingID&&downloadAudio(lastTake.recordingID,lastTake.label);
async function startRun(manual=false){
 if(running||finishing||!session)return;if(session.status==='complete'){say('هذه الجلسة محفوظة. اختر لعبة لبدء جلسة جديدة.');return;}if(!manual&&recorder.pending){say('أغلق طلب الميكروفون السابق أو اختر اللعب بلا ميكروفون.');return;}
 stopPlayback();audio.unlock();const p=prompt(),token={id:id(),manual,kind:manual?'child':settings.recordKind||'child',profileID:activeID,moduleID,promptID:p.id,label:p.label,started:Date.now()};running=token;locks();$('stop-attempt').textContent=manual?'■ إنهاء المحاولة':'إلغاء طلب الميكروفون';$('game-cue').textContent=manual?'عرض بصري توضيحي؛ لا يُسجّل صوت.':'اسمح بالميكروفون عندما يسألك المتصفح.';
 try{
  if(!manual)await recorder.start();if(running!==token)return;token.recordStarted=Date.now();
  if(document.hidden){await stopRun(false);return;}
  const hold=settings.breathHold===2?2:0,duration=moduleID==='balloon'?2*(10+hold):[8,12,20].includes(settings.duration)?settings.duration:12;
  $('stop-attempt').textContent='■ إنهاء المحاولة';$('play-mode').textContent=manual?'عرض بلا ميكروفون':token.kind==='model'?'نسجّل نموذج المرافق':'نسجّل صوتك';$('take-panel').hidden=true;
  game.start({stream:manual?null:recorder.stream,context:audio.context,manual,duration,hold,sensitivity:settings.sensitivity,onFrame:data=>{
   $('level-fill').style.width=Math.round(data.level*100)+'%';$('pitch').textContent=data.pitch?Math.round(data.pitch)+' Hz':'— Hz';$('attempt-timer').textContent=digits(Math.ceil(data.remaining))+' ثانية';
   $('game-cue').textContent=moduleID==='balloon'?({inhale:'شهيق لطيف… إن كان مريحًا',hold:'وقفة اختيارية… يمكنك الزفير الآن',exhale:'زفير هادئ… على مهلك'}[data.phase]):data.calibrating?'لحظة هدوء للميكروفون… ثم قل الكلمة':manual?'حركة توضيحية — جرب الكلام براحتك':'صوتك مرحّب به… خذ وقتك.';
  },onEnd:()=>stopRun(true)});
 }catch(e){if(running===token){running=null;locks();$('play-mode').textContent='جاهز للمحاولة';if(e.name!=='AbortError')say(micError(e));}}
}
async function stopRun(save=true){
 if(!running||finishing)return;const token=running,stats=game.stop();finishing=true;locks();
 if(recorder.pending&&!token.manual){recorder.cancelPending();running=null;finishing=false;locks();say('أُلغي طلب التسجيل. يمكنك اللعب بلا ميكروفون.');return;}
 let blob=null;
 try{
  if(!token.manual&&recorder.active)blob=await recorder.stop();
  if(!save){say('أُلغيت المحاولة. يمكنك البدء مجددًا.');return;}
  if(!token.manual&&(!blob||blob.size<100))throw Error('لم يصل تسجيل واضح. حاول مجددًا أو العب بلا ميكروفون.');
  const duration=Date.now()-(token.recordStarted||token.started);if(!token.manual&&duration<300)throw Error('المحاولة قصيرة جدًا. جرّب التسجيل مجددًا.');const recordID=token.kind==='model'?JSON.stringify(['model',token.profileID,token.moduleID,token.promptID]):'take-'+token.id;
  const record=blob?{id:recordID,profileID:token.profileID,sessionID:session.id,moduleID:token.moduleID,promptID:token.promptID,label:token.label,kind:token.kind,created:Date.now(),duration,blob}:null;
  if(record)memoryAudio.set(recordID,record);
  if(token.kind==='model'){
   try{await store.putRecording(record);memoryAudio.delete(recordID);}catch{temporary();}const{blob,...meta}=record;recordMetadata.set(recordID,meta);say('نموذج المرافق جاهز للاستماع.');lastTake=null;
  }else{
   const attempt={id:token.id,promptID:token.promptID,label:token.label,created:Date.now(),duration,recordingID:record?.id||null,kind:'child',rating:null,mode:token.manual?'manual':'microphone',signal:token.manual?null:stats};session.attempts.push(attempt);lastTake=attempt;memorySessions.set(session.id,session);
   try{session=await store.saveAttempt(session,record);memorySessions.delete(session.id);if(record)memoryAudio.delete(recordID);}catch{temporary();}
   say(record?'حُفظت محاولتك. استمع إن أحببت، ثم جرّب مرة أخرى.':'محاولة جميلة! أُضيفت مشاركة بلا تسجيل صوتي.');
  }
 }catch(e){say(micError(e));}finally{running=null;finishing=false;renderGame();locks();}
}
$('start-attempt').onclick=()=>startRun();$('demo-attempt').onclick=()=>startRun(true);$('stop-attempt').onclick=()=>stopRun(true);
recorder.onInterrupted=()=>stopRun(true);recorder.onFailure=e=>{game.stop();running=null;finishing=false;locks();say(micError(e));};
function background(){stopPlayback();if(running)stopRun(true);}document.addEventListener('visibilitychange',()=>{if(document.hidden)background();});window.addEventListener('pagehide',background);
async function leaveGame(){if(running||finishing)return;stopPlayback();await saveDraft();session=null;view('home');await renderHome();say('يمكنك استكمال الجلسة من الصفحة الرئيسية.');}
document.querySelector('.brand').onclick=e=>{e.preventDefault();if(running||finishing){say('أنهِ المحاولة أولًا.');return;}leaveGame();};
$('back-home').onclick=leaveGame;$('pause-session').onclick=leaveGame;
$('finish-session').onclick=()=>{if(running||finishing||!session)return;stopPlayback();askRating(true,async value=>{
 session.postRating=value;let result,persistent=true;try{result=await store.completeSession(session);}catch{persistent=false;temporary();const old=memorySessions.get(session.id);result=old?.status==='complete'?{session:old,duplicate:true}:store.reward(profile(),session);}
 session=result.session;if(persistent)memorySessions.delete(session.id);else memorySessions.set(session.id,session);if(result.profile){profiles.set(activeID,result.profile);store.cacheProfile(result.profile,value);}else{try{for(const p of await store.allProfiles())profiles.set(p.id,p);}catch{}}
 const earned=session.earned||0;session=null;view('home');await renderHome();say(earned?'⭐ أُضيفت '+digits(earned)+' نجوم مشاركة. شكرًا لمحاولتك!':'حُفظت الجلسة. يمكنك اللعب متى أحببت.');if(earned)celebrate();
 });};
function celebrate(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(let n=0;n<8;n++){const star=document.createElement('span');star.textContent='✦';star.className='star-burst';star.style.left=(35+n*4)+'vw';star.style.top='45vh';star.style.setProperty('--dx',(n-4)*18+'px');document.body.append(star);setTimeout(()=>star.remove(),900);}}
async function renderHistory(){
 if(!profile()){renderProfiles();showDialog('profiles-dialog');return;}stopPlayback();view('history');$('reward-shelf').replaceChildren();for(const text of ['☆ '+digits(profile().stars||0)+' نجوم مشاركة',...(profile().badges||[]).map(b=>BADGES[b])]){const span=document.createElement('span');span.textContent=text;$('reward-shelf').append(span);}
 const token=activeID,rows=await sessions();if(token!==activeID)return;$('session-history').replaceChildren();
 if(!rows.length){$('session-history').textContent='رحلتك تبدأ بمحاولة. اختر لعبة من الصفحة الرئيسية.';return;}
 for(const s of rows){const card=document.createElement('article'),head=document.createElement('header'),title=document.createElement('h2'),date=document.createElement('span'),description=document.createElement('p');card.className='session-card';title.textContent=GAMES.find(g=>g.id===s.moduleID)?.title||'جلسة';date.className='muted';date.textContent=new Date(s.started).toLocaleString('ar-SY',{dateStyle:'medium',timeStyle:'short'});head.append(title,date);description.textContent=`${s.status==='complete'?'جلسة محفوظة':'جلسة قابلة للاستكمال'} · ${digits(s.attempts.length)} محاولات · شعوري قبل: ${s.preRating===null?'لم أختر':digits(s.preRating)} / ٥ · بعد: ${s.postRating===null?'لم أختر':digits(s.postRating)} / ٥`;card.append(head,description);
  if(s.status==='draft'){const resumeButton=document.createElement('button');resumeButton.textContent='استكمال';resumeButton.className='soft';resumeButton.onclick=()=>resume(s);card.append(resumeButton);}
  for(const a of s.attempts){const row=document.createElement('div'),label=document.createElement('span');row.className='attempt-row';label.textContent=a.label+' · '+(a.mode==='manual'?'بلا ميكروفون':'محاولة مسجلة')+(a.rating?' · شعوري '+digits(a.rating)+'/٥':'');row.append(label);if(a.recordingID){const replay=document.createElement('button'),download=document.createElement('button');replay.textContent='▷ اسمع صوتي';replay.onclick=()=>play(async signal=>{const blob=await blobFor(a.recordingID);if(!signal.aborted)await audio.play(blob,{signal});});download.textContent='↓ تنزيل';download.onclick=()=>downloadAudio(a.recordingID,a.label);row.append(replay,download);}card.append(row);}
  $('session-history').append(card);
 }
}
$('history-button').onclick=renderHistory;$('history-home').onclick=()=>{stopPlayback();view('home');renderHome();};$('export-history').onclick=async()=>{if(profile())downloadJSON({app:'احكي حلو',exported:Date.now(),profile:profile(),sessions:await sessions()},'احكي-حلو-ملخص.json');};
function confirmDelete(title,description,action){deleteAction=action;$('confirm-title').textContent=title;$('confirm-description').textContent=description;showDialog('confirm-dialog');}
$('confirm-delete').onclick=async()=>{if(saveBusy||!deleteAction)return;saveBusy=true;try{await deleteAction();deleteAction=null;$('confirm-dialog').close();}catch{say('تعذر حذف البيانات. حاول مجددًا.');}finally{saveBusy=false;}};
for(const [field,key,fallback]of [['duration','duration',12],['record-kind','recordKind','child'],['sensitivity','sensitivity','normal'],['breath-hold','breathHold',0]]){
 $(field).value=String(settings[key]??fallback);$(field).onchange=()=>{settings[key]=['duration','breathHold'].includes(key)?Number($(field).value):$(field).value;savePrefs();if(session&&!running)renderGame();};
}
$('settings-button').onclick=()=>showDialog('settings-dialog');$('offline-button').onclick=()=>{showDialog('offline-dialog');refreshOffline();};
for(const letter of Object.keys(PHONEMES)){const b=document.createElement('button');b.textContent=letter;b.setAttribute('aria-label','صوت الحرف '+letter);b.onclick=()=>play(signal=>audio.play(assetURL(phoneme(letter)),{signal}));$('phoneme-buttons').append(b);}
async function init(){
 renderAvatars();try{prompts=await loadPrompts();for(const p of await store.allProfiles())profiles.set(p.id,p);}catch(e){if(!prompts.length){say(e.message||'تعذر تحميل الكلمات.');return;}temporary();}
 activeID=profiles.has(settings.activeID)?settings.activeID:profiles.keys().next().value||null;view('home');await renderHome();say('أهلًا بك. نلعب على راحتنا!');initOffline();
}
init();
