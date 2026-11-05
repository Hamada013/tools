const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { currentContext } = require('./regression.cjs');
const source = fs.readFileSync(path.join(__dirname, '../assets/app.js'), 'utf8');
const audioSource = source.slice(source.indexOf('function playAudioFilePath('), source.indexOf('// Enforced strict awaiting sequences'));
function fixture({ speech = false, reject = null } = {}) {
    const timers = new Map();
    const played = [];
    let id = 0, paused = 0, status = '', cancelled = 0, spoken;
    const audio = {
        src: '', pause() { paused++; },
        play() { played.push(this.src); return reject ? Promise.reject(Object.assign(new Error('blocked'), { name: reject })) : Promise.resolve(); }
    };
    const context = currentContext();
    Object.assign(context, {
        playbackAudio: audio, finishActivePlayback: null, playbackRequestId: 0, workplaceMetronomePlaying: false, workplaceWordsPlaying: false,
        setTimeout(fn, delay) { timers.set(++id, { fn, delay }); return id; },
        clearTimeout(id) { timers.delete(id); },
        showAudioStatus(message) { status = message; },
        window: speech ? { speechSynthesis: { cancel() { cancelled++; }, speak(value) { spoken = value; } } } : {},
        SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } }
    });
    vm.runInContext(audioSource, context);
    return { context, audio, timers, played, status: () => status, paused: () => paused, spoken: () => spoken, cancelled: () => cancelled };
}
(async () => {
    const normal = fixture();
    let settled = 0;
    const first = normal.context.playAudioFilePath('first.m4a', 'أول').then(() => settled++);
    const second = normal.context.playAudioFilePath('second.m4a', 'ثاني').then(() => settled++);
    await first;
    assert.equal(settled, 1);
    assert.equal(normal.audio.src, 'second.m4a');
    assert.equal(normal.timers.size, 1, 'Previous playback watchdog must be cleared');
    normal.audio.onended();
    await second;
    assert.equal(settled, 2);
    assert.equal(normal.timers.size, 0);
    assert.equal(normal.context.finishActivePlayback, null);

    const blocked = fixture({ reject: 'NotAllowedError' });
    await blocked.context.playAudioFilePath('blocked.m4a', 'نص');
    assert.ok(blocked.status().includes('تفعيل الصوت'));
    assert.equal(blocked.timers.size, 0);

    const missing = fixture();
    const failed = missing.context.playAudioFilePath('missing.m4a', 'نص');
    missing.audio.onerror();
    await failed;
    assert.ok(missing.status().includes('تعذر'));
    assert.equal(missing.timers.size, 0);

    const fallback = fixture({ speech: true });
    const speech = fallback.context.playAudioFilePath('missing.m4a', 'نص مؤنث');
    fallback.audio.onerror();
    [...fallback.timers.values()].find(timer => timer.delay === 50).fn();
    assert.equal(fallback.spoken().text, 'نص مؤنث');
    assert.equal(fallback.spoken().lang, 'ar-SA');
    fallback.spoken().onend();
    await speech;
    assert.equal(fallback.timers.size, 0);

    const unassigned = fixture({ speech: true });
    const unassignedSpeech = unassigned.context.playAudioFilePath(null, 'مبسوطة');
    assert.deepEqual(unassigned.played, [], 'An unassigned card must use speech instead of an unrelated media file');
    [...unassigned.timers.values()].find(timer => timer.delay === 50).fn();
    assert.equal(unassigned.spoken().text, 'مبسوطة');
    unassigned.spoken().onend();
    await unassignedSpeech;
    assert.equal(unassigned.timers.size, 0);

    const stalled = fixture();
    const timeout = stalled.context.playAudioFilePath('stalled.m4a', 'نص');
    [...stalled.timers.values()].find(timer => timer.delay === 45000).fn();
    await timeout;
    assert.equal(stalled.context.finishActivePlayback, null);
    assert.equal(stalled.timers.size, 0);
    assert.ok(stalled.status().includes('تعذر'));
    const future = fixture();
    vm.runInContext("state.row1Slots = [{ categoryId: '01 subject', genderCode: 'she' }];", future.context);
    const verb = { id: 1, categoryId: '02 verbs', verbTense: 'future', title: 'أكل' };
    const futureSpeech = future.context.playSlotAudio(verb, 1, 1);
    assert.deepEqual(future.played, ['sounds/verbs/present/she/15.m4a']);
    future.audio.onended();
    await Promise.resolve();
    assert.deepEqual(future.played, ['sounds/verbs/present/she/15.m4a', 'sounds/verbs/present/she/1.m4a']);
    future.audio.onended();
    await futureSpeech;

    const interrupted = fixture();
    const oldFuture = interrupted.context.playSlotAudio(verb, 1, 0);
    const newer = interrupted.context.playAudioFilePath('newer.m4a', 'جديد');
    await oldFuture;
    assert.deepEqual(interrupted.played, ['sounds/verbs/present/i/15.m4a', 'newer.m4a']);
    interrupted.audio.onended();
    await newer;

    const context = currentContext();
    const paths = vm.runInContext(`(() => {
        const results = [];
        for (const row of [1, 2]) for (const code of ['i', 'he', 'she', 'they', 'we', 'youmale', 'youfemale', 'youplural']) {
            state[row === 1 ? 'row1Slots' : 'row2Slots'] = [{ categoryId: '07 Pronoun', code }];
            for (const verb of ITEMS_DATABASE['02 verbs']) {
                const item = { ...verb, categoryId: '02 verbs', verbTense: 'future' };
                results.push({ code, id: verb.id, segments: getSlotAudioSegments(item, row, 1) });
            }
        }
        return results;
    })()`, context);
    for (const {code, id, segments} of paths) {
        assert.equal(segments.length, 2);
        assert.equal(segments[0].path, `sounds/verbs/present/${code}/15.m4a`);
        assert.equal(segments[1].path, `sounds/verbs/present/${code}/${id}.m4a`);
    }
    console.log(`PASS: ${paths.length} future-verb mappings use want + present across both rows and all subject codes; both clips are awaited and interrupted playback stays stopped.`);
    console.log('PASS: shared audio, interrupted taps, blocked autoplay, missing files, Arabic speech fallback, and stalled-playback cleanup.');
})().catch(error => { console.error(error); process.exitCode = 1; });
