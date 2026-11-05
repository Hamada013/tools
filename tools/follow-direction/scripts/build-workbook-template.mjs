// Author the styled Excel/chart template once; the PWA fills it locally, offline.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dependencies=process.env.ARTIFACT_NODE_MODULES||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const require=createRequire(path.join(path.dirname(dependencies),'follow-workbook-builder.cjs'));
const {Workbook,SpreadsheetFile}=await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href),JSZip=require('jszip');
const bank=createRequire(import.meta.url)('../assets/bank.js'),research=createRequire(import.meta.url)('../assets/research.js');
const wb=Workbook.create(),dashboard=wb.worksheets.add('Dashboard');
const column=i=>{let out='';for(let n=i+1;n;n=Math.floor((n-1)/26))out=String.fromCharCode(65+(n-1)%26)+out;return out;};
dashboard.showGridLines=false;
dashboard.getRange('A1:Q70').format={font:{name:'Arial',size:11,color:'#22445a'},rowHeight:24,columnWidth:12};
dashboard.getRange('A1:A70').format.columnWidth=30;
dashboard.getRange('H1:H70').format.columnWidth=3;
dashboard.getRange('A2').values=[['اتبع التعليمات · قاعدة بيانات البحث']];dashboard.getRange('A2').format.font={name:'Arial',size:19,bold:true,color:'#22445a'};
dashboard.getRange('A4').values=[['تاريخ التصدير UTC']];dashboard.getRange('B4').setNumberFormat('yyyy-mm-dd');dashboard.getRange('C4').setNumberFormat('hh:mm');
dashboard.getRange('A6:G6').values=[['الحالات','الجلسات','الفرز','التدريب','مكتملة','غير مكتملة','مُقيّم']];
dashboard.getRange('A6:G6').format={fill:'#e6f2ec',font:{name:'Arial',size:11,bold:true},rowHeight:28};
dashboard.getRange('A7:G7').values=[[0,0,0,0,0,0,0]];dashboard.getRange('A7:G7').format.font={name:'Arial',size:18,bold:true};
const colors=['#79a68c','#d6b063','#cd8b82'];
for(const [row,title,position]of [[10,'الفرز · الاستجابات حسب المهارة',['I10','Q28']],[28,'التدريب · الاستجابات حسب المهارة',['I30','Q48']]]){
 dashboard.getRange(`A${row-1}`).values=[[title]];
 dashboard.getRange(`A${row}:G${row}`).values=[['المهارة','مستقل','بمساعدة','غير صحيح','متجاوز','دون استجابة','مُقيّم']];
 dashboard.getRange(`A${row}:G${row}`).format={fill:'#edf3f6',font:{name:'Arial',bold:true,size:11},rowHeight:30};
 dashboard.getRange(`A${row+1}:G${row+11}`).values=bank.groups.map(g=>[g.label,0,0,0,0,0,0]);
 const chart=dashboard.charts.add('bar',dashboard.getRange(`A${row}:D${row+11}`));chart.title=title;chart.setPosition(...position);chart.titleTextStyle.fontSize=13;chart.titleTextStyle.typeface='Arial';chart.legend={position:'bottom',textStyle:{typeface:'Arial',fontSize:10}};
 chart.series.items.forEach((s,i)=>s.fill=colors[i]);chart.yAxis={numberFormatCode:'0',numberFormatSourceLinked:false};
}
dashboard.getRange('A47:G47').values=[['الشهر UTC','مستقل فرز','مُقيّم فرز','نسبة فرز','مستقل تدريب','مُقيّم تدريب','نسبة تدريب']];
dashboard.getRange('A47:G47').format={fill:'#edf3f6',font:{name:'Arial',bold:true,size:10},rowHeight:30};
dashboard.getRange('A48:G49').values=[['لا توجد بيانات',0,0,null,0,0,null],['',0,0,null,0,0,null]];
dashboard.getRange('D48:D49').setNumberFormat('0.0%');dashboard.getRange('G48:G49').setNumberFormat('0.0%');
const trend=dashboard.charts.add('line',[dashboard.getRange('A47:A49'),dashboard.getRange('D47:D49'),dashboard.getRange('G47:G49')]);trend.title='نسبة الاستجابات المستقلة شهريًا';trend.setPosition('I50','Q68');trend.titleTextStyle.typeface='Arial';trend.titleTextStyle.fontSize=13;trend.yAxis={numberFormatCode:'0%',numberFormatSourceLinked:false};trend.legend={position:'bottom',textStyle:{typeface:'Arial',fontSize:10}};trend.series.items.forEach((s,i)=>{s.line={fill:['#5d8eaa','#79a68c'][i],style:'solid',width:2};});
dashboard.freezePanes.freezeRows(7);
for(const [name,headers]of Object.entries(research.columns)){
 const s=wb.worksheets.add(name),last=column(headers.length-1);s.showGridLines=false;
 s.getRange(`A1:${last}2`).format={font:{name:'Arial',size:11,color:'#22445a'},columnWidth:20,rowHeight:26,verticalAlignment:'center'};
 s.getRange(`A1:${last}1`).values=[headers];s.getRange(`A1:${last}1`).format={font:{name:'Arial',size:10,bold:true,color:'#ffffff'},fill:'#22445a',rowHeight:30};
 s.getRange(`A2:${last}2`).values=[headers.map(h=>h.endsWith('_utc')?45000:0)];
 for(const [i,h]of headers.entries()){
  if(['child_uuid','child_name','session_uuid','mode','skill_code','skill_ar','item_id','audio_id','instruction_ar','outcome','state'].includes(h))s.getRange(`${column(i)}2`).setNumberFormat('@');
  if(h.endsWith('_utc')){s.getRange(`${column(i)}2`).setNumberFormat('yyyy-mm-dd hh:mm');s.getRange(`${column(i)}1:${column(i)}2`).format.columnWidth=23;}
  if(h.includes('uuid'))s.getRange(`${column(i)}1:${column(i)}2`).format.columnWidth=39;
  if(h.endsWith('_rate'))s.getRange(`${column(i)}2`).setNumberFormat('0.0%');
  if(h==='instruction_ar')s.getRange(`${column(i)}1:${column(i)}2`).format.columnWidth=65;
  if(h==='child_name'){s.getRange(`${column(i)}1:${column(i)}2`).format.columnWidth=28;s.getRange(`${column(i)}2`).format.wrapText=true;}
 }
 s.freezePanes.freezeRows(1);s.freezePanes.freezeColumns(name==='Cases'?1:2);
}
const dictionary=wb.worksheets.add('Dictionary');dictionary.showGridLines=false;
const definitions=[['Field / code','Definition'],['Source','All saved child accounts in this browser at the export timestamp. Hamada/admin accounts excluded.'],['case_id','Persistent numeric ID in this app dataset. child_uuid remains the join key across devices/backups. Never join different datasets on case_id alone.'],['child_name','Saved account name, included in Cases only. Not anonymized. No age, diagnosis or consent is inferred.'],['session_uuid','One saved session. Repeated visits remain separate. Re-export is a fresh snapshot, not another observation.'],['mode','screen = screening; practice = training. Never pool these as a diagnostic score.'],['independent','An independently correct response as recorded by the clinician or activity.'],['help','An assisted or corrected response, including a retry or recorded repetition.'],['incorrect','A recorded incorrect response.'],['skip','Explicitly not assessed. Excluded from assessed denominator.'],['pending','Planned but not recorded, including unfinished or ended-early sessions. Not a failure and not an explicit skip.'],['assessed','independent + assisted + incorrect. independent_rate = independent / assessed; blank if denominator is zero.'],['Dates','Excel numeric dates in UTC. Month grouping follows session start in UTC.'],['Monthly trend','Item-weighted descriptive rates, not an average per child or a matched longitudinal treatment effect.'],['Case plan','checked_skills uses only the latest completed screen: 3 independent responses per skill. Practice/partial screening do not change it.'],['Unknown demographics','Age, date of birth, diagnosis, recruitment and research consent are not collected in this app.'],['Refresh','Use the research export inside Accounts to download a new complete workbook. No Google/Drive/Sheets connection.'],['Raw observations','Records contains every planned item and original outcome code. Binary flags support analysis; no missing outcome is converted to incorrect.'],['Workbook formulas','Summary cells and percentages are editable Excel formulas with saved values. Native charts refer to workbook cells.'],['Protocol','Original Arabic preschool activities inspired by Just for Adults: Following Directions (Tomlin, 2007). Descriptive activities, not a standardized test.'],['Bank version',bank.version],['Source dataset ID','Filled automatically on export.']];
dictionary.getRange(`A1:B${definitions.length}`).values=definitions;dictionary.getRange(`A1:B${definitions.length}`).format={font:{name:'Arial',size:11,color:'#22445a'},rowHeight:28,columnWidth:35};dictionary.getRange(`B1:B${definitions.length}`).format.columnWidth=112;dictionary.getRange(`B2:B${definitions.length}`).format.wrapText=true;dictionary.getRange(`A2:B${definitions.length}`).format.rowHeight=42;dictionary.getRange('A1:B1').format={fill:'#22445a',font:{name:'Arial',bold:true,color:'#ffffff'},rowHeight:30};dictionary.freezePanes.freezeRows(1);
wb.recalculate();
const output=process.env.FOLLOW_TEMPLATE_OUTPUT||'/private/tmp/follow-workbook-builder/template.xlsx';await fs.mkdir(path.dirname(output),{recursive:true});await(await SpreadsheetFile.exportXlsx(wb)).save(output);
const zip=await JSZip.loadAsync(await fs.readFile(output)),parts={};for(const [name,entry]of Object.entries(zip.files)){if(!entry.dir)parts[name]=await entry.async('string');}
// Save the native Excel chart parts and styles, not images or a server dependency.
await fs.writeFile(path.join(root,'assets/workbook-template.js'),'window.FollowWorkbookTemplate='+JSON.stringify({parts})+';\n');
if(process.env.RESEARCH_PREVIEWS){await fs.mkdir(process.env.RESEARCH_PREVIEWS,{recursive:true});for(const [name,range]of [['Dashboard','A2:Q28'],['Cases','A1:I2'],['Sessions','A1:H2'],['Skills','A1:G2'],['Records','A1:G2'],['Dictionary','A1:B8']]){const image=await wb.render({sheetName:name,range,scale:1,format:'png'});await fs.writeFile(path.join(process.env.RESEARCH_PREVIEWS,name+'.png'),new Uint8Array(await image.arrayBuffer()));}}
console.log('Follow Direction Excel template: '+Object.keys(parts).length+' parts; 6 sheets; 3 editable charts.');
