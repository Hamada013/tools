const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),app=path.basename(root),arabic=app==='arabicsounds';
const ctx={};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/release-worker.js'),'utf8')+';this.release=RELEASE;',ctx);
const release=ctx.release;assert.equal(release.id,app);assert.equal(release.media.length,arabic?62:200);
const hash=body=>crypto.createHash('sha256').update(body).digest('hex');
for(const entry of [...release.shell,...release.media]){assert(!entry.url.includes('..'),entry.url);const body=fs.readFileSync(path.join(root,entry.url));assert.equal(hash(body),entry.sha,entry.url);assert.equal(body.length,entry.bytes);}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json')));assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./index.html');
for(const entry of [...manifest.icons,{src:'icons/apple-touch-icon.png',sizes:'180x180'}]){const body=fs.readFileSync(path.join(root,entry.src));const [w,h]=entry.sizes.split('x').map(Number);assert.equal(body.readUInt32BE(16),w);assert.equal(body.readUInt32BE(20),h);}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),source=fs.readFileSync(path.join(root,'assets/app.js'),'utf8'),data=fs.readFileSync(path.join(root,'assets/data.js'),'utf8');
assert(html.includes('lang="ar" dir="rtl"'));assert(!/http-equiv="refresh"/.test(html));assert(!/aswati|\.\.\/arabicsounds|\.\.\/auditory-rehabilitation/.test(source));
assert(arabic?!data.includes('SOUND_NAMES'):!data.includes('LETTER_MAP'));
for(const file of release.shell.filter(entry=>entry.url.endsWith('.js')))cp.execFileSync(process.execPath,['--check',path.join(root,file.url)]);
assert(release.shell.some(entry=>entry.url==='assets/updates.js'));assert(release.shell.some(entry=>entry.url==='images/logo.webp'));
console.log(`PASS ${app}: independent app shell, ${release.media.length} local media hashes, scoped manifest, installation icons, isolated activity data, JavaScript syntax.`);

assert.equal(manifest.prefer_related_applications,false);assert.equal(manifest.display,'standalone');
for(const shot of manifest.screenshots){const body=fs.readFileSync(path.join(root,shot.src));assert.equal(`${body.readUInt32BE(16)}x${body.readUInt32BE(20)}`,shot.sizes);assert(['narrow','wide'].includes(shot.form_factor));}
const navigation=fs.readFileSync(path.join(root,'assets/app-navigation.js'),'utf8');assert(!/urlFor|openApps|reportLinks|location.assign|localStorage/.test(navigation));
assert(html.includes(`src="assets/accounts.js" data-app="${app}"`));
