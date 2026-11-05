// Practice history, the speaking path, self-rating and the people dialog.
import { Y, pd, sT } from './vendor.js';
import { Dialog } from './dialog.js';
import { pathSteps, categoriesByScreen, stepOf } from './practice.js';
import { PROGRAM, daysDone } from './program.js';
import { countLabel, historyByDay, latestScreen, stepStats, weekSummary } from './progress.js';

const h = Y.createElement;
const SPEECH_SCREENS = Object.keys(categoriesByScreen);
// Levantine month names for Arabic, with the same digits as the rest of the app.
const formatDay = (time, lang) => new Date(time).toLocaleDateString(lang === 'ar' ? 'ar-SY-u-nu-latn' : 'en', { weekday: 'long', day: 'numeric', month: 'long' });

function Outline({ children, ...props }) {
  return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...props }, children);
}
export const PersonIcon = props => h(Outline, props, h('circle', { cx: 12, cy: 8, r: 4 }), h('path', { d: 'M4 21c0-5 4-7 8-7s8 2 8 7' }));
export const PathIcon = props => h(Outline, props, h('path', { d: 'M4 20h4v-4h4v-4h4V8h4' }), h('path', { d: 'M16 4h4v4' }));
export const ShareIcon = props => h(Outline, props, h('circle', { cx: 18, cy: 5, r: 3 }), h('circle', { cx: 6, cy: 12, r: 3 }), h('circle', { cx: 18, cy: 19, r: 3 }), h('path', { d: 'm8.6 10.5 6.8-4M8.6 13.5l6.8 4' }));
export const TickIcon = props => h(Outline, props, h('path', { d: 'm5 13 4 4L19 7' }));
const Face = ({ mouth }) => h(Outline, null, h('circle', { cx: 12, cy: 12, r: 9 }), h('path', { d: 'M9 10h.01M15 10h.01' }), h('path', { d: mouth }));
const FACES = { 1: 'M8 14.5c2 2.5 6 2.5 8 0', 2: 'M8.5 15.5h7', 3: 'M8 16.5c2-2.5 6-2.5 8 0' };

export function RatingPrompt({ t, onRate }) {
  return h('div', { className: 'ff-rating', role: 'group', 'aria-label': t.ratingQuestion },
    h('span', null, t.ratingQuestion),
    h('div', null, [[1, t.ratingEasy], [2, t.ratingSome], [3, t.ratingHard]].map(([value, label]) => h('button', {
      key: value, type: 'button', 'data-rating': value, onClick: () => onRate(value)
    }, h(Face, { mouth: FACES[value] }), h('span', null, label)))));
}

function newSum() {
  let left = 1 + Math.floor(Math.random() * 9), right = 1 + Math.floor(Math.random() * 9);
  const subtract = Math.random() < .5;
  if (subtract && left < right) [left, right] = [right, left];
  const answer = subtract ? left - right : left + right;
  const choices = new Set([answer]);
  while (choices.size < 3) {
    const value = answer + Math.floor(Math.random() * 9) - 4;
    if (value >= 0) choices.add(value);
  }
  return { text: `${left} ${subtract ? '−' : '+'} ${right}`, answer, choices: [...choices].sort(() => Math.random() - .5) };
}
// A fresh sum each time, like the other apps' parent gate: it keeps young children out of names and history.
export function AdultGate({ t, help, onPass, onClose }) {
  const [sum] = Y.useState(newSum);
  const [wrong, setWrong] = Y.useState([]);
  return h(Dialog, { onClose, label: t.gateTitle },
    h('div', { className: 'ff-dialog-card ff-gate' },
      h('div', { className: 'ff-dialog-head' },
        h('h2', null, t.gateTitle),
        h('button', { type: 'button', className: 'ff-icon-button', 'aria-label': t.close, title: t.close, onClick: onClose }, h(pd, { 'aria-hidden': true }))),
      h('div', { className: 'ff-dialog-body' },
        h('p', null, help || t.gateHelp),
        h('p', { className: 'ff-gate-sum', dir: 'ltr' }, `${sum.text} = ?`),
        h('div', { className: 'ff-gate-choices', dir: 'ltr' }, sum.choices.map(choice => h('button', {
          key: choice, type: 'button', 'data-answer': choice, 'aria-invalid': wrong.includes(choice) || undefined,
          onClick: () => choice === sum.answer ? onPass() : setWrong(list => [...list, choice])
        }, choice))),
        h('p', { className: 'ff-alert', role: 'status' }, wrong.length ? t.gateRetry : ''))));
}

export function PeopleDialog({ t, snapshot, store, onClose }) {
  const [name, setName] = Y.useState('');
  const [confirming, setConfirming] = Y.useState(null);
  function add(event) {
    event.preventDefault();
    if (store.addPerson(name)) setName('');
  }
  return h(Dialog, { onClose, label: t.people },
    h('div', { className: 'ff-dialog-card' },
      h('div', { className: 'ff-dialog-head' },
        h('h2', null, t.people),
        h('button', { type: 'button', className: 'ff-icon-button', 'aria-label': t.close, title: t.close, onClick: onClose }, h(pd, { 'aria-hidden': true }))),
      h('div', { className: 'ff-dialog-body' },
        snapshot.people.length > 0 && h('ul', { className: 'ff-people' }, snapshot.people.map(person => h('li', { key: person.id },
          confirming === person.id
            ? h('div', { className: 'ff-confirm', role: 'alert' },
              h('p', null, t.deletePersonConfirm.replace('{name}', person.name)),
              h('div', null,
                h('button', { type: 'button', className: 'ff-text-button', onClick: () => setConfirming(null) }, t.cancel),
                h('button', { type: 'button', className: 'ff-text-button ff-danger', onClick: () => { store.removePerson(person.id); setConfirming(null); } }, t.deletePerson)))
            : h(Y.Fragment, null,
              h('button', { type: 'button', className: 'ff-person', 'aria-pressed': snapshot.active === person.id, onClick: () => store.activate(person.id) },
                h('span', { className: 'ff-avatar', 'aria-hidden': true }, Array.from(person.name)[0]), h('span', null, person.name)),
              h('button', {
                type: 'button', className: 'ff-icon-button', 'aria-label': `${t.deletePerson}: ${person.name}`, title: t.deletePerson,
                onClick: () => setConfirming(person.id)
              }, h(sT, { 'aria-hidden': true })))))),
        h('form', { className: 'ff-add-person', onSubmit: add },
          h('label', { htmlFor: 'ff-person-name' }, t.addPersonLabel),
          h('div', null,
            h('input', { id: 'ff-person-name', value: name, maxLength: 80, autoComplete: 'off', onChange: event => setName(event.target.value) }),
            h('button', { type: 'submit', className: 'ff-text-button ff-primary', disabled: !name.trim() }, t.add))),
        h('p', { className: 'ff-note' }, t.deviceOnly),
        snapshot.saveFailed && h('p', { className: 'ff-alert', role: 'alert' }, t.saveFailed))));
}

function ratingText(t, ratings) {
  const parts = [[1, t.ratingEasy], [2, t.ratingSome], [3, t.ratingHard]].filter(([key]) => ratings[key]).map(([key, label]) => `${label} ${ratings[key]}`);
  return parts.join(' · ');
}
function historyLine(t, lang, group, names) {
  const title = group.screen === 'breathing-practice'
    ? t.breathingInfo.techniques[group.preset]?.name || t.breathingTech
    : `${names[group.screen]} · ${t[`step_${group.step}`]}`;
  const detail = group.screen === 'breathing-practice'
    ? countLabel(lang, group.breaths, t.units.breaths)
    : `${countLabel(lang, group.count, t.units.times)}${group.spm ? ` · ${countLabel(lang, group.spm, t.units.syllables)}` : ''}`;
  return { title, detail, rated: ratingText(t, group.ratings) };
}
function weekLine(t, lang, week) {
  return `${t.thisWeek}: ${countLabel(lang, week.days, t.units.days)} · ${countLabel(lang, week.practices, t.units.practices)}`;
}
function summaryText(t, lang, person, entries, names, now, extra = {}) {
  const week = weekSummary(entries, now);
  const lines = [`${t.title} — ${person?.name || ''}`, weekLine(t, lang, week), `${t.dailyTraining}: ${daysDone(extra.program)} / ${PROGRAM.length}`, ''];
  const recentRatings = (extra.selfRatings || []).slice(-7).map(item => `${formatDay(item.at, lang)}: ${t[`self_${item.value}`]}`);
  if (recentRatings.length) lines.push(`${t.selfRecent}:`, ...recentRatings, '');
  const hardest = Object.entries(extra.situations || {}).sort((a, b) => a[1] - b[1]);
  if (hardest.length) lines.push(`${t.program_board}: ${hardest.length}`, '');
  for (const day of historyByDay(entries, stepOf).slice(0, 14)) {
    lines.push(formatDay(day.at, lang));
    for (const group of day.groups) {
      const line = historyLine(t, lang, group, names);
      lines.push(`- ${line.title}: ${line.detail}${line.rated ? ` (${line.rated})` : ''}`);
    }
    lines.push('');
  }
  lines.push(t.summaryNote);
  return lines.join('\n').trim();
}

// The device's share sheet where it exists, otherwise the clipboard. Nothing is sent without the person choosing to.
export async function shareOrCopy(title, text) {
  if (navigator.share) {
    try { await navigator.share({ title, text }); return 'shared'; }
    catch (error) { if (error.name === 'AbortError') return 'cancelled'; }
  }
  await navigator.clipboard.writeText(text);
  return 'copied';
}

export function ProgressScreen({ t, lang, snapshot, names, onOpenStep, onOpenPeople }) {
  const person = snapshot.people.find(p => p.id === snapshot.active);
  const entries = snapshot.entries[snapshot.active] || [];
  const now = Date.now();
  const [technique, setTechnique] = Y.useState(() => latestScreen(entries, SPEECH_SCREENS, SPEECH_SCREENS[0]));
  const [shareState, setShareState] = Y.useState('');
  const shareTimer = Y.useRef(null);
  Y.useEffect(() => () => clearTimeout(shareTimer.current), []);
  const week = weekSummary(entries, now);
  const steps = pathSteps(technique).map(step => ({ ...step, stats: stepStats(entries, technique, step.categories) }));
  const nextIndex = steps.findIndex(step => !step.stats.ready);
  const days = historyByDay(entries, stepOf).slice(0, 30);
  async function share() {
    const text = summaryText(t, lang, person, entries, names, now, snapshot.extra?.[snapshot.active]);
    setShareState('');
    try {
      if (await shareOrCopy(t.title, text) !== 'copied') return;
      setShareState('done');
      clearTimeout(shareTimer.current);
      shareTimer.current = setTimeout(() => setShareState(''), 2000);
    } catch { setShareState('failed'); }
  }
  return h('section', { className: 'ff-progress' },
    h('div', { className: 'ff-panel ff-person-row' },
      h('div', null, h('strong', null, person?.name || t.noPersonYet),
        h('p', null, week.practices ? weekLine(t, lang, week) : t.noPracticeThisWeek)),
      h('button', { type: 'button', className: 'ff-text-button', onClick: event => { event.currentTarget.focus(); onOpenPeople(); } }, t.changePerson)),
    snapshot.saveFailed && h('p', { className: 'ff-alert', role: 'alert' }, t.saveFailed),
    h('div', { className: 'ff-panel' },
      h('h2', null, t.pathTitle),
      h('p', { className: 'ff-note' }, t.pathIntro),
      h('div', { className: 'ff-categories' }, SPEECH_SCREENS.map(screen => h('button', {
        key: screen, type: 'button', 'aria-pressed': technique === screen, onClick: () => setTechnique(screen)
      }, names[screen]))),
      h('ol', { className: 'ff-path' }, steps.map((step, index) => h('li', { key: step.key },
        h('button', {
          type: 'button', className: `ff-path-step${index === nextIndex ? ' is-next' : ''}${step.stats.ready ? ' is-ready' : ''}`,
          'data-step': step.key, onClick: () => onOpenStep(technique, step)
        },
          h('span', { className: 'ff-path-number', 'aria-hidden': true }, index + 1),
          h('span', { className: 'ff-path-text' },
            h('strong', null, t[`step_${step.key}`]),
            h('span', null, step.stats.count ? `${countLabel(lang, step.stats.count, t.units.times)}${ratingText(t, step.stats.ratings) ? ` · ${ratingText(t, step.stats.ratings)}` : ''}` : t.notStarted)),
          index === nextIndex && h('span', { className: 'ff-path-badge' }, t.suggestedNext),
          step.stats.ready && h('span', { className: 'ff-path-badge is-ready' }, t.mostlyEasy))))),
      h('p', { className: 'ff-note' }, t.pathNote)),
    h('div', { className: 'ff-panel' },
      h('div', { className: 'ff-panel-head' },
        h('h2', null, t.historyTitle),
        days.length > 0 && h('button', { type: 'button', className: 'ff-icon-button', 'aria-label': t.shareSummary, title: t.shareSummary, onClick: share },
          shareState === 'done' ? h(TickIcon, null) : h(ShareIcon, null))),
      h('span', { className: 'ff-sr-only', role: 'status' }, shareState === 'done' ? t.shared : ''),
      shareState === 'failed' && h('p', { className: 'ff-alert', role: 'alert' }, t.shareFailed),
      days.length === 0 && h('p', { className: 'ff-note' }, t.noHistory),
      days.map(day => h('div', { key: day.day, className: 'ff-day' },
        h('h3', null, formatDay(day.at, lang)),
        h('ul', null, day.groups.map((group, index) => {
          const line = historyLine(t, lang, group, names);
          return h('li', { key: index }, h('strong', null, line.title), h('span', null, line.detail), line.rated && h('span', null, line.rated));
        }))))));
}
