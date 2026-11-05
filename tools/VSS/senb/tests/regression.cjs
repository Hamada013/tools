const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
// Compare content/grammar to the original baseline while allowing only the
// reviewed format and physical-folder spelling changes (not card remapping).
const legacyPaths = value => JSON.parse(JSON.stringify(value, (_, entry) => {
    if (typeof entry !== 'string') return entry;
    if (entry.startsWith('images/')) return entry.replace(/\.webp$/, '.png');
    if (entry.startsWith('sounds/')) return entry.replace(/\.m4a$/, '.wav').replace('sounds/prepositions/', 'sounds/Prepositions/');
    return entry;
}));

function capture(context) {
    const data = vm.runInContext('[CATEGORIES, ADV_IMAGE_FOLDER_MAP, ITEMS_DATABASE, VERB_CONJUGATIONS, ADVANCED_CATEGORIES]', context);
    const advanced = vm.runInContext(`(() => {
        const result = [];
        for (let folder = 2; folder <= 6; folder++)
            for (let sub = 1; sub <= 8; sub++)
                for (let item = 1; item <= 24; item++)
                    result.push(getAdvancedItemData(String(folder), String(sub), item));
        return result;
    })()`, context);
    const grammar = vm.runInContext(`(() => {
        const result = [];
        const codes = ['i', 'he', 'she', 'they', 'we', 'youfemale', 'youmale', 'youplural'];
        for (const row of [1, 2]) {
            const slots = row === 1 ? 'row1Slots' : 'row2Slots';
            const other = row === 1 ? 'row2Slots' : 'row1Slots';
            state[other] = [{ categoryId: '01 subject', gender: 'female', genderCode: 'she' }];
            for (const verb of ITEMS_DATABASE['02 verbs']) {
                for (const tense of ['past', 'present', 'future']) {
                    for (const code of codes) {
                        const item = { ...verb, categoryId: '02 verbs', verbTense: tense };
                        state[slots] = [{ categoryId: '07 Pronoun', code }, item];
                        result.push([getDisplayedItemTitle(item, row, 1), resolveAudioPath(item, row, 1)]);
                    }
                    for (const genderCode of ['he', 'she', 'they']) {
                        const item = { ...verb, categoryId: '02 verbs', verbTense: tense };
                        state[slots] = [{ categoryId: '01 subject', genderCode }, item];
                        result.push([getDisplayedItemTitle(item, row, 1), resolveAudioPath(item, row, 1)]);
                    }
                }
            }
            for (const categoryId of ['05 adjectives', '10 colors']) {
                for (const original of ITEMS_DATABASE[categoryId]) {
                    const item = { ...original, categoryId };
                    for (const nounCat of ['01 subject', '03 object', '04 place']) {
                        for (const gender of ['male', 'female']) {
                            state[slots] = [{ categoryId: nounCat, gender }, null, item];
                            result.push([getDisplayedItemTitle(item, row, 2), resolveAudioPath(item, row, 2)]);
                        }
                    }
                    state[slots] = Array(6).fill(null);
                    result.push([getDisplayedItemTitle(item, row, 0), resolveAudioPath(item, row, 0)]);
                }
            }
            for (const categoryId of Object.keys(ITEMS_DATABASE)) {
                for (const original of ITEMS_DATABASE[categoryId]) {
                    const item = { ...original, categoryId };
                    state[slots] = Array(6).fill(null);
                    result.push([getDisplayedItemTitle(item, row, 0), resolveAudioPath(item, row, 0)]);
                    if (categoryId === '07 Pronoun') {
                        for (const pronounModifier of ['standard', 'possessive_male', 'possessive_female', 'possessive_verb'])
                            result.push(resolveAudioPath({ ...item, pronounModifier }, row, 0));
                    }
                }
            }
        }
        for (const preset of ${JSON.stringify(advanced)}) {
            state.row1Slots = preset.slots;
            preset.slots.forEach((slot, index) => result.push([
                getDisplayedItemTitle(slot, 1, index), resolveAudioPath(slot, 1, index)
            ]));
        }
        for (let count = 2; count <= 6; count++)
            for (let slot = 0; slot < count; slot++) result.push(getSlotColorConfig(slot, count));
        return result;
    })()`, context);
    return { hashes: { data: digest(data), advanced: digest(legacyPaths(advanced)), grammar: digest(legacyPaths(grammar)) }, advanced, grammarResults: grammar, grammarCount: grammar.length };
}

function currentContext() {
    const context = vm.createContext({});
    for (const file of ['data.js', 'grammar.js'])
        vm.runInContext(fs.readFileSync(path.join(root, 'assets', file), 'utf8'), context);
    const app = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
    vm.runInContext(app.slice(0, app.indexOf('function navigateTo(')), context);
    return context;
}

if (require.main === module) {
    const { hashes, advanced, grammarCount } = capture(currentContext());
    const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'baseline.json'), 'utf8'));
    assert.equal(hashes.data, baseline.data, 'Vocabulary/conjugation/image-folder data changed');
    assert.equal(hashes.advanced, baseline.advanced, 'Advanced image/audio/title/slot mappings changed');
    assert.equal(hashes.grammar, baseline.grammarAfterCompoundSubjects || baseline.grammarAfterSubjectScan || baseline.grammar, 'Grammar outputs changed from the reviewed behavior');
    for (const item of advanced) {
        assert.ok(fs.existsSync(path.join(root, item.imgPath)), item.imgPath);
        assert.ok(fs.existsSync(path.join(root, item.soundPath)), item.soundPath);
    }
    console.log(`PASS: all 960 advanced presets and data remain unchanged; ${grammarCount} grammar/audio/color outputs match the reviewed behavior; all advanced image and audio files exist.`);
}
module.exports = { capture, currentContext };
