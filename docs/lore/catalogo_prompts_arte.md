# Catálogo Oficial de Prompts de Arte (Pixel Art 16-Bit): Sombras de Brentel

Este catálogo reúne todos os prompts padronizados para geração dos assets visuais do jogo via IA (Midjourney v6.1, DALL-E 3, Stable Diffusion, Leonardo.ai, Flux). Todos os prompts são calibrados com o cânone de *Os Seis Contra o Abismo - A Floresta Cinzenta* e as restrições técnicas da engine (Pixel Art JRPG 16-bit, perspectiva ortogonal/3/4 top-down).

---

## 📋 Sumário de Organização

1. [Cenários de Fundo (16:9, Sem Personagens)](#1-cenários-de-fundo-169-sem-personagens)
2. [Protagonistas: Os Seis Contra o Abismo (Sprites e Retratos)](#2-protagonistas-os-seis-contra-o-abismo)
3. [NPCs da Taverna Cauda do Dragão](#3-npcs-da-taverna-cauda-do-dragão)
4. [Inimigos e Criaturas](#4-inimigos-e-criaturas)
5. [Props, Móveis Interativos e Ponto de Save](#5-props-móveis-interativos-e-ponto-de-save)
6. [Ícones de Itens e Inventário](#6-ícones-de-itens-e-inventário)

---

## 1. Cenários de Fundo (16:9, Sem Personagens)

> 💡 **Instrução:** Salvar no diretório `public/assets/scenarios/`. Todos os cenários devem ser gerados **vazios**, permitindo que o código do jogo posicione os personagens e colisores dinamicamente.

### 1.1. Salão da Taverna Cauda do Dragão (Concluído ✅)
- **Arquivo:** `public/assets/scenarios/bg_tavern_cauda_do_dragao.png`
- **Status:** **Gerado e adicionado com sucesso!**

### 1.2. Arena de Gladiadores de Centúrion (Cenário de Combate / Flashback)
- **Arquivo Destino:** `public/assets/scenarios/bg_arena_centurion.png`
- **Descrição:** A arena brutal do Condado de Estayler em Granster, onde Rhogar foi criado como gladiador por Klouder Tordan. Chão de areia batida ensanguentada, muralhas de pedra circular com grades de ferro dos calabouços e arquibancadas sombrias ao fundo.
- **Prompt:**
```text
Highly detailed 16-bit pixel art battle arena of Centurion, Roman fantasy gladiator arena interior, completely empty arena, no fighters, no people, no characters. Dusty trampled sand battleground floor with weapon gouges and scattered pebbles, tall weathered grey stone boundary walls, iron reinforced portcullis dungeon gates on the back, stone spectator stands and banners above. Dramatic overcast lighting casting long shadows across the sandy arena pit, JRPG battle background perspective, classic Suikoden and Octopath pixel aesthetic, sharp pixel clusters, no blur, no anti-aliasing --ar 16:9 --v 6.1 --style raw
```

### 1.3. Rua Noturna da Cidade Fortificada de Rastphen (Exterior da Taverna)
- **Arquivo Destino:** `public/assets/scenarios/bg_cidade_rastphen.png`
- **Descrição:** A rua de paralelepípedos úmidos em frente à Taverna Cauda do Dragão. Fachadas de madeira e pedra com vigas escuras, lampiões de ferro iluminando a névoa noturna, placas de ferro forjado e portões ao longe.
- **Prompt:**
```text
Highly detailed 16-bit pixel art medieval fortified town street of Rastphen at night, top-down 3/4 orthogonal RPG view, completely empty street, no people, no characters, no pedestrians. Wet cobblestone pavement reflecting warm candlelight from iron street lanterns, timber-framed medieval stone building facades with wooden roof shingles, iron-forged tavern sign hanging outside, cozy light spilling from shuttered windows into the cold misty night air, classic SNES JRPG town exterior, rich textures, crisp pixel clusters, no anti-aliasing --ar 16:9 --v 6.1 --style raw
```

### 1.4. Estrada da Floresta Cinzenta de Brentel (Ato 1)
- **Arquivo Destino:** `public/assets/scenarios/bg_floresta_brentel.png`
- **Descrição:** A estrada de terra lamacenta cercada pelas árvores antigas e retorcidas da Floresta Cinzenta. Raízes expostas, folhagens sombrias, névoa baixa e feixes de luz filtrados entre a copa das árvores.
- **Prompt:**
```text
Highly detailed 16-bit pixel art dark temperate forest path in Brentel, top-down orthogonal RPG view, completely empty forest clearing, no people, no monsters, no creatures. Muddy dirt path surrounded by towering gnarled ancient mossy pine and oak trees, exposed winding tree roots, thick forest floor ferns, ominous grey-green morning mist rolling between the tree trunks, subtle rays of cool sunlight piercing the dense canopy, classic 16-bit JRPG wilderness, clean pixel art --ar 16:9 --v 6.1 --style raw
```

---

## 2. Protagonistas: Os Seis Contra o Abismo

> 💡 **Instrução de Sprites:** Salvar em `public/assets/sprites/`. Fundo transparente (ou branco sólido para recorte fácil).  
> 💡 **Instrução de Retratos:** Salvar em `public/assets/portraits/`. Enquadramento quadrado (close no rosto e busto).

---

### 2.1. Rhogar Tordan (Draconato Gladiador)
- **Sprite:** `public/assets/sprites/spr_rhogar_tordan.png`
```text
16-bit pixel art full-body character sprite of Rhogar Tordan, imposing 2-meter tall muscular bronze dragonborn warrior, body covered in polished bronze reptilian scales, sharp amber eyes, horns sweeping back, rugged gladiator leather tunic with iron pauldrons and dark hooded travel cloak, idle standing pose, 4-directional top-down RPG perspective, isolated on solid white background, clean pixel edges, classic Chrono Trigger and Suikoden aesthetic, no background --v 6.1 --style raw
```
- **Retrato:** `public/assets/portraits/portrait_rhogar.png`
```text
16-bit pixel art dialogue portrait of Rhogar Tordan, mighty bronze dragonborn warrior, gleaming textured bronze scales, sharp golden-amber slit reptilian eyes, draconic ridges on jaw, determined honorable expression, battle scars, dark hooded cloak over broad shoulders, warm ambient candlelight rim lighting, square avatar 64x64 JRPG portrait, crisp pixel clusters, no smooth vector blur --ar 1:1 --v 6.1 --style raw
```

---

### 2.2. Joseph Sylven (Paladino Meio-Elfo de Lízan)
- **Sprite:** `public/assets/sprites/spr_joseph_sylven.png`
```text
16-bit pixel art full-body character sprite of Joseph Sylven, young male half-elf paladin, noble handsome face with slightly pointed ears, calm and serene posture, wearing a traveler acolyte tunic over light chainmail armor, prominent silver holy amulet necklace on chest with two hands clasped in prayer (sacred symbol of Lízan), idle standing pose, 4-directional top-down RPG perspective, isolated on solid white background, crisp pixel art, snes style --v 6.1 --style raw
```
- **Retrato:** `public/assets/portraits/portrait_joseph.png`
```text
16-bit pixel art dialogue portrait of Joseph Sylven, young male half-elf paladin of Lízan, gentle compassionate eyes, noble calm facial features with subtle pointed ears, silver amulet necklace with two clasped praying hands clearly visible at his collar, wearing acolyte linen and chainmail, soft warm tavern lighting, square framed avatar 64x64 90s JRPG style, crisp pixel clusters, no anti-aliasing --ar 1:1 --v 6.1 --style raw
```

---

### 2.3. Verônica Stínfy (Feiticeira Briehting)
- **Sprite:** `public/assets/sprites/spr_veronica_stinfy.png`
```text
16-bit pixel art full-body character sprite of Verônica Stínfy, beautiful mysterious briehting sorceress, flowing dark hair, wearing elegant deep wine-red robes with arcane silver trim and leather travel boots, confident graceful posture, idle standing pose, 4-directional top-down RPG perspective, isolated on solid white background, crisp pixel art, classic JRPG aesthetic --v 6.1 --style raw
```
- **Retrato:** `public/assets/portraits/portrait_veronica.png`
```text
16-bit pixel art dialogue portrait of Verônica Stínfy, striking briehting sorceress, sharp intelligent gaze with subtle magical spark, elegant features, long dark hair framing her face, wearing a high-collared deep wine-red velvet robe with silver embroidery, confident enigmatic expression, warm tavern candle reflection, square framed avatar 64x64, classic JRPG dialogue box portrait --ar 1:1 --v 6.1 --style raw
```

---

### 2.4. John Bardem (Patrulheiro Humano)
- **Sprite:** `public/assets/sprites/spr_john_bardem.png`
```text
16-bit pixel art full-body character sprite of John Bardem, seasoned human ranger, rugged bearded face, wearing muted forest green and brown leather armor, composite bow unstrung across back with quiver of arrows, alert hunter stance, 4-directional top-down RPG perspective, isolated on solid white background, clean pixel art --v 6.1 --style raw
```
- **Retrato:** `public/assets/portraits/portrait_john.png`
```text
16-bit pixel art dialogue portrait of John Bardem, rugged human ranger, watchful keen eyes, weathered handsome face with short brown beard and travel-stained hood, practical leather collar, serious calculating expression of an experienced tracker, square avatar 64x64 JRPG portrait, sharp pixel art --ar 1:1 --v 6.1 --style raw
```

---

### 2.5. Alícia Lavdik (Barda Elfa do Sol)
- **Sprite:** `public/assets/sprites/spr_alicia_lavdik.png`
```text
16-bit pixel art full-body character sprite of Alícia Lavdik, radiant female sun elf bard, vibrant golden-blonde hair, cheerful smiling posture, holding an acoustic wooden lute in her hands, colorful bardic travel tunic in gold and turquoise tones, 4-directional top-down RPG perspective, isolated on solid white background, clean pixel art, vibrant colors --v 6.1 --style raw
```
- **Retrato:** `public/assets/portraits/portrait_alicia.png`
```text
16-bit pixel art dialogue portrait of Alícia Lavdik, radiant female sun elf bard, cheerful bright golden eyes, sunny joyful smile, long golden hair with decorative braids and feathers, lute neck visible over shoulder, elegant colorful traveling vest, bright warm lighting, square avatar 64x64 JRPG portrait, crisp pixel art --ar 1:1 --v 6.1 --style raw
```

---

### 2.6. Traudon Balker (Druida Anão Sábio)
- **Sprite:** `public/assets/sprites/spr_traudon_balker.png`
```text
16-bit pixel art full-body character sprite of Traudon Balker, wise 300-year-old hill dwarf druid, long braided grey-white beard, wearing simple earthy moss-green and brown robes, holding a curved gnarled wooden druid staff, calm contemplative posture, 4-directional top-down RPG perspective, isolated on solid white background, clean pixel art --v 6.1 --style raw
```
- **Retrato:** `public/assets/portraits/portrait_traudon.png`
```text
16-bit pixel art dialogue portrait of Traudon Balker, ancient venerable hill dwarf druid, deeply wise patient eyes, magnificent long braided silver beard with wooden runes, moss-green rough linen collar, gnarled staff tip near shoulder, serene expression in harmony with nature, square avatar 64x64 JRPG portrait, sharp pixel art --ar 1:1 --v 6.1 --style raw
```

---

## 3. NPCs da Taverna Cauda do Dragão

### 3.1. Dona Hilda (Proprietária da Taverna)
- **Sprite:** `public/assets/sprites/spr_dona_hilda.png`
```text
16-bit pixel art character sprite of Dona Hilda, sturdy female hill dwarf tavern owner, braided brown hair pinned up, wearing a tough leather apron over a sturdy tavern dress, arms crossed or hands on hips, authoritative respected expression, idle standing pose, top-down RPG perspective, isolated on solid white background, clean pixel art --v 6.1 --style raw
```
- **Retrato:** `public/assets/portraits/portrait_hilda.png`
```text
16-bit pixel art dialogue portrait of Dona Hilda, middle-aged female hill dwarf tavernkeeper, sharp scrutinizing brown eyes, braided grey-brown hair, stern no-nonsense but deeply knowledgeable expression, sturdy linen dress with leather strap, warm tavern background glow, square avatar 64x64 JRPG portrait, crisp pixels --ar 1:1 --v 6.1 --style raw
```

### 3.2. Atendente Gnoma das Rochas
- **Sprite:** `public/assets/sprites/spr_atendente_gnoma.png`
```text
16-bit pixel art character sprite of a young female rock gnome waitress, greenish-black hair tied in a neat bun, green-brown tinted skin, wearing a distinct purple apron, holding small parchment notepad and charcoal stick, polite welcoming posture, top-down RPG perspective, isolated on solid white background, clean pixel edges --v 6.1 --style raw
```
- **Retrato:** `public/assets/portraits/portrait_gnoma.png`
```text
16-bit pixel art dialogue portrait of young rock gnome waitress, large friendly expressive dark eyes, dark greenish-black hair in a bun, olive-greenish skin, wearing a purple apron bib, holding a charcoal writing stick, polite cheerful expression, warm ambient candlelight, square avatar 64x64 JRPG portrait --ar 1:1 --v 6.1 --style raw
```

### 3.3. Gnomo Garçom Careca
- **Sprite:** `public/assets/sprites/spr_gnomo_garcom.png`
```text
16-bit pixel art character sprite of a male rock gnome waiter, bald head, bushy dark eyebrows, wearing a simple linen shirt and dark apron, carrying a round wooden serving tray with beer mugs and platters, walking/standing pose, top-down RPG perspective, isolated on solid white background --v 6.1 --style raw
```

### 3.4. Fregueses da Taverna (Clientes Sentados & Conversando)
- **Sprite:** `public/assets/sprites/spr_fregueses_pack.png`
```text
16-bit pixel art sprite sheet of medieval tavern patrons sitting on wooden chairs, top-down 3/4 perspective: an armored human mercenary drinking ale, a cloaked merchant counting coins, and two townsfolk chatting at a table, classic 16-bit JRPG NPC sprites, isolated on solid white background, crisp outlines --v 6.1 --style raw
```

---

## 4. Inimigos e Criaturas

> 💡 **Instrução:** Salvar em `public/assets/sprites/`. Inimigos usados na arena ou na estrada.

### 4.1. Gladiador Rival de Centúrion (Tutorial de Combate)
- **Sprite:** `public/assets/sprites/spr_gladiador_arena.png`
```text
16-bit pixel art combatant sprite of a fierce human arena gladiator, bronze crested helmet covering upper face, muscular torso with leather chest straps, wielding a short gladius sword and rectangular scutum shield, dynamic combat ready stance, JRPG battle enemy perspective, isolated on solid white background, clean pixel art --v 6.1 --style raw
```

### 4.2. Lobo Cinzento de Brentel
- **Sprite:** `public/assets/sprites/spr_lobo_cinzento.png`
```text
16-bit pixel art sprite of a ferocious wild grey wolf, thick mottled grey and black fur, bared fangs, glowing yellow eyes, muscular predatory crouching combat stance, JRPG battle enemy perspective, isolated on solid white background, clean pixel edges --v 6.1 --style raw
```

### 4.3. Salteador / Bandido da Estrada
- **Sprite:** `public/assets/sprites/spr_bandido_estrada.png`
```text
16-bit pixel art combatant sprite of a rogue highwayman bandit, dark scarf covering mouth, worn studded leather armor, wielding twin rusty daggers, menacing battle idle stance, JRPG battle enemy perspective, isolated on solid white background --v 6.1 --style raw
```

---

## 5. Props, Móveis Interativos e Ponto de Save

> 💡 **Instrução:** Salvar em `public/assets/sprites/`. Objetos individuais para interagir no mapa.

### 5.1. Livro de Hóspedes & Vela Sagrada (Ponto de Save do Jogo)
- **Arquivo Destino:** `public/assets/sprites/spr_save_book.png`
- **Prompt:**
```text
16-bit pixel art interactive save point object, an antique leather-bound open guestbook register resting on a small carved pedestal table, beside a tall burning wax candle with magical glowing golden flame and floating mystical sparkles, top-down RPG perspective, isolated on solid white background, clean pixel art --v 6.1 --style raw
```

### 5.2. Baú de Madeira Reforçado (Fechado e Aberto)
- **Arquivo Destino:** `public/assets/sprites/spr_chest_interactive.png`
```text
16-bit pixel art sprite sheet of a medieval wooden treasure chest, reinforced with dark iron bands and sturdy lock: sprite 1 closed chest, sprite 2 opened chest revealing glowing golden light inside, top-down 3/4 RPG perspective, isolated on solid white background, clean pixel art --v 6.1 --style raw
```

---

## 6. Ícones de Itens e Inventário

> 💡 **Instrução:** Salvar em `public/assets/icons/` (32x32 pixels ou 64x64 pixels).

### 6.1. Conjunto de Ícones Essenciais (Poção, Ouro, Vinho de Pêssego e Carne)
- **Arquivo Destino:** `public/assets/icons/icons_consumables.png`
- **Prompt:**
```text
16-bit pixel art inventory icon sheet, 4 distinct items in individual square frames with dark borders: 
1. Glass flask of glowing red healing potion with cork stopper, 
2. Leather drawstring pouch overflowing with shiny gold coins, 
3. Glass bottle of peach wine with a peach fruit seal, 
4. Roasted meat platter with slice of yellow aged cheese. 
Crisp 32x32 retro pixel art icons, high contrast, clean readable silhouettes, transparent background --v 6.1 --style raw
```

---

## 🚀 Como Integrar Cada Nova Imagem ao Jogo

Sempre que gerar uma dessas imagens, basta salvá-la com o **nome e pasta indicados**. O carregamento no Phaser já reconhecerá o asset automaticamente no `PreloadScene.ts`.
