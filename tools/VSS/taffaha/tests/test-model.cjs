const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const {pictureChoices,countChoices,LEVELS}=await import('../test-model.js'),{words}=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/words.json')));
 // Every word, difficulty and random seed must have exactly one valid answer.
 for(const target of words)for(const level of LEVELS)for(const seed of [.01,.28,.62,.99]){
  const choices=pictureChoices(words,target,level,()=>seed);assert.equal(choices.length,2);assert.equal(choices.filter(w=>w.id===target.id).length,1);
  const other=choices.find(w=>w.id!==target.id),difference=Math.abs(target.syllableCount-other.syllableCount);assert.notEqual(other.image.revision,target.image.revision,'Duplicate art cannot be a distractor');
  assert.ok(level==='easy'?difference>=2:level==='moderate'?difference===1:difference===0);
  const counts=countChoices(target.syllableCount,level,()=>seed);assert.equal(counts.length,2);assert.equal(new Set(counts).size,counts.length);assert.ok(counts.includes(target.syllableCount));assert.ok(counts.every(n=>n>=1&&n<=5));
  const gap=Math.abs(counts.find(n=>n!==target.syllableCount)-target.syllableCount);assert.ok(level==='hard'?gap===1:level==='moderate'?gap===2:gap>=Math.min(3,Math.max(target.syllableCount-1,5-target.syllableCount)));
 }
 const target=words[0],left=pictureChoices(words,target,'easy',()=>.01),right=pictureChoices(words,target,'easy',()=>.99);assert.notEqual(left[0].id===target.id,right[0].id===target.id,'Correct picture must not always occupy the same side');
 console.log('PASS: all 75 targets × three levels × four random seeds have valid, unique picture/count answers with no duplicate artwork.');
})().catch(e=>{console.error(e);process.exitCode=1;});
