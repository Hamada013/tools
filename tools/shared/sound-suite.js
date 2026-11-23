/* Profile/report adapter for the two independently hosted sound apps. */
(()=>{
 'use strict';
 const app=document.currentScript.dataset.app,labels={arabicsounds:'أصواتي العربية','auditory-rehabilitation':'أصوات من حولي'};
 let storage;try{storage=localStorage;}catch{storage={getItem(){return null;},setItem(){throw Error('storage');}};}
 const P=window.SoundProgress=SoundProgressModel.create({app,storage});
 let api,profile,report,reportId,lesson,lastSample=-1;
 const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const icons={profile:svg('<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'),report:svg('<path d="M9 3H5v18h14V3h-4M9 2h6v4H9zM8 16v-3m4 3V9m4 7v-5"/>'),family:svg('<circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="12" cy="14" r="2.5"/><path d="M2 21v-6a4 4 0 0 1 6-3.5M22 21v-6a4 4 0 0 0-6-3.5M8 22v-2a4 4 0 0 1 8 0v2"/>'),close:svg('<path d="m6 6 12 12M18 6 6 18"/>'),lock:svg('<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>'),plan:svg('<path d="M9 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-4M9 2h6v4H9zM8 12l2 2 4-4M8 17h8"/>')};
 const escape=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const host=document.querySelector('.header-actions');
 function control(label,icon,kind){const b=document.createElement('button');b.type='button';b.className='suite-icon';b.innerHTML=icons[icon];b.title=label;b.setAttribute('aria-label',label);b.dataset.suiteControl=kind;b.setAttribute('aria-haspopup','dialog');host.append(b);return b;}
 function pause(){window.dispatchEvent(new Event('suite-navigation-open'));}
 function dialog(id,title){const d=document.createElement('dialog');d.id=id;d.className='suite-dialog sound-dialog';d.dir='rtl';d.innerHTML=`<header><h2 id="${id}-title" tabindex="-1">${title}</h2><button class="suite-icon" type="button" data-close-sound aria-label="إغلاق">${icons.close}</button></header>`;d.setAttribute('aria-labelledby',id+'-title');d.querySelector('button').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target!==d||(id==='sound-profile'&&!P.active()))return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});document.body.append(d);return d;}
 function show(d){pause();document.querySelectorAll('dialog[open]').forEach(other=>{if(other!==d)other.close();});if(!d.open)d.showModal();d.querySelector('h2').focus();}
 function change(id){window.dispatchEvent(new Event(app+'-profile-beforechange'));pause();if(!P.activate(id))return;profile?.close();location.hash='/home';api?.render();window.dispatchEvent(new Event('sound-profile-change'));}
 // Child accounts window, the same layout as VB-MAPP: title and close, one add row, then search/sort and the list.
 async function openProfile(name){
  if(P.children().length&&!await window.ChildAccountGate.request())return;pause();
  if(!profile){
   profile=document.createElement('dialog');profile.className='suite-account-dialog';profile.id='sound-profile';profile.dir='rtl';profile.setAttribute('aria-labelledby','sound-profile-title');
   profile.innerHTML=`<div class="account-head"><h2 id="sound-profile-title">حسابات الأطفال</h2><div class="account-head-tools"><button type="button" data-close-sound aria-label="إغلاق" title="إغلاق">${icons.close}</button></div></div><form class="account-add"><label for="sound-child-name">فتح أو إضافة طفل</label><div class="account-add-row"><input id="sound-child-name" name="name" autocomplete="off" maxlength="60" required dir="auto" placeholder="اسم الطفل"><button type="submit">دخول / إضافة</button></div></form><p class="account-error" role="status" data-profile-status></p><div data-sound-accounts></div>`;
   document.body.append(profile);
   profile.querySelector('[data-close-sound]').onclick=()=>{if(P.active())profile.close();};
   profile.querySelector('form').onsubmit=e=>{e.preventDefault();const child=P.add(profile.querySelector('#sound-child-name').value.replace(/\s+/g,' '));if(child)change(child.id);};
   profile.addEventListener('cancel',e=>{if(!P.active())e.preventDefault();});
  }
  window.SuiteAccounts.render(profile.querySelector('[data-sound-accounts]'),P.children(),child=>{
   const b=document.createElement('button');b.type='button';b.textContent=child.name;b.onclick=()=>child.id===P.active()?.id?profile.close():change(child.id);
   return window.SuiteAccounts.row(child,b);
  });
  profile.querySelector('#sound-child-name').value=typeof name==='string'?name:'';profile.querySelector('[data-close-sound]').hidden=!P.active();profile.querySelector('[data-profile-status]').textContent=P.storageOK()?'':'تعذّر الحفظ. سيبقى الحساب في هذه النافذة فقط.';
  pause();document.querySelectorAll('dialog[open]').forEach(other=>{if(other!==profile)other.close();});if(!profile.open)profile.showModal();profile.querySelector('#sound-child-name').focus();
 }
 const skillNames={detection:'اكتشاف الصوت',identification:'التعرف على الصوت',duration:'طويل وقصير',discrimination:'التمييز السمعي',pair:'تمييز أصوات الكلام',memory:'الذاكرة',matching:'المطابقة','ling-detection':'اكتشاف أصوات لينغ','ling-identification':'التعرف على أصوات لينغ',listening:'الاستماع'};
 // Bars only (no pie or ring charts): one overall bar, one bar per activity, then the last test sessions.
 function bar(label,correct,total,note=''){const value=total?Math.round(correct/total*100):0;return `<article><header><b>${escape(label)}</b><span dir="ltr">${total?`${correct} / ${total} · ${value}%`:'—'}</span></header><div class="sound-skill-track" role="img" aria-label="${escape(label)}: ${correct} من ${total}"><span style="width:${value}%"></span></div>${note?`<small>${note}</small>`:''}</article>`;}
 function totals(groups){const rows=[...groups.values()];return {rows,total:rows.reduce((n,row)=>n+row.total,0),correct:rows.reduce((n,row)=>n+row.correct,0),practice:rows.reduce((n,row)=>n+row.practice,0)};}
 function reportGraphics(data,groups){
  const {rows,total,correct,practice}=totals(groups);
  const recent=data.sessions.filter(session=>session.kind==='assessment'&&session.records.length).slice(-6);
  return `<section class="sound-visual-report" aria-label="ملخص التقدم"><div class="sound-report-stats"><div><b>${correct}</b><span>صحيحة</span></div><div><b>${total-correct}</b><span>تحتاج تدريبًا</span></div><div><b>${practice}</b><span>تدريب واستماع</span></div></div><div class="sound-skill-charts">${bar('كل الاختبارات',correct,total)}${rows.map(row=>bar(skillNames[row.skill]||row.skill,row.correct,row.total,`${row.practice} تدريب واستماع${row.partial?' · '+row.partial+' جلسات غير مكتملة':''}`)).join('')}</div>${recent.length?`<h4 class="sound-report-sub">آخر الاختبارات</h4><div class="sound-recent-sessions" aria-label="آخر الاختبارات">${recent.map(session=>{const success=session.records.filter(row=>row.correct).length,percent=Math.round(success/session.records.length*100);return `<div><span class="sound-session-bar" style="--score:${percent}%" role="img" aria-label="${escape(session.activity)}: ${success} من ${session.records.length}"><i></i></span><b dir="ltr">${percent}%</b><small>${new Date(session.date).toLocaleDateString('ar',{month:'numeric',day:'numeric'})}</small></div>`;}).join('')}</div>`:''}</section>`;
 }
 function recordMarks(session){
  return `<div class="sound-response-marks">${session.records.map(row=>`<span class="sound-response-mark ${session.kind==='practice'?'practice':row.correct?'correct':'incorrect'}" title="${escape(row.label)}" aria-label="${escape(row.label)}: ${session.kind==='practice'?'تدريب واستماع':row.correct?'صحيحة':'غير صحيحة'}">${session.kind==='practice'?svg('<path d="m9 5 10 7-10 7Z"/>'):row.correct?svg('<path d="m5 12 4 4L19 6"/>'):icons.close}</span>`).join('')}</div>`;
 }
 function groupsOf(sessions){const groups=new Map();for(const session of sessions){const row=groups.get(session.skill)||{skill:session.skill,practice:0,correct:0,total:0,partial:0};if(session.kind==='practice')row.practice+=session.records.length;else for(const r of session.records){row.total++;row.correct+=Number(r.correct);}if(session.partial)row.partial++;groups.set(session.skill,row);}return groups;}
 function openReport(id){
  const data=P.report(id);if(!data)return;reportId=data.child.id;
  if(!report){report=dialog('sound-report','تقرير الطفل');report.insertAdjacentHTML('beforeend','<div data-sound-report-body></div><button type="button" class="button sound-print-button" data-print-report>'+icons.report+'<span>طباعة التقارير</span></button><p role="status" data-report-status></p>');report.querySelector('[data-print-report]').onclick=()=>printReports();}
  const groups=groupsOf(data.sessions);
  report.querySelector('[data-sound-report-body]').innerHTML=`<h3>${escape(data.child.name)} · ${labels[app]}</h3>${data.sessions.length?`${reportGraphics(data,groups)}<details class="sound-report-table"><summary>تفاصيل الأنشطة</summary><div class="table-wrap"><table><thead><tr><th>النشاط</th><th>الاستجابات الصحيحة</th><th>محاولات التدريب</th></tr></thead><tbody>${[...groups.values()].map(row=>`<tr><th>${skillNames[row.skill]||escape(row.skill)}</th><td dir="ltr">${row.total?`${row.correct} / ${row.total} (${Math.round(row.correct/row.total*100)}%)`:'—'}</td><td>${row.practice}</td></tr>`).join('')}</tbody></table></div></details><p class="subtle">التدريب منفصل عن الاختبار. تشمل الأرقام الاستجابات المسجلة في الجلسات غير المكتملة، ولا تعني اكتساب المهارة.</p><details><summary>الجلسات (${data.sessions.length})</summary>${[...data.sessions].reverse().map(session=>`<article class="sound-session"><b>${escape(session.activity)}</b><p>${new Date(session.date).toLocaleDateString('ar')} · ${session.kind==='practice'?'تدريب':'اختبار'} · ${session.partial?'غير مكتملة':'مكتملة'}</p>${recordMarks(session)}<p>${[...new Set(session.records.map(r=>r.label))].map(escape).join('، ')}</p></article>`).join('')}</details>`:'<p>لا توجد محاولات مسجلة لهذا الطفل في هذا التطبيق بعد.</p>'}`;
  // Therapist mode open: the plan's goals (in progress, achieved, suggested) follow the summary.
  const goals=window.InterventionPlan?.isActive()?window.InterventionPlan.reportSection():null;if(goals)report.querySelector('[data-sound-report-body]').append(goals);
  report.querySelector('[data-report-status]').textContent='';
  show(report);
 }
 // «طباعة التقارير»: choose the reports, each one downloads as its own PDF.
 let printDialog;
 function choosePrint(){
  const choices=[['summary','ملخص التقدم','الاختبارات والتدريب لكل نشاط']];
  if(window.InterventionPlan?.isActive()&&P.intervention()?.goals?.length)choices.push(['goals','أهداف خطة التدخل','قيد العمل · تحققت · مقترحة']);
  if(!printDialog){printDialog=document.createElement('dialog');printDialog.className='suite-dialog sound-print-dialog';printDialog.dir='rtl';printDialog.setAttribute('aria-labelledby','sound-print-title');printDialog.innerHTML=`<h2 id="sound-print-title">طباعة التقارير</h2><p>اختر التقارير. كل تقرير يُنزَّل في ملف PDF منفصل.</p><div class="sound-print-list" role="group" aria-label="التقارير"></div><footer><button type="button" class="button primary" data-go>تنزيل</button><button type="button" class="button" data-cancel>إلغاء</button></footer>`;document.body.append(printDialog);}
  const list=printDialog.querySelector('.sound-print-list'),go=printDialog.querySelector('[data-go]');
  list.innerHTML=choices.map(([id,label,hint])=>`<button type="button" class="sound-print-choice" data-choice="${id}" aria-pressed="true"><span class="sound-print-tick" aria-hidden="true">${svg('<path d="m5 12 4.5 4.5L19 7"/>')}</span><span><b>${label}</b><small>${hint}</small></span></button>`).join('');
  const sync=()=>{go.disabled=!list.querySelector('[aria-pressed=true]');};
  list.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true'));sync();});sync();
  printDialog.showModal();go.focus();
  return new Promise(resolve=>{go.onclick=()=>{const ids=[...list.querySelectorAll('[aria-pressed=true]')].map(button=>button.dataset.choice);printDialog.close();resolve(ids);};printDialog.querySelector('[data-cancel]').onclick=()=>{printDialog.close();resolve(null);};printDialog.oncancel=()=>resolve(null);});
 }
 const fileName=text=>String(text||'').replace(/[^\p{L}\p{N}_-]/gu,'_');
 async function printReports(){
  const data=P.report(reportId);if(!data)return;const status=report.querySelector('[data-report-status]');
  const chosen=await choosePrint();if(!chosen?.length)return;status.textContent='جارٍ تجهيز التقارير…';
  try{
   if(chosen.includes('summary'))(await summaryPdf(data)).save(`${fileName(labels[app])}-${fileName(data.child.name)}-${new Date().toISOString().slice(0,10)}.pdf`);
   // A short pause between files, so the browser keeps both downloads.
   if(chosen.includes('summary')&&chosen.includes('goals'))await new Promise(r=>setTimeout(r,900));
   if(chosen.includes('goals'))(await window.InterventionPlan.reportPdf()).save(`${fileName(labels[app])}-الأهداف-${fileName(data.child.name)}.pdf`);
   status.textContent='';
  }catch(error){console.error(error);status.textContent='تعذّر إنشاء التقرير. أعد المحاولة.';}
 }
 // The summary drawn on A4 canvases (Cairo font, right to left) and saved through jsPDF.
 async function summaryPdf(data){
  const jsPDF=window.jspdf?.jsPDF;if(!jsPDF)throw Error('PDF library unavailable');
  await document.fonts.load('700 32px Cairo');await document.fonts.load('400 24px Cairo');await document.fonts.ready;
  const groups=groupsOf(data.sessions),{rows,total,correct,practice}=totals(groups);
  const W=1240,H=1754,M=90,pages=[];let canvas,c,y;
  const page=()=>{canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;c=canvas.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,W,H);c.direction='rtl';y=M;pages.push(canvas);};
  const text=(value,x,size,weight=400,color='#22445a',align='right')=>{c.font=`${weight} ${size}px Cairo`;c.fillStyle=color;c.textAlign=align;c.direction=/[؀-ۿ]/.test(String(value))?'rtl':'ltr';c.fillText(String(value),x,y);};
  const need=h=>{if(y+h>H-M)page();};
  const drawBar=(label,right,all,note)=>{need(110);y+=40;text(label,W-M,30,700);text(all?`${right} / ${all} · ${Math.round(right/all*100)}%`:'—',M,26,700,'#5c7285','left');y+=22;const left=M,width=W-2*M;c.fillStyle='#eaf0f4';c.beginPath();c.roundRect(left,y,width,26,13);c.fill();if(all){c.fillStyle='#16a34a';c.beginPath();c.roundRect(left+width*(1-right/all),y,width*right/all,26,13);c.fill();}y+=26;if(note){y+=34;text(note,W-M,22,400,'#5c7285');}y+=16;};
  page();
  text(labels[app],W-M,24,700,'#0369a1');y+=58;text(`تقرير التقدم · ${data.child.name}`,W-M,46,800);y+=46;text(new Intl.DateTimeFormat('en-GB').format(new Date()),W-M,24,400,'#5c7285');y+=30;
  c.strokeStyle='#dceaf4';c.lineWidth=2;c.beginPath();c.moveTo(M,y);c.lineTo(W-M,y);c.stroke();y+=40;
  if(!data.sessions.length){text('لا توجد محاولات مسجلة بعد.',W-M,28);}
  else{
   text(`صحيحة: ${correct} · تحتاج تدريبًا: ${total-correct} · تدريب واستماع: ${practice}`,W-M,26,700,'#22445a');y+=20;
   drawBar('كل الاختبارات',correct,total);
   for(const row of rows)drawBar(skillNames[row.skill]||row.skill,row.correct,row.total,`${row.practice} تدريب واستماع`);
   const recent=data.sessions.filter(session=>session.kind==='assessment'&&session.records.length).slice(-8).reverse();
   if(recent.length){need(120);y+=56;text('آخر الاختبارات',W-M,32,800);y+=10;for(const session of recent){need(60);y+=46;const ok=session.records.filter(r=>r.correct).length;text(`${session.activity} · ${new Intl.DateTimeFormat('en-GB').format(new Date(session.date))}`,W-M,24,400);text(`${ok} / ${session.records.length} · ${Math.round(ok/session.records.length*100)}%`,M,24,700,'#5c7285','left');}}
   need(80);y+=64;text('التدريب منفصل عن الاختبار. الأرقام لا تعني اكتساب المهارة.',W-M,20,400,'#7a8e9b');
  }
  const doc=new jsPDF({unit:'mm',format:'a4',compress:true});doc.setProperties({title:`${labels[app]} - ${data.child.name}`,creator:labels[app]});
  pages.forEach((sheet,index)=>{if(index)doc.addPage();doc.addImage(sheet.toDataURL('image/jpeg',.92),'JPEG',0,0,210,297);});
  return doc;
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
  const text=targets.length?`مرحبًا ماما وبابا\nأنا ${child.name}، اشتغلت على ${skills.join('، ')}.\nأصواتنا: ${targets.join('، ')}.\n\nنشاط البيت:\n${task}\nنلعب دقيقتين أو ثلاث بصوت مريح، من دون ضغط. الإشارة أو الحركة استجابة مقبولة.`:'لم نسجّل نشاطًا بعد. نلعب أولًا، ثم نختار نشاط البيت من الأصوات التي عملنا عليها.';
  lesson.dataset.storage=`speech-sound-lesson:${app}:${child.id}:${latest.at(-1)?.id||'empty'}:${records.length}`;let saved;try{saved=storage.getItem(lesson.dataset.storage);}catch{}
  lesson.querySelector('textarea').value=saved||text;lesson.querySelector('[role=status]').textContent='';lesson.querySelector('[data-share-lesson]').hidden=!navigator.share;show(lesson);
 }
 // Therapist mode (013) and the intervention plan, handled by assets/intervention.js.
 {const lock=control('وضع المعالج مقفل · اضغط وأدخل الرمز','lock','therapist');lock.dataset.therapist='';lock.removeAttribute('aria-haspopup');const planButton=control('خطة التدخل','plan','plan');planButton.dataset.openPlan='';planButton.hidden=true;}
 {const profileButton=control('حسابات الأطفال','profile','profile');profileButton.onclick=()=>openProfile();
  // The active child's drawn head replaces the outline person icon.
  const showHead=()=>{const chip=P.active()&&window.SuiteAccounts?.avatarFor(P.active());if(!chip)return;const holder=document.createElement('span');holder.className='suite-account-chip';holder.append(chip);profileButton.querySelector('.suite-account-chip,svg')?.replaceWith(holder);profileButton.setAttribute('aria-label','حسابات الأطفال: '+P.active().name);profileButton.title=profileButton.getAttribute('aria-label');};
  showHead();window.addEventListener('suite-avatar-change',showHead);window.addEventListener('sound-profile-change',showHead);}control('تقرير الطفل','report','report').onclick=()=>openReport();control('درس البيت للأهل','family','family').onclick=openLesson;
 document.addEventListener('click',event=>{if(event.target.closest('[data-sound-download]'))document.getElementById('install').click();});
 window.SoundProfile={open:openProfile};window.SoundReports={open:openReport};
 window.SoundSuite={bind(value){api=value;if(!P.active())void openProfile();},rendered(){window.dispatchEvent(new Event('sound-view-change'));},pause,openLesson,skillNames};
 window.addEventListener('storage',event=>{if(event.key===`${app}-children-v1`){pause();api?.render();if(!P.active())void openProfile();if(report?.open)openReport(reportId);}});
 const storageStatus=document.createElement('p');storageStatus.className='sound-storage-error';storageStatus.setAttribute('role','alert');storageStatus.hidden=true;document.body.append(storageStatus);window.addEventListener('sound-progress-change',()=>{storageStatus.hidden=P.storageOK();storageStatus.textContent=P.storageOK()?'':'تعذّر حفظ التقدم على الجهاز. أبقوا النافذة مفتوحة وانسخوا النتائج قبل الإغلاق.';});
 window.addEventListener('suite-navigation-open',()=>api?.stop());
})();
