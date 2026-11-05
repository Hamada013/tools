/* Explicit, per-child session boundaries shared by the three offline apps. */
((root)=>{
 'use strict';
 const WINDOW_MS=6*60*60*1000;
 const domains={receptive:'فهم الكلمات',expressive:'التعبير والتسمية',count:'تمييز عدد المقاطع',picture:'ربط المقاطع بالصورة'};
 const clone=value=>JSON.parse(JSON.stringify(value));
 // Short, goal-specific home activities. Each new note draws a different sample.
 const lastVariation={};
 function homeActivity(app,items,variant){
  const sentenceItems=app==='senb'?items.filter(item=>item.entity==='sentence'):[];
  const focus=(sentenceItems.length?sentenceItems:items).slice(0,3),target=focus.map(item=>`«${item.label}»`).join('، ');
  if(!target)return 'نختار نشاطًا بعد ما نلعب ونسجّل كلماتنا اليوم.';
  if(!Number.isInteger(variant)){variant=Math.floor(Math.random()*10);if(variant===lastVariation[app])variant=(variant+1)%10;lastVariation[app]=variant;}
  variant=((variant%10)+10)%10;
  const samples={
   voc:[
    'حطّوا صورتين قدّامي. اسألوني عن كلمة اليوم، واستنّوا حتى أشير إلها.',
    'خبّوا صورة من كلمات اليوم بين صورتين. سمّوها وخلّوني ألاقيها.',
    'حطّوا غرضين بسلة. اطلبوا كلمة اليوم وخلّوني أعطيكم الغرض أو أشير إله.',
    'افتحوا كتاب صور. نبحث عن كلمة اليوم ونسمّيها سوا.',
    'نرتّب صورتين. قولوا كلمة اليوم وخلّوني أحطّ صورتها بعلبة.',
    'نلعب بدمية. سمّوا غرضًا من كلمات اليوم وخلّوني أعطيه للدمية.',
    'ورّوني صورة اليوم. سمّوها مرة، واستنّوا محاولتي بصوت أو إشارة.',
    'نرسم كلمة من كلمات اليوم. سمّوا الرسم وخلّوني أختاره بين رسمتين.',
    'نمثّل كلمة من كلمات اليوم بحركة أو لعبة، وبعدها نسمّيها.',
    'وزّعوا صورتين على الطاولة. اسألوني «وين…؟»، وبعد اختياري بدّلوا مكانهما.'
   ],
   senb:[
    'اختاروا جملة اليوم ومثّلوها بدمية. قولوها مرة وخلّوني أمثّلها.',
    'ارسموا مشهدًا لجملة اليوم. قولوا الجملة وخلّوني أشير للشخص والغرض.',
    'رتّبوا صور كلمات جملة اليوم. سمّوها بالترتيب، واستنّوا محاولتي.',
    'مثّلوا جملة اليوم بلعبة. ابدؤوا الجملة واتركوا لي آخر كلمة.',
    'ورّوني صورة جملة اليوم. اسألوني «مين؟» ثم «شو عم يعمل؟»، سؤال واحد كل مرة.',
    'نختار جملة اليوم. قولوا أول كلمتين، وخلّوني أكمّل بصوت أو إشارة.',
    'احكوا جملة اليوم ببطء. مع كل كلمة نحطّ قطعة لعبة، ثم نعيدها كاملة.',
    'مثّلوا جملة اليوم، ثم بدّلوا دوركم معي. أعمل الحركة وإنتو تصفوها.',
    'نرسم جملة اليوم ونحكي عنها. إذا قلت كلمة، زيدوا كلمة مناسبة من نفس الجملة.',
    'اعرضوا صورتين مختلفتين. قولوا جملة اليوم وخلّوني أختار المشهد المناسب.'
   ],
   taffaha:[
    'قولوا كلمة اليوم كاملة ثم بمقاطعها. نعمل طقّة خفيفة مع كل مقطع.',
    'نقول مقاطع كلمة اليوم. مع كل مقطع نحطّ مكعّبًا، ثم نعدّ المكعّبات.',
    'ورّوني صورة كلمة اليوم. قولوا مقاطعها وخلّوني أشير لعددها بأصابعي.',
    'نحطّ قطعة لعبة مع كل مقطع من كلمة اليوم، ثم نقول الكلمة كاملة.',
    'نقول كلمة اليوم ببطء. نلمس الطاولة مرة مع كل مقطع ونعدّ اللمسات.',
    'قولوا مقاطع كلمة اليوم. خلّوني أقلّد الإيقاع بالتصفيق أو بالإشارة.',
    'ارسموا دائرة لكل مقطع من كلمة اليوم. نلمس الدوائر ونحن نسمع المقاطع.',
    'نقول كلمة اليوم كاملة، ثم نخطو خطوة صغيرة مع كل مقطع.',
    'رتّبوا قطعًا بعدد مقاطع كلمة اليوم. أختار العدد ثم أسمع الكلمة كاملة.',
    'قولوا مقاطع كلمة اليوم، واستنّوا حتى أختار صورتها بين صورتين.'
   ]
  };
  const example=focus.find(item=>item.syllables?.length);
  return [`نستخدم من شغل اليوم: ${target}.`,(samples[app==='senb'&&!sentenceItems.length?'voc':app]||samples.voc)[variant],app==='taffaha'&&example?`«${example.label}»: ${example.syllables.join(' ـ ')} (${example.count===1?'مقطع واحد':example.count===2?'مقطعان':`${example.count} مقاطع`}).`:null,'نلعب ٣–٥ دقائق؛ الإشارة مقبولة ومنوقف إذا تعبت.'].filter(Boolean).join('\n');
 }
 function message(app,name,session){
  const items=Object.values(session.items),help=items.filter(item=>item.help),focus=(help.length?help:items).slice(0,3);
  const lines=['مرحبًا ماما وبابا 🌷',`أنا ${name}، تدرّبت اليوم على:`];
  for(const [entity,title]of [['word','كلمات'],['sentence','جمل']]){
   const list=items.filter(item=>item.entity===entity);if(list.length)lines.push(`${title}: ${list.slice(0,6).map(item=>item.label).join('، ')+(list.length>6?' وغيرها':'')}.`);
  }
  const scores={};
  for(const item of items)for(const [domain,value]of Object.entries(item.scores)){
   const key=`${domain}:${item.entity}`;
   const label=app==='senb'?`${domain==='receptive'?'فهم ':'التعبير بـ'}${item.entity==='sentence'?'الجمل':'الكلمات'}`:domains[domain];
   scores[key]||={label,correct:0,total:0};scores[key].correct+=value.correct;scores[key].total+=value.total;
  }
  if(Object.keys(scores).length){
   for(const value of Object.values(scores))lines.push(`${value.label}: ${value.correct}/${value.total} محاولات صحيحة.`);
  }else lines.push('تدريب فقط؛ بلا تقييم.');
  if(help.length)lines.push(`نراجع سوا: ${help.slice(0,3).map(item=>item.label).join('، ')}.`);
  lines.push('','خلّونا نلعب شوي بالبيت 💛',homeActivity(app,focus));
  return lines.join('\n');
 }
 function create({app,storage,owner,onError=()=>{}}){
  const memory=new Map(),resetEpochs=new Map();let ok=true;
  const initialOwner=owner();if(initialOwner?.id)try{resetEpochs.set(initialOwner.id,JSON.parse(storage.getItem('voc-children-v1'))?.accountResets?.[initialOwner.id]||null);}catch{}
  const activeOwner=()=>{const child=owner();if(!child?.id)return null;try{const data=JSON.parse(storage.getItem('voc-children-v1'));if(data?.deletedChildren?.[child.id])return null;const epoch=data?.accountResets?.[child.id]||null;if(!resetEpochs.has(child.id))resetEpochs.set(child.id,epoch);if(resetEpochs.get(child.id)!==epoch)return null;}catch{}return child;};
  const storageKey=id=>`speech-homework-v1:${app}:${encodeURIComponent(id)}${resetEpochs.get(id)?':reset-'+resetEpochs.get(id):''}`;
  function read(id){
   const key=storageKey(id);let state;
   if(!ok&&memory.has(key))state=clone(memory.get(key));
   else try{const value=JSON.parse(storage.getItem(key));state=value?.version===1?value:null;}catch{}
   state||=clone(memory.get(key)||{version:1,current:null,last:null,cursors:{}});
   const origin=state.windowStarted||state.current?.started||state.last?.started;
   const started=Date.parse(origin);
   if(!Number.isFinite(started)||Date.now()-started>=WINDOW_MS){
    // Keep ingestion cursors: old rows from a resumed game must not refill the cleared message.
    state={version:1,windowStarted:new Date(Date.now()).toISOString(),current:null,last:null,lessonDraft:null,cursors:state.cursors||{}};
    write(id,state);
   }else if(!state.windowStarted){state.windowStarted=origin;write(id,state);}
   return state;
  }
  function write(id,value){const key=storageKey(id);memory.set(key,clone(value));try{storage.setItem(key,JSON.stringify(value));ok=true;}catch{ok=false;onError();}}
  function add(state,entry){
   const label=String(entry.label||'').trim();if(!label)return;
   state.current||={id:root.crypto?.randomUUID?.()||String(Date.now()),started:new Date().toISOString(),activities:{},items:{}};
   const session=state.current,key=JSON.stringify([entry.entity==='sentence'?'sentence':'word',label.normalize('NFKC')]);
   session.activities[entry.activity||'التدريب']=true;
   const item=session.items[key]||={label,entity:entry.entity==='sentence'?'sentence':'word',scores:{},help:false};
   if(Array.isArray(entry.syllables)){item.syllables=entry.syllables.map(String);item.count=Number(entry.count)||entry.syllables.length;}
   item.help||=entry.needsHelp===true;
   if(entry.kind==='assessment'&&domains[entry.domain]&&Number(entry.total)>0){
    const total=Math.max(0,Number(entry.total)),correct=Math.max(0,Math.min(total,Number(entry.correct)||0));
    item.scores[entry.domain]||={correct:0,total:0};item.scores[entry.domain].correct+=correct;item.scores[entry.domain].total+=total;item.help||=correct<total;
   }
  }
  function record(entry){const child=activeOwner();if(!child?.id||!entry?.label)return;const state=read(child.id);add(state,entry);write(child.id,state);}
  // A paused/reloaded game saves a growing result array. Only consume new rows,
  // even after an explicit session end and later resumption of the same game.
  function capture({id,activity,kind,domain,records}){
   const child=activeOwner();if(!child?.id||!id||!records?.length)return;const state=read(child.id),cursor=state.cursors[id]||0;
   if(records.length<=cursor)return;
   for(const entry of records.slice(cursor))add(state,{activity,kind,domain,...entry});
   state.cursors[id]=records.length;write(child.id,state);
  }
  function finish(){const child=activeOwner();if(!child?.id)return null;const state=read(child.id);
   if(state.current){state.last={...state.current,ended:new Date().toISOString(),name:child.name};state.last.text=message(app,child.name,state.last);state.current=null;write(child.id,state);}
   return clone(state.last);
  }
  return {record,capture,finish,expiresAt:()=>{const child=activeOwner();return child?.id?Date.parse(read(child.id).windowStarted)+WINDOW_MS:null;},current:()=>{const child=activeOwner();return child?.id?clone(read(child.id).current):null;},
   lessonDraft:id=>{const child=activeOwner();if(!child)return null;const draft=read(child.id).lessonDraft;return draft?.id===id?draft.text:null;},
   editLesson:(id,text)=>{const child=activeOwner();if(!child)return;const state=read(child.id);state.lessonDraft={id,text:String(text)};write(child.id,state);},
   edit:text=>{const child=activeOwner();if(!child?.id)return;const state=read(child.id);if(state.last){state.last.text=String(text);write(child.id,state);}},storageOK:()=>ok};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={create,message,homeActivity};
 if(!root.document)return;
 const app=document.currentScript.dataset.app,progress=()=>({voc:root.VocProgress,senb:root.SenbProgress,taffaha:root.TaffahaProgress})[app];
 let storage;try{storage=root.localStorage;}catch{storage={getItem(){},setItem(){throw Error('unavailable');}};}
 const model=create({app,storage,owner:()=>progress()?.active()});let dialog,input,status,trigger,expiryTimer;
 function open(lessonOnly=false){
  if(!progress()?.active()||dialog?.open)return;
  root.dispatchEvent(new Event('suite-navigation-open'));root.AppNavigation?.closeSettings(false,true);
  const current=model.current();
  const note=lessonOnly?(current?{...current,name:progress().active().name,text:message(app,progress().active().name,current)}:model.finish()):model.finish();
  const draftId=note?.id||progress().active()?.homeLesson?.planId;
  let lessonText=note?.text;
  if(lessonOnly&&app==='voc'&&!current&&!lessonText&&Date.now()-Date.parse(progress().active()?.homeLesson?.date)<WINDOW_MS){const lesson=progress().active().homeLesson;const items=typeof CATEGORIES!=='undefined'?CATEGORIES.flatMap(category=>category.items.map(item=>({key:progress().key(item),name:item.name}))):root.VOC_GAME_DATA?.categories.flatMap(category=>category.items)||[];lessonText=root.VocHomeLesson?.text(progress().active().name,lesson,items)||lessonText;}

  if(!dialog){
   dialog=document.createElement('dialog');dialog.id='session-homework-dialog';dialog.className='suite-dialog session-homework-dialog';dialog.dir='rtl';dialog.setAttribute('aria-labelledby','session-homework-title');
   dialog.innerHTML='<header><div><h2 id="session-homework-title" tabindex="-1">رسالتنا لماما وبابا</h2><p data-homework-meta></p></div><button type="button" class="suite-icon" data-homework-close aria-label="إغلاق" title="إغلاق"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header><textarea dir="rtl" aria-label="ملخص الجلسة ونشاط للبيت، يمكنك تعديل الرسالة"></textarea><p data-homework-empty hidden>لسه ما سجّلنا نشاط بهالتطبيق. نلعب ونتدرّب، وبنهاية الجلسة منرجع لهون لرسالتنا 💛</p><footer><button type="button" class="session-homework-copy" data-homework-copy>نسخ الرسالة</button><button type="button" class="session-homework-copy" data-homework-share hidden>مشاركة</button></footer><p class="session-homework-status" role="status" aria-live="polite"></p>';
   document.body.append(dialog);input=dialog.querySelector('textarea');status=dialog.querySelector('[role=status]');
   dialog.querySelector('[data-homework-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.returnTo?.focus());
   dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
   input.addEventListener('input',()=>{if(dialog.lessonOnly)model.editLesson(dialog.draftId,input.value);else model.edit(input.value);});
   dialog.querySelector('[data-homework-copy]').onclick=async()=>{try{await navigator.clipboard.writeText(input.value);status.textContent='تم نسخ رسالتنا 💛';}catch{input.focus();input.select();status.textContent='حدّدنا الرسالة؛ فيكم تنسخوها من هون.';}};
  }
  dialog.querySelector('[data-homework-share]').onclick=async()=>{try{await navigator.share({title:'درسنا بالبيت',text:input.value});}catch(error){if(error.name!=='AbortError')status.textContent='تعذّرت المشاركة. يمكنكم نسخ الرسالة.';}};
  dialog.returnTo=document.activeElement;dialog.draftId=draftId;if(lessonOnly)lessonText=model.lessonDraft(draftId)||lessonText;
  dialog.lessonOnly=lessonOnly;const available=!!lessonText;input.value=lessonText||'';input.hidden=!available;dialog.querySelector('[data-homework-copy]').hidden=!available;dialog.querySelector('[data-homework-empty]').hidden=available;
  dialog.querySelector('[data-homework-share]').hidden=!available||!navigator.share;
  dialog.querySelector('h2').textContent=lessonOnly?'درسنا بالبيت':'رسالتنا لماما وبابا';
  dialog.querySelector('[data-homework-meta]').textContent=note?`${note.name} · ${new Date(note.ended||note.started).toLocaleDateString('ar')}`:progress().active().name;
  status.textContent=model.storageOK()?'':'تعذّر حفظ الرسالة على الجهاز. انسخوا الرسالة قبل إغلاق الصفحة.';
  dialog.showModal();dialog.querySelector('h2').focus();input.scrollTop=0;
  clearTimeout(expiryTimer);
  expiryTimer=setTimeout(()=>{model.current();input.value='';dialog.close();},Math.max(0,model.expiresAt()-Date.now()));
 }
 function init(){
  const host=document.querySelector(app==='taffaha'?'.topbar nav':app==='senb'?'#homeHeaderTools':'.app-home-tools'),home=document.querySelector(app==='taffaha'?'#home-screen':app==='senb'?'#homeView':'#home-view');
  if(!host||!home)return;
  const lessonHost=document.querySelector(app==='taffaha'?'.topbar nav':app==='senb'?'#workplaceHeaderToolbar':'#workplace-view > header > div');
  if(lessonHost){
   const lesson=document.createElement('button');lesson.type='button';lesson.id=app==='voc'?'parents-lesson':'parents-lesson-'+app;lesson.className='suite-icon';lesson.dataset.familyLesson='';lesson.setAttribute('aria-label','درس البيت للأهل');lesson.title='درس البيت للأهل';lesson.setAttribute('aria-haspopup','dialog');
   lesson.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="12" cy="14" r="2.5"/><path d="M2 21v-6a4 4 0 0 1 6-3.5M22 21v-6a4 4 0 0 0-6-3.5M8 22v-2a4 4 0 0 1 8 0v2"/></svg>';
   lesson.onclick=()=>open(true);lessonHost.append(lesson);
   if(app==='taffaha'){const syncLesson=()=>{lesson.hidden=!['practice','test'].includes(document.body.dataset.screen);};new MutationObserver(syncLesson).observe(document.body,{attributes:true,attributeFilter:['data-screen']});syncLesson();}
  }
  trigger=document.createElement('button');trigger.type='button';trigger.className='suite-icon';trigger.dataset.sessionEnd='';trigger.title='إنهاء الجلسة ورسالة الأهل';trigger.setAttribute('aria-label',trigger.title);trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','session-homework-dialog');
  trigger.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V3m0 1h16l-3 5 3 5H4m5-5 2 2 4-4"/></svg>';trigger.onclick=()=>open();host.append(trigger);
  const sync=()=>{trigger.hidden=home.hidden||home.classList.contains('hidden');trigger.disabled=!progress()?.active();};
  new MutationObserver(sync).observe(home,{attributes:true,attributeFilter:['hidden','class']});
  for(const event of [`${app}-ready`,`${app}-profile-change`,`${app}-profile-memorychange`,`${app}-progress-change`])root.addEventListener(event,sync);
  root.addEventListener(`${app}-profile-beforechange`,()=>dialog?.close());sync();
 }
 root.SessionHomework={...model,open:()=>open(),openLesson:()=>open(true),homeActivity};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(globalThis);
