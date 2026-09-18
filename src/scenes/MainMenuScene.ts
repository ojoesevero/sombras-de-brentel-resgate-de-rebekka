import { BaseScene } from './BaseScene';
import { InputService, GameAction } from '../services/InputService';
import { globalSaveService } from '../services/SaveService';
import { GsapBattleArena } from '../combat-gsap/GsapBattleArena';
import { TavernHub } from '../tavern-gsap/TavernHub';
import { ForestWorldEngine } from '../rendering/ForestWorldEngine';

interface MenuOption {
  text: string;
  scene?: string;
  action?: () => void;
}

/**
 * MainMenuScene: Menu principal retro em TypeScript navegável 100% por teclado.
 * Suporta detecção dinâmica de savegame e inicialização de novo jogo.
 */
export class MainMenuScene extends BaseScene {
  private options: MenuOption[] = [];
  private selectedIndex: number = 0;
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private statusText: Phaser.GameObjects.Text | null = null;
  private inputService: InputService | null = null;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  public create(): void {
    const { width, height } = this.scale;

    // Fundo Gradiente Escuro Retro com Grid Sutil
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x050811, 0x050811, 0x111628, 0x111628, 1);
    bg.fillRect(0, 0, width, height);

    // Título Principal com Fonte Cinzel Épica
    this.add.text(240, 36, 'SOMBRAS DE BRENTEL', {
      fontFamily: '"Cinzel", serif',
      fontSize: '20px',
      resolution: 3,
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(240, 58, 'O Resgate de Rebekka - RPG Tático (v0.3.5)', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '9px',
      resolution: 3,
      color: '#b0c0d8',
      stroke: '#000000',
      strokeThickness: 1.5
    }).setOrigin(0.5);

    // Constrói menu dinamicamente dependendo da existência de Save
    this.options = [];
    const hasSave = globalSaveService.hasSave();

    if (hasSave) {
      this.options.push({
        text: '► Continuar Jogo Salvo',
        action: () => this._continueSavedGame()
      });
    }

    this.options.push(
      { text: '★ Estrada da Floresta [100% HTML/CSS/SVG Procedural]', action: () => this._startForestWorld() },
      { text: hasSave ? '1. Retornar à Taverna [GSAP]' : '1. Nova Aventura: Taverna Cauda do Dragão [GSAP]', action: () => this._startTavernHub() },
      { text: '2. Arena de Combate por Turnos (Phaser)', scene: 'BattlePrototypeScene' },
      { text: '3. Arena Estilizada GSAP + CSS3 [PROTÓTIPO]', action: () => this._startGsapBattle() },
      { text: '4. Galeria de Assets (28 Imagens)', scene: 'AssetGalleryScene' },
      { text: '5. Status dos Sistemas Técnicos', action: () => this._showSystemStatus() }
    );

    this.selectedIndex = 0;
    this.optionTexts = [];

    const startY = 82;
    const spacingY = 20;

    this.options.forEach((opt, idx) => {
      const t = this.add.text(240, startY + idx * spacingY, opt.text, {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '11px',
        resolution: 3,
        color: '#8888aa',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      this.optionTexts.push(t);
    });

    this.statusText = this.add.text(
      240,
      245,
      'Controles: [W/S/Setas] Navegar | [Z/Enter/Espaço] Confirmar | [1-4] Atalhos',
      {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '9px',
        resolution: 3,
        color: '#8899aa',
        stroke: '#000000',
        strokeThickness: 1.5
      }
    ).setOrigin(0.5);

    this._updateVisuals();

    // Input Service
    this.inputService = new InputService();
    this.inputService.attach(this);

    this.inputService.on(GameAction.UP, () => {
      this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
      this._updateVisuals();
    });

    this.inputService.on(GameAction.DOWN, () => {
      this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
      this._updateVisuals();
    });

    this.inputService.on(GameAction.CONFIRM, () => {
      this._executeSelectedOption();
    });

    this.inputService.on(GameAction.ACTION_1, () => {
      this._startTavernHub();
    });

    this.inputService.on(GameAction.ACTION_2, () => {
      this.scene.start('BattlePrototypeScene');
    });

    if (this.input.keyboard) {
      const keyOne = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
      keyOne.on('down', () => {
        this._startTavernHub();
      });
      const keyThree = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
      keyThree.on('down', () => {
        this._startGsapBattle();
      });
      const keyFour = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
      keyFour.on('down', () => {
        this.scene.start('AssetGalleryScene');
      });
      const keyFive = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);
      keyFive.on('down', () => {
        this._startForestWorld();
      });
      const keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
      keyF.on('down', () => {
        this._startForestWorld();
      });
      const keyG = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
      keyG.on('down', () => {
        this.scene.start('AssetGalleryScene');
      });
    }
  }

  private _updateVisuals(): void {
    this.optionTexts.forEach((t, i) => {
      if (i === this.selectedIndex) {
        t.setColor('#00ffff');
        t.setText(`> ${this.options[i].text} <`);
      } else {
        t.setColor('#8888aa');
        t.setText(this.options[i].text);
      }
    });
  }

  private _executeSelectedOption(): void {
    const selected = this.options[this.selectedIndex];
    if (selected.scene) {
      this.scene.start(selected.scene);
    } else if (selected.action) {
      selected.action();
    }
  }

  private _continueSavedGame(): void {
    this._startTavernHub();
  }

  private _showSystemStatus(): void {
    if (this.statusText) {
      this.statusText.setText('Sistemas: Resolução Nativa | SaveService + Inventory + Quests Ativos');
      this.statusText.setColor('#00ff00');
      this.time.delayedCall(2500, () => {
        if (this.statusText) {
          this.statusText.setText('Controles: [W/S/Setas] Navegar | [Z/Enter/Espaço] Confirmar | [1-4] Atalhos');
          this.statusText.setColor('#555577');
        }
      });
    }
  }

  private _startTavernHub(): void {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.style.display = 'none';
    }
    const hub = new TavernHub();
    hub.start(() => {
      if (gameContainer) {
        gameContainer.style.display = 'flex';
      }
      this.scene.restart();
    });
  }

  private _startGsapBattle(): void {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.style.display = 'none';
    }
    const arena = new GsapBattleArena();
    arena.start(() => {
      if (gameContainer) {
        gameContainer.style.display = 'flex';
      }
      this.scene.restart();
    });
  }

  private _startForestWorld(): void {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.style.display = 'none';
    }
    const forest = new ForestWorldEngine();
    forest.start(() => {
      if (gameContainer) {
        gameContainer.style.display = 'flex';
      }
      this.scene.restart();
    });
  }
}
