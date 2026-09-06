import Phaser from 'phaser';

/**
 * BaseScene: Classe base para todas as cenas do jogo.
 * Garante configuração estrita de câmera com roundPixels para evitar pixel distortion.
 */
export abstract class BaseScene extends Phaser.Scene {
  protected initBaseCamera(): void {
    if (this.cameras && this.cameras.main) {
      // Arredondamento explícito de coordenadas da câmera principal
      this.cameras.main.setRoundPixels(true);
    }
  }
}
