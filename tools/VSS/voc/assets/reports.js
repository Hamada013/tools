/* Concise, device-local activity reports; scored language work stays separate from games/practice. */
((root) => {
    'use strict';
    const periods = { all: 'منذ إنشاء الحساب', month: 'آخر 30 يوماً', quarter: 'آخر 3 أشهر', halfyear: 'آخر 6 أشهر', week: 'آخر 7 أيام', day: 'اليوم' };
    const dateText = date => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const percent = value => value.total ? Math.round(value.correct / value.total * 100) : null;
    const chart = () => root.AcquisitionCharts || (typeof module !== 'undefined' ? require('./acquisition-charts.js') : null);
    const catalog = () => root.VOC_GAME_DATA?.categories || (typeof CATEGORIES !== 'undefined' ? CATEGORIES : []);
    function acquisition(children, sessionsStart, end, bank = catalog()) {
        const categories = new Map(bank.map(category => [Number(category.id), { key: String(category.id), id: Number(category.id), label: category.name,
            keys: new Set(category.items.map(item => item.key || `${category.id}_${item.id}`)), total: category.items.length * children.length, worked: new Set(), latest: new Map() }]));
        children.forEach((child, childIndex) => {
            const list = (child.sessions || []).filter(session => new Date(session.date) >= sessionsStart && new Date(session.date) <= end).sort((a,b) => new Date(a.date)-new Date(b.date));
            for (const session of list) {
                const scores = new Map();
                for (const record of session.records || []) {
                    const category = categories.get(Number(String(record.key).split('_')[0]));
                    if (!category?.keys.has(record.key)) continue;
                    category.worked.add(`${childIndex}:${record.key}`);
                    const domain = record.domain || session.domain;
                    if (session.partial || session.kind === 'practice' || !['receptive','expressive'].includes(domain) || !(record.total > 0)) continue;
                    const key = `${childIndex}:${record.key}:${domain}`;
                    if (!scores.has(key)) scores.set(key, { category, domain, correct: 0, total: 0 });
                    const value = scores.get(key), total = Number(record.total);
                    if (!Number.isFinite(total)) continue;
                    value.correct += Math.max(0, Math.min(total, Number(record.correct)||0)); value.total += total;
                }
                for (const [key,value] of scores) if (value.total) value.category.latest.set(key, value);
            }
        });
        return [...categories.values()].filter(category => category.worked.size).map(category => {
            const row = { key: category.key, id: category.id, label: category.label, total: category.total, worked: category.worked.size };
            for (const domain of ['receptive','expressive']) {
                const tested = [...category.latest.values()].filter(value => value.domain === domain);
                row[domain] = chart().rate(tested.filter(value => value.correct === value.total).length, category.total, tested.length);
            }
            return row;
        });
    }
    function summarize(children, period = 'all', now = new Date(), bank = catalog()) {
        const end = new Date(now), start = new Date(now);
        start.setHours(0, 0, 0, 0);
        if (period === 'week') start.setDate(start.getDate() - 6);
        if (period === 'month') start.setDate(start.getDate() - 29);
        if (period === 'quarter' || period === 'halfyear') {
            const day = start.getDate(); start.setDate(1); start.setMonth(start.getMonth() - (period === 'quarter' ? 3 : 6));
            const last = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate(); start.setDate(Math.min(day, last)); start.setDate(start.getDate() + 1);
        }
        if (period === 'all') start.setTime(0);
        const categories = new Map(), words = new Set(), activity = new Map();
        const domains = { receptive: { correct: 0, total: 0 }, expressive: { correct: 0, total: 0 } };
        const sessions = children.flatMap(child => child.sessions || []).filter(session => {
            const date = new Date(session.date); return date >= start && date <= end;
        });
        for (const session of sessions) {
            activity.set(session.source, (activity.get(session.source) || 0) + 1);
            for (const record of session.records || []) {
                if (!/^\d+_\d+$/.test(record.key)) continue;
                const id = Number(record.key.split('_')[0]); words.add(record.key);
                if (!categories.has(id)) categories.set(id, { id, words: new Set(), sessions: new Set(), receptive: { correct: 0, total: 0 }, expressive: { correct: 0, total: 0 }, practiced: 0 });
                const category = categories.get(id); category.words.add(record.key); category.sessions.add(session.id);
                if (session.kind === 'practice' || !session.domain) category.practiced++;
                if (session.kind !== 'practice' && !session.partial && domains[session.domain] && record.total > 0) {
                    const correct = Math.max(0, Math.min(record.total, Number(record.correct) || 0));
                    for (const target of [domains[session.domain], category[session.domain]]) { target.correct += correct; target.total += record.total; }
                }
            }
        }
        return { title: children.length === 1 ? children[0].name : 'جميع الأطفال', period, periodLabel: periods[period], date: dateText(end), from: period === 'all' ? null : dateText(start),
            sessions: sessions.filter(session => !session.legacy).length, snapshots: sessions.filter(session => session.legacy).length,
            words: words.size, children: children.length, domains, activities: Object.fromEntries(activity),
            acquisition: acquisition(children, start, end, bank),
            categories: [...categories.values()].sort((a,b) => b.sessions.size - a.sessions.size || a.id - b.id).map(category => ({ ...category, words: category.words.size, sessions: category.sessions.size })) };
    }
    const api = { summarize, acquisition, percent, dateText, periods };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (!root.document) return;
    const P = root.VocProgress;
    const escape = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const label = { receptive: 'الفهم', expressive: 'التعبير' };
    const colors = chart().colors;
    let selectedChild = null, selectedPeriod = 'all', model = null, busy = false;
    let reportPage, reportDialog;
    const categoryName = id => (root.VOC_GAME_DATA?.categories || (typeof CATEGORIES !== 'undefined' ? CATEGORIES : [])).find(category => category.id === id)?.name || `فئة ${id}`;
    const value = score => percent(score) === null ? '—' : `${percent(score)}%`;
    const icon = (id, name, title, extra = '') => `<button type="button" class="voc-choice voc-icon" ${id} aria-label="${title}" title="${title}"><i class="fas fa-${name}" aria-hidden="true"></i>${extra}</button>`;
    function initReportPage() {
        reportPage = document.getElementById('activity-report');
        if (!reportPage) return;
        if (!P.active()) { reportPage.innerHTML = '<p class="report-empty">اختر ملف الطفل لعرض تقريره.</p><a class="voc-choice" href="index.html">الرئيسية</a>'; return; }
        const query = new URLSearchParams(location.search); selectedChild = P.isAdmin() ? query.get('child') || null : P.active().id;
        selectedPeriod = Object.hasOwn(periods, query.get('period')) ? query.get('period') : 'all';
        mountReport(false);
        render();
    }
    function mountReport(popup) {
        reportPage.innerHTML = `<header class="voc-report-toolbar"><div class="voc-dialog-heading"><${popup ? 'h2' : 'h1'} id="report-title" tabindex="-1">ملخص التقدم</${popup ? 'h2' : 'h1'}><div class="voc-choices">${icon('id="report-download"', 'file-pdf', 'تنزيل PDF')}${popup ? icon('id="report-close"', 'times', 'إغلاق') : '<a class="voc-choice voc-icon" href="index.html" aria-label="الرئيسية" title="الرئيسية"><i class="fas fa-home" aria-hidden="true"></i></a>'}</div></div><nav class="voc-choices voc-report-periods" aria-label="فترة التقرير">${icon('data-period="all"', 'infinity', periods.all)}${icon('data-period="halfyear"', 'calendar-alt', periods.halfyear, '<small aria-hidden="true">6m</small>')}${icon('data-period="quarter"', 'calendar-alt', periods.quarter, '<small aria-hidden="true">3m</small>')}${icon('data-period="month"', 'calendar-alt', periods.month, '<small aria-hidden="true">30</small>')}${icon('data-period="week"', 'calendar-week', periods.week, '<small aria-hidden="true">7</small>')}${icon('data-period="day"', 'calendar-day', periods.day)}</nav></header><div id="report-content" aria-live="polite"></div><p id="report-error" role="alert" hidden></p>`;
        reportPage.querySelector('#report-download').onclick = download;
        reportPage.querySelector('#report-close')?.addEventListener('click', () => reportDialog.close());
        reportPage.querySelectorAll('[data-period]').forEach(button => button.addEventListener('click', () => {
            selectedPeriod = button.dataset.period;
            if (!popup) {
                const url = new URL(location.href); url.searchParams.set('period', selectedPeriod); history.replaceState(null, '', url);
            }
            render();
        }));
    }
    function open(id = null) {
        if (!P.active()) return;
        selectedChild = P.isAdmin() ? id : P.active().id;
        if (!reportDialog) {
            reportDialog = document.createElement('dialog'); reportDialog.id = 'voc-activity-report';
            reportDialog.className = 'voc-dialog voc-report-dialog'; reportDialog.dir = 'rtl';
            reportDialog.setAttribute('aria-labelledby', 'report-title'); document.body.append(reportDialog);
            reportPage = reportDialog; mountReport(true);
            reportDialog.addEventListener('click', event => {
                if (event.target !== reportDialog) return;
                const box = reportDialog.getBoundingClientRect();
                if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) reportDialog.close();
            });
        }
        reportPage = reportDialog; render(); reportDialog.scrollTop = 0;
        if (!reportDialog.open) reportDialog.showModal();
        reportDialog.querySelector('#report-title').focus({ preventScroll: true });
    }
    function donut(domain) {
        const score = model.domains[domain], pct = percent(score);
        return `<div class="report-skill"><div class="report-donut" style="--report-color:${colors[domain]};--report-pct:${pct || 0}%" role="img" aria-label="${label[domain]}: ${pct === null ? 'لم يُقيّم' : `${pct}%`}"><strong dir="ltr">${value(score)}</strong></div><b>${label[domain]}</b><small>${score.total ? `<bdi dir="ltr">${score.correct} / ${score.total}</bdi> استجابة صحيحة` : 'لم يُقيّم'}</small></div>`;
    }
    function render() {
        if (!P.active() || !reportPage) return;
        model = summarize(P.reportChildren(selectedChild), selectedPeriod);
        const content = reportPage.querySelector('#report-content');
        content.innerHTML = `<div class="report-identity"><h3>${escape(model.title)}</h3><p>${model.periodLabel} · <bdi>${model.date}</bdi></p></div><div class="report-totals"><div><b>${model.sessions}</b><span>جلسات</span></div><div><b>${model.words}</b><span>بطاقات</span></div><div><b>${model.categories.length}</b><span>فئات</span></div></div><div class="report-skills">${donut('receptive')}${donut('expressive')}</div><p class="voc-note report-key">الأرقام أعلاه دقة الاستجابات في الفترة المحددة. رسوم الاكتساب أدناه تقارن الكلمات المكتسبة بإجمالي كلمات كل فئة.</p><details class="acq-details" data-acquisition-details><summary>تفاصيل الاكتساب حسب الفئة (${model.acquisition.length})</summary><p class="acq-note">آخر اختبار مكتمل لكل كلمة ومهارة؛ تُكتسب الكلمة عند نجاح جميع محاولاتها. التدريب لا يُحتسب اكتساباً، وإعادة الاختبار قد ترفع النسبة أو تخفضها.</p>${chart().bar(model.acquisition, 'اكتساب الكلمات حسب الفئة', 'الفئات')}${chart().pies(model.acquisition)}</details>${model.snapshots ? '<p class="voc-note">البيانات السابقة ملخص لآخر النتائج المحفوظة؛ السجل المفصل يبدأ مع هذا التحديث.</p>' : ''}`;
        let apps = reportPage.querySelector('[data-report-apps]');
        if (!apps) { apps = document.createElement('nav'); apps.dataset.reportApps = ''; reportPage.querySelector('.voc-report-toolbar').append(apps); }
        const reportChildren = P.reportChildren(selectedChild);
        root.AppNavigation?.reportLinks(apps, reportChildren.length === 1 ? reportChildren[0] : null);
        reportPage.querySelector('#report-error').hidden = true;
        reportPage.querySelectorAll('[data-period]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.period === selectedPeriod)));
        if (reportPage !== reportDialog) document.title = `${model.title} - ملخص التقدم`;
    }
    let pdfLibrary;
    function loadPDF() {
        return pdfLibrary ||= new Promise((resolve, reject) => {
            if (root.jspdf) { resolve(root.jspdf.jsPDF); return; }
            const script = document.createElement('script'); script.src = 'assets/vendor/jspdf.umd.min.js';
            script.onload = () => resolve(root.jspdf.jsPDF); script.onerror = () => { pdfLibrary = null; reject(new Error('PDF library unavailable')); }; document.head.append(script);
        });
    }
    async function pdfFor(report) {
        const jsPDF = await loadPDF(); await document.fonts.load('700 32px Cairo'); await document.fonts.ready;
        const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
        doc.setProperties({ title: `VOC - ${report.title} - ${report.date}`, creator: 'كلمة', subject: report.periodLabel });
        const pages = [], width = 1240, height = 1754, margin = 80;
        let canvas, c, y;
        const text = (str, x, yy, size = 28, color = '#18394b', align = 'right', maxWidth) => {
            c.font = `700 ${size}px Cairo`; c.fillStyle = color; c.textAlign = align; c.direction = align === 'right' ? 'rtl' : 'ltr'; c.textBaseline = 'middle';
            str = String(str);
            if (maxWidth) { while(c.measureText(str).width > maxWidth && str.length > 1) str = str.slice(0,-2) + '…'; }
            c.fillText(str, x, yy);
        };
        const box = (x, yy, w, h, fill) => { c.fillStyle = fill; c.beginPath(); c.roundRect(x, yy, w, h, 20); c.fill(); };
        const newPage = () => {
            canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; c = canvas.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0,0,width,height); pages.push(canvas);
            box(margin, 60, width - margin*2, 195, '#f1f8fc');
            text('كلمة', width-margin-28, 110, 26, '#0284c7'); text(report.title, width-margin-28, 165, 36, '#18394b', 'right', width-margin*2-56);
            text(report.periodLabel, width-margin-28, 220, 23, '#587082'); text(report.date, margin+28, 110, 25, '#587082', 'left'); y = 295;
        };
        newPage();
        const metrics = [[report.sessions,'جلسات'],[report.words,'بطاقات'],[report.categories.length,'فئات']];
        metrics.forEach(([number,name], index) => { const x = width-margin-340-index*370; box(x,y,340,130,'#f7fafc'); text(number,x+170,y+45,42,'#0284c7','center'); text(name,x+170,y+100,25,'#587082','center'); }); y += 185;
        for (const [index, domain] of ['receptive','expressive'].entries()) {
            const score = report.domains[domain], pct = percent(score), x = index ? 360 : 880, yy = y+70;
            c.lineWidth = 20; c.strokeStyle = '#eaf0f4'; c.beginPath(); c.arc(x,yy,78,0,2*Math.PI); c.stroke();
            if (pct) { c.strokeStyle = colors[domain]; c.beginPath(); c.arc(x,yy,78,-Math.PI/2,-Math.PI/2+2*Math.PI*pct/100); c.stroke(); }
            text(value(score),x,yy,40,colors[domain],'center'); text(label[domain],x,yy+125,30,'#18394b','center');
            text(score.total ? `${score.correct} / ${score.total}` : 'لم يُقيّم',x,yy+175,24,'#587082','center');
        }
        y += 335; text('الرسوم: آخر اختبار مكتمل لكل كلمة ÷ إجمالي كلمات فئتها؛ التدريب لا يُحسب اكتساباً',width-margin,y,22,'#587082'); y += 55;
        for (let index=0; index<report.acquisition.length; index+=6) {
            if (y+500 > height-120) newPage();
            chart().drawBar(c,report.acquisition.slice(index,index+6),{x:margin,y,width:width-margin*2,height:470,title:'اكتساب الكلمات حسب الفئة',axis:'الفئات'}); y+=510;
        }
        if (!report.acquisition.length) { text('لا توجد فئات تم العمل عليها في هذه الفترة',width-margin,y,26,'#587082');y+=65; }
        for (const category of report.acquisition) {
            if (y+245 > height-120) newPage();
            chart().drawPies(c,category,{x:margin,y,width:width-margin*2});y+=235;
        }
        if(report.snapshots) { if(y>height-180)newPage(); text('البيانات السابقة: آخر النتائج المحفوظة فقط',width-margin,y+20,21,'#587082'); }
        pages.forEach((page,index) => {
            canvas = page; c = page.getContext('2d'); text(`${index+1} / ${pages.length}`,width/2,height-55,20,'#587082','center');
            if(index)doc.addPage(); doc.addImage(page.toDataURL('image/jpeg',.94),'JPEG',0,0,210,297);
        });
        return doc;
    }
    async function download() {
        if (busy || !P.active() || !model) return;
        busy = true; const report = model, button = reportPage.querySelector('#report-download'); button.disabled = true;
        try {
            const doc = await pdfFor(report); doc.save(`VOC-${report.title.replace(/[^\p{L}\p{N}_-]/gu,'_')}-${report.date.replaceAll('/','-')}.pdf`);
        } catch { const error = reportPage.querySelector('#report-error'); error.textContent = 'تعذّر إنشاء التقرير. أعد المحاولة أو نزّل التطبيق للاستخدام دون إنترنت.'; error.hidden = false; }
        finally { busy = false; button.disabled = false; }
    }
    root.VocReports = { ...api, pdfFor, current: () => model, open };
    window.addEventListener('storage', event => { if (event.key === 'voc-children-v1' && reportPage && (reportPage !== reportDialog || reportDialog.open)) render(); });
    window.addEventListener('voc-profile-beforechange', () => { reportDialog?.close(); model = null; });
    window.addEventListener('voc-profile-memorychange', () => { reportDialog?.close(); model = null; });
    document.addEventListener('DOMContentLoaded', initReportPage);
})(globalThis);
