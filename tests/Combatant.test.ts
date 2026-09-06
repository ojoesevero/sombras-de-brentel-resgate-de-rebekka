import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Combatant } from '../src/core/Combatant';
import { PROVISIONAL_BALANCE } from '../src/types/game.types';

describe('Combatant Unit Tests (TypeScript)', () => {
  let player: Combatant;
  let target: Combatant;

  beforeEach(() => {
    player = new Combatant({
      id: 'rhogar_player',
      name: 'Rhogar (Player)',
      maxHp: PROVISIONAL_BALANCE.BASE_HP,
      hp: PROVISIONAL_BALANCE.BASE_HP,
      attack: PROVISIONAL_BALANCE.BASE_ATTACK,
      defense: PROVISIONAL_BALANCE.BASE_DEFENSE,
      resource: 0,
      maxResource: PROVISIONAL_BALANCE.MAX_RESOURCE,
      isPlayer: true
    });

    target = new Combatant({
      id: 'training_target',
      name: 'TrainingTarget',
      maxHp: 40,
      hp: 40,
      attack: 10,
      defense: 2,
      isPlayer: false
    });
  });

  it('deve inicializar combatente com atributos e constantes de balanceamento provisório', () => {
    assert.equal(player.name, 'Rhogar (Player)');
    assert.equal(player.hp, PROVISIONAL_BALANCE.BASE_HP);
    assert.equal(player.resource, 0);
    assert.equal(player.isAlive(), true);
  });

  it('deve calcular dano mitigado por defesa respeitando o valor mínimo de 1', () => {
    const damage = Combatant.calculateDamage(18, 8, 0);
    assert.equal(damage, 10);

    const minDamage = Combatant.calculateDamage(5, 50, 0);
    assert.equal(minDamage, 1);
  });

  it('deve aplicar dano e conceder recurso de teste ao jogador ao ser atingido', () => {
    const damageDealt = player.takeDamage(18);
    assert.ok(damageDealt >= 1);
    assert.equal(player.hp, PROVISIONAL_BALANCE.BASE_HP - damageDealt);
    assert.equal(player.resource, PROVISIONAL_BALANCE.RESOURCE_GAIN_ON_HIT);
  });

  it('deve executar ataque básico, causar dano no alvo e conceder recurso ao jogador', () => {
    const res = player.basicAttack(target);
    assert.ok(res.damage >= 1);
    assert.equal(player.resource, PROVISIONAL_BALANCE.RESOURCE_GAIN_ON_ATTACK);
    assert.equal(target.hp < 40, true);
  });

  it('deve impedir uso de TechnicalSkill se o recurso for inferior ao custo provisório', () => {
    player.resource = 30;
    const res = player.technicalSkill(target);
    assert.equal(res.success, false);
    assert.equal(res.damage, 0);
    assert.equal(player.resource, 30);
  });

  it('deve consumir recurso e aplicar dano potencializado na TechnicalSkill', () => {
    player.resource = 60;
    const res = player.technicalSkill(target);
    assert.equal(res.success, true);
    assert.ok(res.damage > 15);
    assert.equal(player.resource, 60 - PROVISIONAL_BALANCE.RESOURCE_COST_SKILL);
  });

  it('deve curar pontos de vida respeitando o limite máximo (maxHp)', () => {
    player.hp = 80;
    const healed = player.heal(50);
    assert.equal(healed, 40); // 80 + 40 = 120 (maxHp)
    assert.equal(player.hp, PROVISIONAL_BALANCE.BASE_HP);
  });
});
