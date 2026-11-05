// The update choice must respond immediately, recover, and reload each window once.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../shared/updates.js'),'utf8');
const base='https://example.test/tools/VSS/',scriptURL=base+'sw.js';
class Node extends EventTarget {
 constructor(){super();this.hidden=false;this.open=false;this.disabled=false;this.attributes=new Map();this.textContent='';}
 setAttribute(name,value){this.attributes.set(name,value);}
 showModal(){this.open=true;}
 close(){this.open=false;this.dispatchEvent(new Event('close'));}
}
function setup({prepare,throws=false,waiting=true}={}){
 const old=Object.assign(new EventTarget(),{state:'activated',scriptURL});
 const messages=[];
 const next=Object.assign(new EventTarget(),{state:'installed',scriptURL,postMessage(message){if(throws)throw Error('Worker unavailable');messages.push(message);}});
 const registration=Object.assign(new EventTarget(),{active:old,waiting:waiting?next:null,update:async()=>{}});
 const serviceWorker=Object.assign(new EventTarget(),{controller:old});
 const nodes=Object.fromEntries(['[data-update-accept]','[data-update-later]','#app-update-message','[data-update-error]'].map(selector=>[selector,new Node()]));
 const dialog=new Node();dialog.querySelector=selector=>nodes[selector];
 const document=Object.assign(new EventTarget(),{baseURI:base+'index.html',hidden:false,body:{append(){}},querySelector(){return {href:base+'manifest.webmanifest'};},createElement(){return dialog;}});
 let reloads=0,skips=0,resumes=0;
 const window=new EventTarget();window.SuiteWelcome={pending:false,skipNextLoad(){skips++;}};
 if(prepare)window.VSSOffline={prepareUpdate:prepare,resumeAfterUpdate:async()=>{resumes++;}};
 const timers=new Map();let timer=0;
 vm.runInNewContext(source,{window,document,navigator:{serviceWorker,onLine:false},URL,location:{reload(){reloads++;}},setTimeout(fn,ms){timers.set(++timer,{fn,ms});return timer;},clearTimeout(id){timers.delete(id);},setInterval(){}});
 window.AppUpdates.watch(registration);
 return {api:window.AppUpdates,window,document,dialog,serviceWorker,registration,old,next,messages,
  accept:nodes['[data-update-accept]'],later:nodes['[data-update-later]'],message:nodes['#app-update-message'],error:nodes['[data-update-error]'],
  click(){nodes['[data-update-accept]'].dispatchEvent(new Event('click'));},
  timeout(){[...timers.values()].find(timer=>timer.ms===20000).fn();},
  allowMessages(){throws=false;},get reloads(){return reloads;},get skips(){return skips;},get resumes(){return resumes;}
 };
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 let complete;const app=setup({prepare:()=>new Promise(resolve=>complete=resolve)});
 app.api.setBusy(true);assert.equal(app.accept.disabled,false,'A queued VSS download cannot disable Update now');
 app.click();assert.equal(app.accept.attributes.get('aria-busy'),'true');assert.match(app.accept.textContent,/جارٍ/);assert.equal(app.later.disabled,true);
 app.api.setBusy(false);assert.equal(app.accept.disabled,true,'A downloader message cannot enable a second update click');
 app.click();complete();await flush();assert.equal(app.messages.length,1);
 app.registration.active=app.next;app.next.state='activated';app.next.dispatchEvent(new Event('statechange'));
 app.serviceWorker.controller=app.next;app.serviceWorker.dispatchEvent(new Event('controllerchange'));
 app.window.dispatchEvent(new Event('pageshow'));
 assert.equal(app.reloads,1);assert.equal(app.skips,1,'Automatic reload skips the welcome screen once');

 const failed=setup({prepare:async()=>{},throws:true});failed.click();await flush();
 assert.equal(failed.error.hidden,false);assert.equal(failed.accept.disabled,false);assert.equal(failed.later.disabled,false);assert.equal(failed.resumes,1);
 failed.allowMessages();failed.click();await flush();assert.equal(failed.messages.length,1,'A failed postMessage has a working retry');
 failed.timeout();assert.equal(failed.error.hidden,false);assert.equal(failed.accept.disabled,false,'Activation timeout restores retry');

 const returned=setup();returned.serviceWorker.dispatchEvent(new Event('controllerchange'));assert.equal(returned.reloads,0,'Repeated events for the old controller never reload');
 returned.serviceWorker.controller=returned.next;returned.window.dispatchEvent(new Event('pageshow'));
 assert.equal(returned.reloads,1,'A suspended shortcut catches up on return even if it missed controllerchange');

 const sound=setup();sound.api.setBusy(true);assert.equal(sound.accept.disabled,true);assert.match(sound.message.textContent,/التنزيل/);
 sound.api.setBusy(false);sound.click();await flush();assert.equal(sound.messages[0].type,'ACTIVATE_UPDATE');
 console.log('PASS: download-safe update click, immediate feedback, duplicate guards, postMessage failure/retry, activation timeout, one reload and suspended shortcut recovery.');
})().catch(error=>{console.error(error);process.exitCode=1;});
