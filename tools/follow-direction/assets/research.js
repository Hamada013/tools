/* Device-local research snapshot. Raw outcomes remain distinct from calculated flags. */
((root)=>{
 'use strict';
 const columns={
  Cases:['case_id','child_uuid','child_name','created_utc','sessions','screen_sessions','practice_sessions','latest_complete_screen_utc','checked_skills'],
  Sessions:['case_id','session_uuid','mode','skill_code','started_utc','finished_utc','state','planned','recorded','independent','assisted','incorrect','skipped','pending','assessed','independent_rate'],
  Skills:['case_id','session_uuid','mode','skill_code','skill_ar','started_utc','planned','independent','assisted','incorrect','skipped','pending','assessed','independent_rate'],
  Records:['case_id','session_uuid','mode','skill_code','item_id','audio_id','instruction_ar','outcome','response_utc','recorded','assessed','independent','assisted','incorrect','skipped','pending']
 };
 const excelDate=iso=>{if(!iso)return null;const ms=Date.parse(iso);return Number.isFinite(ms)?ms/86400000+25569:null;};
 const rate=(a,n)=>n?a/n:null;
 const count=results=>results.reduce((a,r)=>{a[r.outcome]++;return a;},{independent:0,help:0,incorrect:0,skip:0});
 const isAdmin=c=>c.role==='admin'||c.name.normalize('NFKC').trim().toLowerCase()==='hamada';
 function collect(data,bank,now=new Date().toISOString()){
  const children=data.children.filter(c=>!isAdmin(c)).slice().sort((a,b)=>a.caseNumber-b.caseNumber),seen=new Set(),rows={Cases:[],Sessions:[],Skills:[],Records:[]},items=new Map(bank.items.map(i=>[i.id,i]));
  const months=new Map();let excluded=data.children.length-children.length;
  for(const child of children){
   if(!Number.isSafeInteger(child.caseNumber)||child.caseNumber<1||seen.has(child.caseNumber))throw Error('أرقام الحالات غير صالحة.');seen.add(child.caseNumber);
   const complete=child.sessions.filter(s=>s.mode==='screen'&&s.complete).at(-1),checked=bank.groups.filter(g=>g.items.filter(i=>i.phase==='screen').every(i=>complete?.results.some(r=>r.item===i.id&&r.outcome==='independent'))).length;
   rows.Cases.push([child.caseNumber,child.id,child.name,excelDate(child.created),child.sessions.length,child.sessions.filter(s=>s.mode==='screen').length,child.sessions.filter(s=>s.mode==='practice').length,excelDate(complete?.finished),checked]);
   for(const session of child.sessions){
    const c=count(session.results),pending=session.items.length-session.results.length,assessed=c.independent+c.help+c.incorrect,state=session.complete?'complete':session.ended?'ended_early':'in_progress';
    rows.Sessions.push([child.caseNumber,session.id,session.mode,session.group||'all',excelDate(session.started),excelDate(session.finished),state,session.items.length,session.results.length,c.independent,c.help,c.incorrect,c.skip,pending,assessed,rate(c.independent,assessed)]);
    const month=/^\d{4}-\d{2}/.exec(session.started)?.[0];
    if(month){if(!months.has(month))months.set(month,{screen:{independent:0,assessed:0},practice:{independent:0,assessed:0}});const m=months.get(month)[session.mode];m.independent+=c.independent;m.assessed+=assessed;}
    const resultMap=new Map(session.results.map(r=>[r.item,r]));
    for(const group of bank.groups){const planned=session.items.filter(id=>items.get(id)?.group===group.id);if(!planned.length)continue;const outcomes=session.results.filter(r=>items.get(r.item)?.group===group.id),n=count(outcomes),assessed=n.independent+n.help+n.incorrect;
     rows.Skills.push([child.caseNumber,session.id,session.mode,group.id,group.label,excelDate(session.started),planned.length,n.independent,n.help,n.incorrect,n.skip,planned.length-outcomes.length,assessed,rate(n.independent,assessed)]);
    }
    for(const id of session.items){const item=items.get(id);if(!item)throw Error('تعليمات غير معروفة: '+id);const r=resultMap.get(id),outcome=r?.outcome||'pending';rows.Records.push([child.caseNumber,session.id,session.mode,item.group,id,item.audio,item.prompt,outcome,excelDate(r?.at),r?1:0,['independent','help','incorrect'].includes(outcome)?1:0,outcome==='independent'?1:0,outcome==='help'?1:0,outcome==='incorrect'?1:0,outcome==='skip'?1:0,outcome==='pending'?1:0]);}
   }
  }
  for(const [name,list]of Object.entries(rows))if(list.length>1048575)throw Error('عدد الصفوف يتجاوز سعة ملف Excel في ورقة '+name+'.');
  const summary={};for(const mode of ['screen','practice'])summary[mode]=bank.groups.map(g=>{const list=rows.Skills.filter(r=>r[2]===mode&&r[3]===g.id);return [g.label,...[7,8,9,10,11,12].map(index=>list.reduce((sum,r)=>sum+r[index],0))];});
  const timeline=[...months].sort(([a],[b])=>a.localeCompare(b)).map(([month,m])=>[month,m.screen.independent,m.screen.assessed,rate(m.screen.independent,m.screen.assessed),m.practice.independent,m.practice.assessed,rate(m.practice.independent,m.practice.assessed)]);
  return {schema:1,sourceId:data.researchSourceId||'',exported:now,bankVersion:bank.version,excluded,columns,rows,summary,timeline};
 }
 const api={collect,columns,excelDate};if(typeof module!=='undefined')module.exports=api;else root.FollowResearch=api;
})(globalThis);
