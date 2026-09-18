# Guia e Padrão de Nomenclatura de Assets: Sombras de Brentel

Este guia define a estrutura oficial de pastas, nomes padronizados de arquivos e os prompts refinados de IA para o jogo.

---

## 📁 Estrutura Oficial de Pastas em `public/assets/`

Todas as imagens prontas devem ser salvas no diretório `public/assets/` com os seguintes nomes padronizados:

```text
public/assets/
├── scenarios/                  # Imagens de fundo e cenários estáticos (16:9, sem personagens)
│   ├── bg_tavern_cauda_do_dragao.png    <-- Salão da Taverna Cauda do Dragão (Vazio)
│   └── bg_arena_centurion.png           <-- Arena de Combate / Flashback
│
├── sprites/                    # Sprites dos personagens e NPCs (PNG com fundo transparente)
│   ├── spr_rhogar_tordan.png            <-- Rhogar Tordan (Draconato de Bronze)
│   ├── spr_joseph_sylven.png            <-- Joseph Sylven (Paladino Meio-Elfo de Lízan)
│   ├── spr_dona_hilda.png               <-- Dona Hilda (Anã da Colina Proprietária)
│   ├── spr_atendente_gnoma.png          <-- Gnoma das Rochas de Avental Roxo
│   ├── spr_alicia_lavdik.png            <-- Barda Elfa Alícia com alaúde
│   ├── spr_traudon_balker.png           <-- Druida Anão Traudon com cajado
│   ├── spr_veronica_stinfy.png          <-- Feiticeira Briehting em vestes vinho
│   └── spr_john_bardem.png              <-- Patrulheiro Humano John
│
├── portraits/                  # Retratos para a caixa de diálogo (Rosto/Busto 48x48, 64x64 ou 128x128)
│   ├── portrait_rhogar.png              <-- Retrato de Rhogar Tordan
│   ├── portrait_joseph.png              <-- Retrato de Joseph Sylven
│   ├── portrait_hilda.png               <-- Retrato de Dona Hilda
│   ├── portrait_gnoma.png               <-- Retrato da Atendente Gnoma
│   └── portrait_veronica.png            <-- Retrato de Verônica Stínfy
│
└── tilesets/                   # Folhas de tiles modulares 16x16
    └── tileset_tavern.png               # Piso, balcão, paredes e lareira em grade modular
```

---

## 🎨 Prompts Refinados de IA

### 1. Cenário da Taverna (Vazio & Altamente Detalhado)
- **Arquivo Destino:** `public/assets/scenarios/bg_tavern_cauda_do_dragao.png`
- **Aspect Ratio:** `16:9`
- **Prompt:**
> `Highly detailed 16-bit pixel art interior of medieval fantasy tavern named "Cauda do Dragão", completely empty room, no people, no characters, no patrons, no barman, vacant wooden stools and empty oak tables. Intricate dark aged wooden floor planks with grain and iron nail heads, large stone hearth fireplace on the left with glowing embers and crackling wood logs, long polished oak service counter with empty beer steins, glass liquor bottles, barrels, kegs and taps on shelves behind. Stone walls with carved heraldic dragon banners, hanging lanterns and candle wall sconces casting atmospheric volumetric warm amber lighting on tables and pelt rugs, wooden staircase on the right leading up to second floor. Orthogonal top-down 3/4 JRPG perspective, classic Suikoden and Chrono Trigger aesthetic, crisp clean pixel clusters, rich textures, no blur, no anti-aliasing --ar 16:9 --v 6.1 --style raw`

---

### 2. Personagens / Sprites Individuais (Fundo Transparente)

#### Rhogar Tordan (Protagonista)
- **Arquivo Destino:** `public/assets/sprites/spr_rhogar_tordan.png`
- **Prompt:**
> `16-bit pixel art full-body character sprite of Rhogar Tordan, 2-meter tall muscular bronze dragonborn warrior, gleaming polished bronze scales, sharp reptilian amber eyes, wearing rugged gladiator leather tunic and iron pauldrons, hooded dark cloak, idle standing pose, 4-directional top-down RPG perspective, isolated on solid white background, clean pixel art edges, classic SNES JRPG style, no background --v 6.1 --style raw`

#### Joseph Sylven (Paladino Meio-Elfo)
- **Arquivo Destino:** `public/assets/sprites/spr_joseph_sylven.png`
- **Prompt:**
> `16-bit pixel art full-body character sprite of Joseph Sylven, young male half-elf paladin, noble gentle face, wearing a traveler acolyte tunic over chainmail, silver sacred amulet necklace with two clasped hands in prayer (symbol of Lízan) prominently on chest, idle standing pose, 4-directional top-down RPG perspective, isolated on solid white background, clean crisp pixels, no background --v 6.1 --style raw`

#### Dona Hilda (Anã da Colina)
- **Arquivo Destino:** `public/assets/sprites/spr_dona_hilda.png`
- **Prompt:**
> `16-bit pixel art full-body character sprite of Dona Hilda, middle-aged female hill dwarf tavern owner, sturdy build, braided hair, sturdy leather apron over rustic tavernkeeper dress, stern authoritative expression, idle standing pose, top-down RPG perspective, isolated on solid white background, clean pixel art --v 6.1 --style raw`

#### Gnoma das Rochas (Atendente)
- **Arquivo Destino:** `public/assets/sprites/spr_atendente_gnoma.png`
- **Prompt:**
> `16-bit pixel art full-body character sprite of a young female rock gnome waitress, greenish-black hair tied in a neat bun, green-brown skin, wearing a distinct purple apron, holding small parchment notepad and charcoal stick, smiling polite expression, top-down RPG perspective, isolated on solid white background, crisp pixel art --v 6.1 --style raw`
