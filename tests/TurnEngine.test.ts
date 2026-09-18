import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Combatant } from '../src/core/Combatant';
import { TurnEngine } from '../src/core/TurnEngine';
import { BattleState } from '../src/types/game.types';

describe('TurnEngine Unit Tests (TypeScript)', () => {
  let player: Combatant;
  let targetA: Combatant;
  let targetB: Combatant;
  let engine: TurnEngine;

  beforeEach(() => {
    player = new Combatant({
      id: 'player',
      name: 'Rhogar (Player)',
      maxHp: 100,
      hp: 100,
      attack: 20,
      defense: 5,
      resource: 60,
      isPlayer: true
    });
    targetA = new Combatant({ id: 'target_a', name: 'TrainingTarget A', maxHp: 30, hp: 30, attack: 10, defense: 2 });
    targetB = new Combatant({ id: 'target_b', name: 'TrainingTarget B', maxHp: 30, hp: 30, attack: 10, defense: 2 });

    engine = new TurnEngine({
      player,
      enemies: [targetA, targetB]
    });
  });

  it('deve iniciar a batalha no estado PLAYER_TURN', () => {
    assert.equal(engine.state, BattleState.NOT_STARTED);
    const state = engine.start();
    assert.equal(state, BattleState.PLAYER_TURN);
    assert.equal(engine.state, BattleState.PLAYER_TURN);
  });

  it('deve processar ataque básico do jogador e transitar para ENEMY_TURN', () => {
    engine.start();
    const result = engine.executePlayerAction('attack', { targetIndex: 0 });
    assert.equal(result.success, true);
    assert.equal(result.action, 'attack');
    assert.equal(engine.state, BattleState.ENEMY_TURN);
    assert.ok(targetA.hp < 30);
  });

  it('deve processar TechnicalSkill com consumo de recurso e causar dano potencializado', () => {
    engine.start();
    const result = engine.executePlayerAction('skill', { targetIndex: 0 });
    assert.equal(result.success, true);
    assert.equal(result.action, 'skill');
    assert.ok((result.damage || 0) > 20);
    assert.equal(player.resource, 10); // 60 - 50 = 10
  });

  it('deve processar o turno dos alvos de treinamento e retornar o controle para PLAYER_TURN', () => {
    engine.start();
    engine.executePlayerAction('attack', { targetIndex: 0 });
    assert.equal(engine.state, BattleState.ENEMY_TURN);

    const enemyActions = engine.processEnemyTurn();
    assert.equal(enemyActions.length, 2);
    assert.equal(engine.state, BattleState.PLAYER_TURN);
    assert.ok(player.hp < 100);
  });

  it('deve declarar vitória quando todos os alvos forem neutralizados', () => {
    engine.start();
    targetA.hp = 0;
    targetB.hp = 5;

    const result = engine.executePlayerAction('attack', { targetIndex: 0 });
    assert.equal(result.battleState, BattleState.VICTORY);
    assert.equal(engine.state, BattleState.VICTORY);
  });

  it('deve declarar derrota quando a vida do jogador zerar', () => {
    engine.start();
    player.hp = 2;
    engine.state = BattleState.ENEMY_TURN;

    engine.processEnemyTurn();
    assert.equal(player.isAlive(), false);
    assert.equal(engine.state, BattleState.DEFEAT);
  });

  it('deve alternar turnos entre múltiplos heróis da party antes do turno dos inimigos', () => {
    const joseph = new Combatant({
      id: 'joseph',
      name: 'Joseph Sylven',
      maxHp: 110,
      hp: 110,
      attack: 18,
      defense: 10,
      isPlayer: true
    });

    const partyEngine = new TurnEngine({
      party: [player, joseph],
      enemies: [targetA, targetB]
    });

    partyEngine.start();
    assert.equal(partyEngine.activeHeroIndex, 0); // Rhogar
    assert.equal(partyEngine.getActiveHero().name, 'Rhogar (Player)');

    // Rhogar ataca
    const res1 = partyEngine.executePlayerAction('attack', { targetIndex: 0 });
    assert.equal(res1.success, true);
    assert.equal(partyEngine.state, BattleState.PLAYER_TURN);
    assert.equal(partyEngine.activeHeroIndex, 1); // Agora é o Joseph!
    assert.equal(partyEngine.getActiveHero().name, 'Joseph Sylven');

    // Joseph ataca -> Agora sim todos agiram e vai para ENEMY_TURN
    const res2 = partyEngine.executePlayerAction('attack', { targetIndex: 0 });
    assert.equal(res2.success, true);
    assert.equal(partyEngine.state, BattleState.ENEMY_TURN);
  });

  it('deve executar combo com sucesso consumindo sinergia e aplicando dano elevado', () => {
    const joseph = new Combatant({
      id: 'joseph',
      name: 'Joseph Sylven',
      maxHp: 110,
      hp: 110,
      attack: 18,
      defense: 10,
      isPlayer: true
    });

    const partyEngine = new TurnEngine({
      party: [player, joseph],
      enemies: [targetA]
    });

    partyEngine.start();
    partyEngine.comboEngine.addSynergy(50); // Garante sinergia

    const initialEnemyHp = targetA.hp;
    const result = partyEngine.executePlayerAction('combo', {
      comboId: 'combo_rhogar_joseph',
      targetIndex: 0
    });

    assert.equal(result.success, true);
    assert.ok((result.damage || 0) > 40);
    assert.ok(targetA.hp < initialEnemyHp);
  });
});
