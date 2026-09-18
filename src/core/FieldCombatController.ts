import Phaser from 'phaser';
import gsap from 'gsap';
import { Combatant } from './Combatant';
import { TurnEngine } from './TurnEngine';
import { globalTimedActionService } from '../services/TimedActionService';
import { InventoryModel } from './InventoryModel';
import { BattleState } from '../types/game.types';

export interface FieldEnemyConfig {
  id: string;
  name: string;
  spriteKey: string;
  x: number;
  y: number;
  patrolRadius: number;
  patrolSpeed: number;
  combatants: Combatant[];
  goldReward: number;
  itemReward?: string;
}

export interface FieldHeroConfig {
  combatant: Combatant;
  spriteKey: string;
  formationOffset: { x: number; y: number };
}

/**
 * [CHRONO TRIGGER & SEA OF STARS HYBRID ENGINE]
 * Controlador de Combate Direto no Mapa (Seamless Field Combat).
 * Gerencia monstros patrulhando e engajamento tático sem transição de tela.
 */
export class FieldCombatController {
  private scene: Phaser.Scene;
  private playerSprite: Phaser.Physics.Arcade.Sprite;
  private inventory: InventoryModel;
  private isCombatActive: boolean = false;
  private turnEngine: TurnEngine | null = null;

  // Inimigos em patrulha no mapa
  private enemyConfigs: FieldEnemyConfig[] = [];
  private enemySprites: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
  private activeEngagedEnemy: FieldEnemyConfig | null = null;

  // Aliados da Party em formação de batalha
  private partyConfigs: FieldHeroConfig[] = [];
  private partySprites: Map<string, Phaser.GameObjects.Sprite> = new Map();

  // Interface de Batalha Sobreposta no Mapa
  private hudContainer!: Phaser.GameObjects.Container;
  private turnStatusText!: Phaser.GameObjects.Text;
  private actionButtons: Phaser.GameObjects.Text[] = [];
  private helpText!: Phaser.GameObjects.Text;
  private selectedActionIdx: number = 0;
  private selectedTargetIdx: number = 0;
  private isTargeting: boolean = false;
  private isExecutingTurn: boolean = false;
  private timingIndicatorText!: Phaser.GameObjects.Text;

  private onCombatFinish?: (won: boolean) => void;

  constructor(
    scene: Phaser.Scene,
    playerSprite: Phaser.Physics.Arcade.Sprite,
    inventory: InventoryModel
  ) {
    this.scene = scene;
    this.playerSprite = playerSprite;
    this.inventory = inventory;
    this._createFieldCombatHud();
  }

  public registerPartyMember(hero: FieldHeroConfig): void {
    this.partyConfigs.push(hero);
  }

  public registerPatrolEnemy(config: FieldEnemyConfig): void {
    this.enemyConfigs.push(config);

    const sprite = this.scene.physics.add.sprite(config.x, config.y, config.spriteKey);
    sprite.setCollideWorldBounds(true);
    sprite.setDepth(config.y);
    if (this.scene.textures.exists(config.spriteKey)) {
      sprite.setDisplaySize(24, 28);
    }
    this.enemySprites.set(config.id, sprite);
  }

  public isInCombat(): boolean {
    return this.isCombatActive;
  }

  private _createFieldCombatHud(): void {
    this.hudContainer = this.scene.add.container(240, 236).setDepth(9999).setVisible(false);

    // Fundo semitransparente elegante com borda dourada
    const bg = this.scene.add.rectangle(0, 0, 460, 58, 0x080914, 0.92);
    bg.setStrokeStyle(1.5, 0xcca033);
    this.hudContainer.add(bg);

    this.turnStatusText = this.scene.add.text(0, -18, '', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.hudContainer.add(this.turnStatusText);

    // Botões de Ação
    const labels = ['1. Atacar', '2. Técnica', '3. Combo', '4. Poção', '5. Defender', '6. Fugir'];
    const startX = -200;

    labels.forEach((lbl, i) => {
      const btn = this.scene.add.text(startX + (i % 3) * 110, i < 3 ? -3 : 11, lbl, {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '8px',
        color: '#aaaaaa'
      }).setOrigin(0, 0.5);
      this.actionButtons.push(btn);
      this.hudContainer.add(btn);
    });

    this.helpText = this.scene.add.text(0, 22, '', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '7.5px',
      color: '#88aacc'
    }).setOrigin(0.5);
    this.hudContainer.add(this.helpText);

    // Indicador visual de Ação Sincronizada (Timed Hit)
    this.timingIndicatorText = this.scene.add.text(0, -50, '', {
      fontFamily: '"Cinzel", sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setVisible(false);
    this.hudContainer.add(this.timingIndicatorText);
  }

  public update(time: number, _delta: number): void {
    if (this.isCombatActive) return;

    // Atualiza patrulha dos monstros no mapa e detecta proximidade
    this.enemyConfigs.forEach(cfg => {
      const sprite = this.enemySprites.get(cfg.id);
      if (!sprite || !sprite.active) return;

      // Movimento suave de patrulha
      const patrolOffset = Math.sin(time * 0.001 * cfg.patrolSpeed) * cfg.patrolRadius;
      sprite.setX(cfg.x + patrolOffset);
      sprite.setDepth(sprite.y);

      // Distância até o jogador
      const dist = Phaser.Math.Distance.Between(this.playerSprite.x, this.playerSprite.y, sprite.x, sprite.y);
      if (dist < 32) {
        this.triggerSeamlessCombat(cfg, sprite);
      }
    });
  }

  /**
   * Dispara a batalha no chão do próprio mapa sem transição de tela.
   */
  public triggerSeamlessCombat(cfg: FieldEnemyConfig, enemySprite: Phaser.Physics.Arcade.Sprite, onFinish?: (won: boolean) => void): void {
    if (this.isCombatActive) return;

    this.isCombatActive = true;
    this.activeEngagedEnemy = cfg;
    this.onCombatFinish = onFinish;

    // 1. Congela o movimento do jogador
    this.playerSprite.setVelocity(0, 0);

    // 2. Alerta visual sobre o monstro
    const alert = this.scene.add.text(enemySprite.x, enemySprite.y - 20, '!', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ff2222',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: alert,
      y: enemySprite.y - 28,
      duration: 350,
      yoyo: true,
      onComplete: () => alert.destroy()
    });

    // 3. Spawna os aliados da party ao lado de Rhogar em formação tática
    this.partyConfigs.forEach(hero => {
      if (this.partySprites.has(hero.combatant.id)) return;
      const hx = this.playerSprite.x + hero.formationOffset.x;
      const hy = this.playerSprite.y + hero.formationOffset.y;
      const s = this.scene.add.sprite(hx, hy, hero.spriteKey);
      s.setDisplaySize(20, 24);
      s.setDepth(hy);
      s.setAlpha(0);
      this.scene.tweens.add({ targets: s, alpha: 1, duration: 300 });
      this.partySprites.set(hero.combatant.id, s);
    });

    // 4. Inicializa o motor de turnos com a party
    const activeHeroes = [
      new Combatant({ id: 'rhogar', name: 'Rhogar Tordan', maxHp: 120, hp: 120, attack: 24, defense: 8, isPlayer: true }),
      ...this.partyConfigs.map(p => p.combatant)
    ];

    this.turnEngine = new TurnEngine({
      party: activeHeroes,
      enemies: cfg.combatants
    });

    this.turnEngine.start();
    this.selectedActionIdx = 0;
    this.isTargeting = false;
    this.isExecutingTurn = false;

    // 5. Exibe a interface com efeito suave via GSAP
    this.hudContainer.setVisible(true);
    gsap.fromTo(this.hudContainer, { y: 265, alpha: 0 }, { y: 236, alpha: 1, duration: 0.4, ease: 'power2.out' });

    this._updateVisuals();
  }

  public handleConfirmInput(): void {
    if (!this.isCombatActive || !this.turnEngine || this.isExecutingTurn) return;

    // Se houver uma janela de Timed Action aberta, registra o input do jogador!
    if (globalTimedActionService.hasActiveWindow()) {
      const res = globalTimedActionService.registerInput(performance.now());
      this._flashTimingFeedback(res.rating);
      return;
    }

    if (this.isTargeting) {
      this._executePlayerTurn();
    } else {
      if (this.selectedActionIdx === 0 || this.selectedActionIdx === 1 || this.selectedActionIdx === 2) {
        this.isTargeting = true;
        this.selectedTargetIdx = 0;
        this._updateVisuals();
      } else {
        this._executePlayerTurn();
      }
    }
  }

  public handleNavigate(dirX: number, dirY: number): void {
    if (!this.isCombatActive || this.isExecutingTurn) return;

    if (this.isTargeting && this.turnEngine) {
      const alive = this.turnEngine.getAliveEnemies();
      if (dirX > 0) this.selectedTargetIdx = (this.selectedTargetIdx + 1) % alive.length;
      if (dirX < 0) this.selectedTargetIdx = (this.selectedTargetIdx - 1 + alive.length) % alive.length;
    } else {
      if (dirX > 0) this.selectedActionIdx = (this.selectedActionIdx + 1) % this.actionButtons.length;
      if (dirX < 0) this.selectedActionIdx = (this.selectedActionIdx - 1 + this.actionButtons.length) % this.actionButtons.length;
      if (dirY !== 0) this.selectedActionIdx = (this.selectedActionIdx + 3) % this.actionButtons.length;
    }
    this._updateVisuals();
  }

  private _executePlayerTurn(): void {
    if (!this.turnEngine || this.isExecutingTurn) return;
    this.isExecutingTurn = true;

    const actionMap: ('attack' | 'skill' | 'combo' | 'item' | 'defend' | 'flee')[] = [
      'attack', 'skill', 'combo', 'item', 'defend', 'flee'
    ];
    const chosenAction = actionMap[this.selectedActionIdx];
    const hero = this.turnEngine.getActiveHero();

    // Abre janela de Timed Hit para o ataque do jogador (Sea of Stars Style)
    const now = performance.now();
    const impactExpected = now + 400;
    globalTimedActionService.openWindow(impactExpected, false);

    // Feedback sonoro/visual
    this.timingIndicatorText.setText(`⚡ ${hero.name.toUpperCase()}: PRESSIONE [Z] NO IMPACTO! ⚡`);
    this.timingIndicatorText.setVisible(true);

    this.scene.time.delayedCall(450, () => {
      this.timingIndicatorText.setVisible(false);
      globalTimedActionService.closeWindow();

      const result = this.turnEngine!.executePlayerAction(chosenAction as any, {
        targetIndex: this.selectedTargetIdx,
        comboId: chosenAction === 'combo' ? 'combo_rhogar_joseph' : undefined
      });

      this._showFloatingDamage(result.target || 'Inimigo', result.damage || 0, '#ffff55');

      if (this.turnEngine!.isBattleOver()) {
        this._handleBattleOver();
      } else if (this.turnEngine!.state === BattleState.ENEMY_TURN) {
        this.scene.time.delayedCall(700, () => this._executeEnemyTurn());
      } else {
        this.isExecutingTurn = false;
        this.isTargeting = false;
        this._updateVisuals();
      }
    });
  }

  private _executeEnemyTurn(): void {
    if (!this.turnEngine) return;
    const logs = this.turnEngine.processEnemyTurn();

    logs.forEach((l, idx) => {
      this.scene.time.delayedCall(idx * 600, () => {
        this._showFloatingDamage(l.targetHeroName || 'Rhogar', l.damage, '#ff5555');
      });
    });

    this.scene.time.delayedCall(logs.length * 600 + 400, () => {
      if (this.turnEngine!.isBattleOver()) {
        this._handleBattleOver();
      } else {
        this.isExecutingTurn = false;
        this.isTargeting = false;
        this._updateVisuals();
      }
    });
  }

  private _handleBattleOver(): void {
    if (!this.turnEngine || !this.activeEngagedEnemy) return;

    if (this.turnEngine.state === BattleState.VICTORY) {
      const rewardGold = this.activeEngagedEnemy.goldReward || 25;
      this.inventory.gold += rewardGold;
      if (this.activeEngagedEnemy.itemReward) {
        this.inventory.addItem(this.activeEngagedEnemy.itemReward, 1);
      }

      this.turnStatusText.setText(`VITÓRIA! (+${rewardGold}g Ouro). Retomando jornada...`);
      this.turnStatusText.setColor('#00ff88');

      // Efeito de dissolução suave do sprite do monstro
      const sprite = this.enemySprites.get(this.activeEngagedEnemy.id);
      if (sprite) {
        gsap.to(sprite, {
          alpha: 0,
          scale: 0.2,
          duration: 0.6,
          onComplete: () => sprite.destroy()
        });
      }

      // Conclui e recolhe a party
      this.scene.time.delayedCall(1200, () => {
        this._exitCombat(true);
      });
    } else {
      this.turnStatusText.setText('DERROTA... O grupo recua exausto.');
      this.turnStatusText.setColor('#ff4444');
      this.scene.time.delayedCall(1400, () => this._exitCombat(false));
    }
  }

  private _exitCombat(won: boolean): void {
    this.hudContainer.setVisible(false);
    this.partySprites.forEach(s => s.destroy());
    this.partySprites.clear();
    this.isCombatActive = false;
    this.activeEngagedEnemy = null;
    this.turnEngine = null;

    if (this.onCombatFinish) {
      this.onCombatFinish(won);
    }
  }

  private _flashTimingFeedback(rating: string): void {
    this.timingIndicatorText.setText(rating === 'PERFECT' ? '★ PERFEITO! (+35% DANO) ★' : '✓ BOM! (+15%)');
    this.timingIndicatorText.setColor(rating === 'PERFECT' ? '#00ffff' : '#88ff88');
    this.timingIndicatorText.setVisible(true);
    this.scene.tweens.add({
      targets: this.timingIndicatorText,
      scale: 1.2,
      yoyo: true,
      duration: 200,
      onComplete: () => this.timingIndicatorText.setScale(1)
    });
  }

  private _showFloatingDamage(targetName: string, damage: number, color: string): void {
    const x = targetName.includes('Rhogar') ? this.playerSprite.x : (this.activeEngagedEnemy ? this.activeEngagedEnemy.x : 240);
    const y = targetName.includes('Rhogar') ? this.playerSprite.y - 12 : (this.activeEngagedEnemy ? this.activeEngagedEnemy.y - 14 : 120);

    const txt = this.scene.add.text(x, y, `-${damage}`, {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: txt,
      y: y - 20,
      alpha: 0,
      duration: 800,
      onComplete: () => txt.destroy()
    });
  }

  private _updateVisuals(): void {
    if (!this.turnEngine) return;

    const hero = this.turnEngine.getActiveHero();
    const synergy = this.turnEngine.comboEngine.synergyPoints;
    this.turnStatusText.setText(
      `TURNO: ${hero.name} | Sinergia: ${synergy}/100 | ${this.isTargeting ? 'Selecione o Alvo' : 'Escolha a Ação'}`
    );

    this.actionButtons.forEach((btn, i) => {
      if (i === this.selectedActionIdx && !this.isTargeting) {
        btn.setColor('#00ffff');
        btn.setText('> ' + btn.text.replace('> ', ''));
      } else {
        btn.setColor('#aaaaaa');
        btn.setText(btn.text.replace('> ', ''));
      }
    });

    const descs = [
      'Golpe físico básico direto com sincronização de impacto.',
      'Habilidade de combate com gasto de recurso próprio.',
      `Ataque combinado em dupla (Requer 35 Sinergia | Atual: ${synergy}).`,
      'Restaura 40 HP com poção de cura do inventário.',
      'Postura defensiva para gerar recurso e mitigar dano.',
      'Tentativa de recuo estratégico.'
    ];
    this.helpText.setText(descs[this.selectedActionIdx] || '');
  }
}
