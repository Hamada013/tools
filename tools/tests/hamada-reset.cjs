const assert=require('node:assert/strict');
const {resetHamada,orderedChildren}=require('../shared/accounts.js');
const {create:homework}=require('../shared/session-homework.js');
const KEY='voc-children-v1';
const fixture=()=>({schema:1,active:'admin',extra:'keep',children:[
{id:'admin',name:'Hamada',role:'admin',created:'2020-01-01',apps:{voc:true,senb:true,taffaha:true},words:{old:true},workspace:{old:true},plan:{old:true},sessions:[{id:'old'}],homeLesson:{old:true},wordLevels:{old:true},senb:{sessions:[{id:'old'}],mastery:{old:true},workspace:{old:true},draft:{old:true},lesson:{old:true}},taffaha:{attempts:[{id:'old'}],workspace:{old:true},flow:{old:true}},soundApps:{arabicsounds:{sessions:[{id:'keep'}]}}},
{id:'admin-extra',name:'علي',role:'child',created:'2022-01-01',apps:{voc:true,senb:true,taffaha:true},words:{keep:true},sessions:[{id:'keep'}],senb:{sessions:[{id:'keep'}]},taffaha:{attempts:[{id:'keep'}]}},
{id:'sara',name:'سارة',role:'child',created:'2021-01-01',words:{keep:true}}]});
function storage(data=fixture()) {const values=new Map([[KEY,JSON.stringify(data)]]);return{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};}
(async()=>{
 const {createProgress}=await import('../VSS/taffaha/progress.js');const makers=[require('../VSS/voc/assets/progress.js').create,require('../VSS/senb/assets/child-progress.js').create,createProgress];
 for(const create of makers){
  const s=storage(),p=create(s);p.signIn('Hamada');
  const notes=homework({app:'voc',storage:s,owner:()=>p.active()});notes.record({label:'old',activity:'test'});
  const childDraft='hamada-game-test-child-admin-extra-draft',ownDraft='hamada-game-test-child-admin-draft';s.setItem(childDraft,'keep');s.setItem(ownDraft,'old');
  assert.equal(resetHamada(s,'admin-extra'),false);assert.equal(resetHamada(s,'missing'),false);
  const rawBefore=s.getItem(KEY),before=JSON.parse(rawBefore);assert.equal(resetHamada({...s,setItem(){throw Error('full')}},'admin'),false);assert.equal(s.getItem(KEY),rawBefore,'Failed writes preserve all evidence');
  assert.equal(resetHamada(s,'admin'),true);const reset=JSON.parse(s.getItem(KEY)),owner=reset.children[0];assert.deepEqual(reset.children.slice(1),before.children.slice(1),'Every child record stays byte-for-byte equivalent');
  for(const field of ['id','name','role','apps','created','soundApps'])assert.deepEqual(owner[field],before.children[0][field]);assert.deepEqual(owner.words,{});assert.deepEqual(owner.sessions,[]);assert.deepEqual(owner.senb.sessions,[]);assert.deepEqual(owner.taffaha.attempts,[]);assert.ok(reset.accountResets.admin);assert.equal(reset.active,'admin');assert.equal(s.getItem(childDraft),'keep');assert.equal(s.getItem(ownDraft),undefined);assert.equal(s.getItem('speech-homework-v1:voc:admin'),undefined);
  p.saveWorkspace({stale:true});p.saveWorkspace({staleAgain:true});if(p.saveDraft)p.saveDraft({stale:true});assert.deepEqual(JSON.parse(s.getItem(KEY)).children[0],owner,'Repeated stale writes cannot resurrect cleared activity');
  notes.record({label:'stale',activity:'old pagehide'});assert.equal(s.getItem('speech-homework-v1:voc:admin'),undefined,'Old homework models cannot recreate cleared notes');
  const fresh=create(s);fresh.saveWorkspace({fresh:true});const saved=JSON.parse(s.getItem(KEY)).children[0];assert.ok(saved.workspace?.fresh||saved.senb.workspace?.fresh||saved.taffaha.workspace?.fresh,'A freshly opened app can save new activity');
 }
 const entries=fixture().children;
 assert.deepEqual(orderedChildren(entries).map(x=>x.id),['sara','admin-extra']);assert.deepEqual(orderedChildren(entries,'','newest').map(x=>x.id),['admin-extra','sara']);assert.deepEqual(orderedChildren(entries,'','alphabet').map(x=>x.id),['sara','admin-extra']);assert.deepEqual(orderedChildren(entries,'عَلِيّ').map(x=>x.id),['admin-extra']);
 const unavailableRemove=storage(),staleNotes=homework({app:'voc',storage:unavailableRemove,owner:()=>JSON.parse(unavailableRemove.getItem(KEY)).children[0]});staleNotes.record({label:'old note'});assert.equal(resetHamada({...unavailableRemove,removeItem(){throw Error('blocked')}},'admin'),true);const freshNotes=homework({app:'voc',storage:unavailableRemove,owner:()=>JSON.parse(unavailableRemove.getItem(KEY)).children[0]});assert.equal(freshNotes.current(),null,'A new reset revision never reads undeletable old summaries');
 const other=fixture();other.active='admin-extra';const s=storage(other);assert.equal(resetHamada(s,'admin'),false,'Reset requires the active Hamada account');
 console.log('PASS: Hamada-only reset preserves every child, identity, sound data, media and unrelated drafts; failed writes and repeated stale saves are safe; new activity and account search/sorting work.');
})().catch(e=>{console.error(e);process.exitCode=1;});
