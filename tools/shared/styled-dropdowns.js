/* Enhance form selects without changing their values or input/change events. */
(() => {
 'use strict';
 const controls=new Map(),dialogs=new WeakSet();let sequence=0,lastMenuEscape=-Infinity;
 const chevron='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>';
 const check='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
 function closeAll(){controls.forEach(c=>c.close());}
 function enhance(root=document){
  for(const [select,c]of controls)if(!select.isConnected){c.close();controls.delete(select);}
  root.querySelectorAll('select:not([multiple])').forEach(select=>{
   if(controls.has(select)){controls.get(select).refresh();return;}
   const id='styled-choice-'+(++sequence),wrap=document.createElement('div'),trigger=document.createElement('button'),value=document.createElement('span'),list=document.createElement('div');
   wrap.className='styled-dropdown';select.before(wrap);wrap.append(select,trigger,list);select.hidden=true;
   trigger.type='button';trigger.id=id;trigger.className='styled-dropdown-trigger';trigger.setAttribute('role','combobox');trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',id+'-list');
   value.className='styled-dropdown-value';trigger.append(value);trigger.insertAdjacentHTML('beforeend',chevron);
   const labels=[...select.labels];labels.forEach((label,i)=>{label.id||=id+'-label-'+i;label.htmlFor=id;});
   if(labels.length){const labelledBy=labels.map(l=>l.id).join(' ');trigger.setAttribute('aria-labelledby',labelledBy);list.setAttribute('aria-labelledby',labelledBy);}else trigger.setAttribute('aria-label',select.getAttribute('aria-label')||select.name||'اختيار');
   list.id=id+'-list';list.className='styled-dropdown-options';list.setAttribute('role','listbox');list.hidden=true;
   let active=select.selectedIndex;
   const options=()=>[...select.options];
   function close(){list.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant');}
   function highlight(index){active=index;[...list.children].forEach((item,i)=>item.classList.toggle('is-active',i===index));trigger.setAttribute('aria-activedescendant',id+'-option-'+index);}
   function refresh(){
    trigger.disabled=select.disabled;value.textContent=select.selectedOptions[0]?.textContent||'';trigger.setAttribute('aria-valuetext',value.textContent);list.replaceChildren();
    options().forEach((option,index)=>{const row=document.createElement('div'),text=document.createElement('span');row.id=id+'-option-'+index;row.className='styled-dropdown-option';row.setAttribute('role','option');row.setAttribute('aria-selected',String(option.selected));row.setAttribute('aria-disabled',String(option.disabled));text.textContent=option.textContent;row.append(text);row.insertAdjacentHTML('beforeend',check);row.onmousedown=e=>e.preventDefault();row.onpointermove=()=>{if(!option.disabled)highlight(index);};row.onclick=()=>choose(index);list.append(row);});
   }
   function choose(index){if(!options()[index]||options()[index].disabled)return;select.selectedIndex=index;refresh();close();trigger.focus();select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));}
   function open(){
    if(select.disabled)return;closeAll();refresh();list.hidden=false;trigger.setAttribute('aria-expanded','true');highlight(Math.max(0,select.selectedIndex));
    const rect=trigger.getBoundingClientRect(),dialog=trigger.closest('dialog'),bounds=dialog?.getBoundingClientRect(),viewport=window.visualViewport,top=Math.max(bounds?.top||0,viewport?.offsetTop||0)+12,bottom=Math.min(bounds?.bottom||innerHeight,(viewport?.offsetTop||0)+(viewport?.height||innerHeight))-12,above=rect.top-top-8,below=bottom-rect.bottom-8,up=below<Math.min(list.scrollHeight,264)&&above>below;
    list.classList.toggle('opens-up',up);list.style.maxHeight=Math.max(44,Math.min(264,up?above:below))+'px';list.children[active]?.scrollIntoView({block:'nearest'});
   }
   trigger.onclick=()=>{trigger.focus({preventScroll:true});if(list.hidden)open();else close();};
   trigger.onkeydown=e=>{
    const available=options().map((o,i)=>o.disabled?-1:i).filter(i=>i>=0);if(!available.length)return;
    if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const wasClosed=list.hidden;if(wasClosed)open();let index=available.indexOf(active);if(e.key==='Home')index=0;else if(e.key==='End')index=available.length-1;else if(!wasClosed)index=(index+(e.key==='ArrowDown'?1:-1)+available.length)%available.length;highlight(available[Math.max(0,index)]);list.children[active]?.scrollIntoView({block:'nearest'});}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();if(list.hidden)open();else choose(active);}
    else if(e.key==='Escape'&&!list.hidden){e.preventDefault();e.stopPropagation();close();}
    else if(e.key==='Tab')close();
   };
   select.addEventListener('change',refresh);select.form?.addEventListener('reset',()=>queueMicrotask(refresh));const dialog=trigger.closest('dialog');dialog?.addEventListener('close',close);if(dialog&&!dialogs.has(dialog)){dialogs.add(dialog);dialog.addEventListener('cancel',e=>{if(performance.now()-lastMenuEscape<300||[...controls.values()].some(c=>c.wrap.closest('dialog')===dialog&&c.wrap.querySelector('[aria-expanded=true]'))){e.preventDefault();closeAll();}});}
   controls.set(select,{wrap,close,refresh});refresh();
  });
 }
 for(const event of ['click','focusin'])document.addEventListener(event,e=>controls.forEach(c=>{if(!c.wrap.contains(e.target))c.close();}));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&[...controls.values()].some(c=>c.wrap.querySelector('[aria-expanded=true]'))){lastMenuEscape=performance.now();e.preventDefault();e.stopPropagation();closeAll();}},true);
 window.StyledDropdowns={enhance,closeAll};
})();
