import { BaseScene } from './BaseScene';

/**
 * BootScene: Inicializa configurações de canvas e delega para o preload.
 */
export class BootScene extends BaseScene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public create(): void {
    this.initBaseCamera();
    this.cameras.main.setBackgroundColor(0x0d0d15);
    this.scene.start('PreloadScene');
  }
}
