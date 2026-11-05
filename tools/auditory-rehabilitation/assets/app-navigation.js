/* Standalone sound-app controls. No cross-app navigation or account transfers. */
(() => {
 'use strict';
 const appId=document.currentScript.dataset.app;
 const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const icons={settings:svg('<path d="m9 3-.7 2.2-2 .9-2.1-.5-2 3.4 1.5 1.7v2.6L2.2 15l2 3.4 2.1-.5 2 .9L9 21h4l.7-2.2 2-.9 2.1.5 2-3.4-1.5-1.7v-2.6L19.8 9l-2-3.4-2.1.5-2-.9L13 3z"/><circle cx="11" cy="12" r="3"/>'),apps:svg('<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M14 17.5h7m-3.5-3.5v7"/>'),list:svg('<path d="M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01"/>'),close:svg('<path d="m6 6 12 12M18 6 6 18"/>')};
 Object.assign(icons,{
  profile:svg('<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'),
  report:svg('<path d="M9 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-4M9 2h6v4H9zM8 16v-3m4 3V9m4 7v-5"/>'),
  download:svg('<path d="M12 3v12m-5-5 5 5 5-5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>'),
  info:svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>'),
  home:svg('<path d="M3 11l9-8 9 8M5 10v11h5v-7h4v7h5V10"/>'),
  games:svg('<path d="M7 7h10a4 4 0 0 1 4 3l1 7a2 2 0 0 1-3 2l-4-3H9l-4 3a2 2 0 0 1-3-2l1-7a4 4 0 0 1 4-3Z"/><path d="M7 10v4m-2-2h4m7-1h.01M18 13h.01"/>')
 });
 function button(label,icon){const b=document.createElement('button');b.type='button';b.className='suite-icon';b.innerHTML=icons[icon];b.title=label;b.setAttribute('aria-label',label);return b;}
 // Physical left-to-right order also defines keyboard order in every app.
 const controlOrder={settings:0,activities:10,apps:20,download:30,end:35,info:40,family:45,report:50,profile:60,back:70,suiteHome:80};
 function controlKind(node){
  if(node.dataset.suiteControl)return node.dataset.suiteControl;
  for(const [kind,selector]of Object.entries({back:'.game-back,#go-home,#activityHomeBtn,#home-link',profile:'[data-child-profile],[data-senb-child-profile],#open-profile',report:'[data-child-report],#open-report,[aria-label="تقرير الطفل"],[aria-label="تقرير جميع الأطفال"]',family:'[data-family-lesson],[aria-label="تدريب العائلة"]',info:'[aria-label="معلومات التطبيق"]',end:'[data-session-end]',download:'[data-open-download],#pwaDownloadToggle,#open-offline,#install',apps:'[data-suite-apps]',activities:'[data-suite-menu]',settings:'[data-suite-settings]'}))if(node.matches(selector))return kind;
  return null;
 }
 function orderControls(host){
  const homeGroup=host.querySelector('#homeHeaderTools');if(homeGroup)orderControls(homeGroup);
  const controls=[...host.children].filter(node=>{
   const kind=controlKind(node);if(kind){
    node.dataset.suiteControl=kind;const label=node.getAttribute('aria-label')||node.title||node.textContent.trim();node.setAttribute('aria-label',label);if(!node.title)node.title=label;
    const glyph=kind==='suiteHome'?'home':kind==='back'?(node.getAttribute('href')==='games.html'?'games':'home'):kind;
    if(icons[glyph]&&!node.querySelector('[data-suite-glyph]')){
     const template=document.createElement('template');template.innerHTML=icons[glyph];const icon=template.content.firstElementChild;icon.dataset.suiteGlyph=glyph;
     const old=node.querySelector('svg,i');if(old)old.replaceWith(icon);else node.prepend(icon);
    }
   }
   return kind||node===homeGroup;
  });
  const rank=node=>node===homeGroup?35:controlOrder[node.dataset.suiteControl];
  const ordered=[...controls].sort((a,b)=>rank(a)-rank(b));
  if(controls.some((node,index)=>node!==ordered[index]))for(const node of ordered)host.append(node);
 }
 let bar,trigger,settings;
 function pause(){window.dispatchEvent(new Event('suite-navigation-open'));window.dispatchEvent(new Event(`${appId}-profile-open`));}
 function closeBar(){if(!bar)return;bar.hidden=true;document.querySelectorAll('[data-suite-menu]').forEach(b=>b.setAttribute('aria-expanded','false'));}
 function activityItems(){
  return window.SoundApp?.routes||[];
 }
 function openMenu(b){
  if(bar&&!bar.hidden){closeBar(true);return;}closeSettings();pause();trigger=b;
  if(!bar){bar=document.createElement('nav');bar.id='suite-activity-menu';bar.className='suite-activity-menu';bar.setAttribute('aria-label','التنقل داخل التطبيق');bar.hidden=true;document.body.append(bar);}
  bar.replaceChildren(...activityItems().map(([label,action])=>{const item=document.createElement('button');item.type='button';item.textContent=label;item.onclick=()=>{closeBar();action();};return item;}));
  bar.hidden=false;bar.style.top=Math.min(b.closest('header')?.getBoundingClientRect().bottom||b.getBoundingClientRect().bottom,innerHeight-60)+'px';b.setAttribute('aria-expanded','true');bar.querySelector('button').focus();
 }
 function closeSettings(restoreFocus=false,force=false){
  if(!settings)return;settings.panel.hidden=true;settings.button.setAttribute('aria-expanded','false');
  if(restoreFocus)settings.button.focus();
 }
 function initSettings(){initSoundSettings();}
 function initSoundSettings(){
  const host=document.querySelector('.header-actions'),main=document.querySelector('main');
  const toggle=button('إعدادات مساحة العمل','settings');toggle.dataset.suiteSettings='';toggle.setAttribute('aria-controls','suite-workplace-settings');toggle.setAttribute('aria-expanded','false');host.append(toggle);
  const panel=document.createElement('div');panel.id='suite-workplace-settings';panel.className='suite-settings-panel';panel.hidden=true;panel.setAttribute('aria-label','إعدادات مساحة العمل');document.body.append(panel);
  settings={button:toggle,panel,entries:[]};
  function sync(){
   const active=document.body.dataset.screen!=='home';toggle.hidden=!active;
   const stale=settings.entries.some(({marker})=>!marker.isConnected);
   if(stale){for(const {node,marker}of settings.entries)if(!marker.isConnected)node.remove();settings.entries=settings.entries.filter(({marker})=>marker.isConnected);}
   if(!active){for(const {node,marker}of settings.entries)marker.replaceWith(node);settings.entries=[];closeSettings();}
   else{
    const nodes=[...host.children].filter(node=>node.matches('[data-suite-control=profile],[data-suite-control=report],[data-suite-control=family],#home-link'));
    nodes.push(...main.querySelectorAll('.activity-tools,.ling-tools,.pair-tools,.pair-actions,.matching-toolbar .actions,.memory-toolbar .actions'));
    for(const node of nodes){if(panel.contains(node))continue;const marker=document.createComment('sound activity control');node.before(marker);panel.append(node);settings.entries.push({node,marker});}
   }
   orderControls(host);orderControls(panel);
  }
  toggle.onclick=()=>{if(!panel.hidden){closeSettings();return;}closeBar();panel.style.top=host.closest('header').getBoundingClientRect().bottom+8+'px';panel.style.maxHeight=Math.max(80,innerHeight-parseFloat(panel.style.top)-16)+'px';panel.hidden=false;toggle.setAttribute('aria-expanded','true');panel.querySelector('button:not([hidden]):not(:disabled)')?.focus();};
  document.addEventListener('click',e=>{if(panel.hidden)return;if(!panel.contains(e.target)&&!toggle.contains(e.target))closeSettings();else if(panel.contains(e.target)&&e.target.closest('button,a'))queueMicrotask(closeSettings);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){closeSettings(true);e.preventDefault();}});
  new MutationObserver(sync).observe(main,{childList:true});new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-screen']});
  window.addEventListener('sound-view-change',()=>{closeSettings();sync();});window.addEventListener('resize',()=>closeSettings());sync();
 }
 function init(){
  let brand=document.querySelector('.app-home-brand,.topbar .brand');
  if(brand?.matches('a')){const replacement=document.createElement('div');replacement.className=brand.className;const link=document.createElement('a');link.href=brand.href;const image=brand.querySelector('img');if(image)replacement.append(image);while(brand.firstChild)link.append(brand.firstChild);replacement.append(link);brand.replaceWith(replacement);brand=replacement;}
  const image=brand?.querySelector('img');
  const download=document.querySelector('[data-open-download],#pwaDownloadToggle,#open-offline,#install');
  if(image&&download){
   const logo=document.createElement('button');logo.type='button';logo.dataset.logoDownload='';logo.setAttribute('aria-label','تنزيل محتوى التطبيق');logo.title='تنزيل محتوى التطبيق';logo.setAttribute('aria-haspopup','dialog');
   image.before(logo);logo.append(image);
   // Avoid nesting a button in a link/button; brand text keeps home navigation.
   if(brand.getAttribute('role')==='button'){const text=brand.lastElementChild,home=document.createElement('button');home.type='button';home.className='suite-brand-home';home.setAttribute('aria-label','الرئيسية');home.onclick=brand.onclick;brand.onclick=null;text.before(home);home.append(text);brand.removeAttribute('role');brand.removeAttribute('tabindex');brand.removeAttribute('aria-label');}
   logo.onclick=event=>{event.preventDefault();event.stopPropagation();download.click();};
  }
  const hosts=document.querySelectorAll('.header-actions');
  for(const host of hosts){
   const list=button('قائمة الأنشطة','list');list.dataset.suiteMenu='';list.setAttribute('aria-controls','suite-activity-menu');list.setAttribute('aria-expanded','false');list.onclick=()=>openMenu(list);host.append(list);
  }
  initSettings();
  new MutationObserver(changes=>{if(changes.some(change=>change.target.matches?.('dialog[open],.modal-backdrop:not(.hidden),[role="dialog"]:not(.hidden):not([hidden])')))closePanels();}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open','class','hidden']});
  for(const host of hosts){host.classList.add('suite-toolbar');orderControls(host);new MutationObserver(()=>orderControls(host)).observe(host,{childList:true,subtree:true});}
  document.addEventListener('click',e=>{if(bar&&!bar.hidden&&!bar.contains(e.target)&&!e.target.closest('[data-suite-menu]'))closeBar();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&bar&&!bar.hidden){closeBar();trigger?.focus();}else if(bar&&!bar.hidden&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){const buttons=[...bar.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);if(index<0)return;e.preventDefault();buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length].focus();}});
  window.addEventListener('resize',closeBar);window.addEventListener('pagehide',closePanels);
 }
 // Account dialogs and activity panels share dismissal.
 const closePanels=()=>{closeBar();closeSettings();};
 window.addEventListener('suite-navigation-open',closePanels);
 window.AppNavigation={closeSettings,closePanels};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
