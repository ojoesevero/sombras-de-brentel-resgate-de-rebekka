import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { Combatant } from '../core/Combatant';
import { TurnEngine } from '../core/TurnEngine';
import { InputService, GameAction } from '../services/InputService';
import {
  BattleState,
  TurnAction,
  SceneTransitionData,
  PROVISIONAL_BALANCE
} from '../types/game.types';

interface EnemyVisualRecord {
  sprite: Phaser.GameObjects.Sprite;
  nameText: Phaser.GameObjects.Text;
  hpText: Phaser.GameObjects.Text;
  x: number;
  y: number;
}

interface ActionButton {
  id: TurnAction;
  label: string;
}

/**
 * BattlePrototypeScene: Arena provisória de combate por turnos em TypeScript.
 * Interface navegável 100% por teclado com seleção direcional de alvos.
 */
export class BattlePrototypeScene extends BaseScene {
  private player!: Combatant;
  private enemies: Combatant[] = [];
  private turnEngine!: TurnEngine;
  private inputService: InputService | null = null;

  private playerHpText!: Phaser.GameObjects.Text;
  private playerResourceText!: Phaser.GameObjects.Text;

  private enemyVisuals: EnemyVisualRecord[] = [];
  private targetCursor!: Phaser.GameObjects.Sprite;
  private actionButtons: Phaser.GameObjects.Text[] = [];
  private logText!: Phaser.GameObjects.Text;

  private actions: ActionButton[] = [
    { id: 'attack', label: '1. Ataque Básico' },
    { id: 'skill', label: `2. TechnicalSkill (${PROVISIONAL_BALANCE.RESOURCE_COST_SKILL} Recurso)` },
    { id: 'item', label: '3. TestItem (+40 HP)' },
    { id: 'defend', label: '4. Defender' },
    { id: 'flee', label: '5. Fugir' }
  ];

  private selectedActionIndex: number = 0;
  private selectedEnemyIndex: number = 0;
  private isTargeting: boolean = false;
  private isProcessingTurn: boolean = false;

  constructor() {
    super({ key: 'BattlePrototypeScene' });
  }

  public init(data?: SceneTransitionData): void {
    this.player = new Combatant({
      id: 'rhogar_player',
      name: 'Rhogar (Player)',
      isPlayer: true
    });

    if (data?.playerData) {
      this.player.loadState(data.playerData);
    }

    this.enemies = [
      new Combatant({
        id: 'training_target_a',
        name: 'TrainingTarget A',
        maxHp: 35,
        hp: 35,
        attack: 7,
        defense: 2
      }),
      new Combatant({
        id: 'training_target_b',
        name: 'TrainingTarget B',
        maxHp: 45,
        hp: 45,
        attack: 9,
        defense: 3
      })
    ];

    this.turnEngine = new TurnEngine({
      player: this.player,
      enemies: this.enemies
    });
    this.turnEngine.start();
  }

  public create(): void {
    this.initBaseCamera();
    this.cameras.main.setBackgroundColor(0x0e0e1a);

    this._createVisuals();
    this._createUI();
    this._setupInput();
  }

  private _createVisuals(): void {
    // Linha divisória de arena
    this.add.rectangle(240, 180, 460, 2, 0x333355);

    // Sprite e Stats do Jogador (Lado Esquerdo)
    this.add.sprite(90, 120, 'spr_player_dummy').setScale(2);
    this.add.text(90, 80, this.player.name, {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.playerHpText = this.add.text(90, 93, `HP: ${this.player.hp}/${this.player.maxHp}`, {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.playerResourceText = this.add.text(
      90,
      104,
      `TestResource: ${this.player.resource}/${this.player.maxResource}`,
      {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#ffaa00'
      }
    ).setOrigin(0.5);

    // Sprites e Stats dos Alvos de Treinamento (Lado Direito)
    this.enemyVisuals = [];
    const positions = [{ x: 330, y: 100 }, { x: 400, y: 130 }];

    this.enemies.forEach((enemy, i) => {
      const pos = positions[i];
      const sprite = this.add.sprite(pos.x, pos.y, 'spr_training_target').setScale(2);
      const nameText = this.add.text(pos.x, pos.y - 32, enemy.name, {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#ff6666'
      }).setOrigin(0.5);

      const hpText = this.add.text(pos.x, pos.y - 20, `HP: ${enemy.hp}/${enemy.maxHp}`, {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#ff9999'
      }).setOrigin(0.5);

      this.enemyVisuals.push({ sprite, nameText, hpText, x: pos.x, y: pos.y });
    });

    // Retículo de Mira
    this.targetCursor = this.add.sprite(0, 0, 'spr_target_cursor').setScale(1.5).setVisible(false);
  }

  private _createUI(): void {
    // Painel de Ações
    this.add.rectangle(240, 225, 460, 56, 0x0a0a14).setStrokeStyle(1, 0x333355);
    this.actionButtons = [];

    const startX = 25;
    const spacingX = 90;

    this.actions.forEach((act, idx) => {
      const t = this.add.text(startX + idx * spacingX, 225, act.label, {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#8888aa'
      }).setOrigin(0, 0.5);
      this.actionButtons.push(t);
    });

    this.logText = this.add.text(240, 22, 'TURNO DO JOGADOR: Selecione a ação.', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#ffd700'
    }).setOrigin(0.5);

    this._updateVisualSelection();
  }

  private _setupInput(): void {
    this.inputService = new InputService();
    this.inputService.attach(this);

    this.inputService.on(GameAction.LEFT, () => {
      if (this.isProcessingTurn) return;
      if (this.isTargeting) {
        this._changeTarget(-1);
      } else {
        this.selectedActionIndex = (this.selectedActionIndex - 1 + this.actions.length) % this.actions.length;
        this._updateVisualSelection();
      }
    });

    this.inputService.on(GameAction.RIGHT, () => {
      if (this.isProcessingTurn) return;
      if (this.isTargeting) {
        this._changeTarget(1);
      } else {
        this.selectedActionIndex = (this.selectedActionIndex + 1) % this.actions.length;
        this._updateVisualSelection();
      }
    });

    this.inputService.on(GameAction.CONFIRM, () => {
      if (this.isProcessingTurn) return;
      if (this.isTargeting) {
        this._executeActionWithTarget();
      } else {
        this._selectAction();
      }
    });

    this.inputService.on(GameAction.CANCEL, () => {
      if (this.isTargeting) {
        this.isTargeting = false;
        this.targetCursor.setVisible(false);
        this.logText.setText('Seleção de alvo cancelada.');
        this._updateVisualSelection();
      } else {
        this.scene.start('TechnicalSandboxScene');
      }
    });
  }

  private _updateVisualSelection(): void {
    this.actionButtons.forEach((btn, i) => {
      if (i === this.selectedActionIndex && !this.isTargeting) {
        btn.setColor('#00ffff');
        btn.setFontStyle('bold');
      } else {
        btn.setColor('#8888aa');
        btn.setFontStyle('normal');
      }
    });
  }

  private _changeTarget(dir: number): void {
    const aliveIndices: number[] = [];
    this.enemies.forEach((e, i) => {
      if (e.isAlive()) aliveIndices.push(i);
    });
    if (aliveIndices.length === 0) return;

    let currentPos = aliveIndices.indexOf(this.selectedEnemyIndex);
    if (currentPos === -1) currentPos = 0;

    currentPos = (currentPos + dir + aliveIndices.length) % aliveIndices.length;
    this.selectedEnemyIndex = aliveIndices[currentPos];

    const targetPos = this.enemyVisuals[this.selectedEnemyIndex];
    this.targetCursor.setPosition(targetPos.x, targetPos.y).setVisible(true);
    this.logText.setText(`Alvo selecionado: ${this.enemies[this.selectedEnemyIndex].name}`);
  }

  private _selectAction(): void {
    const action = this.actions[this.selectedActionIndex].id;

    if (action === 'attack' || action === 'skill') {
      if (action === 'skill' && this.player.resource < PROVISIONAL_BALANCE.RESOURCE_COST_SKILL) {
        this._flashFeedback(`Recurso insuficiente (requer ${PROVISIONAL_BALANCE.RESOURCE_COST_SKILL})`);
        return;
      }
      this.isTargeting = true;
      this._changeTarget(0);
      this.logText.setText('Selecione o alvo com [Setas Esquerda/Direita] e confirme [Z/Enter].');
    } else if (action === 'item') {
      this._executePlayerTurn('item');
    } else if (action === 'defend') {
      this._executePlayerTurn('defend');
    } else if (action === 'flee') {
      this._executePlayerTurn('flee');
    }
  }

  private _executeActionWithTarget(): void {
    this.isTargeting = false;
    this.targetCursor.setVisible(false);
    const action = this.actions[this.selectedActionIndex].id;
    this._executePlayerTurn(action, { targetIndex: this.selectedEnemyIndex });
  }

  private _executePlayerTurn(action: TurnAction, payload: { targetIndex?: number; itemId?: string } = {}): void {
    this.isProcessingTurn = true;
    const result = this.turnEngine.executePlayerAction(action, payload);

    this._updateHpAndStats();

    if (result.damage !== undefined) {
      const targetVis = this.enemyVisuals[this.selectedEnemyIndex];
      this._showFloatingText(targetVis.x, targetVis.y, `-${result.damage}`, '#ff4444');
      this.cameras.main.shake(80, 0.004);
    } else if (action === 'defend') {
      this._showFloatingText(90, 120, '+15 Recurso', '#ffaa00');
    } else if (action === 'item') {
      this._showFloatingText(90, 120, '+40 HP', '#00ff00');
    }

    if (result.battleState === BattleState.VICTORY) {
      this.logText.setText('VITÓRIA TÉCNICA: Alvos de treinamento neutralizados. Retornando...');
      this.time.delayedCall(1800, () => this.scene.start('TechnicalSandboxScene'));
      return;
    }

    if (result.battleState === BattleState.FLED) {
      this.logText.setText('Recuo tático executado com sucesso.');
      this.time.delayedCall(1000, () => this.scene.start('TechnicalSandboxScene'));
      return;
    }

    this.logText.setText('Turno dos Alvos de Treinamento...');
    this.time.delayedCall(900, () => this._processEnemyTurn());
  }

  private _processEnemyTurn(): void {
    const enemyActions = this.turnEngine.processEnemyTurn();
    this._updateHpAndStats();

    let totalDmg = 0;
    enemyActions.forEach(act => {
      totalDmg += act.damage;
    });

    if (totalDmg > 0) {
      this._showFloatingText(90, 120, `-${totalDmg}`, '#ff2222');
      this.cameras.main.shake(100, 0.006);
    }

    if (this.turnEngine.state === BattleState.DEFEAT) {
      this.logText.setText('DERROTA TÉCNICA: Combatente neutralizado. Retornando ao menu...');
      this.time.delayedCall(2000, () => this.scene.start('MainMenuScene'));
      return;
    }

    this.isProcessingTurn = false;
    this.logText.setText('TURNO DO JOGADOR: Selecione a ação.');
    this._updateVisualSelection();
  }

  private _updateHpAndStats(): void {
    this.playerHpText.setText(`HP: ${this.player.hp}/${this.player.maxHp}`);
    this.playerResourceText.setText(`TestResource: ${this.player.resource}/${this.player.maxResource}`);

    this.enemies.forEach((enemy, i) => {
      const vis = this.enemyVisuals[i];
      vis.hpText.setText(`HP: ${enemy.hp}/${enemy.maxHp}`);
      if (!enemy.isAlive()) {
        vis.sprite.setAlpha(0.25);
        vis.nameText.setColor('#555555');
      }
    });
  }

  private _showFloatingText(x: number, y: number, text: string, color: string): void {
    const t = this.add.text(x, y - 8, text, {
      fontFamily: 'monospace',
      fontSize: '8px',
      color,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: t,
      y: y - 24,
      alpha: 0,
      duration: 750,
      onComplete: () => t.destroy()
    });
  }

  private _flashFeedback(msg: string): void {
    this.logText.setText(msg);
    this.cameras.main.shake(60, 0.003);
  }
}
