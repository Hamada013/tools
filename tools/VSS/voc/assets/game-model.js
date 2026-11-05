/* Pure game rules shared by the browser and regression tests. */
((root) => {
    'use strict';
    const MODES = {
        matching: { title: 'لعبة المطابقة', icon: 'fa-puzzle-piece', minimum: 2, description: 'المس الصورة المطابقة أو اسحب البطاقة إليها.', skill: 'مطابقة الصور والكلمات' },
        memory: { title: 'لعبة الذاكرة', icon: 'fa-brain', minimum: 2, description: 'اقلب بطاقتين وابحث عن الصور المتطابقة.', skill: 'تذكّر أماكن البطاقات' },
        rapid: { title: 'البطاقات السريعة', icon: 'fa-bolt', minimum: 1, description: 'سمِّ الصورة، ثم سجّل مستوى الاستجابة.', skill: 'تدريب تسمية الكلمات' },
        test: { title: 'استمع واختر', icon: 'fa-headphones', minimum: 2, description: 'استمع إلى الكلمة، ثم اختر صورتها.', skill: 'فهم الكلمات المسموعة' }
    };
    function shuffle(input, random = Math.random) {
        const result = [...input];
        for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
        return result;
    }
    // Keep the demonstrated answer from remaining in the same choice position.
    function shuffleAfterDemo(choices, targetIndex, random = Math.random) {
        if (choices.length < 2 || targetIndex < 0 || targetIndex >= choices.length) return [...choices];
        const result = [...choices], target = choices[targetIndex];
        for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
        if (result.indexOf(target) === targetIndex) {
            const next = (targetIndex + 1 + Math.floor(random() * (result.length - 1))) % result.length;
            [result[targetIndex], result[next]] = [result[next], result[targetIndex]];
        }
        return result;
    }
    const normalize = word => word.normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640\s]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي');
    function uniqueItems(items) {
        const words = new Set(), pictures = new Set();
        return items.filter(item => {
            const word = normalize(item.name);
            if (words.has(word) || pictures.has(item.imageHash)) return false;
            words.add(word); pictures.add(item.imageHash); return true;
        });
    }
    function createSession(mode, items, settings, dataVersion, random = Math.random) {
        const pool = settings.fixedPool ? [...new Map(items.map(item => [item.key, item])).values()] : uniqueItems(items);
        if (!MODES[mode] || pool.length < (settings.fixedPool ? 1 : MODES[mode].minimum)) throw new Error(`اختر ${MODES[mode]?.minimum || 2} بطاقات مختلفة على الأقل.`);
        const count = mode === 'memory' ? Math.min(settings.level, pool.length) : Math.min(settings.length, pool.length);
        const order = shuffle(pool, random).slice(0, count).map(item => item.key);
        const boards = [];
        if (mode === 'matching') {
            for (let i = 0; i < order.length; i += settings.level) boards.push(shuffle(order.slice(i, i + settings.level), random));
        }
        return { schema: 1, mode, dataVersion, settings: { ...settings }, pool: pool.map(item => item.key), order, boards,
            position: 0, attempts: 0, mistakes: 0, firstCorrect: 0, records: [], missed: [], elapsedMs: 0,
            created: new Date().toISOString(), review: false, trialMistakes: 0, currentChoices: null,
            deck: mode === 'memory' ? shuffle(order.flatMap(key => [{ id: `${key}-a`, key }, { id: `${key}-b`, key }]), random) : [],
            open: [], matched: [], moves: 0, pendingMismatch: false };
    }
    function choices(session, byKey, random = Math.random) {
        const target = session.order[session.position];
        const pool = session.pool.filter(key => key !== target);
        const sameCategory = pool.filter(key => byKey.get(key).catId === byKey.get(target).catId);
        const others = shuffle([...shuffle(sameCategory, random), ...shuffle(pool.filter(key => !sameCategory.includes(key)), random)], random);
        return shuffle([target, ...others.slice(0, Math.min(session.settings.level - 1, pool.length))], random);
    }
    function summarize(session, partial = false) {
        const total = session.mode === 'memory' ? session.order.length : session.records.length;
        const mastered = session.records.filter(record => record.result === 'mastered').length;
        const learning = session.records.filter(record => record.result === 'learning').length;
        const scored = session.records.filter(record => record.result !== 'skip' && record.result !== 'viewed').length;
        const percentage = session.mode === 'memory' ? (session.moves ? Math.round(session.matched.length / session.moves * 100) : null)
            : session.mode === 'rapid' ? (scored ? Math.round(mastered / scored * 100) : null)
                : (scored ? Math.round(session.firstCorrect / scored * 100) : null);
        return { mode: session.mode, percentage, total, scored, mastered, learning, mistakes: session.mistakes,
            skipped: session.records.filter(record => record.result === 'skip').length,
            viewed: session.records.filter(record => record.result === 'viewed').length,
            moves: session.moves, matched: session.matched.length, elapsedMs: session.elapsedMs,
            partial, review: session.review, date: new Date().toISOString(), planned: session.order.length };
    }
    const api = { shuffleAfterDemo, MODES, shuffle, normalize, uniqueItems, createSession, choices, summarize };
    root.VocGameModel = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
