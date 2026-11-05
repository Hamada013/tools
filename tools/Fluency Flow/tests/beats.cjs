// The pacing board asks for one tap per beat, so its counts must be exact, not estimated.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const app = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(app, file), 'utf8');
const any = () => new Proxy(function () {}, { get: (_, key) => typeof key === 'string' ? any() : undefined, apply: () => 'x', construct: () => ({}) });
const context = new Proxy({}, { has: () => true, get: (_, key) => typeof key === 'string' ? any() : undefined });
function translations() {
  const source = read('assets/app.js');
  const start = source.indexOf('const translations = ') + 'const translations = '.length;
  let index = start, depth = 0, quote = null;
  for (; index < source.length; index++) {
    const char = source[index];
    if (quote) { if (char === '\\') index++; else if (char === quote) quote = null; continue; }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
    if (char === '{') depth++;
    if (char === '}' && --depth === 0) break;
  }
  return vm.runInNewContext(`with(ctx){(${source.slice(start, index + 1)})}`, { ctx: context });
}
(async () => {
  const practice = read('assets/practice.js');
  const { countSyllables } = await import(`data:text/javascript;base64,${Buffer.from(practice).toString('base64')}`);
  const table = vm.runInNewContext(`(${practice.match(/const ARABIC_BEATS = (\{[\s\S]*?\n\});/)[1]})`);
  const listed = new Map(Object.entries(table).flatMap(([count, words]) => words.split(' ').map(word => [word, +count])));
  const clean = word => word.replace(/[^ء-ي]/gu, '');

  // Every Arabic word that can reach the pacing board has a listed count.
  const data = translations().ar.practiceData;
  const words = new Set();
  for (const key of ['colors', 'animals', 'food', 'words']) data[key].forEach(item => words.add(clean(item.text)));
  data.plosives.forEach(item => words.add(clean(item.text.split(' - ').pop())));
  Object.values(data.letterWords).flat().forEach(word => words.add(clean(word)));
  data.sentences.forEach(sentence => sentence.split(/\s+/).forEach(word => words.add(clean(word))));
  words.delete('');
  assert.deepEqual([...words].filter(word => !listed.has(word)), [], 'Arabic words without a checked beat count');

  // Shared words agree with VOC's checked counts.
  const voc = JSON.parse(fs.readFileSync(path.join(app, '../VSS/voc/assets/production-counts.json'), 'utf8'));
  const disagree = Object.values(voc).filter(entry => listed.has(clean(entry.name)) && listed.get(clean(entry.name)) !== entry.count).map(entry => entry.name);
  assert.deepEqual(disagree, [], 'Counts that differ from VOC');

  // Punctuation and vowel marks do not change a count; the board uses the listed value.
  assert.equal(countSyllables('شجرة'), 3); assert.equal(countSyllables('شمس'), 1); assert.equal(countSyllables('باب'), 1);
  assert.equal(countSyllables('القطة'), 3); assert.equal(countSyllables('جداً.'), 2); assert.equal(countSyllables('ب - باب'), 1);
  assert.equal(countSyllables('المعلمة'), 5);
  // Spoken Syrian forms: no case endings, helping vowels count, dropped vowels do not.
  for (const [word, count] of [['حشرة', 2], ['كتاباً', 2], ['كتاب', 2], ['قلم', 2], ['حبل', 2], ['كلب', 1], ['طابعة', 2], ['نائمة', 2], ['قرأت', 2], ['فرشاة', 3], ['مع', 1]]) assert.equal(countSyllables(word), count, word);
  // The article adds one beat to every counted base word in the table.
  const article = [...listed].filter(([word]) => word.startsWith('ال') && listed.has(word.slice(2)) && listed.get(word.slice(2)) + 1 !== listed.get(word)).map(([word]) => word);
  assert.deepEqual(article, [], 'Article forms out of step with their base word');
  // The article adds one beat to a counted base word, so related words stay consistent.
  for (const [word, base] of [['القلب', 'قلب'], ['الشجرة', 'شجرة'], ['السمكة', 'سمكة'], ['الورقة', 'ورقة'], ['القطة', 'قطة'], ['النهر', 'نهر'], ['الطفل', 'طفل']]) assert.equal(countSyllables(word), countSyllables(base) + 1, word);
  // English: final silent e and -le.
  for (const [word, count] of [['apple', 2], ['table', 2], ['cake', 1], ['blue', 1], ['tree', 1], ['banana', 3], ['idea', 3], ['whale', 1], ['quiet', 2], ['video', 3], ['headphones', 2]]) assert.equal(countSyllables(word), count, word);
  console.log(`PASS ${words.size} Arabic board words have checked beat counts, agreeing with VOC`);
})().catch(error => { console.error(error); process.exitCode = 1; });
