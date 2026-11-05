// Pure practice helpers shared by the visual guide and navigation.
export const singleItemCategories = new Set(['numbers', 'letters', 'colors', 'animals', 'food', 'words', 'plosives', 'practice', 'myWords']);
export const categoriesByScreen = {
  'slower-rate-practice': ['numbers', 'letters', 'colors', 'animals', 'food', 'words', 'sentences', 'stories', 'conversation', 'situations'],
  'easy-onset-practice': ['numbers', 'letters', 'words', 'practice', 'sentences', 'stories', 'conversation', 'situations'],
  'light-contact-practice': ['plosives', 'words', 'practice', 'sentences', 'conversation', 'situations'],
  'cancellation-practice': ['words', 'sentences', 'stories', 'conversation', 'situations'],
  'pull-out-practice': ['words', 'sentences', 'stories', 'conversation', 'situations'],
  'prep-set-practice': ['words', 'sentences', 'stories', 'conversation', 'situations']
};
// Speaking prompts have no word-by-word guide: the person talks freely for a set time.
export const freeCategories = new Set(['conversation', 'situations']);
export const FREE_SPEECH_MS = 60000;
const WORD_STEP = ['numbers', 'letters', 'colors', 'animals', 'food', 'words', 'plosives', 'practice', 'myWords'];
const PATH = [
  { key: 'words', categories: WORD_STEP },
  { key: 'sentences', categories: ['sentences'] },
  { key: 'stories', categories: ['stories'] },
  { key: 'conversation', categories: ['conversation'] },
  { key: 'situations', categories: ['situations'] }
];
// The speaking path for one exercise, from single words to real situations.
export function pathSteps(screen) {
  const available = categoriesByScreen[screen] || [];
  return PATH.filter(step => step.categories.some(category => available.includes(category))).map(step => ({
    ...step,
    category: step.key === 'words' ? screenDefaults[screen].category : step.key
  }));
}
export function stepOf(category) {
  return PATH.find(step => step.categories.includes(category))?.key || 'words';
}
// Each exercise opens the same way, so nothing carries over from the previous one.
export const screenDefaults = {
  'slower-rate-practice': { category: 'words', itemCount: 1, speed: 5 },
  'easy-onset-practice': { category: 'words', itemCount: 1, speed: 5 },
  'light-contact-practice': { category: 'plosives', itemCount: 1, speed: 5 },
  'cancellation-practice': { category: 'words', itemCount: 1, speed: 7 },
  'pull-out-practice': { category: 'words', itemCount: 1, speed: 7 },
  'prep-set-practice': { category: 'words', itemCount: 1, speed: 7 }
};
// Holding the breath is off by default, and the limits keep a cycle at 4 seconds or longer.
export const breathingPresets = [
  { inhale: 4, hold: 0, exhale: 6 },
  { inhale: 3, hold: 0, exhale: 4 },
  { inhale: 3, hold: 0, exhale: 6 }
];
export const breathingLimits = { inhale: [2, 6], hold: [0, 5], exhale: [2, 10] };
export const breathingCycles = { min: 1, max: 10, initial: 5 };
export const cancellationPause = { min: 1, max: 5, initial: 3 };
const REST_MS = 800;
const STOP_LETTERS = new Set([...'بتدضطقك', ...'BCDGKPQT']);
// Spellings whose first sound is not a stop, despite the first letter.
const NOT_STOP_SPELLING = /^(ch|ce|ci|cy|ge|gi|gy|kn|ph|th)/i;

export function startsWithStop(text) {
  const clean = text.trim().replace(/^ال/u, '');
  return STOP_LETTERS.has(clean[0]?.toUpperCase()) && !NOT_STOP_SPELLING.test(clean);
}
// Easy Onset suits vowels and continuants; stop consonants belong to Light Contact.
export function lettersForScreen(screen, letterWords) {
  const stop = letter => STOP_LETTERS.has(letter.toUpperCase());
  return Object.keys(letterWords).filter(letter => screen === 'light-contact-practice' ? stop(letter) : !stop(letter));
}
function textOf(item) { return typeof item === 'string' ? item : item.text; }
function fitsScreen(screen, category, item) {
  if (!['words', 'practice'].includes(category)) return true;
  if (screen === 'light-contact-practice') return startsWithStop(textOf(item));
  if (screen === 'easy-onset-practice') return !startsWithStop(textOf(item));
  return true;
}
export function splitPhrases(text) {
  // Include Arabic punctuation and retain an unfinished final phrase.
  return text.match(/[^,.!?،؛؟。\n]+[,.!?،؛؟。\n]*/gu)?.map(s => s.trim()).filter(Boolean) || [];
}
export function practiceItems(data, category, letter, screen) {
  const items = category === 'practice' ? (data.letterWords[letter] || []).map(text => ({ text, icon: null })) : data[category] || [];
  return items.filter(item => fitsScreen(screen, category, item));
}
// Spoken beats for the Arabic words on the pacing board, grouped by count. Words shared with
// VOC use its checked counts (tests/beats.cjs enforces this); the rest follow the same level of
// spoken Syrian Arabic: no case endings or tanween, except in set adverbs like جداً; helping vowels
// count (طفل is ṭi-fil, 2) and dropped vowels do not (سمكة is sam-ke, 2), but full vowels stay
// (كتاب is 2, not ktāb). The article adds one beat. Listed for clinician review.
const ARABIC_BEATS = {
  1: 'أب أرض باب بحث بحر برجا برق بعض بنت بيت تاج تحت توت تين ثلج ثوب ثور ثوم جسر حر حوت خبز خل خوخ دار دب ديك ذئب ذوق ذيل رأس رعد رف ريح زر زوج زيت سقف شاي شعر شمس صقر صوت صوص صيف ضخم ضرس ضوء ضيف طبل طير ظبي ظرف ظل ظن ظهر عين فأر فأس فصل فم فن فوز في فيل قلب كأس كل كلب كنز كهف كوب لحم له لوز لون ليل ماء مشط مع موز نار نبض نوم وجه ورد وقت يد يوم',
  2: 'آكل أبقار أبني أبي أبيض أجلس أحب أحلم أحمر أخضر أذهب أرسم أركض أرنب أزرق أسد أسود أشرب أشياء أصفر أطوي أعيش أغسل أغلق أفتح أقطف أقفز أكتب أكل ألعب أمشي أمل أمي أنا أنام أنظر إلى اسمي الآن الباب البيت الثلج الخبز الشمس الضوء الطين العشب الفيل القلب اللون الليل الماء اليوم بارد بالماء بجد بريد بسمة بصل بصوت بطة بلوتوث بني بها بوصلة بوظة بيتزا بيضاء تحميل تدق تراب ترك تسبح تطن تطير تفاح تلفاز تمر تمساح تمطر تهب ثعبان ثعلب ثقيل ثمار ثمن جائع جبل جدا جدار جدي جرارا جرس جزر جزرة جمل جميل جندي جوال جيدا حارة حاسوب حبل حزن حساب حشرة حصان حقل حقنة حلزون حلم حلوة حلوى حليب حمام حولي خاتم خروج خروف خشب خيار خيمة دائما دافئا درج دفتر دلو دواء ذراع ذرة ذكر ذكي ذهب ذهن ربح ربيع رجل رصيف رفع رمان رمل رياح ريشة زرقاء زلزال زنبق زهرة زورق زيتون ساخن ساطع ساعة سرير سريع سعيد سقوط سكر سكين سلام سلة سمكة شارع شاشة شبح شتاء شلال شمعة شنطة صابون صاروخ صاعقة صافية صباح صديق صفراء صندوق صوته صورة صياد ضباب ضحك ضرب ضفدع ضلع ضمن طابعة طبيب طريق طعام طفل طلب طويل ظريف ظفر ظلام ظلم عادي عال عالم عاليا عجلة عريس عسل عشاء عشر عصفور عصفورا عطلة عقل علم على عمل عنب غابة غبار غداء غراب غزال غصن غطاء غنى غيمة فأرة فتح فجر فستان فكر فيديو قبعة قدم قرأت قطار قطة قفص قفل قلم قمر قميص قهوة قوي كبير كبيرا كتاب كتابا كتف كثيرا كرة كرز كرسي كسل كعكة كلبي لؤلؤ لاعب لامعة لدي لزج لسان لعبة لوحة ليفة ليمون مبري مرساة مسجد مصباح مصعد مطار مطر معطفا معهم مفتاح مفتوح مقص مكتب ملف منزل ميناء نائمة نافذة نجمة نجوم نحلة نخلة نظيف نفسي نفق نمر نملة نهر هاتف هادئ هدف هدوء هرم هروب هلال هو هواء هي وادي واسع وايفاي وجبة وحاد وحيد ودود وردي ورقة وزة وطن وعاء ولد ياسمين يبكي يدي يسار يعمل يقطين يقين يكبر يمشي ينبوع',
  3: 'أتعلم أتمنى أراقب أرتدي أرى أساعد أستمع أسناني أشارك أصابع ألعابي أمنية أنظف إشارة إعدادات إنها الأسد البرك البيضاء التفاح الجبل الحذاء الحساء الحصان الحقل الحليب الخارج الذرة الرياح الزهور الساعة السحب السماء السمكة الصابون الصندوق الطريق الطفل العالم العسل القطة القلم القمر القميص الكبير الكتاب الكرة الكرسي الكعكة المذاق المطر النافذة النجمة النجوم النحلة النملة النهر الورقة بالسحر بالقلم بانتظام بجمال بدقة برتقال بعيدة بقوة بنطلون بهدوء بوضوح تخرج تغرد تفاحة تماما ثلاثة جديدة جمجمة جميلة حافلة حديقة حقيبة خريطة خزانة خنفساء دجاجة دراجة دمية ذبابة رسالة زبادي زرافة سباحة ستارة سجادة سحابة سريري سفينة سلحفاة سماعة سيارة شاحنة شجرة صغيرة ضمادة طائرة طاولة طباشير طويلة طيبة عائلتي غسالة فراشة فرشاة فقاعات فواكه كاميرا كبيرة كمثرى لذيذة للغاية للنجمة مجلد محطة مدرسة مدينة مرآة مستخدم مشتعل مطرقة مظلة معلم مكبر ملاحة ملعقة ممتعة منشفة مهذب موسيقى ميكروفون نظارات نظارة نظيفة هدية هذه والجمال وبارد وسادة وساكن وعميق ولذيذ ومنعش وواسع يمامة',
  4: 'أصدقائي ابتسامة الحديقة الحيوان السباحة الشجرة الطائرة العصافير المدرسة المرآة المزرعة المظلة الموسيقى برتقالي بطارية بنفسجي شيكولاتة مبللة مستديرة مشاركة ملونة ميدالية ومرتب ونظيفة',
  5: 'المعلمة المكعبات'
};
const arabicBeats = new Map(Object.entries(ARABIC_BEATS).flatMap(([count, words]) => words.split(' ').map(word => [word, +count])));
// English words the spelling rule below gets wrong.
const ENGLISH_BEATS = { idea: 3, quiet: 2, video: 3, headphones: 2 };
// Words outside the table are estimated. Only stories use this, which affects pacing alone, not the board.
export function countSyllables(text) {
  const word = text.split(/\s+-\s+/u).pop();
  const arabic = word.replace(/[^\u0621-\u064A]/gu, '');
  if (arabic) return arabicBeats.get(arabic) ?? Math.max(1, Math.round(arabic.length / 2));
  const latin = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!latin) return 1;
  if (ENGLISH_BEATS[latin]) return ENGLISH_BEATS[latin];
  // A final silent e, except in -le after a consonant, as in apple and table.
  const spoken = /[^aeiouy]le$/.test(latin) ? latin : latin.replace(/([^aeiouy])e$/, '$1');
  const groups = spoken.match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}
// Speed 0 is 40 syllables a minute (1500 ms each); speed 10, the normal rate, is 200 (300 ms each).
export function syllableMs(speed) { return Math.round(1500 - speed * 120); }
export function syllablesPerMinute(speed) { return Math.round(60000 / syllableMs(speed)); }

export function practiceTokens(items, category, pageIndex, itemCount) {
  if (freeCategories.has(category)) {
    return items[pageIndex] ? [{ text: items[pageIndex], breath: false, phraseEnd: true, target: false, syllables: 1, free: true }] : [];
  }
  if (singleItemCategories.has(category)) {
    return items.slice(pageIndex, pageIndex + itemCount).map(item => ({
      text: item.text, breath: true, phraseEnd: true, target: true, syllables: countSyllables(item.text)
    }));
  }
  return splitPhrases(items[pageIndex] || '').flatMap(phrase => {
    const words = phrase.split(/\s+/u);
    const counts = words.map(countSyllables);
    // One target word in each phrase: the longest, and the first if lengths tie.
    const target = counts.reduce((best, count, index) => count > counts[best] || (count === counts[best] && words[index].length > words[best].length) ? index : best, 0);
    return words.map((text, index) => ({
      text, breath: index === 0, phraseEnd: index === words.length - 1, target: index === target, syllables: counts[index]
    }));
  });
}
export function buildCues(screen, tokens, { speed = 5, pauseSeconds = cancellationPause.initial } = {}) {
  const perSyllable = syllableMs(speed);
  const easyOnset = screen === 'easy-onset-practice';
  const cues = [];
  tokens.forEach((token, index) => {
    const push = (phase, duration) => cues.push({ index, phase, duration });
    const say = token.syllables * perSyllable;
    if (token.free) { push('talk', FREE_SPEECH_MS); return; }
    if (easyOnset) {
      if (token.breath) push('breath', 1000);
      push('vocalize', say);
    } else if (token.target && screen === 'cancellation-practice') {
      push('stutter', 1500); push('pause', pauseSeconds * 1000); push('repeat', Math.max(1500, say));
    } else if (token.target && screen === 'pull-out-practice') {
      push('stutter', 1500); push('transition', Math.max(2000, say));
    } else if (token.target && screen === 'prep-set-practice') {
      push('prepare', 1500); push('smooth', Math.max(1500, say));
    } else push('word', say);
    if (!easyOnset && token.phraseEnd && index < tokens.length - 1) push('rest', REST_MS);
  });
  return cues;
}
// Touch exercises. All timings are suggestions for clinician review.
export const touchRules = { slideZone: [.35, .65], slideRest: 400, sayMinMs: 1200, pullMinMs: 2000, prepareMs: 1500, maxJump: 25, bubbleMaxMs: 400 };
export function touchSteps(screen, { pauseSeconds = cancellationPause.initial } = {}) {
  return {
    'easy-onset-practice': [
      { kind: 'slide', phase: 'breath', label: 'slideStop' },
      { kind: 'say', phase: 'vocalize', label: 'sayNow' }
    ],
    'light-contact-practice': [{ kind: 'bubble', phase: 'word', label: 'bubble', hint: 'softer' }],
    'cancellation-practice': [
      { kind: 'tap', phase: 'stutter', label: 'sayIt' },
      { kind: 'hold', phase: 'pause', label: 'holdPause', hint: 'keepHolding', ms: pauseSeconds * 1000 },
      { kind: 'tap', phase: 'repeat', label: 'sayAgain' }
    ],
    'pull-out-practice': [
      { kind: 'tap', phase: 'stutter', label: 'sayIt' },
      { kind: 'drag', phase: 'transition', label: 'slide', hint: 'gentle', ms: touchRules.pullMinMs }
    ],
    'prep-set-practice': [
      { kind: 'hold', phase: 'prepare', label: 'holdReady', hint: 'keepHolding', ms: touchRules.prepareMs },
      { kind: 'tap', phase: 'smooth', label: 'startSoft' }
    ]
  }[screen] || [];
}
// Which words the child works through by touch. Slower Rate follows the turtle instead.
export function touchTargets(screen, category, tokens) {
  if (freeCategories.has(category) || !touchSteps(screen).length) return [];
  const indexes = tokens.map((_, index) => index);
  const keep = test => indexes.filter(index => test(tokens[index]));
  if (screen === 'easy-onset-practice') return keep(token => token.breath);
  if (screen === 'light-contact-practice') {
    const stops = keep(token => startsWithStop(token.text));
    return stops.length ? stops : indexes.slice(0, 1);
  }
  return keep(token => token.target);
}
// The ball takes longer on a slower setting, then rests a moment at the bottom before starting again.
export function slideMs(speed) { return syllableMs(speed) * 4; }
export function slideProgress(elapsed, ms) { return Math.min(1, (elapsed % (ms + touchRules.slideRest)) / ms); }
export function inSlideZone(position) { return position >= touchRules.slideZone[0] && position <= touchRules.slideZone[1]; }
export function sayMs(syllables, speed) { return Math.max(touchRules.sayMinMs, syllables * syllableMs(speed)); }
export function dragResult({ value, previous, startedAt, now, minMs }) {
  if (value - previous > touchRules.maxJump) return 'fast';
  if (value < 100) return 'moving';
  return now - startedAt < minMs ? 'fast' : 'done';
}
export function parentScreen(screen) {
  if (['situations', 'feared', 'affirmation', 'self-rating'].includes(screen)) return 'tools';
  if (['slower-rate-practice', 'easy-onset-practice', 'light-contact-practice'].includes(screen)) return 'fluency-shaping';
  if (['cancellation-practice', 'pull-out-practice', 'prep-set-practice'].includes(screen)) return 'stuttering-modification';
  if (screen === 'breathing-practice') return 'breathing-techniques';
  return 'home';
}
export function readLanguage() {
  try { return localStorage.getItem('fluency-flow-language') === 'en' ? 'en' : 'ar'; } catch { return 'ar'; }
}
