import os
from PIL import Image

print(f"{'ARQUIVO':<40} | {'FORMATO':<8} | {'TAMANHO':<12} | {'MODO':<6} | {'CANTO (0,0)'}")
print('-' * 90)

for root, dirs, files in os.walk('public/assets'):
    for f in sorted(files):
        p = os.path.join(root, f)
        try:
            with Image.open(p) as img:
                canto = img.getpixel((0, 0))
                rel = os.path.relpath(p, 'public/assets')
                print(f"{rel:<40} | {img.format:<8} | {f'{img.size[0]}x{img.size[1]}':<12} | {img.mode:<6} | {canto}")
        except Exception as e:
            print(f"{f}: {e}")
