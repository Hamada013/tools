const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const { currentContext } = require('./regression.cjs');
const context = currentContext();
const originalPresets = vm.runInContext('JSON.stringify(ADVANCED_REFERENCE_DB)', context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/activities-model.js'), 'utf8'), context);
const model = vm.runInContext('SENBActivities', context);
function random(seed = 9) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
for (let folder = 2; folder <= 6; folder++) {
    for (const presentation of ['advanced', 'slots']) {
        const plan = model.testPlan(folder, presentation, random(folder));
        assert.equal(plan.length, 24);
        for (let subgroup = 1; subgroup <= 8; subgroup++) {
            const trials = plan.filter(trial => Number(trial.target.subCatId) === subgroup);
            assert.equal(trials.length, 3);
            assert.equal(new Set(trials.map(trial => trial.target.itemNum)).size, 3);
            for (const trial of trials) {
                assert.equal(trial.choices.length, 4);
                assert.equal(new Set(trial.choices.map(sentence => model.signature(sentence, presentation))).size, 4);
                for (let signature = 0; signature < 3; signature++) assert.equal(new Set(trial.choices.map(sentence => model.meaningSignatures(sentence)[signature])).size, 4, 'Choices must differ by sentence text, words and cards even with different advanced image paths');
                assert.equal(trial.choices.filter(sentence => model.key(sentence) === model.key(trial.target)).length, 1);
                assert.ok(trial.choices.every(sentence => Number(sentence.folder) === folder && Number(sentence.subCatId) === subgroup));
            }
        }
        assert.notDeepEqual(plan.map(trial => model.key(trial.target)), model.testPlan(folder, presentation, random(folder + 20)).map(trial => model.key(trial.target)));
        for (let subgroup = 1; subgroup <= 8; subgroup++) {
            const selected = model.testPlan(folder, presentation, random(folder + subgroup), subgroup);
            assert.equal(selected.length, 3, 'A selected subgroup must have exactly three trials');
            assert.equal(new Set(selected.map(trial => trial.target.itemNum)).size, 3);
            assert.ok(selected.every(trial => Number(trial.target.subCatId) === subgroup));
            for (const trial of selected) {
                assert.equal(trial.choices.length, 4);
                assert.equal(new Set(trial.choices.map(sentence => model.signature(sentence, presentation))).size, 4);
                assert.ok(trial.choices.every(sentence => Number(sentence.subCatId) === subgroup && Number(sentence.folder) === folder));
                assert.equal(trial.choices.filter(sentence => model.key(sentence) === model.key(trial.target)).length, 1);
            }
        }
    }
    const bag = model.gameBag(folder, random());
    assert.equal(bag.length, 192);
    assert.equal(new Set(bag.map(model.key)).size, 192);
    for (const sentence of bag) {
        for (const slot of sentence.slots) assert.ok(fs.existsSync(path.join(__dirname, '..', model.imagePath(slot))), 'Activity image must exist, including a safe placeholder for unassigned slots');
        sentence.slots.forEach((slot, index) => {
            if (slot.categoryId !== '02 verbs' || !model.hasMappedCard(slot)) return;
            context.scenarioSentence = sentence;
            context.scenarioIndex = index;
            const originalSegments = vm.runInContext('(() => { const row = state.row1Slots; try { state.row1Slots = scenarioSentence.slots; return getSlotAudioSegments(scenarioSentence.slots[scenarioIndex], 1, scenarioIndex); } finally { state.row1Slots = row; } })()', context);
            assert.equal(JSON.stringify(model.slotSegments(sentence, slot, index)), JSON.stringify(originalSegments), 'Activity verbs must use the same tense/pronoun audio as the workplace');
        });
        const round = model.gameRound(sentence, random(sentence.itemNum));
        assert.ok(round.missingIndex >= 0 && round.missingIndex < folder);
        assert.equal(round.choices.length, 3);
        assert.equal(new Set(round.choices.map(model.imagePath)).size, 3);
        assert.equal(round.choices.filter(slot => model.imagePath(slot) === model.imagePath(sentence.slots[round.missingIndex])).length, 1);
        assert.ok(model.hasMappedCard(sentence.slots[round.missingIndex]), 'The missing game card must have a real mapping');
        assert.ok(round.choices.every(slot => slot.categoryId === model.normalizeSlot(sentence.slots[round.missingIndex]).categoryId));
    }
}
for (let count = 4; count <= 10; count++) for (let folder = 2; folder <= 6; folder++) for (const presentation of ['advanced', 'slots']) {
    for (const subgroup of [null, 8]) {
        const plan = model.testPlan(folder, presentation, random(count + folder), subgroup, count);
        assert.equal(plan.length, count * (subgroup === null ? 8 : 1));
        for (const group of subgroup === null ? [1, 2, 3, 4, 5, 6, 7, 8] : [subgroup]) {
            const trials = plan.filter(trial => Number(trial.target.subCatId) === group);
            assert.equal(new Set(trials.map(trial => model.key(trial.target))).size, count, 'Selected trials must not repeat an item');
        }
        for (const trial of plan) {
            assert.equal(trial.choices.length, 4);
            for (let signature = 0; signature < 3; signature++) assert.equal(new Set(trial.choices.map(sentence => model.meaningSignatures(sentence)[signature])).size, 4);
        }
        const results = plan.map((trial, index) => ({ subgroup: trial.target.subCatId, correct: index % count === 0, words: index % count === 0 ? folder : 0, total: folder }));
        for (const expressive of [false, true]) {
            const summary = model.assessmentSummary(results, expressive, folder);
            assert.equal(summary.percentage, Math.round(1000 / count) / 10);
            assert.ok(summary.groups.every(group => group.trials === count && group.possible === count * (expressive ? folder : 1)));
        }
    }
}
for (const invalid of [2, 11, 3.5, '5', NaN]) assert.throws(() => model.testPlan(2, 'advanced', random(), null, invalid), /3 to 10/);
const subjectOnly = [1, 2, 3].map(item => ({ subgroup: '1', item, total: 2, words: 1, marks: [true, false] }));
const production = model.assessmentSummary(subjectOnly, true, 2);
assert.equal(production.mlu, 1, 'One word in each of three trials gives MLU 1');
assert.equal(production.groups[0].mlu, 1);
assert.deepEqual(Array.from(production.wordTypes, type => [type.id, type.produced, type.opportunities, type.percentage]), [['subject', 3, 3, 100], ['verb-present', 0, 3, 0]]);
assert.deepEqual(Array.from(production.strongest, type => type.id), ['subject']);
assert.deepEqual(Array.from(production.weakest, type => type.id), ['verb-present']);
assert.equal(production.wordTypes.some(type => type.id === 'verb-past'), false, 'Untested types must not appear as zero percent');
const withSilence = model.assessmentSummary([...subjectOnly, { subgroup: '1', item: 4, total: 2, words: 0, marks: [false, false] }], true, 2);
assert.equal(withSilence.mlu, .75, 'A completed zero-word response remains in the average');
assert.equal(withSilence.wordTypes[0].percentage, 75);
const repeatedSubjects = model.assessmentSummary([1, 2, 3].map(item => ({ subgroup: '3', item, total: 4, marks: [true, false, false, false] })), true, 4);
assert.equal(repeatedSubjects.wordTypes.find(type => type.id === 'subject').opportunities, 6, 'Count every presented occurrence, including two subjects in one trial');
assert.equal(repeatedSubjects.wordTypes.find(type => type.id === 'subject').percentage, 50);
assert.equal(model.assessmentSummary([], true, 2).mlu, 0);
const equalPerformance = model.assessmentSummary(subjectOnly.map(result => ({ ...result, marks: [true, true] })), true, 2);
assert.equal(equalPerformance.strongest.length, 0, 'Equal scores must not invent a relative strength or weakness');
for (const [folder, subgroup, expected] of [[2, 3, ['genitive-head', 'genitive-dependent']], [2, 4, ['verb-future', 'verb-future']], [2, 5, ['subject', 'verb-past']], [2, 6, ['noun', 'adjective']], [2, 7, ['demonstrative', 'noun']], [2, 8, ['spatial', 'noun']], [5, 1, ['subject', 'verb-present', 'object', 'preposition', 'place']]]) {
    const sentence = context.getAdvancedItemData(folder, subgroup, 1);
    assert.deepEqual(Array.from(sentence.slots, (slot, index) => model.wordType(sentence, slot, index).id), expected);
}
for (const expressive of [false, true]) {
    const results = [
        { subgroup: '1', correct: true, words: 2, total: 5 },
        { subgroup: '1', correct: false, words: 3, total: 5 },
        { subgroup: '2', correct: true, words: 1, total: 5 }
    ];
    const summary = model.assessmentSummary(results, expressive, 5);
    assert.equal(summary.percentage, expressive ? 40 : 66.7);
    if (expressive) assert.equal(summary.mlu, 2);
    assert.deepEqual(Array.from(summary.groups, group => group.percentage), expressive ? [50, 20] : [50, 100]);
    assert.deepEqual(Array.from(summary.groups, group => group.possible), expressive ? [10, 5] : [2, 1]);
    assert.equal(model.assessmentSummary([results[2]], expressive, 5).groups.length, 1);
}
vm.runInContext("state.row1Slots = [{id:2,categoryId:'01 subject',genderCode:'she'}];", context);
const manualRow = vm.runInContext('state.row1Slots', context);
const sentence = context.getAdvancedItemData(5, 8, 1);
assert.equal(model.slotSegments(sentence, sentence.slots[2], 2)[0].path, 'sounds/verbs/present/he/14.m4a');
assert.equal(vm.runInContext('state.row1Slots', context), manualRow, 'Activity grammar must restore the manual board immediately');
assert.equal(model.slotTitle(sentence, sentence.slots[2], 2), 'يقعد');
assert.equal(vm.runInContext('state.row1Slots', context), manualRow);
assert.equal(model.normalizeSlot({ categoryId: '07 pronoun', id: 7, title: 'انت' }).code, vm.runInContext("ITEMS_DATABASE['07 Pronoun'].find(item => item.id === 7).code", context), 'Activity aliases must preserve the existing vocabulary codes');
assert.equal(model.imagePath({ categoryId: '07 pronouns', id: 2, title: 'و' }), 'images/08 linking/3.webp');
assert.equal(model.imagePath({ categoryId: 'UNKNOWN', id: 57, title: 'كتب' }), 'assets/image-fallback.svg');
assert.equal(model.slotSegments(sentence, { categoryId: 'UNKNOWN', id: 0, title: 'مبسوطة' }, 1)[0].path, null, 'An unassigned card must not play an unrelated subject recording');
assert.equal(vm.runInContext('JSON.stringify(ADVANCED_REFERENCE_DB)', context), originalPresets, 'Planning and grammar reads must leave every original preset unchanged');
console.log('PASS: default and 3-10 trial assessment plans preserve distinct targets, unique choices and subgroup scoring; 960 game rounds retain mapped cards; preset data and manual context are preserved.');

for (const folder of [2, 3, 4, 5, 6]) {
    for (const groups of [[2], [1, 4, 8], []]) {
        const bag = model.gameBag(folder, random(folder), groups);
        assert.equal(bag.length, (groups.length || 8) * 24);
        assert.equal(new Set(bag.map(model.key)).size, bag.length);
        if (groups.length) assert.ok(bag.every(sentence => groups.includes(Number(sentence.subCatId))));
    }
}
