# VSS merge validation

Passed:

- One VSS manifest, one root service worker, VOC installation artwork, valid links on every activity page, and all release integrity hashes.
- Complete download of all 7,234 media files (143,719,039 bytes), shared download status, all activity interfaces reopened offline, and real audio byte-range responses.
- Chrome and WebKit lifecycle checks: early download, failed installation and retry, first child creation, same-window switching, deferred updates, activation in two windows, changed-media replacement, unchanged-media reuse, and preserved child data.
- Countdown/report-navigation checks in Chrome and WebKit: all six VSS routes stay inside the suite, including for Hamada; the eight sound-app admin routes retain their existing behavior. Mobile/landscape layout, account avatars/sorting, protected deletion, and Hamada reset behavior.
- Publication artifact build with verified VSS and sound-app releases; migration from all three legacy cached workers and bookmarks, including query strings, fragments, and subpath hosting.
- All 7,272 moved image/audio/icon/font files match their original Git blobs byte for byte.
- VOC models/progress/levels/reports; SENB verb/audio/activity/offline-store checks; Taffaha assessment/progress models.

Two legacy checks already disagree with the unchanged source data:

- `senb/tests/regression.cjs`: the saved vocabulary-data baseline expects `7eeb36da…`, while the original source produces `99d07206…`. The data, grammar, app source, and baseline file are unchanged by this merge.
- `taffaha/tests/static.cjs`: five reviewed VOC source-copy images (`5/23`, `5/27`, `5/29`, `5/34`, `5/35`) differ from the current vocabulary originals. Both sets of image bytes are unchanged by this merge. Their release hashes pass.

The complete `npm test --prefix tools/VSS` command still reports these legacy failures. No vocabulary mappings, image copies, or baseline expectations were altered to make them pass.
