const assert=require('node:assert/strict');
const {create,homeActivity}=require('../shared/session-homework.js');
const values=new Map([['voc-children-v1','existing progress stays untouched']]);
const storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
let child={id:'ali',name:'علي'};
const make=app=>create({app,storage,owner:()=>child});
const voc=make('voc');assert.equal(voc.finish(),null,'No invented homework before any work');
voc.record({activity:'الاستماع',key:'1_1',label:'كرة'});
voc.record({activity:'المطابقة',key:'1_1',label:'كرة'});
assert.equal(Object.keys(voc.current().items).length,1,'The same target is deduplicated across activities');
let note=make('voc').finish();assert.match(note.text,/^مرحبًا ماما وبابا/);assert.match(note.text,/أنا علي/);assert.doesNotMatch(note.text,/الاستماع|المطابقة/);assert.match(note.text,/بلا تقييم/);assert.match(note.text,/الإشارة مقبولة/);assert.equal(voc.current(),null);
assert.equal(voc.finish().text,note.text,'Reopening shows the last session instead of an empty new session');
voc.edit('مرحبًا ماما وبابا، رسالتنا المعدّلة');assert.equal(make('voc').finish().text,'مرحبًا ماما وبابا، رسالتنا المعدّلة');
voc.record({activity:'اختبار الفهم',label:'تفاحة',kind:'assessment',domain:'receptive',correct:0,total:1});
note=voc.finish();assert.match(note.text,/0\/1 محاولات صحيحة/);assert.match(note.text,/نراجع سوا.*تفاحة/);assert.doesNotMatch(note.text,/كرة|المطابقة/,'Ended sessions cannot leak into a new one');
const rows=[{label:'تفاحة',correct:1,total:1}];
voc.capture({id:'paused-game',activity:'استمع واختر',kind:'assessment',domain:'receptive',records:rows});
voc.capture({id:'paused-game',activity:'استمع واختر',kind:'assessment',domain:'receptive',records:rows});
assert.match(voc.finish().text,/1\/1 محاولات صحيحة/,'Repeated saves are idempotent');
voc.capture({id:'paused-game',activity:'استمع واختر',kind:'assessment',domain:'receptive',records:rows});assert.equal(voc.current(),null,'Reloaded old rows do not create a new session');
rows.push({label:'موز',correct:0,total:1});make('voc').capture({id:'paused-game',activity:'استمع واختر',kind:'assessment',domain:'receptive',records:rows});
note=voc.finish();assert.match(note.text,/موز/);assert.doesNotMatch(note.text,/تفاحة/,'Only new work from a resumed game enters the next summary');
assert.equal(make('senb').finish(),null,'App boundaries are independent');
const senb=make('senb');senb.record({activity:'التكرار',label:'ولد يأكل تفاحة',entity:'sentence'});senb.record({activity:'التعبير',label:'ولد يأكل تفاحة',entity:'sentence',kind:'assessment',domain:'expressive',correct:2,total:3});
senb.record({activity:'التعبير',label:'تفاحة',kind:'assessment',domain:'expressive',correct:1,total:1});note=senb.finish();assert.match(note.text,/جمل: ولد يأكل تفاحة/);assert.match(note.text,/2\/3 محاولات صحيحة/);assert.match(note.text,/1\/1 محاولات صحيحة/);
const taffaha=make('taffaha');taffaha.record({activity:'المقاطع',label:'تفاحة',syllables:['تُف','فا','حة'],count:3});note=taffaha.finish();assert.match(note.text,/تُف ـ فا ـ حة \(3 مقاطع\)/);assert.doesNotMatch(note.text,/استجابة صحيحة/);
child={id:'sara',name:'سارة'};assert.equal(make('voc').finish(),null,'Children cannot read another child’s notes');make('voc').record({activity:'المطابقة',label:'قطّة'});assert.match(make('voc').finish().text,/أنا سارة/);
child={id:'ali',name:'علي'};assert.doesNotMatch(make('voc').finish().text,/قطّة|سارة/);
assert.equal(values.get('voc-children-v1'),'existing progress stays untouched','Homework does not change mastery, reports or child progress');
values.set('voc-children-v1',JSON.stringify({deletedChildren:{ali:'deleted'}}));values.delete('speech-homework-v1:voc:ali');voc.record({activity:'old tab',label:'لا تحفظ'});assert.equal(voc.finish(),null);assert.equal(values.has('speech-homework-v1:voc:ali'),false,'A stale tab cannot restore a deleted child’s homework');values.set('voc-children-v1','existing progress stays untouched');
let failures=0;const failed=create({app:'voc',owner:()=>child,storage:{getItem(){return null;},setItem(){throw Error('full');}},onError:()=>failures++});failed.record({activity:'تدريب',label:'بيت'});assert.match(failed.finish().text,/بيت/);assert.equal(failed.storageOK(),false);assert.ok(failures>0,'A storage failure retains a copyable message in memory');
child=null;make('voc').record({label:'لا تحفظ'});assert.equal(make('voc').finish(),null);
console.log('PASS: explicit session boundaries, reloads, edits, per-child/app isolation, ungraded practice, accurate results, syllable homework, resumed-game deduplication and storage failure.');

for(const app of ['voc','senb','taffaha']){const sample={label:app==='senb'?'ولد يأكل تفاحة':'تفاحة',entity:app==='senb'?'sentence':'word',syllables:['تُف','فا','حة'],count:3};const variants=Array.from({length:10},(_,i)=>homeActivity(app,[sample],i));assert.equal(new Set(variants).size,10);for(const text of variants){assert.ok(text.includes(sample.label));assert.ok(text.split(/\s+/).length<85);assert.doesNotMatch(text,/undefined|أتقنت/);}}
console.log('PASS: ten distinct short home activities per app, each tied to a real session target.');

// Six-hour boundaries clear generated and edited text without replaying old result arrays.
const originalNow=Date.now;let now=originalNow();Date.now=()=>now;
try{
 child={id:'expiry',name:'ليان'};const expiring=make('voc');
 expiring.capture({id:'resumed',activity:'اسم لعبة طويل',kind:'practice',records:[{label:'قديم'}]});
 expiring.finish();expiring.edit('رسالة قديمة معدلة');expiring.editLesson('lesson','درس قديم');
 now+=6*60*60*1000-1;assert.match(expiring.finish().text,/قديمة معدلة/);
 now++;assert.equal(expiring.current(),null);assert.equal(expiring.finish(),null);assert.equal(expiring.lessonDraft('lesson'),null);
 expiring.capture({id:'resumed',records:[{label:'قديم'}]});assert.equal(expiring.current(),null);
 expiring.capture({id:'resumed',records:[{label:'قديم'},{label:'جديد'}]});
 const fresh=expiring.finish().text;assert.match(fresh,/جديد/);assert.doesNotMatch(fresh,/قديم|اسم لعبة/);
 assert.ok(fresh.length<650,'Parent note stays concise');
}finally{Date.now=originalNow;}
console.log('PASS: six-hour expiry clears all message drafts, preserves ingestion cursors and starts a fresh summary.');
