# احكي حلو

An Arabic, local-only practice PWA for children ages 6+, built as a new app in `tools/ihki-hilou`. White backgrounds, rounded cards, flat SVG scenes, RTL typography and large touch controls follow VOC/SENB's visual style. The app ships without a backend, CDN, remote font or runtime build dependency.

Serve the **repository root** over HTTPS (or localhost), then open `/tools/ihki-hilou/`. Keep `tools/VSS/voc`, `tools/VSS/senb` and `tools/arabicsounds` at their documented paths. Opening an HTML file directly does not provide the required PWA/microphone environment.

## Practice flow

Create a child profile (nickname, age 6–18, avatar), choose one of five games, optionally select a pre-session feeling from 1 to 5, then start a recorded attempt or explicitly choose visual play without a microphone. Hear the normal library example, record and replay an attempt, optionally rate how it felt, and finish with a post-session feeling. Both rating screens permit skipping; missing ratings stay missing. A saved draft can be resumed after reload without automatically opening the microphone.

- **Turtle / الإطالة والتأني:** a turtle advances with approximate periodic sound activity, with a short grace period for consonants/pauses. Pauses never reset it.
- **Breeze / البداية اللطيفة:** an air/sun scene follows the microphone's energy envelope. It does not classify a vocal attack as safe/unsafe.
- **Feather / اللمس المخرجي اللطيف:** gentle bubbles react to sound energy. They never shatter and cannot measure lip/tongue force.
- **Bridge / جسر الكلمات:** the train follows approximate voicing activity while practicing words and six SENB sentence examples. Natural unvoiced consonants and pauses are allowed.
- **Balloon / التنفس المريح:** a timed visual breathing guide, independent of microphone correctness. Default: 4-second gentle inhale, no hold, 6-second exhale. The caregiver can opt into a 2-second pause; stop is always available. It is a comfort activity, not a claim that breathing treats stuttering.

Each completed session with an attempt earns participation stars (1–3, based on attempt count), never a fluency grade. Badges mark the first session, five participation stars, and trying all five games. Demo attempts are labeled as microphone-free and do not invent audio measurements. Caregiver-model recordings do not earn child stars or count as child attempts.

The clinical framing draws on [ASHA's Stuttering, Cluttering, and Fluency Practice Portal](https://www.asha.org/practice-portal/clinical-topics/fluency-disorders/): speech modification techniques are selectable tools, and comfort, confidence and participation matter. This implementation makes no diagnosis, treatment-success prediction or acoustic claim about tension. The 1–5 faces are the child's self-report, not a standardized severity scale. A caregiver/SLP selects the task and language appropriate for the child.

## Audio and assets

`assetsManager.js` maps VOC images/word recordings, SENB matching word fallbacks and reviewed sentence presets, plus isolated Arabic sounds. The repository calls its phoneme folder `arabicsounds`; `arabic-sound-app` is an alias. Missing images try matching fallbacks, then a local placeholder. Missing whole-word audio tries available alternatives and a clearly announced Arabic device voice; device voices may require Internet. Nothing uploads the child's recordings.

Normal library speech is labeled as a word/sentence example. To demonstrate a particular technique, choose **نموذج المرافق للبطاقة الحالية** in caregiver settings, record the example, then return the setting to child attempts. Models are separate for each profile/game/prompt and work offline. They replace the previous model for that combination.

`audio.js` resumes a single AudioContext on a real user gesture for iOS, uses decoded-buffer playback to avoid repeated media activation gates, negotiates MediaRecorder MIME types, and uses PCM/WAV capture if MediaRecorder is missing. Recording limits are 8/12/20 seconds for speech games and two paced cycles for the balloon (20 or 24 seconds). Tracks, analyser nodes and capture processors are disconnected after stop/error. Backgrounding stops playback and attempts to stop/save the current take; abrupt OS termination can still prevent the final write. Permission denial leaves visual play available.

`fluencyGames.js` uses RMS and an autocorrelation estimate (approximately 75–700 Hz) as visual cues. A brief quiet calibration estimates background energy. Pitch can be absent or inaccurate in noise/unvoiced speech; signal values are not interpreted as pathology. Missing analysis is recorded as unavailable, not zero performance.

## Profiles, persistence and privacy

IndexedDB `ihki-hilou` stores profiles, sessions and binary audio bytes with actual MIME types. Metadata is listed without retaining every audio file in memory; playback/export loads a single take. Storing bytes avoids depending on browser-specific recorded-Blob persistence. An attempt's session metadata and audio commit together. Completion and stars update in one transaction, with a completed-session check preventing duplicate rewards on retries.

LocalStorage holds the active profile, caregiver preferences and a reward/last-rating cache. IndexedDB remains authoritative. Storage failures are visibly labeled; the current session/take remains available in memory for exporting rather than claiming durable success. Export a session summary from History or download individual audio takes. Deleting a child profile requires confirmation and atomically removes only that profile, its sessions and its audio. There is no cross-profile history display or account/network synchronization.

## Offline and installation

The small shell, all five SVG game scenes, prompt metadata and logos install automatically with SHA-256 integrity. The download dialog optionally saves all existing VOC/SENB/Arabic-sound images/audio: **6,938 files, about 140.5 MB** in the current workspace. It reports each library's exact count/size, supports three-file batches, integrity verification, timeout, pause/resume and quota errors. Keep the app visible while downloading. The browser may evict storage; inventory is checked again on each visit.

The worker scope/cache prefix is unique to this app. Cache-first serves the verified shell and revision-keyed shared media; stale-while-revalidate is limited to optional app assets. Cached full audio implements HTTP byte ranges for Safari. Unchanged media is reused on an update; old revisions are pruned at activation. New shells wait until old app tabs close. Clearing downloaded libraries does not clear profiles, recordings, or another app's caches.

The app uses responsive orientation (`any`) so portrait phones and landscape iPads remain usable. On iPhone/iPad, use Share → Add to Home Screen; on Android use the install prompt/menu. A user agent may vary splash-screen/install behavior.

## Build and test

From repository root:

```sh
node tools/ihki-hilou/scripts/build-data.cjs
node tools/ihki-hilou/scripts/build-icons.cjs
node tools/ihki-hilou/scripts/build-pwa.cjs
node tools/ihki-hilou/tests/static.cjs
node tools/ihki-hilou/tests/games.cjs
```

Icon generation requires Sharp 0.34.5. Browser checks require Playwright 1.56.1, installed Google Chrome, and optionally its WebKit engine. Install development dependencies in this app using `npm install`; production needs none. Override dependency paths with `IHKI_SHARP` / `IHKI_PLAYWRIGHT`; use `IHKI_ENGINE=webkit` for WebKit. Screenshots/exports go to `/private/tmp/ihki-qa` on this workstation. The WebKit test uses a generated input stream to exercise native recording/encoding without a physical microphone. Hardware microphone permissions, audio routes, OS interruption and native installation should also be checked on target devices.

After changing shared media or shipped source, rebuild the release (`--check` checks freshness). After labels or SENB presets change, rebuild data first. After the logo changes, rebuild icons then the release. `scripts/`, `tests/`, and this README are development files, not shell dependencies.

## Logo provenance

Saved app artwork: `assets/icons/logo.webp`; generated install sizes: 192, 512, maskable 512 and Apple touch 180. The attached reference was available in chat but not as an original workspace image file, so an app-ready export was prepared with the built-in image-generation tool and converted to lossless WebP. It is a reference-derived export, not a byte-for-byte copy of an original upload.

Final image prompt used:

> Use case: background-extraction. Edit target: the user's most recent attached square logo showing a young clean-shaven cartoon boy with brown hair, round brown glasses, an open speaking mouth, and a white speech bubble at lower right containing colored Arabic ت ت ت تفاحة. Prepare this supplied design as a square app-icon asset. Preserve the boy's identity, proportions, colors, face, hair, glasses, rounded pale-white icon tile, speech bubble placement and its original Arabic text exactly. Only remove any solid black outside the rounded tile, making those outer corners transparent. Do not redesign, add text or add objects. Keep the original flat illustration design and crop.
