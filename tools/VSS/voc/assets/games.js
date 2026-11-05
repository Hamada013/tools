/* Four games, one bounded renderer and one audio player. Every delayed action
 * belongs to a render generation; pause/exit/restart cancels it immediately. */
(() => {
    'use strict';
    const M = window.VocGameModel;
    const P = window.VocProgress;
    const mode = document.body.dataset.game;
    const $ = selector => document.querySelector(selector);
    const all = selector => [...document.querySelectorAll(selector)];
    const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
    if (mode === 'hub') return;
    const bank = window.VOC_GAME_DATA;
    const meta = M.MODES[mode];
    if (!bank || !meta) return;
    const items = bank.categories.flatMap(category => category.items);
    const byKey = new Map(items.map(item => [item.key, item]));
    const prefix = P.scope(`hamada-game-${mode}`);
    let learnedDomain = null;
    const learningDomain = mode === 'test' ? 'receptive' : mode === 'rapid' ? 'expressive' : null;
    const inLibrary = item => P.inLibrary(item, learnedDomain, learningDomain);
    let activePlan = null;
    let advanceTimer = null;
    const audio = $('#game-audio');
    let session = null;
    let selected = new Set();
    let categoryId = String(bank.categories[0].id);
    let page = 0;
    let phase = 'setup';
    let generation = 0;
    let audioGeneration = 0;
    let cancelAudioEnd = null;
    let ready = false;
    let heardKey = null;
    let lastKey = null;
    let gradeReady = false;
    let deadline = null;
    let runningSince = null;
    let storageWarned = false;
    let guideBusy = false;
    let beatContext = null, beatRun = null;
    document.body.classList.add('compact-game');
    const automaticToolbar=document.createElement('div');automaticToolbar.className='automatic-toolbar';automaticToolbar.hidden=true;
    const stars=document.createElement('div');stars.id='automatic-stars';stars.className='automatic-stars';stars.setAttribute('role','progressbar');stars.setAttribute('aria-label','تقدم كلمات اللعبة');
    automaticToolbar.append(stars);$('#play-view').prepend(automaticToolbar);
    const pauseButton=$('#pause-game');pauseButton.classList.add('icon-button');pauseButton.setAttribute('aria-label','إيقاف مؤقت');pauseButton.title='إيقاف مؤقت';pauseButton.innerHTML='<i class="fas fa-pause" aria-hidden="true"></i>';
    const actions=document.createElement('div');actions.className='automatic-actions';actions.append(pauseButton,$('#play-word'));automaticToolbar.prepend(actions);
    for(const [id,icon,label]of [['continue-game','play','متابعة اللعب'],['change-cards','th-large','تغيير البطاقات'],['finish-paused','flag','إنهاء الجلسة'],['review-missed','redo','مراجعة الكلمات'],['play-again','redo','جلسة جديدة'],['return-setup','th-large','اختيار بطاقات أخرى'],['next-round','play','الجولة التالية']]){
        const control=$('#'+id);control.classList.add('icon-button');control.setAttribute('aria-label',label);control.title=label;control.innerHTML=`<i class="fas fa-${icon}" aria-hidden="true"></i>`;
    }
    let scoreHelpDialog;
    if(mode==='rapid'){
        const help=document.createElement('button');help.id='production-score-help';help.type='button';help.className='game-button icon-button';help.title='شرح تقييم الاستجابة';help.setAttribute('aria-label',help.title);help.setAttribute('aria-haspopup','dialog');help.setAttribute('aria-controls','production-score-guide');
        help.innerHTML='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h6"/></svg>';
        actions.append(help);
        scoreHelpDialog=document.createElement('dialog');scoreHelpDialog.id='production-score-guide';scoreHelpDialog.className='production-score-guide';scoreHelpDialog.dir='rtl';scoreHelpDialog.setAttribute('aria-labelledby','production-score-title');
        scoreHelpDialog.innerHTML='<header><h2 id="production-score-title" tabindex="-1">تقييم الاستجابة</h2><button type="button" class="game-button icon-button" aria-label="إغلاق الشرح"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header><p>كل اختيار يسجّل الاستجابة وينتقل للكلمة التالية.</p><div class="production-score-legend"></div>';
        for(const control of all('#rapid-grading [data-rating]')){
            const row=document.createElement('div'),label=document.createElement('span');row.className='production-score-row';label.textContent=control.getAttribute('aria-label');row.append(control.querySelector('img').cloneNode(true),label);scoreHelpDialog.querySelector('.production-score-legend').append(row);
        }
        document.body.append(scoreHelpDialog);
        help.onclick=()=>{stopBeats();scoreHelpDialog.showModal();scoreHelpDialog.querySelector('h2').focus();};
        scoreHelpDialog.querySelector('button').onclick=()=>scoreHelpDialog.close();
        scoreHelpDialog.addEventListener('close',()=>help.focus());
        scoreHelpDialog.addEventListener('click',event=>{if(event.target!==scoreHelpDialog)return;const r=scoreHelpDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)scoreHelpDialog.close();});
    }
    const gamesLink=$('#results-view .game-back');gamesLink.setAttribute('aria-label','قائمة الألعاب');gamesLink.title='قائمة الألعاب';gamesLink.innerHTML='<i class="fas fa-gamepad" aria-hidden="true"></i>';
    function stopBeats(){
        beatRun?.abort();beatRun=null;
        $('#play-production-beats').setAttribute('aria-busy','false');
        $('#production-rhythm').classList.remove('is-playing');
        all('.production-beat.lit').forEach(beat=>beat.classList.remove('lit'));
    }
    async function clickBeat(signal){
        beatContext ||= new (window.AudioContext||window.webkitAudioContext)();
        await beatContext.resume();if(signal.aborted)return;
        const tone=beatContext.createOscillator(),gain=beatContext.createGain(),now=beatContext.currentTime;
        tone.frequency.value=1000;gain.gain.setValueAtTime(.18,now);gain.gain.exponentialRampToValueAtTime(.001,now+.1);tone.connect(gain);gain.connect(beatContext.destination);
        const stop=()=>{try{tone.stop();}catch{}};
        signal.addEventListener('abort',stop,{once:true});tone.onended=()=>{signal.removeEventListener('abort',stop);tone.disconnect();gain.disconnect();};tone.start(now);tone.stop(now+.1);
    }
    function beatGap(ms,signal){return new Promise(resolve=>{if(signal.aborted){resolve();return;}const done=()=>{clearTimeout(timer);signal.removeEventListener('abort',done);resolve();},timer=setTimeout(done,ms);signal.addEventListener('abort',done,{once:true});});}
    async function playProductionBeats(index=null){
        if(!ready||phase!=='active')return;
        const wasPlaying=!!beatRun;stopBeats();stopAudio();
        if(wasPlaying&&index===null)return;
        const controller=new AbortController();beatRun=controller;
        const sequence=index===null?all('.production-beat'):[all('.production-beat')[index]];
        $('#production-rhythm').classList.add('is-playing');$('#play-production-beats').setAttribute('aria-busy','true');
        try{
            for(const beat of sequence){
                if(controller.signal.aborted)break;
                beat.classList.add('lit');await clickBeat(controller.signal);await beatGap(350,controller.signal);beat.classList.remove('lit');
                if(beat!==sequence.at(-1))await beatGap(600,controller.signal);
            }
        }catch{if(!controller.signal.aborted)feedback('تعذر تشغيل الإيقاع.',true);}
        finally{if(beatRun===controller)stopBeats();}
    }
    $('#play-production-beats').onclick=()=>void playProductionBeats();
    function fitBoard(){
        if($('#play-view').hidden)return;
        const board=$('#game-board'), count=board.children.length;if(!count)return;
        const {width,height}=board.getBoundingClientRect();
        let best={size:0,columns:1,rows:count};
        for(let columns=1;columns<=Math.min(count,6);columns++){
            const rows=Math.ceil(count/columns),size=Math.min((width-(columns-1)*10)/columns,(height-(rows-1)*10)/rows);
            if(size>best.size)best={size,columns,rows};
        }
        board.style.setProperty('--board-columns',best.columns);board.style.setProperty('--board-rows',best.rows);
        if(mode==='matching'){
            board.style.setProperty('--match-size',`${Math.max(0,Math.floor(best.size))}px`);
            const source=$('#active-match'),height=source.getBoundingClientRect().height;
            source.style.setProperty('--source-size',`${Math.max(0,Math.floor(Math.min(best.size,source.clientWidth,height)))}px`);
        }
    }
    const boardObserver=new ResizeObserver(fitBoard);boardObserver.observe($('#game-board'));boardObserver.observe($('#active-match'));
    function productionBeats(item){
        const row=$('#production-beats');row.replaceChildren();
        if(mode!=='rapid')return;
        for(let i=0;i<item.syllableCount;i++){
            const beat=document.createElement('button');beat.type='button';beat.className='production-beat';
            beat.setAttribute('aria-label',`المقطع ${i+1} من ${item.syllableCount}${item.syllables?.[i]?' · '+item.syllables[i]:''}`);
            beat.onclick=()=>void playProductionBeats(i);row.append(beat);
        }
    }
    const preview = document.createElement('dialog'); preview.id = 'word-preview'; preview.className = 'word-preview'; preview.hidden = true;
    preview.setAttribute('aria-label', 'نتعرّف على الكلمات');
    preview.addEventListener('cancel', event => { event.preventDefault(); pause(); });
    document.body.append(preview);
    const timers = new Set();

    function alert(text) { $('#game-alert').textContent = text; $('#game-alert').hidden = false; }
    function feedback(text, error = false) { const status = preview.querySelector('[role=status]'); if (status) {status.textContent = text;status.classList.toggle('error',error);} $('#game-feedback').textContent = text; $('#game-feedback').classList.toggle('error', error); }
    function store(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; }
        catch { if (!storageWarned) { storageWarned = true; alert('التخزين المحلي غير متاح. يمكنك اللعب، لكن قد لا يُحفظ التقدم بعد إغلاق الصفحة.'); } return false; }
    }
    function collectTime() {
        if (session && runningSince !== null) session.elapsedMs += performance.now() - runningSince;
        runningSince = null;
    }
    function save() {
        if (!session) return;
        captureHomework();
        collectTime();
        if (['active', 'feedback', 'between'].includes(phase)) runningSince = performance.now();
        store(`${prefix}-draft`, session);
    }
    // A stopped production trial still owns the observations already entered.
    function observedRecords(){
        if(mode!=='rapid')return session.records;
        const key=session.order[session.position],history=session.ratingHistory?.[key];
        if(!history?.length || session.records.some(record=>record.key===key))return session.records;
        const rating=history.at(-1);
        return [...session.records,{key,result:rating===0?'notMastered':'learning',productionRating:rating,ratingHistory:[...history]}];
    }
    function captureHomework() {
        const domain=mode==='test'?'receptive':mode==='rapid'?'expressive':null;
        window.SessionHomework?.capture({id:session.sessionId||`${mode}-${session.created}`,activity:meta.title||({matching:'المطابقة',memory:'الذاكرة',rapid:'البطاقات السريعة',test:'استمع واختر'})[mode],kind:domain?'assessment':'practice',domain,
            records:observedRecords().map(record=>({key:record.key,label:byKey.get(record.key)?.name,
                correct:Number(mode==='rapid'?record.result==='mastered':record.result==='correct'&&record.attempts===1),
                total:domain&&!['viewed','skip'].includes(record.result)?1:0,needsHelp:['notMastered','learning','skip'].includes(record.result)||record.attempts>1}))});
    }
    function stopAudio() { ++audioGeneration; cancelAudioEnd?.(); audio.pause(); }
    function clearWork() {
        collectTime(); ++generation;stopBeats();
        for (const timer of timers) clearTimeout(timer);
        timers.clear(); stopAudio(); ready = false; deadline = null;
        $('#play-view').classList.remove('listening-replay', 'production-preview');
        preview.close(); preview.hidden = true; scoreHelpDialog?.close(); guideBusy = false;
        if(document.documentElement.dataset.suiteInput!=='keyboard')document.activeElement?.blur();
        if(beatContext?.state==='running')void beatContext.suspend();
    }
    function later(action, delay) {
        const ticket = generation;
        const timer = setTimeout(() => { timers.delete(timer); if (ticket === generation) action(); }, delay);
        timers.add(timer); return timer;
    }
    function show(view) {
        for (const id of ['setup', 'play', 'pause', 'results']) $(`#${id}-view`).hidden = id !== view;
        $('#rapid-autoplay').hidden = !!activePlan || mode !== 'rapid' || view !== 'play';
        automaticToolbar.hidden=view!=='play';
        document.body.classList.toggle('compact-playing',view==='play');
        document.body.classList.toggle('automatic-playing',!!activePlan&&view==='play');
    }
    function settings() {
        return { level: Number(picked('game-level')), length: Number(picked('game-length')), duration: Number(picked('game-duration')),
            labels: mode === 'test' ? false : $('#show-labels').checked, sound: mode === 'test' ? true : $('#sound-hint').checked };
    }
    function picked(name) { return $(`input[name="${name}"]:checked`).value; }
    function pick(name, value) { $(`input[name="${name}"][value="${value}"]`).checked = true; }
    function selectionPreferences() { store(`${prefix}-preferences`, { selected: [...selected], settings: settings(), category: categoryId }); }
    function categoryTile(category) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'category-tile';
        button.dataset.category = category.id; button.setAttribute('aria-pressed', String(String(category.id) === categoryId));
        const symbol = document.createElement('span'); symbol.className = 'category-symbol'; symbol.setAttribute('aria-hidden', 'true');
        const icon = document.createElement('i');
        const motifs = [[/حيوان|طيور/, 'paw'], [/طعام|فواكه|خضار|أكل/, 'apple-alt'], [/ملابس/, 'tshirt'], [/مواصلات|نقل/, 'car'], [/جسم|حواس/, 'hand-paper'], [/منزل|بيت|غرف/, 'home'], [/ألوان|أشكال/, 'palette'], [/مهن/, 'briefcase'], [/أرقام|عدد/, 'sort-numeric-up'], [/مشاعر/, 'smile'], [/مدرس/, 'book-open'], [/طقس|فصول/, 'cloud-sun']];
        icon.className = `fas fa-${motifs.find(([pattern]) => pattern.test(category.name))?.[1] || 'shapes'}`;
        symbol.style.setProperty('--category-tint', ['#e6f4ff', '#e5f8ef', '#fff2dc', '#f1edff'][category.id % 4]);
        symbol.append(icon);
        const title = document.createElement('strong'); title.textContent = category.name;
        const count = document.createElement('small'); count.textContent = `${category.items.length} بطاقة`;
        button.append(symbol, title, count);
        button.addEventListener('click', () => {
            categoryId = String(category.id); page = 0; $('#word-search').value = '';
            $('#category-search').value = ''; toggleCategories(false); renderCategoryGrid(); updateCategoryMarks();
            refreshSelection(); selectionPreferences();
            const active = $(`#category-rail [data-category="${categoryId}"]`);
            active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); active.focus({ preventScroll: true });
        });
        return button;
    }
    function updateCategoryMarks() {
        for (const button of all('[data-category]')) button.setAttribute('aria-pressed', String(button.dataset.category === categoryId));
        $('#current-category').textContent = bank.categories.find(category => String(category.id) === categoryId).name;
    }
    function renderCategoryGrid() {
        const query = M.normalize($('#category-search').value.trim());
        const categories = bank.categories.filter(category => M.normalize(category.name).includes(query));
        $('#category-grid').replaceChildren(...categories.map(categoryTile)); $('#category-empty').hidden = categories.length > 0;
    }
    function toggleCategories(expanded) {
        $('#category-panel').hidden = !expanded; $('#toggle-categories').setAttribute('aria-expanded', String(expanded));
    }
    function filteredItems() {
        const query = M.normalize($('#word-search').value.trim());
        return (query ? items.filter(item => M.normalize(item.name).includes(query))
            : bank.categories.find(category => String(category.id) === categoryId).items).filter(item => inLibrary(item));
    }
    function refreshSelection() {
        selected = new Set([...selected].filter(key => inLibrary(key)));
        const visible = filteredItems(), pageCount = Math.max(1, Math.ceil(visible.length / 24));
        page = Math.min(page, pageCount - 1);
        $('#selection-grid').replaceChildren();
        for (const item of visible.slice(page * 24, (page + 1) * 24)) {
            const button = document.createElement('button'); button.className = 'selection-card'; button.type = 'button';
            button.dataset.key = item.key; button.setAttribute('aria-pressed', String(selected.has(item.key)));
            button.setAttribute('aria-label', `اختيار ${item.name}`);
            const image = document.createElement('img'); image.alt = ''; image.loading = 'lazy'; image.decoding = 'async';
            image.onerror = () => { image.onerror = null; image.src = 'images/placeholder.svg'; }; image.src = item.image;
            const name = document.createElement('span'); name.textContent = item.name; button.append(image, name);
            button.addEventListener('click', () => {
                if (selected.has(item.key)) selected.delete(item.key); else selected.add(item.key);
                button.setAttribute('aria-pressed', String(selected.has(item.key))); updatePreview(); selectionPreferences();
            });
            $('#selection-grid').append(button);
        }
        if (!visible.length) { const p = document.createElement('p'); p.className = 'game-note'; p.textContent = 'لا توجد كلمات مطابقة للبحث.'; $('#selection-grid').append(p); }
        $('#page-info').textContent = `${page + 1} / ${pageCount} · ${visible.length} بطاقة`;
        $('#page-previous').disabled = page === 0; $('#page-next').disabled = page >= pageCount - 1;
        updatePreview();
    }
    function updatePreview() {
        const visible = filteredItems();
        $('#select-category').setAttribute('aria-pressed', String(visible.length > 0 && visible.every(item => selected.has(item.key))));
        $('#select-everything').setAttribute('aria-pressed', String(items.filter(item => inLibrary(item)).every(item => selected.has(item.key))));
        const unique = M.uniqueItems(items.filter(item => selected.has(item.key)));
        const config = settings();
        const count = mode === 'memory' ? Math.min(config.level, unique.length) : Math.min(config.length, unique.length);
        $('#selected-count').textContent = `المحدد: ${selected.size} · بطاقات مختلفة: ${unique.length}`;
        $('#session-preview').textContent = unique.length < meta.minimum ? `اختر ${meta.minimum} بطاقات مختلفة على الأقل.`
            : mode === 'memory' ? `لوحة من ${count} أزواج (${count * 2} بطاقة).` : `${count} كلمات في جلسة واحدة${mode === 'rapid' ? '' : ` · حتى ${Math.min(config.level, unique.length)} صور للاختيار`}.`;
        $('#start-game').disabled = unique.length < meta.minimum;
    }
    function renderResume() {
        const draft = read(`${prefix}-draft`);
        const usable = validDraft(draft);
        $('#resume-card').hidden = !usable;
        if (usable) $('#resume-description').textContent = `${draft.position} من ${draft.order.length} ${mode === 'memory' ? 'أزواج' : 'كلمات'} محفوظة. يمكنك المتابعة أو بدء جلسة جديدة.`;
    }
    function validDraft(value) {
        return value && value.schema === 1 && value.mode === mode && value.dataVersion === bank.version && !value.finished &&
            Array.isArray(value.order) && value.order.length > 0 && value.order.length <= 20 && value.order.every(key => byKey.has(key)) &&
            Array.isArray(value.pool) && value.pool.every(key => byKey.has(key)) && Number.isInteger(value.position) && value.position >= 0 && value.position <= value.order.length &&
            value.settings && [2, 4, 6].includes(value.settings.level) && Array.isArray(value.records) && Array.isArray(value.deck) && Array.isArray(value.open) && Array.isArray(value.matched);
    }
    function stopPlan() {
        clearTimeout(advanceTimer); P.cancelPlan(); activePlan = null; planBanner.hidden = true; document.body.classList.remove('automatic-plan','automatic-playing');
        automaticToolbar.hidden=$('#play-view').hidden;
        all('[data-child-profile]').forEach(button => { button.disabled = false; });
    }
    function begin(pool = null, review = false, round = null) {
        clearWork();
        if (!round && activePlan) stopPlan();
        try { session = M.createSession(mode, pool || items.filter(item => selected.has(item.key)), round?.settings || settings(), bank.version); }
        catch (error) { alert(error.message); return; }
        session.sessionId = `${mode}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        session.review = review;
        if (activePlan) { session.planId = activePlan.id; session.planPosition = activePlan.position; }
        $('#game-alert').hidden = true;
        if (['memory','test','rapid'].includes(mode)) session.guide = { index: 0, done: false };
        selectionPreferences(); save(); void launch();
    }
    async function launch() {
        clearWork(); phase = 'countdown'; show('play');
        if (!await window.VocCountdown.start()) {
            phase = 'paused'; save(); show('pause'); $('#pause-description').textContent = 'اضغط المتابعة عندما تكون مستعداً.'; return;
        }
        void renderCurrent();
    }
    function updateStats() {
        {
            const plan=activePlan?P.active().plan:null;
            const completed=new Set((plan?.rounds||[]).slice(0,activePlan?.position||0).filter(round=>round.mode===mode).flatMap(round=>round.keys));
            session.records.filter(record=>!['viewed','skip'].includes(record.result)).forEach(record=>completed.add(record.key));
            stars.replaceChildren(...(plan?.keys||session.order).map(key=>{
                const star=document.createElement('span');star.className=completed.has(key)?'earned':'';star.textContent='★';star.setAttribute('aria-hidden','true');return star;
            }));
            stars.setAttribute('aria-valuemin','0');stars.setAttribute('aria-valuemax',String(stars.children.length));stars.setAttribute('aria-valuenow',String(completed.size));
            stars.setAttribute('aria-valuetext',`${completed.size} من ${stars.children.length} كلمات`);
        }
        $('#session-progress').max = session.order.length; $('#session-progress').value = session.position;
        $('#session-counter').textContent = `${mode === 'memory' ? 'الأزواج' : 'الكلمات'}: ${session.position} / ${session.order.length}${session.review ? ' · مراجعة' : ''}`;
        $('#attempt-counter').textContent = mode === 'memory' ? `المحاولات: ${session.moves}` : mode === 'rapid' ? `تم تقييم: ${session.records.filter(record => record.result !== 'viewed' && record.result !== 'skip').length}` : `الاختيارات: ${session.attempts}`;
        $('#mistake-counter').textContent = `تحتاج تدريباً: ${session.missed.length}`;
    }
    function enableControls() {
        if($('#production-score-help'))$('#production-score-help').disabled=phase!=='active'||!ready;
        const active = phase === 'active' && ready;
        for (const button of all('#game-board > button, #active-match > button')) {
            button.disabled = !active || button.classList.contains('matched') || (mode === 'test' && heardKey !== session.order[session.position]);
        }
        for (const button of all('[data-grade]')) button.disabled = !active || !gradeReady || session.autoPlay;
        $('#play-word').disabled = !lastKey || !ready || !['active', 'feedback', 'guiding'].includes(phase) || (['matching', 'test'].includes(mode) && phase === 'feedback') || session.autoPlay || (phase === 'guiding' && guideBusy);
        const guideReplay = preview.querySelector('[data-guide-replay]');
        if (guideReplay) guideReplay.disabled = guideBusy || phase !== 'guiding';
        $('#show-grading').disabled = !active || gradeReady;
        $('#skip-word').disabled = !active;
    }
    function picture(item, labels, className = 'picture-button', tag = 'button') {
        const element = document.createElement(tag); element.className = className; element.dataset.key = item.key;
        if (tag === 'button') { element.type = 'button'; element.disabled = true; element.setAttribute('aria-label', item.name); }
        const image = document.createElement('img'); image.alt = item.name; image.decoding = 'async';
        image.draggable = false;
        const loaded = new Promise(resolve => {
            const timer = setTimeout(() => resolve(false), 12000);
            image.onload = () => { clearTimeout(timer); resolve(true); };
            image.onerror = () => { clearTimeout(timer); resolve(false); };
        });
        image.src = item.image; element.append(image);
        if (labels) { const name = document.createElement('span'); name.textContent = item.name; element.append(name); }
        return { element, loaded };
    }
    async function renderCurrent() {
        clearWork();
        if (session.position >= session.order.length) { finish(false); return; }
        phase = 'loading'; gradeReady = false; heardKey = null;
        const ticket = generation;
        show('play'); updateStats();
        $('#play-title').textContent = session.autoPlay ? 'استمع وشاهد البطاقات.' : meta.description;
        $('#game-board').className = `game-board${mode === 'memory' ? ' memory-board' : ''}`;
        $('#game-board').replaceChildren(); $('#active-match').replaceChildren();
        $('#rapid-autoplay').disabled = false;
        $('#rapid-autoplay').setAttribute('aria-pressed', String(!!session.autoPlay));
        $('#rapid-controls').hidden = mode !== 'rapid' || session.autoPlay; $('#next-round').hidden = true; $('#reload-media').hidden = true;
        $('#skip-word').hidden = !!activePlan || !['rapid', 'test'].includes(mode) || session.autoPlay;
        feedback('جاري تحميل الصور…');
        const loading = [];
        const target = byKey.get(session.order[session.position]);
        lastKey = mode === 'memory' ? null : target.key;
        productionBeats(target);
        if (mode === 'memory') {
            if (session.order.length <= 2) $('#game-board').classList.add('two-columns');
            else if (session.order.length === 3) $('#game-board').classList.add('three-columns');
            session.deck.forEach((card, i) => {
                const item = byKey.get(card.key), button = document.createElement('button');
                button.className = 'picture-button memory-card'; button.type = 'button'; button.dataset.index = i; button.dataset.key = card.key; button.disabled = true;
                const back = document.createElement('span'); back.className = 'memory-back'; back.textContent = '؟'; back.setAttribute('aria-hidden', 'true');
                const front = picture(item, session.settings.labels, 'memory-front', 'div'); loading.push(front.loaded);
                button.append(back, front.element); button.addEventListener('click', () => flip(i, ticket)); $('#game-board').append(button);
            });
            updateMemory();
        } else if (mode === 'rapid') {
            $('#game-board').className = 'single-card';
            const card = picture(target, session.settings.labels, 'picture-button', 'div'); loading.push(card.loaded); $('#game-board').append(card.element);
        } else {
            let keys;
            if (mode === 'matching') {
                const boardIndex = Math.floor((session.position - (session.between ? 1 : 0)) / session.settings.level);
                keys = session.boards[boardIndex];
            } else { session.currentChoices ||= M.choices(session, byKey); keys = session.currentChoices; }
            if (keys.length > 4) $('#game-board').classList.add('three-columns');
            for (const key of keys) {
                const card = picture(byKey.get(key), mode === 'matching' && session.settings.labels); loading.push(card.loaded);
                if (mode === 'matching' && session.order.slice(0, session.position).includes(key)) card.element.classList.add('matched');
                card.element.addEventListener('click', () => choose(key, ticket)); $('#game-board').append(card.element);
            }
            if (mode === 'matching' && !session.between) {
                const source = picture(target, session.settings.labels, 'picture-button match-source'); loading.push(source.loaded);
                source.element.setAttribute('aria-label', `اسمع ${target.name}؛ طابقها مع إحدى الصور`);
                source.element.addEventListener('click', () => { if (phase === 'active' && ready) void playWord(target.key); });
                attachDrag(source.element, ticket); $('#active-match').append(source.element);
            }
        }
        $('#game-board').dataset.count=$('#game-board').children.length;
        fitBoard();enableControls(); save();
        const results = await Promise.all(loading); // At most 12 memory cards / 7 matching images.
        if (ticket !== generation) return;
        ready = results.every(Boolean);
        phase = session.between ? 'between' : 'active'; runningSince = performance.now();
        if (!ready) { feedback('تعذر تحميل صورة. أعد التحميل أو نزّل المحتوى من الرئيسية. يمكنك إنهاء الجلسة دون احتسابها نجاحاً.', true); $('#reload-media').hidden = false; enableControls(); return; }
        if(mode!=='memory')window.SessionHomework?.record({activity:({matching:'المطابقة',rapid:'البطاقات السريعة',test:'استمع واختر'})[mode],key:target.key,label:target.name});
        if (session.between) { feedback('أحسنت! أكملت هذه المجموعة.'); later(() => { session.between = false; void renderCurrent(); }, 650); enableControls(); return; }
        if (session.guide && !session.guide.done) { void runGuide(ticket); return; }
        feedback(mode === 'test' ? 'استمع إلى الكلمة ثم المس صورتها.' : meta.description);
        if (mode === 'memory' && session.pendingMismatch) { phase = 'feedback'; later(closeMismatch, 800); }
        if (mode === 'rapid' && session.autoPlay) { enableControls(); void autoAdvance(ticket); return; }
        if (mode === 'rapid') startObservation(activePlan?0:session.rapidRemaining??session.settings.duration*1000);
        enableControls();
        if (mode === 'test' || (mode === 'rapid' && session.settings.sound)) await playWord(target.key, mode === 'test');
        if (ticket === generation) enableControls();
    }
    // A preview never changes attempts, grades, or mastery. Its cursor survives a pause/reload.
    async function runGuide(ticket) {
        if (guideBusy || ticket !== generation) return;
        guideBusy = true; phase = 'guiding';
        $('#rapid-controls').hidden = true; $('#skip-word').hidden = true;
        $('#rapid-autoplay').disabled = true;
        const guide = session.guide;
        const keys = mode === 'test' ? [session.order[0]] : session.order;
        if (mode === 'memory') updateMemory();

        while (guide.index < keys.length && ticket === generation) {
            const key = keys[guide.index]; lastKey = key;
            feedback(mode === 'memory' ? 'شاهد الزوج واستمع.' : mode === 'test' ? 'نجرب مرة معاً.' : 'استمع وشاهد.');
            all('#game-board > button').forEach(button => button.classList.toggle('guide-glow', mode === 'memory' && button.dataset.key === key));
            if (mode === 'rapid') {
                const card = picture(byKey.get(key), true, 'picture-button', 'div');
                $('#game-board').replaceChildren(card.element);productionBeats(byKey.get(key));fitBoard();
                if (!await card.loaded || ticket !== generation) {
                    if (ticket === generation) {
                        guideBusy = false; feedback('تعذر تحميل الصورة. اضغط زر إعادة المحاولة.', true);
                        const retry = preview.querySelector('[data-guide-replay]')||$('#play-word'); retry.setAttribute('aria-label', 'إعادة المحاولة'); retry.title = 'إعادة المحاولة';
                        enableControls();
                    }
                    return;
                }
            }
            enableControls();
            const played = await playWord(key, false, true);
            if (ticket !== generation) return;
            if (!played) {
                guideBusy = false;
                if (!$('#game-feedback').classList.contains('error')) feedback('اضغط ▶ لإعادة الصوت.', true);
                enableControls(); return;
            }
            window.SessionHomework?.record({activity:`التعرّف على كلمات ${meta.title}`,key,label:byKey.get(key).name});
            if (mode === 'test') all('#game-board > button').forEach(button => button.classList.toggle('guide-glow', button.dataset.key === key));
            await new Promise(resolve => later(resolve, 900));
            if (ticket !== generation) return;
            guide.index++; save();
        }
        if (ticket !== generation) return;
        if (mode === 'test' && session.currentChoices) session.currentChoices = M.shuffleAfterDemo(session.currentChoices, session.currentChoices.indexOf(session.order[session.position]));
        guide.done = true; guideBusy = false; $('#rapid-autoplay').disabled = false;
        save(); void renderCurrent();
    }
    // Completion is separate from play(): play() resolves when audio STARTS.
    // A progress-reset watchdog handles broken/stalled media without imposing
    // a fixed duration limit on a healthy clip. Pause/exit cancels this waiter.
    function waitForAudioEnd() {
        let complete, idleTimer, lastTime = -1, settled = false;
        const promise = new Promise(resolve => { complete = resolve; });
        const finish = success => {
            if (settled) return;
            settled = true; clearTimeout(idleTimer);
            audio.removeEventListener('ended', ended); audio.removeEventListener('error', failed);
            audio.removeEventListener('timeupdate', progress);
            if (cancelAudioEnd === cancel) cancelAudioEnd = null;
            complete(success);
        };
        const ended = () => finish(true), failed = () => finish(false), cancel = () => finish(false);
        const arm = () => { clearTimeout(idleTimer); idleTimer = setTimeout(() => { audio.pause(); finish(false); }, 15000); };
        const progress = () => { if (audio.currentTime > lastTime) { lastTime = audio.currentTime; arm(); } };
        audio.addEventListener('ended', ended); audio.addEventListener('error', failed); audio.addEventListener('timeupdate', progress);
        cancelAudioEnd = cancel; arm();
        return { promise, cancel };
    }
    async function playWord(key, required = false, waitUntilEnded = false) {
        if (!byKey.has(key) || !ready) return false;
        stopBeats();stopAudio();
        const ticket = generation, audioTicket = audioGeneration;
        audio.src = byKey.get(key).audio; lastKey = key;
        const completion = waitUntilEnded ? waitForAudioEnd() : null;
        let timer;
        try {
            await Promise.race([audio.play(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), 10000); })]);
            clearTimeout(timer);
            if (ticket !== generation || audioTicket !== audioGeneration) return false;
            if (required) { heardKey = key; feedback('الآن اختر الصورة المطابقة للكلمة.'); }
            enableControls();
            if (completion) return await completion.promise && ticket === generation && audioTicket === audioGeneration;
            return true;
        } catch {
            if (ticket === generation && audioTicket === audioGeneration) { audio.pause(); feedback('اضغط ▶ لإعادة الصوت.', true); }
            return false;
        } finally { clearTimeout(timer); completion?.cancel(); }
    }
    function missed(key) { if (!session.missed.includes(key)) session.missed.push(key); }
    function choose(key, ticket) {
        if (ticket !== generation || phase !== 'active' || !ready || (mode === 'test' && heardKey !== session.order[session.position])) return;
        if (mode === 'matching' && session.order.slice(0, session.position).includes(key)) return;
        const target = session.order[session.position]; session.attempts++;
        const button = all('#game-board > button').find(card => card.dataset.key === key);
        if (key !== target) {
            window.SessionHomework?.record({activity:meta.title,key:target,label:byKey.get(target).name,needsHelp:true});
            session.mistakes++; session.trialMistakes++; missed(target); button.classList.add('wrong');
            feedback('حاول مرة أخرى. يمكنك سماع الكلمة مجدداً.', true);
            if (mode === 'test') {
                phase = 'feedback'; heardKey = null; enableControls();
                later(async () => {
                    button.classList.remove('wrong'); $('#play-view').classList.add('listening-replay');
                    const played = await playWord(target, true, true);
                    if (ticket !== generation) return;
                    $('#play-view').classList.remove('listening-replay');
                    phase = 'active';
                    if (!played) heardKey = null;
                    enableControls();
                }, 450);
            } else later(() => button.classList.remove('wrong'), 450);
            save(); updateStats(); return;
        }
        phase = 'feedback';
        if (!session.trialMistakes) session.firstCorrect++;
        session.records.push({ key: target, result: 'correct', attempts: session.trialMistakes + 1 });
        session.position++; session.trialMistakes = 0; session.currentChoices = null;
        if(document.documentElement.dataset.suiteInput!=='keyboard')document.activeElement?.blur();
        button.classList.add('matched'); feedback(`أحسنت! ${byKey.get(target).name}`); enableControls();
        save(); updateStats();
        const feedbackStarted = performance.now();
        const advance = () => {
            if (mode === 'matching' && session.position < session.order.length && session.position % session.settings.level === 0) session.between = true;
            void renderCurrent();
        };
        if (mode === 'matching' && session.settings.sound) {
            // Keep this matched card visible until its entire word is heard.
            // The generation/phase guard prevents stale audio completion from
            // advancing a paused, replaced, or finished session.
            void playWord(target, false, true).then(() => {
                if (ticket === generation && phase === 'feedback') later(advance, Math.max(0, 600 - (performance.now() - feedbackStarted)));
            });
        } else later(advance, 600);
    }
    function attachDrag(card, ticket) {
        let origin = null, moved = false;
        card.addEventListener('pointerdown', event => {
            if (phase !== 'active' || !ready || event.button !== 0) return;
            event.preventDefault();
            origin = { x: event.clientX, y: event.clientY }; moved = false;
            card.setPointerCapture(event.pointerId); card.classList.add('dragging');
        });
        card.addEventListener('pointermove', event => {
            if (!origin) return;
            event.preventDefault();
            const x = event.clientX - origin.x, y = event.clientY - origin.y;
            moved ||= Math.hypot(x, y) > 8; card.style.transform = `translate(${x}px,${y}px)`;
        });
        const reset = () => { origin = null; card.style.transform = ''; card.classList.remove('dragging'); };
        card.addEventListener('pointercancel', reset);
        card.addEventListener('lostpointercapture', reset);
        card.addEventListener('pointerup', event => {
            if (!origin) return;
            const dragged = moved; reset();
            if (!dragged) return;
            const zone = all('#game-board > button').find(button => {
                const rect = button.getBoundingClientRect(); return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
            });
            if (zone) choose(zone.dataset.key, ticket);
        });
    }
    function updateMemory() {
        all('#game-board > button').forEach((button, index) => {
            const matched = session.matched.includes(session.deck[index].key), shown = (session.guide && !session.guide.done) || matched || session.open.includes(index);
            button.classList.toggle('matched', matched); button.classList.toggle('flipped', shown);
            button.querySelector('.memory-front').hidden = !shown; button.querySelector('.memory-back').hidden = shown;
            button.setAttribute('aria-label', shown ? `${byKey.get(session.deck[index].key).name}${matched ? '، تم التطابق' : ''}` : `بطاقة مخفية ${index + 1}`);
            button.setAttribute('aria-pressed', String(shown));
        });
        enableControls();
    }
    function flip(index, ticket) {
        if (ticket !== generation || phase !== 'active' || !ready || session.open.includes(index) || session.matched.includes(session.deck[index].key)) return;
        const item=byKey.get(session.deck[index].key);window.SessionHomework?.record({activity:'الذاكرة',key:item.key,label:item.name});
        session.open.push(index); lastKey = session.deck[index].key;
        if (session.open.length === 2) {
            session.moves++;
            const [first, second] = session.open.map(i => session.deck[i]);
            if (first.key === second.key) {
                session.matched.push(first.key); session.position++; session.records.push({ key: first.key, result: 'matched' }); session.open = [];
                feedback(`وجدت الزوج! ${byKey.get(first.key).name}`);
                if (session.position === session.order.length) {
                    phase = 'feedback';
                    const started = performance.now();
                    const playback = session.settings.sound ? playWord(first.key, false, true) : Promise.resolve();
                    void playback.then(() => {
                        if (ticket === generation && phase === 'feedback') later(() => finish(false), Math.max(0, 650 - (performance.now() - started)));
                    });
                } else if (session.settings.sound) void playWord(first.key);
            } else {
                for(const card of [first,second])window.SessionHomework?.record({activity:'لعبة الذاكرة',key:card.key,label:byKey.get(card.key).name,needsHelp:true});
                session.mistakes++; missed(first.key); missed(second.key); session.pendingMismatch = true; phase = 'feedback';
                feedback('صورتان مختلفتان. تذكّر مكانهما وحاول مجدداً.'); later(closeMismatch, 800);
            }
        } else feedback('اختر البطاقة الثانية.');
        if(document.documentElement.dataset.suiteInput!=='keyboard')document.activeElement?.blur();
        updateMemory(); updateStats(); save();
    }
    function closeMismatch() { session.open = []; session.pendingMismatch = false; phase = 'active'; updateMemory(); save(); }
    function startObservation(remaining) {
        session.rapidRemaining = remaining; deadline = performance.now() + remaining; gradeReady = remaining <= 0;
        $('#observation-progress').max = Math.max(1, session.settings.duration * 1000);
        const tick = () => {
            if (phase !== 'active' || gradeReady) return;
            session.rapidRemaining = Math.max(0, deadline - performance.now());
            $('#observation-progress').value = session.settings.duration * 1000 - session.rapidRemaining;
            if (!session.rapidRemaining) { gradeReady = true; $('#show-grading').hidden = true; feedback('سجّل الاستجابة عندما تكون مستعداً.'); enableControls(); }
            else later(tick, 80);
        };
        $('#show-grading').hidden = gradeReady; $('#observation-progress').value = gradeReady ? $('#observation-progress').max : session.settings.duration * 1000 - remaining;
        if (!gradeReady) tick(); else feedback('سجّل الاستجابة عندما تكون مستعداً.');
    }
    async function autoAdvance(ticket) {
        feedback('عرض تلقائي دون تقييم');
        if (session.settings.sound && !await playWord(session.order[session.position], false, true)) {
            if (ticket === generation) {
                session.autoPlay = false; save(); void renderCurrent();
            }
            return;
        }
        if (ticket !== generation || phase !== 'active' || !session.autoPlay) return;
        later(() => {
            session.records.push({ key: session.order[session.position], result: 'viewed' });
            session.position++; session.rapidRemaining = null; save(); void renderCurrent();
        }, (session.settings.duration || 2) * 1000);
    }
    function grade(result) {
        if (phase !== 'active' || !ready || !gradeReady || session.autoPlay || !['notMastered', 'learning', 'syllables', 'mastered'].includes(result)) return;
        stopBeats();
        const rating=['notMastered','learning','syllables','mastered'].indexOf(result);
        session.ratingHistory ||= {};
        (session.ratingHistory[session.order[session.position]] ||= []).push(rating);
        const key = session.order[session.position];
        phase = 'feedback';
        // Preserve prior attempts from a saved legacy trial without inflating mastery.
        if (activePlan && session.trialMistakes) result = 'learning';
        session.trialMistakes = 0;
        if(result==='syllables')result='learning';
        session.records.push({ key, result, productionRating:rating, ratingHistory:[...session.ratingHistory[key]] }); if (result !== 'mastered') missed(key);
        session.position++; session.rapidRemaining = null; feedback('تم تسجيل الاستجابة.'); enableControls(); save(); updateStats(); later(() => { void renderCurrent(); }, 250);
    }
    function skip() {
        if (phase !== 'active' || !['rapid', 'test'].includes(mode)) return;
        const key = session.order[session.position]; session.records.push({ key, result: 'skip' }); missed(key);
        session.position++; session.trialMistakes = 0; session.currentChoices = null; session.rapidRemaining = null; save(); void renderCurrent();
    }
    function pause() {
        if (!session || !['active', 'loading', 'feedback', 'between', 'guiding'].includes(phase)) return;
        if (mode === 'rapid' && deadline !== null && !gradeReady) session.rapidRemaining = Math.max(0, deadline - performance.now());
        clearWork(); phase = 'paused'; save();
        $('#pause-description').textContent = `حُفظ التقدم: ${session.position} من ${session.order.length}. المؤقت والصوت متوقفان حتى المتابعة.`; show('pause');
    }
    function finish(partial) {
        if (!session || session.finished) return;
        captureHomework();
        clearWork(); phase = 'results'; session.finished = true;
        const summary = M.summarize(session, partial); store(`${prefix}-last`, summary); store(`${prefix}-draft`, null);
        const domain = mode === 'rapid' ? 'expressive' : mode === 'test' ? 'receptive' : null;
        const difficulty = domain ? P.assessmentDifficulty(domain, session.settings, M.uniqueItems(session.pool.map(key => byKey.get(key))).length) : null;
        P.logSession({ id: session.sessionId || `${mode}-${session.created}`, started: session.created, source: mode, domain, difficulty, kind: mode === 'test' || (mode === 'rapid' && !session.autoPlay) ? 'assessment' : 'practice', partial,
            records: observedRecords().map(record => ({ key: record.key,
                correct: domain && !['viewed','skip'].includes(record.result) ? (mode === 'rapid' ? Number(record.result === 'mastered') : Number(record.result === 'correct' && record.attempts === 1)) : 0,
                total: domain && record.result !== 'viewed' ? 1 : 0,
                ...(record.ratingHistory ? { productionRating:record.productionRating, ratingHistory:record.ratingHistory } : {}) })) });
        if (mode === 'test' && !partial && !session.review) P.completeWordLevel(P.active()?.workspace?.wordLevel,
            session.records.map(record => ({ key: record.key, correct: record.result === 'correct' && record.attempts === 1 })), true);
        if (activePlan && !partial) {
            if (!session.review && domain) P.record(domain, session.records.filter(record => record.result !== 'viewed').map(record => ({ key: record.key, correct: mode === 'rapid' ? record.result === 'mastered' : record.result === 'correct' && record.attempts === 1 })), difficulty);
            P.advancePlan(activePlan.id, activePlan.position, domain ? { domain, records: session.records.filter(record => !['viewed', 'skip'].includes(record.result)).map(record => ({ key: record.key, correct: mode === 'rapid' ? record.result === 'mastered' : record.result === 'correct' && record.attempts === 1 })) } : null);
            show('play'); $('#game-board').replaceChildren(); $('#active-match').replaceChildren();
            location.replace(P.planURL()); return;
        }
        $('#results-title').textContent = partial ? 'نتيجة الجلسة الحالية' : session.review ? 'أحسنت! انتهت المراجعة' : 'أحسنت! انتهت الجلسة';
        $('#results-description').textContent = `${session.position} / ${session.order.length} ${mode === 'memory' ? 'أزواج' : 'كلمات'} · ${session.review ? 'جلسة مراجعة' : 'تدريب'}${partial ? ' · غير مكتملة' : ''}`;
        $('#result-metrics').replaceChildren();
        const percentage = summary.percentage === null ? '—' : `${summary.percentage}٪`;
        const metrics = mode === 'memory' ? [[percentage, 'أزواج صحيحة / محاولات'], [session.moves, 'محاولات'], [session.matched.length, 'أزواج مكتملة']]
            : mode === 'rapid' ? (summary.viewed && !summary.scored ? [[summary.viewed, 'بطاقات عُرضت دون تقييم'], [session.order.length, 'بطاقات الجلسة']]
                : [[percentage, 'أتقن من الكلمات المقيّمة'], [summary.mastered, 'أتقن'], [summary.learning, 'يتعلّم']])
                : [[percentage, 'صحيح من أول محاولة'], [session.firstCorrect, 'صحيح من أول محاولة'], [session.mistakes, 'اختيارات تحتاج تصحيحاً']];
        for (const [value, label] of metrics) { const box = document.createElement('div'), strong = document.createElement('strong'), span = document.createElement('span'); strong.textContent = value; span.textContent = label; box.append(strong, span); $('#result-metrics').append(box); }
        const seconds = Math.round(summary.elapsedMs / 1000);
        $('#result-details').textContent = `وقت اللعب: ${Math.floor(seconds / 60)} د و${seconds % 60} ث · كلمات للمراجعة: ${session.missed.length} · تم تجاوز: ${summary.skipped}${summary.viewed ? ` · عُرضت دون تقييم: ${summary.viewed}` : ''}. النتيجة للتدريب وليست تقييماً تشخيصياً.`;
        $('#review-missed').hidden = !session.missed.length || session.pool.length < meta.minimum;
        if (!partial && !session.review && ['rapid', 'test'].includes(mode)) {
            P.record(mode === 'rapid' ? 'expressive' : 'receptive', session.records.filter(record => record.result !== 'viewed').map(record => ({
                key: record.key, correct: mode === 'rapid' ? record.result === 'mastered' : record.result === 'correct' && record.attempts === 1
            })), difficulty);
        }
        if (activePlan && partial) stopPlan();
        show('results'); $('#results-title').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' });
    }

    if (mode === 'rapid') { $('#level-field').hidden = true; $('#duration-field').hidden = false; $('#show-labels').checked = false; }
    if (mode === 'memory') {
        $('#length-field').hidden = true; $('#level-title').textContent = 'عدد الأزواج';
        all('[data-level-unit]').forEach((label, index) => { label.textContent = ['أزواج · بداية سهلة', 'أزواج · تحدٍّ أكبر', 'أزواج · متقدم'][index]; });
    }
    if (mode === 'test') {
        $('#labels-field').hidden = true; $('#sound-field').hidden = true;
        // All three existing levels are also available to the automatic plan.
    }
    $('#settings-help').textContent = mode === 'rapid' ? 'الصوت نموذج للتعلّم ويمكن إيقافه. زر الأرنب في رأس الصفحة يعرض البطاقات تلقائياً دون تقييم؛ اضغطه مجدداً للعودة إلى التقييم اليدوي.'
        : mode === 'memory' ? 'ابدأ بزوجين، ثم زد العدد تدريجياً. الصور المخفية لا تظهر أسماؤها لقارئ الشاشة.'
            : mode === 'test' ? 'يجب تشغيل الكلمة قبل الإجابة. تُحتسب الدقة من أول اختيار، حتى لو نجح الطفل بعد المحاولة مجدداً.' : 'يمكن المطابقة باللمس أو بالسحب أو بلوحة المفاتيح. كل جلسة تنتهي بنتيجة واضحة.';
    const preferences = read(`${prefix}-preferences`);
    selected = new Set((Array.isArray(preferences?.selected) ? preferences.selected : bank.categories[0].items.slice(0, 6).map(item => item.key)).filter(key => byKey.has(key) && inLibrary(key)));
    if (preferences?.settings) {
        const p = preferences.settings;
        if ([2, 4, 6].includes(p.level)) pick('game-level', p.level);
        if ([6, 10, 20].includes(p.length)) pick('game-length', p.length);
        if ([0, 2, 4, 6].includes(p.duration)) pick('game-duration', p.duration);
        $('#show-labels').checked = p.labels === true; $('#sound-hint').checked = p.sound !== false;
        if (bank.categories.some(category => String(category.id) === preferences.category)) categoryId = preferences.category;
    }
    $('#category-rail').replaceChildren(...bank.categories.map(categoryTile)); renderCategoryGrid(); updateCategoryMarks();
    for (const control of all('.setting-choice input, #show-labels, #sound-hint')) control.addEventListener('change', () => { updatePreview(); selectionPreferences(); });
    $('#toggle-categories').addEventListener('click', () => toggleCategories($('#category-panel').hidden));
    $('#category-search').addEventListener('input', renderCategoryGrid);
    $('#word-search').addEventListener('input', () => { page = 0; refreshSelection(); });
    $('#select-category').addEventListener('click', () => {
        const visible = filteredItems(), clear = visible.every(item => selected.has(item.key));
        visible.forEach(item => clear ? selected.delete(item.key) : selected.add(item.key)); refreshSelection(); selectionPreferences();
    });
    $('#select-everything').addEventListener('click', () => { const available = items.filter(item => inLibrary(item)); selected = available.every(item => selected.has(item.key)) ? new Set() : new Set(available.map(item => item.key)); refreshSelection(); selectionPreferences(); });
    $('#rapid-autoplay').addEventListener('click', () => {
        if (mode !== 'rapid' || !session || !['active', 'loading', 'feedback'].includes(phase)) return;
        session.autoPlay = !session.autoPlay; session.rapidRemaining = null; save(); void renderCurrent();
    });
    $('#page-previous').addEventListener('click', () => { page--; refreshSelection(); });
    $('#page-next').addEventListener('click', () => { page++; refreshSelection(); });
    $('#start-game').addEventListener('click', () => begin());
    $('#resume-saved').addEventListener('click', () => { const draft = read(`${prefix}-draft`); if (validDraft(draft)) { session = draft; void launch(); } });
    $('#pause-game').addEventListener('click', pause);
    $('#continue-game').addEventListener('click', () => { void launch(); });
    $('#change-cards').addEventListener('click', () => { clearWork(); stopPlan(); phase = 'setup'; show('setup'); renderResume(); });
    $('#finish-game').addEventListener('click', () => finish(true)); $('#finish-paused').addEventListener('click', () => finish(true));
    $('#return-setup').addEventListener('click', () => { stopPlan(); refreshSelection(); phase = 'setup'; show('setup'); renderResume(); });
    $('#play-again').addEventListener('click', () => begin(session.pool.map(key => byKey.get(key))));
    $('#review-missed').addEventListener('click', () => {
        const keys = [...session.missed];
        // One missed target still needs a distinct supporting picture for a
        // matching/listening review. Do not make the review button disappear.
        for (const key of session.pool) { if (keys.length >= meta.minimum) break; if (!keys.includes(key)) keys.push(key); }
        begin(keys.map(key => byKey.get(key)), true);
    });
    $('#next-round').addEventListener('click', () => { session.between = false; void renderCurrent(); });
    $('#reload-media').addEventListener('click', () => { void renderCurrent(); });
    $('#play-word').addEventListener('click', () => { if (phase === 'guiding') { void runGuide(generation); return; } if (lastKey) void playWord(lastKey, mode === 'test'); });
    $('#show-grading').addEventListener('click', () => { gradeReady = true; session.rapidRemaining = 0; $('#observation-progress').value = $('#observation-progress').max; $('#show-grading').hidden = true; enableControls(); });
    for (const button of all('[data-grade]')) button.addEventListener('click', () => grade(button.dataset.grade));
    $('#skip-word').addEventListener('click', skip);
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
    window.addEventListener('pagehide', () => { pause(); stopAudio(); });
    document.addEventListener('keydown', event => {
        if(scoreHelpDialog?.open)return;
        if (event.key === 'Escape' && !$('#category-panel').hidden) { event.preventDefault(); toggleCategories(false); $('#toggle-categories').focus(); return; }
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
        if (event.key === 'Escape') { event.preventDefault(); pause(); }
        if (phase === 'active' && ['matching', 'test'].includes(mode) && /^[1-6]$/.test(event.key)) {
            const button = all('#game-board > button')[Number(event.key) - 1]; if (button && !button.disabled) { event.preventDefault(); button.click(); }
        }
    });
    const libraries = [];
    for (const [domain, label] of [['receptive', 'الكلمات المتقنة في الفهم'], ['expressive', 'الكلمات المتقنة في التعبير']]) {
        const library = document.createElement('button'); library.type = 'button'; library.className = 'game-button icon-button voc-book';
        library.id = `game-learned-library-${domain}`; library.dataset.learnedDomain = domain; library.hidden = P.isAdmin();
        library.setAttribute('aria-label', label); library.title = label; library.setAttribute('aria-pressed', 'false');
        library.innerHTML = domain === 'receptive' ? '<i class="fas fa-ear-listen" aria-hidden="true"></i>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12c3-1 5-5 7-3l2 1 2-1c2-2 4 2 7 3-3 6-15 6-18 0Z"/><path d="M3 12c6 2 12 2 18 0"/></svg>';
        (libraries.at(-1) || $('#word-bank-title')).after(library); libraries.push(library);
        library.addEventListener('click', () => {
            learnedDomain = learnedDomain === domain ? null : domain;
            libraries.forEach(control => control.setAttribute('aria-pressed', String(control.dataset.learnedDomain === learnedDomain)));
            selected.clear(); page = 0; refreshSelection(); selectionPreferences();
        });
    }
    const planBanner = document.createElement('div'); planBanner.className = 'voc-plan-banner'; planBanner.hidden = true;
    const planText = document.createElement('span'); planText.textContent = 'مسار الألعاب · نفس بطاقات مساحة العمل';
    const cancelPlan = document.createElement('button'); cancelPlan.className = 'game-button icon-button'; cancelPlan.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>'; cancelPlan.type = 'button';cancelPlan.setAttribute('aria-label','إيقاف المسار');cancelPlan.title='إيقاف المسار';
    cancelPlan.addEventListener('click', stopPlan);
    planBanner.append(planText, cancelPlan); $('#game-main').prepend(planBanner);
    window.addEventListener('voc-profile-open', pause);
    window.addEventListener('voc-profile-beforechange', () => { pause(); clearTimeout(advanceTimer); });
    refreshSelection(); renderResume();
    if (new URLSearchParams(location.search).has('plan') && P.currentRound()) {
        const round = P.currentRound();
        if (round.mode !== mode) { location.replace(P.planURL()); return; }
        const pool = round.keys.map(key => byKey.get(key));
        if (pool.some(item => !item)) { P.cancelPlan(); alert('إحدى البطاقات غير متاحة. اختر البطاقات مجدداً من مساحة العمل.'); return; }
        const plan = P.active().plan; activePlan = { id: plan.id, position: plan.position }; planBanner.hidden = true; document.body.classList.add('automatic-plan');
        selected = new Set(round.keys);
        const draft = read(`${prefix}-draft`);
        if (validDraft(draft) && draft.planId === plan.id && draft.planPosition === plan.position) { session = draft; phase = 'paused'; show('pause'); $('#pause-description').textContent = 'حُفظ المسار. اضغط المتابعة لإكماله.'; }
        else begin(pool, false, round);
    }
})();
