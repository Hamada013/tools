/* Device-local sentence/word reports and a reusable Arabic home-play note. */
((root) => {
    'use strict';
    const periods = { all: 'منذ إنشاء الحساب', halfyear: 'آخر 6 أشهر', quarter: 'آخر 3 أشهر', month: 'آخر 30 يوماً', week: 'آخر 7 أيام', day: 'اليوم' };
    const domains = { receptive: 'الفهم', expressive: 'التعبير' };
    const presentations = { advanced: 'الصور المتكاملة', slots: 'بطاقات الكلمات' };
    const score = () => ({ correct: 0, total: 0 });
    const percent = value => value?.total > 0 ? Math.round(value.correct / value.total * 100) : null;
    const dateText = value => new Date(value).toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' });
    function periodStart(period, now = new Date()) {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        if (period === 'all') return new Date(0);
        if (period === 'week') start.setDate(start.getDate() - 6);
        if (period === 'month') start.setDate(start.getDate() - 29);
        if (period === 'quarter' || period === 'halfyear') {
            const day = start.getDate();
            start.setDate(1);
            start.setMonth(start.getMonth() - (period === 'quarter' ? 3 : 6));
            start.setDate(Math.min(day, new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()));
        }
        return start;
    }
    function normalized(record, session) {
        const rawTotal = Math.max(0, Number(record.total) || 0);
        const total = Number.isFinite(rawTotal) ? rawTotal : 0;
        return {
            key: String(record.key || record.title || ''), title: String(record.title || record.key || ''),
            entity: record.entity === 'word' ? 'word' : 'sentence',
            domain: record.domain || session.domain,
            presentation: record.presentation === 'advanced' ? 'advanced' : 'slots',
            total,
            correct: Math.max(0, Math.min(total, Number(record.correct) || 0))
        };
    }
    const chart = () => root.AcquisitionCharts || (typeof module !== 'undefined' ? require('./acquisition-charts.js') : null);
    const sentenceCatalog = () => typeof ADVANCED_CATEGORIES !== 'undefined' ? ADVANCED_CATEGORIES : [2,3,4,5,6].map(folder => ({folder: String(folder), name: `جمل من ${folder} كلمات`, subcategories: Array.from({length:8},(_,i)=>({id:i+1,name:`المجموعة ${i+1}`}))}));
    function acquisition(sessions, bank = sentenceCatalog()) {
        const types = new Map(bank.map(type => [Number(type.folder), {...type, groups: new Map(type.subcategories.map(group => [Number(group.id), {key: `${type.folder}/${group.id}`, label: `${group.id}. ${group.name}`, shortLabel: `المجموعة ${group.id}`, total:24, worked:new Set(), latest:new Map()}]))}]));
        const custom = {key:'custom',label:'جمل مخصّصة',total:0,worked:new Set(),latest:new Map()};
        for (const session of [...sessions].sort((a,b)=>new Date(a.date)-new Date(b.date))) {
            const scores = new Map();
            for (const raw of session.records || []) {
                const record = normalized(raw,session); if(record.entity !== 'sentence' || !record.key) continue;
                const match = /^(?:s:)?([2-6])\/([1-8])\/(\d+)$/.exec(record.key);
                const canonical = match && Number(match[3])>=1 && Number(match[3])<=24 ? `${match[1]}/${match[2]}/${Number(match[3])}` : null;
                const group = canonical ? types.get(Number(match[1]))?.groups.get(Number(match[2])) : custom;
                if(!group)continue;
                group.worked.add(canonical || record.key);
                if(session.kind !== 'assessment' || session.partial || !Object.hasOwn(domains,record.domain) || !record.total)continue;
                const key = `${canonical || record.key}:${record.domain}`;
                if(!scores.has(key))scores.set(key,{group,domain:record.domain,correct:0,total:0});
                const value=scores.get(key);value.correct+=record.correct;value.total+=record.total;
            }
            for(const [key,value] of scores)value.group.latest.set(key,value);
        }
        const toRow = group => {
            const row={key:group.key,label:group.label,shortLabel:group.shortLabel,total:group.total,worked:group.worked.size};
            for(const domain of Object.keys(domains)){
                const tested=[...group.latest.values()].filter(value=>value.domain===domain);
                row[domain]=chart().rate(tested.filter(value=>value.correct/value.total>=.8).length,group.total,tested.length);
            }return row;
        };
        const rows=[];
        for(const type of types.values()){
            const groups=[...type.groups.values()].filter(group=>group.worked.size).map(toRow);
            if(!groups.length)continue;
            const row={key:String(type.folder),label:type.name,shortLabel:`${type.folder} كلمات`,total:type.groups.size*24,worked:groups.reduce((sum,g)=>sum+g.worked,0),groups};
            for(const domain of Object.keys(domains))row[domain]=chart().rate(groups.reduce((sum,g)=>sum+g[domain].acquired,0),row.total,groups.reduce((sum,g)=>sum+g[domain].tested,0));
            rows.push(row);
        }
        custom.total=custom.worked.size;
        return {types:rows,groups:rows.flatMap(type=>type.groups.map(group=>({...group,typeLabel:type.label}))),custom:custom.total?toRow(custom):null};
    }
    function summarize(input, period = 'all', now = new Date()) {
        const list = Array.isArray(input) ? input : input?.senb?.sessions || input?.sessions || [];
        const title = Array.isArray(input) ? '' : input?.name || input?.childName || '';
        period = Object.hasOwn(periods, period) ? period : 'all';
        const start = periodStart(period, now), end = new Date(now);
        const sessions = list.filter(session => { const date = new Date(session.date); return date >= start && date <= end; });
        const totals = { receptive: score(), expressive: score() };
        const groups = Object.fromEntries(Object.keys(presentations).map(key => [key, { key, label: presentations[key], receptive: score(), expressive: score() }]));
        const details = new Map(), targets = new Map();
        let assessmentCount = 0, practiceCount = 0, partialCount = 0;
        for (const session of sessions) {
            if (session.partial) partialCount++;
            else if (session.kind === 'assessment') assessmentCount++;
            else practiceCount++;
            for (const raw of session.records || []) {
                const record = normalized(raw, session);
                if (!record.key) continue;
                const targetKey = `${record.entity}:${record.key}`;
                targets.set(targetKey, record.entity);
                const detailKey = `${targetKey}:${record.presentation}`;
                if (!details.has(detailKey)) details.set(detailKey, { ...record, receptive: score(), expressive: score(), practice: 0 });
                const detail = details.get(detailKey);
                if (session.kind !== 'assessment' || session.partial || !Object.hasOwn(domains, record.domain)) { detail.practice++; continue; }
                const scoredTargets = record.entity === 'word' ? [detail[record.domain]] : [totals[record.domain], groups[record.presentation][record.domain], detail[record.domain]];
                for (const target of scoredTargets) {
                    target.total += record.total;
                    target.correct += record.correct;
                }
            }
        }
        return {
            title, period, periodLabel: periods[period], date: end.toISOString(), from: period === 'all' ? null : start.toISOString(),
            sessionCount: sessions.length, assessmentCount, practiceCount, partialCount,
            sentenceCount: [...targets.values()].filter(entity => entity === 'sentence').length,
            wordCount: [...targets.values()].filter(entity => entity === 'word').length,
            domains: totals, presentations: Object.values(groups),
            details: [...details.values()].sort((a, b) => a.entity.localeCompare(b.entity) || a.title.localeCompare(b.title, 'ar') || a.presentation.localeCompare(b.presentation)),
            sessions, acquisition: acquisition(sessions)
        };
    }
    function lessonText(name, context = {}) {
        const report = summarize(context.sessions || [], 'all', new Date(context.date || Date.now()));
        const chosen = new Map();
        for (const item of context.sentences || []) {
            const target = typeof item === 'string' ? { key: item, title: item } : { ...item, key: item?.key || (item?.folder && item?.subCatId && item?.itemNum ? `${item.folder}/${item.subCatId}/${item.itemNum}` : item?.title) };
            if (target?.title) chosen.set(`${target.entity || 'sentence'}:${target.key || target.title}`, { key: target.key || target.title, title: target.title, entity: target.entity || 'sentence' });
        }
        for (const detail of report.details) if (!chosen.has(`${detail.entity}:${detail.key}`)) chosen.set(`${detail.entity}:${detail.key}`, detail);
        const items = [...chosen.values()];
        const sentences = items.filter(item => item.entity !== 'word').map(item => item.title);
        const words = items.filter(item => item.entity === 'word').map(item => item.title);
        const lines = [`مرحباً، أنا ${name || 'طفلكم'}! 🌷`];
        if (sentences.length) lines.push(`اليوم اشتغلت على هالجمل: ${sentences.join('، ')}.`);
        if (words.length) lines.push(`واشتغلت على هالكلمات: ${words.join('، ')}.`);
        if (!items.length) lines.push('اليوم تدرّبت على الكلام والفهم خلال اللعب.');
        for (const [domain, label] of Object.entries(domains)) {
            lines.push('', `${label}:`);
            const good = [], practice = [], unseen = [];
            for (const item of items) {
                const rows = report.details.filter(detail => detail.key === item.key && detail.entity === item.entity);
                const total = rows.reduce((sum, row) => sum + row[domain].total, 0);
                const correct = rows.reduce((sum, row) => sum + row[domain].correct, 0);
                if (!total) unseen.push(item.title);
                else if (correct / total >= .8) good.push(item.title);
                else practice.push(item.title);
            }
            if (good.length) lines.push(`كنت شاطر بـ: ${good.join('، ')}.`);
            if (practice.length) lines.push(`ولسه عم أتعلّم وبحتاج مساعدتكم بـ: ${practice.join('، ')}.`);
            if (unseen.length) lines.push(`ما سجّلنا نتيجة بهالمهارة لـ: ${unseen.join('، ')}.`);
        }
        const activity = root.SessionHomework?.homeActivity || (typeof module !== 'undefined' ? require('./session-homework.js').homeActivity : null);
        lines.push('', 'ماما وبابا، خلّونا نلعب شوي بالبيت! 💛', activity('senb', items.map(item=>({label:item.title,entity:item.entity}))), 'اعطوني وقت أنفّذ أو أشير؛ مو ضروري أحكي.');
        return lines.join('\n');
    }
    const api = { periods, domains, presentations, percent, periodStart, summarize, acquisition, lessonText };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (!root.document) return;
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const svg = paths => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
    const icons = {
        report: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 17v-3m4 3v-6m4 6v-4"/>'),
        family: svg('<circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="12" cy="14" r="2.5"/><path d="M2 21v-6a4 4 0 0 1 6-3.5M22 21v-6a4 4 0 0 0-6-3.5M8 22v-2a4 4 0 0 1 8 0v2"/>'),
        close: svg('<path d="m6 6 12 12M18 6 6 18"/>'),
        download: svg('<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>'),
        copy: svg('<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>'),
        share: svg('<path d="M12 16V3m-5 5 5-5 5 5M5 13v8h14v-8"/>'),
        calendar: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>'),
        infinity: svg('<path d="M12 12c-2-3-3.5-5-6-5a5 5 0 0 0 0 10c2.5 0 4-2 6-5s3.5-5 6-5a5 5 0 0 1 0 10c-2.5 0-4-2-6-5z"/>')
    };
    function button(action, label, icon, extra = '') {
        return `<button type="button" class="senb-report-icon" data-report-action="${action}" aria-label="${label}" title="${label}">${icons[icon]}${extra}</button>`;
    }
    let reportDialog, lessonDialog, resultsDialog, currentModel, currentPeriod = 'all', busy = false, reportChildId = null;
    const progress = () => root.SenbProgress;
    const activeName = () => progress()?.active()?.name || 'الطفل';
    const displayScore = value => percent(value) === null ? 'لم يُقيّم' : `${percent(value)}%`;
    function makeDialog(id, label, className = '') {
        const dialog = document.createElement('dialog');
        dialog.id = id; dialog.className = `senb-report-dialog ${className}`; dialog.dir = 'rtl'; dialog.setAttribute('aria-labelledby', label);
        document.body.append(dialog);
        dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
        return dialog;
    }
    function reportChild() {
        const owner = progress()?.active();
        if (owner?.role === 'admin' && reportChildId) {
            try { return JSON.parse(localStorage.getItem('voc-children-v1'))?.children.find(child => child.id === reportChildId) || owner; } catch {}
        }
        return owner;
    }
    function renderReport() {
        const child = reportChild();
        currentModel = summarize({ name: child?.name || activeName(), sessions: child?.id === progress()?.active()?.id ? progress()?.sessions() || [] : child?.senb?.sessions || [] }, currentPeriod);
        let apps = reportDialog.querySelector('[data-report-apps]');
        if (!apps) { apps = document.createElement('nav'); apps.dataset.reportApps = ''; reportDialog.querySelector('.senb-report-heading').after(apps); }
        root.AppNavigation?.reportLinks(apps, child);
        const model = currentModel;
        const progressRows=model.acquisition;
        reportDialog.querySelector('[data-report-body]').innerHTML = `<div class="senb-report-identity"><h3>${escape(model.title)}</h3><p>${model.periodLabel} · ${dateText(model.date)}</p></div><div class="senb-report-totals"><div><b>${model.sessionCount}</b><span>جلسات</span></div><div><b>${model.sentenceCount}</b><span>جمل</span></div><div><b>${progressRows.groups.length}</b><span>مجموعات عُمل عليها</span></div></div><div class="senb-report-domains">${Object.entries(domains).map(([domain, label]) => `<section class="${domain}"><b>${displayScore(model.domains[domain])}</b><span>${label}</span><small>${model.domains[domain].total ? `<bdi dir="ltr">${model.domains[domain].correct}/${model.domains[domain].total}</bdi> استجابة صحيحة` : 'لا توجد استجابات جمل مقيّمة'}</small></section>`).join('')}</div><p class="senb-report-note">الأرقام أعلاه دقة استجابات الجمل فقط. رسوم الاكتساب تعتمد آخر اختبار مكتمل لكل جملة ومهارة؛ حد الاكتساب 80%. التدريب والجلسات غير المكتملة لا تُحسب اكتساباً.</p>${chart().bar(progressRows.types,'اكتساب الجمل حسب نوع الجملة','نوع الجملة')}<details class="acq-details senb-report-details" data-acquisition-details><summary>تفاصيل أنواع الجمل والمجموعات (${progressRows.groups.length})</summary><p class="acq-note">كل نوع يضم 8 مجموعات، وفي كل مجموعة 24 جملة. المجموعة الكاملة = 12.5% من نوعها، والجملة الواحدة = 4.17% من مجموعتها. إعادة الاختبار قد ترفع النسبة أو تخفضها.</p>${progressRows.types.map(type=>`<section class="senb-report-group"><h3>${escape(type.label)}</h3>${chart().bar(type.groups,'الاكتساب حسب المجموعة الفرعية','المجموعات الفرعية')}</section>`).join('')}${progressRows.custom?`<h3 class="acq-type-heading">جمل مخصّصة</h3>${chart().table([progressRows.custom])}`:''}</details><p class="senb-report-note">${model.assessmentCount} اختبارات مكتملة · ${model.practiceCount} جلسات تدريب${model.partialCount ? ` · ${model.partialCount} جلسات غير مكتملة` : ''}</p>`;
        reportDialog.querySelectorAll('[data-period]').forEach(control => control.setAttribute('aria-pressed', String(control.dataset.period === currentPeriod)));
        reportDialog.querySelector('[data-report-status]').textContent = '';
    }
    function openReport(id) {
        if (!progress()?.active()) { root.SenbProfile?.open(); return; }
        reportChildId = typeof id === 'string' ? id : null;
        if (!reportDialog) {
            reportDialog = makeDialog('senb-session-report', 'senb-session-report-title');
            reportDialog.innerHTML = `<header class="senb-report-heading"><h2 id="senb-session-report-title" tabindex="-1">تقرير التقدم</h2><div class="senb-report-actions">${button('download', 'تنزيل تقرير PDF', 'download')}${button('close', 'إغلاق', 'close')}</div></header><nav class="senb-report-periods" aria-label="فترة التقرير">${Object.keys(periods).map((period, index) => `<button type="button" class="senb-report-icon" data-period="${period}" aria-label="${periods[period]}" title="${periods[period]}">${icons[period === 'all' ? 'infinity' : 'calendar']}${index ? `<small aria-hidden="true">${({ halfyear: '6m', quarter: '3m', month: '30', week: '7', day: '1' })[period]}</small>` : ''}</button>`).join('')}</nav><div data-report-body></div><p class="senb-report-status" data-report-status role="status" aria-live="polite"></p>`;
            reportDialog.querySelector('[data-report-action=close]').onclick = () => reportDialog.close();
            reportDialog.querySelector('[data-report-action=download]').onclick = download;
            reportDialog.querySelectorAll('[data-period]').forEach(control => { control.onclick = () => { currentPeriod = control.dataset.period; renderReport(); }; });
        }
        renderReport();
        if (!reportDialog.open) reportDialog.showModal();
        reportDialog.querySelector('h2').focus();
    }
    function contextFor(options = {}) {
        const saved = progress()?.lesson() || {};
        const supplied = Object.hasOwn(options, 'sentences') || Object.hasOwn(options, 'sessionIds') || Object.hasOwn(options, 'sessions');
        const context = supplied ? options : saved;
        const all = progress()?.sessions() || [];
        const ids = context.sessionIds || [];
        const sessions = context.sessions || (ids.length ? all.filter(session => ids.includes(session.id)) : all.filter(session => new Date(session.date).toDateString() === new Date().toDateString()));
        return { ...context, date: context.date || new Date().toISOString(), sessions, sessionIds: sessions.map(session => session.id) };
    }
    function saveContext(context, text) {
        const { sessions, ...value } = context;
        progress()?.saveLesson({ ...value, text });
    }
    function openLesson(options = {}) {
        const context = contextFor(options);
        const text = context.text || lessonText(activeName(), context);
        saveContext(context, text);
        if (!lessonDialog) {
            lessonDialog = makeDialog('senb-family-lesson', 'senb-family-lesson-title', 'senb-family-dialog');
            lessonDialog.innerHTML = `<header class="senb-report-heading"><h2 id="senb-family-lesson-title" tabindex="-1">درسنا بالبيت</h2>${button('close', 'إغلاق', 'close')}</header><textarea dir="rtl" aria-label="رسالة للأهل، يمكنك تعديلها قبل المشاركة"></textarea><footer class="senb-report-actions">${button('copy', 'نسخ رسالة الأهل', 'copy')}${button('share', 'مشاركة رسالة الأهل', 'share')}</footer><p class="senb-report-status" role="status" aria-live="polite"></p>`;
            lessonDialog.querySelector('[data-report-action=close]').onclick = () => lessonDialog.close();
            const input = lessonDialog.querySelector('textarea'), status = lessonDialog.querySelector('[role=status]');
            input.addEventListener('input', () => { if (lessonDialog.lessonContext) saveContext(lessonDialog.lessonContext, input.value); });
            lessonDialog.querySelector('[data-report-action=copy]').onclick = async () => {
                try { await navigator.clipboard.writeText(input.value); status.textContent = 'تم نسخ الرسالة.'; }
                catch { input.focus(); input.select(); status.textContent = 'حدّدنا الرسالة؛ يمكنك نسخها من هنا.'; }
            };
            const share = lessonDialog.querySelector('[data-report-action=share]');
            share.hidden = !navigator.share;
            share.onclick = async () => {
                try { await navigator.share({ title: 'درسنا بالبيت', text: input.value }); }
                catch (error) { if (error.name !== 'AbortError') status.textContent = 'تعذّرت المشاركة. يمكنك نسخ الرسالة.'; }
            };
        }
        lessonDialog.lessonContext = context;
        lessonDialog.querySelector('textarea').value = text;
        lessonDialog.querySelector('[role=status]').textContent = '';
        if (!lessonDialog.open) lessonDialog.showModal();
        lessonDialog.querySelector('h2').focus();
        lessonDialog.querySelector('textarea').scrollTop = 0;
    }
    function mountButtons(host, options = {}) {
        if (typeof host === 'string') host = document.querySelector(host);
        if (!host) return;
        host.querySelectorAll('[data-senb-report-buttons]').forEach(node => node.remove());
        const controls = document.createElement('div'); controls.className = 'senb-report-actions'; controls.dataset.senbReportButtons = '';
        controls.innerHTML = `${button('report', 'تقرير التقدم', 'report')}${button('lesson', 'درس البيت للأهل', 'family')}`;
        controls.querySelector('[data-report-action=report]').onclick = openReport;
        controls.querySelector('[data-report-action=lesson]').onclick = () => openLesson(options);
        host.append(controls);
        return controls;
    }
    function prepareLesson(options = {}) {
        const context = contextFor(options);
        const text = lessonText(activeName(), context);
        saveContext(context, text);
        return { ...context, text };
    }
    function showResults(options = {}) {
        const context = prepareLesson(options);
        if (!resultsDialog) resultsDialog = makeDialog('senb-session-finished', 'senb-session-finished-title', 'senb-finished-dialog');
        resultsDialog.innerHTML = `<header class="senb-report-heading"><h2 id="senb-session-finished-title" tabindex="-1">أحسنت!</h2>${button('close', 'إغلاق', 'close')}</header><div class="senb-session-success" aria-hidden="true">✓</div><p>${escape(activeName())}، خلّصنا شغل اليوم</p><div data-result-controls></div>`;
        resultsDialog.querySelector('[data-report-action=close]').onclick = () => resultsDialog.close();
        mountButtons(resultsDialog.querySelector('[data-result-controls]'), context);
        if (!resultsDialog.open) resultsDialog.showModal();
        resultsDialog.querySelector('h2').focus();
    }
    function renderPDF(model) {
        const pages = [], width = 1240, height = 1754, margin = 80, bottom = 1620;
        let canvas, ctx, y;
        function text(value, x, yy, size = 27, color = '#22445a', align = 'right', bold = false) {
            ctx.font = `${bold ? 700 : 400} ${size}px system-ui, Tahoma, Arial, sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.direction = align === 'right' ? 'rtl' : 'ltr'; ctx.textBaseline = 'middle';
            ctx.fillText(String(value), x, yy);
        }
        function box(x, yy, w, h, color = '#f3f8fb') { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, yy, w, h, 18); ctx.fill(); }
        function wrap(value, maxWidth, size = 27, bold = false) {
            ctx.font = `${bold ? 700 : 400} ${size}px system-ui, Tahoma, Arial, sans-serif`;
            const result = [''];
            for (const word of String(value).split(/\s+/)) {
                const i = result.length - 1, next = `${result[i]} ${word}`.trim();
                if (ctx.measureText(next).width > maxWidth && result[i]) result.push(word); else result[i] = next;
            }
            return result;
        }
        function newPage() {
            canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height); pages.push(canvas);
            box(margin, 60, width - margin * 2, 215, '#edf7fc');
            text('جملة', width - margin - 25, 106, 28, '#0284c7', 'right', true);
            text('تقرير الفهم والتعبير', width - margin - 25, 158, 38, '#22445a', 'right', true);
            text(model.title || 'الطفل', width - margin - 25, 210, 29, '#22445a', 'right', true);
            text(`${model.periodLabel} · ${dateText(model.date)}`, width - margin - 25, 250, 22, '#5c7285');
            y = 315;
        }
        function ensure(heightNeeded) { if (y + heightNeeded > bottom) newPage(); }
        function paragraph(value, size = 24, color = '#5c7285') {
            for (const line of wrap(value, width - margin * 2, size)) { ensure(42); text(line, width - margin, y + 20, size, color); y += 42; }
            y += 12;
        }
        function heading(value) { ensure(95); text(value, width - margin, y + 25, 31, '#22445a', 'right', true); y += 65; }
        function scoreLine(label, value, yy, color = '#0284c7') {
            text(label, width - margin - 22, yy, 26, color);
            text(percent(value) === null ? 'لم يُقيّم' : `${percent(value)}%`, margin + 30, yy, 28, color, 'left', true);
            if (value.total) text(`${value.correct} / ${value.total}`, 415, yy, 23, '#5c7285', 'center');
        }
        function card(title, subtitle, values) {
            const lines = wrap(title, width - margin * 2 - 44, 27, true), h = lines.length * 40 + (subtitle ? 40 : 0) + 125;
            ensure(h + 18); box(margin, y, width - margin * 2, h);
            let yy = y + 34;
            for (const line of lines) { text(line, width - margin - 22, yy, 27, '#22445a', 'right', true); yy += 40; }
            if (subtitle) { text(subtitle, width - margin - 22, yy, 21, '#5c7285'); yy += 40; }
            scoreLine('الفهم', values.receptive, yy + 10); scoreLine('التعبير', values.expressive, yy + 58, '#099e75'); y += h + 18;
        }
        newPage();
        paragraph(`${model.sessionCount} جلسات · ${model.sentenceCount} جمل · ${model.acquisition.groups.length} مجموعات`, 28, '#22445a');
        card('الأداء الكلي', '', model.domains);
        paragraph('دقة استجابات الجمل منفصلة عن الاكتساب. الرسوم تعتمد آخر اختبار مكتمل لكل جملة ومهارة، بحد اكتساب 80%؛ لا تدخل نتائج التدريب أو الجلسات غير المكتملة في نسب الاكتساب.');
        const drawChart=(rows,title,axis)=>{
            if(!rows.length)return;
            for(let index=0;index<rows.length;index+=6){ensure(510);chart().drawBar(ctx,rows.slice(index,index+6),{x:margin,y,width:width-margin*2,height:460,title,axis});y+=500;}
        };
        drawChart(model.acquisition.types,'اكتساب الجمل حسب نوع الجملة','نوع الجملة');
        heading('تفاصيل أنواع الجمل والمجموعات');
        paragraph('كل نوع: 8 مجموعات × 24 جملة. مجموعة مكتملة = 12.5% من النوع؛ جملة مكتسبة = 4.17% من المجموعة.');
        if(!model.acquisition.types.length&&!model.acquisition.custom)paragraph('لا يوجد سجل جمل في هذه الفترة.');
        for(const type of model.acquisition.types){
            ensure(580);heading(type.label);drawChart(type.groups,'الاكتساب حسب المجموعة الفرعية','المجموعات الفرعية');
            for(const group of type.groups)paragraph(`${group.label} — الفهم: ${group.receptive.acquired}/24 (${chart().pct(group.receptive)})؛ التعبير: ${group.expressive.acquired}/24 (${chart().pct(group.expressive)})`,23,'#22445a');
        }
        if(model.acquisition.custom){const row=model.acquisition.custom;paragraph(`جمل مخصّصة — الفهم: ${row.receptive.acquired}/${row.total} (${chart().pct(row.receptive)})؛ التعبير: ${row.expressive.acquired}/${row.total} (${chart().pct(row.expressive)})`);}
        heading('الجلسات في هذه الفترة');
        paragraph(`${model.assessmentCount} اختبارات مكتملة · ${model.practiceCount} جلسات تدريب · ${model.partialCount} جلسات غير مكتملة`);
        for (const session of model.sessions) {
            const recordDomains = [...new Set((session.records || []).map(record => record.domain || session.domain).filter(domain => domains[domain]))].map(domain => domains[domain]).join(' و');
            paragraph(`${dateText(session.date)} · ${session.partial ? 'غير مكتملة' : session.kind === 'assessment' ? `اختبار ${recordDomains}` : 'تدريب'} · ${new Set((session.records || []).filter(record=>record.entity!=='word').map(record=>record.key)).size} جمل`, 23);
        }
        pages.forEach((page, index) => { ctx = page.getContext('2d'); text(`${index + 1} / ${pages.length}`, width / 2, height - 55, 22, '#5c7285', 'center'); });
        return pages;
    }
    async function pdfFor(model = currentModel) {
        if (!model) model = summarize({ name: activeName(), sessions: progress()?.sessions() || [] });
        await document.fonts?.ready;
        const helper = typeof SENBReport !== 'undefined' ? SENBReport : root.SENBReport;
        if (!helper?.pdfFromCanvas) throw new Error('Offline PDF renderer unavailable');
        return helper.pdfFromCanvas(renderPDF(model));
    }
    async function download() {
        if (busy) return;
        busy = true;
        const control = reportDialog.querySelector('[data-report-action=download]'), status = reportDialog.querySelector('[data-report-status]');
        control.disabled = true; status.textContent = '';
        try {
            const model = currentModel, blob = await pdfFor(model), url = URL.createObjectURL(blob), link = document.createElement('a');
            link.href = url; link.download = `SENB-${model.title.replace(/[^\p{L}\p{N}_-]/gu, '_')}-${new Date(model.date).toISOString().slice(0, 10)}.pdf`;
            document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (error) { status.textContent = 'تعذّر تنزيل التقرير. حاول مجدداً.'; console.error('SENB session report export failed', error); }
        finally { busy = false; control.disabled = false; }
    }
    function clearDialogs() {
        for (const dialog of [reportDialog, lessonDialog, resultsDialog]) { if (dialog?.open) dialog.close(); dialog?.remove(); }
        reportDialog = lessonDialog = resultsDialog = currentModel = undefined;
        document.querySelectorAll('[data-senb-report-buttons]').forEach(node => node.remove());
    }
    root.addEventListener('senb-profile-beforechange', clearDialogs);
    root.addEventListener('senb-profile-change', clearDialogs);
    root.SenbSessionReports = { ...api, openReport, openLesson, prepareLesson, showResults, mountButtons, pdfFor, renderPDF, current: () => currentModel };
})(globalThis);
