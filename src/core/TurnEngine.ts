import { Combatant } from './Combatant';
import {
  BattleState,
  BattleStateType,
  TurnAction,
  TurnActionPayload,
  TurnActionResult,
  EnemyActionLog
} from '../types/game.types';

export interface TurnEngineOptions {
  player: Combatant;
  enemies: Combatant[];
}

/**
 * Motor de Combate por Turnos Desacoplado em TypeScript.
 * Controla os turnos do jogador e dos alvos de treinamento sem acoplamento à UI.
 */
export class TurnEngine {
  public readonly player: Combatant;
  public readonly enemies: Combatant[];
  public state: BattleStateType;
  public turnCount: number;
  public readonly log: string[];

  constructor({ player, enemies = [] }: TurnEngineOptions) {
    this.player = player;
    this.enemies = enemies;
    this.state = BattleState.NOT_STARTED;
    this.turnCount = 0;
    this.log = [];
  }

  public start(): BattleStateType {
    this.state = BattleState.PLAYER_TURN;
    this.turnCount = 1;
    this._log('Combate de teste iniciado. Turno do Jogador.');
    return this.state;
  }

  public getAliveEnemies(): Combatant[] {
    return this.enemies.filter(e => e.isAlive());
  }

  public isBattleOver(): boolean {
    if (!this.player.isAlive()) {
      this.state = BattleState.DEFEAT;
      return true;
    }
    if (this.getAliveEnemies().length === 0) {
      this.state = BattleState.VICTORY;
      return true;
    }
    return false;
  }

  public executePlayerAction(action: TurnAction, payload: TurnActionPayload = {}): TurnActionResult {
    if (this.state !== BattleState.PLAYER_TURN) {
      return { success: false, reason: 'Não é o turno do jogador.' };
    }

    const aliveEnemies = this.getAliveEnemies();
    if (aliveEnemies.length === 0) {
      this.state = BattleState.VICTORY;
      return { success: true, battleState: this.state };
    }

    const targetIndex = payload.targetIndex !== undefined ? payload.targetIndex : 0;
    const target = aliveEnemies[targetIndex] || aliveEnemies[0];

    let result: TurnActionResult = { success: false, action, target: target.name };

    switch (action) {
      case 'attack': {
        const attackRes = this.player.basicAttack(target);
        this._log(`${this.player.name} atacou ${target.name} causando ${attackRes.damage} de dano.`);
        result = {
          success: true,
          action: 'attack',
          damage: attackRes.damage,
          targetDied: attackRes.targetDied
        };
        break;
      }

      case 'skill': {
        const skillRes = this.player.technicalSkill(target);
        if (!skillRes.success) {
          return {
            success: false,
            reason: skillRes.reason || 'Recurso insuficiente para TechnicalSkill.'
          };
        }
        this._log(`${this.player.name} executou TechnicalSkill em ${target.name} causando ${skillRes.damage} de dano.`);
        result = {
          success: true,
          action: 'skill',
          damage: skillRes.damage,
          targetDied: skillRes.targetDied
        };
        break;
      }

      case 'defend': {
        this.player.gainResource(15);
        this._log(`${this.player.name} assumiu postura defensiva (+15 TestResource).`);
        result = { success: true, action: 'defend', resourceGained: 15 };
        break;
      }

      case 'flee': {
        this.state = BattleState.FLED;
        this._log(`${this.player.name} recuou do combate de teste.`);
        return { success: true, action: 'flee', battleState: this.state };
      }

      case 'item': {
        const healed = this.player.heal(40);
        this._log(`${this.player.name} utilizou TestItem (+${healed} HP).`);
        result = { success: true, action: 'item', itemId: 'test_item_heal' };
        break;
      }

      default:
        return { success: false, reason: `Ação inválida.` };
    }

    if (this.isBattleOver()) {
      return { ...result, battleState: this.state };
    }

    this.state = BattleState.ENEMY_TURN;
    return { ...result, battleState: this.state };
  }

  public processEnemyTurn(): EnemyActionLog[] {
    if (this.state !== BattleState.ENEMY_TURN) {
      return [];
    }

    const enemyActions: EnemyActionLog[] = [];
    const aliveEnemies = this.getAliveEnemies();

    for (const enemy of aliveEnemies) {
      if (!this.player.isAlive()) break;

      const damage = this.player.takeDamage(enemy.attack, 0);
      this._log(`${enemy.name} atacou ${this.player.name} causando ${damage} de dano.`);

      enemyActions.push({
        enemyName: enemy.name,
        damage,
        playerHpRemaining: this.player.hp
      });
    }

    if (this.isBattleOver()) {
      return enemyActions;
    }

    this.turnCount++;
    this.state = BattleState.PLAYER_TURN;
    return enemyActions;
  }

  private _log(message: string): void {
    this.log.push(`[T${this.turnCount}] ${message}`);
  }
}
