const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function walk(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);}
// Generate numbered authoring maps from the same bank used by the app.
const bank=require(path.join(root,'assets/bank.js'));
fs.writeFileSync(path.join(root,'assets/audio/MAPPING.txt'),'OPTIONAL ARABIC RECORDINGS — UTF-8\nRead exactly the prompt, once, naturally. No verbal labels for choices or hints. Existing numbers 001–066 are retained.\n\n'+bank.items.slice().sort((a,b)=>Number(a.audio)-Number(b.audio)).map(i=>`${i.audio}.mp3 | ${i.id} | ${i.phase==='screen'?'فرز':'تدريب'} | ${bank.groups.find(g=>g.id===i.group).label}\n${i.prompt}`).join('\n\n')+'\n');
fs.writeFileSync(path.join(root,'assets/images/MAPPING.txt'),'OPTIONAL OBJECT PICTURES — UTF-8\nSquare isolated recognizable objects, uncluttered background, no letters or numbers. Built-in SVGs remain available if absent.\n\n'+Object.entries(bank.objects).map(([key,o])=>`${o.image}.webp | ${key} | ${o.label}`).join('\n')+'\n\nShapes, colors, sizes and sets of 1–3 objects are drawn in code and need no external media.\nUse real toys for spatial, play and conditional tasks; materials are shown in the book-icon dialog.\n');
const media=walk('assets').filter(f=>/^assets\/(audio\/\d{3}\.mp3|images\/\d{3}\.webp)$/.test(f));
fs.writeFileSync(path.join(root,'assets/media.js'),'window.FollowMedia='+JSON.stringify(media.sort())+';\n');
const files=['index.html','manifest.webmanifest',...walk('assets').filter(f=>!f.endsWith('.txt'))].sort().map(url=>({url,hash:hash(fs.readFileSync(path.join(root,url)))}));
const workerHash=hash(fs.readFileSync(path.join(root,'sw.js')));
const release={version:hash(JSON.stringify(files)+workerHash).slice(0,16),workerHash,files};
fs.writeFileSync(path.join(root,'release.js'),'self.FD_RELEASE='+JSON.stringify(release)+';\n');console.log('Follow Direction: '+files.length+' offline files · '+release.version);
