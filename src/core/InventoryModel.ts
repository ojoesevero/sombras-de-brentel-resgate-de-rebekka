import { Combatant } from './Combatant';
import { TestItemDefinition, ItemsDataMap } from '../types/game.types';

export interface InventoryItemRecord extends TestItemDefinition {
  quantity: number;
}

export interface SerializedInventory {
  gold: number;
  items: InventoryItemRecord[];
}

/**
 * [INFRAESTRUTURA EXPERIMENTAL]
 * Modelo de domínio puro para gerenciamento de itens e moedas.
 * Mantido desacoplado do fluxo executável da fundação mínima.
 */
export class InventoryModel {
  public gold: number;
  public items: InventoryItemRecord[];
  public database: ItemsDataMap;

  constructor(initialData?: Partial<SerializedInventory>, database?: ItemsDataMap) {
    this.gold = initialData?.gold !== undefined ? initialData.gold : 50;
    this.items = Array.isArray(initialData?.items) ? JSON.parse(JSON.stringify(initialData.items)) : [];
    this.database = database || {
      test_item_heal: {
        id: 'test_item_heal',
        name: 'TestItem (Heal)',
        type: 'consumable',
        value: 20,
        healHp: 40,
        description: 'Item de teste para recuperação de vida.'
      }
    };
  }

  public addItem(itemId: string, quantity: number = 1): boolean {
    if (quantity <= 0) return false;
    const existing = this.items.find(i => i.id === itemId);
    if (existing) {
      existing.quantity += quantity;
      return true;
    }

    const base = this.database[itemId];
    if (base) {
      this.items.push({ ...base, quantity });
      return true;
    }

    this.items.push({
      id: itemId,
      name: itemId,
      type: 'consumable',
      value: 10,
      quantity,
      description: 'Item genérico provisório'
    });
    return true;
  }

  public removeItem(itemId: string, quantity: number = 1): boolean {
    const existing = this.items.find(i => i.id === itemId);
    if (!existing || existing.quantity < quantity) {
      return false;
    }

    existing.quantity -= quantity;
    if (existing.quantity <= 0) {
      this.items = this.items.filter(i => i.id !== itemId);
    }
    return true;
  }

  public hasItem(itemId: string, quantity: number = 1): boolean {
    const existing = this.items.find(i => i.id === itemId);
    return Boolean(existing && existing.quantity >= quantity);
  }

  public getItemCount(itemId: string): number {
    const existing = this.items.find(i => i.id === itemId);
    return existing ? existing.quantity : 0;
  }

  public useItem(itemId: string, target: Combatant): boolean {
    if (!this.hasItem(itemId, 1)) return false;

    const base = this.database[itemId] || this.items.find(i => i.id === itemId);
    if (!base) return false;

    if (this.removeItem(itemId, 1)) {
      if (base.healHp) {
        target.heal(base.healHp);
      }
      if (base.addResource) {
        target.gainResource(base.addResource);
      }
      return true;
    }
    return false;
  }

  public serialize(): SerializedInventory {
    return {
      gold: this.gold,
      items: JSON.parse(JSON.stringify(this.items))
    };
  }

  public deserialize(data: Partial<SerializedInventory> | null | undefined): void {
    if (!data) return;
    this.gold = data.gold !== undefined ? data.gold : 50;
    this.items = Array.isArray(data.items) ? JSON.parse(JSON.stringify(data.items)) : [];
  }

  public reset(): void {
    this.gold = 50;
    this.items = [];
  }
}
