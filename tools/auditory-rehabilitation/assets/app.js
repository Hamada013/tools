import {APP} from './config.js';
import {SOUND_NAMES} from './data.js';
import {createActivities} from './activities.js';
const paths={pause:'M8 5v14 M16 5v14',home:'M3 11 12 3l9 8 M5 10v11h14V10 M9 21v-7h6v7',menu:'M4 6h16 M4 12h16 M4 18h16',close:'m6 6 12 12 M18 6 6 18',download:'M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5',ear:'M6 9a6 6 0 1 1 12 0c0 4-4 4-4 7s-1 5-4 5-4-2-4-4 M10 10a2 2 0 1 1 4 0l-2 3',sound:'m11 4-6 5H2v6h3l6 5z M15 8a6 6 0 0 1 0 8 M18 5a10 10 0 0 1 0 14',cards:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',play:'m8 4 12 8-12 8z',test:'M9 4V2h6v2 M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2 M9 10h6 M9 15l2 2 4-4',practice:'m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',back:'m9 5 7 7-7 7 M16 12H3',shuffle:'M3 6h3l12 12h3 M3 18h3L18 6h3 m-4-4 4 4-4 4 m0 4 4 4-4 4',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',memory:'M9 3a3 3 0 0 0-5 4 4 4 0 0 0-1 7 4 4 0 0 0 6 6z M15 3a3 3 0 0 1 5 4 4 4 0 0 1 1 7 4 4 0 0 1-6 6z M9 8H6 M15 8h3 M9 15H6 M15 15h3',match:'M3 3h6v6H3z M15 15h6v6h-6z M6 12v6h6 m-3-3 3 3-3 3',clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2',check:'m4 12 5 5L20 6',refresh:'M20 8a8 8 0 1 0 0 8 M20 3v5h-5',book:'M12 5q-4-3-9-1v16q5-2 9 1 4-3 9-1V4q-5-2-9 1z M12 5v16',target:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0 M12 11v2'};
export const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.sound}"/></svg>`;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const main=$('#workspace'),modal=$('#modal'),body=$('#modal-body');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const environment=Object.keys(SOUND_NAMES).map(Number);
const source=(kind,id,type='')=>`${type==='image'?'images':'sounds'}/${type==='image'?'':type?type+'/':''}${id}.${type==='image'?'webp':'m4a'}`;
const name=(kind,id)=>SOUND_NAMES[id];
const pic=(kind,id,extra='',caption=true)=>`<button class="picture ${extra}" data-sound="${id}" aria-label="${escape(name(kind,id))}"><img src="${source(kind,id,'image')}" alt="" draggable="false">${caption?`<span>${escape(name(kind,id))}</span>`:''}</button>`;
const control=(id,symbol,label)=>`<button id="${id}" class="icon-button" title="${label}" aria-label="${label}">${icon(symbol)}</button>`;
const tile=(href,symbol,label,small='')=>`<a href="#/${href}" class="tile">${icon(symbol)}<span>${label}</span>${small?`<small>${small}</small>`:''}</a>`;
const title=(text,back)=>`<div class="section-heading"><a class="icon-button" href="#/${back}" title="رجوع" aria-label="رجوع">${icon('back')}</a><h1>${text}</h1></div>`;
const button=(id,text,cls='primary')=>`<button id="${id}" class="button ${cls}">${text}</button>`;
let route='';
const activities=createActivities({main,icon,pic,control,title,tile,button,escape,shuffle,openModal,status,drag});
function status(text,error=false){const node=$('#status');if(node){node.textContent=text;node.hidden=!text;node.classList.toggle('error',error);}$('#announcement').textContent=text;}
function openModal(text,html){$('#modal-title').textContent=text;body.innerHTML=html;modal.showModal();}
function closeDialog(d){if(d.id==='drawer'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const animation=d.animate([{transform:'translateX(0)'},{transform:'translateX(-100%)'}],{duration:180,easing:'ease-in'});animation.onfinish=()=>d.close();}else d.close();}
$$('[data-close]').forEach(b=>{b.innerHTML=icon('close');b.onclick=()=>closeDialog(b.closest('dialog'));});
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d);}}));
$('#home-link').innerHTML=icon('home');$('#install').innerHTML=icon('download');$('#menu-toggle').innerHTML=icon('menu');
const drawerItems=[["around", "home", "أصوات من حولي"], ["around/detection", "ear", "اكتشاف الصوت"], ["around/discrimination", "sound", "التمييز السمعي"], ["around/duration", "clock", "طويل وقصير"], ["around/identification", "target", "التعرف على الصوت"], ["around/memory", "memory", "الذاكرة"], ["around/library", "book", "مكتبة الأصوات"]];
$('#drawer-links').innerHTML=drawerItems.map(([r,i,t])=>`<a href="#/${r}" data-route="${r}">${icon(i)}${t}</a>`).join('');
$('#menu-toggle').onclick=()=>{if($('#drawer').open)$('#drawer').close();else{$('#drawer').showModal();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('#drawer').animate([{transform:'translateX(-100%)'},{transform:'translateX(0)'}],{duration:220,easing:'ease-out'});$('#menu-toggle').setAttribute('aria-expanded','true');}};
$('#drawer').addEventListener('cancel',event=>{event.preventDefault();closeDialog($('#drawer'));});
$('#drawer').addEventListener('close',()=>{$('#menu-toggle').setAttribute('aria-expanded','false');$('#menu-toggle').focus();});
$('#drawer-links').onclick=e=>{if(e.target.closest('a'))$('#drawer').close();};
function renderHome(){main.innerHTML=`<section class="app-home-screen app-home-screen--many"><button type="button" class="app-home-logo app-logo-download" data-sound-download aria-label="تنزيل محتوى التطبيق" title="تنزيل محتوى التطبيق" aria-haspopup="dialog"><img src="images/logo.webp" width="180" height="180" alt=""></button><h1 class="app-home-title">${APP.title}</h1><p class="app-home-description">${APP.tagline}</p><div class="app-home-actions"><a href="#/around/detection" class="app-home-action"><span class="app-home-action-icon">${icon('ear')}</span><span>اكتشاف الصوت</span></a><a href="#/around/discrimination" class="app-home-action"><span class="app-home-action-icon">${icon('sound')}</span><span>التمييز السمعي</span></a><a href="#/around/identification" class="app-home-action"><span class="app-home-action-icon">${icon('target')}</span><span>التعرف على الصوت</span></a><a href="#/around/memory" class="app-home-action"><span class="app-home-action-icon">${icon('memory')}</span><span>الذاكرة</span></a><a href="#/around/library" class="app-home-action"><span class="app-home-action-icon">${icon('book')}</span><span>مكتبة الأصوات</span></a></div></section><footer class="app-home-footer" lang="en" dir="ltr"><p>SPEECH AND LANGUAGE PATHOLOGY</p><p><strong>Ahmad Ghanem</strong></p><p>Latakia - Syria</p><p><a href="mailto:slp.ahmadghanem@gmail.com">slp.ahmadghanem@gmail.com</a></p></footer>`;}
function render(){
 activities.reset();main.onclick=null;route=location.hash.replace(/^#\/?/,'')||'home';
 const isHome=route==='home'||route===APP.kind;
 document.body.classList.toggle('app-home-shell',isHome);document.body.dataset.screen=isHome?'home':'activity';
 const fitted=!isHome;
 document.body.classList.toggle('activity-shell',!isHome);document.body.classList.toggle('fitted-activity',fitted);
 main.className=isHome?'app-home-main':fitted?'activity-fit':'';
 if(modal.open)modal.close();if($('#drawer').open)$('#drawer').close();
 $('#home-link').hidden=isHome;$('#install').hidden=!isHome;$('#menu-toggle').hidden=isHome;
 $$('#drawer-links a').forEach(a=>{if(a.dataset.route===route)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const [module,page]=route.split('/');
 if(isHome)renderHome();else if(module===APP.kind)activities.render(page);else{location.replace('#/home');return;}
 document.querySelectorAll('.drag-ghost').forEach(n=>n.remove());main.focus({preventScroll:true});window.scrollTo(0,0);window.SoundSuite?.rendered();
}
function drag(node,getId,answer,selector){let start=null,ghost=null,moved=false;const clear=()=>{ghost?.remove();ghost=null;start=null;};node.addEventListener('pointerdown',e=>{if(e.button!==0||node.disabled)return;start={x:e.clientX,y:e.clientY};moved=false;node.setPointerCapture(e.pointerId);});node.addEventListener('pointermove',e=>{if(!start)return;if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>8){moved=true;if(!ghost){ghost=document.createElement('img');ghost.src=node.querySelector('img')?.src||'';ghost.className='drag-ghost';document.body.append(ghost);}ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';e.preventDefault();}});node.addEventListener('pointerup',e=>{if(moved){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest(selector);if(target)answer(target.dataset.sound,getId());node.addEventListener('click',ev=>{ev.stopImmediatePropagation();ev.preventDefault();},{once:true,capture:true});}clear();});node.addEventListener('pointercancel',clear);node.addEventListener('lostpointercapture',clear);}
window.addEventListener('hashchange',render);window.addEventListener('pagehide',()=>activities.reset());document.addEventListener('visibilitychange',()=>{if(document.hidden)activities.hide();});render();
document.addEventListener('click',event=>{const a=event.target.closest('a[href^="#/"]');if(a&&a.getAttribute('href')===location.hash){event.preventDefault();render();}});

window.SoundApp={routes:drawerItems.map(([route,,label])=>[label,()=>{location.hash='/'+route;}])};
window.SoundSuite.bind({stop:()=>activities.hide(),render});
