/** Native <dialog> arrived later than audio recording on iOS. Keep settings,
 * offline controls and deletion usable on older Safari without a CDN polyfill.
 */
export function installDialogFallback(){
 if(typeof HTMLDialogElement!=='undefined'&&HTMLDialogElement.prototype.showModal)return;
 const stack=[],hidden=new Map();let backdrop;
 const focusable=dialog=>Array.from(dialog.querySelectorAll('button,a[href],input,select,textarea,[tabindex]')).filter(e=>!e.disabled&&e.tabIndex>=0);
 function update(){
  const top=stack[stack.length-1];
  if(top){
   if(!backdrop){backdrop=document.createElement('div');backdrop.className='legacy-backdrop';backdrop.onclick=()=>stack[stack.length-1]?.close();document.body.append(backdrop);}
   for(const child of document.body.children)if(child!==backdrop){if(!hidden.has(child))hidden.set(child,child.getAttribute('aria-hidden'));if(child!==top)child.setAttribute('aria-hidden','true');else child.removeAttribute('aria-hidden');}
   backdrop.style.zIndex=100+stack.length*2;top.style.zIndex=101+stack.length*2;
  }else{
   backdrop?.remove();backdrop=null;
   for(const [child,value]of hidden){if(value===null)child.removeAttribute('aria-hidden');else child.setAttribute('aria-hidden',value);}hidden.clear();
  }
 }
 for(const dialog of document.querySelectorAll('dialog')){
  dialog.classList.add('legacy-dialog');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.tabIndex=-1;
  dialog.showModal=()=>{if(stack.includes(dialog))return;dialog.previousFocus=document.activeElement;dialog.setAttribute('open','');stack.push(dialog);update();(focusable(dialog)[0]||dialog).focus();};
  dialog.close=()=>{const index=stack.indexOf(dialog);if(index<0)return;stack.splice(index,1);dialog.removeAttribute('open');update();dialog.previousFocus?.focus();dialog.dispatchEvent(new Event('close'));};
 }
 document.addEventListener('keydown',event=>{
  const top=stack[stack.length-1];if(!top)return;
  if(event.key==='Escape'){event.preventDefault();top.close();}
  if(event.key==='Tab'){
   const list=focusable(top),first=list[0]||top,last=list[list.length-1]||top;
   if(event.shiftKey&&(document.activeElement===first||document.activeElement===top)){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 });
}
