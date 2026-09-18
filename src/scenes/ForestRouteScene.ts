import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { InputService, GameAction } from '../services/InputService';
import { Combatant } from '../core/Combatant';
import { InventoryModel } from '../core/InventoryModel';
import { QuestGraph } from '../core/QuestGraph';
import { FieldCombatController } from '../core/FieldCombatController';
import { SceneTransitionData } from '../types/game.types';

/**
 * [CHRONO TRIGGER & SEA OF STARS FIELD SCENE]
 * Estrada da Floresta Cinzenta: Exploração e Combate Sem Transição de Tela.
 * Monstros patrulham a trilha; o combate tático se desenrola no mesmo chão.
 */
export class ForestRouteScene extends BaseScene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private inputService: InputService | null = null;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };

  private walkCycle: number = 0;
  private playerSpeed: number = 105;
  private playerData!: Combatant;
  private inventory!: InventoryModel;
  private questGraph!: QuestGraph;

  private fieldCombat!: FieldCombatController;
  private hudStatsText!: Phaser.GameObjects.Text;
  private bannerText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'ForestRouteScene' });
  }

  public init(data?: SceneTransitionData): void {
    this.playerData = new Combatant({
      id: 'rhogar',
      name: 'Rhogar Tordan',
      maxHp: 120,
      hp: 120,
      attack: 24,
      defense: 8,
      isPlayer: true
    });

    if (data?.playerData) {
      this.playerData.loadState(data.playerData);
    }

    if (data?.inventoryData) {
      this.inventory = new InventoryModel(data.inventoryData);
    } else {
      this.inventory = new InventoryModel();
      this.inventory.addItem('test_item_heal', 3);
      this.inventory.gold = 50;
    }

    if (data?.questsData) {
      this.questGraph = new QuestGraph(data.questsData);
    } else {
      this.questGraph = new QuestGraph();
    }
  }

  public create(): void {
    const { width, height } = this.scale;

    // 1. Cenário de Fundo (Estrada da Floresta Cinzenta 16:9)
    const bg = this.add.image(width / 2, height / 2, 'bg_floresta_brentel');
    bg.setDisplaySize(width, height);
    bg.setDepth(0);

    // 2. Limites do Mundo Físico
    this.physics.world.setBounds(0, 0, width, height);

    // 3. Protagonista (Rhogar Tordan)
    const startX = 80;
    const startY = 160;
    const pKey = this.textures.exists('spr_rhogar_down') ? 'spr_rhogar_down' : 'spr_player_rhogar';
    this.player = this.physics.add.sprite(startX, startY, pKey);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(startY);
    this.player.setDisplaySize(18, 22);

    // Hitbox precisa para navegação em trilhas
    if (this.player.body) {
      this.player.body.setSize(12, 10);
      this.player.body.setOffset(3, 12);
    }

    // 4. Controlador de Combate em Campo (Chrono Trigger Style)
    this.fieldCombat = new FieldCombatController(this, this.player, this.inventory);

    // Cadastra Joseph Sylven como aliado da Party
    const josephCombatant = new Combatant({
      id: 'joseph',
      name: 'Joseph Sylven',
      maxHp: 110,
      hp: 110,
      attack: 18,
      defense: 10,
      isPlayer: true
    });

    this.fieldCombat.registerPartyMember({
      combatant: josephCombatant,
      spriteKey: 'spr_joseph_sylven_front',
      formationOffset: { x: -22, y: 10 }
    });

    // Cadastra Monstro 1: Lobo Cinzento patrulhando a clareira central
    const wolfCombatant = new Combatant({
      id: 'lobo_floresta_1',
      name: 'Lobo Cinzento',
      maxHp: 55,
      hp: 55,
      attack: 16,
      defense: 4,
      isPlayer: false
    });

    this.fieldCombat.registerPatrolEnemy({
      id: 'lobo_1',
      name: 'Lobo Cinzento',
      spriteKey: 'spr_lobo_front',
      x: 260,
      y: 155,
      patrolRadius: 40,
      patrolSpeed: 1.4,
      combatants: [wolfCombatant],
      goldReward: 20,
      itemReward: 'test_item_heal'
    });

    // Cadastra Monstro 2: Bandido da Estrada patrulhando a rota leste
    const banditCombatant = new Combatant({
      id: 'bandido_estrada_1',
      name: 'Bandido da Estrada',
      maxHp: 70,
      hp: 70,
      attack: 19,
      defense: 6,
      isPlayer: false
    });

    this.fieldCombat.registerPatrolEnemy({
      id: 'bandido_1',
      name: 'Bandido da Estrada',
      spriteKey: 'spr_bandido_front',
      x: 390,
      y: 175,
      patrolRadius: 30,
      patrolSpeed: 1.0,
      combatants: [banditCombatant],
      goldReward: 35,
      itemReward: 'test_item_heal'
    });

    // 5. HUD Superior de Exploração
    const hudBg = this.add.rectangle(width / 2, 12, width - 20, 20, 0x050810, 0.85);
    hudBg.setStrokeStyle(1, 0x334466);
    hudBg.setDepth(999);

    this.hudStatsText = this.add.text(
      width / 2,
      12,
      `Rhogar & Joseph | Ouro: ${this.inventory.gold}g | Poções: x${this.inventory.getItemCount('test_item_heal')} | [ESC] Menu`,
      {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '8.5px',
        color: '#e0e6ed',
        stroke: '#000000',
        strokeThickness: 1.5
      }
    ).setOrigin(0.5).setDepth(1000);

    // Banner de Localização Inicial
    this.bannerText = this.add.text(width / 2, 45, 'Floresta Cinzenta - Trilha dos Sussurros', {
      fontFamily: '"Cinzel", sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#c2d4e5',
      stroke: '#000000',
      strokeThickness: 2.5
    }).setOrigin(0.5).setDepth(1000);

    this.tweens.add({
      targets: this.bannerText,
      alpha: 0,
      y: 35,
      delay: 2500,
      duration: 1000
    });

    // 6. Controles de Entrada
    this.inputService = new InputService();
    this.inputService.attach(this);

    this.inputService.on(GameAction.CANCEL, () => {
      if (!this.fieldCombat.isInCombat()) {
        this.scene.start('MainMenuScene');
      }
    });

    this.inputService.on(GameAction.CONFIRM, () => {
      if (this.fieldCombat.isInCombat()) {
        this.fieldCombat.handleConfirmInput();
      }
    });

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        w: this.input.keyboard.addKey('W'),
        a: this.input.keyboard.addKey('A'),
        s: this.input.keyboard.addKey('S'),
        d: this.input.keyboard.addKey('D')
      };

      // Navegação do menu de combate com setas
      this.cursors.left.on('down', () => {
        if (this.fieldCombat.isInCombat()) this.fieldCombat.handleNavigate(-1, 0);
      });
      this.cursors.right.on('down', () => {
        if (this.fieldCombat.isInCombat()) this.fieldCombat.handleNavigate(1, 0);
      });
      this.cursors.up.on('down', () => {
        if (this.fieldCombat.isInCombat()) this.fieldCombat.handleNavigate(0, -1);
      });
      this.cursors.down.on('down', () => {
        if (this.fieldCombat.isInCombat()) this.fieldCombat.handleNavigate(0, 1);
      });
    }
  }

  public update(time: number, delta: number): void {
    // Se estiver em combate contínuo, delega o ciclo ao FieldCombatController
    if (this.fieldCombat.isInCombat()) {
      this.player.setVelocity(0, 0);
      this.player.setRotation(0);
      return;
    }

    this.fieldCombat.update(time, delta);

    // Movimentação fluida de exploração top-down
    let vx = 0;
    let vy = 0;

    const left = (this.cursors && this.cursors.left.isDown) || (this.wasd && this.wasd.a.isDown);
    const right = (this.cursors && this.cursors.right.isDown) || (this.wasd && this.wasd.d.isDown);
    const up = (this.cursors && this.cursors.up.isDown) || (this.wasd && this.wasd.w.isDown);
    const down = (this.cursors && this.cursors.down.isDown) || (this.wasd && this.wasd.s.isDown);

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    // Normalização diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    vx *= this.playerSpeed;
    vy *= this.playerSpeed;
    this.player.setVelocity(vx, vy);

    const isMoving = vx !== 0 || vy !== 0;
    if (isMoving) {
      if (Math.abs(vx) > Math.abs(vy)) {
        if (vx < 0 && this.textures.exists('spr_rhogar_left')) this.player.setTexture('spr_rhogar_left');
        if (vx > 0 && this.textures.exists('spr_rhogar_right')) this.player.setTexture('spr_rhogar_right');
      } else {
        if (vy < 0 && this.textures.exists('spr_rhogar_up')) this.player.setTexture('spr_rhogar_up');
        if (vy > 0 && this.textures.exists('spr_rhogar_down')) this.player.setTexture('spr_rhogar_down');
      }

      this.walkCycle += (delta || 16) * 0.016;
      const stepTilt = Math.sin(this.walkCycle) * 0.05;
      const stepBounce = Math.abs(Math.sin(this.walkCycle)) * 1.5;
      this.player.setRotation(stepTilt);
      this.player.setDisplaySize(18, 22 + stepBounce);
    } else {
      this.player.setRotation(0);
      this.player.setDisplaySize(18, 22);
    }

    // Depth Sorting
    this.player.setDepth(this.player.y);

    // Atualiza HUD
    const pState = this.playerData.getState();
    const healCount = this.inventory.getItemCount('test_item_heal');
    const activeQuest = this.questGraph.getActiveQuests()[0];
    const questTitle = activeQuest ? activeQuest.title : 'Trilha da Floresta';
    this.hudStatsText.setText(
      `Rhogar & Joseph | HP: ${pState.hp}/${pState.maxHp} | Ouro: ${this.inventory.gold}g | Poções: x${healCount} | [${questTitle}] | [ESC] Menu`
    );
  }
}
