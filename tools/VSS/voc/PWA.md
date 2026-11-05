# VSS PWA

VOC is the vocabulary area inside [VSS](../README.md). Open `/tools/VSS/` or `/tools/VSS/voc/` over HTTPS or localhost. Serve the complete VSS directory together; VOC no longer has a separate manifest or worker.

All activity pages reference `../manifest.webmanifest`, using the VSS name and VOC installation icon. The root `sw.js` caches every activity interface as one atomic release. Tapping a logo downloads all three VSS media catalogs, with one shared percentage and resumable state. Updates preserve unchanged downloads and child progress.

From the repository root, run `npm run build --prefix tools/VSS` after changing any activity code or media. `node tools/VSS/tests/static.cjs` checks the complete release; `node tools/VSS/tests/pwa-browser.cjs` checks downloads, offline use, navigation and updates. Add `APP_FULL_CATALOG=1` for every real media file or `APP_ENGINE=webkit` for Safari's engine.

Existing vocabulary build commands delegate to the complete VSS release. See [VSS README](../README.md) for publication and old-link compatibility.
