// Daily training, situation board, feared words, affirmations, self-rating and celebrations.
import { Y, Gn, Xo, Ps, sT, cf } from './vendor.js';
import { Dialog } from './dialog.js';
import { AFFIRMATIONS, LESSONS, PROGRAM, SITUATIONS, currentDay, dayMinutes, isDayDone, isDayOpen, isProgramDone, isStepDone, isWaitingForTomorrow, lockReason, nextStep, suggestedSituation } from './program.js';
import { lettersForScreen } from './practice.js';
import { afterPress } from './press.js';

const h = Y.createElement;
const Icon = ({ d, children, ...props }) => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...props }, d && h('path', { d }), children);
export const SunIcon = props => h(Icon, props, h('circle', { cx: 12, cy: 12, r: 4 }), h('path', { d: 'M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4' }));
export const FlagIcon = props => h(Icon, { ...props, d: 'M5 21V4m0 1c5-3 8 2 14 0v9c-6 2-9-3-14 0' });
export const ToolsIcon = props => h(Icon, props, h('rect', { x: 3, y: 3, width: 7, height: 7, rx: 2 }), h('rect', { x: 14, y: 3, width: 7, height: 7, rx: 2 }), h('rect', { x: 3, y: 14, width: 7, height: 7, rx: 2 }), h('rect', { x: 14, y: 14, width: 7, height: 7, rx: 2 }));
const BoardIcon = props => h(Icon, { ...props, d: 'M4 20V10M10 20V4M16 20v-7M22 20H2' });
const SoundIcon = props => h(Icon, { ...props, d: 'M4 10v4M8 6v12M12 3v18M16 7v10M20 10v4' });
const QuoteIcon = props => h(Icon, { ...props, d: 'M21 12a8 8 0 0 1-12 7l-5 2 2-5a8 8 0 1 1 15-4ZM9 12h.01M13 12h.01' });
const FaceIcon = props => h(Icon, props, h('circle', { cx: 12, cy: 12, r: 9 }), h('path', { d: 'M9 10h.01M15 10h.01M8 14.5c2 2.5 6 2.5 8 0' }));
const BookIcon = props => h(Icon, { ...props, d: 'M12 6c-2-2-5-2-8-1v14c3-1 6-1 8 1 2-2 5-2 8-1V5c-3-1-6-1-8 1Zm0 0v14' });
const LockIcon = props => h(Icon, props, h('rect', { x: 5, y: 11, width: 14, height: 10, rx: 3 }), h('path', { d: 'M8 11V8a4 4 0 0 1 8 0v3' }));
const TickIcon = props => h(Icon, { ...props, d: 'm5 13 4 4L19 7' });
const TalkIcon = props => h(Icon, { ...props, d: 'M21 12a8 8 0 0 1-12 7l-5 2 2-5a8 8 0 1 1 15-4Z' });
const STEP_ICON = { lesson: BookIcon, breath: Gn, exercise: TalkIcon, affirmation: QuoteIcon, selfRating: FaceIcon, board: BoardIcon, feared: SoundIcon, tryOne: FlagIcon };
const say = (item, lang) => item[lang];

export function stepTitle(t, lang, step, names) {
  if (step.type === 'lesson') { const [en, , ar] = LESSONS[step.topic][0]; return lang === 'ar' ? ar : en; }
  if (step.type === 'breath') return t.breathingTech;
  if (step.type === 'exercise') return `${names[step.screen]} · ${t[step.category] || t.myWords}`;
  return t[`program_${step.type}`];
}

export function Mascot({ message }) {
  return h('div', { className: 'ff-mascot' },
    h('img', { src: './assets/icons/logo.webp', width: 112, height: 112, alt: '' }),
    message && h('p', { className: 'ff-bubble-text', key: message }, message));
}

// Celebration only: never conveys information that is not also in text.
export function Confetti() {
  const pieces = Y.useMemo(() => Array.from({ length: 28 }, (_, index) => ({
    left: `${(index * 37) % 100}%`, delay: `${(index % 7) * 70}ms`, turn: `${(index % 5) * 80 + 120}deg`, drift: `${(index % 5) * 14 - 28}px`
  })), []);
  return h('div', { className: 'ff-confetti', 'aria-hidden': true }, pieces.map((piece, index) => h('i', {
    key: index,
    style: { left: piece.left, animationDelay: piece.delay, '--turn': piece.turn, '--drift': piece.drift }
  })));
}

export function DayDoneDialog({ t, lang, day, onClose }) {
  const last = day === PROGRAM.length - 1;
  return h(Dialog, { onClose, label: t.dayDoneTitle },
    h('div', { className: 'ff-dialog-card ff-gate ff-day-done' },
      h(Confetti),
      h('div', { className: 'ff-dialog-body' },
        h('div', { className: 'ff-cheer', 'aria-hidden': true }, [0, 1, 2].map(index => h(Xo, { key: index, style: { animationDelay: `${index * 140}ms` } }))),
        h('h2', null, t.dayDoneTitle),
        h('p', null, last ? t.programDone : t.dayDoneText.replace('{n}', day + 1)),
        h('button', { type: 'button', className: 'ff-tap', onClick: onClose }, t.keepGoing))));
}

export function TodayCard({ t, done, unlocked, onOpen }) {
  const day = currentDay(done, unlocked);
  const allDone = isProgramDone(done);
  const waiting = isWaitingForTomorrow(done, unlocked);
  const steps = PROGRAM[day];
  const finished = steps.filter((_, index) => isStepDone(done, day, index)).length;
  return h('button', { type: 'button', className: `ff-action is-mauve ff-today${waiting ? ' is-waiting' : ''}`, onClick: afterPress(onOpen), 'aria-label': t.continueDay },
    h('span', { className: 'ff-today-day' }, allDone ? h(Xo, { 'aria-hidden': true }) : waiting ? h(LockIcon) : day + 1),
    h('span', null, allDone ? t.programDoneShort : `${t.day} ${day + 1}`),
    h('small', null, allDone ? t.programAgain : waiting ? t.opensTomorrow : `${finished} / ${steps.length} · ${dayMinutes(day)} ${t.minutesShort}`),
    !waiting && h('span', { className: 'ff-meter' }, h('i', { style: { width: `${finished / steps.length * 100}%` } })));
}

export function PlanScreen({ t, lang, done, unlocked, names, onStep, onRestart, onUnlock, onRelock }) {
  const [day, setDay] = Y.useState(() => currentDay(done, unlocked));
  const [hint, setHint] = Y.useState('');
  const [nudge, setNudge] = Y.useState(0);
  const now = Date.now();
  const reason = lockReason(done, day, { unlocked, now });
  const open = reason === null;
  const next = open ? nextStep(done, day) : -1;
  const started = PROGRAM[day].some((_, index) => isStepDone(done, day, index));
  // Only a day that an adult opened, and that has not been started, can be locked again.
  const openedByAdult = open && !started && !isDayOpen(done, day, { now });
  const strip = Y.useRef(null);
  Y.useEffect(() => { strip.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' }); }, [day]);
  // The button that opened or locked this day has gone, so keep the keyboard's place on its replacement.
  const shown = Y.useRef({ day, open });
  Y.useEffect(() => {
    const before = shown.current;
    shown.current = { day, open };
    if (before.day === day && before.open !== open) strip.current?.parentElement.querySelector(open ? '.ff-plan-go' : '.ff-unlock')?.focus();
  }, [day, open]);
  return h('section', { className: 'ff-plan' },
    h('div', { className: 'ff-days', ref: strip, role: 'group', 'aria-label': t.dailyTraining }, PROGRAM.map((_, index) => {
      const finished = isDayDone(done, index), available = isDayOpen(done, index, { unlocked, now });
      return h('button', {
        key: index, type: 'button', 'aria-current': day === index, 'aria-label': `${t.day} ${index + 1}${available ? '' : ` (${t.locked})`}`,
        className: `ff-day-pill${finished ? ' is-done' : ''}${available ? '' : ' is-locked'}`,
        onClick: () => { setDay(index); setHint(''); }
      }, finished ? h(TickIcon) : available ? index + 1 : h(LockIcon));
    })),
    h('p', { className: 'ff-plan-time' }, `${t.day} ${day + 1} · ${dayMinutes(day)} ${t.minutesShort}`),
    !open && h('p', { className: 'ff-locked-note', role: 'status', key: nudge }, reason === 'tomorrow' ? t.lockedTomorrow : t.lockedDay),
    h('ol', { className: 'ff-step-list' }, PROGRAM[day].map((step, index) => {
      const finished = isStepDone(done, day, index);
      const isNext = index === next;
      const Glyph = STEP_ICON[step.type];
      return h('li', { key: `${day}-${index}`, style: { '--order': index } },
        h('button', {
          type: 'button', className: `ff-step-row${finished ? ' is-done' : ''}${isNext ? ' is-next' : ''}`, 'data-step-index': index,
          'aria-disabled': !open || (!finished && !isNext) || undefined,
          onClick: () => {
            if (!open) { setNudge(value => value + 1); return; }
            if (!finished && !isNext) { setHint(t.lockedStep); return; }
            onStep(day, index);
          }
        },
          h('span', { className: 'ff-step-glyph' }, h(Glyph)),
          h('span', { className: 'ff-step-copy' }, h('strong', null, stepTitle(t, lang, step, names)), h('small', null, `${step.mins} ${t.minutesShort}`)),
          h('span', { className: 'ff-step-state' }, finished ? h(TickIcon) : isNext ? h(Xo) : null)));
    })),
    h('p', { className: 'ff-touch-hint', role: 'status' }, hint),
    open && next >= 0 && h('button', { type: 'button', className: 'ff-tap ff-plan-go', onClick: () => onStep(day, next) }, t.startDay),
    !open && h('button', { type: 'button', className: 'ff-text-button ff-unlock', onClick: event => { event.currentTarget.focus(); onUnlock(day); } }, h(LockIcon), h('span', null, t.unlockDay)),
    openedByAdult && h('button', { type: 'button', className: 'ff-text-button ff-unlock', onClick: event => { event.currentTarget.focus(); onRelock(day); } }, h(LockIcon), h('span', null, t.relockDay)),
    isProgramDone(done) && h('button', { type: 'button', className: 'ff-text-button', onClick: () => { onRestart(); setDay(0); } }, t.programAgain));
}

export function ToolsScreen({ t, onOpen }) {
  const tools = [['situations', BoardIcon, t.program_board, t.hint_board, 'icy'], ['feared', SoundIcon, t.program_feared, t.hint_feared, 'pink'], ['affirmation', QuoteIcon, t.program_affirmation, t.hint_affirmation, 'vanilla'], ['self-rating', FaceIcon, t.program_selfRating, t.hint_selfRating, 'mauve']];
  return h('section', { className: 'ff-tools' }, h('div', { className: 'ff-actions' }, tools.map(([screen, Glyph, title, hint, tone]) => h('button', {
    key: screen, type: 'button', className: `ff-action is-${tone}`, 'aria-label': title, onClick: afterPress(() => onOpen(screen))
  }, h(Glyph), h('span', null, title), h('small', null, hint)))));
}

export function LessonScreen({ t, lang, topic, onDone }) {
  const slides = LESSONS[topic];
  const [index, setIndex] = Y.useState(0);
  const [en, enText, ar, arText] = slides[index];
  const last = index === slides.length - 1;
  return h('section', { className: 'ff-lesson' },
    h('div', { className: 'ff-meter ff-meter-big' }, h('i', { style: { width: `${(index + 1) / slides.length * 100}%` } })),
    h('div', { className: 'ff-lesson-card', key: index },
      h(Mascot),
      h('h2', null, lang === 'ar' ? ar : en),
      h('p', null, lang === 'ar' ? arText : enText)),
    h('button', { type: 'button', className: 'ff-tap', onClick: () => last ? onDone() : setIndex(index + 1) }, last ? t.gotIt : t.next));
}

const READS = 3;
export function AffirmationScreen({ t, lang, saved, onSave, onDone }) {
  const pick = Y.useMemo(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)], []);
  const [read, setRead] = Y.useState(0);
  const [own, setOwn] = Y.useState(saved || '');
  const text = saved || say(pick, lang);
  const writing = read >= READS;
  return h('section', { className: 'ff-affirm' },
    h('div', { className: 'ff-meter ff-meter-big' }, h('i', { style: { width: `${(read + 1) / (READS + 1) * 100}%` } })),
    h('h2', { key: read }, writing ? t.affirmWrite : t[`affirmRead${read + 1}`]),
    h('div', { className: 'ff-quote', key: `q${read}` }, h('span', { className: 'ff-quote-mark' }, h(QuoteIcon)), h('p', null, text)),
    writing && h('label', { className: 'ff-affirm-own' }, h('span', { className: 'ff-sr-only' }, t.affirmWrite),
      h('textarea', { rows: 3, maxLength: 160, value: own, placeholder: t.affirmPlaceholder, onChange: event => setOwn(event.target.value) })),
    h('button', { type: 'button', className: 'ff-tap', onClick: () => {
      if (!writing) { setRead(read + 1); return; }
      onSave(own.trim());
      onDone();
    } }, writing ? t.done : t.next));
}

const LEVELS = [1, 2, 3, 4, 5];
export function SituationBoard({ t, lang, levels, tried, tryMode, onLevel, onTried, onDone }) {
  const [open, setOpen] = Y.useState(null);
  const placed = SITUATIONS.filter(item => levels?.[item.id]).length;
  const sorted = [...SITUATIONS].sort((a, b) => (levels?.[a.id] || 9) - (levels?.[b.id] || 9));
  const suggestion = suggestedSituation(levels, tried);
  return h('section', { className: 'ff-board' },
    tryMode && h('div', { className: 'ff-suggest' },
      h('small', null, t.tryThis), h('strong', null, say(suggestion, lang)),
      h('button', { type: 'button', className: 'ff-tap', onClick: () => { onTried(suggestion.id); onDone(); } }, t.triedIt)),
    !tryMode && h('p', { className: 'ff-intro' }, t.boardIntro),
    h('ul', { className: 'ff-situations' }, sorted.map(item => {
      const level = levels?.[item.id];
      const isOpen = open === item.id;
      return h('li', { key: item.id },
        h('button', { type: 'button', className: 'ff-situation', 'aria-expanded': isOpen, onClick: () => setOpen(isOpen ? null : item.id) },
          h('span', null, say(item, lang)),
          tried?.[item.id] ? h('span', { className: 'ff-tried' }, h(TickIcon)) : null,
          h('span', { className: `ff-level-tag${level ? ` is-${level}` : ''}` }, level ? t[`level_${level}`] : t.level_none)),
        isOpen && h('div', { className: 'ff-levels' }, LEVELS.map(value => h('button', {
          key: value, type: 'button', className: `is-${value}`, 'aria-pressed': level === value,
          onClick: () => { onLevel(item.id, value); setOpen(null); }
        }, t[`level_${value}`]))));
    })),
    !tryMode && onDone && h('button', { type: 'button', className: 'ff-tap', disabled: placed === 0, onClick: onDone }, t.done));
}

export function FearedScreen({ t, lang, feared, letterWords, onChange, onPractice, onDone }) {
  const [tab, setTab] = Y.useState('sounds');
  const [word, setWord] = Y.useState('');
  const letters = feared?.letters || [];
  const words = feared?.words || [];
  const allLetters = Object.keys(letterWords);
  function addWord(event) {
    event.preventDefault();
    const clean = word.normalize('NFKC').trim().slice(0, 40);
    if (clean && !words.includes(clean)) onChange({ letters, words: [...words, clean] });
    setWord('');
  }
  return h('section', { className: 'ff-feared' },
    h('p', { className: 'ff-intro' }, t.fearedIntro),
    h('div', { className: 'ff-categories' }, [['sounds', t.fearedSounds], ['words', t.fearedWords]].map(([key, label]) => h('button', { key, type: 'button', 'aria-pressed': tab === key, onClick: () => setTab(key) }, label))),
    tab === 'sounds' && h('div', { className: 'ff-letters ff-feared-letters' }, allLetters.map(letter => h('button', {
      key: letter, type: 'button', 'aria-pressed': letters.includes(letter),
      onClick: () => onChange({ words, letters: letters.includes(letter) ? letters.filter(item => item !== letter) : [...letters, letter] })
    }, letter))),
    tab === 'sounds' && letters.length > 0 && h('div', { className: 'ff-feared-go' }, letters.map(letter => {
      const screen = lettersForScreen('light-contact-practice', letterWords).includes(letter) ? 'light-contact-practice' : 'easy-onset-practice';
      return h('button', { key: letter, type: 'button', className: 'ff-text-button', onClick: () => onPractice(screen, letter) }, `${t.practiceLetter} ${letter}`);
    })),
    tab === 'words' && h('form', { className: 'ff-add-person', onSubmit: addWord },
      h('label', { htmlFor: 'ff-feared-word' }, t.fearedAdd),
      h('div', null,
        h('input', { id: 'ff-feared-word', value: word, maxLength: 40, autoComplete: 'off', onChange: event => setWord(event.target.value) }),
        h('button', { type: 'submit', className: 'ff-icon-button ff-add', 'aria-label': t.add, title: t.add, disabled: !word.trim() }, h(Ps, { 'aria-hidden': true })))),
    tab === 'words' && h('ul', { className: 'ff-word-chips' }, words.map(item => h('li', { key: item },
      h('span', null, item),
      h('button', { type: 'button', className: 'ff-icon-button', 'aria-label': `${t.deletePerson}: ${item}`, onClick: () => onChange({ letters, words: words.filter(other => other !== item) }) }, h(sT, { 'aria-hidden': true }))))),
    tab === 'words' && words.length > 0 && h('p', { className: 'ff-note' }, t.fearedWhere),
    onDone && h('button', { type: 'button', className: 'ff-tap', onClick: onDone }, t.done));
}

const FACES = { 1: 'M8 14c2 3 6 3 8 0', 2: 'M8.5 14.5c2 1.5 5 1.5 7 0', 3: 'M8.5 15h7', 4: 'M8.5 16c2-1.5 5-1.5 7 0', 5: 'M8 17c2-3 6-3 8 0' };
export function SelfRatingScreen({ t, lang, history, onRate, onDone }) {
  const [chosen, setChosen] = Y.useState(null);
  const recent = (history || []).slice(-7);
  return h('section', { className: 'ff-self' },
    h('h2', null, t.selfQuestion),
    h('div', { className: 'ff-self-faces' }, [1, 2, 3, 4, 5].map(value => h('button', {
      key: value, type: 'button', className: `is-${value}`, 'aria-pressed': chosen === value, 'aria-label': t[`self_${value}`],
      onClick: () => setChosen(value)
    }, h(Icon, null, h('circle', { cx: 12, cy: 12, r: 9 }), h('path', { d: 'M9 10h.01M15 10h.01' }), h('path', { d: FACES[value] })), h('span', null, t[`self_${value}`])))),
    h('p', { className: 'ff-note' }, t.selfNote),
    recent.length > 0 && h('div', { className: 'ff-self-history' }, h('h3', null, t.selfRecent), h('ul', null, recent.map(item => h('li', { key: item.at },
      h('span', null, new Date(item.at).toLocaleDateString(lang === 'ar' ? 'ar-SY-u-nu-latn' : 'en', { day: 'numeric', month: 'short' })),
      h('strong', null, t[`self_${item.value}`]))))),
    h('button', { type: 'button', className: 'ff-tap', disabled: !chosen, onClick: () => { onRate(chosen); onDone(); } }, t.done));
}

export function RunBanner({ t, run, step, onContinue }) {
  const total = step.times || 1;
  const finished = total - run.left;
  return h('div', { className: `ff-run${run.left === 0 ? ' is-done' : ''}` },
    h('div', { className: 'ff-run-dots', 'aria-hidden': true }, Array.from({ length: total }, (_, index) => h('i', { key: index, className: index < finished ? 'is-on' : '' }))),
    h('span', { role: 'status' }, run.left === 0 ? t.stepDone : `${t.day} ${run.day + 1} · ${finished} / ${total}`),
    run.left === 0 && h('button', { type: 'button', className: 'ff-text-button ff-primary', onClick: onContinue }, t.nextStep));
}
