# Follow Direction · اتبع التعليمات

Open `tools/follow-direction/index.html` through HTTPS or a localhost web server. Arabic is the default. No npm install, API key or backend is needed. Accounts/progress stay on this device. The app works independently when its directory is hosted as a unit.

```sh
node tools/follow-direction/scripts/build-pwa.cjs
node tools/follow-direction/tests/model.cjs
node tools/follow-direction/tests/research.cjs
node tools/follow-direction/tests/browser.cjs
node tools/follow-direction/tests/updates.cjs
node tools/shared/build-pwa-releases.cjs --site
```

The browser check uses the existing Playwright install at `tools/VSS/voc/node_modules/playwright`; `APP_ENGINE=webkit` selects Safari's engine. See `ADAPTATION.md` for clinical/content decisions and scoring behavior. Use the header download icon for offline status. A complete hashed release installs before updates are offered; «لاحقًا» keeps the old release active. Accepting updates refreshes open windows. Every response is saved before an update or navigation.

`ASSETS.txt` and the numbered mapping files describe optional images and audio. Add them, rebuild, and publish; no source edits are needed for the numbered files. The release generator includes all supplied numbered media and built-in drawings.

To replace the logo, save the supplied artwork as `assets/logo.webp` (convert format without changing the artwork), and regenerate `icon-192.png`, `icon-512.png`, and `icon-maskable.png`. Keep the important part inside the maskable icon's central 80%. Then rebuild. The source book and child records are not part of the public app bundle.

WebKit offline verification makes the test server unreachable while keeping service-worker execution enabled; Playwright’s WebKit offline-emulation toggle itself produces an internal navigation error in this runtime. Chromium also passes with browser offline mode enabled.

## Research workbook

Inside Accounts, the spreadsheet icon downloads `follow-direction-research-YYYY-MM-DD.xlsx`. Each export automatically collects all saved child profiles and sessions in the current browser. It creates a fresh cumulative snapshot, not an appended duplicate. The workbook contains Dashboard, Cases, Sessions, Skills, Records, and Dictionary; grouped screening/practice charts and a monthly independent-response trend are native editable Excel charts. The report page retains its PDF/print control. JSON backup/restore stays separate in Accounts.

Numeric `case_id` values persist through future exports and backups and are not reused after deletion. `child_uuid` remains the cross-file join key; case numbers are local to the dataset. Child names appear in Cases. Hamada/admin is excluded. Missing demographic or consent data is not inferred. Downloaded workbooks stay on the device; there is no Google/Drive/Sheets connection. Each click includes the latest saved observations, including partial sessions.

The PWA uses the checked-in `assets/workbook-template.js` and needs no library download or local server for export. `scripts/build-workbook-template.mjs` authors that template with Artifact Tool when changing its layout; it requires the bundled `@oai/artifact-tool` runtime or `ARTIFACT_NODE_MODULES`. Normal PWA/publication builds use the existing template. Rebuild the PWA after template changes.
