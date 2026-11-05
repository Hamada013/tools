(() => {
    'use strict';
    const P = window.VocProgress;
    function init() {
        const dialog = document.createElement('dialog'); dialog.className = 'voc-dialog'; dialog.id = 'child-dialog';
        dialog.setAttribute('aria-labelledby', 'child-title');
        dialog.innerHTML = `<div class="voc-dialog-heading"><h2 id="child-title">ملف الطفل</h2><button type="button" class="voc-choice voc-icon" id="admin-all-report" aria-label="تقرير جميع الأطفال" title="تقرير جميع الأطفال" hidden><i class="fas fa-chart-bar" aria-hidden="true"></i></button></div><form><label for="child-name">اسم الطفل</label><input id="child-name" name="name" autocomplete="off" maxlength="60" required><div id="saved-children" class="voc-choices"></div><footer><button type="button" class="voc-choice" id="child-close">إغلاق</button><button class="voc-action" type="submit">دخول</button></footer></form>`;
        document.body.append(dialog);
        let authorized = false, opening = false;
        const enter = name => {
            name = String(name).normalize('NFKC').trim().replace(/\s+/g, ' ').slice(0, 60);
            if (!name) { dialog.querySelector('input').focus(); return; }
            if (P.active()?.name.toLocaleLowerCase() === name.toLocaleLowerCase()) { window.AppNavigation?.register(); dialog.close(); return; }
            if (!authorized) return;
            authorized = false;
            window.dispatchEvent(new Event('voc-profile-beforechange'));
            const previous = P.active()?.id;
            if (!P.signIn(name)) return;
            window.AppNavigation?.register();
            if (previous !== P.active().id && P.storageOK()) { window.SuiteWelcome?.skipNextLoad(); location.reload(); }
            else {
                dialog.close();
                document.querySelectorAll('[data-child-profile]').forEach(button => { button.querySelector('span').textContent = P.active().name; button.setAttribute('aria-label', `ملف الطفل: ${P.active().name}`); });
                document.querySelectorAll('[data-child-report]').forEach(report => { report.disabled = !P.active(); report.setAttribute('aria-label', P.isAdmin() ? 'تقرير جميع الأطفال' : 'تقرير الطفل'); report.title = report.getAttribute('aria-label'); });
                window.dispatchEvent(new Event('voc-profile-memorychange'));
            }
        };
        const open = async (requestedName) => {
            if (opening || dialog.open) return;
            opening = true; authorized = false;
            window.dispatchEvent(new Event('voc-profile-open'));
            const owner = P.active()?.id || null;
            const needsGate = !!owner || P.children().some(child => child.role !== 'admin');
            try {
                if (needsGate && !await (window.ChildAccountGate?.request() || Promise.resolve(false))) return;
                if (owner !== (P.active()?.id || null)) return;
                authorized = true;
                dialog.querySelector('#child-name').value = typeof requestedName === 'string' ? requestedName : P.active()?.name || '';
                dialog.querySelector('#child-close').hidden = !P.active();
                dialog.querySelector('#child-title').textContent = P.isAdmin() ? 'Hamada' : 'ملف الطفل';
                dialog.querySelector('#admin-all-report').hidden = !P.isAdmin();
                const savedChildren = dialog.querySelector('#saved-children');
                window.SuiteAccounts.render(savedChildren,P.children(),child=>{
                    const button=document.createElement('button');button.type='button';button.className='voc-choice';button.textContent=child.name;button.onclick=()=>enter(child.name);
                    const actions=[];
                    if(P.isAdmin()){
                        const report=document.createElement('button');report.type='button';report.className='voc-choice voc-icon';report.dataset.reportChild=child.id;report.setAttribute('aria-label',`تقرير ${child.name}`);report.title=`تقرير ${child.name}`;report.innerHTML='<i class="fas fa-chart-bar" aria-hidden="true"></i>';report.onclick=()=>{dialog.close();window.VocReports.open(child.id);};actions.push(report);
                    }
                    return window.SuiteAccounts.row(child,button,actions);
                });
                dialog.showModal();
            } finally { opening = false; }
        };
        dialog.querySelector('#admin-all-report').addEventListener('click', () => { dialog.close(); window.VocReports.open(); });
        dialog.querySelector('form').addEventListener('submit', event => { event.preventDefault(); enter(dialog.querySelector('input').value); });
        dialog.querySelector('#child-close').addEventListener('click', () => { if (P.active()) dialog.close(); });
        dialog.addEventListener('close', () => { authorized = false; });
        dialog.addEventListener('cancel', event => { if (!P.active()) event.preventDefault(); });
        for (const host of document.querySelectorAll('.app-home-tools, #workplace-view > header, .game-header')) {
            const button = document.createElement('button'); button.type = 'button'; button.className = 'child-button'; button.dataset.childProfile = ''; if (P.isAdmin()) button.classList.add('admin-profile');
            button.setAttribute('aria-label', `ملف الطفل: ${P.active()?.name || 'دخول'}`);
            const icon = document.createElement('i'); icon.className = P.isAdmin() ? 'fas fa-user-shield' : 'fas fa-user'; icon.setAttribute('aria-hidden', 'true');
            const name = document.createElement('span'); name.textContent = P.active()?.name || 'اسم الطفل'; button.append(icon, name);
            button.addEventListener('click', open); host.append(button);
            const report = document.createElement('button'); report.type = 'button'; report.className = 'child-report-button'; report.dataset.childReport = '';
            report.setAttribute('aria-label', P.isAdmin() ? 'تقرير جميع الأطفال' : 'تقرير الطفل'); report.title = report.getAttribute('aria-label');
            report.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-4M9 2h6v4H9zM8 16v-3m4 3V9m4 7v-5"/></svg>';
            report.disabled = !P.active(); report.onclick = () => { window.dispatchEvent(new Event('voc-profile-open')); window.VocReports.open(); }; host.append(report);

        }
        if (P.currentRound() && !new URLSearchParams(location.search).has('plan')) {
            const resume = document.createElement('a'); resume.className = 'child-button'; resume.textContent = 'متابعة مسار الألعاب'; resume.href = P.planURL();
            document.querySelector('.app-home-tools, .game-header')?.append(resume);
        }
        window.VocProfile = { open };
        const welcoming=window.SuiteWelcome?.connect(P,name=>{authorized=true;enter(name);});
        if (!welcoming && !P.active() && !new URLSearchParams(location.search).has('reportChild') && !new URLSearchParams(location.search).has('createProfile')) open();
    }
    window.addEventListener('voc-storage-error', () => {
        if (document.querySelector('.voc-storage-error')) return;
        const alert = document.createElement('p'); alert.className = 'voc-storage-error'; alert.setAttribute('role', 'alert');
        alert.textContent = 'تعذّر حفظ التقدم على الجهاز. تحقق من مساحة التخزين وإعدادات المتصفح.'; document.body.append(alert);
    });
    document.addEventListener('DOMContentLoaded', init);
})();
