# Default app home style

The user selected the Syllables Builder (مقطع, formerly `tools/VSS/taffaha`) home-screen style as the project default for future apps. It now lives in its own repository, `Hamada013/syllables-builder` (local folder `../syllables-builder` next to this website). Other examples are `../vocabulary-builder/index.html` (كلمة) and `../sentences-builder/index.html` (جملة).

- Use a light background (`#f8fafc`) with soft green and blue radial washes. Use dark blue text (`#22445a`), muted secondary text (`#5c7285`), and pale borders (`#dceaf4`).
- Use the system font stack: system-ui, -apple-system, Segoe UI, Tahoma, Arial, sans-serif.
- Place a compact white header across the top, with the app logo/name on the right in RTL and compact rounded icon controls on the left. Keep touch targets at least 44px and visible keyboard focus.
- Center the app logo, title, and one short subtitle above the activity choices. Keep the app's own identity and existing routes.
- Arrange primary actions in two columns. Use white cards with a 28px radius, a pale border, a subtle shadow, a plain outline icon without a colored circle or tile, and a short label. Use local outline SVGs. For four actions, keep a two-by-two grid and reduce vertical spacing to fit the viewport.
- Keep action icons free of decorative background shapes on home screens, game menus, and activity toolbars. Use the same transparent 44px header controls across VOC, SENB, and Taffaha. Preserve meaningful learning cues, selection states, and answer feedback.
- Keep shared header controls in this physical left-to-right order when present: workspace settings, activity list, download, end session, information, family practice, report, and home/back. Apply the matching DOM order in RTL so keyboard navigation follows the layout. Each builder app keeps its own `assets/app-navigation.js` and `.css`; there is no apps or profile control.
- Show the contact footer in four centered lines: SPEECH AND LANGUAGE PATHOLOGY, Ahmad Ghanem, Latakia - Syria, and the email link.
- Scale logo sizes and spacing with viewport height. Adapt to short landscape screens and allow vertical scrolling when needed. Keep safe-area insets and reduced-motion preferences.
- Keep home styling scoped so activity screens retain their existing layout. Vocabulary Builder and Sentences Builder each keep their own `assets/home.css` copy of the reusable home pattern. Each builder app has its own manifest, worker, offline download and update release.
- After editing a builder app, run `node scripts/build-pwa.cjs` in its repository to regenerate its release, then run `npm test` and `npm run test:browser`.

## Download and update controls

Each builder app (كلمة, جملة, مقطع) shows one compact download icon in its home header, labeled «تنزيل التطبيق للعمل دون اتصال». It saves only that app's media. App logos are artwork or home navigation only; they never open downloads, and nothing links back to this website. The separate sound apps retain logo downloads. The dialog contains only a «تنزيل» action, a 0–100% progress bar, and the percentage. Keep error feedback hidden unless a download fails. Omit installation help, install buttons, file/size details, and extra download actions.

Use the local `assets/updates.js` and `assets/updates.css` pattern to check for a new complete service-worker release on app opening. Offer «تحديث الآن» and «لاحقًا» in a separate modal. Keep the existing release active when postponed; reload all open app windows after acceptance. Check the published site rather than GitHub commits, since a commit may not have deployed yet. Regenerate release manifests for every publication.

Each builder repository has `tests/standalone-browser.cjs`. It serves the app under its GitHub Pages path and verifies the app's own launch logo, no name prompt, no links out of the app, the single learner, the download through the home header icon, cache isolation and offline reopening (`APP_ENGINE=webkit` for Safari's engine).

`tools/shared/updates.js` also owns the worker-readiness helper used by app downloads. An early download tap waits for the app's own worker; failed installation leaves a usable retry in the same tab. The two sound apps sync their copies from `tools/shared`; each builder app keeps its own copy. The browser check covers early taps and failed-install retries; use `APP_FULL_CATALOG=1` to verify complete production catalogs, or `APP_ENGINE=webkit` for Safari's browser engine.

For GitHub Pages publication, use `.github/workflows/pages.yml` and `node tools/shared/build-pwa-releases.cjs --site` to rebuild the two sound app manifests and verify the staged website before deployment. Select GitHub Actions as the Pages source once; see `docs/app-publication.md`. `node tools/tests/update-readiness.cjs` also verifies Safari's already-claimed activating worker, correct controller identity, failed setup and retry. The builder apps publish from their own repositories with the same GitHub Actions approach.

The split sound apps (`tools/arabicsounds` and `tools/auditory-rehabilitation`) use the same home/download/update conventions. Their five-action home grids use compact spacing, while each app retains its own activity engine, media catalog, manifest, logo, icons, and scoped caches. The old `tools/aswati` entry handles saved-link migration only.

For activity-screen redesigns, the user also selected Taffaha as the layout and interaction reference: calm cards, compact icon-only controls with accessible labels, and minimal routine status/instruction text. Respect an activity's requested automatic flow.

The builder apps (كلمة, جملة, مقطع) are standalone: no app picker, no transitions to another app, and no links back to this website. Reports cover the app's own learner only.

## Shared account controls

### Dropdowns and option menus

Use styled dropdowns for new or edited option controls across the website. Match the app's rounded white cards, pale borders, dark blue text, clear outline chevron, soft shadow, and green selected row with a check. Keep triggers and options at least 44px tall. Use custom option lists so Safari also receives the intended styling; keep the underlying select's value and input/change events when enhancing a form field. Support associated labels, combobox/listbox semantics, arrow keys, Home/End, Enter/Space, Escape, Tab, and outside dismissal. Fit lists inside the dialog and viewport on phones and short screens. The reusable source is `tools/shared/styled-dropdowns.js/css`; Ling includes local copies in its offline shell.

Each builder app has its own startup screen (`assets/welcome.js` and `welcome.css`). A direct opening or manual reload animates that app's own logo and name, then types «مرحبا». It never asks for a child's name: there are no child accounts, and one learner per device is created automatically.

Internal activity links, report pages, browser back/forward and automatic update reloads skip startup. Automatic reloads use both session storage and a history-state fallback. Never use a permanent “seen” flag. The update offer waits until welcome finishes; service-worker setup and downloads run independently.

Keep both welcome files in each app's offline shell and rebuild release hashes after editing them. Verify with `npm run test:browser` in the app's repository.

Hamada is protected in both sound apps: never show a delete control for it, and reject its deletion in the shared account logic. Hide Hamada from saved-account lists and search until the user types `Hamada` in the name entry and signs in. Only the active Hamada account has its own account bar. Other saved accounts use a grid of circular, varied avatars with names underneath; the same identity keeps the same avatar. Add name search and creation-date/alphabet sorting. Under Hamada, each child has a compact trash icon with an accessible label and a minimum 44px touch target. Keep the parent gate and deletion confirmation. Regular child accounts have no delete controls.

Use simple local outline SVG fruit and animal icons for child avatars, with a consistent stroke and muted colors; do not use emoji glyphs. Assign them randomly without duplicate avatars and retain the same assignment through search, sorting, reloads and app switching. Store icon assignments separately from learning progress in `speech-account-avatars-v1`. Large lists can use distinct icon combinations after the individual icons are allocated. Migrate older emoji assignments without changing account progress.

Use the shared custom sorting menu instead of a native select: a compact trigger, white rounded menu, small outline icons, and a subtle green selected row with a check. Support arrows, Home/End, Enter/Space, Escape, Tab and outside dismissal. Keep all choices visible inside the account dialog on phones and short screens. Verify in Chrome and WebKit with `node tools/tests/account-style-browser.cjs` (also `APP_ENGINE=webkit`).

Sound-app accounts come from `tools/shared/sound-accounts.js` and the account styles in `tools/shared/flow-ui.css`; run `node tools/shared/sync-navigation.cjs` and rebuild both sound-app release manifests after editing them. Verify with `node tools/tests/standalone-sound-accounts.cjs` and `node tools/tests/compact-games-accounts-browser.cjs` (also `APP_ENGINE=webkit`).

## End of session and parent homework

VOC, SENB, and Taffaha each have the same plain flag icon, labeled «إنهاء الجلسة ورسالة الأهل», on the home screen only. Returning home or finishing a game does not end the parent-summary session; pressing this icon ends it and opens an editable Arabic message beginning «مرحبًا ماما وبابا». Collect work across the app's activities and reloads for the active child, including practice and unfinished assessments. Keep practice separate from recorded results and avoid claims of mastery. Suggest a short home activity using that session's actual words, sentences, or syllables, with pointing and nonverbal responses welcome. Reopening without new work shows the last message; new work starts a fresh session. An empty session gives an honest empty state. Preserve the message locally and offer copy, without sending it automatically.

The shared sources are `tools/shared/session-homework.js` and `tools/shared/session-homework.css`. Sync local copies and rebuild all three offline releases. Verify with `node tools/tests/session-homework.cjs` and `node tools/tests/session-homework-browser.cjs`.

Workplace settings, activity lists and app pickers are mutually exclusive. Close panels after choosing an action or tapping outside; preserve keyboard focus indicators without persistent pointer rings or header-toggle underlines.

All three workplace settings panels include the same «درس البيت للأهل» family icon. It previews the active session without ending it, supports local edits, copy, and sharing when available. Use one of ten short activities per app, tied to actual session targets; SENB separates sentence goals from word-only practice.

VOC's «المسار التلقائي» starts with workplace practice, then the test, then the selected games without setup/result interruptions. Keep routine instructions and extra controls hidden in that path; preserve pause, audio recovery and error feedback. A corrected answer advances but never becomes first-attempt success.

## Sound apps

The two sound apps are independent applications, like the three builder apps: no app picker, cross-app report links, account transfers, or shared active-child state, including for Hamada. Keep the existing calm home/activity styles, protected Hamada controls, parent gate, exclusive panels, accessible icon controls, and logo downloads.

Each sound app owns its own `<appId>-children-v1` and `<appId>-account-avatars-v1` stores. On upgrade, copy only registered accounts and that app’s sound results from the legacy `voc-children-v1` store once; preserve the legacy store and do not synchronize subsequent changes. Keep reports, deletion and parent messages scoped to the current app. Record real practice separately from assessments, preserve partial sessions, and retain storage-failure feedback.

Sound-app shared sources include `sound-accounts.js`, `sound-navigation.js`, `sound-progress.js`, `sound-suite.js/css`, and `detection-game.js/css` in `tools/shared`. The sync script must not replace standalone controls with another app's account/navigation implementation. Each app has its own manifest, worker, release, icons and screenshots; each directory must work when hosted independently over HTTPS. Rebuild both affected release manifests after changes. Validate isolation with `node tools/tests/standalone-sound-accounts.cjs` and PWA behavior with `node tools/tests/split-sounds-browser.cjs`.

Arabic Sounds' Ling detection uses an ear on the physical left and toy/bucket on the right; on portrait phones the ear sits above the game. Change toy shape and color each round independently of the shuffled sound/silence sequence. Dragging the toy into the bucket means sound; dragging the × or tapping it means silence. Preserve keyboard/tap alternatives, permit Ling responses after listening completes, and record each response once. Ling has six sound and six silent rounds; keep its six-sound results and silent-round false alarms distinct in its report.

Auditory Rehabilitation uses tick/cross detection with a more visible animated ear and accepts responses during playback. Its ten detection rounds remain balanced. Both discrimination levels and every identification set allow live dragging, show the dropped image and tick/cross feedback, and keep all choices visible during a white-glove practice demonstration. Short duration cards and timelines are yellow, long ones blue; include stripes and corner dots, wider timelines, and shuffled test positions. Memory automatically counts to three, introduces every pair together with gentle highlighting, then covers the cards. Use three colored frequency columns in the library, with pagination on small screens rather than page scrolling. Its reports use actual-record charts with practice and models separate from assessment accuracy. See [auditory-rehabilitation.md](auditory-rehabilitation.md) for frequency-analysis details, build dependencies and browser/download verification.

Validate with `node tools/tests/sound-suite.cjs`, `node tools/tests/sound-suite-browser.cjs` (also `APP_ENGINE=webkit`), `node tools/tests/app-transition-browser.cjs`, and `node tools/tests/split-sounds-browser.cjs`. Rebuild each affected offline release after syncing.

In VOC and SENB, move the demonstrated answer to a different choice position before the child’s turn whenever another position exists. A random shuffle alone is insufficient because it can leave the target unchanged. Persist the new choice order through pause/reload, and keep answer indices and drag handlers aligned with the visible cards.

SENB's workplace play control first offers two icons: play the displayed sentence(s), or add more. The additive picker starts in the active category/subgroup, retains both split boards, supports multiple selections across subgroups, and never replaces the workplace while browsing. Closing it cancels only the extra selection.

VOC automatic games fit all current choices and the matching source card within the remaining viewport, including portrait phones and short landscape screens. Show one progress star per selected word, carrying memory progress across its batches. Model memory pairs automatically before the child's turn. Use the four local `images/41` faces for production scores 0–3 (no response; syllable/articulation errors; correct syllables with articulation errors; correct production). In the automatic path, each of the four production scores records the response and advances to the next word. Preserve the selected score through reloads and in reports; only score 3 counts as correct production. Include an icon that opens a short explanation of all four faces. `assets/production-counts.json` owns explicit beat counts for the complete vocabulary bank and shares existing divisions with Taffaha where available; the bank builder checks labels before applying counts. Keep syllable beats circular and playable under the production card. The settings panel reserves its measured height plus a clear gap above workplace cards.

Verify these flows with `node tools/tests/automation-layout-browser.cjs` (also `APP_ENGINE=webkit`).

VOC standalone games and tests share the same compact, viewport-fitted layout as the automatic path: stars, card choices and icon-only pause/replay controls, with routine headings, counters and instructional text hidden. Keep required setup selections, accessible labels and actionable error feedback. The expressive game's metronome is a white frame like Taffaha's: pressing the frame plays every beat in order; individual circles play one beat. Stop and clear all beat highlights when pausing, replaying speech, grading or changing cards.

The builder apps have no child accounts and no Hamada account; one learner per device is created automatically on first launch.

Sound-app account grid sources are `tools/shared/sound-accounts.js` and `tools/shared/flow-ui.css`; each app supplies its native account/report actions. Validate with `node tools/tests/compact-games-accounts-browser.cjs` (also `APP_ENGINE=webkit`), then sync and rebuild the affected offline releases.

## Standalone builder apps

كلمة (Vocabulary Builder), جملة (Sentences Builder) and مقطع (Syllables Builder) were the VSS suite (احكي حلو). Each now has its own repository and address: https://hamada013.github.io/vocabulary-builder/, https://hamada013.github.io/sentences-builder/ and https://hamada013.github.io/syllables-builder/. Each has its own manifest, icons, worker, offline download and update release, and stores progress under its own key (`vocabulary-builder-v1`, `sentences-builder-v1`, `syllables-builder-v1`). The tools page links to them with full addresses; they never link back. The website's Pages build forwards the old `tools/VSS/…` and `tools/voc|senb|taffaha/…` addresses to the new apps, and the old suite worker hands open windows over, removes the suite's caches and unregisters.
