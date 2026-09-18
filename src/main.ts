import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';
import { applyIntegerScaleToGame } from './config/pixelScale';
import { GsapBattleArena } from './combat-gsap/GsapBattleArena';
import { TavernHub } from './tavern-gsap/TavernHub';
import { ForestWorldEngine } from './rendering/ForestWorldEngine';
import { SeaOfStarsCombatScene } from './rendering/SeaOfStarsCombatScene';

// Inicializa a instância principal do jogo Phaser
const game = new Phaser.Game(gameConfig);

// Aplica a escala inteira assim que o canvas estiver pronto
window.addEventListener('load', () => {
  applyIntegerScaleToGame(game);

  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');

  if (mode === 'sea-of-stars') {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) gameContainer.style.display = 'none';
    const sos = new SeaOfStarsCombatScene();
    sos.start(() => {
      if (gameContainer) gameContainer.style.display = 'flex';
    });
  } else if (mode === 'forest') {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) gameContainer.style.display = 'none';
    const forest = new ForestWorldEngine();
    forest.start(() => {
      if (gameContainer) gameContainer.style.display = 'flex';
    });
  } else if (mode === 'tavern') {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) gameContainer.style.display = 'none';
    const hub = new TavernHub();
    hub.start(() => {
      if (gameContainer) gameContainer.style.display = 'flex';
    });
  } else if (mode === 'gsap-battle') {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) gameContainer.style.display = 'none';
    const arena = new GsapBattleArena();
    arena.start(() => {
      if (gameContainer) gameContainer.style.display = 'flex';
    });
  }
});

// Recalcula dinamicamente a escala inteira ao redimensionar a janela
window.addEventListener('resize', () => {
  applyIntegerScaleToGame(game);
});

export default game;
