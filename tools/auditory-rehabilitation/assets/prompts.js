/* Spoken prompts: praise, gentle retries and short instructions.
 * Each prompt plays sounds/prompts/<name>.m4a when that recording exists
 * (see docs/sound-recording-list.pdf). Until it is recorded, the device's
 * Arabic voice reads the same sentence; with no voice the prompt is skipped. */
((root) => {
    'use strict';
    const TEXT = {
        'praise-1': 'برافو!', 'praise-2': 'شاطر!', 'praise-3': 'شاطرة!', 'praise-4': 'ممتاز!', 'praise-5': 'يا سلام!', 'praise-6': 'عفارم عليك!',
        'retry-1': 'لا، جرّب كمان مرة', 'retry-2': 'قرّبت! يلا كمان مرة', 'retry-3': 'ولا يهمّك، منجرّب سوا',
        'ask-where': 'وين', 'ask-show': 'فرجيني', 'ask-what': 'شو هاد؟', 'ask-say': 'قول', 'ask-same': 'لاقي الصورة اللي متلها',
        'ask-listen': 'اسمع منيح', 'ask-turn': 'دورك!',
        'start-1': 'يلا نلعب!', 'start-2': 'يلا نبلّش', 'count-1': 'واحد', 'count-2': 'اتنين', 'count-3': 'تلاتة',
        'done-1': 'خلصنا! برافو عليك', 'stars-10': 'عشر نجوم! يا سلام!', 'break-1': 'يلا نرتاح شوي', 'hello': 'مرحبا!'
    };
    // Gender-neutral praise only; the app does not know whether the child is a boy or a girl.
    const PRAISE = ['praise-1', 'praise-4', 'praise-5', 'praise-6'];
    const RETRY = ['retry-1', 'retry-2'];
    // Where the recordings are: sounds/prompts/ by default, or the script tag's data-base (e.g. assets/sounds/prompts/).
    const BASE = root.document?.currentScript?.dataset.base || 'sounds/prompts/';
    const missing = new Set();
    let player = null, token = 0, voice;
    const pick = list => list[Math.floor(Math.random() * list.length)];
    function arabicVoice() {
        if (voice !== undefined) return voice;
        const voices = root.speechSynthesis?.getVoices?.() || [];
        if (!voices.length) return null; // Voices load asynchronously; try again next time.
        voice = voices.find(v => /^ar[-_](SY|LB|JO|PS)/i.test(v.lang)) || voices.find(v => /^ar/i.test(v.lang)) || null;
        return voice;
    }
    function speak(text, ticket) {
        const synth = root.speechSynthesis;
        if (!synth || !root.SpeechSynthesisUtterance) return Promise.resolve(false);
        const v = arabicVoice();
        if (v === null && (synth.getVoices?.() || []).length) return Promise.resolve(false); // No Arabic voice installed.
        return new Promise(resolve => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = v?.lang || 'ar-SA'; if (v) utterance.voice = v; utterance.rate = .9;
            const done = ok => { clearTimeout(timer); resolve(ok && ticket === token); };
            // Never hold the game longer than the sentence could take to say.
            const timer = setTimeout(() => { synth.cancel(); done(false); }, 1200 + text.length * 160);
            utterance.onend = () => done(true); utterance.onerror = () => done(false);
            synth.cancel(); synth.speak(utterance);
        });
    }
    function playFile(url, ticket) {
        return new Promise(resolve => {
            player ||= new Audio();
            const audio = player;
            let settled = false;
            const finish = result => {
                if (settled) return; settled = true; clearTimeout(timer);
                audio.onended = audio.onerror = null; resolve(ticket === token ? result : 'cancelled');
            };
            const timer = setTimeout(() => { audio.pause(); finish('failed'); }, 8000);
            audio.onended = () => finish('played');
            audio.onerror = () => finish('missing');
            audio.src = url;
            audio.play().catch(error => finish(error?.name === 'NotAllowedError' ? 'blocked' : 'missing'));
        });
    }
    /** Play one prompt by name. Resolves to true when it was heard, false otherwise. Never rejects. */
    async function say(name) {
        const ticket = ++token;
        const text = TEXT[name];
        if (!text) return false;
        if (!missing.has(name)) {
            const result = await playFile(`${BASE}${name}.m4a`, ticket);
            if (result === 'played') return true;
            if (result === 'cancelled' || result === 'blocked') return false;
            missing.add(name);
        }
        if (ticket !== token) return false;
        return speak(text, ticket);
    }
    /** Play a word recording (e.g. sounds/6/1.m4a) on the same channel, so prompts and words never overlap. */
    async function word(url) {
        const ticket = ++token;
        root.speechSynthesis?.cancel();
        return (await playFile(url, ticket)) === 'played';
    }
    function stop() { token++; player?.pause(); root.speechSynthesis?.cancel(); }
    // Unlock audio on the first touch so later prompts play on iPhone and iPad.
    function unlock() {
        player ||= new Audio();
        player.muted = true; player.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
        player.play().catch(() => {}).finally(() => { player.muted = false; });
    }
    root.speechSynthesis?.addEventListener?.('voiceschanged', () => { voice = undefined; });
    const api = { TEXT, PRAISE, RETRY, say, word, stop, unlock, praise: () => say(pick(PRAISE)), retry: () => say(pick(RETRY)) };
    root.VocPrompts = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
