/* Fill the Artifact Tool-authored native Excel template entirely on this device. */
((root)=>{
 'use strict';
 const text=x=>String(x??'').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\uFFFE\uFFFF]/g,'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const column=i=>{let out='';for(let n=i+1;n;n=Math.floor((n-1)/26))out=String.fromCharCode(65+(n-1)%26)+out;return out;};
 const formula=(f,v)=>({f,v:v??''});
 const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
 function crc(bytes){let n=0xffffffff;for(const b of bytes)n=crcTable[(n^b)&255]^(n>>>8);return(n^0xffffffff)>>>0;}
 function zip(parts){
  const encode=new TextEncoder(),files=Object.entries(parts).map(([name,body])=>({name:encode.encode(name),body:encode.encode(body)})),local=[],central=[];let offset=0;
  for(const file of files){const size=file.body.length,check=crc(file.body),header=new Uint8Array(30+file.name.length),v=new DataView(header.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,33,true);v.setUint32(14,check,true);v.setUint32(18,size,true);v.setUint32(22,size,true);v.setUint16(26,file.name.length,true);header.set(file.name,30);
   const directory=new Uint8Array(46+file.name.length),d=new DataView(directory.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint16(14,33,true);d.setUint32(16,check,true);d.setUint32(20,size,true);d.setUint32(24,size,true);d.setUint16(28,file.name.length,true);d.setUint32(42,offset,true);directory.set(file.name,46);local.push(header,file.body);central.push(directory);offset+=header.length+size;
  }
  const directorySize=central.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);if(offset+directorySize>0xffffffff)throw Error('حجم ملف Excel أكبر من الحد المدعوم.');v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,directorySize,true);v.setUint32(16,offset,true);
  const all=[...local,...central,end],out=new Uint8Array(offset+directorySize+22);let at=0;for(const bytes of all){out.set(bytes,at);at+=bytes.length;}return out;
 }
 function cell(ref,value,style='0'){
  const attr=`r="${ref}" s="${style}"`;
  if(value&&typeof value==='object'&&'f'in value){const number=typeof value.v==='number';return `<x:c ${attr} t="${number?'n':'str'}"><x:f>${text(value.f)}</x:f><x:v>${text(value.v)}</x:v></x:c>`;}
  if(value===null||value===undefined)return `<x:c ${attr}/>`;
  if(typeof value==='number'){if(!Number.isFinite(value))throw Error('قيمة رقمية غير صالحة في ملف Excel.');return `<x:c ${attr} t="n"><x:v>${value}</x:v></x:c>`;}
  return `<x:c ${attr} t="inlineStr"><x:is><x:t xml:space="preserve">${text(value)}</x:t></x:is></x:c>`;
 }
 function styleMap(xml){return new Map([...xml.matchAll(/<x:c\b[^>]*\br="([A-Z]+\d+)"[^>]*>/g)].map(m=>[m[1],/\bs="(\d+)"/.exec(m[0])?.[1]||'0']));}
 function source(xml,headers,rows,formatRow){
  const styles=styleMap(xml),list=[headers,...rows],body=list.map((row,i)=>{const values=i?formatRow(row,i+1):row;return `<x:row r="${i+1}" ht="${i?26:30}" customHeight="1">${values.map((v,j)=>cell(`${column(j)}${i+1}`,v,styles.get(`${column(j)}${i?2:1}`))).join('')}</x:row>`;}).join('');
  xml=xml.replace(/<x:sheetData>[\s\S]*?<\/x:sheetData>/,`<x:sheetData>${body}</x:sheetData><x:autoFilter ref="A1:${column(headers.length-1)}${Math.max(1,list.length)}"/>`);return xml;
 }
 function updateCells(xml,values){
  const styles=styleMap(xml),rows=new Map();for(const match of xml.matchAll(/<x:row\b[^>]*\br="(\d+)"[^>]*>[\s\S]*?<\/x:row>/g)){const row=new Map();for(const c of match[0].matchAll(/<x:c\b[^>]*\br="([A-Z]+\d+)"[^>]*(?:\/>|>[\s\S]*?<\/x:c>)/g))row.set(c[1],c[0]);rows.set(Number(match[1]),row);}
  for(const [ref,value]of Object.entries(values)){const r=Number(/\d+$/.exec(ref)[0]);if(!rows.has(r))rows.set(r,new Map());const fallback=ref.replace(/\d+$/, '48');rows.get(r).set(ref,cell(ref,value,styles.get(ref)||styles.get(fallback)||'0'));}
  const colNumber=ref=>[...ref.replace(/\d+$/,'')].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0);
  const body=[...rows].sort(([a],[b])=>a-b).map(([r,cells])=>`<x:row r="${r}" ht="24" customHeight="1">${[...cells].sort(([a],[b])=>colNumber(a)-colNumber(b)).map(([,v])=>v).join('')}</x:row>`).join('');
  return xml.replace(/<x:sheetData>[\s\S]*?<\/x:sheetData>/,`<x:sheetData>${body}</x:sheetData>`);
 }
 function chartCache(xml,categories,series,start,end,columns,percent=false,maximum=1){let index=0;
  xml=xml.replace(/<c:ser>[\s\S]*?<\/c:ser>/g,ser=>{
   const values=series[index],col=columns[index++];
   if(percent)ser=ser.replace(/<c:marker>[\s\S]*?<\/c:marker>/,'').replace('<c:cat>','<c:marker><c:symbol val="circle"/><c:size val="6"/></c:marker><c:cat>');
   ser=ser.replace(/<c:cat>[\s\S]*?<\/c:cat>/,`<c:cat><c:strRef><c:f>&apos;Dashboard&apos;!$A$${start}:$A$${end}</c:f><c:strCache><c:ptCount val="${categories.length}"/>${categories.map((v,i)=>`<c:pt idx="${i}"><c:v>${text(v)}</c:v></c:pt>`).join('')}</c:strCache></c:strRef></c:cat>`);
   return ser.replace(/<c:val>[\s\S]*?<\/c:val>/,`<c:val><c:numRef><c:f>&apos;Dashboard&apos;!$${col}$${start}:$${col}$${end}</c:f><c:numCache><c:formatCode>${percent?'0%':'0'}</c:formatCode><c:ptCount val="${values.length}"/>${values.map((v,i)=>v===null?'':`<c:pt idx="${i}"><c:v>${v}</c:v></c:pt>`).join('')}</c:numCache></c:numRef></c:val>`);
  });
  if(!percent){const step=Math.max(1,Math.ceil(maximum/5));xml=xml.replace('<c:barDir val="col" />','<c:barDir val="bar"/><c:grouping val="clustered"/>');xml=xml.replace(/<c:catAx>[\s\S]*?<\/c:catAx>/,ax=>ax.replace('<c:axPos val="b" />','<c:axPos val="l" />').replace('<c:orientation val="minMax" />','<c:orientation val="maxMin" />').replace(/<c:majorGridlines>[\s\S]*?<\/c:majorGridlines>/,''));xml=xml.replace(/<c:valAx>[\s\S]*?<\/c:valAx>/,ax=>ax.replace('<c:axPos val="l" />','<c:axPos val="b" />').replace(/<c:scaling>[\s\S]*?<\/c:scaling>/,`<c:scaling><c:orientation val="minMax"/><c:min val="0"/></c:scaling>`).replace('</c:valAx>',`<c:majorUnit val="${step}"/></c:valAx>`));}
  else xml=xml.replace(/<c:valAx>[\s\S]*?<\/c:valAx>/,ax=>ax.replace(/<c:scaling>[\s\S]*?<\/c:scaling>/,'<c:scaling><c:orientation val="minMax"/><c:max val="1"/><c:min val="0"/></c:scaling>'));
  return xml;
 }
 function build(snapshot,template){
  const p={...template.parts},r=snapshot.rows,end=name=>Math.max(2,r[name].length+1),range=(name,col)=>`'${name}'!$${col}$2:$${col}$${end(name)}`;
  const sums=(col,caseCell,sessionCell,skillCell)=>`SUMIFS(${range('Records',col)},${range('Records','A')},${caseCell},${range('Records','B')},${sessionCell}${skillCell?`,${range('Records','D')},${skillCell}`:''})`;
  p['xl/worksheets/sheet2.xml']=source(p['xl/worksheets/sheet2.xml'],snapshot.columns.Cases,r.Cases,(row,n)=>row.map((v,i)=>i>=4&&i<=6?formula(`COUNTIFS(${range('Sessions','A')},A${n}${i===4?'':`,${range('Sessions','C')},"${i===5?'screen':'practice'}"`})`,v):v));
  p['xl/worksheets/sheet3.xml']=source(p['xl/worksheets/sheet3.xml'],snapshot.columns.Sessions,r.Sessions,(row,n)=>row.map((v,i)=>i>=8&&i<=14?formula(sums(({8:'J',9:'L',10:'M',11:'N',12:'O',13:'P',14:'K'})[i],`A${n}`,`B${n}`),v):i===15?formula(`IF(O${n}=0,"",J${n}/O${n})`,v):v));
  p['xl/worksheets/sheet4.xml']=source(p['xl/worksheets/sheet4.xml'],snapshot.columns.Skills,r.Skills,(row,n)=>row.map((v,i)=>i>=7&&i<=12?formula(sums(({7:'L',8:'M',9:'N',10:'O',11:'P',12:'K'})[i],`A${n}`,`B${n}`,`D${n}`),v):i===13?formula(`IF(M${n}=0,"",H${n}/M${n})`,v):v));
  p['xl/worksheets/sheet5.xml']=source(p['xl/worksheets/sheet5.xml'],snapshot.columns.Records,r.Records,(row,n)=>row.map((v,i)=>i===9?formula(`IF(H${n}="pending",0,1)`,v):i===10?formula(`IF(OR(H${n}="independent",H${n}="help",H${n}="incorrect"),1,0)`,v):i>=11?formula(`IF(H${n}="${({11:'independent',12:'help',13:'incorrect',14:'skip',15:'pending'})[i]}",1,0)`,v):v));
  const values={B4:(Date.parse(snapshot.exported)/86400000+25569),C4:(Date.parse(snapshot.exported)/86400000+25569),A7:formula(`COUNTA(${range('Cases','A')})`,r.Cases.length),B7:formula(`COUNTA(${range('Sessions','B')})`,r.Sessions.length),C7:formula(`COUNTIFS(${range('Sessions','C')},"screen")`,r.Sessions.filter(s=>s[2]==='screen').length),D7:formula(`COUNTIFS(${range('Sessions','C')},"practice")`,r.Sessions.filter(s=>s[2]==='practice').length),E7:formula(`COUNTIFS(${range('Sessions','G')},"complete")`,r.Sessions.filter(s=>s[6]==='complete').length),F7:formula('B7-E7',r.Sessions.filter(s=>s[6]!=='complete').length),G7:formula(`SUM(${range('Sessions','O')})`,r.Sessions.reduce((a,s)=>a+s[14],0))};
  for(const [mode,start]of [['screen',11],['practice',29]])snapshot.summary[mode].forEach((row,i)=>row.forEach((v,j)=>{values[`${column(j)}${start+i}`]=j?formula(`SUMIFS(${range('Skills',({1:'H',2:'I',3:'J',4:'K',5:'L',6:'M'})[j])},${range('Skills','C')},"${mode}",${range('Skills','E')},A${start+i})`,v):v;}));
  const timeline=snapshot.timeline.length?snapshot.timeline:[['لا توجد جلسات مؤرخة',0,0,null,0,0,null]];
  // Clear template's spare second monthly row before inserting the real series.
  for(let j=0;j<7;j++)values[`${column(j)}49`]=null;
  timeline.forEach((row,i)=>{const n=i+48,month=row[0],date=/^\d{4}-\d{2}$/.test(month)?Date.parse(month+'-01T00:00:00Z')/86400000+25569:null,next=date!==null?new Date((date-25569)*86400000):null;if(next)next.setUTCMonth(next.getUTCMonth()+1);const last=next?next.getTime()/86400000+25569:null;
   row.forEach((v,j)=>{const ref=`${column(j)}${n}`;if(j===0)values[ref]=v;else if(j===3||j===6)values[ref]=formula(`IF(${j===3?'C':'F'}${n}=0,"",${j===3?'B':'E'}${n}/${j===3?'C':'F'}${n})`,v);else values[ref]=date===null?0:formula(`SUMIFS(${range('Sessions',j===1||j===4?'J':'O')},${range('Sessions','C')},"${j<=3?'screen':'practice'}",${range('Sessions','E')},">="&${date},${range('Sessions','E')},"<"&${last})`,v);});
  });
  p['xl/worksheets/sheet1.xml']=updateCells(p['xl/worksheets/sheet1.xml'],values);
  p['xl/worksheets/sheet6.xml']=updateCells(p['xl/worksheets/sheet6.xml'],{B22:snapshot.sourceId});
  const maximum=Math.max(1,...[...snapshot.summary.screen,...snapshot.summary.practice].flatMap(row=>row.slice(1,4)));
  for(const [num,mode,start]of [[1,'screen',11],[2,'practice',29]]){const rows=snapshot.summary[mode],file=`xl/drawings/charts/chart${num}.xml`;p[file]=chartCache(p[file],rows.map(r=>r[0]),[1,2,3].map(i=>rows.map(r=>r[i])),start,start+rows.length-1,['B','C','D'],false,maximum);}
  p['xl/drawings/charts/chart3.xml']=chartCache(p['xl/drawings/charts/chart3.xml'],timeline.map(r=>r[0]),[3,6].map(i=>timeline.map(r=>r[i])),48,47+timeline.length,['D','G'],true);
  // Recalculate formulas on Excel opening; cached values keep other readers useful.
  p['xl/workbook.xml']=p['xl/workbook.xml'].replace(/<x:calcPr\b[^>]*\/>/,'').replace('</x:workbook>','<x:calcPr calcId="191029" fullCalcOnLoad="1"/></x:workbook>');
  return zip(p);
 }
 const api={build};if(typeof module!=='undefined')module.exports=api;else root.FollowWorkbook=api;
})(globalThis);
