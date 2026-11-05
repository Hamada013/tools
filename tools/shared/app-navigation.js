/* Shared source; sync local copies with tools/shared/sync-navigation.cjs. */
(() => {
 'use strict';
 const appId=document.currentScript.dataset.app;
 const soundApp=['arabicsounds','auditory-rehabilitation'].includes(appId);
 const apps={voc:{name:'كلمة',logo:'images/logo.webp'},senb:{name:'جملة',logo:'assets/icons/logo.webp'},taffaha:{name:'مقطع',logo:'assets/icons/logo.webp'},arabicsounds:{name:'أصواتي العربية',logo:'images/logo.webp'},'auditory-rehabilitation':{name:'أصوات من حولي',logo:'images/logo.webp'}};
 const base=new URL('../',document.currentScript.src),storageKey='voc-children-v1';
 const toolsBase=new URL(soundApp?'../':'../../',base);
 const urlFor=id=>new URL(`${['voc','senb','taffaha'].includes(id)?'VSS/':''}${id}/index.html`,toolsBase);
 const logoURL=id=>new URL(`assets/navigation/${id}.webp`,base).href;
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
 const progress=()=>({voc:window.VocProgress,senb:window.SenbProgress,taffaha:window.TaffahaProgress,arabicsounds:window.SoundProgress,'auditory-rehabilitation':window.SoundProgress})[appId];
 function read(){try{return JSON.parse(localStorage.getItem(storageKey));}catch{return null;}}
 const active=()=>progress()?.active();
 // VSS navigation always stays inside its installed scope, including Hamada.
 const availableApps=()=>!soundApp?['voc','senb','taffaha']
  :String(active()?.name||'').normalize('NFKC').trim().toLocaleLowerCase()==='hamada'
   ?Object.keys(apps):['arabicsounds','auditory-rehabilitation'];
 const children=()=>read()?.children||[];
 const legacyApps=child=>({voc:!!child.words,senb:!!child.senb,taffaha:!!child.taffaha});
 const registered=(child,id)=>!!child&&(child.apps||legacyApps(child))[id]===true;
 function register(){const child=active(),data=read();if(!child||!data)return;const saved=data.children.find(entry=>entry.id===child.id);if(!saved||['voc','senb','taffaha'].every(id=>saved.apps?.[id]))return;saved.apps={...saved.apps,voc:true,senb:true,taffaha:true};try{localStorage.setItem(storageKey,JSON.stringify(data));}catch{window.dispatchEvent(new Event(`${appId}-storage-error`));}}
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
 function dialog(id,title){const d=document.createElement('dialog');d.id=id;d.className='suite-dialog';d.dir='rtl';d.setAttribute('aria-labelledby',id+'-title');const header=document.createElement('header'),h=document.createElement('h2');h.id=id+'-title';h.textContent=title;const close=button('إغلاق','close');close.onclick=()=>d.close();header.append(h,close);d.append(header);document.body.append(d);d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});return d;}
 let picker,bar,missing,leaving=false,trigger,transitionTimer,settings;
 function pause(){window.dispatchEvent(new Event('suite-navigation-open'));window.dispatchEvent(new Event(`${appId}-profile-open`));}
 function closeBar(){if(!bar)return;bar.hidden=true;document.querySelectorAll('[data-suite-menu]').forEach(b=>b.setAttribute('aria-expanded','false'));}
 function travel(url,id){
  if(leaving||!availableApps().includes(id))return;leaving=true;pause();closeBar();document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  try{sessionStorage.setItem('speech-app-arrival',id);}catch{}
  const curtain=document.createElement('dialog');curtain.id='suite-transition';curtain.className='suite-dialog suite-transition';curtain.setAttribute('aria-label','هيا بنا إلى '+apps[id].name);
  const layout=document.createElement('div');layout.className='suite-transition-layout';
  const count=document.createElement('span');count.className='suite-count';count.setAttribute('role','status');count.setAttribute('aria-live','polite');count.setAttribute('aria-atomic','true');
  const destination=document.createElement('div');destination.className='suite-transition-app';destination.dir='rtl';
  const img=document.createElement('img');img.alt='';img.src=logoURL(id);img.width=112;img.height=112;
  const name=document.createElement('p');name.textContent=apps[id].name;destination.append(img,name);layout.append(count,destination);curtain.append(layout);document.body.append(curtain);
  curtain.addEventListener('cancel',e=>e.preventDefault());document.body.classList.add('suite-transition-active');curtain.showModal();
  let value=0;
  const tick=()=>{
   if(++value>3){transitionTimer=null;try{sessionStorage.setItem('speech-app-launch-transfer',JSON.stringify({app:id,path:url.pathname,expires:Date.now()+15000}));}catch{}location.assign(url);return;}
   count.textContent=String(value);count.dataset.count=String(value);count.style.animation='none';void count.offsetWidth;count.style.animation='';
   transitionTimer=setTimeout(tick,800);
  };
  tick();
 }
 function openApps(){
  pause();closeBar();closeSettings();
  if(!picker){picker=dialog('suite-app-picker','نلعب ونتعلّم');const grid=document.createElement('div');grid.className='suite-app-grid';picker.append(grid);}
  // Rebuild for the active account: Taffaha and the sound apps switch without reloading.
  const grid=picker.querySelector('.suite-app-grid');grid.replaceChildren();
  for(const id of availableApps()){
   const app=apps[id],b=document.createElement('button');b.type='button';b.dataset.suiteApp=id;
   const img=document.createElement('img');img.alt='';img.src=logoURL(id);const span=document.createElement('span');span.textContent=app.name;b.append(img,span);
   if(id===appId){b.setAttribute('aria-current','page');b.onclick=()=>picker.close();}else b.onclick=()=>travel(urlFor(id),id);grid.append(b);
  }
  grid.dataset.count=String(grid.children.length);if(!picker.open)picker.showModal();
 }
 function missingAccount(child,id){
  if(!missing)missing=dialog('suite-account-required','أنشئ حسابًا أولًا');
  missing.querySelectorAll(':scope > p,:scope > .suite-create').forEach(node=>node.remove());
  const p=document.createElement('p');p.setAttribute('role','status');p.textContent=child?`أنشئ حسابًا باسم «${child.name}» في ${apps[id].name} أولًا لعرض تقريره.`:'اختر حساب الطفل أو أنشئ حسابًا أولًا لعرض تقريره.';missing.append(p);
  const create=document.createElement('button');create.type='button';create.className='suite-create';create.textContent='إنشاء حساب';create.onclick=()=>{missing.close();if(child){const url=urlFor(id);url.searchParams.set('createProfile',child.id);travel(url,id);}else openProfile();};missing.append(create);missing.showModal();
 }
 function reportLinks(host,child){
  if(!host)return;host.replaceChildren();host.classList.add('suite-report-links');host.setAttribute('aria-label','تقارير الطفل في التطبيقات');
  for(const id of availableApps()){const app=apps[id],b=document.createElement('button');b.type='button';b.dataset.reportApp=id;b.title='تقرير '+app.name;b.setAttribute('aria-label',b.title);b.textContent=({voc:'مفاهيم',senb:'جمل',taffaha:'مقاطع',arabicsounds:'أصوات عربية','auditory-rehabilitation':'أصوات من حولي'})[id];if(id===appId){b.setAttribute('aria-current','page');b.disabled=true;}
   b.onclick=()=>{const target=children().find(entry=>entry.id===child?.id);if(!child||!target||!registered(target,id)){missingAccount(child,id);return;}const url=urlFor(id);url.searchParams.set('reportChild',target.id);travel(url,id);};host.append(b);
  }
 }
 function openProfile(name){const ui=({voc:window.VocProfile,senb:window.SenbProfile,taffaha:window.TaffahaProfile,arabicsounds:window.SoundProfile,'auditory-rehabilitation':window.SoundProfile})[appId];ui?.open(name);}
 function activityItems(){
  if(soundApp)return window.SoundApp?.routes||[];
  if(appId==='taffaha')return [['الرئيسية',()=>window.TaffahaApp.go('home')],['تدريب المقاطع',()=>window.TaffahaApp.go('practice')],['الصورة وعدد المقاطع',()=>window.TaffahaApp.test('count')],['المقاطع والصورة',()=>window.TaffahaApp.test('picture')],['تقرير الطفل',()=>window.TaffahaReports.open()]];
  if(appId==='senb')return [['الرئيسية',()=>navigateTo('home')],['لوحة بناء الجمل',()=>navigateTo('workplace')],['مهام التكرار',()=>openActivitySetup('repetition')],['اختبار الطفل',()=>openActivitySetup('test')],['البطاقة الناقصة',()=>openActivitySetup('game')],['تقرير الطفل',()=>window.SenbSessionReports.openReport()]];
  const local=(page)=>()=>{location.href=new URL(page,base);};
  return [['الرئيسية',()=>typeof app!=='undefined'?app.switchView('home'):local('index.html')()],['بدء العمل',()=>typeof app!=='undefined'?app.switchView('workplace'):local('index.html?workplace=1')()],['المطابقة',local('matching.html')],['الذاكرة',local('memory.html')],['البطاقات السريعة',local('rapid.html')],['استمع واختر',local('test.html')],['تقرير الطفل',()=>window.VocReports.open()]];
 }
 function openMenu(b){
  if(bar&&!bar.hidden){closeBar(true);return;}closeSettings();picker?.close();pause();trigger=b;
  if(!bar){bar=document.createElement('nav');bar.id='suite-activity-menu';bar.className='suite-activity-menu';bar.setAttribute('aria-label','التنقل داخل التطبيق');bar.hidden=true;document.body.append(bar);}
  bar.replaceChildren(...activityItems().map(([label,action])=>{const item=document.createElement('button');item.type='button';item.textContent=label;item.onclick=()=>{closeBar();action();};return item;}));
  bar.hidden=false;bar.style.top=Math.min(b.closest('header')?.getBoundingClientRect().bottom||b.getBoundingClientRect().bottom,innerHeight-60)+'px';b.setAttribute('aria-expanded','true');bar.querySelector('button').focus();
 }
 function closeSettings(restoreFocus=false,force=false){
  if(!settings)return;document.body.style.removeProperty('--voc-settings-space');settings.panel.hidden=true;settings.button.setAttribute('aria-expanded','false');
  if(restoreFocus)settings.button.focus();
 }
 function initSettings(){
  if(soundApp){initSoundSettings();return;}
  const host=appId==='taffaha'?document.querySelector('.topbar nav'):appId==='senb'?document.querySelector('.header-actions'):document.querySelector('#workplace-view > header');
  if(!host)return;
  const toggle=button('إعدادات مساحة العمل','settings');toggle.dataset.suiteSettings='';toggle.setAttribute('aria-controls','suite-workplace-settings');toggle.setAttribute('aria-expanded','false');toggle.hidden=true;host.append(toggle);
  const panel=document.createElement('div');panel.id='suite-workplace-settings';panel.className='suite-settings-panel';panel.setAttribute('role','group');panel.setAttribute('aria-label','إعدادات مساحة العمل');panel.hidden=true;document.body.append(panel);
  settings={button:toggle,panel,active:false,entries:[]};
  const workplace=appId==='taffaha'?document.body:document.getElementById(appId==='senb'?'workplaceView':'workplace-view');
  const isWorkplace=()=>appId==='taffaha'?['practice','test'].includes(document.body.dataset.screen):!workplace.classList.contains('hidden');
  function sync(){
   const active=isWorkplace();toggle.hidden=!active;if(active===settings.active)return;settings.active=active;closeSettings(false,true);
   if(active){
    const nodes=appId==='senb'?[document.getElementById('clearBoardBtn'),document.getElementById('workplaceHeaderToolbar'),host.querySelector('[data-senb-child-profile]')]:[...host.children].filter(node=>node!==toggle&&!node.matches('[data-suite-apps],[data-suite-menu],[data-session-end],#stars-container'));
    settings.entries=nodes.filter(Boolean).map(node=>{const marker=document.createComment('workplace control');node.before(marker);panel.append(node);return {node,marker};});
    for(const control of panel.querySelectorAll('button[title]'))if(!control.hasAttribute('aria-label'))control.setAttribute('aria-label',control.title);
   }else{for(const {node,marker}of settings.entries){marker.replaceWith(node);}settings.entries=[];}
   orderControls(host);orderControls(panel);
  }
  function position(){panel.style.top=Math.min(host.closest('header').getBoundingClientRect().bottom+8,innerHeight-80)+'px';panel.style.maxHeight=Math.max(100,innerHeight-parseFloat(panel.style.top)-16)+'px';if(appId==='voc'&&!panel.hidden)document.body.style.setProperty('--voc-settings-space',(panel.getBoundingClientRect().height+24)+'px');}
  toggle.onclick=()=>{if(!panel.hidden){closeSettings(false,true);return;}closeBar();picker?.close();panel.hidden=false;position();toggle.setAttribute('aria-expanded','true');panel.querySelector('button:not([hidden]):not(:disabled)')?.focus();};
  document.addEventListener('click',event=>{
   if(panel.hidden)return;
   if(!panel.contains(event.target)&&!toggle.contains(event.target))closeSettings();
   else if(panel.contains(event.target)&&event.target.closest('button,a,[role="button"]'))queueMicrotask(closeSettings);
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden&&!document.querySelector('dialog[open],[role="dialog"]:not(.hidden):not([hidden])')){event.preventDefault();closeSettings(true);}});
  new MutationObserver(sync).observe(workplace,{attributes:true,attributeFilter:['class','data-screen']});
  window.addEventListener('resize',()=>{if(!panel.hidden)position();});window.addEventListener('pagehide',()=>closeSettings());sync();
 }
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
  toggle.onclick=()=>{if(!panel.hidden){closeSettings();return;}closeBar();picker?.close();panel.style.top=host.closest('header').getBoundingClientRect().bottom+8+'px';panel.style.maxHeight=Math.max(80,innerHeight-parseFloat(panel.style.top)-16)+'px';panel.hidden=false;toggle.setAttribute('aria-expanded','true');panel.querySelector('button:not([hidden]):not(:disabled)')?.focus();};
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
  if(soundApp&&image&&download){
   const logo=document.createElement('button');logo.type='button';logo.dataset.logoDownload='';logo.setAttribute('aria-label','تنزيل محتوى التطبيق');logo.title='تنزيل محتوى التطبيق';logo.setAttribute('aria-haspopup','dialog');
   image.before(logo);logo.append(image);
   // Avoid nesting a button in a link/button; brand text keeps home navigation.
   if(brand.getAttribute('role')==='button'){const text=brand.lastElementChild,home=document.createElement('button');home.type='button';home.className='suite-brand-home';home.setAttribute('aria-label','الرئيسية');home.onclick=brand.onclick;brand.onclick=null;text.before(home);home.append(text);brand.removeAttribute('role');brand.removeAttribute('tabindex');brand.removeAttribute('aria-label');}
   logo.onclick=event=>{event.preventDefault();event.stopPropagation();download.click();};
  }
  const hosts=appId==='taffaha'?document.querySelectorAll('.topbar nav'):(appId==='senb'||soundApp)?document.querySelectorAll('.header-actions'):document.querySelectorAll('.app-home-tools,#workplace-view > header,.game-header');
  for(const host of hosts){
   if(!soundApp){const home=document.createElement('a');home.href=new URL('VSS/index.html',toolsBase).href;home.className='suite-icon';home.dataset.suiteControl='suiteHome';home.setAttribute('aria-label','احكي حلو');home.title='احكي حلو';host.append(home);}
   const old=host.querySelector('a[href="../senb/index.html"],#vocAppLink');const appsButton=old||button('التطبيقات','apps');appsButton.innerHTML=icons.apps;appsButton.classList.add('suite-icon');appsButton.dataset.suiteApps='';appsButton.setAttribute('aria-label','التطبيقات');appsButton.title='التطبيقات';appsButton.setAttribute('aria-haspopup','dialog');appsButton.onclick=e=>{e.preventDefault();openApps();};if(!old)host.append(appsButton);
   const list=button('قائمة الأنشطة','list');list.dataset.suiteMenu='';list.setAttribute('aria-controls','suite-activity-menu');list.setAttribute('aria-expanded','false');list.onclick=()=>openMenu(list);host.append(list);
  }
  initSettings();
  new MutationObserver(changes=>{if(changes.some(change=>change.target.matches?.('dialog[open],.modal-backdrop:not(.hidden),[role="dialog"]:not(.hidden):not([hidden])')))closePanels();}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open','class','hidden']});
  for(const host of hosts){host.classList.add('suite-toolbar');orderControls(host);new MutationObserver(()=>orderControls(host)).observe(host,{childList:true,subtree:true});}
  document.addEventListener('click',e=>{if(bar&&!bar.hidden&&!bar.contains(e.target)&&!e.target.closest('[data-suite-menu]'))closeBar();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&bar&&!bar.hidden){closeBar();trigger?.focus();}else if(bar&&!bar.hidden&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){const buttons=[...bar.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);if(index<0)return;e.preventDefault();buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length].focus();}});
  window.addEventListener('resize',closeBar);window.addEventListener('pagehide',()=>{closeBar();clearTimeout(transitionTimer);document.body.classList.remove('suite-transition-active');});window.addEventListener('pageshow',event=>{if(!event.persisted)return;clearTimeout(transitionTimer);leaving=false;document.body.classList.remove('suite-transition-active');document.getElementById('suite-transition')?.remove();});
  try{if(sessionStorage.getItem('speech-app-arrival')===appId){sessionStorage.removeItem('speech-app-arrival');document.body.classList.add('suite-arrival');setTimeout(()=>document.body.classList.remove('suite-arrival'),650);}}catch{}
  function route(){
   const params=new URLSearchParams(location.search),reportId=params.get('reportChild'),createId=params.get('createProfile');
   if(!reportId&&!createId){register();return;}
   const id=reportId||createId,child=children().find(entry=>entry.id===id),owner=active();
   // A URL is never permission to expose or switch to another child's report.
   if(!owner||!child||(owner.role!=='admin'&&owner.id!==child.id)||!registered(child,appId)){
    if(createId&&child){openProfile(child.name);}else missingAccount(child,appId);
   }else if(reportId){({voc:()=>window.VocReports.open(child.id),senb:()=>window.SenbSessionReports.openReport(child.id),taffaha:()=>window.TaffahaReports.open(child.id),arabicsounds:()=>window.SoundReports.open(child.id),'auditory-rehabilitation':()=>window.SoundReports.open(child.id)})[appId]();}
   else openProfile(child.name);
   params.delete('reportChild');params.delete('createProfile');history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);
  }
  if(appId==='taffaha'&&!window.TaffahaReports)window.addEventListener('taffaha-ready',route,{once:true});else route();
 }
 // Legacy VOC overlays are divs; native dialogs and overlays share dismissal.
 const closePanels=()=>{closeBar();closeSettings();};
 window.addEventListener('suite-navigation-open',closePanels);
 window.AppNavigation={reportLinks,registered,register,openApps,closeSettings,closePanels};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
