// Exercise browser-managed downloads and worker restart without a live page.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
const base='https://example.test/speech-website/tools/VSS/',prefix='vss:/speech-website/tools/VSS/:';
const hash=body=>crypto.createHash('sha256').update(body).digest('hex');
const bodies=new Map([['index.html',Buffer.from('<!doctype html><title>VSS</title>')],...Array.from({length:14},(_,i)=>[`voc/images/1/${i}.webp`,Buffer.from(`media ${i}`)])]);
const release={version:'worker-test',shell:['index.html'],integrity:{'index.html':'sha256-'+crypto.createHash('sha256').update(bodies.get('index.html')).digest('base64')},media:[...bodies].slice(1).map(([url,body])=>({url,bytes:body.length,revision:hash(body)}))};

function storage(){
 const entries=new Map();let failKey;
 return {
  set failKey(value){failKey=value;},
  async open(name){
   if(!entries.has(name))entries.set(name,new Map());const cache=entries.get(name);
   const key=value=>typeof value==='string'?value:value.url;
   return {
    async match(request){return cache.get(key(request))?.clone();},
    async put(request,response){if(failKey&&key(request).includes(failKey))throw new DOMException('Disk full','QuotaExceededError');cache.set(key(request),response.clone());},
    async keys(){return [...cache.keys()].map(url=>new Request(url));},
    async delete(request){return cache.delete(key(request));}
   };
  },
  async keys(){return [...entries.keys()];},async delete(name){return entries.delete(name);}
 };
}

function background(){
 const transfers=new Map(),calls=[];
 return {calls,transfers,
  async get(id){return transfers.get(id);},
  async getIds(){return [...transfers.keys()];},
  async fetch(id,requests,options){
   assert.ok(!transfers.has(id),'Only one native transfer per release');
   calls.push({id,requests,options});
   const registration={id,downloadTotal:options.downloadTotal,downloaded:0,requests,
    async abort(){transfers.delete(id);},
    async matchAll(){return requests.map(request=>({request,responseReady:Promise.resolve(new Response(bodies.get(request.url.slice(base.length))))}));}
   };
   transfers.set(id,registration);return registration;
  }
 };
}

function worker({caches=storage(),native,failURL,blockURL,onBlocked,requests=new Map(),release:workerRelease=release}={}){
 const listeners=new Map();let active=0,maxActive=0,blockedOnce=false;
 const sandbox={URL,Request,Response,Headers,AbortController,DOMException,crypto:crypto.webcrypto,Uint8Array,Date,setTimeout,clearTimeout,
  btoa:value=>Buffer.from(value,'binary').toString('base64'),caches,
  importScripts(){sandbox.self.VSS_RELEASE=workerRelease;},
  self:{registration:{scope:base,backgroundFetch:native},clients:{async matchAll(){return [];},async claim(){}},
   addEventListener(type,fn){listeners.set(type,fn);}},
  async fetch(url,options){
   requests.set(url,(requests.get(url)||0)+1);active++;maxActive=Math.max(maxActive,active);
   try{
    await new Promise(resolve=>setImmediate(resolve));
    if(url===blockURL&&!blockedOnce){
     blockedOnce=true;onBlocked();
     await new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(options.signal.reason),{once:true}));
    }
    if(url===failURL)throw new TypeError('Offline');
    const body=bodies.get(url.slice(base.length));assert.ok(body,'Known file');
    if(options.integrity)assert.equal(options.integrity,'sha256-'+crypto.createHash('sha256').update(body).digest('base64'));
    return new Response(body);
   }finally{active--;}
  }
 };
 vm.runInNewContext(source,sandbox,{filename:'VSS/sw.js'});
 function dispatch(type,data){
  const pending=[];
  listeners.get(type)({...data,waitUntil(promise){pending.push(promise);}});
  return Promise.all(pending);
 }
 function send(type,options={}){
  let resolve;const reply=new Promise(done=>resolve=done);
  const finished=dispatch('message',{data:{type,...options},source:{url:base+'index.html'},ports:[{postMessage:resolve}]});
  return {reply,finished};
 }
 return {caches,requests,send,dispatch,get maxActive(){return maxActive;}};
}
async function state(caches){return (await(await caches.open(prefix+'state')).match(base+'__offline_state__')).json();}
async function saved(caches){return (await(await caches.open(prefix+'media')).keys()).length;}
async function install(worker){await worker.dispatch('install',{});}
async function status(worker){const command=worker.send('VSS_STATUS',{resume:false});await command.finished;return command.reply;}
async function startNative(worker,native){
 const command=worker.send('VSS_START',{background:true}),reply=await command.reply;
 assert.ok(reply.background,'The page receives a browser-download handoff');
 await native.fetch(reply.background.id,reply.background.requests.map(url=>new Request(url)),reply.background.options);
 await worker.send('VSS_CONTINUE').finished;await command.finished;
}

(async()=>{
 // An initial page sends once. No window or subsequent batch message is needed.
 const queue=worker();await install(queue);
 const command=queue.send('VSS_START');assert.equal((await command.reply).wanted,true);await command.finished;
 assert.equal((await status(queue)).ready,true);assert.equal(await saved(queue.caches),14);
 assert.ok(queue.maxActive<=6&&queue.maxActive>1,'Bounded concurrent queue');
 assert.equal((await state(queue.caches)).wanted,false);assert.ok((await state(queue.caches)).completedAt);

 // A rejected native permission still starts the independent worker queue.
 const denied=worker({native:background()});await install(denied);
 const handoff=denied.send('VSS_START',{background:true});assert.ok((await handoff.reply).background);
 await denied.send('VSS_CONTINUE').finished;await handoff.finished;
 assert.equal((await status(denied)).ready,true);

 // An update releases the old worker immediately without cancelling intent.
 let blocked;const waiting=new Promise(resolve=>blocked=resolve);
 const quiesced=worker({blockURL:base+release.media[0].url,onBlocked:blocked});await install(quiesced);
 const downloading=quiesced.send('VSS_START');await downloading.reply;await waiting;
 await quiesced.send('VSS_PREPARE_UPDATE').finished;await downloading.finished;
 assert.equal((await state(quiesced.caches)).wanted,true,'Update preparation retains the saved request');
 const pausedRequests=[...quiesced.requests.entries()];await quiesced.send('VSS_STATUS').finished;
 assert.deepEqual([...quiesced.requests.entries()],pausedRequests,'Old windows cannot restart a prepared worker');
 await quiesced.send('VSS_CANCEL_UPDATE').finished;
 assert.equal((await status(quiesced)).ready,true,'A failed update can resume the old release');

 // A killed/restarted worker reads intent and keeps all successfully saved files.
 const shared=storage(),requests=new Map(),interrupted=worker({caches:shared,requests,failURL:base+release.media[0].url});
 await install(interrupted);await interrupted.send('VSS_START').finished;
 assert.equal((await state(shared)).wanted,true);assert.ok(await saved(shared)>0);assert.ok(await saved(shared)<14);
 assert.equal((await status(interrupted)).error,'network','Display-only polls preserve actionable failure feedback');
 const before=new Map(requests),resumed=worker({caches:shared,requests});
 await resumed.send('VSS_STATUS').finished;assert.equal((await status(resumed)).ready,true);
 for(const [url,count]of before)if(url!==base+release.media[0].url)assert.equal(requests.get(url),count,'Saved revisions survive restart');

 // Native downloads survive replacement of the entire worker instance.
 const native=background(),managed=worker({native});await install(managed);await startNative(managed,native);
 assert.equal(native.calls.length,1);assert.equal(native.calls[0].requests.length,14);
 const transfer=native.transfers.get('vss-offline:worker-test');transfer.downloaded=transfer.downloadTotal;
 const reopened=worker({native,caches:managed.caches});await reopened.send('VSS_STATUS').finished;
 assert.equal(native.calls.length,1,'Reopening joins the browser-owned download');
 assert.equal((await status(reopened)).percent,99,'Received bytes alone never mean offline-ready');
 let updated=false;
 await reopened.dispatch('backgroundfetchsuccess',{registration:transfer,async updateUI(){updated=true;}});
 native.transfers.clear();
 assert.equal((await status(reopened)).ready,true);assert.ok(updated);
 const completed=(await state(managed.caches)).completedAt;
 assert.equal((await status(worker({native,caches:managed.caches}))).completedAt,completed,'Completion survives shortcut reopening');

 // A new release joins an older native job, reuses valid files and replaces
 // only changed revisions when the browser wakes the new worker on success.
 const crossNative=background(),oldRelease=worker({native:crossNative});await install(oldRelease);await startNative(oldRelease,crossNative);
 const oldTransfer=crossNative.transfers.get('vss-offline:worker-test'),oldRecords=await oldTransfer.matchAll();oldTransfer.matchAll=async()=>oldRecords;
 await oldRelease.send('VSS_PREPARE_UPDATE').finished;
 const changed=release.media[0],oldBody=bodies.get(changed.url),newBody=Buffer.from('new revision');
 const nextRelease={...release,version:'worker-updated',media:release.media.map(asset=>asset===changed?{...asset,bytes:newBody.length,revision:hash(newBody)}:asset)};
 bodies.set(changed.url,newBody);
 try{
  const nextWorker=worker({native:crossNative,caches:oldRelease.caches,release:nextRelease});await install(nextWorker);await nextWorker.dispatch('activate',{});
  await nextWorker.send('VSS_STATUS').finished;
  assert.equal(nextWorker.requests.size,1,'Activation joins the existing native job rather than redownloading it');
  await nextWorker.dispatch('backgroundfetchsuccess',{registration:oldTransfer,async updateUI(){}});
  assert.equal((await status(nextWorker)).ready,true);
  assert.deepEqual([...nextWorker.requests.keys()],[base+'index.html',base+changed.url],'Only the changed media revision is fetched');
 }finally{bodies.set(changed.url,oldBody);}

 // Invalid native responses never get a verified revision; valid files survive.
 const partialNative=background(),partial=worker({native:partialNative});await install(partial);await startNative(partial,partialNative);
 const broken=partialNative.transfers.get('vss-offline:worker-test'),records=await broken.matchAll();
 records[0].responseReady=Promise.resolve(new Response('corrupt media'));broken.matchAll=async()=>records;
 await partial.dispatch('backgroundfetchfail',{registration:broken});partialNative.transfers.clear();
 assert.equal(await saved(partial.caches),13);assert.equal((await state(partial.caches)).wanted,true);
 assert.equal((await status(partial)).ready,false);
 await startNative(partial,partialNative);
 assert.equal(partialNative.calls[1].requests.length,1,'Retry downloads only the invalid/missing revision');
 await partial.dispatch('backgroundfetchabort',{registration:partialNative.transfers.get('vss-offline:worker-test')});partialNative.transfers.clear();
 assert.equal((await state(partial.caches)).wanted,false);await partial.send('VSS_STATUS').finished;
 assert.equal(partialNative.calls.length,2,'Cancellation never silently restarts');

 // Storage errors stop intent and leave an explicit, usable retry.
 const full=worker();await install(full);full.caches.failKey=release.media[0].url;
 await full.send('VSS_START').finished;assert.equal((await state(full.caches)).wanted,false);
 full.caches.failKey=null;await full.send('VSS_START').finished;assert.equal((await status(full)).ready,true);
 console.log('PASS: worker-owned queue, six-file limit, persistent resume/reuse, immediate update preparation/recovery, native downloads across releases, verified completion, partial/corrupt downloads, cancellation and quota retry.');
})().catch(error=>{console.error(error);process.exitCode=1;});
