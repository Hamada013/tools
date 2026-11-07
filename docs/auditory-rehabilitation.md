# Auditory Rehabilitation

The activity implementation is `tools/auditory-rehabilitation/assets/activities.js`, with local styles in `assets/activities.css`. Shared profiles and reports come from `tools/shared/sound-suite.js/css`; synchronize these with `node tools/shared/sync-navigation.cjs`.

## Responses and demonstrations

- Detection uses tick/cross responses and an animated ear. Choices become available when the audio starts, including during playback; silent trials also accept an early response. Each of the ten rounds records one answer, with five sound and five silent trials. Arabic Sounds retains its separate Ling toy/bucket activity.
- Both discrimination levels and every identification set support dragging a card into the ear box during playback. A dropped picture appears before tick/cross feedback. The workplace offers the same feedback as unscored practice.
- Practice starts with one automatic white-glove demonstration, keeping all choices visible, followed by child practice turns. Demonstrations have a separate practice session and never count as assessment answers.
- Short duration cards have a yellow stripe/dot; long cards have a blue stripe/dot. The wider central timeline and the selected card's timeline use the corresponding color. Test positions shuffle between rounds. The first practice model listens, points with the glove, then plays the selected card's timeline.
- Memory counts 1–2–3, displays every card, highlights both members of each pair with a gentle synchronized pop and sound, then covers all cards. Responses stay disabled during this introduction. Actual pair attempts are recorded separately from the model. Navigation and backgrounding cancel unfinished animation/audio.
- Typing `Hamada` in the profile name entry activates the protected admin account. It is absent from saved child lists and searches; only the active admin has its own account bar and five-app navigation.

## Frequency library

An audiogram distinguishes frequency (pitch) from intensity (loudness); [ASHA's audiology guidance](https://www.asha.org/practice-portal/clinical-topics/hearing-loss/) describes these axes and the usual test frequencies. This app groups its environmental recordings by their **measured dominant spectral-energy band**. These groups are an organizational choice for these recordings, rather than an audiologist's assessment of a child's hearing.

`scripts/build-sound-pitch.cjs` decodes all 50 full recordings to mono at 16 kHz using FFmpeg, applies a 2,048-sample Hann-window FFT, and sums power in three bands: below 500 Hz, 500–2,000 Hz, and 2,000–8,000 Hz. The band with most power determines the column. Environmental recordings contain several frequencies, so a column describes the strongest band rather than an exact pure-tone pitch. The generated `assets/sound-pitch.js` includes proportions and source SHA-256 hashes for review. Current grouping: 15 low, 20 middle, 15 high.

The library uses three colored columns in low-to-high physical order. All 50 items fit together on desktop. On small screens, page controls keep all sounds available with touch targets of at least 44px and no page scrolling. Resizing recomputes the number of visible rows and columns.

The release build checks the recording hashes and regenerates the grouping when a full recording changes. FFmpeg is needed only for regeneration; the supplied Pages workflow prepares it automatically.

## Reports and downloads

Reports display actual response totals, a score ring, per-skill bars, recent-session bars, and trial tick/cross marks. Practice/listening totals stay separate from assessment accuracy. Partial sessions remain visible, and results do not imply mastery. Existing VOC, SENB, Taffaha and other children's progress are preserved.

Logo downloads wait for this app's worker and can retry in the same tab after a failed installation. A corrupt media response is rejected and does not count toward completion. The app's catalog contains 200 files: 50 images and 150 AAC recordings. The standard update dialog remains driven by completely installed published releases.

Build and verify:

```sh
node tools/shared/build-pwa-releases.cjs --site
node tools/auditory-rehabilitation/tests/static.cjs
node tools/tests/sound-suite.cjs
node tools/auditory-rehabilitation/tests/browser.cjs
SOUNDS_ENGINE=webkit node tools/auditory-rehabilitation/tests/browser.cjs
node tools/auditory-rehabilitation/tests/native.cjs
SOUNDS_ENGINE=webkit node tools/auditory-rehabilitation/tests/native.cjs
SOUNDS_APP=auditory-rehabilitation node tools/tests/split-sounds-browser.cjs
```

The native check verifies a failed worker and same-tab retry, an early download tap, corrupted-media rejection/retry, all 200 files, all 150 AAC metadata decoders, library/audio/range requests after stopping the actual HTTP origin, and native offline memory-pair playback after its three-second countdown. The browser check covers early answers, glove models, feedback, memory, five responsive library sizes, graphical reports and hidden typed admin access.
