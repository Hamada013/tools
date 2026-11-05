const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const M = require('../assets/game-model.js');
const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/game-data.js'), 'utf8'), context);
const data = JSON.parse(JSON.stringify(context.window.VOC_GAME_DATA));
const items = data.categories.flatMap(c => c.items);
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const canonical = vm.runInNewContext(`${source.slice(source.indexOf('const RAW_CATEGORIES ='), source.indexOf('const app ='))}; JSON.parse(JSON.stringify(CATEGORIES));`, {});
for (const category of data.categories) for (const item of category.items) {
    assert.equal(item.name, canonical[category.id - 1].items.find(word => word.id === item.id).name, 'Games must share current home labels');
    assert.ok(fs.existsSync(path.join(root, item.image)));
    assert.ok(fs.existsSync(path.join(root, item.audio)));
}
assert.equal(data.categories.length, 40);
const original = [1, 2, 3, 4];
assert.deepEqual(M.shuffle(original, () => 0).sort(), original);
assert.deepEqual(original, [1, 2, 3, 4]);
const pool = data.categories[0].items.slice(0, 6);
assert.equal(M.uniqueItems([...pool, { ...pool[0], key: 'alias', name: 'اسم مختلف' }]).length, 6, 'Identical artwork cannot be two answer choices');
assert.equal(M.uniqueItems([...pool, { ...pool[0], key: 'alias', imageHash: 'different' }]).length, 6, 'Duplicate word labels cannot be two answer choices');
const config = { level: 4, length: 6, duration: 2, labels: true, sound: true };
for (const mode of Object.keys(M.MODES)) {
    const session = M.createSession(mode, pool, config, data.version);
    assert.equal(new Set(session.order).size, session.order.length);
    assert.equal(session.order.length, mode === 'memory' ? 4 : 6);
    assert.equal(M.summarize(session, true).percentage, null, 'No answers is not a zero accuracy');
    if (mode === 'memory') {
        assert.equal(session.deck.length, 8);
        for (const key of session.order) assert.equal(session.deck.filter(card => card.key === key).length, 2);
        session.moves = 3; session.matched = session.order.slice(0, 2);
        assert.equal(M.summarize(session).percentage, 67);
    }
    if (mode === 'matching') {
        assert.equal(session.boards.flat().length, 6);
        assert.deepEqual([...session.boards.flat()].sort(), [...session.order].sort());
    }
    if (mode === 'test') {
        const byKey = new Map(items.map(item => [item.key, item]));
        for (session.position = 0; session.position < session.order.length; session.position++) {
            const choices = M.choices(session, byKey);
            assert.equal(choices.length, 4);
            assert.equal(new Set(choices).size, 4);
            assert.ok(choices.includes(session.order[session.position]));
        }
    }
}
assert.throws(() => M.createSession('test', pool.slice(0, 1), config, data.version));
assert.throws(() => M.createSession('matching', pool.slice(0, 1), config, data.version));
const rapid = M.createSession('rapid', pool.slice(0, 3), config, data.version);
rapid.records = [{ result: 'notMastered' }, { result: 'learning' }, { result: 'mastered' }];
assert.equal(M.summarize(rapid).percentage, 33); assert.equal(M.summarize(rapid).learning, 1);
const test = M.createSession('test', pool, config, data.version);
test.records = [{ result: 'correct' }, { result: 'correct' }, { result: 'skip' }]; test.firstCorrect = 1;
assert.equal(M.summarize(test).percentage, 50, 'Retries must not inflate first-choice accuracy; skips are excluded');

const autoplay = M.createSession('rapid', items.slice(0, 3), { level: 2, length: 6, duration: 2 }, 'test');
autoplay.records = autoplay.order.map(key => ({ key, result: 'viewed' }));
assert.equal(M.summarize(autoplay).percentage, null);
assert.equal(M.summarize(autoplay).scored, 0);
assert.equal(M.summarize(autoplay).viewed, autoplay.order.length);
console.log(`PASS: ${items.length} shared words, unique artwork/labels, finite sessions, balanced memory decks, bounded choices, scores and skip denominators.`);
