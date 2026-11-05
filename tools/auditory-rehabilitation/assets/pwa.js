import {MEDIA} from './release.js';
import './updates.js';
const $=id=>document.getElementById(id),dialog=$('install-dialog');
let registration,preparing,downloading=false,installPrompt;
const mediaURLs=MEDIA.map(entry=>new URL(entry.url,document.baseURI).href);
const installButton=$('install-app'),installHelp=$('install-help');
const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function installUI(){
 installButton.hidden=!installPrompt||installed();
 installHelp.hidden=installed()||!!installPrompt;
 installHelp.textContent=/iphone|ipad|ipod/i.test(navigator.userAgent)?'للتثبيت: افتح المشاركة ثم اختر إضافة إلى الشاشة الرئيسية.':'للتثبيت: اختر تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية من قائمة المتصفح.';
}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;installUI();});
window.addEventListener('appinstalled',()=>{installPrompt=null;installUI();});
installButton.addEventListener('click',async()=>{
 if(!installPrompt)return;const prompt=installPrompt;installPrompt=null;
 try{await prompt.prompt();await prompt.userChoice;}catch(error){showError(error);}finally{installUI();}
});
installUI();
function showError(error){$('offline-error').textContent=error?.message||'تعذر تجهيز التنزيل. اتصل بالإنترنت ثم حاول مجدداً.';$('offline-error').hidden=false;}
async function ready(){
 if(!('serviceWorker'in navigator)||!isSecureContext)throw Error('افتح التطبيق عبر HTTPS أو localhost لتفعيل التنزيل.');
 if(registration?.active?.state==='activated'||registration?.active?.state==='activating'&&navigator.serviceWorker.controller===registration.active)return registration;
 if(preparing)return preparing;
 preparing=window.AppUpdates.ready();
 try{registration=await preparing;return registration;}finally{preparing=null;}
}
export async function request(type,url){await ready();return new Promise((resolve,reject)=>{
 const controller=navigator.serviceWorker?.controller,script=new URL('sw.js',document.baseURI).href;
 const worker=controller?.scriptURL===script?controller:registration?.active;
 if(!worker){reject(Error('انتظر تجهيز التطبيق ثم أعد المحاولة.'));return;}
 const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('انتهت مهلة التنزيل. حاول مجدداً.'));},45000);
 channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();event.data.error?reject(Error(event.data.error)):resolve(event.data);};
 worker.postMessage({type,url},[channel.port2]);
});}
function display(count){
 const percent=MEDIA.length?Math.min(100,Math.floor(count/MEDIA.length*100)):0;
 $('offline-progress').value=percent;$('offline-status').textContent=`${percent}%`;$('offline-error').hidden=true;
}
async function sync(){const state=await request('STATUS');display(state.count);return state;}
$('install').addEventListener('click',()=>{if(!dialog.open)dialog.showModal();sync().catch(showError);});
$('offline-download').addEventListener('click',async()=>{
 if(downloading)return;downloading=true;$('offline-download').disabled=true;window.AppUpdates.setBusy(true);
 navigator.storage?.persist?.().catch(()=>{});
 try{
  const state=await sync(),missing=mediaURLs.filter(url=>!state.urls.includes(url));let next=0,count=state.count,failed=null;
  await Promise.all(Array.from({length:3},async()=>{while(next<missing.length&&!failed){const url=missing[next++];try{await request('CACHE_ONE',url);count++;if(!failed)display(count);}catch(error){failed=error;}}}));
  if(failed)throw failed;await sync();
 }catch(error){showError(error);}
 finally{downloading=false;$('offline-download').disabled=false;window.AppUpdates.setBusy(false);}
});
async function init(){
 try{await sync();}catch(error){showError(error);}
 finally{if(!downloading)$('offline-download').disabled=false;}
}
void init();
