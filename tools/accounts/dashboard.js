/* Children's accounts dashboard. The builder apps are published on the same site
 * (hamada013.github.io/<app>/), so their saved progress is readable here. This page only reads it.
 * Children with the same name in different apps are shown as one child; different spellings can be
 * linked by hand. For each child: every app's report alone, or all apps together, and PDFs.
 *
 * The clinic's online database (speech-cloud.js): once the therapist signs in with Google, every child saved there
 * (with their 6-digit number) and their assessments show here by themselves, joined to this device's accounts by name.
 *
 * «ملف الطفل» files from other devices (the apps' share button, and assessment forms on the speech website)
 * are imported here and kept on this device: their progress shows beside this device's, labelled with who
 * recorded it, and assessments show in their own section. A newer file from the same device replaces the older.
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
        { id: 'follow', name: 'اتبع التعليمات', color: '#16a34a', key: 'follow-direction-children-v1', url: '../../follow-direction/', goals: ['../../follow-direction/assets/bank.js', '../../follow-direction/assets/intervention-goals.js'],
            skills: { one: 'حركة واحدة', objects: 'أشياء مألوفة', attributes: 'لون وحجم', quantity: 'واحد واثنان وثلاثة', function: 'استخدام الأشياء', space: 'المكان', two: 'حركتان بالترتيب', order: 'أشياء بالترتيب', play: 'خطوتان في اللعب', condition: 'إذا…', three: 'ثلاث خطوات' },
            sources: { practice: 'التدريب', screen: 'الفرز' },
            // Answers count when done without help; the plan is the therapist's intervention plan (goal bank in the app).
            read: child => {
                const skillOf = item => String(item || '').replace(/[-_]?\d+$/, '');
                const sessions = (child.sessions || []).filter(s => s.ended).map(s => {
                    const skills = {};
                    for (const r of s.results || []) { if (r.outcome === 'skip') continue; const k = skills[skillOf(r.item)] ||= { correct: 0, total: 0 }; k.total++; if (r.outcome === 'independent') k.correct++; }
                    return { date: s.finished || s.started, kind: s.mode === 'screen' ? 'assessment' : 'practice', source: s.mode, skills, raw: s };
                });
                return { level: null, plan: child.intervention || null, sessions };
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
    const LINKS_KEY = 'speech-dashboard-links-v1', LOCK_KEY = 'speech-dashboard-therapist', IMPORTS_KEY = 'speech-dashboard-imports-v1', DEVICE_KEY = 'speech-device-id-v1';
    const store = { get: (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }, set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } } };
    function accounts() {
        const out = [];
        for (const app of APPS) {
            const data = store.get(app.key, null);
            for (const child of data?.children || []) {
                if (!child?.id || child.role === 'admin' || data.deletedChildren?.[child.id]) continue;
                let read; try { read = app.read(child); } catch { continue; }
                read.sessions = read.sessions.filter(s => s.date).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
                out.push({ ref: `${app.id}:${child.id}`, app, id: child.id, name: child.name || 'بدون اسم', created: child.created, child, from: null, ...read });
            }
        }
        // Progress from other devices' child files; this device's own files are already shown above.
        const here = (() => { try { return localStorage.getItem(DEVICE_KEY); } catch { return null; } })();
        for (const { file } of imports()) {
            if (file.device === here) continue;
            for (const entry of file.accounts) {
                const app = APPS.find(item => item.id === entry.app), child = entry.child; if (!app) continue;
                let read; try { read = app.read(child); } catch { continue; }
                read.sessions = read.sessions.filter(s => s.date).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
                out.push({ ref: `file:${file.device}:${app.id}:${child.id}`, app, id: child.id, name: child.name || file.child.name, created: child.created, child, from: { ...file.recorder, exported: file.exported, device: file.device }, ...read });
            }
        }
        return out;
    }
    // ---- «ملف الطفل» files ----
    const ROLES = { therapist: 'المعالج', parents: 'الأهل', other: 'معالج آخر' };
    const sourceLabel = from => from ? [ROLES[from.role] || 'جهاز آخر', from.name].filter(Boolean).join(' · ') : 'هذا الجهاز';
    const imports = () => store.get(IMPORTS_KEY, []).filter(entry => entry?.file?.format === 'speech-child-file');
    const validSection = section => section && typeof section.title === 'string' && Array.isArray(section.items) && section.items.every(item => item && typeof item.label === 'string' && typeof item.value === 'string');
    function checkFile(file) {
        if (file?.format !== 'speech-child-file' || file.version !== 1) throw Error('ليس ملف طفل من التطبيقات.');
        if (typeof file.device !== 'string' || !file.device || typeof file.child?.name !== 'string' || !file.child.name.trim() || Number.isNaN(Date.parse(file.exported))) throw Error('ملف الطفل غير مكتمل.');
        if (!Array.isArray(file.accounts) || !file.accounts.every(entry => entry && typeof entry.app === 'string' && entry.child && typeof entry.child.id === 'string')) throw Error('بيانات التطبيقات في الملف غير صالحة.');
        if (!Array.isArray(file.assessments) || !file.assessments.every(a => a && typeof a.form === 'string' && typeof a.title === 'string' && Array.isArray(a.sections) && a.sections.every(validSection))) throw Error('بيانات التقييم في الملف غير صالحة.');
        file.recorder = { role: ROLES[file.recorder?.role] ? file.recorder.role : 'other', name: String(file.recorder?.name || '').slice(0, 60) };
        return file;
    }
    // One entry per device, child and kind (apps, or one assessment form and date): a newer file replaces it.
    const fileId = file => [file.device, normalizeName(file.child.name), file.accounts.length ? 'apps' : file.assessments.map(a => `${a.form}@${a.date || ''}`).join(',')].join('|');
    async function importFiles(list) {
        const saved = imports(), notes = [];
        for (const input of list) {
            try {
                if (input.size > 8e6) throw Error('الملف كبير جداً.');
                const file = checkFile(JSON.parse(await input.text())), id = fileId(file), old = saved.findIndex(entry => entry.id === id);
                if (old >= 0 && Date.parse(saved[old].file.exported) > Date.parse(file.exported)) { notes.push(`${file.child.name}: لدينا ملف أحدث من نفس الجهاز.`); continue; }
                const entry = { id, received: new Date().toISOString(), file };
                if (old >= 0) saved[old] = entry; else saved.push(entry);
                notes.push(`${file.child.name}: ${old >= 0 ? 'حُدّث' : 'أضيف'} (${sourceLabel(file.recorder)}).`);
            } catch (error) { notes.push(`${input.name}: ${error instanceof SyntaxError ? 'ليس ملف طفل.' : error.message}`); }
        }
        if (!store.set(IMPORTS_KEY, saved)) notes.push('تعذّر الحفظ: مساحة التخزين على هذا الجهاز ممتلئة.');
        return notes;
    }
    function removeImport(id) { store.set(IMPORTS_KEY, imports().filter(entry => entry.id !== id)); }
    // ---- The clinic's online database ----
    const cloud = { user: null, children: [], assessments: new Map(), records: new Map(), devices: [], error: '', busy: false };
    async function refreshCloud() {
        const C = window.SpeechCloud; if (!C || !cloud.user) return;
        cloud.busy = true; cloud.error = '';
        try {
            const list = await C.children(), [all, recs, devs] = await Promise.all([Promise.all(list.map(child => C.assessments(child.id).catch(() => []))), Promise.all(list.map(child => C.records(child.id).catch(() => []))), C.devices().catch(() => [])]);
            cloud.children = list; cloud.assessments = new Map(list.map((child, index) => [child.id, all[index]])); cloud.records = new Map(list.map((child, index) => [child.id, recs[index]])); cloud.devices = devs;
        } catch (error) { cloud.error = C.explain(error); }
        cloud.busy = false; if (isOpen()) route();
    }
    // Assessments from imported files, each with its child's name and its source.
    const assessments = () => imports().flatMap(({ file }) => file.assessments.map((a, index) => ({ ...a, ref: `${fileId(file)}#${index}`, name: a.child?.name || file.child.name, from: { ...file.recorder, exported: file.exported } })));
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
        // Assessments join the child with the same name; a child with only an assessment gets their own card.
        for (const a of assessments()) {
            const named = [...groups.values()].find(group => group.accounts.some(account => normalizeName(account.name) === normalizeName(a.name)));
            const group = named || groups.get(`assess:${normalizeName(a.name)}`) || { key: `assess:${normalizeName(a.name)}`, accounts: [], name: a.name };
            (group.assessments ||= []).push(a); groups.set(group.key, group);
        }
        // Children in the clinic's database: joined to the board with the same name, or a board of their own.
        for (const child of cloud.children) {
            const named = [...groups.values()].find(group => !group.cloud && (group.accounts.some(account => normalizeName(account.name) === normalizeName(child.name)) || normalizeName(group.name) === normalizeName(child.name)));
            const group = named || { key: `cloud:${child.id}`, accounts: [], name: child.name };
            group.cloud = child; group.name = child.name;
            // Progress the apps sent from other devices (this computer's own apps are already shown above).
            for (const rec of cloud.records.get(child.id) || []) {
                const app = APPS.find(item => item.id === rec.app); if (!app || rec.device === cloud.user?.uid) continue;
                let read; try { read = app.read(rec.child); } catch { continue; }
                read.sessions = read.sessions.filter(x => x.date).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
                group.accounts.push({ ref: `cloud:${child.id}:${rec.id}`, app, id: rec.child.id, name: child.name, created: rec.child.created, child: rec.child, from: { role: rec.role, name: rec.label, exported: rec.updated }, ...read });
            }
            for (const a of cloud.assessments.get(child.id) || []) (group.assessments ||= []).push({ ...a, ref: `cloud:${child.id}:${a.id}`, name: child.name, from: { role: 'therapist', name: a.examiner || '', exported: a.saved } });
            groups.set(group.key, group);
        }
        return [...groups.values()].map(group => ({ ...group, assessments: group.assessments || [], name: group.cloud?.name || group.accounts[0]?.name || group.name,
            last: Math.max(0, ...group.accounts.flatMap(a => a.sessions.map(s => Date.parse(s.date) || 0)), ...(group.assessments || []).map(a => Date.parse(a.date) || 0)) }))
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
        $('#dash-gate').hidden = open; $('#dash-lock').hidden = !open; $('#dash-import').hidden = !open; $('#dash-cloud').hidden = !open || !window.SpeechCloud;
        $('#dash-list').hidden = !open || !!current; $('#dash-child').hidden = !open || !current;
        if (!open) { $('#dash-gate input').value = ''; $('#dash-gate input').focus(); return; }
        if (current) renderChild(); else renderList();
    }
    function renderList() {
        const query = normalizeName($('#dash-search').value), all = children(), list = all.filter(child => normalizeName(child.name).includes(query));
        $('#dash-count').textContent = `${all.length} طفل`;
        const line = $('#dash-cloud-line'); line.hidden = !window.SpeechCloud; line.dataset.state = cloud.error ? 'error' : cloud.user ? 'on' : 'off';
        line.textContent = cloud.error || (cloud.user ? (cloud.busy ? 'جارٍ التحميل من قاعدة بيانات العيادة…' : `متصل بقاعدة بيانات العيادة · ${cloud.children.length} طفل محفوظ`) : 'سجّل الدخول بحساب العيادة (زر السحابة) لعرض ما حُفظ في قاعدة البيانات.');
        $('#dash-children').replaceChildren(...list.map(child => {
            const button = document.createElement('button'); button.type = 'button'; button.className = 'dash-child-card'; button.setAttribute('role', 'listitem');
            button.innerHTML = `<strong>${esc(child.name)}${child.cloud?.code ? ` <bdi class="dash-code" dir="ltr">${esc(window.SpeechCloud.formatCode(child.cloud.code))}</bdi>` : ''}</strong><span class="dash-apps">${child.accounts.map(a => `<i style="--app:${a.app.color}"${a.from ? ` title="${esc(sourceLabel(a.from))}"` : ''}>${a.app.name}${a.from ? ' · ' + esc(ROLES[a.from.role] || '') : ''}</i>`).join('')}${child.assessments.length ? `<i style="--app:#475569">تقييم (${child.assessments.length})</i>` : ''}</span><small>${child.last ? 'آخر جلسة ' + date(child.last) : 'لا توجد جلسات بعد'}</small>`;
            button.onclick = () => { current = child.key; view = 'all'; route(); window.scrollTo(0, 0); };
            return button;
        }));
        $('#dash-empty').hidden = !!list.length;
        const devBox = $('#dash-devices'); devBox.hidden = !cloud.user;
        if (cloud.user) {
            devBox.innerHTML = `<summary>الأجهزة المرتبطة بالعيادة (${cloud.devices.length})</summary><p><button type="button" class="dash-pill" data-join-all>ربط جهاز المعالج (كل الأطفال)</button></p><ul>${cloud.devices.map(d => `<li><span><b>${esc(d.label || 'جهاز')}</b><small>${esc(ROLES[d.role] || '')} · ${d.all ? 'كل الأطفال' : `${(d.children || []).length} طفل`} · ${date(d.joined)}</small></span><button type="button" class="dash-icon" data-remove-device="${esc(d.id)}" aria-label="فصل ${esc(d.label || 'الجهاز')}" title="فصل الجهاز">${TRASH}</button></li>`).join('')}</ul>`;
            devBox.querySelector('[data-join-all]').onclick = () => joinDialog({ all: true, role: 'therapist', apps: ['voc'] });
            devBox.querySelectorAll('[data-remove-device]').forEach(button => twoTaps(button, async () => { await window.SpeechCloud.removeDevice(button.dataset.removeDevice); await refreshCloud(); }, 'اضغط مرة أخرى لفصل الجهاز'));
        }
        const files = imports(), box = $('#dash-files');
        box.hidden = !files.length;
        box.innerHTML = files.length ? `<summary>الملفات المستوردة (${files.length})</summary><ul>${files.map(({ id, file }) => `<li><span><b>${esc(file.child.name)}</b><small>${esc(sourceLabel(file.recorder))} · ${date(file.exported)} · ${file.accounts.length ? file.accounts.map(e => APPS.find(app => app.id === e.app)?.name || e.app).join('، ') : file.assessments.map(a => esc(a.title)).join('، ')}</small></span><button type="button" class="dash-icon" data-remove-file="${esc(id)}" aria-label="حذف ملف ${esc(file.child.name)} من هذا الجهاز" title="حذف الملف"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button></li>`).join('')}</ul>` : '';
        // Two taps remove an imported copy (the first turns the button red); the file can be opened again later.
        box.querySelectorAll('[data-remove-file]').forEach(button => { button.onclick = () => {
            if (button.dataset.armed) { removeImport(button.dataset.removeFile); renderList(); return; }
            button.dataset.armed = '1'; button.title = 'اضغط مرة أخرى للحذف'; button.setAttribute('aria-label', 'اضغط مرة أخرى لحذف الملف');
            setTimeout(() => { if (button.isConnected) { delete button.dataset.armed; button.title = 'حذف الملف'; } }, 3000);
        }; });
        $('#dash-empty').textContent = all.length ? 'لا يوجد اسم مطابق.' : 'لا توجد حسابات أطفال على هذا الجهاز بعد. أضف الأطفال من داخل التطبيقات، أو افتح «ملف طفل» من جهاز آخر.';
    }
    const bar = (label, value, color, detail) => `<div class="dash-bar"><span class="dash-bar-label">${esc(label)}</span><span class="dash-bar-track"><i style="width:${value ?? 0}%;background:${color}"></i></span><b dir="ltr">${value == null ? '—' : value + '%'}</b>${detail ? `<small>${detail}</small>` : ''}</div>`;
    async function appSection(account) {
        const t = totals(account), app = account.app;
        const bank = await goalBank(app), goals = goalStates(bank, account.plan, account.child);
        const goalList = (state, title, rows, extra = row => row.percent == null ? 'لم يُقيّم' : `${row.percent}%${row.by === 'app' ? ' · تقدير' : ''}`) => rows.length ? `<div class="dash-goals" data-state="${state}"><h4>${title} <small>(${rows.length})</small></h4>${rows.map(row => `<p><span>${esc(row.text)}</span><b>${state === 'suggested' ? 'مقترح' : extra(row)}</b></p>`).join('')}</div>` : '';
        return `<section class="dash-app" style="--app:${app.color}"><header><h3>${app.name}</h3><span class="dash-source" data-from="${account.from ? account.from.role : 'here'}">${esc(sourceLabel(account.from))}${account.from ? ' · ' + date(account.from.exported) : ''}</span>${account.level ? `<span class="dash-level" data-level="${account.level}">${LEVELS[account.level] || account.level}</span>` : ''}<a href="${app.url}" class="dash-open">فتح التطبيق</a></header>
            <div class="dash-stats"><div><strong>${t.sessions}</strong><span>جلسات</span></div><div><strong>${t.tests}</strong><span>اختبارات</span></div><div><strong>${t.last ? date(t.last) : '—'}</strong><span>آخر جلسة</span></div></div>
            ${Object.entries(app.skills).map(([id, label]) => bar(label, t.skills[id].percent, app.color, t.skills[id].total ? `<bdi dir="ltr">${t.skills[id].correct} / ${t.skills[id].total}</bdi>` : 'لم يُقيّم')).join('')}
            ${t.recent.length ? `<h4 class="dash-sub">آخر الاختبارات</h4><ul class="dash-recent">${t.recent.map(s => `<li><span>${date(s.date)}</span><span>${esc(app.sources[s.source] || 'اختبار')}</span><b dir="ltr">${scoreOf(s) ?? '—'}%</b></li>`).join('')}</ul>` : ''}
            ${goals ? `<h4 class="dash-sub">أهداف خطة التدخل · ${goals.percent}%</h4>${goalList('working', 'نعمل عليها الآن', goals.working)}${goalList('done', 'تحققت', goals.done)}${goalList('suggested', 'مقترحة', goals.suggested)}` : account.plan?.goals?.length ? '<p class="dash-note">افتح التطبيق مرة مع الإنترنت لعرض أهدافه هنا.</p>' : '<p class="dash-note">لا توجد خطة تدخل في هذا التطبيق.</p>'}
        </section>`;
    }
    const TRASH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
    // One assessment from the speech website: its sections with each answered question.
    const assessmentSection = a => `<section class="dash-app dash-assessment" style="--app:#475569"><header><h3>${esc(a.title)}</h3><span class="dash-source" data-from="${a.from.role}">${esc(sourceLabel(a.from))}</span><span class="dash-level">${a.date ? date(a.date) : date(a.from.exported)}</span>${a.ref.startsWith('cloud:') ? `<button type="button" class="dash-icon dash-danger" data-remove-assessment="${esc(a.ref)}" aria-label="حذف هذا التقييم من قاعدة البيانات" title="حذف من قاعدة البيانات">${TRASH}</button>` : ''}</header>
        ${a.sections.filter(section => section.items.length).map(section => `<details><summary>${esc(section.title)} <small>(${section.items.length})</small></summary><dl>${section.items.map(item => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.value).replace(/\n/g, '<br>')}</dd></div>`).join('')}</dl></details>`).join('')}</section>`;
    // ---- Board tools for the clinic's database ----
    const APP_IDS = ['voc', 'senb', 'taffaha', 'follow'];
    // Two taps for anything that deletes: the first turns the button red for three seconds.
    function twoTaps(button, action, again = 'اضغط مرة أخرى للتأكيد') {
        button.onclick = async () => {
            if (!button.dataset.armed) { button.dataset.armed = '1'; const old = button.title; button.title = again; button.setAttribute('aria-label', again); setTimeout(() => { if (button.isConnected) { delete button.dataset.armed; button.title = old; button.setAttribute('aria-label', old); } }, 3000); return; }
            button.disabled = true; try { await action(); } catch (error) { cloud.error = window.SpeechCloud.explain(error); route(); }
        };
    }
    function cloudTools(child) {
        if (!cloud.user || !window.SpeechCloud) return '';
        if (!child.cloud) return `<div class="dash-cloud-tools"><p>هذا الطفل ليس في قاعدة بيانات العيادة بعد.</p><button type="button" class="dash-pill" data-cloud-create>حفظ في قاعدة البيانات وإعطاؤه رقماً</button></div>`;
        const apps = child.cloud.apps || [];
        return `<div class="dash-cloud-tools"><div class="dash-cloud-apps" role="group" aria-label="التطبيقات التي يظهر فيها الطفل"><span>يظهر في:</span>${APP_IDS.map(id => { const app = APPS.find(item => item.id === id); return `<button type="button" class="dash-pill" style="--app:${app.color}" data-app-toggle="${id}" aria-pressed="${apps.includes(id)}">${app.name}</button>`; }).join('')}</div>
            <div class="dash-cloud-apps${child.cloud.until ? '' : ' dash-need'}" role="group" aria-label="مدة حساب الطفل"><span>مدة الحساب:</span>${[3, 6, 9, 12].map(m => `<button type="button" class="dash-pill" data-months="${m}" aria-pressed="${child.cloud.months === m}">${m} أشهر</button>`).join('')}
                <small class="dash-until" data-state="${!child.cloud.until ? 'none' : Date.parse(child.cloud.until) < Date.now() ? 'ended' : 'ok'}">${!child.cloud.until ? 'اختر المدة ليفتح الأهل التطبيقات' : Date.parse(child.cloud.until) < Date.now() ? `انتهت في ${date(child.cloud.until)} · مقفل حتى التجديد` : `صالح حتى ${date(child.cloud.until)}`}</small></div>
            <div class="dash-cloud-actions"><button type="button" class="dash-pill" data-share-parents>مشاركة مع الأهل (الاسم والرقم)</button><button type="button" class="dash-icon dash-danger" data-cloud-remove aria-label="حذف ${esc(child.name)} من قاعدة البيانات" title="حذف من قاعدة البيانات">${TRASH}</button></div></div>`;
    }
    function wireCloudTools(host, child) {
        const C = window.SpeechCloud; if (!C || !cloud.user) return;
        host.querySelector('[data-cloud-create]')?.addEventListener('click', async event => { event.currentTarget.disabled = true; try { await C.createChild({ name: child.name }); await refreshCloud(); } catch (error) { cloud.error = C.explain(error); route(); } });
        host.querySelectorAll('[data-app-toggle]').forEach(button => { button.onclick = async () => {
            const apps = new Set(child.cloud.apps || []); apps.has(button.dataset.appToggle) ? apps.delete(button.dataset.appToggle) : apps.add(button.dataset.appToggle);
            button.setAttribute('aria-pressed', String(apps.has(button.dataset.appToggle)));
            try { await C.setApps(child.cloud.id, [...apps]); await refreshCloud(); } catch (error) { cloud.error = C.explain(error); route(); }
        }; });
        host.querySelectorAll('[data-months]').forEach(button => { button.onclick = async () => { button.disabled = true; try { await C.setUntil(child.cloud, Number(button.dataset.months)); await refreshCloud(); } catch (error) { cloud.error = C.explain(error); route(); } }; });
        const share = host.querySelector('[data-share-parents]'); if (share) share.onclick = () => shareDialog(child.cloud);
        const remove = host.querySelector('[data-cloud-remove]'); if (remove) twoTaps(remove, async () => { await C.removeChild(child.cloud.id); current = null; await refreshCloud(); route(); }, `اضغط مرة أخرى لحذف ${child.name} من قاعدة البيانات`);
        host.querySelectorAll('[data-remove-assessment]').forEach(button => { const [, childId, id] = button.dataset.removeAssessment.split(':'); twoTaps(button, async () => { await C.removeAssessment(childId, id); await refreshCloud(); }); });
    }
    // «مشاركة مع الأهل»: the child's name, number, end date and app links, ready to send.
    async function shareDialog(child) {
        if (!joinBox) { joinBox = document.createElement('dialog'); joinBox.className = 'dash-print-dialog dash-join'; joinBox.dir = 'rtl'; document.body.append(joinBox); }
        const apps = (child.apps || []).map(id => APPS.find(app => app.id === id)).filter(Boolean);
        if (!apps.length || !child.until) {
            joinBox.innerHTML = `<h2>مشاركة مع الأهل</h2><p>${!apps.length ? 'اختر أولاً التطبيقات التي يظهر فيها الطفل' : 'اختر أولاً مدة الحساب (3 أو 6 أو 9 أو 12 شهراً)'}.</p><footer><button type="button" data-done>حسناً</button></footer>`;
            joinBox.querySelector('[data-done]').onclick = () => joinBox.close(); joinBox.showModal(); return;
        }
        joinBox.innerHTML = '<h2>مشاركة مع الأهل</h2><p>جارٍ التجهيز…</p>'; joinBox.showModal();
        try {
            await window.SpeechCloud.ticket(child);
            const number = window.SpeechCloud.formatCode(child.code), links = apps.map(app => `${app.name}: ${new URL(app.url, location.href).href}`);
            const text = `دخول ${child.name} إلى تطبيقات العيادة\nاسم الطفل: ${child.name}\nرقم الطفل: ${number}\nصالح حتى: ${date(child.until)}\n\nافتح التطبيق واكتب الاسم والرقم:\n${links.join('\n')}`;
            joinBox.innerHTML = `<h2>مشاركة مع الأهل · ${esc(child.name)}</h2>
                <p>يكتب الأهل الاسم والرقم في شاشة الدخول لكل تطبيق. يعمل الرقم حتى ${date(child.until)}.</p>
                <p class="dash-join-code" dir="ltr">${number}</p><pre class="dash-join-link">${esc(text)}</pre>
                <footer>${navigator.share ? '<button type="button" data-share>مشاركة</button>' : ''}<button type="button" data-copy>نسخ النص</button><button type="button" data-done>تم</button></footer>`;
            joinBox.querySelector('[data-share]')?.addEventListener('click', () => navigator.share({ title: `دخول ${child.name}`, text }).catch(() => {}));
            joinBox.querySelector('[data-copy]').onclick = async event => { try { await navigator.clipboard.writeText(text); event.target.textContent = 'نُسخ'; } catch {} };
        } catch (error) { joinBox.innerHTML = `<h2>مشاركة مع الأهل</h2><p class="dash-print-error">${esc(window.SpeechCloud.explain(error))}</p><footer><button type="button" data-done>إغلاق</button></footer>`; }
        joinBox.querySelector('[data-done]').onclick = () => joinBox.close();
    }
    // A join code for a device: the therapist's own iPad (all children) or a parents' device (chosen children).
    let joinBox;
    async function joinDialog({ all = false, children: ids = [], role = 'parents', who = '', apps = [] }) {
        if (!joinBox) { joinBox = document.createElement('dialog'); joinBox.className = 'dash-print-dialog dash-join'; joinBox.dir = 'rtl'; document.body.append(joinBox); }
        joinBox.innerHTML = '<h2>ربط جهاز</h2><p>جارٍ إنشاء الرمز…</p>'; joinBox.showModal();
        try {
            const { code, expires } = await window.SpeechCloud.makeJoinCode({ all, children: ids, role });
            const first = APPS.find(app => app.id === (apps[0] || 'voc')), link = new URL(first.url + '?join=' + code, location.href).href;
            joinBox.innerHTML = `<h2>ربط جهاز${who ? ' · ' + esc(who) : all ? ' المعالج' : ''}</h2>
                <p>افتح هذا الرابط على الجهاز (أرسله عبر واتساب أو AirDrop)، أو اكتب الرمز في زر السحابة داخل أي تطبيق. يكفي الربط مرة واحدة لكل التطبيقات على الجهاز.</p>
                <p class="dash-join-code" dir="ltr">${code.replace(/^(.{4})/, '$1-')}</p><p class="dash-note">صالح حتى ${date(expires.toISOString())} · ${all ? 'كل الأطفال' : 'هذا الطفل فقط'}</p>
                <p class="dash-join-link" dir="ltr">${esc(link)}</p>
                <footer>${navigator.share ? '<button type="button" data-share>مشاركة الرابط</button>' : ''}<button type="button" data-copy>نسخ الرابط</button><button type="button" data-done>تم</button></footer>`;
            joinBox.querySelector('[data-share]')?.addEventListener('click', () => navigator.share({ title: 'ربط الجهاز بالعيادة', text: `رمز الربط: ${code}`, url: link }).catch(() => {}));
            joinBox.querySelector('[data-copy]').onclick = async event => { try { await navigator.clipboard.writeText(link); event.target.textContent = 'نُسخ'; } catch {} };
        } catch (error) { joinBox.innerHTML = `<h2>ربط جهاز</h2><p class="dash-print-error">${esc(window.SpeechCloud.explain(error))}</p><footer><button type="button" data-done>إغلاق</button></footer>`; }
        joinBox.querySelector('[data-done]').onclick = () => joinBox.close();
    }
    async function renderChild() {
        const child = children().find(entry => entry.key === current);
        if (!child) { current = null; route(); return; }
        const host = $('#dash-child'), accountsShown = view === 'all' ? child.accounts : child.accounts.filter(a => a.ref === view);
        const others = accounts().filter(a => !child.accounts.some(own => own.ref === a.ref));
        host.innerHTML = `<div class="dash-child-head"><button type="button" class="dash-icon" data-back aria-label="كل الأطفال" title="كل الأطفال"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button><h2 id="dash-child-name">${esc(child.name)}</h2>${child.cloud?.code ? `<span class="dash-code" title="رقم الطفل">رقم الطفل <bdi dir="ltr">${esc(window.SpeechCloud.formatCode(child.cloud.code))}</bdi></span>` : ''}<button type="button" class="dash-print" data-print><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z"/></svg>طباعة</button></div>
            ${cloudTools(child)}
            <nav class="dash-tabs" aria-label="التطبيقات">${[['all', 'كل التطبيقات'], ...child.accounts.map(a => [a.ref, a.app.name + (a.from ? ' · ' + (ROLES[a.from.role] || '') : '')]), ...(child.assessments.length ? [['assess', 'التقييمات']] : [])].map(([id, label]) => `<button type="button" data-view="${id}" aria-pressed="${view === id}">${label}</button>`).join('')}</nav>
            <nav class="dash-periods" aria-label="الفترة">${Object.entries(PERIODS).map(([id, [label]]) => `<button type="button" data-period="${id}" aria-pressed="${period === id}">${label}</button>`).join('')}</nav>
            <div class="dash-sections">${view === 'all' || view === 'assess' ? child.assessments.map(assessmentSection).join('') : ''}${(await Promise.all((view === 'assess' ? [] : accountsShown).map(appSection))).join('')}</div>
            <details class="dash-link"><summary>ربط حساب بنفس الطفل باسم مختلف</summary>
                ${others.length ? `<p>اختر حساب هذا الطفل في تطبيق آخر إن كُتب اسمه بشكل مختلف.</p><div class="dash-link-list">${others.map(a => `<button type="button" data-link="${a.ref}"><i style="--app:${a.app.color}">${a.app.name}${a.from ? ' · ' + esc(ROLES[a.from.role] || '') : ''}</i>${esc(a.name)}</button>`).join('')}</div>` : '<p>لا توجد حسابات أخرى للربط.</p>'}
                ${child.accounts.length > 1 ? `<p>فك الربط:</p><div class="dash-link-list">${child.accounts.map(a => `<button type="button" data-unlink="${a.ref}"><i style="--app:${a.app.color}">${a.app.name}</i>${esc(a.name)} ×</button>`).join('')}</div>` : ''}
            </details>`;
        host.querySelector('[data-back]').onclick = () => { current = null; route(); };
        wireCloudTools(host, child);
        host.querySelectorAll('[data-view]').forEach(button => { button.onclick = () => { view = button.dataset.view; renderChild(); }; });
        host.querySelectorAll('[data-period]').forEach(button => { button.onclick = () => { period = button.dataset.period; renderChild(); }; });
        host.querySelectorAll('[data-link]').forEach(button => { button.onclick = () => { if (child.accounts[0]) link(button.dataset.link, child.accounts[0].ref); renderChild(); }; });
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
            ensure(330); text(account.from ? `${app.name} · ${sourceLabel(account.from)}` : app.name, W - M, y + 20, 34, app.color); if (account.level) text(LEVELS[account.level] || '', M, y + 20, 24, '#587082', 'left'); y += 60;
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
        // Google sign-in for the clinic's database; two taps sign out.
        const cloudButton = $('#dash-cloud');
        const paint = () => { cloudButton.dataset.state = cloud.user ? 'on' : 'off'; const label = cloud.user ? `متصل بقاعدة بيانات العيادة (${cloud.user.email}) · اضغط مرتين لتسجيل الخروج` : 'تسجيل الدخول إلى قاعدة بيانات العيادة'; cloudButton.title = label; cloudButton.setAttribute('aria-label', label); };
        if (window.SpeechCloud) {
            window.SpeechCloud.onUser(user => { cloud.user = user; cloud.children = []; cloud.assessments = new Map(); cloud.records = new Map(); paint();
                // The apps on this computer share this sign-in: they send their progress too.
                try { const st = JSON.parse(localStorage.getItem('speech-sync-state-v1') || 'null'); if (user) localStorage.setItem('speech-sync-state-v1', JSON.stringify({ mode: 'owner' })); else if (st?.mode === 'owner') localStorage.removeItem('speech-sync-state-v1'); } catch {} if (user) refreshCloud(); else if (isOpen()) route(); });
            cloudButton.onclick = async () => {
                if (!cloud.user) { try { await window.SpeechCloud.signIn(); } catch (error) { cloud.error = window.SpeechCloud.explain(error); route(); } return; }
                if (!cloudButton.dataset.armed) { cloudButton.dataset.armed = '1'; setTimeout(() => delete cloudButton.dataset.armed, 3000); return; }
                delete cloudButton.dataset.armed; await window.SpeechCloud.signOut();
            };
            paint();
        }
        // «ملف طفل» from another device: one or more files at once.
        const picker = $('#dash-import-file'), note = $('#dash-import-note');
        $('#dash-import').onclick = () => picker.click();
        picker.onchange = async () => {
            if (!picker.files.length) return;
            const notes = await importFiles([...picker.files]); picker.value = '';
            note.textContent = notes.join('\n'); note.hidden = false; clearTimeout(note.timer); note.timer = setTimeout(() => { note.hidden = true; }, 9000);
            route();
        };
        // Another tab (an app) saving progress refreshes the open screen.
        window.addEventListener('storage', event => { if ((APPS.some(app => app.key === event.key) || event.key === IMPORTS_KEY) && isOpen()) route(); });
        route();
    });
    window.SpeechDashboard = { APPS, accounts, children, goalStates, importFiles, imports, assessments, refreshCloud, cloud };
})();
