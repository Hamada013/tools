/* Pointer, touch and keyboard share exactly one sound/no-sound response. */
const colors=['#f6b63f','#65bbd0','#b68bdf','#ed8392','#7abf8e','#ee9460'];
const shapes=[
 '<rect x="15" y="15" width="70" height="70" rx="14"/>',
 '<circle cx="50" cy="50" r="36"/>',
 '<path d="M50 9 91 82H9Z"/>',
 '<path d="m50 8 40 42-40 42L10 50Z"/>',
 '<path d="m50 7 12 27 30 3-23 21 7 31-26-16-26 16 7-31L8 37l30-3Z"/>',
 '<path d="M30 12h40v20h20v38H70v20H30V70H10V32h20Z"/>'
];
export function createDetectionGame({host,icon,onAnswer,onReplay,round=0}){
 const controller=new AbortController(),{signal}=controller;
 let ready=false,answered=false,ghost=null,start=null,moved=false,suppress=false;
 const shape=round%shapes.length,color=colors[round%colors.length];
 host.innerHTML=`<div class="detect-game"><button class="detect-ear" type="button" aria-label="استمع مرة أخرى" disabled>${icon('ear')}</button><div class="detect-playground"><div class="detect-toys"><button id="heard" class="detect-token detect-toy" type="button" aria-label="سمعت صوتًا؛ اسحب اللعبة إلى السلة أو المسها" disabled style="--toy-color:${color}" data-shape="${shape}"><svg viewBox="0 0 100 100" aria-hidden="true">${shapes[shape]}<path class="toy-shine" d="M30 28h12"/></svg></button><button id="silent" class="detect-token detect-no" type="button" aria-label="لم أسمع صوتًا؛ المس إشارة لا أو اسحبها إلى السلة" disabled>${icon('close')}</button></div><button class="detect-bucket" type="button" data-detect-bucket aria-label="السلة: ضع اللعبة للصوت أو إشارة لا للسكوت" disabled><svg viewBox="0 0 180 130" aria-hidden="true"><path class="bucket-body" d="m20 35 16 79q54 18 108 0l16-79Z"/><ellipse cx="90" cy="35" rx="70" ry="18"/><path d="m51 61 8 42m31-40v44m39-46-8 42"/></svg></button></div></div>`;
 const root=host.firstElementChild,ear=root.querySelector('.detect-ear'),bucket=root.querySelector('.detect-bucket'),tokens=[...root.querySelectorAll('.detect-token')];
 const clear=()=>{ghost?.remove();ghost=null;start=null;root.classList.remove('detect-dragging');bucket.classList.remove('drop-ready');};
 function answer(value){if(!ready||answered||!root.isConnected)return;answered=true;ready=false;clear();tokens.forEach(node=>node.disabled=true);bucket.disabled=true;ear.disabled=true;onAnswer(value);}
 for(const token of tokens){
  const value=token.id==='heard';
  token.addEventListener('click',e=>{if(suppress){suppress=false;e.preventDefault();return;}answer(value);},{signal});
  token.addEventListener('pointerdown',e=>{if(!ready||e.button!==0)return;suppress=false;start={x:e.clientX,y:e.clientY};moved=false;token.setPointerCapture(e.pointerId);},{signal});
  token.addEventListener('pointermove',e=>{if(!start)return;if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>7){moved=true;e.preventDefault();root.classList.add('detect-dragging');if(!ghost){ghost=token.cloneNode(true);ghost.removeAttribute('id');ghost.removeAttribute('disabled');ghost.className+=' detect-ghost';ghost.setAttribute('aria-hidden','true');ghost.removeAttribute('aria-label');document.body.append(ghost);}ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';const r=bucket.getBoundingClientRect();bucket.classList.toggle('drop-ready',e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom);}},{signal});
  token.addEventListener('pointerup',e=>{if(moved){suppress=true;const r=bucket.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)answer(value);}clear();},{signal});
  for(const event of ['pointercancel','lostpointercapture'])token.addEventListener(event,clear,{signal});
 }
 bucket.addEventListener('click',()=>answer(true),{signal});ear.addEventListener('click',()=>{if(ready)onReplay?.();},{signal});
 return {root,retry(){ready=true;ear.disabled=false;tokens.forEach(node=>node.disabled=true);bucket.disabled=true;},playing(value){root.dataset.playing=String(value);ready=false;tokens.forEach(node=>node.disabled=true);ear.disabled=true;bucket.disabled=true;},enable(){if(answered)return;root.dataset.playing='false';ready=true;tokens.forEach(node=>node.disabled=false);ear.disabled=!onReplay;bucket.disabled=false;},destroy(){controller.abort();clear();}};
}
