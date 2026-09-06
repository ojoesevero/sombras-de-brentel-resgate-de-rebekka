import { IStorageDriver, SavePayload } from '../types/game.types';

/**
 * Driver de armazenamento em memória para testes e ambientes sem LocalStorage.
 */
export class MemoryStorageDriver implements IStorageDriver {
  private _store: Map<string, string> = new Map();

  public getItem(key: string): string | null {
    return this._store.get(key) || null;
  }

  public setItem(key: string, value: string): void {
    this._store.set(key, value);
  }

  public removeItem(key: string): void {
    this._store.delete(key);
  }

  public clear(): void {
    this._store.clear();
  }
}

/**
 * [INFRAESTRUTURA EXPERIMENTAL]
 * Serviço de persistência multi-driver com suporte a Base64 e UTF-8.
 * Mantido desconectado do fluxo executável da fundação mínima.
 */
export class SaveService {
  public readonly storageKey: string;
  private readonly _driver: IStorageDriver;

  constructor(storageKey: string = 'sombras_brentel_save_foundation', customDriver?: IStorageDriver) {
    this.storageKey = storageKey;
    if (customDriver) {
      this._driver = customDriver;
    } else if (typeof localStorage !== 'undefined') {
      this._driver = localStorage;
    } else {
      this._driver = new MemoryStorageDriver();
    }
  }

  private _encode(data: unknown): string {
    const jsonStr = JSON.stringify(data);
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(jsonStr, 'utf8').toString('base64');
    }
    return btoa(unescape(encodeURIComponent(jsonStr)));
  }

  private _decode<T>(encoded: string): T {
    if (typeof Buffer !== 'undefined') {
      const jsonStr = Buffer.from(encoded, 'base64').toString('utf8');
      return JSON.parse(jsonStr) as T;
    }
    return JSON.parse(decodeURIComponent(escape(atob(encoded)))) as T;
  }

  public save<T>(data: T): boolean {
    try {
      const payload: SavePayload<T> = {
        data,
        savedAt: new Date().toISOString()
      };
      const encoded = this._encode(payload);
      this._driver.setItem(this.storageKey, encoded);
      return true;
    } catch (err) {
      console.error('[SaveService] Falha ao persistir dados:', err);
      return false;
    }
  }

  public load<T>(): SavePayload<T> | null {
    try {
      const raw = this._driver.getItem(this.storageKey);
      if (!raw) return null;
      return this._decode<SavePayload<T>>(raw);
    } catch (err) {
      console.error('[SaveService] Falha ao carregar dados:', err);
      return null;
    }
  }

  public hasSave(): boolean {
    return this._driver.getItem(this.storageKey) !== null;
  }

  public clear(): void {
    this._driver.removeItem(this.storageKey);
  }
}

export const globalSaveService = new SaveService();
