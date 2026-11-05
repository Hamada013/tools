const assert = require('node:assert/strict');
const R = require('../assets/session-reports.js');
const now = new Date(2026, 9, 18, 15, 30);
const row = (key, entity, domain, presentation, correct, total = 1) => ({ key, title: key === '2/1/1' ? 'ولد يأكل' : key, entity, domain, presentation, correct, total });
const session = (id, date, kind, records, extra = {}) => ({ id, date: new Date(date).toISOString(), kind, records, ...extra });
const today = new Date(2026, 9, 18, 10);
const records = [
    session('p', today, 'practice', [row('2/1/1', 'sentence', 'receptive', 'advanced', 1)]),
    session('a', today, 'assessment', [row('2/1/1', 'sentence', 'receptive', 'advanced', 1), row('2/1/1', 'sentence', 'expressive', 'advanced', 1, 2), row('ولد', 'word', 'expressive', 'slots', 1)]),
    session('b', today, 'assessment', [row('2/1/1', 'sentence', 'receptive', 'slots', 0), row('ولد', 'word', 'receptive', 'slots', 0)]),
    session('incomplete', today, 'assessment', [row('2/1/1', 'sentence', 'receptive', 'advanced', 100, 100)], { partial: true }),
    session('old', new Date(2026, 8, 1), 'assessment', [row('قديمة', 'word', 'receptive', 'slots', 1)]),
    session('future', new Date(2026, 9, 19), 'assessment', [row('مستقبل', 'word', 'receptive', 'slots', 1)])
];
const report = R.summarize({ name: 'علي', sessions: records }, 'day', now);
assert.equal(report.title, 'علي');
assert.equal(report.sessionCount, 4);
assert.equal(report.assessmentCount, 2);
assert.equal(report.practiceCount, 1);
assert.equal(report.partialCount, 1);
assert.deepEqual(report.domains.receptive, { correct: 1, total: 2 }, 'Practice and partial trials never change assessment percentages');
assert.equal(R.percent(report.domains.receptive), 50);
assert.deepEqual(report.presentations[0].receptive, { correct: 1, total: 1 });
assert.deepEqual(report.presentations[1].receptive, { correct: 0, total: 1 });
assert.equal(report.sentenceCount, 1);
assert.equal(report.wordCount, 1);
assert.equal(report.details.length, 3, 'The same sentence retains distinct image/word-card results');
assert.equal(R.percent({correct:0,total:0}), null, 'Untested must not be reported as failure');
assert.equal(R.summarize(records, 'all', now).wordCount, 2, 'Future data is excluded');
assert.equal(R.periodStart('week', now).getDate(), 12);
assert.equal(R.periodStart('month', now).getDate(), 19);
assert.equal(R.periodStart('month', now).getMonth(), 8);
assert.equal(R.periodStart('quarter', new Date(2026, 4, 31)).getDate(), 28, 'Calendar months clamp across February');
assert.equal(R.periodStart('halfyear', new Date(2026, 7, 31)).getDate(), 28);
assert.equal(R.summarize({ sessions: [records[4]], senb: { sessions: records.slice(0, 1) } }, 'all', now).wordCount, 0, 'SENB reports must never read VOC sessions from the same child');
const invalid = R.summarize([session('bad', today, 'assessment', [row('invalid', 'word', 'receptive', 'advanced', Infinity, Infinity), row('clamped', 'word', 'receptive', 'slots', 5, 1)])], 'day', now);
assert.deepEqual(invalid.domains.receptive, { correct:0,total:0 }, 'Word-only records do not enter sentence accuracy');
const note = R.lessonText('علي', {date: now, sentences: [{folder:2,subCatId:1,itemNum:1,title:'ولد يأكل'},{key:'غير مقيّمة',title:'غير مقيّمة',entity:'word'}], sessions:records.slice(0,4)});
assert.match(note, /^مرحباً، أنا علي!/);
assert.match(note, /اليوم اشتغلت على هالجمل: ولد يأكل/);
assert.match(note, /الفهم:/);
assert.match(note, /التعبير:/);
assert.match(note, /لسه عم أتعلّم/);
assert.match(note, /ما سجّلنا نتيجة بهالمهارة لـ: غير مقيّمة/);
assert.match(note, /أغراض البيت/);
assert.doesNotMatch(note, /اضغط|التطبيق|الشاشة/);
assert.equal((note.match(/اليوم اشتغلت على هالجمل: ولد يأكل/g) || []).length, 1);
const diagnostic = R.summarize([session('same-response', today, 'assessment', [row('s:2/1/1', 'sentence', 'expressive', 'slots', 1, 2), row('ولد', 'word', 'expressive', 'slots', 1), row('يأكل', 'word', 'expressive', 'slots', 0)])], 'day', now);
assert.deepEqual(diagnostic.domains.expressive, { correct:1,total:2 }, 'Words marked within a sentence are diagnostic details, never duplicated in the overall score');
assert.equal(diagnostic.details.find(detail=>detail.key==='ولد').expressive.total,1);
const directWord = R.summarize([session('word-only',today,'assessment',[row('ولد','word','receptive','slots',1)])], 'day', now);
assert.deepEqual(directWord.domains.receptive,{correct:0,total:0}, 'Sentence reports exclude direct word scores from their overall percentage');
console.log('SENB report dates, scoring, profile isolation and home lesson passed.');
