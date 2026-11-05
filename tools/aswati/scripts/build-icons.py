# Requires Pillow. Run: python3 tools/aswati/scripts/build-icons.py
from pathlib import Path
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parents[1]
logo=Image.open(root/'assets/logo.webp').convert('RGBA')
for filename,size,maskable in [('icon-192.png',192,False),('icon-512.png',512,False),('maskable-512.png',512,True),('apple-touch-icon.png',180,False)]:
    image=Image.new('RGBA',(size,size),'#edf8ff')
    content=logo.copy(); content.thumbnail((int(size*.68),int(size*.68)))
    image.alpha_composite(content,((size-content.width)//2,(size-content.height)//2))
    image.convert('RGB').save(root/'icons'/filename)
