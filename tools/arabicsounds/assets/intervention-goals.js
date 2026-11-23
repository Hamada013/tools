/* Goal bank for the therapist's intervention plan in «أصواتي العربية». Goals follow what the app practises
 * and measures: speech-sound pairs (practice and the 10-trial test, level 1 = sounds far apart, level 2 =
 * close sounds), the Ling six-sound check (detection and identification), and the matching and memory games.
 * 80% is the user's achievement criterion, not a published norm. */
((root) => {
    'use strict';
    const APP = { id: 'arabicsounds', name: 'أصواتي العربية', therapistKey: 'arabicsounds-therapist', unlocksLevels: false, progress: () => root.SoundProgress };
    const SOURCES = {
        'asha-hl': {
            label: 'ASHA Practice Portal: Permanent Childhood Hearing Loss',
            url: 'https://www.asha.org/practice-portal/clinical-topics/permanent-childhood-hearing-loss/',
            note: 'Auditory skill development and speech perception are part of intervention for children with hearing loss.'
        },
        'ling-1976': {
            label: 'Ling, D. (1976). Speech and the Hearing-Impaired Child: Theory and Practice. Washington, DC: Alexander Graham Bell Association.',
            url: 'https://www.agbell.org/',
            note: 'The six-sound check covers low, middle and high speech frequencies.'
        },
        'erber-1982': {
            label: 'Erber, N. P. (1982). Auditory Training. Washington, DC: Alexander Graham Bell Association.',
            url: 'https://www.agbell.org/',
            note: 'Listening skills move from detection to discrimination, identification and comprehension.'
        }
    };
    const GOALS = [
        {
            id: 'L1', title: 'تمييز أصوات الكلام',
            text: 'يسمع الطفل صوتين من أصوات الكلام ويعرف أيّهما سمع.',
            sources: ['erber-1982', 'asha-hl'],
            short: [
                { id: 'S1.1', text: 'يميّز صوتين مختلفين كثيراً.', where: 'التدريب والاختبار · المستوى ١' },
                { id: 'S1.2', text: 'يميّز صوتين متقاربين.', where: 'التدريب والاختبار · المستوى ٢' },
                { id: 'S1.3', text: 'ينجح في الاختبار من أول مرة بدون تدريب قبله.', where: 'الاختبار' }
            ]
        },
        {
            id: 'L2', title: 'أصوات لينغ',
            text: 'يسمع الطفل أصوات لينغ الستة ويعرفها.',
            sources: ['ling-1976', 'asha-hl'],
            short: [
                { id: 'S2.1', text: 'يعرف متى يوجد صوت ومتى يوجد سكوت.', where: 'أصوات لينغ · الاكتشاف' },
                { id: 'S2.2', text: 'يعرف أيّ صوت من أصوات لينغ سمع.', where: 'أصوات لينغ · التعرف' }
            ]
        },
        {
            id: 'L3', title: 'ربط الصوت بصورته',
            text: 'يربط الطفل الصوت الذي يسمعه بصورته.',
            sources: ['erber-1982'],
            short: [
                { id: 'S3.1', text: 'يطابق الصوت مع صورته.', where: 'السحب والمطابقة' },
                { id: 'S3.2', text: 'يجد أزواج الأصوات في لعبة الذاكرة.', where: 'الذاكرة' }
            ]
        },
        {
            id: 'L4', title: 'الاستعمال اليومي',
            text: 'يستعمل الطفل ما تعلّمه في البيت ومع الوقت.',
            sources: ['asha-hl'],
            short: [
                { id: 'S4.1', text: 'ينتبه لأصوات الكلام في البيت ويقلّدها (حسب الأهل).', where: 'رسالة الأهل' },
                { id: 'S4.2', text: 'يتذكّر المهارة بعد أسبوعين بدون تدريب.', where: 'الاختبار' }
            ]
        }
    ];
    // Ready-made plans: one tap adds their short-term goals to the child's plan.
    const PLANS = [
        { id: 'P1', title: 'بداية', text: 'أصوات مختلفة كثيراً ولينغ', goals: ['S1.1', 'S2.1', 'S3.1'] },
        { id: 'P2', title: 'متوسط', text: 'أصوات متقاربة والتعرّف', goals: ['S1.2', 'S2.2', 'S3.2'] },
        { id: 'P3', title: 'متقدم', text: 'نجاح من أول مرة واستعمال يومي', goals: ['S1.3', 'S2.2', 'S4.1', 'S4.2'] }
    ];
    const LEVELS = [20, 40, 60, 80];
    const ACHIEVED = 80;
    const byId = new Map(GOALS.flatMap(goal => goal.short.map(item => [item.id, { ...item, long: goal }])));
    const DAY = 864e5;
    // Which saved test answers count for a goal. Practice and the games have no right/wrong answers,
    // so their goals are rated by the therapist only.
    const MEASURES = {
        'S1.1': (session, row) => session.skill === 'pair' && Number(row.level) === 1,
        'S1.2': (session, row) => session.skill === 'pair' && Number(row.level) === 2,
        'S1.3': (session, row, context) => session.skill === 'pair' && !context.practisedBefore,
        'S2.1': session => session.skill === 'ling-detection',
        'S2.2': session => session.skill === 'ling-identification',
        'S4.2': (session, row, context) => session.skill === 'pair' && context.gap >= 14
    };
    /** Each test session moves the estimate halfway toward that session's score, so it builds up or falls
     *  back over time. A goal is achieved after 3 sessions in a row at 80% or more. */
    function estimate(child) {
        const sessions = (child?.soundApps?.[APP.id]?.sessions || []).map(session => ({ ...session, time: Date.parse(session.date) || 0 })).sort((a, b) => a.time - b.time);
        const lastTest = new Map(), out = {};
        sessions.forEach((session, index) => {
            if (session.kind !== 'assessment' || session.partial || !session.records?.length) return;
            const previous = sessions[index - 1];
            const context = { gap: lastTest.has(session.skill) ? (session.time - lastTest.get(session.skill)) / DAY : -1, practisedBefore: !!previous && previous.kind === 'practice' && previous.skill === session.skill && session.time - previous.time < 3 * 36e5 };
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
        });
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
