const assert = require('node:assert/strict');
const { create, STORAGE } = require('../assets/progress.js');
const R = require('../assets/reports.js');
const map = new Map(); const storage = { getItem: key => map.get(key), setItem: (key,value) => map.set(key,value) };
const p = create(storage);
assert.equal(p.children().find(child=>child.name==='Hamada').role,'admin');
p.signIn('سارة'); const childId=p.active().id;
for(const domain of ['receptive','expressive'])for(const level of ['easy','moderate','advanced'])p.record(domain,[{key:'1_1',correct:true}],level);assert.equal(p.mastered('1_1'),true);
const now=new Date(2026,9,17,14,0);
const dates=[new Date(2026,9,17,10),new Date(2026,9,12,10),new Date(2026,8,25,10),new Date(2026,7,1,10)];
for(let i=0;i<dates.length;i++) p.logSession({id:`session-${i}`,date:dates[i].toISOString(),source:'test',kind:'assessment',domain:'receptive',records:[{key:'1_1',correct:i?1:3,total:i?2:4}]});
p.logSession({id:'production',date:dates[0].toISOString(),source:'rapid',kind:'assessment',domain:'expressive',records:[{key:'2_1',correct:1,total:1}]});
p.logSession({id:'practice',date:dates[0].toISOString(),source:'workplace',kind:'practice',domain:'receptive',records:[{key:'3_1',correct:10,total:10}]});
p.logSession({id:'session-0',date:dates[0].toISOString(),source:'test',records:[]});assert.equal(p.active().sessions.length,6,'Duplicate finish notifications are idempotent');
assert.equal(p.reportChildren(childId)[0].id,childId,'Each child can read their own report');
assert.equal(p.reportChildren('another-child')[0].id,childId,'A regular profile cannot select another child report');
const before=JSON.stringify(p.active().words);p.signIn(' HAMADA ');assert.equal(p.isAdmin(),true);assert.equal(p.mastered('1_1'),false);
for(const domain of ['receptive','expressive'])for(const level of ['easy','moderate','advanced'])p.record(domain,[{key:'1_1',correct:true}],level);assert.deepEqual(p.active().words,{});
const children=p.reportChildren(childId);assert.equal(children.length,1);assert.equal(JSON.stringify(children[0].words),before);
for(const [period,count]of[['day',3],['week',4],['month',5],['all',6]]){
 const result=R.summarize(children,period,now);assert.equal(result.sessions,count,period);
 assert.equal(R.percent(result.domains.expressive),100);assert.equal(result.categories.some(category=>category.id===3),true);
}
const day=R.summarize(children,'day',now);assert.equal(R.percent(day.domains.receptive),75,'Practice is excluded from assessment percentages');assert.equal(day.date,'17/10/2026');
assert.equal(R.percent({correct:0,total:0}),null,'No score is different from a failed score');
p.signIn('سارة');assert.equal(p.mastered('1_1'),true);assert.equal(JSON.stringify(p.active().words),before);
p.logSession({id:'partial',date:dates[0].toISOString(),source:'test',kind:'assessment',domain:'receptive',partial:true,records:[{key:'1_2',correct:0,total:1}]});
p.logSession({id:'partial',date:dates[0].toISOString(),source:'test',kind:'assessment',domain:'receptive',partial:false,records:[{key:'1_2',correct:0,total:1},{key:'1_3',correct:1,total:1}]});
assert.equal(p.active().sessions.filter(session=>session.id==='partial').length,1);assert.equal(p.active().sessions.at(-1).partial,false);
const legacy=new Map([[STORAGE,JSON.stringify({schema:1,active:'old',children:[{id:'old',name:'قديم',words:{'1_1':{receptive:{date:dates[0].toISOString(),correct:4,total:5,passed:false}}}}]})]]);
const migrated=create({getItem:key=>legacy.get(key),setItem:(key,value)=>legacy.set(key,value)});assert.equal(migrated.active().sessions[0].legacy,true);migrated.signIn('Hamada');
const summary=R.summarize(migrated.reportChildren(),'all',now);assert.equal(summary.sessions,0);assert.equal(summary.snapshots,1);assert.equal(R.percent(summary.domains.receptive),80);
console.log('PASS: Hamada sandbox, protected child mastery, chronological reports, weighted scores, date filters, partial-session updates and legacy summaries.');

const older = [{name:'تجربة',sessions:[
 {id:'recent',date:new Date(2026,8,1,10).toISOString(),source:'test',domain:'receptive',kind:'assessment',records:[{key:'1_1',correct:1,total:1}]},
 {id:'three-month-old',date:new Date(2026,4,1,10).toISOString(),source:'test',domain:'receptive',kind:'assessment',records:[{key:'1_1',correct:0,total:1}]},
 {id:'older',date:new Date(2026,1,1,10).toISOString(),source:'test',domain:'receptive',kind:'assessment',records:[{key:'1_1',correct:0,total:1}]}]}];
assert.equal(R.summarize(older,'quarter',now).sessions,1);assert.equal(R.summarize(older,'halfyear',now).sessions,2);assert.equal(R.summarize(older,'all',now).sessions,3);
const monthEnd = R.summarize([], 'quarter', new Date(2026,4,31,12));
assert.equal(monthEnd.from,'01/03/2026','Three-month ranges clamp safely at month ends');
assert.equal(R.summarize([],'halfyear',new Date(2026,7,31,12)).from,'01/03/2026');
