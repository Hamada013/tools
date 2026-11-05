// One build entrypoint for GitHub Pages and the final app bundle. No npm install required.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'../..'),TOOLS=path.join(ROOT,'tools');
const APPS=['VSS','arabicsounds','auditory-rehabilitation'];
const sha=(body,encoding='hex')=>crypto.createHash('sha256').update(body).digest(encoding);
function inventory(app,root=TOOLS){
 const base=path.join(root,app),context={self:{}};
 let release,media,shell;
 if(app==='VSS'){
  vm.runInNewContext(fs.readFileSync(path.join(base,'assets/pwa-release.js'),'utf8'),context);
  release=context.self.VSS_RELEASE;
  media=release.media;
  shell=[...release.shell,'sw.js','assets/pwa-release.js'];
  for(const file of release.shell){
   const expected=release.integrity[file],body=fs.readFileSync(path.join(base,file));
   if(expected!=='sha256-'+sha(body,'base64'))throw Error(`Stale shell: ${app}/${file}`);
  }
 }else{
  release=vm.runInNewContext(fs.readFileSync(path.join(base,'assets/release-worker.js'),'utf8')+';RELEASE;',context);
  media=release.media;shell=[...release.shell.map(entry=>entry.url),'sw.js','assets/release-worker.js'];
  for(const entry of release.shell)if(sha(fs.readFileSync(path.join(base,entry.url)))!==entry.sha)throw Error(`Stale shell: ${app}/${entry.url}`);
 }
 for(const entry of media){
  if(entry.url.startsWith('/')||entry.url.split('/').includes('..'))throw Error('Invalid media path: '+entry.url);
  const body=fs.readFileSync(path.join(base,entry.url));
  if(body.length!==entry.bytes||sha(body)!==(entry.revision||entry.sha))throw Error(`Stale media: ${app}/${entry.url}`);
 }
 const files=[...new Set([...shell,...media.map(entry=>entry.url)])].sort();
 if(files.some(file=>file.startsWith('/')||file.split('/').includes('..')))throw Error('Invalid shell path');
 return {app,version:release.version,mediaCount:media.length,mediaBytes:media.reduce((sum,entry)=>sum+entry.bytes,0),files};
}
function followDirectionInventory(root=TOOLS){
 const prefix='follow-direction/',base=path.join(root,prefix),context={self:{}};
 vm.runInNewContext(fs.readFileSync(path.join(base,'release.js'),'utf8'),context);
 const release=context.self.FD_RELEASE;
 if(release.workerHash!==sha(fs.readFileSync(path.join(base,'sw.js'))))throw Error('Stale Follow Direction worker');
 for(const file of release.files)if(file.hash!==sha(fs.readFileSync(path.join(base,file.url))))throw Error('Stale Follow Direction shell: '+file.url);
 return [...release.files.map(file=>file.url),'sw.js','release.js'].map(file=>prefix+file);
}
function build(){
 cp.execFileSync(process.execPath,[path.join(__dirname,'sync-navigation.cjs')],{stdio:'inherit'});
 for(const app of APPS)cp.execFileSync(process.execPath,[path.join(TOOLS,app,'scripts/build-pwa.cjs')],{stdio:'inherit'});
 cp.execFileSync(process.execPath,[path.join(TOOLS,'follow-direction/scripts/build-pwa.cjs')],{stdio:'inherit'});
 followDirectionInventory();
 return APPS.map(app=>inventory(app));
}
// Each tool is published at the site root, so tools/VSS becomes /tools/VSS/ on GitHub Pages.
function stageSite(releases){
 const destination=path.join(ROOT,'output/pages');
 fs.rmSync(destination,{recursive:true,force:true});fs.mkdirSync(destination,{recursive:true});
 const tracked=cp.execFileSync('git',['ls-files','-z','tools'],{cwd:ROOT}).toString().split('\0').filter(Boolean).map(file=>file.slice('tools/'.length));
 const files=new Set([...tracked,...followDirectionInventory(),...releases.flatMap(release=>release.files.map(file=>`${release.app}/${file}`))]);
 const omitted=new Set(['node_modules','.git','.github','.vscode','output','tmp','tests','scripts','__pycache__']);
 let total=0;
 for(const file of [...files].sort()){
  const parts=file.split('/'),name=parts.at(-1);
  if(parts.some(part=>omitted.has(part))||name==='.DS_Store'||name==='AGENTS.md'||name.startsWith('.env')||name==='package-lock.json'||name==='package.json')continue;
  const source=path.join(TOOLS,file);if(!fs.existsSync(source))continue;
  if(fs.lstatSync(source).isSymbolicLink())throw Error('Pages files must not be symlinks: '+file);
  if(!fs.statSync(source).isFile())continue;
  const target=path.join(destination,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);total++;
 }
 fs.writeFileSync(path.join(destination,'.nojekyll'),'');
 fs.copyFileSync(path.join(TOOLS,'tools.html'),path.join(destination,'index.html'));
 for(const release of releases)inventory(release.app,destination);
 followDirectionInventory(destination);
 console.log(`Pages artifact: ${total} files in output/pages; every app shell and media revision verified.`);
 return destination;
}
if(require.main===module){
 const releases=process.argv.includes('--check')?APPS.map(app=>inventory(app)):build();
 if(process.argv.includes('--check'))followDirectionInventory();
 if(process.argv.includes('--site'))stageSite(releases);
 console.log(JSON.stringify(releases.map(({files,...summary})=>summary),null,2));
}
module.exports={APPS,inventory,build,stageSite};
