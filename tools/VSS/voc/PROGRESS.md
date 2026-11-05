# Child progress and game plans

Children sign in with a name only. Profiles, workplace cards, completed practice, per-skill results, game preferences, paused games, and the active game plan are stored in this browser's local storage. Reusing a saved name opens that child's profile. There is no server account or synchronization between devices. Browser data removal also removes these profiles.

The book button beside **اختر صورة للبطاقة** switches the existing category picker between learning cards and mastered cards. A card is mastered only after both receptive and expressive evidence reach 100%. Earned mastery is retained for later review. Learned cards can still be selected and used again.

Completed workplace tests and **استمع واختر** record receptive responses. A corrected answer after an error does not count as a first-attempt success. Completed, manually graded **البطاقات السريعة** sessions record expressive responses. Skipped cards do not earn mastery; ungraded automatic viewing, matching, memory, practice, and incomplete sessions do not earn skill mastery.

Every completed workplace test offers a dismissible automatic game plan, regardless of the score. Its level, game, start, and dismiss controls are icons with accessible labels. All four games start selected. Each button can disable its game. Changing the workplace card set invalidates completed practice for that set.

| Choice | Matching / listening choices and memory pairs | Rapid observation time |
| --- | --- | --- |
| Easy | 2 | 6 seconds |
| Moderate | 4 | 4 seconds |
| Advanced | 6 | 2 seconds |

The plan carries the exact workplace cards. Choice counts are capped by the selected pool. Memory uses several boards when necessary to include every card. Before production assessment, the plan introduces every selected word once as a large picture with its full audio over a blurred play area. The subsequent production trials hide labels and do not automatically play the answer before grading. Memory boards first reveal all cards, glow each matching pair with its full audio, then cover the board. Listening starts with one unscored demonstration: the word finishes playing before the correct picture glows. Preview cursors persist across pause/reload and audio failures offer the replay control. Every workplace practice/test and newly launched or resumed game starts with a cancellable, colorful 1–2–3 animation over a blurred background. Completed automatic rounds move directly into the next game’s countdown without a result screen. The plan can be paused, resumed after reload, or stopped. A one-card template remains a one-card activity without unrelated distractors.

Run `npm test`, `npm run test:progress:browser`, and the existing game/PWA browser suites. Browser commands accept `VOC_PLAYWRIGHT` to locate Playwright; the new progress suite accepts `VOC_GAME_ENGINE=webkit` for WebKit. Rebuild the shell with `npm run build:pwa` after production edits.

## Hamada and activity reports

The reserved name **Hamada** opens an admin workspace. Its demos keep every card in its ordinary category and do not award mastery or alter another child's word records. Open Hamada's name control to find a chart button beside each child; the header chart button combines all children.

Every child has a header report icon that opens their own report directly in a popup over the app. A regular profile always sees its own history, including when a report URL specifies another child. Hamada retains the combined report and per-child admin views. Persistent icon buttons switch between all saved activity, the last 6 months, the last 3 months, the last 30 days, the last 7 days, and today; no period prompt is shown. Three- and six-month ranges use calendar-month arithmetic, clamped at month ends. Switching filters updates the same popup, and its PDF button exports the selected period. Existing report-page links remain available. The report shows session/card/category totals, comprehension and expression percentages, and bars for the categories used. Practice, memory, matching, and ungraded automatic viewing do not inflate assessment percentages. A missing score is shown as an em dash instead of 0%. The PDF button saves a report with today's numeric date and the same charts. PDF creation uses local fonts and a local library and remains available offline after downloading the app.

Dated activity is recorded from this update. Previously stored per-word results are preserved as clearly labeled earlier summaries; they cannot reconstruct missing historical sessions. Reports are local to this device/browser, like the child profiles.

Run `npm run test:admin:browser` for the admin, countdown, icon-only dialog, score-independent prompt, report filters, PDF download, and pagination regression checks.

After the final automatic round, a parents icon appears in the workplace header. It opens an editable Arabic home-play lesson with the child’s name, selected words, separate comprehension/naming results, and short routines using real objects, pictures, actions and everyday play. Unassessed words are identified explicitly. Only the completed plan supplies its results; partial plans and previews cannot replace that lesson. The note can be copied or shared through the device’s share sheet and stays available after reload. See [HOME-LESSON.md](HOME-LESSON.md) for a reusable sample.

## Protected account controls

After the first child is created, opening account controls requires a fresh simple addition/subtraction answer. The same colorful calculator, numeric keypad, keyboard and Arabic-digit input work in VOC and SENB. Incorrect answers and cancellation leave the active child unchanged. Closing the account dialog revokes the unlock; switching between the apps keeps the active child and does not ask again merely to use the other app. The SENB header links back to VOC.

Run `APP_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node tools/tests/accounts-browser.cjs` from the repository root to verify protected account changes, reciprocal links, regular-child reports/PDFs, report isolation and mobile headers. Add `APP_ENGINE=webkit` for WebKit.

## Category acquisition charts

The report's collapsed category details contain grouped bars (baby blue comprehension, green expression), paired acquisition pie charts, and a numeric table. Each domain counts unique words meeting VOC's existing all-correct acquisition rule in their latest completed test within the selected period, divided by the category's actual catalog size. Practice and partial tests show that a category was worked on without acquiring words. Repeated attempts do not increase the denominator; a later complete failed test can reduce the count. Only worked categories appear. For reports combining children, each child's catalog is a separate set of opportunities. The accuracy summaries above the charts remain response accuracy, not catalog completion. The offline PDF includes the same charts. `assets/acquisition-charts.js` and `.css` are identical local copies in VOC/SENB so each app remains independently hostable. Run `npm run test:report-charts` and `npm run test:report-charts:browser` (with `APP_ENGINE=webkit` for WebKit).

## Workplace delete mode

The trash button toggles a temporary red edit mode. Only filled cards wiggle; pressing a card empties that slot without sound or a dialog. Empty slots do nothing while the mode is active. Toggle the trash button or press Escape to finish; clearing the last card also ends the mode. Leaving the workplace, changing profiles, or starting practice/testing exits it. Deleted card assignments are saved, while delete mode itself is not restored after reload. Reduced-motion preferences keep the red borders without the wiggle. Run `npm run test:delete:browser`, with `APP_ENGINE=webkit` for WebKit. The matching local `assets/delete-mode.css` in VOC and SENB is intentionally identical.
