# Default app home style

The user selected the `tools/VSS/taffaha` home-screen style as the project default for future apps. Existing examples are `tools/VSS/taffaha/index.html`, `tools/VSS/voc/index.html`, and `tools/VSS/senb/index.html`.

- Use a light background (`#f8fafc`) with soft green and blue radial washes. Use dark blue text (`#22445a`), muted secondary text (`#5c7285`), and pale borders (`#dceaf4`).
- Use the system font stack: system-ui, -apple-system, Segoe UI, Tahoma, Arial, sans-serif.
- Place a compact white header across the top, with the app logo/name on the right in RTL and compact rounded icon controls on the left. Keep touch targets at least 44px and visible keyboard focus.
- Center the app logo, title, and one short subtitle above the activity choices. Keep the app's own identity and existing routes.
- Arrange primary actions in two columns. Use white cards with a 28px radius, a pale border, a subtle shadow, a plain outline icon without a colored circle or tile, and a short label. Use local outline SVGs. For four actions, keep a two-by-two grid and reduce vertical spacing to fit the viewport.
- Keep action icons free of decorative background shapes on home screens, game menus, and activity toolbars. Use the same transparent 44px header controls across VOC, SENB, and Taffaha. Preserve meaningful learning cues, selection states, and answer feedback.
- Keep shared header controls in this physical left-to-right order when present: workspace settings, activity list, apps, end session, information, family practice, report, profile, and home/back. Apply the matching DOM order in RTL so keyboard navigation follows the layout. Edit `tools/shared/app-navigation.js` and `tools/shared/app-navigation.css`, then sync the three local copies.
- Show the contact footer in four centered lines: SPEECH AND LANGUAGE PATHOLOGY, Ahmad Ghanem, Latakia - Syria, and the email link.
- Scale logo sizes and spacing with viewport height. Adapt to short landscape screens and allow vertical scrolling when needed. Keep safe-area insets and reduced-motion preferences.
- Keep home styling scoped so activity screens retain their existing layout. `tools/VSS/voc/assets/home.css` and `tools/VSS/senb/assets/home.css` are identical local copies of the reusable home pattern; keep them synchronized. The three activity areas share the VSS manifest, worker, offline download, and update release.
- After editing any VSS activity, run `npm run build --prefix tools/VSS` to regenerate the complete suite release, then run the relevant checks.

## Download and update controls

For the VSS suite (احكي حلو), show one compact download icon at the physical left of the suite homepage header, labeled «تنزيل محتوى التطبيقات الثلاثة». Activity logos in كلمة, جملة and مقطع are artwork or home navigation only; they never open downloads. Their headers link back to احكي حلو. The separate sound apps retain logo downloads. Its dialog contains only a «تنزيل» action, a 0–100% progress bar, and the percentage. Keep error feedback hidden unless a download fails. Omit installation help, install buttons, file/size details, and extra download actions.

Use the local `assets/updates.js` and `assets/updates.css` pattern to check for a new complete service-worker release on app opening. Offer «تحديث الآن» and «لاحقًا» in a separate modal. Keep the existing release active when postponed; reload all open app windows after acceptance. Check the published site rather than GitHub commits, since a commit may not have deployed yet. Regenerate release manifests for every publication.

The shared browser regression check is `tools/tests/pwa-controls-browser.cjs`. From the repository root, run `APP_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node tools/tests/pwa-controls-browser.cjs` after installing VOC's dev dependencies. It uses small catalogs of real media to verify download completion, offline reopening, update deferral, and activation across multiple open windows.

`tools/shared/updates.js` also owns the worker-readiness helper used by VOC, SENB and Taffaha downloads. An early download tap waits for the app's own worker; failed installation leaves a usable retry in the same tab. Keep its five local copies synchronized. The browser check covers early taps and failed-install retries; use `APP_FULL_CATALOG=1` to verify complete production catalogs, or `APP_ENGINE=webkit` for Safari's browser engine.

For GitHub Pages publication, use `.github/workflows/pages.yml` and `node tools/shared/build-pwa-releases.cjs --site` to rebuild VSS and the two sound app manifests and verify the staged website before deployment. Select GitHub Actions as the Pages source once; see `docs/app-publication.md`. `node tools/tests/update-readiness.cjs` also verifies Safari's already-claimed activating worker, correct controller identity, failed setup and retry.

The split sound apps (`tools/arabicsounds` and `tools/auditory-rehabilitation`) use the same home/download/update conventions. Their five-action home grids use compact spacing, while each app retains its own activity engine, media catalog, manifest, logo, icons, and scoped caches. The old `tools/aswati` entry handles saved-link migration only.

For activity-screen redesigns, the user also selected Taffaha as the layout and interaction reference: calm cards, compact icon-only controls with accessible labels, and minimal routine status/instruction text. Respect an activity's requested automatic flow.

When switching between VOC, SENB, and Taffaha (including report links), blur the current app behind a compact white transition card. Show the destination app logo on the right and the same colorful 1–2–3 count on the left, at 800ms per number, then navigate. Preserve this physical layout in RTL and on small screens. Reduced motion keeps the count without animation. Verify with `node tools/tests/app-transition-browser.cjs` (also supports `APP_ENGINE=webkit`).

## Shared account controls

### Dropdowns and option menus

Use styled dropdowns for new or edited option controls across the website. Match the app's rounded white cards, pale borders, dark blue text, clear outline chevron, soft shadow, and green selected row with a check. Keep triggers and options at least 44px tall. Use custom option lists so Safari also receives the intended styling; keep the underlying select's value and input/change events when enhancing a form field. Support associated labels, combobox/listbox semantics, arrow keys, Home/End, Enter/Space, Escape, Tab, and outside dismissal. Fit lists inside the dialog and viewport on phones and short screens. The reusable source is `tools/shared/styled-dropdowns.js/css`; Ling includes local copies in its offline shell.

VOC, SENB and Taffaha share the local `tools/shared/welcome.js/css` startup screen. A direct opening or manual reload animates the app's complete logo, types «مرحبا», then asks for the child's name only when no account is active. Returning children continue with their existing account. Respect reduced motion and keep the name form usable on short screens. Preserve the parent gate when saved child accounts already exist.

Internal activity links, app-picker/report transitions, browser back/forward and automatic account/update reloads skip startup. App navigation writes a short-lived, one-use destination token only when navigation actually happens. Automatic reloads use both session storage and a history-state fallback. Never use a permanent “seen” flag. Profile adapters connect to the shared welcome controller instead of opening a second first-run name dialog. The update offer waits until welcome finishes; service-worker setup and downloads run independently.

Keep both welcome files in each app's offline shell and rebuild release hashes after editing them. Verify with `node tools/tests/welcome-launch.cjs`, `node tools/tests/welcome-browser.cjs` (also `APP_ENGINE=webkit`), and the full-catalog PWA checks above.

Hamada is protected in all five apps: never show a delete control for it, and reject its deletion in the shared account logic. Hide Hamada from saved-account lists and search until the user types `Hamada` in the name entry and signs in. Only the active Hamada account has its own account bar. Other saved accounts use a grid of circular, varied avatars with names underneath; the same identity keeps the same avatar across apps. Add name search and creation-date/alphabet sorting. Under Hamada, each child has a compact trash icon with an accessible label and a minimum 44px touch target. Keep the parent gate and deletion confirmation. Regular child accounts have no delete controls.

Use simple local outline SVG fruit and animal icons for child avatars, with a consistent stroke and muted colors; do not use emoji glyphs. Assign them randomly without duplicate avatars and retain the same assignment through search, sorting, reloads and app switching. Store icon assignments separately from learning progress in `speech-account-avatars-v1`. Large lists can use distinct icon combinations after the individual icons are allocated. Migrate older emoji assignments without changing account progress.

Use the shared custom sorting menu instead of a native select: a compact trigger, white rounded menu, small outline icons, and a subtle green selected row with a check. Support arrows, Home/End, Enter/Space, Escape, Tab and outside dismissal. Keep all choices visible inside the account dialog on phones and short screens. Verify in Chrome and WebKit with `node tools/tests/account-style-browser.cjs` (also `APP_ENGINE=webkit`).

Edit `tools/shared/accounts.js` and the account styles in `tools/shared/flow-ui.css`, then run `node tools/shared/sync-navigation.cjs` and rebuild all three release manifests. Verify with `node tools/tests/account-avatars.cjs`, `node tools/tests/account-deletion.cjs` and `node tools/tests/account-deletion-browser.cjs`; the browser check also supports `APP_ENGINE=webkit`.

## End of session and parent homework

VOC, SENB, and Taffaha each have the same plain flag icon, labeled «إنهاء الجلسة ورسالة الأهل», on the home screen only. Returning home or finishing a game does not end the parent-summary session; pressing this icon ends it and opens an editable Arabic message beginning «مرحبًا ماما وبابا». Collect work across the app's activities and reloads for the active child, including practice and unfinished assessments. Keep practice separate from recorded results and avoid claims of mastery. Suggest a short home activity using that session's actual words, sentences, or syllables, with pointing and nonverbal responses welcome. Reopening without new work shows the last message; new work starts a fresh session. An empty session gives an honest empty state. Preserve the message locally and offer copy, without sending it automatically.

The shared sources are `tools/shared/session-homework.js` and `tools/shared/session-homework.css`. Sync local copies and rebuild all three offline releases. Verify with `node tools/tests/session-homework.cjs` and `node tools/tests/session-homework-browser.cjs`.

Workplace settings, activity lists and app pickers are mutually exclusive. Close panels after choosing an action or tapping outside; preserve keyboard focus indicators without persistent pointer rings or header-toggle underlines.

All three workplace settings panels include the same «درس البيت للأهل» family icon. It previews the active session without ending it, supports local edits, copy, and sharing when available. Use one of ten short activities per app, tied to actual session targets; SENB separates sentence goals from word-only practice.

VOC's «المسار التلقائي» starts with workplace practice, then the test, then the selected games without setup/result interruptions. Keep routine instructions and extra controls hidden in that path; preserve pause, audio recovery and error feedback. A corrected answer advances but never becomes first-attempt success.

## Sound apps

VOC/SENB/Taffaha retain their shared picker and accounts. The two sound apps are independent applications: no app picker, cross-app report links, account transfers, or shared active-child state, including for Hamada. Keep the existing calm home/activity styles, protected Hamada controls, parent gate, exclusive panels, accessible icon controls, and logo downloads.

Each sound app owns its own `<appId>-children-v1` and `<appId>-account-avatars-v1` stores. On upgrade, copy only registered accounts and that app’s sound results from the legacy `voc-children-v1` store once; preserve the legacy store and do not synchronize subsequent changes. Keep reports, deletion and parent messages scoped to the current app. Record real practice separately from assessments, preserve partial sessions, and retain storage-failure feedback.

Sound-app shared sources include `sound-accounts.js`, `sound-navigation.js`, `sound-progress.js`, `sound-suite.js/css`, and `detection-game.js/css` in `tools/shared`. The sync script must not replace standalone controls with the VSS account/navigation implementations. Each app has its own manifest, worker, release, icons and screenshots; each directory must work when hosted independently over HTTPS. Rebuild both affected release manifests after changes. Validate isolation with `node tools/tests/standalone-sound-accounts.cjs` and PWA behavior with `node tools/tests/split-sounds-browser.cjs`.

Arabic Sounds' Ling detection uses an ear on the physical left and toy/bucket on the right; on portrait phones the ear sits above the game. Change toy shape and color each round independently of the shuffled sound/silence sequence. Dragging the toy into the bucket means sound; dragging the × or tapping it means silence. Preserve keyboard/tap alternatives, permit Ling responses after listening completes, and record each response once. Ling has six sound and six silent rounds; keep its six-sound results and silent-round false alarms distinct in its report.

Auditory Rehabilitation uses tick/cross detection with a more visible animated ear and accepts responses during playback. Its ten detection rounds remain balanced. Both discrimination levels and every identification set allow live dragging, show the dropped image and tick/cross feedback, and keep all choices visible during a white-glove practice demonstration. Short duration cards and timelines are yellow, long ones blue; include stripes and corner dots, wider timelines, and shuffled test positions. Memory automatically counts to three, introduces every pair together with gentle highlighting, then covers the cards. Use three colored frequency columns in the library, with pagination on small screens rather than page scrolling. Its reports use actual-record charts with practice and models separate from assessment accuracy. See [auditory-rehabilitation.md](auditory-rehabilitation.md) for frequency-analysis details, build dependencies and browser/download verification.

Validate with `node tools/tests/sound-suite.cjs`, `node tools/tests/sound-suite-browser.cjs` (also `APP_ENGINE=webkit`), `node tools/tests/app-transition-browser.cjs`, and `SOUNDS_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node tools/tests/split-sounds-browser.cjs`. Rebuild each affected offline release after syncing.

In VOC and SENB, move the demonstrated answer to a different choice position before the child’s turn whenever another position exists. A random shuffle alone is insufficient because it can leave the target unchanged. Persist the new choice order through pause/reload, and keep answer indices and drag handlers aligned with the visible cards.

SENB's workplace play control first offers two icons: play the displayed sentence(s), or add more. The additive picker starts in the active category/subgroup, retains both split boards, supports multiple selections across subgroups, and never replaces the workplace while browsing. Closing it cancels only the extra selection.

VOC automatic games fit all current choices and the matching source card within the remaining viewport, including portrait phones and short landscape screens. Show one progress star per selected word, carrying memory progress across its batches. Model memory pairs automatically before the child's turn. Use the four local `images/41` faces for production scores 0–3 (no response; syllable/articulation errors; correct syllables with articulation errors; correct production). In the automatic path, each of the four production scores records the response and advances to the next word. Preserve the selected score through reloads and in reports; only score 3 counts as correct production. Include an icon that opens a short explanation of all four faces. `assets/production-counts.json` owns explicit beat counts for the complete vocabulary bank and shares existing divisions with Taffaha where available; the bank builder checks labels before applying counts. Keep syllable beats circular and playable under the production card. The settings panel reserves its measured height plus a clear gap above workplace cards.

Verify these flows with `node tools/tests/automation-layout-browser.cjs` (also `APP_ENGINE=webkit`).

VOC standalone games and tests share the same compact, viewport-fitted layout as the automatic path: stars, card choices and icon-only pause/replay controls, with routine headings, counters and instructional text hidden. Keep required setup selections, accessible labels and actionable error feedback. The expressive game's metronome is a white frame like Taffaha's: pressing the frame plays every beat in order; individual circles play one beat. Stop and clear all beat highlights when pausing, replaying speech, grading or changing cards.

Only the active Hamada account can reset its own VOC, SENB and Taffaha activity from its account bar. Confirm in a dialog with only cross/tick icons and an explicit Hamada-only description. Keep every child account and all child progress, Hamada's identity and sound-app data, and downloaded media intact. Reset revisions block stale tabs from restoring cleared work; invalidate scoped game drafts and Hamada's three parent summaries. Never use a whole-origin storage clear.

Shared account grid/reset sources are `tools/shared/accounts.js` and `tools/shared/flow-ui.css`; each app supplies its native account/report actions. Validate with `node tools/tests/hamada-reset.cjs` and `node tools/tests/compact-games-accounts-browser.cjs` (also `APP_ENGINE=webkit`), then sync and rebuild the affected offline releases.

## VSS installation

VOC, SENB and Taffaha live under `tools/VSS/` and form one installable app named احكي حلو, using VOC's icon. Every activity references `../manifest.webmanifest`. Keep one root worker and one complete release; never register separate module workers. The root home follows the same Taffaha visual style, with «مع حمادة» as its only subtitle. The activity names are كلمة (VOC), جملة (SENB), and مقطع (Taffaha). The shared download saves media from all three areas, and the update offer activates the complete suite across all open windows. See [VSS README](../tools/VSS/README.md).
