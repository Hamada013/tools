/* Category-based word sets fill the existing workplace; comprehension unlocks the next set. */
document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    const P = window.VocProgress, curriculum = window.VocWordLevels.build(window.VOC_GAME_DATA);
    const items = new Map(CATEGORIES.flatMap(category => category.items.map(item => [P.key(item), item])));
    const paths = {
        sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
        hand:'<path d="M8 12V5a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v9-5a2 2 0 0 1 4 0v9c0 5-5 6-8 6-5 0-7-5-9-8-1-3 2-4 4-1l1 1"/>',
        apple:'<path d="M12 7c-3-4-10-1-9 5s4 11 9 8c5 3 8-2 9-8S15 3 12 7Zm0 0c0-4 2-5 5-5"/>',
        home:'<path d="m3 11 9-8 9 8M5 9v12h14V9M10 21v-7h4v7"/>',
        heart:'<path d="M12 21 3 12C-3 4 8-2 12 6c4-8 15-2 9 6Z"/>',
        paw:'<ellipse cx="12" cy="16" rx="6" ry="5"/><ellipse cx="4" cy="9" rx="2" ry="3"/><ellipse cx="9" cy="5" rx="2" ry="3"/><ellipse cx="15" cy="5" rx="2" ry="3"/><ellipse cx="20" cy="9" rx="2" ry="3"/>',
        tree:'<path d="m12 2-7 8h4l-6 7h7v5h4v-5h7l-6-7h4Z"/>',
        book:'<path d="M12 6C8 2 3 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 2Zm0 0v15"/>',
        shapes:'<path d="m6 2-5 8h10Z"/><circle cx="18" cy="7" r="4"/><rect x="3" y="15" width="8" height="7" rx="1"/><path d="m19 14-4 8h8Z"/>',
        star:'<path d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z"/>',
        chevron:'<path d="m6 9 6 6 6-6"/>',check:'<path d="m5 12 4 4L19 6"/>',
        lock:'<rect x="5" y="10" width="14" height="12" rx="4"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/>'
    };
    const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.star}</svg>`;
    let group = curriculum.categories[0].id, page = 0;
    const trigger = document.createElement('button'); trigger.id = 'workplace-levels'; trigger.type = 'button';
    trigger.className = 'voc-choice voc-icon'; trigger.title = 'مستويات الكلمات'; trigger.setAttribute('aria-label', trigger.title); trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></svg>';
    document.querySelector('button[onclick="app.modals.open(\'template-modal\')"]').after(trigger);
    const dialog = document.createElement('dialog'); dialog.id = 'workplace-levels-dialog'; dialog.className = 'voc-dialog workplace-levels-dialog'; dialog.dir = 'rtl';
    dialog.setAttribute('aria-labelledby', 'workplace-levels-title');
    dialog.innerHTML = '<header class="workplace-levels-heading"><div><h2 id="workplace-levels-title">مستويات الكلمات</h2><p>كل فئة لها بدايتها</p></div><button type="button" class="voc-choice voc-icon" data-levels-close aria-label="إغلاق">×</button></header><div class="word-level-category"><span id="word-level-category-label">الفئة</span><button type="button" id="word-level-group" aria-haspopup="listbox" aria-expanded="false" aria-controls="word-level-categories"><span class="word-category-symbol" aria-hidden="true"></span><span class="word-category-current"><strong></strong><small></small></span><span class="word-category-chevron" aria-hidden="true"></span></button><div id="word-level-categories" role="listbox" aria-labelledby="word-level-category-label" hidden></div></div><p class="word-level-guidance">المستوى التالي يفتح بعد اختبار فهم كامل دون أخطاء.</p><div id="word-level-list" class="word-level-list"></div><nav class="workplace-levels-paging" aria-label="صفحات المستويات"><button type="button" class="voc-choice voc-icon" data-levels-previous aria-label="المستويات السابقة">→</button><p id="word-level-page" role="status" aria-live="polite" dir="ltr"></p><button type="button" class="voc-choice voc-icon" data-levels-next aria-label="المستويات التالية">←</button></nav>';
    document.body.append(dialog);
    const categoryButton = dialog.querySelector('#word-level-group'), categoryList = dialog.querySelector('#word-level-categories');
    const section = () => curriculum.categories.find(category => category.id === group);
    function selectedLevel() {
        const keys = app.state.slotsData.filter(slot => slot.item).map(slot => P.key(slot.item));
        return curriculum.levels.find(level => level.keys.length === keys.length && level.keys.every(key => keys.includes(key)));
    }
    function load(level) {
        if (!P.wordLevelUnlocked(level)) return;
        const pool = level.keys.map(key => items.get(key));
        if (pool.length < 2 || pool.some(item => !item)) { app.showToast('تعذّر تحميل كلمات هذا المستوى.', 'warning'); return; }
        app.exitTestMode(false); app.stopCardPlayback();
        if (app.state.deleteMode) app.setDeleteMode(false);
        P.cancelPlan(); app.state.slotsCount = pool.length;
        app.state.slotsData = pool.map((item, id) => ({ id, item })); app.state.activeCategory = pool[0].catId;
        app.renderSlotsLayout();
        window.dispatchEvent(new CustomEvent('voc-workplace-level-load', { detail: level }));
        app.switchView('workplace'); dialog.close();
        app.showToast(`المستوى ${level.categoryIndex + 1}: ${pool.map(item => item.name).join('، ')}`, 'success');
        document.getElementById('slot-0')?.focus();
    }
    function toggleCategories(open, focus = true) {
        categoryList.hidden = !open; categoryButton.setAttribute('aria-expanded', String(open));
        if (open) {
            renderCategories();
            const selected = categoryList.querySelector('[aria-selected="true"]');
            selected?.focus(); selected?.scrollIntoView({ block: 'nearest' });
        } else if (focus) categoryButton.focus();
    }
    function renderCategories() {
        categoryList.replaceChildren();
        for (const [index, category] of curriculum.categories.entries()) {
            const option = document.createElement('button'); option.type = 'button'; option.className = 'word-category-option'; option.dataset.categoryId = category.id;
            option.setAttribute('role', 'option'); option.setAttribute('aria-selected', String(category.id === group)); option.tabIndex = category.id === group ? 0 : -1;
            const symbol = document.createElement('span'); symbol.className = 'word-category-symbol'; symbol.dataset.tone = index % 4; symbol.innerHTML = icon(category.icon);
            const label = document.createElement('span'); label.className = 'word-category-option-label';
            const title = document.createElement('strong'); title.textContent = category.title;
            const count = document.createElement('small'); count.textContent = `${category.levels.length} مستويات`; label.append(title, count);
            const mark = document.createElement('span'); mark.className = 'word-category-check'; mark.innerHTML = category.id === group ? icon('check') : '';
            option.append(symbol, label, mark);
            option.onclick = () => { group = category.id; page = 0; toggleCategories(false); render(); };
            categoryList.append(option);
        }
    }
    function render() {
        const category = section(), levels = category.levels, pages = Math.max(1, Math.ceil(levels.length / 12));
        page = Math.max(0, Math.min(page, pages - 1));
        categoryButton.querySelector('.word-category-symbol').innerHTML = icon(category.icon);
        categoryButton.querySelector('strong').textContent = category.title;
        categoryButton.querySelector('small').textContent = P.isAdmin() ? `${levels.length} مستويات · Hamada` : `${levels.filter(level => P.wordLevelCompleted(level)).length} من ${levels.length} مكتمل`;
        categoryButton.querySelector('.word-category-chevron').innerHTML = icon('chevron');
        const host = dialog.querySelector('#word-level-list'), current = selectedLevel(); host.replaceChildren();
        for (const level of levels.slice(page * 12, page * 12 + 12)) {
            const unlocked = P.wordLevelUnlocked(level), completed = P.wordLevelCompleted(level);
            const button = document.createElement('button'); button.type = 'button'; button.className = 'word-level-card'; button.dataset.wordLevel = level.id;
            button.disabled = !unlocked; button.dataset.status = completed ? 'completed' : unlocked ? 'available' : 'locked';
            const words = level.keys.map(key => items.get(key).name).join('، ');
            button.setAttribute('aria-label', `المستوى ${level.categoryIndex + 1}: ${words}${!unlocked ? '، مغلق' : completed ? '، مكتمل' : ''}`);
            button.setAttribute('aria-pressed', String(unlocked && current?.id === level.id));
            const top = document.createElement('span'); top.className = 'word-level-card-top';
            const heading = document.createElement('strong'); heading.textContent = `${level.categoryIndex + 1}. ${level.title}`;
            const mark = document.createElement('span'); mark.className = 'word-level-mark'; mark.innerHTML = icon(completed ? 'check' : unlocked ? 'star' : 'lock'); top.append(heading, mark);
            const previews = document.createElement('span'); previews.className = 'word-level-previews';
            for (const key of level.keys) { const img = document.createElement('img'); img.src = items.get(key).image; img.alt = ''; img.loading = 'lazy'; img.onerror = () => { img.onerror = null; img.src = 'images/placeholder.svg'; }; previews.append(img); }
            const names = document.createElement('span'); names.className = 'word-level-words'; names.textContent = words;
            button.append(top, previews, names); button.onclick = () => load(level); host.append(button);
        }
        dialog.querySelector('#word-level-page').textContent = `${page + 1} / ${pages}`;
        dialog.querySelector('[data-levels-previous]').disabled = page === 0;
        dialog.querySelector('[data-levels-next]').disabled = page >= pages - 1;
        host.scrollTop = 0;
    }
    trigger.onclick = () => {
        app.exitTestMode(false);
        const selected = selectedLevel();
        if (selected) { group = selected.categoryId; page = Math.floor(selected.categoryIndex / 12); }
        toggleCategories(false, false); render(); dialog.showModal(); window.AppNavigation?.closeSettings(false, true);
    };
    categoryButton.onclick = () => toggleCategories(categoryList.hidden);
    categoryButton.onkeydown = event => { if (['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); toggleCategories(true); } };
    categoryList.onkeydown = event => {
        const options = [...categoryList.querySelectorAll('[role="option"]')], at = options.indexOf(document.activeElement);
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (at + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
            options.forEach((option, index) => { option.tabIndex = index === next ? 0 : -1; }); options[next].focus();
        } else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); toggleCategories(false); }
        else if (event.key === 'Tab') { event.preventDefault(); toggleCategories(false, false); (event.shiftKey ? categoryButton : dialog.querySelector('.word-level-card:not(:disabled)') || categoryButton).focus(); }
    };
    document.addEventListener('pointerdown', event => { if (!categoryList.hidden && !event.target.closest('.word-level-category')) toggleCategories(false, false); }, { passive: true });
    dialog.addEventListener('close', () => toggleCategories(false, false));
    dialog.querySelector('[data-levels-previous]').onclick = () => { page--; render(); };
    dialog.querySelector('[data-levels-next]').onclick = () => { page++; render(); };
    dialog.querySelector('[data-levels-close]').onclick = () => {
        dialog.close(); (trigger.closest('[hidden]') ? document.querySelector('[data-suite-settings]') : trigger)?.focus();
    };
});
