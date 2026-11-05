const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {build}=require('../assets/word-levels.js'),{create}=require('../assets/progress.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../assets/game-data.js'),'utf8'),context);
const bank=JSON.parse(JSON.stringify(context.window.VOC_GAME_DATA)),curriculum=build(bank),keys=curriculum.levels.flatMap(level=>level.keys);
assert.equal(keys.length,994);assert.equal(new Set(keys).size,994,'Rebalancing preserves every word exactly once');
assert.equal(curriculum.units.length,10);assert.equal(curriculum.categories.length,41);assert.equal(curriculum.levels.length,345);
assert.ok(curriculum.levels.every(level=>level.keys.length>=2&&level.keys.length<=3),'Never fill a single-word level');
for(const level of curriculum.levels){
 const items=level.keys.map(key=>curriculum.items.find(item=>item.key===key));
 assert.equal(new Set(items.map(item=>item.name)).size,items.length);
 assert.equal(new Set(items.map(item=>item.imageHash)).size,items.length);
}
assert.deepEqual(curriculum.levels[0].keys,['9_10','9_3','10_2']);assert.deepEqual(build(bank).levels,curriculum.levels);
const map=new Map(),storage={getItem:key=>map.get(key),setItem:(key,value)=>map.set(key,value)};let p=create(storage);p.signIn('سارة');
for(const category of curriculum.categories){
 assert.equal(p.wordLevelUnlocked(category.levels[0]),true,'Every category has its own starting level');
 for(const level of category.levels.slice(1))assert.equal(p.wordLevelUnlocked(level),false);
 for(let i=1;i<category.levels.length;i++)assert.equal(category.levels[i].previousId,category.levels[i-1].id);
}
const [first,second,third]=curriculum.categories[0].levels;
const load=level=>p.saveWorkspace({slotsCount:level.keys.length,slots:level.keys,wordLevel:level});
const records=first.keys.map(key=>({key,correct:true}));load(first);
assert.equal(p.completeWordLevel(first,records),false,'Incomplete tests do not unlock');
assert.equal(p.completeWordLevel(first,records.slice(1),true),false,'Every target must be tested');
assert.equal(p.completeWordLevel(first,[...records,{key:first.keys[0],correct:false}],true),false,'Corrected answers do not pass');
assert.equal(p.wordLevelUnlocked(second),false);
assert.equal(p.completeWordLevel(first,records,true),true);assert.equal(p.wordLevelCompleted(first),true);assert.equal(p.wordLevelUnlocked(second),true);assert.equal(p.wordLevelUnlocked(third),false);
assert.equal(p.mastered(first.keys[0],'expressive'),false,'Expression is not a prerequisite');
p=create(storage);assert.equal(p.wordLevelUnlocked(second),true,'Unlocks survive reload');
assert.equal(p.wordLevelCompleted({...first,keys:first.keys.slice(1)}),false,'Rebalanced levels require evidence for all their current words');
assert.equal(p.wordLevelUnlocked({...second,previousKeys:first.keys.slice(1)}),false);
load(second);p.saveWorkspace({...p.active().workspace,slots:first.keys});assert.equal(p.completeWordLevel(second,second.keys.map(key=>({key,correct:true})),true),false,'Editing the cards invalidates the level association');
p.signIn('عمر');assert.equal(p.wordLevelUnlocked(second),false,'Progress stays private to each child');
p.signIn('Hamada');assert.equal(p.wordLevelUnlocked(third),true,'Admin keeps unrestricted access');load(first);assert.equal(p.completeWordLevel(first,records,true),false,'Hamada does not collect completion records');
assert.equal(p.active().wordLevels,undefined);
// Two tabs can complete starting levels in separate categories without losing either.
p.signIn('سارة');const a=create(storage),b=create(storage),other=curriculum.categories[1].levels[0];
a.saveWorkspace({slots:first.keys,wordLevel:first});b.saveWorkspace({slots:other.keys,wordLevel:other});
a.completeWordLevel(first,records,true);b.completeWordLevel(other,other.keys.map(key=>({key,correct:true})),true);
const fresh=create(storage);assert.equal(fresh.wordLevelCompleted(first),true);assert.equal(fresh.wordLevelCompleted(other),true);
console.log('PASS word levels: 994 words in 345 two/three-word sets, independent category chains, test-only unlocks, durable child progress, changed-card checks and unrestricted Hamada.');
