// SENB interface, interaction, and audio playback.
let state = {
    currentView: 'home',
    deleteMode: false,
    slotCount: 4,
    isMultiline: false, // Legacy saved boards; new workplace uses a metronome row.
    showMetronome: false,
    showColoredCircles: true,
    isAdvancedMode: false,
    isPlayingSequence: false, // Prevents duplicate sequence plays
    featuredAdvancedCard: null,
    row1Slots: [null, null, null, null, null, null],
    row2Slots: [null, null, null, null, null, null],
    row1Covered: [false, false, false, false, false, false],
    row2Covered: [false, false, false, false, false, false],
    activePickerSlot: { row: 1, index: 0 },
    activeCategory: '01 subject',
    selectedVerbTense: 'present',
    selectedPronounModifier: 'standard',
    advFolder: '2',
    advSubCatId: 1,
    basicLearnedFilter: null,
    advancedLearnedFilter: null
};
let activeWorkplace = 0;
const workplaceId = id => (activeWorkplace ? 'second-' : '') + id;
const workplaceElement = id => document.getElementById(workplaceId(id));
let workplaceInitialized = false;
let expandedAdvancedFolder = null;

function navigateTo(viewName) {
    if(viewName!=='workplace')state.deleteMode=false;
    syncWorkplaceDeleteMode();
    if (typeof clearComprehensionHeader === 'function') clearComprehensionHeader();
    if (typeof stopActivityPlayback === 'function') stopActivityPlayback();
    else stopAllPlayback();
    state.currentView = viewName;
    document.body.classList.toggle('app-home-shell', viewName === 'home');
    document.getElementById('homeView').classList.toggle('hidden', viewName !== 'home');
    document.getElementById('workplaceView').classList.toggle('hidden', viewName !== 'workplace');
    document.getElementById('activityView').classList.toggle('hidden', viewName !== 'activity');
    document.getElementById('workplaceHeaderToolbar').classList.toggle('hidden', viewName !== 'workplace');
    document.getElementById('clearBoardBtn').classList.toggle('hidden', viewName !== 'workplace');
    document.getElementById('activityHomeBtn').classList.toggle('hidden', viewName !== 'activity');
    document.getElementById('homeHeaderTools').classList.toggle('hidden', viewName !== 'home');
    if (viewName === 'workplace') renderWorkplace();
    window.SenbSplit?.orientation();
}

let templateAnchor = null;
function closeTemplateDropdown(restoreFocus = false) {
    document.getElementById('templateDropdown').classList.add('hidden');
    const toggle = document.getElementById('templateToggleBtn');
    toggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) (toggle.getClientRects().length?toggle:document.querySelector('[data-suite-settings]'))?.focus({ preventScroll: true });
}
function positionTemplateDropdown() {
    const dropdown = document.getElementById('templateDropdown');
    if (dropdown.classList.contains('hidden')) return;
    const toggle = document.getElementById('templateToggleBtn');
    const bar = toggle.closest('.suite-settings-panel') || toggle.closest('header');
    const anchor = templateAnchor || toggle.getBoundingClientRect(), bounds = templateAnchor || (bar || toggle).getBoundingClientRect();
    const width = Math.min(280, innerWidth - 24), top = bounds.bottom + 8;
    Object.assign(dropdown.style, {
        width: `${width}px`, top: `${top}px`,
        left: `${Math.max(12, Math.min(anchor.right - width, innerWidth - width - 12))}px`,
        maxHeight: `${Math.max(44, innerHeight - top - 12)}px`
    });
}
function toggleTemplateDropdown() {
    const dropdown = document.getElementById('templateDropdown');
    if (!dropdown.classList.contains('hidden')) { closeTemplateDropdown(); return; }
    // Keep the choices outside the wrapping toolbar and its scroll container.
    dropdown.classList.add('senb-template-panel');
    document.body.append(dropdown);
    dropdown.classList.remove('hidden');
    document.getElementById('templateToggleBtn').setAttribute('aria-expanded', 'true');
    templateAnchor = document.getElementById('templateToggleBtn').getBoundingClientRect();
    window.AppNavigation?.closePanels();
    positionTemplateDropdown();
    (dropdown.querySelector('[aria-pressed="true"]') || dropdown.querySelector('button'))?.focus({ preventScroll: true });
}
window.addEventListener('resize', () => requestAnimationFrame(positionTemplateDropdown));
document.addEventListener('scroll', positionTemplateDropdown, true);
window.addEventListener('pagehide', () => closeTemplateDropdown());

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('templateDropdown');
    if (!e.target.closest('#templateControl') && dropdown && !dropdown.contains(e.target) && !dropdown.classList.contains('hidden')) {
        closeTemplateDropdown();
    }
});

function setSlotCount(count) {
    state.deleteMode=false;
    state.slotCount = count;
    closeTemplateDropdown(true);
    applyWorkplaceSettings({ slotCount: count });
}

function applyWorkplaceSettings(patch) {
    stopAllPlayback();
    Object.assign(state, patch);
    if (window.SenbSplit?.enabled()) SenbSplit.updateSettings(patch);
    else renderWorkplace();
}

function toggleWorkplaceMetronome() {
    applyWorkplaceSettings({ showMetronome: !state.showMetronome });
}

function renderWorkplaceMetronome() {
    const frame = workplaceElement('workplaceMetronomeFrame');
    frame.replaceChildren();
    const words = state.row1Slots.slice(0, state.slotCount).filter(Boolean);
    frame.hidden = !words.length;
    workplaceElement('workplaceMetronomeContainer').classList.toggle('hidden', !state.showMetronome || !words.length);
    frame.tabIndex = words.length ? 0 : -1;
    frame.setAttribute('aria-busy', 'false');
    let beatIndex=0;
    state.row1Slots.slice(0,state.slotCount).forEach((word,slotIndex) => {
        if(!word)return;
        const index=beatIndex++;
        const circle = document.createElement('button'); circle.type = 'button';
        circle.className = 'workplace-metronome-circle'; circle.dataset.workplaceBeat = index;circle.dataset.slotIndex=slotIndex;
        circle.style.gridColumn=slotIndex+1;
        circle.style.setProperty('--beat-color', getSlotColorConfig(slotIndex, state.slotCount));
        circle.setAttribute('aria-label', `استمع إلى النبضة ${slotIndex + 1}`);
        circle.onclick = event => { event.stopPropagation(); void playWorkplaceMetronome(index); };
        frame.append(circle);
    });
}

let workplaceMetronomePlaying = false;
async function playWorkplaceMetronome(onlyIndex, sequenceTicket) {
    const frame = workplaceElement('workplaceMetronomeFrame');
    if (state.currentView !== 'workplace') return;
    if (!state.showMetronome || frame.hidden) return true;
    if(state.deleteMode){state.deleteMode=false;renderWorkplace();}
    if (sequenceTicket === undefined) stopAllPlayback();
    const ticket = sequenceTicket ?? sentencePlaybackToken;
    const circles = [...frame.querySelectorAll('[data-workplace-beat]')];
    const indices = onlyIndex === undefined ? circles.map((_, index) => index) : [onlyIndex];
    workplaceMetronomePlaying = true; frame.setAttribute('aria-busy', 'true');
    try {
        for (const index of indices) {
            if (ticket !== sentencePlaybackToken) return;
            const circle = circles[index]; if (!circle) return;
            circle.classList.add('lit');
            const playback = playAudioFilePath(getMetronomeAudioPath(), '');
            const requestId = playbackRequestId;
            if (!await playback || ticket !== sentencePlaybackToken || requestId !== playbackRequestId) return;
            await new Promise(resolve => setTimeout(resolve, 500));
            if (ticket !== sentencePlaybackToken || requestId !== playbackRequestId) return;
            circle.classList.remove('lit');
        }
        return true;
    } finally {
        if (ticket === sentencePlaybackToken) {
            workplaceMetronomePlaying = false; frame.setAttribute('aria-busy', 'false');
            circles.forEach(circle => circle.classList.remove('lit'));
        }
    }
}

let workplaceWordsPlaying=false;
async function playWorkplaceWords(onlyIndex, sequenceTicket) {
    if(state.currentView!=='workplace'||state.deleteMode)return;
    if (sequenceTicket === undefined) stopAllPlayback();
    const ticket=sequenceTicket ?? sentencePlaybackToken,frame=workplaceElement('workplaceWordFrame');
    const indices=onlyIndex===undefined?state.row1Slots.slice(0,state.slotCount).map((item,index)=>item?index:-1).filter(index=>index>=0):[onlyIndex];
    if(!indices.length)return true;
    workplaceWordsPlaying=true;frame.classList.add('expression-frame-playing');frame.setAttribute('aria-busy','true');
    try {
        for(const index of indices){
            if(ticket!==sentencePlaybackToken)return;
            const item=state.row1Slots[index],card=workplaceElement(`slot-1-${index}`);if(!item||!card)continue;
            card.classList.remove('pop-animation');card.classList.add('expression-card-playing');card.setAttribute('aria-busy','true');
            card.scrollIntoView({block:'nearest',inline:'nearest'});
            for(const segment of getSlotAudioSegments(item,1,index)){
                const playback=playAudioFilePath(segment.path,segment.text),requestId=playbackRequestId;
                if(!await playback||ticket!==sentencePlaybackToken||requestId!==playbackRequestId)return;
            }
            card.classList.remove('expression-card-playing');card.setAttribute('aria-busy','false');
        }
        return true;
    }finally{
        if(ticket===sentencePlaybackToken){
            workplaceWordsPlaying=false;frame.classList.remove('expression-frame-playing');frame.setAttribute('aria-busy','false');
            frame.querySelectorAll('.expression-card-playing').forEach(card=>{card.classList.remove('expression-card-playing');card.setAttribute('aria-busy','false');});
        }
    }
}

function toggleColoredCircles() {
    applyWorkplaceSettings({ showColoredCircles: !state.showColoredCircles });
}

function toggleAdvancedMode() {
    applyWorkplaceSettings({ isAdvancedMode: !state.isAdvancedMode });
}

function syncWorkplaceDeleteMode() {
    const button=document.getElementById('clearBoardBtn');
    button.classList.toggle('delete-mode-active',state.deleteMode);
    button.setAttribute('aria-pressed',String(state.deleteMode));
    const label=state.deleteMode?'إنهاء وضع الحذف':'تفعيل وضع الحذف';
    button.setAttribute('aria-label',label);button.title=label;
    if(!state.deleteMode)document.querySelectorAll('#workplaceView .workplace-delete-card').forEach(card=>card.classList.remove('workplace-delete-card'));
}
function toggleWorkplaceDeleteMode() {
    applyWorkplaceSettings({ deleteMode: !state.deleteMode });
}
function finishWorkplaceDeletion(focusId) {
    if(!window.SenbSplit?.enabled()&&!state.featuredAdvancedCard&&!state.row1Slots.slice(0,state.slotCount).some(Boolean))state.deleteMode=false;
    renderWorkplace();document.getElementById(focusId)?.focus({preventScroll:true});
}

function clearAllSlots() {
    state.row1Slots = Array(6).fill(null);
    state.row2Slots = Array(6).fill(null);
    state.row1Covered = Array(6).fill(false);
    state.row2Covered = Array(6).fill(false);
    state.featuredAdvancedCard = null;
    renderWorkplace();
}

function renderWorkplace({persist = true} = {}) {
    syncWorkplaceDeleteMode();
    if (workplaceMetronomePlaying || workplaceWordsPlaying) stopAllPlayback();
    workplaceElement('workplaceWordStage').style.setProperty('--word-count',state.slotCount);
    workplaceElement('workplaceWordStage').closest('.workplace-content').classList.toggle('has-advanced-image',state.isAdvancedMode);
    syncToolbar();
    renderFeaturedCard();
    renderSlotRow('slotsRow1', 1);
    renderWorkplaceMetronome();
    renderAdvancedSentenceNavigation();
    if(state.currentView==='workplace'&&window.SessionHomework){const sentence=getWorkplaceSentence();if(sentence)SessionHomework.record({activity:'بناء الجمل',label:sentence.title,entity:'sentence'});}
    if (persist) { window.SenbSplit?.refresh(); if (workplaceInitialized && window.SenbProgress) SenbProgress.saveWorkspace(workplaceStateSnapshot()); }
}

function renderFeaturedCard() {
    const container = workplaceElement('featuredCard');
    const titleEl = workplaceElement('featuredTitle');
    if (!container) return;
    makeInteractiveCard(container, state.featuredAdvancedCard?.title || 'اختر جملة متكاملة');

    if (state.featuredAdvancedCard) {
        const item = state.featuredAdvancedCard;
        if (titleEl) titleEl.innerText = state.showColoredCircles ? item.title : '';
        container.className = 'featured-16-9-card relative rounded-2xl border-2 border-purple-400 bg-white p-1 flex items-center justify-center cursor-pointer overflow-hidden shadow-md hover:shadow-lg';

        // Play audio on click when filled instead of opening the modal
        container.onclick = async (e) => {
            if(state.deleteMode){stopAllPlayback();state.featuredAdvancedCard=null;finishWorkplaceDeletion(workplaceId('featuredCard'));return;}
            if (e.target.closest('button')) return;
            stopAllPlayback();
            container.classList.add('playing-ring');
            await playAudioFilePath(item.soundPath, item.title);
            container.classList.remove('playing-ring');
        };

        container.innerHTML = `
            <span class="absolute top-1.5 right-1.5 text-[10px] font-black text-purple-600 bg-purple-50/90 px-1.5 py-0.5 rounded-md border border-purple-100/80 z-10">++</span>
            <div class="w-full h-full flex items-center justify-center p-1">
                <img src="${item.imgPath}" alt="${item.title}" class="w-full h-full object-contain filter drop-shadow-sm" onerror="this.onerror=null; this.src='assets/image-fallback.svg';">
            </div>
        `;
    } else {
        if (titleEl) titleEl.innerText = '';
        container.className = 'featured-16-9-card relative rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/60 hover:bg-purple-100/60 flex flex-col items-center justify-center p-2 text-center cursor-pointer overflow-hidden shadow-sm hover:shadow';

        // Re-enable opening modal when empty
        container.onclick = () => {if(!state.deleteMode)openAdvancedCategoryModal();};

        container.innerHTML = `
            <div class="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-0.5">
                <span class="text-lg font-black">++</span>
            </div>
            <span class="text-xs font-extrabold text-purple-800">اختر جملة متكاملة ++</span>
        `;
    }
    if(state.deleteMode && state.featuredAdvancedCard){container.classList.add('workplace-delete-card');container.setAttribute('aria-label',`مسح الجملة: ${state.featuredAdvancedCard.title}`);}
    container.setAttribute('aria-disabled',String(state.deleteMode && !state.featuredAdvancedCard));
    container.tabIndex=state.deleteMode && !state.featuredAdvancedCard?-1:0;
}

function clearFeaturedCard(e) {
    if (e) e.stopPropagation();
    state.featuredAdvancedCard = null;
    renderWorkplace();
}

function renderSlotRow(containerId, rowNumber) {
    const container = workplaceElement(containerId);
    container.innerHTML = '';

    container.className = 'workplace-word-grid';
    const slotsData = rowNumber === 1 ? state.row1Slots : state.row2Slots;
    const coveredData = rowNumber === 1 ? state.row1Covered : state.row2Covered;

    for (let i = 0; i < state.slotCount; i++) {
        const item = slotsData[i];
        const isCovered = coveredData[i];
        const colorHex = getSlotColorConfig(i, state.slotCount);

        const slotWrapper = document.createElement('div');
        slotWrapper.className = 'flex flex-col items-center gap-0.5 sm:gap-1 w-full justify-center min-w-0';

        const card = document.createElement('div');
        card.id = workplaceId(`slot-${rowNumber}-${i}`);
        makeInteractiveCard(card, item ? getDisplayedItemTitle(item, rowNumber, i) : `اختر رمزاً للخانة ${i + 1}`);
        const compactClass = state.isAdvancedMode ? 'slot-card-compact' : '';
        card.className = `slot-card ${compactClass} relative rounded-xl sm:rounded-3xl border sm:border-2 flex flex-col items-center justify-center p-1 text-center cursor-pointer overflow-hidden ${
            item ? 'bg-white border-sky-300 shadow-md shadow-sky-100 hover:shadow-lg' : 'bg-sky-50/60 border-dashed border-sky-300 hover:bg-sky-100/60'
        }`;

        card.onclick = (e) => {
            e.stopPropagation();
            if(state.deleteMode){if(item){stopAllPlayback();if(rowNumber===1){state.row1Slots[i]=null;state.row1Covered[i]=false;}else{state.row2Slots[i]=null;state.row2Covered[i]=false;}finishWorkplaceDeletion(card.id);}return;}
            if (item) {
                void playWorkplaceWords(i);
            } else {
                openCategoryModal(rowNumber, i);
            }
        };

        if (item) {
            const imagePath = getBasicImagePath(item);

            const titleText = getDisplayedItemTitle(item, rowNumber, i);

            card.innerHTML = `
                <div class="workplace-slot-image">
                    <img src="${imagePath}" alt="${titleText}" onerror="this.onerror=null; this.src='assets/image-fallback.svg';">
                </div>
                <div class="cover-overlay absolute inset-0 rounded-xl sm:rounded-3xl flex flex-col items-center justify-center text-white z-20 ${isCovered ? '' : 'cover-hidden'}" style="background-color: ${colorHex};">
                    <svg class="w-6 h-6 sm:w-7 sm:h-7 opacity-90 drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="w-6 h-6 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-sky-100/70 text-sky-600 flex items-center justify-center">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </div>
                <div class="cover-overlay absolute inset-0 rounded-xl sm:rounded-3xl flex flex-col items-center justify-center text-white z-20 ${isCovered ? '' : 'cover-hidden'}" style="background-color: ${colorHex};">
                    <svg class="w-6 h-6 sm:w-7 sm:h-7 opacity-90 drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
            `;
        }

        if(state.deleteMode && item){card.classList.add('workplace-delete-card');card.style.setProperty('--delete-delay',`${-(i%3)*.07}s`);card.setAttribute('aria-label',`مسح البطاقة: ${getDisplayedItemTitle(item,rowNumber,i)}`);}
        card.setAttribute('aria-disabled',String(state.deleteMode && !item));card.tabIndex=state.deleteMode && !item?-1:0;
        slotWrapper.appendChild(card);

        const titleEl = document.createElement('div');
        titleEl.className = 'slot-label text-[9px] sm:text-xs font-black text-slate-700 truncate w-full text-center h-3 sm:h-4 leading-tight px-0.5 mt-0.5 sm:mt-1';
        titleEl.innerText = (item && state.showColoredCircles) ? getDisplayedItemTitle(item, rowNumber, i) : '';
        if (!state.showColoredCircles) {
            titleEl.hidden = true;
        }
        slotWrapper.appendChild(titleEl);

        if (state.showColoredCircles) {
            const circle = document.createElement('button');
            circle.className = `slot-cover-toggle w-3 h-3 sm:w-4.5 sm:h-4.5 rounded-full shadow-sm border border-white shrink-0 transition-transform active:scale-90`;
            circle.style.setProperty('--slot-color', colorHex);
            circle.setAttribute('aria-label', `تغطية الخانة ${i + 1}`);
            circle.setAttribute('aria-pressed', String(isCovered));
            circle.disabled=state.deleteMode;
            circle.onclick = event => {
                event.stopPropagation();
                if(state.deleteMode)return;
                if (rowNumber === 1) state.row1Covered[i] = !state.row1Covered[i];
                else state.row2Covered[i] = !state.row2Covered[i];
                renderWorkplace();
            };
            slotWrapper.appendChild(circle);
        }

        container.appendChild(slotWrapper);
    }
}

function triggerCardAnimation(cardElem) {
    cardElem.classList.remove('pop-animation');
    void cardElem.offsetWidth;
    cardElem.classList.add('pop-animation');
}

function clearSingleSlot(rowNumber, index, e) {
    if (e) e.stopPropagation();
    if (rowNumber === 1) state.row1Slots[index] = null;
    else state.row2Slots[index] = null;
    renderWorkplace();
}

function openCategoryModal(rowNumber, index) {
    state.activePickerSlot = { row: rowNumber, index: index };
    openPicker('categoryModal');
    renderModalCategoriesList();
    selectCategory(state.activeCategory);
}

function closeCategoryModal() { closePicker('categoryModal'); }

function renderModalCategoriesList() {
    const listContainer = document.getElementById('categoriesList');
    listContainer.innerHTML = '';
    CATEGORIES.forEach(cat => {
        const btn = document.createElement('button');
        const isSelected = cat.id === state.activeCategory;
        btn.className = `w-full text-right p-2 sm:p-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 ${isSelected ? 'bg-sky-500 text-white' : 'bg-white text-slate-700'}`;
        btn.onclick = () => selectCategory(cat.id);
        btn.innerHTML = `<span>${cat.icon}</span><span class="truncate">${cat.name}</span>`;
        listContainer.appendChild(btn);
    });
}

function selectCategory(categoryId) {
    state.activeCategory = categoryId;
    renderModalCategoriesList();
    const cat = CATEGORIES.find(c => c.id === categoryId);
    document.getElementById('modalCategoryTitle').innerText = cat.name;
    document.getElementById('modalCategoryBadge').className = `w-3 h-3 rounded-full ${cat.color}`;

    document.getElementById('verbTenseFilter').classList.toggle('hidden', categoryId !== '02 verbs');
    document.getElementById('pronounModifierFilter').classList.toggle('hidden', categoryId !== '07 Pronoun');

    renderModalItemsGrid(categoryId);
}

function setVerbTense(tense) {
    state.selectedVerbTense = tense;
    ['Past', 'Present', 'Future'].forEach(t => document.getElementById(`tense${t}Btn`).className = 'px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-100');
    if (tense === 'past') document.getElementById('tensePastBtn').className = 'px-2 py-1 rounded-lg bg-rose-500 text-white font-bold';
    if (tense === 'present') document.getElementById('tensePresentBtn').className = 'px-2 py-1 rounded-lg bg-amber-400 text-slate-900 font-bold';
    if (tense === 'future') document.getElementById('tenseFutureBtn').className = 'px-2 py-1 rounded-lg bg-emerald-500 text-white font-bold';

    if (state.activeCategory === '02 verbs') {
        renderModalItemsGrid('02 verbs');
    }
}

function setPronounModifier(mod) {
    state.selectedPronounModifier = mod;
    ['Standard', 'Male', 'Female', 'Verb'].forEach(m => document.getElementById(`pronounMod${m}`).className = 'px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-100');
    if (mod === 'standard') document.getElementById('pronounModStandard').className = 'px-2 py-1 rounded-lg bg-sky-500 text-white font-bold';
    if (mod === 'possessive_male') document.getElementById('pronounModMale').className = 'px-2 py-1 rounded-lg bg-blue-500 text-white font-bold';
    if (mod === 'possessive_female') document.getElementById('pronounModFemale').className = 'px-2 py-1 rounded-lg bg-pink-500 text-white font-bold';
    if (mod === 'possessive_verb') document.getElementById('pronounModVerb').className = 'px-2 py-1 rounded-lg bg-teal-500 text-white font-bold';
}

function renderModalItemsGrid(categoryId) {
    const grid = document.getElementById('itemsGrid');
    grid.innerHTML = '';
    const items = (ITEMS_DATABASE[categoryId] || []).filter(item => !state.basicLearnedFilter || isSenbLearned(`w:${categoryId}/${item.id}`, state.basicLearnedFilter));
    const cat = CATEGORIES.find(c => c.id === categoryId);
    const slotInfo = state.activePickerSlot;

    items.forEach(item => {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col items-center w-full';

        let displayTitle = item.title;

        // Preview conjugated verb OR dynamically map Adjectives/Colors right inside the modal
        if (categoryId === '02 verbs' || categoryId === '05 adjectives' || categoryId === '10 colors') {
            const simulatedItem = { ...item, categoryId, verbTense: state.selectedVerbTense };
            displayTitle = getDisplayedItemTitle(simulatedItem, slotInfo.row, slotInfo.index);
        } else if (!displayTitle) {
            // Safe fallback just in case 'title' is missing on standard items
            displayTitle = item.titleMale || '';
        }

        const card = document.createElement('div');
        makeInteractiveCard(card, displayTitle);
        card.className = 'picker-card slot-card !max-h-[130px] !max-w-[130px] rounded-2xl border bg-white p-1 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow';
        card.onclick = () => selectItemForSlot(item, categoryId);
        card.innerHTML = `
            <div class="w-full h-full flex items-center justify-center p-1">
                <img loading="lazy" decoding="async" alt="${displayTitle}" src="${getBasicImagePath({ ...item, categoryId: cat.id })}" class="w-full h-full object-contain" onerror="this.onerror=null; this.src='assets/image-fallback.svg';">
            </div>
        `;

        const titleEl = document.createElement('div');
        titleEl.className = 'text-[11px] sm:text-xs font-black text-slate-800 truncate w-full text-center mt-1 h-4';
        titleEl.innerText = displayTitle;

        wrapper.appendChild(card);
        wrapper.appendChild(titleEl);
        grid.appendChild(wrapper);
    });
    if (!items.length) renderLearnedEmpty(grid);
}

function selectItemForSlot(item, categoryId) {
    const slotInfo = state.activePickerSlot;
    const itemCopy = { ...item, categoryId, verbTense: state.selectedVerbTense, pronounModifier: state.selectedPronounModifier };
    if (slotInfo.row === 1) state.row1Slots[slotInfo.index] = itemCopy;
    else state.row2Slots[slotInfo.index] = itemCopy;
    closeCategoryModal();
    renderWorkplace();
    playSlotAudio(itemCopy, slotInfo.row, slotInfo.index);
}

function openAdvancedCategoryModal() {
    openPicker('advancedModal');
    selectAdvFolder(state.advFolder, false);
}

function closeAdvancedModal() { closePicker('advancedModal'); }

function renderAdvMainCategoriesList() {
    const container = document.getElementById('advMainCatList');
    container.innerHTML = '';
    ADVANCED_CATEGORIES.forEach(cat => {
        const isSelected = cat.folder === state.advFolder;
        const expanded = isSelected && expandedAdvancedFolder === cat.folder;
        const group = document.createElement('div');
        group.className = 'advanced-picker-group';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `advanced-group-toggle${isSelected ? ' selected' : ''}`;
        btn.dataset.advancedGroup = cat.folder;
        btn.setAttribute('aria-expanded', String(expanded));
        if (isSelected) btn.setAttribute('aria-controls', `advanced-subgroups-${cat.folder}`);
        btn.onclick = () => {
            selectAdvFolder(cat.folder, !expanded);
            document.querySelector(`[data-advanced-group="${cat.folder}"]`).focus({ preventScroll: true });
        };
        const label = document.createElement('span'); label.textContent = cat.name;
        const arrow = document.createElement('span'); arrow.className = 'advanced-group-chevron';
        arrow.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
        btn.append(label, arrow); group.appendChild(btn);
        if (isSelected) {
            const list = document.createElement('div');
            list.id = `advanced-subgroups-${cat.folder}`;
            list.className = `advanced-subgroup-list${expanded ? ' expanded' : ''}`;
            list.setAttribute('role', 'group'); list.setAttribute('aria-label', 'المجموعات الفرعية');
            cat.subcategories.filter(sub => expanded || Number(sub.id) === Number(state.advSubCatId)).forEach(sub => {
                const selected = Number(sub.id) === Number(state.advSubCatId);
                const choice = document.createElement('button'); choice.type = 'button';
                choice.className = 'advanced-subgroup-choice'; choice.dataset.advancedSubgroup = sub.id;
                choice.setAttribute('aria-pressed', String(selected));
                const title = document.createElement('span'); title.textContent = `${sub.id}. ${sub.name}`;
                choice.append(title);
                if (selected) {
                    const tick = document.createElement('span'); tick.className = 'advanced-subgroup-tick';
                    tick.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
                    choice.append(tick);
                }
                choice.onclick = () => {
                    if (!expanded) expandedAdvancedFolder = cat.folder;
                    else { state.advSubCatId = sub.id; expandedAdvancedFolder = null; }
                    renderAdvMainCategoriesList();
                    renderAdvItemsGrid(cat.folder, state.advSubCatId);
                    document.querySelector(`[data-advanced-subgroup="${state.advSubCatId}"]`).focus({ preventScroll: true });
                };
                list.appendChild(choice);
            });
            group.appendChild(list);
        }
        container.appendChild(group);
    });
}

function selectAdvFolder(folder, expand = true) {
    const changed = String(state.advFolder) !== String(folder);
    const cat = ADVANCED_CATEGORIES.find(c => c.folder === String(folder));
    if (!cat) return;
    state.advFolder = String(folder);
    expandedAdvancedFolder = expand ? state.advFolder : null;
    if (changed || !cat.subcategories.some(sub => Number(sub.id) === Number(state.advSubCatId))) state.advSubCatId = cat.subcategories[0].id;
    renderAdvMainCategoriesList();
    renderAdvSubCategoriesList(cat.subcategories);
    renderAdvItemsGrid(folder, state.advSubCatId);
}

function renderAdvSubCategoriesList(subcategories) {
    const container = document.getElementById('advSubCatList');
    container.innerHTML = '';
    container.classList.add('hidden');
}

function renderAdvItemsGrid(folder, subCatId) {
    const grid = document.getElementById('advItemsGrid');
    grid.innerHTML = '';

    for (let i = 1; i <= 24; i++) {
        const item = getAdvancedItemData(folder, subCatId, i);
        if (state.advancedLearnedFilter && !isSenbLearned(`s:${item.folder}/${item.subCatId}/${item.itemNum}`, state.advancedLearnedFilter)) continue;

        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col items-center w-full';

        const card = document.createElement('div');
        makeInteractiveCard(card, item.title);
        card.className = 'picker-card featured-16-9-card rounded-2xl border bg-white p-1 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-shadow border-purple-100 hover:border-purple-300';
        card.onclick = () => selectAdvancedSentenceItem(item);

        card.innerHTML = `
            <div class="w-full h-full flex items-center justify-center p-1">
                <img loading="lazy" decoding="async" src="${item.imgPath}" alt="${item.title}" class="w-full h-full object-contain filter drop-shadow-sm" onerror="this.onerror=null; this.src='assets/image-fallback.svg';">
            </div>
        `;

        const titleEl = document.createElement('div');
        titleEl.className = 'text-[11px] sm:text-xs font-black text-purple-950 truncate w-full text-center mt-1 h-4';
        titleEl.innerText = item.title;

        wrapper.appendChild(card);
        wrapper.appendChild(titleEl);
        grid.appendChild(wrapper);
    }
    if (!grid.children.length) renderLearnedEmpty(grid);
}

function selectAdvancedSentenceItem(item) {
    loadAdvancedSentence(item);
    closeAdvancedModal();
    renderWorkplace();
    playAudioFilePath(item.soundPath, item.title);
}

function loadAdvancedSentence(item) {
    state.deleteMode=false;
    stopAllPlayback();
    state.featuredAdvancedCard = item;
    state.slotCount = parseInt(item.folder);
    state.advFolder = String(item.folder);
    state.advSubCatId = Number(item.subCatId);
    if (!window.SenbSplit?.enabled()) state.isAdvancedMode = true;
    state.row1Slots = Array(6).fill(null);
    item.slots.forEach((s, idx) => {
        if (idx < 6) state.row1Slots[idx] = { ...s };
    });
    state.row1Covered = Array(6).fill(false);
}

function renderAdvancedSentenceNavigation() {
    let nav=workplaceElement('advancedSentenceNav');
    if(!nav){
        nav=document.createElement('div');nav.id=workplaceId('advancedSentenceNav');nav.className='advanced-sentence-nav';nav.setAttribute('role','group');nav.setAttribute('aria-label','التنقل بين جمل المجموعة الفرعية');
        nav.innerHTML='<button id="previousAdvancedSentence" type="button" aria-label="الجملة السابقة"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 5 7 7-7 7"/></svg></button><button id="nextAdvancedSentence" type="button" aria-label="الجملة التالية"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 5-7 7 7 7"/></svg></button>';
        nav.querySelector('#previousAdvancedSentence').id=workplaceId('previousAdvancedSentence');nav.querySelector('#nextAdvancedSentence').id=workplaceId('nextAdvancedSentence');
    }
    nav.querySelector('button:first-child').onclick=()=>moveWorkplaceSentence(-1);nav.querySelector('button:last-child').onclick=()=>moveWorkplaceSentence(1);
    const item=state.featuredAdvancedCard;
    const advanced=workplaceElement('advancedImageStage'),words=workplaceElement('workplaceWordStage');
    const host=state.isAdvancedMode && item?advanced:words;
    host.append(nav);nav.hidden=!item;
    advanced.dataset.navigation=String(Boolean(item)&&host===advanced);words.dataset.navigation=String(Boolean(item)&&host===words);
    workplaceElement('previousAdvancedSentence').disabled=!item||Number(item.itemNum)<=1;
    workplaceElement('nextAdvancedSentence').disabled=!item||Number(item.itemNum)>=24;
    updateWorkplaceNavigationPosition();
}
function updateWorkplaceNavigationPosition(){
    for(const nav of document.querySelectorAll('.advanced-sentence-nav')) {
        const frame=nav.closest('.workplace-content').querySelector('.workplace-word-frame');
        nav.style.height=nav.parentElement.id.endsWith('workplaceWordStage')?`${frame.offsetHeight}px`:'100%';
    }
}

function moveWorkplaceSentence(direction) {
    const current = state.featuredAdvancedCard;
    if (!current || ![-1, 1].includes(direction)) return;
    const number = Math.max(1, Math.min(24, Number(current.itemNum) + direction));
    if (number === Number(current.itemNum)) return;
    const advanced=state.isAdvancedMode;
    loadAdvancedSentence(getAdvancedItemData(current.folder, current.subCatId, number));
    state.isAdvancedMode=advanced;
    renderWorkplace();
}

function isSenbLearned(key, domain) { return Boolean(window.SenbProgress?.learned(key, domain)); }

function renderLearnedEmpty(grid) {
    const message = document.createElement('p');
    message.className = 'picker-learned-empty';
    message.setAttribute('role', 'status');
    message.textContent = 'لا توجد بطاقات مكتسبة هنا بعد.';
    grid.appendChild(message);
}

function installLearnedPickerControls() {
    const icons = {
        receptive: '<path d="M8 10a4 4 0 1 1 8 0c0 3-3 3-3 6a3 3 0 0 1-6 0M11 10a1 1 0 0 1 2 0M16 18l2 2 4-4"/>',
        expressive: '<path d="M6 4h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6l-5 4v-4H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3ZM8 9h8M8 13h5"/>'
    };
    for (const [modalId, type] of [['categoryModal', 'basic'], ['advancedModal', 'advanced']]) {
        const controls = document.createElement('div');
        controls.className = 'picker-learned-controls';
        controls.setAttribute('role', 'group');
        controls.setAttribute('aria-label', 'البطاقات المكتسبة بنسبة 80%');
        for (const [domain, label] of [['receptive', 'المكتسب في الفهم 80%'], ['expressive', 'المكتسب في التعبير 80%']]) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'picker-learned-button';
            button.dataset.learnedDomain = domain;
            button.dataset.learnedType = type;
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
            button.setAttribute('aria-pressed', 'false');
            button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[domain]}</svg>`;
            button.onclick = () => {
                const field = `${type}LearnedFilter`;
                state[field] = state[field] === domain ? null : domain;
                controls.querySelectorAll('button').forEach(control => control.setAttribute('aria-pressed', String(control.dataset.learnedDomain === state[field])));
                if (type === 'basic') renderModalItemsGrid(state.activeCategory);
                else renderAdvItemsGrid(state.advFolder, state.advSubCatId);
            };
            controls.appendChild(button);
        }
        const header = document.querySelector(`#${modalId} .picker-header`);
        header.insertBefore(controls, header.lastElementChild);
    }
}

function workplaceBoardSnapshot() {
    const fields = ['slotCount', 'showMetronome', 'isMultiline', 'showColoredCircles', 'isAdvancedMode', 'featuredAdvancedCard', 'row1Slots', 'row2Slots', 'row1Covered', 'row2Covered', 'advFolder', 'advSubCatId', 'activeCategory', 'selectedVerbTense', 'selectedPronounModifier'];
    return JSON.parse(JSON.stringify(Object.fromEntries(fields.map(field => [field, state[field]]))));
}

function workplaceStateSnapshot() {
    const saved = workplaceBoardSnapshot();
    if(window.SenbSplit) saved.splitWorkplace = window.SenbSplit.snapshot();
    return saved;
}

function initializeWorkplace() {
    state.deleteMode=false;syncWorkplaceDeleteMode();
    const saved = window.SenbProgress?.workspace();
    if (saved && [2, 3, 4, 5, 6].includes(saved.slotCount) && Array.isArray(saved.row1Slots)) {
        const allowed = Object.keys(workplaceBoardSnapshot());
        for (const field of allowed) if (Object.hasOwn(saved, field)) state[field] = saved[field];
        state.showMetronome = saved.showMetronome ?? Boolean(saved.isMultiline);
        state.isMultiline = false;
        for (const field of ['row1Slots', 'row2Slots']) state[field] = Array.from({ length: 6 }, (_, index) => state[field]?.[index] || null);
        for (const field of ['row1Covered', 'row2Covered']) state[field] = Array.from({ length: 6 }, (_, index) => Boolean(state[field]?.[index]));
    } else {
        state.showMetronome = false; state.isMultiline = false;
        state.showColoredCircles = true; state.isAdvancedMode = true;
        state.row2Slots = Array(6).fill(null); state.row2Covered = Array(6).fill(false);
        loadAdvancedSentence(getAdvancedItemData('2', 1, 1));
    }
    window.SenbSplit?.restore(saved?.splitWorkplace);
    workplaceInitialized = true;
}

function getWorkplaceSentence() {
    const slots = [];
    const slotContexts = [];
    const rows = [1];
    for (const row of rows) {
        const items = row === 1 ? state.row1Slots : state.row2Slots;
        for (let index = 0; index < state.slotCount; index++) {
            const original = items[index];
            if (!original) continue;
            const item = typeof SENBActivities === 'undefined' ? { ...original } : SENBActivities.normalizeSlot(original);
            const title = getDisplayedItemTitle(item, row, index);
            const segments = getSlotAudioSegments(item, row, index);
            slots.push({ ...item });
            slotContexts.push({ row, index, title, segments, key: `w:${item.categoryId}/${item.id}` });
        }
    }
    if (!slots.length) return null;
    const featured = state.featuredAdvancedCard;
    const signature = item => JSON.stringify([item.categoryId, item.id, item.title, item.verbTense, item.pronounModifier, item.conjugation, item.customImgPath, item.customSoundPath]);
    const preset = featured && featured.slots.length === slots.length && featured.slots.every((slot, index) => signature(slot) === signature(state.row1Slots[index]));
    const customKey = `b:${slots.map((slot, index) => `${slotContexts[index].row}.${slotContexts[index].index}:${encodeURIComponent(signature(slot))}`).join('|')}`;
    return JSON.parse(JSON.stringify({
        key: preset ? `s:${featured.folder}/${featured.subCatId}/${featured.itemNum}` : customKey,
        title: preset ? featured.title : slotContexts.map(context => context.title).join(' '),
        entity: 'sentence', presentation: preset && state.isAdvancedMode ? 'advanced' : 'slots',
        folder: preset ? featured.folder : String(slots.length),
        subCatId: preset ? featured.subCatId : null, itemNum: preset ? featured.itemNum : null,
        imgPath: preset ? featured.imgPath : null, soundPath: preset ? featured.soundPath : null,
        slots, slotContexts, slotCount: state.slotCount, secondRow: false
    }));
}

// Fixed playAudioFilePath to ensure strict synchrony by preventing overlapping double-resolves if a file fails to load
function playAudioFilePath(path, fallbackSpeechText) {
    const homeworkActivity=state.currentView==='activity'&&activity?ACTIVITY_NAMES[activity.mode]:'تدريب الكلمات والجمل';
    playbackRequestId++;
    // Stop a previous individual tap and settle its promise before reusing the element.
    if (finishActivePlayback) finishActivePlayback();
    playbackAudio.pause();
    window.speechSynthesis?.cancel();
    showAudioStatus('');

    return new Promise(resolve => {
        let finished = false;
        let handlingError = false;
        let speechTimer;
        const finish = (completed = false) => {
            if (finished) return;
            finished = true;
            clearTimeout(timeout);
            clearTimeout(speechTimer);
            playbackAudio.onended = null;
            playbackAudio.onerror = null;
            playbackAudio.pause();
            if (finishActivePlayback === finish) finishActivePlayback = null;
            if(completed&&fallbackSpeechText)window.SessionHomework?.record({activity:homeworkActivity,label:fallbackSpeechText,entity:String(fallbackSpeechText).trim().includes(' ')?'sentence':'word'});
            resolve(completed);
        };
        // A missing or stalled media response must never leave the play button locked.
        const timeout = setTimeout(() => {
            window.speechSynthesis?.cancel();
            showAudioStatus('تعذر تشغيل الصوت. اضغط على البطاقة للمحاولة مجدداً.');
            finish();
        }, 45000);
        finishActivePlayback = finish;
        playbackAudio.onended = () => finish(true);

        const handleError = error => {
            if (finished || handlingError) return;
            handlingError = true;
            if (error?.name === 'NotAllowedError') {
                showAudioStatus('اضغط على البطاقة لتفعيل الصوت في المتصفح.');
                finish();
                return;
            }
            if ('speechSynthesis' in window && fallbackSpeechText) {
                const utterance = new SpeechSynthesisUtterance(fallbackSpeechText);
                utterance.lang = 'ar-SA';
                utterance.rate = 0.9;
                utterance.onend = () => finish(true);
                utterance.onerror = () => finish();
                speechTimer = setTimeout(() => {
                    if (!finished) window.speechSynthesis.speak(utterance);
                }, 50);
            } else {
                showAudioStatus('تعذر تشغيل الصوت. اضغط على البطاقة للمحاولة مجدداً.');
                finish();
            }
        };
        playbackAudio.onerror = handleError;
        if (!path) { handleError(); return; }
        playbackAudio.src = path;
        try {
            const playPromise = playbackAudio.play();
            if (playPromise) playPromise.catch(handleError);
        } catch (error) { handleError(error); }
    });
}

async function playSlotAudio(item, rowNumber, slotIndex) {
    if (!item) return;
    if (workplaceMetronomePlaying || workplaceWordsPlaying) stopAllPlayback();
    for (const segment of getSlotAudioSegments(item, rowNumber, slotIndex)) {
        const playback = playAudioFilePath(segment.path, segment.text);
        const requestId = playbackRequestId;
        const completed = await playback;
        // An interrupted tap must not resume its second clip over newer playback.
        if (!completed || requestId !== playbackRequestId) return;
    }
}

function playWorkplaces() {
    if (window.SenbSplit?.enabled()) return SenbSplit.playAll();
    return playSentenceSequence();
}

// Enforced strict awaiting sequences: picture, word cards, then optional rhythm.
async function playSentenceSequence() {
    if (state.currentView !== 'workplace') return;
    if (state.deleteMode) applyWorkplaceSettings({ deleteMode: false });
    stopAllPlayback();
    state.isPlayingSequence = true;
    const sequenceToken = sentencePlaybackToken;
    const panel = workplaceElement('workplaceWordFrame').closest('.sentence-workplace');
    const featured = workplaceElement('featuredCard');
    const playBtn = document.getElementById('sequencePlayBtn');
    panel?.setAttribute('aria-busy', 'true');
    if (playBtn) { playBtn.disabled = true; playBtn.setAttribute('aria-busy', 'true'); }
    try {
        if (state.isAdvancedMode && state.featuredAdvancedCard) {
            featured.classList.add('playing-ring');
            const completed = await playAudioFilePath(state.featuredAdvancedCard.soundPath, state.featuredAdvancedCard.title);
            if (!completed || sequenceToken !== sentencePlaybackToken) return;
            featured.classList.remove('playing-ring');
            await new Promise(resolve => setTimeout(resolve, 400));
            if (sequenceToken !== sentencePlaybackToken) return;
        }
        if (!await playWorkplaceWords(undefined, sequenceToken) || sequenceToken !== sentencePlaybackToken) return;
        if (state.showMetronome && !await playWorkplaceMetronome(undefined, sequenceToken)) return;
        return sequenceToken === sentencePlaybackToken;
    } finally {
        if (sequenceToken === sentencePlaybackToken) {
            state.isPlayingSequence = false;
            featured.classList.remove('playing-ring');
            panel?.setAttribute('aria-busy', 'false');
            if (playBtn) { playBtn.disabled = false; playBtn.setAttribute('aria-busy', 'false'); }
        }
    }
}

let beatURL;
function getMetronomeAudioPath() {
    if(beatURL)return beatURL;
    // Taffaha's short wooden click, played by the same cancellable audio owner as speech.
    const rate=22050,length=Math.round(rate*.1),buffer=new ArrayBuffer(44+length*2),view=new DataView(buffer);
    const write=(offset,value)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};
    write(0,'RIFF');view.setUint32(4,36+length*2,true);write(8,'WAVE');write(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);write(36,'data');view.setUint32(40,length*2,true);
    for(let i=0;i<length;i++){const t=i/rate,envelope=Math.min(1,t/.002)*Math.exp(-70*t),sample=(Math.sin(2*Math.PI*1000*t)+.35*Math.sin(2*Math.PI*1800*t))*envelope*.35;view.setInt16(44+i*2,sample*32767,true);}
    beatURL=URL.createObjectURL(new Blob([buffer],{type:'audio/wav'}));return beatURL;
}

// A shared audio element retains the user's playback gesture on mobile browsers.
const playbackAudio = new Audio();
playbackAudio.crossOrigin = 'anonymous';
playbackAudio.preload = 'auto';
let finishActivePlayback = null;
let playbackRequestId = 0;
let sentencePlaybackToken = 0;
let pickerRestoreFocus = null;

function stopAllPlayback() {
    sentencePlaybackToken++;
    document.querySelectorAll('.sentence-workplace[aria-busy]').forEach(panel => panel.setAttribute('aria-busy', 'false'));
    workplaceWordsPlaying=false;
    const frame=workplaceElement('workplaceWordFrame');
    frame?.classList.remove('expression-frame-playing');frame?.setAttribute('aria-busy','false');
    frame?.querySelectorAll('.expression-card-playing').forEach(card=>{card.classList.remove('expression-card-playing');card.setAttribute('aria-busy','false');});
    workplaceMetronomePlaying = false;
    document.querySelectorAll('[data-workplace-beat].lit').forEach(circle => circle.classList.remove('lit'));
    workplaceElement('workplaceMetronomeFrame')?.setAttribute('aria-busy', 'false');
    playbackRequestId++;
    finishActivePlayback?.();
    playbackAudio.pause();
    window.speechSynthesis?.cancel();
    state.isPlayingSequence = false;
    document.querySelectorAll('.playing-ring').forEach(card => card.classList.remove('playing-ring'));
    const playButton = document.getElementById('sequencePlayBtn');
    if (playButton) {
        playButton.disabled = false;
        playButton.setAttribute('aria-busy', 'false');
        playButton.classList.remove('opacity-75', 'cursor-not-allowed', 'scale-95');
    }
}

function updateViewportHeight() {
    // Preserve pinch zoom; only track browser-bar/orientation changes at normal scale.
    if (window.visualViewport && window.visualViewport.scale !== 1) return;
    const height = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty('--app-height', `${height}px`);
}

function openPicker(id) {
    stopAllPlayback();
    pickerRestoreFocus = document.activeElement;
    const modal = document.getElementById(id);
    modal.classList.remove('hidden');
    document.querySelector('header').inert = true;
    document.getElementById('homeView').inert = true;
    document.getElementById('workplaceView').inert = true;
    modal.querySelector('button[aria-label="إغلاق"]').focus();
}

function closePicker(id) {
    document.getElementById(id).classList.add('hidden');
    document.querySelector('header').inert = false;
    document.getElementById('homeView').inert = false;
    document.getElementById('workplaceView').inert = false;
    const previousFocus = pickerRestoreFocus;
    pickerRestoreFocus = null;
    requestAnimationFrame(() => {
        if (previousFocus?.isConnected) previousFocus.focus();
        else if (id === 'categoryModal') {
            workplaceElement(`slot-${state.activePickerSlot.row}-${state.activePickerSlot.index}`)?.focus();
        } else workplaceElement('featuredCard').focus();
    });
}

function makeInteractiveCard(card, label) {
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.setAttribute('aria-label', label);
}

function syncToolbar() {
    for (const [id, enabled] of [
        ['advancedModeBtn', state.isAdvancedMode],
        ['workplaceMetronomeBtn', state.showMetronome],
        ['circlesToggleBtn', state.showColoredCircles]
    ]) document.getElementById(id).setAttribute('aria-pressed', String(enabled));
    workplaceElement('advancedCardContainer').classList.toggle('hidden', !state.isAdvancedMode);
    document.getElementById('advancedModeBtn').classList.toggle('bg-purple-600', state.isAdvancedMode);
    document.getElementById('advancedModeBtn').classList.toggle('text-white', state.isAdvancedMode);
    document.getElementById('advancedModeBtn').classList.toggle('bg-purple-50', !state.isAdvancedMode);
    document.getElementById('advancedModeBtn').classList.toggle('text-purple-700', !state.isAdvancedMode);
    workplaceElement('workplaceMetronomeContainer').classList.toggle('hidden', !state.showMetronome);
    document.getElementById('workplaceMetronomeBtn').classList.toggle('bg-sky-500', state.showMetronome);
    document.getElementById('workplaceMetronomeBtn').classList.toggle('text-white', state.showMetronome);
    document.getElementById('workplaceMetronomeBtn').classList.toggle('bg-slate-100', !state.showMetronome);
    document.getElementById('workplaceMetronomeBtn').classList.toggle('text-slate-700', !state.showMetronome);
    document.getElementById('circlesToggleBtn').classList.toggle('bg-sky-100', state.showColoredCircles);
    document.querySelectorAll('#templateDropdown button').forEach(button => {
        const selected = Number(button.textContent) === state.slotCount;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('bg-sky-100', selected);
    });
}

function showAudioStatus(message) {
    document.getElementById('audioStatus').textContent = message;
}

// Native buttons already support Enter/Space. Supply the same interaction for cards.
document.addEventListener('keydown', event => {
    const modal = document.querySelector('[role="dialog"]:not(.hidden)');
    if (event.key === 'Escape') {
        if (!document.getElementById('templateDropdown').classList.contains('hidden')) { closeTemplateDropdown(true); event.preventDefault(); event.stopImmediatePropagation(); return; }
        if(state.deleteMode&&!modal){state.deleteMode=false;renderWorkplace();document.getElementById('clearBoardBtn').focus();event.preventDefault();return;}
        if (modal) closePicker(modal.id);
        closeTemplateDropdown();
        return;
    }
    if (event.key === 'Tab' && modal) {
        const controls = [...modal.querySelectorAll('button, select, [tabindex="0"]')]
            .filter(control => !control.disabled && control.getClientRects().length);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault(); first?.focus();
        }
    }
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[role="button"]')) {
        event.preventDefault(); event.target.click();
    }
});

for (const id of ['categoryModal', 'advancedModal']) {
    document.getElementById(id).addEventListener('click', event => {
        if (event.target.id === id) closePicker(id);
    });
}
window.addEventListener('resize', updateViewportHeight, { passive: true });
window.visualViewport?.addEventListener('resize', updateViewportHeight, { passive: true });
updateViewportHeight();
installLearnedPickerControls();
initializeWorkplace();
navigateTo('home');
syncToolbar();

document.addEventListener('visibilitychange', () => { if (document.hidden && (workplaceMetronomePlaying || workplaceWordsPlaying || state.isPlayingSequence)) stopAllPlayback(); });
window.addEventListener('pagehide', () => { if (workplaceMetronomePlaying || workplaceWordsPlaying) stopAllPlayback(); });

const workplaceNavigationObserver=new ResizeObserver(updateWorkplaceNavigationPosition);
workplaceNavigationObserver.observe(workplaceElement('workplaceWordFrame'));
workplaceNavigationObserver.observe(workplaceElement('advancedImageStage'));
