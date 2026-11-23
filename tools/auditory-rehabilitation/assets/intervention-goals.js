/* Goal bank for the therapist's intervention plan in «أصوات من حولي». Goals follow the listening ladder the
 * app practises: detection (sudden and continuous sounds), discrimination (level 1 = sounds far apart,
 * level 2 = similar sounds, long/short), identification (2 pictures, 3–4 pictures, the open set of 10)
 * and the memory game. 80% is the user's achievement criterion, not a published norm. */
((root) => {
    'use strict';
    const APP = { id: 'auditory-rehabilitation', name: 'أصوات من حولي', therapistKey: 'auditory-rehabilitation-therapist', unlocksLevels: false, progress: () => root.SoundProgress };
    const SOURCES = {
        'erber-1982': {
            label: 'Erber, N. P. (1982). Auditory Training. Washington, DC: Alexander Graham Bell Association.',
            url: 'https://www.agbell.org/',
            note: 'Listening skills move from detection to discrimination, identification and comprehension.'
        },
        'asha-hl': {
            label: 'ASHA Practice Portal: Permanent Childhood Hearing Loss',
            url: 'https://www.asha.org/practice-portal/clinical-topics/permanent-childhood-hearing-loss/',
            note: 'Auditory skill development is part of intervention for children with hearing loss.'
        }
    };
    const GOALS = [
        {
            id: 'L1', title: 'اكتشاف الصوت',
            text: 'يعرف الطفل متى يوجد صوت ومتى يوجد سكوت.',
            sources: ['erber-1982', 'asha-hl'],
            short: [
                { id: 'S1.1', text: 'يستجيب للأصوات المفاجئة وللسكوت.', where: 'اكتشاف الصوت · أصوات مفاجئة' },
                { id: 'S1.2', text: 'يستجيب للأصوات المستمرة وللسكوت.', where: 'اكتشاف الصوت · أصوات مستمرة' }
            ]
        },
        {
            id: 'L2', title: 'التمييز السمعي',
            text: 'يسمع الطفل صوتين ويعرف أيّهما سمع.',
            sources: ['erber-1982'],
            short: [
                { id: 'S2.1', text: 'يميّز صوتين مختلفين كثيراً.', where: 'التمييز · المستوى 1' },
                { id: 'S2.2', text: 'يميّز صوتين متشابهين.', where: 'التمييز · المستوى 2' },
                { id: 'S2.3', text: 'يميّز الصوت الطويل من القصير.', where: 'طويل وقصير' }
            ]
        },
        {
            id: 'L3', title: 'التعرّف على الصوت',
            text: 'يسمع الطفل الصوت ويختار صورته.',
            sources: ['erber-1982', 'asha-hl'],
            short: [
                { id: 'S3.1', text: 'يختار الصورة من صورتين.', where: 'التعرف · خياران' },
                { id: 'S3.2', text: 'يختار الصورة من 3 أو 4 صور.', where: 'التعرف · 3–4 خيارات' },
                { id: 'S3.3', text: 'يختار الصورة من 10 صور.', where: 'التعرف · المجموعة المفتوحة' }
            ]
        },
        {
            id: 'L4', title: 'الذاكرة السمعية',
            text: 'يتذكّر الطفل الأصوات ومكانها.',
            sources: ['erber-1982'],
            short: [
                { id: 'S4.1', text: 'يجد أزواج الأصوات في لعبة الذاكرة.', where: 'الذاكرة' }
            ]
        },
        {
            id: 'L5', title: 'الاستعمال اليومي',
            text: 'يستعمل الطفل ما تعلّمه في البيت ومع الوقت.',
            sources: ['asha-hl'],
            short: [
                { id: 'S5.1', text: 'ينتبه لأصوات البيت ويشير لمصدرها (حسب الأهل).', where: 'رسالة الأهل' },
                { id: 'S5.2', text: 'يتذكّر المهارة بعد أسبوعين بدون تدريب.', where: 'الاختبارات' }
            ]
        }
    ];
    // Ready-made plans: one tap adds their short-term goals to the child's plan.
    const PLANS = [
        { id: 'P1', title: 'بداية', text: 'الاكتشاف وصوتان مختلفان', goals: ['S1.1', 'S1.2', 'S2.1', 'S3.1'] },
        { id: 'P2', title: 'متوسط', text: 'أصوات متشابهة و3–4 صور', goals: ['S2.2', 'S2.3', 'S3.2', 'S4.1'] },
        { id: 'P3', title: 'متقدم', text: 'المجموعة المفتوحة والاستعمال اليومي', goals: ['S3.3', 'S4.1', 'S5.1', 'S5.2'] }
    ];
    const LEVELS = [20, 40, 60, 80];
    const ACHIEVED = 80;
    const byId = new Map(GOALS.flatMap(goal => goal.short.map(item => [item.id, { ...item, long: goal }])));
    const DAY = 864e5;
    // Sudden and continuous sound ids (assets/data.js), for the two detection goals.
    const SUDDEN = new Set([2, 5, 8, 4, 23, 6, 7, 17, 24, 21, 30, 36, 39, 16, 46, 43, 32, 33, 11, 12, 13, 28, 38, 40, 41].map(String));
    const choices = row => Number(row.choices) || 0;
    // Which saved test answers count for a goal.
    const MEASURES = {
        // Silent trials count for both detection goals; sound trials by the kind of sound played.
        'S1.1': (session, row) => session.skill === 'detection' && (row.target === 'silence' || SUDDEN.has(String(row.target))),
        'S1.2': (session, row) => session.skill === 'detection' && (row.target === 'silence' || !SUDDEN.has(String(row.target))),
        'S2.1': session => session.skill === 'discrimination' && /1/.test(session.activity),
        'S2.2': session => session.skill === 'discrimination' && /2/.test(session.activity),
        'S2.3': session => session.skill === 'duration',
        'S3.1': (session, row) => session.skill === 'identification' && choices(row) === 2,
        'S3.2': (session, row) => session.skill === 'identification' && choices(row) >= 3 && choices(row) <= 4,
        'S3.3': (session, row) => session.skill === 'identification' && choices(row) >= 10,
        'S4.1': session => session.skill === 'memory',
        'S5.2': (session, row, context) => ['detection', 'discrimination', 'identification'].includes(session.skill) && context.gap >= 14
    };
    /** Each test session moves the estimate halfway toward that session's score, so it builds up or falls
     *  back over time. A goal is achieved after 3 sessions in a row at 80% or more. */
    function estimate(child) {
        const sessions = (child?.soundApps?.[APP.id]?.sessions || []).map(session => ({ ...session, time: Date.parse(session.date) || 0 })).sort((a, b) => a.time - b.time);
        const lastTest = new Map(), out = {};
        for (const session of sessions) {
            if (session.kind !== 'assessment' || session.partial || !session.records?.length) continue;
            const context = { gap: lastTest.has(session.skill) ? (session.time - lastTest.get(session.skill)) / DAY : -1 };
            for (const [id, counts] of Object.entries(MEASURES)) {
                let right = 0, total = 0;
                for (const row of session.records) if (counts(session, row, context)) { total++; if (row.correct) right++; }
                if (!total) continue;
                const score = Math.round(right / total * 100), goal = out[id] ||= { percent: null, sessions: 0, streak: 0, achieved: null, history: [] };
                goal.percent = goal.percent == null ? score : Math.round((goal.percent + score) / 2);
                goal.sessions++; goal.streak = score >= ACHIEVED ? goal.streak + 1 : 0;
                goal.last = new Date(session.time).toISOString(); goal.history.push({ date: goal.last, score, percent: goal.percent });
                if (goal.streak >= 3 && !goal.achieved) goal.achieved = goal.last;
            }
            lastTest.set(session.skill, session.time);
        }
        return out;
    }
    /** Suggested next goals: after an achieved goal, the next goal of the same long-term goal not in the plan yet. */
    function suggest(planIds, achievedIds, limit = 4) {
        const inPlan = new Set(planIds), done = new Set(achievedIds), out = [];
        for (const goal of GOALS) { const ids = goal.short.map(item => item.id); if (!ids.some(id => done.has(id))) continue; const next = ids.find(id => !inPlan.has(id)); if (next) out.push(next); }
        return out.slice(0, limit);
    }
    const api = { MEASURES, estimate, suggest, APP, SOURCES, GOALS, PLANS, LEVELS, ACHIEVED, short: id => byId.get(id) || null };
    if (typeof module !== 'undefined') module.exports = api;
    root.InterventionGoals = api;
})(globalThis);
