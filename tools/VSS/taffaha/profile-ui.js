import {progress as P,MODES,STORAGE} from './progress.js';
const $=id=>document.getElementById(id);
export function initProfile() {
 const dialog=$('taffaha-child-dialog'),input=$('taffaha-child-name');let authorized=false,opening=false;
 const update=()=>{const name=P.active()?.name||'دخول';$('open-profile').setAttribute('aria-label','ملف الطفل: '+name);$('open-profile').title='ملف الطفل: '+name;$('profile-name').textContent=name;};
 async function open(name) {
  if(opening||dialog.open)return;opening=true;authorized=false;window.dispatchEvent(new Event('taffaha-profile-open'));
  try{
   if((P.active()||P.children().some(child=>child.role!=='admin'))&&!await window.ChildAccountGate.request())return;
   authorized=true;dialog.querySelector('[data-close]').hidden=!P.active();input.value=typeof name==='string'?name:P.active()?.name||'';
   const admin=P.active()?.role==='admin',savedChildren=$('taffaha-saved-children');
   $('taffaha-child-title').textContent=admin?'Hamada':'ملف الطفل';
   window.SuiteAccounts.render(savedChildren,P.children(),child=>{const button=document.createElement('button');button.type='button';button.textContent=child.name;button.onclick=()=>enter(child.name);return window.SuiteAccounts.row(child,button);});
   dialog.showModal();input.focus();input.select();
  }finally{opening=false;}
 }
 function enter(name){if(!authorized||!String(name).trim())return;window.dispatchEvent(new Event('taffaha-profile-beforechange'));if(!P.signIn(name))return;authorized=false;dialog.close();update();window.dispatchEvent(new Event('taffaha-profile-change'));}
 dialog.querySelector('form').onsubmit=e=>{e.preventDefault();enter(input.value);};
 dialog.addEventListener('close',()=>{authorized=false;});
 dialog.addEventListener('cancel',event=>{if(!P.active())event.preventDefault();});
 $('open-profile').onclick=()=>open();update();window.TaffahaProfile={open};
 window.addEventListener('storage',e=>{if(e.key!==STORAGE||!e.newValue)return;try{if(JSON.parse(e.newValue).active!==P.active()?.id){window.dispatchEvent(new Event('taffaha-profile-beforechange'));location.reload();}}catch{}});
 window.addEventListener('taffaha-storage-error',()=>{$('profile-error').hidden=false;});
 const welcoming=window.SuiteWelcome?.connect(P,name=>{authorized=true;enter(name);});
 if(!welcoming&&!P.active()&&!new URLSearchParams(location.search).has('reportChild')&&!new URLSearchParams(location.search).has('createProfile'))open();
}
export const periods={all:'منذ إنشاء الحساب',halfyear:'آخر 6 أشهر',quarter:'آخر 3 أشهر',month:'آخر 30 يوماً',week:'آخر 7 أيام',day:'اليوم'};
export function summarize(child,words,period='all',now=new Date()) {
 const start=new Date(now);start.setHours(0,0,0,0);
 if(period==='all')start.setTime(0);
 else if(period==='week')start.setDate(start.getDate()-6);
 else if(period==='month')start.setDate(start.getDate()-29);
 else if(period==='quarter'||period==='halfyear'){const day=start.getDate();start.setDate(1);start.setMonth(start.getMonth()-(period==='quarter'?3:6));start.setDate(Math.min(day,new Date(start.getFullYear(),start.getMonth()+1,0).getDate()));start.setDate(start.getDate()+1);}
 const entries=(child?.taffaha?.attempts||[]).filter(entry=>new Date(entry.date)>=start&&new Date(entry.date)<=now);
 const modes={};for(const mode of Object.keys(MODES)){
  const attempts=entries.filter(entry=>entry.mode===mode),latest=new Map();
  for(const entry of attempts)if(entry.completed)latest.set(entry.wordId,entry);
  const learned=[...latest.values()].filter(entry=>entry.correct&&entry.firstTry);
  modes[mode]={total:attempts.length,correct:attempts.filter(entry=>entry.correct).length,learned:learned.length,groups:[1,2,3,4,5].map(count=>({count,total:words.filter(word=>word.syllableCount===count).length,learned:learned.filter(entry=>entry.count===count).length}))};
 }
 return {name:child?.name||'',childId:child?.id,period,entries,modes,sessionCount:new Set(entries.map(entry=>entry.sessionId)).size,wordCount:new Set(entries.map(entry=>entry.wordId)).size};
}
export function initReports(words) {
 const dialog=$('taffaha-report'),body=$('taffaha-report-body');let selected=null,period='all',model;
 const score=value=>value.total?Math.round(100*value.correct/value.total)+'%':'لم يُقيّم';
 const make=(tag,text,className)=>{const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;};
 function render(){
  const child=P.reportChild(selected);if(!child)return;model=summarize(child,words,period);body.replaceChildren();
  if(P.active()?.role==='admin'){
   const label=make('label','الطفل'),select=document.createElement('select');select.setAttribute('aria-label','اختر الطفل للتقرير');
   for(const entry of P.children().filter(entry=>entry.role!=='admin')){const option=make('option',entry.name);option.value=entry.id;option.selected=entry.id===child.id;select.append(option);}
   select.onchange=()=>{selected=select.value;render();};label.append(select);body.append(label);
  }
  body.append(make('h3',model.name),make('p',periods[period],'muted'));
  const totals=make('div','','taffaha-report-totals');totals.append(make('span',`${model.sessionCount} جلسات`),make('span',`${model.wordCount} كلمات`),make('span',`${model.entries.length} محاولات`));body.append(totals);
  for(const [mode,label]of Object.entries(MODES)){
   const result=model.modes[mode],section=make('section','','taffaha-report-mode');section.append(make('h3',label));
   section.append(make('strong',score(result),'taffaha-report-score'),make('p',`${result.correct} / ${result.total} استجابة صحيحة · ${result.learned} كلمات مكتسبة`));
   for(const group of result.groups){const row=make('div','','taffaha-report-row'),bar=document.createElement('progress');bar.max=group.total||1;bar.value=group.learned;bar.setAttribute('aria-label',`${group.count} مقاطع: ${group.learned} من ${group.total} كلمات مكتسبة`);row.append(make('span',`${group.count} مقاطع`),bar,make('b',`${group.learned} / ${group.total}`));section.append(row);}body.append(section);
  }
  body.append(make('p','الاكتساب حسب آخر إجابة مكتملة لكل كلمة واختبار: إجابة صحيحة من المحاولة الأولى. المحاولات بعد المساعدة تُحفظ في الدقة ولا تُحسب اكتسابًا.','muted'));
  if(!model.entries.length)body.append(make('p','لا توجد نتائج محفوظة بعد.','taffaha-report-empty'));
  dialog.querySelectorAll('[data-period]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.period===period)));
  window.AppNavigation?.reportLinks($('taffaha-report-apps'),child);
 }
 function open(id){selected=typeof id==='string'?id:P.active()?.role==='admin'?P.children().find(child=>child.role!=='admin')?.id:null;if(!P.active()){window.TaffahaProfile.open();return;}window.dispatchEvent(new Event('taffaha-profile-open'));render();if(!dialog.open)dialog.showModal();}
 const filters=$('taffaha-report-periods');
 for(const [key,label]of Object.entries(periods)){const button=document.createElement('button');button.className='icon';button.dataset.period=key;button.title=label;button.setAttribute('aria-label',label);button.textContent=({all:'∞',halfyear:'6m',quarter:'3m',month:'30',week:'7',day:'1'})[key];button.onclick=()=>{period=key;render();};filters.append(button);}
 $('open-report').onclick=()=>open();
 $('taffaha-report-download').onclick=async()=>{
  const control=$('taffaha-report-download');control.disabled=true;$('taffaha-report-error').textContent='';const report=model;
  try{
   if(!window.jspdf)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='assets/vendor/jspdf.umd.min.js';script.onload=resolve;script.onerror=reject;document.head.append(script);});
   await document.fonts.ready;const canvas=document.createElement('canvas');canvas.width=1240;canvas.height=1754;const c=canvas.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,1240,1754);c.direction='rtl';c.textAlign='right';
   const text=(value,y,size=28,color='#22445a')=>{c.fillStyle=color;c.font=`700 ${size}px Tahoma, Arial, sans-serif`;c.fillText(value,1160,y,1080);};
   text('مقطع · تقرير التقدم',95,40);text(report.name,165,38);text(periods[report.period]+' · '+new Date().toLocaleDateString('ar'),225,25);text(`${report.sessionCount} جلسات · ${report.wordCount} كلمات · ${report.entries.length} محاولات`,290);
   let y=375;for(const [mode,label]of Object.entries(MODES)){const result=report.modes[mode];text(label,y,34);text(`دقة الاستجابات: ${score(result)} · المكتسب: ${result.learned}`,y+60);y+=105;for(const group of result.groups){text(`${group.count} مقاطع: ${group.learned} / ${group.total}`,y);c.fillStyle='#edf4f8';c.fillRect(90,y+18,1060,20);c.fillStyle=mode==='count'?'#0284c7':'#539776';const width=1060*group.learned/(group.total||1);c.fillRect(1150-width,y+18,width,20);y+=80;}y+=50;}
   text('الاكتساب: آخر إجابة مكتملة، صحيحة من المحاولة الأولى.',y,24);text('نتائج هذا الجهاز فقط.',y+45,24);
   const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4'});pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,210,297);pdf.save(`Taffaha-${report.name.replace(/[^\p{L}\p{N}_-]/gu,'_')}.pdf`);
  }catch{$('taffaha-report-error').textContent='تعذر تنزيل التقرير. حاول مجددًا.';}finally{control.disabled=false;}
 };
 window.addEventListener('taffaha-profile-beforechange',()=>dialog.close());
 window.TaffahaReports={open,current:()=>model};
}
