// The application interface. Timing rules live in practice.js and content in app.js.
import { Y, Gn, Uf, q6, xa, Fs, Ui, cf, Vo, Ps, Hi, $s, Oo, nS, pd, Of, Vf, gT, sT, af, al, va, fr, Bf, Fy, zy, Xo } from './vendor.js';
import {
  categoriesByScreen, screenDefaults, breathingPresets, breathingLimits, breathingCycles, cancellationPause,
  touchTargets, singleItemCategories, freeCategories, practiceItems, practiceTokens, buildCues, syllablesPerMinute, lettersForScreen,
  parentScreen, readLanguage
} from './practice.js';
import { useRecording } from './recording.js';
import { Dialog } from './dialog.js';
import { pictureItems } from './pictures.js';
import { PwaDownload, PwaPanel } from './pwa.js';
import { TouchPad, TurtleBar } from './touch.js';
import { afterPress, installPressAnimation } from './press.js';
import { TherapistLock, TherapistWindow } from './therapist-ui.js';
import { PROGRAM, isDayDone, isWaitingForTomorrow, markStep } from './program.js';
import { AffirmationScreen, Confetti, DayDoneDialog, FearedScreen, FlagIcon, LessonScreen, Mascot, PlanScreen, RunBanner, SelfRatingScreen, SituationBoard, SunIcon, TodayCard, ToolsIcon, ToolsScreen } from './program-ui.js';
import { countLabel, createStore } from './progress.js';
import { AdultGate, PathIcon, PeopleDialog, PersonIcon, ProgressScreen, RatingPrompt } from './progress-ui.js';

const h = Y.createElement;
const store = createStore(() => localStorage);
installPressAnimation();
const LOGO = './assets/icons/logo.webp';
const FLUENCY = ['slower-rate-practice', 'easy-onset-practice', 'light-contact-practice'];
const MOD_STEPS = {
  'cancellation-practice': [['stutter', va], ['pause', Ui], ['repeat', cf]],
  'pull-out-practice': [['stutter', va], ['transition', fr]],
  'prep-set-practice': [['prepare', al], ['smooth', Gn]]
};
const clamp = (value, [min, max]) => Math.min(max, Math.max(min, value));

function IconButton({ label, icon: Icon, className = '', flip, iconClass, ...props }) {
  return h('button', { type: 'button', 'aria-label': label, title: label, className: `ff-icon-button ${className}`, ...props },
    h(Icon, { 'aria-hidden': true, className: `${flip ? 'ff-flip ' : ''}${iconClass || ''}` }));
}
function ActionCard({ title, hint, tone = 'icy', icon: Icon, onClick }) {
  return h('button', { type: 'button', className: `ff-action is-${tone}`, onClick: afterPress(onClick), 'aria-label': title },
    h(Icon, { 'aria-hidden': true }), h('span', null, title), hint && h('small', null, hint));
}
const MenuIcon = props => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', ...props }, h('path', { d: 'M4 6h16M4 12h16M4 18h16' }));
const TherapistIcon = props => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, h('rect', { x: 5, y: 4, width: 14, height: 17, rx: 2.5 }), h('path', { d: 'M9 4V3h6v1M9 11h6M9 15h4' }));
const HillIcon = props => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, h('path', { d: 'M2 20h20L14 8c-3-3-5 2-7 5l-5 7Z' }), h('circle', { cx: 18, cy: 6, r: 2.5 }));
const BubbleIcon = props => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', ...props }, h('circle', { cx: 10, cy: 13, r: 7 }), h('circle', { cx: 19, cy: 6, r: 2.5 }), h('path', { d: 'M7 11c.5-1.5 1.5-2.2 3-2.5' }));
function Cheer({ t }) {
  return h('div', { className: 'ff-cheer', 'aria-hidden': true }, [0, 1, 2].map(index => h(Xo, { key: index, style: { animationDelay: `${index * 120}ms` } })));
}
// Reaches every part of the app. Opens from the reading side and closes on Escape or an outside tap.
function SideMenu({ t, screen, groups, onClose }) {
  return h(Dialog, { onClose, label: t.menu, className: 'ff-drawer' },
    h('nav', { className: 'ff-drawer-panel', 'aria-label': t.menu },
      h('div', { className: 'ff-drawer-head' }, h('strong', null, t.title), h(IconButton, { label: t.close, icon: pd, onClick: onClose })),
      groups.map(group => h('div', { key: group.title, className: 'ff-drawer-group' },
        h('h2', null, group.title),
        group.items.map(item => h('button', {
          key: item.label, type: 'button', className: 'ff-drawer-item', 'aria-current': item.screen === screen ? 'page' : undefined, onClick: item.go
        }, h(item.icon, { 'aria-hidden': true }), h('span', null, item.label)))))));
}
function Stepper({ value, label, moreLabel, lessLabel, onMore, onLess, atMax, atMin }) {
  return h('div', { className: 'ff-stepper', role: 'group', 'aria-label': label },
    h(IconButton, { label: lessLabel, icon: Hi, onClick: onLess, disabled: atMin }),
    h('output', { 'aria-live': 'polite' }, value),
    h(IconButton, { label: moreLabel, icon: Ps, onClick: onMore, disabled: atMax }));
}

function InfoDialog({ info, lang, note, onClose }) {
  const [sound, setSound] = Y.useState(null);
  const ar = lang === 'ar';
  const list = (title, items) => items && h('section', null, h('h3', null, title), h('ul', null, items.map((item, i) => h('li', { key: i }, item))));
  return h(Dialog, { onClose, label: info.title },
    h('div', { className: 'ff-dialog-card' },
      h('div', { className: 'ff-dialog-head' },
        h('h2', null, info.title),
        h(IconButton, { label: ar ? 'إغلاق' : 'Close', icon: pd, onClick: onClose })),
      h('div', { className: 'ff-dialog-body' },
        h('p', null, info.purpose),
        info.howItWorks && h('section', null, h('h3', null, ar ? 'كيفية العمل' : 'How it Works'), h('p', null, info.howItWorks)),
        info.targetSounds && h('section', null, h('h3', null, ar ? 'الأصوات المستهدفة' : 'Target Sounds'), h('p', null, info.targetSounds)),
        info.plosiveDetails && h('section', null,
          h('h3', null, ar ? 'اختر صوتاً للتعلم' : 'Select a sound to learn'),
          h('div', { className: 'ff-sounds' }, Object.keys(info.plosiveDetails).map(key => h('button', {
            key, type: 'button', 'aria-pressed': sound === key, onClick: () => setSound(sound === key ? null : key)
          }, `/${key}/`))),
          sound && h('p', { className: 'ff-sound-detail' }, info.plosiveDetails[sound])),
        info.techniques && info.techniques.map((technique, i) => h('section', { key: i }, h('h3', null, technique.name),
          h('ol', null, technique.steps.map((step, j) => h('li', { key: j }, step))))),
        list(ar ? 'نصائح التدريب' : 'Practice Tips', info.practiceTips),
        list(ar ? 'نصائح للنجاح' : 'Tips for Success', info.tips),
        note && h('section', null, h('p', { className: 'ff-note' }, note)))));
}

// The home information button: these four lines and nothing else.
function ContactDialog({ label, closeLabel, onClose }) {
  return h(Dialog, { onClose, label },
    h('div', { className: 'ff-dialog-card ff-contact-card' },
      h('div', { className: 'ff-contact-close' }, h(IconButton, { label: closeLabel, icon: pd, onClick: onClose })),
      h('address', { className: 'ff-contact', lang: 'en', dir: 'ltr' },
        h('p', null, 'SPEECH AND LANGUAGE PATHOLOGY'),
        h('p', null, 'Ahmad Ghanem'),
        h('p', null, 'Latakia - Syria'),
        h('a', { href: 'mailto:slp.ahmadghanem@gmail.com' }, 'slp.ahmadghanem@gmail.com'),
        h('a', { href: 'https://wa.me/963988451245', target: '_blank', rel: 'noopener noreferrer' }, 'WhatsApp: +963988451245'))));
}

function LetterDialog({ letters, title, closeLabel, onChoose, onClose }) {
  return h(Dialog, { onClose, label: title },
    h('div', { className: 'ff-dialog-card' },
      h('div', { className: 'ff-dialog-head' }, h('h2', null, title), h(IconButton, { label: closeLabel, icon: pd, onClick: onClose })),
      h('div', { className: 'ff-dialog-body' },
        h('div', { className: 'ff-letters' }, letters.map(letter => h('button', { key: letter, type: 'button', onClick: () => onChoose(letter) }, letter))))));
}

function BreathMark({ active, progress }) {
  return h('span', { className: `ff-breath-mark${active ? ' is-active' : ''}`, 'aria-hidden': true },
    h(Gn, null), h('span', { className: 'ff-breath-bar' }, h('i', { style: { width: `${active ? progress : 0}%` } })));
}

function ModSteps({ steps, phase, t }) {
  return h('ol', { className: 'ff-steps', 'aria-hidden': true }, steps.map(([key, Icon]) => h('li', { key, className: phase === key ? 'is-active' : '', 'data-step': key },
    h('span', { className: 'ff-step-icon' }, h(Icon, null)), h('span', null, key === 'pause' ? t.pausePhase : t[key]))));
}

function WordGuide({ screen, category, items, tokens, pageIndex, itemCount, usePictures, activeIndex, phase, breathProgress, doneWords }) {
  const easy = screen === 'easy-onset-practice';
  const stateOf = index => index === activeIndex && !['rest', 'idle', 'breath'].includes(phase) ? ' is-active' : doneWords.includes(index) ? ' is-done' : '';
  const breathing = index => index === activeIndex && phase === 'breath';
  if (singleItemCategories.has(category)) {
    return h('div', { className: 'ff-items' }, items.slice(pageIndex, pageIndex + itemCount).map((item, index) => h('div', {
      key: `${pageIndex}-${index}`, className: `ff-item${stateOf(index)}`, 'data-phase': index === activeIndex ? phase : undefined
    },
      easy && h(BreathMark, { active: breathing(index), progress: breathProgress }),
      h('div', {
        className: `ff-item-word ${usePictures ? 'ff-picture-word' : ''}`,
        role: usePictures ? 'img' : undefined, 'aria-label': usePictures ? item.text : undefined,
        'data-picture-word': usePictures ? item.text : undefined
      },
        item.icon && h('div', { className: usePictures ? 'ff-word-picture' : 'ff-item-icon' }, Y.cloneElement(item.icon, { 'aria-hidden': true })),
        !usePictures && h('span', { className: 'ff-word' }, item.text)))));
  }
  if (freeCategories.has(category)) {
    return h('div', { className: 'ff-prompt' },
      h('p', { className: phase === 'talk' ? 'is-active' : '' }, tokens[0]?.text),
      phase === 'talk' && h('span', { className: 'ff-breath-bar', 'aria-hidden': true }, h('i', { style: { width: `${breathProgress}%` } })));
  }
  const showTargets = Boolean(MOD_STEPS[screen]);
  return h('div', { className: `ff-flow ff-flow-${category}` }, tokens.map((token, index) => h(Y.Fragment, { key: index },
    easy && token.breath && h(BreathMark, { active: breathing(index), progress: breathProgress }),
    h('span', {
      className: `ff-word${stateOf(index)}${showTargets && token.target ? ' is-target' : ''}`,
      'data-phase': index === activeIndex ? phase : undefined
    }, token.text))));
}

function BreathingGuide({ t, phase, label, progress, scale, cycle, cycles, inhale, hold, exhale, setBreath, setCycles }) {
  const slider = (key, title, value) => h('label', { className: 'ff-breath-slider', 'data-step': key },
    h('span', null, title),
    h('input', {
      type: 'range', min: breathingLimits[key][0], max: breathingLimits[key][1], value,
      onChange: event => setBreath(key, parseInt(event.target.value, 10))
    }),
    h('output', null, `${value} ${t.seconds}`));
  return h(Y.Fragment, null,
    h('div', { className: `ff-breath-circle${phase === 'idle' ? '' : ' is-running'}`, 'data-phase': phase },
      h('div', { className: 'ff-breath-core', style: { transform: `scale(${scale})` } }, phase === 'idle' ? h(Gn, { 'aria-hidden': true }) : h('span', { 'aria-hidden': true }, label)),
      phase !== 'idle' && h('svg', { className: 'ff-breath-ring', viewBox: '0 0 100 100', 'aria-hidden': true }, h('circle', { cx: 50, cy: 50, r: 47, pathLength: 100, strokeDasharray: `${progress} 100` }))),
    h('p', { className: 'ff-breath-count' }, `${t.cycles}: ${Math.min(cycle, cycles)} / ${cycles} · ${t.duration}: ${inhale + hold + exhale} ${t.seconds}`),
    h('div', { className: 'ff-breath-settings' },
      slider('inhale', t.inhale, inhale), slider('hold', t.hold, hold), slider('exhale', t.exhale, exhale),
      h('div', { className: 'ff-breath-slider' }, h('span', null, t.cycles),
        h(Stepper, {
          value: cycles, label: t.cycles, moreLabel: t.moreCycles, lessLabel: t.fewerCycles,
          atMax: cycles >= breathingCycles.max, atMin: cycles <= breathingCycles.min,
          onMore: () => setCycles(value => Math.min(breathingCycles.max, value + 1)),
          onLess: () => setCycles(value => Math.max(breathingCycles.min, value - 1))
        }))));
}

export function App({ translations }) {
  const [screen, updateScreen] = Y.useState('home');
  const [lang, setLang] = Y.useState(readLanguage);
  const [category, setCategory] = Y.useState('words');
  const [speeds, setSpeeds] = Y.useState({});
  const [itemCount, updateItemCount] = Y.useState(1);
  const [playing, setPlaying] = Y.useState(false);
  const [completed, setCompleted] = Y.useState(false);
  const [activeIndex, setActiveIndex] = Y.useState(-1);
  const [pageIndex, setPageIndex] = Y.useState(0);
  const [showInfo, setShowInfo] = Y.useState(false);
  const [showAbout, setShowAbout] = Y.useState(false);
  const [phase, setPhase] = Y.useState('idle');
  const [phaseProgress, setPhaseProgress] = Y.useState(0);
  const [guideProgress, setGuideProgress] = Y.useState(0);
  const [breathProgress, setBreathProgress] = Y.useState(0);
  const [breathScale, setBreathScale] = Y.useState(.72);
  const [breathCycle, setBreathCycle] = Y.useState(0);
  const [breathingPreset, setBreathingPreset] = Y.useState(0);
  const [breath, setBreath] = Y.useState(breathingPresets[0]);
  const [cycles, setCycles] = Y.useState(breathingCycles.initial);
  const [pauseSeconds, setPauseSeconds] = Y.useState(cancellationPause.initial);
  const [pictureMode, setPictureMode] = Y.useState(false);
  const [letter, setLetter] = Y.useState(null);
  const [showLetters, setShowLetters] = Y.useState(false);
  const [autoNext, setAutoNext] = Y.useState(false);
  const [pendingRating, setPendingRating] = Y.useState(null);
  const [showPeople, setShowPeople] = Y.useState(false);
  const [gate, setGate] = Y.useState(null);
  const progress = Y.useSyncExternalStore(store.subscribe, store.getSnapshot);
  const finishedRef = Y.useRef(false);
  const [run, setRun] = Y.useState(null);
  const [dayDone, setDayDone] = Y.useState(null);
  const [showMenu, setShowMenu] = Y.useState(false);
  const [therapist, setTherapist] = Y.useState(null);
  const celebrateRef = Y.useRef(false);
  const [, refreshToday] = Y.useState(0);
  const [touchPos, setTouchPos] = Y.useState(0);
  const [touchRun, setTouchRun] = Y.useState(0);
  const [doneByTouch, setDoneByTouch] = Y.useState(false);
  const elapsedRef = Y.useRef(0);
  const t = translations[lang];
  const isArabic = lang === 'ar';
  const { recording, recordingPending, recordingUrl, recordingError, startRecording, stopRecording, playRecording, clearRecording, discardRecording } = useRecording(lang);
  const isBreathing = screen === 'breathing-practice';
  const isPractice = screen.endsWith('-practice');
  const defaults = screenDefaults[screen];
  const speed = speeds[screen] ?? defaults?.speed ?? 5;
  const extra = progress.extra?.[progress.active] || {};
  const fearedWords = extra.feared?.words || [];
  const practiceData = { ...t.practiceData, myWords: fearedWords.map(text => ({ text, icon: null })) };
  const listed = practiceItems(practiceData, category, letter, screen);
  const usePictures = category === 'practice' && !!letter && pictureMode;
  const items = usePictures ? pictureItems(listed.map(item => item.text)) : listed;
  const pageStep = singleItemCategories.has(category) ? itemCount : 1;
  const pageCount = Math.ceil(items.length / pageStep);
  const pageNumber = Math.floor(pageIndex / pageStep) + 1;
  const tokens = practiceTokens(items, category, pageIndex, itemCount);
  const targets = isPractice && !isBreathing ? touchTargets(screen, category, tokens) : [];
  // A paused guide keeps its place, so the pad returns only after it ends or is reset.
  const showPad = targets.length > 0 && !usePictures && !playing && !completed && elapsedRef.current === 0;
  const stars = (progress.entries[progress.active] || []).length;
  const screenTitle = {
    home: t.title, 'fluency-shaping': t.fluencyShaping,
    'stuttering-modification': t.stutteringMod, 'breathing-techniques': t.breathingTech,
    'slower-rate-practice': t.slowerRate, 'easy-onset-practice': t.easyOnsets,
    'light-contact-practice': t.lightContacts, 'cancellation-practice': t.cancellations,
    'pull-out-practice': t.pullOuts, 'prep-set-practice': t.prepSets,
    'breathing-practice': t.breathingInfo.techniques[breathingPreset]?.name || t.breathingTech,
    progress: t.myPractice, plan: t.dailyTraining, tools: t.tabTools, situations: t.program_board, feared: t.program_feared,
    affirmation: t.program_affirmation, 'self-rating': t.program_selfRating, lesson: t.program_lesson
  }[screen] || t.title;
  const intro = {
    'slower-rate-practice': t.slowerRateIntro, 'easy-onset-practice': t.easyOnsetIntro, 'light-contact-practice': t.lightContactIntro,
    'cancellation-practice': t.cancellationIntro, 'pull-out-practice': t.pullOutIntro,
    'prep-set-practice': t.prepSetIntro, 'breathing-practice': t.breathingIntro,
    'fluency-shaping': t.fluencyIntro, 'stuttering-modification': t.stutteringIntro, 'breathing-techniques': t.breathingIntro
  }[screen];
  const info = {
    'easy-onset-practice': t.easyOnsetInfo, 'light-contact-practice': t.lightContactInfo, 'slower-rate-practice': t.slowerRateInfo,
    'cancellation-practice': t.cancellationInfo, 'pull-out-practice': t.pullOutInfo, 'prep-set-practice': t.prepSetInfo, 'breathing-practice': t.breathingInfo
  }[screen];

  function resetPractice() {
    elapsedRef.current = 0;
    setPlaying(false);
    setCompleted(false);
    setActiveIndex(-1);
    setPhase('idle');
    setPhaseProgress(0);
    setGuideProgress(0);
    setBreathProgress(0);
    setBreathScale(.72);
    setBreathCycle(0);
    setPendingRating(null);
    setTouchPos(0);
    setTouchRun(run => run + 1);
    setDoneByTouch(false);
    stopRecording();
  }
  function setScreen(next) {
    resetPractice();
    discardRecording();
    setShowInfo(false);
    setPageIndex(0);
    setLetter(null);
    setPictureMode(false);
    const entry = screenDefaults[next];
    if (entry) { setCategory(entry.category); updateItemCount(entry.itemCount); }
    updateScreen(next);
  }
  function openBreathing(preset) {
    setScreen('breathing-practice');
    setBreathingPreset(preset);
    setBreath(breathingPresets[preset]);
  }
  function logPractice(extra = {}) {
    const id = store.record(isBreathing
      ? { screen, preset: breathingPreset, breaths: cycles }
      : { screen, category, ...(letter && category === 'practice' ? { letter } : {}), ...(freeCategories.has(category) ? {} : { spm: syllablesPerMinute(speed) }), ...extra }, t.me);
    // Auto-advance keeps going, so asking would interrupt the requested flow.
    if (isBreathing || !autoNext) setPendingRating(id);
    if (run && run.left > 0) {
      const left = run.left - 1;
      setRun({ ...run, left });
      if (left === 0) markRunDone(run);
    }
  }
  function markRunDone(current) {
    const programNow = () => { const latest = store.getSnapshot(); return latest.extra?.[latest.active]?.program; };
    const wasDone = isDayDone(programNow(), current.day);
    store.updateExtra(data => ({ ...data, program: markStep(data.program, current.day, current.index, Date.now()) }), t.me);
    // Celebrate finishing a day once, not each time one of its steps is replayed.
    celebrateRef.current = !wasDone && isDayDone(programNow(), current.day);
  }
  // Leaves the step and returns to the day, celebrating if that was its last step.
  function finishRun() {
    const { day } = run;
    setRun(null);
    setScreen('plan');
    if (celebrateRef.current) { celebrateRef.current = false; setDayDone(day); }
  }
  function completeTool() {
    if (!run) { setScreen('tools'); return; }
    markRunDone(run);
    finishRun();
  }
  function openStep(day, index) {
    const step = PROGRAM[day][index];
    if (step.type === 'exercise') {
      setScreen(step.screen);
      setCategory(step.category === 'myWords' && !fearedWords.length ? 'words' : step.category);
    } else if (step.type === 'breath') {
      openBreathing(step.preset);
      setCycles(step.breaths);
    } else {
      setScreen({ lesson: 'lesson', affirmation: 'affirmation', selfRating: 'self-rating', board: 'situations', feared: 'feared', tryOne: 'situations' }[step.type]);
    }
    setRun({ day, index, left: step.times || 1 });
  }
  function goBack() {
    if (run?.left === 0) { finishRun(); return; }
    if (run) { setRun(null); setScreen('plan'); return; }
    setScreen(parentScreen(screen));
  }
  function touchPhase(tokenIndex, next, share) {
    setActiveIndex(tokenIndex);
    setPhase(next);
    setPhaseProgress(share);
  }
  function touchDone() {
    if (touchPos + 1 < targets.length) { setTouchPos(touchPos + 1); return; }
    setActiveIndex(-1);
    setPhase('idle');
    setPhaseProgress(0);
    setDoneByTouch(true);
    setCompleted(true);
    logPractice({ touch: true });
  }
  function setSpeed(value) { setSpeeds(previous => ({ ...previous, [screen]: clamp(value, [0, 10]) })); }
  function setItemCount(value) {
    resetPractice();
    updateItemCount(value);
    setPageIndex(0);
  }
  function chooseCategory(next, event) {
    if (next === 'practice') { event.currentTarget.focus(); setShowLetters(true); return; }
    setCategory(next); resetPractice(); setPageIndex(0);
  }
  function chooseLetter(next) {
    setLetter(next); setCategory('practice'); setPageIndex(0); resetPractice(); setShowLetters(false);
  }
  function toggleLanguage() {
    resetPractice();
    discardRecording();
    setLetter(null);
    setPictureMode(false);
    setPageIndex(0);
    if (category === 'practice') setCategory(defaults?.category || 'words');
    setLang(previous => previous === 'ar' ? 'en' : 'ar');
  }
  function togglePractice() {
    if (playing) { setPlaying(false); setCompleted(false); return; }
    if (completed) { elapsedRef.current = 0; setGuideProgress(0); }
    setCompleted(false);
    setPendingRating(null);
    finishedRef.current = false;
    setTouchPos(0);
    setTouchRun(run => run + 1);
    setDoneByTouch(false);
    setPlaying(true);
  }
  function nextPage() {
    if (pageIndex + pageStep < items.length) { resetPractice(); setPageIndex(pageIndex + pageStep); }
  }
  function previousPage() {
    if (pageIndex > 0) { resetPractice(); setPageIndex(Math.max(0, pageIndex - pageStep)); }
  }
  // Before the first paint, so a saved language never flashes the wrong direction.
  Y.useLayoutEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    try { localStorage.setItem('fluency-flow-language', lang); } catch { /* Private browsing can block storage. */ }
  }, [lang, isArabic]);
  Y.useEffect(() => {
    document.title = screen === 'home' ? t.title : `${screenTitle} · ${t.title}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector('h1')?.focus({ preventScroll: true });
  }, [screen, lang]);
  Y.useEffect(() => {
    if (showInfo || showAbout || showLetters || showPeople || gate || showMenu || therapist) { setPlaying(false); setCompleted(false); }
  }, [showInfo, showAbout, showLetters, showPeople, gate, showMenu, therapist]);
  Y.useEffect(() => {
    const refresh = event => { if (event.key === null || event.key?.startsWith('fluency-flow-progress')) store.refresh(); };
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);
  const backgroundStopRef = Y.useRef(stopRecording);
  backgroundStopRef.current = stopRecording;
  Y.useEffect(() => {
    function pauseForBackground() {
      if (document.hidden) { setPlaying(false); setCompleted(false); backgroundStopRef.current(); }
      // Coming back to the app the next morning must show the newly opened day.
      else refreshToday(value => value + 1);
    }
    function leavePage() { setPlaying(false); setCompleted(false); backgroundStopRef.current(); }
    document.addEventListener('visibilitychange', pauseForBackground);
    window.addEventListener('pagehide', leavePage);
    return () => {
      document.removeEventListener('visibilitychange', pauseForBackground);
      window.removeEventListener('pagehide', leavePage);
    };
  }, []);
  // The category row scrolls sideways on phones, so bring the chosen one into view.
  Y.useEffect(() => {
    const row = document.querySelector('.ff-practice .ff-categories');
    const chosen = row?.querySelector('[aria-pressed="true"]');
    if (chosen) row.scrollLeft += chosen.getBoundingClientRect().left - row.getBoundingClientRect().left - (row.clientWidth - chosen.offsetWidth) / 2;
  }, [screen, category]);
  // Long stories: keep the active word on screen, clear of the fixed controls.
  Y.useEffect(() => {
    if (!playing || activeIndex < 0) return;
    document.querySelector('.ff-word.is-active')?.scrollIntoView({ block: 'nearest' });
  }, [playing, activeIndex, phase]);
  // Auto-advance owns one cancellable timeout. Navigation, pause, dialogs and
  // changing a category all invalidate it before another exercise can start.
  Y.useEffect(() => {
    if (!completed || !autoNext || isBreathing || run?.left === 0 || showInfo || showAbout || showLetters || document.hidden || pageIndex + pageStep >= items.length) return;
    const timeout = setTimeout(() => {
      elapsedRef.current = 0;
      setCompleted(false);
      setActiveIndex(-1);
      finishedRef.current = false;
      setGuideProgress(0);
      setPageIndex(index => index + pageStep);
      setTouchPos(0);
      setTouchRun(run => run + 1);
      setDoneByTouch(false);
      setPlaying(!doneByTouch);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [completed, doneByTouch, autoNext, screen, category, lang, letter, pageIndex, pageStep, items.length, showInfo, showAbout, showLetters]);
  // Use elapsed time instead of interval counts, and retain it while paused.
  // Ten updates per second keep the cue responsive without rendering at 20 Hz.
  Y.useEffect(() => {
    if (!playing || showInfo || showAbout || showLetters) return;
    if (!isBreathing && !tokens.length) { setPlaying(false); return; }
    const cues = isBreathing ? [] : buildCues(screen, tokens, { speed, pauseSeconds });
    function finish() {
      setGuideProgress(0);
      // Only finished practice counts. The interval can tick again before React re-renders.
      if (!finishedRef.current) {
        finishedRef.current = true;
        logPractice();
      }
      elapsedRef.current = 0;
      setPlaying(false);
      setCompleted(true);
      setActiveIndex(-1);
      setPhase('idle');
      setBreathScale(.72);
    }
    const totalMs = cues.reduce((sum, cue) => sum + cue.duration, 0);
    let last = performance.now();
    function tick() {
      const now = performance.now();
      elapsedRef.current += now - last;
      last = now;
      let elapsed = elapsedRef.current;
      if (isBreathing) {
        const { inhale, hold, exhale } = breath;
        const total = (inhale + hold + exhale) * 1000;
        if (elapsed >= total * cycles) { setBreathProgress(100); finish(); return; }
        setBreathCycle(Math.floor(elapsed / total) + 1);
        const within = elapsed % total;
        setBreathProgress(within / total * 100);
        if (within < inhale * 1000) { setPhase('inhale'); setBreathScale(.72 + .28 * within / (inhale * 1000)); }
        else if (within < (inhale + hold) * 1000) { setPhase('hold'); setBreathScale(1); }
        else { setPhase('exhale'); setBreathScale(1 - .28 * (within - (inhale + hold) * 1000) / (exhale * 1000)); }
        return;
      }
      setGuideProgress(elapsed / totalMs * 100);
      for (const cue of cues) {
        if (elapsed < cue.duration) {
          setActiveIndex(cue.index);
          setPhase(cue.phase);
          setPhaseProgress(elapsed / cue.duration * 100);
          return;
        }
        elapsed -= cue.duration;
      }
      finish();
    }
    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [playing, screen, category, lang, pageIndex, itemCount, letter, usePictures, speed, pauseSeconds, breath, cycles, showInfo, showAbout, showLetters]);

  const exhaleLabel = [t.exhale, t.exhaleSpeak, t.exhaleSound][breathingPreset];
  const phaseLabel = {
    inhale: t.inhale, hold: t.hold, exhale: isBreathing ? exhaleLabel : t.exhale, breath: t.inhale, vocalize: t.speak,
    word: screen === 'light-contact-practice' ? t.light : t.speak, rest: t.pausePhase, pause: t.pausePhase,
    talk: t.talk, stutter: t.stutter, repeat: t.repeat, transition: t.transition, prepare: t.prepare, smooth: t.smooth
  }[phase] || '';
  const statusText = playing ? phaseLabel : completed ? t.finished : elapsedRef.current > 0 ? t.paused : '';
  // The circle and step icons already show the phase, so screen readers alone get this copy.
  const phaseShownElsewhere = playing && (isBreathing || MOD_STEPS[screen]?.some(([key]) => key === phase));
  const singleCategory = singleItemCategories.has(category);
  const exerciseNames = {
    'slower-rate-practice': t.slowerRate, 'easy-onset-practice': t.easyOnsets, 'light-contact-practice': t.lightContacts,
    'cancellation-practice': t.cancellations, 'pull-out-practice': t.pullOuts, 'prep-set-practice': t.prepSets
  };
  // Leaving a program step from the menu abandons it, like pressing Back.
  const menuGo = action => () => { setShowMenu(false); setRun(null); action(); };
  const menuItem = (label, icon, target) => ({ label, icon, screen: target, go: menuGo(() => setScreen(target)) });
  const techniqueNames = t.breathingInfo.techniques.map(technique => technique.name);
  const menuGroups = [
    { title: t.menuMain, items: [menuItem(t.tabToday, SunIcon, 'home'), menuItem(t.dailyTraining, FlagIcon, 'plan'), menuItem(t.tabTools, ToolsIcon, 'tools')] },
    { title: t.fluencyShaping, items: [menuItem(t.slowerRate, Fy, 'slower-rate-practice'), menuItem(t.easyOnsets, HillIcon, 'easy-onset-practice'), menuItem(t.lightContacts, BubbleIcon, 'light-contact-practice')] },
    { title: t.stutteringMod, items: [menuItem(t.cancellations, cf, 'cancellation-practice'), menuItem(t.pullOuts, fr, 'pull-out-practice'), menuItem(t.prepSets, Bf, 'prep-set-practice')] },
    { title: t.breathingTech, items: techniqueNames.map((name, index) => ({ label: name, icon: Gn, go: menuGo(() => openBreathing(index)) })) },
    { title: t.tabTools, items: [menuItem(t.program_board, ToolsIcon, 'situations'), menuItem(t.program_feared, ToolsIcon, 'feared'), menuItem(t.program_affirmation, ToolsIcon, 'affirmation'), menuItem(t.program_selfRating, ToolsIcon, 'self-rating')] },
    { title: t.menuMore, items: [
      { label: t.myPractice, icon: PathIcon, go: menuGo(() => setGate('progress')) },
      { label: t.people, icon: PersonIcon, go: menuGo(() => setGate('people')) },
      { label: t.tabTherapist, icon: TherapistIcon, go: menuGo(() => setTherapist('lock')) },
      { label: t.info, icon: xa, go: menuGo(() => setShowAbout(true)) },
      { label: isArabic ? 'English' : 'العربية', icon: nS, go: menuGo(toggleLanguage) }
    ] }
  ];
  const shownCategories = isPractice && !isBreathing ? [...categoriesByScreen[screen], ...(fearedWords.length && MOD_STEPS[screen] ? ['myWords'] : [])] : [];
  const recordingText = recordingError || (recordingPending ? t.recordingPending : recording ? t.recording : recordingUrl ? t.recordingReady : '');

  return h('div', { className: 'ff-app', dir: isArabic ? 'rtl' : 'ltr', 'data-screen': screen, 'data-playing': playing },
    h('header', { className: 'ff-header' },
      h('div', { className: 'ff-brand' },
        h(IconButton, { label: t.menu, icon: MenuIcon, onClick: event => { event.currentTarget.focus(); setShowMenu(true); } }),
        screen !== 'home'
          ? h(IconButton, { label: t.back, icon: $s, flip: true, onClick: goBack })
          : h('img', { src: LOGO, width: 40, height: 40, alt: '' }),
        h('h1', { tabIndex: -1 }, screenTitle)),
      h('div', { className: 'ff-header-actions' },
        h(IconButton, { label: t.profile, icon: PersonIcon, onClick: event => { event.currentTarget.focus(); setGate('people'); } }),
        (isPractice || screen === 'home') && h(IconButton, { label: t.info, icon: xa, onClick: event => { event.currentTarget.focus(); isPractice ? setShowInfo(true) : setShowAbout(true); } }),
        h('button', {
          type: 'button', className: 'ff-language', onClick: toggleLanguage, lang: isArabic ? 'en' : 'ar',
          'aria-label': isArabic ? 'Switch to English' : 'التبديل إلى العربية'
        }, h(nS, { 'aria-hidden': true }), h('span', null, isArabic ? 'English' : 'العربية')),
        screen === 'home' && h(PwaDownload, { lang }))),
    h('main', { id: 'practice-main', className: 'ff-main' },
      screen === 'home' && h('section', { className: 'ff-home' },
        h('div', { className: 'ff-home-top' },
          h(Mascot, { message: isWaitingForTomorrow(extra.program, extra.unlockedDays) ? t.mascotTomorrow : stars ? t.mascotBack : t.subtitle }),
          stars > 0 && h('p', { className: 'ff-star-count' }, h(Xo, { 'aria-hidden': true }), h('span', null, countLabel(lang, stars, t.units.stars)))),
        h('div', { className: 'ff-actions' },
          h(TodayCard, { t, done: extra.program, unlocked: extra.unlockedDays, onOpen: () => setScreen('plan') }),
          h(ActionCard, { title: t.fluencyShaping, hint: t.hint_fluency, tone: 'icy', icon: Uf, onClick: () => setScreen('fluency-shaping') }),
          h(ActionCard, { title: t.stutteringMod, hint: t.hint_stuttering, tone: 'mauve', icon: q6, onClick: () => setScreen('stuttering-modification') }),
          h(ActionCard, { title: t.breathingTech, hint: t.hint_breathing, tone: 'mint', icon: Gn, onClick: () => setScreen('breathing-techniques') }),
          h(ActionCard, { title: t.program_affirmation, hint: t.hint_affirmation, tone: 'pink', icon: BubbleIcon, onClick: () => setScreen('affirmation') }),
          h(ActionCard, { title: t.myPractice, hint: t.hint_progress, tone: 'vanilla', icon: PathIcon, onClick: () => setGate('progress') }))),
      screen === 'plan' && h(PlanScreen, {
        key: progress.active, t, lang, done: extra.program, unlocked: extra.unlockedDays, names: exerciseNames, onStep: openStep,
        onRestart: () => store.updateExtra(data => ({ ...data, program: {}, unlockedDays: {} }), t.me),
        onUnlock: day => setGate({ help: t.gateHelpDay, run: () => store.updateExtra(data => ({ ...data, unlockedDays: { ...data.unlockedDays, [day]: Date.now() } }), t.me) }),
        onRelock: day => setGate({ help: t.gateHelpDay, run: () => store.updateExtra(data => {
          const { [day]: _opened, ...unlockedDays } = data.unlockedDays || {};
          return { ...data, unlockedDays };
        }, t.me) })
      }),
      screen === 'tools' && h(ToolsScreen, { t, onOpen: setScreen }),
      screen === 'lesson' && run && h(LessonScreen, { t, lang, topic: PROGRAM[run.day][run.index].topic, onDone: completeTool }),
      screen === 'affirmation' && h(AffirmationScreen, {
        t, lang, saved: extra.affirmation,
        onDone: () => { store.updateExtra(data => ({ ...data, affirmations: [...(data.affirmations || []), Date.now()].slice(-500) }), t.me); completeTool(); },
        onSave: text => { if (text) store.updateExtra(data => ({ ...data, affirmation: text }), t.me); }
      }),
      screen === 'situations' && h(SituationBoard, {
        t, lang, levels: extra.situations, tried: extra.tried, tryMode: run && PROGRAM[run.day][run.index].type === 'tryOne', onDone: run ? completeTool : undefined,
        onLevel: (id, level) => store.updateExtra(data => ({ ...data, situations: { ...data.situations, [id]: level } }), t.me),
        onTried: id => store.updateExtra(data => ({ ...data, tried: { ...data.tried, [id]: Date.now() } }), t.me)
      }),
      screen === 'feared' && h(FearedScreen, {
        t, lang, feared: extra.feared, letterWords: t.practiceData.letterWords, onDone: run ? completeTool : undefined,
        onChange: feared => store.updateExtra(data => ({ ...data, feared }), t.me),
        onPractice: (next, chosen) => { setScreen(next); setLetter(chosen); setCategory('practice'); }
      }),
      screen === 'self-rating' && h(SelfRatingScreen, {
        t, lang, history: extra.selfRatings, onDone: completeTool,
        onRate: value => store.updateExtra(data => ({ ...data, selfRatings: [...(data.selfRatings || []), { at: Date.now(), value }].slice(-200) }), t.me)
      }),
      screen === 'progress' && h(ProgressScreen, {
        t, lang, snapshot: progress,
        names: exerciseNames,
        onOpenPeople: () => setShowPeople(true),
        onOpenStep: (next, step) => { setScreen(next); setCategory(step.category); }
      }),
      ['fluency-shaping', 'stuttering-modification', 'breathing-techniques'].includes(screen) && h('section', { className: 'ff-menu' },
        h('p', { className: 'ff-intro' }, intro),
        h('div', { className: 'ff-actions' },
          screen === 'fluency-shaping' && [
            h(ActionCard, { key: 1, title: t.slowerRate, hint: t.hint_slower, tone: 'mint', icon: Fy, onClick: () => setScreen('slower-rate-practice') }),
            h(ActionCard, { key: 2, title: t.easyOnsets, hint: t.hint_onset, tone: 'icy', icon: HillIcon, onClick: () => setScreen('easy-onset-practice') }),
            h(ActionCard, { key: 3, title: t.lightContacts, hint: t.hint_light, tone: 'pink', icon: BubbleIcon, onClick: () => setScreen('light-contact-practice') })
          ],
          screen === 'stuttering-modification' && [
            h(ActionCard, { key: 1, title: t.cancellations, hint: t.hint_cancel, tone: 'mauve', icon: cf, onClick: () => setScreen('cancellation-practice') }),
            h(ActionCard, { key: 2, title: t.pullOuts, hint: t.hint_pull, tone: 'vanilla', icon: fr, onClick: () => setScreen('pull-out-practice') }),
            h(ActionCard, { key: 3, title: t.prepSets, hint: t.hint_prep, tone: 'icy', icon: Bf, onClick: () => setScreen('prep-set-practice') })
          ],
          screen === 'breathing-techniques' && t.breathingInfo.techniques.map((technique, index) =>
            h(ActionCard, { key: index, title: technique.name, tone: ['mint', 'icy', 'mauve'][index], icon: Gn, onClick: () => openBreathing(index) })))),
      isPractice && h('section', { className: 'ff-practice' },
        run && h(RunBanner, { t, run, step: PROGRAM[run.day][run.index], onContinue: finishRun }),
        intro && !run && h('p', { className: 'ff-intro' }, intro),
        h('div', { className: 'ff-stage' },
          h('div', { className: 'ff-practice-card' },
            !isBreathing && h('div', { className: 'ff-pagination' },
              h(IconButton, { label: t.prev, icon: $s, flip: true, onClick: previousPage, disabled: pageIndex === 0 }),
              h('span', null, `${pageNumber} / ${pageCount}`),
              h(IconButton, { label: t.next, icon: Oo, flip: true, onClick: nextPage, disabled: pageIndex + pageStep >= items.length })),
            isBreathing
              ? h(BreathingGuide, {
                t, phase, label: phaseLabel, progress: breathProgress, scale: breathScale, cycle: breathCycle, cycles, ...breath, setCycles,
                setBreath: (key, value) => setBreath(previous => ({ ...previous, [key]: clamp(value, breathingLimits[key]) }))
              })
              : h('div', { className: 'ff-guide' },
                MOD_STEPS[screen] && !freeCategories.has(category) && h(ModSteps, { steps: MOD_STEPS[screen], phase, t }),
                h(WordGuide, { key: `${category}-${pageIndex}`, screen, category, items, tokens, pageIndex, itemCount, usePictures, activeIndex, phase, breathProgress: phaseProgress, doneWords: targets.slice(0, touchPos) }))),
          h('section', { className: 'ff-status', 'aria-label': t.sessionStatus },
            h('p', { role: 'status', className: phaseShownElsewhere ? 'ff-sr-only' : undefined }, statusText),
            recordingUrl && h('audio', { controls: true, src: recordingUrl, preload: 'metadata', 'aria-label': t.playRecording }))),
        h('div', { className: 'ff-side' },
          !isBreathing && !run && h('div', { className: 'ff-categories' }, shownCategories.map(key => h('button', {
            key, type: 'button', 'aria-pressed': category === key, onClick: event => chooseCategory(key, event)
          }, t[key]))),
          completed && !playing && h('div', { className: 'ff-done' },
            h(Cheer, { t }),
            completed && !isBreathing && run?.left !== 0 && pageIndex + pageStep < items.length && h('button', { type: 'button', className: 'ff-text-button ff-primary ff-keep-going', onClick: nextPage }, t.keepGoing),
            pendingRating && h(RatingPrompt, { t, onRate: rating => { store.rate(pendingRating, rating); setPendingRating(null); } })),
          screen === 'slower-rate-practice' && !freeCategories.has(category) && !completed && h(TurtleBar, { t, progress: guideProgress, walking: playing, speed }),
          showPad && h(TouchPad, {
            key: `${touchRun}-${touchPos}`, t, screen, token: tokens[targets[touchPos]], speed, pauseSeconds,
            onPhase: (next, share) => touchPhase(targets[touchPos], next, share), onDone: touchDone
          }),
          h('div', { className: 'ff-toolbar' },
            h(IconButton, { label: playing ? t.pause : t.play, icon: playing ? Ui : Fs, className: 'ff-play', onClick: togglePractice }),
            h(IconButton, { label: t.reset, icon: cf, onClick: resetPractice }),
            !isBreathing && h(IconButton, { label: t.autoAdvance, icon: Vo, 'aria-pressed': autoNext, onClick: () => setAutoNext(!autoNext) }),
            isBreathing ? null : recording
              ? h(IconButton, { label: t.stop, icon: Vf, className: 'ff-recording', onClick: stopRecording })
              : h(IconButton, { label: recordingPending ? t.recordingPending : t.record, icon: Of, disabled: recordingPending, onClick: startRecording }),
            recordingUrl && h(IconButton, { label: t.playRecording, icon: gT, onClick: playRecording }),
            recordingUrl && h(IconButton, { label: t.clear, icon: sT, onClick: clearRecording }),
            category === 'practice' && letter && !isBreathing && h('button', {
              type: 'button', className: 'ff-picture-switch', 'aria-pressed': pictureMode,
              'aria-label': isArabic ? 'عرض رموز الكلمات' : 'Show word pictures',
              title: isArabic ? (pictureMode ? 'عرض الكلمات' : 'عرض رموز الكلمات') : (pictureMode ? 'Show words' : 'Show word pictures'),
              onClick: () => { resetPractice(); setPageIndex(0); setPictureMode(value => !value); }
            }, pictureMode ? h('span', { 'aria-hidden': true, className: 'ff-text-symbol' }, isArabic ? 'أ' : 'Aa') : h(af, { 'aria-hidden': true })),
            !isBreathing && singleCategory && h(Stepper, {
              value: itemCount, label: t.moreItems, moreLabel: t.moreItems, lessLabel: t.lessItems,
              atMax: itemCount >= 3, atMin: itemCount <= 1,
              onMore: () => setItemCount(value => Math.min(3, value + 1)),
              onLess: () => setItemCount(value => Math.max(1, value - 1))
            }),
            recordingText && h('p', { className: 'ff-recording-feedback', role: recordingError ? 'alert' : 'status' }, recordingText)),
          FLUENCY.includes(screen) && !freeCategories.has(category) && !completed && h('div', { className: 'ff-speed' },
            h(IconButton, { label: t.slower, icon: Fy, onClick: () => setSpeed(speed - 1), disabled: speed <= 0 }),
            h('label', null,
              h('span', { className: 'ff-sr-only' }, t.speed),
              h('input', { type: 'range', min: 0, max: 10, value: speed, 'aria-label': t.speed, 'aria-valuetext': `${speed} / 10`, onChange: event => setSpeed(parseInt(event.target.value, 10)) }),
              h('span', { className: 'ff-speed-numbers', 'aria-hidden': true }, Array.from({ length: 11 }, (_, value) => h('b', { key: value, className: value === speed ? 'is-on' : '' }, value)))),
            h(IconButton, { label: t.faster, icon: zy, onClick: () => setSpeed(speed + 1), disabled: speed >= 10 })),
          screen === 'cancellation-practice' && !freeCategories.has(category) && !completed && h('div', { className: 'ff-setting' },
            h('span', null, t.pauseLength),
            h(Stepper, {
              value: `${pauseSeconds} ${t.seconds}`, label: t.pauseLength, moreLabel: t.longerPause, lessLabel: t.shorterPause,
              atMax: pauseSeconds >= cancellationPause.max, atMin: pauseSeconds <= cancellationPause.min,
              onMore: () => setPauseSeconds(value => Math.min(cancellationPause.max, value + 1)),
              onLess: () => setPauseSeconds(value => Math.max(cancellationPause.min, value - 1))
            }))))),
    showInfo && info && h(InfoDialog, { info, lang, note: isBreathing ? undefined : t.recordingNote, onClose: () => setShowInfo(false) }),
    showAbout && h(ContactDialog, { label: t.info, closeLabel: t.close, onClose: () => setShowAbout(false) }),
    showLetters && h(LetterDialog, {
      letters: lettersForScreen(screen, t.practiceData.letterWords), title: t.chooseLetter, closeLabel: t.close,
      onChoose: chooseLetter, onClose: () => setShowLetters(false)
    }),
    gate && h(AdultGate, {
      t, help: gate.help, onClose: () => setGate(null),
      onPass: () => {
        const target = gate;
        setGate(null);
        if (target.run) target.run();
        else if (target === 'people') setShowPeople(true);
        else setScreen('progress');
      }
    }),
    showPeople && h(PeopleDialog, { t, snapshot: progress, store, onClose: () => setShowPeople(false) }),
    showMenu && h(SideMenu, { t, screen, groups: menuGroups, onClose: () => setShowMenu(false) }),
    therapist === 'lock' && h(TherapistLock, { t, onUnlock: () => setTherapist('open'), onClose: () => setTherapist(null) }),
    therapist === 'open' && h(TherapistWindow, { t, lang, snapshot: progress, store, onClose: () => setTherapist(null) }),
    h(PwaPanel, { lang, busy: playing || recording || recordingPending }),
    ['home', 'plan', 'tools'].includes(screen) && h('nav', { className: 'ff-tabbar', 'aria-label': t.dailyTraining }, [['home', t.tabToday, SunIcon], ['plan', t.tabTraining, FlagIcon], ['tools', t.tabTools, ToolsIcon]].map(([target, label, Glyph]) => h('button', {
      key: target, type: 'button', 'aria-current': screen === target ? 'page' : undefined, onClick: () => setScreen(target)
    }, h(Glyph), h('span', null, label))),
      h('button', { key: 'therapist', type: 'button', onClick: event => { event.currentTarget.focus(); setTherapist('lock'); } }, h(TherapistIcon), h('span', null, t.tabTherapist))),
    dayDone !== null && h(DayDoneDialog, { t, lang, day: dayDone, onClose: () => setDayDone(null) }));
}
