const $=id=>document.getElementById(id),names={voc:'بطاقات المفردات',senb:'بناء الجمل',arabicsounds:'أصوات الحروف'};
let registration,downloading=false,cancelled=false,promptEvent;
export function rpc(type,extra={}){
 return new Promise((resolve,reject)=>{
  const worker=navigator.serviceWorker?.controller||registration?.active;if(!worker)return reject(Error('التطبيق غير جاهز للتنزيل. انتظر قليلًا أو أعد فتحه.'));
  const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('انقطع التنزيل. أبقِ التطبيق مفتوحًا واستكمله مجددًا.'));},55000);
  channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();e.data.ok?resolve(e.data.result):reject(Error(e.data.error));};
  worker.postMessage({type,...extra},[channel.port2]);
 });
}
function selected(){return Array.from(document.querySelectorAll('#download-libraries input:checked'),i=>i.value);}
function render(result){
 const container=$('download-libraries');
 if(!container.children.length)for(const [library,g]of Object.entries(result.groups)){
  const label=document.createElement('label'),check=document.createElement('input'),span=document.createElement('span'),small=document.createElement('small');check.type='checkbox';check.value=library;check.checked=true;span.textContent=names[library];small.id='library-'+library;span.append(small);label.append(check,span);container.append(label);
 }
 let count=0,total=0;
 for(const [library,g]of Object.entries(result.groups)){
  $('library-'+library).textContent=`${g.count} / ${g.total} ملف · ${(g.bytes/1e6).toFixed(1)} MB`;
  if(selected().includes(library)){count+=g.count;total+=g.total;}
 }
 $('download-progress').max=total||1;$('download-progress').value=count;
 $('download-status').textContent=total&&count===total?'جاهز للاستخدام دون اتصال ✔':`${count} من ${total} ملف محفوظ على الجهاز`;
 return total>0&&count===total;
}
export async function refreshOffline(){try{render(await rpc('STATUS'));}catch(e){$('download-status').textContent=e.message;}}
export async function initOffline(){
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;});
 $('install').onclick=async()=>{if(promptEvent){await promptEvent.prompt();await promptEvent.userChoice;promptEvent=null;}else $('install-help').textContent=matchMedia('(display-mode: standalone)').matches?'التطبيق مفتوح من الشاشة الرئيسية.':'على iPhone: مشاركة ← إضافة إلى الشاشة الرئيسية. على Android: قائمة المتصفح ← تثبيت التطبيق.';};
 $('download').onclick=async()=>{
  if(downloading)return;const libraries=selected();if(!libraries.length){$('download-status').textContent='اختر مكتبة واحدة على الأقل.';return;}
  downloading=true;cancelled=false;$('download').disabled=true;for(const input of document.querySelectorAll('#download-libraries input'))input.disabled=true;
  navigator.storage?.persist?.().catch(()=>{});
  try{let done=render(await rpc('STATUS'));while(!done&&!cancelled)done=render(await rpc('BATCH',{libraries}));if(cancelled)$('download-status').textContent='توقف التنزيل مؤقتًا. الملفات المحفوظة جاهزة للاستكمال.';}
  catch(e){$('download-status').textContent=e.message;}
  finally{downloading=false;$('download').disabled=false;for(const input of document.querySelectorAll('#download-libraries input'))input.disabled=false;}
 };
 $('pause-download').onclick=()=>{cancelled=true;rpc('PAUSE').catch(()=>{});};
 $('clear-offline').onclick=async()=>{cancelled=true;try{render(await rpc('CLEAR'));}catch(e){$('download-status').textContent=e.message;}};
 $('download-libraries').onchange=refreshOffline;
 if(!isSecureContext||!('serviceWorker'in navigator)){$('download-status').textContent='التنزيل دون إنترنت يحتاج HTTPS أو localhost ومتصفحًا يدعم تطبيقات الويب.';$('download').disabled=true;return;}
 try{
  registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  await navigator.serviceWorker.ready;await refreshOffline();
  navigator.serviceWorker.addEventListener('controllerchange',refreshOffline);
  registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)$('download-status').textContent='تحديث جديد جاهز. أغلق نوافذ التطبيق ثم افتحه لتطبيقه.';});});
 }catch(e){$('download-status').textContent='لم يكتمل تجهيز التطبيق دون اتصال. تحقق من الاتصال ثم أعد فتحه.';}
}
