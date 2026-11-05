// Therapy goals: achievement comes only from recorded practice, and the graph follows it over time.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const load = file => import(`data:text/javascript;base64,${fs.readFileSync(path.resolve(__dirname, file)).toString('base64')}`);
(async () => {
  const { GOALS, GOAL_GROUPS, LONG_TERM_GOAL, THERAPIST_PASSWORD, achievementOverTime, buildRecord, easyShare, goalEasyShare, goalProgress, nextGoal, overallPercent, withScore, workingOn } = await load('../assets/goals.js');
  const { categoriesByScreen } = await load('../assets/practice.js');
  const goal = id => GOALS.find(item => item.id === id);
  const now = new Date(2026, 10, 20, 15).getTime();
  const day = 86400000;
  assert.equal(THERAPIST_PASSWORD, '013');

  // Every goal is complete in both languages and points at something that exists in the app.
  assert.ok(LONG_TERM_GOAL.en && LONG_TERM_GOAL.ar);
  for (const item of GOALS) {
    assert.ok(item.en && /[ء-ي]/.test(item.ar), item.id);
    assert.ok(item.target > 0, item.id);
    assert.ok(GOAL_GROUPS.some(group => group.id === item.group), item.id);
    if (item.source === 'speech') assert.ok(categoriesByScreen[item.screen], item.screen);
  }
  assert.equal(new Set(GOALS.map(item => item.id)).size, GOALS.length);

  // An empty record is zero everywhere, not an error.
  const empty = buildRecord([], {}, []);
  assert.equal(overallPercent(empty), 0);
  assert.deepEqual(goalProgress(goal('slower'), empty), { done: 0, target: 20, percent: 0, status: 'notStarted', manual: false });
  assert.equal(achievementOverTime(null, empty, now).hasData, false);
  assert.deepEqual(workingOn(empty, now), []);
  assert.equal(nextGoal(empty, now).id, 'slower');
  assert.equal(easyShare([]), null);

  const practice = (screen, category, count, ago, rating) => Array.from({ length: count }, (_, index) => ({ at: now - ago * day + index, screen, category, rating }));
  const entries = [
    ...practice('slower-rate-practice', 'words', 5, 1, 1),
    ...practice('slower-rate-practice', 'sentences', 5, 3, 3),
    ...practice('slower-rate-practice', 'conversation', 3, 1),
    ...practice('easy-onset-practice', 'situations', 2, 1),
    ...practice('breathing-practice', undefined, 3, 2)
  ];
  const extra = {
    tried: { family: now - day, shop: now - 2 * day },
    selfRatings: [{ at: now - day, value: 2 }],
    affirmations: [now - day, now - 2 * day],
    situations: { family: 1 }
  };
  const record = buildRecord(entries, extra, [now - day]);

  // Each goal counts only its own practice. Free speech goes to the carry-over goal, not the technique.
  assert.deepEqual(goalProgress(goal('slower'), record), { done: 10, target: 20, percent: 50, status: 'working', manual: false });
  assert.equal(goalProgress(goal('onset'), record).done, 0);
  assert.equal(goalProgress(goal('conversation'), record).done, 5);
  assert.equal(goalProgress(goal('breath'), record).done, 3);
  assert.equal(goalProgress(goal('situations'), record).done, 2);
  assert.equal(goalProgress(goal('daily'), record).done, 1);
  assert.equal(goalProgress(goal('selfRating'), record).done, 1);
  assert.equal(goalProgress(goal('kindWords'), record).done, 2);

  // Achievement is capped at 100, and overall is the average across all goals.
  const lots = buildRecord(practice('pull-out-practice', 'words', 40, 1), {}, []);
  assert.deepEqual(goalProgress(goal('pull'), lots), { done: 40, target: 15, percent: 100, status: 'achieved', manual: false });
  assert.equal(overallPercent(lots), Math.round(100 / GOALS.length));
  assert.equal(goalEasyShare(goal('slower'), record), 50, 'Half of the rated practice was easy');
  assert.equal(goalEasyShare(goal('breath'), record), null, 'Unrated practice has no share');

  // The graph: eight bars ending today, never falling, by day for a short record.
  const series = achievementOverTime('slower', record, now);
  assert.equal(series.unit, 'day');
  assert.equal(series.bars.length, 8);
  assert.equal(series.bars.at(-1).percent, 50);
  assert.equal(series.bars.at(-2).percent, 50, 'Yesterday had all ten practices');
  assert.equal(series.bars.at(-3).percent, 25, 'Two days ago had only the first five');
  assert.equal(series.bars[0].percent, 0);
  assert.equal(new Date(series.bars.at(-1).end).getDate(), new Date(now).getDate());
  assert.deepEqual(series.bars.map(bar => bar.percent), series.bars.map(bar => bar.percent).sort((a, b) => a - b));
  assert.equal(achievementOverTime(null, record, now).bars.at(-1).percent, overallPercent(record));

  // Longer records move to weeks, then to four-week blocks.
  const older = buildRecord(practice('slower-rate-practice', 'words', 10, 30), {}, []);
  assert.equal(achievementOverTime('slower', older, now).unit, 'week');
  const oldest = buildRecord(practice('slower-rate-practice', 'words', 10, 120), {}, []);
  assert.equal(achievementOverTime('slower', oldest, now).unit, 'month');

  // The plan: what was practiced this week, most first, then the next open goal.
  const current = workingOn(record, now).map(item => item.id);
  assert.equal(current[0], 'slower');
  assert.ok(current.includes('breath'));
  assert.ok(!current.includes('onset'));
  assert.equal(nextGoal(record, now).id, 'onset');
  const stale = buildRecord(practice('slower-rate-practice', 'words', 3, 30), {}, []);
  assert.deepEqual(workingOn(stale, now), [], 'Old practice is not current work');
  const achievedOnly = buildRecord(practice('pull-out-practice', 'words', 20, 1), {}, []);
  assert.ok(!workingOn(achievedOnly, now).some(item => item.id === 'pull'), 'An achieved goal is not current work');
  // The therapist's rating replaces the count from its date, and the graph keeps the history.
  let scores = withScore({}, 'slower', 30, now - 3 * day);
  scores = withScore(scores, 'slower', 80, now - day);
  const rated = buildRecord(entries, { ...extra, goalScores: scores }, [now - day]);
  assert.deepEqual(goalProgress(goal('slower'), rated), { done: 10, target: 20, percent: 80, status: 'working', manual: true });
  const ratedBars = achievementOverTime('slower', rated, now).bars.map(bar => bar.percent);
  assert.deepEqual(ratedBars.slice(-4), [30, 30, 80, 80]);
  assert.equal(goalProgress(goal('slower'), rated, now - 5 * day).manual, false, 'Before the first rating, the count applies');
  assert.ok(overallPercent(rated) > overallPercent(record));
  // A rating can lower a goal too, so the graph can fall.
  const lowered = buildRecord(entries, { ...extra, goalScores: withScore(scores, 'slower', 20, now) }, []);
  assert.equal(goalProgress(goal('slower'), lowered).percent, 20);
  // One rating per date: a correction replaces that day's rating.
  const corrected = withScore(withScore({}, 'pull', 40, now), 'pull', 45, now + 1000);
  assert.equal(corrected.pull.length, 1);
  assert.equal(corrected.pull[0].percent, 45);
  // Values stay in range, and rubbish is ignored.
  assert.equal(withScore({}, 'pull', 150, now).pull[0].percent, 100);
  assert.equal(withScore({}, 'pull', -5, now).pull[0].percent, 0);
  assert.equal(withScore({}, 'pull', 42.6, now).pull[0].percent, 43);
  assert.deepEqual(withScore({}, 'pull', 'abc', now), {});
  // A rating of 100 achieves the goal, and it leaves the current work and next-goal lists.
  const met = buildRecord(entries, { goalScores: withScore({}, 'slower', 100, now) }, []);
  assert.equal(goalProgress(goal('slower'), met).status, 'achieved');
  assert.ok(!workingOn(met, now).some(item => item.id === 'slower'));
  assert.notEqual(nextGoal(met, now).id, 'slower');
  // A rating on a goal with no practice counts as started, and shows on the graph.
  const noPractice = buildRecord([], { goalScores: withScore({}, 'light', 25, now) }, []);
  assert.equal(goalProgress(goal('light'), noPractice).status, 'working');
  assert.equal(achievementOverTime('light', noPractice, now).hasData, true);
  // Returning to the count keeps earlier ratings in the graph.
  const back = withScore(withScore({}, 'slower', 90, now - 2 * day), 'slower', null, now);
  const backRecord = buildRecord(entries, { goalScores: back }, []);
  assert.deepEqual(goalProgress(goal('slower'), backRecord), { done: 10, target: 20, percent: 50, status: 'working', manual: false });
  assert.equal(achievementOverTime('slower', backRecord, now).bars.at(-2).percent, 90);
  console.log('PASS goals in both languages, practice counted once, capped achievement, therapist ratings, graph over time, and the plan');
})().catch(error => { console.error(error); process.exitCode = 1; });
