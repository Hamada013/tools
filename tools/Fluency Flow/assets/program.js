// The 14-day training program: original content, for clinician review. No interface code here.
const lesson = topic => ({ type: 'lesson', topic, mins: 1 });
const breath = (preset, breaths = 3) => ({ type: 'breath', preset, breaths, mins: 1 });
const drill = (screen, category, times) => ({ type: 'exercise', screen, category, times, mins: Math.max(1, Math.ceil(times * .7)) });
const affirm = { type: 'affirmation', mins: 1 };
const rate = { type: 'selfRating', mins: 1 };
const board = { type: 'board', mins: 2 };
const feared = { type: 'feared', mins: 2 };
const tryOne = { type: 'tryOne', mins: 3 };
const SLOW = 'slower-rate-practice', ONSET = 'easy-onset-practice', LIGHT = 'light-contact-practice';
const CANCEL = 'cancellation-practice', PULL = 'pull-out-practice', PREP = 'prep-set-practice';

export const PROGRAM = [
  [lesson('welcome'), breath(0), lesson('slower'), drill(SLOW, 'words', 3), affirm, rate],
  [breath(0), drill(SLOW, 'words', 2), drill(SLOW, 'sentences', 2), board, rate],
  [breath(2), lesson('onset'), drill(ONSET, 'words', 3), affirm, rate],
  [breath(2), drill(ONSET, 'words', 2), drill(ONSET, 'sentences', 2), feared, rate],
  [breath(0), lesson('light'), drill(LIGHT, 'plosives', 3), drill(LIGHT, 'words', 2), rate],
  [breath(2), drill(SLOW, 'sentences', 1), drill(ONSET, 'sentences', 1), drill(LIGHT, 'sentences', 2), affirm, rate],
  [breath(1), lesson('cancel'), drill(CANCEL, 'words', 3), drill(CANCEL, 'sentences', 1), rate],
  [breath(1), lesson('pull'), drill(PULL, 'words', 3), drill(PULL, 'sentences', 1), affirm, rate],
  [breath(1), lesson('prep'), drill(PREP, 'myWords', 3), drill(PREP, 'sentences', 1), rate],
  [breath(1), drill(CANCEL, 'sentences', 1), drill(PULL, 'sentences', 1), drill(PREP, 'sentences', 1), affirm, rate],
  [breath(0), lesson('talking'), drill(SLOW, 'conversation', 1), drill(ONSET, 'conversation', 1), rate],
  [breath(1), drill(PULL, 'conversation', 1), drill(PREP, 'situations', 1), affirm, rate],
  [breath(1), drill(SLOW, 'stories', 1), tryOne, rate],
  [breath(0), drill(ONSET, 'conversation', 1), tryOne, affirm, lesson('keepGoing'), rate]
];

const stepKey = (day, index) => `${day}:${index}`;
export function isStepDone(done, day, index) { return Boolean(done?.[stepKey(day, index)]); }
// Replaying a step keeps its first time, so practicing again cannot push the next day back.
export function markStep(done, day, index, at) {
  return isStepDone(done, day, index) ? done : { ...done, [stepKey(day, index)]: at };
}
export function isDayDone(done, day) { return PROGRAM[day].every((_, index) => isStepDone(done, day, index)); }
export function dayFinishedAt(done, day) {
  return isDayDone(done, day) ? Math.max(...PROGRAM[day].map((_, index) => done[stepKey(day, index)])) : null;
}
const sameDate = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
// One new day per calendar date on this device. An adult can open any day from the plan.
// Returns null when the day is open, otherwise 'earlier' or 'tomorrow' for the reason it is not.
export function lockReason(done, day, { unlocked, now = Date.now() } = {}) {
  if (day === 0 || unlocked?.[day]) return null;
  if (!isDayDone(done, day - 1)) return 'earlier';
  return sameDate(dayFinishedAt(done, day - 1), now) ? 'tomorrow' : null;
}
export function isDayOpen(done, day, options) { return lockReason(done, day, options) === null; }
export function isProgramDone(done) { return isDayDone(done, PROGRAM.length - 1); }
// The furthest day reached, so opening a later day moves the person there and it can be undone.
export function currentDay(done, unlocked) {
  const reached = PROGRAM.map((steps, day) => unlocked?.[day] || steps.some((_, index) => isStepDone(done, day, index)) ? day : -1);
  const furthest = Math.max(...reached);
  if (furthest < 0) return 0;
  return isDayDone(done, furthest) ? Math.min(furthest + 1, PROGRAM.length - 1) : furthest;
}
export function isWaitingForTomorrow(done, unlocked, now = Date.now()) {
  return !isProgramDone(done) && lockReason(done, currentDay(done, unlocked), { unlocked, now }) === 'tomorrow';
}
export function nextStep(done, day) { return PROGRAM[day].findIndex((_, index) => !isStepDone(done, day, index)); }
export function daysDone(done) { return PROGRAM.filter((_, day) => isDayDone(done, day)).length; }
export function dayMinutes(day) { return PROGRAM[day].reduce((sum, step) => sum + step.mins, 0); }

// Up to 5 situations, easiest first, so the next real-life try is never the hardest one.
export function suggestedSituation(levels, tried) {
  const ranked = SITUATIONS.filter(item => levels?.[item.id]).sort((a, b) => levels[a.id] - levels[b.id]);
  return ranked.find(item => !tried?.[item.id]) || ranked[0] || SITUATIONS[0];
}

export const SITUATIONS = [
  ['family', 'Talking with my family at home', 'الكلام مع عائلتي في البيت'],
  ['friend', 'Chatting with a close friend', 'الدردشة مع صديق مقرّب'],
  ['aloud', 'Reading aloud', 'القراءة بصوت عالٍ'],
  ['name', 'Saying my name to someone new', 'قول اسمي لشخص جديد'],
  ['shop', 'Asking the price in a shop', 'السؤال عن السعر في المحل'],
  ['order', 'Ordering food or a drink', 'طلب طعام أو مشروب'],
  ['directions', 'Asking for directions', 'السؤال عن الطريق'],
  ['voice', 'Sending a voice message', 'إرسال رسالة صوتية'],
  ['callKnown', 'Calling someone I know', 'الاتصال بشخص أعرفه'],
  ['callNew', 'Calling someone I do not know', 'الاتصال بشخص لا أعرفه'],
  ['question', 'Asking a question in class or at work', 'طرح سؤال في الصف أو في العمل'],
  ['group', 'Talking in a group', 'الكلام ضمن مجموعة'],
  ['present', 'Speaking in front of others', 'التحدث أمام الآخرين'],
  ['joke', 'Telling a funny story', 'رواية قصة طريفة'],
  ['tell', 'Telling someone that I stutter', 'إخبار شخص بأنني أتأتئ']
].map(([id, en, ar]) => ({ id, en, ar }));

// These value the person and their message rather than promising fluent speech.
export const AFFIRMATIONS = [
  ['What I have to say matters.', 'ما أريد قوله مهم.'],
  ['I can take my time when I speak.', 'يمكنني أن آخذ وقتي عندما أتكلم.'],
  ['It is okay to stutter.', 'لا بأس أن أتأتئ.'],
  ['Trying takes courage, and I am trying.', 'المحاولة شجاعة، وأنا أحاول.'],
  ['People can wait to hear my words.', 'يمكن للناس أن ينتظروا ليسمعوا كلماتي.'],
  ['Every practice helps me a little.', 'كل تدريب يساعدني قليلاً.'],
  ['My voice belongs to me.', 'صوتي ملكي.'],
  ['I speak to share, not to be perfect.', 'أتكلم لأشارك، لا لأبلغ الكمال.'],
  ['A hard word does not stop me.', 'الكلمة الصعبة لا توقفني.'],
  ['I am proud of myself for practicing.', 'أفتخر بنفسي لأنني أتدرب.']
].map(([en, ar]) => ({ en, ar }));

export const LESSONS = {
  welcome: [
    ['Welcome!', 'Many children and adults stutter. It is nobody\'s fault, and it does not change how smart or capable you are.', 'أهلاً بك!', 'كثير من الأطفال والكبار يتأتئون. هذا ليس خطأ أحد، ولا يغيّر ذكاءك أو قدراتك.'],
    ['A little every day', 'A few short minutes each day help more than one long practice now and then.', 'قليل كل يوم', 'بضع دقائق قصيرة كل يوم تفيد أكثر من تدريب طويل بين حين وآخر.'],
    ['Trying is what counts', 'You earn stars for practicing, not for perfect speech. Stuttering during practice is fine.', 'المحاولة هي الأهم', 'تربح النجوم على التدريب، لا على الكلام المثالي. لا بأس أن تتأتئ أثناء التدريب.']
  ],
  slower: [
    ['Turtle talk', 'Talking a little slower gives your mouth time to move smoothly.', 'كلام السلحفاة', 'الكلام الأبطأ قليلاً يعطي فمك وقتاً ليتحرك بسلاسة.'],
    ['Walk with the turtle', 'Say the word slowly while the turtle walks. Choose its speed with the numbers.', 'امشِ مع السلحفاة', 'قل الكلمة ببطء بينما تمشي السلحفاة. اختر سرعتها بالأرقام.']
  ],
  onset: [
    ['Start like a breeze', 'Let a little air flow first, then let your voice begin softly.', 'ابدأ مثل النسمة', 'دع قليلاً من الهواء يخرج أولاً، ثم دع صوتك يبدأ بنعومة.'],
    ['Stop in the middle', 'Watch the ball roll down the slide. Press when it reaches the middle, then say the word softly.', 'أوقفها في الوسط', 'راقب الكرة وهي تنزل على الزحليقة. اضغط عندما تصل إلى الوسط، ثم قل الكلمة بنعومة.']
  ],
  light: [
    ['Soft touches', 'Some sounds need your lips or tongue to touch. Let them touch very lightly.', 'لمسات ناعمة', 'بعض الأصوات تحتاج أن تتلامس شفتاك أو لسانك. دعها تتلامس بخفة شديدة.'],
    ['Do not pop the bubble', 'Imagine a bubble between your lips. Touch softly so it does not pop.', 'لا تفرقع الفقاعة', 'تخيّل فقاعة بين شفتيك. المسها بنعومة حتى لا تفرقع.']
  ],
  cancel: [
    ['Stop and try again', 'If a word gets stuck, finish it. Then stop, breathe and stay calm.', 'توقف وحاول مرة أخرى', 'إذا علقت كلمة، أكملها. ثم توقف وتنفس وابقَ هادئاً.'],
    ['Say it softly', 'Now say the same word again, softly and slowly. You are in charge.', 'قلها بنعومة', 'الآن قل الكلمة نفسها مرة أخرى، بنعومة وببطء. أنت من يقرر.']
  ],
  pull: [
    ['Slide out of it', 'When a word gets stuck, do not push. Slow down and ease out of it.', 'اخرج منها بهدوء', 'عندما تعلق كلمة، لا تضغط. أبطئ واخرج منها بهدوء.'],
    ['Like a slow slide', 'Move your finger slowly as you loosen your mouth and finish the word.', 'مثل زحليقة بطيئة', 'حرّك إصبعك ببطء وأنت ترخي فمك وتكمل الكلمة.']
  ],
  prep: [
    ['Get ready first', 'Sometimes you can tell a word will be hard. That is a useful clue!', 'استعد أولاً', 'أحياناً تعرف أن كلمة ستكون صعبة. هذه علامة مفيدة!'],
    ['Then start softly', 'Pause, relax your mouth, then begin the word gently.', 'ثم ابدأ بنعومة', 'توقف قليلاً، أرخِ فمك، ثم ابدأ الكلمة بلطف.']
  ],
  talking: [
    ['Real talking', 'Now use your tools while talking freely. It is harder, and that is normal.', 'كلام حقيقي', 'الآن استخدم أدواتك وأنت تتكلم بحرية. هذا أصعب، وهذا طبيعي.'],
    ['Pick one tool', 'Choose one tool and use it for one minute. Stuttering along the way is okay.', 'اختر أداة واحدة', 'اختر أداة واحدة واستخدمها لدقيقة. لا بأس أن تتأتئ في الطريق.']
  ],
  keepGoing: [
    ['Look how far you came', 'You finished two weeks of practice. That took real courage.', 'انظر كم تقدمت', 'أكملت أسبوعين من التدريب. هذا يحتاج إلى شجاعة حقيقية.'],
    ['Keep going', 'Keep practicing the tools that help you most, and share your progress with your speech therapist.', 'استمر', 'استمر في التدريب على الأدوات التي تساعدك أكثر، وشارك تقدمك مع أخصائي النطق.']
  ]
};
