const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const release=require('../scripts/build-pwa.cjs').build({check:true});
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest')));
assert.equal(manifest.name,'احكي حلو');assert.equal(manifest.short_name,'احكي حلو');assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./index.html');assert.equal(manifest.display,'standalone');
for(const shortcut of manifest.shortcuts)assert.ok(fs.existsSync(path.join(root,shortcut.url)));
for(const icon of [...manifest.icons,{src:'icons/apple-touch-icon.png',sizes:'180x180'}]){
 const bytes=fs.readFileSync(path.join(root,icon.src)),[w,h]=icon.sizes.split('x').map(Number);
 assert.equal(bytes.readUInt32BE(16),w);assert.equal(bytes.readUInt32BE(20),h);
 assert.deepEqual(bytes,fs.readFileSync(path.join(root,'voc',icon.src)),'VSS uses the VOC artwork');
}
assert.equal(release.media.length,7234);assert.equal(new Set(release.media.map(a=>a.url)).size,release.media.length);
for(const [module,total]of Object.entries({voc:1990,senb:4884,taffaha:360})){
 assert.equal(release.media.filter(a=>a.module===module).length,total);
 assert.ok(!fs.existsSync(path.join(root,'..',module)),'No separate top-level app folder: '+module);
 assert.ok(!fs.existsSync(path.join(root,module,'sw.js')),'One VSS worker');
 assert.ok(!fs.existsSync(path.join(root,module,'manifest.json')),'One VSS manifest');
}
for(const file of release.shell.filter(file=>file.endsWith('.html'))){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 const href=source.match(/<link rel="manifest" href="([^"]+)"/)[1];
 assert.equal(path.resolve(root,path.dirname(file),href),path.join(root,'manifest.webmanifest'),file);
 assert.ok(source.includes('name="apple-mobile-web-app-title" content="احكي حلو"'));
 // Check local script, style, image and link references, including ../ suite files.
 for(const [,ref]of source.matchAll(/(?:src|href)="([^"]+)"/g)){
  if(/^(https?:|data:|mailto:|#|javascript:)/.test(ref)||/[{}]/.test(ref))continue;
  const target=path.resolve(root,path.dirname(file),ref.split(/[?#]/)[0]);
  if(/\.(js|css|html|webmanifest|png|svg|webp|woff2)$/.test(target))assert.ok(fs.existsSync(target),file+': '+ref);
 }
}
for(const file of release.shell.filter(file=>file.endsWith('.js')&&!file.startsWith('taffaha/'))){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 if(file==='assets/home.js'){
  const check=require('node:child_process').spawnSync(process.execPath,['--input-type=module','--check'],{input:source,encoding:'utf8'});
  assert.equal(check.status,0,check.stderr);
 }else new vm.Script(source,{filename:file});
}
console.log('PASS: one VSS identity, VOC icons, all activity links, 7,234 media files and a complete verified release.');
