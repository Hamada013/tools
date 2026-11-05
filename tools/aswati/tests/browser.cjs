if(!process.env.SOUNDS_PLAYWRIGHT&&process.env.ASWATI_PLAYWRIGHT)process.env.SOUNDS_PLAYWRIGHT=process.env.ASWATI_PLAYWRIGHT;
if(!process.env.SOUNDS_ENGINE&&process.env.ASWATI_ENGINE)process.env.SOUNDS_ENGINE=process.env.ASWATI_ENGINE;
// Compatibility test entry point.
require('../../tests/split-sounds-browser.cjs');
