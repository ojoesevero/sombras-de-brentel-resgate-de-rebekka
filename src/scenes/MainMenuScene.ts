import { BaseScene } from './BaseScene';
import { InputService, GameAction } from '../services/InputService';

interface MenuOption {
  text: string;
  scene?: string;
  action?: () => void;
}

/**
 * MainMenuScene: Menu principal retro em TypeScript navegável 100% por teclado.
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
    this.initBaseCamera();
    this.cameras.main.setBackgroundColor(0x0a0a14);

    // Título Principal
    this.add.text(240, 45, 'SOMBRAS DE BRENTEL', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(240, 68, 'Fundação Técnica - Protótipo Mínimo', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#8888aa'
    }).setOrigin(0.5);

    // Menu de opções técnicas
    this.options = [
      { text: '1. Sandbox de Exploração Técnica (Top-Down)', scene: 'TechnicalSandboxScene' },
      { text: '2. Arena de Combate por Turnos (Batalha)', scene: 'BattlePrototypeScene' },
      { text: '3. Status dos Sistemas Técnicos', action: () => this._showSystemStatus() }
    ];

    this.selectedIndex = 0;
    this.optionTexts = [];

    this.options.forEach((opt, idx) => {
      const t = this.add.text(240, 120 + idx * 24, opt.text, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#8888aa'
      }).setOrigin(0.5);
      this.optionTexts.push(t);
    });

    this.statusText = this.add.text(
      240,
      235,
      'Controles: [W/S/Setas] Navegar | [Z/Enter/Espaço] Confirmar | [1/2] Atalhos',
      {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#555577'
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
      this.scene.start('TechnicalSandboxScene');
    });

    this.inputService.on(GameAction.ACTION_2, () => {
      this.scene.start('BattlePrototypeScene');
    });
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

  private _showSystemStatus(): void {
    if (this.statusText) {
      this.statusText.setText('Sistemas: Resolução 480x270 | Integer Scale Ativo | TypeScript Estrito');
      this.statusText.setColor('#00ff00');
      this.time.delayedCall(2500, () => {
        if (this.statusText) {
          this.statusText.setText('Controles: [W/S/Setas] Navegar | [Z/Enter/Espaço] Confirmar | [1/2] Atalhos');
          this.statusText.setColor('#555577');
        }
      });
    }
  }
}
