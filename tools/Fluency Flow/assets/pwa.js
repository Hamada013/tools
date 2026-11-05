import { Y as React, u } from './vendor.js';
import { Dialog } from './dialog.js';

const copy = {
  en: {
    close: 'Close', install: 'Download the app', installed: 'App installed',
    preparing: 'Preparing offline practice…', ready: 'Ready for offline practice',
    failed: 'Offline access is not ready. Reconnect and reopen the app to try again.',
    unavailable: 'Use the HTTPS website to enable installation and offline practice.',
    detail: 'Add it to your home screen for quick access. Exercises work offline after the first complete download.',
    help: 'Installation help', iphone: 'On iPhone or iPad: open the Share menu, then choose Add to Home Screen.',
    android: 'On Android or desktop: open the browser menu and choose Install app or Add to Home Screen. On Mac Safari, choose File → Add to Dock.',
    update: 'An app update is ready.', reload: 'Update & reload',
    updateHint: 'Reloading starts a new session and clears recordings. Pause practice and finish recording before updating.',
    installError: 'The install prompt could not open. Use your browser’s install or home-screen menu.'
  },
  ar: {
    close: 'إغلاق', install: 'تنزيل التطبيق', installed: 'التطبيق مثبت',
    preparing: 'جارٍ تجهيز التدريب دون إنترنت…', ready: 'جاهز للتدريب دون إنترنت',
    failed: 'التدريب دون إنترنت غير جاهز. اتصل بالإنترنت وأعد فتح التطبيق للمحاولة مجدداً.',
    unavailable: 'افتح الموقع عبر HTTPS لتفعيل التثبيت والتدريب دون إنترنت.',
    detail: 'أضفه إلى الشاشة الرئيسية للوصول السريع. تعمل التمارين دون إنترنت بعد اكتمال التنزيل الأول.',
    help: 'طريقة التثبيت', iphone: 'على iPhone أو iPad: افتح قائمة المشاركة، ثم اختر «إضافة إلى الشاشة الرئيسية».',
    android: 'على Android أو الكمبيوتر: افتح قائمة المتصفح واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية». على Safari في Mac، اختر File ثم Add to Dock.',
    update: 'يتوفر تحديث للتطبيق.', reload: 'تحديث وإعادة تحميل',
    updateHint: 'تبدأ إعادة التحميل جلسة جديدة وتمسح التسجيلات. أوقف التدريب مؤقتاً وأنهِ التسجيل قبل التحديث.',
    installError: 'تعذر فتح نافذة التثبيت. استخدم خيار تثبيت التطبيق أو الإضافة للشاشة الرئيسية من قائمة المتصفح.'
  }
};
const state = { status: 'preparing', prompt: null, waiting: null, installed: false, reload: false };
const subscribers = new Set();
const notify = () => subscribers.forEach(listener => listener({ ...state }));
let initialized = false;
function initialize() {
  if (initialized) return;
  initialized = true;
  const standalone = matchMedia('(display-mode: standalone)');
  const detectInstalled = () => { state.installed = standalone.matches || navigator.standalone === true; notify(); };
  detectInstalled();
  standalone.addEventListener?.('change', detectInstalled);
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); state.prompt = event; notify();
  });
  window.addEventListener('appinstalled', () => { state.installed = true; state.prompt = null; notify(); });
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    state.status = 'unavailable'; notify(); return;
  }
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (state.reload) { location.reload(); return; }
    state.status = 'ready'; notify();
  });
  navigator.serviceWorker.register(new URL('../sw.js', import.meta.url), { scope: new URL('../', import.meta.url).href, updateViaCache: 'none' }).then(registration => {
    function inspect() {
      state.waiting = registration.waiting;
      if (registration.active) state.status = 'ready';
      notify();
    }
    inspect();
    function watch(worker) {
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'redundant' && !registration.active) state.status = 'failed';
        inspect();
      });
    }
    watch(registration.installing);
    registration.addEventListener('updatefound', () => watch(registration.installing));
    // Check again when returning to the app, without interrupting practice.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && navigator.onLine) registration.update().catch(() => {});
    });
    window.addEventListener('online', () => registration.update().catch(() => {}));
  }).catch(() => { state.status = 'failed'; notify(); });
}
initialize();

function useSnapshot() {
  const [snapshot, setSnapshot] = React.useState(() => ({ ...state }));
  React.useEffect(() => { subscribers.add(setSnapshot); setSnapshot({ ...state }); return () => subscribers.delete(setSnapshot); }, []);
  return snapshot;
}

// One download icon. The browser's install prompt opens directly when it is available;
// otherwise a short dialog gives the offline status and the steps for this device.
export function PwaDownload({ lang }) {
  const snapshot = useSnapshot();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState(false);
  const t = copy[lang];
  async function press(event) {
    event.currentTarget.focus();
    if (!snapshot.prompt) { setOpen(true); return; }
    try {
      const prompt = snapshot.prompt;
      state.prompt = null; notify();
      await prompt.prompt();
      await prompt.userChoice;
    } catch { setError(true); setOpen(true); }
  }
  if (snapshot.installed) return null;
  return u.jsxs(React.Fragment, { children: [
    u.jsx('button', {
      id: 'pwa-install', type: 'button', className: 'ff-icon-button', 'aria-label': t.install, title: t.install, onClick: press,
      children: u.jsxs('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, children: [
        u.jsx('path', { d: 'M12 3v12' }), u.jsx('path', { d: 'm7 10 5 5 5-5' }), u.jsx('path', { d: 'M4 21h16' })
      ] })
    }),
    open && u.jsx(Dialog, { onClose: () => setOpen(false), label: t.install, children: u.jsxs('div', { className: 'ff-dialog-card ff-gate', children: [
      u.jsxs('div', { className: 'ff-dialog-head', children: [
        u.jsx('h2', { children: t.install }),
        u.jsx('button', { type: 'button', className: 'ff-icon-button', 'aria-label': t.close, title: t.close, onClick: () => setOpen(false),
          children: u.jsx('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', 'aria-hidden': true, children: u.jsx('path', { d: 'M6 6l12 12M18 6 6 18' }) }) })
      ] }),
      u.jsxs('div', { id: 'pwa-install-help', className: 'ff-dialog-body', children: [
        u.jsx('p', { id: 'pwa-status', role: 'status', children: t[snapshot.status] }),
        u.jsx('p', { children: t.iphone }), u.jsx('p', { children: t.android }),
        error && u.jsx('p', { className: 'ff-alert', role: 'alert', children: t.installError })
      ] })
    ] }) })
  ] });
}

// Shown only when a new release is ready. Updating never interrupts practice.
export function PwaPanel({ lang, busy }) {
  const snapshot = useSnapshot();
  const t = copy[lang];
  if (!snapshot.waiting) return null;
  return u.jsxs('section', {
    id: 'pwa-panel', className: 'ff-pwa', 'aria-labelledby': 'pwa-title',
    children: [
      u.jsx('h2', { id: 'pwa-title', children: t.update }),
      u.jsx('p', { children: t.updateHint }),
      u.jsx('button', { id: 'pwa-update', type: 'button', disabled: busy, onClick: () => {
        if (busy || !state.waiting) return;
        state.reload = true;
        state.waiting.postMessage({ type: 'ACTIVATE_UPDATE' });
      }, children: t.reload })
    ]
  });
}
