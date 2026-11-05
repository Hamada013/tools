(() => {
    'use strict';
    const P = window.SenbProgress;
    if (!P) return;
    const profileIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg>';
    function init() {
        const dialog = document.createElement('dialog');
        dialog.id = 'senb-child-dialog'; dialog.className = 'senb-child-dialog'; dialog.setAttribute('aria-labelledby', 'senb-child-title');
        dialog.innerHTML = '<h2 id="senb-child-title">ملف الطفل</h2><form><label for="senb-child-name">اسم الطفل</label><input id="senb-child-name" name="name" autocomplete="off" maxlength="60" required><div class="senb-saved-children"></div><footer><button type="button" data-child-close>إغلاق</button><button type="submit" class="senb-child-enter">دخول</button></footer></form>';
        document.body.append(dialog);
        const input = dialog.querySelector('input');
        let authorized = false, opening = false;
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'senb-child-button'; button.dataset.senbChildProfile = '';
        button.innerHTML = `${profileIcon}<span></span>`;
        const update = () => {
            const name = P.active()?.name || 'اسم الطفل';
            button.querySelector('span').textContent = name;
            button.setAttribute('aria-label', `ملف الطفل: ${name}`);
            button.title = `ملف الطفل: ${name}`;
        };
        update();
        document.querySelector('.header-actions.app-home-tools, .app-home-tools')?.append(button);
        const enter = name => {
            name = String(name || '').normalize('NFKC').trim().replace(/\s+/g, ' ').slice(0, 60);
            if (!name) { input.focus(); return; }
            if (P.active()?.name.toLocaleLowerCase() === name.toLocaleLowerCase()) { window.AppNavigation?.register(); dialog.close(); return; }
            if (!authorized) return;
            authorized = false;
            window.dispatchEvent(new Event('senb-profile-beforechange'));
            const previous = P.active()?.id;
            if (!P.signIn(name)) return;
            window.AppNavigation?.register();
            if (previous !== P.active().id && P.storageOK()) { window.SuiteWelcome?.skipNextLoad(); location.reload(); }
            else {
                dialog.close(); update();
                window.dispatchEvent(new Event('senb-profile-memorychange'));
            }
        };
        const open = async (requestedName) => {
            if (opening || dialog.open) return;
            opening = true; authorized = false;
            window.dispatchEvent(new Event('senb-profile-open'));
            const owner = P.active()?.id || null;
            const needsGate = !!owner || P.children().some(child => child.role !== 'admin');
            try {
                if (needsGate && !await (window.ChildAccountGate?.request() || Promise.resolve(false))) return;
                if (owner !== (P.active()?.id || null)) return;
                authorized = true;
                input.value = typeof requestedName === 'string' ? requestedName : P.active()?.name || '';
                dialog.querySelector('[data-child-close]').hidden = !P.active();
                const savedChildren = dialog.querySelector('.senb-saved-children');
                const admin = P.active()?.role === 'admin';
                dialog.querySelector('#senb-child-title').textContent=admin?'Hamada':'ملف الطفل';
                window.SuiteAccounts.render(savedChildren,P.children(),child=>{
                    const saved=document.createElement('button');saved.type='button';saved.textContent=child.name;saved.onclick=()=>enter(child.name);
                    return window.SuiteAccounts.row(child,saved);
                });
                if (!dialog.open) dialog.showModal();
                input.focus(); input.select();
            } finally { opening = false; }
        };
        button.addEventListener('click', open);
        dialog.querySelector('form').addEventListener('submit', event => { event.preventDefault(); enter(input.value); });
        dialog.querySelector('[data-child-close]').addEventListener('click', () => { if (P.active()) dialog.close(); });
        dialog.addEventListener('close', () => { authorized = false; });
        dialog.addEventListener('cancel', event => { if (!P.active()) event.preventDefault(); });
        /* Keep the shared active child consistent when either app changes it. */
        window.addEventListener('storage', event => {
            if (event.key !== 'voc-children-v1' || !event.newValue) return;
            let latest; try { latest = JSON.parse(event.newValue); } catch { return; }
            if (latest?.active && latest.active !== P.active()?.id) {
                window.dispatchEvent(new Event('senb-profile-beforechange'));
                location.reload();
            }
        });
        const homeTools = document.querySelector('#homeHeaderTools');
        if (homeTools) {
            const report = document.createElement('button'); report.type = 'button'; report.className = 'senb-child-tool app-home-icon';
            report.setAttribute('aria-label', 'تقرير الطفل'); report.title = 'تقرير الطفل';
            report.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-4M9 2h6v4H9zM8 16v-3m4 3V9m4 7v-5"/></svg>';
            report.addEventListener('click', () => window.SenbSessionReports?.openReport()); homeTools.append(report);
            const lesson = document.createElement('button'); lesson.type = 'button'; lesson.className = 'senb-child-tool app-home-icon';
            lesson.setAttribute('aria-label', 'تدريب العائلة'); lesson.title = 'تدريب العائلة';
            lesson.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="7" cy="6" r="3"/><circle cx="17" cy="6" r="3"/><circle cx="12" cy="13" r="2.5"/><path d="M2 18v-3a5 5 0 0 1 7-4m13 7v-3a5 5 0 0 0-7-4m-8 11v-2a5 5 0 0 1 10 0v2"/></svg>';
            lesson.addEventListener('click', () => window.SenbSessionReports?.openLesson()); homeTools.append(lesson);
            const refresh = () => { lesson.hidden = !P.lesson(); report.disabled = !P.active(); };
            refresh(); window.addEventListener('senb-progress-change', refresh); window.addEventListener('senb-profile-memorychange', refresh);
        }
        window.SenbProfile = { open };
        const welcoming=window.SuiteWelcome?.connect(P,name=>{authorized=true;enter(name);});
        if (!welcoming && !P.active() && !new URLSearchParams(location.search).has('reportChild') && !new URLSearchParams(location.search).has('createProfile')) open();
    }
    window.addEventListener('senb-storage-error', () => {
        if (document.querySelector('.senb-storage-error')) return;
        const alert = document.createElement('p'); alert.className = 'senb-storage-error'; alert.setAttribute('role', 'alert');
        alert.textContent = 'تعذّر حفظ التقدم على الجهاز. تحقق من مساحة التخزين وإعدادات المتصفح.';
        document.body.append(alert);
    });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
