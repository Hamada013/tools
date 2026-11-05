import { LETTERS, CONSONANTS, MODES, bank, shuffle, newAssessment, summarize, addResponse, validSession } from './model.mjs';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const paths = {
 home:'<path d="m3 10 9-7 9 7v11H3Z"/><path d="M9 21v-8h6v8"/>',
 play:'<path d="m8 4 12 8-12 8Z"/>', resume:'<path d="m9 5 10 7-10 7Z"/><path d="M4 5v14"/>',
 pause:'<path d="M8 5v14M16 5v14"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',cross:'<path d="m6 6 12 12M18 6 6 18"/>',check:'<path d="m4 12 5 5L20 6"/>',
 half:'<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h8"/>',
 ear:'<path d="M6 10a6 6 0 1 1 12 0c0 4-4 4-4 8a4 4 0 0 1-8 0M10 10a2 2 0 0 1 4 0c0 2-4 2-4 5"/>',
 speak:'<path d="M20 11c0 5-4 8-8 8H8l-5 3 1-6a8 8 0 1 1 16-5Z"/><path d="M8 8h1m3 0h1m3 0h1"/>',
 match:'<rect x="2" y="4" width="7" height="15" rx="2"/><rect x="15" y="4" width="7" height="15" rx="2"/><path d="m11 9 2 3-2 3"/>',
 settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>',
 chart:'<path d="M4 3v17h17M8 15l5-6 4 3 4-7"/>', volume:'<path d="M11 4 6 8H2v8h4l5 4ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
 restart:'<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',star:'<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
 previous:'<path d="m9 5 7 7-7 7"/>',next:'<path d="m15 5-7 7 7 7"/>',skip:'<path d="m5 5 10 7-10 7ZM19 5v14"/>',
 flag:'<path d="M5 22V3c6-5 9 5 15 0v12c-6 5-9-5-15 0"/>',print:'<path d="M6 9V2h12v7M6 18H3V9h18v9h-3M6 14h12v8H6Z"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.play}</svg>`;
function icons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }
icons();
const title = kind => ({practice:'تدريب المقاطع',matching:'مطابقة المقاطع',listening:'اختبار الاستماع',production:'اختبار الإنتاج'})[kind];
const STORE_KEY = 'articulation-syllable-results-v1';
let storageFault = false;
let store = { sessions: [] };
try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) { const parsed = JSON.parse(saved); if (!Array.isArray(parsed.sessions) || !parsed.sessions.every(validSession)) throw new Error('Invalid store'); store = parsed; }
} catch { storageFault = true; showError('تعذر قراءة النتائج المحفوظة. التدريب متاح، ولم تُستبدل بياناتك.'); }
const state = { kind:'practice', screen:'home', letters:[2], mode:'cv', filter:'all', page:0, setup:null, session:null, result:null,
    generation:0, heard:false, imagesReady:false, playing:false, busy:false, cueUnsaved:false, matching:null, selectedSource:null, rewards:Array(5).fill(false) };
const audio = $('#syllable-audio');
let playToken = 0, playResolve = null, playTimer = null, roundTimer = null;
function escape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }
function showError(text) { $('#error').textContent = text; $('#error').hidden = false; }
function showFeedback(name,tone,text) { const element=$('#feedback'); element.innerHTML=icon(name); const label=document.createElement('span'); label.className='sr-only'; label.textContent=text; element.append(label); element.className=`feedback ${tone}`; }
function clearError() { $('#error').hidden = true; }
function safe(action) { return (...args) => { const fail=error=>showError(error.message || 'تعذر إتمام العملية. حاول مجدداً.'); try { return Promise.resolve(action(...args)).catch(fail); } catch(error) { fail(error); } }; }
function writeSession(session) {
    if (storageFault) throw new Error('تعذر حفظ النتائج. تحقق من إعدادات تخزين المتصفح قبل بدء الاختبار.');
    const next = { sessions:[...store.sessions.filter(s => s.id !== session.id), structuredClone({...session,updatedAt:new Date().toISOString()})] };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); store = next; clearError(); }
    catch { throw new Error('لم تُحفظ الاستجابة. وفر مساحة على الجهاز، ثم أعد المحاولة.'); }
}
function latestDraft() { return [...store.sessions].reverse().find(s => s.status === 'draft' && s.records.length < s.plan.length); }
function stopAudio() {
    ++playToken; clearTimeout(playTimer); audio.onended = audio.onerror = null; audio.pause();
    if (playResolve) { playResolve(false); playResolve = null; }
    state.playing = false; $$('.is-playing').forEach(el => el.classList.remove('is-playing'));
}
function invalidate() { ++state.generation; clearTimeout(roundTimer); stopAudio(); state.busy = false; }
function showScreen(screen) {
    state.screen = screen;
    $$('.view').forEach(el => { el.hidden = el.id !== `${screen}-view`; });
    $('#contact-footer').hidden = screen !== 'home';
    $('#rewards-button').hidden = screen !== 'activity' || ['listening','production'].includes(state.kind);
    document.body.classList.toggle('in-activity', screen === 'activity');
    $('#main').focus({preventScroll:true}); window.scrollTo(0,0);
}
function home() {
    if (state.screen === 'activity' && state.session?.status === 'draft' && ['listening','production'].includes(state.kind)) { pauseTest(); return; }
    invalidate(); clearError(); showScreen('home'); updateResume();
}
function updateResume() {
    const draft = latestDraft(); $('#resume-button').hidden = !draft;
    if (draft) $('#resume-label').textContent = `${title(draft.kind)} · ${draft.records.length} من ${draft.plan.length} · متابعة`;
}
function segmentButtons(container, values, selected, onChange) {
    container.replaceChildren();
    for (const [value,label] of values) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
        button.dataset.value=value; button.setAttribute('aria-pressed',String(value === selected)); button.addEventListener('click',() => {onChange(value);container.querySelector(`[data-value="${value}"]`)?.focus({preventScroll:true});}); container.append(button);
    }
}
function openSetup(kind) {
    if (state.screen === 'activity' && state.session?.status === 'draft' && ['listening','production'].includes(state.kind)) return;
    stopAudio(); clearError();
    state.setup = {kind,letters:[...state.letters],mode:state.mode};
    $('#setup-title').textContent = title(kind);
    $('#setup-note').textContent = kind === 'production' ? 'يسجّل الفاحص الإنتاج. تشغيل الصوت يُسجّل كنموذج.' : kind === 'listening' ? 'اختيار واحد لكل مقطع مسموع.' : '';
    renderSetup(); $('#setup-dialog').showModal();
}
function renderSetup() {
    $('#letter-picker').replaceChildren();
    for (const letter of CONSONANTS) {
        const selected = state.setup.letters.includes(letter.id), button = document.createElement('button');
        button.type = 'button'; button.textContent = letter.char; button.dataset.letter = letter.id;
        button.setAttribute('aria-label',`حرف ${letter.char}`); button.setAttribute('aria-pressed',String(selected));
        button.disabled = !selected && state.setup.letters.length >= 3;
        button.addEventListener('click',() => {
            state.setup.letters = selected ? state.setup.letters.filter(id => id !== letter.id) : [...state.setup.letters,letter.id]; renderSetup(); $('#letter-picker').querySelector(`[data-letter="${letter.id}"]`)?.focus({preventScroll:true});
        });
        $('#letter-picker').append(button);
    }
    segmentButtons($('#setup-modes'), MODES.map(mode => [mode,mode.toUpperCase()]), state.setup.mode, mode => { state.setup.mode=mode;renderSetup(); });
    $('#start-button').disabled = !state.setup.letters.length;
}
function initializeActivity() {
    invalidate(); $('#audio-status').textContent=''; $('#feedback').replaceChildren(); $('#feedback').className='feedback';
    $('#activity-title').textContent=title(state.kind);
    $('#activity-meta').textContent=`${state.mode.toUpperCase()} · ${state.letters.map(id=>LETTERS[id-1].char).join('، ')}`;
    for (const id of ['practice-grid','listening-cue','choice-grid','production-stage','matching-board','production-grades','practice-filters','pagination','matching-count','assessment-status']) $('#'+id).hidden=true;
    $('#settings-button').hidden=['listening','production'].includes(state.kind);
    $('#pause-button').hidden=!['listening','production'].includes(state.kind);
    $('#skip-button').hidden=!['listening','production'].includes(state.kind);
    $('#restart-button').hidden=state.kind!=='matching';
    showScreen('activity');
}
function startActivity() {
    const setup = state.setup; if (!setup?.letters.length) return;
    if (['listening','production'].includes(setup.kind)) {
        const session=newAssessment(setup.kind,setup.letters,setup.mode); writeSession(session); state.session=session;
    } else state.session=null;
    state.kind=setup.kind;state.letters=[...setup.letters];state.mode=setup.mode;state.filter='all';state.page=0;
    $('#setup-dialog').close(); initializeActivity();
    if (state.kind==='practice') renderPractice();
    else if(state.kind==='matching') newMatching();
    else void safe(renderTrial)();
}
function syllableMarkup(item) {
    return `<span class="syllable-parts" dir="rtl">${item.parts.map(id=>`<span class="syllable-part"><img src="images/${id}.png" alt="" decoding="async"></span>`).join('')}</span>`;
}
function syllableButton(item, handler, extraClass='') {
    const button=document.createElement('button');button.type='button';button.className=`syllable-card ${extraClass}`;
    button.setAttribute('aria-label',`المقطع ${item.label}`);button.dataset.item=item.id;button.innerHTML=syllableMarkup(item);
    button.addEventListener('click',handler);return button;
}
function practicePool() { return bank(state.letters,state.mode,state.filter); }
function renderPractice() {
    invalidate(); $('#practice-grid').hidden=false;$('#practice-filters').hidden=false;$('#pagination').hidden=false;
    segmentButtons($('#practice-modes'),MODES.map(mode=>[mode,mode.toUpperCase()]),state.mode,mode=>{stopAudio();state.mode=mode;state.page=0;state.filter='all';renderPractice();});
    segmentButtons($('#vowel-filters'),[['all','الكل'],[1,'ا'],[27,'و'],[28,'ي']],state.filter,filter=>{state.filter=filter;state.page=0;renderPractice();});
    $('#activity-meta').textContent=`${state.mode.toUpperCase()} · ${state.letters.map(id=>LETTERS[id-1].char).join('، ')}`;
    const pool=practicePool(),pageSize=innerHeight<650&&innerWidth<601&&innerHeight>=innerWidth?1:3,pages=Math.ceil(pool.length/pageSize);state.page=Math.max(0,Math.min(state.page,pages-1));
    $('#practice-grid').replaceChildren();
    for(const item of pool.slice(state.page*pageSize,state.page*pageSize+pageSize)) {
        let button;button=syllableButton(item,()=>void safe(()=>playItem(item,button))());$('#practice-grid').append(button);
    }
    $('#page-count').textContent=`${state.page+1} / ${pages}`;$('#previous-page').disabled=state.page===0;$('#next-page').disabled=state.page===pages-1;
}
async function playItem(item, element=null, assessment=false) {
    stopAudio();const token=playToken,generation=state.generation;state.playing=true;
    element?.classList.add('is-playing');$('#audio-status').textContent='';updateResponseControls();
    return new Promise(resolve=>{
        playResolve=resolve;
        const finish=(ok,error='')=>{
            if(token!==playToken)return;
            clearTimeout(playTimer);audio.onended=audio.onerror=null;state.playing=false;playResolve=null;element?.classList.remove('is-playing');
            if(error)$('#audio-status').textContent=error;
            if(ok&&assessment&&state.session?.kind==='listening')state.heard=true;
            updateResponseControls();resolve(ok);
        };
        audio.onended=()=>finish(true);
        audio.onerror=()=>finish(false,'تعذر تشغيل المقطع. اضغط البطاقة للمحاولة مجدداً أو تخطّه.');
        playTimer=setTimeout(()=>{audio.pause();finish(false,'توقف الصوت. اضغط البطاقة للمحاولة مجدداً.');},15000);
        audio.src=item.audio;
        audio.play().then(()=>{
            if(token!==playToken||generation!==state.generation)return;
            if(assessment&&state.session?.kind==='production') {
                // Preserve exposure even if saving the cue fails; block grading until saved.
                state.session.cues[item.id]=true;
                try {writeSession(state.session);state.cueUnsaved=false;}
                catch(error){state.cueUnsaved=true;audio.pause();showError(error.message);finish(false);}
            }
        }).catch(()=>finish(false,'اضغط البطاقة لسماع المقطع. إذا تعذر الصوت، يمكنك التخطي.'));
    });
}
function itemIndex() { return new Map(bank(state.session.letters,state.session.mode).map(item=>[item.id,item])); }
function currentItem() { return state.session ? itemIndex().get(state.session.plan[state.session.records.length]?.id) : null; }
function updateResponseControls() {
    if(!['listening','production'].includes(state.kind)||state.screen!=='activity')return;
    const allowed=state.imagesReady&&!state.busy&&!state.playing&&!state.cueUnsaved&&(state.kind==='production'||state.heard);
    $$('#choice-grid button, #production-grades button').forEach(button=>{button.disabled=!allowed;});
    $('#skip-button').disabled=state.busy||state.cueUnsaved;
    $$('#listening-cue, #production-stage button').forEach(button=>{button.disabled=state.busy||state.playing;});
}
async function imageReadiness(container) {
    return Promise.all([...container.querySelectorAll('img')].map(image=>{
        if(image.complete)return Promise.resolve(image.naturalWidth>0);
        return new Promise(resolve=>{
            const timer=setTimeout(()=>resolve(false),10000);
            image.onload=()=>{clearTimeout(timer);resolve(true);};image.onerror=()=>{clearTimeout(timer);resolve(false);};
        });
    }));
}
function replayAssessment() {
    if(state.screen!=='activity'||state.busy||state.playing||state.session?.status!=='draft')return;
    if(!state.imagesReady)return renderTrial(true);
    return playItem(currentItem(),state.kind==='listening'?$('#listening-cue'):$('#production-stage button'),true);
}
async function renderTrial(playModel=false) {
    invalidate();state.heard=false;state.imagesReady=false;state.cueUnsaved=false;
    const generation=state.generation,session=state.session;
    if(session.status!=='draft'){showResults(session);return;}
    const item=currentItem(),entry=session.plan[session.records.length],index=itemIndex();
    if(!item)throw new Error('تعذر استعادة المقطع المحفوظ.');
    $('#assessment-status').hidden=false;$('#test-progress').max=session.plan.length;$('#test-progress').value=session.records.length;
    $('#trial-count').textContent=`${session.records.length+1} / ${session.plan.length}`;
    $('#feedback').replaceChildren();$('#feedback').className='feedback';$('#audio-status').textContent='';
    $('#choice-grid').replaceChildren();$('#production-stage').replaceChildren();
    if(session.kind==='listening') {
        $('#choice-grid').hidden=false;$('#listening-cue').hidden=false;
        for(const id of entry.choices) $('#choice-grid').append(syllableButton(index.get(id),()=>void safe(()=>respond(id===item.id?'correct':'incorrect',id))()));
    } else {
        $('#production-stage').hidden=false;$('#production-grades').hidden=false;
        const card=syllableButton(item,safe(replayAssessment),'production-card');card.setAttribute('aria-label',`استمع إلى نموذج المقطع ${item.label}`);$('#production-stage').append(card);
        $('#audio-status').textContent=session.cues[item.id]?'سبق تشغيل نموذج صوتي لهذا المقطع.':'دون نموذج صوتي';
    }
    updateResponseControls();
    // Start on the initiating tap before yielding, preserving Safari's audio gesture.
    const playback=session.kind==='listening'||playModel?playItem(item,session.kind==='listening'?$('#listening-cue'):$('#production-stage button'),true):null;
    const ready=await imageReadiness(session.kind==='listening'?$('#choice-grid'):$('#production-stage'));
    if(generation!==state.generation||state.screen!=='activity')return;
    state.imagesReady=ready.every(Boolean);updateResponseControls();
    if(!state.imagesReady){stopAudio();updateResponseControls();$('#audio-status').textContent='تعذر تحميل صورة. اضغط البطاقة لتحميلها أو تخطّ المقطع.';return;}
    if(playback)await playback;
}
async function respond(outcome,selected='',score) {
    if(state.screen!=='activity'||state.busy||state.cueUnsaved||!state.session||state.session.status!=='draft')return;
    if(outcome!=='skip'&&(!state.imagesReady||state.playing||state.kind==='listening'&&!state.heard))return;
    const item=currentItem();if(!item)return;
    const next=structuredClone(state.session);
    if(!addResponse(next,{id:item.id,outcome,selected,score,modeled:!!next.cues[item.id]}))return;
    writeSession(next);state.session=next;state.busy=true;stopAudio();updateResponseControls();
    showFeedback(outcome==='correct'?'check':outcome==='emerging'?'half':outcome==='skip'?'skip':'cross',outcome,score !== undefined ? `${score}%` : ({correct:'صحيح',incorrect:'غير صحيح',emerging:'محاولة غير مكتملة',skip:'لم يُقيّم'})[outcome]);
    const generation=state.generation;
    roundTimer=setTimeout(()=>{if(generation!==state.generation||state.screen!=='activity')return;state.busy=false;if(next.status==='complete')showResults(next);else void safe(renderTrial)();},450);
}
function pauseTest() {
    if(!state.session||state.session.status!=='draft'){home();return;}
    writeSession(state.session);invalidate();showScreen('paused');
    $('#paused-summary').textContent=`${title(state.session.kind)} · ${state.session.records.length} من ${state.session.plan.length}`;
}
function resume(session) {
    if(!validSession(session)||session.status!=='draft')throw new Error('تعذر استكمال هذا الاختبار.');
    state.session=structuredClone(session);state.session.cues||={};state.kind=session.kind;state.letters=[...session.letters];state.mode=session.mode;
    initializeActivity();void safe(renderTrial)();
}
function finishPartial() {
    if(!state.session)return;
    const next=structuredClone(state.session);next.status='partial';next.finishedAt=new Date().toISOString();writeSession(next);state.session=next;showResults(next);
}
function showResults(session) {
    invalidate();state.result=session;const summary=summarize(session),index=new Map(bank(session.letters,session.mode).map(item=>[item.id,item]));
    $('#results-title').textContent=title(session.kind);
    const date=new Date(session.startedAt).toLocaleString('ar');
    $('#result-content').innerHTML=`<article class="panel report"><p class="muted">${escape(date)} · ${session.mode.toUpperCase()} · ${session.status==='complete'?'مكتمل':'جزئي'}</p><div class="metric-grid"><div><strong>${summary.accuracy===null?'—':summary.accuracy+'%'}</strong><span>${session.kind==='listening'?'اختيارات صحيحة':session.records.some(r=>r.score!==undefined)?'متوسط تقدير الإنتاج':'إنتاج صحيح'}</span></div><div><strong><bdi dir="ltr">${summary.correct} / ${summary.assessed}</bdi></strong><span>صحيح / مقيّم</span></div><div><strong><bdi dir="ltr">${summary.recorded} / ${summary.total}</bdi></strong><span>استجابات / مخطط</span></div></div><div class="score-track" role="img" aria-label="${summary.accuracy===null?'لا توجد كلمات مقيّمة':summary.accuracy+(session.kind==='production'?' بالمئة متوسط تقدير الإنتاج':' بالمئة صحيحة')}"><span style="width:${summary.accuracy??0}%"></span></div><p class="report-note">لم يُقيّم: ${summary.skipped}${session.kind==='production'?` · محاولات غير مكتملة: ${summary.emerging} · بعد نموذج صوتي: ${summary.modeled}`:''}</p><div class="table-scroll"><table><caption>استجابات المقاطع</caption><thead><tr><th>المقطع</th><th>الاستجابة</th>${session.kind==='listening'?'<th>الاختيار</th>':'<th>نموذج صوتي</th>'}</tr></thead><tbody>${session.records.map(r=>`<tr><td>${index.get(r.id).label}</td><td>${r.score!==undefined?r.score+'%':({correct:'صحيح',incorrect:'غير صحيح',emerging:'محاولة غير مكتملة',skip:'لم يُقيّم'})[r.outcome]}</td><td>${session.kind==='listening'?index.get(r.selected)?.label||'—':r.modeled?'نعم':'لا'}</td></tr>`).join('')}</tbody></table></div>${session.kind==='production'?'<p class="muted report-note">متوسط النسب التي اختارها الفاحص؛ تُستثنى المقاطع غير المقيّمة. التقديرات السابقة بلا نسبة محفوظة بتسمياتها الأصلية. تُعرض التسمية بعد النموذج منفصلة؛ لا يوجد تصحيح آلي للصوت.</p>':''}</article>`;
    showScreen('results');updateResume();
}
function openHistory() {
    if(state.screen==='activity'&&state.session?.status==='draft'&&['listening','production'].includes(state.kind))pauseTest();
    const list=$('#history-list');list.replaceChildren();
    for(const session of [...store.sessions].reverse()) {
        const row=document.createElement('button');row.className='history-row';row.type='button';const summary=summarize(session);
        row.textContent=`${title(session.kind)} · ${session.mode.toUpperCase()} · ${new Date(session.startedAt).toLocaleDateString('ar')} · ${session.status==='draft'?'متابعة':session.status==='partial'?'جزئي':'مكتمل'} · ${summary.recorded}/${summary.total}`;
        row.addEventListener('click',safe(()=>{$('#history-dialog').close();if(session.status==='draft')resume(session);else showResults(session);}));list.append(row);
    }
    if(!list.children.length)list.textContent='لا توجد نتائج محفوظة بعد.';
    $('#history-dialog').showModal();
}
function newMatching() {
    invalidate();$('#audio-status').textContent='';$('#feedback').replaceChildren();
    const items=shuffle(bank(state.letters,state.mode)).slice(0,3);
    state.matching={items,sources:shuffle(items.map(item=>item.id)),targets:shuffle(items.map(item=>item.id)),matched:[]};state.selectedSource=null;
    $('#matching-board').hidden=false;$('#matching-count').hidden=false;renderMatching();
}
function selectSource(id,button) {
    if(state.matching.matched.includes(id)){void safe(()=>playItem(state.matching.items.find(item=>item.id===id),button))();return;}
    state.selectedSource=id;
    $$('#matching-sources button').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.item===id)));
    const item=state.matching.items.find(item=>item.id===id);void safe(()=>playItem(item,button))();
}
function renderMatching() {
    const match=state.matching,index=new Map(match.items.map(item=>[item.id,item]));
    $('#matching-sources').replaceChildren();$('#matching-targets').replaceChildren();
    for(const id of match.sources) {
        let button;button=syllableButton(index.get(id),()=>{if(!button._dragged)selectSource(id,button);button._dragged=false;},'matching-source');
        button.setAttribute('aria-pressed',String(id===state.selectedSource));button.classList.toggle('matched',match.matched.includes(id));
        attachDrag(button,id);$('#matching-sources').append(button);
    }
    match.targets.forEach((id,i)=>{
        const item=index.get(id),matched=match.matched.includes(id);
        const target=document.createElement('button');target.type='button';target.className='matching-target drop-target'+(matched?' matched':'');target.dataset.target=id;
        target.setAttribute('aria-label',matched?`استمع إلى المقطع المطابق ${item.label}`:`الخيار ${i+1} — استمع وطابق`);
        target.innerHTML=matched?syllableMarkup(item):icon('match');
        target.addEventListener('click',safe(()=>{const playback=playItem(item,target);if(!matched&&state.selectedSource)matchTarget(id);return playback;}));
        $('#matching-targets').append(target);
    });
    $('#matching-count').textContent=`${match.matched.length} / 3`;
}
function matchTarget(id) {
    const match=state.matching;if(!state.selectedSource||match.matched.includes(id))return;
    const correct=state.selectedSource===id;
    if(correct){match.matched.push(id);state.selectedSource=null;renderMatching();}
    showFeedback(correct?'check':'cross',correct?'correct':'incorrect',match.matched.length===3?'اكتملت المطابقة':correct?'مطابقة صحيحة':'حاول مجدداً');
}
function attachDrag(button,id) {
    let pointer=null,ghost=null,startX=0,startY=0,dragging=false;
    const cleanup=()=>{ghost?.remove();ghost=null;pointer=null;$$('.drop-target.is-over').forEach(el=>el.classList.remove('is-over'));};
    button.addEventListener('pointerdown',event=>{
        if(button.disabled||state.matching.matched.includes(id)||event.button!==0)return;
        pointer=event.pointerId;startX=event.clientX;startY=event.clientY;dragging=false;button._dragged=false;
        button.setPointerCapture(pointer);
    });
    button.addEventListener('pointermove',event=>{
        if(event.pointerId!==pointer)return;
        if(!dragging&&Math.hypot(event.clientX-startX,event.clientY-startY)>8){
            dragging=true;state.selectedSource=id;ghost=button.cloneNode(true);ghost.className+=' drag-ghost';ghost.removeAttribute('id');ghost.style.width=button.getBoundingClientRect().width+'px';document.body.append(ghost);
        }
        if(!dragging)return;
        event.preventDefault();ghost.style.left=event.clientX+'px';ghost.style.top=event.clientY+'px';
        $$('.drop-target.is-over').forEach(el=>el.classList.remove('is-over'));const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.drop-target');if(target&&!state.matching.matched.includes(target.dataset.target))target.classList.add('is-over');
    });
    button.addEventListener('pointerup',event=>{
        if(event.pointerId!==pointer)return;
        button._dragged=dragging;const target=dragging?document.elementFromPoint(event.clientX,event.clientY)?.closest('.drop-target'):null;
        cleanup();if(target&&!state.matching.matched.includes(target.dataset.target))matchTarget(target.dataset.target);
    });
    button.addEventListener('pointercancel',cleanup);button.addEventListener('lostpointercapture',cleanup);
}
function renderRewards() {
    $('#reward-stars').replaceChildren();$('#reward-target').textContent=`${state.rewards.length} نجوم`;
    state.rewards.forEach((filled,i)=>{
        const button=document.createElement('button');button.className='icon reward-star';button.type='button';button.innerHTML=icon('star');button.setAttribute('aria-label',`نجمة ${i+1}`);button.setAttribute('aria-pressed',String(filled));
        button.addEventListener('click',()=>{state.rewards[i]=!filled;renderRewards();});$('#reward-stars').append(button);
    });
    $('#reward-message').textContent=state.rewards.every(Boolean)?'أحسنت ✓':'';
}
$$('[data-open]').forEach(button=>button.addEventListener('click',()=>openSetup(button.dataset.open)));
$$('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
$$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
$('#setup-form').addEventListener('submit',event=>{event.preventDefault();void safe(startActivity)();});
$('#home-button').addEventListener('click',safe(home));$('#paused-home').addEventListener('click',safe(home));
$('#settings-button').addEventListener('click',()=>openSetup(state.kind));$('#pause-button').addEventListener('click',safe(pauseTest));
$('#continue-button').addEventListener('click',safe(()=>resume(state.session)));$('#resume-button').addEventListener('click',safe(()=>resume(latestDraft())));
$('#finish-button').addEventListener('click',safe(finishPartial));
$('#listening-cue').addEventListener('click',safe(replayAssessment));
$('#skip-button').addEventListener('click',safe(()=>respond('skip')));
$$('[data-grade]').forEach(button=>button.addEventListener('click',safe(()=>{const score=Number(button.dataset.grade);return respond(score===100?'correct':score===0?'incorrect':'emerging','',score);})));
$('#previous-page').addEventListener('click',()=>{state.page--;renderPractice();});$('#next-page').addEventListener('click',()=>{state.page++;renderPractice();});
$('#restart-button').addEventListener('click',newMatching);$('#history-button').addEventListener('click',safe(openHistory));
$('#repeat-button').addEventListener('click',()=>{state.letters=[...state.result.letters];state.mode=state.result.mode;openSetup(state.result.kind);});
$('#print-button').addEventListener('click',()=>window.print());
$('#rewards-button').addEventListener('click',()=>{renderRewards();$('#rewards-dialog').showModal();});
$('#reward-target').addEventListener('click',()=>{const counts=[5,10,15];state.rewards=Array(counts[(counts.indexOf(state.rewards.length)+1)%3]).fill(false);renderRewards();});
$('#clear-rewards').addEventListener('click',()=>{state.rewards.fill(false);renderRewards();});
let resizeTimer;
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(state.screen==='activity'&&state.kind==='practice')renderPractice();},120);});
window.addEventListener('pagehide',()=>{invalidate();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(state.screen==='activity'&&state.session?.status==='draft'&&['listening','production'].includes(state.kind))void safe(pauseTest)();else stopAudio();}});
showScreen('home');updateResume();if(document.body.dataset.entry==='matching')openSetup('matching');
