import os
import numpy as np
from PIL import Image
from collections import deque

def extract_character(src_path):
    im = Image.open(src_path).convert('RGB')
    arr = np.array(im)
    h, w, _ = arr.shape
    
    # Exclude outer margin where card frame/box border is placed
    mx = int(w * 0.08)
    my_top = int(h * 0.12)
    my_bot = int(h * 0.06)
    
    inner = arr[my_top:h-my_bot, mx:w-mx]
    
    # Near-white detection: R, G, B all > 215
    is_bg = (inner[:, :, 0] > 215) & (inner[:, :, 1] > 215) & (inner[:, :, 2] > 215)
    coords = np.argwhere(~is_bg)
    if len(coords) == 0:
        return None
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0)
    
    gy0 = y0 + my_top
    gy1 = y1 + my_top
    gx0 = x0 + mx
    gx1 = x1 + mx
    
    char_crop = arr[gy0:gy1+1, gx0:gx1+1]
    ch_h, ch_w, _ = char_crop.shape
    
    rgba = np.zeros((ch_h, ch_w, 4), dtype=np.uint8)
    rgba[:, :, :3] = char_crop
    
    is_crop_bg = (char_crop[:, :, 0] > 210) & (char_crop[:, :, 1] > 210) & (char_crop[:, :, 2] > 210)
    visited = np.zeros((ch_h, ch_w), dtype=bool)
    queue = deque()
    
    for x in range(ch_w):
        if is_crop_bg[0, x]: queue.append((0, x)); visited[0, x] = True
        if is_crop_bg[ch_h-1, x]: queue.append((ch_h-1, x)); visited[ch_h-1, x] = True
    for y in range(ch_h):
        if is_crop_bg[y, 0]: queue.append((y, 0)); visited[y, 0] = True
        if is_crop_bg[y, ch_w-1]: queue.append((y, ch_w-1)); visited[y, ch_w-1] = True
        
    while queue:
        cy, cx = queue.popleft()
        for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < ch_h and 0 <= nx < ch_w and not visited[ny, nx] and is_crop_bg[ny, nx]:
                visited[ny, nx] = True
                queue.append((ny, nx))
                
    rgba[:, :, 3] = 255
    rgba[visited, 3] = 0
    return Image.fromarray(rgba)

if __name__ == '__main__':
    sprites_dir = 'public/assets/sprites'
    front_files = [f for f in os.listdir(sprites_dir) if f.endswith('_front.png')]
    for f in front_files:
        p = os.path.join(sprites_dir, f)
        clean_img = extract_character(p)
        if clean_img:
            clean_img.save(p, format='PNG')
            print(f'Salvo {f:30} -> {clean_img.size}')
