import { TimedActionResult, TimedResultRating } from '../types/game.types';

export interface TimedActionWindow {
  impactTimeMs: number;
  perfectToleranceMs: number;
  goodToleranceMs: number;
  isDefense: boolean;
}

/**
 * [SEA OF STARS STYLE]
 * Gerenciador desacoplado de Ações Sincronizadas por Timing.
 * Avalia o pressionamento de teclas no momento exato do impacto para
 * conceder bônus de dano (ataque) ou redução de dano (bloqueio).
 */
export class TimedActionService {
  private currentWindow: TimedActionWindow | null = null;
  private hasPressedCurrentWindow: boolean = false;

  /**
   * Abre a janela de timing para um ataque ou defesa que impactará em `impactTimeMs`.
   */
  public openWindow(
    impactTimeMs: number,
    isDefense: boolean = false,
    perfectToleranceMs: number = 95,
    goodToleranceMs: number = 220
  ): void {
    this.currentWindow = {
      impactTimeMs,
      perfectToleranceMs,
      goodToleranceMs,
      isDefense
    };
    this.hasPressedCurrentWindow = false;
  }

  /**
   * Registra a tentativa de pressionamento do jogador no tempo atual.
   */
  public registerInput(pressTimeMs: number): TimedActionResult {
    if (!this.currentWindow || this.hasPressedCurrentWindow) {
      return {
        rating: 'MISS',
        multiplier: 1.0,
        damageBonus: 0,
        bonusSynergy: 0
      };
    }

    this.hasPressedCurrentWindow = true;
    const diff = Math.abs(pressTimeMs - this.currentWindow.impactTimeMs);

    let rating: TimedResultRating = 'MISS';
    let multiplier = 1.0;
    let bonusSynergy = 0;

    if (diff <= this.currentWindow.perfectToleranceMs) {
      rating = 'PERFECT';
      multiplier = this.currentWindow.isDefense ? 0.6 : 1.35; // 40% redução na defesa ou +35% no ataque
      bonusSynergy = 25;
    } else if (diff <= this.currentWindow.goodToleranceMs) {
      rating = 'GOOD';
      multiplier = this.currentWindow.isDefense ? 0.8 : 1.15; // 20% redução ou +15% no ataque
      bonusSynergy = 10;
    } else {
      rating = 'MISS';
      multiplier = 1.0;
      bonusSynergy = 0;
    }

    return {
      rating,
      multiplier,
      damageBonus: 0,
      bonusSynergy
    };
  }

  /**
   * Limpa a janela ativa.
   */
  public closeWindow(): void {
    this.currentWindow = null;
    this.hasPressedCurrentWindow = false;
  }

  public hasActiveWindow(): boolean {
    return this.currentWindow !== null && !this.hasPressedCurrentWindow;
  }
}

export const globalTimedActionService = new TimedActionService();
