/* One cancellable count-up shared by workplace modes and every game. */
(() => {
    let current = null;
    const cancel = () => current?.cancel();
    function start() {
        cancel();
        return new Promise(resolve => {
            const dialog = document.createElement('dialog'); dialog.className = 'voc-countdown'; dialog.setAttribute('aria-label', 'استعد');
            const number = document.createElement('span'); number.className = 'voc-count-number'; number.setAttribute('role', 'status'); number.setAttribute('aria-live', 'assertive');
            dialog.append(number); document.body.append(dialog);
            let timer, count = 0, finished = false;
            const finish = success => {
                if (finished) return;
                finished = true; clearTimeout(timer); dialog.close(); dialog.remove(); current = null; resolve(success);
            };
            current = { cancel: () => finish(false) };
            dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
            dialog.showModal();
            const tick = () => {
                if (++count > 3) { finish(true); return; }
                number.textContent = String(count); number.dataset.count = count;
                number.style.animation = 'none'; void number.offsetWidth; number.style.animation = '';
                timer = setTimeout(tick, 800);
            };
            tick();
        });
    }
    for (const event of ['pagehide', 'voc-profile-open', 'voc-profile-beforechange']) window.addEventListener(event, cancel);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
    window.VocCountdown = { start, cancel, active: () => !!current };
})();
