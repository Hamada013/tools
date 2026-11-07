# المقاطع — مع حمادة

Open `syllable.html` for the home screen or `matching.html` for direct matching setup. Serve the repository root over HTTP(S). The syllable screens use only local HTML, CSS, JavaScript, SVG controls, images and WAV files; no Tailwind, icon-font, online-font or effect-sound requests are needed. Other articulation modules retain their existing implementation.

## Activities

- **Practice:** choose one to three consonants, CV/VC/VCV, and the first vowel. Tap a picture sequence to hear the existing recording. The pictures already carry their sound labels, so extra letter captions are omitted in every activity. Three sequences per page, or one on short portrait phones. Changing sounds, modes or pages stops audio. Manual encouragement stars remain separate from assessment scores.
- **Matching:** three visible sequences and three covered audio targets. Select a source then a target using taps or keyboard, or drag with a mouse, stylus or touch. Tap a covered card to hear its recording; with a source selected, tapping also checks the pair. Matched cards can still be tapped to listen without scoring again. Matched pairs remain visible and cannot be counted twice. This is practice, separate from the assessment records.
- **Listening test:** every unique selected syllable appears once, with three distinct choices, including when one consonant is chosen. Tap the question sound card to replay, separately from choosing an answer. The full recording must finish before an answer is accepted. Only the first selection is scored, then the test advances. Sound/image errors expose retry and skip controls.
- **Production test:** one sequence appears without automatic audio. The examiner selects one of six colored icon buttons: 0%, 20%, 40%, 60%, 80%, or 100%. Each syllable retains its exact percentage; the report shows the arithmetic mean of percentage-rated items, excluding skips. A model is optional by tapping the production card and is recorded as a prompt on that item, including after reload. This is examiner scoring, not microphone recording or automatic speech recognition.

Every test has a finite plan: 3 CV/VC or 9 VCV items per selected consonant. Listening accuracy excludes skipped items. Production reports average the selected percentages; 100% also counts as fully correct and 20–80% as partial production. Earlier saved ratings retain their original labels and legacy summaries; in a resumed test with both scales, the percentage mean uses only items rated with a percentage. Reports show item responses, choice/model information, planned/assessed counts and print/PDF support. These descriptive practice/test scores are not standardized norms.

## Saving and interruption

Test plans, choice order, responses and production-model exposure are saved under the app-specific `articulation-syllable-results-v1` localStorage key. No child record is uploaded. Multiple drafts and completed tests are retained. Pause or returning home from a test opens a saved pause screen; reload offers the latest draft. Earlier drafts are also in Results. Finishing early creates an explicitly partial report. A failed save blocks advancement and exposes an error; corrupted stored records are not silently overwritten. Clearing browser storage removes local results.

## Layout and accessibility

White Taffaha-style cards retain the articulation logo and existing letter pictures/recordings. Controls use inline outline SVGs with accessible names, visible focus, and 44px or larger touch targets. Setup uses a native modal dialog, multi-select letter buttons and labeled CV/VC/VCV segments. Zoom is enabled; layouts adapt to phone portrait/landscape, iPad sizes, safe areas and reduced motion. The contact footer appears on the home screen.

## Checks

```sh
node tools/articulation/syllable/tests/model.mjs
node tools/articulation/syllable/tests/browser.cjs
```

The model check verifies all 375 consonant targets against the supplied recordings and picture paths, scoring, prompt flags, duplicate-response protection and stored-session validation. The browser check runs Chrome and WebKit with real WAV playback, nine phone/iPad/landscape viewport sizes, practice/filter changes, listening, production, save/reload, finite results and pointer/tap/keyboard matching. Add `ARTICULATION_ENGINE=chromium` or `webkit` to select one engine. QA screenshots use synthetic results and are written under `/private/tmp/`.
