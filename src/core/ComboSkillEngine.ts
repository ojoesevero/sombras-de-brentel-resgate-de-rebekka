import { ComboTechDefinition, HeroId } from '../types/game.types';

export const HERO_PROFILES = {
  rhogar: {
    id: 'rhogar' as HeroId,
    name: 'Rhogar Tordan',
    role: 'Guerreiro Draconato',
    portraitKey: 'portrait_rhogar',
    spriteKey: 'spr_rhogar_front',
    accentColor: '#e06666',
    baseStats: { maxHp: 120, attack: 24, defense: 8, maxResource: 60, resourceName: 'Fúria' }
  },
  joseph: {
    id: 'joseph' as HeroId,
    name: 'Joseph Sylven',
    role: 'Paladino Protetor',
    portraitKey: 'portrait_joseph',
    spriteKey: 'spr_joseph_sylven_front',
    accentColor: '#ffd966',
    baseStats: { maxHp: 110, attack: 18, defense: 10, maxResource: 50, resourceName: 'Fé' }
  },
  alicia: {
    id: 'alicia' as HeroId,
    name: 'Alicia Lavdik',
    role: 'Maga Arcana',
    portraitKey: 'portrait_alicia',
    spriteKey: 'spr_alicia_lavdik_front',
    accentColor: '#9fc5e8',
    baseStats: { maxHp: 75, attack: 28, defense: 4, maxResource: 80, resourceName: 'Mana' }
  },
  traudon: {
    id: 'traudon' as HeroId,
    name: 'Traudon Balker',
    role: 'Guarda Mercenário',
    portraitKey: 'portrait_traudon',
    spriteKey: 'spr_traudon_balker_front',
    accentColor: '#b6d7a8',
    baseStats: { maxHp: 130, attack: 20, defense: 12, maxResource: 50, resourceName: 'Vigor' }
  },
  veronica: {
    id: 'veronica' as HeroId,
    name: 'Veronica Stinfy',
    role: 'Ladina Astuta',
    portraitKey: 'portrait_veronica',
    spriteKey: 'spr_veronica_stinfy_front',
    accentColor: '#d5a6bd',
    baseStats: { maxHp: 85, attack: 22, defense: 6, maxResource: 70, resourceName: 'Energia' }
  },
  john: {
    id: 'john' as HeroId,
    name: 'John Bardem',
    role: 'Bardo Encantador',
    portraitKey: 'portrait_john',
    spriteKey: 'spr_john_bardem_front',
    accentColor: '#c27ba0',
    baseStats: { maxHp: 90, attack: 16, defense: 6, maxResource: 65, resourceName: 'Inspiração' }
  }
} as const;

export const COMBO_TECHS: ComboTechDefinition[] = [
  {
    id: 'combo_rhogar_joseph',
    name: 'Lâmina Sagrada do Dragão',
    description: 'Rhogar e Joseph unem força bruta draconiana e justiça divina em um corte fulminante.',
    requiredHeroIds: ['rhogar', 'joseph'],
    synergyCost: 35,
    damageMultiplier: 2.4,
    element: 'holy',
    animationKey: 'anim_combo_holy_dragon'
  },
  {
    id: 'combo_rhogar_alicia',
    name: 'Erupção Dracônica',
    description: 'Alicia canaliza fogo arcano sobre a maça de guerra de Rhogar, gerando explosão vulcânica.',
    requiredHeroIds: ['rhogar', 'alicia'],
    synergyCost: 40,
    damageMultiplier: 2.8,
    element: 'fire',
    animationKey: 'anim_combo_fire_eruption'
  },
  {
    id: 'combo_joseph_traudon',
    name: 'Bastião Inquebrável',
    description: 'Joseph e Traudon cruzam seus escudos erguendo uma barreira de luz protetora.',
    requiredHeroIds: ['joseph', 'traudon'],
    synergyCost: 25,
    damageMultiplier: 1.0,
    element: 'support',
    animationKey: 'anim_combo_bastion'
  }
];

/**
 * [CHRONO TRIGGER STYLE]
 * Motor de Gerenciamento de Combos e Barra de Sinergia.
 */
export class ComboSkillEngine {
  public synergyPoints: number = 0;
  public maxSynergyPoints: number = 100;

  constructor(initialSynergy: number = 20) {
    this.synergyPoints = initialSynergy;
  }

  public addSynergy(points: number): void {
    this.synergyPoints = Math.min(this.maxSynergyPoints, this.synergyPoints + points);
  }

  public getAvailableCombos(activePartyIds: HeroId[]): ComboTechDefinition[] {
    return COMBO_TECHS.filter(combo => {
      const hasMembers = combo.requiredHeroIds.every(id => activePartyIds.includes(id));
      const hasSynergy = this.synergyPoints >= combo.synergyCost;
      return hasMembers && hasSynergy;
    });
  }

  public canExecute(comboId: string, activePartyIds: HeroId[]): boolean {
    const combo = COMBO_TECHS.find(c => c.id === comboId);
    if (!combo) return false;
    const hasMembers = combo.requiredHeroIds.every(id => activePartyIds.includes(id));
    return hasMembers && this.synergyPoints >= combo.synergyCost;
  }

  public consumeSynergyForCombo(comboId: string, activePartyIds: HeroId[]): ComboTechDefinition | null {
    if (!this.canExecute(comboId, activePartyIds)) {
      return null;
    }
    const combo = COMBO_TECHS.find(c => c.id === comboId)!;
    this.synergyPoints -= combo.synergyCost;
    return combo;
  }
}
