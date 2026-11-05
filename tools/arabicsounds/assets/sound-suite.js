/* Profile/report adapter for the two independently hosted sound apps. */
(()=>{
 'use strict';
 const app=document.currentScript.dataset.app,labels={arabicsounds:'أصواتي العربية','auditory-rehabilitation':'أصوات من حولي'};
 let storage;try{storage=localStorage;}catch{storage={getItem(){return null;},setItem(){throw Error('storage');}};}
 const P=window.SoundProgress=SoundProgressModel.create({app,storage});
 let api,profile,report,reportId,lesson,lastSample=-1;
 const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const icons={profile:svg('<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'),report:svg('<path d="M9 3H5v18h14V3h-4M9 2h6v4H9zM8 16v-3m4 3V9m4 7v-5"/>'),family:svg('<circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="12" cy="14" r="2.5"/><path d="M2 21v-6a4 4 0 0 1 6-3.5M22 21v-6a4 4 0 0 0-6-3.5M8 22v-2a4 4 0 0 1 8 0v2"/>'),close:svg('<path d="m6 6 12 12M18 6 6 18"/>')};
 const escape=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const host=document.querySelector('.header-actions');
 function control(label,icon,kind){const b=document.createElement('button');b.type='button';b.className='suite-icon';b.innerHTML=icons[icon];b.title=label;b.setAttribute('aria-label',label);b.dataset.suiteControl=kind;b.setAttribute('aria-haspopup','dialog');host.append(b);return b;}
 function pause(){window.dispatchEvent(new Event('suite-navigation-open'));}
 function dialog(id,title){const d=document.createElement('dialog');d.id=id;d.className='suite-dialog sound-dialog';d.dir='rtl';d.innerHTML=`<header><h2 id="${id}-title" tabindex="-1">${title}</h2><button class="suite-icon" type="button" data-close-sound aria-label="إغلاق">${icons.close}</button></header>`;d.setAttribute('aria-labelledby',id+'-title');d.querySelector('button').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target!==d||(id==='sound-profile'&&!P.active()))return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});document.body.append(d);return d;}
 function show(d){pause();document.querySelectorAll('dialog[open]').forEach(other=>{if(other!==d)other.close();});if(!d.open)d.showModal();d.querySelector('h2').focus();}
 function change(id){window.dispatchEvent(new Event(app+'-profile-beforechange'));pause();if(!P.activate(id))return;profile?.close();location.hash='/home';api?.render();window.dispatchEvent(new Event('sound-profile-change'));}
 async function openProfile(name){
  if(P.active()&&!await window.ChildAccountGate.request())return;pause();
  if(!profile){profile=dialog('sound-profile','ملف الطفل');profile.insertAdjacentHTML('beforeend','<div class="suite-account-list" role="list" data-sound-accounts></div><form><label for="sound-child-name">حساب جديد</label><input id="sound-child-name" maxlength="80" required autocomplete="off"><button class="button primary" type="submit">إضافة الطفل</button><p role="status" data-profile-status></p></form>');profile.querySelector('form').onsubmit=e=>{e.preventDefault();const child=P.add(profile.querySelector('#sound-child-name').value);if(child)change(child.id);};profile.addEventListener('cancel',e=>{if(!P.active())e.preventDefault();});}
  const list=profile.querySelector('[data-sound-accounts]');
  window.SuiteAccounts.render(list,P.children(),child=>{
   const b=document.createElement('button');b.type='button';b.className='button';b.textContent=child.name;b.onclick=()=>change(child.id);
   const actions=[];if(P.isAdmin()&&child.role!=='admin'&&child.name.toLowerCase()!=='hamada'){const r=document.createElement('button');r.type='button';r.className='suite-icon';r.innerHTML=icons.report;r.setAttribute('aria-label','تقرير '+child.name);r.onclick=()=>openReport(child.id);actions.push(r);}
   return window.SuiteAccounts.row(child,b,actions);
  });
  profile.querySelector('#sound-child-name').value=typeof name==='string'?name:'';profile.querySelector('[data-close-sound]').hidden=!P.active();profile.querySelector('[data-profile-status]').textContent=P.storageOK()?'':'تعذّر الحفظ. سيبقى الحساب في هذه النافذة فقط.';show(profile);
 }
 const skillNames={detection:'اكتشاف الصوت',identification:'التعرف على الصوت',duration:'طويل وقصير',discrimination:'التمييز السمعي',pair:'تمييز أصوات الكلام',memory:'الذاكرة',matching:'المطابقة','ling-detection':'اكتشاف أصوات لينغ','ling-identification':'التعرف على أصوات لينغ',listening:'الاستماع'};
 function reportGraphics(data,groups){
  if(app!=='auditory-rehabilitation')return '';
  const rows=[...groups.values()],total=rows.reduce((n,row)=>n+row.total,0),correct=rows.reduce((n,row)=>n+row.correct,0),practice=rows.reduce((n,row)=>n+row.practice,0),percent=total?Math.round(correct/total*100):0;
  const recent=data.sessions.filter(session=>session.kind==='assessment'&&session.records.length).slice(-6);
  return `<section class="sound-visual-report" aria-label="ملخص بصري للتقدم"><div class="sound-report-overview"><div class="sound-score-ring" style="--score:${percent}%" role="img" aria-label="${correct} إجابة صحيحة من ${total}"><span>${total?percent+'%':'—'}</span></div><div class="sound-report-stats"><div><b>${correct}</b><span>صحيحة</span></div><div><b>${total-correct}</b><span>تحتاج تدريبًا</span></div><div><b>${practice}</b><span>تدريب واستماع</span></div></div></div><div class="sound-skill-charts">${rows.map(row=>{const value=row.total?Math.round(row.correct/row.total*100):0;return `<article><header><b>${escape(skillNames[row.skill]||row.skill)}</b><span dir="ltr">${row.total?`${row.correct} / ${row.total} · ${value}%`:'—'}</span></header><div class="sound-skill-track" role="img" aria-label="${escape(skillNames[row.skill]||row.skill)}: ${row.correct} من ${row.total}"><span style="width:${value}%"></span></div><small>${row.practice} تدريب واستماع${row.partial?' · '+row.partial+' جلسات غير مكتملة':''}</small></article>`;}).join('')}</div>${recent.length?`<div class="sound-recent-sessions" aria-label="آخر الجلسات">${recent.map(session=>{const success=session.records.filter(row=>row.correct).length,percent=Math.round(success/session.records.length*100);return `<div><span class="sound-session-bar" style="--score:${percent}%" role="img" aria-label="${escape(session.activity)}: ${success} من ${session.records.length}"><i></i></span><b dir="ltr">${percent}%</b><small>${new Date(session.date).toLocaleDateString('ar',{month:'numeric',day:'numeric'})}</small></div>`;}).join('')}</div>`:''}</section>`;
 }
 function recordMarks(session){
  if(app!=='auditory-rehabilitation')return '';
  return `<div class="sound-response-marks">${session.records.map(row=>`<span class="sound-response-mark ${session.kind==='practice'?'practice':row.correct?'correct':'incorrect'}" title="${escape(row.label)}" aria-label="${escape(row.label)}: ${session.kind==='practice'?'تدريب واستماع':row.correct?'صحيحة':'غير صحيحة'}">${session.kind==='practice'?svg('<path d="m9 5 10 7-10 7Z"/>'):row.correct?svg('<path d="m5 12 4 4L19 6"/>'):icons.close}</span>`).join('')}</div>`;
 }
 function openReport(id){
  const data=P.report(id);if(!data)return;reportId=data.child.id;
  if(!report){report=dialog('sound-report','تقرير الطفل');report.insertAdjacentHTML('beforeend','<div data-sound-report-body></div><button type="button" class="button" data-print-report>حفظ التقرير / طباعة</button>');report.querySelector('[data-print-report]').onclick=()=>window.print();}
  const groups=new Map();for(const session of data.sessions){const row=groups.get(session.skill)||{skill:session.skill,practice:0,correct:0,total:0,partial:0};if(session.kind==='practice')row.practice+=session.records.length;else for(const r of session.records){row.total++;row.correct+=Number(r.correct);}if(session.partial)row.partial++;groups.set(session.skill,row);}
  report.querySelector('[data-sound-report-body]').innerHTML=`<h3>${escape(data.child.name)} · ${labels[app]}</h3>${P.isAdmin()&&data.child.id===P.active().id?'<p>حساب Hamada للتجربة؛ بياناته منفصلة عن الأطفال.</p>':''}${data.sessions.length?`${reportGraphics(data,groups)}<details class="sound-report-table" ${app==='auditory-rehabilitation'?'':'open'}><summary>تفاصيل الأنشطة</summary><div class="table-wrap"><table><thead><tr><th>النشاط</th><th>الاستجابات الصحيحة</th><th>محاولات التدريب</th></tr></thead><tbody>${[...groups.values()].map(row=>`<tr><th>${skillNames[row.skill]||escape(row.skill)}</th><td dir="ltr">${row.total?`${row.correct} / ${row.total} (${Math.round(row.correct/row.total*100)}%)`:'—'}</td><td>${row.practice}</td></tr>`).join('')}</tbody></table></div></details><p class="subtle">التدريب منفصل عن الاختبار. تشمل الأرقام الاستجابات المسجلة في الجلسات غير المكتملة، ولا تعني اكتساب المهارة.</p><details><summary>الجلسات (${data.sessions.length})</summary>${[...data.sessions].reverse().map(session=>`<article class="sound-session"><b>${escape(session.activity)}</b><p>${new Date(session.date).toLocaleDateString('ar')} · ${session.kind==='practice'?'تدريب':'اختبار'} · ${session.partial?'غير مكتملة':'مكتملة'}</p>${recordMarks(session)}<p>${[...new Set(session.records.map(r=>r.label))].map(escape).join('، ')}</p></article>`).join('')}</details>`:'<p>لا توجد محاولات مسجلة لهذا الطفل في هذا التطبيق بعد.</p>'}`;
  show(report);
 }
 function openLesson(){
  const child=P.active(),data=P.report();if(!child||!data)return;
  if(!lesson){lesson=dialog('sound-home-lesson','درسنا بالبيت');lesson.insertAdjacentHTML('beforeend','<textarea dir="rtl" aria-label="رسالة للأهل، يمكنك تعديلها"></textarea><footer><button type="button" class="button" data-copy-lesson>نسخ الرسالة</button><button type="button" class="button" data-share-lesson>مشاركة</button></footer><p role="status"></p>');lesson.querySelector('textarea').oninput=e=>{try{storage.setItem(lesson.dataset.storage,e.target.value);}catch{lesson.querySelector('[role=status]').textContent='تعذّر حفظ التعديل؛ انسخوا الرسالة قبل الإغلاق.';}};lesson.querySelector('[data-copy-lesson]').onclick=async()=>{try{await navigator.clipboard.writeText(lesson.querySelector('textarea').value);lesson.querySelector('[role=status]').textContent='تم نسخ الرسالة.';}catch{lesson.querySelector('textarea').select();lesson.querySelector('[role=status]').textContent='يمكنكم نسخ النص المحدد.';}};lesson.querySelector('[data-share-lesson]').onclick=async()=>{try{await navigator.share({title:'درسنا بالبيت',text:lesson.querySelector('textarea').value});}catch(e){if(e.name!=='AbortError')lesson.querySelector('[role=status]').textContent='يمكنكم نسخ الرسالة.';}};}
  const latest=data.sessions.slice(-1),records=latest.flatMap(s=>s.records),targets=[...new Set(records.map(r=>r.label))].slice(0,3),skills=[...new Set(latest.map(s=>skillNames[s.skill]||s.activity))];
  let sample=Math.floor(Math.random()*10);if(sample===lastSample)sample=(sample+1)%10;lastSample=sample;
  const tasks=['قولوا الصوت مرة، ثم خلّوني أختار صورته بين صورتين.','نسمع الصوت، ثم نمثّل مصدره بلعبة أو حركة.','نلعب دورين: إنتو تعملوا صوتًا وأنا أشير لمصدره، ثم نبدّل.','سمّوا مصدر الصوت، شغّلوه بهدوء، واستنّوا إشارتي.','حطّوا صورتين على الطاولة. نسمع الصوت ونضع قطعة لعبة على صورته.','نبحث عن صورة الصوت في كتاب، ونسمعه مرة ثانية.','اعملوا الصوت بلعبة، ثم أخفوها وخلّوني أختار صورتها.','نقول اسم الصوت ونسمعه، ثم نربطه بموقف من يومنا.','نرتّب صور الأصوات. نسمع واحدًا ونحطّ صورته في علبة.','نسمع الصوت مرتين بوقت مريح، ونشير لنفس الصورة كل مرة.'];
  const detection=latest.some(s=>s.skill.includes('detection')),duration=latest.some(s=>s.skill==='duration');
  const detectionTasks=[
   'نعمل صوتًا خفيفًا بلعبة، وأحيانًا نسكت. عند الصوت أضع لعبة في علبة، وعند السكوت أشير «لا».',
   'نطرق على الطاولة بهدوء أو ننتظر بسكوت. أضع مكعبًا في العلبة فقط عندما أسمع الصوت.',
   'نخفي لعبة تصدر صوتًا خلفنا. أشير إلى أذني عند الصوت، وإلى «لا» عند السكوت.',
   'نحرّك لعبة بصوت خفيف، ثم نتوقف. أنقل قطعة إلى السلة عندما أسمعها.',
   'نعمل صوتًا مرة ونترك الدور التالي هادئًا. أختار لعبة للصوت أو إشارة «لا» للسكوت.',
   'نطرق طرقة خفيفة، ثم ننتظر استجابتي. أضع كرة في العلبة عند الصوت؛ لا نطلب تسمية مصدره.',
   'نضع علبة ومكعبًا أمامنا. عند صوت اللعبة أضع المكعب في العلبة، وعند السكوت أتركه مكانه.',
   'نجرب صوتًا خفيفًا من نشاط اليوم. أرفع يدي إذا سمعته، وأشير «لا» إذا بقي الدور ساكتًا.',
   'نسمع صوتًا قصيرًا أو ننتظر بسكوت. أحرّك دمية عند الصوت وأتركها في مكانها عند السكوت.',
   'نلعب ثلاث جولات بصوت وجولات بسكوت. أختار قطعة للصوت وإشارة «لا» للسكوت، وننتظر كل استجابة.'
  ];
  const durationTasks=[
   'نستخدم صوتًا من شغل اليوم مرة قصيرة ومرة طويلة. أختار بإشارتي، ومع المساعدة نجرّب من جديد.',
   'نعمل صوتًا قصيرًا ونحرك إصبعنا قليلًا، ثم صوتًا طويلًا ونمدّ الحركة. أقلّد أو أشير.',
   'نرسم خطًا قصيرًا وآخر طويلًا. أختار الخط بعد سماع مدة الصوت.',
   'نحرك لعبة مع استمرار الصوت، ونتوقف عندما ينتهي. نجرب مرة قصيرة ومرة طويلة.',
   'نسمع صوتًا قصيرًا، ثم طويلًا. أضع قطعة على رسم المدة المناسبة.',
   'نطرق بهدوء مدة قصيرة أو طويلة. أشير للصورة القصيرة أو الطويلة بعد الاستماع.',
   'نمدّ شريطًا مع الصوت الطويل ونستخدم قطعة صغيرة للصوت القصير. أختار بعد الاستماع.',
   'نستخدم صوت اليوم مرتين بمدتين مختلفتين. أعطي إشارة صغيرة للقصير وكبيرة للطويل.',
   'نقول صوتًا قصيرًا أو ممدودًا بهدوء. أحرك السيارة لمسافة قصيرة أو طويلة حسب ما أسمع.',
   'نضع ورقتين بخطين مختلفي الطول. أسمع الصوت وأشير للخط الموافق لمدته.'
  ];
  const task=detection?detectionTasks[sample]:duration?durationTasks[sample]:tasks[sample];
  const text=targets.length?`مرحبًا ماما وبابا 🌷\nأنا ${child.name}، اشتغلت على ${skills.join('، ')}.\nأصواتنا: ${targets.join('، ')}.\n\nنشاط البيت:\n${task}\nنلعب دقيقتين أو ثلاث بصوت مريح، من دون ضغط. الإشارة أو الحركة استجابة مقبولة.`:'لم نسجّل نشاطًا بعد. نلعب أولًا، ثم نختار نشاط البيت من الأصوات التي عملنا عليها.';
  lesson.dataset.storage=`speech-sound-lesson:${app}:${child.id}:${latest.at(-1)?.id||'empty'}:${records.length}`;let saved;try{saved=storage.getItem(lesson.dataset.storage);}catch{}
  lesson.querySelector('textarea').value=saved||text;lesson.querySelector('[role=status]').textContent='';lesson.querySelector('[data-share-lesson]').hidden=!navigator.share;show(lesson);
 }
 control('ملف الطفل','profile','profile').onclick=()=>openProfile();control('تقرير الطفل','report','report').onclick=()=>openReport();control('درس البيت للأهل','family','family').onclick=openLesson;
 document.addEventListener('click',event=>{if(event.target.closest('[data-sound-download]'))document.getElementById('install').click();});
 window.SoundProfile={open:openProfile};window.SoundReports={open:openReport};
 window.SoundSuite={bind(value){api=value;if(!P.active())void openProfile();},rendered(){window.dispatchEvent(new Event('sound-view-change'));},pause,openLesson,skillNames};
 window.addEventListener('storage',event=>{if(event.key===`${app}-children-v1`){pause();api?.render();if(!P.active())void openProfile();if(report?.open)openReport(reportId);}});
 const storageStatus=document.createElement('p');storageStatus.className='sound-storage-error';storageStatus.setAttribute('role','alert');storageStatus.hidden=true;document.body.append(storageStatus);window.addEventListener('sound-progress-change',()=>{storageStatus.hidden=P.storageOK();storageStatus.textContent=P.storageOK()?'':'تعذّر حفظ التقدم على الجهاز. أبقوا النافذة مفتوحة وانسخوا النتائج قبل الإغلاق.';});
 window.addEventListener('suite-navigation-open',()=>api?.stop());
})();
