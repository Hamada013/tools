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
if(!arabic){
 const pitch=JSON.parse(fs.readFileSync(path.join(root,'assets/sound-pitch.js'),'utf8').match(/export const SOUND_PITCH=(\{[\s\S]*\});\s*$/)[1]);
 assert.equal(Object.keys(pitch).length,50);
 for(let id=1;id<=50;id++){assert(['low','middle','high'].includes(pitch[id].band));assert.equal(pitch[id].sha256,hash(fs.readFileSync(path.join(root,`sounds/${id}.m4a`))));assert.ok(Math.abs(pitch[id].energy.reduce((a,b)=>a+b,0)-1)<.002);}
 const {classify}=require('../scripts/build-sound-pitch.cjs');
 const tone=(hz,amplitude=1)=>Float32Array.from({length:16000},(_,i)=>amplitude*Math.sin(2*Math.PI*hz*i/16000));
 for(const [hz,band]of [[250,'low'],[1000,'middle'],[4000,'high']]){assert.equal(classify(tone(hz)).band,band);assert.equal(classify(tone(hz,.01)).band,band,'Loudness does not change the frequency group');}
 const low=tone(250),high=tone(4000,.2);assert.equal(classify(low.map((value,i)=>value+high[i])).band,'low','Broadband mixtures follow the strongest energy band');
 assert.throws(()=>classify(new Float32Array(16000)),/Empty/);
}
console.log(`PASS ${app}: independent app shell, ${release.media.length} local media hashes, scoped manifest, installation icons, isolated activity data, JavaScript syntax.`);

assert.equal(manifest.prefer_related_applications,false);assert.equal(manifest.display,'standalone');
for(const shot of manifest.screenshots){const body=fs.readFileSync(path.join(root,shot.src));assert.equal(`${body.readUInt32BE(16)}x${body.readUInt32BE(20)}`,shot.sizes);assert(['narrow','wide'].includes(shot.form_factor));}
const navigation=fs.readFileSync(path.join(root,'assets/app-navigation.js'),'utf8');assert(!/urlFor|openApps|reportLinks|location.assign|localStorage/.test(navigation));
assert(html.includes(`src="assets/accounts.js" data-app="${app}"`));
