import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';
import { applyIntegerScaleToGame } from './config/pixelScale';

// Inicializa a instância principal do jogo Phaser
const game = new Phaser.Game(gameConfig);

// Aplica a escala inteira assim que o canvas estiver pronto
window.addEventListener('load', () => {
  applyIntegerScaleToGame(game);
});

// Recalcula dinamicamente a escala inteira ao redimensionar a janela
window.addEventListener('resize', () => {
  applyIntegerScaleToGame(game);
});

export default game;
