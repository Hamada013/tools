# Child progress and reports

Taffaha uses the same device-local child identities as VOC and Senb (`voc-children-v1`). Signing in by name reuses the existing identity. Account changes use the same parent calculation as the other apps. This is local storage on the same browser/origin, not a cloud account or cross-device sync.

Taffaha owns only `child.taffaha`: its saved workspace and dated test attempts. Writes read the latest shared data first so that VOC and Senb progress survives. Each child's last word, test kind, level, rhythm, and unfinished question are restored independently. Failed storage writes show an error and retain the current in-memory work.

The two skills are independent:

- `count`: الصورة وعدد المقاطع
- `picture`: المقاطع والصورة

A word is learned in a skill when its latest completed question was correct on the first attempt. Wrong answers and retries remain in the accuracy totals. Retrying after a reload does not erase the earlier mistake. Practice and interrupted audio do not award mastery. The two learned icons on the home screen and word library filter the respective collections; the full word bank remains available.

The report has the same six periods as VOC/Senb, separate accuracy and acquisition for each test, acquisition by syllable count, and a local PDF download. The app buttons inside each report keep the selected child's identity. A report link never changes the active account. If that child has not used the destination app, a prompt offers account creation with the same name behind the existing parent gate.

Shared navigation source is in `tools/shared/app-navigation.js` and `.css`. Run `node tools/shared/sync-navigation.cjs` after editing it to update each independently cached local copy and the app logos. Regenerate the three PWA manifests after shell changes.

Checks from the repository root:

```sh
npm test --prefix tools/taffaha
node tools/shared/sync-navigation.cjs --check
node tools/tests/suite-navigation-browser.cjs
APP_ENGINE=webkit node tools/tests/suite-navigation-browser.cjs
APP_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node tools/tests/pwa-controls-browser.cjs
```
