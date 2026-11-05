# أصوات من حولي

Standalone Arabic RTL PWA, separated from the former combined Aswati app. Serve this directory on HTTPS or localhost; it has no dependency on the other sound app or `tools/aswati`.

## Content

50 environmental sound pictures, 50 whole recordings and 100 short/long recordings. Includes discovery, sound discrimination, duration practice/tests, identification, paired memory games, and the sound library. Activity headers show only the app name; practice/test, replay, and sound-picker controls are icon-only with accessible labels. Active screens size square cards to the available width and height, including short landscape screens. Six-card Memory always uses two rows of three.

Every practice or test starts automatically after a colorful, animated 1–2–3 countdown with a blurred backdrop. Detection uses the same neutral ear overlay during sound-present and silent trials: actual sound playback controls the first duration, while silence lasts three seconds. Responses unlock after the overlay closes; routine instructional and answer-feedback text is omitted. Detection retains balanced sound/silence trials, pause/resume, ten answers, stars, and score results.

Discrimination and identification use a square ear card for target playback, replay, and dropping an answer, with no separate play button. Trial counts use Latin digits. Practice automatically demonstrates ten sounds while covering every inactive choice; open groups retain ten unique cards containing the target. Long/short practice plays the first card ten times and then the second ten times, covering the other card and keeping one-second gaps, before returning to the same listening workplace. Its test plays ten balanced trials automatically, with icon feedback and no trial-number text. Sound selection stays beside the long/short heading. The original short/long duration bars remain available when listening or practicing.

Automatic sessions use gesture-unlocked Web Audio for playback after countdowns and between trials. Leaving or hiding an activity cancels pending audio, timers, countdowns, and demonstrations; manual library and Memory playback also stops on leaving the page. Audio failures retain explicit error feedback and allow replay/restart.

The supplied logo is `images/logo.webp`. Installation icons are in `icons/`. The home uses the project home-screen style. Its download dialog offers installation when supported, offline download, and a percentage bar. Downloading saves this app's own 200 media files, verifies hashes, and resumes missing files on retry. Offline audio supports byte ranges. Cache names include this app's name and hosting scope.

Complete new releases wait for «تحديث الآن» or «لاحقًا». Update checks run when opening the app and returning online. Rebuild release manifests before publishing changes.

## Development

```sh
npm install
npm run build:icons  # Requires Python with Pillow, when changing the logo.
npm run build
npm test
npm run test:activities
npm run test:audio
npm run test:browser
```

Browser checks require Chrome and Playwright. Set `SOUNDS_PLAYWRIGHT` to an absolute installed Playwright package path if needed; `SOUNDS_ENGINE=chromium` selects Chrome for activity checks. Shared standalone checks are in `tools/tests/split-sounds-browser.cjs` and verify responsive screens, download retries, native audio decoding, offline reopening, updates, and legacy URLs.

Legacy HTML activity paths now redirect within this app to `index.html#/around/…`. Old `tools/aswati/index.html#/around/…` bookmarks redirect here.

## Independent accounts and PWA validation

This app has its own `APP_ID-children-v1` account store and `APP_ID-account-avatars-v1` avatar store (replace `APP_ID` with this directory name). Its active child, reports, deletion tombstones and parent messages are independent of the other sound app and VSS. There is no app picker or cross-app report navigation. On first upgrade, only accounts registered in this app and their own sound results are copied from the legacy shared store; the original store is preserved and later changes are not synchronized.

Install from the logo/download dialog: supported browsers show «تثبيت التطبيق» when an install prompt is available; other browsers show their menu instructions. Downloading offline media is a separate action. Each directory can be hosted by itself, including at a domain root. Keep the manifest, worker, all assets and media together, and serve over HTTPS with valid MIME types. Serve `sw.js` and `assets/release-worker.js` without long-lived HTTP caching. Publish each rebuilt release atomically so integrity hashes match the files.

The manifest includes local regular/maskable icons, scoped identity/shortcuts, standalone display, and actual narrow/wide screenshots. Submit each deployed app URL separately to PWABuilder. Local checks cannot certify the live server’s HTTPS certificate, response headers or store packaging. Run `node tools/tests/standalone-sound-accounts.cjs` and `SOUNDS_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node tools/tests/split-sounds-browser.cjs` from the repository root for migration/isolation and real offline/install/update checks.

Standalone shared sources: `tools/shared/sound-accounts.js`, `sound-navigation.js`, `sound-progress.js`, and `sound-suite.js`. The sync script keeps these separate from VSS account/navigation sources. Rebuild this app after syncing.
