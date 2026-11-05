// Keep source word IDs and whole-word audio together. Reviewed artwork/title
// corrections and all shipped media are local to Taffaha.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),voc=path.resolve(root,'../voc'),senb=path.resolve(root,'../senb');
const source=fs.readFileSync(path.join(voc,'index.html'),'utf8');
const start=source.indexOf('const RAW_CATEGORIES ='),end=source.indexOf('const app =',start);
if(start<0||end<0)throw Error('VOC label definitions not found');
const categories=vm.runInNewContext(source.slice(start,end)+';JSON.parse(JSON.stringify(CATEGORIES))',{}, {timeout:1000});
const senbSource=fs.readFileSync(path.join(senb,'assets/data.js'),'utf8');
const senbData=vm.runInNewContext(senbSource.slice(0,senbSource.indexOf('const VERB_CONJUGATIONS'))+';JSON.parse(JSON.stringify({categories:CATEGORIES,items:ITEMS_DATABASE}))',{}, {timeout:1000});
// Each category has fifteen cards. Divisions follow the supplied Arabic bank;
// compound names remain intact, including their original whole-name recording.
const groups={
 1:[
  [3,'عين',['عَيْن']],[5,'ماء',['ماء']],[6,'توت',['توت']],
  [6,'موز',['موز']],[6,'تين',['تين']],[6,'خوخ',['خوخ']],
  [7,'ثوم',['ثوم']],[7,'خس',['خَس']],[20,'فيل',['فيل']],
  [20,'دب',['دُب']],[3,'فم',['فَم']],[16,'ديك',['ديك']],
  [17,'حوت',['حوت']],[24,'باب',['باب']],[24,'بيت',['بَيْت']]
 ],
 2:[
  [6,'موزة',['مو','زة']],[6,'ليمون',['لي','مون']],
  [6,'بطيخ',['بَطْ','طيخ']],[6,'كيوي',['كي','وي']],
  [6,'عنب',['عِ','نَب']],[6,'مانجا',['مانْ','جا']],
  [5,'حليب',['حَ','ليب']],[5,'بيتزا',['بيتْ','زا']],
  [5,'بوظة',['بو','ظة']],[5,'شوربة',['شورْ','بة']],
  [7,'خيار',['خِ','يار']],[7,'جزر',['جَ','زَر']],
  [7,'ذرة',['ذُرْ','رة']],[7,'كوسا',['كو','سا']],
  [7,'بصل',['بَ','صَل']]
 ],
 3:[
  [6,'تفاحة',['تُفْ','فا','حة']],[5,'بطاطا',['بَ','طا','طا']],
  [6,'اناناس',['أَ','نا','ناس']],[7,'بندورة',['بَنْ','دو','رة']],
  [6,'برتقال',['بُرْ','تُ','قال']],[7,'باذنجان',['با','ذِنْ','جان']],
  [7,'بروكلي',['بْرو','كُ','لي']],[16,'حمامة',['حَ','ما','مة']],
  [15,'دجاجة',['دَ','جا','جة']],[18,'فراشة',['فَ','را','شة']],
  [20,'زرافة',['زَ','را','فة']],[22,'بيجاما',['بي','جا','ما']],
  [23,'سيارة',['سَيْ','يا','رة']],[27,'حديقة',['حَ','دي','قة']],
  [31,'مكتبة',['مَكْ','تَ','بة']]
 ],
 4:[
  [5,'معكرونة',['مَعْ','كَ','رو','نة']],
  [6,'افوكادو',['أَ','فو','كا','دو']],
  [8,'ليمونادة',['لي','مو','نا','دة']],
  [23,'هليكوبتر',['هِ','لي','كوبْ','تَر']],
  [32,'برتقالي',['بُرْ','تُ','قا','لي']],
  [35,'عصاية طبل',['عَ','صا','ية','طَبْل']],
  [34,'حقيبة ظهر',['حَ','قي','بة','ظَهْر']],
  [34,'صندوق غذاء',['صُنْ','دوق','أَ','كل'],'صندوق اكل'],
  [36,'سماعة رأس',['سَمْ','ما','عة','رَأْس']],
  [34,'لوح طباشير',['لَوْح','طَ','با','شير']],
  [11,'معجون اسنان',['مَعْ','جون','أَسْ','نان']],
  [8,'قنينة مي',['قَ','ني','نة','مَي']],
  [24,'سلة غسيل',['سَلْ','لة','غَ','سيل']],
  [28,'غرفة غسيل',['غُرْ','فة','غَ','سيل']],
  [28,'غرفة صالون',['غُرْ','فة','صا','لون']]
 ],
 5:[
  [7,'بطاطا حلوة',['بَ','طا','طا','حِلْ','وة']],
  [8,'عصير برتقال',['عَ','صير','بُرْ','تُ','قال']],
  [10,'سيارة اسعاف',['سَيْ','يا','رة','إِسْ','عاف']],
  [10,'سيارة اطفاء',['سَيْ','يا','رة','إِطْ','فاء']],
  [10,'سيارة شرطة',['سَيْ','يا','رة','شُرْ','طة']],
  [36,'جهاز تحكم',['جِ','هاز','تَ','حَكْ','كُم']],
  [10,'فقاعات صابون',['فُ','قا','عات','صا','بون']],
  [8,'كوكتيل فواكه',['كوك','تيل','فَ','وا','كه']],
  ['senb','طبيب بيطري',['طَ','بيب','بَيْ','طَ','ري']],
  [30,'موقف سيارات',['مَوْ','قِف','سَيْ','يا','رات']],
  [31,'محطة اطفاء',['مَ','حَطْ','طة','إِطْ','فاء']],
  [34,'طالب مدرسة',['طا','لِب','مَدْ','رَ','سة']],
  [37,'راقصة باليه',['را','قِ','صة','با','ليه']],
  ['senb','طبيبة عيون',['طَ','بي','بة','عُ','يون']],
  ['senb','طبيبة اسنان',['طَ','بي','بة','أَسْ','نان']]
 ]
};
const imageOverrides={
 'voc-5-21':'images/5/29.webp', // حليب
 'voc-5-23':'images/5/27.webp', // بيتزا
 'voc-5-25':'images/5/23.webp', // بوظة
 'voc-5-33':'images/5/35.webp', // معكرونة
 'voc-5-32':'images/5/34.webp', // شوربة
 'voc-5-15':'images/7/21.webp'  // بطاطا: use whole potatoes instead of fries
};
const words=[],mapping=[
 'تف فا حة — خريطة ملفات المقاطع الصوتية M4A',
 'كلمات المقطع الواحد تستخدم نسخة محلية من صوت الكلمة الأصلي؛ لا تحتاج إلى تسجيل ملفات جديدة.',
 'ضع تسجيلات كلمات المقاطع المتعددة داخل tools/VSS/taffaha/assets/sounds/ ثم مجلد عدد المقاطع (2 إلى 5).',
 'كل ملف يحتوي على مقطع واحد فقط. يُقرأ ترتيب المقاطع من اليمين إلى اليسار كما في الكلمة.',
 'الترقيم مستقل لكل مجلد ومتصل بين الكلمات؛ لا يبدأ من جديد لكل كلمة.',
 'تُسجّل المقاطع بحسب النطق المبين هنا دون إضافة أسماء الحروف أو حركات إعراب.',
 'كل المسارات محلية ونسبية إلى tools/VSS/taffaha/. يلزم تجهيز 210 ملفات للمقاطع المتعددة؛ أصوات المقطع الواحد موجودة بالفعل.',
 ''
];
for(const [countText,rows]of Object.entries(groups)){
 const count=Number(countText);if(rows.length!==15)throw Error(`Group ${count} needs fifteen cards`);
 const folder=path.join(root,'assets/sounds',countText);fs.mkdirSync(folder,{recursive:true});
 const folderMapping=count===1?['كلمات المقطع الواحد تستخدم نسخة محلية من صوت الكلمة الأصلي؛ لا يلزم تسجيل ملفات هنا.','كل المسارات محلية ونسبية إلى tools/VSS/taffaha/.']:[];let fileNumber=0;
 mapping.push(count===1?'=== مقطع واحد — 15 صوتًا أصليًا من VOC، دون ملفات جديدة ===':`=== ${count} مقاطع — assets/sounds/${count}/ — ${rows.length*count} ملفًا ===`);
 for(const [categoryID,sourceLabel,syllables,label=sourceLabel]of rows){
  if(syllables.length!==count)throw Error('Incorrect syllable count: '+label);
  let library='voc',base=voc,item,sourceCategory,id;
  if(categoryID==='senb'){
   library='senb';base=senb;
   const category=senbData.categories.find(c=>c.id==='01 subject');
   const entry=senbData.items[category.id].find(w=>w.title===sourceLabel);
   if(!entry)throw Error('SENB label missing: '+label);
   item={image:category.path+entry.id+'.webp',audio:'sounds/subject/'+entry.id+'.m4a'};
   id='senb-subject-'+entry.id;sourceCategory=category.name;
  }else{
   const category=categories.find(c=>c.id===categoryID);item=category?.items.find(w=>w.name===sourceLabel);
   if(!item)throw Error('VOC label missing: '+label);
   id=`voc-${categoryID}-${item.id}`;sourceCategory=category.name;
  }
  const imagePath=imageOverrides[id]||item.image;
  for(const file of [imagePath,item.audio])if(!fs.existsSync(path.join(base,file)))throw Error('Missing source media: '+library+'/'+file);
  function copyAsset(sourcePath,localPath){
   const body=fs.readFileSync(path.join(base,sourcePath)),target=path.join(root,localPath);
   fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,body);
   return {library:'taffaha',path:localPath,revision:crypto.createHash('sha256').update(body).digest('hex')};
  }
  const image=copyAsset(imagePath,`assets/images/${library}/${imagePath.replace(/^images\//,'')}`);
  const audio=copyAsset(item.audio,`assets/sounds/words/${library}/${item.audio.replace(/^sounds\//,'')}`);
  const syllableAudio=count===1?[audio]:syllables.map(()=>{
   const file=`assets/sounds/${count}/${++fileNumber}.m4a`,asset={library:'taffaha',path:file};
   if(fs.existsSync(path.join(root,file)))asset.revision=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
   return asset;
  });
  words.push({id,label,syllableCount:count,sourceCategory,syllables,
   image,audio,syllableAudio});
  mapping.push('',label+' — '+syllables.join(' / '));
  folderMapping.push('',label+' — '+syllables.join(' / '));
  syllables.forEach((part,i)=>{
   const asset=syllableAudio[i],audioPath=asset.library==='taffaha'?asset.path:`../${asset.library}/${asset.path}`;
   const line=`${audioPath} = ${part} | الكلمة: ${label} | المقطع: ${i+1}/${count}`;
   mapping.push(line);folderMapping.push(line);
  });
 }
 fs.writeFileSync(path.join(folder,'mapping.txt'),folderMapping.join('\n').trim()+'\n');mapping.push('');
}
if(new Set(words.map(w=>w.id)).size!==75)throw Error('Duplicate cards');
fs.writeFileSync(path.join(root,'assets/words.json'),JSON.stringify({words},null,2)+'\n');
fs.writeFileSync(path.join(root,'assets/sounds/mapping.txt'),mapping.join('\n')+'\n');
console.log('Built 75 cards: fifteen in each group, with 15 reused whole-word recordings and 210 positional M4A mappings.');
