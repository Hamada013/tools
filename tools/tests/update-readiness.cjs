// The worker must be usable after a claim, without accepting an old controller.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../shared/updates.js'),'utf8');
const scriptURL='https://example.test/tools/VSS/voc/sw.js';
function worker(state){return Object.assign(new EventTarget(),{state,scriptURL});}
function setup({active=null,controller=null,installing=null}={}){
 const registration=Object.assign(new EventTarget(),{active,installing,waiting:null,update:async()=>{}});
 let registrations=0;
 const serviceWorker=Object.assign(new EventTarget(),{controller,register:async()=>{registrations++;return registration;}});
 const window=new EventTarget(),document={baseURI:'https://example.test/tools/VSS/voc/index.html',hidden:false,body:{append(){}},addEventListener(){},createElement(){
  return {open:false,hidden:true,setAttribute(){},addEventListener(){},querySelector(){return {addEventListener(){},setAttribute(){}};},showModal(){this.open=true;}};
 }};
 vm.runInNewContext(source,{window,document,navigator:{serviceWorker,onLine:false},URL,setTimeout,clearTimeout,setInterval(){}});
 return {api:window.AppUpdates,serviceWorker,registration,count:()=>registrations};
}
(async()=>{
 const activated=worker('activated'),normal=setup({active:activated,controller:activated});
 assert.equal(await normal.api.ready(),normal.registration);
 const activating=worker('activating'),safari=setup({active:activating,controller:activating});
 assert.equal(await safari.api.ready(),safari.registration,'A claimed Safari worker is already ready for download messages');
 const old=worker('activated'),next=worker('activating'),pending=setup({active:next,controller:old});
 let finished=false;
 const first=pending.api.ready().then(value=>{finished=true;return value;}),second=pending.api.ready();
 await new Promise(resolve=>setTimeout(resolve,10));
 assert.equal(finished,false,'A different controller with the same script URL is insufficient');
 assert.equal(pending.count(),1,'Concurrent early download taps share one registration');
 pending.serviceWorker.controller=next;pending.serviceWorker.dispatchEvent(new Event('controllerchange'));
 assert.equal(await first,pending.registration);assert.equal(await second,pending.registration);
 const broken=setup({installing:worker('redundant')});
 await assert.rejects(broken.api.ready(),/تعذر تجهيز التطبيق/,'An unsuccessful install leaves a retryable error');
 broken.registration.installing=null;broken.registration.active=worker('activated');
 assert.equal(await broken.api.ready(),broken.registration,'Retry works without reloading the tab');
 console.log('PASS: normal activation, claimed Safari workers, controller identity, concurrent early taps, failed installation and same-tab retry.');
})().catch(error=>{console.error(error);process.exitCode=1;});
