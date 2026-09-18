import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { Combatant } from '../core/Combatant';
import { TurnEngine } from '../core/TurnEngine';
import { InventoryModel } from '../core/InventoryModel';
import { InputService, GameAction } from '../services/InputService';
import {
  BattleState,
  TurnAction,
  SceneTransitionData,
  PROVISIONAL_BALANCE,
  QuestsDataMap
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
 * BattlePrototypeScene: Arena de combate por turnos em TypeScript integrada
 * com modelo de inventário real, custos de recurso e transporte de dados.
 */
export class BattlePrototypeScene extends BaseScene {
  private player!: Combatant;
  private inventory!: InventoryModel;
  private questsData: QuestsDataMap | null = null;
  private spawnPoint: { x: number; y: number } = { x: 395, y: 135 };
  private enemies: Combatant[] = [];
  private turnEngine!: TurnEngine;
  private inputService: InputService | null = null;

  private playerHpText!: Phaser.GameObjects.Text;
  private playerResourceText!: Phaser.GameObjects.Text;

  private enemyVisuals: EnemyVisualRecord[] = [];
  private targetCursor!: Phaser.GameObjects.Sprite;
  private actionButtons: Phaser.GameObjects.Text[] = [];
  private actionHelpText!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;

  private actions: ActionButton[] = [
    { id: 'attack', label: '1. Atacar' },
    { id: 'skill', label: `2. Técnica (${PROVISIONAL_BALANCE.RESOURCE_COST_SKILL}R)` },
    { id: 'item', label: '3. Poção' },
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

    if (data?.inventoryData) {
      this.inventory = new InventoryModel(data.inventoryData);
    } else {
      this.inventory = new InventoryModel();
      this.inventory.addItem('test_item_heal', 2);
    }

    if (data?.questsData) {
      this.questsData = data.questsData;
    }

    if (data?.spawnPoint) {
      this.spawnPoint = data.spawnPoint;
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

    // Fundo Cenográfico Real da Arena dos Centuriões
    if (this.textures.exists('bg_arena_centurion')) {
      this.add.image(240, 135, 'bg_arena_centurion').setDisplaySize(480, 270).setDepth(-10);
      this.add.rectangle(240, 135, 480, 270, 0x070714, 0.48).setDepth(-9);
    }

    this._createVisuals();
    this._createUI();
    this._setupInput();
  }

  private _createVisuals(): void {
    // Linha divisória de arena
    this.add.rectangle(240, 180, 460, 2, 0x333355);

    // Retrato de Batalha de Rhogar
    if (this.textures.exists('portrait_rhogar')) {
      this.add.rectangle(45, 115, 60, 40, 0x050814, 0.9).setStrokeStyle(1, 0xd4af37);
      this.add.image(45, 115, 'portrait_rhogar').setDisplaySize(58, 38);
    }

    // Sprite e Stats do Jogador (Lado Esquerdo)
    const pKey = this.textures.exists('spr_rhogar_front') ? 'spr_rhogar_front' : 'spr_player_dummy';
    const pSprite = this.add.sprite(105, 128, pKey);
    if (this.textures.exists('spr_rhogar_front')) {
      pSprite.setDisplaySize(28, 30);
    } else {
      pSprite.setScale(2);
    }
    this.add.text(105, 78, this.player.name, {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '9px',
      color: '#00ffff',
      fontStyle: 'bold',
      resolution: 3,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.playerHpText = this.add.text(105, 91, `HP: ${this.player.hp}/${this.player.maxHp}`, {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '8px',
      color: '#00ff88',
      resolution: 3,
      stroke: '#000000',
      strokeThickness: 1.5
    }).setOrigin(0.5);

    this.playerResourceText = this.add.text(
      105,
      103,
      `Recurso: ${this.player.resource}/${this.player.maxResource}`,
      {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '8px',
        color: '#ffaa00',
        resolution: 3,
        stroke: '#000000',
        strokeThickness: 1.5
      }
    ).setOrigin(0.5);

    // Sprites e Stats dos Alvos / Gladiadores (Lado Direito)
    this.enemyVisuals = [];
    const positions = [{ x: 330, y: 110 }, { x: 400, y: 135 }];
    const eKey = this.textures.exists('spr_gladiador_front') ? 'spr_gladiador_front' : 'spr_training_target';

    this.enemies.forEach((enemy, i) => {
      const pos = positions[i];
      const sprite = this.add.sprite(pos.x, pos.y, eKey);
      if (this.textures.exists('spr_gladiador_front')) {
        sprite.setDisplaySize(28, 34);
      } else {
        sprite.setScale(2);
      }
      const nameText = this.add.text(pos.x, pos.y - 28, enemy.name, {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#ff7777',
        resolution: 3,
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      const hpText = this.add.text(pos.x, pos.y - 18, `HP: ${enemy.hp}/${enemy.maxHp}`, {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '8px',
        color: '#ffaaaa',
        resolution: 3,
        stroke: '#000000',
        strokeThickness: 1.5
      }).setOrigin(0.5);

      this.enemyVisuals.push({ sprite, nameText, hpText, x: pos.x, y: pos.y });
    });

    // Retículo de Mira
    this.targetCursor = this.add.sprite(0, 0, 'spr_target_cursor').setScale(1.5).setVisible(false);
  }

  private _createUI(): void {
    // Painel de Ações Elegante com fundo escuro e borda suave
    this.add.rectangle(240, 226, 464, 62, 0x080914, 0.95).setStrokeStyle(1.5, 0x223355);
    this.actionButtons = [];

    const buttonPositionsX = [32, 116, 206, 296, 386];

    this.actions.forEach((act, idx) => {
      const t = this.add.text(buttonPositionsX[idx], 214, act.label, {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '9px',
        fontStyle: '600',
        resolution: 3,
        color: '#8888aa'
      }).setOrigin(0, 0.5);
      this.actionButtons.push(t);
    });

    this.actionHelpText = this.add.text(240, 238, '', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '8px',
      resolution: 3,
      color: '#aaccff',
      align: 'center'
    }).setOrigin(0.5);

    this.logText = this.add.text(240, 22, 'TURNO DO JOGADOR: Selecione a ação.', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      resolution: 3,
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2
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
        const returnPayload: SceneTransitionData = {
          playerData: this.player.getState(),
          inventoryData: this.inventory.serialize(),
          questsData: this.questsData,
          spawnPoint: this.spawnPoint
        };
        this.scene.start('TechnicalSandboxScene', returnPayload);
      }
    });
  }

  private _updateVisualSelection(): void {
    const healCount = this.inventory.getItemCount('test_item_heal');
    if (this.actions[2]) {
      this.actions[2].label = `3. Poção (x${healCount})`;
      if (this.actionButtons[2]) {
        this.actionButtons[2].setText(this.actions[2].label);
      }
    }

    const helpDescriptions = [
      '1. Atacar: Golpe físico direto com maça de guerra causando dano padrão.',
      `2. Técnica: Golpe concentrado devastador (Custo: ${PROVISIONAL_BALANCE.RESOURCE_COST_SKILL} Recurso).`,
      `3. Poção de Cura: Restaura 40 HP imediatamente (Disponíveis: ${healCount}).`,
      '4. Defender: Assume postura defensiva (+15 Recurso e menor dano sofrido).',
      '5. Fugir: Recuo tático imediato de volta à Taverna Cauda do Dragão.'
    ];

    if (this.actionHelpText) {
      this.actionHelpText.setText(helpDescriptions[this.selectedActionIndex] || '');
    }

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
      if (!this.inventory.hasItem('test_item_heal', 1)) {
        this._flashFeedback('Sem Poções de Cura no inventário!');
        return;
      }
      this.inventory.removeItem('test_item_heal', 1);
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
    this._updateVisualSelection();

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
      this.inventory.gold += 30;
      this.inventory.addItem('test_item_heal', 1);
      this.logText.setText('VITÓRIA TÉCNICA: Alvos neutralizados! (+30 ouro, +1 Poção). Retornando...');
      const returnPayload: SceneTransitionData = {
        playerData: this.player.getState(),
        inventoryData: this.inventory.serialize(),
        questsData: this.questsData,
        spawnPoint: this.spawnPoint
      };
      this.time.delayedCall(1900, () => this.scene.start('TechnicalSandboxScene', returnPayload));
      return;
    }

    if (result.battleState === BattleState.FLED) {
      this.logText.setText('Recuo tático executado com sucesso.');
      const returnPayload: SceneTransitionData = {
        playerData: this.player.getState(),
        inventoryData: this.inventory.serialize(),
        questsData: this.questsData,
        spawnPoint: this.spawnPoint
      };
      this.time.delayedCall(1000, () => this.scene.start('TechnicalSandboxScene', returnPayload));
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
      fontFamily: '"Outfit", sans-serif',
      fontSize: '10px',
      color,
      fontStyle: 'bold',
      resolution: 3,
      stroke: '#000000',
      strokeThickness: 2
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
