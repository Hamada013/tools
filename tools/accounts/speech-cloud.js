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
        if (code === 'no-child') return 'هذا الطفل غير موجود في صفحة التقارير. أضفه أولاً بزر + في صفحة التقارير، ثم احفظ بالاسم نفسه.';
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
    async function childFor({ id, name, birth, gender }, create = true) {
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
        // Children are added only on the reports page (+); forms never create them (decided 2026-11-26).
        if (!create) throw Object.assign(Error('no child'), { code: 'no-child' });
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
        // Forms attach the assessment to a child already on the reports page; they never add children or apps.
        const { child, created } = await childFor(details.child, false);
        const ref = details.assessmentId ? store.doc(db, 'children', child.id, 'assessments', details.assessmentId) : store.doc(store.collection(db, 'children', child.id, 'assessments'));
        const sections = (details.sections || []).map(section => ({ title: String(section.title || ''), items: (section.items || []).map(item => ({ label: String(item.label || ''), value: String(item.value ?? '') })) }));
        await store.setDoc(ref, { form: details.form, title: details.title, date: details.date || null, examiner: details.examiner || '', sections, saved: new Date().toISOString() });
        return { child, created, assessmentId: ref.id };
    }
    // ---- Managing children and devices (reports page) ----
    /** A new child in the database (from a board that has none yet), with a new code. */
    async function createChild({ name, birth, gender }) { return (await childFor({ name, birth, gender })).child; }
    /** Which apps the child has: the apps on linked devices then offer the child in «أطفال من العيادة». */
    async function setApps(childId, apps) { const { store, db } = await load(); await store.setDoc(store.doc(db, 'children', childId), { apps: [...new Set(apps)], updated: new Date().toISOString() }, { merge: true }); }
    async function rename(childId, name) { const { store, db } = await load(); await store.setDoc(store.doc(db, 'children', childId), { name: String(name).trim(), updated: new Date().toISOString() }, { merge: true }); }
    /** Progress the apps sent: one entry per app and device, with the app's saved child record. */
    async function records(childId) {
        const { store, db } = await load();
        return (await store.getDocs(store.collection(db, 'children', childId, 'records'))).docs.map(entry => {
            const value = entry.data(); let child = null; try { child = JSON.parse(value.data); } catch {}
            return { id: entry.id, ...value, child };
        }).filter(entry => entry.child);
    }
    async function removeAssessment(childId, assessmentId) { const { store, db } = await load(); await store.deleteDoc(store.doc(db, 'children', childId, 'assessments', assessmentId)); }
    /** Deletes a child from the database with everything saved under them. The apps' own accounts on devices stay. */
    async function removeChild(childId) {
        const { store, db } = await load();
        for (const part of ['records', 'assessments']) for (const entry of (await store.getDocs(store.collection(db, 'children', childId, part))).docs) await store.deleteDoc(entry.ref);
        await store.deleteDoc(store.doc(db, 'children', childId));
    }
    // Join codes: 8 letters and digits without look-alikes (no 0/O, 1/I/L), valid for 7 days.
    const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    async function makeJoinCode({ all = false, children: ids = [], role = 'parents' } = {}) {
        const { store, db } = await load();
        const code = Array.from(crypto.getRandomValues(new Uint8Array(8)), byte => ALPHABET[byte % ALPHABET.length]).join('');
        const expires = new Date(Date.now() + 7 * 864e5);
        await store.setDoc(store.doc(db, 'joinCodes', code), { all: !!all, children: all ? [] : ids, role, created: new Date().toISOString(), expires });
        return { code, expires };
    }
    async function devices() { const { store, db } = await load(); return (await store.getDocs(store.collection(db, 'devices'))).docs.map(entry => ({ id: entry.id, ...entry.data() })); }
    async function removeDevice(uid) { const { store, db } = await load(); await store.deleteDoc(store.doc(db, 'devices', uid)); }
    // ---- Parents: the child's name and number open the apps until the account's end date ----
    // The ticket's id is a hash of name and number (the apps compute the same in assets/speech-sync.js).
    async function parentKey(name, code) {
        const bytes = new TextEncoder().encode(normalizeName(name) + '|' + String(code).replace(/\D/g, ''));
        return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
    }
    async function ticket(child) {
        if (!child.until) return;
        const { store, db } = await load();
        await store.setDoc(store.doc(db, 'joinCodes', await parentKey(child.name, child.code)), { all: false, children: [child.id], role: 'parents', created: new Date().toISOString(), expires: new Date(child.until) });
    }
    /** Sets how long the child's account is valid (3, 6, 9 or 12 months from today) and renews the parents' ticket. */
    async function setUntil(child, months) {
        const { store, db } = await load(), until = new Date(); until.setMonth(until.getMonth() + months);
        await store.setDoc(store.doc(db, 'children', child.id), { until: until.toISOString(), months, updated: new Date().toISOString() }, { merge: true });
        await ticket({ ...child, until: until.toISOString() });
        return until.toISOString();
    }
    root.SpeechCloud = { parentKey, ticket, setUntil, load, onUser, signIn, signOut, user, explain, children, assessments, saveAssessment, childFor, normalizeName, formatCode, validCode, checkDigit,
        createChild, setApps, rename, records, removeAssessment, removeChild, makeJoinCode, devices, removeDevice };
})(globalThis);
