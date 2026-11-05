/* Adds profile persistence and the optional game flow to the existing workplace. */
document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    const P = window.VocProgress;
    const find = key => CATEGORIES.flatMap(category => category.items).find(item => P.key(item) === key);
    let changingProfile = false;
    let restoring = true;
    let practiced = P.active()?.workspace?.practiced || null;
    let worked = P.active()?.workspace?.worked || [];
    let lastResult = P.active()?.workspace?.lastResult || null;
    let wordLevel = P.active()?.workspace?.wordLevel || null;
    let learnedDomain = null;
    let records = [];
    let hadMistake = false;
    let promptQueue = [];
    let run = null;
    let automaticChoice = null;
    let planStartMode = 'practice';
    let startToken = 0;
    const keys = () => [...new Set(app.state.slotsData.filter(slot => slot.item).map(slot => P.key(slot.item)))];
    const signature = () => [...keys()].sort().join('|');
    const save = () => {
        if (restoring || changingProfile) return;
        if (practiced !== signature()) practiced = null;
        if (wordLevel && [...wordLevel.keys].sort().join('|') !== signature()) wordLevel = null;
        P.saveWorkspace({ slotsCount: app.state.slotsCount, slots: app.state.slotsData.map(slot => slot.item ? P.key(slot.item) : null), practiced, lastResult, worked, wordLevel });
    };
    const render = app.renderSlotsContent;
    app.renderSlotsContent = function() {
        render.call(this);save();
        if(this.state.view==='workplace')for(const slot of this.state.slotsData)if(slot.item)window.SessionHomework?.record({activity:'تدريب الكلمات',key:P.key(slot.item),label:slot.item.name});
    };
    const saved = P.active()?.workspace;
    if (saved && Number.isInteger(saved.slotsCount) && saved.slotsCount >= 1 && saved.slotsCount <= 9) {
        app.state.slotsCount = saved.slotsCount;
        app.state.slotsData = Array.from({ length: saved.slotsCount }, (_, id) => ({ id, item: find(saved.slots[id]) || null }));
        app.renderSlotsLayout();
    }
    app.state.stars = 0; app.renderStars(); restoring = false;
    window.addEventListener('voc-profile-beforechange', () => { automaticChoice=null;document.body.classList.remove('voc-automatic-workplace');if(app.state.deleteMode)app.setDeleteMode(false);save(); app.exitTestMode(false); changingProfile = true; });
    window.addEventListener('pagehide', () => { save(); logRun(true); });
    window.addEventListener('voc-profile-memorychange', () => { app.state.deleteMode=false;app.syncDeleteMode();changingProfile = false; practiced = null; lastResult = null; worked = []; wordLevel = null; app.resetSlots(); app.renderSlotsContent(); });
    window.addEventListener('voc-workplace-level-load', event => { practiced = null; lastResult = null; worked = []; wordLevel = event.detail || null; save(); });
    if (new URLSearchParams(location.search).has('workplace')) app.switchView('workplace');

    const title = document.querySelector('#category-modal h2');
    const titleGroup = document.createElement('div'); titleGroup.style.cssText = 'display:flex;align-items:center;gap:8px;flex:1;min-width:0';
    title.before(titleGroup); titleGroup.append(title); title.style.cssText = 'flex:1;min-width:0';
    const libraries = [];
    for (const [domain, label] of [['receptive', 'الكلمات المتقنة في الفهم'], ['expressive', 'الكلمات المتقنة في التعبير']]) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'voc-choice voc-icon voc-book';
        button.id = `learned-library-${domain}`; button.dataset.learnedDomain = domain;
        button.setAttribute('aria-label', label); button.title = label; button.setAttribute('aria-pressed', 'false');
        button.innerHTML = domain === 'expressive'
            ? '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12c3-1 5-5 7-3l2 1 2-1c2-2 4 2 7 3-3 6-15 6-18 0Z"/><path d="M3 12c6 2 12 2 18 0"/></svg>'
            : '<i class="fas fa-ear-listen" aria-hidden="true"></i>';
        titleGroup.append(button); libraries.push(button); button.hidden = P.isAdmin();
        button.addEventListener('click', () => {
            learnedDomain = learnedDomain === domain ? null : domain;
            libraries.forEach(control => control.setAttribute('aria-pressed', String(control.dataset.learnedDomain === learnedDomain)));
            title.textContent = learnedDomain === 'receptive' ? 'كلمات الفهم' : learnedDomain === 'expressive' ? 'كلمات التعبير' : 'اختر صورة للبطاقة';
            app.handleSearch(document.querySelector('#search-input').value);
        });
    }
    const renderItems = app.renderItemsGrid;
    app.renderItemsGrid = function(items) { renderItems.call(this, items.filter(item => P.inLibrary(item, learnedDomain))); };
    const open = app.modals.open;
    app.modals.open = function(id) { if (id === 'category-modal') app.handleSearch(document.querySelector('#search-input').value); open.call(this, id); };
    // Single-card browsing obeys the same learned-library filter as the picker.
    app.navigateTemplateOne = function(direction) {
        if (this.state.slotsCount !== 1 || this.state.testState.active || this.state.deleteMode) return;
        const slot = this.state.slotsData[0];
        const pool = CATEGORIES.find(c => c.id === (slot.item?.catId || this.state.activeCategory))?.items.filter(item => P.inLibrary(item, learnedDomain)) || [];
        if (!pool.length) return;
        const at = pool.findIndex(item => P.key(item) === P.key(slot.item || ''));
        slot.item = pool[(at + direction + pool.length) % pool.length];
        this.renderSlotsContent(); this.playAudioAndAnimate(slot, document.querySelector('#slot-0'));
    };

    const modal = document.createElement('dialog'); modal.id = 'automation-dialog'; modal.className = 'voc-dialog'; modal.setAttribute('aria-labelledby', 'automation-title');
    const iconButton = (attributes, icon, label, extra = '') => `<button type="button" class="voc-choice voc-icon" ${attributes} aria-label="${label}" title="${label}"><i class="fas fa-${icon}" aria-hidden="true"></i>${extra}</button>`;
    modal.innerHTML = `<h2 id="automation-title">نكمل بالألعاب؟</h2><div class="voc-choices" id="plan-levels" role="group" aria-label="المستوى">${iconButton('data-difficulty="easy" aria-pressed="true"', 'seedling', 'سهل')}${iconButton('data-difficulty="moderate" aria-pressed="false"', 'walking', 'متوسط')}${iconButton('data-difficulty="advanced" aria-pressed="false"', 'running', 'متقدم')}</div><div class="voc-choices" id="plan-games" role="group" aria-label="الألعاب التالية">${iconButton('data-mode="matching" aria-pressed="true"', 'puzzle-piece', 'المطابقة')}${iconButton('data-mode="memory" aria-pressed="true"', 'brain', 'الذاكرة')}${iconButton('data-mode="rapid" aria-pressed="true"', 'bolt', 'البطاقات السريعة')}${iconButton('data-mode="test" aria-pressed="true"', 'headphones', 'استمع واختر')}</div><footer class="suite-text-actions"><button type="button" id="start-plan">يلا نلعب</button><button type="button" id="dismiss-plan">عودة للتدريب</button></footer>`;
    document.body.append(modal);
    const autoButton=document.createElement('button');autoButton.type='button';autoButton.id='start-automatic-path';autoButton.className='suite-icon';autoButton.title='المسار التلقائي';autoButton.setAttribute('aria-label',autoButton.title);autoButton.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 5 11 7-11 7z"/></svg>';
    document.querySelector('#workplace-view > header > div').append(autoButton);
    autoButton.onclick=()=>{window.AppNavigation?.closeSettings();planStartMode='practice';app.exitTestMode(false);modal.showModal();};
    modal.querySelectorAll('[data-difficulty]').forEach(button => button.addEventListener('click', () => modal.querySelectorAll('[data-difficulty]').forEach(b => b.setAttribute('aria-pressed', String(b === button)))));
    modal.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
        button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
        modal.querySelector('#start-plan').disabled = !modal.querySelector('[data-mode][aria-pressed=true]');
    }));
    modal.querySelector('#dismiss-plan').onclick = () => {modal.close();app.switchView('workplace');save();};
    modal.addEventListener('cancel',()=>{app.switchView('workplace');save();});
    modal.querySelector('#start-plan').onclick = () => {
        const modes = [...modal.querySelectorAll('[data-mode][aria-pressed=true]')].map(button => button.dataset.mode);
        const difficulty = modal.querySelector('[data-difficulty][aria-pressed=true]').dataset.difficulty;
        if(!planStartMode){if(P.startPlan([...new Set([...worked,...keys()])],difficulty,modes)&&P.storageOK()){worked=[];save();location.href=P.planURL();}return;}
        automaticChoice={difficulty,modes};modal.close();
        document.body.classList.add('voc-automatic-workplace');
        void app.handleModeButtonClick(planStartMode);
    };
    function logRun(partial) {
        if (!run || run.logged || !records.length) return;
        run.logged = !partial;
        P.logSession({ id: run.id, started: run.started, source: 'workplace', domain: 'receptive', kind: run.mode === 'practice' ? 'practice' : 'assessment', partial,
            records: records.map(record => ({ key: record.key, correct: record.correct ? 1 : 0, total: 1 })) });
    }
    const exit = app.exitTestMode;
    app.exitTestMode = function(showMessage = true) { if(showMessage){automaticChoice=null;document.body.classList.remove('voc-automatic-workplace');}startToken++; this.stopCardPlayback(); window.VocCountdown.cancel(); if (this.state.testState.active) logRun(true); exit.call(this, showMessage); };
    const start = app.handleModeButtonClick;
    app.handleModeButtonClick = async function(type) {
        if(this.state.deleteMode)this.setDeleteMode(false);
        if (this.state.testState.active && this.state.mode === type) { start.call(this, type); return; }
        if (!keys().length) { this.showToast('أضف بطاقة للبدء', 'warning'); return; }
        this.exitTestMode(false);
        if (type === 'test' && practiced === signature()) {
            const filled = this.state.slotsData.filter(slot => slot.item);
            if (filled.length > 1) {
                const items = filled.map(slot => slot.item), shift = 1 + Math.floor(Math.random() * (filled.length - 1));
                filled.forEach((slot, index) => { slot.item = items[(index + shift) % items.length]; });
                this.renderSlotsContent();
            }
        }
        this.primeCardAudio();
        const token = ++startToken;
        if (!await window.VocCountdown.start() || token !== startToken) return;
        run = { id: `workplace-${Date.now()}-${Math.random().toString(36).slice(2)}`, started: new Date().toISOString(), mode: type, logged: false };
        records = []; hadMistake = false;
        const pool = this.state.slotsData.filter(slot => slot.item);
        promptQueue = [];
        while (promptQueue.length < 10) {
            const shuffled = [...pool].sort(() => Math.random() - .5);
            promptQueue.push(...shuffled.map(slot => P.key(slot.item)));
        }
        promptQueue.length = 10;
        this.state.stars = 0; this.renderStars(); start.call(this, type);
    };
    const next = app.nextTrial;
    app.nextTrial = function() {
        if (this.state.testState.active && this.state.testState.trialsLeft <= 0) {
            const mode = this.state.mode;
            const correct = records.filter(record => record.correct).length;
            const percentage = Math.round(correct / Math.max(1, records.length) * 100);
            if (mode === 'practice') practiced = signature();
            else { P.record('receptive', records); P.completeWordLevel(wordLevel, records, true); lastResult = { percentage, correct, total: records.length, date: new Date().toISOString() }; }
            logRun(false);
            this.exitTestMode(false); this.state.stars = 0; this.renderStars(); save();
            worked=[...new Set([...worked,...keys()])];save();
            if (mode === 'practice' && automaticChoice) { void this.handleModeButtonClick('test'); return; }
            if (mode === 'test' && automaticChoice) {
                const {difficulty,modes}=automaticChoice;automaticChoice=null;
                if(P.startPlan([...new Set([...worked,...keys()])],difficulty,modes)&&P.storageOK()){worked=[];save();location.href=P.planURL();}
                return;
            }
            if (mode === 'test' || mode === 'practice') {
                planStartMode=mode==='practice'?'test':null;
                modal.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', 'true'));
                modal.querySelector('#start-plan').disabled = false; modal.showModal();
            } else this.showToast(mode === 'practice' ? 'اكتمل التدريب' : `نتيجة الاختبار: ${percentage}%`, 'success');
            return;
        }
        next.call(this);
        if (this.state.testState.active) {
            this.state.testState.targetItem = find(promptQueue[this.state.testState.completedTrials]) || this.state.testState.targetItem;
            document.querySelectorAll('.slot').forEach(el => el.classList.remove('animate-pulse-hint'));
            if (this.state.mode === 'practice') {
                const index = this.state.slotsData.findIndex(slot => slot.item && P.key(slot.item) === P.key(this.state.testState.targetItem));
                document.getElementById(`slot-${index}`)?.classList.add('animate-pulse-hint');
            }
        }
    };
    const answer = app.evaluateTestAnswer;
    app.evaluateTestAnswer = function(index) {
        const trial = this.state.testState, item = this.state.slotsData[index]?.item;
        if (!trial.active || trial.answering || !item || !trial.targetItem) return;
        const correct = P.key(item) === P.key(trial.targetItem);
        window.SessionHomework?.record({activity:this.state.mode==='practice'?'تدريب فهم الكلمات':'اختبار فهم الكلمات',key:P.key(trial.targetItem),label:trial.targetItem.name,
            kind:correct&&this.state.mode!=='practice'?'assessment':'practice',domain:'receptive',correct:Number(!hadMistake),total:correct?1:0,needsHelp:!correct||hadMistake});
        if (correct) { records.push({ key: P.key(trial.targetItem), correct: !hadMistake }); hadMistake = false; }
        else hadMistake = true;
        answer.call(this, index);
    };
    const setStars = app.setStars;
    app.setStars = function(count) {
        if (this.state.testState.active) { this.state.stars = Math.max(0, Math.min(10, count)); this.renderStars(); }
        else setStars.call(this, count);
    };
});
