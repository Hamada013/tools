/* Solve the visible calculation through the same choices used by a parent. */
async function solveParentGate(page) {
    const gate = page.locator('#parent-gate[open]'); await gate.waitFor();
    const left = Number(await gate.locator('[data-left]').innerText());
    const right = Number(await gate.locator('[data-right]').innerText());
    const subtraction = (await gate.locator('[data-operation]').innerText()) === '−';
    await gate.locator(`[data-answer="${subtraction ? left-right : left+right}"]`).click();
    await gate.waitFor({state:'hidden'});
}
module.exports = { solveParentGate };
