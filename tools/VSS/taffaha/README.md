# تف فا حة

Arabic syllable practice with **75 cards: 15 in each of the 1, 2, 3, 4 and 5 syllable groups**. Longer groups include familiar compound names. The original two-syllable bank is retained. The 75 pictures and 75 whole-word recordings are copied from VOC and SENB into this app; source assets are never modified. All runtime media lives under `assets/images/` and `assets/sounds/`, so Taffaha can be hosted or copied on its own.

Taffaha is the syllable area inside [VSS](../README.md). Serve the repository root or the complete `tools/VSS/` directory over HTTPS or localhost and open `/tools/VSS/taffaha/`. Installation, downloads and updates are shared with VOC and SENB.

The home screen has two large icon buttons: **ابدأ** opens practice and **اختبار** opens the test workspace. The logo or header home icon returns home. `#practice` and `#test` also support direct links and browser back/forward navigation. Card selection is shared between the two workspaces; previous, next and shuffle stay in the selected syllable-count group.

In practice, tap the image for the original whole word, an individual circle for its syllable, or the surrounding syllable frame for the full right-to-left sequence. The title has its own row below the image. There are no separate playback buttons. The header music icon switches to rhythm practice: spoken syllables move into a frame beneath the image, and blank colored metronome circles occupy the larger frame. Tap that frame for one beat per syllable, or a single circle for one beat. The metronome sequence follows each recording's duration and the same saved pause as the syllable frame, so the two sequences have matching timing. If a recording is unavailable, the metronome uses a 350 ms syllable duration so rhythm practice still works. Both layouts retain image and syllable playback, fit the viewport, and remember the music setting locally. Recording and pause/stop controls are removed.

## Tests

The test header has a syllable-category button, one mode button, and the difficulty selector. The category popup contains only five circular number buttons (1–5), with no word search or individual picture selection; choosing a number starts that category. Practice retains its searchable word library. Downloads and contact details appear only on the home screen. Practice and test layouts fit the available viewport, including navigation.

The mode popup shows two visual previews:

- **المقاطع والصورة:** tap the blank colored-circle prompt to hear the syllables. Two image cards appear underneath; tapping an image plays its word and checks the answer. Easy distractors differ by at least two syllables, Moderate by one, and Hard have the same count. Duplicate artwork is excluded and choices are shuffled.
- **الصورة وعدد المقاطع:** tap the word image to hear the whole word, then select one of two colored-circle cards. Each circle produces one locally generated metronome click and highlights in order. Easy uses a large count difference, Moderate two, and Hard neighboring counts, such as 2 versus 3. All cards have equal sizes and single-row circles. For a target of 3, the largest available difference is two, so Easy uses that difference.

Correct answers show an animated green tick over a blurred background and **always advance** to the next word in the selected category. Wrong answers show a red cross and stay on the same word for another attempt. There is no automatic-advance toggle, separate prompt switch, or separate audio button in tests; cards play their own audio. Previous, next and shuffle remain available. Navigation, mode/category changes and backgrounding cancel playback and pending feedback timers. The selected word, mode, difficulty and practice playback pace are saved locally; no answers or scores are collected. Removed preference values cannot disable automatic advance.

## Prepare syllable audio

The folders `assets/sounds/1/` through `assets/sounds/5/` contain a `mapping.txt` each. The complete UTF-8 audio mapping is **[assets/sounds/mapping.txt](assets/sounds/mapping.txt)**. All 15 one-syllable cards reuse their local whole-word recording. For example, عين uses `assets/images/voc/3/14.webp` and `assets/sounds/words/voc/3/14.m4a`. The image, syllable circle and sequence frame all play the same recording. `1/mapping.txt` lists those local paths; no new recordings are needed for that group.

For groups 2–5, supply one spoken syllable per numbered `.m4a` file. Numbering is continuous within each count group, independent of other groups. For example:

- `assets/sounds/2/1.m4a` → مو, from موزة.
- `assets/sounds/2/2.m4a` → زة, from موزة.

Groups 2–5 need **30, 45, 60 and 75 files**, respectively, for **210 new files total**. Repeated syllables have separate positional files. Keep the filenames and card order in `scripts/build-data.cjs` stable after preparing the recordings. Pronounce the listed syllables according to the displayed divisions, without letter names or grammatical case endings.

The current bank includes all **210 local syllable recordings** for groups 2–5. Missing or undecodable clips display a concise unavailable message. Whole-word audio and the one-syllable group work from the local copies. There is no device-speech fallback that could mispronounce an isolated syllable.

After adding or replacing M4A files, rebuild the data and release. The build discovers local clips, hashes them and includes them in the optional offline download catalog together with the local pictures and whole-word recordings. Only existing clips are cataloged, so the app can install before the recordings are ready.

## Artwork and audio references

Whole-word audio keeps its source ID. The lunchbox card (`voc-34-11`) is titled «صندوق اكل», with syllables «صُنْ / دوق / أَ / كل». Its VOC catalog label is «صندوق غذاء»; the original picture and whole-word recording are retained. Reviewed VOC artwork corrections:

| Word | Original audio | Reviewed picture |
| --- | --- | --- |
| حليب | `sounds/5/21.m4a` | `images/5/29.webp` |
| بيتزا | `sounds/5/23.m4a` | `images/5/27.webp` |
| بوظة | `sounds/5/25.m4a` | `images/5/23.webp` |
| معكرونة | `sounds/5/33.m4a` | `images/5/35.webp` |
| شوربة | `sounds/5/32.m4a` | `images/5/34.webp` |
| بطاطا | `sounds/5/15.m4a` | `images/7/21.webp` |

The source picture for بطاطا showed fries; the reviewed picture shows whole potatoes. The other 69 pictures use their source mappings. `assetsManager.js` clears the previous picture immediately and ignores stale image results during rapid navigation. Picture revisions invalidate ordinary HTTP image caches.

The supplied portrait with three numbered apples is the app logo and the source for the favicon, Apple touch icon, regular installed icons and maskable icon. The icon builder reads `assets/icons/logo.webp` and requires Sharp 0.34.5.

## Build and verify

From the repository root:

```sh
node tools/VSS/taffaha/scripts/build-data.cjs
node tools/VSS/taffaha/scripts/build-pwa.cjs
node tools/VSS/taffaha/tests/static.cjs
node tools/VSS/taffaha/tests/test-model.cjs
node tools/VSS/taffaha/tests/browser.cjs
node tools/VSS/taffaha/tests/update-browser.cjs
node tools/VSS/taffaha/tests/activities-browser.cjs
node tools/VSS/taffaha/tests/persistence.cjs
```

Browser checks require Playwright (`TAFFAHA_PLAYWRIGHT` can point to an existing installation) and installed Google Chrome. `TAFFAHA_ENGINE=webkit` selects Playwright WebKit. The tests cover every card, complete-word decoding, numbered syllable playback order, duplicate syllables, unavailable clips, cancellation, 320px layouts, image races, offline installation, byte ranges and cache isolation. `npm run test:updates` serves Taffaha by itself and verifies all 360 downloads, updates to code and media, a waiting update across page reloads, multiple open windows, cache preservation and offline reopening. The activity suite checks home routing, the five-number category picker, the visual mode picker, all difficulty rules, both test types, real metronome playback, feedback, correct-only automatic advance, cancellation and responsive layouts. `npm run test:practice` verifies direct image/frame/circle playback, keyboard use, the music layout, single and sequenced beats, cancellation, saved rhythm settings and title spacing on phone and landscape screens. The pure model suite checks all 75 words at every difficulty with multiple random seeds. The persistence test checks card selection across a complete browser restart, including offline reopening. Browser artifacts are written to `/private/tmp/taffaha-qa`.

## Offline downloads and updates

The home download popup has exactly two buttons: **إضافة إلى الشاشة الرئيسية** and **تنزيل الصور والأصوات**. Tap outside the popup or press Escape to close it. Installation help appears after tapping the home-screen button when the browser has no native install prompt. The download button saves only the 360 files actually referenced by Taffaha (75 pictures, 75 whole-word recordings, 210 syllables; about 4.3 MB). Unused files and the rest of VOC, SENB and Arabic Sounds are excluded. The small app shell installs automatically; card media is optional and interrupted downloads resume from saved files.

A new deployed release shows **يتوفر تحديث جديد لتطبيق تف فا حة** with **تحديث الآن**, even with the download popup closed. The app checks on opening, returning to the foreground, reconnecting and every five minutes while visible (checks are throttled to once per minute). Applying an update reloads open Taffaha windows, keeps preferences and unchanged downloaded media, and removes obsolete Taffaha media. Changed/new media can be downloaded again with the same download button.

Run `node tools/VSS/taffaha/scripts/build-data.cjs` to refresh copies from the source apps and regenerate word/audio mappings. This build step needs the source apps; running Taffaha does not. When editing Taffaha's copied media directly, update the word revisions if needed and run the PWA builder.

Rebuild and commit VSS’s `../assets/pwa-release.js` with shipped code or media changes before publishing to GitHub Pages. Updates become available after the changed files are deployed to the app's URL; a GitHub commit alone does not update an unpublished site. `node tools/VSS/taffaha/scripts/build-pwa.cjs --check` verifies release freshness. The VSS root worker covers all three activity areas and leaves the separate sound apps’ caches alone. Existing legacy recording storage is no longer opened or used; this update does not delete browser data.
