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
// Apps that moved to their own repositories: old links and offline copies forward to the new address.
const MOVED=[['follow-direction','/follow-direction/']];
function writeMovedApps(destination){
 for(const [app,to] of MOVED){
  const dir=path.join(destination,app),from='/tools/'+app+'/';fs.mkdirSync(dir,{recursive:true});
  const target='https://hamada013.github.io'+to;
  fs.writeFileSync(path.join(dir,'index.html'),`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${target}"><title>انتقل التطبيق · App moved</title><script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script></head><body><p><a href="${target}">${target}</a></p></body></html>\n`);
  // Replaces the old worker: forwards open windows, then unregisters. Saved accounts stay (same origin).
  fs.writeFileSync(path.join(dir,'sw.js'),`'use strict';
const FROM=${JSON.stringify(from)},TO=${JSON.stringify(to)};
const moved=href=>{const url=new URL(href);url.pathname=TO+url.pathname.slice(FROM.length);return url.href;};
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 try{await self.clients.claim();for(const client of await self.clients.matchAll({type:'window'}))if(new URL(client.url).pathname.startsWith(FROM))await client.navigate(moved(client.url)).catch(()=>{});}
 finally{await self.registration.unregister();}
})()));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method==='GET'&&url.origin===self.location.origin&&url.pathname.startsWith(FROM))event.respondWith(Response.redirect(moved(url.href),302));});
`);
 }
}
function build(){
 cp.execFileSync(process.execPath,[path.join(__dirname,'sync-navigation.cjs')],{stdio:'inherit'});
 for(const app of APPS)cp.execFileSync(process.execPath,[path.join(TOOLS,app,'scripts/build-pwa.cjs')],{stdio:'inherit'});
 return APPS.map(app=>inventory(app));
}
// Each tool is published at the site root, so tools/VSS becomes /tools/VSS/ on GitHub Pages.
function stageSite(releases){
 const destination=path.join(ROOT,'output/pages');
 fs.rmSync(destination,{recursive:true,force:true});fs.mkdirSync(destination,{recursive:true});
 const tracked=cp.execFileSync('git',['ls-files','-z','tools'],{cwd:ROOT}).toString().split('\0').filter(Boolean).map(file=>file.slice('tools/'.length));
 const files=new Set([...tracked,...releases.flatMap(release=>release.files.map(file=>`${release.app}/${file}`))]);
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
 writeMovedApps(destination);
 console.log(`Pages artifact: ${total} files in output/pages; every app shell and media revision verified.`);
 return destination;
}
if(require.main===module){
 const releases=process.argv.includes('--check')?APPS.map(app=>inventory(app)):build();
 if(process.argv.includes('--site'))stageSite(releases);
 console.log(JSON.stringify(releases.map(({files,...summary})=>summary),null,2));
}
module.exports={APPS,inventory,build,stageSite};
