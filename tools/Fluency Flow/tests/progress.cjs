// Pure checks for people, practice records and the path suggestion.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const load = async file => import(`data:text/javascript;base64,${fs.readFileSync(path.resolve(__dirname, file)).toString('base64')}`);
function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { getItem: key => data.has(key) ? data.get(key) : null, setItem: (key, value) => { data.set(key, value); }, data };
}
(async () => {
  const { countLabel, createStore, historyByDay, stepStats, weekSummary, latestScreen } = await load('../assets/progress.js');
  const { pathSteps, stepOf, practiceTokens, buildCues } = await load('../assets/practice.js');
  let clock = new Date('2026-11-05T10:00:00').getTime();
  const storage = memoryStorage();
  const store = createStore(() => storage, () => clock);

  // Practice needs no setup: the first record creates a default person.
  const first = store.record({ screen: 'easy-onset-practice', category: 'words', spm: 62 }, 'Me');
  assert.equal(store.getSnapshot().people[0].name, 'Me');
  assert.equal(store.getSnapshot().entries[store.getSnapshot().active].length, 1);
  store.rate(first, 1);
  assert.equal(store.getSnapshot().entries[store.getSnapshot().active][0].rating, 1);

  // People keep separate histories, and names are not duplicated.
  const me = store.getSnapshot().active;
  const sara = store.addPerson('  Sara ');
  assert.equal(sara.name, 'Sara');
  assert.equal(store.addPerson('sara').id, sara.id);
  assert.equal(store.addPerson('   '), null);
  assert.equal(store.getSnapshot().people.length, 2);
  assert.equal(store.getSnapshot().entries[sara.id].length, 0);
  store.record({ screen: 'pull-out-practice', category: 'stories', spm: 86 }, 'Me');
  assert.equal(store.getSnapshot().entries[me].length, 1);
  assert.equal(store.getSnapshot().entries[sara.id].length, 1);

  // History survives a reload, and deleting one person leaves the other.
  const reopened = createStore(() => storage, () => clock);
  assert.equal(reopened.getSnapshot().entries[sara.id].length, 1);
  reopened.removePerson(sara.id);
  assert.equal(reopened.getSnapshot().entries[sara.id], undefined);
  assert.equal(reopened.getSnapshot().active, me);
  assert.equal(reopened.getSnapshot().entries[me].length, 1);

  // Damaged or foreign data must not crash the app or be treated as history.
  assert.deepEqual(createStore(() => memoryStorage({ 'fluency-flow-progress-v1': '{bad json' })).getSnapshot().people, []);
  assert.deepEqual(createStore(() => memoryStorage({ 'fluency-flow-progress-v1': '{"schema":9}' })).getSnapshot().people, []);

  // A failed save keeps the session working and reports it.
  const blocked = createStore(() => ({ getItem: () => null, setItem() { throw new Error('quota'); } }), () => clock);
  blocked.record({ screen: 'slower-rate-practice', category: 'words' }, 'Me');
  assert.equal(blocked.getSnapshot().saveFailed, true);
  blocked.record({ screen: 'slower-rate-practice', category: 'words' }, 'Me');
  assert.equal(blocked.getSnapshot().entries[blocked.getSnapshot().active].length, 2, 'Memory keeps the session when storage fails');
  const noStorage = createStore(() => { throw new Error('blocked'); }, () => clock);
  noStorage.record({ screen: 'slower-rate-practice', category: 'words' }, 'Me');
  assert.equal(noStorage.getSnapshot().saveFailed, true);

  // Summaries are grouped per day and per path step.
  const day = 86400000;
  const entries = [
    { at: clock - 8 * day, screen: 'easy-onset-practice', category: 'words' },
    { at: clock - day, screen: 'easy-onset-practice', category: 'numbers', rating: 1, spm: 50 },
    { at: clock - day, screen: 'easy-onset-practice', category: 'words', rating: 3, spm: 62 },
    { at: clock, screen: 'breathing-practice', preset: 2, breaths: 5 }
  ];
  assert.deepEqual(weekSummary(entries, clock), { practices: 3, days: 2 });
  const history = historyByDay(entries, stepOf);
  assert.equal(history.length, 3);
  assert.equal(history[0].groups[0].breaths, 5);
  assert.equal(history[1].groups.length, 1, 'Numbers and words share the words step');
  assert.equal(history[1].groups[0].count, 2);
  assert.equal(history[1].groups[0].spm, 62);
  assert.deepEqual(history[1].groups[0].ratings, { 1: 1, 2: 0, 3: 1 });

  // The next-step suggestion needs 5 ratings, 70% easy; unrated practice does not count.
  const rated = (easy, hard, unrated = 0) => [
    ...Array(easy).fill({ screen: 'pull-out-practice', category: 'words', rating: 1 }),
    ...Array(hard).fill({ screen: 'pull-out-practice', category: 'words', rating: 3 }),
    ...Array(unrated).fill({ screen: 'pull-out-practice', category: 'words' })
  ];
  const stats = list => stepStats(list, 'pull-out-practice', ['words']);
  assert.equal(stats(rated(4, 0, 9)).ready, false, 'Too few ratings');
  assert.equal(stats(rated(4, 2)).ready, false, 'Under 70% easy');
  assert.equal(stats(rated(7, 3)).ready, true);
  assert.equal(stats(rated(7, 3, 5)).count, 15);
  assert.equal(stepStats(rated(7, 3), 'easy-onset-practice', ['words']).count, 0, 'Exercises are tracked separately');
  assert.equal(latestScreen(entries, ['easy-onset-practice'], 'x'), 'easy-onset-practice');
  assert.equal(latestScreen([], ['easy-onset-practice'], 'x'), 'x');

  // The path runs from words to real situations; Light Contact has no stories.
  assert.deepEqual(pathSteps('pull-out-practice').map(step => step.key), ['words', 'sentences', 'stories', 'conversation', 'situations']);
  assert.deepEqual(pathSteps('light-contact-practice').map(step => step.key), ['words', 'sentences', 'conversation', 'situations']);
  assert.equal(pathSteps('light-contact-practice')[0].category, 'plosives');
  assert.equal(stepOf('plosives'), 'words');

  // Counting words follow each language's rules, including Arabic's forms.
  const times = { one: 'مرة واحدة', two: 'مرتان', few: '{n} مرات', many: '{n} مرة', other: '{n} مرة' };
  assert.deepEqual([1, 2, 3, 10, 11, 100].map(n => countLabel('ar', n, times)), ['مرة واحدة', 'مرتان', '3 مرات', '10 مرات', '11 مرة', '100 مرة']);
  const syllables = { few: '{n} مقاطع', many: '{n} مقطعاً', other: '{n} مقطع' };
  assert.deepEqual([40, 62, 200].map(n => countLabel('ar', n, syllables)), ['40 مقطعاً', '62 مقطعاً', '200 مقطع']);
  assert.deepEqual([1, 2].map(n => countLabel('en', n, { one: '1 time', other: '{n} times' })), ['1 time', '2 times']);

  // Speaking prompts are timed free talk, with no word-by-word cues.
  const prompt = practiceTokens(['Tell me about your day. Take your time.'], 'conversation', 0, 1);
  assert.equal(prompt.length, 1);
  assert.deepEqual(buildCues('cancellation-practice', prompt).map(cue => [cue.phase, cue.duration]), [['talk', 60000]]);
  assert.deepEqual(buildCues('easy-onset-practice', prompt).map(cue => cue.phase), ['talk']);
  console.log('PASS people, counting words, separate histories, damaged and blocked storage, summaries, path suggestion and free speech timing');
})().catch(error => { console.error(error); process.exitCode = 1; });
