// Run when changing scripts/game-page.html; generates four consistent, semantic
// Arabic pages while keeping their existing public URLs.
const fs = require('node:fs');
const path = require('node:path');
const { MODES } = require('../assets/game-model.js');
const root = path.resolve(__dirname, '..');
const template = fs.readFileSync(path.join(__dirname, 'game-page.html'), 'utf8');
for (const [mode, meta] of Object.entries(MODES)) {
    fs.writeFileSync(path.join(root, `${mode}.html`), template.replaceAll('{{MODE}}', mode).replaceAll('{{TITLE}}', meta.title).replaceAll('{{DESCRIPTION}}', meta.description));
}
