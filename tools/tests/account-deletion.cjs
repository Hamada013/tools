const assert = require('node:assert/strict');
const { remove } = require('../shared/accounts.js');
const KEY = 'voc-children-v1';
const fixture = () => ({ schema: 1, active: 'admin', children: [
    { id: 'admin', name: 'Hamada', role: 'admin', words: {}, sessions: [] },
    { id: 'ali', name: 'علي', role: 'child', words: {}, sessions: [], senb: { sessions: [] }, taffaha: { attempts: [] } },
    { id: 'sara', name: 'سارة', role: 'child', words: { saved: true }, sessions: [] }
] });
function memory(data = fixture()) {
    const values = new Map([[KEY, JSON.stringify(data)]]);
    return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem:key=>values.delete(key) };
}
(async () => {
    const { createProgress } = await import('../VSS/taffaha/progress.js');
    const createApps = [require('../VSS/voc/assets/progress.js').create, require('../VSS/senb/assets/child-progress.js').create, createProgress];
    for (const name of ['Hamada', 'HAMADA', ' hamada ', 'Ｈａｍａｄａ']) {
        const data = fixture(); data.children[0].name = name; delete data.children[0].role;
        const storage = memory(data), before = storage.getItem(KEY);
        assert.equal(remove(storage, 'admin', 'admin'), false, 'The reserved account cannot be removed');
        assert.equal(storage.getItem(KEY), before, 'A refused deletion does not change storage');
    }
    const storage = memory(), before = storage.getItem(KEY);
    assert.equal(remove(storage, 'ali', 'sara'), false, 'A child cannot delete another account');
    assert.equal(remove(storage, 'admin', 'missing'), false);
    assert.equal(storage.getItem(KEY), before);
    assert.equal(remove(memory({ schema: 1, children: {} }), 'admin', 'ali'), false);
    assert.equal(remove({ getItem: () => '{' }, 'admin', 'ali'), false);
    assert.equal(remove({ getItem: storage.getItem, setItem() { throw Error('full'); } }, 'admin', 'ali'), false);
    assert.equal(storage.getItem(KEY), before, 'Failed writes preserve accounts');

    for (const create of createApps) {
        const shared = memory(), app = create(shared);
        app.signIn('علي');
        const latest = JSON.parse(shared.getItem(KEY)); latest.active = 'admin'; shared.setItem(KEY, JSON.stringify(latest));
        const survivor = JSON.stringify(latest.children.find(child => child.id === 'sara'));
        for(const id of ['ali','sara'])for(const app of ['voc','senb','taffaha'])shared.setItem(`speech-homework-v1:${app}:${id}`,`message for ${id}`);
        assert.equal(remove(shared, 'admin', 'ali'), true);
        for(const app of ['voc','senb','taffaha']){
            assert.equal(shared.getItem(`speech-homework-v1:${app}:ali`),undefined,'Deletion removes the child’s parent summaries');
            assert.equal(shared.getItem(`speech-homework-v1:${app}:sara`),'message for sara','Other children keep their summaries');
        }
        app.saveWorkspace({ stale: true });
        const saved = JSON.parse(shared.getItem(KEY));
        assert.ok(!saved.children.some(child => child.id === 'ali'), 'A stale app cannot restore a deleted child');
        assert.ok(saved.deletedChildren.ali);
        assert.equal(saved.active, 'admin');
        assert.equal(JSON.stringify(saved.children.find(child => child.id === 'sara')), survivor);
        const replacement = app.signIn('علي');
        assert.notEqual(replacement.id, 'ali', 'Reusing a deleted name creates a fresh identity');
        assert.ok(!replacement.senb?.workspace?.stale && !replacement.taffaha?.workspace?.stale && !replacement.workspace?.stale);
        assert.ok(JSON.parse(shared.getItem(KEY)).children.some(child => child.id === 'admin'));
    }
    console.log('PASS: Hamada is protected; child deletion, failed writes, and stale-tab saves preserve other accounts in all three apps.');
})().catch(error => { console.error(error); process.exitCode = 1; });
