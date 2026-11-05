/* Device-local child profiles, independent skill evidence, and a resumable game plan. */
((root) => {
    'use strict';
    const STORAGE = 'voc-children-v1';
    const modes = ['matching', 'memory', 'rapid', 'test'];
    const difficulties = ['easy', 'moderate', 'advanced'];
    // Listening difficulty is the actual choice count; naming uses the response timer.
    function assessmentDifficulty(domain, settings, poolSize) {
        const index = domain === 'receptive'
            ? (poolSize >= settings.level ? [2, 4, 6].indexOf(settings.level) : -1)
            : domain === 'expressive' ? [6, 4, 2].indexOf(settings.duration) : -1;
        return difficulties[index] || null;
    }
    function create(storage, onError = () => {}) {
        const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
        const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
        const read = () => {
            try { const saved = JSON.parse(storage.getItem(STORAGE)); if (saved?.schema === 1 && Array.isArray(saved.children)) return saved; } catch {}
            return null;
        };
        let data = read() || { schema: 1, active: null, children: [] };
        let baseline = clone(data);
        let resetEpochs = { ...data.accountResets };
        let storageOK = true;
        const persist = (activate = false) => {
            let localActive = data.active;
            const merged = read() || { schema: 1, active: null, children: [] };
            if (merged.deletedChildren?.[localActive]) localActive = null;
            if ((merged.accountResets?.[localActive] || null) !== (resetEpochs[localActive] || null)) return false;
            // SENB owns child.senb. Never replace it with a stale VOC tab's copy.
            for (const child of data.children) {
                if((merged.accountResets?.[child.id]||null)!==(resetEpochs[child.id]||null))continue;
                if (merged.deletedChildren?.[child.id]) continue;
                const before = baseline.children.find(saved => saved.id === child.id);
                let saved = merged.children.find(entry => entry.id === child.id);
                if (!saved) { merged.children.push(clone(child)); continue; }
                for (const field of ['name', 'role', 'created', 'apps', 'words', 'workspace', 'plan', 'sessions', 'homeLesson', 'wordLevels']) {
                    if (same(child[field], before?.[field])) continue;
                    if (field === 'apps') { saved.apps = { ...saved.apps, ...Object.fromEntries(Object.entries(child.apps || {}).filter(([, value]) => value === true)) }; }
                    else if (field === 'words') {
                        saved.words ||= {};
                        for (const [key, word] of Object.entries(child.words || {})) {
                            saved.words[key] ||= {};
                            for (const [domain, result] of Object.entries(word)) if (!same(result, before?.words?.[key]?.[domain])) {
                                // Separate tabs may earn different levels of the same skill.
                                const levels = { ...saved.words[key][domain]?.levels, ...result.levels };
                                saved.words[key][domain] = { ...clone(result), levels, passed: difficulties.every(level => levels[level] === true) };
                            }
                        }
                    } else if (field === 'wordLevels') {
                        saved.wordLevels ||= {};
                        for (const [id, level] of Object.entries(child.wordLevels || {})) if (!same(level, before?.wordLevels?.[id])) saved.wordLevels[id] = clone(level);
                    } else if (field === 'sessions') {
                        const sessions = new Map((saved.sessions || []).map(session => [session.id, session]));
                        for (const session of child.sessions || []) {
                            const prior = sessions.get(session.id);
                            if (!prior || prior.partial && (!session.partial || session.records.length > prior.records.length)) sessions.set(session.id, clone(session));
                        }
                        saved.sessions = [...sessions.values()];
                    } else saved[field] = clone(child[field]);
                }
            }
            // Only an explicit sign-in changes the shared active child.
            if (activate || !merged.active) merged.active = localActive;
            try {
                storage.setItem(STORAGE, JSON.stringify(merged)); storageOK = true;
                data = { ...merged, active: localActive }; baseline = clone(data); return true;
            } catch { storageOK = false; onError(); return false; }
        };
        // Preserve old word summaries without inventing a historical session log.
        for (const child of data.children) {
            child.words ||= {};
            child.role = child.name?.toLocaleLowerCase() === 'hamada' ? 'admin' : 'child';
            if (!Array.isArray(child.sessions)) {
                child.sessions = [];
                for (const [key, word] of Object.entries(child.words)) for (const domain of ['receptive', 'expressive']) {
                    const result = word[domain];
                    if (result?.date && result.total > 0) child.sessions.push({ id: `legacy-${key}-${domain}`, date: result.date, source: 'saved', domain, kind: 'snapshot', legacy: true,
                        records: [{ key, correct: result.correct, total: result.total }] });
                }
            }
            child.created ||= child.sessions.map(session => session.date).filter(Boolean).sort()[0] || null;
        }
        if (!data.children.some(child => child.role === 'admin')) data.children.push({ id: 'hamada-admin', name: 'Hamada', role: 'admin', created: new Date().toISOString(), words: {}, workspace: null, plan: null, sessions: [] });
        const active = () => data.children.find(child => child.id === data.active) || null;
        const isAdmin = () => active()?.role === 'admin';
        const key = item => typeof item === 'string' ? item : `${item.catId}_${item.id}`;
        const mastered = (item, domain) => {
            const word = !isAdmin() && active()?.words[key(item)];
            const passed = skill => difficulties.every(level => word?.[skill]?.levels?.[level] === true);
            return domain ? ['receptive', 'expressive'].includes(domain) && passed(domain) : passed('receptive') && passed('expressive');
        };
        const inLibrary = (item, domain = null, learningDomain = null) => domain
            ? mastered(item, domain) : !mastered(item, learningDomain);
        const sameKeys = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');
        const wordLevelCompleted = level => {
            const saved = active()?.wordLevels?.[level?.id];
            return !isAdmin() && saved?.completed === true && sameKeys(saved.keys, level?.keys);
        };
        const wordLevelUnlocked = level => {
            if (!level || !active()) return false;
            if (isAdmin() || !level.previousId) return true;
            const previous = active().wordLevels?.[level.previousId];
            return previous?.completed === true && sameKeys(previous.keys, level.previousKeys);
        };
        function completeWordLevel(level, records, completed = false) {
            if (!completed || !active() || isAdmin() || !level || typeof level.id !== 'string' || !Array.isArray(level.keys) || level.keys.length < 2 || !wordLevelUnlocked(level)) return false;
            const workspace = active().workspace;
            if (workspace?.wordLevel?.id !== level.id || !sameKeys(workspace.slots?.filter(Boolean), level.keys)) return false;
            if (!Array.isArray(records) || !records.length || records.some(record => !level.keys.includes(record.key) || record.correct !== true)
                || !level.keys.every(key => records.some(record => record.key === key))) return false;
            active().wordLevels ||= {};
            active().wordLevels[level.id] = { completed: true, keys: [...level.keys], categoryId: level.categoryId, date: new Date().toISOString() };
            return persist();
        }
        function signIn(name) {
            const resetData=read();
            if(JSON.stringify(resetData?.accountResets||{})!==JSON.stringify(resetEpochs)){data=resetData||data;baseline=clone(data);resetEpochs={...data.accountResets};}

            data.children = data.children.filter(child => !read()?.deletedChildren?.[child.id]);
            name = String(name || '').normalize('NFKC').trim().replace(/\s+/g, ' ').slice(0, 60);
            if (!name) return null;
            // Reuse identities created in an already-open SENB tab.
            for (const child of read()?.children || []) if (!data.children.some(saved => saved.id === child.id)) data.children.push(clone(child));
            let child = data.children.find(c => c.name.toLocaleLowerCase() === name.toLocaleLowerCase());
            if (!child) { child = { id: root.crypto?.randomUUID?.() || `child-${Date.now()}-${Math.random().toString(36).slice(2)}`, name, role: 'child', apps: { voc: true }, created: new Date().toISOString(), words: {}, workspace: null, plan: null, sessions: [] }; data.children.push(child); }
            child.apps = { ...child.apps, voc: true, senb: true, taffaha: true };
            data.active = child.id; persist(true); return active();
        }
        function record(domain, records, difficulty = null) {
            if (!['receptive', 'expressive'].includes(domain) || !active() || isAdmin()) return;
            const groups = new Map();
            for (const entry of records) { const k = key(entry.key); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(entry.correct === true); }
            for (const [k, results] of groups) {
                const word = active().words[k] ||= {};
                const correct = results.filter(Boolean).length;
                const levels = { ...word[domain]?.levels };
                if (difficulties.includes(difficulty) && correct === results.length) levels[difficulty] = true;
                word[domain] = { levels, passed: difficulties.every(level => levels[level] === true),
                    percentage: Math.round(correct / results.length * 100), correct, total: results.length, date: new Date().toISOString() };
            }
            persist();
        }
        function logSession(session) {
            const child = active();
            if (!child || !session.id) return;
            const index = child.sessions.findIndex(saved => saved.id === session.id);
            const entry = { ...session, date: session.date || new Date().toISOString(), records: (session.records || []).map(record => ({ ...record })) };
            if (index < 0) child.sessions.push(entry);
            else if (child.sessions[index].partial && (!entry.partial || entry.records.length > child.sessions[index].records.length)) child.sessions[index] = entry;
            else return;
            persist();
        }
        function startPlan(keys, difficulty, games) {
            if (!active()) return null;
            keys = [...new Set(keys)];
            games = modes.filter(mode => games.includes(mode));
            if (!keys.length || !games.length) return null;
            const rank = ['easy', 'moderate', 'advanced'].indexOf(difficulty);
            const level = [2, 4, 6][Math.max(0, rank)];
            const rounds = [];
            for (const mode of games) {
                // A small memory board can span several rounds without dropping any workplace cards.
                const batches = mode === 'memory' ? Array.from({ length: Math.ceil(keys.length / level) }, (_, i) => keys.slice(i * level, (i + 1) * level)) : [keys];
                for (const pool of batches) rounds.push({ mode, keys: pool, settings: { level, length: keys.length, duration: [6, 4, 2][Math.max(0, rank)], labels: false, sound: mode !== 'rapid', fixedPool: true } });
            }
            active().plan = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, difficulty, keys, rounds, position: 0 }; persist(); return active().plan;
        }
        const currentRound = () => { const plan = active()?.plan; return plan?.rounds?.[plan.position] || null; };
        function advancePlan(planId, position, evidence = null) {
            const plan = active()?.plan;
            if (!plan || plan.id !== planId || plan.position !== position) return null;
            plan.evidence ||= [];
            if (evidence && ['receptive', 'expressive'].includes(evidence.domain)) plan.evidence.push({ domain: evidence.domain, records: evidence.records.filter(record => plan.keys.includes(record.key)).map(record => ({ key: record.key, correct: record.correct === true })) });
            plan.position++;
            if (plan.position >= plan.rounds.length) {
                active().homeLesson = { planId: plan.id, date: new Date().toISOString(), keys: [...plan.keys], evidence: plan.evidence };
                active().plan = null;
            }
            persist(); return currentRound();
        }
        return { key, active, isAdmin, mastered, inLibrary, assessmentDifficulty, wordLevelCompleted, wordLevelUnlocked, completeWordLevel, signIn, record, logSession, startPlan, currentRound, advancePlan, storageOK: () => storageOK,
            children: () => data.children.map(({ id, name, role }) => ({ id, name, role })),
            reportChildren: id => {
                if (!active()) return [];
                if (!isAdmin()) id = active().id;
                let children = data.children;
                try { const latest = JSON.parse(storage.getItem(STORAGE)); if (Array.isArray(latest?.children)) children = latest.children; } catch {}
                return children.filter(child => child.role !== 'admin' && child.name?.toLocaleLowerCase() !== 'hamada' && (!id || child.id === id)).map(child => JSON.parse(JSON.stringify({ ...child, sessions: Array.isArray(child.sessions) ? child.sessions : data.children.find(saved => saved.id === child.id)?.sessions || [] })));
            },
            scope: name => active() ? `${name}-child-${active().id}${data.accountResets?.[active().id]?`-reset-${data.accountResets[active().id]}`:''}` : name,
            saveWorkspace: workspace => { if (active()) { active().workspace = workspace; persist(); } },
            cancelPlan: () => { if (active()) { active().plan = null; persist(); } },
            planURL: () => currentRound() ? `${currentRound().mode}.html?plan=1` : 'index.html?workplace=1' };
    }
    const api = { create, STORAGE };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root.document) {
        let storage; try { storage = root.localStorage; } catch { storage = { getItem() {}, setItem() { throw new Error('unavailable'); } }; }
        root.VocProgress = create(storage, () => root.dispatchEvent(new Event('voc-storage-error')));
        root.addEventListener('storage', event => {
            if (event.key !== STORAGE || !event.newValue) return;
            let latest; try { latest = JSON.parse(event.newValue); } catch { return; }
            if (latest?.active && latest.active !== root.VocProgress.active()?.id) {
                root.dispatchEvent(new Event('voc-profile-beforechange'));
                root.location.reload();
            }
        });
    }
})(globalThis);
