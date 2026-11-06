const fs=require('node:fs'),path=require('node:path');
const soundApps=['arabicsounds','auditory-rehabilitation'];
const appDirectory=app=>path.join(__dirname,'..',...(['voc','senb','taffaha'].includes(app)?['VSS',app]:[app]));
for(const app of ['voc','senb','taffaha',...soundApps])for(const file of ['app-navigation.js','app-navigation.css','flow-ui.js','flow-ui.css','accounts.js','session-homework.js','session-homework.css','updates.js','welcome.js','welcome.css']){
 if(soundApps.includes(app)&&['app-navigation.js','accounts.js'].includes(file))continue;
 if(soundApps.includes(app)&&file.startsWith('session-homework'))continue;
 if(soundApps.includes(app)&&file.startsWith('welcome.'))continue;
 const source=fs.readFileSync(path.join(__dirname,file)),target=path.join(appDirectory(app),'assets',file);
 if(process.argv.includes('--check')){if(!fs.existsSync(target)||!source.equals(fs.readFileSync(target)))throw Error('Navigation copy is stale: '+target);}
 else fs.writeFileSync(target,source);
}

const logos={voc:'images/logo.webp',senb:'assets/icons/logo.webp',taffaha:'assets/icons/logo.webp',arabicsounds:'images/logo.webp','auditory-rehabilitation':'images/logo.webp'};
for(const app of Object.keys(logos).filter(app=>!soundApps.includes(app)))for(const [id,file]of Object.entries(logos)){
 const source=fs.readFileSync(path.join(appDirectory(id),file)),directory=path.join(appDirectory(app),'assets/navigation'),target=path.join(directory,id+'.webp');
 if(process.argv.includes('--check')){if(!fs.existsSync(target)||!source.equals(fs.readFileSync(target)))throw Error('Navigation logo is stale: '+target);}
 else{fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(target,source);}
}

for(const app of soundApps)for(const file of ['sound-navigation.js','sound-accounts.js','sound-progress.js','sound-suite.js','sound-suite.css','detection-game.js','detection-game.css','parent-gate.js','parent-gate.css']){
 const origin=file.startsWith('parent-gate')?path.join(appDirectory('voc'),'assets',file):path.join(__dirname,file),target=path.join(appDirectory(app),'assets',({'sound-navigation.js':'app-navigation.js','sound-accounts.js':'accounts.js'})[file]||file),source=fs.readFileSync(origin);
 if(process.argv.includes('--check')){if(!fs.existsSync(target)||!source.equals(fs.readFileSync(target)))throw Error('Sound suite copy is stale: '+target);}else fs.writeFileSync(target,source);
}
for(const file of ['updates.js','welcome.js','welcome.css']){
 const source=fs.readFileSync(path.join(__dirname,file)),target=path.join(__dirname,'../VSS/assets',file);
 if(process.argv.includes('--check')){if(!fs.existsSync(target)||!source.equals(fs.readFileSync(target)))throw Error('VSS copy is stale: '+target);}
 else{fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,source);}
}

