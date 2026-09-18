import { BaseScene } from './BaseScene';

/**
 * PreloadScene: Carrega manifestos JSON de dados provisórios e gera texturas de calibração em pixel art.
 */
export class PreloadScene extends BaseScene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  public preload(): void {
    this.initBaseCamera();

    this.add.text(240, 135, 'CARREGANDO SISTEMAS...', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffd700'
    }).setOrigin(0.5);

    // Carregamento de manifestos desacoplados
    this.load.json('items_data', '/data/items.json');
    this.load.json('enemies_data', '/data/enemies.json');
    this.load.json('dialogues_data', '/data/dialogues.json');
    this.load.json('quests_data', '/data/quests.json');
    this.load.json('maps_data', '/data/maps.json');

    // 1. Cenários de Fundo (16:9)
    this.load.image('bg_tavern_cauda_do_dragao', '/assets/scenarios/bg_tavern_cauda_do_dragao.png');
    this.load.image('bg_arena_centurion', '/assets/scenarios/bg_arena_centurion.png');
    this.load.image('bg_cidade_rastphen', '/assets/scenarios/bg_cidade_rastphen.png');
    this.load.image('bg_floresta_brentel', '/assets/scenarios/bg_floresta_brentel.png');

    // 2. Retratos / Portraits dos Personagens
    this.load.image('portrait_rhogar', '/assets/portraits/portrait_rhogar.png');
    this.load.image('portrait_joseph', '/assets/portraits/portrait_joseph.png');
    this.load.image('portrait_hilda', '/assets/portraits/portrait_hilda.png');
    this.load.image('portrait_gnoma', '/assets/portraits/portrait_gnoma.png');
    this.load.image('portrait_alicia', '/assets/portraits/portrait_alicia.png');
    this.load.image('portrait_traudon', '/assets/portraits/portrait_traudon.png');
    this.load.image('portrait_veronica', '/assets/portraits/portrait_veronica.png');
    this.load.image('portrait_john', '/assets/portraits/portrait_john.png');

    // 3. Sprites de Personagens, Inimigos e Objetos
    this.load.image('spr_rhogar_tordan', '/assets/sprites/spr_rhogar_tordan.png');
    this.load.image('spr_joseph_sylven', '/assets/sprites/spr_joseph_sylven.png');
    this.load.image('spr_dona_hilda', '/assets/sprites/spr_dona_hilda.png');
    this.load.image('spr_atendente_gnoma', '/assets/sprites/spr_atendente_gnoma.png');
    this.load.image('spr_alicia_lavdik', '/assets/sprites/spr_alicia_lavdik.png');
    this.load.image('spr_traudon_balker', '/assets/sprites/spr_traudon_balker.png');
    this.load.image('spr_veronica_stinfy', '/assets/sprites/spr_veronica_stinfy.png');
    this.load.image('spr_john_bardem', '/assets/sprites/spr_john_bardem.png');
    this.load.image('spr_bandido_estrada', '/assets/sprites/spr_bandido_estrada.png');
    this.load.image('spr_lobo_cinzento', '/assets/sprites/spr_lobo_cinzento.png');
    this.load.image('spr_gladiador_arena', '/assets/sprites/spr_gladiador_arena.png');
    this.load.image('spr_gnomo_garcom', '/assets/sprites/spr_gnomo_garcom.png');
    this.load.image('spr_fregueses_pack', '/assets/sprites/spr_fregueses_pack.png');
    this.load.image('spr_chest_interactive', '/assets/sprites/spr_chest_interactive.png');
    this.load.image('spr_save_book', '/assets/sprites/spr_save_book.png');

    // 4. Ícones
    this.load.image('icons_consumables', '/assets/icons/icons_consumables.png');
    this.load.image('icon_potion_heal', '/assets/icons/icon_consumable_1.png');

    // 5. Sprites Frontais e Direcionais Transparentes
    this.load.image('spr_rhogar_front', '/assets/sprites/spr_rhogar_tordan_front.png');
    this.load.image('spr_rhogar_down', '/assets/sprites/spr_rhogar_down.png');
    this.load.image('spr_rhogar_up', '/assets/sprites/spr_rhogar_up.png');
    this.load.image('spr_rhogar_left', '/assets/sprites/spr_rhogar_left.png');
    this.load.image('spr_rhogar_right', '/assets/sprites/spr_rhogar_right.png');
    this.load.image('spr_hilda_front', '/assets/sprites/spr_dona_hilda_front.png');
    this.load.image('spr_save_book_front', '/assets/sprites/spr_save_book_front.png');
    this.load.image('spr_chest_front', '/assets/sprites/spr_chest_interactive_front.png');
    this.load.image('spr_gladiador_front', '/assets/sprites/spr_gladiador_arena_front.png');
    this.load.image('spr_gnoma_front', '/assets/sprites/spr_atendente_gnoma_front.png');
    this.load.image('spr_lobo_front', '/assets/sprites/spr_lobo_cinzento_front.png');
    this.load.image('spr_bandido_front', '/assets/sprites/spr_bandido_estrada_front.png');
  }

  public create(): void {
    this._generateProceduralPixelTextures();
    this.scene.start('MainMenuScene');
  }

  private _generateProceduralPixelTextures(): void {
    // 1. Sprite Provisório do Jogador (Rhogar - 16x16 em azul escuro e dourado)
    const gPlayer = this.make.graphics({ x: 0, y: 0 });
    gPlayer.fillStyle(0x1a3b5c, 1);
    gPlayer.fillRect(0, 0, 16, 16);
    gPlayer.fillStyle(0xd4af37, 1);
    gPlayer.fillRect(4, 2, 8, 4);
    gPlayer.fillStyle(0x00ffff, 1);
    gPlayer.fillRect(4, 6, 2, 2);
    gPlayer.fillRect(10, 6, 2, 2);
    gPlayer.fillStyle(0x555555, 1);
    gPlayer.fillRect(2, 10, 12, 6);
    gPlayer.generateTexture('spr_player_dummy', 16, 16);

    // 2. Sprite de Alvo de Treinamento (TrainingTarget - 16x16 em verde escuro)
    const gTarget = this.make.graphics({ x: 0, y: 0 });
    gTarget.fillStyle(0x2d572c, 1);
    gTarget.fillRect(0, 0, 16, 16);
    gTarget.fillStyle(0xff4444, 1);
    gTarget.fillRect(3, 5, 2, 2);
    gTarget.fillRect(11, 5, 2, 2);
    gTarget.fillStyle(0x4a3b2c, 1);
    gTarget.fillRect(3, 10, 10, 4);
    gTarget.generateTexture('spr_training_target', 16, 16);

    // 3. Sprite de Alvo de Interação (TestInteractionTarget - 16x16 em marrom e amarelo)
    const gNpc = this.make.graphics({ x: 0, y: 0 });
    gNpc.fillStyle(0x8b5a2b, 1);
    gNpc.fillRect(0, 0, 16, 16);
    gNpc.fillStyle(0xffe4b5, 1);
    gNpc.fillRect(4, 3, 8, 5);
    gNpc.fillStyle(0xffffff, 1);
    gNpc.fillRect(4, 9, 8, 7);
    gNpc.generateTexture('spr_test_interaction_target', 16, 16);

    // 4. Tile de Piso Neutro (16x16)
    const gFloor = this.make.graphics({ x: 0, y: 0 });
    gFloor.fillStyle(0x2b201a, 1);
    gFloor.fillRect(0, 0, 16, 16);
    gFloor.fillStyle(0x382a22, 1);
    gFloor.fillRect(0, 0, 16, 1);
    gFloor.fillRect(0, 8, 16, 1);
    gFloor.generateTexture('tile_floor_grid', 16, 16);

    // 5. Tile de Parede/Barreira (16x16)
    const gWall = this.make.graphics({ x: 0, y: 0 });
    gWall.fillStyle(0x1a1a24, 1);
    gWall.fillRect(0, 0, 16, 16);
    gWall.fillStyle(0x2e2e40, 1);
    gWall.fillRect(1, 1, 14, 14);
    gWall.fillStyle(0x444460, 1);
    gWall.fillRect(2, 2, 6, 6);
    gWall.generateTexture('tile_wall_barrier', 16, 16);

    // 6. Retículo de Mira Direcional (16x16)
    const gCursor = this.make.graphics({ x: 0, y: 0 });
    gCursor.lineStyle(2, 0xffff00, 1);
    gCursor.strokeRect(0, 0, 16, 16);
    gCursor.generateTexture('spr_target_cursor', 16, 16);

    // 7. Cristal de Salvamento / Runa de Checkpoint (16x16)
    const gCrystal = this.make.graphics({ x: 0, y: 0 });
    gCrystal.fillStyle(0x00ffff, 1);
    gCrystal.fillTriangle(8, 1, 3, 11, 13, 11);
    gCrystal.fillStyle(0x0088cc, 1);
    gCrystal.fillTriangle(8, 15, 3, 11, 13, 11);
    gCrystal.fillStyle(0xffffff, 0.8);
    gCrystal.fillCircle(8, 9, 2);
    gCrystal.generateTexture('spr_save_crystal', 16, 16);
  }
}
