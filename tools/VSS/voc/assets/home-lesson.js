/* Reusable Arabic take-home note. Results come only from the completed plan. */
((root) => {
    'use strict';
    function text(name, lesson, items) {
        const byKey = new Map(items.map(item => [item.key, item.name]));
        const words = keys => keys.map(key => byKey.get(key)).filter(Boolean).join('، ');
        const lines = [`مرحباً، أنا ${name}! 🌷`, `اليوم اشتغلت على هالكلمات: ${words(lesson.keys)}.`, ''];
        for (const [domain, label] of [['receptive', 'فهم الكلمات'], ['expressive', 'تسمية الكلمات']]) {
            const records = (lesson.evidence || []).filter(entry => entry.domain === domain).flatMap(entry => entry.records);
            const good = lesson.keys.filter(key => records.some(record => record.key === key) && records.filter(record => record.key === key).every(record => record.correct));
            const practice = lesson.keys.filter(key => records.some(record => record.key === key && !record.correct));
            const unseen = lesson.keys.filter(key => !records.some(record => record.key === key));
            lines.push(`${label}:`);
            if (good.length) lines.push(`كنت شاطر بهالكلمات: ${words(good)}.`);
            if (practice.length) lines.push(`وهالكلمات لسه عم أتعلّمها وبحتاج مساعدتكم فيها: ${words(practice)}.`);
            if (unseen.length) lines.push(`ما سجّلنا استجابة لهالكلمات اليوم: ${words(unseen)}.`);
            lines.push('');
        }
        const activity = root.SessionHomework?.homeActivity || (typeof module !== 'undefined' ? require('./session-homework.js').homeActivity : null);
        lines.push('ماما وبابا، خلّونا نلعب شوي بالبيت! 💛', activity('voc', lesson.keys.map(key => ({label:byKey.get(key)})).filter(item=>item.label)));
        return lines.join('\n');
    }
    function mount(items) {
        const P = root.VocProgress, lesson = P.active()?.homeLesson;
        if (!lesson || P.currentRound()) return;
        const host = document.querySelector('#workplace-view > header > div');
        if (!host) return;
        const button = document.createElement('button'); button.id = 'parents-lesson'; button.type = 'button'; button.className = 'child-button voc-icon';
        button.setAttribute('aria-label', 'درس البيت للأهل'); button.title = 'درس البيت للأهل';
        button.innerHTML = '<i class="fas fa-user-group" aria-hidden="true"></i>'; host.append(button);
        const dialog = document.createElement('dialog'); dialog.id = 'home-lesson-dialog'; dialog.className = 'voc-dialog home-lesson-dialog'; dialog.setAttribute('aria-labelledby', 'home-lesson-title');
        dialog.innerHTML = '<h2 id="home-lesson-title" tabindex="-1" autofocus>درسنا بالبيت</h2><textarea id="home-lesson-text" aria-label="رسالة للأهل، يمكنك تعديلها قبل المشاركة" dir="rtl"></textarea><p role="status" aria-live="polite"></p><footer><button type="button" class="voc-choice" data-close>إغلاق</button><button type="button" class="voc-choice" data-copy>نسخ</button><button type="button" class="voc-action" data-share>مشاركة</button></footer>';
        document.body.append(dialog);
        window.addEventListener('voc-profile-beforechange', () => { dialog.close(); dialog.remove(); button.remove(); }, { once: true });
        const input = dialog.querySelector('textarea'), status = dialog.querySelector('[role=status]');
        input.value = text(P.active().name, lesson, items);
        button.onclick = () => { status.textContent = ''; dialog.showModal(); input.scrollTop = 0; dialog.querySelector('h2').focus(); };
        dialog.querySelector('[data-close]').onclick = () => dialog.close();
        dialog.querySelector('[data-copy]').onclick = async () => {
            try { await navigator.clipboard.writeText(input.value); status.textContent = 'تم نسخ الرسالة.'; }
            catch { input.focus(); input.select(); status.textContent = 'حدّدنا الرسالة؛ يمكنك نسخها من هنا.'; }
        };
        dialog.querySelector('[data-share]').hidden = !navigator.share;
        dialog.querySelector('[data-share]').onclick = async () => {
            try { await navigator.share({ title: 'درسنا بالبيت', text: input.value }); }
            catch (error) { if (error.name !== 'AbortError') status.textContent = 'تعذّرت المشاركة. يمكنك نسخ الرسالة.'; }
        };
    }
    if (typeof module !== 'undefined' && module.exports) module.exports = { text };
    root.VocHomeLesson = { text, mount };
})(globalThis);
