import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ComboSkillEngine } from '../src/core/ComboSkillEngine';

describe('ComboSkillEngine Unit Tests (Chrono Trigger Style)', () => {
  let engine: ComboSkillEngine;

  beforeEach(() => {
    engine = new ComboSkillEngine(20);
  });

  it('deve inicializar com valor de sinergia configurado', () => {
    assert.equal(engine.synergyPoints, 20);
    assert.equal(engine.maxSynergyPoints, 100);
  });

  it('deve acumular pontos de sinergia respeitando o teto máximo', () => {
    engine.addSynergy(50);
    assert.equal(engine.synergyPoints, 70);

    engine.addSynergy(50);
    assert.equal(engine.synergyPoints, 100); // Teto de 100
  });

  it('deve filtrar combos disponíveis com base nos heróis ativos e no saldo de sinergia', () => {
    // Com Rhogar e Joseph e apenas 20 de sinergia, combo_rhogar_joseph custa 35 -> não deve estar disponível
    let available = engine.getAvailableCombos(['rhogar', 'joseph']);
    assert.equal(available.length, 0);

    // Ao atingir 35 de sinergia, combo deve aparecer
    engine.addSynergy(15);
    available = engine.getAvailableCombos(['rhogar', 'joseph']);
    assert.equal(available.length, 1);
    assert.equal(available[0].id, 'combo_rhogar_joseph');

    // Se Joseph não estiver na party ativa, não deve estar disponível mesmo com sinergia
    const withoutJoseph = engine.getAvailableCombos(['rhogar', 'alicia']);
    assert.ok(!withoutJoseph.some(c => c.id === 'combo_rhogar_joseph'));
  });

  it('deve consumir sinergia com sucesso ao executar um combo válido', () => {
    engine.addSynergy(40); // 20 + 40 = 60
    const combo = engine.consumeSynergyForCombo('combo_rhogar_joseph', ['rhogar', 'joseph']);
    assert.ok(combo !== null);
    assert.equal(combo.id, 'combo_rhogar_joseph');
    assert.equal(engine.synergyPoints, 25); // 60 - 35 = 25
  });

  it('deve impedir execução de combo caso falte sinergia', () => {
    const combo = engine.consumeSynergyForCombo('combo_rhogar_joseph', ['rhogar', 'joseph']);
    assert.equal(combo, null);
    assert.equal(engine.synergyPoints, 20);
  });
});
