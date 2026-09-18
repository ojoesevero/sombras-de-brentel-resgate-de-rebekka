import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { InputService, GameAction } from '../services/InputService';

interface AssetItem {
  key: string;
  name: string;
  path: string;
  category: string;
  dimensions: string;
  aspectRatio: string;
}

/**
 * AssetGalleryScene: Galeria de teste e inspeção técnica de todos os 28 assets visuais do jogo.
 * Permite alternar categorias, navegar por itens, alternar zoom/enquadramento e validar resolução.
 */
export class AssetGalleryScene extends BaseScene {
  private categories: string[] = ['Cenários', 'Portraits', 'Sprites', 'Ícones'];
  private currentCategoryIndex: number = 0;
  private currentItemIndex: number = 0;
  private assetsData: Record<string, AssetItem[]> = {
    'Cenários': [
      {
        key: 'bg_tavern_cauda_do_dragao',
        name: 'Taverna Cauda do Dragão (Interior)',
        path: 'public/assets/scenarios/bg_tavern_cauda_do_dragao.png',
        category: 'Cenários',
        dimensions: '2752 x 1536',
        aspectRatio: '16:9'
      },
      {
        key: 'bg_arena_centurion',
        name: 'Arena dos Centuriões (Combate)',
        path: 'public/assets/scenarios/bg_arena_centurion.png',
        category: 'Cenários',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'bg_cidade_rastphen',
        name: 'Cidade de Rastphen (Exterior)',
        path: 'public/assets/scenarios/bg_cidade_rastphen.png',
        category: 'Cenários',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'bg_floresta_brentel',
        name: 'Floresta Cinzenta de Brentel',
        path: 'public/assets/scenarios/bg_floresta_brentel.png',
        category: 'Cenários',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      }
    ],
    'Portraits': [
      {
        key: 'portrait_rhogar',
        name: 'Rhogar Tordan (Draconato de Bronze)',
        path: 'public/assets/portraits/portrait_rhogar.png',
        category: 'Portraits',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'portrait_joseph',
        name: 'Joseph Sylven (Paladino Meio-Elfo)',
        path: 'public/assets/portraits/portrait_joseph.png',
        category: 'Portraits',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'portrait_hilda',
        name: 'Dona Hilda (Proprietária da Taverna)',
        path: 'public/assets/portraits/portrait_hilda.png',
        category: 'Portraits',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'portrait_gnoma',
        name: 'Atendente Gnoma das Rochas',
        path: 'public/assets/portraits/portrait_gnoma.png',
        category: 'Portraits',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'portrait_alicia',
        name: 'Alícia Lavdik (Barda Elfa)',
        path: 'public/assets/portraits/portrait_alicia.png',
        category: 'Portraits',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'portrait_traudon',
        name: 'Traudon Balker (Druida Anão)',
        path: 'public/assets/portraits/portrait_traudon.png',
        category: 'Portraits',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'portrait_veronica',
        name: 'Verônica Stínfy (Feiticeira Briehting)',
        path: 'public/assets/portraits/portrait_veronica.png',
        category: 'Portraits',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'portrait_john',
        name: 'John Bardem (Patrulheiro Humano)',
        path: 'public/assets/portraits/portrait_john.png',
        category: 'Portraits',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      }
    ],
    'Sprites': [
      {
        key: 'spr_rhogar_tordan',
        name: 'Sprite: Rhogar Tordan',
        path: 'public/assets/sprites/spr_rhogar_tordan.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'spr_joseph_sylven',
        name: 'Sprite: Joseph Sylven',
        path: 'public/assets/sprites/spr_joseph_sylven.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'spr_dona_hilda',
        name: 'Sprite: Dona Hilda',
        path: 'public/assets/sprites/spr_dona_hilda.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'spr_atendente_gnoma',
        name: 'Sprite: Atendente Gnoma',
        path: 'public/assets/sprites/spr_atendente_gnoma.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'spr_alicia_lavdik',
        name: 'Sprite: Alícia Lavdik',
        path: 'public/assets/sprites/spr_alicia_lavdik.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'spr_traudon_balker',
        name: 'Sprite: Traudon Balker',
        path: 'public/assets/sprites/spr_traudon_balker.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'spr_veronica_stinfy',
        name: 'Sprite: Verônica Stínfy',
        path: 'public/assets/sprites/spr_veronica_stinfy.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'spr_john_bardem',
        name: 'Sprite: John Bardem',
        path: 'public/assets/sprites/spr_john_bardem.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'spr_bandido_estrada',
        name: 'Sprite: Bandido da Estrada',
        path: 'public/assets/sprites/spr_bandido_estrada.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'spr_lobo_cinzento',
        name: 'Sprite: Lobo Cinzento de Brentel',
        path: 'public/assets/sprites/spr_lobo_cinzento.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'spr_gladiador_arena',
        name: 'Sprite: Gladiador da Arena',
        path: 'public/assets/sprites/spr_gladiador_arena.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'spr_gnomo_garcom',
        name: 'Sprite: Gnomo Garçom',
        path: 'public/assets/sprites/spr_gnomo_garcom.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'spr_fregueses_pack',
        name: 'Sprite: Fregueses da Taverna (Pack)',
        path: 'public/assets/sprites/spr_fregueses_pack.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'spr_chest_interactive',
        name: 'Sprite: Baú Interativo de Tesouro',
        path: 'public/assets/sprites/spr_chest_interactive.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      },
      {
        key: 'spr_save_book',
        name: 'Sprite: Tomo Antigo de Registro (Save)',
        path: 'public/assets/sprites/spr_save_book.png',
        category: 'Sprites',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      }
    ],
    'Ícones': [
      {
        key: 'icons_consumables',
        name: 'Pack de Ícones: Consumíveis e Itens',
        path: 'public/assets/icons/icons_consumables.png',
        category: 'Ícones',
        dimensions: '1024 x 572',
        aspectRatio: '16:9'
      }
    ]
  };

  private displayImage!: Phaser.GameObjects.Image;
  private titleText!: Phaser.GameObjects.Text;
  private categoryTabs: Phaser.GameObjects.Text[] = [];
  private infoText!: Phaser.GameObjects.Text;
  private counterText!: Phaser.GameObjects.Text;
  private inputService: InputService | null = null;
  private isFitMode: boolean = true;

  constructor() {
    super({ key: 'AssetGalleryScene' });
  }

  public create(): void {
    this.initBaseCamera();
    this.cameras.main.setBackgroundColor(0x0a0c16);

    // Topo: Título da Galeria
    this.add.text(240, 12, 'INSPEÇÃO TÉCNICA DE ASSETS VISUAIS (28 ARQUIVOS)', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '9px',
      color: '#ffd700',
      fontStyle: 'bold',
      resolution: 3,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Linha divisória
    this.add.rectangle(240, 22, 460, 1, 0x334466);

    // Abas de Categoria
    this.categoryTabs = [];
    const tabStartX = 70;
    const tabSpacing = 110;
    this.categories.forEach((cat, idx) => {
      const tab = this.add.text(tabStartX + idx * tabSpacing, 32, cat, {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '9px',
        resolution: 3,
        color: '#778899'
      }).setOrigin(0.5);
      this.categoryTabs.push(tab);
    });

    // Moldura do Preview da Imagem
    this.add.rectangle(240, 125, 360, 150, 0x05070e).setStrokeStyle(1, 0x00ffff);

    // Imagem de Exibição
    this.displayImage = this.add.image(240, 125, 'bg_tavern_cauda_do_dragao');

    // Contador e Título do Item
    this.titleText = this.add.text(240, 206, '', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '9px',
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: 3,
      stroke: '#000000',
      strokeThickness: 1.5
    }).setOrigin(0.5);

    this.infoText = this.add.text(240, 218, '', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '8px',
      color: '#88aaff',
      resolution: 3
    }).setOrigin(0.5);

    this.counterText = this.add.text(240, 230, '', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '8px',
      color: '#aaaaaa',
      resolution: 3
    }).setOrigin(0.5);

    // Barra de rodapé de instruções
    this.add.rectangle(240, 256, 460, 20, 0x070914).setStrokeStyle(1, 0x223355);
    this.add.text(
      240,
      256,
      '[W/S/Tab] Categoria | [A/D/Setas] Item | [Z/Enter] Alternar Ajuste | [ESC] Menu',
      {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '8px',
        color: '#ffcc00',
        resolution: 3
      }
    ).setOrigin(0.5);

    this._updateDisplay();

    // Configuração de Inputs
    this.inputService = new InputService();
    this.inputService.attach(this);

    this.inputService.on(GameAction.LEFT, () => {
      this._changeItem(-1);
    });

    this.inputService.on(GameAction.RIGHT, () => {
      this._changeItem(1);
    });

    this.inputService.on(GameAction.UP, () => {
      this._changeCategory(-1);
    });

    this.inputService.on(GameAction.DOWN, () => {
      this._changeCategory(1);
    });

    this.inputService.on(GameAction.CONFIRM, () => {
      this.isFitMode = !this.isFitMode;
      this._updateDisplay();
    });

    this.inputService.on(GameAction.CANCEL, () => {
      this.scene.start('MainMenuScene');
    });

    // Tecla TAB adicional
    if (this.input.keyboard) {
      const tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
      tabKey.on('down', () => {
        this._changeCategory(1);
      });
    }
  }

  private _changeCategory(dir: number): void {
    this.currentCategoryIndex = (this.currentCategoryIndex + dir + this.categories.length) % this.categories.length;
    this.currentItemIndex = 0;
    this._updateDisplay();
  }

  private _changeItem(dir: number): void {
    const catName = this.categories[this.currentCategoryIndex];
    const items = this.assetsData[catName] || [];
    if (items.length === 0) return;
    this.currentItemIndex = (this.currentItemIndex + dir + items.length) % items.length;
    this._updateDisplay();
  }

  private _updateDisplay(): void {
    const catName = this.categories[this.currentCategoryIndex];
    const items = this.assetsData[catName] || [];

    // Atualiza Abas Visuais
    this.categoryTabs.forEach((tab, idx) => {
      if (idx === this.currentCategoryIndex) {
        tab.setColor('#00ffff');
        tab.setText(`[ ${this.categories[idx]} ]`);
        tab.setFontStyle('bold');
      } else {
        tab.setColor('#667788');
        tab.setText(this.categories[idx]);
        tab.setFontStyle('normal');
      }
    });

    if (items.length === 0) return;

    const currentItem = items[this.currentItemIndex];

    // Atualiza Imagem
    if (this.textures.exists(currentItem.key)) {
      this.displayImage.setTexture(currentItem.key);
      this.displayImage.setVisible(true);

      if (this.isFitMode) {
        // Enquadra mantendo proporção na moldura 350x140
        const frameW = 350;
        const frameH = 140;
        const scale = Math.min(frameW / this.displayImage.width, frameH / this.displayImage.height);
        this.displayImage.setScale(scale);
      } else {
        // Modo Pixel Real / 1:1 limitado à área
        this.displayImage.setScale(0.5);
      }
    } else {
      this.displayImage.setVisible(false);
    }

    // Atualiza Metadados
    this.titleText.setText(currentItem.name);
    const fitLabel = this.isFitMode ? 'Enquadrado (Fit)' : 'Escala 50%';
    this.infoText.setText(
      `Chave: "${currentItem.key}" | Res: ${currentItem.dimensions} (${currentItem.aspectRatio}) | Exibição: ${fitLabel}`
    );
    this.counterText.setText(
      `Item ${this.currentItemIndex + 1} de ${items.length} nesta categoria | [${currentItem.path}]`
    );
  }
}
