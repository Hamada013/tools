# كلام وطلاقة (Fluency Flow)

The Arabic name is «كلام وطلاقة», used for the installed app and the website card. «Fluency Flow» is the English name.

Arabic and English visual practice for fluency shaping, stuttering modification, and breathing, for children and adults. At the owner's request this app has its own look rather than the site's default Taffaha style: a pastel palette of frosted mint, mauve, pink mist, vanilla custard and icy blue, defined once at the top of `assets/responsive.css`, with plain white buttons of one size that squash and spring back when pressed. The home screen's information button shows only the contact details, and there is no footer.

The app lives at `tools/Fluency Flow/index.html`. The former Resources URL redirects here; an existing old offline installation retires its worker after open sessions close. Language preference stays on the same origin.

Open `index.html` through an HTTPS website or a localhost HTTP server. The shipped app needs no package download, remote fonts, or third-party service. Run the PWA release builder after editing shipped files.

## Install and use offline

- Open the app online. Exercises are saved for offline use automatically.
- On Android or desktop Chrome/Edge, use the download icon at the top of the home screen, or the browser's install menu. Where the browser has no install prompt, the icon shows the offline status and the steps for that device.
- On iPhone/iPad, use the browser's Share menu → **Add to Home Screen**. On macOS Safari, use File → **Add to Dock**.
- Open the installed icon to use the app in its own window. All exercises, icons, information dialogs and breathing guides are cached for offline use. Browser microphone permission is still required to record.
- Installation requires HTTPS or localhost. Opening the HTML directly from disk does not enable the PWA. VS Code Live Server adds its own script to each page, which fails the release's integrity check, so offline mode stays off there; test offline with the automated checks or on the published site. An open tab under Live Server can also keep old code while its styles update, so open a fresh tab after changes. Installation options vary by platform; see [MDN's installation guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

The service worker controls only this app folder. It does not control other tools on the speech website. Recordings remain in memory and are not stored in the offline cache. Browser-managed offline storage may be cleared by the user or the operating system.

## Updating and deployment

After editing any shipped HTML, CSS, JavaScript, manifest, icon, or service worker:

```sh
node scripts/build-pwa.cjs
node scripts/build-pwa.cjs --check
```

Upload the entire app folder together to your HTTPS host. Keep `sw.js`, `assets/pwa-release.js`, and all listed assets from the same release. The hash-based cache installs a complete, verified release before activation; a failed download leaves the previous release working. New versions wait until existing app windows close, or the user chooses **Update & reload**. The update button is disabled while practicing or requesting/using the microphone; reloading clears the current session and its recordings.

App icons are generated from `assets/icons/logo.webp`. If you change it, run `node scripts/build-icons.cjs` with Sharp installed (`npm install --no-save sharp@0.34.5`), then rebuild the PWA release.

## Files

- `manifest.webmanifest`, `sw.js`, and generated `assets/pwa-release.js`: install metadata and versioned offline cache.
- `assets/pwa.js`: bilingual install guidance, offline readiness and controlled update UI.
- `assets/icons/`: WebP logo, Android icons, maskable icon and Apple touch icon.
- `assets/app.js`: translations and exercise content.
- `assets/progress.js`: people and practice history in browser storage, with the summaries and path suggestion.
- `assets/goals.js`: therapy goals, achievement, the graph's timeline and the suggested next goal.
- `assets/therapist-ui.js`: the password lock and therapist window.
- `assets/press.js`: the press animation shared by every button.
- `assets/progress-ui.js`: My Practice, the self-rating faces and the People dialog.
- `assets/touch.js`: the touch exercises, which use the steps and limits in `assets/practice.js`.
- `assets/ui.js`: the interface: one shared practice screen for all six speech exercises, the breathing guide, dialogs and session control.
- `assets/pictures.js`: concrete bilingual word mappings, local Lucide icons and supplementary SVG drawings for Easy Onset.
- `assets/practice.js`: the clinical timing rules, plus category, phrase, sound-grouping and navigation helpers. Change pacing, pauses, presets and limits here.
- `assets/recording.js`: local recording lifecycle and permission/error handling.
- `assets/dialog.js`: dialog focus management, Escape, and background scroll locking.
- `assets/vendor.js`: the existing bundled React, Motion, and icon runtime, extracted without upgrading dependencies. Treat this as a generated vendor file.
- `assets/index-B-ZKx10f.css`: the original generated theme, retained for its base reset.
- `assets/responsive.css`: the whole interface theme: palette, layout, buttons, animation, touch targets, safe areas, focus styles and reduced motion.

## Easy Onset picture cues

In Easy Onsets or Light Contacts, select Practice and choose a letter. The picture icon toggles between written words and word pictures; its pressed state indicates picture mode. Tap the letter icon to return to words. Both Arabic and English have picture cues for every practice letter. Easy Onsets lists vowels and continuants; stop consonants (ب ت د ض ط ق ك and B C D G K P Q T) are listed under Light Contacts instead. ج stays with Easy Onsets because it is usually /ʒ/ in Syrian Arabic. Picture mode includes concrete words with a recognizable local icon and excludes abstract words; the complete original lists remain in word mode. Each picture has the spoken word as its accessible name. Switching modes resets the guide and pagination, and pictures are included in the offline release.

## Touch practice

Under the card, each technique has its own activity, as an alternative to pressing Play and following the guide. Keyboard equivalents work: Space or Enter for presses and holds, arrow keys for slides.

- **Slower Rate:** no touch step. A turtle walks along a progress bar while the guide runs, at the chosen speed.
- **Easy Onset:** a ball rolls down a slide by itself. Press when it reaches the star in the middle (35–65% of the way), then say the word. Stopping too early or late gives a hint and the ball keeps going.
- **Light Contact:** tap a bubble softly. Holding it longer than 0.4 seconds pops it. A screen cannot measure pressure, so this trains a brief touch rather than a light one.
- **Cancellation:** say the word, hold through the pause (its length is the pause setting), then say it again.
- **Pull-out:** say the word, then slide out of it over at least 2 seconds.
- **Preparatory Set:** hold for 1.5 seconds to get ready, then start the word softly.

Speed runs from 0 to 10, where 10 is the normal rate. Only Slower Rate, Easy Onset and Light Contact show it. In sentences and stories, touch practice uses only the words each technique targets. The app does not hear the speech, so finishing means the steps were done. Rewards praise trying, never fluency. Limits are in `touchRules` in `assets/practice.js`, for clinician review.

## Screens and sizes

No screen scrolls the page, from a small iPhone to a large display. On phones, categories sit in one sideways-scrolling row. Sideways phones, iPads and big screens get a different layout: a side rail instead of the bottom bar, cards three across, and practice split into the word on one side and the controls on the other. Content that cannot fit scrolls inside its own panel: long stories, the program's steps on short phones, the situation board, tricky sounds, My Practice and dialogs. `tests/browser.cjs` fails if anything else overflows at any tested size.

## Clinical settings

These defaults are in `assets/practice.js` and are suggestions for clinician review:

- **Pace:** speed 0–10 maps to 40–200 syllables a minute, with 10 as the normal rate, and a word's time follows its syllable count. Arabic counts come from `ARABIC_BEATS`, which covers every word except those in stories: 167 words use VOC's checked counts and the rest were counted by hand at the same level of spoken Syrian Arabic, as described above the table. Stories have no pacing board, so their words are estimated from length, which affects pacing only. English counts come from a spelling rule with a few exceptions.
- **Slower Rate, Light Contacts and the stuttering exercises:** pause for 800 ms at punctuation and between single words.
- **Easy Onsets:** a gentle breath before every single word, and at the start of each phrase in sentences and stories. Its Words and Practice lists leave out stop-initial words; Light Contacts keeps only those. Other lists are unfiltered.
- **Cancellations, Pull-outs, Preparatory Sets:** single words are all targets; sentences and stories use one marked target in each phrase, chosen automatically as the longest word. Cancellation's pause defaults to 3 seconds and can be set from 1 to 5.
- **Breathing:** presets are 4/0/6, 3/0/4 and 3/0/6 seconds (in/hold/out). Holding is optional, the fastest cycle is 4 seconds, and practice ends after a chosen 1–10 breaths (default 5).

## Daily training

The **Training** tab is a 14-day program in `assets/program.js`, with its screens in `assets/program-ui.js`. The idea of a daily program came from apps such as Stamurai, but all wording and artwork here are original. Days and steps open in order, days take about 5–10 minutes, and an unfinished step never counts. One new day opens per calendar date on the device, the day after the previous one was finished; replaying a step does not change that date. Behind the parents' sum, **Open this day** opens any locked day and moves the person there, and **Lock this day again** undoes it until the day is started. Program content, affirmations and situations are suggestions for clinician review.

- **Situation board:** sort everyday situations from very easy to very hard. Real-life steps suggest the easiest one not yet tried.
- **My tricky sounds:** choose sounds to practice, and add words that appear as **My words** in the stuttering modification exercises.
- **Kind words:** read one aloud three times, then write your own. They value the person's message and do not promise fluent speech.
- **Self-rating:** one five-point rating per program day. The shared summary includes recent ratings.

Everything is saved per person in `fluency-flow-progress-v1`. Motion stops under the reduced-motion setting, except for essential progress indicators.

## Therapist window

The **Therapist** button in the bottom bar, also in the side menu, opens a password window (`THERAPIST_PASSWORD` in `assets/goals.js`). This is a lock against children, not security: the password is readable in the page source, and the data is not encrypted.

The window shows a long-term goal, 12 short-term goals with achievement percentages, a bar graph of achievement over time, and a SOAP note built from the active person's record, with space for therapist notes. The share icon sends all of it as text.

- **Achievement** starts as finished practice divided by the goal's target (`GOALS` in `assets/goals.js`), capped at 100%, because the app cannot hear speech. The therapist can type their own 0–100 rating for any goal. It replaces the count from that date, with one rating kept per calendar date, and the circular arrow returns the goal to the count while earlier ratings stay in the graph. Goals, targets and wording are suggestions for clinician review.
- **The graph** has eight bars ending today: days at first, then weeks, then four-week blocks as the record grows. Tap a goal to graph it alone. A table gives the same numbers.

The **side menu** (`SideMenu` in `assets/ui.js`) reaches every part of the app.

## People, history and the speaking path

- A fresh sum, worded for parents and therapists, guards **My Practice** and the profile icon, so names, history and deletion are out of a young child's reach. It is a child lock, not a password: it does not secure the data from another adult. Practice and rating are not gated.
- Practice needs no setup. The first finished practice creates a person named «أنا» / Me; the profile icon adds, switches and deletes people.
- Only finished practice is recorded. A stopped or reset run is not, and neither is the content of a recording.
- After a finished practice, three faces ask how much effort it took. Rating is optional, and auto-advance skips the question so it does not interrupt the flow.
- **My Practice** shows the last 7 days, the speaking path for each speech exercise and up to 30 days of history. The share icon shares up to 14 days as text through the device's share sheet, or copies it where there is none; nothing is sent automatically.
- The path runs from words to sentences, reading stories, conversation and real situations. A step reads as mostly easy after at least 5 ratings with 70% rated easy (`READY_RATED`, `READY_EASY_SHARE`), and the first other step is suggested next. These are suggestions for clinician review and never lock a step.
- Conversation and Real situations are prompts for 60 seconds of free speech (`FREE_SPEECH_MS`), without word-by-word cues.
- Data is stored only in this browser under `fluency-flow-progress-v1`, separately from the other apps' accounts. Clearing browser data removes it, and storage failures are shown to the user.

## Behavior

- Pause preserves the current exercise position. Reset returns to the beginning.
- Backgrounding the page pauses the guide, cancels queued auto-advance, and stops recording.
- Auto-advance waits 1.5 seconds and stops at the final page. Changing an exercise, category, language, or item count cancels queued work.
- Language preference is remembered when browser storage is available. Changing language resets pagination and the selected practice letter.
- Recordings stay in memory on the current device; they are not uploaded or persisted after reload. Starting a new recording, clearing it, or leaving the exercise releases the old audio URL. A late permission grant after leaving releases its microphone tracks immediately.
- Microphone access requires a secure context such as HTTPS or localhost. The recorder checks supported formats and otherwise lets the browser choose its default format. See [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) and [MediaRecorder format detection](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static).

## Verification

The tests start their own local server. Install Playwright in a development environment and install its WebKit browser, then run:

```sh
node tests/helpers.cjs
node tests/progress.cjs
node tests/program.cjs
node tests/goals.cjs
node tests/beats.cjs
node tests/pictures.cjs
node tests/browser.cjs
node tests/behavior.cjs
node tests/pwa-browser.cjs
node scripts/build-pwa.cjs --check
```

For Playwright installed outside this folder, set `FLUENCY_PLAYWRIGHT` to its module path. Set `PLAYWRIGHT_BROWSERS_PATH` when using a custom browser directory. The browser checks use installed Google Chrome on macOS when available, or Playwright Chromium otherwise. `FLUENCY_SMOKE=1` limits layout checks to a 390px phone; `FLUENCY_SKIP_WEBKIT=1` runs Chromium only.

Layout coverage: Chromium and WebKit at 320px, 390px, 768px, 844px landscape, and 1366px; all strategies; Arabic and English; accessible button names; 44px touch targets; dialogs; category changes; and pagination. Behavioral checks cover breathing completion, per-exercise speed, timers, final pages, pause/resume, backgrounding, dialog focus, microphone errors/format selection/cleanup, and failed app loading. Chromium also verifies native recording, playback, and microphone track release using synthetic audio input. Automated engine checks do not replace testing microphone permissions and audio hardware on a physical iPhone or Android phone.

PWA checks cover the actual nested website path (including the space in the folder name), manifest parsing, Chromium installation requirements, icon dimensions, offline reload and new-tab launch with the server stopped, offline exercises, waiting updates, update interruption prevention, failed-release rollback, and isolation from other apps and their caches.
