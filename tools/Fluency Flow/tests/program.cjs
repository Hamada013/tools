// The daily program: content is complete in both languages, and days and steps open in order.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const load = file => import(`data:text/javascript;base64,${fs.readFileSync(path.resolve(__dirname, file)).toString('base64')}`);
(async () => {
  const { PROGRAM, LESSONS, SITUATIONS, AFFIRMATIONS, currentDay, dayFinishedAt, dayMinutes, daysDone, isDayDone, isDayOpen, isProgramDone, isWaitingForTomorrow, lockReason, markStep, nextStep, suggestedSituation } = await load('../assets/program.js');
  const { categoriesByScreen } = await load('../assets/practice.js');
  assert.equal(PROGRAM.length, 14);
  for (const [day, steps] of PROGRAM.entries()) {
    assert.ok(steps.length >= 4, `Day ${day + 1} has enough steps`);
    assert.ok(dayMinutes(day) <= 15, `Day ${day + 1} stays short: ${dayMinutes(day)} minutes`);
    assert.equal(steps.at(-1).type, 'selfRating', `Day ${day + 1} ends with a self-rating`);
    for (const step of steps) {
      if (step.type === 'lesson') assert.ok(LESSONS[step.topic], step.topic);
      if (step.type === 'exercise') assert.ok(step.category === 'myWords' || categoriesByScreen[step.screen].includes(step.category), `${step.screen} ${step.category}`);
    }
  }
  for (const slides of Object.values(LESSONS)) for (const slide of slides) { assert.equal(slide.length, 4); slide.forEach(text => assert.ok(text.trim())); }
  for (const item of [...SITUATIONS, ...AFFIRMATIONS]) { assert.ok(item.en); assert.match(item.ar, /[ء-ي]/); }
  // Only the first day starts open, and each day opens when the one before is finished.
  let done = {};
  assert.equal(isDayOpen(done, 0), true); assert.equal(isDayOpen(done, 1), false);
  assert.equal(currentDay(done), 0); assert.equal(nextStep(done, 0), 0);
  done = markStep(done, 0, 0, 1);
  assert.equal(nextStep(done, 0), 1); assert.equal(isDayDone(done, 0), false);
  PROGRAM[0].forEach((_, index) => { done = markStep(done, 0, index, 1); });
  assert.equal(isDayDone(done, 0), true); assert.equal(isDayOpen(done, 1), true); assert.equal(isDayOpen(done, 2), false);
  assert.equal(currentDay(done), 1); assert.equal(daysDone(done), 1);
  PROGRAM.forEach((steps, day) => steps.forEach((_, index) => { done = markStep(done, day, index, 1); }));
  assert.equal(daysDone(done), 14); assert.equal(currentDay(done), 13);
  assert.equal(isProgramDone(done), true);
  // One new day per calendar date, however late the day before was finished.
  const finishedDay = new Date(2026, 10, 10, 15).getTime();
  const tonight = new Date(2026, 10, 10, 23, 59).getTime();
  const nextMorning = new Date(2026, 10, 11, 0, 1).getTime();
  const finishDay = (from, day, at) => PROGRAM[day].reduce((list, _, index) => markStep(list, day, index, at), from);
  const first = finishDay({}, 0, finishedDay);
  assert.equal(dayFinishedAt(first, 0), finishedDay);
  assert.equal(dayFinishedAt({}, 0), null);
  assert.equal(lockReason(first, 1, { now: tonight }), 'tomorrow');
  assert.equal(isDayOpen(first, 1, { now: tonight }), false);
  assert.equal(isDayOpen(first, 1, { now: nextMorning }), true);
  assert.equal(lockReason(first, 2, { now: nextMorning }), 'earlier', 'Only the next day opens');
  assert.equal(isWaitingForTomorrow(first, undefined, tonight), true);
  assert.equal(isWaitingForTomorrow(first, undefined, nextMorning), false);
  assert.equal(isWaitingForTomorrow({}, undefined, tonight), false, 'A new person can start at once');
  // A day finished across midnight counts from its last step.
  const acrossMidnight = PROGRAM[0].reduce((list, _, index) => markStep(list, 0, index, index === PROGRAM[0].length - 1 ? nextMorning : tonight), {});
  assert.equal(lockReason(acrossMidnight, 1, { now: nextMorning + 3600000 }), 'tomorrow');
  // A wrong device clock must not lock the next day for good.
  assert.equal(isDayOpen(finishDay({}, 0, nextMorning), 1, { now: finishedDay }), true);
  // Replaying a step the next day keeps its first time, so the next day stays open.
  const replayed = markStep(first, 0, 0, nextMorning);
  assert.equal(dayFinishedAt(replayed, 0), finishedDay);
  assert.equal(isDayOpen(replayed, 1, { now: nextMorning }), true);
  // An adult can open any day, which moves the person there and can be undone.
  assert.equal(isDayOpen(first, 5, { now: tonight }), false);
  assert.equal(isDayOpen(first, 5, { unlocked: { 5: 1 }, now: tonight }), true);
  assert.equal(currentDay(first, { 5: 1 }), 5);
  assert.equal(currentDay(first, {}), 1);
  assert.equal(isWaitingForTomorrow(first, { 5: 1 }, tonight), false);
  // Finishing that day leads on to the one after, which then waits for its date.
  const jumped = finishDay(first, 5, finishedDay);
  assert.equal(currentDay(jumped, { 5: 1 }), 6);
  assert.equal(lockReason(jumped, 6, { unlocked: { 5: 1 }, now: tonight }), 'tomorrow');
  assert.equal(isDayOpen(jumped, 6, { unlocked: { 5: 1 }, now: nextMorning }), true);
  assert.equal(isDayOpen(jumped, 3, { unlocked: { 5: 1 }, now: nextMorning }), false, 'Skipped days stay closed');
  // Finishing the last day completes the program, even if an adult skipped days.
  assert.equal(isProgramDone(finishDay({}, PROGRAM.length - 1, finishedDay)), true);
  assert.equal(isWaitingForTomorrow(finishDay({}, PROGRAM.length - 1, finishedDay), { [PROGRAM.length - 1]: 1 }, tonight), false);
  // Real-life tries start with the easiest situation not yet tried.
  assert.equal(suggestedSituation({ present: 5, family: 1, shop: 2 }, {}).id, 'family');
  assert.equal(suggestedSituation({ present: 5, family: 1, shop: 2 }, { family: 1 }).id, 'shop');
  assert.equal(suggestedSituation({}, {}).id, SITUATIONS[0].id);
  console.log('PASS 14 days, both languages, order of days and steps, one new day per date, adult opening, short sessions and easiest-first situations');
})().catch(error => { console.error(error); process.exitCode = 1; });
