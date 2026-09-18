import { Combatant } from './Combatant';
import { ComboSkillEngine } from './ComboSkillEngine';
import {
  BattleState,
  BattleStateType,
  TurnAction,
  TurnActionPayload,
  TurnActionResult,
  EnemyActionLog,
  HeroId
} from '../types/game.types';

export interface TurnEngineOptions {
  player?: Combatant;
  party?: Combatant[];
  enemies: Combatant[];
  comboEngine?: ComboSkillEngine;
}

/**
 * [CHRONO TRIGGER & SEA OF STARS ENHANCED]
 * Motor de Combate por Turnos Desacoplado em TypeScript.
 * Suporta party dinâmica de 1 a 6 heróis, combos duplos/triplos e ações sincronizadas.
 */
export class TurnEngine {
  public readonly party: Combatant[];
  public readonly enemies: Combatant[];
  public readonly comboEngine: ComboSkillEngine;
  public state: BattleStateType;
  public turnCount: number;
  public activeHeroIndex: number;
  public readonly log: string[];

  constructor({ player, party, enemies = [], comboEngine }: TurnEngineOptions) {
    if (party && party.length > 0) {
      this.party = party;
    } else if (player) {
      this.party = [player];
    } else {
      throw new Error('TurnEngine requer ao menos um Combatant (player ou party).');
    }

    this.enemies = enemies;
    this.comboEngine = comboEngine || new ComboSkillEngine();
    this.state = BattleState.NOT_STARTED;
    this.turnCount = 0;
    this.activeHeroIndex = 0;
    this.log = [];
  }

  /**
   * Retrocompatibilidade com testes e código legado que acessam `engine.player`.
   */
  public get player(): Combatant {
    return this.party[0];
  }

  public getActiveHero(): Combatant {
    const aliveParty = this.getAliveParty();
    if (aliveParty.length === 0) return this.party[0];
    return this.party[this.activeHeroIndex] || aliveParty[0];
  }

  public getAliveParty(): Combatant[] {
    return this.party.filter(h => h.isAlive());
  }

  public getAliveEnemies(): Combatant[] {
    return this.enemies.filter(e => e.isAlive());
  }

  public start(): BattleStateType {
    this.state = BattleState.PLAYER_TURN;
    this.turnCount = 1;
    this.activeHeroIndex = 0;
    this._log('Combate em campo iniciado. Formação de batalha pronta.');
    return this.state;
  }

  public isBattleOver(): boolean {
    if (this.getAliveParty().length === 0) {
      this.state = BattleState.DEFEAT;
      return true;
    }
    if (this.getAliveEnemies().length === 0) {
      this.state = BattleState.VICTORY;
      return true;
    }
    return false;
  }

  public executePlayerAction(
    action: TurnAction | 'combo',
    payload: TurnActionPayload & { comboId?: string; timedMultiplier?: number } = {}
  ): TurnActionResult {
    if (this.state !== BattleState.PLAYER_TURN) {
      return { success: false, reason: 'Não é o turno do jogador.' };
    }

    const aliveEnemies = this.getAliveEnemies();
    if (aliveEnemies.length === 0) {
      this.state = BattleState.VICTORY;
      return { success: true, battleState: this.state };
    }

    const aliveParty = this.getAliveParty();
    if (aliveParty.length === 0) {
      this.state = BattleState.DEFEAT;
      return { success: false, battleState: this.state, reason: 'Todos os heróis caíram.' };
    }

    const currentHero = this.getActiveHero();
    const targetIndex = payload.targetIndex !== undefined ? payload.targetIndex : 0;
    const target = aliveEnemies[targetIndex] || aliveEnemies[0];
    const timedMultiplier = payload.timedMultiplier || 1.0;

    let result: TurnActionResult = { success: false, action: action as TurnAction, target: target.name };

    switch (action) {
      case 'attack': {
        const baseAttack = currentHero.basicAttack(target);
        const finalDamage = Math.max(1, Math.round(baseAttack.damage * timedMultiplier));
        if (timedMultiplier > 1.0) {
          const extraDamage = finalDamage - baseAttack.damage;
          target.takeDamage(extraDamage);
        }
        this.comboEngine.addSynergy(timedMultiplier > 1.2 ? 20 : 10);
        this._log(`${currentHero.name} atacou ${target.name} causando ${finalDamage} de dano.`);
        result = {
          success: true,
          action: 'attack',
          damage: finalDamage,
          targetDied: !target.isAlive()
        };
        break;
      }

      case 'skill': {
        const skillRes = currentHero.technicalSkill(target);
        if (!skillRes.success) {
          return {
            success: false,
            reason: skillRes.reason || 'Recurso insuficiente para a habilidade.'
          };
        }
        const finalDamage = Math.max(1, Math.round(skillRes.damage * timedMultiplier));
        this.comboEngine.addSynergy(15);
        this._log(`${currentHero.name} usou habilidade em ${target.name} causando ${finalDamage} de dano.`);
        result = {
          success: true,
          action: 'skill',
          damage: finalDamage,
          targetDied: !target.isAlive()
        };
        break;
      }

      case 'combo': {
        if (!payload.comboId) {
          return { success: false, reason: 'Combo não especificado.' };
        }
        const partyIds = this.party.map(h => (h.id === 'player' ? 'rhogar' : h.id) as HeroId);
        const executedCombo = this.comboEngine.consumeSynergyForCombo(payload.comboId, partyIds);
        if (!executedCombo) {
          return { success: false, reason: 'Sinergia insuficiente para o Combo.' };
        }

        const comboBaseDamage = Math.round(
          (currentHero.attack + (this.party[1]?.attack || currentHero.attack * 0.8)) *
          executedCombo.damageMultiplier
        );
        const comboFinalDamage = Math.max(1, Math.round(comboBaseDamage * timedMultiplier));
        target.takeDamage(comboFinalDamage);

        this._log(`COMBO: ${executedCombo.name} causou ${comboFinalDamage} de dano em ${target.name}!`);
        result = {
          success: true,
          action: 'skill',
          damage: comboFinalDamage,
          targetDied: !target.isAlive()
        };
        break;
      }

      case 'defend': {
        currentHero.gainResource(15);
        this._log(`${currentHero.name} assumiu postura defensiva (+15 Recurso).`);
        result = { success: true, action: 'defend', resourceGained: 15 };
        break;
      }

      case 'item': {
        currentHero.heal(40);
        this._log(`${currentHero.name} usou Poção de Cura (+40 HP).`);
        result = { success: true, action: 'item', itemId: payload.itemId || 'test_item_heal' };
        break;
      }

      case 'flee': {
        const canFlee = Math.random() > 0.3;
        if (canFlee) {
          this.state = BattleState.FLED;
          this._log('O grupo recuou taticamente da batalha.');
          return { success: true, action: 'flee', battleState: this.state };
        }
        this._log('Tentativa de recuo falhou!');
        result = { success: false, action: 'flee_failed', reason: 'Fuga bloqueada pelos inimigos!' };
        break;
      }

      default:
        return { success: false, reason: `Ação desconhecida: ${action}` };
    }

    // Verifica vitória imediata
    if (this.isBattleOver()) {
      result.battleState = this.state;
      return result;
    }

    // Avança para o próximo herói da party ou conclui a rodada de heróis
    this._advancePartyTurn();
    result.battleState = this.state;
    return result;
  }

  private _advancePartyTurn(): void {
    let nextIndex = this.activeHeroIndex + 1;

    while (nextIndex < this.party.length) {
      if (this.party[nextIndex].isAlive()) {
        this.activeHeroIndex = nextIndex;
        return;
      }
      nextIndex++;
    }

    // Todos os heróis vivos agiram na rodada -> Turno dos Inimigos
    this.activeHeroIndex = 0;
    this.state = BattleState.ENEMY_TURN;
  }

  public processEnemyTurn(): EnemyActionLog[] {
    if (this.state !== BattleState.ENEMY_TURN) {
      return [];
    }

    const aliveParty = this.getAliveParty();
    const aliveEnemies = this.getAliveEnemies();
    const logs: EnemyActionLog[] = [];

    if (aliveParty.length === 0) {
      this.state = BattleState.DEFEAT;
      return logs;
    }

    aliveEnemies.forEach(enemy => {
      if (!enemy.isAlive()) return;
      const targets = this.getAliveParty();
      if (targets.length === 0) return;

      // Inimigo escolhe um alvo da party
      const target = targets[Math.floor(Math.random() * targets.length)];
      const attackRes = enemy.basicAttack(target);

      logs.push({
        enemyName: enemy.name,
        targetHeroName: target.name,
        damage: attackRes.damage,
        playerHpRemaining: target.hp
      });

      this._log(`${enemy.name} atacou ${target.name} causando ${attackRes.damage} de dano.`);
    });

    if (this.isBattleOver()) {
      return logs;
    }

    // Retorna para o turno dos heróis
    this.state = BattleState.PLAYER_TURN;
    this.activeHeroIndex = 0;
    this.turnCount++;
    this._log(`--- Rodada ${this.turnCount} ---`);
    return logs;
  }

  private _log(msg: string): void {
    this.log.push(msg);
  }
}
