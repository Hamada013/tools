/* Practice highlight colour, shared by كلمة, جملة and مقطع (identical copies).
 * Each new session picks one soft colour at random (baby blue, baby green or baby red), never the same
 * as last time, and sets --glow-edge / --glow-soft on the page for the glowing target card. */
((root) => {
    'use strict';
    const COLOURS = { blue: ['#5fb3ec', '#bfe3ffcc'], green: ['#5fcf8d', '#c6f1d6cc'], red: ['#f28b8b', '#ffd1d1cc'] };
    let last = null;
    function pickGlowColour() {
        const options = Object.keys(COLOURS).filter(name => name !== last), name = options[Math.floor(Math.random() * options.length)];
        last = name;
        const style = root.document?.documentElement.style;
        style?.setProperty('--glow-edge', COLOURS[name][0]); style?.setProperty('--glow-soft', COLOURS[name][1]);
        if (root.document) root.document.documentElement.dataset.glow = name;
        return name;
    }
    root.pickGlowColour = pickGlowColour;
    if (root.document) pickGlowColour();
})(globalThis);
