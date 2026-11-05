/* SENB and vocabulary share child identities; each app owns its own progress. */
((root) => {
    'use strict';
    const STORAGE = 'voc-children-v1';
    const domains = ['receptive', 'expressive'];
    const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
    const empty = () => ({ schema: 1, active: null, children: [] });
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const normalizeName = name => String(name || '').normalize('NFKC').trim().replace(/\s+/g, ' ').slice(0, 60);
    function create(storage, onError = () => {}, onChange = () => {}) {
        const read = () => {
            try {
                const saved = JSON.parse(storage.getItem(STORAGE));
                return saved?.schema === 1 && Array.isArray(saved.children) ? saved : null;
            } catch { return null; }
        };
        let data = read() || empty();
        let baseline = clone(data);
        let resetEpochs = { ...data.accountResets };
        let storageOK = true;
        const active = () => data.children.find(child => child.id === data.active) || null;
        const state = child => {
            if (!child) return null;
            child.senb ||= {};
            child.senb.sessions ||= [];
            child.senb.mastery ||= {};
            return child.senb;
        };
        /* Read just before writing: an open VOC tab may have saved since this tab loaded. */
        function persist(activate = false) {
            let localActive = data.active;
            const merged = read() || empty();
            if (merged.deletedChildren?.[localActive]) localActive = null;
            if ((merged.accountResets?.[localActive] || null) !== (resetEpochs[localActive] || null)) return false;
            for (const child of data.children) {
                if((merged.accountResets?.[child.id]||null)!==(resetEpochs[child.id]||null))continue;
                if (merged.deletedChildren?.[child.id]) continue;
                const before = baseline.children.find(saved => saved.id === child.id);
                let saved = merged.children.find(entry => entry.id === child.id);
                if (!saved) { merged.children.push(clone(child)); continue; }
                for (const field of ['name', 'created', 'role', 'apps']) {
                    if (!same(child[field], before?.[field])) saved[field] = field === 'apps' ? { ...saved.apps, ...Object.fromEntries(Object.entries(child.apps || {}).filter(([, value]) => value === true)) } : clone(child[field]);
                }
                if (!same(child.senb, before?.senb)) {
                    saved.senb ||= {};
                    for (const [field, value] of Object.entries(child.senb || {})) {
                        if (same(value, before?.senb?.[field])) continue;
                        if (field === 'sessions') {
                            const sessions = new Map((saved.senb.sessions || []).map(session => [session.id, session]));
                            for (const session of value) {
                                const prior = sessions.get(session.id);
                                if (!prior || prior.partial && (!session.partial || attempted(session) >= attempted(prior))) sessions.set(session.id, clone(session));
                            }
                            saved.senb.sessions = [...sessions.values()];
                        } else if (field === 'mastery') {
                            saved.senb.mastery ||= {};
                            for (const [key, evidence] of Object.entries(value)) {
                                saved.senb.mastery[key] = { ...saved.senb.mastery[key], ...clone(evidence) };
                            }
                        } else saved.senb[field] = clone(value);
                    }
                }
            }
            if (activate) merged.active = localActive;
            try {
                storage.setItem(STORAGE, JSON.stringify(merged));
                storageOK = true;
                data = { ...merged, active: localActive };
                baseline = clone(data);
                onChange();
                return true;
            } catch {
                storageOK = false;
                onError();
                return false;
            }
        }
        function signIn(name) {
            const resetData=read();
            if(JSON.stringify(resetData?.accountResets||{})!==JSON.stringify(resetEpochs)){data=resetData||data;baseline=clone(data);resetEpochs={...data.accountResets};}

            data.children = data.children.filter(child => !read()?.deletedChildren?.[child.id]);
            name = normalizeName(name);
            if (!name) return null;
            /* A profile created in the other app must retain its existing identity. */
            const latest = read();
            const existing = latest?.children.find(child => normalizeName(child.name).toLocaleLowerCase() === name.toLocaleLowerCase());
            let child = data.children.find(entry => normalizeName(entry.name).toLocaleLowerCase() === name.toLocaleLowerCase());
            if (existing && !child) { child = clone(existing); data.children.push(child); }
            if (!child) {
                child = { id: root.crypto?.randomUUID?.() || `child-${Date.now()}-${Math.random().toString(36).slice(2)}`, name, apps: { senb: true }, role: name.toLocaleLowerCase() === 'hamada' ? 'admin' : 'child', created: new Date().toISOString(), words: {}, workspace: null, plan: null, sessions: [] };
                data.children.push(child);
            }
            child.apps = { ...child.apps, voc: true, senb: true, taffaha: true };
            state(child);
            data.active = child.id;
            persist(true);
            return active();
        }
        const attempted = session => (session.records || []).reduce((sum, record) => sum + (Number(record.total) || 0), 0);
        function logSession(session) {
            const child = active();
            if (!child || !session?.id) return null;
            const saved = state(child);
            const records = (Array.isArray(session.records) ? session.records : []).filter(record => record?.key && domains.includes(record.domain)).map(record => {
                const total = Math.max(0, Math.floor(Number(record.total) || 0));
                return { ...clone(record), key: String(record.key), title: String(record.title || ''),
                    entity: record.entity === 'word' ? 'word' : 'sentence', domain: record.domain,
                    presentation: record.presentation === 'advanced' ? 'advanced' : 'slots',
                    correct: Math.min(total, Math.max(0, Math.floor(Number(record.correct) || 0))), total };
            });
            const entry = { ...clone(session), id: String(session.id), date: session.date || new Date().toISOString(), kind: session.kind === 'assessment' ? 'assessment' : 'practice', partial: session.partial === true, records };
            const index = saved.sessions.findIndex(prior => prior.id === entry.id);
            if (index >= 0 && (!saved.sessions[index].partial || entry.partial && attempted(entry) < attempted(saved.sessions[index]))) return clone(saved.sessions[index]);
            if (index < 0) saved.sessions.push(entry);
            else saved.sessions[index] = entry;
            if (entry.kind === 'assessment' && !entry.partial) {
                const groups = new Map();
                for (const record of records) {
                    const id = JSON.stringify([record.key, record.domain]);
                    const group = groups.get(id) || { key: record.key, domain: record.domain, correct: 0, total: 0, title: record.title, entity: record.entity };
                    group.correct += record.correct; group.total += record.total; groups.set(id, group);
                }
                for (const group of groups.values()) {
                    if (!group.total || group.correct / group.total < .8) continue;
                    saved.mastery[group.key] ||= {};
                    saved.mastery[group.key][group.domain] = { passed: true, percentage: Math.round(group.correct / group.total * 100), correct: group.correct, total: group.total, date: entry.date, sessionId: entry.id, title: group.title, entity: group.entity };
                }
            }
            persist();
            return clone(entry);
        }
        const load = field => clone(active()?.senb?.[field] ?? null);
        const save = (field, value) => { if (!active()) return false; state(active())[field] = clone(value); return persist(); };
        return {
            active, signIn, logSession,
            children: () => data.children.map(({ id, name, role }) => ({ id, name, role })),
            workspace: () => load('workspace'), saveWorkspace: snapshot => save('workspace', snapshot),
            draft: () => load('draft'), saveDraft: draft => save('draft', draft),
            lesson: () => load('lesson'), saveLesson: lesson => save('lesson', lesson),
            sessions: () => clone(active()?.senb?.sessions || []),
            learned: (key, domain) => domains.includes(domain) && active()?.senb?.mastery?.[String(key)]?.[domain]?.passed === true,
            storageOK: () => storageOK
        };
    }
    const api = { create, STORAGE };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root.document) {
        let storage;
        try { storage = root.localStorage; } catch { storage = { getItem() {}, setItem() { throw Error('unavailable'); } }; }
        root.SenbProgress = create(storage, () => root.dispatchEvent(new Event('senb-storage-error')), () => root.dispatchEvent(new Event('senb-progress-change')));
    }
})(globalThis);
