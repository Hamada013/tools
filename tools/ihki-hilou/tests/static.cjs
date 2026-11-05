const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),ctx={self:{}},hash=b=>crypto.createHash('sha256').update(b).digest('hex');vm.runInNewContext(fs.readFileSync(path.join(root,'assets/pwa-release.js'),'utf8'),ctx);const release=ctx.self.IHKI_RELEASE;
for(const [file,revision]of Object.entries(release.integrity))assert.equal(hash(fs.readFileSync(path.join(root,file))),revision,file);
for(const a of release.media){const body=fs.readFileSync(path.resolve(root,a.url));assert.equal(body.length,a.bytes);assert.equal(hash(body),a.revision);}
assert.equal(new Set(release.media.map(a=>a.url)).size,release.media.length);
const data=JSON.parse(fs.readFileSync(path.join(root,'assets/prompts.json')));for(const p of data.prompts)for(const a of [...p.images,...p.audio])assert.ok(fs.existsSync(a.library==='local'?path.resolve(root,'assets',a.path):path.resolve(root,'..',a.library,a.path)),p.label);
assert.deepEqual([...new Set(data.prompts.flatMap(p=>p.games))].sort(),['balloon','breeze','bridge','feather','turtle']);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json')));assert.equal(manifest.dir,'rtl');assert.equal(manifest.scope,'./');for(const icon of manifest.icons){const data=fs.readFileSync(path.join(root,icon.src)),[w,h]=icon.sizes.split('x').map(Number);assert.equal(data.readUInt32BE(16),w);assert.equal(data.readUInt32BE(20),h);}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(!/cdn\.tailwind|fonts\.googleapis/.test(html));assert.ok(html.includes('lang="ar" dir="rtl"'));
console.log(`PASS: ${data.prompts.length} prompt mappings, icons, ${release.shell.length} shell hashes, ${release.media.length} shared media hashes.`);
