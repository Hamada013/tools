const assert = require('node:assert/strict');
const vm = require('node:vm');
const { currentContext } = require('./regression.cjs');
const context = currentContext();
const run = code => vm.runInContext(code, context);
const verb = { id: 14, categoryId: '02 verbs', title: 'قعد' };
const modifiers = [null, { categoryId: '05 adjectives' }, { categoryId: '10 colors' }, { categoryId: '08 linking' }, { categoryId: '07 Pronoun', code: 'your_f' }];
let checks = 0;
for (const row of [1, 2]) {
    for (const candidate of [
        ...['01 subject', '03 object', '04 place'].flatMap(categoryId => [
            { slot: { categoryId, gender: 'male' }, expected: 'he' },
            { slot: { categoryId, gender: 'female' }, expected: 'she' },
            { slot: { categoryId, gender: 'female', genderCode: 'they' }, expected: 'they' }
        ]),
        ...['i', 'he', 'she', 'they', 'we', 'youfemale', 'youmale', 'youplural'].map(code => ({ slot: { categoryId: '07 Pronoun', code }, expected: code }))
    ]) {
        for (const modifier of modifiers) for (const tense of ['past', 'present', 'future']) {
            context.slots = [candidate.slot, modifier, null];
            context.item = { ...verb, verbTense: tense };
            run(`state.row${row}Slots = slots; state.row${row === 1 ? 2 : 1}Slots = [{ categoryId: '01 subject', genderCode: '${candidate.expected === 'she' ? 'he' : 'she'}' }];`);
            assert.equal(context.resolveAudioPath(context.item, row, 3), `sounds/verbs/${tense}/${candidate.expected}/14.m4a`);
            assert.equal(context.getDisplayedItemTitle(context.item, row, 3), run(`VERB_CONJUGATIONS[14]['${tense}']['${candidate.expected}']`));
            const segments = context.getSlotAudioSegments(context.item, row, 3);
            assert.equal(segments[0].path, `sounds/verbs/${tense === 'future' ? 'present' : tense}/${candidate.expected}/${tense === 'future' ? 15 : 14}.m4a`);
            if (tense === 'future') assert.equal(segments[1].path, `sounds/verbs/present/${candidate.expected}/14.m4a`);
            checks++;
        }
    }
    // Combine earlier subjects; later nouns and the other row do not affect it.
    run(`state.row${row}Slots = [{ categoryId: '01 subject', genderCode: 'he' }, { categoryId: '07 Pronoun', code: 'she' }, null, { categoryId: '03 object', gender: 'male' }];`);
    assert.equal(context.resolveAudioPath({ ...verb, verbTense: 'present', conjugation: 'he' }, row, 2), 'sounds/verbs/present/they/14.m4a');
    run(`state.row${row}Slots = [null, { categoryId: '05 adjectives' }];`);
    assert.equal(context.resolveAudioPath({ ...verb, verbTense: 'past' }, row, 2), 'sounds/verbs/past/i/14.m4a');
    assert.equal(context.resolveAudioPath({ ...verb, verbTense: 'past', conjugation: 'they' }, row, 2), 'sounds/verbs/past/they/14.m4a');
}

const codes = ['i', 'he', 'she', 'they', 'we', 'youfemale', 'youmale', 'youplural'];
// Explicit matrix covers both orders and fills in unspecified combinations.
const pairs = [
    ['we', 'we', 'we', 'we', 'we', 'we', 'we', 'we'],
    ['we', 'they', 'they', 'they', 'we', 'youplural', 'youplural', 'youplural'],
    ['we', 'they', 'they', 'they', 'we', 'youplural', 'youplural', 'youplural'],
    ['we', 'they', 'they', 'they', 'we', 'youplural', 'youplural', 'youplural'],
    ['we', 'we', 'we', 'we', 'we', 'youplural', 'youplural', 'youplural'],
    ['we', 'youplural', 'youplural', 'youplural', 'youplural', 'youplural', 'youplural', 'youplural'],
    ['we', 'youplural', 'youplural', 'youplural', 'youplural', 'youplural', 'youplural', 'youplural'],
    ['we', 'youplural', 'youplural', 'youplural', 'youplural', 'youplural', 'youplural', 'youplural']
];
for (const row of [1, 2]) for (const [a, first] of codes.entries()) for (const [b, second] of codes.entries()) {
    context.subjects = [{ categoryId: '07 Pronoun', code: first }, null, { categoryId: '08 linking', title: 'و' }, { categoryId: '07 Pronoun', code: second }];
    run(`state.row${row}Slots = subjects;`);
    for (const tense of ['past', 'present', 'future']) {
        const item = { ...verb, verbTense: tense };
        assert.equal(context.getContextVerbSubject(item, row, 4), pairs[a][b], `${first} + ${second}`);
        assert.equal(context.getDisplayedItemTitle(item, row, 4), run(`VERB_CONJUGATIONS[14]['${tense}']['${pairs[a][b]}']`));
        assert.equal(context.resolveAudioPath(item, row, 4), `sounds/verbs/${tense}/${pairs[a][b]}/14.m4a`);
        const paths = context.getSlotAudioSegments(item, row, 4).map(segment => segment.path);
        assert.ok(paths.every(path => path.includes(`/${pairs[a][b]}/`)));
        checks++;
    }
}
for (const row of [1, 2]) {
    context.subjects = [{ categoryId: '04 place' }, { categoryId: '05 adjectives' }, { categoryId: '03 object', gender: 'female' }, null, { categoryId: '01 subject', gender: 'male' }];
    run(`state.row${row}Slots = subjects;`);
    assert.equal(context.getContextVerbSubject(verb, row, 5), 'they', 'Unordered noun categories, modifiers and gaps form a plural');
    context.subjects = [{ categoryId: '07 Pronoun', code: 'i' }, { categoryId: '07 Pronoun', code: 'she' }, verb];
    run(`state.row${row}Slots = subjects;`);
    assert.equal(context.getContextVerbSubject(verb, row, 3), 'we', 'Compound subjects affect every subsequent verb');
    assert.equal(context.getContextVerbSubject({ ...verb, conjugation: 'he' }, row, 3), 'we', 'A stale preset conjugation cannot override the subjects of consecutive verbs');
    assert.equal(context.getDisplayedItemTitle({ ...verb, isAdvancedOverride: true, title: 'يقعد' }, row, 3), run("VERB_CONJUGATIONS[14].present.we"), 'Compound agreement updates a preset verb after editing its strip');
    context.subjects = [{ categoryId: '07 Pronoun', code: 'i' }, verb, { categoryId: '07 Pronoun', code: 'she' }];
    run(`state.row${row}Slots = subjects;`);
    assert.equal(context.getContextVerbSubject(verb, row, 3), 'she', 'Separate clauses keep separate subjects');
}
for (const [title, expected] of Object.entries({ انا: 'i', 'انتَ': 'youmale', 'انتِ': 'youfemale', انتما: 'youplural', نحن: 'we', هم: 'they', هي: 'she', هاد: 'he' })) {
    context.pronoun = { categoryId: '07 Pronoun', title, code: 'your_f' };
    run('state.row1Slots = [pronoun];');
    assert.equal(context.getContextVerbSubject(verb, 1, 1), expected, title);
}
run("state.row1Slots = [{ categoryId: '07 Pronoun', title: 'نحن', pronounModifier: 'possessive_male' }];");
assert.equal(context.getContextVerbSubject(verb, 1, 1), 'i', 'Possessive pronouns are not subjects');

const example = context.getAdvancedItemData(5, 8, 1);
context.example = example;
run('state.row1Slots = example.slots;');
assert.equal(example.title, 'ولد حزين يقعد على كرسي');
assert.equal(context.resolveAudioPath(example.slots[2], 1, 2), 'sounds/verbs/present/he/14.m4a');
assert.equal(context.getDisplayedItemTitle(example.slots[2], 1, 2), 'يقعد');

// Every subgroup-8 preset's annotated verb conjugation must match its audio context.
for (let folder = 2; folder <= 6; folder++) for (let item = 1; item <= 24; item++) {
    const preset = context.getAdvancedItemData(folder, 8, item);
    context.preset = preset;
    run('state.row1Slots = preset.slots;');
    preset.slots.forEach((slot, index) => {
        if (slot.categoryId !== '02 verbs') return;
        assert.equal(context.getContextVerbSubject(slot, 1, index), slot.conjugation, `${folder}/8/${item}`);
        assert.equal(context.getDisplayedItemTitle(slot, 1, index), slot.title, 'Preset title overrides must stay intact');
    });
}
console.log(`PASS: ${checks} verb-context cases across nouns/pronouns, gaps, modifiers, both rows, and all tenses; all 120 subgroup-8 presets use their intended conjugation.`);
