/* The clinic's online database (Firebase project speech-clinic), for the therapist's own pages: the reports page
 * (tools/accounts) and the assessment forms on the speech website. Identical copies live in both places.
 * The therapist signs in once with their Google account; the database rules let only that account read and change
 * everything (devices that joined the clinic get their own, narrower access). Nothing else on the site uses it.
 *
 *   await SpeechCloud.signIn()                  Google sign-in (a window opens once; the site remembers it)
 *   SpeechCloud.onUser(user => …)               called with the signed-in user or null
 *   await SpeechCloud.children()                every child: { id, name, birth, gender, code, apps, created, updated }
 *   await SpeechCloud.assessments(childId)      the child's saved assessments
 *   await SpeechCloud.saveAssessment(details)   saves a finished form under the right child (see below)
 *
 * Children: each has a random document id and a 6-digit code (e.g. 482-913, the last digit checks the others),
 * the number parents will type. Firebase's web settings are not secret; access is decided by the database rules. */
((root) => {
    'use strict';
    const VERSION = '13.4.0', BASE = `https://www.gstatic.com/firebasejs/${VERSION}/`;
    const CONFIG = {
        apiKey: 'AIzaSyCkKI0KqGy6EeJRkRsR2T71VvT5waraDeY',
        authDomain: 'speech-clinic.firebaseapp.com',
        projectId: 'speech-clinic',
        storageBucket: 'speech-clinic.firebasestorage.app',
        messagingSenderId: '81493283329',
        appId: '1:81493283329:web:eaefcee2183ca173342600'
    };
    let loading = null;
    // Loads Firebase only when a page first needs it.
    function load() {
        return loading ||= (async () => {
            const [app, auth, store] = await Promise.all(['firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js'].map(file => import(BASE + file)));
            const firebase = app.getApps().length ? app.getApp() : app.initializeApp(CONFIG);
            return { auth, store, a: auth.getAuth(firebase), db: store.getFirestore(firebase) };
        })().catch(error => { loading = null; throw error; });
    }
    const listeners = new Set();
    let current;
    async function watch() {
        const { auth, a } = await load();
        auth.onAuthStateChanged(a, user => { current = user && !user.isAnonymous ? user : null; listeners.forEach(fn => fn(current)); });
    }
    function onUser(fn) { listeners.add(fn); if (current !== undefined) fn(current); watch().catch(() => fn(null)); return () => listeners.delete(fn); }
    async function signIn() {
        const { auth, a } = await load(), provider = new auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try { return (await auth.signInWithPopup(a, provider)).user; }
        catch (error) {
            if (/popup-blocked|operation-not-supported/.test(error?.code || '')) { await auth.signInWithRedirect(a, provider); return null; }
            throw error;
        }
    }
    async function signOut() { const { auth, a } = await load(); await auth.signOut(a); }
    async function user() { const { a } = await load(); await a.authStateReady?.(); return a.currentUser && !a.currentUser.isAnonymous ? a.currentUser : null; }
    // A friendly message for the errors a therapist can meet.
    function explain(error) {
        const code = String(error?.code || '');
        if (code.includes('permission-denied')) return 'هذا الحساب ليس حساب العيادة. سجّل الدخول بحساب Google الخاص بالعيادة.';
        if (code.includes('popup-closed')) return 'أُغلقت نافذة تسجيل الدخول.';
        if (code.includes('unavailable') || code.includes('network')) return 'لا يوجد اتصال بالإنترنت. أعد المحاولة عند الاتصال.';
        if (code.includes('unauthorized-domain')) return 'هذا العنوان غير مسموح في إعدادات Firebase (Authorized domains).';
        return 'تعذّر الاتصال بقاعدة البيانات. أعد المحاولة.';
    }

    // ---- Children ----
    const normalizeName = name => String(name || '').normalize('NFKC').replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
    // Six digits: five random ones and a check digit, so a mistyped number is noticed.
    const checkDigit = five => String([...five].reduce((sum, digit, index) => sum + Number(digit) * (index % 2 ? 3 : 1), 0) * 7 % 10);
    const validCode = code => /^\d{6}$/.test(code = String(code).replace(/\D/g, '')) && checkDigit(code.slice(0, 5)) === code[5];
    const formatCode = code => String(code).replace(/\D/g, '').replace(/^(\d{3})(\d{3})$/, '$1-$2');
    function newCode(taken) {
        for (;;) {
            const five = Array.from(crypto.getRandomValues(new Uint8Array(5)), byte => byte % 10).join(''), code = five + checkDigit(five);
            if (!taken.has(code)) return code;
        }
    }
    async function children() {
        const { store, db } = await load();
        const snap = await store.getDocs(store.collection(db, 'children'));
        return snap.docs.map(entry => ({ id: entry.id, ...entry.data() })).filter(child => !child.removed);
    }
    async function assessments(childId) {
        const { store, db } = await load();
        const snap = await store.getDocs(store.collection(db, 'children', childId, 'assessments'));
        return snap.docs.map(entry => ({ id: entry.id, ...entry.data() })).sort((a, b) => String(a.date || a.created).localeCompare(String(b.date || b.created)));
    }
    /** Finds the child a form belongs to: the remembered child id, else one with the same name (and birth date when both
     *  are known), else a new child with a new code. Returns { child, created }. */
    async function childFor({ id, name, birth, gender }) {
        const { store, db } = await load(), list = await children();
        let child = id && list.find(entry => entry.id === id);
        if (!child) {
            const same = list.filter(entry => normalizeName(entry.name) === normalizeName(name) && (!birth || !entry.birth || entry.birth === birth));
            child = same.find(entry => birth && entry.birth === birth) || same.sort((a, b) => String(b.updated || '').localeCompare(String(a.updated || '')))[0];
        }
        const now = new Date().toISOString();
        if (child) {
            const changes = { updated: now, ...(birth && !child.birth ? { birth } : {}), ...(gender && !child.gender ? { gender } : {}) };
            await store.setDoc(store.doc(db, 'children', child.id), changes, { merge: true });
            return { child: { ...child, ...changes }, created: false };
        }
        const ref = store.doc(store.collection(db, 'children')), code = newCode(new Set(list.map(entry => entry.code)));
        const fresh = { name: String(name).trim(), code, apps: [], created: now, updated: now, ...(birth ? { birth } : {}), ...(gender ? { gender } : {}) };
        await store.setDoc(ref, fresh);
        return { child: { id: ref.id, ...fresh }, created: true };
    }
    /** Saves one finished assessment. details: { form, title, date, examiner, child: { id?, name, birth?, gender? },
     *  sections: [{ title, items: [{ label, value }] }], assessmentId? }. Saving again with the same assessmentId
     *  replaces that assessment. Returns { child, created, assessmentId }. */
    async function saveAssessment(details) {
        if (!String(details.child?.name || '').trim()) throw Object.assign(Error('name'), { code: 'name' });
        const { store, db } = await load();
        const { child, created } = await childFor(details.child);
        const ref = details.assessmentId ? store.doc(db, 'children', child.id, 'assessments', details.assessmentId) : store.doc(store.collection(db, 'children', child.id, 'assessments'));
        const sections = (details.sections || []).map(section => ({ title: String(section.title || ''), items: (section.items || []).map(item => ({ label: String(item.label || ''), value: String(item.value ?? '') })) }));
        await store.setDoc(ref, { form: details.form, title: details.title, date: details.date || null, examiner: details.examiner || '', sections, saved: new Date().toISOString() });
        return { child, created, assessmentId: ref.id };
    }
    root.SpeechCloud = { load, onUser, signIn, signOut, user, explain, children, assessments, saveAssessment, childFor, normalizeName, formatCode, validCode, checkDigit };
})(globalThis);
