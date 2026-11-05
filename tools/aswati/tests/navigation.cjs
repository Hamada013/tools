if(!process.env.SOUNDS_PLAYWRIGHT&&process.env.ASWATI_PLAYWRIGHT)process.env.SOUNDS_PLAYWRIGHT=process.env.ASWATI_PLAYWRIGHT;
if(!process.env.SOUNDS_ENGINE&&process.env.ASWATI_ENGINE)process.env.SOUNDS_ENGINE=process.env.ASWATI_ENGINE;
// Legacy routing is covered together with standalone hosting and migration.
require('../../tests/split-sounds-browser.cjs');
