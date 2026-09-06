import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { InputService, GameAction } from '../services/InputService';
import { Combatant } from '../core/Combatant';
import { SceneTransitionData } from '../types/game.types';

/**
 * TechnicalSandboxScene: Cena provisória de testes de exploração com visão superior (top-down),
 * colisões físicas, interação espacial e transição para a arena de combate.
 * Totalmente neutra em termos narrativos.
 */
export class TechnicalSandboxScene extends BaseScene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private interactionTarget!: Phaser.Physics.Arcade.Sprite;
  private portal!: Phaser.GameObjects.Rectangle;
  private promptText!: Phaser.GameObjects.Text;
  private dialogueContainer!: Phaser.GameObjects.Container;
  private dialogueSpeaker!: Phaser.GameObjects.Text;
  private dialogueContent!: Phaser.GameObjects.Text;
  private inputService: InputService | null = null;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };

  private isInteracting: boolean = false;
  private isNearTarget: boolean = false;
  private playerSpeed: number = 110;
  private playerData!: Combatant;

  constructor() {
    super({ key: 'TechnicalSandboxScene' });
  }

  public init(data?: SceneTransitionData): void {
    this.playerData = new Combatant({
      id: 'rhogar_player',
      name: 'Rhogar (Player)',
      isPlayer: true
    });

    if (data?.playerData) {
      this.playerData.loadState(data.playerData);
    }
  }

  public create(): void {
    this.initBaseCamera();
    this.cameras.main.setBackgroundColor(0x14141e);

    // 1. Renderiza o Piso Modular (Grade 16x16)
    for (let x = 0; x < 480; x += 16) {
      for (let y = 0; y < 270; y += 16) {
        this.add.image(x + 8, y + 8, 'tile_floor_grid');
      }
    }

    // 2. Grupo de Barreiras Físicas (Arcade StaticGroup)
    this.walls = this.physics.add.staticGroup();

    // Paredes perimetrais
    for (let x = 0; x < 480; x += 16) {
      this.walls.create(x + 8, 8, 'tile_wall_barrier');
      this.walls.create(x + 8, 262, 'tile_wall_barrier');
    }
    for (let y = 16; y < 256; y += 16) {
      this.walls.create(8, y + 8, 'tile_wall_barrier');
      this.walls.create(472, y + 8, 'tile_wall_barrier');
    }

    // Obstáculo central para teste de colisão
    for (let x = 160; x <= 320; x += 16) {
      this.walls.create(x, 70, 'tile_wall_barrier');
    }

    // 3. Alvo de Teste de Interação (TestInteractionTarget)
    this.interactionTarget = this.physics.add.staticSprite(240, 50, 'spr_test_interaction_target');
    this.add.text(240, 32, 'TestInteractionTarget', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#ffd700'
    }).setOrigin(0.5);

    // 4. Portal de Teste de Combate (Leste do mapa)
    this.portal = this.add.rectangle(440, 135, 24, 44, 0x882222, 0.8);
    this.physics.add.existing(this.portal, true);
    this.add.text(440, 135, 'PORTAL\nCOMBATE', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 5. Entidade do Jogador
    this.player = this.physics.add.sprite(100, 140, 'spr_player_dummy');
    this.player.setCollideWorldBounds(true);

    // Colisão física com barreiras
    this.physics.add.collider(this.player, this.walls);

    // 6. UI Flutuante de Prompt e Diálogo Técnico
    this.promptText = this.add.text(0, 0, '[Z] Interagir', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#ffff00',
      backgroundColor: '#000000'
    }).setOrigin(0.5).setVisible(false);

    this.dialogueContainer = this.add.container(240, 225).setVisible(false);
    const diagBg = this.add.rectangle(0, 0, 440, 46, 0x0a0a14, 0.95).setStrokeStyle(1, 0x00ffff);
    this.dialogueSpeaker = this.add.text(-210, -16, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#00ffff',
      fontStyle: 'bold'
    });
    this.dialogueContent = this.add.text(-210, -4, '', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#ffffff',
      wordWrap: { width: 420 }
    });
    this.dialogueContainer.add([diagBg, this.dialogueSpeaker, this.dialogueContent]);

    // 7. HUD Técnico no topo
    this.add.text(10, 12, 'SANDBOX DE TESTES TÉCNICOS (Top-Down 480x270) | [ESC] Menu', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#8888aa'
    });

    // 8. Input Service
    this.inputService = new InputService();
    this.inputService.attach(this);

    this.inputService.on(GameAction.CANCEL, () => {
      if (this.isInteracting) {
        this._closeDialogue();
      } else {
        this.scene.start('MainMenuScene');
      }
    });

    this.inputService.on(GameAction.CONFIRM, () => {
      if (this.isInteracting) {
        this._closeDialogue();
      } else if (this.isNearTarget) {
        this._openDialogue();
      }
    });

    // Transição de portal para combate
    this.physics.add.overlap(this.player, this.portal, () => {
      const transitionPayload: SceneTransitionData = {
        playerData: this.playerData.getState()
      };
      this.scene.start('BattlePrototypeScene', transitionPayload);
    });

    // Teclas contínuas do teclado
    if (this.input && this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        w: this.input.keyboard.addKey('W'),
        a: this.input.keyboard.addKey('A'),
        s: this.input.keyboard.addKey('S'),
        d: this.input.keyboard.addKey('D')
      };
    }
  }

  private _openDialogue(): void {
    this.isInteracting = true;
    this.player.setVelocity(0, 0);
    this.dialogueSpeaker.setText('TestInteractionTarget (Calibração):');
    this.dialogueContent.setText(
      'Sistema de exploração top-down ativo. Movimentação em 8 direções com normalização diagonal (0.7071) e colisões estritas verificadas.'
    );
    this.dialogueContainer.setVisible(true);
    this.promptText.setVisible(false);
  }

  private _closeDialogue(): void {
    this.isInteracting = false;
    this.dialogueContainer.setVisible(false);
  }

  public update(): void {
    if (this.isInteracting) {
      this.player.setVelocity(0, 0);
      return;
    }

    let vx = 0;
    let vy = 0;

    const left = (this.cursors && this.cursors.left.isDown) || (this.wasd && this.wasd.a.isDown);
    const right = (this.cursors && this.cursors.right.isDown) || (this.wasd && this.wasd.d.isDown);
    const up = (this.cursors && this.cursors.up.isDown) || (this.wasd && this.wasd.w.isDown);
    const down = (this.cursors && this.cursors.down.isDown) || (this.wasd && this.wasd.s.isDown);

    if (left) vx = -this.playerSpeed;
    else if (right) vx = this.playerSpeed;

    if (up) vy = -this.playerSpeed;
    else if (down) vy = this.playerSpeed;

    // Normalização diagonal para impedir velocidade superior nas diagonais
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);

    // Detecção espacial de proximidade com o alvo
    const dist = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.interactionTarget.x,
      this.interactionTarget.y
    );
    this.isNearTarget = dist < 35;

    if (this.isNearTarget && !this.isInteracting) {
      this.promptText.setPosition(this.interactionTarget.x, this.interactionTarget.y - 16);
      this.promptText.setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }
  }
}
