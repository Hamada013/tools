/* Therapist mode (password 013) and the active child's intervention plan. Shared by كلمة, جملة and مقطع;
 * each app's assets/intervention-goals.js supplies its name, goal bank and progress store.
 * Therapist mode is one lock/open switch, like the articulation app: password 013 opens it, one tap locks it again.
 * It stays open on this device until locked; it shows the plan button (and opens every level where the app has levels).
 * The active child's progress report also shows the plan's goals (InterventionPlan.reportSection).
 * The plan holds goals chosen from the goal bank. When the app's goal bank can estimate a goal from the
 * child's sessions (InterventionGoals.estimate), that estimate builds up or falls back session by session;
 * the therapist's 20/40/60/80% rating, when newer, takes its place. Achieved goals turn green.
 * Reports and the PDF have three parts: red = in progress, green = achieved, yellow = suggested next goals. */
(() => {
    'use strict';
    const G = window.InterventionGoals;
    if (!G) return;
    const APP = G.APP, KEY = APP.therapistKey, PASSWORD = '013';
    // The progress store may load after this script (module apps), so look it up when needed.
    const P = { intervention: () => APP.progress()?.intervention() ?? null, saveIntervention: plan => APP.progress()?.saveIntervention(plan) ?? false };
    const svg = path => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
    const ICONS = {
        close: svg('<path d="m6 6 12 12M18 6 6 18"/>'),
        lock: svg('<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>'),
        open: svg('<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 7.6-1.8M12 14v3"/>'),
        pdf: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 11v6m-3-3 3 3 3-3"/>'),
        plus: svg('<path d="M12 5v14M5 12h14"/>'),
        check: svg('<path d="m5 12 4.5 4.5L19 7"/>'),
        trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>')
    };
    const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const today = () => new Date().toISOString().slice(0, 10);
    const formatDate = iso => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('en-GB').format(d); };
    const digits = value => String(value).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).trim();

    // Remembered on this device (localStorage) like the articulation app; the old tab-only flag still counts once.
    const isActive = () => { try { return localStorage.getItem(KEY) === 'on' || sessionStorage.getItem(KEY) === 'on'; } catch { return false; } };
    function setActive(on) {
        try { on ? localStorage.setItem(KEY, 'on') : localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch {}
        syncHeader();
        window.dispatchEvent(new CustomEvent('voc-therapist-change', { detail: { active: on } }));
    }
    function syncHeader() {
        const on = isActive();
        document.querySelectorAll('[data-therapist]').forEach(button => {
            button.setAttribute('aria-pressed', String(on)); button.classList.add('voc-therapist-switch');
            button.innerHTML = on ? ICONS.open : ICONS.lock;
            const label = on ? 'وضع المعالج مفتوح · اضغط للقفل' : 'وضع المعالج مقفل · اضغط وأدخل الرمز';
            button.setAttribute('aria-label', label); button.title = label;
        });
        document.querySelectorAll('[data-open-plan]').forEach(button => { button.hidden = !on; });
        document.querySelectorAll('[data-plan-report-section]').forEach(section => section.replaceWith(reportSection()));
        if (!on && plan?.open) plan.close();
    }
    const toast = (message, type) => window.app?.showToast?.(message, type);

    // ---- Password and exit dialogs ----
    let gate;
    function openGate() {
        if (!gate) {
            gate = document.createElement('dialog'); gate.className = 'voc-therapist'; gate.dir = 'rtl'; gate.setAttribute('aria-labelledby', 'voc-therapist-title');
            gate.innerHTML = `<header>${ICONS.lock}<h2 id="voc-therapist-title">وضع المعالج</h2><button type="button" class="voc-plan-icon" data-close aria-label="إغلاق" title="إغلاق">${ICONS.close}</button></header>
                <form novalidate><p id="voc-therapist-help">${APP.unlocksLevels ? 'أدخل كلمة مرور المعالج لفتح كل المستويات وخطة التدخل.' : 'أدخل كلمة مرور المعالج لفتح خطة التدخل.'}</p>
                <input type="password" inputmode="numeric" autocomplete="off" maxlength="8" aria-label="كلمة مرور المعالج" aria-describedby="voc-therapist-help voc-therapist-error">
                <p id="voc-therapist-error" role="alert" hidden></p>
                <div class="voc-therapist-actions"><button type="submit" class="primary">دخول</button></div></form>`;
            document.body.append(gate);
            const input = gate.querySelector('input'), error = gate.querySelector('[role=alert]');
            gate.querySelector('[data-close]').onclick = () => gate.close();
            gate.querySelector('form').onsubmit = event => {
                event.preventDefault();
                if (digits(input.value) !== PASSWORD) {
                    error.textContent = 'كلمة المرور غير صحيحة.'; error.hidden = false; input.setAttribute('aria-invalid', 'true'); input.select(); return;
                }
                gate.close(); setActive(true); toast(APP.unlocksLevels ? 'تم تفعيل وضع المعالج: كل المستويات مفتوحة' : 'تم تفعيل وضع المعالج', 'success');
            };
        }
        const input = gate.querySelector('input'); input.value = ''; input.removeAttribute('aria-invalid'); gate.querySelector('[role=alert]').hidden = true;
        gate.showModal(); input.focus();
    }
    // ---- Plan model ----
    function load() {
        const saved = P.intervention() || {};
        // Each child account has its own plan; the name starts as the account's name.
        return { childName: saved.childName || APP.progress()?.active()?.name || '', therapist: saved.therapist || '', start: saved.start || today(),
            goals: Array.isArray(saved.goals) ? saved.goals.filter(goal => G.short(goal.id)) : [], updated: saved.updated || null };
    }
    let model = null;
    function save() {
        model.updated = new Date().toISOString();
        const ok = P.saveIntervention(model);
        const error = plan?.querySelector('[data-plan-error]');
        if (error) { error.hidden = ok !== false; if (ok === false) error.textContent = 'تعذّر حفظ الخطة على هذا الجهاز. تحقق من مساحة التخزين وأعد المحاولة.'; }
    }
    const goalOf = id => model.goals.find(goal => goal.id === id);
    // The app's estimates for the active child (empty when the app has no estimator).
    const estimates = () => { try { return G.estimate?.(APP.progress()?.active()) || {}; } catch { return {}; } };
    let estimated = {};
    /** One goal's current value: the therapist's rating when it is newer than the last measured session, else the app's estimate. */
    function effective(goal, est = estimated[goal?.id]) {
        if (!goal) return { percent: null, by: null, achieved: null, est };
        const manualAt = goal.history?.length ? goal.history.at(-1).date : null;
        const manualFirst = goal.rating != null && (!est?.last || (manualAt && manualAt >= est.last));
        const percent = manualFirst ? goal.rating : est?.percent ?? goal.rating ?? null;
        return { percent, by: percent == null ? null : manualFirst ? 'therapist' : 'app', achieved: goal.achieved || est?.achieved || null, est };
    }
    const stateOf = (goal, est) => { const value = effective(goal, est); return value.achieved ? 'done' : value.percent == null ? 'new' : 'working'; };
    const statusLabel = { new: 'لم يُقيّم', working: 'قيد العمل', done: 'تحقق', suggested: 'مقترح' };
    const estimateLine = est => est ? `<small class="voc-estimate">تقدير التطبيق: ${est.percent}% · من ${est.sessions} ${est.sessions === 1 ? 'جلسة' : est.sessions === 2 ? 'جلستين' : 'جلسات'}${est.achieved ? ` · 3 جلسات متتالية فوق ${G.ACHIEVED}%` : ''}</small>` : '';
    function toggleGoal(id) {
        const index = model.goals.findIndex(goal => goal.id === id);
        if (index >= 0) model.goals.splice(index, 1);
        else model.goals.push({ id, rating: null, history: [], added: today() });
        save(); render();
    }
    // A ready-made plan adds its short-term goals; goals already in the plan keep their ratings.
    function addPlan(planId) {
        const ready = (G.PLANS || []).find(entry => entry.id === planId); if (!ready) return;
        for (const id of ready.goals) if (G.short(id) && !goalOf(id)) model.goals.push({ id, rating: null, history: [], added: today() });
        save(); tab = 'plan'; render(); toast(`أضيفت خطة «${ready.title}»`, 'success');
    }
    // Achievement percentage: the average of each goal's current value; goals without a value count as 0%.
    const percentOf = goals => goals.length ? Math.round(goals.reduce((sum, goal) => sum + (effective(goal).percent || 0), 0) / goals.length) : 0;
    function readyPlans() {
        if (!G.PLANS?.length) return '';
        return `<div class="voc-ready"><h3>خطط جاهزة</h3><p>اضغط «إضافة» لتضع أهداف الخطة كلها، ثم احذف أو أضف ما تريد. كل هدف يتحقق عند ${G.ACHIEVED}%.</p><div class="voc-ready-list">`
            + G.PLANS.map(entry => { const have = entry.goals.filter(id => goalOf(id)).length, all = have === entry.goals.length;
                return `<div class="voc-ready-card"><b>${escape(entry.title)}</b><span>${escape(entry.text)}</span><small>${entry.goals.length} أهداف${have && !all ? ` · ${have} في الخطة` : ''}</small>`
                    + `<button type="button" class="voc-add" data-add-plan="${entry.id}" ${all ? 'disabled aria-pressed="true"' : ''} aria-label="${all ? 'الخطة مضافة' : 'إضافة خطة'}: ${escape(entry.title)}">${all ? ICONS.check + 'مضافة' : ICONS.plus + 'إضافة'}</button></div>`; }).join('')
            + '</div></div>';
    }
    function rate(id, level) {
        const goal = goalOf(id); if (!goal || goal.rating === level) return;
        goal.rating = level; goal.history.push({ date: new Date().toISOString(), rating: level });
        if (level >= G.ACHIEVED && !goal.achieved) goal.achieved = new Date().toISOString();
        if (level < G.ACHIEVED) delete goal.achieved;
        save(); render();
    }

    // ---- Plan dialog ----
    let plan, tab = 'plan';
    function build() {
        plan = document.createElement('dialog'); plan.className = 'voc-plan'; plan.dir = 'rtl'; plan.setAttribute('aria-labelledby', 'voc-plan-title');
        plan.innerHTML = `<header class="voc-plan-head"><h2 id="voc-plan-title">خطة التدخل</h2>
                <button type="button" class="voc-plan-icon" data-plan-pdf aria-label="تنزيل تقرير التقدم PDF" title="تنزيل تقرير التقدم PDF">${ICONS.pdf}</button>
                <button type="button" class="voc-plan-icon" data-plan-close aria-label="إغلاق" title="إغلاق">${ICONS.close}</button></header>
            <div class="voc-plan-body">
                <p data-plan-error role="alert" hidden></p>
                <div class="voc-plan-info">
                    <label>اسم الطفل<input data-field="childName" autocomplete="off" maxlength="60"></label>
                    <label>المعالج<input data-field="therapist" autocomplete="off" maxlength="60"></label>
                    <label>بداية الخطة<input data-field="start" type="date"></label>
                </div>
                <div class="voc-plan-tabs" role="tablist" aria-label="خطة التدخل">
                    <button type="button" role="tab" id="voc-tab-plan" aria-controls="voc-panel-plan" data-tab="plan"></button>
                    <button type="button" role="tab" id="voc-tab-progress" aria-controls="voc-panel-progress" data-tab="progress">التقدم</button>
                    <button type="button" role="tab" id="voc-tab-bank" aria-controls="voc-panel-bank" data-tab="bank">بنك الأهداف</button>
                </div>
                <section role="tabpanel" id="voc-panel-plan" aria-labelledby="voc-tab-plan" data-panel="plan"></section>
                <section role="tabpanel" id="voc-panel-progress" aria-labelledby="voc-tab-progress" data-panel="progress"></section>
                <section role="tabpanel" id="voc-panel-bank" aria-labelledby="voc-tab-bank" data-panel="bank"></section>
            </div>`;
        document.body.append(plan);
        plan.querySelector('[data-plan-close]').onclick = () => plan.close();
        plan.querySelector('[data-plan-pdf]').onclick = download;
        plan.addEventListener('click', event => { if (event.target === plan) plan.close(); });
        for (const input of plan.querySelectorAll('[data-field]')) input.addEventListener('change', () => { model[input.dataset.field] = input.value.trim(); save(); });
        const tabs = [...plan.querySelectorAll('[role=tab]')];
        for (const button of tabs) {
            button.onclick = () => { tab = button.dataset.tab; render(); };
            button.onkeydown = event => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault(); const index = tabs.indexOf(button);
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowLeft' ? 1 : -1) + tabs.length) % tabs.length;
                tab = tabs[next].dataset.tab; render(); tabs[next].focus();
            };
        }
        plan.addEventListener('click', event => {
            const button = event.target.closest('button'); if (!button || !plan.contains(button)) return;
            // Re-rendering replaces the buttons; keep keyboard focus on the equivalent control.
            const refocus = selector => plan.querySelector(selector)?.focus();
            if (button.dataset.toggle) { toggleGoal(button.dataset.toggle); refocus(`[data-toggle="${button.dataset.toggle}"]`); }
            else if (button.dataset.rate) { rate(button.dataset.rate, Number(button.dataset.level)); refocus(`[data-rate="${button.dataset.rate}"][data-level="${button.dataset.level}"]`); }
            else if (button.dataset.remove) { toggleGoal(button.dataset.remove); refocus('#voc-tab-plan'); }
            else if (button.dataset.addPlan) { addPlan(button.dataset.addPlan); refocus('#voc-tab-plan'); }
            else if (button.dataset.goBank !== undefined) { tab = 'bank'; render(); plan.querySelector('#voc-tab-bank').focus(); }
        });
    }
    const sourceLine = goal => `<p class="voc-goal-sources">المصادر: ${goal.sources.map(id => escape(G.SOURCES[id].label.split(':')[0].split('(')[0].trim())).join(' · ')}</p>`;
    function render() {
        const counts = { total: model.goals.length, done: model.goals.filter(goal => stateOf(goal) === 'done').length };
        counts.working = counts.total - counts.done;
        for (const input of plan.querySelectorAll('[data-field]')) if (document.activeElement !== input) input.value = model[input.dataset.field] || '';
        plan.querySelector('#voc-tab-plan').textContent = `الخطة (${counts.total})`;
        for (const button of plan.querySelectorAll('[role=tab]')) { const on = button.dataset.tab === tab; button.setAttribute('aria-selected', String(on)); button.tabIndex = on ? 0 : -1; }
        for (const panel of plan.querySelectorAll('[role=tabpanel]')) panel.hidden = panel.dataset.panel !== tab;
        plan.querySelector('[data-plan-pdf]').disabled = !counts.total;

        const planPanel = plan.querySelector('[data-panel=plan]');
        if (!counts.total) planPanel.innerHTML = `<div class="voc-plan-empty">لم تُضف أهداف بعد.<br>اختر خطة جاهزة أو أهدافاً من بنك الأهداف.<br><button type="button" class="voc-add" data-go-bank>${ICONS.plus}بنك الأهداف</button></div>` + readyPlans();
        else planPanel.innerHTML = `<div class="voc-plan-summary"><div><strong>${percentOf(model.goals)}%</strong><span>إنجاز الخطة</span></div><div><strong>${counts.done}</strong><span>تحقق (${G.ACHIEVED}%)</span></div><div><strong>${counts.working}</strong><span>قيد العمل</span></div></div>`
            + G.GOALS.filter(goal => goal.short.some(item => goalOf(item.id))).map(goal => `<article class="voc-goal"><h3>الهدف بعيد المدى: ${escape(goal.title)} <span class="voc-goal-percent" dir="ltr">${percentOf(goal.short.map(item => goalOf(item.id)).filter(Boolean))}%</span></h3><p>${escape(goal.text)}</p>`
                + goal.short.filter(item => goalOf(item.id)).map(item => {
                    const saved = goalOf(item.id), state = stateOf(saved), value = effective(saved);
                    return `<div class="voc-short" data-state="${state}"><div class="voc-short-text">${escape(item.text)}<small>${escape(item.where)}</small>${estimateLine(value.est)}</div>
                        <div class="voc-short-tools"><span class="voc-status" data-state="${state}">${value.percent == null ? statusLabel[state] : `${value.percent}% · ${statusLabel[state]}`}</span><button type="button" class="voc-plan-icon" data-remove="${item.id}" aria-label="حذف الهدف من الخطة: ${escape(item.text)}" title="حذف من الخطة">${ICONS.trash}</button></div>
                        <div class="voc-rating" role="group" aria-label="نسبة الإنجاز">${G.LEVELS.map(level => `<button type="button" data-rate="${item.id}" data-level="${level}" aria-pressed="${saved.rating === level}">${level}%</button>`).join('')}</div></div>`;
                }).join('') + '</article>').join('');

        plan.querySelector('[data-panel=progress]').innerHTML = counts.total ? progressGroups(model.goals) : `<div class="voc-plan-empty">أضف أهدافاً إلى الخطة لترى تقدّمها هنا.</div>`;
        plan.querySelector('[data-panel=bank]').innerHTML = readyPlans() + G.GOALS.map(goal => `<article class="voc-goal"><h3>${escape(goal.title)}</h3><p>الهدف بعيد المدى: ${escape(goal.text)}</p>`
            + goal.short.map(item => { const added = !!goalOf(item.id); return `<div class="voc-short"><div class="voc-short-text">${escape(item.text)}<small>${escape(item.where)}</small></div>
                <button type="button" class="voc-add" data-toggle="${item.id}" aria-pressed="${added}" aria-label="${added ? 'إزالة من الخطة' : 'إضافة إلى الخطة'}: ${escape(item.text)}">${added ? ICONS.check + 'في الخطة' : ICONS.plus + 'إضافة'}</button></div>`; }).join('')
            + sourceLine(goal) + '</article>').join('');
    }
    function open() {
        if (!isActive()) { openGate(); return; }
        if (!plan) build();
        model = load(); estimated = estimates(); tab = model.goals.length ? 'plan' : 'bank'; render();
        window.dispatchEvent(new Event(`${APP.id}-profile-open`)); window.dispatchEvent(new Event('suite-navigation-open'));
        plan.showModal(); plan.querySelector('[data-plan-close]').focus();
    }

    // ---- PDF progress report ----
    let pdfLibrary;
    const loadPDF = () => pdfLibrary ||= new Promise((resolve, reject) => {
        if (window.jspdf) { resolve(window.jspdf.jsPDF); return; }
        const script = document.createElement('script'); script.src = 'assets/vendor/jspdf.umd.min.js';
        script.onload = () => resolve(window.jspdf.jsPDF); script.onerror = () => { pdfLibrary = null; reject(Error('PDF library unavailable')); }; document.head.append(script);
    });
    async function pdfFor(report) {
        const jsPDF = await loadPDF(); await document.fonts.load('700 32px Cairo'); await document.fonts.load('400 24px Cairo'); await document.fonts.ready;
        const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
        doc.setProperties({ title: `${APP.name} - تقرير خطة التدخل - ${report.childName || ''}`, creator: APP.name });
        const width = 1240, height = 1754, margin = 80, pages = [];
        let canvas, c, y;
        const font = (size, weight = 700) => { c.font = `${weight} ${size}px Cairo`; };
        // Direction follows the text itself (Arabic or not); alignment stays as requested.
        const arabic = str => /[\u0600-\u06FF]/.test(str);
        const text = (str, x, yy, size = 26, color = '#18394b', align = 'right', weight = 700) => { font(size, weight); c.fillStyle = color; c.textAlign = align; c.direction = arabic(str) ? 'rtl' : 'ltr'; c.textBaseline = 'middle'; c.fillText(String(str), x, yy); };
        const lines = (str, maxWidth, size, weight = 700) => {
            font(size, weight); const out = []; let line = '';
            for (const word of String(str).split(/\s+/)) { const next = line ? `${line} ${word}` : word; if (c.measureText(next).width > maxWidth && line) { out.push(line); line = word; } else line = next; }
            if (line) out.push(line); return out;
        };
        const paragraph = (str, x, maxWidth, size, color, weight = 700, lineHeight = 1.55) => { const rtl = arabic(str); for (const line of lines(str, maxWidth, size, weight)) { text(line, rtl ? x : x - maxWidth, y + size * .6, size, color, rtl ? 'right' : 'left', weight); y += size * lineHeight; } };
        const box = (x, yy, w, h, fill, stroke) => { c.beginPath(); c.roundRect(x, yy, w, h, 20); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2; c.stroke(); } };
        const newPage = (title, subtitle) => {
            canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; c = canvas.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, width, height); pages.push(canvas);
            box(margin, 60, width - margin * 2, 180, '#f1f8fc');
            text(`${APP.name} · تقرير تقدّم خطة التدخل`, width - margin - 28, 105, 24, '#0284c7');
            text(report.childName || 'الطفل', width - margin - 28, 158, 36);
            text([report.therapist && `المعالج: ${report.therapist}`, report.start && `بداية الخطة: ${formatDate(report.start)}`].filter(Boolean).join('   ·   '), width - margin - 28, 210, 22, '#587082', 'right', 600);
            text(formatDate(report.date), margin + 28, 105, 24, '#587082', 'left');
            y = 290;
            if (title) { text(title, width - margin, y, 34, '#18394b'); y += 46; }
            if (subtitle) { text(subtitle, width - margin, y, 22, '#587082', 'right', 600); y += 46; }
        };
        const ensure = (needed, title) => { if (y + needed > height - 110) newPage(title); };
        const COLORS = { working: ['#fdf3f2', '#f2c4bf', '#c0392b'], done: ['#f2fbf5', '#bfe5cd', '#2f7a52'], suggested: ['#fffbeb', '#f6dfa0', '#a16207'] };
        const goalBlock = (entry, achieved, goal) => {
            const kind = entry.suggested ? 'suggested' : achieved ? 'done' : 'working', [fill, stroke, ink] = COLORS[kind];
            const textWidth = width - margin * 2 - 60, rows = lines(entry.text, textWidth, 25, 600);
            const steps = [...entry.history.map(step => ({ date: step.date, text: `${step.rating}%` })), ...(entry.est?.history || []).map(step => ({ date: step.date, text: `${step.percent}% (تقدير)` }))].sort((a, b) => a.date < b.date ? -1 : 1).slice(-6);
            const historyText = entry.suggested ? 'هدف مقترح للمرحلة القادمة' : steps.length ? steps.map(step => `${step.text} ${formatDate(step.date)}`).join('  ←  ') : 'لم يُقيّم بعد';
            const historyRows = lines(entry.suggested ? historyText : `التقييمات: ${historyText}`, textWidth, 20, 600);
            const blockHeight = 40 + rows.length * 39 + 34 + 62 + historyRows.length * 31 + 24;
            // A goal that moves to a new page keeps its long-term goal heading.
            if (y + blockHeight + 10 > height - 110) { newPage(`${TITLES[kind]} (تابع)`); text(`الهدف بعيد المدى: ${goal.title} (تابع)`, width - margin, y + 14, 27, '#0369a1'); y += 52; }
            const top = y; box(margin, top, width - margin * 2, blockHeight, fill, stroke);
            y = top + 26; paragraph(entry.text, width - margin - 30, textWidth, 25, '#18394b', 600, 1.55);
            text(entry.where, width - margin - 30, y + 12, 19, '#7b8f9d', 'right', 600); y += 40;
            // Four-step bar: 20, 40, 60, 80%.
            const barWidth = 520, segment = (barWidth - 30) / 4, barRight = width - margin - 30;
            G.LEVELS.forEach((level, index) => {
                const x = barRight - (index + 1) * segment - index * 10, filled = entry.percent != null && level <= entry.percent;
                box(x, y, segment, 26, filled ? ink : '#eaf0f4');
                text(`${level}%`, x + segment / 2, y + 44, 17, '#587082', 'center', 600);
            });
            text(entry.suggested ? 'مقترح' : entry.percent == null ? 'لم يُقيّم' : achieved ? `تحقق ${entry.percent}%${entry.achieved ? ` · ${formatDate(entry.achieved)}` : ''}` : `الآن: ${entry.percent}%${entry.by === 'app' ? ' (تقدير)' : ''}`,
                margin + 30, y + 14, 24, ink, 'left');
            y += 70;
            for (const row of historyRows) { text(row, width - margin - 30, y + 10, 20, '#587082', 'right', 600); y += 31; }
            y = top + blockHeight + 18;
        };
        const TITLES = { working: 'أهداف قيد العمل', done: 'أهداف تحققت', suggested: 'أهداف مقترحة' };
        const section = (entries, achieved) => {
            for (const goal of G.GOALS) {
                const items = entries.filter(entry => entry.long.id === goal.id); if (!items.length) continue;
                ensure(140, `${TITLES[items[0].suggested ? 'suggested' : achieved ? 'done' : 'working']} (تابع)`);
                text(`الهدف بعيد المدى: ${goal.title}`, width - margin, y + 14, 27, '#0369a1'); y += 46;
                paragraph(goal.text, width - margin, width - margin * 2, 22, '#587082', 600, 1.5); y += 10;
                for (const entry of items) goalBlock(entry, achieved, goal);
                y += 10;
            }
        };
        const reportEstimates = report.estimates || {};
        const entries = report.goals.map(goal => { const value = effective(goal, reportEstimates[goal.id]); return { ...G.short(goal.id), ...goal, history: goal.history || [], percent: value.percent, by: value.by, achieved: value.achieved, est: value.est }; });
        const done = entries.filter(entry => entry.achieved), working = entries.filter(entry => !done.includes(entry));
        const suggested = (G.suggest?.(report.goals.map(goal => goal.id), done.map(entry => entry.id)) || []).map(id => ({ ...G.short(id), id, history: [], percent: null, suggested: true }));

        newPage('أهداف قيد العمل', `الأهداف التي لم تتحقق بعد، مع النسبة الحالية وتاريخ التقييمات. «تقدير» = محسوب من جلسات التطبيق.`);
        const metrics = [[`${entries.length ? Math.round(entries.reduce((sum, entry) => sum + (entry.percent || 0), 0) / entries.length) : 0}%`, `إنجاز الخطة · ${entries.length} أهداف`, '#0284c7'], [done.length, `تحققت (${G.ACHIEVED}%)`, '#2f7a52'], [working.length, 'قيد العمل', '#c0392b']];
        metrics.forEach(([number, name, color], index) => { const x = width - margin - 340 - index * 370; box(x, y, 340, 120, '#f7fafc'); text(number, x + 170, y + 42, 42, color, 'center'); text(name, x + 170, y + 92, 23, '#587082', 'center', 600); });
        y += 160;
        if (working.length) section(working, false); else { text('كل أهداف الخطة تحققت.', width - margin, y + 14, 25, '#2f7a52'); y += 50; }

        newPage('أهداف تحققت', `أهداف بلغت ${G.ACHIEVED}% (تقييم المعالج، أو 3 جلسات متتالية في التطبيق) وتُعدّ منجزة، مع تاريخ تحققها.`);
        if (done.length) section(done, true); else { text('لا توجد أهداف محققة بعد.', width - margin, y + 14, 25, '#587082'); y += 50; }
        if (suggested.length) { newPage('أهداف مقترحة', 'الخطوة التالية بعد الأهداف المحققة، لم تُضف إلى الخطة بعد.'); section(suggested, false); }

        const used = [...new Set(entries.flatMap(entry => entry.long.sources))];
        newPage('المراجع', `معيار الإنجاز ${G.ACHIEVED}% محدد في هذه الخطة، وليس معياراً منشوراً.`);
        for (const id of used) { const source = G.SOURCES[id]; ensure(140); paragraph(source.label, width - margin, width - margin * 2, 21, '#18394b', 600, 1.5); text(source.url, margin, y + 10, 18, '#0369a1', 'left', 600); y += 48; }

        pages.forEach((page, index) => {
            canvas = page; c = page.getContext('2d'); text(`${index + 1} / ${pages.length}`, width / 2, height - 55, 20, '#587082', 'center');
            if (index) doc.addPage(); doc.addImage(page.toDataURL('image/jpeg', .94), 'JPEG', 0, 0, 210, 297);
        });
        return doc;
    }
    let busy = false;
    async function download() {
        if (busy || !model?.goals.length) return;
        busy = true; const button = plan.querySelector('[data-plan-pdf]'); button.disabled = true;
        try {
            const report = { ...model, estimates: estimated, date: new Date().toISOString() };
            const doc = await pdfFor(report);
            doc.save(`خطة-التدخل-${(report.childName || 'الطفل').replace(/[^\p{L}\p{N}_-]/gu, '_')}-${formatDate(report.date).replaceAll('/', '-')}.pdf`);
        } catch {
            const error = plan.querySelector('[data-plan-error]'); error.textContent = 'تعذّر إنشاء التقرير. أعد المحاولة أو نزّل التطبيق للاستخدام دون إنترنت.'; error.hidden = false;
        } finally { busy = false; button.disabled = !model.goals.length; }
    }

    // ---- Progress: the plan's goals in three groups (red in progress, green achieved, yellow suggested) ----
    function progressGroups(goals) {
        const percent = list => list.length ? Math.round(list.reduce((sum, goal) => sum + (effective(goal).percent || 0), 0) / list.length) : 0;
        const doneGoals = goals.filter(goal => stateOf(goal) === 'done'), workingGoals = goals.filter(goal => !doneGoals.includes(goal));
        const suggestedIds = G.suggest?.(goals.map(goal => goal.id), doneGoals.map(goal => goal.id)) || [];
        const row = (item, state, value) => `<div class="voc-plan-report-row" data-state="${state}"><span class="voc-short-text">${escape(item.text)}${state === 'suggested' ? '' : estimateLine(value?.est)}</span>`
            + (state === 'suggested' ? '' : `<span class="voc-plan-report-bar" role="img" aria-label="${value.percent == null ? 'لم يُقيّم' : value.percent + '%'}"><i style="width:${value.percent ?? 0}%" data-state="${state}"></i></span>`)
            + `<span class="voc-status" data-state="${state}">${state === 'suggested' ? statusLabel.suggested : value.percent == null ? statusLabel.new : `${value.percent}% · ${statusLabel[state]}`}</span></div>`;
        const group = (state, title, list, empty) => `<div class="voc-plan-group" data-state="${state}"><h4>${title} <small>(${list.length})</small></h4>${list.length ? list.map(entry => { const item = G.short(entry.id); return row(item, state, state === 'suggested' ? null : effective(entry)); }).join('') : `<p class="voc-plan-group-empty">${empty}</p>`}</div>`;
        return `<div class="voc-plan-summary"><div><strong>${percent(goals)}%</strong><span>إنجاز الخطة</span></div><div><strong>${doneGoals.length} / ${goals.length}</strong><span>أهداف تحققت</span></div></div>`
            + group('working', 'نعمل عليها الآن', workingGoals, 'لا توجد أهداف قيد العمل.')
            + group('done', 'تحققت', doneGoals, `لم يتحقق هدف بعد (${G.ACHIEVED}% في 3 جلسات متتالية، أو تقييمك ${G.ACHIEVED}%).`)
            + group('suggested', 'مقترحة للمرحلة القادمة', suggestedIds.map(id => ({ id })), 'تظهر الأهداف المقترحة بعد تحقق أول هدف.');
    }

    // ---- Goals inside the child's progress report ----
    // Long-term goals with their chosen short-term goals, the latest rating and status, and the goals PDF.
    function reportSection() {
        const section = document.createElement('section'); section.className = 'voc-plan-report'; section.dataset.planReportSection = '';
        // Goals, plans and percentages stay locked behind the therapist switch.
        if (!isActive()) { section.hidden = true; return section; }
        section.setAttribute('aria-labelledby', `voc-plan-report-${APP.id}`);
        const saved = load(), goals = saved.goals;
        const head = `<header><h3 id="voc-plan-report-${APP.id}">أهداف خطة التدخل</h3>${goals.length ? `<button type="button" class="voc-plan-icon" data-plan-report-pdf aria-label="تنزيل تقرير الأهداف PDF" title="تنزيل تقرير الأهداف PDF">${ICONS.pdf}</button>` : ''}</header>`;
        if (!goals.length) {
            section.innerHTML = head + `<p class="voc-plan-report-empty">لا توجد خطة تدخل لهذا الطفل بعد. أضف الأهداف من زر خطة التدخل.</p>`;
            return section;
        }
        estimated = estimates();
        section.innerHTML = head + progressGroups(goals);
        section.querySelector('[data-plan-report-pdf]').onclick = async event => {
            const button = event.currentTarget; button.disabled = true;
            try { const report = { ...load(), estimates: estimates(), date: new Date().toISOString() }; const doc = await pdfFor(report); doc.save(`أهداف-${(report.childName || 'الطفل').replace(/[^\p{L}\p{N}_-]/gu, '_')}-${formatDate(report.date).replaceAll('/', '-')}.pdf`); }
            catch { toast('تعذّر إنشاء تقرير الأهداف. أعد المحاولة.', 'error'); }
            finally { button.disabled = false; }
        };
        return section;
    }

    function init() {
        document.querySelectorAll('[data-therapist]').forEach(button => { button.onclick = () => { if (isActive()) { setActive(false); toast('تم قفل وضع المعالج', 'info'); } else openGate(); }; });
        document.querySelectorAll('[data-open-plan]').forEach(button => { button.onclick = open; });
        syncHeader();
    }
    // The child's goals report as a PDF document, for the report's print window.
    const reportPdf = () => pdfFor({ ...load(), estimates: estimates(), date: new Date().toISOString() });
    window.InterventionPlan = { open, isActive, reportSection, reportPdf, pdfFor: report => pdfFor(report), model: () => model && JSON.parse(JSON.stringify(model)) };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
