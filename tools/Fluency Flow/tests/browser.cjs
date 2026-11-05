const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.FLUENCY_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  let relative;
  try { relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); res.end(); return; }
  const file = path.resolve(root, '.' + (relative.endsWith('/') ? relative + 'index.html' : relative));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
const routes = [
  ['Fluency Shaping', 'Slower Rate', 'slower-rate-practice'],
  ['Fluency Shaping', 'Easy Onsets', 'easy-onset-practice'],
  ['Fluency Shaping', 'Light Contacts', 'light-contact-practice'],
  ['Stuttering Modification', 'Cancellations', 'cancellation-practice'],
  ['Stuttering Modification', 'Pull-outs', 'pull-out-practice'],
  ['Stuttering Modification', 'Preparatory Sets', 'prep-set-practice'],
  ['Breathing Techniques', 'Diaphragmatic Breathing (Belly Breathing)', 'breathing-practice']
];
async function click(page, name) { await page.getByRole('button', { name, exact: true }).click(); }
async function go(page, route) {
  await click(page, route[0]); await click(page, route[1]);
  await page.locator(`[data-screen="${route[2]}"]`).waitFor();
  await page.locator('.ff-practice-card').waitFor();
}
async function home(page) {
  while (await page.locator('[data-screen]').getAttribute('data-screen') !== 'home') await click(page, (await page.locator('html').getAttribute('lang')) === 'ar' ? 'رجوع' : 'Back');
}
async function layout(page, label) {
  await page.waitForTimeout(250);
  const issues = await page.evaluate(() => {
    const vw = innerWidth;
    const buttons = [...document.querySelectorAll('button')].filter(el => el.getClientRects().length && !el.closest('[inert]'));
    return {
      width: document.documentElement.scrollWidth, vw,
      small: buttons.map(el => ({ name: el.getAttribute('aria-label') || el.title || el.textContent, r: el.getBoundingClientRect() })).filter(({r}) => r.width < 43 || r.height < 43).map(({name,r}) => [name, r.width, r.height]),
      outside: buttons.filter(el => { if (el.closest('.ff-days, .ff-practice .ff-categories')) return false; const r = el.getBoundingClientRect(); return r.left < -1 || r.right > vw + 1; }).map(el => el.title || el.textContent),
      unnamed: buttons.filter(el => !el.textContent.trim() && !el.title && !el.getAttribute('aria-label')).map(el => el.outerHTML.slice(0, 140)),
      // Nothing scrolls the page or falls off the screen, and only long lists scroll inside themselves.
      fit: (() => {
        const problems = [];
        const screen = document.querySelector('[data-screen]').dataset.screen;
        const over = el => el.scrollHeight > el.clientHeight + 1;
        if (document.documentElement.scrollHeight > innerHeight + 1) problems.push(`page scrolls ${document.documentElement.scrollHeight} > ${innerHeight}`);
        const section = document.querySelector('.ff-main > section');
        if (section && !['plan', 'situations', 'feared', 'progress'].includes(screen) && over(section)) problems.push(`${screen} content ${section.scrollHeight} > ${section.clientHeight}`);
        const guide = document.querySelector('.ff-guide');
        if (guide && !guide.querySelector('.ff-flow-stories') && over(guide)) problems.push(`word area ${guide.scrollHeight} > ${guide.clientHeight}`);
        const card = document.querySelector('.ff-practice-card');
        if (card && over(card)) problems.push(`card ${card.scrollHeight} > ${card.clientHeight}`);
        for (const el of document.querySelectorAll('.ff-action')) if (over(el)) problems.push(`card text clipped: ${el.textContent.slice(0, 30)}`);
        if (!document.querySelector('.ff-dialog') && section && !['plan', 'situations', 'feared', 'progress'].includes(screen)) {
          for (const el of document.querySelectorAll('button')) {
            if (!el.getClientRects().length) continue;
            const r = el.getBoundingClientRect();
            if (r.bottom > innerHeight + 1 || r.top < -1) problems.push(`off screen: ${el.getAttribute('aria-label') || el.textContent.slice(0, 24)}`);
          }
        }
        return problems;
      })(),
      strayContact: (() => {
        const copy = document.body.cloneNode(true);
        copy.querySelectorAll('.ff-contact').forEach(el => el.remove());
        return document.querySelectorAll('footer').length + (/SPEECH AND LANGUAGE|Ahmad Ghanem|Latakia|slp\.ahmadghanem/i.test(copy.textContent) ? 1 : 0);
      })(),
      lowContrast: contrastProblems()
    };
    // Pastel colours make contrast easy to lose, so check real text and icons on every screen.
    // Gradients are judged against their worst colour. Disabled controls are exempt, as in WCAG.
    function contrastProblems() {
      const opaque = text => [...text.matchAll(/rgba?\(([^)]+)\)/g)].map(match => match[1].split(/[\s,/]+/).map(Number)).filter(color => color[3] === undefined || color[3] > .95);
      const luminance = ([r, g, b]) => { const part = value => { value /= 255; return value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; }; return .2126 * part(r) + .7152 * part(g) + .0722 * part(b); };
      const ratio = (a, b) => { const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (light + .05) / (dark + .05); };
      const behind = element => {
        for (let node = element; node; node = node.parentElement) {
          const style = getComputedStyle(node), found = [...opaque(style.backgroundImage), ...opaque(style.backgroundColor)];
          if (found.length) return found;
        }
        return [[255, 255, 255]];
      };
      const shown = element => element.getClientRects().length && !element.closest('[inert], :disabled, [aria-disabled="true"], .ff-sr-only');
      const problems = [];
      const check = (element, needed, label) => {
        const color = opaque(getComputedStyle(element).color)[0];
        if (!color) return;
        const worst = Math.min(...behind(element).map(back => ratio(color, back)));
        if (worst < needed) problems.push(`${label} ${worst.toFixed(2)} (needs ${needed})`);
      };
      for (const element of document.querySelectorAll('body *')) {
        if (!shown(element) || ![...element.childNodes].some(node => node.nodeType === 3 && node.textContent.trim())) continue;
        const style = getComputedStyle(element), size = parseFloat(style.fontSize);
        check(element, size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700) ? 3 : 4.5, element.textContent.trim().slice(0, 30));
      }
      for (const icon of document.querySelectorAll('button svg')) if (shown(icon)) check(icon, 3, `icon in ${icon.closest('button').getAttribute('aria-label') || icon.closest('button').textContent.trim().slice(0, 24)}`);
      return problems;
    }
  });
  assert.ok(issues.width <= issues.vw + 1, `${label}: horizontal overflow ${JSON.stringify(issues)}`);
  assert.deepEqual(issues.small, [], `${label}: small controls`);
  assert.deepEqual(issues.outside, [], `${label}: clipped controls`);
  assert.deepEqual(issues.unnamed, [], `${label}: unnamed controls`);
  assert.equal(issues.strayContact, 0, `${label}: contact details belong only in the home information dialog`);
  assert.deepEqual(issues.lowContrast, [], `${label}: low contrast`);
  assert.deepEqual(issues.fit, [], `${label}: does not fit the screen`);
}
async function run(type, name) {
  const options = { headless: true };
  if (name === 'chromium' && fs.existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')) options.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await type.launch(options);
  try {
    // A small iPhone, an iPhone, a sideways phone, an upright iPad, a sideways iPad and a big screen.
    for (const [width, height] of (process.env.FLUENCY_SMOKE ? [[390, 844]] : [[320, 568], [390, 844], [844, 390], [768, 1024], [1024, 768], [1366, 900]])) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 1000, reducedMotion: 'reduce' });
      await context.route('https://**', route => route.abort());
      const page = await context.newPage();
      page.setDefaultTimeout(8000);
      const errors = [];
      page.on('pageerror', err => { errors.push(err.message); console.error('Page error:', err.message); });
      await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
      await page.locator('[data-screen="home"]').waitFor();
      await layout(page, `${name} ${width} Arabic home`);
      await click(page, 'Switch to English');
      assert.equal(await page.locator('html').getAttribute('dir'), 'ltr');
      await click(page, 'Information');
      await page.getByRole('dialog').waitFor();
      await layout(page, `${name} ${width} About`);
      assert.equal(await page.getByRole('dialog').getByRole('link', { name: 'slp.ahmadghanem@gmail.com', exact: true }).count(), 1);
      // The home information button shows these four lines and nothing else.
      assert.deepEqual((await page.getByRole('dialog').innerText()).split('\n').map(line => line.trim()).filter(Boolean), ['SPEECH AND LANGUAGE PATHOLOGY', 'Ahmad Ghanem', 'Latakia - Syria', 'slp.ahmadghanem@gmail.com', 'WhatsApp: +963988451245']);
      assert.equal(await page.getByRole('dialog').getByRole('link', { name: 'WhatsApp: +963988451245', exact: true }).getAttribute('href'), 'https://wa.me/963988451245');
      assert.equal(await page.locator('main').evaluate(el => el.inert), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('dialog').count(), 0);
      // Cards are the same size on every screen, within a screen at any width and across screens when wide enough.
      await page.waitForTimeout(150);
      const cardSizes = () => page.locator('.ff-action').evaluateAll(cards => [...new Set(cards.map(card => { const r = card.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`; }))]);
      assert.equal((await cardSizes()).length, 1, `${name} ${width} home cards differ: ${await cardSizes()}`);
      const homeCard = (await cardSizes())[0];
      await click(page, 'Fluency Shaping');
      await page.locator('.ff-menu').waitFor();
      await page.waitForTimeout(150); // Past the entrance animation's first frame.
      assert.equal((await cardSizes()).length, 1, `${name} ${width} menu cards differ: ${await cardSizes()}`);
      assert.deepEqual(await cardSizes(), [homeCard], `${name} ${width} cards change size between screens`);
      await click(page, 'Back');
      // The side menu reaches everything, in both layouts.
      await click(page, 'Menu');
      await layout(page, `${name} ${width} side menu`);
      await page.keyboard.press('Escape');
      // The therapist window, locked and open.
      await click(page, 'Therapist');
      await layout(page, `${name} ${width} therapist lock`);
      await page.getByLabel('Password').fill('013');
      await click(page, 'Unlock');
      await page.locator('.ff-therapist').waitFor();
      await layout(page, `${name} ${width} therapist window`);
      await page.keyboard.press('Escape');
      // Daily training and tools, in both languages. The day strip scrolls by design.
      for (const round of [
        { training: 'Training', tools: 'Tools', today: 'Today', back: 'Back', locked: 'Day 5 (locked)', toggle: 'التبديل إلى العربية', items: ['Situation board', 'My tricky sounds', 'Kind words', 'How was talking today?'] },
        { training: 'البرنامج', tools: 'أدواتي', today: 'اليوم', back: 'رجوع', locked: 'اليوم 5 (مقفل)', toggle: 'Switch to English', items: ['لوحة المواقف', 'أصواتي الصعبة', 'كلمات لطيفة', 'كيف كان كلامك اليوم؟'] }
      ]) {
        await click(page, round.training);
        await layout(page, `${name} ${width} ${round.training} plan`);
        await click(page, round.locked);
        await page.locator('.ff-unlock').waitFor();
        await layout(page, `${name} ${width} ${round.training} locked day`);
        await click(page, round.tools);
        await layout(page, `${name} ${width} ${round.tools}`);
        for (const item of round.items) {
          await click(page, item);
          if (await page.locator('.ff-situation').count()) await page.locator('.ff-situation').first().click();
          await layout(page, `${name} ${width} ${item}`);
          await click(page, round.back);
        }
        await click(page, round.today);
        await click(page, round.toggle);
      }
      for (const route of routes) {
        await go(page, route);
        await layout(page, `${name} ${width} ${route[2]}`);
        assert.match(await page.locator('h1').textContent(), route[2] === 'breathing-practice' ? /Diaphragmatic/ : new RegExp(route[1]));
        assert.equal(await page.getByRole('button', { name: 'Record', exact: true }).count(), route[2] === 'breathing-practice' ? 0 : 1, `${route[2]} recording control`);
        const covered = await page.evaluate(() => {
          const bar = document.querySelector('.ff-toolbar').getBoundingClientRect(), pad = document.querySelector('.ff-touch')?.getBoundingClientRect();
          return pad ? pad.bottom > bar.top + 1 && pad.top < bar.bottom - 1 : false;
        });
        assert.equal(covered, false, `${route[2]}: toolbar covers the touch pad`);
        await click(page, 'Play');
        await page.waitForTimeout(180);
        assert.equal(await page.locator('[data-playing]').getAttribute('data-playing'), 'true');
        await layout(page, `${name} ${width} ${route[2]} playing`);
        await click(page, 'Pause');
        await click(page, 'Information');
        await page.getByRole('dialog').waitFor();
        await layout(page, `${name} ${width} strategy dialog`);
        assert.equal(await page.locator('.ff-contact').count(), 0, 'Contact details are only on the home information dialog');
        assert.equal(await page.getByRole('dialog').getByText('Recordings stay on this device').count(), route[2] === 'breathing-practice' ? 0 : 1, 'The recording note belongs where recording is available');
        await page.keyboard.press('Escape');
        await click(page, 'Reset');
        if (route[2] !== 'breathing-practice') {
          const allCategories = await page.locator('.ff-categories button').allTextContents();
          const categories = width === 390 ? allCategories : allCategories.filter(name => ['Words', 'Sentences', 'Stories'].includes(name));
          for (const category of categories) {
            await page.locator('.ff-categories').getByRole('button', { name: category, exact: true }).click();
            if (category === 'Practice') {
              await page.getByRole('dialog').waitFor();
              await layout(page, `${name} ${width} letters`);
              const [letter, word] = route[2] === 'light-contact-practice' ? ['B', 'ball'] : ['A', 'apple'];
              await click(page, letter);
              assert.ok(await page.locator('.ff-practice-card').textContent().then(text => text.includes(word)));
            }
            await layout(page, `${name} ${width} ${route[2]} ${category}`);
            await click(page, 'Next'); await click(page, 'Previous');
          }
        }
        if (width === 390) await page.screenshot({ path: `/private/tmp/fluency-${name}-${route[2]}.png`, fullPage: true });
        await click(page, 'التبديل إلى العربية');
        await layout(page, `${name} ${width} Arabic ${route[2]}`);
        if (width === 390) await page.screenshot({ path: `/private/tmp/fluency-${name}-${route[2]}-ar.png`, fullPage: true });
        await click(page, 'Switch to English');
        await home(page);
        console.log(`Checked ${name} ${width} ${route[2]}`);
      }
      assert.deepEqual(errors, [], `${name} console errors`);
      await page.reload();
      await page.locator('[data-screen="home"]').waitFor();
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      console.log(`PASS ${name} ${width}: all strategies, categories, dialogs, Arabic/English and touch layout`);
      await context.close();
    }
  } finally { await browser.close(); }
}
server.listen(0, '127.0.0.1', async () => {
  try {
    await run(chromium, 'chromium');
    if (!process.env.FLUENCY_SKIP_WEBKIT) await run(webkit, 'webkit');
  } catch (error) { console.error(error); process.exitCode = 1; }
  finally { server.close(); }
});
