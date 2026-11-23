# Tools

Interactive speech-therapy apps, published at https://hamada013.github.io/tools/.

This repository stands alone and does not link to any other site. The main website links here; links only go one way.

## Children's accounts dashboard

`tools/accounts/` (the round report button in the corner of the tools page) is the therapist's read-only review of every child's progress in كلمة, جملة and مقطع. It sits behind the therapist password and reads each app's saved accounts from this browser (same site, no cloud). Children are joined across apps by name, with manual linking for differing names. Each app can be reviewed alone, or combined into one report; the print window downloads each chosen report as its own PDF. Goal states come from each app's own `assets/intervention-goals.js`.

The dashboard is reached only from that round button on the tools page: the apps have no button or link to it. A new app joins by adding one entry to `APPS` in `tools/accounts/dashboard.js` (storage key, goals file and a `read(child)` that returns its sessions, plan and level).

Build: `node tools/shared/build-pwa-releases.cjs --site`
