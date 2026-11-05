/* Plans only the sentences used in this child's workplace session. */
((root) => {
    'use strict';
    const sentenceKey = sentence => sentence.key || `s:${sentence.folder}/${sentence.subCatId}/${sentence.itemNum}`;
    const wordKey = slot => `w:${slot.categoryId}/${slot.id}`;
    // Keep the demonstrated answer from remaining in the same choice position.
    function shuffleAfterDemo(choices, targetIndex, random = Math.random) {
        if (choices.length < 2 || targetIndex < 0 || targetIndex >= choices.length) return [...choices];
        const result = [...choices], target = choices[targetIndex];
        for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
        if (result.indexOf(target) === targetIndex) {
            const next = (targetIndex + 1 + Math.floor(random() * (result.length - 1))) % result.length;
            [result[targetIndex], result[next]] = [result[next], result[targetIndex]];
        }
        return result;
    }
    function stages(sentences) {
        const all = sentences.map((_, index) => index), illustrated = all.filter(index => sentences[index].imgPath);
        return [
            { id: 'repetition', kind: 'practice', indices: all, repeats: 10 },
            { id: 'missing', kind: 'practice', indices: all },
            { id: 'receptive-advanced', domain: 'receptive', presentation: 'advanced', kind: 'assessment', indices: illustrated },
            { id: 'receptive-slots', domain: 'receptive', presentation: 'slots', kind: 'assessment', indices: all },
            { id: 'expressive-advanced', domain: 'expressive', presentation: 'advanced', kind: 'assessment', indices: illustrated },
            { id: 'expressive-slots', domain: 'expressive', presentation: 'slots', kind: 'assessment', indices: all }
        ].filter(stage => stage.indices.length);
    }
    function targets(sentence) {
        const cards = sentence.slots.map((slot, index) => ({ id: `word-${index}`, key: wordKey(slot), entity: 'word', index,
            title: sentence.slotContexts?.[index]?.title || slot.title || slot.titleMale || '',
            image: slot.customImgPath || null, segments: sentence.slotContexts?.[index]?.segments || [] }));
        if (sentence.presentation === 'advanced' && sentence.imgPath) cards.unshift({ id: 'sentence', key: sentenceKey(sentence), entity: 'sentence',
            title: sentence.title, image: sentence.imgPath, segments: [{ path: sentence.soundPath, text: sentence.title }] });
        return cards;
    }
    function record(sentence, domain, presentation, correct, total = 1) {
        return { key: sentenceKey(sentence), title: sentence.title, entity: 'sentence', domain, presentation, correct: Number(correct), total };
    }
    const api = { shuffleAfterDemo, stages, targets, record, sentenceKey, wordKey };
    root.SenbSessionModel = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
