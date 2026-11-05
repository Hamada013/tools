import {createDetectionGame} from './detection-game.js';
import {AudioEngine} from './audio.js';
import {showAnswerFeedback} from './feedback.js';
import {LETTER_MAP} from './data.js';
import {lingDate,lingSummary,lingTables,addLingPDFPages} from './ling-report.js';

export const LING_SOUNDS=['م','و','ا','ي','ش','س'];
export function soundSets(size,items=LING_SOUNDS){
 if(size===0)return [[]];
 return items.flatMap((sound,index)=>soundSets(size-1,items.slice(index+1)).map(rest=>[sound,...rest]));
}

export function createLing({main,icon,title,pic,control,escape,shuffle,openModal,status}){
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const audio=new AudioEngine();
 let meta={},current=null,last=null,controller=null,feedbackTimer=null;
 const modeName=mode=>mode==='identification'?'التعرف على الصوت':'اكتشاف الصوت';
 const cross='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12 M18 6 6 18"/></svg>';
 function stop(){controller?.abort();controller=null;audio.stop();clearTimeout(feedbackTimer);$('#ling-feedback')?.remove();}
 function reset(){current?.game?.destroy();stop();current=null;for(const id of ['ling-setup','ling-levels'])if($('#'+id).open)$('#'+id).close();}
 function openSetup(){
  $('#ling-name').value=window.SoundProgress?.active()?.name||'';$('#ling-name').readOnly=true;
  $('#ling-setup').showModal();$('#ling-name').focus();
 }
 for(const mode of ['detection','identification'])$('#ling-'+mode).onclick=()=>{
  audio.unlock();meta={name:window.SoundProgress?.active()?.name||'',owner:window.SoundProgress?.active()?.id,sessionId:crypto.randomUUID(),mode,date:new Date().toISOString()};
  $('#ling-setup').close();location.hash='/arabic/ling';
 };
 function heading(mode,extra=''){
  return `<div class="ling-heading">${title(modeName(mode),'arabic')}<div class="ling-tools">${extra}${control('ling-play','refresh','إعادة الصوت')}</div></div>`;
 }
 function errorNode(){return '<p id="status" class="status" role="alert" hidden></p>';}
 async function playCurrent(){
  const s=current;if(!s||s.phase==='feedback')return;
  stop();controller=new AbortController();const signal=controller.signal;
  s.phase='playing';if($('#ling-play'))$('#ling-play').disabled=true;s.game?.playing(true);
  $$('.ling-response,.ling-choices button').forEach(b=>b.disabled=true);
  $('#status').hidden=true;
  try{
   if(s.mode==='detection'&&!s.present)await new Promise((resolve,reject)=>{const timer=setTimeout(resolve,2500);signal.addEventListener('abort',()=>{clearTimeout(timer);reject(new DOMException('Cancelled','AbortError'));},{once:true});});
   else await audio.play(`sounds/${LETTER_MAP[s.target]}.m4a`,{signal});
   if(signal.aborted||current!==s)return;
   s.phase='answer';s.game?.enable();$$('.ling-response,.ling-choices button').forEach(b=>b.disabled=false);
  }catch(error){
   if(error.name==='AbortError'||current!==s)return;
   s.phase='error';s.game?.retry();$('#status').hidden=false;status('تعذر تشغيل الصوت. تحقق من تنزيل الأصوات ثم أعد المحاولة.',true);
  }finally{if(!signal.aborted&&current===s&&$('#ling-play'))$('#ling-play').disabled=false;}
 }
 function bindReplay(){$('#ling-play').onclick=()=>{audio.unlock();void playCurrent();};}
 function start(){
  if(!meta.mode||meta.owner!==window.SoundProgress?.active()?.id)meta={name:window.SoundProgress?.active()?.name||'',owner:window.SoundProgress?.active()?.id,sessionId:crypto.randomUUID(),mode:'detection',date:new Date().toISOString()};
  meta={...meta,name:window.SoundProgress?.active()?.name||'',owner:window.SoundProgress?.active()?.id,sessionId:crypto.randomUUID(),date:new Date().toISOString()};
  main.classList.add('ling-workspace');
  if(meta.mode==='detection'){
   current={mode:'detection',index:0,answers:Array(6).fill(null),catchTrials:[],queue:shuffle([...LING_SOUNDS.map(sound=>({sound,present:true})),...LING_SOUNDS.map(sound=>({sound,present:false}))]),phase:'starting'};drawDetection();
  }else{
   current={mode:'identification',size:2,options:LING_SOUNDS.slice(0,2),trial:0,answers:[],phase:'setup'};
   drawIdentification();openLevels();
  }
 }
 function drawDetection(){
  const s=current;stop();s.phase='starting';s.game?.destroy();const trial=s.queue[s.index];s.target=trial.sound;s.present=trial.present;
  main.innerHTML=`<div class="ling-heading">${title('اكتشاف أصوات لينغ','arabic')}</div><div class="ling-trial"><progress value="${s.index}" max="12" aria-label="المحاولات المكتملة"></progress></div><div class="ling-detection-stage activity-board" id="ling-detect-stage"></div>${errorNode()}`;
  s.game=createDetectionGame({host:$('#ling-detect-stage'),icon,round:s.index,onReplay:()=>{audio.unlock();void playCurrent();},onAnswer:value=>{
   if(s.phase!=='answer')return;s.phase='feedback';const correct=value===s.present;
   if(s.present)s.answers[LING_SOUNDS.indexOf(s.target)]=value?'yes':'no';else s.catchTrials.push({sound:s.target,response:value,correct});
   window.SoundProgress?.record({owner:meta.owner,sessionId:meta.sessionId,id:String(s.index),activity:'اكتشاف أصوات لينغ',skill:'ling-detection',kind:'assessment',label:s.present?s.target:'سكوت',target:s.present?s.target:'silence',present:s.present,response:value,correct});
   const mark=showAnswerFeedback(correct,'ling-feedback');feedbackTimer=setTimeout(()=>{mark.remove();if(current!==s)return;s.index++;if(s.index===s.queue.length){finish();return;}drawDetection();},800);
  }});void playCurrent();
 }
 function drawIdentification(){
  const s=current;
  main.innerHTML=heading('identification',`<button id="ling-select-level" class="icon-button" title="المستويات" aria-label="المستويات" aria-haspopup="dialog">${s.size-1}</button>`)+`<div class="ling-trial" dir="ltr"><span id="ling-trial-number">${Math.min(s.trial+1,10)} / 10</span><progress value="${s.trial}" max="10" aria-label="المحاولات المكتملة"></progress></div><div class="ling-identification-stage activity-board"><div class="ling-choices" data-size="${s.size}">${s.options.map(id=>pic('arabic',id)).join('')}</div></div>${errorNode()}`;
  $('#ling-select-level').onclick=openLevels;bindReplay();
  $$('.ling-choices button').forEach(b=>{b.disabled=true;b.onclick=()=>answer(b.dataset.sound);});
  if(s.phase==='setup')$('#ling-play').disabled=true;
 }
 function openLevels(){
  if(!current||current.mode!=='identification')return;
  stop();current.phase='settings';
  drawLevels(current.size);$('#ling-levels').showModal();
 }
 function drawLevels(size){
  $('#ling-level-buttons').innerHTML=[2,3,4,5,6].map(n=>`<button class="icon-button" data-level="${n}" aria-label="المستوى ${n-1}، ${n} بطاقات" aria-pressed="${size===n}">${n-1}</button>`).join('');
  const sets=soundSets(size);$('#ling-level-count').textContent=`${size} بطاقات · ${sets.length} مجموعات`;
  $('#ling-sets').innerHTML=sets.map((set,index)=>`<button class="ling-set" data-set="${index}" aria-label="${set.join('، ')}">${set.map(sound=>`<img src="images/${LETTER_MAP[sound]}.webp" alt="${sound}">`).join('')}</button>`).join('');
  $$('#ling-level-buttons button').forEach(b=>b.onclick=()=>drawLevels(Number(b.dataset.level)));
  $$('#ling-sets button').forEach(b=>b.onclick=()=>{
   audio.unlock();stop();
   const options=sets[Number(b.dataset.set)];
   current={mode:'identification',size,options,trial:0,answers:[],phase:'starting',queue:shuffle(Array.from({length:10},(_,i)=>options[i%options.length]))};
   meta.date=new Date().toISOString();meta.sessionId=crypto.randomUUID();$('#ling-levels').close();nextTrial();
  });
 }
 $('#ling-levels').addEventListener('close',()=>{
  if(current?.phase!=='settings')return;
  if(current.queue){current.phase='starting';void playCurrent();}
  else{current.phase='setup';$('#ling-play').disabled=true;}
 });
 function nextTrial(){
  const s=current;if(!s)return;
  if(s.trial===10){finish();return;}
  s.phase='starting';s.options=shuffle(s.options);s.target=s.queue[s.trial];drawIdentification();void playCurrent();
 }
 function answer(sound){
  const s=current;if(!s||s.phase!=='answer')return;
  s.phase='feedback';const correct=sound===s.target;
  s.answers.push({sound:s.target,choice:sound,correct,options:[...s.options]});
  window.SoundProgress?.record({owner:meta.owner,sessionId:meta.sessionId,id:String(s.trial),activity:'التعرف على أصوات لينغ',skill:'ling-identification',kind:'assessment',label:s.target,response:sound,correct});
  $$('.ling-choices button,.ling-tools button').forEach(b=>b.disabled=true);
  const feedback=showAnswerFeedback(correct,'ling-feedback');
  feedbackTimer=setTimeout(()=>{feedback.remove();if(current!==s)return;s.trial++;nextTrial();},650);
 }
 function finish(){
  const s=current;stop();
  last={...meta,catchTrials:s.catchTrials,size:s.size,answers:s.mode==='detection'?LING_SOUNDS.map((sound,index)=>({sound,response:s.answers[index]||'missing'})):[...s.answers]};
  window.SoundProgress?.complete(meta.sessionId);window.SoundProgress?.saveDetail('ling',last);
  location.hash='/arabic/ling-result';
 }
 function result(){
  last=window.SoundProgress?.detail('ling')||last;
  if(!last||last.owner!==window.SoundProgress?.active()?.id){main.innerHTML=title('فحص لينغ','arabic')+'<p>لا توجد نتيجة لهذه الجلسة.</p>';return;}
  main.innerHTML=title('نتيجة فحص لينغ','arabic')+`<div class="panel ling-result"><h2>${modeName(last.mode)}</h2><p>اسم الطفل: ${escape(last.name)||'—'}<br>التاريخ: <bdi dir="ltr">${lingDate(last.date)}</bdi></p>${lingSummary(last)}${lingTables(last)}<label class="field">ملاحظات<textarea id="ling-notes" maxlength="600"></textarea></label><div class="actions"><button id="ling-pdf" class="button primary">${icon('download')}تنزيل التقرير PDF</button></div><p id="status" class="status" role="status"></p></div>`;
  $('#ling-notes').value=last.notes||'';$('#ling-pdf').onclick=pdf;
 }
 async function pdf(){
  const b=$('#ling-pdf'),record=last;b.disabled=true;record.notes=$('#ling-notes').value.trim();status('جارٍ إعداد التقرير…');let stage;
  try{
   await document.fonts.ready;stage=document.createElement('article');stage.className='report-stage ling-report';
   stage.innerHTML=`<h1>أصواتي العربية</h1><h2>فحص لينغ · ${modeName(record.mode)}</h2><div class="report-meta"><p>اسم الطفل: ${escape(record.name)||'—'}</p><p>التاريخ: <bdi dir="ltr">${lingDate(record.date)}</bdi></p></div>${lingSummary(record)}${lingTables(record)}${record.notes?`<h2>ملاحظات</h2>${record.notes.split(/\n/).map(line=>`<p class="report-notes report-note-line">${escape(line)||'&nbsp;'}</p>`).join('')}`:''}<p class="report-footer">ملخص جلسة باستخدام أصوات مسجلة، ولا يمثل قياس عتبة السمع.</p>`;
   document.body.append(stage);
   const doc=new jspdf.jsPDF({unit:'mm',format:'a4'});
   await addLingPDFPages(doc,stage);
   doc.setProperties({title:`فحص لينغ - ${modeName(record.mode)}`,subject:'ملخص جلسة أصوات لينغ',creator:'أصواتي العربية'});
   const date=new Date(record.date),day=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
   doc.save(`Ling-${record.mode}-${day}.pdf`);status('تم تنزيل التقرير.');
  }catch{status('تعذر إنشاء التقرير. أعد المحاولة.',true);}finally{stage?.remove();if(b.isConnected)b.disabled=false;}
 }
 function hide(){
  if(!current)return;
  const s=current;stop();
  // A response already recorded during feedback advances exactly once on return.
  if(s.phase==='feedback'&&s.mode==='detection'){s.index++;if(s.index===s.queue.length){finish();return;}drawDetection();stop();}
  if(s.phase==='feedback'&&s.mode!=='detection'){s.trial++;if(s.trial===10){finish();return;}s.target=s.queue[s.trial];drawIdentification();}
  if(s.phase==='settings'||s.phase==='setup')return;
  s.phase='paused';s.game?.playing(false);s.game?.retry();$$('.ling-response,.ling-choices button').forEach(b=>b.disabled=true);if($('#ling-play'))$('#ling-play').disabled=false;
 }
 return {openSetup,start,result,reset,hide};
}
