import { Y as React, u } from './vendor.js';

export function Dialog({ children, onClose, label, className }) {
  const ref = React.useRef(null);
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;
  React.useEffect(() => {
    const previousFocus = document.activeElement;
    const node = ref.current;
    const surfaces = [...document.querySelectorAll('header, main, #pwa-panel, .ff-status, .ff-tabbar')];
    const priorInert = surfaces.map(surface => surface.inert);
    surfaces.forEach(surface => { surface.inert = true; });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () => [...node.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), summary, a[href], [tabindex="0"]')].filter(el => el.getClientRects().length);
    (node.querySelector('[data-autofocus]') || focusables()[0] || node).focus({ preventScroll: true });
    function onKey(event) {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const items = focusables();
      const first = items[0], last = items.at(-1);
      if (!first) { event.preventDefault(); node.focus(); return; }
      // A control that removed itself leaves focus outside; bring it back in.
      if (!node.contains(document.activeElement)) { event.preventDefault(); first.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === node)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === node)) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      surfaces.forEach((surface, i) => { surface.inert = priorInert[i]; });
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  return u.jsx('div', {
    ref, role: 'dialog', 'aria-modal': true, 'aria-label': label, tabIndex: -1,
    className: `ff-dialog ${className || ''}`,
    onClick: event => { if (event.target === event.currentTarget) closeRef.current(); },
    children
  });
}
