// People and practice history. Everything stays in this browser; nothing is sent anywhere.
const KEY = 'fluency-flow-progress-v1';
const MAX_ENTRIES = 3000;
const DAY_MS = 86400000;
// A suggestion only: enough rated practice, mostly rated easy. The clinician decides.
export const READY_RATED = 5;
export const READY_EASY_SHARE = .7;

const empty = () => ({ schema: 1, active: null, people: [], entries: {} });
function valid(data) {
  return data?.schema === 1 && Array.isArray(data.people) && data.entries && typeof data.entries === 'object';
}
export function createStore(getStorage, now = () => Date.now()) {
  let saveFailed = false;
  let data = load();
  let snapshot = { ...data, saveFailed };
  const listeners = new Set();
  function storage() { try { return getStorage(); } catch { return null; } }
  function load() {
    try {
      const saved = JSON.parse(getStorage().getItem(KEY));
      return valid(saved) ? saved : empty();
    } catch { return empty(); }
  }
  function publish() {
    snapshot = { ...data, saveFailed };
    listeners.forEach(listener => listener());
  }
  function save() {
    try { storage().setItem(KEY, JSON.stringify(data)); saveFailed = false; } catch { saveFailed = true; }
    publish();
  }
  function reload() { if (!saveFailed) data = load(); }
  function newId() { return `${now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
  const cleanName = name => String(name || '').normalize('NFKC').trim().slice(0, 80);
  function addPerson(name) {
    reload();
    const clean = cleanName(name);
    if (!clean) return null;
    let person = data.people.find(p => p.name.toLocaleLowerCase() === clean.toLocaleLowerCase());
    if (!person) {
      person = { id: newId(), name: clean, createdAt: now() };
      data.people = [...data.people, person];
      data.entries = { ...data.entries, [person.id]: [] };
    }
    data.active = person.id;
    save();
    return person;
  }
  function activate(id) {
    reload();
    if (!data.people.some(p => p.id === id)) return false;
    data.active = id;
    save();
    return true;
  }
  function removePerson(id) {
    reload();
    data.people = data.people.filter(p => p.id !== id);
    const { [id]: _removed, ...entries } = data.entries;
    data.entries = entries;
    if (data.extra) { const { [id]: _extra, ...extra } = data.extra; data.extra = extra; }
    if (data.active === id) data.active = data.people[0]?.id ?? null;
    save();
  }
  // Practice works with no setup: the first record creates a default person.
  function record(entry, defaultName) {
    reload();
    if (!data.people.some(p => p.id === data.active)) {
      if (data.people[0]) data.active = data.people[0].id;
      else addPerson(defaultName);
    }
    const saved = { id: newId(), at: now(), ...entry };
    data.entries = { ...data.entries, [data.active]: [...(data.entries[data.active] || []), saved].slice(-MAX_ENTRIES) };
    save();
    return saved.id;
  }
  function ensurePerson(defaultName) {
    if (!data.people.some(p => p.id === data.active)) {
      if (data.people[0]) data.active = data.people[0].id;
      else addPerson(defaultName);
    }
  }
  // Program progress, situation levels, feared words, own affirmation and self-ratings, per person.
  function updateExtra(change, defaultName) {
    reload();
    ensurePerson(defaultName);
    const current = data.extra?.[data.active] || {};
    data.extra = { ...data.extra, [data.active]: change(current) };
    save();
  }
  function rate(id, rating) {
    reload();
    const list = data.entries[data.active] || [];
    data.entries = { ...data.entries, [data.active]: list.map(entry => entry.id === id ? { ...entry, rating } : entry) };
    save();
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    refresh() { reload(); publish(); },
    addPerson, activate, removePerson, record, rate, updateExtra
  };
}

// Arabic counting forms differ for 1, 2, 3–10, 11–99 and 100+, so use the language's plural rules.
export function countLabel(lang, count, forms) {
  const form = forms[new Intl.PluralRules(lang).select(count)] ?? forms.other;
  return form.replace('{n}', count);
}
export function dayKey(time) {
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function weekSummary(entries, now) {
  const recent = entries.filter(entry => entry.at > now - 7 * DAY_MS);
  return { practices: recent.length, days: new Set(recent.map(entry => dayKey(entry.at))).size };
}
function emptyStats() { return { count: 0, ratings: { 1: 0, 2: 0, 3: 0 } }; }
function addStats(stats, entry) {
  stats.count++;
  if (stats.ratings[entry.rating] !== undefined) stats.ratings[entry.rating]++;
}
// Groups each day's practice, newest day first, as { day, at, groups: [...] }.
export function historyByDay(entries, stepOf) {
  const days = new Map();
  for (const entry of entries) {
    const key = dayKey(entry.at);
    if (!days.has(key)) days.set(key, { day: key, at: entry.at, groups: new Map() });
    const day = days.get(key);
    const step = entry.screen === 'breathing-practice' ? `preset-${entry.preset}` : stepOf(entry.category);
    const groupKey = `${entry.screen}|${step}`;
    if (!day.groups.has(groupKey)) day.groups.set(groupKey, { screen: entry.screen, step, preset: entry.preset, spm: null, breaths: 0, ...emptyStats() });
    const group = day.groups.get(groupKey);
    addStats(group, entry);
    if (entry.spm) group.spm = entry.spm;
    if (entry.breaths) group.breaths += entry.breaths;
  }
  return [...days.values()].sort((a, b) => b.at - a.at).map(day => ({ ...day, groups: [...day.groups.values()] }));
}
export function stepStats(entries, screen, categories) {
  const stats = emptyStats();
  entries.filter(entry => entry.screen === screen && categories.includes(entry.category)).forEach(entry => addStats(stats, entry));
  const rated = stats.ratings[1] + stats.ratings[2] + stats.ratings[3];
  return { ...stats, rated, ready: rated >= READY_RATED && stats.ratings[1] / rated >= READY_EASY_SHARE };
}
export function latestScreen(entries, allowed, fallback) {
  for (let i = entries.length - 1; i >= 0; i--) if (allowed.includes(entries[i].screen)) return entries[i].screen;
  return fallback;
}
