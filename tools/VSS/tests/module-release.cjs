// Project the suite inventory for existing activity/data regression checks.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
module.exports=function(module){
 const context={self:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/pwa-release.js'),'utf8'),context);
 const release=context.self.VSS_RELEASE,prefix=module+'/';
 const shell=release.shell.filter(file=>file.startsWith(prefix)).map(file=>file.slice(prefix.length));
 const integrity=Object.fromEntries(shell.map(file=>[file,release.integrity[prefix+file]]));
 const assets=release.media.filter(a=>a.module===module).map(a=>({...a,url:a.url.slice(prefix.length),library:module}));
 const media=module==='voc'?Array.from({length:40},(_,i)=>assets.filter(a=>new RegExp(`^(images|sounds)/${i+1}/`).test(a.url))):assets;
 return {version:release.version,shell,integrity,media};
};
