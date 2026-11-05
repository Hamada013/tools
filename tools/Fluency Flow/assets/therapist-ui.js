// The therapist window: password lock, SOAP note, goals with achievement, and the bar graph.
import { Y, cf, pd } from './vendor.js';
import { Dialog } from './dialog.js';
import { GOALS, GOAL_GROUPS, LONG_TERM_GOAL, THERAPIST_PASSWORD, achievementOverTime, buildRecord, easyShare, goalEasyShare, goalProgress, nextGoal, overallPercent, withScore, workingOn } from './goals.js';
import { PROGRAM, SITUATIONS, currentDay, dayFinishedAt, daysDone, isProgramDone, suggestedSituation } from './program.js';
import { countLabel, weekSummary } from './progress.js';
import { ShareIcon, TickIcon, shareOrCopy } from './progress-ui.js';

const h = Y.createElement;
const dateTag = lang => lang === 'ar' ? 'ar-SY-u-nu-latn' : 'en';
const longDate = (time, lang) => new Date(time).toLocaleDateString(dateTag(lang), { day: 'numeric', month: 'long' });
// Built by hand: the Arabic date format carries direction marks that scramble it inside a left-to-right label.
const shortDate = time => `${new Date(time).getDate()}/${new Date(time).getMonth() + 1}`;
const joined = (items, lang) => items.join(lang === 'ar' ? '، ' : ', ');

function CloseButton({ t, onClose }) {
  return h('button', { type: 'button', className: 'ff-icon-button', 'aria-label': t.close, title: t.close, onClick: onClose }, h(pd, { 'aria-hidden': true }));
}

export function TherapistLock({ t, onUnlock, onClose }) {
  const [value, setValue] = Y.useState('');
  const [wrong, setWrong] = Y.useState(0);
  function submit(event) {
    event.preventDefault();
    if (value === THERAPIST_PASSWORD) { onUnlock(); return; }
    setWrong(count => count + 1);
    setValue('');
  }
  return h(Dialog, { onClose, label: t.th_lockTitle },
    h('div', { className: 'ff-dialog-card ff-gate' },
      h('div', { className: 'ff-dialog-head' }, h('h2', null, t.th_lockTitle), h(CloseButton, { t, onClose })),
      h('form', { className: 'ff-dialog-body ff-lock', onSubmit: submit },
        h('label', { htmlFor: 'ff-therapist-password' }, t.th_password),
        h('input', {
          id: 'ff-therapist-password', type: 'password', inputMode: 'numeric', autoComplete: 'off', maxLength: 12, value, 'data-autofocus': true,
          'aria-invalid': wrong > 0 || undefined, onChange: event => setValue(event.target.value)
        }),
        h('p', { className: 'ff-alert', role: 'alert', key: wrong }, wrong ? t.th_wrong : ''),
        h('button', { type: 'submit', className: 'ff-tap', disabled: !value }, t.th_unlock))));
}

// One series, so one colour and no legend. Values are also in the table, never only on hover.
function AchievementChart({ t, lang, title, timeline }) {
  const [active, setActive] = Y.useState(null);
  const { bars } = timeline;
  const last = bars.length - 1;
  const when = bar => timeline.unit === 'day' ? longDate(bar.end, lang) : `${t.th_until} ${longDate(bar.end, lang)}`;
  const shown = bars[active ?? last];
  return h('figure', { className: 'ff-chart' },
    h('figcaption', null, h('strong', null, t.th_chartTitle), h('span', null, title)),
    h('p', { className: 'ff-chart-readout', 'aria-hidden': true }, h('strong', null, `${shown.percent}%`), h('span', null, when(shown))),
    h('div', { className: 'ff-chart-area' },
      h('div', { className: 'ff-chart-y', 'aria-hidden': true }, ['100%', '50%', '0%'].map(label => h('span', { key: label }, label))),
      h('div', { className: 'ff-chart-plot' }, bars.map((bar, index) => h('div', {
        key: `${title}-${index}`, className: `ff-chart-col${active === index ? ' is-active' : ''}`, tabIndex: 0, role: 'img', 'aria-label': `${when(bar)}: ${bar.percent}%`,
        onPointerEnter: () => setActive(index), onPointerLeave: () => setActive(null), onFocus: () => setActive(index), onBlur: () => setActive(null)
      },
        h('div', { className: 'ff-chart-track' },
          h('i', { className: 'ff-chart-bar', style: { height: `${bar.percent}%`, animationDelay: `${index * 45}ms` } }),
          index === last && h('b', { className: 'ff-chart-tip', style: { bottom: `${bar.percent}%` }, 'aria-hidden': true }, `${bar.percent}%`)),
        h('span', { className: 'ff-chart-x', 'aria-hidden': true }, shortDate(bar.end)))))),
    h('details', { className: 'ff-chart-table' },
      h('summary', null, t.th_table),
      h('table', null,
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, t.th_date), h('th', { scope: 'col' }, t.th_percent))),
        h('tbody', null, bars.map((bar, index) => h('tr', { key: index }, h('td', null, when(bar)), h('td', null, `${bar.percent}%`)))))));
}

// Saves on Enter or on leaving the field. An empty or unchanged field changes nothing.
function ScoreInput({ label, percent, onSave }) {
  const [draft, setDraft] = Y.useState(String(percent));
  function commit() {
    const value = Number(draft);
    if (draft.trim() === '' || !Number.isFinite(value)) { setDraft(String(percent)); return; }
    if (Math.min(100, Math.max(0, Math.round(value))) === percent) { setDraft(String(percent)); return; }
    onSave(value);
  }
  return h('input', {
    type: 'number', inputMode: 'numeric', min: 0, max: 100, step: 1, value: draft, 'aria-label': label,
    onChange: event => setDraft(event.target.value), onBlur: commit,
    onKeyDown: event => { if (event.key === 'Enter') { event.preventDefault(); commit(); } }
  });
}

function GoalRow({ t, lang, goal, record, selected, personId, onSelect, onScore }) {
  const progress = goalProgress(goal, record);
  const easy = goalEasyShare(goal, record);
  const details = [`${progress.done} / ${progress.target}`, t[`th_${progress.status}`]];
  if (progress.manual) details.push(t.th_byTherapist);
  if (easy !== null) details.push(`${t.ratingEasy} ${easy}%`);
  return h('div', { className: `ff-goal${selected ? ' is-selected' : ''}`, 'data-goal': goal.id },
    h('button', { type: 'button', className: 'ff-goal-select', 'aria-pressed': selected, onClick: onSelect },
      h('span', { className: 'ff-goal-top' }, h('strong', null, goal[lang]), h('b', null, `${progress.percent}%`)),
      h('span', { className: 'ff-meter' }, h('i', { style: { width: `${progress.percent}%` } })),
      h('small', null, details.join(' · '))),
    h('div', { className: 'ff-goal-edit' },
      h('span', { 'aria-hidden': true }, t.th_setPercent),
      h(ScoreInput, { key: `${personId}-${progress.percent}`, label: `${t.th_setPercent}: ${goal[lang]}`, percent: progress.percent, onSave: value => onScore(goal.id, value) }),
      h('span', { 'aria-hidden': true }, '%'),
      progress.manual && h('button', {
        type: 'button', className: 'ff-icon-button', 'aria-label': `${t.th_useCount}: ${goal[lang]}`, title: t.th_useCount, onClick: () => onScore(goal.id, null)
      }, h(cf, { 'aria-hidden': true }))));
}

function soapLines({ t, lang, entries, extra, record, done, unlocked, now }) {
  const week = weekSummary(entries, now);
  const ratings = extra.selfRatings || [];
  const lastRating = ratings[ratings.length - 1];
  const effort = [[1, t.ratingEasy], [2, t.ratingSome], [3, t.ratingHard]].map(([value, label]) => [label, entries.filter(entry => entry.rating === value).length]).filter(([, count]) => count);
  const placed = SITUATIONS.filter(item => extra.situations?.[item.id]).sort((a, b) => extra.situations[a.id] - extra.situations[b.id]);
  const lastRate = [...entries].reverse().find(entry => entry.spm)?.spm;
  const s = [lastRating ? `${t.th_lastSelf}: ${t[`self_${lastRating.value}`]} (${longDate(lastRating.at, lang)})` : t.th_noSelf];
  if (effort.length) s.push(`${t.th_effort}: ${effort.map(([label, count]) => `${label} ${count}`).join(' · ')}`);
  if (extra.feared?.letters?.length) s.push(`${t.th_fearedSounds}: ${joined(extra.feared.letters, lang)}`);
  if (extra.feared?.words?.length) s.push(`${t.th_fearedWords}: ${joined(extra.feared.words, lang)}`);
  if (placed.length) s.push(`${t.th_easiest}: ${placed[0][lang]}`);
  if (placed.length > 1) s.push(`${t.th_hardest}: ${placed[placed.length - 1][lang]}`);

  const o = [
    `${t.thisWeek}: ${countLabel(lang, week.days, t.units.days)} · ${countLabel(lang, week.practices, t.units.practices)}`,
    `${t.th_total}: ${entries.length}`,
    `${t.dailyTraining}: ${daysDone(done)} / ${PROGRAM.length}`
  ];
  if (lastRate) o.push(`${t.th_rate}: ${countLabel(lang, lastRate, t.units.syllables)}`);
  o.push(`${t.th_tried}: ${Object.keys(extra.tried || {}).length}`, t.th_method);

  const progress = GOALS.map(goal => ({ goal, ...goalProgress(goal, record) }));
  const started = progress.filter(item => item.percent > 0 || item.done > 0).sort((a, b) => b.percent - a.percent);
  const a = [
    `${t.th_overall}: ${overallPercent(record)}%`,
    `${t.th_goalsMet}: ${progress.filter(item => item.status === 'achieved').length} / ${GOALS.length}`
  ];
  if (started.length) a.push(`${t.th_best}: ${started[0].goal[lang]} (${started[0].percent}%)`);
  if (started.length > 1) a.push(`${t.th_least}: ${started[started.length - 1].goal[lang]} (${started[started.length - 1].percent}%)`);
  const easy = easyShare(entries);
  if (easy !== null) a.push(`${t.th_easyShare}: ${easy}%`);
  a.push(t.th_caution);

  const current = workingOn(record, now);
  const next = nextGoal(record, now);
  const p = [
    current.length ? `${t.th_workingOn}: ${joined(current.slice(0, 3).map(goal => goal[lang]), lang)}` : t.th_nothing,
    next ? `${t.th_next}: ${next[lang]}` : t.th_allMet,
    isProgramDone(done) ? t.programDoneShort : `${t.dailyTraining}: ${t.day} ${currentDay(done, unlocked) + 1}`,
    `${t.th_nextSituation}: ${suggestedSituation(extra.situations, extra.tried)[lang]}`
  ];
  return { s, o, a, p };
}

export function TherapistWindow({ t, lang, snapshot, store, onClose }) {
  const person = snapshot.people.find(item => item.id === snapshot.active);
  const entries = snapshot.entries[snapshot.active] || [];
  const extra = snapshot.extra?.[snapshot.active] || {};
  const done = extra.program;
  const now = Date.now();
  const record = buildRecord(entries, extra, PROGRAM.map((_, day) => dayFinishedAt(done, day)).filter(Boolean));
  const [selected, setSelected] = Y.useState(null);
  const [shareState, setShareState] = Y.useState('');
  const shareTimer = Y.useRef(null);
  Y.useEffect(() => () => clearTimeout(shareTimer.current), []);
  const soap = soapLines({ t, lang, entries, extra, record, done, unlocked: extra.unlockedDays, now });
  const sections = [['s', t.th_s], ['o', t.th_o], ['a', t.th_a], ['p', t.th_p]];
  const selectedGoal = GOALS.find(goal => goal.id === selected);
  const timeline = achievementOverTime(selected, record, now);
  const overall = overallPercent(record);
  const met = GOALS.filter(goal => goalProgress(goal, record).status === 'achieved').length;

  async function share() {
    const note = extra.therapistNote?.trim();
    const goalsText = GOALS.map(goal => { const progress = goalProgress(goal, record); return `- ${goal[lang]}: ${progress.percent}%${progress.manual ? ` (${t.th_byTherapist})` : ''}`; });
    const text = [
      `${t.title}${person ? ` — ${person.name}` : ''} · ${longDate(now, lang)}`, '',
      `${t.th_longTerm}: ${LONG_TERM_GOAL[lang]}`, '',
      `${t.th_shortTerm}:`, ...goalsText, '',
      ...sections.flatMap(([key, label]) => [`${label}:`, ...soap[key].map(line => `- ${line}`), '']),
      ...(note ? [`${t.th_notes}:`, note] : [])
    ].join('\n').trim();
    setShareState('');
    try {
      if (await shareOrCopy(t.title, text) !== 'copied') return;
      setShareState('done');
      clearTimeout(shareTimer.current);
      shareTimer.current = setTimeout(() => setShareState(''), 2000);
    } catch { setShareState('failed'); }
  }

  return h(Dialog, { onClose, label: t.th_title },
    h('div', { className: 'ff-dialog-card ff-therapist' },
      h('div', { className: 'ff-dialog-head' },
        h('h2', null, person ? `${t.th_title}: ${person.name}` : t.th_title),
        h('div', { className: 'ff-therapist-actions' },
          h('button', { type: 'button', className: 'ff-icon-button', 'aria-label': t.shareSummary, title: t.shareSummary, onClick: share }, shareState === 'done' ? h(TickIcon) : h(ShareIcon)),
          h(CloseButton, { t, onClose }))),
      h('div', { className: 'ff-dialog-body' },
        h('span', { className: 'ff-sr-only', role: 'status' }, shareState === 'done' ? t.shared : ''),
        shareState === 'failed' && h('p', { className: 'ff-alert', role: 'alert' }, t.shareFailed),
        snapshot.people.length > 1 && h('div', { className: 'ff-categories ff-therapist-people' }, snapshot.people.map(item => h('button', {
          key: item.id, type: 'button', 'aria-pressed': item.id === snapshot.active, onClick: () => { setSelected(null); store.activate(item.id); }
        }, item.name))),

        h('div', { className: 'ff-overall' },
          h('strong', null, `${overall}%`),
          h('span', null, h('b', null, t.th_overall), h('small', null, `${t.th_goalsMet}: ${met} / ${GOALS.length}`))),
        h('p', { className: 'ff-note' }, t.th_caution),

        timeline.hasData
          ? h(AchievementChart, { t, lang, title: selectedGoal ? selectedGoal[lang] : t.th_allGoals, timeline })
          : h('p', { className: 'ff-note ff-chart-empty' }, t.th_noData),

        h('section', null,
          h('h3', null, t.th_longTerm),
          h('p', null, LONG_TERM_GOAL[lang])),
        h('section', null,
          h('h3', null, t.th_shortTerm),
          h('p', { className: 'ff-note' }, t.th_tapGoal),
          h('button', { type: 'button', className: 'ff-text-button ff-all-goals', 'aria-pressed': selected === null, onClick: () => setSelected(null) }, t.th_allGoals),
          GOAL_GROUPS.map(group => h('div', { key: group.id, className: 'ff-goal-group' },
            h('h4', null, group[lang]),
            GOALS.filter(goal => goal.group === group.id).map(goal => h(GoalRow, {
              key: goal.id, t, lang, goal, record, personId: snapshot.active, selected: selected === goal.id, onSelect: () => setSelected(selected === goal.id ? null : goal.id),
              onScore: (id, value) => store.updateExtra(data => ({ ...data, goalScores: withScore(data.goalScores, id, value, Date.now()) }), t.me)
            }))))),

        h('section', { className: 'ff-soap' }, sections.map(([key, label]) => h('div', { key, className: `ff-soap-card is-${key}` },
          h('h3', null, label),
          h('ul', null, soap[key].map((line, index) => h('li', { key: index }, line)))))),

        h('section', null,
          h('label', { className: 'ff-therapist-note' },
            h('span', null, t.th_notes),
            h('textarea', {
              rows: 3, maxLength: 1000, value: extra.therapistNote || '',
              onChange: event => store.updateExtra(data => ({ ...data, therapistNote: event.target.value }), t.me)
            }))))));
}
