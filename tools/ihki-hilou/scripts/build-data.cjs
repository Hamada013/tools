// Resolve labels from the authoritative libraries; never guess numbered paths.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),voc=path.resolve(root,'../VSS/voc'),senb=path.resolve(root,'../VSS/senb');
const source=fs.readFileSync(path.join(voc,'index.html'),'utf8'),start=source.indexOf('const RAW_CATEGORIES ='),end=source.indexOf('const app =',start);
if(start<0||end<0)throw Error('VOC labels not found');
const categories=vm.runInNewContext(source.slice(start,end)+';JSON.parse(JSON.stringify(CATEGORIES))',{}, {timeout:1000});
const objects=vm.runInNewContext(fs.readFileSync(path.join(senb,'assets/data.js'),'utf8')+';JSON.parse(JSON.stringify(ITEMS_DATABASE["03 object"]))',{}, {timeout:1000});
const choices=[
 [6,'موزة',['turtle','feather']],[6,'تفاحة',['turtle','feather']],[6,'ليمون',['turtle','bridge']],
 [5,'حليب',['turtle','bridge']],[7,'خيار',['turtle','feather']],[7,'بصل',['feather']],
 [5,'بوظة',['feather']],[5,'كعكة',['feather']],[5,'تونا',['feather']],
 [1,'انا',['breeze']],[1,'اكل',['breeze']],[15,'ارنب',['breeze']],[3,'اذن',['breeze']]
];
const prompts=choices.map(([category,label,games])=>{
 const item=categories.find(c=>c.id===category)?.items.find(w=>w.name===label);if(!item)throw Error(label);
 const match=objects.find(o=>o.title===label),images=[{library:'voc',path:item.image}],audio=[{library:'voc',path:item.audio}];
 if(match){for(const [list,file]of [[images,`images/03 object/${match.id}.webp`],[audio,`sounds/object/${match.id}.m4a`]])if(fs.existsSync(path.join(senb,file)))list.push({library:'senb',path:file});}
 return {id:`voc-${category}-${item.id}`,label,games,images,audio};
});
// Sentences use SENB's reviewed preset lookup so images, titles and recordings
// stay aligned; these are normal library speech, not technique demonstrations.
const context=vm.createContext({});for(const file of ['data.js','grammar.js'])vm.runInContext(fs.readFileSync(path.join(senb,'assets',file),'utf8'),context);
const app=fs.readFileSync(path.join(senb,'assets/app.js'),'utf8');vm.runInContext(app.slice(0,app.indexOf('function navigateTo(')),context);
for(const [folder,sub,n]of [[2,1,1],[2,1,2],[2,1,3],[3,1,1],[3,1,2],[3,1,3]]){
 const p=vm.runInContext(`getAdvancedItemData('${folder}','${sub}',${n})`,context);
 if(!fs.existsSync(path.join(senb,p.imgPath))||!fs.existsSync(path.join(senb,p.soundPath)))throw Error('Missing SENB preset');
 prompts.push({id:`senb-${folder}-${sub}-${n}`,label:p.title,games:['bridge'],images:[{library:'senb',path:p.imgPath}],audio:[{library:'senb',path:p.soundPath}]});
}
prompts.push({id:'breath',label:'نفس لطيف… على راحتك',games:['balloon'],images:[{library:'local',path:'breathing.svg'}],audio:[]});
fs.writeFileSync(path.join(root,'assets/prompts.json'),JSON.stringify({prompts},null,2)+'\n');console.log(`Built ${prompts.length} word/sentence prompts.`);
