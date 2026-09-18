import os
import numpy as np
from PIL import Image
from collections import deque

def remove_background(im):
    im_rgba = im.convert('RGBA')
    w, h = im_rgba.size
    arr = np.array(im_rgba)
    
    # Near-white pixels threshold (> 225 across R, G, B)
    is_near_white = (arr[:, :, 0] > 225) & (arr[:, :, 1] > 225) & (arr[:, :, 2] > 225)
    visited = np.zeros((h, w), dtype=bool)
    queue = deque()
    
    # Start flood-fill from all 4 borders
    for x in range(w):
        if is_near_white[0, x]:
            queue.append((0, x))
            visited[0, x] = True
        if is_near_white[h-1, x]:
            queue.append((h-1, x))
            visited[h-1, x] = True
            
    for y in range(h):
        if is_near_white[y, 0]:
            queue.append((y, 0))
            visited[y, 0] = True
        if is_near_white[y, w-1]:
            queue.append((y, w-1))
            visited[y, w-1] = True
            
    while queue:
        cy, cx = queue.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_near_white[ny, nx]:
                visited[ny, nx] = True
                queue.append((ny, nx))
                
    arr[visited, 3] = 0
    return Image.fromarray(arr)

def get_column_blocks(im_rgba):
    arr = np.array(im_rgba)
    opaque = arr[:, :, 3] > 0
    col_activity = opaque.sum(axis=0)
    blocks = []
    in_block = False
    start = 0
    for x in range(len(col_activity)):
        if col_activity[x] > 5 and not in_block:
            in_block = True
            start = x
        elif col_activity[x] <= 5 and in_block:
            in_block = False
            blocks.append((start, x-1))
    if in_block:
        blocks.append((start, len(col_activity)-1))
    return blocks

def crop_block(im_rgba, bx0, bx1):
    arr = np.array(im_rgba)
    opaque = arr[:, :, 3] > 0
    block_mask = opaque[:, bx0:bx1+1]
    coords = np.argwhere(block_mask)
    if len(coords) == 0:
        return None
    by0, _ = coords.min(axis=0)
    by1, _ = coords.max(axis=0)
    return im_rgba.crop((bx0, by0, bx1+1, by1+1))

def process_all_sprites():
    sprites_dir = 'public/assets/sprites'
    for f in os.listdir(sprites_dir):
        if f.endswith('.png') and not f.endswith('_front.png'):
            src_path = os.path.join(sprites_dir, f)
            print(f'Processando sprite: {f}...')
            im = Image.open(src_path)
            im_trans = remove_background(im)
            
            # Sobrescreve com PNG RGBA transparente real
            im_trans.save(src_path, format='PNG')
            
            # Detecta blocos e extrai frame frontal/idle
            blocks = get_column_blocks(im_trans)
            if blocks:
                front_crop = crop_block(im_trans, blocks[0][0], blocks[0][1])
                if front_crop:
                    base_name = os.path.splitext(f)[0]
                    front_path = os.path.join(sprites_dir, f'{base_name}_front.png')
                    front_crop.save(front_path, format='PNG')
                    print(f'  -> Salvo recorte frontal: {base_name}_front.png ({front_crop.size[0]}x{front_crop.size[1]})')

def process_icons():
    icons_path = 'public/assets/icons/icons_consumables.png'
    if os.path.exists(icons_path):
        print('Processando ícones consumíveis...')
        im = Image.open(icons_path)
        im_trans = remove_background(im)
        im_trans.save(icons_path, format='PNG')
        blocks = get_column_blocks(im_trans)
        for idx, (bx0, bx1) in enumerate(blocks):
            icon_crop = crop_block(im_trans, bx0, bx1)
            if icon_crop:
                out_path = f'public/assets/icons/icon_consumable_{idx+1}.png'
                icon_crop.save(out_path, format='PNG')
                print(f'  -> Salvo ícone: icon_consumable_{idx+1}.png ({icon_crop.size[0]}x{icon_crop.size[1]})')

if __name__ == '__main__':
    process_all_sprites()
    process_icons()
    print('Processamento concluído com sucesso!')
