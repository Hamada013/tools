'use strict';
// The tools stand alone: the main website links here, never the other way round.
const fs=require('node:fs'),path=require('node:path');
const site=path.resolve(__dirname,'../../output/pages'),banned=/speech-website|assets\/site\/|(?:^|["'`/])(?:forms|resources)\.html|\.\.\/forms\//;
const bad=[];let checked=0;
for(const entry of fs.readdirSync(site,{recursive:true,withFileTypes:true})){
 if(!entry.isFile()||!/\.(html|js|css|json|webmanifest)$/.test(entry.name))continue;
 const file=path.join(entry.parentPath,entry.name);checked++;
 if(banned.test(fs.readFileSync(file,'utf8')))bad.push(path.relative(site,file));
}
if(!fs.existsSync(path.join(site,'index.html')))throw Error('Run the site build first.');
if(bad.length)throw Error('Links back to the main website:\n'+bad.join('\n'));
console.log(`PASS: ${checked} published files have no link back to the main website.`);
