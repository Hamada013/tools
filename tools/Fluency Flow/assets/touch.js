// Touch exercises: the child performs each technique's steps with a finger. Slower Rate has no
// touch step: its turtle walks with the guide, at the chosen speed.
import { Y, Fy, Xo } from './vendor.js';
import { dragResult, inSlideZone, slideMs, slideProgress, sayMs, syllableMs, touchRules, touchSteps } from './practice.js';

const h = Y.createElement;

export function TurtleBar({ t, progress, walking, speed }) {
  const share = Math.min(100, Math.max(0, progress));
  return h('section', { className: `ff-touch ff-turtle${walking ? ' is-walking' : ''}`, 'aria-label': t.turtle, style: { '--walk': `${Math.round(syllableMs(speed) / 2)}ms` } },
    h('div', { className: 'ff-turtle-track', role: 'progressbar', 'aria-label': t.turtle, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(share) },
      h('i', { style: { width: `${share}%` } }),
      h('span', { className: 'ff-turtle-walker', style: { '--at': share / 100 } }, h(Fy, { 'aria-hidden': true }))));
}

// Press and hold, by finger, mouse or keyboard. Letting go early starts it again.
function HoldStep({ label, ms, hint, onProgress, onDone }) {
  const [progress, setProgress] = Y.useState(0);
  const [early, setEarly] = Y.useState(false);
  const timer = Y.useRef(null);
  function clear() { clearInterval(timer.current); timer.current = null; }
  Y.useEffect(() => clear, []);
  function start() {
    if (timer.current) return;
    setEarly(false);
    const began = performance.now();
    timer.current = setInterval(() => {
      const share = Math.min(100, (performance.now() - began) / ms * 100);
      setProgress(share);
      onProgress(share);
      if (share >= 100) { clear(); onDone(); }
    }, 50);
  }
  function stop() {
    if (!timer.current) return;
    clear();
    setProgress(0);
    onProgress(0);
    setEarly(true);
  }
  return h(Y.Fragment, null,
    h('button', {
      type: 'button', className: 'ff-hold', 'aria-label': label, style: { '--progress': `${progress}%` },
      onPointerDown: event => { event.currentTarget.setPointerCapture?.(event.pointerId); start(); },
      onPointerUp: stop, onPointerCancel: stop, onBlur: stop,
      onKeyDown: event => { if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) { event.preventDefault(); start(); } },
      onKeyUp: event => { if (event.key === ' ' || event.key === 'Enter') stop(); },
      onContextMenu: event => event.preventDefault()
    }, h('span', null, label)),
    h('p', { className: 'ff-touch-hint', role: 'status' }, early ? hint : ''));
}

// A slow slide. Rushing or jumping returns to the start, which is the point of the exercise.
function DragStep({ label, ms, hint, onProgress, onDone }) {
  const [value, setValue] = Y.useState(0);
  const [rushed, setRushed] = Y.useState(false);
  const startedAt = Y.useRef(null);
  const previous = Y.useRef(0);
  function change(event) {
    const next = parseInt(event.target.value, 10);
    const now = performance.now();
    startedAt.current ??= now;
    const result = dragResult({ value: next, previous: previous.current, startedAt: startedAt.current, now, minMs: ms });
    if (result === 'fast') {
      previous.current = 0; startedAt.current = null;
      setValue(0); setRushed(true); onProgress(0);
      return;
    }
    previous.current = next;
    setValue(next); setRushed(false); onProgress(next);
    if (result === 'done') onDone();
  }
  return h(Y.Fragment, null,
    h('div', { className: 'ff-drag' }, h('input', { type: 'range', min: 0, max: 100, step: 5, value, 'aria-label': label, onChange: change })),
    h('p', { className: 'ff-touch-label' }, label),
    h('p', { className: 'ff-touch-hint', role: 'status' }, rushed ? hint : ''));
}

// The ball rolls down the slide by itself. Pressing stops it, and the middle is the place to speak.
function SlideStep({ t, label, speed, onDone }) {
  const [hint, setHint] = Y.useState('');
  const [stopped, setStopped] = Y.useState(false);
  const button = Y.useRef(null);
  const live = Y.useRef({ position: 0, stopped: false, pointer: false });
  const leaving = Y.useRef(null);
  Y.useEffect(() => {
    const ms = slideMs(speed);
    let frame, began = null;
    function draw(time) {
      if (live.current.stopped) return;
      began ??= time;
      const position = slideProgress(time - began, ms);
      live.current.position = position;
      const node = button.current;
      if (node) {
        node.style.setProperty('--at', position);
        node.dataset.at = position.toFixed(2);
        node.dataset.zone = inSlideZone(position);
      }
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); clearTimeout(leaving.current); };
  }, [speed]);
  function press() {
    const state = live.current;
    if (state.stopped) return;
    if (inSlideZone(state.position)) {
      state.stopped = true;
      setHint('');
      setStopped(true);
      leaving.current = setTimeout(onDone, 350);
    } else {
      setHint(state.position < touchRules.slideZone[0] ? t.touch_early : t.touch_late);
    }
  }
  return h(Y.Fragment, null,
    h('button', {
      ref: button, type: 'button', className: `ff-slide${stopped ? ' is-stopped' : ''}`, 'aria-label': label,
      onPointerDown: () => { live.current.pointer = true; press(); },
      onClick: () => { if (!live.current.pointer) press(); live.current.pointer = false; },
      onContextMenu: event => event.preventDefault()
    },
      h('span', { className: 'ff-slide-ramp', 'aria-hidden': true }),
      h('span', { className: 'ff-slide-zone', 'aria-hidden': true }, h(Xo)),
      h('span', { className: 'ff-slide-ball', 'aria-hidden': true })),
    h('p', { className: 'ff-touch-label' }, label),
    h('p', { className: 'ff-touch-hint', role: 'status' }, hint));
}

// The moment to say the word, and it moves on by itself.
function SayStep({ label, ms, onDone }) {
  Y.useEffect(() => {
    const timer = setTimeout(onDone, ms);
    return () => clearTimeout(timer);
  }, []);
  return h(Y.Fragment, null,
    h('p', { className: 'ff-say', role: 'status' }, label),
    h('span', { className: 'ff-meter ff-say-meter', 'aria-hidden': true }, h('i', { style: { animationDuration: `${ms}ms` } })));
}

// A quick soft tap keeps the bubble whole. Holding it down too long pops it.
function BubbleStep({ label, hint, onDone }) {
  const [popped, setPopped] = Y.useState(false);
  const downAt = Y.useRef(null);
  return h(Y.Fragment, null,
    h('div', { className: 'ff-bubble-row' },
      h('button', {
        type: 'button', className: `ff-bubble${popped ? ' is-popped' : ''}`, 'aria-label': label,
        onPointerDown: () => { downAt.current = performance.now(); setPopped(false); },
        onClick: () => {
          const heldFor = downAt.current === null ? 0 : performance.now() - downAt.current;
          downAt.current = null;
          if (heldFor > touchRules.bubbleMaxMs) setPopped(true);
          else onDone();
        },
        onContextMenu: event => event.preventDefault()
      }),
      h('p', { className: 'ff-touch-label' }, label)),
    h('p', { className: 'ff-touch-hint', role: 'status' }, popped ? hint : ''));
}

export function TouchPad({ t, screen, token, speed, pauseSeconds, onPhase, onDone }) {
  const steps = touchSteps(screen, { pauseSeconds });
  const [index, setIndex] = Y.useState(0);
  const step = steps[index];
  Y.useEffect(() => { onPhase(step.phase, 0); }, [index]);
  const progress = share => onPhase(step.phase, share);
  const advance = () => { if (index + 1 < steps.length) setIndex(index + 1); else onDone(); };
  const label = t[`touch_${step.label}`];
  const hint = t[`touch_${step.hint}`];
  const key = `${index}`;
  return h('section', { className: 'ff-touch', 'aria-label': t.touchPractice },
    step.kind === 'tap' && h('button', { key, type: 'button', className: 'ff-tap', onClick: advance }, label),
    step.kind === 'hold' && h(HoldStep, { key, label, hint, ms: step.ms, onProgress: progress, onDone: advance }),
    step.kind === 'drag' && h(DragStep, { key, label, hint, ms: step.ms, onProgress: progress, onDone: advance }),
    step.kind === 'slide' && h(SlideStep, { key, t, label, speed, onDone: advance }),
    step.kind === 'say' && h(SayStep, { key, label, ms: sayMs(token.syllables, speed), onDone: advance }),
    step.kind === 'bubble' && h(BubbleStep, { key, label, hint, onDone: advance }));
}
