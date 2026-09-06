import { EventCallback } from '../types/game.types';

/**
 * Barramento de eventos desacoplado e tipado.
 */
export class EventBus {
  private _listeners: Map<string, Set<EventCallback<unknown>>> = new Map();

  public on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(callback as unknown as EventCallback<unknown>);
    return () => this.off(event, callback);
  }

  public once<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    const wrapped: EventCallback<T> = (payload?: T) => {
      this.off(event, wrapped);
      callback(payload);
    };
    return this.on(event, wrapped);
  }

  public off<T = unknown>(event: string, callback: EventCallback<T>): void {
    const listeners = this._listeners.get(event);
    if (listeners) {
      listeners.delete(callback as unknown as EventCallback<unknown>);
      if (listeners.size === 0) {
        this._listeners.delete(event);
      }
    }
  }

  public emit<T = unknown>(event: string, payload?: T): boolean {
    const listeners = this._listeners.get(event);
    if (!listeners) return false;
    for (const callback of Array.from(listeners)) {
      try {
        callback(payload);
      } catch (err) {
        console.error(`[EventBus] Erro no listener do evento '${event}':`, err);
      }
    }
    return true;
  }

  public clear(): void {
    this._listeners.clear();
  }
}

export const globalEventBus = new EventBus();
