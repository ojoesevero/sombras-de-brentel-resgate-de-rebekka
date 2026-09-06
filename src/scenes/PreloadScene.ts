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
  }
}
