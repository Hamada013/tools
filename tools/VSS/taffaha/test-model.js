// Question choices never mutate the curated bank or its category order.
export const LEVELS=['easy','moderate','hard'];
export function shuffled(values,random=Math.random){
 const result=[...values];
 for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
const artKey=word=>word.image.revision||`${word.image.library}/${word.image.path}`;
export function pictureChoices(words,target,level,random=Math.random){
 if(!LEVELS.includes(level))throw Error('Unknown difficulty');
 const candidates=words.filter(word=>{
  if(word.id===target.id||artKey(word)===artKey(target))return false;
  const difference=Math.abs(word.syllableCount-target.syllableCount);
  return level==='easy'?difference>=2:level==='moderate'?difference===1:difference===0;
 });
 if(!candidates.length)throw Error('لا توجد صورة مناسبة لهذا المستوى.');
 return shuffled([target,candidates[Math.floor(random()*candidates.length)]],random);
}
export function countChoices(targetCount,level,random=Math.random){
 if(!LEVELS.includes(level)||!Number.isInteger(targetCount)||targetCount<1||targetCount>5)throw Error('Invalid count question');
 const others=[1,2,3,4,5].filter(n=>n!==targetCount);
 const distance=level==='hard'?1:level==='moderate'?2:Math.min(3,Math.max(...others.map(n=>Math.abs(n-targetCount))));
 const candidates=others.filter(n=>level==='easy'?Math.abs(n-targetCount)>=distance:Math.abs(n-targetCount)===distance);
 return shuffled([targetCount,shuffled(candidates,random)[0]],random);
}
