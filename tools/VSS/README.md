# VSS

VOC (words), SENB (sentences), and Taffaha (syllables) are activity areas inside one installable PWA. Open `/tools/VSS/` on HTTPS or localhost. Install **احكي حلو** from that page or any activity page; all use the same manifest, identity, scope, and VOC icon.

```text
tools/VSS/
  index.html                 VSS home
  manifest.webmanifest       One installation identity
  sw.js                      One worker for every activity
  assets/                    Shared download/update client and release inventory
  icons/                     VOC installation icons
  voc/                       Vocabulary activities and media
  senb/                      Sentence activities and media
  taffaha/                   Syllable activities and media
  scripts/                   Unified release build
  tests/                     Suite integrity and PWA lifecycle checks
```

The app picker and report links inside VSS offer only VOC, SENB, and Taffaha for every account, including Hamada. The 1–2–3 countdown switches activity areas in the same window. Child accounts, reports, parent gates, and progress retain their existing storage keys. No browser data is deleted by the merge. The two sound apps remain outside VSS and retain their existing access rules.

The homepage shows the active child's name and **الحسابات**. Parents can create or select an account there after the parent gate. Creating or signing into a child account from the homepage or any activity area registers the same identity in VOC, SENB, and Taffaha automatically. Existing accounts are enrolled when returning to the homepage without replacing any progress. Saved avatars, search/sort, protected Hamada controls, and the individual activity profile controls remain available. Accounts and progress are local to this device/browser.

The download icon at the left of the احكي حلو homepage header opens one shared 0–100% download: all 7,234 media files (about 144 MB) across the three areas. Activity logos do not start downloads. Their header home icon returns to احكي حلو. Downloads resume on another VSS screen and reuse unchanged files after updates. Installation saves the complete interface; media downloads remain opt-in. Updates install the complete suite before offering **تحديث الآن / لاحقًا**, and activation reloads every open VSS window.

Downloads belong to the service worker rather than a visible page. Where available, Background Fetch hands the files to the browser so they keep downloading after all app windows close. Other browsers use a six-file worker queue that continues while background execution is allowed. A phone can suspend a browser or home-screen shortcut; returning to any VSS screen or reconnecting automatically resumes the saved request without downloading saved revisions again. Fully closed/suspended downloads cannot be guaranteed on browsers without Background Fetch. Completion is verified against Cache Storage, saved across reopening, and shown on the suite home as a green check and 100%; the dialog closes after 1.8 visible seconds. Error feedback stays available for retry.

Build and check from the repository root:

```sh
npm run build --prefix tools/VSS
node tools/VSS/tests/static.cjs
node tools/VSS/tests/accounts-browser.cjs
node tools/VSS/tests/pwa-browser.cjs
APP_NATIVE_FETCH=1 node tools/VSS/tests/pwa-browser.cjs
APP_ENGINE=webkit node tools/VSS/tests/pwa-browser.cjs
APP_FULL_CATALOG=1 node tools/VSS/tests/pwa-browser.cjs
node tools/shared/build-pwa-releases.cjs --site
```

The build requires no npm installation. Browser checks currently use the Playwright dependency in `voc/node_modules`; install VOC's dev dependencies if needed. Existing module build commands rebuild the whole VSS release.

The Pages build generates compatibility redirects and replacement workers for the former `/tools/voc/`, `/tools/senb/`, and `/tools/taffaha/` URLs. There are no duplicate source app directories. Old links preserve their query strings and activity fragments. Existing installations at those old URLs remain separate installation identities; install VSS from its new URL. Browser progress remains available in the same origin/storage context. Separately installed iOS apps can have isolated storage, so automatic transfer from those installations is not guaranteed.

VOC matching uses square destination cards with the square draggable source below them in portrait and landscape. The final memory pair waits for the complete word audio before the automatic path moves on. Pause and exit still cancel playback.

Parent messages show a short list of practiced words/sentences, compact assessed-result counts and one home activity, without listing game names. Each child’s message window lasts six hours; generated messages and edited drafts then clear, including on reopening after the app was closed. Result ingestion cursors remain so resumed games do not refill the message with old observations. Learning progress and reports are retained.

In VOC automatic production, every response face (0–3) saves the selected score and advances to the next word. Only 3 counts as correct production. The note icon opens the four-face scoring guide; saved scores remain available after pause/reload and in session reports.
