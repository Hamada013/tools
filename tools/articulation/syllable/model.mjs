// Existing numbered Arabic picture/sound mapping, shared by all syllable activities.
export const LETTERS = [...'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'].map((char, i) => ({ id: i + 1, char: char === 'ه' ? 'هـ' : char }));
export const VOWELS = [1, 27, 28];
export const CONSONANTS = LETTERS.filter(letter => !VOWELS.includes(letter.id));
export const MODES = ['cv', 'vc', 'vcv'];
export function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
    return result;
}
export function makeItem(mode, letter, first, last = null) {
    if (!MODES.includes(mode) || !CONSONANTS.some(c => c.id === letter) || !VOWELS.includes(first) || mode === 'vcv' && !VOWELS.includes(last)) throw new Error('Invalid syllable');
    const vowel = VOWELS.indexOf(first);
    const sound = mode === 'cv' ? vowel + 1 : mode === 'vc' ? vowel + 4 : 7 + vowel * 3 + VOWELS.indexOf(last);
    const parts = mode === 'cv' ? [letter, first] : mode === 'vc' ? [first, letter] : [first, letter, last];
    return { id: `${letter}-${sound}`, letter, mode, parts, label: parts.map(id => LETTERS[id - 1].char).join(''), audio: `sounds/${letter}/${sound}.wav` };
}
export function bank(letters, mode, filter = 'all') {
    return [...new Set(letters)].flatMap(letter => VOWELS.filter(v => filter === 'all' || v === Number(filter)).flatMap(first =>
        mode === 'vcv' ? VOWELS.map(last => makeItem(mode, letter, first, last)) : [makeItem(mode, letter, first)]));
}
export function choicesFor(target, pool, random = Math.random) {
    const alternatives = pool.filter(item => item.id !== target.id);
    // Even a single chosen consonant has three distinct vowel contrasts.
    return shuffle([target, ...shuffle(alternatives, random).slice(0, 2)], random).map(item => item.id);
}
export function newAssessment(kind, letters, mode) {
    if (!['listening', 'production'].includes(kind)) throw new Error('Invalid assessment type');
    const pool = bank(letters, mode), plan = shuffle(pool).map(item => ({ id: item.id, choices: kind === 'listening' ? choicesFor(item, pool) : [] }));
    if (!plan.length) throw new Error('Select a consonant');
    return { version: 1, id: crypto.randomUUID(), kind, letters: [...new Set(letters)], mode, startedAt: new Date().toISOString(), status: 'draft', plan, records: [], cues: {}, finishedAt: '' };
}
export const PRODUCTION_SCORES = [0, 20, 40, 60, 80, 100];
export function validProductionScore(record) {
    return record.score === undefined || PRODUCTION_SCORES.includes(record.score) && record.outcome === (record.score === 100 ? 'correct' : record.score === 0 ? 'incorrect' : 'emerging');
}
export function summarize(session) {
    const assessed = session.records.filter(record => record.outcome !== 'skip');
    const scored = session.kind === 'production' ? assessed.filter(record => record.score !== undefined) : [];
    const correct = assessed.filter(record => record.outcome === 'correct').length;
    return { total: session.plan.length, recorded: session.records.length, assessed: assessed.length, correct,
        emerging: assessed.filter(record => record.outcome === 'emerging').length,
        skipped: session.records.length - assessed.length,
        accuracy: scored.length ? Math.round(scored.reduce((sum, record) => sum + record.score, 0) / scored.length) : assessed.length ? Math.round(correct / assessed.length * 100) : null,
        modeled: session.records.filter(record => record.modeled).length };
}
export function addResponse(session, record) {
    const current = session.plan[session.records.length];
    if (session.status !== 'draft' || !current || current.id !== record.id || session.records.some(r => r.id === record.id)) return false;
    const allowed = session.kind === 'listening' ? ['correct', 'incorrect', 'skip'] : ['correct', 'emerging', 'incorrect', 'skip'];
    if (session.kind === 'production' && !validProductionScore(record)) return false;
    if (!allowed.includes(record.outcome)) return false;
    if (session.kind === 'listening' && record.outcome !== 'skip' && (!current.choices.includes(record.selected) || (record.selected === record.id) !== (record.outcome === 'correct'))) return false;
    session.records.push({ id: record.id, outcome: record.outcome, ...(session.kind === 'production' && record.score !== undefined ? { score: record.score } : {}), selected: record.selected || '', modeled: !!record.modeled, at: new Date().toISOString() });
    if (session.records.length === session.plan.length) { session.status = 'complete'; session.finishedAt = new Date().toISOString(); }
    return true;
}
export function validSession(session) {
    try {
        if (!session || session.version !== 1 || typeof session.id !== 'string' || !['listening', 'production'].includes(session.kind) || !['draft', 'complete', 'partial'].includes(session.status) || !Array.isArray(session.letters) || session.letters.length < 1 || session.letters.length > 3) return false;
        const pool = bank(session.letters, session.mode), ids = new Set(pool.map(item => item.id));
        if (!Array.isArray(session.plan) || session.plan.length !== pool.length || new Set(session.plan.map(item => item.id)).size !== pool.length || !session.plan.every(item => ids.has(item.id))) return false;
        if (!Array.isArray(session.records) || session.records.length > session.plan.length || session.status === 'complete' && session.records.length !== session.plan.length) return false;
        if (session.kind === 'listening' && !session.plan.every(item => Array.isArray(item.choices) && item.choices.length === 3 && new Set(item.choices).size === 3 && item.choices.includes(item.id) && item.choices.every(id => ids.has(id)))) return false;
        if (session.cues != null && (typeof session.cues !== 'object' || Array.isArray(session.cues) || !Object.entries(session.cues).every(([id,value]) => ids.has(id) && value === true))) return false;
        const outcomes = session.kind === 'listening' ? ['correct', 'incorrect', 'skip'] : ['correct', 'incorrect', 'emerging', 'skip'];
        return session.records.every((record, i) => record.id === session.plan[i].id && outcomes.includes(record.outcome) && typeof record.modeled === 'boolean' && (session.kind !== 'production' || validProductionScore(record)) && (session.kind !== 'listening' || record.outcome === 'skip' || session.plan[i].choices.includes(record.selected) && (record.selected === record.id) === (record.outcome === 'correct')));
    } catch { return false; }
}
