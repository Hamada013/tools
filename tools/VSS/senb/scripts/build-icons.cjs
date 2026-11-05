// Generate install icons from the app's WebP logo. Requires Sharp.
const sharp = require(process.env.SENB_SHARP || 'sharp');
const path = require('node:path');
(async () => {
  const dir = path.resolve(__dirname, '../assets/icons');
  for (const [filename, size, scale] of [
    ['icon-192.png', 192, .85], ['icon-512.png', 512, .85],
    ['apple-touch-icon.png', 180, .85]
  ]) {
    const inset = Math.round(size * scale);
    const logo = await sharp(path.join(dir, 'logo.webp')).resize(inset, inset, { fit: 'inside' }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 3, background: '#f8fafc' } })
      .composite([{ input: logo, gravity: 'center' }]).png().toFile(path.join(dir, filename));
  }
  console.log('Generated app install icons.');
})().catch(error => { console.error(error); process.exitCode = 1; });
