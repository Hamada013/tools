// Deterministic install icons derived from existing app branding.
const sharp = require(process.env.VOC_SHARP || 'sharp');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
(async () => {
    // Maskable content fits inside the central safe circle, on an opaque canvas.
    for (const [name, size, scale] of [
        ['icon-192', 192, .85], ['icon-512', 512, .85],
        ['maskable-512', 512, .65], ['apple-touch-icon', 180, .85]
    ]) {
        const inset = Math.round(size * scale);
        const logo = await sharp(path.join(root, 'images/logo.webp')).resize(inset, inset).png().toBuffer();
        await sharp({ create: { width: size, height: size, channels: 3, background: '#F8FAFC' } })
            .composite([{ input: logo, gravity: 'center' }]).png().toFile(path.join(root, `icons/${name}.png`));
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
