const fs=require('node:fs'),path=require('node:path');
// Shared sources for the two sound apps in this repository.
const soundApps=['arabicsounds','auditory-rehabilitation'];
const appDirectory=app=>path.join(__dirname,'..',app);
for(const app of soundApps)for(const file of ['app-navigation.css','flow-ui.js','flow-ui.css','updates.js']){
 const source=fs.readFileSync(path.join(__dirname,file)),target=path.join(appDirectory(app),'assets',file);
 if(process.argv.includes('--check')){if(!fs.existsSync(target)||!source.equals(fs.readFileSync(target)))throw Error('Navigation copy is stale: '+target);}
 else fs.writeFileSync(target,source);
}

for(const app of soundApps)for(const file of ['sound-navigation.js','sound-accounts.js','sound-progress.js','sound-suite.js','sound-suite.css','detection-game.js','detection-game.css','parent-gate.js','parent-gate.css']){
 const origin=path.join(__dirname,file),target=path.join(appDirectory(app),'assets',({'sound-navigation.js':'app-navigation.js','sound-accounts.js':'accounts.js'})[file]||file),source=fs.readFileSync(origin);
 if(process.argv.includes('--check')){if(!fs.existsSync(target)||!source.equals(fs.readFileSync(target)))throw Error('Sound suite copy is stale: '+target);}else fs.writeFileSync(target,source);
}
