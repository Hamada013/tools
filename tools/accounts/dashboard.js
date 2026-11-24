/* Children's accounts dashboard. The builder apps are published on the same site
 * (hamada013.github.io/<app>/), so their saved progress is readable here. This page only reads it.
 * Children with the same name in different apps are shown as one child; different spellings can be
 * linked by hand. For each child: every app's report alone, or all apps together, and PDFs.
 *
 * Adding a future app: add one entry to APPS with its storage key, its address and a read() that
 * turns one saved child into { level, sessions: [{ date, kind, source, skills: { id: {correct,total} } }], plan }. */
(() => {
    'use strict';
    // The back arrow returns to the menu that opened the reports: the address it passes as ?back=
    // (any page on this site, or a local preview), else the same-site page it came from, remembered
    // for this tab; without one it opens this repository's menu. No other site's address is written here.
    (() => {
        const back = document.querySelector('.dash-back'), KEY = 'dash-return';
        const allowed = url => /^https?:$/.test(url.protocol) && (url.origin === location.origin || /^(localhost|127\.0\.0\.1)$/.test(url.hostname));
        let from = '';
        try {
            const params = new URLSearchParams(location.search), given = params.get('back');
            if (given && allowed(new URL(given))) from = new URL(given).href;
            if (params.has('back')) { params.delete('back'); history.replaceState(history.state, '', location.pathname + (params.size ? '?' + params : '') + location.hash); }
        } catch {}
        try { const ref = !from && document.referrer && new URL(document.referrer); if (ref && ref.origin === location.origin && ref.pathname !== location.pathname) from = ref.href; } catch {}
        try { if (from) sessionStorage.setItem(KEY, from); else from = sessionStorage.getItem(KEY) || ''; } catch {}
        if (back && from) back.href = from;
    })();
    const LEVELS = { easy: 'سهل', moderate: 'متوسط', advanced: 'متقدم' };
    const sum = (list, field) => list.reduce((total, item) => total + (Number(item[field]) || 0), 0);
    // Skill totals for one session from records that carry their own domain (or the session's).
    const skillsOf = (records, fallbackDomain) => {
        const skills = {};
        for (const record of records || []) {
            const domain = record.domain || fallbackDomain; if (!domain || !(Number(record.total) > 0)) continue;
            const skill = skills[domain] ||= { correct: 0, total: 0 }; skill.correct += Number(record.correct) || 0; skill.total += Number(record.total) || 0;
        }
        return skills;
    };
    const APPS = [
        { id: 'voc', name: 'كلمة', color: '#0284c7', key: 'vocabulary-builder-v1', url: '../../vocabulary-builder/', goals: '../../vocabulary-builder/assets/intervention-goals.js',
            skills: { receptive: 'الفهم', expressive: 'التعبير' },
            sources: { workplace: 'مساحة العمل', test: 'استمع واختر', rapid: 'البطاقات السريعة', matching: 'المطابقة', memory: 'الذاكرة', where: 'وين؟' },
            read: child => ({ level: child.level, plan: child.intervention || null,
                sessions: (child.sessions || []).filter(s => !s.partial).map(s => ({ date: s.date || s.started, kind: s.kind, source: s.source, skills: skillsOf(s.records, s.domain), raw: s })) }) },
        { id: 'senb', name: 'جملة', color: '#7c3aed', key: 'sentences-builder-v1', url: '../../sentences-builder/', goals: '../../sentences-builder/assets/intervention-goals.js',
            skills: { receptive: 'فهم الجمل', expressive: 'التعبير بالجمل' },
            sources: { workplace: 'لوحة الجمل', comprehension: 'اختبار الفهم', expressive: 'اختبار التعبير', game: 'البطاقة الناقصة', repetition: 'التكرار' },
            read: child => ({ level: child.level || child.senb?.level, plan: child.senb?.intervention || null,
                sessions: (child.senb?.sessions || []).filter(s => !s.partial).map(s => ({ date: s.date || s.startedAt, kind: s.kind, source: s.source || s.mode || s.activity, skills: skillsOf(s.records), raw: s })) }) },
        { id: 'taffaha', name: 'مقطع', color: '#059669', key: 'syllables-builder-v1', url: '../../syllables-builder/', goals: '../../syllables-builder/assets/intervention-goals.js',
            skills: { picture: 'المقاطع والصورة', count: 'الصورة وعدد المقاطع' },
            sources: { picture: 'المقاطع والصورة', count: 'الصورة وعدد المقاطع' },
            // Answers are saved one by one; a session is the set of answers with the same session id.
            read: child => {
                const groups = new Map();
                for (const attempt of child.taffaha?.attempts || []) {
                    if (!attempt.completed) continue;
                    const id = attempt.sessionId || attempt.date?.slice(0, 10);
                    const session = groups.get(id) || { date: attempt.date, kind: 'assessment', source: attempt.mode, skills: {}, raw: { records: [] } };
                    const skill = session.skills[attempt.mode] ||= { correct: 0, total: 0 };
                    skill.total++; if (attempt.correct && attempt.firstTry) skill.correct++;
                    session.raw.records.push({ key: attempt.wordId, domain: attempt.mode, correct: attempt.correct && attempt.firstTry ? 1 : 0, total: 1, count: attempt.count });
                    groups.set(id, session);
                }
                return { level: child.level || child.taffaha?.level, plan: child.taffaha?.intervention || null, sessions: [...groups.values()] };
            } },
        { id: 'arabicsounds', name: 'أصواتي العربية', color: '#d97706', key: 'arabicsounds-children-v1', url: '../arabicsounds/', goals: '../arabicsounds/assets/intervention-goals.js',
            skills: { pair: 'تمييز أصوات الكلام', 'ling-detection': 'اكتشاف أصوات لينغ', 'ling-identification': 'التعرف على أصوات لينغ', matching: 'المطابقة', memory: 'الذاكرة' },
            sources: { pair: 'تمييز أصوات الكلام', 'ling-detection': 'اكتشاف أصوات لينغ', 'ling-identification': 'التعرف على أصوات لينغ', matching: 'المطابقة', memory: 'الذاكرة' },
            read: child => soundRead(child, 'arabicsounds') },
        { id: 'auditory-rehabilitation', name: 'أصوات من حولي', color: '#0891b2', key: 'auditory-rehabilitation-children-v1', url: '../auditory-rehabilitation/', goals: '../auditory-rehabilitation/assets/intervention-goals.js',
            skills: { detection: 'اكتشاف الصوت', discrimination: 'التمييز السمعي', identification: 'التعرف على الصوت', duration: 'طويل وقصير', memory: 'الذاكرة' },
            sources: { detection: 'اكتشاف الصوت', discrimination: 'التمييز السمعي', identification: 'التعرف على الصوت', duration: 'طويل وقصير', memory: 'الذاكرة' },
            read: child => soundRead(child, 'auditory-rehabilitation') },
        { id: 'follow', name: 'اتبع التعليمات', color: '#16a34a', key: 'follow-direction-children-v1', url: '../../follow-direction/', goals: '../../follow-direction/assets/intervention-goals.js',
            skills: { one: 'حركة واحدة', objects: 'أشياء مألوفة', attributes: 'لون وحجم', quantity: 'واحد واثنان وثلاثة', function: 'استخدام الأشياء', space: 'المكان', two: 'حركتان بالترتيب', order: 'أشياء بالترتيب', play: 'خطوتان في اللعب', condition: 'إذا…', three: 'ثلاث خطوات' },
            sources: { practice: 'التدريب', screen: 'الفرز' },
            // Answers count when done without help; the plan is the road itself (every skill practised).
            read: child => {
                const skillOf = item => String(item || '').replace(/[-_]?\d+$/, '');
                const sessions = (child.sessions || []).filter(s => s.ended).map(s => {
                    const skills = {};
                    for (const r of s.results || []) { if (r.outcome === 'skip') continue; const k = skills[skillOf(r.item)] ||= { correct: 0, total: 0 }; k.total++; if (r.outcome === 'independent') k.correct++; }
                    return { date: s.finished || s.started, kind: s.mode === 'screen' ? 'assessment' : 'practice', source: s.mode, skills, raw: s };
                });
                const practised = [...new Set((child.sessions || []).filter(s => s.mode === 'practice').flatMap(s => (s.results || []).filter(r => r.outcome !== 'skip').map(r => skillOf(r.item))))];
                return { level: null, plan: practised.length ? { goals: practised.map(id => ({ id })) } : null, sessions };
            } },
        { id: 'aural', name: 'التأهيل السمعي', color: '#0369a1', key: 'aural-rehabilitation-children-v1', url: '../../aural-rehabilitation-/', goals: ['../../aural-rehabilitation-/assets/lessons.js', '../../aural-rehabilitation-/assets/intervention-goals.js'],
            skills: { 'my-house': 'بيتي', 'my-kitchen': 'مطبخي', transport: 'مواصلات', buses: 'الباصات' },
            sources: { station: 'محطة' },
            // Each station play is one entry in child.aural.log ({t, l: lesson, v: level, s: station, pct}).
            read: child => {
                const log = child.aural?.log || [], days = new Map();
                for (const play of log) {
                    const day = new Date(play.t).toISOString().slice(0, 10), session = days.get(day) || { date: new Date(play.t).toISOString(), kind: 'assessment', source: 'station', skills: {}, raw: { records: [] } };
                    const skill = session.skills[play.l] ||= { correct: 0, total: 0 }; skill.total += 100; skill.correct += play.pct || 0;
                    session.raw.records.push(play); days.set(day, session);
                }
                const played = [...new Set(log.map(play => `${play.l}.${play.v}`))];
                return { level: null, plan: played.length ? { goals: played.map(key => ({ prefix: key })) } : null, sessions: [...days.values()] };
            } }
    ];
    // The two sound apps keep sessions per app (child.soundApps[app]); only tests have right/wrong answers.
    function soundRead(child, app) {
        const own = child.soundApps?.[app] || {};
        return { level: child.level, plan: own.intervention || null,
            sessions: (own.sessions || []).filter(s => !s.partial).map(s => ({ date: s.date, kind: s.kind, source: s.skill,
                skills: s.kind === 'assessment' ? { [s.skill]: { correct: s.records.filter(r => r.correct).length, total: s.records.length } } : {}, raw: s })) };
    }

    // ---- Reading every app ----
    const normalizeName = name => String(name || '').normalize('NFKC').replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
    const LINKS_KEY = 'speech-dashboard-links-v1', LOCK_KEY = 'speech-dashboard-therapist';
    const store = { get: (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }, set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } } };
    function accounts() {
        const out = [];
        for (const app of APPS) {
            const data = store.get(app.key, null);
            for (const child of data?.children || []) {
                if (!child?.id || child.role === 'admin' || data.deletedChildren?.[child.id]) continue;
                let read; try { read = app.read(child); } catch { continue; }
                read.sessions = read.sessions.filter(s => s.date).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
                out.push({ ref: `${app.id}:${child.id}`, app, id: child.id, name: child.name || 'بدون اسم', created: child.created, child, ...read });
            }
        }
        return out;
    }
    // One child = accounts with the same name, plus accounts the therapist linked by hand.
    function children() {
        const list = accounts(), links = store.get(LINKS_KEY, {}), groups = new Map();
        const root = ref => { const seen = new Set(); while (links[ref] && !seen.has(ref)) { seen.add(ref); ref = links[ref]; } return ref; };
        const byName = new Map();
        for (const account of list) { const key = normalizeName(account.name); if (!byName.has(key)) byName.set(key, account.ref); }
        for (const account of list) {
            const anchor = links[account.ref] ? root(account.ref) : byName.get(normalizeName(account.name));
            const group = groups.get(anchor) || { key: anchor, accounts: [] };
            group.accounts.push(account); groups.set(anchor, group);
        }
        return [...groups.values()].map(group => ({ ...group, name: group.accounts[0].name,
            last: Math.max(0, ...group.accounts.flatMap(a => a.sessions.map(s => Date.parse(s.date) || 0))) }))
            .sort((a, b) => b.last - a.last || a.name.localeCompare(b.name, 'ar'));
    }
    function link(ref, toRef) { const links = store.get(LINKS_KEY, {}); links[ref] = toRef; store.set(LINKS_KEY, links); }
    function unlink(ref) { const links = store.get(LINKS_KEY, {}); delete links[ref]; for (const [from, to] of Object.entries(links)) if (to === ref) delete links[from]; links[ref] = ref; store.set(LINKS_KEY, links); }

    // ---- Goal banks: each app's own intervention-goals.js, loaded on demand (needs the app online once) ----
    const goalBanks = new Map();
    function goalBank(app) {
        // `goals` is one file, or several run together (e.g. a lessons file and the goal file that reads it).
        if (!goalBanks.has(app.id)) goalBanks.set(app.id, Promise.all([].concat(app.goals).map(url => fetch(url).then(response => response.ok ? response.text() : Promise.reject()))).then(parts => parts.join(';\n'))
            .then(code => { const sandbox = {}; new Function('globalThis', 'window', 'self', 'module', code)(sandbox, sandbox, sandbox, undefined); return sandbox.InterventionGoals || null; })
            .catch(() => null));
        return goalBanks.get(app.id);
    }
    // A goal's value: the therapist's rating when newer than the last measured session, else the app's estimate.
    function goalStates(bank, plan, child) {
        if (!bank || !plan?.goals?.length) return null;
        if (plan.goals.some(goal => goal.prefix)) plan = { ...plan, goals: plan.goals.flatMap(goal => goal.prefix ? bank.GOALS.flatMap(long => long.short).filter(item => item.id.startsWith(goal.prefix + '.')).map(item => ({ id: item.id })) : [goal]) };
        let estimates = {}; try { estimates = bank.estimate?.(child) || {}; } catch {}
        const rows = plan.goals.filter(goal => bank.short(goal.id)).map(goal => {
            const est = estimates[goal.id], manualAt = goal.history?.at?.(-1)?.date;
            const manualFirst = goal.rating != null && (!est?.last || (manualAt && manualAt >= est.last));
            const percent = manualFirst ? goal.rating : est?.percent ?? goal.rating ?? null;
            const achieved = goal.achieved || est?.achieved || null;
            return { id: goal.id, text: bank.short(goal.id).text, long: bank.short(goal.id).long?.title, percent, achieved, by: manualFirst ? 'therapist' : est ? 'app' : null };
        });
        const done = rows.filter(row => row.achieved), working = rows.filter(row => !row.achieved);
        const suggested = (bank.suggest?.(plan.goals.map(goal => goal.id), done.map(row => row.id)) || []).map(id => ({ id, text: bank.short(id)?.text || id }));
        return { done, working, suggested, percent: rows.length ? Math.round(sum(rows, 'percent') / rows.length) : 0 };
    }

    // ---- Periods and totals ----
    const PERIODS = { all: ['الكل', Infinity], quarter: ['٣ أشهر', 92], month: ['٣٠ يوماً', 30], week: ['٧ أيام', 7] };
    let period = 'all';
    const inPeriod = session => PERIODS[period][1] === Infinity || Date.now() - Date.parse(session.date) <= PERIODS[period][1] * 864e5;
    function totals(account) {
        const sessions = account.sessions.filter(inPeriod), tests = sessions.filter(s => s.kind === 'assessment');
        const skills = Object.fromEntries(Object.keys(account.app.skills).map(id => { const parts = tests.map(s => s.skills[id]).filter(Boolean); const total = sum(parts, 'total'); return [id, { correct: sum(parts, 'correct'), total, percent: total ? Math.round(sum(parts, 'correct') / total * 100) : null }]; }));
        return { sessions: sessions.length, tests: tests.length, skills, last: sessions.at(-1)?.date || null, recent: tests.slice(-6).reverse() };
    }
    const date = iso => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat('en-GB').format(d); };
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const scoreOf = session => { const parts = Object.values(session.skills); const total = sum(parts, 'total'); return total ? Math.round(sum(parts, 'correct') / total * 100) : null; };

    // ---- Screens ----
    const $ = selector => document.querySelector(selector);
    const isOpen = () => { try { return localStorage.getItem(LOCK_KEY) === 'on'; } catch { return false; } };
    function setOpen(on) { try { on ? localStorage.setItem(LOCK_KEY, 'on') : localStorage.removeItem(LOCK_KEY); } catch {} route(); }
    let current = null, view = 'all';
    function route() {
        const open = isOpen();
        $('#dash-gate').hidden = open; $('#dash-lock').hidden = !open;
        $('#dash-list').hidden = !open || !!current; $('#dash-child').hidden = !open || !current;
        if (!open) { $('#dash-gate input').value = ''; $('#dash-gate input').focus(); return; }
        if (current) renderChild(); else renderList();
    }
    function renderList() {
        const query = normalizeName($('#dash-search').value), all = children(), list = all.filter(child => normalizeName(child.name).includes(query));
        $('#dash-count').textContent = `${all.length} طفل`;
        $('#dash-children').replaceChildren(...list.map(child => {
            const button = document.createElement('button'); button.type = 'button'; button.className = 'dash-child-card'; button.setAttribute('role', 'listitem');
            button.innerHTML = `<strong>${esc(child.name)}</strong><span class="dash-apps">${child.accounts.map(a => `<i style="--app:${a.app.color}">${a.app.name}</i>`).join('')}</span><small>${child.last ? 'آخر جلسة ' + date(child.last) : 'لا توجد جلسات بعد'}</small>`;
            button.onclick = () => { current = child.key; view = 'all'; route(); window.scrollTo(0, 0); };
            return button;
        }));
        $('#dash-empty').hidden = !!list.length;
        $('#dash-empty').textContent = all.length ? 'لا يوجد اسم مطابق.' : 'لا توجد حسابات أطفال على هذا الجهاز بعد. أضف الأطفال من داخل التطبيقات.';
    }
    const bar = (label, value, color, detail) => `<div class="dash-bar"><span class="dash-bar-label">${esc(label)}</span><span class="dash-bar-track"><i style="width:${value ?? 0}%;background:${color}"></i></span><b dir="ltr">${value == null ? '—' : value + '%'}</b>${detail ? `<small>${detail}</small>` : ''}</div>`;
    async function appSection(account) {
        const t = totals(account), app = account.app;
        const bank = await goalBank(app), goals = goalStates(bank, account.plan, account.child);
        const goalList = (state, title, rows, extra = row => row.percent == null ? 'لم يُقيّم' : `${row.percent}%${row.by === 'app' ? ' · تقدير' : ''}`) => rows.length ? `<div class="dash-goals" data-state="${state}"><h4>${title} <small>(${rows.length})</small></h4>${rows.map(row => `<p><span>${esc(row.text)}</span><b>${state === 'suggested' ? 'مقترح' : extra(row)}</b></p>`).join('')}</div>` : '';
        return `<section class="dash-app" style="--app:${app.color}"><header><h3>${app.name}</h3>${account.level ? `<span class="dash-level" data-level="${account.level}">${LEVELS[account.level] || account.level}</span>` : ''}<a href="${app.url}" class="dash-open">فتح التطبيق</a></header>
            <div class="dash-stats"><div><strong>${t.sessions}</strong><span>جلسات</span></div><div><strong>${t.tests}</strong><span>اختبارات</span></div><div><strong>${t.last ? date(t.last) : '—'}</strong><span>آخر جلسة</span></div></div>
            ${Object.entries(app.skills).map(([id, label]) => bar(label, t.skills[id].percent, app.color, t.skills[id].total ? `<bdi dir="ltr">${t.skills[id].correct} / ${t.skills[id].total}</bdi>` : 'لم يُقيّم')).join('')}
            ${t.recent.length ? `<h4 class="dash-sub">آخر الاختبارات</h4><ul class="dash-recent">${t.recent.map(s => `<li><span>${date(s.date)}</span><span>${esc(app.sources[s.source] || 'اختبار')}</span><b dir="ltr">${scoreOf(s) ?? '—'}%</b></li>`).join('')}</ul>` : ''}
            ${goals ? `<h4 class="dash-sub">أهداف خطة التدخل · ${goals.percent}%</h4>${goalList('working', 'نعمل عليها الآن', goals.working)}${goalList('done', 'تحققت', goals.done)}${goalList('suggested', 'مقترحة', goals.suggested)}` : account.plan?.goals?.length ? '<p class="dash-note">افتح التطبيق مرة مع الإنترنت لعرض أهدافه هنا.</p>' : '<p class="dash-note">لا توجد خطة تدخل في هذا التطبيق.</p>'}
        </section>`;
    }
    async function renderChild() {
        const child = children().find(entry => entry.key === current);
        if (!child) { current = null; route(); return; }
        const host = $('#dash-child'), accountsShown = view === 'all' ? child.accounts : child.accounts.filter(a => a.ref === view);
        const others = accounts().filter(a => !child.accounts.some(own => own.ref === a.ref) && !child.accounts.some(own => own.app.id === a.app.id));
        host.innerHTML = `<div class="dash-child-head"><button type="button" class="dash-icon" data-back aria-label="كل الأطفال" title="كل الأطفال"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button><h2 id="dash-child-name">${esc(child.name)}</h2><button type="button" class="dash-print" data-print><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z"/></svg>طباعة</button></div>
            <nav class="dash-tabs" aria-label="التطبيقات">${[['all', 'كل التطبيقات'], ...child.accounts.map(a => [a.ref, a.app.name])].map(([id, label]) => `<button type="button" data-view="${id}" aria-pressed="${view === id}">${label}</button>`).join('')}</nav>
            <nav class="dash-periods" aria-label="الفترة">${Object.entries(PERIODS).map(([id, [label]]) => `<button type="button" data-period="${id}" aria-pressed="${period === id}">${label}</button>`).join('')}</nav>
            <div class="dash-sections">${(await Promise.all(accountsShown.map(appSection))).join('')}</div>
            <details class="dash-link"><summary>ربط حساب بنفس الطفل باسم مختلف</summary>
                ${others.length ? `<p>اختر حساب هذا الطفل في تطبيق آخر إن كُتب اسمه بشكل مختلف.</p><div class="dash-link-list">${others.map(a => `<button type="button" data-link="${a.ref}"><i style="--app:${a.app.color}">${a.app.name}</i>${esc(a.name)}</button>`).join('')}</div>` : '<p>لا توجد حسابات أخرى للربط.</p>'}
                ${child.accounts.length > 1 ? `<p>فك الربط:</p><div class="dash-link-list">${child.accounts.map(a => `<button type="button" data-unlink="${a.ref}"><i style="--app:${a.app.color}">${a.app.name}</i>${esc(a.name)} ×</button>`).join('')}</div>` : ''}
            </details>`;
        host.querySelector('[data-back]').onclick = () => { current = null; route(); };
        host.querySelectorAll('[data-view]').forEach(button => { button.onclick = () => { view = button.dataset.view; renderChild(); }; });
        host.querySelectorAll('[data-period]').forEach(button => { button.onclick = () => { period = button.dataset.period; renderChild(); }; });
        host.querySelectorAll('[data-link]').forEach(button => { button.onclick = () => { link(button.dataset.link, child.accounts[0].ref); renderChild(); }; });
        host.querySelectorAll('[data-unlink]').forEach(button => { button.onclick = () => { unlink(button.dataset.unlink); if (button.dataset.unlink === child.key) current = null; route(); }; });
        host.querySelector('[data-print]').onclick = () => choosePrint(child);
    }

    // ---- Print: choose reports, each downloads as its own PDF ----
    let printDialog;
    function choosePrint(child) {
        if (!printDialog) {
            printDialog = document.createElement('dialog'); printDialog.className = 'dash-print-dialog'; printDialog.dir = 'rtl';
            printDialog.innerHTML = `<h2>طباعة التقارير</h2><p>اختر التقارير. كل تقرير يُنزَّل في ملف PDF منفصل.</p><div class="dash-print-list"></div><p class="dash-print-error" role="alert" hidden></p><footer><button type="button" data-go>تنزيل</button><button type="button" data-cancel>إلغاء</button></footer>`;
            document.body.append(printDialog); printDialog.querySelector('[data-cancel]').onclick = () => printDialog.close();
        }
        const choices = [['all', 'تقرير موحّد لكل التطبيقات'], ...child.accounts.map(a => [a.ref, `تقرير ${a.app.name}`])];
        printDialog.querySelector('.dash-print-list').innerHTML = choices.map(([id, label]) => `<button type="button" class="print-choice" data-choice="${id}" aria-pressed="true"><span class="print-tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4.5 4.5L19 7"/></svg></span><span><b>${label}</b></span></button>`).join('');
        const go = printDialog.querySelector('[data-go]'), sync = () => { go.disabled = !printDialog.querySelector('[aria-pressed=true]'); };
        printDialog.querySelectorAll('[data-choice]').forEach(el => { el.onclick = () => { el.setAttribute('aria-pressed', String(el.getAttribute('aria-pressed') !== 'true')); sync(); }; }); sync();
        go.onclick = async () => {
            go.disabled = true; go.textContent = 'جاري التنزيل…'; printDialog.querySelector('.dash-print-error').hidden = true;
            try {
                for (const id of [...printDialog.querySelectorAll('[data-choice][aria-pressed=true]')].map(button => button.dataset.choice)) {
                    const list = id === 'all' ? child.accounts : child.accounts.filter(a => a.ref === id);
                    const doc = await pdfFor(child, list); doc.save(`تقرير-${child.name.replace(/[^\p{L}\p{N}_-]/gu, '_')}-${id === 'all' ? 'موحد' : list[0].app.name}-${date(new Date().toISOString()).replaceAll('/', '-')}.pdf`);
                    await new Promise(resolve => setTimeout(resolve, 900));
                }
                printDialog.close();
            } catch { const error = printDialog.querySelector('.dash-print-error'); error.textContent = 'تعذّر إنشاء التقرير. أعد المحاولة.'; error.hidden = false; }
            finally { go.disabled = false; go.textContent = 'تنزيل'; }
        };
        printDialog.showModal();
    }
    let pdfLibrary;
    const loadPDF = () => pdfLibrary ||= new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = 'vendor/jspdf.umd.min.js'; script.onload = () => resolve(window.jspdf.jsPDF); script.onerror = () => { pdfLibrary = null; reject(Error('PDF')); }; document.head.append(script); });
    async function pdfFor(child, list) {
        const jsPDF = await loadPDF(); await document.fonts.load('700 30px Cairo'); await document.fonts.ready;
        const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true }), W = 1240, H = 1754, M = 80, pages = [];
        let c, y;
        const text = (s, x, yy, size = 26, color = '#18394b', align = 'right', weight = 700) => { c.font = `${weight} ${size}px Cairo`; c.fillStyle = color; c.textAlign = align; c.direction = /[؀-ۿ]/.test(s) ? 'rtl' : 'ltr'; c.textBaseline = 'middle'; c.fillText(String(s), x, yy); };
        const box = (x, yy, w, h, fill, r = 18) => { c.fillStyle = fill; c.beginPath(); c.roundRect(x, yy, w, h, r); c.fill(); };
        const page = () => { const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; c = canvas.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); pages.push(canvas);
            box(M, 60, W - 2 * M, 170, '#f1f8fc'); text(list.length > 1 ? 'تقرير موحّد · ' + list.map(section => section.app.name).join(' · ') : `تقرير ${list[0].app.name}`, W - M - 28, 105, 24, '#0284c7'); text(child.name, W - M - 28, 160, 38); text(`${PERIODS[period][0]} · ${date(new Date().toISOString())}`, W - M - 28, 205, 21, '#587082', 'right', 600); y = 270; };
        const ensure = need => { if (y + need > H - 100) page(); };
        page();
        for (const account of list) {
            const t = totals(account), app = account.app, bank = await goalBank(app), goals = goalStates(bank, account.plan, account.child);
            ensure(330); text(app.name, W - M, y + 20, 34, app.color); if (account.level) text(LEVELS[account.level] || '', M, y + 20, 24, '#587082', 'left'); y += 60;
            [[t.sessions, 'جلسات'], [t.tests, 'اختبارات'], [t.last ? date(t.last) : '—', 'آخر جلسة']].forEach(([n, l], i) => { const x = W - M - 340 - i * 370; box(x, y, 340, 110, '#f7fafc'); text(n, x + 170, y + 40, 36, app.color, 'center'); text(l, x + 170, y + 85, 22, '#587082', 'center', 600); }); y += 140;
            for (const [id, label] of Object.entries(app.skills)) {
                ensure(80); const s = t.skills[id], track = W - 2 * M - 520, right = W - M - 300;
                text(label, W - M, y + 18, 24); box(right - track, y + 4, track, 28, '#eaf0f4', 14); if (s.percent) box(right - track, y + 4, Math.max(28, track * s.percent / 100), 28, app.color, 14);
                text(s.percent == null ? 'لم يُقيّم' : `${s.percent}%  (${s.correct}/${s.total})`, M, y + 18, 22, '#18394b', 'left'); y += 62;
            }
            if (goals) for (const [state, title, rows, color] of [['working', 'نعمل عليها الآن', goals.working, '#c0392b'], ['done', 'تحققت', goals.done, '#2f7a52'], ['suggested', 'مقترحة', goals.suggested, '#a16207']]) {
                if (!rows.length) continue; ensure(70); text(`${title} (${rows.length})`, W - M, y + 18, 24, color); y += 44;
                for (const row of rows) { ensure(46); text(row.text.length > 70 ? row.text.slice(0, 68) + '…' : row.text, W - M - 20, y + 14, 21, '#18394b', 'right', 600); text(state === 'suggested' ? 'مقترح' : row.percent == null ? '—' : `${row.percent}%`, M, y + 14, 21, color, 'left'); y += 40; }
            }
            y += 30; c.strokeStyle = '#e2eef5'; c.lineWidth = 2; c.beginPath(); c.moveTo(M, y); c.lineTo(W - M, y); c.stroke(); y += 30;
        }
        pages.forEach((canvas, index) => { c = canvas.getContext('2d'); text(`${index + 1} / ${pages.length}`, W / 2, H - 50, 20, '#587082', 'center'); if (index) doc.addPage(); doc.addImage(canvas.toDataURL('image/jpeg', .92), 'JPEG', 0, 0, 210, 297); });
        return doc;
    }

    // ---- Start ----
    document.addEventListener('DOMContentLoaded', () => {
        $('#dash-gate form').onsubmit = event => {
            event.preventDefault(); const value = $('#dash-gate input').value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim();
            if (value !== '013') { $('#dash-gate-error').hidden = false; $('#dash-gate input').select(); return; }
            $('#dash-gate-error').hidden = true; setOpen(true);
        };
        $('#dash-lock').onclick = () => { current = null; setOpen(false); };
        $('#dash-search').oninput = renderList;
        // Another tab (an app) saving progress refreshes the open screen.
        window.addEventListener('storage', event => { if (APPS.some(app => app.key === event.key) && isOpen()) route(); });
        route();
    });
    window.SpeechDashboard = { APPS, accounts, children, goalStates };
})();
