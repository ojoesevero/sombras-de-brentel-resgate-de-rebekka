import {
  CombatantConfig,
  CombatantState,
  AttackResult,
  SkillResult,
  PROVISIONAL_BALANCE
} from '../types/game.types';

/**
 * Entidade de domínio puro para participantes de combate.
 * Totalmente desacoplada do Phaser e da camada gráfica.
 * Utiliza valores provisórios de balanceamento (PROVISIONAL_BALANCE).
 */
export class Combatant {
  public readonly id: string;
  public name: string;
  public maxHp: number;
  public hp: number;
  public attack: number;
  public defense: number;
  public resource: number;
  public maxResource: number;
  public readonly isPlayer: boolean;

  constructor(config: CombatantConfig) {
    this.id = config.id || 'combatant';
    this.name = config.name || 'Combatente Provisório';
    this.maxHp = config.maxHp !== undefined ? config.maxHp : PROVISIONAL_BALANCE.BASE_HP;
    this.hp = config.hp !== undefined ? Math.min(config.hp, this.maxHp) : this.maxHp;
    this.attack = config.attack !== undefined ? config.attack : PROVISIONAL_BALANCE.BASE_ATTACK;
    this.defense = config.defense !== undefined ? config.defense : PROVISIONAL_BALANCE.BASE_DEFENSE;
    this.resource = config.resource !== undefined ? config.resource : PROVISIONAL_BALANCE.BASE_RESOURCE;
    this.maxResource = config.maxResource !== undefined ? config.maxResource : PROVISIONAL_BALANCE.MAX_RESOURCE;
    this.isPlayer = Boolean(config.isPlayer);
  }

  public isAlive(): boolean {
    return this.hp > 0;
  }

  /**
   * Cálculo determinístico de mitigação de dano por defesa com variação estatística.
   */
  public static calculateDamage(
    rawAttack: number,
    targetDefense: number = 0,
    variance: number = PROVISIONAL_BALANCE.DAMAGE_VARIANCE
  ): number {
    const baseDamage = Math.max(1, rawAttack - targetDefense);
    const min = Math.floor(baseDamage * (1 - variance));
    const max = Math.ceil(baseDamage * (1 + variance));
    const variation = min === max ? min : Math.floor(Math.random() * (max - min + 1)) + min;
    return Math.max(1, variation);
  }

  public takeDamage(rawDamage: number, defensePenetrationRate: number = 0): number {
    const effectiveDefense = Math.max(0, Math.floor(this.defense * (1 - defensePenetrationRate)));
    const actualDamage = Combatant.calculateDamage(rawDamage, effectiveDefense);
    this.hp = Math.max(0, this.hp - actualDamage);

    if (this.isPlayer && actualDamage > 0) {
      this.gainResource(PROVISIONAL_BALANCE.RESOURCE_GAIN_ON_HIT);
    }

    return actualDamage;
  }

  public gainResource(amount: number): number {
    this.resource = Math.min(this.maxResource, this.resource + amount);
    return this.resource;
  }

  public spendResource(amount: number): boolean {
    if (this.resource < amount) return false;
    this.resource -= amount;
    return true;
  }

  public heal(amount: number): number {
    const previousHp = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - previousHp;
  }

  public basicAttack(target: Combatant): AttackResult {
    const damage = target.takeDamage(this.attack, 0);
    if (this.isPlayer) {
      this.gainResource(PROVISIONAL_BALANCE.RESOURCE_GAIN_ON_ATTACK);
    }
    return {
      damage,
      targetDied: !target.isAlive()
    };
  }

  /**
   * Executa a habilidade técnica provisória (TechnicalSkill).
   * Consome o recurso de teste definido no balanceamento provisório.
   */
  public technicalSkill(target: Combatant): SkillResult {
    if (!this.spendResource(PROVISIONAL_BALANCE.RESOURCE_COST_SKILL)) {
      return {
        success: false,
        damage: 0,
        targetDied: false,
        reason: `Recurso insuficiente (requer ${PROVISIONAL_BALANCE.RESOURCE_COST_SKILL})`
      };
    }

    const enhancedAttack = Math.floor(this.attack * 2.2);
    const damage = target.takeDamage(enhancedAttack, 0.4);

    return {
      success: true,
      damage,
      targetDied: !target.isAlive()
    };
  }

  public getState(): CombatantState {
    return {
      id: this.id,
      name: this.name,
      hp: this.hp,
      maxHp: this.maxHp,
      attack: this.attack,
      defense: this.defense,
      resource: this.resource,
      maxResource: this.maxResource,
      isPlayer: this.isPlayer
    };
  }

  public loadState(state: Partial<CombatantState> | null | undefined): void {
    if (!state) return;
    if (state.name !== undefined) this.name = state.name;
    if (state.maxHp !== undefined) this.maxHp = state.maxHp;
    if (state.hp !== undefined) this.hp = Math.min(state.hp, this.maxHp);
    if (state.attack !== undefined) this.attack = state.attack;
    if (state.defense !== undefined) this.defense = state.defense;
    if (state.resource !== undefined) this.resource = state.resource;
    if (state.maxResource !== undefined) this.maxResource = state.maxResource;
  }
}
