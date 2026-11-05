/* Local copy shared by VOC, SENB and Taffaha. Updates are offered only after
   the complete new shell has installed; the current release keeps working. */
(() => {
    let registration, settings, dialog, accept, later, offeredWorker, message, errorText;
    let busy = false, reloading = false, controlled = false, lastCheck = 0;
    let preparing, applying = false, activationWorker, activationTimer, currentController;
    // Every VSS activity uses the manifest at the suite root and one worker.
    const base = new URL('./', document.querySelector?.('link[rel="manifest"]')?.href || document.baseURI);
    const workerURL = new URL('sw.js', base).href;
    // Wait for this app's worker, including a first install. Unlike the global
    // serviceWorker.ready promise, a failed shell install rejects and can retry.
    async function ready(options = {}) {
        if (preparing) return preparing;
        preparing = (async () => {
            const next = await navigator.serviceWorker.register(new URL('sw.js', base), { scope: base.href, updateViaCache: 'none' });
            await new Promise((resolve, reject) => {
                const workers = new Set();
                const finish = error => {
                    clearTimeout(timer);
                    next.removeEventListener('updatefound', check);
                    navigator.serviceWorker.removeEventListener('controllerchange', check);
                    for (const worker of workers) worker.removeEventListener('statechange', check);
                    error ? reject(error) : resolve();
                };
                const check = () => {
                    for (const worker of [next.installing, next.waiting, next.active].filter(Boolean)) {
                        if (!workers.has(worker)) { workers.add(worker); worker.addEventListener('statechange', check); }
                    }
                    // Safari can keep the claimed worker in "activating" while
                    // its new page opens. It can already serve requests then.
                    const active=next.active,claimed=active?.state==='activating'&&navigator.serviceWorker.controller===active;
                    if (active?.state === 'activated' || claimed) finish();
                    else if ([...workers].some(worker => worker.state === 'redundant') && (!next.installing || next.installing.state === 'redundant')) finish(new Error('Offline installation failed'));
                };
                const timer = setTimeout(() => finish(new Error('Offline installation timed out')), 45000);
                next.addEventListener('updatefound', check);
                navigator.serviceWorker.addEventListener('controllerchange', check);
                check();
            });
            watch(next, options);
            return next;
        })();
        try { return await preparing; }
        catch { throw new Error('تعذر تجهيز التطبيق دون اتصال. تحقق من الاتصال ثم أعد المحاولة.'); }
        finally { preparing = null; }
    }
    function showAvailable() {
        if (window.SuiteWelcome?.pending || applying || reloading) return;
        const waiting = registration?.waiting;
        if (!controlled || !registration.active || !waiting || waiting === registration.active || waiting === offeredWorker) return;
        offeredWorker = waiting;
        renderControls();
        dialog.hidden = false;
        if (!dialog.open) dialog.showModal();
    }
    async function check() {
        checkController();
        if (!registration || document.hidden || !navigator.onLine || Date.now() - lastCheck < 60000) return;
        lastCheck = Date.now();
        try { await registration.update(); showAvailable(); } catch { /* Keep the cached app usable offline. */ }
    }
    function watchWorker(worker) {
        worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed') setTimeout(showAvailable, 0);
        });
    }
    function renderControls() {
        if (!accept) return;
        const blocked = busy && !window.VSSOffline?.prepareUpdate;
        accept.disabled = applying || blocked;
        later.disabled = applying;
        accept.textContent = applying ? 'جارٍ التحديث…' : 'تحديث الآن';
        accept.setAttribute('aria-busy', String(applying));
        dialog.setAttribute('aria-busy', String(applying));
        message.textContent = applying ? 'جارٍ تحديث التطبيق…' : blocked
            ? 'يكتمل التنزيل أولاً، ثم يمكنك التحديث.'
            : 'يتوفر إصدار جديد من التطبيق. هل تريد التحديث الآن؟';
    }
    function reload() {
        if (reloading) return;
        reloading = true;
        clearTimeout(activationTimer);
        window.SuiteWelcome?.skipNextLoad();
        location.reload();
    }
    function checkController() {
        const controller = navigator.serviceWorker.controller;
        if (controller?.scriptURL !== workerURL) return;
        // Object identity matters: old and new releases have the same script URL.
        if (controlled && controller !== currentController) { reload(); return; }
        if (!controlled) {
            controlled = true;
            currentController = controller;
            settings?.onFirstControl?.();
            showAvailable();
        }
    }
    function checkActivation() {
        checkController();
        if (!applying || reloading || !activationWorker) return;
        if (activationWorker.state === 'redundant') { failUpdate(); return; }
        if (registration.active === activationWorker && activationWorker.state === 'activated') reload();
    }
    function failUpdate() {
        clearTimeout(activationTimer);
        activationWorker?.removeEventListener('statechange', checkActivation);
        activationWorker = null;
        applying = false;
        errorText.textContent = 'تعذر إكمال التحديث. اضغط تحديث الآن لإعادة المحاولة.';
        errorText.hidden = false;
        renderControls();
        // Return the current release's downloader to a usable state after failure.
        try { void window.VSSOffline?.resumeAfterUpdate?.()?.catch(() => {}); } catch {}
    }
    async function applyUpdate() {
        if (applying || (busy && !window.VSSOffline?.prepareUpdate)) return;
        applying = true;
        errorText.hidden = true;
        renderControls();
        activationTimer = setTimeout(() => { checkActivation(); if (applying && !reloading) failUpdate(); }, 20000);
        try {
            // Quiesce the old VSS worker while retaining the saved download request.
            await window.VSSOffline?.prepareUpdate?.();
            if (!applying || reloading) return;
            activationWorker = registration.waiting || offeredWorker;
            if (!activationWorker || !['installed', 'activating', 'activated'].includes(activationWorker.state)) throw new Error('Update unavailable');
            activationWorker.addEventListener('statechange', checkActivation);
            checkActivation();
            if (applying && !reloading && activationWorker?.state === 'installed') {
                activationWorker.postMessage({ type: settings.command || 'ACTIVATE_UPDATE' });
            }
        } catch { if (!reloading) failUpdate(); }
    }
    function watch(next, options = {}) {
        if (registration) return;
        registration = next;
        settings = options;
        controlled = !!navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL === workerURL;
        currentController = controlled ? navigator.serviceWorker.controller : null;
        dialog = document.createElement('dialog');
        dialog.className = 'app-update-dialog';
        dialog.id = options.dialogId || 'app-update-dialog';
        dialog.hidden = true;
        dialog.setAttribute('aria-labelledby', 'app-update-title');
        dialog.setAttribute('aria-describedby', 'app-update-message');
        dialog.innerHTML = '<h2 id="app-update-title">تحديث جديد</h2><p id="app-update-message" role="status" aria-live="polite">يتوفر إصدار جديد من التطبيق. هل تريد التحديث الآن؟</p><div class="app-update-actions"><button type="button" data-update-accept>تحديث الآن</button><button type="button" data-update-later>لاحقًا</button></div><p data-update-error role="alert" hidden></p>';
        document.body.append(dialog);
        accept = dialog.querySelector('[data-update-accept]');
        accept.id = options.buttonId || 'apply-app-update';
        later = dialog.querySelector('[data-update-later]');
        message = dialog.querySelector('#app-update-message');
        errorText = dialog.querySelector('[data-update-error]');
        renderControls();
        later.addEventListener('click', () => { if (!applying) dialog.close(); });
        dialog.addEventListener('cancel', event => { if (applying) event.preventDefault(); });
        dialog.addEventListener('close', () => { dialog.hidden = true; });
        accept.addEventListener('click', () => { void applyUpdate(); });
        navigator.serviceWorker.addEventListener('controllerchange', checkController);
        registration.addEventListener('updatefound', () => watchWorker(registration.installing));
        watchWorker(registration.installing);
        showAvailable();
        window.addEventListener('online', check);
        window.addEventListener('pageshow', check);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) void check(); });
        setInterval(check, 5 * 60 * 1000);
        if (controlled) void check();
    }
    window.addEventListener('suite-welcome-done', showAvailable);
    window.AppUpdates = { watch, ready, setBusy(value) { busy = value; renderControls(); } };
})();
