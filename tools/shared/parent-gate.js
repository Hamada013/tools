/* A fresh, device-local parent calculation before opening account controls. */
(() => {
    'use strict';
    let dialog, pending = null, resolvePending;
    let expected = 0;
    const svg = path => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
    function finish(allowed) {
        if (!pending) return;
        const resolve = resolvePending; pending = null; resolvePending = null;
        dialog.close(); resolve(allowed);
    }
    function init() {
        dialog = document.createElement('dialog'); dialog.className = 'parent-gate'; dialog.id = 'parent-gate'; dialog.dir = 'rtl';
        dialog.setAttribute('aria-labelledby', 'parent-gate-title'); dialog.setAttribute('aria-describedby', 'parent-gate-help');
        dialog.innerHTML = `<header><span class="parent-gate-lock">${svg('<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>')}</span><h2 id="parent-gate-title">للأهل</h2><button type="button" class="parent-gate-close" aria-label="إلغاء">${svg('<path d="m6 6 12 12M18 6 6 18"/>')}</button></header><p id="parent-gate-help">حلّوا المسألة لفتح الحسابات</p><div class="parent-gate-equation" dir="ltr"><span data-left></span><b data-operation></b><span data-right></span><b>=</b><strong>؟</strong></div><div class="parent-gate-choices" role="group" aria-label="اختر الإجابة" aria-describedby="parent-gate-error"></div><p id="parent-gate-error" role="status" aria-live="polite"></p>`;
        document.body.append(dialog);
        dialog.querySelector('.parent-gate-close').onclick = () => finish(false);
        dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
        dialog.addEventListener('close', () => { if (pending && !dialog.open) finish(false); });
        window.addEventListener('pagehide', () => finish(false));
    }
    window.ChildAccountGate = { request() {
        if (pending) return pending;
        if (!dialog) init();
        let left = 1 + Math.floor(Math.random()*9), right = 1 + Math.floor(Math.random()*9);
        const subtraction = Math.random() < .5;
        if (subtraction && left < right) [left,right] = [right,left];
        expected = subtraction ? left-right : left+right;
        dialog.querySelector('[data-left]').textContent = left;
        dialog.querySelector('[data-right]').textContent = right;
        dialog.querySelector('[data-operation]').textContent = subtraction ? '−' : '+';
        dialog.querySelector('[role=status]').textContent = '';
        const values=new Set([expected]);
        while(values.size<3){const value=expected+Math.floor(Math.random()*9)-4;if(value>=0&&value!==expected)values.add(value);}
        const options=[...values];for(let i=options.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[options[i],options[j]]=[options[j],options[i]];}
        const choices=dialog.querySelector('.parent-gate-choices');choices.replaceChildren();
        options.forEach(value=>{
            const button=document.createElement('button');button.type='button';button.dataset.answer=value;button.textContent=value;
            button.onclick=()=>{
                if(value===expected)finish(true);
                else {dialog.querySelector('[role=status]').textContent='جرّبوا مرة تانية 🌱';button.setAttribute('aria-invalid','true');}
            };choices.append(button);
        });
        pending = new Promise(resolve => { resolvePending = resolve; });
        dialog.showModal(); dialog.querySelector('[data-answer]').focus(); return pending;
    } };
})();
