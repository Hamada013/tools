const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const apps=['arabicsounds','auditory-rehabilitation'];
const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key),key:index=>[...values.keys()][index],get length(){return values.size;}};
const legacy={schema:1,active:'child',children:[{id:'child',name:'علي',role:'child',words:{keep:true},apps:{arabicsounds:true,'auditory-rehabilitation':true},soundApps:{arabicsounds:{sessions:[{id:'arabic-old'}]},'auditory-rehabilitation':{sessions:[{id:'around-old'}]}}},{id:'vss-only',name:'آخر',apps:{voc:true}}]};
const original=JSON.stringify(legacy);values.set('voc-children-v1',original);
const models={};
for(const app of apps){
 const context={structuredClone,Event,crypto:require('node:crypto').webcrypto};vm.createContext(context);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'..',app,'assets/sound-progress.js'),'utf8'),context);
 const model=models[app]=context.SoundProgressModel.create({app,storage});
 assert.equal(model.active().name,'علي');assert.equal(model.children().length,2);assert.equal(model.active().words,undefined);
 assert.deepEqual(Object.keys(model.active().soundApps),[app]);
 assert.equal(model.report().sessions[0].id,app==='arabicsounds'?'arabic-old':'around-old');
 const imported=storage.getItem(`${app}-children-v1`);context.SoundProgressModel.create({app,storage});assert.equal(storage.getItem(`${app}-children-v1`),imported,'Migration runs once');
}
const aroundBefore=storage.getItem('auditory-rehabilitation-children-v1');
const child=models.arabicsounds.add('جديد');models.arabicsounds.record({label:'م',sessionId:'new',kind:'practice'});
assert.equal(storage.getItem('auditory-rehabilitation-children-v1'),aroundBefore,'Adding, switching and recording are isolated');
assert.equal(models['auditory-rehabilitation'].active().id,'child');
models.arabicsounds.activate('hamada-admin');
const context={document:{currentScript:{dataset:{app:'arabicsounds'}}},module:{exports:{}},Intl,Event};vm.createContext(context);
// Export the pure account operations without running the browser UI.
const source=fs.readFileSync(path.join(__dirname,'../arabicsounds/assets/accounts.js'),'utf8').replace(' if(!root.document)return;',' return;');vm.runInContext(source,context);
assert(context.module.exports.remove(storage,'hamada-admin',child.id));
assert(!context.module.exports.remove(storage,'hamada-admin','hamada-admin'));
assert.equal(storage.getItem('auditory-rehabilitation-children-v1'),aroundBefore,'Deletion is isolated');
assert.equal(storage.getItem('voc-children-v1'),original,'The legacy/VSS store is never modified');
models.arabicsounds.add('مستقل');values.set('voc-children-v1',JSON.stringify({...legacy,active:'vss-only'}));assert.equal(models.arabicsounds.active().name,'مستقل','Legacy changes do not switch standalone accounts');
console.log('PASS: one-time app-only migration; independent accounts, reports, active profiles and deletion; protected Hamada; legacy data preserved.');
