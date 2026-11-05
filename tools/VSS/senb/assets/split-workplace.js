/* Two independent sentence boards, sharing the existing grammar and audio engine. */
(() => {
    const clone = value => JSON.parse(JSON.stringify(value));
    const view = document.getElementById('workplaceView');
    const first = view.querySelector('.workplace-content');
    const second = first.cloneNode(true);
    for (const element of second.querySelectorAll('[id]')) element.id = 'second-' + element.id;
    const grid = document.createElement('div'); grid.className = 'split-workplaces';
    const panels = [first, second].map((content, index) => {
        const panel = document.createElement('section'); panel.className = 'sentence-workplace'; panel.dataset.workplace = index;
        panel.setAttribute('aria-label', index ? 'مساحة الجملة الثانية' : 'مساحة الجملة الأولى');
        const controls = document.createElement('div'); controls.className = 'sentence-workplace-controls';
        const select = document.createElement('button'); select.type = 'button'; select.className = 'sentence-workplace-select';
        select.textContent = String(index + 1);
        select.setAttribute('aria-label', index ? 'تشغيل الجملة الثانية كاملة' : 'تشغيل الجملة الأولى كاملة');
        select.onclick = () => { activate(index); void playSentenceSequence(); };
        const choose = document.createElement('button'); choose.type = 'button'; choose.className = 'suite-icon';
        choose.setAttribute('aria-label', index ? 'اختيار الجملة الثانية' : 'اختيار الجملة الأولى'); choose.title = choose.getAttribute('aria-label');
        choose.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 7v10M7 12h10"/></svg>';
        choose.onclick = () => { activate(index); openAdvancedCategoryModal(); };
        controls.append(select, choose); panel.append(controls, content);
        // Capture switches context before a card's existing click/keyboard handler runs.
        for (const event of ['pointerdown', 'focusin', 'click']) panel.addEventListener(event, () => activate(index), true);
        panel.setAttribute('role', 'group');
        panel.addEventListener('click', event => {
            if (!enabled || event.target.closest('button,[role="button"],.workplace-word-frame,.workplace-metronome-frame')) return;
            void playSentenceSequence();
        });
        grid.append(panel); return panel;
    });
    view.append(grid);
    let enabled = false, boards = [], rendering = false, portraitDismissed = false, renderedDeleteMode = false;
    const toggle = document.createElement('button'); toggle.id = 'splitWorkplaceBtn'; toggle.type = 'button'; toggle.className = 'suite-icon';
    toggle.setAttribute('aria-label', 'تقسيم مساحة العمل إلى جملتين'); toggle.title = 'تقسيم مساحة العمل إلى جملتين'; toggle.setAttribute('aria-pressed', 'false');
    toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M12 4v16M5 9h4m6 0h4M5 15h4m6 0h4"/></svg>';
    document.getElementById('workplaceHeaderToolbar').append(toggle);

    const rotate = document.createElement('dialog'); rotate.id = 'splitRotateDialog'; rotate.className = 'split-rotate-dialog'; rotate.setAttribute('aria-labelledby', 'splitRotateTitle');
    rotate.innerHTML = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="14" y="6" width="20" height="36" rx="4" transform="rotate(35 24 24)"/><path d="M5 20a20 20 0 0 1 9-14M5 11v9h9M43 28a20 20 0 0 1-9 14m9-5v-9h-9"/></svg><h2 id="splitRotateTitle">أدر الهاتف</h2><p>استخدم الوضع الأفقي لعرض الجملتين بجانب بعضهما.</p><button type="button">متابعة</button>';
    rotate.querySelector('button').onclick = () => { portraitDismissed = true; rotate.close(); };
    rotate.addEventListener('cancel', () => { portraitDismissed = true; }); document.body.append(rotate);

    function valid(board) { return board && [2, 3, 4, 5, 6].includes(board.slotCount) && Array.isArray(board.row1Slots); }
    function apply(board) {
        for (const field of Object.keys(workplaceBoardSnapshot())) if (Object.hasOwn(board, field)) state[field] = clone(board[field]);
        state.isPlayingSequence = false;
    }
    function newSecond() {
        const item = getAdvancedItemData('2', 1, 2);
        return { ...workplaceBoardSnapshot(), slotCount: 2, advFolder: '2', advSubCatId: 1, isAdvancedMode: true,
            showMetronome: false, showColoredCircles: true, isMultiline: false, featuredAdvancedCard: item,
            row1Slots: Array.from({ length: 6 }, (_, i) => item.slots[i] ? { ...item.slots[i] } : null), row2Slots: Array(6).fill(null),
            row1Covered: Array(6).fill(false), row2Covered: Array(6).fill(false) };
    }
    function snapshot() {
        if (!rendering) boards[activeWorkplace] = workplaceBoardSnapshot();
        return clone({ enabled, active: activeWorkplace, boards });
    }
    function refresh() {
        if (rendering) return;
        boards[activeWorkplace] = workplaceBoardSnapshot();
        if (enabled && renderedDeleteMode !== state.deleteMode) { renderBoth(); return; }
        grid.classList.toggle('is-split', enabled); panels[1].hidden = !enabled;
        toggle.setAttribute('aria-pressed', String(enabled));
    }
    function activate(index) {
        if (rendering || index === activeWorkplace || index === 1 && !enabled) return;
        stopAllPlayback(); boards[activeWorkplace] = workplaceBoardSnapshot(); activeWorkplace = index; apply(boards[index]);
        syncToolbar(); syncWorkplaceDeleteMode(); refresh(); SenbProgress.saveWorkspace(workplaceStateSnapshot());
    }
    function renderBoth() {
        const selected = activeWorkplace; rendering = true;
        for (const index of enabled ? [0, 1] : [0]) { activeWorkplace = index; apply(boards[index]); renderWorkplace({ persist: false }); }
        if (!enabled) { second.querySelector('#second-slotsRow1').replaceChildren(); second.querySelector('#second-workplaceMetronomeFrame').replaceChildren(); }
        activeWorkplace = selected; apply(boards[selected]); syncToolbar(); renderedDeleteMode = state.deleteMode; rendering = false; refresh(); updateWorkplaceNavigationPosition();
    }
    function restore(saved) {
        state.deleteMode = false;
        stopAllPlayback(); enabled = saved?.enabled === true;
        const current = workplaceBoardSnapshot();
        boards = [valid(saved?.boards?.[0]) ? clone(saved.boards[0]) : current, valid(saved?.boards?.[1]) ? clone(saved.boards[1]) : newSecond()];
        activeWorkplace = enabled && saved?.active === 1 ? 1 : 0; portraitDismissed = false;
        if (enabled) shareDisplaySettings();
        renderBoth();
    }
    function shareDisplaySettings() {
        for (const board of boards) for (const field of ['isAdvancedMode', 'showMetronome', 'showColoredCircles']) board[field] = boards[activeWorkplace][field];
    }
    function updateSettings(patch) {
        boards[activeWorkplace] = workplaceBoardSnapshot();
        for (const board of boards) for (const [key, value] of Object.entries(patch)) {
            if (Object.hasOwn(board, key)) board[key] = clone(value);
        }
        renderBoth();
        SenbProgress.saveWorkspace(workplaceStateSnapshot());
    }
    async function playAll() {
        for (const index of [0, 1]) {
            activate(index);
            if (!await playSentenceSequence()) return;
        }
    }
    function orientation() {
        const portraitPhone = matchMedia('(max-width: 600px) and (orientation: portrait)').matches;
        if (!portraitPhone) portraitDismissed = false;
        if (!enabled || state.currentView !== 'workplace' || !portraitPhone) { if (rotate.open) rotate.close(); return; }
        if (!portraitDismissed && !rotate.open && !document.querySelector('dialog[open]')) { window.AppNavigation?.closeSettings(); rotate.showModal(); }
    }
    toggle.onclick = () => {
        stopAllPlayback(); boards[activeWorkplace] = workplaceBoardSnapshot();
        if (enabled) activate(0);
        enabled = !enabled; portraitDismissed = false;
        if (enabled) shareDisplaySettings();
        renderBoth();
        SenbProgress.saveWorkspace(workplaceStateSnapshot()); window.AppNavigation?.closeSettings(); orientation();
    };
    window.SenbSplit = { snapshot, restore, refresh, orientation, activate, updateSettings, playAll, enabled: () => enabled };
    workplaceNavigationObserver.observe(second.querySelector('.workplace-word-frame'));
    workplaceNavigationObserver.observe(second.querySelector('#second-advancedImageStage'));
    window.addEventListener('resize', orientation, { passive: true });
    restore(SenbProgress.workspace()?.splitWorkplace);
})();
