// Every button in the app squashes and springs back when pressed.
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function squash(button) {
  if (!button || button.disabled || calm() || !button.animate) return;
  // The separate scale property leaves each button's own transform and animations untouched.
  button.animate([{ scale: 1 }, { scale: .93, offset: .35 }, { scale: 1.03, offset: .72 }, { scale: 1 }], { duration: 300, easing: 'ease-out' });
}
export function installPressAnimation() {
  document.addEventListener('pointerdown', event => squash(event.target.closest?.('button')));
  document.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) squash(event.target.closest?.('button'));
  });
}
// For a card that leaves the screen: a quick tap would otherwise remove it before the animation shows.
export function afterPress(action) {
  return event => {
    event.currentTarget.focus();
    if (calm()) action();
    else setTimeout(action, 130);
  };
}
