const assert=require('node:assert/strict');
const {create}=require('../shared/sound-progress.js');
const vm=require('node:vm'),fs=require('node:fs');
const ctx={document:{currentScript:{dataset:{app:'arabicsounds'}}},module:{exports:{}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../shared/sound-accounts.js'),'utf8').replace(' if(!root.document)return;',' return;'),ctx);const {remove}=ctx.module.exports;
const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
for(const app of ['arabicsounds','auditory-rehabilitation'])values.set(`${app}-children-v1`,JSON.stringify({schema:1,active:'ali',children:[{id:'hamada-admin',name:'Hamada',role:'admin',words:{},apps:{}},{id:'ali',name:'علي',words:{keep:{receptive:true}},workspace:{slots:['keep']},senb:{sessions:[{id:'existing'}]},taffaha:{attempts:[{id:'old'}]},apps:{voc:true}}]}));
for(const app of ['arabicsounds','auditory-rehabilitation']){
 const p=create({app,storage});assert.equal(p.active().id,'ali');const before=JSON.stringify(p.active().words);
 p.record({sessionId:'run',id:'0',label:'صوت',skill:'detection',kind:'assessment',present:true,response:true,correct:true,owner:'ali'});
 assert.equal(p.record({sessionId:'run',id:'0',label:'صوت',kind:'assessment',correct:true}),false,'No duplicate response');
 assert.equal(p.record({owner:'someone-else',sessionId:'run',label:'old response'}),false,'Delayed audio cannot write to another profile');
 p.record({sessionId:'practice',label:'تدريب',kind:'practice',correct:true});
 let data=p.report();assert.equal(data.sessions.length,2);assert.equal(data.sessions[0].partial,true);assert.equal(data.sessions[1].records[0].correct,null,'Practice is never scored as an assessment');p.complete('run');assert.equal(p.report().sessions[0].partial,false);
 assert.equal(JSON.stringify(p.active().words),before);assert.deepEqual(p.active().senb.sessions,[{id:'existing'}]);assert.deepEqual(p.active().taffaha.attempts,[{id:'old'}]);
 // The retired Hamada owner is never listed, readable or switched to; every account is an ordinary child.
 assert.equal(p.children().some(c=>c.role==='admin'||c.name==='Hamada'),false);assert.equal(p.report('hamada-admin'),null);assert.equal(p.isAdmin(),false);
 assert.equal(p.active().id,'ali');
 const other=p.add('سارة');assert.equal(p.report().sessions.length,0);assert.equal(p.report('ali'),null);p.activate('ali');assert.equal(p.report().sessions.length,2);
 const reloaded=create({app,storage});assert.equal(reloaded.report().sessions.length,2);
}
const p=create({app:'arabicsounds',storage});assert.equal(p.report().sessions.length,2,'Apps keep separate evidence');assert.equal(remove(storage,'ali'),true);assert.equal(p.activate('ali'),false);assert.equal(p.record({owner:'ali',label:'stale'}),false);
console.log('PASS: child/app isolation, no Hamada account, preserved learned libraries, first-response deduplication, partial/completed sessions, unscored practice, reloads, authorized report access and deletion tombstones.');

const failing=create({app:'arabicsounds',storage:{getItem(){return null;},setItem(){throw Error('full');}}});const child=failing.add('نور');assert(child);failing.record({label:'م',sessionId:'memory',kind:'practice'});assert.equal(failing.report().sessions.length,1);assert.equal(failing.storageOK(),false);
console.log('PASS: storage failures retain a usable in-memory account and evidence.');
