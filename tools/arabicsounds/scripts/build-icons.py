# Requires Pillow. The supplied logo stays unchanged; these are installation sizes.
from pathlib import Path
from PIL import Image, ImageOps
root = Path(__file__).resolve().parents[1]
logo = Image.open(root / 'images/logo.webp').convert('RGBA')
for filename, size, maskable in [('icon-192.png',192,False),('icon-512.png',512,False),('maskable-512.png',512,True),('apple-touch-icon.png',180,False)]:
    canvas = Image.new('RGBA', (size,size), '#f8fafc' if maskable or filename.startswith('apple') else (0,0,0,0))
    limit = int(size * .68) if maskable else size
    content = ImageOps.contain(logo, (limit,limit), Image.Resampling.LANCZOS)
    canvas.alpha_composite(content, ((size-content.width)//2,(size-content.height)//2))
    canvas.save(root / 'icons' / filename)
