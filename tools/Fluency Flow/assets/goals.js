// Therapy goals and achievement. A goal's percentage starts from finished practice, because the app
// cannot hear speech, until the therapist types their own rating. Goals and targets are suggestions
// for clinician review. No interface code here.

// A lock to keep children out, not security: anyone can read this in the page's source.
export const THERAPIST_PASSWORD = '013';

const FREE_SPEECH = ['conversation', 'situations'];
const DAY_MS = 86400000;

export const LONG_TERM_GOAL = {
  en: 'Speak more easily and confidently in everyday situations, using fluency and stuttering modification tools.',
  ar: 'الكلام بسهولة وثقة أكبر في المواقف اليومية، باستخدام أدوات تشكيل الطلاقة وتعديل التأتأة.'
};
export const GOAL_GROUPS = [
  { id: 'fluency', en: 'Fluency shaping', ar: 'تشكيل الطلاقة' },
  { id: 'modification', en: 'Stuttering modification', ar: 'تعديل التأتأة' },
  { id: 'breathing', en: 'Breathing', ar: 'التنفس' },
  { id: 'carryover', en: 'Carry-over to real speech', ar: 'النقل إلى الكلام الحقيقي' },
  { id: 'selfManagement', en: 'Self-management and attitude', ar: 'الإدارة الذاتية والاتجاهات' }
];
export const GOALS = [
  { id: 'slower', group: 'fluency', target: 20, source: 'speech', screen: 'slower-rate-practice', en: 'Use a slower rate in words, sentences and stories', ar: 'استخدام معدل كلام أبطأ في الكلمات والجمل والقصص' },
  { id: 'onset', group: 'fluency', target: 20, source: 'speech', screen: 'easy-onset-practice', en: 'Use easy onsets in words, sentences and stories', ar: 'استخدام البداية السهلة في الكلمات والجمل والقصص' },
  { id: 'light', group: 'fluency', target: 20, source: 'speech', screen: 'light-contact-practice', en: 'Use light contacts on stop sounds, words and sentences', ar: 'استخدام اللمس الخفيف في الأصوات الانفجارية والكلمات والجمل' },
  { id: 'cancel', group: 'modification', target: 15, source: 'speech', screen: 'cancellation-practice', en: 'Use cancellation: finish, pause, then repeat softly', ar: 'استخدام الإلغاء: إكمال الكلمة ثم التوقف ثم إعادتها بنعومة' },
  { id: 'pull', group: 'modification', target: 15, source: 'speech', screen: 'pull-out-practice', en: 'Use pull-outs to ease out of a stuck word', ar: 'استخدام الانسحاب للخروج بهدوء من الكلمة العالقة' },
  { id: 'prep', group: 'modification', target: 15, source: 'speech', screen: 'prep-set-practice', en: 'Use preparatory sets before hard words', ar: 'استخدام التهيئة المسبقة قبل الكلمات الصعبة' },
  { id: 'breath', group: 'breathing', target: 15, source: 'breathing', en: 'Use calm, controlled breathing', ar: 'استخدام التنفس الهادئ والمنضبط' },
  { id: 'conversation', group: 'carryover', target: 15, source: 'freeSpeech', en: 'Use a technique during one minute of free speech', ar: 'استخدام تقنية أثناء دقيقة من الكلام الحر' },
  { id: 'situations', group: 'carryover', target: 5, source: 'tried', en: 'Try real speaking situations, from easiest to hardest', ar: 'تجربة مواقف كلام حقيقية من الأسهل إلى الأصعب' },
  { id: 'daily', group: 'selfManagement', target: 14, source: 'days', en: 'Complete the 14-day daily program', ar: 'إكمال البرنامج اليومي لمدة 14 يوماً' },
  { id: 'selfRating', group: 'selfManagement', target: 14, source: 'selfRatings', en: 'Rate own speaking regularly', ar: 'تقييم الكلام ذاتياً بانتظام' },
  { id: 'kindWords', group: 'selfManagement', target: 14, source: 'kindWords', en: 'Practice kind words about own speech', ar: 'التدرب على كلمات لطيفة عن الكلام' }
];

// Gathers everything achievement is measured from. programFinishes holds the time each day was finished.
export function buildRecord(entries, extra, programFinishes) {
  return {
    entries: entries || [],
    tried: Object.values(extra?.tried || {}),
    selfRatings: (extra?.selfRatings || []).map(item => item.at),
    kindWords: extra?.affirmations || [],
    days: programFinishes || [],
    scores: extra?.goalScores || {}
  };
}
const sameDate = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
// Saves the therapist's rating for a goal, keeping one per calendar date so the graph shows real change.
// A percent of null returns the goal to the practice count from that date, leaving earlier ratings in the graph.
export function withScore(scores, goalId, percent, at) {
  const value = percent === null ? null : Math.min(100, Math.max(0, Math.round(Number(percent))));
  if (value !== null && !Number.isFinite(value)) return scores || {};
  const kept = (scores?.[goalId] || []).filter(entry => !sameDate(entry.at, at));
  return { ...scores, [goalId]: [...kept, { at, percent: value }] };
}
function ratingAt(goal, record, at) {
  const entries = (record.scores?.[goal.id] || []).filter(entry => entry.at <= at);
  return entries.length ? entries.reduce((latest, entry) => entry.at >= latest.at ? entry : latest).percent : null;
}
function goalEntries(goal, record) {
  if (goal.source === 'speech') return record.entries.filter(entry => entry.screen === goal.screen && !FREE_SPEECH.includes(entry.category));
  if (goal.source === 'breathing') return record.entries.filter(entry => entry.screen === 'breathing-practice');
  if (goal.source === 'freeSpeech') return record.entries.filter(entry => FREE_SPEECH.includes(entry.category));
  return [];
}
function goalTimes(goal, record) {
  return ['tried', 'selfRatings', 'kindWords', 'days'].includes(goal.source) ? record[goal.source] : goalEntries(goal, record).map(entry => entry.at);
}
export function goalProgress(goal, record, at = Infinity) {
  const done = goalTimes(goal, record).filter(time => time <= at).length;
  const rating = ratingAt(goal, record, at);
  const manual = rating !== null;
  const percent = manual ? rating : Math.min(100, Math.round(done / goal.target * 100));
  const status = percent >= 100 ? 'achieved' : percent > 0 || done > 0 ? 'working' : 'notStarted';
  return { done, target: goal.target, percent, status, manual };
}
export function overallPercent(record, at = Infinity) {
  return Math.round(GOALS.reduce((sum, goal) => sum + goalProgress(goal, record, at).percent, 0) / GOALS.length);
}
// The share of rated practice rated easy, or null when nothing has been rated.
export function easyShare(entries) {
  const rated = entries.filter(entry => [1, 2, 3].includes(entry.rating));
  return rated.length ? Math.round(rated.filter(entry => entry.rating === 1).length / rated.length * 100) : null;
}
export function goalEasyShare(goal, record) { return easyShare(goalEntries(goal, record)); }

// Eight bars ending today: days, then weeks, then four-week blocks as the record grows.
export function achievementOverTime(goalId, record, now = Date.now()) {
  const goal = GOALS.find(item => item.id === goalId);
  const timesFor = item => [...goalTimes(item, record), ...(record.scores?.[item.id] || []).map(entry => entry.at)];
  const times = goal ? timesFor(goal) : GOALS.flatMap(timesFor);
  const first = times.length ? Math.min(...times) : now;
  const span = (now - first) / DAY_MS;
  const days = span < 8 ? 1 : span < 56 ? 7 : 28;
  const today = new Date(now);
  const bars = Array.from({ length: 8 }, (_, index) => {
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (7 - index) * days, 23, 59, 59, 999).getTime();
    return { end, percent: goal ? goalProgress(goal, record, end).percent : overallPercent(record, end) };
  });
  return { unit: days === 1 ? 'day' : days === 7 ? 'week' : 'month', bars, hasData: times.length > 0 };
}
// Goals practiced in the last seven days and still open, most practiced first.
export function workingOn(record, now = Date.now()) {
  return GOALS
    .map(goal => ({ goal, recent: goalTimes(goal, record).filter(time => time > now - 7 * DAY_MS && time <= now).length }))
    .filter(item => item.recent > 0 && goalProgress(item.goal, record).status !== 'achieved')
    .sort((a, b) => b.recent - a.recent)
    .map(item => item.goal);
}
// The first open goal not being worked on, or else the least advanced of those that are.
export function nextGoal(record, now = Date.now()) {
  const current = workingOn(record, now);
  const open = GOALS.filter(goal => goalProgress(goal, record).status !== 'achieved');
  const fresh = open.find(goal => !current.includes(goal));
  if (fresh) return fresh;
  return open.sort((a, b) => goalProgress(a, record).percent - goalProgress(b, record).percent)[0] || null;
}
