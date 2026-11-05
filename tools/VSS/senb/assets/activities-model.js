// Activity planning reads the original sentence library without changing its mappings.
const SENBActivities = (() => {
    function shuffle(items, random = Math.random) {
        const result = [...items];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    function sentences(folder, subgroup) {
        return Array.from({ length: 24 }, (_, index) => getAdvancedItemData(folder, subgroup, index + 1));
    }
    // Legacy spelling aliases are resolved on copies, never in the preset library.
    // Unassigned cards stay unassigned instead of guessing another image/recording.
    function normalizeSlot(slot) {
        const aliases = { '07 pronoun': '07 Pronoun', '08 conjunctions': '08 linking', '12 numbers': '11 numbers', '02 object': '03 object' };
        const categoryId = slot.categoryId === '07 pronouns' && slot.title === 'و'
            ? '08 linking' : aliases[slot.categoryId] || slot.categoryId;
        const id = slot.categoryId === '07 pronouns' && slot.title === 'و' ? 3 : slot.id;
        const base = ITEMS_DATABASE[categoryId]?.find(item => item.id === id);
        return { ...base, ...slot, categoryId, id };
    }
    function hasMappedCard(slot) {
        const item = normalizeSlot(slot);
        return Boolean(ITEMS_DATABASE[item.categoryId]?.some(base => base.id === item.id));
    }
    function imagePath(slot) {
        const item = normalizeSlot(slot);
        return (item.customImgPath || hasMappedCard(item)) ? getBasicImagePath(item) : 'assets/image-fallback.svg';
    }
    const key = sentence => `${sentence.folder}/${sentence.subCatId}/${sentence.itemNum}`;
    const signature = (sentence, presentation) => presentation === 'slots'
        ? sentence.slots.map(imagePath).join('|') : sentence.imgPath;
    const normalizeText = text => text.normalize('NFKC').replace(/[\u064b-\u065f\u0670\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/\s+/g, ' ').trim();
    const meaningSignatures = sentence => [
        `title:${normalizeText(sentence.title)}`,
        `words:${normalizeText(sentence.slots.map(slot => slot.title || slot.titleMale || '').join(' '))}`,
        `cards:${signature(sentence, 'slots')}`
    ];
    function testPlan(folder, presentation = 'advanced', random = Math.random, selectedSubgroup = null, trialsPerSubgroup = 3) {
        if (!Number.isInteger(trialsPerSubgroup) || trialsPerSubgroup < 3 || trialsPerSubgroup > 10) throw new RangeError('Select 3 to 10 trials per subgroup');
        const plan = [];
        const subgroups = selectedSubgroup === null ? Array.from({ length: 8 }, (_, index) => index + 1) : [selectedSubgroup];
        for (const subgroup of subgroups) {
            const pool = sentences(folder, subgroup);
            for (const target of shuffle(pool, random).slice(0, trialsPerSubgroup)) {
                const seen = new Set([signature(target, presentation), ...meaningSignatures(target)]);
                const distractors = shuffle(pool, random).filter(candidate => {
                    const signatures = [signature(candidate, presentation), ...meaningSignatures(candidate)];
                    if (signatures.some(value => seen.has(value))) return false;
                    signatures.forEach(value => seen.add(value));
                    return true;
                }).slice(0, 3);
                if (distractors.length !== 3) throw new Error('Not enough distinct sentence choices');
                plan.push({ target, choices: shuffle([target, ...distractors], random) });
            }
        }
        return plan;
    }
    function gameBag(folder, random = Math.random, selectedSubgroups = []) {
        const groups = selectedSubgroups.length ? [...new Set(selectedSubgroups)] : Array.from({ length: 8 }, (_, index) => index + 1);
        if (groups.some(group => !Number.isInteger(group) || group < 1 || group > 8)) throw new RangeError('Invalid game subgroup');
        return shuffle(groups.flatMap(group => sentences(folder, group)), random);
    }
    function gameRound(sentence, random = Math.random) {
        const eligible = sentence.slots.map((slot, index) => hasMappedCard(slot) ? index : -1).filter(index => index >= 0);
        const missingIndex = eligible[Math.floor(random() * eligible.length)];
        const wanted = normalizeSlot(sentence.slots[missingIndex]);
        const distractors = shuffle(ITEMS_DATABASE[wanted.categoryId], random)
            .filter(item => imagePath({ ...item, categoryId: wanted.categoryId }) !== imagePath(wanted))
            .slice(0, 2).map(item => ({ ...item, categoryId: wanted.categoryId, verbTense: wanted.verbTense, conjugation: wanted.conjugation, pronounModifier: wanted.pronounModifier }));
        return { sentence, missingIndex, choices: shuffle([wanted, ...distractors], random), solved: false, selected: null, attempts: 0, hintUsed: false };
    }
    // Grammar lookup is synchronous. Restore the manual board before any audio awaits.
    function inSentence(sentence, callback) {
        const row = state.row1Slots;
        try { state.row1Slots = sentence.slots; return callback(); }
        finally { state.row1Slots = row; }
    }
    function slotTitle(sentence, slot, index) {
        return inSentence(sentence, () => getDisplayedItemTitle(normalizeSlot(slot), 1, index));
    }
    function slotSegments(sentence, slot, index) {
        const item = normalizeSlot(slot);
        return inSentence(sentence, () => hasMappedCard(item)
            ? getSlotAudioSegments(item, 1, index) : [{ path: null, text: getDisplayedItemTitle(item, 1, index) }]);
    }
    function wordType(sentence, slot, index) {
        const item = normalizeSlot(slot);
        const word = normalizeText(item.title || item.titleMale || '');
        const type = (id, label) => ({ id, label });
        if (Number(sentence.folder) === 2 && Number(sentence.subCatId) === 3) return index === 0 ? type('genitive-head', 'مضاف') : type('genitive-dependent', 'مضاف إليه');
        if (['فوق', 'تحت', 'قدام', 'ورا', 'وراء', 'جنب', 'خلف', 'امام', 'داخل', 'خارج', 'بين'].includes(word)) return type('spatial', 'ظرف مكان');
        if (item.categoryId === '02 verbs') {
            const previous = sentence.slots[index - 1];
            const next = sentence.slots[index + 1];
            const future = item.verbTense === 'future' || (item.id === 15 && next?.categoryId === '02 verbs') || (previous?.categoryId === '02 verbs' && previous.id === 15);
            if (future) return type('verb-future', 'فعل مستقبل');
            return item.verbTense === 'past' ? type('verb-past', 'فعل ماضي') : type('verb-present', 'فعل حاضر');
        }
        if (item.categoryId === '07 Pronoun') return ['هذا', 'هذه', 'هاد', 'هاي', 'هدول'].includes(word) ? type('demonstrative', 'اسم إشارة') : type('pronoun', 'ضمير');
        if (['05 adjectives', '10 colors'].includes(item.categoryId)) return type('adjective', 'صفة');
        if (item.categoryId === '06 time') return type('time', 'اسم زمان');
        if (item.categoryId === '04 place') return type('place', 'اسم مكان');
        if (['09 Prepositions', '08 linking'].includes(item.categoryId)) {
            if (item.categoryId === '09 Prepositions' || ['في', 'مع', 'على', 'من', 'الى', 'ل'].includes(word)) return type('preposition', 'حرف جر');
            return type('linking', 'حرف عطف / ربط');
        }
        if (item.categoryId === '11 numbers') return type('number', 'عدد');
        if (item.categoryId === '12 questions') return type('question', 'أداة استفهام');
        if (item.categoryId === '01 subject') return sentence.slots.some(other => other.categoryId === '02 verbs') ? type('subject', 'فاعل') : type('noun', 'اسم');
        if (item.categoryId === '03 object') return sentence.slots.slice(0, index).some(other => other.categoryId === '02 verbs') ? type('object', 'مفعول به / اسم') : type('noun', 'اسم');
        return type('unclassified', 'نوع غير محدد');
    }
    function assessmentSummary(results, expressive, folder) {
        const score = rows => {
            const earned = rows.reduce((sum, result) => sum + (expressive ? (Array.isArray(result.marks) ? result.marks.filter(Boolean).length : result.words) : Number(result.correct)), 0);
            const possible = rows.reduce((sum, result) => sum + (expressive ? result.total : 1), 0);
            return { earned, possible, trials: rows.length, percentage: possible ? Math.round(earned / possible * 1000) / 10 : 0, mlu: rows.length ? Math.round(earned / rows.length * 100) / 100 : 0 };
        };
        const category = ADVANCED_CATEGORIES.find(cat => Number(cat.folder) === Number(folder));
        const groups = category.subcategories.filter(sub => results.some(result => Number(result.subgroup) === Number(sub.id)))
            .map(sub => ({ id: sub.id, name: sub.name, ...score(results.filter(result => Number(result.subgroup) === Number(sub.id))) }));
        const types = new Map();
        if (expressive) for (const result of results) {
            if (!Array.isArray(result.marks)) continue;
            const sentence = getAdvancedItemData(folder, result.subgroup, result.item);
            sentence.slots.forEach((slot, index) => {
                const type = wordType(sentence, slot, index);
                if (!types.has(type.id)) types.set(type.id, { ...type, produced: 0, opportunities: 0 });
                const entry = types.get(type.id);
                entry.opportunities++;
                if (result.marks[index]) entry.produced++;
            });
        }
        const wordTypes = [...types.values()].map(type => ({ ...type, percentage: Math.round(type.produced / type.opportunities * 1000) / 10 }));
        const highest = Math.max(...wordTypes.map(type => type.percentage));
        const lowest = Math.min(...wordTypes.map(type => type.percentage));
        return { ...score(results), groups, wordTypes, strongest: highest > lowest ? wordTypes.filter(type => type.percentage === highest) : [], weakest: highest > lowest ? wordTypes.filter(type => type.percentage === lowest) : [] };
    }
    return { shuffle, sentences, normalizeSlot, hasMappedCard, imagePath, key, signature, meaningSignatures, testPlan, gameBag, gameRound, slotTitle, slotSegments, wordType, assessmentSummary };
})();
