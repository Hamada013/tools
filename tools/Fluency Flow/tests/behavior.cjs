const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.FLUENCY_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' })[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
const click = (page, name, options) => page.getByRole('button', { name, exact: true }).click(options);
async function home(page) {
  while (await page.locator('[data-screen]').getAttribute('data-screen') !== 'home') await click(page, 'Back');
}
async function slower(page) { await click(page, 'Fluency Shaping'); await click(page, 'Slower Rate'); }
async function easy(page) { await click(page, 'Fluency Shaping'); await click(page, 'Easy Onsets'); }
async function run(type, name) {
  const options = { headless: true };
  if (name === 'chromium') {
    if (fs.existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')) options.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    options.args = ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'];
  }
  const browser = await type.launch(options);
  try {
    let context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    let page = await context.newPage(); page.setDefaultTimeout(8000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await click(page, 'Switch to English');
    await slower(page);
    await click(page, 'Numbers');
    for (let i = 0; i < 5; i++) await click(page, 'Faster');
    await page.clock.install({ time: new Date('2026-10-09T12:00:00Z') });
    await page.clock.pauseAt(new Date('2026-10-09T12:00:00Z'));
    await click(page, 'Auto advance');
    await click(page, 'Play');
    await page.clock.runFor(400);
    assert.equal(await page.locator('[data-playing]').getAttribute('data-playing'), 'false');
    await click(page, 'Reset');
    await page.clock.runFor(2000);
    assert.match(await page.locator('.ff-pagination').textContent(), /1 \/ 10/);
    await click(page, 'Play');
    await page.clock.runFor(400);
    await page.clock.runFor(1600);
    assert.match(await page.locator('.ff-pagination').textContent(), /2 \/ 10/);
    await home(page);
    await page.clock.runFor(5000);
    assert.equal(await page.locator('[data-screen]').getAttribute('data-screen'), 'home');
    assert.equal(await page.locator('[data-playing]').getAttribute('data-playing'), 'false');
    await slower(page); await click(page, 'Numbers');
    await click(page, 'Auto advance'); // turn off the remembered setting
    await click(page, 'More items'); await click(page, 'More items');
    for (let i = 0; i < 3; i++) await click(page, 'Next');
    assert.equal(await page.getByRole('button', { name: 'Next', exact: true }).isDisabled(), true);
    assert.match(await page.locator('.ff-pagination').textContent(), /4 \/ 4/);
    await click(page, 'Fewer items');
    assert.match(await page.locator('.ff-pagination').textContent(), /1 \/ 5/);
    await home(page); await easy(page); await click(page, 'Numbers');
    await click(page, 'Play'); await page.clock.runFor(600); await click(page, 'Pause');
    await page.clock.runFor(5000); await click(page, 'Play'); await page.clock.runFor(600);
    // Resuming after 600 ms must reach vocalization within another 600 ms.
    await page.clock.runFor(150);
    assert.match(await page.locator('.ff-status > p').first().textContent(), /Speak/);
    // Breathing stops by itself after the chosen breaths and never holds by default.
    await click(page, 'Reset'); await home(page);
    await click(page, 'Breathing Techniques'); await click(page, 'Controlled Exhalation');
    await click(page, 'Fewer breaths'); await click(page, 'Fewer breaths'); await click(page, 'Fewer breaths');
    await click(page, 'Play');
    await page.clock.runFor(1000);
    assert.match(await page.locator('.ff-status > p').textContent(), /Inhale/);
    await page.clock.runFor(4000);
    assert.match(await page.locator('.ff-status > p').textContent(), /Exhale with/);
    assert.equal(await page.locator('[data-playing]').getAttribute('data-playing'), 'true');
    await page.clock.runFor(14000);
    assert.equal(await page.locator('[data-playing]').getAttribute('data-playing'), 'false');
    assert.match(await page.locator('.ff-status > p').textContent(), /Great try/);
    await home(page);
    // A speed set in one exercise must not change another, and is kept when returning.
    // Slower Rate is at speed 10 from the auto-advance check above, so three steps down is speed 7.
    await slower(page);
    for (let i = 0; i < 3; i++) await click(page, 'Slower');
    assert.equal(await page.locator('.ff-speed input').inputValue(), '7');
    await home(page); await click(page, 'Fluency Shaping'); await click(page, 'Light Contacts');
    assert.equal(await page.locator('.ff-speed input').inputValue(), '5');
    await home(page); await slower(page);
    assert.equal(await page.locator('.ff-speed input').inputValue(), '7');
    assert.match(await page.locator('.ff-pagination').textContent(), /1 \/ 97/);
    // Finished practice is saved with its rating and shown in My Practice. Unfinished practice is not.
    await context.close();
    context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', permissions: name === 'chromium' ? ['clipboard-read', 'clipboard-write'] : [] });
    page = await context.newPage(); page.setDefaultTimeout(8000);
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await click(page, 'Switch to English');
    // Names and history sit behind a fresh sum. Wrong answers and closing never open them.
    await click(page, 'My Practice');
    const gateAnswer = () => page.locator('.ff-gate-sum').textContent().then(text => { const [left, operation, right] = text.split(' '); return operation === '+' ? +left + +right : +left - +right; });
    const answer = await gateAnswer();
    const wrong = (await page.locator('.ff-gate-choices button').evaluateAll(buttons => buttons.map(button => +button.dataset.answer))).find(value => value !== answer);
    await page.locator(`.ff-gate-choices button[data-answer="${wrong}"]`).click();
    await page.getByText('Try again.').waitFor();
    assert.equal(await page.locator('[data-screen]').getAttribute('data-screen'), 'home');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.ff-gate').count(), 0);
    assert.equal(await page.locator('[data-screen]').getAttribute('data-screen'), 'home');
    assert.equal(await page.getByRole('button', { name: 'My Practice', exact: true }).evaluate(el => el === document.activeElement), true);
    const passGate = async () => { await page.locator(`.ff-gate-choices button[data-answer="${await gateAnswer()}"]`).click(); };
    await click(page, 'My Practice'); await passGate();
    assert.match(await page.locator('.ff-progress').textContent(), /Finished practice will appear here/);
    await click(page, 'Back');
    await slower(page); await click(page, 'Numbers');
    for (let i = 0; i < 5; i++) await click(page, 'Faster');
    await click(page, 'Play'); await click(page, 'Pause'); await click(page, 'Reset');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('fluency-flow-progress-v1') || '{"people":[]}').people.length), 0, 'A stopped practice is not recorded');
    await click(page, 'Play');
    await page.locator('.ff-rating').waitFor();
    await page.locator('.ff-rating button[data-rating="1"]').click();
    assert.equal(await page.locator('.ff-rating').count(), 0);
    await home(page);
    await click(page, 'My Practice'); await passGate();
    const progressText = await page.locator('.ff-progress').textContent();
    assert.match(progressText, /Me/); assert.match(progressText, /Slower Rate · Words/); assert.match(progressText, /1 time\b/); assert.match(progressText, /Easy 1/);
    if (name === 'chromium') {
      // Without a share sheet the summary is copied, confirmed only by the icon and to screen readers.
      await page.evaluate(() => { Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }); });
      await click(page, 'Share summary');
      await page.getByRole('status').filter({ hasText: 'Summary copied' }).waitFor({ state: 'attached' });
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      assert.match(copied, /Slower Rate · Words/); assert.match(copied, /not an assessment/);
    }
    assert.equal(await page.getByText('Copy summary').count(), 0, 'Only the icon remains');
    // The share sheet gets the summary; cancelling it is silent, and a failure is reported.
    await page.evaluate(() => {
      window.shareTest = { mode: 'ok', text: '' };
      Object.defineProperty(navigator, 'share', { configurable: true, value: async data => {
        if (shareTest.mode === 'cancel') throw new DOMException('Cancelled', 'AbortError');
        shareTest.text = data.text;
      } });
    });
    await click(page, 'Share summary');
    await page.waitForFunction(() => shareTest.text.includes('Slower Rate'));
    await page.evaluate(() => { shareTest.mode = 'cancel'; });
    await click(page, 'Share summary');
    assert.equal(await page.locator('.ff-panel .ff-alert').count(), 0);
    // History survives a reload and belongs to one person.
    await page.reload();
    await click(page, 'My Practice'); await passGate();
    assert.match(await page.locator('.ff-progress').textContent(), /Easy 1/);
    await click(page, 'Change');
    await page.getByLabel('Add a person').fill('Sara');
    await click(page, 'Add');
    await page.keyboard.press('Escape');
    assert.match(await page.locator('.ff-progress').textContent(), /Finished practice will appear here/);
    await click(page, 'Profile');
    assert.equal(await page.getByRole('button', { name: 'Delete: Sara' }).count(), 0, 'People stay hidden until the sum is solved');
    await passGate();
    await click(page, 'Delete: Sara');
    await page.getByRole('alert').waitFor();
    await click(page, 'Cancel');
    await click(page, 'Delete: Sara');
    await click(page, 'Delete');
    assert.equal(await page.getByRole('button', { name: 'Sara' }).count(), 0);
    await page.keyboard.press('Escape');
    assert.match(await page.locator('.ff-progress').textContent(), /Easy 1/);
    // A path step opens that exercise at that step, here a timed speaking prompt.
    await page.locator('.ff-path-step[data-step="conversation"]').click();
    assert.equal(await page.locator('[data-screen]').getAttribute('data-screen'), 'slower-rate-practice');
    assert.equal(await page.locator('.ff-categories button[aria-pressed="true"]').textContent(), 'Conversation');
    assert.ok(await page.locator('.ff-prompt').count());
    assert.equal(await page.locator('.ff-speed').count(), 0);
    // Touch practice: each technique's own gesture, recorded when finished.
    await click(page, 'Back'); await click(page, 'Back');
    const practiceCount = () => page.evaluate(() => { const d = JSON.parse(localStorage.getItem('fluency-flow-progress-v1')); return d.entries[d.active].length; });
    const drag = async (name, steps, gap) => {
      const slider = page.getByRole('slider', { name });
      for (let i = 1; i <= steps; i++) { await slider.fill(String(i * 100 / steps)); await page.waitForTimeout(gap); }
    };
    await click(page, 'Fluency Shaping'); await click(page, 'Slower Rate');
    // Slower Rate: the turtle walks with the guide, and the speed scale runs from 0 to 10.
    assert.equal(await page.locator('.ff-turtle').count(), 1);
    assert.equal(await page.locator('.ff-beats').count(), 0, 'No dots to tap');
    assert.equal(await page.locator('.ff-speed-numbers').textContent(), '012345678910');
    assert.equal(await page.locator('.ff-speed input').getAttribute('min'), '0');
    assert.equal(await page.locator('.ff-speed input').getAttribute('max'), '10');
    const turtleValue = () => page.locator('.ff-turtle-track').getAttribute('aria-valuenow').then(Number);
    assert.equal(await turtleValue(), 0);
    const practicedBefore = await practiceCount();
    await click(page, 'Play');
    await page.waitForFunction(() => Number(document.querySelector('.ff-turtle-track')?.getAttribute('aria-valuenow')) > 5);
    await page.locator('.ff-cheer').waitFor({ timeout: 20000 });
    assert.equal(await practiceCount(), practicedBefore + 1);
    assert.equal(await page.locator('.ff-turtle').count(), 0, 'The bar gives way to the rating');
    await click(page, 'Keep going');
    assert.match(await page.locator('.ff-pagination').textContent(), /2 \/ /);
    assert.equal(await turtleValue(), 0, 'The turtle starts again on the next word');
    // A faster setting reaches the end sooner.
    const timed = async () => { const began = Date.now(); await click(page, 'Play'); await page.locator('.ff-cheer').waitFor({ timeout: 20000 }); return Date.now() - began; };
    await page.locator('.ff-speed input').fill('2');
    const slowRun = await timed();
    await click(page, 'Keep going');
    await page.locator('.ff-speed input').fill('10');
    const fastRun = await timed();
    assert.ok(fastRun < slowRun, `Speed 10 (${fastRun} ms) should beat speed 2 (${slowRun} ms)`);
    await click(page, 'Back'); await click(page, 'Easy Onsets');
    // Easy Onset: the ball rolls by itself. Too early gives a hint and it keeps going; the middle moves on.
    const stopLabel = 'Press when the ball reaches the star';
    const ballAt = test => page.waitForFunction(test, null, { timeout: 15000 });
    const countBefore = await practiceCount();
    await ballAt(() => Number(document.querySelector('.ff-slide')?.dataset.at) > .02 && Number(document.querySelector('.ff-slide').dataset.at) < .2);
    await page.getByRole('button', { name: stopLabel, exact: true }).click();
    await page.getByText('Wait, it is still at the start').waitFor();
    assert.equal(await page.locator('.ff-slide').count(), 1, 'A miss stays on the slide');
    await ballAt(() => Number(document.querySelector('.ff-slide')?.dataset.at) > .72);
    await page.getByRole('button', { name: stopLabel, exact: true }).click();
    await page.getByText('It passed the middle. Try again').waitFor();
    await ballAt(() => { const at = Number(document.querySelector('.ff-slide')?.dataset.at); return at > .4 && at < .5; });
    await page.getByRole('button', { name: stopLabel, exact: true }).click();
    await page.getByText('Now say the word softly').waitFor();
    await page.locator('.ff-cheer').waitFor({ timeout: 8000 });
    assert.equal(await practiceCount(), countBefore + 1);
    await click(page, 'Back'); await click(page, 'Light Contacts');
    // A long press pops the bubble; a quick tap finishes.
    const bubble = page.locator('.ff-bubble');
    const box = await bubble.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down(); await page.waitForTimeout(600); await page.mouse.up();
    await page.getByText('Pop! A quicker, softer tap').waitFor();
    await bubble.click();
    await page.locator('.ff-cheer').waitFor();
    await home(page);
    await click(page, 'Stuttering Modification'); await click(page, 'Cancellations');
    assert.equal(await page.locator('.ff-speed').count(), 0, 'The stuttering exercises have no speed bar');
    await click(page, 'Shorter pause'); await click(page, 'Shorter pause');
    // Letting go early starts the pause again; holding the full time moves on.
    await click(page, 'Say the word, then tap here');
    const hold = page.locator('.ff-hold');
    const holdBox = await hold.boundingBox();
    await page.mouse.move(holdBox.x + holdBox.width / 2, holdBox.y + holdBox.height / 2);
    await page.mouse.down(); await page.waitForTimeout(200); await page.mouse.up();
    await page.getByText('Keep holding until it fills up').waitFor();
    await page.mouse.down(); await page.waitForTimeout(1200); await page.mouse.up();
    await click(page, 'Say it again softly, then tap here');
    await page.locator('.ff-cheer').waitFor();
    await click(page, 'Back'); await click(page, 'Preparatory Sets');
    const ready = await page.locator('.ff-hold').boundingBox();
    await page.mouse.move(ready.x + ready.width / 2, ready.y + ready.height / 2);
    await page.mouse.down(); await page.waitForTimeout(1700); await page.mouse.up();
    await click(page, 'Start the word softly, then tap here');
    await page.locator('.ff-cheer').waitFor();
    await click(page, 'Back'); await click(page, 'Pull-outs');
    await click(page, 'Say the word, then tap here');
    await drag('Slide slowly as you ease out of the word', 5, 600);
    await page.locator('.ff-cheer').waitFor();
    // Watching the guide replaces the pad while it runs, and breathing has no recorder.
    await click(page, 'Reset');
    assert.equal(await page.locator('.ff-touch').count(), 1);
    await click(page, 'Play');
    assert.equal(await page.locator('.ff-touch').count(), 0);
    await click(page, 'Pause');
    await home(page);
    await click(page, 'Breathing Techniques');
    for (const technique of ['Diaphragmatic Breathing (Belly Breathing)', 'Regulated Breathing', 'Controlled Exhalation']) {
      await click(page, technique);
      await click(page, 'Play'); await click(page, 'Pause');
      assert.equal(await page.getByRole('button', { name: 'Record', exact: true }).count(), 0, `${technique} has no recorder`);
      assert.equal(await page.locator('audio').count(), 0, `${technique} has no recording`);
      await click(page, 'Back');
    }
    // Daily training: days and steps open in order, and a whole day runs through to its celebration.
    await home(page);
    await click(page, 'Training');
    assert.equal(await page.locator('[data-screen]').getAttribute('data-screen'), 'plan');
    await click(page, 'Day 2 (locked)');
    await page.locator('.ff-locked-note').waitFor();
    await page.locator('.ff-step-row').first().click({ force: true });
    assert.equal(await page.locator('[data-screen]').getAttribute('data-screen'), 'plan', 'A locked day does not open');
    await click(page, 'Day 1');
    await page.locator('.ff-step-row').nth(2).click({ force: true });
    await page.getByText('Finish the step before this one first.').waitFor();
    const start = () => page.locator('.ff-plan-go').click();
    await start();
    assert.equal(await page.locator('[data-screen]').getAttribute('data-screen'), 'lesson');
    for (let i = 0; i < 2; i++) await click(page, 'Next');
    await click(page, 'Got it');
    await page.locator('.ff-step-row.is-done').first().waitFor();
    // Leaving a step part-way does not complete it.
    await start();
    assert.equal(await page.locator('[data-screen]').getAttribute('data-screen'), 'breathing-practice');
    await click(page, 'Back');
    assert.equal(await page.locator('.ff-step-row.is-done').count(), 1);
    await start();
    assert.equal(await page.getByRole('button', { name: 'Record', exact: true }).count(), 0);
    await click(page, 'Fewer breaths'); await click(page, 'Fewer breaths');
    await click(page, 'Play');
    await click(page, 'Next step', { timeout: 20000 });
    await page.locator('.ff-step-row.is-done').nth(1).waitFor();
    await start(); await click(page, 'Next'); await click(page, 'Got it');
    await start();
    await page.locator('.ff-speed input').fill('10');
    for (let round = 0; round < 3; round++) {
      await click(page, 'Play');
      await page.locator('.ff-cheer').waitFor();
      if (round < 2) await click(page, 'Keep going');
    }
    assert.equal(await page.getByRole('button', { name: 'Keep going' }).count(), 0);
    await click(page, 'Next step');
    await start();
    await click(page, 'Next'); await click(page, 'Next'); await click(page, 'Next');
    await page.locator('.ff-affirm textarea').fill('My words count');
    await click(page, 'Done');
    await start();
    assert.equal(await page.getByRole('button', { name: 'Done', exact: true }).isDisabled(), true);
    await click(page, 'Easy'); await click(page, 'Done');
    await page.getByRole('dialog', { name: 'Day complete!' }).waitFor();
    await click(page, 'Keep going');
    // The next day waits for the next calendar date.
    assert.equal(await page.getByRole('button', { name: 'Day 2 (locked)', exact: true }).count(), 1, 'Day 2 waits until tomorrow');
    await page.getByText('This day opens tomorrow').waitFor();
    assert.equal(await page.locator('.ff-plan-go').count(), 0);
    await click(page, 'Today');
    await page.locator('.ff-today.is-waiting').getByText('Opens tomorrow').waitFor();
    await page.getByText('See you tomorrow for a new day.').waitFor();
    await click(page, 'Training');
    // Repeating a finished step is allowed, and does not celebrate the day a second time.
    await click(page, 'Day 1');
    const finishedAt = () => page.evaluate(() => { const d = JSON.parse(localStorage.getItem('fluency-flow-progress-v1')); return d.extra[d.active].program['0:0']; });
    const firstFinished = await finishedAt();
    await page.locator('.ff-step-row').first().click();
    await click(page, 'Next'); await click(page, 'Next'); await click(page, 'Got it');
    assert.equal(await page.getByRole('dialog').count(), 0, 'No second celebration');
    assert.equal(await finishedAt(), firstFinished, 'A replay keeps the first finish time');
    // An adult can open any locked day, but only by solving the sum.
    await click(page, 'Day 5 (locked)');
    const openDay = 'Open this day (for parents and therapists)';
    await click(page, openDay);
    await page.getByText('Solve this sum to open or lock this day.').waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button', { name: 'Day 5 (locked)', exact: true }).count(), 1, 'Closing the sum opens nothing');
    await click(page, openDay); await passGate();
    assert.equal(await page.getByRole('button', { name: 'Day 5', exact: true }).count(), 1);
    await page.locator('.ff-plan-go').waitFor();
    await page.waitForFunction(() => document.activeElement?.classList.contains('ff-plan-go'), null, { timeout: 3000 });
    await click(page, 'Today');
    assert.match(await page.locator('.ff-today').textContent(), /Day 5/);
    await click(page, 'Training');
    assert.match(await page.locator('.ff-plan-time').textContent(), /Day 5/);
    // A mistake can be undone until the day is started.
    await click(page, 'Lock this day again'); await passGate();
    assert.equal(await page.getByRole('button', { name: 'Day 5 (locked)', exact: true }).count(), 1);
    await page.waitForFunction(() => document.activeElement?.classList.contains('ff-unlock'), null, { timeout: 3000 });
    await click(page, 'Today');
    await page.locator('.ff-today.is-waiting').waitFor();
    // On a later date, the next day opens by itself.
    await page.evaluate(() => {
      const d = JSON.parse(localStorage.getItem('fluency-flow-progress-v1')), program = d.extra[d.active].program;
      for (const key of Object.keys(program)) program[key] = Date.now() - 2 * 86400000;
      localStorage.setItem('fluency-flow-progress-v1', JSON.stringify(d));
    });
    await page.reload();
    assert.match(await page.locator('.ff-today').textContent(), /Day 2/);
    assert.equal(await page.locator('.ff-today.is-waiting').count(), 0);
    await click(page, 'Training');
    assert.equal(await page.getByRole('button', { name: 'Day 2', exact: true }).count(), 1, 'Day 2 opens on the next date');
    await page.locator('.ff-plan-go').waitFor();
    // The side menu reaches any part of the app and leaves a program step cleanly.
    const inMenu = name => page.locator('.ff-drawer').getByRole('button', { name, exact: true }).click();
    await click(page, 'Menu');
    await page.locator('.ff-drawer-item[aria-current="page"]').waitFor();
    await inMenu('Cancellations');
    await page.locator('[data-screen="cancellation-practice"]').waitFor();
    assert.equal(await page.locator('.ff-drawer').count(), 0);
    await click(page, 'Menu');
    await inMenu('Regulated Breathing');
    assert.match(await page.locator('h1').textContent(), /Regulated Breathing/);
    await click(page, 'Menu');
    await inMenu('Situation board');
    await page.locator('[data-screen="situations"]').waitFor();
    await click(page, 'Menu');
    await page.mouse.click(380, 400);
    assert.equal(await page.locator('.ff-drawer').count(), 0, 'An outside tap closes the menu');
    await click(page, 'Menu');
    await inMenu('Today');
    await page.locator('[data-screen="home"]').waitFor();
    // The therapist window: a wrong password opens nothing, and the note reflects real practice.
    await click(page, 'Therapist');
    assert.equal(await page.getByLabel('Password').evaluate(el => el === document.activeElement), true, 'The password field takes focus');
    await page.getByLabel('Password').fill('111');
    await click(page, 'Unlock');
    await page.getByText('That password is not correct.').waitFor();
    assert.equal(await page.locator('.ff-therapist').count(), 0);
    assert.equal(await page.getByLabel('Password').inputValue(), '');
    await page.getByLabel('Password').fill('013');
    await click(page, 'Unlock');
    const window_ = page.locator('.ff-therapist');
    await window_.waitFor();
    const practiced = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('fluency-flow-progress-v1')); return d.entries[d.active]; });
    const slowerDone = practiced.filter(entry => entry.screen === 'slower-rate-practice' && !['conversation', 'situations'].includes(entry.category)).length;
    assert.ok(slowerDone > 0);
    assert.match(await window_.locator('.ff-goal[data-goal="slower"]').textContent(), new RegExp(`${Math.round(slowerDone / 20 * 100)}%.*${slowerDone} / 20`));
    assert.match(await window_.locator('.ff-goal[data-goal="daily"]').textContent(), /1 \/ 14/, 'Day 1 is finished');
    assert.match(await window_.locator('.ff-goal[data-goal="kindWords"]').textContent(), /1 \/ 14/);
    assert.match(await window_.locator('.ff-goal[data-goal="selfRating"]').textContent(), /1 \/ 14/);
    assert.match(await window_.locator('.ff-goal[data-goal="situations"]').textContent(), /0 \/ 5.*Not started/);
    for (const heading of ['S · Subjective', 'O · Objective', 'A · Assessment', 'P · Plan']) await window_.getByRole('heading', { name: heading }).waitFor();
    assert.match(await window_.locator('.ff-soap-card.is-a').textContent(), /how much was practiced, not how fluent/);
    assert.match(await window_.locator('.ff-soap-card.is-p').textContent(), /Working on now/);
    // The graph: eight bars ending today, growing towards today, with one goal or all of them.
    assert.equal(await window_.locator('.ff-chart-col').count(), 8);
    const barValues = () => window_.locator('.ff-chart-col').evaluateAll(bars => bars.map(bar => Number(bar.getAttribute('aria-label').match(/(\d+)%$/)[1])));
    const everything = await barValues();
    assert.ok(everything.at(-1) > 0, 'Today has a value');
    assert.deepEqual(everything, [...everything].sort((a, b) => a - b), 'Achievement never falls');
    await window_.locator('.ff-goal[data-goal="slower"] .ff-goal-select').click();
    assert.match(await window_.locator('.ff-chart figcaption').textContent(), /slower rate/);
    assert.equal((await barValues()).at(-1), Math.round(slowerDone / 20 * 100));
    await window_.locator('.ff-chart-table summary').click();
    assert.match(await window_.locator('.ff-chart-table tbody tr').last().textContent(), new RegExp(`${Math.round(slowerDone / 20 * 100)}%`));
    // The therapist's own rating replaces the count, reaches the overall figure and the graph, and can be undone.
    const onset = window_.locator('.ff-goal[data-goal="onset"]');
    const onsetField = onset.getByRole('spinbutton');
    const overallBefore = await window_.locator('.ff-overall > strong').textContent();
    await onsetField.fill('60');
    await onsetField.press('Enter');
    await onset.getByText('Set by therapist').waitFor();
    assert.match(await onset.locator('.ff-goal-top').textContent(), /60%/);
    assert.notEqual(await window_.locator('.ff-overall > strong').textContent(), overallBefore);
    await onset.locator('.ff-goal-select').click();
    assert.equal((await barValues()).at(-1), 60);
    // Leaving the field saves too, and values stay within 0 to 100.
    await onset.getByRole('spinbutton').fill('150');
    await window_.getByRole('textbox').click();
    await onset.getByText('Achieved').waitFor();
    assert.equal(await onset.getByRole('spinbutton').inputValue(), '100');
    // An empty field changes nothing.
    await onset.getByRole('spinbutton').fill('');
    await window_.getByRole('textbox').click();
    assert.equal(await onset.getByRole('spinbutton').inputValue(), '100');
    await onset.getByRole('button', { name: /Use the practice count again/ }).click();
    assert.equal(await onset.getByText('Set by therapist').count(), 0);
    await onset.getByRole('spinbutton').fill('35');
    await onset.getByRole('spinbutton').press('Enter');
    await onset.getByText('Set by therapist').waitFor();
    await window_.getByRole('textbox').fill('Doing well with turtle talk.');
    // The share icon gives the whole note as text.
    if (name === 'chromium') {
      await page.evaluate(() => { Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }); });
      await window_.getByRole('button', { name: 'Share summary', exact: true }).click();
      await window_.getByRole('status').filter({ hasText: 'Summary copied' }).waitFor({ state: 'attached' });
      const soapText = await page.evaluate(() => navigator.clipboard.readText());
      for (const part of [/Long-term goal/, /easy onsets.*35% \(Set by therapist\)/, /slower rate.*%/, /S · Subjective/, /O · Objective/, /A · Assessment/, /P · Plan/, /not how fluent/, /Doing well with turtle talk/]) assert.match(soapText, part);
    }
    await page.keyboard.press('Escape');
    assert.equal(await window_.count(), 0);
    // Reopening asks again, and the note was kept.
    await click(page, 'Therapist');
    await page.getByLabel('Password').waitFor();
    await page.getByLabel('Password').fill('013');
    await click(page, 'Unlock');
    assert.equal(await window_.getByRole('textbox').inputValue(), 'Doing well with turtle talk.');
    assert.match(await window_.locator('.ff-goal[data-goal="onset"] .ff-goal-top').textContent(), /35%/, 'The rating was kept');
    await page.keyboard.press('Escape');
    // Tools: situations and tricky words are kept and reach the stuttering exercises.
    await click(page, 'Tools');
    await click(page, 'Situation board');
    await page.locator('.ff-situation').first().click();
    await page.locator('.ff-levels button').first().click();
    assert.match(await page.locator('.ff-situations').textContent(), /Very easy/);
    await click(page, 'Back');
    await click(page, 'My tricky sounds');
    await page.locator('.ff-categories').getByRole('button', { name: 'Words', exact: true }).click();
    await page.getByLabel('Add a word').fill('pizza');
    await click(page, 'Add');
    await page.locator('.ff-word-chips').getByText('pizza').waitFor();
    await page.reload();
    await click(page, 'Stuttering Modification'); await click(page, 'Preparatory Sets');
    await click(page, 'My words');
    assert.match(await page.locator('.ff-practice-card').textContent(), /pizza/);
    // Use a fresh context for native dialog animations and media events.
    await context.close();
    context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    page = await context.newPage(); page.setDefaultTimeout(8000);
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await click(page, 'Switch to English'); await easy(page);
    await click(page, 'Play');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(() => document.querySelector('[data-playing]').getAttribute('data-playing') === 'false');
    await page.evaluate(() => { delete document.hidden; });
    await click(page, 'Information');
    assert.equal(await page.locator('main').evaluate(el => el.inert), true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.getByRole('dialog').evaluate(el => el.contains(document.activeElement)), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button', { name: 'Information', exact: true }).evaluate(el => el === document.activeElement), true);
    await click(page, 'Practice'); await click(page, 'A'); await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.match(await page.locator('.ff-practice-card').textContent(), /apple/);
    await click(page, 'التبديل إلى العربية');
    await click(page, 'التدريب'); await click(page, 'أ'); await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.match(await page.locator('.ff-practice-card').textContent(), /أرنب/);
    await click(page, 'Switch to English');
    // Mock only the microphone boundary; exercise the actual hook and controls.
    await page.evaluate(() => {
      window.mediaTest = { stopped: 0, revoked: 0, mode: 'success', mime: '', recorder: null };
      const revoke = URL.revokeObjectURL.bind(URL);
      URL.revokeObjectURL = url => { mediaTest.revoked++; revoke(url); };
      const stream = () => ({ getTracks: () => [{ stop() { mediaTest.stopped++; } }] });
      Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
        if (mediaTest.mode === 'denied') throw new DOMException('Denied', 'NotAllowedError');
        if (mediaTest.mode === 'pending') return new Promise(resolve => { mediaTest.resolve = () => resolve(stream()); });
        return stream();
      } } });
      window.MediaRecorder = class {
        static isTypeSupported(type) { return type === 'audio/mp4'; }
        constructor(stream, options) { if (mediaTest.mode === 'constructor') throw new Error('Encoder unavailable'); this.mimeType = options?.mimeType; mediaTest.mime = this.mimeType; this.state = 'inactive'; mediaTest.recorder = this; }
        start() { this.state = 'recording'; }
        stop() { this.state = 'inactive'; setTimeout(() => { this.ondataavailable?.({ data: new Blob(['audio'], { type: this.mimeType }) }); this.onstop?.(); }, 0); }
      };
    });
    await click(page, 'Record');
    await page.getByRole('button', { name: 'Stop', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => mediaTest.mime), 'audio/mp4');
    await click(page, 'Stop');
    await page.locator('audio').waitFor();
    assert.ok(await page.evaluate(() => mediaTest.stopped) >= 1);
    await click(page, 'Clear');
    assert.equal(await page.locator('audio').count(), 0);
    assert.equal(await page.evaluate(() => mediaTest.revoked), 1);
    await page.evaluate(() => { mediaTest.mode = 'denied'; }); await click(page, 'Record');
    await page.getByRole('alert').first().waitFor();
    assert.match(await page.locator('.ff-recording-feedback').textContent(), /denied/);
    await page.evaluate(() => { mediaTest.mode = 'constructor'; });
    const stopped = await page.evaluate(() => mediaTest.stopped);
    await click(page, 'Record');
    assert.ok(await page.evaluate(() => mediaTest.stopped) > stopped);
    await page.evaluate(() => { mediaTest.mode = 'pending'; }); await click(page, 'Record');
    await home(page);
    const before = await page.evaluate(() => mediaTest.stopped);
    await page.evaluate(() => mediaTest.resolve());
    assert.ok(await page.evaluate(() => mediaTest.stopped) > before, 'Late microphone grant left a live track');
    assert.equal(await page.getByRole('button', { name: 'Stop', exact: true }).count(), 0);
    assert.deepEqual(errors, []);
    await context.close();
    if (name === 'chromium') {
      const audioContext = await browser.newContext({ permissions: ['microphone'], reducedMotion: 'reduce' });
      const audioPage = await audioContext.newPage();
      audioPage.setDefaultTimeout(8000);
      await audioPage.addInitScript(() => {
        const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = async options => {
          const stream = await original(options);
          window.capturedTracks = stream.getTracks();
          return stream;
        };
      });
      await audioPage.goto(`http://127.0.0.1:${server.address().port}/index.html`);
      await click(audioPage, 'Switch to English'); await easy(audioPage);
      await click(audioPage, 'Record');
      await audioPage.getByRole('button', { name: 'Stop', exact: true }).waitFor();
      await audioPage.waitForTimeout(500);
      await click(audioPage, 'Stop');
      await audioPage.locator('audio').waitFor();
      await click(audioPage, 'Play Recording');
      await audioPage.waitForFunction(() => document.querySelector('audio')?.currentTime > 0);
      assert.equal(await audioPage.locator('audio').evaluate(audio => audio.error), null);
      assert.equal(await audioPage.evaluate(() => capturedTracks.every(track => track.readyState === 'ended')), true);
      await click(audioPage, 'Clear');
      assert.equal(await audioPage.locator('audio').count(), 0);
      await audioContext.close();
      console.log('PASS Chromium: native MediaRecorder encode, playback and track release with synthetic microphone input');
    }
    const fallback = await browser.newPage();
    await fallback.route('**/assets/app.js', route => route.abort());
    await fallback.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await fallback.getByRole('link', { name: /Reload/ }).waitFor();
    await fallback.close();
    console.log(`PASS ${name}: pause/resume, auto-advance cancellation, final page, focus trap, language reset, microphone formats/errors/races/cleanup, load fallback`);
  } finally { await browser.close(); }
}
server.listen(0, '127.0.0.1', async () => {
  try { await run(chromium, 'chromium'); if (!process.env.FLUENCY_SKIP_WEBKIT) await run(webkit, 'webkit'); }
  catch (error) { console.error(error); process.exitCode = 1; }
  finally { server.close(); }
});
