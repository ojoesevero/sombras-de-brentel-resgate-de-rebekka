import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { TimedActionService } from '../src/services/TimedActionService';

describe('TimedActionService Unit Tests (Sea of Stars Style)', () => {
  let service: TimedActionService;

  beforeEach(() => {
    service = new TimedActionService();
  });

  it('deve registrar acerto PERFECT quando pressionado dentro da tolerância perfeita', () => {
    const impactTime = 1000;
    service.openWindow(impactTime, false, 95, 220);

    // Pressiona 30ms antes do impacto
    const result = service.registerInput(970);
    assert.equal(result.rating, 'PERFECT');
    assert.equal(result.multiplier, 1.35);
    assert.equal(result.bonusSynergy, 25);
  });

  it('deve registrar acerto GOOD quando pressionado fora da tolerância perfeita mas dentro da boa', () => {
    const impactTime = 1000;
    service.openWindow(impactTime, false, 95, 220);

    // Pressiona 150ms após o impacto
    const result = service.registerInput(1150);
    assert.equal(result.rating, 'GOOD');
    assert.equal(result.multiplier, 1.15);
    assert.equal(result.bonusSynergy, 10);
  });

  it('deve registrar MISS quando pressionado muito longe do impacto', () => {
    const impactTime = 1000;
    service.openWindow(impactTime, false, 95, 220);

    // Pressiona 300ms antes
    const result = service.registerInput(700);
    assert.equal(result.rating, 'MISS');
    assert.equal(result.multiplier, 1.0);
    assert.equal(result.bonusSynergy, 0);
  });

  it('deve aplicar redução de dano correta em janelas de defesa (TIMED BLOCK)', () => {
    const impactTime = 2000;
    service.openWindow(impactTime, true, 95, 220);

    // Bloqueio perfeito: 40% de redução (multiplicador 0.6)
    const result = service.registerInput(2020);
    assert.equal(result.rating, 'PERFECT');
    assert.equal(result.multiplier, 0.6);
  });

  it('não deve aceitar múltiplos inputs na mesma janela', () => {
    service.openWindow(1000, false);
    const first = service.registerInput(1000);
    assert.equal(first.rating, 'PERFECT');

    const second = service.registerInput(1000);
    assert.equal(second.rating, 'MISS');
  });
});
