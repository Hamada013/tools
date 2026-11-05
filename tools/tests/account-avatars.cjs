const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {assignAvatars}=require('../shared/accounts.js');
const KEY='speech-account-avatars-v1';
function store(){
 const values=new Map([['voc-children-v1','learning-progress-must-stay-intact']]);
 return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};
}
const children=Array.from({length:40},(_,i)=>({id:'child-'+i,name:'طفل '+i,role:'child'}));
const admin={id:'admin',name:'Hamada',role:'admin'},storage=store();
const first=assignAvatars(storage,[admin,...children],()=>.37);
assert.equal(first.size,children.length);
assert.equal(new Set(first.values()).size,children.length,'Every child gets a different avatar');
assert([...first.values()].every(icon=>!icon.includes(' ')),'Ordinary account lists use single icons');
assert([...first.values()].every(icon=>/^[a-z]+$/.test(icon)),'Assignments identify local drawings, never emoji glyphs');
assert.equal(first.has('admin'),false,'Hamada does not take a child icon');
assert.equal(storage.getItem('voc-children-v1'),'learning-progress-must-stay-intact','Avatar assignment never writes learning progress');
assert.deepEqual(assignAvatars(storage,[...children].reverse()),first,'Sorting and reopening keep each assignment');
const added=assignAvatars(storage,[...children,{id:'new-child',name:'جديد'}]);
for(const [id,icon]of first)assert.equal(added.get(id),icon,'New children never change existing icons');
assert(!added.get('new-child').includes(' '),'Use remaining individual icons before combinations');
assert.equal(new Set(added.values()).size,added.size);
for(const app of ['voc','senb','taffaha']){
 const context={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,`../VSS/${app}/assets/accounts.js`),'utf8'),context);
 assert.deepEqual(Object.fromEntries(context.module.exports.assignAvatars(storage,children)),Object.fromEntries(first),app+': the same child keeps its icon');
}
const different=assignAvatars(store(),children,()=>.73);
assert.notDeepEqual([...different.values()],[...first.values()],'Fresh devices randomize assignments');
const crowded=Array.from({length:300},(_,i)=>({id:'large-'+i,name:'طفل '+i}));
const many=assignAvatars(store(),crowded);
assert.equal(many.size,300);
assert.equal(new Set(many.values()).size,300,'Large lists do not wrap around and repeat avatars');
for(const icon of many.values()){const parts=icon.split(' ');assert.equal(new Set(parts).size,parts.length,'A combined avatar never repeats its own icon');}
const malformed=store();malformed.setItem(KEY,JSON.stringify({schema:1,icons:{'child-0':'apple','child-1':'apple','child-2':'invalid','child-3':'🍐'}}));
const repaired=assignAvatars(malformed,children);
assert.equal(repaired.get('child-0'),'apple');
assert([...repaired.values()].every(icon=>/^[a-z]+$/.test(icon)),'Saved emoji avatars migrate to local icon IDs');
assert.equal(new Set(repaired.values()).size,children.length,'Old or corrupted assignments cannot cause duplicates');
const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('full');}};
const memory=assignAvatars(blocked,children);
assert.equal(new Set(memory.values()).size,children.length);
assert.deepEqual(assignAvatars(blocked,[...children].reverse()),memory,'Storage failure keeps icons stable in memory');
console.log('PASS: random unique fruit/animal avatars, app/reload/order stability, new accounts, large lists, corrupt-state repair, storage failures and untouched progress.');
