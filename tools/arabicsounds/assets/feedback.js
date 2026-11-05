// One visual treatment for scored answers throughout the app.
export function showAnswerFeedback(correct,id){
 document.getElementById(id)?.remove();
 const node=document.createElement('div');node.id=id;
 node.className=`ling-feedback ${correct?'correct':'incorrect'}`;
 const label=correct?'إجابة صحيحة':'إجابة غير صحيحة';
 node.setAttribute('role','status');node.setAttribute('aria-label',label);
 node.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${correct?'m4 12 5 5L20 6':'m6 6 12 12 M18 6 6 18'}"/></svg>`;
 document.body.append(node);document.getElementById('announcement').textContent=label;
 return node;
}
