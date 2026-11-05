/* Shared by every app page. The worker owns downloads; pages observe progress
 * and resume saved intent after browser/OS suspension, including installed apps. */
(() => {
    'use strict';
    const card = document.querySelector('[data-offline-card]') || document.querySelector('#offlinePanel,#offline-dialog');
    const statusText = card?.querySelector('[data-offline-status],#offlineStatus,#download-status');
    const progress = card?.querySelector('progress');
    const button = card?.querySelector('[data-offline-download],#offlineDownloadBtn,#download');
    const downloadToggle = document.querySelector('[data-open-download],#pwaDownloadToggle,#open-offline');
    const dialog = document.querySelector('[data-offline-dialog],#offlinePanel,#offline-dialog');
    const errorText = card?.querySelector('[data-offline-error],#offlineError,#download-error');
    const successIcon = card?.querySelector('[data-offline-complete]');
    const title = dialog?.querySelector('h2');
    downloadToggle?.addEventListener('click', () => { if (!dialog.open) dialog.showModal(); void sync(); });
    dialog?.addEventListener('click', event => { if (event.target === dialog && (event.clientX < dialog.getBoundingClientRect().left || event.clientX > dialog.getBoundingClientRect().right || event.clientY < dialog.getBoundingClientRect().top || event.clientY > dialog.getBoundingClientRect().bottom)) dialog.close(); });
    const base = new URL('./', document.querySelector('link[rel=manifest]').href);
    const workerURL = new URL('sw.js', base).href;
    let registration;
    let status;
    let starting = false;
    let fault = false;
    let syncing = false;
    let pollTimer;
    let closeTimer;
    let updating = false;
    const receiptKey = `vss-download-seen:${base.pathname}`;
    let seenCompletion = 0;
    try { seenCompletion = Number(localStorage.getItem(receiptKey)) || 0; } catch {}

    function acknowledgeCompletion() {
        clearTimeout(closeTimer);
        closeTimer = null;
        if (!status?.ready || !status.completedAt) return;
        seenCompletion = status.completedAt;
        try { localStorage.setItem(receiptKey, String(seenCompletion)); } catch {}
    }
    dialog?.addEventListener('close', acknowledgeCompletion);

    function completionFeedback() {
        if (!dialog || !status?.ready || updating || document.hidden || window.SuiteWelcome?.pending) return;
        // A background completion remains pending until it can actually be seen.
        if (!dialog.open && status.completedAt > seenCompletion) dialog.showModal();
        if (!dialog.open || closeTimer) return;
        closeTimer = setTimeout(() => {
            closeTimer = null;
            if (document.hidden || !status?.ready) return;
            acknowledgeCompletion();
            dialog.close();
        }, 1800);
    }

    function observeProgress() {
        clearTimeout(pollTimer);
        // Polling is display-only; leaving the page never stops the worker queue.
        if (!updating && status?.wanted && !status.ready && !fault && !document.hidden) {
            pollTimer = setTimeout(() => { void sync(false); }, 1000);
        }
        window.AppUpdates.setBusy(starting || (!fault && !!status?.wanted && !status.ready));
    }

    function showError(message) {
        fault = true;
        clearTimeout(closeTimer);
        closeTimer = null;
        observeProgress();
        if (!card) return;
        card.dataset.state = 'error';
        successIcon?.setAttribute('hidden', '');
        if (title) title.textContent = 'تنزيل';
        errorText.textContent = message;
        errorText.hidden = false;
        button.hidden = false;
        button.disabled = false;
    }

    function render(next) {
        if (next.error) {
            showError(next.error === 'storage'
                ? 'تعذر حفظ المحتوى. وفر مساحة على الجهاز ثم أعد المحاولة؛ المحتوى المحفوظ سيُستخدم مجدداً.'
                : 'توقف التنزيل. تحقق من الاتصال ثم استكمل؛ الملفات المحفوظة لن تُنزّل مجدداً.');
            return;
        }
        status = next;
        fault = false;
        observeProgress();
        if (!card) return;
        errorText.hidden = true;
        const percent = status.ready ? 100 : Math.min(99, Math.max(status.percent || 0,
            status.total ? Math.floor(status.done / status.total * 100) : 0));
        progress.max = 100;
        progress.value = percent;
        progress.setAttribute('aria-valuetext', `${percent}%`);
        statusText.textContent = `${percent}%`;
        statusText.setAttribute('aria-label', status.ready ? 'اكتمل التنزيل، 100%' : `${percent}%`);
        card.dataset.state = status.ready ? 'ready' : status.wanted ? 'downloading' : 'idle';
        successIcon?.toggleAttribute('hidden', !status.ready);
        if (title) title.textContent = status.ready ? 'اكتمل التنزيل' : 'تنزيل';
        button.hidden = status.ready;
        button.disabled = updating || status.ready || starting || (status.wanted && navigator.onLine);
        if (!status.ready) { clearTimeout(closeTimer); closeTimer = null; }
        completionFeedback();
    }

    function worker() {
        const controller = navigator.serviceWorker.controller;
        // Another PWA on this origin may control the initial page before claim().
        return controller?.scriptURL === workerURL
            ? controller : registration?.active;
    }

    function send(type, options = {}) {
        return new Promise((resolve, reject) => {
            const target = worker();
            if (!target) { reject(new Error('Service worker not active')); return; }
            const channel = new MessageChannel();
            const timer = setTimeout(() => {
                channel.port1.close();
                reject(new Error('Worker timed out; cached files are preserved'));
            }, 45000);
            channel.port1.onmessage = event => {
                clearTimeout(timer);
                channel.port1.close();
                resolve(event.data);
            };
            // Normally target is navigator.serviceWorker.controller. The active
            // registration also handles the first visit before control is claimed.
            target.postMessage({ type, ...options }, [channel.port2]);
        });
    }

    async function request(type, resume = true) {
        const { background, ...next } = await send(type, {
            resume, background: resume && !!registration?.backgroundFetch
        });
        render(next);
        if (!background) return;
        try {
            const manager = registration.backgroundFetch;
            if (!await manager.get(background.id)) {
                await manager.fetch(background.id,
                    background.requests.map(url => new Request(url, { cache: 'reload', credentials: 'same-origin' })),
                    background.options);
            }
        } catch { /* The worker keeps the saved request and owns the fallback. */ }
        render(await send('VSS_CONTINUE'));
    }

    async function sync(resume = true) {
        if (!worker() || syncing || starting || updating) return;
        syncing = true;
        try { await request('VSS_STATUS', resume); }
        catch { showError('تعذر التحقق من الملفات. اضغط إعادة المحاولة.'); }
        finally { syncing = false; }
    }

    window.addEventListener('beforeinstallprompt', event => event.preventDefault());
    button?.addEventListener('click', async () => {
        if (starting || updating) return;
        starting = true;
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        try {
            if (registration?.active?.state !== 'activated' && !await initialize()) return;
            try { void navigator.storage?.persist?.()?.catch(() => {}); } catch {}
            await request('VSS_START');
        } catch {
            showError('تعذر بدء التنزيل. تحقق من الاتصال ثم أعد المحاولة.');
        } finally {
            starting = false;
            button.setAttribute('aria-busy', 'false');
            button.disabled = !fault && (!!status?.ready || (!!status?.wanted && navigator.onLine));
            observeProgress();
        }
    });

    async function initialize() {
        if (!('serviceWorker' in navigator) || !window.isSecureContext) {
            showError('يتطلب التنزيل دون اتصال فتح التطبيق عبر HTTPS أو localhost.');
            if (button) button.disabled = true;
            return false;
        }
        try {
            registration = await window.AppUpdates.ready();
            await sync();
            return true;
        } catch {
            showError('تعذر تجهيز التطبيق دون اتصال. تحقق من الاتصال وأعد المحاولة.');
            return false;
        }
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.source?.scriptURL !== workerURL) return;
            if (event.data?.type === 'VSS_OFFLINE_PROGRESS') render(event.data);
        });
        navigator.serviceWorker.addEventListener('controllerchange', () => { void sync(); });
    }
    window.addEventListener('online', () => { void sync(); });
    window.addEventListener('offline', () => { if (status) render(status); });
    window.addEventListener('pageshow', () => { void sync(); });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearTimeout(pollTimer);
            clearTimeout(closeTimer);
            closeTimer = null;
        } else { completionFeedback(); void sync(); }
    });
    window.addEventListener('suite-welcome-done', completionFeedback);
    if (button && 'serviceWorker' in navigator && window.isSecureContext) button.disabled = false;
    async function prepareUpdate() {
        updating = true;
        clearTimeout(pollTimer);
        clearTimeout(closeTimer);
        closeTimer = null;
        if (button) button.disabled = true;
        const result = await send('VSS_PREPARE_UPDATE');
        if (result.error) throw new Error(result.message || 'Download handoff failed');
    }
    async function resumeAfterUpdate() {
        updating = false;
        await send('VSS_CANCEL_UPDATE');
        await sync();
    }
    window.VSSOffline = { sync, initialize, send, prepareUpdate, resumeAfterUpdate };
    void initialize();
})();
