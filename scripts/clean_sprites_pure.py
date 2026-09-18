import os
import numpy as np
from PIL import Image

def clean_sprite(file_path):
    im = Image.open(file_path).convert('RGB')
    arr = np.array(im)
    h, w, _ = arr.shape
    
    # 1. Skip outer border lines (top 6px, bot 6px, left 4px, right 4px)
    crop_inner = arr[6:h-6, 4:w-4]
    
    # 2. Identify near-white pixels
    is_white = (crop_inner[:, :, 0] > 215) & (crop_inner[:, :, 1] > 215) & (crop_inner[:, :, 2] > 215)
    is_char = ~is_white
    
    coords = np.argwhere(is_char)
    if len(coords) == 0:
        print(f"Skipping {file_path}: no character found")
        return
        
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0)
    
    # Slice the exact character with 1px padding
    y0_clamped = max(0, y0 - 1)
    y1_clamped = min(crop_inner.shape[0] - 1, y1 + 1)
    x0_clamped = max(0, x0 - 1)
    x1_clamped = min(crop_inner.shape[1] - 1, x1 + 1)
    
    char_crop = crop_inner[y0_clamped:y1_clamped+1, x0_clamped:x1_clamped+1].copy()
    ch_h, ch_w, _ = char_crop.shape
    
    # 3. Create RGBA
    rgba = np.zeros((ch_h, ch_w, 4), dtype=np.uint8)
    rgba[:, :, :3] = char_crop
    
    # 4. Make all background near-white pixels transparent
    crop_white = (char_crop[:, :, 0] > 215) & (char_crop[:, :, 1] > 215) & (char_crop[:, :, 2] > 215)
    rgba[:, :, 3] = 255
    rgba[crop_white, 3] = 0
    
    res = Image.fromarray(rgba)
    res.save(file_path, format='PNG')
    print(f"Cleaned {os.path.basename(file_path)}: {res.size} | Corners: {rgba[0,0,3]},{rgba[0,-1,3]},{rgba[-1,0,3]},{rgba[-1,-1,3]}")

if __name__ == '__main__':
    sprites_dir = 'public/assets/sprites'
    for f in os.listdir(sprites_dir):
        if f.endswith('_front.png'):
            clean_sprite(os.path.join(sprites_dir, f))
    
    # Also clean icon consumables
    icons_dir = 'public/assets/icons'
    for f in os.listdir(icons_dir):
        if f.startswith('icon_consumable_') and f.endswith('.png'):
            clean_sprite(os.path.join(icons_dir, f))
