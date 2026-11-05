/* App-scoped research reset. Never deletes clinical accounts or reports. */
(() => {
 'use strict';
 window.WorkbookReset={attach({anchor,app,label,bridge,ready=Promise.resolve(),reset}){
  if(!anchor)return;
  const svg=path=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  const trash='<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',cross='<path d="m6 6 12 12M18 6 6 18"/>',tick='<path d="m4 12 5 5L20 5"/>';
  const button=document.createElement('button');button.type='button';button.className=anchor.className;button.setAttribute('aria-label','مسح بيانات ملف بحث '+label);button.title=button.getAttribute('aria-label');button.innerHTML=svg(trash);button.style.cssText='min-width:44px;min-height:44px;color:#a44747';anchor.after(button);
  button.onclick=async()=>{
   if(window.ChildAccountGate&&!await ChildAccountGate.request())return;
   const dialog=document.createElement('dialog');dialog.dir='rtl';dialog.style.cssText='max-width:480px;width:90vw;border:1px solid #dceaf4;border-radius:24px;padding:24px;color:#22445a;background:white';
   const title=document.createElement('h2');title.id='workbook-reset-title';title.textContent='مسح ملف بحث '+label;dialog.setAttribute('aria-labelledby',title.id);
   const text=document.createElement('p');text.textContent='حذف جميع بيانات جميع الحالات من ملف بحث '+label+' وبدء ملف فارغ؟ تبقى الحسابات والتقارير محفوظة، ويمكن تصديرها مجددًا.'+(reset?' يُنزّل ملف فارغ بديل؛ النسخ المنزلة سابقًا لا تتغير.':'');
   const actions=document.createElement('div');actions.style.cssText='display:flex;gap:16px';const error=document.createElement('p');error.setAttribute('role','alert');
   const close=document.createElement('button'),accept=document.createElement('button');for(const [b,path,label]of [[close,cross,'إلغاء'],[accept,tick,'تأكيد مسح ملف البحث']]){b.type='button';b.setAttribute('aria-label',label);b.innerHTML=svg(path);b.style.cssText='width:48px;height:48px;border:1px solid #dceaf4;border-radius:14px;background:white;color:inherit';actions.append(b);}
   close.onclick=()=>dialog.close();accept.onclick=async()=>{accept.disabled=true;close.disabled=true;try{await ready;if(reset)await reset();else{const base=typeof bridge==='function'?bridge():bridge;const r=await fetch(base+'/api/'+app+'/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({confirm:app}),signal:AbortSignal.timeout(120000)});if(!r.ok||(await r.json()).reset!==app)throw Error('تعذر مسح ملف البحث. تحقق من تشغيل الخادم المحلي ثم أعد المحاولة.');}dialog.close();}catch(e){error.textContent=e.message;accept.disabled=false;close.disabled=false;}};
   dialog.append(title,text,actions,error);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();close.focus();
  };return button;
 }};
})();
