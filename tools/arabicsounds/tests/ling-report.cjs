const assert=require('node:assert/strict');
(async()=>{
 const {analyseLing,lingSummary,lingTables,lingDate}=await import('../assets/ling-report.js');
 const record=(sounds,misses,mode='identification')=>({mode,size:sounds.length,answers:Array.from({length:mode==='identification'?10:6},(_,i)=>({sound:sounds[i%sounds.length],choice:i<misses?'س':sounds[i%sounds.length],correct:i>=misses,response:i<misses?(i%2?'none':'no'):'yes'}))});
 for(const [correct,pass] of [[10,true],[9,true],[8,true],[7,false],[0,false]]){
  const r=record(['م','س'],10-correct),a=analyseLing(r);
  assert.equal(a.percent,correct*10);assert.equal(a.passed,pass);assert.equal(a.correct.length,correct);assert.equal(a.incorrect.length,10-correct);
  const html=lingTables(r);assert(html.includes('data-result="correct"'));assert(html.includes('data-result="incorrect"'));
  assert.equal((html.match(/<tr>/g)||[]).length,12); // Ten data rows plus two headers; empty groups have an explicit empty row.
 }
 for(const [sounds,expected] of [[['م','و'],'low'],[['ا','ي'],'middle'],[['ش','س'],'high'],[['م','س'],'multiple']]){
  const r=record(sounds,4),a=analyseLing(r);assert.equal(a.pattern,expected);assert.equal(a.passed,false);
  for(const sound of sounds)assert(a.affected.some(group=>group.missed.includes(sound)));
 }
 const perfect=record(['م','و'],0);assert.equal(analyseLing(perfect).pattern,'none');
 assert(lingSummary(perfect).includes('لم تُفحص'),'Untested bands are never marked successful');
 assert(lingTables(perfect).includes('لا توجد أخطاء'));
 const detection=analyseLing(record(['م','و','ا','ي','ش','س'],2,'detection'));assert.equal(detection.passed,false);assert.equal(detection.correct.length,4);assert.equal(detection.incorrect.length,2);
 assert(!lingSummary(record(['م','و','ا','ي','ش','س'],2,'detection')).includes('معيار الاجتياز'));
 const incomplete=record(['م','و'],0);incomplete.answers.pop();assert.equal(analyseLing(incomplete).passed,false);assert(lingSummary(incomplete).includes('غير مكتملة'));
 const date=lingDate('2026-10-17T12:00:00+03:00').replace(/[\u200e\u200f]/g,'');
 assert.match(date,/^[0-9٠-٩]{2}\/[0-9٠-٩]{2}\/[0-9٠-٩]{4}$/);
 console.log('PASS Ling reports: numeric dates, exact 80% boundary, separated outcomes, all four frequency patterns, untested groups, detection scope and incomplete sessions.');
})().catch(error=>{console.error(error);process.exitCode=1;});
