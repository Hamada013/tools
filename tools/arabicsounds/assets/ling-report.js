// Screening groups follow Advanced Bionics' Ling interpretation guidance:
// https://www.advancedbionics.com/content/dam/advancedbionics/Documents/libraries/Tools-for-Toddlers/tools-for-parents/The-Ling-Six-Sound-Check.pdf
// These broad groups describe session errors, not measured hearing thresholds.
export const FREQUENCY_GROUPS=[
 {id:'low',label:'منخفضة',sounds:['م','و']},
 {id:'middle',label:'متوسطة',sounds:['ا','ي']},
 {id:'high',label:'عالية',sounds:['ش','س']}
];
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const responseName=value=>({yes:'استجاب',no:'لم يستجب',none:'لا استجابة',missing:'لم يُفحص'})[value]||'لم يُفحص';
const groupFor=sound=>FREQUENCY_GROUPS.find(group=>group.sounds.includes(sound));
export const lingDate=date=>new Date(date).toLocaleDateString('en-GB',{year:'numeric',month:'2-digit',day:'2-digit'});

export function analyseLing(record){
 const identification=record.mode==='identification';
 const rows=record.answers.map((answer,index)=>({...answer,trial:index+1,success:identification?answer.correct===true:answer.response==='yes'}));
 const correct=rows.filter(row=>row.success),incorrect=rows.filter(row=>!row.success);
 const percent=rows.length?correct.length/rows.length*100:0;
 const groups=FREQUENCY_GROUPS.map(group=>{
  const tested=rows.filter(row=>group.sounds.includes(row.sound));
  const missed=tested.filter(row=>!row.success);
  return {...group,total:tested.length,correct:tested.length-missed.length,missed:[...new Set(missed.map(row=>row.sound))]};
 });
 const affected=groups.filter(group=>group.missed.length>0);
 return {identification,rows,correct,incorrect,percent,passed:identification&&rows.length===10&&percent>=80,groups,affected,
  pattern:affected.length>1?'multiple':affected[0]?.id||'none'};
}

export function lingSummary(record){
 const a=analyseLing(record);
 const score=`<bdi dir="ltr">${a.correct.length} / ${a.rows.length}</bdi>`;
 let outcome;
 if(a.identification){
  const complete=a.rows.length===10;
  outcome=`<p class="ling-outcome ${a.passed?'pass':'review'}">${complete?(a.passed?'اجتاز معيار الجلسة':'لم يجتز معيار الجلسة'):'الجلسة غير مكتملة'} · <bdi dir="ltr">${Math.round(a.percent)}%</bdi></p><p>${score} إجابات صحيحة · معيار الاجتياز: <bdi dir="ltr">80%</bdi> أو أكثر.</p><p>المستوى ${record.size-1} · ${record.size} بطاقات</p>`;
 }else{
  outcome=`<p>${score} أصوات مع استجابة مسجلة · لم يستجب: ${a.rows.filter(row=>row.response==='no').length} · لا استجابة: ${a.rows.filter(row=>row.response==='none').length}</p>`;
 }
 const missed=a.affected.length?
  `<p class="ling-error-pattern">${a.pattern==='multiple'?`الأخطاء موزعة على مجموعات تردد متعددة: ${a.affected.map(group=>`${group.label} (${group.missed.join('، ')})`).join('؛ ')}`:`الأخطاء في مجموعة الترددات ال${a.affected[0].label}: ${a.affected[0].missed.join('، ')}`}.</p>`:
  '<p class="ling-error-pattern">لا توجد أخطاء مسجلة في الأصوات المفحوصة.</p>';
 const coverage=a.groups.map(group=>`${group.label}: ${group.total?`<bdi dir="ltr">${group.correct} / ${group.total}</bdi>`:'لم تُفحص'}`).join(' · ');
 const catchSummary=record.catchTrials?.length?`<p class="ling-catch-summary">جولات السكوت: ${record.catchTrials.filter(row=>row.correct).length} / ${record.catchTrials.length} استجابات صحيحة؛ الإبلاغ عن صوت أثناء السكوت: ${record.catchTrials.filter(row=>row.response).length}.</p>`:'';
 return `<section class="ling-report-summary" aria-label="ملخص الجلسة"><h2>ملخص الجلسة</h2>${outcome}${catchSummary}${missed}<p class="ling-frequency-coverage">الاستجابات الصحيحة حسب المجموعة: ${coverage}</p><p class="ling-summary-note">النتيجة تخص الأصوات المفحوصة في هذه الجلسة؛ مجموعات التردد تقريبية ولا تحدد سبب الخطأ أو تشخّص ضعف السمع.</p></section>`;
}

export function lingTables(record){
 const a=analyseLing(record);
 return [[true,a.correct],[false,a.incorrect]].map(([success,rows])=>{
  const heading=a.identification?(success?'الإجابات الصحيحة':'الإجابات غير الصحيحة'):(success?'الأصوات التي استجاب لها':'الأصوات دون استجابة مسجلة');
  const columns=a.identification?'<th>المحاولة</th><th>الصوت</th><th>اختيار الطفل</th><th>التردد</th>':'<th>الصوت</th><th>الاستجابة</th><th>التردد</th>';
  const cells=rows.map(row=>`<tr>${a.identification?`<td>${row.trial}</td><th>${escape(row.sound)}</th><td>${escape(row.choice)}</td>`:`<th>${escape(row.sound)}</th><td>${responseName(row.response)}</td>`}<td>${groupFor(row.sound)?.label||'غير مصنف'}</td></tr>`).join('');
  return `<section class="ling-result-group ${success?'correct':'incorrect'}"><h2>${heading} (${rows.length})</h2><div class="table-wrap"><table data-result="${success?'correct':'incorrect'}"><thead><tr>${columns}</tr></thead><tbody>${cells||`<tr class="ling-empty"><td colspan="${a.identification?4:3}">لا توجد ${success?'استجابات صحيحة':'أخطاء'} مسجلة.</td></tr>`}</tbody></table></div></section>`;
 }).join('');
}

// Keep a fixed readable width. Break long reports at sections/paragraphs instead of
// shrinking an entire report onto one page or slicing through Arabic text.
export async function addLingPDFPages(doc,stage){
 const width=186,height=273,scale=2;
 const canvas=await html2canvas(stage,{scale,backgroundColor:'#fff',windowWidth:900});
 const bounds=stage.getBoundingClientRect(),pixelsPerMM=canvas.width/width;
 const pagePixels=Math.floor(height*pixelsPerMM);
 const safeBreaks=[...stage.children].filter(node=>!node.matches('h1,h2')).map(node=>Math.round((node.getBoundingClientRect().bottom-bounds.top)*scale));
 safeBreaks.push(canvas.height);safeBreaks.sort((a,b)=>a-b);
 let top=0,page=0;
 while(top<canvas.height){
  const limit=Math.min(top+pagePixels,canvas.height);
  const end=limit===canvas.height?limit:safeBreaks.filter(y=>y>top+80&&y<=limit).at(-1)||limit;
  const slice=document.createElement('canvas');slice.width=canvas.width;slice.height=end-top;
  slice.getContext('2d').drawImage(canvas,0,top,canvas.width,end-top,0,0,canvas.width,end-top);
  if(page++)doc.addPage();
  doc.addImage(slice.toDataURL('image/jpeg',.95),'JPEG',12,12,width,(end-top)/pixelsPerMM);top=end;
 }
}
