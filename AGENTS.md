# Standalone repository

This repository must never link to or depend on the main speech website. The main website links here, and links only go one way. `tools/tests/one-way-links.cjs` enforces this before publishing.

# App home screens

Use the Syllables Builder app (مقطع; repository `Hamada013/syllables-builder`, local folder `../syllables-builder`; formerly `tools/VSS/taffaha`) as the default visual reference for new app home screens and home-screen redesigns, unless the user requests another style. Follow [docs/app-home-style.md](docs/app-home-style.md). Preserve each app's branding, available activities, and behavior.

Use Taffaha as the visual and interaction reference for activity-screen work too: calm white cards, compact icon controls, short flows, and minimal routine instructional text. Preserve accessibility labels and error feedback.

Style dropdowns and option menus to match the app whenever adding or changing them. Use rounded white triggers, a clear chevron, a rounded white option list, and a soft green selected row with a check. Do not leave browser-default dropdown buttons or menus. Preserve labels, keyboard navigation, focus, outside dismissal, and form values. See the dropdown guidance in `docs/app-home-style.md`.
