/* Local, accessible acquisition charts, shared verbatim by independently hosted apps. */
((root)=>{
'use strict';
const colors={receptive:'#89cdef',expressive:'#23ad79'},labels={receptive:'الفهم',expressive:'التعبير'},domains=Object.keys(labels);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rate=(acquired,total,tested=0)=>({acquired,total,tested,percentage:total?Math.round(acquired/total*10000)/100:0});
const pct=value=>`${Number(value.percentage.toFixed(2))}%`;
const legend=()=>`<div class="acq-legend">${domains.map(d=>`<span><i style="background:${colors[d]}"></i>${labels[d]}</span>`).join('')}</div>`;
function table(rows){return `<div class="acq-table-wrap"><table><caption>الاكتساب من إجمالي عناصر الفئة</caption><thead><tr><th scope="col">الفئة</th>${domains.map(d=>`<th scope="col">${labels[d]}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr><th scope="row">${escape(row.label)}</th>${domains.map(d=>`<td data-domain="${d}" data-acquired="${row[d].acquired}" data-total="${row.total}"><bdi>${row[d].acquired} / ${row.total} · ${pct(row[d])}</bdi>${row[d].tested?'':'<small>لم يُقيّم</small>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
function bar(rows,title='نسبة الاكتساب',axis='الفئات'){
 if(!rows.length)return '<p class="acq-empty">تظهر الفئات بعد بدء العمل عليها.</p>';
 const width=Math.max(430,rows.length*120+90),height=370,left=60,top=35,bottom=255,step=(width-left-20)/rows.length;
 let content=[0,25,50,75,100].map(value=>{const y=bottom-(bottom-top)*value/100;return `<line x1="${left}" x2="${width-15}" y1="${y}" y2="${y}" stroke="#e2ebf0"/><text x="${left-8}" y="${y+4}" text-anchor="end">${value}%</text>`;}).join('');
 rows.forEach((row,index)=>{const center=left+step*(index+.5),bw=Math.min(28,step/4);
 domains.forEach((d,j)=>{const value=row[d],h=(bottom-top)*value.percentage/100,x=center+(j?6:-bw-6);content+=`<rect data-domain="${d}" data-percentage="${value.percentage}" x="${x}" y="${bottom-h}" width="${bw}" height="${h}" rx="3" fill="${colors[d]}"><title>${escape(row.label)} · ${labels[d]}: ${value.acquired}/${row.total} (${pct(value)})</title></rect><text x="${j?x:x+bw}" y="${bottom-h-8}" text-anchor="${j?'start':'end'}" class="acq-value">${pct(value)}</text>`;});
 const words=String(row.shortLabel||row.label).split(/\s+/),lines=[''];for(const word of words){if((lines.at(-1)+' '+word).trim().length>15&&lines.at(-1))lines.push(word);else lines[lines.length-1]=(lines.at(-1)+' '+word).trim();}
 content+=lines.slice(0,3).map((line,i)=>`<text x="${center}" y="${280+i*17}" text-anchor="middle" direction="rtl">${escape(line)}</text>`).join('');
 });
 return `<figure class="acq-chart"><figcaption>${escape(title)}</figcaption>${legend()}<div class="acq-chart-scroll" tabindex="0" role="region" aria-label="${escape(title)}؛ المحور الأفقي ${escape(axis)}؛ المحور الرأسي النسبة من 0 إلى 100 بالمئة"><svg viewBox="0 0 ${width} ${height}" style="min-width:${width}px" role="img" aria-label="${escape(title)}"><text x="${left}" y="18">النسبة %</text>${content}<line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" stroke="#8fa8b7"/><line x1="${left}" y1="${bottom}" x2="${width-15}" y2="${bottom}" stroke="#8fa8b7"/><text x="${width/2}" y="360" text-anchor="middle">${escape(axis)}</text></svg></div>${table(rows)}</figure>`;
}
function pies(rows){return `<div class="acq-pies">${rows.map(row=>`<section class="acq-pie-category"><h4>${escape(row.label)}</h4><div>${domains.map(d=>{const v=row[d];return `<figure><div class="acq-pie" style="--acq-fill:${colors[d]};--acq-pct:${v.percentage}%" role="img" aria-label="${labels[d]}: ${v.acquired} من ${row.total}، ${pct(v)}"><bdi>${pct(v)}</bdi></div><figcaption>${labels[d]}<small><bdi>${v.acquired} / ${row.total}</bdi></small></figcaption></figure>`;}).join('')}</div></section>`).join('')}</div>`;}
function drawBar(ctx,rows,{x=80,y=0,width=1080,height=460,title='نسبة الاكتساب',axis='الفئات'}={}){
 ctx.lineWidth=1;ctx.textBaseline='alphabetic';
 const text=(value,xx,yy,size=20,align='center')=>{ctx.font=`600 ${size}px system-ui,Tahoma,Arial,sans-serif`;ctx.fillStyle='#22445a';ctx.textAlign=align;ctx.direction=/^[\d.]+%$/.test(String(value))?'ltr':align==='right'?'rtl':'ltr';ctx.fillText(String(value),xx,yy);};
 text(title,x+width,y+28,28,'right');text('الفهم',x+55,y+65,20);ctx.fillStyle=colors.receptive;ctx.fillRect(x,y+50,18,18);text('التعبير',x+210,y+65,20);ctx.fillStyle=colors.expressive;ctx.fillRect(x+145,y+50,18,18);
 const left=x+65,top=y+100,bottom=y+height-120,step=(width-90)/Math.max(1,rows.length);
 for(const n of [0,25,50,75,100]){const yy=bottom-(bottom-top)*n/100;ctx.strokeStyle='#e2ebf0';ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(x+width,yy);ctx.stroke();text(`${n}%`,left-10,yy+5,18,'right');}
 ctx.strokeStyle='#8fa8b7';ctx.beginPath();ctx.moveTo(left,top);ctx.lineTo(left,bottom);ctx.lineTo(x+width,bottom);ctx.stroke();
 rows.forEach((row,i)=>{const center=left+step*(i+.5),bw=Math.min(38,step/4);domains.forEach((d,j)=>{const v=row[d],h=(bottom-top)*v.percentage/100,xx=center+(j?10:-bw-10);ctx.fillStyle=colors[d];ctx.fillRect(xx,bottom-h,bw,h);text(pct(v),j?xx:xx+bw,bottom-h-12,18,j?'left':'right');});
 const value=row.shortLabel||row.label,words=String(value).split(/\s+/),lines=[''];for(const word of words){if((lines.at(-1)+' '+word).length>17&&lines.at(-1))lines.push(word);else lines[lines.length-1]=(lines.at(-1)+' '+word).trim();}lines.slice(0,3).forEach((line,j)=>text(line,center,bottom+30+j*25,20));});text(axis,x+width/2,y+height-10,21);
}
function drawPies(ctx,row,{x=80,y=0,width=1080}={}){
 ctx.font='700 26px system-ui,Tahoma,Arial,sans-serif';ctx.fillStyle='#22445a';ctx.textAlign='right';ctx.direction='rtl';ctx.fillText(row.label,x+width,y+28);
 domains.forEach((d,i)=>{const v=row[d],cx=x+width*(i?.3:.75),cy=y+105,r=48;ctx.fillStyle='#e8f0f4';ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();if(v.percentage){ctx.fillStyle=colors[d];ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+Math.PI*2*v.percentage/100);ctx.closePath();ctx.fill();}ctx.font='600 23px system-ui,Tahoma,Arial,sans-serif';ctx.fillStyle='#22445a';ctx.textAlign='center';ctx.direction='rtl';ctx.fillText(labels[d],cx,y+178);ctx.direction='ltr';ctx.fillText(`${v.acquired} / ${row.total} · ${pct(v)}`,cx,y+210);});
}
const api={colors,labels,rate,pct,bar,pies,table,drawBar,drawPies};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.AcquisitionCharts=api;
})(globalThis);
