// Repetition, assessment, and touch-friendly missing-card activities.
let activity = null;
let activityRunToken = 0;
const activityTimers = new Map();
let gameDrag = null;
let suppressGameClick = false;
const ACTIVITY_NAMES = { repetition: 'مهام التكرار', test: 'اختبار الطفل', comprehension: 'اختبار الفهم', expressive: 'اختبار التعبير', game: 'لعبة البطاقة الناقصة' };
const activityRoot = () => document.getElementById('activityContent');
const htmlText = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const currentActivitySentence = () => activity.mode === 'repetition' ? activity.sentences[activity.index]
    : activity.mode === 'game' ? activity.round.sentence : activity.plan[activity.index].target;
const activityTrialCount = () => activity.mode === 'repetition' ? activity.sentences.length : activity.plan.length;

function activityDelay(ms) {
    return new Promise(resolve => {
        const timer = setTimeout(() => { activityTimers.delete(timer); resolve(true); }, ms);
        activityTimers.set(timer, resolve);
    });
}
function cleanupGameDrag() {
    gameDrag?.ghost?.remove();
    document.getElementById('gameMissingSlot')?.classList.remove('drop-ready');
    gameDrag = null;
}
function stopActivityPlayback() {
    activityRunToken++;
    for (const [timer, resolve] of activityTimers) { clearTimeout(timer); resolve(false); }
    activityTimers.clear();
    cleanupGameDrag();
    document.querySelectorAll('.expression-card-playing,.expression-frame-playing').forEach(node => {
        node.classList.remove('expression-card-playing', 'expression-frame-playing');
        node.setAttribute('aria-busy', 'false');
    });
    if (activity) { activity.autoplay = false; activity.busy = false; }
    activityRoot()?.setAttribute('aria-busy', 'false');
    document.querySelectorAll('[data-lock-playback]').forEach(button => { button.disabled = false; });
    stopAllPlayback();
}
function activityStatus(message) {
    const node = document.getElementById('activityStatus');
    if (node) node.textContent = message;
}
function setActivityBusy(busy) {
    activity.busy = busy;
    activityRoot().setAttribute('aria-busy', String(busy));
    document.querySelectorAll('[data-lock-playback]').forEach(button => { button.disabled = busy; });
}
function openActivitySetup(mode) {
    navigateTo('activity');
    activity = { mode, mount: 'setup', folder: null, subgroup: null, gameSubgroups: [], presentation: 'advanced', trialsPerSubgroup: 3, repeatCount: 1, index: 0, results: [], completed: new Set(), busy: false, autoplay: false };
    renderActivitySetup();
}
function chooseActivityMode(mode) { activity.mode = mode; renderActivitySetup(); }
function chooseActivityFolder(folder) { activity.folder = folder; activity.subgroup = null; activity.gameSubgroups = []; renderActivitySetup(); }
function chooseActivitySubgroup(subgroup) { activity.subgroup = subgroup; renderActivitySetup(); }
function chooseGameSubgroup(subgroup) {
    if (subgroup === null) activity.gameSubgroups = [];
    else {
        const selected = new Set(activity.gameSubgroups);
        if (selected.has(subgroup)) selected.delete(subgroup); else selected.add(subgroup);
        activity.gameSubgroups = [...selected].sort((a, b) => a - b);
    }
    renderActivitySetup();
}
function chooseTestPresentation(presentation) { activity.presentation = presentation; renderActivitySetup(); }
function chooseAssessmentTrials(count) {
    if (!Number.isInteger(count) || count < 3 || count > 10) return;
    activity.trialsPerSubgroup = count;
    renderActivitySetup();
}
function activityButton(label, action, selected = false, attrs = '') {
    return `<button class="activity-choice${selected ? ' selected' : ''}" onclick="${action}" aria-pressed="${selected}" ${attrs}>${label}</button>`;
}
function activityIconButton(id, label, icon, action, primary = false, attrs = '') {
    const paths = {
        previous: 'M9 5l7 7-7 7',
        next: 'M15 5l-7 7 7 7',
        play: 'M8 5v14l11-7z',
        pause: 'M8 5v14M16 5v14',
        automatic: 'M20 7a9 9 0 00-15-1L2 9m0-6v6h6M4 17a9 9 0 0015 1l3-3m0 6v-6h-6M10 9l5 3-5 3z',
        listen: 'M11 5L6 9H3v6h3l5 4zM15 8a6 6 0 010 8M18 5a10 10 0 010 14',
        hint: 'M9 18h6M9 21h6M8 14a6 6 0 118 0c-1 1-1 2-1 4H9c0-2 0-3-1-4z',
        restart: 'M3 11a9 9 0 119 10M3 4v7h7',
        home: 'M3 11l9-8 9 8M5 10v11h5v-7h4v7h5V10',
        settings: 'M4 7h7m4 0h5M4 17h3m4 0h9M11 4v6M7 14v6'
    };
    return `<button${id ? ` id="${id}"` : ''} class="${primary ? 'activity-primary' : 'activity-secondary'} activity-icon-button" onclick="${action}" aria-label="${htmlText(label)}" title="${htmlText(label)}" ${attrs}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[icon]}"${icon === 'play' ? ' fill="currentColor" stroke="none"' : ''}/></svg></button>`;
}
function clearComprehensionHeader() {
    document.querySelector('.app-header').classList.remove('comprehension-header-active');
    const header = document.getElementById('comprehensionHeader');
    header.classList.add('hidden');
    header.innerHTML = '';
}
function renderActivitySetup() {
    clearComprehensionHeader();
    const a = activity;
    document.getElementById('activityView').classList.remove('comprehension-session', 'fixed-session', 'game-session', 'expressive-session');
    activityRoot().classList.toggle('activity-centered', a.mode === 'test');
    if (a.mode === 'test') {
        activityRoot().innerHTML = `<div class="activity-top"><h2 id="activityHeading">اختبار الطفل</h2></div>
            <div class="test-mode-picker"><p class="activity-intro">اختر نوع الاختبار</p><div class="test-mode-grid">
            <button id="chooseComprehension" class="home-menu-card home-test" onclick="chooseActivityMode('comprehension')"><span class="home-menu-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 5-5 4-5 8a3 3 0 0 1-6 0M10 9a2 2 0 0 1 4 0c0 2-3 2-3 4"/></svg></span><strong>الفهم</strong><span>استمع واختر الجملة المناسبة من أربع صور</span></button>
            <button id="chooseExpressive" class="home-menu-card home-tasks" onclick="chooseActivityMode('expressive')"><span class="home-menu-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12c3-1 5-5 7-3l2 1 2-1c2-2 4 2 7 3-3 2-5 6-9 6s-6-4-9-6Zm0 0h18"/></svg></span><strong>التعبير</strong><span>صف الصورة وحدّد الكلمات التي قالها الطفل</span></button></div></div>`;
        return;
    }
    const cat = ADVANCED_CATEGORIES.find(category => Number(category.folder) === a.folder);
    const assessment = a.mode === 'comprehension' || a.mode === 'expressive';
    const ready = a.folder && (a.mode !== 'repetition' || a.subgroup);
    activityRoot().innerHTML = `<div class="activity-top"><h2 id="activityHeading">${ACTIVITY_NAMES[a.mode]}</h2></div>
        <section class="activity-field"><h3>اختر طول الجملة</h3><div class="word-count-options">${[2, 3, 4, 5, 6].map(folder => activityButton(`${folder}<span> كلمات</span>`, `chooseActivityFolder(${folder})`, folder === a.folder, `data-folder="${folder}"`)).join('')}</div></section>
        ${(a.mode === 'repetition' || assessment) && cat ? `<section class="activity-field"><h3>اختر المجموعة الفرعية</h3><div class="subgroup-options">${assessment ? activityButton('كل المجموعات', 'chooseActivitySubgroup(null)', a.subgroup === null, 'data-subgroup="all"') : ''}${cat.subcategories.map(sub => activityButton(`${sub.id}. ${htmlText(sub.name)}`, `chooseActivitySubgroup(${sub.id})`, sub.id === a.subgroup, `data-subgroup="${sub.id}"`)).join('')}</div></section>` : ''}
        ${a.mode === 'game' && cat ? `<section class="activity-field"><h3>اختر كل المجموعة أو مجموعات فرعية متعددة</h3><div class="subgroup-options">${activityButton('كل المجموعات', 'chooseGameSubgroup(null)', !a.gameSubgroups.length, 'data-game-subgroup="all"')}${cat.subcategories.map(sub => activityButton(`${sub.id}. ${htmlText(sub.name)}`, `chooseGameSubgroup(${sub.id})`, a.gameSubgroups.includes(sub.id), `data-game-subgroup="${sub.id}"`)).join('')}</div></section>` : ''}
        ${assessment && a.folder ? `<section class="activity-field"><h3>كيف تريد عرض الخيارات؟</h3><div class="presentation-options">${activityButton('الصور المتكاملة', "chooseTestPresentation('advanced')", a.presentation === 'advanced', 'data-presentation="advanced"')}${activityButton('بطاقات الكلمات', "chooseTestPresentation('slots')", a.presentation === 'slots', 'data-presentation="slots"')}</div></section>` : ''}
        ${assessment && a.folder ? `<section class="activity-field"><h3 id="assessmentTrialsHeading">عدد المحاولات لكل مجموعة فرعية</h3><div class="assessment-trial-options" role="group" aria-labelledby="assessmentTrialsHeading">${[3, 4, 5, 6, 7, 8, 9, 10].map(count => activityButton(count, `chooseAssessmentTrials(${count})`, a.trialsPerSubgroup === count, `data-trial-count="${count}"`)).join('')}</div></section>` : ''}
        ${assessment ? `<p class="activity-intro" id="assessmentTrialInfo">${a.trialsPerSubgroup} محاولات عشوائية ${a.subgroup ? 'من المجموعة الفرعية المختارة' : `لكل مجموعة فرعية · 8 مجموعات · ${a.trialsPerSubgroup * 8} محاولة`}</p>` : ''}
        ${a.mode === 'game' ? '<p class="activity-intro">اختر البطاقة، واسحبها إلى الخانة الناقصة. يمكنك أيضاً اختيارها باللمس ثم لمس الخانة.</p>' : ''}
        <div class="activity-controls"><button id="startActivityBtn" class="activity-primary" onclick="startActivity()" ${ready ? '' : 'disabled'}>ابدأ</button></div>`;
}
function startActivity() {
    if (!activity.folder || (activity.mode === 'repetition' && !activity.subgroup)) return;
    stopActivityPlayback();
    Object.assign(activity, { mount: 'session', index: 0, results: [], completed: new Set(), phase: 'ready', testStartedAt: new Date(), progressLogged: false });
    if (activity.mode === 'repetition') activity.sentences = SENBActivities.sentences(activity.folder, activity.subgroup);
    else if (activity.mode === 'game') {
        activity.bag = SENBActivities.gameBag(activity.folder, Math.random, activity.gameSubgroups);
        activity.round = SENBActivities.gameRound(activity.bag[0]);
    } else {
        activity.plan = SENBActivities.testPlan(activity.folder, activity.presentation, Math.random, activity.subgroup, activity.trialsPerSubgroup);
        activity.wordMarks = Array(activity.folder).fill(false);
    }
    renderActivity();
    if (activity.mode === 'comprehension') playTestPrompt();
}
function progressHTML() {
    const completed = activity.mode === 'repetition' ? activity.completed : new Set(activity.results.map((_, index) => index));
    const total = activityTrialCount();
    return `<div id="activityStars" class="activity-stars" style="--star-count:${Math.min(total, 24)}" role="img" aria-label="تم إكمال ${completed.size} من ${total} جملة">${Array.from({ length: total }, (_, index) => `<span class="activity-star${completed.has(index) ? ' lit' : ''}${index === activity.index ? ' current' : ''}" aria-hidden="true">★</span>`).join('')}</div>`;
}
function refreshProgress() {
    const stars = document.getElementById('activityStars');
    if (stars) stars.outerHTML = progressHTML();
}
function sentenceImageHTML(sentence, action, showTitle = true) {
    return `<div class="activity-feature"><button id="activityAdvancedCard" class="activity-image-card" onclick="${action}" aria-label="استماع إلى الجملة"><img src="${sentence.imgPath}" alt="صورة الجملة" decoding="async" onerror="this.onerror=null;this.src='assets/image-fallback.svg'"></button>${showTitle ? `<p class="activity-sentence-title">${htmlText(sentence.title)}</p>` : ''}</div>`;
}
function slotHTML(sentence, slot, index, action = '', caption = true) {
    const title = SENBActivities.slotTitle(sentence, slot, index);
    return `<div class="activity-slot-wrap"><button class="activity-slot" ${action ? `onclick="${action}"` : ''} aria-label="${htmlText(title)}"><img src="${SENBActivities.imagePath(slot)}" alt="${htmlText(title)}" decoding="async" onerror="this.onerror=null;this.src='assets/image-fallback.svg'"></button>${caption ? `<span class="activity-slot-title">${htmlText(title)}</span><span class="activity-slot-dot" style="background:${getSlotColorConfig(index, sentence.slots.length)}" aria-hidden="true"></span>` : ''}</div>`;
}
function renderActivity() {
    const sentence = currentActivitySentence();
    if(activity.mode!=='comprehension')window.SessionHomework?.record({activity:ACTIVITY_NAMES[activity.mode],label:sentence.title,entity:'sentence'});
    const group = ADVANCED_CATEGORIES.find(cat => Number(cat.folder) === activity.folder).subcategories.find(sub => String(sub.id) === sentence.subCatId);
    activityRoot().classList.remove('activity-centered');
    document.getElementById('activityView').classList.toggle('comprehension-session', activity.mode === 'comprehension');
    const view = document.getElementById('activityView');
    view.classList.toggle('fixed-session', activity.mode === 'game' || activity.mode === 'expressive');
    view.classList.toggle('game-session', activity.mode === 'game');
    view.classList.toggle('expressive-session', activity.mode === 'expressive');
    view.dataset.testPresentation = activity.presentation;
    const title = `<div class="activity-title"><h2 id="activityHeading">${ACTIVITY_NAMES[activity.mode]}</h2><p>${activity.folder} كلمات · ${htmlText(group.name)}</p></div>`;
    const settings = activityIconButton('activitySetupBtn', 'تغيير الاختيار', 'settings', 'returnToActivitySetup()');
    const progress = `<div class="activity-progress-label">${activity.mode === 'game' ? `الجولة ${activity.index + 1}` : `${activity.mode === 'repetition' ? 'الجملة' : 'المحاولة'} ${activity.index + 1} / ${activityTrialCount()}${activity.mode !== 'repetition' ? ` · المجموعة ${sentence.subCatId}${activity.subgroup ? '' : ' / 8'}` : ''}`}</div>${activity.mode === 'game' ? '' : progressHTML()}`;
    clearComprehensionHeader();
    if (activity.mode === 'comprehension') {
        const header = document.getElementById('comprehensionHeader');
        header.innerHTML = `${title}<div class="comprehension-header-progress">${progress}</div><div class="comprehension-header-controls">${activityIconButton('testListenBtn', 'استمع إلى الجملة', 'listen', 'playTestPrompt()', true)}${settings}</div>`;
        header.classList.remove('hidden');
        document.querySelector('.app-header').classList.add('comprehension-header-active');
    }
    activityRoot().innerHTML = `${activity.mode === 'comprehension' ? '' : `<div class="activity-top">${title}${settings}</div>${progress}`}
        <div id="activityStage"></div><p id="activityStatus" class="activity-status" role="status" aria-live="polite"></p>`;
    const stage = document.getElementById('activityStage');
    if (activity.mode === 'repetition') renderRepetition(stage, sentence);
    else if (activity.mode === 'comprehension') renderComprehension(stage);
    else if (activity.mode === 'expressive') renderExpressive(stage, sentence);
    else renderGame(stage, sentence);
    setActivityBusy(activity.busy);
}
function returnToActivitySetup() {
    stopActivityPlayback();
    activity.mount = 'setup';
    renderActivitySetup();
}
async function playActivitySegments(segments, token) {
    for (const segment of segments) {
        if (token !== activityRunToken || state.currentView !== 'activity') return false;
        const playback = playAudioFilePath(segment.path, segment.text);
        const requestId = playbackRequestId;
        if (!await playback || token !== activityRunToken || requestId !== playbackRequestId) return false;
    }
    return true;
}
async function playActivitySentence() {
    stopActivityPlayback();
    const token = activityRunToken;
    await playActivitySegments([{ path: currentActivitySentence().soundPath, text: currentActivitySentence().title }], token);
    if (activity.mode === 'repetition') renderRepetitionControls();
}
async function playActivitySlot(index, candidate = null) {
    if (activity.mode === 'expressive' && activity.presentation === 'slots') return playExpressiveCards(index);
    stopActivityPlayback();
    const sentence = currentActivitySentence();
    await playActivitySegments(SENBActivities.slotSegments(sentence, candidate || sentence.slots[index], index), activityRunToken);
    if (activity.mode === 'repetition') renderRepetitionControls();
}
async function playExpressiveWordFrame() { return playExpressiveCards(); }
async function playExpressiveCards(onlyIndex) {
    stopActivityPlayback();
    const token = activityRunToken, sentence = currentActivitySentence();
    const frame = document.querySelector('.expressive-word-cards');
    if (!frame) return;
    const cards = [...frame.querySelectorAll('.activity-slot')];
    const indices = onlyIndex === undefined ? sentence.slots.map((_, index) => index) : [onlyIndex];
    activityStatus('');
    frame.classList.add('expression-frame-playing'); frame.setAttribute('aria-busy', 'true');
    try {
        // DOM order is the sentence's reading order; the frame lays it out in RTL.
        for (const index of indices) {
            if (token !== activityRunToken) return;
            const card = cards[index];
            card.classList.add('expression-card-playing'); card.setAttribute('aria-busy', 'true');
            const played = await playActivitySegments(SENBActivities.slotSegments(sentence, sentence.slots[index], index), token);
            if (token !== activityRunToken) return;
            card.classList.remove('expression-card-playing'); card.setAttribute('aria-busy', 'false');
            if (!played) { activityStatus('تعذّر تشغيل الصوت. اضغط على البطاقة للمحاولة مجدداً.'); return; }
        }
    } finally {
        if (token === activityRunToken) {
            frame.classList.remove('expression-frame-playing'); frame.setAttribute('aria-busy', 'false');
            cards.forEach(card => { card.classList.remove('expression-card-playing'); card.setAttribute('aria-busy', 'false'); });
        }
    }
}
function renderRepetition(stage, sentence) {
    stage.innerHTML = `${sentenceImageHTML(sentence, 'playActivitySentence()')}<div class="activity-slots" style="--slot-count:${sentence.slots.length}">${sentence.slots.map((slot, index) => slotHTML(sentence, slot, index, `playActivitySlot(${index})`)).join('')}</div>
        <div id="repetitionControls"></div>`;
    renderRepetitionControls();
}
function setRepetitionCount(count) {
    if (![1, 2, 3, 4, 5].includes(count)) return;
    activity.repeatCount = count;
    renderRepetitionControls();
}
function renderRepetitionControls() {
    const node = document.getElementById('repetitionControls');
    if (!node) return;
    node.innerHTML = `<div class="repetition-counts" role="group" aria-label="عدد مرات تكرار الجملة">${[1, 2, 3, 4, 5].map(value => activityButton(value, `setRepetitionCount(${value})`, activity.repeatCount === value, `data-repeat-count="${value}" aria-label="تكرار الجملة ${value} مرات"`)).join('')}</div>
        <div class="activity-controls">${activityIconButton('repeatPreviousBtn', 'السابق', 'previous', 'moveRepetition(-1)', false, activity.index === 0 ? 'disabled' : '')}
        ${activityIconButton('repeatPlayBtn', 'تشغيل الجملة والبطاقات', 'play', 'playRepetition(false)', true, `data-lock-playback ${activity.busy ? 'disabled' : ''}`)}
        ${activityIconButton('repeatNextBtn', 'التالي', 'next', 'moveRepetition(1)', false, activity.index === 23 ? 'disabled' : '')}
        ${activityIconButton('repeatAutoBtn', activity.autoplay ? 'إيقاف التتابع' : 'تشغيل تلقائي', activity.autoplay ? 'pause' : 'automatic', activity.autoplay ? 'pauseRepetition()' : 'playRepetition(true)')}</div>`;
}
function pauseRepetition() { stopActivityPlayback(); renderRepetitionControls(); activityStatus('تم الإيقاف.'); }
function moveRepetition(direction) {
    stopActivityPlayback();
    activity.index = Math.max(0, Math.min(23, activity.index + direction));
    renderActivity();
}
async function playRepetition(automatic) {
    stopActivityPlayback();
    const token = activityRunToken;
    activity.autoplay = automatic;
    setActivityBusy(true);
    renderRepetitionControls();
    while (token === activityRunToken) {
        const sentence = currentActivitySentence();
        const repeats = activity.repeatCount;
        for (let repeat = 0; repeat < repeats; repeat++) {
            activityStatus('');
            if (!await playActivitySegments([{ path: sentence.soundPath, text: sentence.title }], token)) return finishRepetitionRun(token);
            for (let index = 0; index < sentence.slots.length; index++) {
                const card = document.querySelectorAll('#activityStage .activity-slot')[index];
                card?.classList.add('playing-ring');
                const complete = await playActivitySegments(SENBActivities.slotSegments(sentence, sentence.slots[index], index), token);
                card?.classList.remove('playing-ring');
                if (!complete) return finishRepetitionRun(token);
            }
            if (repeat + 1 < repeats && !await activityDelay(250)) return;
        }
        if (token !== activityRunToken) return;
        activity.completed.add(activity.index);
        refreshProgress();
        if (!automatic || activity.index === 23) return finishRepetitionRun(token, activity.completed.size === 24 ? 'أكملت الجمل الأربع والعشرين! ★' : 'تم إكمال الجملة.');
        if (!await activityDelay(500) || token !== activityRunToken) return;
        activity.index++;
        renderActivity();
        renderRepetitionControls();
    }
}
function finishRepetitionRun(token, message = 'اضغط على التشغيل للمحاولة مجدداً.') {
    if (token !== activityRunToken) return;
    activity.autoplay = false;
    setActivityBusy(false);
    renderRepetitionControls();
    activityStatus(message);
}
function renderComprehension(stage) {
    activity.phase = 'listening';
    stage.innerHTML = `<div class="comprehension-grid">${activity.plan[activity.index].choices.map((sentence, index) => `<button class="comprehension-option" data-choice="${index}" onclick="answerComprehension(${index})" aria-label="الخيار ${index + 1}" disabled>${activity.presentation === 'advanced' ? `<img src="${sentence.imgPath}" alt="الخيار ${index + 1}" onerror="this.onerror=null;this.src='assets/image-fallback.svg'">` : `<span class="comprehension-slots" style="--slot-count:${sentence.slots.length}">${sentence.slots.map(slot => `<img src="${SENBActivities.imagePath(slot)}" alt="بطاقة الخيار ${index + 1}" onerror="this.onerror=null;this.src='assets/image-fallback.svg'">`).join('')}</span>`}</button>`).join('')}</div>`;
    activityStatus('استمع، ثم المس الجملة المناسبة.');
}
async function playTestPrompt() {
    if (activity.phase === 'recorded' || activity.mount !== 'session') return;
    stopActivityPlayback();
    const token = activityRunToken;
    activity.phase = 'listening';
    document.querySelectorAll('.comprehension-option').forEach(button => { button.disabled = true; });
    const sentence = currentActivitySentence();
    const played = await playActivitySegments([{ path: sentence.soundPath, text: sentence.title }], token);
    if (token !== activityRunToken) return;
    activity.phase = 'answer';
    document.querySelectorAll('.comprehension-option').forEach(button => { button.disabled = false; });
    activityStatus(played ? 'المس الصورة المناسبة.' : 'يمكنك إعادة الاستماع إلى الجملة.');
}
async function answerComprehension(index) {
    if (activity.phase !== 'answer') return;
    const trial = activity.plan[activity.index];
    activity.phase = 'recorded';
    activity.results.push({ subgroup: trial.target.subCatId, item: trial.target.itemNum, chosen: SENBActivities.key(trial.choices[index]), correct: SENBActivities.key(trial.choices[index]) === SENBActivities.key(trial.target) });
    window.SessionHomework?.record({activity:'اختبار فهم الجمل',label:trial.target.title,entity:'sentence',kind:'assessment',domain:'receptive',correct:Number(activity.results.at(-1).correct),total:1});
    document.querySelectorAll('.comprehension-option').forEach(button => { button.disabled = true; });
    document.querySelector(`[data-choice="${index}"]`).classList.add('answered');
    refreshProgress();
    activityStatus('تم تسجيل الإجابة.');
    const token = activityRunToken;
    if (!await activityDelay(400) || token !== activityRunToken) return;
    if (++activity.index === activity.plan.length) return renderActivitySummary();
    renderActivity();
    playTestPrompt();
}
function renderExpressive(stage, sentence) {
    const display = activity.presentation === 'slots'
        ? `<div class="activity-slots expressive-word-cards" role="group" tabindex="0" aria-label="استمع إلى كلمات الجملة من اليمين إلى اليسار" onclick="playExpressiveWordFrame()" onkeydown="if(event.target===this &amp;&amp; (event.key==='Enter' || event.key===' ')){event.preventDefault();playExpressiveWordFrame();}" style="--slot-count:${sentence.slots.length}">${sentence.slots.map((slot, index) => slotHTML(sentence, slot, index, `event.stopPropagation();playActivitySlot(${index})`, false)).join('')}</div>`
        : sentenceImageHTML(sentence, 'playActivitySentence()');
    stage.innerHTML = `${display}<p class="activity-intro">المس دائرة لكل كلمة قالها الطفل.</p>
        <div class="word-score-row">${activity.wordMarks.map((marked, index) => `<button class="word-score-dot${marked ? ' marked' : ''}" style="--word-color:${getSlotColorConfig(index, activity.folder)}" aria-label="الكلمة ${index + 1}" aria-pressed="${marked}" onclick="toggleExpressiveWord(${index},this)">${index + 1}</button>`).join('')}</div>
        <div class="activity-controls">${activityIconButton('expressiveNextBtn', activity.index === activity.plan.length - 1 ? 'عرض النتيجة' : 'التالي', 'next', 'nextExpressiveTrial()', true)}</div>`;
}
function toggleExpressiveWord(index, button) {
    activity.wordMarks[index] = !activity.wordMarks[index];
    button.classList.toggle('marked', activity.wordMarks[index]);
    button.setAttribute('aria-pressed', String(activity.wordMarks[index]));
}
function nextExpressiveTrial() {
    const sentence = currentActivitySentence();
    activity.results.push({ subgroup: sentence.subCatId, item: sentence.itemNum, words: activity.wordMarks.filter(Boolean).length, total: activity.folder, marks: [...activity.wordMarks] });
    window.SessionHomework?.record({activity:'اختبار التعبير بالجمل',label:sentence.title,entity:'sentence',kind:'assessment',domain:'expressive',correct:activity.wordMarks.filter(Boolean).length,total:activity.wordMarks.length});
    stopActivityPlayback();
    if (++activity.index === activity.plan.length) return renderActivitySummary();
    activity.wordMarks = Array(activity.folder).fill(false);
    renderActivity();
}
function renderActivitySummary() {
    stopActivityPlayback();
    clearComprehensionHeader();
    document.getElementById('activityView').classList.remove('comprehension-session', 'fixed-session', 'game-session', 'expressive-session');
    activity.mount = 'summary';
    logCompletedAssessment();
    const expressive = activity.mode === 'expressive';
    const summary = SENBActivities.assessmentSummary(activity.results, expressive, activity.folder);
    activity.reportDate = activity.testStartedAt;
    activityRoot().classList.add('activity-centered');
    activityRoot().innerHTML = `<div class="activity-summary"><h2 id="activityHeading">${expressive ? 'متوسط طول الملفوظ بالكلمات (MLU)' : 'نسبة الإنجاز في الفهم'}</h2><p class="activity-intro">${activity.folder} كلمات · ${activity.subgroup ? `المجموعة الفرعية ${activity.subgroup}` : 'كل المجموعات'}</p><p class="activity-report-meta">تاريخ الاختبار: ${htmlText(SENBReport.formatDate(activity.reportDate))}</p><p class="activity-report-meta" dir="ltr">${SENBReport.clinicianName}</p><div class="activity-result-total" dir="ltr">${expressive ? summary.mlu : `${summary.percentage}%`}</div>
        ${expressive ? '<p class="activity-intro">MLU بالكلمات = مجموع الكلمات المحددة ÷ عدد المحاولات المكتملة</p>' : ''}
        <div class="activity-report-table"><table><caption>نتائج المجموعات الفرعية</caption><thead><tr><th scope="col">المجموعة الفرعية</th><th scope="col">${expressive ? 'MLU بالكلمات' : 'الإجابات الصحيحة'}</th><th scope="col">${expressive ? 'المحاولات' : 'النسبة'}</th></tr></thead><tbody>${summary.groups.map(group => `<tr data-result-subgroup="${group.id}"><th scope="row">${group.id}. ${htmlText(group.name)}</th><td dir="ltr">${expressive ? group.mlu : `${group.earned} / ${group.possible}`}</td><td dir="ltr">${expressive ? group.trials : `${group.percentage}%`}</td></tr>`).join('')}</tbody></table></div>
        <div class="activity-controls"><button id="downloadActivityResultsBtn" class="activity-primary" onclick="downloadActivityResults()">تنزيل التقرير PDF</button>${activityIconButton('testRestartBtn', 'اختبار جديد', 'restart', 'returnToActivitySetup()', true)}${activityIconButton('testHomeBtn', 'الرئيسية', 'home', "navigateTo('home')")}</div><p id="reportStatus" class="activity-status" role="status"></p></div>`;
}
function logCompletedAssessment() {
    if (!window.SenbProgress || activity.progressLogged || !['comprehension', 'expressive'].includes(activity.mode) || activity.results.length !== activity.plan.length) return;
    const domain = activity.mode === 'expressive' ? 'expressive' : 'receptive';
    const records = new Map();
    const add = (key, title, entity, correct, total) => {
        if (!records.has(key)) records.set(key, { key, title, entity, domain, presentation: activity.presentation, correct: 0, total: 0 });
        const record = records.get(key);
        record.correct += correct;
        record.total += total;
    };
    activity.results.forEach(result => {
        const sentence = getAdvancedItemData(activity.folder, result.subgroup, result.item);
        add(`s:${sentence.folder}/${sentence.subCatId}/${sentence.itemNum}`, sentence.title, 'sentence', domain === 'expressive' ? result.words : Number(result.correct), domain === 'expressive' ? sentence.slots.length : 1);
        // Only expressive word marks isolate a specific word; choosing a whole sentence does not.
        if (domain === 'expressive') sentence.slots.forEach((slot, index) => {
            const item = SENBActivities.normalizeSlot(slot);
            add(`w:${item.categoryId}/${item.id}`, SENBActivities.slotTitle(sentence, slot, index), 'word', Number(Boolean(result.marks?.[index])), 1);
        });
    });
    SenbProgress.logSession({ id: `senb-assessment-${activity.testStartedAt.getTime()}-${Math.random().toString(36).slice(2)}`, kind: 'assessment', startedAt: activity.testStartedAt.toISOString(), endedAt: new Date().toISOString(), partial: false, records: [...records.values()] });
    activity.progressLogged = true;
}
function renderGame(stage, sentence) {
    const round = activity.round;
    stage.innerHTML = `${sentenceImageHTML(sentence, 'playActivitySentence()')}<div class="activity-slots game-slots" style="--slot-count:${sentence.slots.length}">${sentence.slots.map((slot, index) => index === round.missingIndex && !round.solved
        ? `<div class="activity-slot-wrap"><button id="gameMissingSlot" class="activity-slot game-missing" onclick="placeSelectedGameCard()" aria-label="الخانة الناقصة">؟</button><span class="activity-slot-title">البطاقة الناقصة</span></div>`
        : slotHTML(sentence, slot, index, `playActivitySlot(${index})`)).join('')}</div>
        <p class="activity-intro">المس البطاقة للاستماع، ثم اسحبها إلى الخانة الناقصة.</p>
        <div class="game-choices">${round.choices.map((slot, index) => `<button class="game-choice${round.selected === index ? ' selected' : ''}" data-game-choice="${index}" onclick="selectGameCard(${index})" aria-label="${htmlText(SENBActivities.slotTitle(sentence, slot, round.missingIndex))}"><img src="${SENBActivities.imagePath(slot)}" alt="${htmlText(SENBActivities.slotTitle(sentence, slot, round.missingIndex))}" draggable="false" onerror="this.onerror=null;this.src='assets/image-fallback.svg'"><span>${htmlText(SENBActivities.slotTitle(sentence, slot, round.missingIndex))}</span></button>`).join('')}</div>
        <div class="activity-controls">${activityIconButton('gameHintBtn', 'تلميح: استمع إلى البطاقة الناقصة', 'hint', 'playGameHint()')}${activityIconButton('gameNextBtn', 'الجولة التالية', 'next', 'nextGameRound()', true, round.solved ? '' : 'disabled')}</div>`;
    document.querySelectorAll('.game-choice').forEach(button => {
        button.addEventListener('pointerdown', startGameDrag);
        button.addEventListener('pointermove', moveGameDrag);
        button.addEventListener('pointerup', endGameDrag);
        button.addEventListener('pointercancel', cleanupGameDrag);
        button.addEventListener('lostpointercapture', cleanupGameDrag);
    });
}
function selectGameCard(index) {
    if (suppressGameClick) return;
    activity.round.selected = index;
    document.querySelectorAll('.game-choice').forEach(button => button.classList.toggle('selected', Number(button.dataset.gameChoice) === index));
    playActivitySlot(activity.round.missingIndex, activity.round.choices[index]);
}
function placeSelectedGameCard() {
    if (activity.round.selected === null) return activityStatus('اختر بطاقة أولاً ثم المس الخانة الناقصة.');
    attemptGameChoice(activity.round.selected);
}
function attemptGameChoice(index) {
    const round = activity.round;
    if (round.solved) return;
    round.attempts++;
    const correct = SENBActivities.imagePath(round.choices[index]) === SENBActivities.imagePath(round.sentence.slots[round.missingIndex]);
    window.SessionHomework?.record({activity:'لعبة البطاقة الناقصة',label:round.sentence.title,entity:'sentence',needsHelp:!correct});
    if (correct) {
        round.solved = true;
        renderActivity();
        activityStatus('أحسنت! اكتملت الجملة ★');
        playActivitySlot(round.missingIndex);
    } else {
        activityStatus('حاول مرة أخرى، أو استمع إلى التلميح.');
        document.querySelector(`[data-game-choice="${index}"]`).classList.add('incorrect');
        playActivitySlot(round.missingIndex, round.choices[index]);
    }
}
function playGameHint() {
    activity.round.hintUsed = true;
    playActivitySlot(activity.round.missingIndex);
}
function nextGameRound() {
    if (!activity.round.solved) return;
    activity.results.push({ sentence: SENBActivities.key(activity.round.sentence), attempts: activity.round.attempts, hintUsed: activity.round.hintUsed });
    stopActivityPlayback();
    activity.index++;
    if (activity.index === activity.bag.length) { activity.bag = SENBActivities.gameBag(activity.folder, Math.random, activity.gameSubgroups); activity.index = 0; }
    activity.round = SENBActivities.gameRound(activity.bag[activity.index]);
    renderActivity();
}
function startGameDrag(event) {
    if (event.button !== 0 || !event.isPrimary || activity.round.solved) return;
    const button = event.currentTarget;
    gameDrag = { pointer: event.pointerId, index: Number(button.dataset.gameChoice), x: event.clientX, y: event.clientY, button, moved: false };
    button.setPointerCapture(event.pointerId);
}
function moveGameDrag(event) {
    if (!gameDrag || gameDrag.pointer !== event.pointerId) return;
    if (!gameDrag.moved && Math.hypot(event.clientX - gameDrag.x, event.clientY - gameDrag.y) < 8) return;
    event.preventDefault();
    if (!gameDrag.moved) {
        gameDrag.moved = true;
        gameDrag.ghost = gameDrag.button.cloneNode(true);
        gameDrag.ghost.className = 'game-drag-ghost';
        gameDrag.ghost.setAttribute('aria-hidden', 'true');
        document.body.appendChild(gameDrag.ghost);
    }
    gameDrag.ghost.style.left = `${event.clientX}px`;
    gameDrag.ghost.style.top = `${event.clientY}px`;
    const target = document.getElementById('gameMissingSlot');
    const box = target?.getBoundingClientRect();
    target?.classList.toggle('drop-ready', Boolean(box && event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom));
}
function endGameDrag(event) {
    if (!gameDrag || gameDrag.pointer !== event.pointerId) return;
    const drag = gameDrag;
    const box = document.getElementById('gameMissingSlot')?.getBoundingClientRect();
    const dropped = drag.moved && box && event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    cleanupGameDrag();
    if (drag.button.hasPointerCapture(event.pointerId)) drag.button.releasePointerCapture(event.pointerId);
    if (drag.moved) {
        suppressGameClick = true;
        setTimeout(() => { suppressGameClick = false; }, 0);
        if (dropped) attemptGameChoice(drag.index);
    }
}
