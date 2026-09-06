import Phaser from 'phaser';
import { EventBus } from './EventBus';
import { InputAction, InputKeyEvent } from '../types/game.types';

export const GameAction: Record<InputAction, InputAction> = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  CONFIRM: 'CONFIRM',
  CANCEL: 'CANCEL',
  MENU: 'MENU',
  ACTION_1: 'ACTION_1',
  ACTION_2: 'ACTION_2'
} as const;

/**
 * Serviço de Mapeamento Unificado de Entradas do Teclado em TypeScript.
 * Gerencia ciclo de vida e previne vazamentos de listeners.
 */
export class InputService extends EventBus {
  public scene: Phaser.Scene | null = null;
  public isAttached: boolean = false;
  private readonly _keydownHandler: (event: KeyboardEvent) => void;

  constructor(scene: Phaser.Scene | null = null) {
    super();
    this.scene = scene;
    this._keydownHandler = this._handleKeydown.bind(this);
  }

  public attach(scene: Phaser.Scene): void {
    this.detach();
    this.scene = scene;

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this._keydownHandler);
      this.isAttached = true;
    }

    if (scene && scene.events) {
      scene.events.once('shutdown', () => this.detach());
      scene.events.once('destroy', () => this.detach());
    }
  }

  public detach(): void {
    if (typeof window !== 'undefined' && this.isAttached) {
      window.removeEventListener('keydown', this._keydownHandler);
      this.isAttached = false;
    }
    this.clear();
  }

  private _handleKeydown(event: KeyboardEvent): void {
    const key = event.key ? event.key.toUpperCase() : '';
    const code = event.code;

    // Ignora quando foco estiver em campos de formulário
    const targetElement = event.target as HTMLElement | null;
    if (targetElement && (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
      return;
    }

    let action: InputAction | null = null;

    if (key === 'ARROWUP' || key === 'W') action = GameAction.UP;
    else if (key === 'ARROWDOWN' || key === 'S') action = GameAction.DOWN;
    else if (key === 'ARROWLEFT' || key === 'A') action = GameAction.LEFT;
    else if (key === 'ARROWRIGHT' || key === 'D') action = GameAction.RIGHT;
    else if (key === 'Z' || key === 'ENTER' || key === ' ' || code === 'Space') action = GameAction.CONFIRM;
    else if (key === 'X' || key === 'ESCAPE') action = GameAction.CANCEL;
    else if (key === '1') action = GameAction.ACTION_1;
    else if (key === '2') action = GameAction.ACTION_2;

    if (action) {
      if (['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', ' '].includes(key)) {
        event.preventDefault();
      }
      const keyPayload: InputKeyEvent = { action, key, code };
      this.emit(action, keyPayload);
      this.emit('ANY_KEY', keyPayload);
    }
  }
}

export const globalInputService = new InputService();
