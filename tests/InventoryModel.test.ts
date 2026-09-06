import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { InventoryModel } from '../src/core/InventoryModel';
import { Combatant } from '../src/core/Combatant';

describe('InventoryModel Unit Tests (TypeScript - Experimental)', () => {
  let inventory: InventoryModel;
  let player: Combatant;

  beforeEach(() => {
    inventory = new InventoryModel();
    player = new Combatant({ id: 'player', name: 'Rhogar (Player)', maxHp: 100, hp: 50, resource: 10 });
  });

  it('deve inicializar com saldo de ouro padrão e lista vazia', () => {
    assert.equal(inventory.gold, 50);
    assert.equal(inventory.items.length, 0);
  });

  it('deve adicionar novos itens de teste e acumular quantidades existentes', () => {
    inventory.addItem('test_item_heal', 2);
    assert.equal(inventory.items.length, 1);
    assert.equal(inventory.getItemCount('test_item_heal'), 2);

    inventory.addItem('test_item_heal', 3);
    assert.equal(inventory.items.length, 1);
    assert.equal(inventory.getItemCount('test_item_heal'), 5);
  });

  it('deve remover itens e expurgar do array quando a quantidade chegar a zero', () => {
    inventory.addItem('test_item_heal', 2);
    const removed = inventory.removeItem('test_item_heal', 1);
    assert.equal(removed, true);
    assert.equal(inventory.getItemCount('test_item_heal'), 1);

    const fullyRemoved = inventory.removeItem('test_item_heal', 1);
    assert.equal(fullyRemoved, true);
    assert.equal(inventory.items.length, 0);

    const failed = inventory.removeItem('test_item_heal', 1);
    assert.equal(failed, false);
  });

  it('deve usar TestItem e aplicar cura no combatente alvo', () => {
    inventory.addItem('test_item_heal', 1);
    const used = inventory.useItem('test_item_heal', player);
    assert.equal(used, true);
    assert.equal(player.hp, 90); // 50 + 40 = 90
    assert.equal(inventory.hasItem('test_item_heal'), false);
  });

  it('deve serializar e desserializar o estado de inventário preservando os dados', () => {
    inventory.gold = 250;
    inventory.addItem('test_item_heal', 4);

    const serialized = inventory.serialize();
    assert.equal(serialized.gold, 250);
    assert.equal(serialized.items.length, 1);

    const newInventory = new InventoryModel();
    newInventory.deserialize(serialized);

    assert.equal(newInventory.gold, 250);
    assert.equal(newInventory.getItemCount('test_item_heal'), 4);
  });
});
