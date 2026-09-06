import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { TechnicalSandboxScene } from '../scenes/TechnicalSandboxScene';
import { BattlePrototypeScene } from '../scenes/BattlePrototypeScene';
import { LOGICAL_WIDTH, LOGICAL_HEIGHT } from './pixelScale';

/**
 * Configuração Central da Engine Phaser 3 em TypeScript.
 * Otimizada para resolução lógica 480x270 e escala inteira de pixel art.
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: LOGICAL_WIDTH,
  height: LOGICAL_HEIGHT,
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.NONE,
    width: LOGICAL_WIDTH,
    height: LOGICAL_HEIGHT
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    TechnicalSandboxScene,
    BattlePrototypeScene
  ]
};
