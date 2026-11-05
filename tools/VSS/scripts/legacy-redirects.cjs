// Publication-only compatibility paths; source activities live only in tools/VSS.
const fs=require('node:fs'),path=require('node:path');
const modules=['voc','senb','taffaha'];
function writeRedirects(site){
 for(const module of modules){
  const directory=path.join(site,'tools',module);fs.mkdirSync(directory,{recursive:true});
  const pages=fs.readdirSync(path.join(__dirname,'..',module)).filter(file=>file.endsWith('.html'));
  for(const page of pages){
   const target=`../VSS/${module}/${page}`;
   fs.writeFileSync(path.join(directory,page),`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VSS</title><script>location.replace(${JSON.stringify(target)}+location.search+location.hash);</script><a href="${target}">فتح VSS</a></html>\n`);
  }
  // Replaces legacy offline workers on their next online check, without clearing
  // child accounts, other app caches, or unrelated registrations on this origin.
  fs.writeFileSync(path.join(directory,'sw.js'),`self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{await self.clients.claim();for(const client of await self.clients.matchAll({type:'window'})){if(client.url.startsWith(self.registration.scope)){const url=new URL(client.url);url.pathname=url.pathname.replace('/tools/${module}/','/tools/VSS/${module}/');await client.navigate(url.href);}}await self.registration.unregister();})()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const url=new URL(e.request.url);if(!url.href.startsWith(self.registration.scope))return;url.pathname=url.pathname.replace('/tools/${module}/','/tools/VSS/${module}/');e.respondWith(Promise.resolve(Response.redirect(url.href,302)));});\n`);
 }
}
module.exports={writeRedirects};
