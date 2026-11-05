import {APP} from './config.js';
import {AudioEngine} from './audio.js';
import {LETTER_MAP,SPEECH_LEVELS} from './data.js';
import {createLing} from './ling.js';
import {showAnswerFeedback} from './feedback.js';
const paths={pause:'M8 5v14 M16 5v14',home:'M3 11 12 3l9 8 M5 10v11h14V10 M9 21v-7h6v7',menu:'M4 6h16 M4 12h16 M4 18h16',close:'m6 6 12 12 M18 6 6 18',download:'M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5',ear:'M6 9a6 6 0 1 1 12 0c0 4-4 4-4 7s-1 5-4 5-4-2-4-4 M10 10a2 2 0 1 1 4 0l-2 3',sound:'m11 4-6 5H2v6h3l6 5z M15 8a6 6 0 0 1 0 8 M18 5a10 10 0 0 1 0 14',cards:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',play:'m8 4 12 8-12 8z',test:'M9 4V2h6v2 M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2 M9 10h6 M9 15l2 2 4-4',practice:'m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',back:'m9 5 7 7-7 7 M16 12H3',shuffle:'M3 6h3l12 12h3 M3 18h3L18 6h3 m-4-4 4 4-4 4 m0 4 4 4-4 4',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',memory:'M9 3a3 3 0 0 0-5 4 4 4 0 0 0-1 7 4 4 0 0 0 6 6z M15 3a3 3 0 0 1 5 4 4 4 0 0 1 1 7 4 4 0 0 1-6 6z M9 8H6 M15 8h3 M9 15H6 M15 15h3',match:'M3 3h6v6H3z M15 15h6v6h-6z M6 12v6h6 m-3-3 3 3-3 3',clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2',check:'m4 12 5 5L20 6',refresh:'M20 8a8 8 0 1 0 0 8 M20 3v5h-5',book:'M12 5q-4-3-9-1v16q5-2 9 1 4-3 9-1V4q-5-2-9 1z M12 5v16',target:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0 M12 11v2'};
export const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.sound}"/></svg>`;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const main=$('#workspace'),modal=$('#modal'),body=$('#modal-body');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const letters=Object.keys(LETTER_MAP);
const source=(kind,id,type='')=>`${type==='image'?'images':'sounds'}/${type==='image'?'':type?type+'/':''}${LETTER_MAP[id]}.${type==='image'?'webp':'m4a'}`;
const name=(kind,id)=>id;
const pic=(kind,id,extra='',caption=true)=>`<button class="picture ${extra}" data-sound="${id}" aria-label="${escape(name(kind,id))}"><img src="${source(kind,id,'image')}" alt="" draggable="false">${caption?`<span>${escape(name(kind,id))}</span>`:''}</button>`;
const control=(id,symbol,label)=>`<button id="${id}" class="icon-button" title="${label}" aria-label="${label}">${icon(symbol)}</button>`;
const tile=(href,symbol,label,small='')=>`<a href="#/${href}" class="tile">${icon(symbol)}<span>${label}</span>${small?`<small>${small}</small>`:''}</a>`;
const title=(text,back)=>`<div class="section-heading"><a class="icon-button" href="#/${back}" title="رجوع" aria-label="رجوع">${icon('back')}</a><h1>${text}</h1></div>`;
const button=(id,text,cls='primary')=>`<button id="${id}" class="button ${cls}">${text}</button>`;
let listenSession=crypto.randomUUID();
let epoch=0,session=null,selected=['ب','م'],pairOrder=['ب','م'],pairBack='arabic/sounds',pairController=null,route='';
const pairPlayer=new AudioEngine();
const ling=createLing({main,icon,title,pic,control,escape,shuffle,openModal,status});
const timers=new Set();
function later(fn,ms){const e=epoch,id=setTimeout(()=>{timers.delete(id);if(epoch===e)fn();},ms);timers.add(id);}
export class SoundPlayer{
 constructor(){this.audio=new Audio();this.audio.preload='auto';this.pending=null;}
 stop(){this.pending?.(new DOMException('Cancelled','AbortError'));this.pending=null;this.audio.pause();this.audio.removeAttribute('src');this.audio.load();}
 play(url,onStart=()=>{}){this.stop();return new Promise((resolve,reject)=>{
  const a=this.audio;let timer,finished=false;
  const done=err=>{if(finished)return;finished=true;clearTimeout(timer);a.onended=a.onerror=a.onplaying=null;this.pending=null;err?reject(err):resolve();};
  this.pending=done;a.src=url;a.onended=()=>done();a.onerror=()=>done(new Error('تعذر تشغيل الصوت. تحقق من تنزيل المحتوى.'));a.onplaying=()=>{clearTimeout(timer);onStart();};
  timer=setTimeout(()=>done(new Error('تعذر تحميل الصوت. أعد المحاولة.')),20000);
  a.play().catch(done);
 });}
}
const player=new SoundPlayer();
function reset(){epoch++;listenSession=crypto.randomUUID();$('#match-feedback')?.remove();ling.reset();pairController?.abort();pairController=null;pairPlayer.stop();if($('#pair-countdown')?.open)$('#pair-countdown').close();main.classList.remove('identification-open');document.querySelectorAll('.demo-ghost').forEach(n=>{n.getAnimations().forEach(a=>a.cancel());n.remove();});timers.forEach(clearTimeout);timers.clear();player.stop();session=null;}
function status(text,error=false){const node=$('#status');if(node){node.textContent=text;node.classList.toggle('error',error);if(main.classList.contains('activity-fit'))node.hidden=!text;}$('#announcement').textContent=text;}
async function play(kind,id,type='',cue){const e=epoch,owner=window.SoundProgress?.active()?.id;try{await player.play(source(kind,id,type),()=>cue?.classList.add('cue'));if(e===epoch)window.SoundProgress?.record({owner,sessionId:listenSession,activity:'الاستماع إلى أصوات الكلام',skill:session?.mode||'listening',label:id,kind:'practice'});return e===epoch;}catch(err){if(err.name!=='AbortError'&&e===epoch)status(err.name==='NotAllowedError'?'اضغط تشغيل لمتابعة الصوت.':'تعذر تشغيل الصوت. نزّل المحتوى أو اتصل بالإنترنت ثم أعد المحاولة.',true);return false;}finally{cue?.classList.remove('cue');}}
function openModal(text,html){$('#modal-title').textContent=text;body.innerHTML=html;modal.showModal();}
function closeDialog(d){if(d.id==='drawer'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const animation=d.animate([{transform:'translateX(0)'},{transform:'translateX(-100%)'}],{duration:180,easing:'ease-in'});animation.onfinish=()=>d.close();}else d.close();}
$$('[data-close]').forEach(b=>{b.innerHTML=icon('close');b.onclick=()=>closeDialog(b.closest('dialog'));});
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d);}}));
$('#home-link').innerHTML=icon('home');$('#install').innerHTML=icon('download');$('#menu-toggle').innerHTML=icon('menu');
const drawerItems=[["arabic", "home", "أصواتي العربية"], ["arabic/sounds", "sound", "اختيار الأصوات"], ["arabic/levels", "cards", "المستويات"], ["arabic/memory", "memory", "الذاكرة"], ["arabic/matching", "match", "السحب والمطابقة"]];
$('#drawer-links').innerHTML=drawerItems.map(([r,i,t])=>`<a href="#/${r}" data-route="${r}">${icon(i)}${t}</a>`).join('');
$('#menu-toggle').onclick=()=>{if($('#drawer').open)$('#drawer').close();else{$('#drawer').showModal();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('#drawer').animate([{transform:'translateX(-100%)'},{transform:'translateX(0)'}],{duration:220,easing:'ease-out'});$('#menu-toggle').setAttribute('aria-expanded','true');}};
$('#drawer').addEventListener('cancel',event=>{event.preventDefault();closeDialog($('#drawer'));});
$('#drawer').addEventListener('close',()=>{$('#menu-toggle').setAttribute('aria-expanded','false');$('#menu-toggle').focus();});
$('#drawer-links').onclick=e=>{if(e.target.closest('a'))$('#drawer').close();};
function renderHome(){main.innerHTML=`<section class="app-home-screen app-home-screen--many"><button type="button" class="app-home-logo app-logo-download" data-sound-download aria-label="تنزيل محتوى التطبيق" title="تنزيل محتوى التطبيق" aria-haspopup="dialog"><img src="images/logo.webp" width="180" height="180" alt=""></button><h1 class="app-home-title">${APP.title}</h1><p class="app-home-description">${APP.tagline}</p><div class="app-home-actions"><a href="#/arabic/sounds" class="app-home-action"><span class="app-home-action-icon">${icon('sound')}</span><span>اختيار الأصوات</span></a><a href="#/arabic/levels" class="app-home-action"><span class="app-home-action-icon">${icon('cards')}</span><span>المستويات</span></a><button id="ling" class="app-home-action"><span class="app-home-action-icon">${icon('ear')}</span><span>أصوات لينغ</span></button><a href="#/arabic/memory" class="app-home-action"><span class="app-home-action-icon">${icon('memory')}</span><span>الذاكرة</span></a><a href="#/arabic/matching" class="app-home-action"><span class="app-home-action-icon">${icon('match')}</span><span>السحب والمطابقة</span></a></div></section><footer class="app-home-footer" lang="en" dir="ltr"><p>SPEECH AND LANGUAGE PATHOLOGY</p><p><strong>Ahmad Ghanem</strong></p><p>Latakia - Syria</p><p><a href="mailto:slp.ahmadghanem@gmail.com">slp.ahmadghanem@gmail.com</a></p></footer>`;$('#ling').onclick=ling.openSetup;}
function render(){
 reset();main.onclick=null;route=location.hash.replace(/^#\/?/,'')||'home';
 const isHome=route==='home'||route===APP.kind;
 document.body.classList.toggle('app-home-shell',isHome);document.body.dataset.screen=isHome?'home':'activity';
 main.className=isHome?'app-home-main':'';
 if(modal.open)modal.close();if($('#drawer').open)$('#drawer').close();
 $('#home-link').hidden=isHome;$('#install').hidden=!isHome;$('#menu-toggle').hidden=isHome;
 $$('#drawer-links a').forEach(a=>{if(a.dataset.route===route)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const [module,page]=route.split('/');
 const fitted=module==='arabic'&&['matching','memory','ling'].includes(page);
 document.body.classList.toggle('fitted-activity',fitted);main.classList.toggle('activity-fit',fitted);
 document.body.classList.toggle('pair-view',module==='arabic'&&['pair','practice','test'].includes(page));
 document.body.classList.toggle('ling-view',module==='arabic'&&['ling','ling-result'].includes(page));
 document.body.classList.toggle('matching-view',module==='arabic'&&page==='matching');
 document.body.classList.toggle('memory-view',module==='arabic'&&page==='memory');
 if(isHome)renderHome();else if(module===APP.kind)renderArabic(page);else{location.replace('#/home');return;}
 document.querySelectorAll('.drag-ghost').forEach(n=>n.remove());main.focus({preventScroll:true});window.scrollTo(0,0);window.SoundSuite?.rendered();
}
function renderArabic(page){
 if(!page){renderHome();}
 else if(page==='levels')renderLevels();else if(page==='sounds')renderSounds();else if(page==='pair')renderPair();else if(page==='practice'||page==='test')startPair(page);else if(page==='matching')startMatching();else if(page==='memory')memorySetup('arabic');else if(page==='ling')ling.start();else if(page==='ling-result')ling.result();else location.hash='/arabic';
}
function renderSounds(){main.innerHTML=title('اختر صوتين','arabic')+`<div class="panel"><div id="selection" class="sound-grid">${letters.map(id=>pic('arabic',id,selected.includes(id)?'selected':'')).join('')}</div></div><div class="actions">${button('open-pair','عرض البطاقتين')}</div>`;
 const update=()=>{$$('#selection .picture').forEach(b=>{const yes=selected.includes(b.dataset.sound);b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes));});$('#open-pair').disabled=selected.length!==2;};
 $('#selection').onclick=e=>{const b=e.target.closest('[data-sound]');if(!b)return;const id=b.dataset.sound;selected=selected.includes(id)?selected.filter(x=>x!==id):selected.length<2?[...selected,id]:[selected[1],id];update();};$('#open-pair').onclick=()=>{pairOrder=[...selected];pairBack='arabic/sounds';location.hash='/arabic/pair';};update();}
function renderLevels(){main.innerHTML=title('المستويات','arabic')+`<div class="panel"><h2>أصوات كلامية · المستوى ١</h2><div id="level1" class="pair-list"></div><h2>أصوات كلامية · المستوى ٢</h2><div id="level2"></div></div>`;
 const pairsHTML=pairs=>pairs.map(p=>`<button class="button" data-pair="${p.join(',')}">${p.join(' / ')}</button>`).join('');$('#level1').innerHTML=pairsHTML(SPEECH_LEVELS.level1.pairs);$('#level2').innerHTML=SPEECH_LEVELS.level2.map(g=>`<h3>${g.category.split(' (')[0]}</h3><div class="pair-list">${pairsHTML(g.pairs)}</div>`).join('');main.onclick=e=>{const b=e.target.closest('[data-pair]');if(b){selected=b.dataset.pair.split(',');pairOrder=[...selected];pairBack='arabic/levels';location.hash='/arabic/pair';}};}
function ensurePairOrder(){if(pairOrder.length!==2||!pairOrder.every(id=>selected.includes(id)))pairOrder=[...selected];}
function renderPair(){
 ensurePairOrder();main.classList.add('pair-workspace');main.dataset.pairMode='idle';
 main.innerHTML=title('بطاقات الأصوات',pairBack)+`<div class="pair-tools">${control('swap','shuffle','تبديل المكان')}</div><div id="pair-cards" class="picture-grid">${pairOrder.map(id=>pic('arabic',id)).join('')}</div><div class="pair-actions"><a id="pair-practice" class="icon-button pair-practice" href="#/arabic/practice" title="وضع التدريب" aria-label="وضع التدريب">${icon('play')}</a><a id="pair-test" class="icon-button pair-test" href="#/arabic/test" title="وضع الاختبار" aria-label="وضع الاختبار">${icon('test')}</a></div>`;
 $$('#pair-cards button').forEach(card=>card.onclick=()=>play('arabic',card.dataset.sound,'',card));
 $('#swap').onclick=()=>{pairOrder.reverse();renderPair();};
 for(const id of ['pair-practice','pair-test'])$('#'+id).addEventListener('click',()=>pairPlayer.unlock());
}
function pairWait(ms,signal){return new Promise((resolve,reject)=>{
 if(signal.aborted)return reject(new DOMException('Cancelled','AbortError'));
 const finish=error=>{clearTimeout(timer);signal.removeEventListener('abort',abort);error?reject(error):resolve();};
 const abort=()=>finish(new DOMException('Cancelled','AbortError')),timer=setTimeout(()=>finish(),ms);
 signal.addEventListener('abort',abort,{once:true});
});}
function returnToPair({score,error}={}){
 history.replaceState(null,'','#/arabic/pair');render();
 if(error)openModal('تعذر تشغيل الصوت','<p>تحقق من الاتصال أو تنزيل الأصوات، ثم حاول مجدداً.</p>');
 else if(score!==undefined)openModal('نتيجة الاختبار',`<div class="result-metric" dir="ltr">${score} / 10</div>`);
}
async function pairCountdown(s){
 const dialog=$('#pair-countdown'),number=$('#countdown-number');s.phase='countdown';
 dialog.showModal();
 for(const value of [1,2,3]){
  if(s.signal.aborted)throw new DOMException('Cancelled','AbortError');
  number.textContent=value;number.dataset.step=value;
  number.getAnimations().forEach(animation=>animation.cancel());
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)number.animate([{opacity:0,transform:'scale(.55)'},{opacity:1,transform:'scale(1.08)',offset:.45},{opacity:1,transform:'scale(1)'}],{duration:700,easing:'cubic-bezier(.2,.8,.2,1)'});
  await pairWait(800,s.signal);
 }
 s.phase='starting';dialog.close();
}
function drawPairSession(s){
 main.classList.add('pair-workspace');main.dataset.pairMode=s.mode;
 main.innerHTML=title(s.mode==='practice'?'التدريب':'الاختبار','arabic/pair')+`<div id="pair-cards" class="picture-grid" aria-busy="true">${s.order.map(id=>pic('arabic',id)).join('')}</div>`;
 $$('#pair-cards button').forEach(card=>{card.disabled=true;card.onclick=()=>answerPair(card.dataset.sound);});
}
async function playPairSound(s,id,card){
 try{await pairPlayer.play(source('arabic',id),{signal:s.signal,onStart:()=>card?.classList.add('cue')});}
 finally{card?.classList.remove('cue');}
 if(s.mode==='practice'&&!s.signal.aborted)window.SoundProgress?.record({owner:s.owner,sessionId:s.sessionId,activity:'تدريب تمييز أصوات الكلام',skill:'pair',kind:'practice',label:id});
}
function pairFailure(s,error){if(error.name!=='AbortError'&&session===s&&!s.signal.aborted)returnToPair({error});}
function startPair(mode){
 ensurePairOrder();pairController=new AbortController();
 const s=session={mode,order:[...pairOrder],queue:shuffle([...Array(5).fill(selected[0]),...Array(5).fill(selected[1])]),trial:0,score:0,phase:'starting',signal:pairController.signal,sessionId:crypto.randomUUID(),owner:window.SoundProgress?.active()?.id};
 drawPairSession(s);
 void(async()=>{
  await pairCountdown(s);
  if(mode==='test'){await pairTrial(s);return;}
  s.phase='exposure';
  for(let index=0;index<2;index++){
   const cards=$$('#pair-cards button');
   cards.forEach((card,i)=>{card.classList.toggle('pair-covered',i!==index);card.setAttribute('aria-label',i===index?name('arabic',s.order[i]):'بطاقة مغطاة');});
   for(let repetition=0;repetition<10;repetition++){
    await playPairSound(s,s.order[index],cards[index]);
    if(index!==1||repetition!==9)await pairWait(1000,s.signal);
   }
  }
  if(session===s&&!s.signal.aborted){window.SoundProgress?.complete(s.sessionId);returnToPair();}
 })().catch(error=>pairFailure(s,error));
}
async function pairTrial(s){
 if(s.signal.aborted)return;
 if(s.trial===10){window.SoundProgress?.complete(s.sessionId);returnToPair({score:s.score});return;}
 drawPairSession(s);s.phase='playing';s.target=s.queue[s.trial];
 await playPairSound(s,s.target);
 if(s.signal.aborted)return;
 s.phase='answer';$('#pair-cards').setAttribute('aria-busy','false');$$('#pair-cards button').forEach(card=>card.disabled=false);
}
function answerPair(id){
 const s=session;if(!s||s.mode!=='test'||s.phase!=='answer'||s.signal.aborted)return;
 s.phase='feedback';const correct=id===s.target;s.score+=Number(correct);
 window.SoundProgress?.record({owner:s.owner,sessionId:s.sessionId,id:String(s.trial),activity:'اختبار تمييز أصوات الكلام',skill:'pair',kind:'assessment',label:s.target,response:id,correct});
 $$('#pair-cards button').forEach(card=>card.disabled=true);$(`#pair-cards [data-sound="${id}"]`).classList.add(correct?'matched':'wrong');
 void(async()=>{await pairWait(650,s.signal);s.trial++;await pairTrial(s);})().catch(error=>pairFailure(s,error));
}
$('#pair-countdown').addEventListener('close',()=>{if(session?.phase==='countdown')returnToPair();});
function startMatching(pool=letters.slice(0,3)){session={mode:'matching',pool,covered:false,locked:false};matchRound();}
function matchRound(){
 const s=session;s.locked=false;s.target=shuffle(s.pool)[0];
 s.options=shuffle([s.target,...shuffle(s.pool.filter(x=>x!==s.target)).slice(0,2)]);
 main.innerHTML=`<div class="activity-heading">${title('السحب والمطابقة','arabic')}<div class="toolbar matching-toolbar"><div class="actions">${control('match-settings','cards','اختيار البطاقات')}${control('match-cover-toggle','eye','تغطية بطاقات الاختيار')}${control('match-next','refresh','بطاقات جديدة')}</div></div></div><p id="match-instruction" class="sr-only"></p><div class="matching-board activity-board"><div class="matching-layout">${pic('arabic',s.target,'target-card',false)}<div class="match-options-wrap"><div class="match-options">${s.options.map(id=>pic('arabic',id,'',false).replace('</button>',`<span class="match-listen" aria-hidden="true">${icon('sound')}</span></button>`)).join('')}</div></div></div></div><p id="status" class="status" role="status" hidden></p>`;
 const top=$('.target-card');top.onclick=()=>play('arabic',s.target,'',top);
 drag(top,()=>s.target,id=>matchAnswer(id),'.match-options [data-sound]');
 $$('.match-options button').forEach(b=>b.onclick=()=>{if(s.locked)return;if(s.covered)play('arabic',b.dataset.sound,'',b);else matchAnswer(b.dataset.sound);});
 $('#match-next').onclick=()=>{player.stop();matchRound();};
 $('#match-cover-toggle').onclick=()=>{s.covered=!s.covered;updateMatchCover();};updateMatchCover();
 $('#match-settings').onclick=()=>{
  player.stop();const pool=new Set(s.pool);
  openModal('اختر الأصوات',`<div id="match-pool" class="sound-grid">${letters.map(id=>`<button class="picture match-pool-card" data-choice="${id}" aria-label="${escape(id)}" aria-pressed="${pool.has(id)}"><img src="${source('arabic',id,'image')}" alt="" draggable="false"></button>`).join('')}</div><p id="pool-warning" class="status" role="alert"></p>${button('pool-save','تطبيق')}`);
  $$('#match-pool button').forEach(card=>card.onclick=()=>{
   const id=card.dataset.choice;if(pool.has(id))pool.delete(id);else pool.add(id);
   card.setAttribute('aria-pressed',String(pool.has(id)));$('#pool-warning').textContent='';
  });
  $('#pool-save').onclick=()=>{
   if(pool.size<3){$('#pool-warning').textContent='اختر ثلاث بطاقات على الأقل.';return;}
   s.pool=[...pool];modal.close();matchRound();
  };
 };
}
function updateMatchCover(){
 const s=session;
 $('#match-cover-toggle').setAttribute('aria-pressed',String(s.covered));
 $('#match-cover-toggle').setAttribute('aria-label',s.covered?'كشف بطاقات الاختيار':'تغطية بطاقات الاختيار');
 $('#match-cover-toggle').title=s.covered?'كشف بطاقات الاختيار':'تغطية بطاقات الاختيار';
 $('#match-instruction').textContent=s.covered?'المس البطاقات المغطاة لسماعها، ثم اسحب البطاقة العليا إلى الصوت المطابق.':'اسحب البطاقة العليا إلى صورتها، أو المس الصورة المطابقة.';
 $$('.match-options button').forEach((card,i)=>{
  card.classList.toggle('match-hidden',s.covered);
  card.setAttribute('aria-label',s.covered?`استمع للبطاقة ${i+1}`:name('arabic',card.dataset.sound));
 });
}
function matchAnswer(id){
 const s=session;if(s.locked)return;s.locked=true;player.stop();
 window.SoundProgress?.record({sessionId:listenSession,activity:'المطابقة',skill:'matching',kind:'practice',label:s.target});
 const correct=id===s.target,card=$(`.match-options [data-sound="${id}"]`);
 card.classList.add(correct?'matched':'wrong');
 $$('.matching-layout button,.matching-toolbar button').forEach(button=>button.disabled=true);
 const feedback=showAnswerFeedback(correct,'match-feedback');
 later(()=>{
  feedback.remove();if(correct){matchRound();return;}
  card.classList.remove('wrong');s.locked=false;
  $$('.matching-layout button,.matching-toolbar button').forEach(button=>button.disabled=false);
 },650);
}
function drag(node,getId,answer,selector){let start=null,ghost=null,moved=false;const clear=()=>{ghost?.remove();ghost=null;start=null;};node.addEventListener('pointerdown',e=>{if(e.button!==0)return;start={x:e.clientX,y:e.clientY};moved=false;node.setPointerCapture(e.pointerId);});node.addEventListener('pointermove',e=>{if(!start)return;if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>8){moved=true;if(!ghost){ghost=document.createElement('img');ghost.src=node.querySelector('img')?.src||'';ghost.className='drag-ghost';document.body.append(ghost);}ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';e.preventDefault();}});node.addEventListener('pointerup',e=>{if(moved){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest(selector);if(target)answer(target.dataset.sound,getId());node.addEventListener('click',ev=>{ev.stopImmediatePropagation();ev.preventDefault();},{once:true,capture:true});}clear();});node.addEventListener('pointercancel',clear);node.addEventListener('lostpointercapture',clear);}
function memorySetup(kind){main.innerHTML=title('الذاكرة','arabic')+`<div class="panel center"><h2>عدد البطاقات</h2><div class="actions">${[4,6,8,12].map(n=>`<button class="button" data-size="${n}">${n}</button>`).join('')}</div><p class="subtle" style="margin-top:20px">اكشف بطاقتين وابحث عن صورتين متطابقتين.</p></div>`;$$('[data-size]').forEach(b=>b.onclick=()=>startMemory(kind,Number(b.dataset.size)));}
function startMemory(kind,size){const previous=session?.mode==='memory'&&session.kind===kind?[...new Set(session.deck)]:[];player.stop();timers.forEach(clearTimeout);timers.clear();const pool=shuffle(letters.filter(id=>!previous.includes(id))).slice(0,Math.floor(size/2));session={mode:'memory',kind,size,deck:shuffle([...pool,...pool]),open:[],matched:new Set(),locked:false,moves:0};const s=session;main.innerHTML=`<div class="activity-heading">${title('الذاكرة','arabic')}<div class="toolbar memory-toolbar"><div class="actions">${control('memory-restart','refresh','بدء لعبة جديدة')}${control('memory-size','cards','عدد البطاقات')}</div></div></div><div class="memory-board activity-board"><div class="memory-grid" data-size="${size}">${s.deck.map((id,i)=>pic(kind,id,'hidden-face',false).replace(/aria-label="[^"]*"/,'aria-label="بطاقة مقلوبة"').replace('data-sound=',`data-index="${i}" data-sound=`)).join('')}</div></div><p id="status" class="status" role="status" hidden></p>`;$$('.memory-grid [data-sound]').forEach(b=>b.onclick=()=>flipMemory(Number(b.dataset.index)));$('#memory-restart').onclick=()=>startMemory(kind,size);$('#memory-size').onclick=()=>{reset();memorySetup(kind);};}
function flipMemory(index){const s=session;if(s.locked||s.open.includes(index)||s.matched.has(index))return;const b=$(`.memory-grid [data-index="${index}"]`);b.classList.remove('hidden-face');b.setAttribute('aria-label',name(s.kind,s.deck[index]));play(s.kind,s.deck[index]);s.open.push(index);if(s.open.length!==2)return;s.moves++;s.locked=true;const [a,c]=s.open;const correct=s.deck[a]===s.deck[c];if(correct){s.matched.add(a);s.matched.add(c);[a,c].forEach(i=>{$(`.memory-grid [data-index="${i}"]`).classList.add('matched');$(`.memory-grid [data-index="${i}"]`).disabled=true;});s.open=[];s.locked=false;if(s.matched.size===Math.floor(s.size/2)*2){s.locked=true;status('أحسنت! بطاقات جديدة…');later(()=>startMemory(s.kind,s.size),1200);}}else{later(()=>{[a,c].forEach(i=>{const b=$(`.memory-grid [data-index="${i}"]`);b.classList.add('hidden-face');b.setAttribute('aria-label','بطاقة مقلوبة');});s.open=[];s.locked=false;},1000);}}
window.addEventListener('hashchange',()=>{main.onclick=null;render();});window.addEventListener('pagehide',()=>reset());document.addEventListener('visibilitychange',()=>{if(document.hidden){if(pairController)returnToPair();else{ling.hide();player.stop();$$('.cue').forEach(b=>b.classList.remove('cue'));}}});render();
// Internal activities share a route; returning to that route must rebuild its menu.
document.addEventListener('click',event=>{const a=event.target.closest('a[href^="#/"]');if(a&&a.getAttribute('href')===location.hash){event.preventDefault();main.onclick=null;render();}});

window.SoundApp={routes:drawerItems.map(([route,,label])=>[label,()=>{location.hash='/'+route;}])};
window.SoundSuite.bind({stop:()=>{player.stop();pairPlayer.stop();if(pairController)returnToPair();else ling.hide();},render});
