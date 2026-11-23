# Tools

Interactive speech-therapy apps, published at https://hamada013.github.io/tools/.

This repository stands alone and does not link to any other site. The main website links here; links only go one way.


## The two sound apps (أصواتي العربية, أصوات من حولي)

Both use the same child accounts window as كلمة, جملة and مقطع (VB-MAPP layout, 25 drawn animal heads, no Hamada account, one confirmation to delete), the therapist lock switch in the header (013, stays open until locked) with the intervention plan (`assets/intervention.js`, goals in each app's `assets/intervention-goals.js`; estimates build up or fall back per test session, achieved after 3 sessions in a row at 80%+), bar-only reports, and «طباعة التقارير», which downloads each chosen report as its own PDF.

The first home tile is «المسار التلقائي»:
- أصواتي العربية: the chosen pair's practice → the 10-trial test → automatic repeat of missed sounds → games box (matching, memory), with a play break before each game.
- أصوات من حولي: the therapist picks one set; detection test → discrimination (practice → test) → identification (practice → test) → memory. Missed sounds repeat after each test; a test under 80% ends the route for today.

Shared sound files live in `tools/shared/` and are copied into both apps by `sync-navigation.cjs` (the site build runs it): edit them there.

## Children's accounts dashboard

`tools/accounts/` (the round report button in the corner of the tools page) is the therapist's read-only review of every child's progress in كلمة, جملة, مقطع, أصواتي العربية, أصوات من حولي and اتبع التعليمات. It sits behind the therapist password and reads each app's saved accounts from this browser (same site, no cloud). Children are joined across apps by name, with manual linking for differing names. Each app can be reviewed alone, or combined into one report; the print window downloads each chosen report as its own PDF. Goal states come from each app's own `assets/intervention-goals.js`.

The dashboard is reached only from that round button on the tools page: the apps have no button or link to it. A new app joins by adding one entry to `APPS` in `tools/accounts/dashboard.js` (storage key, goals file and a `read(child)` that returns its sessions, plan and level).

Build: `node tools/shared/build-pwa-releases.cjs --site`
