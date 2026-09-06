import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SaveService, MemoryStorageDriver } from '../src/services/SaveService';

describe('SaveService Unit Tests (TypeScript - Experimental)', () => {
  let saveService: SaveService;
  let driver: MemoryStorageDriver;

  beforeEach(() => {
    driver = new MemoryStorageDriver();
    saveService = new SaveService('test_foundation_key', driver);
  });

  it('deve salvar e carregar dados estruturados com suporte a UTF-8 e acentuação', () => {
    const payload = {
      player: {
        name: 'Rhogar (Player)',
        hp: 120,
        resource: 50
      },
      currentScene: 'TechnicalSandboxScene'
    };

    const saved = saveService.save(payload);
    assert.equal(saved, true);
    assert.equal(saveService.hasSave(), true);

    const loaded = saveService.load<typeof payload>();
    assert.ok(loaded);
    assert.equal(loaded.data.player.name, 'Rhogar (Player)');
    assert.equal(loaded.data.currentScene, 'TechnicalSandboxScene');
    assert.ok(loaded.savedAt);
  });

  it('deve retornar null ao carregar quando nenhum save existe', () => {
    saveService.clear();
    assert.equal(saveService.hasSave(), false);
    assert.equal(saveService.load(), null);
  });

  it('deve limpar dados salvos corretamente ao chamar clear()', () => {
    saveService.save({ active: true });
    assert.equal(saveService.hasSave(), true);

    saveService.clear();
    assert.equal(saveService.hasSave(), false);
    assert.equal(saveService.load(), null);
  });
});
