const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),voc=path.resolve(root,'../voc'),senb=path.resolve(root,'../senb'),ctx={self:{}};
const release=require('../../tests/module-release.cjs')('taffaha'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const [file,revision]of Object.entries(release.integrity))assert.equal('sha256-'+crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('base64'),revision,file);
const unique=new Set();for(const a of release.media){assert.ok(!unique.has(a.url));unique.add(a.url);const body=fs.readFileSync(path.resolve(root,a.url));assert.equal(body.length,a.bytes);assert.equal(hash(body),a.revision);}
const {words}=JSON.parse(fs.readFileSync(path.join(root,'assets/words.json'))),source=fs.readFileSync(path.join(voc,'index.html'),'utf8'),start=source.indexOf('const RAW_CATEGORIES ='),end=source.indexOf('const app =',start);
const categories=vm.runInNewContext(source.slice(start,end)+';JSON.parse(JSON.stringify(CATEGORIES))',{}, {timeout:1000});
const ss=fs.readFileSync(path.join(senb,'assets/data.js'),'utf8'),subjects=vm.runInNewContext(ss.slice(0,ss.indexOf('const VERB_CONJUGATIONS'))+';JSON.parse(JSON.stringify(ITEMS_DATABASE["01 subject"]))',{}, {timeout:1000});
const corrections={'voc-5-21':'images/5/29.webp','voc-5-23':'images/5/27.webp','voc-5-25':'images/5/23.webp','voc-5-33':'images/5/35.webp','voc-5-32':'images/5/34.webp','voc-5-15':'images/7/21.webp'};
const titleCorrections={'voc-34-11':'صندوق اكل'};
assert.equal(words.length,75);assert.equal(new Set(words.map(w=>w.id)).size,75);
const mapping=fs.readFileSync(path.join(root,'assets/sounds/mapping.txt'),'utf8'),allClips=new Set();
for(let n=1;n<=5;n++){
 const group=words.filter(w=>w.syllableCount===n);assert.equal(group.length,15);
 const folderMapping=fs.readFileSync(path.join(root,`assets/sounds/${n}/mapping.txt`),'utf8');let clip=0;
 for(const word of group){
  assert.equal(word.syllables.length,n);assert.equal(word.syllableAudio.length,n);
  let item,base;
  if(word.id.startsWith('voc-')){
   const [,folder,number]=word.id.split('-');item=categories.find(c=>c.id===Number(folder)).items.find(w=>w.id===Number(number));base=voc;
  }else{
   const subject=subjects.find(w=>w.id===Number(word.id.split('-')[2]));item={name:subject.title,image:`images/01 subject/${subject.id}.webp`,audio:`sounds/subject/${subject.id}.m4a`};base=senb;
  }
  assert.equal(word.label,titleCorrections[word.id]||item.name);
  const library=word.id.startsWith('voc-')?'voc':'senb';
  const originalImage=corrections[word.id]||item.image;
  assert.equal(word.audio.path,`assets/sounds/words/${library}/${item.audio.replace(/^sounds\//,'')}`,'Whole-word copy retains source ID');
  assert.equal(word.image.path,`assets/images/${library}/${originalImage.replace(/^images\//,'')}`,'Only reviewed artwork may differ');
  for(const [asset,sourcePath]of [[word.image,originalImage],[word.audio,item.audio]]){
   assert.equal(asset.library,'taffaha');
   assert.deepEqual(fs.readFileSync(path.join(root,asset.path)),fs.readFileSync(path.join(base,sourcePath)),'Local copy matches original');
   assert.equal(asset.revision,hash(fs.readFileSync(path.join(root,asset.path))));
  }
  for(const [i,part]of word.syllables.entries()){
   assert.ok(part.trim().length>0);const a=word.syllableAudio[i];clip++;
   if(n===1){
    assert.deepEqual(a,word.audio,'One-syllable audio reuses the whole word');
    assert.equal(a.library,word.image.library);
    assert.equal(a.path,word.image.path.replace(/^assets\/images\//,'assets/sounds/words/').replace(/\.webp$/,'.m4a'),'One-syllable picture/audio share their source number');
   }else{
    assert.equal(a.library,'taffaha');assert.equal(a.path,`assets/sounds/${n}/${clip}.m4a`);
   }
   const key=a.library+'/'+a.path;assert.ok(!allClips.has(key));allClips.add(key);
   const audioPath=a.library==='taffaha'?a.path:`../${a.library}/${a.path}`;
   const line=`${audioPath} = ${part} | الكلمة: ${word.label} | المقطع: ${i+1}/${n}`;
   for(const list of [mapping,folderMapping])assert.ok(list.split('\n').includes(line),line);
   if(a.library==='taffaha'&&fs.existsSync(path.join(root,a.path))){assert.equal(a.revision,hash(fs.readFileSync(path.join(root,a.path))));assert.ok(release.media.some(m=>m.url===a.path&&m.library==='taffaha'));}
  }
 }
 assert.equal(clip,15*n);
}
const expectedMedia=new Set(words.flatMap(w=>[w.image,w.audio,...w.syllableAudio]).filter(a=>fs.existsSync(path.join(root,a.path))).map(a=>a.path));
assert.deepEqual(new Set(release.media.map(a=>a.url)),expectedMedia,'Only files used by Taffaha are downloaded');
assert.ok(release.media.every(a=>a.library==='taffaha'&&a.url.startsWith('assets/')&&!a.url.includes('..')));
assert.ok(release.shell.every(file=>!expectedMedia.has(file)),'Media is opt-in, not part of shell installation');
assert.equal(release.media.length,360);
assert.equal(allClips.size,225);assert.match(mapping,/assets\/sounds\/2\/1\.m4a = مو/);assert.match(mapping,/assets\/sounds\/2\/2\.m4a = زة/);
for(const file of release.shell.filter(f=>f.endsWith('.js')))require('node:child_process').execFileSync(process.execPath,['--check',path.join(root,file)]);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(html.includes('lang="ar" dir="rtl"'));assert.ok(html.includes('slp.ahmadghanem@gmail.com'));
for(const text of ['لنقلها معًا!','مقطع… مقطع','toggle-recording','recording-bar','save-copy','stop-audio'])assert.ok(!html.includes(text));
for(const name of ['index.html','app.js','audio.js','storage.js','icons.js','styles.css'])assert.ok(!/getUserMedia|MediaRecorder|VoiceRecorder|recordingID|listRecordings|indexedDB|microphone|record-button|recording-bar/.test(fs.readFileSync(path.join(root,name),'utf8')),name+' has recording code');
console.log(`PASS: 75 source title/audio mappings, 15 cards per group, 15 reused one-syllable recordings, 210 positional M4A mappings, recording removal, icons and ${release.media.length} media hashes.`);
