/* Ordered word sets for automatic workplace filling. Stable word IDs stay unchanged. */
((root) => {
 'use strict';
 const normalize = text => String(text).normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640\s]/g, '').replace(/[أإآ]/g, 'ا');
 const GROUPS = [
  ['beginnings','أول كلماتي','أهلي، ألعابي، وما أحتاجه','sun',[]],
  ['routines','أنا ويومي','جسمي وحركاتي الصغيرة','hand',[1,2,3]],
  ['play','نلعب ونأكل','أشياء نحبها كل يوم','apple',[10,8,6,5,7]],
  ['home','بيتي الدافئ','أهلي وأشيائي المألوفة','home',[9,11,22,24,28,29]],
  ['feelings','أشعر وأصف','مشاعر وألوان وصفات','heart',[4,32,14,33,13]],
  ['animals','أصدقائي الحيوانات','من البيت إلى الغابة والبحر','paw',[15,21,16,17,20,18,19]],
  ['outside','هيا نكتشف','حديقتي ومدينتي والعالم','tree',[27,26,23,25,30,31]],
  ['discover','أتعلم وأبدع','مدرستي والموسيقى والمهن','book',[34,35,36,37]],
  ['concepts','أفكر وأربط','المكان والشكل والعلاقات','shapes',[12,38]],
  ['symbols','حروف وأرقام','رموز أكتشفها على مهل','star',[39,40]]
 ];
 const STARTERS = [
  ['أهلي ولعبتي',[[9,'ماما'],[9,'بابا'],[10,'كرة']]],
  ['أطلب وأرتاح',[[1,'بدي'],[1,'ساعدني'],[1,'استراحة']]],
  ['أشرب وآكل',[[8,'ماء'],[8,'حليب'],[5,'خبز']]],
  ['نلعب سوا',[[10,'سيارة'],[10,'فقاعات صابون'],[10,'دبدوب']]],
  ['أهلاً بك',[[1,'مرحبا'],[1,'شكرا'],[1,'خلصنا']]],
  ['هذا أنا',[[3,'يد'],[3,'عين'],[3,'فم']]],
  ['حركاتي',[[2,'ياكل'],[2,'يشرب'],[2,'ينام']]],
  ['أشياء أحبها',[[6,'تفاحة'],[6,'موزة'],[5,'بسكويت']]]
 ];
 function build(bank) {
  const items=bank.categories.flatMap(category=>category.items),used=new Set(),levels=[],units=[],categories=[];
  const distinct=(a,b)=>normalize(a.name)!==normalize(b.name)&&a.imageHash!==b.imageHash;
  // Rebalance a four-word remainder as 2+2. Backtracking spreads duplicate
  // labels/artwork across different levels without dropping any source word.
  function partition(pool) {
   if(!pool.length)return [];
   if(pool.length<2)return null;
   const size=pool.length===4?2:Math.min(3,pool.length),batch=[pool[0]];
   function fill(at) {
    if(batch.length===size){
     const selected=new Set(batch.map(item=>item.key)),rest=partition(pool.filter(item=>!selected.has(item.key)));
     return rest?[batch.slice(),...rest]:null;
    }
    for(let i=at;i<pool.length;i++)if(batch.every(item=>distinct(item,pool[i]))){
     batch.push(pool[i]);const result=fill(i+1);batch.pop();if(result)return result;
    }
    return null;
   }
   return fill(1);
  }
  const category=(id,title,icon)=>{
   let entry=categories.find(entry=>entry.id===id);
   if(!entry){entry={id,title,icon,levels:[]};categories.push(entry);}return entry;
  };
  const add=(unit,title,pool,categoryId)=>{
   pool=pool.filter(item=>item&&!used.has(item.key));if(!pool.length)return;
   let batches=partition(pool);
   // A future one-word source category gets a distinct review companion.
   if(!batches)batches=pool.map(item=>[item,items.find(other=>other.key!==item.key&&distinct(item,other))].filter(Boolean));
   const section=category(categoryId,title,unit.icon);
   for(const batch of batches){
    if(batch.length<2)continue;
    const keys=batch.map(item=>item.key);pool.filter(item=>keys.includes(item.key)).forEach(item=>used.add(item.key));
    const previous=section.levels.at(-1);
    const level={id:`words-${keys[0]}`,unit:unit.id,categoryId,index:levels.length,categoryIndex:section.levels.length,title,keys,
     previousId:previous?.id||null,previousKeys:previous?.keys||[]};
    levels.push(level);unit.levels.push(level);section.levels.push(level);
   }
  };
  for(const [id,title,subtitle,icon,categoryIds]of GROUPS){
   const unit={id,title,subtitle,icon,levels:[]};units.push(unit);
   if(id==='beginnings')for(const [label,words]of STARTERS){
    const pool=words.map(([cat,name])=>items.find(item=>item.catId===cat&&normalize(item.name)===normalize(name))
     ||(name==='ماء'?items.find(item=>item.catId===8&&item.name==='كاسة مي'):null));
    add(unit,label,pool,'beginnings');
   }
   for(const id of categoryIds){const source=bank.categories.find(entry=>entry.id===id);if(source)add(unit,source.name,source.items,String(id));}
  }
  for(const source of bank.categories){const remaining=source.items.filter(item=>!used.has(item.key));add(units.at(-1),source.name,remaining,String(source.id));}
  const beginnings=categories.find(entry=>entry.id==='beginnings');if(beginnings)beginnings.title='أول كلماتي';
  return {version:2,units:units.filter(unit=>unit.levels.length),categories,levels,items};
 }
 const api={build};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.VocWordLevels=api;
})(globalThis);
