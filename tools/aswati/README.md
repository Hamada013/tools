# Aswati compatibility entry

Aswati has been separated into two independently hostable apps:

- `../arabicsounds/` — أصواتي العربية, using the supplied Arabic-letter logo.
- `../auditory-rehabilitation/` — أصوات من حولي, using the supplied musical-note logo.

The tools directory links directly to both apps. This old URL remains a small chooser, and `#/arabic/…` / `#/around/…` bookmarks redirect to the corresponding new app. The compatibility worker migrates previously installed combined-app shells when they next connect, preserving the deep link. It leaves previously downloaded media caches intact.

The original combined app's engine/data and release files remain here as migration references; the current entry does not load them. Active code, media catalogs, installation manifests, icons, offline downloads and update prompts now live in each standalone app.

After editing this compatibility entry, run `node tools/aswati/scripts/build-pwa.cjs`. See each standalone app's README for its build and checks. The previous test entry points forward to the appropriate standalone checks.
