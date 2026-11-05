import {AudioEngine} from './audio.js';
import {SOUND_NAMES,WIDE_PAIRS,SIMILAR_PAIRS,SETS,SUDDEN,CONTINUOUS} from './data.js';
import {SOUND_PITCH} from './sound-pitch.js';

export function createActivities({main,icon,pic,control,title,tile,button,escape,shuffle,openModal,status,drag}){
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const environment=Object.keys(SOUND_NAMES).map(Number),audio=new AudioEngine();
 let current=null,clipController=null,listeningOwner=null,durationSound=1;
 const source=(id,type='')=>`sounds/${type?type+'/':''}${id}.m4a`;
 const errorNode=()=>'<p id="status" class="status" role="alert" hidden></p>';
 const heading=(text,back,tools='')=>`<div class="activity-heading">${title(text,back)}<div class="activity-tools">${tools}</div></div>`;
 const modeTools=prefix=>control(prefix+'-practice','practice','تدريب')+control(prefix+'-test','test','اختبار');
 const active=s=>current===s&&!s.signal.aborted;
 function wait(ms,signal){return new Promise((resolve,reject)=>{
  if(signal.aborted)return reject(new DOMException('Cancelled','AbortError'));
  const finish=error=>{clearTimeout(timer);signal.removeEventListener('abort',abort);error?reject(error):resolve();};
  const abort=()=>finish(new DOMException('Cancelled','AbortError')),timer=setTimeout(()=>finish(),ms);
  signal.addEventListener('abort',abort,{once:true});
 });}
 function stopPlayback(){clipController?.abort();clipController=null;audio.stop();}
 function closeEar(owner){if(owner&&owner!==listeningOwner)return;listeningOwner=null;if($('#listening-overlay').open)$('#listening-overlay').close();}
 function reset(){
  current?.game?.destroy();current?.observer?.disconnect();current?.controller.abort();current=null;stopPlayback();closeEar();
  if($('#session-countdown').open)$('#session-countdown').close();
  $$('.demo-ghost,.demo-glove,#answer-feedback').forEach(node=>{node.getAnimations().forEach(a=>a.cancel());node.remove();});
 }
 function begin(fields){reset();const controller=new AbortController();return current={...fields,controller,signal:controller.signal,phase:'ready',sessionId:crypto.randomUUID(),owner:window.SoundProgress?.active()?.id};}
 function run(s,fn){if($('#status')?.classList.contains('error'))status('');void fn().catch(error=>{
  if(error.name==='AbortError'||!active(s))return;
  s.phase='error';closeEar();status('تعذر تشغيل الصوت. تحقق من تنزيل المحتوى ثم أعد المحاولة.',true);
  for(const selector of ['#identify-target','#duration-replay','#detect-auto','.detect-ear'])if($(selector))$(selector).disabled=false;
  if(s.mode==='detection'){s.auto=false;updateDetectionAuto();}
 });}
 document.addEventListener('click',()=>audio.unlock(),{capture:true});
 async function countdown(s){
  s.phase='countdown';const dialog=$('#session-countdown'),number=$('#countdown-number');dialog.showModal();
  for(const value of [1,2,3]){
   if(!active(s))throw new DOMException('Cancelled','AbortError');
   number.textContent=value;number.dataset.step=value;number.getAnimations().forEach(a=>a.cancel());
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches)number.animate([{opacity:0,transform:'scale(.55)'},{opacity:1,transform:'scale(1.08)',offset:.45},{opacity:1,transform:'scale(1)'}],{duration:700,easing:'ease-out'});
   await wait(1000,s.signal);
  }
  s.phase='ready';dialog.close();
 }
 function cover(selector,selected){
  $$(selector).forEach((card,index)=>{
   const visible=selected===null||card===selected;card.classList.toggle('practice-covered',!visible);
   card.setAttribute('aria-label',visible?(card.dataset.originalLabel||SOUND_NAMES[card.dataset.sound]):`بطاقة مغطاة ${index+1}`);
  });
 }
 async function clip(s,id,type='',card=null,{progress=false,signal=s.signal,onStart=()=>{},record=true}={}){
  stopPlayback();const controller=new AbortController();clipController=controller;
  const abort=()=>controller.abort();signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();
  let frame,start,duration;const ear=$('.detect-ear')||$('#identify-target');
  const bar=$('#sound-progress');
  try{
   const cardBar=card?.querySelector('.duration-card-time>span');
   if(progress){duration=await audio.duration(source(id,type),{signal:controller.signal});bar.hidden=false;bar.dataset.duration=type;bar.className='sound-time '+type;bar.setAttribute('aria-valuenow','0');bar.firstElementChild.style.width='0%';if(cardBar)cardBar.style.width='0%';}
   await audio.play(source(id,type),{signal:controller.signal,onStart:()=>{
    card?.classList.add('cue');
    if(ear){ear.soundOwner=controller;ear.classList.add('sound-playing');ear.setAttribute('aria-busy','true');}
    onStart();
    if(progress){start=performance.now();const update=()=>{if(controller.signal.aborted)return;const value=Math.min(100,(performance.now()-start)/(duration*1000)*100);bar.firstElementChild.style.width=value+'%';if(cardBar)cardBar.style.width=value+'%';bar.setAttribute('aria-valuenow',String(Math.round(value)));frame=requestAnimationFrame(update);};frame=requestAnimationFrame(update);}
   }});
   if(record&&active(s)&&!['detection','memory'].includes(s.mode)&&s.activity!=='test')window.SoundProgress?.record({owner:s.owner,sessionId:s.sessionId,activity:s.text||window.SoundSuite.skillNames[s.mode]||'الاستماع',skill:skill(s),label:SOUND_NAMES[id]+(type?' · '+(type==='short'?'قصير':'طويل'):''),kind:'practice'});
   if(progress&&active(s)){bar.firstElementChild.style.width='100%';if(cardBar)cardBar.style.width='100%';bar.setAttribute('aria-valuenow','100');}
  }finally{
   cancelAnimationFrame(frame);card?.classList.remove('cue');if(ear?.soundOwner===controller){ear.classList.remove('sound-playing');ear.setAttribute('aria-busy','false');}closeEar(controller);signal.removeEventListener('abort',abort);
   if(clipController===controller)clipController=null;
  }
 }
 const skill=s=>s.text?.includes('التمييز')?'discrimination':s.mode;
 function stars(answers=[]){return `<div class="stars" aria-label="${answers.filter(Boolean).length} من ${answers.length}">${Array.from({length:10},(_,i)=>`<svg class="trial-star ${answers[i]?'filled':''}" data-completed="${i<answers.length}" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>`).join('')}</div>`;}
 function scorePopup(s,restart){
  window.SoundProgress?.complete(s.sessionId);
  s.phase='complete';const practice=s.activity==='practice';
  openModal(s.text||'اكتشاف الصوت',`<div class="center"><div class="result-metric" dir="ltr">${practice?'10 محاولات':s.score+' / 10'}</div>${practice?'':`<p class="result-percent" dir="ltr">${s.score*10}%</p>`}<div class="actions">${control('session-again','refresh',practice?'تدريب جديد':'جلسة جديدة')}${control('session-back','back','رجوع')}</div></div>`);
  $('#session-again').onclick=()=>{$('#modal').close();restart();};
  $('#session-back').onclick=()=>{$('#modal').close();returnToWorkplace();};
 }
 function returnToWorkplace(){
  const s=current;if(!s)return;
  if(s.mode==='identification')startIdentification(s.pool,s.text,s.back);
  else if(s.mode==='duration')durationExplore(s.id);
  else if(s.mode==='detection'){reset();detectionSetup();}
 }
 $('#session-countdown').addEventListener('cancel',event=>{event.preventDefault();returnToWorkplace();});
 $('#listening-overlay').addEventListener('cancel',event=>{event.preventDefault();if(current?.mode==='detection')pauseDetection();});

 function detectionSetup(){
  main.innerHTML=heading('اكتشاف الصوت','around')+`<div class="setup-board"><div class="tiles"><button id="sudden" class="tile">${icon('sound')}<span>أصوات مفاجئة</span></button><button id="continuous" class="tile">${icon('ear')}<span>أصوات مستمرة</span></button></div></div>`;
  $('#sudden').onclick=()=>startDetection(SUDDEN);$('#continuous').onclick=()=>startDetection(CONTINUOUS);
 }
 function startDetection(pool){
  const s=begin({mode:'detection',activity:'test',pool,queue:shuffle([...Array(5).fill(true),...Array(5).fill(false)]),trial:0,score:0,answers:[],auto:true});
  drawDetection(s);run(s,async()=>{await countdown(s);await playDetection(s);});
 }
 function updateDetectionAuto(){const s=current,button=$('#detect-auto');button.innerHTML=icon(s.auto?'pause':'play');button.setAttribute('aria-pressed',String(s.auto));button.setAttribute('aria-label',s.auto?'إيقاف مؤقت':'متابعة');}
 function drawDetection(s){
  s.game?.destroy();
  main.innerHTML=heading('اكتشاف الصوت','around/detection',control('detect-auto',s.auto?'pause':'play','إيقاف مؤقت'))+stars(s.answers)+`<div class="activity-board" id="detect-stage"></div>${errorNode()}`;
  $('#detect-stage').innerHTML=`<div class="rehab-detection"><button type="button" class="detect-ear" aria-label="إعادة الاستماع" disabled>${icon('ear')}<span class="ear-wave" aria-hidden="true"></span><span class="ear-wave" aria-hidden="true"></span></button><div class="detect-responses"><button type="button" id="heard" class="detect-answer yes" aria-label="سمعت صوتًا" disabled>${icon('check')}</button><button type="button" id="silent" class="detect-answer no" aria-label="لم أسمع صوتًا" disabled>${icon('close')}</button></div></div>`;
  const ear=$('.detect-ear'),choices=[$('#heard'),$('#silent')];
  choices.forEach((node,index)=>node.onclick=()=>answerDetection(s,index===0));ear.onclick=()=>run(s,()=>playDetection(s));
  s.game={destroy(){},playing(value){ear.classList.toggle('sound-playing',value);ear.disabled=true;choices.forEach(node=>node.disabled=true);},enable(){if(!active(s)||s.phase==='answered')return;choices.forEach(node=>node.disabled=false);ear.disabled=false;}};
  updateDetectionAuto();$('#detect-auto').onclick=()=>{if(s.auto)pauseDetection();else{s.auto=true;updateDetectionAuto();if(s.phase==='ready'||s.phase==='error')run(s,()=>playDetection(s));}};
 }
 function answerDetection(s,value){
  if(!active(s)||!['playing','answer'].includes(s.phase)||$('#heard').disabled)return;s.phase='answered';s.detectionController?.abort();stopPlayback();const present=s.queue[s.trial],correct=value===present;s.score+=Number(correct);s.answers.push(correct);$$('.detect-answer').forEach(node=>node.disabled=true);
  window.SoundProgress?.record({owner:s.owner,sessionId:s.sessionId,id:String(s.trial),activity:'اكتشاف الصوت',skill:'detection',kind:'assessment',label:present?SOUND_NAMES[s.target]:'سكوت',target:present?String(s.target):'silence',present,response:value,correct});
  $('.stars').outerHTML=stars(s.answers);
  run(s,async()=>{await feedback(s,correct);if(s.trial===9){scorePopup(s,()=>startDetection(s.pool));return;}s.trial++;s.target=null;drawDetection(s);s.phase='ready';if(s.auto)await playDetection(s);});
 }
 function pauseDetection(){const s=current;if(!s||s.mode!=='detection')return;s.auto=false;s.detectionController?.abort();stopPlayback();closeEar();s.game?.playing(false);if(s.phase==='playing'||s.phase==='answer')s.phase='ready';updateDetectionAuto();}
 async function playDetection(s){
  s.phase='playing';s.target??=shuffle(s.pool)[0];s.game.playing(true);s.detectionController?.abort();const controller=new AbortController();s.detectionController=controller;
  const abort=()=>controller.abort();s.signal.addEventListener('abort',abort,{once:true});
  try{
   if(s.queue[s.trial])await clip(s,s.target,'',null,{signal:controller.signal,onStart:()=>s.game.enable()});
   else{s.game.enable();await wait(3000,controller.signal);}
   if(!active(s)||controller.signal.aborted||s.phase==='answered')return;s.phase='answer';s.game.playing(false);s.game.enable();
  }finally{if(active(s))$('.detect-ear')?.classList.remove('sound-playing');s.signal.removeEventListener('abort',abort);}
 }

 function discriminationSetup(){
  main.innerHTML=heading('التمييز السمعي','around')+`<div class="setup-board"><div class="tiles"><button id="wide" class="tile">${icon('sound')}<span>1</span></button><button id="similar" class="tile">${icon('ear')}<span>2</span></button>${tile('around/duration','clock','طويل وقصير')}</div></div>`;
  $('#wide').onclick=()=>chooseSets(WIDE_PAIRS,'التمييز · المستوى 1','around/discrimination');$('#similar').onclick=()=>chooseSets(SIMILAR_PAIRS,'التمييز · المستوى 2','around/discrimination');
  $('#wide').setAttribute('aria-label','المستوى 1، أصوات متباينة');$('#similar').setAttribute('aria-label','المستوى 2، أصوات متشابهة');
 }
 function identificationSetup(){
  main.innerHTML=heading('التعرف على الصوت','around')+`<div class="setup-board"><div class="tiles"><button id="open-set" class="tile">${icon('book')}<span>10</span></button><button id="two-set" class="tile">${icon('cards')}<span>2</span></button><button id="closed-set" class="tile">${icon('target')}<span dir="ltr">3 / 4</span></button></div></div>`;
  $('#open-set').onclick=()=>startIdentification(environment,'التعرف على الصوت');$('#two-set').onclick=()=>chooseSets(SETS[2],'التعرف على الصوت');$('#closed-set').onclick=()=>chooseSets(SETS[3],'التعرف على الصوت');
  $('#open-set').setAttribute('aria-label','المجموعة المفتوحة، 10 صور');$('#two-set').setAttribute('aria-label','خياران');$('#closed-set').setAttribute('aria-label','3 أو 4 خيارات');
 }
 function chooseSets(sets,text,back='around/identification'){
  openModal(text,`<div class="set-library">${sets.map((set,index)=>`<button class="set-card" data-set="${index}" aria-label="${escape(set.map(id=>SOUND_NAMES[id]).join('، '))}">${set.map(id=>`<img src="images/${id}.webp" alt="">`).join('')}</button>`).join('')}</div>`);
  $$('.set-card').forEach(button=>button.onclick=()=>{$('#modal').close();startIdentification(sets[Number(button.dataset.set)],text,back);});
 }
 function startIdentification(pool,text,back='around/identification',activity='listen'){
  const s=begin({mode:'identification',pool:[...pool],text,back,activity,trial:0,score:0,answers:[],previousTarget:null,hasCue:false});
  prepareIdentification(s);drawIdentification(s);
  if(activity!=='listen')run(s,async()=>{await countdown(s);await runIdentification(s);});
 }
 function prepareIdentification(s){
  s.hasCue=false;s.target=shuffle(s.pool.filter(id=>id!==s.previousTarget))[0]??s.pool[0];s.previousTarget=s.target;
  const options=s.pool.length>10?[s.target,...shuffle(s.pool.filter(id=>id!==s.target)).slice(0,9)]:s.pool;
  s.options=shuffle(options);
  if(s.options.length>1&&s.options.indexOf(s.target)===s.lastPosition)s.options.push(s.options.shift());
  s.lastPosition=s.options.indexOf(s.target);
 }
 function drawIdentification(s){
  const count=s.options.length;
  main.innerHTML=heading(s.text,s.back,modeTools('identify'))+(s.activity==='test'?`<div class="trial-progress"><div class="trial-number" id="trial-number" dir="ltr">${s.trial+1} / 10</div>${stars(s.answers)}</div>`:'')+`<div class="identify-board activity-board"><div class="identify-layout" data-size="${count}"><button id="identify-target" class="ear-card" data-sound="target" aria-label="استمع إلى الصوت أو ضع صورته هنا">${icon('ear')}</button><div class="answer-grid" data-size="${count}">${s.options.map(id=>pic('around',id,'',false)).join('')}</div></div></div>${errorNode()}`;
  $('#identify-practice').onclick=()=>startIdentification(s.pool,s.text,s.back,'practice');$('#identify-test').onclick=()=>startIdentification(s.pool,s.text,s.back,'test');
  $('#identify-practice').setAttribute('aria-pressed',String(s.activity==='practice'));$('#identify-test').setAttribute('aria-pressed',String(s.activity==='test'));
  $('#identify-target').onclick=()=>{
   if(['ready','answer','playing','error'].includes(s.phase))run(s,()=>playIdentificationTarget(s));
  };
  $$('.answer-grid button').forEach(card=>{
   card.disabled=s.activity!=='listen';
   card.onclick=()=>{if(s.activity==='listen'&&!s.hasCue)run(s,()=>clip(s,Number(card.dataset.sound),'',card));else identifyAnswer(s,Number(card.dataset.sound));};
   card.style.touchAction='none';drag(card,()=>Number(card.dataset.sound),(_,id)=>identifyAnswer(s,id),'#identify-target');
  });
 }
 async function playIdentificationTarget(s){
  s.phase='playing';s.hasCue=false;$('#identify-target').replaceChildren();$('#identify-target').innerHTML=icon('ear');$('#identify-target').disabled=true;
  $$('.answer-grid button').forEach(card=>card.disabled=true);
  await clip(s,s.target,'',null,{record:s.activity==='listen',onStart:()=>{s.hasCue=true;$('#identify-target').disabled=false;$$('.answer-grid button').forEach(card=>card.disabled=false);}});
  if(!active(s)||s.phase!=='playing')return;s.phase='answer';$('#identify-target').disabled=false;
 }
 async function runIdentification(s){
  if(s.activity==='practice'){
   s.phase='demonstrating';const card=$(`.answer-grid [data-sound="${s.target}"]`);$('#identify-target').disabled=true;
   await clip(s,s.target,'',null,{record:false});await demonstrate(s,card,$('#identify-target'));
   window.SoundProgress?.record({owner:s.owner,sessionId:s.sessionId+':model',id:'model',activity:s.text,skill:skill(s),label:SOUND_NAMES[s.target],kind:'practice'});window.SoundProgress?.complete(s.sessionId+':model');
   await wait(650,s.signal);prepareIdentification(s);drawIdentification(s);
  }
  await playIdentificationTarget(s);
 }
 const gloveSVG='<svg viewBox="0 0 60 70" aria-hidden="true"><path d="M22 39V9c0-8 10-8 10 0v21c4-8 11-3 11 2 5-5 12-1 12 5v14c0 11-9 17-20 17-7 0-11-4-15-10L8 41c-5-8 3-13 9-6l5 4Z" fill="white" stroke="#64748b" stroke-width="2"/><path d="M24 57h22" fill="none" stroke="#cbd5e1" stroke-width="2"/></svg>';
 async function animateDemo(s,node,keyframes,duration){
  const animation=node.animate(keyframes,{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:duration,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  const abort=()=>animation.cancel();s.signal.addEventListener('abort',abort,{once:true});
  try{await animation.finished;if(!active(s))throw new DOMException('Cancelled','AbortError');}finally{s.signal.removeEventListener('abort',abort);}
 }
 async function demonstrate(s,card,box=null){
  const from=card.getBoundingClientRect(),hand=document.createElement('span');hand.className='demo-glove';hand.setAttribute('aria-hidden','true');hand.innerHTML=gloveSVG;
  const x=from.left+from.width*.55,y=from.top+from.height*.5;hand.style.left=x+'px';hand.style.top=y+'px';document.body.append(hand);
  let ghost;
  try{
   await animateDemo(s,hand,[{transform:`translate(${Math.min(150,innerWidth-x-50)}px,100px) rotate(12deg)`,opacity:0},{transform:'translate(0,0) rotate(0)',opacity:1}],600);
   await animateDemo(s,hand,[{transform:'scale(1)'},{transform:'scale(.86)'},{transform:'scale(1)'}],350);
   if(box){
    ghost=card.cloneNode(true);ghost.removeAttribute('id');ghost.removeAttribute('disabled');ghost.className='demo-ghost picture';ghost.tabIndex=-1;ghost.setAttribute('aria-hidden','true');ghost.style.cssText=`position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;pointer-events:none;z-index:120`;document.body.append(ghost);hand.style.zIndex='121';
    const to=box.getBoundingClientRect(),dx=to.left+to.width/2-from.left-from.width/2,dy=to.top+to.height/2-from.top-from.height/2;
    await Promise.all([animateDemo(s,ghost,[{transform:'translate(0,0) scale(1)'},{transform:`translate(${dx}px,${dy}px) scale(${Math.min(.8,to.width/from.width)})`}],850),animateDemo(s,hand,[{transform:'translate(0,0)'},{transform:`translate(${dx}px,${dy}px)`}],850)]);
    box.replaceChildren(card.querySelector('img').cloneNode());
   }
   card.classList.add('matched');await wait(300,s.signal);
  }finally{ghost?.remove();hand.remove();}
 }
 function identifyAnswer(s,id){
  if(!active(s)||!s.hasCue||!['playing','answer'].includes(s.phase)||!s.options.includes(id))return;
  s.phase='answered';stopPlayback();const correct=id===s.target,card=$(`.answer-grid [data-sound="${id}"]`);s.score+=Number(correct);s.answers.push(correct);
  window.SoundProgress?.record({owner:s.owner,sessionId:s.sessionId,id:String(s.trial++),activity:s.text,skill:skill(s),kind:s.activity==='test'?'assessment':'practice',label:SOUND_NAMES[s.target],target:String(s.target),response:String(id),correct});
  $('#identify-target').replaceChildren(card.querySelector('img').cloneNode());card.classList.add(correct?'matched':'wrong');$$('.answer-grid button').forEach(card=>card.disabled=true);$('#identify-target').disabled=true;
  if($('.stars'))$('.stars').outerHTML=stars(s.answers);
  run(s,async()=>{
   await feedback(s,correct);
   if(s.activity==='listen'){s.hasCue=false;s.phase='ready';drawIdentification(s);return;}
   if(s.trial===10){scorePopup(s,()=>startIdentification(s.pool,s.text,s.back,s.activity));return;}
   prepareIdentification(s);drawIdentification(s);await playIdentificationTarget(s);
  });
 }
 async function feedback(s,correct){
  const node=document.createElement('div');node.id='answer-feedback';node.className=`answer-feedback ${correct?'correct':'incorrect'}`;node.setAttribute('role','status');node.setAttribute('aria-label',correct?'إجابة صحيحة':'إجابة غير صحيحة');node.innerHTML=icon(correct?'check':'close');document.body.append(node);
  try{await wait(650,s.signal);}finally{node.remove();}
 }

 function durationSetup(){durationExplore(durationSound);}
 function durationChooser(){
  returnToWorkplace();openModal('اختر الصوت',`<div id="duration-library" class="sound-grid">${environment.map(id=>pic('around',id,'',false)).join('')}</div>`);
  $$('#duration-library button').forEach(card=>card.onclick=()=>{durationSound=Number(card.dataset.sound);$('#modal').close();durationExplore(durationSound);});
 }
 function durationExplore(id){
  durationSound=id;const s=begin({mode:'duration',id,activity:'listen',trial:0,score:0,answers:[],queue:shuffle([...Array(5).fill('short'),...Array(5).fill('long')]),order:['short','long']});drawDuration(s);
 }
 function setDurationMode(activity){
  const s=begin({mode:'duration',id:current.id,activity,trial:0,score:0,answers:[],queue:shuffle([...Array(5).fill('short'),...Array(5).fill('long')]),order:['short','long']});drawDuration(s);
  run(s,async()=>{await countdown(s);if(activity==='practice')await runDurationPractice(s);else await playDurationTarget(s);});
 }
 function drawDuration(s){
  if(s.activity!=='listen'){
   s.order=shuffle(['short','long']);if(s.order.indexOf(s.queue[s.trial])===s.lastPosition)s.order.reverse();s.lastPosition=s.order.indexOf(s.queue[s.trial]);
  }
  const cards=s.order.map(type=>pic('around',s.id,'duration-card',false).replace('data-sound=',`data-duration="${type}" data-sound=`).replace(/aria-label="[^"]*"/,`aria-label="${type==='short'?'صوت قصير':'صوت طويل'}"`).replace('</button>','<span class="duration-stripe" aria-hidden="true"></span><span class="duration-dot" aria-hidden="true"></span><span class="duration-card-time" aria-hidden="true"><span></span></span></button>')).join('');
  main.innerHTML=heading('طويل وقصير','around/discrimination',control('duration-choose','cards','اختيار الصوت')+modeTools('duration')+(s.activity!=='listen'?control('duration-replay','ear','إعادة الصوت'):''))+(s.activity==='test'?stars(s.answers):'')+`<div class="duration-board activity-board"><div id="duration-cards" class="picture-grid">${cards}</div><div class="sound-time-area"><div id="sound-progress" class="sound-time" role="progressbar" aria-label="مدة الصوت" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" hidden><span></span></div></div></div>${errorNode()}`;
  $('#duration-choose').onclick=durationChooser;$('#duration-practice').onclick=()=>setDurationMode('practice');$('#duration-test').onclick=()=>setDurationMode('test');
  $('#duration-practice').setAttribute('aria-pressed',String(s.activity==='practice'));$('#duration-test').setAttribute('aria-pressed',String(s.activity==='test'));
  if($('#duration-replay'))$('#duration-replay').onclick=()=>{if(['answer','playing','error'].includes(s.phase))run(s,()=>playDurationTarget(s));};
  $$('#duration-cards button').forEach(card=>{card.disabled=s.activity!=='listen';card.onclick=()=>{if(s.activity==='listen')run(s,()=>clip(s,s.id,card.dataset.duration,card,{progress:true}));else answerDuration(s,card.dataset.duration);};});
 }
 async function runDurationPractice(s){
  s.phase='demonstrating';const type=s.queue[0],card=$(`#duration-cards [data-duration="${type}"]`);
  await clip(s,s.id,type,null,{record:false});await demonstrate(s,card);
  await clip(s,s.id,type,card,{progress:true,record:false});
  window.SoundProgress?.record({owner:s.owner,sessionId:s.sessionId+':model',id:'model',activity:'طويل وقصير',skill:'duration',kind:'practice',label:SOUND_NAMES[s.id]+' · '+(type==='short'?'قصير':'طويل')});window.SoundProgress?.complete(s.sessionId+':model');
  await wait(650,s.signal);drawDuration(s);await playDurationTarget(s);
 }
 async function playDurationTarget(s){
  s.target=s.queue[s.trial];s.phase='playing';s.hasCue=false;$('#duration-replay').disabled=true;$$('#duration-cards button').forEach(card=>card.disabled=true);
  await clip(s,s.id,s.target,null,{progress:true,record:false,onStart:()=>{s.hasCue=true;$('#duration-replay').disabled=false;$$('#duration-cards button').forEach(card=>card.disabled=false);}});
  if(!active(s)||s.phase!=='playing')return;s.phase='answer';$('#duration-replay').disabled=false;
 }
 function answerDuration(s,type){
  if(!active(s)||!s.hasCue||!['test','practice'].includes(s.activity)||!['playing','answer'].includes(s.phase))return;
  s.phase='answered';stopPlayback();const correct=type===s.target;s.score+=Number(correct);s.answers.push(correct);
  window.SoundProgress?.record({owner:s.owner,sessionId:s.sessionId,id:String(s.trial),activity:'طويل وقصير',skill:'duration',kind:s.activity==='test'?'assessment':'practice',label:SOUND_NAMES[s.id]+' · '+(s.target==='long'?'طويل':'قصير'),target:s.target,response:type,correct});
  $$('#duration-cards button').forEach(card=>card.disabled=true);$('#duration-replay').disabled=true;if($('.stars'))$('.stars').outerHTML=stars(s.answers);
  run(s,async()=>{await feedback(s,correct);s.trial++;if(s.trial===10){scorePopup(s,()=>setDurationMode(s.activity));return;}drawDuration(s);await playDurationTarget(s);});
 }

 function memorySetup(){main.innerHTML=heading('الذاكرة','around')+`<div class="setup-board"><div class="actions">${[4,6,8,12].map(size=>`<button class="button" data-size="${size}">${size}</button>`).join('')}</div></div>`;$$('[data-size]').forEach(button=>button.onclick=()=>startMemory(Number(button.dataset.size)));}
 function startMemory(size){
  const previous=current?.mode==='memory'?[...new Set(current.deck)]:[];
  const pool=shuffle(environment.filter(id=>!previous.includes(id))).slice(0,size/2),s=begin({mode:'memory',activity:'test',size,deck:shuffle([...pool,...pool]),open:[],matched:new Set(),locked:true,attempts:0});
  main.innerHTML=heading('الذاكرة','around',control('memory-restart','refresh','بدء لعبة جديدة')+control('memory-size','cards','عدد البطاقات'))+`<div class="memory-board activity-board"><div class="memory-grid" data-size="${size}">${s.deck.map((id,index)=>pic('around',id,'',false).replace('data-sound=',`data-index="${index}" data-sound=`).replace('<button','<button disabled')).join('')}</div></div>${errorNode()}`;
  $$('.memory-grid button').forEach(card=>card.onclick=()=>flipMemory(s,Number(card.dataset.index)));$('#memory-restart').onclick=()=>startMemory(size);$('#memory-size').onclick=()=>{reset();memorySetup();};
  run(s,async()=>{
   await countdown(s);s.phase='demonstrating';
   for(const [index,id]of pool.entries()){
    const pair=$$(`.memory-grid [data-sound="${id}"]`);pair.forEach(card=>card.classList.add('memory-model-pair'));
    await clip(s,id,'',null,{record:false});await wait(700,s.signal);
    window.SoundProgress?.record({owner:s.owner,sessionId:s.sessionId+':model',id:String(index),activity:'الذاكرة · عرض الأزواج',skill:'memory',label:SOUND_NAMES[id],kind:'practice'});
    pair.forEach(card=>card.classList.remove('memory-model-pair'));await wait(200,s.signal);
   }
   window.SoundProgress?.complete(s.sessionId+':model');
   for(const card of $$('.memory-grid button')){card.classList.add('hidden-face');card.setAttribute('aria-label','بطاقة مقلوبة');card.disabled=false;}
   s.locked=false;s.phase='answer';
  });
 }
 function flipMemory(s,index){
  if(!active(s)||s.phase!=='answer'||s.locked||s.open.includes(index)||s.matched.has(index))return;
  const card=$(`.memory-grid [data-index="${index}"]`);card.classList.remove('hidden-face');card.setAttribute('aria-label',SOUND_NAMES[s.deck[index]]);run(s,()=>clip(s,s.deck[index],'',null,{record:false}));s.open.push(index);
  if(s.open.length!==2)return;s.locked=true;const [a,b]=s.open,correct=s.deck[a]===s.deck[b];
  window.SoundProgress?.record({owner:s.owner,sessionId:s.sessionId,id:String(s.attempts++),activity:'الذاكرة',skill:'memory',kind:'assessment',label:SOUND_NAMES[s.deck[a]],target:String(s.deck[a]),response:String(s.deck[b]),correct});
  if(correct){
   for(const i of [a,b]){s.matched.add(i);const card=$(`.memory-grid [data-index="${i}"]`);card.classList.add('matched');card.disabled=true;}
   s.open=[];s.locked=false;if(s.matched.size===s.deck.length){window.SoundProgress?.complete(s.sessionId);s.locked=true;run(s,async()=>{await wait(1200,s.signal);startMemory(s.size);});}
  }else run(s,async()=>{await wait(1000,s.signal);for(const i of [a,b]){const card=$(`.memory-grid [data-index="${i}"]`);card.classList.add('hidden-face');card.setAttribute('aria-label','بطاقة مقلوبة');}s.open=[];s.locked=false;});
 }
 function library(){
  const s=begin({mode:'library',page:0});
  const bands=[['low','منخفضة'],['middle','متوسطة'],['high','مرتفعة']];
  main.innerHTML=heading('مكتبة الأصوات','around')+`<div class="pitch-library">${bands.map(([id,label])=>`<section class="pitch-column" data-pitch="${id}" aria-label="طبقة ${label}"><h2><span aria-hidden="true"></span>${label}</h2><div class="pitch-grid"></div></section>`).join('')}</div><div class="pitch-pages"><button type="button" id="pitch-prev" class="icon-button" aria-label="الأصوات السابقة">${icon('back')}</button><span id="pitch-page" role="status" dir="ltr"></span><button type="button" id="pitch-next" class="icon-button" aria-label="الأصوات التالية">${icon('back')}</button></div>${errorNode()}`;
  const board=$('.pitch-library');
  const draw=()=>{
   if(!active(s))return;const rect=board.getBoundingClientRect(),width=(rect.width-20)/3,columns=width>=240?3:width>=150?2:1,rows=Math.max(1,Math.floor((rect.height-46)/74)),capacity=rows*columns;
   const groups=bands.map(([band])=>environment.filter(id=>SOUND_PITCH[id].band===band));s.pages=Math.max(...groups.map(group=>Math.ceil(group.length/capacity)));s.page=Math.min(s.page,s.pages-1);
   board.style.setProperty('--pitch-columns',columns);board.style.setProperty('--pitch-rows',rows);
   bands.forEach(([band],index)=>{const grid=$(`[data-pitch="${band}"] .pitch-grid`);grid.innerHTML=groups[index].slice(s.page*capacity,(s.page+1)*capacity).map(id=>pic('around',id)).join('')||'<span class="pitch-empty" aria-hidden="true">—</span>';grid.querySelectorAll('button').forEach(card=>card.onclick=()=>run(s,()=>clip(s,Number(card.dataset.sound),'',card)));});
   $('#pitch-page').textContent=`${s.page+1} / ${s.pages}`;$('#pitch-prev').disabled=s.page===0;$('#pitch-next').disabled=s.page===s.pages-1;
  };
  $('#pitch-prev').onclick=()=>{s.page--;draw();};$('#pitch-next').onclick=()=>{s.page++;draw();};s.observer=new ResizeObserver(draw);s.observer.observe(board);draw();
 }
 function render(page){
  if(page==='detection')detectionSetup();else if(page==='discrimination')discriminationSetup();else if(page==='duration')durationSetup();else if(page==='identification')identificationSetup();else if(page==='memory')memorySetup();else if(page==='library')library();else location.hash='/around';
 }
 function hide(){if(current?.mode==='memory'){reset();memorySetup();}else if(current&&['detection','duration','identification'].includes(current.mode)&&current.activity!=='listen')returnToWorkplace();else stopPlayback();}
 return {render,reset,hide};
}
