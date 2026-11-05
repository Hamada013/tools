const assert=require('node:assert/strict');
(async()=>{
 const {createProgress,STORAGE}=await import('../progress.js');const {summarize}=await import('../profile-ui.js');
 const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 const p=createProgress(storage),child=p.signIn('  علي  ');assert.equal(child.name,'علي');
 const word={id:'apple',label:'تفاحة',syllableCount:3};let count=0;
 const record=(mode,correct,firstTry=true)=>p.record({id:String(++count),sessionId:'session',word,mode,level:'easy',correct,firstTry,completed:correct});
 record('count',true);assert.ok(p.learned('apple','count'));assert.equal(p.learned('apple','picture'),false);
 record('picture',false);record('picture',true,false);assert.equal(p.learned('apple','picture'),false,'Retries do not become independent mastery');
 record('picture',true);assert.ok(p.learned('apple','picture'));
 record('count',false);record('count',true,false);assert.equal(p.learned('apple','count'),false,'Latest completed test replaces mastery');
 let saved=JSON.parse(data.get(STORAGE));saved.children[0].senb={sessions:[{id:'senb'}]};saved.children[0].words={x:{receptive:{passed:true}}};storage.setItem(STORAGE,JSON.stringify(saved));
 p.saveWorkspace({lastWord:'apple'});saved=JSON.parse(data.get(STORAGE));assert.equal(saved.children[0].senb.sessions[0].id,'senb');assert.ok(saved.children[0].words.x.receptive.passed);
 const other=createProgress(storage);other.signIn('سارة');record('count',true);assert.equal(JSON.parse(data.get(STORAGE)).active,other.active().id,'An old tab does not switch the active identity');assert.ok(p.learned('apple','count'));assert.equal(other.learned('apple','count'),false);
 assert.equal(other.reportChild(child.id).name,'سارة','A child cannot read another profile through report selectors');
 const reloaded=createProgress(storage);assert.equal(reloaded.signIn('علي').id,child.id);assert.equal(reloaded.workspace().lastWord,'apple');
 const summary=summarize(reloaded.reportChild(),[word]);assert.equal(summary.modes.count.learned,1);assert.equal(summary.modes.picture.learned,1);assert.equal(summary.entries.length,7);assert.equal(summary.sessionCount,1);
 const denied=createProgress({getItem:storage.getItem,setItem(){throw Error('full');}},()=>count++);denied.signIn('ليلى');assert.equal(denied.storageOK(),false);denied.saveWorkspace({lastWord:'apple'});assert.equal(denied.workspace().lastWord,'apple');
 const shared=new Map(),sharedStorage={getItem:key=>shared.get(key),setItem:(key,value)=>shared.set(key,value)};
 const senb=require('../../senb/assets/child-progress.js').create(sharedStorage);const registered=senb.signIn('محمد');assert.equal(registered.apps.senb,true);assert.deepEqual(registered.apps,{voc:true,senb:true,taffaha:true},'A new VSS account is enrolled in all three apps');
 const voc=require('../../voc/assets/progress.js').create(sharedStorage);assert.equal(voc.signIn('محمد').id,registered.id);assert.equal(voc.active().apps.voc,true);assert.equal(voc.active().apps.senb,true);
 senb.signIn('محمد');assert.equal(JSON.parse(shared.get(STORAGE)).children.find(child=>child.id===registered.id).apps.voc,true,'A stale sign-in preserves enrollment added by another app');
 const taffaha=createProgress(sharedStorage);taffaha.signIn('محمد');assert.deepEqual(taffaha.active().apps,{senb:true,voc:true,taffaha:true});
 for(const factory of [storage=>require('../../voc/assets/progress.js').create(storage),storage=>require('../../senb/assets/child-progress.js').create(storage),createProgress]){
  const store=new Map(),device={getItem:key=>store.get(key),setItem:(key,value)=>store.set(key,value)};
  const created=factory(device).signIn('نور');
  assert.deepEqual(created.apps,{voc:true,senb:true,taffaha:true});
  assert.equal(require('../../voc/assets/progress.js').create(device).signIn('نور').id,created.id);
  assert.equal(require('../../senb/assets/child-progress.js').create(device).signIn('نور').id,created.id);
  assert.equal(createProgress(device).signIn('نور').id,created.id);
  assert.equal(JSON.parse(store.get(STORAGE)).children.filter(child=>child.name==='نور').length,1);
 }
 console.log('PASS: Taffaha separate skills, retry scoring, latest mastery, profile isolation, resume, cross-tab merge, report totals, storage errors.');
})().catch(error=>{console.error(error);process.exitCode=1;});
