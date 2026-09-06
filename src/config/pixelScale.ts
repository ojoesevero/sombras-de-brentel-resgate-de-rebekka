/**
 * Gerenciador Matemático de Escala Inteira de Pixel Art (Integer Pixel Scaling).
 * Mantém resolução lógica fixa de 480x270 sem distorção fracionária.
 */

export const LOGICAL_WIDTH = 480;
export const LOGICAL_HEIGHT = 270;
export const LOGICAL_ASPECT_RATIO = LOGICAL_WIDTH / LOGICAL_HEIGHT; // 16:9

export interface ScaleDimensions {
  displayWidth: number;
  displayHeight: number;
  multiplier: number;
  isSubScaleFallback: boolean;
}

/**
 * Calcula as dimensões físicas em pixels que o canvas deve assumir no DOM.
 * @param windowWidth - Largura da janela/viewport
 * @param windowHeight - Altura da janela/viewport
 * @returns {ScaleDimensions}
 */
export function calculateIntegerScale(windowWidth: number, windowHeight: number): ScaleDimensions {
  const horizontalFactor = Math.floor(windowWidth / LOGICAL_WIDTH);
  const verticalFactor = Math.floor(windowHeight / LOGICAL_HEIGHT);
  const maxIntegerMultiplier = Math.min(horizontalFactor, verticalFactor);

  if (maxIntegerMultiplier >= 1) {
    // Escala Inteira Estrita (1x, 2x, 3x, 4x...)
    return {
      displayWidth: LOGICAL_WIDTH * maxIntegerMultiplier,
      displayHeight: LOGICAL_HEIGHT * maxIntegerMultiplier,
      multiplier: maxIntegerMultiplier,
      isSubScaleFallback: false
    };
  }

  // Fallback para viewports menores que 480x270:
  // Reduz proporcionalmente mantendo proporção 16:9 sem overflow.
  // Nota técnica: Reduções abaixo de 1x não constituem integer upscaling.
  const scaleRatio = Math.min(windowWidth / LOGICAL_WIDTH, windowHeight / LOGICAL_HEIGHT);
  const fallbackWidth = Math.floor(LOGICAL_WIDTH * scaleRatio);
  const fallbackHeight = Math.floor(fallbackWidth / LOGICAL_ASPECT_RATIO);

  return {
    displayWidth: Math.max(1, fallbackWidth),
    displayHeight: Math.max(1, fallbackHeight),
    multiplier: scaleRatio,
    isSubScaleFallback: true
  };
}

/**
 * Aplica as dimensões calculadas ao canvas do jogo no DOM com centralização.
 * @param game - Instância do Phaser.Game
 */
export function applyIntegerScaleToGame(game: Phaser.Game): ScaleDimensions {
  if (typeof window === 'undefined' || !game || !game.canvas) {
    return {
      displayWidth: LOGICAL_WIDTH,
      displayHeight: LOGICAL_HEIGHT,
      multiplier: 1,
      isSubScaleFallback: false
    };
  }

  const { displayWidth, displayHeight, multiplier, isSubScaleFallback } = calculateIntegerScale(
    window.innerWidth,
    window.innerHeight
  );

  game.canvas.style.width = `${displayWidth}px`;
  game.canvas.style.height = `${displayHeight}px`;

  return { displayWidth, displayHeight, multiplier, isSubScaleFallback };
}
