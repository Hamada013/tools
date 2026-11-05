// Concrete words only: each picture depicts the word rather than an abstract placeholder.
// Reuse the app's local Lucide runtime; custom drawings cover the remaining objects.
import * as V from './vendor.js';
const {u} = V;
const drawings = {
  father: [['circle',{cx:12,cy:9,r:7}],['path',{d:'M7 11q5 8 10 0 M9 8h.01 M15 8h.01 M12 10v2 M2 23c0-9 20-9 20 0'}]],
  mother: [['path',{d:'M4 15V9C4-2 20-2 20 9v6 M5 15h3 M16 15h3 M7 7v3a5 5 0 0 0 10 0V7 M7 7q3 0 5-4 2 4 5 4 M9 9h.01 M15 9h.01 M3 23c0-9 18-9 18 0'}]],
  yarn: [['circle',{cx:11,cy:11,r:9}],['path',{d:'M5 4c8 0 14 9 12 13 M3 8c7-1 14 6 15 8 M4 16c4-3 9-4 15-3 M11 2c4 2 7 6 8 10 M9 20c6 4 7-3 13 1'}]],
  zipper: [['path',{d:'M9 2v5l6 5v10 M15 2v5l-6 5v10 M7 5h4 M13 5h4 M7 15h4 M13 15h4 M7 19h4 M13 19h4'}]],
  nose: [['path',{d:'M10 3c0 7-5 11-5 14s4 5 7 3c3 2 7 0 7-3s-5-7-5-14 M9 17h.01 M15 17h.01'}]],
  jar: [['path',{d:'M6 2h12v4H6Z M8 6c0 3-3 3-3 6v10h14V12c0-3-3-3-3-6 M5 12h14 M5 19h14'}]],
  door: [['rect',{x:6,y:2,width:12,height:20,rx:1}],['circle',{cx:15,cy:12,r:1}]],
  house: [['path',{d:'m3 11 9-8 9 8v10H3Z M9 21v-8h6v8'}]],
  duck: [['path',{d:'M4 13c-3 8 15 11 17 0h-6V8a4 4 0 0 0-8 0v4Z M7 8H3l4 3'}],['circle',{cx:11,cy:7,r:.5}]],
  egg: [['path',{d:'M19 15c0 9-14 9-14 0 0-5 4-12 7-12s7 7 7 12Z'}]],
  ear: [['path',{d:'M7 9a6 6 0 1 1 11 3c-3 3-2 8-6 9-3 0-5-2-5-5 M10 10c0-5 7-5 6 0-1 2-4 1-4 5'}]],
  hand: [['path',{d:'M5 13V8a1.5 1.5 0 0 1 3 0v4-8a1.5 1.5 0 0 1 3 0v8-9a1.5 1.5 0 0 1 3 0v9-7a1.5 1.5 0 0 1 3 0v9l2-3c2-2 4 0 2 2l-4 7H9l-6-6c-2-2 0-4 2-1Z'}]],
  crown: [['path',{d:'m3 6 5 5 4-8 4 8 5-5-2 14H5Z M5 16h14'}]],
  window: [['rect',{x:3,y:3,width:18,height:18,rx:1}],['path',{d:'M12 3v18 M3 12h18'}]],
  vase: [['path',{d:'M8 3h8l-2 6c0 4 6 6 4 12H6c-2-6 4-8 4-12Z M8 3h8'}]],
  xray: [['rect',{x:3,y:2,width:18,height:20,rx:2}],['path',{d:'M12 5v14 M7 7l5 2 5-2 M7 11l5 2 5-2 M7 15l5 2 5-2'}]],
  snow: [['path',{d:'M12 2v20 M3 7l18 10 M3 17 21 7 M9 4l3 3 3-3 M9 20l3-3 3 3 M3 10l4-1-1-4 M18 19l-1-4 4-1 M3 14l4 1-1 4 M18 5l-1 4 4 1'}]],
  shirt: [['path',{d:'m8 3-6 5 4 5 2-2v10h8V11l2 2 4-5-6-5c0 5-8 5-8 0Z'}]],
  snake: [['path',{d:'M4 20h13c6 0 6-7 1-7H7c-5 0-5-6 0-6h9 M15 7V4c0-3 7-3 7 1s-7 4-7 2Z'}],['circle',{cx:19,cy:4,r:.5}]],
  garlic: [['path',{d:'M10 2h4v5c1 3 7 3 7 9 0 8-18 8-18 0 0-6 6-6 7-9Z M12 8c-5 5-5 10 0 14 5-4 5-9 0-14Z'}]],
  mountain: [['path',{d:'m2 21 8-18 6 11 2-5 4 12Z M7 10l3 2 3-3'}]],
  rope: [['path',{d:'M9 21V7a4 4 0 1 1 8 0v7a4 4 0 1 1-8 0v-3 M5 21V7a8 8 0 0 1 16 0v7'}]],
  bread: [['path',{d:'M5 10c-6-8 20-8 14 0v11H5Z M5 17h14'}]],
  ring: [['circle',{cx:12,cy:15,r:7}],['path',{d:'m8 4 4-3 4 3-4 5Z'}]],
  tent: [['path',{d:'m2 21 10-19 10 19Z M8 21l4-9 4 9 M10 2l4 0'}]],
  bucket: [['path',{d:'M4 8h16l-2 14H6Z M7 8V6a5 5 0 0 1 10 0v2'}]],
  stairs: [['path',{d:'M2 21v-5h6v-6h6V4h8v17Z'}]],
  corn: [['ellipse',{cx:12,cy:10,rx:4,ry:8}],['path',{d:'M12 3v14 M8 7h8 M8 11h8 M12 22C3 18 3 12 3 12c7 0 9 10 9 10s2-10 9-10c0 0 0 6-9 10Z'}]],
  giraffe: [['path',{d:'M6 22v-8h5V6c-4-6 11-6 10 0l-5 1v15 M12 2V0 M18 2V0 M7 14l-3-3'}],['circle',{cx:17,cy:4,r:.5}]],
  bottle: [['path',{d:'M9 2h6v5l3 4v11H6V11l3-4Z M9 2h6 M6 14h12'}]],
  candle: [['rect',{x:8,y:10,width:8,height:12,rx:1}],['path',{d:'M12 8c-7-2 0-8 0-8s7 6 0 8Z'}]],
  chocolate: [['path',{d:'M5 2h14v20H5Z M5 8h14 M5 15h14 M12 2v20'}]],
  soap: [['rect',{x:3,y:10,width:18,height:11,rx:4}],['ellipse',{cx:12,cy:15,rx:4,ry:2}],['circle',{cx:6,cy:5,r:2}],['circle',{cx:15,cy:4,r:3}]],
  chick: [['ellipse',{cx:12,cy:14,rx:7,ry:6}],['circle',{cx:13,cy:6,r:4}],['path',{d:'m17 5 4 2-4 1 M9 20v3 M15 20v3'}]],
  frog: [['ellipse',{cx:12,cy:15,rx:8,ry:6}],['circle',{cx:7,cy:7,r:4}],['circle',{cx:17,cy:7,r:4}],['path',{d:'M8 15q4 4 8 0 M7 7h.01 M17 7h.01'}]],
  tooth: [['path',{d:'M12 4C1-2 3 13 6 21c2 4 3-7 6-7s4 11 6 7c3-8 5-23-6-17Z'}]],
  bandage: [['path',{d:'m3 15 12-12c5-4 10 1 6 6L9 21c-5 4-10-1-6-6Z M7 11l6 6 M11 7l6 6 M10 12h.01 M12 10h.01 M12 14h.01 M14 12h.01'}]],
  drum: [['ellipse',{cx:12,cy:10,rx:9,ry:3}],['path',{d:'M3 10v10c6 4 12 4 18 0V10 M3 11l6 10 6-10 6 9 M3 2l9 5 M21 2l-9 5'}]],
  nail: [['path',{d:'M5 22V10a7 7 0 0 1 14 0v12 M8 12V7a4 4 0 0 1 8 0v5Z'}]],
  cage: [['path',{d:'M3 21V10a9 9 0 0 1 18 0v11Z M3 10h18 M3 18h18 M8 3v18 M16 3v18 M12 0v3'}]],
  train: [['rect',{x:5,y:2,width:14,height:17,rx:4}],['path',{d:'M5 10h14 M12 2v8 M8 22l2-3 M16 22l-2-3 M8 15h.01 M16 15h.01'}]],
  foot: [['path',{d:'M9 3c-2 5-1 9-4 13-2 3 0 6 4 6h9c4 0 4-4 0-5l-5-2V3Z'}]],
  spoon: [['ellipse',{cx:12,cy:6,rx:4,ry:5}],['path',{d:'M12 11v11'}]],
  mosque: [['path',{d:'M5 22V12h14v10 M5 12c0-5 7-4 7-10 0 6 7 5 7 10 M9 22v-5a3 3 0 0 1 6 0v5 M1 22V6h2v16 M21 22V6h2v16'}]],
  palm: [['path',{d:'M12 22V8 M3 9q1-10 9-1-1-11-8-6 M21 9Q20-1 12 8q1-11 8-6 M3 13q0-9 9-5 0-9 9-5'}]],
  pyramid: [['path',{d:'m2 22 10-20 10 20Z M12 2l3 20 M2 22l13-4 7 4'}]],
  face: [['circle',{cx:12,cy:12,r:10}],['path',{d:'M8 9h.01 M16 9h.01 M12 10v4h-1 M8 17q4 2 8 0'}]],
};
const groups = [
 ['zy','rabbit أرنب'],['Ro','cat قطة'],['Js','dog كلب'],['Vi','bird طير عصفور يمامة'],['Uo','fish سمكة'],['zo','ant نملة'],
 ['Ks','apple تفاح'],['Lp','banana موز'],['Bi','orange lemon برتقال ليمون'],['hy','grape عنب'],['Pp','cherry توت'],['Fp','carrot جزرة'],
 ['Qo','table طاولة'],['k6','armchair كرسي'],['Jp','car سيارة'],['Gp','bike دراجة'],['rf','plane طائرة'],['Ly','boat ship زورق سفينة'],
 ['_o','book كتاب'],['Go','pen قلم'],['qo','mouse'],['Ny','moon قمر هلال'],['Zo','sun شمس'],['Xo','star نجوم'],['Ho','leaf ورقة'],
 ['Lo','flower rose زهرة ورد ياسمين زنبق'],['Ky','tree garden forest شجرة حديقة غابة'],['Ty','map خريطة'],['ef','cloud سحابة غيمة'],['Gn','wind هواء رياح'],
 ['Uf','water ocean sea lake river ماء بحر نهر ينبوع شلال'],['sy','fire نار'],['al','lightning برق'],['R6','bed سرير'],['Qp','cake كعكة'],['Dy','pizza'],
 ['tS','lamp ضوء'],['ng','watch ساعة'],['dj','clock وقت'],['uy','gift هدية'],['sf','key مفتاح'],['Cy','pill دواء'],['Oy','scissors مقص'],['Py','tv تلفاز'],
 ['Jy','truck van'],['Xy','stethoscope طبيب'],['yy','heart قلب'],['ay','eye عين'],['iy','flag علم'],['qp','bell جرس'],['Sy','mail رسالة ظرف'],
 ['af','image صورة لوحة'],['Bj','glasses نظارة'],['ry','game toy'],['xy','keyboard'],['Wy','umbrella'],['Yy','speaker صوت'],
 ['tg','boy man ولد رجل طفل'],['father','father أب'],['mother','mother أمي'],
 ['yarn','yarn'],['zipper','zip'],['nose','nose'],['jar','jar jam'],['rf','jet'],['T6','صندوق'],['door','door gate باب'],['house','home house بيت منزل دار مدرسة'],['duck','duck بطة وزة'],['egg','egg'],['ear','ear'],['hand','hand arm يد ذراع'],
 ['crown','king queen تاج'],['window','window'],['vase','vase'],['xray','x-ray'],['snow','ice snow ثلج شتاء'],['shirt','coat vest shirt ثوب فستان قميص بنطلون'],
 ['snake','ثعبان'],['garlic','ثوم'],['mountain','جبل'],['rope','حبل'],['bread','خبز'],['ring','خاتم'],['tent','خيمة'],['bucket','دلو'],['stairs','درج'],
 ['corn','ذرة'],['giraffe','زرافة'],['bottle','زيت'],['candle','شمعة'],['chocolate','شيكولاتة'],['soap','soap صابون'],['chick','صوص دجاجة ديك'],
 ['frog','ضفدع'],['tooth','ضرس'],['bandage','ضمادة'],['drum','طبل'],['nail','ظفر'],['cage','قفص'],['train','قطار'],['foot','foot leg قدم'],
 ['spoon','ملعقة'],['mosque','مسجد'],['palm','نخلة'],['pyramid','هرم'],['face','وجه'],
];
const byWord = new Map(groups.flatMap(([icon, words]) => words.split(' ').map(word => [word, icon])));
function picture(icon) {
  if (drawings[icon]) return u.jsx('svg', {viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round', 'aria-hidden':true, children:drawings[icon].map(([tag,props],i)=>u.jsx(tag,props,i))});
  return u.jsx(V[icon], {'aria-hidden':true});
}
export function pictureItems(words = []) {
  return words.filter(text=>byWord.has(text)).map(text=>({text, icon:picture(byWord.get(text))}));
}
