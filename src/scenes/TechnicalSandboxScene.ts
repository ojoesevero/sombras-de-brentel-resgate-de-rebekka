import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { InputService, GameAction } from '../services/InputService';
import { Combatant } from '../core/Combatant';
import { InventoryModel } from '../core/InventoryModel';
import { QuestGraph } from '../core/QuestGraph';
import { globalSaveService } from '../services/SaveService';
import {
  SceneTransitionData,
  GameStatePayload,
  QuestsDataMap
} from '../types/game.types';

/**
 * TechnicalSandboxScene: Cena de exploração top-down integrada com
 * inventário, grafo de missões, colisões e persistência via SaveService.
 */
export class TechnicalSandboxScene extends BaseScene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private interactionTarget!: Phaser.Physics.Arcade.Sprite;
  private saveCrystal!: Phaser.Physics.Arcade.Sprite;
  private portal!: Phaser.GameObjects.Rectangle;
  private promptText!: Phaser.GameObjects.Text;
  private dialogueContainer!: Phaser.GameObjects.Container;
  private dialogueSpeaker!: Phaser.GameObjects.Text;
  private dialogueContent!: Phaser.GameObjects.Text;
  private hudStatsText!: Phaser.GameObjects.Text;
  private hudQuestText!: Phaser.GameObjects.Text;
  private saveFeedbackText!: Phaser.GameObjects.Text;
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
  private isNearSaveCrystal: boolean = false;
  private isNearDoor: boolean = false;
  private walkCycle: number = 0;
  private playerSpeed: number = 110;
  private playerData!: Combatant;
  private inventory!: InventoryModel;
  private questGraph!: QuestGraph;
  private initialSpawn: { x: number; y: number } = { x: 240, y: 240 };

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

    // Inicialização integrada do Inventário
    if (data?.inventoryData) {
      this.inventory = new InventoryModel(data.inventoryData);
    } else {
      this.inventory = new InventoryModel();
      this.inventory.addItem('test_item_heal', 2);
    }

    // Inicialização integrada do Grafo de Missões
    if (data?.questsData) {
      this.questGraph = new QuestGraph(data.questsData);
    } else {
      const cachedQuests = this.cache?.json?.get('quests_data') as QuestsDataMap | undefined;
      if (cachedQuests) {
        this.questGraph = new QuestGraph(cachedQuests);
      } else {
        this.questGraph = new QuestGraph({
          test_quest_verification: {
            id: 'test_quest_verification',
            title: 'Verificação Técnica',
            description: 'Fale com Dona Hilda na taverna para validar os sistemas.',
            status: 'active'
          }
        });
      }
    }

    if (data?.spawnPoint) {
      this.initialSpawn = { x: data.spawnPoint.x, y: data.spawnPoint.y };
    }
  }

  public create(): void {
    this.initBaseCamera();
    this.cameras.main.setBackgroundColor(0x14141e);

    // 1. Fundo Cenográfico Real da Taverna Cauda do Dragão
    if (this.textures.exists('bg_tavern_cauda_do_dragao')) {
      this.add.image(240, 135, 'bg_tavern_cauda_do_dragao').setDisplaySize(480, 270).setDepth(-10);
      // Overlay suave para contraste
      this.add.rectangle(240, 135, 480, 270, 0x070710, 0.2).setDepth(-9);
    } else {
      for (let x = 0; x < 480; x += 16) {
        for (let y = 0; y < 270; y += 16) {
          this.add.image(x + 8, y + 8, 'tile_floor_grid');
        }
      }
    }

    // 2. Grupo de Barreiras Físicas (Arcade StaticGroup - Todas as mesas, balcão, lareira e pilares)
    this.walls = this.physics.add.staticGroup();

    // Paredes perimetrais
    // Topo (abaixo das prateleiras e tonéis superiores)
    const topBar = this.add.rectangle(240, 44, 440, 14, 0x000000, 0);
    this.physics.add.existing(topBar, true);
    this.walls.add(topBar);

    // Fundo (parede sul da taverna com abertura exata para a soleira da porta em X: 240)
    const botBarLeft = this.add.rectangle(110, 258, 200, 14, 0x000000, 0);
    this.physics.add.existing(botBarLeft, true);
    this.walls.add(botBarLeft);

    const botBarRight = this.add.rectangle(370, 258, 200, 14, 0x000000, 0);
    this.physics.add.existing(botBarRight, true);
    this.walls.add(botBarRight);

    // Lado esquerdo (parede oeste)
    const leftBar = this.add.rectangle(28, 135, 14, 250, 0x000000, 0);
    this.physics.add.existing(leftBar, true);
    this.walls.add(leftBar);

    // Lado direito (parede leste)
    const rightBar = this.add.rectangle(450, 135, 14, 250, 0x000000, 0);
    this.physics.add.existing(rightBar, true);
    this.walls.add(rightBar);

    // Balcão da Taverna e vedação total da área privativa da atendente (impede o jogador de ir atrás do balcão)
    const counterWall = this.add.rectangle(250, 116, 144, 20, 0x000000, 0);
    this.physics.add.existing(counterWall, true);
    this.walls.add(counterWall);

    // Bloqueio do vão à esquerda do balcão (conecta lareira ao balcão)
    const counterLeftWall = this.add.rectangle(135, 85, 100, 80, 0x000000, 0);
    this.physics.add.existing(counterLeftWall, true);
    this.walls.add(counterLeftWall);

    // Bloqueio do vão à direita do balcão (conecta balcão à escadaria)
    const counterRightWall = this.add.rectangle(345, 85, 52, 80, 0x000000, 0);
    this.physics.add.existing(counterRightWall, true);
    this.walls.add(counterRightWall);

    // Lareira de Pedra (obstáculo na parede esquerda)
    const fireplaceWall = this.add.rectangle(85, 95, 75, 80, 0x000000, 0);
    this.physics.add.existing(fireplaceWall, true);
    this.walls.add(fireplaceWall);

    // Pilha de lenha ao lado da lareira
    const logsWall = this.add.rectangle(125, 145, 28, 20, 0x000000, 0);
    this.physics.add.existing(logsWall, true);
    this.walls.add(logsWall);

    // Escadaria para o segundo andar e parede leste (impede entrar na escada e atravessar a parede)
    const stairsWall = this.add.rectangle(412, 110, 96, 140, 0x000000, 0);
    this.physics.add.existing(stairsWall, true);
    this.walls.add(stairsWall);

    // Pilares centrais de sustentação
    const pillar1 = this.add.rectangle(352, 140, 16, 26, 0x000000, 0);
    this.physics.add.existing(pillar1, true);
    this.walls.add(pillar1);

    const pillar2 = this.add.rectangle(352, 235, 16, 26, 0x000000, 0);
    this.physics.add.existing(pillar2, true);
    this.walls.add(pillar2);

    // Barris no canto inferior esquerdo
    const barrelsLeft = this.add.rectangle(48, 185, 22, 38, 0x000000, 0);
    this.physics.add.existing(barrelsLeft, true);
    this.walls.add(barrelsLeft);

    // Barril no canto inferior direito
    const barrelRight = this.add.rectangle(432, 245, 18, 26, 0x000000, 0);
    this.physics.add.existing(barrelRight, true);
    this.walls.add(barrelRight);

    // --- Colisão Físicas de Todas as Mesas e Cadeiras da Taverna (impede o jogador de flutuar sobre elas) ---
    // Mesa 1: Mesa redonda com 4 cadeiras no canto inferior esquerdo
    const table1 = this.add.rectangle(116, 215, 62, 44, 0x000000, 0);
    this.physics.add.existing(table1, true);
    this.walls.add(table1);

    // Mesa 2: Mesa redonda inferior centro-esquerda
    const table2 = this.add.rectangle(182, 228, 44, 36, 0x000000, 0);
    this.physics.add.existing(table2, true);
    this.walls.add(table2);

    // Mesa 3: Mesa redonda superior esquerda com 2 bancos
    const table3 = this.add.rectangle(205, 155, 54, 40, 0x000000, 0);
    this.physics.add.existing(table3, true);
    this.walls.add(table3);

    // Mesa 4: Mesa redonda superior direita
    const table4 = this.add.rectangle(300, 165, 50, 38, 0x000000, 0);
    this.physics.add.existing(table4, true);
    this.walls.add(table4);

    // Mesa 5: Mesa retangular comprida inferior centro-direita com 2 longos bancos
    const table5 = this.add.rectangle(325, 235, 70, 40, 0x000000, 0);
    this.physics.add.existing(table5, true);
    this.walls.add(table5);

    // Mesa 6: Mesa redonda inferior direita
    const table6 = this.add.rectangle(392, 215, 50, 40, 0x000000, 0);
    this.physics.add.existing(table6, true);
    this.walls.add(table6);

    // 3. Alvo de Teste de Interação (Dona Hilda atrás do balcão)
    const hildaKey = this.textures.exists('spr_hilda_front') ? 'spr_hilda_front' : 'spr_test_interaction_target';
    this.interactionTarget = this.physics.add.staticSprite(250, 92, hildaKey);
    if (this.textures.exists('spr_hilda_front')) {
      this.interactionTarget.setDisplaySize(18, 20);
    }
    this.add.text(250, 72, 'Dona Hilda (Taverneira)', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '8px',
      resolution: 3,
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // 4. Tomo Antigo de Salvamento (ao lado da lareira)
    const saveKey = this.textures.exists('spr_save_book_front') ? 'spr_save_book_front' : 'spr_save_crystal';
    this.saveCrystal = this.physics.add.staticSprite(135, 135, saveKey);
    if (this.textures.exists('spr_save_book_front')) {
      this.saveCrystal.setDisplaySize(14, 18);
    }
    this.add.text(135, 118, 'Tomo de Salvar', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '8px',
      resolution: 3,
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // 5. Porta da Taverna (Localizada na soleira do tapete verde inferior)
    this.portal = this.add.rectangle(240, 260, 48, 16, 0x882222, 0);
    this.physics.add.existing(this.portal, true);
    this.add.text(240, 264, '▲ SAÍDA (ARENA / MAPA) ▲', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '7px',
      fontStyle: 'bold',
      resolution: 3,
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // 6. Entidade do Jogador (Rhogar Tordan)
    const rhogarKey = this.textures.exists('spr_rhogar_down')
      ? 'spr_rhogar_down'
      : (this.textures.exists('spr_rhogar_front') ? 'spr_rhogar_front' : 'spr_player_dummy');

    this.player = this.physics.add.sprite(this.initialSpawn.x, this.initialSpawn.y, rhogarKey);
    this.player.setOrigin(0.5, 0.85);
    if (this.textures.exists('spr_rhogar_down') || this.textures.exists('spr_rhogar_front')) {
      this.player.setDisplaySize(18, 22);
      this.player.body?.setSize(12, 8).setOffset(3, 14);
    }
    this.player.setCollideWorldBounds(true);

    // Colisão física com todas as barreiras e móveis
    this.physics.add.collider(this.player, this.walls);

    // 7. UI Flutuante de Prompt e Diálogo
    this.promptText = this.add.text(0, 0, '[Z] Interagir', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '8px',
      fontStyle: 'bold',
      resolution: 3,
      color: '#ffff00',
      backgroundColor: '#0a0a14',
      stroke: '#000000',
      strokeThickness: 2,
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setVisible(false);

    this.dialogueContainer = this.add.container(240, 225).setVisible(false);
    
    // 1. Fundo da caixa de diálogo adicionado PRIMEIRO (na base)
    const diagBg = this.add.rectangle(0, 0, 440, 50, 0x080812, 0.96).setStrokeStyle(1.5, 0x00ffff);
    this.dialogueContainer.add(diagBg);

    // 2. Retrato do interlocutor adicionado EM CIMA do fundo (iluminado e nítido)
    let diagTextOffsetX = -205;
    let diagWrapWidth = 410;
    if (this.textures.exists('portrait_hilda')) {
      const portraitBox = this.add.rectangle(-182, 0, 56, 40, 0x000000, 1).setStrokeStyle(1.5, 0xd4af37);
      const portraitImg = this.add.image(-182, 0, 'portrait_hilda').setDisplaySize(54, 38);
      this.dialogueContainer.add([portraitBox, portraitImg]);
      diagTextOffsetX = -145;
      diagWrapWidth = 350;
    }

    // 3. Textos do diálogo com tipografia cristalina
    this.dialogueSpeaker = this.add.text(diagTextOffsetX, -17, '', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      resolution: 3,
      color: '#00ffff'
    });
    this.dialogueContent = this.add.text(diagTextOffsetX, -4, '', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '8px',
      resolution: 3,
      color: '#ffffff',
      lineSpacing: 2,
      wordWrap: { width: diagWrapWidth }
    });
    this.dialogueContainer.add([this.dialogueSpeaker, this.dialogueContent]);

    // 8. HUD Integrado no topo com Fonte Elegante Outfit
    this.hudStatsText = this.add.text(10, 8, '', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '9px',
      fontStyle: '600',
      resolution: 3,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.hudQuestText = this.add.text(10, 21, '', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '8px',
      fontStyle: 'bold',
      resolution: 3,
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.saveFeedbackText = this.add.text(240, 95, '', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      resolution: 3,
      color: '#00ff88',
      backgroundColor: '#05150a',
      stroke: '#000000',
      strokeThickness: 2,
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setVisible(false);

    this._updateHudVisuals();

    // 9. Input Service
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
      } else if (this.isNearSaveCrystal) {
        this._saveCurrentGame();
      } else if (this.isNearDoor) {
        this._exitThroughDoor();
      }
    });

    // Transição pela porta sul (tapete verde)
    this.physics.add.overlap(this.player, this.portal, () => {
      this._exitThroughDoor();
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

  private _exitThroughDoor(): void {
    const transitionPayload: SceneTransitionData = {
      playerData: this.playerData.getState(),
      inventoryData: this.inventory.serialize(),
      questsData: this.questGraph.serialize(),
      spawnPoint: { x: 240, y: 235 }
    };
    this.scene.start('BattlePrototypeScene', transitionPayload);
  }

  private _updateHudVisuals(): void {
    const pState = this.playerData.getState();
    const healCount = this.inventory.getItemCount('test_item_heal');
    this.hudStatsText.setText(
      `Rhogar | HP: ${pState.hp}/${pState.maxHp} | Recurso: ${pState.resource}/${pState.maxResource} | Ouro: ${this.inventory.gold}g | Poção: x${healCount} | [ESC] Menu`
    );

    const mainQuest = this.questGraph.getQuest('test_quest_verification');
    const questStatus = mainQuest ? mainQuest.status.toUpperCase() : 'N/A';
    this.hudQuestText.setText(`Objetivo: ${mainQuest?.title || 'Exploração'} [${questStatus}]`);
  }

  private _saveCurrentGame(): void {
    const payload: GameStatePayload = {
      playerData: this.playerData.getState(),
      inventoryData: this.inventory.serialize(),
      questsData: this.questGraph.serialize(),
      spawnPoint: { x: this.player.x, y: this.player.y }
    };

    const success = globalSaveService.save(payload);
    if (success) {
      this.saveFeedbackText.setText('✓ Progresso Salvo com Sucesso!');
      this.saveFeedbackText.setColor('#00ff88');
    } else {
      this.saveFeedbackText.setText('✖ Falha ao Salvar Progresso.');
      this.saveFeedbackText.setColor('#ff4444');
    }

    this.saveFeedbackText.setVisible(true);
    this.time.delayedCall(2200, () => {
      this.saveFeedbackText.setVisible(false);
    });
  }

  private _openDialogue(): void {
    this.isInteracting = true;
    this.player.setVelocity(0, 0);

    const isQuestActive = this.questGraph.isActive('test_quest_verification');
    if (isQuestActive) {
      this.questGraph.advance('test_quest_verification', 'completed');
      this.inventory.gold += 25;
      this.inventory.addItem('test_item_heal', 1);

      this.dialogueSpeaker.setText('Dona Hilda (Proprietária da Taverna):');
      this.dialogueContent.setText(
        'Rhogar, meu velho amigo! Que bom vê-lo de volta à Cauda do Dragão. O boato sobre o rapto de Rebekka se espalha rápido... Tome estas 25 moedas e uma Poção de Cura para os preparativos. Use a runa para registrar seus passos e a porta sul para treinar na arena!'
      );
    } else {
      this.dialogueSpeaker.setText('Dona Hilda:');
      this.dialogueContent.setText(
        'Mantenha seus olhos bem abertos, draconato. As sombras de Brentel não perdoam deslizes. Seus mantimentos e ouro estão a salvo.'
      );
    }

    this._updateHudVisuals();
    this.dialogueContainer.setVisible(true);
    this.promptText.setVisible(false);
  }

  private _closeDialogue(): void {
    this.isInteracting = false;
    this.dialogueContainer.setVisible(false);
  }

  public update(_time: number, delta: number): void {
    if (this.isInteracting) {
      this.player.setVelocity(0, 0);
      this.player.setRotation(0);
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

    const isMoving = vx !== 0 || vy !== 0;
    if (isMoving) {
      // Troca de direção dinâmica (sprites direcionais de Rhogar)
      if (Math.abs(vx) > Math.abs(vy)) {
        if (vx < 0) {
          if (this.textures.exists('spr_rhogar_left')) this.player.setTexture('spr_rhogar_left');
        } else {
          if (this.textures.exists('spr_rhogar_right')) this.player.setTexture('spr_rhogar_right');
        }
      } else {
        if (vy < 0) {
          if (this.textures.exists('spr_rhogar_up')) this.player.setTexture('spr_rhogar_up');
        } else {
          if (this.textures.exists('spr_rhogar_down')) this.player.setTexture('spr_rhogar_down');
        }
      }

      // Ciclo fluido de passada com suave balanço de caminhada
      this.walkCycle += (delta || 16) * 0.016;
      const stepTilt = Math.sin(this.walkCycle) * 0.06;
      const stepBounceY = Math.abs(Math.sin(this.walkCycle)) * 1.5;
      this.player.setRotation(stepTilt);
      this.player.setDisplaySize(18, 22 + stepBounceY);
    } else {
      this.player.setRotation(0);
      this.player.setDisplaySize(18, 22);
    }

    // Depth Sorting dinâmico baseado em Y
    this.player.setDepth(this.player.y);
    this.interactionTarget.setDepth(this.interactionTarget.y);
    this.saveCrystal.setDepth(this.saveCrystal.y);

    // Detecção espacial de proximidade com Dona Hilda
    const distNpc = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.interactionTarget.x,
      this.interactionTarget.y
    );
    this.isNearTarget = distNpc < 52;

    // Detecção espacial de proximidade com o Tomo de Salvamento
    const distSave = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.saveCrystal.x,
      this.saveCrystal.y
    );
    this.isNearSaveCrystal = distSave < 35;

    // Detecção espacial de proximidade com a Porta Sul (tapete verde apontado pela seta)
    this.isNearDoor = this.player.y >= 244 && Math.abs(this.player.x - 240) < 32;

    if (this.isNearTarget && !this.isInteracting) {
      this.promptText.setPosition(this.interactionTarget.x, this.interactionTarget.y - 18);
      this.promptText.setText('[Z] Falar com Dona Hilda');
      this.promptText.setVisible(true);
    } else if (this.isNearSaveCrystal && !this.isInteracting) {
      this.promptText.setPosition(this.saveCrystal.x, this.saveCrystal.y - 18);
      this.promptText.setText('[Z] Salvar Progresso');
      this.promptText.setVisible(true);
    } else if (this.isNearDoor && !this.isInteracting) {
      this.promptText.setPosition(240, 235);
      this.promptText.setText('[Z] Sair para a Arena');
      this.promptText.setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }
  }
}
